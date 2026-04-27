const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: ["moderasyon", "kullanici-bilgi"],
    description: "Bir kullanıcının tüm bilgilerini gösterir.",
    category: "Moderasyon",
    options: [
        {
            name: "kullanici",
            description: "Bilgileri gösterilecek kullanıcı. Boş bırakılırsa senin bilgilerin gösterilir.",
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],
    permissions: {
        channel: [],
        bot: [],
        user: [],
    },
    settings: {
        isPremium: false,
        isPlayer: false,
        isOwner: false,
        inVoice: false,
        sameVoice: false,
    },
    run: async (interaction, client) => {
        await interaction.deferReply();

        const hedefUser = interaction.options.getUser("kullanici") || interaction.user;
        const hedefUye = interaction.guild.members.cache.get(hedefUser.id)
            || await interaction.guild.members.fetch(hedefUser.id).catch(() => null);

        const hesapOlusturma = `<t:${Math.floor(hedefUser.createdTimestamp / 1000)}:F>\n(<t:${Math.floor(hedefUser.createdTimestamp / 1000)}:R>)`;

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`${hedefUser.tag} — Kullanıcı Bilgileri`)
            .setThumbnail(hedefUser.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: "👤 Kullanıcı Adı", value: `${hedefUser.tag}`, inline: true },
                { name: "🆔 ID", value: `\`${hedefUser.id}\``, inline: true },
                { name: "🤖 Bot mu?", value: hedefUser.bot ? "Evet" : "Hayır", inline: true },
                { name: "📅 Hesap Oluşturma", value: hesapOlusturma, inline: false },
            )
            .setTimestamp();

        if (hedefUye) {
            const sunucuyaGiris = `<t:${Math.floor(hedefUye.joinedTimestamp / 1000)}:F>\n(<t:${Math.floor(hedefUye.joinedTimestamp / 1000)}:R>)`;
            const roller = hedefUye.roles.cache
                .filter(r => r.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(r => `${r}`)
                .slice(0, 10)
                .join(", ") || "Yok";

            const enYuksekRol = hedefUye.roles.highest.id !== interaction.guild.id
                ? `${hedefUye.roles.highest}`
                : "Yok";

            embed.addFields(
                { name: "📥 Sunucuya Giriş", value: sunucuyaGiris, inline: false },
                { name: "📛 Sunucu Adı", value: hedefUye.displayName, inline: true },
                { name: "🏆 En Yüksek Rol", value: enYuksekRol, inline: true },
                { name: `🎭 Roller (${hedefUye.roles.cache.size - 1})`, value: roller, inline: false },
            );

            if (hedefUye.premiumSince) {
                embed.addFields({
                    name: "💎 Boost",
                    value: `<t:${Math.floor(hedefUye.premiumSinceTimestamp / 1000)}:R> beri boost atıyor`,
                    inline: false
                });
            }

            const durum = hedefUye.presence?.status || "Çevrimdışı";
            const durumEmoji = { online: "🟢", idle: "🟡", dnd: "🔴", offline: "⚫", invisible: "⚫" };
            embed.addFields({
                name: "📶 Durum",
                value: `${durumEmoji[durum] || "⚫"} ${durum === "online" ? "Çevrimiçi" : durum === "idle" ? "Boşta" : durum === "dnd" ? "Rahatsız Etme" : "Çevrimdışı"}`,
                inline: true
            });
        } else {
            embed.setFooter({ text: "Bu kullanıcı sunucuda değil — sadece hesap bilgileri gösteriliyor." });
        }

        embed.setImage(hedefUser.bannerURL({ dynamic: true, size: 1024 }) || null);

        interaction.editReply({ embeds: [embed] });
    },
};
