/* =========================================================
   Cases — filterable table, selection, detail panel and
   in-memory stage progression.
   ========================================================= */

(function () {
  "use strict";

  const { formatKES, formatDate, statusBadge, avatar, escapeHTML, toast } = window;
  const R = window.RIGID;
  const TABS = ["All", "Proclamation", "Repossessed", "Advertised", "Auctioned", "Closed"];
  const DETAIL_TABS = ["Details", "Timeline", "Docs"];

  const state = {
    tab: "All",
    query: "",
    selected: new Set(),
    activeCaseId: null,
    detailTab: "Details",
    expanded: false,
    uploadedDocs: new Map(),
    flashId: null
  };

  let panels;
  let modal;

  /* -------------------------------------------------------
     Init
     ------------------------------------------------------- */
  function init() {
    readQueryState();
    createLayers();
    bindStaticControls();
    bindSearch();
    bindTabs();
    bindTable();
    bindPanel();
    bindModal();
    bindEscapeKey();

    renderTabs();
    renderTable();

    if (state.activeCaseId) renderPanel();

    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") openNewCaseModal();
  }

  function readQueryState() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (TABS.includes(tab)) state.tab = tab;

    const caseId = params.get("case");
    if (caseId && R.caseById(caseId)) state.activeCaseId = caseId;
  }

  function createLayers() {
    panels = document.createElement("div");
    panels.id = "case-panel-root";
    document.body.appendChild(panels);

    modal = document.createElement("div");
    modal.id = "case-modal-root";
    document.body.appendChild(modal);
  }

  function removeQueryParam(name) {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(name)) return;
    url.searchParams.delete(name);
    try {
      window.history.replaceState({}, "", url);
    } catch (error) {
      /* Some browsers restrict history changes on file:// URLs. */
    }
  }

  function bindStaticControls() {
    document.getElementById("export-cases")?.addEventListener("click", () => toast("Export started"));
    document.getElementById("import-cases")?.addEventListener("click", () => toast("Import is not wired up in this mockup."));

    document.getElementById("new-case-button")?.addEventListener("click", (event) => {
      event.preventDefault();
      openNewCaseModal();
    });
  }

  function bindSearch() {
    R.bindGlobalSearch((value) => {
      state.query = value;
      renderTable();
    }, "Search debtor, case no. or plate…");
  }

  /* -------------------------------------------------------
     Tabs
     ------------------------------------------------------- */
  function tabCount(tab) {
    return tab === "All"
      ? window.cases.length
      : window.cases.filter((item) => item.stage === tab).length;
  }

  function renderTabs() {
    const host = document.getElementById("case-tabs");
    if (!host) return;

    host.innerHTML = `
      <div class="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-[#e9e8e2] dark:border-[#262B36] bg-[#f7f7f4] dark:bg-[#171A21] p-1" role="tablist" aria-label="Case stages">
        ${TABS.map((tab) => {
          const active = state.tab === tab;
          return `<button type="button" data-case-tab="${tab}" role="tab" aria-selected="${active}"
            class="inline-flex items-center rounded-lg px-3 py-1.5 text-[12px] transition ${
              active
                ? "border border-brand bg-white font-medium text-brand dark:border-[#5B93E0] dark:bg-[#1F2937] dark:text-[#5B93E0] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                : "border border-transparent text-[#777771] dark:text-[#9CA3AF] hover:bg-white/70 dark:hover:bg-[#1D212A] hover:text-[#141414] dark:hover:text-[#F3F4F6]"
            }">
            ${tab}
            <span class="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${active ? "bg-[#f3f3ef] dark:bg-[#262B36] text-[#6f6f6a] dark:text-[#9CA3AF]" : "text-[#a3a39e] dark:text-[#9CA3AF]"}">${tabCount(tab)}</span>
          </button>`;
        }).join("")}
      </div>`;
  }

  function bindTabs() {
    document.getElementById("case-tabs")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-case-tab]");
      if (!button) return;
      state.tab = button.getAttribute("data-case-tab");
      renderTabs();
      renderTable();
    });
  }

  /* -------------------------------------------------------
     Table
     ------------------------------------------------------- */
  function filteredCases() {
    const query = state.query.trim().toLowerCase();

    return window.cases.filter((caseItem) => {
      if (state.tab !== "All" && caseItem.stage !== state.tab) return false;
      if (!query) return true;

      const client = R.clientById(caseItem.clientId);
      const plates = R.vehiclesForCase(caseItem.id).map((vehicle) => vehicle.plate).join(" ");
      const haystack = [
        caseItem.id,
        caseItem.debtorName,
        caseItem.debtorPhone,
        client ? client.name : "",
        plates
      ].join(" ").toLowerCase();

      return haystack.includes(query);
    });
  }

  function keyDateCell(caseItem) {
    const keyDate = R.keyDateForCase(caseItem);

    if (keyDate.days !== null && (caseItem.stage === "Proclamation" || Math.abs(keyDate.days) <= 7)) {
      return `
        <div class="leading-4">
          <p class="text-[12px] font-medium text-[#3f3f3b] dark:text-[#F3F4F6]">${formatDate(keyDate.date)}</p>
          <p class="mt-0.5 text-[10.5px] font-medium ${R.countdownTone(keyDate.days)}">${R.countdownLabel(keyDate.days)}</p>
        </div>`;
    }

    return `
      <div class="leading-4">
        <p class="text-[12px] font-medium text-[#3f3f3b] dark:text-[#F3F4F6]">${formatDate(keyDate.date)}</p>
        <p class="mt-0.5 text-[10.5px] text-[#9a9a94] dark:text-[#9CA3AF]">${escapeHTML(keyDate.label)}</p>
      </div>`;
  }

  function renderTable() {
    const host = document.getElementById("cases-table");
    if (!host) return;

    const rows = filteredCases();

    if (!rows.length) {
      host.innerHTML = `
        <div class="${R.table.card} flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
          <span class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e9e8e2] dark:border-[#262B36] bg-[#fbfbf9] dark:bg-[#1D212A] text-[#8a8a84] dark:text-[#9CA3AF]">
            ${window.RIGID_ICONS.file}
          </span>
          <h3 class="mt-4 text-[14px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]">No cases found</h3>
          <p class="mt-1 max-w-xs text-[12px] leading-5 text-[#8a8a84] dark:text-[#9CA3AF]">
            ${state.query ? "Try a different debtor, case number or number plate." : "There are no cases in this stage yet."}
          </p>
          <button type="button" data-clear-filters class="mt-4 inline-flex h-8 items-center rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3 dark:border-[#262B36] dark:bg-[#0F1115] text-[12px] font-medium text-[#3d3d39] dark:text-[#F3F4F6] shadow-sm transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A]">
            Clear filters
          </button>
        </div>`;
      return;
    }

    const selectedCount = rows.filter((item) => state.selected.has(item.id)).length;

    host.innerHTML = `
      <div class="${R.table.card}">
        <div class="${R.table.scroller}">
          <table class="${R.table.table} min-w-[1000px] table-fixed">
            <colgroup>
              <col class="w-[4.5%]">
              <col class="w-[10.5%]">
              <col class="w-[20%]">
              <col class="w-[15%]">
              <col class="w-[10.5%]">
              <col class="w-[11%]">
              <col class="w-[11%]">
              <col class="w-[12.5%]">
              <col class="w-[5%]">
            </colgroup>
            <thead class="${R.table.thead}">
              <tr>
                <th class="px-3 py-3">
                  <input id="select-all-cases" type="checkbox" class="${R.table.checkbox}" aria-label="Select all visible cases">
                </th>
                <th class="${R.table.th}">Case No.</th>
                <th class="${R.table.th}">Debtor</th>
                <th class="${R.table.th}">Client</th>
                <th class="${R.table.th}">Stage</th>
                <th class="${R.table.thRight}">Amount Owed</th>
                <th class="${R.table.th}">Key Date</th>
                <th class="${R.table.th}">Status</th>
                <th class="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody class="${R.table.tbody}">
              ${rows.map((caseItem) => {
                const client = R.clientById(caseItem.clientId) || { name: "—", type: "" };
                const isSelected = state.selected.has(caseItem.id);
                const flash = state.flashId === caseItem.id ? "row-flash" : "";

                return `
                  <tr data-case-id="${caseItem.id}" tabindex="0" class="${isSelected ? R.table.trSelected : R.table.trClickable} ${flash}">
                    <td class="px-3 py-3.5">
                      <input type="checkbox" data-case-select="${caseItem.id}" class="${R.table.checkbox}"
                        ${isSelected ? "checked" : ""} aria-label="Select case ${caseItem.id}">
                    </td>
                    <td class="${R.table.td}">
                      <span class="text-[12.5px] font-medium tabular-nums text-[#242422] dark:text-[#F3F4F6]">${caseItem.id}</span>
                    </td>
                    <td class="${R.table.td}">
                      <div class="flex items-center gap-2.5">
                        ${avatar(caseItem.debtorName, "h-8 w-8 text-[10px]")}
                        <div class="min-w-0">
                          <p class="max-w-[160px] truncate text-[12.5px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]" title="${escapeHTML(caseItem.debtorName)}">${escapeHTML(caseItem.debtorName)}</p>
                          <p class="mt-0.5 text-[10.5px] text-[#9a9a94] dark:text-[#9CA3AF]">${escapeHTML(caseItem.debtorPhone)}</p>
                        </div>
                      </div>
                    </td>
                    <td class="${R.table.td}">
                      <p class="max-w-[150px] truncate text-[12px] text-[#3f3f3b] dark:text-[#F3F4F6]" title="${escapeHTML(client.name)}">${escapeHTML(client.name)}</p>
                      <p class="mt-0.5 text-[10.5px] text-[#9a9a94] dark:text-[#9CA3AF]">${escapeHTML(client.type)}</p>
                    </td>
                    <td class="${R.table.td}">
                      <span class="inline-flex items-center gap-1.5 text-[12px] text-[#4a4a45] dark:text-[#F3F4F6]">
                        <span class="h-1.5 w-1.5 rounded-full bg-[#c7c6c0]"></span>${caseItem.stage}
                      </span>
                    </td>
                    <td class="${R.table.tdRight}">
                      <span class="text-[12.5px] font-medium tabular-nums text-[#242422] dark:text-[#F3F4F6]">${formatKES(caseItem.amountOwed)}</span>
                    </td>
                    <td class="${R.table.td}">${keyDateCell(caseItem)}</td>
                    <td class="${R.table.td}">${statusBadge(R.caseStatus(caseItem))}</td>
                    <td class="px-3 py-3">
                      <button type="button" data-menu-trigger data-case-menu="${caseItem.id}" class="${R.table.menuButton}" aria-label="Actions for ${caseItem.id}">
                        ${window.RIGID_ICONS.more}
                      </button>
                    </td>
                  </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0efeb] dark:border-[#262B36] px-5 py-3">
          <p class="text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">Showing <span class="font-medium text-[#3f3f3b] dark:text-[#F3F4F6]">${rows.length}</span> of ${window.cases.length} cases</p>
          <div class="flex items-center gap-3 text-[11px]">
            ${selectedCount
              ? `<span class="text-[#6f6f6a] dark:text-[#9CA3AF]">${selectedCount} selected</span>
                 <button type="button" data-clear-selection class="font-medium text-[#3f3f3b] dark:text-[#F3F4F6] underline decoration-[#d4d3cc] dark:decoration-[#4B5563] underline-offset-2 transition hover:text-[#141414] dark:hover:text-[#F3F4F6]">Clear</button>`
              : `<span class="text-[#a3a39e] dark:text-[#9CA3AF]">Click a row to open case details</span>`}
          </div>
        </div>
      </div>`;

    updateSelectAll(rows);
  }

  function updateSelectAll(rows) {
    const selectAll = document.getElementById("select-all-cases");
    if (!selectAll) return;
    const selectedVisible = rows.filter((item) => state.selected.has(item.id)).length;
    selectAll.checked = rows.length > 0 && selectedVisible === rows.length;
    selectAll.indeterminate = selectedVisible > 0 && selectedVisible < rows.length;
  }

  function clearFilters() {
    state.query = "";
    state.tab = "All";
    const search = document.getElementById("global-search");
    if (search) search.value = "";
    renderTabs();
    renderTable();
  }

  function bindTable() {
    const host = document.getElementById("cases-table");
    if (!host) return;

    host.addEventListener("change", (event) => {
      if (event.target.id === "select-all-cases") {
        const rows = filteredCases();
        rows.forEach((item) => {
          if (event.target.checked) state.selected.add(item.id);
          else state.selected.delete(item.id);
        });
        renderTable();
        return;
      }

      const checkbox = event.target.closest("[data-case-select]");
      if (checkbox) {
        const id = checkbox.getAttribute("data-case-select");
        if (checkbox.checked) state.selected.add(id);
        else state.selected.delete(id);
        renderTable();
      }
    });

    host.addEventListener("click", (event) => {
      const menuButton = event.target.closest("[data-case-menu]");
      if (menuButton) {
        event.stopPropagation();
        openCaseMenu(menuButton.getAttribute("data-case-menu"), menuButton);
        return;
      }

      if (event.target.closest("[data-clear-filters]")) {
        clearFilters();
        return;
      }

      if (event.target.closest("[data-clear-selection]")) {
        state.selected.clear();
        renderTable();
        return;
      }

      if (event.target.closest("input, button, a, label")) return;

      const row = event.target.closest("tr[data-case-id]");
      if (row) openCase(row.getAttribute("data-case-id"));
    });

    host.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const row = event.target.closest("tr[data-case-id]");
      if (row && event.target === row) openCase(row.getAttribute("data-case-id"));
    });
  }

  function openCaseMenu(id, anchor) {
    const caseItem = R.caseById(id);
    if (!caseItem) return;
    const isClosed = caseItem.stage === "Closed";

    R.openTableMenu(anchor, [
      { label: "Open case", onSelect: () => openCase(id) },
      {
        label: "Move to next stage",
        disabled: isClosed,
        onSelect: () => advanceCase(id)
      }
    ]);
  }

  /* -------------------------------------------------------
     Detail panel
     ------------------------------------------------------- */
  function openCase(id) {
    if (!R.caseById(id)) return;
    state.activeCaseId = id;
    state.detailTab = "Details";
    state.expanded = false;
    renderPanel();
  }

  function closePanel() {
    state.activeCaseId = null;
    if (panels) panels.innerHTML = "";
    removeQueryParam("case");
  }

  function renderPanel() {
    if (!panels) return;
    const caseItem = R.caseById(state.activeCaseId);
    if (!caseItem) {
      closePanel();
      return;
    }

    const client = R.clientById(caseItem.clientId) || { name: "—", type: "" };
    const isClosed = caseItem.stage === "Closed";

    panels.innerHTML = `
      <div class="fixed inset-0 z-[70]">
        <div class="absolute inset-0 bg-black/15 backdrop-blur-[1px]" data-panel-close></div>
        <aside class="panel-enter absolute inset-0 z-10 flex w-full flex-col border-[#e7e6e0] dark:border-[#262B36] bg-white dark:bg-[#171A21] shadow-2xl sm:inset-y-4 sm:left-auto sm:right-4 ${state.expanded ? "sm:w-[740px]" : "sm:w-[460px]"} sm:rounded-2xl sm:border" aria-label="Case details">
          <div class="flex shrink-0 items-start justify-between gap-4 border-b border-[#f0efeb] dark:border-[#262B36] px-5 pb-4 pt-5">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#a3a39e] dark:text-[#9CA3AF]">Case</span>
                <span class="text-[11px] font-semibold tabular-nums text-[#6f6f6a] dark:text-[#9CA3AF]">${caseItem.id}</span>
              </div>
              <div class="mt-3 flex items-center gap-3">
                ${avatar(caseItem.debtorName, "h-10 w-10 text-[11px]")}
                <div class="min-w-0">
                  <h2 class="truncate text-[18px] font-medium tracking-[-0.02em] text-[#1c1c1a] dark:text-[#F3F4F6]">${escapeHTML(caseItem.debtorName)}</h2>
                  <div class="mt-1">${statusBadge(R.caseStatus(caseItem))}</div>
                </div>
              </div>
              <div class="mt-4 flex flex-col gap-1.5 text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">
                <span class="inline-flex items-center gap-2">
                  <span class="text-[#a3a39e] dark:text-[#9CA3AF]">${window.RIGID_ICONS.phone}</span>${escapeHTML(caseItem.debtorPhone)}
                </span>
                <span class="inline-flex items-center gap-2">
                  <span class="text-[#a3a39e] dark:text-[#9CA3AF]">${window.RIGID_ICONS.mail}</span>${escapeHTML(R.debtorEmail(caseItem))}
                </span>
              </div>
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
              <button type="button" data-detail-tab="${tab}"
                class="-mb-px border-b-2 px-0.5 pb-3 pt-3 text-[12px] transition ${
                  state.detailTab === tab
                    ? "border-[#141414] font-medium text-[#141414] dark:border-[#F3F4F6] dark:text-[#F3F4F6]"
                    : "border-transparent text-[#8a8a84] dark:text-[#9CA3AF] hover:text-[#3f3f3b] dark:hover:text-[#F3F4F6]"
                }">${tab}</button>`).join("")}
          </div>

          <div class="flex-1 overflow-y-auto px-5 py-5">
            ${renderDetailTab(caseItem, client)}
          </div>

          <div class="flex shrink-0 flex-wrap items-center gap-2 border-t border-[#f0efeb] dark:border-[#262B36] p-4">
            <button type="button" data-panel-export class="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3.5 dark:border-[#262B36] dark:bg-[#171A21] text-[12px] font-medium text-[#3d3d39] dark:text-[#F3F4F6] shadow-sm transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A]">
              ${window.RIGID_ICONS.download.replace('class="h-4 w-4"', 'class="h-3.5 w-3.5 text-[#7a7a74] dark:text-[#9CA3AF]"')}
              Export
            </button>
            <button type="button" data-advance ${isClosed ? "disabled" : ""}
              class="inline-flex h-9 flex-1 items-center justify-center rounded-lg px-3.5 text-[12px] font-medium shadow-sm transition ${
                isClosed
                  ? "cursor-not-allowed bg-[#f3f3ef] dark:bg-[#262B36] text-[#a3a39e] dark:text-[#9CA3AF]"
                  : "bg-brand text-white hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              }">
              ${isClosed ? "Case closed" : "Move to next stage"}
            </button>
            <label class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white dark:bg-[#171A21] text-[#6f6f6a] dark:text-[#9CA3AF] shadow-sm transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A] hover:text-[#141414] dark:hover:text-[#F3F4F6]" title="Upload document">
              ${window.RIGID_ICONS.upload}
              <input type="file" class="hidden" data-upload-input accept=".pdf,.doc,.docx,.jpg,.png">
            </label>
          </div>
        </aside>
      </div>`;
  }

  function renderDetailTab(caseItem, client) {
    if (state.detailTab === "Timeline") return renderTimeline(caseItem);
    if (state.detailTab === "Docs") return renderDocs(caseItem);
    return renderDetails(caseItem, client);
  }

  function detailRow(label, value) {
    return `
      <div class="flex items-start justify-between gap-5 py-2.5">
        <dt class="shrink-0 text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">${label}</dt>
        <dd class="text-right text-[12px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]">${value}</dd>
      </div>`;
  }

  function renderDetails(caseItem, client) {
    const vehicles = R.vehiclesForCase(caseItem.id);
    const courtOrder = caseItem.hasCourtOrder
      ? `<span class="inline-flex items-center gap-1.5 text-[#15803d] dark:text-[#4ADE80]">${window.RIGID_ICONS.check}Yes</span>`
      : `<span class="inline-flex items-center gap-1.5 text-[#8a8a84] dark:text-[#9CA3AF]"><span class="h-2 w-2 rounded-full bg-current"></span>No</span>`;

    const vehicleSection = vehicles.length
      ? vehicles.map((vehicle) => `
          <div class="rounded-xl border border-[#ecebe5] dark:border-[#262B36] bg-[#fcfcfa] dark:bg-[#171A21] p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-[13px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]">${escapeHTML(vehicle.make)} ${escapeHTML(vehicle.model)} <span class="font-normal text-[#8a8a84] dark:text-[#9CA3AF]">${vehicle.year}</span></p>
                <span class="mt-1.5 inline-flex rounded border border-[#e6e5df] dark:border-[#262B36] bg-white dark:bg-[#1F2937] px-1.5 py-0.5 text-[10px] font-medium tabular-nums tracking-[0.04em] text-[#5f5f5a] dark:text-[#F3F4F6]">${escapeHTML(vehicle.plate)}</span>
              </div>
              ${statusBadge(vehicle.status)}
            </div>
            <div class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
              <span class="text-[#8a8a84] dark:text-[#9CA3AF]">Yard <span class="float-right font-medium text-[#4a4a45] dark:text-[#F3F4F6]">${escapeHTML(vehicle.yardLocation)}</span></span>
              <span class="text-[#8a8a84] dark:text-[#9CA3AF]">Reserve <span class="float-right font-medium tabular-nums text-[#4a4a45] dark:text-[#F3F4F6]">${formatKES(vehicle.reservePrice)}</span></span>
              <span class="text-[#8a8a84] dark:text-[#9CA3AF]">Mileage <span class="float-right font-medium tabular-nums text-[#4a4a45] dark:text-[#F3F4F6]">${Number(vehicle.mileage).toLocaleString("en-KE")} km</span></span>
              <span class="text-[#8a8a84] dark:text-[#9CA3AF]">Condition <span class="float-right font-medium text-[#4a4a45] dark:text-[#F3F4F6]">${escapeHTML(vehicle.condition)}</span></span>
            </div>
          </div>`).join("")
      : `<div class="rounded-xl border border-dashed border-[#e4e2dc] dark:border-[#262B36] bg-[#fcfcfa] dark:bg-[#171A21] px-4 py-5 text-center text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">No vehicle linked to this case yet.</div>`;

    return `
      <div class="space-y-5">
        <div class="rounded-xl border border-[#ecebe5] dark:border-[#262B36] px-4 py-2">
          <dl class="divide-y divide-[#f2f1ed] dark:divide-[#262B36]">
            ${detailRow("Client", `${escapeHTML(client.name)}<span class="mt-1 block text-[10px] font-normal text-[#9a9a94] dark:text-[#9CA3AF]">${escapeHTML(client.type)}</span>`)}
            ${detailRow("Loan reference", `<span class="text-[11px] tracking-[0.02em] text-[#4a4a45] dark:text-[#F3F4F6]">${escapeHTML(caseItem.loanRef)}</span>`)}
            ${detailRow("Amount owed", `<span class="text-[13px] tabular-nums">${formatKES(caseItem.amountOwed)}</span>`)}
            ${detailRow("Court order", courtOrder)}
          </dl>
        </div>

        <div>
          <div class="mb-2.5 flex items-center justify-between">
            <h3 class="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9a9a94] dark:text-[#9CA3AF]">Vehicle${vehicles.length > 1 ? "s" : ""}</h3>
            <span class="text-[10px] text-[#b0afa9] dark:text-[#9CA3AF]">${vehicles.length || "None"}</span>
          </div>
          <div class="space-y-2">${vehicleSection}</div>
        </div>
      </div>`;
  }

  function proclamationTimelineText(caseItem, stepIndex, currentIndex) {
    if (!caseItem.proclamationDate) return "7-day notice period";
    const end = R.proclamationEndDate(caseItem);
    const daysLeft = R.daysUntil(end);

    if (stepIndex > currentIndex) return "7-day notice period";
    if (daysLeft !== null && daysLeft > 0) {
      return `Day ${Math.max(1, 7 - daysLeft)} of 7 · ends ${formatDate(end)}`;
    }
    return `Expired · ended ${formatDate(end)}`;
  }

  function renderTimeline(caseItem) {
    const currentIndex = R.stages.indexOf(caseItem.stage);

    return `
      <ol class="space-y-0">
        ${R.stages.map((stage, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;
          const date = isFuture ? null : R.stageDate(caseItem, stage);
          const line = index < R.stages.length - 1
            ? `<span class="absolute left-[8px] top-[22px] h-[calc(100%-10px)] w-px ${index < currentIndex ? "bg-[#cfe4d6] dark:bg-[#1E4A2A]" : "bg-[#ecebe5] dark:bg-[#262B36]"}"></span>`
            : "";

          let extra = "";
          if (stage === "Proclamation") {
            extra = proclamationTimelineText(caseItem, index, currentIndex);
          } else if (stage === "Closed" && caseItem.closedReason) {
            extra = caseItem.closedReason;
          }
          const extraTone = extra.startsWith("Expired")
            ? "text-accent dark:text-accent"
            : isCurrent && stage === "Proclamation"
              ? "text-[#b45309] dark:text-[#FBBF24]"
              : "text-[#9a9a94] dark:text-[#9CA3AF]";

          return `
            <li class="relative flex gap-3.5 pb-6 last:pb-0">
              ${line}
              <span class="relative z-10 mt-0.5 flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${
                isDone
                  ? "bg-[#15803d] text-white"
                  : isCurrent
                    ? "bg-[#141414] text-white dark:bg-[#5B93E0] dark:text-[#0F1115]"
                    : "border border-[#dddcd6] dark:border-[#262B36] bg-white dark:bg-[#171A21] text-[#a3a39e] dark:text-[#9CA3AF]"
              }">
                ${isDone ? window.RIGID_ICONS.check.replace('class="h-3 w-3"', 'class="h-2.5 w-2.5"') : index + 1}
              </span>
              <div class="min-w-0 flex-1 pt-0.5">
                <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p class="text-[12.5px] ${isCurrent ? "font-medium text-[#141414] dark:text-[#F3F4F6]" : isDone ? "text-[#15803d] dark:text-[#4ADE80]" : "text-[#a3a39e] dark:text-[#9CA3AF]"}">${stage}</p>
                  <p class="text-[10.5px] tabular-nums ${isFuture ? "text-[#b7b6b0] dark:text-[#9CA3AF]" : "text-[#8a8a84] dark:text-[#9CA3AF]"}">${date ? formatDate(date) : "Pending"}</p>
                </div>
                ${extra ? `<p class="mt-1 text-[10.5px] ${extraTone}">${escapeHTML(extra)}</p>` : ""}
              </div>
            </li>`;
        }).join("")}
      </ol>`;
  }

  function docsForCase(caseItem) {
    const docs = [];

    if (caseItem.proclamationDate) {
      docs.push({
        name: "Proclamation Notice (Form 2).pdf",
        meta: "PDF · 248 KB",
        date: caseItem.proclamationDate
      });
    }
    if (caseItem.repossessionDate) {
      docs.push({
        name: "Notification of Sale (Form 3).pdf",
        meta: "PDF · 186 KB",
        date: caseItem.repossessionDate
      });
    }
    if (caseItem.advertDate) {
      docs.push({
        name: "Advertisement.pdf",
        meta: "PDF · 312 KB",
        date: caseItem.advertDate
      });
    }

    const uploads = state.uploadedDocs.get(caseItem.id) || [];
    return docs.concat(uploads);
  }

  function renderDocs(caseItem) {
    const docs = docsForCase(caseItem);

    if (!docs.length) {
      return `
        <div class="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-[#e4e2dc] dark:border-[#262B36] bg-[#fcfcfa] dark:bg-[#171A21] px-6 py-10 text-center">
          <span class="flex h-10 w-10 items-center justify-center rounded-full border border-[#e9e8e2] dark:border-[#262B36] bg-white dark:bg-[#1D212A] text-[#8a8a84] dark:text-[#9CA3AF]">${window.RIGID_ICONS.file}</span>
          <p class="mt-3 text-[12px] font-medium text-[#3f3f3b] dark:text-[#F3F4F6]">No documents yet</p>
          <p class="mt-1 max-w-[220px] text-[11px] leading-5 text-[#8a8a84] dark:text-[#9CA3AF]">Documents will appear as the case progresses.</p>
        </div>`;
    }

    return `
      <div class="space-y-2">
        ${docs.map((doc) => `
          <div class="flex items-center gap-3 rounded-xl border border-[#ecebe5] dark:border-[#262B36] px-3.5 py-3">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#efeee9] dark:border-[#262B36] bg-[#fbfbf9] dark:bg-[#1D212A] text-[#8a8a84] dark:text-[#9CA3AF]">
              ${window.RIGID_ICONS.file}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-[12px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]">${escapeHTML(doc.name)}</p>
              <p class="mt-0.5 text-[10.5px] text-[#9a9a94] dark:text-[#9CA3AF]">${escapeHTML(doc.meta)}${doc.date ? ` · ${formatDate(doc.date)}` : ""}</p>
            </div>
            <button type="button" data-download-doc="${escapeHTML(doc.name)}" class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#9a9a94] dark:text-[#9CA3AF] transition hover:bg-[#f3f3ef] dark:hover:bg-[#1D212A] hover:text-[#141414] dark:hover:text-[#F3F4F6]" title="Download ${escapeHTML(doc.name)}" aria-label="Download ${escapeHTML(doc.name)}">
              ${window.RIGID_ICONS.download}
            </button>
          </div>`).join("")}
      </div>
      <p class="mt-4 px-1 text-[10.5px] leading-5 text-[#a3a39e] dark:text-[#9CA3AF]">PDF previews are mock files. Use the upload button below to attach another document.</p>`;
  }

  function bindPanel() {
    if (!panels) return;

    panels.addEventListener("click", (event) => {
      if (event.target.closest("[data-panel-close]")) {
        closePanel();
        return;
      }

      const tab = event.target.closest("[data-detail-tab]");
      if (tab) {
        state.detailTab = tab.getAttribute("data-detail-tab");
        renderPanel();
        return;
      }

      if (event.target.closest("[data-panel-expand]")) {
        state.expanded = !state.expanded;
        renderPanel();
        return;
      }

      if (event.target.closest("[data-panel-export]")) {
        toast("Export started");
        return;
      }

      if (event.target.closest("[data-advance]")) {
        if (state.activeCaseId) advanceCase(state.activeCaseId);
        return;
      }

      if (event.target.closest("[data-download-doc]")) {
        toast("Download started");
      }
    });

    panels.addEventListener("change", (event) => {
      const input = event.target.closest("[data-upload-input]");
      if (!input || !input.files || !input.files.length) return;

      const file = input.files[0];
      const caseItem = R.caseById(state.activeCaseId);
      if (!caseItem) return;

      const uploads = state.uploadedDocs.get(caseItem.id) || [];
      uploads.push({
        name: file.name,
        meta: `Uploaded · ${file.size < 1024 ? `${file.size} B` : `${Math.max(1, Math.round(file.size / 1024))} KB`}`,
        date: R.today
      });
      state.uploadedDocs.set(caseItem.id, uploads);
      state.detailTab = "Docs";
      renderPanel();
      toast(`"${file.name}" uploaded.`);
    });
  }

  function bindEscapeKey() {
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (modal && modal.innerHTML.trim()) {
        closeNewCaseModal();
      } else if (state.activeCaseId) {
        closePanel();
      }
    });
  }

  /* -------------------------------------------------------
     Stage progression
     ------------------------------------------------------- */
  function advanceCase(id) {
    const caseItem = R.caseById(id);
    if (!caseItem) return;

    const index = R.stages.indexOf(caseItem.stage);
    if (index < 0 || index >= R.stages.length - 1) {
      toast("This case is already closed.");
      return;
    }

    if (caseItem.stage === "Proclamation") {
      const end = R.proclamationEndDate(caseItem);
      if (end && R.daysUntil(end) > 0) {
        toast("Proclamation period has not yet ended.");
        return;
      }
    }

    const next = R.stages[index + 1];
    const today = R.today;

    if (next === "Proclamation") caseItem.proclamationDate = today;
    if (next === "Repossessed") caseItem.repossessionDate = today;
    if (next === "Advertised") caseItem.advertDate = today;
    if (next === "Auctioned") caseItem.auctionDate = today;
    if (next === "Closed") {
      const sold = R.vehiclesForCase(caseItem.id).some((vehicle) => vehicle.status === "Sold");
      caseItem.closedReason = sold ? "Sold" : "Debtor paid";
    }

    caseItem.stage = next;
    renderTabs();
    renderTable();
    if (state.activeCaseId === id) renderPanel();
    toast(`${id} moved to ${next}.`);
  }

  /* -------------------------------------------------------
     New case modal
     ------------------------------------------------------- */
  function openNewCaseModal() {
    if (!modal) return;
    removeQueryParam("new");

    const fieldClass = "mt-1.5 h-9 w-full rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3 dark:border-[#262B36] dark:bg-[#0F1115] text-[12px] text-[#2a2a27] dark:text-[#F3F4F6] outline-none transition placeholder:text-[#b1b0aa] dark:placeholder:text-[#6B7280] focus:border-brand/40 focus:ring-4 focus:ring-brand/15";
    const labelClass = "block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a84] dark:text-[#9CA3AF]";

    modal.innerHTML = `
      <div class="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/25 backdrop-blur-[1px]" data-modal-close></div>
        <div class="modal-enter relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#e7e6e0] dark:border-[#262B36] bg-white dark:bg-[#171A21] shadow-2xl" role="dialog" aria-modal="true" aria-label="New case">
          <div class="flex shrink-0 items-start justify-between gap-4 border-b border-[#f0efeb] dark:border-[#262B36] px-5 py-4">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a3a39e] dark:text-[#9CA3AF]">Rigid Auctioneers</p>
              <h2 class="mt-1 text-[17px] font-medium tracking-[-0.02em] text-[#1c1c1a] dark:text-[#F3F4F6]">New case</h2>
            </div>
            <button type="button" data-modal-close class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#8a8a84] dark:text-[#9CA3AF] transition hover:bg-[#f5f5f2] dark:hover:bg-[#1D212A] hover:text-[#141414] dark:hover:text-[#F3F4F6]" aria-label="Close new case form">
              ${window.RIGID_ICONS.close}
            </button>
          </div>

          <form id="new-case-form" class="overflow-y-auto p-5">
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="${labelClass} sm:col-span-2">
                Client
                <select name="clientId" required class="${fieldClass}">
                  <option value="">Select a client</option>
                  ${window.clients.map((client) => `<option value="${client.id}">${escapeHTML(client.name)} · ${escapeHTML(client.type)}</option>`).join("")}
                </select>
              </label>

              <label class="${labelClass} sm:col-span-2">
                Debtor name
                <input name="debtorName" required autocomplete="off" placeholder="e.g. Jane Wanjiru Kariuki" class="${fieldClass}">
              </label>

              <label class="${labelClass}">
                Debtor phone
                <input name="debtorPhone" type="tel" required autocomplete="off" placeholder="+254 7xx xxx xxx" class="${fieldClass}">
              </label>

              <label class="${labelClass}">
                Loan reference
                <input name="loanRef" required autocomplete="off" placeholder="e.g. SBK/AUTO/2026/0601" class="${fieldClass}">
              </label>

              <label class="${labelClass} sm:col-span-2">
                Amount owed (KES)
                <input name="amount" type="number" required min="1" step="any" inputmode="numeric" placeholder="1,250,000" class="${fieldClass}">
              </label>

              <label class="sm:col-span-2 flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#eeede8] dark:border-[#262B36] bg-[#fcfcfa] dark:bg-[#171A21] px-3 py-3">
                <input name="courtOrder" type="checkbox" class="mt-0.5 h-4 w-4 rounded border-[#d6d5cf] dark:border-[#3A4150] accent-[#141414] dark:accent-brand">
                <span>
                  <span class="block text-[12px] font-medium text-[#3f3f3b] dark:text-[#F3F4F6]">Court order obtained</span>
                  <span class="mt-0.5 block text-[10.5px] leading-4 text-[#9a9a94] dark:text-[#9CA3AF]">Tick this if the instruction includes a valid court order.</span>
                </span>
              </label>
            </div>

            <div class="mt-6 flex items-center justify-end gap-2 border-t border-[#f0efeb] dark:border-[#262B36] pt-4">
              <button type="button" data-modal-close class="inline-flex h-9 items-center rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3.5 dark:border-[#262B36] dark:bg-[#171A21] text-[12px] font-medium text-[#3d3d39] dark:text-[#F3F4F6] shadow-sm transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A]">Cancel</button>
              <button type="submit" class="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-[12px] font-medium text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">Create case</button>
            </div>
          </form>
        </div>
      </div>`;

    window.requestAnimationFrame(() => modal.querySelector('input[name="debtorName"]')?.focus());
  }

  function closeNewCaseModal() {
    if (modal) modal.innerHTML = "";
  }

  function bindModal() {
    if (!modal) return;

    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-modal-close]")) closeNewCaseModal();
    });

    modal.addEventListener("submit", (event) => {
      if (event.target.id !== "new-case-form") return;
      event.preventDefault();

      const form = event.target;
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const amount = Number(data.get("amount"));

      if (!Number.isFinite(amount) || amount <= 0) {
        toast("Enter a valid amount owed.");
        return;
      }

      const newCase = {
        id: R.nextCaseId(),
        clientId: String(data.get("clientId")),
        debtorName: String(data.get("debtorName")).trim(),
        debtorPhone: String(data.get("debtorPhone")).trim(),
        hasCourtOrder: data.get("courtOrder") === "on",
        loanRef: String(data.get("loanRef")).trim(),
        amountOwed: amount,
        stage: "Instruction",
        instructionDate: R.today,
        proclamationDate: null,
        repossessionDate: null,
        advertDate: null,
        auctionDate: null
      };

      window.cases.unshift(newCase);
      closeNewCaseModal();
      state.tab = "All";
      state.query = "";
      const search = document.getElementById("global-search");
      if (search) search.value = "";
      state.flashId = newCase.id;
      renderTabs();
      renderTable();
      toast(`Case ${newCase.id} created.`);
      window.setTimeout(() => {
        state.flashId = null;
      }, 1600);
    });
  }

  /* -------------------------------------------------------
     Start
     ------------------------------------------------------- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
