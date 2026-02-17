import { downloadMediaMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tmpDir = path.join(__dirname, '..', '..', 'tmp');

// Ensure tmp directory exists
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
}

export default {
    name: 'sticker',
    category: 'utility',
    execute: async (sock, msg, from, args, db) => {
        // [Menerima Pesan]: Bot mendeteksi pesan masuk berupa gambar atau video
        const isQuoted = !!msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        let messageToDownload = isQuoted ? msg.message.extendedTextMessage.contextInfo.quotedMessage : msg.message;
        let messageType = Object.keys(messageToDownload)[0];

        // Handle if quoted message is viewOnce
        if (messageType === 'viewOnceMessageV2') {
            messageToDownload = messageToDownload.viewOnceMessageV2.message;
            messageType = Object.keys(messageToDownload)[0];
        }

        const isImage = messageType === 'imageMessage';
        const isVideo = messageType === 'videoMessage';

        // [Cek Caption]: Bot memeriksa apakah ada teks (caption) !sticker pada media tersebut
        // (Note: Command handler di index.js sudah memastikan caption diawali !sticker)
        if (!isImage && !isVideo) {
            return sock.sendMessage(from, { text: '❌ Kirim/Balas gambar atau video/gif dengan caption *!sticker*' }, { quoted: msg });
        }

        // Limit video duration (Maksimal 7 detik)
        if (isVideo) {
            const seconds = messageToDownload.videoMessage.seconds;
            if (seconds > 7) {
                return sock.sendMessage(from, { text: '❌ Video maksimal 7 detik agar tidak terlalu berat!' }, { quoted: msg });
            }
        }

        await sock.sendMessage(from, { text: '⏳ Tunggu sebentar ya, stiker kamu sedang diproses!' }, { quoted: msg });

        try {
            // [Konversi Otomatis] & [Kirim Balasan]

            // 2. Download Media
            // To be safe with quoted messages in Baileys, we construct a "fake" message object
            const keys = isQuoted ? msg.message.extendedTextMessage.contextInfo.quotedMessage : msg.message;

            const buffer = await downloadMediaMessage(
                {
                    key: msg.key, // Key doesn't matter much for download locally usually, but structure does
                    message: keys
                },
                'buffer',
                {},
                {
                    logger: console,
                    reuploadRequest: sock.updateMediaMessage
                }
            );

            // 3. Process Media
            // Gambar: Bot menggunakan library sharp untuk mengubah ukuran menjadi 512x512 dan format ke .webp
            if (isImage) {
                const stickerBuffer = await sharp(buffer)
                    .resize(512, 512, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .webp() // default is static webp
                    .toBuffer();

                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });

            } else if (isVideo) {
                // GIF/Video: Bot menggunakan fluent-ffmpeg untuk memotong durasi (maksimal 7 detik) dan mengubahnya menjadi animated webp
                const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                const inputPath = path.join(tmpDir, `input_${uniqueId}.mp4`);
                const outputPath = path.join(tmpDir, `output_${uniqueId}.webp`);

                try {
                    fs.writeFileSync(inputPath, buffer);

                    await new Promise((resolve, reject) => {
                        ffmpeg(inputPath)
                            .inputFormat('mp4')
                            .on('error', (err) => reject(err))
                            .on('end', () => resolve(true))
                            .addOutputOptions([
                                '-vcodec', 'libwebp',
                                '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15, pad=512:512:-1:-1:color=white@0.0, split [a][b]; [a] palettegen [p]; [b][p] paletteuse',
                                '-loop', '0',
                                '-ss', '00:00:00.0', // Start
                                '-t', '00:00:07.0',  // Cut duration (7s max)
                                '-preset', 'default',
                                '-an',
                                '-vsync', '0'
                            ])
                            .toFormat('webp')
                            .save(outputPath);
                    });

                    if (fs.existsSync(outputPath)) {
                        const stickerBuffer = fs.readFileSync(outputPath);
                        await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
                    }
                } finally {
                    // [Hapus Otomatis]: Hapus file sementara dengan fs.unlink
                    if (fs.existsSync(inputPath)) {
                        fs.unlink(inputPath, (err) => {
                            if (err) console.error(`[Sticker] Failed to delete temp file ${inputPath}:`, err);
                        });
                    }
                    if (fs.existsSync(outputPath)) {
                        fs.unlink(outputPath, (err) => {
                            if (err) console.error(`[Sticker] Failed to delete temp file ${outputPath}:`, err);
                        });
                    }
                }
            }

        } catch (error) {
            console.error('[Sticker] Error:', error);
            await sock.sendMessage(from, { text: '❌ Gagal membuat stiker. Pastikan format media benar / tidak terlalu besar.' }, { quoted: msg });
        }
    }
};
