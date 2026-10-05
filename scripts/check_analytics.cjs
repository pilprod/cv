#!/usr/bin/env node
// Dependency-free browser mocks. No requests are made to Google during tests.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "analytics.js"), "utf8");
const ID = "G-HHJNK65HTV";
const KEY = "papou.analytics-consent.v1";
const LIFETIME = 180 * 24 * 60 * 60 * 1000;
const NOW = Date.parse("2026-09-05T12:00:00Z");

class Element {
  constructor() { this.hidden = true; this.listeners = {}; this.attributes = {}; }
  addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
  setAttribute(name, value) { this.attributes[name] = value; }
  focus() { this.focused = true; }
  fire(name, event = {}) { for (const callback of this.listeners[name] || []) callback(event); }
}

function browser(options = {}) {
  const state = { now: NOW, reloads: 0, scripts: [], timers: new Map(), cookieWrites: [] };
  const ids = ["analytics-consent", "analytics-settings", "analytics-status", "analytics-tools", "analytics-allow", "analytics-decline", "open-pdf", "download-ats-pdf", "book-call"];
  const elements = Object.fromEntries(ids.map((id) => [id, new Element()]));
  const storage = new Map();
  if (options.saved !== undefined) storage.set(KEY, typeof options.saved === "string" ? options.saved : JSON.stringify(options.saved));
  const cookies = new Map(Object.entries(options.cookies || {}));
  const url = new URL(options.url || "https://papou.work/?email=visitor@example.com&q=private#secret");
  const windowEvents = {}, documentEvents = {};
  let timerId = 0;
  const window = {
    location: { origin: url.origin, hostname: url.hostname, href: url.href, reload() { state.reloads++; } },
    localStorage: {
      getItem(key) { if (options.storageBlocked) throw Error("Storage blocked"); return storage.get(key) || null; },
      setItem(key, value) { if (options.storageBlocked || options.storageReadOnly) throw Error("Storage blocked"); storage.set(key, value); },
      removeItem(key) { if (options.storageBlocked || options.storageReadOnly) throw Error("Storage blocked"); storage.delete(key); }
    },
    setTimeout(callback, delay) { const id = ++timerId; state.timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { state.timers.delete(id); },
    addEventListener(name, callback) { windowEvents[name] = callback; }
  };
  if (options.sessionStorage) {
    const session = new Map();
    if (options.sessionSaved !== undefined) session.set(KEY, typeof options.sessionSaved === "string" ? options.sessionSaved : JSON.stringify(options.sessionSaved));
    window.sessionStorage = {
      getItem(key) { return session.get(key) || null; },
      setItem(key, value) { session.set(key, value); },
      removeItem(key) { session.delete(key); }
    };
  }
  if (options.sessionStorageGetterBlocked) {
    Object.defineProperty(window, "sessionStorage", { get() { throw Error("Session storage blocked"); } });
  }
  if (options.fetch) window.fetch = options.fetch;
  const document = {
    documentElement: {lang: options.lang || 'en'},
    referrer: options.referrer ?? "https://alice:password@example.org/private?email=referrer@example.com#hidden",
    visibilityState: "visible",
    head: { appendChild(script) { state.scripts.push(script); } },
    getElementById(id) { return elements[id]; },
    createElement(tag) { assert.equal(tag, "script"); return new Element(); },
    addEventListener(name, callback) { documentEvents[name] = callback; },
    get cookie() { return [...cookies].map(([key, value]) => key + "=" + value).join("; "); },
    set cookie(value) {
      state.cookieWrites.push(value);
      if (value.includes("Max-Age=0")) cookies.delete(value.split("=")[0]);
    }
  };
  class Clock extends Date { static now() { return state.now; } }
  const context = vm.createContext({ window, document, URL, Date: Clock, AbortController });
  vm.runInContext(source, context, { filename: "analytics.js" });
  return {
    state, window, document, elements, storage, cookies,
    runAgain() { vm.runInContext(source, context, { filename: "analytics.js" }); },
    click(id) { elements[id].fire("click"); },
    commands() { return Array.from(window.dataLayer || [], (entry) => Array.from(entry)); },
    stored() { return JSON.parse(storage.get(KEY)); },
    storageEvent(value, key = KEY) {
      if (value === null) storage.delete(KEY); else storage.set(KEY, JSON.stringify(value));
      windowEvents.storage({ key });
    },
    advance(milliseconds) { state.now += milliseconds; documentEvents.visibilitychange(); }
  };
}

let passed = 0;
function test(name, run) { run(); passed++; console.log("PASS:", name); }

test("fresh visit is off with no Google script or event queue", () => {
  const app = browser({ cookies: { _ga: "old", _ga_OLD: "old", unrelated: "keep" } });
  assert.equal(app.state.scripts.length, 0);
  assert.equal(app.window.dataLayer, undefined);
  assert.equal(app.window["ga-disable-" + ID], true);
  assert.equal(app.elements["analytics-consent"].hidden, false);
  assert.equal(app.elements["analytics-tools"].hidden, false);
  assert.deepEqual([...app.cookies.keys()], ["unrelated"]);
});

test("decline persists for 180 days and never loads Google", () => {
  const app = browser();
  app.click("analytics-decline");
  assert.deepEqual(app.stored(), { value: "denied", expiresAt: NOW + LIFETIME });
  assert.equal(app.state.scripts.length, 0);
  assert.equal(app.commands().length, 0);
  assert.equal(app.elements["analytics-consent"].hidden, true);
  assert.equal(app.state.reloads, 0);
  assert.equal(browser({ saved: app.stored() }).state.scripts.length, 0);
});

test("allow sends one sanitized pageview, denies all advertising, and loads once", () => {
  const app = browser();
  app.click("analytics-allow");
  const commands = app.commands();
  assert.equal(app.window["ga-disable-" + ID], false);
  assert.equal(app.state.scripts.length, 1);
  assert.equal(app.state.scripts[0].src, "https://www.googletagmanager.com/gtag/js?id=" + ID);
  assert.equal(app.state.scripts[0].async, true);
  assert.equal(app.state.scripts[0].referrerPolicy, "no-referrer");
  assert.equal(commands[0][0], "consent");
  assert.equal(commands[0][1], "default");
  assert.equal(commands[0][2].analytics_storage, "denied");
  assert.equal(commands[1][2].analytics_storage, "granted");
  for (const command of [commands[0], commands[1]]) {
    for (const type of ["ad_storage", "ad_user_data", "ad_personalization"]) assert.equal(command[2][type], "denied");
  }
  const config = commands.find(([type]) => type === "config")[2];
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.allow_ad_personalization_signals, false);
  assert.equal(config.send_page_view, false);
  assert.equal(config.cookie_domain, "papou.work");
  assert.equal(config.cookie_path, "/");
  assert.equal(config.cookie_expires, LIFETIME / 1000);
  assert.equal(config.cookie_update, false);
  assert.equal(config.cookie_flags, "SameSite=Lax;Secure");
  assert.deepEqual(commands.filter(([type]) => type === "set"), [["set", "ads_data_redaction", true], ["set", "url_passthrough", false]]);
  assert.equal(config.page_location, "https://papou.work/");
  assert.equal(config.page_referrer, "https://example.org/");
  assert.equal(config.page_title, "CV — Platform and SRE Engineering");
  assert.equal("user_id" in config, false);
  assert.equal("user_properties" in config, false);
  assert.equal(commands.filter(([type]) => type === "event").length, 1);
  assert.equal(commands.find(([type]) => type === "event")[1], "page_view");
  assert.doesNotMatch(JSON.stringify(commands), /visitor@|referrer@|password|alice|private|secret|link_url|mailto:/);
  app.click("analytics-allow");
  assert.equal(app.state.scripts.length, 1);
  assert.equal(app.commands().filter(([type]) => type === "event").length, 1);
});

