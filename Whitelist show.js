const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const AntinukeGuildSettings = require("../../Models/Antinuke");

const ANTI_ISIM = {
    roles: "Anti Rol",
    channels: "Anti Kanal",
    webhooks: "Anti Webhook",
    kicks: "Anti Kick",
    bans: "Anti Ban",
    antibot: "Anti Bot Ekleme",
    guildUpdate: "Anti Sunucu Güncelleme",
    everyone: "Anti Everyone / Here",
};

module.exports = {
    name: ["antinuke", "whitelist", "show"],
    description: "Seçilen antinuke kategorisi için whitelist'teki kullanıcı ve rolleri gösterir.",
    category: "Antinuke",
    options: [
        {
            name: "kategori",
            description: "Whitelist'i görüntülenecek kategori.",
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: "Hepsini Göster", value: "all" },
                { name: "Owner Seviyesi", value: "owner" },
                { name: "Anti Rol", value: "roles" },
                { name: "Anti Kanal", value: "channels" },
                { name: "Anti Webhook", value: "webhooks" },
                { name: "Anti Bot Ekleme", value: "antibot" },
                { name: "Anti Kick", value: "kicks" },
                { name: "Anti Ban", value: "bans" },
                { name: "Anti Sunucu Güncelleme", value: "guildUpdate" },
                { name: "Anti Everyone / Here", value: "everyone" },
            ],
        },
    ],
    permissions: {
        channel: [],
        bot: [],
        user: ["Administrator"],
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

        const guildSettings = await AntinukeGuildSettings.findOne({ guildId: interaction.guild.id });
        if (!guildSettings) {
            return interaction.editReply({ content: "Bu sunucuda antinuke aktif değil!", ephemeral: true });
        }

        const category = interaction.options.getString("kategori");

        function formatList(ids, guild) {
            if (!ids || ids.length === 0) return "*Boş*";
            return ids.map(id => {
                const member = guild.members.cache.get(id);
                const rol = guild.roles.cache.get(id);
                if (rol) return `${rol} \`${id}\` *(Rol)*`;
                return `<@${id}> \`${id}\``;
            }).join("\n");
        }

        if (category === "owner") {
            const liste = formatList(guildSettings.ownerLevel, interaction.guild);
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setTitle("👑 Owner Seviyesi Whitelist")
                        .setDescription(liste)
                        .setTimestamp()
                ]
            });
        }

        if (category === "all") {
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle("📋 Tüm Whitelist")
                .setTimestamp();

            const KATEGORILER = ["roles", "channels", "webhooks", "antibot", "kicks", "bans", "guildUpdate", "everyone"];
            for (const cat of KATEGORILER) {
                const ids = guildSettings.whitelist[cat] || [];
                embed.addFields({
                    name: `${ANTI_ISIM[cat]} (${ids.length})`,
                    value: ids.length > 0 ? formatList(ids, interaction.guild).slice(0, 300) : "*Boş*",
                    inline: false,
                });
            }

            return interaction.editReply({ embeds: [embed] });
        }

        const ids = guildSettings.whitelist[category] || [];
        const liste = formatList(ids, interaction.guild);

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(client.color)
                    .setTitle(`📋 ${ANTI_ISIM[category]} Whitelist (${ids.length} kayıt)`)
                    .setDescription(liste)
                    .setTimestamp()
            ]
        });
    },
};
