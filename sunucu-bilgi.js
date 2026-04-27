const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: ["ozel", "sunucu-bilgi"],
    description: "Sunucu hakkında detaylı bilgi gösterir.",
    category: "Ozel",
    options: [],
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

        const guild = interaction.guild;
        await guild.fetch();

        const uye = guild.memberCount;
        const botlar = guild.members.cache.filter(m => m.user.bot).size;
        const insanlar = uye - botlar;

        const kanallar = guild.channels.cache;
        const metinKanal = kanallar.filter(c => c.type === 0).size;
        const sesKanal = kanallar.filter(c => c.type === 2).size;
        const kategori = kanallar.filter(c => c.type === 4).size;
        const duyuruKanal = kanallar.filter(c => c.type === 5).size;

        const roller = guild.roles.cache.size - 1;
        const emojiler = guild.emojis.cache.size;
        const stickerler = guild.stickers.cache.size;

        const dogrulama = {
            NONE: "Yok",
            LOW: "Düşük (Doğrulanmış e-posta)",
            MEDIUM: "Orta (5+ dakika üyesi)",
            HIGH: "Yüksek (10+ dakika üyesi)",
            VERY_HIGH: "Çok Yüksek (Telefon doğrulamalı)",
        };

        const nitroBoost = guild.premiumSubscriptionCount || 0;
        const nitroSeviye = guild.premiumTier;
        const nitroSeviyeleri = { 0: "Seviye yok", 1: "Seviye 1", 2: "Seviye 2", 3: "Seviye 3" };

        const olusturma = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>\n(<t:${Math.floor(guild.createdTimestamp / 1000)}:R>)`;

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`📊 ${guild.name} — Sunucu Bilgileri`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: "🆔 Sunucu ID", value: `\`${guild.id}\``, inline: true },
                { name: "👑 Sahip", value: `<@${guild.ownerId}>`, inline: true },
                { name: "📅 Kuruluş Tarihi", value: olusturma, inline: false },
                { name: "👥 Üyeler", value: `👤 İnsanlar: **${insanlar}**\n🤖 Botlar: **${botlar}**\n📊 Toplam: **${uye}**`, inline: true },
                { name: "💬 Kanallar", value: `📝 Metin: **${metinKanal}**\n🔊 Ses: **${sesKanal}**\n📢 Duyuru: **${duyuruKanal}**\n📁 Kategori: **${kategori}**`, inline: true },
                { name: "🎭 Roller", value: `**${roller}** adet`, inline: true },
                { name: "😀 Emojiler", value: `**${emojiler}** emoji, **${stickerler}** sticker`, inline: true },
                { name: "🔒 Doğrulama Seviyesi", value: dogrulama[guild.verificationLevel] || "Bilinmiyor", inline: true },
                { name: "💎 Nitro Boost", value: `${nitroSeviyeleri[nitroSeviye]} • **${nitroBoost}** boost`, inline: true },
            )
            .setImage(guild.bannerURL({ size: 1024 }) || null)
            .setTimestamp();

        interaction.editReply({ embeds: [embed] });
    },
};
