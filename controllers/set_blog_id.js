const model = require('../models/set_blog_id');
const config = require('../env.json')[process.env.NODE_ENV || 'development'];
const i18n = require('../i18n');

module.exports = function (lang, interest_tags_exist, template) {
    template.render('set_blog_id', {
        lang: function () {
            if (lang === undefined) {
                lang = "en";
            }
            if (
                lang !== "en" &&
                lang !== "ja" &&
                lang !== "ko" &&
                lang !== "zh-Hans"
            ) {
                lang = "en";
            }
            return lang;
        },
        i18n: function () {
            if (lang === undefined) {
                lang = "en";
            }
            if (
                lang !== "en" &&
                lang !== "ja" &&
                lang !== "ko" &&
                lang !== "zh-Hans"
            ) {
                lang = "en";
            }

            var obj = i18n[lang];
            obj.css_version = config.css_version;
            obj.aws_s3_url = config.aws_s3_url;
            obj.languages = [];
            if (lang === "en") {
                obj.languages.push({ lang: "en", i18n_text: i18n[lang].english });
                obj.languages.push({ lang: "ja", i18n_text: i18n[lang].japanese });
                obj.languages.push({ lang: "ko", i18n_text: i18n[lang].korean });
                obj.languages.push({ lang: "zh-Hans", i18n_text: i18n[lang].simplified_chinese });
            } else if (lang === "ja") {
                obj.languages.push({ lang: "ja", i18n_text: i18n[lang].japanese });
                obj.languages.push({ lang: "zh-Hans", i18n_text: i18n[lang].simplified_chinese });
                obj.languages.push({ lang: "en", i18n_text: i18n[lang].english });
                obj.languages.push({ lang: "ko", i18n_text: i18n[lang].korean });
            } else if (lang === "ko") {
                obj.languages.push({ lang: "ko", i18n_text: i18n[lang].korean });
                obj.languages.push({ lang: "en", i18n_text: i18n[lang].english });
                obj.languages.push({ lang: "ja", i18n_text: i18n[lang].japanese });
                obj.languages.push({ lang: "zh-Hans", i18n_text: i18n[lang].simplified_chinese });
            } else if (lang === "zh-Hans") {
                obj.languages.push({ lang: "zh-Hans", i18n_text: i18n[lang].simplified_chinese });
                obj.languages.push({ lang: "ja", i18n_text: i18n[lang].japanese });
                obj.languages.push({ lang: "en", i18n_text: i18n[lang].english });
                obj.languages.push({ lang: "ko", i18n_text: i18n[lang].korean });
            }
            return obj;
        },
        title: function () {
            if (lang === undefined) {
                lang = "en";
            }
            if (
                lang !== "en" &&
                lang !== "ja" &&
                lang !== "ko" &&
                lang !== "zh-Hans"
            ) {
                lang = "en";
            }
            return i18n[lang].set_blog_id_obj.title;
        },
        description: function () {
            if (lang === undefined) {
                lang = "en";
            }
            if (
                lang !== "en" &&
                lang !== "ja" &&
                lang !== "ko" &&
                lang !== "zh-Hans"
            ) {
                lang = "en";
            }
            return i18n[lang].set_blog_id_obj.description;
        },
        keywords: function () {
            return config["keywords"];
        },
        image: function () {
            return config["image"];
        },
        url: function () {
            return model["url"];
        },
        site_name: function () {
            return config["site_name"];
        },
        twitter_site: function () {
            return config["twitter_site"];
        },
        date: function () {
            return new Date().valueOf();
        },
        css_version: function () {
            return config["css_version"];
        },
        js_version: function () {
            return config["js_version"];
        },
        aws_s3_url: function () {
            return config["aws_s3_url"];
        },
        fb_app_id: function () {
            return config["fb_app_id"];
        },
        interest_tags_exist: function () {
            return interest_tags_exist;
        }
    });
};