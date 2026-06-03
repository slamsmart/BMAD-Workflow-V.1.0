#!/usr/bin/env node
/**
 * build-pdf.js — Convert WORKFLOW_GUIDE.md → WORKFLOW_GUIDE.pdf
 *
 * Strategy:
 *   1. Read markdown
 *   2. Render via marked + GFM
 *   3. Inject Mermaid runtime so diagrams render in browser
 *   4. Print to PDF using headless Chrome/Edge (no puppeteer install)
 *
 * Usage:
 *   node scripts/build-pdf.js [input.md] [output.pdf]
 *   default: WORKFLOW_GUIDE.md → WORKFLOW_GUIDE.pdf
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const INPUT = path.resolve(ROOT, process.argv[2] || 'WORKFLOW_GUIDE.md');
const OUTPUT = path.resolve(ROOT, process.argv[3] || 'WORKFLOW_GUIDE.pdf');

if (!fs.existsSync(INPUT)) {
  console.error(`[!] Input not found: ${INPUT}`);
  process.exit(1);
}

function findChrome() {
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  throw new Error('Chrome/Edge not found. Install Chrome or Edge.');
}

function ensureMarked() {
  try {
    require.resolve('marked');
    return require('marked');
  } catch {
    console.log('[i] Installing marked locally (one-time, ~50KB)...');
    execSync('npm install marked@13 --no-save --silent', { cwd: ROOT, stdio: 'inherit' });
    return require(path.resolve(ROOT, 'node_modules/marked'));
  }
}

const { marked } = ensureMarked();

const md = fs.readFileSync(INPUT, 'utf8');

// Strip YAML frontmatter (Pandoc-style) and harvest title/date
let title = 'BMAD Workflow Guide';
let subtitle = '';
let dateStr = new Date().toISOString().slice(0, 10);
const fm = md.match(/^---\n([\s\S]*?)\n---\n/);
let body = md;
if (fm) {
  const yaml = fm[1];
  const t = yaml.match(/title:\s*"?([^"\n]+)"?/);
  const s = yaml.match(/subtitle:\s*"?([^"\n]+)"?/);
  const d = yaml.match(/date:\s*"?([^"\n]+)"?/);
  if (t) title = t[1].trim();
  if (s) subtitle = s[1].trim();
  if (d) dateStr = d[1].trim();
  body = md.slice(fm[0].length);
}

// Custom renderer: keep ```mermaid``` as <div class="mermaid"> so the
// browser-side Mermaid runtime renders them. Other code blocks → highlighted <pre>.
const renderer = new marked.Renderer();
const baseCode = renderer.code.bind(renderer);
renderer.code = function (code, infostring, escaped) {
  const lang = (infostring || '').trim().toLowerCase();
  if (lang === 'mermaid') {
    const text = typeof code === 'string' ? code : code.text;
    return `<div class="mermaid">\n${text}\n</div>\n`;
  }
  return baseCode(code, infostring, escaped);
};

marked.setOptions({ gfm: true, breaks: false, headerIds: true, mangle: false });
const htmlBody = marked.parse(body, { renderer });

const css = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", "Calibri", system-ui, -apple-system, sans-serif;
    line-height: 1.55;
    color: #1a1a1a;
    max-width: 880px;
    margin: 0 auto;
    padding: 28px 36px;
    font-size: 11pt;
  }
  h1, h2, h3, h4 { color: #0d3b66; margin-top: 1.4em; }
  h1 { font-size: 22pt; border-bottom: 2px solid #0d3b66; padding-bottom: 6px; }
  h2 { font-size: 16pt; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  h3 { font-size: 13pt; }
  h4 { font-size: 11.5pt; }
  code {
    font-family: "Cascadia Mono", "Consolas", "Menlo", monospace;
    background: #f3f4f6;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 0.92em;
  }
  pre {
    background: #1e293b;
    color: #e2e8f0;
    padding: 12px 14px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 9.5pt;
    line-height: 1.45;
    page-break-inside: avoid;
  }
  pre code { background: transparent; color: inherit; padding: 0; }
  blockquote {
    border-left: 4px solid #0d3b66;
    background: #eef4fb;
    margin: 1em 0;
    padding: 8px 14px;
    color: #2c3e50;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    font-size: 10pt;
    page-break-inside: avoid;
  }
  th, td { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; }
  th { background: #0d3b66; color: white; }
  tr:nth-child(even) td { background: #f9fafb; }
  hr { border: none; border-top: 1px solid #ccc; margin: 2em 0; }
  a { color: #0d3b66; }
  .mermaid {
    text-align: center;
    margin: 1.2em 0;
    page-break-inside: avoid;
  }
  .cover {
    text-align: center;
    padding: 80px 0 40px;
    page-break-after: always;
  }
  .cover h1 { font-size: 32pt; border: none; margin-bottom: 8px; }
  .cover .sub { font-size: 14pt; color: #555; margin-bottom: 40px; }
  .cover .meta { font-size: 11pt; color: #777; }
  @media print {
    body { padding: 0 12mm; }
    h1, h2, h3 { page-break-after: avoid; }
    pre, table, .mermaid { page-break-inside: avoid; }
  }
`;

const cover = `
  <div class="cover">
    <h1>${title}</h1>
    ${subtitle ? `<div class="sub">${subtitle}</div>` : ''}
    <div class="meta">${dateStr}</div>
  </div>
`;

const html = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>${css}</style>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
</head>
<body>
${cover}
${htmlBody}
<script>
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    flowchart: { htmlLabels: true, useMaxWidth: true },
    securityLevel: 'loose'
  });
  (async () => {
    try { await mermaid.run({ querySelector: '.mermaid' }); } catch (e) { console.error(e); }
    document.title = 'READY:' + document.title;
    window.__mermaidDone = true;
  })();
</script>
</body>
</html>`;

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bmad-pdf-'));
const tmpHtml = path.join(tmpDir, 'guide.html');
fs.writeFileSync(tmpHtml, html, 'utf8');

console.log(`[i] HTML: ${tmpHtml}`);
console.log(`[i] PDF:  ${OUTPUT}`);

const chrome = findChrome();
console.log(`[i] Browser: ${chrome}`);

const fileUrl = 'file:///' + tmpHtml.replace(/\\/g, '/');

const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--no-pdf-header-footer',
  '--virtual-time-budget=15000',
  '--run-all-compositor-stages-before-draw',
  `--print-to-pdf=${OUTPUT}`,
  '--print-to-pdf-no-header',
  fileUrl,
];

const result = spawnSync(chrome, args, { stdio: 'inherit' });

if (result.status !== 0 || !fs.existsSync(OUTPUT)) {
  console.error('[!] PDF generation failed.');
  process.exit(result.status || 1);
}

const sizeKB = (fs.statSync(OUTPUT).size / 1024).toFixed(1);
console.log(`[ok] Generated ${path.basename(OUTPUT)} (${sizeKB} KB)`);

try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
