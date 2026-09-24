# NomadicERP — Project Documentation

## Overview

NomadicERP is a desktop-delivered ERP application built for civil construction businesses. It covers the day-to-day operational and financial workflow of running construction projects — from client billing and payments, through procurement, site inventory, and subcontractor management, to reporting and backups.

The application is intentionally built as a **local, single-user tool** rather than a cloud product. It installs on a Windows PC like any ordinary desktop application, stores all of its data on that same machine, and requires no internet connection, subscription, or external hosting to run. This was a deliberate design choice: the target user is a small construction outfit that wants a capable ERP without the overhead of managing servers, logins, or recurring hosting costs.

## Core Features

### Dashboard
A single-screen overview of the business: active projects, budget vs. actual cost, client outstanding, subcontractor payable, pending purchase orders, incoming goods receipts, low-stock alerts, active assets, and registered documents. It also includes a project profitability chart (client billing credit minus subcontractor billing debit per project), a live alerts panel (overdue client payments, low stock, delayed deliveries, overdue asset maintenance), and a daily site activity feed.

### Master Data
Centralized, reusable reference data used throughout the app: Client Master, Vendor Master, Subcontractor Master, Material Master, Cost Head Master, and Equipment Category Master. Master records feed dropdowns across the rest of the application so that project data stays consistent (the same client, vendor, or material name is used everywhere it's referenced).

### Project Management
Tracks each construction project's code, name, client, location, site manager, contract value, budget, timeline, and progress percentage.

### Client Billing
RA (Running Account) bill management in a sheet-style format: line items with quantity and rate (decimals supported), automatic calculation of the current bill amount, cumulative billed amount, GST, gross value, TDS and retention deductions, and net payable. Outstanding balance is tracked automatically against payments received.

### Client Payments
Records receipts against client bills, including TDS deducted and retention deducted or released, and automatically updates the corresponding bill's outstanding balance and status.

### Procurement
Purchase order and material indent tracking: project, PO number, material, vendor, quantity, unit, amount, delivery date, and status.

### Goods Receipt Note (GRN)
Records material received against a purchase order, including quality inspection status, and automatically increases inventory received-stock unless the delivery is rejected.

### Material Issue
Records material issued to site, a subcontractor, or a department, checks stock availability before saving, and automatically reduces inventory issued-stock.

### Inventory
Live stock balance per material, calculated as opening stock plus received minus issued, with configurable minimum-stock thresholds that drive the low-stock alerts on the dashboard.

### Project Costing
A general expense register covering material, labour, machinery, fuel, transport, site overhead, and other cost heads, each tagged to a project and a cost head from the master list.

### Subcontractors
Subcontractors are tracked per project — the same subcontractor can be engaged across multiple projects, and each engagement's agreement value, work completed, billing, payments, and retention are managed independently while still rolling up into a single subcontractor-level summary (total billed, paid, and outstanding).

### Bill of Quantities (BOQ)
Client-facing BOQs in the same sheet-style format as work orders: line items, GST handling, TDS, retention, and net value, linked to a project and a client from the Client Master.

### Work Orders
Subcontractor work orders in a sheet-style format: itemized scope of work with quantity, rate, and computed amount; optional GST (CGST/SGST); TDS and retention deducted regardless of GST status; and a computed net payable value. A read-only detail view keeps the main list uncluttered while still exposing the full breakdown on demand.

### Subcontractor Bills
RA bills raised against a specific work order. Selecting a work order automatically pulls in the project, subcontractor, and item rows, and tracks previous, current, and cumulative quantities and amounts across successive bills — mirroring how progress billing works on an actual construction site.

### Subcontractor Payments
Records payments made against a subcontractor's RA bill, including TDS and retention deductions, and automatically updates the bill's paid amount, outstanding balance, and the subcontractor's overall payment summary.

### Assets
An equipment register tracking asset code, category, purchase value, assigned operator, maintenance due date, warranty end date, and operational status (in use, under maintenance, or scrapped).

### Documents
A general-purpose document register for drawings, certificates, contracts, and other project references, searchable by project, type, and title.

### Reports
Fifteen built-in report types — including Project Summary, Project-wise Profit & Loss, Client Outstanding, Client Payment Register, Procurement Summary, GRN Register, Material Issue Register, Current Stock, Material Consumption, Expense Register, Cost Head Summary, Subcontractor Outstanding, BOQ Register, Work Order Register, Subcontractor Bill Register, Subcontractor Payment Register, and Asset Register — each exportable as an Excel-compatible workbook or a CSV file, filterable by project, with company details automatically applied to the report header.

### Backup and Restore
Company details used on report headers are managed here, alongside JSON export/import of the full dataset, one-click access to the generated reports and backups folders, and an option to clear local data after taking a backup.

### Search
Every data tab has its own search box that filters only the records in that tab, and matching is case-sensitive by design. The dashboard additionally has a global search box that searches across all data tabs at once and can jump directly to a matching record's tab with the same term already applied.

## Technology Stack

NomadicERP is built with a deliberately minimal, dependency-free stack:

- **Frontend**: Plain HTML, CSS, and JavaScript — no framework, no build tooling, no bundler. All UI rendering, state management, and business logic live in a single well-organized JavaScript file.
- **Backend**: A small local HTTP server written against Node.js's built-in `http` module — no web framework. It serves the static frontend files and exposes a compact JSON API for data persistence, backups, and report generation.
- **Database**: SQLite, accessed through Node's built-in SQLite driver, using one generic table that stores every record as a JSON payload keyed by its collection and ID.
- **Runtime packaging**: A Node.js runtime is bundled with the application, so the end user never needs to install Node.js, npm, or any other developer tooling.
- **Installer**: The application is packaged into a single Windows installer using Inno Setup.

There are zero external npm packages anywhere in the project — everything runs on the standard library the Node runtime already ships with. This was a deliberate decision: fewer dependencies means fewer things that can break, nothing to keep patched, and a smaller, simpler thing to hand over to someone else to maintain.

## How It Runs

NomadicERP behaves like a normal installed Windows application from the end user's point of view, even though under the hood it's a small local web app:

1. The user installs the application from a single setup file.
2. A desktop and Start Menu shortcut is created.
3. Launching the shortcut starts a local server on the machine (bound only to the local loopback address, never reachable from outside the machine) and opens the application in the default browser.
4. If the application is already running, the shortcut simply focuses the existing browser tab instead of starting a second copy.
5. All data is written to a SQLite database stored in the user's local application data folder, completely separate from the installed program files, so upgrading the application never touches the user's data.
6. The application sends a small heartbeat signal from the browser tab to the local server every few seconds. If that heartbeat stops — because the browser tab or window was closed — the server automatically shuts itself down shortly after. This avoids the common problem of a background process being left running invisibly after the user thinks they've closed the program.

If, for any reason, the bundled runtime isn't available and no other copy of Node.js can be found on the machine, the application degrades gracefully: it opens directly in the browser and stores data using browser local storage instead of the SQLite database. Server-only conveniences like one-click report and backup folder access aren't available in that fallback mode, but the core application still works.

## Data Model

The application organizes its data into 25 collections, each representing one kind of record: projects, client bills, client payments, purchase orders, goods receipt notes, material issues, inventory, expenses, subcontractors, BOQs, work orders, subcontractor bills, subcontractor payments, assets, documents, daily site activities, company settings, and seven master-data collections (clients, vendors, subcontractors, materials, units, cost heads, and equipment categories).

Every record is stored with a stable, generated ID and a collection name. On the server side, this is a single database table holding the collection name, record ID, the record itself as structured data, and a last-updated timestamp. On the client side, the application keeps a single in-memory copy of the entire dataset, which is what every screen renders from and what gets saved back to disk whenever a record is added, edited, or deleted.

The frontend and server both maintain their own copy of the report definitions (what each report shows and how it's calculated), so the two are kept manually in sync whenever a report changes — a conscious trade-off in favor of keeping both sides simple and independent rather than introducing a shared module and the coordination that would require.

## Project Structure

```
index.html                     Static page shell: navigation, view containers, modal dialog, footer
style.css                      All application styling
app.js                         Frontend logic: state, rendering, calculations, forms, search
server.js                      Local HTTP server, SQLite persistence, report generation
Launch NomadicERP.bat          Installed shortcut target — starts the server and opens the app
runtime/node.exe               Bundled Node.js runtime
NomadicERP.ico                 Application icon
NomadicERP_Setup.iss           Inno Setup installer script
Build NomadicERP Installer.bat One-click installer build helper
```

At runtime, three additional folders are created to hold data the application generates rather than ships with:

```
data/       The SQLite database file
backups/    JSON backups exported from the Backup screen
reports/    Generated report files (Excel-compatible and CSV)
```

## Installation

End users need only the single installer file. Running it installs the application, creates the desktop and Start Menu shortcuts, and requires no separate installation of Node.js, a database, or any other software. Microsoft Edge (or any modern browser already present on the machine) is the only external requirement.

## Building From Source

The installer is produced with Inno Setup:

1. Open the project folder and run the installer build script, or run Inno Setup's compiler directly against the project's `.iss` script.
2. The resulting setup file is written into the project folder.

No package installation step is required beforehand, since the project has no external dependencies to install.

## Design Principles

A few decisions run consistently through the project and are worth calling out explicitly:

- **Simplicity over sophistication.** No framework, no build pipeline, no external dependencies. The entire application can be understood by reading three files.
- **Data belongs to the user.** Everything is stored locally, in a location separate from the installed program, and can be exported to a portable JSON backup at any time.
- **Fail gracefully.** If the ideal runtime path isn't available, the application still works in a reduced form rather than refusing to run.
- **Don't leave anything running in the background.** The local server shuts itself down as soon as the application is closed, rather than silently persisting.

## Known Limitations

- The application is designed for a single user working on a single machine at a time. It has no concept of user accounts, logins, or concurrent multi-user editing.
- There is no automated test suite. Correctness is currently verified through syntax checks and manual testing in the browser.
- A handful of internal field and collection names still reflect earlier terminology from before the application's vocabulary was updated to "subcontractor" throughout the visible interface; this is intentional, to avoid requiring a data migration for existing installations, and does not affect anything the end user sees.

## Roadmap

Possible future directions for the project include a clean print/export layout for work orders and subcontractor bills, direct PDF export for reports, a validation rule preventing a subcontractor bill's cumulative quantity from exceeding its work order quantity, an optional password/PIN lock for shared-machine use, and a proper audit trail of changes made to records over time.
