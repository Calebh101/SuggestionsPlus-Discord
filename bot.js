require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

const adminCommands = [
    "reload",
    "adminrole",
    "suggestion",
];

console.log("Starting...");
var enforceAdmin = true; // Only set to false for debugging purposes

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Event: When the bot joins a new server
client.on('guildCreate', async (guild) => {
    console.log(`Joined a new guild: ${guild.name} (ID: ${guild.id})`);
    
    // Register slash commands for this guild
    try {
        await registerSlashCommands(guild.id);
    } catch (error) {
        console.error(`Failed to register commands for guild ${guild.id}:`, error);
    }
});

// Function to register slash commands for a specific guild
async function registerSlashCommands(guildId) {
    console.log("Registering commands...");

    var commandsS = [
        new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Pong!'),
        new SlashCommandBuilder()
            .setName('reload')
            .setDescription('Reloads Suggestions+ to check for new command updates and such.'),
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
            .setName('setallowcustomoptions')
            .setDescription('Used to allow or deny users\' ability to set custom options for their suggestions.')
            .addBooleanOption(option =>
                option.setName('allow')
                    .setDescription('Description: Brother you just read it')
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
    ];

    if (getGuildData(guildId, "setallowcustomoptions") ?? true) {
        commandsS.push(new SlashCommandBuilder()
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
        );
    } else {
        commandsS.push(new SlashCommandBuilder()
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
            )
            .addStringOption(option => 
                option.setName('option3')
                    .setDescription('Third custom option.')
                    .setRequired(false)
            )
        );
    }

    const commands = commandsS.map(command => command.toJSON());
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    console.log(`Registering commands for guild ID: ${guildId}`);
    console.log(`Client ID: ${process.env.APPID}`);

    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.APPID, guildId),
            { body: commands }
        );
        console.log(`Successfully registered commands for guild ID: ${guildId}`);
    } catch (error) {
        console.error(`Error registering commands for guild ID ${guildId}:`, error);
    }
}

