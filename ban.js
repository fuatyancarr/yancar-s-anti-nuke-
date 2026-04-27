const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: ["moderasyon", "ban"],
    description: "Belirtilen kullanıcıyı sunucudan yasaklar.",
    category: "Moderasyon",
    options: [
        {
            name: "kullanici",
            description: "Yasaklanacak kullanıcı.",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "sebep",
            description: "Yasaklama sebebi.",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: "mesaj-sil",
            description: "Kaç günlük mesajları silinsin? (0-7)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
            choices: [
                { name: "Silme", value: 0 },
                { name: "1 Gün", value: 1 },
                { name: "3 Gün", value: 3 },
                { name: "7 Gün", value: 7 },
            ],
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

        const hedef = interaction.options.getUser("kullanici");
        const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi.";
        const mesajSil = interaction.options.getInteger("mesaj-sil") ?? 0;

        if (hedef.id === interaction.user.id) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setDescription("Kendin kendini yasaklayamazsın.")
                ],
            });
        }

        if (hedef.id === client.user.id) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setDescription("Beni yasaklayamazsın.")
                ],
            });
        }

        const hedefUye = interaction.guild.members.cache.get(hedef.id);
        if (hedefUye) {
            if (hedefUye.roles.highest.position >= interaction.member.roles.highest.position) {
                return interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setDescription("Bu kullanıcının rolü seninkinden yüksek veya eşit, yasaklayamazsın.")
                    ],
                });
            }

            try {
                await hedefUye.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setTitle(`${interaction.guild.name} sunucusundan yasaklandın!`)
                            .addFields(
                                { name: "Sebep", value: sebep },
                                { name: "Yetkili", value: `${interaction.user.tag}` }
                            )
                    ]
                }).catch(() => {});
            } catch {}
        }

        await interaction.guild.bans.create(hedef.id, {
            reason: `${interaction.user.tag}: ${sebep}`,
            deleteMessageDays: mesajSil,
        }).catch(() => null);

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle("🔨 Kullanıcı Yasaklandı")
                    .addFields(
                        { name: "Kullanıcı", value: `${hedef} \`${hedef.tag}\``, inline: true },
                        { name: "Yetkili", value: `${interaction.user}`, inline: true },
                        { name: "Sebep", value: sebep }
                    )
                    .setTimestamp()
            ],
        });
    },
};
