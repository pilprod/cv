#!/usr/bin/env node
// Deterministic, dependency-free discovery pages from reviewed portfolio.json.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'portfolio.json'), 'utf8'));
const check = process.argv.includes('--check');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ref = id => ({'@id':id});
const projectId = p => `${data.canonical}#${p.id}`;
const repoUrl = r => `https://github.com/pilprod/${r.slug}`;
const variantUrl = (r, v) => `${repoUrl(r)}/blob/main/${v.path}`;
const imageId = p => `${data.canonical}#photo-${p.id}`;
const socialPhoto = data.photos.find(p => p.id === 'electronics-workbench');
const socialTitle = 'Ilya Papou — R&D projects, source code & lab photographs';
const socialDescription = `Agent infrastructure, aeroponics and zero-trust network experiments. Public GitHub code, archival prototypes and ${data.photos.length} lab photographs, with project context.`;
const socialImage = `https://papou.work/${socialPhoto.file}`;
const socialImageAlt = socialPhoto.caption + ' Background or identifying areas retouched with AI assistance.';
const graph = [
  {'@type':'WebSite','@id':'https://papou.work/#website',url:'https://papou.work/',name:'Ilya Papou — CV',publisher:ref(data.person)},
  {'@type':'Person','@id':data.person,name:'Ilya Papou',alternateName:['Ilya Popov','PILPROD','pilprod'],url:'https://papou.work/',sameAs:[data.linkedin.profile,'https://github.com/pilprod']},
  {'@type':'CollectionPage','@id':data.canonical,url:data.canonical,name:socialTitle,inLanguage:'en',dateModified:data.modified,primaryImageOfPage:ref(imageId(socialPhoto)),about:ref(data.person),isPartOf:ref('https://papou.work/#website'),mainEntity:{'@type':'ItemList',itemListElement:data.projects.map((p,i)=>({'@type':'ListItem',position:i+1,item:ref(projectId(p))}))}},
  ...['projects','experience'].map(kind=>({'@type':'WebPage','@id':data.linkedin[kind],url:data.linkedin[kind],name:`Ilya Papou — LinkedIn ${kind === 'projects' ? 'Projects' : 'Experience'}`,about:[ref(data.person),...data.projects.map(p=>ref(projectId(p)))]})),
  ...data.projects.flatMap(p=>[
    {'@type':'CreativeWork','@id':projectId(p),url:projectId(p),name:p.name,description:`${p.description} ${p.scope}`,creator:ref(data.person),creativeWorkStatus:p.status,spatialCoverage:{'@type':'Place',name:p.location},isPartOf:ref(data.canonical),hasPart:p.repositories.map(r=>ref(repoUrl(r))),subjectOf:[ref(data.linkedin.projects),ref(data.linkedin.experience),{'@type':'WebPage',url:`https://papou.work/#${p.cvAnchor}`,name:`${p.name} in the CV`}],...(p.id==='home'?{image:data.photos.map(photo=>ref(imageId(photo)))}:{})},
    ...p.repositories.flatMap(r=>[
      {'@type':'SoftwareSourceCode','@id':repoUrl(r),url:repoUrl(r),codeRepository:repoUrl(r),name:`pilprod/${r.slug}`,description:`${r.description} ${r.scope}`,programmingLanguage:r.language,isPartOf:ref(projectId(p)),...(r.upstream?{isBasedOn:r.upstream}:{}),...(r.variants?{hasPart:r.variants.map(v=>ref(variantUrl(r,v)))}:{})},
      ...(r.variants || []).map(v=>({'@type':'SoftwareSourceCode','@id':variantUrl(r,v),url:variantUrl(r,v),codeRepository:repoUrl(r),name:v.name,description:v.scope,programmingLanguage:'C++',creativeWorkStatus:'Archival prototype — not a final solution',isPartOf:ref(repoUrl(r))}))
    ])
  ]),
  ...data.photos.map(p=>({'@type':'ImageObject','@id':imageId(p),name:p.title,contentUrl:`https://papou.work/${p.file}`,url:`${data.canonical}#photo-${p.id}`,encodingFormat:'image/jpeg',width:p.width,height:p.height,caption:p.caption+(p.retouched?' Background or identifying areas retouched with AI assistance.':''),about:ref(`${data.canonical}#home`),isPartOf:ref(`${data.canonical}#home`),isBasedOn:p.source}))
];
const jsonld = JSON.stringify({'@context':'https://schema.org','@graph':graph},null,2);
const photoHtml = p => `<figure id="photo-${esc(p.id)}"><a href="${esc(p.file)}" aria-label="Open full photograph: ${esc(p.title)}"><img src="${esc(p.file)}" width="${p.width}" height="${p.height}" loading="lazy" decoding="async" alt="${esc(p.caption)}"></a><figcaption><strong>${esc(p.title)}</strong><p>${esc(p.caption)}</p>${p.retouched?'<small>AI-retouched background / identifying areas.</small>':''}<a class="source-link" href="${esc(p.source)}">Published source photo</a></figcaption></figure>`;
const variantsHtml = r => r.variants ? `<div class="variants"><h4>Archived prototypes · 2024</h4><ul>${r.variants.map(v=>`<li><a href="${esc(variantUrl(r,v))}">${esc(v.name)}</a><p>${esc(v.scope)}</p></li>`).join('')}</ul></div>` : '';
const projectHtml = p => `<section class="evidence-project" id="${esc(p.id)}" aria-labelledby="title-${esc(p.id)}">
  <header><p class="eyebrow">${esc(p.status)}</p><h2 id="title-${esc(p.id)}">${esc(p.name)}</h2><p class="project-period">${esc(p.period)} · ${esc(p.location)}</p></header>
  <p class="project-intro">${esc(p.description)}</p><p>${esc(p.scope)}</p>
  <div class="profile-mapping"><p><a href="/#${esc(p.cvAnchor)}">Project in the CV</a></p><p><a href="${esc(data.linkedin.projects)}">LinkedIn Projects</a>: ${esc(p.linkedinProject)}</p><p><a href="${esc(data.linkedin.experience)}">Associated Experience</a>: ${esc(p.experience)} — ${esc(p.experienceCompany)}</p></div>
  <ul class="repository-list">${p.repositories.map(r=>`<li><h3><a href="${esc(repoUrl(r))}">${esc(r.label)}</a></h3><p class="repo-name">pilprod/${esc(r.slug)}</p><p>${esc(r.description)}</p><p class="scope-note">${esc(r.scope)}</p>${r.upstream?`<p class="scope-note">Upstream: <a href="${esc(r.upstream)}">${esc(r.upstream.replace('https://github.com/',''))}</a></p>`:''}${variantsHtml(r)}</li>`).join('\n')}</ul>
  ${p.id==='home'?`<h3 class="gallery-title" id="lab-gallery">Lab photographs</h3><p>${data.photos.length} photographs of the wider historical installation, also published in the <a href="https://github.com/pilprod/aeroponics-iot-control#lab-gallery">controller README</a> and <a href="https://github.com/pilprod/aeroponics-sensor-firmware#lab-gallery">firmware README</a>. They do not verify that the archived firmware builds or that the full system is represented by the public code.</p><p class="scope-note">Five photographs have AI-retouched backgrounds or identifying areas, individually marked below. The wiring diagram, breadboard and root-chamber photograph have not been redrawn.</p><div class="photo-gallery">${data.photos.map(photoHtml).join('\n')}</div>`:''}
</section>`;
const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(socialTitle)}</title>
<meta name="description" content="${esc(socialDescription)}">
<meta name="author" content="Ilya Papou"><meta name="robots" content="index, follow, max-image-preview:large"><meta name="color-scheme" content="light dark">
<link rel="canonical" href="${data.canonical}"><link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="styles.css?v=20260906-compact-actions"><link rel="stylesheet" href="portfolio.css?v=20260906-compact-actions">
<link rel="alternate" hreflang="en" href="${data.canonical}"><link rel="alternate" hreflang="ru" href="https://papou.work/ru/portfolio.html"><link rel="alternate" hreflang="x-default" href="${data.canonical}">
<link rel="alternate" href="portfolio.md" type="text/markdown" title="Project sources in Markdown"><link rel="alternate" href="portfolio.jsonld" type="application/ld+json" title="Project relationship graph"><link rel="describedby" href="llms.txt" type="text/plain" title="CV overview for agents">
<meta property="og:type" content="website"><meta property="og:site_name" content="Ilya Papou — CV &amp; Portfolio"><meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(socialTitle)}"><meta property="og:description" content="${esc(socialDescription)}"><meta property="og:url" content="${data.canonical}">
<meta property="og:image" content="${socialImage}"><meta property="og:image:secure_url" content="${socialImage}"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="${socialPhoto.width}"><meta property="og:image:height" content="${socialPhoto.height}"><meta property="og:image:alt" content="${esc(socialImageAlt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(socialTitle)}"><meta name="twitter:description" content="${esc(socialDescription)}"><meta name="twitter:image" content="${socialImage}"><meta name="twitter:image:alt" content="${esc(socialImageAlt)}">
<script type="application/ld+json">${jsonld.replace(/</g,'\\u003c')}</script>
</head><body class="portfolio-page">
<a class="skip-link" href="#project-sources">Skip to project sources</a>
<div class="portfolio-toolbar"><a href="/">← Back to CV</a><nav aria-label="Profile links"><details class="language-menu"><summary aria-label="Choose language, current: English"><span class="current-language-flag" aria-hidden="true">🇬🇧</span><span class="language-caret" aria-hidden="true">▾</span></summary><div class="language-options"><a href="/portfolio.html" lang="en" aria-current="page"><span aria-hidden="true">🇬🇧</span> English</a><a href="/ru/portfolio.html" lang="ru"><span aria-hidden="true">🇷🇺</span> Русский</a></div></details><a href="https://github.com/pilprod">GitHub</a><a href="${data.linkedin.profile}">LinkedIn</a></nav></div>
<main class="portfolio-main" id="project-sources"><header class="portfolio-intro"><p class="eyebrow">Ilya Papou · Ilya Popov · pilprod</p><h1>Project sources<br>and lab photographs</h1><p>Code, context and hands-on work behind three personal R&D projects.</p><nav class="project-index" aria-label="R&D projects">${data.projects.map(p=>`<a href="#${p.id}">${esc(p.name)}</a>`).join('')}</nav></header>
${data.projects.map(projectHtml).join('\n')}
</main><footer class="portfolio-footer"><p><a href="portfolio.md">Markdown overview</a> · <a href="portfolio.jsonld">Structured project data</a> · <a href="/">Full CV</a></p><p>Research periods describe the work, not the publication date of a repository. LinkedIn links open the profile sections; locate the matching project and role shown here. Access may require sign-in.</p></footer>
</body></html>
`;
let markdown = '# Ilya Papou — Project sources and lab photographs\n\nIlya Papou, also known as Ilya Popov, PILPROD and pilprod.\n\n[CV](https://papou.work/) · [Readable portfolio]('+data.canonical+') · [GitHub](https://github.com/pilprod) · [LinkedIn]('+data.linkedin.profile+')\n\n';
for(const p of data.projects){
  markdown+=`## ${p.name}\n\n${p.period} · ${p.status} · ${p.location}\n\n${p.description}\n\n${p.scope}\n\n- [CV entry](https://papou.work/#${p.cvAnchor})\n- [LinkedIn Projects](${data.linkedin.projects}): ${p.linkedinProject}\n- [Associated LinkedIn Experience](${data.linkedin.experience}): ${p.experience} — ${p.experienceCompany}\n\n`;
  for(const r of p.repositories){
    markdown+=`- [pilprod/${r.slug}](${repoUrl(r)}): ${r.description} ${r.scope}${r.upstream?' Upstream: '+r.upstream+'.':''}\n`;
    for(const v of r.variants || [])markdown+=`  - [${v.name}](${variantUrl(r,v)}): Archival prototype, not a final solution. ${v.scope}\n`;
  }
  if(p.id==='home'){
    markdown+='\n### Lab photographs\n\nThese show the wider historical installation, not build verification or all code in either public repository. Both aeroponics READMEs contain the gallery. Five photos have background or identifying-area AI retouching. The root-chamber photograph has not been redrawn.\n\n';
    for(const photo of data.photos)markdown+=`- [${photo.title}](https://papou.work/${photo.file}): ${photo.caption}${photo.retouched?' AI-retouched background or identifying areas.':''} [Published source](${photo.source}).\n`;
  }
  markdown+='\n';
}
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>
<!-- Ilya Papou / Ilya Popov / PILPROD / pilprod: one person with a CV and supporting project materials. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url><loc>https://papou.work/</loc><lastmod>${data.cvModified}</lastmod><image:image><image:loc>https://papou.work/assets/portrait.jpg</image:loc></image:image></url>
  <url><loc>${data.canonical}</loc><lastmod>${data.modified}</lastmod>
