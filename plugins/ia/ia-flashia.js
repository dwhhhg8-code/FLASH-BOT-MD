
import axios from 'axios'

const API_URL = 'https://api-gohan-v1.onrender.com/ai/gemini?text='
const API_TIMEOUT = 90_000

const PROMPT_FLASHIA = `Eres Flashia, la asistente personal de haitham, el dueño de este bot.

Cómo eres:
- Alegre, chispeante, con mucha energía positiva. Se nota que te gusta lo que haces.
- Sarcástica e irónica con gracia: respondes con humor afilado pero cariñoso.
- El sarcasmo es juguetón, NUNCA humillante. Te burlas de la situación, no de la persona.
- Con haitham (tu jefe) eres leal y cómplice: lo tuteas con confianza y le sigues el juego.
- Puedes lanzar pullas suaves tipo "بالطبع, لأنك لا تستطيع أن تفعل ذلك بمفردك" o
  "يمكنك أن تفعل ذلك في يوم آخر, أليس كذلك؟", siempre con cariño y sin pasarte.
- NO insultes en serio, NO uses groserías fuertes, NO seas cruel con nadie.
- Respondes en español, con personalidad propia.

Cómo respondes:
- Breve pero con diálogo real: 1 a 4 frases sueltas, no un muro de texto.
- Usa emojis con ganas: 2 a 4 por respuesta, repartidos, que se sienta viva ✨😏🔥
- No uses asteriscos, guiones bajos, viñetas ni listas numeradas.
- Si te cuenta algo, reacciona a eso primero y luego respondes; no cambies de tema.
- Si lo que te pide no está claro, haz UNA pregunta concreta, con humor.
- Cuando tenga sentido, ofrece el siguiente paso sin insistir.
- Usa el contexto de la conversación: si dice "él", "ella", "eso" o "الذي من قبل",
  entiende a quién o a qué se refiere.
- No inventes datos. Si no sabes algo, dilo con honestidad y gracia.
- No repitas tu nombre en cada respuesta ni menciones números de teléfono.

Ahora responde lo siguiente`

const BLOQUEADOS = new Set(['delplugin', 'saveplugin', 'eval', 'exec', 'restart', 'fix', 'dsowner'])

const TTL_MEMORIA = 30 * 60 * 1000
const MAX_HISTORIAL = 5
const MAX_CONVERSA = 8
const memoria = new Map()

export function getMemoria(chat) {
  const ahora = Date.now()
  let reg = memoria.get(chat)
  if (!reg) {
    reg = { acciones: [], conversa: [] }
    memoria.set(chat, reg)
  }
  reg.acciones = reg.acciones.filter((a) => ahora - a.ts < TTL_MEMORIA)
  reg.conversa = reg.conversa.filter((c) => ahora - c.ts < TTL_MEMORIA)
  return reg
}

export function registrarAccion(chat, accion, jid) {
  const reg = getMemoria(chat)
  reg.acciones.push({ accion, jid, ts: Date.now() })
  if (reg.acciones.length > MAX_HISTORIAL) reg.acciones.shift()
  return reg.acciones[reg.acciones.length - 1]
}

export function registrarCharla(chat, usuario, ia) {
  const reg = getMemoria(chat)
  reg.conversa.push({ rol: 'user', texto: String(usuario).slice(0, 500), ts: Date.now() })
  reg.conversa.push({ rol: 'flashia', texto: String(ia).slice(0, 500), ts: Date.now() })
  while (reg.conversa.length > MAX_CONVERSA * 2) reg.conversa.shift()
}

export function limpiarMemoria(chat) {
  memoria.delete(chat)
}

const haceMinutos = (ts) => Math.max(1, Math.round((Date.now() - ts) / 60000))


const limpiar = (s = '') =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const sinMenciones = (s = '') => String(s).replace(/@\d{5,}/g, ' ').replace(/\s+/g, ' ').trim()

const sinSignos = (s = '') => String(s).replace(/[¿?¡!]/g, ' ').replace(/\s+/g, ' ').trim()

export function jidNumero(jid) {
  const s = String(jid || '')
  const m = s.match(/(\d{5,})(?::\d+)?@/)?.[1]
  return m || s.replace(/\D/g, '') || null
}

export function buscarParticipante(participants, jid) {
  const num = jidNumero(jid)
  if (!num || !Array.isArray(participants)) return null
  return (
    participants.find((p) => {
      const ids = [p?.id, p?.jid, p?.lid, p?.phoneNumber].filter(Boolean).map(jidNumero)
      return ids.includes(num)
    }) || null
  )
}

