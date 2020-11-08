const mongoose = require("mongoose")

const schema = mongoose.Schema({
   id: String,
   joined: {type: Date, default: Date.now()},
   lefted: Date
})

module.exports = mongoose.model("member", schema)