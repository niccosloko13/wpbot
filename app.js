
const { Client, LocalAuth } = require('whatsapp-web.js');
const OpenAI = require('openai');
const readline = require('readline');
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
Se o cliente estiver vindo do Facebook ou Instagram, seja mais atencioso e convide ele a conhecer melhor a pousada.
`;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('ready', () => {
    console.log('✅ WhatsApp conectado com sucesso!');
    console.log('Quando o WhatsApp Web carregar completamente no navegador, pressione ENTER aqui no terminal.');
    pauseForUser();
});

client.on('message', async message => {
    if (message.body.toLowerCase().includes('foto') || message.body.toLowerCase().includes('vídeo') || message.body.toLowerCase().includes('video')) {
        return message.reply("Veja fotos e vídeos no nosso Instagram: https://www.instagram.com/pousadaparaisodaspedrinhas/");
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
        botMessage += "\n\nApós confirmar datas e pessoas, retornarei em até 2 horas com a confirmação definitiva!";
    }

    await message.reply(botMessage);
});

function pauseForUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("Pressione ENTER após abrir o WhatsApp Web no navegador.", () => {
        rl.close();
        console.log("Sessão salva com sucesso. Agora você pode subir a pasta .wwebjs_auth para o Render.");
        process.exit(0);
    });
}

console.log("Inicializando WhatsApp...");
client.initialize();
