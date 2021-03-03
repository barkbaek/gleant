$(document).ready(function() {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (is_mobile() === false) {
        $("#name").focus();
    }
    var init_set_blog_id_form = function () {
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
    init_set_blog_id_form();
    var set_blog_id_submit = function (e) {
        e.preventDefault();
        var blog_id = $("#set-specific-info-form #blog-id").val()
            , name = $("#set-specific-info-form #name").val()
            , birth_year = parseInt($("#set-specific-info-form #birth-year").val())
            , birth_month = parseInt($("#set-specific-info-form #birth-month").val()) + 1
            , birth_day = parseInt($("#set-specific-info-form #birth-day").val())
            , $sex = $("#set-specific-info-form .sex.selected")
            , is_logged_in_users_selected = false
            , is_not_logged_in_users_selected = false
            , public_authority = 0
            , is_set_blog_id = true
            , encoded_name
            , sex
            , main_language
            , available_languages = [];
        if (name === "") {
            if ( $sex.length === 0 ) {
                if (blog_id === "") {
                    return show_bert("danger", 2000, i18n[lang].please_enter_real_name_gender_blog_id);
                } else {
                    return show_bert("danger", 2000, i18n[lang].please_enter_real_name_gender);
                }
            } else {
                if (blog_id === "") {
                    return show_bert("danger", 2000, i18n[lang].please_enter_real_name_blog_id);
                } else {
                    return show_bert("danger", 2000, i18n[lang].please_enter_real_name);
                }
            }
        } else {
            if ( $sex.length === 0 ) {
                if (blog_id === "") {
                    return show_bert("danger", 2000, i18n[lang].please_enter_gender_blog_id);
                } else {
                    return show_bert("danger", 2000, i18n[lang].please_enter_gender);
                }
            } else {
                if (blog_id === "") {
                    return show_bert("danger", 2000, i18n[lang].please_enter_blog_id);
                }
            }
        }
        encoded_name = get_encoded_html_preventing_xss(name).replace(/\&nbsp;/g, ' ');
        if (encoded_name !== name) {
            return show_bert("danger", 2000, i18n[lang].wrong_real_name_format);
        }
        if (is_blog_id_format_valid(blog_id) !== true) {
            return show_bert("danger", 2000, is_blog_id_format_valid(blog_id));
        }
        sex = $sex.attr('id');
        /*if ($('#set-specific-info-form #main-language-list li.selected').length !== 1) {
            return show_bert("danger", 2000, i18n[lang].please_select_main_language);
        }
        main_language = $("#set-specific-info-form #main-language-list li.selected").attr("data-lang");
        $("#set-specific-info-form #available-language-list li.selected").each(function (i, e) {
            available_languages.push($(e).attr('data-lang'));
        });*/
        main_language = "ko";
        available_languages = [];
        is_logged_in_users_selected = $("#set-specific-info-form #logged-in-users").hasClass('selected');
        is_not_logged_in_users_selected = $("#set-specific-info-form #not-logged-in-users").hasClass('selected');
        if (is_logged_in_users_selected === true) {
            public_authority = 2;
            if (is_not_logged_in_users_selected === true) {
                public_authority = 1;
            }
        } else {
            public_authority = 0;
        }
        var data = {};
        data.blog_id = encodeURIComponent(blog_id);
        data.name = encodeURIComponent(name);
        data.birth_year = encodeURIComponent(birth_year);
        data.birth_month = encodeURIComponent(birth_month);
        data.birth_day = encodeURIComponent(birth_day);
        data.sex = encodeURIComponent(sex);
        data.main_language = encodeURIComponent(main_language);
        data.available_languages = encodeURIComponent(JSON.stringify(available_languages));
        data.public_authority = encodeURIComponent(public_authority);
        var s_cb = function (result) {
            if ( result['response'] === true ) {
                return window.location = "/blog/" + blog_id;
            } else {
                if (result['reason'] === "id_exists") {
                    show_bert("danger", 4000, i18n[lang].blog_id_already_exists + " " + i18n[lang].please_select_another_id);
                } else if (result['reason'] === "error_redirect") {
                    window.location = "/error/404";
                } else if (result['reason'] === "server_error") {
                    show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        var f_cb = function () {show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation:true,
            data:data,
            pathname:"/set/blog-id",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    $(document).on("submit", "#set-specific-info-form", function (e) {
        set_blog_id_submit(e);
        return false;
    });
    $(document).on("click", "#set-specific-info-form #set-blog-id-submit", function (e) {
        set_blog_id_submit(e);
        return false;
    });
    $(document).on("click", "#set-specific-info-form .sex", function (e) {
        var id = $(e.currentTarget).attr('id');
        $('.sex').removeClass('selected');
        $(e.currentTarget).addClass('selected');
    });
    $(document).on("click", "#set-specific-info-form .search-engine-profile-public-setting", function (e) {
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
    $(document).on("change", "#set-specific-info-form select", function (e) {
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
    $(document).on("keyup", '#blog-id', function(e){
        var blog_id = $("#blog-id").val();
        if (/^[a-z][a-z0-9]*$/.test(blog_id) === false) {
            $('#blog-id-format-checker').removeClass("format-checker-green").addClass("format-checker-red");
        } else {
            $('#blog-id-format-checker').removeClass("format-checker-red").addClass("format-checker-green");
        }
        if (blog_id.length < 6 || blog_id.length > 14) {
            $('#blog-id-length-checker').removeClass("format-checker-green").addClass("format-checker-red");
        } else {
            $('#blog-id-length-checker').removeClass("format-checker-red").addClass("format-checker-green");
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
});