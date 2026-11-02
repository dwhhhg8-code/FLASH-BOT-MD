import { execSync } from 'child_process'

var handler = async (m, { conn, text, usedPrefix, command, isMods }) => {
  if (!isMods) return
  await m.react('🕒')

  const isForce = text && (text.includes('-f') || text.includes('force') || text.includes('reset'))

  try {
    if (isForce) {
      try {
        execSync('إعادة تعيين بوابة - الرأس الثابت')
      } catch (e) {
        console.warn('[تحذير إعادة تعيين قوة الإصلاح]:', e.message)
      }
    }

    const stdout = execSync('بوابة سحب' + (m.fromMe && text && !isForce ? ' ' + text : ''))
    let messager = stdout.toString()
    if (messager.includes('بالفعل حتى الآن.') || messager.includes('❀ تم الآن تحميل التحديث.'))
      messager = '❀ تم تحديث البيانات بالفعل إلى أحدث إصدار.'
    else if (messager.includes('Updating') || messager.includes('ꕥ Actualizando.'))
      messager = '❀ تمت المعالجة, التحديث بنجاح.\n\n' + stdout.toString()
    
    await m.react('✔️')
    await conn.sendMessage(
      m.chat,
      {
        text: messager
      },
      { quoted: m }
    )
  } catch {
    try {
      const status = execSync('حالة git --porcelain')
      if (status.length > 0) {
        const conflictedFiles = status
          .toString()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            if (
              line.includes('.npm/') ||
              line.includes('.cache/') ||
              line.includes('tmp/') ||
              line.includes('database.json') ||
              line.includes('Sessions/Principal/') ||
              line.includes('npm-debug.log')
            ) {
              return null
            }
            return '*→ ' + line.slice(3) + '*'
          })
          .filter(Boolean)

        if (conflictedFiles.length > 0) {
          const errorMessage = `\`⚠︎ تعذر إجراء التحديث:\`\n\n` +
            `> *تم العثور على تغييرات محلية في ملفات الروبوت التي تتعارض مع تحديثات المستودع الجديدة.*\n\n` +
            `${conflictedFiles.join('\n')}\n\n` +
            `💡 *للفرض والكتابة باستخدام إصدار GitHub, استخدم:*\n` +
            `> *قوة ${usedPrefix + command}*`
          
          await conn.sendMessage(
            m.chat,
            {
              text: errorMessage
            },
            { quoted: m }
          )
          await m.react('✖️')
        }
      }
    } catch (error) {
      console.error(error)
      let errorMessage2 = '⚠︎ حدث خطأ غير متوقع.'
      if (error.message) {
        errorMessage2 += '\n⚠︎ رسالة الخطأ:' + error.message
      }
      
      await conn.sendMessage(
        m.chat,
        {
          text: errorMessage2
        },
        { quoted: m }
      )
    }
  }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'fix', 'actualizar']

export default handler
