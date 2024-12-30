console.log("Starting...");
var productVer = "0.0.0C";
var commandVer = "0.0.0A";
var enforceAdmin = true;
var defaultColor = '555599';

var disabled = false;
var disabledMessage = "Suggestions+ is currently undergoing maintenance.";

var testing = true;
var testGuilds = "1252103981380141078";

var avatarUrl = 'https://raw.githubusercontent.com/Calebh101/SuggestionsPlus-Discord/master/icons/icon.png';
var avatar;
fetch(avatarUrl)
    .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        console.log("Retrieved avatar");
        avatar = data;
    })
    .catch(error => {
        console.error("Error: ", error);
    });

require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ]
});

const adminCommands = [
    "reload",
    "adminrole",
    "setchannel",
    "setfeedbackchannel",
    "allowfeedback",
    "allowcustomoptions",
    "setcustomoptions",
    "defaulttags",
    "suggestion",
    "setupdatesrole",
    "reset",
];

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('guildCreate', async (guild) => {
    console.log(`Joined a new guild: ${guild.name} (${guild.id}`);
    await registerSlashCommands(guild.id);
});

async function registerSlashCommands(guildId) {
    console.log("Registering commands...");
    try {
        setGuildData(guildId, "commandVer", commandVer);
        var commandsS = [
            new SlashCommandBuilder()
                .setName('ping')
                .setDescription('Pong!'),
            new SlashCommandBuilder()
                .setName('reload')
                .setDescription('Reloads Suggestions+ to check for new command updates and such.'),
            new SlashCommandBuilder()
                .setName('reset')
                .setDescription('Resets all Suggestions+ data and settings of your server. This cannot be undone.')
                .addBooleanOption(option =>
                    option
                        .setName('confirm')
                        .setDescription('Warning! This will open up all of the Suggestions+ commands to everyone! Are you sure?')
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option
                        .setName('confirmagain')
                        .setDescription('Are you absolutely sure?')
                        .setRequired(true)
                ) ,
            new SlashCommandBuilder()
                .setName('setupdatesrole')
                .setDescription('Sets the optional role to be pinged when a new suggestion comes in.')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role to be pinged for new suggestions, not approved/denied/etc suggestions.')
                        .setRequired(true)
                ),
            new SlashCommandBuilder()
                .setName('adminrole')
                .setDescription('Manage admin roles for Suggestions+.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('new')
                        .setDescription('Set up a new admin role that can be used to configure Suggestions+.')  
                        .addRoleOption(option =>
                            option.setName('role')
                                .setDescription('Enter a new admin role.')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('list')
                        .setDescription('List the admin roles that can be used to configure Suggestions+.')
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('clear')
                        .setDescription('Clear all the admin roles that can be used to configure Suggestions+.')
                        .addBooleanOption(option =>
                            option
                                .setName('confirm')
                                .setDescription('Warning! This will open up all of the Suggestions+ commands to everyone!')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('remove')
                        .setDescription('Remove an admin role from configuring Suggestions+. Cannot be used if there is only one admin role.')
                        .addRoleOption(option =>
                            option.setName('role')
                                .setDescription('Enter the admin role to remove.')
                                .setRequired(true)
                        )
                ),
            new SlashCommandBuilder()
                .setName('setchannel')
                .setDescription('Sets a channel for suggestions to be sent.')
                .addChannelOption(option => 
                    option.setName('channel')
                        .setDescription('The channel to use.')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                ),
            new SlashCommandBuilder()
                .setName('setfeedbackchannel')
                .setDescription('Sets a channel for private feedback to be sent.')
                .addChannelOption(option => 
                    option.setName('channel')
                        .setDescription('The channel to use.')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                ),
            new SlashCommandBuilder()
                .setName('allowcustomoptions')
                .setDescription('Used to allow or deny users\' ability to set custom options for their suggestions.')
                .addBooleanOption(option =>
                    option.setName('allow')
                        .setDescription('Description: Brother you just read it')
                        .setRequired(true)
                ),
            new SlashCommandBuilder()
                .setName('allowfeedback')
                .setDescription('Used to allow or deny users\' ability to send (private) feedback on the server.')
                .addBooleanOption(option =>
                    option.setName('allow')
                        .setDescription('Description: Brother you just read it')
                        .setRequired(true)
                ),
            new SlashCommandBuilder()
                .setName('setcustomoptions')
                .setDescription('Used to set how many custom options a user can add to their suggestion.')
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('2 to 5')
                        .setRequired(true)
                ),
            new SlashCommandBuilder()
                .setName('excludebotvote')
                .setDescription('Exclude or include the bot vote in the final result. Default is true.')
                .addBooleanOption(option =>
                    option.setName('exclude')
                        .setDescription('True: exclude the bot vote; False: include the bot vote')
                        .setRequired(true)
                ),
            new SlashCommandBuilder()
                .setName('defaulttags')
                .setDescription('Manage the default options for a suggestion.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('set')
                        .setDescription('Set the default tags.')
                        .addStringOption(option =>
                            option.setName('option1')
                                .setDescription('A default option for suggestions.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('option2')
                                .setDescription('A default option for suggestions.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('option3')
                                .setDescription('A default option for suggestions.')
                                .setRequired(false)
                        )
                        .addStringOption(option =>
                            option.setName('option4')
                                .setDescription('A default option for suggestions.')
                                .setRequired(false)
                        )
                        .addStringOption(option =>
                            option.setName('option5')
                                .setDescription('A default option for suggestions.')
                                .setRequired(false)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('emote')
                        .setDescription('Set the default tags emotes.')
                        .addStringOption(option =>
                            option.setName('emote1')
                                .setDescription('A default emote for option 1 for suggestions.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('emote2')
                                .setDescription('A default emote for option 2 for suggestions.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('emote3')
                                .setDescription('A default emote for option 3 for suggestions.')
                                .setRequired(false)
                        )
                        .addStringOption(option =>
                            option.setName('emote4')
                                .setDescription('A default emote for option 4 for suggestions.')
                                .setRequired(false)
                        )
                        .addStringOption(option =>
                            option.setName('emote5')
                                .setDescription('A default emote for option 5 for suggestions.')
                                .setRequired(false)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('reset')
                        .setDescription('Reset the default tags.')
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('view')
                        .setDescription('View the default tags.')
                ),
            new SlashCommandBuilder()
                .setName('suggestion')
                .setDescription('Manage suggestions.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('deny')
                        .setDescription('Denies a suggestion. For suggestions that are valid yet are being denied.')
                        .addIntegerOption(option =>
                            option.setName('id')
                                .setDescription('The ID of the suggestion, not the message ID.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('reason')
                                .setDescription('Reason the suggestion is being denied.')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('approve')
                        .setDescription('Approves a suggestion.')
                        .addIntegerOption(option =>
                            option.setName('id')
                                .setDescription('The ID of the suggestion, not the message ID.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('reason')
                                .setDescription('Reason the suggestion is being approved.')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('inprogress')
                        .setDescription('Marks a suggestion as In Progress.')
                        .addIntegerOption(option =>
                            option.setName('id')
                                .setDescription('The ID of the suggestion, not the message ID.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('reason')
                                .setDescription('Reason the suggestion is being marked as In Progress.')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('implement')
                        .setDescription('Marks a suggestion as Implemented.')
                        .addIntegerOption(option =>
                            option.setName('id')
                                .setDescription('The ID of the suggestion, not the message ID.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('reason')
                                .setDescription('Reason the suggestion is being marked as Implemented.')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('consider')
                        .setDescription('Considers a suggestion.')
                        .addIntegerOption(option =>
                            option.setName('id')
                                .setDescription('The ID of the suggestion, not the message ID.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('reason')
                                .setDescription('Reason the suggestion is being considered.')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('reject')
                        .setDescription('Rejects a suggestion. For invalid or spam suggestions.')
                        .addIntegerOption(option =>
                            option.setName('id')
                                .setDescription('The ID of the suggestion, not the message ID.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('reason')
                                .setDescription('Reason the suggestion is being rejected.')
                                .setRequired(true)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('custom')
                        .setDescription('Sets a suggestion to a custom status.')
                        .addIntegerOption(option =>
                            option.setName('id')
                                .setDescription('The ID of the suggestion, not the message ID.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('reason')
                                .setDescription('Reason the suggestion is being set to this status.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('name')
                                .setDescription('Custom status name. Automatically converted to Title Case.')
                                .setRequired(true)
                        )
                        .addStringOption(option =>
                            option.setName('color')
                                .setDescription('Custom color for the status in 6-character hex format.')
                                .setRequired(false)
                        )
                )
        ];

        if (getGuildData(guildId, "setallowcustomoptions") ?? true) {
            var suggestCommand = new SlashCommandBuilder()
                .setName('suggest')
                .setDescription('Creates a new suggestion.')
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Title for the suggestion. Make this clear and understandable.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description for the suggestion. Provide additional details.')
                        .setRequired(true)
                );
        } else {
            var allowedOptions = getGuildData(guildId, "optionsamount") ?? 3;
            var suggestCommand = new SlashCommandBuilder()
                .setName('suggest')
                .setDescription('Creates a new suggestion.')
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Title for the suggestion. Make this clear and understandable.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description for the suggestion. Provide additional details.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('option1')
                        .setDescription('First custom option.')
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option.setName('option2')
                        .setDescription('Second custom option.')
                        .setRequired(false)
                );
            if (allowedOptions >= 3) {
                suggestCommand.addStringOption(option =>
                    option.setName('option3')
                        .setDescription('Third custom option.')
                        .setRequired(false)
                );
            }
            if (allowedOptions >= 4) {
                suggestCommand.addStringOption(option =>
                    option.setName('option4')
                        .setDescription('Fourth custom option.')
                        .setRequired(false)
                );
            }
            if (allowedOptions >= 5) {
                suggestCommand.addStringOption(option =>
                    option.setName('option5')
                        .setDescription('Fifth custom option.')
                        .setRequired(false)
                );
            }
        }

        if (getGuildData(guildId, "allowfeedback") ?? true) {
            commandsS.push(new SlashCommandBuilder()
                .setName('feedback')
                .setDescription('Submits feedback to the server.')
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Title for the feedback. Make this clear and understandable.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description for the feedback. Provide additional details.')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName('rating')
                        .setDescription('Rating of the server or server feature you are submitting feedback about. 0 to 5.')
                        .setRequired(false)
                )
            );
        }

        commandsS.push(suggestCommand);
        const commands = commandsS.map(command => command.toJSON());
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

        console.log(`Registering commands for guild ID: ${guildId}`);
        console.log(`Client ID: ${process.env.APPID}`);

        await rest.put(
            Routes.applicationGuildCommands(process.env.APPID, guildId),
            { body: commands }
        );
        console.log(`Commands registered for guild: ${guildId}`);
    } catch (error) {
        console.error(`Commands not registered for guild: ${guildId}:\n`, error.stack);
    }
}

client.on('interactionCreate', async (interaction) => {
    console.log("Responding...");
    try {
        const { commandName, options, guildId, guild } = interaction;
        const commandVerS = getGuildData(guildId, "commandVer") ?? 'unknown';

        if (testing) {
            if (!testGuilds.includes(guildId)) {
                console.log("Bot disabled by test for guild: " + guildId);
                await interaction.reply('This bot has been disabled for maintenance.');
                return;
            }
        }

        const defaultTagsS = [
            {
                "name": "Like",
                "emote": "⬆️",
            },
            {
                "name": "Dislike",
                "emote": "⬇️",
            },
        ];

        var subcommand = 'none';
        console.log("Command: /" + commandName);
        const member = interaction.member;
        const user = interaction.user;

        const roles = member.roles.cache;
        const roleIds = roles.map(role => role.id);
        var adminRoles = getAdminRoles(guildId) ?? [];
        var isAdmin = adminRoles.some(item => roleIds.includes(item));

        if (adminRoles.length === 0 || !enforceAdmin) {
            isAdmin = true;
        }

        refresh(guildId);
        if (!interaction.isCommand()) return;

        console.log("user admin: " + isAdmin);
        await interaction.reply("Loading...");

        if (disabled) {
            console.log("Bot disabled by disabled for guild: " + guildId);
            await interaction.editReply(disabledMessage);
            return;
        }

        if (adminCommands.includes(commandName)) {
            if (adminRoles.length > 0 && enforceAdmin) {
                if (!isAdmin) {
                    await interaction.editReply('This command requires administrative privileges.');
                    return;
                }
            } else {
                await interaction.channel.send('Warning! Allowing all commands to be run regardless of the user role! To change this, please run /adminrole new.');
            }
        }

        if (commandVerS !== commandVer && isAdmin && commandName !== "reload") {
            console.log("command version: " + commandVer, + ',' + commandVerS, + ',' + commandVerS !== productVer)
            await interaction.channel.send('New command update available: ' + commandVer + '\nRun /reload to use it!')
        }

        switch (commandName) {
            case 'ping':
                await interaction.editReply({ content: 'Pong!', embeds: [getInfoEmbed()] });
                break;
        
            case 'reload':
                reload(guildId);
                await interaction.editReply('Suggestions+ successfully reloaded!');
                break;

            case 'reset':
                if (interaction.options.getBoolean('confirm') && interaction.options.getBoolean('confirmagain')) {
                    resetGuildData(guildId);
                    interaction.editReply('All Suggestions+ data and settings for your server has now been deleted.');
                } else {
                    interaction.editReply('Action cancelled.');
                }
                break;

            case 'allowfeedback':
                setGuildData(guildId, "allowfeedback", interaction.options.getBoolean('allow'));
                await interaction.editReply('Reloading...');
                await reload(guildId);
                await interaction.editReply('Set allow feedback to ' + interaction.options.getBoolean('allow') + '!');
                break;
        
            case 'setfeedbackchannel':
                const channelF = interaction.options.getChannel('channel');
                if (!channelF) {
                    await interaction.editReply("No channel provided!");
                } else {
                    setGuildData(guildId, "feedbackchannel", channelF.id);
                    await interaction.editReply('Set feedback channel to #' + channelF.name + '!');
                }
                break;

            case "setupdatesrole":
                const newRole = interaction.options.getRole('role');
                if (newRole) {
                    console.log(`Selected updates role: ${newRole.name}, ${newRole.id}`);
                    setGuildData(guildId, "updatesrole", newRole.id)
                    await interaction.editReply("New admin role set: " + newRole.name);
                } else {
                    console.log("No role selected.");
                }
                interaction.editReply("Updated updates role! This role will now receive updates for new suggestions.");
                break;

            case 'allowcustomoptions':
                setGuildData(guildId, "setallowcustomoptions", interaction.options.getBoolean('allow'));
                await interaction.editReply('Reloading...');
                await reload(guildId);
                await interaction.editReply('Set allow custom options to ' + interaction.options.getBoolean('allow') + '!');
                break;

            case 'setcustomoptions':
                setGuildData(guildId, "optionsamount", interaction.options.getInteger('amount'));
                await interaction.editReply('Reloading...');
                await reload(guildId);
                await interaction.editReply('Set custom options amount to ' + interaction.options.getInteger('amount') + ' options!');
                break;

            case 'excludebotvote':
                setGuildData(guildId, "excludebot", interaction.options.getBoolean('exclude'));
                if (interaction.options.getBoolean('exclude')) {
                    await interaction.editReply('Now excluding the bot vote!');
                } else {
                    await interaction.editReply('Now including the bot vote!');
                }
                break;

            case 'defaulttags':
                subcommand = options.getSubcommand();
                switch(subcommand) {
                    case 'set':
                        const option1 = interaction.options.getString('option1');
                        const option2 = interaction.options.getString('option2');
                        const option3 = interaction.options.getString('option3');
                        const option4 = interaction.options.getString('option4');
                        const option5 = interaction.options.getString('option5');

                        var tags = [
                            {
                                "name": option1,
                                "emote": defaultTagsS[0].emote,
                            },
                            {
                                "name": option2,
                                "emote": defaultTagsS[1].emote,
                            },
                        ];
                        if (option3) {
                            tags.push({
                                "name": option3,
                                "emote": "❓",
                            });
                        }
                        if (option4) {
                            tags.push({
                                "name": option4,
                                "emote": "❓",
                            });
                        }
                        if (option5) {
                            tags.push({
                                "name": option5,
                                "emote": "❓",
                            });
                        }

                        setGuildData(guildId, "defaultTags", tags);
                        await interaction.editReply(viewTags(tags));
                        break;
                    case 'view':
                        var tags = getGuildData(guildId, "defaultTags") ?? defaultTagsS;
                        await interaction.editReply(viewTags(tags));
                        break;
                    case 'reset':
                        var tags = defaultTagsS;
                        setGuildData(guildId, "defaultTags", tags);
                        await interaction.editReply(viewTags(tags));
                    case 'emote':
                        var tags = getGuildData(guildId, "defaultTags") ?? defaultTagsS;
                        const emote1 = interaction.options.getString('emote1');
                        const emote2 = interaction.options.getString('emote2');
                        const emote3 = interaction.options.getString('emote3');
                        const emote4 = interaction.options.getString('emote4');
                        const emote5 = interaction.options.getString('emote5');
                        console.log(`emotes: ${emote1},${isValidEmoji(emote1)} ${emote2},${isValidEmoji(emote2)} ${emote3},${isValidEmoji(emote3)} ${emote4},${isValidEmoji(emote4)} ${emote5},${isValidEmoji(emote5)}`);
                        if (tags[0] && isValidEmoji(emote1)) {
                            tags[0].emote = emote1;
                        }
                        if (tags[1] && isValidEmoji(emote2)) {
                            tags[1].emote = emote2;
                        }
                        if (tags[2] && isValidEmoji(emote3)) {
                            tags[2].emote = emote3;
                        }
                        if (tags[3] && isValidEmoji(emote4)) {
                            tags[3].emote = emote4;
                        }
                        if (tags[4] && isValidEmoji(emote5)) {
                            tags[4].emote = emote5;
                        }
                        setGuildData(guildId, "defaultTags", tags);
                        await interaction.editReply(viewTags(tags));
                }
                break;
        
            case 'adminrole':
                subcommand = options.getSubcommand();
                switch(subcommand) {
                    case 'list':
                        if (adminRoles.length > 0) {
                            let message = "";
                            for (let i = 0; i < adminRoles.length; i++) {
                                const role = interaction.guild.roles.cache.get(adminRoles[i]);
                                message += "\n" + role.name;
                            }
                            await interaction.editReply("Admin roles:" + message);
                        } else {
                            await interaction.editReply("No admin roles set!");
                        }
                        console.log("Admin roles for " + guildId + ":", adminRoles);
                        break;
                
                    case 'new':
                        const newRole = interaction.options.getRole('role');
                        if (newRole) {
                            console.log(`Selected role: ${newRole.name}, ${newRole.id}`);
                            adminRoles.push(newRole.id);
                            setAdminRoles(guildId, adminRoles);
                            await interaction.editReply("New admin role set: " + newRole.name);
                        } else {
                            console.log("No role selected.");
                        }
                        console.log("Admin roles for " + guildId + ":", adminRoles);
                        break;
                
                    case 'remove':
                        const removeRole = interaction.options.getRole('role');
                        if (adminRoles.includes(removeRole.id) && removeRole != null) {
                            const index = adminRoles.indexOf(removeRole.id);
                            if (adminRoles.length <= 1) {
                                await interaction.editReply('There is only one admin role available. You cannot have 0 admin roles. Please run /adminrole clear to remove all admin roles.')
                            }
                            if (index > -1) {
                                adminRoles.splice(index, 1);
                            }
                            await interaction.editReply('Revoked ' + removeRole.name + ' as an admin role.');
                        } else {
                            await interaction.editReply('This role is not listed as an admin role.');
                        }
                        setAdminRoles(guildId);
                        break;
                
                    case 'clear':
                        if (!interaction.options.getBoolean('confirm')) {
                            await interaction.editReply('Action cancelled.');
                            return;
                        }
                        interaction.channel.send("Warning! This is a very dangerous action! This allows any user, regardless of their role, to configure Suggestions+! If you want to revert this, add an admin role with /adminrole new.");
                        adminRoles = [];
                        setAdminRoles(guildId, adminRoles);
                        await interaction.editReply('Admin roles cleared. Please run /adminrole new to revert this.');
                        break;
                }
                break;
        
            case 'setchannel':
                const channel = interaction.options.getChannel('channel');
                if (!channel) {
                    await interaction.editReply("No channel provided!");
                } else {
                    setGuildData(guildId, "channel", channel.id);
                    await interaction.editReply('Set suggestions channel to #' + channel.name + '!');
                }
                break;

            case 'feedback':
                if (!getGuildData(guildId, "feedbackchannel")) {
                    if (isAdmin) {
                        await interaction.editReply('Please a specify a channel with /setfeedbackchannel first.');
                    } else {
                        await interaction.editReply('No channel specified!');
                    }
                    return;
                }

                var feedbackChannel = await client.channels.fetch(getGuildData(guildId, "feedbackchannel"));
                var title = interaction.options.getString("title");
                var desc = interaction.options.getString("description");
                var rating = interaction.options.getInteger("rating");
                var id = (getGuildData(guildId, "currentFeedbackId") ?? 0) + 1;
                var feedbackEmbed = getFeedbackEmbed(id, user, title, desc, rating);
                setGuildData(guildId, "currentFeedbackId", id);
                await feedbackChannel.send({embeds: [feedbackEmbed]});
                await interaction.editReply("Created feedback #" + id + "!");
                break;

            case 'suggest':
                if (!getGuildData(guildId, "channel")) {
                    if (isAdmin) {
                        await interaction.editReply('Please a specify a channel with /setchannel first.');
                    } else {
                        await interaction.editReply('No channel specified!');
                    }
                    return;
                }

                const rootChannel = await client.channels.fetch(getGuildData(guildId, "channel"));
                const defaultTags = getGuildData(guildId, "defaultTags") ?? defaultTagsS;
                var tags = [];
                var title = interaction.options.getString("title");
                var desc = interaction.options.getString("description");
                var tagInfo = '';
                var id = (getGuildData(guildId, "currentId") ?? 0) + 1;
                var option1 = interaction.options.getString("option1");
                var option2 = interaction.options.getString("option2");
                var option3 = interaction.options.getString("option3");
                var option4 = interaction.options.getString("option4");
                var option5 = interaction.options.getString("option5");

                if (option1 || option2 || option3 || option4 || option5) {
                    if (option1) {
                        tags.push({
                            "name": option1,
                            "emote": "1️⃣",
                        });
                    }
                    if (option2) {
                        tags.push({
                            "name": option2,
                            "emote": "2️⃣",
                        });
                    }
                    if (option3) {
                        tags.push({
                            "name": option3,
                            "emote": "3️⃣",
                        });
                    }
                    if (option4) {
                        tags.push({
                            "name": option4,
                            "emote": "4️⃣",
                        });
                    }
                    if (option5) {
                        tags.push({
                            "name": option5,
                            "emote": "5️⃣",
                        });
                    }
                } else {
                    tags = defaultTags;
                }

                console.log("tags (" + typeof tags + "): ", tags);
                tags.forEach(tag => {
                    try {
                        tagInfo += "\n" + tag.emote + " " + tag.name;
                    } catch (e) {
                        console.log("tagInfo: " + e);
                        tagInfo += "\n❓ " + tag.name;
                    }
                });

                const status = "Under Review";
                const color = defaultColor;
                const embed = getEmbed(id, user, title, desc  + '\n' + tagInfo, status, color);

                if (tags.length < 2) {
                    await interaction.editReply('Please specify at least 2 options for your suggestion.');
                    return;
                }
                
                var message;
                var updatesRoleId = getGuildData(guildId, "updatesrole");
                var updatesRole = guild.roles.cache.get(updatesRoleId);

                if (updatesRoleId) {
                    console.log("Updates role: " + updatesRoleId);
                    message = await rootChannel.send({ content: `<@&${updatesRole.id}>`, embeds: [embed] });
                } else {
                    message = await rootChannel.send({ embeds: [embed] });
                }

                tags.forEach(tag => {
                    try {
                        message.react(tag.emote);
                    } catch (e) {
                        console.log("message.react: " + e);
                        message.react("❓");
                    }
                });

                var suggestionsList = getGuildData(guildId, "suggestions") ?? [];
                suggestionsList.push({
                    "id": id,
                    "messageId": message.id,
                    "title": title,
                    "description": desc,
                    "status": status,
                    "color": color,
                    "channel": rootChannel.id,
                    "tags": tags,
                    "user": user.id,
                    "reactionInfo": tagInfo,
                });

                setGuildData(guildId, "currentId", id);
                setGuildData(guildId, "suggestions", suggestionsList);

                await interaction.editReply("Created suggestion #" + id + "!");
                break;

            case 'suggestion':
                subcommand = options.getSubcommand();
                switch (subcommand) {
                    case 'deny':
                        await edit(guildId, "Denied", "AA4444", user, interaction);
                        break;

                    case 'approve':
                        await edit(guildId, "Approved", "44AA44", user, interaction);
                        break;

                    case 'consider':
                        await edit(guildId, "Considered", "FFFFE0", user, interaction);
                        break;

                    case 'reject':
                        await edit(guildId, "Rejected", "CC4444", user, interaction);
                        break;

                    case 'inprogress':
                        await edit(guildId, "In Progress", defaultColor, user, interaction);
                        break;
                    
                    case 'implement':
                        await edit(guildId, "Implemented", "44AA44", user, interaction);
                        break;
                    
                    case 'custom':
                        const customName = toTitleCase(interaction.options.getString('name'));
                        const customColor = formatColor(interaction.options.getString('color') ?? defaultColor);
                        var newCustomColor = defaultColor;
                        console.log("color: " + customColor);
                        if (isValidHexColor(customColor)) {
                            console.log("color is valid");
                            newCustomColor = customColor;
                        } else {
                            console.log("color is not valid");
                            newCustomColor = defaultColor;
                        }
                        await edit(guildId, customName, newCustomColor, user, interaction);
                        break;
                }
                break;
    
            default:
                throw new Error('Unknown command!');
                break;
        }        
        console.log("Interaction successful");
    } catch (e) {
        console.log("Interaction error: " + e.stack);
        if (isAdmin) {
            await interaction.editReply('Error! ' + e);
        } else {
            await interaction.editReply('There was an unexpected error running the command.');
        }
    }
    console.log("Interaction complete");
});

function viewTags(tags) {
    var tagText = 'Tags set to:';
    tags.forEach(item => {
        tagText += '\n' + item.emote + ' ' + item.name;
    });
    return tagText;
}

function isSingleCharacterEmoji(string) {
    if (string === null) {return false;}
    const emojiRegex = /^[\p{Emoji}\u200D]+$/u;
    return string.length === 1 && emojiRegex.test(string);
}

function isValidEmoji(string) {
    if (isSingleCharacterEmoji(string)) {
        return true;
    } else {
        return isValidEmojiFormat(string);
    }
}

function toTitleCase(str) {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
}

function isValidHexColor(str) {
    const regex = /^[0-9A-Fa-f]{6}$/;
    return regex.test(str);
}

function formatColor(str) {
    const alphanumericOnly = str.replace(/[^a-zA-Z0-9]/g, '');
    const capitalized = alphanumericOnly.toUpperCase();
    return capitalized;
}

function isValidEmojiFormat(string) {
    const regex = /^<:\w+:\d+>$/;
    return regex.test(string);
}

function getEmbed(id, user, title, desc, status, color) {
    const userAvatar = user.displayAvatarURL({
        format: 'png',
        dynamic: true,
        size: 1024,
    });

    return new EmbedBuilder()
        .setColor(color)
        .setTitle("Suggestion **#" + id + "** by " + user.username + ": " + status + "\n" + title)
        .setDescription(desc)
        .setAuthor({
            name: user.username,
            iconURL: userAvatar,
        })
        .setFooter({ text: 'Suggestion #' + id + " by user #" + user.id, iconURL: avatarUrl })
        .setTimestamp();
}

function getFeedbackEmbed(id, user, title, desc, rating) {
    var ratingText = '';
    var ratingStars = '';

    if (rating !== null && rating <= 5 && rating >= 0) {
        for (let i = 0; i < 5; i++) {
            if (rating > i) {
                ratingStars += '⭐';
            } else {
                ratingStars += '★';
            }
        }
        ratingText = 'Rating: ' + rating + '/5 ' + ratingStars + '\n\n';
    }

    return new EmbedBuilder()
        .setColor(defaultColor)
        .setTitle('Feedback #' + id + " by " + user.toString() + "\n" + title)
        .setDescription(ratingText + desc)
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: 'Feedback #' + id + " by user #" + user.id, iconURL: 'https://example.com/icon.png' })
        .setTimestamp();
}

function getInfoEmbed() {
    return new EmbedBuilder()
        .setColor("00FFF0")
        .setURL('https://calebh101studios.web.app/suggestionsplus')
        .setTitle('Suggestions+ By Calebh101')
        .setDescription("Suggestions+ is a Discord bot that allows you to use a customized suggestions/feedback system in your server.")
        .setAuthor({
            name: 'Calebh101',
            iconURL: 'https://raw.githubusercontent.com/Calebh101/Calebh101/main/assets/icon.png',
            url: 'https://calebh101studios.web.app',
        })
        .addFields(
            { name: 'Suggestions', value: 'To create a simple suggestion, type `/suggest <title> <description>`. This creates a simple title-description suggestion with the default reactions. To create custom options for your suggestion (if your server allows it), type `/suggest <title> <description> <(up to 5 options, depending on your server\'s decision)>`. This adds custom options with 1️⃣, 2️⃣, 3️⃣, 4️⃣, and 5️⃣ as reactions. You must add at least 2 options.', inline: false },
            { name: 'Feedback', value: 'To give feedback to your server, type `/feedback <title> <description> <rating (optional star-based rating, 0 to 5)>`. This command may or not be enabled based on your server\'s preference.', inline: false },
        )
        .setThumbnail(avatarUrl)
        .setTimestamp()
        .setFooter({ text: 'Version ' + productVer + ' (Command Version ' + commandVerS + ')', iconURL: avatarUrl });
}

function refresh(guildId) {
    console.log("Refreshing...");
}

async function setStatus(guildId, id, status, color, reason, user, channel) {
    const array = getGuildData(guildId, "suggestions") ?? [];
    const item = array.find(item => item.id === id);
    if (item) {
        const message = await client.channels.cache.get(item.channel).messages.fetch(item.messageId);
        const reactions = Array.from(message.reactions.cache.values());
        const tags = item.tags;
        console.log("tags,reactions: " + tags.length + ',' + reactions.length);

        var reactionInfo = '';
        if (reactions.length > 0) {
            for (let i = 0; i <= tags.length - 1; i++) {
                var tag = tags[i];
                var reaction = reactions[i];
                var count = reaction.count;
                if (getGuildData(guildId, "excludebot")) {
                    count = count - 1;
                }
                reactionInfo += "\n" + tag.emote + " " + tag.name + ': ' + count;
            }
        } else {
            reactionInfo = item.reactionInfo;
        }

        item.status = status;
        item.reactionInfo = reactionInfo;

        await message.edit({ embeds: [getEmbed(id, client.users.cache.get(user.id), item.title, item.description + '\n' + reactionInfo + '\n\n**Reason**:\n' + reason, status, color)] });
        await message.reactions.removeAll();
        return true;
    } else {
        return false;
    }
}

async function edit(guildId, status, color, user, interaction) {
    const id = interaction.options.getInteger('id');
    const rootChannel = await client.channels.fetch(getGuildData(guildId, "channel"));
    if (await setStatus(guildId, id, status, color, interaction.options.getString('reason'), user, interaction, rootChannel) && rootChannel) {
        await interaction.editReply('Marked suggestion #' + id + ' as ' + status + '!');
    } else {
        await interaction.editReply('The suggestion or channel doesn\'t exist.');
    }
}

async function reload(guildId) {
    console.log("Reloading...");
    refresh(guildId);
    await registerSlashCommands(guildId);
    console.log("Reloaded");
}

function getAdminRoles(guildId) {
    return getGuildData(guildId, "adminroles");
}

function setAdminRoles(guildId, adminRoles) {
    setGuildData(guildId, "adminroles", adminRoles);
}

client.login(process.env.TOKEN);

const fs = require('fs');
const path = require('path');
const dataFilePath = path.join(__dirname, 'data.json');

let guildData = {};
if (fs.existsSync(dataFilePath)) {
    guildData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
}

function saveData() {
    fs.writeFileSync(dataFilePath, JSON.stringify(guildData, null, 4));
}

function setGuildData(guildId, key, value) {
    defaultGuildData(guildId);
    guildData[guildId][key] = value;
    saveData();
}

function getGuildData(guildId, key) {
    defaultGuildData(guildId);
    if (key in guildData[guildId]) {
        return guildData[guildId][key];
    } else {
        return null;
    }
}

function resetGuildData(guildId) {
    console.log("Resetting data for guild: " + guildId);
    guildData[guildId] = {};
}

function defaultGuildData(guildId) {
    if (!guildData[guildId]) {
        guildData[guildId] = {
            "setup": true,
        };
        saveData();
    }
}