export default {
    name: 'doa',
    category: 'utility',
    execute: async (sock, msg, from, args, db) => {
        const txt = `🤲 *Doa Berbuka Puasa* 🤲

*Arab:*
ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ

*Latin:*
_Dzahabaz zhama'u wabtallatil 'uruuqu wa tsabatal ajru insya Allah._

*Artinya:*
"Telah hilang rasa haus, dan urat-urat telah basah, serta pahala telah tetap, insya Allah."

Selamat berbuka puasa! 🙏`;

        await sock.sendMessage(from, { text: txt }, { quoted: msg });
    }
}
