const model = require('../models/register');
const config = require('../env.json')[process.env.NODE_ENV || 'development'];
const i18n = require('../i18n');
const agreement = require('../agreement');
const terms = require('../terms');
const policy = require('../policy');

module.exports = function (lang, template) {
    template.render('register', {
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

            if (
                lang === "en" ||
                lang === "ko"
            ) {
                obj.email_register = i18n[lang].email + " " + i18n[lang].register;
                obj.kakao_register = "Kakao " + i18n[lang].register;
                obj.facebook_register = "Facebook " + i18n[lang].register;
            } else {
                obj.email_register = i18n[lang].email + i18n[lang].register;
                obj.kakao_register = "Kakao" + i18n[lang].register;
                obj.facebook_register = "Facebook" + i18n[lang].register;
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
            return i18n[lang].register_obj.title;
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
            return i18n[lang].register_obj.description;
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
        alternate_list: function () {
            var list = [];
            list.push({ url: model.url, lang: "en" });
            list.push({ url: model.url.replace('www', 'en'), lang: "en" });
            list.push({ url: model.url.replace('www', 'ja'), lang: "ja" });
            list.push({ url: model.url.replace('www', 'ko'), lang: "ko" });
            list.push({ url: model.url.replace('www', 'zh-hans'), lang: "zh-Hans" });
            return list;
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
        register_step1: function () {
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
            var obj = [];
            obj.push({
                title: i18n[lang].consent_to_collection_of_personal_information
                , content: agreement[lang].content
            });
            obj.push({
                title: i18n[lang].consent_to_terms_and_conditions_of_service
                , content: terms[lang].content
            });
            obj.push({
                title: i18n[lang].consent_to_data_policy
                , content: policy[lang].content
            });
            return obj;
        }
    });
};