const config = require('../env.json')[process.env.NODE_ENV || 'development'];
const model = require('../models/single_blog');
const methods = require('../methods');
const i18n = require('../i18n');
const article_templates = require('../article_templates');
const limit = require('../limit').get_all();

/**
 * @param {Object} blog_owner - 블로그 주인.
 * @param {boolean} is_mobile - 모바일이면 true, 아니면 false.
 * @param {boolean} is_loginned - 로그인 사용자면 true, 아니면 false.
 * @param {Object} friend_status
 * @param {Boolean} friend_status.is_friend - true || false
 * @param {Boolean} friend_status.is_friend_requested - true || false
 * @param {Object} user - 로그인 사용자.
 * @param {Object} template - response object.
 */
module.exports = function (lang, blog_owner, blog_menu, articles, is_mobile, is_loginned, friend_status, user, template) {
    template.render('single_blog', {
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
            obj.friend_counts = blog_owner["friends"].length;
            obj.friend_counts_aligned = methods.put_comma_between_three_digits(obj.friend_counts);
            if (lang === "en") {
                obj.select_lang = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
            } else if (lang === "ja") {
                obj.select_lang =  "<option class='lang-ja' value='ja' selected='selected'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
            } else if (lang === "ko") {
                obj.select_lang =  "<option class='lang-ko' value='ko' selected='selected'>" + i18n[lang].korean + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
            } else if (lang === "zh-Hans") {
                obj.select_lang =  "<option class='lang-zh-Hans' value='zh-Hans' selected='selected'>" + i18n[lang].simplified_chinese + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
            }
            obj.languages = [];
            if (lang === "en") {
                obj.languages.push({ lang: "en", i18n_text: i18n[lang].english });
                obj.languages.push({ lang: "ja", i18n_text: i18n[lang].japanese });
                obj.languages.push({ lang: "ko", i18n_text: i18n[lang].korean });
                obj.languages.push({ lang: "zh-Hans", i18n_text: i18n[lang].simplified_chinese });
            } else if (lang === "ja") {
                obj.languages.push({ lang: "ja", i18n_text: i18n[lang].japanese });
                obj.languages.push({ lang: "zh-Hans", i18n_text: i18n[lang].simplified_chinese });
                obj.languages.push({ lang: "en", i18n_text: i18n[lang].english });
                obj.languages.push({ lang: "ko", i18n_text: i18n[lang].korean });
            } else if (lang === "ko") {
                obj.languages.push({ lang: "ko", i18n_text: i18n[lang].korean });
                obj.languages.push({ lang: "en", i18n_text: i18n[lang].english });
                obj.languages.push({ lang: "ja", i18n_text: i18n[lang].japanese });
                obj.languages.push({ lang: "zh-Hans", i18n_text: i18n[lang].simplified_chinese });
            } else if (lang === "zh-Hans") {
                obj.languages.push({ lang: "zh-Hans", i18n_text: i18n[lang].simplified_chinese });
                obj.languages.push({ lang: "ja", i18n_text: i18n[lang].japanese });
                obj.languages.push({ lang: "en", i18n_text: i18n[lang].english });
                obj.languages.push({ lang: "ko", i18n_text: i18n[lang].korean });
            }
            obj.is_service_gleant = blog_owner["service"] === "gleant";
            obj.data_name = blog_owner["name"];
            obj.data_birth_year = blog_owner["birth_year"];
            obj.data_birth_month = blog_owner["birth_month"];
            obj.data_birth_day = blog_owner["birth_day"];
            obj.data_sex = blog_owner["sex"];
            obj.data_main_language = blog_owner["main_language"];
            var temp = "";
            for (var i = 0; i < blog_owner["available_languages"].length; i++) {
                if (i === 0) {
                    temp = blog_owner["available_languages"][i];
                } else {
                    temp = temp + "," + blog_owner["available_languages"][i];
                }
            }
            obj.data_available_languages = temp;
            obj.data_public_authority = blog_owner["public_authority"];
            return obj;
        },
        title: function () { // 사용자 이름
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
            if (is_loginned === true) {
                return blog_owner["blog_name"];
            } else {
                return blog_owner["blog_id"] + " " + i18n[lang].blog;
            }
        },
        description: function () { // 사용자 기본 프로필
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
            if (is_loginned === true) {
                return blog_owner["blog_name"];
            } else {
                return blog_owner["blog_id"] + " " + i18n[lang].blog;
            }
        },
        keywords: function () {
            return config["keywords"];
        },
        image: function () {
            return blog_owner["img"];
        },
        url: function () {
            return model["url"] + "/blog/" + blog_owner["blog_id"];
        },
        alternate_list: function () {
            var list = [];
            var url = model["url"] + "/blog/" + blog_owner["blog_id"];
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
        is_owned: function () {
            if (user === null) {
                return false;
            } else {
                return blog_owner["blog_id"] === user["blog_id"];
            }
        },
        is_friend: function () {
            if (user === null) {
                return false;
            } else {
                if (blog_owner["blog_id"] === user["blog_id"]) {
                    return false;
                } else {
                    return friend_status.is_friend;
                }
            }
        },
        profile_url: function () {
            if (user === null) {
                return config["url"];
            } else {
                return user["blog_id"] === "" ? "/set/blog-id" : "/blog/" + user["blog_id"];
            }
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
        blog_id: function () {
            return blog_owner["blog_id"];
        },
        profile_info: function () {
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
            var profile_info = blog_owner
                , is_friend = friend_status.is_friend
                , is_friend_requested = friend_status.is_friend_requested;

            if (is_friend === true) {
                is_friend_requested = false;
            }
            profile_info.i18n = i18n[lang];
            profile_info.aws_s3_url = config.aws_s3_url;
            var languages = i18n[lang][methods.get_language_text(blog_owner.main_language)];
            if (blog_owner.available_languages.length > 0) {
                for (var i = 0; i < blog_owner.available_languages.length; i++) {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        languages = languages + ", " + i18n[lang][methods.get_language_text(blog_owner.available_languages[i])];
                    } else {
                        languages = languages + "、" + i18n[lang][methods.get_language_text(blog_owner.available_languages[i])];
                    }
                }
            }
            profile_info.languages = languages;
            // 블로그 주인과 로그인한 사용자가 같을 경우, true
            if (user === null) {
                profile_info["is_owned"] = false;
                profile_info["is_not_owned"] = true;
                profile_info["is_gleantcorp"] = false;
            } else {
                profile_info["is_owned"] = blog_owner["blog_id"] === user["blog_id"];
                profile_info["is_not_owned"] = false;
                if (user.blog_id === profile_info.blog_id) {
                    profile_info["is_gleantcorp"] = methods.is_gleantcorp(user.blog_id);
                } else {
                    profile_info["is_gleantcorp"] = false;
                }
            }
            profile_info["url"] = config["url"] + "/blog/" + blog_owner["blog_id"];
            profile_info["is_loginned"] = is_loginned;
            // 로그인 타입 : 일반, 카카오, 페이스북
            var login_type = blog_owner["service"];
            if (login_type === "gleant") {
                profile_info["login_type"] = "Gleant (" + blog_owner["email"] + ")";
            } else if (login_type === "kakao") {
                profile_info["login_type"] = "Kakao";
            } else if (login_type === "facebook") {
                profile_info["login_type"] = "Facebook";
            } else {
                profile_info["login_type"] = "";
            }
            // IQ, EQ
            if (
                profile_info["is_owned"] === true &&
                profile_info["iq"] === 0 &&
                profile_info["eq"] === 0
            ) {
                profile_info["is_iq_eq_empty_and_owned"] = true;
                profile_info["iq_eq"] = i18n[lang].please_enter_iq_eq;
            } else {
                profile_info["is_iq_eq_empty_and_owned"] = false;
                if (
                    profile_info["iq"] === 0
                ) { /* IQ가 존재하지 않을 경우 */
                    if (
                        profile_info["eq"] === 0
                    ) { /* EQ가 존재하지 않을 경우 */
                        profile_info["iq_eq"] = "";
                    } else { /* EQ가 존재하는 경우 */
                        profile_info["iq_eq"] = profile_info["eq"] + " (EQ)";
                    }
                } else { /* IQ가 존재하는 경우 */
                    if (
                        profile_info["eq"] === 0
                    ) { /* EQ가 존재하지 않을 경우 */
                        profile_info["iq_eq"] = profile_info["iq"] + " (IQ)";
                    } else { /* EQ가 존재하는 경우 */
                        profile_info["iq_eq"] = profile_info["iq"] + " (IQ) · " + profile_info["eq"] + " (EQ)";
                    }
                }
            }
            if (
                (profile_info["is_owned"] === true) &&
                (profile_info["iq"] !== 0 ||
                profile_info["eq"] !== 0)
            ) {
                profile_info["show_edit_iq_eq"] = true;
            } else {
                profile_info["show_edit_iq_eq"] = false;
            }
            // 직업 비워있으면 true, 아니면 false
            if (
                profile_info["simple_career"] === "" ||
                profile_info["simple_career"] === i18n["en"].please_enter_occupation ||
                profile_info["simple_career"] === i18n["ja"].please_enter_occupation ||
                profile_info["simple_career"] === i18n["ko"].please_enter_occupation ||
                profile_info["simple_career"] === i18n["zh-Hans"].please_enter_occupation
            ) {
                if (profile_info["is_owned"] === true) {
                    profile_info["simple_career"] = i18n[lang].please_enter_occupation;
                }
                profile_info["is_simple_career_empty"] = true;
            } else {
                profile_info["is_simple_career_empty"] = false;
            }
            if ((profile_info["is_simple_career_empty"] === false) && (profile_info["is_owned"] === true)) {
                profile_info["is_simple_career_not_empty_and_owned"] = true;
            } else {
                profile_info["is_simple_career_not_empty_and_owned"] = false;
            }
            // 직업 Display Profile (✔)
            if ((profile_info["show_simple_career"] === true) && (profile_info["is_owned"] === true)) {
                profile_info["is_show_simple_career_and_owned"] = true;
            } else {
                profile_info["is_show_simple_career_and_owned"] = false;
            }
            // 자기소개 비워있으면 true, 아니면 false
            if (profile_info["self_introduction"] === "") {
                if (profile_info["is_owned"] === true) {
                    profile_info["self_introduction"] = i18n[lang].please_enter_self_introduction;
                }
                profile_info["is_self_introduction_empty"] = true;
            } else {
                profile_info["is_self_introduction_empty"] = false;
            }
            if ((profile_info["is_self_introduction_empty"] === false) && (profile_info["is_owned"] === true)) {
                profile_info["is_self_introduction_not_empty_and_owned"] = true;
            } else {
                profile_info["is_self_introduction_not_empty_and_owned"] = false;
            }
            // Is mobile?
            profile_info["is_mobile"] = is_mobile;
            // Friends Element
            var img, img2, span, span2;
            if (profile_info["is_owned"] === true) { /* Owner */
                profile_info["friend_request_element"] = "";
                img = "<img class='emoticon-small-img' src='" + config.aws_s3_url + "/icons/friends.png" + config.css_version + "'>";
                span = "<span>" + i18n[lang].friends + "</span>";
                span2 = "<span class='friend-counts' data-count='" + methods.put_comma_between_three_digits(profile_info["friends"].length) + "'>" + profile_info["friends"].length + "</span>";
                profile_info["friends_element"] = "<div class='show-friends'>" + img + span + span2 + "</div>";
            } else {
                if (is_friend === true) {
                    profile_info["friend_request_element"] = "";
                    img = "<img class='emoticon-small-img' src='" + config.aws_s3_url + "/icons/friends.png" + config.css_version + "'>";
                    span = "<span>" + i18n[lang].friends + "</span>";
                    span2 = "<span class='friend-counts' data-count='" + methods.put_comma_between_three_digits(profile_info["friends"].length) + "'>" + profile_info["friends"].length + "</span>";
                    profile_info["friends_element"] = "<div class='show-friends'>" + img + span + span2 + "</div>";
                } else {
                    if (is_friend_requested === true) {
                        img = "<img class='emoticon-small-img' src='" + config.aws_s3_url + "/icons/friends.png" + config.css_version + "'>";
                        span = "<span>" + i18n[lang].friend_request + " ✔</span>";
                        profile_info["friend_request_element"] = "<div class='requested-friend' data-blog-id='" + profile_info["blog_id"] + "'>" + img + span + "</div>";
                        profile_info["friends_element"] = "";
                    } else {
                        img = "<img class='emoticon-small-img' src='" + config.aws_s3_url + "/icons/friends.png" + config.css_version + "'>";
                        span = "<span style='vertical-align: middle;'>" + i18n[lang].friend_request + "</span>";
                        img2 = "<img class='emoticon-small-img2' src='" + config.aws_s3_url + "/icons/add.png" + config.css_version + "'>";
                        profile_info["friend_request_element"] = "<div class='request-add-friend' data-blog-id='" + profile_info["blog_id"] + "'>" + img + span + img2 + "</div>";
                        profile_info["friends_element"] = "";
                    }
                }
            }
            if (profile_info["is_owned"] === true) {
                img = "<img class='emoticon-small-img' src='" + config.aws_s3_url + "/icons/invitations.png" + config.css_version + "'>";
                span = "<span>" + i18n[lang].invitations + "</span>";
                profile_info["invitations_element"] = "<div class='show-invitations'>" + img + span + "</div>";
                img = "<img class='emoticon-small-img' src='" + config.aws_s3_url + "/icons/setting.png" + config.css_version + "'>";
                span = "<span>" + i18n[lang].setting + "</span>";
                profile_info["specific_info_element"] = "<div class='set-specific-info'>" + img + span + "</div>";
            } else {
                profile_info["invitations_element"] = "";
                profile_info["specific_info_element"] = "";
            }
            if (
                profile_info["is_owned"] === false &&
                profile_info["is_loginned"] === true
            ) {
                profile_info["is_loginned_not_owned"] = true;
            } else {
                profile_info["is_loginned_not_owned"] = false;
            }
            if ((profile_info["employment"].length > 0) && (profile_info["is_owned"] === false)) {
                profile_info["is_employment_not_empty_and_not_owned"] = true;
            } else {
                profile_info["is_employment_not_empty_and_not_owned"] = false;
            }
            if ((profile_info["education"].length > 0) && (profile_info["is_owned"] === false)) {
                profile_info["is_education_not_empty_and_not_owned"] = true;
            } else {
                profile_info["is_education_not_empty_and_not_owned"] = false;
            }
            if ((profile_info["prize"].length > 0) && (profile_info["is_owned"] === false)) {
                profile_info["is_prize_not_empty_and_not_owned"] = true;
            } else {
                profile_info["is_prize_not_empty_and_not_owned"] = false;
            }
            if ((profile_info["location"].length > 0) && (profile_info["is_owned"] === false)) {
                profile_info["is_location_not_empty_and_not_owned"] = true;
            } else {
                profile_info["is_location_not_empty_and_not_owned"] = false;
            }
            if ((profile_info["website"].length > 0) && (profile_info["is_owned"] === false)) {
                profile_info["is_website_not_empty_and_not_owned"] = true;
            } else {
                profile_info["is_website_not_empty_and_not_owned"] = false;
            }
            if (is_loginned === false) {
                profile_info["is_employment_not_empty_and_not_owned"] = false;
                profile_info["is_education_not_empty_and_not_owned"] = false;
                profile_info["is_prize_not_empty_and_not_owned"] = false;
                profile_info["is_location_not_empty_and_not_owned"] = false;
                profile_info["is_website_not_empty_and_not_owned"] = false;
            }

            // 블로그 주인이 아니면서, 경력, 학력, 수상내역, 거주지 전부 비어있는 경우
            if (
                (profile_info["is_owned"] === false) &&
                (profile_info["employment"].length === 0) &&
                (profile_info["education"].length === 0) &&
                (profile_info["location"].length === 0) &&
                (profile_info["prize"].length === 0)
            ) {
                profile_info["is_all_career_empty_and_not_owned"] = true;
            } else {
                profile_info["is_all_career_empty_and_not_owned"] = false;
            }

            var date = "";
            // 경력 목록 정리
            var company;
            for (var i = 0; i < profile_info["employment"].length; i++) {
                company = "";
                if (profile_info["employment"][i]["company"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        company = company + profile_info["employment"][i]["company"] + " ";
                    } else {
                        company = company + profile_info["employment"][i]["company"];
                    }
                }
                company = company + profile_info["employment"][i]["position"];

                date = "";
                if (profile_info["employment"][i]["start_year"] !== 0) {
                    if (profile_info["employment"][i]["start_month"] !== 0) {
                        if (profile_info["employment"][i]["start_day"] !== 0) {
                            date = profile_info["employment"][i]["start_year"] + "." + methods.convert_to_two_digits(profile_info["employment"][i]["start_month"]) + "." + methods.convert_to_two_digits(profile_info["employment"][i]["start_day"]);
                        } else {
                            date = profile_info["employment"][i]["start_year"] + "." + methods.convert_to_two_digits(profile_info["employment"][i]["start_month"]);
                        }
                    } else {
                        date = profile_info["employment"][i]["start_year"];
                    }
                }

                if (profile_info["employment"][i]["ing"] === 1) {
                    date = date + "~" + i18n[lang].now + " ";
                } else {
                    if (profile_info["employment"][i]["end_year"] !== 0) {
                        date = date + "~";
                        if (profile_info["employment"][i]["end_month"] !== 0) {
                            if (profile_info["employment"][i]["end_day"] !== 0) {
                                date = date + profile_info["employment"][i]["end_year"] + "." + methods.convert_to_two_digits(profile_info["employment"][i]["end_month"]) + "." + methods.convert_to_two_digits(profile_info["employment"][i]["end_day"]);
                            } else {
                                date = date + profile_info["employment"][i]["end_year"] + "." + methods.convert_to_two_digits(profile_info["employment"][i]["end_month"]);
                            }
                        } else {
                            date = date + profile_info["employment"][i]["end_year"];
                        }
                        date = date + " ";
                    } else {
                        if (date !== "") {
                            date = date + "~ ";
                        }
                    }
                }
                profile_info["employment"][i]["employment_content"] = date + company;
                profile_info["employment"][i]["is_owned"] = profile_info["is_owned"];
                profile_info["employment"][i]["is_owned_and_show"] = profile_info["is_owned"] && profile_info["employment"][i]["show"];
                profile_info["employment"][i]["aws_s3_url"] = config.aws_s3_url;
                profile_info["employment"][i].css_version = config.css_version;
                profile_info["employment"][i].i18n_edit = i18n[lang].edit;
            }

            // 학력 목록 정리
            var education;
            for (var i = 0; i < profile_info["education"].length; i++) {
                education = profile_info["education"][i]["school"];
                if (profile_info["education"][i]["major"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        education = education + " " + profile_info["education"][i]["major"];
                    } else {
                        education = education + profile_info["education"][i]["major"];
                    }
                }
                if (profile_info["education"][i]["minor"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        education = education + " " + profile_info["education"][i]["minor"];
                    } else {
                        education = education + profile_info["education"][i]["minor"];
                    }
                }
                if (profile_info["education"][i]["degree"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        education = education + " " + profile_info["education"][i]["degree"];
                    } else {
                        education = education + profile_info["education"][i]["degree"];
                    }
                }

                date = "";
                if (profile_info["education"][i]["start_year"] !== 0) {
                    if (profile_info["education"][i]["start_month"] !== 0) {
                        if (profile_info["education"][i]["start_day"] !== 0) {
                            date = profile_info["education"][i]["start_year"] + "." + methods.convert_to_two_digits(profile_info["education"][i]["start_month"]) + "." + methods.convert_to_two_digits(profile_info["education"][i]["start_day"]);
                        } else {
                            date = profile_info["education"][i]["start_year"] + "." + methods.convert_to_two_digits(profile_info["education"][i]["start_month"]);
                        }
                    } else {
                        date = profile_info["education"][i]["start_year"];
                    }
                }

                if (profile_info["education"][i]["ing"] === 1) {
                    date = date + "~" + i18n[lang].now + " ";
                } else {
                    if (profile_info["education"][i]["end_year"] !== 0) {
                        date = date + "~";
                        if (profile_info["education"][i]["end_month"] !== 0) {
                            if (profile_info["education"][i]["end_day"] !== 0) {
                                date = date + profile_info["education"][i]["end_year"] + "." + methods.convert_to_two_digits(profile_info["education"][i]["end_month"]) + "." + methods.convert_to_two_digits(profile_info["education"][i]["end_day"]);
                            } else {
                                date = date + profile_info["education"][i]["end_year"] + "." + methods.convert_to_two_digits(profile_info["education"][i]["end_month"]);
                            }
                        } else {
                            date = date + profile_info["education"][i]["end_year"];
                        }
                        date = date + " ";
                    } else {
                        if (date !== "") {
                            date = date + "~ ";
                        }
                    }
                }

                profile_info["education"][i]["education_content"] = date + education;
                profile_info["education"][i]["is_owned"] = profile_info["is_owned"];
                profile_info["education"][i]["is_owned_and_show"] = profile_info["is_owned"] && profile_info["education"][i]["show"];
                profile_info["education"][i]["aws_s3_url"] = config.aws_s3_url;
                profile_info["education"][i].css_version = config.css_version;
                profile_info["education"][i].i18n_edit = i18n[lang].edit;
            }

            // 수상내역 목록 정리
            var prize;
            for (var i = 0; i < profile_info["prize"].length; i++) {
                prize = profile_info["prize"][i]["item"];

                date = "";
                if (profile_info["prize"][i]["received_year"] !== 0) {
                    if (profile_info["prize"][i]["received_month"] !== 0) {
                        if (profile_info["prize"][i]["received_day"] !== 0) {
                            date = profile_info["prize"][i]["received_year"] + "." + profile_info["prize"][i]["received_month"] + "." + profile_info["prize"][i]["received_day"] + " ";
                        } else {
                            date = profile_info["prize"][i]["received_year"] + "." + profile_info["prize"][i]["received_month"] + " ";
                        }
                    } else {
                        date = profile_info["prize"][i]["received_year"] + " ";
                    }
                }

                profile_info["prize"][i]["prize_content"] = date + prize;
                profile_info["prize"][i]["is_owned"] = profile_info["is_owned"];
                profile_info["prize"][i]["is_owned_and_show"] = profile_info["is_owned"] && profile_info["prize"][i]["show"];
                profile_info["prize"][i]["aws_s3_url"] = config.aws_s3_url;
                profile_info["prize"][i].css_version = config.css_version;
                profile_info["prize"][i].i18n_edit = i18n[lang].edit;
            }

            // 거주지 목록 정리
            var location;
            for (var i = 0; i < profile_info["location"].length; i++) {
                location = profile_info["location"][i]["country"];
                if (profile_info["location"][i]["city"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        location = location + " " + profile_info["location"][i]["city"];
                    } else {
                        location = location + profile_info["location"][i]["city"];
                    }
                }

                date = "";
                if (profile_info["location"][i]["start_year"] !== 0) {
                    if (profile_info["location"][i]["start_month"] !== 0) {
                        if (profile_info["location"][i]["start_day"] !== 0) {
                            date = profile_info["location"][i]["start_year"] + "." + methods.convert_to_two_digits(profile_info["location"][i]["start_month"]) + "." + methods.convert_to_two_digits(profile_info["location"][i]["start_day"]);
                        } else {
                            date = profile_info["location"][i]["start_year"] + "." + methods.convert_to_two_digits(profile_info["location"][i]["start_month"]);
                        }
                    } else {
                        date = profile_info["location"][i]["start_year"];
                    }
                }

                if (profile_info["location"][i]["ing"] === 1) {
                    date = date + "~" + i18n[lang].now + " ";
                } else {
                    if (profile_info["location"][i]["end_year"] !== 0) {
                        date = date + "~";
                        if (profile_info["location"][i]["end_month"] !== 0) {
                            if (profile_info["location"][i]["end_day"] !== 0) {
                                date = date + profile_info["location"][i]["end_year"] + "." + methods.convert_to_two_digits(profile_info["location"][i]["end_month"]) + "." + methods.convert_to_two_digits(profile_info["location"][i]["end_day"]);
                            } else {
                                date = date + profile_info["location"][i]["end_year"] + "." + methods.convert_to_two_digits(profile_info["location"][i]["end_month"]);
                            }
                        } else {
                            date = date + profile_info["location"][i]["end_year"];
                        }
                        date = date + " ";
                    } else {
                        if (date !== "") {
                            date = date + "~ ";
                        }
                    }
                }

                profile_info["location"][i]["location_content"] = date + location;
                profile_info["location"][i]["is_owned"] = profile_info["is_owned"];
                profile_info["location"][i]["is_owned_and_show"] = profile_info["is_owned"] && profile_info["location"][i]["show"];
                profile_info["location"][i]["aws_s3_url"] = config.aws_s3_url;
                profile_info["location"][i].css_version = config.css_version;
                profile_info["location"][i].i18n_edit = i18n[lang].edit;
            }

            // 웹사이트
            for (var i = 0; i < profile_info["website"].length; i++) {
                profile_info["website"][i]["is_owned"] = profile_info["is_owned"];
                profile_info["website"][i]["aws_s3_url"] = config.aws_s3_url;
                profile_info["website"][i].css_version = config.css_version;
                profile_info["website"][i].link = profile_info["website"][i].protocol + "://" + profile_info["website"][i].url;
                profile_info["website"][i].i18n_edit = i18n[lang].edit;
            }

            // 블로그 오늘 조회수, 전체 조회수
            var now = methods.to_eight_digits_date();

            if (profile_info["today"] === now) {
                profile_info["count_today_view"] = Number(profile_info["count_today_view"] + 1).toLocaleString('en') + "";
            } else {
                profile_info["count_today_view"] = "1";
            }

            profile_info["count_total_view"] = Number(profile_info["count_total_view"] + 1).toLocaleString('en');

            // 블로그 주인 최고야 개수
            if (profile_info["count_awesome"] < 0) {
                profile_info["count_awesome"] = 0;
            }
            profile_info["count_awesome"] = Number(profile_info["count_awesome"]).toLocaleString('en');

            // ranking 0 이면 없음으로 변경
            if (profile_info["ranking"] === 0) {
                profile_info["ranking"] = i18n[lang].none;
            }

            /* blog_menu 및 게시물 관련 설정 */
            profile_info["is_debate_selected"] = blog_menu["blog_menu_id"] === "debate";
            profile_info["is_employment_selected"] = blog_menu["blog_menu_id"] === "employment";
            profile_info["is_participation_selected"] = blog_menu["blog_menu_id"] === "participation";
            profile_info["is_subscription_selected"] = blog_menu["blog_menu_id"] === "subscription";

            profile_info["is_hire_me_selected"] = blog_menu["is_hire_me_selected"];
            profile_info["is_apply_now_selected"] = blog_menu["is_apply_now_selected"];
            profile_info["is_agenda_selected"] = blog_menu["is_agenda_selected"];
            profile_info["is_opinion_selected"] = blog_menu["is_opinion_selected"];
            profile_info["is_translation_selected"] = blog_menu["is_translation_selected"];

            if (profile_info["is_participation_selected"] === true) {
                if (profile_info["is_agenda_selected"] === true) {
                    profile_info["is_debate_participation_selected"] = true;
                } else {
                    profile_info["is_debate_participation_selected"] = false;
                }
                if (
                    profile_info["is_hire_me_selected"] === true ||
                    profile_info["is_apply_now_selected"] === true
                ) {
                    profile_info["is_employment_participation_selected"] = true;
                } else {
                    profile_info["is_employment_participation_selected"] = false;
                }
            } else {
                profile_info["is_debate_participation_selected"] = false;
                profile_info["is_employment_participation_selected"] = false;
            }

            if (profile_info["is_subscription_selected"] === true) {
                if (
                    profile_info["is_agenda_selected"] === true ||
                    profile_info["is_opinion_selected"] === true ||
                    profile_info["is_translation_selected"] === true
                ) {
                    profile_info["is_debate_subscription_selected"] = true;
                } else {
                    profile_info["is_debate_subscription_selected"] = false;
                }
                if (
                    profile_info["is_hire_me_selected"] === true ||
                    profile_info["is_apply_now_selected"] === true
                ) {
                    profile_info["is_employment_subscription_selected"] = true;
                } else {
                    profile_info["is_employment_subscription_selected"] = false;
                }
                if (
                    profile_info["is_agenda_selected"] === false &&
                    profile_info["is_opinion_selected"] === false &&
                    profile_info["is_translation_selected"] === false &&
                    profile_info["is_hire_me_selected"] === false &&
                    profile_info["is_apply_now_selected"] === false
                ) {
                    profile_info["is_blog_subscription_selected"] = true;
                } else {
                    profile_info["is_blog_subscription_selected"] = false;
                }
            } else {
                profile_info["is_debate_subscription_selected"] = false;
                profile_info["is_employment_subscription_selected"] = false;
                profile_info["is_blog_subscription_selected"] = false;
            }

            profile_info["debate_in_progress_class"] = "blog-debate-second-floor-item";
            profile_info["debate_scheduled_class"] = "blog-debate-second-floor-item";
            profile_info["debate_finished_class"] = "blog-debate-second-floor-item";
            profile_info["debate_unlimited_class"] = "blog-debate-second-floor-item";

            profile_info["participation_in_progress_class"] = "blog-participation-debate-first-floor-item";
            profile_info["participation_scheduled_class"] = "blog-participation-debate-first-floor-item";
            profile_info["participation_finished_class"] = "blog-participation-debate-first-floor-item";
            profile_info["participation_unlimited_class"] = "blog-participation-debate-first-floor-item";

            profile_info["subscription_in_progress_class"] = "blog-subscription-debate-second-floor-item";
            profile_info["subscription_scheduled_class"] = "blog-subscription-debate-second-floor-item";
            profile_info["subscription_finished_class"] = "blog-subscription-debate-second-floor-item";
            profile_info["subscription_unlimited_class"] = "blog-subscription-debate-second-floor-item";

            if (profile_info["is_agenda_selected"] === true) {
                if (
                    blog_menu["agenda_menu"] === "in-progress-agenda" ||
                    blog_menu["agenda_menu"] === "in-progress-agenda-participation" ||
                    blog_menu["agenda_menu"] === "in-progress-agenda-subscription"
                ) {
                    profile_info["debate_in_progress_class"] = profile_info["debate_in_progress_class"] + " selected";
                    profile_info["participation_in_progress_class"] = profile_info["participation_in_progress_class"] + " selected";
                    profile_info["subscription_in_progress_class"] = profile_info["subscription_in_progress_class"] + " selected";
                } else if (
                    blog_menu["agenda_menu"] === "scheduled-agenda" ||
                    blog_menu["agenda_menu"] === "scheduled-agenda-participation" ||
                    blog_menu["agenda_menu"] === "scheduled-agenda-subscription"
                ) {
                    profile_info["debate_scheduled_class"] = profile_info["debate_scheduled_class"] + " selected";
                    profile_info["participation_scheduled_class"] = profile_info["participation_scheduled_class"] + " selected";
                    profile_info["subscription_scheduled_class"] = profile_info["subscription_scheduled_class"] + " selected";
                } else if (
                    blog_menu["agenda_menu"] === "finished-agenda" ||
                    blog_menu["agenda_menu"] === "finished-agenda-participation" ||
                    blog_menu["agenda_menu"] === "finished-agenda-subscription"
                ) {
                    profile_info["debate_finished_class"] = profile_info["debate_finished_class"] + " selected";
                    profile_info["participation_finished_class"] = profile_info["participation_finished_class"] + " selected";
                    profile_info["subscription_finished_class"] = profile_info["subscription_finished_class"] + " selected";
                } else if (
                    blog_menu["agenda_menu"] === "unlimited-agenda" ||
                    blog_menu["agenda_menu"] === "unlimited-agenda-participation" ||
                    blog_menu["agenda_menu"] === "unlimited-agenda-subscription"
                ) {
                    profile_info["debate_unlimited_class"] = profile_info["debate_unlimited_class"] + " selected";
                    profile_info["participation_unlimited_class"] = profile_info["participation_unlimited_class"] + " selected";
                    profile_info["subscription_unlimited_class"] = profile_info["subscription_unlimited_class"] + " selected";
                }
            }

            var final_list = [];

            for (var i = 0; i < blog_owner["blog_menu"].length; i++) {
                if (
                    blog_owner["blog_menu"][i]._id === "participation" ||
                    blog_owner["blog_menu"][i]._id === "subscription"
                ) {
                    if (user && user.blog_id === blog_owner.blog_id) {
                        final_list.push(blog_owner["blog_menu"][i]);
                    } else {
                        continue;
                    }
                } else {
                    final_list.push(blog_owner["blog_menu"][i]);
                }
            }

            var bulletin_board_counter = 1;
            for (var i = 0; i < final_list.length; i++) {
                /* empty title일 경우, i18n으로 변경. */
                if (final_list[i].title === "") {
                    if (final_list[i]._id === "debate") { /* Debate */
                        final_list[i].title = i18n[lang].debate;
                    } else if (final_list[i]._id === "employment") { /* Employment */
                        delete final_list[i];
                        continue;
                        //final_list[i].title = i18n[lang].employment;
                    } else if (final_list[i]._id === "participation") { /* Participation */
                        final_list[i].title = i18n[lang].participation;
                    } else if (final_list[i]._id === "subscription") { /* Subscription */
                        final_list[i].title = i18n[lang].subscription;
                    } else if (final_list[i]._id === "gallery") { /* Gallery */
                        final_list[i].title = i18n[lang].album;
                    } else if (final_list[i]._id === "guestbook") { /* Guest Book */
                        final_list[i].title = i18n[lang].guest_book;
                    } else { /* 게시판인 경우 */
                        if (bulletin_board_counter === 1) {
                            final_list[i].title = i18n[lang].bulletin_board;
                        } else {
                            final_list[i].title = i18n[lang].bulletin_board + bulletin_board_counter;
                        }
                        bulletin_board_counter = bulletin_board_counter + 1;
                    }
                }

                final_list[i]["blog_id"] = profile_info["blog_id"];
                if (blog_menu["blog_menu_id"] === final_list[i]["_id"]) {
                    final_list[i]["is_selected"] = true;
                    profile_info["selected_blog_menu_title"] = final_list[i]["title"];
                } else {
                    final_list[i]["is_selected"] = false;
                }

                if (final_list[i]["_id"] === "debate") {
                    final_list[i]["is_debate"] = true;
                } else {
                    final_list[i]["is_debate"] = false;
                }
            }
            profile_info["blog_menu"] = final_list;
            profile_info["is_list"] = blog_menu["is_list"];
            profile_info["is_write"] = blog_menu["is_write"];
            profile_info["blog_menu_id"] = blog_menu["blog_menu_id"];

            var article_none = ""
                , article_list = ""
                , blog_image_list = "";
            if (
                blog_menu["blog_menu_id"] === "debate"
            ) { /* Debate */
                if (blog_menu["is_agenda_selected"] === true) {
                    article_none = i18n[lang].there_is_no_agenda;
                } else {
                    if (blog_menu["is_opinion_selected"] === true) {
                        article_none = i18n[lang].there_is_no_opinion;
                    } else {
                        article_none = i18n[lang].there_is_no_translation;
                    }
                }
                profile_info["is_blog"] = false;
                profile_info["is_gallery"] = false;
                profile_info["is_guestbook"] = false;
            } else if (blog_menu["blog_menu_id"] === "employment") { /* Employment */
                article_none = i18n[lang].there_is_no_writing;
                profile_info["is_blog"] = false;
                profile_info["is_gallery"] = false;
                profile_info["is_guestbook"] = false;
            } else if (blog_menu["blog_menu_id"] === "gallery") { /* Album */
                article_none = i18n[lang].there_is_no_image;
                profile_info["is_blog"] = false;
                profile_info["is_gallery"] = true;
                profile_info["is_guestbook"] = false;
            } else if (
                blog_menu["blog_menu_id"] === "participation" ||
                blog_menu["blog_menu_id"] === "subscription"
            ) { /* Participation || Subscription */
                if (blog_menu["is_agenda_selected"] === true) {
                    article_none = i18n[lang].there_is_no_agenda;
                } else {
                    if (blog_menu["is_opinion_selected"] === true) {
                        article_none = i18n[lang].there_is_no_opinion;
                    } else {
                        if (blog_menu["is_translation_selected"] === true) {
                            article_none = i18n[lang].there_is_no_translation;
                        } else {
                            article_none = i18n[lang].there_is_no_writing;
                        }
                    }
                }
                profile_info["is_blog"] = false;
                profile_info["is_gallery"] = false;
                profile_info["is_guestbook"] = false;
            } else if (blog_menu["blog_menu_id"] === "guestbook") { /* Guestbook */
                article_none = i18n[lang].there_is_no_guest_book_writing;
                profile_info["is_blog"] = false;
                profile_info["is_gallery"] = false;
                if (is_loginned === true) {
                    if (user.blog_id === blog_owner.blog_id) {
                        profile_info["is_guestbook"] = false;
                    } else {
                        profile_info["is_guestbook"] = true;
                    }
                } else {
                    profile_info["is_guestbook"] = false;
                }
            } else {
                article_none = i18n[lang].there_is_no_writing; /* Bulletin Board */
                profile_info["is_blog"] = true;
                profile_info["is_gallery"] = false;
                profile_info["is_guestbook"] = false;
            }
            if (blog_menu["is_write"] === false) { /* No Write */
                if (blog_menu["is_list"] === true) { /* List */
                    if (articles === null || articles.length === 0 || articles === undefined) {
                        profile_info["multi_articles"] = "<div class='blog-article-none'>" + article_none + "</div>";
                        profile_info["is_more"] = false;
                    } else {
                        if (
                            profile_info["is_apply_now_selected"] === true ||
                            profile_info["is_hire_me_selected"] === true
                        ) {
                            for (var i = 0; i < articles.length; i++) {
                                article_list = article_list + article_templates.get_single_normal_employment(lang, is_loginned, articles[i]);
                            }
                        } else {
                            if (blog_menu["blog_menu_id"] === "guestbook") {
                                for (var i = 0; i < articles.length; i++) {
                                    if (user === null) {
                                        article_list = article_list + article_templates.get_single_perfect_guestbook(lang, articles[i], is_loginned, null, null, 'blog');
                                    } else {
                                        article_list = article_list + article_templates.get_single_perfect_guestbook(lang, articles[i], is_loginned, user, user["blog_id"], 'blog');
                                    }
                                }
                            } else {
                                for (var i = 0; i < articles.length; i++) {
                                    article_list = article_list + article_templates.get_single_normal_article(lang, is_loginned, articles[i], 'blog');
                                }
                            }
                        }
                        profile_info["multi_articles"] = article_list;
                        if (blog_menu["blog_menu_id"] === "guestbook") {
                            if ( articles.length < limit["guestbook"]) {
                                profile_info["is_more"] = false;
                            } else {
                                profile_info["is_more"] = true;
                            }
                        } else {
                            if ( articles.length < limit["articles"]) {
                                profile_info["is_more"] = false;
                            } else {
                                profile_info["is_more"] = true;
                            }
                        }

                        /**
                         * [원본 정렬] 이미지 목록
                         */
                        if (blog_menu["blog_menu_id"] === "gallery") {
                            for (var i = 0; i < articles.length; i++) {
                                blog_image_list = blog_image_list + article_templates.get_single_flexible_image(lang, articles[i], 'blog');
                            }
                            profile_info["multi_images"] = blog_image_list;
                        }
                    }
                    /* normal로 보내기 */
                } else { /* 단일 게시물일 경우 */
                    profile_info["is_more"] = false;
                    profile_info["is_gallery"] = false;
                    profile_info["is_guestbook"] = false;
                    if (articles === null || articles === undefined) {
                        profile_info["single_article"] = "<div class='blog-article-none'>" + article_none + "</div>";
                    } else {
                        if (blog_menu["blog_menu_id"] === "guestbook") {
                            if (user === null) {
                                profile_info["single_article"] = article_templates.get_single_perfect_guestbook(lang, articles, is_loginned, user, null, 'blog');
                            } else {
                                profile_info["single_article"] = article_templates.get_single_perfect_guestbook(lang, articles, is_loginned, user, user["blog_id"], 'blog');
                            }
                        } else {
                            if (user === null) {
                                profile_info["single_article"] = article_templates.get_single_perfect_article(lang, articles, is_mobile, is_loginned, null, 'blog');
                            } else {
                                profile_info["single_article"] = article_templates.get_single_perfect_article(lang, articles, is_mobile, is_loginned, user["blog_id"], 'blog');
                            }
                        }
                    }
                }
            } else { /* Write */
                profile_info["articles"] = null;
                profile_info["is_more"] = false;
                profile_info["is_blog"] = false;
                profile_info["is_gallery"] = false;
            }
            /* SEX */
            if (profile_info["sex"] === "male") {
                profile_info["i18n_sex"] = i18n[lang].male;
            } else {
                profile_info["i18n_sex"] = i18n[lang].female;
            }
            /* Verified Profile */
            if (profile_info["verified_profile"] !== "") {
                profile_info["verified_profile"] = "<span id='user-verified-profile'>(" + methods.get_encoded_html_preventing_xss(profile_info["verified_profile"]) + ")</span>";
            }
            /* User Info */
            profile_info["user"] = user;
            profile_info["i18n_birth_date"] = methods.get_i18n_year_month_date({ lang: lang, year: profile_info["birth_year"], month: profile_info["birth_month"] - 1, date: profile_info["birth_day"] });
            return profile_info;
        }
    });
};