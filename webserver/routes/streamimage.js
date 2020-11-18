const { Structures } = require("discord.js");
const express = require("express");
const {client} = require("../../index")
var request = require('request').defaults({ encoding: null });

const app = express.Router();

app.get("/:streamername/:randomnumber", (req, res) => {

    request.get(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${req.params.streamername}-1280x720.jpg`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
;
            
              const im = data.split(",")[1];

              const img = Buffer.from(im, 'base64');
              
              res.writeHead(200, {
                 'Content-Type': 'image/jpg',
                 'Content-Length': img.length
              });
              
              res.end(img); 
        
        }
    });
  

})

module.exports = app;