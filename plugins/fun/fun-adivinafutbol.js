import { randomBytes } from 'node:crypto'


const LIMITE_SEGUNDOS = 40
const AVISO_EN_SEGUNDOS = 10
const PUNTOS_BASE = 100
const PUNTOS_BONUS = 40
const ESPERA_SIGUIENTE = 2500
const MAX_PREGUNTAS = 20
const MAX_PREGUNTAS_DUELO = 7
const INVITACION_SEGUNDOS = 60
const LETRAS = ['A', 'B', 'C', 'D']


const BANCO = [
  { cat: 'Messi', q: 'ما هو لقب ليونيل ميسي؟', o: ['البرغوث', 'الخطأ', 'الظاهرة', 'الماتادور'], ok: 0 },
  { cat: 'Messi', q: 'في أي مدينة أرجنتينية ولد ليونيل ميسي؟', o: ['Rosario', 'Córdoba', 'بوينس آيرس', 'سانتا في'], ok: 0 },
  { cat: 'Messi', q: 'مع أي فريق فاز ميسي بكأس العالم لأول مرة؟', o: ['Argentina', 'Brasil', 'España', 'Uruguay'], ok: 0 },
  { cat: 'Messi', q: 'كم عدد الكرات الذهبية التي فاز بها ليونيل ميسي؟', o: ['8', '5', '6', '7'], ok: 0 },
  { cat: 'Messi', q: 'ما هو النادي الذي ذهب إليه ميسي بعد رحيله عن برشلونة؟', o: ['باريس سان جيرمان', 'مانشستر سيتي', 'انتر ميلان', 'Chelsea'], ok: 0 },
  { cat: 'Cristiano', q: 'ماذا يعني اللقب "CR7"؟', o: ['كريستيانو رونالدو ورقمه 7', 'كأس الملك 7', 'نادي ريسيفي 7', 'بطل الجولة السابعة'], ok: 0 },
  { cat: 'Cristiano', q: 'ما هي جنسية كريستيانو رونالدو ؟', o: ['Portuguesa', 'Española', 'Brasileña', 'Italiana'], ok: 0 },
  { cat: 'Cristiano', q: 'في أي جزيرة برتغالية ولد كريستيانو رونالدو؟', o: ['Madeira', 'Azores', 'الرأس الأخضر', 'بورتو سانتو'], ok: 0 },
  { cat: 'Cristiano', q: 'كم عدد الكرات الذهبية التي فاز بها كريستيانو رونالدو؟', o: ['5', '3', '7', '4'], ok: 0 },
  { cat: 'Cristiano', q: 'مع أي نادي فاز كريستيانو بأول دوري أبطال أوروبا؟', o: ['مانشستر يونايتد', 'ريال مدريد', 'Juventus', 'سبورتنج لشبونة'], ok: 0 },

  { cat: 'Apodos', q: 'من هو اللاعب الملقب بـ "الحشرة"؟', o: ['كريستيانو رونالدو', 'ليونيل ميسي', 'Neymar', 'Mbappé'], ok: 0 },
  { cat: 'Apodos', q: 'من هو "يا فينومينو"؟', o: ['رونالدو نازاريو', 'Ronaldinho', 'Rivaldo', 'Romário'], ok: 0 },
  { cat: 'Apodos', q: 'من هو اللاعب الذي لقب بـ "El Pibe de Oro"؟', o: ['دييغو مارادونا', 'ليونيل ميسي', 'خوان رومان ريكيلمي', 'غابرييل باتيستوتا'], ok: 0 },
  { cat: 'Apodos', q: 'من هو حارس المرمى الذي كان "العنكبوت الأسود"؟', o: ['ليف ياشين', 'جيانلويجي بوفون', 'إيكر كاسياس', 'أوليفر كان'], ok: 0 },
  { cat: 'Apodos', q: 'من هو "القيصر"؟', o: ['فرانز بيكنباور', 'جيرد مولر', 'لوثار ماتيوس', 'كارل هاينز رومينيجه'], ok: 0 },

  { cat: 'Leyendas', q: 'من هو الفريق الذي فاز بأول كأس عالم في التاريخ (1930)؟', o: ['Uruguay', 'Brasil', 'Argentina', 'Italia'], ok: 0 },
  { cat: 'Leyendas', q: 'من هو أفضل هداف في تاريخ كأس العالم؟', o: ['ميروسلاف كلوزه', 'رونالدو نازاريو', 'جيرد مولر', 'Pelé'], ok: 0 },
  { cat: 'Leyendas', q: 'من سجل هدف 2-1 في نهائي قطر 2022؟', o: ['ليونيل ميسي', 'كيليان مبابي', 'أنخيل دي ماريا', 'جوليان ألفاريز'], ok: 0 },
  { cat: 'Leyendas', q: 'من هو حارس المرمى الذي تصدى بشكل لا يُنسى أمام روبن في نهائي 2010؟', o: ['إيكر كاسياس', 'فيكتور فالديز', 'بيبي رينا', 'ديفيد دي خيا'], ok: 0 },
  { cat: 'Leyendas', q: 'من هو المدافع الذي سجل هدف الفوز 1-0 على ألمانيا في نصف نهائي 2010؟', o: ['كارليس بويول', 'سيرجيو راموس', 'جيرارد بيكيه', 'جون كابديفيلا'], ok: 0 },
  { cat: 'Leyendas', q: 'من سجل هدف ستامفورد بريدج عام 2009 ضد تشيلسي؟', o: ['أندريس إنييستا', 'تشافي هيرنانديز', 'تييري هنري', 'صامويل إيتو'], ok: 0 },
  { cat: 'Leyendas', q: 'من هو اللاعب الذي ضرب ماتيراتزي في نهائي كأس العالم 2006؟', o: ['زين الدين زيدان', 'ماركو ماتيراتزي', 'تييري هنري', 'فابيان بارتيز'], ok: 0 },
  { cat: 'Leyendas', q: 'من هو النجم الهولندي الذي كان رمزا "لكرة القدم الشاملة"؟', o: ['يوهان كرويف', 'ماركو فان باستن', 'رود خوليت', 'دينيس بيركامب'], ok: 0 },
  { cat: 'Leyendas', q: 'ما هو النادي الذي أصبح ألفريدو دي ستيفانو عملاقًا فيه؟', o: ['ريال مدريد', 'Barcelona', 'ريفر بليت', 'بوكا جونيورز'], ok: 0 },
  { cat: 'Leyendas', q: 'كم عدد بطولات كأس العالم التي فاز بها بيليه؟', o: ['3', '1', '2', '4'], ok: 0 },
  { cat: 'Leyendas', q: 'مع أي فريق فاز بيليه بكأس العالم؟', o: ['Brasil', 'Argentina', 'Uruguay', 'Italia'], ok: 0 },
  { cat: 'Leyendas', q: 'من سجل "يد الله" و"هدف القرن" في نفس المباراة؟', o: ['دييغو مارادونا', 'خورخي فالدانو', 'غاري لينيكر', 'أوسكار روجيري'], ok: 0 },
  { cat: 'Leyendas', q: 'ضد أي فريق سجل مارادونا هذين الهدفين عام 1986؟', o: ['Inglaterra', 'Alemania', 'Bélgica', 'Brasil'], ok: 0 },
  { cat: 'Leyendas', q: 'أي ثنائي من لاعبي خط الوسط تألق مع برشلونة والمنتخب الإسباني؟', o: ['تشافي وانييستا', 'مودريتش وكروس', 'بيرلو وجاتوزو', 'الاسكالوب والضوضاء'], ok: 0 },
  { cat: 'Leyendas', q: 'من هو البرازيلي الذي فاز بالكرة الذهبية عام 2005 وهو يلعب لبرشلونة؟', o: ['Ronaldinho', 'Rivaldo', 'Kaká', 'رونالدو نازاريو'], ok: 0 },
  { cat: 'Leyendas', q: 'من هو اللاعب البرازيلي الذي فاز بالكرة الذهبية عام 2007 مع ميلان؟', o: ['Kaká', 'Ronaldinho', 'Adriano', 'Robinho'], ok: 0 },
  { cat: 'Leyendas', q: 'من هو المجري الذي تألق مع ريال مدريد في الخمسينيات؟', o: ['فيرينك بوشكاش', 'ساندور كوكسيس', 'جوزيف بوزيك', 'زولتان شيبور'], ok: 0 },
  { cat: 'Leyendas', q: 'من سجل الهدف الحاسم في نهائي كأس العالم 1974؟', o: ['جيرد مولر', 'فرانز بيكنباور', 'يوهان كرويف', 'بول بريتنر'], ok: 0 },
  { cat: 'Leyendas', q: 'من هو مهاجم مانشستر يونايتد الذي فاز بالكرة الذهبية عام 1968؟', o: ['جورج بيست', 'بوبي تشارلتون', 'قانون دينيس', 'إريك كانتونا'], ok: 0 },
  { cat: 'Leyendas', q: 'من هو حارس المرمى الوحيد الذي فاز بالكرة الذهبية؟', o: ['ليف ياشين', 'جيانلويجي بوفون', 'إيكر كاسياس', 'مانويل نوير'], ok: 0 },

  { cat: 'Mundiales', q: 'من هو المنتخب الذي فاز بكأس العالم 2022 في قطر؟', o: ['Argentina', 'Francia', 'Brasil', 'Croacia'], ok: 0 },
  { cat: 'Mundiales', q: 'أين كان نهائي كأس العالم 2010 الذي فازت به إسبانيا؟', o: ['Sudáfrica', 'Brasil', 'Alemania', 'Qatar'], ok: 0 },
  { cat: 'Mundiales', q: 'من سجل هدف اسبانيا في نهائي كأس العالم 2010؟', o: ['أندريس إنييستا', 'ديفيد فيلا', 'سيسك فابريجاس', 'فرناندو توريس'], ok: 0 },
  { cat: 'Mundiales', q: 'من هو المنتخب الذي فاز بكأس العالم 2018 في روسيا؟', o: ['Francia', 'Croacia', 'Bélgica', 'Inglaterra'], ok: 0 },
  { cat: 'Mundiales', q: 'من هو الفريق الذي نظم وفاز بكأس العالم 1998؟', o: ['Francia', 'Brasil', 'Italia', 'Alemania'], ok: 0 },
  { cat: 'Mundiales', q: 'في أي ملعب أقيمت بطولة كأس العالم 2014 التي فازت بها ألمانيا؟', o: ['Maracaná', 'Wembley', 'ملعب ازتيك', 'أليانز أرينا'], ok: 0 },
  { cat: 'Mundiales', q: 'من سجل الهدف الوحيد في نهائي كأس العالم 2026؟', o: ['فيران توريس', 'نيكو ويليامز', 'لامين يامال', 'Rodri'], ok: 0 },
  { cat: 'Mundiales', q: 'من هو الفريق الذي فازت عليه إسبانيا في نهائي كأس العالم 2026؟', o: ['Argentina', 'Francia', 'Brasil', 'Inglaterra'], ok: 0 },

  { cat: 'Presente', q: 'ما هي جنسية كيليان مبابي ؟', o: ['Francesa', 'Belga', 'Española', 'Portuguesa'], ok: 0 },
  { cat: 'Presente', q: 'ما هي جنسية إيرلينج هالاند؟', o: ['Noruega', 'Suecia', 'Dinamarca', 'Islandia'], ok: 0 },
  { cat: 'Presente', q: 'ما هي جنسية روبرت ليفاندوفسكي؟', o: ['Polonia', 'Alemania', 'Croacia', 'الجمهورية التشيكية'], ok: 0 },
  { cat: 'Presente', q: 'ما هي جنسية نيمار؟', o: ['Brasil', 'Argentina', 'Portugal', 'Uruguay'], ok: 0 },
  { cat: 'Presente', q: 'من أي بلد ينتمي حارس المرمى تيبو كورتوا؟', o: ['Bélgica', 'Francia', 'هولندا', 'Alemania'], ok: 0 },
  { cat: 'Presente', q: 'من هو الجناح الإسباني الشاب الذي ظهر لأول مرة في كأس أوروبا بعمر 16 عامًا و338 يومًا؟', o: ['لامين يامال', 'Pedri', 'Gavi', 'نيكو ويليامز'], ok: 0 },
  { cat: 'Presente', q: 'من تم اختياره كأفضل لاعب في كأس العالم 2026؟', o: ['Rodri', 'لامين يامال', 'فيران توريس', 'أوناي سيمون'], ok: 0 },
  { cat: 'Presente', q: 'من فاز بالحذاء الذهبي لكأس العالم 2026 الثانية في مسيرته؟', o: ['كيليان مبابي', 'ليونيل ميسي', 'لامين يامال', 'هاري كين'], ok: 0 },
  { cat: 'Presente', q: 'من هو حارس المرمى الأرجنتيني الذي كان أساسيًا في بطولة كوبا أمريكا 2024؟', o: ['إميليانو "ديبو" مارتينيز', 'فرانكو ارماني', 'جيرونيمو رولي', 'خوان موسو'], ok: 0 },
  { cat: 'Presente', q: 'من هو الفريق الذي فاز بكوبا أمريكا 2024؟', o: ['Argentina', 'Brasil', 'Colombia', 'Uruguay'], ok: 0 },
]


