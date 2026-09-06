#!/usr/bin/env node
// Static Russian counterpart. English remains the factual source and default.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const check = process.argv.includes('--check');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const source = JSON.parse(read('portfolio.json'));
const copy = JSON.parse(read('translations/ru.json'));
const norm = s => s.replace(/\s+/g, ' ').trim();
const decode = s => s.replace(/&#(x[\da-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : +n))
  .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, n) => ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '})[n]);
const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const translations = new Map(copy.replacements.map(({en, ru}) => [norm(en), norm(ru)]));
function fields(en, ru) {
  for (const [key, value] of Object.entries(ru)) {
    if (typeof en[key] === 'string' && typeof value === 'string') translations.set(norm(en[key]), value);
  }
}
for (const p of source.projects) {
  fields(p, copy.portfolio.projects[p.id]);
  // Names shown as LinkedIn associations must match the shared English records.
  translations.delete(norm(p.linkedinProject));
  translations.delete(norm(p.experienceCompany));
  for (const r of p.repositories) {
    fields(r, copy.portfolio.repositories[r.slug]);
    for (const v of r.variants || []) fields(v, copy.portfolio.variants[v.path]);
  }
}
for (const photo of source.photos) fields(photo, copy.portfolio.photos[photo.id]);
for (const photo of source.photos) translations.set('Open full photograph: ' + photo.title, 'Открыть полное фото: ' + copy.portfolio.photos[photo.id].title);
const extras = {
  'Choose language, current: English':'Выбрать язык, текущий: русский',
  'Platform & delivery':'Платформа и CI/CD', 'Cloud infrastructure':'Облака',
  'ML & data infrastructure':'ML и данные', 'Agent infrastructure & R&D':'Агенты и R&D',
  'Security & reliability':'Безопасность и SRE',
  'Project sources & lab photographs · papou.work/portfolio.html':'Код и фото проектов · papou.work/ru/portfolio.html',
  'Language':'Язык', 'Profile links':'Ссылки профиля',
  'Ilya Papou — R&D projects, source code & lab photographs':'Илья Папоу — R&D-проекты, код и фотографии лаборатории',
  'Ilya Papou — CV & Portfolio':'Илья Папоу — Резюме и портфолио',
  'Agent infrastructure, aeroponics and zero-trust network experiments. Public GitHub code, archival prototypes and 9 lab photographs, with project context.':'Инфраструктура агентов, аэропоника и эксперименты с Zero-Trust-сетью. Публичный код на GitHub, архивные прототипы и 9 фотографий лаборатории с описанием проектов.',
  'Project sources in Markdown':'Код и проекты в Markdown', 'Project relationship graph':'Связи проектов',
  'Skip to project sources':'Перейти к материалам проектов', '← Back to CV':'← К резюме',
  'Project sources':'Код проектов', 'and lab photographs':'и фотографии лаборатории',
  'Code, context and hands-on work behind three personal R&D projects.':'Код, описание и практическая работа в трёх личных R&D-проектах.',
  'R&D projects':'R&D-проекты', 'Project in the CV':'Проект в резюме',
  'Associated Experience':'Связанный опыт', 'Archived prototypes · 2024':'Архивные прототипы · 2024',
  'Lab photographs':'Фотографии лаборатории', 'Published source photo':'Исходное фото в репозитории',
  'Open full photograph:':'Открыть полное фото:',
  'AI-retouched background / identifying areas.':'Фон и идентифицирующие детали отретушированы с помощью AI.',
  'Background or identifying areas retouched with AI assistance.':'Фон или идентифицирующие детали отретушированы с помощью AI.',
  '9 photographs of the wider historical installation, also published in the':'9 фотографий установки периода работы над проектом. Галерея также опубликована в',
  'controller README':'README контроллеров', 'firmware README':'README прошивок', 'and':'и',
  '. They do not verify that the archived firmware builds or that the full system is represented by the public code.':'. Фотографии не подтверждают возможность сборки архивных прошивок или наличие всей системы в публичном коде.',
  'Five photographs have AI-retouched backgrounds or identifying areas, individually marked below. The wiring diagram, breadboard and root-chamber photograph have not been redrawn.':'На пяти фотографиях фон или идентифицирующие детали обработаны с помощью AI; это указано в подписях. Схема соединений, макетная плата и фото корневой камеры не перерисованы.',
  'Markdown overview':'Обзор в Markdown', 'Structured project data':'Структурированные данные', 'Full CV':'Полное резюме',
  'Research periods describe the work, not the publication date of a repository. LinkedIn links open the profile sections; locate the matching project and role shown here. Access may require sign-in.':'Даты относятся к работе над проектами, а не к публикации репозиториев. Ссылки LinkedIn открывают разделы профиля: названия соответствующих проектов и ролей указаны выше. Для просмотра может потребоваться вход.',
  'Archival prototype — not a final solution':'Архивный прототип — не готовое решение',
  'Page 1 / 2':'Страница 1 / 2', 'Page 2 / 2':'Страница 2 / 2'
};
for (const [en, ru] of Object.entries(extras)) translations.set(norm(en), ru);
// Keep the shared project name and technology names stable across languages.
translations.set('Agent Orchestration Infrastructure', 'Agent Orchestration Infrastructure');
for (const term of ['Schema validation', 'contract tests']) translations.set(term, term);
const fragments = [...translations].filter(([en]) => en.length > 12).sort((a,b) => b[0].length-a[0].length);
function translate(value) {
  const text = norm(value);
  if (translations.has(text)) return translations.get(text);
  let result = text;
  for (const [en, ru] of fragments) if (en !== ru) result = result.split(en).join(ru);
  return result;
}
function url(value) {
  if (/^(?:\/?assets\/|\/?portfolio-images\/)/.test(value)) return '/' + value.replace(/^\//, '');
  if (/^(?:styles\.css|portfolio\.css|analytics\.js)/.test(value)) return '/' + value;
  if (/^(?:\/?)(portfolio\.(?:html|md|jsonld)|llms\.txt)/.test(value)) return '/ru/' + value.replace(/^\//, '');
  if (value === '/' || /^\/#/.test(value)) return '/ru/' + value.slice(1);
  if (value === 'https://papou.work/' || value.startsWith('https://papou.work/portfolio.')) return value.replace('https://papou.work/', 'https://papou.work/ru/');
  if (value === 'https://papou.work/#profile') return 'https://papou.work/ru/#profile';
  return value;
}
function graphValue(value, key = '') {
  if (Array.isArray(value)) return value.map(v => graphValue(v, key));
  if (value && typeof value === 'object') {
    if (value['@type'] === 'WebSite') return {...value, inLanguage:['en','ru']};
    const translated = Object.fromEntries(Object.entries(value).map(([k,v]) => [k, graphValue(v,k)]));
    if (value['@type'] === 'Person') {
      translated.url = 'https://papou.work/';
      translated.alternateName = [...new Set([...(translated.alternateName || []), 'Ilya Papou', 'Ilya Popov', 'PILPROD', 'pilprod'])];
    }
    return translated;
  }
  if (typeof value !== 'string') return value;
  if (key === 'inLanguage') return 'ru';
  if (/^(https?:|#)/.test(value)) return url(value);
  return translate(value);
}
function html(en) {
  return en.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->|<[^>]+>|[^<]+/gi, part => {
    if (/^<script/i.test(part)) {
      if (part.includes('application/ld+json')) return '<script type="application/ld+json">' + JSON.stringify(graphValue(JSON.parse(part.replace(/^<script[^>]*>|<\/script>$/gi, ''))), null, 2).replace(/</g, '\\u003c') + '</script>';
      return part.replace('Ilya Papou CV — DevOps & SRE', 'Ilya Papou CV — DevOps & SRE — RU')
        .replace('src="analytics.js', 'src="/analytics.js');
    }
    if (/^<(style|!--)/i.test(part)) return part;
    if (part.startsWith('<')) {
      if (/\bhreflang=/.test(part)) return part;
      const languageLink = /^<a\s/i.test(part) && /lang="(?:en|ru)"/.test(part);
      let result = part.replace(/\b(alt|title|aria-label|content)="([^"]*)"/g, (_, attr, text) => `${attr}="${esc(translate(decode(text)))}"`);
      if (!languageLink) result = result.replace(/\b(href|src)="([^"]*)"/g, (_, attr, value) => `${attr}="${url(value)}"`);
      if (/^<html/i.test(result)) result = result.replace('lang="en"', 'lang="ru"');
      if (result.includes('property="og:locale"')) result = result.replace('en_US','ru_RU');
      if (result.includes('property="og:url"')) result = result.replace(/content="([^"]+)"/, (_, value) => `content="${url(value)}"`);
      if (result.includes('id="open-pdf"')) result = result.replace('SRE.pdf', 'SRE%20%E2%80%94%20RU.pdf');
      if (languageLink) result = result.includes('lang="en"') ? result.replace(' aria-current="page"','') : result.replace('lang="ru"', 'lang="ru" aria-current="page"');
      return result;
    }
    const decoded = decode(part);
    if (!decoded.trim()) return part;
    return (part.match(/^\s*/)[0]) + esc(translate(decoded)) + (part.match(/\s*$/)[0]);
  }).replace('<span class="current-language-flag" aria-hidden="true">🇬🇧</span>', '<span class="current-language-flag" aria-hidden="true">🇷🇺</span>');
}
const cv = html(read('index.html'));
const portfolio = html(read('portfolio.html'));
const graph = graphValue(JSON.parse(read('portfolio.jsonld')));
let markdown = '# Илья Папоу — проекты, код и фотографии лаборатории\n\n[English version](https://papou.work/portfolio.html) · [Резюме](https://papou.work/ru/) · [LinkedIn](https://www.linkedin.com/in/pilprod/) · [GitHub](https://github.com/pilprod)\n\n';
for (const p of source.projects) {
  markdown += `## ${translate(p.name)}\n\n${translate(p.period)} · ${translate(p.location)} · ${translate(p.status)}\n\n${translate(p.description)}\n\n${translate(p.scope)}\n\n[Проект в CV](https://papou.work/ru/#${p.cvAnchor}) · [LinkedIn Projects](${source.linkedin.projects}) — ${p.linkedinProject} · [LinkedIn Experience](${source.linkedin.experience}) — ${p.experience}\n\n`;
  for (const r of p.repositories) {
    markdown += `- [${r.label}](https://github.com/pilprod/${r.slug}): ${translate(r.description)} ${translate(r.scope)}\n`;
    for (const v of r.variants || []) markdown += `  - [${v.name}](https://github.com/pilprod/${r.slug}/blob/main/${v.path}): архивный прототип, не готовое решение. ${translate(v.scope)}\n`;
  }
}
markdown += '\n## Фотографии лаборатории\n\nФото показывают историческую установку, а не подтверждение сборки публичного кода.\n\n';
for (const photo of source.photos) markdown += `- [${translate(photo.title)}](https://papou.work/${photo.file}): ${translate(photo.caption)}${photo.retouched ? ' Фон или идентифицирующие детали обработаны с помощью AI.' : ''} [Источник](${photo.source}).\n`;
const readableCV = cv.match(/<main class="cv">([\s\S]*?)<\/main>/)[1]
  .replace(/<svg\b[\s\S]*?<\/svg>/g, '').replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, text) => `[${decode(text.replace(/<[^>]*>/g, ''))}](${href.startsWith('/') ? 'https://papou.work'+href : href})`)
  .replace(/<\/(?:p|li|h[1-6]|article|section|div|header|footer|dd|dt)>/g, '\n').replace(/<[^>]*>/g,'');
