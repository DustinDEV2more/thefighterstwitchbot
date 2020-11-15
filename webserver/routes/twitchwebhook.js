const express = require("express");
var schedule = require('node-schedule');
const nanoid = require("nanoid")
const fetch = require("node-fetch")
const { default: Axios } = require("axios")
const config = require("../../config.json")
const STREAMER = require("../../models/STREAMER")
const STREAMNOTIFYER = require("../../events/twitch-stream-notifyer")

var btoken = ""

// var session_token = nanoid.nanoid(10)
var session_token = nanoid.nanoid(10)
var redirect_uri = "https://the-fighters.dustin-dm.de/twitch/webhook/mainsup"

const app = express.Router();

app.use("/mainsup/:event/:token", (req, res) => {
    if (req.method == "GET"){
      if (req.query["hub.mode"] == "unsubscribe") res.send(req.query["hub.challenge"])
      if (req.query["hub.mode"] == "subscribe" && req.params.token == session_token) res.send(req.query["hub.challenge"])
    }
    else if (req.method == "POST"){
        res.sendStatus(200)
        console.log(req.params.event, req.body)
        if (req.body.data.length == 0) return;
        new STREAMNOTIFYER(req.body.data[0].user_id, req.body.data[0].id, req.body.data[0].title, req.body.data, btoken)

    }
})

module.exports = app;

function updatetwitchsupscription() {
    var barer = ""
        //unsubscripe all exsisting webhook supscriptions
        fetch(`https://id.twitch.tv/oauth2/token?client_id=${config.twitch.clientid}&client_secret=${config.twitch.secret}&grant_type=client_credentials`, { method: 'POST'}).then(res => res.json()).then(json => {
         barer = json.access_token
         btoken = barer
      
        Axios.get("https://api.twitch.tv/helix/webhooks/subscriptions", {
          headers: { "Authorization": "Bearer " + barer, "Client-ID": config.twitch.clientid}}).then(function (response) {
      
            response.data.data.forEach(s => {
              Axios.post("https://api.twitch.tv/helix/webhooks/hub", {"hub.callback": s.callback, "hub.mode": "unsubscribe", "hub.topic": s.topic}, {
          headers: {"Authorization": "Bearer " + json.access_token,
            "Client-ID": config.twitch.clientid }})
            })
          })  .catch(function (error) { console.log(error);});
      
        }).then(async () => {
          
            setTimeout(async () => {
        //Make new Webhook-Subscription
        var streamer = await STREAMER.find({});
        streamer.forEach(s => {

          Axios.post("https://api.twitch.tv/helix/webhooks/hub", 
        {"hub.callback": `${redirect_uri}/${s.name}/${session_token}`, 
        "hub.mode": "subscribe", 
        "hub.topic": `https://api.twitch.tv/helix/streams?user_id=${s.id}`,
        "hub.lease_seconds": 7800
        }, {
          headers: {"Authorization": "Bearer " + barer, "Client-ID": config.twitch.clientid}}).then(function (response) {
          })  .catch(function (error) {console.log(error);});
        })
            }, 10000);
          
        

      
        })
          
        
        
        }
      


var j = schedule.scheduleJob('0 */2 * * *', function(){
    updatetwitchsupscription()
  });

updatetwitchsupscription()

//PLAN: Zwei Prozesse:
//1 Express Router der alle Events entgegen nimmt und für jeden Stream eine Stream Notify Class erstellt
//1.2 Notifyer Class die überprüft ob der Stream schon getrackt wird und falls nicht den Stream in Discord schickt und wartet bis der Stream offline ist
//2 node.schedule der aller 120 Minuten den Twitch Webhook neu subscriped ✅