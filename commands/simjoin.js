module.exports = {
    config: {
        name: "simjoin",
        description: 'Simulates a member joining the guild (for testing)',
        aliases: [""],
        usage: "",
        permissions: ["SEND_MESSAGES"],
    },

    async run (client, message, args) {
        client.emit("guildMemberAdd", message.member)
    }
}