var simple_profile = {};
simple_profile["get"] = {};
simple_profile["update"] = {};
simple_profile["get"]["user_from_kingdom"] = function (obj){
    if (!obj["blog_id"]) {
        return obj["f_cb"]();
    }
    methods["the_world"]["is_one"]({
        show_animation: false,
        data:{blog_id: encodeURIComponent(obj["blog_id"])},
        pathname:"/get/simple-profile",
        s_cb:obj["s_cb"],
        f_cb:obj["f_cb"]
    });
};
simple_profile["update"]["simple_profile"] = function (e, id) {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var s_cb = function (result) {
        animation("wait", "stop");
        if ( result['response'] === true ) {
            var user = result['doc'];
            var layout, top, user_profile, user_profile_left, user_profile_img, user_profile_right, user_name, blog_id, blog_id_a;
            var middle, ul, simple_career_li, employment_li, employment_img, employment_span, education_li, education_img, education_span, prize_li, prize_img, prize_span, location_li, location_img, location_span;
            var awesome_counts_li, awesome_counts, awesome_counts_img, awesome_counts_span;
            var bottom, bottom_left, bottom_left_span, bottom_middle, bottom_middle_span, bottom_right, bottom_right_a, bottom_right_span;
            var css_version = $("body").attr("data-css-version");
            var is_loginned = $("body").attr("data-check") === "true";
            var img
                , is_friend = user.is_friend
                , is_friend_requested = user.is_friend_requested
                , languages;
            blog_id_a = "<a href='/blog/" + user["blog_id"] + "'>@" + user["blog_id"] + "</a>";
            blog_id = "<div class='blog-id'>" + blog_id_a + "</div>";
            user_name = "<div class='user-name2'>" + get_encoded_html_preventing_xss(user["name"]) + "</div>";
            languages = i18n[lang][get_language_text(user.main_language)];
            if (user.available_languages.length > 0) {
                for (var i = 0; i < user.available_languages.length; i++) {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        languages = languages + ", " + i18n[lang][get_language_text(user.available_languages[i])];
                    } else {
                        languages = languages + "、" + i18n[lang][get_language_text(user.available_languages[i])];
                    }
                }
            }
            /*languages = "<div class='user-languages'>" + languages + "</div>";*/
            languages = "";
            user_profile_right = "<div class='user-profile2-right'>" + user_name + blog_id + languages + "</div>";
            img = user["img"];
            user_profile_img = "<img src='" + img + "' alt='" + get_encoded_html_preventing_xss(user["name"]) + "' title='" + get_encoded_html_preventing_xss(user["name"]) + "'>";
            user_profile_left = "<div class='user-profile2-left'>" + user_profile_img + "</div>";
            user_profile = "<div class='user-profile2'>" + user_profile_left + user_profile_right + "</div>";
            top = "<div class='simple-profile-top'>" + user_profile + "</div>";
            if (user["simple_career"] === "") {
                simple_career_li = "";
            } else {
                simple_career_li = "<li>" + get_encoded_html_preventing_xss(user["simple_career"]) + "</li>";
            }
            if (user["employment"].length === 0) {
                employment_li = "";
            } else {
                employment_img = "<img class='emoticon-img' src='" + aws_s3_url + "/icons/employment.png" + css_version + "'>";
                employment_span = "<span style='vertical-align:middle;'>" + get_encoded_html_preventing_xss(get_one_line_profile["employment"]("long", user["employment"][0])) + "</span>";
                employment_li = "<li>" + employment_img + employment_span + "</li>";
            }
            if (user["education"].length === 0) {
                education_li = "";
            } else {
                education_img = "<img class='emoticon-img' src='" + aws_s3_url + "/icons/education.png" + css_version + "'>";
                education_span = "<span style='vertical-align:middle;'>" + get_encoded_html_preventing_xss(get_one_line_profile["education"]("long", user["education"][0])) + "</span>";
                education_li = "<li>" + education_img + education_span + "</li>";
            }
            if (user["prize"].length === 0) {
                prize_li = "";
            } else {
                prize_img = "<img class='emoticon-img' src='" + aws_s3_url + "/icons/prize.png" + css_version + "'>";
                prize_span = "<span style='vertical-align:middle;'>" + get_encoded_html_preventing_xss(get_one_line_profile["prize"]("long", user["prize"][0])) + "</span>";
                prize_li = "<li>" + prize_img + prize_span + "</li>";
            }
            if (user["location"].length === 0) {
                location_li = "";
            } else {
                location_img = "<img class='emoticon-img' src='" + aws_s3_url + "/icons/location.png" + css_version + "'>";
                location_span = "<span style='vertical-align:middle;'>" + get_encoded_html_preventing_xss(get_one_line_profile["location"]("long", user["location"][0])) + "</span>";
                location_li = "<li>" + location_img + location_span + "</li>";
            }
            awesome_counts_img = "<img class='emoticon-x-small-img' src='" + aws_s3_url + "/icons/awesome.png" + css_version + "' title='" + i18n[lang].awesome + "' alt='" + i18n[lang].awesome + "'>";
            if (user["count_awesome"] < 0) {
                user["count_awesome"] = 0;
            }
            awesome_counts_span = "<span>" + put_comma_between_three_digits(user["count_awesome"]) + "</span>";
            awesome_counts = "<div class='user-awesome-counts'>" + awesome_counts_img + awesome_counts_span + "</div>";
            awesome_counts_li = "<li>" + awesome_counts + "</li>";
            ul = "<ul>" + simple_career_li + employment_li + education_li + prize_li + location_li + awesome_counts_li + "</ul>";
            middle = "<div class='simple-profile-middle'>" + ul + "</div>";
            if (is_loginned === true) {
                if ($("#desktop-user-menu a").attr('href') && $("#desktop-user-menu a").attr('href') !== '/set/blog-id') {
                    if (is_friend === true) {
                        bottom_left_span = "<span>" + i18n[lang].my_friend + " ✔</span>";
                        bottom_left = "<div class='simple-profile-bottom-left my-friend'>" + bottom_left_span + "</div>";
                    } else {
                        if (is_friend_requested === true) {
                            bottom_left_span = "<span>" + i18n[lang].friend_request + " ✔</span>";
                            bottom_left = "<div class='simple-profile-bottom-left requested-friend' data-blog-id='" + user.blog_id + "'>" + bottom_left_span + "</div>";
                        } else {
                            bottom_left_span = "<span>" + i18n[lang].friend_request + "</span>";
                            bottom_left = "<div class='simple-profile-bottom-left request-add-friend' data-blog-id='" + user.blog_id + "'>" + bottom_left_span + "</div>";
                        }
                    }
                    bottom_middle_span = "<span>" + i18n[lang].send_message + "</span>";
                    bottom_middle = "<div class='simple-profile-bottom-middle'" +
                            " data-blog-id='" + user.blog_id + "'" +
                            " data-img='" + user.img + "'" +
                            " data-name='" + get_encoded_html_preventing_xss(user.name)+ "'" +
                        ">" + bottom_middle_span + "</div>";
                } else {
                    bottom_left = "";
                    bottom_middle = "";
                }
            } else {
                bottom_left = "";
                bottom_middle = "";
            }
            if ($("#desktop-user-menu a").attr('href') && $("#desktop-user-menu a").attr('href').split('/')[2] === id) {
                bottom_left = "";
                bottom_middle = "";
                bottom_right_span = "<span>" + i18n[lang].my_blog + "</span>";
            } else {
                bottom_right_span = "<span>" + i18n[lang].blog + "</span>";
            }
            bottom_right_a = "<a href='/blog/" + user["blog_id"] + "'>" + bottom_right_span + "</a>";
            bottom_right = "<div class='simple-profile-bottom-right'>" + bottom_right_a + "</div>";
            bottom = "<div class='simple-profile-bottom'>" + bottom_left + bottom_middle + bottom_right +"</div>";
            layout = "<div class='simple-profile-layout'>" + top + middle + bottom + "</div>";
            var page_y = e.pageY
                , temp_y = -40
                , page_x = (e.pageX -30) + 'px';
            if ( $(e.currentTarget).hasClass('in-body') === true ) {
                page_y = (e.pageY + $('.body-inner-main').scrollTop() + temp_y)   + 'px';
            } else if ( $(e.currentTarget).hasClass('in-written') === true ) {
                page_x = '10px';
                if ($('.prompt#agenda-prompt').css('display') === 'table') {
                    page_y = (e.pageY + $('.prompt#agenda-prompt > div > div').scrollTop() + temp_y) + 'px';
                } else if ($('.prompt#opinion-prompt').css('display') === 'table') {
                    page_y = (e.pageY + $('.prompt#opinion-prompt > div > div').scrollTop() + temp_y) + 'px';
                } else if ($('.prompt#translation-prompt').css('display') === 'table') {
                    page_y = (e.pageY + $('.prompt#translation-prompt > div > div').scrollTop() + temp_y) + 'px';
                } else {
                    page_y = (e.pageY + $('.body-inner-main').scrollTop() + temp_y) + 'px';
                }
            } else if ( $(e.currentTarget).hasClass('in-messages') === true ) {
                page_x = '10px';
                page_y = (e.pageY + $('.prompt#message-prompt > div > div').scrollTop() + temp_y) + 'px';
            } else {
                page_x = '10px';
            }
            $(e.currentTarget).find('.simple-profile-mouseentered-prompt').empty().append(layout).css('top', page_y).css('left', page_x).css('display', 'block');
            return false;
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                return show_bert('danger', 3000, i18n[lang].there_is_no_user);
            }
        }
    };
    var f_cb = function () {
        animation("wait", "stop");
        return show_bert('danger', 3000, i18n[lang].there_is_no_user);
    };
    simple_profile["get"]["user_from_kingdom"]({
        s_cb: s_cb,
        f_cb: f_cb,
        blog_id: id
    });
};
var get_one_line_profile = {};
get_one_line_profile["employment"] = function (type, doc) {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var company = ""
        , date = "";
    if (doc["company"] !== "") {
        if (
            lang === "en" ||
            lang === "ko"
        ) {
            company = company + doc["company"] + " ";
        } else {
            company = company + doc["company"];
        }
    }
    company = company + doc["position"];
    if (type === "long") {
        if (doc["start_year"] !== 0) {
            if (doc["start_month"] !== 0) {
                if (doc["start_day"] !== 0) {
                    date = doc["start_year"] + "." + convert_to_two_digits(doc["start_month"]) + "." + convert_to_two_digits(doc["start_day"]);
                } else {
                    date = doc["start_year"] + "." + convert_to_two_digits(doc["start_month"]);
                }
            } else {
                date = doc["start_year"];
            }
        }
        if (doc["ing"] === 1) {
            date = date + "~" + i18n[lang].now + " ";
        } else {
            if (doc["end_year"] !== 0) {
                date = date + "~";
                if (doc["end_month"] !== 0) {
                    if (doc["end_day"] !== 0) {
                        date = date + doc["end_year"] + "." + convert_to_two_digits(doc["end_month"]) + "." + convert_to_two_digits(doc["end_day"]);
                    } else {
                        date = date + doc["end_year"] + "." + convert_to_two_digits(doc["end_month"]);
                    }
                } else {
                    date = date + doc["end_year"];
                }
                date = date + " ";
            } else {
                if (date !== "") {
                    date = date + "~ ";
                }
            }
        }
        return date + company;
    } else if (type === "short") {
        if (doc["ing"] !== 1) {
            if (
                lang === "en" ||
                lang === "ko"
            ) {
                company = i18n[lang].previous + " " + company;
            } else {
                company = i18n[lang].previous + company;
            }
        }
        return company;
    } else {
        return "";
    }
};
get_one_line_profile["education"] = function (type, doc) {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var education = doc["school"]
        , date = "";
    if (doc["major"] !== "") {
        if (
            lang === "en" ||
            lang === "ko"
        ) {
            education = education + " " + doc["major"];
        } else {
            education = education + doc["major"];
        }
    }
    if (doc["minor"] !== "") {
        if (
            lang === "en" ||
            lang === "ko"
        ) {
            education = education + " " + doc["minor"];
        } else {
            education = education + doc["minor"];
        }
    }
    if (doc["degree"] !== "") {
        if (
            lang === "en" ||
            lang === "ko"
        ) {
            education = education + " " + doc["degree"];
        } else {
            education = education + doc["degree"];
        }
    }
    if (type === "long") {
        if (doc["start_year"] !== 0) {
            if (doc["start_month"] !== 0) {
                if (doc["start_day"] !== 0) {
                    date = doc["start_year"] + "." + convert_to_two_digits(doc["start_month"]) + "." + convert_to_two_digits(doc["start_day"]);
                } else {
                    date = doc["start_year"] + "." + convert_to_two_digits(doc["start_month"]);
                }
            } else {
                date = doc["start_year"];
            }
        }
        if (doc["ing"] === 1) {
            date = date + "~" + i18n[lang].now + " ";
        } else {
            if (doc["end_year"] !== 0) {
                date = date + "~";
                if (doc["end_month"] !== 0) {
                    if (doc["end_day"] !== 0) {
                        date = date + doc["end_year"] + "." + convert_to_two_digits(doc["end_month"]) + "." + convert_to_two_digits(doc["end_day"]);
                    } else {
                        date = date + doc["end_year"] + "." + convert_to_two_digits(doc["end_month"]);
                    }
                } else {
                    date = date + doc["end_year"];
                }
                date = date + " ";
            } else {
                if (date !== "") {
                    date = date + "~ ";
                }
            }
        }
        return date + education;
    } else if (type === "short") {
        if (doc["ing"] !== 1) {
            if (
                lang === "en" ||
                lang === "ko"
            ) {
                if (lang === "en") {
                    education =  i18n[lang].graduated_from + " " + education;
                } else {
                    education = education + " " + i18n[lang].graduated_from;
                }
            } else {
                education = education + i18n[lang].graduated_from;
            }
        }
        return education;
    } else {
        return "";
    }
};
get_one_line_profile["prize"] = function (type, doc) {
    var prize = doc["item"]
        , date = "";
    if (type === "long") {
        if (doc["received_year"] !== 0) {
            if (doc["received_month"] !== 0) {
                if (doc["received_day"] !== 0) {
                    date = doc["received_year"] + "." + doc["received_month"] + "." + doc["received_day"] + " ";
                } else {
                    date = doc["received_year"] + "." + doc["received_month"] + " ";
                }
            } else {
                date = doc["received_year"] + " ";
            }
        }
        return date + prize;
    } else if (type === "short") {
        return prize;
    } else {
        return "";
    }
};
get_one_line_profile["location"] = function (type, doc) {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var location = doc["country"]
        , date = "";
    if (doc["city"] !== "") {
        if (
            lang === "en" ||
            lang === "ko"
        ) {
            location = location + " " + doc["city"];
        } else {
            location = location + doc["city"];
        }
    }
    if (type === "long") {
        if (doc["start_year"] !== 0) {
            if (doc["start_month"] !== 0) {
                if (doc["start_day"] !== 0) {
                    date = doc["start_year"] + "." + convert_to_two_digits(doc["start_month"]) + "." + convert_to_two_digits(["start_day"]);
                } else {
                    date = doc["start_year"] + "." + convert_to_two_digits(doc["start_month"]);
                }
            } else {
                date = doc["start_year"];
            }
        }
        if (doc["ing"] === 1) {
            date = date + "~" + i18n[lang].now + " ";
        } else {
            if (doc["end_year"] !== 0) {
                date = date + "~";
                if (doc["end_month"] !== 0) {
                    if (doc["end_day"] !== 0) {
                        date = date + doc["end_year"] + "." + convert_to_two_digits(doc["end_month"]) + "." + convert_to_two_digits(doc["end_day"]);
                    } else {
                        date = date + doc["end_year"] + "." + convert_to_two_digits(doc["end_month"]);
                    }
                } else {
                    date = date + doc["end_year"];
                }
                date = date + " ";
            } else {
                if (date !== "") {
                    date = date + "~ ";
                }
            }
        }
        return date + location;
    } else if (type === "short") {
        return location;
    } else {
        return "";
    }
};
$(document).ready(function() {
    var is_mouseentered = false;
    var current_user_blog_id = null;
    var is_loginned = $("body").attr("data-check") === "true";
    var user_profile_link = $('#desktop-user-menu ul a').attr('href');
    if (user_profile_link === "/set/blog-id") {
        is_loginned = false;
    } else {
        if (user_profile_link) {
            current_user_blog_id = user_profile_link.split('/')[2];
        }
    }
    $(document).on({
        mouseenter: function(e){
            e.preventDefault();
            if (is_mobile() === true) {
                return false;
            } else {
                if (is_loginned === false) {
                    return false;
                }
                animation("wait", "play");
                is_mouseentered = true;
                setTimeout(
                    function () {
                        if (is_mouseentered === true) {
                            simple_profile["update"]["simple_profile"](e, $(e.currentTarget).attr("data-link").split("/")[2]);
                        }
                    }, 1000);
            }
        },
        mouseleave: function(e){
            e.preventDefault();
            if (is_loginned === false) {
                return false;
            }
            animation("wait", "stop");
            is_mouseentered = false;
            if (is_mobile() === false) {
                $(e.currentTarget).find('.simple-profile-mouseentered-prompt').css('display', 'none');
            }
            return false;
        }
    }, '.simple-profile-prompt-box');
    $(document).on('click', '.simple-profile-mouseentered-prompt .simple-profile-layout', function (e) {
        e.preventDefault();
        return false;
    });
    $(document).on('click', '.simple-profile-mouseentered-prompt a', function (e) {
        e.preventDefault();
        window.location = $(e.currentTarget).attr('href');
        return false;
    });
});