const REGISTRO = Symbol.for('flash.futbol.partidas.v2')
const partidas = (globalThis[REGISTRO] ||= new Map())

function mismaConexion(a, b) {
  if (a === b) return true
  const ids = c => [c?.user?.jid, c?.user?.id, c?.user?.lid]
    .filter(v => typeof v === 'string' && v.includes('@'))
    .map(v => v.replace(/:\d+@/, '@').replace(/@c\.us$/, '@s.whatsapp.net'))
  return ids(a).some(id => ids(b).includes(id))
}

function citaDe(m) {
  const context = m.msg?.contextInfo || m.message?.extendedTextMessage?.contextInfo || {}
  return {
    id: m.quoted?.id || m.quoted?.key?.id || context.stanzaId,
    chat: m.quoted?.chat || m.quoted?.key?.remoteJid || context.remoteJid,
  }
}

function textoDeRespuesta(m) {
  let message = m.message || {}
  for (let i = 0; i < 5; i++) {
    const inner = message.ephemeralMessage?.message || message.viewOnceMessage?.message || message.viewOnceMessageV2?.message
    if (!inner) break
    message = inner
  }
  if (message.interactiveResponseMessage || message.buttonsResponseMessage || message.templateButtonReplyMessage
    || m.msg?.nativeFlowResponseMessage || m.msg?.selectedButtonId || m.msg?.selectedId
    || ['interactiveResponseMessage', 'buttonsResponseMessage', 'templateButtonReplyMessage'].includes(m.mtype)) return ''
  const texto = m.text || m.body || message.conversation || message.extendedTextMessage?.text || m.msg?.text
  return typeof texto === 'string' ? texto.trim() : ''
}

