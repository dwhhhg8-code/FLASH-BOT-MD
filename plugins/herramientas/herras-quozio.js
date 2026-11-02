import fetch from "node-fetch";

let handler = async (m, { conn, usedPrefix, args, command }) => {
  let text;
  if (args.length >= 1) {
    text = args.join(" ");
  } else if (m.quoted && m.quoted.text) {
    text = m.quoted.text;
  } else {
    throw `❒ أدخل عبارة أو قم بالرد على الرسالة التي تريد تحويلها إلى اقتباس.\n\n✐ مثال:\n${usedPrefix + command} الفن هو أنقى تعبير عن الروح.`;
  }

  const quote = await createQuote(m.name, text);

  await conn.sendFile(
    m.chat,
    quote,
    '',
    `「✦」تم إنشاء الاقتباس\n\n✐ المؤلف » *${m.name}*\nⴵ النمط » *Random Quozio*\n🜸 المصدر » *quozio.com*`,
    m,
    { ...rcanal }
  );
};

handler.tags = ['tools'];
handler.command = handler.help = ["quozio"];
export default handler;

async function createQuote(author, message) {
  const host = "https://quozio.com/";
  let path = "API/v1/quotes";

  const body = JSON.stringify({
    author: author,
    quote: message,
  });

  const quote = await fetch(host + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body,
  }).then(res => res.json());

  const quoteId = quote["quoteId"];

  path = "API/v1/templates";
  const templates = await fetch(host + path)
    .then(res => res.json())
    .then(val => val["data"]);

  const index = Math.floor(Math.random() * templates.length);
  const templateId = templates[index]["templateId"];

  path = `api/v1/quotes/${quoteId}/imageUrls?templateId=${templateId}`;
  const imageUrl = await fetch(host + path)
    .then(res => res.json())
    .then(val => val["medium"]);

  return imageUrl;
}
