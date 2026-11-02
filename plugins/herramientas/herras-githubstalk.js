import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
  const user = args[0]

  if (!user) {
    return m.reply('🍎 أدخل اسم مستخدم *GitHub* الذي تريد تحليله.')
  }

  try {
    const apiUrl = `https://api-killua.vercel.app/api/tools/githubstalk?user=${encodeURIComponent(user)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.success || !json.data) {
      return m.reply(`🥥 لم يتم العثور على معلومات للمستخدم: *${user}*`)
    }

    await m.reply('🌫️استشارة في الظل...')

    const d = json.data

    const caption =
`🌑 𖤐 حديقة الظل — GITHUB STALKER 𖤐

🍧 المستخدم › ${d.username}
🌴 الاسم › ${d.nickname || 'لم يذكر اسمه'}
🍓 Bio › ${d.bio || 'لا سيرة ذاتية'}
🍒 Repos Públicos › ${d.public_repo}
🍎 Seguidores › ${d.followers}
🍦 Siguiendo › ${d.following}
🍍 Ubicación › ${d.location || 'غير متوفر'}
🥥 Blog › ${d.blog || 'غير متوفر'}
🌳 اتُعمل › ${new Date(d.created_at).toLocaleDateString()}

🔗 Perfil › ${d.url}`.trim()

    await conn.sendMessage(
      m.chat,
      {
        document: Buffer.alloc(1),
        fileName: 'فلاش بوت',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileLength: '0',
        pageCount: '1',

        caption,
        image: { url: d.profile_pic },

        contextInfo: {
          mentionedJid: [m.sender],

          forwardingScore: 0,
          isForwarded: true,

          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363410090342500@newsletter',
            serverMessageId: null,
            newsletterName: 'فلاش بوت'
          }
        }
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    await m.reply('🕷️ لم يتمكن الظلال من الحصول على المعلومات من GitHub.')
  }
}

handler.help = ['githubstalk', 'ghstalk', 'github']
handler.tags = ['tools']
handler.command = ['githubstalk', 'ghstalk', 'github']
handler.group = false
handler.premium = false

export default handler
