import config from '../../config.js'
function te(prefix, command, pushName) {
    const tpl = config.errorTemplate || `☢ *ᴇʀʀᴏʀ*\n\n> حدث خطأ في الأمر \`{prefix}{command}\`\n> يرجى المحاولة مرة أخرى لاحقًا, {pushName}\n\n_إذا استمرت المشكلة, اتصل بالمالك_`
    return tpl
        .replace(/\{prefix\}/g, prefix || '.')
        .replace(/\{command\}/g, command || '?')
        .replace(/\{pushName\}/g, pushName || 'User')
}

export default te