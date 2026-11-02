import axios from 'axios'
import {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent
} from '@whiskeysockets/baileys'

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!global.db.data) global.db.data = {}
  if (!global.db.data.users) global.db.data.users = {}
  
  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  if (!global.db.data.users[m.sender].esclavos) global.db.data.users[m.sender].esclavos = []

  if (command === 'esclavizar') {
    let who
    if (m.isGroup) {
      who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    } else {
      who = m.chat
    }

    if (!who) {
      return conn.reply(m.chat, `✐ ضع علامة على شخص ما أو قم بالرد على رسالته لاستعباده.`, m)
    }

    let amo = m.sender
    let misEsclavos = global.db.data.users[amo].esclavos

    if (misEsclavos.includes(who)) {
      return conn.reply(m.chat, `⚠︎ هذا المستخدم هو عبدك بالفعل! لا يمكنك استعباده مرة أخرى.`, m)
    }

    if (misEsclavos.length >= 3) {
      return conn.reply(m.chat, `☠︎ لديك الآن الحد الأقصى وهو 3 عبيد. أطلق سراح شخص ما أولاً باستخدام *${usedPrefix}release*!`, m)
    }

    if (m.react) await m.react('⛓️')

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: {
                text: `هاهاهاهاها هذا الرجل يسمح لنفسك بالاستعباد, يا له من أحمق, ولكن مهلا, هنا لديك 3 خيارات, اختر بحكمة u.u\n\n اختر وجهتك قبل فوات الأوان...`
              },
              footer: {
                text: 'لعبة الظل - نظام العبودية'
              },
              header: {
                hasMediaAttachment: false
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                      display_text: '🏃 تشغيل',
                      id: `${usedPrefix}esclavo_opcion correr|${who}|${amo}`
                    })
                  },
                  {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                      display_text: '💀 اقتل نفسك',
                      id: `${usedPrefix}esclavo_opcion matarse|${who}|${amo}`
                    })
                  },
                  {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                      display_text: '🧎 قبول الوجهة',
                      id: `${usedPrefix}esclavo_opcion aceptar|${who}|${amo}`
                    })
                  }
                ]
              }
            })
          }
        }
      },
      { quoted: m }
    )

    return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  }

  if (command === 'esclavo_opcion') {
    if (!text) return
    let [accion, esclavoJid, amoJid] = text.split('|')
    let nombreAmo = await conn.getName(amoJid)

    if (!global.db.data.users[amoJid]) global.db.data.users[amoJid] = {}
    if (!global.db.data.users[amoJid].esclavos) global.db.data.users[amoJid].esclavos = []

    if (accion === 'correr') {
      return conn.reply(m.chat, `@${esclavoJid.split('@')[0]} ركض بأسرع ما يمكن لتجنب الاستعباد (لكنه مات لأنه يعتقد أنه أحمق xd)`, m, { mentions: [esclavoJid] })
    }

    if (accion === 'matarse') {
      return conn.reply(m.chat, `لقد قتل حقا أن غي XD`, m)
    }

    if (accion === 'aceptar') {
      let actuales = global.db.data.users[amoJid].esclavos
      
      if (actuales.includes(esclavoJid)) {
        return conn.reply(m.chat, `لقد قبلت بالفعل مصيرك من قبل, أنت بالفعل عبده.`, m)
      }

      if (actuales.length >= 3) {
        return conn.reply(m.chat, `لقد وصل السيد بالفعل إلى الحد الأقصى وهو 3 عبيد بينما كنت تقرر ذلك.`, m)
      }

      global.db.data.users[amoJid].esclavos.push(esclavoJid)
      
      if (global.db.write) await global.db.write()

      return conn.reply(m.chat, `حسنًا @${esclavoJid.split('@')[0]} لقد بقيت عبدًا لـ ${nombreAmo} حسنًا الآن ستموت من الجوع xd`, m, { mentions: [esclavoJid, amoJid] })
    }
  }

  if (command === 'esclavos') {
    let amo = m.sender
    let misEsclavos = global.db.data.users[amo].esclavos

    if (!misEsclavos || misEsclavos.length === 0) {
      return conn.reply(m.chat, `⛓️ ليس لديك أحد مستعبد حاليا. اخرجوا وابحثوا عن الضحايا!`, m)
    }

    let texto = `⛓️ *عبيدك الحاليين (${misEsclavos.length}/3):*\n\n`
    for (let i = 0; i < misEsclavos.length; i++) {
      texto += `${i + 1}. @${misEsclavos[i].split('@')[0]}\n`
    }
    texto += `\n> يمكنك تحرير أي شخص باستخدام *${usedPrefix}release*`

    return conn.reply(m.chat, texto, m, { mentions: misEsclavos })
  }

  if (command === 'liberar') {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    if (!who) {
      return conn.reply(m.chat, `✐ ضع علامة أو قم بالرد على العبد الذي تريد تحريره.`, m)
    }

    let amo = m.sender
    let misEsclavos = global.db.data.users[amo].esclavos

    if (!misEsclavos || !misEsclavos.includes(who)) {
      return conn.reply(m.chat, `⚠︎ هذا الشخص ليس عبدك.`, m)
    }

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: {
                text: `هل تريد حقًا تحريره؟\n\nقم بتأكيد الإجراء باستخدام الأزرار أدناه:`
              },
              header: {
                hasMediaAttachment: false
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                      display_text: '✅ نعم',
                      id: `${usedPrefix}liberar_confirm si|${who}|${amo}`
                    })
                  },
                  {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                      display_text: '❌ لا',
                      id: `${usedPrefix}liberar_confirm no|${who}|${amo}`
                    })
                  }
                ]
              }
            })
          }
        }
      },
      { quoted: m }
    )

    return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  }

  if (command === 'liberar_confirm') {
    if (!text) return
    let [decision, esclavoJid, amoJid] = text.split('|')

    if (decision === 'si') {
      if (global.db.data.users[amoJid] && global.db.data.users[amoJid].esclavos) {
        global.db.data.users[amoJid].esclavos = global.db.data.users[amoJid].esclavos.filter(id => id !== esclavoJid)
        
        if (global.db.write) await global.db.write()
      }
      if (m.react) await m.react('🕊️')
      return conn.reply(m.chat, `حسنًا, لقد أطلقوا سراحك, أنت حر, اعتني بنفسك ودع القطار يصدمك, أقول إنني أحبك, اعتني بنفسك.`, m, { mentions: [esclavoJid] })
    }

    if (decision === 'no') {
      return conn.reply(m.chat, `تم إلغاء العملية. فهو يبقى تحت نيرك.`, m)
    }
  }
}

handler.help = ['esclavizar', 'liberar', 'esclavos']
handler.tags = ['fun']
handler.command = ['esclavizar', 'esclavo_opcion', 'liberar', 'liberar_confirm', 'esclavos']
handler.group = true

export default handler
