const mongoose = require("mongoose")

const schema = mongoose.Schema({
   id: String,
   name: String,
   oauth: {token: String, scopes: []}
})

module.exports = mongoose.model("streamer", schema)