
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const contextoPousada = `
Você é um atendente virtual da Pousada Paraíso das Pedrinhas, localizada em Ilha Comprida-SP.
Informações importantes:
- Diária: R$125 por pessoa (com café da manhã)
- Crianças até 7 anos não pagam
- Quartos com mini cozinha e ar-condicionado
- Piscina disponível
- Instagram: https://www.instagram.com/pousadaparaisodaspedrinhas/
- Localização: https://maps.app.goo.gl/hugojtJGfXrytZ8n8
Sempre incentive reservas perguntando quantidade de pessoas e dias.
Informe que após escolher datas, a confirmação ocorrerá em até 2 horas.
`;

const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Chatbot WhatsApp rodando!'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    console.log('📌 Escaneie este QR Code com WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Chatbot WhatsApp conectado com sucesso!');
});

client.on('message', async message => {
    if (message.body.toLowerCase().includes('foto') || message.body.toLowerCase().includes('vídeo') || message.body.toLowerCase().includes('video')) {
        return message.reply("📸 Veja fotos e vídeos no nosso Instagram: https://www.instagram.com/pousadaparaisodaspedrinhas/");
    }

    const resposta = await openai.chat.completions.create({
        messages: [
            { role: "system", content: contextoPousada },
            { role: "user", content: message.body }
        ],
        model: "gpt-3.5-turbo"
    });

    let botMessage = resposta.choices[0].message.content;

    if (botMessage.toLowerCase().includes('reserva') && botMessage.match(/(\d{1,2}\/\d{1,2}|\d+\s+pessoas?|\d+\s+dias?)/i)) {
        botMessage += "\n\n⏳ Após confirmar datas e pessoas, retornarei em até 2 horas com a confirmação definitiva!";
    }

    await message.reply(botMessage);
});

console.log("🟢 Inicializando WhatsApp...");
client.initialize();
