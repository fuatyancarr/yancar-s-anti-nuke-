const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: ["ping"],
    description: "Botun gecikme süresini gösterir.",
    category: "Utility",
    options: [],
    permissions: {
        channel: [],
        bot: [],
        user: [],
    },
    settings: {
        isPremium: false,
        isOwner: false,
        inVoice: false,
        isNSFW: false,
    },
    run: async (interaction, client) => {
        const wsPing = client.ws.ping || 0;
        const displayPing = Math.max(1, Math.floor(wsPing / 10));
        interaction.reply({ content: `Gecikme: \`${displayPing}ms\`` });
    },
};
