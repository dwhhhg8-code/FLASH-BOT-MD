/**
 * خريطة الأوامر المصرية — تربط كل أمر عربي بالأمر الأصلي.
 * تُطبّق تلقائيًا في handler.js قبل مطابقة الأوامر.
 * كل الأوامر الأصلية تفضل شغالة, ودي مرادفات إضافية بالعامية المصرية.
 */
export const arabicAliases = {
  // ── القوائم والمساعدة ──
  'قائمه': 'menu', 'القائمه': 'menu', 'قائمة': 'menu', 'منيو': 'menu', 'المينيو': 'menu',
  'كل': 'allmenu', 'كلحاجه': 'allmenu', 'القائمهالكامله': 'allmenu',
  'مساعده': 'help', 'مساعدة': 'help', 'ساعدني': 'help', 'اوامر': 'help', 'الأوامر': 'help',

  // ── أساسيات ──
  'بينج': 'ping', 'اختبار': 'ping', 'سرعه': 'ping',
  'معلومات': 'info', 'معلومه': 'info', 'البوت': 'infobot', 'بوت': 'infobot',
  'المالك': 'ownerlist', 'صاحب': 'ownerlist', 'مالك': 'ownerlist',
  'الملف': 'perfil', 'بروفايل': 'profile', 'حسابي': 'perfil',

  // ── تحميل ──
  'تحميل': 'play', 'نزل': 'play', 'جيب': 'play', 'شغل': 'play',
  'اغنيه': 'playaudio', 'صوت': 'playaudio', 'فيديو': 'playvideo', 'فديو': 'playvideo',
  'يوتيوب': 'ytmp4', 'يوتيوبصوت': 'ytmp3', 'بحثيوتيوب': 'yts',
  'تيكتوك': 'tiktok', 'انستا': 'instagram', 'انستجرام': 'instagram',
  'فيس': 'facebook', 'فيسبوك': 'facebook',

  // ── ملصقات وصور ──
  'ملصق': 'sticker', 'استيكر': 'sticker', 'ستيكر': 'sticker',
  'صورة': 'toimg', 'لصوره': 'toimg', 'رابط': 'tourl', 'لرابط': 'tourl',
  'خلفيه': 'wallpaper', 'خلفيات': 'wallpaper', 'تصوير': 'ssweb',
  'قناه': 'followchannel', 'تابع': 'followchannel',

  // ── المجموعات ──
  'لينك': 'link', 'رابطالمجموعه': 'link',
  'اطرد': 'kick', 'طرد': 'kick', 'شيل': 'kick', 'بره': 'kick',
  'ارفع': 'promote', 'رفع': 'promote', 'ادمن': 'promote', 'مشرف': 'promote',
  'تنزيل': 'demote',
  'حظر': 'ban', 'بلوك': 'ban', 'امنع': 'ban',
  'فك': 'unbanuser', 'الغاءالحظر': 'unbanuser',
  'تحذير': 'warn', 'انذر': 'warn', 'حذر': 'warn',
  'الغاءتحذير': 'unwarn', 'صفح': 'unwarn',
  'كتم': 'mute', 'اسكت': 'mute', 'سكوت': 'mute',
  'افتح': 'unmute', 'اتكلم': 'unmute',
  'منشن': 'tagall', 'نادي': 'tagall', 'الكل': 'tagall', 'نداء': 'tagall',
  'مخفي': 'hidetag', 'منشنمخفي': 'hidetag',
  'مجموعه': 'grouplist', 'جروبات': 'listagrupos', 'قروبات': 'listagrupos',
  'اقفل': 'close', 'اقفال': 'close',
  'ايقاف': 'close', 'إيقاف': 'close', 'وقف': 'close', 'اقفلالشات': 'close',
  'تشغيل': 'open', 'افتحالشات': 'open', 'فتح': 'open',
  'غادر': 'leave', 'اطلع': 'leave', 'خروج': 'leave',

  // ── الاقتصاد ──
  'رصيدي': 'balance', 'فلوسي': 'balance', 'رصيد': 'balance', 'فلوس': 'balance',
  'بنك': 'bank', 'البنك': 'bank', 'خزنه': 'cofre', 'الخزنه': 'cofre',
  'يومي': 'daily', 'اليومي': 'daily', 'مكافأه': 'daily',
  'اشتغل': 'work', 'اشتغلت': 'work', 'وظيفه': 'work',
  'سرقه': 'robar', 'اسرق': 'robar', 'سرق': 'robar',
  'جريمه': 'crime', 'اجرم': 'crime',
  'صيد': 'pescar', 'اصطاد': 'pescar', 'سمك': 'pescar',
  'صيدوحوش': 'cazar', 'اصطد': 'cazar', 'قنص': 'cazar',
  'تعدين': 'minar', 'عدن': 'minar', 'معدن': 'minar',
  'احول': 'pay', 'حول': 'pay', 'دفع': 'pay',
  'تحويل': 'pay', 'حوّل': 'pay',
  'متجر': 'tiendawaifus', 'المتجر': 'tiendawaifus',
  'توب': 'top', 'الافضل': 'top', 'الترتيب': 'baltop',
  'قمار': 'casino', 'كازينو': 'casino', 'روليت': 'roulette',
  'رهان': 'apostar', 'راهن': 'apostar',

  // ── الترفيه والألعاب ──
  'كوره': 'adivinafutbol', 'توقع': 'adivinafutbol',
  'مشنقه': 'ahorcado', 'لعبه': 'ahorcado',
  'لوحه': 'sopa', 'كلمات': 'sopadeletras',
  'حظ': 'suerte', 'طالع': 'suerte',
  'زهر': 'roll', 'ارم': 'roll', 'ارمي': 'roll',
  'ميمز': 'meme', 'ميم': 'meme',
  'شات': 'simi', 'كلمني': 'simi',
  'ذكاء': 'copilot', 'اسال': 'copilot', 'سؤال': 'copilot',

  // ── الرومانسية والزواج ──
  'اتجوز': 'casarse', 'جواز': 'casarse', 'ارتبط': 'casarse',
  'طلاق': 'divorce', 'طلق': 'divorce',
  'حب': 'love', 'بحبك': 'love', 'اعشق': 'love',
  'بوسه': 'besar', 'بوس': 'besar', 'بوسني': 'besar',
  'حضن': 'hug', 'حضني': 'hug', 'عناق': 'hug',
  'طبطب': 'pat', 'ربت': 'pat',
  'قفا': 'bofetada', 'كف': 'bofetada', 'صقع': 'bofetada',
  'اقترب': 'cuddle', 'دلع': 'cuddle',
  'غازل': 'piropo', 'مجامله': 'piropo', 'غزل': 'piropo',
  'صاحبي': 'hug',

  // ── التفاعل ──
  'قلد': 'say', 'قول': 'say', 'اتكلمفيه': 'say',
  'اقرا': 'readviewonce',
  'اقتبس': 'readviewonce', 'شوف': 'readviewonce',
  'اقلب': 'reaction', 'تفاعل': 'reaction',
  'ترجم': 'translate', 'ترجمه': 'translate', 'اللغه': 'translate',
  'الاغنيه': 'whatmusic', 'شوهاد': 'whatmusic',
  'ريستارت': 'restart', 'اعاده': 'restart',

  // ── الذكاء الاصطناعي ──
  'جيميني': 'gemini', 'ذكاءاصطناعي': 'gemini',
  'جيبيتي': 'chatgpt', 'شاتجيبيتي': 'chatgpt',
  'صورلي': 'cimage', 'ارسم': 'cimage', 'ارسملي': 'cimage',
  'صورهذكاء': 'cvideo', 'فيديوتخيلي': 'cvideo',

  // ── الأنمي ──
  'انمي': 'anime', 'وايفو': 'waifu', 'زوجه': 'waifu',
  'انميصور': 'waifuimage', 'انميفيديو': 'waifuvideo',
  'حريم': 'harem', 'الحريم': 'harem',

  // ── المطور ──
  'اعادهتشغيل': 'restart',
  'سجلات': 'restart', 'اطفي': 'logout',
  'حديث': 'update', 'تحديث': 'update',
  'صلاحيات': 'sologp', 'للمالكفقط': 'soloadmin',
  'سوب': 'subbots', 'بوتفرعي': 'subbots',
  'قيد': 'restrict', 'تقييد': 'restrict',
  'افك': 'unbanchat', 'الغاءقيد': 'unbanchat',
  'بريفيكس': 'setprefix', 'البدايه': 'setprefix', 'بادئه': 'setprefix',
  'اسم': 'setname', 'سميني': 'setname',
  'وصف': 'setbio', 'الوصف': 'setbio',
  'دائم': 'jadibotmd',

  // ── الترحيب والوداع ──
  'ترحيب': 'bienvenida', 'اهلا': 'bienvenida', 'الترحيب': 'setwelcome',
  'وداع': 'despedida', 'مع_السلامه': 'despedida', 'الوداع': 'setbye',

  // ── الأدوات ──
  'كود': 'code', 'الكود': 'code', 'كودالبوت': 'script',
  'تنصيب': 'code', 'التنصيب': 'code', 'نصب': 'code', 'ربط': 'code', 'اربط': 'code', 'اربطالبوت': 'code',
  'مطور': 'ownerlist', 'المطور': 'dsowner',
  'ريبو': 'gitclone', 'نسخ': 'gitclone', 'جيت': 'github',
  'سكريبت': 'script', 'المصدر': 'script',
  'الوان': 'replystyle', 'ستايل': 'replystyle',
  'امسح': 'del', 'مسح': 'del', 'حذف': 'del',
  'ذكرني': 'avisos', 'تنبيه': 'avisos',
  'مسافه': 'checkspace', 'فحص': 'checksyntax',
  'سبيد': 'speed',
  'وضع': 'mode', 'الوضع': 'mode',
  // ── الأنمي (تفاعلات) ──
  'قهوه': 'coffee', 'قهوة': 'coffee', 'فنجان': 'coffee', 'كوسبلاي': 'cosplay', 'تنكر': 'cosplay', 'ارقص': 'dance', 'رقص': 'dance', 'تشخيصانمي': 'animediag', 'تحليلانمي': 'animediag', 'اكل': 'eat', 'اتعشى': 'eat', 'فرحان': 'happy', 'مبسوط': 'happy', 'سلام': 'hello', 'سلامعليكم': 'hello', 'هاي': 'hello', 'استخبى': 'hide', 'اختبى': 'hide', 'اقتل': 'kill', 'موت': 'kill', 'بوسهقويه': 'kiss2', 'بوسهخد': 'kisscheek', 'بوسالخد': 'kisscheek', 'اضحك': 'laugh', 'ضحك': 'laugh', 'اتسند': 'lean', 'استند': 'lean', 'الحس': 'lick', 'لحس': 'lick', 'بص': 'look', 'اتفرج': 'look', 'عض': 'morder', 'عضني': 'morder', 'دللني': 'pampering', 'تدليع': 'pampering', 'عابس': 'pout', 'بوز': 'pout', 'احبل': 'preg', 'حمل': 'preg', 'زعلان': 'sad', 'حزين': 'sad', 'اغوي': 'seduce', 'غاوي': 'seduce', 'دخن': 'smoke', 'سيجاره': 'smoke', 'اتاوب': 'yawn', 'تثاوب': 'yawn',
  // ── التحميل (إضافي) ──
  'تطبيق': 'apk', 'برنامج': 'apk', 'صوتيات': 'audivd', 'ميديافاير': 'mf', 'ميديا': 'mf', 'سبوتيفاي': 'spotify', 'سبوتي': 'spotify', 'تشغيلقناه': 'playch',
  // ── الاقتصاد (إضافي) ──
  'مغامره': 'aventura', 'مغامرة': 'aventura', 'علاج': 'heal', 'دوا': 'heal', 'ايداع': 'deposit', 'اودع': 'deposit', 'معلوماتاقتصاد': 'einfo', 'اقتصاد': 'einfo', 'شهري': 'monthly', 'الشهري': 'monthly', 'كريسماس': 'christmas', 'هالوين': 'halloween', 'اسحب': 'withdraw', 'سحب': 'withdraw', 'ماكينه': 'slot', 'سلوت': 'slot', 'بغاء': 'slut', 'اسبوعي': 'weekly', 'الاسبوعي': 'weekly',
  // ── الترفيه (إضافي) ──
  'كرهماجيك': '8ball', 'اجابه': '8ball', 'غايب': 'afk', 'بعيد': 'afk', 'نسبه': 'gay', 'احسب': 'gay', 'خمناغنيه': 'cancion', 'اعترف': 'confesar', 'اعتراف': 'confesar', 'نصيحه': 'consejo', 'نصيحة': 'consejo', 'استعبد': 'esclavizar', 'عبيد': 'esclavizar', 'زوجني': 'formarpareja', 'اقتران': 'formarpareja', 'خمسهازواج': 'formarpareja5', 'اسمك': 'nombrflash', 'اسمظل': 'nombrflash', 'طلبات': 'pedido', 'اوردر': 'pedido', 'تلميح': 'pista', 'حجره': 'pvp', 'مقص': 'pvp', 'شادوباج': 'flashbug', 'ثلاثي': 'formartrio', 'تلاته': 'formartrio',
  // ── الجاتشا ──
  'امسحشخصيه': 'delwaifu', 'حذفشخصيه': 'delwaifu', 'المفضله': 'favtop', 'مفضلاتي': 'favtop', 'هبشخصيه': 'givechar', 'اهداء': 'givechar', 'هبكل': 'giveallharem', 'معلوماتجاتشا': 'gachainfo', 'جاتشا': 'gachainfo', 'خد': 'claim', 'اخد': 'claim', 'اسرقشخصيه': 'robwaifu', 'معلوماتمسلسل': 'serieinfo', 'مسلسل': 'serieinfo', 'رسالةالخد': 'setclaimmsg', 'توبشخصيات': 'topwaifus', 'افضلشخصيات': 'topwaifus', 'تبديل': 'trade', 'بادل': 'trade', 'تصويت': 'vote',
  // ── المجموعات (إضافي) ──
  'اقفلبوت': 'banearbot', 'اقفلجروب': 'cerrar', 'اقفالمجموعه': 'cerrar', 'شيلالاساسي': 'delprimary', 'استفتاء': 'poll', 'الاشباح': 'inactivos', 'الغائبين': 'inactivos', 'معلوماتجروب': 'infogrupo', 'معلوماتالمجموعه': 'infogrupo', 'اطردرقم': 'kicknum', 'طردارقام': 'kicknum', 'ايديجروب': 'lid', 'المتصلين': 'listonline', 'اونلاين': 'listonline', 'تتبع': 'rastrear', 'رصد': 'rastrear', 'استرجع': 'revoke', 'استعادة': 'revoke', 'صورهالجروب': 'groupimg', 'وصفالجروب': 'groupdesc', 'حددالاساسي': 'setprimary', 'شوفالاساسي': 'verprimary',
  // ── الأدوات ──
  'كاتبوكس': 'catbox', 'رفعميديا': 'catbox', 'جدول': 'tabla', 'ضغط': 'compress', 'اضغط': 'compress', 'استماره': 'form', 'فورم': 'form', 'هات': 'fetch', 'راولينك': 'raw', 'رابطخام': 'raw', 'جودهعاليه': 'hd', 'اتشدي': 'hd', 'ازرار': 'ibtn', 'زرار': 'ibtn', 'رفعصوره': 'imgbbflash', 'افحصجروب': 'inspect', 'معاينه': 'inspect', 'لوتي': 'lottie', 'بيكس': 'pix', 'دفعبرقم': 'pix', 'فيديودائري': 'ptv', 'بفيديودائري': 'ptv', 'تفاعلرابط': 'reactwa', 'صغر': 'reduce', 'تصغير': 'reduce', 'ريلز': 'reels', 'ريل': 'reels', 'شيلخلفيه': 'removebg', 'زبت': 'zip', 'ضغطملف': 'zip', 'فيديوبروفايل': 'userptv', 'بحثفيديودائري': 'ptvsearch', 'بحث': 'google', 'جوجل': 'google', 'بحثانمي': 'infoanime', 'بحثباكدج': 'npmjs', 'بنترست': 'pinterest', 'بحثصور': 'pinterest', 'بحثتيكتوك': 'tiktoks', 'تيكتوكبحث': 'tiktoks',
  // ── الذكاء الاصطناعي (إضافي) ──
  'شاتجبت': 'chatgpt', 'فينيس': 'venice', 'ذكاءفينيس': 'venice', 'مساعدذكي': 'asistente', 'شادويا': 'flashia',
  // ── معلومات ──
  'الحاله': 'status', 'حالةالبوت': 'status', 'حساباترسميه': 'cuentasoficiales', 'قنوات': 'cuentasoficiales', 'المطورين': 'creators', 'اصحابالبوت': 'creators',
  // ── القوائم الفرعية ──
  'اقتراح': 'suggest', 'بلاغ': 'report', 'منيوالانمي': 'menuanime', 'منيوالتحميل': 'menudescargas', 'منيوالترفيه': 'menufun', 'منيوالجاتشا': 'menugacha', 'منيوالجروبات': 'menugrupo', 'منيوالادوات': 'menuherras', 'منيوالذكاء': 'menuia', 'منيوكبير': 'menulist', 'منيوالمالك': 'menuowner',
  // ── NSFW ──
  'وضع69': 'sixnine', 'خلفي': 'anal', 'جلخ': 'chaqueta', 'لبن': 'cum', 'بحثهنتاي': 'hentaisearch', 'جنس': 'sexo', 'بزاز': 'tetas', 'يوري': 'yuri', 'سحاق': 'yuri',
  // ── المالك (إضافي) ──
  'ادمنتلقائي': 'autoadmin', 'احظرمستخدم': 'banuser', 'بثجماعي': 'bcgc', 'اذاعه': 'bcgc', 'نظفالسوبات': 'clearbots', 'امسحمكون': 'delplugin', 'حذفمكون': 'delplugin', 'نفذ': 'eval', 'كودjs': 'eval', 'جيبمكون': 'getplugin', 'ايبي': 'ip', 'الايبي': 'ip', 'المحظورين': 'banlist', 'قايمةالحظر': 'banlist', 'فيديوالقناه': 'ptvchanel', 'احفظمكون': 'saveplugin', 'سبام': 'spam2',
  // ── اختبارات ──
  'عروض': 'prods', 'عروض2': 'prodz',
  // ── التسجيل ──
  'الغاءتسجيل': 'unreg', 'امسححسابي': 'unreg', 'سجل': 'verify', 'تسجيل': 'register',
  // ── الملصقات ──
  'برات': 'brat', 'براتفيديو': 'bratvid', 'ايموجي': 'emojimix', 'خلطايموجي': 'emojimix', 'باك': 'pack', 'حزمه': 'pack', 'كوت': 'qc', 'اقتباسملصق': 'qc', 'بحثملصقات': 'stickersearch',
  // ── البوتات الفرعية ──
  'كودفرعي': 'darcode', 'السوبات': 'listbots', 'البوتات': 'listbots', 'صورهالسوب': 'setimagen', 'فيديوالسوب': 'setvid',
}

export function resolveArabicAlias(command) {
  if (!command) return command
  return arabicAliases[command] || command
}

export default arabicAliases