async function reaccionar(m, conn, emoji) {
  try {
    if (typeof m.react === 'function') return await m.react(emoji)
  } catch {}
  const key = m.key || (m.id ? { remoteJid: m.chat, id: m.id, fromMe: !!m.fromMe, participant: m.sender } : null)
  if (!key?.id) return
  try { await conn.sendMessage(m.chat, { react: { text: emoji, key } }) } catch {}
}

async function enviarTexto(conn, chat, text, contextInfo = {}) {
  const key = { remoteJid: chat, fromMe: true, id: `3EB0${randomBytes(9).toString('hex').toUpperCase()}` }
  await conn.relayMessage(chat, { extendedTextMessage: { text, contextInfo } }, { messageId: key.id })
  return key
}

async function desfijarPanel(m, ctx, partida) {
  if (!partida.fijada) return
  partida.fijada = false
  try { await ctx.conn.sendMessage(m.chat, { pin: partida.panelKey, type: 2, time: 0 }) }
  catch (error) { console.warn('[futbol] No se pudo desfijar:', error?.message || error) }
}

async function fijarPanel(m, ctx, partida) {
  if (partida.pinIntentado || !partida.panelKey) return
  partida.pinIntentado = true
  try {
    await ctx.conn.sendMessage(m.chat, { pin: partida.panelKey, type: 1, time: 86400 })
    partida.fijada = true
    if (partida.cerrada || partidas.get(m.chat) !== partida) await desfijarPanel(m, ctx, partida)
  } catch (error) {
    console.warn('[futbol] No se pudo fijar:', error?.message || error)
    partida.avisoFijado = '📌 لم أتمكن من ضبط اللعبة. تحقق من أذونات الروبوت (قد تحتاج إلى أن تكون مسؤولاً) أو قم بتثبيت هذه الرسالة يدويًا.'
    await actualizarPanel(m, ctx, partida, () => partida.textoPanel, () => partida.mencionesPanel || [])
  }
}

function normalizarIdentidad(value) {
  if (typeof value !== 'string') return ''
  const jid = value.replace(/:\d+@/, '@').replace(/@c\.us$/, '@s.whatsapp.net')
  if (/^\d+@(s\.whatsapp\.net|lid)$/.test(jid)) return jid
  return /^\+?\d+$/.test(jid) ? `${jid.replace('+', '')}@s.whatsapp.net` : ''
}

