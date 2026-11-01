# Rigid Group — front-end mockup

A static, no-backend management workspace for **Rigid Auctioneers** (repossession and auction cases) and **Rigid Motors** (yard inventory and auctions).

The whole app is now interactive on top of the shared shell. All changes are in memory and reset whenever a page is reloaded.

## How to open

1. Open the project folder.
2. Double-click `index.html`.

There is no install, build step, or local server required. An internet connection is needed for the Tailwind CDN and the Inter font from Google Fonts. If you open it offline, the layout still works but Tailwind styling will not load.

Optionally, serve it locally:

```bash
npx serve .
# or
python -m http.server 8000
```

Then open `http://localhost:8000`.

## What is built

### Overview
- Four calculated stat cards: active cases, proclamations expiring within 3 days, vehicles in yard, and unpaid invoice value.
- Horizontal case-pipeline chart with one bar per stage.
- “Needs Attention” list for proclamations ending soon and auctions in the next 7 days.
- Stat cards and attention items link into the relevant pages and case details.

### Auctioneers — Cases
- Stage tabs with counts, live search by debtor, case number, client or plate.
- Selectable rows, floating case details with Details / Timeline / Docs.
- In-memory stage progression; Proclamation is blocked until its 7-day period has ended.
- New Case modal that prepends an Instruction-stage case.

### Auctioneers — Invoices
- Status tabs, summary strip and coloured type tags.
- Live search.
- “Mark as Paid” updates the table, tabs, summary and sidebar overdue badge in memory.

### Auctioneers — Clients
- Searchable client cards with a type filter, active case count and outstanding case value.

### Motors — Yard Inventory
- Stat cards: vehicles in yard, accrued storage, total reserve value and sold this month.
- Status tabs, live search by plate/make/model and an entity filter.
- Table and card-grid views.
- Table columns include calculated days/accrued storage, reserve, auction date and selling price.
- Floating vehicle details with Vehicle / Fees / Sale tabs, reserve-vs-sale difference and a “View Case” link.
- “Update Reserve Price” modal updates the vehicle and totals in memory.

### Motors — Auctions
- Upcoming and Past tabs with lots grouped by date.
- Upcoming lots show Mark as Sold; the modal captures selling price and buyer.
- Saving a sale updates the vehicle, moves it to Past and sets the linked case to Auctioned.
- Advertising section showing the newspaper placement, publish date, auction date and status for each upcoming sale.

### Shared shell
- Always-expanded grouped sidebar navigation with a red overdue badge on Invoices.
- Sun/moon theme toggle in the top bar; dark mode follows the system preference on first load and remembers the chosen theme in `localStorage`.
- Mobile hamburger sidebar, horizontally scrollable tables, responsive cards and filters.
- Toast feedback for every action, consistent hover/focus states and empty states.
- No skeletons or async loading — pages render immediately from the in-memory data.

## Important demo notes

- All interactions are **in memory only**. Reloading a page resets the mock data.
- The workspace uses a fixed demo date of **30 October 2026** so countdowns, storage days and proclamation rules remain consistent. It is set once in `assets/js/ui.js` as `APP_TODAY`.
- Storage is accrued to 30 October 2026 for vehicles still in the yard, and to the sale/release date for vehicles that have left.
- Status is rendered as a coloured icon plus text, not a filled pill.
- All people, client organisations, vehicles, plates, chassis numbers, buyers and newspapers are fictional. Any resemblance to real entities is coincidental.

## Brand colours

| Token | Hex |
| --- | --- |
| `brand` | `#3672C3` |
| `brand-dark` | `#2B5BA0` |
| `brand-light` | `#EAF1FB` |
| `accent` | `#ED1C24` |
| `accent-dark` | `#C4141B` |
| `accent-light` | `#FDECEC` |

The Tailwind brand tokens are defined in the shared config at the top of `assets/js/layout.js`.

## Files

