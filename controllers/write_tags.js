const model = require('../models/write_tags');
const methods = require('../methods');
const i18n = require('../i18n');
const article_templates = require('../article_templates');
const config = require('../env.json')[process.env.NODE_ENV || 'development'];
module.exports = function (lang, is_mobile, is_loginned, user, news_list, query, template) {
    template.render('write_tags', {
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
            return "Gleant CMS";
        },
        description: function () {
            return "Gleant ";
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
        total_news_list: function () {
            return news_list.length;
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
            for (var i = 0; i < news_list.length; i++) {
                news_list[i].aws_s3_url = config.aws_s3_url;
                news_list[i].i18n_check = i18n[lang].check;
                news_list[i].i18n_tags = i18n[lang].tags;
                news_list[i].i18n_language = i18n[lang].language;
                news_list[i].i18n_category = i18n[lang].category;
                news_list[i].i18n_view = i18n[lang].view;
                news_list[i].i18n_comments = i18n[lang].comments;
                news_list[i].language = i18n[lang][methods.get_language_text(news_list[i].language)];
                news_list[i].category = i18n[lang][news_list[i].category];
            }
            return news_list;
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
                cms_sub_menu = "<ul><a href='/cms?type=news_tag&action=write&sort=all'><li class='selected'>" + i18n[lang].news_tag_writing + "</li></a><a href='/cms?type=news_tag&action=list&sort=all'><li class=''>" + i18n[lang].news_tag_list + "</li></a></ul>";
            } else { /* list */
                cms_sub_menu = "<ul><a href='/cms?type=news_tag&action=write&sort=all'><li class=''>" + i18n[lang].news_tag_writing + "</li></a><a href='/cms?type=news_tag&action=list&sort=all'><li class='selected'>" + i18n[lang].news_tag_list + "</li></a></ul>";
            }
            return cms_sub_menu;
        },
        news_tag_sort_menu: function () {
            var sort = query.sort
                , menu = ""
                , all
                , english
                , japanese
                , korean
                , simplified_chinese;
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
            all = "<a href='/cms?type=news_tag&action=" + query.action + "&sort=all'><li class=''>" + i18n[lang].total + "</li></a>";
            korean = "<a href='/cms?type=news_tag&action=" + query.action + "&sort=ko'><li class=''>" + i18n[lang][methods.get_language_text("ko")] + "</li></a>";
            simplified_chinese = "<a href='/cms?type=news_tag&action=" + query.action + "&sort=zh-Hans'><li class=''>" + i18n[lang][methods.get_language_text("zh-Hans")] + "</li></a>";
            english = "<a href='/cms?type=news_tag&action=" + query.action + "&sort=en'><li class=''>" + i18n[lang][methods.get_language_text("en")] + "</li></a>";
            japanese = "<a href='/cms?type=news_tag&action=" + query.action + "&sort=ja'><li class=''>" + i18n[lang][methods.get_language_text("ja")] + "</li></a>";
            if (sort === "all") {
                menu = "<a href='/cms?type=news_tag&action=" + query.action + "&sort=all'><li class='selected'>" + i18n[lang].total + "</li></a>" + korean + simplified_chinese + english + japanese;
            } else if (sort === "ko") {
                menu = all + "<a href='/cms?type=news_tag&action=" + query.action + "&sort=ko'><li class='selected'>" + i18n[lang][methods.get_language_text("ko")] + "</li></a>" + simplified_chinese + english + japanese;
            } else if (sort === "zh-Hans") {
                menu = all + korean + "<a href='/cms?type=news_tag&action=" + query.action + "&sort=zh-Hans'><li class='selected'>" + i18n[lang][methods.get_language_text("zh-Hans")] + "</li></a>" + english + japanese;
            } else if (sort === "en") {
                menu = all + korean + simplified_chinese + "<a href='/cms?type=news_tag&action=" + query.action + "&sort=en'><li class='selected'>" + i18n[lang][methods.get_language_text("en")] + "</li></a>" + japanese;
            } else if (sort === "ja") {
                menu = all + korean + simplified_chinese + english + "<a href='/cms?type=news_tag&action=" + query.action + "&sort=ja'><li class='selected'>" + i18n[lang][methods.get_language_text("ja")] + "</li></a>"
            }
            /*return menu;*/
            return "";
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