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
  if (!panel || !settings || !status || !tools) return;
  const isRussian = document.documentElement?.lang === "ru";
  const messages = isRussian ? ["В предпросмотре аналитика отключена.", "Аналитика включена.", "Аналитика отключена.", "Аналитика отключена на время этого посещения. Браузер не смог сохранить выбор."]
    : ["Analytics is disabled in this preview.", "Analytics is on.", "Analytics is off.", "Analytics is off for this visit. Your browser could not save this choice."];

  const denied = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  };
  let active = false;
  let scriptAdded = false;
  let choiceSaved = true;
  let expiryTimer;
  window[disableKey] = true;

  function readChoice() {
    try {
      const saved = JSON.parse(window.sessionStorage?.getItem(consentKey) || window.localStorage.getItem(consentKey));
      if (saved && ["granted", "denied"].includes(saved.value)
          && Number.isFinite(saved.expiresAt) && saved.expiresAt > Date.now()
          && saved.expiresAt <= Date.now() + consentLifetime) return saved;
      window.localStorage.removeItem(consentKey);
    } catch { /* Storage may be blocked. Analytics stays off without a choice. */ }
    return null;
  }

  let choice = readChoice();

  function showPanel(show, restoreFocus = false) {
    panel.hidden = !show;
    settings.setAttribute("aria-expanded", String(show));
    if (restoreFocus) settings.focus({ preventScroll: true });
  }

  function render() {
    tools.hidden = false;
    status.textContent = !production ? messages[0]
      : choice?.value === "granted" ? messages[1]
      : choiceSaved ? messages[2] : messages[3];
    showPanel(!choice);
  }

  function safeReferrer() {
    try {
      const url = new URL(document.referrer);
      return ["https:", "http:"].includes(url.protocol) ? url.origin + "/" : "";
    } catch { return ""; }
  }

  function startAnalytics() {
    if (!production || active || choice?.value !== "granted" || choice.expiresAt <= Date.now()) return;
    active = true;
    window[disableKey] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    // Basic consent mode: this queue and the Google script exist only after opt-in.
    window.gtag("consent", "default", denied);
    window.gtag("consent", "update", { ...denied, analytics_storage: "granted" });
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      send_page_view: false,
      page_location: "https://papou.work/",
      page_referrer: safeReferrer(),
      page_title: "CV — Platform and SRE Engineering"
    });
    window.gtag("event", "page_view", { send_to: measurementId });
    if (!scriptAdded) {
      scriptAdded = true;
      const script = document.createElement("script");
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
    clearAnalyticsCookies();
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
      stopAnalytics();
      render();
    } else {
      expiryTimer = window.setTimeout(checkExpiry, Math.min(remaining, 2147483647));
    }
  }

  function decide(value) {
    choice = { value, expiresAt: Date.now() + consentLifetime };
    choiceSaved = true;
    try {
      window.localStorage.setItem(consentKey, JSON.stringify(choice));
      window.sessionStorage?.removeItem(consentKey);
    } catch {
      choiceSaved = false;
      try { window.localStorage.removeItem(consentKey); } catch { /* May be read-only. */ }
      try { window.sessionStorage?.setItem(consentKey, JSON.stringify(choice)); } catch { /* Current-page disable still applies. */ }
    }
    if (value === "granted") startAnalytics();
    // Never reload back into a stale saved approval when browser storage is read-only.
    else stopAnalytics(readChoice()?.value !== "granted");
    checkExpiry();
    render();
    showPanel(false, true);
  }

  document.getElementById("analytics-allow").addEventListener("click", () => decide("granted"));
  document.getElementById("analytics-decline").addEventListener("click", () => decide("denied"));
  settings.addEventListener("click", () => {
    showPanel(panel.hidden);
    if (!panel.hidden) document.getElementById("analytics-decline").focus({ preventScroll: true });
  });
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && choice) showPanel(false, true);
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== consentKey && event.key !== null) return;
    choice = readChoice();
    if (choice?.value === "granted") startAnalytics();
    else stopAnalytics();
    checkExpiry();
    render();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkExpiry();
  });

  if (choice?.value === "granted") startAnalytics();
  else clearAnalyticsCookies();
  checkExpiry();
  render();
})();
