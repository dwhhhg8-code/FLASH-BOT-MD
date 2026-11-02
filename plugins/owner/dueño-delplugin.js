
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

const RAIZ = path.join(process.cwd(), 'plugins');

function buscarPlugins(nombreArchivo, dir = RAIZ, base = '', out = []) {
    let entradas = [];
    try { entradas = fsSync.readdirSync(dir, { withFileTypes: true }) } catch { return out }
    for (const e of entradas) {
        if (e.name.startsWith('.')) continue;
        const rel = base ? `${base}/${e.name}` : e.name;
        if (e.isDirectory()) buscarPlugins(nombreArchivo, path.join(dir, e.name), rel, out);
        else if (e.name === nombreArchivo) out.push(rel);
    }
    return out;
}

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`ⓘ يرجى إدخال اسم المكون الإضافي المراد إزالته.\n\n▸ أمثلة:\n• *${usedPrefix}${command} fun-top* (يبحث عنه في كافة المجلدات)\n• *${usedPrefix}${command} fun/fun-top* (المسار الكامل)`);
    }

    const limpio = text.trim().replace(/\\/g, '/').replace(/^plugins\//i, '').replace(/^\.\//, '');
    if (!limpio || limpio.includes('..') || path.isAbsolute(limpio)) {
        return m.reply('❌ الطريق غير صالح. يُسمح فقط بالأسماء أو المسارات داخل plugins/.');
    }

    const nombrePlugin = limpio.endsWith('.js') ? limpio : `${limpio}.js`;
    let relativo = limpio.includes('/') ? nombrePlugin : null;

    if (!relativo) {
        const encontrados = buscarPlugins(nombrePlugin);
        if (encontrados.length === 0) {
            return m.reply(`❌ خطأ: الإضافة "${nombrePlugin}" غير موجودة في الإضافات/ أو مجلداتها.`);
        }
        if (encontrados.length > 1) {
            return m.reply(`⚠ هناك عدة ملحقات بهذا الاسم:
${encontrados.map(r => `▸ ${r}`).join('\n')}\n\nأشير إلى السجادة, على سبيل المثال: *${usedPrefix}${command} ${encontrados[0]}*`);
        }
        relativo = encontrados[0];
    }

    const ruta = path.join(RAIZ, relativo);
    if (!ruta.startsWith(RAIZ)) return m.reply('❌ الطريق غير صالح.');

    try {
        await fs.access(ruta, fsSync.constants.F_OK);
        await fs.unlink(ruta);
        m.reply(`🗑️ تمت إزالة المكون الإضافي بنجاح: plugins/${relativo}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return m.reply(`❌ خطأ: الإضافة "${nombrePlugin}" غير موجودة في المسار: plugins/${relativo}`);
        }
        m.reply(`🚨 حدث خطأ أثناء حذف الإضافة: ${error.message}`);
    }
};

handler.help = ['delplugin', 'removeplugin'];
handler.tags = ['owner'];
handler.command = ['delplugin', 'removeplugin'];
handler.owner = true;

export default handler;
