# NomadicERP Developer Handover

Last updated: 10 September 2026

This document is a full handover for continuing development of NomadicERP, a local single-user civil construction ERP app. It is written so another AI assistant, developer, or the project owner can understand where the app lives, how it runs, how it is packaged, and what design/product decisions have already been made.

## 1. Project Summary

NomadicERP is a local desktop-delivered web app for civil construction ERP workflows. It is not a cloud web app and does not require hosting. The user wanted something easy to hand over to a non-developer, so the app is packaged as a Windows installer that installs a local app and launches in the browser.

The app consists of:

- A browser UI built with plain HTML, CSS, and JavaScript.
- A local Node.js HTTP server.
- A local SQLite database.
- A bundled Node runtime so the end user should not need to install Node.js.
- An Inno Setup installer named `NomadicERP_Setup.exe`.

The intended end-user flow is:

1. User receives only `NomadicERP_Setup.exe`.
2. User runs the setup.
3. User launches NomadicERP from the desktop/start menu shortcut.
4. A local server starts on `127.0.0.1:4855`.
5. Microsoft Edge opens the app.
6. Data is stored locally on that PC.
7. When the browser/app is closed, the local server auto-stops after a short heartbeat timeout.

## 2. Important Current Locations

Main development workspace:

```text
C:\Users\Abhinava\Documents\Codex\2026-09-08\be
```

Main app folder:

```text
C:\Users\Abhinava\Documents\Codex\2026-09-08\be\outputs\CivilERP
```

Current delivery installer location:

```text
C:\Users\Abhinava\Downloads\ERP\NomadicERP_Setup.exe
```

Current local preview launcher used during development:

```text
C:\Users\Abhinava\Documents\Codex\2026-09-08\be\work\start-nomadic-preview.vbs
```

Installed app data location on an end-user PC:

```text
%LOCALAPPDATA%\NomadicERP
```

Expected installed database path:

```text
%LOCALAPPDATA%\NomadicERP\data\nomadic_erp.sqlite
```

Generated reports folder when installed:

```text
%LOCALAPPDATA%\NomadicERP\reports
```

Generated backups folder when installed:

```text
%LOCALAPPDATA%\NomadicERP\backups
```

## 3. Main Files

Inside:

```text
C:\Users\Abhinava\Documents\Codex\2026-09-08\be\outputs\CivilERP
```

Key files:

```text
index.html
```

The static HTML shell. Contains sidebar navigation, view sections, modal shell, reports/settings sections, and footer.

```text
style.css
```

All app styling. No frontend framework is used.

```text
app.js
```

Most of the frontend app logic. Contains state management, form definitions, rendering logic, calculations, report preview/export fallback, modal handling, master-data UI, bill/work-order sheet UIs, and server heartbeat.

```text
server.js
```

Local Node server. Serves static files, exposes JSON API, persists records to SQLite, generates server-side reports, opens managed folders, opens the browser, and auto-stops in managed-lifetime mode.

```text
Launch NomadicERP.bat
```

The installed app launcher. Starts the bundled Node runtime and launches the local app.

```text
runtime\node.exe
```

Bundled Node runtime. This is why the end user should not need to install Node.js.

```text
NomadicERP.ico
```

Maple leaf icon used by installer, desktop shortcut, and Start Menu shortcut.

```text
NomadicERP_Setup.iss
```

Inno Setup installer script.

```text
Build NomadicERP Installer.bat
```

Double-click build helper for creating `NomadicERP_Setup.exe` if Inno Setup 6 or 7 is installed.

```text
NomadicERP_Setup.exe
```

Compiled installer output in the project folder. This is copied to `Downloads\ERP` for handover.

## 4. Current Runtime Model

NomadicERP runs as a local web app, not a normal native `.exe`.

The shortcut launches:

```text
Launch NomadicERP.bat
```

The launcher checks whether `http://127.0.0.1:4855` is already responding.

If the app is already running:

- It opens the existing app URL in Edge if Edge is installed.
- If Edge is not found, it opens the URL using Windows default handling.
- It exits without starting another server.

If the app is not running:

- It starts `runtime\node.exe server.js --open --managed-lifetime`.
- The server opens the browser.
- The server listens on `127.0.0.1:4855`.

The `--managed-lifetime` mode is important. It prevents the old problem where a black terminal/server process stayed open after the user exited the browser/app.

## 5. Server Auto-Stop Behavior

Recent fix: the app now sends a heartbeat from `app.js` while the page is open.

