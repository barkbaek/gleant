$(document).ready(function() {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (is_mobile() === false) {
        $("#forgot-password-email").focus();
    }
    var forgot_password_submit = function (e) {
        e.preventDefault();
        var email = $("#forgot-password-email").val();
        if ((email === "") || is_email_valid(email) === false) {
            show_bert("danger", 2000, i18n[lang].wrong_email_format);
            return;
        }
        var s_cb = function (result) {
            if (result.response === true) {
                window.location = "/success/sent-reset-password";
            } else {
                if (result.msg === "server_error") {
                    return show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                } else if (result.msg === "already_sent") {
                    return show_bert("danger", 2000, i18n[lang].you_can_try_only_once_a_day);
                } else {
                    window.location = "/success/sent-reset-password";
                }
            }
        };
        var f_cb = function () {show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{email:encodeURIComponent(email)},
            pathname:"/forgot-password",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    $("#forgot-password-form").on("submit", function (e){
        forgot_password_submit(e);
        return false;
    });
    $("#forgot-password-form").on("click", "#forgot-password-submit", function (e){
        forgot_password_submit(e);
        return false;
    });
});