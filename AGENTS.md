# AGENTS.md — 𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪 (fork of the original SHADOW-BOT-MD project)

WhatsApp bot (Baileys / Node ESM). Fork owned by **haitham** (`dwhhhg8-code`).
Repo: https://github.com/dwhhhg8-code/FLASH-BOT-MD — all branding is FLASH BOT, all owner
references point to `201125166486`.

## Commands
- Start: `npm start` → `node --env-file-if-exists=.env src/index.js`
- Tests: `npm test` (node:test). Currently **52/52 pass**, deterministic (~14s).
  Runs with `--test-concurrency=1`. The tiktok-search and nsfw-media tests spin up a
  local HTTP server and point `APIOWO_BASE` / `XBOORU_BASE`+`PURRBOT_BASE` at it, so they
  no longer depend on live APIs (a module-level env read means the server must start before
  the plugin import).
- Arabic aliases: `lib/arabic-aliases.js` maps every command to an Egyptian-Arabic
  phrase (full coverage — `arabicCoreAliases` + `arabicExtraAliases`, ~990 phrases).
  `tests/arabic-fixes.test.js` asserts both directions: every alias target exists in a
  plugin, and every plugin command has at least one Arabic alias (scanner also handles
  chained `handler.command = handler.help = [...]` and obfuscated `]=[...]` assignments).
  Add aliases only for commands that exist; keys must have no spaces (commands are split
  on whitespace).
- Boot smoke: `printf "201125166486\n" | node src/index.js` → should load **270 plugins**, 0 load errors.

## External APIs
- `lib/secrets.js` reads keys from `.env`. Pinterest/TikTok search work **only** with
  `APIOWO_TOKEN`/`NYX_API_KEY` set; without them they degrade gracefully (no crash).
- TikTok search needs upstream cookies (`TIKTOK_COOKIES_REQUIRED`) — cannot be fixed client-side.
- Facebook download (`dls-facebook.js`) tries Yosoyyo first, then falls back to a keyless
  provider; keep the fallback chain.
- `herras-brat.js` generates the sticker **locally** (SVG → sharp → webp) — no external API,
  no ffmpeg dependency.
- NSFW images go through `lib/nsfw-media.js` (provider chain: xbooru → purrbot → nekos.life).
  Dead hosts removed 2026-10-30: `api.waifu.pics`, `deliriodevs.com`, `api.vreden.web.id`
  (all NXDOMAIN). `nsfw-tetas.js` and `nsfw-hentaiseach.js` now use the helper.
- Spotify (`dls-spotify.js`): primary dlapixy (verified working) → fallback NYX metadata +
  YouTube search/download. The old vreden/deliriodevs fallbacks were dead and were removed.
- `herras-tourl.js`: 0x0.st returns a **plain-text** URL, not JSON — parse with `res.text()`.

## Conventions
- **Language**: all user-facing text is Arabic; commands use an **Egyptian-Arabic alias map**
  (`lib/arabic-aliases.js`), never literal translations. Original commands still work.
- **Library**: Baileys comes from the owner's own fork — `@whiskeysockets/baileys` is
  `github:dwhhhg8-code/---` (package name `flash-baileys`). `ourin` is the same repo.
  `tools/fix-baileys.cjs` only shims when `node_modules` is missing.
- **Secrets**: never hardcode API keys. Use `lib/secrets.js` + `.env` (gitignored);
  `.env.example` documents keys. `tests/regressions.test.js` fails on any hardcoded
  Google/GitHub/Slack/OpenAI-style key in `plugins/`, `lib/`, `src/`. Keys now in
  `lib/secrets.js`: `TENOR_API_KEY` (emojimix), `RULE34_USER_ID`/`RULE34_API_KEY` (rule34).
  Never embed a token in the git remote URL — it leaks via `.git/config`.

## Behavior rules (requested by owner)
- Bot works in **groups**; private/DM only works with the developer. Other DMs are blocked
  (`src/handler.js`, right after `isROwner` is computed).
- Reactions (`m.react`) fire for the **developer only** — gated in `lib/simple.js` (the active
  serializer used by `smsg`) and `src/lib/ourin-serialize.js`.
- Sub-bot **installation is group-only**, uses the word **تنصيب** (not كود), and works via
  **pairing code only** — QR login is disabled everywhere (`src/index.js`, `subs-conexion.js`).

## Gotchas
- `src/lib/ourin-serialize.js` is NOT the active serializer; `lib/simple.js` is. Patch both.
- Never introduce non-ASCII file paths in code (an Arabized JID/path previously broke things).
- Do not remove the watermark header in `lib/a2ui.js` or `src/lib/ourin-builder.js` — these
  are third-party libraries (FgsiDev / Nixel) with mandatory attribution, not owner traces.
- Old-owner branding is gone: default bot-name fallbacks are `"FLASH BOT"`, and internal
  identifiers use `flashJadiBot`/`subBotOptions`/`subBotPath`/`flashSubBotAuto`/`flashpg`.
- **Localization must never touch code**: keep identifiers, event names, API fields/URLs, vCard
  tags, ffmpeg/ImageMagick filters, SVG/CSS/HTML attributes, `data:` URIs, log levels
  (`INFO`/`ERROR`/…), file names/extensions, hex colors and date-format tokens (`HH:mm:ss`,
  `DD-MM-YYYY`) in ASCII. A mass find/replace translated these and silently broke runtime —
  audit with the AST scanner below, not with regex on raw source.
- Audit script: parse each file with `acorn` and report Arabic in `Literal`/`TemplateElement`/
  `Identifier` nodes; anything with no whitespace or matching a technical pattern is a bug.
- Use a **local** channel-ID fallback everywhere (`global.idcanal`/`channelRD`), never a
  hardcoded foreign newsletter JID.

## الأمان والسرية

- **ممنوع** كتابة أي مفتاح API في الكود. كل المفاتيح تُقرأ من متغيرات البيئة عبر `lib/secrets.js` (شوف `.env.example`).
- فحص التاريخ: `gitleaks detect --source . --config .gitleaks.toml`.
- الـpre-commit hook يمنع تسريب المفاتيح والملفات الحساسة: `bash tools/install-hooks.sh`.
- التاريخ أُعيد بناؤه ليكون نظيفًا تمامًا (بلا أسرار ولا آثار مالك سابق).

## المستودعات

- البوت: https://github.com/dwhhhg8-code/FLASH-BOT-MD
- المكتبة المصاحبة: https://github.com/dwhhhg8-code/--- (flash-baileys)
