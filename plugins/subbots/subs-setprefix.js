import fs from 'fs'
import path from 'path'

let handler = async (m, { text }) => {
  const emojip = '> ✿'
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./Sessions/SubBot', senderNumber)
  const configPath = path.join(botPath, 'config.json')

  
  if (!fs.existsSync(botPath)) {
    return m.reply(`${emojip} ✧ هذا الأمر مخصص لـ *المآخذ* فقط.`)
  }

  if (!text) 
    return m.reply(`${emojip} Proporciona un prefijo o lista de prefijos.\n
> Ejemplo: #setprefix 🦖
> O poner #setprefix multi`)

  
  let config = {}
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath))
    } catch (e) {
      return m.reply('⚠️ خطأ في قراءة التكوين.')
    }
  }

  
  config.prefix = text.trim().toLowerCase()

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    if (config.prefix === 'multi') {
      m.reply(`${emojip} البادئات اتفعّلت في وضع *MULTI-PREFIX*:  
> # $ @ * & ? , ; : + × ! _ - ¿ .`)
    } else {
      m.reply(`بادئة المقبس ${emojip} هي الآن: *${config.prefix}*`)
    }
  } catch (err) {
    console.error(err)
    m.reply('🤍 خطأ في حفظ البادئة في التكوين.')
  }
}

handler.help = ['setprefix']
handler.tags = ['socket']
handler.command = ['setprefix']

export default handler
