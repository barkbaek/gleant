const model = require('../models/search');
const methods = require('../methods');
const article_templates = require('../article_templates');
const i18n = require('../i18n');
const config = require('../env.json')[process.env.NODE_ENV || 'development'];
const limit = require('../limit').get_all();
module.exports = function (lang, is_mobile, is_loginned, user, pass_obj, es_docs, news_doc, news_comments, template) {
    template.render('search', {
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
            var search_text = (pass_obj.query === undefined ? "" : pass_obj.query);
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

            return search_text + " - " + i18n[lang].search_obj.title;
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
            return i18n[lang].search_obj.description;
        },
        keywords: function () {
            return config["keywords"];
        },
        image: function () {
            return config["image"];
        },
        search_menu: function () {
            var menu_list = [
                    {key: "search_all", type: "tot"}
                    , {key: "user", type: "ur"}
                    , {key: "news", type: "ns"}
                    , {key: "debate", type: "de"}
                    /*, {key: "employment", type: "em"}*/
                    , {key: "website", type: "we"}
                    , {key: "blog", type: "pr"}
                    , {key: "image", type: "img"}
                ]
                , href
                , li
                , a;
            /* , {key: "web_page", type: "web"} */

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

            if (pass_obj.type === undefined) {
                pass_obj.type = "tot"
            }
            if (pass_obj.query === undefined) {
                pass_obj.query = "";
            }
            a = "";
            for (var i = 0; i < menu_list.length; i++) {
                if (pass_obj.type === menu_list[i].type) {
                    li = "<li class='selected'>" +  i18n[lang][menu_list[i].key] + "</li>";
                } else {
                    li = "<li>" + i18n[lang][menu_list[i].key] + "</li>";
                }
                href = "/search?w=" + menu_list[i].type;
                href = href + "&q=" + methods.encode_for_url(pass_obj.query);
                a = a + "<a class='search-menu-item' href='" + href + "'>" + li + "</a>";
            }
            var final = "<ul>" + a + "</ul>";
            return "<div id='search-menu'>" + final + "</div>";
        },
        url: function () {
            /**
             * /search?w=tot - All
             * /search?w=ur - User
             * /search?w=de - Debate
             * /search?w=pr - blog
             * /search?w=img - Image
             * /search?w=tot&q=SearchText
             * /search?w=tot&from=0&q=SearchText
             **/
            var queries = "";
            if (pass_obj.type !== undefined) { /* type이 존재하는 경우 */
                queries = '?w=' + pass_obj.type;
                if (pass_obj.query === undefined || pass_obj.query === "") { /* 쿼리가 존재하지 않는 경우 */

                } else { /* 쿼리가 존재하는 경우 */
                    if (pass_obj.from !== undefined) { /* from이 존재하는 경우 */
                        queries = queries + '&f=' + pass_obj.from;
                    }
                    queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                }
            } else { /* type이 존재하지 않는 경우 */
                queries = '?w=tot';
                if (pass_obj.query === undefined || pass_obj.query === "") { /* 쿼리가 존재하지 않는 경우 */

                } else { /* 쿼리가 존재하는 경우 */
                    if (pass_obj.from !== undefined) { /* from이 존재하는 경우 */
                        queries = queries + '?f=' + pass_obj.from;
                    }
                    queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                }
            }
            return config["url"] + "/search" + queries;
        },
        alternate_list: function () {
            var queries = "";
            if (pass_obj.type !== undefined) { /* type이 존재하는 경우 */
                queries = '?w=' + pass_obj.type;
                if (pass_obj.query === undefined || pass_obj.query === "") { /* 쿼리가 존재하지 않는 경우 */

                } else { /* 쿼리가 존재하는 경우 */
                    if (pass_obj.from !== undefined) { /* from이 존재하는 경우 */
                        queries = queries + '&f=' + pass_obj.from;
                    }
                    queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                }
            } else { /* type이 존재하지 않는 경우 */
                queries = '?w=tot';
                if (pass_obj.query === undefined || pass_obj.query === "") { /* 쿼리가 존재하지 않는 경우 */

                } else { /* 쿼리가 존재하는 경우 */
                    if (pass_obj.from !== undefined) { /* from이 존재하는 경우 */
                        queries = queries + '?f=' + pass_obj.from;
                    }
                    queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                }
            }
            var url = config["url"] + "/search" + queries;
            var list = [];
            list.push({ url: url, lang: "en" });
            list.push({ url: url.replace('www', 'en'), lang: "en" });
            list.push({ url: url.replace('www', 'ja'), lang: "ja" });
            list.push({ url: url.replace('www', 'ko'), lang: "ko" });
            list.push({ url: url.replace('www', 'zh-hans'), lang: "zh-Hans" });
            return list;
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
        search_text: function () {
            return pass_obj.query === undefined ? "" : pass_obj.query;
        },
        result_none: function () {
            return false;
        },
        w: function () {
            return pass_obj.type;
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
        search_content: function () {
            var search_user_direct_link = methods.get_search_direct_link("ur", pass_obj)
                , search_news_direct_link = methods.get_search_direct_link("ns", pass_obj)
                , search_debate_direct_link = methods.get_search_direct_link("de", pass_obj)
                , search_employment_direct_link = methods.get_search_direct_link("em", pass_obj)
                , search_website_direct_link = methods.get_search_direct_link("we", pass_obj)
                , search_blog_direct_link = methods.get_search_direct_link("pr", pass_obj)
                , search_image_direct_link = methods.get_search_direct_link("img", pass_obj);
            var final_list = ""
                , article_title
                , search_more
                , search_user_item
                , search_news_item
                , search_debate_item
                , search_employment_item
                , search_website_item
                , search_blog_item
                , search_image_item
                , user_list = ""
                , news_list = ""
                , debate_list = ""
                , employment_list = ""
                , website_list = ""
                , blog_list = ""
                , image_list = ""
                , image_more = ""
                , img1
                , page = ""
                , pagination = ""
                , mobile_pagination = ""
                , desktop_pagination = ""
                , previous_button = ""
                , next_button = ""
                , same_name_user_item
                , same_name_user_list = ""
                , total
                , from
                , size
                , queries
                , num_of_total_page
                , current_page
                , desktop_start_page
                , desktop_end_page
                , mobile_start_page
                , mobile_end_page;

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

            if (pass_obj.type === "tot") { /* When All selected */
                if (es_docs && es_docs.user && es_docs.user.length > 0) { /* User */
                    if (es_docs.user_total > limit.search_all) {
                        search_more = "<span class='search-more'>" + i18n[lang].more + "<img src='" + config.aws_s3_url + "/icons/more-right.png?" + config.css_version + "'></span>";
                    } else {
                        search_more = "";
                    }
                    article_title = "<div class='article-title' id='user-title'><a href='" + search_user_direct_link + "'>" + search_more + "</a><span>" + i18n[lang].user + "</span><span id='search-user-count' class='search-count'>" + es_docs.user_total + "</span></div>";
                    search_user_item = methods.get_search_user_object1(lang, es_docs.user[0]);
                    user_list = "<div id='user-list'>" + search_user_item + "</div>";

                    if (es_docs.user && es_docs.user.length > 1) {
                        same_name_user_list = "";
                        for (var j=1; j < es_docs.user.length; j++) {
                            same_name_user_item = methods.get_search_user_object2(lang, es_docs.user[j]);
                            same_name_user_list = same_name_user_list + same_name_user_item;
                        }
                        same_name_user_list = "<div id='same-name-user-list'>" + same_name_user_list + "</div>";
                    }
                    final_list = final_list + article_title + user_list + same_name_user_list;
                }

                if (es_docs && es_docs.news && es_docs.news.length > 0) { /* News */
                    if (es_docs.news_total > limit.search_all) {
                        search_more = "<span class='search-more'>" + i18n[lang].more + "<img src='" + config.aws_s3_url + "/icons/more-right.png?" + config.css_version + "'></span>";
                    } else {
                        search_more = "";
                    }
                    article_title = "<div class='article-title' id='news-title'><a href='" + search_news_direct_link + "'>" + search_more + "</a><span>" + i18n[lang].news + "</span><span id='search-news-count' class='search-count'>" + es_docs.news_total + "</span></div>";
                    news_list = "";
                    for (var j=0; j < es_docs.news.length; j++) {
                        search_news_item = methods.get_search_news_object(es_docs.news[j]);
                        news_list = news_list + search_news_item;
                    }
                    news_list = "<div id='news-list'>" + news_list + "</div>";
                    final_list = final_list + article_title + news_list;
                }

                if (es_docs && es_docs.debate && es_docs.debate.length > 0) { /* Debate */
                    if (es_docs.debate_total > limit.search_all) {
                        search_more = "<span class='search-more'>" + i18n[lang].more + "<img src='" + config.aws_s3_url + "/icons/more-right.png?" + config.css_version + "'></span>";
                    } else {
                        search_more = "";
                    }
                    article_title = "<div class='article-title' id='agenda-opinion-title'><a href='" + search_debate_direct_link + "'>" + search_more + "</a><span>" + i18n[lang].debate + "</span><span id='search-debate-count' class='search-count'>" + es_docs.debate_total + "</span></div>";
                    debate_list = "";
                    for (var j=0; j < es_docs.debate.length; j++) {
                        search_debate_item = methods.get_search_debate_object(lang, is_loginned, es_docs.debate[j]);
                        debate_list = debate_list + search_debate_item;
                    }
                    debate_list = "<div id='agenda-opinion-list'>" + debate_list + "</div>";
                    final_list = final_list + article_title + debate_list;
                }

                /* Employment */
                /*
                if (es_docs && es_docs.employment && es_docs.employment.length > 0) {
                    if (es_docs.employment_total > limit.search_all) {
                        search_more = "<span class='search-more'>" + i18n[lang].more + "<img src='" + config.aws_s3_url + "/icons/more-right.png?" + config.css_version + "'></span>";
                    } else {
                        search_more = "";
                    }
                    article_title = "<div class='article-title' id='employment-title'><a href='" + search_employment_direct_link + "'>" + search_more + "</a><span>" + i18n[lang].employment + "</span><span id='search-employment-count' class='search-count'>" + es_docs.employment_total + "</span></div>";
                    employment_list = "";
                    for (var j=0; j < es_docs.employment.length; j++) {
                        search_employment_item = methods.get_search_employment_object(lang, is_loginned, es_docs.employment[j]);
                        employment_list = employment_list + search_employment_item;
                    }
                    employment_list = "<div id='employment-list'>" + employment_list + "</div>";
                    final_list = final_list + article_title + employment_list;
                }
                */

                if (es_docs && es_docs.website && es_docs.website.length > 0) { /* Website */
                    if (es_docs.website_total > limit.search_all) {
                        search_more = "<span class='search-more'>" + i18n[lang].more + "<img src='" + config.aws_s3_url + "/icons/more-right.png?" + config.css_version + "'></span>";
                    } else {
                        search_more = "";
                    }
                    article_title = "<div class='article-title' id='website-title'><a href='" + search_website_direct_link + "'>" + search_more + "</a><span>" + i18n[lang].website + "</span><span id='search-website-count' class='search-count'>" + es_docs.website_total + "</span></div>";
                    website_list = "";
                    for (var j=0; j < es_docs.website.length; j++) {
                        search_website_item = methods.get_search_website_object(lang, es_docs.website[j]);
                        website_list = website_list + search_website_item;
                    }
                    website_list = "<div id='website-list'>" + website_list + "</div>";
                    final_list = final_list + article_title + website_list;
                }

                if (es_docs && es_docs.blog && es_docs.blog.length > 0) { /* blog */
                    if (es_docs.blog_total > limit.search_all) {
                        search_more = "<span class='search-more'>" + i18n[lang].more + "<img src='" + config.aws_s3_url + "/icons/more-right.png?" + config.css_version + "'></span>";
                    } else {
                        search_more = "";
                    }
                    article_title = "<div class='article-title search-title' id='blog-title'><a href='" + search_blog_direct_link + "'>" + search_more + "</a><span>" + i18n[lang].blog + "</span><span id='search-blog-count' class='search-count'>" + es_docs.blog_total + "</span></div>";
                    blog_list = "";
                    for (var j=0; j < es_docs.blog.length; j++) {
                        search_blog_item = methods.get_search_blog_object(lang, is_loginned, es_docs.blog[j]);
                        blog_list = blog_list + search_blog_item;
                    }
                    blog_list = "<div id='blog-list'>" + blog_list + "</div>";
                    final_list = final_list + article_title + blog_list;
                }

                if (es_docs && es_docs.image && es_docs.image.length > 0) { /* Image */
                    if (es_docs.image_total > limit.search_all) {
                        search_more = "<span class='search-more'>" + i18n[lang].more + "<img src='" + config.aws_s3_url + "/icons/more-right.png?" + config.css_version + "'></span>";
                    } else {
                        search_more = "";
                    }
                    article_title = "<div class='article-title search-title' id='image-title'><a href='" + search_image_direct_link + "'>" + search_more + "</a><span>" + i18n[lang].image + "</span><span id='search-image-count' class='search-count'>" + es_docs.image_total + "</span></div>";
                    image_list = "";
                    for (var j=0; j < es_docs.image.length; j++) {
                        search_image_item = methods.get_search_image_object(lang, es_docs.image[j]);
                        image_list = image_list + search_image_item;
                    }
                    image_list = "<div id='image-list'>" + image_list + "</div>";
                    final_list = final_list + article_title + image_list;
                }
            } else if (pass_obj.type === "ur") { /* When User selected */
                if (es_docs && es_docs.user && es_docs.user.length > 0) {
                    if (es_docs.user_total > limit.search_user) {
                        search_more = "<span class='search-more'>" + i18n[lang].more + "<img src='" + config.aws_s3_url + "/icons/more-right.png?" + config.css_version + "'></span>";
                    } else {
                        search_more = "";
                    }
                    article_title = "<div class='article-title' id='user-title'><a href='" + search_user_direct_link + "'>" + search_more + "</a><span>" + i18n[lang].user + "</span><span id='search-user-count' class='search-count'>" + es_docs.user_total + "</span></div>";
                    user_list = "";
                    for (var j=0; j < es_docs.user.length; j++) {
                        search_user_item = methods.get_search_user_object1(lang, es_docs.user[j]);
                        user_list = user_list + search_user_item;
                    }
                    /* Pagination */
                    total = parseInt(es_docs.user_total);
                    from = pass_obj.from;
                    if (from === undefined || from === null) {
                        from = 0;
                    }
                    size = limit.search_user;

                    if (total <= size) {
                        num_of_total_page = current_page = desktop_start_page = desktop_end_page = mobile_start_page = mobile_end_page = 1;
                    } else {
                        num_of_total_page = Math.floor((total-1) / size) + 1;
                        current_page = Math.floor(from / size) + 1;

                        desktop_start_page = Math.floor((current_page-1) / 10) * 10 + 1;
                        desktop_end_page = Math.floor((current_page-1) / 10) * 10 + 10;

                        if (size > 5) {
                            if ( current_page > Math.floor((desktop_start_page + desktop_end_page) / 2) ) {
                                mobile_start_page = Math.floor((desktop_start_page + desktop_end_page) / 2) + 1;
                                mobile_end_page = desktop_end_page;
                            } else {
                                mobile_start_page = desktop_start_page;
                                mobile_end_page = Math.floor((desktop_start_page + desktop_end_page) / 2);
                            }
                        } else {
                            mobile_start_page = desktop_start_page;
                            mobile_end_page = desktop_end_page;
                        }

                        if (desktop_end_page > num_of_total_page) {
                            desktop_end_page = num_of_total_page;
                        }

                        if (mobile_end_page > num_of_total_page) {
                            mobile_end_page = num_of_total_page;
                        }
                    }
                    user_list = "<div id='user-list'>" + user_list + "</div>";
                    desktop_pagination = "";
                    for (var j=desktop_start_page; j<=desktop_end_page;j++) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((j * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;

                        if (j === current_page) {
                            page = "<a class='single-page selected' href='" + queries + "'>" + j + "</a>";
                        } else {
                            page = "<a class='single-page' href='" + queries + "'>" + j + "</a>";
                        }
                        desktop_pagination = desktop_pagination + page;
                    }
                    mobile_pagination = "";
                    for (var j=mobile_start_page; j<=mobile_end_page;j++) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((j * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;

                        if (j === current_page) {
                            page = "<a class='single-page selected' href='" + queries + "'>" + j + "</a>";
                        } else {
                            page = "<a class='single-page' href='" + queries + "'>" + j + "</a>";
                        }
                        mobile_pagination = mobile_pagination + page;
                    }

                    img1 = "<img class='emoticon-big-square-img' src='" + config.aws_s3_url + "/icons/page-right.png" + config.css_version + "' style='margin:0 10px;'>";
                    if (current_page === num_of_total_page) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=0';
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        next_button = "<a class='page-right' href='" + queries + "'>" + img1 + "</a>";
                    } else {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + (from + size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        next_button = "<a class='page-right' href='" + queries + "'>" + img1 + "</a>";
                    }

                    img1 = "<img class='emoticon-big-square-img' src='" + config.aws_s3_url + "/icons/page-left.png" + config.css_version + "' style='margin:0 10px;'>";
                    if (current_page === 1) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((num_of_total_page * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        previous_button = "<a class='page-left' href='" + queries + "'>" + img1 + "</a>";
                    } else {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + (from - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        previous_button = "<a class='page-left' href='" + queries + "'>" + img1 + "</a>";
                    }

                    desktop_pagination = "<div id='desktop-pagination'>" + previous_button + desktop_pagination + next_button + "</div>";
                    mobile_pagination = "<div id='mobile-pagination'>" + previous_button + mobile_pagination + next_button + "</div>";
                    pagination = "<div id='pagination'>" + desktop_pagination + mobile_pagination + "</div>";
                    final_list = final_list + article_title + user_list + pagination;
                }
            } else if (pass_obj.type === "ns") { /* When News selected */
                if (es_docs && es_docs.news && es_docs.news.length > 0) {
                    if (es_docs.news_total > limit.search_news) {
                        search_more = "<span class='search-more'>" + i18n[lang].more + "<img src='" + config.aws_s3_url + "/icons/more-right.png?" + config.css_version + "'></span>";
                    } else {
                        search_more = "";
                    }
                    article_title = "<div class='article-title' id='news-title'><a href='" + search_news_direct_link + "'>" + search_more + "</a><span>" + i18n[lang].news + "</span><span id='search-news-count' class='search-count'>" + es_docs.news_total + "</span></div>";
                    news_list = "";
                    for (var j=0; j < es_docs.news.length; j++) {
                        search_news_item = methods.get_search_news_object(es_docs.news[j]);
                        news_list = news_list + search_news_item;
                    }
                    /* Pagination */
                    total = parseInt(es_docs.news_total);
                    from = pass_obj.from;
                    if (from === undefined || from === null) {
                        from = 0;
                    }
                    size = limit.search_news;
                    if (total <= size) {
                        num_of_total_page = current_page = desktop_start_page = desktop_end_page = mobile_start_page = mobile_end_page = 1;
                    } else {
                        num_of_total_page = Math.floor((total-1) / size) + 1;
                        current_page = Math.floor(from / size) + 1;
                        desktop_start_page = Math.floor((current_page-1) / 10) * 10 + 1;
                        desktop_end_page = Math.floor((current_page-1) / 10) * 10 + 10;
                        if (size > 5) {
                            if ( current_page > Math.floor((desktop_start_page + desktop_end_page) / 2) ) {
                                mobile_start_page = Math.floor((desktop_start_page + desktop_end_page) / 2) + 1;
                                mobile_end_page = desktop_end_page;
                            } else {
                                mobile_start_page = desktop_start_page;
                                mobile_end_page = Math.floor((desktop_start_page + desktop_end_page) / 2);
                            }
                        } else {
                            mobile_start_page = desktop_start_page;
                            mobile_end_page = desktop_end_page;
                        }
                        if (desktop_end_page > num_of_total_page) {
                            desktop_end_page = num_of_total_page;
                        }
                        if (mobile_end_page > num_of_total_page) {
                            mobile_end_page = num_of_total_page;
                        }
                    }
                    news_list = "<div id='news-list'>" + news_list + "</div>";
                    desktop_pagination = "";
                    for (var j=desktop_start_page; j<=desktop_end_page;j++) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((j * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;

                        if (j === current_page) {
                            page = "<a class='single-page selected' href='" + queries + "'>" + j + "</a>";
                        } else {
                            page = "<a class='single-page' href='" + queries + "'>" + j + "</a>";
                        }
                        desktop_pagination = desktop_pagination + page;
                    }
                    mobile_pagination = "";
                    for (var j=mobile_start_page; j<=mobile_end_page;j++) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((j * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;

                        if (j === current_page) {
                            page = "<a class='single-page selected' href='" + queries + "'>" + j + "</a>";
                        } else {
                            page = "<a class='single-page' href='" + queries + "'>" + j + "</a>";
                        }
                        mobile_pagination = mobile_pagination + page;
                    }
                    img1 = "<img class='emoticon-big-square-img' src='" + config.aws_s3_url + "/icons/page-right.png" + config.css_version + "' style='margin:0 10px;'>";
                    if (current_page === num_of_total_page) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=0';
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        next_button = "<a class='page-right' href='" + queries + "'>" + img1 + "</a>";
                    } else {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + (from + size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        next_button = "<a class='page-right' href='" + queries + "'>" + img1 + "</a>";
                    }
                    img1 = "<img class='emoticon-big-square-img' src='" + config.aws_s3_url + "/icons/page-left.png" + config.css_version + "' style='margin:0 10px;'>";
                    if (current_page === 1) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((num_of_total_page * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        previous_button = "<a class='page-left' href='" + queries + "'>" + img1 + "</a>";
                    } else {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + (from - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        previous_button = "<a class='page-left' href='" + queries + "'>" + img1 + "</a>";
                    }
                    desktop_pagination = "<div id='desktop-pagination'>" + previous_button + desktop_pagination + next_button + "</div>";
                    mobile_pagination = "<div id='mobile-pagination'>" + previous_button + mobile_pagination + next_button + "</div>";
                    pagination = "<div id='pagination'>" + desktop_pagination + mobile_pagination + "</div>";
                    final_list = final_list + article_title + news_list + pagination;
                }
            } else if (pass_obj.type === "de") { /* When Debate selected */
                if (es_docs && es_docs.debate && es_docs.debate.length > 0) {
                    if (es_docs.debate_total > limit.search_debate) {
                        search_more = "<span class='search-more'>" + i18n[lang].more + "<img src='" + config.aws_s3_url + "/icons/more-right.png?" + config.css_version + "'></span>";
                    } else {
                        search_more = "";
                    }
                    article_title = "<div class='article-title' id='agenda-opinion-title'><a href='" + search_debate_direct_link + "'>" + search_more + "</a><span>" + i18n[lang].debate + "</span><span id='search-debate-count' class='search-count'>" + es_docs.debate_total + "</span></div>";
                    debate_list = "";
                    for (var j=0; j < es_docs.debate.length; j++) {
                        search_debate_item = methods.get_search_debate_object(lang, is_loginned, es_docs.debate[j]);
                        debate_list = debate_list + search_debate_item;
                    }
                    /* Pagination */
                    total = parseInt(es_docs.debate_total);
                    from = pass_obj.from;
                    if (from === undefined || from === null) {
                        from = 0;
                    }
                    size = limit.search_debate;

                    if (total <= size) {
                        num_of_total_page = current_page = desktop_start_page = desktop_end_page = mobile_start_page = mobile_end_page = 1;
                    } else {
                        num_of_total_page = Math.floor((total-1) / size) + 1;
                        current_page = Math.floor(from / size) + 1;

                        desktop_start_page = Math.floor((current_page-1) / 10) * 10 + 1;
                        desktop_end_page = Math.floor((current_page-1) / 10) * 10 + 10;

                        if (size > 5) {
                            if ( current_page > Math.floor((desktop_start_page + desktop_end_page) / 2) ) {
                                mobile_start_page = Math.floor((desktop_start_page + desktop_end_page) / 2) + 1;
                                mobile_end_page = desktop_end_page;
                            } else {
                                mobile_start_page = desktop_start_page;
                                mobile_end_page = Math.floor((desktop_start_page + desktop_end_page) / 2);
                            }
                        } else {
                            mobile_start_page = desktop_start_page;
                            mobile_end_page = desktop_end_page;
                        }

                        if (desktop_end_page > num_of_total_page) {
                            desktop_end_page = num_of_total_page;
                        }

                        if (mobile_end_page > num_of_total_page) {
                            mobile_end_page = num_of_total_page;
                        }
                    }
                    debate_list = "<div id='agenda-opinion-list'>" + debate_list + "</div>";
                    desktop_pagination = "";
                    for (var j=desktop_start_page; j<=desktop_end_page;j++) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((j * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;

                        if (j === current_page) {
                            page = "<a class='single-page selected' href='" + queries + "'>" + j + "</a>";
                        } else {
                            page = "<a class='single-page' href='" + queries + "'>" + j + "</a>";
                        }
                        desktop_pagination = desktop_pagination + page;
                    }
                    mobile_pagination = "";
                    for (var j=mobile_start_page; j<=mobile_end_page;j++) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((j * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;

                        if (j === current_page) {
                            page = "<a class='single-page selected' href='" + queries + "'>" + j + "</a>";
                        } else {
                            page = "<a class='single-page' href='" + queries + "'>" + j + "</a>";
                        }
                        mobile_pagination = mobile_pagination + page;
                    }

                    img1 = "<img class='emoticon-big-square-img' src='" + config.aws_s3_url + "/icons/page-right.png" + config.css_version + "' style='margin:0 10px;'>";
                    if (current_page === num_of_total_page) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=0';
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        next_button = "<a class='page-right' href='" + queries + "'>" + img1 + "</a>";
                    } else {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + (from + size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        next_button = "<a class='page-right' href='" + queries + "'>" + img1 + "</a>";
                    }

                    img1 = "<img class='emoticon-big-square-img' src='" + config.aws_s3_url + "/icons/page-left.png" + config.css_version + "' style='margin:0 10px;'>";
                    if (current_page === 1) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((num_of_total_page * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        previous_button = "<a class='page-left' href='" + queries + "'>" + img1 + "</a>";
                    } else {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + (from - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        previous_button = "<a class='page-left' href='" + queries + "'>" + img1 + "</a>";
                    }

                    desktop_pagination = "<div id='desktop-pagination'>" + previous_button + desktop_pagination + next_button + "</div>";
                    mobile_pagination = "<div id='mobile-pagination'>" + previous_button + mobile_pagination + next_button + "</div>";
                    pagination = "<div id='pagination'>" + desktop_pagination + mobile_pagination + "</div>";
                    final_list = final_list + article_title + debate_list + pagination;
                }
            /*} else if (pass_obj.type === "em") {
                if (es_docs && es_docs.employment && es_docs.employment.length > 0) {
                    if (es_docs.employment_total > limit.search_employment) {
                        search_more = "<span class='search-more'>" + i18n[lang].more + "<img src='" + config.aws_s3_url + "/icons/more-right.png?" + config.css_version + "'></span>";
                    } else {
                        search_more = "";
                    }
                    article_title = "<div class='article-title' id='employment-title'><a href='" + search_employment_direct_link + "'>" + search_more + "</a><span>" + i18n[lang].employment + "</span><span id='search-employment-count' class='search-count'>" + es_docs.employment_total + "</span></div>";
                    employment_list = "";
                    for (var j=0; j < es_docs.employment.length; j++) {
                        search_employment_item = methods.get_search_employment_object(lang, is_loginned, es_docs.employment[j]);
                        employment_list = employment_list + search_employment_item;
                    }

                    total = parseInt(es_docs.employment_total);
                    from = pass_obj.from;
                    if (from === undefined || from === null) {
                        from = 0;
                    }
                    size = limit.search_employment;

                    if (total <= size) {
                        num_of_total_page = current_page = desktop_start_page = desktop_end_page = mobile_start_page = mobile_end_page = 1;
                    } else {
                        num_of_total_page = Math.floor((total-1) / size) + 1;
                        current_page = Math.floor(from / size) + 1;

                        desktop_start_page = Math.floor((current_page-1) / 10) * 10 + 1;
                        desktop_end_page = Math.floor((current_page-1) / 10) * 10 + 10;

                        if (size > 5) {
                            if ( current_page > Math.floor((desktop_start_page + desktop_end_page) / 2) ) {
                                mobile_start_page = Math.floor((desktop_start_page + desktop_end_page) / 2) + 1;
                                mobile_end_page = desktop_end_page;
                            } else {
                                mobile_start_page = desktop_start_page;
                                mobile_end_page = Math.floor((desktop_start_page + desktop_end_page) / 2);
                            }
                        } else {
                            mobile_start_page = desktop_start_page;
                            mobile_end_page = desktop_end_page;
                        }

                        if (desktop_end_page > num_of_total_page) {
                            desktop_end_page = num_of_total_page;
                        }

                        if (mobile_end_page > num_of_total_page) {
                            mobile_end_page = num_of_total_page;
                        }
                    }

                    employment_list = "<div id='employment-list'>" + employment_list + "</div>";

                    desktop_pagination = "";
                    for (var j=desktop_start_page; j<=desktop_end_page;j++) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((j * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;

                        if (j === current_page) {
                            page = "<a class='single-page selected' href='" + queries + "'>" + j + "</a>";
                        } else {
                            page = "<a class='single-page' href='" + queries + "'>" + j + "</a>";
                        }
                        desktop_pagination = desktop_pagination + page;
                    }
                    mobile_pagination = "";
                    for (var j=mobile_start_page; j<=mobile_end_page;j++) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((j * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;

                        if (j === current_page) {
                            page = "<a class='single-page selected' href='" + queries + "'>" + j + "</a>";
                        } else {
                            page = "<a class='single-page' href='" + queries + "'>" + j + "</a>";
                        }
                        mobile_pagination = mobile_pagination + page;
                    }

                    img1 = "<img class='emoticon-big-square-img' src='" + config.aws_s3_url + "/icons/page-right.png" + config.css_version + "' style='margin:0 10px;'>";
                    if (current_page === num_of_total_page) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=0';
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        next_button = "<a class='page-right' href='" + queries + "'>" + img1 + "</a>";
                    } else {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + (from + size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        next_button = "<a class='page-right' href='" + queries + "'>" + img1 + "</a>";
                    }

                    img1 = "<img class='emoticon-big-square-img' src='" + config.aws_s3_url + "/icons/page-left.png" + config.css_version + "' style='margin:0 10px;'>";
                    if (current_page === 1) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((num_of_total_page * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        previous_button = "<a class='page-left' href='" + queries + "'>" + img1 + "</a>";
                    } else {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + (from - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        previous_button = "<a class='page-left' href='" + queries + "'>" + img1 + "</a>";
                    }
                    desktop_pagination = "<div id='desktop-pagination'>" + previous_button + desktop_pagination + next_button + "</div>";
                    mobile_pagination = "<div id='mobile-pagination'>" + previous_button + mobile_pagination + next_button + "</div>";
                    pagination = "<div id='pagination'>" + desktop_pagination + mobile_pagination + "</div>";
                    final_list = final_list + article_title + employment_list + pagination;
                }*/
            } else if (pass_obj.type === "we") { /* When Website selected */
                if (es_docs && es_docs.website && es_docs.website.length > 0) {
                    if (es_docs.website_total > limit.search_website) {
                        search_more = "<span class='search-more'>" + i18n[lang].more + "<img src='" + config.aws_s3_url + "/icons/more-right.png?" + config.css_version + "'></span>";
                    } else {
                        search_more = "";
                    }
                    article_title = "<div class='article-title' id='website-title'><a href='" + search_website_direct_link + "'>" + search_more + "</a><span>" + i18n[lang].website + "</span><span id='search-website-count' class='search-count'>" + es_docs.website_total + "</span></div>";
                    website_list = "";
                    for (var j=0; j < es_docs.website.length; j++) {
                        search_website_item = methods.get_search_website_object(lang, es_docs.website[j]);
                        website_list = website_list + search_website_item;
                    }
                    /* Pagination */
                    total = parseInt(es_docs.website_total);
                    from = pass_obj.from;
                    if (from === undefined || from === null) {
                        from = 0;
                    }
                    size = limit.search_website;

                    if (total <= size) {
                        num_of_total_page = current_page = desktop_start_page = desktop_end_page = mobile_start_page = mobile_end_page = 1;
                    } else {
                        num_of_total_page = Math.floor((total-1) / size) + 1;
                        current_page = Math.floor(from / size) + 1;

                        desktop_start_page = Math.floor((current_page-1) / 10) * 10 + 1;
                        desktop_end_page = Math.floor((current_page-1) / 10) * 10 + 10;

                        if (size > 5) {
                            if ( current_page > Math.floor((desktop_start_page + desktop_end_page) / 2) ) {
                                mobile_start_page = Math.floor((desktop_start_page + desktop_end_page) / 2) + 1;
                                mobile_end_page = desktop_end_page;
                            } else {
                                mobile_start_page = desktop_start_page;
                                mobile_end_page = Math.floor((desktop_start_page + desktop_end_page) / 2);
                            }
                        } else {
                            mobile_start_page = desktop_start_page;
                            mobile_end_page = desktop_end_page;
                        }

                        if (desktop_end_page > num_of_total_page) {
                            desktop_end_page = num_of_total_page;
                        }

                        if (mobile_end_page > num_of_total_page) {
                            mobile_end_page = num_of_total_page;
                        }
                    }

                    website_list = "<div id='website-list'>" + website_list + "</div>";

                    desktop_pagination = "";
                    for (var j=desktop_start_page; j<=desktop_end_page;j++) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((j * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;

                        if (j === current_page) {
                            page = "<a class='single-page selected' href='" + queries + "'>" + j + "</a>";
                        } else {
                            page = "<a class='single-page' href='" + queries + "'>" + j + "</a>";
                        }
                        desktop_pagination = desktop_pagination + page;
                    }
                    mobile_pagination = "";
                    for (var j=mobile_start_page; j<=mobile_end_page;j++) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((j * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;

                        if (j === current_page) {
                            page = "<a class='single-page selected' href='" + queries + "'>" + j + "</a>";
                        } else {
                            page = "<a class='single-page' href='" + queries + "'>" + j + "</a>";
                        }
                        mobile_pagination = mobile_pagination + page;
                    }

                    img1 = "<img class='emoticon-big-square-img' src='" + config.aws_s3_url + "/icons/page-right.png" + config.css_version + "' style='margin:0 10px;'>";
                    if (current_page === num_of_total_page) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=0';
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        next_button = "<a class='page-right' href='" + queries + "'>" + img1 + "</a>";
                    } else {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + (from + size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        next_button = "<a class='page-right' href='" + queries + "'>" + img1 + "</a>";
                    }

                    img1 = "<img class='emoticon-big-square-img' src='" + config.aws_s3_url + "/icons/page-left.png" + config.css_version + "' style='margin:0 10px;'>";
                    if (current_page === 1) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((num_of_total_page * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        previous_button = "<a class='page-left' href='" + queries + "'>" + img1 + "</a>";
                    } else {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + (from - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        previous_button = "<a class='page-left' href='" + queries + "'>" + img1 + "</a>";
                    }
                    desktop_pagination = "<div id='desktop-pagination'>" + previous_button + desktop_pagination + next_button + "</div>";
                    mobile_pagination = "<div id='mobile-pagination'>" + previous_button + mobile_pagination + next_button + "</div>";
                    pagination = "<div id='pagination'>" + desktop_pagination + mobile_pagination + "</div>";
                    final_list = final_list + article_title + website_list + pagination;
                }
            } else if (pass_obj.type === "pr") { /* When blog selected */
                if (es_docs && es_docs.blog && es_docs.blog.length > 0) {
                    if (es_docs.blog_total > limit.search_blog) {
                        search_more = "<span class='search-more'>" + i18n[lang].more + "<img src='" + config.aws_s3_url + "/icons/more-right.png?" + config.css_version + "'></span>";
                    } else {
                        search_more = "";
                    }
                    article_title = "<div class='article-title search-title' id='blog-title'><a href='" + search_blog_direct_link + "'>" + search_more + "</a><span>" + i18n[lang].blog + "</span><span id='search-blog-count' class='search-count'>" + es_docs.blog_total + "</span></div>";
                    blog_list = "";
                    for (var j=0; j < es_docs.blog.length; j++) {
                        search_blog_item = methods.get_search_blog_object(lang, is_loginned, es_docs.blog[j]);
                        blog_list = blog_list + search_blog_item;
                    }
                    /* Pagination */
                    total = parseInt(es_docs.blog_total);
                    from = pass_obj.from;
                    if (from === undefined || from === null) {
                        from = 0;
                    }
                    size = limit.search_blog;

                    if (total <= size) {
                        num_of_total_page = current_page = desktop_start_page = desktop_end_page = mobile_start_page = mobile_end_page = 1;
                    } else {
                        num_of_total_page = Math.floor((total-1) / size) + 1;
                        current_page = Math.floor(from / size) + 1;

                        desktop_start_page = Math.floor((current_page-1) / 10) * 10 + 1;
                        desktop_end_page = Math.floor((current_page-1) / 10) * 10 + 10;

                        if (size > 0) {
                            if ( current_page > Math.floor((desktop_start_page + desktop_end_page) / 2) ) {
                                mobile_start_page = Math.floor((desktop_start_page + desktop_end_page) / 2) + 1;
                                mobile_end_page = desktop_end_page;
                            } else {
                                mobile_start_page = desktop_start_page;
                                mobile_end_page = Math.floor((desktop_start_page + desktop_end_page) / 2);
                            }
                        } else {
                            mobile_start_page = desktop_start_page;
                            mobile_end_page = desktop_end_page;
                        }

                        if (desktop_end_page > num_of_total_page) {
                            desktop_end_page = num_of_total_page;
                        }

                        if (mobile_end_page > num_of_total_page) {
                            mobile_end_page = num_of_total_page;
                        }
                    }

                    blog_list = "<div id='blog-list'>" + blog_list + "</div>";

                    desktop_pagination = "";
                    for (var j=desktop_start_page; j<=desktop_end_page;j++) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((j * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;

                        if (j === current_page) {
                            page = "<a class='single-page selected' href='" + queries + "'>" + j + "</a>";
                        } else {
                            page = "<a class='single-page' href='" + queries + "'>" + j + "</a>";
                        }
                        desktop_pagination = desktop_pagination + page;
                    }
                    mobile_pagination = "";
                    for (var j=mobile_start_page; j<=mobile_end_page;j++) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((j * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;

                        if (j === current_page) {
                            page = "<a class='single-page selected' href='" + queries + "'>" + j + "</a>";
                        } else {
                            page = "<a class='single-page' href='" + queries + "'>" + j + "</a>";
                        }
                        mobile_pagination = mobile_pagination + page;
                    }

                    img1 = "<img class='emoticon-big-square-img' src='" + config.aws_s3_url + "/icons/page-right.png" + config.css_version + "' style='margin:0 10px;'>";
                    if (current_page === num_of_total_page) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=0';
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        next_button = "<a class='page-right' href='" + queries + "'>" + img1 + "</a>";
                    } else {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + (from + size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        next_button = "<a class='page-right' href='" + queries + "'>" + img1 + "</a>";
                    }

                    img1 = "<img class='emoticon-big-square-img' src='" + config.aws_s3_url + "/icons/page-left.png" + config.css_version + "' style='margin:0 10px;'>";
                    if (current_page === 1) {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + ((num_of_total_page * size) - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        previous_button = "<a class='page-left' href='" + queries + "'>" + img1 + "</a>";
                    } else {
                        queries = "?w=" + pass_obj.type;
                        queries = queries + '&f=' + (from - size);
                        if (
                            pass_obj.query === undefined ||
                            pass_obj.query === ""
                        ) {
                            queries = queries + '&q='
                        } else {
                            queries = queries + '&q=' + methods.encode_for_url(pass_obj.query);
                        }
                        queries = config["url"] + "/search" + queries;
                        previous_button = "<a class='page-left' href='" + queries + "'>" + img1 + "</a>";
                    }
                    desktop_pagination = "<div id='desktop-pagination'>" + previous_button + desktop_pagination + next_button + "</div>";
                    mobile_pagination = "<div id='mobile-pagination'>" + previous_button + mobile_pagination + next_button + "</div>";
                    pagination = "<div id='pagination'>" + desktop_pagination + mobile_pagination + "</div>";
                    final_list = final_list + article_title + blog_list + pagination;
                }
            } else if (pass_obj.type === "img") { /* When Image selected */
                if (es_docs && es_docs.image && es_docs.image.length > 0) {
                    if (es_docs.image_total > limit.search_image) {
                        search_more = "<span class='search-more'><img src='" + config.aws_s3_url + "/icons/more-right.png?" + config.css_version + "'></span>";
                        image_more = "<div id='image-more' class='btn-more list-more'><img class='btn-more-down-14' src='" + config.aws_s3_url + "/icons/more-down.png" + config.css_version + "'></div>";
                    } else {
                        search_more = "";
                        image_more = "<div id='image-more' class='btn-more list-more' style='display:none;'><img class='btn-more-down-14' src='" + config.aws_s3_url + "/icons/more-down.png" + config.css_version + "'></div>";
                    }
                    article_title = "<div class='article-title search-title' id='image-title'><a href='" + search_image_direct_link + "'>" + search_more + "</a><span>" + i18n[lang].image + "</span><span id='search-image-count' class='search-count'>" + es_docs.image_total + "</span></div>";
                    image_list = "";
                    for (var j=0; j < es_docs.image.length; j++) {
                        search_image_item = methods.get_search_image_object(lang, es_docs.image[j]);
                        image_list = image_list + search_image_item;
                    }
                    image_list = "<div id='image-list'>" + image_list + "</div>";
                    final_list = final_list + article_title + image_list + image_more;
                }
            }
            if (final_list === "") {
                final_list = "<div id='empty-search-list'>" + "<span style='font-weight:bold;color:#f2b50f;'>'" + pass_obj.query + "'</span>&nbsp;" + "<span style='margin-left:5px;'>" + i18n[lang].no_search_result + "</span>" + "</div>";
            }
            return final_list;
        }
    });
};