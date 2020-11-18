const config = require("../config.json")
const express = require('express')
const bodyParser = require('body-parser');
const { default: Axios } = require("axios")
const nanoid = require("nanoid")
const STREAMER = require("../models/STREAMER")
const { MessageEmbed } = require('discord.js');
const {client} = require("../index")
const fetch = require("node-fetch");

var redirect_uri = "https://the-fighters.dustin-dm.de/twitch/oauth2/redirect"

const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var states = {}
function genstatetoken(makenew, state) {
if (makenew == true){
    console.log("created a new token for twitch oauth")
    var token = nanoid.nanoid(64)
    states[token] = {active: true}
    return token;
}
else {
    if (!states[state] || states[state].active == false) {
        return false;
    }
    else { 
        states[state].active = false
        return true; }
}
}

app.get("/twitch/oauth2", (req, res) => {
    res.redirect(`https://id.twitch.tv/oauth2/authorize` +
    `?client_id=${config.twitch.clientid}`+
    `&redirect_uri=${redirect_uri}`+
    `&response_type=code`+
    `&scope=user:edit user:read:email`+
    `&force_verify=true`+
    `&state=${genstatetoken(true)}`)
})

const twitchwebhook = require("./routes/twitchwebhook")
app.use("/twitch/webhook", twitchwebhook)

const api = require("./routes/api")
app.use("/api", api)

const streamimages = require("./routes/streamimage")
app.use("/twitch/image", streamimages)

//Verify state
app.get("/twitch/oauth2/redirect", (req, res, next) => {
if (req.query.error == "access_denied") return res.send("Twitch hat uns mitgeteilt das du nicht den OAuth2 flow zugestimmt hast. Du wurdest nicht zur Database hinzugefügt. Du kannst diesen Tab nun schließen")
if (genstatetoken(false, req.query.state)) next();
else res.status(403).send("Dein State ist ungültig oder abgelaufen. Dies kann passieren wenn du mit der Anmeldung zu lange gebraucht hast, oder du dem Server mit absicht falsche Informationen senden willst")
})

app.get("/twitch/oauth2/redirect",(req, res, next) => {
    var code = req.query.code
    var scopes = req.query.scope
    scopes = scopes.split(" ")

        Axios.post("https://id.twitch.tv/oauth2/token" + "?client_id=" + config.twitch.clientid +
            "&client_secret=" + config.twitch.secret +
            "&code=" + code +
            "&grant_type=" + "authorization_code"+
            "&redirect_uri=" + redirect_uri
        ).then(function (json2) {

     fetch("https://api.twitch.tv/helix/users", {headers: {'Client-Id': config.twitch.clientid, 'Authorization': `Bearer ${json2.data["access_token"]}`}}).then(res1 => res1.json()).then(async json => {
     var name = json.data[0]["display_name"]
        var id = json.data[0]["id"]

        var alreadysafedstreamers = await STREAMER.find({"id":id})
        if (alreadysafedstreamers.length > 0) return res.send("Du wurdest bereits zur Database hinzugefügt.\n\nDu kannst diesen Tab nun schließen.")

        await new STREAMER({
            id: id,
            name: name,
            oauth: {token: code, scopes: scopes}}).save().then(doc => {
                console.log(doc)
                res.send(`Der Twitch Streamer "${name}" wurde erfolgreich in der Database gespeichert!\n\nDu kannst diesen Tab nun schließen`)
                client.channels.cache.get("774962486503800842").send(new MessageEmbed().setTitle("Ein neuer Streamer wurde zur Streamer Database hinzugefügt!").addField("Name:", name, true).addField("ID:", id, true).addField("granted permissions:", scopes.join(", ")).addField("⚠️oauth2-code:", `||${code}||`).setThumbnail(json.data[0]["profile_image_url"]).setFooter("⚠️ Do NOT share any information of these messages to others!", null).setColor("#6441a5"))
            })
    })
}).catch(error => console.log(error))



})


app.listen(4536, () => {
    console.log("Webserver is active and listenig on 4536")
})