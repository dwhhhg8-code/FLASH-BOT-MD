import { makeWASocket } from '@whiskeysockets/baileys'

const handler = async (m, { conn, args, text, command, usedPrefix }) => {
  try {
    switch (command) {
      case 'gpbanner': case 'groupimg': {
        const q = m.quoted || m
        const mime = (q.msg || q).mimetype || ''
        if (!/image\/(png|jpe?g)/.test(mime)) 
          return m.reply('🌌 *تلميذ الظلال* 🎄\nكنت تفتقد الصورة لاستدعاء البانر الجديد للمجموعة.')
        
        const img = await q.download()
        if (!img) 
          return m.reply('🌌 *تلميذ الظلال* 🎄\nلم تصلني الصورة الخاصة بشعار المجموعة.')
        
        await m.react('🎭')
        await conn.updateProfilePicture(m.chat, img)
        await m.react('✔️')
        m.reply('🌌 *اكتمل الاستدعاء* 🎅\nتم تجديد شعار المجموعة في الظلال.')
        break
      }

      case 'gpdesc': case 'groupdesc': {
        if (!args.length) 
          return m.reply('🌌 *تلميذ الظل* 🎄\nيجب عليك تسليم الوصف الجديد للمجموعة.')
        
        await m.react('🎭')
        await conn.groupUpdateDescription(m.chat, args.join(' '))
        await m.react('✔️')
        m.reply('🌌 *اكتمل الاستدعاء* 🎅\nتم تجديد وصف المجموعة في الظلال.')
        break
      }

      case 'gpname': case 'groupname': {
        if (!text) 
          return m.reply('🌌 *𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏* 🎄\nيجب عليك إرسال الاسم الجديد للمجموعة.')
        
        await m.react('🎭')
        await conn.groupUpdateSubject(m.chat, text)
        await m.react('✔️')
        m.reply('🌌 *اكتمل الاستدعاء* 🎅\nتم تجديد اسم المجموعة في الظلال.')
        break
      }
    }
  } catch (e) {
    await m.react('✖️')
    m.reply(`⚠️ فشلت الطقوس...\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n${e.message}`)
  }
}

handler.help = ['gpbanner', 'groupimg', 'gpdesc', 'groupdesc', 'gpname', 'groupname']
handler.tags = ['grupos']
handler.command = ['gpbanner', 'groupimg', 'gpdesc', 'groupdesc', 'gpname', 'groupname']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
