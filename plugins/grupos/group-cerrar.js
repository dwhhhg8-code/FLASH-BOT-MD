import { delay } from "@whiskeysockets/baileys"

let handler = async (m, { conn, text, args, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) {
    await conn.sendMessage(m.chat, { text: '⚔️ *لا يمكن أداء هذه الطقوس إلا ضمن نطاق جماعي.*' })
    return
  }

  if (!isAdmin) {
    await conn.sendMessage(m.chat, { text: '🌑 *ليس لديك صلاحية إغلاق البوابة. فقط المختارون يمكنهم القيام بذلك.*' })
    return
  }

  if (!isBotAdmin) {
    await conn.sendMessage(m.chat, { text: '🕶️ *حتى بدون رتبة إداري, لا أستطيع التلاعب بأبواب المملكة.*' })
    return
  }

  if (!args[0]) {
    await conn.sendMessage(m.chat, { text: '⏳ *استدعاء الختم بشكل صحيح:* !cerrar 10 ثوانٍ | !cerrar 5 دقائق | !cerrar 1 ساعة' })
    return
  }

  let tiempoTexto = text.toLowerCase()
  let tiempoMs

  if (tiempoTexto.includes("segundo")) {
    let segundos = parseInt(args[0])
    if (isNaN(segundos) || segundos <= 0) {
      await conn.sendMessage(m.chat, { text: '🕰️ *الهاوية تتطلب عددًا صالحًا من الثواني.*' })
      return
    }
    tiempoMs = segundos * 1000

  } else if (tiempoTexto.includes("minuto")) {
    let minutos = parseInt(args[0])
    if (isNaN(minutos) || minutos <= 0) {
      await conn.sendMessage(m.chat, { text: '🕰️ *الهاوية تحتاج لعدد صحيح من الدقائق.*' })
      return
    }
    tiempoMs = minutos * 60 * 1000

  } else if (tiempoTexto.includes("hora")) {
    let horas = parseInt(args[0])
    if (isNaN(horas) || horas <= 0) {
      await conn.sendMessage(m.chat, { text: '🕰️ *الهاوية تحتاج لعدد صالح من الساعات.*' })
      return
    }
    tiempoMs = horas * 60 * 60 * 1000

  } else {
    await conn.sendMessage(m.chat, { text: '❄️ *يجب تحديد الثواني أو الدقائق أو الساعات. الظلام لا يتسامح مع عدم الدقة.*' })
    return
  }

  await conn.groupSettingUpdate(m.chat, 'announcement')
  await conn.sendMessage(m.chat, {
    text: `🔒 *تم إغلاق البوابة بواسطة ${args[0]} ${tiempoTexto.includes("segundo") ? "segundo(s)" : tiempoTexto.includes("minuto") ? "minuto(s)" : "hora(s)"}.*\n\n🌑 *الظل يراقب... الصمت يسيطر على المجال.*`
  })

  await delay(tiempoMs)

  await conn.groupSettingUpdate(m.chat, 'not_announcement')
  await conn.sendMessage(m.chat, { text: '✨ *تبدد الختم. يُفتح المجال مرة أخرى تحت أنظار الظل.*' })
}

handler.help = ['cerrar <número> segundos/minutos/horas']
handler.tags = ['grupos']
handler.command = ['cerrar']
handler.group = true
handler.admin = true

export default handler