const llms = '# Илья Папоу — резюме\n\nАнглийская версия является основной. Русская версия содержит те же факты и ссылки. Ilya Papou / Ilya Popov / PILPROD / pilprod — один человек.\n\n[English](https://papou.work/) · [Русская версия](https://papou.work/ru/) · [PDF](https://papou.work/assets/Ilya%20Papou%20CV%20%E2%80%94%20DevOps%20%26%20SRE%20%E2%80%94%20RU.pdf) · [Портфолио](https://papou.work/ru/portfolio.html) · [Markdown](https://papou.work/ru/portfolio.md) · [Связи проектов](https://papou.work/ru/portfolio.jsonld)\n\n' + decode(readableCV).split('\n').map(norm).filter(Boolean).join('\n\n') + '\n';
// Fail if an English achievement changed without a reviewed Russian replacement.
for (const block of read('index.html').matchAll(/<ul class="achievements">([\s\S]*?)<\/ul>/g)) {
  for (const item of block[1].matchAll(/<li>([\s\S]*?)<\/li>/g)) {
    const text = norm(decode(item[1]));
    if (!translations.has(text)) throw Error('Missing reviewed achievement translation: ' + text);
  }
}
for (const [name, value] of Object.entries({'index.html':cv, 'portfolio.html':portfolio, 'portfolio.md':markdown, 'portfolio.jsonld':JSON.stringify(graph,null,2)+'\n', 'llms.txt':llms})) {
  const file = path.join(root, 'ru', name);
  if (check) { if (!fs.existsSync(file) || fs.readFileSync(file,'utf8') !== value) throw Error('Stale Russian resource: '+name); }
  else { fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file,value); }
}
console.log(check ? 'Russian resources are current.' : 'Built Russian CV, portfolio, Markdown, graph and llms.txt.');
