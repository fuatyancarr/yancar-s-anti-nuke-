const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const moment = require('moment');
const voucher_codes = require('voucher-code-generator');
const Redeem = require("../../Models/Redeem");

const PLANS = {
    daily:    { name: "Günlük",    ms: 86400000 },
    weekly:   { name: "Haftalık",  ms: 86400000 * 7 },
    monthly:  { name: "Aylık",     ms: 86400000 * 30 },
    yearly:   { name: "Yıllık",    ms: 86400000 * 365 },
    lifetime: { name: "Ömür Boyu", ms: 86400000 * 365 * 100 },
};

module.exports = {
    name: ["premium", "generate"],
    description: "Premium kodu oluşturur.",
    category: "Premium",
    options: [
        {
            name: "plan",
            description: "Kod oluşturulacak plan.",
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: Object.entries(PLANS).map(([value, p]) => ({ name: p.name, value })),
        },
        {
            name: "adet",
            description: "Oluşturulacak kod adedi (1-50).",
            required: false,
            type: ApplicationCommandOptionType.Integer,
        }
    ],
    permissions: { channel: [], bot: [], user: [] },
    settings: { isPremium: false, isOwner: true, inVoice: false, isNSFW: false },

    run: async (interaction, client) => {
        await interaction.deferReply();

        const plan = interaction.options.getString("plan");
        const amount = Math.min(50, Math.max(1, interaction.options.getInteger("adet") || 1));
        const expiresAt = Date.now() + PLANS[plan].ms;

        const codes = voucher_codes
            .generate({ pattern: '####-####-####', count: amount })
            .map(c => c.toUpperCase());

        const docs = codes.map(code => ({ code, plan, expiresAt }));

        try {
            await Redeem.insertMany(docs, { ordered: false });
        } catch (err) {
            if (!err.writeErrors) {
                return interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`Kod oluşturulurken bir hata oluştu: \`${err.message}\``)]
                });
            }
        }

        const list = codes.map((c, i) => `${i + 1} - ${c}`).join("\n");

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({ name: `Kod Oluşturuldu`, iconURL: client.user.displayAvatarURL() })
            .setDescription(`• *Oluşturulan* [\`${codes.length}\`]\n\`\`\`${list}\`\`\`\n• *Plan*: \`${PLANS[plan].name}\`\n• *Bitiş*: \`${moment(expiresAt).format('DD/MM/YYYY')}\``)
            .setTimestamp()
            .setFooter({ text: `Kullanmak için: /redeem <kod>`, iconURL: interaction.user.displayAvatarURL() });

        return interaction.editReply({ embeds: [embed] });
    },
};
