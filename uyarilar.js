const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const Uyari = require("../../Models/Uyari");

module.exports = {
    name: ["ozel", "uyarilar"],
    description: "Bir kullanıcının tüm uyarılarını listeler.",
    category: "Ozel",
    options: [
        {
            name: "kullanici",
            description: "Uyarıları görüntülenecek kullanıcı.",
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],
    permissions: {
        channel: [],
        bot: [],
        user: [PermissionFlagsBits.ModerateMembers],
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

        const hedef = interaction.options.getUser("kullanici") || interaction.user;
        const kayit = await Uyari.findOne({ guildId: interaction.guild.id, userId: hedef.id });

        if (!kayit || kayit.uyarilar.length === 0) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`${hedef.tag} adlı kullanıcının hiç uyarısı yok.`)
                ]
            });
        }

        const uyariListesi = kayit.uyarilar.map((u, i) => {
            const tarih = `<t:${Math.floor(new Date(u.tarih).getTime() / 1000)}:d>`;
            return `**${i + 1}.** ${u.sebep} — <@${u.yetkili}> • ${tarih}`;
        }).join("\n");

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle(`⚠️ ${hedef.tag} — Uyarı Geçmişi`)
                    .setThumbnail(hedef.displayAvatarURL({ dynamic: true }))
                    .setDescription(uyariListesi)
                    .setFooter({ text: `Toplam: ${kayit.uyarilar.length} uyarı` })
                    .setTimestamp()
            ]
        });
    },
};
