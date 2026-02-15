export default {
    name: 'ramadan',
    category: 'utility',
    execute: async (sock, msg, from, args, db) => {
        const txt = `🌙 *Jadwal Ramadan Surabaya Hari Ini* 🌙
        
📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}

🔔 *Sahur*: 03:00 WIB
🛑 *Imsak*: 04:05 WIB
🍽️ *Buka Puasa*: 17:55 WIB

Semoga puasa kita hari ini diterima oleh Allah SWT. Aamiin. 🙏`;

        await sock.sendMessage(from, { text: txt }, { quoted: msg });
    }
}
