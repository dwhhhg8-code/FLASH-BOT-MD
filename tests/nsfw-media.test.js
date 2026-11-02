import test from "node:test"
import assert from "node:assert/strict"
import http from "node:http"

// اختبار ثابت بالكامل: سيرفر محلي يحاكي مزوّدي الصور، ثم نوجّه الأداة إليه
// عبر متغيرات البيئة قبل أول استيراد. كل ملف اختبار يعمل في عملية منفصلة.

const XML_OK = `<posts><post file_url="https://img.example/one.png"/><post file_url="https://img.example/two.png"/></posts>`

let failXbooru = false
let hitPurrbot = false

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/index.php")) {
    if (failXbooru) { res.writeHead(500).end(); return }
    res.writeHead(200, { "Content-Type": "application/xml" })
    res.end(XML_OK)
    return
  }
  if (req.url.startsWith("/api/img/nsfw/")) {
    hitPurrbot = true
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ link: "https://cdn.example/purr.gif" }))
    return
  }
  if (req.url.startsWith("/api/v2/img/")) {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ url: "https://cdn.example/lewd.jpeg" }))
    return
  }
  res.writeHead(404).end()
})

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve))
const base = `http://127.0.0.1:${server.address().port}`

process.env.XBOORU_BASE = base
process.env.PURRBOT_BASE = base
process.env.NEKOSLIFE_BASE = base

const { obtenerImagenNSFW, categoriasDisponibles } = await import("../lib/nsfw-media.js")

test("nsfw-media: expone todas las categorías usadas por los comandos", () => {
  for (const c of ["waifu", "neko", "trap", "blowjob", "boobs"]) {
    assert.ok(categoriasDisponibles.includes(c), `falta la categoría ${c}`)
  }
})

test("nsfw-media: devuelve una URL del proveedor principal (xbooru)", async () => {
  const url = await obtenerImagenNSFW("waifu")
  assert.match(url, /^https:\/\/img\.example\/(one|two)\.png$/)
})

test("nsfw-media: usa el respaldo purrbot cuando xbooru falla", async () => {
  failXbooru = true
  hitPurrbot = false
  const url = await obtenerImagenNSFW("neko")
  assert.equal(url, "https://cdn.example/purr.gif")
  assert.ok(hitPurrbot, "no se llamó al respaldo purrbot")
  failXbooru = false
})

test("nsfw-media: categoría desconocida lanza error", async () => {
  await assert.rejects(() => obtenerImagenNSFW("noexiste"), /no soportada/i)
})

test("nsfw-media: lanza cuando todos los proveedores fallan", async () => {
  failXbooru = true
  await assert.rejects(() => obtenerImagenNSFW("waifu"), /No se pudo obtener/i)
  failXbooru = false
})

test.after(() => server.close())
