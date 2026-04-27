const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const Uyari = require("../../Models/Uyari");

module.exports = {
    name: ["ozel", "uyar-temizle"],
    description: "Bir kullanıcının tüm uyarılarını siler.",
    category: "Ozel",
    options: [
        {
            name: "kullanici",
            description: "Uyarıları temizlenecek kullanıcı.",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ],
    permissions: {
        channel: [],
        bot: [],
        user: [PermissionFlagsBits.Administrator],
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

        const hedef = interaction.options.getUser("kullanici");
        const kayit = await Uyari.findOne({ guildId: interaction.guild.id, userId: hedef.id });

        if (!kayit || kayit.uyarilar.length === 0) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor("Red").setDescription(`${hedef.tag} adlı kullanıcının hiç uyarısı yok.`)]
            });
        }

        const eskiSayi = kayit.uyarilar.length;
        kayit.uyarilar = [];
        await kayit.save();

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle("🗑️ Uyarılar Temizlendi")
                    .setDescription(`${hedef.tag} adlı kullanıcının **${eskiSayi}** uyarısı silindi.`)
                    .addFields(
                        { name: "Kullanıcı", value: `${hedef}`, inline: true },
                        { name: "Yetkili", value: `${interaction.user}`, inline: true }
                    )
                    .setTimestamp()
            ]
        });
    },
};
