var Client = require('./Client');
const client = new Client("wss://mpp.hri7566.info:8443", "");
var keyNameMap = require('./key-map.json');
var MidiPlayer = require('midi-player-js');
var Player = new MidiPlayer.Player(function(event) {
    setTimeout(Player.playLoop.bind(Player), 0);
    if (
        event.name == 'Note off' ||
        (event.name == 'Note on' && event.velocity === 0)
    ) {
        client.stopNote(keyNameMap[event.noteName]);
    } else if (event.name == 'Note on') {
        client.startNote(keyNameMap[event.noteName], event.velocity / 127); 
    } else if (event.name == 'Set Tempo') {
        Player.setTempo(event.data);
    }
});


client.on('hi',() => {
    console.log("hi")
    client.setChannel("lobby");
    Player.loadFile("D:/midis/BlackMidis/[BLACK MIDI] The Nuker 2 audio final fix Anon64.mid");
    Player.play();
})
client.start();