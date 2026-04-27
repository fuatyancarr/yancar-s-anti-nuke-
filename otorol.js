const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const OtoRol = require("../../Models/OtoRol");

module.exports = {
    name: ["ozel", "otorol"],
    description: "Sunucuya katılan herkese otomatik rol verir. (Premium özellik)",
    category: "Ozel",
    options: [
        {
            name: "islem",
            description: "Otomatik rolü kur veya kapat.",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "Kur / Güncelle", value: "kur" },
                { name: "Kapat", value: "kapat" },
            ],
        },
        {
            name: "rol",
            description: "Otomatik verilecek rol. (Sadece 'Kur' seçildiğinde gerekli)",
            type: ApplicationCommandOptionType.Role,
            required: false,
        },
    ],
    permissions: {
        channel: [],
        bot: [PermissionFlagsBits.ManageRoles],
        user: [PermissionFlagsBits.Administrator],
    },
    settings: {
        isPremium: true,
        isPlayer: false,
        isOwner: false,
        inVoice: false,
        sameVoice: false,
    },
    run: async (interaction, client) => {
        await interaction.deferReply();

        const islem = interaction.options.getString("islem");
        const rol = interaction.options.getRole("rol");

        let kayit = await OtoRol.findOne({ guildId: interaction.guild.id });

        if (islem === "kapat") {
            if (!kayit || !kayit.aktif) {
                return interaction.editReply({ embeds: [new EmbedBuilder().setColor("Red").setDescription("Otorol zaten kapalı.")] });
            }
            kayit.aktif = false;
            await kayit.save();
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor(client.color).setTitle("🎭 Otorol Kapatıldı").setDescription("Artık sunucuya katılan üyelere otomatik rol verilmeyecek.").setTimestamp()]
            });
        }

        if (!rol) {
            return interaction.editReply({ embeds: [new EmbedBuilder().setColor("Red").setDescription("Lütfen bir rol seç!")] });
        }

        if (rol.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.editReply({ embeds: [new EmbedBuilder().setColor("Red").setDescription("Bu rol botun en yüksek rolünden yüksek. Daha düşük bir rol seç.")] });
        }

        if (!kayit) kayit = new OtoRol({ guildId: interaction.guild.id });
        kayit.rolId = rol.id;
        kayit.aktif = true;
        await kayit.save();

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle("✅ Otorol Kuruldu")
                    .setDescription(`Bundan sonra sunucuya katılan herkes ${rol} rolünü alacak.`)
                    .setTimestamp()
            ]
        });
    },
};
