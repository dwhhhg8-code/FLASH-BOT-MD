/**
 * FLASH-BOT — NSFW media (imágenes desde APIs públicas)
 * ────────────────────────────────────────────────────────────────────
 * Antes los comandos NSFW usaban una sola URL fija por comando
 * (delirius-apiofc, api.waifu.pics...) que con el tiempo caen y dejan el
 * comando inservible. Ahora cada categoría pide una imagen aleatoria a
 * proveedores públicos con respaldo en cadena.
 *
 * Proveedores verificados (2026-10-30, gratuitos, sin API key):
 *   • xbooru     https://xbooru.com/index.php?page=dapi&s=post&q=index&tags=  → cubre todas las categorías
 *   • purrbot    https://purrbot.site/api/img/nsfw/<t>/gif                   → neko, blowjob, yuri, anal
 *   • nekos.life https://nekos.life/api/v2/img/<t>                           → lewd
 *
 * Notas de APIs caídas (verificado el 2026-10-30):
 *   waifu.pics   → api.waifu.pics no resuelve (NXDOMAIN)
 *   deliriodevs  → deliriodevs.com no resuelve (NXDOMAIN)
 *   vreden       → api.vreden.web.id no resuelve (NXDOMAIN)
 */

const USER_AGENT = 'FlashBot/1.0 (+https://github.com/dwhhhg8-code/FLASH-BOT-MD)'
const TIMEOUT_MS = 12000

// Permite apuntar a servidores locales en pruebas (mismo patrón que APIOWO_BASE).
const BASES = {
  xbooru: process.env.XBOORU_BASE || 'https://xbooru.com',
  purrbot: process.env.PURRBOT_BASE || 'https://purrbot.site',
  'nekos.life': process.env.NEKOSLIFE_BASE || 'https://nekos.life'
}

// Categorías expuestas → cadena de proveedores a intentar en orden.
const CADENAS = {
  waifu: [{ proveedor: 'xbooru', tag: 'waifu' }],
  neko: [{ proveedor: 'xbooru', tag: 'catgirl' }, { proveedor: 'purrbot', tag: 'neko' }],
  trap: [{ proveedor: 'xbooru', tag: 'trap' }],
  blowjob: [{ proveedor: 'xbooru', tag: 'blowjob' }, { proveedor: 'purrbot', tag: 'blowjob' }],
  boobs: [{ proveedor: 'xbooru', tag: 'breasts' }],
  anal: [{ proveedor: 'purrbot', tag: 'anal' }],
  yuri: [{ proveedor: 'purrbot', tag: 'yuri' }],
  lewd: [{ proveedor: 'nekos.life', tag: 'lewd' }]
}

async function pedir(url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

const proveedores = {
  async xbooru(tag) {
    const xml = await pedir(`${BASES.xbooru}/index.php?page=dapi&s=post&q=index&limit=40&tags=${encodeURIComponent(tag)}`)
    const urls = [...xml.matchAll(/file_url="([^"]+)"/g)].map(m => m[1])
    if (!urls.length) throw new Error('xbooru sin resultados')
    return urls[Math.floor(Math.random() * urls.length)]
  },
  async purrbot(tag) {
    const txt = await pedir(`${BASES.purrbot}/api/img/nsfw/${tag}/gif`)
    const data = JSON.parse(txt)
    if (!data?.link) throw new Error('purrbot sin enlace')
    return data.link
  },
  async 'nekos.life'(tag) {
    const txt = await pedir(`${BASES['nekos.life']}/api/v2/img/${tag}`)
    const data = JSON.parse(txt)
    if (!data?.url) throw new Error('nekos.life sin url')
    return data.url
  }
}

export const categoriasDisponibles = Object.keys(CADENAS)

/**
 * Devuelve una URL de imagen aleatoria para la categoría pedida.
 * Prueba los proveedores en orden y lanza si todos fallan.
 */
export async function obtenerImagenNSFW(categoria) {
  const clave = String(categoria || '').toLowerCase()
  const cadena = CADENAS[clave]
  if (!cadena) throw new Error(`Categoría NSFW no soportada: ${categoria}`)

  const errores = []
  for (const { proveedor, tag } of cadena) {
    try {
      return await proveedores[proveedor](tag)
    } catch (err) {
      errores.push(`${proveedor}: ${err.message}`)
    }
  }
  throw new Error(`No se pudo obtener imagen NSFW (${errores.join(' | ')})`)
}