function identidades(persona) {
  return [...new Set([persona?.id, persona?.jid, persona?.lid, persona?.phoneNumber, persona?.pn, persona?.phone]
    .map(normalizarIdentidad).filter(Boolean))]
}

function identidadesMensaje(m) {
  return [m.sender, m.participant, m.key?.participant, m.key?.participantAlt]
    .map(normalizarIdentidad).filter(Boolean)
}

function equipoDe(partida, m) {
  const ids = identidadesMensaje(m)
  return partida.equipos?.find(e => e.ids.some(id => ids.includes(id)))
}

function textoEquipos(partida) {
  return partida.equipos.map(e => `${e.color} *Equipo ${e.nombre}:* @${e.jid.split('@')[0]}`).join('\n')
}

function textoInvitacion(partida) {
  return [
    '⚽ *تحدي كرة القدم!*', '', textoEquipos(partida), '',
    `🎯 ${partida.total} preguntas · 40 segundos por pregunta`,
    'كل لاعب لديه محاولة واحدة لكل سؤال. الإجابة الصحيحة الأولى تضيف نقطة واحدة.',
    'إذا فشلت، فلا يزال بإمكان الخصم الإجابة. من يحصل على الإجابات الصحيحة يفوز.', '',
    `🔴 @${partida.equipos[1].jid.split('@')[0]}، اكتب *قبول* أو *رفض* بدون بادئة.`,
    `⏳ La invitación vence en ${INVITACION_SEGUNDOS} segundos.`,
    '🔵 يمكن للمدعو كتابة *إلغاء*.',
  ].join('\n')
}

async function editarInvitacion(m, ctx, partida, text) {
  const mentions = partida.equipos.map(e => e.jid)
  try {
    await ctx.conn.sendMessage(m.chat, { text, mentions, edit: partida.invitacionKey })
  } catch (error) {
    console.warn('[futbol] No se pudo editar la invitación:', error?.message || error)
    await ctx.conn.reply(m.chat, text, null, { mentions })
  }
}

async function cancelarInvitacion(m, ctx, partida, motivo) {
  if (partidas.get(m.chat) !== partida || partida.fase !== 'pendiente') return
  partida.fase = 'cerrada'
  partida.cerrada = true
  terminarTimers(partida)
  partidas.delete(m.chat)
  try { await editarInvitacion(m, ctx, partida, `⚽ *Invitación ${motivo}*\n\n${textoEquipos(partida)}\n\nPuedes crear otro duelo con *.futbol @persona*.`) }
  catch (error) { console.warn('[futbol] Invitación:', error?.message || error) }
}

async function procesarInvitacion(m, ctx, partida, entrada) {
  if (!m.isGroup || partida.fase !== 'pendiente' || !partida.invitacionKey || !mismaConexion(ctx.conn, partida.conn)) return
  if (partidas.get(m.chat) !== partida) return
  const quoted = citaDe(m)
  if (quoted.id && quoted.id !== partida.invitacionKey.id) return
  if (quoted.chat && quoted.chat !== m.chat) return
  const accion = String(entrada || '').trim().toLowerCase()
  const equipo = equipoDe(partida, m)
  if (accion === 'cancelar' && (equipo?.nombre === 'Azul' || ctx.isAdmin || ctx.isOwner)) {
    return cancelarInvitacion(m, ctx, partida, 'cancelada')
  }
  if (equipo?.nombre !== 'Rojo' || !['acepto', 'rechazo'].includes(accion)) return
  if (Date.now() >= partida.expiraInvitacion) return cancelarInvitacion(m, ctx, partida, 'vencida')
  if (accion === 'rechazo') return cancelarInvitacion(m, ctx, partida, 'rechazada')
  partida.fase = 'jugando'
  terminarTimers(partida)
  try {
    await reaccionar(m, ctx.conn, '🤝')
    await editarInvitacion(m, ctx, partida, [
      '⚽ *تم قبول المبارزة!*', '', textoEquipos(partida), '',
      `🎯 ${partida.total} preguntas · 1 punto por acierto · 1 intento por pregunta`,
      'فقط juegan los dos equipos. Escriban a/b/c/d o el texto de la opción, sin prefijo ni citar.',
      '❌ الفشل يستنفد محاولتك للإجابة على هذا السؤال. 🚫 انتظر القادم.',
      'وفي حالة تساوي النجاحات تكون النتيجة التعادل.',
    ].join('\n'))
    if (partidas.get(m.chat) === partida && !partida.cerrada) await siguientePregunta(m, ctx, partida)
  } catch (error) { await falloPanel(m, ctx, partida, error) }
}

