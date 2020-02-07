'use strict'

import Vue from 'vue'
import VueRouter from 'vue-router'
import VueI18n from 'vue-i18n'
import lang_en from './i18n/en.js'
// import axios from 'axios'

Vue.use(VueRouter)
Vue.use(VueI18n)

const app = {}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Create VueI18n instance with options
app.i18n = new VueI18n({
    locale: 'fr',
    fallbackLocale: 'en',
    messages: {
        en: lang_en
    }
});

app.loaded_locales = ['en']

app.locale = (lang) => {
    if (app.i18n.locale === lang)
        return Promise.resolve(lang);
    if (app.loaded_locales.contains(lang))
        return Promise.resolve(app._locale(lang))
    return import(`./i18n/${lang}.js`)
        .then(msgs => {
            app.i18n.setLocaleMessage(lang, msgs)
            app.loaded_locales.push(lang);
            return app._locale(lang);
        });
}

app._locale = (lang) => {
    app.i18n.locale = lang
    // axios.defaults.headers.common['Accept-Language'] = lang
    document.querySelector('html').setAttribute('lang', lang)
    return lang;
};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
app.router = new VueRouter({
    routes: [
        { path: '/foo', component: () => import('./foo.js') },
        { path: '/bar', component: () => import('./bar.js') }
    ],
    beforeEach: (to, from, next) => {
        const lang = to.params.lang
        app.locale(lang).then(() => next())
    },
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
app.vue = new Vue({
    i18n: app.i18n,
    router: app.router,
    el: '#app',

    data: {
        userrole: 'Admin',
        username: '',
        firstname: 'Fabien',
        mailhash: '06b61d1339e375ed6a4fa6e97e985266',
        appname: '',
        appcateg: '',
        active: '',
    },

    created: function () {
        this.$nextTick(function () {
            // this.appname = this.$route.path
            // console.log('App created', this.$route.path)
            var idx = this.$route.path.indexOf('/', 1)
            this.appcateg = this.$route.path.substring(1, idx > 0 ? idx : this.$route.path.length)
            console.log('App', this.appcateg)
        })
    },
    updated: function () {
        this.$nextTick(function () {
            // this.appname = this.$route.path
            var idx = this.$route.path.indexOf('/', 1)
            this.appcateg = this.$route.path.substring(1, idx > 0 ? idx : this.$route.path.length)
            console.log('App', this.appcateg)
        })
    },

    // Functions we will be using.
    methods: {
        gravatar: function() {
            return `https://secure.gravatar.com/avatar/${this.mailhash}?s=100`
        }
    }
})


