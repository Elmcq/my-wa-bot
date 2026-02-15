import axios from 'axios';

export default {
    name: 'weather',
    aliases: ['cuaca', 'infocuaca'],
    category: 'utility',
    execute: async (sock, msg, from, args, db) => {
        try {
            // Target API: OpenWeather (Surabaya Fixed)
            const url = 'https://api.openweathermap.org/data/2.5/weather?q=Surabaya&units=metric&lang=id&appid=bd4b4d1db50784be9efbeea4df537945';

            const response = await axios.get(url);
            const data = response.data;

            // Extract Data
            const temp = Math.round(data.main.temp);
            const weather = data.weather[0];
            const desc = weather.description;
            const humidity = data.main.humidity;
            const wind = data.wind.speed;

            // Logic Saran (Suroboyoan)
            let saran = "Jogo kesehatan rek! 😷";
            if (temp > 32) saran = "⚠️ Panas kenthang-kenthang! Ojok lali ngombe es teh ben gak semaput. ☀️";
            if (desc.includes('hujan')) saran = "⛈️ Udan deres rek, ati-ati lunyu lan banjir. Sedia mantel!";
            if (weather.main === 'Clouds') saran = "☁️ Mendung syahdu, enak gae turu.";
            if (temp < 25) saran = "🥶 Adem ayem, wayahe kemulan.";

            // Formatting Output with Template Literals (Backticks)
            const caption = `☁️ **PRAKIRAAN CUACA SURABAYA** ☁️\n\n` +
                `🌡️ **Suhu:** ${temp}°C\n` +
                `🌤️ **Kondisi:** ${desc.charAt(0).toUpperCase() + desc.slice(1)}\n` +
                `💧 **Kelembapan:** ${humidity}%\n` +
                `🌬️ **Angin:** ${wind} km/jam\n\n` +
                `💡 *Saran:* ${saran}`;

            return sock.sendMessage(from, { text: caption });

        } catch (error) {
            console.error('Weather CMD Error:', error);
            // Safe Error Message
            return sock.sendMessage(from, { text: '❌ Gagal mengambil data cuaca Surabaya. Coba lagi nanti!' });
        }
    }
};
