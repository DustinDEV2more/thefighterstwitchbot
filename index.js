const config = require("./config.json")
const Discord = require('discord.js');
const client = new Discord.Client();
exports.client = client;
const mongoose = require("mongoose")

mongoose.connect(config.mongo, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true}).then(() => {
    console.log("Database conncetion succsessful")
})

client.on("ready", () => {
    console.log(client.user.username + " is now online")
})

require("./webserver/webmain")
require("./events/welcome")

client.login(config.discord)