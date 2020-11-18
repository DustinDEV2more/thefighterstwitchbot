const fetch = require("node-fetch");
const {client} = require("../index")
const { MessageEmbed } = require('discord.js');
const config = require("../config.json")
var schedule = require('node-schedule');
const STREAMER = require("../models/STREAMER")
const STREAM = require("../models/STREAM");

class Streamnotifyer {
    constructor(uid, sid, name, data, token) {
        this.data = data
    
        async function run() {
    //Check i Stream ID is already detected
    var streams = await STREAM.find({"id":sid})
    var streamer = await STREAMER.find({"id":uid})

    if (streams.length == 0 && streamer.length > 0) {

    await new STREAM({"id": sid, name: name}).save();

    //fetch user information
    fetch(`https://api.twitch.tv/helix/users?id=${uid}`, {headers: {'Client-Id': config.twitch.clientid, 'Authorization': `Bearer ${token}`}}).then(res1 => res1.json()).then(async json => {
        var name = json.data[0].display_name
        var icon = json.data[0].profile_image_url

    //fetch game information
    fetch("https://api.twitch.tv/helix/games?id=" + data[0].game_id, {headers: { 'Client-ID': config.twitch.clientid, "Authorization": `Bearer ${token}`}}).then(res => res.json()).then(game => {
    if (game.data.length == 0){game.data.push({name: "etwas auf Twitch"})}

    var notifymessage = client.channels.cache.get("771434636969771018").send(new MessageEmbed()
    .setTitle(`**${name}** ist jetzt live und streamt **${game.data[0].name}**`)
    .setDescription(`Link: [Klick mich hart](https://twitch.tv/${json.data[0].login})`)
    .setURL(`https://twitch.tv/${json.data[0].login}`)
    .setColor("#6441a5")
    .setThumbnail(icon)
    .setImage(`https://the-fighters.dustin-dm.de/twitch/image/${name}/${sid}`)
    .addField("Title", data[0].title)
    .addField("Game", game.data[0].name, true)
    )

    
    })})
}}
run();
}

}
module.exports = Streamnotifyer
