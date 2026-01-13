const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");

async function ligarBot() {
    // A pasta 'auth_info' guarda a conexão na Northflank
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // Desligado para usarmos o número
        logger: pino({ level: "silent" })
    });

    // --- CONFIGURAÇÃO DO NÚMERO ---
    if (!sock.authState.creds.registered) {
        // Substitui o número abaixo pelo teu (com DDI, ex: 244900000000)
        const meuNumero = "244XXXXXXXXX"; 
        
        await delay(5000); // Tempo para o servidor Northflank iniciar
        const code = await sock.requestPairingCode(meuNumero);
        console.log("========================================");
        console.log("TEU CÓDIGO DE CONEXÃO É:", code);
        console.log("========================================");
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log("Bot conectado com sucesso! ✅");
        if (connection === 'close') console.log("Conexão fechada. A reiniciar...");
    });

    // Resposta automática simples
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text;
        
        if (texto?.toLowerCase() === 'oi') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Olá! Estou online na Northflank via Pairing Code! 🚀' });
        }
    });
}

ligarBot();
