const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const moment = require('moment');
const Premium = require("../../Models/Premium");
const Redeem = require("../../Models/Redeem");

const PLAN_NAMES = {
    daily: "Günlük",
    weekly: "Haftalık",
    monthly: "Aylık",
    yearly: "Yıllık",
    lifetime: "Ömür Boyu",
};

module.exports = {
    name: ["redeem"],
    description: "Kod kullanarak premium aktif eder.",
    category: "Premium",
    options: [
        {
            name: "kod",
            description: "Sahibin oluşturduğu kod.",
            required: true,
            type: ApplicationCommandOptionType.String,
        }
    ],
    permissions: { channel: [], bot: [], user: [] },
    settings: { isPremium: false, isOwner: false, inVoice: false, isNSFW: false },

    run: async (interaction, client) => {
        await interaction.deferReply();

        const code = interaction.options.getString("kod").toUpperCase().trim();
        const userId = interaction.user.id;

        const cached = client.premiums.get(userId);
        if (cached?.isPremium && cached.premium?.expiresAt > Date.now()) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`Zaten premium üyeliğin var, keyfini çıkar!`)]
            });
        }

        const redeemed = await Redeem.findOneAndDelete({ code }).catch(() => null);
        if (!redeemed) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`Girdiğin kod geçersiz.`)]
            });
        }

        const updated = await Premium.findOneAndUpdate(
            { Id: userId },
            {
                $set: {
                    isPremium: true,
                    'premium.redeemedBy': [userId],
                    'premium.redeemedAt': Date.now(),
                    'premium.expiresAt': redeemed.expiresAt,
                    'premium.plan': redeemed.plan,
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).catch(() => null);

        if (!updated) {
            return interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`Premium aktivasyonu sırasında bir hata oluştu.`)]
            });
        }

        client.premiums.set(userId, updated);

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({ name: `Kod Kullanıldı`, iconURL: client.user.displayAvatarURL() })
            .setDescription(`• *Plan*: \`${PLAN_NAMES[redeemed.plan] || redeemed.plan}\`\n• *Bitiş*: \`${moment(redeemed.expiresAt).format('DD/MM/YYYY (HH:mm:ss)')}\``)
            .setTimestamp()
            .setFooter({ text: `Premium üyelik aktif edildi.`, iconURL: interaction.user.displayAvatarURL() });

        return interaction.editReply({ embeds: [embed] });
    },
};
