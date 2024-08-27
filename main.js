require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { google } = require('googleapis');
const youtube = google.youtube('v3');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('!search')) return;

    const query = message.content.replace('!search', '').trim();
    if (!query) {
        message.channel.send('Please provide a search query.');
        return;
    }

    try {
        const response = await youtube.search.list({
            part: 'snippet',
            q: `${query} official music video`,
            maxResults: 1,
            type: 'video',
            videoCategoryId: '10', // Music category
            key: process.env.YOUTUBE_API_KEY,
        });

        const video = response.data.items[0];
        if (!video) {
            message.channel.send('No official music video found.');
            return;
        }

        const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
        message.channel.send(`Official music video found: ${videoUrl}`);
    } catch (error) {
        console.error('Error searching YouTube:', error);
        message.channel.send('There was an error searching for the video.');
    }
});

client.login(process.env.DISCORD_TOKEN);
