/* =========================================================
   Auctions — date-grouped lots, results, advertising and
   in-memory "Mark as Sold" updates.
   ========================================================= */

(function () {
  "use strict";

  const { formatKES, formatDate, statusBadge, escapeHTML, toast } = window;
  const R = window.RIGID;
  const TABS = ["Upcoming", "Past"];

  const state = {
    tab: "Upcoming",
    query: ""
  };

  let modal;

  function init() {
    modal = document.createElement("div");
    modal.id = "auction-modal-root";
    document.body.appendChild(modal);

    document.getElementById("export-auctions")?.addEventListener("click", () => toast("Export started"));
    R.bindGlobalSearch((value) => {
      state.query = value;
      renderContent();
    }, "Search auctions by plate or make…");
    document.getElementById("auction-tabs")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-auction-tab]");
      if (!button) return;
      state.tab = button.getAttribute("data-auction-tab");
      renderAll();
    });

    document.getElementById("auction-content")?.addEventListener("click", (event) => {
      const markSold = event.target.closest("[data-mark-sold]");
      if (markSold) {
        openSoldModal(markSold.getAttribute("data-mark-sold"));
        return;
      }

      if (event.target.closest("[data-clear-auction-search]")) {
        state.query = "";
        const search = document.getElementById("global-search");
        if (search) search.value = "";
        renderAll();
      }
    });

    bindModal();
    bindEscapeKey();
    renderAll();
  }

  /* -------------------------------------------------------
     Lot grouping
     ------------------------------------------------------- */
  function hasAuction(vehicle) {
    return Boolean(vehicle.auctionDate || vehicle.soldDate);
  }

  function isPastLot(vehicle) {
    if (vehicle.status === "Sold" || (vehicle.sellingPrice !== null && vehicle.sellingPrice !== undefined)) return true;
    if (!vehicle.auctionDate) return false;
    return R.daysUntil(vehicle.auctionDate) < 0;
  }

  function lotDate(vehicle) {
    if (vehicle.status === "Sold") return vehicle.soldDate || vehicle.auctionDate;
    return vehicle.auctionDate;
  }

  function lotsFor(period) {
    const query = state.query.trim().toLowerCase();

    return window.vehicles
      .filter((vehicle) => hasAuction(vehicle))
      .filter((vehicle) => (period === "Past" ? isPastLot(vehicle) : !isPastLot(vehicle)))
      .filter((vehicle) => {
        if (!query) return true;
        const client = R.clientForVehicle(vehicle);
        const haystack = [
          vehicle.plate,
          vehicle.make,
          vehicle.model,
          String(vehicle.year),
          client ? client.name : ""
        ].join(" ").toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => String(lotDate(a)).localeCompare(String(lotDate(b))));
  }

  function groupLots(lots, direction) {
    const map = new Map();

    lots.forEach((vehicle) => {
      const date = lotDate(vehicle);
      if (!date) return;
      if (!map.has(date)) map.set(date, []);
      map.get(date).push(vehicle);
    });

    const groups = [...map.entries()].map(([date, vehicles]) => ({ date, vehicles }));
    groups.sort((a, b) => direction === "desc"
      ? b.date.localeCompare(a.date)
      : a.date.localeCompare(b.date));
    return groups;
  }

  function renderAll() {
    renderTabs();
    renderContent();
  }

  function renderTabs() {
    const host = document.getElementById("auction-tabs");
    if (!host) return;

    const upcoming = lotsFor("Upcoming").length;
    const past = lotsFor("Past").length;
    const counts = { Upcoming: upcoming, Past: past };

    host.innerHTML = `
      <div class="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-[#e9e8e2] dark:border-[#262B36] bg-[#f7f7f4] dark:bg-[#171A21] p-1" role="tablist" aria-label="Auction period">
        ${TABS.map((tab) => {
          const active = state.tab === tab;
          return `<button type="button" data-auction-tab="${tab}" role="tab" aria-selected="${active}"
            class="inline-flex items-center rounded-lg px-3 py-1.5 text-[12px] transition ${
              active
                ? "border border-brand bg-white font-medium text-brand dark:border-[#5B93E0] dark:bg-[#1F2937] dark:text-[#5B93E0] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                : "border border-transparent text-[#777771] dark:text-[#9CA3AF] hover:bg-white/70 dark:hover:bg-[#1D212A] hover:text-[#141414] dark:hover:text-[#F3F4F6]"
            }">
            ${tab}
            <span class="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${active ? "bg-[#f3f3ef] dark:bg-[#262B36] text-[#6f6f6a] dark:text-[#9CA3AF]" : "text-[#a3a39e] dark:text-[#9CA3AF]"}">${counts[tab]}</span>
          </button>`;
        }).join("")}
      </div>`;
  }

  function renderContent() {
    const host = document.getElementById("auction-content");
    if (!host) return;

    const lots = lotsFor(state.tab);
    const groups = groupLots(lots, state.tab === "Past" ? "desc" : "asc");

    if (!groups.length) {
      host.innerHTML = `
        <div class="${R.table.card} flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
          <span class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e9e8e2] dark:border-[#262B36] bg-[#fbfbf9] dark:bg-[#1D212A] text-[#8a8a84] dark:text-[#9CA3AF]">
            ${window.RIGID_ICONS.gavel}
          </span>
          <h3 class="mt-4 text-[14px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]">${state.query ? "No matching lots" : `No ${state.tab.toLowerCase()} auctions`}</h3>
          <p class="mt-1 max-w-xs text-[12px] leading-5 text-[#8a8a84] dark:text-[#9CA3AF]">
            ${state.query
              ? "Try a different plate, make, model or entity."
              : state.tab === "Upcoming"
                ? "There are no lots scheduled for auction."
                : "Completed auction results will appear here."}
          </p>
          ${state.query
            ? `<button type="button" data-clear-auction-search class="mt-4 inline-flex h-8 items-center rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3 dark:border-[#262B36] dark:bg-[#0F1115] text-[12px] font-medium text-[#3d3d39] dark:text-[#F3F4F6] shadow-sm transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30">Clear search</button>`
            : ""}
        </div>`;
      return;
    }

    const groupsHTML = groups.map((group) => renderGroup(group, state.tab)).join("");
    const advertisingHTML = state.tab === "Upcoming" ? renderAdvertising(groups) : "";

    host.innerHTML = `<div class="space-y-4">${groupsHTML}</div>${advertisingHTML}`;
  }

  function renderGroup(group, period) {
    const isUpcoming = period === "Upcoming";
    return `
      <section class="overflow-hidden rounded-xl border border-[#e9e8e2] dark:border-[#262B36] bg-white dark:bg-[#171A21] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0efeb] dark:border-[#262B36] bg-[#fcfcfa] dark:bg-[#171A21] px-5 py-3.5">
          <div class="flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e9e8e2] dark:border-[#262B36] bg-white dark:bg-[#1D212A] text-[#8a8a84] dark:text-[#9CA3AF]">
              ${window.RIGID_ICONS.calendar}
            </span>
            <div>
              <p class="text-[13px] font-medium text-[#242422] dark:text-[#F3F4F6]">${formatDate(group.date)}</p>
              <p class="mt-0.5 text-[10.5px] text-[#8a8a84] dark:text-[#9CA3AF]">${group.vehicles.length} lot${group.vehicles.length === 1 ? "" : "s"}</p>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${isUpcoming ? "text-[#b45309] dark:text-[#FBBF24]" : "text-[#8a8a84] dark:text-[#9CA3AF]"}">
            <span class="h-1.5 w-1.5 rounded-full bg-current"></span>${isUpcoming ? "Upcoming" : "Completed"}
          </span>
        </div>

        <div class="divide-y divide-[#f1f0ec] dark:divide-[#262B36]">
          ${group.vehicles.map((vehicle) => renderLot(vehicle, isUpcoming)).join("")}
        </div>
      </section>`;
  }

  function renderLot(vehicle, isUpcoming) {
    const caseItem = R.caseForVehicle(vehicle);
    const client = R.clientForVehicle(vehicle);
    const sold = vehicle.sellingPrice !== null && vehicle.sellingPrice !== undefined;
    const soldResult = sold
      ? `<span class="inline-flex items-center gap-1.5 text-[12px] text-[#15803d] dark:text-[#4ADE80]">
           ${statusBadge("Sold", true)}
           <span class="font-medium">at ${formatKES(vehicle.sellingPrice)}</span>
         </span>`
      : "";

    return `
      <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 items-center gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#efeee9] dark:border-[#262B36] bg-[#f7f7f4] dark:bg-[#171A21] text-[#8d8d87] dark:text-[#9CA3AF]">
            ${window.RIGID_ICONS.car}
          </span>
          <div class="min-w-0">
            <p class="truncate text-[13px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]">${escapeHTML(R.vehicleName(vehicle))}</p>
            <p class="mt-0.5 text-[10.5px] text-[#8a8a84] dark:text-[#9CA3AF]">
              <span class="font-medium tabular-nums tracking-[0.04em] text-[#6f6f6a] dark:text-[#9CA3AF]">${escapeHTML(vehicle.plate)}</span>
              · ${escapeHTML(client ? client.name : "No entity")}
              ${caseItem ? ` · ${caseItem.id}` : ""}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-x-5 gap-y-2 sm:justify-end">
          <div class="text-left sm:text-right">
            <p class="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#9a9a94] dark:text-[#9CA3AF]">Reserve</p>
            <p class="mt-1 text-[12px] font-medium tabular-nums text-[#2a2a27] dark:text-[#F3F4F6]">${formatKES(vehicle.reservePrice)}</p>
          </div>

          <div class="flex min-w-[130px] flex-col items-start sm:items-end">
            ${isUpcoming
              ? statusBadge("Pending", true)
              : sold
                ? soldResult
                : statusBadge("Unsold", true)}
            ${!isUpcoming && sold && vehicle.buyerName
              ? `<p class="mt-1 text-[10px] text-[#9a9a94] dark:text-[#9CA3AF]">${escapeHTML(vehicle.buyerName)}</p>`
              : ""}
          </div>

          ${isUpcoming
            ? `<button type="button" data-mark-sold="${vehicle.id}" class="inline-flex h-8 items-center rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3 dark:border-[#262B36] dark:bg-[#0F1115] text-[11px] font-medium text-[#3d3d39] dark:text-[#F3F4F6] shadow-sm transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30">
                 Mark as Sold
               </button>`
            : ""}
        </div>
      </div>`;
  }

  function renderAdvertising(groups) {
    const upcomingDates = new Set(groups.map((group) => group.date));
    const adverts = (window.adverts || [])
      .filter((advert) => upcomingDates.has(advert.auctionDate))
      .sort((a, b) => a.publishDate.localeCompare(b.publishDate));

    return `
      <section class="mt-6 overflow-hidden rounded-xl border border-[#e9e8e2] dark:border-[#262B36] bg-white dark:bg-[#171A21] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div class="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0efeb] dark:border-[#262B36] px-5 py-4">
          <div>
            <h2 class="text-[15px] font-medium text-[#242422] dark:text-[#F3F4F6]">Advertising</h2>
            <p class="mt-1 text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">Newspaper placements for the upcoming sales</p>
          </div>
          <span class="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a3a39e] dark:text-[#9CA3AF]">${adverts.length} placement${adverts.length === 1 ? "" : "s"}</span>
        </div>
        ${adverts.length
          ? `<div class="divide-y divide-[#f1f0ec] dark:divide-[#262B36]">
              ${adverts.map((advert) => `
                <div class="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div class="flex items-center gap-3">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#efeee9] dark:border-[#262B36] bg-[#fbfbf9] dark:bg-[#1D212A] text-[#8a8a84] dark:text-[#9CA3AF]">
                      ${window.RIGID_ICONS.file}
                    </span>
                    <div>
                      <p class="text-[12px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]">${escapeHTML(advert.newspaper)}</p>
                      <p class="mt-0.5 text-[10.5px] text-[#8a8a84] dark:text-[#9CA3AF]">Publish ${formatDate(advert.publishDate)} · Auction ${formatDate(advert.auctionDate)}</p>
                    </div>
                  </div>
                  <div class="pl-11 sm:pl-0">${statusBadge(advert.status, true)}</div>
                </div>`).join("")}
            </div>`
          : `<div class="px-5 py-8 text-center text-[12px] text-[#8a8a84] dark:text-[#9CA3AF]">No advertising scheduled for the upcoming auctions.</div>`}
      </section>`;
  }

  /* -------------------------------------------------------
     Mark as Sold modal
     ------------------------------------------------------- */
  function closeSoldModal() {
    if (modal) modal.innerHTML = "";
  }

  function openSoldModal(vehicleId) {
    const vehicle = R.vehicleById(vehicleId);
    if (!vehicle || isPastLot(vehicle)) return;

    const caseItem = R.caseForVehicle(vehicle);
    const fieldClass = "mt-1.5 h-9 w-full rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3 dark:border-[#262B36] dark:bg-[#0F1115] text-[12px] text-[#2a2a27] dark:text-[#F3F4F6] outline-none transition placeholder:text-[#b1b0aa] dark:placeholder:text-[#6B7280] focus:border-brand/40 focus:ring-4 focus:ring-brand/15";

    modal.innerHTML = `
      <div class="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/25 backdrop-blur-[1px]" data-modal-close></div>
        <div class="modal-enter relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#e7e6e0] dark:border-[#262B36] bg-white dark:bg-[#171A21] shadow-2xl" role="dialog" aria-modal="true" aria-label="Mark lot as sold">
          <div class="flex items-start justify-between gap-4 border-b border-[#f0efeb] dark:border-[#262B36] px-5 py-4">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a3a39e] dark:text-[#9CA3AF]">Rigid Motors</p>
              <h2 class="mt-1 text-[17px] font-medium tracking-[-0.02em] text-[#1c1c1a] dark:text-[#F3F4F6]">Mark as sold</h2>
            </div>
            <button type="button" data-modal-close class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#8a8a84] dark:text-[#9CA3AF] transition hover:bg-[#f5f5f2] dark:hover:bg-[#1D212A] hover:text-[#141414] dark:hover:text-[#F3F4F6]" aria-label="Close sale form">
              ${window.RIGID_ICONS.close}
            </button>
          </div>

          <form id="sale-form" class="p-5">
            <input type="hidden" name="vehicleId" value="${vehicle.id}">
            <div class="rounded-xl border border-[#ecebe5] dark:border-[#262B36] bg-[#fcfcfa] dark:bg-[#171A21] p-4">
              <p class="text-[13px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]">${escapeHTML(R.vehicleName(vehicle))}</p>
              <p class="mt-1 text-[10.5px] text-[#8a8a84] dark:text-[#9CA3AF]">${escapeHTML(vehicle.plate)} · Reserve ${formatKES(vehicle.reservePrice)}</p>
              <p class="mt-0.5 text-[10.5px] text-[#8a8a84] dark:text-[#9CA3AF]">${formatDate(vehicle.auctionDate)}${caseItem ? ` · ${caseItem.id}` : ""}</p>
            </div>

            <label class="mt-4 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a84] dark:text-[#9CA3AF]">
              Selling price (KES)
              <input name="sellingPrice" type="number" required min="1" step="any" inputmode="numeric" placeholder="${vehicle.reservePrice}" class="${fieldClass}">
            </label>

            <label class="mt-4 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8a84] dark:text-[#9CA3AF]">
              Buyer name
              <input name="buyerName" type="text" required autocomplete="off" placeholder="e.g. Naliaka Holdings" class="${fieldClass}">
            </label>

            <div class="mt-6 flex items-center justify-end gap-2 border-t border-[#f0efeb] dark:border-[#262B36] pt-4">
              <button type="button" data-modal-close class="inline-flex h-9 items-center rounded-lg border border-[#e6e5df] dark:border-[#262B36] bg-white px-3.5 dark:border-[#262B36] dark:bg-[#171A21] text-[12px] font-medium text-[#3d3d39] dark:text-[#F3F4F6] shadow-sm transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A]">Cancel</button>
              <button type="submit" class="inline-flex h-9 items-center rounded-lg bg-brand px-4 text-[12px] font-medium text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">Save sale</button>
            </div>
          </form>
        </div>
      </div>`;

    window.requestAnimationFrame(() => modal.querySelector('input[name="sellingPrice"]')?.focus());
  }

  function bindModal() {
    if (!modal) return;

    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-modal-close]")) closeSoldModal();
    });

    modal.addEventListener("submit", (event) => {
      if (event.target.id !== "sale-form") return;
      event.preventDefault();

      const form = event.target;
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const vehicle = R.vehicleById(String(data.get("vehicleId")));
      const price = Number(data.get("sellingPrice"));
      const buyer = String(data.get("buyerName")).trim();

      if (!vehicle) {
        toast("This lot could not be found.");
        return;
      }

      if (!Number.isFinite(price) || price <= 0) {
        toast("Enter a valid selling price.");
        return;
      }

      if (!buyer) {
        toast("Enter the buyer name.");
        return;
      }

      vehicle.status = "Sold";
      vehicle.sellingPrice = price;
      vehicle.buyerName = buyer;
      vehicle.soldDate = R.today;

      const caseItem = R.caseForVehicle(vehicle);
      if (caseItem && caseItem.stage !== "Closed") {
        caseItem.stage = "Auctioned";
        caseItem.auctionDate = R.today;
      }

      closeSoldModal();
      renderAll();
      toast(`${vehicle.plate} marked as sold at ${formatKES(price)}.`);
    });
  }

  function bindEscapeKey() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal && modal.innerHTML.trim()) closeSoldModal();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
