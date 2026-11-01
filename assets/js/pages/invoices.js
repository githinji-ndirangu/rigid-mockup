/* =========================================================
   Invoices — filterable table, summary strip and in-memory
   payment status updates.
   ========================================================= */

(function () {
  "use strict";

  const { formatKES, formatDate, statusBadge, toast } = window;
  const R = window.RIGID;
  const TABS = ["All", "Draft", "Sent", "Paid", "Overdue"];

  const state = {
    tab: "All",
    query: ""
  };

  function init() {
    bindStaticControls();
    bindSearch();
    bindTabs();
    bindTable();
    renderAll();
  }

  function bindStaticControls() {
    document.getElementById("export-invoices")?.addEventListener("click", () => toast("Export started"));
    document.getElementById("import-invoices")?.addEventListener("click", () => toast("Import is not wired up in this mockup."));
  }

  function bindSearch() {
    R.bindGlobalSearch((value) => {
      state.query = value;
      renderTable();
    }, "Search invoices, cases or types…");
  }

  function renderAll() {
    renderTabs();
    renderSummary();
    renderTable();
    updateNavBadge();
  }

  function updateNavBadge() {
    const overdue = window.invoices.filter((invoice) => invoice.status === "Overdue").length;
    const badge = document.querySelector('[data-badge-for="invoices"]');
    if (!badge) return;
    badge.textContent = overdue;
    badge.classList.toggle("hidden", overdue === 0);
  }

  /* -------------------------------------------------------
     Tabs
     ------------------------------------------------------- */
  function tabCount(tab) {
    return tab === "All"
      ? window.invoices.length
      : window.invoices.filter((invoice) => invoice.status === tab).length;
  }

  function renderTabs() {
    const host = document.getElementById("invoice-tabs");
    if (!host) return;

    host.innerHTML = `
      <div class="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-[#e9e8e2] dark:border-[#262B36] bg-[#f7f7f4] dark:bg-[#171A21] p-1" role="tablist" aria-label="Invoice status">
        ${TABS.map((tab) => {
          const active = state.tab === tab;
          return `<button type="button" data-invoice-tab="${tab}" role="tab" aria-selected="${active}"
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
    document.getElementById("invoice-tabs")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-invoice-tab]");
      if (!button) return;
      state.tab = button.getAttribute("data-invoice-tab");
      renderTabs();
      renderTable();
    });
  }

  /* -------------------------------------------------------
     Summary
     ------------------------------------------------------- */
  function renderSummary() {
    const host = document.getElementById("invoice-summary");
    if (!host) return;

    const issued = window.invoices.filter((invoice) => invoice.status !== "Draft");
    const paid = window.invoices.filter((invoice) => invoice.status === "Paid");
    const outstanding = window.invoices.filter((invoice) => ["Sent", "Overdue"].includes(invoice.status));

    const summed = (list) => list.reduce((total, invoice) => total + invoice.amount, 0);

    const cards = [
      {
        label: "Total Billed",
        value: formatKES(summed(issued)),
        detail: `${issued.length} issued invoices`,
        icon: window.RIGID_ICONS.file
      },
      {
        label: "Total Paid",
        value: formatKES(summed(paid)),
        detail: `${paid.length} settled invoices`,
        icon: window.RIGID_ICONS.check.replace('class="h-3 w-3"', 'class="h-4 w-4"')
      },
      {
        label: "Outstanding",
        value: formatKES(summed(outstanding)),
        detail: `${outstanding.length} open · ${outstanding.filter((invoice) => invoice.status === "Overdue").length} overdue`,
        icon: window.RIGID_ICONS.calendar
      }
    ];

    host.innerHTML = `
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        ${cards.map((card) => `
          <div class="rounded-xl border border-brand/15 bg-brand-light p-5 dark:border-[#24406B] dark:bg-[#16243B]">
            <div class="flex items-center justify-between gap-3">
              <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f6f6a] dark:text-[#9CA3AF]">${card.label}</p>
              <span class="flex h-7 w-7 items-center justify-center rounded-lg border border-[#efeee9] dark:border-[#262B36] bg-white text-brand dark:text-[#5B93E0]">${card.icon}</span>
            </div>
            <p class="mt-2.5 text-[21px] font-semibold tracking-[-0.03em] tabular-nums text-[#141414] dark:text-[#F3F4F6]">${card.value}</p>
            <p class="mt-1 text-[11px] text-[#6f6f6a] dark:text-[#9CA3AF]">${card.detail}</p>
          </div>`).join("")}
      </div>`;
  }

  /* -------------------------------------------------------
     Table
     ------------------------------------------------------- */
  function filteredInvoices() {
    const query = state.query.trim().toLowerCase();

    return window.invoices.filter((invoice) => {
      if (state.tab !== "All" && invoice.status !== state.tab) return false;
      if (!query) return true;

      const caseItem = R.caseById(invoice.caseId);
      const client = caseItem ? R.clientById(caseItem.clientId) : null;
      const haystack = [
        invoice.id,
        invoice.caseId,
        invoice.type,
        invoice.status,
        caseItem ? caseItem.debtorName : "",
        client ? client.name : ""
      ].join(" ").toLowerCase();

      return haystack.includes(query);
    });
  }

  function renderTable() {
    const host = document.getElementById("invoices-table");
    if (!host) return;

    const rows = filteredInvoices();

    if (!rows.length) {
      host.innerHTML = `
        <div class="${R.table.card} flex min-h-[300px] flex-col items-center justify-center px-6 py-16 text-center">
          <span class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e9e8e2] dark:border-[#262B36] bg-[#fbfbf9] dark:bg-[#1D212A] text-[#8a8a84] dark:text-[#9CA3AF]">
            ${window.RIGID_ICONS.file}
          </span>
          <h3 class="mt-4 text-[14px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]">No invoices found</h3>
          <p class="mt-1 max-w-xs text-[12px] leading-5 text-[#8a8a84] dark:text-[#9CA3AF]">
            ${state.query ? "Try a different invoice number, case or type." : "There are no invoices with this status."}
          </p>
          <button type="button" data-clear-invoice-filters class="mt-4 inline-flex h-8 items-center rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3 dark:border-[#262B36] dark:bg-[#0F1115] text-[12px] font-medium text-[#3d3d39] dark:text-[#F3F4F6] shadow-sm transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A]">
            Clear filters
          </button>
        </div>`;
      return;
    }

    const visibleTotal = rows.reduce((sum, invoice) => sum + invoice.amount, 0);

    host.innerHTML = `
      <div class="${R.table.card}">
        <div class="${R.table.scroller}">
          <table class="w-full min-w-[980px] table-fixed text-left">
            <colgroup>
              <col class="w-[14%]">
              <col class="w-[13%]">
              <col class="w-[22%]">
              <col class="w-[13%]">
              <col class="w-[11%]">
              <col class="w-[11%]">
              <col class="w-[11%]">
              <col class="w-[5%]">
            </colgroup>
            <thead class="${R.table.thead}">
              <tr>
                <th class="${R.table.th}">Invoice No.</th>
                <th class="${R.table.th}">Case</th>
                <th class="${R.table.th}">Type</th>
                <th class="${R.table.thRight}">Amount</th>
                <th class="${R.table.th}">Issue Date</th>
                <th class="${R.table.th}">Due Date</th>
                <th class="${R.table.th}">Status</th>
                <th class="w-12 px-3 py-3"></th>
              </tr>
            </thead>
            <tbody class="${R.table.tbody}">
              ${rows.map((invoice) => `
                <tr class="${R.table.tr}">
                  <td class="${R.table.td}">
                    <span class="text-[12.5px] font-medium tabular-nums text-[#242422] dark:text-[#F3F4F6]">${invoice.id}</span>
                  </td>
                  <td class="${R.table.td}">
                    <a href="cases.html?case=${encodeURIComponent(invoice.caseId)}" class="text-[12px] text-[#5f5f5a] dark:text-[#F3F4F6] underline decoration-[#deddd7] dark:decoration-[#4B5563] underline-offset-2 transition hover:text-[#141414] dark:hover:text-[#F3F4F6]">
                      ${invoice.caseId}
                    </a>
                  </td>
                  <td class="${R.table.td}">${R.invoiceTypeTag(invoice.type)}</td>
                  <td class="${R.table.tdRight}">
                    <span class="text-[12.5px] font-medium tabular-nums text-[#242422] dark:text-[#F3F4F6]">${formatKES(invoice.amount)}</span>
                  </td>
                  <td class="${R.table.td}"><span class="text-[12px] text-[#5f5f5a] dark:text-[#F3F4F6]">${formatDate(invoice.issueDate)}</span></td>
                  <td class="${R.table.td}">
                    <span class="text-[12px] ${invoice.status === "Overdue" ? "font-medium text-accent dark:text-accent" : "text-[#5f5f5a] dark:text-[#F3F4F6]"}">${formatDate(invoice.dueDate)}</span>
                  </td>
                  <td class="${R.table.td}">${statusBadge(invoice.status)}</td>
                  <td class="px-3 py-3">
                    <button type="button" data-menu-trigger data-invoice-menu="${invoice.id}" class="${R.table.menuButton}" aria-label="Actions for ${invoice.id}">
                      ${window.RIGID_ICONS.more}
                    </button>
                  </td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0efeb] dark:border-[#262B36] px-5 py-3">
          <p class="text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">Showing <span class="font-medium text-[#3f3f3b] dark:text-[#F3F4F6]">${rows.length}</span> of ${window.invoices.length} invoices</p>
          <p class="text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">Visible total <span class="font-medium tabular-nums text-[#3f3f3b] dark:text-[#F3F4F6]">${formatKES(visibleTotal)}</span></p>
        </div>
      </div>`;
  }

  function bindTable() {
    const host = document.getElementById("invoices-table");
    if (!host) return;

    host.addEventListener("click", (event) => {
      const menuButton = event.target.closest("[data-invoice-menu]");
      if (menuButton) {
        event.stopPropagation();
        openInvoiceMenu(menuButton.getAttribute("data-invoice-menu"), menuButton);
        return;
      }

      if (event.target.closest("[data-clear-invoice-filters]")) {
        state.query = "";
        state.tab = "All";
        const search = document.getElementById("global-search");
        if (search) search.value = "";
        renderAll();
      }
    });
  }

  function openInvoiceMenu(id, anchor) {
    const invoice = window.invoices.find((item) => item.id === id);
    if (!invoice) return;

    const items = [
      {
        label: "View case",
        onSelect: () => {
          window.location.href = `cases.html?case=${encodeURIComponent(invoice.caseId)}`;
        }
      }
    ];

    if (invoice.status !== "Paid") {
      items.push({
        label: "Mark as Paid",
        tone: "success",
        onSelect: () => markAsPaid(invoice.id)
      });
    }

    R.openTableMenu(anchor, items);
  }

  function markAsPaid(id) {
    const invoice = window.invoices.find((item) => item.id === id);
    if (!invoice || invoice.status === "Paid") return;

    invoice.status = "Paid";
    renderAll();
    toast(`${id} marked as paid.`);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
