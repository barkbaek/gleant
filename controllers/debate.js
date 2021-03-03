const model = require('../models/debate');
const methods = require('../methods');
const i18n = require('../i18n');
const config = require('../env.json')[process.env.NODE_ENV || 'development'];
module.exports = function (lang, is_mobile, is_loginned, user, debates, main_tag, template) {
    template.render('debate', {
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
            if (main_tag === undefined) {
                return i18n[lang].debate_obj.title;
            } else {
                return i18n[lang][main_tag] + " " + i18n[lang].debate_obj.title;
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
            return i18n[lang].debate_obj.description;
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
        debates: function () {
            var datetime = new Date().valueOf()
                , temp;
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

            for (var i = 0; i < debates.length; i++) {
                debates[i]["is_loginned"] = is_loginned;
                if (debates[i]["img_list"].length !== 0) {
                    debates[i]["thumbnail"] = debates[i]["img_list"][0].replace('/resized/', '/square/');
                } else {
                    if (is_loginned === true) {
                        debates[i]["thumbnail"] = debates[i]["img"].replace('/resized/', '/square/');
                    } else {
                        if (debates[i]["img"].indexOf( "male.png") <= -1) {
                            debates[i]["img"] = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                        }
                        debates[i]["thumbnail"] = debates[i]["img"].replace('/resized/', '/square/');
                    }
                }
                if (debates[i]["count_view"] <= 0) {
                    debates[i]["show_count_view"] = false;
                } else {
                    debates[i]["show_count_view"] = true;
                    debates[i]["count_view"] = debates[i]["count_view"].toLocaleString('en');
                }

                if (debates[i]["count_awesome"] <= 0) {
                    debates[i]["show_count_awesome"] = false;
                } else {
                    debates[i]["show_count_awesome"] = true;
                    debates[i]["count_awesome"] = debates[i]["count_awesome"].toLocaleString('en');
                }

                if (debates[i]["public_authority"] === 1) {
                    debates[i]["is_public"] = true;
                } else {
                    debates[i]["is_public"] = false;
                }

                debates[i]["are_created_at_updated_at_same"] = debates[i]["created_at"] === debates[i]["updated_at"];

                debates[i]["is_agenda"] = false;
                debates[i]["class_debate_status"] = "debate-unlimited";
                debates[i]["debate_status"] = i18n[lang].unlimited;

                if (
                    debates[i]["type"] === "agenda" ||
                    debates[i]["type"] === "tr_agenda"
                ) {
                    debates[i]["is_agenda"] = true;
                    /* Debate Status */
                    if (debates[i]["is_start_set"] === true) {
                        if (debates[i]["start_at"] > datetime) { /* Scheduled */
                            debates[i]["class_debate_status"] = "debate-scheduled";
                            debates[i]["debate_status"] = i18n[lang].scheduled;
                        } else {
                            if (debates[i]["is_finish_set"] === true) {
                                if (debates[i]["finish_at"] > datetime) { /* In Progress */
                                    debates[i]["class_debate_status"] = "debate-in-progress";
                                    debates[i]["debate_status"] = i18n[lang].in_progress;
                                } else { /* Finished */
                                    debates[i]["class_debate_status"] = "debate-finished";
                                    debates[i]["debate_status"] = i18n[lang].finished;
                                }
                            } else { /* Unlimited */
                                debates[i]["class_debate_status"] = "debate-unlimited";
                                debates[i]["debate_status"] = i18n[lang].unlimited;
                            }
                        }
                    } else {
                        if (debates[i]["is_finish_set"] === true) {
                            if (debates[i]["finish_at"] > datetime) { /* In Progress */
                                debates[i]["class_debate_status"] = "debate-in-progress";
                                debates[i]["debate_status"] = i18n[lang].in_progress;
                            } else { /* Finished */
                                debates[i]["class_debate_status"] = "debate-finished";
                                debates[i]["debate_status"] = i18n[lang].finished;
                            }
                        } else { /* Unlimited */
                            debates[i]["class_debate_status"] = "debate-unlimited";
                            debates[i]["debate_status"] = i18n[lang].unlimited;
                        }
                    }

                    if (debates[i]["type"] === "agenda") {
                        if (debates[i]["count_written_opinions"] <= 0) {
                            debates[i]["show_count_written_opinions"] = false;
                        } else {
                            debates[i]["show_count_written_opinions"] = true;
                            debates[i]["count_written_opinions"] = debates[i]["count_written_opinions"].toLocaleString('en');
                        }

                        if (debates[i]["count_requested_opinions"] <= 0) {
                            debates[i]["show_count_requested_opinions"] = false;
                        } else {
                            debates[i]["show_count_requested_opinions"] = true;
                            debates[i]["count_requested_opinions"] = debates[i]["count_requested_opinions"].toLocaleString('en');
                        }
                        debates[i]["type_text"] = i18n[lang].agenda;
                        debates[i]["original_translation"] = i18n[lang].original;
                        debates[i]["link"] = '/agenda/' + debates[i]["_id"];
                    } else {
                        debates[i]["show_count_written_opinions"] = false;
                        debates[i]["show_count_requested_opinions"] = false;
                        debates[i]["type_text"] = i18n[lang].agenda;
                        debates[i]["original_translation"] = i18n[lang].translation;
                        debates[i]["link"] = '/agenda/' + debates[i]["agenda_id"] + '/tr/' + debates[i]["_id"];
                    }
                } else {
                    debates[i]["show_count_written_opinions"] = false;
                    debates[i]["show_count_requested_opinions"] = false;
                    if (debates[i]["type"] === "opinion") {
                        debates[i]["type_text"] = i18n[lang].opinion;
                        debates[i]["original_translation"] = i18n[lang].original;
                        debates[i]["link"] = '/agenda/' + debates[i]["agenda_id"] + '/opinion/' + debates[i]["_id"];
                    } else if (debates[i]["type"] === "tr_opinion") {
                        debates[i]["type_text"] = i18n[lang].opinion;
                        debates[i]["original_translation"] = i18n[lang].translation;
                        debates[i]["link"] = '/agenda/' + debates[i]["agenda_id"] + '/opinion/' + debates[i]["opinion_id"] + '/tr/' + debates[i]["_id"];
                    }
                }

                if (debates[i]["count_comments"] <= 0) {
                    debates[i]["show_count_comments"] = false;
                } else {
                    debates[i]["show_count_comments"] = true;
                    debates[i]["count_comments"] = debates[i]["count_comments"].toLocaleString('en');
                }

                if (
                    debates[i]["type"] === "agenda" ||
                    debates[i]["type"] === "opinion"
                ) {
                    var total_count_written_translations = 0;
                    for (var j = 0; j < debates[i]["count_written_translations"].length; j++) {
                        if (debates[i]["count_written_translations"][j].count < 0) {
                            debates[i]["count_written_translations"][j].count = 0;
                        }
                        total_count_written_translations = total_count_written_translations + debates[i]["count_written_translations"][j].count;
                    }
                    if (total_count_written_translations === 0) {
                        debates[i]["show_count_written_translations"] = false;
                    } else {
                        debates[i]["show_count_written_translations"] = true;
                        debates[i]["count_written_translations"] = total_count_written_translations.toLocaleString('en');
                    }

                    if (debates[i]["count_requested_translations"] <= 0) {
                        debates[i]["show_count_requested_translations"] = false;
                    } else {
                        debates[i]["show_count_requested_translations"] = true;
                        debates[i]["count_requested_translations"] = debates[i]["count_requested_translations"].toLocaleString('en');
                    }
                } else {
                    debates[i]["show_count_written_translations"] = false;
                    debates[i]["show_count_requested_translations"] = false;
                }

                debates[i].i18n_view = i18n[lang].view;
                debates[i].i18n_awesome = i18n[lang].awesome;
                debates[i].i18n_comments = i18n[lang].comments;
                debates[i].i18n_opinion = i18n[lang].opinion;
                debates[i].i18n_opinion_request = i18n[lang].opinion_request;
                debates[i].i18n_translation = i18n[lang].translation;
                debates[i].i18n_translation_request = i18n[lang].translation_request;
                debates[i].aws_s3_url = config.aws_s3_url;

                debates[i].i18n_public = i18n[lang].public;
                debates[i].i18n_invited_users = i18n[lang].invited_users;

                var written_language;
                if (debates[i].language === "en") {
                    written_language = "english";
                } else if (debates[i].language === "ja") {
                    written_language = "japanese";
                } else if (debates[i].language === "ko") {
                    written_language = "korean";
                } else if (debates[i].language === "zh-Hans") {
                    written_language = "simplified_chinese";
                } else {
                    written_language = "english";
                }

                debates[i]["i18n_language"] = i18n[lang][written_language];
                debates[i]["i18n_main_tag"] = i18n[lang][debates[i]["main_tag"]];
            }
            return debates;
        },
        main_tag: function () {
            return main_tag === undefined ? "" : main_tag;
        },
        i18n_main_tag: function () {
            return main_tag === undefined ? "" : i18n[lang][main_tag];
        },
        trending_debate: function () {
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
                return i18n[lang].trending + i18n[lang].debate;
            } else {
                return i18n[lang].trending + " " + i18n[lang].debate;
            }
        },
        trending_tags_of_main_tag: function () {
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
            if (main_tag === undefined) {
                if (
                    lang === "ja" ||
                    lang === "zh-Hans"
                ) {
                    return i18n[lang].trending + i18n[lang].tags;
                } else {
                    return i18n[lang].trending + " " + i18n[lang].tags;
                }
            } else {
                if (
                    lang === "ja" ||
                    lang === "zh-Hans"
                ) {
                    return i18n[lang].trending + i18n[lang][main_tag] + i18n[lang].tags;
                } else {
                    return i18n[lang].trending + " " + i18n[lang][main_tag] + " " + i18n[lang].tags;
                }
            }
        },
        realtime_comments_of_debate: function () {
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
                return i18n[lang].realtime + i18n[lang].debate + i18n[lang].comments;
            } else {
                return i18n[lang].realtime + " " + i18n[lang].debate + " " + i18n[lang].comments;
            }
        },
        realtime_tags_of_debate: function () {
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
            if (main_tag === undefined) {
                if (
                    lang === "ja" ||
                    lang === "zh-Hans"
                ) {
                    return i18n[lang].realtime + i18n[lang].debate;
                } else {
                    return i18n[lang].realtime + " " + i18n[lang].debate;
                }
            } else {
                if (
                    lang === "ja" ||
                    lang === "zh-Hans"
                ) {
                    return i18n[lang].realtime + i18n[lang][main_tag] + i18n[lang].debate;
                } else {
                    return i18n[lang].realtime + " " + i18n[lang][main_tag] + " " + i18n[lang].debate;
                }
            }
        },
        is_main_tag_selected: function () {
            return main_tag !== undefined;
        }
    });
};