Frontend heartbeat:

```text
app.js
function startServerHeartbeat()
```

It posts to:

```text
POST /api/heartbeat
```

The server tracks:

```text
server.js
MANAGED_LIFETIME
lastHeartbeatAt
```

If the server is running with:

```text
--managed-lifetime
```

and no heartbeat is received for about 30 seconds, the server closes itself.

This was tested on a temporary port and confirmed working:

- Start server in managed mode.
- Do not open a browser tab / do not send heartbeat.
- Server logs: `NomadicERP browser window was closed. Stopping local server.`
- Server exits.

Important for future developer:

- Keep `--managed-lifetime` in `Launch NomadicERP.bat`.
- Keep `startServerHeartbeat()` called at the bottom of `app.js`.
- Keep `/api/heartbeat` route in `server.js`.

## 6. How To Run The App During Development

From PowerShell:

```powershell
cd C:\Users\Abhinava\Documents\Codex\2026-09-08\be
cscript //nologo work\start-nomadic-preview.vbs
```

Then open:

```text
http://127.0.0.1:4855/
```

Development preview uses:

```text
C:\Users\Abhinava\Documents\Codex\2026-09-08\be\outputs\CivilERP\runtime\node.exe
```

and stores development data under:

```text
C:\Users\Abhinava\Documents\Codex\2026-09-08\be\work
```

The preview VBS sets:

```text
CIVIL_ERP_PORT=4855
NOMADIC_ERP_DATA_DIR=C:\Users\Abhinava\Documents\Codex\2026-09-08\be\work
```

If port 4855 is stuck, check:

```powershell
netstat -ano | Select-String ':4855'
Get-Process node -ErrorAction SilentlyContinue | Select-Object Id,Path
```

Only stop the process if its path is the NomadicERP bundled runtime:

```text
C:\Users\Abhinava\Documents\Codex\2026-09-08\be\outputs\CivilERP\runtime\node.exe
```

Do not kill unrelated Node processes.

## 7. How To Build The Installer

Inno Setup is installed on this PC at:

```text
C:\Program Files\Inno Setup 7\ISCC.exe
```

Option A, easiest for owner:

1. Open this folder:

```text
C:\Users\Abhinava\Documents\Codex\2026-09-08\be\outputs\CivilERP
```

2. Double-click:

```text
Build NomadicERP Installer.bat
```

3. The output appears as:

```text
C:\Users\Abhinava\Documents\Codex\2026-09-08\be\outputs\CivilERP\NomadicERP_Setup.exe
```

Option B, command line:

```powershell
cd C:\Users\Abhinava\Documents\Codex\2026-09-08\be\outputs\CivilERP
& 'C:\Program Files\Inno Setup 7\ISCC.exe' 'NomadicERP_Setup.iss'
```

After building, copy to handover folder:

```powershell
New-Item -ItemType Directory -Force 'C:\Users\Abhinava\Downloads\ERP' | Out-Null
Copy-Item -LiteralPath 'C:\Users\Abhinava\Documents\Codex\2026-09-08\be\outputs\CivilERP\NomadicERP_Setup.exe' -Destination 'C:\Users\Abhinava\Downloads\ERP\NomadicERP_Setup.exe' -Force
Get-Item 'C:\Users\Abhinava\Downloads\ERP\NomadicERP_Setup.exe' | Select-Object FullName,Length,LastWriteTime
```

Current latest known installer from this session:

```text
C:\Users\Abhinava\Downloads\ERP\NomadicERP_Setup.exe
Size: 24,611,681 bytes
Timestamp: 10-09-2026 13:47:37
```

Future AI/developer instruction:

- The user asked that before making a new `.exe`, the assistant should ask first.
- If the user says "pack it up", "build exe", or equivalent, that is permission to rebuild.

## 8. Installer Script Details

Installer script:

```text
NomadicERP_Setup.iss
```

Important settings:

```ini
#define MyAppName "NomadicERP"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "NomadicERP Local"
#define MyAppExeName "Launch NomadicERP.bat"
```

Installs by default to:

```text
{autopf}\NomadicERP
```

Usually:

```text
C:\Program Files\NomadicERP
```

Creates:

```text
{app}\data
{app}\backups
{app}\reports
```

However, when installed under Program Files, `server.js` stores active writable data under:

```text
%LOCALAPPDATA%\NomadicERP
```

The installer excludes data and generated files:

```text
data\*
backups\*
reports\*
```

