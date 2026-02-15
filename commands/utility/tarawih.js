export default {
    name: 'tarawih',
    category: 'utility',
    execute: async (sock, msg, from, args, db) => {
        const txt = `🕌 *Tips Tarawih SMP 46* 🕌

1. **Niat yang Ikhlas**: Luruskan niat semata-mata karena Allah SWT.
2. **Pakaian Bersih**: Gunakan pakaian yang bersih, suci, dan nyaman.
3. **Bawa Perlengkapan**: Bawa sajadah sendiri dan botol minum jika diperlukan.
4. **Jaga Kebersihan**: Jangan buang sampah sembarangan di area masjid.
5. **Tertib**: Parkir kendaraan dengan rapi dan tidak berisik saat di dalam masjid.

Selamat menunaikan ibadah Sholat Isya dan Tarawih! 🙏`;

        await sock.sendMessage(from, { text: txt }, { quoted: msg });
    }
}
