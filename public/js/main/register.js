$(document).ready(function() {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    $(document).on("click", ".register-step1-agreement", function (e) {
        e.preventDefault();
        var $current = $(e.currentTarget);
        var count_agreement_checked = $(".register-step1-agreement.selected").length;
        if ($current.hasClass("selected") === true) {
            $current.removeClass("selected");
            count_agreement_checked = count_agreement_checked - 1;
        } else {
            $current.addClass("selected");
            count_agreement_checked = count_agreement_checked + 1;
        }
        if (count_agreement_checked === 3) {
            $("#register-step1-submit").removeAttr("disabled");
        } else {
            $("#register-step1-submit").attr("disabled", "disabled");
        }
        return false;
    });
    $(document).on("click", "#register-step1-submit", function (e) {
        e.preventDefault();
        $("#register-step1").css("display", "none");
        $("#register-step1-submit").css("display", "none");
        $("#register-step2").css("display", "block");
        return false;
    });
    $(document).on("click", "#register-kakao", function (e) {
        e.preventDefault();
        kakao.go("register");
        return false;
    });
    $(document).on("click", "#register-facebook", function (e) {
        e.preventDefault();
        facebook.go("register");
        return false;
    });
    $(document).on("click", "#register-gleant", function (e) {
        e.preventDefault();
        $("#register-step2").css("display", "none");
        $("#register-gleant-form").css("display", "block");
        if (is_mobile() === false) {
            $("#register-email").focus();
        }
        return false;
    });
    var register_submit = function (e) {
        e.preventDefault();
        var email = $("#register-email").val();
        var password1 = $("#register-password1").val();
        var password2 = $("#register-password2").val();
        if ((email === "") || (password1 === "") || (password2 === "")) {
            return show_bert("danger", 2000, i18n[lang].please_enter_email_password);
        }
        if (is_email_valid(email) === false) {
            return show_bert("danger", 2000, i18n[lang].wrong_email_format);
        }
        var encoded_email = get_encoded_html_preventing_xss(email);
        if ( encoded_email !== email ) {
            return show_bert("danger", 2000, i18n[lang].wrong_email_format);
        }
        if (password1 !== password2) {
            return show_bert("danger", 2000, i18n[lang].entered_passwords_are_different);
        }
        if (is_password_format_valid(password1) !== true) {
            return show_bert("danger", 2000, is_password_format_valid(password1));
        }
        var s_cb = function (result) {
            if ( result['response'] === true ) {
                window.location = "/success/sent-register";
            } else {
                if (result.msg === "server_error") {
                    return show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                } else {
                    return show_bert("danger", 10000, i18n[lang].email_already_exists);
                }
            }
        };
        var f_cb = function () {show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{email:encodeURIComponent(email), password:encodeURIComponent(password1)},
            pathname:"/register",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    $(document).on("submit", "#register-gleant-form", function (e) {
        register_submit(e);
        return false;
    });
    $(document).on("click", "#register-gleant-form #register-submit", function (e) {
        register_submit(e);
        return false;
    });
    $(document).on("keyup", '#register-password1', function(e){
        var password = $("#register-password1").val();
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
});