This is correct. Do not package development database files into the installer unless the user explicitly asks for seeded default data.

Shortcut icon:

```text
NomadicERP.ico
```

Installer output:

```text
NomadicERP_Setup.exe
```

## 9. Dependencies For End User

End user should not need to install:

- Node.js
- npm
- Inno Setup
- Any browser extension
- Any development tool

End user does need:

- Windows PC.
- A browser. Microsoft Edge is preferred and normally present on Windows.

The app includes:

```text
runtime\node.exe
```

If bundled runtime is missing, launcher tries system Node.js. If system Node.js is also missing, it opens `index.html` directly as a fallback. That fallback uses browser localStorage only and loses server features like SQLite persistence, open reports folder, and server-side report saving.

## 10. Architecture Overview

This is intentionally simple:

- `index.html`: static shell and view containers.
- `style.css`: layout, forms, dashboard, table, sheet, report, modal, master-browser styles.
- `app.js`: frontend state, rendering, calculations, forms, reports, UI events.
- `server.js`: local HTTP server and SQLite persistence.
- SQLite table `records`: generic collection/id/payload table.

There is no React, Vue, Angular, Vite, npm package install, or build process.

That was intentional because the app needs to be easy to deliver and run.

## 11. Data Model

Both frontend and server use collection arrays. The frontend `blankData` and server `collections` must stay aligned.

Current collections include:

```text
projects
bills
clientPayments
purchases
grns
issues
inventory
expenses
subcontractors
boqs
workOrders
subcontractorBills
contractorBills
contractorPayments
assets
documents
activities
masterClients
masterVendors
masterContractors
masterMaterials
masterUnits
masterCostHeads
masterAssetCategories
settings
```

Important compatibility note:

- `contractorBills` remains in storage for backward compatibility, but the visible old Contractor Bills tab was removed.
- `contractorPayments` remains as the internal collection name for Subcontractor Payments. Visible UI says Subcontractor Payments.
- `masterContractors` remains the internal collection name for subcontractor master entries. Visible UI may say Subcontractor Master.
- `masterUnits` remains in data for compatibility, but Unit Master was removed from visible Masters UI. Unit fields use fixed dropdowns and material defaults.

Do not rename these internal collections casually. Renaming them will require data migration from existing user SQLite/localStorage backups.

## 12. Persistence

Frontend starts with:

```text
localStorage key: nomadic_erp_local_v1
```

When served by the local server, frontend syncs with:

```text
GET /api/data
PUT /api/data
```

`server.js` stores records in SQLite:

```sql
records(collection TEXT, id TEXT, payload TEXT, updated_at TEXT)
```

Data write strategy:

- Frontend keeps the app state object.
- On save, frontend writes to localStorage.
- If API is enabled, frontend sends full state to `/api/data`.
- Server clears and rewrites records transactionally.

This is acceptable for single-user local usage.

## 13. Current Features

### Dashboard

Dashboard shows:

- Projects
- Budget vs Cost
- Client Outstanding
- Subcontractor Payable
- Pending POs
- GRNs
- Low Stock Items
- Active Assets
- Documents
- Project Profitability chart
- Alerts
- Daily Site Activity

Recent profitability logic:

```text
Project Profitability = Client Bill Credit - Subcontractor Bill Debit
```

Frontend functions:

```text
projectClientCredit(projectId)
projectSubcontractorDebit(projectId)
projectProfit(projectId)
renderDashboard()
```

Project Profitability chart now shows project names, not project codes.

### Masters

Masters tab was recently refactored.

Current behavior:

- Clicking Masters opens a master-data browser.
- Left side shows master categories as headings.
- Clicking a heading expands/collapses compact records.
- Compact rows show only crucial info.
- Clicking a record shows full details on the right.
- Right panel has Edit, Delete, and Add actions.

Visible master categories:

- Client Master
- Vendor Master
- Subcontractor Master
- Material Master
- Cost Head Master
- Equipment Category Master

Unit Master is intentionally not visible.

Frontend functions:

```text
renderMasters()
masterCategories()
masterListItemMarkup()
renderMasterDetail()
```

State helpers:

```text
expandedMasterCategories
selectedMaster
```

### Projects

Project records include:

- code
- name
- client
- location
- manager
- contractValue
- budget
- startDate
- endDate
- progress

Project dropdown labels generally show:

```text
Project Code - Project Name
```

Dashboard profitability chart specifically shows only project names.

### Client Bills

