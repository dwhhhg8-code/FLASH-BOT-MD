import { promises as _0x10dde7 } from 'fs';
async function loadCharacters() {
  const _0x22d8a6 = await _0x10dde7.readFile("./lib/characters.json", 'utf-8');
  return JSON.parse(_0x22d8a6);
}
function flattenCharacters(_0x1fb57b) {
  return Object.values(_0x1fb57b).flatMap(_0x23aacb => Array.isArray(_0x23aacb.characters) ? _0x23aacb.characters : []);
}
function formatTime(_0x12c467) {
  if (_0x12c467 <= 0x0) {
    return "الآن";
  }
  const _0x237799 = Math.ceil(_0x12c467 / 0x3e8);
  const _0x432573 = Math.floor(_0x237799 / 0xe10);
  const _0x210630 = Math.floor(_0x237799 % 0xe10 / 0x3c);
  const _0x2c52f6 = _0x237799 % 0x3c;
  const _0x7a0a82 = [];
  if (_0x432573 > 0x0) {
    _0x7a0a82.push(_0x432573 + " ساعة");
  }
  if (_0x210630 > 0x0 || _0x432573 > 0x0) {
    _0x7a0a82.push(_0x210630 + " دقيقة");
  }
  _0x7a0a82.push(_0x2c52f6 + " ثانية");
  return _0x7a0a82.join(" ");
}
let handler = async (_0x3ec4ec, {
  conn: _0x1bb80e,
  usedPrefix: _0x164df6
}) => {
  if (!global.db.data.chats?.[_0x3ec4ec.chat]?.["gacha"] && _0x3ec4ec.isGroup) {
    return _0x3ec4ec.reply("ꕥ أوامر *Gacha* معطلة في هذه المجموعة.\n\nيمكن لـ *مسؤول* تنشيطها باستخدام الأمر:\n» *" + _0x164df6 + "gacha on*");
  }
  try {
    const _0xc64bc2 = global.db.data.users[_0x3ec4ec.sender];
    if (!Array.isArray(_0xc64bc2.characters)) {
      _0xc64bc2.characters = [];
    }
    const _0xe9d988 = Date.now();
    const _0x1c9a5a = _0xc64bc2.lastRoll && _0xe9d988 < _0xc64bc2.lastRoll ? _0xc64bc2.lastRoll - _0xe9d988 : 0x0;
    const _0x1ac013 = _0xc64bc2.lastClaim && _0xe9d988 < _0xc64bc2.lastClaim ? _0xc64bc2.lastClaim - _0xe9d988 : 0x0;
    const _0x24ec1c = _0xc64bc2.lastVote && _0xe9d988 < _0xc64bc2.lastVote ? _0xc64bc2.lastVote - _0xe9d988 : 0x0;
    const _0x1ad7c0 = await loadCharacters();
    const _0x55a35d = flattenCharacters(_0x1ad7c0);
    const _0x14c041 = _0x55a35d.length;
    const _0x5e71a0 = Object.keys(_0x1ad7c0).length;
    const _0x2f7ba7 = Object.entries(global.db.data.characters || {}).filter(([, _0x6184ed]) => _0x6184ed.user === _0x3ec4ec.sender).map(([_0x10d7b4]) => _0x10d7b4);
    const _0x79e810 = _0x2f7ba7.reduce((_0x1e5a9b, _0x25debe) => {
      const _0x3dca66 = global.db.data.characters?.[_0x25debe]?.["value"];
      const _0x2958b5 = _0x55a35d.find(_0x44eade => _0x44eade.id === _0x25debe)?.["value"] || 0x0;
      const _0x5677c1 = typeof _0x3dca66 === "number" ? _0x3dca66 : _0x2958b5;
      return _0x1e5a9b + _0x5677c1;
    }, 0x0);
    let _0x243685 = await (async () => _0xc64bc2.name || (async () => {
      try {
        const _0x4e3f42 = await _0x1bb80e.getName(_0x3ec4ec.sender);
        return typeof _0x4e3f42 === "string" && _0x4e3f42.trim() ? _0x4e3f42 : _0x3ec4ec.sender.split('@')[0x0];
      } catch {
        return _0x3ec4ec.sender.split('@')[0x0];
      }
    })())();
    const _0x39e473 = "*✎ المستخدم `<" + _0x243685 + ">`*\n\nⴵ RollWaifu » *" + formatTime(_0x1c9a5a) + "*\nⴵ مطالبة » *" + formatTime(_0x1ac013) + "*\nⴵ التصويت » *" + formatTime(_0x24ec1c) + "*\n\n♡ الشخصيات التي تمت المطالبة بها » *" + _0x2f7ba7.length + "*\n✰ القيمة الإجمالية » *" + _0x79e810.toLocaleString() + "*\n❏ إجمالي الشخصيات » *" + _0x14c041 + "*\n❏ إجمالي السلاسل » *" + _0x5e71a0 + '*';
    await _0x3ec4ec.reply(_0x39e473.trim());
  } catch (_0x3f1201) {
    await _0x1bb80e.reply(_0x3ec4ec.chat, "⚠︎ حدثت مشكلة.\n> استخدم *" + _0x164df6 + "report* للإبلاغ عنه.\n\n" + _0x3f1201.message, _0x3ec4ec);
  }
};
handler.help = ["ginfo"];
handler.tags = ["gacha"];
handler.command = ["gachainfo", 'ginfo', "infogacha"];
handler.group = true;
export default handler;
