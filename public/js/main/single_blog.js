$(document).ready(function () {
    $('.counter').counterUp({
        delay: 10,
        time: 500
    });
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var s_cb = function (result) {};
    var f_cb1 = function () {};
    var f_cb2 = function () {};
    if ((window.location.pathname.split('/').length > 3) && ($(window).width() < 768)) {
        var height = $("#blog-info").height() + 20 + 20 + $("#blog-name").height() + 15 + $("#profile-top").height() + $("#profile-middle").height() + 20 + $("#profile-bottom-left").height() + 20;
        $('.body-inner-main').scrollTop(height);
    }
    $(document).on('click', '#profile-img', function (e) {
        e.preventDefault();
        var src = $(e.currentTarget).attr('src');
        var img = "<img src='" + src + "'>";
        $('.prompt#profile-img-prompt .prompt-main').empty().append(img);
        modal('.prompt#profile-img-prompt', 'open');
        return false;
    });
    $(document).on("click", ".prompt#profile-img-prompt .close", function (e) {
        e.preventDefault();
        modal(".prompt#profile-img-prompt", "close");
        return false;
    });
    $(document).on('click', '#edit-blog-name', function (e) {
        e.preventDefault();
        if ($("#login-type").length === 0) {
            return false;
        }
        blog["profile"]["get_and_open"]({
            type: 'blog_name',
            id: 'blog_name'
        });
        return false;
    });
    $(document).on('click', '#edit-self-introduction, #self-introduction.empty', function (e) {
        e.preventDefault();
        if ($("#login-type").length === 0) {
            return false;
        }
        blog["profile"]["get_and_open"]({
            type: 'self_introduction',
            id: 'self_introduction'
        });
        return false;
    });
    $(document).on('click', ".edit#edit-blog", function (e) {
        e.preventDefault();
        if ($("#login-type").length === 0) {
            return false;
        }
        modal(".prompt#edit-blog-prompt", "open");
        return false;
    });
    $(document).on("click", ".prompt#edit-blog-prompt .close", function (e) {
        e.preventDefault();
        modal(".prompt#edit-blog-prompt", "close");
        return false;
    });
    $(document).on('click', '.change-profile-image', function (e) {
        e.preventDefault();
        $('#upload-profile-image').val("");
        document.getElementById('upload-profile-image').click();
        return false;
    });
    $("#upload-profile-image").change(function (e) {
        var file = $('input[type=file]#upload-profile-image')[0].files[0];
        if (!$('#upload-profile-image').val().match(/.(jpg|jpeg|png|gif)$/i)) {
            show_bert("danger", 2000, i18n[lang].use_only_jpg_jpeg_png_gif_extension);
            return false;
        }
        if (file["size"] > 5242880) {
            show_bert("danger", 2000, i18n[lang].image_size_must_be_less_than_5mb);
            return false;
        }
        animation("wait", "play");
        $("#upload-profile-image-form").trigger("submit");
    });
    $('iframe#upload-profile-image-iframe').load(function() {
        var iframe = document.getElementById("upload-profile-image-iframe");
        var doc = iframe.contentDocument || iframe.contentWindow.document;
        var target, result;
        animation("wait", "stop");
        target = doc.getElementById("result-inserting-image");
        if (target) {
            result = target.innerHTML;
            result = JSON.parse(result);
            if (result['res'] === false) {
                if (result['reason'] === 'server_error') {
                    show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                } else {
                    show_bert("danger", 2000, i18n[lang].image_size_must_be_less_than_5mb);
                }
                return false;
            } else {
                $("#profile-img").attr("src", result.img);
                $("#menu-user-desktop img").attr("src", result.img);
                $("#mobile-right-menu .user-profile-left img").attr("src", result.img);
            }
        } else {
            show_bert("danger", 2000, i18n[lang].image_size_must_be_less_than_5mb);
            return false;
        }
    });
    $(document).on('focus', '#ground-textarea', function (e) {
        $('.write-content-wrapper').css('border-color', '#5a00e0');
    });
    $(document).on('blur', '#ground-textarea', function (e) {
        $('.write-content-wrapper').css('border-color', '#ebebeb');
    });
});