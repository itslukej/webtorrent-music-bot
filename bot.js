import { Client, GatewayIntentBits } from 'discord.js';
import { 
  VoiceConnectionStatus,
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource
} from '@discordjs/voice';
import { Readable } from 'stream';
import { WebSocketServer } from 'ws';

const token = '';
const channelID = '';

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildVoiceStates,
] });

const wss = new WebSocketServer({ port: 3001 });

wss.on('connection', (ws) => {
  // // Get voice channel
  const channel = client.channels.cache.get(channelID);

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log('The connection has entered the Ready state - ready to play audio!');
  });

  const player = createAudioPlayer();

  // Create empty read stream using stream.Readable
  const stream = new Readable();
  stream._read = () => {};

  ws.on('message', (message) => {
    console.log('received: %s', message);
    stream.push(message);
  });

  // Create an audio resource using a Readable stream
  const resource = createAudioResource(stream);

  player.play(resource);

  // Play the audio resource
  connection.subscribe(player);
});


client.login(token);