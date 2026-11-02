// ترجمة AST سطر-بسطر مع حمايات قوية للنصوص التقنية.
// الاستخدام: node tools/translate-ast.mjs <dry|apply> <roots...>
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import * as acorn from 'acorn';
import * as walkMod from 'acorn-walk';
import { translateBatch } from '../lib/gtranslate.js';
import { unstyleFancyText } from '../lib/i18n.js';

const walk = walkMod.ancestor ? walkMod : (walkMod.default || walkMod);
const MODE = process.argv[2] || 'dry';
const ROOTS = process.argv.slice(3);
const CACHE_FILE = '/tmp/i18n-v4.json';

// خصائص ما تترجمش (أوامر/معرّفات/بروتوكول)
const SKIP_PROPS = new Set([
  'command', 'aliases', 'name', 'id', 'key', 'type', 'mimetype', 'fileName', 'ext',
  'status', 'surface', 'token', 'currencyCode', 'retailerId', 'priceAmount1000', 'price',
  'amount1000', 'currencyCodeIso4217', 'participant', 'remoteJid', 'vcard', 'mediaType',
  'url', 'link', 'href', 'src', 'endpoint', 'method', 'header', 'headers', 'userAgent', 'agent',
]);

// سطر "تقني" → ما نترجمهوش خالص
const TECH_LINE = [
  /:\/\//,                                            // روابط
  /\/[a-zA-Z][\w-]*\//,                               // مسار /faa/
  /(?:^|\s)[a-z][\w-]*\/[a-z][\w-]*(?:\s|$)/i,        // رمز أمر foo/bar
  /\b(?:pad|scale|crop|geq|overlay|fps_mode|codecs|boundary|charset|multipart|force_original_aspect_ratio|hue|saturation|zoompan|loop|frames|vf|filter_complex)\b/i,
  /=[^\s]*:[^\s]*/,                                   // مفتاح=قيمة:قيمة (ffmpeg)
  /; *codecs/i,
  /<\/?(?:text|svg|rect|tspan|style|g|path|div|span|html|body)\b/i,
  /BEGIN:VCARD|VERSION:3\.0|END:VCARD|^FN:|^N:;|^TEL|X-ABLabel/i,
  /@(?:s\.whatsapp\.net|g\.us|newsletter|broadcast|bot)\b/,
  /^(?:GET|POST|PUT|DELETE|PATCH|HEAD)\b/,
  /\b(?:api|json|html|css|svg|xml|utf-8|application|text|image|audio|video|font|multipart)\/[\w.+-]+/i,
  /\b(?:ow|iw|ih|oh)\b\s*[-+*/]/,                     // تعبيرات ffmpeg
  /^[a-z_$][\w$]*\s*=\s*[^ ]+$/i,                     // إسناد بسيط
];
const KEYWORDS = new Set(['use strict', 'module', 'commonjs', 'esm', 'utf-8', 'utf8', 'GET', 'POST', 'INQUIRY', 'CATALOG']);

function isArabic(s) { return /[\u0600-\u06FF]/.test(s); }

// أحرف/أنماط "كودية" → السطر تقني وميترجمش
const CODEISH = /[\\/=<>{}\[\];#&|@^~]/;
function lineTranslatable(rawLine) {
  const line = unstyleFancyText(rawLine);
  if (isArabic(line)) return false;
  const t = line.trim();
  if (!t || t.length < 4) return false;
  if (KEYWORDS.has(t)) return false;
  if (CODEISH.test(line)) return false;          // أي رمز كودي
  if (/\bMozilla\b|AppleWebKit|Gecko|Safari\b|Chrome\//i.test(line)) return false;
  if (/\s-[a-zA-Z]/.test(line)) return false;      // أعلام CLI زي -vn -map_metadata
  if (/^[A-Za-z][\w-]*:/.test(t)) return false;     // ترويسة بروتوكول زي X-WA-BIZ-NAME:
  if (/^[\w.@-]+$/.test(t)) return false;        // رمز واحد بدون مسافات
  for (const re of TECH_LINE) if (re.test(line)) return false;
  const words = (line.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}/g) || []);
  if (words.length < 2) return false;            // لازم كلمتين على الأقل
  return true;
}

