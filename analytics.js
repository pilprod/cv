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

  // Cloudflare resolves the visitor country. Never infer it from language,
  // timezone or cached browser state, and never send trace data to Google.
  let automaticOutsideEU = false;
  let regionResolved = false;
  const euCountries = new Set("AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE".split(" "));
  const countries = new Set("AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW".split(" "));

  function analyticsAllowed() {
    if (choice && choice.expiresAt > Date.now()) return choice.value === "granted";
    return automaticOutsideEU;
  }

  function applyRegion(outsideEU) {
    regionResolved = true;
    automaticOutsideEU = outsideEU;
    if (analyticsAllowed()) startAnalytics();
    else if (production && page) clearAnalyticsCookies();
    render();
  }

  async function resolveRegion() {
    if (!production || !page) return;
    if (window.location.origin !== "https://papou.work" || typeof window.fetch !== "function") {
      applyRegion(false);
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2000);
    try {
      const response = await window.fetch("/cdn-cgi/trace", {
        cache: "no-store", credentials: "omit", redirect: "error", signal: controller.signal
      });
      if (!response.ok || !response.headers.get("content-type")?.startsWith("text/plain")) throw Error("Region unavailable");
      const trace = await response.text();
      const locations = trace.length <= 4096 ? [...trace.matchAll(/^loc=([A-Z]{2})\r?$/gm)] : [];
      const country = locations.length === 1 ? locations[0][1] : "";
      applyRegion(countries.has(country) && !euCountries.has(country));
    } catch {
      applyRegion(false);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function showPanel(show, restoreFocus = false) {
    panel.hidden = !show;
    settings.setAttribute("aria-expanded", String(show));
    if (restoreFocus) settings.focus({ preventScroll: true });
  }

  function render() {
    tools.hidden = false;
    status.textContent = !production || !page ? "Google Analytics is disabled in this preview."
      : analyticsAllowed() ? !choice ? "Google Analytics is on. You can turn it off in settings."
        : choiceSaved ? "Google Analytics is on."
        : "Google Analytics is on for this visit. Your browser could not save this choice."
      : choiceSaved ? "Google Analytics is off."
        : "Google Analytics is off for this visit. Your browser could not save this choice.";
    showPanel(Boolean(production && page) && !choice && !automaticOutsideEU);
  }

  function safeReferrer() {
    try {
      const url = new URL(document.referrer);
      return ["https:", "http:"].includes(url.protocol) ? url.origin + "/" : "";
    } catch { return ""; }
  }

  function startAnalytics() {
    if (!production || !page || active || !analyticsAllowed()) return;
    active = true;
    window[disableKey] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    // EU/unknown visitors need opt-in; verified non-EU visitors use the default unless declined.
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
      if (analyticsAllowed()) startAnalytics();
      else stopAnalytics();
      render();
    } else {
      expiryTimer = window.setTimeout(checkExpiry, Math.min(remaining, 2147483647));
    }
  }

  function reloadCanPreserveRefusal() {
    const saved = readChoice().choice;
    // A non-EU default would restart after reload if the refusal cannot be saved.
    return saved?.value === "denied" || (regionResolved && !automaticOutsideEU && saved?.value !== "granted");
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
    else stopAnalytics(reloadCanPreserveRefusal());
    checkExpiry();
    render();
    showPanel(false, true);
  }

  allow.addEventListener("click", () => decide("granted"));
  decline.addEventListener("click", () => decide("denied"));
  function trackLinkOpen(event, eventName) {
    if (event.defaultPrevented || !active || window[disableKey]
        || !analyticsAllowed()) return;
    // A link activation, not proof of a completed download, read or booking.
    // Keep native navigation and never send the link URL, filename or contact data.
    window.gtag("event", eventName, { send_to: measurementId });
  }
  for (const [id, eventName] of [["open-pdf", "cv_pdf_open"], ["download-ats-pdf", "cv_ats_pdf_open"], ["book-call", "booking_open"]]) {
    const link = document.getElementById(id);
    link?.addEventListener("click", event => trackLinkOpen(event, eventName));
    link?.addEventListener("auxclick", event => {
      if (event.button === 1) trackLinkOpen(event, eventName);
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
    if (analyticsAllowed()) startAnalytics();
    else stopAnalytics(reloadCanPreserveRefusal());
    checkExpiry();
    render();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkExpiry();
  });

  if (analyticsAllowed()) startAnalytics();
  else if (choice && production && page) clearAnalyticsCookies();
  checkExpiry();
  render();
  resolveRegion();
})();
