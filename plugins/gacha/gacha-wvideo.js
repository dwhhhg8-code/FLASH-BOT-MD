import { promises as fs } from 'fs';
import fetch from 'node-fetch';

async function loadCharacters() {
    const data = await fs.readFile("./lib/characters.json", "utf-8");
    return JSON.parse(data);
}

function flattenCharacters(data) {
    return Object.values(data).flatMap(series => Array.isArray(series.characters) ? series.characters : []);
}

function getSeriesNameByCharacter(data, charId) {
    const seriesEntry = Object.entries(data).find(([, seriesData]) => 
        Array.isArray(seriesData.characters) && seriesData.characters.some(char => char.id === charId)
    );
    return seriesEntry?.[1]?.["name"] || "غير معروف";
}

function formatElapsed(milliseconds) {
    if (!milliseconds || milliseconds <= 0) {
        return '—';
    }
    const seconds = Math.floor(milliseconds / 1000);
    const weeks = Math.floor(seconds / 604800);
    const days = Math.floor((seconds % 604800) / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const timeString = [];
    if (weeks > 0) timeString.push(weeks + 'w');
    if (days > 0) timeString.push(days + 'd');
    if (hours > 0) timeString.push(hours + 'h');
    if (minutes > 0) timeString.push(minutes + 'm');
    if (secs > 0) timeString.push(secs + 's');
    
    return timeString.join(" ");
}

async function buscarImagenDelirius(query) {
    const tag = String(query).trim().toLowerCase().replace(/\s+/g, '_');
    const apis = [
        `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${tag}`,
        `https://danbooru.donmai.us/posts.json?tags=${tag}`,
        `${global.APIs.delirius.url}/search/gelbooru?query=${tag}`
    ];

    for (const url of apis) {
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
            });
            const contentType = response.headers.get("content-type") || '';
            if (!response.ok || !contentType.includes("json")) continue;

            const json = await response.json();
            const data = Array.isArray(json) ? json : (json?.["post"] || json?.["data"] || []);
            
            const images = data.map(item => 
                item?.["file_url"] || item?.["large_file_url"] || item?.["image"] || item?.['media_asset']?.["variants"]?.[0]?.["url"]
            ).filter(url => typeof url === "string" && /\.(jpe?g|png)$/.test(url));

            if (images.length) return images;
        } catch {}
    }
    return [];
}