function isTranslatable(v) {
  if (typeof v !== 'string') return false;
  const t = v.trim();
  if (t.length < 4) return false;
  if (isArabic(t)) return false;
  for (const re of TECH_LINE) if (re.test(v)) return false;
  if (!(v.match(/[A-Za-z]{2,}/g) || []).length) return false;
  return true;
}

function propName(node) {
  if (node?.type === 'Property' || node?.type === 'PropertyDefinition') return node.key?.name || node.key?.value;
  return null;
}

function skipNode(node, ancestors) {
  const parent = ancestors[ancestors.length - 2];
  const grand = ancestors[ancestors.length - 3];
  if (node.type === 'Literal' && node.regex) return true;
  if (parent?.type === 'Property' && parent.key === node && !parent.computed) return true;
  if (parent?.type === 'PropertyDefinition' && parent.key === node && !parent.computed) return true;
  if (parent?.type === 'MemberExpression' && parent.property === node) return true;
  if (['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration', 'ImportExpression'].includes(parent?.type)) return true;
  const pn = propName(parent);
  if (pn && SKIP_PROPS.has(pn)) return true;
  if (parent?.type === 'ArrayExpression' && grand && SKIP_PROPS.has(propName(grand))) return true;
  if (parent?.type === 'SwitchCase' && parent.test === node) return true;
  if (parent?.type === 'BinaryExpression' && ['==', '===', '!=', '!==', 'in'].includes(parent.operator)) return true;
  if (parent?.type === 'CallExpression' || parent?.type === 'NewExpression') {
    const callee = parent.callee;
    const cname = callee?.name || callee?.property?.name;
    if (['RegExp', 'Error', 'TypeError', 'RangeError', 'SyntaxError', 'ReferenceError', 'require', 'defineProperty', 'setTimeout', 'setInterval'].includes(cname)) return true;
    if (callee?.object?.name === 'console' || callee?.object?.name === 'assert') return true;
  }
  return false;
}

function collectFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  let ast;
  try {
    ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true, allowHashBang: true });
  } catch { return { file, items: [] }; }

  const found = [];
  walk.ancestor(ast, {
    Literal(node, _s, ancestors) {
      if (typeof node.value !== 'string') return;
      if (skipNode(node, ancestors)) return;
      if (!isTranslatable(node.value)) return;
      found.push({ start: node.start, end: node.end, value: node.value, kind: 'lit' });
    },
    TemplateLiteral(node, _s, ancestors) {
      if (skipNode(node, ancestors)) return;
      for (const q of node.quasis) {
        const v = q.value.cooked ?? q.value.raw;
        if (isTranslatable(v)) found.push({ start: q.start, end: q.end, value: v, kind: 'tpl' });
      }
    },
  });
  return { file, items: found };
}

function* walkFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') yield* walkFiles(p); }
    else if (/\.(js|cjs|mjs)$/.test(e.name)) yield p;
  }
}

// حماية الرموز/الإيموجي/الـplaceholders + رموز الأوامر
const TOK = (i) => `ZQ${i}QZ`;
const TOKRE = /ZQ(\d+)QZ/g;
const PROTECT = [
  /\p{Extended_Pictographic}/gu, /[\uFE0F\u200D\u20E3]/g,
  /\{[a-zA-Z_][\w]*\}/g, /%[a-zA-Z_][\w]*%/g, /\$\{[^}]*\}/g,
  /@\d{5,}/g, /https?:\/\/\S+/g,
  /[a-z]+(?:\/[a-z]+)+/gi,                              // coffee/cafe
  /@tag\b/gi,
  /\b[\w-]+\.(?:js|json|cjs|mjs|txt|md|yml|yaml|png|jpg|jpeg|mp4|mp3|ogg)\b/gi,  // أسماء ملفات
];
function protect(text) {
  const toks = [];
  let out = String(text);
  for (const re of PROTECT) out = out.replace(re, (m) => { toks.push(m); return TOK(toks.length - 1); });
  out = unstyleFancyText(out);
  return { out, toks };
}
function restore(text, toks) { return String(text).replace(TOKRE, (m, i) => toks[Number(i)] ?? m); }