Client Bills were refactored into a sheet-style RA bill format similar to Subcontractor Bills.

Important:

- Decimal quantities/rates are supported.
- Calculates this bill, previous amount, cumulative amount, GST, gross, TDS, retention, net payable.

Frontend functions include:

```text
clientBillSheetMarkup()
clientBillThisAmount()
clientBillGross()
clientBillNet()
billOutstanding()
```

### Client Payments

Client Payments records receipts against client bills.

It updates:

- received
- TDS deducted
- retention deducted/released
- client bill outstanding/status

Important functions:

```text
findBillForPayment()
canApplyClientPayment()
applyClientPaymentToBill()
```

### Procurement

Tracks purchase orders/indents:

- project
- PO number
- material
- vendor
- quantity
- unit
- amount
- dates
- status

### GRN

GRN full form:

```text
Goods Receipt Note
```

GRN records incoming material and updates inventory received quantity automatically unless rejected.

Important functions:

```text
applyGrnToInventory()
```

### Material Issue

Material Issue records material issued to site/subcontractor/department and reduces inventory via issued quantity.

Important:

- It checks stock availability before saving.

Functions:

```text
canApplyIssue()
applyIssueToInventory()
```

### Inventory

Inventory balance:

```text
opening + received - issued
```

Function:

```text
stockBalance()
```

### Costing

Costing/expenses remain as a normal expense register. Note that dashboard Project Profitability was changed to client bill credit minus subcontractor bill debit, but budget/cost metrics still use expenses.

### Subcontractors

Subcontractors tab supports project-wise subcontractor details. The user requested that each subcontractor can work across multiple projects and that work-related details can be modified by opening project-wise entries from the Subcontractors tab.

The app groups subcontractors by name and shows project-wise detail under each subcontractor.

### Work Orders

Work Orders are sheet-style.

Fields include:

- Project
- Subcontractor
- Work Order No
- Work Order Date
- item rows with SI No, Description of Work, Unit, Quantity, Rate, Amount
- GST Applicable checkbox
- CGST/SGST/GST
- Gross Work Order Value
- TDS
- Retention
- Net Work Order Value
- Status
- Remarks

Calculation rules:

- Amount = Quantity x Rate
- If GST Applicable is checked, GST is added.
- If GST Applicable is unchecked, GST is zero and gross equals base amount.
- TDS and retention are deducted regardless of whether GST is applied.
- Decimal quantity/rate is supported.

There is an eye/view button in the Work Orders list:

- View is read-only.
- No dropdown arrows in read-only view.
- Fine details are visible in the detail view, not in the main list.

### Subcontractor Bill

Subcontractor Bill is a sheet-style RA bill tab based on the screenshot reference provided by the user.

Fields include:

- Project
- Sub Contractor Name
- Work Order No
- RA Bill No
- RA Bill Date
- line items
- Previous Qty
- This Bill Qty
- Cumulative Qty
- Previous Amount
- This Bill Amount
- Cumulative Amount
- CGST/SGST/GST
- Gross Bill Value
- TDS
- Retention
- Net Payable
- RA Bill Status
- Remarks

Important behavior:

- Work Order No is a proper select/dropdown.
- Selecting a work order pulls project, subcontractor, and item rows.
- Decimal quantities are supported.
- GST behavior follows the linked work order's GST applicability.
- TDS and retention are deducted regardless.

Functions:

```text
subcontractorBillSheetMarkup()
subcontractorBillItems()
previousSubcontractorBillRows()
applyWorkOrderToSubcontractorBill()
recalcSubcontractorBillSheet()
readSubcontractorBillItemsFromForm()
enrichSubcontractorBill()
subcontractorBillThisAmount()
subcontractorBillGross()
subcontractorBillNet()
subcontractorBillOutstanding()
applySubcontractorBillToSummary()
```

### Subcontractor Payments

Visible UI says Subcontractor Payments.

Internal form key:

```text
contractorPayment
```

Internal collection:

```text
contractorPayments
```

Do not rename without migration.

Current behavior:

- Payment is made against Subcontractor RA Bill Number.
- RA Bill dropdown comes from `state.subcontractorBills`.
- Payment updates matching subcontractor bill:
  - paid
  - tdsDeducted
  - retentionDeducted
  - status/outstanding
- Payment also updates subcontractor summary paid amount.

Functions:

```text
findSubcontractorBillForPayment()
canApplyContractorPayment()
applyContractorPaymentToBill()
```

