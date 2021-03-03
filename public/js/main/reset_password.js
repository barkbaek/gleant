$(document).ready(function() {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (is_mobile() === false) {
        $("#reset-password1").focus();
    }
    var reset_submit = function (e) {
        e.preventDefault();
        var token = window.location.pathname.replace("/reset-password/", "");
        var password1 = $("#reset-password1").val();
        var password2 = $("#reset-password2").val();
        if ((password1 === "") || (password2 === "")) {
            return show_bert("danger", 2000, i18n[lang].please_enter_password);
        }
        if (password1 !== password2) {
            return show_bert("danger", 2000, i18n[lang].entered_passwords_are_different);
        }
        if (is_password_format_valid(password1) !== true) {
            return show_bert("danger", 2000, is_password_format_valid(password1));
        }
        var s_cb = function (result) {
            if ( result['response'] === true ) {
                window.location = "/success/reset-password";
            } else {
                if (result['reason'] === "error_redirect" || result['reason'] === "wrong_token") {
                    window.location = "/error/404";
                } else if (result['reason'] === "not_valid_password") {
                    show_bert("danger", 4000, i18n[lang].wrong_password_format);
                } else if (result['reason'] === "server_error") {
                    show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        var f_cb = function () {show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{password:encodeURIComponent(password1), token:encodeURIComponent(token)},
            pathname:"/reset-password",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    $("#reset-form").on("submit", function (e) {
        reset_submit(e);
        return false;
    });
    $("#reset-form").on("click", "#reset-submit", function (e) {
        reset_submit(e);
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
});