const model = require('../models/news');
const methods = require('../methods');
const i18n = require('../i18n');
const config = require('../env.json')[process.env.NODE_ENV || 'development'];
const article_templates = require('../article_templates');
module.exports = function (lang, is_mobile, is_loginned, user, final, top_news, category, news_doc, news_comments, template) {
    template.render('news', {
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
            if (category === undefined) {
                return "Gleant " + i18n[lang].news;
            } else {
                return i18n[lang][category] + " - Gleant " + i18n[lang].news;
            }
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
            if (category === undefined) {
                return "Gleant " + i18n[lang].news;
            } else {
                return i18n[lang][category] + " - Gleant " + i18n[lang].news;
            }
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
        news_info: function () {
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
            return article_templates.get_single_perfect_news_with_comments(lang, news_doc, news_comments, is_loginned, user);
        },
        news_menu: function () {
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
            var news_menu_obj = {}
                , temp;
            news_menu_obj["total"] = {name: i18n[lang].total, link: "/news", style: ""};
            news_menu_obj["politics"] = {name: i18n[lang].politics, link: "/news?category=politics", style: ""};
            news_menu_obj["economy"] = {name: i18n[lang].economy, link: "/news?category=economy", style: ""};
            news_menu_obj["society"] = {name: i18n[lang].society, link: "/news?category=society", style: ""};
            news_menu_obj["culture"] = {name: i18n[lang].culture, link: "/news?category=culture", style: ""};
            news_menu_obj["world"] = {name: i18n[lang].world, link: "/news?category=world", style: ""};
            news_menu_obj["it"] = {name: i18n[lang].it, link: "/news?category=it", style: ""};
            news_menu_obj["entertainment"] = {name: i18n[lang].entertainment, link: "/news?category=entertainment", style: ""};
            news_menu_obj["sports"] = {name: i18n[lang].sports, link: "/news?category=sports", style: ""};
            var news_menu_short_list = {};
            news_menu_short_list["ko"] = ["total","politics","economy","society","culture","world","entertainment","sports"];
            news_menu_short_list["en"] = ["total","economy","world","it","sports"];
            news_menu_short_list["ja"] = ["total","politics","economy","society","world","it","sports"];
            news_menu_short_list["zh-Hans"] = ["total","politics","economy","society","entertainment","sports"];
            var news_menu = [];
            for (var i = 0; i < news_menu_short_list[lang].length; i++) {
                temp = news_menu_obj[news_menu_short_list[lang][i]];
                if (i === 0) {
                    if (category === undefined) {
                        temp.style = "selected";
                    }
                } else {
                    if (category === news_menu_short_list[lang][i]) {
                        temp.style = "selected";
                    }
                }
                news_menu.push(temp);
            }
            return news_menu;
        },
        news_list: function () {
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
            return article_templates.get_news_list(lang, category, final);
        },
        category: function () {
            return category === undefined ? "" : category;
        },
        i18n_category: function () {
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
            return category === undefined ? "" : i18n[lang][category];
        },
        is_category_selected: function () {
            return category !== undefined;
        },
        news_most_read: function () {
            for (var i = 0; i < top_news.news_most_read.length; i++) {
                top_news.news_most_read[i]["index"] = (i+1);
                top_news.news_most_read[i]["aws_s3_url"] = config.aws_s3_url;
            }
            return top_news.news_most_read;
        },
        sports_most_read: function () {
            for (var i = 0; i < top_news.sports_most_read.length; i++) {
                top_news.sports_most_read[i]["index"] = (i+1);
                top_news.sports_most_read[i]["aws_s3_url"] = config.aws_s3_url;
            }
            return top_news.sports_most_read;
        },
        news_many_comments: function () {
            for (var i = 0; i < top_news.news_many_comments.length; i++) {
                top_news.news_many_comments[i]["index"] = (i+1);
                top_news.news_many_comments[i]["aws_s3_url"] = config.aws_s3_url;
            }
            return top_news.news_many_comments;
        },
        sports_many_comments: function () {
            for (var i = 0; i < top_news.sports_many_comments.length; i++) {
                top_news.sports_many_comments[i]["index"] = (i+1);
                top_news.sports_many_comments[i]["aws_s3_url"] = config.aws_s3_url;
            }
            return top_news.sports_many_comments;
        }
    });
};