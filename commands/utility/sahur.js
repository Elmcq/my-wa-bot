import { getTimeUntilImsak } from '../../utility/ramadan.js';

export default {
    name: 'sahur',
    category: 'utility',
    execute: async (sock, msg, from, args, db) => {
        // Calculate remaining time
        // Note: getTimeUntilImsak calculates based on current time vs 04:05
        // If it's past 04:05, it might show time until tomorrow.
        const now = new Date();
        const currentHour = now.getHours();

        // Simple logic: if it's already past 10 AM, we assume they are asking for tomorrow's sahur.
        // If it's early morning (before 4 AM), it's for today.

        // However, the helper function `getTimeUntilImsak` handles "next occurrence".
        // Let's just use it directly.

        const nowTime = new Date();
        const target = new Date();
        target.setHours(4, 5, 0, 0); // User requested 04:05

        if (nowTime > target) {
            target.setDate(target.getDate() + 1);
        }

        const diffMs = target - nowTime;
        const diffHrs = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        let timeString = "";
        if (diffHrs > 0) timeString += `${diffHrs} jam `;
        timeString += `${diffMins} menit`;

        const txt = `🌙 *Jadwal Imsakiyah Surabaya* 🌙
        
📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}
⏰ Waktu Imsak: *04:05 WIB*
⏳ Menuju Imsak: *${timeString}* lagi.

💡 *Tips Sahur Sehat:*
1. Awali dengan Bismillah.
2. Makan Kurma (sunnah Nabi).
3. Minum air putih yang cukup agar tidak dehidrasi.
4. Jangan tidur langsung setelah makan!

Selamat berpuasa! 🙏`;

        await sock.sendMessage(from, { text: txt }, { quoted: msg });
    }
}
