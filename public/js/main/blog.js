$(document).ready(function() {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (is_mobile() === false && $("#search-input").length > 0) {
        $("#search-input").focus();
    }
    realtime_comments["init"]('blog');
    if ($('#blog-list .article-item').length === 0) {
        $('#blog-list').append("<div style='width:100%;text-align:center;padding:10px;font-size:12px;'>" + i18n[lang].there_is_no_blog + "</div>");
        $('#blog-more').css('display', 'none');
    }
});