The names `canApplyContractorPayment` and `applyContractorPaymentToBill` are old internal names. They now operate on subcontractor RA bills.

### BOQ

BOQ was added after the original handover document was created.

It is intentionally modeled on the Work Orders sheet format, but it is client-facing instead of subcontractor-facing.

Collection:

```text
boqs
```

Visible tab:

```text
BOQ
```

Important fields:

- Project
- Client Name
- BOQ No
- BOQ Date
- line items with SI No, Description of Work, Unit, Quantity, Rate, Amount
- GST Applicable checkbox
- CGST/SGST/GST
- Gross BOQ Value
- TDS
- Retention
- Net BOQ Value
- Status
- Remarks

Important behavior:

- Client Name comes from Client Master, not Subcontractor Master.
- The tabular entry format mirrors Work Orders.
- Quantity and rate accept decimals.
- Amount = Quantity x Rate.
- If GST Applicable is checked, CGST and SGST are added.
- If GST Applicable is unchecked, GST is zero.
- TDS and retention are deducted regardless.
- The BOQ list has an eye/view action for read-only full details.

Important implementation notes:

- BOQ uses `boqNo`, `client`, and `boqDate` for its own top-level identity fields.
- BOQ reuses Work Order item/calculation helper functions because the line-item and tax math is identical.
- Report key is `boq_register`.
- Server collection list must include `boqs`.

### Assets

Asset register tracks:

- assetCode
- name
- category
- purchaseValue
- operator
- maintenanceDue
- warrantyEnd
- status

### Documents

Document register tracks:

- project
- type
- title
- reference
- owner
- date
- notes

The document type options may still include "Contractor Bill". Consider renaming to "Subcontractor Bill" in a future cleanup if desired.

### Reports

Reports support:

- browser-side fallback export
- server-side export through `/api/report`
- CSV
- Excel-compatible `.xls`

Visible report options include:

- Project Summary
- Project-wise Profit & Loss
- Client Outstanding
- Client Payment Register
- Procurement Summary
- GRN Register
- Material Issue Register
- Current Stock
- Material Consumption
- Expense Register
- Cost Head Summary
- Subcontractor Outstanding
- Work Order Register
- Subcontractor Bill Register
- Subcontractor Payment Register
- Asset Register

Recent report alignment:

- Project-wise Profit & Loss now uses `Client Bill Credit`, `Subcontractor Debit`, and `Estimated Profit / Loss`.
- Subcontractor Bill Register replaced the old Contractor Bill Register.
- Subcontractor Payment Register replaced the visible Contractor Payment Register label, but the internal report key is still `contractor_payment_register`.

Report definitions exist in both:

```text
app.js
getReportDefinitions()
server.js
reportDefinitions(data)
```

Important:

When adding or changing reports, update both frontend and server definitions so preview/export match.

### Backup

Backup page/settings section supports:

- Company details for report headers.
- Export backup.
- Import backup.
- Open backups folder.
- Clear local data after exporting a backup.

Backup exports JSON.

## 14. UI/UX Decisions Already Made

App name:

```text
NomadicERP
```

Brand:

- Maple leaf icon.
- Maple leaf beside top name.
- Maple leaf centered in footer.

Icon source used:

```text
C:\Users\Abhinava\Desktop\icons8-maple-leaf-96.png
```

The current `.ico` file is:

```text
NomadicERP.ico
```

No yellow-highlight rows in Work Order/Subcontractor Bill sheets. The user specifically asked for white cells instead of yellow.

Dropdown behavior:

- Master-derived fields should be real dropdowns/selects.
- Master-derived fields should generally be selectable from master options, not free-typed autocomplete.
- Unit Master is not needed in visible Masters.

Work Order main list:

- Do not show fine tax/deduction columns in the main list.
- Fine details belong in the eye/view detail.

## 15. Current Known Quirks And Technical Debt

These are not necessarily urgent, but a future developer should know them.

1. Internal names still use old contractor wording.

Examples:

```text
contractorPayments
contractorPayment
masterContractors
canApplyContractorPayment()
applyContractorPaymentToBill()
```

Visible UI now mostly says Subcontractor. Do not rename internal collections unless adding a migration.

2. Old `contractorBills` collection remains.

It is preserved for backward compatibility. The old visible Contractor Bills tab/report was removed.

3. `README.txt` and `BUILD_INSTALLER.txt` may be partially outdated.

This handover document is more current. If shipping a polished developer package, update README to reflect:

