/* =========================================================
   Rigid Group — shared application shell
   Injects the sidebar + top bar into every page, highlights
   the active nav item, and mounts the page's <template>.
   ========================================================= */

(function () {
  "use strict";

  const THEME_KEY = "rigid-theme";
  let storedTheme = null;
  try {
    storedTheme = window.localStorage.getItem(THEME_KEY);
  } catch (error) {
    /* localStorage can be unavailable on file:// in some browsers. */
  }
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialDark = storedTheme === "dark" || (storedTheme !== "light" && prefersDark);
  document.documentElement.classList.toggle("dark", initialDark);

  /* Shared Tailwind configuration: colours + typography. */
  if (window.tailwind) {
    window.tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          fontFamily: {
            sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
          },
          colors: {
            brand: {
              DEFAULT: "#3672C3",
              dark: "#2B5BA0",
              light: "#EAF1FB"
            },
            accent: {
              DEFAULT: "#ED1C24",
              dark: "#C4141B",
              light: "#FDECEC"
            }
          }
        }
      }
    };
  }

  const svg = (paths, className) => `
    <svg class="${className || "h-4 w-4"}" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      ${paths}
    </svg>`;

  const icons = {
    overview: svg(`
      <rect width="7" height="9" x="3" y="3" rx="1"></rect>
      <rect width="7" height="5" x="14" y="3" rx="1"></rect>
      <rect width="7" height="9" x="14" y="12" rx="1"></rect>
      <rect width="7" height="5" x="3" y="16" rx="1"></rect>`),
    cases: svg(`
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      <rect width="20" height="14" x="2" y="6" rx="2"></rect>`),
    invoices: svg(`
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" x2="8" y1="13" y2="13"></line>
      <line x1="16" x2="8" y1="17" y2="17"></line>
      <line x1="10" x2="8" y1="9" y2="9"></line>`),
    clients: svg(`
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`),
    yard: svg(`
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
      <circle cx="7" cy="17" r="2"></circle>
      <path d="M9 17h6"></path>
      <circle cx="17" cy="17" r="2"></circle>`),
    auctions: svg(`
      <path d="m14 13-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10"></path>
      <path d="m16 16 6-6"></path>
      <path d="m8 8 6-6"></path>
      <path d="m9 7 4 4"></path>
      <path d="m21 11-8-8"></path>`),
    help: svg(`
      <circle cx="12" cy="12" r="10"></circle>
      <path d="m4.93 4.93 4.24 4.24"></path>
      <path d="m14.83 9.17 4.24-4.24"></path>
      <path d="m14.83 14.83 4.24 4.24"></path>
      <path d="m9.17 14.83-4.24 4.24"></path>
      <circle cx="12" cy="12" r="4"></circle>`),
    settings: svg(`
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
      <circle cx="12" cy="12" r="3"></circle>`),
    search: svg(`<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.2-3.2"></path>`, "h-4 w-4"),
    menu: svg(`<path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path>`, "h-[18px] w-[18px]"),
    close: svg(`<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>`, "h-4 w-4"),
    plus: svg(`<path d="M12 5v14"></path><path d="M5 12h14"></path>`, "h-4 w-4"),
    sun: svg(`
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>`),
    moon: svg(`<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`),
    more: `
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="5" r="1.4"></circle>
        <circle cx="12" cy="12" r="1.4"></circle>
        <circle cx="12" cy="19" r="1.4"></circle>
      </svg>`
  };

  function isNestedPage() {
    const path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    return path.includes("/auctioneers/") || path.includes("/motors/");
  }

  const assetBase = isNestedPage() ? "../" : "";
  const activePage = document.body.getAttribute("data-page") || "";
  const user = window.currentUser || {
    name: "Rose Kahiga",
    email: "rose@rigidgroup.co.ke",
    role: "Owner"
  };
  const invoiceList = Array.isArray(window.invoices) ? window.invoices : [];
  const overdueCount = invoiceList.filter((invoice) => invoice.status === "Overdue").length;

  const navGroups = [
    {
      key: "auctioneers",
      heading: "Auctioneers",
      items: [
        { page: "cases", label: "Cases", href: "auctioneers/cases.html", icon: "cases" },
        { page: "invoices", label: "Invoices", href: "auctioneers/invoices.html", icon: "invoices", badge: overdueCount },
        { page: "clients", label: "Clients", href: "auctioneers/clients.html", icon: "clients" }
      ]
    },
    {
      key: "motors",
      heading: "Motors",
      items: [
        { page: "yard", label: "Yard Inventory", href: "motors/yard.html", icon: "yard" },
        { page: "auctions", label: "Auctions", href: "motors/auctions.html", icon: "auctions" }
      ]
    }
  ];

  const overviewItem = { page: "overview", label: "Overview", href: "index.html", icon: "overview" };

  function renderNavItem(item) {
    const isActive = item.page === activePage;
    const badge = item.badge
      ? `<span data-badge-for="${item.page}" class="ml-auto inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold leading-none text-white">${item.badge}</span>`
      : "";

    return `
      <li>
        <a href="${assetBase}${item.href}"
          class="group relative flex items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${
            isActive
              ? "border-[#e8e7e2] dark:border-[#262B36] bg-white font-medium text-brand shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border-[#262B36] dark:bg-[#171A21] dark:text-[#5B93E0]"
              : "border-transparent text-[#6f6f6a] hover:bg-[#f7f7f4] dark:hover:bg-[#1D212A] hover:text-[#141414] dark:text-[#9CA3AF] dark:hover:bg-[#1D212A] dark:hover:text-[#F3F4F6]"
          }"
          ${isActive ? 'aria-current="page"' : ""}>
          ${isActive ? '<span class="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-brand" aria-hidden="true"></span>' : ""}
          <span class="${isActive ? "text-brand dark:text-[#5B93E0]" : "text-[#9a9a94] group-hover:text-[#5f5f5a] dark:text-[#6B7280] dark:group-hover:text-[#F3F4F6]"}">${icons[item.icon]}</span>
          <span class="truncate ${isActive ? "text-brand dark:text-[#5B93E0]" : ""}">${item.label}</span>
          ${badge}
        </a>
      </li>`;
  }

  function renderNavSection(group) {
    return `
      <p class="mb-1.5 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a6a6a0] dark:text-[#9CA3AF]">${group.heading}</p>
      <ul class="space-y-0.5">
        ${group.items.map(renderNavItem).join("")}
      </ul>`;
  }

  function renderSidebar() {
    return `
      <div class="flex shrink-0 items-center justify-between gap-2 px-1">
        <a href="${assetBase}index.html" class="inline-flex rounded-lg p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 dark:bg-white dark:p-1.5" aria-label="Rigid Auctioneers home">
          <img src="${assetBase}assets/logo.png" alt="Rigid Auctioneers" class="w-20 max-h-14 object-contain" draggable="false">
        </a>
        <button type="button" id="sidebar-close" class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8a8a84] transition hover:bg-[#f5f5f2] dark:hover:bg-[#1D212A] hover:text-[#141414] dark:text-[#9CA3AF] dark:hover:bg-[#1D212A] dark:hover:text-[#F3F4F6] md:hidden" aria-label="Close navigation">
          ${icons.close}
        </button>
      </div>

      <button type="button" data-demo-action="Account menu" class="mt-5 flex w-full items-center gap-3 rounded-xl border border-[#ecebe5] dark:border-[#262B36] bg-white p-2.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition hover:bg-[#fafaf8] dark:hover:bg-[#1D212A] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 dark:border-[#262B36] dark:bg-[#171A21] dark:hover:bg-[#1D212A]">
        ${window.avatar(user.name, "h-9 w-9 text-[11px]")}
        <span class="min-w-0 flex-1">
          <span class="block truncate text-[13px] font-medium leading-4 text-[#1c1c1a] dark:text-[#F3F4F6]">${user.name}</span>
          <span class="mt-0.5 block truncate text-[10px] leading-4 tracking-[-0.01em] text-[#96968f] dark:text-[#9CA3AF]">${user.email}</span>
        </span>
        <span class="shrink-0 text-[#a6a6a0] dark:text-[#6B7280]">${icons.more}</span>
      </button>

      <nav class="mt-4 flex-1 overflow-y-auto pb-3" aria-label="Main navigation">
        <ul class="space-y-0.5">
          ${renderNavItem(overviewItem)}
        </ul>
        ${navGroups.map(renderNavSection).join("")}
      </nav>

      <div class="shrink-0 border-t border-[#f0efeb] dark:border-[#262B36] pt-3 dark:border-[#262B36]">
        <button type="button" data-demo-action="Help &amp; Support" class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-[#6f6f6a] transition-colors hover:bg-[#f7f7f4] dark:hover:bg-[#1D212A] hover:text-[#141414] dark:text-[#9CA3AF] dark:hover:bg-[#1D212A] dark:hover:text-[#F3F4F6]">
          <span class="text-[#9a9a94] dark:text-[#6B7280]">${icons.help}</span>
          <span>Help &amp; Support</span>
        </button>
        <button type="button" data-demo-action="Settings" class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-[#6f6f6a] transition-colors hover:bg-[#f7f7f4] dark:hover:bg-[#1D212A] hover:text-[#141414] dark:text-[#9CA3AF] dark:hover:bg-[#1D212A] dark:hover:text-[#F3F4F6]">
          <span class="text-[#9a9a94] dark:text-[#6B7280]">${icons.settings}</span>
          <span>Settings</span>
        </button>
      </div>`;
  }

  function renderTopbar() {
    const team = [user.name, "Dennis Mwangi", "Aisha Noor"];

    return `
      <header class="flex h-[68px] shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 dark:border-[#262B36] dark:bg-[#0F1115] sm:gap-3 sm:px-6 lg:px-10">
        <button type="button" id="sidebar-open" class="-ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#6f6f6a] transition hover:bg-[#f6f6f3] dark:hover:bg-[#1D212A] hover:text-[#141414] dark:text-[#9CA3AF] dark:hover:bg-[#1D212A] dark:hover:text-[#F3F4F6] md:hidden" aria-label="Open navigation">
          ${icons.menu}
        </button>

        <label class="relative block w-full max-w-[380px]">
          <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#a3a39e] dark:text-[#6B7280]">${icons.search}</span>
          <input id="global-search" type="search" autocomplete="off" placeholder="Search cases, vehicles, invoices…"
            class="h-9 w-full rounded-[10px] border border-[#e9e8e3] dark:border-[#262B36] bg-[#fbfbfa] pl-9 pr-10 text-[13px] text-[#1c1c1a] outline-none transition placeholder:text-[#a3a39e] focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/15 dark:border-[#262B36] dark:bg-[#171A21] dark:text-[#F3F4F6] dark:placeholder:text-[#6B7280] dark:focus:bg-[#171A21] sm:pr-16"
            aria-label="Search cases, vehicles and invoices">
          <span class="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center rounded-md border border-[#e7e6e0] dark:border-[#262B36] bg-white dark:bg-[#1F2937] px-1.5 py-0.5 text-[10px] font-medium leading-4 text-[#8a8a84] shadow-sm dark:border-[#2F3542] dark:bg-[#1D212A] dark:text-[#9CA3AF] sm:inline-flex" aria-hidden="true">⌘ K</span>
        </label>

        <div class="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <button type="button" id="theme-toggle" class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#6f6f6a] transition hover:bg-[#f6f6f3] hover:text-[#141414] dark:text-[#9CA3AF] dark:hover:bg-[#1D212A] dark:hover:text-[#F3F4F6]" aria-label="Switch to dark mode" title="Switch to dark mode">
            <span class="theme-icon-moon block dark:hidden">${icons.moon}</span>
            <span class="theme-icon-sun hidden dark:block">${icons.sun}</span>
          </button>
          <div class="hidden -space-x-2 lg:flex" aria-label="Team members">
            ${team.map((name) => `<span class="inline-flex rounded-full ring-2 ring-white dark:ring-[#0F1115]">${window.avatar(name, "h-8 w-8 text-[10px]")}</span>`).join("")}
          </div>
          <a id="new-case-button" href="${assetBase}auctioneers/cases.html?new=1" aria-label="New Case"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-medium text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2">
            ${icons.plus}
            <span class="hidden sm:inline">New Case</span>
          </a>
        </div>
      </header>`;
  }

  function renderShell() {
    return `
      <div class="flex h-screen w-full overflow-hidden bg-white dark:bg-[#0F1115]">
        <aside id="sidebar" class="fixed inset-y-0 left-0 z-50 flex w-[272px] -translate-x-full flex-col border-r border-gray-200 bg-white p-4 transition-transform duration-200 ease-out dark:border-[#262B36] dark:bg-[#0F1115] md:static md:z-auto md:w-[248px] md:shrink-0 md:translate-x-0">
          ${renderSidebar()}
        </aside>

        <div id="sidebar-backdrop" class="fixed inset-0 z-40 hidden bg-black/25 backdrop-blur-[1px] md:hidden"></div>

        <div class="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-[#0F1115]">
          ${renderTopbar()}
          <main id="main-content" class="page-enter flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-white px-5 py-8 dark:bg-[#0F1115] sm:px-8 sm:py-10 lg:px-12 lg:py-11"></main>
        </div>
      </div>`;
  }

  function mountPageContent() {
    const template = document.getElementById("page-content");
    const slot = document.getElementById("main-content");
    if (!slot || !template || !template.content) return;

    const wrapper = document.createElement("div");
    wrapper.className = "mx-auto flex min-h-full w-full max-w-[1200px] flex-1 flex-col";
    wrapper.appendChild(template.content.cloneNode(true));
    slot.appendChild(wrapper);
  }

  function bindShell() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    const openBtn = document.getElementById("sidebar-open");
    const closeBtn = document.getElementById("sidebar-close");

    if (!sidebar || !backdrop) return;

    const setOpen = (open) => {
      sidebar.classList.toggle("-translate-x-full", !open);
      sidebar.classList.toggle("translate-x-0", open);
      backdrop.classList.toggle("hidden", !open);
    };

    openBtn?.addEventListener("click", () => setOpen(true));
    closeBtn?.addEventListener("click", () => setOpen(false));
    backdrop.addEventListener("click", () => setOpen(false));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) {
        sidebar.classList.remove("translate-x-0");
        sidebar.classList.add("-translate-x-full");
        backdrop.classList.add("hidden");
      }
    });
  }

  function bindThemeToggle() {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    const sync = () => {
      const dark = document.documentElement.classList.contains("dark");
      const label = dark ? "Switch to light mode" : "Switch to dark mode";
      toggle.setAttribute("aria-label", label);
      toggle.setAttribute("title", label);
      toggle.setAttribute("aria-pressed", String(dark));
    };

    toggle.addEventListener("click", () => {
      const dark = !document.documentElement.classList.contains("dark");
      document.documentElement.classList.toggle("dark", dark);
      try {
        window.localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
      } catch (error) {
        /* localStorage can be unavailable on file:// in some browsers. */
      }
      sync();
    });

    sync();
  }

  function bindDemoActions() {
    const messages = {
      "New Case": "Use the New Case button to create a case.",
      "Import": "Import is not wired up in this mockup.",
      "Export": "Export is not wired up in this mockup.",
      "Account menu": "Account settings are not wired up in this mockup.",
      "Help & Support": "Help & Support is not wired up in this mockup.",
      "Settings": "Settings is not wired up in this mockup."
    };

    document.querySelectorAll("[data-demo-action]").forEach((element) => {
      element.addEventListener("click", (event) => {
        event.preventDefault();
        const action = element.getAttribute("data-demo-action") || "This action";
        window.toast(messages[action] || "This action is not wired up in this phase.");
      });
    });
  }

  function bindSearchShortcut() {
    const search = document.getElementById("global-search");
    if (!search) return;

    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        search.focus();
        search.select();
      }
    });
  }

  function init() {
    const app = document.getElementById("app");
    if (!app) return;

    app.innerHTML = renderShell();
    mountPageContent();
    bindShell();
    bindThemeToggle();
    bindDemoActions();
    bindSearchShortcut();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
