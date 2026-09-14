const STORAGE_KEY = "nomadic_erp_local_v1";
const API_ENABLED = location.protocol === "http:" || location.protocol === "https:";

const blankData = {
  projects: [],
  bills: [],
  clientPayments: [],
  purchases: [],
  grns: [],
  issues: [],
  inventory: [],
  expenses: [],
  subcontractors: [],
  boqs: [],
  workOrders: [],
  subcontractorBills: [],
  contractorBills: [],
  contractorPayments: [],
  assets: [],
  documents: [],
  activities: [],
  masterClients: [],
  masterVendors: [],
  masterContractors: [],
  masterMaterials: [],
  masterUnits: [],
  masterCostHeads: [],
  masterAssetCategories: [],
  settings: []
};

const defaultCompanySettings = {
  companyName: "NomadicERP",
  companyGstin: "",
  companyAddress: "",
  companyPhone: "",
  companyEmail: "",
  preparedBy: ""
};

const forms = {
  project: {
    title: "Add project",
    collection: "projects",
    fields: [
      ["code", "Project Code", "text", true],
      ["name", "Project Name", "text", true],
      ["client", "Client", "master:masterClients:name", true],
      ["location", "Location", "text", false],
      ["manager", "Project Manager", "text", false],
      ["contractValue", "Contract Value", "number", true],
      ["budget", "Budget Allocation", "number", true],
      ["startDate", "Start Date", "date", false],
      ["endDate", "End Date", "date", false],
      ["progress", "Work Completion %", "number", false]
    ]
  },
  bill: {
    title: "Add client bill",
    collection: "bills",
    fields: [
      ["projectId", "Project", "project", true],
      ["billNo", "Bill / RA Number", "text", true],
      ["billType", "Bill Type", "select:RA Bill|IPC Billing|Tax Invoice", false],
      ["items", "Items", "items", false],
      ["amount", "This Bill Amount", "readonlyNumber", false],
      ["previousAmount", "Previous Amount", "readonlyNumber", false],
      ["cumulativeAmount", "Cumulative Amount", "readonlyNumber", false],
      ["cgstRate", "CGST %", "number", false],
      ["cgst", "CGST Amount", "readonlyNumber", false],
      ["sgstRate", "SGST %", "number", false],
      ["sgst", "SGST Amount", "readonlyNumber", false],
      ["gst", "GST Amount", "readonlyNumber", false],
      ["grossBillValue", "Gross Bill Value", "readonlyNumber", false],
      ["tdsRate", "TDS %", "number", false],
      ["tds", "TDS", "readonlyNumber", false],
      ["retentionRate", "Retention %", "number", false],
      ["retention", "Retention", "readonlyNumber", false],
      ["netPayable", "Net Payable", "readonlyNumber", false],
      ["received", "Payment Received", "number", false],
      ["submittedOn", "Submission Date", "date", false],
      ["dueDate", "Payment Due Date", "date", false],
      ["status", "Approval Status", "select:Draft|Submitted|Certified|Approved|Paid|Rejected", false]
    ]
  },
  clientPayment: {
    title: "Add client payment",
    collection: "clientPayments",
    fields: [
      ["projectId", "Project", "project", true],
      ["receiptNo", "Receipt Number", "text", true],
      ["billNo", "Bill Number", "bill", true],
      ["paymentDate", "Payment Date", "date", true],
      ["amountReceived", "Amount Received", "number", true],
      ["tdsDeducted", "TDS Deducted", "number", false],
      ["retentionDeducted", "Retention Deducted / Released", "number", false],
      ["paymentMode", "Payment Mode", "select:Bank Transfer|Cheque|Cash|UPI|RTGS|NEFT|Other", false],
      ["referenceNo", "Bank / Cheque Reference", "text", false],
      ["remarks", "Remarks", "textarea", false]
    ]
  },
  purchase: {
    title: "Add purchase",
    collection: "purchases",
    fields: [
      ["projectId", "Project", "project", true],
      ["poNo", "PO / Indent Number", "text", true],
      ["material", "Material", "master:masterMaterials:name", true],
      ["vendor", "Vendor", "master:masterVendors:name", true],
      ["quantity", "Quantity", "number", false],
      ["unit", "Unit", "text", false],
      ["amount", "PO Amount", "number", true],
      ["orderDate", "Order Date", "date", false],
      ["deliveryDate", "Delivery Date", "date", false],
      ["status", "Status", "select:Indent|RFQ|Comparison|Approval Pending|Ordered|Part Delivered|Delivered|Closed", false]
    ]
  },
  grn: {
    title: "Add GRN",
    collection: "grns",
    fields: [
      ["projectId", "Project", "project", true],
      ["grnNo", "GRN Number", "text", true],
      ["poNo", "PO Number", "text", false],
      ["vendor", "Vendor", "master:masterVendors:name", false],
      ["material", "Material", "master:masterMaterials:name", true],
      ["category", "Category", "master:masterMaterials:category", false],
      ["unit", "Unit", "text", false],
      ["invoiceNo", "Supplier Invoice No", "text", false],
      ["vehicleNo", "Vehicle Number", "text", false],
      ["quantity", "Quantity Received", "number", true],
      ["receivedDate", "Received Date", "date", true],
      ["qualityStatus", "Quality Status", "select:Accepted|Accepted with Remarks|Rejected|Pending Inspection", false],
      ["remarks", "Remarks", "textarea", false]
    ]
  },
  issue: {
    title: "Add material issue",
    collection: "issues",
    fields: [
      ["projectId", "Project", "project", true],
      ["issueNo", "Issue Slip Number", "text", true],
      ["material", "Material", "master:masterMaterials:name", true],
      ["category", "Category", "master:masterMaterials:category", false],
      ["unit", "Unit", "text", false],
      ["issuedTo", "Issued To", "master:masterContractors:name", false],
      ["department", "Department / Site", "text", false],
      ["quantity", "Quantity Issued", "number", true],
      ["issueDate", "Issue Date", "date", true],
      ["returnable", "Returnable", "select:No|Yes", false],
      ["purpose", "Purpose", "text", false],
      ["remarks", "Remarks", "textarea", false]
    ]
  },
  inventory: {
    title: "Add material",
    collection: "inventory",
    fields: [
      ["projectId", "Project", "project", true],
      ["item", "Material / Item", "master:masterMaterials:name", true],
      ["category", "Category", "master:masterMaterials:category", false],
      ["unit", "Unit", "text", false],
      ["opening", "Opening Stock", "number", false],
      ["received", "Quantity Received", "number", false],
      ["issued", "Quantity Issued", "number", false],
      ["minimum", "Minimum Stock", "number", false],
      ["lastTxn", "Last Transaction Date", "date", false],
      ["notes", "Notes", "textarea", false]
    ]
  },
  expense: {
    title: "Add expense",
    collection: "expenses",
    fields: [
      ["projectId", "Project", "project", true],
      ["date", "Date", "date", true],
      ["head", "Cost Head", "master:masterCostHeads:name|Material Cost|Labour Cost|Machinery Cost|Equipment Rental|Fuel|Transportation|Administrative Expenses|Site Overheads|Miscellaneous", true],
      ["description", "Description", "text", false],
      ["vendor", "Vendor / Paid To", "master:masterVendors:name", false],
      ["billNo", "Bill / Voucher No", "text", false],
      ["paymentDate", "Payment Date", "date", false],
      ["paymentMode", "Payment Mode", "select:Pending|Bank Transfer|Cheque|Cash|UPI|RTGS|NEFT|Other", false],
      ["referenceNo", "Payment Reference", "text", false],
      ["amount", "Amount", "number", true],
      ["status", "Status", "select:Pending|Approved|Paid|Rejected", false]
    ]
  },
  subcontractor: {
    title: "Add subcontractor project details",
    collection: "subcontractors",
    fields: [
      ["projectId", "Project", "project", true],
      ["name", "Contractor Name", "master:masterContractors:name", true],
      ["workOrder", "Work Order", "text", false],
      ["scope", "Scope of Work", "text", false],
      ["agreementValue", "Agreement Value", "number", true],
      ["workDone", "Work Done Value", "number", false],
      ["billed", "Billed Amount", "number", false],
      ["paid", "Paid Amount", "number", false],
      ["retention", "Retention", "number", false],
      ["status", "Status", "select:Active|Bill Pending|Payment Pending|Final Bill|Closed", false]
    ]
  },
  boq: {
    title: "Add BOQ",
    collection: "boqs",
    fields: [
      ["projectId", "Project", "project", true],
      ["boqNo", "BOQ No", "text", true],
      ["client", "Client", "master:masterClients:name", true],
      ["boqDate", "BOQ Date", "date", true],
      ["items", "Items", "items", false],
      ["amount", "Amount (Qty x Rate)", "readonlyNumber", false],
      ["cgstRate", "CGST %", "number", false],
      ["cgst", "CGST Amount", "readonlyNumber", false],
      ["sgstRate", "SGST %", "number", false],
      ["sgst", "SGST Amount", "readonlyNumber", false],
      ["gstApplicable", "GST Applicable", "checkbox", false],
      ["gstRate", "GST %", "number", false],
      ["gst", "GST Amount", "readonlyNumber", false],
      ["totalWorkOrderValue", "Total BOQ Value", "readonlyNumber", false],
      ["tdsRate", "TDS %", "number", false],
      ["tds", "TDS Amount", "readonlyNumber", false],
      ["retentionRate", "Retention %", "number", false],
      ["retention", "Retention Amount", "readonlyNumber", false],
      ["netAmount", "Net BOQ Value", "readonlyNumber", false],
      ["status", "Status", "select:Draft|Approved|Issued|Closed|Cancelled", false],
      ["gstNote", "GST Note", "text", false],
      ["remarks", "Remarks", "textarea", false]
    ]
  },
  workOrder: {
    title: "Add work order",
    collection: "workOrders",
    fields: [
      ["projectId", "Project", "project", true],
      ["workOrderNo", "Work Order No", "text", true],
      ["subcontractor", "Subcontractor", "master:masterContractors:name", true],
      ["orderDate", "Work Order Date", "date", true],
      ["items", "Items", "items", false],
      ["amount", "Amount (Qty x Rate)", "readonlyNumber", false],
      ["cgstRate", "CGST %", "number", false],
      ["cgst", "CGST Amount", "readonlyNumber", false],
      ["sgstRate", "SGST %", "number", false],
      ["sgst", "SGST Amount", "readonlyNumber", false],
      ["gstApplicable", "GST Applicable", "checkbox", false],
      ["gstRate", "GST %", "number", false],
      ["gst", "GST Amount", "readonlyNumber", false],
      ["totalWorkOrderValue", "Total Work Order Value", "readonlyNumber", false],
      ["tdsRate", "TDS %", "number", false],
      ["tds", "TDS Amount", "readonlyNumber", false],
      ["retentionRate", "Retention %", "number", false],
      ["retention", "Retention Amount", "readonlyNumber", false],
      ["netAmount", "Net Payable", "readonlyNumber", false],
      ["status", "Status", "select:Draft|Issued|Accepted|Closed|Cancelled", false],
      ["gstNote", "GST Note", "text", false],
      ["remarks", "Remarks", "textarea", false]
    ]
  },
  subcontractorBill: {
    title: "Add subcontractor bill",
    collection: "subcontractorBills",
    fields: [
      ["projectId", "Project", "project", true],
      ["subcontractor", "Subcontractor", "master:masterContractors:name", true],
      ["workOrderNo", "Work Order No", "text", true],
      ["raBillNo", "RA Bill No", "text", true],
      ["raBillDate", "RA Bill Date", "date", true],
      ["items", "Items", "items", false],
      ["amount", "This Bill Amount", "readonlyNumber", false],
      ["previousAmount", "Previous Amount", "readonlyNumber", false],
      ["cumulativeAmount", "Cumulative Amount", "readonlyNumber", false],
      ["cgst", "CGST", "readonlyNumber", false],
      ["sgst", "SGST", "readonlyNumber", false],
      ["gst", "GST", "readonlyNumber", false],
      ["grossBillValue", "Gross Bill Value", "readonlyNumber", false],
      ["tds", "TDS", "readonlyNumber", false],
      ["retention", "Retention", "readonlyNumber", false],
      ["netPayable", "Net Payable", "readonlyNumber", false],
      ["status", "Status", "select:Draft|Approved|Issued|Closed|Suspended", false],
      ["remarks", "Remarks", "textarea", false]
    ]
  },
  contractorPayment: {
    title: "Add subcontractor payment",
    collection: "contractorPayments",
    fields: [
      ["projectId", "Project", "project", true],
      ["contractor", "Subcontractor", "master:masterContractors:name", true],
      ["paymentNo", "Payment Voucher No", "text", true],
      ["billNo", "Subcontractor RA Bill Number", "subcontractorBill", true],
      ["paymentDate", "Payment Date", "date", true],
      ["amountPaid", "Amount Paid", "number", true],
      ["tdsDeducted", "TDS Deducted", "number", false],
      ["retentionDeducted", "Retention Deducted / Released", "number", false],
      ["paymentMode", "Payment Mode", "select:Bank Transfer|Cheque|Cash|UPI|RTGS|NEFT|Other", false],
      ["referenceNo", "Bank / Cheque Reference", "text", false],
      ["remarks", "Remarks", "textarea", false]
    ]
  },
  asset: {
    title: "Add asset",
    collection: "assets",
    fields: [
      ["projectId", "Allocated Project", "project", false],
      ["assetCode", "Asset Code", "text", true],
      ["name", "Asset Name", "text", true],
      ["category", "Category", "master:masterAssetCategories:name", false],
      ["purchaseValue", "Purchase Value", "number", false],
      ["operator", "Operator", "text", false],
      ["maintenanceDue", "Maintenance Due", "date", false],
      ["warrantyEnd", "Warranty End", "date", false],
      ["status", "Status", "select:Available|Allocated|Under Maintenance|Breakdown|Scrapped", false]
    ]
  },
  document: {
    title: "Add document",
    collection: "documents",
    fields: [
      ["projectId", "Project", "project", false],
      ["type", "Document Type", "select:Work Order|Drawing|BOQ|Contract|Purchase Order|Client Bill|Contractor Bill|Test Certificate|Asset Document|Other", true],
      ["title", "Title", "text", true],
      ["reference", "Reference Number / Link", "text", false],
      ["owner", "Owner", "text", false],
      ["date", "Document Date", "date", false],
      ["notes", "Notes", "textarea", false]
    ]
  },
  activity: {
    title: "Add site activity",
    collection: "activities",
    fields: [
      ["projectId", "Project", "project", true],
      ["date", "Date", "date", true],
      ["activity", "Activity", "text", true],
      ["labour", "Labour Count", "number", false],
      ["remarks", "Remarks", "textarea", false]
    ]
  },
  masterClient: {
    title: "Add client master",
    collection: "masterClients",
    fields: [
      ["name", "Client Name", "text", true],
      ["contactPerson", "Contact Person", "text", false],
      ["phone", "Phone", "text", false],
      ["email", "Email", "email", false],
      ["gstin", "GSTIN", "text", false],
      ["address", "Address", "textarea", false]
    ]
  },
  masterVendor: {
    title: "Add vendor master",
    collection: "masterVendors",
    fields: [
      ["name", "Vendor Name", "text", true],
      ["category", "Material Category", "text", false],
      ["contactPerson", "Contact Person", "text", false],
      ["phone", "Phone", "text", false],
      ["gstin", "GSTIN", "text", false],
      ["paymentTerms", "Payment Terms", "text", false]
    ]
  },
  masterContractor: {
    title: "Add contractor master",
    collection: "masterContractors",
    fields: [
      ["name", "Contractor Name", "text", true],
      ["trade", "Trade / Work Type", "text", false],
      ["contactPerson", "Contact Person", "text", false],
      ["phone", "Phone", "text", false],
      ["gstin", "GSTIN", "text", false],
      ["status", "Status", "select:Active|Inactive|Blacklisted", false]
    ]
  },
  masterMaterial: {
    title: "Add material master",
    collection: "masterMaterials",
    fields: [
      ["code", "Material Code", "text", false],
      ["name", "Material Name", "text", true],
      ["category", "Category", "text", false],
      ["unit", "Default Unit", "text", false],
      ["gstRate", "GST Rate %", "number", false],
      ["minimumStock", "Default Minimum Stock", "number", false]
    ]
  },
  masterCostHead: {
    title: "Add cost head master",
    collection: "masterCostHeads",
    fields: [
      ["name", "Cost Head", "text", true],
      ["group", "Group", "select:Material|Labour|Machinery|Fuel|Transportation|Overhead|Admin|Miscellaneous", false],
      ["description", "Description", "text", false]
    ]
  },
  masterAssetCategory: {
    title: "Add equipment category master",
    collection: "masterAssetCategories",
    fields: [
      ["name", "Category Name", "text", true],
      ["depreciationRate", "Depreciation Rate %", "number", false],
      ["maintenanceCycle", "Maintenance Cycle", "text", false],
      ["description", "Description", "text", false]
    ]
  }
};

let state = loadData();
let currentEdit = null;
const expandedSubcontractors = new Set();
const expandedMasterCategories = new Set(["masterClients"]);
let selectedMaster = { collection: "masterClients", id: null };

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...blankData, ...JSON.parse(raw) } : structuredClone(blankData);
  } catch {
    return structuredClone(blankData);
  }
}

async function loadServerData() {
  if (!API_ENABLED) return;
  try {
    const response = await fetch("/api/data");
    const result = await response.json();
    if (result.ok) {
      const localRaw = localStorage.getItem(STORAGE_KEY);
      const localData = localRaw ? { ...blankData, ...JSON.parse(localRaw) } : structuredClone(blankData);
      const localHasData = Object.values(localData).some((items) => items.length);
      const serverHasData = Object.values(result.data).some((items) => items.length);
      if (!serverHasData && localHasData) {
        state = localData;
        await saveData();
      } else {
        state = { ...blankData, ...result.data };
      }
    }
  } catch (error) {
    console.warn("Using browser storage because the local database server is unavailable.", error);
  }
}

async function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (!API_ENABLED) return;
  try {
    await fetch("/api/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state)
    });
  } catch (error) {
    console.warn("Saved in browser storage only. Local database sync failed.", error);
  }
}

function startServerHeartbeat() {
  if (!API_ENABLED) return;
  const beat = () => {
    fetch("/api/heartbeat", { method: "POST", keepalive: true }).catch(() => {});
  };
  beat();
  setInterval(beat, 5000);
}

