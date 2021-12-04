const express = require('express');
const crypto = require('crypto')
const mc = require("mojang-minecraft-api")
//require("nodejs-better-console").overrideConsole();
const DiscordOauth2 = require("discord-oauth2");
const config = require("../../config");
if (config.web.testing) require("nodejs-better-console").overrideConsole()
const clientId = config.web.clientId;
const clientSecret = config.web.clientSecret;
const ejs = require("ejs");
const bodyParser = require('body-parser'),
    session = require('express-session'),
    db = require("./constants"),
    passport = require('passport'),
    donations = require('./handlers/donations'),
    axios = require("axios"),
    LocalStrategy = require('passport-local').Strategy;
const { response } = require('express');
const { request } = require('https');
const oauth = new DiscordOauth2({
    clientId: clientId,
    clientSecret: clientSecret,
});

const app = express();


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
passport.initialize()
passport.use(new LocalStrategy((user, done) => { done(null, user) }))
app.use(passport.initialize());
app.use(passport.session());
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/images', express.static(__dirname + '/static/images'));


app.use(
    session({
        secret: config.web.redisSecret,
        saveUninitialized: true,
        resave: true,
    })
)


app.get("/images/icon", (req, res) => res.sendFile(__dirname + "/static/images/icon.png"));
app.get("/gif/earth", (req, res) => res.sendFile(__dirname + "/static/gif/kek.gif"));
app.get("/userdata", (request, response) => {
    if (request.session.user) response.send(request.session.user);
    return response.status(401)
});
app.get("/userdata/avatar", (request, response) => {
    if (request.session.user) {
        const url = `https://cdn.discordapp.com/avatars/${request.session.user.id}/${request.session.user.avatar}.webp?size=40`
        require("request")({
            url: url,
            encoding: null
        },
            (err, resp, buffer) => {
                if (!err && resp.statusCode === 200) {
                    response.set("Content-Type", "image/webp");
                    return response.send(resp.body);
                }
                return response.status(resp.statusCode)
            })
    }
    return response.status(401)
});
app.get("/dashboard/buy", async (request, response) => {
    if (request.session.user) {
        const balance = await db.getBalance(request.session.user.id);
        if (balance > 49) {
            const nick = await db.get(request.session.user.id)
            const res = await db.addWhitelist(nick, request.session.user.id)
            if (res.status != 200) return response.send(res)
            return response.sendStatus(res.status)
        }
        return response.status(402).send("balance error")
    }
    return response.status(401).send("Unauthorized")
})
//app.get("/css/fomantic.css", (req, res) => res.sendFile(__dirname + "/static/css/fomantic.min.css"));
//app.get("/js/fomantic.js", (req, res) => res.sendFile(__dirname + "/static/js/fomantic.min.js"));

app.post('/formsubmit', async (request, response) => {
    if (!request.session.user) return response.redirect('/oauth2');
    let nick = request.body.nick;
    await db.set(request.session.user.id, nick);
    return response.redirect('/dashboard');
});
app.get('/', async (request, response) => {
    return response.render(__dirname + '/views/pages/index.ejs');
});
app.get('/about', async (request, response) => {
    return response.render(__dirname + '/views/pages/about.ejs');
});
app.get('/dashboard', async (request, response) => {
    if (!request.session.user) { request.session.rederict = "/dashboard"; return response.redirect('/oauth2') };
    let user = request.session.user;
    const balance = await db.getBalance(user.id);
    if (!await db.get(user.id)) return response.render(__dirname + '/views/pages/createaccount.ejs', { user: user });
    let nicks = await db.get(request.session.user.id);
    nicks = nicks.nick
    const skinurl = `https://minecraft-api.com/api/skins/${nicks}/body/10.5/0/`
    const nick = await db.get(user.id);
    user["skin"] = await axios.get(skinurl).then(r => { return r.data })
    //console.log(user)
    return response.render(__dirname + '/views/pages/dashboard.ejs', { user: user, nick: nick, balance: balance, admins: config.admins });
});
app.get('/oauth2', async (request, response) => {
    const code = request.query.code;
    if (!code) {
        const oa2url = oauth.generateAuthUrl({
            redirectUri: config.web.siteurl + "/oauth2",
            scope: ["identify"],
            state: crypto.randomBytes(16).toString("hex"),
        });
        return response.redirect(oa2url)
    }
    if (!request.session.rederict) request.session.rederict = "/"
    const rederict = request.session.rederict;
    oauth.tokenRequest({
        redirectUri: config.web.siteurl + "/oauth2",
        code: code,
        scope: ["identify"],
        grantType: "authorization_code",
    }).then(token => {
        oauth.getUser(token.access_token).then(u => {
            request.session.user = u;
            response.redirect(rederict)
        })
    }).catch((err) => response.send(err.message + "\n" + JSON.stringify(err.response)));

    //return await response.redirect(url)
});

app.get('/oauth2/logout', async (request, response) => {
    request.session.destroy();
    response.redirect("/")
})


app.get('/admin', async (request, response) => {
    if (!request.session.user) { request.session.rederict = "/admin"; return response.redirect('/oauth2') };
    let dball = await db.getAll();
    if (config.admins.includes(request.session.user.id)) return response.render(__dirname + '/views/pages/admin.ejs', { user: request.session.user, db: dball });

})
app.get('*', async (request, response) => {
    return response.render(__dirname + '/views/pages/404.ejs');
});


if (config.web.testing) app.listen(config.web.port, () => console.log(`App listening at http://localhost:${config.web.port}`));
module.exports = () => (app.listen(config.web.port, () => console.log(`App listening at http://localhost:${config.web.port}`)));