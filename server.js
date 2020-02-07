'use script'

const express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    jsonWebToken = require('jsonwebtoken'),
    app = express();


const mdw = {
    _sessions: {},
    JWTKey: 'my-secret-key'
};


mdw.rand = (sz) => {
    const digits = "0123456789abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXZY";
    let key = ''
    while (sz-- > 0)
        key += digits[Math.floor(Math.random() * digits.length)];
    return key;
}

mdw.logger = (req, res, next) => {
    const path = req.path;
    res.on('finish', () => {
        const user = req.session ? `${req.session.username}/${req.session.ssid}` : '-'
        console.log(`${res.statusCode} ${req.method} ${path} <${user}>`);
    })
    next();
};

mdw.session = (req, res, next) => {
    req.session = mdw._sessions[req.cookies.SSID];
    if (req.session == null) {
        const ssid = mdw.rand(16)
        const session = {
            username: '-',
            role: [],
            once: mdw.rand(128),
            updated: new Date(),
            ssid: ssid
        };
        mdw._sessions[ssid] = session;
        res.cookie('SSID', ssid);
        req.session = session;
    }
    next();
};

mdw.verify = (req, res, next) => {
    try {
        const data = jsonWebToken.verify(req.params.token, mdw.JWTKey);
        res.send(302, '/');
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

app.use('/connect', mdw.verify)

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
