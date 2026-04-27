const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const GuildSettings = require("../../Models/Antinuke");

const KATEGORILER = ["roles", "channels", "webhooks", "antibot", "kicks", "bans", "guildUpdate", "everyone"];

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
    name: ["antinuke", "whitelist", "remove"],
    description: "Belirli bir kategori için kullanıcı veya rolü whitelist'ten çıkarır.",
    category: "Antinuke",
    options: [
        {
            name: "kategori",
            description: "Whitelist'ten çıkarılacak kategori.",
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: "Hepsinden Çıkar", value: "all" },
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
        {
            name: "kullanici",
            description: "Whitelist'ten çıkarılacak kullanıcı.",
            required: false,
            type: ApplicationCommandOptionType.User,
        },
        {
            name: "rol",
            description: "Whitelist'ten çıkarılacak rol.",
            required: false,
            type: ApplicationCommandOptionType.Role,
        },
    ],
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
        await interaction.deferReply({ ephemeral: true });

        const ow = await GuildSettings.findOne({ guildId: interaction.guild.id });
        const isOwner = interaction.user.id === interaction.guild.ownerId;
        const isOwnerLevel = ow && ow.ownerLevel.includes(interaction.user.id);

        if (!isOwner && !isOwnerLevel) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("‼ Bu komut yalnızca sunucu sahibi ve ownerLevel erişimine sahip kullanıcılar içindir.")
                        .setColor(client.color),
                ],
            });
        }

        const kullanici = interaction.options.getUser("kullanici");
        const rol = interaction.options.getRole("rol");
        const category = interaction.options.getString("kategori");

        if (!kullanici && !rol) {
            return interaction.editReply({ content: "Lütfen bir **kullanıcı** veya **rol** seç!" });
        }

        const hedefId = rol ? rol.id : kullanici.id;
        const hedefEtiket = rol ? `${rol}` : `${kullanici}`;
        const hedefTur = rol ? "Rol" : "Kullanıcı";

        const settings = await GuildSettings.findOne({ guildId: interaction.guild.id });
        if (!settings) {
            return interaction.editReply({ content: "Antinuke sistemi bulunamadı." });
        }

        const cikarilacakKategoriler = category === "all" ? KATEGORILER : [category];
        const cikarilanlar = [];
        const bulunamayanlar = [];

        for (const cat of cikarilacakKategoriler) {
            if (!settings.whitelist[cat]) { bulunamayanlar.push(ANTI_ISIM[cat]); continue; }
            const idx = settings.whitelist[cat].indexOf(hedefId);
            if (idx === -1) {
                bulunamayanlar.push(ANTI_ISIM[cat]);
            } else {
                settings.whitelist[cat].splice(idx, 1);
                cikarilanlar.push(ANTI_ISIM[cat]);
            }
        }

        await settings.save();

        const logChannel = settings.logChannel ? interaction.guild.channels.cache.get(settings.logChannel) : null;
        if (logChannel && cikarilanlar.length > 0) {
            logChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setTitle("🗑️ Whitelist Kaldırma")
                        .addFields(
                            { name: "Kaldırılan", value: `${hedefEtiket} (${hedefTur})`, inline: true },
                            { name: "Kategoriler", value: cikarilanlar.join(", ") || "—", inline: true },
                            { name: "Kaldıran", value: `<@${interaction.user.id}>`, inline: true }
                        )
                        .setFooter({ text: "© Antinuke Logları" })
                        .setTimestamp(),
                ],
            }).catch(() => {});
        }

        const satırlar = [];
        if (cikarilanlar.length > 0) satırlar.push(`✅ **Çıkarıldı:** ${cikarilanlar.join(", ")}`);
        if (bulunamayanlar.length > 0) satırlar.push(`⚠️ **Listede yoktu:** ${bulunamayanlar.join(", ")}`);

        interaction.editReply({ content: satırlar.join("\n") });
    },
};
