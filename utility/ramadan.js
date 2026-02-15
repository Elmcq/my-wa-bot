import cron from 'node-cron';
import fs from 'fs';

const IMSAK_HOUR = 4;
const IMSAK_MINUTE = 5;

// Helper: Calculate time until Imsak (04:05 WIB)
export function getTimeUntilImsak() {
    const now = new Date();
    // Adjust to WIB (UTC+7) manually if server time is different, 
    // but assuming server local time is correct or we use simple date math for now.
    // Ideally we use a library like moment-timezone, but for now we'll rely on local system time or basic offsets if needed.
    // The user requested "simple logic".

    const target = new Date(now);
    target.setHours(IMSAK_HOUR, IMSAK_MINUTE, 0, 0);

    // If target is passed today, set for tomorrow (though this helper is usually called before Imsak)
    if (now > target) {
        target.setDate(target.getDate() + 1);
    }

    const diffMs = target - now;
    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return { hours, minutes, totalMinutes: diffMinutes };
}

let sahurTask = null;

// Scheduler: Runs at 03:00 WIB everyday
export function startSahurScheduler(sock) {
    if (sahurTask) {
        sahurTask.stop();
        console.log('[Scheduler] Stopped previous Sahur task.');
    }

    // Cron pattern: 0 3 * * * (At 03:00)
    sahurTask = cron.schedule('0 3 * * *', async () => {
        console.log('[Scheduler] Running Sahur Reminder...');

        const msg = `🔔 SAHUR! Sahur yuk teman-teman SMP 46. Imsak jam 04:05 WIB. Semangat puasanya! @everyone`;

        const db = JSON.parse(fs.readFileSync('./database.json'));
        const pusatGroupId = db.__settings__?.pusatGroupId;
        const arenaGroupId = db.__settings__?.arenaGroupId;

        const targets = [pusatGroupId, arenaGroupId].filter(id => id); // Filter undefined

        for (const jid of targets) {
            try {
                // Send with mentions
                const metadata = await sock.groupMetadata(jid);
                const participants = metadata.participants.map(p => p.id);

                await sock.sendMessage(jid, {
                    text: msg,
                    mentions: participants
                });
                console.log(`[Scheduler] Sent Sahur reminder to ${jid}`);
            } catch (error) {
                console.error(`[Scheduler] Failed to send to ${jid}:`, error);
            }
        }
    }, {
        timezone: "Asia/Jakarta"
    });

    console.log('[Scheduler] Sahur task started.');
}

let iftarTask = null;

// Scheduler: Runs at 17:55 WIB everyday (Maghrib Surabaya)
export function startIftarScheduler(sock) {
    if (iftarTask) {
        iftarTask.stop();
        console.log('[Scheduler] Stopped previous Iftar task.');
    }

    // Cron pattern: 55 17 * * * (At 17:55)
    iftarTask = cron.schedule('55 17 * * *', async () => {
        console.log('[Scheduler] Running Iftar Reminder...');

        const msg = `🌙 ALHAMDULILLAH, WAKTUNYA BERBUKA! 🌙

Selamat berbuka puasa untuk wilayah Surabaya dan sekitarnya. 

Saran Penting:
1. Awali dengan minum air putih dan makanan ringan (takjil).
2. Dahulukan Sholat Maghrib sebelum makan besar agar ibadah tetap terjaga.
3. Setelah sholat, silakan lanjut makan bersama keluarga.

Selamat beribadah, teman-teman! @everyone`;

        const db = JSON.parse(fs.readFileSync('./database.json'));

        const pusatGroupId = db.__settings__?.pusatGroupId;
        const arenaGroupId = db.__settings__?.arenaGroupId;

        const targets = [pusatGroupId, arenaGroupId].filter(id => id); // Filter undefined

        for (const jid of targets) {
            try {
                // Send with mentions
                const metadata = await sock.groupMetadata(jid);
                const participants = metadata.participants.map(p => p.id);

                await sock.sendMessage(jid, {
                    text: msg,
                    mentions: participants
                });
                console.log(`[Scheduler] Sent Iftar reminder to ${jid}`);
            } catch (error) {
                console.error(`[Scheduler] Failed to send to ${jid}:`, error);
            }
        }
    }, {
        timezone: "Asia/Jakarta"
    });

    console.log('[Scheduler] Iftar task started.');
}

let tarawihTask = null;

// Scheduler: Runs at 18:55 WIB everyday (Isya Surabaya)
export function startTarawihScheduler(sock) {
    if (tarawihTask) {
        tarawihTask.stop();
        console.log('[Scheduler] Stopped previous Tarawih task.');
    }

    // Cron pattern: 55 18 * * * (At 18:55)
    tarawihTask = cron.schedule('55 18 * * *', async () => {
        console.log('[Scheduler] Running Tarawih Reminder...');

        const msg = `🕌 PERSIAPAN TARAWIH 🕌

Selamat malam teman-teman SMP 46! Waktu Isya untuk Surabaya sudah tiba. Yuk, segera bersiap-siap menuju masjid untuk sholat Isya dan Tarawih berjamaah. Jangan lupa tetap jaga ketertiban ya! @everyone`;

        const db = JSON.parse(fs.readFileSync('./database.json'));
        const pusatGroupId = db.__settings__?.pusatGroupId;
        const arenaGroupId = db.__settings__?.arenaGroupId;

        const targets = [pusatGroupId, arenaGroupId].filter(id => id); // Filter undefined

        for (const jid of targets) {
            try {
                // Send with mentions
                const metadata = await sock.groupMetadata(jid);
                const participants = metadata.participants.map(p => p.id);

                await sock.sendMessage(jid, {
                    text: msg,
                    mentions: participants
                });
                console.log(`[Scheduler] Sent Tarawih reminder to ${jid}`);
            } catch (error) {
                console.error(`[Scheduler] Failed to send to ${jid}:`, error);
            }
        }
    }, {
        timezone: "Asia/Jakarta"
    });

    console.log('[Scheduler] Tarawih task started.');
}

export function startRamadanSchedulers(sock) {
    startSahurScheduler(sock);
    startIftarScheduler(sock);
    startTarawihScheduler(sock);
}
