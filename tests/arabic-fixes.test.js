import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { arabicAliases, resolveArabicAlias } from '../lib/arabic-aliases.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const SELF = fileURLToPath(import.meta.url);

function walkJs(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'canvas-vendor') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkJs(full));
    else if (entry.name.endsWith('.js') && full !== SELF) out.push(full);
  }
  return out;
}

const files = walkJs(root);

test('no translated WhatsApp protocol JIDs remain in source', () => {
  const damaged = ['@النشرة الإخبارية', '@ النشرة الإخبارية', '@إذاعة', 'الحالة @ البث'];
  const hits = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const token of damaged) {
      if (text.includes(token)) hits.push(`${path.relative(root, file)} :: ${token}`);
    }
  }
  assert.deepEqual(hits, [], `arabized protocol JIDs found:\n${hits.join('\n')}`);
});

test('no translated technical file paths or CLI flags remain in source', () => {
  const damaged = [
    'التكوين.json', 'قاعدة البيانات.json', 'مجموعات.json', 'غطاء ذاكرة التخزين المؤقت.json',
    'كتالوج.jpg', 'خطأ.txt', 'تحديث.txt', 'سجل التغيير.txt',
    '--متحرك', '-مستوى السجل', '-مستوى_الضغط', '-الإطارات: الخامس', 'fps_mode العبور',
    '-صورة محددة مسبقًا', '-جودة',
    '`قاعدة البيانات/${entry.name}`', 'Backup_metadata.json'
  ];
  const hits = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const token of damaged) {
      if (text.includes(token)) hits.push(`${path.relative(root, file)} :: ${token}`);
    }
  }
  assert.deepEqual(hits, [], `arabized technical strings found:\n${hits.join('\n')}`);
});

test('no translated button/interactive IDs remain in source', () => {
  const hits = [];
  const re = /id:\s*[`'"]([^`'"]*[\u0600-\u06FF][^`'"]*)[`'"]/;
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const m = line.match(re);
      if (m) hits.push(`${path.relative(root, file)}:${i + 1} :: ${m[1]}`);
    });
  }
  assert.deepEqual(hits, [], `arabized button IDs found:\n${hits.join('\n')}`);
});

test('Egyptian Arabic alias map resolves to real commands', () => {
  const expectations = {
    'منيو': 'menu', 'قائمه': 'menu', 'القائمه': 'menu',
    'تحميل': 'play', 'ملصق': 'sticker', 'اطرد': 'kick',
    'رصيدي': 'balance', 'اتجوز': 'casarse', 'بينج': 'ping',
    'ارفع': 'promote', 'تنزيل': 'demote', 'كتم': 'mute'
  };
  for (const [arabic, command] of Object.entries(expectations)) {
    assert.equal(resolveArabicAlias(arabic), command, `${arabic} should resolve to ${command}`);
  }
});

