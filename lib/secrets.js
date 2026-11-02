// مفاتيح الخدمات الخارجية تُقرأ من متغيرات البيئة فقط.
// شوف .env.example، وحدّد القيم في ملف .env محلي (غير مُتتبَّع في git).
const env = (key) => process.env[key] || '';

export const APIOWO_BASE = env('APIOWO_BASE') || 'https://apiowo.vercel.app';
export const APIOWO_TOKEN = env('APIOWO_TOKEN');

export const NYX_API_KEY = env('NYX_API_KEY');

export const IMGBB_API_KEY = env('IMGBB_API_KEY');

export const ACRCLOUD_HOST = env('ACRCLOUD_HOST') || 'identify-eu-west-1.acrcloud.com';
export const ACRCLOUD_KEY = env('ACRCLOUD_KEY');
export const ACRCLOUD_SECRET = env('ACRCLOUD_SECRET');

export const PEXELS_API_KEY = env('PEXELS_API_KEY');

export const PIXABAY_API_KEY = env('PIXABAY_API_KEY');

export const TENOR_API_KEY = env('TENOR_API_KEY');

export const RULE34_USER_ID = env('RULE34_USER_ID');
export const RULE34_API_KEY = env('RULE34_API_KEY');

export const YOSOYO_API_KEY = env('YOSOYO_API_KEY');
export const YOSOYO_FB_KEY = env('YOSOYO_FB_KEY');

export default {
  APIOWO_BASE,
  APIOWO_TOKEN,
  NYX_API_KEY,
  IMGBB_API_KEY,
  ACRCLOUD_HOST,
  ACRCLOUD_KEY,
  ACRCLOUD_SECRET,
  PEXELS_API_KEY,
  PIXABAY_API_KEY,
  TENOR_API_KEY,
  RULE34_USER_ID,
  RULE34_API_KEY,
  YOSOYO_API_KEY,
  YOSOYO_FB_KEY
};