${data.photos.map(p=>`    <image:image><image:loc>https://papou.work/${p.file}</image:loc></image:image>`).join('\n')}
  </url>
  <url><loc>https://papou.work/ru/</loc><lastmod>${data.cvModified}</lastmod><xhtml:link rel="alternate" hreflang="en" href="https://papou.work/"/><xhtml:link rel="alternate" hreflang="ru" href="https://papou.work/ru/"/><xhtml:link rel="alternate" hreflang="x-default" href="https://papou.work/"/></url>
  <url><loc>https://papou.work/ru/portfolio.html</loc><lastmod>${data.modified}</lastmod><xhtml:link rel="alternate" hreflang="en" href="${data.canonical}"/><xhtml:link rel="alternate" hreflang="ru" href="https://papou.work/ru/portfolio.html"/><xhtml:link rel="alternate" hreflang="x-default" href="${data.canonical}"/></url>
</urlset>
`;
// Each language pair declares reciprocal alternates, including English as the default.
const bilingualSitemap = sitemap.replace('</lastmod><image:image>', '</lastmod><xhtml:link rel="alternate" hreflang="en" href="https://papou.work/"/><xhtml:link rel="alternate" hreflang="ru" href="https://papou.work/ru/"/><xhtml:link rel="alternate" hreflang="x-default" href="https://papou.work/"/><image:image>')
  .replace(`<loc>${data.canonical}</loc><lastmod>${data.modified}</lastmod>`, `<loc>${data.canonical}</loc><lastmod>${data.modified}</lastmod><xhtml:link rel="alternate" hreflang="en" href="${data.canonical}"/><xhtml:link rel="alternate" hreflang="ru" href="https://papou.work/ru/portfolio.html"/><xhtml:link rel="alternate" hreflang="x-default" href="${data.canonical}"/>`);
for(const [file,draft] of Object.entries({'portfolio.html':html,'portfolio.md':markdown,'portfolio.jsonld':jsonld+'\n','sitemap.xml':bilingualSitemap})){
  const content = draft.replace(/[ \t]+$/gm, '').trimEnd() + '\n';
  const target=path.join(root,file);
  if(check){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==content)throw Error('Stale generated discovery resource: '+file);}
  else fs.writeFileSync(target,content);
}
console.log(check?'Portfolio resources are current.':'Built portfolio HTML, Markdown, JSON-LD and image sitemap.');
