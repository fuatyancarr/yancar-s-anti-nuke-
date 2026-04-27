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
    name: ["antinuke", "whitelist", "add"],
    description: "Belirli bir kategori için kullanıcı veya rolü whitelist'e ekler.",
    category: "Antinuke",
    options: [
        {
            name: "kategori",
            description: "Whitelist'e eklenecek kategori.",
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
                { name: "Hepsine Ekle", value: "all" },
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
            description: "Whitelist'e eklenecek kullanıcı.",
            required: false,
            type: ApplicationCommandOptionType.User,
        },
        {
            name: "rol",
            description: "Whitelist'e eklenecek rol.",
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
            return interaction.editReply({
                content: "Sunucu ayarları alınırken bir hata oluştu. Antinuke aktif etme komutunu hiç kullanmadın sanırım.",
            });
        }

        const eklenecekKategoriler = category === "all" ? KATEGORILER : [category];
        const eklenenler = [];
        const zatenVar = [];

        for (const cat of eklenecekKategoriler) {
            if (!settings.whitelist[cat]) settings.whitelist[cat] = [];
            if (settings.whitelist[cat].includes(hedefId)) {
                zatenVar.push(ANTI_ISIM[cat]);
            } else {
                settings.whitelist[cat].push(hedefId);
                eklenenler.push(ANTI_ISIM[cat]);
            }
        }

        await settings.save();

        const logChannel = settings.logChannel ? interaction.guild.channels.cache.get(settings.logChannel) : null;
        if (logChannel && eklenenler.length > 0) {
            logChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setTitle("✅ Whitelist Ekleme")
                        .addFields(
                            { name: "Eklenen", value: `${hedefEtiket} (${hedefTur})`, inline: true },
                            { name: "Kategoriler", value: eklenenler.join(", ") || "—", inline: true },
                            { name: "Ekleyen", value: `<@${interaction.user.id}>`, inline: true }
                        )
                        .setFooter({ text: "© Antinuke Logları" })
                        .setTimestamp(),
                ],
            }).catch(() => {});
        }

        const satırlar = [];
        if (eklenenler.length > 0) satırlar.push(`✅ **Eklendi:** ${eklenenler.join(", ")}`);
        if (zatenVar.length > 0) satırlar.push(`⚠️ **Zaten vardı:** ${zatenVar.join(", ")}`);

        interaction.editReply({ content: satırlar.join("\n") });
    },
};