- Subcontractor Bill replacing Contractor Bills.
- Masters browser refactor.
- Server heartbeat auto-stop.
- Unit Master removed from visible Masters.

4. No formal test suite.

Validation has been done with:

```powershell
runtime\node.exe --check app.js
runtime\node.exe --check server.js
```

and browser preview checks.

5. There is no Git repository at the current workspace root.

Running `git status` from:

```text
C:\Users\Abhinava\Documents\Codex\2026-09-08\be
```

currently reports:

```text
fatal: not a git repository
```

Future developer may want to initialize Git before large work.

6. Some demo data still contains old contractor-bill examples.

The demo data may include old `contractorBills` and `CPAY` records with `CB-...` bill numbers. That does not represent the current preferred workflow. Consider refreshing demo data to use Work Orders and Subcontractor Bills only.

## 16. Developer Editing Rules For Future Work

Recommended checks after editing:

```powershell
cd C:\Users\Abhinava\Documents\Codex\2026-09-08\be
outputs\CivilERP\runtime\node.exe --check outputs\CivilERP\app.js
outputs\CivilERP\runtime\node.exe --check outputs\CivilERP\server.js
```

Search for stale old UI wording:

```powershell
rg -n "Contractor Bills|Contractor Bill Register|contractor_bill_register|data-open-modal=\"contractorBill\"|data-view=\"contractorBills\"" outputs/CivilERP
```

Search for app server lifetime behavior:

```powershell
rg -n "managed-lifetime|heartbeat|startServerHeartbeat|MANAGED_LIFETIME" outputs/CivilERP
```

Do not edit generated user data in:

```text
data\
backups\
reports\
```

unless explicitly asked.

## 17. Suggested Future Improvements

Useful next steps:

1. Update demo data so it no longer uses old Contractor Bills.
2. Add a clean print/export view for Work Orders and Subcontractor Bills.
3. Add PDF export for reports and bill formats.
4. Add backup reminder or one-click backup before installer updates.
5. Add validation that Subcontractor Bill cumulative quantity cannot exceed Work Order quantity.
6. Add a simple migration system for internal collection renames if the user wants all code terminology changed from contractor to subcontractor.
7. Improve installed launcher so it opens a browser app-style window instead of a normal Edge tab, if desired.
8. Add password/PIN lock if app will be given to someone else but still single-user.
9. Add project-wise filters to Work Orders, Subcontractor Bills, Payments, and Reports.
10. Add proper audit trail/change history for records.

## 18. Quick Continuation Prompt For Another AI

If another AI assistant continues the project, give it this prompt:

```text
You are continuing development of NomadicERP, a local single-user Windows civil construction ERP. The project folder is C:\Users\Abhinava\Documents\Codex\2026-09-08\be\outputs\CivilERP. Read NOMADICERP_HANDOVER.md first. The app is plain HTML/CSS/JS plus a local Node SQLite server, packaged using Inno Setup. Do not rename internal collections like contractorPayments/masterContractors without migration. Do not build a new .exe unless I explicitly ask. After code edits, run runtime\node.exe --check app.js and runtime\node.exe --check server.js. For packaging, use C:\Program Files\Inno Setup 7\ISCC.exe with NomadicERP_Setup.iss and copy NomadicERP_Setup.exe to C:\Users\Abhinava\Downloads\ERP.
```

## 19. Quick Owner Instructions

To open the project folder:

```text
C:\Users\Abhinava\Documents\Codex\2026-09-08\be\outputs\CivilERP
```

To run development preview:

```powershell
cd C:\Users\Abhinava\Documents\Codex\2026-09-08\be
cscript //nologo work\start-nomadic-preview.vbs
```

Then open:

```text
http://127.0.0.1:4855/
```

To package installer:

```powershell
cd C:\Users\Abhinava\Documents\Codex\2026-09-08\be\outputs\CivilERP
& 'C:\Program Files\Inno Setup 7\ISCC.exe' 'NomadicERP_Setup.iss'
```

To copy final installer to Downloads:

```powershell
Copy-Item -LiteralPath 'C:\Users\Abhinava\Documents\Codex\2026-09-08\be\outputs\CivilERP\NomadicERP_Setup.exe' -Destination 'C:\Users\Abhinava\Downloads\ERP\NomadicERP_Setup.exe' -Force
```

The only file to hand over to the end user is:

```text
C:\Users\Abhinava\Downloads\ERP\NomadicERP_Setup.exe
```