test("saved approval loads, while previews and lookalike hosts never collect", () => {
  const saved = { value: "granted", expiresAt: NOW + LIFETIME };
  assert.equal(browser({ saved }).state.scripts.length, 1);
  for (const url of ["http://localhost:8000/", "http://127.0.0.1:8000/", "https://papou.work.example/", "http://papou.work/", "https://papou.work:8080/"]) {
    const app = browser({ saved, url });
    app.click("analytics-allow");
    assert.equal(app.state.scripts.length, 0, url);
    assert.equal(app.window.dataLayer, undefined, url);
  }
});

test("unsafe or invalid referrers are dropped", () => {
  for (const referrer of ["", "not a URL", "javascript:secret", "data:text/plain,secret"]) {
    const app = browser({ referrer });
    app.click("analytics-allow");
    assert.equal(app.commands().find(([type]) => type === "config")[2].page_referrer, "");
  }
});

test("withdrawal disables even a pending tag, clears only GA cookies, and reloads", () => {
  const app = browser({ saved: { value: "granted", expiresAt: NOW + LIFETIME }, cookies: { _ga: "value", _ga_TEST: "value", unrelated: "keep" } });
  app.click("analytics-settings");
  assert.equal(app.elements["analytics-consent"].hidden, false);
  app.click("analytics-decline");
  assert.equal(app.window["ga-disable-" + ID], true);
  assert.equal(app.stored().value, "denied");
  assert.equal(app.state.reloads, 1);
  assert.deepEqual([...app.cookies.keys()], ["unrelated"]);
  assert.equal(app.commands().at(-1)[2].analytics_storage, "denied");
  assert.equal(app.state.scripts.length, 1);
});

