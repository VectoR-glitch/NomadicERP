NomadicERP Local
================

How to launch
-------------
Double-click "Launch NomadicERP.bat".
When installed through NomadicERP_Setup.exe, use the NomadicERP shortcut with
the maple leaf icon.

The delivery folder includes runtime/node.exe, so the user should not need to
install Node.js manually. The launcher starts the local NomadicERP server, opens
the app in Microsoft Edge when available, and stores data in the Windows local
app-data folder.

If the bundled runtime is removed and Node.js is not available, the launcher
opens index.html directly in Chrome/Edge and stores data in the browser.

What this version includes
--------------------------
- Local dashboard
- Master data for clients, vendors, contractors, materials, units, cost heads, and equipment categories
- Main forms use master data suggestions while still allowing manual typed entries
- Project management
- Client billing
- Client payment register with automatic bill received/outstanding update
- Procurement
- GRN / incoming material entry with automatic inventory received-stock update
- Material issue entry with automatic inventory issued-stock update
- Store and inventory
- Project costing
- Subcontractors grouped from contractor master data, with expandable project-wise work details
- Work orders with quantity x rate, total work order value, GST 18%, TDS 1%, retention 5%, and net payable
- Contractor bills and contractor payments with automatic payable/outstanding update
- Asset register
- Document register
- Daily site activities
- Professional report export to Excel-compatible .xls and .csv
- Company details on report headers
- Automatic numbering for projects, bills, receipts, POs, GRNs, issue slips,
  work orders, contractor vouchers, expenses, and assets
- Default date entry for new date-based records
- One-click buttons to open the reports and backups folders when launched
  through the local server
- JSON backup export and import

Data storage
------------
Preferred mode stores data in:
%LOCALAPPDATA%\NomadicERP\data\nomadic_erp.sqlite
Fallback mode stores data in the browser on the same PC using local storage.
Use "Export backup" regularly to keep a copy of the ERP data.
Generated reports are saved in the reports folder when the app is launched
through the local server. Backups are saved in the backups folder and also
downloaded by the browser.

Next packaging step
-------------------
Install Inno Setup 6 or 7, then double-click "Build NomadicERP Installer.bat" to
create NomadicERP_Setup.exe.
