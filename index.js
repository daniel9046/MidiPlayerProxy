var Client = require('./Client');
const http = require("http");
const fs = require("fs");

var clients = []
const readFileLines = filename =>
   fs.readFileSync(filename)
   .toString('UTF8')
   .split('\n');
var proxies = readFileLines("./proxies.txt")
for (let i = 0; i < proxies.length; i++) {proxies[i] = `http://${proxies[i]}`};

proxies.forEach(p => {
    const client = new Client("wss://www.multiplayerpiano.dev:8043", p);
    client.setChannel("test/fishing");
    client.start();
    client.on('hi', message => {
        clients.push(client)
        client.setName("NMPB Proxy "+clients.length)
    })
});

const getConnectedClients = () => clients.filter(c => c.isConnected());
const nextClient = noteNumber => getConnectedClients()[Math.floor(noteNumber / (127 / getConnectedClients().length))];
var keyNameMap = require('./key-map.json');
var MidiPlayer = require('midi-player-js');
var Player = new MidiPlayer.Player(function(event) {
    setTimeout(Player.playLoop.bind(Player), 0);
    if (
        event.name == 'Note off' ||
        (event.name == 'Note on' && event.velocity === 0)
    ) {
        nextClient(event.noteNumber).stopNote(keyNameMap[event.noteName]);
    } else if (event.name == 'Note on') {
        nextClient(event.noteNumber).startNote(keyNameMap[event.noteName], event.velocity / 127); 
    } else if (event.name == 'Set Tempo') {
        Player.setTempo(event.data);
    }
});

const client2 = new Client("wss://www.multiplayerpiano.dev:8043", null);
client2.setChannel("test/fishing");
client2.start();
client2.on('hi',() => {
    setTimeout(function(){
        Player.loadFile("D:/midis/BlackMidis/[BLACK MIDI] jinjenia redzone black.mid");
        Player.play();
    },1000)
})