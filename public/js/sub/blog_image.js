$(document).ready(function () {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    $(window).resize(function () {
        if (($('#blog-image-list').length > 0) &&
            ($('.btn-gallery-align-flex').hasClass('selected') === true)) {
            blog_image["init"]();
        }
    });
    $(document).on('click', '.btn-gallery-align-square', function (e) {
        e.preventDefault();
        var css_version = $("body").attr("data-css-version");
        $('.btn-gallery-align-square').addClass('selected');
        $('.btn-gallery-align-flex').removeClass('selected');
        $('.btn-gallery-align-square img').attr('src', aws_s3_url + '/icons/align-square-selected.png' + css_version);
        $('.btn-gallery-align-flex img').attr('src', aws_s3_url + '/icons/align-flex.png' + css_version);
        $('#blog-article-list').css('display', 'block');
        $('#blog-image-list').css('display', 'none');
        return false;
    });
    $(document).on('click', '.btn-gallery-align-flex', function (e) {
        e.preventDefault();
        var css_version = $("body").attr("data-css-version");
        $('.btn-gallery-align-square').removeClass('selected');
        $('.btn-gallery-align-flex').addClass('selected');
        $('.btn-gallery-align-square img').attr('src', aws_s3_url + '/icons/align-square.png' + css_version);
        $('.btn-gallery-align-flex img').attr('src', aws_s3_url + '/icons/align-flex-selected.png' + css_version);
        $('#blog-article-list').css('display', 'none');
        $('#blog-image-list').css('display', 'block');
        if ($('#blog-image-list .blog-image-item').length === 0 &&
            $('#blog-image-list .blog-image-none').length === 0) {
            $('#blog-image-list').append("<div class='blog-image-none'>" + i18n[lang].there_is_no_image + "</div>");
        }
        blog_image["init"]();
        return false;
    });
    $(document).on('click', '.add-image-gallery', function (e) {
        e.preventDefault();
        $('#upload-image-from-gallery').val("");
        document.getElementById('upload-image-from-gallery').click();
        return false;
    });
    $("#upload-image-from-gallery").change(function (e) {
        var file = $('input[type=file]#upload-image-from-gallery')[0].files[0];
        if (!$('#upload-image-from-gallery').val().match(/.(jpg|jpeg|png|gif)$/i)) {
            show_bert("danger", 2000, i18n[lang].use_only_jpg_jpeg_png_gif_extension);
            return false;
        }
        if (file["size"] > 5242880) {
            show_bert("danger", 2000, i18n[lang].image_size_must_be_less_than_5mb);
            return false;
        }
        animation("wait", "play");
        $("#upload-image-from-gallery-form").trigger("submit");
    });
    $('iframe#upload-image-from-gallery-iframe').load(function() {
        var iframe = document.getElementById("upload-image-from-gallery-iframe");
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
                window.location = result.pathname;
            }
        } else {
            show_bert("danger", 2000, i18n[lang].image_size_must_be_less_than_5mb);
            return false;
        }
    });
});