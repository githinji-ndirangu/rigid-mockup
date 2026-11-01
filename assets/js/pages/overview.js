/* =========================================================
   Overview — dashboard summary built from the mock data.
   ========================================================= */

(function () {
  "use strict";

  const { formatKES, formatDate, avatar } = window;
  const { daysUntil, proclamationEndDate, countdownLabel, countdownTone } = window.RIGID;

  function statIcon(paths) {
    return `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }

  const icons = {
    cases: statIcon(`
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      <rect width="20" height="14" x="2" y="6" rx="2"></rect>`),
    clock: statIcon(`
      <circle cx="12" cy="12" r="9"></circle>
      <path d="M12 7v5l3 2"></path>`),
    car: window.RIGID_ICONS.car,
    receipt: statIcon(`
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path>
      <path d="M14 8H8"></path>
      <path d="M16 12H8"></path>
      <path d="M13 16H8"></path>`)
  };

  function statCard({ href, label, value, detail, icon, valueClass, tone }) {
    const iconTone = tone === "accent"
      ? "text-accent dark:text-accent"
      : "text-brand dark:text-[#5B93E0]";
    return `
      <a href="${href}" class="group flex flex-col rounded-xl border border-brand/15 bg-brand-light p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition hover:border-brand/25 hover:shadow-[0_8px_24px_-18px_rgba(0,0,0,0.28)] dark:border-[#24406B] dark:bg-[#16243B] dark:hover:border-[#2F4F7A]">
        <div class="flex items-start justify-between gap-3">
          <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f6f6a] dark:text-[#9CA3AF]">${label}</p>
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#efeee9] dark:border-[#262B36] bg-white ${iconTone}">
            ${icon}
          </span>
        </div>
        <p class="mt-3 ${valueClass || "text-[26px]"} font-semibold tracking-[-0.03em] text-[#141414] dark:text-[#F3F4F6]">${value}</p>
        <p class="mt-1.5 text-[11px] leading-5 text-[#6f6f6a] dark:text-[#9CA3AF]">${detail}</p>
      </a>`;
  }

  function renderStats() {
    const activeCases = window.cases.filter((item) => item.stage !== "Closed");
    const closedCases = window.cases.filter((item) => item.stage === "Closed");
    const expiring = window.cases.filter((item) => {
      if (item.stage !== "Proclamation") return false;
      const days = daysUntil(proclamationEndDate(item));
      return days !== null && days >= 0 && days <= 3;
    });

    const yardVehicles = window.RIGID.currentYardVehicles();
    const unlistedVehicles = yardVehicles.filter((item) => item.status === "In Yard").length;
    const advertisedVehicles = yardVehicles.filter((item) => item.status === "Advertised").length;

    const unpaidInvoices = window.invoices.filter((item) => ["Sent", "Overdue"].includes(item.status));
    const unpaidTotal = unpaidInvoices.reduce((sum, item) => sum + item.amount, 0);
    const overdueCount = unpaidInvoices.filter((item) => item.status === "Overdue").length;

    const cards = [
      {
        href: "auctioneers/cases.html",
        label: "Active Cases",
        value: activeCases.length,
        detail: `${closedCases.length} closed cases in the register`,
        icon: icons.cases,
        tone: "brand"
      },
      {
        href: "auctioneers/cases.html?tab=Proclamation",
        label: "Proclamations Expiring",
        value: expiring.length,
        detail: "Within the next 3 days",
        icon: icons.clock,
        tone: "accent"
      },
      {
        href: "motors/yard.html",
        label: "Vehicles in Yard",
        value: yardVehicles.length,
        detail: `${unlistedVehicles} unlisted · ${advertisedVehicles} advertised`,
        icon: icons.car,
        tone: "brand"
      },
      {
        href: "auctioneers/invoices.html",
        label: "Unpaid Invoices",
        value: formatKES(unpaidTotal),
        detail: `${overdueCount} overdue · ${unpaidInvoices.length - overdueCount} awaiting payment`,
        icon: icons.receipt,
        valueClass: "text-[23px]",
        tone: "accent"
      }
    ];

    document.getElementById("overview-stats").innerHTML = cards.map(statCard).join("");
  }

  function renderPipeline() {
    const counts = window.RIGID.stages.map((stage) => ({
      stage,
      count: window.cases.filter((item) => item.stage === stage).length
    }));
    const max = Math.max(...counts.map((item) => item.count), 1);
    const active = counts
      .filter((item) => item.stage !== "Closed")
      .reduce((sum, item) => sum + item.count, 0);
    const closed = counts.find((item) => item.stage === "Closed")?.count || 0;

    const rows = counts.map(({ stage, count }) => {
      const width = count > 0 ? Math.max(7, Math.round((count / max) * 100)) : 0;
      const barTone = stage === "Closed" ? "bg-[#c7c6c0] dark:bg-[#3A4150]" : "bg-brand";
      return `
        <div class="grid grid-cols-[96px_minmax(0,1fr)_24px] items-center gap-3">
          <span class="truncate text-[11px] font-medium text-[#6f6f6a] dark:text-[#9CA3AF]">${stage}</span>
          <div class="h-2.5 overflow-hidden rounded-full bg-[#f1f0ec] dark:bg-[#262B36]" role="img" aria-label="${stage}: ${count} cases">
            <div class="h-full rounded-full ${barTone}" style="width: ${width}%"></div>
          </div>
          <span class="text-right text-[11px] font-semibold tabular-nums text-[#3f3f3b] dark:text-[#F3F4F6]">${count}</span>
        </div>`;
    }).join("");

    document.getElementById("pipeline-card").innerHTML = `
      <div class="flex h-full flex-col rounded-xl border border-[#e9e8e2] dark:border-[#262B36] bg-white dark:bg-[#171A21] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-[15px] font-medium text-[#242422] dark:text-[#F3F4F6]">Case Pipeline</h2>
            <p class="mt-1 text-[11px] leading-5 text-[#8a8a84] dark:text-[#9CA3AF]">${window.cases.length} cases across ${counts.length} stages</p>
          </div>
          <a href="auctioneers/cases.html" class="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-brand dark:text-[#5B93E0] transition hover:text-brand-dark dark:hover:text-[#7FB0F3] hover:underline hover:underline-offset-2">
            View all
            ${window.RIGID_ICONS.arrowUpRight.replace('class="h-4 w-4"', 'class="h-3.5 w-3.5"')}
          </a>
        </div>

        <div class="mt-6 flex flex-1 flex-col justify-center gap-4">${rows}</div>

        <div class="mt-5 flex items-center justify-between border-t border-[#f0efeb] dark:border-[#262B36] pt-4 text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">
          <span class="inline-flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-brand"></span>${active} active</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-[#c7c6c0] dark:bg-[#6B7280]"></span>${closed} closed</span>
        </div>
      </div>`;
  }

  function renderAttention() {
    const items = [];

    window.cases.forEach((caseItem) => {
      if (caseItem.stage === "Proclamation") {
        const end = proclamationEndDate(caseItem);
        const days = daysUntil(end);
        if (days !== null && days >= 0 && days <= 3) {
          items.push({
            caseItem,
            days,
            kind: "Proclamation ends",
            date: end
          });
        }
      }

      if (caseItem.stage !== "Closed" && caseItem.auctionDate) {
        const days = daysUntil(caseItem.auctionDate);
        if (days !== null && days >= 0 && days <= 7) {
          items.push({
            caseItem,
            days,
            kind: "Auction",
            date: caseItem.auctionDate
          });
        }
      }
    });

    items.sort((a, b) => a.days - b.days);

    const list = items.length
      ? items.map(({ caseItem, days, kind, date }) => `
          <a href="auctioneers/cases.html?case=${encodeURIComponent(caseItem.id)}"
            class="group flex items-center gap-3 px-5 py-4 transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A]">
            ${avatar(caseItem.debtorName, "h-9 w-9 text-[10px]")}
            <div class="min-w-0 flex-1">
              <p class="truncate text-[13px] font-medium text-[#2a2a27] dark:text-[#F3F4F6]">${window.escapeHTML(caseItem.debtorName)}</p>
              <p class="mt-1 truncate text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">
                <span class="font-medium text-[#6f6f6a] dark:text-[#9CA3AF]">${caseItem.id}</span>
                · ${kind} ${formatDate(date)}
              </p>
            </div>
            <span class="shrink-0 text-[11px] font-medium ${countdownTone(days)}">${countdownLabel(days)}</span>
            <span class="shrink-0 text-[#b7b6b0] dark:text-[#9CA3AF] transition group-hover:translate-x-0.5 group-hover:text-[#6f6f6a] dark:hover:text-[#9CA3AF]">
              ${window.RIGID_ICONS.chevronRight.replace('class="h-4 w-4"', 'class="h-3.5 w-3.5"')}
            </span>
          </a>`).join("")
      : `<div class="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <span class="flex h-10 w-10 items-center justify-center rounded-full border border-[#e9e8e2] dark:border-[#262B36] bg-[#fbfbf9] dark:bg-[#1D212A] text-[#8a8a84] dark:text-[#9CA3AF]">
            ${window.RIGID_ICONS.check}
          </span>
          <p class="mt-3 text-[13px] font-medium text-[#3f3f3b] dark:text-[#F3F4F6]">Nothing needs attention</p>
          <p class="mt-1 text-[11px] text-[#8a8a84] dark:text-[#9CA3AF]">No proclamations or auctions in the next week.</p>
        </div>`;

    document.getElementById("attention-card").innerHTML = `
      <div class="flex h-full flex-col rounded-xl border border-[#e9e8e2] dark:border-[#262B36] bg-white dark:bg-[#171A21] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div class="flex items-start justify-between gap-4 border-b border-[#f0efeb] dark:border-[#262B36] px-5 py-5">
          <div>
            <h2 class="text-[15px] font-medium text-[#242422] dark:text-[#F3F4F6]">Needs Attention</h2>
            <p class="mt-1 text-[11px] leading-5 text-[#8a8a84] dark:text-[#9CA3AF]">${items.length} case${items.length === 1 ? "" : "s"} with a deadline this week</p>
          </div>
          <a href="auctioneers/cases.html" class="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-brand dark:text-[#5B93E0] transition hover:text-brand-dark dark:hover:text-[#7FB0F3] hover:underline hover:underline-offset-2">
            View cases
            ${window.RIGID_ICONS.arrowUpRight.replace('class="h-4 w-4"', 'class="h-3.5 w-3.5"')}
          </a>
        </div>
        <div class="flex flex-1 flex-col divide-y divide-[#f1f0ec] dark:divide-[#262B36]">${list}</div>
      </div>`;
  }

  function init() {
    const asOf = document.getElementById("overview-as-of");
    if (asOf) asOf.textContent = `As at ${formatDate(window.RIGID.today)}`;
    renderStats();
    renderPipeline();
    renderAttention();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
