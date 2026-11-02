const VARIANTS = {
  v1: { id: 1, name: 'الظل الأصلي', desc: 'النص العادي الأصلي للبوت (محفوظ)', emoji: '🌌' },
  v2: { id: 2, name: 'PREMIUM', desc: 'وثيقة بموعد اتصال مزيف', emoji: '🖼️' },
  v3: { id: 3, name: 'TITANIUM', desc: 'صورة مع تسمية توضيحية (تم تعديلها, وكانت النسخة الأصلية عبارة عن فيديو)', emoji: '📨' },
  v4: { id: 4, name: 'LV', desc: 'النشرة الإخبارية لقناة Vista Previa Con', emoji: '💼' },
  v5: { id: 5, name: 'طلب مزيف', desc: 'الاستجابة كبطاقة طلب (مثل .pedido)', emoji: '🛒' },
  v6: { id: 6, name: 'وثيقة بسيطة', desc: 'مستند يستشهد بالرسالة الأصلية', emoji: '📄' },
  v7: { id: 7, name: 'موقع مزيف', desc: 'نص رسالة الموقع المقتبس وهمية', emoji: '📍' },
  v8: { id: 8, name: 'الاشتراك المزيف', desc: 'نص يحتوي على رسالة سجل مقتبسة كاذبة', emoji: '🥠' },
  v9: { id: 9, name: 'أمر مزيف 2', desc: 'رسالة طلب على نمط الكتالوج', emoji: '🍙' },
  v10: { id: 10, name: 'PAYMENT', desc: 'إيصال الفاتورة (طلب الدفع)', emoji: '💳' },
  v11: { id: 11, name: 'اسم الروبوت المتحرك', desc: 'رسوم متحركة باسم البوت (خطر الحظر)', emoji: '🌀' }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const rawJid = conn.user?.jid || conn.user?.id || conn.user?.lid || ''
  const botJid = String(rawJid).replace(/:\d+@/, '@')
  const botNum = botJid.split('@')[0] || '?'
  const getSettings = () => {
    if (!global.db?.data?.settings) return {}
    if (botJid) {
      if (!global.db.data.settings[botJid]) global.db.data.settings[botJid] = {}
      return global.db.data.settings[botJid]
    }
    return global.db.data.settings
  }
  const persist = () => {
    try {
      if (typeof global.db?.write === 'function') global.db.write().catch(() => {})
    } catch { }
  }
  const variant = (args?.[0] || '').toLowerCase()
  if (variant) {
    const selected = VARIANTS[variant]
    if (!selected) return m.reply(`❌ *متغير غير صالح*\n\nالاستخدام: *v1* إلى *v11*\nمثال: *${usedPrefix}${command} v5*`)
    const s = getSettings()
    s.replyVariant = selected.id
    persist()
    const check = Number(getSettings().replyVariant || 0)
    let warn = ''
    if (selected.id === 11) warn = `\n\n⚠ *تحذير الإصدار 11:*\n_قد يؤدي استخدام هذه الرسوم المتحركة إلى حظر الأرقام والبطء والبريد العشوائي في وحدة التحكم._`
    return m.reply(`✅ *متغير الإجابة المتغير*\n\n${selected.emoji} *V${selected.id} — ${selected.name}*\n_${selected.desc}_\n> تم الحفظ: *V${check}* (إذا وصلت هذه الرسالة نفسها بالفعل مع عرض أسعار مزيف, فسيعمل النظام)` + warn + `\n\n> قم بالتحقق باستخدام أمر يستخدم *m.reply* (على سبيل المثال, اكتب *${usedPrefix}setreply* بدون وسيطات).\n> تستخدم القوائم (.menu, .allmenu, .ping) الصورة + الإرسال المباشر و *لا* تتغير باستخدام setreply, فهذا أمر طبيعي.`)
  }
  const s = getSettings()
  const current = Number(s.replyVariant || 1)
  let txt = `💬📨 *متغير الرد — FLASH-BOT*\n\nالروبوت: *${botNum}* 🤖\nالنشاط المتغير: *V${current} — ${VARIANTS['v' + current]?.name || 'Desconocida'}* 🎯\n\n`
  for (const [key, val] of Object.entries(VARIANTS)) {
    const mark = val.id === current ? ' ✓' : ''
    txt += `${val.emoji} *${key.toUpperCase()}${mark}* — ${val.name}\n_${val.desc}_\n\n`
  }
  txt += `⚠ *تحذير:*\n_V11 (الرسوم المتحركة) قد يتسبب في الحظر والبطء والبريد العشوائي على وحدة التحكم._\n\n> استخدم *${usedPrefix}${command} v1* للعودة إلى *الأصل* 🌌\n> مثال: *${usedPrefix}${command} v5*`
  return m.reply(txt)
}

handler.help = ['setreply <v1-v11>']
handler.tags = ['owner']
handler.command = ['setreply', 'replyvariant', 'replystyle']
handler.rowner = true

export default handler
