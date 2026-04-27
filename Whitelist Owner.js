const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const GuildSettings = require("../../Models/Antinuke");

module.exports = {
  name: ["antinuke", "whitelist", "owner"],
  description: "Bir kullanıcıyı owner seviyesine ekler veya çıkarır.",
  category: "Antinuke",
  options: [
    {
      name: "kullanici",
      description: "Owner seviyesine eklenecek/çıkarılacak kullanıcı.",
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: "islem",
      description: "Kullanıcıyı ekle veya çıkar.",
      required: true,
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: "Ekle", value: "add" },
        { name: "Çıkar", value: "remove" }
      ]
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
  run: async (interaction, client, user, language) => {
    await interaction.deferReply();

    if (interaction.user.id !== interaction.guild.ownerId) {
      return interaction.editReply({ content: `Bu sunucunun sahibi değilsin.`, ephemeral: true });
    }

    const guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
    if (!guildSettings) {
      return interaction.editReply({ content: 'Bir hata oluştu. Sunucu ayarları bulunamadı.', ephemeral: true });
    }

    const userOption = interaction.options.getUser('kullanici');
    const choice = interaction.options.getString('islem');

    if (guildSettings.ownerLevel.includes(userOption.id) && choice === 'add') {
      return interaction.editReply({ content: 'Bu kullanıcı zaten owner seviyesi listesinde.', ephemeral: true });
    }

    if (!guildSettings.ownerLevel.includes(userOption.id) && choice === 'remove') {
      return interaction.editReply({ content: 'Bu kullanıcı owner seviyesi listesinde değil.', ephemeral: true });
    }

    if (choice === 'add') {
      guildSettings.ownerLevel.push(userOption.id);
      await guildSettings.save();
      return interaction.editReply({ content: `${userOption} owner seviyesi listesine eklendi.`, ephemeral: true });
    } else {
      guildSettings.ownerLevel = guildSettings.ownerLevel.filter(userId => userId !== userOption.id);
      await guildSettings.save();
      return interaction.editReply({ content: `${userOption} owner seviyesi listesinden çıkarıldı.`, ephemeral: true });
    }
  },
};
