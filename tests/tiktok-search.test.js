import test from "node:test"
import assert from "node:assert/strict"
import http from "node:http"

// اختبار ثابت بالكامل: سيرفر محلي يحاكي واجهة البحث بدل الاعتماد على شبكة خارجية.
// لازم نضبط APIOWO_BASE ونشغّل السيرفر قبل أول import للمكوّن, لأن secrets.js يقرأ
// متغيرات البيئة وقت التحميل ووحدات ESM تُخزَّن مؤقتًا. كل ملف اختبار في عملية منفصلة.

const videos = Array.from({ length: 5 }, (_, i) => ({
  play: `http://127.0.0.1/video-${i}.mp4`,
  title: `فيديو تيك توك ${i}`,
  author: { name: `مؤلف ${i}` },
  duration: 10 + i
}))

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/tiktok/search")) {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ data: videos }))
    return
  }
  res.writeHead(404).end()
})

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve))
process.env.APIOWO_BASE = `http://127.0.0.1:${server.address().port}`

const { default: tiktokHandler } = await import("../plugins/herramientas/searchs-tiktok.js")

test("tiktoksearch: empty query returns instructions", async () => {
  let replyText = ""
  const fakeConn = { reply: (chat, text) => { replyText = text } }
  const fakeM = { chat: "123@s.whatsapp.net", react: async () => {} }

  await tiktokHandler(fakeM, { conn: fakeConn, text: "", usedPrefix: "." })

  assert.ok(replyText.includes("الرجاء إدخال مصطلح البحث"), "لازم يطلب كلمة البحث أو الرابط")
})

test("tiktoksearch: delivers exactly 5 videos from the search API", async () => {
  const sent = []
  const reactions = []
  const fakeConn = {
    reply: (chat, text) => { sent.push({ type: "reply", text }) },
    sendMessage: async (chat, content, opts) => {
      sent.push({ type: "send", chat, content, opts })
      return { key: { id: "msg-id" } }
    }
  }
  const fakeM = { chat: "123@s.whatsapp.net", react: async (r) => { reactions.push(r) } }

  await tiktokHandler(fakeM, { conn: fakeConn, text: "gatos", usedPrefix: "." })

  assert.ok(reactions.includes("🕒"), "لازم يتفاعل بـ 🕒 عند البدء")
  assert.ok(reactions.includes("✔️"), "لازم يخلّص بنجاح ✔️")
  const videoMessages = sent.filter(s => s.content?.video)
  assert.equal(videoMessages.length, 5, `لازم يرسل 5 فيديوهات بالظبط, أرسل: ${videoMessages.length}`)
})

test.after(() => server.close())
