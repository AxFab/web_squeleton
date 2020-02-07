'use script'

const gulp = require('gulp'),
    rename = require('gulp-rename'),
    webpack = require('webpack'),
    config = require('./webpack.config.js'),
    app = require('./server.js');


const task = {
    DIST: __dirname + '/dist',
    JS: __dirname + '/dist/js',
    CSS: __dirname + '/dist/css',
    BOOTSTRAP: __dirname + 'lib/bootstrap/dist/',
    JQUERY: __dirname + 'lib/jquery/',
    FONTAWESOME: __dirname + 'lib/fontawesome/',
    JSGRID: __dirname + 'lib/jsgrid/',
    watch: true
};

task.copy = (src, dst, name) => {
    const copy = () => {
        let it = gulp.src(__dirname + src);
        if (name)
            it = it.pipe(rename(name));
        it = it.pipe(gulp.dest(dst));
        return it;
    }
    if (!name)
        name = src.substring(src.lastIndexOf('/') + 1)
    gulp.task(name, copy);
    if (task.watch)
        gulp.watch(__dirname + src, gulp.parallel(name));
    return name;
};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// Create vue.js bundles app scripts
const build = (cb) => {
    webpack(config).run(cb);
}
if (task.watch)
    gulp.watch('./src/**/*.js', build)

// Copy files from 'lib' folder to 'dist'
const install = gulp.parallel(
    task.copy('/lib/jquery/jquery-3.4.1.min.js', task.JS, 'jquery.min.js'),
    task.copy('/index.html', task.DIST)
    );

// Start local server
const serve = (cb) => {
    app.start(cb);
}


// watch, task, series, parallel, registry, tree, lastRun, src, dest, symlink

module.exports = {
    build,
    install,
    default: gulp.series(build, install, serve)
};
