export default {
    name: "help",
    category: "utility",
    execute: async (
        sock,
        msg,
        from,
        args,
        db,
        { isAdmin, isOwner, senderNumber },
    ) => {
        const categoryArg = args[0]?.toLowerCase();
        const pusatGroupId = db.__settings__?.pusatGroupId;
        const arenaGroupId = db.__settings__?.arenaGroupId;
        const isGroup1 = from === pusatGroupId;
        const isArena = from === arenaGroupId;

        // Main Menu
        if (!categoryArg) {
            let helpMsg = `📚 *MENU BANTUAN [SMP 46]* 📚\n\n`;

            // Global Categories
            helpMsg += `📊 *STATS* - Profil, Level, & Wealth\n`;
            helpMsg += `🏦 *BANK* - Tabungan & Pasar\n`;
            helpMsg += `💰 *EKONOMI* - Dompet & Transaksi\n`;
            helpMsg += `ℹ️ *info* - Info Gempa & Cuaca\n`;
            helpMsg += `📦 *toko* - Jual Beli & Brankas\n`;
            helpMsg += `💼 *misi* - Tugas & Hadiah Koin\n`;
            helpMsg += `🎮 *GAME* - PvP & Hiburan\n`;
            helpMsg += `⚙️ *Sistem* - AFK, Quote & Role\n`;

            // Group Specific Categories
            if (isGroup1) {
                helpMsg += `🏛️ *Server* - Status & Info Server\n`;
            }

            helpMsg += `\n*Pilih kategori untuk melihat detail perintah.*\n`;
            helpMsg += `Contoh: *!help stats*\n\n`;
            helpMsg += `⏱️ _Pesan ini otomatis terhapus dalam 10 detik._`;

            const sentMsg = await sock.sendMessage(
                from,
                { text: helpMsg },
                { skipSweep: true },
            );

            setTimeout(async () => {
                try {
                    await sock.sendMessage(from, { delete: sentMsg.key });
                } catch (e) {}
            }, 10000);

            return;
        }

        // --- Details ---

        if (categoryArg === "stats") {
            const statsHelp =
                `📊 *KATEGORI: STATS* 📊\n\n` +
                `• *!me* - Profil lengkap (Lvl, XP, & Total Kekayaan).\n` +
                `• *!level* - Lihat progress XP kamu saat ini.\n` +
                `• *!rank* - Papan peringkat warga SMP 46.\n` +
                `• *!perizinan* - Cek status izin resmi IUB & IUP.\n\n` +
                `✅ _Tersedia di semua grup._`;
            return sock.sendMessage(from, { text: statsHelp });
        }

        if (categoryArg === "bank") {
            const bankHelp =
                `🏦 *KATEGORI: BANK* 🏦\n\n` +
                `• *!bank* - Cek saldo tabungan kamu di bank.\n` +
                `• *!setor [jml]* - Setor diamond Minecraft ke koin bank.\n` +
                `• *!tarik [jml]* - Tarik koin bank ke diamond Minecraft.\n` +
                `• *!jual [jml] [nama]* - Jual barang di marketplace.\n` +
                `• *!beli [id]* - Beli barang dari marketplace.\n` +
                `• *!daftar-bank [Nama]* - Daftarkan nama bank resmi (10k).\n\n` +
                `🏦 _Fokus: Layanan tabungan dan pasar._\n` +
                `✅ _Tersedia di semua grup._`;
            return sock.sendMessage(from, { text: bankHelp });
        }

        if (categoryArg === "ekonomi") {
            const ekonomiHelp =
                `💰 *KATEGORI: EKONOMI* 💰\n\n` +
                `• *!bal* - Cek saldo dompet (wallet) saat ini.\n` +
                `• *!deposit [jml]* - Menyetor koin (sama dengan !setor).\n` +
                `• *!withdraw [jml]* - Menarik koin (sama dengan !tarik).\n` +
                `• *!transfer [@tag/nomor] [jumlah]* - Kirim koin ke warga lain.\n` +
                `• *!beli-iub* - Beli Izin Usaha Bank (50k).\n` +
                `• *!beli-iup* - Beli Izin Usaha Perdagangan (35k).\n\n` +
                `💰 _Fokus: Manajemen dompet dan transaksi warga._\n` +
                `✅ _Tersedia di semua grup._`;
            return sock.sendMessage(from, { text: ekonomiHelp });
        }

        if (categoryArg === "game") {
            // if (!isArena) return sock.sendMessage(from, { text: '❌ *Akses Ditolak!* Kategori *game* hanya tersedia di *Grup Arena*.' });

            const gameHelp =
                `🎮 *KATEGORI: GAME CENTER* 🎮\n\n` +
                `• *!pool @tag [bet]* - Main Billiard (Adu Skill).\n` +
                `• *!catur @tag [bet]* - Main Catur (Simulasi).\n` +
                `• *!duel @tag [bet]* - Duel kartu anime dengan taruhan.\n` +
                `• *!duel-live @P1 vs @P2* - Simulasi pertarungan WWE!\n` +
                `• *!rob @tag* - Rampok koin member lain.\n` +
                `• *!buy-shield* - Beli perlindungan dari perampokan.\n` +
                `• *!mancing* - Game mancing cari koin.\n` +
                `• *!gacha* - Gacha koin & VIP.\n` +
                `• *!gacha-anime* - Koleksi kartu karakter anime.\n\n` +
                `📍 _Hanya bisa digunakan di Grup Arena._`;
            return sock.sendMessage(from, { text: gameHelp });
        }

        if (categoryArg === "info") {
            const infoHelp =
                `ℹ️ *KATEGORI: INFO* ℹ️\n\n` +
                `• *!infogempa* - Data gempa terbaru dari BMKG.\n` +
                `• *!infocuaca [kota]* - Cek prakiraan cuaca saat ini.\n\n` +
                `✅ _Tersedia di semua grup dan bersifat permanen._`;
            return sock.sendMessage(from, { text: infoHelp });
        }

        if (categoryArg === "sistem") {
            // if (!isGroup1) return sock.sendMessage(from, { text: '❌ *Akses Ditolak!* Kategori *Sistem* hanya tersedia di *Grup Pusat*.' });

            const sistemHelp =
                `⚙️ *KATEGORI: SISTEM* ⚙️\n\n` +
                `• *!afk [alasan]* - Memberikan status AFK saat meninggalkan chat.\n` +
                `• *!quote [teks]* - Kata-kata Hari Ini.\n` +
                `• *!setrole [nama]* - Mengatur nama peran di profil bot kamu.\n\n` +
                `✅ _Tersedia di semua grup._`;
            return sock.sendMessage(from, { text: sistemHelp });
        }

        if (categoryArg === "server") {
            if (!isGroup1)
                return sock.sendMessage(from, {
                    text: "❌ *Akses Ditolak!* Kategori *Server* hanya tersedia di *Grup Pusat*.",
                });

            let serverHelp =
                `🏛️ *KATEGORI: SERVER* 🏛️\n\n` +
                `• *!ip* - Mendapatkan alamat IP Server Bedrock.\n` +
                `• *!status* - Cek status online & jumlah pemain server.\n` +
                `• *!infoserver* - Spesifikasi teknis host bot ini.\n`;

            if (isAdmin || isOwner) {
                serverHelp +=
                    `\n*-- PERINTAH ADMIN --*\n` +
                    `• *!start bedrock* - Jalankan server Bedrock (Admin/Owner).\n` +
                    `• *!stop bedrock* - Matikan server Bedrock (Admin/Owner).\n` +
                    `• *!backup* - Mencadangkan data world (Admin/Owner).\n` +
                    `• *!shutdown* - Matikan host/vps bot total (Admin/Owner).\n` +
                    `• *!acc-iub @tag* - Memberikan izin bank manual.\n` +
                    `• *!cabut-iub @tag* - Mencabut izin bank warga.\n` +
                    `• *!exec [cmd]* - Menjalankan terminal jarak jauh.\n` +
                    `• *!cleanchat* - Membersihkan pesan bot di grup.\n` +
                    `• *!silent-mode* - Mengaktifkan mode hening grup.\n` +
                    `• *!location* - Cek koordinat GPS server IP.\n` +
                    `• *!setkoin @tag [jml]* - Atur saldo user.\n` +
                    `• *!chaos-meter* - Cek tingkat kekacauan server.`;
            }

            serverHelp += `\n\n📍 _Hanya bisa digunakan di Grup Pusat._`;
            return sock.sendMessage(from, { text: serverHelp });
        }

        if (categoryArg === "toko") {
            const tokoHelp =
                `📦 *KATEGORI: TOKO & BRANKAS* 📦\n\n` +
                `*-- PUSAT BELANJA --*\n` +
                `• *!shop* - Menu Utama Administrasi & Pasar.\n` +
                `• *!shop izin* - Beli lisensi resmi (IUB/IUP).\n` +
                `• *!shop pasar* - Lihat barang dagangan warga.\n` +
                `• *!toko-pancing* - Beli peralatan memancing.\n\n` +
                `*-- FITUR IUP --*\n` +
                `• *!simpan* - Masukkan barang ke brankas pusat.\n` +
                `• *!tarik-barang* - Ambil barang dari brankas.\n` +
                `• *!cek-brankas* - Lihat isi brankas barang kamu.\n` +
                `• *!buka-toko* - Membuka toko dagang resmi.\n` +
                `• *!tambah-stok* - Menambah stok barang dagangan.\n` +
                `• *!atur-harga* - Mengatur harga jual barang.\n` +
                `• *!gadai* - Menggadaikan barang berharga.\n\n` +
                `✅ _Tersedia di semua grup._`;
            return sock.sendMessage(from, { text: tokoHelp });
        }

        if (categoryArg === "misi") {
            const misiHelp =
                `💼 *KATEGORI: JOB BOARD* 💼\n\n` +
                `• *!misi* - Lihat daftar tugas yang tersedia.\n` +
                `• *!ambil-misi [id]* - Mengambil tugas tertentu.\n` +
                `• *!setor-misi [id]* - Menyelesaikan tugas & ambil koin.\n` +
                `• *!misi tambah* - Memberikan tugas kepada warga lain.\n\n` +
                `✅ _Tersedia di semua grup._`;
            return sock.sendMessage(from, { text: misiHelp });
        }

        return sock.sendMessage(from, {
            text: "❌ *Kategori tidak ditemukan!* Pilih: STATS, bank, ekonomi, info, toko, misi, game, Sistem, Server.",
        });
    },
};
