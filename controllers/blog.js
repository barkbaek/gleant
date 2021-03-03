const model = require('../models/blog');
const methods = require('../methods');
const i18n = require('../i18n');
const config = require('../env.json')[process.env.NODE_ENV || 'development'];

module.exports = function (lang, is_mobile, is_loginned, user, blogs, template) {
    template.render('blog', {
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
            return i18n[lang].blog_obj.title;
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
            return i18n[lang].blog_obj.description;
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
        user: function () {
            // 직업 비워있으면 true, 아니면 false
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
        blogs: function () {
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

            for (var i = 0; i < blogs.length; i++) {
                blogs[i]["is_loginned"] = is_loginned;
                if (blogs[i]["type"] === "blog") {
                    blogs[i]["link"] = '/blog/' + blogs[i]["blog_id"] + '/' + blogs[i]["blog_menu_id"] + '/' + blogs[i]["_id"];
                    if (blogs[i]["img_list"].length !== 0) {
                        blogs[i]["thumbnail"] = blogs[i]["img_list"][0].replace('/resized/', '/square/');
                    } else {
                        if (is_loginned === true) {
                            blogs[i]["thumbnail"] = blogs[i]["img"].replace('/resized/', '/square/');
                        } else {
                            if (blogs[i]["img"].indexOf( "male.png") <= -1) {
                                blogs[i]["img"] = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                            }
                            blogs[i]["thumbnail"] = blogs[i]["img"].replace('/resized/', '/square/');
                        }
                    }
                } else {
                    blogs[i]["link"] = '/blog/' + blogs[i]["blog_id"] + '/gallery/' + blogs[i]["_id"];
                    blogs[i]["thumbnail"] = blogs[i]["img"].replace('/resized/', '/square/');
                }

                if (blogs[i]["type"] === "gallery") {
                    blogs[i]["is_youtube_inserted"] = false;
                }

                if (blogs[i]["count_view"] <= 0) {
                    blogs[i]["show_count_view"] = false;
                } else {
                    blogs[i]["show_count_view"] = true;
                    blogs[i]["count_view"] = blogs[i]["count_view"].toLocaleString('en');
                }

                if (blogs[i]["count_awesome"] <= 0) {
                    blogs[i]["show_count_awesome"] = false;
                } else {
                    blogs[i]["show_count_awesome"] = true;
                    blogs[i]["count_awesome"] = blogs[i]["count_awesome"].toLocaleString('en');
                }

                if (blogs[i]["count_comments"] <= 0) {
                    blogs[i]["show_count_comments"] = false;
                } else {
                    blogs[i]["show_count_comments"] = true;
                    blogs[i]["count_comments"] = blogs[i]["count_comments"].toLocaleString('en');
                }

                blogs[i]["are_created_at_updated_at_same"] = blogs[i]["created_at"] === blogs[i]["updated_at"];
                blogs[i]["show_count_written_translations"] = false;
                blogs[i]["show_count_requested_translations"] = false;

                blogs[i].i18n_view = i18n[lang].view;
                blogs[i].i18n_awesome = i18n[lang].awesome;
                blogs[i].i18n_comments = i18n[lang].comments;
                blogs[i].i18n_opinion = i18n[lang].opinion;
                blogs[i].i18n_opinion_request = i18n[lang].opinion_request;
                blogs[i].i18n_translation = i18n[lang].translation;
                blogs[i].i18n_translation_request = i18n[lang].translation_request;
                blogs[i].aws_s3_url = config.aws_s3_url;

                if (blogs[i].public_authority === 0) {
                    blogs[i].i18n_public_authority = i18n[lang].only_me;
                } else if (blogs[i].public_authority === 1) {
                    blogs[i].i18n_public_authority = i18n[lang].public;
                } else if (blogs[i].public_authority === 2) {
                    blogs[i].i18n_public_authority = i18n[lang].friends;
                } else {
                    blogs[i].i18n_public_authority = "";
                }

                var written_language;
                if (blogs[i].language === undefined || blogs[i].language === "") {
                    written_language = "";
                } else if (blogs[i].language === "en") {
                    written_language = "english";
                } else if (blogs[i].language === "ja") {
                    written_language = "japanese";
                } else if (blogs[i].language === "ko") {
                    written_language = "korean";
                } else if (blogs[i].language === "zh-Hans") {
                    written_language = "simplified_chinese";
                } else {
                    written_language = "english";
                }

                if (written_language === "") {
                    blogs[i]["i18n_language"] = "";
                } else {
                    blogs[i]["i18n_language"] = i18n[lang][written_language];
                }

            }
            return blogs;
        },
        trending_blog: function () {
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
                lang === "ja" ||
                lang === "zh-Hans"
            ) {
                return i18n[lang].trending + i18n[lang].blog;
            } else {
                return i18n[lang].trending + " " + i18n[lang].blog;
            }
        },
        realtime_comments_of_blog: function () {
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
                lang === "ja" ||
                lang === "zh-Hans"
            ) {
                return i18n[lang].realtime + i18n[lang].blog + i18n[lang].comments;
            } else {
                return i18n[lang].realtime + " " + i18n[lang].blog + " " + i18n[lang].comments;
            }
        },
        realtime_tags_of_blog: function () {
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
                lang === "ja" ||
                lang === "zh-Hans"
            ) {
                return i18n[lang].realtime + i18n[lang].blog;
            } else {
                return i18n[lang].realtime + " " + i18n[lang].blog;
            }
        }
    });
};
