const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: ["ozel", "sil"],
    description: "Belirtilen kanaldan toplu mesaj siler (1-100 arası).",
    category: "Ozel",
    options: [
        {
            name: "miktar",
            description: "Silinecek mesaj sayısı (1-100).",
            type: ApplicationCommandOptionType.Integer,
            required: true,
            min_value: 1,
            max_value: 100,
        },
        {
            name: "kullanici",
            description: "Sadece bu kullanıcının mesajlarını sil.",
            type: ApplicationCommandOptionType.User,
            required: false,
        },
    ],
    permissions: {
        channel: [],
        bot: [PermissionFlagsBits.ManageMessages],
        user: [PermissionFlagsBits.ManageMessages],
    },
    settings: {
        isPremium: false,
        isPlayer: false,
        isOwner: false,
        inVoice: false,
        sameVoice: false,
    },
    run: async (interaction, client) => {
        await interaction.deferReply({ ephemeral: true });

        const miktar = interaction.options.getInteger("miktar");
        const hedefUser = interaction.options.getUser("kullanici");

        let mesajlar = await interaction.channel.messages.fetch({ limit: 100 });

        if (hedefUser) {
            mesajlar = mesajlar.filter(m => m.author.id === hedefUser.id);
        }

        mesajlar = mesajlar.filter(m => Date.now() - m.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
        mesajlar = [...mesajlar.values()].slice(0, miktar);

        if (mesajlar.length === 0) {
            return interaction.editReply({ content: "Silinecek mesaj bulunamadı. (14 günden eski mesajlar silinemez)" });
        }

        const silinenSayi = await interaction.channel.bulkDelete(mesajlar, true).then(d => d.size).catch(() => 0);

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle("🧹 Mesajlar Silindi")
                    .setDescription(`**${silinenSayi}** mesaj başarıyla silindi.${hedefUser ? `\n👤 Filtre: ${hedefUser.tag}` : ""}`)
                    .setTimestamp()
            ]
        });
    },
};
