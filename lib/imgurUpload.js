import fs from 'fs';
import process from 'process';
import axios from 'axios';
import FormData from 'form-data';
import * as cheerio from 'cheerio';

const IMGUR_API = {
  UPLOAD: 'https://api.imgur.com/3/image',
  CLIENT_ID: '546c25a59c58ad7'
};

function parseDataUri(input) {
  if (typeof input !== 'string') return null;
  const m = input.match(/^data:([^;,]+);base64,(.+)$/i);
  if (!m) return null;
  return { mime: m[1], base64: m[2] };
}

async function uploadImage(imageInput) {
  try {
    console.log('\n📤 جارٍ تحضير تحميل الصورة...');
    const form = new FormData();

    // Accept: file path, Buffer, or data URI (data:*;base64,....)
    if (Buffer.isBuffer(imageInput)) {
      form.append('image', imageInput.toString('base64'));
      form.append('type', 'base64');
    } else {
      const dataUri = parseDataUri(imageInput);
      if (dataUri?.base64) {
        form.append('image', dataUri.base64);
        form.append('type', 'base64');
      } else {
        if (typeof imageInput !== 'string') throw new Error('إدخال صورة غير صالح');
        if (!fs.existsSync(imageInput)) throw new Error(`لم يتم العثور على الملف: ${imageInput}`);
        form.append('image', fs.createReadStream(imageInput));
        form.append('type', 'file');
      }
    }

    console.log('جارٍ إرسال طلب التحميل...');
    const uploadResponse = await axios.post(IMGUR_API.UPLOAD, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Client-ID ${IMGUR_API.CLIENT_ID}`
      }
    });

    console.log('\n📡 الرد على التحميل:', {
      status: uploadResponse.status,
      statusText: uploadResponse.statusText,
      data: uploadResponse.data
    });

    if (!uploadResponse.data.success) {
      throw new Error(uploadResponse.data.data.error);
    }

    return uploadResponse.data.data.link;
  } catch (error) {
    console.error('خطأ في التحميل:', error.response?.data || error.message);
    throw error;
  }
}

export default uploadImage;
