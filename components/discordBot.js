import {Client, IntentsBitField } from 'discord.js';
import Config from './config.js';


const {discord_server, discord_token, discord_channel_id} = Config();

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers
    ]
});


export default function discordBot(diff, network){
    client.on('ready', async()=>{
        const guild = await client.guilds.fetch(discord_server);
        const members = await guild.members.fetch();
        members.each((users)=>{
            if(users.user.username == 'Sv3n'){
                client.channels.cache.get(discord_channel_id).send(`Hi ${users.user.toString()}, please check ${network} node. Last block is ${diff} seconds behind`);
            };
        });
    });
};


client.login(discord_token);