async function invitarDuelo(m, ctx) {
  const mentions = [...new Set((m.mentionedJid || []).map(normalizarIdentidad).filter(Boolean))]
  if (mentions.length !== 1) return ctx.conn.reply(m.chat, '⚽ Menciona a una sola persona: *.futbol @persona* (o *.futbol @persona 5*).')
  const participantes = (ctx.participants?.length ? ctx.participants : ctx.groupMetadata?.participants) || []
  const rival = participantes.find(p => identidades(p).includes(mentions[0]))
  if (!rival) return ctx.conn.reply(m.chat, '⚽ لم أتمكن من التحقق من أن الشخص المذكور ينتمي إلى المجموعة. اذكر أحد أعضاء المجموعة.')
  const propios = identidadesMensaje(m)
  const autor = participantes.find(p => identidades(p).some(id => propios.includes(id)))
  const azulIds = [...new Set([...propios, ...identidades(autor)])]
  const rojoIds = [...new Set([mentions[0], ...identidades(rival)])]
  if (azulIds.some(id => rojoIds.includes(id))) return ctx.conn.reply(m.chat, '⚽ لا يمكنك تحدي نفسك. اذكر شخصًا آخر.')
  if (identidades(ctx.conn.user).some(id => rojoIds.includes(id))) return ctx.conn.reply(m.chat, '🤖 لا أستطيع قبول التحديات. اذكر لاعبًا آخر في المجموعة.')
  const cantidad = (ctx.args || []).find(arg => /^\d+$/.test(arg))
  const total = Math.min(Math.max(Number(cantidad) || MAX_PREGUNTAS_DUELO, 1), MAX_PREGUNTAS_DUELO, BANCO.length)
  const equipos = [
    { jid: normalizarIdentidad(m.sender), ids: azulIds, nombre: 'Azul', color: '🔵' },
    { jid: mentions[0], ids: rojoIds, nombre: 'Rojo', color: '🔴' },
  ]
  const nueva = {
    duelo: true, fase: 'pendiente', equipos, total, indice: 1,
    preguntas: barajar(BANCO).slice(0, total), actual: null,
    jugadores: Object.fromEntries(equipos.map(e => [e.jid, { nombre: e.nombre, puntos: 0, aciertos: 0, fallos: 0 }])),
    creador: m.sender, conn: ctx.conn, responder, procesarInvitacion,
    timer: null, aviso: null, siguiente: null, timerInvitacion: null,
    panelKey: null, colaPanel: Promise.resolve(), cerrada: false, aceptando: false,
  }
  partidas.set(m.chat, nueva)
  try {
    nueva.invitacionKey = await enviarTexto(ctx.conn, m.chat, textoInvitacion(nueva), { mentionedJid: equipos.map(e => e.jid) })
    nueva.expiraInvitacion = Date.now() + INVITACION_SEGUNDOS * 1000
    if (partidas.get(m.chat) !== nueva || nueva.cerrada) return
    nueva.timerInvitacion = setTimeout(() => {
      cancelarInvitacion(m, ctx, nueva, 'vencida').catch(error => console.warn('[futbol] Invitación:', error?.message || error))
    }, INVITACION_SEGUNDOS * 1000)
    await reaccionar(m, ctx.conn, '⚔️')
  } catch (error) { await falloPanel(m, ctx, nueva, error) }
}

const aleatorio = (n) => Math.floor(Math.random() * n)

function barajar(lista) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = aleatorio(i + 1)
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function nombreDe(conn, m) {
  const desdeConn = conn?.getName?.(m.sender)
  return desdeConn || m.pushName || String(m.sender || '').split('@')[0]
}

function prepararPregunta(ficha) {
  const opciones = barajar(ficha.o)
  return {
    ficha,
    opciones,
    correcta: LETRAS[opciones.indexOf(ficha.o[ficha.ok])],
    preguntadaEn: Date.now(),
    intentos: new Map(),
    mensajes: new Set(),
  }
}

function textoPregunta(p, indice, total, partida) {
  return [
    `⚽ *ADIVINA EL JUGADOR* — pregunta ${indice}/${total}`,
    ``, `🏷️ ${p.ficha.cat}`, `❓ *${p.ficha.q}*`, ``,
    ...p.opciones.map((op, i) => `${LETRAS[i]}. ${op}`),
    ``, `⏱️ *${LIMITE_SEGUNDOS} segundos*`,
    `✍️ اكتب *a، b، c أو d* (أو نص الخيار) مباشرة في المجموعة. *بدون بادئة أو اقتباسات للرسائل.*`,
    partida?.duelo ? '🎯 نقطة واحدة للفريق الأول ليقوم بذلك بشكل صحيح.' : `🎯 ${PUNTOS_BASE} pts + hasta ${PUNTOS_BONUS} de bonus por rapidez`,
    partida?.duelo ? '🔵 vs 🔴 · *محاولة واحدة لكل لاعب في هذا السؤال.* إذا فشلت، يمكن للخصم الإجابة.' : '🥇 أول من يفعل ذلك بشكل صحيح يفوز. *محاولات غير محدودة لكل لاعب عندما يكون السؤال نشطًا.*',
  ].join('\n')
}

function puntosPor(segundosUsados) {
  const restantes = Math.max(0, LIMITE_SEGUNDOS - segundosUsados)
  return Math.round(PUNTOS_BASE + (PUNTOS_BONUS * restantes) / LIMITE_SEGUNDOS)
}

function medalla(puesto) {
  return ['🥇', '🥈', '🥉'][puesto] || '▫️'
}

function rankingDe(partida) {
  return Object.entries(partida.jugadores)
    .map(([jid, j]) => ({ jid, ...j }))
    .sort((a, b) => b.puntos - a.puntos || b.aciertos - a.aciertos)
}

function textoMarcador(partida) {
  if (partida.duelo) return ['📊 *علامة المبارزة*', ...partida.equipos.map(e => {
    const j = partida.jugadores[e.jid]
    return `${e.color} *${e.nombre}* @${e.jid.split('@')[0]} — *${j.aciertos} aciertos* · ${j.fallos} fallos`
  })].join('\n')
  const ranking = rankingDe(partida).slice(0, 10)
  return ranking.length ? [
    '📊 *MARCADOR*',
    ...ranking.map((j, i) => `${medalla(i)} @${j.jid.split('@')[0]} — *${j.puntos} pts* (${j.aciertos} ✅ / ${j.fallos} ❌)`),
  ].join('\n') : '📊 لم يسجل أحد النقاط بعد.'
}

function terminarTimers(partida) {
  for (const key of ['timer', 'aviso', 'siguiente', 'timerInvitacion']) {
    if (partida[key]) clearTimeout(partida[key])
    partida[key] = null
  }
}

