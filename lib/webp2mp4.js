import { convert } from "./ezgif-convert.js"
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from "file-type"
import crypto from "crypto"

const randomBytes = crypto.randomBytes(5).toString("hex");
const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

async function webp2mp4(source) {
    const isUrl = typeof source === 'string' && urlRegex.test(source);

    try {
        return await convert({
            type: 'webp-mp4',
            ...(isUrl ? {
                url: source
            } : {
                file: new Blob([source]),
                filename: randomBytes + "." + (await fileTypeFromBuffer(source)).ext
            })
        });
    } catch (error) {
        console.error("حدث خطأ أثناء التحويل إلى webp-mp4. تجربة الأنواع الاحتياطية.");

        try {
            return await convert({
                type: 'webp-avif',
                ...(isUrl ? {
                    url: source
                } : {
                    file: new Blob([source]),
                    filename: randomBytes + "." + (await fileTypeFromBuffer(source)).ext
                })
            });
        } catch (avifError) {
            console.error("حدث خطأ أثناء التحويل إلى webp-avif. محاولة webp-gif.");

            try {
                return await convert({
                    type: 'webp-gif',
                    ...(isUrl ? {
                        url: source
                    } : {
                        file: new Blob([source]),
                        filename: randomBytes + "." + (await fileTypeFromBuffer(source)).ext
                    })
                });
            } catch (gifError) {
                console.error("حدث خطأ أثناء التحويل إلى webp-gif. فشلت كافة الأنواع الاحتياطية.");
                throw gifError;
            }
        }
    }
}

async function webp2png(source) {
    const isUrl = typeof source === 'string' && urlRegex.test(source);

    try {
        return await convert({
            type: 'webp-png',
            ...(isUrl ? {
                url: source
            } : {
                file: new Blob([source]),
                filename: randomBytes + "." + (await fileTypeFromBuffer(source)).ext
            })
        });
    } catch (pngError) {
        console.error("حدث خطأ أثناء التحويل إلى webp-png. محاولة webp-jpg.");

        try {
            return await convert({
                type: 'webp-jpg',
                ...(isUrl ? {
                    url: source
                } : {
                    file: new Blob([source]),
                    filename: randomBytes + "." + (await fileTypeFromBuffer(source)).ext
                })
            });
        } catch (jpgError) {
            console.error("حدث خطأ أثناء التحويل إلى webp-jpg. فشلت كافة الأنواع الاحتياطية.");
            throw jpgError;
        }
    }
}

export {
    webp2mp4,
    webp2png
};