let handler = async (m, { conn, args, usedPrefix, command }) => {

    try {
        if (!global.db.data.chats?.[m.chat]?.["gacha"] && m.isGroup) {
            return m.reply(`ꕥ أوامر *Gacha* معطلة في هذه المجموعة.\n\nيمكن لـ *مسؤول* تنشيطها باستخدام الأمر:\n» *${usedPrefix}gacha on*`);
        }

        if (!args.length) {
            return m.reply(`❀ يرجى تقديم اسم الشخصية.\n> مثال » *${usedPrefix + command} Yuki Suou*`);
        }

        const allCharactersData = await loadCharacters();
        const flatChars = flattenCharacters(allCharactersData);
        const searchQuery = args.join(" ").toLowerCase().trim();

        const character = flatChars.find(c => String(c.name).toLowerCase() === searchQuery) ||
                          flatChars.find(c => String(c.name).toLowerCase().includes(searchQuery) || (Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(searchQuery)))) ||
                          flatChars.find(c => searchQuery.split(" ").some(q => String(c.name).toLowerCase().includes(q) || (Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(q)))));

        if (!character) {
            return m.reply(`ꕥ لم يتم العثور على الشخصية *${searchQuery}*.`);
        }

        const dbData = global.db.data;

        switch (command) {
            case "charinfo":
            case "winfo":
            case "waifuinfo": {
                if (!dbData.characters) dbData.characters = {};
                if (!dbData.characters[character.id]) dbData.characters[character.id] = {};

                const charData = dbData.characters[character.id];
                charData.name ??= character.name;
                charData.value = typeof charData.value === 'number' ? charData.value : Number(character.value || 100);
                charData.votes = typeof charData.votes === "number" ? charData.votes : 0;

                const seriesName = getSeriesNameByCharacter(allCharactersData, character.id);
                
                const ownerEntry = Object.entries(dbData.users).find(([, userData]) => Array.isArray(userData.characters) && userData.characters.includes(character.id));
                
                let ownerName = "desconocido";
                if (ownerEntry) {
                    ownerName = ownerEntry[0] ? (dbData.users[ownerEntry[0]]?.name?.trim() || (await conn.getName(ownerEntry[0]))?.trim() || ownerEntry[0].split('@')[0]) : "desconocido";
                }

                const claimDate = charData.user && charData.claimedAt 
                    ? `
ⴵ تاريخ المطالبة » *${new Date(charData.claimedAt).toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: 'long', year: 'numeric' })}*` 
                    : '';
                
                const lastVote = typeof charData.lastVotedAt === "number" ? `hace *${formatElapsed(Date.now() - charData.lastVotedAt)}*` : "*Nunca*";
                
                const sortedChars = Object.values(dbData.characters).filter(c => typeof c.value === "number").sort((a, b) => b.value - a.value);
                const rank = sortedChars.findIndex(c => c.name === character.name) + 1 || '—';

                const infoText = `❀ الاسم » *${charData.name}*\n⚥ الجنس » *${character.gender || 'غير معروف'}*\n✰ القيمة » *${charData.value.toLocaleString()}*\n♡ الحالة » ${ownerEntry ? "تمت المطالبة به بواسطة *" + ownerName + '*' : '*متاح*'} ${claimDate}\n❖ المصدر » *${seriesName}*\n❏ المنصب » *#${rank}*\nⴵ آخر تصويت » ${lastVote}`;
                
                await m.reply(infoText.trim());
                break;
            }

            case "charimage":
            case "waifuimage":
            case 'cimage':
            case "wimage": {
                const tag = Array.isArray(character.tags) ? character.tags[0] : null;
                if (!tag) return m.reply(`ꕥ لا يحتوي الشخصية *${character.name}* على علامة صالحة للبحث عن الصور.`);

                const images = await buscarImagenDelirius(tag);
                const randomImage = images[Math.floor(Math.random() * images.length)];

                if (!randomImage) return m.reply(`ꕥ لم يتم العثور على صور لـ *${character.name}* بالعلامة *${tag}*.`);

                const seriesName = getSeriesNameByCharacter(allCharactersData, character.id);
                const caption = `❀ الاسم » *${character.name}*\n⚥ النوع » *${character.gender || "غير معروف"}*\n❖ المصدر » *${seriesName}*`;
                
                await conn.sendFile(m.chat, randomImage, `${character.name}.jpg`, caption, m);
                break;
            }

            case "charvideo":
            case 'waifuvideo':
            case "cvideo":
            case "wvideo": {
                const tag = Array.isArray(character.tags) ? character.tags[0] : null;
                if (!tag) return m.reply(`ꕥ لا يحتوي الشخصية ${character.name} على علامة صالحة للبحث عن مقاطع الفيديو.`);

                const formattedTag = String(tag).trim().toLowerCase().replace(/\s+/g, '_');
                const videoApis = [
                    `${global.APIs.delirius.url}/search/gelbooru?query=${formattedTag}`,
                    `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${formattedTag}`,
                    `https://danbooru.donmai.us/posts.json?tags=${formattedTag}`
                ];

                let videos = [];
                for (const url of videoApis) {
                    try {
                        const response = await fetch(url, { headers: { 'User-Agent': "Mozilla/5.0", 'Accept': "application/json" } });
                        const contentType = response.headers.get("content-type") || '';
                        if (!response.ok || !contentType.includes("json")) continue;

                        const json = await response.json();
                        const data = Array.isArray(json) ? json : (json?.["post"] || json?.['data'] || []);
                        
                        videos = data.map(item => 
                            item?.["file_url"] || item?.['large_file_url'] || item?.["image"] || item?.['media_asset']?.["variants"]?.[0]?.["url"]
                        ).filter(url => typeof url === "string" && /\.(gif|mp4)$/.test(url));

                        if (videos.length) break;
                    } catch {}
                }

                if (!videos.length) return m.reply(`ꕥ لم يتم العثور على مقاطع فيديو لـ ${character.name}.`);

                const randomVideo = videos[Math.floor(Math.random() * videos.length)];
                const seriesName = getSeriesNameByCharacter(allCharactersData, character.id);
                const caption = `❀ الاسم » *${character.name}*\n⚥ النوع » *${character.gender || "غير معروف"}*\n❖ المصدر » *${seriesName}*`;
                
                await conn.sendFile(m.chat, randomVideo, `${character.name}.${randomVideo.endsWith(".mp4") ? "mp4" : 'gif'}`, caption, m);
                break;
            }
        }
    } catch (e) {
        await m.reply(`⚠︎ حدثت مشكلة.\n> استخدم *${usedPrefix}report* للإبلاغ عنها.\n\n${e.message}`);
        console.error(e);
    }
};

handler.help = ["winfo", "wimage", "waifuvideo"];
handler.tags = ["gacha"];
handler.command = ['charinfo', 'winfo', "waifuinfo", "charimage", "waifuimage", "cimage", 'wimage', "charvideo", "waifuvideo", "cvideo", "wvideo"];
handler.group = true;

export default handler;
