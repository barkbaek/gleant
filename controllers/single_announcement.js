const model = require('../models/single_announcement');
const methods = require('../methods');
const i18n = require('../i18n');
const article_templates = require('../article_templates');
const limit = require('../limit').get_all();
const config = require('../env.json')[process.env.NODE_ENV || 'development'];

module.exports = function (lang, is_mobile, is_loginned, user, announcement, template) {
    template.render('single_announcement', {
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

            if (lang === "en") {
                obj.select_lang = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
            } else if (lang === "ja") {
                obj.select_lang =  "<option class='lang-ja' value='ja' selected='selected'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
            } else if (lang === "ko") {
                obj.select_lang =  "<option class='lang-ko' value='ko' selected='selected'>" + i18n[lang].korean + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
            } else if (lang === "zh-Hans") {
                obj.select_lang =  "<option class='lang-zh-Hans' value='zh-Hans' selected='selected'>" + i18n[lang].simplified_chinese + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
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
            return announcement.documents[lang].title + " - "  + i18n[lang].announcement_obj.title;
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
            return announcement.documents[lang].title + " - "  + i18n[lang].announcement_obj.title;
        },
        keywords: function () {
            return config["keywords"];
        },
        image: function () {
            return config["image"];
        },
        url: function () {
            return model["url"] + announcement._id;
        },
        alternate_list: function () {
            var list = []
                , url = model["url"] + announcement._id;
            list.push({ url: url, lang: "en" });
            list.push({ url: url.replace('www', 'en'), lang: "en" });
            list.push({ url: url.replace('www', 'ja'), lang: "ja" });
            list.push({ url: url.replace('www', 'ko'), lang: "ko" });
            list.push({ url: url.replace('www', 'zh-hans'), lang: "zh-Hans" });
            return list;
        },
        home_url: function () {
            return config["url"];
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
        is_mobile: function () {
            return is_mobile;
        },
        is_loginned: function() {
            return is_loginned;
        },
        profile_url: function () {
            if (user === null) {
                return config["url"];
            } else {
                return user["blog_id"] === "" ? "/set/blog-id" : "/blog/" + user["blog_id"];
            }
        },
        friends: function () {
            return JSON.stringify(user["friends"]);
        },
        user: function () {
            return user;
        },
        announcement: function () {
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
            temp = {
                _id: announcement._id
                , title: announcement.documents[lang].title
                , content: announcement.documents[lang].content
                , language: announcement.documents[lang].language
                , created_at: announcement.created_at
                , updated_at: announcement.updated_at
            };
            return article_templates.get_single_perfect_gleant_announcement(lang, temp);
        }
    });
};