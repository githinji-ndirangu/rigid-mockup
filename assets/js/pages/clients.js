/* =========================================================
   Clients — searchable client grid with a type filter.
   ========================================================= */

(function () {
  "use strict";

  const { formatKES, avatar, escapeHTML } = window;
  const R = window.RIGID;
  const TYPES = ["All", "Bank", "Microfinance", "Law Firm", "Individual"];

  const state = {
    query: "",
    type: "All"
  };

  function init() {
    renderFilters();
    bindFilters();
    bindSearch();
    renderGrid();
  }

  function typeCount(type) {
    return type === "All"
      ? window.clients.length
      : window.clients.filter((client) => client.type === type).length;
  }

  function renderFilters() {
    const host = document.getElementById("client-filters");
    if (!host) return;

    host.innerHTML = `
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label class="relative block w-full sm:w-[260px]">
            <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#a3a39e] dark:text-[#9CA3AF]">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7"></circle>
                <path d="m20 20-3.2-3.2"></path>
              </svg>
            </span>
            <input id="client-search" type="search" autocomplete="off" placeholder="Search clients…"
              class="h-9 w-full rounded-[10px] border border-[#e7e6e0] dark:border-[#262B36] bg-white pl-9 dark:border-[#262B36] dark:bg-[#0F1115] pr-3 text-[12px] text-[#1c1c1a] dark:text-[#F3F4F6] outline-none transition placeholder:text-[#a3a39e] dark:placeholder:text-[#6B7280] focus:border-brand/40 focus:ring-4 focus:ring-brand/15"
              aria-label="Search clients">
          </label>

          <div class="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-[#e9e8e2] dark:border-[#262B36] bg-[#f7f7f4] dark:bg-[#171A21] p-1" role="group" aria-label="Filter clients by type">
            ${TYPES.map((type) => {
              const active = state.type === type;
              return `<button type="button" data-client-type="${type}"
                class="inline-flex items-center rounded-lg px-2.5 py-1.5 text-[11.5px] transition ${
                  active
                    ? "border border-[#e7e6e0] dark:border-[#262B36] bg-white dark:bg-[#1F2937] font-medium text-[#141414] dark:text-[#F3F4F6] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                    : "border border-transparent text-[#777771] dark:text-[#9CA3AF] hover:bg-white/70 dark:hover:bg-[#1D212A] hover:text-[#141414] dark:hover:text-[#F3F4F6]"
                }">
                ${type}
                <span class="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${active ? "bg-[#f3f3ef] dark:bg-[#262B36] text-[#6f6f6a] dark:text-[#9CA3AF]" : "text-[#a3a39e] dark:text-[#9CA3AF]"}">${typeCount(type)}</span>
              </button>`;
            }).join("")}
          </div>
        </div>

        <p class="text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]"><span data-client-count>${window.clients.length}</span> of ${window.clients.length} clients</p>
      </div>`;
  }

  function bindFilters() {
    const host = document.getElementById("client-filters");
    if (!host) return;

    host.addEventListener("click", (event) => {
      const button = event.target.closest("[data-client-type]");
      if (!button) return;
      state.type = button.getAttribute("data-client-type");

      host.querySelectorAll("[data-client-type]").forEach((element) => {
        const active = element.getAttribute("data-client-type") === state.type;
        element.className = `inline-flex items-center rounded-lg px-2.5 py-1.5 text-[11.5px] transition ${
          active
            ? "border border-[#e7e6e0] dark:border-[#262B36] bg-white dark:bg-[#1F2937] font-medium text-[#141414] dark:text-[#F3F4F6] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            : "border border-transparent text-[#777771] dark:text-[#9CA3AF] hover:bg-white/70 dark:hover:bg-[#1D212A] hover:text-[#141414] dark:hover:text-[#F3F4F6]"
        }`;
        const count = element.querySelector("span");
        if (count) {
          count.className = `ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${active ? "bg-[#f3f3ef] dark:bg-[#262B36] text-[#6f6f6a] dark:text-[#9CA3AF]" : "text-[#a3a39e] dark:text-[#9CA3AF]"}`;
        }
      });

      renderGrid();
    });
  }

  function bindSearch() {
    const local = document.getElementById("client-search");
    const global = R.bindGlobalSearch((value) => {
      state.query = value;
      if (local && document.activeElement !== local) local.value = value;
      renderGrid();
    }, "Search clients…");

    local?.addEventListener("input", () => {
      state.query = local.value;
      if (global && document.activeElement !== global) global.value = local.value;
      renderGrid();
    });
  }

  function filteredClients() {
    const query = state.query.trim().toLowerCase();

    return window.clients.filter((client) => {
      if (state.type !== "All" && client.type !== state.type) return false;
      if (!query) return true;

      return [client.name, client.type, client.phone, client.email]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }

  function statsForClient(client) {
    const activeCases = window.cases.filter(
      (caseItem) => caseItem.clientId === client.id && caseItem.stage !== "Closed"
    );
    const outstanding = activeCases.reduce((sum, caseItem) => sum + caseItem.amountOwed, 0);
    return { activeCases, outstanding };
  }

  function renderGrid() {
    const host = document.getElementById("clients-grid");
    if (!host) return;

    const clients = filteredClients();

    const count = document.querySelector("[data-client-count]");
    if (count) count.textContent = clients.length;

    if (!clients.length) {
      host.innerHTML = `
        <div class="col-span-full flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-[#e4e2dc] dark:border-[#262B36] bg-[#fcfcfa] dark:bg-[#171A21] px-6 py-16 text-center">
          <span class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e9e8e2] dark:border-[#262B36] bg-white dark:bg-[#1D212A] text-[#8a8a84] dark:text-[#9CA3AF]">
            ${window.RIGID_ICONS.file}
          </span>
          <h3 class="mt-4 text-[14px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]">No clients found</h3>
          <p class="mt-1 max-w-xs text-[12px] leading-5 text-[#8a8a84] dark:text-[#9CA3AF]">Try a different name, phone number or client type.</p>
          <button type="button" data-clear-client-filters class="mt-4 inline-flex h-8 items-center rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3 dark:border-[#262B36] dark:bg-[#0F1115] text-[12px] font-medium text-[#3d3d39] dark:text-[#F3F4F6] shadow-sm transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A]">Clear filters</button>
        </div>`;

      host.querySelector("[data-clear-client-filters]")?.addEventListener("click", clearFilters);
      return;
    }

    host.innerHTML = `
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        ${clients.map((client) => {
          const { activeCases, outstanding } = statsForClient(client);
          return `
            <article class="flex h-full flex-col rounded-xl border border-[#e9e8e2] dark:border-[#262B36] bg-white dark:bg-[#171A21] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition hover:border-[#dcdbd4] dark:border-[#262B36] hover:shadow-[0_10px_30px_-24px_rgba(0,0,0,0.3)]">
              <div class="flex items-start gap-3">
                ${avatar(client.name, "h-10 w-10 text-[11px]")}
                <div class="min-w-0 flex-1">
                  <h2 class="truncate text-[14px] font-medium tracking-[-0.01em] text-[#242422] dark:text-[#F3F4F6]">${escapeHTML(client.name)}</h2>
                  <div class="mt-1.5">${R.clientTypeTag(client.type)}</div>
                </div>
              </div>

              <div class="mt-5 flex items-center gap-2 text-[11px] text-[#6f6f6a] dark:text-[#9CA3AF]">
                <span class="text-[#a3a39e] dark:text-[#9CA3AF]">${window.RIGID_ICONS.phone}</span>
                <span class="truncate tabular-nums">${escapeHTML(client.phone)}</span>
              </div>

              <div class="mt-auto grid grid-cols-2 gap-3 border-t border-[#f0efeb] dark:border-[#262B36] pt-4">
                <div class="mt-4">
                  <p class="text-[10px] font-medium uppercase tracking-[0.1em] text-[#9a9a94] dark:text-[#9CA3AF]">Active cases</p>
                  <p class="mt-1 text-[18px] font-semibold tabular-nums tracking-[-0.02em] text-[#242422] dark:text-[#F3F4F6]">${activeCases.length}</p>
                </div>
                <div class="mt-4 text-right">
                  <p class="text-[10px] font-medium uppercase tracking-[0.1em] text-[#9a9a94] dark:text-[#9CA3AF]">Total outstanding</p>
                  <p class="mt-1 text-[13px] font-semibold tabular-nums text-[#242422] dark:text-[#F3F4F6]">${formatKES(outstanding)}</p>
                </div>
              </div>
            </article>`;
        }).join("")}
      </div>`;
  }

  function clearFilters() {
    state.query = "";
    state.type = "All";

    const local = document.getElementById("client-search");
    if (local) local.value = "";
    const global = document.getElementById("global-search");
    if (global) global.value = "";

    document.querySelectorAll("[data-client-type]").forEach((button) => {
      const active = button.getAttribute("data-client-type") === "All";
      button.className = `inline-flex items-center rounded-lg px-2.5 py-1.5 text-[11.5px] transition ${
        active
          ? "border border-[#e7e6e0] dark:border-[#262B36] bg-white dark:bg-[#1F2937] font-medium text-[#141414] dark:text-[#F3F4F6] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          : "border border-transparent text-[#777771] dark:text-[#9CA3AF] hover:bg-white/70 dark:hover:bg-[#1D212A] hover:text-[#141414] dark:hover:text-[#F3F4F6]"
      }`;
      const count = button.querySelector("span");
      if (count) {
        count.className = `ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${active ? "bg-[#f3f3ef] dark:bg-[#262B36] text-[#6f6f6a] dark:text-[#9CA3AF]" : "text-[#a3a39e] dark:text-[#9CA3AF]"}`;
      }
    });

    renderGrid();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
