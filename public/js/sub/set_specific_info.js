$(document).ready(function() {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var init_set_specific_info_form = function () {
        var $birth_year = $('#birth-year')
            , $birth_month = $('#birth-month')
            , $birth_day = $('#birth-day');
        for (var i = ((new Date()).getFullYear() - 7); i >= 1900; i--) {
            if (i === 1980) {
                $birth_year.append("<option selected='selected' value='" + i + "'>" + get_i18n_time_text({lang: lang, type: "year", number: i}) + "</option>");
            } else {
                $birth_year.append("<option value='" + i + "'>" + get_i18n_time_text({lang: lang, type: "year", number: i}) + "</option>");
            }
        }
        for (var i = 0; i < 12; i++) {
            if (i === 0) {
                $birth_month.append("<option selected='selected' value='" + i + "'>" + get_i18n_time_text({lang: lang, type: "month", number: i}) + "</option>");
            } else {
                $birth_month.append("<option value='" + i + "'>" + get_i18n_time_text({lang: lang, type: "month", number: i}) + "</option>");
            }
        }
        for (var i = 1; i <= 31; i++) {
            if (i === 1) {
                $birth_day.append("<option selected='selected' value='" + i + "'>" + get_i18n_time_text({lang: lang, type: "date", number: i}) + "</option>");
            } else {
                $birth_day.append("<option value='" + i + "'>" + get_i18n_time_text({lang: lang, type: "date", number: i}) + "</option>");
            }
        }
    };
    init_set_specific_info_form();
    var set_specific_info_submit = function (e, type) {
        e.preventDefault();
        var name
            , birth_year
            , birth_month
            , birth_day
            , $sex
            , is_logged_in_users_selected = false
            , is_not_logged_in_users_selected = false
            , public_authority = 0
            , encoded_name
            , sex
            , main_language
            , available_languages = []
            , current_password
            , new_password1
            , new_password2
            , temp
            , temp2
            , data = {}
            , s_cb
            , f_cb;
        data.type = encodeURIComponent(type);
        if (type === "name") {
            name = $(".set-specific-info-form #name").val();
            if (name === "") {
                return show_bert("danger", 2000, i18n[lang].please_enter_real_name);
            }
            encoded_name = get_encoded_html_preventing_xss(name).replace(/\&nbsp;/g, ' ');
            if (encoded_name !== name) {
                return show_bert("danger", 2000, i18n[lang].wrong_real_name_format);
            }
            data.name = encodeURIComponent(name);
        } else if (type === "birth") {
            birth_year = parseInt($(".set-specific-info-form #birth-year").val());
            birth_month = parseInt($(".set-specific-info-form #birth-month").val()) + 1;
            birth_day = parseInt($(".set-specific-info-form #birth-day").val());
            data.birth_year = encodeURIComponent(birth_year);
            data.birth_month = encodeURIComponent(birth_month);
            data.birth_day = encodeURIComponent(birth_day);
        } else if (type === "gender") {
            $sex = $(".set-specific-info-form .sex.selected");
            if ( $sex.length === 0 ) {
                return show_bert("danger", 2000, i18n[lang].please_enter_gender);
            }
            sex = $sex.attr('id');
            data.sex = encodeURIComponent(sex);
        } else if (type === "languages") {
            return false;
            if ($('.set-specific-info-form #main-language-list li.selected').length !== 1) {
                return show_bert("danger", 2000, i18n[lang].please_select_main_language);
            }
            main_language = $(".set-specific-info-form #main-language-list li.selected").attr("data-lang");
            $(".set-specific-info-form #available-language-list li.selected").each(function (i, e) {
                available_languages.push($(e).attr('data-lang'));
            });
            data.main_language = encodeURIComponent(main_language);
            data.available_languages = encodeURIComponent(JSON.stringify(available_languages));
        } else if (type === "search_engine") {
            is_logged_in_users_selected = $(".set-specific-info-form #logged-in-users").hasClass('selected');
            is_not_logged_in_users_selected = $(".set-specific-info-form #not-logged-in-users").hasClass('selected');
            if (is_logged_in_users_selected === true) {
                public_authority = 2;
                if (is_not_logged_in_users_selected === true) {
                    public_authority = 1;
                }
            } else {
                public_authority = 0;
            }
            data.public_authority = encodeURIComponent(public_authority);
        } else if (type === "reset_password") {
            current_password = $("#current-password").val();
            new_password1 = $("#reset-password1").val();
            new_password2 = $("#reset-password2").val();
            if ((current_password === "") || (new_password1 === "") || (new_password2 === "")) {
                return show_bert("danger", 2000, i18n[lang].please_enter_password);
            }
            if (new_password1 !== new_password2) {
                return show_bert("danger", 2000, i18n[lang].entered_passwords_are_different);
            }
            if (is_password_format_valid(new_password1) !== true) {
                return show_bert("danger", 2000, is_password_format_valid(new_password1));
            }
            data.current_password = encodeURIComponent(current_password);
            data.new_password = encodeURIComponent(new_password1);
        } else if (type === "withdrawal") {} else {
            return false;
        }

        s_cb = function (result) {
            if ( result['response'] === true ) {
                if (type === "name") {
                    show_bert("success", 2000, i18n[lang].successfully_changed);
                    $("#name-content").text(name);
                    $("#menu-user-name-desktop").text(name);
                    $("#menu-user-name-mobile").text(name);
                    $("#set-name-item .btn-set-specific-info-item").css("display", "block");
                    $("#set-name-item .set-specific-info-form").attr("data-name", name).css("display", "none");
                } else if (type === "birth") {
                    show_bert("success", 2000, i18n[lang].successfully_changed);
                    $("#user-birthdate").text(get_i18n_year_month_date({ lang: lang, year: birth_year, month: (birth_month - 1), date: birth_day }));
                    $("#set-birth-item .btn-set-specific-info-item").css("display", "block");
                    $("#set-birth-item .set-specific-info-form").attr("data-birth-year", birth_year).attr("data-birth-month", birth_month).attr("data-birth-day", birth_day).css("display", "none");
                } else if (type === "gender") {
                    show_bert("success", 2000, i18n[lang].successfully_changed);
                    temp = "(" + i18n[lang][sex] + ")";
                    $("#user-sex").text(temp);
                    $("#set-gender-item .btn-set-specific-info-item").css("display", "block");
                    $("#set-gender-item .set-specific-info-form").attr("data-sex", sex).css("display", "none");
                } else if (type === "languages") {
                    show_bert("success", 2000, i18n[lang].successfully_changed);
                    temp = i18n[lang][get_language_text(main_language)];
                    temp2 = "";
                    if (available_languages.length > 0) {
                        for (var i = 0; i < available_languages.length; i++) {
                            if (i === 0) {
                                temp2 = available_languages[i];
                            } else {
                                temp2 = temp2 + "," + available_languages[i];
                            }
                            if (
                                lang === "en" ||
                                lang === "ko"
                            ) {
                                temp = temp + ", " + i18n[lang][get_language_text(available_languages[i])];
                            } else {
                                temp = temp + "、" + i18n[lang][get_language_text(available_languages[i])];
                            }
                        }
                    }
                    $("#user-languages").text(temp);
                    $("#set-languages-item .btn-set-specific-info-item").css("display", "block");
                    $("#set-languages-item .set-specific-info-form").attr("data-main-language", main_language).attr("data-available-languages", temp2).css("display", "none");
                } else if (type === "search_engine") {
                    show_bert("success", 2000, i18n[lang].successfully_changed);
                    $("#set-search-engine-item .btn-set-specific-info-item").css("display", "block");
                    $("#set-search-engine-item .set-specific-info-form").attr("data-public-authority", public_authority).css("display", "none");
                } else if (type === "reset_password") {
                    show_bert("success", 2000, i18n[lang].successfully_changed);
                    $("#set-reset-password-item .btn-set-specific-info-item").css("display", "block");
                    $("#set-reset-password-item .set-specific-info-form").css("display", "none");
                } else if (type === "withdrawal") {
                    return window.location = "/";
                } else {
                    return false;
                }
            } else {
                if (result['reason'] === "wrong_current_password") {
                    return show_bert("danger", 3000, i18n[lang].it_is_different_from_the_current_password);
                } else if (result['reason'] === "wrong_password_format") {
                    return show_bert("danger", 3000, i18n[lang].wrong_password_format);
                } else if (result['reason'] === "error_redirect") {
                    window.location = "/error/404";
                } else if (result['reason'] === "server_error") {
                    return show_bert("danger", 3000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        f_cb = function () {show_bert("danger", 3000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation:true,
            data:data,
            pathname:"/set/specific-info",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    $(document).on('click', '.set-specific-info', function (e) {
        e.preventDefault();
        if ($('#desktop-user-menu').css('display') !== 'none') {
            $('#desktop-user-menu').css('display', 'none');
        }
        if ($('#service-list').css('display') !== 'none') {
            $('#service-list').css('display', 'none');
        }
        var type
            , temp
            , year
            , month
            , day
            , days_of_month
            , $birth_day;
        $.each($('.prompt#set-specific-info-prompt .set-specific-info-form'), function (i, e) {
            type = $(this).attr("data-type");
            if (type === "name") {
                $(this).find("input[type=text]").val($(this).attr("data-name"));
            } else if (type === "birth") {
                year = parseInt($(this).attr("data-birth-year"));
                month = parseInt($(this).attr("data-birth-month")) - 1;
                day = parseInt($(this).attr("data-birth-day"));
                days_of_month = get_days_of_month(year, month);
                $birth_day = $(this).find("#birth-day");
                $birth_day.empty();
                if (days_of_month[days_of_month.length - 1] < day) {
                    day = days_of_month[days_of_month.length - 1];
                }
                for (var i = 0; i < days_of_month.length; i++) {
                    if (days_of_month[i] === day) {
                        $birth_day.append("<option selected='selected' value='" + days_of_month[i] + "'>" + get_i18n_time_text({lang: lang, type: "date", number: days_of_month[i]})  + "</option>");
                    } else {
                        $birth_day.append("<option value='" + days_of_month[i] + "'>" + get_i18n_time_text({lang: lang, type: "date", number: days_of_month[i]})+ "</option>");
                    }
                }
                $(this).find("#birth-year").val(year);
                $(this).find("#birth-month").val(month);
                $(this).find("#birth-day").val(day);
            } else if (type === "gender") {
                if ( $(this).attr("data-sex") === "male" ) {
                    $(this).find("#male").addClass("selected");
                    $(this).find("#female").removeClass("selected");
                } else {
                    $(this).find("#male").removeClass("selected");
                    $(this).find("#female").addClass("selected");
                }
            } else if (type === "languages") {
                $(this).find("#main-language-list li").removeClass("selected");
                $(this).find("#available-language-list li").removeClass("selected");
                $(this).find("#available-language-list li").removeClass("disabled");
                $(this).find("#main-language-list li#main-" + $(this).attr("data-main-language")).addClass("selected");
                $(this).find("#available-language-list li#available-" + $(this).attr("data-main-language")).addClass("disabled");
                temp = $(this).attr("data-available-languages");
                if (temp !== "") {
                    temp = temp.split(",");
                    for (var i = 0; i < temp.length; i++) {
                        $(this).find("#available-language-list li#available-" + temp[i]).addClass("selected");
                    }
                }
            } else if (type === "search_engine") {
                temp = parseInt($(this).attr("data-public-authority"));
                $(this).find(".search-engine-profile-public-setting").removeClass("selected");
                if (temp === 0) {
                } else if (temp === 1) {
                    $(this).find(".search-engine-profile-public-setting").addClass("selected");
                } else if (temp === 2) {
                    $(this).find("#logged-in-users").addClass("selected");
                }
            }
        });
        $(".prompt#set-specific-info-prompt .btn-set-specific-info-item").css("display", "block");
        $(".prompt#set-specific-info-prompt .set-specific-info-form").css("display", "none");
        $("#current-password").val("");
        $("#reset-password1").val("");
        $("#reset-password2").val("");
        $("#password-alphabet-checker").removeClass("format-checker-green").addClass("format-checker-red");
        $("#password-number-checker").removeClass("format-checker-green").addClass("format-checker-red");
        $("#password-special-checker").removeClass("format-checker-green").addClass("format-checker-red");
        $("#password-length-checker").removeClass("format-checker-green").addClass("format-checker-red");
        modal('.prompt#set-specific-info-prompt', 'open');
        return false;
    });
    $(document).on('click', '.prompt#set-specific-info-prompt .close', function (e) {
        e.preventDefault();
        modal('.prompt#set-specific-info-prompt', 'close');
        return false;
    });
    $(document).on("submit", ".set-specific-info-form", function (e) {
        set_specific_info_submit(e, $(e.currentTarget).attr("data-type"));
        return false;
    });
    $(document).on("click", ".set-specific-info-form .set-specific-info-submit", function (e) {
        set_specific_info_submit(e, $(e.currentTarget).attr("data-type"));
        return false;
    });
    $(document).on("click", ".set-specific-info-form .sex", function (e) {
        var id = $(e.currentTarget).attr('id');
        $('.sex').removeClass('selected');
        $(e.currentTarget).addClass('selected');
    });
    $(document).on("click", ".set-specific-info-form .search-engine-profile-public-setting", function (e) {
        var id = $(e.currentTarget).attr('id');
        if ( $(e.currentTarget).hasClass('selected') === true ) {
            if (id === "logged-in-users") {
                $('.search-engine-profile-public-setting').removeClass('selected');
            } else {
                $(e.currentTarget).removeClass('selected');
            }
        } else {
            $('.search-engine-profile-public-setting').removeClass('selected');
            if (id === "not-logged-in-users") {
                $('.search-engine-profile-public-setting').addClass('selected');
            } else {
                $(e.currentTarget).addClass('selected');
            }
        }
    });
    $(document).on("change", ".set-specific-info-form select", function (e) {
        if (
            $(e.currentTarget).attr('id') === 'birth-year' ||
            $(e.currentTarget).attr('id') === 'birth-month'
        ) {
            var year = parseInt($('select#birth-year option:selected').val());
            var month = parseInt($('select#birth-month option:selected').val());
            var day = parseInt($('select#birth-day option:selected').val());
            var days_of_month = get_days_of_month(year, month);
            var $birth_day = $('#birth-day');
            $birth_day.empty();
            if (days_of_month[days_of_month.length - 1] < day) {
                day = days_of_month[days_of_month.length - 1];
            }
            for (var i = 0; i < days_of_month.length; i++) {
                if (days_of_month[i] === day) {
                    $birth_day.append("<option selected='selected' value='" + days_of_month[i] + "'>" + get_i18n_time_text({lang: lang, type: "date", number: days_of_month[i]})  + "</option>");
                } else {
                    $birth_day.append("<option value='" + days_of_month[i] + "'>" + get_i18n_time_text({lang: lang, type: "date", number: days_of_month[i]})+ "</option>");
                }
            }
        }
    });
    $(document).on("click", "#main-language-list li", function (e) {
        e.preventDefault();
        var $current_target = $(e.currentTarget);
        var lang = $current_target.attr("data-lang");
        $("#main-language-list li").removeClass('selected');
        $current_target.addClass('selected');
        $("#available-language-list li").removeClass('disabled');
        var $available_lang = $("#available-" + lang);
        $available_lang.removeClass('selected').addClass('disabled');
        return false;
    });
    $(document).on("click", "#available-language-list li", function (e) {
        e.preventDefault();
        var $current_target = $(e.currentTarget);
        var lang = $current_target.attr("data-lang");
        if ( $current_target.hasClass('disabled') === true ) {
            return false;
        }
        if ( $current_target.hasClass('selected') === true ) {
            $current_target.removeClass('selected');
        } else {
            $current_target.addClass('selected');
        }
        return false;
    });
    $(document).on("keyup", '#reset-password1', function(e){
        var password = $("#reset-password1").val();
        if (password.search(/[a-zA-Z]/) === -1) {
            $('#password-alphabet-checker').removeClass("format-checker-green").addClass("format-checker-red");
        } else {
            $('#password-alphabet-checker').removeClass("format-checker-red").addClass("format-checker-green");
        }
        if (password.search(/\d/) === -1) {
            $('#password-number-checker').removeClass("format-checker-green").addClass("format-checker-red");
        } else {
            $('#password-number-checker').removeClass("format-checker-red").addClass("format-checker-green");
        }
        if (password.search(/[\!\@\#\$\%\^\&\*\(\)\_\+\.\,\;\:]/) === -1) {
            $('#password-special-checker').removeClass("format-checker-green").addClass("format-checker-red");
        } else {
            $('#password-special-checker').removeClass("format-checker-red").addClass("format-checker-green");
        }
        if (password.length < 8) {
            $('#password-length-checker').removeClass("format-checker-green").addClass("format-checker-red");
        } else {
            $('#password-length-checker').removeClass("format-checker-red").addClass("format-checker-green");
        }
    });
    $(document).on("click", ".btn-set-specific-info-item", function (e) {
        e.preventDefault();
        $(e.currentTarget).css("display", "none");
        var $set_specific_info_form = $(e.currentTarget).parent().find(".set-specific-info-form:first")
            , type = $set_specific_info_form.attr("data-type")
            , temp
            , year
            , month
            , day
            , days_of_month
            , $birth_day;
        if (type === "name") {
            $set_specific_info_form.find("input[type=text]").val($set_specific_info_form.attr("data-name"));
        } else if (type === "birth") {
            year = parseInt($set_specific_info_form.attr("data-birth-year"));
            month = parseInt($set_specific_info_form.attr("data-birth-month")) - 1;
            day = parseInt($set_specific_info_form.attr("data-birth-day"));
            days_of_month = get_days_of_month(year, month);
            $birth_day = $set_specific_info_form.find("#birth-day");
            $birth_day.empty();
            if (days_of_month[days_of_month.length - 1] < day) {
                day = days_of_month[days_of_month.length - 1];
            }
            for (var i = 0; i < days_of_month.length; i++) {
                if (days_of_month[i] === day) {
                    $birth_day.append("<option selected='selected' value='" + days_of_month[i] + "'>" + get_i18n_time_text({lang: lang, type: "date", number: days_of_month[i]})  + "</option>");
                } else {
                    $birth_day.append("<option value='" + days_of_month[i] + "'>" + get_i18n_time_text({lang: lang, type: "date", number: days_of_month[i]})+ "</option>");
                }
            }
            $set_specific_info_form.find("#birth-year").val(year);
            $set_specific_info_form.find("#birth-month").val(month);
            $set_specific_info_form.find("#birth-day").val(day);
        } else if (type === "gender") {
            if ( $set_specific_info_form.attr("data-sex") === "male" ) {
                $set_specific_info_form.find("#male").addClass("selected");
                $set_specific_info_form.find("#female").removeClass("selected");
            } else {
                $set_specific_info_form.find("#male").removeClass("selected");
                $set_specific_info_form.find("#female").addClass("selected");
            }
        } else if (type === "languages") {
            $set_specific_info_form.find("#main-language-list li").removeClass("selected");
            $set_specific_info_form.find("#available-language-list li").removeClass("selected");
            $set_specific_info_form.find("#available-language-list li").removeClass("disabled");
            $set_specific_info_form.find("#main-language-list li#main-" + $set_specific_info_form.attr("data-main-language")).addClass("selected");
            $set_specific_info_form.find("#available-language-list li#available-" + $set_specific_info_form.attr("data-main-language")).addClass("disabled");
            temp = $set_specific_info_form.attr("data-available-languages");
            if (temp !== "") {
                temp = temp.split(",");
                for (var i = 0; i < temp.length; i++) {
                    $set_specific_info_form.find("#available-language-list li#available-" + temp[i]).addClass("selected");
                }
            }
        } else if (type === "search_engine") {
            temp = parseInt($set_specific_info_form.attr("data-public-authority"));
            $set_specific_info_form.find(".search-engine-profile-public-setting").removeClass("selected");
            if (temp === 0) {
            } else if (temp === 1) {
                $set_specific_info_form.find(".search-engine-profile-public-setting").addClass("selected");
            } else if (temp === 2) {
                $set_specific_info_form.find("#logged-in-users").addClass("selected");
            }
        } else if (type === "reset_password") {
            $("#current-password").val("");
            $("#reset-password1").val("");
            $("#reset-password2").val("");
            $("#password-alphabet-checker").removeClass("format-checker-green").addClass("format-checker-red");
            $("#password-number-checker").removeClass("format-checker-green").addClass("format-checker-red");
            $("#password-special-checker").removeClass("format-checker-green").addClass("format-checker-red");
            $("#password-length-checker").removeClass("format-checker-green").addClass("format-checker-red");
        }
        $set_specific_info_form.css("display", "block");
        return false;
    });
    $(document).on("click", ".set-specific-info-cancel", function (e) {
        e.preventDefault();
        $(e.currentTarget).parent().parent().parent().find(".btn-set-specific-info-item:first").css("display", "block");
        $(e.currentTarget).parent().parent().parent().find(".set-specific-info-form:first").css("display", "none");
        return false;
    });

});