const perFile = [];
const uniqueLines = new Set();
for (const root of ROOTS) {
  for (const f of walkFiles(root)) {
    const { items } = collectFile(f);
    if (!items.length) continue;
    perFile.push({ file: f, items });
    for (const it of items) for (const line of String(it.value).split('\n')) if (lineTranslatable(line)) uniqueLines.add(unstyleFancyText(line));
  }
}
const uniqList = [...uniqueLines];
console.log(`📊 ملفات: ${perFile.length} | أسطر فريدة: ${uniqList.length}`);

fs.writeFileSync('/tmp/i18n-v4-lines.txt', uniqList.join('\n'));
if (MODE === 'dry') {
  console.log('\n🔎 عينة (50):');
  for (const s of uniqList.slice(0, 50)) console.log('  •', JSON.stringify(s));
  process.exit(0);
}

let cache = {};
try { cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch {}
const todo = uniqList.filter((s) => !(s in cache));
console.log(`🌐 محتاج ترجمة: ${todo.length}`);

const CHUNK = 30;
for (let i = 0; i < todo.length; i += CHUNK) {
  const chunk = todo.slice(i, i + CHUNK);
  const prot = chunk.map((s) => protect(s).out);
  let out = null;
  for (let a = 1; a <= 3 && !out; a++) {
    try { out = await translateBatch(prot, 'ar', 'auto'); } catch { await new Promise((r) => setTimeout(r, 800 * a)); }
  }
  if (!out) { console.log(`⚠️ فشل جزء ${i}`); continue; }
  chunk.forEach((s, j) => {
    const t = protect(s);
    const r = restore(out[j] ?? t.out, t.toks);
    if (r && r !== s) cache[s] = r;
  });
  if ((i / CHUNK) % 6 === 0) console.log(`  ✅ ${Math.min(i + CHUNK, todo.length)}/${todo.length}`);
  await new Promise((r) => setTimeout(r, 250));
}
fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 0));

function translateValue(value) {
  return String(value).split('\n').map((line) => {
    const n = unstyleFancyText(line);
    if (!lineTranslatable(n)) return line;
    const lead = n.match(/^\s*/)[0];
    const trail = n.match(/\s*$/)[0];
    const core = n.slice(lead.length, n.length - trail.length);
    const tr = cache[core];
    return tr ? lead + tr + trail : line;
  }).join('\n');
}

const escLit = (s, q) => s.replace(/\\/g, '\\\\').replace(new RegExp(q, 'g'), '\\' + q).replace(/\n/g, '\\n').replace(/\r/g, '');
const escTpl = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

let changedFiles = 0, changedStrings = 0, failed = [];
for (const { file, items } of perFile) {
  const orig = fs.readFileSync(file, 'utf8');
  let src = orig;
  for (const it of [...items].sort((a, b) => b.start - a.start)) {
    const tr = translateValue(it.value);
    if (tr === it.value) continue;
    const raw = src.slice(it.start, it.end);
    const out = it.kind === 'lit' ? raw[0] + escLit(tr, raw[0]) + raw[0] : escTpl(tr);
    src = src.slice(0, it.start) + out + src.slice(it.end);
    changedStrings++;
  }
  fs.writeFileSync(file, src);
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    changedFiles++;
  } catch {
    fs.writeFileSync(file, orig);
    failed.push(file);
  }
}
console.log(`✍️ اتعدّل ${changedStrings} نص في ${changedFiles} ملف`);
if (failed.length) console.log(`⚠️ فشل وترجع: ${failed.length}\n  ${failed.join('\n  ')}`);
