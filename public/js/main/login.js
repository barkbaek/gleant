$(document).ready(function() {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (is_mobile() === false) {
        $("#login-email").focus();
    }
    var login_submit = function (e) {
        e.preventDefault();
        var email = $("#login-email").val();
        var password = $("#login-password").val();
        if (email === "" || password === "") {
            show_bert("danger", 2000, i18n[lang].please_enter_email_password);
            return;
        }
        if (is_email_valid(email) === false) {
            show_bert("danger", 2000, i18n[lang].wrong_email_format);
            return;
        }
        if (is_password_format_valid(password) !== true) {
            show_bert("danger", 2000, i18n[lang].wrong_email_or_password + " " + i18n[lang].please_try_again);
            return;
        }
        var s_cb = function (result) {
            if ( result['response'] === true ) {
                window.location = "/";
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    if (result['reason'] === 'not_set_blog_id') {
                        window.location = "/set/blog-id";
                    } else if (result['reason'] === 'wrong_info') {
                        show_bert("danger", 2000, i18n[lang].wrong_email_or_password + " " + i18n[lang].please_try_again);
                    } else if (result['reason'] === 'not_verified') {
                        show_bert("danger", 2000, i18n[lang].please_verify_your_email);
                    }
                }
            }
        };
        var f_cb = function () {show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{email:encodeURIComponent(email),password:encodeURIComponent(password)},
            pathname:"/login/gleant",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    $(document).on("submit", "#login-form", function (e){
        login_submit(e);
        return false;
    });
    $(document).on("click", "#login-form #login-submit", function (e){
        login_submit(e);
        return false;
    });
    $(document).on("click", "#login #login-kakao", function (e){
        e.preventDefault();
        kakao.go("login");
        return false;
    });
});