import { promises as _0x5c4612 } from 'fs';
const verifi = async () => {
  try {
    const _0x317f85 = await _0x5c4612.readFile('./package.json', "utf-8");
    const _0x44d5c7 = JSON.parse(_0x317f85);
    return _0x44d5c7.repository?.["url"] === "git+https://github.com/dwhhhg8-code/FLASH-BOT-MD.git";
  } catch {
    return false;
  }
};
let handler = async (_0x20f606, {
  args: _0x137e53,
  usedPrefix: _0x366b91,
  command: _0x514a77
}) => {
  if (!(await verifi())) {
    return conn.reply(_0x20f606.chat, "❀ الأمر *<" + _0x514a77 + ">* متاح فقط للمطوّر", _0x20f606);
  }
  try {
    if (!global.db.data.chats) {
      global.db.data.chats = {};
    }
    if (!global.db.data.chats[_0x20f606.chat]) {
      global.db.data.chats[_0x20f606.chat] = {};
    }
    const _0x48d18f = global.db.data.chats[_0x20f606.chat];
    if (!_0x48d18f.gacha && _0x20f606.isGroup) {
      return _0x20f606.reply("ꕥ أوامر *Gacha* معطلة في هذه المجموعة.\n\nيمكن لـ *مسؤول* تنشيطها باستخدام الأمر:\n» *" + _0x366b91 + "gacha on*");
    }
    if (!global.db.data.users) {
      global.db.data.users = {};
    }
    if (!global.db.data.users[_0x20f606.sender]) {
      global.db.data.users[_0x20f606.sender] = {};
    }
    switch (_0x514a77) {
      case "setclaim":
      case "setclaimmsg":
        if (!_0x137e53[0x0]) {
          return _0x20f606.reply("❀ يجب عليك تحديد رسالة للمطالبة بالشخصية.\n> أمثلة:\n>" + (_0x366b91 + _0x514a77) + " €user ha reclamado el personaje €character!\n> " + (_0x366b91 + _0x514a77) + " €character ha sido reclamado por €user");
        }
        const _0x4b30de = _0x137e53.join(" ");
        if (!_0x4b30de.includes("€user") || !_0x4b30de.includes("€character")) {
          return _0x20f606.reply("ꕥ يجب أن تتضمن رسالتك *€user* و*€character* حتى تعمل بشكل صحيح.");
        }
        global.db.data.users[_0x20f606.sender].claimMessage = _0x4b30de;
        _0x20f606.reply("❀ رسالة الشكوى المعدلة.");
        break;
      case "delclaimmsg":
      case "resetclaimmsg":
        delete global.db.data.users[_0x20f606.sender].claimMessage;
        _0x20f606.reply("❀ استعادة رسالة المطالبة.");
        break;
    }
  } catch (_0x4eabe4) {
    await conn.reply(_0x20f606.chat, "⚠︎ حدثت مشكلة.\n> استخدم *" + _0x366b91 + "report* للإبلاغ عنه.\n\n" + _0x4eabe4.message, _0x20f606);
  }
};
handler.help = ["setclaim", "delclaimmsg"];
handler.tags = ["gacha"];
handler.command = ["setclaimmsg", "setclaim", 'delclaimmsg', "resetclaimmsg"];
handler.group = true;
export default handler;
