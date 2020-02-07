'use strict'

module.exports = {
    mode: 'development',
    entry: './src/app.js',
    output: {
        publicPath: '/js',
        path: __dirname + '/dist/js',
        filename: 'bundle.js'
    },
    devtool: "source-map",
    target: "web",
    resolve: { 
        alias: { 
            vue: 'vue/dist/vue.esm.js' 
        } 
    }
};