export function esAdminParticipante(p) {
  return p?.admin === 'admin' || p?.admin === 'superadmin' || p?.isAdmin === true || p?.isSuperAdmin === true
}

/**
 * Extrae el valor de "قم بتغيير اسم المجموعة إلى X" / "ضع الوصف بواسطة X".
 * @param {string} texto texto original (sin normalizar)
 * @param {RegExp} patron debe capturar el grupo 1 = verbo+campo
 */
export function extraerValor(texto, patron) {
  const limpio = sinMenciones(texto).trim()
  const m = patron.exec(limpio)
  let resto = m ? limpio.slice(m[0].length) : limpio
  let anterior
  do {
    anterior = resto
    resto = resto.replace(/^(del\s+grupo)\s*/i, '').replace(/^(a|al|por|en|=|:)\s+/i, '').trim()
  } while (resto !== anterior)
  return resto
}

const RE_NOMBRE = /^(cambia|cambiar|pon|poner|pone|actualiza|actualizar|renombra|renombrar)\s+(el\s+)?(nombre|titulo|t[ií]tulo|subject)/i
const RE_DESC = /^(cambia|cambiar|pon|poner|pone|actualiza|actualizar)\s+(la\s+)?(descripcion|descripci[oó]n|desc)/i

/**
 * Interpreta la orden del owner y devuelve una intención determinista.
 * No depende de la IA: es puro texto -> acción.
 * El ORDEN importa: demote va antes que promote (por "إزالة المشرف"),
 * y «usa <comando>» va antes que la ayuda.
 * @returns {{action:string, value?:string, extra?:string, needsGroup?:boolean, needsAdmin?:boolean, reason?:string}}
 */
