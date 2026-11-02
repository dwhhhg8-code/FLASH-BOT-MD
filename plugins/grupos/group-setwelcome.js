const handler = async (m, { conn, text, command, usedPrefix, isAdmin, isOwner, chat: handlerChat }) => {
  try {
    if (!m.isGroup) {
      return await m.reply(`❌ *يعمل هذا الأمر فقط في المجموعات.*\n\nاستخدم هذا الأمر داخل المجموعة التي تريد تخصيص الرسالة فيها.`)
    }

    const isGroupAdmin = isAdmin || isOwner
    if (!isGroupAdmin) {
      return await m.reply(`❌ *المسؤولون فقط* هم من يمكنهم تكوين الترحيب/الوداع.\n\n> نصيحة: اطلب من المسؤول تشغيل: *${usedPrefix}${command} <text>*`)
    }

    if (!global.db) {
      return await m.reply(`❌ خطأ داخلي: لم تتم تهيئة قاعدة البيانات. حاول مرة أخرى خلال بضع ثوان.`)
    }
    if (global.db.data == null) {
      try { await global.loadDatabase() } catch {}
    }
    if (!global.db.data) global.db.data = {}
    if (!global.db.data.chats || typeof global.db.data.chats !== 'object') {
      global.db.data.chats = {}
    }

    const groupId = m.chat
    let chat = handlerChat && typeof handlerChat === 'object' ? handlerChat : global.db.data.chats[groupId]

    if (!chat || typeof chat !== 'object') {
      chat = {}
    }

    if (!global.db.data.chats[groupId] || typeof global.db.data.chats[groupId] !== 'object') {
      global.db.data.chats[groupId] = chat
    } else {
      if (global.db.data.chats[groupId] !== chat) {
        Object.assign(global.db.data.chats[groupId], chat)
        chat = global.db.data.chats[groupId]
      }
    }

    if (typeof chat.welcome === 'undefined') chat.welcome = true
    if (typeof chat.sWelcome === 'undefined') chat.sWelcome = ''
    if (typeof chat.sBienvenida === 'undefined') chat.sBienvenida = ''
    if (typeof chat.sBye === 'undefined') chat.sBye = ''
    if (typeof chat.sGoodbye === 'undefined') chat.sGoodbye = ''
    if (typeof chat.sDespedida === 'undefined') chat.sDespedida = ''

    const getGroupName = async () => {
      try {
        if (m.isGroup) {
          const meta = await conn.groupMetadata(groupId).catch(() => null)
          return meta?.subject || 'هذه المجموعة'
        }
      } catch {}
      return 'هذه المجموعة'
    }

    const saveDB = async () => {
      let saved = false
      let lastError = null
      try {
        if (global.db?.write && typeof global.db.write === 'function') {
          await global.db.write()
          saved = true
        }
      } catch (e) { lastError = e }
      try {
        if (!saved && typeof global.db?.save === 'function') {
          const r = global.db.save()
          if (r instanceof Promise) await r
          await new Promise(res => setTimeout(res, 800))
          saved = true
        }
      } catch (e) { lastError = e }

      if (!saved && lastError) console.error('[setwelcome] حدث خطأ أثناء النظر إلى قاعدة البيانات:', lastError)
      return saved
    }

    let rawText = (typeof text === 'string' ? text : '')
    if (!rawText || !rawText.trim()) {
      try {
        const prefix = usedPrefix || ''
        const cmdLen = (prefix + command).length
        const full = (m.text || '').trim()
        if (full.toLowerCase().startsWith((prefix + command).toLowerCase())) {
          rawText = full.slice(cmdLen).trim()
        }
      } catch {}
    }
    const cleanText = (rawText || '').trim()

    const groupName = await getGroupName()

    switch (command) {
      case 'setwelcome':
      case 'setbienvenida': {
        if (!cleanText) {
          const actual = chat.sWelcome || chat.sBienvenida || 'بشكل افتراضي (مرحبًا بك في الظلال! أتمنى أن تكون إقامتك أسطورية.)'
          return await m.reply(
            `⚔️ *إعدادات الترحيب — ${groupName}* ⚔️\n\n` +
            `• *المجموعة:* ${groupId}\n` +
            `• *الرسالة الحالية (هذه المجموعة فقط):*\n> ${actual}\n\n` +
            `اكتب رسالة *الترحيب* الجديدة لـ *هذه المجموعة فقط*.\n\n` +
            `*المتغيرات المتوفرة:*\n` +
            `• *{usuario}* ➜ اذكر المستخدم الجديد\n` +
            `• *{grupo}* ➜ اسم المجموعة\n` +
            `• *{desc}* ➜ وصف المجموعة\n` +
            `• *{miembros}* ➜ عدد الأعضاء\n` +
            `• *{fecha}* ➜ التاريخ الحالي\n\n` +
            `*مثال:*\n` +
            `> ${usedPrefix + command} مرحبًا بـ {usuario} في {grupo}! 🎉 نحن أعضاء في {miembros}.\n\n` +
            `📌_لن يتم حفظ هذه الرسالة إلا في *${groupName}* ولن تؤثر على المجموعات الأخرى._`
          )
        }

        if (cleanText.length > 1000) {
          return await m.reply(`❌ الرسالة طويلة جداً (الحد الأقصى 1000 حرف). حاليا: ${cleanText.length}`)
        }

        const newMsg = cleanText
        chat.sWelcome = newMsg
        chat.sBienvenida = newMsg
        chat.welcome = true
        global.db.data.chats[groupId] = chat

        const saved = await saveDB()

        const verify = global.db.data.chats[groupId]?.sWelcome
        if (verify !== newMsg) {
          console.warn('[setwelcome] فشل التحقق, جارٍ إعادة محاولة التعيين...')
          global.db.data.chats[groupId].sWelcome = newMsg
          global.db.data.chats[groupId].sBienvenida = newMsg
          await saveDB().catch(() => {})
        }

        await m.reply(
          `✅ *تم إنشاء رسالة الترحيب بنجاح*\n\n` +
          `• *المجموعة:* *${groupName}*\n` +
          `• *المعرف:* \`${groupId}\`\n` +
          `• *رسالة جديدة (هذه المجموعة فقط):*\n> ${newMsg}\n\n` +
          `🔒_تم الحفظ في هذه المجموعة حصرياً. تحتفظ المجموعات الأخرى برسالتها الخاصة._\n\n` +
          `🧪 جرّب: *${usedPrefix}welcome* أو *${usedPrefix}welcome*`
        )
        break
      }

      case 'setgoodbye':
      case 'setbye':
      case 'setdespedida': {
        if (!cleanText) {
          const actual = chat.sBye || chat.sGoodbye || chat.sDespedida || 'الافتراضي (لقد تخليت عن الأمر. دع الظلال توجه مسارك الجديد.)'
          return await m.reply(
            `⚔️ *إعدادات الوداع — ${groupName}* ⚔️\n\n` +
            `• *المجموعة:* ${groupId}\n` +
            `• *الرسالة الحالية (هذه المجموعة فقط):*\n> ${actual}\n\n` +
            `اكتب *رسالة الوداع* الجديدة *لهذه المجموعة فقط*.\n\n` +
            `*المتغيرات المتوفرة:*\n` +
            `• *{usuario}* ➜ اسم المستخدم/الإشارة\n` +
            `• *{grupo}* ➜ اسم المجموعة\n` +
            `• *{desc}* ➜ وصف المجموعة\n` +
            `• *{miembros}* ➜ عدد الأعضاء المتبقين\n` +
            `• *{fecha}* ➜ التاريخ الحالي\n\n` +
            `*مثال:*\n` +
            `> ${usedPrefix + command} وداعاً {usuario}, ليكن الظل معك. أعضاء {miembros} المتبقين.\n\n` +
            `📌_لن يتم حفظ هذه الرسالة إلا في *${groupName}* ولن تؤثر على المجموعات الأخرى._`
          )
        }

        if (cleanText.length > 1000) {
          return await m.reply(`❌ الرسالة طويلة جداً (الحد الأقصى 1000 حرف). حاليا: ${cleanText.length}`)
        }

        const newMsg = cleanText
        chat.sBye = newMsg
        chat.sGoodbye = newMsg
        chat.sDespedida = newMsg
        chat.welcome = true
        global.db.data.chats[groupId] = chat

        const saved = await saveDB()
        const verify = global.db.data.chats[groupId]?.sBye
        if (verify !== newMsg) {
          console.warn('[setgoodbye] فشل التحقق, إعادة المحاولة...')
          global.db.data.chats[groupId].sBye = newMsg
          global.db.data.chats[groupId].sGoodbye = newMsg
          global.db.data.chats[groupId].sDespedida = newMsg
          await saveDB().catch(() => {})
        }

        await m.reply(
          `✅ *تم إنشاء رسالة الوداع بنجاح*\n\n` +
          `• *المجموعة:* *${groupName}*\n` +
          `• *المعرف:* \`${groupId}\`\n` +
          `• *رسالة جديدة (هذه المجموعة فقط):*\n> ${newMsg}\n\n` +
          `🔒_تم الحفظ في هذه المجموعة حصرياً. تحتفظ المجموعات الأخرى برسالتها الخاصة._\n\n` +
          `🧪 جرب: *${usedPrefix}goodbye* أو *${usedPrefix}bye*`
        )
        break
      }

      case 'delwelcome':
      case 'resetwelcome': {
        chat.sWelcome = ''
        chat.sBienvenida = ''
        global.db.data.chats[groupId] = chat
        await saveDB()
        await m.reply(`🗑️ *تمت استعادة رسالة الترحيب* إلى *${groupName}*.\n\nسيتم الآن استخدام الرسالة الافتراضية.\n> _هذه المجموعة فقط هي التي تأثرت._`)
        break
      }

      case 'delgoodbye':
      case 'delbye':
      case 'resetgoodbye':
      case 'resetbye': {
        chat.sBye = ''
        chat.sGoodbye = ''
        chat.sDespedida = ''
        global.db.data.chats[groupId] = chat
        await saveDB()
        await m.reply(`🗑️ *تمت استعادة رسالة الوداع* في *${groupName}*.\n\nسيتم الآن استخدام الرسالة الافتراضية.\n> _هذه المجموعة فقط هي التي تأثرت._`)
        break
      }

      default:
        return await m.reply(`❌ أمر غير معروف: ${command}`)
    }
  } catch (e) {
    console.error('[مجموعة الترحيب] خطأ:', e)
    try { await m.reply(`❌ خطأ في الإعداد: ${e?.message || e}`) } catch {}
  }
}

handler.help = ['setwelcome <texto>', 'setbienvenida <texto>', 'setgoodbye <texto>', 'setbye <texto>', 'setdespedida <texto>', 'delwelcome', 'delgoodbye']
handler.tags = ['grupos']
handler.command = [
  'setwelcome', 'setbienvenida',
  'setgoodbye', 'setbye', 'setdespedida',
  'delwelcome', 'delgoodbye', 'delbye',
  'resetwelcome', 'resetgoodbye', 'resetbye'
]
handler.group = true
handler.admin = true
handler.botAdmin = false

export default handler
