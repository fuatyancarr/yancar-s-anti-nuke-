const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: ["moderasyon", "unban"],
    description: "Yasaklı bir kullanıcının yasağını kaldırır.",
    category: "Moderasyon",
    options: [
        {
            name: "kullanici-id",
            description: "Yasağı kaldırılacak kullanıcının ID'si.",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: "sebep",
            description: "Yasak kaldırma sebebi.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
    permissions: {
        channel: [],
        bot: [PermissionFlagsBits.BanMembers],
        user: [PermissionFlagsBits.BanMembers],
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

        const kullaniciId = interaction.options.getString("kullanici-id");
        const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi.";

        const banList = await interaction.guild.bans.fetch().catch(() => null);
        if (!banList) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setDescription("Ban listesi alınamadı. Yetkim var mı kontrol et.")
                ]
            });
        }

        const banlıKullanici = banList.get(kullaniciId);
        if (!banlıKullanici) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setDescription("Bu ID'ye sahip yasaklı bir kullanıcı bulunamadı.")
                ]
            });
        }

        await interaction.guild.bans.remove(kullaniciId, `${interaction.user.tag}: ${sebep}`).catch(() => null);

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle("✅ Yasak Kaldırıldı")
                    .addFields(
                        { name: "Kullanıcı", value: `\`${banlıKullanici.user.tag}\` (${kullaniciId})`, inline: true },
                        { name: "Yetkili", value: `${interaction.user}`, inline: true },
                        { name: "Sebep", value: sebep }
                    )
                    .setTimestamp()
            ],
        });
    },
};
