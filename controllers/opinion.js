const model = require('../models/opinion');
const methods = require('../methods');
const i18n = require('../i18n');
const config = require('../env.json')[process.env.NODE_ENV || 'development'];

module.exports = function (lang, is_mobile, is_loginned, user, opinions, main_tag, template) {
    template.render('opinion', {
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
                return i18n[lang].opinion_obj.title;
            } else {
                return i18n[lang][main_tag] + " " + i18n[lang].opinion_obj.title;
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
            return i18n[lang].opinion_obj.description;
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
        opinions: function () {
            var datetime = new Date().valueOf();

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

            for (var i = 0; i < opinions.length; i++) {
                opinions[i]["is_loginned"] = is_loginned;
                if (opinions[i]["img_list"].length !== 0) {
                    opinions[i]["thumbnail"] = opinions[i]["img_list"][0].replace('/resized/', '/square/');
                } else {
                    if (is_loginned === true) {
                        opinions[i]["thumbnail"] = opinions[i]["img"].replace('/resized/', '/square/');
                    } else {
                        if (opinions[i]["img"].indexOf( "male.png") <= -1) {
                            opinions[i]["img"] = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                        }
                        opinions[i]["thumbnail"] = opinions[i]["img"].replace('/resized/', '/square/');
                    }
                }
                if (opinions[i]["count_view"] <= 0) {
                    opinions[i]["show_count_view"] = false;
                } else {
                    opinions[i]["show_count_view"] = true;
                    opinions[i]["count_view"] = opinions[i]["count_view"].toLocaleString('en');
                }

                if (opinions[i]["count_awesome"] <= 0) {
                    opinions[i]["show_count_awesome"] = false;
                } else {
                    opinions[i]["show_count_awesome"] = true;
                    opinions[i]["count_awesome"] = opinions[i]["count_awesome"].toLocaleString('en');
                }

                if (opinions[i]["public_authority"] === 1) {
                    opinions[i]["is_public"] = true;
                } else {
                    opinions[i]["is_public"] = false;
                }

                opinions[i]["are_created_at_updated_at_same"] = opinions[i]["created_at"] === opinions[i]["updated_at"];

                opinions[i]["is_agenda"] = false;
                opinions[i]["class_debate_status"] = "debate-unlimited";
                opinions[i]["debate_status"] = i18n[lang].unlimited;

                if (
                    opinions[i]["type"] === "agenda" ||
                    opinions[i]["type"] === "tr_agenda"
                ) {
                    opinions[i]["is_agenda"] = true;

                    /* Debate Status */
                    if (opinions[i]["is_start_set"] === true) {
                        if (opinions[i]["start_at"] > datetime) { /* Scheduled */
                            opinions[i]["class_debate_status"] = "debate-scheduled";
                            opinions[i]["debate_status"] = i18n[lang].scheduled;
                        } else {
                            if (opinions[i]["is_finish_set"] === true) {
                                if (opinions[i]["finish_at"] > datetime) { /* In Progress */
                                    opinions[i]["class_debate_status"] = "debate-in-progress";
                                    opinions[i]["debate_status"] = i18n[lang].in_progress;
                                } else { /* Finished */
                                    opinions[i]["class_debate_status"] = "debate-finished";
                                    opinions[i]["debate_status"] = i18n[lang].finished;
                                }
                            } else { /* Unlimited */
                                opinions[i]["class_debate_status"] = "debate-unlimited";
                                opinions[i]["debate_status"] = i18n[lang].unlimited;
                            }
                        }
                    } else {
                        if (opinions[i]["is_finish_set"] === true) {
                            if (opinions[i]["finish_at"] > datetime) { /* In Progress */
                                opinions[i]["class_debate_status"] = "debate-in-progress";
                                opinions[i]["debate_status"] = i18n[lang].in_progress;
                            } else { /* Finished */
                                opinions[i]["class_debate_status"] = "debate-finished";
                                opinions[i]["debate_status"] = i18n[lang].finished;
                            }
                        } else { /* Unlimited */
                            opinions[i]["class_debate_status"] = "debate-unlimited";
                            opinions[i]["debate_status"] = i18n[lang].unlimited;
                        }
                    }

                    if (opinions[i]["type"] === "agenda") {
                        if (opinions[i]["count_written_opinions"] <= 0) {
                            opinions[i]["show_count_written_opinions"] = false;
                        } else {
                            opinions[i]["show_count_written_opinions"] = true;
                            opinions[i]["count_written_opinions"] = opinions[i]["count_written_opinions"].toLocaleString('en');
                        }

                        if (opinions[i]["count_requested_opinions"] <= 0) {
                            opinions[i]["show_count_requested_opinions"] = false;
                        } else {
                            opinions[i]["show_count_requested_opinions"] = true;
                            opinions[i]["count_requested_opinions"] = opinions[i]["count_requested_opinions"].toLocaleString('en');
                        }
                        opinions[i]["type_text"] = i18n[lang].agenda;
                        opinions[i]["original_translation"] = i18n[lang].original;
                        opinions[i]["link"] = '/agenda/' + opinions[i]["_id"];
                    } else {
                        opinions[i]["show_count_written_opinions"] = false;
                        opinions[i]["show_count_requested_opinions"] = false;
                        opinions[i]["type_text"] = i18n[lang].agenda;
                        opinions[i]["original_translation"] = i18n[lang].translation;
                        opinions[i]["link"] = '/agenda/' + opinions[i]["agenda_id"] + '/tr/' + opinions[i]["_id"];
                    }
                } else {
                    opinions[i]["show_count_written_opinions"] = false;
                    opinions[i]["show_count_requested_opinions"] = false;
                    if (opinions[i]["type"] === "opinion") {
                        opinions[i]["type_text"] = i18n[lang].opinion;
                        opinions[i]["original_translation"] = i18n[lang].original;
                        opinions[i]["link"] = '/agenda/' + opinions[i]["agenda_id"] + '/opinion/' + opinions[i]["_id"];
                    } else if (opinions[i]["type"] === "tr_opinion") {
                        opinions[i]["type_text"] = i18n[lang].opinion;
                        opinions[i]["original_translation"] = i18n[lang].translation;
                        opinions[i]["link"] = '/agenda/' + opinions[i]["agenda_id"] + '/opinion/' + opinions[i]["opinion_id"] + '/tr/' + opinions[i]["_id"];
                    }
                }

                if (opinions[i]["count_comments"] <= 0) {
                    opinions[i]["show_count_comments"] = false;
                } else {
                    opinions[i]["show_count_comments"] = true;
                    opinions[i]["count_comments"] = opinions[i]["count_comments"].toLocaleString('en');
                }

                if (
                    opinions[i]["type"] === "agenda" ||
                    opinions[i]["type"] === "opinion"
                ) {
                    var total_count_written_translations = 0;
                    for (var j = 0; j < opinions[i]["count_written_translations"].length; j++) {
                        if (opinions[i]["count_written_translations"][j].count < 0) {
                            opinions[i]["count_written_translations"][j].count = 0;
                        }
                        total_count_written_translations = total_count_written_translations + opinions[i]["count_written_translations"][j].count;
                    }
                    if (total_count_written_translations === 0) {
                        opinions[i]["show_count_written_translations"] = false;
                    } else {
                        opinions[i]["show_count_written_translations"] = true;
                        opinions[i]["count_written_translations"] = total_count_written_translations.toLocaleString('en');
                    }

                    if (opinions[i]["count_requested_translations"] <= 0) {
                        opinions[i]["show_count_requested_translations"] = false;
                    } else {
                        opinions[i]["show_count_requested_translations"] = true;
                        opinions[i]["count_requested_translations"] = opinions[i]["count_requested_translations"].toLocaleString('en');
                    }
                } else {
                    opinions[i]["show_count_written_translations"] = false;
                    opinions[i]["show_count_requested_translations"] = false;
                }

                opinions[i].i18n_view = i18n[lang].view;
                opinions[i].i18n_awesome = i18n[lang].awesome;
                opinions[i].i18n_comments = i18n[lang].comments;
                opinions[i].i18n_opinion = i18n[lang].opinion;
                opinions[i].i18n_opinion_request = i18n[lang].opinion_request;
                opinions[i].i18n_translation = i18n[lang].translation;
                opinions[i].i18n_translation_request = i18n[lang].translation_request;
                opinions[i].aws_s3_url = config.aws_s3_url;

                opinions[i].i18n_public = i18n[lang].public;
                opinions[i].i18n_invited_users = i18n[lang].invited_users;

                var written_language;
                if (opinions[i].language === "en") {
                    written_language = "english";
                } else if (opinions[i].language === "ja") {
                    written_language = "japanese";
                } else if (opinions[i].language === "ko") {
                    written_language = "korean";
                } else if (opinions[i].language === "zh-Hans") {
                    written_language = "simplified_chinese";
                } else {
                    written_language = "english";
                }
                opinions[i]["i18n_language"] = i18n[lang][written_language];
                opinions[i]["i18n_main_tag"] = i18n[lang][opinions[i]["main_tag"]];
            }
            return opinions;
        },
        main_tag: function () {
            return main_tag === undefined ? "" : main_tag;
        },
        i18n_main_tag: function () {
            return main_tag === undefined ? "" : i18n[lang][main_tag];
        },
        trending_opinion: function () {
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
                return i18n[lang].trending + i18n[lang].opinion;
            } else {
                return i18n[lang].trending + " " + i18n[lang].opinion;
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
        realtime_comments_of_opinion: function () {
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
                return i18n[lang].realtime + i18n[lang].opinion + i18n[lang].comments;
            } else {
                return i18n[lang].realtime + " " + i18n[lang].opinion + " " + i18n[lang].comments;
            }
        },
        realtime_tags_of_opinion: function () {
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
                    return i18n[lang].realtime + i18n[lang].opinion;
                } else {
                    return i18n[lang].realtime + " " + i18n[lang].opinion;
                }
            } else {
                if (
                    lang === "ja" ||
                    lang === "zh-Hans"
                ) {
                    return i18n[lang].realtime + i18n[lang][main_tag] + i18n[lang].opinion;
                } else {
                    return i18n[lang].realtime + " " + i18n[lang][main_tag] + " " + i18n[lang].opinion;
                }
            }
        },
        is_main_tag_selected: function () {
            return main_tag !== undefined;
        }
    });
};