test("expired or malformed decisions fail closed", () => {
  for (const saved of ["not json", "null", { value: "granted", expiresAt: NOW }, { value: "granted", expiresAt: NOW + LIFETIME + 1 }, { value: "granted", expiresAt: "2099" }, { value: "other", expiresAt: NOW + LIFETIME }]) {
    const app = browser({ saved });
    assert.equal(app.state.scripts.length, 0);
    assert.equal(app.elements["analytics-consent"].hidden, false);
  }
});

test("open-page expiry is enforced without overflowing browser timers", () => {
  const app = browser({ saved: { value: "granted", expiresAt: NOW + LIFETIME } });
  assert.equal([...app.state.timers.values()][0].delay, 2147483647);
  app.advance(LIFETIME);
  assert.equal(app.window["ga-disable-" + ID], true);
  assert.equal(app.state.reloads, 1);
  assert.equal(app.storage.has(KEY), false);
  assert.equal(app.elements["analytics-consent"].hidden, false);
  const session = browser({ sessionStorage: true, sessionSaved: { value: "granted", expiresAt: NOW + 1 } });
  session.advance(2);
  assert.equal(session.window.sessionStorage.getItem(KEY), null);
  assert.equal(session.window["ga-disable-" + ID], true);
  assert.equal(session.state.reloads, 1);
});

test("cross-tab withdrawal and cleared storage stop collection", () => {
  for (const value of [{ value: "denied", expiresAt: NOW + LIFETIME }, null]) {
    const app = browser({ saved: { value: "granted", expiresAt: NOW + LIFETIME } });
    app.storageEvent(value, value === null ? null : KEY);
    assert.equal(app.window["ga-disable-" + ID], true);
    assert.equal(app.state.reloads, 1);
  }
});

test("blocked storage respects the current decision without breaking the page", () => {
  const app = browser({ storageBlocked: true });
  assert.equal(app.state.scripts.length, 0);
  app.click("analytics-allow");
  assert.equal(app.state.scripts.length, 1);
  app.click("analytics-decline");
  assert.equal(app.window["ga-disable-" + ID], true);
  assert.equal(app.state.reloads, 1);
});

test("a read-only stale grant cannot be restored by an automatic withdrawal reload", () => {
  const app = browser({ saved: { value: "granted", expiresAt: NOW + LIFETIME }, storageReadOnly: true });
  assert.equal(app.state.scripts.length, 1);
  app.click("analytics-decline");
  assert.equal(app.stored().value, "granted");
  assert.equal(app.window["ga-disable-" + ID], true);
  assert.equal(app.state.reloads, 0);
  assert.match(app.elements["analytics-status"].textContent, /could not save/);
  app.click("analytics-allow");
  assert.equal(app.state.scripts.length, 1, "an already-loaded script is reused");
});

test("session fallback overrides a stale permanent grant before reloading", () => {
  const app = browser({ saved: { value: "granted", expiresAt: NOW + LIFETIME }, storageReadOnly: true, sessionStorage: true });
  app.click("analytics-decline");
  assert.equal(app.window["ga-disable-" + ID], true);
  assert.equal(JSON.parse(app.window.sessionStorage.getItem(KEY)).value, "denied");
  assert.equal(app.state.reloads, 1);
});

