const model = require('../models/apply_online_interview');
const methods = require('../methods');
const i18n = require('../i18n');
const article_templates = require('../article_templates');
const config = require('../env.json')[process.env.NODE_ENV || 'development'];

module.exports = function (lang, is_mobile, is_loginned, user, doc, template) {
    template.render('apply_online_interview', {
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
        doc_lang: function () {
            return doc.language;
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
            return doc.company + " " + i18n[lang].online_interview;
        },
        description: function () {
            return doc.company + " " + i18n[lang].online_interview;
        },
        keywords: function () {
            return config["keywords"];
        },
        image: function () {
            return config["image"];
        },
        url: function () {
            return config["url"] + '/apply-online-interview/' + doc._id;
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
        doc: function () {
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
            if (user === null) {
                return article_templates.get_single_online_interview_form(lang, doc, is_loginned, null, 'online_interview');
            } else {
                return article_templates.get_single_online_interview_form(lang, doc, is_loginned, user["blog_id"], 'online_interview');
            }
        },
        online_interview_top: function () {
            var css_version = config["css_version"]
                , datetime = new Date().valueOf()
                , class_online_interview_status
                , online_interview_status
                , written_online_interview_status;

            if (doc['is_start_set'] === true) {
                if (doc['start_at'] > datetime) { /* Scheduled */
                    class_online_interview_status = "online-interview-scheduled";
                    online_interview_status = i18n[lang].online_interview + " " + i18n[lang].scheduled;
                } else {
                    if (doc['is_finish_set'] === true) {
                        if (doc['finish_at'] > datetime) { /* In Progress */
                            class_online_interview_status = "online-interview-in-progress";
                            online_interview_status = i18n[lang].online_interview + " " + i18n[lang].in_progress;
                        } else { /* Finished */
                            class_online_interview_status = "online-interview-finished";
                            online_interview_status = i18n[lang].online_interview + " " + i18n[lang].finished;
                        }
                    } else { /* Unlimited */
                        class_online_interview_status = "online-interview-unlimited";
                        online_interview_status = i18n[lang].online_interview + " " + i18n[lang].unlimited;
                    }
                }
            } else {
                if (doc['is_finish_set'] === true) {
                    if (doc['finish_at'] > datetime) { /* In Progress */
                        class_online_interview_status = "online-interview-in-progress";
                        online_interview_status = i18n[lang].online_interview + " " + i18n[lang].in_progress;
                    } else { /* Finished */
                        class_online_interview_status = "online-interview-finished";
                        online_interview_status = i18n[lang].online_interview + " " + i18n[lang].finished;
                    }
                } else { /* Unlimited */
                    class_online_interview_status = "online-interview-unlimited";
                    online_interview_status = i18n[lang].online_interview + " " + i18n[lang].unlimited;
                }
            }
            written_online_interview_status = "<div class='online-interview-status " + class_online_interview_status + "' data-is-start-set='" + doc['is_start_set'] + "' data-start-at='" + doc['start_at'] + "' data-is-finish-set='" + doc['is_finish_set'] + "' data-finish-at='" + doc['finish_at'] + "' data-print-type='normal'>" + online_interview_status + "</div>";
            return written_online_interview_status;
        },
        company_logo: function () {
            return doc.logo;
        },
        number_of_questions: function () {
            return doc.questions.length;
        }
    });
};