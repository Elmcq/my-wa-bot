import axios from "axios";
import FormData from "form-data";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load .env
dotenv.config();

// Helper for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tmpDir = path.join(__dirname, "..", "..", "tmp");

// Ensure tmp directory exists
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

const API_KEY = process.env.VIRUSTOTAL_API_KEY;

export default {
    name: "scan",
    category: "security",
    execute: async (sock, msg, from, args, db) => {
        if (!API_KEY) {
            return sock.sendMessage(
                from,
                {
                    text: "❌ API Key VirusTotal belum dikonfigurasi oleh owner.",
                },
                { quoted: msg },
            );
        }

        const isQuoted =
            !!msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matchUrl = args.join(" ").match(urlRegex);

        // 1. URL Scan Logic
        if (matchUrl) {
            const targetUrl = matchUrl[0];
            await sock.sendMessage(
                from,
                { text: `🔍 Sedang memeriksa URL: ${targetUrl}...` },
                { quoted: msg },
            );

            try {
                // Submit URL
                const encodedParams = new URLSearchParams();
                encodedParams.set("url", targetUrl);

                const scanRes = await axios.post(
                    "https://www.virustotal.com/api/v3/urls",
                    encodedParams,
                    {
                        headers: {
                            "x-apikey": API_KEY,
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    },
                );

                const analysisId = scanRes.data.data.id;

                // Get Report
                const reportRes = await axios.get(
                    `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
                    {
                        headers: { "x-apikey": API_KEY },
                    },
                );

                const stats = reportRes.data.data.attributes.stats;
                const status =
                    stats.malicious > 0
                        ? "❌ BERBAHAYA"
                        : stats.suspicious > 0
                          ? "⚠️ MENCURIGAKAN"
                          : "✅ AMAN";

                const text =
                    `🛡️ *SCAN RESULT*\n` +
                    `📂 *Target:* ${targetUrl}\n` +
                    `✅ *Harmless:* ${stats.harmless}\n` +
                    `⚠️ *Malicious:* ${stats.malicious}\n` +
                    `❓ *Suspicious:* ${stats.suspicious}\n` +
                    `🔍 *Status:* ${status}`;

                return sock.sendMessage(from, { text: text }, { quoted: msg });
            } catch (error) {
                console.error(
                    "[Scan] URL Error:",
                    error.response?.data || error.message,
                );
                return sock.sendMessage(
                    from,
                    { text: "❌ Gagal memindai URL. Pastikan link valid." },
                    { quoted: msg },
                );
            }
        }

        // 2. File Scan Logic (Quoted)
        else if (isQuoted) {
            const quotedMsg =
                msg.message.extendedTextMessage.contextInfo.quotedMessage;
            const messageType = Object.keys(quotedMsg)[0];

            // Check if it's a media message
            if (
                ![
                    "documentMessage",
                    "imageMessage",
                    "videoMessage",
                    "audioMessage",
                ].includes(messageType)
            ) {
                return sock.sendMessage(
                    from,
                    { text: "❌ Reply dokumen/gambar/file yang ingin discan!" },
                    { quoted: msg },
                );
            }

            await sock.sendMessage(
                from,
                { text: "⏳ Mengunduh dan mengupload file untuk scan..." },
                { quoted: msg },
            );

            const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            const tempFilePath = path.join(tmpDir, `scan_${uniqueId}.tmp`);

            try {
                // Download
                const buffer = await downloadMediaMessage(
                    {
                        key: msg.message.extendedTextMessage.contextInfo
                            .stanzaId, // Not used directly but structure needed
                        message: quotedMsg,
                    },
                    "buffer",
                    {},
                    {
                        logger: console,
                        reuploadRequest: sock.updateMediaMessage,
                    },
                );

                fs.writeFileSync(tempFilePath, buffer);

                // Check size (Active VT limit is 32MB for standard, allow up to that)
                const stats = fs.statSync(tempFilePath);
                if (stats.size > 32 * 1024 * 1024) {
                    fs.unlinkSync(tempFilePath);
                    return sock.sendMessage(
                        from,
                        { text: "❌ File terlalu besar! Maksimal 32MB." },
                        { quoted: msg },
                    );
                }

                // Upload
                const form = new FormData();
                form.append("file", fs.createReadStream(tempFilePath));

                const uploadRes = await axios.post(
                    "https://www.virustotal.com/api/v3/files",
                    form,
                    {
                        headers: {
                            "x-apikey": API_KEY,
                            ...form.getHeaders(),
                        },
                    },
                );

                const analysisId = uploadRes.data.data.id;

                // VT File Scanning is async, analysis might not be ready instantly.
                // However, for purposes of this bot, we check the analysis endpoint.
                // If it's "queued", we might need to wait, but VT usually returns a quick initial report or we check the file hash if already known.
                // The /analyses/{id} endpoint returns the status of the *requested* analysis.

                // Let's create a polling mechanism or simply wait a bit.
                // For a simple implementation, we'll try to get it immediately (often "queued")
                // BUT better approach for immediate user feedback: Check if file hash exists first?
                // User asked for "upload", so we stick to upload flow.

                // We will poll a few times
                let reportReady = false;
                let scanODStats = null;

                // Initial wait
                await new Promise((r) => setTimeout(r, 2000));

                for (let i = 0; i < 5; i++) {
                    const checkRes = await axios.get(
                        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
                        {
                            headers: { "x-apikey": API_KEY },
                        },
                    );

                    const attr = checkRes.data.data.attributes;
                    if (attr.status === "completed") {
                        scanODStats = attr.stats;
                        reportReady = true;
                        break;
                    }
                    await new Promise((r) => setTimeout(r, 3000)); // Wait 3s between checks
                }

                if (!reportReady) {
                    // Cleanup
                    if (fs.existsSync(tempFilePath))
                        fs.unlinkSync(tempFilePath);
                    return sock.sendMessage(
                        from,
                        {
                            text: "⏳ Scan masih berjalan di server VirusTotal. Silakan cek nanti atau coba file lain.",
                        },
                        { quoted: msg },
                    );
                }

                const status =
                    scanODStats.malicious > 0
                        ? "❌ BERBAHAYA"
                        : scanODStats.suspicious > 0
                          ? "⚠️ MENCURIGAKAN"
                          : "✅ AMAN";
                const text =
                    `🛡️ *SCAN RESULT (FILE)*\n` +
                    `✅ *Harmless:* ${scanODStats.harmless}\n` +
                    `⚠️ *Malicious:* ${scanODStats.malicious}\n` +
                    `❓ *Suspicious:* ${scanODStats.suspicious}\n` +
                    `🔍 *Status:* ${status}`;

                await sock.sendMessage(from, { text: text }, { quoted: msg });
            } catch (error) {
                console.error(
                    "[Scan] File Error:",
                    error.response?.data || error.message,
                );
                await sock.sendMessage(
                    from,
                    { text: "❌ Terjadi kesalahan saat scanning file." },
                    { quoted: msg },
                );
            } finally {
                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
            }
        } else {
            return sock.sendMessage(
                from,
                {
                    text: "❌ Kirim link *!scan [url]* atau reply file dengan *!scan*",
                },
                { quoted: msg },
            );
        }
    },
};