test("duplicate controller execution cannot duplicate tags, pageviews or PDF listeners", () => {
  const app = browser({ saved: { value: "granted", expiresAt: NOW + LIFETIME } });
  app.runAgain();
  app.click("analytics-allow");
  app.click("open-pdf");
  assert.equal(app.state.scripts.length, 1);
  assert.equal(app.commands().filter(([type]) => type === "config").length, 1);
  assert.equal(app.commands().filter(([type, name]) => type === "event" && name === "page_view").length, 1);
  assert.equal(app.commands().filter(([type, name]) => type === "event" && name === "cv_pdf_open").length, 1);
});

test("blocked or invalid session storage does not hide valid permanent decisions", () => {
  for (const options of [
    { sessionStorageGetterBlocked: true },
    { sessionStorage: true, sessionSaved: "not json" },
    { sessionStorage: true, sessionSaved: { value: "denied", expiresAt: NOW } }
  ]) {
    const app = browser({ ...options, saved: { value: "granted", expiresAt: NOW + LIFETIME } });
    assert.equal(app.state.scripts.length, 1);
    app.click("analytics-decline");
    assert.equal(app.stored().value, "denied");
    assert.equal(app.window["ga-disable-" + ID], true);
    assert.equal(app.state.reloads, 1);
    assert.equal(app.elements["analytics-status"].textContent, "Google Analytics is off.");
  }
});

test("cross-tab refusal overrides an old session fallback", () => {
  const app = browser({ storageReadOnly: true, sessionStorage: true });
  app.click("analytics-allow");
  assert.equal(JSON.parse(app.window.sessionStorage.getItem(KEY)).value, "granted");
  app.storageEvent({ value: "denied", expiresAt: NOW + LIFETIME });
  assert.equal(app.window["ga-disable-" + ID], true);
  assert.equal(app.state.reloads, 1);
  assert.equal(app.window.sessionStorage.getItem(KEY), null);
});

test("known pages remain distinguishable without leaking query strings or fragments", () => {
  for (const [input, canonical] of [["/", "/"], ["/index.html", "/"], ["/portfolio.html", "/portfolio.html"], ["/ats.html", "/ats.html"]]) {
    const app = browser({ url: "https://papou.work" + input + "?email=private@example.com#secret", saved: {value: "granted", expiresAt: NOW + LIFETIME} });
    const config = app.commands().find(([type]) => type === "config")[2];
    assert.equal(config.page_location, "https://papou.work" + canonical);
    assert.doesNotMatch(JSON.stringify(app.commands()), /private@|secret/);
    if (input === "/ats.html") assert.equal(config.page_title, "CV — ATS — DevOps and SRE Engineering");
  }
  const unknown = browser({url: "https://papou.work/private-path", saved: {value: "granted", expiresAt: NOW + LIFETIME}});
  assert.equal(unknown.state.scripts.length, 0);
  assert.equal(unknown.elements["analytics-consent"].hidden, true);
  assert.match(unknown.elements["analytics-status"].textContent, /disabled/);
});

test("PDF activation requires live consent and never sends a link URL", () => {
  const app = browser();
  app.click("open-pdf");
  assert.equal(app.commands().length, 0);
  app.click("analytics-allow");
  app.click("open-pdf");
  const events = () => app.commands().filter(([type, name]) => type === "event" && name === "cv_pdf_open");
  assert.equal(events().length, 1);
  assert.deepEqual(Object.keys(events()[0][2]), ["send_to"]);
  app.elements["open-pdf"].fire("auxclick", {button: 2});
  app.elements["open-pdf"].fire("click", {defaultPrevented: true});
  assert.equal(events().length, 1);
  app.elements["open-pdf"].fire("auxclick", {button: 1});
  assert.equal(events().length, 2);
  app.click("analytics-decline");
  app.click("open-pdf");
  assert.equal(events().length, 2);
  const expired = browser({saved: {value: "granted", expiresAt: NOW + 1}});
  expired.state.now += 2;
  expired.click("open-pdf");
  assert.equal(expired.commands().filter(([type]) => type === "event").length, 1);
});

test("PDF on preview origins never emits even with stored consent", () => {
  const app = browser({url: "http://localhost/", saved: {value: "granted", expiresAt: NOW + LIFETIME}});
  app.click("open-pdf");
  app.click("download-ats-pdf");
  assert.equal(app.commands().length, 0);
});

