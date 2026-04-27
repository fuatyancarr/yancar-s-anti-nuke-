const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: ["ozel", "yavascek"],
    description: "Kanala yavaş mod uygular. 0 saniye girerek kapatabilirsin.",
    category: "Ozel",
    options: [
        {
            name: "sure",
            description: "Yavaş mod süresi (saniye). 0 = kapat.",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            choices: [
                { name: "Kapat (0s)", value: 0 },
                { name: "5 saniye", value: 5 },
                { name: "10 saniye", value: 10 },
                { name: "30 saniye", value: 30 },
                { name: "1 dakika", value: 60 },
                { name: "5 dakika", value: 300 },
                { name: "10 dakika", value: 600 },
                { name: "30 dakika", value: 1800 },
                { name: "1 saat", value: 3600 },
            ],
        },
        {
            name: "kanal",
            description: "Yavaş mod uygulanacak kanal. Boş bırakılırsa mevcut kanal.",
            type: ApplicationCommandOptionType.Channel,
            required: false,
        },
    ],
    permissions: {
        channel: [],
        bot: [PermissionFlagsBits.ManageChannels],
        user: [PermissionFlagsBits.ManageChannels],
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

        const sure = interaction.options.getInteger("sure");
        const kanal = interaction.options.getChannel("kanal") || interaction.channel;

        await kanal.setRateLimitPerUser(sure);

        const sureMesaj = sure === 0 ? "Yavaş mod **kapatıldı**." : `Yavaş mod **${sure} saniye** olarak ayarlandı.`;

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle("🐢 Yavaş Mod")
                    .addFields(
                        { name: "Kanal", value: `${kanal}`, inline: true },
                        { name: "Durum", value: sureMesaj, inline: true },
                        { name: "Yetkili", value: `${interaction.user}`, inline: true }
                    )
                    .setTimestamp()
            ]
        });
    },
};
