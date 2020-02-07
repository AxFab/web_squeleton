'use script'

const express = require('express'),
    moment = require("moment"),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    jsonWebToken = require('jsonwebtoken'),
    app = express();


const mdw = {
    _sessions: {},

    SESSION_TIMEOUT: 300,
    HOST: 'http://localhost:8080',
    SSO_URL: 'https://localhost',
    SSO_CLIENTID: '',
    SSO_SECRET: '',
    SSO_CERT: '',

    nocolor: '\x1b[0m',
    colors: ['\x1b[31m', '\x1b[33m', '\x1b[32m', '\x1b[33m', '\x1b[31m', '\x1b[91m'],
};


mdw.rand = (sz) => {
    const digits = "0123456789abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXZY";
    let key = ''
    while (sz-- > 0)
        key += digits[Math.floor(Math.random() * digits.length)];
    return key;
}

// Trace all request made to the web server
mdw.logger = (req, res, next) => {
    const path = req.path;
    req.received = moment();
    res.on('finish', () => {
        req.elapsed = moment() - req.received;
        const clr = mdw.colors[parseInt(res.statusCode/100)];
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const user = req.session ? `${req.session.username}/${req.session.ssid}` : '-'
        console.log(`${req.received.format('DD/MMM/YYYY HH:mm:ss')} ${clr}${res.statusCode}${mdw.nocolor} ${req.method} ${path} ${ip} <${user}> ${req.elapsed} ms`);
        // console.log(`${ip} - ${user} "${res.method} ${res.path} HTTP/1.1" ${res.statusCode} ${res.length}`)
    })
    next();
};

// Create and attach session information to the web request instance
mdw.session = (req, res, next) => {
    req.session = mdw._sessions[req.cookies.SSID];
    if (req.session == null) {
        const ssid = mdw.rand(16)
        const session = {
            username: '-',
            role: [],
            create: moment(),
            updated: moment(),
            once: mdw.rand(96),
            ssid: ssid
        };
        mdw._sessions[ssid] = session;
        res.cookie('SSID', ssid);
        req.session = session;
    }

    // Add some methods
    res.redirect = (url) => {
        res.writeHead(302, {'Location' : url});
        res.end();
    }
    res.error = (err) => {
        res.writeHead(err, {});
        res.end();
    }
    res.unauthorized = () => {
        res.clearCookie('SSID');
        res.writeHead(401, {});
        res.end();
    }

    next();
};

// Check if authenticated, if not redirect to SSO page
mdw.auth = (req, res, next) => {
    next();
    // if (req.session.username != null && moment().diff(req.session.updated, 'minutes') < mdw.SESSION_TIMEOUT) {
    //     req.session.updated = moment();
    //     return next();
    // }

    // var url = mdw.SSO_URL + '/auth/realms/vpgrp/protocol/openid-connect/auth'
    // url += '?client_id=' + mdw.SSO_CLIENTID
    // url += '&redirect_uri=' + querystring.escape(mdw.HOST + '/connect')
    // url += '&response_type=code%20id_token'
    // url += '&scope=openid'
    // url += '&response_mode=form_post'
    // url += '&nonce=' + req.session.once// = vp_rand(96) // 18.96
    // // url += '&state=CfDJ8FHqQds2_opClCHDvr_F6CePr7RTkav0sU_esGPJ7kB4Sij1k0Dp-VnefN0zg5L1llvPPD-8WWCgsKcQEl-rnZ6-ZDxMjTpChwEmvkNHPNqlmHAzrC16gYQm2VlUInY_AGx_rzHEAGzHdVoQbim3zqMORCy5nhlYAnU_TK10Xt_DCVP_MrXAMvqYTGiyxw82nWHsLNX52ofVOTqZIpKkWcgSsrLj43LR7X6xRExJz1jLUlt7V0Wp_fkfbYsAI4kp7Ni6UPmAS2T8eBYgor-XRLC51LIU0WDeC1mrg4e6wcAQpv3_lQVA0HkuHfXZ6tkYvQ'
    // // url += '&x-client-SKU=ID_NETSTANDARD2_0'
    // // url += '&x-client-ver=5.5.0.0'
    // res.redirect(url);
}


mdw.verify = (req, res, next) => {
    try {
        const data = jsonWebToken.verify(req.params.token, mdw.JWTKey);
        res.redirect('/');
    } catch (error) {
        next();
    }
};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

mdw.JWTKey = process.env.JWT_KEY || 'my-secret-key';

app.use(mdw.logger);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(mdw.session);

// app.use('/connect', mdw.connect)
// app.use('/userinfo', mdw.userinfo)
// app.use(mdw.auth);

app.use(express.static(__dirname + '/dist'));

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

app.start = (cb) => {
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
        console.log(`Server listen to port ${port}`);
        if (cb)
            cb();
    });
};

app.stop = (cb) => {
    app.close(() => {
        console.log(`Server shutdown`)
        if (cb)
            cb();
    });
};

if (require.main === module)
    app.start();

module.exports = app
