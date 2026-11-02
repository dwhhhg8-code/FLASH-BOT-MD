import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"


global.botNumber = ""


global.owner = [
["201125166486", "𝖍𝖆𝖎𝖙𝖍𝖆𝖒", true]
]


global.mods = []
global.suittag = ["201125166486"]
global.prems = []



global.libreria = "Baileys Multi Device"
global.vs = "^1.8.2|Latest"
global.nameqr = "FlashBot"
global.sessions = "Sessions/Principal"
global.jadi = "Sessions/SubBot"
global.flashSubBotAuto = false


global.multiplier = 1
global.botname = "𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪"
global.textbot = "𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪"
global.dev = "𝖍𝖆𝖎𝖙𝖍𝖆𝖒"
global.author = "𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪"
global.etiqueta = "𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪"
global.wm = "𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪"
global.titulowm = "𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪"
global.currency = "¥enes"
global.flashpg = "https://i.pinimg.com/originals/9d/6c/4e/9d6c4eeb7898079652b7f2c2e5c65632.jpg"
global.icono = "https://i.pinimg.com/originals/9d/6c/4e/9d6c4eeb7898079652b7f2c2e5c65632.jpg"
global.idcanal = "120363410090342500@newsletter"
global.idcanal2 = "120363410090342500@newsletter"
global.channelRD = { id: "120363410090342500@newsletter", name: "𓆩⚡𓆪 𝙁𝙇𝘼𝙎𝙃 𝘽𝙊𝙏 𓆩⚡𓆪" }
global.banner = "https://i.pinimg.com/originals/9d/6c/4e/9d6c4eeb7898079652b7f2c2e5c65632.jpg"
global.catalogo = fs.readFileSync('./lib/catalogo.jpg')



global.group = "https://chat.whatsapp.com/JyzcMffpXp2DrvOB4Z2jz9?mode=gi_t"
global.community = "https://chat.whatsapp.com/JyzcMffpXp2DrvOB4Z2jz9?mode=gi_t"
global.channel = "https://whatsapp.com/channel/0029Vb8QIpSJ3juu0VHRyU0v"
global.github = "https://github.com/dwhhhg8-code"
global.gmail = "dwhhhg8@gmail.com"
global.ch = {
ch1: "120363410090342500@newsletter"
}



global.APIs = {
siputzx: { url: "https://api.siputzx.my.id", key: null },
gohan: { url: "https://api-gohan-v1.onrender.com", key: null }
}


// مفتاح API للأمر reactwa (التفاعل في قنوات واتساب)
global.reactApiKey = ""


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'settings.js'"))
import(`${file}?update=${Date.now()}`)
})
