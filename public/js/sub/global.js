var my_history = [];
var history_to_replace = null;
var bert_alert = 0;
var is_news_comments_prompt_opened = false;
var is_message_prompt_opened = false;
var is_notification_prompt_opened = false;
var is_apply_now_prompt_opened = false;
var is_hire_me_prompt_opened = false;
var is_unicorn_prompt_opened = false;
var is_superior_prompt_opened = false;
var is_agenda_prompt_opened = false;
var is_opinion_prompt_opened = false;
var is_translation_prompt_opened = false;
var the_first_pathname = null;
var is_opinion_prompt_parent = true;
var is_space_prompt_opened = false;
var is_mars_prompt_opened = false;
var is_w_opinion_opened = false;
var is_w_translation_opened = false;
var is_edit_detailed_career_prompt_opened = false;
var unicorn_editor_focuser = null;
var superior_editor_focuser = null;
var ground_editor_focuser = null;
var space_editor_focuser = null;
var star_editor_focuser = null;
var moon_editor_focuser = null;
var mars_editor_focuser = null;
var today_visitor_old_date = undefined;
var ss_msg;
function speech_text(text) {
    ss_msg = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(ss_msg);
}
function control_volume(action) {
    if (action === "up") {
        ss_msg.volume = ss_msg.volume + 0.1;
    } else {
        ss_msg.volume = ss_msg.volume - 0.1;
    }
    if (ss_msg.volume > 1) {
        ss_msg.volume = 1;
    }
    if (ss_msg.volume < 0) {
        ss_msg.volume = 0;
    }
}
function control_rate(action) {
    if (action === "up") {
        ss_msg.rate = ss_msg.rate + 0.1;
    } else {
        ss_msg.rate = ss_msg.rate - 0.1;
    }
    if (ss_msg.rate > 10) {
        ss_msg.rate = 10;
    }
    if (ss_msg.rate < 0.1) {
        ss_msg.rate = 0.1;
    }
}
function control_pitch(action) {
    if (action === "up") {
        ss_msg.pitch = ss_msg.pitch + 0.1;
    } else {
        ss_msg.pitch = ss_msg.pitch - 0.1;
    }
    if (ss_msg.pitch > 2) {
        ss_msg.pitch = 2;
    }
    if (ss_msg.pitch < 0) {
        ss_msg.pitch = 0;
    }
}
var encode_for_url = function (str) {
    return encodeURIComponent(str).replace(/\-/gi, '%2D').replace(/\'/gi, '%27').replace(/\./gi, '%2E').replace(/\~/gi, '%7E').replace(/\!/gi, '%21').replace(/\*/gi, '%2A').replace(/\(/gi, '%28').replace(/\)/gi, '%29').replace(/\_/gi, '%5F');
};
var show_bert = function (type, duration, message) {
    clearTimeout(bert_alert);
    $('.bert-alert').remove();
    var i, s, e;
    if (type === "success") {
        s = "<div class='bert-alert success'>" + message + "</div>";
    } else if (type === "danger") {
        s = "<div class='bert-alert danger'>" + message + "</div>";
    }
    e = $.parseHTML(s);
    $('body').append(e);
    bert_alert = setTimeout(function () {
        if ($(".bert-alert").is(":visible") === true) {
            var height = $('.bert-alert').height() + 20;
            $(".bert-alert").animate({top: "-=" + height + "px"}, 200, function () {
                $('.bert-alert').remove();
            });
        }
    }, duration);
};
var animation = function (type, action) {
    if (type === "wait") {
        if (action === "play") {
            $("#loader").css("display", "block");
        } else if (action === "stop") {
            $("#loader").css("display", "none");
        }
    }
};
var modal = function (prompt_id, display) {
    if ($("#mobile-right-menu").css("display") === "block") {
        toggle_mobile_menu();
    }
    if (
        prompt_id === ".prompt#invitation-prompt" ||
        prompt_id === ".prompt#announcement-menu-prompt" ||
        prompt_id === ".prompt#opinion-menu-prompt" ||
        prompt_id === ".prompt#translation-menu-prompt"
    ) {
        if (display === "open") {
            $("#overlay2").css("display", "block");
            $(prompt_id).css("display", "table");
            $(prompt_id).addClass("animated fadeIn");
        } else {
            $("#overlay2").css("display", "none");
            $(prompt_id).css("display", "none");
            $(prompt_id).removeClass("animated fadeIn");
        }
        return false;
    }
    if (prompt_id === ".prompt#request-login-prompt") {
        if (display === "open") {
            $("#overlay3").css("display", "block");
            $(prompt_id).css("display", "table");
            $(prompt_id).addClass("animated fadeIn");
        } else {
            $("#overlay3").css("display", "none");
            $(prompt_id).css("display", "none");
            $(prompt_id).removeClass("animated fadeIn");
        }
        return false;
    }
    if (display === "open") {
        $(".body-inner-main").addClass("modal-open");
        $("#overlay").css("display", "block");
        $(prompt_id).css("display", "table");
        $(prompt_id).addClass("animated fadeIn");
        if (prompt_id === ".prompt#update-profile-prompt" && is_mobile() === false) {
            $(".prompt#update-profile-prompt .focuser").focus();
        } else if (prompt_id === ".prompt#youtube-prompt" && is_mobile() === false) {
            if (ground_editor_focuser !== undefined && ground_editor_focuser !== null) {
                ground_editor_focuser.blur();
            }
            if (unicorn_editor_focuser !== undefined && unicorn_editor_focuser !== null) {
                unicorn_editor_focuser.blur();
            }
            if (superior_editor_focuser !== undefined && superior_editor_focuser !== null) {
                superior_editor_focuser.blur();
            }
            if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                star_editor_focuser.blur();
            }
            if (space_editor_focuser !== undefined && space_editor_focuser !== null) {
                space_editor_focuser.blur();
            }
            if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                moon_editor_focuser.blur();
            }
            if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
                mars_editor_focuser.blur();
            }
            $(".prompt#youtube-prompt #youtube-link").focus();
        } else if (prompt_id === ".prompt#image-prompt" && is_mobile() === false) {
            if (ground_editor_focuser !== undefined && ground_editor_focuser !== null) {
                ground_editor_focuser.blur();
            }
            if (unicorn_editor_focuser !== undefined && unicorn_editor_focuser !== null) {
                unicorn_editor_focuser.blur();
            }
            if (superior_editor_focuser !== undefined && superior_editor_focuser !== null) {
                superior_editor_focuser.blur();
            }
            if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                star_editor_focuser.blur();
            }
            if (space_editor_focuser !== undefined && space_editor_focuser !== null) {
                space_editor_focuser.blur();
            }
            if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                moon_editor_focuser.blur();
            }
            if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
                mars_editor_focuser.blur();
            }
            $(".prompt#image-prompt #image-menu-user-gallery").focus();
        } else if (prompt_id === ".prompt#link-prompt" && is_mobile() === false) {
            if (ground_editor_focuser !== undefined && ground_editor_focuser !== null) {
                ground_editor_focuser.blur();
            }
            if (unicorn_editor_focuser !== undefined && unicorn_editor_focuser !== null) {
                unicorn_editor_focuser.blur();
            }
            if (superior_editor_focuser !== undefined && superior_editor_focuser !== null) {
                superior_editor_focuser.blur();
            }
            if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                star_editor_focuser.blur();
            }
            if (space_editor_focuser !== undefined && space_editor_focuser !== null) {
                space_editor_focuser.blur();
            }
            if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                moon_editor_focuser.blur();
            }
            if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
                mars_editor_focuser.blur();
            }
            $(".prompt#link-prompt #link").focus();
        } else if (prompt_id === ".prompt#vote-prompt" && is_mobile() === false) {
            if (ground_editor_focuser !== undefined && ground_editor_focuser !== null) {
                ground_editor_focuser.blur();
            }
            if (unicorn_editor_focuser !== undefined && unicorn_editor_focuser !== null) {
                unicorn_editor_focuser.blur();
            }
            if (superior_editor_focuser !== undefined && superior_editor_focuser !== null) {
                superior_editor_focuser.blur();
            }
            if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                star_editor_focuser.blur();
            }
            if (space_editor_focuser !== undefined && space_editor_focuser !== null) {
                space_editor_focuser.blur();
            }
            if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                moon_editor_focuser.blur();
            }
            if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
                mars_editor_focuser.blur();
            }
            $(".prompt#vote-prompt #vote-question").focus();
        } else if (prompt_id === ".prompt#write-message-prompt" && is_mobile() === false) {
            if (ground_editor_focuser !== undefined && ground_editor_focuser !== null) {
                ground_editor_focuser.blur();
            }
            if (unicorn_editor_focuser !== undefined && unicorn_editor_focuser !== null) {
                unicorn_editor_focuser.blur();
            }
            if (superior_editor_focuser !== undefined && superior_editor_focuser !== null) {
                superior_editor_focuser.blur();
            }
            if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                star_editor_focuser.blur();
            }
            if (space_editor_focuser !== undefined && space_editor_focuser !== null) {
                space_editor_focuser.blur();
            }
            if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                moon_editor_focuser.blur();
            }
            if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
                mars_editor_focuser.blur();
            }
            $(".prompt#write-message-prompt #write-message-content").focus();
        } else if (prompt_id === ".prompt#report-prompt" && is_mobile() === false) {
            if (ground_editor_focuser !== undefined && ground_editor_focuser !== null) {
                ground_editor_focuser.blur();
            }
            if (unicorn_editor_focuser !== undefined && unicorn_editor_focuser !== null) {
                unicorn_editor_focuser.blur();
            }
            if (superior_editor_focuser !== undefined && superior_editor_focuser !== null) {
                superior_editor_focuser.blur();
            }
            if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                star_editor_focuser.blur();
            }
            if (space_editor_focuser !== undefined && space_editor_focuser !== null) {
                space_editor_focuser.blur();
            }
            if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                moon_editor_focuser.blur();
            }
            if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
                mars_editor_focuser.blur();
            }
            $('.prompt#report-prompt #report-content').focus();
            $('.btn-ellipsis-mobile ul').css('display', 'none');
        }
        if (prompt_id === ".prompt#report-prompt") {
            $('.prompt#report-prompt #report-content').val('');
        }
    } else {
        $(".body-inner-main").removeClass("modal-open");
        $("#overlay").css("display", "none");
        $(prompt_id).css("display", "none");
        $(prompt_id).removeClass("animated fadeIn");
    }
};
var toggle_mobile_menu = function () {
    if ($("#mobile-right-menu").is(":animated") === false) {
        if ($("#mobile-right-menu").css("right") === "0px") {
            $("#overlay").css("display", "none");
            $("#mobile-right-menu").animate({right: "-=240px"}, "slow", function () {
                $("#mobile-right-menu").css("display", "none");

            });
        } else {
            $("#overlay").css("display", "block");
            $("#mobile-right-menu").css("display", "block");
            $("#mobile-right-menu").animate({right: "+=240px"}, "slow", function () {

            });
        }
    }
};
var convert_to_two_digits = function (number) {
    return number < 10 ? "0" + number : "" + number;
};
var put_comma_between_three_digits = function (num) {
    var str = num + "";
    var counter = 1;
    var temp = "";
    var final = "";
    var array = str.split('.');
    str = array[0];
    for (var i=(str.length-1); i >= 0; i--){
        temp = temp + str[i];
        if (counter === 3) {
            temp = temp + ',';
            counter = 0;
        }
        counter++;
    }
    for (var i=(temp.length-1); i>=0; i--){
        if (temp.length % 4 === 0 && i === (temp.length - 1)) {
            continue;
        }
        final = final + temp[i];
    }
    if (array[1] !== undefined) {
        final = final + "." + array[1];
    }
    return final;
};
var is_email_valid = function (email) {
    return ( /(.+)@(.+){2,}\.(.+){2,}/.test(email) );
};
var is_blog_owner = function () {
    var temp = window.location.pathname.split('/');
    var blog_id = temp[2];
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
    if ((temp[1] === 'blog') && (temp.length > 2)) {
        return current_user_blog_id === blog_id;
    } else {
        return false;
    }
};
var is_password_format_valid = function (password) {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (password.length < 8) {
        return "[" + i18n[lang].password + "] " + i18n[lang].wrong_condition + " " + i18n[lang].valid_condition + " : " + i18n[lang].minimum_length_8;
    } else if (password.length > 50) {
        return "[" + i18n[lang].password + "] " + i18n[lang].wrong_condition + " " + i18n[lang].password_is_too_long;
    } else if (password.search(/\d/) === -1) {
        return "[" + i18n[lang].password + "] " + i18n[lang].wrong_condition + " " + i18n[lang].valid_condition + " : " + i18n[lang].at_least_one_number;
    } else if (password.search(/[a-zA-Z]/) === -1) {
        return "[" + i18n[lang].password + "] " + i18n[lang].wrong_condition + " " + i18n[lang].valid_condition + " : " + i18n[lang].at_least_one_alphabet;
    } else if (password.search(/[\!\@\#\$\%\^\&\*\(\)\_\+\.\,\;\:]/) === -1) {
        return "[" + i18n[lang].password + "] " + i18n[lang].wrong_condition + " " + i18n[lang].valid_condition + " : " + i18n[lang].at_least_one_special_character;
    }
    return true;
};
var is_blog_id_format_valid = function (blog_id) {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (blog_id.length < 6) {
        return "[" + i18n[lang].blog_id + "] " + i18n[lang].wrong_condition + " " + i18n[lang].valid_condition + " : " + i18n[lang].length_6_to_14;
    } else if (blog_id.length > 14) {
        return "[" + i18n[lang].blog_id + "] " + i18n[lang].wrong_condition + " " + i18n[lang].valid_condition + " : " + i18n[lang].length_6_to_14;
    } else if (/^[a-z][a-z0-9]*$/.test(blog_id) === false) {
        return "[" + i18n[lang].blog_id + "] " + i18n[lang].wrong_condition + " " + i18n[lang].valid_condition + " : " + i18n[lang].start_with_english_alphabet_lowercase_and_only_use_english_alphabet_lowercase_and_number;
    }
    return true;
};
var get_clear_text = function (str) {
    return str.replace( /<[^<|>]+?>/gi,' ' ).replace(/&nbsp;/g, ' ').trim().replace(/\s\s+/gi, ' ');
};
var get_encoded_html_preventing_xss = function (str) {
    return str.replace(/\&/gi, '&amp;')
        .replace(/\ /gi, '&nbsp;')
        .replace(/\</gi, '&lt;')
        .replace(/\>/gi, '&gt;')
        .replace(/\¢/gi, '&cent;')
        .replace(/\£/gi, '&pound;')
        .replace(/\¥/gi, '&yen;')
        .replace(/\€/gi, '&euro;')
        .replace(/\§/gi, '&sect;')
        .replace(/\©/gi, '&copy;')
        .replace(/\®/gi, '&reg;')
        .replace(/\™/gi, '&trade;')
        .replace(/\"/gi, '&quot;')
        .replace(/\'/gi, '&#39;');
};
var get_decoded_html_preventing_xss = function (str) {
    return str.replace(/\&nbsp;/gi, ' ')
        .replace(/\&lt;/gi, '<')
        .replace(/\&gt;/gi, '>')
        .replace(/\&cent;/gi, '¢')
        .replace(/\&pound;/gi, '£')
        .replace(/\&yen;/gi, '¥')
        .replace(/\&euro;/gi, '€')
        .replace(/\&sect;/gi, '§')
        .replace(/\&copy;/gi, '©')
        .replace(/\&reg;/gi, '®')
        .replace(/\&trade;/gi, '™')
        .replace(/\&amp;/gi, '&')
        .replace(/\&quot;/gi, '"')
        .replace(/\&#39;/gi, "'");
};
var get_days_of_month = function (year, month) {
    var date = new Date(year, month, 1);
    var days = [];
    while (date.getMonth() === month) {
        days.push(new Date(date).getDate());
        date.setDate(date.getDate() + 1);
    }
    return days;
};
var get_i18n_time_text = function (obj) {
    var lang = obj.lang
        , type = obj.type
        , number = obj.number;
    if (lang === undefined) {
        lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
    }
    var i18n_time_text = {};
    i18n_time_text.en = {};
    i18n_time_text.ja = {};
    i18n_time_text.ko = {};
    i18n_time_text["zh-Hans"] = {};
    if (type === "year") {
        if (lang === "en") {
            return number + "";
        } else if (lang === "ja") {
            return number + "年";
        } else if (lang === "ko") {
            return number + "년";
        } else if (lang === "zh-Hans") {
            return number + "年";
        }
    }
    i18n_time_text.en.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (type === "month") {
        if (lang === "en") {
            return i18n_time_text.en.months[number];
        } else if (lang === "ja") {
            return (number + 1) + "月";
        } else if (lang === "ko") {
            return (number + 1) + "월";
        } else if (lang === "zh-Hans") {
            return (number + 1) + "月";
        }
    }
    if (type === "date") {
        if (lang === "en") {
            return number + "";
        } else if (lang === "ja") {
            return number + "日";
        } else if (lang === "ko") {
            return number + "일";
        } else if (lang === "zh-Hans") {
            return number + "日";
        }
    }
    i18n_time_text.en.weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    i18n_time_text.ja.weekdays = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
    i18n_time_text.ko.weekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    i18n_time_text["zh-Hans"].weekdays = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    if (type === "weekday") {
        return i18n_time_text[lang].weekdays[number];
    }
    i18n_time_text.en.year = "year";
    i18n_time_text.en.years  = "years";
    i18n_time_text.ja.years = "年";
    i18n_time_text.ko.years = "년";
    i18n_time_text["zh-Hans"].years = "年";
    if (type === "years") {
        if (lang === 'en') {
            if (number > 1) {
                return number + " " + i18n_time_text[lang].years;
            } else {
                return number + " " + i18n_time_text[lang].year;
            }
        } else {
            return number + i18n_time_text[lang].years;
        }
    }
    i18n_time_text.en.week = "week";
    i18n_time_text.en.weeks  = "weeks";
    i18n_time_text.ja.weeks = "週間";
    i18n_time_text.ko.weeks = "주";
    i18n_time_text["zh-Hans"].weeks = "周";
    if (type === "weeks") {
        if (lang === 'en') {
            if (number > 1) {
                return number + " " + i18n_time_text[lang].weeks;
            } else {
                return number + " " + i18n_time_text[lang].week;
            }
        } else {
            return number + i18n_time_text[lang].weeks;
        }
    }
    i18n_time_text.en.day = "day";
    i18n_time_text.en.days  = "days";
    i18n_time_text.ja.days = "日";
    i18n_time_text.ko.days = "일";
    i18n_time_text["zh-Hans"].days = "天";
    if (type === "days") {
        if (lang === 'en') {
            if (number > 1) {
                return number + " " + i18n_time_text[lang].days;
            } else {
                return number + " " + i18n_time_text[lang].day;
            }
        } else {
            return number + i18n_time_text[lang].days;
        }
    }
    i18n_time_text.en.hour = "hour";
    i18n_time_text.en.hours = "hours";
    i18n_time_text.ja.hours = "時間";
    i18n_time_text.ko.hours = "시간";
    i18n_time_text["zh-Hans"].hours = "小时";
    if (type === "hours") {
        if (lang === 'en') {
            if (number > 1) {
                return number + " " + i18n_time_text[lang].hours;
            } else {
                return number + " " + i18n_time_text[lang].hour;
            }
        } else {
            return number + i18n_time_text[lang].hours;
        }
    }
    i18n_time_text.en.minute = "minute";
    i18n_time_text.en.minutes = "minutes";
    i18n_time_text.ja.minutes = "分";
    i18n_time_text.ko.minutes = "분";
    i18n_time_text["zh-Hans"].minutes = "分";
    if (type === "minutes") {
        if (lang === 'en') {
            if (number > 1) {
                return number + " " + i18n_time_text[lang].minutes;
            } else {
                return number + " " + i18n_time_text[lang].minute;
            }
        } else {
            return number + i18n_time_text[lang].minutes;
        }
    }
    i18n_time_text.en.second = "second";
    i18n_time_text.en.seconds = "seconds";
    i18n_time_text.ja.seconds = "秒";
    i18n_time_text.ko.seconds = "초";
    i18n_time_text["zh-Hans"].seconds = "秒";
    if (type === "seconds") {
        if (lang === 'en') {
            if (number > 1) {
                return number + " " + i18n_time_text[lang].seconds;
            } else {
                return number + " " + i18n_time_text[lang].second;
            }
        } else {
            return number + i18n_time_text[lang].seconds;
        }
    }
};
var get_i18n_text_ago_or_left = function (obj) {
    var type = obj.type
        , diff = obj.diff
        , lang = $("body").attr("data-lang")
        , text = "";
    if (lang === undefined) {
        lang = "en";
    }
    var years = Math.floor(diff / 31536000);
    var weeks = Math.floor(diff % 31536000 / 604800);
    var days = Math.floor(diff % 31536000 % 604800 / 86400);
    var hours = Math.floor(diff % 31536000 % 604800 % 86400 / 3600);
    var minutes = Math.floor(diff % 31536000 % 604800 % 86400 % 3600 / 60);
    var seconds = Math.floor(diff % 31536000 % 604800 % 86400 % 3600 % 60);
    if (years > 0) {
        text = text + get_i18n_time_text({type: "years" , number: years});
        if (
            lang === "en" ||
            lang === "ko"
        ) {
            text = text + " ";
        }
    }
    if (weeks > 0) {
        text = text + get_i18n_time_text({type: "weeks" , number: weeks});
        if (
            lang === "en" ||
            lang === "ko"
        ) {
            text = text + " ";
        }
    }
    if (days > 0) {
        text = text + get_i18n_time_text({type: "days" , number: days});
        if (
            lang === "en" ||
            lang === "ko"
        ) {
            text = text + " ";
        }
    }
    if (hours > 0) {
        text = text + get_i18n_time_text({type: "hours" , number: hours});
        if (
            lang === "en" ||
            lang === "ko"
        ) {
            text = text + " ";
        }
    }
    if (minutes > 0) {
        text = text + get_i18n_time_text({type: "minutes" , number: minutes});
        if (
            lang === "en" ||
            lang === "ko"
        ) {
            text = text + " ";
        }
    }
    if (seconds > 0) {
        text = text + get_i18n_time_text({type: "seconds" , number: seconds});
        if (
            lang === "en" ||
            lang === "ko"
        ) {
            text = text + " ";
        }
    }
    if (type === "left") {
        if (text === "") {
            text = text + get_i18n_time_text({type: "seconds" , number: 0});
            if (
                lang === "en" ||
                lang === "ko"
            ) {
                text = text + " ";
            }
        }
        if (lang === "en") {
            return text + " " + i18n[lang].left
        } else if (lang === "ja") {
            return text + i18n[lang].left;
        } else if (lang === "ko") {
            return text + " " + i18n[lang].left
        } else if (lang === "zh-Hans") {
            return i18n[lang].left + text + "。"
        } else {
            return text + " " + i18n[lang].left
        }
    } else if (type === "ago") {
        if (
            years === 0 &&
            weeks === 0 &&
            days === 0 &&
            hours === 0 &&
            minutes === 0 &&
            seconds === 0
        ) {
            return i18n[lang].just_now;
        } else {
            if (lang === "en") {
                return text + " " + i18n[lang].ago;
            } else if (lang === "ja") {
                return text + i18n[lang].ago;
            } else if (lang === "ko") {
                return text + " " + i18n[lang].ago;
            } else if (lang === "zh-Hans") {
                return text + i18n[lang].ago;
            } else {
                return text + " " + i18n[lang].ago;
            }
        }
    } else {
        return "";
    }
};
var get_i18n_year_month_date = function (obj) {
    var lang = obj.lang;
    if (lang === undefined) {
        lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
    }
    var year = get_i18n_time_text({lang: lang, type: "year", number: obj.year})
        , month = get_i18n_time_text({lang: lang, type: "month", number: obj.month})
        , date = get_i18n_time_text({lang: lang, type: "date", number: obj.date});

    if (lang === "en") {
        return date + " " +  month + " " + year;
    } else if (lang === "ja") {
        return year + month + date;
    } else if (lang === "ko") {
        return year + " " + month + " " + date;
    } else if (lang === "zh-Hans") {
        return year + month + date;
    } else {
        return date + " " +  month + " " + year;
    }
};
var to_i18n_fixed_datetime = function (datetime) {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (datetime === undefined) {
        datetime = new Date();
    }
    var year_month_date = get_i18n_year_month_date({lang: lang, year: datetime.getFullYear(), month: datetime.getMonth(), date: datetime.getDate()})
        , weekday = get_i18n_time_text({lang: lang, type: "weekday", number: datetime.getDay()})
        , hours_minutes_seconds =  convert_to_two_digits(datetime.getHours()) + ":" + convert_to_two_digits(datetime.getMinutes()) + ":" + convert_to_two_digits(datetime.getSeconds());
    if (lang === "en") {
        final = weekday + ", " +  year_month_date + ", " + hours_minutes_seconds;
    } else if (lang === "ja") {
        final = year_month_date + " " + weekday + " " + hours_minutes_seconds;
    } else if (lang === "ko") {
        final = year_month_date + " " + weekday + " " + hours_minutes_seconds;
    } else if (lang === "zh-Hans") {
        final = year_month_date + " " + weekday + " " + hours_minutes_seconds;
    } else {
        final = weekday + ", " +  year_month_date + ", " + hours_minutes_seconds;
    }
    return final;
};
var to_i18n_datetime = function (datetime) {
    var lang = $("body").attr("data-lang");
    var now = new Date();
    if (
        lang === undefined ||
        lang === null) {
        lang = "en";
    }
    var diff = Math.floor((now.valueOf() - datetime.valueOf()) / 1000);
    var final = "";
    if (diff < 86400) {
        final = get_i18n_text_ago_or_left({type: "ago", diff: diff});
    } else {
        final = to_i18n_fixed_datetime(datetime);
    }
    return final;
};
var to_i18n_short_fixed_datetime = function (datetime) {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (datetime === undefined) {
        datetime = new Date();
    }
    var year_month_date = get_i18n_year_month_date({lang: lang, year: datetime.getFullYear(), month: datetime.getMonth(), date: datetime.getDate()})
        , hours_minutes_seconds =  convert_to_two_digits(datetime.getHours()) + ":" + convert_to_two_digits(datetime.getMinutes()) + ":" + convert_to_two_digits(datetime.getSeconds());
    if (lang === "en") { /* 영어 */
        final = year_month_date + ", " + hours_minutes_seconds;
    } else if (lang === "ja") {
        final = year_month_date + " " + hours_minutes_seconds;
    } else if (lang === "ko") {
        final = year_month_date + " " + hours_minutes_seconds;
    } else if (lang === "zh-Hans") {
        final = year_month_date + " " + hours_minutes_seconds;
    } else {
        final = year_month_date + ", " + hours_minutes_seconds;
    }
    return final;
};
var to_i18n_short_datetime = function (datetime) {
    var now = new Date();
    var diff = Math.floor((now.valueOf() - datetime.valueOf()) / 1000);
    var final = "";
    if (diff < 86400) {
        final = get_i18n_text_ago_or_left({type: "ago", diff: diff});
    } else {
        final = to_i18n_short_fixed_datetime(datetime);
    }
    return final;
};
var is_mobile = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};
var is_ie = function () {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE");
    var trident = ua.indexOf("Trident");
    return msie > -1 ? true : (trident > -1);
}
var methods = {};
methods["the_world"] = {};
methods["the_world"]["is_one"] = function (obj) {
    if (obj.show_animation === true) {
        animation("wait", "play");
    }
    $.ajax({
        url: window.location.protocol + "//" + window.location.hostname + (window.location.port === "" ? "" : ":" + window.location.port) + obj.pathname,
        dataType: 'json',
        type: 'POST',
        data: obj.data,
        success: function(result) {
            if (obj.show_animation === true) {
                animation("wait", "stop");
            }
            obj.s_cb(result);
            return false;
        },
        error: function(xhr, status, error) {
            if (obj.show_animation === true) {
                animation("wait", "stop");
            }
            obj.f_cb();
            return false;
        },
        timeout: 10000
    });
};
function iframe_vote_load_callback (e) {
    if (!e) {
        e = window.event;
        e = e.target || e.srcElement;
    }
    var doc = e.contentDocument || e.contentWindow.document;
    if (doc !== undefined && $(doc).find('.vote').length > 0) {
        $(e).height( ($(doc).find('.vote')[0].scrollHeight + 2) + 'px' );
        $(e).attr('height', ($(doc).find('.vote')[0].scrollHeight + 2) + 'px' );
    }
}
function iframe_vote_resize_all () {
    var iframe_list = [
        "unicorn"
        , "superior"
        , "star"
        , "space"
        , "ground"
    ];
    for (var i = 0; i < iframe_list.length; i++) {
        if ($("#cke_" + iframe_list[i] + "-editor iframe").length > 0) {
            var doc = $("#cke_" + iframe_list[i] + "-editor iframe")[0].contentDocument || $("#cke_" + iframe_list[i] + "-editor iframe")[0].contentWindow.document;
            var doc2;
            if ($( doc ).find(".iframe-vote").length > 0){
                $( doc ).find(".iframe-vote").each( function (i, e) {
                    doc2 = e.contentDocument || e.contentWindow.document;
                    if (doc2 !== undefined && $(doc2).find('.vote').length > 0) {
                        $(e).height( ($(doc2).find('.vote')[0].scrollHeight + 2) + 'px' );
                        $(e).attr('height', ($(doc2).find('.vote')[0].scrollHeight + 2) + 'px' );
                    }
                });
            }
        }
    }
    if ($(".iframe-vote").length > 0) {
        var doc3;
        $(".iframe-vote").each( function (i, e) {
            doc3 = e.contentDocument || e.contentWindow.document;
            if (doc3 !== undefined && $(doc3).find('.vote').length > 0) {
                $(e).height( ($(doc3).find('.vote')[0].scrollHeight + 2) + 'px' );
                $(e).attr('height', ($(doc3).find('.vote')[0].scrollHeight + 2) + 'px' );
            }
        });
    }
}
var blog = {};
blog["profile"] = {};
blog["profile"]["prompt"] = {};
blog["profile"]["prompt"]["open"] = function (obj) {
    /* update-profile-prompt 초기화 */
    $('.prompt#update-profile-prompt').removeAttr('data-type').removeAttr('data-is-new').removeAttr('data-id');
    $('.prompt#update-profile-prompt .prompt-title').empty();
    $('.prompt#update-profile-prompt .prompt-description').empty();
    $('.prompt#update-profile-prompt .prompt-main').empty();
    var title
        , description
        , main
        , $start_year
        , $start_month
        , $start_day
        , $end_year
        , $end_month
        , $end_day
        , $received_year
        , $received_month
        , $received_day
        , days_of_month;
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var css_version = $("body").attr("data-css-version");
    if (obj.type === "blog_name") {
        title = "<span>" + i18n[lang].blog_name_edit + "</span>";
        description = "<span>" + i18n[lang].please_enter_blog_name + "</span>";
        main = "<form><input id='first' class='focuser' type='text' placeholder=''><div class='btn-career-wrapper'><input id='btn-update' type='submit' value='" + i18n[lang].check + "'></div> </form>";
    } else if (obj.type === "self_introduction") {
        title = "<span>" + i18n[lang].self_introduction_edit + "</span>";
        description = "<span>" + i18n[lang].please_enter_self_introduction + "</span>";
        main = "<form><textarea id='first' class='focuser' placeholder=''></textarea><div class='btn-career-wrapper'><input id='btn-update' type='submit' value='" + i18n[lang].check + "'></div></form>";
    } else if (obj.type === "iq_eq") {
        title = "<img class='emoticon-big-img' src='" + aws_s3_url + "/icons/employment.png" + css_version + "'><span>" + i18n[lang].iq_eq_edit + "</span>";
        main = "<form><div class='career-form'><div class='career-row'><label for='first'>IQ</label><div class='career-cell'><input id='first' class='focuser' type='text' placeholder='145'></div></div><div class='career-row'><label for='second'>EQ</label><div class='career-cell'><input id='second' type='text' placeholder='145'></div></div></div><div class='btn-career-wrapper'><input id='btn-update' class='btn-career' type='submit' value='" + i18n[lang].check + "'></div></form>";
        description = "<span>" + i18n[lang].please_enter_iq_eq + "</span>";
    }  else if (obj.type === "simple_career") {
        if (obj.is_new === true) {
            title = "<span>" + i18n[lang].occupation_add + "</span>";
            main = "<form><input id='first' class='focuser' type='text' placeholder='" + i18n[lang].developer_politician + "'><div class='show-wrapper'><label for='show'>" + i18n[lang].display_profile + "</label><input type='checkbox' id='show'></div><div class='btn-career-wrapper'><input id='btn-add' type='submit' value='" + i18n[lang].check + "'></div></form>";
        } else {
            title = "<span>" + i18n[lang].occupation_edit + "</span>";
            main = "<form><input id='first' class='focuser' type='text' placeholder='" + i18n[lang].developer_politician + "'><div class='show-wrapper'><label for='show'>" + i18n[lang].display_profile + "</label><input type='checkbox' id='show'></div><div class='btn-career-wrapper'><input id='btn-update' type='submit' value='" + i18n[lang].check + "'></div></form>";
        }
        description = i18n[lang].please_enter_occupation  + " <span style='color:#787878;' class='hey-gleant'>" + i18n[lang].display_profile + ":</span> <span style='color:#787878;' class='hey-gleant'>" + i18n[lang].it_will_be_displayed_when_debate_is_uploaded + "</span>";
    } else if (obj.type === "employment") {
        if (obj.is_new === true) {
            title = "<img class='emoticon-big-img' src='" + aws_s3_url + "/icons/employment.png" + css_version + "'><span>" + i18n[lang].career_add + "</span>";
            main = "<form><div class='career-form'><div class='career-row'><label for='first'>" + i18n[lang].position + "<span class='required-field'>" + i18n[lang].required + "</span></label><div class='career-cell'><input id='first' class='focuser' type='text' placeholder=''></div></div><div class='career-row'><label for='second'>" + i18n[lang].company + "</label><div class='career-cell'><input id='second' type='text' placeholder=''></div></div><div class='career-row'><label for='start-year'>" + i18n[lang].join + "</label><div class='career-cell'><select id='start-year'></select><select id='start-month'></select><select id='start-day'></select></div></div><div class='career-row'><label for='end-year'>" + i18n[lang].resignation + "</label><div class='career-cell'><select id='end-year'></select><select id='end-month'></select><select id='end-day'></select></div></div><div class='career-row'><label for='ing'>" + i18n[lang].working + "</label><div class='career-cell'><input type='checkbox' id='ing'></div></div><div class='career-row'><label for='show'>" + i18n[lang].display_profile + "</label><div class='career-cell'><input type='checkbox' id='show'></div></div></div><div class='btn-career-wrapper'><input id='btn-add' class='btn-career' type='button' value='" + i18n[lang].check + "'></div></form>";
        } else {
            title = "<img class='emoticon-big-img' src='" + aws_s3_url + "/icons/employment.png" + css_version + "'><span>" + i18n[lang].career_edit + "</span>";
            main = "<form><div class='career-form'><div class='career-row'><label for='first'>" + i18n[lang].position + "<span class='required-field'>" + i18n[lang].required + "</span></label><div class='career-cell'><input id='first' class='focuser' type='text' placeholder=''></div></div><div class='career-row'><label for='second'>" + i18n[lang].company + "</label><div class='career-cell'><input id='second' type='text' placeholder=''></div></div><div class='career-row'><label for='start-year'>" + i18n[lang].join + "</label><div class='career-cell'><select id='start-year'></select><select id='start-month'></select><select id='start-day'></select></div></div><div class='career-row'><label for='end-year'>" + i18n[lang].resignation + "</label><div class='career-cell'><select id='end-year'></select><select id='end-month'></select><select id='end-day'></select></div></div><div class='career-row'><label for='ing'>" + i18n[lang].working + "</label><div class='career-cell'><input type='checkbox' id='ing'></div></div><div class='career-row'><label for='show'>" + i18n[lang].display_profile + "</label><div class='career-cell'><input type='checkbox' id='show'></div></div></div><div class='btn-career-wrapper'><input id='btn-remove' class='btn-career' type='button' value='" + i18n[lang].remove + "'><input id='btn-update' class='btn-career' type='button' value='" + i18n[lang].check + "'></div></form>";
        }
    } else if (obj.type === "education") {
        if (obj.is_new === true) {
            title = "<img class='emoticon-big-img' src='" + aws_s3_url + "/icons/education.png" + css_version + "'><span>" + i18n[lang].education2_add + "</span>";
            main = "<form><div class='career-form'><div class='career-row'><label for='first'>" + i18n[lang].school + "<span class='required-field'>" + i18n[lang].required + "</span></label><div class='career-cell'><input id='first' class='focuser' type='text' placeholder=''></div></div><div class='career-row'><label for='second'>" + i18n[lang].major + "</label><div class='career-cell'><input id='second' type='text' placeholder=''></div></div><div class='career-row'><label for='third'>" + i18n[lang].minor + "</label><div class='career-cell'><input id='third' type='text' placeholder=''></div></div><div class='career-row'><label for='fourth'>" + i18n[lang].degree + "</label><div class='career-cell'><input id='fourth' type='text' placeholder=''></div></div><div class='career-row'><label for='start-year'>" + i18n[lang].admission + "</label><div class='career-cell'><select id='start-year'></select><select id='start-month'></select><select id='start-day'></select></div></div><div class='career-row'><label for='end-year'>" + i18n[lang].graduation + "</label><div class='career-cell'><select id='end-year'></select><select id='end-month'></select><select id='end-day'></select></div></div><div class='career-row'><label for='ing'>" + i18n[lang].attending + "</label><div class='career-cell'><input type='checkbox' id='ing'></div></div><div class='career-row'><label for='show'>" + i18n[lang].display_profile + "</label><div class='career-cell'><input type='checkbox' id='show'></div></div></div><div class='btn-career-wrapper'><input id='btn-add' class='btn-career' type='button' value='" + i18n[lang].check + "'></div></form>";
        } else {
            title = "<img class='emoticon-big-img' src='" + aws_s3_url + "/icons/education.png" + css_version + "'><span>" + i18n[lang].education2_edit + "</span>";
            main = "<form><div class='career-form'><div class='career-row'><label for='first'>" + i18n[lang].school + "<span class='required-field'>" + i18n[lang].required + "</span></label><div class='career-cell'><input id='first' class='focuser' type='text' placeholder=''></div></div><div class='career-row'><label for='second'>" + i18n[lang].major + "</label><div class='career-cell'><input id='second' type='text' placeholder=''></div></div><div class='career-row'><label for='third'>" + i18n[lang].minor + "</label><div class='career-cell'><input id='third' type='text' placeholder=''></div></div><div class='career-row'><label for='fourth'>" + i18n[lang].degree + "</label><div class='career-cell'><input id='fourth' type='text' placeholder=''></div></div><div class='career-row'><label for='start-year'>" + i18n[lang].admission + "</label><div class='career-cell'><select id='start-year'></select><select id='start-month'></select><select id='start-day'></select></div></div><div class='career-row'><label for='end-year'>" + i18n[lang].graduation + "</label><div class='career-cell'><select id='end-year'></select><select id='end-month'></select><select id='end-day'></select></div></div><div class='career-row'><label for='ing'>" + i18n[lang].attending + "</label><div class='career-cell'><input type='checkbox' id='ing'></div></div><div class='career-row'><label for='show'>" + i18n[lang].display_profile + "</label><div class='career-cell'><input type='checkbox' id='show'></div></div></div><div class='btn-career-wrapper'><input id='btn-remove' class='btn-career' type='button' value='" + i18n[lang].remove + "'><input id='btn-update' class='btn-career' type='button' value='" + i18n[lang].check + "'></div></form>";
        }
    } else if (obj.type === "prize") {
        if (obj.is_new === true) {
            title = "<img class='emoticon-big-img' src='" + aws_s3_url + "/icons/prize.png" + css_version + "'><span>" + i18n[lang].awards_and_honors_add + "</span>";
            main = "<form><div class='career-form'><div class='career-row'><label for='first'>" + i18n[lang].award + "</label><div class='career-cell'><input id='first' class='focuser' type='text' placeholder=''></div></div><div class='career-row'><label for='received-year'>" + i18n[lang].date + "</label><div class='career-cell'><select id='received-year'></select><select id='received-month'></select><select id='received-day'></select></div></div><div class='career-row'><label for='show'>" + i18n[lang].display_profile + "</label><div class='career-cell'><input type='checkbox' id='show'></div></div></div><div class='btn-career-wrapper'><input id='btn-add' class='btn-career' type='submit' value='" + i18n[lang].check + "'></div></form>";
        } else {
            title = "<img class='emoticon-big-img' src='" + aws_s3_url + "/icons/prize.png" + css_version + "'><span>" + i18n[lang].awards_and_honors_edit + "</span>";
            main = "<form><div class='career-form'><div class='career-row'><label for='first'>" + i18n[lang].award + "</label><div class='career-cell'><input id='first' class='focuser' type='text' placeholder=''></div></div><div class='career-row'><label for='received-year'>" + i18n[lang].date + "</label><div class='career-cell'><select id='received-year'></select><select id='received-month'></select><select id='received-day'></select></div></div><div class='career-row'><label for='show'>" + i18n[lang].display_profile + "</label><div class='career-cell'><input type='checkbox' id='show'></div></div></div><div class='btn-career-wrapper'><input id='btn-remove' class='btn-career' type='button' value='" + i18n[lang].remove + "'><input id='btn-update' class='btn-career' type='submit' value='" + i18n[lang].check + "'></div></form>";
        }
    } else if (obj.type === "location") {
        if (obj.is_new === true) {
            title = "<img class='emoticon-big-img' src='" + aws_s3_url + "/icons/location.png" + css_version + "'><span>" + i18n[lang].residence_add + "</span>";
            main = "<form><div class='career-form'><div class='career-row'><label for='first'>" + i18n[lang].country + "<span class='required-field'>" + i18n[lang].required + "</span></label><div class='career-cell'><input id='first' class='focuser' type='text' placeholder=''></div></div><div class='career-row'><label for='second'>" + i18n[lang].city + "</label><div class='career-cell'><input id='second' type='text' placeholder=''></div></div><div class='career-row'><label for='start-year'>" + i18n[lang].start + "</label><div class='career-cell'><select id='start-year'></select><select id='start-month'></select><select id='start-day'></select></div></div><div class='career-row'><label for='end-year'>" + i18n[lang].move + "</label><div class='career-cell'><select id='end-year'></select><select id='end-month'></select><select id='end-day'></select></div></div><div class='career-row'><label for='ing'>" + i18n[lang].residing + "</label><div class='career-cell'><input type='checkbox' id='ing'></div></div><div class='career-row'><label for='show'>" + i18n[lang].display_profile + "</label><div class='career-cell'><input type='checkbox' id='show'></div></div></div><div class='btn-career-wrapper'><input id='btn-add' class='btn-career' type='button' value='" + i18n[lang].check + "'></div></form>";
        } else {
            title = "<img class='emoticon-big-img' src='" + aws_s3_url + "/icons/location.png" + css_version + "'><span>" + i18n[lang].residence_edit + "</span>";
            main = "<form><div class='career-form'><div class='career-row'><label for='first'>" + i18n[lang].country + "<span class='required-field'>" + i18n[lang].required + "</span></label><div class='career-cell'><input id='first' class='focuser' type='text' placeholder=''></div></div><div class='career-row'><label for='second'>" + i18n[lang].city + "</label><div class='career-cell'><input id='second' type='text' placeholder=''></div></div><div class='career-row'><label for='start-year'>" + i18n[lang].start + "</label><div class='career-cell'><select id='start-year'></select><select id='start-month'></select><select id='start-day'></select></div></div><div class='career-row'><label for='end-year'>" + i18n[lang].move + "</label><div class='career-cell'><select id='end-year'></select><select id='end-month'></select><select id='end-day'></select></div></div><div class='career-row'><label for='ing'>" + i18n[lang].residing + "</label><div class='career-cell'><input type='checkbox' id='ing'></div></div><div class='career-row'><label for='show'>" + i18n[lang].display_profile + "</label><div class='career-cell'><input type='checkbox' id='show'></div></div></div><div class='btn-career-wrapper'><input id='btn-remove' class='btn-career' type='button' value='" + i18n[lang].remove + "'><input id='btn-update' class='btn-career' type='button' value='" + i18n[lang].check + "'></div></form>";
        }
    } else if (obj.type === "website") {
        if (obj.is_new === true) {
            title = "<img class='emoticon-big-img' src='" + aws_s3_url + "/icons/website.png" + css_version + "'><span>" + i18n[lang].website_add + "</span>";
            main = "<form><div class='career-form'><div class='career-row'><label for='first'>" + i18n[lang].name + "<span class='required-field'>" + i18n[lang].required + "</span></label><div class='career-cell'><input id='first' class='focuser' type='text' placeholder=''></div></div><div class='career-row'><label for='second'>URL<span class='required-field'>" + i18n[lang].required + "</span></label><div class='career-cell'><div class='website-link'><div class='website-link-left'><select id='second' class='website-link-left-select'><option value='http' selected='selected'>http://</option><option value='https'>https://</option></select></div><div class='website-link-right'><input id='third' type='url' class='website-link-right-input'></div></div></div></div></div><div class='btn-career-wrapper' style='margin-top:10px;'><input id='btn-add' class='btn-career' type='button' value='" + i18n[lang].check  + "'></div></form>";
        } else {
            title = "<img class='emoticon-big-img' src='" + aws_s3_url + "/icons/website.png" + css_version + "'><span>" + i18n[lang].website_edit + "</span>";
            main = "<form><div class='career-form'><div class='career-row'><label for='first'>" + i18n[lang].name + "<span class='required-field'>" + i18n[lang].required + "</span></label><div class='career-cell'><input id='first' class='focuser' type='text' placeholder=''></div></div><div class='career-row'><label for='second'>URL<span class='required-field'>" + i18n[lang].required + "</span></label><div class='career-cell'><div class='website-link'><div class='website-link-left'><select id='second' class='website-link-left-select'><option value='http' selected='selected'>http://</option><option value='https'>https://</option></select></div><div class='website-link-right'><input id='third' type='url' class='website-link-right-input'></div></div></div></div></div><div class='btn-career-wrapper' style='margin-top:10px;'><input id='btn-remove' class='btn-career' type='button' value='" + i18n[lang].remove + "'><input id='btn-update' class='btn-career' type='button' value='" + i18n[lang].check + "'></div></form>";
        }
    }
    if (
        obj.type === "employment" ||
        obj.type === "education" ||
        obj.type === "prize" ||
        obj.type === "location"
    ) {
        description = "<span><span style='color:#787878;' class='hey-gleant'>" + i18n[lang].display_profile + ":</span> <span style='color:#787878;' class='hey-gleant'>" + i18n[lang].it_will_be_displayed_when_debate_is_uploaded + "</span></span>";
    }
    $('.prompt#update-profile-prompt .prompt-title').append(title);
    $('.prompt#update-profile-prompt .prompt-description').append(description);
    $('.prompt#update-profile-prompt .prompt-main').append(main);
    $('.prompt#update-profile-prompt').attr('data-type', obj.type).attr('data-is-new', obj.is_new);
    if (
        obj.type === "employment" ||
        obj.type === "education" ||
        obj.type === "location"
    ) {
        $start_year = $("#start-year");
        $start_month = $("#start-month");
        $start_day = $("#start-day");
        $end_year = $("#end-year");
        $end_month = $("#end-month");
        $end_day = $("#end-day");
        $start_year.empty().append("<option selected='selected' value=''>" + i18n[lang].year + "</option>");
        $start_month.empty().append("<option selected='selected' value=''>" + i18n[lang].month + "</option>");
        $start_day.empty().append("<option selected='selected' value=''>" + i18n[lang].day + "</option>");
        $end_year.empty().append("<option selected='selected' value=''>" + i18n[lang].year + "</option>");
        $end_month.empty().append("<option selected='selected' value=''>" + i18n[lang].month + "</option>");
        $end_day.empty().append("<option selected='selected' value=''>" + i18n[lang].day + "</option>");
        for (var i = (new Date()).getFullYear(); i >= 1900; i--) {
            $start_year.append("<option value='" + i + "'>" + get_i18n_time_text({type: "year", number: i}) + "</option>");
            $end_year.append("<option value='" + i + "'>" + get_i18n_time_text({type: "year", number: i}) + "</option>");
        }
        for (var i = 0; i < 12; i++) {
            $start_month.append("<option value='" + i + "'>" + get_i18n_time_text({type: "month", number: i}) + "</option>");
            $end_month.append("<option value='" + i + "'>" + get_i18n_time_text({type: "month", number: i}) + "</option>");
        }
        for (var i = 1; i <= 31; i++) {
            $start_day.append("<option value='" + i + "'>" + get_i18n_time_text({type: "date", number: i}) + "</option>");
            $end_day.append("<option value='" + i + "'>" + get_i18n_time_text({type: "date", number: i}) + "</option>");
        }
    }
    if (
        obj.type === "prize"
    ) {
        $received_year = $("#received-year");
        $received_month = $("#received-month");
        $received_day = $("#received-day");
        $received_year.append("<option selected='selected' value=''>" + i18n[lang].year + "</option>");
        $received_month.append("<option selected='selected' value=''>" + i18n[lang].month + "</option>");
        $received_day.append("<option selected='selected' value=''>" + i18n[lang].day + "</option>");
        for (var i = (new Date()).getFullYear(); i >= 1900; i--) {
            $received_year.append("<option value='" + i + "'>" + get_i18n_time_text({type: "year", number: i}) + "</option>");
        }
        for (var i = 0; i < 12; i++) {
            $received_month.append("<option value='" + i + "'>" + get_i18n_time_text({type: "month", number: i}) + "</option>");
        }
        for (var i = 1; i <= 31; i++) {
            $received_day.append("<option value='" + i + "'>" + get_i18n_time_text({type: "date", number: i}) + "</option>");
        }
    }
    if (obj.is_new === false) {
        if (
            obj.type === "employment" ||
            obj.type === "education" ||
            obj.type === "prize" ||
            obj.type === "location" ||
            obj.type === "website"
        ) {
            $('.prompt#update-profile-prompt').attr('data-id', obj.doc._id);
        }
        if (
            obj.type === "blog_name" ||
            obj.type === "simple_career" ||
            obj.type === "self_introduction"
        ) {
            $("#first").val(obj.doc[obj.type]);
            if (obj.type === "simple_career" && obj.doc && obj.doc["show_simple_career"] === true) {
                $("#show").prop("checked", true);
            }
        } else if (obj.type === "iq_eq") {
            obj.doc["iq"] = parseInt(obj.doc["iq"]);
            obj.doc["eq"] = parseInt(obj.doc["eq"]);
            if (obj.doc["iq"] !== 0) {
                $("#first").val(obj.doc["iq"]);
            }
            if (obj.doc["eq"] !== 0) {
                $("#second").val(obj.doc["eq"]);
            }
        } else if (
            obj.type === "employment" ||
            obj.type === "education" ||
            obj.type === "prize" ||
            obj.type === "location"
        ) {
            if (obj.type === "employment") {
                $("#first").val(obj.doc["position"]);
                $("#second").val(obj.doc["company"]);
            } else if (obj.type === "education") {
                $("#first").val(obj.doc["school"]);
                $("#second").val(obj.doc["major"]);
                $("#third").val(obj.doc["minor"]);
                $("#fourth").val(obj.doc["degree"]);
            } else if (obj.type === "prize") {
                $("#first").val(obj.doc["item"]);
            } else if (obj.type === "location") {
                $("#first").val(obj.doc["country"]);
                $("#second").val(obj.doc["city"]);
            }
            if (
                obj.type === "employment" ||
                obj.type === "education" ||
                obj.type === "location"
            ) {
                if (obj.doc && obj.doc['start_year'] !== 0) {
                    $start_year.find('option[value=' + obj.doc['start_year'] + ']').prop('selected', true);

                    if (obj.doc && obj.doc['start_month'] !== 0) {
                        $start_month.find('option[value=' + (parseInt(obj.doc['start_month']) - 1)  + ']').prop('selected', true);
                        days_of_month = get_days_of_month(obj.doc['start_year'], (obj.doc['start_month'] - 1));
                        $start_day.empty().append("<option selected='selected' value=''>" + i18n[lang].day + "</option>");

                        for (var i = 0; i < days_of_month.length; i++) {
                            $start_day.append("<option value='" + days_of_month[i] + "'>" + get_i18n_time_text({type: "date", number: days_of_month[i]}) + "</option>");
                        }

                        if (obj.doc && obj.doc['start_day'] !== 0) {
                            $start_day.find('option[value=' + obj.doc['start_day'] + ']').prop('selected', true);
                        }
                    } else {
                        $start_day.attr('disabled', 'disabled');
                    }
                } else {
                    $start_month.attr('disabled', 'disabled');
                    $start_day.attr('disabled', 'disabled');
                }
                if (obj.doc && obj.doc["ing"] === 1) {
                    $("#ing").prop("checked", true);
                    $end_year.attr('disabled', 'disabled');
                    $end_month.attr('disabled', 'disabled');
                    $end_day.attr('disabled', 'disabled');
                } else {
                    if (obj.doc && obj.doc['end_year'] !== 0) {
                        $end_year.find('option[value=' + obj.doc['end_year'] + ']').prop('selected', true);
                        if (obj.doc && obj.doc['end_month'] !== 0) {
                            $end_month.find('option[value=' + (parseInt(obj.doc['end_month']) - 1)  + ']').prop('selected', true);
                            days_of_month = get_days_of_month(obj.doc['end_year'], (obj.doc['end_month'] - 1));
                            $end_day.empty().append("<option selected='selected' value=''" + i18n[lang].day + "</option>");
                            for (var i = 0; i < days_of_month.length; i++) {
                                $end_day.append("<option value='" + days_of_month[i] + "'>" + get_i18n_time_text({type: "date", number: days_of_month[i]}) + "</option>");
                            }
                            if (obj.doc && obj.doc['end_day'] !== 0) {
                                $end_day.find('option[value=' + obj.doc['end_day'] + ']').prop('selected', true);
                            }
                        } else {
                            $end_day.attr('disabled', 'disabled');
                        }
                    } else {
                        $end_month.attr('disabled', 'disabled');
                        $end_day.attr('disabled', 'disabled');
                    }
                }
            } else {
                if (obj.doc && obj.doc['received_year'] !== 0) {
                    $received_year.find('option[value=' + obj.doc['received_year'] + ']').prop('selected', true);
                    if (obj.doc && obj.doc['received_month'] !== 0) {
                        $received_month.find('option[value=' + (parseInt(obj.doc['received_month']) - 1)  + ']').prop('selected', true);
                        days_of_month = get_days_of_month(obj.doc['received_year'], (obj.doc['received_month'] - 1));
                        $received_day.empty().append("<option selected='selected' value=''>" + i18n[lang].day + "</option>");
                        for (var i = 0; i < days_of_month.length; i++) {
                            $received_day.append("<option value='" + days_of_month[i] + "'>" + get_i18n_time_text({type: "date", number: days_of_month[i]}) + "</option>");
                        }
                        if (obj.doc && obj.doc['received_day'] !== 0) {
                            $received_day.find('option[value=' + obj.doc['received_day'] + ']').prop('selected', true);
                        }
                    } else {
                        $received_day.attr('disabled', 'disabled');
                    }
                } else {
                    $received_month.attr('disabled', 'disabled');
                    $received_day.attr('disabled', 'disabled');
                }
            }
            if (obj.doc && obj.doc["show"] === true) {
                $("#show").prop("checked", true);
            }
        } else if (obj.type === "website") {
            if (obj.doc) {
                $("#first").val(obj.doc.title);
                $("#second").find('option[value=' + obj.doc.protocol + ']').prop('selected', true);
                $("#third").val(obj.doc.url);
            }
        }
    } else {
        if (
            obj.type === "employment" ||
            obj.type === "education" ||
            obj.type === "location"
        ) {
            $start_month.attr('disabled', 'disabled');
            $start_day.attr('disabled', 'disabled');
            $end_month.attr('disabled', 'disabled');
            $end_day.attr('disabled', 'disabled');
        }
        if (
            obj.type === "prize"
        ) {
            $received_month.attr('disabled', 'disabled');
            $received_day.attr('disabled', 'disabled');
        }
    }
    if (is_edit_detailed_career_prompt_opened === true) {
        modal(".prompt#edit-detailed-career-prompt", "close");
    }
    modal(".prompt#update-profile-prompt", "open");
    return false;
};
blog["profile"]["prompt"]["close"] = function () {
    modal(".prompt#update-profile-prompt", "close");
    if (is_edit_detailed_career_prompt_opened === true) {
        modal(".prompt#edit-detailed-career-prompt", "open");
    }
    return false;
};
blog["profile"]["get_and_open"] = function (obj) {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    s_cb = function (result) {
        if ( result['response'] === true ) {
            blog["profile"]["prompt"]["open"]({
                type: obj.type,
                is_new: false,
                doc: result['doc']
            });
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
            }
        }
    };
    f_cb = function () {
        show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
    };
    methods["the_world"]["is_one"]({
        show_animation: true,
        data:{type:encodeURIComponent(obj.type),id:encodeURIComponent(obj.id)},
        pathname:'/get/profile',
        s_cb:s_cb,
        f_cb:f_cb
    });
};
blog["profile"]["update"] = function (obj) {
    var data = {}
        , pathname = '/update/profile'
        , s_cb
        , f_cb
        , iq
        , eq
        , message
        , $start_year
        , $start_month
        , $start_day
        , $end_year
        , $end_month
        , $end_day
        , $received_year
        , $received_month
        , $received_day
        , start_year
        , start_month
        , start_day
        , end_year
        , end_month
        , end_day
        , received_year
        , received_month
        , received_day
        , website_name
        , website_protocol
        , website_url
        , website_link;
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if ($('#first').val() === "" && ((obj['action'] === 'add') || (obj['action'] === 'update'))) {
        if (
            obj['type'] === "blog_name" ||
            obj['type'] === "simple_career" ||
            obj['type'] === "self_introduction" ||
            obj['type'] === "prize"
        ) {
            if (obj['type'] === "blog_name") {
                show_bert('danger', 2000, i18n[lang].please_enter_blog_name);
            } else if (obj['type'] === "simple_career") {
                show_bert('danger', 2000, i18n[lang].please_enter_occupation);
            } else if (obj['type'] === "self_introduction") {
                show_bert('danger', 2000, i18n[lang].please_enter_self_introduction);
            } else if (obj['type'] === "prize") {
                show_bert('danger', 2000, i18n[lang].please_enter_awards_and_honors);
            }
            return false;
        } else {
            if ( obj['type'] !== "iq_eq" ) {
                show_bert("danger", 2000, i18n[lang].please_enter_required_elements);
                return false;
            }
        }
    }
    if ( obj['type'] === 'iq_eq') {
        iq = $('#first').val();
        eq = $('#second').val();
        if (iq === "" && eq === "" ) {
            show_bert('danger', 2000, i18n[lang].please_enter_iq_eq);
            return false;
        } else {
            if (iq === "") {
                try {
                    eq = parseInt(eq);
                    if (isNaN(eq) === true) {
                        show_bert('danger', 2000, i18n[lang].please_enter_only_numbers);
                        return false;
                    }
                } catch (e) {
                    show_bert('danger', 2000, i18n[lang].please_enter_only_numbers);
                    return false;
                }
            } else {
                if (eq === "") {
                    try {
                        iq = parseInt(iq);
                        if (isNaN(iq) === true) {
                            show_bert('danger', 2000, i18n[lang].please_enter_only_numbers);
                            return false;
                        }
                    } catch (e) {
                        show_bert('danger', 2000, i18n[lang].please_enter_only_numbers);
                        return false;
                    }
                } else {
                    try {
                        iq = parseInt(iq);
                        eq = parseInt(eq);
                        if (isNaN(iq) === true || isNaN(eq) === true) {
                            show_bert('danger', 2000, i18n[lang].please_enter_only_numbers);
                            return false;
                        }
                    } catch (e) {
                        show_bert('danger', 2000, i18n[lang].please_enter_only_numbers);
                        return false;
                    }
                }
            }
            if (iq === "") {
                if (eq < 1) {
                    show_bert('danger', 2000, i18n[lang].minimum_value_is_1);
                    return false;
                }
            } else {
                if (eq === "") {
                    if (iq < 1) {
                        show_bert('danger', 2000, i18n[lang].minimum_value_is_1);
                        return false;
                    }
                } else {
                    if (iq < 1 && eq < 1) {
                        show_bert('danger', 2000, i18n[lang].minimum_value_is_1);
                        return false;
                    } else {
                        if (iq < 1) {
                            show_bert('danger', 2000, i18n[lang].minimum_value_is_1);
                            return false;
                        }
                        if (eq < 1) {
                            show_bert('danger', 2000, i18n[lang].minimum_value_is_1);
                            return false;
                        }
                    }
                }
            }
        }
    }
    if (obj['type'] === "website") {
        website_url = $('#third').val();
        if (website_url === "" ) {
            show_bert("danger", 2000, i18n[lang].please_enter_required_elements);
            return false;
        } else {}
    }
    if (
        obj['type'] === "blog_name" ||
        obj['type'] === "simple_career" ||
        obj['type'] === "self_introduction"
    ) {
        data['type'] = encodeURIComponent(obj['type']);
        data['value'] = encodeURIComponent($('#first').val());
        if (obj['type'] === 'simple_career') {
            data['show_simple_career'] = encodeURIComponent($('#show').is(":checked") === true);
        }
    } else if (
        obj['type'] === "iq_eq"
    ) {
        data['type'] = encodeURIComponent(obj['type']);
        data['iq'] = encodeURIComponent($('#first').val());
        data['eq'] = encodeURIComponent($('#second').val());
    } else if (
        obj['type'] === "website"
    ) {
        if (obj['action'] !== 'add') {
            data['id'] = encodeURIComponent(obj['id']);
        }
        data['type'] = encodeURIComponent(obj['action'] + '_' + obj['type']);
        data['title'] = encodeURIComponent($('#first').val());
        data['protocol'] = encodeURIComponent($('#second').find('option:selected').val());
        data['url'] = encodeURIComponent($('#third').val());
    } else {
        data['type'] = encodeURIComponent(obj['action'] + '_' + obj['type']);
        if (obj['action'] !== 'add') {
            data['id'] = encodeURIComponent(obj['id']);
        }
        if ((obj['type'] === 'employment') && (obj['action'] !== 'remove')) {
            data['position'] = encodeURIComponent($('#first').val());
            data['company'] = encodeURIComponent($('#second').val());
            message = i18n[lang].wrong_condition + " " + i18n[lang].valid_format + ": " + i18n[lang].join + " <= " + i18n[lang].resignation;
        } else if ((obj['type'] === 'education') && (obj['action'] !== 'remove')) {
            data['school'] = encodeURIComponent($('#first').val());
            data['major'] = encodeURIComponent($('#second').val());
            data['minor'] = encodeURIComponent($('#third').val());
            data['degree'] = encodeURIComponent($('#fourth').val());
            message = i18n[lang].wrong_condition + " " + i18n[lang].valid_format + ": " + i18n[lang].admission + " <= " + i18n[lang].graduation;
        } else if ((obj['type'] === 'prize') && (obj['action'] !== 'remove')) {
            data['item'] = encodeURIComponent($('#first').val());
            data['show'] = encodeURIComponent($('#show').is(":checked"));
        } else if ((obj['type'] === 'location') && (obj['action'] !== 'remove')) {
            data['country'] = encodeURIComponent($('#first').val());
            data['city'] = encodeURIComponent($('#second').val());
            message = i18n[lang].wrong_condition + " " + i18n[lang].valid_format + ": " + i18n[lang].start + " <= " + i18n[lang].move;
        }
        if (
            ((obj['type'] === 'employment') && (obj['action'] !== 'remove')) ||
            ((obj['type'] === 'education') && (obj['action'] !== 'remove')) ||
            ((obj['type'] === 'location') && (obj['action'] !== 'remove'))
        ) {
            data['ing'] = encodeURIComponent($('#ing').is(":checked"));
            data['show'] = encodeURIComponent($('#show').is(":checked"));
            $start_year = $('.prompt#update-profile-prompt #start-year');
            $start_month = $('.prompt#update-profile-prompt #start-month');
            $start_day = $('.prompt#update-profile-prompt #start-day');
            $end_year = $('.prompt#update-profile-prompt #end-year');
            $end_month = $('.prompt#update-profile-prompt #end-month');
            $end_day = $('.prompt#update-profile-prompt #end-day');
            start_year = $start_year.find('option:selected').val();
            start_month = $start_month.find('option:selected').val();
            start_day = $start_day.find('option:selected').val();
            end_year = $end_year.find('option:selected').val();
            end_month = $end_month.find('option:selected').val();
            end_day = $end_day.find('option:selected').val();
            if (start_year !== "") {
                start_year = parseInt(start_year);
            } else {
                start_month = "";
                start_day = "";
            }
            if (start_month !== "") {
                start_month = parseInt(start_month) + 1;
            } else {
                start_day = "";
            }
            if (start_day !== "") {
                start_day = parseInt(start_day);
            }
            if (end_year !== "") {
                end_year = parseInt(end_year);
            } else {
                end_month = "";
                end_day = "";
            }
            if (end_month !== "") {
                end_month = parseInt(end_month) + 1;
            } else {
                end_day = "";
            }
            if (end_day !== "") {
                end_day = parseInt(end_day);
            }
            var is_ing_checked = $('#ing').is(':checked');
            if (is_ing_checked === false) {
                if (start_year !== "" && end_year !== "") {
                    if (start_year > end_year) {
                        show_bert("danger", "3000", message);
                        return false;
                    } else if (start_year === end_year) {
                        if (start_month !== "" && end_month !== "") {
                            if (start_month > end_month) {
                                show_bert("danger", "3000", message);
                                return false;
                            } else if (start_month === end_month) {
                                if (start_day !== "" && end_day !== "") {
                                    if (start_day > end_day) {
                                        show_bert("danger", "3000", message);
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                end_year = "";
                end_month = "";
                end_day = "";
            }
            data['start_year'] = encodeURIComponent(start_year);
            data['start_month'] = encodeURIComponent(start_month);
            data['start_day'] = encodeURIComponent(start_day);
            data['end_year'] = encodeURIComponent(end_year);
            data['end_month'] = encodeURIComponent(end_month);
            data['end_day'] = encodeURIComponent(end_day);
        }
        if (
            ((obj['type'] === 'prize') && (obj['action'] !== 'remove'))
        ) {
            $received_year = $('.prompt#update-profile-prompt #received-year');
            $received_month = $('.prompt#update-profile-prompt #received-month');
            $received_day = $('.prompt#update-profile-prompt #received-day');
            received_year = $received_year.find('option:selected').val();
            received_month = $received_month.find('option:selected').val();
            received_day = $received_day.find('option:selected').val();
            if (received_year !== "") {
                received_year = parseInt(received_year);
            } else {
                received_month = "";
                received_day = "";
            }
            if (received_month !== "") {
                received_month = parseInt(received_month) + 1;
            } else {
                received_day = "";
            }
            if (received_day !== "") {
                received_day = parseInt(received_day);
            }
            data['received_year'] = encodeURIComponent(received_year);
            data['received_month'] = encodeURIComponent(received_month);
            data['received_day'] = encodeURIComponent(received_day);
        }
    }
    if (
        obj['type'] === "iq_eq" ||
        obj['type'] === "blog_name" ||
        obj['type'] === "simple_career" ||
        obj['type'] === "self_introduction") {
        if (obj['type'] === "iq_eq") {
            message = i18n[lang].successfully_changed_iq_eq;
        } else if (obj['type'] === "blog_name") {
            message = i18n[lang].successfully_changed_blog_name;
        } else if (obj['type'] === "simple_career") {
            message = i18n[lang].successfully_changed_occupation;
        } else if (obj['type'] === "self_introduction") {
            message = i18n[lang].successfully_changed_self_introduction;
        }
    } else {
        if (obj['action'] === 'add') {
            if (obj['type'] === "employment") {
                message = i18n[lang].successfully_added_career;
            } else if (obj['type'] === "education") {
                message = i18n[lang].successfully_added_education2;
            } else if (obj['type'] === "prize") {
                message = i18n[lang].successfully_added_awards_and_honors;
            } else if (obj['type'] === "location") {
                message = i18n[lang].successfully_added_residence;
            } else if (obj['type'] === "website") {
                message = i18n[lang].successfully_added_website;
            }
        } else if (obj['action'] === 'update') {
            if (obj['type'] === "employment") {
                message = i18n[lang].successfully_changed_career;
            } else if (obj['type'] === "education") {
                message = i18n[lang].successfully_changed_education2;
            } else if (obj['type'] === "prize") {
                message = i18n[lang].successfully_changed_awards_and_honors;
            } else if (obj['type'] === "location") {
                message = i18n[lang].successfully_changed_residence;
            } else if (obj['type'] === "website") {
                message = i18n[lang].successfully_changed_website;
            }
        } else if (obj['action'] === 'remove') {
            if (obj['type'] === "employment") {
                message = i18n[lang].successfully_removed_career;
            } else if (obj['type'] === "education") {
                message = i18n[lang].successfully_removed_education2;
            } else if (obj['type'] === "prize") {
                message = i18n[lang].successfully_removed_awards_and_honors;
            } else if (obj['type'] === "location") {
                message = i18n[lang].successfully_removed_residence;
            } else if (obj['type'] === "website") {
                message = i18n[lang].successfully_removed_website;
            }
        }
    }
    s_cb = function (result) {
        if ( result['response'] === true ) {
            if (
                obj['type'] === "iq_eq" ||
                obj['type'] === "blog_name" ||
                obj['type'] === "simple_career" ||
                obj['type'] === "self_introduction" ||
                obj['type'] === "website"
            ) {
                blog["contents"]["update"][obj['type']]();
            }
            if (
                obj['type'] === "simple_career" ||
                obj['type'] === "employment" ||
                obj['type'] === "education" ||
                obj['type'] === "prize" ||
                obj['type'] === "location"
            ) {
                blog["contents"]["update"]["detailed_career_and_showing_profile"]();
            }
            show_bert('success', 2000, message);
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
            }
        }
        modal(".prompt#update-profile-prompt", "close");
        if (is_edit_detailed_career_prompt_opened === true) {
            modal(".prompt#edit-detailed-career-prompt", "open");
        }
    };
    f_cb = function () {
        show_bert('success', 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
        modal(".prompt#update-profile-prompt", "close");
        if (is_edit_detailed_career_prompt_opened === true) {
            modal(".prompt#edit-detailed-career-prompt", "open");
        }
    };
    methods["the_world"]["is_one"]({
        show_animation: true,
        data:data,
        pathname:pathname,
        s_cb:s_cb,
        f_cb:f_cb
    });
};
blog["contents"] = {};
blog["contents"]["get"] = {};
blog["contents"]["get"]["profile_item_for_show"] = function (type, item, lang) {
    if (lang === undefined) {
        lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
    }
    var str_list = "", date = "";
    if (type === 'employment') {
        var company, str_company;
        for (var i = 0; i < item.length; i++) {
            company = "";
            if (item[i]["company"] !== "") {
                if (
                    lang === "en" ||
                    lang === "ko"
                ) {
                    company = company + item[i]["company"] + " ";
                } else {
                    company = company + item[i]["company"];
                }
            }
            company = company + item[i]["position"];
            if (item[i]["ing"] === 1) {
                if (
                    lang === "en" ||
                    lang === "ko"
                ) {
                    str_company = i18n[lang].current + " " + company;
                } else {
                    str_company = i18n[lang].current + company;
                }
            } else {
                if (
                    lang === "en" ||
                    lang === "ko"
                ) {
                    str_company = i18n[lang].previous + " " + company;
                } else {
                    str_company = i18n[lang].previous + company;
                }
            }
            if (item[i]["show"] === true) {
                if (str_list === "") {
                    str_list = str_company;
                } else {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        str_list = str_list + ", " + str_company;
                    } else {
                        str_list = str_list + "、" + str_company;
                    }
                }
            }
            date = "";
            if (item[i]["start_year"] !== 0) {
                if (item[i]["start_month"] !== 0) {
                    if (item[i]["start_day"] !== 0) {
                        date = item[i]["start_year"] + "." + convert_to_two_digits(item[i]["start_month"]) + "." + convert_to_two_digits(item[i]["start_day"]);
                    } else {
                        date = item[i]["start_year"] + "." + convert_to_two_digits(item[i]["start_month"]);
                    }
                } else {
                    date = item[i]["start_year"];
                }
            }
            if (item[i]["ing"] === 1) {
                date = date + "~" + i18n[lang].now + " ";
            } else {
                if (item[i]["end_year"] !== 0) {
                    date = date + "~";
                    if (item[i]["end_month"] !== 0) {
                        if (item[i]["end_day"] !== 0) {
                            date = date + item[i]["end_year"] + "." + convert_to_two_digits(item[i]["end_month"]) + "." + convert_to_two_digits(item[i]["end_day"]);
                        } else {
                            date = date + item[i]["end_year"] + "." + convert_to_two_digits(item[i]["end_month"]);
                        }
                    } else {
                        date = date + item[i]["end_year"];
                    }
                    date = date + " ";
                } else {
                    if (date !== "") {
                        date = date + "~ ";
                    }
                }
            }
            item[i]["employment_content"] = date + company;
        }
    } else if (type === 'education') {
        var education, str_education;
        for (var i = 0; i < item.length; i++) {
            education = item[i]["school"];
            if (item[i]["major"] !== "") {
                if (
                    lang === "en" ||
                    lang === "ko"
                ) {
                    education = education + " " + item[i]["major"];
                } else {
                    education = education + item[i]["major"];
                }
            }
            if (item[i]["minor"] !== "") {
                if (
                    lang === "en" ||
                    lang === "ko"
                ) {
                    education = education + " " + item[i]["minor"];
                } else {
                    education = education + item[i]["minor"];
                }
            }
            if (item[i]["degree"] !== "") {
                if (
                    lang === "en" ||
                    lang === "ko"
                ) {
                    education = education + " " + item[i]["degree"];
                } else {
                    education = education + item[i]["degree"];
                }
            }
            if (item[i]["ing"] !== 1) {
                if (
                    lang === "en" ||
                    lang === "ko"
                ) {
                    if (lang === "en") {
                        str_education =  i18n[lang].graduated_from + " " + education;
                    } else {
                        str_education = education + " " + i18n[lang].graduated_from;
                    }
                } else {
                    str_education = education + i18n[lang].graduated_from;
                }
            }
            if (item[i]["show"] === true) {
                if (str_list === "") {
                    str_list = str_education;
                } else {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        str_list = str_list + ", " + str_education;
                    } else {
                        str_list = str_list + "、" + str_education;
                    }
                }
            }
            date = "";
            if (item[i]["start_year"] !== 0) {
                if (item[i]["start_month"] !== 0) {
                    if (item[i]["start_day"] !== 0) {
                        date = item[i]["start_year"] + "." + convert_to_two_digits(item[i]["start_month"]) + "." + convert_to_two_digits(item[i]["start_day"]);
                    } else {
                        date = item[i]["start_year"] + "." + convert_to_two_digits(item[i]["start_month"]);
                    }
                } else {
                    date = item[i]["start_year"];
                }
            }
            if (item[i]["ing"] === 1) {
                date = date + "~" + i18n[lang].now + " ";
            } else {
                if (item[i]["end_year"] !== 0) {
                    date = date + "~";
                    if (item[i]["end_month"] !== 0) {
                        if (item[i]["end_day"] !== 0) {
                            date = date + item[i]["end_year"] + "." + convert_to_two_digits(item[i]["end_month"]) + "." + convert_to_two_digits(item[i]["end_day"]);
                        } else {
                            date = date + item[i]["end_year"] + "." + convert_to_two_digits(item[i]["end_month"]);
                        }
                    } else {
                        date = date + item[i]["end_year"];
                    }
                    date = date + " ";
                } else {
                    if (date !== "") {
                        date = date + "~ ";
                    }
                }
            }
            item[i]["education_content"] = date + education;
        }
    } else if (type === 'prize') {
        var prize, str_prize;
        for (var i = 0; i < item.length; i++) {
            prize = item[i]["item"];
            str_prize = prize;
            if (item[i]["show"] === true) {
                if (str_list === "") {
                    str_list = str_prize;
                } else {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        str_list = str_list + ", " + str_prize;
                    } else {
                        str_list = str_list + "、" + str_prize;
                    }
                }
            }
            date = "";
            if (item[i]["received_year"] !== 0) {
                if (item[i]["received_month"] !== 0) {
                    if (item[i]["received_day"] !== 0) {
                        date = item[i]["received_year"] + "." + item[i]["received_month"] + "." + item[i]["received_day"] + " ";
                    } else {
                        date = item[i]["received_year"] + "." + item[i]["received_month"] + " ";
                    }
                } else {
                    date = item[i]["received_year"] + " ";
                }
            }
            item[i]["prize_content"] = date + prize;
        }
    } else if (type === 'location') {
        var location, str_location;
        for (var i = 0; i < item.length; i++) {
            location = item[i]["country"];
            if (item[i]["city"] !== "") {
                if (
                    lang === "en" ||
                    lang === "ko"
                ) {
                    location = location + " " + item[i]["city"];
                } else {
                    location = location + item[i]["city"];
                }
            }
            str_location = location;
            if (item[i]["show"] === true) {
                if (str_list === "") {
                    str_list = str_location;
                } else {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        str_list = str_list + ", " + str_location;
                    } else {
                        str_list = str_list + "、" + str_location;
                    }
                }
            }
            date = "";
            if (item[i]["start_year"] !== 0) {
                if (item[i]["start_month"] !== 0) {
                    if (item[i]["start_day"] !== 0) {
                        date = item[i]["start_year"] + "." + convert_to_two_digits(item[i]["start_month"]) + "." + convert_to_two_digits(item[i]["start_day"]);
                    } else {
                        date = item[i]["start_year"] + "." + convert_to_two_digits(item[i]["start_month"]);
                    }
                } else {
                    date = item[i]["start_year"];
                }
            }
            if (item[i]["ing"] === 1) {
                date = date + "~" + i18n[lang].now + " ";
            } else {
                if (item[i]["end_year"] !== 0) {
                    date = date + "~";
                    if (item[i]["end_month"] !== 0) {
                        if (item[i]["end_day"] !== 0) {
                            date = date + item[i]["end_year"] + "." + convert_to_two_digits(item[i]["end_month"]) + "." + convert_to_two_digits(item[i]["end_day"]);
                        } else {
                            date = date + item[i]["end_year"] + "." + convert_to_two_digits(item[i]["end_month"]);
                        }
                    } else {
                        date = date + item[i]["end_year"];
                    }
                    date = date + " ";
                } else {
                    if (date !== "") {
                        date = date + "~ ";
                    }
                }
            }
            item[i]["location_content"] = date + location;
        }
    }
    return {
        str_list: str_list
        , item: item
    }
};
blog["contents"]["update"] = {};
blog["contents"]["update"]["blog_name"] = function () {
    var value = $('#first').val();
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    page_title = value;
    var sum = message_counts + notification_counts;
    if (sum > 0) {
        document.title = "(" + sum + ") " + page_title;
    } else {
        document.title = page_title;
    }
    if (is_blog_owner() === true) {
        $("#blog-name-text").text(value);
    }
};
blog["contents"]["update"]["self_introduction"] = function () {
    var value = $('#first').val();
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (is_blog_owner() === true) {
        $("#self-introduction").removeAttr("class");
        if ($("#edit-self-introduction").length === 0) {
            $("#self-introduction").append("<span id='edit-self-introduction'>" + i18n[lang].edit + "</span>");
        }
        $("#self-introduction-content").text(value);
    }
};
blog["contents"]["update"]["iq_eq"] = function () {
    var iq = $('#first').val();
    var eq = $('#second').val();
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var str;
    if (is_blog_owner() === true) {
        if (iq === "") {
            if (eq === "") {
                $('#iq-eq').addClass('empty').empty().append("<span>" + i18n[lang].please_enter_iq_eq + "</span>");
                return false;
            } else {
                str = eq + " (EQ)";
            }
        } else {
            if (eq === "") {
                str = iq + " (IQ)";
            } else {
                str = iq + " (IQ) · " + eq + " (EQ)";
            }
        }
        $('#iq-eq').removeClass('empty').empty().append("<span>" + str + "</span><span id='edit-iq-eq'>" + i18n[lang].edit + "</span>");
    }
};
blog["contents"]["update"]["simple_career"] = function () {
    var value = $('#first').val();
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (is_blog_owner() === true) {
        $('#simple-career').removeAttr('class');
        $("#show-simple-career").remove();
        $("#edit-simple-career").remove();
        if ($('#show').is(":checked") === true) {
            $('#simple-career').append("<span id='show-simple-career'>✔</span>").append("<span id='edit-simple-career'>" + i18n[lang].edit + "</span>");
        } else {
            $('#simple-career').append("<span id='edit-simple-career'>" + i18n[lang].edit + "</span>");
        }
        $('#simple-career-content').text(value);
    }
};
blog["contents"]["update"]["website"] = function () {
    if (is_blog_owner() === true) {
        var css_version = $("body").attr("data-css-version");
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var website_list = ""
            , img1
            , span1
            , a1
            , li1;
        s_cb = function (result) {
            if ( result['response'] === true ) {
                var profile_info = result['doc'];
                img1 = "<img class='emoticon-img' src='" + aws_s3_url + "/icons/website.png" + css_version + "'>";
                span1 = "<span class='edit'>" + i18n[lang].edit + "</span>";
                for (var i = 0; i < profile_info["website"].length; i++) {
                    a1 = "<a href='" + profile_info["website"][i].protocol + "://" + profile_info["website"][i].url + "' target='_blank' style='vertical-align:middle;text-decoration:underline;display:inline;'>" + get_encoded_html_preventing_xss(profile_info["website"][i].title) + "</a>";
                    if ( (i+1) === profile_info["website"].length) {
                        li1 = "<li class='website " + profile_info["website"][i]["_id"] + "' style='border-bottom:1px solid #ebebeb'>" + img1 + span1 + a1 + "</li>";
                    } else {
                        li1 = "<li class='website " + profile_info["website"][i]["_id"] + "'>" + img1 + span1 + a1 + "</li>";
                    }
                    website_list = website_list + li1;
                }
                $("#desktop-website ul").empty().append(website_list);
                $("#mobile-website ul").empty().append(website_list);
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        f_cb = function () {};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{type:encodeURIComponent("all"),id:encodeURIComponent("all")},
            pathname:'/get/profile',
            s_cb:s_cb,
            f_cb:f_cb
        });
    }
};
blog["contents"]["update"]["detailed_career_and_showing_profile"] = function () {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    s_cb = function (result) {
        if ( result['response'] === true ) {
            var css_version = $("body").attr("data-css-version");
            var date, employment, str_employment, education, str_education, prize, str_prize, location, str_location;
            $(".prompt#edit-detailed-career-prompt ul").empty();
            var profile_info = result['doc'];
            var li1, img1, img2, span1, span2, span3, div1, div2, simple_career_title="", simple_career="", employment_title="", employment_list="", education_title="", education_list="", prize_title="", prize_list="", location_title="", location_list="";
            var showing_profile = "";
            if (profile_info["show_simple_career"] === true) {
                showing_profile = profile_info["simple_career"];
            }
            if (profile_info["simple_career"] === "") {
                div1 = "<div class='add-simple-career add empty'>" + i18n[lang].add + "</div>";
            } else {
                div1 = "";
            }
            div2 = "<div>" + i18n[lang].occupation + "</div>";
            simple_career_title = "<li class='simple-career-title'>" + div1 + div2 + "</li>";
            div1 = "<div class='add-employment add empty'>" + i18n[lang].add + "</div>";
            div2 = "<div>" + i18n[lang].career + "</div>";
            employment_title = "<li class='employment-title'>" + div1 + div2 + "</li>";
            div1 = "<div class='add-education add empty'>" + i18n[lang].add + "</div>";
            div2 = "<div>" + i18n[lang].education2 +  "</div>";
            education_title = "<li class='education-title'>" + div1 + div2 + "</li>";
            div1 = "<div class='add-prize add empty'>" + i18n[lang].add + "</div>";
            div2 = "<div>" + i18n[lang].awards_and_honors + "</div>";
            prize_title = "<li class='prize-title'>" + div1 + div2 + "</li>";
            div1 = "<div class='add-location add empty'>" + i18n[lang].add + "</div>";
            div2 = "<div>" + i18n[lang].residence + "</div>";
            location_title = "<li class='location-title'>" + div1 + div2 + "</li>";
            img1 = "<img class='emoticon-img' src='" + aws_s3_url + "/icons/simple-career.png" + css_version + "'>";
            span1 = "<span class='edit'>" + i18n[lang].edit + "</span>";
            if (profile_info["show_simple_career"] === true) {
                span2 = "<span class='show'>✔</span>";
            } else {
                span2 = "";
            }
            span3 = "<span style='vertical-align:middle;'>" + get_encoded_html_preventing_xss(profile_info["simple_career"]) + "</span>";
            if (profile_info["simple_career"] === "") {
                simple_career = "";
            } else {
                simple_career = "<li class='simple-career' style='border-bottom:1px solid #ebebeb;'>" + img1 + span1 + span2 + span3 + "</li>";
            }
            for (var i = 0; i < profile_info["employment"].length; i++) {
                employment = "";
                if (profile_info["employment"][i]["company"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        employment = employment + profile_info["employment"][i]["company"] + " ";
                    } else {
                        employment = employment + profile_info["employment"][i]["company"];
                    }
                }
                employment = employment + profile_info["employment"][i]["position"];
                if (profile_info["employment"][i]["ing"] === 1) {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        str_employment = i18n[lang].current + " " + employment;
                    } else {
                        str_employment = i18n[lang].current + employment;
                    }
                } else {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        str_employment = i18n[lang].previous + " " + employment;
                    } else {
                        str_employment = i18n[lang].previous + employment;
                    }
                }
                if (profile_info["employment"][i]["show"] === true) {
                    if (showing_profile === "") {
                        showing_profile = str_employment;
                    } else {
                        if (
                            lang === "en" ||
                            lang === "ko"
                        ) {
                            showing_profile = showing_profile + ", " + str_employment;
                        } else {
                            showing_profile = showing_profile + "、" + str_employment;
                        }
                    }
                }
                date = "";
                if (profile_info["employment"][i]["start_year"] !== 0) {
                    if (profile_info["employment"][i]["start_month"] !== 0) {
                        if (profile_info["employment"][i]["start_day"] !== 0) {
                            date = profile_info["employment"][i]["start_year"] + "." + convert_to_two_digits(profile_info["employment"][i]["start_month"]) + "." + convert_to_two_digits(profile_info["employment"][i]["start_day"]);
                        } else {
                            date = profile_info["employment"][i]["start_year"] + "." + convert_to_two_digits(profile_info["employment"][i]["start_month"]);
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
                                date = date + profile_info["employment"][i]["end_year"] + "." + convert_to_two_digits(profile_info["employment"][i]["end_month"]) + "." + convert_to_two_digits(profile_info["employment"][i]["end_day"]);
                            } else {
                                date = date + profile_info["employment"][i]["end_year"] + "." + convert_to_two_digits(profile_info["employment"][i]["end_month"]);
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
                employment = date + employment;
                img1 = "<img class='emoticon-img' src='" + aws_s3_url + "/icons/employment.png" + css_version + "'>";
                span1 = "<span class='edit'>" + i18n[lang].edit + "</span>";
                if (profile_info["employment"][i]["show"] === true) {
                    span2 = "<span class='show'>✔</span>";
                } else {
                    span2 = "";
                }
                span3 = "<span style='vertical-align:middle;'>" + get_encoded_html_preventing_xss(employment) + "</span>";
                if ( (i+1) === profile_info["employment"].length) {
                    li1 = "<li class='employment " + profile_info["employment"][i]["_id"] + "' style='border-bottom:1px solid #ebebeb'>" + img1 + span1 + span2 + span3 + "</li>";
                } else {
                    li1 = "<li class='employment " + profile_info["employment"][i]["_id"] + "'>" + img1 + span1 + span2 + span3 + "</li>";
                }
                employment_list = employment_list + li1;
            }
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
                if (profile_info["education"][i]["ing"] !== 1) {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        if (lang === "en") {
                            str_education =  i18n[lang].graduated_from + " " + education;
                        } else {
                            str_education = education + " " + i18n[lang].graduated_from;
                        }
                    } else {
                        str_education = education + i18n[lang].graduated_from;
                    }
                }
                if (profile_info["education"][i]["show"] === true) {
                    if (showing_profile === "") {
                        showing_profile = str_education;
                    } else {
                        if (
                            lang === "en" ||
                            lang === "ko"
                        ) {
                            showing_profile = showing_profile + ", " + str_education;
                        } else {
                            showing_profile = showing_profile + "、" + str_education;
                        }
                    }
                }
                date = "";
                if (profile_info["education"][i]["start_year"] !== 0) {
                    if (profile_info["education"][i]["start_month"] !== 0) {
                        if (profile_info["education"][i]["start_day"] !== 0) {
                            date = profile_info["education"][i]["start_year"] + "." + convert_to_two_digits(profile_info["education"][i]["start_month"]) + "." + convert_to_two_digits(profile_info["education"][i]["start_day"]);
                        } else {
                            date = profile_info["education"][i]["start_year"] + "." + convert_to_two_digits(profile_info["education"][i]["start_month"]);
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
                                date = date + profile_info["education"][i]["end_year"] + "." + convert_to_two_digits(profile_info["education"][i]["end_month"]) + "." + convert_to_two_digits(profile_info["education"][i]["end_day"]);
                            } else {
                                date = date + profile_info["education"][i]["end_year"] + "." + convert_to_two_digits(profile_info["education"][i]["end_month"]);
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
                education = date + education;
                img1 = "<img class='emoticon-img' src='" + aws_s3_url + "/icons/education.png" + css_version + "'>";
                span1 = "<span class='edit'>" + i18n[lang].edit + "</span>";
                if (profile_info["education"][i]["show"] === true) {
                    span2 = "<span class='show'>✔</span>";
                } else {
                    span2 = "";
                }
                span3 = "<span style='vertical-align:middle;'>" + get_encoded_html_preventing_xss(education) + "</span>";
                if ( (i+1) === profile_info["education"].length) {
                    li1 = "<li class='education " + profile_info["education"][i]["_id"] + "' style='border-bottom:1px solid #ebebeb;'>" + img1 + span1 + span2 + span3 + "</li>";
                } else {
                    li1 = "<li class='education " + profile_info["education"][i]["_id"] + "'>" + img1 + span1 + span2 + span3 + "</li>";
                }
                education_list = education_list + li1;
            }
            for (var i = 0; i < profile_info["prize"].length; i++) {
                prize = profile_info["prize"][i]["item"];
                str_prize = prize;
                if (profile_info["prize"][i]["show"] === true) {
                    if (showing_profile === "") {
                        showing_profile = str_prize;
                    } else {
                        if (
                            lang === "en" ||
                            lang === "ko"
                        ) {
                            showing_profile = showing_profile + ", " + str_prize;
                        } else {
                            showing_profile = showing_profile + "、" + str_prize;
                        }
                    }
                }
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
                prize = date + prize;
                img1 = "<img class='emoticon-img' src='" + aws_s3_url + "/icons/prize.png" + css_version + "'>";
                span1 = "<span class='edit'>" + i18n[lang].edit + "</span>";
                if (profile_info["prize"][i]["show"] === true) {
                    span2 = "<span class='show'>✔</span>";
                } else {
                    span2 = "";
                }
                span3 = "<span style='vertical-align:middle;'>" + get_encoded_html_preventing_xss(prize) + "</span>";
                if ( (i+1) === profile_info["prize"].length) {
                    li1 = "<li class='prize " + profile_info["prize"][i]["_id"] + "' style='border-bottom:1px solid #ebebeb;'>" + img1 + span1 + span2 + span3 + "</li>";
                } else {
                    li1 = "<li class='prize " + profile_info["prize"][i]["_id"] + "'>" + img1 + span1 + span2 + span3 + "</li>";
                }

                prize_list = prize_list + li1;
            }
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
                str_location = location;
                if (profile_info["location"][i]["show"] === true) {
                    if (showing_profile === "") {
                        showing_profile = str_location;
                    } else {
                        if (
                            lang === "en" ||
                            lang === "ko"
                        ) {
                            showing_profile = showing_profile + ", " + str_location;
                        } else {
                            showing_profile = showing_profile + "、" + str_location;
                        }
                    }
                }
                date = "";
                if (profile_info["location"][i]["start_year"] !== 0) {
                    if (profile_info["location"][i]["start_month"] !== 0) {
                        if (profile_info["location"][i]["start_day"] !== 0) {
                            date = profile_info["location"][i]["start_year"] + "." + convert_to_two_digits(profile_info["location"][i]["start_month"]) + "." + convert_to_two_digits(profile_info["location"][i]["start_day"]);
                        } else {
                            date = profile_info["location"][i]["start_year"] + "." + convert_to_two_digits(profile_info["location"][i]["start_month"]);
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
                                date = date + profile_info["location"][i]["end_year"] + "." + convert_to_two_digits(profile_info["location"][i]["end_month"]) + "." + convert_to_two_digits(profile_info["location"][i]["end_day"]);
                            } else {
                                date = date + profile_info["location"][i]["end_year"] + "." + convert_to_two_digits(profile_info["location"][i]["end_month"]);
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
                location = date + location;
                img1 = "<img class='emoticon-img' src='" + aws_s3_url + "/icons/location.png" + css_version + "'>";
                span1 = "<span class='edit'>" + i18n[lang].edit + "</span>";
                if (profile_info["location"][i]["show"] === true) {
                    span2 = "<span class='show'>✔</span>";
                } else {
                    span2 = "";
                }
                span3 = "<span style='vertical-align:middle;'>" + get_encoded_html_preventing_xss(location) + "</span>";
                if ( (i+1) === profile_info["location"].length) {
                    li1 = "<li class='location " + profile_info["location"][i]["_id"] + "' style='border-bottom:1px solid #ebebeb;'>" + img1 + span1 + span2 + span3 + "</li>";
                } else {
                    li1 = "<li class='location " + profile_info["location"][i]["_id"] + "'>" + img1 + span1 + span2 + span3 + "</li>";
                }

                location_list = location_list + li1;
            }
            $(".prompt#edit-detailed-career-prompt ul").append(simple_career_title + simple_career + employment_title + employment_list + education_title + education_list + prize_title + prize_list + location_title + location_list);
            if (is_blog_owner() === true) {
                $("#desktop-employment ul").empty();
                $("#mobile-employment ul").empty();
                $("#desktop-education ul").empty();
                $("#mobile-education ul").empty();
                $("#desktop-prize ul").empty();
                $("#mobile-prize ul").empty();
                $("#desktop-location ul").empty();
                $("#mobile-location ul").empty();
                if (employment_list !== "") {
                    $("#desktop-employment ul").append(employment_list);
                    $("#mobile-employment ul").append(employment_list);
                }
                if (education_list !== "") {
                    $("#desktop-education ul").append(education_list);
                    $("#mobile-education ul").append(education_list);
                }
                if (prize_list !== "") {
                    $("#desktop-prize ul").append(prize_list);
                    $("#mobile-prize ul").append(prize_list);
                }
                if (location_list !== "") {
                    $("#desktop-location ul").append(location_list);
                    $("#mobile-location ul").append(location_list);
                }
            }
            if ($('.showing-profile').length > 0) {
                $('.showing-profile').text(showing_profile);
            }
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            }
        }
    };
    f_cb = function () {};
    methods["the_world"]["is_one"]({
        show_animation: true,
        data:{type:encodeURIComponent("all"),id:encodeURIComponent("all")},
        pathname:'/get/profile',
        s_cb:s_cb,
        f_cb:f_cb
    });
};
var flex = {};
flex["article_item"] = function () {
    if ($('.article-item').length === 0) {
        return false;
    }
    var width = $('.article-item-middle').width()
        , height
        , width1
        , width2
        , height1
        , height2;
    var lets_flex = function (type_html) {
        width1 = $("#mobile-realtime-topic-" + type_html + " .article-item-middle").width();
        width2 = $("#desktop-realtime-topic-" + type_html + " .article-item-middle").width();
        if (width1 === 226) {
            $("#mobile-realtime-topic-" + type_html + " .article-item-middle").css('height', '152px');
            height2 = Math.floor((152 * width2) / 226);
            $("#desktop-realtime-topic-" + type_html + " .article-item-middle").css('height', height2 + 'px');
        } else {
            height1 = Math.floor((152 * width1) / 226);
            height2 = Math.floor((152 * width2) / 226);
            $("#mobile-realtime-topic-" + type_html + " .article-item-middle").css('height', height1 + 'px');
            $("#desktop-realtime-topic-" + type_html + " .article-item-middle").css('height', height2 + 'px');
        }
    };

    if ($('#mobile-realtime-topic-agendas').length > 0) {
        lets_flex("agendas");
    } else {
        if ($('#mobile-realtime-topic-opinions').length > 0) {
            lets_flex("opinions");
        } else if ($('#mobile-realtime-topic-apply-now').length > 0) {
            lets_flex("apply-now");
        } else if ($('#mobile-realtime-topic-hire-me').length > 0) {
            lets_flex("hire-me");
        } else {
            if (width === 226) {
                $('.article-item-middle').css('height', '152px');
            } else {
                height = Math.floor((152 * width) / 226);
                $('.article-item-middle').css('height', height + 'px');
            }
        }
    }
    if ($('#mobile-related-articles').length > 0) {
        width1 = $('#mobile-related-articles .article-item-middle').width();
        width2 = $("#desktop-related-articles .article-item-middle").width();
        if (width1 === 226) {
            $('#mobile-related-articles .article-item-middle').css('height', '152px');
            height2 = Math.floor((152 * width2) / 226);
            $("#desktop-related-articles .article-item-middle").css('height', height2 + 'px');
        } else {
            height1 = Math.floor((152 * width1) / 226);
            height2 = Math.floor((152 * width2) / 226);
            $("#mobile-related-articles .article-item-middle").css('height', height1 + 'px');
            $("#desktop-related-articles .article-item-middle").css('height', height2 + 'px');
        }
    }
};
var init_realtime_topic_employment_list = function (type) {
    var main_tag = $("body").attr("data-main-tag");
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var type_html;
    if (type === "apply_now") {
        type_html = "apply-now";
    } else if (type === "hire_me") {
        type_html = "hire-me";
    } else {
        return false;
    }
    $(".realtime-topic-" + type_html +  "-list").css('display', 'none').empty();
    $(".realtime-topic-" + type_html + "-none").css('display', 'none');
    var s_cb = function (result) {
        if ( result['response'] === true ) {
            var final_list = get["list"](result['docs'], type, "normal");
            $(".realtime-topic-" + type_html + "-list").append(final_list);
            $(".realtime-topic-" + type_html + "-list").css('display', 'block');
            flex["article_item"]();
            if ($("#written-wrapper").length > 0 && $("#desktop-right2").length > 0) {
                if ($("#written-wrapper").height() > $("#desktop-right2").height()) {
                    $("#written-wrapper").css('border-right', '1px solid #ebebeb');
                    $("#desktop-right2").css('border-left', 'initial');
                } else {
                    $("#written-wrapper").css('border-right', 'initial');
                    $("#desktop-right2").css('border-left', '1px solid #ebebeb');
                }
            }
            if ($("#write-wrapper").length > 0 && $("#desktop-right2").length > 0) {
                if ($("#write-wrapper").height() > $("#desktop-right2").height()) {
                    $("#write-wrapper").css('border-right', '1px solid #ebebeb');
                    $("#desktop-right2").css('border-left', 'initial');
                } else {
                    $("#write-wrapper").css('border-right', 'initial');
                    $("#desktop-right2").css('border-left', '1px solid #ebebeb');
                }
            }
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                $(".realtime-topic-" + type_html + "-none").css('display', 'block');
            }
        }
    };
    var f_cb = function () {
        $(".realtime-topic-" + type_html + "-none").css('display', 'block');
    };
    methods["the_world"]["is_one"]({
        show_animation: false,
        data:{
            list_type: encodeURIComponent(type)
            , type: encodeURIComponent("realtime")
            , is_limited: encodeURIComponent("true")
        },
        pathname:"/get/list",
        s_cb:s_cb,
        f_cb:f_cb
    });
};
var init_realtime_tag_agendas_list = function (is_write) {
    var main_tag;
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (is_write === true) {
        main_tag = $('#ground select.main-tag option:selected').val();
    } else {
        main_tag = $("body").attr("data-main-tag");
    }
    var str;
    if (
        lang === "en" ||
        lang === "ko"
    ) {
        str = i18n[lang].realtime + " " + i18n[lang][main_tag] + " " + i18n[lang].agenda;
    } else {
        str = i18n[lang].realtime + i18n[lang][main_tag] + i18n[lang].agenda;
    }
    str = "연관 논제";
    $('.realtime-topic-agendas-title').empty().append(str);
    $('.realtime-topic-agendas-list').css('display', 'none').empty();
    $('.realtime-topic-agendas-none').css('display', 'none');
    var s_cb = function (result) {
        if ( result['response'] === true ) {
            var final_list = get["list"](result['docs'], "agenda", "normal");
            $('.realtime-topic-agendas-list').append(final_list);
            $('.realtime-topic-agendas-list').css('display', 'block');
            flex["article_item"]();
            if ($("#written-wrapper").length > 0 && $("#desktop-right2").length > 0) {
                if ($("#written-wrapper").height() > $("#desktop-right2").height()) {
                    $("#written-wrapper").css('border-right', '1px solid #ebebeb');
                    $("#desktop-right2").css('border-left', 'initial');
                } else {
                    $("#written-wrapper").css('border-right', 'initial');
                    $("#desktop-right2").css('border-left', '1px solid #ebebeb');
                }
            }
            if ($("#write-wrapper").length > 0 && $("#desktop-right2").length > 0) {
                if ($("#write-wrapper").height() > $("#desktop-right2").height()) {
                    $("#write-wrapper").css('border-right', '1px solid #ebebeb');
                    $("#desktop-right2").css('border-left', 'initial');
                } else {
                    $("#write-wrapper").css('border-right', 'initial');
                    $("#desktop-right2").css('border-left', '1px solid #ebebeb');
                }
            }
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                $('.realtime-topic-agendas-none').css('display', 'block');
            }
        }
    };
    var f_cb = function () {
        $('.realtime-topic-agendas-none').css('display', 'block');
    };
    methods["the_world"]["is_one"]({
        show_animation: false,
        data:{
            list_type: encodeURIComponent("agenda")
            , agenda_menu: encodeURIComponent("all")
            , type: encodeURIComponent("main_tag")
            , is_limited: encodeURIComponent("true")
            , main_tag: encodeURIComponent(main_tag)
        },
        pathname:"/get/list",
        s_cb:s_cb,
        f_cb:f_cb
    });
};
var init_realtime_tag_opinions_list = function () {
    var main_tag = $("body").attr("data-main-tag");
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var str = i18n[lang].realtime + " " + i18n[lang][main_tag] + " " + i18n[lang].opinion;
    str = "연관 의견";
    $('.realtime-topic-opinions-title').empty().append(str);
    $('.realtime-topic-opinions-list').css('display', 'none').empty();
    $('.realtime-topic-opinions-none').css('display', 'none');
    var s_cb = function (result) {
        if ( result['response'] === true ) {
            var final_list = get["list"](result['docs'], "opinion", "normal");
            $('.realtime-topic-opinions-list').append(final_list);
            $('.realtime-topic-opinions-list').css('display', 'block');
            flex["article_item"]();
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                $('.realtime-topic-opinions-none').css('display', 'block');
            }
        }
    };
    var f_cb = function () {
        $('.realtime-topic-opinions-none').css('display', 'block');
    };
    methods["the_world"]["is_one"]({
        show_animation: false,
        data:{
            list_type: encodeURIComponent("opinion")
            , type: encodeURIComponent("main_tag")
            , is_limited: encodeURIComponent("true")
            , main_tag: encodeURIComponent(main_tag)
        },
        pathname:"/get/list",
        s_cb:s_cb,
        f_cb:f_cb
    });
};
var limit = {};
limit.announcements = 20;
limit.apply_now_announcements = 100;
limit.articles = 50;
limit.best_agendas = 10;
limit.best_opinions = 10;
limit.comments = 20;
limit.friends = 30;
limit.guestbook = 30;
limit.images = 30;
limit.invitations = 30;
limit.messages = 30;
limit.news = 30;
limit.notifications = 30;
limit.online_interview_answers = 100;
limit.opinions_of_agendas = 100;
limit.realtime_main_tag_articles = 10;
limit.realtime_employment = 10;
limit.realtime_comments = 10;
limit.search_all = 5;
limit.search_debate = 10;
limit.search_employment = 10;
limit.search_image = 50;
limit.search_news = 10;
limit.search_blog = 10;
limit.search_user = 10;
limit.search_website = 10;
limit.today_visitors = 50;
limit.translations_of_articles = 100;
limit.user_gallery = 30;
limit.users = 30;
var get_language_text = function (lang) {
    if (lang === "en") {
        return "english";
    } else if (lang === "ja") {
        return "japanese";
    } else if (lang === "ko") {
        return "korean";
    } else if (lang === "zh-Hans") {
        return "simplified_chinese";
    } else {
        return "english";
    }
};
var get_user_translation_languages = function (doc) {
    var lang = $("body").attr("data-lang")
        , lang_list = ["en", "ja", "ko", "zh-Hans"]
        , data = {}
        , span
        , temp
        , final = ""
        , comma;
    if (
        lang === "en" ||
        lang === "ko"
    ) {
        comma = ", ";
    } else {
        comma = "、";
    }
    for (var i = 0; i < lang_list.length; i++) {
        for (var j = 0; j < lang_list.length; j++) {
            if (lang_list[i] === lang_list[j]) {
                continue;
            } else {
                temp = lang_list[i] + "_" + lang_list[j];
                if (doc[temp] && doc[temp] > 0) {
                    is_empty = false;
                    span = "";
                    if (final !== "") {
                        span = comma;
                    }
                    span = "<span class='type-label'>" + span + i18n[lang][get_language_text(lang_list[i])] + " &#8594; " + i18n[lang][get_language_text(lang_list[j])] + " (" +  doc[temp] + ")" + "</span>";
                    final = final + span;
                }
            }
        }
    }
    return final;
};
var aws_s3_url =  "https://images.gleant.com";
var remove = {};
remove.type = null;
remove.element = null;
var get_gallery_items = function (updated_at, cb) {
    var s_cb = function (result) {
        if (result["response"] === true) {
            return cb(result["docs"]);
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                return cb([]);
            }
        }
    };
    var f_cb = function () {
        return cb([]);
    };
    if (updated_at === null) {
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:{},
            pathname:"/get/gallery-images",
            s_cb:s_cb,
            f_cb:f_cb
        });
    } else {
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:{updated_at: encodeURIComponent(updated_at)},
            pathname:"/get/gallery-images",
            s_cb:s_cb,
            f_cb:f_cb
        });
    }
};
var realtime_datetime = function () {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    $('.created-at').each(function () {
        var datetime = $(this).attr('data-datetime');
        if (datetime !== undefined) {
            datetime = parseInt(datetime);
            if ($(this).hasClass('without-text') === true) {
                $(this).text(to_i18n_datetime(new Date(datetime)));
            } else {
                $(this).text(i18n[lang].written + " " + to_i18n_datetime(new Date(datetime)));
            }
        }
    });
    $('.created-at-small').each(function () {
        var datetime = $(this).attr('data-datetime');
        if (datetime !== undefined) {
            datetime = parseInt(datetime);
            if ($(this).hasClass('without-text') === true) {
                $(this).text(to_i18n_short_datetime(new Date(datetime)));
            } else {
                $(this).text(i18n[lang].written + " " + to_i18n_short_datetime(new Date(datetime)));
            }

        }
    });
    $('.updated-at').each(function () {
        var datetime = $(this).attr('data-datetime');
        if (datetime !== undefined) {
            datetime = parseInt(datetime);
            if ($(this).hasClass('without-text') === true) {
                $(this).text(to_i18n_datetime(new Date(datetime)));
            } else {
                $(this).text(i18n[lang].edit + " " + to_i18n_datetime(new Date(datetime)));
            }
        }
    });
    $('.updated-at-small').each(function () {
        var datetime = $(this).attr('data-datetime');
        if (datetime !== undefined) {
            datetime = parseInt(datetime);
            if ($(this).hasClass('without-text') === true) {
                $(this).text(to_i18n_short_datetime(new Date(datetime)));
            } else {
                $(this).text(i18n[lang].edit + " " + to_i18n_short_datetime(new Date(datetime)));
            }
        }
    });
    $('.debate-status').each(function () {
        var is_start_set = $(this).attr('data-is-start-set')
            , start_at = parseInt($(this).attr('data-start-at'))
            , is_finish_set = $(this).attr('data-is-finish-set')
            , finish_at = parseInt($(this).attr('data-finish-at'))
            , class_debate_status = "debate-unlimited"
            , debate_status = i18n[lang].unlimited
            , datetime = new Date().valueOf()
            , diff
            , left_time = ""
            , space
            , print_type = $(this).attr('data-print-type');
        if (print_type === "normal") {
            space = "<br>";
        } else {
            space = "&nbsp;";
        }
        is_start_set = is_start_set === "true";
        is_finish_set = is_finish_set === "true";
        if (is_start_set === true) {
            if (start_at > datetime) {
                class_debate_status = "debate-scheduled";
                debate_status = i18n[lang].scheduled;
                diff = Math.floor((new Date(start_at).valueOf() - datetime) / 1000);
                debate_status = debate_status + space + "<span class='debate-status-message'>" + get_i18n_text_ago_or_left({type: "left", diff: diff}) + "</span>";
            } else {
                if (is_finish_set === true) {
                    if (finish_at > datetime) {
                        class_debate_status = "debate-in-progress";
                        debate_status = i18n[lang].in_progress;
                        diff = Math.floor((new Date(finish_at).valueOf() - datetime) / 1000);
                        debate_status = debate_status + space + "<span class='debate-status-message'>" + get_i18n_text_ago_or_left({type: "left", diff: diff}) + "</span>";
                    } else {
                        class_debate_status = "debate-finished";
                        debate_status = i18n[lang].finished + space + "<span class='debate-status-message'>" + to_i18n_fixed_datetime(new Date(finish_at)) + "</span>";
                    }
                } else {
                    class_debate_status = "debate-unlimited";
                    debate_status = i18n[lang].unlimited;
                }
            }
        } else {
            if (is_finish_set === true) {
                if (finish_at > datetime) {
                    class_debate_status = "debate-in-progress";
                    debate_status = i18n[lang].in_progress;
                    diff = Math.floor((new Date(finish_at).valueOf() - datetime) / 1000);
                    debate_status = debate_status + space + "<span class='debate-status-message'>" + get_i18n_text_ago_or_left({type: "left", diff: diff}) + "</span>";
                } else {
                    class_debate_status = "debate-finished";
                    debate_status = i18n[lang].finished + space + "<span class='debate-status-message'>" + to_i18n_fixed_datetime(new Date(finish_at)) + "</span>";
                }
            } else {
                class_debate_status = "debate-unlimited";
                debate_status = i18n[lang].unlimited;
            }
        }
        $(this).removeClass('debate-in-progress').removeClass('debate-scheduled').removeClass('debate-finished').removeClass('debate-unlimited').addClass(class_debate_status).empty().append(debate_status);
    });
    $('.online-interview-status').each(function () {
        var is_start_set = $(this).attr('data-is-start-set')
            , start_at = parseInt($(this).attr('data-start-at'))
            , is_finish_set = $(this).attr('data-is-finish-set')
            , finish_at = parseInt($(this).attr('data-finish-at'))
            , class_online_interview_status = "online-interview-unlimited"
            , online_interview_status = i18n[lang].unlimited
            , datetime = new Date().valueOf()
            , diff
            , left_time = ""
            , space
            , print_type = $(this).attr('data-print-type')
            , $apply_online_interview_wrapper;
        if (print_type === "normal") {
            space = "<br>";
        } else {
            space = "&nbsp;";
            $apply_online_interview_wrapper = $(this).parent().find(".apply-online-interview-wrapper:first");
        }
        is_start_set = is_start_set === "true";
        is_finish_set = is_finish_set === "true";
        if (is_start_set === true) {
            if (start_at > datetime) {
                class_online_interview_status = "online-interview-scheduled";
                online_interview_status = i18n[lang].online_interview + " " + i18n[lang].scheduled;
                diff = Math.floor((new Date(start_at).valueOf() - datetime) / 1000);
                online_interview_status = online_interview_status + space + "<span class='online-interview-status-message'>" + get_i18n_text_ago_or_left({type: "left", diff: diff}) + "</span>";
                if (print_type !== "normal") {
                    $apply_online_interview_wrapper.css("display", "none");
                }
            } else {
                if (is_finish_set === true) {
                    if (finish_at > datetime) {
                        class_online_interview_status = "online-interview-in-progress";
                        online_interview_status = i18n[lang].online_interview + " " + i18n[lang].in_progress;
                        diff = Math.floor((new Date(finish_at).valueOf() - datetime) / 1000);
                        online_interview_status = online_interview_status + space + "<span class='online-interview-status-message'>" + get_i18n_text_ago_or_left({type: "left", diff: diff}) + "</span>";
                        if (print_type !== "normal") {
                            $apply_online_interview_wrapper.css("display", "block");
                        }
                    } else {
                        class_online_interview_status = "online-interview-finished";
                        online_interview_status = i18n[lang].online_interview + " " + i18n[lang].finished + space + "<span class='online-interview-status-message'>" + to_i18n_fixed_datetime(new Date(finish_at)) + "</span>";
                        if (print_type !== "normal") {
                            $apply_online_interview_wrapper.css("display", "none");
                        }
                    }
                } else {
                    class_online_interview_status = "online-interview-unlimited";
                    online_interview_status = i18n[lang].online_interview + " " + i18n[lang].unlimited;
                    if (print_type !== "normal") {
                        $apply_online_interview_wrapper.css("display", "block");
                    }
                }
            }
        } else {
            if (is_finish_set === true) {
                if (finish_at > datetime) {
                    class_online_interview_status = "online-interview-in-progress";
                    online_interview_status = i18n[lang].online_interview + " " + i18n[lang].in_progress;
                    diff = Math.floor((new Date(finish_at).valueOf() - datetime) / 1000);
                    online_interview_status = online_interview_status + space + "<span class='online-interview-status-message'>" + get_i18n_text_ago_or_left({type: "left", diff: diff}) + "</span>";
                    if (print_type !== "normal") {
                        $apply_online_interview_wrapper.css("display", "block");
                    }
                } else {
                    class_online_interview_status = "online-interview-finished";
                    online_interview_status = i18n[lang].online_interview + " " + i18n[lang].finished + space + "<span class='online-interview-status-message'>" + to_i18n_fixed_datetime(new Date(finish_at)) + "</span>";
                    if (print_type !== "normal") {
                        $apply_online_interview_wrapper.css("display", "none");
                    }
                }
            } else {
                class_online_interview_status = "online-interview-unlimited";
                online_interview_status = i18n[lang].online_interview + " " + i18n[lang].unlimited;
                if (print_type !== "normal") {
                    $apply_online_interview_wrapper.css("display", "block");
                }
            }
        }
        $(this).removeClass('online-interview-in-progress').removeClass('online-interview-scheduled').removeClass('online-interview-finished').removeClass('online-interview-unlimited').addClass(class_online_interview_status).empty().append(online_interview_status);
    });
    setTimeout(function () {
        realtime_datetime();
    }, 1000);
};
var init_the_first_pathname = function () {
    the_first_pathname = "";
};
$(document).ready(function () {
    $("body").on("click", ".scrollto", function (e) {
        e.preventDefault();
        var target = $(e.currentTarget).attr("href");
        if ($('.prompt#apply-now-prompt').css('display') === 'table') {
            $('.prompt#apply-now-prompt .prompt-left > div').scrollTop( $('.prompt#apply-now-prompt .prompt-left > div').scrollTop() +  $(target).offset().top);
        } else if ($('.prompt#hire-me-prompt').css('display') === 'table') {
            $('.prompt#hire-me-prompt .prompt-left > div').scrollTop( $('.prompt#hire-me-prompt .prompt-left > div').scrollTop() +  $(target).offset().top);
        } else if ($('.prompt#opinion-prompt').css('display') === 'table') {
            $('.prompt#opinion-prompt .prompt-left > div').scrollTop( $('.prompt#opinion-prompt .prompt-left > div').scrollTop() +  $(target).offset().top);
        } else if ($('.prompt#agenda-prompt').css('display') === 'table') {
            $('.prompt#agenda-prompt .prompt-left > div').scrollTop( $('.prompt#agenda-prompt .prompt-left > div').scrollTop() +  $(target).offset().top);
        } else if ($('.prompt#translation-prompt').css('display') === 'table') {
            $('.prompt#translation-prompt .prompt-left > div').scrollTop( $('.prompt#translation-prompt .prompt-left > div').scrollTop() +  $(target).offset().top);
        } else {
            $('.body-inner-main').scrollTop($('.body-inner-main').scrollTop() + ($(target).offset().top - 50));
        }
        return false;
    });
    realtime_datetime();
    init_the_first_pathname();
    if (is_mobile() === true && $(".btn-kakaotalk-share").length > 0) {
        $(".btn-kakaotalk-share").css("display", "block");
    }
    if ($("#news-wrapper").length > 0 && $("#desktop-right").length > 0) {
        if ($("#news-wrapper").height() > $("#desktop-right").height()) {
            $("#news-wrapper").css('border-right', '1px solid #ebebeb');
            $("#desktop-right").css('border-left', 'initial');
        } else {
            $("#news-wrapper").css('border-right', 'initial');
            $("#desktop-right").css('border-left', '1px solid #ebebeb');
        }
    }
    if ($("#written-wrapper").length > 0 && $("#desktop-right").length > 0) {
        if ($("#written-wrapper").height() > $("#desktop-right").height()) {
            $("#written-wrapper").css('border-right', '1px solid #ebebeb');
            $("#desktop-right").css('border-left', 'initial');
        } else {
            $("#written-wrapper").css('border-right', 'initial');
            $("#desktop-right").css('border-left', '1px solid #ebebeb');
        }
    }
    if ($("#written-wrapper").length > 0 && $("#desktop-right2").length > 0) {
        if ($("#written-wrapper").height() > $("#desktop-right2").height()) {
            $("#written-wrapper").css('border-right', '1px solid #ebebeb');
            $("#desktop-right2").css('border-left', 'initial');
        } else {
            $("#written-wrapper").css('border-right', 'initial');
            $("#desktop-right2").css('border-left', '1px solid #ebebeb');
        }
    }
    if ($("#write-wrapper").length > 0 && $("#desktop-right2").length > 0) {
        if ($("#write-wrapper").height() > $("#desktop-right2").height()) {
            $("#write-wrapper").css('border-right', '1px solid #ebebeb');
            $("#desktop-right2").css('border-left', 'initial');
        } else {
            $("#write-wrapper").css('border-right', 'initial');
            $("#desktop-right2").css('border-left', '1px solid #ebebeb');
        }
    }
    $(document).on("change", "select.select-lang", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var new_lang = $(e.currentTarget).find('option:selected').val();
        var s_cb = function (result) {
            if (result.response === true) {
                window.location.reload();
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_login);
                }
            }
        };
        var f_cb = function () {show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_login);};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:{lang:new_lang},
            pathname:"/change/language",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".preparing-service", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        alert(i18n[lang].preparing_service);
        // if (lang === "ko") {
        //     window.location = $(e.currentTarget).attr("href");
        // } else {
        //     alert(i18n[lang].preparing_service);
        // }
        return false;
    });
    $(document).on("click", ".news-article, .news-title", function (e) {
        e.preventDefault();
        var link = $(e.currentTarget).attr("href")
            , data = {}
            , s_cb
            , f_cb;
        s_cb = function (result) {
            window.location = link;
        };
        f_cb = function () {
            window.location = link;
        };
        data.link = encodeURIComponent(link);
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:'/set/news',
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".news-comments-counts", function (e) {
        e.preventDefault();
        var _id = $(e.currentTarget).attr("data-id")
            , data = {}
            , s_cb
            , f_cb;
        s_cb = function (result) {
            if (result.response === true) {
                $(".prompt#news-comments-prompt .prompt-main").empty().append(get["single_perfect_news_with_comments"](result.doc, result.comments));
                is_news_comments_prompt_opened = true;
                modal(".prompt#news-comments-prompt", "open");
            }
        };
        f_cb = function () {};
        data._id = encodeURIComponent(_id);
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:'/get/single-news-with-comments',
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".prompt#news-comments-prompt .close", function (e) {
        e.preventDefault();
        is_news_comments_prompt_opened = false;
        modal(".prompt#news-comments-prompt", "close");
        return false;
    });
    if ( $(".prompt#news-comments-prompt").length > 0 ) {
        if ($(".prompt#news-comments-prompt .news-title").length > 0) {
            is_news_comments_prompt_opened = true;
            modal(".prompt#news-comments-prompt", "open");
        }
    }

    setTimeout(function () {
        $("img").each(function (index) {
            var src = $(this).attr("src");
            if (src.startsWith() == true) {

            }
        });
    }, 1000);

});