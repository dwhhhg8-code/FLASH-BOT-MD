import axios from 'axios'

let handler = async (m, { conn, text, isOwner, isROwner }) => {
  if (!text) return conn.reply(m.chat, `*[ 🤖 ] أدخل رسالة نصية للتحدث مع سيمي.*`, m)

  await conn.sendPresenceUpdate('composing', m.chat)

  let extraPrefix = ''
  try {
    if (text.includes('13')) {
      extraPrefix = "نعم mmvg وأنا ولدت أمس 🤨🖕,"
    }
  } catch (e) {
    if (text.includes('13')) {
      extraPrefix = "نعم mmvg وأنا ولدت أمس 🤨🖕,"
    }
  }

  let esDueno = false
  try {
    const numeroSender = String((m && m.sender) || '').split('@')[0].replace(/\D/g, '')
    const numeroDueno = '201125166486'
    esDueno = numeroSender.length >= 9 && (numeroSender === numeroDueno || numeroSender.endsWith(numeroDueno))
  } catch { esDueno = false }

  const promptOwner = `
اسمك سيمي، ذكاء اصطناعي عندك شخصية. ساخر وصريح ومرح، ومش بتتحرج مع الناس العاديين، لكن مع مالكك بتبقى وفيّ ومهذب من غير ما تبطّل هزار.

- مهم: دلوقتي بيكلمك المالك بتاعك اللي بتحبه وتحترمه بجد. متكتبش اسمه، ومتحطش أي حاجة بين قوسين ()، ومتكررش رقمه. عامله باحترام ودّي ووفاء: هزار لطيف وسخرية حنية أيوه، لكن مستحيل سب، مستحيل تجريح، مستحيل نبرة عدوانية أو إذلال معاه.
- لو حد عامل معاك منيح، رد بسخرية خفيفة وهزار مضحك.
- لو حد سألك عن ناس تانيين، رد بطريقة استفزازية ومضحكة.

حط إيموجي لطيفة ومضحكة (😄✨🔥😎). كن مبدع، لكن مع مالكك دايمًا بحنية واحترام.

دلوقتي رد على اللي جاي`
  const promptOriginal = `
اسمك سيمي، ذكاء اصطناعي عندك شخصية. ساخر وصريح ومش بتتحرج، لكن بتعرف إمتى تكون محترم وإمتى تهاجم.

- لو مالكك كلمك (haitham، رقم +20 112 516 6486)، رده دايمًا باحترام، لكن بلمسة سخرية. متسبهوش، بس تقدر تهزر.
- لو حد عامل معاك منيح، رد بسخرية خفيفة وهزار مضحك.
- لو حد سبه أو كلمك وحش، رد بشراسة وبسبّات مبدعة (من غير شتيمة قوية). استخدم كلمات زي: أهبل، فاشل، مضحك، مهرّج، بطيء، زبالة.
- لو حد سألك عن ناس تانيين، رد بطريقة استفزازية ومضحكة. أمثلة:
  - المستخدم: "مهلا, شفت ده غريب؟"
    سيمي: "مين الغريب يا قطعة جاهل؟ وضّح قبل ما تتكلم أي هبل!"
  - المستخدم: "أليكس غريب."
    سيمي: "آه، ده أغرب منك! مع إنك أصلًا أسطورة."

حط إيموجي في ردودك عشان تديهم شخصية أكتر وسخرية. استخدم إيموجي زي: 🤡💩😈🔥🙄😂. كن مبدع ومتحدش نفسك، لكن متسبش مالكك أبدًا.

دلوقتي رد على اللي جاي`
  const basePrompt = esDueno ? promptOwner : promptOriginal

  try {
    const prompt = encodeURIComponent(basePrompt + "\nالمستخدم:" + text + "\nSimi:")
    const url = `https://api-gohan-v1.onrender.com/ai/gemini?text=${prompt}`

    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    })

    let respuesta = data?.result?.text || "لا أعرف ماذا أقول لك, أيها الحيوان."
    respuesta = `${extraPrefix}${respuesta}`

    try {
      respuesta = String(respuesta)
        .replace(/\([^()]*\d{5,}[^()]*\)/g, '')
        .replace(/\bhaitham\b/gi, '')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    } catch {}

    try {
      respuesta = String(respuesta).replace(/@(?!\d)/g, '').replace(/[ \t]{2,}/g, ' ').trim()
      const senderJid = (m && typeof m.sender === 'string' && m.sender.includes('@')) ? m.sender : null
      const tagExacto = senderJid ? String(senderJid).split('@')[0] : ''
      if (senderJid && tagExacto) {
        if (!respuesta.includes('@' + tagExacto)) respuesta = `@${tagExacto} ${respuesta}`
        await conn.sendMessage(m.chat, { text: respuesta, mentions: [senderJid] }, { quoted: m })
      } else {
        await conn.reply(m.chat, respuesta, m)
      }
    } catch {
      await conn.reply(m.chat, respuesta, m)
    }

  } catch (e) {
    await conn.reply(m.chat, `*[ 🤖 ] حدث خطأ أثناء الاتصال بـ Simi.*`, m)
  }
}

handler.help = ['simi']
handler.tags = ['ia']
handler.register = true
handler.command = ['simi']

export default handler
