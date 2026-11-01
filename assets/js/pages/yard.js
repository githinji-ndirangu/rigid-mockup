/* =========================================================
   Yard Inventory — table + card views, filters, storage fees,
   vehicle detail panel and in-memory reserve updates.
   ========================================================= */

(function () {
  "use strict";

  const { formatKES, formatDate, statusBadge, escapeHTML, toast } = window;
  const R = window.RIGID;
  const TABS = ["All", "In Yard", "Advertised", "Sold", "Released"];
  const DETAIL_TABS = ["Vehicle", "Fees", "Sale"];
  const ACTIVE_STATUSES = ["In Yard", "Advertised"];

  const state = {
    tab: "All",
    query: "",
    entity: "all",
    view: "table",
    selected: new Set(),
    activeVehicleId: null,
    detailTab: "Vehicle",
    expanded: false
  };

  let panels;
  let modal;

  const cell = "whitespace-nowrap px-3 py-3 align-middle text-[11.5px] text-[#4a4a45] dark:text-[#F3F4F6]";
  const cellRight = "whitespace-nowrap px-3 py-3 text-right align-middle text-[11.5px] text-[#4a4a45] dark:text-[#F3F4F6]";
  const head = "whitespace-nowrap px-3 py-3 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#9a9a94] dark:text-[#9CA3AF]";
  const headRight = "whitespace-nowrap px-3 py-3 text-right text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#9a9a94] dark:text-[#9CA3AF]";

  function init() {
    createLayers();
    bindStaticControls();
    bindSearch();
    bindToolbar();
    bindContent();
    bindPanel();
    bindModal();
    bindEscapeKey();

    renderStats();
    renderToolbar();
    renderContent();
  }

  function createLayers() {
    panels = document.createElement("div");
    panels.id = "vehicle-panel-root";
    document.body.appendChild(panels);

    modal = document.createElement("div");
    modal.id = "vehicle-modal-root";
    document.body.appendChild(modal);
  }

  function bindStaticControls() {
    document.getElementById("export-yard")?.addEventListener("click", () => toast("Export started"));
    document.getElementById("update-reserve")?.addEventListener("click", updateReserveFromPage);
  }

  function bindSearch() {
    R.bindGlobalSearch((value) => {
      state.query = value;
      renderContent();
    }, "Search plate, make or model…");
  }

  /* -------------------------------------------------------
     Stats
     ------------------------------------------------------- */
  function statCard({ label, value, detail, icon, valueClass }) {
    return `
      <div class="flex flex-col rounded-xl border border-brand/15 bg-brand-light p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-[#24406B] dark:bg-[#16243B]">
        <div class="flex items-start justify-between gap-3">
          <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f6f6a] dark:text-[#9CA3AF]">${label}</p>
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#efeee9] dark:border-[#262B36] bg-white text-brand dark:text-[#5B93E0]">
            ${icon}
          </span>
        </div>
        <p class="mt-3 ${valueClass || "text-[26px]"} font-semibold tracking-[-0.03em] text-[#141414] dark:text-[#F3F4F6]">${value}</p>
        <p class="mt-1.5 text-[11px] leading-5 text-[#6f6f6a] dark:text-[#9CA3AF]">${detail}</p>
      </div>`;
  }

  function renderStats() {
    const yardVehicles = R.currentYardVehicles();
    const inYard = yardVehicles.filter((vehicle) => vehicle.status === "In Yard").length;
    const advertised = yardVehicles.filter((vehicle) => vehicle.status === "Advertised").length;
    const storageTotal = yardVehicles.reduce((sum, vehicle) => sum + R.accruedStorage(vehicle), 0);
    const reserveTotal = yardVehicles.reduce((sum, vehicle) => sum + Number(vehicle.reservePrice || 0), 0);
    const sold = R.soldThisMonthVehicles();
    const monthLabel = formatDate(R.today).split(" ").slice(1).join(" ");

    const icons = {
      car: window.RIGID_ICONS.car,
      clock: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`,
      tag: window.RIGID_ICONS.tag,
      check: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="m8.5 12 2.5 2.5 4.5-5"></path></svg>`
    };

    const cards = [
      {
        label: "Vehicles in Yard",
        value: yardVehicles.length,
        detail: `${inYard} ready · ${advertised} advertised`,
        icon: icons.car
      },
      {
        label: "Total Accrued Storage Fees",
        value: formatKES(storageTotal),
        detail: `Across ${yardVehicles.length} vehicles · to ${formatDate(R.today)}`,
        icon: icons.clock,
        valueClass: "text-[22px]"
      },
      {
        label: "Total Reserve Value",
        value: formatKES(reserveTotal),
        detail: `Across ${yardVehicles.length} vehicles currently in yard`,
        icon: icons.tag,
        valueClass: "text-[22px]"
      },
      {
        label: "Sold This Month",
        value: sold.length,
        detail: monthLabel,
        icon: icons.check
      }
    ];

    document.getElementById("yard-stats").innerHTML = cards.map(statCard).join("");
  }

  /* -------------------------------------------------------
     Toolbar: tabs, entity filter and view switch
     ------------------------------------------------------- */
  function tabCount(tab) {
    return tab === "All"
      ? window.vehicles.length
      : window.vehicles.filter((vehicle) => vehicle.status === tab).length;
  }

  function viewButtonClass(active) {
    return [
      "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
      active
        ? "border border-[#e7e6e0] dark:border-[#262B36] bg-white dark:bg-[#1F2937] font-medium text-[#141414] dark:text-[#F3F4F6] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        : "border border-transparent text-[#8a8a84] dark:text-[#9CA3AF] hover:bg-white/70 dark:hover:bg-[#1D212A] hover:text-[#141414] dark:hover:text-[#F3F4F6]"
    ].join(" ");
  }

  function renderToolbar() {
    const host = document.getElementById("yard-toolbar");
    if (!host) return;

    host.innerHTML = `
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div class="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-[#e9e8e2] dark:border-[#262B36] bg-[#f7f7f4] dark:bg-[#171A21] p-1" role="tablist" aria-label="Vehicle status">
          ${TABS.map((tab) => {
            const active = state.tab === tab;
            return `<button type="button" data-yard-tab="${tab}" role="tab" aria-selected="${active}"
              class="inline-flex items-center rounded-lg px-3 py-1.5 text-[12px] transition ${
                active
                  ? "border border-brand bg-white font-medium text-brand dark:border-[#5B93E0] dark:bg-[#1F2937] dark:text-[#5B93E0] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                  : "border border-transparent text-[#777771] dark:text-[#9CA3AF] hover:bg-white/70 dark:hover:bg-[#1D212A] hover:text-[#141414] dark:hover:text-[#F3F4F6]"
              }">
              ${tab}
              <span class="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${active ? "bg-[#f3f3ef] dark:bg-[#262B36] text-[#6f6f6a] dark:text-[#9CA3AF]" : "text-[#a3a39e] dark:text-[#9CA3AF]"}">${tabCount(tab)}</span>
            </button>`;
          }).join("")}
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <label class="relative block">
            <span class="sr-only">Filter by entity</span>
            <select id="yard-entity" aria-label="Filter by entity"
              class="h-9 min-w-[190px] appearance-none rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white dark:bg-[#0F1115] pl-3 pr-8 text-[12px] text-[#3d3d39] dark:text-[#F3F4F6] outline-none transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A] focus:border-brand/40 focus:ring-4 focus:ring-brand/15">
              <option value="all">All entities</option>
              ${window.clients.map((client) => `<option value="${client.id}" ${state.entity === client.id ? "selected" : ""}>${escapeHTML(client.name)}</option>`).join("")}
            </select>
            <span class="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[#9a9a94] dark:text-[#9CA3AF]">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
            </span>
          </label>

          <div class="inline-flex items-center gap-1 rounded-lg border border-[#e9e8e2] dark:border-[#262B36] bg-[#f7f7f4] dark:bg-[#171A21] p-1" role="group" aria-label="Change inventory view">
            <button type="button" data-yard-view="table" aria-pressed="${state.view === "table"}" title="Table view" class="${viewButtonClass(state.view === "table")}">
              ${window.RIGID_ICONS.list}
              <span class="hidden sm:inline">Table</span>
            </button>
            <button type="button" data-yard-view="grid" aria-pressed="${state.view === "grid"}" title="Card view" class="${viewButtonClass(state.view === "grid")}">
              ${window.RIGID_ICONS.grid}
              <span class="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>`;
  }

  function bindToolbar() {
    const host = document.getElementById("yard-toolbar");
    if (!host) return;

    host.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-yard-tab]");
      if (tab) {
        state.tab = tab.getAttribute("data-yard-tab");
        renderToolbar();
        renderContent();
        return;
      }

      const view = event.target.closest("[data-yard-view]");
      if (view) {
        state.view = view.getAttribute("data-yard-view");
        state.selected.clear();
        renderToolbar();
        renderContent();
      }
    });

    host.addEventListener("change", (event) => {
      if (event.target.id === "yard-entity") {
        state.entity = event.target.value;
        renderContent();
      }
    });
  }

  /* -------------------------------------------------------
     Filtering and content
     ------------------------------------------------------- */
  function filteredVehicles() {
    const query = state.query.trim().toLowerCase();

    return window.vehicles.filter((vehicle) => {
      if (state.tab !== "All" && vehicle.status !== state.tab) return false;

      const client = R.clientForVehicle(vehicle);
      if (state.entity !== "all" && (!client || client.id !== state.entity)) return false;

      if (query) {
        const haystack = [vehicle.plate, vehicle.make, vehicle.model, String(vehicle.year)].join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }

  function renderContent() {
    const host = document.getElementById("yard-content");
    if (!host) return;

    const rows = filteredVehicles();

    if (!rows.length) {
      host.innerHTML = `
        <div class="${R.table.card} flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
          <span class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e9e8e2] dark:border-[#262B36] bg-[#fbfbf9] dark:bg-[#1D212A] text-[#8a8a84] dark:text-[#9CA3AF]">
            ${window.RIGID_ICONS.car}
          </span>
          <h3 class="mt-4 text-[14px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]">No results found</h3>
          <p class="mt-1 max-w-xs text-[12px] leading-5 text-[#8a8a84] dark:text-[#9CA3AF]">Try another plate, make, model or entity.</p>
          <button type="button" data-clear-yard-filters class="mt-4 inline-flex h-8 items-center rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3 dark:border-[#262B36] dark:bg-[#0F1115] text-[12px] font-medium text-[#3d3d39] dark:text-[#F3F4F6] shadow-sm transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30">
            Clear filters
          </button>
        </div>`;
      return;
    }

    host.innerHTML = state.view === "table" ? renderTable(rows) : renderGrid(rows);
    if (state.view === "table") updateSelectAll(rows);
  }

  function vehicleCell(vehicle) {
    return `
      <div class="flex items-center gap-2.5">
        <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#efeee9] dark:border-[#262B36] bg-[#f7f7f4] dark:bg-[#171A21] text-[#8d8d87] dark:text-[#9CA3AF]">
          ${window.RIGID_ICONS.car}
        </span>
        <div class="min-w-0">
          <p class="max-w-[150px] truncate text-[11px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]" title="${escapeHTML(R.vehicleName(vehicle))}">${escapeHTML(R.vehicleName(vehicle))}</p>
          <p class="mt-0.5 text-[10.5px] font-medium tabular-nums tracking-[0.04em] text-[#8a8a84] dark:text-[#9CA3AF]">${escapeHTML(vehicle.plate)}</p>
        </div>
      </div>`;
  }

  function renderTable(rows) {
    const selectedCount = rows.filter((vehicle) => state.selected.has(vehicle.id)).length;

    return `
      <div class="${R.table.card}">
        <div class="${R.table.scroller}">
          <table class="${R.table.table} min-w-[1040px] table-fixed">
            <colgroup>
              <col class="w-[4%]">
              <col class="w-[18.5%]">
              <col class="w-[11.5%]">
              <col class="w-[6.5%]">
              <col class="w-[8.5%]">
              <col class="w-[10%]">
              <col class="w-[10.5%]">
              <col class="w-[9.5%]">
              <col class="w-[10%]">
              <col class="w-[11%]">
            </colgroup>
            <thead class="${R.table.thead}">
              <tr>
                <th class="px-3 py-3">
                  <input id="select-all-yard" type="checkbox" class="${R.table.checkbox}" aria-label="Select all visible vehicles">
                </th>
                <th class="${head}">Vehicle</th>
                <th class="${head}">Entity</th>
                <th class="${head}">Days in<br>Yard</th>
                <th class="${headRight}">Daily Fee</th>
                <th class="${headRight}">Accrued<br>Storage</th>
                <th class="${headRight}">Reserve<br>Price</th>
                <th class="${head}">Auction<br>Date</th>
                <th class="${headRight}">Selling<br>Price</th>
                <th class="${head}">Status</th>
              </tr>
            </thead>
            <tbody class="${R.table.tbody}">
              ${rows.map((vehicle) => {
                const client = R.clientForVehicle(vehicle);
                const selected = state.selected.has(vehicle.id);
                const sold = vehicle.sellingPrice !== null && vehicle.sellingPrice !== undefined;

                return `
                  <tr data-vehicle-id="${vehicle.id}" tabindex="0" class="${selected ? R.table.trSelected : R.table.trClickable}">
                    <td class="px-3 py-3">
                      <input type="checkbox" data-yard-check="${vehicle.id}" class="${R.table.checkbox}" ${selected ? "checked" : ""} aria-label="Select ${escapeHTML(vehicle.plate)}">
                    </td>
                    <td class="${cell}">${vehicleCell(vehicle)}</td>
                    <td class="${cell}">
                      <p class="max-w-[130px] truncate text-[10.5px] text-[#3f3f3b] dark:text-[#F3F4F6]" title="${escapeHTML(client ? client.name : "—")}">${escapeHTML(client ? client.name : "—")}</p>
                    </td>
                    <td class="${cell} tabular-nums">${R.daysInYard(vehicle)}</td>
                    <td class="${cellRight} tabular-nums">${formatKES(vehicle.dailyStorageFee)}</td>
                    <td class="${cellRight} tabular-nums">${formatKES(R.accruedStorage(vehicle))}</td>
                    <td class="${cellRight} tabular-nums">${formatKES(vehicle.reservePrice)}</td>
                    <td class="${cell}"><span class="text-[11.5px] text-[#5f5f5a] dark:text-[#F3F4F6]">${vehicle.auctionDate ? formatDate(vehicle.auctionDate) : "—"}</span></td>
                    <td class="${cellRight} tabular-nums">${sold ? `<span class="font-medium text-[#15803d] dark:text-[#4ADE80]">${formatKES(vehicle.sellingPrice)}</span>` : `<span class="text-[#b0afa9] dark:text-[#9CA3AF]">-</span>`}</td>
                    <td class="${cell}">${statusBadge(vehicle.status, true)}</td>
                  </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0efeb] dark:border-[#262B36] px-5 py-3">
          <p class="text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">Showing <span class="font-medium text-[#3f3f3b] dark:text-[#F3F4F6]">${rows.length}</span> of ${window.vehicles.length} vehicles</p>
          <div class="flex items-center gap-3 text-[11px]">
            ${selectedCount
              ? `<span class="text-[#6f6f6a] dark:text-[#9CA3AF]">${selectedCount} selected</span>
                 <button type="button" data-clear-yard-selection class="font-medium text-[#3f3f3b] dark:text-[#F3F4F6] underline decoration-[#d4d3cc] dark:decoration-[#4B5563] underline-offset-2 transition hover:text-[#141414] dark:hover:text-[#F3F4F6]">Clear</button>`
              : `<span class="text-[#a3a39e] dark:text-[#9CA3AF]">Click a row to view vehicle details</span>`}
          </div>
        </div>
      </div>`;
  }

  function renderGrid(rows) {
    return `
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        ${rows.map((vehicle) => {
          const client = R.clientForVehicle(vehicle);
          return `
            <article data-vehicle-card="${vehicle.id}" tabindex="0" role="button"
              class="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[#e9e8e2] dark:border-[#262B36] bg-white dark:bg-[#171A21] text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition hover:border-[#dcdbd4] dark:border-[#262B36] hover:shadow-[0_14px_34px_-26px_rgba(0,0,0,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30">
              <div class="relative flex h-36 items-center justify-center bg-[#efefeb] dark:bg-[#1D212A]">
                <span class="text-[#a9a8a2] dark:text-[#9CA3AF] transition group-hover:text-[#7f7f79]">
                  ${window.RIGID_ICONS.car.replace('class="h-4 w-4"', 'class="h-12 w-12"')}
                </span>
                <span class="absolute left-3 top-3 rounded-md border border-[#e6e5df] dark:border-[#262B36] bg-white/90 dark:bg-[#1F2937] px-1.5 py-0.5 text-[10px] font-medium tabular-nums tracking-[0.04em] text-[#5f5f5a] dark:text-[#F3F4F6] shadow-sm">
                  ${escapeHTML(vehicle.plate)}
                </span>
                <span class="absolute right-3 top-3 rounded-md border border-[#e9e8e2] dark:border-[#262B36] bg-white/90 dark:bg-[#1F2937] px-2 py-1 shadow-sm">
                  ${statusBadge(vehicle.status, true)}
                </span>
              </div>
              <div class="flex flex-1 flex-col p-4">
                <h3 class="truncate text-[13px] font-medium text-[#242422] dark:text-[#F3F4F6]" title="${escapeHTML(R.vehicleName(vehicle))}">${escapeHTML(R.vehicleName(vehicle))}</h3>
                <p class="mt-0.5 truncate text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">${escapeHTML(client ? client.name : "—")}</p>
                <div class="mt-4 grid grid-cols-2 gap-3 border-t border-[#f0efeb] dark:border-[#262B36] pt-3">
                  <div>
                    <p class="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#9a9a94] dark:text-[#9CA3AF]">Reserve</p>
                    <p class="mt-1 text-[12px] font-medium tabular-nums text-[#2a2a27] dark:text-[#F3F4F6]">${formatKES(vehicle.reservePrice)}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#9a9a94] dark:text-[#9CA3AF]">Auction</p>
                    <p class="mt-1 text-[12px] text-[#5f5f5a] dark:text-[#F3F4F6]">${vehicle.auctionDate ? formatDate(vehicle.auctionDate) : "—"}</p>
                  </div>
                </div>
              </div>
            </article>`;
        }).join("")}
      </div>
      <p class="mt-3 text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">Showing <span class="font-medium text-[#3f3f3b] dark:text-[#F3F4F6]">${rows.length}</span> of ${window.vehicles.length} vehicles</p>`;
  }

  function updateSelectAll(rows) {
    const selectAll = document.getElementById("select-all-yard");
    if (!selectAll) return;
    const selectedVisible = rows.filter((vehicle) => state.selected.has(vehicle.id)).length;
    selectAll.checked = rows.length > 0 && selectedVisible === rows.length;
    selectAll.indeterminate = selectedVisible > 0 && selectedVisible < rows.length;
  }

  function bindContent() {
    const host = document.getElementById("yard-content");
    if (!host) return;

    host.addEventListener("change", (event) => {
      if (event.target.id === "select-all-yard") {
        filteredVehicles().forEach((vehicle) => {
          if (event.target.checked) state.selected.add(vehicle.id);
          else state.selected.delete(vehicle.id);
        });
        renderContent();
        return;
      }

      const checkbox = event.target.closest("[data-yard-check]");
      if (checkbox) {
        const id = checkbox.getAttribute("data-yard-check");
        if (checkbox.checked) state.selected.add(id);
        else state.selected.delete(id);
        renderContent();
      }
    });

    host.addEventListener("click", (event) => {
      if (event.target.closest("[data-clear-yard-filters]")) {
        clearFilters();
        return;
      }

      if (event.target.closest("[data-clear-yard-selection]")) {
        state.selected.clear();
        renderContent();
        return;
      }

      if (event.target.closest("input, button, a, label")) return;

      const row = event.target.closest("[data-vehicle-id]");
      const card = event.target.closest("[data-vehicle-card]");
      if (row) openPanel(row.getAttribute("data-vehicle-id"));
      else if (card) openPanel(card.getAttribute("data-vehicle-card"));
    });

    host.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const row = event.target.closest("[data-vehicle-id]");
      const card = event.target.closest("[data-vehicle-card]");
      if (row && event.target === row) openPanel(row.getAttribute("data-vehicle-id"));
      if (card && event.target === card) openPanel(card.getAttribute("data-vehicle-card"));
    });
  }

  function clearFilters() {
    state.tab = "All";
    state.entity = "all";
    state.query = "";
    state.selected.clear();
    const search = document.getElementById("global-search");
    if (search) search.value = "";
    renderToolbar();
    renderContent();
  }

  /* -------------------------------------------------------
     Reserve price modal
     ------------------------------------------------------- */
  function updateReserveFromPage() {
    const selectedVisible = filteredVehicles().filter((vehicle) => state.selected.has(vehicle.id));

    if (selectedVisible.length > 1) {
      toast("Select a single vehicle to update its reserve.");
      return;
    }

    if (selectedVisible.length === 1) {
      const vehicle = selectedVisible[0];
      if (!ACTIVE_STATUSES.includes(vehicle.status)) {
        toast("Reserve price can only be updated for vehicles in the yard or advertised.");
        return;
      }
      openReserveModal(vehicle.id);
      return;
    }

    openReserveModal();
  }

  function closeReserveModal() {
    if (modal) modal.innerHTML = "";
  }

  function openReserveModal(vehicleId) {
    if (!modal) return;
    const activeVehicles = window.vehicles.filter((vehicle) => ACTIVE_STATUSES.includes(vehicle.status));
    if (!activeVehicles.length) {
      toast("There are no vehicles currently available for a reserve update.");
      return;
    }

    const target = activeVehicles.find((vehicle) => vehicle.id === vehicleId) || activeVehicles[0];
    const fieldClass = "mt-1.5 h-9 w-full rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3 dark:border-[#262B36] dark:bg-[#0F1115] text-[12px] text-[#2a2a27] dark:text-[#F3F4F6] outline-none transition placeholder:text-[#b1b0aa] dark:placeholder:text-[#6B7280] focus:border-brand/40 focus:ring-4 focus:ring-brand/15";

    modal.innerHTML = `
      <div class="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/25 backdrop-blur-[1px]" data-modal-close></div>
        <div class="modal-enter relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#e7e6e0] dark:border-[#262B36] bg-white dark:bg-[#171A21] shadow-2xl" role="dialog" aria-modal="true" aria-label="Update reserve price">
          <div class="flex items-start justify-between gap-4 border-b border-[#f0efeb] dark:border-[#262B36] px-5 py-4">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a3a39e] dark:text-[#9CA3AF]">Rigid Motors</p>
              <h2 class="mt-1 text-[17px] font-medium tracking-[-0.02em] text-[#1c1c1a] dark:text-[#F3F4F6]">Update reserve price</h2>
            </div>
            <button type="button" data-modal-close class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#8a8a84] dark:text-[#9CA3AF] transition hover:bg-[#f5f5f2] dark:hover:bg-[#1D212A] hover:text-[#141414] dark:hover:text-[#F3F4F6]" aria-label="Close reserve price form">
              ${window.RIGID_ICONS.close}
            </button>
          </div>

          <form id="reserve-form" class="p-5">
            <label class="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a84] dark:text-[#9CA3AF]">
              Vehicle
              <select id="reserve-vehicle" name="vehicleId" class="${fieldClass}">
                ${activeVehicles.map((vehicle) => `<option value="${vehicle.id}" ${vehicle.id === target.id ? "selected" : ""}>${escapeHTML(vehicle.plate)} · ${escapeHTML(R.vehicleName(vehicle))}</option>`).join("")}
              </select>
            </label>

            <p class="mt-2 text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]" data-current-reserve>Current reserve: ${formatKES(target.reservePrice)}</p>

            <label class="mt-4 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a84] dark:text-[#9CA3AF]">
              New reserve price (KES)
              <input name="reservePrice" type="number" required min="1" step="any" inputmode="numeric" value="${target.reservePrice}" class="${fieldClass}">
            </label>

            <div class="mt-6 flex items-center justify-end gap-2 border-t border-[#f0efeb] dark:border-[#262B36] pt-4">
              <button type="button" data-modal-close class="inline-flex h-9 items-center rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3.5 dark:border-[#262B36] dark:bg-[#171A21] text-[12px] font-medium text-[#3d3d39] dark:text-[#F3F4F6] shadow-sm transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A]">Cancel</button>
              <button type="submit" class="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-[12px] font-medium text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">Save reserve</button>
            </div>
          </form>
        </div>
      </div>`;

    window.requestAnimationFrame(() => modal.querySelector('input[name="reservePrice"]')?.focus());
  }

  function bindModal() {
    if (!modal) return;

    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-modal-close]")) closeReserveModal();
    });

    modal.addEventListener("change", (event) => {
      if (event.target.id !== "reserve-vehicle") return;
      const vehicle = R.vehicleById(event.target.value);
      const hint = modal.querySelector("[data-current-reserve]");
      if (vehicle && hint) hint.textContent = `Current reserve: ${formatKES(vehicle.reservePrice)}`;
    });

    modal.addEventListener("submit", (event) => {
      if (event.target.id !== "reserve-form") return;
      event.preventDefault();

      const form = event.target;
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const vehicle = R.vehicleById(String(data.get("vehicleId")));
      const price = Number(data.get("reservePrice"));

      if (!vehicle || !ACTIVE_STATUSES.includes(vehicle.status)) {
        toast("Reserve price can only be updated for vehicles in the yard or advertised.");
        return;
      }

      if (!Number.isFinite(price) || price <= 0) {
        toast("Enter a valid reserve price.");
        return;
      }

      vehicle.reservePrice = price;
      closeReserveModal();
      renderStats();
      renderContent();
      if (state.activeVehicleId === vehicle.id) renderPanel();
      toast(`Reserve price updated for ${vehicle.plate}.`);
    });
  }

  /* -------------------------------------------------------
     Vehicle detail panel
     ------------------------------------------------------- */
  function openPanel(id) {
    if (!R.vehicleById(id)) return;
    state.activeVehicleId = id;
    state.detailTab = "Vehicle";
    state.expanded = false;
    renderPanel();
  }

  function closePanel() {
    state.activeVehicleId = null;
    if (panels) panels.innerHTML = "";
  }

  function detailRow(label, value) {
    return `
      <div class="flex items-start justify-between gap-5 py-2.5">
        <dt class="shrink-0 text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">${label}</dt>
        <dd class="text-right text-[12px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]">${value}</dd>
      </div>`;
  }

  function renderPanel() {
    if (!panels) return;
    const vehicle = R.vehicleById(state.activeVehicleId);
    if (!vehicle) {
      closePanel();
      return;
    }

    const caseItem = R.caseForVehicle(vehicle);
    const client = R.clientForVehicle(vehicle);
    const canUpdate = ACTIVE_STATUSES.includes(vehicle.status);
    const viewCaseHref = caseItem ? `../auctioneers/cases.html?case=${encodeURIComponent(caseItem.id)}` : "";

    panels.innerHTML = `
      <div class="fixed inset-0 z-[70]">
        <div class="absolute inset-0 bg-black/15 backdrop-blur-[1px]" data-panel-close></div>
        <aside class="panel-enter absolute inset-0 z-10 flex w-full flex-col border-[#e7e6e0] dark:border-[#262B36] bg-white dark:bg-[#171A21] shadow-2xl sm:inset-y-4 sm:left-auto sm:right-4 ${state.expanded ? "sm:w-[740px]" : "sm:w-[460px]"} sm:rounded-2xl sm:border" aria-label="Vehicle details">
          <div class="flex shrink-0 items-start justify-between gap-4 border-b border-[#f0efeb] dark:border-[#262B36] px-5 pb-4 pt-5">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#a3a39e] dark:text-[#9CA3AF]">Vehicle</span>
                <span class="text-[11px] font-semibold tabular-nums text-[#6f6f6a] dark:text-[#9CA3AF]">${vehicle.id}</span>
              </div>
              <div class="mt-3 flex items-center gap-3">
                <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ecebe5] dark:border-[#262B36] bg-[#f7f7f4] dark:bg-[#171A21] text-[#8d8d87] dark:text-[#9CA3AF]">
                  ${window.RIGID_ICONS.car}
                </span>
                <div class="min-w-0">
                  <h2 class="truncate text-[18px] font-medium tracking-[-0.02em] text-[#1c1c1a] dark:text-[#F3F4F6]">${escapeHTML(R.vehicleName(vehicle))}</h2>
                  <div class="mt-1 flex flex-wrap items-center gap-2">
                    <span class="inline-flex rounded border border-[#e6e5df] dark:border-[#262B36] bg-white dark:bg-[#1F2937] px-1.5 py-0.5 text-[9.5px] font-medium tabular-nums tracking-[0.04em] text-[#5f5f5a] dark:text-[#F3F4F6]">${escapeHTML(vehicle.plate)}</span>
                    ${statusBadge(vehicle.status)}
                  </div>
                </div>
              </div>
              <p class="mt-4 truncate text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">
                ${escapeHTML(client ? client.name : "No entity")}${caseItem ? ` · ${caseItem.id}` : ""}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-1">
              <button type="button" data-panel-expand class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#8a8a84] dark:text-[#9CA3AF] transition hover:bg-[#f5f5f2] dark:hover:bg-[#1D212A] hover:text-[#141414] dark:hover:text-[#F3F4F6]" aria-label="${state.expanded ? "Collapse details" : "Expand details"}" title="${state.expanded ? "Collapse" : "Expand"}">
                ${window.RIGID_ICONS.expand}
              </button>
              <button type="button" data-panel-close class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#8a8a84] dark:text-[#9CA3AF] transition hover:bg-[#f5f5f2] dark:hover:bg-[#1D212A] hover:text-[#141414] dark:hover:text-[#F3F4F6]" aria-label="Close details">
                ${window.RIGID_ICONS.close}
              </button>
            </div>
          </div>

          <div class="flex shrink-0 gap-5 border-b border-[#f0efeb] dark:border-[#262B36] px-5">
            ${DETAIL_TABS.map((tab) => `
              <button type="button" data-yard-detail-tab="${tab}"
                class="-mb-px border-b-2 px-0.5 pb-3 pt-3 text-[12px] transition ${
                  state.detailTab === tab
                    ? "border-[#141414] font-medium text-[#141414] dark:border-[#F3F4F6] dark:text-[#F3F4F6]"
                    : "border-transparent text-[#8a8a84] dark:text-[#9CA3AF] hover:text-[#3f3f3b] dark:hover:text-[#F3F4F6]"
                }">${tab}</button>`).join("")}
          </div>

          <div class="flex-1 overflow-y-auto px-5 py-5">
            ${renderPanelTab(vehicle, caseItem, client)}
          </div>

          <div class="flex shrink-0 flex-wrap items-center gap-2 border-t border-[#f0efeb] dark:border-[#262B36] p-4">
            ${caseItem
              ? `<a href="${viewCaseHref}" class="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3.5 dark:border-[#262B36] dark:bg-[#171A21] text-[12px] font-medium text-[#3d3d39] dark:text-[#F3F4F6] shadow-sm transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A]">
                   View Case
                   ${window.RIGID_ICONS.arrowUpRight.replace('class="h-4 w-4"', 'class="h-3.5 w-3.5 text-[#7a7a74] dark:text-[#9CA3AF]"')}
                 </a>`
              : `<span class="text-[11px] text-[#a3a39e] dark:text-[#9CA3AF]">No linked case</span>`}
            ${canUpdate
              ? `<button type="button" data-panel-reserve class="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-brand px-3.5 text-[12px] font-medium text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">Update Reserve Price</button>`
              : `<span class="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-[#f3f3ef] dark:bg-[#262B36] px-3.5 text-[12px] font-medium text-[#a3a39e] dark:text-[#9CA3AF]">${vehicle.status === "Released" ? "Vehicle released" : "Reserve locked"}</span>`}
          </div>
        </aside>
      </div>`;
  }

  function renderPanelTab(vehicle, caseItem, client) {
    if (state.detailTab === "Fees") return renderFeesTab(vehicle);
    if (state.detailTab === "Sale") return renderSaleTab(vehicle, caseItem);
    return renderVehicleTab(vehicle, client);
  }

  function renderVehicleTab(vehicle, client) {
    return `
      <div class="rounded-xl border border-[#ecebe5] dark:border-[#262B36] px-4 py-2">
        <dl class="divide-y divide-[#f2f1ed] dark:divide-[#262B36]">
          ${detailRow("Make", escapeHTML(vehicle.make))}
          ${detailRow("Model", escapeHTML(vehicle.model))}
          ${detailRow("Year", vehicle.year)}
          ${detailRow("Colour", escapeHTML(vehicle.colour))}
          ${detailRow("Chassis no.", `<span class="text-[11px] tracking-[0.02em] text-[#4a4a45] dark:text-[#F3F4F6]">${escapeHTML(vehicle.chassisNo)}</span>`)}
          ${detailRow("Mileage", `${Number(vehicle.mileage).toLocaleString("en-KE")} km`)}
          ${detailRow("Condition", escapeHTML(vehicle.condition))}
          ${detailRow("Yard location", escapeHTML(vehicle.yardLocation))}
          ${detailRow("Entity", escapeHTML(client ? client.name : "—"))}
        </dl>
      </div>`;
  }

  function storageEndDate(vehicle) {
    if (vehicle.status === "Sold" && vehicle.soldDate) return vehicle.soldDate;
    if (vehicle.status === "Released" && vehicle.releasedDate) return vehicle.releasedDate;
    return R.today;
  }

  function renderFeesTab(vehicle) {
    const days = R.daysInYard(vehicle);
    const accrued = R.accruedStorage(vehicle);
    const endDate = storageEndDate(vehicle);

    return `
      <div class="space-y-4">
        <div class="rounded-xl border border-[#ecebe5] dark:border-[#262B36] p-4">
          <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a9a94] dark:text-[#9CA3AF]">Accrued storage</p>
          <p class="mt-2 text-[24px] font-semibold tracking-[-0.03em] tabular-nums text-[#141414] dark:text-[#F3F4F6]">${formatKES(accrued)}</p>
          <p class="mt-1 text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">${days} days · calculated to ${formatDate(endDate)}</p>
        </div>

        <div class="rounded-xl border border-[#ecebe5] dark:border-[#262B36] px-4 py-2">
          <dl class="divide-y divide-[#f2f1ed] dark:divide-[#262B36]">
            ${detailRow("Date in", formatDate(vehicle.dateIn))}
            ${detailRow("Days in yard", `${days} days`)}
            ${detailRow("Daily fee", formatKES(vehicle.dailyStorageFee))}
            ${detailRow("Accrued total", formatKES(accrued))}
          </dl>
        </div>

        <div class="rounded-xl bg-[#fafaf8] dark:bg-[#1D212A] px-4 py-3 text-[11px]">
          <div class="flex items-center justify-between gap-4 py-1">
            <span class="text-[#8a8a84] dark:text-[#9CA3AF]">Storage window</span>
            <span class="text-right font-medium text-[#3f3f3b] dark:text-[#F3F4F6]">${formatDate(vehicle.dateIn)} – ${formatDate(endDate)}</span>
          </div>
          <div class="flex items-center justify-between gap-4 py-1">
            <span class="text-[#8a8a84] dark:text-[#9CA3AF]">Breakdown</span>
            <span class="text-right font-medium tabular-nums text-[#3f3f3b] dark:text-[#F3F4F6]">${days} days × ${formatKES(vehicle.dailyStorageFee)}</span>
          </div>
        </div>
      </div>`;
  }

  function renderSaleTab(vehicle, caseItem) {
    const sold = vehicle.sellingPrice !== null && vehicle.sellingPrice !== undefined;
    const released = vehicle.status === "Released";
    const difference = sold ? Number(vehicle.sellingPrice) - Number(vehicle.reservePrice) : null;
    const differenceAmount = difference === null
      ? "—"
      : `<span class="${difference >= 0 ? "text-[#15803d] dark:text-[#4ADE80]" : "text-accent dark:text-accent"}">${difference >= 0 ? "+" : "−"} ${formatKES(Math.abs(difference))}</span>`;
    const statusNote = sold
      ? `<div class="rounded-xl bg-[#f2f8f3] dark:bg-[#172A1D] px-4 py-3 text-[11px] leading-5 text-[#3f6b4f] dark:text-[#9BD3B0]">
           Sold${vehicle.soldDate ? ` on ${formatDate(vehicle.soldDate)}` : ""}. The sale is complete and the reserve is locked.
         </div>`
      : released
        ? `<div class="rounded-xl bg-[#f7f7f4] dark:bg-[#171A21] px-4 py-3 text-[11px] leading-5 text-[#6f6f6a] dark:text-[#9CA3AF]">
             Released from the yard. This vehicle is no longer available for auction.
           </div>`
        : `<div class="rounded-xl border border-dashed border-[#e4e2dc] dark:border-[#262B36] bg-[#fcfcfa] dark:bg-[#171A21] px-4 py-4 text-[11px] leading-5 text-[#8a8a84] dark:text-[#9CA3AF]">
             ${vehicle.status === "In Yard" ? "In the yard and not yet scheduled for auction." : "Not yet sold. The vehicle remains available for the scheduled auction."}
           </div>`;

    return `
      <div class="space-y-4">
        <div class="rounded-xl border border-[#ecebe5] dark:border-[#262B36] px-4 py-2">
          <dl class="divide-y divide-[#f2f1ed] dark:divide-[#262B36]">
            ${detailRow("Reserve price", `<span class="tabular-nums">${formatKES(vehicle.reservePrice)}</span>`)}
            ${detailRow("Auction date", vehicle.auctionDate ? formatDate(vehicle.auctionDate) : "—")}
            ${detailRow("Selling price", sold ? `<span class="tabular-nums text-[#15803d] dark:text-[#4ADE80]">${formatKES(vehicle.sellingPrice)}</span>` : `<span class="text-[#b0afa9] dark:text-[#9CA3AF]">-</span>`)}
            ${detailRow("Difference vs reserve", differenceAmount)}
            ${sold ? detailRow("Buyer", escapeHTML(vehicle.buyerName || "—")) : ""}
            ${released ? detailRow("Released", formatDate(vehicle.releasedDate)) : ""}
          </dl>
        </div>

        ${statusNote}

        ${ACTIVE_STATUSES.includes(vehicle.status)
          ? `<button type="button" data-sale-reserve class="inline-flex h-9 w-full items-center justify-center rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3.5 dark:border-[#262B36] dark:bg-[#171A21] text-[12px] font-medium text-[#3d3d39] dark:text-[#F3F4F6] shadow-sm transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30">
               Update reserve price
             </button>`
          : ""}

        ${caseItem
          ? `<a href="../auctioneers/cases.html?case=${encodeURIComponent(caseItem.id)}" class="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6f6f6a] dark:text-[#9CA3AF] transition hover:text-[#141414] dark:hover:text-[#F3F4F6]">
               View linked case ${caseItem.id}
               ${window.RIGID_ICONS.arrowUpRight.replace('class="h-4 w-4"', 'class="h-3.5 w-3.5"')}
             </a>`
          : ""}
      </div>`;
  }

  function bindPanel() {
    if (!panels) return;

    panels.addEventListener("click", (event) => {
      if (event.target.closest("[data-panel-close]")) {
        closePanel();
        return;
      }

      const tab = event.target.closest("[data-yard-detail-tab]");
      if (tab) {
        state.detailTab = tab.getAttribute("data-yard-detail-tab");
        renderPanel();
        return;
      }

      if (event.target.closest("[data-panel-expand]")) {
        state.expanded = !state.expanded;
        renderPanel();
        return;
      }

      if (event.target.closest("[data-panel-reserve]") || event.target.closest("[data-sale-reserve]")) {
        if (state.activeVehicleId) openReserveModal(state.activeVehicleId);
      }
    });
  }

  function bindEscapeKey() {
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (modal && modal.innerHTML.trim()) closeReserveModal();
      else if (state.activeVehicleId) closePanel();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
