require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

const adminCommands = [
    "reload",
];

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
    const commands = [
        new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Pong!'),
        new SlashCommandBuilder()
            .setName('reload')
            .setDescription('Reloads Suggestions+ to check for new command updates and such.'),
        new SlashCommandBuilder()
            .setName('adminsetup')
            .setDescription('Set up the admin roles that can be used to configure Suggestions+.')
            .addStringOption(option => 
                option.setName('roles')
                    .setDescription('Enter a list of roles to set up.')
                    .setRequired(true)
            ),
    ].map(command => command.toJSON());

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
    if (!interaction.isCommand()) return;
    const { commandName, options, guildId } = interaction;
    await interaction.reply("Loading...");

    if (adminCommands.includes(commandName)) {
        console.log("adminSetup: " + getGuildData(guildId, "adminSetup"));
        if (getGuildData(guildId, "adminSetup") === null) {
            setGuildData(guildId, "adminSetup", false);
        }
        var adminSetup = getGuildData(guildId, "adminSetup") ?? false;
        console.log("requires admin: true\nuser admin: false");
        if (adminSetup === true) {
            await interaction.editReply('This command requires an administrative privilege.');
            return;
        } else {
            await interaction.channel.send('Warning! Allowing all commands to be run regardless of the user role! To change this, please run /adminsetup.');
        }
    } else {
        console.log("requires admin: false\nuser admin: null");
    }

    if (commandName === 'ping') {
        await interaction.editReply('Pong!\n\nSuggestions+ By Calebh101\nVersion ' + process.env.VERSION);
    } else if (commandName === 'reload') {
        try {
            await registerSlashCommands(guildId);
            await interaction.editReply('Suggestions+ successfully reloaded!');
        } catch (error) {
            console.error('Error reloading:', error);
            await interaction.editReply('Unable to reload Suggestions+.');
        }
    } else if (commandName === 'adminsetup') {
        const rolesInput = interaction.options.getString('roles');
        const roleNames = rolesInput.mentions.roles.map(role => role.name);
        await interaction.editReply('New admin roles: ' + roleNames);
    } else {
        await interaction.editReply('Unknown command!');
    }
});

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