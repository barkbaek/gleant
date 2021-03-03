const model = require('../models/write_website');
const methods = require('../methods');
const i18n = require('../i18n');
const article_templates = require('../article_templates');
const config = require('../env.json')[process.env.NODE_ENV || 'development'];
module.exports = function (lang, is_mobile, is_loginned, user, query, template) {
    template.render('write_website', {
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
            return "Gleant " + i18n[lang].website;
        },
        description: function () {
            return "Gleant " + i18n[lang].website;
        },
        keywords: function () {
            return config["keywords"];
        },
        image: function () {
            return config["image"];
        },
        url: function () {
            return config["url"] + '/write/announcement';
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
            if (user === null) {
                return null;
            }
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
            if (
                user["simple_career"] === "" ||
                user["simple_career"] === i18n["en"].please_enter_occupation ||
                user["simple_career"] === i18n["ja"].please_enter_occupation ||
                user["simple_career"] === i18n["ko"].please_enter_occupation ||
                user["simple_career"] === i18n["zh-Hans"].please_enter_occupation
            ) {
                user["is_simple_career_empty"] = true;
            } else {
                user["is_simple_career_empty"] = false;
            }
            var profile = "";
            if (user["show_simple_career"] === true) {
                profile = user["simple_career"];
            }

            var returned_objs;
            // 경력 목록 보여주기용 정리
            returned_objs = methods.get_profile_item_for_show("employment", user["employment"], lang);
            user["employment"] = returned_objs.item;
            if (profile === "") {
                profile = returned_objs.str_list;
            } else {
                if (returned_objs.str_list !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        profile = profile + ", " + returned_objs.str_list;
                    } else {
                        profile = profile + "、" + returned_objs.str_list;
                    }
                }
            }

            // 학력 목록 보여주기용 정리
            returned_objs = methods.get_profile_item_for_show("education", user["education"], lang);
            user["education"] = returned_objs.item;
            if (profile === "") {
                profile = returned_objs.str_list;
            } else {
                if (returned_objs.str_list !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        profile = profile + ", " + returned_objs.str_list;
                    } else {
                        profile = profile + "、" + returned_objs.str_list;
                    }
                }
            }
            // 수상내역 목록 보여주기용 정리
            returned_objs = methods.get_profile_item_for_show("prize", user["prize"], lang);
            user["prize"] = returned_objs.item;
            if (profile === "") {
                profile = returned_objs.str_list;
            } else {
                if (returned_objs.str_list !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        profile = profile + ", " + returned_objs.str_list;
                    } else {
                        profile = profile + "、" + returned_objs.str_list;
                    }
                }
            }
            // 거주지 목록 보여주기용 정리
            returned_objs = methods.get_profile_item_for_show("location", user["location"], lang);
            user["location"] = returned_objs.item;
            if (profile === "") {
                profile = returned_objs.str_list;
            } else {
                if (returned_objs.str_list !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        profile = profile + ", " + returned_objs.str_list;
                    } else {
                        profile = profile + "、" + returned_objs.str_list;
                    }
                }
            }
            user["profile_for_show"] = profile;
            user.lower_profile_will_be_displayed = i18n[lang].lower_profile_will_be_displayed;
            user.edit = i18n[lang].edit;
            return user;
        },
        cms_menu: function () {
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
            var cms_menu;
            if (query.type === 'news_tag') {
                cms_menu = "<ul><a href='/cms?type=news_tag&action=write&sort=all'><li class='selected'>" + i18n[lang].news_tag + "</li></a><a href='/cms?type=announcement&action=write'><li class=''>" + i18n[lang].announcement + "</li></a><a href='/cms?type=website&action=write'><li class=''>" + i18n[lang].website + "</li></a><a href='/cms?type=freephoto&action=write&select=url'><li class=''>" + i18n[lang].free_photo + "</li></a></ul>";
            } else if (query.type === 'announcement') {
                cms_menu = "<ul><a href='/cms?type=news_tag&action=write&sort=all'><li class=''>" + i18n[lang].news_tag + "</li></a><a href='/cms?type=announcement&action=write'><li class='selected'>" + i18n[lang].announcement + "</li></a><a href='/cms?type=website&action=write'><li class=''>" + i18n[lang].website + "</li></a><a href='/cms?type=freephoto&action=write&select=url'><li class=''>" + i18n[lang].free_photo + "</li></a></ul>";
            } else if (query.type === 'website') {
                cms_menu = "<ul><a href='/cms?type=news_tag&action=write&sort=all'><li class=''>" + i18n[lang].news_tag + "</li></a><a href='/cms?type=announcement&action=write'><li class=''>" + i18n[lang].announcement + "</li></a><a href='/cms?type=website&action=write'><li class='selected'>" + i18n[lang].website + "</li></a><a href='/cms?type=freephoto&action=write&select=url'><li class=''>" + i18n[lang].free_photo + "</li></a></ul>";
            } else if (query.type === 'freephoto') {
                cms_menu = "<ul><a href='/cms?type=news_tag&action=write&sort=all'><li class=''>" + i18n[lang].news_tag + "</li></a><a href='/cms?type=announcement&action=write'><li class=''>" + i18n[lang].announcement + "</li></a><a href='/cms?type=website&action=write'><li class=''>" + i18n[lang].website + "</li></a><a href='/cms?type=freephoto&action=write&select=url'><li class='selected'>" + i18n[lang].free_photo + "</li></a></ul>";
            } else {
                cms_menu = "";
            }
            return cms_menu;
        },
        cms_sub_menu: function () {
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
            var cms_sub_menu;
            if (query.action === 'write') {
                cms_sub_menu = "<ul><a href='/cms?type=website&action=write'><li class='selected'>" + i18n[lang].website_add + "</li></a><a class='preparing-service' href='/cms?type=website&action=list'><li class=''>" + i18n[lang].website_list + "</li></a></ul>";
            } else {
                cms_sub_menu = "";
            }
            return cms_sub_menu;
        },
        is_list_selected: function () {
            console.log("is_list_selected: " + query.action);
            return query.action === 'list';
        },
        query_action: function () {
            return query.action;
        }
    });
};