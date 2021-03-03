const model = require('../models/home');
const methods = require('../methods');
const i18n = require('../i18n');
const config = require('../env.json')[process.env.NODE_ENV || 'development'];
const article_templates = require('../article_templates');
module.exports = function (lang, is_mobile, is_loginned, user, all_docs, news_doc, news_comments, template) {
    template.render('home', {
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
            return i18n[lang].home_obj.title;
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
            return i18n[lang].home_obj.description;
        },
        keywords: function () {
            return config["keywords"];
        },
        image: function () {
            return config["image"];
        },
        url: function () {
            return config["url"];
        },
        alternate_list: function () {
            var list = [];
            list.push({ url: config.url, lang: "en" });
            list.push({ url: config.url.replace('www', 'en'), lang: "en" });
            list.push({ url: config.url.replace('www', 'ja'), lang: "ja" });
            list.push({ url: config.url.replace('www', 'ko'), lang: "ko" });
            list.push({ url: config.url.replace('www', 'zh-hans'), lang: "zh-Hans" });
            return list;
        },
        site_name: function () {
            return config["site_name"];
        },
        twitter_site: function () {
            return config["twitter_site"];
        },
        published_date: function () {
            var published = new Date();
            published.setFullYear(2017);
            published.setMonth(9);
            published.setDate(30);
            published.setHours(16);
            published.setMinutes(00);
            published.setSeconds(00);
            return published;
        },
        date: function () {
            return new Date();
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
            return user;
        },
        text_news: function () {
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
            var docs = all_docs.news
                , title
                , site;
            if (docs && docs.length > 4) {
                for (var i = 0; i < 5; i++) {
                    title = docs[i].title;
                    site = docs[i].site;
                    if (i === 0) {
                        docs[i].style = "border-top:0";
                    } else {
                        docs[i].style = "";
                    }
                    if (
                        lang === "ja" ||
                        lang === "zh-Hans"
                    ) {
                        docs[i].title = (title.length + site.length) > 30 ? title.substring(0, 30 - 3 - site.length) + "..." : title;
                    } else if (lang === "en") {
                        docs[i].title = (title.length + site.length) > 60 ? title.substring(0, 60 - 3 - site.length) + "..." : title;
                    } else {
                        docs[i].title = (title.length + site.length) > 40 ? title.substring(0, 40 - 3 - site.length) + "..." : title;
                    }
                    docs[i].aws_s3_url = config.aws_s3_url;
                }
                return docs;
            } else {
                return [];
            }
        },
        text_entertainment: function () {
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
            var docs = all_docs.entertainment
                , title
                , site;
            if (docs && docs.length > 4) {
                for (var i = 0; i < 5; i++) {
                    title = docs[i].title;
                    site = docs[i].site;
                    if (i === 0) {
                        docs[i].style = "border-top:0";
                    } else {
                        docs[i].style = "";
                    }
                    if (
                        lang === "ja" ||
                        lang === "zh-Hans"
                    ) {
                        docs[i].title = (title.length + site.length) > 30 ? title.substring(0, 30 - 3 - site.length) + "..." : title;
                    } else if (lang === "en") {
                        docs[i].title = (title.length + site.length) > 60 ? title.substring(0, 60 - 3 - site.length) + "..." : title;
                    } else {
                        docs[i].title = (title.length + site.length) > 40 ? title.substring(0, 40 - 3 - site.length) + "..." : title;
                    }
                    docs[i].aws_s3_url = config.aws_s3_url;
                }
                return docs;
            } else {
                return [];
            }
        },
        debates: function () {
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
            var gather_around_lets_debate;
            if (lang === "en" || lang === "ko") {
                gather_around_lets_debate = i18n[lang].gather_around + ". " + i18n[lang].lets_debate + ". ";
            } else {
                gather_around_lets_debate = i18n[lang].gather_around + "。" + i18n[lang].lets_debate + "。";
            }
            var docs = all_docs.agenda
                , copied = []
                , title;
            for (var i = 0; i < 8; i++) {
                copied[i] = {};
                if (docs[i] === undefined) {
                    copied[i].link = "/debate";
                    copied[i]["thumbnail"] = "https://images.gleant.com/upload/images/00000000/freephoto/square/1515139074744-gu7jKlaI3vge1BjVVzr65b6BQlaGKz4s-640-636.png";
                    copied[i].title = gather_around_lets_debate;
                    copied[i].name = "Gleant";
                    copied[i].is_youtube_inserted = false;
                } else {
                    if (docs[i].type === "agenda") {
                        copied[i].link = "/agenda/" + docs[i]._id;
                    } else if (docs[i].type === "tr_agenda") {
                        copied[i].link = "/agenda/" + docs[i].agenda_id + "/tr/" + docs[i]._id;
                    }
                    if (docs[i]["img_list"].length !== 0) {
                        copied[i]["thumbnail"] = docs[i]["img_list"][0].replace('/resized/', '/square/');
                    } else {
                        if (is_loginned === true) {
                            copied[i]["thumbnail"] = docs[i]["img"].replace('/resized/', '/square/');
                        } else {
                            if (docs[i]["img"].indexOf( "male.png") <= -1) {
                                docs[i]["img"] = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                            }
                            copied[i]["thumbnail"] = docs[i]["img"].replace('/resized/', '/square/');
                        }
                    }
                    title = docs[i].title;
                    if (
                        lang === "ja" ||
                        lang === "zh-Hans"
                    ) {
                        copied[i].title = title.length > 30 ? title.substring(0, 30 - 3) + "..." : title;
                    } else if (lang === "en") {
                        copied[i].title = title.length > 60 ? title.substring(0, 60 - 3) + "..." : title;
                    } else {
                        copied[i].title = title.length > 40 ? title.substring(0, 40 - 3) + "..." : title;
                    }
                    copied[i].is_youtube_inserted = docs[i].is_youtube_inserted;
                }
                copied[i].aws_s3_url = config.aws_s3_url;
                copied[i].css_version = config.css_version;
            }
            return copied;
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
            var docs = all_docs.blog;
            for (var i = 0; i < docs.length; i++) {
                if (docs[i].type === "blog") {
                    docs[i].link = "/blog/" + docs[i].blog_id + "/" + docs[i].blog_menu_id + "/" + docs[i]._id;
                    if (docs[i]["img_list"].length !== 0) {
                        docs[i]["thumbnail"] = docs[i]["img_list"][0].replace('/resized/', '/square/');
                    } else {
                        docs[i]["thumbnail"] = docs[i]["img"].replace('/resized/', '/square/');
                    }
                } else if (docs[i].type === "gallery") {
                    docs[i].link = "/blog/" + docs[i].blog_id + "/gallery/" + docs[i]._id;
                    docs[i]["thumbnail"] = docs[i]["img"].replace('/resized/', '/square/');
                    docs[i].is_youtube_inserted = false;
                }
                title = docs[i].title;
                if (
                    lang === "ja" ||
                    lang === "zh-Hans"
                ) {
                    docs[i].title = title.length > 30 ? title.substring(0, 30 - 3) + "..." : title;
                } else if (lang === "en") {
                    docs[i].title = title.length > 60 ? title.substring(0, 60 - 3) + "..." : title;
                } else {
                    docs[i].title = title.length > 40 ? title.substring(0, 40 - 3) + "..." : title;
                }
                docs[i].aws_s3_url = config.aws_s3_url;
                docs[i].css_version = config.css_version;
            }
            return docs;
        },
        users: function () {
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
            var docs = all_docs.user
                , blog_name;

            for (var i = 0; i < docs.length; i++) {
                blog_name = docs[i].blog_name;
                if (
                    lang === "ja" ||
                    lang === "zh-Hans"
                ) {
                    docs[i].blog_name = blog_name.length > 30 ? blog_name.substring(0, 30 - 3) + "..." : blog_name;
                } else if (lang === "en") {
                    docs[i].blog_name = blog_name.length > 60 ? blog_name.substring(0, 60 - 3) + "..." : blog_name;
                } else {
                    docs[i].blog_name = blog_name.length > 40 ? blog_name.substring(0, 40 - 3) + "..." : blog_name;
                }
            }
            return docs;
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
        }/*,
        thumbnail_debate: function () {
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
            var gather_around_lets_debate;
            if (lang === "en" || lang === "ko") {
                gather_around_lets_debate = i18n[lang].gather_around + ". " + i18n[lang].lets_debate + ". ";
            } else {
                gather_around_lets_debate = i18n[lang].gather_around + "。" + i18n[lang].lets_debate + "。";
            }
            var docs = all_docs.agenda
                , copied = []
                , title;
            for (var i = 0; i < 2; i++) {
                copied[i] = {};
                if (docs[i] === undefined) {
                    copied[i].link = "/debate";
                    copied[i]["thumbnail"] = "https://images.gleant.com/upload/images/00000000/freephoto/square/1515139074744-gu7jKlaI3vge1BjVVzr65b6BQlaGKz4s-640-636.png";
                    copied[i].title = gather_around_lets_debate;
                    copied[i].name = "Gleant";
                    copied[i].is_youtube_inserted = false;
                } else {
                    if (docs[i].type === "agenda") {
                        copied[i].link = "/agenda/" + docs[i]._id;
                    } else if (docs[i].type === "tr_agenda") {
                        copied[i].link = "/agenda/" + docs[i].agenda_id + "/tr/" + docs[i]._id;
                    }
                    if (docs[i]["img_list"].length !== 0) {
                        copied[i]["thumbnail"] = docs[i]["img_list"][0].replace('/resized/', '/square/');
                    } else {
                        if (is_loginned === true) {
                            copied[i]["thumbnail"] = docs[i]["img"].replace('/resized/', '/square/');
                        } else {
                            if (docs[i]["img"].indexOf( "male.png") <= -1) {
                                docs[i]["img"] = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                            }
                            copied[i]["thumbnail"] = docs[i]["img"].replace('/resized/', '/square/');
                        }
                    }
                    title = docs[i].title;
                    if (
                        lang === "ja" ||
                        lang === "zh-Hans"
                    ) {
                        copied[i].title = title.length > 30 ? title.substring(0, 30 - 3) + "..." : title;
                    } else if (lang === "en") {
                        copied[i].title = title.length > 60 ? title.substring(0, 60 - 3) + "..." : title;
                    } else {
                        copied[i].title = title.length > 40 ? title.substring(0, 40 - 3) + "..." : title;
                    }
                    copied[i].is_youtube_inserted = docs[i].is_youtube_inserted;
                }
                copied[i].aws_s3_url = config.aws_s3_url;
                copied[i].css_version = config.css_version;
            }
            return copied;
        },
        text_debate: function () {
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
            var gather_around_lets_debate;
            if (lang === "en" || lang === "ko") {
                gather_around_lets_debate = i18n[lang].gather_around + ". " + i18n[lang].lets_debate + ". ";
            } else {
                gather_around_lets_debate = i18n[lang].gather_around + "。" + i18n[lang].lets_debate + "。";
            }
            var docs = all_docs.agenda
                , copied = []
                , title;
            for (var i = 2; i < 7; i++) {
                copied[i-2] = {};
                if (docs[i] === undefined) {
                    copied[i-2].link = "/debate";
                    copied[i-2].title = gather_around_lets_debate;
                    copied[i-2].name = "Gleant";
                } else {
                    if (docs[i].type === "agenda") {
                        copied[i-2].link = "/agenda/" + docs[i]._id;
                    } else if (docs[i].type === "tr_agenda") {
                        copied[i-2].link = "/agenda/" + docs[i].agenda_id + "/tr/" + docs[i]._id;
                    }
                    title = docs[i].title;
                    if (
                        lang === "ja" ||
                        lang === "zh-Hans"
                    ) {
                        copied[i-2].title = title.length > 30 ? title.substring(0, 30 - 3) + "..." : title;
                    } else if (lang === "en") {
                        copied[i-2].title = title.length > 60 ? title.substring(0, 60 - 3) + "..." : title;
                    } else {
                        copied[i-2].title = title.length > 40 ? title.substring(0, 40 - 3) + "..." : title;
                    }
                }
            }
            return copied;
        },
        thumbnail_employment: function () {
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
            var apply_now
                , docs = all_docs.apply_now
                , copied = []
                , title;
            if (lang === "en" || lang === "ko") {
                apply_now = i18n[lang].apply_now + ". ";
            } else {
                apply_now = i18n[lang].apply_now + "。";
            }
            for (var i = 0; i < 2; i++) {
                copied[i] = {};
                if (docs[i] === undefined) {
                    copied[i].link = "/apply-now";
                    copied[i]["thumbnail"] = "https://images.gleant.com/upload/images/00000000/freephoto/square/1515139074744-gu7jKlaI3vge1BjVVzr65b6BQlaGKz4s-640-636.png";
                    copied[i].title = apply_now;
                    copied[i].company = "Gleant";
                    copied[i].is_youtube_inserted = false;
                } else {
                    copied[i].link = "/apply-now/" + docs[i]._id;
                    copied[i]["thumbnail"] = docs[i]["logo"].replace('/resized/', '/square/');
                    copied[i]["company"] = docs[i].company;
                    title = docs[i].title;
                    if (
                        lang === "ja" ||
                        lang === "zh-Hans"
                    ) {
                        copied[i].title = (title.length + docs[i].company.length) > 30 ? title.substring(0, 30 - 3) + "..." : title;
                    } else if (lang === "en") {
                        copied[i].title = (title.length + docs[i].company.length) > 60 ? title.substring(0, 60 - 3) + "..." : title;
                    } else {
                        copied[i].title = (title.length + docs[i].company.length) > 40 ? title.substring(0, 40 - 3) + "..." : title;
                    }
                    copied[i].is_youtube_inserted = docs[i].is_youtube_inserted;
                }
                copied[i].aws_s3_url = config.aws_s3_url;
                copied[i].css_version = config.css_version;
            }
            return copied;
        },
        text_employment: function () {
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
            var apply_now
                , docs = all_docs.apply_now
                , copied = []
                , title;

            if (lang === "en" || lang === "ko") {
                apply_now = i18n[lang].apply_now + ". ";
            } else {
                apply_now = i18n[lang].apply_now + "。";
            }

            for (var i = 2; i < 7; i++) {
                copied[i-2] = {};
                if (docs[i] === undefined) {
                    copied[i-2].link = "/apply-now";
                    copied[i-2].title = apply_now;
                    copied[i-2].company = "Gleant";
                } else {
                    copied[i-2].link = "/apply-now/" + docs[i]._id;
                    copied[i-2].company = docs[i].company;
                    title = docs[i].title;
                    if (
                        lang === "ja" ||
                        lang === "zh-Hans"
                    ) {
                        copied[i-2].title = (title.length + docs[i].company) > 30 ? title.substring(0, 30 - 3) + "..." : title;
                    } else if (lang === "en") {
                        copied[i-2].title = (title.length + docs[i].company) > 60 ? title.substring(0, 60 - 3) + "..." : title;
                    } else {
                        copied[i-2].title = (title.length + docs[i].company) > 40 ? title.substring(0, 40 - 3) + "..." : title;
                    }
                }
            }
            return copied;
        }*/
    });
};