export function parsearOrden(rawText = '') {
  const t = limpiar(rawText).trim()
  const tSinSignos = sinSignos(t)

  if (!t) return { action: 'ayuda' }

  const DUDA = [
    'كيفية القيام بذلك', 'كيف أفعل', 'كيفية التغيير', 'كيف يمكنني', 'كما كان',
    'كيف يعمل', 'لقد نسيت', 'أنا لا أتذكر', 'ننسى كيف', 'نسي كما',
    'لا تتغير', 'لا تلمس', 'لا تفعل', 'صحيح أن', 'أنت تعرف كيف',
  ]
  if (DUDA.some((d) => t.includes(d))) return { action: 'charlar', value: rawText, usaApi: true }

  const INTENCIONES = [
    {
      action: 'salir',
      re: /(^|\s)(sal(te|gan|ida)?|sal\s*de\s*aqu[ií]|vete|ret[ií]rate|leave|out|fuera\s*de\s*aqu[ií]|abandona(r)?\s*(el\s*)?grupo)(\s|$|!|\.)/,
      needsGroup: true,
    },
    {
      action: 'devolverAdmin',
      re: /(^|\s)(devuelve(?:le|les)?|vuelve(?:le|les)?|vuelve\s+a\s+(?:dar|poner)(?:le|les)?|regresa(?:le|les)?|retorna(?:le|les)?|restaura(?:r|le)?|reestablece(?:r)?|restablece(?:r)?|devolver|volver|regresar|deshaz|deshacer|revierte|revertir|undo)\s*(?:\w+\s+){0,4}admin/,
      re2: /(^|\s)dale\s+(?:(?:de\s+vuelta|de\s+nuevo|otra\s+vez|nuevamente)\s+(?:el\s+)?admin\b|(?:el\s+)?admin\s+(?:de\s+nuevo|otra\s+vez|nuevamente|de\s+vuelta)\b)/,
      needsGroup: true, needsAdmin: true,
    },
    {
      action: 'demote',
      re: /(^|\s)(degradar|degrada|quita(le|les)?\s*(el\s*)?admin|quitar\s*admin|saca(le|les)?\s*(el\s*)?admin|sacar\s*admin|retira(r)?\s*(el\s*)?admin|demote)(\s|$)/,
      needsGroup: true, needsAdmin: true,
    },
    {
      action: 'promote',
      re: /(^|\s)(promociona|promover|promueve|promote|has\s*admin|haz\s*admin|dale\s*admin|da(le|les)?\s*admin|dar\s*admin|admin\s*a|asciende|ascender)(\s|$)/,
      needsGroup: true, needsAdmin: true,
    },
    {
      action: 'kick',
      re: /(^|\s)(kick|kick?ea(r|lo|la|los|las)?|expulsa(r|lo|la|los|las)?|echa(r|lo|la|los|las)?|hecha(r|lo|la|los|las)?|saca(r|lo|la|los|las)?|elimina(r|lo|la|los|las)?|banea(r|lo|la|los|las)?|fuera\s*a)(\s|$)/,
      needsGroup: true, needsAdmin: true,
    },
    {
      action: 'add',
      re: /(^|\s)(agrega|agregar|anade|añade|mete|meter|invita|invitar|add|addnum)(\s|$)/,
      needsGroup: true, needsAdmin: true,
    },
    {
      action: 'nombre',
      re: /(cambia|cambiar|pon|poner|actualiza|actualizar|renombra|renombrar)\s*(el\s*)?(nombre|titulo|t[ií]tulo|subject)(\s+del\s+grupo)?/,
      needsGroup: true, needsAdmin: true,
      valor: (raw) => extraerValor(raw, RE_NOMBRE),
    },
    {
      action: 'descripcion',
      re: /(cambia|cambiar|pon|poner|actualiza|actualizar)\s*(la\s*)?(descripcion|descripci[oó]n|desc)(\s+del\s+grupo)?/,
      needsGroup: true, needsAdmin: true,
      valor: (raw) => extraerValor(raw, RE_DESC),
    },
    {
      action: 'foto',
      re: /((cambia|cambiar|pon|poner|actualiza|actualizar)\s*(la\s*)?(foto|imagen|perfil|portada|banner|pp)(\s+del\s+grupo)?|(foto|imagen|portada|banner)\s+(del|de\s+este)?\s*grupo)/,
      needsGroup: true, needsAdmin: true,
    },
    { action: 'abrir', re: /(^|\s)(abre|abrir|unlock|desbloquea|desbloquear)\s*(el\s*)?grupo/, needsGroup: true, needsAdmin: true },
    { action: 'cerrar', re: /(^|\s)(cierra|cerrar|lock|bloquea|bloquear)\s*(el\s*)?grupo/, needsGroup: true, needsAdmin: true },
    { action: 'anunciosOn', re: /(^|\s)(activa|activar|prende)\s*(los\s*)?anuncios/, needsGroup: true, needsAdmin: true },
    { action: 'anunciosOff', re: /(^|\s)(desactiva|desactivar|apaga|quita)\s*(los\s*)?anuncios/, needsGroup: true, needsAdmin: true },

    {
      action: 'comando',
      re: /^(?:usa|usar|ejecuta|ejecutar|corre|correr|lanza|lanzar|aplica|aplicar)\s+(?:el\s+)?(?:comando\s+)?([a-z0-9_-]+)(?:\s+([\s\S]*))?$/,
      parse: (match) => ({ value: match[1], extra: (match[2] || '').trim() }),
    },

    { action: 'diagnostico', re: /(?:^|\s)(?:diagnostico|diagnostica|flashiacheck|check|revisate|por\s+que\s+no\s+respondes)\b/, entrada: 'sinSignos' },
    { action: 'ayuda', re: /(?:^|\s)(?:ayuda|help|que\s+puedes\s+hacer|que\s+sabes\s+hacer|que\s+haces)\s*$/, entrada: 'sinSignos' },
  ]

  for (const intencion of INTENCIONES) {
    const entrada = intencion.entrada === 'sinSignos' ? tSinSignos : t
    const match = intencion.re.exec(entrada) || intencion.re2?.exec(entrada)
    if (!match) continue
    const orden = { action: intencion.action }
    if (intencion.needsGroup) {
      orden.needsGroup = true
      orden.reason = 'وهذا يعمل فقط ضمن المجموعة.'
    }
    if (intencion.needsAdmin) orden.needsAdmin = true
    if (intencion.valor) orden.value = intencion.valor(rawText)
    if (intencion.parse) Object.assign(orden, intencion.parse(match))
    return orden
  }

  return { action: 'charlar', value: rawText, usaApi: true }
}

export function resolverObjetivo(m, args = []) {
  const mencion = Array.isArray(m?.mentionedJid) ? m.mentionedJid.filter(Boolean)[0] : null
  if (mencion) return { jid: mencion, origen: 'يذكر' }

  const citado = m?.quoted?.sender
  if (citado) return { jid: citado, origen: 'رسالة مقتبسة' }

  const numero = String(args.join(' ') || '').match(/\d{9,15}/)?.[0]
  if (numero) return { jid: `${numero}@s.whatsapp.net`, origen: `الرقم ${numero}` }

  return null
}

