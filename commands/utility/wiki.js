import axios from "axios";

export default {
    name: "wiki",
    category: "utility",
    execute: async (sock, msg, from, args, db) => {
        if (args.length === 0) {
            return sock.sendMessage(
                from,
                {
                    text: "❌ Harap masukkan kata kunci! Contoh: *!wiki Soekarno*",
                },
                { quoted: msg },
            );
        }

        // Memastikan huruf pertama kapital agar lebih akurat dicari Wikipedia
        let query = args.join(" ");
        query = query.charAt(0).toUpperCase() + query.slice(1);

        try {
            const url = `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

            // Tambahkan timeout dan headers agar tidak dianggap spam
            const response = await axios.get(url, {
                timeout: 5000,
                headers: { "User-Agent": "ElMcqBot/1.0 (Contact: Azzam)" },
            });

            const data = response.data;

            // Jika artikel tidak ditemukan (tipe 'disambiguation' atau 'no-extract' bisa terjadi)
            if (!data.title || data.type === "no-extract") {
                return sock.sendMessage(
                    from,
                    { text: `❌ Maaf, artikel "${query}" tidak ditemukan.` },
                    { quoted: msg },
                );
            }

            let text = `📚 *Wikipedia: ${data.title}* 📚\n\n`;
            text += `${data.extract}\n\n`;
            text += `🔗 *Link:* ${data.content_urls.desktop.page}`;

            if (data.thumbnail && data.thumbnail.source) {
                await sock.sendMessage(
                    from,
                    {
                        image: { url: data.thumbnail.source },
                        caption: text,
                    },
                    { quoted: msg },
                );
            } else {
                await sock.sendMessage(from, { text: text }, { quoted: msg });
            }
        } catch (error) {
            // Cek jika errornya adalah 404 (Not Found)
            if (error.response && error.response.status === 404) {
                return sock.sendMessage(
                    from,
                    {
                        text: `❌ Artikel "${query}" tidak ditemukan. Coba cek ejaan atau gunakan istilah lain ya!`,
                    },
                    { quoted: msg },
                );
            }

            console.error("[Wiki] Error:", error.message);
            await sock.sendMessage(
                from,
                { text: "❌ Terjadi kesalahan teknis saat mengambil data." },
                { quoted: msg },
            );
        }
    },
};
