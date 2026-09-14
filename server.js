const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const { spawn } = require("node:child_process");

const ROOT = __dirname;
const rootLower = ROOT.toLowerCase();
const programFilesRoots = [process.env.ProgramFiles, process.env["ProgramFiles(x86)"]]
  .filter(Boolean)
  .map((folder) => path.resolve(folder).toLowerCase());
const isInstalledInProgramFiles = process.platform === "win32" && programFilesRoots.some((folder) => rootLower.startsWith(folder));
const USER_DATA_ROOT = process.env.NOMADIC_ERP_DATA_DIR
  || (isInstalledInProgramFiles && process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "NomadicERP") : ROOT);
const DATA_DIR = path.join(USER_DATA_ROOT, "data");
const BACKUP_DIR = path.join(USER_DATA_ROOT, "backups");
const REPORTS_DIR = path.join(USER_DATA_ROOT, "reports");
const DB_PATH = path.join(DATA_DIR, "nomadic_erp.sqlite");
const PORT = Number(process.env.CIVIL_ERP_PORT || 4855);
const HOST = "127.0.0.1";
const MANAGED_LIFETIME = process.argv.includes("--managed-lifetime");
let lastHeartbeatAt = Date.now();

const collections = [
  "projects",
  "bills",
  "clientPayments",
  "purchases",
  "grns",
  "issues",
  "inventory",
  "expenses",
  "subcontractors",
  "boqs",
  "workOrders",
  "subcontractorBills",
  "contractorBills",
  "contractorPayments",
  "assets",
  "documents",
  "activities",
  "masterClients",
  "masterVendors",
  "masterContractors",
  "masterMaterials",
  "masterUnits",
  "masterCostHeads",
  "masterAssetCategories",
  "settings"
];

