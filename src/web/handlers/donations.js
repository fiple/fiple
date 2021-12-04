const io = require('socket.io-client');;
const config = require("../../../config");

const socket = io("wss://socket.donationalerts.ru:443", { transports: ["websocket"] });

socket.on("connect_error", (err) => {
    //console.error(`connect_error ${err.message}\n` + err);
    console.error(err);
    process.exit()
});
socket.on("disconnect", () => {
    console.log("DonatoinAlerts socket has been disconnected");
});
socket.on("connect", (socket) => {
    console.log("DonatoinAlerts ws has been connected")
})

socket.emit('add-user', { token: config.web.datoken, type: "minor" });
socket.on("donation", async (donate) => {
    const db = require("../constants");
    donate = JSON.parse(donate);
    let userid = await db.getByNickname(donate.username);
    let data = { nickname: userid, amount: Number(donate.amount), curr: donate.currency }
    await db.addBalance(data.nickname, data.amount)
});
