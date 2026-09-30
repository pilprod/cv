(() => {
  "use strict";

  const measurementId = "G-HHJNK65HTV";
  const consentKey = "papou.analytics-consent.v1";
  const consentLifetime = 180 * 24 * 60 * 60 * 1000;
  const production = window.location.origin === "https://papou.work";
  const disableKey = `ga-disable-${measurementId}`;
  const panel = document.getElementById("analytics-consent");
  const settings = document.getElementById("analytics-settings");
  const status = document.getElementById("analytics-status");
  const tools = document.getElementById("analytics-tools");
  const allow = document.getElementById("analytics-allow");
  const decline = document.getElementById("analytics-decline");
  if (!panel || !settings || !status || !tools || !allow || !decline) return;
  // A duplicate controller must not register another tag or pageview.
  if (window.__papouAnalyticsLoaded) return;
  window.__papouAnalyticsLoaded = true;
  // Only reviewed public routes are sent; query strings and fragments stay private.
  const pages = new Map([
    ["/", ["/", "CV — Platform and SRE Engineering"]],
    ["/index.html", ["/", "CV — Platform and SRE Engineering"]],
    ["/portfolio.html", ["/portfolio.html", "Portfolio — Projects and lab photographs"]],
    ["/ats.html", ["/ats.html", "CV — ATS — DevOps and SRE Engineering"]],
  ]);
  const page = pages.get(new URL(window.location.href).pathname);

  const denied = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  };
  let active = false;
  let scriptAdded = false;
  let choiceSaved;
  let expiryTimer;
  window[disableKey] = true;

  function validChoice(saved) {
    return saved && ["granted", "denied"].includes(saved.value)
      && Number.isFinite(saved.expiresAt) && saved.expiresAt > Date.now()
      && saved.expiresAt <= Date.now() + consentLifetime;
  }

  function readStorage(storage) {
    try {
      const saved = JSON.parse(storage?.getItem(consentKey) || "null");
      if (validChoice(saved)) return { value: saved.value, expiresAt: saved.expiresAt };
      storage?.removeItem(consentKey);
    } catch { /* Blocked or malformed storage never grants consent. */ }
    return null;
  }

  function readChoice(skipSession = false) {
    // A session fallback overrides an unwritable permanent grant on reload.
    if (!skipSession) {
      try {
        const saved = readStorage(window.sessionStorage);
        if (saved) return { choice: saved, persisted: false };
      } catch { /* Access to the storage object itself may be blocked. */ }
    }
    try {
      const saved = readStorage(window.localStorage);
      if (saved) return { choice: saved, persisted: true };
    } catch { /* Google stays off until a choice is made. */ }
    return { choice: null, persisted: true };
  }

  let restored = readChoice();
  let choice = restored.choice;
  choiceSaved = restored.persisted;

  function showPanel(show, restoreFocus = false) {
    panel.hidden = !show;
    settings.setAttribute("aria-expanded", String(show));
    if (restoreFocus) settings.focus({ preventScroll: true });
  }

  function render() {
    tools.hidden = false;
    status.textContent = !production || !page ? "Google Analytics is disabled in this preview."
      : choice?.value === "granted" ? choiceSaved ? "Google Analytics is on."
        : "Google Analytics is on for this visit. Your browser could not save this choice."
      : choiceSaved ? "Google Analytics is off."
        : "Google Analytics is off for this visit. Your browser could not save this choice.";
    showPanel(Boolean(production && page) && !choice);
  }

  function safeReferrer() {
    try {
      const url = new URL(document.referrer);
      return ["https:", "http:"].includes(url.protocol) ? url.origin + "/" : "";
    } catch { return ""; }
  }

  function startAnalytics() {
    if (!production || !page || active || choice?.value !== "granted" || choice.expiresAt <= Date.now()) return;
    active = true;
    window[disableKey] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    // Basic consent mode: this queue and the Google script exist only after opt-in.
    window.gtag("consent", "default", denied);
    window.gtag("consent", "update", { ...denied, analytics_storage: "granted" });
    window.gtag("set", "ads_data_redaction", true);
    window.gtag("set", "url_passthrough", false);
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      send_page_view: false,
      cookie_domain: window.location.hostname,
      cookie_path: "/",
      cookie_expires: consentLifetime / 1000,
      cookie_update: false,
      cookie_flags: "SameSite=Lax;Secure",
      page_location: "https://papou.work" + page[0],
      page_referrer: safeReferrer(),
      page_title: page[1]
    });
    window.gtag("event", "page_view", { send_to: measurementId });
    if (!scriptAdded) {
      scriptAdded = true;
      const script = document.createElement("script");
      script.id = "papou-google-analytics";
      script.async = true;
      script.referrerPolicy = "no-referrer";
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
    }
  }

  function clearAnalyticsCookies() {
    for (const item of document.cookie.split(";")) {
      const name = item.trim().split("=")[0];
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of ["", window.location.hostname, "." + window.location.hostname]) {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure${domain ? `; Domain=${domain}` : ""}`;
      }
    }
  }

  function stopAnalytics(reload = true) {
    window[disableKey] = true;
    if (active) window.gtag("consent", "update", denied);
    if (production && page) clearAnalyticsCookies();
    if (active) {
      active = false;
      // Unload an already-running tag, including its pending timers/listeners.
      if (reload) window.location.reload();
    }
  }

  function checkExpiry() {
    window.clearTimeout(expiryTimer);
    if (!choice) return;
    const remaining = choice.expiresAt - Date.now();
    if (remaining <= 0) {
      choice = null;
      try { window.localStorage.removeItem(consentKey); } catch { /* Optional storage. */ }
      try { window.sessionStorage?.removeItem(consentKey); } catch { /* Optional storage. */ }
      stopAnalytics();
      render();
    } else {
      expiryTimer = window.setTimeout(checkExpiry, Math.min(remaining, 2147483647));
    }
  }

  function decide(value) {
    choice = { value, expiresAt: Date.now() + consentLifetime };
    choiceSaved = false;
    try {
      window.localStorage.setItem(consentKey, JSON.stringify(choice));
      choiceSaved = true;
    } catch { /* Keep the current decision even if persistence is blocked. */ }
    if (choiceSaved) {
      try { window.sessionStorage?.removeItem(consentKey); } catch { /* Optional storage. */ }
    } else {
      try { window.localStorage.removeItem(consentKey); } catch { /* May be read-only. */ }
      try { window.sessionStorage?.setItem(consentKey, JSON.stringify(choice)); } catch { /* Current-page disable still applies. */ }
    }
    if (value === "granted") startAnalytics();
    // Never reload back into a stale saved approval when browser storage is read-only.
    else stopAnalytics(readChoice().choice?.value !== "granted");
    checkExpiry();
    render();
    showPanel(false, true);
  }

  allow.addEventListener("click", () => decide("granted"));
  decline.addEventListener("click", () => decide("denied"));
  function trackPdfOpen(event, eventName) {
    if (event.defaultPrevented || !active || window[disableKey]
        || choice?.value !== "granted" || choice.expiresAt <= Date.now()) return;
    // A link activation, not proof of a completed download or a read document.
    // Keep native navigation and never send the link URL, filename or contact data.
    window.gtag("event", eventName, { send_to: measurementId });
  }
  for (const [id, eventName] of [["open-pdf", "cv_pdf_open"], ["download-ats-pdf", "cv_ats_pdf_open"]]) {
    const link = document.getElementById(id);
    link?.addEventListener("click", event => trackPdfOpen(event, eventName));
    link?.addEventListener("auxclick", event => {
      if (event.button === 1) trackPdfOpen(event, eventName);
    });
  }
  settings.addEventListener("click", () => {
    showPanel(panel.hidden);
    if (!panel.hidden) decline.focus({ preventScroll: true });
  });
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && choice) showPanel(false, true);
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== consentKey && event.key !== null) return;
    try { window.sessionStorage?.removeItem(consentKey); } catch { /* Cross-tab withdrawal still takes effect below. */ }
    restored = readChoice(true);
    choice = restored.choice;
    choiceSaved = restored.persisted;
    if (choice?.value === "granted") startAnalytics();
    else stopAnalytics(readChoice().choice?.value !== "granted");
    checkExpiry();
    render();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkExpiry();
  });

  if (choice?.value === "granted") startAnalytics();
  else if (production && page) clearAnalyticsCookies();
  checkExpiry();
  render();
})();
