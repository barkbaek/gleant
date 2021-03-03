const config = require('../env.json')[process.env.NODE_ENV || 'development'];
const article_templates = require('../article_templates');
const methods = require('../methods');
const i18n = require('../i18n');

module.exports = function (lang, original_doc, translated_doc, is_loginned, is_voted, template) {
    template.render('vote', {
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
            if (original_doc !== null) {
                if (translated_doc === null) {
                    return methods.get_encoded_html_preventing_xss(original_doc.question);
                } else {
                    return methods.get_encoded_html_preventing_xss(translated_doc.question);
                }
            } else {
                return i18n[lang].the_webpage_you_requested_could_not_be_found;
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
            if (original_doc !== null) {
                var description = "";
                if (translated_doc === null) {
                    for (var i = 0; i < original_doc.choice_list.length; i++) {
                        if (i === 0) {
                            description = methods.get_encoded_html_preventing_xss(original_doc.choice_list[i].choice);
                        } else {
                            description = methods.get_encoded_html_preventing_xss(description + " " + original_doc.choice_list[i].choice);
                        }
                    }
                } else {
                    for (var i = 0; i < translated_doc.choice_list.length; i++) {
                        if (i === 0) {
                            description = methods.get_encoded_html_preventing_xss(translated_doc.choice_list[i].choice);
                        } else {
                            description = methods.get_encoded_html_preventing_xss(description + " " + translated_doc.choice_list[i].choice);
                        }
                    }
                }
                return description;
            } else {
                return i18n[lang].the_webpage_you_requested_could_not_be_found;
            }
        },
        keywords: function () {
            return config["keywords"];
        },
        image: function () {
            return config["image"];
        },
        url: function () {
            if (original_doc === null) {
                return config["url"];
            } else {
                var url = config["url"] + "/get/vote?q=" + original_doc._id;
                if (translated_doc !== null) { /* 추후에 변경하기 */
                    url = url + '&tr=' + translated_doc._id;
                }
                return url;
            }
        },
        alternate_list: function () {
            var list = []
                , url;
            if (original_doc === null) {
                url = config["url"];
                list.push({ url: url, lang: "en" });
                list.push({ url: url.replace('www', 'en'), lang: "en" });
                list.push({ url: url.replace('www', 'ja'), lang: "ja" });
                list.push({ url: url.replace('www', 'ko'), lang: "ko" });
                list.push({ url: url.replace('www', 'zh-hans'), lang: "zh-Hans" });
                return list;
            } else {
                url = config["url"] + "/get/vote?q=" + original_doc._id;
                if (translated_doc !== null) { /* 추후에 변경하기 */
                    url = url + '&tr=' + translated_doc._id;
                }
                list.push({ url: url, lang: "en" });
                list.push({ url: url.replace('www', 'en'), lang: "en" });
                list.push({ url: url.replace('www', 'ja'), lang: "ja" });
                list.push({ url: url.replace('www', 'ko'), lang: "ko" });
                list.push({ url: url.replace('www', 'zh-hans'), lang: "zh-Hans" });
                return list;
            }
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
        vote: function () {
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
            if (original_doc === null) {
                return "<div class='vote'>" + i18n[lang].this_is_a_non_existent_vote + "</div>";
            } else {
                var top = ""
                    , vote_form
                    , question
                    , temp_list = ""
                    , temp_list2 = ""
                    , temp
                    , temp2
                    , temp3
                    , voters_top
                    , percent
                    , vote_counter
                    , choice_list
                    , input
                    , btn_career_wrapper
                    , num_of_voters = 0
                    , best_choice_index_list = [0]
                    , best_choice_count = 0
                    , is_best_choice = false
                    , now = new Date().valueOf();

                /* 번역 본 존재 시, original_doc에 덮어 씌우기 */
                temp = {};
                if (translated_doc !== null) {
                    for (var i = 0; i < translated_doc.choice_list.length; i++) {
                        temp[translated_doc.choice_list[i]._id] = translated_doc.choice_list[i].choice;
                    }
                    original_doc.question = translated_doc.question;
                    for (var i = 0; i < original_doc.choice_list.length; i++) {
                        original_doc.choice_list[i].choice = temp[original_doc.choice_list[i]._id];
                    }
                }

                for (var x = 0; x < original_doc.choice_list.length; x++) {
                    num_of_voters = num_of_voters + original_doc.choice_list[x].count;
                    if (original_doc.choice_list[x].count > best_choice_count) {
                        best_choice_index_list = [];
                        best_choice_index_list.push(x);
                        best_choice_count = original_doc.choice_list[x].count;
                    } else if (original_doc.choice_list[x].count === best_choice_count) {
                        best_choice_index_list.push(x);
                    }
                }

                for (var i = 0; i < original_doc.choice_list.length; i++) {
                    is_best_choice = false;
                    if (is_loginned === false) { /* 비로그인 사용자 */
                        temp = "<div class='choice-index'>" + (i + 1) + "</div>";
                    } else { /* 로그인 사용자 */
                        if (is_voted === false) { /* 투표하지 않은 사용자 */
                            if (now > original_doc.finish_at) { /* 마감시간 지난 경우 */
                                for (var y = 0; y < best_choice_index_list.length; y++) {
                                    if (i === best_choice_index_list[y]) {
                                        is_best_choice = true;
                                    }
                                }
                                if (is_best_choice === true) {
                                    temp = "<div class='choice-index best-choice'>" + (i + 1) + "</div>";
                                } else {
                                    temp = "<div class='choice-index'>" + (i + 1) + "</div>";
                                }
                            } else { /* 마감시간 지나지 않은 경우 */
                                temp = "<div class='choice-index'>" + (i + 1) + "</div>";
                            }
                        } else { /* 투표한 사용자 */
                            for (var y = 0; y < best_choice_index_list.length; y++) {
                                if (i === best_choice_index_list[y]) {
                                    is_best_choice = true;
                                }
                            }
                            if (is_best_choice === true) {
                                temp = "<div class='choice-index best-choice'>" + (i + 1) + "</div>";
                            } else {
                                temp = "<div class='choice-index'>" + (i + 1) + "</div>";
                            }
                        }
                    }
                    temp = "<div class='choice-index-wrapper'>" + temp + "</div>";
                    temp2 = "<div style=width:100%;>" + methods.get_encoded_html_preventing_xss(original_doc.choice_list[i].choice) + "</div>";

                    if (is_loginned === false) { /* 비로그인 사용자 */
                        temp2 = "<div class='choice'>" + temp2 + "</div>";
                        input = "<input data-id='" + original_doc.choice_list[i]['_id'] + "' class='choice-radio' type='radio' name='iframe-vote-radio-" + original_doc._id + "' disabled='disabled'>";
                        temp3 = "<div class='choice-radio-wrapper'>" + input + "</div>";
                        temp = "<label>" + temp + temp2 + temp3 + "</label>";
                    } else { /* 로그인 사용자 */
                        if (is_voted === false) { /* 투표하지 않은 사용자 */
                            if (now > original_doc.finish_at) { /* 마감시간 지난 경우 */
                                if (num_of_voters === 0) {
                                    percent = 0;
                                } else {
                                    percent = ((original_doc.choice_list[i].count / num_of_voters) * 100);
                                }
                                if (percent % 1 == 0) {
                                    percent = percent + "%";
                                } else {
                                    percent = percent.toFixed(1) + "%";
                                }
                                if (is_best_choice === true) {
                                    temp2 = "<div class='choice best-choice'>" + temp2 + "</div>";
                                    temp3 = "<div class='choice-statistics best-choice'>" + percent + "</div>";
                                } else {
                                    temp2 = "<div class='choice'>" + temp2 + "</div>";
                                    temp3 = "<div class='choice-statistics'>" + percent + "</div>";
                                }
                                temp = "<div class='result'>" + temp + temp2 + temp3 + "</div>";
                            } else { /* 마감시간 지나지 않은 경우 */
                                temp2 = "<div class='choice'>" + temp2 + "</div>";
                                input = "<input data-id='" + original_doc.choice_list[i]['_id'] + "' class='choice-radio' type='radio' name='iframe-vote-radio-" + original_doc._id + "'>";
                                temp3 = "<div class='choice-radio-wrapper'>" + input + "</div>";
                                temp = "<label>" + temp + temp2 + temp3 + "</label>";
                            }
                        } else { /* 투표한 사용자 */
                            if (num_of_voters === 0) {
                                percent = 0;
                            } else {
                                percent = ((original_doc.choice_list[i].count / num_of_voters) * 100);
                            }
                            if (percent % 1 == 0) {
                                percent = percent + "%";
                            } else {
                                percent = percent.toFixed(1) + "%";
                            }
                            if (is_best_choice === true) {
                                temp2 = "<div class='choice best-choice'>" + temp2 + "</div>";
                                temp3 = "<div class='choice-statistics best-choice'>" + percent + "</div>";
                            } else {
                                temp2 = "<div class='choice'>" + temp2 + "</div>";
                                temp3 = "<div class='choice-statistics'>" + percent + "</div>";
                            }
                            temp = "<div class='result'>" + temp + temp2 + temp3 + "</div>";
                        }
                    }
                    temp = "<div class='choice-item'>" + temp + "</div>";
                    temp_list = temp_list + temp;
                }

                vote_counter = "<div class='vote-counter' data-service-type='" + original_doc.service_type + "' data-type='" + original_doc.type + "' data-is-start-set='" + original_doc.is_start_set + "' data-start-at='" + original_doc.start_at + "' data-is-finish-set='" + original_doc.is_finish_set + "' data-finish-at='" + original_doc.finish_at + "'>" + "</div>";

                choice_list = "<div class='choice-list'>" + temp_list + "</div>";
                if (is_voted === false) { /* 투표하지 않은 사용자 */
                    if (is_loginned === false) { /* 비로그인 사용자 */
                        top = "<div class='vote-top alert'>" + i18n[lang].please_login + "</div>";
                        input = "<input class='btn-career btn-vote-submit' type='button' value='" + i18n[lang].vote + "' disabled='disabled'>";
                        btn_career_wrapper = "<div class='btn-career-wrapper'>" + input + "</div>";
                    } else { /* 로그인 사용자 */
                        if (now > original_doc.finish_at) { /* 마감시간 지난 경우 */
                            if (original_doc.is_secret === true) {
                                top = "<div class='vote-top num-of-voters'>" + i18n[lang].voters + " " + methods.put_comma_between_three_digits(num_of_voters) + "</div>";
                            } else {
                                top = "<div class='vote-top num-of-voters autonym'>" + i18n[lang].voters + " " + methods.put_comma_between_three_digits(num_of_voters) + "</div>";
                            }
                            btn_career_wrapper = "";
                        } else { /* 마감시간 지나지 않은 경우 */
                            input = "<input class='btn-career btn-vote-submit' type='button' value='" + i18n[lang].vote + "' data-id='" + original_doc._id + "' onclick='do_iframe_vote(this);' data-name='iframe-vote-radio-" + original_doc._id + "'>";
                            btn_career_wrapper = "<div class='btn-career-wrapper'>" + input + "</div>";
                        }
                    }
                } else { /* 투표한 사용자 */
                    if (original_doc.is_secret === true) {
                        top = "<div class='vote-top num-of-voters'>" + i18n[lang].voters + " " + methods.put_comma_between_three_digits(num_of_voters) + "</div>";
                    } else {
                        top = "<div class='vote-top num-of-voters autonym'>" + i18n[lang].voters + " " + methods.put_comma_between_three_digits(num_of_voters) + "</div>";
                    }
                    btn_career_wrapper = "";
                }
                question = "<div class='question'>" + methods.get_encoded_html_preventing_xss(original_doc.question) + "</div>";
                vote_form = "<div class='vote-form'>" + question + choice_list + btn_career_wrapper +  "</div>";

                var voters_prompt = ""
                    , close
                    , title_text;
                if (original_doc.is_secret === false) { /* 실명투표 */
                    if (is_loginned === true) { /* 로그인 사용자 */
                        if (is_voted === true || now > original_doc.finish_at) { /* 투표한 사용자이거나 마감지난 투표일 경우 */
                            close = "<div class='close'><img src='" + config.aws_s3_url + "/icons/delete-white.png" + config["css_version"] + "'></div>";
                            voters_top = "<div class='voters-top'>" + i18n[lang].vote_current_situation + " - " + i18n[lang].voters + " " + methods.put_comma_between_three_digits(num_of_voters) + "</div>";
                            temp_list = "";
                            for (var x = 0; x < original_doc.choice_list.length; x++) {
                                temp = "<div class='choice-index'>" + (x + 1) + "</div>";
                                temp = "<div class='choice-index-wrapper'>" + temp + " " + i18n[lang].voters + " " + methods.put_comma_between_three_digits(original_doc.choice_list[x].voters.length) + "</div>";
                                temp_list = temp_list + temp;
                                temp_list2 = "";
                                if (original_doc.choice_list[x].voters.length !== 0) {
                                    for (var y = 0; y < original_doc.choice_list[x].voters.length; y++) {
                                        temp = "<a class='voter' href='/blog/" + original_doc.choice_list[x].voters[y] + "' target='_blank'>@" + original_doc.choice_list[x].voters[y] + "</a>";
                                        if (y !== (original_doc.choice_list[x].voters.length -1)) {
                                            temp = temp + ', ';
                                        }
                                        temp_list2 = temp_list2 + temp;
                                    }
                                    temp_list2 = "<div class='voters'>" + temp_list2 + "</div>";
                                }
                                temp_list = temp_list + temp_list2;
                            }
                            temp2 = "<div class='voters-list'>" + temp_list + "</div>";
                            voters_prompt = "<div class='voters-prompt'>" + close + voters_top + temp2 + "</div>";
                        }
                        title_text = i18n[lang].real_name_vote;
                    } else { /* 비로그인 사용자 */
                        title_text = i18n[lang].real_name_vote;
                    }
                } else { /* 익명투표 */
                    title_text = i18n[lang].anonymous_vote;
                }
                var title = "<div class='title'><img class='emoticon-big-img' src='" + config.aws_s3_url + "/icons/vote.png" + config["css_version"] + "'><span>" + title_text + "</span></div>";
                return "<div class='vote'>" + title + voters_prompt + top + vote_counter + vote_form + "</div>";
            }
        }
    });
};