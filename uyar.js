const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const Uyari = require("../../Models/Uyari");

module.exports = {
    name: ["ozel", "uyar"],
    description: "Bir kullanıcıya uyarı verir. (Uyarılar veritabanında saklanır)",
    category: "Ozel",
    options: [
        {
            name: "kullanici",
            description: "Uyarı verilecek kullanıcı.",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "sebep",
            description: "Uyarı sebebi.",
            type: ApplicationCommandOptionType.String,
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

        const hedef = interaction.options.getUser("kullanici");
        const sebep = interaction.options.getString("sebep") || "Sebep belirtilmedi.";

        if (hedef.id === interaction.user.id)
            return interaction.editReply({ embeds: [new EmbedBuilder().setColor("Red").setDescription("Kendine uyarı veremezsin.")] });
        if (hedef.bot)
            return interaction.editReply({ embeds: [new EmbedBuilder().setColor("Red").setDescription("Botlara uyarı veremezsin.")] });

        let kayit = await Uyari.findOne({ guildId: interaction.guild.id, userId: hedef.id });
        if (!kayit) kayit = new Uyari({ guildId: interaction.guild.id, userId: hedef.id });

        kayit.uyarilar.push({ sebep, yetkili: interaction.user.id });
        await kayit.save();

        const toplamUyari = kayit.uyarilar.length;

        try {
            await hedef.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Orange")
                        .setTitle(`⚠️ ${interaction.guild.name} sunucusunda uyarı aldın!`)
                        .addFields(
                            { name: "Sebep", value: sebep },
                            { name: "Yetkili", value: interaction.user.tag },
                            { name: "Toplam Uyarı", value: `${toplamUyari}` }
                        )
                        .setTimestamp()
                ]
            });
        } catch {}

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle("⚠️ Uyarı Verildi")
                    .addFields(
                        { name: "Kullanıcı", value: `${hedef} \`${hedef.tag}\``, inline: true },
                        { name: "Yetkili", value: `${interaction.user}`, inline: true },
                        { name: "Sebep", value: sebep },
                        { name: "Toplam Uyarı", value: `\`${toplamUyari}\``, inline: true }
                    )
                    .setTimestamp()
            ]
        });
    },
};