test('every Arabic alias points to a real plugin command', () => {
  const pluginsDir = path.join(root, 'plugins');
  const commands = new Set();
  for (const file of walkJs(pluginsDir)) {
    const src = fs.readFileSync(file, 'utf8');
    // handles `handler.command = ['a']` and chained `handler.command = handler.help = ['a']`
    const arrRe = /command\s*=\s*(?:[A-Za-z_$][\w$.]*\s*=\s*)*\[([^\]]+)\]/g;
    let m;
    while ((m = arrRe.exec(src))) {
      for (const c of m[1].split(',')) {
        const v = c.trim().replace(/^['"`]|['"`]$/g, '');
        if (/^[a-zA-Z0-9_]+$/.test(v)) commands.add(v);
      }
    }
    const rxRe = /command\s*[:=]\s*\/\^?\(?([^/]+)\)?\$?\/i?/g;
    while ((m = rxRe.exec(src))) {
      for (const c of m[1].split('|')) {
        const v = c.replace(/\\/g, '').trim();
        if (/^[a-zA-Z0-9_]+$/.test(v)) commands.add(v);
      }
    }
    // obfuscated plugins assign commands via indexed keys, e.g. handler['command'] = ['x','y']
    const idxRe = /\]\s*=\s*\[([^\]]+)\]/g;
    while ((m = idxRe.exec(src))) {
      for (const c of m[1].split(',')) {
        const v = c.trim().replace(/^['"`]|['"`]$/g, '');
        if (/^[a-zA-Z0-9_]+$/.test(v)) commands.add(v);
      }
    }
  }
  const orphans = Object.entries(arabicAliases)
    .filter(([, target]) => !commands.has(target))
    .map(([arabic, target]) => `${arabic} → ${target}`);
  assert.deepEqual(orphans, [], `aliases point to non-existent commands:\n${orphans.join('\n')}`);
});

test('every plugin command is reachable through an Arabic alias', () => {
  const pluginsDir = path.join(root, 'plugins');
  const commands = new Set();
  for (const file of walkJs(pluginsDir)) {
    const src = fs.readFileSync(file, 'utf8');
    const arrRe = /command\s*=\s*(?:[A-Za-z_$][\w$.]*\s*=\s*)*\[([^\]]+)\]/g;
    let m;
    while ((m = arrRe.exec(src))) {
      for (const c of m[1].split(',')) {
        const v = c.trim().replace(/^['"`]|['"`]$/g, '');
        if (/^[a-zA-Z0-9_]+$/.test(v)) commands.add(v);
      }
    }
    const rxRe = /command\s*[:=]\s*\/\^?\(?([^/]+)\)?\$?\/i?/g;
    while ((m = rxRe.exec(src))) {
      for (const c of m[1].split('|')) {
        const v = c.replace(/\\/g, '').trim();
        if (/^[a-zA-Z0-9_]+$/.test(v)) commands.add(v);
      }
    }
    const idxRe = /\]\s*=\s*\[([^\]]+)\]/g;
    while ((m = idxRe.exec(src))) {
      for (const c of m[1].split(',')) {
        const v = c.trim().replace(/^['"`]|['"`]$/g, '');
        if (/^[a-zA-Z0-9_]+$/.test(v)) commands.add(v);
      }
    }
  }
  const aliased = new Set(Object.values(arabicAliases));
  const uncovered = [...commands].filter((c) => !aliased.has(c)).sort();
  assert.deepEqual(uncovered, [], `commands without an Arabic alias:\n${uncovered.join('\n')}`);
});

test('resolveArabicAlias leaves unknown and non-Arabic commands untouched', () => {
  assert.equal(resolveArabicAlias('menu'), 'menu');
  assert.equal(resolveArabicAlias(''), '');
  assert.equal(resolveArabicAlias(undefined), undefined);
  assert.equal(resolveArabicAlias('xyz-not-a-command'), 'xyz-not-a-command');
});

test('bot branding rights, channel and images are configured', () => {
  const settings = fs.readFileSync(path.join(root, 'src', 'settings.js'), 'utf8');
  assert.match(settings, /global\.owner\s*=\s*\[[\s\S]*?"201125166486"/, 'owner number missing');
  assert.match(settings, /global\.suittag\s*=\s*\["201125166486"\]/, 'suittag missing');
  assert.match(settings, /global\.botname\s*=\s*"𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪"/, 'botname missing');
  assert.match(settings, /global\.author\s*=\s*"𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪"/, 'author missing');
  assert.match(settings, /global\.idcanal\s*=\s*"120363410090342500@newsletter"/, 'channel id missing');
  assert.match(settings, /global\.channel\s*=\s*"https:\/\/whatsapp\.com\/channel\//, 'channel link missing');
  assert.match(settings, /global\.icono\s*=\s*"https?:\/\//, 'icon image missing');
  assert.match(settings, /global\.banner\s*=\s*"https?:\/\//, 'banner image missing');
  assert.match(settings, /global\.channelRD\s*=\s*\{[^}]*@newsletter/, 'channelRD missing');
});

test('default language is Arabic', () => {
  const i18n = fs.readFileSync(path.join(root, 'lib', 'i18n.js'), 'utf8');
  assert.match(i18n, /const DEFAULT_LANG\s*=\s*'ar'/, 'default language is not Arabic');
});

test('no hardcoded API keys or secrets remain in source', () => {
  const patterns = [
    /owner_[0-9a-f]{20,}/,            // APIOWO
    /nyx_[A-Za-z0-9_]{15,}/,          // NYX DL API
    /yosoyyo_sk_[A-Za-z0-9]+/,        // Yosoyyo
    /access_secret:\s*['"][^'"]+['"]/,
    /access_key:\s*['"][0-9a-f]{20,}['"]/,
    /api[_-]?key\s*[:=]\s*['"][0-9a-f]{28,}['"]/i
  ];
  const hits = [];
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const re of patterns) {
      const m = text.match(re);
      if (m) hits.push(`${path.relative(root, file)} :: ${m[0]}`);
    }
  }
  assert.deepEqual(hits, [], `hardcoded secrets found:\n${hits.join('\n')}`);
});

test('env example documents every secret key and .env is ignored', () => {
  const example = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
  for (const key of [
    'APIOWO_TOKEN', 'NYX_API_KEY', 'IMGBB_API_KEY',
    'ACRCLOUD_KEY', 'ACRCLOUD_SECRET', 'PEXELS_API_KEY',
    'PIXABAY_API_KEY', 'YOSOYO_API_KEY', 'YOSOYO_FB_KEY'
  ]) {
    assert.match(example, new RegExp(`^${key}=`, 'm'), `${key} missing from .env.example`);
  }
  const ignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
  assert.match(ignore, /^\.env$/m, '.env must be gitignored');
  assert.match(ignore, /^!\.env\.example$/m, '.env.example must be tracked');
});