```
/index.html                      Overview dashboard
/auctioneers/cases.html          Cases table + detail panel
/auctioneers/invoices.html       Invoice table
/auctioneers/clients.html        Client grid
/motors/yard.html                Yard inventory, table + cards
/motors/auctions.html            Auction schedule, results + advertising

/assets/logo.png                 Rigid Auctioneers logo + favicon
/assets/js/data.js               Mock data (plain global constants)
/assets/js/ui.js                 Shared helpers, date/storage logic, status/type tags,
                                 table classes, action menus and top-bar search
/assets/js/layout.js             Shared sidebar, top bar, theme toggle and active link
/assets/js/pages/overview.js     Overview page logic
/assets/js/pages/cases.js        Cases page logic
/assets/js/pages/invoices.js     Invoices page logic
/assets/js/pages/clients.js      Clients page logic
/assets/js/pages/yard.js         Yard inventory logic
/assets/js/pages/auctions.js     Auctions page logic
/assets/css/custom.css           Scrollbar, transitions and small extras
```

## Mock data

`assets/js/data.js` exposes these global constants (also available on `window`):

| Constant | Count | Notes |
| --- | --- | --- |
| `clients` | 8 | Bank, Microfinance, Law Firm and Individual clients |
| `cases` | 20 | Instruction through Closed, dated around October 2026 |
| `vehicles` | 14 | Linked to repossessed cases; optional `soldDate`, `buyerName`, `releasedDate` |
| `invoices` | 15 | Draft, Sent, Paid and Overdue |
| `adverts` | 7 | Newspaper placements linked to auction dates |
| `currentUser` | 1 | Rose Kahiga, Owner |

Useful helpers in `ui.js`:

```js
formatKES(1250000);       // "KES 1,250,000"
formatDate("2026-10-30"); // "30 Oct 2026"
statusBadge("Paid");      // coloured icon + text
avatar("Rose Kahiga");    // round initials avatar
toast("Saved");           // bottom-right notification
RIGID.daysInYard(vehicle);
RIGID.accruedStorage(vehicle);
RIGID.currentYardVehicles();
```

### Data notes

- Case stages: `Instruction`, `Proclamation`, `Repossessed`, `Advertised`, `Auctioned`, `Closed`.
- Proclamation dates mark the start of the 7-day notice. Three proclamation cases end within 1–3 days of 30 October 2026.
- Vehicle statuses: `In Yard`, `Advertised`, `Sold`, `Released`.
- Invoice statuses: `Draft`, `Sent`, `Paid`, `Overdue`.
- Advert statuses: `Published`, `Scheduled`.
- Currency is always KES; dates use the shared `formatDate` helper.

## Extending the mock data

Add new records to the arrays in `assets/js/data.js`. IDs should stay unique.

### Add a yard vehicle

```js
{
  id: "V-1015",
  caseId: "RA-2026-0110",          // must exist in cases
  make: "Mara",
  model: "Terra 4x4",
  year: 2020,
  plate: "KDA 123X",
  chassisNo: "MRAFR20A1L0000001",
  colour: "White",
  mileage: 54200,
  condition: "Good",
  yardLocation: "Yard A - Bay 7",
  dateIn: "2026-10-30",
  dailyStorageFee: 1500,
  reservePrice: 2500000,
  auctionDate: "2026-11-20",       // null if not yet scheduled
  sellingPrice: null,
  status: "In Yard"                // In Yard | Advertised | Sold | Released
}
```

For a sold vehicle, add `soldDate` and `buyerName`. For a released vehicle, add `releasedDate`. Optional fields are used by the yard and auction pages.

### Add an auction advert

```js
{
  id: "ADV-2026-038",
  newspaper: "The Daily Ledger",
  publishDate: "2026-11-12",
  auctionDate: "2026-11-20",
  status: "Scheduled",             // Published | Scheduled
  caseId: "RA-2026-0110"
}
```

The Auctions page matches adverts to upcoming auction dates and lists them in the Advertising section.

### Add a case

Copy an existing case object, give it a new `RA-2026-XXXX` id and use an existing `clientId`. Add vehicles/invoices with the same `caseId` if needed. The Cases page and Overview pipeline update automatically.

### Change the demo date

Edit `APP_TODAY` in `assets/js/ui.js`. Countdowns, proclamation rules, storage days and “Sold this month” follow that date.
