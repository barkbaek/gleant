var gleant_announcement = {};
var now = new Date().valueOf();
var get_single_perfect_gleant_announcement = function (lang, doc) {
    var written_title_wrapper
        , written_title
        , created_at_wrapper
        , created_at
        , written_content
        , written_link
        , a
        , img
        , url = window.location.protocol + "//" + window.location.hostname + (window.location.port === "" ? "" : ":" + window.location.port);
    written_title = "<div class='written-title'>" + get_encoded_html_preventing_xss(doc.title) + "</div>";
    written_title_wrapper = "<div class='written-title-wrapper'>" + written_title + "</div>";
    created_at = "<div class='created-at' data-datetime='" + doc.created_at + "'></div>";
    created_at_wrapper = "<div class='created-at-wrapper'>" + created_at + "</div>";
    written_content = "<div class='written-content'>" + doc.content + "</div>";
    written_link = url + "/announcement/" + doc._id;
    a = "<a href='" + written_link + "' target='_blank' alt='Gleant' title='Gleant'>" + written_link  + "</a>";
    img = "<img class='copy-article-address emoticon-x-small-img' src='" + aws_s3_url + "/icons/copy-clipboard.png' data-clipboard-text='" + written_link + "' alt='" + i18n[lang].copy_url + "' title='" + i18n[lang].copy_url + "'>";
    written_link = "<div class='written-link'>" + a + img + "</div>";
    return "<div class='written gleant-announcement' id='" + doc._id + "' data-id='" + doc._id + "' data-created-at='" + doc.created_at + "'>" + written_title_wrapper + created_at_wrapper + written_content + written_link + "</div>";
};

$(document).ready(function() {
    $.each( $(".output-document"), function (i, e) {
        var lang = $(this).attr("data-lang");
        gleant_announcement[lang] = {};
        gleant_announcement[lang]["title"] = "";
        gleant_announcement[lang]["content"] = "";
        gleant_announcement[lang]["language"] = lang;
    });
    $(document).on('DOMNodeInserted', function(e) {});
    $(document).on("click", ".write-single-language-submit", function (e) {
        e.preventDefault();
        var language
            , title
            , content
            , lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        language = $("select.written-language option:selected").val();
        title = $("#gleant-announcement-input").val();
        content = CKEDITOR.instances['ground-editor'].getData().replace(/<p>/gi,'<div>').replace(/<\/p>/gi,'</div>').replace(/<div>/gi,'').replace(/<\/div>/gi,'<br />').replace(/<script>/gi,'').replace(/<\/script>/gi,'');
        gleant_announcement[language] = {};
        gleant_announcement[language]["title"] = title;
        gleant_announcement[language]["content"] = content;
        gleant_announcement[language]["language"] = language;
        $("#output-" + language).empty().append(get["single"]["perfect"]["gleant_announcement"](language, {
            _id: "gleant" + now
            , title: title
            , content: content
            , created_at: now
        }));
        $("#gleant-announcement-input").val("");
        CKEDITOR.instances['ground-editor'].setData("");
        console.log("lang: " + lang + "\nlanguage: " + language);
        show_bert("success", 3000, "" + i18n[lang][get_language_text(language)] + " [" + title + "] added successfully.");
        return false;
    });
    $(document).on("click", ".btn-remove-output", function (e) {
        e.preventDefault();
        var $current = $(e.currentTarget)
            , lang = $current.attr("data-lang");
        gleant_announcement[lang] = {};
        gleant_announcement[lang]["title"] = "";
        gleant_announcement[lang]["content"] = "";
        gleant_announcement[lang]["language"] = lang;
        $("#" + $current.attr("data-target")).empty();
        return false;
    });
    $(document).on("click", "#write-gleant-announcement-submit", function (e) {
        e.preventDefault();
        var data = {}
            , is_fulfilled = true
            , send_notification = $("#send-notification").is(":checked");
        $.each( $(".output-document"), function (i, e) {
            var lang = $(this).attr("data-lang");
            if (
                gleant_announcement[lang]["title"] === "" &&
                gleant_announcement[lang]["content"] === ""
            ) {
                is_fulfilled = false;
            }
        });
        if (is_fulfilled === false) {
            show_bert("danger", 4000, "Please fill all documents!");
            return false;
        }
        data.send_notification = encodeURIComponent(send_notification);
        data.documents = encodeURIComponent(JSON.stringify(gleant_announcement));
        var s_cb = function (result) {
            if (result.response === true) {
                if (result.status === "error_insert_notification") {
                    return show_bert("danger", 4000, "Error Insert Notification");
                } else {
                    window.location = result.pathname;
                }
            } else {
                return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
            }
        };
        var f_cb = function () { return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/insert/tnaelg-announcement",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
});