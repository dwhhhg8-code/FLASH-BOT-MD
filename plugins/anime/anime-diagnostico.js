import { diagnosticar, reaccionesDisponibles } from '../../lib/anime-media.js'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const opcion = (args[0] || '').toLowerCase()
  let acciones = ['kill', 'sip', 'cuddle', 'bite', 'peek', 'lappillow', 'stare', 'pat', 'yawn']

  if (opcion === 'todo' || opcion === 'all') acciones = reaccionesDisponibles
  else if (opcion && reaccionesDisponibles.includes(opcion)) acciones = [opcion]
  else if (opcion) {
    return m.reply(`❌ لا أعرف الإجراء *${opcion}*.\n\n• الاستخدام: *${usedPrefix}${command}* (إجراءات الأمر)\n• *${usedPrefix}${command} all* (الكل)\n• الإجراءات: ${reaccionesDisponibles.join(', ')}`)
  }

  await m.react('🔎')
  await m.reply(`🔎 *اختبار واجهات برمجة التطبيقات من هذا الخادم...*\n(قد يستغرق هذا بضع ثوانٍ: الإجراء (الإجراءات) ${acciones.length}))`)

  try {
    const { texto, fallos, acciones: total } = await diagnosticar(acciones)
    const estado = fallos === 0
      ? '✅ *كل شيء يعمل:* سترسل الأوامر صور GIF.'
      : fallos >= total
        ? '❌ *لا توجد استجابة API من هذا الخادم:* تحقق من مخرجات الشبكة/جدار الحماية.'
        : `⚠️ *${fallos} من ${total} مع وجود مشاكل:* يرسل الآخرون صور GIF.`
    await m.reply(`${texto}\n\n${estado}`)
    await m.react(fallos === 0 ? '✅' : '⚠️')
  } catch (e) {
    await m.react('❌')
    await m.reply(`❌ خطأ تشخيصي: ${e.message}`)
  }
}

handler.help = ['animediag [acción|todo]']
handler.tags = ['anime']
handler.command = ['animediag', 'testanime', 'diaganime']
handler.rowner = true

export default handler
