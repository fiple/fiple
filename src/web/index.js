const express = require('express');
//require("nodejs-better-console").overrideConsole();
const DiscordOauth2 = require("discord-oauth2");
const config = require("../../config");
const clientId = config.web.clientId;
const clientSecret = config.web.clientSecret;
const ejs = require("ejs");
const { token } = require('../../config');
const bodyParser = require('body-parser'),
    session = require('express-session'),
    db = require("./constants"),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;
const oauth = new DiscordOauth2({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: "http://localhost:4000/oauth2",
});

const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/images', express.static(__dirname + '/static/images'));
app.get("/images/icon", (req, res) => res.sendFile(__dirname + "/static/images/icon.png"));
//app.get("/css/fomantic.css", (req, res) => res.sendFile(__dirname + "/static/css/fomantic.min.css"));
//app.get("/js/fomantic.js", (req, res) => res.sendFile(__dirname + "/static/js/fomantic.min.js"));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
passport.initialize()
passport.use(new LocalStrategy((user, done) => { done(null, user) }))
app.use(passport.initialize());
app.use(passport.session());


app.use(
    session({
        secret: config.web.redisSecret,
        saveUninitialized: true,
        resave: true,
    })
)
app.post('/formsubmit', async (request, response) => {
    if (!request.session.user) return response.redirect('/oauth2');
    let nick = request.body.nick;
    await db.set(request.session.user, nick);
    return response.render(__dirname + '/views/pages/dashboard.ejs', { user: request.session.user, nick: nick });
});
app.get('/', async (request, response) => {
    return response.render(__dirname + '/views/pages/index.ejs');
});
app.get('/about', async (request, response) => {
    return response.render(__dirname + '/views/pages/about.ejs');
});
app.get('/dashboard', async (request, response) => {
    if (!request.session.user) return response.redirect('/oauth2');
    const user = request.session.user;
    const balance = await db.getBalance(user.id);
    if (!await db.get(user.id)) return response.render(__dirname + '/views/pages/createaccount.ejs', { user: user });
    return response.render(__dirname + '/views/pages/dashboard.ejs', { user: user, nick: await db.get(user.id), balance: balance });
});
app.get('/oauth2', async (request, response) => {
    let user = {};
    const code = request.query.code;
    const url = "https://discord.com/api/oauth2/authorize?client_id=908766516563038268&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Foauth2&response_type=code&scope=identify";
    if (!code) return response.redirect(url);
    oauth.tokenRequest({
        code: code,
        scope: ["identify"],
        grantType: "authorization_code",
    }).then(token => {
        oauth.getUser(token.access_token).then(u => {
            request.session.user = u;
            response.redirect('/dashboard')
        }).catch((err) => response.redirect(url))
    }).catch((err) => response.redirect(url));

    //return await response.redirect(url)
});
app.get('/admin', async (request, response) => {
    if (!request.session.user) return response.redirect('/oauth2');
    if (config.admins.includes(request.session.user.id)) return response.render(__dirname + '/views/pages/admin.ejs', { user: request.session.user });

})
app.get('*', async (request, response) => {
    return response.render(__dirname + '/views/pages/404.ejs');
});



module.exports = () => (app.listen(config.web.port, () => console.log(`App listening at http://localhost:${config.web.port}`)));