const discord = require('discord.js')
const client = new discord.Client()
const config = require('./config.json')
const Captcha = require("@haileybot/captcha-generator");
client.commands = new discord.Collection();
client.aliases = new discord.Collection();



client.on('message', async (message) => {
    let prefix = config.prefix;
    if(!message.guild) return;
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;
    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));
    if(!command) return;

    if (command.permissions) {
	    const authorPerms = message.channel.permissionsFor(message.author);
	    if (!authorPerms || !authorPerms.has(command.permissions)) {
		    const noperms = new discord.MessageEmbed()
			    .setColor("RED")
			    .setTitle("No Permission!")
			    .setDescription(`**You must have \`${command.permissions}\` permission to use this command.**`)
		    return message.channel.send(noperms);
	    }
    }
    command.run(client, message, args);
})



client.on("ready", () => {
    console.log('Bot is online!')
})

const path = require("path"),
	fs = require("fs")

let captcha = new Captcha();
captcha.PNGStream.pipe(fs.createWriteStream(path.join(__dirname, `./verify/${captcha.value}.png`)));
captcha.JPEGStream.pipe(fs.createWriteStream(path.join(__dirname, `./verify/${captcha.value}.jpeg`)));


client.on("guildMemberAdd", async (member)  => {

    let captcha = new Captcha();
    let guild = member.guild

    const channel = guild.channels.cache.get(config.verifyChannel)
    let vrole = guild.roles.cache.get(config.unVerifiedRole)
    
    let verole = guild.roles.cache.get(config.VerifiedRole)

    if(!channel) {
        return channel(member.guild.name + " Please Specify The Verification ChannelID In config.json")
    }

    if(!vrole) {
        return console.log(member.guild.name + " Please Specify The UnVerififed RoleID in config.json'")
    }

    member.roles.add(vrole)

    channel.send("Please Type The Given Code For Verification", new discord.MessageAttachment(captcha.PNGStream, "captcha.png"))
    
    let collector = channel.createMessageCollector(m => m.author.id === member.id)

    collector.on("collect", m => {
        if(m.content.toUpperCase() === captcha.value) {
             member.roles.remove(vrole)
             member.roles.add(verole)
             return channel.send(":white_check_mark: "+ `${member}` + " You are successfully verified")
           } else if(m.content.toUpperCase() !== captcha.value) {

              return channel.send(":x: You gave a wrong code, you can try the code again")
                                 
           } else {
        }
    })
}) 




fs.readdir("./commands/", (err, files) => {
    if (err) return console.log(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let pull = require(`./commands/${file}`);
        if (pull.config.name) {
            client.commands.set(pull.config.name, pull);
        }
        if (pull.config.aliases && Array.isArray(pull.config.aliases)) pull.config.aliases.forEach(alias => client.aliases.set(alias, pull.config.name));
    });
});





client.login(config.token)