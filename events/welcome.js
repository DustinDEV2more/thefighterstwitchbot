var {client} = require("../index");
var {MessageEmbed} = require("discord.js");
var MEMBER = require("../models/MEMBER");

client.on("guildMemberAdd", async (member) => {
   var joinmessage = client.channels.cache.get("771431807617990678").send(new MessageEmbed().setColor("RANDOM").setDescription(`<:join:723485426144378913> **${member.user.tag}** ist gerade den Kämpfern beigetreten`))
   var fetchmembers = await MEMBER.find({"id": member.id}) 
   if (fetchmembers.length > 0){
       joinmessage.edit(new MessageEmbed().setColor("RANDOM").setDescription(`<:rejoin:723487019241701477> **${member.user.tag}** ist gerade erneut den Kämpfern beigetreten`))
       MEMBER.findOneAndUpdate({"id": member.id}, {"lefted": null})
    }
   else {
    await new MEMBER({"id": member.id}).save()
   }
    
})

client.on("guildMemberRemove", (member) => {
   var leavemessage = client.channels.cache.get("771431807617990678").send(new MessageEmbed().setColor("RANDOM").setDescription(`<:leafe:723485426169413686> **${member.user.tag}** wurde vom Killer aufgehangen. Bye Bye`))
   MEMBER.findOneAndUpdate({"id": member.id}, {"lefted": Date.now()})
   
})