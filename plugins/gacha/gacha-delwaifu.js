import { promises as _0x45484d } from 'fs';
async function loadCharacters() {
  const _0x444ec8 = await _0x45484d.readFile('./lib/characters.json', 'utf-8');
  return JSON.parse(_0x444ec8);
}
function flattenCharacters(_0x13a5ff) {
  return Object.values(_0x13a5ff).flatMap(_0x3f6f42 => Array.isArray(_0x3f6f42.characters) ? _0x3f6f42.characters : []);
}
const verifi = async () => {
  try {
    const _0x2a1db9 = await _0x45484d.readFile("./package.json", "utf-8");
    const _0x5d3983 = JSON.parse(_0x2a1db9);
    return _0x5d3983.repository?.['url'] === "git+https://github.com/dwhhhg8-code/FLASH-BOT-MD.git";
  } catch {
    return false;
  }
};
let handler = async (_0x59d87e, {
  conn: _0x2d46dd,
  args: _0x5aae4e,
  usedPrefix: _0x44c0f4,
  command: _0xc35702
}) => {
  if (!(await verifi())) {
    return _0x2d46dd.reply(_0x59d87e.chat, "❀ الأمر *<" + _0xc35702 + ">* متاح فقط للمطوّر.", _0x59d87e);
  }
  if (!global.db.data.chats?.[_0x59d87e.chat]?.["gacha"] && _0x59d87e.isGroup) {
    return _0x59d87e.reply("ꕥ أوامر *Gacha* معطلة في هذه المجموعة.\n\nيمكن لـ *مسؤول* تنشيطها باستخدام الأمر:\n» *" + _0x44c0f4 + "gacha on*");
  }
  try {
    const _0x1b3fcd = global.db.data.users[_0x59d87e.sender];
    if (!Array.isArray(_0x1b3fcd.characters)) {
      _0x1b3fcd.characters = [];
    }
    if (!_0x5aae4e.length) {
      return _0x59d87e.reply("❀ يجب عليك تحديد شخصية لحذفها.\n> مثال » *" + (_0x44c0f4 + _0xc35702) + "Misa amane*");
    }
    const _0x25c988 = _0x5aae4e.join(" ").toLowerCase().trim();
    const _0x209c9e = await loadCharacters();
    const _0x42ca7b = flattenCharacters(_0x209c9e);
    const _0x4e10d8 = _0x42ca7b.find(_0x4afb67 => _0x4afb67.name.toLowerCase() === _0x25c988);
    if (!_0x4e10d8) {
      return _0x59d87e.reply("ꕥ لم يتم العثور على أي شخصية بالاسم *" + _0x25c988 + "*\n> يمكنك اقتراحه باستخدام *" + _0x44c0f4 + "suggest personaje " + _0x25c988 + '*');
    }
    if (!global.db.data.characters?.[_0x4e10d8.id]) {
      return _0x59d87e.reply("ꕥ *" + _0x4e10d8.name + "* لم تتم المطالبة بها من قبلك.");
    }
    const _0xcc6c71 = global.db.data.characters[_0x4e10d8.id];
    if (_0xcc6c71.user !== _0x59d87e.sender || !_0x1b3fcd.characters.includes(_0x4e10d8.id)) {
      return _0x59d87e.reply("ꕥ *" + _0x4e10d8.name + "* لم تتم المطالبة بها من قبلك.");
    }
    delete global.db.data.characters[_0x4e10d8.id];
    _0x1b3fcd.characters = _0x1b3fcd.characters.filter(_0x58d298 => _0x58d298 !== _0x4e10d8.id);
    if (_0x1b3fcd.sales?.[_0x4e10d8.id]?.['user'] === _0x59d87e.sender) {
      delete _0x1b3fcd.sales[_0x4e10d8.id];
    }
    if (_0x1b3fcd.favorite === _0x4e10d8.id) {
      delete _0x1b3fcd.favorite;
    }
    await _0x59d87e.reply("❀ *" + _0x4e10d8.name + "* تمت إزالته من قائمتك المطالب بها.");
  } catch (_0x4c9813) {
    await _0x2d46dd.reply(_0x59d87e.chat, "⚠︎ حدثت مشكلة.\n> استخدم *" + _0x44c0f4 + "report* للإبلاغ عنه.\n\n" + _0x4c9813.message, _0x59d87e);
  }
};
handler.help = ["delchar"];
handler.tags = ["gacha"];
handler.command = ["delchar", 'deletewaifu', 'delwaifu'];
handler.group = true;
export default handler;
