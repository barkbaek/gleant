const config = require('./env.json')[process.env.NODE_ENV || 'development'];
const methods = require('./methods');
const monetary_units = require('./fixed_information').monetary_units();
const i18n = require('./i18n');
const limit = require('./limit').get_all();
module.exports = {
    get_crawled_link_item: function (data) {
        var item, a, b, c, d, e1, f, g, h, i, j;
        // a = "<img class='scraped-left' src='" + data.img + "'>";
        // b = "<span class='scraped-title'>" + methods.get_encoded_html_preventing_xss(data.title) + "</span>";
        // c = "<span class='scraped-description'>" + methods.get_encoded_html_preventing_xss(data.description) + "</span>";
        // d = "<span class='scraped-site'>" + methods.get_encoded_html_preventing_xss(data.site) + "</span>";
        // e1 = "<div class='scraped-right-inner'>" + b + c + d + "</div>";
        // f = "<div class='scraped-right text-overflow-ellipsis'>" + e1 + "</div>";
        // g = "<div class='scraped-bottom text-overflow-ellipsis'>" + data.link + "</div>";
        // h = "<div class='link-scraped'>" + a + f + g + "</div>";
        // i = "<div class='link-scraped-wrapper'>" + h + "</div>";
        // j = "<a href='" + data.link +"' target='_blank'>" + i + "</a>";
        // item = "<div class='link-item'>" + j + "</div>";
        if (data.title === "") {
            b = "<span class='scraped-title'>" + methods.get_encoded_html_preventing_xss(data.link) + "</span>";
            console.log(methods.get_encoded_html_preventing_xss(data.link));
        } else {
            b = "<span class='scraped-title'>" + methods.get_encoded_html_preventing_xss(data.title) + "</span>";
            console.log(methods.get_encoded_html_preventing_xss(data.title));
        }
        if (data.site === "") {
            d = "";
        } else {
            d = "<span class='scraped-site'>" + methods.get_encoded_html_preventing_xss(data.site) + "</span>";
        }
        e1 = "<div class='scraped-top-inner'>" + b + d + "</div>";
        f = "<div class='scraped-top text-overflow-ellipsis'>" + e1 + "</div>";

        g = "<div class='scraped-bottom text-overflow-ellipsis'>" + data.link + "</div>";
        h = "<div class='link-scraped'>" + f + g + "</div>";
        i = "<div class='link-scraped-wrapper'>" + h + "</div>";
        j = "<a href='" + data.link +"' target='_blank'>" + i + "</a>";
        item = "<div class='link-item'>" + j + "</div>";
        return item;
    },
    get_single_flexible_image: function (lang, doc, path) {
        var temp = doc["img"].split('.');
        temp = temp[temp.length-2].split('-');
        var width = temp[temp.length-2]
            , height = temp[temp.length-1]
            , public_authority
            , img1
            , div1
            , div2
            , div3
            , a1;
        if (doc['public_authority'] === 0) {
            public_authority = i18n[lang].only_me;
        } else if (doc['public_authority'] === 1) {
            public_authority = i18n[lang].public;
        } else if (doc['public_authority'] === 2) {
            public_authority = i18n[lang].friends;
        }
        if (path === 'blog') {
            if (doc['title'] === "") {
                div2 = "<div class='blog-image-item-title no-resized' style='display:none;z-index:0;'></div>";
            } else {
                div2 = "<div class='blog-image-item-title no-resized'>" + methods.get_encoded_html_preventing_xss(doc['title']) + "</div>";
            }
            img1 = "<img class='blog-image-item-img no-resized' src='" + doc["img"] + "' data-img='" + doc["img"] + "' data-width='" + width + "' data-height='" + height + "'>";
            a1 = "<a href='/blog/" + doc['blog_id'] + "/gallery/" + doc['_id'] + "'>" + div2 + img1 + "</a>";
            div1 = "<div class='blog-image-item'>" + a1 + "</div>";
        } else if (path === 'search') {}
        return div1;
    },
    get_single_normal_employment: function (lang, is_loginned, doc) {
        var css_version = config["css_version"]
            , written_language
            , name
            , simple_profile_mouseentered_prompt
            , simple_profile_prompt_box
            , article_item_top
            , article_item_updated_at
            , thumbnail
            , temp
            , temp2
            , written_online_interview_status = ""
            , class_online_interview_status = "online-interview-unlimited"
            , online_interview_status = i18n[lang].unlimited
            , datetime = new Date().valueOf();
        if (doc.language === "en") {
            written_language = "english";
        } else if (doc.language === "ja") {
            written_language = "japanese";
        } else if (doc.language === "ko") {
            written_language = "korean";
        } else if (doc.language === "zh-Hans") {
            written_language = "simplified_chinese";
        } else {
            written_language = "english";
        }
        if (doc['type'] === 'apply_now') {
            name = "<a href='/blog/" + doc["blog_id"] + "'>" + methods.get_encoded_html_preventing_xss(doc["company"]) + "</a>";
            simple_profile_prompt_box = "<div>" + name + "</div>";
        } else if (doc['type'] === 'hire_me') {
            if (is_loginned === false) {
                return "";
            }
            name = "<a href='/blog/" + doc["blog_id"] + "'>" + methods.get_encoded_html_preventing_xss(doc["name"]) + "</a>";
            simple_profile_mouseentered_prompt = "<div class='simple-profile-mouseentered-prompt'></div>";
            simple_profile_prompt_box = "<div class='simple-profile-prompt-box in-body' data-link='/blog/" + doc["blog_id"] + "'>" + name + simple_profile_mouseentered_prompt + "</div>";
        } else {
            return "";
        }
        if (doc['type'] === 'apply_now') {
            if (doc['is_online_interview_set'] === true) {
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
            } else {
                written_online_interview_status = "";
            }
        } else if (doc['type'] === 'hire_me') {
            written_online_interview_status = "";
        } else {
            return "";
        }
        if (doc['type'] === 'apply_now') {
            temp = "";
            temp2 = "";
            if (doc['country'] !== "") {
                temp = methods.get_encoded_html_preventing_xss(doc['country']);
            }
            if (doc['city'] !== "") {
                if (temp === "") {
                    temp = temp + methods.get_encoded_html_preventing_xss(doc['city']);
                } else {
                    temp = temp + " &#183; " + methods.get_encoded_html_preventing_xss(doc['city']);
                }
            }
            if (temp !== "") {
                temp2 = "<span>" + temp + "</span>" + "<br>";
            }
            temp2 = temp2 + "<span>" + methods.get_encoded_html_preventing_xss(doc['job']) + "</span><br>";
            thumbnail = "<img src='" + doc["logo"].replace('/resized/', '/square/') + "'>";
        } else if (doc['type'] === 'hire_me') {
            temp2 = "<span>" + methods.get_encoded_html_preventing_xss(doc['job']) + "</span><br>";
            thumbnail = "<img src='" + doc["img"].replace('/resized/', '/square/') + "'>";
        }
        article_item_top = "<div class='article-item-top'>" + written_online_interview_status + temp2 + simple_profile_prompt_box + "</div>";
        if (doc["created_at"] === doc["updated_at"]) {
            article_item_updated_at = "<div class='article-item-updated-at created-at-small' data-datetime='" + doc["updated_at"] + "'></div>";
        } else {
            article_item_updated_at = "<div class='article-item-updated-at updated-at-small' data-datetime='" + doc["updated_at"] + "'></div>";
        }
        var thumbnail_link
            , article_item_middle;
        if (doc['type'] === 'apply_now') {
            thumbnail_link = "<a href='/apply-now/" + doc["_id"] + "'>" + thumbnail + "</a>";
        } else if (doc['type'] === 'hire_me') {
            thumbnail_link = "<a href='/hire-me/" + doc["_id"] + "'>" + thumbnail + "</a>";
        }
        article_item_middle = "<div class='article-item-middle'>" + thumbnail_link + "</div>";
        var count_img
            , count_num
            , view_counts = ""
            , youtube_inserted = "";
        if (doc.is_youtube_inserted === true) {
            youtube_inserted = "<div class='youtube-inserted'><img src='" + config.aws_s3_url + "/icons/youtube.png" + css_version + "' title='YouTube' alt='YouTube'></div>";
        }
        if (doc["count_view"] > 0) {
            count_img = "<img src='" + config.aws_s3_url + "/icons/view-selected.png" + css_version + "' title='" + i18n[lang].view + "' alt='" + i18n[lang].view + "'>";
            count_num = "<span>" + methods.put_comma_between_three_digits(doc["count_view"]) + "</span>";
            view_counts = "<div class='view-counts' data-count='" + doc["count_view"] + "'>" + count_img + count_num + "</div>";
        }
        var awesome_counts = "";
        if (doc["count_awesome"] > 0) {
            count_img = "<img src='" + config.aws_s3_url + "/icons/awesome-selected.png" + css_version + "' title='" + i18n[lang].awesome + "' alt='" + i18n[lang].awesome + "'>";
            count_num = "<span>" + methods.put_comma_between_three_digits(doc["count_awesome"]) + "</span>";
            awesome_counts = "<div class='awesome-counts' data-count='" + doc["count_awesome"] + "'>" + count_img + count_num + "</div>";
        }
        var comments_counts = "";
        if (doc["count_comments"] > 0) {
            count_img = "<img src='" + config.aws_s3_url + "/icons/comments-green.png" + css_version + "' title='" + i18n[lang].comments + "' alt='" + i18n[lang].comments + "'>";
            count_num = "<span>" + methods.put_comma_between_three_digits(doc["count_comments"]) + "</span>";
            comments_counts = "<div class='comments-counts' data-count='" + doc["count_comments"] + "'>" + count_img + count_num + "</div>";
        }
        var article_item_counts_wrapper = "<div class='article-item-counts-wrapper'>" + youtube_inserted + view_counts + awesome_counts + comments_counts + "</div>";
        var article_item_bottom = "<div class='article-item-bottom'>" + methods.get_encoded_html_preventing_xss(doc["title"]) + "</div>",
            article_data_link;
        if (doc['type'] === 'apply_now') {
            article_data_link = "/apply-now/" + doc['_id'];
        } else if (doc['type'] === 'hire_me') {
            article_data_link = "/hire-me/" + doc['_id'];
        }
        var article_item_inner = "<div class='article-item-inner' data-link='" + article_data_link +
            "' data-type='" + doc["type"] +
            "' data-updated-at='" + doc["updated_at"] + "'>" +
            article_item_top + article_item_updated_at + article_item_middle + article_item_counts_wrapper + article_item_bottom + "</div>";
        var article_class = doc['type'] + "-" + doc['_id'];
        return "<div class='article-item " + article_class + " " + doc["type"] + "-item' data-print-type='normal'>" + article_item_inner + "</div>";
    },
    get_single_normal_article: function (lang, is_loginned, doc, path) {
        var css_version = config["css_version"]
            , written_language
            , main_tag
            , name
            , simple_profile_mouseentered_prompt
            , simple_profile_prompt_box
            , article_item_top
            , article_item_updated_at
            , thumbnail
            , temp
            , temp2
            , written_debate_status = ""
            , class_debate_status = "debate-unlimited"
            , debate_status = i18n[lang].unlimited
            , datetime = new Date().valueOf();
        if (
            doc['type'] === 'agenda' ||
            doc['type'] === 'opinion' ||
            doc['type'] === 'tr_agenda' ||
            doc['type'] === 'tr_opinion'
        ) {
            if (is_loginned === false) {
                doc.name = "Gleant";
                if (doc.img.indexOf( "male.png") <= -1) {
                    doc.img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                }
            }
            if (doc.language === "en") {
                written_language = "english";
            } else if (doc.language === "ja") {
                written_language = "japanese";
            } else if (doc.language === "ko") {
                written_language = "korean";
            } else if (doc.language === "zh-Hans") {
                written_language = "simplified_chinese";
            } else {
                written_language = "english";
            }
            main_tag = "<a href='/debate?mt=" + doc['main_tag'] + "'>" + i18n[lang][doc['main_tag']] + "</a>";
            if (is_loginned === true) {
                name = "<a href='/blog/" + doc["blog_id"] + "'>" + methods.get_encoded_html_preventing_xss(doc["name"]) + "</a>";
            } else {
                name = "<a class='not-logged-in' href='/blog/" + doc["blog_id"] + "'>" + methods.get_encoded_html_preventing_xss(doc["name"]) + "</a>";
            }
            simple_profile_mouseentered_prompt = "<div class='simple-profile-mouseentered-prompt'></div>";
            simple_profile_prompt_box = "<div class='simple-profile-prompt-box in-body' data-link='/blog/" + doc["blog_id"] + "'>" + name + simple_profile_mouseentered_prompt + "</div>";
            if (
                doc['type'] === 'agenda' ||
                doc['type'] === 'tr_agenda'
            ) {
                if (doc['type'] === 'agenda') {
                    temp = i18n[lang].original;
                } else {
                    temp = i18n[lang].translation;
                }
                if (doc['is_start_set'] === true) {
                    if (doc['start_at'] > datetime) { /* Scheduled */
                        class_debate_status = "debate-scheduled";
                        debate_status = i18n[lang].scheduled;
                    } else {
                        if (doc['is_finish_set'] === true) {
                            if (doc['finish_at'] > datetime) { /* In Progress */
                                class_debate_status = "debate-in-progress";
                                debate_status = i18n[lang].in_progress;
                            } else { /* Finished */
                                class_debate_status = "debate-finished";
                                debate_status = i18n[lang].finished;
                            }
                        } else { /* Unlimited */
                            class_debate_status = "debate-unlimited";
                            debate_status = i18n[lang].unlimited;
                        }
                    }
                } else {
                    if (doc['is_finish_set'] === true) {
                        if (doc['finish_at'] > datetime) { /* In Progress */
                            class_debate_status = "debate-in-progress";
                            debate_status = i18n[lang].in_progress;
                        } else { /* Finished */
                            class_debate_status = "debate-finished";
                            debate_status = i18n[lang].finished;
                        }
                    } else { /* Unlimited */
                        class_debate_status = "debate-unlimited";
                        debate_status = i18n[lang].unlimited;
                    }
                }
                written_debate_status = "";/*"<div class='debate-status " + class_debate_status + "' data-is-start-set='" + doc['is_start_set'] + "' data-start-at='" + doc['start_at'] + "' data-is-finish-set='" + doc['is_finish_set'] + "' data-finish-at='" + doc['finish_at'] + "' data-print-type='normal'>" + debate_status + "</div>";*/
                if (path === 'blog' && doc['public_authority'] === 2) {
                    written_debate_status = written_debate_status + "<div>" + i18n[lang].invited_users + "</div>";
                }
                if (is_loginned === true) {
                    article_item_top = "<div class='article-item-top'>" + written_debate_status + simple_profile_prompt_box + "</div>";
                } else {
                    article_item_top = "<div class='article-item-top'>" + written_debate_status + "</div>";
                }
            } else {
                if (doc['type'] === 'opinion') {
                    temp = i18n[lang].original;
                } else {
                    temp = i18n[lang].translation;
                }
                if (path === 'blog' && doc['public_authority'] === 2) {
                    written_debate_status = "<div>" + i18n[lang].invited_users + "</div>";
                } else {
                    written_debate_status = "";
                }
                if (is_loginned === true) {
                    article_item_top = "<div class='article-item-top'>" + written_debate_status + simple_profile_prompt_box + "</div>";
                } else {
                    article_item_top = "<div class='article-item-top'>" + written_debate_status + "</div>";
                }
            }
        } else {
            if (is_loginned === false) {
                doc.blog_name = "Gleant";
                if (doc.type === "blog") {
                    if (doc.img.indexOf( "male.png") <= -1) {
                        doc.img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                    }
                }
            }
            if (doc.language === undefined || doc.language === "") {
                written_language = "";
            } else if (doc.language === "en") {
                written_language = "english";
            } else if (doc.language === "ja") {
                written_language = "japanese";
            } else if (doc.language === "ko") {
                written_language = "korean";
            } else if (doc.language === "zh-Hans") {
                written_language = "simplified_chinese";
            } else {
                written_language = "english";
            }
            if (written_language === "") {
                temp = "";
            } else {
                temp = i18n[lang][written_language];
            }
            if (temp !== "") {
                temp = " &#183; " + temp;
            }
            if (doc['public_authority'] === 0) {
                temp = i18n[lang].only_me;
            } else if (doc['public_authority'] === 1) {
                temp = "";
            } else if (doc['public_authority'] === 2) {
                temp = i18n[lang].friends;
            }
            if (path === 'blog') {
                if (doc["type"] === "gallery" && doc["is_profile"] === true) {
                    if (temp === "") {
                        temp2 = i18n[lang].profile_photo;
                    } else {
                        temp2 = " &#183; " + i18n[lang].profile_photo;
                    }
                } else {
                    temp2 = "";
                }
                article_item_top = "<div class='article-item-top'>" + temp + temp2 + "</div>";
            } else {
                if (temp !== "") {
                    temp = temp + "<br>";
                }
                if (is_loginned === true) {
                    article_item_top = "<div class='article-item-top'>" + methods.get_encoded_html_preventing_xss(doc['blog_name']) + "</div>";
                } else {
                    article_item_top = "<div class='article-item-top'>" + "</div>";
                }
            }
        }
        if (doc["created_at"] === doc["updated_at"]) {
            article_item_updated_at = "<div class='article-item-updated-at created-at-small' data-datetime='" + doc["updated_at"] + "'></div>";
        } else {
            article_item_updated_at = "<div class='article-item-updated-at updated-at-small' data-datetime='" + doc["updated_at"] + "'></div>";
        }
        if (doc["type"] === "gallery") {
            thumbnail = "<img src='" + doc["img"].replace('/resized/', '/square/') + "'>";
        } else {
            if (doc["img_list"].length !== 0) {
                thumbnail = "<img src='" + doc["img_list"][0].replace('/resized/', '/square/') + "'>";
            } else {
                thumbnail = "<img src='" + doc["img"].replace('/resized/', '/square/') + "'>";
            }
        }
        var thumbnail_link
            , article_item_middle;
        if (doc['type'] === 'agenda') {
            thumbnail_link = "<a href='/agenda/" + doc["_id"] + "'>" + thumbnail + "</a>";
        } else if (doc['type'] === 'opinion') {
            thumbnail_link = "<a href='/agenda/" + doc["agenda_id"] + "/opinion/" + doc["_id"] + "'>" + thumbnail + "</a>";
        } else if (doc['type'] === 'tr_agenda') {
            thumbnail_link = "<a href='/agenda/" + doc["agenda_id"] + "/tr/" + doc["_id"] + "'>" + thumbnail + "</a>";
        } else if (doc['type'] === 'tr_opinion') {
            thumbnail_link = "<a href='/agenda/" + doc["agenda_id"] + "/opinion/" + doc["opinion_id"] + "/tr/" + doc["_id"] + "'>" + thumbnail + "</a>";
        } else if (doc['type'] === 'blog') {
            thumbnail_link = "<a href='/blog/" + doc["blog_id"] + "/" + doc["blog_menu_id"] + "/" + doc["_id"] + "'>" + thumbnail + "</a>";
        } else if (doc['type'] === 'gallery') {
            thumbnail_link = "<a href='/blog/" + doc["blog_id"] + "/gallery/" + doc["_id"] + "'>" + thumbnail + "</a>";
        }
        article_item_middle = "<div class='article-item-middle'>" + thumbnail_link + "</div>";
        var count_img
            , count_num
            , view_counts = ""
            , youtube_inserted = "";
        if (doc.type !== "gallery") {
            if (doc.is_youtube_inserted === true) {
                youtube_inserted = "<div class='youtube-inserted'><img src='" + config.aws_s3_url + "/icons/youtube.png" + css_version + "' title='YouTube' alt='YouTube'></div>";
            }
        }
        if (doc["count_view"] > 0) {
            count_img = "<img src='" + config.aws_s3_url + "/icons/view-selected.png" + css_version + "' title='" + i18n[lang].view + "' alt='" + i18n[lang].view + "'>";
            count_num = "<span>" + methods.put_comma_between_three_digits(doc["count_view"]) + "</span>";
            view_counts = "<div class='view-counts' data-count='" + doc["count_view"] + "'>" + count_img + count_num + "</div>";
        }
        var awesome_counts = "";
        if (doc["count_awesome"] > 0) {
            count_img = "<img src='" + config.aws_s3_url + "/icons/awesome-selected.png" + css_version + "' title='" + i18n[lang].awesome + "' alt='" + i18n[lang].awesome + "'>";
            count_num = "<span>" + methods.put_comma_between_three_digits(doc["count_awesome"]) + "</span>";
            awesome_counts = "<div class='awesome-counts' data-count='" + doc["count_awesome"] + "'>" + count_img + count_num + "</div>";
        }
        var comments_counts = "";
        if (doc["count_comments"] > 0) {
            count_img = "<img src='" + config.aws_s3_url + "/icons/comments-green.png" + css_version + "' title='" + i18n[lang].comments + "' alt='" + i18n[lang].comments + "'>";
            count_num = "<span>" + methods.put_comma_between_three_digits(doc["count_comments"]) + "</span>";
            comments_counts = "<div class='comments-counts' data-count='" + doc["count_comments"] + "'>" + count_img + count_num + "</div>";
        }
        var written_opinion_counts = ""
            , requested_opinion_counts = "";
        if (doc["type"] === "agenda") {
            if (doc["count_written_opinions"] > 0) {
                count_img = "<img src='" + config.aws_s3_url + "/icons/write-opinion-selected.png" + css_version + "' title='" + i18n[lang].opinion + "' alt='" + i18n[lang].opinion + "'>";
                count_num = "<span>" + methods.put_comma_between_three_digits(doc["count_written_opinions"]) + "</span>";
                written_opinion_counts = "<div class='written-opinion-counts' data-count='" + doc["count_written_opinions"] + "'>" + count_img + count_num + "</div>";
            }
            if (doc["count_requested_opinions"] > 0) {
                count_img = "<img src='" + config.aws_s3_url + "/icons/request-opinion-selected.png" + css_version + "' title='" + i18n[lang].opinion_request + "' alt='" + i18n[lang].opinion_request + "'>";
                count_num = "<span>" + methods.put_comma_between_three_digits(doc["count_requested_opinions"]) + "</span>";
                requested_opinion_counts = "<div class='requested-opinion-counts' data-count='" + doc["count_requested_opinions"] + "'>" + count_img + count_num + "</div>";
            }
        }
        var written_translation_counts = ""
            , total_count_written_translations = 0
            , requested_translation_counts = "";
        if (
            doc["type"] === "agenda" || doc["type"] === "opinion"
        ) {
            /*for (var j = 0; j < doc["count_written_translations"].length; j++) {
                if (doc["count_written_translations"][j].count < 0) {
                    doc["count_written_translations"][j].count = 0;
                }
                total_count_written_translations = total_count_written_translations + doc["count_written_translations"][j].count;
            }
            if (total_count_written_translations > 0) {
                count_img = "<img src='" + config.aws_s3_url + "/icons/write-translation-selected.png" + css_version + "' title='" + i18n[lang].translation + "' alt='" + i18n[lang].translation + "'>";
                count_num = "<span>" + methods.put_comma_between_three_digits(total_count_written_translations) + "</span>";
                written_translation_counts = "<div class='written-translation-counts' data-count='" + total_count_written_translations + "'>" + count_img + count_num + "</div>";
            }
            if (doc["count_requested_translations"] > 0) {
                count_img = "<img src='" + config.aws_s3_url + "/icons/request-translation-selected.png" + css_version + "' title='" + i18n[lang].translation_request + "' alt='" + i18n[lang].translation_request + "'>";
                count_num = "<span>" + methods.put_comma_between_three_digits(doc["count_requested_translations"]) + "</span>";
                requested_translation_counts = "<div class='requested-translation-counts' data-count='" + doc["count_requested_translations"] + "'>" + count_img + count_num + "</div>";
            }*/
            written_translation_counts = "";
            requested_translation_counts = "";
        }
        var article_item_counts_wrapper = "<div class='article-item-counts-wrapper'>" +
            youtube_inserted + view_counts + awesome_counts + written_opinion_counts + requested_opinion_counts + written_translation_counts + requested_translation_counts + comments_counts + "</div>";
        var article_item_bottom = "<div class='article-item-bottom'>" + methods.get_encoded_html_preventing_xss(doc["title"]) + "</div>",
            article_data_link;
        if (doc['type'] === 'agenda') {
            article_data_link = "/agenda/" + doc['_id'];
        } else if (doc['type'] === 'opinion') {
            article_data_link = "/agenda/" + doc['agenda_id'] + "/opinion/" + doc['_id'];
        } else if (doc['type'] === 'tr_agenda') {
            article_data_link = "/agenda/" + doc['agenda_id'] + "/tr/" + doc['_id'];
        } else if (doc['type'] === 'tr_opinion') {
            article_data_link = "/agenda/" + doc['agenda_id'] + "/opinion/" + doc['opinion_id'] + "/tr/" + doc['_id'];
        } else if (doc['type'] === 'blog') {
            article_data_link = "/blog/" + doc['blog_id'] + "/" + doc['blog_menu_id'] + "/" + doc['_id'];
        } else if (doc['type'] === 'gallery') {
            article_data_link = "/blog/" + doc['blog_id'] + "/gallery/" +  doc['_id'];
        }
        var article_item_inner = "<div class='article-item-inner' data-link='" + article_data_link +
            "' data-type='" + doc["type"] +
            "' data-updated-at='" + doc["updated_at"] + "'>" +
            article_item_top + article_item_updated_at + article_item_middle + article_item_counts_wrapper + article_item_bottom + "</div>";
        var article_class = doc['type'] + "-" + doc['_id'];
        return "<div class='article-item " + article_class + " " + doc["type"] + "-item' data-print-type='normal'>" + article_item_inner + "</div>";
    },
    get_single_guestbook_comment: function (lang, is_loginned, current_user_blog_id, guestbook_id, blog_owner_blog_id, doc) {
        var element
            , div1
            , div2
            , div3
            , div4
            , div5
            , div6
            , div7
            , div8
            , a1
            , a2
            , updated_at_wrapper
            , span1
            , comment_input
            , comment_input_btns_wrapper
            , comment_input_wrapper = ""
            , comment_remove = ""
            , comment_edit = "";
        if (lang === undefined) {
            lang = "en";
        }
        if (is_loginned === true) {
            if (current_user_blog_id === doc.blog_id) {
                comment_input = "<textarea class='edit-guestbook-comment-input'></textarea>";
                comment_input = "<div class='edit-guestbook-comment-middle'>" + comment_input + "</div>";
                comment_input_btns_wrapper = "<div class='edit-guestbook-comment-form-btns-wrapper'><input class='btn-career edit-guestbook-comment-cancel' type='button' value='" + i18n[lang].cancel + "'><input class='btn-career edit-guestbook-comment-submit' type='submit' value='" + i18n[lang].check + "'></div>";
                comment_input_wrapper = "<form class='edit-guestbook-comment-form'>" + comment_input + comment_input_btns_wrapper + "</form>";
            }
        } else {
            doc['name'] = 'Gleant';
            if (doc.img.indexOf( "male.png") <= -1) {
                doc.img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
            }
        }
        div2 = "<div class='guestbook-comment-content'>" + methods.get_encoded_html_preventing_xss(doc["comment"]) + "</div>";
        div8 = "<div class='created-at-small without-text' data-datetime='" + doc["created_at"] + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + div8 + "</div>";
        if (is_loginned === true) {
            span1 = "<span class='user-name'>" + methods.get_encoded_html_preventing_xss(doc["name"]) + "</span>";
        } else {
            span1 = "<span class='user-name not-logged-in'>" + methods.get_encoded_html_preventing_xss(doc["name"]) + "</span>";
        }
        a2 = "<a class='user-name-wrapper' href='/blog/" + doc["blog_id"] + "' target='_blank'>" + span1 + "</a>";
        div7 = "<div>" + a2 + "</div>";
        div6 = "<div class='user-profile-right-small'>" + div7 + updated_at_wrapper + "</div>";
        img1 = "<img src='" + doc["img"] + "' alt='" + methods.get_encoded_html_preventing_xss(doc["name"]) +
            "' title='" + methods.get_encoded_html_preventing_xss(doc["name"]) + "'>";
        a1 = "<a href='/blog/" + doc["blog_id"] + "' target='_blank'>" + img1 + "</a>";
        div5 = "<div class='user-profile-left-small'>" + a1 +  "</div>";
        div1 = "<div class='user-profile-small'>" + div5 + div6 +"</div>";
        if (is_loginned === true) {
            if (current_user_blog_id !== null && current_user_blog_id === blog_owner_blog_id) { /* Profile owner can delete comment. */
                comment_remove = "<div class='remove guestbook-comment-remove'>" + i18n[lang].remove + "</div>";
            }
            if (current_user_blog_id !== null && current_user_blog_id === doc['blog_id']) {
                comment_remove = "<div class='remove guestbook-comment-remove'>" + i18n[lang].remove + "</div>";
                comment_edit = "<div class='edit guestbook-comment-edit'>" + i18n[lang].edit + "</div>";
            }
        }
        element = "<div class='guestbook-comment'" +
            " data-guestbook-id='" + guestbook_id + "'" +
            " data-profile-owner-blog-id='" + blog_owner_blog_id + "'" +
            " data-id='" + doc["_id"] + "'" +
            " data-blog-id='" + doc["blog_id"] + "'" +
            " data-created-at='" + doc["created_at"] + "'>" +
            comment_remove + comment_edit +
            div1 + div2 + comment_input_wrapper + "</div>";
        return element;
    },
    get_single_perfect_guestbook: function (lang, doc, is_loginned, user, current_user_blog_id, path) {
        var css_version = config.css_version
            , is_blog_owner = false
            , is_guestbook_writer = false
            , is_secret = false
            , written_guestbook
            , guestbook_top = ""
            , remove = ""
            , edit = ""
            , guestbook_go_blog
            , updated_at_wrapper = ""
            , created_at = ""
            , updated_at = ""
            , guestbook_middle = ""
            , guestbook_middle_left = ""
            , guestbook_img = ""
            , simple_profile_prompt_box = ""
            , a1 = ""
            , guestbook_name = ""
            , simple_profile_mouseentered_prompt = ""
            , guestbook_middle_right = ""
            , guestbook_secret = ""
            , guestbook_secret_img = ""
            , span = ""
            , guestbook_content = ""
            , edit_guestbook = ""
            , edit_guestbook_middle = ""
            , edit_guestbook_middle_left = ""
            , edit_guestbook_img = ""
            , edit_guestbook_name = ""
            , edit_guestbook_middle_right = ""
            , edit_guestbook_textarea = ""
            , edit_guestbook_bottom = ""
            , label = ""
            , edit_guestbook_secret_text = ""
            , edit_guestbook_secret = ""
            , edit_guestbook_cancel = ""
            , edit_guestbook_ok = ""
            , guestbook_bottom = ""
            , write_guestbook_comment_form = ""
            , write_guestbook_comment_left = ""
            , img = ""
            , write_guestbook_comment_middle = ""
            , write_guestbook_comment_input = ""
            , write_guestbook_comment_right = ""
            , write_guestbook_comment_submit = ""
            , guestbook_comment_list = ""
            , user_name = ""
            , user_img = config.aws_s3_url + "/upload/images/00000000/gleant/resized/question.png";
        if (lang === undefined) {
            lang = "en";
        }
        if (is_loginned === true) {
            if (current_user_blog_id !== null && current_user_blog_id === doc.blog_id) {
                is_blog_owner = true;
            }
            if (current_user_blog_id !== null && current_user_blog_id === doc.visitor_blog_id) {
                is_guestbook_writer = true;
            }
            if (user !== null) {
                user_name = methods.get_encoded_html_preventing_xss(user.name);
                user_img = user.img;
            }
        } else {
            doc.name = "Gleant";
            if (doc.img.indexOf( "male.png") <= -1) {
                doc.img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
            }
        }
        if (doc.public_authority === 0) {
            is_secret = true;
        } else {
            is_secret = false;
        }
        if (
            is_blog_owner === true ||
            is_guestbook_writer === true
        ) {
            remove = "<div class='remove'>" + i18n[lang].remove + "</div>";
        } else {
            remove = "";
        }
        if (is_guestbook_writer === true) {
            edit = "<div class='edit'>" + i18n[lang].edit + "</div>";
        } else {
            edit = "";
        }
        if (doc.visitor_blog_id === "") {
            guestbook_go_blog = "";
        } else {
            guestbook_go_blog = "<a class='guestbook-go-blog' href='/blog/" + doc.visitor_blog_id + "' target='_blank'>" + i18n[lang].blog + "</a>";
        }
        created_at = "<div class='created-at' data-datetime='" + doc.created_at + "'></div>";
        if (doc.created_at !== doc.updated_at) {
            updated_at = "<div class='updated-at' data-datetime='" + doc.updated_at + "'></div>";
        } else {
            updated_at = "";
        }
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + created_at + updated_at + "</div>";
        guestbook_top = "<div class='guestbook-top'>" + remove + edit + guestbook_go_blog + updated_at_wrapper + "</div>";
        guestbook_img = "<img class='guestbook-img' src='" + doc.img + "' alt='" + methods.get_encoded_html_preventing_xss(doc.name) + "' title='" + methods.get_encoded_html_preventing_xss(doc.name) + "'>";
        if (is_loginned === true) {
            guestbook_name = "<div class='guestbook-name'>" + methods.get_encoded_html_preventing_xss(doc.name) + "</div>";
        } else {
            guestbook_name = "<div class='guestbook-name not-logged-in'>" + methods.get_encoded_html_preventing_xss(doc.name) + "</div>";
        }
        a1 = "<a href='/blog/" + doc.visitor_blog_id + "' target='_blank'>" + guestbook_name + "</a>";
        simple_profile_mouseentered_prompt = "<div class='simple-profile-mouseentered-prompt'></div>";
        if (doc.visitor_blog_id === "") {
            simple_profile_prompt_box = "";
        } else {
            simple_profile_prompt_box = "<div class='simple-profile-prompt-box in-body' data-link='/blog/" + doc.visitor_blog_id + "'>" + a1 + simple_profile_mouseentered_prompt + "</div>";
        }
        guestbook_middle_left = "<div class='guestbook-middle-left'>" + guestbook_img + simple_profile_prompt_box + "</div>";
        guestbook_secret_img = "<img class='emoticon-x-small-img guestbook-secret-img' src='" + config.aws_s3_url + "/icons/secret.png'>";
        span = "<span>" + i18n[lang].secret + "</span>";
        if (is_secret === true) {
            guestbook_secret = "<div class='guestbook-secret'>" + guestbook_secret_img + span + "</div>";
        } else {
            guestbook_secret = "<div class='guestbook-secret' style='display:none;'>" + guestbook_secret_img + span + "</div>";
        }
        guestbook_content = "<div class='guestbook-content'>" + methods.get_encoded_html_preventing_xss(doc.content) + "</div>";
        guestbook_middle_right = "<div class='guestbook-middle-right'>" + guestbook_secret + guestbook_content + "</div>";
        guestbook_middle = "<div class='guestbook-middle'>" + guestbook_middle_left + guestbook_middle_right + "</div>";
        written_guestbook = "<div class='written-guestbook'>" + guestbook_top + guestbook_middle + "</div>";
        if (is_guestbook_writer === true) {
            edit_guestbook_img = "<img class='edit-guestbook-img' src='" + doc.img + "' alt='" + methods.get_encoded_html_preventing_xss(doc.name) + "' title='" + methods.get_encoded_html_preventing_xss(doc.name) + "'>";
            edit_guestbook_name = "<div class='edit-guestbook-name'>" + methods.get_encoded_html_preventing_xss(doc.name) + "</div>";
            edit_guestbook_middle_left = "<div class='edit-guestbook-middle-left'>" + edit_guestbook_img + edit_guestbook_name + "</div>";
            edit_guestbook_textarea = "<textarea class='edit-guestbook-textarea'></textarea>";
            edit_guestbook_middle_right = "<div class='edit-guestbook-middle-right'>" + edit_guestbook_textarea + "</div>";
            edit_guestbook_middle = "<div class='edit-guestbook-middle'>" + edit_guestbook_middle_left + edit_guestbook_middle_right + "</div>";
            edit_guestbook_secret_text = "<span class='edit-guestbook-secret-text'>" + i18n[lang].secret + "</span>";
            edit_guestbook_secret = "<input class='edit-guestbook-secret' type='checkbox'>";
            label = "<label>" + guestbook_secret_img + edit_guestbook_secret_text + edit_guestbook_secret + "</label>";
            edit_guestbook_cancel = "<input class='btn-career edit-guestbook-cancel' type='button' value='" + i18n[lang].cancel + "'>";
            edit_guestbook_ok = "<input class='btn-career edit-guestbook-ok' type='button' value='" + i18n[lang].check + "'>";
            edit_guestbook_bottom = "<div class='edit-guestbook-bottom'>" + label + edit_guestbook_cancel + edit_guestbook_ok + "</div>";
            edit_guestbook = "<form class='edit-guestbook'>" + edit_guestbook_middle + edit_guestbook_bottom + "</form>";
        } else {
            edit_guestbook = "";
        }
        if (
            is_blog_owner === true ||
            is_guestbook_writer === true
        ) {
            img = "<img src='" + user_img + "' title='" + user_name + "' alt='" + user_name + "'>";
            span = "<span class='write-guestbook-comment-name'>" + user_name + "</span>";
            write_guestbook_comment_left = "<div class='write-guestbook-comment-top'>" + img + span + "</div>";
            write_guestbook_comment_input = "<textarea class='write-guestbook-comment-input' placeholder=''></textarea>";
            write_guestbook_comment_middle = "<div class='write-guestbook-comment-middle'>" + write_guestbook_comment_input + "</div>";
            write_guestbook_comment_submit = "<input class='btn-career write-guestbook-comment-submit' type='submit' value='" + i18n[lang].check + "'>";
            write_guestbook_comment_right = "<div class='write-guestbook-comment-bottom'>" + write_guestbook_comment_submit + "</div>";
            write_guestbook_comment_form = "<form class='write-guestbook-comment-form'>" + write_guestbook_comment_left + write_guestbook_comment_middle + write_guestbook_comment_right + "</form>";
        } else {
            write_guestbook_comment_form = "";
        }
        for (var i = 0; i < doc.comments.length; i++) {
            if (doc.visitor_blog_id === doc.comments[i].blog_id) {
                doc.comments[i].img = doc.img;
            }
            guestbook_comment_list = guestbook_comment_list + this.get_single_guestbook_comment(lang, is_loginned, current_user_blog_id, doc._id, doc.blog_id, doc.comments[i]);
        }
        guestbook_comment_list = "<div class='guestbook-comment-list'>" + guestbook_comment_list + "</div>";
        guestbook_bottom = "<div class='guestbook-bottom'>" + write_guestbook_comment_form + guestbook_comment_list + "</div>";
        return "<div class='guestbook' data-blog-id='" + doc.blog_id + "' data-visitor-blog-id='" + doc.visitor_blog_id + "' data-id='" + doc._id + "' data-is-secret='" + is_secret + "' data-created-at='" + doc.created_at + "'>" + written_guestbook + edit_guestbook + guestbook_bottom + "</div>";
    },
    get_single_perfect_article: function (lang, doc, is_mobile, is_loginned, current_user_blog_id, path) {
        var css_version = config["css_version"]
            , id = Date.now() + "_" + doc["_id"]
            , data_link
            , written_link
            , data_created_at = doc["created_at"]
            , data_updated_at = doc["updated_at"]
            , is_modal = false;
        if (lang === undefined) {
            lang = "en";
        }
        if (doc["type"] === "agenda") {
            data_link = "/agenda/" + doc["_id"];
        } else if (doc["type"] === "opinion") {
            data_link = "/agenda/" + doc["agenda_id"] + "/opinion/" + doc["_id"];
        } else if (doc["type"] === "tr_agenda") {
            data_link = "/agenda/" + doc["agenda_id"] + "/tr/" + doc["_id"];
        } else if (doc["type"] === "tr_opinion") {
            data_link = "/agenda/" + doc["agenda_id"] + "/opinion/" + doc["opinion_id"] + "/tr/" + doc["_id"];
        } else if (doc["type"] === "blog") {
            data_link = "/blog/" + doc["blog_id"] + "/" + doc["blog_menu_id"] + "/" + doc["_id"];
        } else if (doc["type"] === "gallery") {
            data_link = "/blog/" + doc["blog_id"] + "/gallery/" + doc["_id"];
        } else {
            return "";
        }
        var temp_list = ""
            , temp = ""
            , temp2 = ""
            , temp3 = ""
            , temp4 = "";
        written_link = config["url"] + data_link;
        temp = "<img class='copy-article-address emoticon-x-small-img' src='" + config.aws_s3_url + "/icons/copy-clipboard.png' data-clipboard-text='" + written_link + "' alt='" + i18n[lang].copy_url + "' title='" + i18n[lang].copy_url + "'>";
        written_link = "<a href='" + written_link + "' target='_blank' alt='" + methods.get_encoded_html_preventing_xss(doc['title']) + "' title='" + methods.get_encoded_html_preventing_xss(doc['title']) + "'>" + written_link + "</a>";
        written_link = "<div class='written-link'>" +  written_link + temp + "</div>";
        var edit
            , written_language
            , written_top
            , written_debate_info
            , writing_authority
            , members_wrapper
            , members_btn_list = ""
            , members_list
            , member_item_class
            , written_title_wrapper
            , user_profile
            , written_content
            , written_btns_wrapper
            , comments_wrapper
            , write_opinion_wrapper = ""
            , request_opinion_wrapper = ""
            , write_translation_wrapper = ""
            , request_translation_wrapper = ""
            , translation_list_wrapper = ""
            , opinion_of_agenda
            , article_type = ""
            , written_debate_status = ""
            , class_debate_status = "debate-unlimited"
            , debate_status = i18n[lang].unlimited
            , datetime = new Date().valueOf()
            , space;
        if (current_user_blog_id === null) {
            edit = "";
        } else {
            if (doc["blog_id"] === current_user_blog_id) {
                edit = "<div class='remove article-remove'>" + i18n[lang].remove + "</div>" +
                    "<div class='edit article-edit'>" + i18n[lang].edit + "</div>";
            } else {
                edit = "";
            }
        }
        var temp_i18n_languages = {};
        temp_i18n_languages["en"] = "english";
        temp_i18n_languages["ja"] = "japanese";
        temp_i18n_languages["ko"] = "korean";
        temp_i18n_languages["zh-Hans"] = "simplified_chinese";
        if (
            doc.type === "agenda" ||
            doc.type === "opinion" ||
            doc.type === "tr_agenda" ||
            doc.type === "tr_opinion"
        ) {
            written_language = temp_i18n_languages[doc.language];
            if (is_loginned === false) {
                doc.name = "Gleant";
                if (doc.img.indexOf( "male.png") <= -1) {
                    doc.img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                }
            }
        } else {
            if (is_loginned === false) {
                doc.blog_name = "Gleant";
                if (doc.type === "blog") {
                    if (doc.img.indexOf( "male.png") <= -1) {
                        doc.img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                    }
                }
            }
        }
        if (
            doc['type'] === 'agenda' ||
            doc['type'] === 'tr_agenda'
        ) {
            if (is_mobile === true) {
                space = "<br>";
            } else {
                space = " &#183; ";
            }
            if (doc['public_authority'] === 1) {
                writing_authority = "<span class='green'>" + i18n[lang].public + "</span>";
            } else {
                writing_authority = "<span class='red'>" + i18n[lang].invited_users + "</span>";
            }
            /*if (doc['opinion_authority'] === 1) {
                writing_authority = writing_authority + space + i18n[lang].opinion_writing + " (<span class='green'>" + i18n[lang].all_users + "</span>)" + space;
            } else {
                writing_authority = writing_authority + space + i18n[lang].opinion_writing + " (<span class='red'>" + i18n[lang].invited_users + "</span>)" + space;
            }
            if (doc['translation_authority'] === 1) {
                writing_authority = writing_authority + i18n[lang].translation_writing + " (<span class='green'>" + i18n[lang].all_users + "</span>)" + space;
            } else {
                writing_authority = writing_authority + i18n[lang].translation_writing + " (<span class='red'>" + i18n[lang].invited_users + "</span>)" + space;
            }

            if (doc['comment_authority'] === 1) {
                writing_authority = writing_authority + i18n[lang].comment_writing + " (<span class='green'>" + i18n[lang].all_users + "</span>)";
            } else {
                writing_authority = writing_authority + i18n[lang].comment_writing + " (<span class='red'>" + i18n[lang].invited_users + "</span>)";
            }*/
            writing_authority = "<div>" + writing_authority + "</div>";
            members_list = "";
            members_btn_list = "";
            for (var x = 0; x < doc['members'].length; x++) {
                if (doc.type === "agenda") {
                    member_item_class = doc._id + "_member_item_" + doc['members'][x];
                } else {
                    member_item_class = doc.agenda_id + "_member_item_" + doc['members'][x];
                }
                if (is_loginned === true) {
                    temp = "<a class='debate-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                } else {
                    temp = "<a class='not-logged-in debate-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                }
                members_list = members_list + temp;
                if (is_loginned === true && doc['members'][x] === current_user_blog_id) {
                    members_btn_list = "<span class='btn-debate-exit'>" + i18n[lang].exit + "</span>";
                    is_member = true;
                }
            }
            if (is_loginned === true) {
                if (doc['type'] === 'agenda') {
                    if (doc['blog_id'] === current_user_blog_id) {
                        members_btn_list = members_btn_list + "<span class='btn-debate-invite'>" + i18n[lang].invite + "</span>";
                    }
                } else {
                    if (doc['root_blog_id'] === current_user_blog_id) {
                        members_btn_list = members_btn_list + "<span class='btn-debate-invite'>" + i18n[lang].invite + "</span>";
                    }
                }
            }
            temp = "<span>" + i18n[lang].invited_users + "</span>";
            temp = "<div class='debate-member-title'>" + members_btn_list + temp + "</div>";
            members_list = "<div class='debate-member-item-wrapper'>" + members_list + "</div>";
            members_wrapper = "<div class='debate-members-wrapper'>" + temp + members_list + "</div>";
            if (
                doc['opinion_authority'] === 1 &&
                doc['translation_authority'] === 1 &&
                doc['comment_authority'] === 1
            ) {
                if (doc.is_member === false) {
                    members_wrapper = "";
                }
            }
            written_debate_info = "<div class='written-debate-info'>" + writing_authority + members_wrapper + "</div>";
        } else {
            written_debate_info = "";
        }
        if (
            doc['type'] === 'agenda' ||
            doc['type'] === 'opinion' ||
            doc['type'] === 'tr_agenda' ||
            doc['type'] === 'tr_opinion'
        ) {
            if (
                doc['type'] === 'agenda' ||
                doc['type'] === 'tr_agenda'
            ) {
                if (doc['is_start_set'] === true) {
                    if (doc['start_at'] > datetime) { /* Scheduled */
                        class_debate_status = "debate-scheduled";
                        debate_status = i18n[lang].scheduled;
                    } else {
                        if (doc['is_finish_set'] === true) {
                            if (doc['finish_at'] > datetime) { /* In Progress */
                                class_debate_status = "debate-in-progress";
                                debate_status = i18n[lang].in_progress;
                            } else { /* Finished */
                                class_debate_status = "debate-finished";
                                debate_status = i18n[lang].finished;
                            }
                        } else { /* Unlimited */
                            class_debate_status = "debate-unlimited";
                            debate_status = i18n[lang].unlimited;
                        }
                    }
                } else {
                    if (doc['is_finish_set'] === true) {
                        if (doc['finish_at'] > datetime) { /* In Progress */
                            class_debate_status = "debate-in-progress";
                            debate_status = i18n[lang].in_progress;
                        } else { /* Finished */
                            class_debate_status = "debate-finished";
                            debate_status = i18n[lang].finished;
                        }
                    } else { /* Unlimited */
                        class_debate_status = "debate-unlimited";
                        debate_status = i18n[lang].unlimited;
                    }
                }
                written_debate_status = "";/*"<div class='debate-status " + class_debate_status + "' data-is-start-set='" + doc['is_start_set'] + "' data-start-at='" + doc['start_at'] + "' data-is-finish-set='" + doc['is_finish_set'] + "' data-finish-at='" + doc['finish_at'] + "' data-print-type='perfect'>" + debate_status + "</div>";*/
                article_type = i18n[lang].agenda;
            } else {
                written_debate_status = "";
                article_type = i18n[lang].opinion;
            }
            if (doc['public_authority'] === 1) {
                temp = "<span class='green'>" + i18n[lang].public + "</span>";
            } else {
                temp = "<span class='red'>" + i18n[lang].invited_users + "</span>";
            }
            if (
                doc['type'] === 'agenda' ||
                doc['type'] === 'opinion'
            ) {
                if (doc['type'] === 'agenda') {
                    /*temp = i18n[lang][written_language] + " &#183; " + i18n[lang].original;*/
                    temp = "";
                } else {
                    /*temp = temp + " &#183; " + i18n[lang][written_language] + " &#183; " + i18n[lang].original;*/
                }
            } else {
                if (doc['type'] === 'tr_agenda') {
                    /*temp = i18n[lang][written_language] + " &#183; " + i18n[lang].translation;*/
                    temp = "";
                } else {
                    /*temp = temp + " &#183; " + i18n[lang][written_language] + " &#183; " + i18n[lang].translation;*/
                }
            }
            temp_list = written_debate_status + written_debate_info + "<div>" + temp + "</div>";
        } else {
            if (doc.language === undefined || doc.language === "") {
                written_language = "";
            } else if (doc.language === "en") {
                written_language = "english";
            } else if (doc.language === "ja") {
                written_language = "japanese";
            } else if (doc.language === "ko") {
                written_language = "korean";
            } else if (doc.language === "zh-Hans") {
                written_language = "simplified_chinese";
            } else {
                written_language = "english";
            }
            temp = "";
            /*if (written_language === "") {
                temp = "";
            } else {
                temp = " &#183; " + i18n[lang][written_language];
            }*/
            if (doc['type'] === 'gallery' && doc['is_profile'] === true) {
                temp2 = " &#183; " + i18n[lang].profile_photo;
            } else {
                temp2 = "";
            }
            if (doc['public_authority'] === 0) {
                temp_list = "<div>" + "<span class='red'>" + i18n[lang].only_me + "</span>" + temp + temp2 + "</div>";
            } else if (doc['public_authority'] === 1) {
                temp_list = "<div>" + "<span class='green'>" + i18n[lang].public + "</span>" + temp + temp2 + "</div>";
            } else if (doc['public_authority'] === 2) {
                temp_list = "<div>" + "<span class='yellow'>" + i18n[lang].friends + "</span>" + temp + temp2 + "</div>";
            }
        }
        for (var i = 0; i < doc['tags'].length; i++) {
            temp = "<div class='written-tag'>" + methods.get_encoded_html_preventing_xss(doc['tags'][i]) + "</div>";
            temp_list = temp_list + "<a href='/search?w=tot&q=" + methods.encode_for_url(doc['tags'][i]) + "'>" + temp + "</a>";
        }
        if (temp_list === "") {
            written_top = "";
        } else {
            written_top = "<div class='written-top'>" + temp_list + "</div>";
        }
        var written_article_title = 'written-' + doc['type'] + '-title'
            , written_article_content = 'written-' + doc['type'] + '-content'
            , written_article = 'written-' + doc['type'];
        var open_parent = "";
        temp = methods.get_encoded_html_preventing_xss(doc['title']);
        temp = "<div class='written-title " + written_article_title + "'>" + temp + "</div>";
        if (doc['type'] === 'opinion') {
            if (doc['is_removed'] === true) {
                open_parent = "";
            } else {
                open_parent = "<div class='open-parent open-agenda'" +
                    " data-type='agenda'" +
                    " data-link='/agenda/" + doc['agenda_id'] + "'" +
                    ">" + i18n[lang].view_agenda + "</div>";
            }
        }
        if (doc['type'] === 'tr_agenda') {
            open_parent = "<div class='open-parent open-original'" +
                " data-type='agenda'" +
                " data-id='" + doc['agenda_id'] + "'" +
                ">" + i18n[lang].view_original + "</div>";
        }
        if (doc['type'] === 'tr_opinion') {
            open_parent = "<div class='open-parent open-original'" +
                " data-type='opinion'" +
                " data-id='" + doc['opinion_id'] + "'" +
                " data-agenda-id='" + doc['agenda_id'] + "'" +
                ">" + i18n[lang].view_original + "</div>";
        }
        written_title_wrapper = "<div class='written-title-wrapper'>" + open_parent + temp + "</div>";
        if (doc['type'] === 'blog' || doc['type'] === 'gallery') {
            if (doc['title'] === '') {
                written_title_wrapper = "";
            }
        }
        var user_profile_left
            , user_profile_right;
        if (
            doc['type'] === 'agenda' ||
            doc['type'] === 'opinion' ||
            doc['type'] === 'tr_agenda' ||
            doc['type'] === 'tr_opinion'
        ) {
            temp = "<img src='" + doc['img'] + "' alt='" + methods.get_encoded_html_preventing_xss(doc['name']) + "' title='" + methods.get_encoded_html_preventing_xss(doc['name']) + "'>";
            temp = "<a href='/blog/" + doc['blog_id'] + "' target='_blank'>" + temp + "</a>";
            temp2 = "<div class='simple-profile-mouseentered-prompt'></div>";
            temp = "<div class='simple-profile-prompt-box in-written' data-link='/blog/" + doc['blog_id'] + "'>" + temp + temp2 + "</div>";
            user_profile_left = "<div class='user-profile-left'>" + temp + "</div>";
            if (is_loginned === true) {
                temp = "<span class='user-name'>" + methods.get_encoded_html_preventing_xss(doc['name']) + "</span>";
            } else {
                temp = "<span class='user-name not-logged-in'>" + methods.get_encoded_html_preventing_xss(doc['name']) + "</span>";
            }
            temp = "<a class='user-name-wrapper' href='/blog/" + doc['blog_id'] + "' target='_blank'>" + temp + "</a>";
            temp2 = "<div class='simple-profile-mouseentered-prompt'></div>";
            temp = "<div class='simple-profile-prompt-box in-written' data-link='/blog/" + doc['blog_id'] + "'>" + temp + temp2 + "</div>";
            temp2 = "<span class='separator'></span>";
            if (
                doc['type'] === 'agenda' ||
                doc['type'] === 'opinion'
            ) {
                if (is_loginned === true) {
                    temp3 = "<span class='user-info'>" + methods.get_encoded_html_preventing_xss(doc['profile']) + "</span>";
                } else {
                    temp3 = "<span class='user-info not-logged-in'>" + methods.get_encoded_html_preventing_xss(doc['profile']) + "</span>";
                }
            } else {
                temp3 = "";
            }
            temp = "<div>" + temp + temp2 + temp3 + "</div>";
            if (doc["created_at"] === doc["updated_at"]) {
                temp2 = "<div class='created-at' data-datetime='" + doc["created_at"] + "'></div>";
            } else {
                temp2 = "<div class='created-at' data-datetime='" + doc["created_at"] + "'></div>" +
                    "<div class='updated-at' data-datetime='" + doc["updated_at"] + "'></div>";
            }
            temp2 = "<a class='updated-at-wrapper' href='" + data_link + "' target='_blank'>" + temp2 + "</a>";
            user_profile_right = "<div class='user-profile-right'>" + temp + temp2 + "</div>";
            user_profile = "<div class='user-profile'>" + user_profile_left + user_profile_right + "</div>";
        } else {
            if (doc["created_at"] === doc["updated_at"]) {
                temp = "<div class='created-at' data-datetime='" + doc["created_at"] + "'></div>";
            } else {
                temp = "<div class='created-at' data-datetime='" + doc["created_at"] + "'></div>" +
                    "<div class='updated-at' data-datetime='" + doc["updated_at"] + "'></div>";
            }
            user_profile = "<a class='updated-at-wrapper' href='" + data_link + "'>" + temp + "</a>";
        }
        if (doc['type'] === 'gallery') {
            temp = "<img src='" + doc['img'] + "' style='max-width:100%;'>";
            temp = "<div style='text-align:center;width:100%;'>" + temp + "</div>";
            temp2 = "<div>" + methods.get_encoded_html_preventing_xss(doc['content']) + "</div>";
            written_content = "<div class='written-content " + written_article_content + "'>" + temp + temp2 + "</div>";
        } else {
            written_content = "<div class='written-content " + written_article_content + "'>" + doc['content'] + "</div>";
        }
        var view_counts = ""
            , awesome_counts = ""
            , comments_counts = ""
            , written_opinion_counts = ""
            , requested_opinion_counts = ""
            , written_translation_counts = ""
            , requested_translation_counts = ""
            , total_count_written_translations = 0;
        if (doc['type'] === 'gallery' ||
            doc['type'] === 'blog') {
            doc['count_view'] = doc['count_view'] + 1;
        }
        if (doc['count_view'] > 0) {
            temp = "<img src='" + config.aws_s3_url + "/icons/view-selected.png" + css_version + "' title='" + i18n[lang].view + "' alt='" + i18n[lang].view + "'>";
            temp2 = "<span>" + methods.put_comma_between_three_digits(doc['count_view']) + "</span>";
            view_counts = "<div class='view-counts' data-count='" + doc['count_view'] + "'>" + temp + temp2 + "</div>";
        }
        if (doc['type'] === "agenda") {
            if (doc['count_written_opinions'] > 0) {
                temp = "<img src='" + config.aws_s3_url + "/icons/write-opinion-selected.png" + css_version + "' title='" + i18n[lang].opinion + "' alt='" + i18n[lang].opinion + "'>";
                temp2 = "<span>" + methods.put_comma_between_three_digits(doc['count_written_opinions']) + "</span>";
                written_opinion_counts = "<div class='written-opinion-counts' data-count='" + doc['count_written_opinions'] + "'>" + temp + temp2 + "</div>";
            }
            if (doc['count_requested_opinions'] > 0) {
                temp = "<img src='" + config.aws_s3_url + "/icons/request-opinion-selected.png" + css_version + "' title='" + i18n[lang].opinion_request + "' alt='" + i18n[lang].opinion_request + "'>";
                temp2 = "<span>" + methods.put_comma_between_three_digits(doc['count_requested_opinions']) + "</span>";
                requested_opinion_counts = "<div class='requested-opinion-counts' data-count='" + doc['count_requested_opinions'] + "'>" + temp + temp2 + "</div>";
            }
        }
        if (
            doc['type'] === "agenda" || doc['type'] === "opinion"
        ) {
            /*
            for (var j = 0; j < doc["count_written_translations"].length; j++) {
                if (doc["count_written_translations"][j].count < 0) {
                    doc["count_written_translations"][j].count = 0;
                }
                total_count_written_translations = total_count_written_translations + doc["count_written_translations"][j].count;
            }
            if (total_count_written_translations > 0) {
                temp = "<img src='" + config.aws_s3_url + "/icons/write-translation-selected.png" + css_version + "' title='" + i18n[lang].translation + "' alt='" + i18n[lang].translation + "'>";
                temp2 = "<span>" + methods.put_comma_between_three_digits(total_count_written_translations) + "</span>";
                written_translation_counts = "<div class='written-translation-counts' data-count='" + total_count_written_translations + "'>" + temp + temp2 + "</div>";
            }
            if (doc['count_requested_translations'] > 0) {
                temp = "<img src='" + config.aws_s3_url + "/icons/request-translation-selected.png" + css_version + "' title='" + i18n[lang].translation_request + "' alt='" + i18n[lang].translation_request + "'>";
                temp2 = "<span>" + methods.put_comma_between_three_digits(doc['count_requested_translations']) + "</span>";
                requested_translation_counts = "<div class='requested-translation-counts' data-count='" + doc['count_requested_translations'] + "'>" + temp + temp2 + "</div>";
            }*/
            written_translation_counts = "";
            requested_translation_counts
        }
        var btn_awesome = ""
            , btn_opinion = ""
            , btn_translation = ""
            , btn_translation_mobile = ""
            , btn_open_comments = ""
            , btn_open_comments_mobile = ""
            , btn_share_desktop = ""
            , btn_report_desktop = ""
            , btn_report_mobile = ""
            , btn_subscribe_desktop = ""
            , btn_subscribe_mobile = ""
            , btn_ellipsis_mobile = ""
            , data_translation_language_list = ""
            , data_translation_count_list = ""
            , real_count;
        if (current_user_blog_id === null) {
            temp = "<img src='" + config.aws_s3_url + "/icons/awesome.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].awesome + "</span>";
            if (doc['count_awesome'] > 0) {
                real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_awesome']) + "</span>";
            } else {
                real_count = "<span class='real-count'></span>";
            }
            btn_awesome = "<div class='btn-awesome awesome-" + doc['type'] + "' data-count='" + doc['count_awesome'] + "'>" + temp + temp2 + real_count + "</div>";
        } else {
            var is_awesome = false;
            for (var i = 0; i < doc['likers'].length; i++) {
                if (current_user_blog_id === doc['likers'][i]) {
                    is_awesome = true;
                    break;
                }
            }
            if (doc['count_awesome'] > 0) {
                real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_awesome']) + "</span>";
            } else {
                real_count = "<span class='real-count'></span>";
            }
            if (is_awesome === true) {
                temp = "<img src='" + config.aws_s3_url + "/icons/awesome-selected.png" + css_version + "'>";
                temp2 = "<span>" + i18n[lang].awesome + "</span>";
                btn_awesome = "<div class='btn-awesome selected loginned awesome-" + doc['type'] + "'" +
                    " data-type='" + doc['type'] + "'" +
                    " data-blog-id='" + doc['blog_id'] + "'" +
                    " data-blog-menu-id='" + doc['blog_menu_id'] + "'" +
                    " data-count='" + doc['count_awesome'] + "'" +
                    " data-id='" + doc['_id'] + "'>" + temp + temp2 + real_count + "</div>";
            } else {
                temp = "<img src='" + config.aws_s3_url + "/icons/awesome.png" + css_version + "'>";
                temp2 = "<span>" + i18n[lang].awesome + "</span>";
                btn_awesome = "<div class='btn-awesome loginned awesome-" + doc['type'] + "'" +
                    " data-type='" + doc['type'] + "'" +
                    " data-blog-id='" + doc['blog_id'] + "'" +
                    " data-blog-menu-id='" + doc['blog_menu_id'] + "'" +
                    " data-count='" + doc['count_awesome'] + "'" +
                    " data-id='" + doc['_id'] + "'>" + temp + temp2 + real_count + "</div>";
            }
        }
        temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/comments.png" + css_version + "'>";
        temp2 = "<span>" + i18n[lang].comments + "</span>";
        if (doc['count_comments'] > 0) {
            real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_comments']) + "</span>";
        } else {
            real_count = "<span class='real-count'></span>";
        }
        if (
            doc['type'] === 'agenda' ||
            doc['type'] === 'opinion'
        ) {
            btn_open_comments = "<div class='btn-open-comments written-btn-desktop-only' data-type='" + doc['type'] + "' data-count='" + doc['count_comments'] + "'>" + temp + temp2 + real_count + "</div>";
            btn_open_comments_mobile = "<li class='btn-open-comments-mobile' data-type='" + doc['type'] + "' data-count='" + doc['count_comments'] + "'>" + temp + temp2 + real_count + "</li>";
        } else {
            btn_open_comments = "<div class='btn-open-comments' data-type='" + doc['type'] + "' data-count='" + doc['count_comments'] + "'>" + temp + temp2 + real_count + "</div>";
            btn_open_comments_mobile = "";
        }
        if (doc['type'] === 'agenda') {
            temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/write-opinion.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].opinion + "</span>";
            if (doc['count_written_opinions'] < 0) {
                doc['count_written_opinions'] = 0;
            }
            if (doc['count_written_opinions'] > 0) {
                real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_written_opinions']) + "</span>";
            } else {
                real_count = "<span class='real-count'></span>";
            }
            btn_opinion = "<div class='btn-opinion' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-blog-id='" + doc['blog_id'] + "' data-count='" + doc['count_written_opinions'] + "' data-is-modal='" + is_modal + "'>" + temp + temp2 + real_count + "</div>";
        }
        if (
            doc['type'] === 'agenda' ||
            doc['type'] === 'opinion'
        ) {
            temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/write-translation.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].translation + "</span>";
            if (total_count_written_translations > 0) {
                real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(total_count_written_translations) + "</span>";
            } else {
                real_count = "<span class='real-count'></span>";
            }
            for (var i = 0; i < doc['count_written_translations'].length; i++) {
                if (doc['language'] !== doc['count_written_translations'][i].language) {
                    if (data_translation_language_list === "") {
                        data_translation_language_list = doc['count_written_translations'][i].language;
                        data_translation_count_list = doc['count_written_translations'][i].count;
                    } else {
                        data_translation_language_list = data_translation_language_list + "," + doc['count_written_translations'][i].language;
                        data_translation_count_list = data_translation_count_list + "," + doc['count_written_translations'][i].count;
                    }
                }
            }
            if (doc['type'] === 'agenda') {
                /*
                btn_translation = "<div class='btn-translation written-btn-desktop-only' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-blog-id='" + doc['blog_id'] + "' data-count='" + total_count_written_translations + "' data-translation-language-list='" + data_translation_language_list + "' data-translation-count-list='" + data_translation_count_list + "'>" + temp + temp2 + real_count + "</div>";
                btn_translation_mobile = "<li class='btn-translation-mobile' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-blog-id='" + doc['blog_id'] + "' data-count='" + total_count_written_translations + "' data-translation-language-list='" + data_translation_language_list +"' data-translation-count-list='" + data_translation_count_list + "'>" + temp + temp2 + real_count + "</li>";
                */
                btn_translation = "";
                btn_translation_mobile = "";
            } else {
                /*
                btn_translation = "<div class='btn-translation' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-agenda-id='" + doc['agenda_id'] + "' data-blog-id='" + doc['blog_id'] + "' data-count='" + total_count_written_translations + "' data-translation-language-list='" + data_translation_language_list + "' data-translation-count-list='" + data_translation_count_list + "'>" + temp + temp2 + real_count + "</div>";
                btn_translation_mobile = "";
                */
                btn_translation = "";
                btn_translation_mobile = "";
            }
            temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/share2.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].share + "</span>";
            btn_share_desktop = "<div class='btn-share-desktop written-btn-desktop-only'>" + temp + temp2 + "</div>";
            if (current_user_blog_id !== null) {
                temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/report.png" + css_version + "'>";
                temp = temp + "<span>" + i18n[lang].report + "</span>";
                btn_report_desktop = "<div class='btn-report-desktop written-btn-desktop-only report-article' data-type='" + doc['type'] + "'>" + temp + "</div>";
                btn_report_mobile = "<li class='btn-report-mobile report-article' data-type='" + doc['type'] + "'>" + temp + "</li>";
            }
        } else if (
            doc['type'] === 'tr_agenda' ||
            doc['type'] === 'tr_opinion'
        ) {
            temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/share2.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].share + "</span>";
            btn_share_desktop = "<div class='btn-share-desktop written-btn-desktop-only'>" + temp + temp2 + "</div>";
            if (current_user_blog_id !== null) {
                temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/report.png" + css_version + "'>";
                temp = temp + "<span>" + i18n[lang].report + "</span>";
                btn_report_desktop = "<div class='btn-report-desktop written-btn-desktop-only report-article' data-type='" + doc['type'] + "'>" + temp + "</div>";
                btn_report_mobile = "<li class='btn-report-mobile report-article' data-type='" + doc['type'] + "'>" + temp + "</li>";
            }
        } else {
            btn_share_desktop = "";
            btn_report_desktop = "";
            btn_report_mobile = "";
        }
        if (current_user_blog_id !== null) {
            var is_subscribed = false;
            for (var i = 0; i < doc['subscribers'].length; i++) {
                if (current_user_blog_id === doc['subscribers'][i]) {
                    is_subscribed = true;
                    break;
                }
            }
            if (is_subscribed === true) {
                temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/subscription-selected.png" + css_version + "'>";
                temp = temp + "<span>" + i18n[lang].subscription + " ✔" + "</span>";
                btn_subscribe_desktop = "<div class='btn-unsubscribe-desktop written-btn-desktop-only'" +
                        " data-type='" + doc['type'] + "'" +
                        " data-blog-id='" + doc['blog_id'] + "'" +
                        " data-blog-menu-id='" + doc['blog_menu_id'] + "'" +
                        " data-id='" + doc['_id'] + "'>" + temp + "</div>";
                btn_subscribe_mobile = "<li class='btn-unsubscribe-mobile'" +
                        " data-type='" + doc['type'] + "'" +
                        " data-blog-id='" + doc['blog_id'] + "'" +
                        " data-blog-menu-id='" + doc['blog_menu_id'] + "'" +
                        " data-id='" + doc['_id'] + "'>" + temp + "</li>";
            } else {
                temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/subscription.png" + css_version + "'>";
                temp = temp + "<span>" + i18n[lang].subscription + "</span>";
                btn_subscribe_desktop = "<div class='btn-subscribe-desktop written-btn-desktop-only'" +
                        " data-type='" + doc['type'] + "'" +
                        " data-blog-id='" + doc['blog_id'] + "'" +
                        " data-blog-menu-id='" + doc['blog_menu_id'] + "'" +
                        " data-id='" + doc['_id'] + "'>" + temp + "</div>";
                btn_subscribe_mobile = "<li class='btn-subscribe-mobile'" +
                        " data-type='" + doc['type'] + "'" +
                        " data-blog-id='" + doc['blog_id'] + "'" +
                        " data-blog-menu-id='" + doc['blog_menu_id'] + "'" +
                        " data-id='" + doc['_id'] + "'>" + temp + "</li>";
            }
        } else {
            btn_subscribe_desktop = "";
            btn_subscribe_mobile = "";
        }
        temp = "<img src='" + config.aws_s3_url + "/icons/ellipsis-grey.png" + css_version + "' class='btn-ellipsis-mobile-img'>";
        if (
            doc['type'] === 'agenda' ||
            doc['type'] === 'opinion' ||
            doc['type'] === 'tr_agenda' ||
            doc['type'] === 'tr_opinion'
        ) {
            temp2 = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/share2.png" + css_version + "'>";
            temp2 = temp2 + "<span>" + i18n[lang].share + "</span>";
            temp2 = "<li class='btn-share-mobile'>" + temp2 + "</li>";
        } else {
            temp2 = "";
        }
        temp2 = "<ul style='display:none;'>" + btn_translation_mobile + btn_open_comments_mobile + btn_subscribe_mobile + btn_report_mobile + temp2 + "</ul>";
        btn_ellipsis_mobile = "<div class='btn-ellipsis-mobile'>" + temp + temp2 + "</div>";
        written_btns_wrapper = "<div class='written-btns-wrapper'>" + view_counts + btn_awesome + btn_opinion + btn_translation + btn_open_comments + btn_share_desktop + btn_report_desktop + btn_subscribe_desktop + btn_ellipsis_mobile + "</div>";
        comments_wrapper = "<div class='comments-wrapper outer-comments'></div>";
        if (doc['type'] === 'agenda') {
            write_opinion_wrapper = "<div class='write-opinion-wrapper'></div>";
            request_opinion_wrapper = "<div class='request-opinion-wrapper'></div>";
        }
        if (
            doc['type'] === 'agenda' ||
            doc['type'] === 'opinion'
        ) {
            /*write_translation_wrapper = "<div class='write-translation-wrapper' data-lang='" + doc.language + "'></div>";
            request_translation_wrapper = "<div class='request-translation-wrapper' data-lang='" + doc.language + "'></div>";
            temp3 = "<div class='translation-list'></div>";
            temp4 = "<div class='btn-more translation-more'><img class='btn-more-down-14' src='" + config.aws_s3_url + "/icons/more-down.png" + css_version + "'></div>";
            temp3 = "<div class='translation-list-inner-wrapper'>" + temp3 + temp4 + "</div>";
            translation_list_wrapper = "<div class='translation-list-wrapper'>" + temp3 + "</div>";*/
            write_translation_wrapper = "";
            request_translation_wrapper = "";
            translation_list_wrapper = "";
        }
        if (doc['type'] === 'agenda') {
            if (doc['count_written_opinions'] < 0) {
                doc['count_written_opinions'] = 0;
            }
            var opinion_list_type = "agenda";
            temp3 = "<div id='opinion-list-of-" + opinion_list_type + "'></div>";
            temp4 = "<div id='opinion-more-of-" + opinion_list_type + "' class='btn-more list-more'><img class='btn-more-down-14' src='" + config.aws_s3_url + "/icons/more-down.png" + css_version + "'></div>";
            opinion_of_agenda = "<div class='opinion-of-agenda'>" + temp3 + temp4 + "</div>";
        } else {
            opinion_of_agenda = "";
        }
        var article_class
            , written;
        if (doc['type'] === 'opinion' && doc['is_removed'] === true) {
            edit = "";
            written_top = "";
            written_link = "";
            user_profile = "";
            written_content = "";
            written_btns_wrapper = "";
            comments_wrapper = "";
            opinion_of_agenda = "";
            written = "<div class='written " + written_article +
                "' data-created-at='" + data_created_at +
                "' data-updated-at='" + data_updated_at +
                "' data-type='" + doc['type'] +
                "'>" +
                written_top +
                written_title_wrapper +
                "</div>";
        } else {
            article_class = doc['type'] + "-" + doc['_id'];
            written = "<div id='" + id + "' class='written " + written_article + " " + article_class +
                "' data-link='" + data_link +
                "' data-created-at='" + data_created_at +
                "' data-updated-at='" + data_updated_at +
                "' data-type='" + doc['type'] +
                "' data-lang='" + doc['language'] +
                "' data-blog-id='" + doc['blog_id'] +
                "' data-id='" + doc['_id'] +
                "' data-agenda-id='" + doc['agenda_id'] +
                "' data-opinion-id='" + doc['opinion_id'] +
                "' data-blog-menu-id='" + doc['blog_menu_id'] +
                "' data-class='" + article_class +
                "' data-print-type='perfect" +
                "'>" +
                edit +
                written_top +
                written_title_wrapper +
                user_profile +
                written_content +
                written_link +
                written_btns_wrapper +
                comments_wrapper +
                write_opinion_wrapper +
                request_opinion_wrapper +
                write_translation_wrapper +
                request_translation_wrapper +
                translation_list_wrapper +
                opinion_of_agenda +
                "</div>";
        }
        return written;
    },
    get_single_perfect_employment: function (lang, doc, is_loginned, current_user_blog_id) {
        var css_version = config["css_version"]
            , id = Date.now() + "_" + doc["_id"]
            , data_link
            , written_link
            , data_created_at = doc["created_at"]
            , data_updated_at = doc["updated_at"];
        if (lang === undefined) {
            lang = "en";
        }
        if (doc.type === "hire_me") {
            if (is_loginned === false) {
                return "";
            }
            data_link = "/hire-me/" + doc["_id"];
        } else if (doc.type === "apply_now") {
            data_link = "/apply-now/" + doc["_id"];
            if (is_loginned === false) {
                doc.name = "Gleant";
                if (doc.img.indexOf( "male.png") <= -1) {
                    doc.img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                }
            }
        } else {
            return "";
        }
        var temp_list = ""
            , temp = ""
            , temp2 = ""
            , temp3 = ""
            , temp4 = "";
        written_link = config["url"] + data_link;
        temp = "<img class='copy-article-address emoticon-x-small-img' src='" + config.aws_s3_url + "/icons/copy-clipboard.png' data-clipboard-text='" + written_link + "' alt='" + i18n[lang].copy_url + "' title='" + i18n[lang].copy_url + "'>";
        written_link = "<a href='" + written_link + "' target='_blank' alt='" + methods.get_encoded_html_preventing_xss(doc['title']) + "' title='" + methods.get_encoded_html_preventing_xss(doc['title']) + "'>" + written_link + "</a>";
        written_link = "<div class='written-link'>" +  written_link + temp + "</div>";
        var edit
            , img
            , written_language
            , company_info = ""
            , written_top
            , written_employment_info
            , writing_authority
            , members_wrapper
            , members_btn_list = ""
            , members_list
            , member_item_class
            , written_title_wrapper
            , user_profile
            , written_content
            , written_btns_wrapper
            , comments_wrapper
            , write_announcement_wrapper = ""
            , announcement_wrapper
            , answer_wrapper
            , written_online_interview_status = ""
            , class_online_interview_status = "online-interview-unlimited"
            , online_interview_status = i18n[lang].unlimited
            , datetime = new Date().valueOf()
            , is_online_interview_finished = false;
        if (current_user_blog_id === null) {
            edit = "";
        } else {
            if (doc["blog_id"] === current_user_blog_id) {
                edit = "<div class='remove employment-remove'>" + i18n[lang].remove + "</div>" +
                    "<div class='edit employment-edit'>" + i18n[lang].edit + "</div>";
            } else {
                edit = "";
            }
        }
        var temp_i18n_languages = {};
        temp_i18n_languages["en"] = "english";
        temp_i18n_languages["ja"] = "japanese";
        temp_i18n_languages["ko"] = "korean";
        temp_i18n_languages["zh-Hans"] = "simplified_chinese";
        written_language = temp_i18n_languages[doc.language];
        if (doc['type'] === "apply_now") { /* Apply Now */
            if (doc['public_authority'] === 1) {
                writing_authority = "<span class='green'>" + i18n[lang].public + "</span>";
            } else {
                writing_authority = "<span class='red'>" + i18n[lang].invited_users + "</span>";
            }
            members_list = "";
            members_btn_list = "";
            if (doc['is_online_interview_set'] === true) {
                if (doc['application_authority'] === 1) {
                    writing_authority = writing_authority + " &#183; " + i18n[lang].online_interview + " " + i18n[lang].application_permission + " (<span class='green'>" + i18n[lang].all_users + "</span>)" + " &#183; " + i18n[lang][written_language];
                    if (doc.is_member !== true) {
                        members_wrapper = "";
                    } else {
                        for (var x = 0; x < doc['members'].length; x++) {
                            member_item_class = doc._id + "_member_item_" + doc['members'][x];
                            if (is_loginned === true) {
                                temp = "<a class='employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                            } else {
                                temp = "<a class='not-logged-in employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                            }
                            members_list = members_list + temp;
                            if (is_loginned === true && doc['members'][x] === current_user_blog_id) {
                                members_btn_list = "<span class='btn-employment-exit'>" + i18n[lang].exit + "</span>";
                            }
                        }
                        if (datetime > doc['finish_at']) {
                            is_online_interview_finished = true;
                        }
                        if (is_loginned === true && is_online_interview_finished === false) {
                            if (doc['blog_id'] === current_user_blog_id) {
                                members_btn_list = members_btn_list + "<span class='btn-employment-invite'>" + i18n[lang].invite + "</span>";
                            }
                        }
                        temp = "<span>" + i18n[lang].invited_users + "</span>";
                        temp = "<div class='employment-member-title'>" + members_btn_list + temp + "</div>";
                        members_list = "<div class='employment-member-item-wrapper'>" + members_list + "</div>";
                        members_wrapper = "<div class='employment-members-wrapper'>" + temp + members_list + "</div>";
                    }
                } else {
                    writing_authority = writing_authority + " &#183; " + i18n[lang].online_interview + " " + i18n[lang].application_permission + " (<span class='red'>" + i18n[lang].invited_users + "</span>)" + " &#183; " + i18n[lang][written_language];
                    for (var x = 0; x < doc['members'].length; x++) {
                        member_item_class = doc._id + "_member_item_" + doc['members'][x];
                        if (is_loginned === true) {
                            temp = "<a class='employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                        } else {
                            temp = "<a class='not-logged-in employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                        }
                        members_list = members_list + temp;
                        if (is_loginned === true && doc['members'][x] === current_user_blog_id) {
                            members_btn_list = "<span class='btn-employment-exit'>" + i18n[lang].exit + "</span>";
                        }
                    }
                    if (datetime > doc['finish_at']) {
                        is_online_interview_finished = true;
                    }
                    if (is_loginned === true && is_online_interview_finished === false) {
                        if (doc['blog_id'] === current_user_blog_id) {
                            members_btn_list = members_btn_list + "<span class='btn-employment-invite'>" + i18n[lang].invite + "</span>";
                        }
                    }
                    temp = "<span>" + i18n[lang].invited_users + "</span>";
                    temp = "<div class='employment-member-title'>" + members_btn_list + temp + "</div>";
                    members_list = "<div class='employment-member-item-wrapper'>" + members_list + "</div>";
                    members_wrapper = "<div class='employment-members-wrapper'>" + temp + members_list + "</div>";
                }
            } else {
                members_wrapper = "";
            }
            img = "<img src='" + doc['logo'] + css_version + "'>";
            temp = "<div class='employment-company-info-left'>" + img + "</div>";
            temp2 = "<div class='employment-company-info-title'>" + methods.get_encoded_html_preventing_xss(doc['company']) + "</div>";
            temp2 = temp2 + "<div class='employment-company-info-content'>" + methods.get_encoded_html_preventing_xss(doc['business_type']) + "</div>";
            temp3 = "";
            if (doc['country'] !== "") {
                temp3 = methods.get_encoded_html_preventing_xss(doc['country']);
            }
            if (doc['city'] !== "") {
                temp3 = temp3 + " " + methods.get_encoded_html_preventing_xss(doc['city']);
            }
            if (temp3 !== "") {
                temp2 = temp2 + "<div class='employment-company-info-content'>" + temp3 + "</div>";
            }
            if (doc['url'] !== "") {
                temp3 = doc['protocol'] + "://" + doc['url'];
                temp3 = "<a href='" + temp3 + "' target='_blank'>" + temp3 + "</a>";
                temp2 = temp2 + "<div class='employment-company-info-content'>" + temp3 + "</div>";
            }
            temp2 = "<div class='employment-company-info-right'>" + temp2 + "</div>";
            company_info = temp + temp2;
            company_info = "<div class='employment-company-info'>" + company_info + "</div>";
            if (
                lang === "en" ||
                lang === "ko") {
                temp = i18n[lang].apply_now + ".";
            } else {
                temp = i18n[lang].apply_now + "。";
            }
            company_info = company_info + "<strong>" + methods.get_encoded_html_preventing_xss(doc['job']) + "</strong>" + " " + temp + "<br>";
            company_info = "<div style='font-size:15px;'>" + company_info + "</div>";
            if (doc['decide_salary_later'] === true) {
                company_info = company_info + i18n[lang].salary + ": " + i18n[lang].decide_after_consulting;
            } else {
                temp = "per_" + doc['salary_period'];
                temp2 = "";
                for (var i = 0; i < monetary_units.length; i++) {
                    if (doc["salary_unit"] === monetary_units[i].unit) {
                        temp2 = methods.put_comma_between_three_digits(doc.salary) + " " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                    }
                }
                if (temp2 === "") {
                    return "";
                }
                company_info = company_info + i18n[lang][doc['employment_status']] + " " + i18n[lang][temp] + " " +  temp2;
            }
            company_info = "<div style='width:100%;padding:10px 0;'>" + company_info + "</div>";
            writing_authority = "<div>" + writing_authority + "</div>";
            written_employment_info = "<div class='written-employment-info'>" + writing_authority + members_wrapper + "</div>";
        } else { /* Hire Me */
            if (
                lang === "en" ||
                lang === "ko") {
                temp = i18n[lang].hire_me + ".";
            } else {
                temp = i18n[lang].hire_me + "。";
            }
            company_info = "<strong>" + methods.get_encoded_html_preventing_xss(doc['job']) + "</strong>" + " " + temp + "<br>";
            company_info = "<div style='font-size:15px;'>" + company_info + "</div>";
            if (doc['decide_salary_later'] === true) {
                company_info = company_info + i18n[lang].salary + ": " + i18n[lang].decide_after_consulting;
            } else {
                temp = "per_" + doc['salary_period'];
                temp2 = "";
                for (var i = 0; i < monetary_units.length; i++) {
                    if (doc["salary_unit"] === monetary_units[i].unit) {
                        temp2 = methods.put_comma_between_three_digits(doc.salary) + " " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                    }
                }
                if (temp2 === "") {
                    return "";
                }
                company_info = company_info + i18n[lang][doc['employment_status']] + " " + i18n[lang][temp] + " " +  temp2;
            }
            company_info = "<div style='width:100%;padding:10px 0;'>" + company_info + "</div>";
            if (doc['public_authority'] === 1) {
                writing_authority = "<span class='green'>" + i18n[lang].public + "</span>";
                if (doc.is_member !== true) {
                    members_wrapper = "";
                } else {
                    members_list = "";
                    members_btn_list = "";
                    for (var x = 0; x < doc['members'].length; x++) {
                        member_item_class = doc._id + "_member_item_" + doc['members'][x];
                        if (is_loginned === true) {
                            temp = "<a class='employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                        } else {
                            temp = "<a class='not-logged-in employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                        }
                        members_list = members_list + temp;
                        if (is_loginned === true && doc['members'][x] === current_user_blog_id) {
                            members_btn_list = "<span class='btn-employment-exit'>" + i18n[lang].exit + "</span>";
                        }
                    }
                    if (is_loginned === true) {
                        if (doc['blog_id'] === current_user_blog_id) {
                            members_btn_list = members_btn_list + "<span class='btn-employment-invite'>" + i18n[lang].invite + "</span>";
                        }
                    }
                    temp = "<span>" + i18n[lang].invited_users + "</span>";
                    temp = "<div class='employment-member-title'>" + members_btn_list + temp + "</div>";
                    members_list = "<div class='employment-member-item-wrapper'>" + members_list + "</div>";
                    members_wrapper = "<div class='employment-members-wrapper'>" + temp + members_list + "</div>";
                }
            } else {
                writing_authority = "<span class='red'>" + i18n[lang].invited_users + "</span>";
                members_list = "";
                members_btn_list = "";
                for (var x = 0; x < doc['members'].length; x++) {
                    member_item_class = doc._id + "_member_item_" + doc['members'][x];
                    if (is_loginned === true) {
                        temp = "<a class='employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                    } else {
                        temp = "<a class='not-logged-in employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                    }
                    members_list = members_list + temp;
                    if (is_loginned === true && doc['members'][x] === current_user_blog_id) {
                        members_btn_list = "<span class='btn-employment-exit'>" + i18n[lang].exit + "</span>";
                    }
                }
                if (is_loginned === true) {
                    if (doc['blog_id'] === current_user_blog_id) {
                        members_btn_list = members_btn_list + "<span class='btn-employment-invite'>" + i18n[lang].invite + "</span>";
                    }
                }
                temp = "<span>" + i18n[lang].invited_users + "</span>";
                temp = "<div class='employment-member-title'>" + members_btn_list + temp + "</div>";
                members_list = "<div class='employment-member-item-wrapper'>" + members_list + "</div>";
                members_wrapper = "<div class='employment-members-wrapper'>" + temp + members_list + "</div>";
            }
            writing_authority = "<div>" + writing_authority + " &#183; " + i18n[lang][written_language] + "</div>";
            written_employment_info = "<div class='written-employment-info'>" + writing_authority + members_wrapper + "</div>";
        }
        if (doc['type'] === 'apply_now') {
            if (doc['is_online_interview_set'] === true) {
                temp = "<a class='apply-online-interview' href='/apply-online-interview/" + doc['_id'] + "'>" + i18n[lang].apply_online_interview + "</a>";
                if (doc['is_start_set'] === true) {
                    if (doc['start_at'] > datetime) { /* Scheduled */
                        class_online_interview_status = "online-interview-scheduled";
                        online_interview_status = i18n[lang].online_interview + " " + i18n[lang].scheduled;
                        temp2 = "<div class='apply-online-interview-wrapper' style='display:none;'>" + temp + "</div>";
                    } else {
                        if (doc['is_finish_set'] === true) {
                            if (doc['finish_at'] > datetime) { /* In Progress */
                                class_online_interview_status = "online-interview-in-progress";
                                online_interview_status = i18n[lang].online_interview + " " + i18n[lang].in_progress;
                                temp2 = "<div class='apply-online-interview-wrapper'>" + temp + "</div>";
                            } else { /* Finished */
                                class_online_interview_status = "online-interview-finished";
                                online_interview_status = i18n[lang].online_interview + " " + i18n[lang].finished;
                                temp2 = "<div class='apply-online-interview-wrapper' style='display:none;'>" + temp + "</div>";
                            }
                        } else { /* Unlimited */
                            class_online_interview_status = "online-interview-unlimited";
                            online_interview_status = i18n[lang].online_interview + " " + i18n[lang].unlimited;
                            temp2 = "<div class='apply-online-interview-wrapper'>" + temp + "</div>";
                        }
                    }
                } else {
                    if (doc['is_finish_set'] === true) {
                        if (doc['finish_at'] > datetime) { /* In Progress */
                            class_online_interview_status = "online-interview-in-progress";
                            online_interview_status = i18n[lang].online_interview + " " + i18n[lang].in_progress;
                            temp2 = "<div class='apply-online-interview-wrapper'>" + temp + "</div>";
                        } else { /* Finished */
                            class_online_interview_status = "online-interview-finished";
                            online_interview_status = i18n[lang].online_interview + " " + i18n[lang].finished;
                            temp2 = "<div class='apply-online-interview-wrapper' style='display:none;'>" + temp + "</div>";
                        }
                    } else { /* Unlimited */
                        class_online_interview_status = "online-interview-unlimited";
                        online_interview_status = i18n[lang].online_interview + " " + i18n[lang].unlimited;
                        temp2 = "<div class='apply-online-interview-wrapper'>" + temp + "</div>";
                    }
                }
                written_online_interview_status = "<div class='online-interview-status " + class_online_interview_status + "' data-is-start-set='" + doc['is_start_set'] + "' data-start-at='" + doc['start_at'] + "' data-is-finish-set='" + doc['is_finish_set'] + "' data-finish-at='" + doc['finish_at'] + "' data-print-type='perfect'>" + online_interview_status + "</div>";
                written_online_interview_status = written_online_interview_status + temp2;
            } else {
                written_online_interview_status = "";
            }
        } else {
            written_online_interview_status = "";
        }
        temp_list = written_online_interview_status + company_info + written_employment_info;
        for (var i = 0; i < doc['tags'].length; i++) {
            temp = "<div class='written-tag'>" + methods.get_encoded_html_preventing_xss(doc['tags'][i]) + "</div>";
            temp_list = temp_list + "<a href='/search?w=tot&q=" + methods.encode_for_url(doc['tags'][i]) + "'>" + temp + "</a>";
        }
        written_top = "<div class='written-top'>" + temp_list + "</div>";
        var written_article_title = 'written-' + doc['type'] + '-title'
            , written_article_content = 'written-' + doc['type'] + '-content'
            , written_article = 'written-' + doc['type'];
        temp = "<div class='written-title " + written_article_title + "'>" + methods.get_encoded_html_preventing_xss(doc['title']) + "</div>";
        written_title_wrapper = "<div class='written-title-wrapper'>" + temp + "</div>";
        var user_profile_left
            , user_profile_right;
        temp = "<img src='" + doc['img'] + "' alt='" + methods.get_encoded_html_preventing_xss(doc['name']) + "' title='" + methods.get_encoded_html_preventing_xss(doc['name']) + "'>";
        temp = "<a href='/blog/" + doc['blog_id'] + "' target='_blank'>" + temp + "</a>";
        temp2 = "<div class='simple-profile-mouseentered-prompt'></div>";
        temp = "<div class='simple-profile-prompt-box in-written' data-link='/blog/" + doc['blog_id'] + "'>" + temp + temp2 + "</div>";
        user_profile_left = "<div class='user-profile-left'>" + temp + "</div>";
        if (is_loginned === true) {
            temp = "<span class='user-name'>" + methods.get_encoded_html_preventing_xss(doc['name']) + "</span>";
        } else {
            temp = "<span class='not-logged-in user-name'>" + methods.get_encoded_html_preventing_xss(doc['name']) + "</span>";
        }
        temp = "<a class='user-name-wrapper' href='/blog/" + doc['blog_id'] + "' target='_blank'>" + temp + "</a>";
        temp2 = "<div class='simple-profile-mouseentered-prompt'></div>";
        temp = "<div class='simple-profile-prompt-box in-written' data-link='/blog/" + doc['blog_id'] + "'>" + temp + temp2 + "</div>";
        temp2 = "<span class='separator'></span>";
        temp = "<div>" + temp + temp2 + "</div>";
        if (doc["created_at"] === doc["updated_at"]) {
            temp2 = "<div class='created-at' data-datetime='" + doc["created_at"] + "'></div>";
        } else {
            temp2 = "<div class='created-at' data-datetime='" + doc["created_at"] + "'></div>" +
                "<div class='updated-at' data-datetime='" + doc["updated_at"] + "'></div>";
        }
        temp2 = "<a class='updated-at-wrapper' href='" + data_link + "' target='_blank'>" + temp2 + "</a>";
        user_profile_right = "<div class='user-profile-right'>" + temp + temp2 + "</div>";
        user_profile = "<div class='user-profile'>" + user_profile_left + user_profile_right + "</div>";
        written_content = "<div class='written-content " + written_article_content + "'>" + doc['content'] + "</div>";
        var view_counts = ""
            , awesome_counts = ""
            , comments_counts = "";
        temp = "<img src='" + config.aws_s3_url + "/icons/view-selected.png" + css_version + "' title='" + i18n[lang].view + "' alt='" + i18n[lang].view + "'>";
        temp2 = "<span>" + methods.put_comma_between_three_digits(doc['count_view']) + "</span>";
        view_counts = "<div class='view-counts' data-count='" + (doc['count_view']) + "'>" + temp + temp2 + "</div>";
        var btn_awesome = ""
            , btn_online_interview = ""
            , btn_announcement = ""
            , btn_announcement_mobile = ""
            , btn_open_comments = ""
            , btn_open_comments_mobile = ""
            , btn_share_desktop = ""
            , btn_report_desktop = ""
            , btn_report_mobile = ""
            , btn_subscribe_desktop = ""
            , btn_subscribe_mobile = ""
            , btn_ellipsis_mobile = "";
        if (current_user_blog_id === null) {
            temp = "<img src='" + config.aws_s3_url + "/icons/awesome.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].awesome + "</span>";
            if (doc['count_awesome'] > 0) {
                real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_awesome']) + "</span>";
            } else {
                real_count = "<span class='real-count'></span>";
            }
            btn_awesome = "<div class='btn-awesome awesome-" + doc['type'] + "' data-count='" + doc['count_awesome'] + "'>" + temp + temp2 + real_count + "</div>";
        } else {
            var is_awesome = false;
            for (var i = 0; i < doc['likers'].length; i++) {
                if (current_user_blog_id === doc['likers'][i]) {
                    is_awesome = true;
                    break;
                }
            }
            if (doc['count_awesome'] > 0) {
                real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_awesome']) + "</span>";
            } else {
                real_count = "<span class='real-count'></span>";
            }
            if (is_awesome === true) {
                temp = "<img src='" + config.aws_s3_url + "/icons/awesome-selected.png" + css_version + "'>";
                temp2 = "<span>" + i18n[lang].awesome + "</span>";
                btn_awesome = "<div class='btn-awesome selected loginned awesome-" + doc['type'] + "'" +
                    " data-type='" + doc['type'] + "'" +
                    " data-blog-id='" + doc['blog_id'] + "'" +
                    " data-count='" + doc['count_awesome'] + "'" +
                    " data-id='" + doc['_id'] + "'>" + temp + temp2 + real_count + "</div>";
            } else {
                temp = "<img src='" + config.aws_s3_url + "/icons/awesome.png" + css_version + "'>";
                temp2 = "<span>" + i18n[lang].awesome + "</span>";
                btn_awesome = "<div class='btn-awesome loginned awesome-" + doc['type'] + "'" +
                    " data-type='" + doc['type'] + "'" +
                    " data-blog-id='" + doc['blog_id'] + "'" +
                    " data-count='" + doc['count_awesome'] + "'" +
                    " data-id='" + doc['_id'] + "'>" + temp + temp2 + real_count + "</div>";
            }
        }
        if (doc['type'] === 'apply_now') {
            if (doc['blog_id'] === current_user_blog_id && doc['is_online_interview_set'] === true) {
                if (doc['count_online_interview'] > 0) {
                    real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_online_interview']) + "</span>";
                } else {
                    real_count = "<span class='real-count'></span>";
                }
                temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/online-interview.png" + css_version + "'>";
                temp2 = "<span>" + i18n[lang].online_interview + "</span>";
                btn_online_interview = "<div class='btn-online-interview' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-count='" + doc['count_online_interview'] + "' data-is-modal='false'>" + temp + temp2 + real_count + "</div>";
                if (doc['count_announcement'] > 0) {
                    real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_announcement']) + "</span>";
                } else {
                    real_count = "<span class='real-count'></span>";
                }
                temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/announcement2.png" + css_version + "'>";
                temp2 = "<span>" + i18n[lang].announcement + "</span>";
                btn_announcement = "<div class='btn-announcement written-btn-desktop-only' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-blog-id='" + doc['blog_id'] + "' data-count='" + doc['count_announcement'] + "' data-is-modal='false'>" + temp + temp2 + real_count + "</div>";
                btn_announcement_mobile = "<li class='btn-announcement-mobile' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-blog-id='" + doc['blog_id'] + "' data-count='" + doc['count_announcement'] + "' data-is-modal='false'>" + temp + temp2 + real_count + "</li>";
            } else {
                if (doc['count_announcement'] > 0) {
                    real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_announcement']) + "</span>";
                } else {
                    real_count = "<span class='real-count'></span>";
                }
                temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/announcement2.png" + css_version + "'>";
                temp2 = "<span>" + i18n[lang].announcement + "</span>";
                btn_announcement = "<div class='btn-announcement' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-blog-id='" + doc['blog_id'] + "' data-count='" + doc['count_announcement'] + "' data-is-modal='false'>" + temp + temp2 + real_count + "</div>";
            }
            if (doc['count_comments'] > 0) {
                real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_comments']) + "</span>";
            } else {
                real_count = "<span class='real-count'></span>";
            }
            temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/comments.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].comments + "</span>";
            btn_open_comments = "<div class='btn-open-comments written-btn-desktop-only' data-type='" + doc['type'] + "' data-count='" + doc['count_comments'] + "'>" + temp + temp2 + real_count + "</div>";
            btn_open_comments_mobile = "<li class='btn-open-comments-mobile' data-type='" + doc['type'] + "' data-count='" + doc['count_comments'] + "'>" + temp + temp2 + real_count + "</li>";
            temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/share2.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].share + "</span>";
            btn_share_desktop = "<div class='btn-share-desktop written-btn-desktop-only'>" + temp + temp2 + "</div>";
        } else {
            if (doc['count_comments'] > 0) {
                real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_comments']) + "</span>";
            } else {
                real_count = "<span class='real-count'></span>";
            }
            temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/comments.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].comments + "</span>";
            btn_open_comments = "<div class='btn-open-comments' data-type='" + doc['type'] + "' data-count='" + doc['count_comments'] + "'>" + temp + temp2 + real_count + "</div>";
            btn_share_desktop = "";
        }
        if (current_user_blog_id !== null) {
            temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/report.png" + css_version + "'>";
            temp = temp + "<span>" + i18n[lang].report + "</span>";
            btn_report_desktop = "<div class='btn-report-desktop written-btn-desktop-only report-article' data-type='" + doc['type'] + "'>" + temp + "</div>";
            btn_report_mobile = "<li class='btn-report-mobile report-article' data-type='" + doc['type'] + "'>" + temp + "</li>";
        } else {
            btn_report_desktop = "";
            btn_report_mobile = "";
        }
        if (current_user_blog_id !== null) {
            var is_subscribed = false;
            for (var i = 0; i < doc['subscribers'].length; i++) {
                if (current_user_blog_id === doc['subscribers'][i]) {
                    is_subscribed = true;
                    break;
                }
            }
            if (is_subscribed === true) {
                temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/subscription-selected.png" + css_version + "'>";
                temp = temp + "<span>" + i18n[lang].subscription + " ✔" + "</span>";
                btn_subscribe_desktop = "<div class='btn-unsubscribe-desktop written-btn-desktop-only'" +
                    " data-type='" + doc['type'] + "'" +
                    " data-blog-id='" + doc['blog_id'] + "'" +
                    " data-id='" + doc['_id'] + "'>" + temp + "</div>";
                btn_subscribe_mobile = "<li class='btn-unsubscribe-mobile'" +
                    " data-type='" + doc['type'] + "'" +
                    " data-blog-id='" + doc['blog_id'] + "'" +
                    " data-id='" + doc['_id'] + "'>" + temp + "</li>";
            } else {
                temp = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/subscription.png" + css_version + "'>";
                temp = temp + "<span>" + i18n[lang].subscription + "</span>";
                btn_subscribe_desktop = "<div class='btn-subscribe-desktop written-btn-desktop-only'" +
                    " data-type='" + doc['type'] + "'" +
                    " data-blog-id='" + doc['blog_id'] + "'" +
                    " data-id='" + doc['_id'] + "'>" + temp + "</div>";
                btn_subscribe_mobile = "<li class='btn-subscribe-mobile'" +
                    " data-type='" + doc['type'] + "'" +
                    " data-blog-id='" + doc['blog_id'] + "'" +
                    " data-id='" + doc['_id'] + "'>" + temp + "</li>";
            }
        } else {
            btn_subscribe_desktop = "";
            btn_subscribe_mobile = "";
        }
        temp = "<img src='" + config.aws_s3_url + "/icons/ellipsis-grey.png" + css_version + "' class='btn-ellipsis-mobile-img'>";
        if (doc['type'] === 'apply_now') {
            temp2 = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/share2.png" + css_version + "'>";
            temp2 = temp2 + "<span>" + i18n[lang].share + "</span>";
            temp2 = "<li class='btn-share-mobile'>" + temp2 + "</li>";
        } else {
            temp2 = "";
        }
        temp2 = "<ul style='display:none;'>" + btn_announcement_mobile + btn_open_comments_mobile + btn_subscribe_mobile + btn_report_mobile + temp2 + "</ul>";
        btn_ellipsis_mobile = "<div class='btn-ellipsis-mobile'>" + temp + temp2 + "</div>";
        written_btns_wrapper = "<div class='written-btns-wrapper'>" +
            view_counts + btn_awesome + btn_online_interview + btn_announcement + btn_open_comments +
            btn_share_desktop + btn_report_desktop + btn_subscribe_desktop + btn_ellipsis_mobile + "</div>";
        comments_wrapper = "<div class='comments-wrapper outer-comments'></div>";
        if (doc['type'] === 'apply_now' && doc['blog_id'] === current_user_blog_id) {
            write_announcement_wrapper = "<div class='write-announcement-wrapper'></div>";
        } else {
            write_announcement_wrapper = "";
        }
        if (doc['type'] === 'apply_now') {
            temp2 = "<div id='announcement-list'></div>";
            temp3 = "<div id='announcement-more' class='btn-more list-more'><img class='btn-more-down-14' src='" + config.aws_s3_url + "/icons/more-down.png" + css_version + "'></div>";
            announcement_wrapper = "<div class='announcement-wrapper'>" + temp2 + temp3 + "</div>";
        } else {
            announcement_wrapper = "";
        }
        if (doc['type'] === 'apply_now' && doc['blog_id'] === current_user_blog_id) {
            temp2 = "<div id='answer-list'></div>";
            temp3 = "<div id='answer-more' class='btn-more list-more'><img class='btn-more-down-14' src='" + config.aws_s3_url + "/icons/more-down.png" + css_version + "'></div>";
            answer_wrapper = "<div class='answer-wrapper'>" + temp2 + temp3 + "</div>";
        } else {
            answer_wrapper = "";
        }
        var article_class = doc['type'] + "-" + doc['_id'];
        var written = "<div id='" + id + "' class='written " + written_article + " " + article_class +
            "' data-link='" + data_link +
            "' data-created-at='" + data_created_at +
            "' data-updated-at='" + data_updated_at +
            "' data-type='" + doc['type'] +
            "' data-lang='" + doc['language'] +
            "' data-blog-id='" + doc['blog_id'] +
            "' data-id='" + doc['_id'] +
            "' data-class='" + article_class +
            "' data-print-type='perfect" +
            "'>" +
            edit +
            written_top +
            written_title_wrapper +
            user_profile +
            written_content +
            written_link +
            written_btns_wrapper +
            comments_wrapper +
            write_announcement_wrapper +
            announcement_wrapper +
            answer_wrapper +
            "</div>";
        return written;
    },
    get_single_online_interview_form: function (lang, doc, is_loginned, current_user_blog_id) {
        var css_version = config["css_version"]
            , question_item = ""
            , question
            , type_html
            , min_height
            , temp
            , span
            , div
            , content
            , maximum_length
            , maximum_length_wrapper
            , textarea
            , textarea_wrapper
            , btn_wrapper
            , btn
            , choice_list = ""
            , choice_item
            , label
            , choice_index_wrapper
            , choice_index
            , choice
            , choice_inner
            , choice_radio_wrapper
            , input
            , form;
        btn = "<input class='btn-career apply-online-interview-submit' type='button' value='" + i18n[lang].check + "'>";
        btn_wrapper = "<div class='btn-career-wrapper'>" + btn + "</div>";
        for (var i = 0; i < doc.questions.length; i++ ) {
            span = "<span class='question-label'>" + i18n[lang].question + " " + (i + 1) + "</span>";
            question = "<div class='online-interview-question'>" + methods.get_encoded_html_preventing_xss(doc.questions[i].question) +  "</div>";
            div = "<div>" + span + "</div>";
            if (doc.questions[i].type === "short_answer") {
                type_html = "short-answer";
                min_height = 100 + Math.floor(doc.questions[i].max_length / 2);
                textarea = "<textarea class='apply-online-interview-textarea' style='min-height:" + min_height + "px;'></textarea>";
                textarea_wrapper = "<div class='apply-online-interview-textarea-wrapper'>" + textarea + "</div>";
                maximum_length = "<div class='answer-maximum-length' data-max-length='" + doc.questions[i].max_length + "'>0 / " + doc.questions[i].max_length + "</div>";
                maximum_length_wrapper = "<div class='answer-maximum-length-wrapper'>" + maximum_length + "</div>";
                content = "<div class='apply-online-interview-content'>" + textarea_wrapper + maximum_length_wrapper + "</div>";
            } else {
                type_html = "multiple-choice";
                content = "";
                for (var j=0; j < doc.questions[i].choices.length; j++) {
                    choice_index = "<div class='apply-online-interview-choice-index'>" + (j+1) + "</div>";
                    choice_index_wrapper = "<div class='apply-online-interview-choice-index-wrapper'>" + choice_index + "</div>";
                    choice_inner = "<div style='width:100%;'>" + methods.get_encoded_html_preventing_xss(doc.questions[i].choices[j].choice) + "</div>";
                    choice = "<div class='apply-online-interview-choice'>" + choice_inner + "</div>";
                    input = "<input data-id='" + doc.questions[i].choices[j]._id + "' class='apply-online-interview-choice-radio' type='radio' name='online-interview-question-" + (i+1) + "-" + doc.questions[i]._id + "'>";
                    choice_radio_wrapper = "<div class='apply-online-interview-choice-radio-wrapper'>" + input + "</div>";
                    label = "<label class='apply-online-interview-choice-item-table'>" + choice_index_wrapper + choice + choice_radio_wrapper + "</label>";
                    choice_item = "<div class='apply-online-interview-choice-item'>" + label + "</div>";
                    content = content + choice_item;
                }
                content = "<div class='apply-online-interview-choice-list'>" + content + "</div>";
            }
            question_item = question_item + "<div class='apply-online-interview-question-item' data-type='" + type_html + "' data-id='" + doc.questions[i]._id + "' data-name='online-interview-question-" + (i+1) + "-" + doc.questions[i]._id + "'>" + div + question + content + "</div>";
        }
        form = "<form class='apply-online-interview-form'>" + question_item + btn_wrapper + "</form>";
        return form;
    },
    get_single_perfect_online_interview: function (lang, doc, is_loginned, current_user_blog_id) {
        var css_version = config["css_version"];
        return "";
    },
    get_single_article_comment: function (lang, obj, doc, current_user_blog_id) {
        var li1 = ""
            , div1
            , div2
            , div3
            , div4
            , div5
            , div6
            , div7
            , div8
            , div9
            , div10
            , div11
            , a1
            , a2
            , a3
            , span1
            , span2
            , real_count
            , comment_input
            , comment_input_btns_wrapper
            , comment_input_wrapper = ""
            , type = obj["type"]
            , comment_type = obj["comment_type"]
            , link = obj["link"]
            , is_loginned = obj["is_loginned"]
            , css_version = config.css_version
            , is_awesome = false
            , awesome_small_img
            , awesome_selected_small_img
            , comments_small_img
            , aws_s3_url = config.aws_s3_url;
        if (lang === undefined) {
            lang = "en";
        }
        awesome_small_img = "<img src='" + aws_s3_url + "/icons/awesome.png" + css_version + "'>";
        awesome_selected_small_img = "<img src='" + aws_s3_url + "/icons/awesome-selected.png" + css_version + "'>";
        comments_small_img = "<img src='" + aws_s3_url + "/icons/comments.png" + css_version + "'>";
        if (is_loginned === true) {
            comment_input = "<textarea class='edit-comment-input'></textarea>";
            comment_input = "<div class='edit-comment-middle'>" + comment_input + "</div>";
            comment_input_btns_wrapper = "<div class='edit-comment-form-btns-wrapper'><input class='btn-career edit-comment-cancel' type='button' value='" + i18n[lang].cancel + "'><input class='btn-career edit-comment-submit' type='submit' value='" + i18n[lang].check + "'></div>";
            comment_input_wrapper = "<form class='edit-comment-form'>" + comment_input + comment_input_btns_wrapper + "</form>";
            for (var i = 0; i < doc['likers'].length; i++) {
                if (current_user_blog_id === doc['likers'][i]) {
                    is_awesome = true;
                    break;
                }
            }
        } else {
            doc['name'] = "Gleant";
            if (doc.img.indexOf && doc.img.indexOf( "male.png") <= -1) {
                doc.img = aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
            }
        }
        div2 = "<div class='comment-content'>" + methods.get_encoded_html_preventing_xss(doc["comment"]) + "</div>";
        div8 = "<div class='created-at-small' data-datetime='" + doc["created_at"] + "'></div>";
        if (comment_type === 1) {
            div4 = "<div class='comments-wrapper inner-comments'></div>";
            if (doc['count_comments'] > 0) {
                real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_comments']) + "</span>";
            } else {
                real_count = "<span class='real-count'></span>";
            }
            div10 = "<div class='btn-open-comments-small' data-type='" + type + "' data-count='" + doc["count_comments"] + "'>" + comments_small_img + i18n[lang].comments + real_count + "</div>";
            if (is_loginned === true) {
                if (type ==="guestbook") {
                    div9 = "";
                } else {
                    if (doc['count_awesome'] > 0) {
                        real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_awesome']) + "</span>";
                    } else {
                        real_count = "<span class='real-count'></span>";
                    }
                    if (is_awesome === true) {
                        div9 = "<div class='btn-awesome-small selected loginned awesome-comment'" +
                            " data-id='" + doc['_id'] + "'" +
                            " data-type='" + doc['type'] + "'" +
                            " data-root-id='" + doc['root_id'] + "'" +
                            " data-link='" + doc['link'] + "'" +
                            " data-count='" + doc['count_awesome'] + "'" +
                            " data-blog-id='" + doc['blog_id'] + "'>" + awesome_selected_small_img + "<span>" + i18n[lang].awesome + "</span>" + real_count + "</div>";
                    } else {
                        div9 = "<div class='btn-awesome-small loginned awesome-comment'" +
                            " data-id='" + doc['_id'] + "'" +
                            " data-type='" + doc['type'] + "'" +
                            " data-root-id='" + doc['root_id'] + "'" +
                            " data-link='" + doc['link'] + "'" +
                            " data-count='" + doc['count_awesome'] + "'" +
                            " data-blog-id='" + doc['blog_id'] + "'>" + awesome_small_img + "<span>" + i18n[lang].awesome + "</span>" + real_count + "</div>";
                    }
                }
                if (type === "blog" || type === "gallery" || type === "guestbook") {
                    div11 = "";
                } else {
                    div11 = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/report.png" + css_version + "'>";
                    div11 = div11 + "<span>" + i18n[lang].report + "</span>";
                    div11 = "<div class='btn-report-small report-comment'>" + div11 + "</div>";
                }
            } else {
                if (type ==="guestbook") {
                    div9 = "";
                } else {
                    if (doc['count_awesome'] > 0) {
                        real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_awesome']) + "</span>";
                    } else {
                        real_count = "<span class='real-count'></span>";
                    }
                    div9 = "<div class='btn-awesome-small awesome-comment' data-count='" + doc['count_awesome'] + "'>" + awesome_small_img + "<span>" + i18n[lang].awesome + "</span>" + real_count + "</div>";
                }
                div11 = "";
            }
            if (type === "deep") {
                a3 = "<div class='updated-at-wrapper'>" + div8 + "</div>";
            } else {
                a3 = "<a class='updated-at-wrapper' href='" + link + "?comment=" + doc["_id"] + "' target='_blank'>" + div8 + "</a>";
            }
        } else {
            div4 = "";
            div10 = "";
            if (is_loginned === true) {
                if (type ==="guestbook") {
                    div9 = "";
                } else {
                    if (doc['count_awesome'] > 0) {
                        real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_awesome']) + "</span>";
                    } else {
                        real_count = "<span class='real-count'></span>";
                    }
                    if (is_awesome === true) {
                        div9 = "<div class='btn-awesome-small selected loginned awesome-inner-comment'" +
                            " data-id='" + doc['_id'] + "'" +
                            " data-type='" + doc['type'] + "'" +
                            " data-root-id='" + doc['root_id'] + "'" +
                            " data-link='" + doc['link'] + "'" +
                            " data-count='" + doc['count_awesome'] + "'" +
                            " data-blog-id='" + doc['blog_id'] + "'>" + awesome_selected_small_img + "<span>" + i18n[lang].awesome + "</span>" + real_count + "</div>";
                    } else {
                        div9 = "<div class='btn-awesome-small loginned awesome-inner-comment'" +
                            " data-id='" + doc['_id'] + "'" +
                            " data-type='" + doc['type'] + "'" +
                            " data-root-id='" + doc['root_id'] + "'" +
                            " data-link='" + doc['link'] + "'" +
                            " data-count='" + doc['count_awesome'] + "'" +
                            " data-blog-id='" + doc['blog_id'] + "'>" + awesome_small_img + "<span>" + i18n[lang].awesome + "</span>" + real_count + "</div>";
                    }
                }
                if (type === "blog" || type === "gallery" || type === "guestbook") {
                    div11 = "";
                } else {
                    div11 = "<img class='emoticon-img2' src='" + config.aws_s3_url + "/icons/report.png" + css_version + "'>";
                    div11 = div11 + "<span>" + i18n[lang].report + "</span>";
                    div11 = "<div class='btn-report-small report-inner-comment'>" + div11 + "</div>";
                }
            } else {
                if (type ==="guestbook") {
                    div9 = "";
                } else {
                    if (doc['count_awesome'] > 0) {
                        real_count = "<span class='real-count'>" + methods.put_comma_between_three_digits(doc['count_awesome']) + "</span>";
                    } else {
                        real_count = "<span class='real-count'></span>";
                    }
                    div9 = "<div class='btn-awesome-small awesome-inner-comment' data-count='" + doc['count_awesome'] + "'>" + awesome_small_img + "<span>" + i18n[lang].awesome + "</span>" + real_count + "</div>";
                }
                div11 = "";
            }
            if (type === "deep") {
                a3 = "<div class='updated-at-wrapper'>" + div8 + "</div>";
            } else {
                a3 = "<a class='updated-at-wrapper' href='" + link + "?comment=" + doc["outer_id"] + "&inner_comment=" + doc["_id"] + "' target='_blank'>" + div8 + "</a>";
            }
        }
        div3 = "<div class='comment-btns-wrapper'>" + div9 + div10 + div11 + "</div>";
        if (is_loginned === true) {
            span1 = "<span class='user-name'>" + methods.get_encoded_html_preventing_xss(doc["name"]) + "</span>";
        } else {
            span1 = "<span class='user-name not-logged-in'>" + methods.get_encoded_html_preventing_xss(doc["name"]) + "</span>";
        }
        a2 = "<a class='user-name-wrapper' href='/blog/" + doc["blog_id"] + "' target='_blank'>" + span1 + "</a>";
        div7 = "<div>" + a2 + "</div>";
        div6 = "<div class='user-profile-right-small'>" + div7 + a3 + "</div>";
        img1 = "<img src='" + doc["img"] + "' alt='" + methods.get_encoded_html_preventing_xss(doc["name"]) +
            "' title='" + methods.get_encoded_html_preventing_xss(doc["name"]) + "'>";
        a1 = "<a href='/blog/" + doc["blog_id"] + "' target='_blank'>" + img1 + "</a>";
        div5 = "<div class='user-profile-left-small'>" + a1 +  "</div>";
        div1 = "<div class='user-profile-small'>" + div5 + div6 +"</div>";
        var comment_remove = ""
            , comment_edit = "";
        if (current_user_blog_id !== null && current_user_blog_id === doc['blog_id']) {
            comment_remove = "<div class='remove comment-remove'>" + i18n[lang].remove + "</div>";
            comment_edit = "<div class='edit comment-edit'>" + i18n[lang].edit + "</div>";
        }
        if (comment_type === 1) {
            li1 = "<li class='comment'" +
                " data-id='" + doc["_id"] + "'" +
                " data-type='" + doc["type"] + "'" +
                " data-link='" + doc["link"] + "'" +
                " data-comment-type='" + doc["comment_type"] + "'" +
                " data-blog-id='" + doc["blog_id"] + "'" +
                " data-created-at='" + doc["created_at"] + "'>" +
                comment_remove + comment_edit +
                div1 + div2 + comment_input_wrapper + div3 + div4 + "</li>";
        } else {
            li1 = "<li class='comment'" +
                " data-id='" + doc["_id"] + "'" +
                " data-type='" + doc["type"] + "'" +
                " data-link='" + doc["link"] + "'" +
                " data-outer-id='" + doc["outer_id"] + "'" +
                " data-comment-type='" + doc["comment_type"] + "'" +
                " data-blog-id='" + doc["blog_id"] + "'" +
                " data-created-at='" + doc["created_at"] + "'>" +
                comment_remove + comment_edit +
                div1 + div2 + comment_input_wrapper + div3 + div4 +
                "</li>";
        }
        return li1;
    },
    get_single_perfect_news_with_comments: function (lang, doc, comments, is_loginned, user) {
        var css_version = config["css_version"]
            , user_img
            , user_name
            , news_info
            , news_site
            , news_title
            , news_item_counts_wrapper
            , write_news_comment_form
            , write_news_comment_form_data
            , news_comment_list
            , news_comment_more
            , news_comment_none
            , final
            , img
            , span1
            , div1
            , div2
            , div3;
        if (doc === null) {
            return "";
        } else {
            if (user !== null) {
                user_img = user.img;
                user_name = methods.get_encoded_html_preventing_xss(user.name);
            }
            if (is_loginned === false) {
                user_name = "Gleant";
                user_img = config.aws_s3_url + "/icons/logo-square.png";
            }
            write_news_comment_form_data = "data-type='" + doc.type + "'" +
                " data-link='" + doc.link + "'" +
                " data-comment-type='1'";
            news_site = "<div class='news-site'>" + methods.get_encoded_html_preventing_xss(doc.site) + "</div>";
            news_title = "<a class='news-title' href='" + doc.link + "' data-type='" + doc.type + "'>" + methods.get_encoded_html_preventing_xss(doc.title) + "</a>";
            img = "<img src='" + config.aws_s3_url + "/icons/view-selected.png" + css_version + "' title='" + i18n[lang].view + "' alt='" + i18n[lang].view + "'>";
            span1 = "<span>" + methods.put_comma_between_three_digits(doc.count_view) +  "</span>";
            div1 = "<div class='view-counts'>" + img + span1 + "</div>";
            img = "<img src='" + config.aws_s3_url + "/icons/comments-green.png" + css_version + "' title='" + i18n[lang].comments + "' alt='" + i18n[lang].comments + "'>";
            span1 = "<span>" + methods.put_comma_between_three_digits(doc.count_comments) +  "</span>";
            div2 = "<div class='comments-counts'>" + img + span1 + "</div>";
            news_item_counts_wrapper = "<div class='news-item-counts-wrapper'>" + div1 + div2 + "</div>";
            news_info = "<div class='news-info'>" + news_site + news_title + news_item_counts_wrapper + "</div>";
            img = "<img src='" + user_img + "' alt='" + user_name + "' title='" + user_name + "'>";
            span1 = "<span class='write-comment-name'>" + user_name + "</span>";
            div1 = "<div class='write-comment-top'>" + img + span1 + "</div>";
            if (is_loginned === true) {
                div2 = "<div class='write-comment-middle'><textarea class='write-comment-input' placeholder=''></textarea></div>";
            } else {
                div2 = "<div class='write-comment-middle'><textarea class='write-comment-input' placeholder='" + i18n[lang].please_login + "'></textarea></div>";
            }
            div3 = "<div class='write-comment-bottom'><input class='btn-career write-comment-submit' type='submit' value='" + i18n[lang].check + "'></div>";
            write_news_comment_form = "<form class='write-comment-form'" + write_news_comment_form_data + ">" + div1 + div2 + div3 + "</form>";
            img = "<img class='btn-more-down-14' src='" + config.aws_s3_url + "/icons/more-down.png" + css_version + "'>";
            if (comments.length === 0) {
                news_comment_list = "<ul class='news-comment-list comments'></ul>";
                news_comment_none = "<div class='news-comment-none' style='display:block;'>" + i18n[lang].there_is_no_comment + "</div>";
                news_comment_more = "";
            } else {
                news_comment_list = "";
                for (var i = 0; i < comments.length; i++) {
                    if (is_loginned === true && user !== null) {
                        news_comment_list = news_comment_list + this.get_single_article_comment(lang, {type: comments[i].type, comment_type: 1, link: comments[i].link, is_loginned: is_loginned}, comments[i], user.blog_id);
                    } else {
                        news_comment_list = news_comment_list + this.get_single_article_comment(lang, {type: comments[i].type, comment_type: 1, link: comments[i].link, is_loginned: is_loginned}, comments[i], null);
                    }
                }
                news_comment_list = "<ul class='news-comment-list comments'>" + news_comment_list + "</ul>";
                news_comment_none = "<div class='news-comment-none'></div>";
                if (comments.length < limit["comments"]) {
                    news_comment_more = "";
                } else {
                    news_comment_more = "<div class='news-comment-more btn-more'>" + img + "</div>";
                }
            }
            final = news_info + write_news_comment_form + news_comment_list + news_comment_none + news_comment_more;
            return final;
        }
    },
    get_news_list : function (lang, category, final) {
        var is_empty = true
            , css_version = config.css_version
            , aws_s3_url = config.aws_s3_url
            , result = ""
            , title
            , news_single_item
            , span
            , news_site
            , a
            , li
            , li_list = ""
            , news_category_box
            , news_category_box_title
            , news_category_box_content;
        if (category === undefined) {
            for (var key in final) {
                is_empty = false;
                li_list = "";
                if (final[key].length > 0) {
                    for (var i = 0; i < final[key].length; i++) {
                        title = methods.get_encoded_html_preventing_xss(final[key][i].title);
                        span = "<span>" + title + "</span>";
                        news_site = "<span class='news-site'>" + methods.get_encoded_html_preventing_xss(final[key][i].site) + "</span>";
                        news_single_item = "<div class='news-single-item'>" + span + news_site + "</div>";
                        a = "<a class='news-article' href='" + final[key][i].link + "' alt='" + title + "' title='" + title + "'>" + news_single_item + "</a>";
                        li = "<li>" + a + "</li>";
                        li_list = li_list + li;
                    }
                    news_category_box_title = "<div class='news-category-box-title'>" + i18n[lang][key] + "</div>";
                    news_category_box_content = "<ul class='news-category-box-content'>" + li_list + "</ul>";
                    news_category_box = "<div class='news-category-box'>" + news_category_box_title + news_category_box_content + "</div>";
                    result = result + news_category_box;
                }
            }
            if (is_empty === true) {
                return "";
            }
        } else {
            if (final.length > 0) {
                for (var i = 0; i < final.length; i++) {
                    if (i % 5 === 0) {
                        li_list = "";
                    }
                    title = methods.get_encoded_html_preventing_xss(final[i].title);
                    span = "<span>" + title + "</span>";
                    news_site = "<span class='news-site'>" + methods.get_encoded_html_preventing_xss(final[i].site) + "</span>";
                    news_single_item = "<div class='news-single-item'>" + span + news_site + "</div>";
                    a = "<a class='news-article' href='" + final[i].link + "' alt='" + title + "' title='" + title + "'>" + news_single_item + "</a>";
                    li = "<li>" + a + "</li>";
                    li_list = li_list + li;
                    if (i % 5 === 4) {
                        news_category_box_content = "<ul class='news-category-box-content'>" + li_list + "</ul>";
                        news_category_box = "<div class='news-category-box'>" + news_category_box_content + "</div>";
                        result = result + news_category_box;
                    }
                }
            }
        }
        return result;
    },
    get_single_my_premium_link_perfect: function (lang, doc) {
        var css_version = config["css_version"];
        var _class = doc.blog_id + "-" + doc.pl_id
            , temp
            , span
            , select
            , img
            , input
            , textarea
            , label;
        var my_premium_link_remove = "<div class='remove my-premium-link-remove'>" + i18n[lang].remove + "</div>";
        var my_premium_link_edit = "<div class='edit my-premium-link-edit'>" + i18n[lang].edit + "</div>";
        var my_premium_link_item_power;
        if (doc.is_sleeping === true) { /* When Goint is 0.. */
            if (doc.is_on === true) {
                my_premium_link_item_power = "<div class='my-premium-link-item-power'>On</div>";
            } else {
                my_premium_link_item_power = "<div class='my-premium-link-item-power'>Off</div>";
            }
        } else {
            if (doc.is_on === true) {
                my_premium_link_item_power = "<div class='my-premium-link-item-power on'>On</div>";
            } else {
                my_premium_link_item_power = "<div class='my-premium-link-item-power off'>Off</div>";
            }
        }
        var selected_language, language_options;
        if (doc.language === "en") {
            selected_language = i18n[lang].english;
            language_options = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        } else if (doc.language === "ja") {
            selected_language = i18n[lang].japanese;
            language_options = "<option class='lang-ja' value='ja' selected='selected'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
        } else if (doc.language === "ko") {
            selected_language = i18n[lang].korean;
            language_options = "<option class='lang-ko' value='ko' selected='selected'>" + i18n[lang].korean + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        } else if (doc.language === "zh-Hans") {
            selected_language = i18n[lang].simplified_chinese;
            language_options = "<option class='lang-zh-Hans' value='zh-Hans' selected='selected'>" + i18n[lang].simplified_chinese + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
        }
        var my_premium_link_item_language = "<div class='my-premium-link-item-language' data-language='" + doc.language + "'>" + selected_language + "</div>";
        var my_premium_link_item_title = "<div class='my-premium-link-item-title'>" + methods.get_encoded_html_preventing_xss(doc.title) + "</div>";
        var my_premium_link_item_description = "<div class='my-premium-link-item-description'>" + methods.get_encoded_html_preventing_xss(doc.description) + "</div>";
        var my_premium_link_item_link = "<div class='my-premium-link-item-link'>" + methods.get_encoded_html_preventing_xss(doc.link) + "</div>";

        var my_premium_link_item_content = "<div class='my-premium-link-item-content'>" + my_premium_link_item_language + my_premium_link_item_title + my_premium_link_item_description + my_premium_link_item_link + "</div>";

        var my_premium_link_item_keywords = "<div class='my-premium-link-item-keywords selected'>" + i18n[lang].keywords +  "</div>";
        var my_premium_link_item_expenditure_history = "<div class='my-premium-link-item-expenditure-history'>" + i18n[lang].expenditure_history + "</div>";
        var my_premium_link_item_bottom_menu = "<div class='my-premium-link-item-bottom-menu'>" + my_premium_link_item_keywords + my_premium_link_item_expenditure_history + "</div>";

        var my_premium_link_item_keyword_list = "";
        for (var i = 0; i < doc.keywords.length; i++) {
            temp = "<div class='my-premium-link-item-keyword'>" + methods.get_encoded_html_preventing_xss(doc.keywords[i]) + "</div>";
            my_premium_link_item_keyword_list = my_premium_link_item_keyword_list + temp;
        }

        var my_premium_link_item_keywords_box = "<div class='my-premium-link-item-keywords-box'>" + my_premium_link_item_keyword_list + "</div>";

        var my_premium_link_item_expenditure_history_left = "<div class='my-premium-link-item-expenditure-history-left'>" + i18n[lang].date + "</div>";
        var my_premium_link_item_expenditure_history_right1 = "<div class='my-premium-link-item-expenditure-history-right1'>" + i18n[lang].exposure + "</div>";
        var my_premium_link_item_expenditure_history_right2 = "<div class='my-premium-link-item-expenditure-history-right2'>" + i18n[lang].click + "</div>";
        var my_premium_link_item_expenditure_history_right3 = "<div class='my-premium-link-item-expenditure-history-right3'>" + i18n[lang].total_cost + "</div>";
        var my_premium_link_item_expenditure_history_right_inner = "<div class='my-premium-link-item-expenditure-history-right-inner'>" + my_premium_link_item_expenditure_history_right1 + my_premium_link_item_expenditure_history_right2 + my_premium_link_item_expenditure_history_right3 +"</div>";
        var my_premium_link_item_expenditure_history_right = "<div class='my-premium-link-item-expenditure-history-right'>" + my_premium_link_item_expenditure_history_right_inner + "</div>";

        var my_premium_link_item_expenditure_history_top = "<div class='my-premium-link-item-expenditure-history-top'>" + my_premium_link_item_expenditure_history_left + my_premium_link_item_expenditure_history_right + "</div>";
        var my_premium_link_item_expenditure_history_item_list = "<div class='my-premium-link-item-expenditure-history-item-list'></div>";
        span = "";
        img = "<img class='btn-more-down-14' src='" + config.aws_s3_url + "/icons/more-down.png" + css_version + "'>";
        var my_premium_link_item_expenditure_history_item_more = "<div class='my-premium-link-item-expenditure-history-item-more'>" + span + img + "</div>";
        var my_premium_link_item_expenditure_history_box = "<div class='my-premium-link-item-expenditure-history-box' style='display:none;'>" + my_premium_link_item_expenditure_history_top + my_premium_link_item_expenditure_history_item_list + my_premium_link_item_expenditure_history_item_more + "</div>";

        var my_premium_link_item_written = "<div class='my-premium-link-item-written' data-blog-id='" + doc.blog_id + "' data-pl-id='" + doc.pl_id + "'>" + my_premium_link_remove + my_premium_link_edit + my_premium_link_item_power + my_premium_link_item_content + my_premium_link_item_bottom_menu + my_premium_link_item_keywords_box + my_premium_link_item_expenditure_history_box + "</div>";

        span = "<span>" + i18n[lang].language + "</span>";
        select = "<select class='premium-link-selected-language'>" + language_options + "</select>";
        label = "<label style='display:inline-block;margin-left:10px;'>" + span + select + "</label>";

        var my_premium_link_item_editing_inner_list = "";
        var premium_link_selected_language_wrapper = "<div class='premium-link-selected-language-wrapper'>" + label + "</div>";
        my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + premium_link_selected_language_wrapper;

        span = "<span class='premium-link-label'>" + i18n[lang].title + "</span>";
        input = "<input class='premium-link-editing-title' type='text' value=''>";
        label = "<label class='m-b-10'>" + span + input + "</label>";
        my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + label;

        span = "<span class='premium-link-label'>" + i18n[lang].explanation + "</span>";
        textarea = "<textarea class='premium-link-editing-explanation-textarea'>" + "</textarea>";
        var premium_link_editing_explanation = "<div class='premium-link-editing-explanation'>" + textarea + "</div>";
        label = "<label class='m-b-10'>" + span + premium_link_editing_explanation + "</label>";
        my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + label;

        span = "<span class='premium-link-label'>" + i18n[lang].link + "</span>";
        var option_list = "";
        /* Check protocol of link */
        if (doc.link[4] === "s") { /* https */
            option_list = "<option value='https' selected='selected'>https://</option><option value='http'>http://</option>";
        } else { /* http */
            option_list = "<option value='http' selected='selected'>http://</option><option value='https'>https://</option>";
        }
        select = "<select class='premium-link-editing-link-select'>" + option_list + "</select>";
        var premium_link_editing_link_left = "<div class='premium-link-editing-link-left'>" + select + "</div>";
        input = "<input class='premium-link-editing-link-input' type='url'>";
        var premium_link_editing_link_right = "<div class='premium-link-editing-link-right'>" + input + "</div>";
        var premium_link_editing_link = "<div class='premium-link-editing-link'>" + premium_link_editing_link_left + premium_link_editing_link_right + "</div>";
        var m_b_10 = "<div class='m-b-10'>" + span + premium_link_editing_link + "</div>";
        my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + m_b_10;

        span = "<span class='premium-link-label'>" + i18n[lang].search_keywords + "</span>";
        input = "<input class='premium-link-search-input' type='text'>";
        var premium_link_search_input_box = "<div class='premium-link-search-input-box'>" + input + "</div>";
        var btn_premium_link_search = "<div class='btn-premium-link-search'>" + i18n[lang].search + "</div>";
        var premium_link_search_wrapper = "<div class='premium-link-search-wrapper'>" + premium_link_search_input_box + btn_premium_link_search + "</div>";
        m_b_10 = "<div>" + span + premium_link_search_wrapper + "</div>";
        my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + m_b_10;


        var premium_link_searched_keyword_list = "<div class='premium-link-searched-keyword-list'></div>";
        my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + premium_link_searched_keyword_list;

        span = "<span class='num-of-my-premium-link-keywords' data-count='" + doc.keywords.length + "'>" + doc.keywords.length + " / 10</span>";
        temp = "<span class='premium-link-label'>" + i18n[lang].selected_keywords + "</span>";
        m_b_10 = "<div>" + span + temp + "</div>";
        my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + m_b_10;

        var premium_link_selected_keyword_list = "<div class='premium-link-selected-keyword-list'></div>";
        my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + premium_link_selected_keyword_list;

        input = "<input class='btn-career btn-cancel-editing-my-premium-link' type='button' value='" + i18n[lang].cancel + "'>";
        temp = "<input class='btn-career btn-update-editing-my-premium-link' type='button' value='" + i18n[lang].check + "'>";
        var btn_career_wrapper = "<div class='btn-career-wrapper'>" + input + temp + "</div>";
        my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + btn_career_wrapper;

        var my_premium_link_item_editing_inner = "<div class='my-premium-link-item-editing-inner'>" + my_premium_link_item_editing_inner_list + "</div>";
        var my_premium_link_item_editing = "<div class='my-premium-link-item-editing' data-blog-id='" + doc.blog_id + "' data-pl-id='" + doc.pl_id + "'>" + my_premium_link_item_editing_inner + "</div>";

        return "<div class='my-premium-link-item " + _class + "'>" + my_premium_link_item_written + my_premium_link_item_editing + "</div>";
    },
    get_single_gleant_announcement_form: function (lang) {
        var label1
            , label2
            , span
            , select
            , input
            , img
            , div
            , div2
            , temp
            , lang_list
            , lang_text_list
            , textarea
            , written_language_wrapper
            , btn
            , btn_wrapper
            , form
            , output_list
            , send_alarm
            , send_alarm_wrapper
            , submit_announcement
            , form_top
            , form_bottom;
        span = "<span class='write-label'>" + i18n[lang].language + "</span>";
        select = "<select class='written-language'></select>";
        label1 = "<label style='display:inline-block;'>" + span + select + "</label>";
        written_language_wrapper = "<div class='written-language-wrapper'>" + label1 + "</div>";
        span = "<span class='write-label'>" + i18n[lang].title + "</span>";
        input = "<input id='gleant-announcement-input' type='text' placeholder=''>";
        label1 = "<label>" + span + input + "</label>";
        span = "<span class='write-label'>" + i18n[lang].content + "</span>";
        textarea = "<textarea id='ground-editor'></textarea>";
        div = "<div class='write-content-wrapper'>" + textarea + "</div>";
        label2 = "<label>" + span + div + "</label>";
        btn = "<input class='btn-career write-single-language-submit' type='button' value='" + i18n[lang].check + "'>";
        btn_wrapper = "<div class='btn-career-wrapper'>" + btn + "</div>";
        form = "<form id='write-gleant-announcement-form'>" + written_language_wrapper + label1 + label2 + btn_wrapper +"</form>";
        lang_list = [
            "en"
            , "ja"
            , "ko"
            , "zh-Hans"
        ];
        lang_text_list = [
            "english"
            , "japanese"
            , "korean"
            , "simplified_chinese"
        ];
        output_list = "";
        for (var i = 0; i < lang_list.length; i++) {
            div = "<div class='output-title'>" + i18n[lang][lang_text_list[i]] + "</div>";
            btn = "<input class='btn-career btn-remove-output' type='button' value='" + i18n[lang].remove + "' data-target='output-" + lang_list[i] + "' data-lang='" + lang_list[i] + "'>";
            div = "<div class='output-title-wrapper'>" + div + btn + "</div>";
            div2 = "<div id='output-" + lang_list[i] + "' class='output-document' data-lang='" + lang_list[i] + "'></div>";
            output_list = output_list + div + div2;
        }
        img = "<img src='" + config.aws_s3_url + "/icons/notifications-selected.png" + config.css_version + "' style='margin-left:10px;'>";
        send_alarm = "<input id='send-notification' type='checkbox'>";
        span = "<span style='margin-left:5px;'>Do you want to send notification?</span>";
        send_alarm_wrapper = "<label id='send-notification-wrapper'>" + img + span + send_alarm + "</label>";
        submit_announcement = "<input id='write-gleant-announcement-submit' type='button' value='" + i18n[lang].check + "'>";
        output_list = "<div id='output-list'>" + output_list + send_alarm_wrapper + submit_announcement + "</div>";
        form_top = "<div>" + form + "</div>";
        form_bottom = "<div>" + output_list + "</div>";
        return {
            form_top: form_top
            , form_bottom: form_bottom
        };
    },
    get_single_perfect_gleant_announcement: function (lang, doc) {
        var written_title_wrapper
            , written_title
            , created_at_wrapper
            , created_at
            , written_content
            , written_link
            , a
            , img;
        written_title = "<div class='written-title'>" + methods.get_encoded_html_preventing_xss(doc.title) + "</div>";
        written_title_wrapper = "<div class='written-title-wrapper'>" + written_title + "</div>";
        created_at = "<div class='created-at' data-datetime='" + doc.created_at + "'></div>";
        created_at_wrapper = "<div class='created-at-wrapper'>" + created_at + "</div>";
        written_content = "<div class='written-content'>" + doc.content + "</div>";
        written_link = config.url + "/announcement/" + doc._id;
        a = "<a href='" + written_link + "' target='_blank' alt='Gleant' title='Gleant'>" + written_link  + "</a>";
        img = "<img class='copy-article-address emoticon-x-small-img' src='" + config.aws_s3_url + "/icons/copy-clipboard.png' data-clipboard-text='" + written_link + "' alt='" + i18n[lang].copy_url + "' title='" + i18n[lang].copy_url + "'>";
        written_link = "<div class='written-link'>" + a + img + "</div>";
        return "<div class='written gleant-announcement' id='" + doc._id + "' data-id='" + doc._id + "' data-created-at='" + doc.created_at + "'>" + written_title_wrapper + created_at_wrapper + written_content + written_link + "</div>";
    }
};