/*
 <div id="home-debate-employment">
 <div id="home-debate">
 <div class="article-title"><a href="/debate"><span class="home-more">{{more}}<img src="{{aws_s3_url}}/icons/more-right.png{{css_version}}"></span></a><span>{{debate}}</span></div>
 <div class="home-content">{{#each thumbnail_debate}}<a href="{{link}}" alt="{{name}}" title="{{name}}"><div class="home-content-item home-big-item"><img class="home-content-middle home-double" src="{{thumbnail}}"><div class="home-content-bottom">{{#if is_youtube_inserted}}<span class='youtube-inserted'><img src='{{aws_s3_url}}/icons/youtube.png{{css_version}}' title='YouTube' alt='YouTube'></span>{{/if}}{{title}}</div></div></a>{{/each}}{{#each text_debate}}<a href="{{link}}" alt="{{name}}" title="{{name}}"><div class="home-text-only-content">{{title}}</div></a>{{/each}}</div>
 </div>
 <div id="home-employment">
 {{#with i18n}}<div class="article-title"><a href="/apply-now"><span class="home-more">{{more}}<img src="{{aws_s3_url}}/icons/more-right.png{{css_version}}"></span></a><span>{{employment}}</span></div>{{/with}}
 <div class="home-content">{{#each thumbnail_employment}}<a href="{{link}}" alt="{{company}}" title="{{company}}"><div class="home-content-item home-big-item"><img class="home-content-middle home-double" src="{{thumbnail}}"><div class="home-content-bottom">{{#if is_youtube_inserted}}<span class='youtube-inserted'><img src='{{aws_s3_url}}/icons/youtube.png{{css_version}}' title='YouTube' alt='YouTube'></span>{{/if}}<strong style="margin-right:5px;">{{company}}</strong>{{title}}</div></div></a>{{/each}}{{#each text_employment}}<a href="{{link}}" alt="{{company}}" title="{{company}}"><div class="home-text-only-content"><strong style="margin-right:5px;">{{company}}</strong>{{title}}</div></a>{{/each}}</div>
 </div>
 </div>
 */