async function falloPanel(m, ctx, partida, error) {
  if (partida.errorNotificado) return
  partida.errorNotificado = true
  partida.cerrada = true
  partida.actual = null
  partida.aceptando = false
  terminarTimers(partida)
  await desfijarPanel(m, ctx, partida)
  if (partidas.get(m.chat) === partida) partidas.delete(m.chat)
  console.error('[futbol] No se pudo actualizar el panel:', error?.message || error)
  try {
    await ctx.conn.reply(m.chat, '⚠️ لم أتمكن من تحديث رسالة كرة القدم. تم إيقاف اللعبة لتجنب الرسائل المتكررة. يمكنك البدء بواحدة أخرى بامتداد .futbol.')
  } catch {}
}

async function actualizarPanel(m, ctx, partida, texto, menciones = [], { final = false, vigente = () => true } = {}) {
  const tarea = (partida.colaPanel || Promise.resolve()).then(async () => {
    if (partida.errorNotificado || !vigente()) return false
    if (!final && (partida.cerrada || partidas.get(m.chat) !== partida)) return false
    const base = typeof texto === 'function' ? texto() : texto
    const nombres = typeof menciones === 'function' ? menciones() : menciones
    const ranking = final ? [] : rankingDe(partida).slice(0, 10)
    const mentions = [...new Set([...nombres, ...ranking.map(j => j.jid)])]
    const text = final ? base : `${base}\n\n${textoMarcador(partida)}${partida.avisoFijado ? `\n\n${partida.avisoFijado}` : ''}`
    try {
      if (partida.panelKey) {
        await ctx.conn.sendMessage(m.chat, { text, mentions, edit: partida.panelKey })
      } else {
        partida.panelKey = await enviarTexto(ctx.conn, m.chat, text, { mentionedJid: mentions })
      }
      partida.textoPanel = base
      partida.mencionesPanel = nombres
      return true
    } catch (error) {
      await falloPanel(m, ctx, partida, error)
      return false
    }
  })
  partida.colaPanel = tarea
  return tarea
}

async function tablaDe(partida, conn, m) {
  if (!partida.panelKey) return
  return actualizarPanel(m, { conn }, partida, () => partida.textoPanel, () => partida.mencionesPanel || [])
}


async function cerrarPartida(m, ctx, partida, motivo) {
  if (partidas.get(m.chat) !== partida || partida.cerrada) return
  if (partida.fase === 'pendiente') return cancelarInvitacion(m, ctx, partida, 'cancelada')
  partida.cerrada = true
  partida.actual = null
  partida.aceptando = false
  terminarTimers(partida)
  partidas.delete(m.chat)
  await desfijarPanel(m, ctx, partida)
  if (partida.duelo) {
    const [azul, rojo] = partida.equipos
    const a = partida.jugadores[azul.jid].aciertos
    const r = partida.jugadores[rojo.jid].aciertos
    const terminado = motivo === 'se acabaron las preguntas'
    const ganador = a > r ? azul : rojo
    const resultado = !terminado ? 'تم إلغاء مبارزة ⏹️: نتيجة جزئية، لا يوجد فائز.'
      : a === r ? `🤝 *¡EMPATE!* ${a}–${r}`
      : `🏆 *¡GANA EL EQUIPO ${ganador.nombre.toUpperCase()}!* ${ganador.color} @${ganador.jid.split('@')[0]}`
    return actualizarPanel(m, ctx, partida, [
      terminado ? '⚽ *نهاية المبارزة!*' : '⚽ *تم إلغاء المبارزة*', '', resultado, '',
      textoMarcador(partida), '', '⚽ ¿Revancha? *.futbol @persona*',
    ].join('\n'), partida.equipos.map(e => e.jid), { final: true })
  }
  const ranking = rankingDe(partida)
  if (!ranking.length) {
    return actualizarPanel(m, ctx, partida,
      `⚽ * انتهت المباراة * (${motivo})

لم يسجل أحد. 😅

عندما تريد واحدة أخرى: *.futbol*`, [], { final: true })
  }
  const [campeon, ...resto] = ranking
  const lineas = [
    `🏆 *¡FIN DEL PARTIDO!* ${motivo}`, ``,
    `🥇 @${campeon.jid.split('@')[0]} gana con *${campeon.puntos} puntos* (${campeon.aciertos} aciertos de ${partida.total})`,
  ]
  if (resto.length) {
    lineas.push('', '*باقي العلامة:*')
    resto.slice(0, 9).forEach((j, i) => lineas.push(`${medalla(i + 1)} @${j.jid.split('@')[0]} — ${j.puntos} pts`))
  }
  lineas.push('', '⚽ الانتقام؟ *.كرة القدم*')
  return actualizarPanel(m, ctx, partida, lineas.join('\n'), ranking.slice(0, 10).map(j => j.jid), { final: true })
}

function programarSiguiente(m, ctx, partida) {
  if (partidas.get(m.chat) !== partida || partida.cerrada) return
  partida.indice++
  partida.siguiente = setTimeout(() => {
    partida.siguiente = null
    siguientePregunta(m, ctx, partida).catch(error => falloPanel(m, ctx, partida, error))
  }, ESPERA_SIGUIENTE)
}

async function agotarPregunta(m, ctx, partida, actual, aviso = '⏰ *انتهى الوقت!*') {
  if (partidas.get(m.chat) !== partida || partida.actual !== actual || !partida.aceptando) return
  partida.actual = null
  partida.aceptando = false
  terminarTimers(partida)
  const publicado = await actualizarPanel(m, ctx, partida, [
    aviso, '',
    `الجواب كان *${actual.correcta}. ${actual.opciones[LETRAS.indexOf(actual.correcta)]}*`, '',
    partida.indice < partida.total ? 'السؤال التالي... ⚽' : 'احتساب النتيجة النهائية...',
  ].join('\n'))
  if (publicado) programarSiguiente(m, ctx, partida)
}

