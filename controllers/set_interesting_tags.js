const model = require('../models/set_interesting_tags');
const config = require('../env.json')[process.env.NODE_ENV || 'development'];
const i18n = require('../i18n');

module.exports = function (lang, template, array) {
    template.render('set_interesting_tags', {
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
            var temp = "";

            for (var i = 0; i < array.length; i++) {
                if (array[i].docs === null || array[i].docs.length === 0) {
                    delete array[i];
                } else {
                    if (array[i].language === "en") {
                        temp = "english";
                    } else if (array[i].language === "ja") {
                        temp = "japanese";
                    } else if (array[i].language === "ko") {
                        temp = "korean";
                    } else if (array[i].language === "zh-Hans") {
                        temp = "simplified_chinese";
                    }
                    array[i].title = i18n[lang][temp];
                }
            }

            obj.array = array;
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
            return i18n[lang].set_interesting_tags_obj.title;
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
            return i18n[lang].set_interesting_tags_obj.description;
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
        }
    });
};