$(document).ready(function() {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    $(document).on("click", ".tags-list li", function (e) {
        e.preventDefault();
        var $check_box = $(e.currentTarget).find('.check-box');
        if ($check_box.hasClass('selected') === true) {
            $check_box.removeClass('selected');
        } else {
            $check_box.addClass('selected');
        }
        var interesting_tag_count = $('.check-box.selected').length;
        if (interesting_tag_count >= 5) {
            $("#selected-tags-count").text(interesting_tag_count).addClass('ok');
        } else {
            $("#selected-tags-count").text(interesting_tag_count).removeClass('ok');
        }
        return false;
    });
    $(document).on("click", "#set-tags-submit", function (e) {
        e.preventDefault();
        var interesting_tags_count = $('.check-box.selected').length;
        if(interesting_tags_count < 5) {
            show_bert("danger", 3000, i18n[lang].please_select_at_least_5_interest_tags);
            return false;
        }
        var interesting_tags = [];
        $('.check-box.selected').each(function() {
            interesting_tags.push( get_decoded_html_preventing_xss($(this).parent().find(".tag-item").text()));
        });
        var s_cb = function (result) {
            if ( result['response'] === true ) {
                window.location = '/blog/' + result['blog_id'];
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        var f_cb = function () {show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation:true,
            data:{interesting_tags: encodeURIComponent(JSON.stringify(interesting_tags))},
            pathname:"/set/interesting-tags",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
});