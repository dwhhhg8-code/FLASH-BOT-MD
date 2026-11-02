import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⌗ استخدم مثل هذا: *اسم ${usedPrefix + command}*`)

  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./Sessions/SubBot', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  if (!fs.existsSync(botPath)) {
    return m.reply('> ✎ هذا الأمر مخصص للمقابس فقط.')
  }

  let config = {}

  
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath))
    } catch (e) {
      return m.reply('> » خطأ في قراءة التكوين.')
    }
  }

  
  config.name = text.trim()

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    m.reply(`ꕤ︎ تم تغيير اسم المقبس إلى: *${text.trim()}*`)
  } catch (err) {
    console.error(err)
    m.reply('❌ حدث خطأ أثناء حفظ الاسم.')
  }
}

handler.help = ['setname']
handler.tags = ['socket']
handler.command = ['setname']

export default handler
