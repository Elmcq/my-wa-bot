import axios from 'axios';

export default {
    name: 'wiki',
    category: 'utility',
    execute: async (sock, msg, from, args, db) => {
        if (args.length === 0) {
            return sock.sendMessage(from, { text: '❌ Harap masukkan kata kunci! Contoh: *!wiki Soekarno*' }, { quoted: msg });
        }

        const query = args.join(' ');

        try {
            // Wikipedia REST API for summary
            // encodeURIComponent is crucial for handling spaces and special characters
            const url = `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

            const response = await axios.get(url);
            const data = response.data;

            if (data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found' || !data.title) {
                return sock.sendMessage(from, { text: '❌ Maaf, artikel tidak ditemukan. Coba cek ejaan kata kuncinya ya!' }, { quoted: msg });
            }

            let text = `📚 *Wikipedia: ${data.title}* 📚\n\n`;
            text += `${data.extract}\n\n`;
            text += `🔗 *Link:* ${data.content_urls.desktop.page}`;

            // Send with image if available
            if (data.thumbnail && data.thumbnail.source) {
                await sock.sendMessage(from, {
                    image: { url: data.thumbnail.source },
                    caption: text
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: text }, { quoted: msg });
            }

        } catch (error) {
            if (error.response && error.response.status === 404) {
                return sock.sendMessage(from, { text: '❌ Maaf, artikel tidak ditemukan. Coba cek ejaan kata kuncinya ya!' }, { quoted: msg });
            }
            console.error('[Wiki] Error:', error);
            await sock.sendMessage(from, { text: '❌ Terjadi kesalahan saat mengambil data dari Wikipedia.' }, { quoted: msg });
        }
    }
}