async function siguientePregunta(m, ctx, partida) {
  if (partidas.get(m.chat) !== partida || partida.cerrada) return
  if (partida.indice > partida.total) return cerrarPartida(m, ctx, partida, 'انتهت الأسئلة')

  const actual = prepararPregunta(partida.preguntas[partida.indice - 1])
  partida.actual = actual
  partida.aceptando = false
  const publicado = await actualizarPanel(m, ctx, partida, textoPregunta(actual, partida.indice, partida.total, partida), [], {
    vigente: () => partida.actual === actual,
  })
  if (!publicado || partidas.get(m.chat) !== partida || partida.actual !== actual || partida.cerrada) return
  await fijarPanel(m, ctx, partida)
  if (partida.cerrada || partidas.get(m.chat) !== partida || partida.actual !== actual) return
  actual.preguntadaEn = Date.now()
  partida.aceptando = true
  partida.aviso = setTimeout(() => {
    avisarTiempo(m, ctx, partida, actual).catch(error => console.warn('[futbol] Aviso:', error?.message || error))
  }, (LIMITE_SEGUNDOS - AVISO_EN_SEGUNDOS) * 1000)
  partida.timer = setTimeout(() => {
    agotarPregunta(m, ctx, partida, actual).catch(error => falloPanel(m, ctx, partida, error))
  }, LIMITE_SEGUNDOS * 1000)
}

async function avisarTiempo(m, ctx, partida, actual) {
  if (partidas.get(m.chat) !== partida || partida.actual !== actual || !partida.aceptando || actual.avisoEnviado) return
  actual.avisoEnviado = true
  const contextInfo = {
    stanzaId: partida.panelKey.id,
    quotedMessage: { extendedTextMessage: { text: partida.textoPanel } },
  }
  const botJid = ctx.conn.user?.jid || ctx.conn.user?.id
  if (botJid) contextInfo.participant = botJid
  actual.avisoKey = await enviarTexto(ctx.conn, m.chat,
    `⏳⚽ ¡Quedan *${AVISO_EN_SEGUNDOS} segundos* para la pregunta ${partida.indice}/${partida.total}!\nEscribe *a, b, c o d* directamente en el grupo, *sin prefijo ni citar*. ${partida.duelo ? '*محاولة واحدة لكل فريق* على هذا السؤال.' : '*محاولات غير محدودة* حتى انتهاء السؤال.'}`, contextInfo)
}