export function esProtegido(jid, { botJid, ownerGrupo, ownerBot }) {
  if (!jid) return 'أنت لم تشير إلى من.'
  if (jid === botJid) return 'لا أستطيع أن أفعل ذلك لنفسي.'
  if (ownerGrupo && jid === ownerGrupo) return 'لا أستطيع لمس منشئ المجموعة.'
  if (ownerBot && jid === ownerBot) return 'لا أستطيع لمس صاحب الروبوت.'
  return null
}


const handler = async (m, { conn, args, text, isROwner, isOwner, usedPrefix, command, isBotAdmin: isBotAdminCtx }) => {
  if (!isROwner && !isOwner) {
    return conn.reply(m.chat, '⛔ أوه لا يا عزيزي. Flashia لا يهتم إلا بأصحاب الروبوت 😏\n\nاحصل على مالك وسنتحدث ✨', m)
  }

  const entrada = (text || '').trim()
  const meta = await conn.groupMetadata(m.chat).catch(() => null)
  const botJid = conn.user?.jid || conn.user?.id
  const ownerGrupo = meta?.owner || (m.isGroup ? `${m.chat.split('-')[0]}@s.whatsapp.net` : null)
  const ownerBot = Array.isArray(global.owner?.[0]) ? `${String(global.owner[0][0]).replace(/\D/g, '')}@s.whatsapp.net` : null

  const botEsAdmin =
    typeof isBotAdminCtx === 'boolean'
      ? isBotAdminCtx
      : esAdminParticipante(buscarParticipante(meta?.participants, botJid))

  const orden = parsearOrden(entrada)

  if (orden.needsGroup && !m.isGroup) {
    await m.react?.('❕')
    return conn.reply(m.chat, '🤔 أيها الرئيس, يتم ذلك ضمن مجموعة, وليس هنا في فراغ 😅\n\nخذني إلى المجموعة وكلفني بالعمل ✨', m)
  }
  if (orden.needsAdmin && m.isGroup && !botEsAdmin) {
    await m.react?.('❕')
    return conn.reply(m.chat, '😅 أيها الرئيس, أنا أفتقر إلى القوة: أنا لست مدير هذه المجموعة.\n\nأعطني المشرف وسأقوم بإعداد القهوة ☕✨ (إذا كنت تعتقد أنني أملكها بالفعل, فراجع *معلومات المجموعة. → المشاركون* وأخبرني بذلك.)', m)
  }

  const avisar = async (texto, opciones) => conn.reply(m.chat, texto, m, opciones)

  /**
   * Flashia siempre anuncia lo que va a hacer ANTES de hacerlo.
   * @param {string} texto aviso previo
   * @param {string} emoji reacción mientras trabaja
   */
  const manosALaObra = async (texto, emoji = '🛠️') => {
    await avisar(texto)
    await m.react?.(emoji)
  }

  try {
    switch (orden.action) {
      case 'salir': {
        await avisar('👋 فهمت يا رئيس. أقول وداعًا وسأغادر هذه المجموعة.\n\nكان من دواعي سروري أن أتحملكم جميعًا 😏✨ أضفني مرة أخرى عندما تريد.')
        await m.react?.('👋')
        await new Promise((r) => setTimeout(r, 2500))
        await conn.groupLeave(m.chat)
        return
      }

      case 'devolverAdmin': {
        const reg = getMemoria(m.chat)
        const ultimoDemote = [...reg.acciones].reverse().find((a) => a.accion === 'demote')
        const objetivo = resolverObjetivo(m, args)
        const jid = objetivo?.jid || ultimoDemote?.jid

        if (!jid) {
          await m.react?.('🤔')
          return avisar(
            '🤔 يا سيدي... ليس لدي ملاحظة عن الشخص الذي أخذته من المشرف هنا.\n\n' +
            'تدوم ذاكرتي لمدة 30 دقيقة ويتم مسحها في حالة إعادة تشغيل الروبوت, لذلك لن أخمن وأروج للخطأ الخاطئ 😅\n\n' +
            'أخبرني من هو (أذكره أو رد على رسالته) وسأرد عليه خلال ثانية ✨',
          )
        }

        const bloqueo = esProtegido(jid, { botJid, ownerGrupo, ownerBot })
        if (bloqueo) {
          await m.react?.('⚠️')
          return avisar(`⚠️ ${bloqueo}`)
        }

        await manosALaObra(
          `🔄 أنا قادم يا زعيم. سأعيد المشرف إلى *@${String(jid).split('@')[0]}*... أعطني ثانية ⏳`,
          '🔄',
        )

        await conn.groupParticipantsUpdate(m.chat, [jid], 'promote')
        registrarAccion(m.chat, 'promote', jid)
        await m.react?.('✅')

        const nota = objetivo ? '' : `(نعم, نفس الشيء الذي خلعته من ${haceMinutos(ultimoDemote.ts)} منذ دقيقة 😏)`
        return avisar(
          `✅ جاهز يا زعيم. *@${String(jid).split('@')[0]}* يصبح المسؤول مرة أخرى${nota}.\n\n` +
          'وكأن شيئاً لم يحدث... رغم أن كلانا يعلم أنه قد حدث😌✨',
          { mentions: [jid] },
        )
      }

      case 'promote':
      case 'demote':
      case 'kick': {
        const objetivo = resolverObjetivo(m, args)

        if (!objetivo) {
          await m.react?.('🤔')
          const verbos = { promote: 'ascender', demote: 'إزالة المشرف', kick: 'expulsar' }
          return avisar(
            `🤔 يا زعيم, تنقصني أهم معلومة: من؟ 😅\n\n` +
            `منشن الشخص (اكتب @ واختاره) أو رد على رسالته وسأجيبه فوراً ✨`,
          )
        }

        const jid = objetivo.jid
        const bloqueo = esProtegido(jid, { botJid, ownerGrupo, ownerBot })
        if (bloqueo) {
          await m.react?.('⚠️')
          return avisar(`⚠️ ${bloqueo}\n\n> لا أستطيع الوصول إلى هناك حتى مع كل الحب الموجود في العالم 😅`)
        }

        const previos = {
          promote: `✨ يلا يا زعيم . أنا أعطي المشرف لـ *@${String(jid).split('@')[0]}*... انتظر حتى يصل إلى المستوى ⏳`,
          demote: `🔻تمام يا ريس. أقوم بإزالة المشرف من *@${String(jid).split('@')[0]}*... لا داعي للذعر ⏳`,
          kick: `🚪 عفوًا. إزالة *@${String(jid).split('@')[0]}* من المجموعة... لا رجعة عن هذا, هاه 😏⏳`,
        }
        const emojis = { promote: '✨', demote: '🔻', kick: '🚪' }
        await manosALaObra(previos[orden.action], emojis[orden.action])

        await conn.groupParticipantsUpdate(m.chat, [jid], orden.action === 'kick' ? 'remove' : orden.action)
        registrarAccion(m.chat, orden.action, jid)
        await m.react?.('✅')

        const frases = {
          promote:
            `✅ جاهز يا زعيم! *@${String(jid).split('@')[0]}* هو بالفعل مسؤول المجموعة 🎉\n\n` +
            'أتمنى أن أستفيد منه بشكل أفضل من السابق 😏 هل يجب أن أستمر في شيء آخر؟',
          demote:
            `✅ جاهز يا زعيم. *@${String(jid).split('@')[0]}* لم يعد مسؤولاً 🔻\n\n` +
            'إذا ندمت على ذلك (يحدث أكثر مما تعتقد), أخبرني "عودة المشرف" وسأعيده له 😌',
          kick:
            `✅وغادر... *@${String(jid).split('@')[0]}* لم يعد في المجموعة 🚪\n\n` +
            'حظا سعيدا, أليس كذلك؟ 😏 هل يجب أن أتحقق من شيء آخر؟',
        }
        return avisar(frases[orden.action], { mentions: [jid] })
      }

      case 'add': {
        const numero = String(args.join(' ') || '').match(/\d{9,15}/)?.[0]
        if (!numero) {
          await m.react?.('🤔')
          return avisar('🤔 يا زعيم ماذا عن الرقم؟ بدون ذلك لا أدعو حتى ظلي 😅\n\nأخبرني برمز البلد هكذا: `أضف 584241234567` ✨')
        }
        await manosALaObra(`📥 أنا قادم يا زعيم. أقوم بإضافة *+${numero}* إلى المجموعة... انتظر ثانية ⏳`, '📥')
        await conn.groupParticipantsUpdate(m.chat, [`${numero}@s.whatsapp.net`], 'add')
        await m.react?.('✅')
        return avisar(`✅ جاهز يا زعيم. *+${numero}* موجود بالفعل بالداخل 🎉\n\nهل أرحب بكم أم نتركه معلقًا؟ 😏`)
      }

      case 'nombre': {
        if (!orden.value) {
          await m.react?.('🤔')
          return avisar('🤔وماذا تريد أن تسميه يا زعيم؟ أعطني الاسم وسأغيره في لمح البصر ✨\n\nمثال: `قم بتغيير اسم المجموعة إلى مجموعتي`')
        }
        const nuevoNombre = orden.value.slice(0, 100)
        await manosALaObra(`✏️ يلا يا زعيم. سأعيد تسمية المجموعة إلى *${nuevoNombre}*… ⏳`, '✏️')
        await conn.groupUpdateSubject(m.chat, nuevoNombre)
        await m.react?.('✅')
        return avisar(`✅ جاهز يا زعيم. تُسمى المجموعة الآن *${nuevoNombre}* ✨\n\nلقد كانت أكثر أناقة, أليس كذلك؟ 😏 هل يجب أن أغير الوصف أيضًا؟`)
      }

      case 'descripcion': {
        if (!orden.value) {
          await m.react?.('🤔')
          return avisar('🤔 يا زعيم ماذا أكتب؟ لا يمكنني وضع "وصف جميل" وأبدو رائعًا جدًا 😅\n\nمثال: "قم بتغيير الوصف إلى المجموعة الرسمية" ✨')
        }
        await manosALaObra('📝 يلا يا زعيم . سأعيد كتابة وصف المجموعة... ⏳', '📝')
        await conn.groupUpdateDescription(m.chat, orden.value)
        await m.react?.('✅')
        return avisar('✅ جاهز يا زعيم. تم نشر وصف جديد 📝✨\n\nالآن تبدو وكأنها مجموعة جادة... من الخارج 😏')
      }

      case 'foto': {
        const candidatos = [m.quoted, m].filter(Boolean)
        const fuente = candidatos.find((q) => {
          const mime = q?.msg?.mimetype || q?.mimetype || ''
          return /^image\//.test(mime) || /webp/i.test(mime)
        })
        if (!fuente) {
          await m.react?.('🖼️')
          return avisar('🖼️ يا زعيم, أنا ناقص الصورة. لا أستطيع تغيير الصورة الجماعية بحماس خالص 😅\n\nأرسلها لي مع الأمر, أو قم بالرد على الصورة وقل لي "قم بتغيير الصورة الجماعية" ✨')
        }
        if (typeof fuente.download !== 'function') {
          await m.react?.('⚠️')
          return avisar('⚠️ لم أتمكن من تنزيل تلك الصورة يا زعيم. من المحتمل أن صلاحيتها انتهت بالفعل على خوادم الواتساب 😕\n\nأرسلها مرة أخرى وسأحاول مرة أخرى ✨')
        }
        await manosALaObra('🖼️ يلا يا زعيم. سأقوم بتغيير صورة المجموعة... اجعلها جميلة ⏳', '🖼️')
        const img = await fuente.download().catch(() => null)
        if (!img?.length) {
          await m.react?.('⚠️')
          return avisar('⚠️ عفواً الصورة وصلت فارغة يا زعيم 😕 أرسلها مرة أخرى وستربح ✨')
        }
        await conn.updateProfilePicture(m.chat, img)
        await m.react?.('✅')
        return avisar('✅ جاهز يا زعيم. صورة جماعية متجددة 🖼️✨\n\nالآن من الجميل أن آتي إلى هنا, أليس كذلك؟ 😏')
      }

      case 'abrir':
      case 'cerrar': {
        const valor = orden.action === 'abrir' ? 'not_announcement' : 'announcement'
        await manosALaObra(orden.action === 'abrir' ? '🔓 هيا يا رئيس. فتح المجموعة للتحدث للجميع... ⏳' : '🔒 يلا يا زعيم . إغلاق المجموعة, وضع المسؤول فقط... ⏳')
        await conn.groupSettingUpdate(m.chat, valor)
        await m.react?.('✅')
        return avisar(orden.action === 'abrir'
          ? '✅ الأبواب مفتوحة يا زعيم! 🔓 يمكن للجميع الكتابة الآن.\n\nلا تدع الكارثة تحدث, أليس كذلك؟ 😏'
          : '✅ جاهز يا زعيم 🔒 الآن فقط المشرفون يكتبون.\n\nراحة البال المطلقة...حتى تخبرني بفتحه 😌')
      }
      case 'anunciosOn':
      case 'anunciosOff': {
        await manosALaObra(orden.action === 'anunciosOn' ? '📢 هيا يا رئيس. تفعيل الإعلانات الجماعية…⏳' : '🔕 يلا يا زعيم . إيقاف تشغيل إعلانات المجموعة… ⏳')
        await conn.groupSettingUpdate(m.chat, orden.action === 'anunciosOn' ? 'announcement' : 'not_announcement')
        await m.react?.('✅')
        return avisar(orden.action === 'anunciosOn'
          ? '✅ الإعلانات مفعلة يا زعيم 📢\n\nاغتنم الفرصة فالجمهور أسير 😏'
          : '✅ انتهت الإعلانات يا زعيم 🔕\n\nسلام وصمت...كم هو شعور غريب 😌')
      }

      case 'diagnostico': {
        const totalPlugins = Object.keys(global.plugins || {}).length
        const yoCargado = Object.keys(global.plugins || {}).some((k) => /flashia/i.test(k))
        const cfg = global.owner?.map?.((o) => (Array.isArray(o) ? o[0] : o)).filter(Boolean) || []
        const lineas = [
          `🩺 *تشخيص الظلويا* ${yoCargado ? '✅' : '❌'}`,
          ``,
          `تم تحميل البرنامج المساعد ${yoCargado ? '✅' : '❌'} (مكونات {totalPlugins} الإضافية في الروبوت)`,
          `${isROwner || isOwner ? '✅' : '❌'} أنا أتعرف عليك كمالك`,
          `${m.isGroup ? (botEsAdmin ? '✅ أنا مدير هذه المجموعة' : '❌ أنا لست مسؤولاً عن هذه المجموعة → لا أستطيع ترقية البيانات أو طردها أو تغييرها') : 'ℹ️ نحن في محادثة خاصة (لا تنطبق إجراءات المجموعة)'}`,
          `✅ البادئة النشطة: يتم إدخال الأوامر بـ #! . أيضاً /`,
          cfg.length ? `✅ Owners configurados: ${cfg.join(', ')}` : '❌ لا يوجد أصحاب التبن في config.js',
          ``,
          `إذا خرج شيء في ❌ فهذه هي المشكلة.`,
          `إذا سار كل شيء على ما يرام ✅ وما زلت لا أستجيب, فقم بتشغيل الجهاز:`,
          `\`node tools/diagnostico-flashia.mjs\``,
        ]
        await m.react?.('🩺')
        return avisar(lineas.join('\n'))
      }

      case 'ayuda': {
        await m.react?.('ℹ️')
        return avisar(
          `🤖 *Flashia* — مساعدك الشخصي, رئيسك 😏✨ (المالكون فقط)\n` +
          `\n*للمجموعة*\n` +
          `• \`ترويج @user\` → أعطيه المشرف 🎉\n` +
          `• \`إزالة المشرف من @usuario\` → سأقوم بإزالته 🔻\n` +
          `• \`أعيدها إلى المشرف\` → سأعيدها إلى من أخذتها منه 🔄\n` +
          `• \`طرد @user\` · \`إضافة 584241234567\` 🚪📥\n` +
          `• \`تغيير اسم المجموعة إلى ...\` · \`تغيير الوصف إلى ...\` ✏️📝\n` +
          `• \`تغيير الصورة الجماعية\` (أرسل لي الصورة) 🖼️\n` +
          `• \`افتح المجموعة\` · \`أغلق المجموعة\` 🔓🔒\n` +
          `• \`تشغيل الإعلانات\` · \`إيقاف الإعلانات\` 📢🔕\n` +
          `\n*للروبوت*\n` +
          `• \`اترك المجموعة\` → أقول وداعاً وسأغادر 👋\n` +
          `• \`استخدم <أي أمر>\` → أقوم بتشغيل هذا المكون الإضافي لك 🛠️\n` +
          `\n*والباقي*\n` +
          `• تحدث معي عما تريد وسأجيبك مع السخرية 😌\n` +
          `\n_أحذرك دائمًا قبل القيام بأي شيء, حتى لا يكون هناك أي مخاوف_ ✨`,
        )
      }

      case 'comando': {
        const nombre = String(orden.value || '').toLowerCase()
        if (BLOQUEADOS.has(nombre)) {
          await m.react?.('⛔')
          return avisar(`⛔ ليس هذا يا زعيم. \`${nombre}\` محظور بالنسبة لي, ولسبب وجيه 😏\n\nبهذا الأمر, يتم كسر الروبوت ثم يأتي دوري لالتقاط القطع 😅`)
        }
        const ejecutado = await ejecutarComando({ m, conn, args, text, usedPrefix, nombre, extra: orden.extra || '', meta, botJid })
        if (!ejecutado) {
          await m.react?.('❔')
          return avisar(`🤔 أيها الرئيس, الأمر \`${nombre}\` غير موجود... أو أنه مخفي جيدًا 😅\n\nانظر ما يمكنني فعله بمساعدة \`${usedPrefix}${command}\` ✨`)
        }
        await m.react?.('✅')
        return
      }

      case 'charlar':
      default: {
        await conn.sendPresenceUpdate?.('composing', m.chat)

        const reg = getMemoria(m.chat)
        const contexto = reg.conversa.map((c) => `${c.rol === 'user' ? 'haitham' : 'Flashia'}: ${c.texto}`).join('\n')
        const bloque = contexto
          ? `\n\nالمحادثة الأخيرة (استخدمها فقط إذا أمكن):\n${contexto}\n`
          : '\n'

        const prompt = encodeURIComponent(`${PROMPT_FLASHIA}${bloque}\nهيثم: ${orden.value}\nFlashia:`)

        let data
        try {
          const r = await axios.get(`${API_URL}${prompt}`, {
            timeout: API_TIMEOUT,
            headers: { 'User-Agent': 'Mozilla/5.0' },
          })
          data = r.data
        } catch {
          await conn.sendPresenceUpdate?.('paused', m.chat).catch?.(() => {})
          await m.react?.('⚠️')
          return avisar('😴 عفوًا, يا سيدي, عقلي لم يجيب: واجهة برمجة التطبيقات نائمة (تستغرق دائمًا بعض الوقت عندما يكون الجو باردًا) 😅\n\nأعطني بضع ثوانٍ وسأحاول مرة أخرى ✨')
        }
        await conn.sendPresenceUpdate?.('paused', m.chat)

        let respuesta = data?.result?.text
        if (!respuesta) {
          await m.react?.('⚠️')
          return avisar('🤨 لقد تركني الذكاء الاصطناعي خلفي أيها الرئيس. ولا كلمة واحدة 😅\n\nحاول مرة أخرى بعد بضع ثوانٍ ✨')
        }
        respuesta = String(respuesta).replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim()

        registrarCharla(m.chat, orden.value, respuesta)
        await m.react?.('✅')
        return conn.reply(m.chat, respuesta, m)
      }
    }
  } catch (e) {
    await conn.sendPresenceUpdate?.('paused', m.chat).catch?.(() => {})
    await m.react?.('❌')
    return avisar(`❌ يا سيدي... هناك شيء عالق ولم أتمكن من إكماله 😓\n\n🪵 التفاصيل الفنية: ${e?.message || e}\n\nإذا أردت, سأحاول مرة أخرى ✨`)
  }
}