function money(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function num(value) {
  return Number(value || 0);
}

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function projectName(id) {
  if (!id) return "Unassigned";
  const project = state.projects.find((item) => item.id === id);
  return project ? `${project.code} - ${project.name}` : "Unknown project";
}

function projectCosts(projectId) {
  return state.expenses
    .filter((item) => item.projectId === projectId)
    .reduce((sum, item) => sum + num(item.amount), 0);
}

function projectClientCredit(projectId) {
  return state.bills
    .filter((bill) => bill.projectId === projectId)
    .reduce((sum, bill) => sum + clientBillThisAmount(bill), 0);
}

function projectSubcontractorDebit(projectId) {
  return state.subcontractorBills
    .filter((bill) => bill.projectId === projectId)
    .reduce((sum, bill) => sum + subcontractorBillThisAmount(bill), 0);
}

function projectProfit(projectId) {
  return projectClientCredit(projectId) - projectSubcontractorDebit(projectId);
}

function billOutstanding(bill) {
  const payable = bill.netPayable !== undefined && bill.netPayable !== "" ? num(bill.netPayable) : num(bill.amount) + num(bill.gst) - num(bill.tds) - num(bill.retention);
  return payable - num(bill.received);
}

function clientBillThisAmount(item) {
  const items = clientBillItems(item);
  if (items.length) return items.reduce((sum, row) => sum + num(row.thisBillAmount), 0);
  return num(item.amount);
}

function clientBillGross(item) {
  return item.grossBillValue === undefined || item.grossBillValue === "" ? clientBillThisAmount(item) + num(item.gst) : num(item.grossBillValue);
}

function clientBillNet(item) {
  return item.netPayable === undefined || item.netPayable === "" ? clientBillGross(item) - num(item.tds) - num(item.retention) : num(item.netPayable);
}

function subcontractorBalance(item) {
  return num(item.billed) - num(item.paid) - num(item.retention);
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

function isGstApplicable(item) {
  return !(item.gstApplicable === false || item.gstApplicable === "false" || item.gstApplicable === "off");
}

function workOrderCgst(item) {
  if (!isGstApplicable(item)) return 0;
  const rate = item.cgstRate === undefined || item.cgstRate === "" ? 9 : num(item.cgstRate);
  return item.cgst === undefined || item.cgst === "" ? workOrderAmount(item) * rate / 100 : num(item.cgst);
}

function workOrderSgst(item) {
  if (!isGstApplicable(item)) return 0;
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

function subcontractorBillThisAmount(item) {
  const items = subcontractorBillItems(item);
  if (items.length) return items.reduce((sum, row) => sum + num(row.thisBillAmount), 0);
  return num(item.amount);
}

function subcontractorBillPreviousAmount(item) {
  const items = subcontractorBillItems(item);
  if (items.length) return items.reduce((sum, row) => sum + num(row.previousAmount), 0);
  return num(item.previousAmount);
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

function stockBalance(item) {
  return num(item.opening) + num(item.received) - num(item.issued);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(date) {
  return date && date < todayISO();
}

function textMatch(record, term) {
  if (!term) return true;
  // Case-sensitive on purpose: local tab searches and the dashboard's
  // global search both match the term's exact case.
  return JSON.stringify(record).includes(term);
}

function render() {
  renderDashboard();
  renderMasters();
  renderProjects();
  renderBilling();
  renderClientPayments();
  renderPurchases();
  renderGrns();
  renderIssues();
  renderInventory();
  renderExpenses();
  renderSubcontractors();
  renderBoqs();
  renderWorkOrders();
  renderSubcontractorBills();
  renderContractorPayments();
  renderAssets();
  renderDocuments();
  renderCompanySettings();
  renderReportOptions();
  renderReportPreview();
  renderGlobalSearch();
}

function companySettings() {
  return { ...defaultCompanySettings, ...(state.settings?.[0] || {}) };
}

function renderDashboard() {
  const totalContract = state.projects.reduce((sum, item) => sum + num(item.contractValue), 0);
  const totalBudget = state.projects.reduce((sum, item) => sum + num(item.budget), 0);
  const totalCost = state.expenses.reduce((sum, item) => sum + num(item.amount), 0);
  const outstanding = state.bills.reduce((sum, item) => sum + Math.max(0, billOutstanding(item)), 0);
  const pendingPO = state.purchases.filter((item) => !["Delivered", "Closed"].includes(item.status)).length;
  const lowStock = state.inventory.filter((item) => stockBalance(item) <= num(item.minimum)).length;
  const contractorDue = state.subcontractors.reduce((sum, item) => sum + Math.max(0, subcontractorBalance(item)), 0);
  const activeAssets = state.assets.filter((item) => item.status !== "Scrapped").length;

  const metrics = [
    ["Projects", state.projects.length, `${money(totalContract)} contract value`],
    ["Budget vs Cost", money(totalBudget - totalCost), `${money(totalCost)} actual cost`],
    ["Client Outstanding", money(outstanding), `${state.bills.length} bill records`],
    ["Subcontractor Payable", money(contractorDue), "Net of retention"],
    ["Pending POs", pendingPO, "Procurement follow-up"],
    ["GRNs", state.grns.length, "Incoming material records"],
    ["Low Stock Items", lowStock, "Below minimum level"],
    ["Active Assets", activeAssets, "Equipment register"],
    ["Documents", state.documents.length, "Registered references"]
  ];

  $("#metricGrid").innerHTML = metrics.map(([label, value, hint]) => `
    <article class="metric">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${hint}</small>
    </article>
  `).join("");

  const profits = state.projects.map((project) => {
    return { project, profit: projectProfit(project.id) };
  });
  const maxAbs = Math.max(1, ...profits.map((item) => Math.abs(item.profit)));
  $("#profitHint").textContent = `${profits.length} projects`;
  $("#profitChart").innerHTML = profits.length ? profits.map((item) => `
    <div class="bar-row">
      <strong>${escapeHtml(item.project.name || item.project.code)}</strong>
      <div class="bar-track"><div class="bar-fill ${item.profit < 0 ? "loss" : ""}" style="width:${Math.max(4, Math.abs(item.profit) / maxAbs * 100)}%"></div></div>
      <span>${money(item.profit)}</span>
    </div>
  `).join("") : emptyState();

  const alerts = buildAlerts();
  $("#alertCount").textContent = `${alerts.length} active`;
  $("#alertsList").innerHTML = alerts.length ? alerts.map((item) => `
    <div class="alert-item">
      <strong>${item.title}</strong>
      <span>${item.detail}</span>
    </div>
  `).join("") : `<div class="empty-state"><strong>No urgent alerts</strong><span>Everything visible is current.</span></div>`;

  $("#activityList").innerHTML = state.activities.length ? state.activities
    .slice()
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 8)
    .map((item) => `
      <div class="activity-item">
        <strong>${item.date || ""} - ${item.activity}</strong>
        <span>${projectName(item.projectId)} | Labour: ${item.labour || 0}${item.remarks ? ` | ${item.remarks}` : ""}</span>
      </div>
    `).join("") : emptyState();
}

function buildAlerts() {
  const alerts = [];
  state.bills.forEach((bill) => {
    const outstanding = billOutstanding(bill);
    if (outstanding > 0 && isOverdue(bill.dueDate)) {
      alerts.push({ title: `Client payment overdue: ${bill.billNo}`, detail: `${projectName(bill.projectId)} | ${money(outstanding)} pending` });
    }
  });
  state.inventory.forEach((item) => {
    if (stockBalance(item) <= num(item.minimum)) {
      alerts.push({ title: `Low stock: ${item.item}`, detail: `${projectName(item.projectId)} | Balance ${stockBalance(item)} ${item.unit || ""}` });
    }
  });
  state.purchases.forEach((po) => {
    if (!["Delivered", "Closed"].includes(po.status) && isOverdue(po.deliveryDate)) {
      alerts.push({ title: `Material delivery delayed: ${po.poNo}`, detail: `${po.material} from ${po.vendor}` });
    }
  });
  state.assets.forEach((asset) => {
    if (asset.maintenanceDue && isOverdue(asset.maintenanceDue)) {
      alerts.push({ title: `Asset maintenance due: ${asset.name}`, detail: `${asset.assetCode} | ${projectName(asset.projectId)}` });
    }
  });
  return alerts;
}

function renderProjects() {
  renderTable("projectsTable", state.projects, [
    ["Code", "code"],
    ["Project", "name"],
    ["Client", "client"],
    ["Location", "location"],
    ["Manager", "manager"],
    ["Contract", (item) => money(item.contractValue)],
    ["Budget", (item) => money(item.budget)],
    ["Actual Cost", (item) => money(projectCosts(item.id))],
    ["Progress", (item) => `${item.progress || 0}%`]
  ], "project");
}

function renderBilling() {
  renderTable("billingTable", state.bills, [
    ["Project", (item) => projectName(item.projectId)],
    ["Bill No", "billNo"],
    ["Type", "billType"],
    ["This Bill", (item) => money(clientBillThisAmount(item))],
    ["Gross", (item) => money(clientBillGross(item))],
    ["Net Payable", (item) => money(clientBillNet(item))],
    ["Received", (item) => money(item.received)],
    ["Outstanding", (item) => money(billOutstanding(item))],
    ["Due", "dueDate"],
    ["Status", (item) => statusTag(item.status, billOutstanding(item) <= 0 ? "ok" : isOverdue(item.dueDate) ? "danger" : "warn")]
  ], "bill");
}

function renderClientPayments() {
  renderTable("clientPaymentsTable", state.clientPayments, [
    ["Receipt No", "receiptNo"],
    ["Date", "paymentDate"],
    ["Project", (item) => projectName(item.projectId)],
    ["Bill No", "billNo"],
    ["Amount Received", (item) => money(item.amountReceived)],
    ["TDS", (item) => money(item.tdsDeducted)],
    ["Retention", (item) => money(item.retentionDeducted)],
    ["Mode", "paymentMode"],
    ["Reference", "referenceNo"],
    ["Remarks", "remarks"]
  ], "clientPayment");
}

function renderPurchases() {
  renderTable("procurementTable", state.purchases, [
    ["Project", (item) => projectName(item.projectId)],
    ["PO / Indent", "poNo"],
    ["Material", "material"],
    ["Vendor", "vendor"],
    ["Qty", (item) => `${item.quantity || 0} ${item.unit || ""}`],
    ["Amount", (item) => money(item.amount)],
    ["Delivery", "deliveryDate"],
    ["Status", (item) => statusTag(item.status, ["Delivered", "Closed"].includes(item.status) ? "ok" : isOverdue(item.deliveryDate) ? "danger" : "warn")]
  ], "purchase");
}

function renderGrns() {
  renderTable("grnTable", state.grns, [
    ["GRN No", "grnNo"],
    ["Project", (item) => projectName(item.projectId)],
    ["PO No", "poNo"],
    ["Vendor", "vendor"],
    ["Material", "material"],
    ["Qty", (item) => `${item.quantity || 0} ${item.unit || ""}`],
    ["Invoice", "invoiceNo"],
    ["Vehicle", "vehicleNo"],
    ["Date", "receivedDate"],
    ["Quality", (item) => statusTag(item.qualityStatus, item.qualityStatus === "Rejected" ? "danger" : item.qualityStatus === "Pending Inspection" ? "warn" : "ok")]
  ], "grn");
}

function renderIssues() {
  renderTable("issuesTable", state.issues, [
    ["Issue No", "issueNo"],
    ["Project", (item) => projectName(item.projectId)],
    ["Material", "material"],
    ["Qty", (item) => `${item.quantity || 0} ${item.unit || ""}`],
    ["Issued To", "issuedTo"],
    ["Department / Site", "department"],
    ["Date", "issueDate"],
    ["Returnable", (item) => statusTag(item.returnable || "No", item.returnable === "Yes" ? "warn" : "ok")],
    ["Purpose", "purpose"]
  ], "issue");
}

function renderInventory() {
  renderTable("inventoryTable", state.inventory, [
    ["Project", (item) => projectName(item.projectId)],
    ["Item", "item"],
    ["Category", "category"],
    ["Opening", "opening"],
    ["Received", "received"],
    ["Issued", "issued"],
    ["Balance", (item) => stockBalance(item)],
    ["Minimum", "minimum"],
    ["Stock Status", (item) => statusTag(stockBalance(item) <= num(item.minimum) ? "Low Stock" : "Available", stockBalance(item) <= num(item.minimum) ? "danger" : "ok")]
  ], "inventory");
}

function renderExpenses() {
  renderTable("costingTable", state.expenses, [
    ["Project", (item) => projectName(item.projectId)],
    ["Date", "date"],
    ["Cost Head", "head"],
    ["Description", "description"],
    ["Vendor / Paid To", (item) => item.vendor || item.paidTo || ""],
    ["Bill / Voucher", "billNo"],
    ["Amount", (item) => money(item.amount)],
    ["Payment Date", "paymentDate"],
    ["Mode", "paymentMode"],
    ["Status", (item) => statusTag(item.status, item.status === "Paid" ? "ok" : item.status === "Rejected" ? "danger" : "warn")]
  ], "expense");
}

function renderSubcontractors() {
  const target = $("#subcontractorsTable");
  const term = $("#subcontractorsSearch").value.trim();
  const contractors = subcontractorGroups().filter((group) => textMatch(group.search, term));
  if (!contractors.length) {
    target.innerHTML = emptyState();
    return;
  }

  target.innerHTML = `
    <table class="contractor-summary-table">
      <thead>
        <tr>
          <th>Subcontractor</th>
          <th>Trade</th>
          <th>Projects</th>
          <th>Agreement</th>
          <th>Work Done</th>
          <th>Billed</th>
          <th>Paid</th>
          <th>Balance</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${contractors.map((group) => contractorGroupRows(group)).join("")}
      </tbody>
    </table>
  `;
}

function subcontractorGroups() {
  const names = new Map();
  state.masterContractors.forEach((contractor) => {
    if (!contractor.name) return;
    names.set(contractor.name, {
      name: contractor.name,
      trade: contractor.trade || "",
      phone: contractor.phone || "",
      status: contractor.status || "Active",
      master: contractor
    });
  });
  state.subcontractors.forEach((item) => {
    if (!item.name) return;
    if (!names.has(item.name)) {
      names.set(item.name, { name: item.name, trade: "", phone: "", status: item.status || "Active", master: null });
    }
  });

  return Array.from(names.values()).map((contractor) => {
    const projects = state.subcontractors.filter((item) => item.name === contractor.name);
    const workOrders = state.workOrders.filter((item) => item.subcontractor === contractor.name);
    const totals = projects.reduce((summary, item) => {
      summary.agreement += num(item.agreementValue);
      summary.workDone += num(item.workDone);
      summary.billed += num(item.billed);
      summary.paid += num(item.paid);
      summary.retention += num(item.retention);
      summary.balance += subcontractorBalance(item);
      return summary;
    }, { agreement: 0, workDone: 0, billed: 0, paid: 0, retention: 0, balance: 0 });
    const search = {
      ...contractor,
      projects,
      workOrders,
      projectNames: projects.map((item) => projectName(item.projectId)).join(" "),
      workOrderNos: workOrders.map((item) => item.workOrderNo).join(" ")
    };
    return { ...contractor, projects, workOrders, totals, search };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

function contractorGroupRows(group) {
  const isOpen = expandedSubcontractors.has(group.name);
  const status = group.totals.balance > 0 ? "Payment Pending" : group.projects.length ? "Active" : group.status;
  return `
    <tr>
      <td>
        <strong>${escapeHtml(group.name)}</strong>
        ${group.phone ? `<span class="subtle-cell">${escapeHtml(group.phone)}</span>` : ""}
      </td>
      <td>${escapeHtml(group.trade || "")}</td>
      <td>${group.projects.length}</td>
      <td>${money(group.totals.agreement)}</td>
      <td>${money(group.totals.workDone)}</td>
      <td>${money(group.totals.billed)}</td>
      <td>${money(group.totals.paid)}</td>
      <td>${money(group.totals.balance)}</td>
      <td>${statusTag(status, group.totals.balance > 0 ? "warn" : status === "Blacklisted" ? "danger" : "ok")}</td>
      <td>
        <div class="row-actions">
          <button type="button" data-toggle-subcontractor="${escapeHtml(group.name)}">${isOpen ? "Hide Projects" : "Projects"}</button>
          <button type="button" data-add-subproject="${escapeHtml(group.name)}">Add Project</button>
        </div>
      </td>
    </tr>
    ${isOpen ? contractorProjectDetailsRow(group) : ""}
  `;
}

function contractorProjectDetailsRow(group) {
  return `
    <tr class="contractor-project-row">
      <td colspan="10">
        <div class="contractor-projects">
          <div class="contractor-projects-head">
            <strong>Project-wise work details</strong>
            <span>${group.workOrders.length} work order${group.workOrders.length === 1 ? "" : "s"} recorded</span>
          </div>
          ${group.projects.length ? contractorProjectTable(group.projects) : `
            <div class="empty-inline">
              <strong>No project assignment yet</strong>
              <span>Add a project here to track agreement, work done, billing, payment, retention, and balance for this subcontractor.</span>
            </div>
          `}
          ${group.workOrders.length ? contractorWorkOrderList(group.workOrders) : ""}
        </div>
      </td>
    </tr>
  `;
}

function contractorProjectTable(projects) {
  return `
    <table class="nested-table">
      <thead>
        <tr>
          <th>Project</th>
          <th>Work Order</th>
          <th>Scope</th>
          <th>Agreement</th>
          <th>Work Done</th>
          <th>Billed</th>
          <th>Paid</th>
          <th>Retention</th>
          <th>Balance</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${projects.map((item) => `
          <tr>
            <td>${escapeHtml(projectName(item.projectId))}</td>
            <td>${escapeHtml(item.workOrder || "")}</td>
            <td>${escapeHtml(item.scope || "")}</td>
            <td>${money(item.agreementValue)}</td>
            <td>${money(item.workDone)}</td>
            <td>${money(item.billed)}</td>
            <td>${money(item.paid)}</td>
            <td>${money(item.retention)}</td>
            <td>${money(subcontractorBalance(item))}</td>
            <td>${statusTag(item.status, subcontractorBalance(item) > 0 ? "warn" : "ok")}</td>
            <td>
              <div class="row-actions">
                <button type="button" data-edit="${item.id}" data-form="subcontractor">Edit</button>
                <button type="button" data-delete="${item.id}" data-form="subcontractor">Delete</button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function contractorWorkOrderList(workOrders) {
  return `
    <div class="work-order-strip">
      ${workOrders.map((item) => `
        <div>
          <strong>${escapeHtml(item.workOrderNo || "Work Order")}</strong>
          <span>${escapeHtml(projectName(item.projectId))} | ${money(workOrderNet(item))}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderWorkOrders() {
  renderTable("workOrdersTable", state.workOrders, [
    ["Work Order", "workOrderNo"],
    ["Project", (item) => projectName(item.projectId)],
    ["Subcontractor", "subcontractor"],
    ["Items", (item) => workOrderItems(item).length || 1],
    ["Amount", (item) => money(workOrderAmount(item))],
    ["Gross WO Value", (item) => money(workOrderTotalValue(item))],
    ["Net Payable", (item) => money(workOrderNet(item))],
    ["Status", (item) => statusTag(item.status, ["Approved", "Issued", "Accepted", "Closed"].includes(item.status) ? "ok" : item.status === "Cancelled" ? "danger" : "warn")]
  ], "workOrder");
}

function renderBoqs() {
  renderTable("boqsTable", state.boqs, [
    ["BOQ", "boqNo"],
    ["Project", (item) => projectName(item.projectId)],
    ["Client", "client"],
    ["Items", (item) => workOrderItems(item).length || 1],
    ["Amount", (item) => money(workOrderAmount(item))],
    ["Gross BOQ Value", (item) => money(workOrderTotalValue(item))],
    ["Net BOQ Value", (item) => money(workOrderNet(item))],
    ["Status", (item) => statusTag(item.status, ["Approved", "Issued", "Closed"].includes(item.status) ? "ok" : item.status === "Cancelled" ? "danger" : "warn")]
  ], "boq");
}

function renderSubcontractorBills() {
  renderTable("subcontractorBillsTable", state.subcontractorBills, [
    ["RA Bill No", "raBillNo"],
    ["Project", (item) => projectName(item.projectId)],
    ["Subcontractor", "subcontractor"],
    ["Work Order", "workOrderNo"],
    ["Date", "raBillDate"],
    ["This Bill", (item) => money(subcontractorBillThisAmount(item))],
    ["Gross Bill Value", (item) => money(subcontractorBillGross(item))],
    ["Net Payable", (item) => money(subcontractorBillNet(item))],
    ["Status", (item) => statusTag(item.status, ["Approved", "Issued", "Closed"].includes(item.status) ? "ok" : item.status === "Suspended" ? "danger" : "warn")]
  ], "subcontractorBill");
}

function renderContractorPayments() {
  renderTable("contractorPaymentsTable", state.contractorPayments, [
    ["Payment No", "paymentNo"],
    ["Date", "paymentDate"],
    ["Project", (item) => projectName(item.projectId)],
    ["Subcontractor", "contractor"],
    ["RA Bill No", "billNo"],
    ["Amount Paid", (item) => money(item.amountPaid)],
    ["TDS", (item) => money(item.tdsDeducted)],
    ["Retention", (item) => money(item.retentionDeducted)],
    ["Mode", "paymentMode"],
    ["Reference", "referenceNo"]
  ], "contractorPayment");
}

function renderAssets() {
  renderTable("assetsTable", state.assets, [
    ["Code", "assetCode"],
    ["Asset", "name"],
    ["Category", "category"],
    ["Project", (item) => projectName(item.projectId)],
    ["Value", (item) => money(item.purchaseValue)],
    ["Operator", "operator"],
    ["Maintenance Due", "maintenanceDue"],
    ["Warranty End", "warrantyEnd"],
    ["Status", (item) => statusTag(item.status, item.status === "Breakdown" ? "danger" : item.status === "Under Maintenance" ? "warn" : "ok")]
  ], "asset");
}

function renderDocuments() {
  renderTable("documentsTable", state.documents, [
    ["Project", (item) => projectName(item.projectId)],
    ["Type", "type"],
    ["Title", "title"],
    ["Reference", "reference"],
    ["Owner", "owner"],
    ["Date", "date"],
    ["Notes", "notes"]
  ], "document");
}

function renderMasters() {
  const categories = masterCategories();
  if (!categories.some((category) => category.collection === selectedMaster.collection)) {
    selectedMaster = { collection: categories[0]?.collection || "masterClients", id: null };
  }
  const activeCategory = categories.find((category) => category.collection === selectedMaster.collection) || categories[0];
  if (activeCategory && !selectedMaster.id && state[activeCategory.collection]?.length) {
    selectedMaster.id = state[activeCategory.collection][0].id;
  }

  const term = $("#mastersSearch").value.trim();
  $("#masterCategoryList").innerHTML = categories.map((category) => {
    const allRecords = state[category.collection] || [];
    const records = term ? allRecords.filter((record) => textMatch(record, term)) : allRecords;
    const isOpen = expandedMasterCategories.has(category.collection);
    return `
      <article class="master-category ${isOpen ? "open" : ""}">
        <button class="master-category-head" type="button" data-toggle-master-category="${category.collection}">
          <span>${escapeHtml(category.title)}</span>
          <small>${term ? `${records.length} / ${allRecords.length}` : records.length}</small>
        </button>
        <div class="master-items">
          ${records.length ? records.map((record) => masterListItemMarkup(category, record)).join("") : `<div class="master-empty">${term ? "No matches." : "No records yet."}</div>`}
        </div>
      </article>
    `;
  }).join("");
  renderMasterDetail();
}

function masterCategories() {
  return [
    {
      collection: "masterClients",
      form: "masterClient",
      title: "Client Master",
      addLabel: "Add client",
      detailTitle: "Client Details",
      summary: (item) => [item.name, item.contactPerson || item.phone || item.gstin],
      fields: [["Client Name", "name"], ["Contact Person", "contactPerson"], ["Phone", "phone"], ["Email", "email"], ["GSTIN", "gstin"], ["Address", "address"]]
    },
    {
      collection: "masterVendors",
      form: "masterVendor",
      title: "Vendor Master",
      addLabel: "Add vendor",
      detailTitle: "Vendor Details",
      summary: (item) => [item.name, item.category || item.phone || item.paymentTerms],
      fields: [["Vendor Name", "name"], ["Material Category", "category"], ["Contact Person", "contactPerson"], ["Phone", "phone"], ["GSTIN", "gstin"], ["Payment Terms", "paymentTerms"]]
    },
    {
      collection: "masterContractors",
      form: "masterContractor",
      title: "Subcontractor Master",
      addLabel: "Add subcontractor",
      detailTitle: "Subcontractor Details",
      summary: (item) => [item.name, item.trade || item.phone || item.status],
      fields: [["Subcontractor Name", "name"], ["Trade / Work Type", "trade"], ["Contact Person", "contactPerson"], ["Phone", "phone"], ["GSTIN", "gstin"], ["Status", "status"]]
    },
    {
      collection: "masterMaterials",
      form: "masterMaterial",
      title: "Material Master",
      addLabel: "Add material",
      detailTitle: "Material Details",
      summary: (item) => [item.name, [item.category, item.unit, item.gstRate ? `${item.gstRate}% GST` : ""].filter(Boolean).join(" | ")],
      fields: [["Material Code", "code"], ["Material Name", "name"], ["Category", "category"], ["Default Unit", "unit"], ["GST Rate %", "gstRate"], ["Default Minimum Stock", "minimumStock"]]
    },
    {
      collection: "masterCostHeads",
      form: "masterCostHead",
      title: "Cost Head Master",
      addLabel: "Add cost head",
      detailTitle: "Cost Head Details",
      summary: (item) => [item.name, item.group || item.description],
      fields: [["Cost Head", "name"], ["Group", "group"], ["Description", "description"]]
    },
    {
      collection: "masterAssetCategories",
      form: "masterAssetCategory",
      title: "Equipment Category Master",
      addLabel: "Add category",
      detailTitle: "Equipment Category Details",
      summary: (item) => [item.name, item.maintenanceCycle || (item.depreciationRate ? `${item.depreciationRate}% depreciation` : "")],
      fields: [["Category Name", "name"], ["Depreciation Rate %", "depreciationRate"], ["Maintenance Cycle", "maintenanceCycle"], ["Description", "description"]]
    }
  ];
}

function masterListItemMarkup(category, record) {
  const [title, detail] = category.summary(record);
  const active = selectedMaster.collection === category.collection && selectedMaster.id === record.id;
  return `
    <button class="master-list-item ${active ? "active" : ""}" type="button" data-select-master="${category.collection}" data-master-id="${record.id}">
      <strong>${escapeHtml(title || "Untitled")}</strong>
      <span>${escapeHtml(detail || "Open full details")}</span>
    </button>
  `;
}

function renderMasterDetail() {
  const categories = masterCategories();
  const category = categories.find((item) => item.collection === selectedMaster.collection) || categories[0];
  const records = category ? state[category.collection] || [] : [];
  const record = records.find((item) => item.id === selectedMaster.id) || records[0];
  if (record && selectedMaster.id !== record.id) selectedMaster.id = record.id;
  if (!category) {
    $("#masterDetail").innerHTML = emptyState();
    return;
  }
  if (!record) {
    $("#masterDetail").innerHTML = `
      <div class="master-detail-head">
        <div>
          <span>Master Data</span>
          <h2>${escapeHtml(category.title)}</h2>
        </div>
        <button class="primary-btn" data-open-modal="${category.form}" type="button">${escapeHtml(category.addLabel)}</button>
      </div>
      <div class="empty-state"><strong>No records yet</strong><span>Add the first ${escapeHtml(category.title.toLowerCase())} record.</span></div>
    `;
    return;
  }
  $("#masterDetail").innerHTML = `
    <div class="master-detail-head">
      <div>
        <span>${escapeHtml(category.detailTitle)}</span>
        <h2>${escapeHtml(record.name || record.code || "Master Record")}</h2>
      </div>
      <div class="button-row">
        <button class="ghost-btn" data-edit="${record.id}" data-form="${category.form}" type="button">Edit</button>
        <button class="danger-btn" data-delete="${record.id}" data-form="${category.form}" type="button">Delete</button>
        <button class="primary-btn" data-open-modal="${category.form}" type="button">${escapeHtml(category.addLabel)}</button>
      </div>
    </div>
    <dl class="master-detail-grid">
      ${category.fields.map(([label, key]) => `
        <div>
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(record[key] || "-")}</dd>
        </div>
      `).join("")}
    </dl>
  `;
}

function getReportDefinitions() {
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
        ["Actual Cost", (item) => projectCosts(item.id)],
        ["Budget Balance", (item) => num(item.budget) - projectCosts(item.id)],
        ["Work Completion %", (item) => num(item.progress)]
      ],
      rows: () => state.projects
    },
    profit_loss: {
      title: "Project-wise Profit & Loss",
      file: "project-wise-profit-loss",
      columns: [
        ["Project Code", (item) => item.code],
        ["Project Name", (item) => item.name],
        ["Contract Value", (item) => num(item.contractValue)],
        ["Client Bill Credit", (item) => projectClientCredit(item.id)],
        ["Subcontractor Debit", (item) => projectSubcontractorDebit(item.id)],
        ["Estimated Profit / Loss", (item) => projectProfit(item.id)],
        ["Budget Utilized %", (item) => num(item.budget) ? projectSubcontractorDebit(item.id) / num(item.budget) : 0],
        ["Work Completion %", (item) => num(item.progress)]
      ],
      rows: () => state.projects
    },
    client_outstanding: {
      title: "Client Outstanding",
      file: "client-outstanding",
      columns: [
        ["Project", (item) => projectName(item.projectId)],
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
      rows: () => state.bills.filter((item) => billOutstanding(item) > 0)
    },
    client_payment_register: {
      title: "Client Payment Register",
      file: "client-payment-register",
      columns: [
        ["Payment Date", "paymentDate"],
        ["Receipt No", "receiptNo"],
        ["Project", (item) => projectName(item.projectId)],
        ["Bill No", "billNo"],
        ["Amount Received", (item) => num(item.amountReceived)],
        ["TDS Deducted", (item) => num(item.tdsDeducted)],
        ["Retention Deducted / Released", (item) => num(item.retentionDeducted)],
        ["Payment Mode", "paymentMode"],
        ["Bank / Cheque Reference", "referenceNo"],
        ["Remarks", "remarks"]
      ],
      rows: () => state.clientPayments
    },
    procurement_summary: {
      title: "Procurement Summary",
      file: "procurement-summary",
      columns: [
        ["Project", (item) => projectName(item.projectId)],
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
      rows: () => state.purchases
    },
    grn_register: {
      title: "GRN Register",
      file: "grn-register",
      columns: [
        ["GRN No", "grnNo"],
        ["Project", (item) => projectName(item.projectId)],
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
      rows: () => state.grns
    },
    material_issue_register: {
      title: "Material Issue Register",
      file: "material-issue-register",
      columns: [
        ["Issue Slip No", "issueNo"],
        ["Project", (item) => projectName(item.projectId)],
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
      rows: () => state.issues
    },
    inventory_stock: {
      title: "Current Stock",
      file: "current-stock",
      columns: [
        ["Project", (item) => projectName(item.projectId)],
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
      rows: () => state.inventory
    },
    material_consumption: {
      title: "Material Consumption",
      file: "material-consumption",
      columns: [
        ["Project", (item) => projectName(item.projectId)],
        ["Item", "item"],
        ["Category", "category"],
        ["Unit", "unit"],
        ["Quantity Issued", (item) => num(item.issued)],
        ["Balance Stock", (item) => stockBalance(item)],
        ["Last Transaction", "lastTxn"],
        ["Notes", "notes"]
      ],
      rows: () => state.inventory.filter((item) => num(item.issued) > 0)
    },
    expense_register: {
      title: "Expense Register",
      file: "expense-register",
      columns: [
        ["Date", "date"],
        ["Project", (item) => projectName(item.projectId)],
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
      rows: () => state.expenses
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
      rows: () => costHeadSummaryRows()
    },
    contractor_outstanding: {
      title: "Subcontractor Outstanding",
      file: "contractor-outstanding",
      columns: [
        ["Project", (item) => projectName(item.projectId)],
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
      rows: () => state.subcontractors.filter((item) => subcontractorBalance(item) !== 0)
    },
    boq_register: {
      title: "BOQ Register",
      file: "boq-register",
      columns: [
        ["BOQ No", "boqNo"],
        ["BOQ Date", "boqDate"],
        ["Project", (item) => projectName(item.projectId)],
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
      rows: () => state.boqs
    },
    subcontractor_bill_register: {
      title: "Subcontractor Bill Register",
      file: "subcontractor-bill-register",
      columns: [
        ["RA Bill No", "raBillNo"],
        ["RA Bill Date", "raBillDate"],
        ["Project", (item) => projectName(item.projectId)],
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
      rows: () => state.subcontractorBills
    },
    work_order_register: {
      title: "Work Order Register",
      file: "work-order-register",
      columns: [
        ["Work Order No", "workOrderNo"],
        ["Work Order Date", "orderDate"],
        ["Project", (item) => projectName(item.projectId)],
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
      rows: () => state.workOrders
    },
    contractor_payment_register: {
      title: "Subcontractor Payment Register",
      file: "subcontractor-payment-register",
      columns: [
        ["Payment Date", "paymentDate"],
        ["Payment Voucher No", "paymentNo"],
        ["Project", (item) => projectName(item.projectId)],
        ["Subcontractor", "contractor"],
        ["RA Bill No", "billNo"],
        ["Amount Paid", (item) => num(item.amountPaid)],
        ["TDS Deducted", (item) => num(item.tdsDeducted)],
        ["Retention Deducted / Released", (item) => num(item.retentionDeducted)],
        ["Payment Mode", "paymentMode"],
        ["Bank / Cheque Reference", "referenceNo"],
        ["Remarks", "remarks"]
      ],
      rows: () => state.contractorPayments
    },
    asset_register: {
      title: "Asset Register",
      file: "asset-register",
      columns: [
        ["Asset Code", "assetCode"],
        ["Asset Name", "name"],
        ["Category", "category"],
        ["Allocated Project", (item) => projectName(item.projectId)],
        ["Purchase Value", (item) => num(item.purchaseValue)],
        ["Operator", "operator"],
        ["Maintenance Due", "maintenanceDue"],
        ["Warranty End", "warrantyEnd"],
        ["Status", "status"]
      ],
      rows: () => state.assets
    }
  };
}

function getSelectedReport() {
  const definitions = getReportDefinitions();
  const reportType = $("#reportType")?.value || "project_summary";
  const projectId = $("#reportProject")?.value || "all";
  const definition = definitions[reportType] || definitions.project_summary;
  const rows = definition.rows().filter((item) => projectId === "all" || item.id === projectId || item.projectId === projectId);
  return { definition, rows, projectId };
}

function renderReportOptions() {
  const selector = $("#reportProject");
  if (!selector) return;
  const selected = selector.value || "all";
  selector.innerHTML = `<option value="all">All Projects</option>` + state.projects.map((project) => `
    <option value="${project.id}">${escapeHtml(project.code)} - ${escapeHtml(project.name)}</option>
  `).join("");
  selector.value = state.projects.some((project) => project.id === selected) ? selected : "all";
}

function renderReportPreview() {
  if (!$("#reportPreview")) return;
  const { definition, rows: allRows } = getSelectedReport();
  // The search box only narrows what's shown in this preview; export still
  // uses the full report/project selection, not the search term.
  const term = $("#reportsSearch")?.value.trim() || "";
  const rows = term ? allRows.filter((row) => textMatch(row, term)) : allRows;
  const generatedOn = new Date().toLocaleString("en-IN");
  $("#reportPreviewTitle").textContent = definition.title;
  $("#reportPreviewMeta").textContent = term
    ? `Generated ${generatedOn} | ${rows.length} of ${allRows.length} records match "${term}"`
    : `Generated ${generatedOn} | ${rows.length} records`;
  $("#reportSummary").innerHTML = buildReportSummary(definition.title, rows);
  renderStaticTable("reportPreview", rows, definition.columns);
}

function buildReportSummary(title, rows) {
  const total = (getter) => rows.reduce((sum, row) => sum + num(getter(row)), 0);
  const cells = [["Records", rows.length]];
  if (title.includes("Project")) {
    cells.push(["Contract Value", money(total((row) => row.contractValue))]);
    cells.push(["Budget", money(total((row) => row.budget))]);
    cells.push(["Actual Cost", money(total((row) => projectCosts(row.id)))]);
  } else if (title.includes("Outstanding") && title.includes("Client")) {
    cells.push(["Gross Amount", money(total((row) => row.amount))]);
    cells.push(["Received", money(total((row) => row.received))]);
    cells.push(["Outstanding", money(total((row) => billOutstanding(row)))]);
  } else if (title.includes("Client Payment")) {
    cells.push(["Amount Received", money(total((row) => row.amountReceived))]);
    cells.push(["TDS Deducted", money(total((row) => row.tdsDeducted))]);
    cells.push(["Retention", money(total((row) => row.retentionDeducted))]);
  } else if (title.includes("Procurement")) {
    cells.push(["PO Amount", money(total((row) => row.amount))]);
    cells.push(["Pending Orders", rows.filter((row) => !["Delivered", "Closed"].includes(row.status)).length]);
  } else if (title.includes("GRN")) {
    cells.push(["Quantity Received", total((row) => row.quantity)]);
    cells.push(["Accepted", rows.filter((row) => row.qualityStatus === "Accepted").length]);
    cells.push(["Pending Inspection", rows.filter((row) => row.qualityStatus === "Pending Inspection").length]);
  } else if (title.includes("Material Issue")) {
    cells.push(["Quantity Issued", total((row) => row.quantity)]);
    cells.push(["Returnable", rows.filter((row) => row.returnable === "Yes").length]);
  } else if (title.includes("Expense") || title.includes("Cost Head")) {
    cells.push(["Total Amount", money(total((row) => row.amount))]);
    cells.push(["Paid Amount", money(total((row) => row.paidAmount !== undefined ? row.paidAmount : row.status === "Paid" ? row.amount : 0))]);
    cells.push(["Pending Amount", money(total((row) => row.pendingAmount !== undefined ? row.pendingAmount : row.status === "Paid" ? 0 : row.amount))]);
  } else if (title.includes("Stock") || title.includes("Consumption")) {
    cells.push(["Issued Quantity", total((row) => row.issued)]);
    cells.push(["Low Stock Items", rows.filter((row) => stockBalance(row) <= num(row.minimum)).length]);
  } else if (title.includes("Contractor")) {
    cells.push(["Agreement Value", money(total((row) => row.agreementValue))]);
    cells.push(["Outstanding", money(total((row) => subcontractorBalance(row)))]);
  } else if (title.includes("Asset")) {
    cells.push(["Purchase Value", money(total((row) => row.purchaseValue))]);
    cells.push(["Maintenance Due", rows.filter((row) => isOverdue(row.maintenanceDue)).length]);
  }
  return cells.map(([label, value]) => `
    <div class="summary-cell">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function costHeadSummaryRows() {
  const groups = new Map();
  state.expenses.forEach((expense) => {
    const key = `${expense.projectId || "all"}|${expense.head || "Unassigned"}`;
    if (!groups.has(key)) {
      groups.set(key, {
        project: projectName(expense.projectId),
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

function renderStaticTable(targetId, records, columns) {
  const target = $(`#${targetId}`);
  if (!records.length) {
    target.innerHTML = emptyState();
    return;
  }
  target.innerHTML = `
    <table>
      <thead><tr>${columns.map(([label]) => `<th>${escapeHtml(label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${records.map((record) => `
          <tr>${columns.map(([, key]) => `<td>${formatReportCell(typeof key === "function" ? key(record) : record[key])}</td>`).join("")}</tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function formatReportCell(value) {
  if (typeof value === "number") return value.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return escapeHtml(value || "");
}

function reportRowsForExport(rows, columns) {
  return rows.map((record) => Object.fromEntries(columns.map(([label, key]) => [label, typeof key === "function" ? key(record) : record[key] || ""])));
}

function exportReport() {
  const { definition, rows } = getSelectedReport();
  const format = $("#reportFormat").value;
  const exportRows = reportRowsForExport(rows, definition.columns);
  const date = todayISO();
  if (API_ENABLED) {
    fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportType: $("#reportType").value,
        projectId: $("#reportProject").value,
        format
      })
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.ok) {
          showToast(`Report saved: ${result.report.fileName}`);
        } else {
          throw new Error(result.error || "Report export failed");
        }
      })
      .catch((error) => {
        console.warn("Server report export failed, downloading report in the browser instead.", error);
        exportReportDownload(definition, exportRows, format, date);
      });
    return;
  }
  exportReportDownload(definition, exportRows, format, date);
}

function exportReportDownload(definition, exportRows, format, date) {
  if (format === "csv") {
    downloadFile(`${definition.file}-${date}.csv`, csvReport(definition.title, exportRows), "text/csv;charset=utf-8");
    showToast("Report downloaded.");
    return;
  }
  downloadFile(`${definition.file}-${date}.xls`, excelReport(definition.title, exportRows), "application/vnd.ms-excel;charset=utf-8");
  showToast("Report downloaded.");
}

async function openFolder(folder) {
  if (!API_ENABLED) {
    showToast("Folder shortcut is available when launched with Launch NomadicERP.bat.", "warn");
    return;
  }
  try {
    const response = await fetch("/api/open-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder })
    });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "Could not open folder");
    showToast(`Opened ${folder} folder.`);
  } catch (error) {
    console.warn("Open folder failed.", error);
    showToast("Could not open the folder from this browser session.", "warn");
  }
}

function csvReport(title, rows) {
  const company = companySettings();
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

function csvValue(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function excelReport(title, rows) {
  const company = companySettings();
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const generated = new Date().toLocaleString("en-IN");
  const bodyRows = rows.map((row) => `
    <tr>${headers.map((header) => `<td>${escapeHtml(row[header] ?? "")}</td>`).join("")}</tr>
  `).join("");
  return `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Calibri, Arial, sans-serif; color: #14202e; }
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

function renderCompanySettings() {
  const form = $("#companyForm");
  if (!form) return;
  const company = companySettings();
  Object.entries(company).forEach(([key, value]) => {
    const input = form.elements[key];
    if (input && document.activeElement !== input) input.value = value || "";
  });
}

function downloadFile(fileName, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function renderTable(targetId, records, columns, formKey) {
  // Each tab's table is filtered only by that tab's own search box
  // (id "<view>Search", derived from its "<view>Table" target), never
  // by the dashboard's global search.
  const searchInput = document.getElementById(targetId.replace(/Table$/, "Search"));
  const term = searchInput ? searchInput.value.trim() : "";
  const filtered = records.filter((record) => textMatch({ ...record, projectName: projectName(record.projectId) }, term));
  const target = $(`#${targetId}`);
  if (!filtered.length) {
    target.innerHTML = emptyState();
    return;
  }
  target.innerHTML = `
    <table>
      <thead>
        <tr>${columns.map(([label]) => `<th>${label}</th>`).join("")}<th>Actions</th></tr>
      </thead>
      <tbody>
        ${filtered.map((record) => `
          <tr>
            ${columns.map(([, key]) => `<td>${typeof key === "function" ? key(record) : escapeHtml(record[key] || "")}</td>`).join("")}
            <td>
              <div class="row-actions">
                ${formKey === "workOrder" ? `<button type="button" class="eye-btn" data-view-work-order="${record.id}" title="View work order" aria-label="View work order">&#128065;</button>` : ""}
                ${formKey === "boq" ? `<button type="button" class="eye-btn" data-view-boq="${record.id}" title="View BOQ" aria-label="View BOQ">&#128065;</button>` : ""}
                <button type="button" data-edit="${record.id}" data-form="${formKey}">Edit</button>
                <button type="button" data-delete="${record.id}" data-form="${formKey}">Delete</button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function statusTag(label, tone) {
  return `<span class="tag ${tone || ""}">${escapeHtml(label || "Open")}</span>`;
}

// Maps each data tab to the render function that redraws just that tab's
// table, so a local search box (or a jump from the dashboard's global
// search) only ever re-renders its own tab, not the whole app.
const VIEW_RENDERERS = {
  masters: renderMasters,
  projects: renderProjects,
  billing: renderBilling,
  clientPayments: renderClientPayments,
  procurement: renderPurchases,
  grn: renderGrns,
  issues: renderIssues,
  inventory: renderInventory,
  costing: renderExpenses,
  subcontractors: renderSubcontractors,
  boqs: renderBoqs,
  workOrders: renderWorkOrders,
  subcontractorBills: renderSubcontractorBills,
  contractorPayments: renderContractorPayments,
  assets: renderAssets,
  documents: renderDocuments,
  reports: renderReportPreview
};

function activateView(viewId) {
  const navButton = $(`.nav-item[data-view="${viewId}"]`);
  const viewSection = $(`#${viewId}`);
  if (!navButton || !viewSection) return;
  $$(".nav-item").forEach((item) => item.classList.remove("active"));
  navButton.classList.add("active");
  $$(".view").forEach((view) => view.classList.remove("active"));
  viewSection.classList.add("active");
  $("#viewTitle").textContent = navButton.textContent;
}

// Sources searched by the dashboard's global search box. Each entry maps
// straight to a data tab so a hit can jump the user there.
const GLOBAL_SEARCH_SOURCES = [
  { view: "projects", label: "Projects", records: () => state.projects, title: (r) => `${r.code || ""} ${r.name || ""}`.trim() || "Project", detail: (r) => r.client || "" },
  { view: "billing", label: "Client Bills", records: () => state.bills, title: (r) => r.billNo || "Bill", detail: (r) => projectName(r.projectId) },
  { view: "clientPayments", label: "Client Payments", records: () => state.clientPayments, title: (r) => r.receiptNo || "Payment", detail: (r) => projectName(r.projectId) },
  { view: "procurement", label: "Procurement", records: () => state.purchases, title: (r) => r.poNo || "PO", detail: (r) => r.material || "" },
  { view: "grn", label: "GRN", records: () => state.grns, title: (r) => r.grnNo || "GRN", detail: (r) => r.material || "" },
  { view: "issues", label: "Material Issue", records: () => state.issues, title: (r) => r.issueNo || "Issue", detail: (r) => r.material || "" },
  { view: "inventory", label: "Inventory", records: () => state.inventory, title: (r) => r.item || "Item", detail: (r) => projectName(r.projectId) },
  { view: "costing", label: "Costing", records: () => state.expenses, title: (r) => r.description || r.head || "Expense", detail: (r) => projectName(r.projectId) },
  { view: "subcontractors", label: "Subcontractors", records: () => state.subcontractors, title: (r) => r.name || "Subcontractor", detail: (r) => projectName(r.projectId) },
  { view: "boqs", label: "BOQ", records: () => state.boqs, title: (r) => r.boqNo || "BOQ", detail: (r) => r.client || "" },
  { view: "workOrders", label: "Work Orders", records: () => state.workOrders, title: (r) => r.workOrderNo || "Work Order", detail: (r) => r.subcontractor || "" },
  { view: "subcontractorBills", label: "Subcontractor Bill", records: () => state.subcontractorBills, title: (r) => r.raBillNo || "RA Bill", detail: (r) => r.subcontractor || "" },
  { view: "contractorPayments", label: "Subcontractor Payments", records: () => state.contractorPayments, title: (r) => r.paymentNo || "Payment", detail: (r) => r.contractor || "" },
  { view: "assets", label: "Assets", records: () => state.assets, title: (r) => r.name || "Asset", detail: (r) => r.assetCode || "" },
  { view: "documents", label: "Documents", records: () => state.documents, title: (r) => r.title || "Document", detail: (r) => r.type || "" }
];

function renderGlobalSearch() {
  const panel = $("#globalSearchResults");
  const input = $("#globalSearch");
  if (!panel || !input) return;
  const term = input.value.trim();
  if (!term) {
    panel.hidden = true;
    panel.innerHTML = "";
    return;
  }

  const groups = GLOBAL_SEARCH_SOURCES.map((source) => ({
    ...source,
    matches: source.records().filter((record) => textMatch({ ...record, projectName: projectName(record.projectId) }, term))
  })).filter((group) => group.matches.length);

  panel.hidden = false;
  const totalMatches = groups.reduce((sum, group) => sum + group.matches.length, 0);

  if (!groups.length) {
    panel.innerHTML = `<div class="empty-state"><strong>No matches</strong><span>Nothing in the app matched "${escapeHtml(term)}" (case-sensitive).</span></div>`;
    return;
  }

  const SHOWN_PER_GROUP = 8;
  panel.innerHTML = `
    <div class="panel-head">
      <h2>Search Results</h2>
      <span>${totalMatches} match${totalMatches === 1 ? "" : "es"} across ${groups.length} tab${groups.length === 1 ? "" : "s"}</span>
    </div>
    <div class="global-search-groups">
      ${groups.map((group) => `
        <div class="global-search-group">
          <h3>${escapeHtml(group.label)} (${group.matches.length})</h3>
          <div class="list-stack">
            ${group.matches.slice(0, SHOWN_PER_GROUP).map((record) => `
              <button type="button" class="global-search-hit" data-jump-view="${group.view}">
                <strong>${escapeHtml(group.title(record))}</strong>
                <span>${escapeHtml(group.detail(record) || "")}</span>
              </button>
            `).join("")}
          </div>
          ${group.matches.length > SHOWN_PER_GROUP ? `<button type="button" class="link-btn" data-jump-view="${group.view}">View all ${group.matches.length} in ${escapeHtml(group.label)}</button>` : ""}
        </div>
      `).join("")}
    </div>
  `;
}

function emptyState() {
  return $("#emptyStateTemplate").innerHTML;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message, tone = "ok") {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast active ${tone === "warn" ? "warn" : ""}`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("active");
  }, 3600);
}

function nextCode(prefix, collection, field) {
  const matcher = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-(\\d+)$`, "i");
  const maxNumber = (state[collection] || []).reduce((max, item) => {
    const match = String(item[field] || "").match(matcher);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}-${String(maxNumber + 1).padStart(3, "0")}`;
}

function defaultFormValue(formKey, name, type) {
  if (type === "date") return todayISO();
  const defaultRates = {
    bill: { cgstRate: 9, sgstRate: 9, gstRate: 18, tdsRate: 1, retentionRate: 5 },
    boq: { cgstRate: 9, sgstRate: 9, gstRate: 18, tdsRate: 1, retentionRate: 5, gstApplicable: true },
    workOrder: { cgstRate: 9, sgstRate: 9, gstRate: 18, tdsRate: 1, retentionRate: 5, gstApplicable: true },
    subcontractorBill: { cgstRate: 9, sgstRate: 9, tdsRate: 1, retentionRate: 5 }
  };
  if (defaultRates[formKey]?.[name] !== undefined) return defaultRates[formKey][name];
  const autoNumbers = {
    project: { code: ["PRJ", "projects", "code"] },
    bill: { billNo: ["RA", "bills", "billNo"] },
    clientPayment: { receiptNo: ["REC", "clientPayments", "receiptNo"] },
    purchase: { poNo: ["PO", "purchases", "poNo"] },
    grn: { grnNo: ["GRN", "grns", "grnNo"] },
    issue: { issueNo: ["MIS", "issues", "issueNo"] },
    boq: { boqNo: ["BOQ", "boqs", "boqNo"] },
    workOrder: { workOrderNo: ["WO", "workOrders", "workOrderNo"] },
    subcontractorBill: { raBillNo: ["RA", "subcontractorBills", "raBillNo"] },
    contractorPayment: { paymentNo: ["CPAY", "contractorPayments", "paymentNo"] },
    expense: { billNo: ["EXP", "expenses", "billNo"] },
    asset: { assetCode: ["AST", "assets", "assetCode"] }
  };
  const config = autoNumbers[formKey]?.[name];
  return config ? nextCode(...config) : "";
}

function openModal(formKey, id = null) {
  const config = forms[formKey];
  const record = id ? state[config.collection].find((item) => item.id === id) : null;
  currentEdit = { formKey, id };
  $("#modalTitle").textContent = id ? config.title.replace("Add", "Edit") : config.title;
  const sheetForm = formKey === "bill" || formKey === "boq" || formKey === "workOrder" || formKey === "subcontractorBill";
  $("#modal .modal-card").classList.toggle("work-order-modal", sheetForm);
  $("#recordForm").classList.toggle("work-order-sheet-form", sheetForm);
  if (formKey === "bill") {
    $("#recordForm").innerHTML = clientBillSheetMarkup(record);
  } else if (formKey === "boq") {
    $("#recordForm").innerHTML = boqSheetMarkup(record);
  } else if (formKey === "workOrder") {
    $("#recordForm").innerHTML = workOrderSheetMarkup(record);
  } else if (formKey === "subcontractorBill") {
    $("#recordForm").innerHTML = subcontractorBillSheetMarkup(record);
  } else {
    $("#recordForm").innerHTML = config.fields.map(([name, label, type, required]) => {
      const value = record ? record[name] : defaultFormValue(formKey, name, type);
      return fieldMarkup(name, label, type, required, value);
    }).join("") + `
      <div class="form-actions">
        <button class="ghost-btn" id="cancelForm" type="button">Cancel</button>
        <button class="primary-btn" type="submit">Save record</button>
      </div>
    `;
  }
  bindMasterAutofill(formKey);
  bindClientBillCalculation(formKey);
  bindWorkOrderCalculation(formKey);
  bindSubcontractorBillCalculation(formKey);
  bindContractorBillCalculation(formKey);
  $("#modal").classList.add("active");
  $("#modal").setAttribute("aria-hidden", "false");
}

function openWorkOrderView(id) {
  const record = state.workOrders.find((item) => item.id === id);
  if (!record) return;
  currentEdit = null;
  $("#modalTitle").textContent = "View work order";
  $("#modal .modal-card").classList.add("work-order-modal");
  $("#recordForm").classList.add("work-order-sheet-form");
  $("#recordForm").innerHTML = workOrderSheetMarkup(record, true);
  $("#modal").classList.add("active");
  $("#modal").setAttribute("aria-hidden", "false");
}

function openBoqView(id) {
  const record = state.boqs.find((item) => item.id === id);
  if (!record) return;
  currentEdit = null;
  $("#modalTitle").textContent = "View BOQ";
  $("#modal .modal-card").classList.add("work-order-modal");
  $("#recordForm").classList.add("work-order-sheet-form");
  $("#recordForm").innerHTML = boqSheetMarkup(record, true);
  $("#modal").classList.add("active");
  $("#modal").setAttribute("aria-hidden", "false");
}

function workOrderSheetMarkup(record = null, readOnly = false) {
  if (readOnly) return workOrderReadOnlySheetMarkup(record);
  const value = (name, type = "") => record ? record[name] ?? "" : defaultFormValue("workOrder", name, type);
  const projectOptions = [`<option value="">Unassigned</option>`].concat(state.projects.map((project) => `<option value="${project.id}" ${value("projectId") === project.id ? "selected" : ""}>${escapeHtml(project.code)} - ${escapeHtml(project.name)}</option>`));
  const statusOptions = ["Draft", "Approved", "Issued", "Closed", "Suspended", "Cancelled"].map((status) => `<option value="${status}" ${value("status") === status ? "selected" : ""}>${status}</option>`);
  const contractorOptions = masterOptions("master:masterContractors:name", value("subcontractor"));
  const locked = readOnly ? "disabled" : "";
  const readonly = readOnly ? "readonly" : "";
  const items = workOrderItems(record);
  while (items.length < 2) {
    items.push({ siNo: String(items.length + 1), description: "", unit: "", quantity: "", rate: "", amount: 0 });
  }
  return `
    <input type="hidden" name="items" id="workOrderItemsJson" value="">
    <div class="work-order-sheet ${readOnly ? "readonly-sheet" : ""}">
      <div class="sheet-title">FOR WORK ORDER</div>
      <div class="sheet-meta">
        <label><span>Project :</span><select name="projectId" required ${locked}>${projectOptions.join("")}</select></label>
        <label><span>Work Order Date</span><input name="orderDate" type="date" value="${escapeHtml(value("orderDate", "date"))}" required ${readonly}></label>
        <label><span>Sub Contractor Name</span><select name="subcontractor" required>${selectPlaceholder("Sub Contractor Name", value("subcontractor"))}${contractorOptions.join("")}</select></label>
        <label><span>Work Order No</span><input name="workOrderNo" type="text" value="${escapeHtml(value("workOrderNo"))}" required ${readonly}></label>
      </div>
      <div class="work-order-grid-wrap">
        <table class="work-order-entry-table">
          <thead>
            <tr>
              <th>SI No</th>
              <th>Description Of Work</th>
              <th>Unit</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="workOrderItemRows">
            ${items.map((item, index) => workOrderItemRowMarkup(item, index, readOnly)).join("")}
          </tbody>
          <tfoot>
            <tr><td colspan="5">Total =</td><td><input name="amount" type="number" step="any" readonly></td><td></td></tr>
            <tr class="tax-row"><td colspan="5">CGST (<input name="cgstRate" class="inline-rate" type="number" step="any" value="${escapeHtml(value("cgstRate") || 9)}" ${readonly}>%) =</td><td><input name="cgst" type="number" step="any" readonly></td><td></td></tr>
            <tr class="tax-row"><td colspan="5">SGST (<input name="sgstRate" class="inline-rate" type="number" step="any" value="${escapeHtml(value("sgstRate") || 9)}" ${readonly}>%) =</td><td><input name="sgst" type="number" step="any" readonly></td><td></td></tr>
            <tr class="tax-row"><td colspan="5">Total GST Amount =</td><td><input name="gst" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="5">Gross Work Order Value</td><td><input name="totalWorkOrderValue" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="5">TDS (<input name="tdsRate" class="inline-rate" type="number" step="any" value="${escapeHtml(value("tdsRate") || 1)}" ${readonly}>%) =</td><td><input name="tds" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="5">RETENTION (<input name="retentionRate" class="inline-rate" type="number" step="any" value="${escapeHtml(value("retentionRate") || 5)}" ${readonly}>%) =</td><td><input name="retention" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="5">Net Work Order Value =</td><td><input name="netAmount" type="number" step="any" readonly></td><td></td></tr>
          </tfoot>
        </table>
      </div>
      ${readOnly ? "" : `<button class="small-btn add-line-btn" id="addWorkOrderItem" type="button">Add Item in Work Order</button>`}
      <div class="sheet-footer-grid">
        <label><span>Work Order Status</span><select name="status" ${locked}>${statusOptions.join("")}</select></label>
        <label class="full"><span>Remarks:</span><textarea name="remarks" ${readonly}>${escapeHtml(value("remarks"))}</textarea></label>
        <label class="gst-note checkbox-cell"><span>GST If Applicable</span><input name="gstApplicable" type="checkbox" value="true" ${isGstApplicable(record || {}) ? "checked" : ""}></label>
      </div>
      <div class="form-actions">
        <button class="ghost-btn" id="cancelForm" type="button">${readOnly ? "Close" : "Cancel"}</button>
        ${readOnly ? "" : `<button class="primary-btn" type="submit">Save work order</button>`}
      </div>
    </div>
  `;
}

function workOrderReadOnlySheetMarkup(record) {
  const items = workOrderItems(record);
  const itemRows = items.length ? items : [{ siNo: "1", description: "", unit: "", quantity: "", rate: "", amount: 0 }];
  const cgstRate = record.cgstRate === undefined || record.cgstRate === "" ? 9 : num(record.cgstRate);
  const sgstRate = record.sgstRate === undefined || record.sgstRate === "" ? 9 : num(record.sgstRate);
  const tdsRate = record.tdsRate === undefined || record.tdsRate === "" ? 1 : num(record.tdsRate);
  const retentionRate = record.retentionRate === undefined || record.retentionRate === "" ? 5 : num(record.retentionRate);
  return `
    <div class="work-order-sheet readonly-sheet">
      <div class="sheet-title">FOR WORK ORDER</div>
      <div class="sheet-meta readonly-meta">
        <label><span>Project :</span><strong>${escapeHtml(projectName(record.projectId))}</strong></label>
        <label><span>Work Order Date</span><strong>${escapeHtml(record.orderDate || "")}</strong></label>
        <label><span>Sub Contractor Name</span><strong>${escapeHtml(record.subcontractor || "")}</strong></label>
        <label><span>Work Order No</span><strong>${escapeHtml(record.workOrderNo || "")}</strong></label>
      </div>
      <div class="work-order-grid-wrap">
        <table class="work-order-entry-table readonly-work-order-table">
          <thead>
            <tr>
              <th>SI No</th>
              <th>Description Of Work</th>
              <th>Unit</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows.map((item, index) => `
              <tr>
                <td>${escapeHtml(item.siNo || index + 1)}</td>
                <td>${escapeHtml(item.description || "")}</td>
                <td>${escapeHtml(item.unit || "")}</td>
                <td>${num(item.quantity)}</td>
                <td>${money(item.rate)}</td>
                <td>${money(num(item.amount || num(item.quantity) * num(item.rate)))}</td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr><td colspan="5">Total =</td><td>${money(workOrderAmount(record))}</td></tr>
            <tr class="tax-row"><td colspan="5">CGST (${cgstRate}%) =</td><td>${money(workOrderCgst(record))}</td></tr>
            <tr class="tax-row"><td colspan="5">SGST (${sgstRate}%) =</td><td>${money(workOrderSgst(record))}</td></tr>
            <tr class="tax-row"><td colspan="5">Total GST Amount =</td><td>${money(workOrderGst(record))}</td></tr>
            <tr><td colspan="5">Gross Work Order Value</td><td>${money(workOrderTotalValue(record))}</td></tr>
            <tr><td colspan="5">TDS (${tdsRate}%) =</td><td>${money(workOrderTds(record))}</td></tr>
            <tr><td colspan="5">RETENTION (${retentionRate}%) =</td><td>${money(workOrderRetention(record))}</td></tr>
            <tr><td colspan="5">Net Work Order Value =</td><td>${money(workOrderNet(record))}</td></tr>
          </tfoot>
        </table>
      </div>
      <div class="sheet-footer-grid readonly-meta">
        <label><span>Work Order Status</span><strong>${escapeHtml(record.status || "Draft")}</strong></label>
        <label class="full"><span>Remarks:</span><strong>${escapeHtml(record.remarks || "")}</strong></label>
        <label class="gst-note"><span>GST If Applicable</span><strong>${isGstApplicable(record) ? "Yes" : "No"}</strong></label>
      </div>
      <div class="form-actions">
        <button class="ghost-btn" id="cancelForm" type="button">Close</button>
      </div>
    </div>
  `;
}

function boqSheetMarkup(record = null, readOnly = false) {
  if (readOnly) return boqReadOnlySheetMarkup(record);
  const value = (name, type = "") => record ? record[name] ?? "" : defaultFormValue("boq", name, type);
  const projectOptions = [`<option value="">Unassigned</option>`].concat(state.projects.map((project) => `<option value="${project.id}" ${value("projectId") === project.id ? "selected" : ""}>${escapeHtml(project.code)} - ${escapeHtml(project.name)}</option>`));
  const statusOptions = ["Draft", "Approved", "Issued", "Closed", "Cancelled"].map((status) => `<option value="${status}" ${value("status") === status ? "selected" : ""}>${status}</option>`);
  const clientOptions = masterOptions("master:masterClients:name", value("client"));
  const items = workOrderItems(record);
  while (items.length < 2) {
    items.push({ siNo: String(items.length + 1), description: "", unit: "", quantity: "", rate: "", amount: 0 });
  }
  return `
    <input type="hidden" name="items" id="workOrderItemsJson" value="">
    <div class="work-order-sheet">
      <div class="sheet-title">FOR BOQ</div>
      <div class="sheet-meta">
        <label><span>Project :</span><select name="projectId" required>${projectOptions.join("")}</select></label>
        <label><span>BOQ Date</span><input name="boqDate" type="date" value="${escapeHtml(value("boqDate", "date"))}" required></label>
        <label><span>Client Name</span><select name="client" required>${selectPlaceholder("Client Name", value("client"))}${clientOptions.join("")}</select></label>
        <label><span>BOQ No</span><input name="boqNo" type="text" value="${escapeHtml(value("boqNo"))}" required></label>
      </div>
      <div class="work-order-grid-wrap">
        <table class="work-order-entry-table">
          <thead>
            <tr>
              <th>SI No</th>
              <th>Description Of Work</th>
              <th>Unit</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="workOrderItemRows">
            ${items.map((item, index) => workOrderItemRowMarkup(item, index)).join("")}
          </tbody>
          <tfoot>
            <tr><td colspan="5">Total =</td><td><input name="amount" type="number" step="any" readonly></td><td></td></tr>
            <tr class="tax-row"><td colspan="5">CGST (<input name="cgstRate" class="inline-rate" type="number" step="any" value="${escapeHtml(value("cgstRate") || 9)}">%) =</td><td><input name="cgst" type="number" step="any" readonly></td><td></td></tr>
            <tr class="tax-row"><td colspan="5">SGST (<input name="sgstRate" class="inline-rate" type="number" step="any" value="${escapeHtml(value("sgstRate") || 9)}">%) =</td><td><input name="sgst" type="number" step="any" readonly></td><td></td></tr>
            <tr class="tax-row"><td colspan="5">Total GST Amount =</td><td><input name="gst" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="5">Gross BOQ Value</td><td><input name="totalWorkOrderValue" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="5">TDS (<input name="tdsRate" class="inline-rate" type="number" step="any" value="${escapeHtml(value("tdsRate") || 1)}">%) =</td><td><input name="tds" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="5">RETENTION (<input name="retentionRate" class="inline-rate" type="number" step="any" value="${escapeHtml(value("retentionRate") || 5)}">%) =</td><td><input name="retention" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="5">Net BOQ Value =</td><td><input name="netAmount" type="number" step="any" readonly></td><td></td></tr>
          </tfoot>
        </table>
      </div>
      <button class="small-btn add-line-btn" id="addWorkOrderItem" type="button">Add Item in BOQ</button>
      <div class="sheet-footer-grid">
        <label><span>BOQ Status</span><select name="status">${statusOptions.join("")}</select></label>
        <label class="full"><span>Remarks:</span><textarea name="remarks">${escapeHtml(value("remarks"))}</textarea></label>
        <label class="gst-note checkbox-cell"><span>GST If Applicable</span><input name="gstApplicable" type="checkbox" value="true" ${isGstApplicable(record || {}) ? "checked" : ""}></label>
      </div>
      <div class="form-actions">
        <button class="ghost-btn" id="cancelForm" type="button">Cancel</button>
        <button class="primary-btn" type="submit">Save BOQ</button>
      </div>
    </div>
  `;
}

function boqReadOnlySheetMarkup(record) {
  const mappedRecord = {
    ...record,
    workOrderNo: record?.boqNo,
    subcontractor: record?.client,
    orderDate: record?.boqDate
  };
  return workOrderReadOnlySheetMarkup(mappedRecord)
    .replaceAll("FOR WORK ORDER", "FOR BOQ")
    .replaceAll("Work Order Date", "BOQ Date")
    .replaceAll("Sub Contractor Name", "Client Name")
    .replaceAll("Work Order No", "BOQ No")
    .replaceAll("Gross Work Order Value", "Gross BOQ Value")
    .replaceAll("Net Work Order Value", "Net BOQ Value")
    .replaceAll("Work Order Status", "BOQ Status");
}

function workOrderItemRowMarkup(item, index, readOnly = false) {
  const readonly = readOnly ? "readonly" : "";
  return `
    <tr data-work-order-item>
      <td><input data-item-field="siNo" type="text" value="${escapeHtml(item.siNo || index + 1)}" ${readonly}></td>
      <td><input data-item-field="description" type="text" value="${escapeHtml(item.description || "")}" ${readonly}></td>
      <td><input data-item-field="unit" type="text" value="${escapeHtml(item.unit || "")}" ${readonly}></td>
      <td><input data-item-field="quantity" type="number" step="any" value="${escapeHtml(item.quantity ?? "")}" ${readonly}></td>
      <td><input data-item-field="rate" type="number" step="any" value="${escapeHtml(item.rate ?? "")}" ${readonly}></td>
      <td><input data-item-field="amount" type="number" step="any" value="${escapeHtml(item.amount ?? 0)}" readonly></td>
      <td>${readOnly ? "" : `<button class="icon-mini-btn" type="button" data-remove-work-order-item aria-label="Remove item">x</button>`}</td>
    </tr>
  `;
}

function clientBillSheetMarkup(record = null) {
  const value = (name, type = "") => record ? record[name] ?? "" : defaultFormValue("bill", name, type);
  const projectOptions = [`<option value="">Unassigned</option>`].concat(state.projects.map((project) => `<option value="${project.id}" ${value("projectId") === project.id ? "selected" : ""}>${escapeHtml(project.code)} - ${escapeHtml(project.name)}</option>`));
  const typeOptions = ["RA Bill", "IPC Billing", "Tax Invoice"].map((type) => `<option value="${type}" ${value("billType") === type ? "selected" : ""}>${type}</option>`);
  const statusOptions = ["Draft", "Submitted", "Certified", "Approved", "Paid", "Rejected"].map((status) => `<option value="${status}" ${value("status") === status ? "selected" : ""}>${status}</option>`);
  const items = clientBillItems(record);
  while (items.length < 2) items.push(blankClientBillItem(items.length));
  return `
    <input type="hidden" name="items" id="clientBillItemsJson" value="">
    <input type="hidden" name="previousAmount">
    <input type="hidden" name="cumulativeAmount">
    <div class="work-order-sheet">
      <div class="sheet-title">For Client Bill</div>
      <div class="sheet-meta">
        <label><span>Project :</span><select name="projectId" required>${projectOptions.join("")}</select></label>
        <label><span>Bill / RA No</span><input name="billNo" type="text" value="${escapeHtml(value("billNo"))}" required></label>
        <label><span>Bill Type</span><select name="billType">${typeOptions.join("")}</select></label>
        <label><span>Submission Date</span><input name="submittedOn" type="date" value="${escapeHtml(value("submittedOn", "date"))}"></label>
        <label><span>Due Date</span><input name="dueDate" type="date" value="${escapeHtml(value("dueDate", "date"))}"></label>
      </div>
      <div class="work-order-grid-wrap">
        <table class="work-order-entry-table subcontractor-bill-table">
          <thead>
            <tr>
              <th>SI No</th>
              <th>Description Of Work</th>
              <th>Unit</th>
              <th>BOQ Qty</th>
              <th>BOQ Rate</th>
              <th>Previous Qty</th>
              <th>This Bill Qty</th>
              <th>Cumulative Qty</th>
              <th>Previous Amount</th>
              <th>This Bill Amount</th>
              <th>Cumulative Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="clientBillItemRows">
            ${items.map((item, index) => clientBillItemRowMarkup(item, index)).join("")}
          </tbody>
          <tfoot>
            <tr><td colspan="8">Total =</td><td><input name="previousAmountDisplay" type="number" step="any" readonly></td><td><input name="amount" type="number" step="any" readonly></td><td><input name="cumulativeAmountDisplay" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="8">CGST (<input name="cgstRate" class="inline-rate" type="number" step="any" value="${escapeHtml(value("cgstRate") || 9)}">%) =</td><td></td><td><input name="cgst" type="number" step="any" readonly></td><td><input name="cumulativeCgst" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="8">SGST (<input name="sgstRate" class="inline-rate" type="number" step="any" value="${escapeHtml(value("sgstRate") || 9)}">%) =</td><td></td><td><input name="sgst" type="number" step="any" readonly></td><td><input name="cumulativeSgst" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="8">Total GST Amount =</td><td></td><td><input name="gst" type="number" step="any" readonly></td><td><input name="cumulativeGst" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="8">Gross Bill Value</td><td></td><td><input name="grossBillValue" type="number" step="any" readonly></td><td><input name="cumulativeGrossBillValue" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="8">TDS (<input name="tdsRate" class="inline-rate" type="number" step="any" value="${escapeHtml(value("tdsRate") || 1)}">%) =</td><td></td><td><input name="tds" type="number" step="any" readonly></td><td><input name="cumulativeTds" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="8">RETENTION (<input name="retentionRate" class="inline-rate" type="number" step="any" value="${escapeHtml(value("retentionRate") || 5)}">%) =</td><td></td><td><input name="retention" type="number" step="any" readonly></td><td><input name="cumulativeRetention" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="8">Net Payable =</td><td></td><td><input name="netPayable" type="number" step="any" readonly></td><td><input name="cumulativeNetPayable" type="number" step="any" readonly></td><td></td></tr>
          </tfoot>
        </table>
      </div>
      <button class="small-btn add-line-btn" id="addClientBillItem" type="button">Add Item in Client Bill</button>
      <div class="sheet-footer-grid">
        <label><span>Payment Received</span><input name="received" type="number" step="any" value="${escapeHtml(value("received") || 0)}"></label>
        <label><span>Bill Status</span><select name="status">${statusOptions.join("")}</select></label>
      </div>
      <div class="form-actions">
        <button class="ghost-btn" id="cancelForm" type="button">Cancel</button>
        <button class="primary-btn" type="submit">Save client bill</button>
      </div>
    </div>
  `;
}

function clientBillItemRowMarkup(item, index) {
  return `
    <tr data-client-bill-item>
      <td><input data-client-bill-field="siNo" type="text" value="${escapeHtml(item.siNo || index + 1)}"></td>
      <td><input data-client-bill-field="description" type="text" value="${escapeHtml(item.description || "")}"></td>
      <td><input data-client-bill-field="unit" type="text" value="${escapeHtml(item.unit || "")}"></td>
      <td><input data-client-bill-field="boqQty" type="number" step="any" value="${escapeHtml(item.boqQty ?? "")}"></td>
      <td><input data-client-bill-field="boqRate" type="number" step="any" value="${escapeHtml(item.boqRate ?? "")}"></td>
      <td><input data-client-bill-field="previousQty" type="number" step="any" value="${escapeHtml(item.previousQty ?? 0)}"></td>
      <td><input data-client-bill-field="thisBillQty" type="number" step="any" value="${escapeHtml(item.thisBillQty ?? "")}"></td>
      <td><input data-client-bill-field="cumulativeQty" type="number" step="any" value="${escapeHtml(item.cumulativeQty ?? 0)}" readonly></td>
      <td><input data-client-bill-field="previousAmount" type="number" step="any" value="${escapeHtml(item.previousAmount ?? 0)}" readonly></td>
      <td><input data-client-bill-field="thisBillAmount" type="number" step="any" value="${escapeHtml(item.thisBillAmount ?? 0)}" readonly></td>
      <td><input data-client-bill-field="cumulativeAmount" type="number" step="any" value="${escapeHtml(item.cumulativeAmount ?? 0)}" readonly></td>
      <td><button class="icon-mini-btn" type="button" data-remove-client-bill-item aria-label="Remove item">x</button></td>
    </tr>
  `;
}

function subcontractorBillSheetMarkup(record = null) {
  const value = (name, type = "") => record ? record[name] ?? "" : defaultFormValue("subcontractorBill", name, type);
  const projectOptions = [`<option value="">Unassigned</option>`].concat(state.projects.map((project) => `<option value="${project.id}" ${value("projectId") === project.id ? "selected" : ""}>${escapeHtml(project.code)} - ${escapeHtml(project.name)}</option>`));
  const workOrderOptions = state.workOrders.map((order) => `<option value="${escapeHtml(order.workOrderNo)}" ${value("workOrderNo") === order.workOrderNo ? "selected" : ""}>${escapeHtml(`${order.workOrderNo} | ${projectName(order.projectId)} | ${order.subcontractor}`)}</option>`);
  const contractorOptions = masterOptions("master:masterContractors:name", value("subcontractor"));
  const statusOptions = ["Draft", "Approved", "Issued", "Closed", "Suspended"].map((status) => `<option value="${status}" ${value("status") === status ? "selected" : ""}>${status}</option>`);
  const items = subcontractorBillItems(record);
  while (items.length < 2) items.push(blankSubcontractorBillItem(items.length));
  return `
    <input type="hidden" name="items" id="subcontractorBillItemsJson" value="">
    <input type="hidden" name="previousAmount">
    <input type="hidden" name="cumulativeAmount">
    <input type="hidden" name="cgstRate" value="${escapeHtml(value("cgstRate") || 9)}">
    <input type="hidden" name="sgstRate" value="${escapeHtml(value("sgstRate") || 9)}">
    <input type="hidden" name="tdsRate" value="${escapeHtml(value("tdsRate") || 1)}">
    <input type="hidden" name="retentionRate" value="${escapeHtml(value("retentionRate") || 5)}">
    <div class="work-order-sheet">
      <div class="sheet-title">For Sub Contractor Bill</div>
      <div class="sheet-meta">
        <label><span>Project :</span><select name="projectId" required>${projectOptions.join("")}</select></label>
        <label><span>Work Order No</span><select name="workOrderNo" required>${selectPlaceholder("Work Order No", value("workOrderNo"))}${workOrderOptions.join("")}</select></label>
        <label><span>Sub Contractor Name</span><select name="subcontractor" required>${selectPlaceholder("Sub Contractor Name", value("subcontractor"))}${contractorOptions.join("")}</select></label>
        <label><span>RA Bill No</span><input name="raBillNo" type="text" value="${escapeHtml(value("raBillNo"))}" required></label>
        <label></label>
        <label><span>RA Bill Date</span><input name="raBillDate" type="date" value="${escapeHtml(value("raBillDate", "date"))}" required></label>
      </div>
      <div class="work-order-grid-wrap">
        <table class="work-order-entry-table subcontractor-bill-table">
          <thead>
            <tr>
              <th>SI No</th>
              <th>Description Of Work</th>
              <th>Unit</th>
              <th>WO Qty</th>
              <th>WO Rate</th>
              <th>Previous Qty</th>
              <th>This Bill Qty</th>
              <th>Cumulative Qty</th>
              <th>Previous Amount</th>
              <th>This Bill Amount</th>
              <th>Cumulative Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="subcontractorBillItemRows">
            ${items.map((item, index) => subcontractorBillItemRowMarkup(item, index)).join("")}
          </tbody>
          <tfoot>
            <tr><td colspan="8">Total =</td><td><input name="previousAmountDisplay" type="number" step="any" readonly></td><td><input name="amount" type="number" step="any" readonly></td><td><input name="cumulativeAmountDisplay" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="8">CGST (9%) =</td><td></td><td><input name="cgst" type="number" step="any" readonly></td><td><input name="cumulativeCgst" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="8">SGST (9%) =</td><td></td><td><input name="sgst" type="number" step="any" readonly></td><td><input name="cumulativeSgst" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="8">Total GST Amount =</td><td></td><td><input name="gst" type="number" step="any" readonly></td><td><input name="cumulativeGst" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="8">Gross Bill Value</td><td></td><td><input name="grossBillValue" type="number" step="any" readonly></td><td><input name="cumulativeGrossBillValue" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="8">TDS (1%) =</td><td></td><td><input name="tds" type="number" step="any" readonly></td><td><input name="cumulativeTds" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="8">RETENTION (5%) =</td><td></td><td><input name="retention" type="number" step="any" readonly></td><td><input name="cumulativeRetention" type="number" step="any" readonly></td><td></td></tr>
            <tr><td colspan="8">Net Payable =</td><td></td><td><input name="netPayable" type="number" step="any" readonly></td><td><input name="cumulativeNetPayable" type="number" step="any" readonly></td><td></td></tr>
          </tfoot>
        </table>
      </div>
      <button class="small-btn add-line-btn" id="addSubcontractorBillItem" type="button">Add Item in RA Bill</button>
      <div class="sheet-footer-grid">
        <label><span>RA Bill Status</span><select name="status">${statusOptions.join("")}</select></label>
        <label class="full"><span>Remarks:</span><textarea name="remarks">${escapeHtml(value("remarks"))}</textarea></label>
      </div>
      <div class="sheet-note">If GST is not applicable in the linked work order, gross bill value will equal the direct total amount.</div>
      <div class="form-actions">
        <button class="ghost-btn" id="cancelForm" type="button">Cancel</button>
        <button class="primary-btn" type="submit">Save subcontractor bill</button>
      </div>
    </div>
  `;
}

function subcontractorBillItemRowMarkup(item, index) {
  return `
    <tr data-subcontractor-bill-item>
      <td><input data-bill-item-field="siNo" type="text" value="${escapeHtml(item.siNo || index + 1)}"></td>
      <td><input data-bill-item-field="description" type="text" value="${escapeHtml(item.description || "")}"></td>
      <td><input data-bill-item-field="unit" type="text" value="${escapeHtml(item.unit || "")}"></td>
      <td><input data-bill-item-field="woQty" type="number" step="any" value="${escapeHtml(item.woQty ?? "")}" readonly></td>
      <td><input data-bill-item-field="woRate" type="number" step="any" value="${escapeHtml(item.woRate ?? "")}" readonly></td>
      <td><input data-bill-item-field="previousQty" type="number" step="any" value="${escapeHtml(item.previousQty ?? 0)}"></td>
      <td><input data-bill-item-field="thisBillQty" type="number" step="any" value="${escapeHtml(item.thisBillQty ?? "")}"></td>
      <td><input data-bill-item-field="cumulativeQty" type="number" step="any" value="${escapeHtml(item.cumulativeQty ?? 0)}" readonly></td>
      <td><input data-bill-item-field="previousAmount" type="number" step="any" value="${escapeHtml(item.previousAmount ?? 0)}" readonly></td>
      <td><input data-bill-item-field="thisBillAmount" type="number" step="any" value="${escapeHtml(item.thisBillAmount ?? 0)}" readonly></td>
      <td><input data-bill-item-field="cumulativeAmount" type="number" step="any" value="${escapeHtml(item.cumulativeAmount ?? 0)}" readonly></td>
      <td><button class="icon-mini-btn" type="button" data-remove-subcontractor-bill-item aria-label="Remove item">x</button></td>
    </tr>
  `;
}

function fieldMarkup(name, label, type, required, value = "") {
  const requiredAttr = required ? "required" : "";
  if (type === "textarea") {
    return `<div class="form-field full"><label for="${name}">${label}</label><textarea id="${name}" name="${name}" ${requiredAttr}>${escapeHtml(value)}</textarea></div>`;
  }
  if (type === "project") {
    const options = [`<option value="">Unassigned</option>`].concat(state.projects.map((project) => `<option value="${project.id}" ${value === project.id ? "selected" : ""}>${escapeHtml(project.code)} - ${escapeHtml(project.name)}</option>`));
    return `<div class="form-field"><label for="${name}">${label}</label><select id="${name}" name="${name}" ${requiredAttr}>${options.join("")}</select></div>`;
  }
  if (type === "bill") {
    const options = state.bills.map((bill) => `<option value="${escapeHtml(bill.billNo)}" ${value === bill.billNo ? "selected" : ""}>${escapeHtml(`${bill.billNo} | ${projectName(bill.projectId)}`)}</option>`);
    return `<div class="form-field"><label for="${name}">${label}</label><select id="${name}" name="${name}" ${requiredAttr}>${selectPlaceholder(label, value)}${options.join("")}</select></div>`;
  }
  if (type === "contractorBill") {
    const options = state.contractorBills.map((bill) => `<option value="${escapeHtml(bill.billNo)}" ${value === bill.billNo ? "selected" : ""}>${escapeHtml(`${bill.billNo} | ${projectName(bill.projectId)} | ${bill.contractor}`)}</option>`);
    return `<div class="form-field"><label for="${name}">${label}</label><select id="${name}" name="${name}" ${requiredAttr}>${selectPlaceholder(label, value)}${options.join("")}</select></div>`;
  }
  if (type === "subcontractorBill") {
    const options = state.subcontractorBills.map((bill) => `<option value="${escapeHtml(bill.raBillNo)}" ${value === bill.raBillNo ? "selected" : ""}>${escapeHtml(`${bill.raBillNo} | ${projectName(bill.projectId)} | ${bill.subcontractor}`)}</option>`);
    return `<div class="form-field"><label for="${name}">${label}</label><select id="${name}" name="${name}" ${requiredAttr}>${selectPlaceholder(label, value)}${options.join("")}</select></div>`;
  }
  if (type.startsWith("select:")) {
    const options = type.replace("select:", "").split("|").map((option) => `<option value="${option}" ${value === option ? "selected" : ""}>${option}</option>`);
    return `<div class="form-field"><label for="${name}">${label}</label><select id="${name}" name="${name}" ${requiredAttr}>${options.join("")}</select></div>`;
  }
  if (type.startsWith("master:")) {
    const options = masterOptions(type, value);
    return `<div class="form-field"><label for="${name}">${label}</label><select id="${name}" name="${name}" ${requiredAttr}>${selectPlaceholder(label, value)}${options.join("")}</select></div>`;
  }
  if (type === "readonlyNumber") {
    return `<div class="form-field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="number" step="any" value="${escapeHtml(value)}" readonly></div>`;
  }
  const stepAttr = type === "number" ? ` step="any"` : "";
  return `<div class="form-field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}"${stepAttr} value="${escapeHtml(value)}" ${requiredAttr}></div>`;
}

function selectPlaceholder(label, value) {
  return `<option value="" ${value ? "" : "selected"}>${escapeHtml(`Select ${label}`)}</option>`;
}

function masterOptions(type, value) {
  const [, collection, fieldAndDefaults] = type.split(":");
  const [field, ...defaults] = fieldAndDefaults.split("|");
  const values = new Set();
  (state[collection] || []).forEach((item) => {
    if (item[field]) values.add(item[field]);
  });
  defaults.forEach((item) => {
    if (item) values.add(item);
  });
  if (value) values.add(value);
  const options = [];
  Array.from(values).sort((a, b) => String(a).localeCompare(String(b))).forEach((item) => {
    options.push(`<option value="${escapeHtml(item)}" ${value === item ? "selected" : ""}>${escapeHtml(item)}</option>`);
  });
  return options;
}

function bindMasterAutofill(formKey) {
  const materialInput = $("#recordForm [name='material'], #recordForm [name='item']");
  if (!materialInput || !["purchase", "inventory", "grn", "issue"].includes(formKey)) return;
  const applyMaterialDefaults = () => {
    const material = state.masterMaterials.find((item) => item.name === materialInput.value);
    if (!material) return;
    setEmptyFormValue("category", material.category);
    setEmptyFormValue("unit", material.unit);
    setEmptyFormValue("minimum", material.minimumStock);
    setEmptyFormValue("gst", material.gstRate);
  };
  materialInput.addEventListener("input", applyMaterialDefaults);
  materialInput.addEventListener("change", applyMaterialDefaults);
}

function bindWorkOrderCalculation(formKey) {
  if (formKey !== "workOrder" && formKey !== "boq") return;
  const form = $("#recordForm");
  if (!form.dataset.workOrderEventsBound) {
    form.addEventListener("input", (event) => {
      if (event.target.closest(".work-order-sheet")) recalcWorkOrderSheet();
    });
    form.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-work-order-item]");
      if (removeButton) {
        const row = removeButton.closest("[data-work-order-item]");
        if ($$("#workOrderItemRows [data-work-order-item]").length > 1) row.remove();
        recalcWorkOrderSheet();
      }
      if (event.target.id === "addWorkOrderItem") {
        const nextIndex = $$("#workOrderItemRows [data-work-order-item]").length;
        $("#workOrderItemRows").insertAdjacentHTML("beforeend", workOrderItemRowMarkup({ siNo: nextIndex + 1 }, nextIndex));
        recalcWorkOrderSheet();
      }
    });
    form.dataset.workOrderEventsBound = "true";
  }
  recalcWorkOrderSheet();
}

function recalcWorkOrderSheet() {
  const form = $("#recordForm");
  if (!form?.querySelector(".work-order-sheet")) return;
  const items = readWorkOrderItemsFromForm();
  const amount = items.reduce((sum, item) => sum + num(item.amount), 0);
  const cgstRate = num(form.elements.cgstRate?.value || 9);
  const sgstRate = num(form.elements.sgstRate?.value || 9);
  const gstApplicable = form.elements.gstApplicable?.checked !== false;
  const cgst = gstApplicable ? amount * cgstRate / 100 : 0;
  const sgst = gstApplicable ? amount * sgstRate / 100 : 0;
  const gst = cgst + sgst;
  const totalWorkOrderValue = amount + gst;
  const tds = totalWorkOrderValue * num(form.elements.tdsRate?.value || 1) / 100;
  const retention = totalWorkOrderValue * num(form.elements.retentionRate?.value || 5) / 100;
  const netAmount = totalWorkOrderValue - tds - retention;
  form.elements.items.value = JSON.stringify(items);
  setFormNumber("amount", amount);
  setFormNumber("cgst", cgst);
  setFormNumber("sgst", sgst);
  if (form.elements.gstRate) form.elements.gstRate.value = cgstRate + sgstRate;
  setFormNumber("gst", gst);
  setFormNumber("totalWorkOrderValue", totalWorkOrderValue);
  setFormNumber("tds", tds);
  setFormNumber("retention", retention);
  setFormNumber("netAmount", netAmount);
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
  return [
    { siNo: "1", description: "", unit: "", quantity: "", rate: "", amount: 0 },
    { siNo: "2", description: "", unit: "", quantity: "", rate: "", amount: 0 }
  ];
}

function readWorkOrderItemsFromForm() {
  return $$("#workOrderItemRows [data-work-order-item]").map((row, index) => {
    const value = (field) => row.querySelector(`[data-item-field='${field}']`)?.value || "";
    const quantity = num(value("quantity"));
    const rate = num(value("rate"));
    const amount = quantity * rate;
    const amountInput = row.querySelector("[data-item-field='amount']");
    if (amountInput) amountInput.value = Number(amount.toFixed(2));
    return {
      siNo: value("siNo") || String(index + 1),
      description: value("description"),
      unit: value("unit"),
      quantity,
      rate,
      amount
    };
  }).filter((item) => item.description || item.unit || item.quantity || item.rate || item.amount);
}

function blankClientBillItem(index = 0) {
  return {
    siNo: String(index + 1),
    description: "",
    unit: "",
    boqQty: "",
    boqRate: "",
    previousQty: 0,
    thisBillQty: "",
    cumulativeQty: 0,
    previousAmount: 0,
    thisBillAmount: 0,
    cumulativeAmount: 0
  };
}

function clientBillItems(record = null) {
  if (Array.isArray(record?.items) && record.items.length) return record.items;
  if (record?.amount || record?.billNo) {
    return [{
      siNo: "1",
      description: record.billType || "Client bill",
      unit: "Nos",
      boqQty: "",
      boqRate: "",
      previousQty: 0,
      thisBillQty: 1,
      cumulativeQty: 1,
      previousAmount: 0,
      thisBillAmount: num(record.amount),
      cumulativeAmount: num(record.amount)
    }];
  }
  return [];
}

function bindClientBillCalculation(formKey) {
  if (formKey !== "bill") return;
  const form = $("#recordForm");
  if (!form.dataset.clientBillEventsBound) {
    form.addEventListener("input", (event) => {
      if (event.target.closest(".work-order-sheet")) recalcClientBillSheet();
    });
    form.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-client-bill-item]");
      if (removeButton) {
        const row = removeButton.closest("[data-client-bill-item]");
        if ($$("#clientBillItemRows [data-client-bill-item]").length > 1) row.remove();
        recalcClientBillSheet();
      }
      if (event.target.id === "addClientBillItem") {
        const nextIndex = $$("#clientBillItemRows [data-client-bill-item]").length;
        $("#clientBillItemRows").insertAdjacentHTML("beforeend", clientBillItemRowMarkup(blankClientBillItem(nextIndex), nextIndex));
        recalcClientBillSheet();
      }
    });
    form.dataset.clientBillEventsBound = "true";
  }
  recalcClientBillSheet();
}

function recalcClientBillSheet() {
  const form = $("#recordForm");
  if (!form?.querySelector("#clientBillItemRows")) return;
  const items = readClientBillItemsFromForm();
  const previousAmount = items.reduce((sum, item) => sum + num(item.previousAmount), 0);
  const amount = items.reduce((sum, item) => sum + num(item.thisBillAmount), 0);
  const cumulativeAmount = items.reduce((sum, item) => sum + num(item.cumulativeAmount), 0);
  const cgstRate = num(form.elements.cgstRate?.value || 9);
  const sgstRate = num(form.elements.sgstRate?.value || 9);
  const tdsRate = num(form.elements.tdsRate?.value || 1);
  const retentionRate = num(form.elements.retentionRate?.value || 5);
  const cgst = amount * cgstRate / 100;
  const sgst = amount * sgstRate / 100;
  const cumulativeCgst = cumulativeAmount * cgstRate / 100;
  const cumulativeSgst = cumulativeAmount * sgstRate / 100;
  const gst = cgst + sgst;
  const cumulativeGst = cumulativeCgst + cumulativeSgst;
  const grossBillValue = amount + gst;
  const cumulativeGrossBillValue = cumulativeAmount + cumulativeGst;
  const tds = grossBillValue * tdsRate / 100;
  const retention = grossBillValue * retentionRate / 100;
  const cumulativeTds = cumulativeGrossBillValue * tdsRate / 100;
  const cumulativeRetention = cumulativeGrossBillValue * retentionRate / 100;
  form.elements.items.value = JSON.stringify(items);
  form.elements.previousAmount.value = previousAmount;
  form.elements.cumulativeAmount.value = cumulativeAmount;
  setFormNumber("previousAmountDisplay", previousAmount);
  setFormNumber("amount", amount);
  setFormNumber("cumulativeAmountDisplay", cumulativeAmount);
  setFormNumber("cgst", cgst);
  setFormNumber("sgst", sgst);
  setFormNumber("gst", gst);
  setFormNumber("grossBillValue", grossBillValue);
  setFormNumber("tds", tds);
  setFormNumber("retention", retention);
  setFormNumber("netPayable", grossBillValue - tds - retention);
  setFormNumber("cumulativeCgst", cumulativeCgst);
  setFormNumber("cumulativeSgst", cumulativeSgst);
  setFormNumber("cumulativeGst", cumulativeGst);
  setFormNumber("cumulativeGrossBillValue", cumulativeGrossBillValue);
  setFormNumber("cumulativeTds", cumulativeTds);
  setFormNumber("cumulativeRetention", cumulativeRetention);
  setFormNumber("cumulativeNetPayable", cumulativeGrossBillValue - cumulativeTds - cumulativeRetention);
}

function readClientBillItemsFromForm() {
  return $$("#clientBillItemRows [data-client-bill-item]").map((row, index) => {
    const value = (field) => row.querySelector(`[data-client-bill-field='${field}']`)?.value || "";
    const boqRate = num(value("boqRate"));
    const previousQty = num(value("previousQty"));
    const thisBillQty = num(value("thisBillQty"));
    const cumulativeQty = previousQty + thisBillQty;
    const previousAmount = previousQty * boqRate;
    const thisBillAmount = thisBillQty * boqRate;
    const cumulativeAmount = cumulativeQty * boqRate;
    ["cumulativeQty", "previousAmount", "thisBillAmount", "cumulativeAmount"].forEach((field) => {
      const input = row.querySelector(`[data-client-bill-field='${field}']`);
      if (input) input.value = Number(({ cumulativeQty, previousAmount, thisBillAmount, cumulativeAmount })[field].toFixed(2));
    });
    return {
      siNo: value("siNo") || String(index + 1),
      description: value("description"),
      unit: value("unit"),
      boqQty: num(value("boqQty")),
      boqRate,
      previousQty,
      thisBillQty,
      cumulativeQty,
      previousAmount,
      thisBillAmount,
      cumulativeAmount
    };
  }).filter((item) => item.description || item.unit || item.boqQty || item.boqRate || item.thisBillQty || item.previousQty);
}

function blankSubcontractorBillItem(index = 0) {
  return {
    siNo: String(index + 1),
    description: "",
    unit: "",
    woQty: "",
    woRate: "",
    previousQty: 0,
    thisBillQty: "",
    cumulativeQty: 0,
    previousAmount: 0,
    thisBillAmount: 0,
    cumulativeAmount: 0
  };
}

function subcontractorBillItems(record = null) {
  if (Array.isArray(record?.items) && record.items.length) return record.items;
  return [];
}

function workOrderByNo(no) {
  return state.workOrders.find((item) => item.workOrderNo === no);
}

function previousSubcontractorBillRows(projectId, subcontractor, workOrderNo, excludeId = null) {
  return state.subcontractorBills.filter((bill) =>
    bill.id !== excludeId
    && bill.projectId === projectId
    && bill.subcontractor === subcontractor
    && bill.workOrderNo === workOrderNo
  ).flatMap((bill) => subcontractorBillItems(bill));
}

function bindSubcontractorBillCalculation(formKey) {
  if (formKey !== "subcontractorBill") return;
  const form = $("#recordForm");
  if (!form.dataset.subcontractorBillEventsBound) {
    form.addEventListener("input", (event) => {
      if (event.target.name === "workOrderNo") applyWorkOrderToSubcontractorBill();
      if (event.target.closest(".work-order-sheet")) recalcSubcontractorBillSheet();
    });
    form.addEventListener("change", (event) => {
      if (event.target.name === "workOrderNo") applyWorkOrderToSubcontractorBill();
      if (event.target.closest(".work-order-sheet")) recalcSubcontractorBillSheet();
    });
    form.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-subcontractor-bill-item]");
      if (removeButton) {
        const row = removeButton.closest("[data-subcontractor-bill-item]");
        if ($$("#subcontractorBillItemRows [data-subcontractor-bill-item]").length > 1) row.remove();
        recalcSubcontractorBillSheet();
      }
      if (event.target.id === "addSubcontractorBillItem") {
        const nextIndex = $$("#subcontractorBillItemRows [data-subcontractor-bill-item]").length;
        $("#subcontractorBillItemRows").insertAdjacentHTML("beforeend", subcontractorBillItemRowMarkup(blankSubcontractorBillItem(nextIndex), nextIndex));
        recalcSubcontractorBillSheet();
      }
    });
    form.dataset.subcontractorBillEventsBound = "true";
  }
  applyWorkOrderToSubcontractorBill(false);
  recalcSubcontractorBillSheet();
}

function applyWorkOrderToSubcontractorBill(replaceRows = true) {
  const form = $("#recordForm");
  const order = workOrderByNo(form.elements.workOrderNo?.value);
  if (!order) return;
  if (form.elements.projectId) form.elements.projectId.value = order.projectId || "";
  if (form.elements.subcontractor) form.elements.subcontractor.value = order.subcontractor || "";
  const existingRows = readSubcontractorBillItemsFromForm();
  if (!replaceRows && existingRows.some((item) => item.description || item.woQty || item.woRate || item.thisBillQty)) return;
  const previousRows = previousSubcontractorBillRows(order.projectId, order.subcontractor, order.workOrderNo, currentEdit?.id);
  const rows = workOrderItems(order).map((item, index) => {
    const previousQty = previousRows
      .filter((row) => (row.siNo || "") === (item.siNo || String(index + 1)))
      .reduce((sum, row) => sum + num(row.thisBillQty), 0);
    const woRate = num(item.rate);
    return {
      siNo: item.siNo || String(index + 1),
      description: item.description || "",
      unit: item.unit || "",
      woQty: num(item.quantity),
      woRate,
      previousQty,
      thisBillQty: "",
      cumulativeQty: previousQty,
      previousAmount: previousQty * woRate,
      thisBillAmount: 0,
      cumulativeAmount: previousQty * woRate
    };
  });
  $("#subcontractorBillItemRows").innerHTML = rows.map((item, index) => subcontractorBillItemRowMarkup(item, index)).join("");
}

function recalcSubcontractorBillSheet() {
  const form = $("#recordForm");
  if (!form?.querySelector("#subcontractorBillItemRows")) return;
  const order = workOrderByNo(form.elements.workOrderNo?.value);
  const gstApplicable = order ? isGstApplicable(order) : true;
  const items = readSubcontractorBillItemsFromForm();
  const previousAmount = items.reduce((sum, item) => sum + num(item.previousAmount), 0);
  const amount = items.reduce((sum, item) => sum + num(item.thisBillAmount), 0);
  const cumulativeAmount = items.reduce((sum, item) => sum + num(item.cumulativeAmount), 0);
  const cgstRate = num(form.elements.cgstRate?.value || 9);
  const sgstRate = num(form.elements.sgstRate?.value || 9);
  const tdsRate = num(form.elements.tdsRate?.value || 1);
  const retentionRate = num(form.elements.retentionRate?.value || 5);
  const cgst = gstApplicable ? amount * cgstRate / 100 : 0;
  const sgst = gstApplicable ? amount * sgstRate / 100 : 0;
  const cumulativeCgst = gstApplicable ? cumulativeAmount * cgstRate / 100 : 0;
  const cumulativeSgst = gstApplicable ? cumulativeAmount * sgstRate / 100 : 0;
  const gst = cgst + sgst;
  const cumulativeGst = cumulativeCgst + cumulativeSgst;
  const grossBillValue = amount + gst;
  const cumulativeGrossBillValue = cumulativeAmount + cumulativeGst;
  const tds = grossBillValue * tdsRate / 100;
  const retention = grossBillValue * retentionRate / 100;
  const cumulativeTds = cumulativeGrossBillValue * tdsRate / 100;
  const cumulativeRetention = cumulativeGrossBillValue * retentionRate / 100;
  form.elements.items.value = JSON.stringify(items);
  form.elements.previousAmount.value = previousAmount;
  form.elements.cumulativeAmount.value = cumulativeAmount;
  setFormNumber("previousAmountDisplay", previousAmount);
  setFormNumber("amount", amount);
  setFormNumber("cumulativeAmountDisplay", cumulativeAmount);
  setFormNumber("cgst", cgst);
  setFormNumber("sgst", sgst);
  setFormNumber("gst", gst);
  setFormNumber("grossBillValue", grossBillValue);
  setFormNumber("tds", tds);
  setFormNumber("retention", retention);
  setFormNumber("netPayable", grossBillValue - tds - retention);
  setFormNumber("cumulativeCgst", cumulativeCgst);
  setFormNumber("cumulativeSgst", cumulativeSgst);
  setFormNumber("cumulativeGst", cumulativeGst);
  setFormNumber("cumulativeGrossBillValue", cumulativeGrossBillValue);
  setFormNumber("cumulativeTds", cumulativeTds);
  setFormNumber("cumulativeRetention", cumulativeRetention);
  setFormNumber("cumulativeNetPayable", cumulativeGrossBillValue - cumulativeTds - cumulativeRetention);
}

function readSubcontractorBillItemsFromForm() {
  return $$("#subcontractorBillItemRows [data-subcontractor-bill-item]").map((row, index) => {
    const value = (field) => row.querySelector(`[data-bill-item-field='${field}']`)?.value || "";
    const woRate = num(value("woRate"));
    const previousQty = num(value("previousQty"));
    const thisBillQty = num(value("thisBillQty"));
    const cumulativeQty = previousQty + thisBillQty;
    const previousAmount = previousQty * woRate;
    const thisBillAmount = thisBillQty * woRate;
    const cumulativeAmount = cumulativeQty * woRate;
    ["cumulativeQty", "previousAmount", "thisBillAmount", "cumulativeAmount"].forEach((field) => {
      const input = row.querySelector(`[data-bill-item-field='${field}']`);
      if (input) input.value = Number(({ cumulativeQty, previousAmount, thisBillAmount, cumulativeAmount })[field].toFixed(2));
    });
    return {
      siNo: value("siNo") || String(index + 1),
      description: value("description"),
      unit: value("unit"),
      woQty: num(value("woQty")),
      woRate,
      previousQty,
      thisBillQty,
      cumulativeQty,
      previousAmount,
      thisBillAmount,
      cumulativeAmount
    };
  }).filter((item) => item.description || item.unit || item.woQty || item.woRate || item.thisBillQty || item.previousQty);
}

function bindContractorBillCalculation(formKey) {
  if (formKey !== "contractorBill") return;
  const form = $("#recordForm");
  const names = ["workDone", "extraClaims", "debitNote", "creditNote", "retention", "tds", "securityDeposit"];
  const update = () => {
    const grossBillValue = num(form.elements.workDone?.value)
      + num(form.elements.extraClaims?.value)
      + num(form.elements.creditNote?.value)
      - num(form.elements.debitNote?.value);
    const netPayable = grossBillValue
      - num(form.elements.retention?.value)
      - num(form.elements.tds?.value)
      - num(form.elements.securityDeposit?.value);
    setFormNumber("grossBillValue", Math.max(0, grossBillValue));
    setFormNumber("netPayable", Math.max(0, netPayable));
  };
  names.forEach((name) => {
    const input = form.elements[name];
    if (!input) return;
    input.addEventListener("input", update);
    input.addEventListener("change", update);
  });
  update();
}

function setFormNumber(name, value) {
  const input = $(`#recordForm [name='${name}']`);
  if (input) input.value = Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
}

function enrichClientBill(data) {
  let items = [];
  try {
    items = Array.isArray(data.items) ? data.items : JSON.parse(data.items || "[]");
  } catch {
    items = [];
  }
  items = items.map((item, index) => {
    const boqRate = num(item.boqRate);
    const previousQty = num(item.previousQty);
    const thisBillQty = num(item.thisBillQty);
    const cumulativeQty = previousQty + thisBillQty;
    return {
      siNo: item.siNo || String(index + 1),
      description: item.description || "",
      unit: item.unit || "",
      boqQty: num(item.boqQty),
      boqRate,
      previousQty,
      thisBillQty,
      cumulativeQty,
      previousAmount: previousQty * boqRate,
      thisBillAmount: thisBillQty * boqRate,
      cumulativeAmount: cumulativeQty * boqRate
    };
  }).filter((item) => item.description || item.unit || item.boqQty || item.boqRate || item.thisBillQty || item.previousQty);
  const amount = items.reduce((sum, item) => sum + num(item.thisBillAmount), 0);
  const previousAmount = items.reduce((sum, item) => sum + num(item.previousAmount), 0);
  const cumulativeAmount = items.reduce((sum, item) => sum + num(item.cumulativeAmount), 0);
  const cgstRate = data.cgstRate === "" || data.cgstRate === undefined ? 9 : num(data.cgstRate);
  const sgstRate = data.sgstRate === "" || data.sgstRate === undefined ? 9 : num(data.sgstRate);
  const tdsRate = data.tdsRate === "" || data.tdsRate === undefined ? 1 : num(data.tdsRate);
  const retentionRate = data.retentionRate === "" || data.retentionRate === undefined ? 5 : num(data.retentionRate);
  const cgst = amount * cgstRate / 100;
  const sgst = amount * sgstRate / 100;
  const gst = cgst + sgst;
  const grossBillValue = amount + gst;
  const tds = grossBillValue * tdsRate / 100;
  const retention = grossBillValue * retentionRate / 100;
  data.items = items;
  data.previousAmount = previousAmount;
  data.amount = amount;
  data.cumulativeAmount = cumulativeAmount;
  data.cgstRate = cgstRate;
  data.sgstRate = sgstRate;
  data.gstRate = cgstRate + sgstRate;
  data.tdsRate = tdsRate;
  data.retentionRate = retentionRate;
  data.cgst = cgst;
  data.sgst = sgst;
  data.gst = gst;
  data.grossBillValue = grossBillValue;
  data.tds = tds;
  data.retention = retention;
  data.netPayable = grossBillValue - tds - retention;
}

function enrichWorkOrder(data) {
  let items = [];
  try {
    items = Array.isArray(data.items) ? data.items : JSON.parse(data.items || "[]");
  } catch {
    items = [];
  }
  items = items.map((item, index) => ({
    siNo: item.siNo || String(index + 1),
    description: item.description || "",
    unit: item.unit || "",
    quantity: num(item.quantity),
    rate: num(item.rate),
    amount: num(item.quantity) * num(item.rate)
  })).filter((item) => item.description || item.unit || item.quantity || item.rate || item.amount);
  const amount = items.reduce((sum, item) => sum + num(item.amount), 0);
  const cgstRate = data.cgstRate === "" || data.cgstRate === undefined ? 9 : num(data.cgstRate);
  const sgstRate = data.sgstRate === "" || data.sgstRate === undefined ? 9 : num(data.sgstRate);
  const gstRate = cgstRate + sgstRate;
  const tdsRate = data.tdsRate === "" || data.tdsRate === undefined ? 1 : num(data.tdsRate);
  const retentionRate = data.retentionRate === "" || data.retentionRate === undefined ? 5 : num(data.retentionRate);
  data.gstApplicable = data.gstApplicable === "true";
  const cgst = data.gstApplicable ? amount * cgstRate / 100 : 0;
  const sgst = data.gstApplicable ? amount * sgstRate / 100 : 0;
  const gst = cgst + sgst;
  const totalWorkOrderValue = amount + gst;
  const tds = totalWorkOrderValue * tdsRate / 100;
  const retention = totalWorkOrderValue * retentionRate / 100;
  const firstItem = items[0] || {};
  data.items = items;
  data.siNo = items.map((item) => item.siNo).filter(Boolean).join(", ");
  data.description = items.length > 1 ? `${items[0].description || "Work item"} + ${items.length - 1} more` : firstItem.description || "";
  data.unit = items.length === 1 ? firstItem.unit || "" : "";
  data.quantity = items.length === 1 ? num(firstItem.quantity) : items.reduce((sum, item) => sum + num(item.quantity), 0);
  data.rate = items.length === 1 ? num(firstItem.rate) : 0;
  data.cgstRate = cgstRate;
  data.sgstRate = sgstRate;
  data.gstRate = gstRate;
  data.tdsRate = tdsRate;
  data.retentionRate = retentionRate;
  data.amount = amount;
  data.cgst = cgst;
  data.sgst = sgst;
  data.gst = gst;
  data.totalWorkOrderValue = totalWorkOrderValue;
  data.tds = tds;
  data.retention = retention;
  data.netAmount = data.totalWorkOrderValue - tds - retention;
}

function enrichSubcontractorBill(data) {
  let items = [];
  try {
    items = Array.isArray(data.items) ? data.items : JSON.parse(data.items || "[]");
  } catch {
    items = [];
  }
  items = items.map((item, index) => {
    const woRate = num(item.woRate);
    const previousQty = num(item.previousQty);
    const thisBillQty = num(item.thisBillQty);
    const cumulativeQty = previousQty + thisBillQty;
    return {
      siNo: item.siNo || String(index + 1),
      description: item.description || "",
      unit: item.unit || "",
      woQty: num(item.woQty),
      woRate,
      previousQty,
      thisBillQty,
      cumulativeQty,
      previousAmount: previousQty * woRate,
      thisBillAmount: thisBillQty * woRate,
      cumulativeAmount: cumulativeQty * woRate
    };
  }).filter((item) => item.description || item.unit || item.woQty || item.woRate || item.thisBillQty || item.previousQty);
  const order = workOrderByNo(data.workOrderNo);
  const gstApplicable = order ? isGstApplicable(order) : true;
  const amount = items.reduce((sum, item) => sum + num(item.thisBillAmount), 0);
  const previousAmount = items.reduce((sum, item) => sum + num(item.previousAmount), 0);
  const cumulativeAmount = items.reduce((sum, item) => sum + num(item.cumulativeAmount), 0);
  const cgstRate = data.cgstRate === "" || data.cgstRate === undefined ? 9 : num(data.cgstRate);
  const sgstRate = data.sgstRate === "" || data.sgstRate === undefined ? 9 : num(data.sgstRate);
  const tdsRate = data.tdsRate === "" || data.tdsRate === undefined ? 1 : num(data.tdsRate);
  const retentionRate = data.retentionRate === "" || data.retentionRate === undefined ? 5 : num(data.retentionRate);
  const cgst = gstApplicable ? amount * cgstRate / 100 : 0;
  const sgst = gstApplicable ? amount * sgstRate / 100 : 0;
  const gst = cgst + sgst;
  const grossBillValue = amount + gst;
  const tds = grossBillValue * tdsRate / 100;
  const retention = grossBillValue * retentionRate / 100;
  data.items = items;
  data.previousAmount = previousAmount;
  data.amount = amount;
  data.cumulativeAmount = cumulativeAmount;
  data.cgstRate = cgstRate;
  data.sgstRate = sgstRate;
  data.tdsRate = tdsRate;
  data.retentionRate = retentionRate;
  data.gstApplicable = gstApplicable;
  data.cgst = cgst;
  data.sgst = sgst;
  data.gst = gst;
  data.grossBillValue = grossBillValue;
  data.tds = tds;
  data.retention = retention;
  data.netPayable = grossBillValue - tds - retention;
}

function enrichContractorBill(data) {
  const grossBillValue = Math.max(0, num(data.workDone) + num(data.extraClaims) + num(data.creditNote) - num(data.debitNote));
  const netPayable = Math.max(0, grossBillValue - num(data.retention) - num(data.tds) - num(data.securityDeposit));
  data.grossBillValue = grossBillValue;
  data.netPayable = netPayable;
}

function setEmptyFormValue(name, value) {
  const input = $(`#recordForm [name='${name}']`);
  if (input && !input.value && value !== undefined && value !== null && value !== "") {
    input.value = value;
  }
}

function closeModal() {
  currentEdit = null;
  $("#modal").classList.remove("active");
  $("#modal").setAttribute("aria-hidden", "true");
  $("#recordForm").innerHTML = "";
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!currentEdit) return;
  if (!event.target.checkValidity()) {
    event.target.reportValidity();
    showToast("Please complete the required fields.", "warn");
    return;
  }
  const { formKey, id } = currentEdit;
  const config = forms[formKey];
  const data = Object.fromEntries(new FormData(event.target).entries());
  config.fields.forEach(([name, , type]) => {
    if (type === "checkbox") data[name] = event.target.elements[name]?.checked ? "true" : "false";
  });
  config.fields.forEach(([name, , type]) => {
    if (!id && !data[name]) data[name] = defaultFormValue(formKey, name, type);
  });
  config.fields.forEach(([name, , type]) => {
    if (type === "number" || type === "readonlyNumber") data[name] = num(data[name]);
  });
  if (formKey === "bill") enrichClientBill(data);
  if (formKey === "bill" && !data.items.length) {
    showToast("Add at least one client bill item.", "warn");
    return;
  }
  if (formKey === "boq" || formKey === "workOrder") enrichWorkOrder(data);
  if ((formKey === "boq" || formKey === "workOrder") && !data.items.length) {
    showToast(`Add at least one ${formKey === "boq" ? "BOQ" : "work order"} item.`, "warn");
    return;
  }
  if (formKey === "subcontractorBill") enrichSubcontractorBill(data);
  if (formKey === "subcontractorBill" && !data.items.length) {
    showToast("Add at least one subcontractor bill item.", "warn");
    return;
  }
  const oldRecord = id ? state[config.collection].find((item) => item.id === id) : null;
  if (formKey === "clientPayment" && !canApplyClientPayment(data, oldRecord)) return;
  if (formKey === "contractorPayment" && !canApplyContractorPayment(data, oldRecord)) return;
  if (formKey === "issue" && !canApplyIssue(data, oldRecord)) return;
  if (id) {
    state[config.collection] = state[config.collection].map((item) => item.id === id ? { ...item, ...data } : item);
  } else {
    state[config.collection].push({ id: uid(), ...data, createdAt: new Date().toISOString() });
  }
  if (formKey === "grn") {
    if (oldRecord) applyGrnToInventory(oldRecord, -1);
    const savedRecord = id ? state.grns.find((item) => item.id === id) : state.grns[state.grns.length - 1];
    applyGrnToInventory(savedRecord, 1);
  }
  if (formKey === "issue") {
    if (oldRecord) applyIssueToInventory(oldRecord, -1);
    const savedRecord = id ? state.issues.find((item) => item.id === id) : state.issues[state.issues.length - 1];
    applyIssueToInventory(savedRecord, 1);
  }
  if (formKey === "clientPayment") {
    if (oldRecord) applyClientPaymentToBill(oldRecord, -1);
    const savedRecord = id ? state.clientPayments.find((item) => item.id === id) : state.clientPayments[state.clientPayments.length - 1];
    applyClientPaymentToBill(savedRecord, 1);
  }
  if (formKey === "subcontractorBill") {
    if (oldRecord) applySubcontractorBillToSummary(oldRecord, -1);
    const savedRecord = id ? state.subcontractorBills.find((item) => item.id === id) : state.subcontractorBills[state.subcontractorBills.length - 1];
    applySubcontractorBillToSummary(savedRecord, 1);
  }
  if (formKey === "contractorPayment") {
    if (oldRecord) applyContractorPaymentToBill(oldRecord, -1);
    const savedRecord = id ? state.contractorPayments.find((item) => item.id === id) : state.contractorPayments[state.contractorPayments.length - 1];
    applyContractorPaymentToBill(savedRecord, 1);
  }
  await saveData();
  closeModal();
  render();
  showToast(`${config.title.replace("Add ", "")} saved.`);
}

async function deleteRecord(formKey, id) {
  const config = forms[formKey];
  const ok = confirm("Delete this record permanently from the NomadicERP local database? Export a backup first if you are unsure.");
  if (!ok) return;
  if (formKey === "grn") {
    const oldRecord = state.grns.find((item) => item.id === id);
    if (oldRecord) applyGrnToInventory(oldRecord, -1);
  }
  if (formKey === "issue") {
    const oldRecord = state.issues.find((item) => item.id === id);
    if (oldRecord) applyIssueToInventory(oldRecord, -1);
  }
  if (formKey === "clientPayment") {
    const oldRecord = state.clientPayments.find((item) => item.id === id);
    if (oldRecord) applyClientPaymentToBill(oldRecord, -1);
  }
  if (formKey === "subcontractorBill") {
    const oldRecord = state.subcontractorBills.find((item) => item.id === id);
    if (oldRecord) applySubcontractorBillToSummary(oldRecord, -1);
  }
  if (formKey === "contractorPayment") {
    const oldRecord = state.contractorPayments.find((item) => item.id === id);
    if (oldRecord) applyContractorPaymentToBill(oldRecord, -1);
  }
  state[config.collection] = state[config.collection].filter((item) => item.id !== id);
  await saveData();
  render();
  showToast("Record deleted.");
}

function applyGrnToInventory(grn, direction) {
  if (!grn || !grn.projectId || !grn.material || grn.qualityStatus === "Rejected") return;
  const quantity = num(grn.quantity) * direction;
  let stock = state.inventory.find((item) => item.projectId === grn.projectId && item.item === grn.material);
  const materialMaster = state.masterMaterials.find((item) => item.name === grn.material);
  if (!stock) {
    stock = {
      id: uid(),
      projectId: grn.projectId,
      item: grn.material,
      category: grn.category || materialMaster?.category || "",
      unit: grn.unit || materialMaster?.unit || "",
      opening: 0,
      received: 0,
      issued: 0,
      minimum: num(materialMaster?.minimumStock),
      lastTxn: grn.receivedDate || todayISO(),
      notes: "Created from GRN"
    };
    state.inventory.push(stock);
  }
  stock.category = stock.category || grn.category || materialMaster?.category || "";
  stock.unit = stock.unit || grn.unit || materialMaster?.unit || "";
  stock.received = Math.max(0, num(stock.received) + quantity);
  stock.lastTxn = grn.receivedDate || stock.lastTxn || todayISO();
}

function canApplyIssue(issue, oldRecord) {
  if (!issue || !issue.projectId || !issue.material) return true;
  const stock = state.inventory.find((item) => item.projectId === issue.projectId && item.item === issue.material);
  const currentBalance = stock ? stockBalance(stock) : 0;
  const oldQty = oldRecord && oldRecord.projectId === issue.projectId && oldRecord.material === issue.material ? num(oldRecord.quantity) : 0;
  const availableForThisSave = currentBalance + oldQty;
  if (num(issue.quantity) <= availableForThisSave) return true;
  alert(`Stock warning: only ${availableForThisSave} ${issue.unit || ""} available for ${issue.material}. Issue quantity was not saved.`);
  return false;
}

function applyIssueToInventory(issue, direction) {
  if (!issue || !issue.projectId || !issue.material) return;
  const quantity = num(issue.quantity) * direction;
  let stock = state.inventory.find((item) => item.projectId === issue.projectId && item.item === issue.material);
  const materialMaster = state.masterMaterials.find((item) => item.name === issue.material);
  if (!stock) {
    stock = {
      id: uid(),
      projectId: issue.projectId,
      item: issue.material,
      category: issue.category || materialMaster?.category || "",
      unit: issue.unit || materialMaster?.unit || "",
      opening: 0,
      received: 0,
      issued: 0,
      minimum: num(materialMaster?.minimumStock),
      lastTxn: issue.issueDate || todayISO(),
      notes: "Created from material issue"
    };
    state.inventory.push(stock);
  }
  stock.category = stock.category || issue.category || materialMaster?.category || "";
  stock.unit = stock.unit || issue.unit || materialMaster?.unit || "";
  stock.issued = Math.max(0, num(stock.issued) + quantity);
  stock.lastTxn = issue.issueDate || stock.lastTxn || todayISO();
}

function findBillForPayment(payment) {
  return state.bills.find((bill) => bill.projectId === payment.projectId && bill.billNo === payment.billNo)
    || state.bills.find((bill) => bill.billNo === payment.billNo);
}

function canApplyClientPayment(payment, oldRecord) {
  const bill = findBillForPayment(payment);
  if (!bill) {
    alert("Bill number not found. Please create the client bill first or check the bill number.");
    return false;
  }
  const currentOutstanding = billOutstanding(bill);
  const oldImpact = oldRecord && findBillForPayment(oldRecord)?.id === bill.id
    ? num(oldRecord.amountReceived) + num(oldRecord.tdsDeducted) + num(oldRecord.retentionDeducted)
    : 0;
  const newImpact = num(payment.amountReceived) + num(payment.tdsDeducted) + num(payment.retentionDeducted);
  const available = currentOutstanding + oldImpact;
  if (newImpact <= available) return true;
  alert(`Payment exceeds outstanding. Available outstanding is ${money(available)}.`);
  return false;
}

function applyClientPaymentToBill(payment, direction) {
  const bill = findBillForPayment(payment);
  if (!bill) return;
  bill.received = Math.max(0, num(bill.received) + num(payment.amountReceived) * direction);
  bill.tds = Math.max(0, num(bill.tds) + num(payment.tdsDeducted) * direction);
  bill.retention = Math.max(0, num(bill.retention) + num(payment.retentionDeducted) * direction);
  if (billOutstanding(bill) <= 0) {
    bill.status = "Paid";
  } else if (direction > 0 && ["Draft", "Submitted", "Certified", "Approved"].includes(bill.status)) {
    bill.status = "Approved";
  }
}

function findSubcontractorForRecord(record) {
  const contractorName = record.contractor || record.subcontractor;
  if (record.projectId) {
    return state.subcontractors.find((item) => item.projectId === record.projectId && item.name === contractorName);
  }
  return state.subcontractors.find((item) => item.name === contractorName);
}

function findSubcontractorBillForPayment(payment) {
  return state.subcontractorBills.find((bill) => bill.projectId === payment.projectId && bill.subcontractor === payment.contractor && bill.raBillNo === payment.billNo)
    || state.subcontractorBills.find((bill) => bill.raBillNo === payment.billNo);
}

function applySubcontractorBillToSummary(bill, direction) {
  let contractor = findSubcontractorForRecord(bill);
  if (!contractor) {
    contractor = {
      id: uid(),
      projectId: bill.projectId,
      name: bill.subcontractor || "",
      workOrder: bill.workOrderNo || "",
      scope: "",
      agreementValue: 0,
      workDone: 0,
      billed: 0,
      paid: 0,
      retention: 0,
      status: "Bill Pending"
    };
    state.subcontractors.push(contractor);
  }
  contractor.workOrder = contractor.workOrder || bill.workOrderNo || "";
  contractor.workDone = Math.max(0, num(contractor.workDone) + subcontractorBillThisAmount(bill) * direction);
  contractor.billed = Math.max(0, num(contractor.billed) + subcontractorBillNet(bill) * direction);
  contractor.retention = Math.max(0, num(contractor.retention) + num(bill.retention) * direction);
  contractor.status = subcontractorBalance(contractor) > 0 ? "Payment Pending" : "Active";
}

function canApplyContractorPayment(payment, oldRecord) {
  const bill = findSubcontractorBillForPayment(payment);
  if (!bill) {
    alert("Subcontractor RA bill number not found. Please create the subcontractor bill first or check the RA bill number.");
    return false;
  }
  const currentOutstanding = subcontractorBillOutstanding(bill);
  const oldImpact = oldRecord && findSubcontractorBillForPayment(oldRecord)?.id === bill.id
    ? num(oldRecord.amountPaid) + num(oldRecord.tdsDeducted) + num(oldRecord.retentionDeducted)
    : 0;
  const newImpact = num(payment.amountPaid) + num(payment.tdsDeducted) + num(payment.retentionDeducted);
  const available = currentOutstanding + oldImpact;
  if (newImpact <= available) return true;
  alert(`Payment exceeds subcontractor RA bill outstanding. Available outstanding is ${money(available)}.`);
  return false;
}

function applyContractorPaymentToBill(payment, direction) {
  const bill = findSubcontractorBillForPayment(payment);
  if (!bill) return;
  bill.paid = Math.max(0, num(bill.paid) + num(payment.amountPaid) * direction);
  bill.tdsDeducted = Math.max(0, num(bill.tdsDeducted) + num(payment.tdsDeducted) * direction);
  bill.retentionDeducted = Math.max(0, num(bill.retentionDeducted) + num(payment.retentionDeducted) * direction);
  if (subcontractorBillOutstanding(bill) <= 0) {
    bill.status = "Closed";
  } else if (direction > 0 && ["Draft", "Approved", "Issued"].includes(bill.status)) {
    bill.status = "Issued";
  }
  const contractor = findSubcontractorForRecord(bill);
  if (contractor) {
    contractor.paid = Math.max(0, num(contractor.paid) + num(payment.amountPaid) * direction);
    contractor.status = subcontractorBalance(contractor) > 0 ? "Payment Pending" : "Active";
  }
}

async function saveCompanySettings(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  state.settings = [{ id: "company", ...data, updatedAt: new Date().toISOString() }];
  await saveData();
  render();
  showToast("Company details saved.");
}

async function exportBackup() {
  let serverFileName = "";
  if (API_ENABLED) {
    try {
      const response = await fetch("/api/backup", { method: "POST" });
      const result = await response.json();
      if (result.ok) {
        serverFileName = result.fileName;
      }
    } catch (error) {
      console.warn("Server backup failed, downloading browser backup instead.", error);
    }
  }
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nomadic-erp-backup-${todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(serverFileName ? `Backup saved and downloaded: ${serverFileName}` : "Backup downloaded.");
}

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const imported = JSON.parse(reader.result);
      state = { ...blankData, ...imported };
      await saveData();
      render();
      showToast("Backup imported successfully.");
    } catch {
      showToast("Could not import this backup file.", "warn");
    }
  };
  reader.readAsText(file);
}

async function loadDemo() {
  const p1 = uid();
  const p2 = uid();
  state = {
    projects: [
      { id: p1, code: "PRJ-001", name: "Riverside Towers", client: "Riverside Infra Pvt Ltd", location: "Pune", manager: "Amit Sharma", contractValue: 185000000, budget: 148000000, startDate: "2026-04-01", endDate: "2027-09-30", progress: 34 },
      { id: p2, code: "PRJ-002", name: "Industrial Shed Phase 2", client: "Nova Manufacturing", location: "Nashik", manager: "Neha Rao", contractValue: 72000000, budget: 59000000, startDate: "2026-06-15", endDate: "2027-02-28", progress: 18 }
    ],
    bills: [
      { id: uid(), projectId: p1, billNo: "RA-04", billType: "RA Bill", amount: 12500000, gst: 2250000, tds: 125000, retention: 625000, received: 8500000, submittedOn: "2026-08-05", dueDate: "2026-08-28", status: "Certified" },
      { id: uid(), projectId: p2, billNo: "IPC-01", billType: "IPC Billing", amount: 3200000, gst: 576000, tds: 32000, retention: 160000, received: 0, submittedOn: "2026-09-01", dueDate: "2026-09-25", status: "Submitted" }
    ],
    clientPayments: [
      { id: uid(), projectId: p1, receiptNo: "REC-001", billNo: "RA-04", paymentDate: "2026-08-20", amountReceived: 2500000, tdsDeducted: 25000, retentionDeducted: 125000, paymentMode: "RTGS", referenceNo: "UTR-RA04-01", remarks: "First partial receipt" },
      { id: uid(), projectId: p1, receiptNo: "REC-002", billNo: "RA-04", paymentDate: "2026-08-27", amountReceived: 6000000, tdsDeducted: 100000, retentionDeducted: 500000, paymentMode: "NEFT", referenceNo: "UTR-RA04-02", remarks: "Second partial receipt" }
    ],
    purchases: [
      { id: uid(), projectId: p1, poNo: "PO-118", material: "TMT Steel Fe500", vendor: "Metro Steels", quantity: 45, unit: "MT", amount: 2925000, orderDate: "2026-08-22", deliveryDate: "2026-09-05", status: "Part Delivered" },
      { id: uid(), projectId: p2, poNo: "IND-042", material: "Ready Mix Concrete M25", vendor: "BuildMix", quantity: 280, unit: "Cum", amount: 1512000, orderDate: "2026-09-03", deliveryDate: "2026-09-12", status: "Approval Pending" }
    ],
    grns: [
      { id: uid(), projectId: p1, grnNo: "GRN-001", poNo: "PO-118", vendor: "Metro Steels", material: "TMT Steel Fe500", category: "Steel", unit: "MT", invoiceNo: "MS-4451", vehicleNo: "MH12AB4455", quantity: 18, receivedDate: "2026-09-04", qualityStatus: "Accepted", remarks: "Received at main store" },
      { id: uid(), projectId: p2, grnNo: "GRN-002", poNo: "IND-042", vendor: "BuildMix", material: "Ready Mix Concrete M25", category: "Concrete", unit: "Cum", invoiceNo: "BM-2207", vehicleNo: "MH15CD9901", quantity: 60, receivedDate: "2026-09-07", qualityStatus: "Pending Inspection", remarks: "Cube test pending" }
    ],
    issues: [
      { id: uid(), projectId: p1, issueNo: "MIS-001", material: "Cement OPC 53", category: "Cement", unit: "Bags", issuedTo: "Omkar Formwork", department: "Tower B", quantity: 120, issueDate: "2026-09-07", returnable: "No", purpose: "Slab work", remarks: "Issued from main store" },
      { id: uid(), projectId: p2, issueNo: "MIS-002", material: "TMT Steel 12mm", category: "Steel", unit: "MT", issuedTo: "Nashik Earthmovers", department: "Foundation", quantity: 2, issueDate: "2026-09-07", returnable: "No", purpose: "Footing reinforcement", remarks: "" }
    ],
    inventory: [
      { id: uid(), projectId: p1, item: "Cement OPC 53", category: "Cement", unit: "Bags", opening: 1200, received: 900, issued: 1830, minimum: 350, lastTxn: "2026-09-06", notes: "Tower B slab pour" },
      { id: uid(), projectId: p2, item: "TMT Steel 12mm", category: "Steel", unit: "MT", opening: 16, received: 0, issued: 11, minimum: 8, lastTxn: "2026-09-04", notes: "Reorder this week" }
    ],
    expenses: [
      { id: uid(), projectId: p1, date: "2026-09-02", head: "Labour Cost", description: "Masonry gang payment", vendor: "Site labour contractor", billNo: "EXP-LAB-091", paymentDate: "2026-09-03", paymentMode: "NEFT", referenceNo: "UTR-LAB-091", amount: 840000, status: "Paid" },
      { id: uid(), projectId: p1, date: "2026-09-04", head: "Fuel", description: "DG and equipment diesel", vendor: "Fuel vendor", billNo: "FUEL-442", paymentDate: "", paymentMode: "Pending", referenceNo: "", amount: 185000, status: "Approved" },
      { id: uid(), projectId: p2, date: "2026-09-05", head: "Material Cost", description: "Aggregate and sand", vendor: "Stone supplier", billNo: "MAT-225", paymentDate: "", paymentMode: "Pending", referenceNo: "", amount: 430000, status: "Pending" }
    ],
    subcontractors: [
      { id: uid(), projectId: p1, name: "Omkar Formwork", workOrder: "WO-FW-09", scope: "Formwork and staging", agreementValue: 9200000, workDone: 3600000, billed: 2900000, paid: 2100000, retention: 145000, status: "Payment Pending" },
      { id: uid(), projectId: p2, name: "Nashik Earthmovers", workOrder: "WO-EX-02", scope: "Excavation", agreementValue: 1800000, workDone: 1500000, billed: 1500000, paid: 1500000, retention: 0, status: "Closed" }
    ],
    boqs: [
      { id: uid(), projectId: p1, boqNo: "BOQ-001", client: "Riverside Infra Pvt Ltd", boqDate: "2026-07-18", items: [{ siNo: "1", description: "Tower B slab concrete and finishing", unit: "Cum", quantity: 180, rate: 7200, amount: 1296000 }], siNo: "1", description: "Tower B slab concrete and finishing", unit: "Cum", quantity: 180, rate: 7200, amount: 1296000, cgstRate: 9, cgst: 116640, sgstRate: 9, sgst: 116640, gstApplicable: true, gstRate: 18, gst: 233280, totalWorkOrderValue: 1529280, tdsRate: 1, tds: 15292.8, retentionRate: 5, retention: 76464, netAmount: 1437523.2, status: "Approved", remarks: "Client BOQ baseline item" },
      { id: uid(), projectId: p2, boqNo: "BOQ-002", client: "Nova Manufacturing", boqDate: "2026-08-27", items: [{ siNo: "1", description: "Foundation excavation and disposal", unit: "Cum", quantity: 3500, rate: 145, amount: 507500 }], siNo: "1", description: "Foundation excavation and disposal", unit: "Cum", quantity: 3500, rate: 145, amount: 507500, cgstRate: 9, cgst: 45675, sgstRate: 9, sgst: 45675, gstApplicable: true, gstRate: 18, gst: 91350, totalWorkOrderValue: 598850, tdsRate: 1, tds: 5988.5, retentionRate: 5, retention: 29942.5, netAmount: 562919, status: "Issued", remarks: "Client BOQ excavation item" }
    ],
    workOrders: [
      { id: uid(), projectId: p1, workOrderNo: "WO-001", subcontractor: "Omkar Formwork", orderDate: "2026-08-12", items: [{ siNo: "1", description: "Tower B slab formwork and staging", unit: "Sqm", quantity: 1200, rate: 420, amount: 504000 }], siNo: "1", description: "Tower B slab formwork and staging", unit: "Sqm", quantity: 1200, rate: 420, amount: 504000, cgstRate: 9, cgst: 45360, sgstRate: 9, sgst: 45360, gstRate: 18, gst: 90720, totalWorkOrderValue: 594720, tdsRate: 1, tds: 5947.2, retentionRate: 5, retention: 29736, netAmount: 559036.8, status: "Issued", gstNote: "Gst If Applicable", remarks: "Measured as per approved shuttering drawings" },
      { id: uid(), projectId: p2, workOrderNo: "WO-002", subcontractor: "Nashik Earthmovers", orderDate: "2026-08-15", items: [{ siNo: "1", description: "Foundation excavation and disposal", unit: "Cum", quantity: 3500, rate: 115, amount: 402500 }], siNo: "1", description: "Foundation excavation and disposal", unit: "Cum", quantity: 3500, rate: 115, amount: 402500, cgstRate: 9, cgst: 36225, sgstRate: 9, sgst: 36225, gstRate: 18, gst: 72450, totalWorkOrderValue: 474950, tdsRate: 1, tds: 4749.5, retentionRate: 5, retention: 23747.5, netAmount: 446453, status: "Accepted", gstNote: "Gst If Applicable", remarks: "Includes lead up to approved disposal area" }
    ],
    contractorBills: [
      { id: uid(), projectId: p1, contractor: "Omkar Formwork", workOrder: "WO-FW-09", billNo: "CB-OM-03", billDate: "2026-08-30", workDone: 1200000, extraClaims: 85000, debitNote: 25000, creditNote: 0, grossBillValue: 1260000, retention: 60000, tds: 12600, securityDeposit: 0, netPayable: 1187400, paid: 0, tdsDeducted: 0, retentionDeducted: 0, status: "Approved", remarks: "Third running bill" },
      { id: uid(), projectId: p2, contractor: "Nashik Earthmovers", workOrder: "WO-EX-02", billNo: "CB-NE-01", billDate: "2026-08-18", workDone: 600000, extraClaims: 0, debitNote: 0, creditNote: 0, grossBillValue: 600000, retention: 0, tds: 6000, securityDeposit: 0, netPayable: 594000, paid: 594000, tdsDeducted: 0, retentionDeducted: 0, status: "Paid", remarks: "Excavation final tranche" }
    ],
    contractorPayments: [
      { id: uid(), projectId: p2, contractor: "Nashik Earthmovers", paymentNo: "CPAY-001", billNo: "CB-NE-01", paymentDate: "2026-08-25", amountPaid: 594000, tdsDeducted: 0, retentionDeducted: 0, paymentMode: "NEFT", referenceNo: "UTR-CBNE-01", remarks: "Final payment after bill-level TDS" }
    ],
    assets: [
      { id: uid(), projectId: p1, assetCode: "EXC-03", name: "Hydraulic Excavator", category: "Machinery", purchaseValue: 4800000, operator: "R. Patil", maintenanceDue: "2026-09-03", warrantyEnd: "2027-05-10", status: "Allocated" },
      { id: uid(), projectId: p2, assetCode: "DG-11", name: "125 KVA DG Set", category: "Power", purchaseValue: 1380000, operator: "S. More", maintenanceDue: "2026-09-20", warrantyEnd: "2028-01-12", status: "Available" }
    ],
    documents: [
      { id: uid(), projectId: p1, type: "BOQ", title: "Riverside approved BOQ Rev 2", reference: "BOQ-RS-02", owner: "Billing", date: "2026-07-18", notes: "Linked to RA billing" },
      { id: uid(), projectId: p2, type: "Drawing", title: "Foundation layout", reference: "DRG-FDN-07", owner: "Site", date: "2026-08-27", notes: "Latest IFC issue" }
    ],
    activities: [
      { id: uid(), projectId: p1, date: "2026-09-07", activity: "Tower B slab reinforcement", labour: 64, remarks: "Inspection cleared" },
      { id: uid(), projectId: p2, date: "2026-09-07", activity: "Column footing excavation", labour: 18, remarks: "Two pits pending dewatering" }
    ],
    masterClients: [
      { id: uid(), name: "Riverside Infra Pvt Ltd", contactPerson: "Vikas Mehta", phone: "9876500011", email: "projects@riverside.example", gstin: "27RIVER1234F1Z2", address: "Pune, Maharashtra" },
      { id: uid(), name: "Nova Manufacturing", contactPerson: "Priya Nair", phone: "9876500022", email: "admin@nova.example", gstin: "27NOVA1234F1Z8", address: "Nashik, Maharashtra" }
    ],
    masterVendors: [
      { id: uid(), name: "Metro Steels", category: "Steel", contactPerson: "R. Joshi", phone: "9876500033", gstin: "27METRO1234F1Z5", paymentTerms: "30 days" },
      { id: uid(), name: "BuildMix", category: "Concrete", contactPerson: "S. Kulkarni", phone: "9876500044", gstin: "27BUILDMIX1Z3", paymentTerms: "15 days" }
    ],
    masterContractors: [
      { id: uid(), name: "Omkar Formwork", trade: "Formwork", contactPerson: "Omkar Deshmukh", phone: "9876500055", gstin: "27OMKAR1234F1Z7", status: "Active" },
      { id: uid(), name: "Nashik Earthmovers", trade: "Excavation", contactPerson: "Mahesh More", phone: "9876500066", gstin: "27EARTH1234F1Z4", status: "Active" }
    ],
    masterMaterials: [
      { id: uid(), code: "MAT-CEM-OPC53", name: "Cement OPC 53", category: "Cement", unit: "Bags", gstRate: 28, minimumStock: 350 },
      { id: uid(), code: "MAT-STL-12MM", name: "TMT Steel 12mm", category: "Steel", unit: "MT", gstRate: 18, minimumStock: 8 }
    ],
    masterUnits: [
      { id: uid(), code: "BAG", name: "Bags", description: "Cement bags" },
      { id: uid(), code: "MT", name: "Metric Ton", description: "Steel and bulk materials" },
      { id: uid(), code: "CUM", name: "Cubic Meter", description: "Concrete and earthwork" }
    ],
    masterCostHeads: [
      { id: uid(), name: "Material Cost", group: "Material", description: "Material purchases and consumption" },
      { id: uid(), name: "Labour Cost", group: "Labour", description: "Site labour and subcontract labour" },
      { id: uid(), name: "Fuel", group: "Fuel", description: "Diesel and fuel expenses" }
    ],
    masterAssetCategories: [
      { id: uid(), name: "Machinery", depreciationRate: 15, maintenanceCycle: "Monthly", description: "Heavy machinery and equipment" },
      { id: uid(), name: "Power", depreciationRate: 10, maintenanceCycle: "Quarterly", description: "DG sets and electrical equipment" }
    ],
    settings: []
  };
  await saveData();
  render();
}

function bindEvents() {
  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => activateView(button.dataset.view));
  });

  document.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-open-modal]");
    if (openButton) openModal(openButton.dataset.openModal);

    const toggleSubcontractor = event.target.closest("[data-toggle-subcontractor]");
    if (toggleSubcontractor) {
      const name = toggleSubcontractor.dataset.toggleSubcontractor;
      if (expandedSubcontractors.has(name)) expandedSubcontractors.delete(name);
      else expandedSubcontractors.add(name);
      renderSubcontractors();
    }

    const addSubproject = event.target.closest("[data-add-subproject]");
    if (addSubproject) {
      openModal("subcontractor");
      setEmptyFormValue("name", addSubproject.dataset.addSubproject);
    }

    const toggleMasterCategory = event.target.closest("[data-toggle-master-category]");
    if (toggleMasterCategory) {
      const collection = toggleMasterCategory.dataset.toggleMasterCategory;
      if (expandedMasterCategories.has(collection)) expandedMasterCategories.delete(collection);
      else expandedMasterCategories.add(collection);
      selectedMaster = { collection, id: state[collection]?.[0]?.id || null };
      renderMasters();
    }

    const selectMaster = event.target.closest("[data-select-master]");
    if (selectMaster) {
      selectedMaster = {
        collection: selectMaster.dataset.selectMaster,
        id: selectMaster.dataset.masterId
      };
      renderMasters();
    }

    const editButton = event.target.closest("[data-edit]");
    if (editButton) openModal(editButton.dataset.form, editButton.dataset.edit);

    const viewWorkOrderButton = event.target.closest("[data-view-work-order]");
    if (viewWorkOrderButton) openWorkOrderView(viewWorkOrderButton.dataset.viewWorkOrder);

    const viewBoqButton = event.target.closest("[data-view-boq]");
    if (viewBoqButton) openBoqView(viewBoqButton.dataset.viewBoq);

    const deleteButton = event.target.closest("[data-delete]");
    if (deleteButton) deleteRecord(deleteButton.dataset.form, deleteButton.dataset.delete);

    const jumpButton = event.target.closest("[data-jump-view]");
    if (jumpButton) {
      const view = jumpButton.dataset.jumpView;
      const term = $("#globalSearch").value.trim();
      activateView(view);
      const localSearch = $(`#${view}Search`);
      if (localSearch) {
        localSearch.value = term;
        VIEW_RENDERERS[view]?.();
      }
    }
  });

  $("#closeModal").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", (event) => {
    if (event.target.id === "modal") closeModal();
  });
  $("#recordForm").addEventListener("click", (event) => {
    if (event.target.id === "cancelForm") closeModal();
  });
  $("#recordForm").addEventListener("submit", handleSubmit);
  // The dashboard's search box searches every tab, but only re-renders the
  // dashboard's own results panel. Each tab's local search box only
  // re-renders that tab, never the rest of the app.
  $("#globalSearch").addEventListener("input", renderGlobalSearch);
  Object.entries(VIEW_RENDERERS).forEach(([view, renderView]) => {
    const localSearch = $(`#${view}Search`);
    if (localSearch) localSearch.addEventListener("input", renderView);
  });
  $("#reportType").addEventListener("change", renderReportPreview);
  $("#reportProject").addEventListener("change", renderReportPreview);
  $("#reportFormat").addEventListener("change", renderReportPreview);
  $("#exportReportBtn").addEventListener("click", exportReport);
  $("#openReportsBtn").addEventListener("click", () => openFolder("reports"));
  $("#companyForm").addEventListener("submit", saveCompanySettings);
  $("#backupBtn").addEventListener("click", exportBackup);
  $("#settingsExportBtn").addEventListener("click", exportBackup);
  $("#openBackupsBtn").addEventListener("click", () => openFolder("backups"));
  $("#importFile").addEventListener("change", (event) => importBackup(event.target.files[0]));
  $("#seedBtn").addEventListener("click", async () => {
    await loadDemo();
  });
  $("#clearBtn").addEventListener("click", async () => {
    await exportBackup();
    const confirmation = prompt("A backup has been exported first. Type CLEAR to permanently clear all local NomadicERP data.");
    if (confirmation === "CLEAR") {
      state = structuredClone(blankData);
      await saveData();
      render();
      showToast("Local ERP data cleared.");
    }
  });
}

bindEvents();
startServerHeartbeat();
loadServerData().finally(render);
