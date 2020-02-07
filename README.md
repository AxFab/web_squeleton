



# Source tree

 - I use `gulp` as building tool.
 - `index.html` is the single page appplication, which define the main layout of the website.
 - `package.json` is npm file to ease dependencies download.
 - `server.js` is an express.js base web server.
 - `webpack.config.js` we use webpack to compile the vue.js application
 - `src/` contains all vue.js componenents (`app.js` beeing the entry point).
 - `lib/` contains source of third-party libraries.
 - `dist/` is the destination folder for all web files.




```
git clone http://axfab.net/src/web

if ( ENV == 'Production' )
    npm install
    PORT=80 npm start

if ( ENV == 'Development' )
    npm install --dev
    gulp
```

