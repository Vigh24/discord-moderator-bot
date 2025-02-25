require('dotenv').config(); // Load environment variables from .env file

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const PREFIX = '!'; // Command prefix

// List of abusive words
const abusiveWords = [
    'badword1', // Replace with actual words
    'badword2',
    'badword3',
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

    // Check for abusive words with automatic ban
    if (containsAbusiveWords(message.content)) {
        await message.delete(); // Delete the abusive message

        // Track the number of abusive messages
        if (!userWarnings[message.author.id]) {
            userWarnings[message.author.id] = 0;
        }
        userWarnings[message.author.id] += 1;

        // Send warning message with current count
        message.channel.send(`${message.author}, your message was deleted for containing abusive language. Total warnings: ${userWarnings[message.author.id]}`);

        const member = message.member;
        
        // Progressive punishment system
        if (userWarnings[message.author.id] >= 5) {
            // Ban after 5 warnings
            try {
                await member.ban({ reason: 'Reached 5 warnings for abusive language' });
                message.channel.send(`${member} has been banned for receiving 5 warnings for abusive language.`);
            } catch (error) {
                message.channel.send(`Failed to ban ${member}. Please check bot permissions.`);
            }
        } else if (userWarnings[message.author.id] >= 3) {
            // Timeout after 3 warnings
            try {
                await member.timeout(30 * 60 * 1000); // 30 minutes timeout
                message.channel.send(`${member} has been timed out for receiving 3 warnings for abusive language.`);
            } catch (error) {
                message.channel.send(`Failed to timeout ${member}. Please check bot permissions.`);
            }
        }
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

    // Add this to your existing commands in bot.js
    if (message.content.startsWith(`${PREFIX}removewarning`) || message.content.startsWith(`${PREFIX}unwarn`)) {
        // Check if user has permission to remove warnings (you might want to restrict this to moderators)
        if (!message.member.permissions.has('MODERATE_MEMBERS')) {
            return message.channel.send('You do not have permission to remove warnings.');
        }

        const member = message.mentions.members.first();
        if (member) {
            if (userWarnings[member.id]) {
                if (userWarnings[member.id] > 0) {
                    userWarnings[member.id] -= 1;
                    message.channel.send(`Removed 1 warning from ${member}. They now have ${userWarnings[member.id]} warnings.`);
                } else {
                    message.channel.send(`${member} has no warnings to remove.`);
                }
            } else {
                message.channel.send(`${member} has no warnings.`);
            }
        } else {
            message.channel.send('Please mention a user to remove a warning from.');
        }
    }

    // Also add a command to check warnings
    if (message.content.startsWith(`${PREFIX}warnings`)) {
        const member = message.mentions.members.first() || message.member;
        const warnings = userWarnings[member.id] || 0;
        message.channel.send(`${member} has ${warnings} warning(s).`);
    }

    // Command to list all warnings
    if (message.content.startsWith(`${PREFIX}listwarnings`)) {
        // Check if the user has admin permissions
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.channel.send('You do not have permission to view the warnings list.');
        }

        let warningList = 'Warnings List:\n';
        for (const [userId, count] of Object.entries(userWarnings)) {
            const member = await message.guild.members.fetch(userId);
            warningList += `${member.user.tag}: ${count} warning(s)\n`;
        }

        message.channel.send(warningList || 'No warnings recorded.');
    }

    // Command to check warnings for an individual member
    if (message.content.startsWith(`${PREFIX}checkwarnings`)) {
        const member = message.mentions.members.first() || message.member; // Default to the message author if no member is mentioned
        const warnings = userWarnings[member.id] || 0;
        message.channel.send(`${member.user.tag} has ${warnings} warning(s).`);
    }

    // Command to kick a user
    if (message.content.startsWith(`${PREFIX}kick`)) {
        // Check if the user has permission to kick members
        if (!message.member.permissions.has('KICK_MEMBERS')) {
            return message.channel.send('You do not have permission to kick members.');
        }

        const args = message.content.split(' ');
        const member = message.mentions.members.first();
        const reason = args.slice(2).join(' ') || 'No reason provided'; // Get the reason from the command

        if (member) {
            try {
                await member.send(`You have been kicked from the server. Reason: ${reason}`); // Send DM to the user
                await member.kick(reason); // Kick the member with the provided reason
                message.channel.send(`${member.user.tag} has been kicked. Reason: ${reason}`);
            } catch (error) {
                message.channel.send(`Failed to kick ${member}. Please check bot permissions.`);
            }
        } else {
            message.channel.send('Please mention a user to kick.');
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