client.on('interactionCreate', async (interaction) => {
    console.log("Responding...");
    const { commandName, options, guildId } = interaction;

    const defaultTagsS = [
        {
            "name": "Like",
            "emote": getGuildData(guildId, "up") ?? "⬆️",
        },
        {
            "name": "Dislike",
            "emote": getGuildData(guildId, "down") ?? "⬇️",
        },
    ];

    var subcommand = 'none';
    console.log("Command: /" + commandName);
    const member = interaction.member;
    const user = interaction.user;

    var adminRoles = getAdminRoles(guildId) ?? [];
    const roles = member.roles.cache;
    const roleIds = roles.map(role => role.id);
    const isAdmin = adminRoles.some(item => roleIds.includes(item));
    console.log("Admin: " + isAdmin);

    refresh(guildId);
    if (!interaction.isCommand()) return;

    await interaction.reply("Loading...");

    try {
        if (adminCommands.includes(commandName)) {
            if (adminRoles.length > 0 && enforceAdmin) {
                console.log("requires admin: true\nuser admin: " + isAdmin);
                if (!isAdmin) {
                    await interaction.editReply('This command requires an administrative privilege.');
                    return;
                }
            } else {
                await interaction.channel.send('Warning! Allowing all commands to be run regardless of the user role! To change this, please run /adminrole new.');
            }
        } else {
            console.log("requires admin: false\nuser admin: null");
        }

        switch (commandName) {
            case 'ping':
                interaction.editReply('Pong!\nLoading info...');
                
                const info = new EmbedBuilder()
                    .setColor("00FFF0")
                    .setURL('https://calebh101studios.web.app/suggestionsplus')
                    .setTitle('Suggestions+ By Calebh101')
                    .setDescription("Suggestions+ is a Discord bot that allows for custom suggestions to be inputted by users. To use, type `/suggest <suggestion>` to input a suggestion. If you want to add custom options to your suggestion, type `/suggest <suggestion> <option 1> <option 2> <option 3 (optional)>`.")
                    .setThumbnail('https://raw.githubusercontent.com/Calebh101/SuggestionsPlus-Discord/master/icons/icon.png')
                    .setTimestamp()
                    .setFooter({ text: 'Version ' + process.env.VERSION, icon: "https://raw.githubusercontent.com/Calebh101/SuggestionsPlus-Discord/master/icons/icon-transparent.png" });

                await interaction.channel.send({ embeds: [info] });
                break;
        
            case 'reload':
                reload(guildId);
                await interaction.editReply('Suggestions+ successfully reloaded!');
                break;

            case 'setallowcustomoptions':
                setGuildData(guildId, "setallowcustomoptions", interaction.options.getBoolean('allow'));
                await interaction.editReply('Reloading...');
                await reload(guildId);
                await interaction.editReply('Set allow custom options to ' + interaction.options.getBoolean('allow') + '!');
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
                        await interaction.editReply('Default tags now set to:\n```' + JSON.stringify(tags) + '```');
                        break;

                    case 'view':
                        var tags = JSON.stringify(getGuildData(guildId, "defaultTags") ?? defaultTagsS);
                        await interaction.editReply('Default tags set to:\n```' + tags + '```');
                        break;
                    case 'reset':
                        var tags = JSON.stringify(defaultTagsS);
                        setGuildData(guildId, "defaultTags", tags);
                        await interaction.editReply('Default tags now set to:\n```' + tags + '```');
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
                        await interaction.editReply('Default tags now set to:\n' + JSON.stringify(tags));
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

            case 'suggest':
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

                if (option1 || option2 || option3) {
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
                } else {
                    tags = defaultTags;
                }

                tags.forEach(tag => {
                    tagInfo += "\n" + tag.emote + " " + tag.name;
                });

                const status = "Under Review";
                const color = '555599';
                const embed = getEmbed(id, user, title, desc  + '\n' + tagInfo, status, color);

                if (!rootChannel) {
                    if (isAdmin) {
                        await interaction.editReply('Please a specify a channel with /setchannel first.');
                    } else {
                        await interaction.editReply('No channel specified!');
                    }
                    return;
                }

                if (tags.length < 2) {
                    await interaction.editReply('Please specify at least 2 options for your suggestion.');
                    return;
                }
                
                var message = await rootChannel.send({ embeds: [embed] });
                tags.forEach(tag => {
                    message.react(tag.emote);
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

                await interaction.editReply("Created suggestion!");
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
                        await edit(guildId, "In Progress", "555599", user, interaction);
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
            await interaction.editReply('Error!');
        }
    }
    console.log("Interaction complete");
});

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

function isValidEmojiFormat(string) {
    const regex = /^<:\w+:\d+>$/;
    return regex.test(string);
}

function getEmbed(id, user, title, desc, status, color) {
    return new EmbedBuilder()
        .setTitle("Suggestion **#" + id + "** by " + user.toString() + ": " + status + "\n" + title)
        .setDescription(desc)
        .setColor(color);
}

function refresh(guildId) {
    console.log("Refreshing...");
}

async function setStatus(guildId, id, status, color, reason, user) {
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
                if (count < 0) {
                    return;
                }
                reactionInfo += "\n" + tag.emote + " " + tag.name + ': ' + count;
            }
        } else {
            reactionInfo = item.reactionInfo;
        }

        item.status = status;
        item.reactionInfo = reactionInfo;

        await message.edit({ embeds: [getEmbed(id, client.users.cache.get(user.id), item.title, item.description + '\n' + reactionInfo + '\n**Reason**:\n' + reason, status, color)] });
        await message.reactions.removeAll();
        return true;
    } else {
        return false;
    }
}

async function edit(guildId, status, color, user, interaction) {
    const id = interaction.options.getInteger('id');
    if (await setStatus(guildId, id, status, color, interaction.options.getString('reason'), user, interaction)) {
        await interaction.editReply('Marked suggestion #' + id + ' as ' + status + '!');
    } else {
        await interaction.editReply('The suggestion doesn\'t exist.');
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

// Log in to Discord with your bot token
client.login(process.env.TOKEN);

const fs = require('fs');
const path = require('path');

// Path to the JSON file
const dataFilePath = path.join(__dirname, 'data.json');

// Load existing data or initialize
let guildData = {};
if (fs.existsSync(dataFilePath)) {
    guildData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
}

// Function to save data to the JSON file
function saveData() {
    fs.writeFileSync(dataFilePath, JSON.stringify(guildData, null, 4));
}

// Function to set data for a guild
function setGuildData(guildId, key, value) {
    defaultGuildData(guildId);
    guildData[guildId][key] = value;
    saveData();
}

// Function to get data for a guild
function getGuildData(guildId, key) {
    defaultGuildData(guildId);
    if (key in guildData[guildId]) {
        return guildData[guildId][key];
    } else {
        return null;
    }
}

function defaultGuildData(guildId) {
    if (!guildData[guildId]) {
        guildData[guildId] = {
            "adminSetup": false,
        };
        saveData();
    }
}