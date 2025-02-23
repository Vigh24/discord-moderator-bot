require('dotenv').config(); // Load environment variables from .env file

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const PREFIX = '!'; // Command prefix

// List of abusive words
const abusiveWords = [
    'badword1', // Replace with actual words
    'badword2',
    'badword3',
    'stupid',
    'kill',
    'suck',
    'loser',
    'bitch',
    'bastard',
    'asshole',
    'fuck',
    'shit',
    'cunt',
    'whore',
    'slut',
    'faggot',
    'nigger', // Highly offensive racial slur
    'retard',
    'pussy',
    'dick',
    'cocksucker',
    'motherfucker',
    'twat',
    'wanker',
    'prick',
    'scum',
    'bimbo',
    'cocksucker',
    'freak',
    'creep',
    'loser',
    'douchebag',
    'jerk',
    'asshat',
    'butthurt',
    'snowflake',
    'simp',
    'beta',
    'toxic',
    'cancer',
    'trash',
    'garbage',
    'worthless',
    'nobody',
    'kill yourself', // Extremely harmful phrase
    'go die' // Extremely harmful phrase
];

// Warning tracking
const userWarnings = {}; // Object to track warnings

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore bot messages

    // Check for spam messages
    if (isSpam(message)) {
        await message.delete(); // Delete the spam message
        return message.channel.send(`${message.author}, your message was deleted for being spam.`);
    }

    // Check for abusive words
    if (containsAbusiveWords(message.content)) {
        await message.delete(); // Delete the abusive message
        return message.channel.send(`${message.author}, your message was deleted for containing abusive language.`);
    }

    // Check for links to other Discord servers
    if (message.content.includes('discord.gg')) {
        await message.delete(); // Delete the message with the link
        return message.channel.send(`${message.author}, sharing Discord server links is not allowed.`);
    }

    // Command to issue a timeout
    if (message.content.startsWith(`${PREFIX}timeout`)) {
        const member = message.mentions.members.first();
        if (member) {
            await member.timeout(30 * 60 * 1000); // 30 minutes timeout
            message.channel.send(`${member} has been timed out for 30 minutes.`);
        } else {
            message.channel.send('Please mention a user to timeout.');
        }
    }

    // Command to issue a warning
    if (message.content.startsWith(`${PREFIX}warn`)) {
        const member = message.mentions.members.first();
        if (member) {
            // Track warnings
            if (!userWarnings[member.id]) {
                userWarnings[member.id] = 0;
            }
            userWarnings[member.id] += 1;

            message.channel.send(`${member} has been warned! Total warnings: ${userWarnings[member.id]}`);

            // Check if the user has reached a certain number of warnings
            if (userWarnings[member.id] >= 3) {
                await member.timeout(30 * 60 * 1000); // Timeout after 3 warnings
                message.channel.send(`${member} has been timed out for receiving 3 warnings.`);
            }
        } else {
            message.channel.send('Please mention a user to warn.');
        }
    }

    // Add more commands and rules enforcement as needed
});

// Function to check for spam messages
function isSpam(message) {
    const spamThreshold = 5; // Number of identical messages allowed
    const messageHistory = message.channel.messages.cache.filter(msg => msg.author.id === message.author.id);
    
    // Check for identical messages
    const identicalMessages = messageHistory.filter(msg => msg.content === message.content);
    if (identicalMessages.size >= spamThreshold) {
        return true;
    }

    // Check for message frequency
    const timeFrame = 10000; // 10 seconds
    const recentMessages = messageHistory.filter(msg => (Date.now() - msg.createdTimestamp) < timeFrame);
    return recentMessages.size >= 3; // More than 3 messages in 10 seconds
}

// Function to check for abusive words
function containsAbusiveWords(content) {
    return abusiveWords.some(word => content.toLowerCase().includes(word));
}

client.login(process.env.DISCORD_BOT_TOKEN);