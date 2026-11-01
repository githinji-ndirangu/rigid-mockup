/* =========================================================
   Rigid Group — small UI helpers
   All helpers are plain global functions (classic scripts).
   ========================================================= */

(function () {
  "use strict";

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* KES 1,250,000 */
  window.formatKES = function formatKES(value) {
    if (value === null || value === undefined || value === "") return "—";
    const number = Number(value);
    if (!Number.isFinite(number)) return "—";
    return "KES " + new Intl.NumberFormat("en-KE", {
      maximumFractionDigits: 0
    }).format(number);
  };

  /* 30 Oct 2026 */
  window.formatDate = function formatDate(value) {
    if (!value) return "—";

    let date;
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      const [year, month, day] = value.slice(0, 10).split("-").map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const icons = {
    check: `
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="m8.5 12 2.5 2.5 4.5-5"></path>
      </svg>`,
    x: `
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="m15 9-6 6"></path>
        <path d="m9 9 6 6"></path>
      </svg>`,
    clock: `
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 7v5l3 2"></path>
      </svg>`,
    dot: `<span class="h-2 w-2 rounded-full bg-current" aria-hidden="true"></span>`
  };

  const statusStyles = {
    paid: { color: "text-[#15803d] dark:text-[#4ADE80]", icon: "check" },
    sold: { color: "text-[#15803d] dark:text-[#4ADE80]", icon: "check" },
    closed: { color: "text-[#15803d] dark:text-[#4ADE80]", icon: "check" },
    active: { color: "text-[#15803d] dark:text-[#4ADE80]", icon: "check" },
    canceled: { color: "text-accent dark:text-accent", icon: "x" },
    cancelled: { color: "text-accent dark:text-accent", icon: "x" },
    overdue: { color: "text-accent dark:text-accent", icon: "x" },
    pending: { color: "text-[#b45309] dark:text-[#FBBF24]", icon: "clock" },
    sent: { color: "text-brand dark:text-[#5B93E0]", icon: "clock" },
    "in progress": { color: "text-brand dark:text-[#5B93E0]", icon: "dot" },
    advertised: { color: "text-[#2563eb] dark:text-[#8AB4F8]", icon: "dot" },
    "in yard": { color: "text-[#2563eb] dark:text-[#8AB4F8]", icon: "dot" },
    repossessed: { color: "text-[#2563eb] dark:text-[#8AB4F8]", icon: "dot" },
    auctioned: { color: "text-[#7c3aed] dark:text-[#C4A8E8]", icon: "dot" },
    draft: { color: "text-[#78716c] dark:text-[#9CA3AF]", icon: "dot" },
    released: { color: "text-[#78716c] dark:text-[#9CA3AF]", icon: "dot" },
    inactive: { color: "text-[#78716c] dark:text-[#9CA3AF]", icon: "dot" },
    published: { color: "text-[#15803d] dark:text-[#4ADE80]", icon: "check" },
    scheduled: { color: "text-[#b45309] dark:text-[#FBBF24]", icon: "clock" },
    unsold: { color: "text-accent dark:text-accent", icon: "x" }
  };

  /* Coloured icon + text (never a filled pill) */
  window.statusBadge = function statusBadge(status, compact) {
    if (!status) return "—";
    const key = String(status).trim().toLowerCase();
    const style = statusStyles[key] || { color: "text-[#78716c] dark:text-[#9CA3AF]", icon: "dot" };
    return `<span class="inline-flex items-center gap-1.5 whitespace-nowrap ${compact ? "text-[12px]" : "text-[13px]"} font-medium ${style.color}">${icons[style.icon]}<span>${escapeHTML(status)}</span></span>`;
  };

  const avatarPalettes = [
    "bg-[#e8efe9] text-[#3f6b4f] dark:bg-[#1C2A22] dark:text-[#9BD3B0]",
    "bg-[#f3e9dd] text-[#8a5a2b] dark:bg-[#2A2118] dark:text-[#E8C08D]",
    "bg-[#e7ecf5] text-[#3c5a86] dark:bg-[#16243B] dark:text-[#8FB8EE]",
    "bg-[#f3e8ea] text-[#8a3f4d] dark:bg-[#2A1618] dark:text-[#F0A3AB]",
    "bg-[#eee9f4] text-[#654888] dark:bg-[#201B2A] dark:text-[#C4A8E8]",
    "bg-[#e7eeee] text-[#3d666b] dark:bg-[#152A2C] dark:text-[#8FD0D6]"
  ];

  /* Round initials avatar */
  window.avatar = function avatar(name, sizeClasses) {
    const cleanName = String(name || "?").trim();
    const initials = cleanName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "?";

    let hash = 0;
    for (let i = 0; i < cleanName.length; i += 1) {
      hash = (hash * 31 + cleanName.charCodeAt(i)) >>> 0;
    }
    const palette = avatarPalettes[hash % avatarPalettes.length];

    return `<span class="inline-flex shrink-0 items-center justify-center rounded-full font-medium ${sizeClasses || "h-8 w-8 text-[11px]"} ${palette}" title="${escapeHTML(cleanName)}" aria-label="${escapeHTML(cleanName)}">${escapeHTML(initials)}</span>`;
  };

  /* Bottom-right toast */
  window.toast = function toast(message) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-xs flex-col items-end gap-2 sm:bottom-6 sm:right-6";
      container.setAttribute("role", "status");
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }

    const el = document.createElement("div");
    el.className = "toast pointer-events-auto flex w-full items-start gap-2.5 rounded-xl bg-[#141414] px-4 py-3 text-[13px] font-medium text-white opacity-0 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.35)] dark:border dark:border-[#262B36] dark:bg-[#171A21] dark:text-[#F3F4F6]";
    el.innerHTML = `
      <svg class="mt-0.5 h-4 w-4 shrink-0 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="m8.5 12 2.5 2.5 4.5-5"></path>
      </svg>
      <span class="min-w-0 flex-1 leading-5">${escapeHTML(message)}</span>
      <button type="button" class="ml-1 mt-0.5 text-white/50 transition hover:text-white" aria-label="Dismiss">
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>`;

    const dismiss = () => {
      if (el.dataset.leaving === "true") return;
      el.dataset.leaving = "true";
      el.classList.add("toast-out");
      window.setTimeout(() => el.remove(), 220);
    };

    el.querySelector("button").addEventListener("click", dismiss);
    container.appendChild(el);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add("toast-in"));
    });

    window.setTimeout(dismiss, 3200);
  };

  /* =======================================================
     Shared application helpers for the page scripts
     ======================================================= */

  /* The mock workspace runs on a fixed date so the demo stays consistent. */
  const APP_TODAY = "2026-10-30";
  const stageOrder = ["Instruction", "Proclamation", "Repossessed", "Advertised", "Auctioned", "Closed"];

  function parseISODate(value) {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return null;
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  }

  function toISODate(date) {
    return date.toISOString().slice(0, 10);
  }

  function addDays(value, days) {
    const date = parseISODate(value);
    if (!date) return null;
    date.setUTCDate(date.getUTCDate() + days);
    return toISODate(date);
  }

  function daysUntil(value) {
    const date = parseISODate(value);
    const today = parseISODate(APP_TODAY);
    if (!date || !today) return null;
    return Math.round((date.getTime() - today.getTime()) / 86400000);
  }

  function proclamationEndDate(caseItem) {
    return caseItem && caseItem.proclamationDate ? addDays(caseItem.proclamationDate, 7) : null;
  }

  function countdownLabel(days) {
    if (days === null || days === undefined) return "";
    if (days < 0) return "Expired";
    if (days === 0) return "Today";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  }

  function countdownTone(days) {
    if (days === null || days === undefined) return "text-[#8a8a84] dark:text-[#9CA3AF]";
    return "text-accent dark:text-accent";
  }

  function caseById(id) {
    return (window.cases || []).find((item) => item.id === id) || null;
  }

  function clientById(id) {
    return (window.clients || []).find((item) => item.id === id) || null;
  }

  function vehiclesForCase(caseId) {
    return (window.vehicles || []).filter((vehicle) => vehicle.caseId === caseId);
  }

  function vehicleById(id) {
    return (window.vehicles || []).find((vehicle) => vehicle.id === id) || null;
  }

  function caseForVehicle(vehicle) {
    return vehicle ? caseById(vehicle.caseId) : null;
  }

  function clientForVehicle(vehicle) {
    const caseItem = caseForVehicle(vehicle);
    return caseItem ? clientById(caseItem.clientId) : null;
  }

  function vehicleName(vehicle) {
    if (!vehicle) return "Vehicle";
    return `${vehicle.make} ${vehicle.model} ${vehicle.year}`;
  }

  function daysBetween(start, end) {
    const startDate = parseISODate(start);
    const endDate = parseISODate(end);
    if (!startDate || !endDate) return 0;
    return Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
  }

  /* Storage is accrued to the fixed demo date, 30 Oct 2026, or to the
     date the vehicle left the yard if it has already been sold/released. */
  function daysInYard(vehicle) {
    if (!vehicle || !vehicle.dateIn) return 0;
    let endDate = APP_TODAY;
    if (vehicle.status === "Sold" && vehicle.soldDate) endDate = vehicle.soldDate;
    if (vehicle.status === "Released" && vehicle.releasedDate) endDate = vehicle.releasedDate;
    return Math.max(0, daysBetween(vehicle.dateIn, endDate));
  }

  function accruedStorage(vehicle) {
    if (!vehicle) return 0;
    return daysInYard(vehicle) * Number(vehicle.dailyStorageFee || 0);
  }

  function currentYardVehicles() {
    return (window.vehicles || []).filter((vehicle) => ["In Yard", "Advertised"].includes(vehicle.status));
  }

  function soldThisMonthVehicles() {
    const month = APP_TODAY.slice(0, 7);
    return (window.vehicles || []).filter((vehicle) => {
      if (vehicle.status !== "Sold") return false;
      const soldDate = vehicle.soldDate || vehicle.auctionDate;
      return soldDate && soldDate.slice(0, 7) === month;
    });
  }

  function caseStatus(caseItem) {
    if (!caseItem) return "Pending";
    return {
      Instruction: "Pending",
      Proclamation: "In Progress",
      Repossessed: "In Yard",
      Advertised: "Advertised",
      Auctioned: "Auctioned",
      Closed: "Closed"
    }[caseItem.stage] || "Pending";
  }

  function stageDate(caseItem, stage) {
    if (!caseItem) return null;
    if (stage === "Instruction") return caseItem.instructionDate;
    if (stage === "Proclamation") return caseItem.proclamationDate;
    if (stage === "Repossessed") return caseItem.repossessionDate;
    if (stage === "Advertised") return caseItem.advertDate;
    if (stage === "Auctioned") return caseItem.auctionDate;
    return caseItem.auctionDate || caseItem.repossessionDate || caseItem.instructionDate;
  }

  function keyDateForCase(caseItem) {
    if (!caseItem) return { label: "Key date", date: null, days: null };

    if (caseItem.stage === "Proclamation") {
      const end = proclamationEndDate(caseItem);
      return { label: "Proclamation ends", date: end, days: daysUntil(end) };
    }

    if (caseItem.stage === "Advertised") {
      if (caseItem.auctionDate) {
        return { label: "Auction", date: caseItem.auctionDate, days: daysUntil(caseItem.auctionDate) };
      }
      return { label: "Advertised", date: caseItem.advertDate, days: null };
    }

    if (caseItem.stage === "Auctioned") {
      return { label: "Auctioned", date: caseItem.auctionDate, days: null };
    }

    if (caseItem.stage === "Closed") {
      return {
        label: caseItem.closedReason || "Closed",
        date: stageDate(caseItem, "Closed"),
        days: null
      };
    }

    if (caseItem.stage === "Repossessed") {
      return { label: "Repossessed", date: caseItem.repossessionDate, days: null };
    }

    return { label: "Instructed", date: caseItem.instructionDate, days: null };
  }

  function debtorEmail(caseItem) {
    const parts = String(caseItem && caseItem.debtorName ? caseItem.debtorName : "debtor")
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const first = parts[0] || "debtor";
    const last = parts.length > 1 ? parts[parts.length - 1] : "";
    return `${first}${last ? "." + last : ""}@example.co.ke`;
  }

  function nextCaseId() {
    const numbers = (window.cases || [])
      .map((item) => Number(String(item.id).split("-").pop()))
      .filter((number) => Number.isFinite(number));
    const next = (numbers.length ? Math.max(...numbers) : 100) + 1;
    return `RA-2026-${String(next).padStart(4, "0")}`;
  }

  function tag(label, toneClasses) {
    return `<span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium ${toneClasses}">
      <span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>${escapeHTML(label)}
    </span>`;
  }

  const clientTypeStyles = {
    Bank: "border-[#dbe6f5] bg-[#f2f7fd] text-[#3c5a86] dark:border-[#24406B] dark:bg-[#16243B] dark:text-[#8FB8EE]",
    Microfinance: "border-[#dcebe1] bg-[#f3faf5] text-[#3f6b4f] dark:border-[#1E3A2A] dark:bg-[#12251B] dark:text-[#9BD3B0]",
    "Law Firm": "border-[#e8e1f3] bg-[#f8f5fc] text-[#654888] dark:border-[#33283F] dark:bg-[#201B2A] dark:text-[#C4A8E8]",
    Individual: "border-[#f1e5d7] bg-[#fdf9f3] text-[#8a5a2b] dark:border-[#3E2F1E] dark:bg-[#2A2118] dark:text-[#E8C08D]"
  };

  const invoiceTypeStyles = {
    "Proclamation - Debtor": "border-accent/20 bg-accent-light text-accent dark:border-accent/30 dark:bg-[#2A1618] dark:text-accent",
    "Auction - Debtor": "border-brand/20 bg-brand-light text-brand dark:border-[#24406B] dark:bg-[#16243B] dark:text-[#5B93E0]",
    "Client Statement": "border-[#e8e7e2] bg-[#f7f7f4] text-[#6f6f6a] dark:border-[#262B36] dark:bg-[#1D212A] dark:text-[#9CA3AF]"
  };

  function clientTypeTag(type) {
    return tag(type, clientTypeStyles[type] || "border-[#e8e7e2] bg-[#f7f7f4] text-[#6f6f6a] dark:border-[#262B36] dark:bg-[#1D212A] dark:text-[#9CA3AF]");
  }

  function invoiceTypeTag(type) {
    return tag(type, invoiceTypeStyles[type] || "border-[#e8e7e2] bg-[#f7f7f4] text-[#6f6f6a] dark:border-[#262B36] dark:bg-[#1D212A] dark:text-[#9CA3AF]");
  }

  /* Shared table styling used by Cases and Invoices. */
  const tableClasses = {
    card: "overflow-hidden rounded-xl border border-[#e9e8e2] bg-white dark:border-[#262B36] dark:bg-[#171A21]",
    scroller: "overflow-x-auto",
    table: "w-full text-left",
    thead: "border-b border-[#eceae5] bg-[#fcfcfa] dark:border-[#262B36] dark:bg-[#171A21]",
    th: "whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a9a94] dark:text-[#9CA3AF]",
    thRight: "whitespace-nowrap px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a9a94] dark:text-[#9CA3AF]",
    tbody: "divide-y divide-[#f1f0ec] dark:divide-[#262B36]",
    tr: "transition-colors hover:bg-[#fafaf8] dark:hover:bg-[#1D212A]",
    trClickable: "cursor-pointer transition-colors hover:bg-[#fafaf8] focus:outline-none focus-visible:bg-[#f6f6f2] dark:hover:bg-[#1D212A] dark:focus-visible:bg-[#1D212A]",
    trSelected: "cursor-pointer bg-[#f6f6f2] hover:bg-[#f6f6f2] focus:outline-none focus-visible:bg-[#f0f0eb] dark:bg-[#1F2937] dark:hover:bg-[#1F2937] dark:focus-visible:bg-[#1F2937]",
    td: "whitespace-nowrap px-4 py-3.5 align-middle text-[13px] text-[#4a4a45] dark:text-[#F3F4F6]",
    tdRight: "whitespace-nowrap px-4 py-3.5 text-right align-middle text-[13px] text-[#4a4a45] dark:text-[#F3F4F6]",
    checkbox: "h-4 w-4 cursor-pointer rounded border-[#d6d5cf] accent-[#141414] dark:border-[#3A4150] dark:accent-brand",
    menuButton: "inline-flex h-7 w-7 items-center justify-center rounded-md text-[#a3a39e] transition hover:bg-[#f0efeb] hover:text-[#141414] dark:text-[#9CA3AF] dark:hover:bg-[#1D212A] dark:hover:text-[#F3F4F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
  };

  const pageIcons = {
    more: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.4"></circle><circle cx="12" cy="12" r="1.4"></circle><circle cx="12" cy="19" r="1.4"></circle></svg>`,
    phone: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
    mail: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`,
    download: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path><path d="M12 15V3"></path></svg>`,
    upload: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m17 8-5-5-5 5"></path><path d="M12 3v12"></path></svg>`,
    close: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
    expand: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" x2="14" y1="3" y2="10"></line><line x1="3" x2="10" y1="21" y2="14"></line></svg>`,
    arrowUpRight: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>`,
    chevronRight: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>`,
    check: `<svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"></path></svg>`,
    calendar: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 10h18"></path></svg>`,
    file: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line></svg>`,
    car: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><path d="M9 17h6"></path><circle cx="17" cy="17" r="2"></circle></svg>`,
    gavel: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m14 13-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10"></path><path d="m16 16 6-6"></path><path d="m8 8 6-6"></path><path d="m9 7 4 4"></path><path d="m21 11-8-8"></path></svg>`,
    list: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></svg>`,
    grid: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>`,
    tag: `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>`
  };

  window.escapeHTML = escapeHTML;
  window.RIGID_ICONS = pageIcons;
  window.RIGID = {
    today: APP_TODAY,
    stages: stageOrder,
    parseISODate,
    addDays,
    daysUntil,
    proclamationEndDate,
    countdownLabel,
    countdownTone,
    caseById,
    clientById,
    vehiclesForCase,
    vehicleById,
    caseForVehicle,
    clientForVehicle,
    vehicleName,
    daysBetween,
    daysInYard,
    accruedStorage,
    currentYardVehicles,
    soldThisMonthVehicles,
    caseStatus,
    stageDate,
    keyDateForCase,
    debtorEmail,
    nextCaseId,
    clientTypeTag,
    invoiceTypeTag,
    table: tableClasses,
    openTableMenu,
    bindGlobalSearch
  };

  /* Shared table action menu. Rendered at body level so table scrolling
     cannot clip it. */
  let activeMenu = null;

  function closeTableMenu() {
    if (!activeMenu) return;
    activeMenu.remove();
    activeMenu = null;
  }

  function openTableMenu(anchor, items) {
    closeTableMenu();

    const menu = document.createElement("div");
    menu.className = "fixed z-[90] min-w-[178px] rounded-xl border border-[#e7e6e0] bg-white p-1 shadow-[0_18px_44px_-16px_rgba(0,0,0,0.32)] dark:border-[#262B36] dark:bg-[#171A21]";
    menu.setAttribute("role", "menu");

    items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "menuitem");
      button.disabled = Boolean(item.disabled);
      button.textContent = item.label;
      button.className = [
        "flex w-full items-center rounded-lg px-3 py-2 text-left text-[12px] transition",
        item.disabled
          ? "cursor-not-allowed text-[#c2c1bb] dark:text-[#6B7280]"
          : item.tone === "success"
            ? "text-[#15803d] dark:text-[#4ADE80] hover:bg-[#f1f8f2] dark:hover:bg-[#172A1D]"
            : item.tone === "danger"
              ? "text-accent dark:text-accent hover:bg-accent-light dark:hover:bg-[#2A1618]"
              : "text-[#3f3f3b] dark:text-[#F3F4F6] hover:bg-[#f6f6f3] dark:hover:bg-[#1D212A]"
      ].join(" ");
      if (!item.disabled) {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          closeTableMenu();
          if (typeof item.onSelect === "function") item.onSelect();
        });
      }
      menu.appendChild(button);
    });

    menu.style.visibility = "hidden";
    document.body.appendChild(menu);

    const anchorRect = anchor.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - menuRect.width - 8, anchorRect.right - menuRect.width));
    let top = anchorRect.bottom + 6;
    if (top + menuRect.height > window.innerHeight - 8) {
      top = Math.max(8, anchorRect.top - menuRect.height - 6);
    }

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.visibility = "visible";
    activeMenu = menu;
  }

  document.addEventListener("click", (event) => {
    if (!activeMenu) return;
    if (activeMenu.contains(event.target)) return;
    if (event.target.closest("[data-menu-trigger]")) return;
    closeTableMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTableMenu();
  });

  window.addEventListener("resize", closeTableMenu);
  window.addEventListener("scroll", closeTableMenu, true);

  /* Wire the shared top-bar search to a page-level filter. */
  function bindGlobalSearch(callback, placeholder) {
    const input = document.getElementById("global-search");
    if (!input) return null;
    if (placeholder) {
      input.placeholder = placeholder;
      input.setAttribute("aria-label", placeholder.replace(/…$/, ""));
    }
    input.addEventListener("input", () => callback(input.value));
    return input;
  }
})();