async function responder(m, ctx, partida, entrada) {
  const actual = partida.actual
  if (!actual || !partida.aceptando || partida.cerrada || partidas.get(m.chat) !== partida) return
  if (!m.isGroup || !mismaConexion(ctx.conn, partida.conn) || !m.sender) return
  const quoted = citaDe(m)
  const permitidas = [partida.panelKey?.id, actual.avisoKey?.id].filter(Boolean)
  if (quoted.id && !permitidas.includes(quoted.id)) return
  if (quoted.chat && quoted.chat !== m.chat) return
  if (Date.now() - actual.preguntadaEn >= LIMITE_SEGUNDOS * 1000) {
    return agotarPregunta(m, ctx, partida, actual)
  }
  const equipo = partida.duelo ? equipoDe(partida, m) : null
  if (partida.duelo && !equipo) return
  const jugador = equipo?.jid || m.sender
  const texto = String(entrada || '').trim()
  if (/^[#!./]/.test(texto)) return
  const letra = /^[a-d]$/i.exec(texto)
  let elegida
  if (letra) elegida = letra[0].toUpperCase()
  else {
    const buscado = normalizar(texto)
    if (buscado.length < 3) return
    const i = actual.opciones.findIndex(op => normalizar(op) === buscado)
    if (i < 0) return
    elegida = LETRAS[i]
  }
  const messageId = m.key?.id || m.id
  const evento = messageId ? `${jugador}:${messageId}` : null
  if (evento && actual.mensajes.has(evento)) return
  if (evento) actual.mensajes.add(evento)
  const usados = actual.intentos.get(jugador) || 0
  if (partida.duelo && usados >= 1) {
    await reaccionar(m, ctx.conn, '🚫')
    return
  }
  actual.intentos.set(jugador, usados + 1)
  const j = (partida.jugadores[jugador] ||= {
    nombre: nombreDe(ctx.conn, m), puntos: 0, aciertos: 0, fallos: 0,
  })
  if (elegida !== actual.correcta) {
    j.fallos++
    const ambosFallaron = partida.duelo && partida.equipos.every(e => (actual.intentos.get(e.jid) || 0) >= 1)
    if (ambosFallaron) {
      await Promise.all([
        reaccionar(m, ctx.conn, '❌'),
        agotarPregunta(m, ctx, partida, actual, '❌ *فشل كلا الفريقين. لا أحد يضيف إلى هذا السؤال.*'),
      ])
    } else await reaccionar(m, ctx.conn, '❌')
    return
  }
  partida.actual = null
  partida.aceptando = false
  terminarTimers(partida)
  const segundos = (Date.now() - actual.preguntadaEn) / 1000
  const ganados = partida.duelo ? 1 : puntosPor(segundos)
  j.puntos += ganados
  j.aciertos++
  await reaccionar(m, ctx.conn, '✅')
  const publicado = await actualizarPanel(m, ctx, partida, [
    `${equipo ? `${equipo.color} ` : ''}⚽🎉 *¡GOL de @${jugador.split('@')[0]}!*`, '',
    `✅ ${actual.correcta}. ${actual.opciones[LETRAS.indexOf(actual.correcta)]}`,
    partida.duelo ? `✅ *+1 acierto para el equipo ${equipo.nombre}* (total: ${j.aciertos})` : `⚡ ${segundos.toFixed(1)}s → *+${ganados} puntos* (total: ${j.puntos})`, '',
    partida.indice < partida.total ? 'Siguiente...' : 'احتساب النتيجة النهائية...',
  ].join('\n'), [jugador])
  if (publicado) programarSiguiente(m, ctx, partida)
}


let handler = async (m, ctx) => {
  const { conn, command, args } = ctx
  const partida = partidas.get(m.chat)
  if (partida && !mismaConexion(partida.conn, conn)) return

  if (command === 'marcador' || command === 'tabla') {
    if (!partida) return conn.reply(m.chat, '⚽ لا توجد مباراة في اللعب.\n\nابدأ بـ *.futbol*')
    return tablaDe(partida, conn, m)
  }
  if (command === 'terminar' || command === 'finpartido') {
    if (!partida) return conn.reply(m.chat, '⚽ لا توجد مباراة في اللعب.')
    if (partida.duelo && !equipoDe(partida, m) && !(ctx.isAdmin || ctx.isOwner)) return
    return cerrarPartida(m, ctx, partida, 'قطعوها')
  }
  if (['futbol', 'futbolito', 'adivinafutbol', 'adivinajugador', 'quienjugador', 'trivalfutbol'].includes(command)) {
    if (partida) {
      if (partida.fase === 'pendiente' && partida.invitacionKey) return editarInvitacion(m, ctx, partida, textoInvitacion(partida))
      return tablaDe(partida, conn, m)
    }
    if (m.mentionedJid?.length) return invitarDuelo(m, ctx)
    let total = parseInt(args?.[0], 10)
    if (!Number.isFinite(total) || total < 1) total = 10
    total = Math.min(total, MAX_PREGUNTAS, BANCO.length)
    const nueva = {
      preguntas: barajar(BANCO).slice(0, total), total, indice: 1,
      actual: null, jugadores: {}, creador: m.sender, conn, responder,
      timer: null, aviso: null, siguiente: null,
      panelKey: null, colaPanel: Promise.resolve(), cerrada: false, aceptando: false,
    }
    partidas.set(m.chat, nueva)
    try {
      await reaccionar(m, conn, '⚽')
      await conn.reply(m.chat, [
        '⚽🏆 *خمن بداية اللاعب!*', '',
        `🎯 ${total} preguntas sobre los grandes del fútbol`,
        `⏱️ ${LIMITE_SEGUNDOS} segundos por pregunta`,
        '✍️ اكتب *a* أو *b* أو *c* أو *d* مباشرة في المجموعة.',
        '🎯 لديك *محاولات غير محدودة* عندما يكون السؤال نشطًا. أول من يفعل ذلك بشكل صحيح يفوز.',
        'لا تحتاج إلى بادئة أو أزرار أو اقتباس لأي رسالة.',
        'يمكنك أيضًا الرد بالنص الدقيق للخيار.',
        '🔄 سيتم تحرير نفس اللوحة أثناء اللعبة.',
        '📌 سأحاول تثبيته على المجموعة وإلغاء تثبيته عندما أنتهي.',
        '⏳ سأرسل إشعارًا منفصلاً عندما يتبقى 10 ثوانٍ.',
        'نجاح ✅ · فشل ❌: يمكنك المحاولة مرة أخرى.',
        `🎁 ${PUNTOS_BASE} puntos + hasta ${PUNTOS_BONUS} de bonus por rapidez`, '',
        '📊 *.marker* يقوم بتحديث اللوحة ⏹️ *.end* للقطع', '',
        'دعنا نذهب مع الأول! 🔥',
      ].join('\n'))
      return await siguientePregunta(m, ctx, nueva)
    } catch (error) {
      return falloPanel(m, ctx, nueva, error)
    }
  }
  return conn.reply(m.chat, [
    '⚽ *احزر اللاعب*', '',
    `Trivial de fútbol con 4 opciones y ${LIMITE_SEGUNDOS} segundos por pregunta.`, '',
    '*.futbol @persona* — duelo azul vs rojo de 7 preguntas',
    '*.futbol @persona 5* — duelo de 5 preguntas (máximo 7)',
    'El rival debe escribir acepto o rechazo en 60 segundos. Un intento por pregunta y 1 punto por acierto; empate si igualan.',
    '*.futbol* — لعبة جماعية مكونة من 10 أسئلة',
    `*.futbol 15* — partida de 15 (máx. ${MAX_PREGUNTAS})`,
    'اكتب a/b/c/d أو نص الاختيار بالظبط في الجروب.',
    'Sin prefijo ni citar mensajes. En el juego grupal hay intentos ilimitados; en el duelo, uno por pregunta.',
    'يتم تحرير الأسئلة والنتيجة في اللوحة المثبتة.',
    'ومع مرور الثواني العشر المتبقية، يصل تحذير منفصل. ✅ صحيح · ❌ يمكنك المحاولة مرة أخرى.',
    '*.marker* — يقوم بتحديث الجدول الموجود في اللوحة',
    '*.finish* — قم بالقص ورؤية الفائز', '',
    `${BANCO.length} preguntas sobre grandes del fútbol. 🌍`,
  ].join('\n'))
}

handler.help = ['futbol @persona [preguntas]', 'futbol [preguntas]', 'marcador', 'terminar']
handler.tags = ['game']
handler.command = ['futbol', 'futbolito', 'adivinafutbol', 'adivinajugador', 'quienjugador', 'trivalfutbol', 'marcador', 'terminar', 'finpartido', 'futbolayuda']
handler.group = true

export { BANCO, partidas, barajar, normalizar, prepararPregunta, puntosPor, textoPregunta, siguientePregunta, cerrarPartida, responder, citaDe, textoDeRespuesta, procesarInvitacion, MAX_PREGUNTAS_DUELO, INVITACION_SEGUNDOS, LIMITE_SEGUNDOS, PUNTOS_BASE, PUNTOS_BONUS, MAX_PREGUNTAS }
export default handler
