$(document).ready(function () {
    $(document).on("click", "#write-website #write-website-submit", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , language
            , link
            , title
            , content
            , temp_tags
            , pathname = "/insert/website"
            , tags = []
            , data = {}
            , f_cb
            , s_cb;
        if (lang === undefined) {
            lang = "en";
        }
        language = $("select#write-website-language option:selected").val();
        link = $("#write-website-link").val();
        title = $("#write-website-title").val();
        content = $("#write-website-content").val();
        temp_tags = $("#write-website-tags").val();
        if (temp_tags && temp_tags !== "") {
            temp_tags = temp_tags.split('#');
        } else {
            temp_tags = [];
        }
        for (var i = 0; i < temp_tags.length; i++) {
            temp_tags[i] = temp_tags[i].trim().replace(/\s\s+/gi, '').toLowerCase();
        }
        for (var i = 1; i < temp_tags.length; i++) {
            if (temp_tags[i] !== "") {
                tags.push(temp_tags[i]);
            }
        }
        if (title === "") {
            return show_bert("danger", 2000, i18n[lang].please_enter_title);
        }
        if (link === "") {
            return show_bert("danger", 2000, i18n[lang].please_enter_link);
        }
        data["language"] = encodeURIComponent(language);
        data["link"] = encodeURIComponent(link);
        data["title"] = encodeURIComponent(title);
        data["content"] = encodeURIComponent(content);
        data["tags"] = encodeURIComponent(JSON.stringify(tags));
        s_cb = function (result) {
            if (result.response === true) {
                $("#write-website-link").val("");
                $("#write-website-title").val("");
                $("#write-website-content").val("");
                $("#write-website-tags").val("");
                return show_bert("success", 2000, "'" + title + "' is added!");
            } else {
                if (result.reason === "already_exists") {
                    return show_bert("danger", 2000, i18n[lang].website_already_exists);
                } else {
                    return show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        f_cb = function () { return show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:pathname,
            s_cb:s_cb,
            f_cb:f_cb
        });
    });
    $(document).on("keyup", "input[type='text']#write-website-tags", function (e) {
        if (is_ie() === false) {
            var text = $(e.currentTarget).val().replace(/\s+/gi, '').toLowerCase();
            $(e.currentTarget).val(text);
        }
    });
});