test("ATS PDF activation requires live consent and never sends a link URL or filename", () => {
  const app = browser({ url: "https://papou.work/ats.html?email=private@example.com#secret" });
  app.click("download-ats-pdf");
  assert.equal(app.commands().length, 0);
  app.click("analytics-allow");
  app.elements["download-ats-pdf"].fire("click", { defaultPrevented: true });
  app.elements["download-ats-pdf"].fire("auxclick", { button: 2 });
  const events = () => app.commands().filter(([type, name]) => type === "event" && name === "cv_ats_pdf_open");
  assert.equal(events().length, 0);
  app.click("download-ats-pdf");
  app.elements["download-ats-pdf"].fire("auxclick", { button: 1 });
  assert.equal(events().length, 2);
  for (const event of events()) assert.deepEqual(Object.keys(event[2]), ["send_to"]);
  assert.doesNotMatch(JSON.stringify(app.commands()), /private@|secret|link_url|file_name|\.pdf/);
  app.click("analytics-decline");
  app.click("download-ats-pdf");
  assert.equal(events().length, 2);
  const expired = browser({ url: "https://papou.work/ats.html", saved: { value: "granted", expiresAt: NOW + 1 } });
  expired.state.now += 2;
  expired.click("download-ats-pdf");
  assert.equal(expired.commands().filter(([type, name]) => type === "event" && name === "cv_ats_pdf_open").length, 0);
});

test("booking activation uses live consent, minimal fields and native link semantics on all routes", () => {
  for (const route of ["/", "/ats.html", "/portfolio.html"]) {
    const app = browser({url: "https://papou.work" + route + "?email=private@example.com#secret"});
    const events = () => app.commands().filter(([type, name]) => type === "event" && name === "booking_open");
    app.click("book-call");
    assert.equal(events().length, 0);
    app.click("analytics-allow");
    app.elements["book-call"].fire("click", {defaultPrevented:true});
    app.elements["book-call"].fire("auxclick", {button:2});
    assert.equal(events().length, 0);
    app.click("book-call");
    app.elements["book-call"].fire("auxclick", {button:1});
    assert.equal(events().length, 2);
    for (const event of events()) assert.deepEqual(JSON.parse(JSON.stringify(event)), ["event", "booking_open", {send_to:ID}]);
    assert.doesNotMatch(JSON.stringify(app.commands()), /private@|secret|calendar\.app|link_url|file_name/);
    app.click("analytics-decline");
    app.click("book-call");
    assert.equal(events().length, 2);
  }
  for (const url of ["http://localhost/", "https://papou.work/unreviewed.html"]) {
    const app=browser({url,saved:{value:"granted",expiresAt:NOW+LIFETIME}});
    app.click("book-call");
    assert.equal(app.commands().length,0);
  }
  const expired=browser({saved:{value:"granted",expiresAt:NOW+1}});
  expired.state.now+=2;expired.click("book-call");
  assert.equal(expired.commands().filter(x=>x[0]==="event"&&x[1]==="booking_open").length,0);
});

