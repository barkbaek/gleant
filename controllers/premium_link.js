const model = require('../models/premium_link');
const methods = require('../methods');
const article_templates = require('../article_templates');
const i18n = require('../i18n');
const config = require('../env.json')[process.env.NODE_ENV || 'development'];
const randomstring = require('randomstring');

module.exports = function (lang, is_mobile, is_loginned, user, premium_links, template) {
    template.render('premium_link', {
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
            return i18n[lang].premium_link_obj.title;
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
            return i18n[lang].premium_link_obj.description;
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
            user["goint"] = 100;
            user["links"] = 0;
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
            user.charge_goint = i18n[lang].charge_goint;
            user.charge_history = i18n[lang].charge_history;
            user.premium_link = i18n[lang].links;
            return user;
        },
        my_premium_links: function () {
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

            var _id, date, language;
            for (var i = 0; i < 10; i++) {
                _id = randomstring.generate();
                date = new Date().valueOf();

                if (i < 3) {
                    language = "en";
                } else {
                    if (i < 5) {
                        language = "ja";
                    } else {
                        if (i < 8) {
                            language = "ko";
                        } else {
                            language = "zh-Hans";
                        }
                    }
                }

                premium_links.push({
                    blog_id: user.blog_id
                    , pl_id: _id
                    , language: language
                    , title: "제목입니다 ㅎㅎㅎ - " + i
                    , description: '내용이랑께요 """" ㅎㅎㅎ - ' + i
                    , link: "https://www.gleant.com/" + i
                    , keywords: ["키워드1234567890abcdefghijklmnopqsrstuvwxyz", "키워드" + i, "키워드" + i + i]
                    , created_at: date
                    , updated_at: date
                    , is_on: true
                    , is_sleeping: false
                });
            }

            var final_list = "", doc, element;
            for (var i = 0; i < premium_links.length; i++) {
                element = article_templates.get_single_my_premium_link_perfect(lang, premium_links[i]);
                final_list = final_list + element;
            }
            return final_list;
        },
        premium_links: function () {
            var temp;
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

            var _id, date, language;
            for (var i = 0; i < 10; i++) {
                _id = randomstring.generate();
                date = new Date().valueOf();

                if ( i < 3) {
                    language = "en";
                } else {
                    if ( i < 5) {
                        language = "ja";
                    } else {
                        if ( i < 8) {
                            language = "ko";
                        } else {
                            language = "zh-Hans";
                        }
                    }
                }

                premium_links.push({
                    blog_id: user.blog_id
                    , pl_id: _id
                    , language: language
                    , title: "제목입니다 ㅎㅎㅎ - " + i
                    , description: '내용이랑께요 """" ㅎㅎㅎ - ' + i
                    , link: "https://www.gleant.com/" + i
                    , keywords: ["키워드1234567890abcdefghijklmnopqsrstuvwxyz", "키워드" + i, "키워드" + i + i]
                    , created_at: date
                    , updated_at: date
                    , is_on: true
                    , is_sleeping: false
                });

                premium_links[i].add = i18n[lang].add;
                premium_links[i].edit = i18n[lang].edit;
                premium_links[i].remove = i18n[lang].remove;
                premium_links[i].i18n_cancel = i18n[lang].cancel;
                premium_links[i].i18n_check = i18n[lang].check;
                premium_links[i].i18n_keywords = i18n[lang].keywords;
                premium_links[i].i18n_search_keywords = i18n[lang].search_keywords;
                premium_links[i].i18n_selected_keywords = i18n[lang].selected_keywords;
                premium_links[i].i18n_expenditure_history = i18n[lang].expenditure_history;
                premium_links[i].i18n_date = i18n[lang].date + " (UTC)";
                premium_links[i].i18n_exposure = i18n[lang].exposure;
                premium_links[i].i18n_click = i18n[lang].click;
                premium_links[i].i18n_total_cost = i18n[lang].total_cost;
                premium_links[i].i18n_more = i18n[lang].more;
                premium_links[i].i18n_language = i18n[lang].language;
                premium_links[i].i18n_title = i18n[lang].title;
                premium_links[i].i18n_explanation = i18n[lang].explanation;
                premium_links[i].i18n_search = i18n[lang].search;
                premium_links[i].i18n_link = i18n[lang].link;

                if (premium_links[i].language === "en") {
                    premium_links[i].i18n_selected_language = i18n[lang].english;
                    premium_links[i].written_language_options = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
                } else if (premium_links[i].language === "ja") {
                    premium_links[i].i18n_selected_language = i18n[lang].japanese;
                    premium_links[i].written_language_options = "<option class='lang-ja' value='ja' selected='selected'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
                } else if (premium_links[i].language === "ko") {
                    premium_links[i].i18n_selected_language = i18n[lang].korean;
                    premium_links[i].written_language_options = "<option class='lang-ko' value='ko' selected='selected'>" + i18n[lang].korean + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
                } else if (premium_links[i].language === "zh-Hans") {
                    premium_links[i].i18n_selected_language = i18n[lang].simplified_chinese;
                    premium_links[i].written_language_options = "<option class='lang-zh-Hans' value='zh-Hans' selected='selected'>" + i18n[lang].simplified_chinese + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
                }
            }
            return premium_links;
        }
    });
};