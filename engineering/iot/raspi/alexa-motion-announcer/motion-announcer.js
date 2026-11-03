const Alexa = require('alexa-remote2');
const mqtt = require('mqtt');
const https = require('https');
const { execFile } = require('child_process');
const fs = require('fs');

const COOKIE_FILE = '/opt/alexa-motion-announcer/alexa-cookie.json';
const ECHO_DOT_SERIAL = 'G090VC0784051K57';
const MQTT_BROKER = 'mqtt://localhost:1883';
const MOTION_TOPIC = 'sensors/esp8266/motion';

// Vietnamese has no native Alexa voice, and Amazon's AlexaAnnouncement/SSML
// "ssml" sequence command does not support the <audio> tag (confirmed via
// alandtse/alexa_media_player docs and Apollon77/alexa-remote issue #17 —
// custom-hosted audio silently fails to play regardless of hosting/format).
// A phonetic English-letter approximation was tried and dropped — English only.
const MESSAGES = {
    detected: ['Motion detected'],
    cleared: ['Motion cleared'],
};

// --- Telegram-driven "home assistant" (Claude as the brain) ---
const TELEGRAM_BOT_TOKEN = '8947140824:AAFvr6XPUyE-WCOKvqmYp-r51FJikA5wTUg';
const TELEGRAM_CHAT_ID = '2018004157'; // only this chat may talk to the assistant
const TELEGRAM_POLL_INTERVAL_MS = 3000;
const CLAUDE_HOME = '/home/admin'; // where `claude` was logged in interactively; this service runs as root

// Claude Code CLI has Bash/file tool access by default — deny all of it here.
// This must stay chat-only: nothing from a Telegram message should ever be
// able to execute a command or touch a file on this Pi. (Full system access
// was tried and blocked by Claude Code's own "Create Unsafe Agents" guardrail
// — an externally-triggerable agent with unrestricted system access is
// exactly the risk that guardrail exists to prevent.)
const CLAUDE_DISALLOWED_TOOLS = 'Bash,Edit,Write,Read,Glob,Grep,WebFetch,WebSearch,NotebookEdit,Task,TodoWrite';

let telegramOffset = 0;

function telegramApi(method, params) {
    return new Promise((resolve, reject) => {
        const qs = new URLSearchParams(params).toString();
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}?${qs}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function askClaude(message) {
    return new Promise((resolve, reject) => {
        const prompt = 'You are a home assistant. Reply in English only (Echo Dot has no ' +
            'other language voice), in 1-2 short sentences, under 200 characters, since the ' +
            'answer will be read aloud through an Echo Dot speaker. Question: ' + message;
        execFile('claude', [
            '-p',
            '--disallowedTools', CLAUDE_DISALLOWED_TOOLS,
            '--permission-prompts', 'none',
            prompt,
        ], {
            timeout: 60000,
            maxBuffer: 1024 * 1024,
            env: { ...process.env, HOME: CLAUDE_HOME },
        }, (err, stdout) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(stdout.trim());
        });
    });
}

async function handleAssistantMessage(text) {
    console.log(new Date().toISOString(), 'Assistant question:', text);
    try {
        const reply = await askClaude(text);
        console.log(new Date().toISOString(), 'Assistant reply:', reply);
        await telegramApi('sendMessage', { chat_id: TELEGRAM_CHAT_ID, text: reply });
        speakSequentially([reply.slice(0, 250)], 0);
    } catch (e) {
        console.error(new Date().toISOString(), 'Assistant error:', e);
        await telegramApi('sendMessage', {
            chat_id: TELEGRAM_CHAT_ID,
            text: '⚠️ Lỗi xử lý câu hỏi: ' + e.message,
        }).catch(() => {});
    }
}

async function pollTelegram() {
    try {
        const result = await telegramApi('getUpdates', { offset: telegramOffset, timeout: 0 });
        if (result.ok) {
            for (const update of result.result) {
                telegramOffset = update.update_id + 1;
                const msg = update.message;
                if (!msg || !msg.text) continue;
                if (String(msg.chat.id) !== TELEGRAM_CHAT_ID) {
                    console.log(new Date().toISOString(), 'Ignoring message from unauthorized chat', msg.chat.id);
                    continue;
                }
                handleAssistantMessage(msg.text);
            }
        }
    } catch (e) {
        console.error(new Date().toISOString(), 'Telegram poll error:', e);
    }
    setTimeout(pollTelegram, TELEGRAM_POLL_INTERVAL_MS);
}

async function skipPendingTelegramUpdates() {
    try {
        const result = await telegramApi('getUpdates', { offset: -1, timeout: 0 });
        if (result.ok && result.result.length > 0) {
            telegramOffset = result.result[result.result.length - 1].update_id + 1;
        }
    } catch (e) {
        console.error(new Date().toISOString(), 'Telegram init error:', e);
    }
}

const cookieData = JSON.parse(fs.readFileSync(COOKIE_FILE, 'utf8'));
const alexa = new Alexa();

alexa.on('cookie', (cookie, csrf, macDms) => {
    cookieData.loginCookie = cookie;
    cookieData.csrf = csrf;
    cookieData.macDms = macDms;
    fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookieData, null, 2));
    console.log(new Date().toISOString(), 'Cookie refreshed and saved');
});

const SPEAK_GAP_MS = 3500; // rough time to let the device finish speaking before the next phrase

function speakSequentially(phrases, index) {
    if (index >= phrases.length) {
        return;
    }
    alexa.sendSequenceCommand(ECHO_DOT_SERIAL, 'speak', phrases[index], (err) => {
        if (err) {
            console.error(new Date().toISOString(), 'Speak error:', err);
        } else {
            console.log(new Date().toISOString(), 'Spoke:', phrases[index]);
        }
        setTimeout(() => speakSequentially(phrases, index + 1), SPEAK_GAP_MS);
    });
}

alexa.init({
    cookie: cookieData,
    formerRegistrationData: cookieData,
    proxyOnly: false,
    amazonPage: 'amazon.com',
    alexaServiceHost: 'pitangui.amazon.com',
    useWsMqtt: false,
    cookieRefreshInterval: 7 * 24 * 60 * 60 * 1000,
}, async (err) => {
    if (err) {
        console.error('INIT ERROR:', err);
        process.exit(1);
    }
    console.log(new Date().toISOString(), 'Alexa init OK, connecting to MQTT...');

    const client = mqtt.connect(MQTT_BROKER);

    client.on('connect', () => {
        console.log(new Date().toISOString(), 'MQTT connected, subscribing to', MOTION_TOPIC);
        client.subscribe(MOTION_TOPIC);
    });

    client.on('message', (topic, message) => {
        const value = message.toString().trim();
        console.log(new Date().toISOString(), 'MQTT message:', topic, value);
        if (value === '1') {
            speakSequentially(MESSAGES.detected, 0);
        } else if (value === '0') {
            speakSequentially(MESSAGES.cleared, 0);
        }
    });

    client.on('error', (err) => {
        console.error(new Date().toISOString(), 'MQTT error:', err);
    });

    await skipPendingTelegramUpdates();
    console.log(new Date().toISOString(), 'Telegram assistant polling started');
    pollTelegram();
});