test("all published pages include one controller and the consent controls", () => {
  for (const file of ["index.html", "portfolio.html", "ats.html"]) {
    const html = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    assert.equal((html.match(/<script src="\/?analytics\.js\?/g) || []).length, 1, file);
    assert.doesNotMatch(html, /<script\b[^>]*src=["'][^"']*(?:googletagmanager|google-analytics)\.com/i, "Google must be loaded by the opt-in controller");
    assert.doesNotMatch(html, /\bgtag\s*\(/, "No second Google installation in the HTML");
    assert.doesNotMatch(html, /static\.cloudflareinsights\.com|data-cf-beacon/i, "Cloudflare must use automatic injection, without a manual beacon");
    assert.match(html, /Cloudflare separately measures page performance without cookies, with EU visitors excluded\./, file);
    assert.match(html, /These buttons control Google Analytics\./, file);
    for (const id of ["analytics-tools", "analytics-status", "analytics-consent", "analytics-settings", "analytics-allow", "analytics-decline", "open-pdf", "download-ats-pdf", "book-call"]) {
      assert.equal((html.match(new RegExp('id="' + id + '"', 'g')) || []).length, 1, file + ": " + id);
    }
  }
});

test("ATS formats remain discoverable and the PDF action lives in the footer", () => {
  for (const file of ["index.html", "portfolio.html", "ats.html"]) {
    const html=fs.readFileSync(path.join(__dirname,"..",file),"utf8");
    const strip=html.match(/<nav class="pdf-strip"[\s\S]*?<\/nav>/)[0];
    assert.doesNotMatch(strip,/download-ats-pdf|Open ATS version/,file);
    const footer=html.match(/<footer class="analytics-footer"[\s\S]*?<\/footer>/)[0];
    assert.match(footer,/id="download-ats-pdf"/,file);
    assert.match(html,/<link rel="alternate" href="\/ats\.md" type="text\/markdown"/,file);
  }
  const guide=fs.readFileSync(path.join(__dirname,"..","llms.txt"),"utf8");
  const preferred=guide.split("## Preferred CV for automated reading")[1].split("## Supporting CV links")[0];
  assert.equal(preferred.match(/\]\((https:[^)]+)\)/)[1],"https://papou.work/ats.html");
  assert.match(preferred,/llms-full\.txt/);
  const ats=fs.readFileSync(path.join(__dirname,"..","ats.html"),"utf8");
  assert.doesNotMatch(ats,/<meta name="robots" content="[^"]*noindex/);
  assert.match(ats,/<link rel="canonical" href="https:\/\/papou\.work\/"/);
});

async function regionalTests() {
  const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
  const response = country => ({ok:true,headers:{get:()=>"text/plain; charset=UTF-8"},text:async()=>"ip=192.0.2.123\nloc="+country+"\n"});
  async function regionalTest(name, run) { await run(); passed++; console.log("PASS:", name); }

  await regionalTest("all 27 EU countries wait for approval", async () => {
    for (const country of "AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE".split(" ")) {
      const app = browser({fetch:async()=>response(country)});
      await flush();
      assert.equal(app.state.scripts.length, 0, country);
      assert.equal(app.window.dataLayer, undefined, country);
      app.click("analytics-allow");
      assert.equal(app.state.scripts.length, 1, country);
    }
  });
  await regionalTest("verified non-EU visitors start automatically without storing approval or resetting cookies", async () => {
    for (const country of ["US","AR","RU","GB","NO","CA","JP","AU","XK"]) {
      const app = browser({cookies:{_ga:"existing"},fetch:async(url, options)=>{
        assert.equal(url,"/cdn-cgi/trace");
        assert.equal(options.cache,"no-store");
        assert.equal(options.credentials,"omit");
        assert.equal(options.redirect,"error");
        return response(country);
      }});
      assert.equal(app.state.scripts.length,0,"wait for region confirmation");
      await flush();
      assert.equal(app.state.scripts.length,1,country);
      assert.equal(app.cookies.get("_ga"),"existing",country);
      assert.equal(app.storage.has(KEY),false,"automatic policy is not explicit approval");
      assert.equal(app.elements["analytics-consent"].hidden,true,country);
      assert.equal(app.commands().filter(x=>x[0]==="event"&&x[1]==="page_view").length,1);
      assert.doesNotMatch(JSON.stringify(app.commands()),/192\.0\.2\.123|loc=/);
      app.click("analytics-allow");
      assert.equal(app.state.scripts.length,1,"no duplicate on later approval");
    }
  });
  await regionalTest("saved and newly selected refusal override non-EU automatic collection", async () => {
    const saved = browser({saved:{value:"denied",expiresAt:NOW+LIFETIME},fetch:async()=>response("US")});
    await flush();
    assert.equal(saved.state.scripts.length,0);
    const app = browser({fetch:async()=>response("US")});
    await flush();
    app.click("analytics-decline");
    assert.equal(app.window["ga-disable-"+ID],true);
    assert.equal(app.state.reloads,1);
    assert.equal(app.stored().value,"denied");
    const next = browser({saved:app.stored(),fetch:async()=>response("US")});
    await flush();
    assert.equal(next.state.scripts.length,0);
  });
  await regionalTest("non-EU refusal with unwritable storage stays disabled without reloading into the default", async () => {
    for (const options of [{storageBlocked:true},{storageReadOnly:true}]) {
      const app=browser({...options,fetch:async()=>response("US")});await flush();
      assert.equal(app.state.scripts.length,1);
      app.click("analytics-decline");
      assert.equal(app.window["ga-disable-"+ID],true);
      assert.equal(app.state.reloads,0,"a reload would lose the unsaved refusal");
      assert.match(app.elements["analytics-status"].textContent,/off for this visit/);
    }
  });
  await regionalTest("unsaved withdrawal during lookup cannot reload into a non-EU default", async () => {
    let resolve;
    const app=browser({storageBlocked:true,fetch:()=>new Promise(r=>{resolve=r;})});
    app.click("analytics-allow");
    app.click("analytics-decline");
    assert.equal(app.state.reloads,0);
    assert.equal(app.window["ga-disable-"+ID],true);
    resolve(response("AR"));await flush();
    assert.equal(app.state.scripts.length,1,"only the previously approved tag was added");
    assert.equal(app.window["ga-disable-"+ID],true);
    assert.match(app.elements["analytics-status"].textContent,/off for this visit/);
  });
  await regionalTest("a refusal made during region lookup is respected when it resolves", async () => {
    let resolve;
    const app=browser({fetch:()=>new Promise(r=>{resolve=r;})});
    app.click("analytics-decline");
    resolve(response("US"));
    await flush();
    assert.equal(app.state.scripts.length,0);
    assert.equal(app.stored().value,"denied");
  });
  await regionalTest("unavailable, invalid or redirected region responses stay opt-in", async () => {
    const replies=[
      async()=>{throw Error("network blocked");},
      async()=>({...response("US"),ok:false}),
      async()=>({...response("US"),headers:{get:()=>"text/html"}}),
      async()=>response("XX"),async()=>response("ZZ"),async()=>response("T1"),
      async()=>({...response("US"),text:async()=>"loc=US\nloc=DE\n"}),
    ];
    for(const fetch of replies){
      const app=browser({fetch});await flush();
      assert.equal(app.state.scripts.length,0);
      assert.equal(app.elements["analytics-consent"].hidden,false);
      app.click("analytics-allow");
      assert.equal(app.state.scripts.length,1,"explicit approval remains available");
    }
    const timeout=browser({fetch:(_,options)=>new Promise((_,reject)=>options.signal.addEventListener("abort",()=>reject(Error("aborted"))))});
    const timer=[...timeout.state.timers.values()].find(t=>t.delay===2000);
    assert(timer);timer.callback();await flush();
    assert.equal(timeout.state.scripts.length,0);
    assert.equal(timeout.elements["analytics-consent"].hidden,false);
  });
  await regionalTest("region confirmation cannot enable preview or unreviewed routes", async () => {
    for(const url of ["http://localhost:8000/","https://example.invalid/","https://papou.work/other.html"]){
      let called=false;const app=browser({url,fetch:async()=>{called=true;return response("US");}});
      await flush();assert.equal(called,false);assert.equal(app.state.scripts.length,0);
    }
  });
  await regionalTest("cross-tab refusal stops a regional default and cannot be restored on reload", async () => {
    const app=browser({fetch:async()=>response("US")});await flush();
    app.storageEvent({value:"denied",expiresAt:NOW+LIFETIME});
    assert.equal(app.window["ga-disable-"+ID],true);
    assert.equal(app.state.reloads,1);
    const next=browser({saved:app.stored(),fetch:async()=>response("US")});await flush();
    assert.equal(next.state.scripts.length,0);
  });
  await regionalTest("non-EU automatic collection includes reviewed PDF events and stops on refusal", async () => {
    const app=browser({fetch:async()=>response("US")});await flush();
    app.click("open-pdf");app.click("download-ats-pdf");
    const pdfEvents=()=>app.commands().filter(x=>x[0]==="event"&&["cv_pdf_open","cv_ats_pdf_open"].includes(x[1]));
    assert.equal(pdfEvents().length,2);
    app.click("analytics-decline");app.click("open-pdf");
    assert.equal(pdfEvents().length,2);
  });
  await regionalTest("booking follows the non-EU default and stops on cross-tab refusal", async () => {
    const app=browser({fetch:async()=>response("AR")});
    app.click("book-call");assert.equal(app.commands().length,0);
    await flush();app.click("book-call");
    const events=()=>app.commands().filter(x=>x[0]==="event"&&x[1]==="booking_open");
    assert.equal(events().length,1);
    app.storageEvent({value:"denied",expiresAt:NOW+LIFETIME});
    app.click("book-call");assert.equal(events().length,1);
  });
  console.log(`\n${passed} analytics checks passed. No network requests were made.`);
}
regionalTests().catch(error=>{console.error(error);process.exitCode=1;});
