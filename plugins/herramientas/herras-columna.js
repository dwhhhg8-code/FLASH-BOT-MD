let handler = async (m, { conn }) => {
  let header = '┏━━「 *الجدول* 」━━┓\n'
  let body = '┃ المالك 1 : يوسو\n┃ المالك 2 : اللغط\n'
  let footer = '┗━━━━━━━━━━━━┛\n> القناة: https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O'
  await conn.reply(m.chat, header + body + footer, m)
}

handler.command = ['tabla']

export default handler