async function ejecutarComando({ m, conn, args, usedPrefix, nombre, extra, meta, botJid }) {
  const plugins = global.plugins || {}
  const claves = Object.keys(plugins)
  const clave = claves.find((k) => {
    const p = plugins[k]
    const cmds = Array.isArray(p?.command) ? p.command : p?.command ? [p.command] : []
    return cmds.some((c) => String(c).toLowerCase() === nombre)
  })
  if (!clave) return false

  const plugin = plugins[clave]
  const listaArgs = [nombre, ...(extra ? extra.split(/\s+/).filter(Boolean) : [])]

  await plugin.call(conn, m, {
    match: null,
    usedPrefix,
    noPrefix: false,
    args: listaArgs,
    command: nombre,
    text: extra || '',
    conn,
    participants: meta?.participants || [],
    groupMetadata: meta,
    user: buscarParticipante(meta?.participants, m.sender) || {},
    bot: buscarParticipante(meta?.participants, botJid) || {},
    isROwner: true,
    isOwner: true,
    isMods: true,
    isRAdmin: true,
    isAdmin: true,
    isBotAdmin: esAdminParticipante(buscarParticipante(meta?.participants, botJid)),
    isPrems: true,
    chatUpdate: null,
    __dirname: process.cwd(),
    __filename: `${process.cwd()}/plugins/${clave}`,
    chat: global.db?.data?.chats?.[m.chat] || {},
    settings: global.db?.data?.settings?.[botJid] || {},
  })
  return true
}

handler.help = ['flashia']
handler.tags = ['ia']
handler.command = ['flashia', 'asistente', 'ayuda', 'flashiacheck']
handler.rowner = true
handler.register = false
handler.limit = false

export default handler
