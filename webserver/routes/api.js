const express = require("express");
const {client} = require("../../index")


const app = express.Router();

app.get("/discord/invite", (req, res) => {
client.guilds.fetch("771431807026987008").then(g => {var geninvite = g.channels.cache.get("771439737210667019").createInvite().then(i => {


res.send(JSON.stringify({status: "success", invite: i.url}))
}).catch((error) => {res.send(JSON.stringify({status: "error"}))})
}).catch((error) => {res.send(JSON.stringify({status: "error"}))})
})

module.exports = app;