const defaultCompanySettings = {
  companyName: "NomadicERP",
  companyGstin: "",
  companyAddress: "",
  companyPhone: "",
  companyEmail: "",
  preparedBy: ""
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(BACKUP_DIR, { recursive: true });
fs.mkdirSync(REPORTS_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS records (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (collection, id)
  );
`);

const upsertRecord = db.prepare(`
  INSERT INTO records (collection, id, payload, updated_at)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(collection, id)
  DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
`);
const deleteRecord = db.prepare("DELETE FROM records WHERE collection = ? AND id = ?");
const readRecords = db.prepare("SELECT payload FROM records WHERE collection = ? ORDER BY updated_at DESC");
const clearRecords = db.prepare("DELETE FROM records");

function blankData() {
  return Object.fromEntries(collections.map((name) => [name, []]));
}

function readAllData() {
  const data = blankData();
  for (const collection of collections) {
    data[collection] = readRecords.all(collection).map((row) => JSON.parse(row.payload));
  }
  return data;
}

function writeAllData(data) {
  db.exec("BEGIN");
  try {
    clearRecords.run();
    const now = new Date().toISOString();
    for (const collection of collections) {
      for (const record of data[collection] || []) {
        if (!record.id) continue;
        upsertRecord.run(collection, record.id, JSON.stringify(record), now);
      }
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function num(value) {
  return Number(value || 0);
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(num(value));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function projectName(data, id) {
  if (!id) return "Unassigned";
  const project = data.projects.find((item) => item.id === id);
  return project ? `${project.code} - ${project.name}` : "Unknown project";
}

function projectCosts(data, projectId) {
  return data.expenses
    .filter((item) => item.projectId === projectId)
    .reduce((sum, item) => sum + num(item.amount), 0);
}

function billOutstanding(bill) {
  const payable = bill.netPayable !== undefined && bill.netPayable !== "" ? num(bill.netPayable) : num(bill.amount) + num(bill.gst) - num(bill.tds) - num(bill.retention);
  return payable - num(bill.received);
}

function clientBillThisAmount(item) {
  if (Array.isArray(item.items) && item.items.length) return item.items.reduce((sum, row) => sum + num(row.thisBillAmount), 0);
  return num(item.amount);
}

function clientBillGross(item) {
  return item.grossBillValue === undefined || item.grossBillValue === "" ? clientBillThisAmount(item) + num(item.gst) : num(item.grossBillValue);
}

function clientBillNet(item) {
  return item.netPayable === undefined || item.netPayable === "" ? clientBillGross(item) - num(item.tds) - num(item.retention) : num(item.netPayable);
}

function stockBalance(item) {
  return num(item.opening) + num(item.received) - num(item.issued);
}

function subcontractorBalance(item) {
  return num(item.billed) - num(item.paid) - num(item.retention);
}

function costHeadSummaryRows(data) {
  const groups = new Map();
  data.expenses.forEach((expense) => {
    const key = `${expense.projectId || "all"}|${expense.head || "Unassigned"}`;
    if (!groups.has(key)) {
      groups.set(key, {
        project: projectName(data, expense.projectId),
        head: expense.head || "Unassigned",
        amount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        count: 0
      });
    }
    const row = groups.get(key);
    row.amount += num(expense.amount);
    if (expense.status === "Paid") row.paidAmount += num(expense.amount);
    else row.pendingAmount += num(expense.amount);
    row.count += 1;
  });
  return Array.from(groups.values()).sort((a, b) => a.project.localeCompare(b.project) || a.head.localeCompare(b.head));
}

function contractorBillNet(item) {
  if (item.netPayable !== undefined && item.netPayable !== "") return num(item.netPayable);
  return contractorBillGross(item) - contractorBillDeductions(item);
}

function contractorBillOutstanding(item) {
  return contractorBillNet(item) - num(item.paid) - num(item.tdsDeducted) - num(item.retentionDeducted);
}

function contractorBillGross(item) {
  return item.grossBillValue === undefined || item.grossBillValue === ""
    ? num(item.workDone) + num(item.extraClaims) + num(item.creditNote) - num(item.debitNote)
    : num(item.grossBillValue);
}

function contractorBillDeductions(item) {
  return num(item.retention) + num(item.tds) + num(item.securityDeposit);
}

function workOrderAmount(item) {
  const items = workOrderItems(item);
  if (items.length) return items.reduce((sum, row) => sum + num(row.amount || num(row.quantity) * num(row.rate)), 0);
  return item.amount === undefined || item.amount === "" ? num(item.quantity) * num(item.rate) : num(item.amount);
}

function workOrderItems(record = null) {
  if (Array.isArray(record?.items) && record.items.length) {
    return record.items.map((item, index) => ({
      siNo: item.siNo || String(index + 1),
      description: item.description || "",
      unit: item.unit || "",
      quantity: item.quantity ?? "",
      rate: item.rate ?? "",
      amount: item.amount ?? num(item.quantity) * num(item.rate)
    }));
  }
  if (record?.description || record?.quantity || record?.rate) {
    return [{
      siNo: record.siNo || "1",
      description: record.description || "",
      unit: record.unit || "",
      quantity: record.quantity ?? "",
      rate: record.rate ?? "",
      amount: record.amount === undefined || record.amount === "" ? num(record.quantity) * num(record.rate) : num(record.amount)
    }];
  }
  return [];
}

function workOrderCgst(item) {
  const rate = item.cgstRate === undefined || item.cgstRate === "" ? 9 : num(item.cgstRate);
  return item.cgst === undefined || item.cgst === "" ? workOrderAmount(item) * rate / 100 : num(item.cgst);
}

function workOrderSgst(item) {
  const rate = item.sgstRate === undefined || item.sgstRate === "" ? 9 : num(item.sgstRate);
  return item.sgst === undefined || item.sgst === "" ? workOrderAmount(item) * rate / 100 : num(item.sgst);
}

function workOrderGst(item) {
  if (item.cgst !== undefined || item.sgst !== undefined || item.cgstRate !== undefined || item.sgstRate !== undefined) {
    return workOrderCgst(item) + workOrderSgst(item);
  }
  const rate = item.gstRate === undefined || item.gstRate === "" ? 18 : num(item.gstRate);
  return item.gst === undefined || item.gst === "" ? workOrderAmount(item) * rate / 100 : num(item.gst);
}

function workOrderTotalValue(item) {
  return item.totalWorkOrderValue === undefined || item.totalWorkOrderValue === "" ? workOrderAmount(item) + workOrderGst(item) : num(item.totalWorkOrderValue);
}

function workOrderTds(item) {
  const rate = item.tdsRate === undefined || item.tdsRate === "" ? 1 : num(item.tdsRate);
  return workOrderTotalValue(item) * rate / 100;
}

function workOrderRetention(item) {
  const rate = item.retentionRate === undefined || item.retentionRate === "" ? 5 : num(item.retentionRate);
  return workOrderTotalValue(item) * rate / 100;
}

function workOrderNet(item) {
  return workOrderTotalValue(item) - workOrderTds(item) - workOrderRetention(item);
}

function subcontractorBillItems(record = null) {
  if (Array.isArray(record?.items) && record.items.length) return record.items;
  return [];
}

function subcontractorBillThisAmount(item) {
  return subcontractorBillItems(item).reduce((sum, row) => sum + num(row.thisBillAmount || num(row.thisBillQty) * num(row.woRate)), 0);
}

function subcontractorBillGross(item) {
  return num(item.grossBillValue || subcontractorBillThisAmount(item) + num(item.gst));
}

function subcontractorBillNet(item) {
  return num(item.netPayable || subcontractorBillGross(item) - num(item.tds) - num(item.retention));
}

function subcontractorBillOutstanding(item) {
  return subcontractorBillNet(item) - num(item.paid) - num(item.tdsDeducted) - num(item.retentionDeducted);
}

function projectClientCredit(data, projectId) {
  return data.bills
    .filter((bill) => bill.projectId === projectId)
    .reduce((sum, bill) => sum + clientBillThisAmount(bill), 0);
}

function projectSubcontractorDebit(data, projectId) {
  return data.subcontractorBills
    .filter((bill) => bill.projectId === projectId)
    .reduce((sum, bill) => sum + subcontractorBillThisAmount(bill), 0);
}

function projectProfit(data, projectId) {
  return projectClientCredit(data, projectId) - projectSubcontractorDebit(data, projectId);
}

function reportDefinitions(data) {
  return {
    project_summary: {
      title: "Project Summary",
      file: "project-summary",
      columns: [
        ["Project Code", "code"],
        ["Project Name", "name"],
        ["Client", "client"],
        ["Location", "location"],
        ["Project Manager", "manager"],
        ["Contract Value", (item) => num(item.contractValue)],
        ["Budget", (item) => num(item.budget)],
        ["Actual Cost", (item) => projectCosts(data, item.id)],
        ["Budget Balance", (item) => num(item.budget) - projectCosts(data, item.id)],
        ["Work Completion %", (item) => num(item.progress)]
      ],
      rows: () => data.projects
    },
    profit_loss: {
      title: "Project-wise Profit & Loss",
      file: "project-wise-profit-loss",
      columns: [
        ["Project Code", "code"],
        ["Project Name", "name"],
        ["Contract Value", (item) => num(item.contractValue)],
        ["Client Bill Credit", (item) => projectClientCredit(data, item.id)],
        ["Subcontractor Debit", (item) => projectSubcontractorDebit(data, item.id)],
        ["Estimated Profit / Loss", (item) => projectProfit(data, item.id)],
        ["Budget Utilized %", (item) => num(item.budget) ? projectSubcontractorDebit(data, item.id) / num(item.budget) : 0],
        ["Work Completion %", (item) => num(item.progress)]
      ],
      rows: () => data.projects
    },
    client_outstanding: {
      title: "Client Outstanding",
      file: "client-outstanding",
      columns: [
        ["Project", (item) => projectName(data, item.projectId)],
        ["Bill No", "billNo"],
        ["Bill Type", "billType"],
        ["This Bill Amount", (item) => clientBillThisAmount(item)],
        ["GST", (item) => num(item.gst)],
        ["Gross Bill Value", (item) => clientBillGross(item)],
        ["TDS", (item) => num(item.tds)],
        ["Retention", (item) => num(item.retention)],
        ["Net Payable", (item) => clientBillNet(item)],
        ["Received", (item) => num(item.received)],
        ["Outstanding", (item) => billOutstanding(item)],
        ["Submission Date", "submittedOn"],
        ["Due Date", "dueDate"],
        ["Status", "status"]
      ],
      rows: () => data.bills.filter((item) => billOutstanding(item) > 0)
    },
    client_payment_register: {
      title: "Client Payment Register",
      file: "client-payment-register",
      columns: [
        ["Payment Date", "paymentDate"],
        ["Receipt No", "receiptNo"],
        ["Project", (item) => projectName(data, item.projectId)],
        ["Bill No", "billNo"],
        ["Amount Received", (item) => num(item.amountReceived)],
        ["TDS Deducted", (item) => num(item.tdsDeducted)],
        ["Retention Deducted / Released", (item) => num(item.retentionDeducted)],
        ["Payment Mode", "paymentMode"],
        ["Bank / Cheque Reference", "referenceNo"],
        ["Remarks", "remarks"]
      ],
      rows: () => data.clientPayments
    },
    procurement_summary: {
      title: "Procurement Summary",
      file: "procurement-summary",
      columns: [
        ["Project", (item) => projectName(data, item.projectId)],
        ["PO / Indent No", "poNo"],
        ["Material", "material"],
        ["Vendor", "vendor"],
        ["Quantity", (item) => num(item.quantity)],
        ["Unit", "unit"],
        ["Amount", (item) => num(item.amount)],
        ["Order Date", "orderDate"],
        ["Delivery Date", "deliveryDate"],
        ["Status", "status"]
      ],
      rows: () => data.purchases
    },
    grn_register: {
      title: "GRN Register",
      file: "grn-register",
      columns: [
        ["GRN No", "grnNo"],
        ["Project", (item) => projectName(data, item.projectId)],
        ["PO No", "poNo"],
        ["Vendor", "vendor"],
        ["Material", "material"],
        ["Category", "category"],
        ["Unit", "unit"],
        ["Quantity Received", (item) => num(item.quantity)],
        ["Supplier Invoice No", "invoiceNo"],
        ["Vehicle Number", "vehicleNo"],
        ["Received Date", "receivedDate"],
        ["Quality Status", "qualityStatus"],
        ["Remarks", "remarks"]
      ],
      rows: () => data.grns
    },
    material_issue_register: {
      title: "Material Issue Register",
      file: "material-issue-register",
      columns: [
        ["Issue Slip No", "issueNo"],
        ["Project", (item) => projectName(data, item.projectId)],
        ["Material", "material"],
        ["Category", "category"],
        ["Unit", "unit"],
        ["Quantity Issued", (item) => num(item.quantity)],
        ["Issued To", "issuedTo"],
        ["Department / Site", "department"],
        ["Issue Date", "issueDate"],
        ["Returnable", "returnable"],
        ["Purpose", "purpose"],
        ["Remarks", "remarks"]
      ],
      rows: () => data.issues
    },
    inventory_stock: {
      title: "Current Stock",
      file: "current-stock",
      columns: [
        ["Project", (item) => projectName(data, item.projectId)],
        ["Item", "item"],
        ["Category", "category"],
        ["Unit", "unit"],
        ["Opening Stock", (item) => num(item.opening)],
        ["Received", (item) => num(item.received)],
        ["Issued", (item) => num(item.issued)],
        ["Balance", (item) => stockBalance(item)],
        ["Minimum Stock", (item) => num(item.minimum)],
        ["Stock Status", (item) => stockBalance(item) <= num(item.minimum) ? "Low Stock" : "Available"]
      ],
      rows: () => data.inventory
    },
    material_consumption: {
      title: "Material Consumption",
      file: "material-consumption",
      columns: [
        ["Project", (item) => projectName(data, item.projectId)],
        ["Item", "item"],
        ["Category", "category"],
        ["Unit", "unit"],
        ["Quantity Issued", (item) => num(item.issued)],
        ["Balance Stock", (item) => stockBalance(item)],
        ["Last Transaction", "lastTxn"],
        ["Notes", "notes"]
      ],
      rows: () => data.inventory.filter((item) => num(item.issued) > 0)
    },
    expense_register: {
      title: "Expense Register",
      file: "expense-register",
      columns: [
        ["Date", "date"],
        ["Project", (item) => projectName(data, item.projectId)],
        ["Cost Head", "head"],
        ["Description", "description"],
        ["Vendor / Paid To", (item) => item.vendor || item.paidTo || ""],
        ["Bill / Voucher No", "billNo"],
        ["Amount", (item) => num(item.amount)],
        ["Payment Date", "paymentDate"],
        ["Payment Mode", "paymentMode"],
        ["Payment Reference", "referenceNo"],
        ["Status", "status"]
      ],
      rows: () => data.expenses
    },
    cost_head_summary: {
      title: "Cost Head Summary",
      file: "cost-head-summary",
      columns: [
        ["Project", "project"],
        ["Cost Head", "head"],
        ["Total Amount", "amount"],
        ["Paid Amount", "paidAmount"],
        ["Pending Amount", "pendingAmount"],
        ["Entry Count", "count"]
      ],
      rows: () => costHeadSummaryRows(data)
    },
    contractor_outstanding: {
      title: "Subcontractor Outstanding",
      file: "contractor-outstanding",
      columns: [
        ["Project", (item) => projectName(data, item.projectId)],
        ["Subcontractor", "name"],
        ["Work Order", "workOrder"],
        ["Scope", "scope"],
        ["Agreement Value", (item) => num(item.agreementValue)],
        ["Work Done Value", (item) => num(item.workDone)],
        ["Billed Amount", (item) => num(item.billed)],
        ["Paid Amount", (item) => num(item.paid)],
        ["Retention", (item) => num(item.retention)],
        ["Outstanding", (item) => subcontractorBalance(item)],
        ["Status", "status"]
      ],
      rows: () => data.subcontractors.filter((item) => subcontractorBalance(item) !== 0)
    },
    subcontractor_bill_register: {
      title: "Subcontractor Bill Register",
      file: "subcontractor-bill-register",
      columns: [
        ["RA Bill No", "raBillNo"],
        ["RA Bill Date", "raBillDate"],
        ["Project", (item) => projectName(data, item.projectId)],
        ["Subcontractor", "subcontractor"],
        ["Work Order", "workOrderNo"],
        ["This Bill Amount", (item) => subcontractorBillThisAmount(item)],
        ["GST", (item) => num(item.gst)],
        ["Gross Bill Value", (item) => subcontractorBillGross(item)],
        ["TDS", (item) => num(item.tds)],
        ["Retention", (item) => num(item.retention)],
        ["Net Payable", (item) => subcontractorBillNet(item)],
        ["Paid", (item) => num(item.paid)],
        ["TDS Deducted", (item) => num(item.tdsDeducted)],
        ["Retention Deducted", (item) => num(item.retentionDeducted)],
        ["Outstanding", (item) => subcontractorBillOutstanding(item)],
        ["Status", "status"],
        ["Remarks", "remarks"]
      ],
      rows: () => data.subcontractorBills
    },
    boq_register: {
      title: "BOQ Register",
      file: "boq-register",
      columns: [
        ["BOQ No", "boqNo"],
        ["BOQ Date", "boqDate"],
        ["Project", (item) => projectName(data, item.projectId)],
        ["Client", "client"],
        ["SI No", "siNo"],
        ["Description of Work", "description"],
        ["Unit", "unit"],
        ["Qty", (item) => num(item.quantity)],
        ["Rate", (item) => num(item.rate)],
        ["Amount", (item) => workOrderAmount(item)],
        ["CGST %", (item) => item.cgstRate === undefined || item.cgstRate === "" ? 9 : num(item.cgstRate)],
        ["CGST Amount", (item) => workOrderCgst(item)],
        ["SGST %", (item) => item.sgstRate === undefined || item.sgstRate === "" ? 9 : num(item.sgstRate)],
        ["SGST Amount", (item) => workOrderSgst(item)],
        ["Total GST Amount", (item) => workOrderGst(item)],
        ["Gross BOQ Value", (item) => workOrderTotalValue(item)],
        ["TDS %", (item) => item.tdsRate === undefined || item.tdsRate === "" ? 1 : num(item.tdsRate)],
        ["TDS Amount", (item) => workOrderTds(item)],
        ["Retention %", (item) => item.retentionRate === undefined || item.retentionRate === "" ? 5 : num(item.retentionRate)],
        ["Retention Amount", (item) => workOrderRetention(item)],
        ["Net BOQ Value", (item) => workOrderNet(item)],
        ["Status", "status"],
        ["Remarks", "remarks"]
      ],
      rows: () => data.boqs
    },
    work_order_register: {
      title: "Work Order Register",
      file: "work-order-register",
      columns: [
        ["Work Order No", "workOrderNo"],
        ["Work Order Date", "orderDate"],
        ["Project", (item) => projectName(data, item.projectId)],
        ["Subcontractor", "subcontractor"],
        ["SI No", "siNo"],
        ["Description of Work", "description"],
        ["Unit", "unit"],
        ["Qty", (item) => num(item.quantity)],
        ["Rate", (item) => num(item.rate)],
        ["Amount", (item) => workOrderAmount(item)],
        ["CGST %", (item) => item.cgstRate === undefined || item.cgstRate === "" ? 9 : num(item.cgstRate)],
        ["CGST Amount", (item) => workOrderCgst(item)],
        ["SGST %", (item) => item.sgstRate === undefined || item.sgstRate === "" ? 9 : num(item.sgstRate)],
        ["SGST Amount", (item) => workOrderSgst(item)],
        ["Total GST Amount", (item) => workOrderGst(item)],
        ["Gross Work Order Value", (item) => workOrderTotalValue(item)],
        ["TDS %", (item) => item.tdsRate === undefined || item.tdsRate === "" ? 1 : num(item.tdsRate)],
        ["TDS Amount", (item) => workOrderTds(item)],
        ["Retention %", (item) => item.retentionRate === undefined || item.retentionRate === "" ? 5 : num(item.retentionRate)],
        ["Retention Amount", (item) => workOrderRetention(item)],
        ["Net Payable", (item) => workOrderNet(item)],
        ["Status", "status"],
        ["Remarks", "remarks"]
      ],
      rows: () => data.workOrders
    },
    contractor_payment_register: {
      title: "Subcontractor Payment Register",
      file: "subcontractor-payment-register",
      columns: [
        ["Payment Date", "paymentDate"],
        ["Payment Voucher No", "paymentNo"],
        ["Project", (item) => projectName(data, item.projectId)],
        ["Subcontractor", "contractor"],
        ["RA Bill No", "billNo"],
        ["Amount Paid", (item) => num(item.amountPaid)],
        ["TDS Deducted", (item) => num(item.tdsDeducted)],
        ["Retention Deducted / Released", (item) => num(item.retentionDeducted)],
        ["Payment Mode", "paymentMode"],
        ["Bank / Cheque Reference", "referenceNo"],
        ["Remarks", "remarks"]
      ],
      rows: () => data.contractorPayments
    },
    asset_register: {
      title: "Asset Register",
      file: "asset-register",
      columns: [
        ["Asset Code", "assetCode"],
        ["Asset Name", "name"],
        ["Category", "category"],
        ["Allocated Project", (item) => projectName(data, item.projectId)],
        ["Purchase Value", (item) => num(item.purchaseValue)],
        ["Operator", "operator"],
        ["Maintenance Due", "maintenanceDue"],
        ["Warranty End", "warrantyEnd"],
        ["Status", "status"]
      ],
      rows: () => data.assets
    }
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function csvValue(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function reportRows(definition, rows) {
  return rows.map((record) => Object.fromEntries(definition.columns.map(([label, key]) => [label, typeof key === "function" ? key(record) : record[key] || ""])));
}

function companySettings(data) {
  return { ...defaultCompanySettings, ...(data.settings?.[0] || {}) };
}

function csvReport(title, rows, company) {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const lines = [
    [company.companyName || "NomadicERP"],
    [company.companyAddress || ""],
    [`GSTIN: ${company.companyGstin || ""}`],
    [title],
    [`Generated On: ${new Date().toLocaleString("en-IN")}`],
    [`Prepared By: ${company.preparedBy || ""}`],
    [`Records: ${rows.length}`],
    [],
    headers
  ];
  rows.forEach((row) => lines.push(headers.map((header) => row[header])));
  return "\ufeff" + lines.map((line) => line.map(csvValue).join(",")).join("\r\n");
}

function excelReport(title, rows, company) {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const generated = new Date().toLocaleString("en-IN");
  const bodyRows = rows.map((row) => `
    <tr>${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join("")}</tr>
  `).join("");
  return `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Calibri, Arial, sans-serif; color: #14202e; }
          h1 { font-size: 20pt; margin: 10px 0 4px; color: #176b87; }
          h2 { font-size: 15pt; margin: 0 0 4px; color: #14202e; }
          .meta { color: #657286; margin-bottom: 14px; }
          .company { border-bottom: 3px solid #176b87; margin-bottom: 12px; padding-bottom: 10px; }
          .company div { color: #405166; }
          .report-meta td { border: 1px solid #dce4ee; padding: 7px 10px; background: #f5f7fb; font-weight: bold; }
          table { border-collapse: collapse; width: 100%; }
          th { background: #176b87; color: #ffffff; font-weight: bold; border: 1px solid #176b87; padding: 8px; }
          td { border: 1px solid #dce4ee; padding: 7px; }
          tr:nth-child(even) td { background: #f5f7fb; }
          .totals td { background: #eef3f8; font-weight: bold; }
          .signatures td { border: 0; padding-top: 34px; color: #405166; }
        </style>
      </head>
      <body>
        <div class="company">
          <h2>${escapeHtml(company.companyName || "NomadicERP")}</h2>
          <div>${escapeHtml(company.companyAddress || "")}</div>
          <div>GSTIN: ${escapeHtml(company.companyGstin || "")}</div>
          <div>Phone: ${escapeHtml(company.companyPhone || "")} | Email: ${escapeHtml(company.companyEmail || "")}</div>
        </div>
        <h1>${escapeHtml(title)}</h1>
        <table class="report-meta">
          <tr>
            <td>Generated On</td><td>${escapeHtml(generated)}</td>
            <td>Prepared By</td><td>${escapeHtml(company.preparedBy || "")}</td>
            <td>Records</td><td>${rows.length}</td>
          </tr>
        </table>
        <div class="meta"></div>
        <table>
          <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
          <tbody>${bodyRows || `<tr><td colspan="${Math.max(1, headers.length)}">No records available</td></tr>`}${totalRow(headers, rows)}</tbody>
        </table>
        <table class="signatures">
          <tr>
            <td>Prepared by</td>
            <td>Checked by</td>
            <td>Approved by</td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function totalRow(headers, rows) {
  if (!rows.length) return "";
  const numericTotals = headers.map((header) => {
    if (!isTotalColumn(header)) return "";
    const values = rows.map((row) => row[header]);
    const numericValues = values.filter((value) => typeof value === "number" || (String(value).trim() !== "" && !Number.isNaN(Number(value))));
    if (!numericValues.length || numericValues.length !== values.filter((value) => value !== "" && value !== null && value !== undefined).length) return "";
    return numericValues.reduce((sum, value) => sum + Number(value || 0), 0);
  });
  if (!numericTotals.some((value) => value !== "")) return "";
  return `<tr class="totals">${headers.map((header, index) => `<td>${index === 0 ? "Total" : numericTotals[index] !== "" ? escapeHtml(numericTotals[index].toLocaleString("en-IN", { maximumFractionDigits: 2 })) : ""}</td>`).join("")}</tr>`;
}

function isTotalColumn(header) {
  return /(amount|value|cost|budget|received|outstanding|stock|paid|tds|retention|quantity|balance|payable|claims|debit|credit|security|count)/i.test(header)
    && !/%|rate|code|number|no$/i.test(header);
}

function createReport({ reportType, projectId, format }) {
  const data = readAllData();
  const definitions = reportDefinitions(data);
  const definition = definitions[reportType] || definitions.project_summary;
  const sourceRows = definition.rows().filter((item) => projectId === "all" || !projectId || item.id === projectId || item.projectId === projectId);
  const rows = reportRows(definition, sourceRows);
  const company = companySettings(data);
  const extension = format === "csv" ? "csv" : "xls";
  const fileName = `${definition.file}-${todayISO()}-${Date.now()}.${extension}`;
  const reportPath = path.join(REPORTS_DIR, fileName);
  const content = extension === "csv" ? csvReport(definition.title, rows, company) : excelReport(definition.title, rows, company);
  fs.writeFileSync(reportPath, content, "utf8");
  return { path: reportPath, fileName, title: definition.title, records: rows.length };
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 25_000_000) {
        reject(new Error("Request too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function openManagedFolder(folder) {
  const folders = {
    reports: REPORTS_DIR,
    backups: BACKUP_DIR
  };
  const target = folders[folder];
  if (!target) throw new Error("Folder is not available");
  fs.mkdirSync(target, { recursive: true });

  if (process.platform === "win32") {
    spawn("explorer.exe", [target], { detached: true, stdio: "ignore" }).unref();
  } else if (process.platform === "darwin") {
    spawn("open", [target], { detached: true, stdio: "ignore" }).unref();
  } else {
    spawn("xdg-open", [target], { detached: true, stdio: "ignore" }).unref();
  }
  return target;
}

async function handleApi(req, res, pathname) {
  try {
    if (req.method === "GET" && pathname === "/api/data") {
      sendJson(res, 200, { ok: true, data: readAllData(), database: DB_PATH });
      return;
    }

    if (req.method === "PUT" && pathname === "/api/data") {
      const body = await readBody(req);
      writeAllData(JSON.parse(body || "{}"));
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && pathname === "/api/backup") {
      const fileName = `nomadic-erp-backup-${new Date().toISOString().slice(0, 10)}-${Date.now()}.json`;
      const backupPath = path.join(BACKUP_DIR, fileName);
      fs.writeFileSync(backupPath, JSON.stringify(readAllData(), null, 2));
      sendJson(res, 200, { ok: true, path: backupPath, fileName });
      return;
    }

    if (req.method === "POST" && pathname === "/api/report") {
      const body = await readBody(req);
      sendJson(res, 200, { ok: true, report: createReport(JSON.parse(body || "{}")) });
      return;
    }

    if (req.method === "POST" && pathname === "/api/open-folder") {
      const body = await readBody(req);
      const { folder } = JSON.parse(body || "{}");
      sendJson(res, 200, { ok: true, path: openManagedFolder(folder) });
      return;
    }

    if (req.method === "POST" && pathname === "/api/heartbeat") {
      lastHeartbeatAt = Date.now();
      sendJson(res, 200, { ok: true });
      return;
    }

    sendJson(res, 404, { ok: false, error: "API route not found" });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
}

function serveFile(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(ROOT, safePath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    });
    res.end(content);
  });
}

function openAppUrl(url) {
  if (process.platform === "win32") {
    const edgePaths = [
      process.env.ProgramFiles ? path.join(process.env.ProgramFiles, "Microsoft", "Edge", "Application", "msedge.exe") : "",
      process.env["ProgramFiles(x86)"] ? path.join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : ""
    ].filter(Boolean);
    const edgePath = edgePaths.find((candidate) => fs.existsSync(candidate));
    if (edgePath) {
      spawn(edgePath, [url], { detached: true, stdio: "ignore" }).unref();
      return;
    }
    spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
    return;
  }
  const opener = process.platform === "darwin" ? "open" : "xdg-open";
  spawn(opener, [url], { detached: true, stdio: "ignore" }).unref();
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  if (url.pathname.startsWith("/api/")) {
    handleApi(req, res, url.pathname);
    return;
  }
  serveFile(req, res, decodeURIComponent(url.pathname));
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.log(`NomadicERP is running at ${url}`);
  console.log(`Database: ${DB_PATH}`);
  if (process.argv.includes("--open")) {
    openAppUrl(url);
  }
});

if (MANAGED_LIFETIME) {
  setInterval(() => {
    if (Date.now() - lastHeartbeatAt < 30000) return;
    console.log("NomadicERP browser window was closed. Stopping local server.");
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  }, 5000).unref();
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    const url = `http://${HOST}:${PORT}`;
    console.log(`NomadicERP is already running at ${url}`);
    if (process.argv.includes("--open")) {
      openAppUrl(url);
    }
    setTimeout(() => process.exit(0), 500);
    return;
  }
  throw error;
});
