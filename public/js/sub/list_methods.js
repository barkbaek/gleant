var update_count_view = function (data, cb) {
    var s_cb = function () {cb();};
    var f_cb = function () {cb();};
    methods["the_world"]["is_one"]({
        show_animation: false,
        data:data,
        pathname:"/update/count-view",
        s_cb:s_cb,
        f_cb:f_cb
    });
};
var open_article = function (obj) {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var type = obj.type
        , link = obj.link
        , is_from_translation = obj.is_from_translation
        , is_from_opinion = obj.is_from_opinion
        , data = {};
    $('.btn-ellipsis-mobile ul').css('display', 'none');
    var $wrapper;
    if (type === "apply_now") {
        data["type"] = encodeURIComponent("apply_now");
        data["_id"] = encodeURIComponent(link.split('/')[2]);
        $wrapper = $(".prompt#apply-now-prompt #apply-now-wrapper");
        $wrapper.empty();
        $("#unicorn").attr("data-type", "apply_now");
        write_form["init"]("unicorn", "apply_now");
    } else if (type === "hire_me") {
        data["type"] = encodeURIComponent("hire_me");
        data["_id"] = encodeURIComponent(link.split('/')[2]);
        $wrapper = $(".prompt#hire-me-prompt #hire-me-wrapper");
        $wrapper.empty();
        $("#superior").attr("data-type", "hire_me");
        write_form["init"]("superior", "hire_me");
    } else if (type === "agenda") {
        data["type"] = encodeURIComponent("agenda");
        data["_id"] = encodeURIComponent(link.split('/')[2]);
        $wrapper = $(".prompt#agenda-prompt #agenda-wrapper");
        $wrapper.empty();
        $("#space").attr("data-type", "agenda");
        write_form["init"]("space", "agenda");
    } else if (type === "opinion") {
        data["type"] = encodeURIComponent("opinion");
        data["agenda_id"] = encodeURIComponent(link.split('/')[2]);
        data["_id"] = encodeURIComponent(link.split('/')[4]);
        $wrapper = $(".prompt#opinion-prompt #opinion-wrapper");
        $wrapper.empty();
        $("#space").attr("data-type", "opinion");
        write_form["init"]("space", "opinion");
    } else if (type === "tr_agenda") {
        return false;
        data["type"] = encodeURIComponent("tr_agenda");
        data["agenda_id"] = encodeURIComponent(link.split('/')[2]);
        data["_id"] = encodeURIComponent(link.split('/')[4]);
        $wrapper = $(".prompt#translation-prompt #translation-wrapper");
        $wrapper.empty();
    } else if (type === "tr_opinion") {
        return false;
        data["type"] = encodeURIComponent("tr_opinion");
        data["agenda_id"] = encodeURIComponent(link.split('/')[2]);
        data["opinion_id"] = encodeURIComponent(link.split('/')[4]);
        data["_id"] = encodeURIComponent(link.split('/')[6]);
        $wrapper = $(".prompt#translation-prompt #translation-wrapper");
        $wrapper.empty();
    } else {
        window.location = link;
        return false;
    }
    if (is_translation_prompt_opened === true) {
        if (history && history.state) {
            if (my_history && my_history.length > 0) {
                my_history.pop();
            }
            history.back();
        }
        is_translation_prompt_opened = false;
        modal('.prompt#translation-prompt', 'close');
    }
    $(".prompt#translation-prompt #translation-wrapper").empty();
    var s_cb = function (result) {
        if (result["response"] === true) {
            modal(".prompt#share-prompt", "close");
            modal(".prompt#report-prompt", "close");
            if (is_agenda_prompt_opened === true) {
                modal('.prompt#agenda-prompt', 'close');
            }
            if (is_opinion_prompt_opened === true) {
                modal('.prompt#opinion-prompt', 'close');
            }
            if (is_apply_now_prompt_opened === true) {
                modal('.prompt#apply-now-prompt', 'close');
            }
            if (is_hire_me_prompt_opened === true) {
                modal('.prompt#hire-me-prompt', 'close');
            }
            var written;
            if (type === 'apply_now') {
                written = get["single"]["perfect"]["employment"](result["doc"]);
                $wrapper.append(written);
                if (history && history.pushState) {
                    if (is_apply_now_prompt_opened === false) {
                        my_history.push(link);
                        history.pushState(my_history, '', link);
                    }
                } else {
                    return window.location = link;
                }
                modal(".prompt#apply-now-prompt", "open");
                is_apply_now_prompt_opened = true;
                $('.prompt#apply-now-prompt .prompt-left > div').scrollTop(0)
            } else if (type === 'hire_me') {
                written = get["single"]["perfect"]["employment"](result["doc"]);
                $wrapper.append(written);
                if (history && history.pushState) {
                    if (is_hire_me_prompt_opened === false) {
                        my_history.push(link);
                        history.pushState(my_history, '', link);
                    }
                } else {
                    return window.location = link;
                }
                modal(".prompt#hire-me-prompt", "open");
                is_hire_me_prompt_opened = true;
                $('.prompt#hire-me-prompt .prompt-left > div').scrollTop(0);
            } else if (type === 'agenda') {
                written = get["single"]["perfect"]["article"](result["doc"]);
                $wrapper.append(written);
                if (history && history.pushState) {
                    if (is_agenda_prompt_opened === false) {
                        my_history.push(link);
                        history.pushState(my_history, '', link);
                    }
                } else {
                    return window.location = link;
                }
                modal(".prompt#agenda-prompt", "open");
                is_opinion_prompt_parent = is_opinion_prompt_opened === true;
                is_agenda_prompt_opened = true;
                $('.prompt#agenda-prompt .prompt-left > div').scrollTop(0);
            } else if (type === 'opinion') {
                written = get["single"]["perfect"]["article"](result["doc"]);
                $wrapper.append(written);
                if (history && history.pushState) {
                    my_history.push(link);
                    history.pushState(my_history, '', link);
                } else {
                    window.location = link;
                }
                modal(".prompt#opinion-prompt", "open");
                is_opinion_prompt_parent = is_agenda_prompt_opened === false;
                is_opinion_prompt_opened = true;
                $('.prompt#opinion-prompt .prompt-left > div').scrollTop(0);
            } else if (type === 'tr_agenda') {
                written = get["single"]["perfect"]["article"](result["doc"]);
                $wrapper.append(written);
                if (history && history.pushState) {
                    my_history.push(link);
                    history.pushState(my_history, '', link);
                } else {
                    window.location = link;
                }
                modal(".prompt#translation-prompt", "open");
                is_translation_prompt_opened = true;
                $('.prompt#translation-prompt .prompt-left > div').scrollTop(0);
            } else if (type === 'tr_opinion') {
                written = get["single"]["perfect"]["article"](result["doc"]);
                $wrapper.append(written);
                if (history && history.pushState) {
                    my_history.push(link);
                    history.pushState(my_history, '', link);
                } else {
                    window.location = link;
                }
                modal(".prompt#translation-prompt", "open");
                is_translation_prompt_opened = true;
                $('.prompt#translation-prompt .prompt-left > div').scrollTop(0);
            } else {
                return false;
            }
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                show_bert('danger', 3000, i18n[lang].deleted_article);
                return false;
            }
        }
    };
    var f_cb = function () {
        show_bert('danger', 3000, i18n[lang].deleted_article);
        return false;
    };
    methods["the_world"]["is_one"]({
        show_animation: true,
        data:data,
        pathname:"/get/single",
        s_cb:s_cb,
        f_cb:f_cb
    });
};
var get = {};
get["single"] = {};
get["single"]["normal"] = {};
get["single"]["search"] = {};
get["single"]["ranking"] = {};
get["single"]["perfect"] = {};
get["single"]["flexible"] = {};
get["single"]["form"] = {};
get["single"]["search"]["user"] = function (doc) {};
get["single"]["ranking"]["user"] = function (doc) {};
get["single"]["perfect"]["gleant_announcement"] = function (lang, doc) {
    if (lang === null) {
        lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
    }
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
get["single"]["perfect"]["guestbook"] = function (doc) {
    var css_version = $("body").attr("data-css-version")
        , is_loginned = $("body").attr("data-check") === "true"
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null
        , is_blog_owner = false
        , is_guestbook_writer = false
        , is_secret = false
        , written_guestbook
        , guestbook_top = ""
        , remove = ""
        , edit = ""
        , guestbook_go_blog
        , updated_at_wrapper = ""
        , created_at = ""
        , updated_at = ""
        , guestbook_middle = ""
        , guestbook_middle_left = ""
        , guestbook_img = ""
        , simple_profile_prompt_box = ""
        , a1 = ""
        , guestbook_name = ""
        , simple_profile_mouseentered_prompt = ""
        , guestbook_middle_right = ""
        , guestbook_secret = ""
        , guestbook_secret_img = ""
        , span = ""
        , guestbook_content = ""
        , edit_guestbook = ""
        , edit_guestbook_middle = ""
        , edit_guestbook_middle_left = ""
        , edit_guestbook_img = ""
        , edit_guestbook_name = ""
        , edit_guestbook_middle_right = ""
        , edit_guestbook_textarea = ""
        , edit_guestbook_bottom = ""
        , label = ""
        , edit_guestbook_secret_text = ""
        , edit_guestbook_secret = ""
        , edit_guestbook_cancel = ""
        , edit_guestbook_ok = ""
        , guestbook_bottom = ""
        , write_guestbook_comment_form = ""
        , write_guestbook_comment_left = ""
        , img = ""
        , write_guestbook_comment_middle = ""
        , write_guestbook_comment_input = ""
        , write_guestbook_comment_right = ""
        , write_guestbook_comment_submit = ""
        , guestbook_comment_list = ""
        , user_name = ""
        , user_img = "";
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (user_profile_link === "/set/blog-id") {
        is_loginned = false;
    } else {
        if (user_profile_link) {
            current_user_blog_id = user_profile_link.split('/')[2];
        }
    }
    if (is_loginned === true) {
        if (current_user_blog_id !== null && current_user_blog_id === doc.blog_id) {
            is_blog_owner = true;
        }
        if (current_user_blog_id !== null && current_user_blog_id === doc.visitor_blog_id) {
            is_guestbook_writer = true;
        }
        user_name = get_encoded_html_preventing_xss($("#mobile-right-menu .user-profile-right .user-name").text()) || "";
        user_img = $("#mobile-right-menu .user-profile-left img").attr("src") || "";
    } else {
        doc.name = "Gleant";
        if (doc.img.indexOf && doc.img.indexOf( "male.png") <= -1) {
            doc.img = aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
        }
    }
    if (doc.public_authority === 0) {
        is_secret = true;
    } else {
        is_secret = false;
    }
    if (
        is_blog_owner === true ||
        is_guestbook_writer === true
    ) {
        remove = "<div class='remove'>" + i18n[lang].remove + "</div>";
    } else {
        remove = "";
    }
    if (is_guestbook_writer === true) {
        edit = "<div class='edit'>" + i18n[lang].edit + "</div>";
    } else {
        edit = "";
    }
    if ( doc.visitor_blog_id === "" ) {
        guestbook_go_blog = "";
    } else {
        guestbook_go_blog = "<a class='guestbook-go-blog' href='/blog/" + doc.visitor_blog_id + "' target='_blank'>" + i18n[lang].blog + "</a>";
    }
    created_at = "<div class='created-at' data-datetime='" + doc.created_at + "'></div>";
    if (doc.created_at !== doc.updated_at) {
        updated_at = "<div class='updated-at' data-datetime='" + doc.updated_at + "'></div>";
    } else {
        updated_at = "";
    }
    updated_at_wrapper = "<div class='updated-at-wrapper'>" + created_at + updated_at + "</div>";
    guestbook_top = "<div class='guestbook-top'>" + remove + edit + guestbook_go_blog + updated_at_wrapper + "</div>";
    guestbook_img = "<img class='guestbook-img' src='" + doc.img + "' alt='" + get_encoded_html_preventing_xss(doc.name) + "' title='" + get_encoded_html_preventing_xss(doc.name) + "'>";
    if (is_loginned === true) {
        guestbook_name = "<div class='guestbook-name'>" + get_encoded_html_preventing_xss(doc.name) + "</div>";
    } else {
        guestbook_name = "<div class='guestbook-name not-logged-in'>" + get_encoded_html_preventing_xss(doc.name) + "</div>";
    }
    a1 = "<a href='/blog/" + doc.visitor_blog_id + "' target='_blank'>" + guestbook_name + "</a>";
    simple_profile_mouseentered_prompt = "<div class='simple-profile-mouseentered-prompt'></div>";
    if ( doc.visitor_blog_id === "" ) {
        simple_profile_prompt_box = "";
    } else {
        simple_profile_prompt_box = "<div class='simple-profile-prompt-box in-body' data-link='/blog/" + doc.visitor_blog_id + "'>" + a1 + simple_profile_mouseentered_prompt + "</div>";
    }
    guestbook_middle_left = "<div class='guestbook-middle-left'>" + guestbook_img + simple_profile_prompt_box + "</div>";
    guestbook_secret_img = "<img class='emoticon-x-small-img guestbook-secret-img' src='" + aws_s3_url + "/icons/secret.png'>";
    span = "<span>" + i18n[lang].secret + "</span>";
    if (is_secret === true) {
        guestbook_secret = "<div class='guestbook-secret'>" + guestbook_secret_img + span + "</div>";
    } else {
        guestbook_secret = "<div class='guestbook-secret' style='display:none;'>" + guestbook_secret_img + span + "</div>";
    }
    guestbook_content = "<div class='guestbook-content'>" + get_encoded_html_preventing_xss(doc.content) + "</div>";
    guestbook_middle_right = "<div class='guestbook-middle-right'>" + guestbook_secret + guestbook_content + "</div>";
    guestbook_middle = "<div class='guestbook-middle'>" + guestbook_middle_left + guestbook_middle_right + "</div>";
    written_guestbook = "<div class='written-guestbook'>" + guestbook_top + guestbook_middle + "</div>";
    if (is_guestbook_writer === true) {
        edit_guestbook_img = "<img class='edit-guestbook-img' src='" + doc.img + "' alt='" + get_encoded_html_preventing_xss(doc.name) + "' title='" + get_encoded_html_preventing_xss(doc.name) + "'>";
        edit_guestbook_name = "<div class='edit-guestbook-name'>" + get_encoded_html_preventing_xss(doc.name) + "</div>";
        edit_guestbook_middle_left = "<div class='edit-guestbook-middle-left'>" + edit_guestbook_img + edit_guestbook_name + "</div>";
        edit_guestbook_textarea = "<textarea class='edit-guestbook-textarea'></textarea>";
        edit_guestbook_middle_right = "<div class='edit-guestbook-middle-right'>" + edit_guestbook_textarea + "</div>";
        edit_guestbook_middle = "<div class='edit-guestbook-middle'>" + edit_guestbook_middle_left + edit_guestbook_middle_right + "</div>";
        edit_guestbook_secret_text = "<span class='edit-guestbook-secret-text'>" + i18n[lang].secret + "</span>";
        edit_guestbook_secret = "<input class='edit-guestbook-secret' type='checkbox'>";
        label = "<label>" + guestbook_secret_img + edit_guestbook_secret_text + edit_guestbook_secret + "</label>";
        edit_guestbook_cancel = "<input class='btn-career edit-guestbook-cancel' type='button' value='" + i18n[lang].cancel + "'>";
        edit_guestbook_ok = "<input class='btn-career edit-guestbook-ok' type='button' value='" + i18n[lang].check + "'>";
        edit_guestbook_bottom = "<div class='edit-guestbook-bottom'>" + label + edit_guestbook_cancel + edit_guestbook_ok + "</div>";
        edit_guestbook = "<form class='edit-guestbook'>" + edit_guestbook_middle + edit_guestbook_bottom + "</form>";
    } else {
        edit_guestbook = "";
    }
    if (
        is_blog_owner === true ||
        is_guestbook_writer === true
    ) {
        img = "<img src='" + user_img + "' title='" + user_name + "' alt='" + user_name + "'>";
        span = "<span class='write-guestbook-comment-name'>" + user_name + "</span>";
        write_guestbook_comment_left = "<div class='write-guestbook-comment-top'>" + img + span + "</div>";
        write_guestbook_comment_input = "<textarea class='write-guestbook-comment-input' placeholder=''></textarea>";
        write_guestbook_comment_middle = "<div class='write-guestbook-comment-middle'>" + write_guestbook_comment_input + "</div>";
        write_guestbook_comment_submit = "<input class='btn-career write-guestbook-comment-submit' type='submit' value='" + i18n[lang].check + "'>";
        write_guestbook_comment_right = "<div class='write-guestbook-comment-bottom'>" + write_guestbook_comment_submit + "</div>";
        write_guestbook_comment_form = "<form class='write-guestbook-comment-form'>" + write_guestbook_comment_left + write_guestbook_comment_middle + write_guestbook_comment_right + "</form>";
    } else {
        write_guestbook_comment_form = "";
    }
    for (var i = 0; i < doc.comments.length; i++) {
        if (doc.visitor_blog_id === doc.comments[i].blog_id) {
            doc.comments[i].img = doc.img;
        }
        guestbook_comment_list = guestbook_comment_list + get["single_guestbook_comment"](is_loginned, doc._id, doc.blog_id, doc.comments[i]);
    }
    guestbook_comment_list = "<div class='guestbook-comment-list'>" + guestbook_comment_list + "</div>";
    guestbook_bottom = "<div class='guestbook-bottom'>" + write_guestbook_comment_form + guestbook_comment_list + "</div>";
    return "<div class='guestbook' data-blog-id='" + doc.blog_id + "' data-visitor-blog-id='" + doc.visitor_blog_id + "' data-id='" + doc._id + "' data-is-secret='" + is_secret + "' data-created-at='" + doc.created_at + "'>" + written_guestbook + edit_guestbook + guestbook_bottom + "</div>";
};
get["single"]["flexible"]["image"] = function (doc, path) {
    var temp = doc["img"].split('.');
    temp = temp[temp.length-2].split('-');
    var width = temp[temp.length-2];
    var height = temp[temp.length-1];
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var public_authority
        ,img1
        ,div1
        ,div2
        ,div3
        ,a1;
    if (doc['public_authority'] === 0) {
        public_authority = i18n[lang].only_me;
    } else if (doc['public_authority'] === 1) {
        public_authority = i18n[lang].public;
    } else if (doc['public_authority'] === 2) {
        public_authority = i18n[lang].friends;
    }
    if (path === 'blog') {
        if (doc['title'] === "") {
            div2 = "<div class='blog-image-item-title no-resized' style='display:none;z-index:0;'></div>";
        } else {
            div2 = "<div class='blog-image-item-title no-resized'>" + get_encoded_html_preventing_xss(doc['title']) + "</div>";
        }
        img1 = "<img class='blog-image-item-img no-resized' src='" + doc["img"] + "' data-img='" + doc["img"] + "' data-width='" + width + "' data-height='" + height + "'>";
        a1 = "<a href='/blog/" + doc['blog_id'] + "/gallery/" + doc['_id'] + "'>" + div2 + img1 + "</a>";
        div1 = "<div class='blog-image-item'>" + a1 + "</div>";
    } else if (path === 'search') {
        img1 = "<img class='search-image-item-img no-resized' src='" + doc["img"] + "' data-img='" + doc["img"] + "' data-width='" + width + "' data-height='" + height + "'>";
        a1 = "<a href='/blog/" + doc['blog_id'] + "/gallery/" + doc['article_id'] + "' target='_blank'>" + img1 + "</a>";
        div1 = "<div class='search-image-item'>" + a1 + "</div>";
    }
    return div1;
};
get["single"]["normal"]["realtime_comment"] = function (doc) {
    var css_version = $("body").attr("data-css-version")
        ,final
        , temp
        , temp2
        , temp3
        , _id = ""
        , article_class
        , is_loginned = $("body").attr("data-check") === "true"
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null
        , lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (user_profile_link === "/set/blog-id") {
        is_loginned = false;
    } else {
        if (user_profile_link) {
            current_user_blog_id = user_profile_link.split('/')[2];
        }
    }
    if (is_loginned === false) {
        doc.name = "Gleant";
        if (doc.img.indexOf && doc.img.indexOf( "male.png") <= -1) {
            doc.img = aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
        }
    }
    temp = "<img src='" + doc.img + "' alt='" + get_encoded_html_preventing_xss(doc.name) + "' title='" + get_encoded_html_preventing_xss(doc.name) + "'>";
    temp = "<div class='user-profile-left-small'>" + temp + "</div>";
    if (is_loginned === true) {
        temp2 = "<span class='user-name'>" + get_encoded_html_preventing_xss(doc.name) + "</span>";
    } else {
        temp2 = "<span class='user-name not-logged-in'>" + get_encoded_html_preventing_xss(doc.name) + "</span>";
    }
    temp2 = "<div>" + temp2 + "</div>";
    temp3 = "<div class='created-at-small' data-datetime='" + doc.created_at + "'>" + to_i18n_short_datetime(new Date(doc.created_at)) + "</div>";
    temp2 = "<div class='user-profile-right-small'>" + temp2 + temp3 + "</div>";
    temp = "<div class='user-profile-small'>" + temp + temp2 + "</div>";
    temp2 = "<div class='content'>" + get_encoded_html_preventing_xss(doc.comment) + "</div>";
    temp = "<li data-updated-at='" + doc.updated_at + "'>" + temp + temp2 + "</li>";
    temp2 = doc.link.split("/");
    if (doc.type === "apply_now") {
        _id = temp2[2];
    } else if (doc.type === "hire_me") {
        _id = temp2[2];
    } else if (doc.type === "agenda") {
        _id = temp2[2];
    } else if (doc.type === "opinion") {
        _id = temp2[4];
    } else if (doc.type === "tr_agenda") {
        _id = temp2[4];
    } else if (doc.type === "tr_opinion") {
        _id = temp2[6];
    } else if (doc.type === "blog") {
        _id = temp2[4];
    } else if (doc.type === "gallery") {
        _id = temp2[4];
    } else {
        return "";
    }
    article_class = doc.type + "-" + _id;
    if (doc.comment_type === 1) {
        final = "<a class='" + article_class + "' href='" + doc.link + "?comment=" + doc._id + "'>" + temp + "</a>";
    } else if (doc.comment_type === 2) {
        final = "<a class='" + article_class + "' href='" + doc.link + "?comment=" + doc.outer_id + "&inner_comment=" + doc._id +"'>" + temp + "</a>";
    } else {
        return "";
    }
    return final;
};
get["single"]["normal"]["article"] = function (doc) {
    var css_version = $("body").attr("data-css-version")
        , written_language
        , main_tag
        , name
        , simple_profile_mouseentered_prompt
        , simple_profile_prompt_box
        , article_item_top
        , article_item_updated_at
        , thumbnail
        , pathname = window.location.pathname
        , temp
        , temp2
        , written_debate_status = ""
        , class_debate_status = "debate-unlimited"
        , debate_status
        , datetime = new Date().valueOf()
        , is_loginned = $("body").attr("data-check") === "true"
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null
        , lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (user_profile_link === "/set/blog-id") {
        is_loginned = false;
    } else {
        if (user_profile_link) {
            current_user_blog_id = user_profile_link.split('/')[2];
        }
    }
    debate_status = i18n[lang].unlimited;
    if (
        doc['type'] === 'agenda' ||
        doc['type'] === 'opinion' ||
        doc['type'] === 'tr_agenda' ||
        doc['type'] === 'tr_opinion'
    ) {
        if (is_loginned === false) {
            doc.name = "Gleant";
            if (doc.img.indexOf && doc.img.indexOf( "male.png") <= -1) {
                doc.img = aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
            }
        }
        if (doc.language === "en") {
            written_language = "english";
        } else if (doc.language === "ja") {
            written_language = "japanese";
        } else if (doc.language === "ko") {
            written_language = "korean";
        } else if (doc.language === "zh-Hans") {
            written_language = "simplified_chinese";
        } else {
            written_language = "english";
        }
        main_tag = "<a href='/debate?mt=" + doc["main_tag"] + "'>" + i18n[lang][doc["main_tag"]]  + "</a>";
        if (is_loginned === true) {
            name = "<a href='/blog/" + doc["blog_id"] + "'>" + get_encoded_html_preventing_xss(doc["name"]) + "</a>";
        } else {
            name = "<a class='not-logged-in' href='/blog/" + doc["blog_id"] + "'>" + get_encoded_html_preventing_xss(doc["name"]) + "</a>";
        }
        simple_profile_mouseentered_prompt = "<div class='simple-profile-mouseentered-prompt'></div>";
        simple_profile_prompt_box = "<div class='simple-profile-prompt-box in-body' data-link='/blog/" + doc["blog_id"] + "'>" + name + simple_profile_mouseentered_prompt + "</div>";
        if (
            doc['type'] === 'agenda' ||
            doc['type'] === 'tr_agenda'
        ) {
            if (doc['type'] === 'agenda') {
                temp = i18n[lang].original;
            } else {
                temp = i18n[lang].translation;
            }
            if (doc['is_start_set'] === true) {
                if (doc['start_at'] > datetime) {
                    class_debate_status = "debate-scheduled";
                    debate_status = i18n[lang].scheduled;
                } else {
                    if (doc['is_finish_set'] === true) {
                        if (doc['finish_at'] > datetime) {
                            class_debate_status = "debate-in-progress";
                            debate_status = i18n[lang].in_progress;
                        } else {
                            class_debate_status = "debate-finished";
                            debate_status = i18n[lang].finished;
                        }
                    } else {
                        class_debate_status = "debate-unlimited";
                        debate_status = i18n[lang].unlimited;
                    }
                }
            } else {
                if (doc['is_finish_set'] === true) {
                    if (doc['finish_at'] > datetime) {
                        class_debate_status = "debate-in-progress";
                        debate_status = i18n[lang].in_progress;
                    } else {
                        class_debate_status = "debate-finished";
                        debate_status = i18n[lang].finished;
                    }
                } else {
                    class_debate_status = "debate-unlimited";
                    debate_status = i18n[lang].unlimited;
                }
            }
            written_debate_status = "";/*"<div class='debate-status " + class_debate_status + "' data-is-start-set='" + doc['is_start_set'] + "' data-start-at='" + doc['start_at'] + "' data-is-finish-set='" + doc['is_finish_set'] + "' data-finish-at='" + doc['finish_at'] + "' data-print-type='normal'>" + debate_status + "</div>";*/
            if (
                pathname.split('/')[1] === 'blog' &&
                pathname.split('/')[2] !== undefined &&
                doc['public_authority'] === 2
            ) {
                written_debate_status = written_debate_status + "<div>" + i18n[lang].invited_users + "</div>";
            }
            if (is_loginned === true) {
                article_item_top = "<div class='article-item-top'>" + written_debate_status + simple_profile_prompt_box + "</div>";
            } else {
                article_item_top = "<div class='article-item-top'>" + written_debate_status + "</div>";
            }
        } else {
            if (doc['type'] === 'opinion') {
                temp = i18n[lang].original;
            } else {
                temp = i18n[lang].translation;
            }
            if (
                pathname.split('/')[1] === 'blog' &&
                pathname.split('/')[2] !== undefined &&
                doc['public_authority'] === 2
            ) {
                written_debate_status = "<div>" + i18n[lang].invited_users + "</div>";
            } else {
                written_debate_status = "";
            }
            if (is_loginned === true) {
                article_item_top = "<div class='article-item-top'>" + written_debate_status + simple_profile_prompt_box + "</div>";
            } else {
                article_item_top = "<div class='article-item-top'>" + written_debate_status + "</div>";
            }
        }
    } else {
        if (is_loginned === false) {
            doc.blog_name = "Gleant";
            if (doc.type === "blog") {
                if (doc.img.indexOf && doc.img.indexOf( "male.png") <= -1) {
                    doc.img = aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                }
            }
        }
        if (doc.language === undefined || doc.language === "") {
            written_language = "";
        } else if (doc.language === "en") {
            written_language = "english";
        } else if (doc.language === "ja") {
            written_language = "japanese";
        } else if (doc.language === "ko") {
            written_language = "korean";
        } else if (doc.language === "zh-Hans") {
            written_language = "simplified_chinese";
        } else {
            written_language = "english";
        }
        if (written_language === "") {
            temp = "";
        } else {
            temp = i18n[lang][written_language];
        }
        if (temp !== "") {
            temp = " &#183; " + temp;
        }
        if (doc['public_authority'] === 0) {
            temp = i18n[lang].only_me;
        } else if (doc['public_authority'] === 1) {
            temp = "";
        } else if (doc['public_authority'] === 2) {
            temp = i18n[lang].friends;
        }
        if (pathname.split('/')[1] === 'blog' && pathname.split('/')[2] !== undefined) {
            if (doc["type"] === "gallery" && doc["is_profile"] === true) {
                if (temp === "") {
                    temp2 = i18n[lang].profile_photo;
                } else {
                    temp2 = " &#183; " + i18n[lang].profile_photo;
                }
            } else {
                temp2 = "";
            }
            article_item_top = "<div class='article-item-top'>" + temp + temp2 + "</div>";
        } else {
            if (temp !== "") {
                temp = temp + "<br>";
            }
            if (is_loginned === true) {
                article_item_top = "<div class='article-item-top'>" + get_encoded_html_preventing_xss(doc['blog_name']) + "</div>";
            } else {
                article_item_top = "<div class='article-item-top'>" + "</div>";
            }
        }
    }
    if (doc["created_at"] === doc["updated_at"]) {
        article_item_updated_at = "<div class='article-item-updated-at created-at-small' data-datetime='" + doc["updated_at"] + "'>" + to_i18n_short_datetime(new Date(doc["updated_at"])) + "</div>";
    } else {
        article_item_updated_at = "<div class='article-item-updated-at updated-at-small' data-datetime='" + doc["updated_at"] + "'>" + to_i18n_short_datetime(new Date(doc["updated_at"])) + "</div>";
    }
    if (doc["type"] === "gallery") {
        thumbnail = "<img src='" + doc["img"].replace('/resized/', '/square/') + "'>";
    } else {
        if (doc["img_list"].length !== 0) {
            thumbnail = "<img src='" + doc["img_list"][0].replace('/resized/', '/square/') + "'>";
        } else {
            thumbnail = "<img src='" + doc["img"].replace('/resized/', '/square/') + "'>";
        }
    }
    var thumbnail_link
        , article_item_middle;
    if (doc['type'] === 'agenda') {
        thumbnail_link = "<a href='/agenda/" + doc["_id"] + "'>" + thumbnail + "</a>";
    } else if (doc['type'] === 'opinion') {
        thumbnail_link = "<a href='/agenda/" + doc["agenda_id"] + "/opinion/" + doc["_id"] + "'>" + thumbnail + "</a>";
    } else if (doc['type'] === 'tr_agenda') {
        thumbnail_link = "<a href='/agenda/" + doc["agenda_id"] + "/tr/" + doc["_id"] + "'>" + thumbnail + "</a>";
    } else if (doc['type'] === 'tr_opinion') {
        thumbnail_link = "<a href='/agenda/" + doc["agenda_id"] + "/opinion/" + doc["opinion_id"] + "/tr/" + doc["_id"] + "'>" + thumbnail + "</a>";
    } else if (doc['type'] === 'blog') {
        thumbnail_link = "<a href='/blog/" + doc["blog_id"] + "/" + doc["blog_menu_id"] + "/" + doc["_id"] + "'>" + thumbnail + "</a>";
    } else if (doc['type'] === 'gallery') {
        thumbnail_link = "<a href='/blog/" + doc["blog_id"] + "/gallery/" + doc["_id"] + "'>" + thumbnail + "</a>";
    }
    article_item_middle = "<div class='article-item-middle'>" + thumbnail_link + "</div>";
    var count_img
        , count_num
        , view_counts = ""
        , youtube_inserted = "";
    if (doc.type !== "gallery") {
        if (doc.is_youtube_inserted === true) {
            youtube_inserted = "<div class='youtube-inserted'><img src='" + aws_s3_url + "/icons/youtube.png" + css_version + "' title='YouTube' alt='YouTube'></div>";
        }
    }
    if (doc["count_view"] > 0) {
        count_img = "<img src='" + aws_s3_url + "/icons/view-selected.png" + css_version + "' title='" + i18n[lang].view + "' alt='" + i18n[lang].view + "'>";
        count_num = "<span>" + put_comma_between_three_digits(doc["count_view"]) + "</span>";
        view_counts = "<div class='view-counts' data-count='" + doc["count_view"] + "'>" + count_img + count_num + "</div>";
    }
    var awesome_counts = "";
    if (doc["count_awesome"] > 0) {
        count_img = "<img src='" + aws_s3_url + "/icons/awesome-selected.png" + css_version + "' title='" + i18n[lang].awesome + "' alt='" + i18n[lang].awesome + "'>";
        count_num = "<span>" + put_comma_between_three_digits(doc["count_awesome"]) + "</span>";
        awesome_counts = "<div class='awesome-counts' data-count='" + doc["count_awesome"] + "'>" + count_img + count_num + "</div>";
    }
    var comments_counts = "";
    if (doc["count_comments"] > 0) {
        count_img = "<img src='" + aws_s3_url + "/icons/comments-green.png" + css_version + "' title='" + i18n[lang].comments + "' alt='" + i18n[lang].comments + "'>";
        count_num = "<span>" + put_comma_between_three_digits(doc["count_comments"]) + "</span>";
        comments_counts = "<div class='comments-counts' data-count='" + doc["count_comments"] + "'>" + count_img + count_num + "</div>";
    }
    var written_opinion_counts = ""
        , requested_opinion_counts = "";
    if (doc["type"] === "agenda") {
        if (doc["count_written_opinions"] > 0) {
            count_img = "<img src='" + aws_s3_url + "/icons/write-opinion-selected.png" + css_version + "' title='" + i18n[lang].opinion + "' alt='" + i18n[lang].opinion + "'>";
            count_num = "<span>" + put_comma_between_three_digits(doc["count_written_opinions"]) + "</span>";
            written_opinion_counts = "<div class='written-opinion-counts' data-count='" + doc["count_written_opinions"] + "'>" + count_img + count_num + "</div>";
        }
        if (doc["count_requested_opinions"] > 0) {
            count_img = "<img src='" + aws_s3_url + "/icons/request-opinion-selected.png" + css_version + "' title='" + i18n[lang].opinion_request + "' alt='" + i18n[lang].opinion_request + "'>";
            count_num = "<span>" + put_comma_between_three_digits(doc["count_requested_opinions"]) + "</span>";
            requested_opinion_counts = "<div class='requested-opinion-counts' data-count='" + doc["count_requested_opinions"] + "'>" + count_img + count_num + "</div>";
        }
    }
    var written_translation_counts = ""
        , total_count_written_translations = 0
        , requested_translation_counts = "";
    if (
        doc["type"] === "agenda" || doc["type"] === "opinion"
    ) {
        /*for (var j = 0; j < doc["count_written_translations"].length; j++) {
            if (doc["count_written_translations"][j].count < 0) {
                doc["count_written_translations"][j].count = 0;
            }
            total_count_written_translations = total_count_written_translations + doc["count_written_translations"][j].count;
        }
        if (total_count_written_translations > 0) {
            count_img = "<img src='" + aws_s3_url + "/icons/write-translation-selected.png" + css_version + "' title='" + i18n[lang].translation + "' alt='" + i18n[lang].translation + "'>";
            count_num = "<span>" + put_comma_between_three_digits(total_count_written_translations) + "</span>";
            written_translation_counts = "<div class='written-translation-counts' data-count='" + total_count_written_translations + "'>" + count_img + count_num + "</div>";
        }
        if (doc["count_requested_translations"] > 0) {
            count_img = "<img src='" + aws_s3_url + "/icons/request-translation-selected.png" + css_version + "' title='" + i18n[lang].translation_request + "' alt='" + i18n[lang].translation_request + "'>";
            count_num = "<span>" + put_comma_between_three_digits(doc["count_requested_translations"]) + "</span>";
            requested_translation_counts = "<div class='requested-translation-counts' data-count='" + doc["count_requested_translations"] + "'>" + count_img + count_num + "</div>";
        }*/
        written_translation_counts = "";
        requested_translation_counts = "";
    }
    var article_item_counts_wrapper = "<div class='article-item-counts-wrapper'>" +
        youtube_inserted + view_counts + awesome_counts + written_opinion_counts + requested_opinion_counts + written_translation_counts + requested_translation_counts + comments_counts + "</div>";
    var article_item_bottom = "<div class='article-item-bottom'>" + get_encoded_html_preventing_xss(doc["title"]) + "</div>",
        article_data_link;
    if (doc['type'] === 'agenda') {
        article_data_link = "/agenda/" + doc['_id'];
    } else if (doc['type'] === 'opinion') {
        article_data_link = "/agenda/" + doc['agenda_id'] + "/opinion/" + doc['_id'];
    } else if (doc['type'] === 'tr_agenda') {
        article_data_link = "/agenda/" + doc['agenda_id'] + "/tr/" + doc['_id'];
    } else if (doc['type'] === 'tr_opinion') {
        article_data_link = "/agenda/" + doc['agenda_id'] + "/opinion/" + doc['opinion_id'] + "/tr/" + doc['_id'];
    } else if (doc['type'] === 'blog') {
        article_data_link = "/blog/" + doc['blog_id'] + "/" + doc['blog_menu_id'] + "/" + doc['_id'];
    } else if (doc['type'] === 'gallery') {
        article_data_link = "/blog/" + doc['blog_id'] + "/gallery/" +  doc['_id'];
    }
    var article_item_inner = "<div class='article-item-inner' data-link='" + article_data_link +
        "' data-type='" + doc["type"] +
        "' data-updated-at='" + doc["updated_at"] + "'>" +
        article_item_top + article_item_updated_at + article_item_middle + article_item_counts_wrapper + article_item_bottom + "</div>";
    var article_class = doc['type'] + "-" + doc['_id'];
    return "<div class='article-item " + article_class + " " + doc['type'] +"-item' data-print-type='normal'>" + article_item_inner + "</div>";
};
get["single"]["search"]["article"] = function (doc) {
    return "";
};
get["single"]["perfect"]["article"] = function (doc) {
    var css_version = $("body").attr("data-css-version")
        , is_loginned = $("body").attr("data-check") === "true"
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null
        , id = Date.now() + "_" + doc["_id"]
        , data_link
        , written_link
        , data_created_at = doc["created_at"]
        , data_updated_at = doc["updated_at"]
        , lang = $("body").attr("data-lang")
        , is_modal = $('#opinion-list-of-agenda-modal').length === 0;
    if (lang === undefined) {
        lang = "en";
    }
    if (user_profile_link === "/set/blog-id") {
        is_loginned = false;
    } else {
        if (user_profile_link) {
            current_user_blog_id = user_profile_link.split('/')[2];
        }
    }
    if (doc["type"] === "agenda") {
        data_link = "/agenda/" + doc["_id"];
    } else if (doc["type"] === "opinion") {
        data_link = "/agenda/" + doc["agenda_id"] + "/opinion/" + doc["_id"];
    } else if (doc["type"] === "tr_agenda") {
        data_link = "/agenda/" + doc["agenda_id"] + "/tr/" + doc["_id"];
    } else if (doc["type"] === "tr_opinion") {
        data_link = "/agenda/" + doc["agenda_id"] + "/opinion/" + doc["opinion_id"] + "/tr/" + doc["_id"];
    } else if (doc["type"] === "blog") {
        data_link = "/blog/" + doc["blog_id"] + "/" + doc["blog_menu_id"] + "/" + doc["_id"];
    } else if (doc["type"] === "gallery") {
        data_link = "/blog/" + doc["blog_id"] + "/gallery/" + doc["_id"];
    } else {
        return false;
    }
    var temp_list = ""
        , temp = ""
        , temp2 = ""
        , temp3 = ""
        , temp4 = "";
    written_link = window.location.protocol + "//" + window.location.hostname + (window.location.port === "" ? "" : ":" + window.location.port) + data_link;
    temp = "<img class='copy-article-address emoticon-x-small-img' src='" + aws_s3_url + "/icons/copy-clipboard.png' data-clipboard-text='" + written_link + "' alt='" + i18n[lang].copy_url + "' title='" + i18n[lang].copy_url + "'>";
    written_link = "<a href='" + written_link + "' target='_blank' alt='" + get_encoded_html_preventing_xss(doc['title']) + "' title='" + get_encoded_html_preventing_xss(doc['title']) + "'>" + written_link + "</a>";
    written_link = "<div class='written-link'>" +  written_link + temp + "</div>";
    var edit
        , written_language
        , written_top
        , written_debate_info
        , writing_authority
        , members_wrapper
        , members_btn_list = ""
        , members_list
        , member_item_class
        , written_title_wrapper
        , user_profile
        , written_content
        , written_btns_wrapper
        , comments_wrapper
        , write_opinion_wrapper = ""
        , request_opinion_wrapper = ""
        , write_translation_wrapper = ""
        , request_translation_wrapper = ""
        , translation_list_wrapper = ""
        , opinion_list_of_agenda = ""
        , opinion_of_agenda
        , article_type = ""
        , written_debate_status = ""
        , class_debate_status = "debate-unlimited"
        , debate_status = i18n[lang].unlimited
        , datetime = new Date().valueOf()
        , space;
    if (current_user_blog_id === null) {
        edit = "";
    } else {
        if (doc["blog_id"] === current_user_blog_id) {
            edit = "<div class='remove article-remove'>" + i18n[lang].remove + "</div>" +
                "<div class='edit article-edit'>" + i18n[lang].edit + "</div>";
        } else {
            edit = "";
        }
    }
    var temp_i18n_languages = {};
    temp_i18n_languages["en"] = "english";
    temp_i18n_languages["ja"] = "japanese";
    temp_i18n_languages["ko"] = "korean";
    temp_i18n_languages["zh-Hans"] = "simplified_chinese";
    if (
        doc.type === "agenda" ||
        doc.type === "opinion" ||
        doc.type === "tr_agenda" ||
        doc.type === "tr_opinion"
    ) {
        written_language = temp_i18n_languages[doc.language];
        if (is_loginned === false) {
            doc.name = "Gleant";
            if (doc.img.indexOf && doc.img.indexOf( "male.png") <= -1) {
                doc.img = aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
            }
        }
    } else {
        if (is_loginned === false) {
            doc.blog_name = "Gleant";
            if (doc.type === "blog") {
                if (doc.img.indexOf && doc.img.indexOf( "male.png") <= -1) {
                    doc.img = aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                }
            }
        }
    }
    if (
        doc['type'] === 'agenda' ||
        doc['type'] === 'tr_agenda'
    ) {
        if (is_mobile() === true) {
            space = "<br>";
        } else {
            space = " &#183; ";
        }
        if (doc['public_authority'] === 1) {
            writing_authority = "<span class='green'>" + i18n[lang].public + "</span>";
        } else {
            writing_authority = "<span class='red'>" + i18n[lang].invited_users + "</span>";
        }
        /*if (doc['opinion_authority'] === 1) {
            writing_authority = writing_authority + space + i18n[lang].opinion_writing + " (<span class='green'>" + i18n[lang].all_users + "</span>)" + space;
        } else {
            writing_authority = writing_authority + space + i18n[lang].opinion_writing + " (<span class='red'>" + i18n[lang].invited_users + "</span>)" + space;
        }
        if (doc['translation_authority'] === 1) {
            writing_authority = writing_authority + i18n[lang].translation_writing + " (<span class='green'>" + i18n[lang].all_users + "</span>)" + space;
        } else {
            writing_authority = writing_authority + i18n[lang].translation_writing + " (<span class='red'>" + i18n[lang].invited_users + "</span>)" + space;
        }
        if (doc['comment_authority'] === 1) {
            writing_authority = writing_authority + i18n[lang].comment_writing + " (<span class='green'>" + i18n[lang].all_users + "</span>)";
        } else {
            writing_authority = writing_authority + i18n[lang].comment_writing + " (<span class='red'>" + i18n[lang].invited_users + "</span>)";
        }*/
        writing_authority = "<div>" + writing_authority + "</div>";
        members_list = "";
        members_btn_list = "";
        for (var x = 0; x < doc['members'].length; x++) {
            if (doc.type === "agenda") {
                member_item_class = doc._id + "_member_item_" + doc['members'][x];
            } else {
                member_item_class = doc.agenda_id + "_member_item_" + doc['members'][x];
            }
            if (is_loginned === true) {
                temp = "<a class='debate-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
            } else {
                temp = "<a class='not-logged-in debate-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
            }
            members_list = members_list + temp;
            if (is_loginned === true && doc['members'][x] === current_user_blog_id) {
                members_btn_list = "<span class='btn-debate-exit'>" + i18n[lang].exit + "</span>";
                is_member = true;
            }
        }
        if (is_loginned === true) {
            if (doc['type'] === 'agenda') {
                if (doc['blog_id'] === current_user_blog_id) {
                    members_btn_list = members_btn_list + "<span class='btn-debate-invite'>" + i18n[lang].invite + "</span>";
                }
            } else {
                if (doc['root_blog_id'] === current_user_blog_id) {
                    members_btn_list = members_btn_list + "<span class='btn-debate-invite'>" + i18n[lang].invite + "</span>";
                }
            }
        }
        temp = "<span>" + i18n[lang].invited_users + "</span>";
        temp = "<div class='debate-member-title'>" + members_btn_list + temp + "</div>";
        members_list = "<div class='debate-member-item-wrapper'>" + members_list + "</div>";
        members_wrapper = "<div class='debate-members-wrapper'>" + temp + members_list + "</div>";
        if (
            doc['opinion_authority'] === 1 &&
            doc['translation_authority'] === 1 &&
            doc['comment_authority'] === 1
        ) {
            if (doc.is_member === false) {
                members_wrapper = "";
            }
        }
        written_debate_info = "<div class='written-debate-info'>" + writing_authority + members_wrapper + "</div>";
    } else {
        written_debate_info = "";
    }
    if (
        doc['type'] === 'agenda' ||
        doc['type'] === 'opinion' ||
        doc['type'] === 'tr_agenda' ||
        doc['type'] === 'tr_opinion'
    ) {
        if (
            doc['type'] === 'agenda' ||
            doc['type'] === 'tr_agenda'
        ) {
            if (doc['is_start_set'] === true) {
                if (doc['start_at'] > datetime) {
                    class_debate_status = "debate-scheduled";
                    debate_status = i18n[lang].scheduled;
                } else {
                    if (doc['is_finish_set'] === true) {
                        if (doc['finish_at'] > datetime) {
                            class_debate_status = "debate-in-progress";
                            debate_status = i18n[lang].in_progress;
                        } else {
                            class_debate_status = "debate-finished";
                            debate_status = i18n[lang].finished;
                        }
                    } else {
                        class_debate_status = "debate-unlimited";
                        debate_status = i18n[lang].unlimited;
                    }
                }
            } else {
                if (doc['is_finish_set'] === true) {
                    if (doc['finish_at'] > datetime) {
                        class_debate_status = "debate-in-progress";
                        debate_status = i18n[lang].in_progress;
                    } else {
                        class_debate_status = "debate-finished";
                        debate_status = i18n[lang].finished;
                    }
                } else {
                    class_debate_status = "debate-unlimited";
                    debate_status = i18n[lang].unlimited;
                }
            }
            written_debate_status = "";/*"<div class='debate-status " + class_debate_status + "' data-is-start-set='" + doc['is_start_set'] + "' data-start-at='" + doc['start_at'] + "' data-is-finish-set='" + doc['is_finish_set'] + "' data-finish-at='" + doc['finish_at'] + "' data-print-type='perfect'>" + debate_status + "</div>";*/
            article_type = i18n[lang].agenda;
        } else {
            written_debate_status = "";
            article_type = i18n[lang].opinion;
        }
        if (doc['public_authority'] === 1) {
            temp = "<span class='green'>" + i18n[lang].public + "</span>";
        } else {
            temp = "<span class='red'>" + i18n[lang].invited_users + "</span>";
        }
        if (
            doc['type'] === 'agenda' ||
            doc['type'] === 'opinion'
        ) {
            if (doc['type'] === 'agenda') {
                /*temp = i18n[lang][written_language] + " &#183; " + i18n[lang].original;*/
                temp = "";
            } else {
                /*temp = temp + " &#183; " + i18n[lang][written_language] + " &#183; " + i18n[lang].original;*/
            }
        } else {
            if (doc['type'] === 'tr_agenda') {
                /*temp = i18n[lang][written_language] + " &#183; " + i18n[lang].translation;*/
                temp = "";
            } else {
                /*temp = temp + " &#183; " + i18n[lang][written_language] + " &#183; " + i18n[lang].translation;*/
            }
        }
        temp_list = written_debate_status + written_debate_info + "<div>" + temp + "</div>";
    } else {
        if (doc.language === undefined || doc.language === "") {
            written_language = "";
        } else if (doc.language === "en") {
            written_language = "english";
        } else if (doc.language === "ja") {
            written_language = "japanese";
        } else if (doc.language === "ko") {
            written_language = "korean";
        } else if (doc.language === "zh-Hans") {
            written_language = "simplified_chinese";
        } else {
            written_language = "english";
        }
        temp = "";
        /*if (written_language === "") {
            temp = "";
        } else {
            temp = " &#183; " + i18n[lang][written_language];
        }*/
        if (doc['type'] === 'gallery' && doc['is_profile'] === true) {
            temp2 = " &#183; " + i18n[lang].profile_photo;
        } else {
            temp2 = "";
        }
        if (doc['public_authority'] === 0) {
            temp_list = "<div>" + "<span class='red'>" + i18n[lang].only_me + "</span>" + temp + temp2 + "</div>";
        } else if (doc['public_authority'] === 1) {
            temp_list = "<div>" + "<span class='green'>" + i18n[lang].public + "</span>" + temp + temp2 + "</div>";
        } else if (doc['public_authority'] === 2) {
            temp_list = "<div>" + "<span class='yellow'>" + i18n[lang].friends + "</span>" + temp + temp2 + "</div>";
        }
    }
    for (var i = 0; i < doc['tags'].length; i++) {
        temp = "<div class='written-tag'>" + get_encoded_html_preventing_xss(doc['tags'][i]) + "</div>";
        temp_list = temp_list + "<a href='/search?w=tot&q=" + encode_for_url(doc['tags'][i]) + "'>" + temp + "</a>";
    }
    if (temp_list === "") {
        written_top = "";
    } else {
        written_top = "<div class='written-top'>" + temp_list + "</div>";
    }
    var written_article_title = 'written-' + doc['type'] + '-title'
        , written_article_content = 'written-' + doc['type'] + '-content'
        , written_article = 'written-' + doc['type'];
    var open_parent = "";
    temp = get_encoded_html_preventing_xss(doc['title']);
    temp = "<div class='written-title " + written_article_title + "'>" + temp + "</div>";
    if (doc['type'] === 'opinion') {
        if (doc['is_removed'] === true) {
            open_parent = "";
        } else {
            open_parent = "<div class='open-parent open-agenda'" +
                " data-type='agenda'" +
                " data-link='/agenda/" + doc['agenda_id'] + "'" +
                ">" + i18n[lang].view_agenda + "</div>";
        }
    }
    if (doc['type'] === 'tr_agenda') {
        open_parent = "<div class='open-parent open-original'" +
            " data-type='agenda'" +
            " data-id='" + doc['agenda_id'] + "'" +
            ">" + i18n[lang].view_original + "</div>";
    }
    if (doc['type'] === 'tr_opinion') {
        open_parent = "<div class='open-parent open-original'" +
            " data-type='opinion'" +
            " data-id='" + doc['opinion_id'] + "'" +
            " data-agenda-id='" + doc['agenda_id'] + "'" +
            ">" + i18n[lang].view_original + "</div>";
    }
    written_title_wrapper = "<div class='written-title-wrapper'>" + open_parent + temp + "</div>";
    if (doc['type'] === 'blog' || doc['type'] === 'gallery') {
        if (doc['title'] === '') {
            written_title_wrapper = "";
        }
    }
    var user_profile_left
        , user_profile_right;
    if (
        doc['type'] === 'agenda' ||
        doc['type'] === 'opinion' ||
        doc['type'] === 'tr_agenda' ||
        doc['type'] === 'tr_opinion'
    ) {
        temp = "<img src='" + doc['img'] + "' alt='" + get_encoded_html_preventing_xss(doc['name']) + "' title='" + get_encoded_html_preventing_xss(doc['name']) + "'>";
        temp = "<a href='/blog/" + doc['blog_id'] + "' target='_blank'>" + temp + "</a>";
        temp2 = "<div class='simple-profile-mouseentered-prompt'></div>";
        temp = "<div class='simple-profile-prompt-box in-written' data-link='/blog/" + doc['blog_id'] + "'>" + temp + temp2 + "</div>";
        user_profile_left = "<div class='user-profile-left'>" + temp + "</div>";
        if (is_loginned === true) {
            temp = "<span class='user-name'>" + get_encoded_html_preventing_xss(doc['name']) + "</span>";
        } else {
            temp = "<span class='user-name not-logged-in'>" + get_encoded_html_preventing_xss(doc['name']) + "</span>";
        }
        temp = "<a class='user-name-wrapper' href='/blog/" + doc['blog_id'] + "' target='_blank'>" + temp + "</a>";
        temp2 = "<div class='simple-profile-mouseentered-prompt'></div>";
        temp = "<div class='simple-profile-prompt-box in-written' data-link='/blog/" + doc['blog_id'] + "'>" + temp + temp2 + "</div>";
        temp2 = "<span class='separator'></span>";
        if (
            doc['type'] === 'agenda' ||
            doc['type'] === 'opinion'
        ) {
            if (is_loginned === true) {
                temp3 = "<span class='user-info'>" + get_encoded_html_preventing_xss(doc['profile']) + "</span>";
            } else {
                temp3 = "<span class='user-info not-logged-in'>" + get_encoded_html_preventing_xss(doc['profile']) + "</span>";
            }
        } else {
            temp3 = "";
        }
        temp = "<div>" + temp + temp2 + temp3 + "</div>";
        if (doc["created_at"] === doc["updated_at"]) {
            temp2 = "<div class='created-at' data-datetime='" + doc["created_at"] + "'>" + to_i18n_datetime(new Date(doc["created_at"])) + "</div>";
        } else {
            temp2 = "<div class='created-at' data-datetime='" + doc["created_at"] + "'>" + to_i18n_datetime(new Date(doc["created_at"])) + "</div>" +
                "<div class='updated-at' data-datetime='" + doc["updated_at"] + "'>" + i18n[lang].edit + " " + to_i18n_datetime(new Date(doc["updated_at"])) + "</div>";
        }
        temp2 = "<a class='updated-at-wrapper' href='" + data_link + "' target='_blank'>" + temp2 + "</a>";
        user_profile_right = "<div class='user-profile-right'>" + temp + temp2 + "</div>";
        user_profile = "<div class='user-profile'>" + user_profile_left + user_profile_right + "</div>";
    } else {
        if (doc["created_at"] === doc["updated_at"]) {
            temp = "<div class='created-at' data-datetime='" + doc["created_at"] + "'>" + to_i18n_datetime(new Date(doc["created_at"])) + "</div>";
        } else {
            temp = "<div class='created-at' data-datetime='" + doc["created_at"] + "'>" + to_i18n_datetime(new Date(doc["created_at"])) + "</div>" +
                "<div class='updated-at' data-datetime='" + doc["updated_at"] + "'>" + i18n[lang].edit + " " + to_i18n_datetime(new Date(doc["updated_at"])) + "</div>";
        }
        user_profile = "<a class='updated-at-wrapper' href='" + data_link + "'>" + temp + "</a>";
    }
    if (doc['type'] === 'gallery') {
        temp = "<img src='" + doc['img'] + "' style='max-width:100%;'>";
        temp = "<div style='text-align:center;width:100%;'>" + temp + "</div>";
        temp2 = "<div>" + get_encoded_html_preventing_xss(doc['content']) + "</div>";
        written_content = "<div class='written-content " + written_article_content + "'>" + temp + temp2 + "</div>";
    } else {
        written_content = "<div class='written-content " + written_article_content + "'>" + doc['content'] + "</div>";
    }
    var view_counts = ""
        , comments_counts = ""
        , written_opinion_counts = ""
        , requested_opinion_counts = ""
        , written_translation_counts = ""
        , requested_translation_counts = ""
        , total_count_written_translations = 0;
    if (doc['type'] === 'gallery' ||
        doc['type'] === 'blog') {
        doc['count_view'] = doc['count_view'] + 1;
    }
    if (doc['count_view'] > 0) {
        temp = "<img src='" + aws_s3_url + "/icons/view-selected.png" + css_version + "' title='" + i18n[lang].view + "' alt='" + i18n[lang].view + "'>";
        temp2 = "<span>" + put_comma_between_three_digits(doc['count_view']) + "</span>";
        view_counts = "<div class='view-counts' data-count='" + doc['count_view'] + "'>" + temp + temp2 + "</div>";
    }
    if (doc['type'] === "agenda") {
        if (doc['count_written_opinions'] > 0) {
            temp = "<img src='" + aws_s3_url + "/icons/write-opinion-selected.png" + css_version + "' title='" + i18n[lang].opinion + "' alt='" + i18n[lang].opinion + "'>";
            temp2 = "<span>" + put_comma_between_three_digits(doc['count_written_opinions']) + "</span>";
            written_opinion_counts = "<div class='written-opinion-counts' data-count='" + doc['count_written_opinions'] + "'>" + temp + temp2 + "</div>";
        }
        if (doc['count_requested_opinions'] > 0) {
            temp = "<img src='" + aws_s3_url + "/icons/request-opinion-selected.png" + css_version + "' title='" + i18n[lang].opinion_request + "' alt='" + i18n[lang].opinion_request + "'>";
            temp2 = "<span>" + put_comma_between_three_digits(doc['count_requested_opinions']) + "</span>";
            requested_opinion_counts = "<div class='requested-opinion-counts' data-count='" + doc['count_requested_opinions'] + "'>" + temp + temp2 + "</div>";
        }
    }
    if (
        doc['type'] === "agenda" || doc['type'] === "opinion"
    ) {
        /*for (var j = 0; j < doc["count_written_translations"].length; j++) {
            if (doc["count_written_translations"][j].count < 0) {
                doc["count_written_translations"][j].count = 0;
            }
            total_count_written_translations = total_count_written_translations + doc["count_written_translations"][j].count;
        }
        if (total_count_written_translations > 0) {
            temp = "<img src='" + aws_s3_url + "/icons/write-translation-selected.png" + css_version + "' title='" + i18n[lang].translation + "' alt='" + i18n[lang].translation + "'>";
            temp2 = "<span>" + put_comma_between_three_digits(total_count_written_translations) + "</span>";
            written_translation_counts = "<div class='written-translation-counts' data-count='" + total_count_written_translations + "'>" + temp + temp2 + "</div>";
        }
        if (doc['count_requested_translations'] > 0) {
            temp = "<img src='" + aws_s3_url + "/icons/request-translation-selected.png" + css_version + "' title='" + i18n[lang].translation_request + "' alt='" + i18n[lang].translation_request + "'>";
            temp2 = "<span>" + put_comma_between_three_digits(doc['count_requested_translations']) + "</span>";
            requested_translation_counts = "<div class='requested-translation-counts' data-count='" + doc['count_requested_translations'] + "'>" + temp + temp2 + "</div>";
        }*/
        written_translation_counts = "";
        requested_translation_counts = "";
    }
    var btn_awesome = ""
        , btn_opinion = ""
        , btn_translation = ""
        , btn_translation_mobile = ""
        , btn_open_comments = ""
        , btn_open_comments_mobile = ""
        , btn_share_desktop = ""
        , btn_report_desktop = ""
        , btn_report_mobile = ""
        , btn_subscribe_desktop = ""
        , btn_subscribe_mobile = ""
        , btn_ellipsis_mobile = ""
        , data_translation_language_list = ""
        , data_translation_count_list = ""
        , real_count;
    if (current_user_blog_id === null) {
        temp = "<img src='" + aws_s3_url + "/icons/awesome.png" + css_version + "'>";
        temp2 = "<span>" + i18n[lang].awesome + "</span>";
        if (doc['count_awesome'] > 0) {
            real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_awesome']) + "</span>";
        } else {
            real_count = "<span class='real-count'></span>";
        }
        btn_awesome = "<div class='btn-awesome awesome-" + doc['type'] + "' data-count='" + doc['count_awesome'] + "'>" + temp + temp2 + real_count + "</div>";
    } else {
        var is_awesome = false;
        for (var i = 0; i < doc['likers'].length; i++) {
            if (current_user_blog_id === doc['likers'][i]) {
                is_awesome = true;
                break;
            }
        }
        if (doc['count_awesome'] > 0) {
            real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_awesome']) + "</span>";
        } else {
            real_count = "<span class='real-count'></span>";
        }
        if (is_awesome === true) {
            temp = "<img src='" + aws_s3_url + "/icons/awesome-selected.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].awesome + "</span>";
            btn_awesome = "<div class='btn-awesome selected loginned awesome-" + doc['type'] + "'" +
                " data-type='" + doc['type'] + "'" +
                " data-blog-id='" + doc['blog_id'] + "'" +
                " data-blog-menu-id='" + doc['blog_menu_id'] + "'" +
                " data-count='" + doc['count_awesome'] + "'" +
                " data-id='" + doc['_id'] + "'>" + temp + temp2 + real_count + "</div>";
        } else {
            temp = "<img src='" + aws_s3_url + "/icons/awesome.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].awesome + "</span>";
            btn_awesome = "<div class='btn-awesome loginned awesome-" + doc['type'] + "'" +
                " data-type='" + doc['type'] + "'" +
                " data-blog-id='" + doc['blog_id'] + "'" +
                " data-blog-menu-id='" + doc['blog_menu_id'] + "'" +
                " data-count='" + doc['count_awesome'] + "'" +
                " data-id='" + doc['_id'] + "'>" + temp + temp2 + real_count + "</div>";
        }
    }
    temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/comments.png" + css_version + "'>";
    temp2 = "<span>" + i18n[lang].comments + "</span>";
    if (doc['count_comments'] > 0) {
        real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_comments']) + "</span>";
    } else {
        real_count = "<span class='real-count'></span>";
    }
    if (
        doc['type'] === 'agenda' ||
        doc['type'] === 'opinion'
    ) {
        btn_open_comments = "<div class='btn-open-comments written-btn-desktop-only' data-type='" + doc['type'] + "' data-count='" + doc['count_comments'] + "'>" + temp + temp2 + real_count + "</div>";
        btn_open_comments_mobile = "<li class='btn-open-comments-mobile' data-type='" + doc['type'] + "' data-count='" + doc['count_comments'] + "'>" + temp + temp2 + real_count + "</li>";
    } else {
        btn_open_comments = "<div class='btn-open-comments' data-type='" + doc['type'] + "' data-count='" + doc['count_comments'] + "'>" + temp + temp2 + real_count + "</div>";
        btn_open_comments_mobile = "";
    }
    if (doc['type'] === 'agenda') {
        temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/write-opinion.png" + css_version + "'>";
        temp2 = "<span>" + i18n[lang].opinion + "</span>";
        if (doc['count_written_opinions'] < 0) {
            doc['count_written_opinions'] = 0;
        }
        if (doc['count_written_opinions'] > 0) {
            real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_written_opinions']) + "</span>";
        } else {
            real_count = "<span class='real-count'></span>";
        }
        btn_opinion = "<div class='btn-opinion' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-blog-id='" + doc['blog_id'] + "' data-count='" + doc['count_written_opinions'] + "' data-is-modal='" + is_modal + "'>" + temp + temp2 + real_count + "</div>";
    }
    if (
        doc['type'] === 'agenda' ||
        doc['type'] === 'opinion'
    ) {
        temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/write-translation.png" + css_version + "'>";
        temp2 = "<span>" + i18n[lang].translation + "</span>";
        if (total_count_written_translations > 0) {
            real_count = "<span class='real-count'>" + put_comma_between_three_digits(total_count_written_translations) + "</span>";
        } else {
            real_count = "<span class='real-count'></span>";
        }
        for (var i = 0; i < doc['count_written_translations'].length; i++) {
            if (doc['language'] !== doc['count_written_translations'][i].language) {
                if (data_translation_language_list === "") {
                    data_translation_language_list = doc['count_written_translations'][i].language;
                    data_translation_count_list = doc['count_written_translations'][i].count;
                } else {
                    data_translation_language_list = data_translation_language_list + "," + doc['count_written_translations'][i].language;
                    data_translation_count_list = data_translation_count_list + "," + doc['count_written_translations'][i].count;
                }
            }
        }
        if (doc['type'] === 'agenda') {
            /*
            btn_translation = "<div class='btn-translation written-btn-desktop-only' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-blog-id='" + doc['blog_id'] + "' data-count='" + total_count_written_translations + "' data-translation-language-list='" + data_translation_language_list + "' data-translation-count-list='" + data_translation_count_list + "'>" + temp + temp2 + real_count + "</div>";
            btn_translation_mobile = "<li class='btn-translation-mobile' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-blog-id='" + doc['blog_id'] + "' data-count='" + total_count_written_translations + "' data-translation-language-list='" + data_translation_language_list +"' data-translation-count-list='" + data_translation_count_list + "'>" + temp + temp2 + real_count + "</li>";
            */
            btn_translation = "";
            btn_translation_mobile = "";
        } else {
            /*
            btn_translation = "<div class='btn-translation' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-agenda-id='" + doc['agenda_id'] + "' data-blog-id='" + doc['blog_id'] + "' data-count='" + total_count_written_translations + "' data-translation-language-list='" + data_translation_language_list + "' data-translation-count-list='" + data_translation_count_list + "'>" + temp + temp2 + real_count + "</div>";
            btn_translation_mobile = "";
            */
            btn_translation = "";
            btn_translation_mobile = "";
        }
        temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/share2.png" + css_version + "'>";
        temp2 = "<span>" + i18n[lang].share + "</span>";
        btn_share_desktop = "<div class='btn-share-desktop written-btn-desktop-only'>" + temp + temp2 + "</div>";
        if (current_user_blog_id !== null) {
            temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/report.png" + css_version + "'>";
            temp = temp + "<span>" + i18n[lang].report + "</span>";
            btn_report_desktop = "<div class='btn-report-desktop written-btn-desktop-only report-article' data-type='" + doc['type'] + "'>" + temp + "</div>";
            btn_report_mobile = "<li class='btn-report-mobile report-article' data-type='" + doc['type'] + "'>" + temp + "</li>";
        }
    } else if (
        doc['type'] === 'tr_agenda' ||
        doc['type'] === 'tr_opinion'
    ) {
        temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/share2.png" + css_version + "'>";
        temp2 = "<span>" + i18n[lang].share + "</span>";
        btn_share_desktop = "<div class='btn-share-desktop written-btn-desktop-only'>" + temp + temp2 + "</div>";
        if (current_user_blog_id !== null) {
            temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/report.png" + css_version + "'>";
            temp = temp + "<span>" + i18n[lang].report + "</span>";
            btn_report_desktop = "<div class='btn-report-desktop written-btn-desktop-only report-article' data-type='" + doc['type'] + "'>" + temp + "</div>";
            btn_report_mobile = "<li class='btn-report-mobile report-article' data-type='" + doc['type'] + "'>" + temp + "</li>";
        }
    } else {
        btn_share_desktop = "";
        btn_report_desktop = "";
        btn_report_mobile = "";
    }
    if (current_user_blog_id !== null) {
        var is_subscribed = false;
        for (var i = 0; i < doc['subscribers'].length; i++) {
            if (current_user_blog_id === doc['subscribers'][i]) {
                is_subscribed = true;
                break;
            }
        }
        if (is_subscribed === true) {
            temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/subscription-selected.png" + css_version + "'>";
            temp = temp + "<span>" + i18n[lang].subscription + " ✔" + "</span>";
            btn_subscribe_desktop = "<div class='btn-unsubscribe-desktop written-btn-desktop-only'" +
                    " data-type='" + doc['type'] + "'" +
                    " data-blog-id='" + doc['blog_id'] + "'" +
                    " data-blog-menu-id='" + doc['blog_menu_id'] + "'" +
                    " data-id='" + doc['_id'] + "'>" + temp + "</div>";
            btn_subscribe_mobile = "<li class='btn-unsubscribe-mobile'" +
                    " data-type='" + doc['type'] + "'" +
                    " data-blog-id='" + doc['blog_id'] + "'" +
                    " data-blog-menu-id='" + doc['blog_menu_id'] + "'" +
                    " data-id='" + doc['_id'] + "'>" + temp + "</li>";
        } else {
            temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/subscription.png" + css_version + "'>";
            temp = temp + "<span>" + i18n[lang].subscription + "</span>";
            btn_subscribe_desktop = "<div class='btn-subscribe-desktop written-btn-desktop-only'" +
                    " data-type='" + doc['type'] + "'" +
                    " data-blog-id='" + doc['blog_id'] + "'" +
                    " data-blog-menu-id='" + doc['blog_menu_id'] + "'" +
                    " data-id='" + doc['_id'] + "'>" + temp + "</div>";
            btn_subscribe_mobile = "<li class='btn-subscribe-mobile'" +
                    " data-type='" + doc['type'] + "'" +
                    " data-blog-id='" + doc['blog_id'] + "'" +
                    " data-blog-menu-id='" + doc['blog_menu_id'] + "'" +
                    " data-id='" + doc['_id'] + "'>" + temp + "</li>";
        }
    } else {
        btn_subscribe_desktop = "";
        btn_subscribe_mobile = "";
    }
    temp = "<img src='" + aws_s3_url + "/icons/ellipsis-grey.png" + css_version + "' class='btn-ellipsis-mobile-img'>";
    if (
        doc['type'] === 'agenda' ||
        doc['type'] === 'opinion' ||
        doc['type'] === 'tr_agenda' ||
        doc['type'] === 'tr_opinion'
    ) {
        temp2 = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/share2.png" + css_version + "'>";
        temp2 = temp2 + "<span>" + i18n[lang].share + "</span>";
        temp2 = "<li class='btn-share-mobile'>" + temp2 + "</li>";
    } else {
        temp2 = "";
    }
    temp2 = "<ul style='display:none;'>" + btn_translation_mobile + btn_open_comments_mobile + btn_subscribe_mobile + btn_report_mobile + temp2 + "</ul>";
    btn_ellipsis_mobile = "<div class='btn-ellipsis-mobile'>" + temp + temp2 + "</div>";
    written_btns_wrapper = "<div class='written-btns-wrapper'>" + view_counts + btn_awesome + btn_opinion + btn_translation + btn_open_comments + btn_share_desktop + btn_report_desktop + btn_subscribe_desktop + btn_ellipsis_mobile + "</div>";
    comments_wrapper = "<div class='comments-wrapper outer-comments'></div>";
    if (doc['type'] === 'agenda') {
        write_opinion_wrapper = "<div class='write-opinion-wrapper'></div>";
        request_opinion_wrapper = "<div class='request-opinion-wrapper'></div>";
    }
    if (
        doc['type'] === 'agenda' ||
        doc['type'] === 'opinion'
    ) {
        /*write_translation_wrapper = "<div class='write-translation-wrapper' data-lang='" + doc.language + "'></div>";
        request_translation_wrapper = "<div class='request-translation-wrapper' data-lang='" + doc.language + "'></div>";
        temp3 = "<div class='translation-list'></div>";
        temp4 = "<div class='btn-more translation-more'><img class='btn-more-down-14' src='" + aws_s3_url +  "/icons/more-down.png" + css_version + "'></div>";
        temp3 = "<div class='translation-list-inner-wrapper'>" + temp3 + temp4 + "</div>";
        translation_list_wrapper = "<div class='translation-list-wrapper'>" + temp3 + "</div>";*/
        write_translation_wrapper = "";
        request_translation_wrapper = "";
        translation_list_wrapper = "";
    }
    if (doc['type'] === 'agenda') {
        var opinion_list_type = "agenda";
        if ($('#opinion-list-of-agenda-modal').length === 0) {
            opinion_list_type = "agenda-modal";
        }
        if (doc['count_written_opinions'] < 0) {
            doc['count_written_opinions'] = 0;
        }
        temp3 = "<div id='opinion-list-of-" + opinion_list_type + "'></div>";
        temp4 = "<div id='opinion-more-of-" + opinion_list_type + "' class='btn-more list-more'><img class='btn-more-down-14' src='" + aws_s3_url + "/icons/more-down.png" + css_version + "'></div>";
        opinion_of_agenda = "<div class='opinion-of-agenda'>" + temp3 + temp4 + "</div>";
    } else {
        opinion_of_agenda = "";
    }
    var article_class
        , written;
    if (doc['type'] === 'opinion' && doc['is_removed'] === true) {
        edit = "";
        written_top = "";
        written_link = "";
        user_profile = "";
        written_content = "";
        written_btns_wrapper = "";
        comments_wrapper = "";
        opinion_of_agenda = "";
        written = "<div class='written " + written_article +
            "' data-created-at='" + data_created_at +
            "' data-updated-at='" + data_updated_at +
            "' data-type='" + doc['type'] +
            "'>" +
            written_top +
            written_title_wrapper +
            "</div>";
    } else {
        article_class = doc['type'] + "-" + doc['_id'];
        written = "<div id='" + id + "' class='written " + written_article + " " + article_class +
            "' data-link='" + data_link +
            "' data-created-at='" + data_created_at +
            "' data-updated-at='" + data_updated_at +
            "' data-type='" + doc['type'] +
            "' data-lang='" + doc['language'] +
            "' data-blog-id='" + doc['blog_id'] +
            "' data-id='" + doc['_id'] +
            "' data-agenda-id='" + doc['agenda_id'] +
            "' data-opinion-id='" + doc['opinion_id'] +
            "' data-blog-menu-id='" + doc['blog_menu_id'] +
            "' data-class='" + article_class +
            "' data-print-type='perfect" +
            "'>" +
            edit +
            written_top +
            written_title_wrapper +
            user_profile +
            written_content +
            written_link +
            written_btns_wrapper +
            comments_wrapper +
            write_opinion_wrapper +
            request_opinion_wrapper +
            write_translation_wrapper +
            request_translation_wrapper +
            translation_list_wrapper +
            opinion_of_agenda +
            "</div>";
    }
    return written;
};
get["single"]["normal"]["employment"] = function (doc) {
    var lang = $("body").attr("data-lang")
        , css_version = $("body").attr("data-css-version")
        , is_loginned = $("body").attr("data-check") === "true"
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null
        , written_language
        , name
        , simple_profile_mouseentered_prompt
        , simple_profile_prompt_box
        , article_item_top
        , article_item_updated_at
        , thumbnail
        , temp
        , temp2
        , written_online_interview_status = ""
        , class_online_interview_status = "online-interview-unlimited"
        , online_interview_status
        , datetime = new Date().valueOf();
    if (lang === undefined) {
        lang = "en";
    }
    if (user_profile_link === "/set/blog-id") {
        is_loginned = false;
    } else {
        if (user_profile_link) {
            current_user_blog_id = user_profile_link.split('/')[2];
        }
    }
    if (is_loginned === false) {
        if (doc.type === 'hire_me') {
            return "";
        } else {
            doc.name = "Gleant";
            if (doc.img.indexOf && doc.img.indexOf( "male.png") <= -1) {
                doc.img = aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
            }
        }
    }
    online_interview_status = i18n[lang].unlimited;
    if (doc.language === "en") {
        written_language = "english";
    } else if (doc.language === "ja") {
        written_language = "japanese";
    } else if (doc.language === "ko") {
        written_language = "korean";
    } else if (doc.language === "zh-Hans") {
        written_language = "simplified_chinese";
    } else {
        written_language = "english";
    }
    if (doc['type'] === 'apply_now') {
        name = "<a href='/blog/" + doc["blog_id"] + "'>" + get_encoded_html_preventing_xss(doc["company"]) + "</a>";
        simple_profile_prompt_box = "<div>" + name + "</div>";
    } else if (doc['type'] === 'hire_me') {
        name = "<a href='/blog/" + doc["blog_id"] + "'>" + get_encoded_html_preventing_xss(doc["name"]) + "</a>";
        simple_profile_mouseentered_prompt = "<div class='simple-profile-mouseentered-prompt'></div>";
        simple_profile_prompt_box = "<div class='simple-profile-prompt-box in-body' data-link='/blog/" + doc["blog_id"] + "'>" + name + simple_profile_mouseentered_prompt + "</div>";
    } else {
        return "";
    }
    if (doc['type'] === 'apply_now') {
        if (doc['is_online_interview_set'] === true) {
            if (doc['is_start_set'] === true) {
                if (doc['start_at'] > datetime) {
                    class_online_interview_status = "online-interview-scheduled";
                    online_interview_status = i18n[lang].online_interview + " " + i18n[lang].scheduled;
                } else {
                    if (doc['is_finish_set'] === true) {
                        if (doc['finish_at'] > datetime) {
                            class_online_interview_status = "online-interview-in-progress";
                            online_interview_status = i18n[lang].online_interview + " " + i18n[lang].in_progress;
                        } else {
                            class_online_interview_status = "online-interview-finished";
                            online_interview_status = i18n[lang].online_interview + " " + i18n[lang].finished;
                        }
                    } else {
                        class_online_interview_status = "online-interview-unlimited";
                        online_interview_status = i18n[lang].online_interview + " " + i18n[lang].unlimited;
                    }
                }
            } else {
                if (doc['is_finish_set'] === true) {
                    if (doc['finish_at'] > datetime) {
                        class_online_interview_status = "online-interview-in-progress";
                        online_interview_status = i18n[lang].online_interview + " " + i18n[lang].in_progress;
                    } else {
                        class_online_interview_status = "online-interview-finished";
                        online_interview_status = i18n[lang].online_interview + " " + i18n[lang].finished;
                    }
                } else {
                    class_online_interview_status = "online-interview-unlimited";
                    online_interview_status = i18n[lang].online_interview + " " + i18n[lang].unlimited;
                }
            }
            written_online_interview_status = "<div class='online-interview-status " + class_online_interview_status + "' data-is-start-set='" + doc['is_start_set'] + "' data-start-at='" + doc['start_at'] + "' data-is-finish-set='" + doc['is_finish_set'] + "' data-finish-at='" + doc['finish_at'] + "' data-print-type='normal'>" + online_interview_status + "</div>";
        } else {
            written_online_interview_status = "";
        }
    } else if (doc['type'] === 'hire_me') {
        written_online_interview_status = "";
    } else {
        return "";
    }
    if (doc['type'] === 'apply_now') {
        temp = "";
        temp2 = "";
        if (doc['country'] !== "") {
            temp = get_encoded_html_preventing_xss(doc['country']);
        }
        if (doc['city'] !== "") {
            if (temp === "") {
                temp = temp + get_encoded_html_preventing_xss(doc['city']);
            } else {
                temp = temp + " &#183; " + get_encoded_html_preventing_xss(doc['city']);
            }
        }
        if (temp !== "") {
            temp2 = "<span>" + temp + "</span>" + "<br>";
        }
        temp2 = temp2 + "<span>" + get_encoded_html_preventing_xss(doc['job']) + "</span><br>";
        thumbnail = "<img src='" + doc["logo"].replace('/resized/', '/square/') + "'>";
    } else if (doc['type'] === 'hire_me') {
        temp2 = "<span>" + get_encoded_html_preventing_xss(doc['job']) + "</span><br>";
        thumbnail = "<img src='" + doc["img"].replace('/resized/', '/square/') + "'>";
    }
    article_item_top = "<div class='article-item-top'>" + written_online_interview_status + temp2 + simple_profile_prompt_box + "</div>";
    if (doc["created_at"] === doc["updated_at"]) {
        article_item_updated_at = "<div class='article-item-updated-at created-at-small' data-datetime='" + doc["updated_at"] + "'></div>";
    } else {
        article_item_updated_at = "<div class='article-item-updated-at updated-at-small' data-datetime='" + doc["updated_at"] + "'></div>";
    }
    var thumbnail_link
        , article_item_middle;
    if (doc['type'] === 'apply_now') {
        thumbnail_link = "<a href='/apply-now/" + doc["_id"] + "'>" + thumbnail + "</a>";
    } else if (doc['type'] === 'hire_me') {
        thumbnail_link = "<a href='/hire-me/" + doc["_id"] + "'>" + thumbnail + "</a>";
    }
    article_item_middle = "<div class='article-item-middle'>" + thumbnail_link + "</div>";
    var count_img
        , count_num
        , view_counts = ""
        , youtube_inserted = "";
    if (doc.is_youtube_inserted === true) {
        youtube_inserted = "<div class='youtube-inserted'><img src='" + aws_s3_url + "/icons/youtube.png" + css_version + "' title='YouTube' alt='YouTube'></div>";
    }
    if (doc["count_view"] > 0) {
        count_img = "<img src='" + aws_s3_url + "/icons/view-selected.png" + css_version + "' title='" + i18n[lang].view + "' alt='" + i18n[lang].view + "'>";
        count_num = "<span>" + put_comma_between_three_digits(doc["count_view"]) + "</span>";
        view_counts = "<div class='view-counts' data-count='" + doc["count_view"] + "'>" + count_img + count_num + "</div>";
    }
    var awesome_counts = "";
    if (doc["count_awesome"] > 0) {
        count_img = "<img src='" + aws_s3_url + "/icons/awesome-selected.png" + css_version + "' title='" + i18n[lang].awesome + "' alt='" + i18n[lang].awesome + "'>";
        count_num = "<span>" + put_comma_between_three_digits(doc["count_awesome"]) + "</span>";
        awesome_counts = "<div class='awesome-counts' data-count='" + doc["count_awesome"] + "'>" + count_img + count_num + "</div>";
    }
    var comments_counts = "";
    if (doc["count_comments"] > 0) {
        count_img = "<img src='" + aws_s3_url + "/icons/comments-green.png" + css_version + "' title='" + i18n[lang].comments + "' alt='" + i18n[lang].comments + "'>";
        count_num = "<span>" + put_comma_between_three_digits(doc["count_comments"]) + "</span>";
        comments_counts = "<div class='comments-counts' data-count='" + doc["count_comments"] + "'>" + count_img + count_num + "</div>";
    }
    var article_item_counts_wrapper = "<div class='article-item-counts-wrapper'>" + youtube_inserted + view_counts + awesome_counts + comments_counts + "</div>";
    var article_item_bottom = "<div class='article-item-bottom'>" + get_encoded_html_preventing_xss(doc["title"]) + "</div>",
        article_data_link;
    if (doc['type'] === 'apply_now') {
        article_data_link = "/apply-now/" + doc['_id'];
    } else if (doc['type'] === 'hire_me') {
        article_data_link = "/hire-me/" + doc['_id'];
    }
    var article_item_inner = "<div class='article-item-inner' data-link='" + article_data_link +
        "' data-type='" + doc["type"] +
        "' data-updated-at='" + doc["updated_at"] + "'>" +
        article_item_top + article_item_updated_at + article_item_middle + article_item_counts_wrapper + article_item_bottom + "</div>";
    var article_class = doc['type'] + "-" + doc['_id'];
    return "<div class='article-item " + article_class + " " + doc["type"] + "-item' data-print-type='normal'>" + article_item_inner + "</div>";
};
get["single"]["perfect"]["employment"] = function (doc) {
    var lang
        , css_version = $("body").attr("data-css-version")
        , id = Date.now() + "_" + doc["_id"]
        , data_link
        , written_link
        , data_created_at = doc["created_at"]
        , data_updated_at = doc["updated_at"]
        , is_loginned = $("body").attr("data-check") === "true"
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null;
    lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (user_profile_link === "/set/blog-id") {
        is_loginned = false;
    } else {
        if (user_profile_link) {
            current_user_blog_id = user_profile_link.split('/')[2];
        }
    }
    if (doc.type === "hire_me") {
        if (is_loginned === false) {
            return "";
        }
        data_link = "/hire-me/" + doc["_id"];
    } else if (doc.type === "apply_now") {
        data_link = "/apply-now/" + doc["_id"];
        if (is_loginned === false) {
            doc.name = "Gleant";
            if (doc.img.indexOf && doc.img.indexOf( "male.png") <= -1) {
                doc.img = aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
            }
        }
    } else {
        return "";
    }
    var temp_list = ""
        , temp = ""
        , temp2 = ""
        , temp3 = ""
        , temp4 = "";
    written_link = window.location.protocol + "//" + window.location.hostname + (window.location.port === "" ? "" : ":" + window.location.port) + data_link;
    temp = "<img class='copy-article-address emoticon-x-small-img' src='" + aws_s3_url + "/icons/copy-clipboard.png' data-clipboard-text='" + written_link + "' alt='" + i18n[lang].copy_url + "' title='" + i18n[lang].copy_url + "'>";
    written_link = "<a href='" + written_link + "' target='_blank' alt='" + get_encoded_html_preventing_xss(doc['title']) + "' title='" + get_encoded_html_preventing_xss(doc['title']) + "'>" + written_link + "</a>";
    written_link = "<div class='written-link'>" +  written_link + temp + "</div>";
    var edit
        , img
        , written_language
        , company_info = ""
        , written_top
        , written_employment_info
        , writing_authority
        , members_wrapper
        , members_btn_list = ""
        , members_list
        , member_item_class
        , written_title_wrapper
        , user_profile
        , written_content
        , written_btns_wrapper
        , comments_wrapper
        , write_announcement_wrapper = ""
        , announcement_wrapper
        , answer_wrapper
        , written_online_interview_status = ""
        , class_online_interview_status = "online-interview-unlimited"
        , online_interview_status = i18n[lang].unlimited
        , datetime = new Date().valueOf()
        , is_online_interview_finished = false;
    if (current_user_blog_id === null) {
        edit = "";
    } else {
        if (doc["blog_id"] === current_user_blog_id) {
            edit = "<div class='remove employment-remove'>" + i18n[lang].remove + "</div>" +
                "<div class='edit employment-edit'>" + i18n[lang].edit + "</div>";
        } else {
            edit = "";
        }
    }
    var temp_i18n_languages = {};
    temp_i18n_languages["en"] = "english";
    temp_i18n_languages["ja"] = "japanese";
    temp_i18n_languages["ko"] = "korean";
    temp_i18n_languages["zh-Hans"] = "simplified_chinese";
    written_language = temp_i18n_languages[doc.language];
    if (doc['type'] === "apply_now") { /* Apply Now */
        if (doc['public_authority'] === 1) {
            writing_authority = "<span class='green'>" + i18n[lang].public + "</span>";
        } else {
            writing_authority = "<span class='red'>" + i18n[lang].invited_users + "</span>";
        }
        members_list = "";
        members_btn_list = "";
        if (doc['is_online_interview_set'] === true) {
            if (doc['application_authority'] === 1) {
                writing_authority = writing_authority + " &#183; " + i18n[lang].online_interview + " " + i18n[lang].application_permission + " (<span class='green'>" + i18n[lang].all_users + "</span>)" + " &#183; " + i18n[lang][written_language];
                if (doc.is_member !== true) {
                    members_wrapper = "";
                } else {
                    for (var x = 0; x < doc['members'].length; x++) {
                        member_item_class = doc._id + "_member_item_" + doc['members'][x];
                        if (is_loginned === true) {
                            temp = "<a class='employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                        } else {
                            temp = "<a class='not-logged-in employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                        }
                        members_list = members_list + temp;
                        if (is_loginned === true && doc['members'][x] === current_user_blog_id) {
                            members_btn_list = "<span class='btn-employment-exit'>" + i18n[lang].exit + "</span>";
                        }
                    }
                    if (datetime > doc['finish_at']) {
                        is_online_interview_finished = true;
                    }
                    if (is_loginned === true && is_online_interview_finished === false) {
                        if (doc['blog_id'] === current_user_blog_id) {
                            members_btn_list = members_btn_list + "<span class='btn-employment-invite'>" + i18n[lang].invite + "</span>";
                        }
                    }
                    temp = "<span>" + i18n[lang].invited_users + "</span>";
                    temp = "<div class='employment-member-title'>" + members_btn_list + temp + "</div>";
                    members_list = "<div class='employment-member-item-wrapper'>" + members_list + "</div>";
                    members_wrapper = "<div class='employment-members-wrapper'>" + temp + members_list + "</div>";
                }
            } else {
                writing_authority = writing_authority + " &#183; " + i18n[lang].online_interview + " " + i18n[lang].application_permission + " (<span class='red'>" + i18n[lang].invited_users + "</span>)" + " &#183; " + i18n[lang][written_language];
                for (var x = 0; x < doc['members'].length; x++) {
                    member_item_class = doc._id + "_member_item_" + doc['members'][x];
                    if (is_loginned === true) {
                        temp = "<a class='employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                    } else {
                        temp = "<a class='not-logged-in employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                    }
                    members_list = members_list + temp;
                    if (is_loginned === true && doc['members'][x] === current_user_blog_id) {
                        members_btn_list = "<span class='btn-employment-exit'>" + i18n[lang].exit + "</span>";
                    }
                }
                if (datetime > doc['finish_at']) {
                    is_online_interview_finished = true;
                }
                if (is_loginned === true && is_online_interview_finished === false) {
                    if (doc['blog_id'] === current_user_blog_id) {
                        members_btn_list = members_btn_list + "<span class='btn-employment-invite'>" + i18n[lang].invite + "</span>";
                    }
                }
                temp = "<span>" + i18n[lang].invited_users + "</span>";
                temp = "<div class='employment-member-title'>" + members_btn_list + temp + "</div>";
                members_list = "<div class='employment-member-item-wrapper'>" + members_list + "</div>";
                members_wrapper = "<div class='employment-members-wrapper'>" + temp + members_list + "</div>";
            }
        } else {
            members_wrapper = "";
        }
        img = "<img src='" + doc['logo'] + css_version + "'>";
        temp = "<div class='employment-company-info-left'>" + img + "</div>";
        temp2 = "<div class='employment-company-info-title'>" + get_encoded_html_preventing_xss(doc['company']) + "</div>";
        temp2 = temp2 + "<div class='employment-company-info-content'>" + get_encoded_html_preventing_xss(doc['business_type']) + "</div>";
        temp3 = "";
        if (doc['country'] !== "") {
            temp3 = get_encoded_html_preventing_xss(doc['country']);
        }
        if (doc['city'] !== "") {
            temp3 = temp3 + " " + get_encoded_html_preventing_xss(doc['city']);
        }
        if (temp3 !== "") {
            temp2 = temp2 + "<div class='employment-company-info-content'>" + temp3 + "</div>";
        }
        if (doc['url'] !== "") {
            temp3 = doc['protocol'] + "://" + doc['url'];
            temp3 = "<a href='" + temp3 + "' target='_blank'>" + temp3 + "</a>";
            temp2 = temp2 + "<div class='employment-company-info-content'>" + temp3 + "</div>";
        }
        temp2 = "<div class='employment-company-info-right'>" + temp2 + "</div>";
        company_info = temp + temp2;
        company_info = "<div class='employment-company-info'>" + company_info + "</div>";
        if (
            lang === "en" ||
            lang === "ko") {
            temp = i18n[lang].apply_now + ".";
        } else {
            temp = i18n[lang].apply_now + "。";
        }
        company_info = company_info + "<strong>" + get_encoded_html_preventing_xss(doc['job']) + "</strong>" + " " + temp + "<br>";
        company_info = "<div style='font-size:15px;'>" + company_info + "</div>";
        if (doc['decide_salary_later'] === true) {
            company_info = company_info + i18n[lang].salary + ": " + i18n[lang].decide_after_consulting;
        } else {
            temp = "per_" + doc['salary_period'];
            temp2 = "";
            for (var i = 0; i < monetary_units.length; i++) {
                if (doc["salary_unit"] === monetary_units[i].unit) {
                    temp2 = put_comma_between_three_digits(doc.salary) + " " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                }
            }
            if (temp2 === "") {
                return "";
            }
            company_info = company_info + i18n[lang][doc['employment_status']] + " " + i18n[lang][temp] + " " +  temp2;
        }
        company_info = "<div style='width:100%;padding:10px 0;'>" + company_info + "</div>";
        writing_authority = "<div>" + writing_authority + "</div>";
        written_employment_info = "<div class='written-employment-info'>" + writing_authority + members_wrapper + "</div>";
    } else {
        if (
            lang === "en" ||
            lang === "ko") {
            temp = i18n[lang].hire_me + ".";
        } else {
            temp = i18n[lang].hire_me + "。";
        }
        company_info = "<strong>" + get_encoded_html_preventing_xss(doc['job']) + "</strong>" + " " + temp + "<br>";
        company_info = "<div style='font-size:15px;'>" + company_info + "</div>";
        if (doc['decide_salary_later'] === true) {
            company_info = company_info + i18n[lang].salary + ": " + i18n[lang].decide_after_consulting;
        } else {
            temp = "per_" + doc['salary_period'];
            temp2 = "";
            for (var i = 0; i < monetary_units.length; i++) {
                if (doc["salary_unit"] === monetary_units[i].unit) {
                    temp2 = put_comma_between_three_digits(doc.salary) + " " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                }
            }
            if (temp2 === "") {
                return "";
            }
            company_info = company_info + i18n[lang][doc['employment_status']] + " " + i18n[lang][temp] + " " +  temp2;
        }
        company_info = "<div style='width:100%;padding:10px 0;'>" + company_info + "</div>";
        if (doc['public_authority'] === 1) {
            writing_authority = "<span class='green'>" + i18n[lang].public + "</span>";
            if (doc.is_member !== true) {
                members_wrapper = "";
            } else {
                members_list = "";
                members_btn_list = "";
                for (var x = 0; x < doc['members'].length; x++) {
                    member_item_class = doc._id + "_member_item_" + doc['members'][x];
                    if (is_loginned === true) {
                        temp = "<a class='employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                    } else {
                        temp = "<a class='not-logged-in employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                    }
                    members_list = members_list + temp;
                    if (is_loginned === true && doc['members'][x] === current_user_blog_id) {
                        members_btn_list = "<span class='btn-employment-exit'>" + i18n[lang].exit + "</span>";
                    }
                }
                if (is_loginned === true) {
                    if (doc['blog_id'] === current_user_blog_id) {
                        members_btn_list = members_btn_list + "<span class='btn-employment-invite'>" + i18n[lang].invite + "</span>";
                    }
                }
                temp = "<span>" + i18n[lang].invited_users + "</span>";
                temp = "<div class='employment-member-title'>" + members_btn_list + temp + "</div>";
                members_list = "<div class='employment-member-item-wrapper'>" + members_list + "</div>";
                members_wrapper = "<div class='employment-members-wrapper'>" + temp + members_list + "</div>";
            }
        } else {
            writing_authority = "<span class='red'>" + i18n[lang].invited_users + "</span>";
            members_list = "";
            members_btn_list = "";
            for (var x = 0; x < doc['members'].length; x++) {
                member_item_class = doc._id + "_member_item_" + doc['members'][x];
                if (is_loginned === true) {
                    temp = "<a class='employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                } else {
                    temp = "<a class='not-logged-in employment-member-item " + member_item_class + "' target='_blank' href='/blog/" + doc['members'][x] + "'>@" + doc['members'][x] + "</a>";
                }
                members_list = members_list + temp;
                if (is_loginned === true && doc['members'][x] === current_user_blog_id) {
                    members_btn_list = "<span class='btn-employment-exit'>" + i18n[lang].exit + "</span>";
                }
            }
            if (is_loginned === true) {
                if (doc['blog_id'] === current_user_blog_id) {
                    members_btn_list = members_btn_list + "<span class='btn-employment-invite'>" + i18n[lang].invite + "</span>";
                }
            }
            temp = "<span>" + i18n[lang].invited_users + "</span>";
            temp = "<div class='employment-member-title'>" + members_btn_list + temp + "</div>";
            members_list = "<div class='employment-member-item-wrapper'>" + members_list + "</div>";
            members_wrapper = "<div class='employment-members-wrapper'>" + temp + members_list + "</div>";
        }
        writing_authority = "<div>" + writing_authority + " &#183; " + i18n[lang][written_language] + "</div>";
        written_employment_info = "<div class='written-employment-info'>" + writing_authority + members_wrapper + "</div>";
    }
    if (doc['type'] === 'apply_now') {
        if (doc['is_online_interview_set'] === true) {
            temp = "<a class='apply-online-interview' href='/apply-online-interview/" + doc['_id'] + "'>" + i18n[lang].apply_online_interview + "</a>";
            if (doc['is_start_set'] === true) {
                if (doc['start_at'] > datetime) {
                    class_online_interview_status = "online-interview-scheduled";
                    online_interview_status = i18n[lang].online_interview + " " + i18n[lang].scheduled;
                    temp2 = "<div class='apply-online-interview-wrapper' style='display:none;'>" + temp + "</div>";
                } else {
                    if (doc['is_finish_set'] === true) {
                        if (doc['finish_at'] > datetime) {
                            class_online_interview_status = "online-interview-in-progress";
                            online_interview_status = i18n[lang].online_interview + " " + i18n[lang].in_progress;
                            temp2 = "<div class='apply-online-interview-wrapper'>" + temp + "</div>";
                        } else {
                            class_online_interview_status = "online-interview-finished";
                            online_interview_status = i18n[lang].online_interview + " " + i18n[lang].finished;
                            temp2 = "<div class='apply-online-interview-wrapper' style='display:none;'>" + temp + "</div>";
                        }
                    } else {
                        class_online_interview_status = "online-interview-unlimited";
                        online_interview_status = i18n[lang].online_interview + " " + i18n[lang].unlimited;
                        temp2 = "<div class='apply-online-interview-wrapper'>" + temp + "</div>";
                    }
                }
            } else {
                if (doc['is_finish_set'] === true) {
                    if (doc['finish_at'] > datetime) {
                        class_online_interview_status = "online-interview-in-progress";
                        online_interview_status = i18n[lang].online_interview + " " + i18n[lang].in_progress;
                        temp2 = "<div class='apply-online-interview-wrapper'>" + temp + "</div>";
                    } else {
                        class_online_interview_status = "online-interview-finished";
                        online_interview_status = i18n[lang].online_interview + " " + i18n[lang].finished;
                        temp2 = "<div class='apply-online-interview-wrapper' style='display:none;'>" + temp + "</div>";
                    }
                } else {
                    class_online_interview_status = "online-interview-unlimited";
                    online_interview_status = i18n[lang].online_interview + " " + i18n[lang].unlimited;
                    temp2 = "<div class='apply-online-interview-wrapper'>" + temp + "</div>";
                }
            }
            written_online_interview_status = "<div class='online-interview-status " + class_online_interview_status + "' data-is-start-set='" + doc['is_start_set'] + "' data-start-at='" + doc['start_at'] + "' data-is-finish-set='" + doc['is_finish_set'] + "' data-finish-at='" + doc['finish_at'] + "' data-print-type='perfect'>" + online_interview_status + "</div>";
            written_online_interview_status = written_online_interview_status + temp2;
        } else {
            written_online_interview_status = "";
        }
    } else {
        written_online_interview_status = "";
    }
    temp_list = written_online_interview_status + company_info + written_employment_info;
    for (var i = 0; i < doc['tags'].length; i++) {
        temp = "<div class='written-tag'>" + get_encoded_html_preventing_xss(doc['tags'][i]) + "</div>";
        temp_list = temp_list + "<a href='/search?w=tot&q=" + encode_for_url(doc['tags'][i]) + "' target='_blank'>" + temp + "</a>";
    }
    written_top = "<div class='written-top'>" + temp_list + "</div>";
    var written_article_title = 'written-' + doc['type'] + '-title'
        , written_article_content = 'written-' + doc['type'] + '-content'
        , written_article = 'written-' + doc['type'];
    temp = "<div class='written-title " + written_article_title + "'>" + get_encoded_html_preventing_xss(doc['title']) + "</div>";
    written_title_wrapper = "<div class='written-title-wrapper'>" + temp + "</div>";
    var user_profile_left
        , user_profile_right;
    temp = "<img src='" + doc['img'] + "' alt='" + get_encoded_html_preventing_xss(doc['name']) + "' title='" + get_encoded_html_preventing_xss(doc['name']) + "'>";
    temp = "<a href='/blog/" + doc['blog_id'] + "' target='_blank'>" + temp + "</a>";
    temp2 = "<div class='simple-profile-mouseentered-prompt'></div>";
    temp = "<div class='simple-profile-prompt-box in-written' data-link='/blog/" + doc['blog_id'] + "'>" + temp + temp2 + "</div>";
    user_profile_left = "<div class='user-profile-left'>" + temp + "</div>";
    if (is_loginned === true) {
        temp = "<span class='user-name'>" + get_encoded_html_preventing_xss(doc['name']) + "</span>";
    } else {
        temp = "<span class='not-logged-in user-name'>" + get_encoded_html_preventing_xss(doc['name']) + "</span>";
    }
    temp = "<a class='user-name-wrapper' href='/blog/" + doc['blog_id'] + "' target='_blank'>" + temp + "</a>";
    temp2 = "<div class='simple-profile-mouseentered-prompt'></div>";
    temp = "<div class='simple-profile-prompt-box in-written' data-link='/blog/" + doc['blog_id'] + "'>" + temp + temp2 + "</div>";
    temp2 = "<span class='separator'></span>";
    temp = "<div>" + temp + temp2 + "</div>";
    if (doc["created_at"] === doc["updated_at"]) {
        temp2 = "<div class='created-at' data-datetime='" + doc["created_at"] + "'></div>";
    } else {
        temp2 = "<div class='created-at' data-datetime='" + doc["created_at"] + "'></div>" +
            "<div class='updated-at' data-datetime='" + doc["updated_at"] + "'></div>";
    }
    temp2 = "<a class='updated-at-wrapper' href='" + data_link + "' target='_blank'>" + temp2 + "</a>";
    user_profile_right = "<div class='user-profile-right'>" + temp + temp2 + "</div>";
    user_profile = "<div class='user-profile'>" + user_profile_left + user_profile_right + "</div>";
    written_content = "<div class='written-content " + written_article_content + "'>" + doc['content'] + "</div>";
    var view_counts = ""
        , comments_counts = "";
    temp = "<img src='" + aws_s3_url + "/icons/view-selected.png" + css_version + "' title='" + i18n[lang].view + "' alt='" + i18n[lang].view + "'>";
    temp2 = "<span>" + put_comma_between_three_digits(doc['count_view']) + "</span>";
    view_counts = "<div class='view-counts' data-count='" + (doc['count_view']) + "'>" + temp + temp2 + "</div>";
    var btn_awesome = ""
        , btn_online_interview = ""
        , btn_announcement = ""
        , btn_announcement_mobile = ""
        , btn_open_comments = ""
        , btn_open_comments_mobile = ""
        , btn_share_desktop = ""
        , btn_report_desktop = ""
        , btn_report_mobile = ""
        , btn_subscribe_desktop = ""
        , btn_subscribe_mobile = ""
        , btn_ellipsis_mobile = "";
    if (current_user_blog_id === null) {
        temp = "<img src='" + aws_s3_url + "/icons/awesome.png" + css_version + "'>";
        temp2 = "<span>" + i18n[lang].awesome + "</span>";
        if (doc['count_awesome'] > 0) {
            real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_awesome']) + "</span>";
        } else {
            real_count = "<span class='real-count'></span>";
        }
        btn_awesome = "<div class='btn-awesome awesome-" + doc['type'] + "' data-count='" + doc['count_awesome'] + "'>" + temp + temp2 + real_count + "</div>";
    } else {
        var is_awesome = false;
        for (var i = 0; i < doc['likers'].length; i++) {
            if (current_user_blog_id === doc['likers'][i]) {
                is_awesome = true;
                break;
            }
        }
        if (doc['count_awesome'] > 0) {
            real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_awesome']) + "</span>";
        } else {
            real_count = "<span class='real-count'></span>";
        }
        if (is_awesome === true) {
            temp = "<img src='" + aws_s3_url + "/icons/awesome-selected.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].awesome + "</span>";
            btn_awesome = "<div class='btn-awesome selected loginned awesome-" + doc['type'] + "'" +
                " data-type='" + doc['type'] + "'" +
                " data-blog-id='" + doc['blog_id'] + "'" +
                " data-count='" + doc['count_awesome'] + "'" +
                " data-id='" + doc['_id'] + "'>" + temp + temp2 + real_count + "</div>";
        } else {
            temp = "<img src='" + aws_s3_url + "/icons/awesome.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].awesome + "</span>";
            btn_awesome = "<div class='btn-awesome loginned awesome-" + doc['type'] + "'" +
                " data-type='" + doc['type'] + "'" +
                " data-blog-id='" + doc['blog_id'] + "'" +
                " data-count='" + doc['count_awesome'] + "'" +
                " data-id='" + doc['_id'] + "'>" + temp + temp2 + real_count + "</div>";
        }
    }
    if (doc['type'] === 'apply_now') {
        if (doc['blog_id'] === current_user_blog_id && doc['is_online_interview_set'] === true) {
            if (doc['count_online_interview'] > 0) {
                real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_online_interview']) + "</span>";
            } else {
                real_count = "<span class='real-count'></span>";
            }
            temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/online-interview.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].online_interview + "</span>";
            btn_online_interview = "<div class='btn-online-interview' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-count='" + doc['count_online_interview'] + "' data-is-modal='true'>" + temp + temp2 + real_count + "</div>";
            if (doc['count_announcement'] > 0) {
                real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_announcement']) + "</span>";
            } else {
                real_count = "<span class='real-count'></span>";
            }
            temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/announcement2.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].announcement + "</span>";
            btn_announcement = "<div class='btn-announcement written-btn-desktop-only' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-blog-id='" + doc['blog_id'] + "' data-count='" + doc['count_announcement'] + "' data-is-modal='true'>" + temp + temp2 + real_count + "</div>";
            btn_announcement_mobile = "<li class='btn-announcement-mobile' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-blog-id='" + doc['blog_id'] + "' data-count='" + doc['count_announcement'] + "' data-is-modal='true'>" + temp + temp2 + real_count + "</li>";
        } else {
            if (doc['count_announcement'] > 0) {
                real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_announcement']) + "</span>";
            } else {
                real_count = "<span class='real-count'></span>";
            }
            temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/announcement2.png" + css_version + "'>";
            temp2 = "<span>" + i18n[lang].announcement + "</span>";
            btn_announcement = "<div class='btn-announcement' data-type='" + doc['type'] + "' data-id='" + doc['_id'] + "' data-blog-id='" + doc['blog_id'] + "' data-count='" + doc['count_announcement'] + "' data-is-modal='true'>" + temp + temp2 + real_count + "</div>";
        }
        if (doc['count_comments'] > 0) {
            real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_comments']) + "</span>";
        } else {
            real_count = "<span class='real-count'></span>";
        }
        temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/comments.png" + css_version + "'>";
        temp2 = "<span>" + i18n[lang].comments + "</span>";
        btn_open_comments = "<div class='btn-open-comments written-btn-desktop-only' data-type='" + doc['type'] + "' data-count='" + doc['count_comments'] + "'>" + temp + temp2 + real_count + "</div>";
        btn_open_comments_mobile = "<li class='btn-open-comments-mobile' data-type='" + doc['type'] + "' data-count='" + doc['count_comments'] + "'>" + temp + temp2 + real_count + "</li>";
        temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/share2.png" + css_version + "'>";
        temp2 = "<span>" + i18n[lang].share + "</span>";
        btn_share_desktop = "<div class='btn-share-desktop written-btn-desktop-only'>" + temp + temp2 + "</div>";
    } else {
        if (doc['count_comments'] > 0) {
            real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_comments']) + "</span>";
        } else {
            real_count = "<span class='real-count'></span>";
        }
        temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/comments.png" + css_version + "'>";
        temp2 = "<span>" + i18n[lang].comments + "</span>";
        btn_open_comments = "<div class='btn-open-comments' data-type='" + doc['type'] + "' data-count='" + doc['count_comments'] + "'>" + temp + temp2 + real_count + "</div>";
        btn_share_desktop = "";
    }
    if (current_user_blog_id !== null) {
        temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/report.png" + css_version + "'>";
        temp = temp + "<span>" + i18n[lang].report + "</span>";
        btn_report_desktop = "<div class='btn-report-desktop written-btn-desktop-only report-article' data-type='" + doc['type'] + "'>" + temp + "</div>";
        btn_report_mobile = "<li class='btn-report-mobile report-article' data-type='" + doc['type'] + "'>" + temp + "</li>";
    } else {
        btn_report_desktop = "";
        btn_report_mobile = "";
    }
    if (current_user_blog_id !== null) {
        var is_subscribed = false;
        for (var i = 0; i < doc['subscribers'].length; i++) {
            if (current_user_blog_id === doc['subscribers'][i]) {
                is_subscribed = true;
                break;
            }
        }
        if (is_subscribed === true) {
            temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/subscription-selected.png" + css_version + "'>";
            temp = temp + "<span>" + i18n[lang].subscription + " ✔" + "</span>";
            btn_subscribe_desktop = "<div class='btn-unsubscribe-desktop written-btn-desktop-only'" +
                " data-type='" + doc['type'] + "'" +
                " data-blog-id='" + doc['blog_id'] + "'" +
                " data-id='" + doc['_id'] + "'>" + temp + "</div>";
            btn_subscribe_mobile = "<li class='btn-unsubscribe-mobile'" +
                " data-type='" + doc['type'] + "'" +
                " data-blog-id='" + doc['blog_id'] + "'" +
                " data-id='" + doc['_id'] + "'>" + temp + "</li>";
        } else {
            temp = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/subscription.png" + css_version + "'>";
            temp = temp + "<span>" + i18n[lang].subscription + "</span>";
            btn_subscribe_desktop = "<div class='btn-subscribe-desktop written-btn-desktop-only'" +
                " data-type='" + doc['type'] + "'" +
                " data-blog-id='" + doc['blog_id'] + "'" +
                " data-id='" + doc['_id'] + "'>" + temp + "</div>";
            btn_subscribe_mobile = "<li class='btn-subscribe-mobile'" +
                " data-type='" + doc['type'] + "'" +
                " data-blog-id='" + doc['blog_id'] + "'" +
                " data-id='" + doc['_id'] + "'>" + temp + "</li>";
        }
    } else {
        btn_subscribe_desktop = "";
        btn_subscribe_mobile = "";
    }
    temp = "<img src='" + aws_s3_url + "/icons/ellipsis-grey.png" + css_version + "' class='btn-ellipsis-mobile-img'>";
    if (doc['type'] === 'apply_now') {
        temp2 = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/share2.png" + css_version + "'>";
        temp2 = temp2 + "<span>" + i18n[lang].share + "</span>";
        temp2 = "<li class='btn-share-mobile'>" + temp2 + "</li>";
    } else {
        temp2 = "";
    }
    temp2 = "<ul style='display:none;'>" + btn_announcement_mobile + btn_open_comments_mobile + btn_subscribe_mobile + btn_report_mobile + temp2 + "</ul>";
    btn_ellipsis_mobile = "<div class='btn-ellipsis-mobile'>" + temp + temp2 + "</div>";
    written_btns_wrapper = "<div class='written-btns-wrapper'>" +
        view_counts + btn_awesome + btn_online_interview + btn_announcement + btn_open_comments +
        btn_share_desktop + btn_report_desktop + btn_subscribe_desktop + btn_ellipsis_mobile + "</div>";
    comments_wrapper = "<div class='comments-wrapper outer-comments'></div>";
    if (doc['type'] === 'apply_now' && doc['blog_id'] === current_user_blog_id) {
        write_announcement_wrapper = "<div class='write-announcement-wrapper'></div>";
    } else {
        write_announcement_wrapper = "";
    }
    var showing_modal = "";
    if (doc['type'] === 'apply_now') {
        if ($('#announcement-list-modal').length === 0) {
            showing_modal = "-modal";
        }
        temp2 = "<div id='announcement-list" + showing_modal + "'></div>";
        temp3 = "<div id='announcement-more" + showing_modal + "' class='btn-more list-more'><img class='btn-more-down-14' src='" + aws_s3_url + "/icons/more-down.png" + css_version + "'></div>";
        announcement_wrapper = "<div class='announcement-wrapper'>" + temp2 + temp3 + "</div>";
    } else {
        announcement_wrapper = "";
    }
    showing_modal = "";
    if (doc['type'] === 'apply_now' && doc['blog_id'] === current_user_blog_id) {
        if ($('#answer-list-modal').length === 0) {
            showing_modal = "-modal";
        }
        temp = "<div class='article-title answer-title'>" + i18n[lang].online_interview_answer_list + "</div>";
        temp2 = "<div id='answer-list" + showing_modal + "'></div>";
        temp3 = "<div id='answer-more" + showing_modal + "' class='btn-more list-more'><img class='btn-more-down-14' src='" + aws_s3_url + "/icons/more-down.png" + css_version + "'></div>";
        answer_wrapper = "<div class='answer-wrapper'>" + temp2 + temp3 + "</div>";
    } else {
        answer_wrapper = "";
    }
    var article_class = doc['type'] + "-" + doc['_id'];
    var written = "<div id='" + id + "' class='written " + written_article + " " + article_class +
        "' data-link='" + data_link +
        "' data-created-at='" + data_created_at +
        "' data-updated-at='" + data_updated_at +
        "' data-type='" + doc['type'] +
        "' data-lang='" + doc['language'] +
        "' data-blog-id='" + doc['blog_id'] +
        "' data-id='" + doc['_id'] +
        "' data-class='" + article_class +
        "' data-print-type='perfect" +
        "'>" +
        edit +
        written_top +
        written_title_wrapper +
        user_profile +
        written_content +
        written_link +
        written_btns_wrapper +
        comments_wrapper +
        write_announcement_wrapper +
        announcement_wrapper +
        answer_wrapper +
        "</div>";
    return written;
};
get["single"]["perfect"]["announcement"] = function (doc) {
    var lang
        , css_version = $("body").attr("data-css-version")
        , is_loginned = $("body").attr("data-check") === "true"
        , is_owner = false
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null
        , edit
        , content
        , final = ""
        , span
        , span2
        , written_announcement_title
        , written_announcement_content
        , written_announcement_wrapper
        , edit_announcement_wrapper
        , edit_announcement_form
        , edit_announcement_input_wrapper
        , edit_announcement_input
        , edit_announcement_textarea_wrapper
        , edit_announcement_textarea
        , btn_wrapper
        , btn
        , btn2
        , updated_at;
    lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (user_profile_link === "/set/blog-id") {
        is_loginned = false;
        return "";
    } else {
        if (user_profile_link) {
            current_user_blog_id = user_profile_link.split('/')[2];
        }
    }
    if (current_user_blog_id === null) {
        edit = "";
    } else {
        if (doc["blog_id"] === current_user_blog_id) {
            edit = "<div class='edit-nof announcement-edit'>" + i18n[lang].edit + "</div>" +
                "<div class='remove-nof announcement-remove'>" + i18n[lang].remove + "</div>";
            edit = "<div style='text-align:right;'>" + edit + "</div>";
            is_owner = true;
        } else {
            edit = "";
        }
    }
    updated_at = "<div class='updated-at without-text' data-datetime='" + doc["updated_at"] + "'>" + to_i18n_datetime(new Date(doc.updated_at)) + "</div>";
    updated_at = "<div class='written-announcement-updated-at-wrapper'>" + updated_at + "</div>";
    written_announcement_title = "<div class='written-announcement-title'>" + get_encoded_html_preventing_xss(doc["title"]) + "</div>";
    written_announcement_content = "<div class='written-announcement-content'>" + get_encoded_html_preventing_xss(doc["content"]) + "</div>";
    written_announcement_wrapper = "<div class='written-announcement-wrapper'>" + edit + updated_at + written_announcement_title + written_announcement_content + "</div>";
    if (is_owner === true) {
        btn = "<input class='btn-career edit-announcement-cancel' type='button' value='" + i18n[lang].cancel + "'>";
        btn2 = "<input class='btn-career edit-announcement-ok' type='button' value='" + i18n[lang].check + "'>";
        btn_wrapper = "<div class='btn-career-wrapper'>" + btn + btn2 + "</div>";
        edit_announcement_input = "<input type='text' class='edit-announcement-input'>";
        edit_announcement_input_wrapper = "<div class='edit-announcement-input-wrapper'>" + edit_announcement_input + "</div>";
        edit_announcement_textarea = "<textarea class='edit-announcement-textarea'></textarea>";
        edit_announcement_textarea_wrapper = "<div class='edit-announcement-textarea-wrapper'>" + edit_announcement_textarea + "</div>";
        span = "<span class='write-label'>" + i18n[lang].title + "</span>";
        span2 = "<span class='write-label'>" + i18n[lang].content + "</span>";
        edit_announcement_form = "<form class='edit-announcement-form'>" + span + edit_announcement_input_wrapper + span2 + edit_announcement_textarea_wrapper + btn_wrapper + "</form>";
        edit_announcement_wrapper = "<div class='edit-announcement-wrapper'>" + edit_announcement_form + "</div>";
    } else {
        edit_announcement_wrapper = "";
    }
    final = "<div class='announcement' data-article-id='" + doc["article_id"] + "' data-id='" + doc["_id"] + "' data-created-at='" + doc["created_at"] + "'>" + written_announcement_wrapper + edit_announcement_wrapper + "</div>";
    return final;
};
get["single"]["perfect"]["answer"] = function (doc) {
    var lang
        , css_version = $("body").attr("data-css-version")
        , id = Date.now() + "_" + doc["_id"]
        , data_created_at = doc["created_at"]
        , data_updated_at = doc["updated_at"]
        , is_loginned = $("body").attr("data-check") === "true"
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null
        , temp
        , temp2
        , user_profile_left
        , user_profile_right
        , user_profile;
    lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (user_profile_link === "/set/blog-id") {
        is_loginned = false;
    } else {
        if (user_profile_link) {
            current_user_blog_id = user_profile_link.split('/')[2];
        }
    }
    if (is_loginned === false) {
        return "";
    }
    temp = "<img src='" + doc['img'] + "' alt='" + get_encoded_html_preventing_xss(doc['name']) + "' title='" + get_encoded_html_preventing_xss(doc['name']) + "'>";
    temp = "<a href='/blog/" + doc['blog_id'] + "' target='_blank'>" + temp + "</a>";
    temp2 = "<div class='simple-profile-mouseentered-prompt'></div>";
    temp = "<div class='simple-profile-prompt-box in-written' data-link='/blog/" + doc['blog_id'] + "'>" + temp + temp2 + "</div>";
    user_profile_left = "<div class='user-profile-left'>" + temp + "</div>";
    temp = "<span class='user-name'>" + get_encoded_html_preventing_xss(doc['name']) + "</span>";
    temp = "<a class='user-name-wrapper' href='/blog/" + doc['blog_id'] + "' target='_blank'>" + temp + "</a>";
    temp2 = "<div class='simple-profile-mouseentered-prompt'></div>";
    temp = "<div class='simple-profile-prompt-box in-written' data-link='/blog/" + doc['blog_id'] + "'>" + temp + temp2 + "</div>";
    temp2 = "<span class='separator'></span>";
    temp = "<div>" + temp + temp2 + "</div>";
    temp2 = "<div class='created-at' data-datetime='" + doc["created_at"] + "'></div>";
    temp2 = "<div class='updated-at-wrapper'>" + temp2 + "</div>";
    user_profile_right = "<div class='user-profile-right'>" + temp + temp2 + "</div>";
    user_profile = "<div class='user-profile' style='padding-top:10px;'>" + user_profile_left + user_profile_right + "</div>";
    var question_item = ""
        , question
        , type_html
        , span
        , div
        , content
        , maximum_length
        , maximum_length_wrapper
        , textarea
        , textarea_wrapper
        , choice_list = ""
        , choice_item
        , label
        , choice_index_wrapper
        , choice_index
        , choice
        , choice_inner
        , choice_radio_wrapper
        , input;
    try {
        for (var i = 0; i < doc.questions.length; i++ ) {
            span = "<span class='question-label'>" + i18n[lang].question + " " + (i + 1) + "</span>";
            question = "<div class='online-interview-question'>" + get_encoded_html_preventing_xss(doc.questions[i].question) +  "</div>";
            div = "<div>" + span + "</div>";
            if (doc.questions[i].type === "short_answer") {
                textarea_wrapper = "<div class='applied-online-interview-answer-content'>" + get_encoded_html_preventing_xss(doc.answers[i].answer) + "</div>";
                maximum_length = "<div class='answer-maximum-length'>" + doc.answers[i].answer.length + " / " + doc.questions[i].max_length + "</div>";
                maximum_length_wrapper = "<div class='answer-maximum-length-wrapper'>" + maximum_length + "</div>";
                content = "<div class='applied-online-interview-content'>" + textarea_wrapper + maximum_length_wrapper + "</div>";
            } else {
                content = "";
                for (var j=0; j < doc.questions[i].choices.length; j++) {
                    choice_index = "<div class='applied-online-interview-choice-index'>" + (j+1) + "</div>";
                    choice_index_wrapper = "<div class='applied-online-interview-choice-index-wrapper'>" + choice_index + "</div>";
                    if (doc.questions[i].choices[j]._id === doc.answers[i].answer) {
                        choice_inner = "<div style='width:100%;font-weight:bold;text-decoration:underline;'>" + get_encoded_html_preventing_xss(doc.questions[i].choices[j].choice) + " ✔</div>";
                    } else {
                        choice_inner = "<div style='width:100%;'>" + get_encoded_html_preventing_xss(doc.questions[i].choices[j].choice) + "</div>";
                    }
                    choice = "<div class='applied-online-interview-choice'>" + choice_inner + "</div>";
                    label = "<div class='applied-online-interview-choice-item-table'>" + choice_index_wrapper + choice + "</div>";
                    choice_item = "<div class='applied-online-interview-choice-item'>" + label + "</div>";
                    content = content + choice_item;
                }
                content = "<div class='applied-online-interview-choice-item'>" + content + "</div>";
            }
            question_item = question_item + "<div class='applied-online-interview-answer-item'>" + div + question + content + "</div>";
        }
        return "<div class='answer' data-created-at='" + doc.created_at + "'>" + user_profile + question_item + "</div>";
    } catch (e) {
        return "";
    }
};
get["single"]["perfect"]["notification"] = function (doc) {
    var lang = $("body").attr("data-lang")
        , css_version = $("body").attr("data-css-version")
        , temp
        , a
        , img
        , notification_item_img_wrapper
        , notification_item_left
        , notification_item_middle_right
        , notification_item_middle
        , notification_item_right
        , span1
        , span2
        , span3
        , div1
        , div2
        , div3
        , friend
        , source_user
        , updated_at_wrapper
        , updated_at
        , notification_item
        , is_loginned = $("body").attr("data-check") === "true"
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null;
    if (is_loginned === true) {
        if (user_profile_link && user_profile_link !== "/set/blog-id") {
            current_user_blog_id = user_profile_link.split('/')[2];
        } else {
            return "";
        }
    } else {
        return "";
    }
    if (is_loginned === false) {
        return "";
    }
    if (lang === undefined) {
        lang = "en";
    }
    if (doc.type === "announcement") {
        img = "<img src='" + aws_s3_url + "/icons/logo-square.png" + css_version + "'>";
        notification_item_img_wrapper = "<div class='notification-item-img-wrapper'>" + img + "</div>";
        notification_item_left = "<div class='notification-item-left'>" + notification_item_img_wrapper + "</div>";
        span1 = "<span class='notification-user-name'>" + i18n[lang].announcement + "</span>";
        div1 = "<div>" + span1 + "</div>";
        div2 = "<div>" + get_encoded_html_preventing_xss(doc.info[lang].title) + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        notification_item_middle_right = "<div class='notification-item-middle-right'>" + div1 + div2 + updated_at_wrapper + "</div>";
        notification_item = "<div class='notification-item' data-updated-at='" + doc.updated_at + "'>" + notification_item_left + notification_item_middle_right + "</div>";
        return "<a href='" + doc.link + "'>" + notification_item + "</a>";
    } else if (doc.type === "invitation_request") {
        if (doc.info.users[0].blog_id === current_user_blog_id) {
            source_user = doc.info.users[1];
        } else {
            source_user = doc.info.users[0];
        }
        img = "<img src='" + doc.info.img + "'>";
        notification_item_img_wrapper = "<div class='notification-item-img-wrapper'>" + img + "</div>";
        a = "<a href='" + doc.link + "'>" + notification_item_img_wrapper + "</a>";
        notification_item_left = "<div class='notification-item-left'>" + a + "</div>";
        a = "<a href='/blog/" + source_user.blog_id + "'>" + get_encoded_html_preventing_xss(source_user.name) + "</a>";
        span1 = "<span class='notification-user-name'>" + a + "</span>";
        span2 = "<span>" + i18n[lang].sent_an_invitation + "</span>";
        div1 = "<div>" + span1 + span2 + "</div>";
        if (doc.info.type === "apply_now") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].apply_now + "</span>";
        } else if (doc.info.type === "hire_me") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].hire_me + "</span>";
        } else if (doc.info.type === "agenda") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].debate + "</span>";
        } else {
            span3 = "";
        }
        doc.info.title = doc.info.title.length > 75 ? doc.info.title.substring(0, 75 - 3) + "..." : doc.info.title;
        div2 = "<div>" + span3 + get_encoded_html_preventing_xss(doc.info.title) + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        a = "<a href='" + doc.link + "'>" + div2 + updated_at_wrapper + "</a>";
        notification_item_middle = "<div class='notification-item-middle'>" + div1 + a + "</div>";
        div1 = "<div class='remove-invitation' data-blog-id='" + doc.blog_id + "' data-type='" + doc.info.type + "' data-id='" + doc.info._id + "'>" + i18n[lang].remove + "</div>";
        div2 = "<div class='accept-invitation' data-blog-id='" + doc.blog_id + "' data-type='" + doc.info.type + "' data-id='" + doc.info._id + "'>" + i18n[lang].check + "</div>";
        notification_item_right = "<div class='notification-item-right2'>" + div1 + div2 + "</div>";
        return "<div class='notification-item' data-updated-at='" + doc.updated_at + "'>" + notification_item_left + notification_item_middle + notification_item_right + "</div>";
    } else if (doc.type === "invitation_accept") {
        if (doc.info.users[0].blog_id === current_user_blog_id) {
            source_user = doc.info.users[1];
        } else {
            source_user = doc.info.users[0];
        }
        img = "<img src='" + source_user.img + "'>";
        notification_item_img_wrapper = "<div class='notification-item-img-wrapper'>" + img + "</div>";
        notification_item_left = "<div class='notification-item-left'>" + notification_item_img_wrapper + "</div>";
        span1 = "<span class='notification-user-name'>" + get_encoded_html_preventing_xss(source_user.name) + "</span>";
        span2 = "<span>" + i18n[lang].accepted_invitation + "</span>";
        div1 = "<div>" + span1 + span2 + "</div>";
        if (doc.info.type === "apply_now") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].apply_now + "</span>";
        } else if (doc.info.type === "hire_me") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].hire_me + "</span>";
        } else if (doc.info.type === "agenda") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].debate + "</span>";
        } else {
            span3 = "";
        }
        doc.info.title = doc.info.title.length > 75 ? doc.info.title.substring(0, 75 - 3) + "..." : doc.info.title;
        div2 = "<div>" + span3 + get_encoded_html_preventing_xss(doc.info.title) + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        notification_item_middle_right = "<div class='notification-item-middle-right'>" + div1 + div2 + updated_at_wrapper + "</div>";
        notification_item = "<div class='notification-item' data-updated-at='" + doc.updated_at + "'>" + notification_item_left + notification_item_middle_right + "</div>";
        return "<a href='" + doc.link + "'>" + notification_item + "</a>";
    } else if (doc.type === "friend_request") {
        if (doc.info.users[0].blog_id === current_user_blog_id) {
            friend = doc.info.users[1];
        } else {
            friend = doc.info.users[0];
        }
        img = "<img src='" + friend.img + "'>";
        notification_item_img_wrapper = "<div class='notification-item-img-wrapper'>" + img + "</div>";
        a = "<a href='/blog/" + friend.blog_id + "'>" + notification_item_img_wrapper + "</a>";
        notification_item_left = "<div class='notification-item-left'>" + a + "</div>";
        span1 = "<span class='notification-user-name'>" + get_encoded_html_preventing_xss(friend.name) + "</span>";
        span2 = "<span>" + i18n[lang].requested_friend + "</span>";
        div1 = "<div>" + span1 + span2 + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        a = "<a href='/blog/" + friend.blog_id + "'>" + div1 + updated_at_wrapper + "</a>";
        notification_item_middle = "<div class='notification-item-middle'>" + a + "</div>";
        div1 = "<div class='remove-add-friend' data-blog-id='" + friend.blog_id + "'>" + i18n[lang].remove + "</div>";
        div2 = "<div class='accept-add-friend' data-blog-id='" + friend.blog_id + "'>" + i18n[lang].check + "</div>";
        notification_item_right = "<div class='notification-item-right2'>" + div1 + div2 + "</div>";
        return "<div class='notification-item' data-updated-at='" + doc.updated_at + "'>" + notification_item_left + notification_item_middle + notification_item_right + "</div>";
    } else if (doc.type === "friend_accept") {
        if (doc.info.users[0].blog_id === current_user_blog_id) {
            friend = doc.info.users[1];
        } else {
            friend = doc.info.users[0];
        }
        img = "<img src='" + friend.img + "'>";
        notification_item_img_wrapper = "<div class='notification-item-img-wrapper'>" + img + "</div>";
        notification_item_left = "<div class='notification-item-left'>" + notification_item_img_wrapper + "</div>";
        span1 = "<span class='notification-user-name'>" + get_encoded_html_preventing_xss(friend.name) + "</span>";
        span2 = "<span>" + i18n[lang].became_your_friend + "</span>";
        div1 = "<div>" + span1 + span2 + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        notification_item_middle_right = "<div class='notification-item-middle-right'>" + div1 + updated_at_wrapper + "</div>";
        notification_item = "<div class='notification-item' data-updated-at='" + doc.updated_at + "'>" + notification_item_left + notification_item_middle_right + "</div>";
        return "<a href='/blog/" + friend.blog_id + "'>" + notification_item + "</a>";
    } else if (doc.type === "opinion_request") {
        if (doc.info.users[0].blog_id === current_user_blog_id) {
            source_user = doc.info.users[1];
        } else {
            source_user = doc.info.users[0];
        }
        img = "<img src='" + doc.info.img + "'>";
        notification_item_img_wrapper = "<div class='notification-item-img-wrapper'>" + img + "</div>";
        a = "<a href='" + doc.link + "'>" + notification_item_img_wrapper + "</a>";
        notification_item_left = "<div class='notification-item-left'>" + a + "</div>";
        a = "<a href='/blog/" + source_user.blog_id + "'>" + get_encoded_html_preventing_xss(source_user.name) + "</a>";
        span1 = "<span class='notification-user-name'>" + a + "</span>";
        span2 = "<span>" + i18n[lang].requested_opinion + "</span>";
        div1 = "<div>" + span1 + span2 + "</div>";
        doc.info.title = doc.info.title.length > 75 ? doc.info.title.substring(0, 75 - 3) + "..." : doc.info.title;
        div2 = "<div>" + get_encoded_html_preventing_xss(doc.info.title) + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        a = "<a href='" + doc.link + "'>" + div2 + updated_at_wrapper + "</a>";
        notification_item_middle_right = "<div class='notification-item-middle-right'>" + div1 + a + "</div>";
        return "<div class='notification-item' data-updated-at='" + doc.updated_at + "'>" + notification_item_left + notification_item_middle_right + "</div>";
    } else if (doc.type === "opinion_written") {
        source_user = doc.info.users[0];
        img = "<img src='" + source_user.img + "'>";
        notification_item_img_wrapper = "<div class='notification-item-img-wrapper'>" + img + "</div>";
        notification_item_left = "<div class='notification-item-left'>" + notification_item_img_wrapper + "</div>";
        span1 = "<span class='notification-user-name'>" + get_encoded_html_preventing_xss(source_user.name) + "</span>";
        span2 = "<span>" + i18n[lang].added_opinion + "</span>";
        div1 = "<div>" + span1 + span2 + "</div>";
        doc.info.title = doc.info.title.length > 75 ? doc.info.title.substring(0, 75 - 3) + "..." : doc.info.title;
        div2 = "<div>" + get_encoded_html_preventing_xss(doc.info.title) + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        notification_item_middle_right = "<div class='notification-item-middle-right'>" + div1 + div2 + updated_at_wrapper + "</div>";
        notification_item = "<div class='notification-item' data-updated-at='" + doc.updated_at + "'>" + notification_item_left + notification_item_middle_right + "</div>";
        return "<a href='" + doc.link + "'>" + notification_item + "</a>";
    } else if (doc.type === "translation_request") {
        if (doc.info.users[0].blog_id === current_user_blog_id) {
            source_user = doc.info.users[1];
        } else {
            source_user = doc.info.users[0];
        }
        img = "<img src='" + doc.info.img + "'>";
        notification_item_img_wrapper = "<div class='notification-item-img-wrapper'>" + img + "</div>";
        a = "<a href='" + doc.link + "'>" + notification_item_img_wrapper + "</a>";
        notification_item_left = "<div class='notification-item-left'>" + a + "</div>";
        a = "<a href='/blog/" + source_user.blog_id + "'>" + get_encoded_html_preventing_xss(source_user.name) + "</a>";
        span1 = "<span class='notification-user-name'>" + a + "</span>";
        span2 = "<span>" + i18n[lang].requested_translation + "</span>";
        div1 = "<div>" + span1 + span2 + "</div>";
        div2 = "<div class='notification-translation-languages'>" + i18n[lang][ get_language_text(doc.info.languages.source) ] + " &#8594; " + i18n[lang][ get_language_text(doc.info.languages.target) ] + "</div>";
        doc.info.title = doc.info.title.length > 75 ? doc.info.title.substring(0, 75 - 3) + "..." : doc.info.title;
        div3 = "<div>" + get_encoded_html_preventing_xss(doc.info.title) + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        a = "<a href='" + doc.link + "'>" + div2 + div3 + updated_at_wrapper + "</a>";
        notification_item_middle_right = "<div class='notification-item-middle-right'>" + div1 + a + "</div>";
        return "<div class='notification-item' data-updated-at='" + doc.updated_at + "'>" + notification_item_left + notification_item_middle_right + "</div>";
    } else if (doc.type === "translation_written") {
        source_user = doc.info.users[0];
        img = "<img src='" + source_user.img + "'>";
        notification_item_img_wrapper = "<div class='notification-item-img-wrapper'>" + img + "</div>";
        notification_item_left = "<div class='notification-item-left'>" + notification_item_img_wrapper + "</div>";
        span1 = "<span class='notification-user-name'>" + get_encoded_html_preventing_xss(source_user.name) + "</span>";
        if (doc.info.type === "agenda") {
            span2 = "<span>" + i18n[lang].added_agenda_translation + "</span>";
        } else if (doc.info.type === "opinion") {
            span2 = "<span>" + i18n[lang].added_opinion_translation + "</span>";
        } else {
            span2 = "<span>" + i18n[lang].added_translation + "</span>";
        }
        div1 = "<div>" + span1 + span2 + "</div>";
        div2 = "<div class='notification-translation-languages'>" + i18n[lang][ get_language_text(doc.info.languages.source) ] + " &#8594; " + i18n[lang][ get_language_text(doc.info.languages.target) ] + "</div>";
        doc.info.title = doc.info.title.length > 75 ? doc.info.title.substring(0, 75 - 3) + "..." : doc.info.title;
        div3 = "<div>" + get_encoded_html_preventing_xss(doc.info.title) + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        notification_item_middle_right = "<div class='notification-item-middle-right'>" + div1 + div2 + div3 + updated_at_wrapper + "</div>";
        notification_item = "<div class='notification-item' data-updated-at='" + doc.updated_at + "'>" + notification_item_left + notification_item_middle_right + "</div>";
        return "<a href='" + doc.link + "'>" + notification_item + "</a>";
    } else if (doc.type === "guestbook_written") {
        source_user = doc.info.users[0];
        img = "<img src='" + source_user.img + "'>";
        notification_item_img_wrapper = "<div class='notification-item-img-wrapper'>" + img + "</div>";
        notification_item_left = "<div class='notification-item-left'>" + notification_item_img_wrapper + "</div>";
        span1 = "<span class='notification-user-name'>" + get_encoded_html_preventing_xss(source_user.name) + "</span>";
        span2 = "<span>" + i18n[lang].added_guest_book + "</span>";
        div1 = "<div>" + span1 + span2 + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        notification_item_middle_right = "<div class='notification-item-middle-right'>" + div1 + updated_at_wrapper + "</div>";
        notification_item = "<div class='notification-item' data-updated-at='" + doc.updated_at + "'>" + notification_item_left + notification_item_middle_right + "</div>";
        return "<a href='" + doc.link + "'>" + notification_item + "</a>";
    } else if (doc.type === "comment_written") {
        source_user = doc.info.users[0];
        img = "<img src='" + source_user.img + "'>";
        notification_item_img_wrapper = "<div class='notification-item-img-wrapper'>" + img + "</div>";
        notification_item_left = "<div class='notification-item-left'>" + notification_item_img_wrapper + "</div>";
        span1 = "<span class='notification-user-name'>" + get_encoded_html_preventing_xss(source_user.name) + "</span>";
        if (doc.info.type === "guestbook") {
            span2 = "<span>" + i18n[lang].added_guest_book_comment + "</span>";
        } else {
            span2 = "<span>" + i18n[lang].added_comment + "</span>";
        }
        div1 = "<div>" + span1 + span2 + "</div>";
        if (doc.info.type === "apply_now") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].apply_now + "</span>";
        } else if (doc.info.type === "hire_me") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].hire_me + "</span>";
        } else if (doc.info.type === "agenda") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].agenda + "</span>";
        } else if (doc.info.type === "opinion") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].opinion + "</span>";
        } else if (doc.info.type === "tr_agenda") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].agenda_translation + "</span>";
        } else if (doc.info.type === "tr_opinion") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].opinion_translation + "</span>";
        } else if (doc.info.type === "blog") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].blog + "</span>";
        } else if (doc.info.type === "gallery") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].album + "</span>";
        } else {
            span3 = "";
        }
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        if (doc.info.type === "guestbook") {
            notification_item_middle_right = "<div class='notification-item-middle-right'>" + div1 + updated_at_wrapper + "</div>";
        } else {
            doc.info.title = doc.info.title.length > 75 ? doc.info.title.substring(0, 75 - 3) + "..." : doc.info.title;
            div2 = "<div>" + span3 + get_encoded_html_preventing_xss(doc.info.title) + "</div>";
            notification_item_middle_right = "<div class='notification-item-middle-right'>" + div1 + div2 + updated_at_wrapper + "</div>";
        }
        notification_item = "<div class='notification-item' data-updated-at='" + doc.updated_at + "'>" + notification_item_left + notification_item_middle_right + "</div>";
        return "<a href='" + doc.link + "'>" + notification_item + "</a>";
    } else if (doc.type === "awesome_clicked") {
        source_user = doc.info.users[0];
        img = "<img src='" + source_user.img + "'>";
        notification_item_img_wrapper = "<div class='notification-item-img-wrapper'>" + img + "</div>";
        a = "<a href='" + doc.link + "'>" + notification_item_img_wrapper + "</a>";
        notification_item_left = "<div class='notification-item-left'>" + a + "</div>";
        a = "<a href='/blog/" + source_user.blog_id + "'>" + get_encoded_html_preventing_xss(source_user.name) + "</a>";
        span1 = "<span class='notification-user-name'>" + a + "</span>";
        span2 = "<span>" + i18n[lang].clicked_awesome + "</span>";
        div1 = "<div>" + span1 + span2 + "</div>";
        if (doc.info.type === "apply_now") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].apply_now + "</span>";
        } else if (doc.info.type === "hire_me") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].hire_me + "</span>";
        } else if (doc.info.type === "agenda") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].agenda + "</span>";
        } else if (doc.info.type === "opinion") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].opinion + "</span>";
        } else if (doc.info.type === "tr_agenda") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].agenda_translation + "</span>";
        } else if (doc.info.type === "tr_opinion") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].opinion_translation + "</span>";
        } else if (doc.info.type === "blog") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].blog + "</span>";
        } else if (doc.info.type === "gallery") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].album + "</span>";
        } else if (doc.info.type === "comment") {
            span3 = "<span class='notification-type-label'>" + i18n[lang].comment + "</span>";
        } else {
            span3 = "";
        }
        doc.info.title = doc.info.title.length > 75 ? doc.info.title.substring(0, 75 - 3) + "..." : doc.info.title;
        div2 = "<div>" + span3 + get_encoded_html_preventing_xss(doc.info.title) + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        a = "<a href='" + doc.link + "'>" + div2 + updated_at_wrapper + "</a>";
        notification_item_middle_right = "<div class='notification-item-middle-right'>" + div1 + a + "</div>";
        return "<div class='notification-item' data-updated-at='" + doc.updated_at + "'>" + notification_item_left + notification_item_middle_right + "</div>";
    } else {
        return "";
    }
};
get["single"]["perfect"]["message"] = function (doc, type) {
    var temp
        , lang = $("body").attr("data-lang")
        , css_version = $("body").attr("data-css-version")
        , img
        , temp2
        , temp3
        , user_profile_left
        , user_profile_right
        , user_profile
        , message_item_content
        , btn_career_wrapper
        , message_item
        , is_loginned = $("body").attr("data-check") === "true"
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null;
    if (is_loginned === true) {
        if (user_profile_link && user_profile_link !== "/set/blog-id") {
            current_user_blog_id = user_profile_link.split('/')[2];
        } else {
            return "";
        }
    } else {
        return "";
    }
    if (is_loginned === false) {
        return "";
    }
    if (lang === undefined) {
        lang = "en";
    }
    if (type !== 'sent' && type !== 'received') {
        return false;
    }
    if (type === 'received') {
        img =  doc.from_img;
    } else {
        img =  doc.to_img;
    }
    var message_type_simple_profile;
    if (window.location.pathname === '/i/messages') {
        message_type_simple_profile = 'in-body';
    } else {
        message_type_simple_profile = 'in-messages';
    }
    if (type === 'received') {
        temp = "<img src='" + img + "' alt='" + get_encoded_html_preventing_xss(doc.from_name) + "' title='" + get_encoded_html_preventing_xss(doc.from_name) + "'>";
        temp = "<a href='/blog/" + doc.from_blog_id +"'>" + temp + "</a>";
        temp2 = "<div class='simple-profile-mouseentered-prompt'></div>";
        temp = "<div class='simple-profile-prompt-box " + message_type_simple_profile + "' data-link='/blog/" + doc.from_blog_id + "'>" + temp + temp2 + "</div>";
        user_profile_left = "<div class='user-profile-left'>" + temp + "</div>";
        temp = "<span class='message-item-received-label'>From.</span>";
        temp2 = "<span class='user-name'>" + get_encoded_html_preventing_xss(doc.from_name) + "</span>";
        temp2 = "<a href='/blog/" + doc.from_blog_id + "'>" + temp2 +"</a>";
        temp3 = "<div class='simple-profile-mouseentered-prompt'></div>";
        temp2 = "<div class='simple-profile-prompt-box " + message_type_simple_profile + "' data-link='/blog/" + doc.from_blog_id + "'>" + temp2 + temp3 + "</div>";
        temp = "<div>" + temp + temp2 + "</div>";
    } else {
        temp = "<img src='" + img + "' alt='" + get_encoded_html_preventing_xss(doc.to_name) + "' title='" + get_encoded_html_preventing_xss(doc.to_name) + "'>";
        temp = "<a href='/blog/" + doc.to_blog_id +"'>" + temp + "</a>";
        temp2 = "<div class='simple-profile-mouseentered-prompt'></div>";
        temp = "<div class='simple-profile-prompt-box " + message_type_simple_profile + "' data-link='/blog/" + doc.to_blog_id + "'>" + temp + temp2 + "</div>";
        user_profile_left = "<div class='user-profile-left'>" + temp + "</div>";
        temp = "<span class='message-item-sent-label'>To.</span>";
        temp2 = "<span class='user-name'>" + get_encoded_html_preventing_xss(doc.to_name) + "</span>";
        temp2 = "<a href='/blog/" + doc.to_blog_id + "'>" + temp2 +"</a>";
        temp3 = "<div class='simple-profile-mouseentered-prompt'></div>";
        temp2 = "<div class='simple-profile-prompt-box " + message_type_simple_profile + "' data-link='/blog/" + doc.to_blog_id + "'>" + temp2 + temp3 + "</div>";
        temp = "<div>" + temp + temp2 + "</div>";
    }
    temp2 = "<div class='created-at' data-datetime='" + doc["created_at"] + "'>" + to_i18n_datetime(new Date(doc.created_at)) + "</div>";
    temp2 = "<div class='created-at-wrapper'>" + temp2 + "</div>";
    user_profile_right = "<div class='user-profile-right'>" + temp + temp2 + "</div>";
    user_profile = "<div class='user-profile'>" + user_profile_left + user_profile_right + "</div>";
    message_item_content = "<div class='message-item-content'>" + get_encoded_html_preventing_xss(doc.content) + "</div>";
    if (type === 'received') {
        temp = "<input class='btn-career btn-report-message' type='button' value='" + i18n[lang].report + "' data-id='" + doc._id + "' data-from-blog-id='" + doc.from_blog_id + "' data-to-blog-id='" + doc.to_blog_id + "'>";
        temp3 = "<input class='btn-career btn-reply-message' type='button' value='" + i18n[lang].reply + "' data-blog-id='" + doc.from_blog_id + "' data-name='" + get_encoded_html_preventing_xss(doc.from_name) + "' data-img='" + doc.from_img + "'>";
    } else {
        temp = "";
        temp3 = "";
    }
    temp2 = "<input class='btn-career btn-remove-message' type='button' value='" + i18n[lang].remove + "' data-id='" + doc._id + "' data-from-blog-id='" + doc.from_blog_id + "' data-to-blog-id='" + doc.to_blog_id + "'>";
    btn_career_wrapper = "<div class='btn-career-wrapper'>" + temp + temp2 + temp3 + "</div>";
    message_item = "<div class='message-item' data-created-at='" + doc.created_at + "'>" + user_profile + message_item_content + btn_career_wrapper + "</div>";
    return message_item;
};
get["single"]["perfect"]["friend"] = function (doc, type) {
    var lang = $("body").attr("data-lang")
        , css_version = $("body").attr("data-css-version")
        , temp
        , a
        , img
        , friend
        , friend_item
        , friend_item_img_wrapper
        , friend_item_left
        , friend_item_middle
        , friend_item_right
        , friend_item_middle_right
        , span1
        , span2
        , span3
        , div1
        , div2
        , div3
        , languages
        , updated_at
        , updated_at_wrapper
        , ul
        , li
        , is_loginned = $("body").attr("data-check") === "true"
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null;
    if (is_loginned === true) {
        if (user_profile_link && user_profile_link !== "/set/blog-id") {
            current_user_blog_id = user_profile_link.split('/')[2];
        } else {
            return "";
        }
    } else {
        return "";
    }
    if (is_loginned === false) {
        return "";
    }
    if (lang === undefined) {
        lang = "en";
    }
    if (type === "my_friends") {
        img = "<img src='" + doc.img + "'>";
        friend_item_img_wrapper = "<div class='friend-item-img-wrapper'>" + img + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "'>" + friend_item_img_wrapper + "</a>";
        friend_item_left = "<div class='friend-item-left'>" + a + "</div>";
        span1 = "<span class='friend-user-name'>" + get_encoded_html_preventing_xss(doc.name) + "</span>";
        if (doc.verified_profile && doc.verified_profile !== "") {
            span2 = "<span class='user-verified-profile' style='margin-left:0;'>(" + get_encoded_html_preventing_xss(doc.verified_profile) + ")</span>";
        } else {
            span2 = "";
        }
        div1 = "<div>" + span1 + span2 + "</div>";
        div2 = "<div class='friend-blog-id'>@" + doc.blog_id + "</div>";
        languages = i18n[lang][get_language_text(doc.main_language)];
        if (doc.available_languages.length > 0) {
            for (var i = 0; i < doc.available_languages.length; i++) {
                if (
                    lang === "en" ||
                    lang === "ko"
                ) {
                    languages = languages + ", " + i18n[lang][get_language_text(doc.available_languages[i])];
                } else {
                    languages = languages + "、" + i18n[lang][get_language_text(doc.available_languages[i])];
                }
            }
        }
        /*div2 = div2 + "<div class='user-languages'>" + languages + "</div>";*/
        if (doc.employment.length > 0) {
            div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["employment"]("short", doc.employment[0])) +  "</div>";
        } else {
            if (doc.education.length > 0) {
                div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["education"]("short", doc.education[0])) +  "</div>";
            } else {
                if (doc.location.length > 0) {
                    div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["location"]("short", doc.location[0])) +  "</div>";
                } else {
                    if (doc.simple_career !== "") {
                        div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(doc.simple_career) +  "</div>";
                    } else {
                        if (doc.prize.length > 0) {
                            div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["prize"]("short", doc.prize[0])) +  "</div>";
                        }
                    }
                }
            }
        }
        a = "<a href='/blog/" + doc.blog_id + "'>" + div1 + div2 + "</a>";
        friend_item_middle = "<div class='friend-item-middle'>" + a + "</div>";
        img = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/friends.png" + css_version + "'>";
        span1 = "<span>" + i18n[lang].my_friend + " ✔</span>";
        span2 = "<span>" + i18n[lang].friend_remove + "</span>";
        li = "<li class='remove-current-friend' data-blog-id='" + doc.blog_id +"'>" + img + span2 + "</li>";
        ul = "<ul style='display:none;'>" + li + "</ul>";
        div1 = "<div class='my-friend of-friend-item' data-blog-id='" + doc.blog_id + "'>" + img + span1 + ul + "</div>";
        friend_item_right = "<div class='friend-item-right3'>" + div1 + "</div>";
        return "<div class='friend-item'>" + friend_item_left + friend_item_middle + friend_item_right + "</div>";
    } else if (type === "friends") {
        img = "<img src='" + doc.img + "'>";
        friend_item_img_wrapper = "<div class='friend-item-img-wrapper'>" + img + "</div>";
        friend_item_left = "<div class='friend-item-left'>" + friend_item_img_wrapper + "</div>";
        span1 = "<span class='friend-user-name'>" + get_encoded_html_preventing_xss(doc.name) + "</span>";
        div1 = "<div>" + span1 + "</div>";
        div2 = "<div class='friend-blog-id'>@" + doc.blog_id + "</div>";
        languages = i18n[lang][get_language_text(doc.main_language)];
        if (doc.available_languages.length > 0) {
            for (var i = 0; i < doc.available_languages.length; i++) {
                if (
                    lang === "en" ||
                    lang === "ko"
                ) {
                    languages = languages + ", " + i18n[lang][get_language_text(doc.available_languages[i])];
                } else {
                    languages = languages + "、" + i18n[lang][get_language_text(doc.available_languages[i])];
                }
            }
        }
        /*div2 = div2 + "<div class='user-languages'>" + languages + "</div>";*/
        if (doc.employment.length > 0) {
            div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["employment"]("short", doc.employment[0])) +  "</div>";
        } else {
            if (doc.education.length > 0) {
                div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["education"]("short", doc.education[0])) +  "</div>";
            } else {
                if (doc.location.length > 0) {
                    div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["location"]("short", doc.location[0])) +  "</div>";
                } else {
                    if (doc.simple_career !== "") {
                        div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(doc.simple_career) +  "</div>";
                    } else {
                        if (doc.prize.length > 0) {
                            div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["prize"]("short", doc.prize[0])) +  "</div>";
                        }
                    }
                }
            }
        }
        friend_item_middle_right = "<div class='friend-item-middle-right'>" + div1 + div2 + "</div>";
        friend_item = "<div class='friend-item'>" + friend_item_left + friend_item_middle_right + "</div>";
        return "<a href='/blog/" + doc.blog_id + "'>" + friend_item + "</a>";
    } else if (type === "received") {
        if (doc.info.users[0].blog_id === current_user_blog_id) {
            friend = doc.info.users[1];
        } else {
            friend = doc.info.users[0];
        }
        img = "<img src='" + friend.img + "'>";
        friend_item_img_wrapper = "<div class='friend-item-img-wrapper'>" + img + "</div>";
        a = "<a href='/blog/" + friend.blog_id + "'>" + friend_item_img_wrapper + "</a>";
        friend_item_left = "<div class='friend-item-left'>" + a + "</div>";
        span1 = "<span class='friend-user-name'>" + get_encoded_html_preventing_xss(friend.name) + "</span>";
        span2 = "<span>" + i18n[lang].requested_friend + "</span>";
        div1 = "<div>" + span1 + span2 + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        a = "<a href='/blog/" + friend.blog_id + "'>" + div1 + updated_at_wrapper + "</a>";
        friend_item_middle = "<div class='friend-item-middle'>" + a + "</div>";
        div1 = "<div class='remove-add-friend' data-blog-id='" + friend.blog_id + "'>" + i18n[lang].remove + "</div>";
        div2 = "<div class='accept-add-friend' data-blog-id='" + friend.blog_id + "'>" + i18n[lang].check + "</div>";
        friend_item_right = "<div class='friend-item-right2'>" + div1 + div2 + "</div>";
        return "<div class='friend-item' data-created-at='" + doc.created_at + "'>" + friend_item_left + friend_item_middle + friend_item_right + "</div>";
    } else if (type === "sent") {
        if (doc.info.users[0].blog_id === current_user_blog_id) {
            friend = doc.info.users[1];
        } else {
            friend = doc.info.users[0];
        }
        img = "<img src='" + friend.img + "'>";
        friend_item_img_wrapper = "<div class='friend-item-img-wrapper'>" + img + "</div>";
        a = "<a href='/blog/" + friend.blog_id + "'>" + friend_item_img_wrapper + "</a>";
        friend_item_left = "<div class='friend-item-left'>" + a + "</div>";
        span1 = "<span class='friend-user-name'>" + get_encoded_html_preventing_xss(friend.name) + "</span>";
        div1 = "<div>" + span1 + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        a = "<a href='/blog/" + friend.blog_id + "'>" + div1 + updated_at_wrapper + "</a>";
        friend_item_middle = "<div class='friend-item-middle'>" + a + "</div>";
        img = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/friends.png" + css_version + "'>";
        span1 = "<span>" + i18n[lang].request + " ✔</span>";
        div1 = "<div class='requested-friend of-friend-item' data-blog-id='" + friend.blog_id + "'>" + img + span1 + "</div>";
        friend_item_right = "<div class='friend-item-right3'>" + div1 + "</div>";
        return "<div class='friend-item' data-created-at='" + doc.created_at + "'>" + friend_item_left + friend_item_middle + friend_item_right + "</div>";
    } else {
        return "";
    }
};
get["single"]["perfect"]["invitation"]  = function (doc, type) {
    var lang = $("body").attr("data-lang")
        , css_version = $("body").attr("data-css-version")
        , temp
        , a
        , img
        , user
        , invitation
        , invitation_item
        , invitation_item_img_wrapper
        , invitation_item_left
        , invitation_item_middle
        , invitation_item_right
        , invitation_item_middle_right
        , span1
        , span2
        , span3
        , div1
        , div2
        , div3
        , languages
        , simple_career
        , translation_languages
        , updated_at
        , updated_at_wrapper
        , ul
        , li
        , is_loginned = $("body").attr("data-check") === "true"
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null;
    if (is_loginned === true) {
        if (user_profile_link && user_profile_link !== "/set/blog-id") {
            current_user_blog_id = user_profile_link.split('/')[2];
        } else {
            return "";
        }
    } else {
        return "";
    }
    if (is_loginned === false) {
        return "";
    }
    if (lang === undefined) {
        lang = "en";
    }
    if (type === "received") {
        if (doc.info.users[0].blog_id === current_user_blog_id) {
            user = doc.info.users[1];
        } else {
            user = doc.info.users[0];
        }
        img = "<img src='" + doc.info.img + "'>";
        invitation_item_img_wrapper = "<div class='invitation-item-img-wrapper'>" + img + "</div>";
        a = "<a href='" + doc.link + "'>" + invitation_item_img_wrapper + "</a>";
        invitation_item_left = "<div class='invitation-item-left'>" + a + "</div>";
        a = "<a href='/blog/" + user.blog_id + "'>" + get_encoded_html_preventing_xss(user.name) + "</a>";
        span1 = "<span class='invitation-user-name'>" + a + "</span>";
        span2 = "<span>" + i18n[lang].sent_an_invitation + "</span>";
        div1 = "<div>" + span1 + span2 + "</div>";
        if (doc.info.type === "apply_now") {
            span3 = "<span class='invitation-type-label'>" + i18n[lang].apply_now + "</span>";
        } else if (doc.info.type === "hire_me") {
            span3 = "<span class='invitation-type-label'>" + i18n[lang].hire_me + "</span>";
        } else if (doc.info.type === "agenda") {
            span3 = "<span class='invitation-type-label'>" + i18n[lang].debate + "</span>";
        } else {
            span3 = "";
        }
        doc.info.title = doc.info.title.length > 75 ? doc.info.title.substring(0, 75 - 3) + "..." : doc.info.title;
        div2 = "<div>" + span3 + get_encoded_html_preventing_xss(doc.info.title) + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        a = "<a href='" + doc.link + "'>" + div2 + updated_at_wrapper + "</a>";
        invitation_item_middle = "<div class='invitation-item-middle'>" + div1 + a + "</div>";
        div1 = "<div class='remove-invitation' data-blog-id='" + doc.blog_id + "' data-type='" + doc.info.type + "' data-id='" + doc.info._id + "'>" + i18n[lang].remove + "</div>";
        div2 = "<div class='accept-invitation' data-blog-id='" + doc.blog_id + "' data-type='" + doc.info.type + "' data-id='" + doc.info._id + "'>" + i18n[lang].check + "</div>";
        invitation_item_right = "<div class='invitation-item-right2'>" + div1 + div2 + "</div>";
        return "<div class='invitation-item' data-updated-at='" + doc.updated_at + "'>" + invitation_item_left + invitation_item_middle + invitation_item_right + "</div>";
    } else if (type === "sent") {
        if (doc.info.users[0].blog_id === current_user_blog_id) {
            user = doc.info.users[1];
        } else {
            user = doc.info.users[0];
        }
        img = "<img src='" + doc.info.img + "'>";
        invitation_item_img_wrapper = "<div class='invitation-item-img-wrapper'>" + img + "</div>";
        a = "<a href='" + doc.link + "'>" + invitation_item_img_wrapper + "</a>";
        invitation_item_left = "<div class='invitation-item-left'>" + a + "</div>";
        a = "<a href='/blog/" + user.blog_id + "'>" + get_encoded_html_preventing_xss(user.name) + "</a>";
        span1 = "<span class='invitation-user-name'>" + a + "</span>";
        div1 = "<div>" + span1 + "</div>";
        if (doc.info.type === "apply_now") {
            span3 = "<span class='invitation-type-label'>" + i18n[lang].apply_now + "</span>";
        } else if (doc.info.type === "hire_me") {
            span3 = "<span class='invitation-type-label'>" + i18n[lang].hire_me + "</span>";
        } else if (doc.info.type === "agenda") {
            span3 = "<span class='invitation-type-label'>" + i18n[lang].debate + "</span>";
        } else {
            span3 = "";
        }
        doc.info.title = doc.info.title.length > 75 ? doc.info.title.substring(0, 75 - 3) + "..." : doc.info.title;
        div2 = "<div>" + span3 + get_encoded_html_preventing_xss(doc.info.title) + "</div>";
        updated_at = "<div class='updated-at without-text' data-datetime='" + doc.updated_at + "'></div>";
        updated_at_wrapper = "<div class='updated-at-wrapper'>" + updated_at + "</div>";
        a = "<a href='" + doc.link + "'>" + div2 + updated_at_wrapper + "</a>";
        invitation_item_middle = "<div class='invitation-item-middle'>" + div1 + a + "</div>";
        img = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/invitations.png" + css_version + "'>";
        span1 = "<span style='vertical-align:middle;'>" + i18n[lang].invite + " ✔</span>";
        div1 = "<div class='requested-invitation' data-blog-id='" + user.blog_id + "' data-type='" + doc.info.type + "' data-id='" + doc.info._id + "'>" + img + span1 + "</div>";
        invitation_item_right = "<div class='invitation-item-right3'>" + div1 + "</div>";
        return "<div class='invitation-item' data-updated-at='" + doc.updated_at + "'>" + invitation_item_left + invitation_item_middle + invitation_item_right + "</div>";
    } else if (type === "recommended_users") {
        if (
            invitation_obj.article_type === "agenda" ||
            invitation_obj.article_type === "tr_agenda"
        ) {
            img = "<img src='" + doc.img + "'>";
            invitation_item_img_wrapper = "<div class='invitation-item-img-wrapper'>" + img + "</div>";
            a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>" + invitation_item_img_wrapper + "</a>";
            invitation_item_left = "<div class='invitation-item-left'>" + a + "</div>";
            a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>" + get_encoded_html_preventing_xss(doc.name) + "</a>";
            span1 = "<span class='invitation-user-name'>" + a + "</span>";
            div1 = "<div>" + span1 + "</div>";
            a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>@" + doc.blog_id + "</a>";
            div2 = "<div class='invitation-blog-id'>" + a + "</div>";
            if (doc.info) {
                span3 = "";
                for (var i = 0; i < doc.info.length; i++) {
                    temp = "<span class='type-label-right'>" + get_encoded_html_preventing_xss(doc.info[i].key) + " (" + doc.info[i].count + ")</span>";
                    span3 = span3 + temp;
                }
                if (span3 !== "") {
                    div3 = "<div>" + span3 + "</div>";
                } else {
                    div3 = "";
                }
            } else {
                div3 = "";
            }
            invitation_item_middle = "<div class='invitation-item-middle'>" + div1 + div2 + div3 + "</div>";
            img = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/invitations.png" + css_version + "'>";
            span1 = "<span style='vertical-align:middle;'>" + i18n[lang].invite + "</span>";
            span1 = span1 + "<img class='emoticon-small-img2' src='" + aws_s3_url + "/icons/add.png'>";
            div1 = "<div class='request-invitation' data-blog-id='" + doc.blog_id + "' data-type='" + invitation_obj.article_type + "' data-id='" + invitation_obj.article_id + "'>" + img + span1 + "</div>";
            invitation_item_right = "<div class='invitation-item-right3'>" + div1 + "</div>";
            return "<div class='invitation-item'>" + invitation_item_left + invitation_item_middle + invitation_item_right + "</div>";
        } else {
            return "";
        }
    } else if (type === "friends") {
        img = "<img src='" + doc.img + "'>";
        invitation_item_img_wrapper = "<div class='invitation-item-img-wrapper'>" + img + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>" + invitation_item_img_wrapper + "</a>";
        invitation_item_left = "<div class='invitation-item-left'>" + a + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>" + get_encoded_html_preventing_xss(doc.name) + "</a>";
        span1 = "<span class='invitation-user-name'>" + a + "</span>";
        div1 = "<div>" + span1 + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>@" + doc.blog_id + "</a>";
        div2 = "<div class='invitation-blog-id'>" + a + "</div>";
        languages = i18n[lang][get_language_text(doc.main_language)];
        if (doc.available_languages.length > 0) {
            for (var i = 0; i < doc.available_languages.length; i++) {
                if (
                    lang === "en" ||
                    lang === "ko"
                ) {
                    languages = languages + ", " + i18n[lang][get_language_text(doc.available_languages[i])];
                } else {
                    languages = languages + "、" + i18n[lang][get_language_text(doc.available_languages[i])];
                }
            }
        }
        /*div2 = div2 + "<div class='user-languages'>" + languages + "</div>";*/
        translation_languages = get_user_translation_languages(doc);
        if (translation_languages !== "") {
            div2 = div2 + "<div class='user-translation-languages'>" + translation_languages + "</div>";
        }
        if (doc.employment.length > 0) {
            div2 = div2 + "<div class='invitation-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["employment"]("short", doc.employment[0])) +  "</div>";
        } else {
            if (doc.education.length > 0) {
                div2 = div2 + "<div class='invitation-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["education"]("short", doc.education[0])) +  "</div>";
            } else {
                if (doc.location.length > 0) {
                    div2 = div2 + "<div class='invitation-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["location"]("short", doc.location[0])) +  "</div>";
                } else {
                    if (doc.simple_career !== "") {
                        div2 = div2 + "<div class='invitation-info'>" + get_encoded_html_preventing_xss(doc.simple_career) +  "</div>";
                    } else {
                        if (doc.prize.length > 0) {
                            div2 = div2 + "<div class='invitation-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["prize"]("short", doc.prize[0])) +  "</div>";
                        }
                    }
                }
            }
        }
        invitation_item_middle = "<div class='invitation-item-middle'>" + div1 + div2 + "</div>";
        img = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/invitations.png" + css_version + "'>";
        span1 = "<span style='vertical-align:middle;'>" + i18n[lang].invite + "</span>";
        span1 = span1 + "<img class='emoticon-small-img2' src='" + aws_s3_url + "/icons/add.png'>";
        div1 = "<div class='request-invitation' data-blog-id='" + doc.blog_id + "' data-type='" + invitation_obj.article_type + "' data-id='" + invitation_obj.article_id + "'>" + img + span1 + "</div>";
        invitation_item_right = "<div class='invitation-item-right3'>" + div1 + "</div>";
        return "<div class='invitation-item'>" + invitation_item_left + invitation_item_middle + invitation_item_right + "</div>";
    } else if (type === "search") {
        img = "<img src='" + doc.img + "'>";
        invitation_item_img_wrapper = "<div class='invitation-item-img-wrapper'>" + img + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>" + invitation_item_img_wrapper + "</a>";
        invitation_item_left = "<div class='invitation-item-left'>" + a + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>" + get_encoded_html_preventing_xss(doc.name) + "</a>";
        span1 = "<span class='invitation-user-name'>" + a + "</span>";
        div1 = "<div>" + span1 + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>@" + doc.blog_id + "</a>";
        div2 = "<div class='invitation-blog-id'>" + a + "</div>";
        languages = i18n[lang][get_language_text(doc.main_language)];
        if (doc.available_languages !== "") {
            for (var i = 0; i < doc.available_languages.length; i++) {
                if (
                    lang === "en" ||
                    lang === "ko"
                ) {
                    languages = languages + ", " + i18n[lang][get_language_text(doc.available_languages[i])];
                } else {
                    languages = languages + "、" + i18n[lang][get_language_text(doc.available_languages[i])];
                }
            }
        }
        /*div2 = div2 + "<div class='user-languages'>" + languages + "</div>";*/
        if (doc.employment.length > 0) {
            div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["employment"]("short", doc.employment[0])) +  "</div>";
        } else {
            if (doc.education.length > 0) {
                div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["education"]("short", doc.education[0])) +  "</div>";
            } else {
                if (doc.location.length > 0) {
                    div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["location"]("short", doc.location[0])) +  "</div>";
                } else {
                    if (doc.simple_career !== "") {
                        simple_career = "";
                        for (var i = 0; i < doc.simple_career.length; i++) {
                            if (simple_career === "") {
                                simple_career = doc.simple_career[i];
                            } else {
                                if (
                                    lang === "en" ||
                                    lang === "ko"
                                ) {
                                    simple_career = simple_career + ", " + doc.simple_career[i];
                                } else {
                                    simple_career = simple_career + "、" + doc.simple_career[i];
                                }
                            }
                        }
                        div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(simple_career) +  "</div>";
                    } else {
                        if (doc.prize.length > 0) {
                            div2 = div2 + "<div class='friend-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["prize"]("short", doc.prize[0])) +  "</div>";
                        }
                    }
                }
            }
        }
        invitation_item_middle = "<div class='invitation-item-middle'>" + div1 + div2 + "</div>";
        img = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/invitations.png" + css_version + "'>";
        span1 = "<span style='vertical-align:middle;'>" + i18n[lang].invite + "</span>";
        span1 = span1 + "<img class='emoticon-small-img2' src='" + aws_s3_url + "/icons/add.png'>";
        div1 = "<div class='request-invitation' data-blog-id='" + doc.blog_id + "' data-type='" + invitation_obj.article_type + "' data-id='" + invitation_obj.article_id + "'>" + img + span1 + "</div>";
        invitation_item_right = "<div class='invitation-item-right3'>" + div1 + "</div>";
        return "<div class='invitation-item'>" + invitation_item_left + invitation_item_middle + invitation_item_right + "</div>";
    } else {
        return "";
    }
};

get["single"]["perfect"]["request"]  = function (doc, type) {
    var lang = $("body").attr("data-lang")
        , css_version = $("body").attr("data-css-version")
        , temp
        , a
        , img
        , user
        , request
        , request_type
        , request_item
        , request_item_img_wrapper
        , request_item_left
        , request_item_middle
        , request_item_right
        , request_item_middle_right
        , span1
        , span2
        , span3
        , div1
        , div2
        , div3 = ""
        , languages
        , simple_career
        , translation_languages
        , updated_at
        , updated_at_wrapper
        , ul
        , li
        , is_loginned = $("body").attr("data-check") === "true"
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null;
    if (is_loginned === true) {
        if (user_profile_link && user_profile_link !== "/set/blog-id") {
            current_user_blog_id = user_profile_link.split('/')[2];
        } else {
            return "";
        }
    } else {
        return "";
    }
    if (is_loginned === false) {
        return "";
    }
    if (lang === undefined) {
        lang = "en";
    }
    if (request_obj.big_type === "opinion_request") {
        request_type = "opinion";
    } else if (request_obj.big_type === "translation_request") {
        request_type = "translation";
    } else {
        return "";
    }
    if (type === "recommended_users") {
        img = "<img src='" + doc.img + "'>";
        request_item_img_wrapper = "<div class='request-item-img-wrapper'>" + img + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>" + request_item_img_wrapper + "</a>";
        request_item_left = "<div class='request-item-left'>" + a + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>" + get_encoded_html_preventing_xss(doc.name) + "</a>";
        span1 = "<span class='request-user-name'>" + a + "</span>";
        div1 = "<div>" + span1 + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>@" + doc.blog_id + "</a>";
        div2 = "<div class='request-blog-id'>" + a + "</div>";
        if (request_obj.big_type === "opinion_request") {
            if (doc.info) {
                span3 = "";
                for (var i = 0; i < doc.info.length; i++) {
                    temp = "<span class='type-label-right'>" + get_encoded_html_preventing_xss(doc.info[i].key) + " (" + doc.info[i].count + ")</span>";
                    span3 = span3 + temp;
                }
                if (span3 !== "") {
                    div3 = "<div>" + span3 + "</div>";
                } else {
                    div3 = "";
                }
            } else {
                div3 = "";
            }
        } else {
            languages = i18n[lang][get_language_text(doc.main_language)];
            if (doc.available_languages.length > 0) {
                for (var i = 0; i < doc.available_languages.length; i++) {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        languages = languages + ", " + i18n[lang][get_language_text(doc.available_languages[i])];
                    } else {
                        languages = languages + "、" + i18n[lang][get_language_text(doc.available_languages[i])];
                    }
                }
            }
            /*div3 = "<div class='user-languages'>" + languages + "</div>";*/
            translation_languages = get_user_translation_languages(doc);
            if (translation_languages !== "") {
                div3 = div3 + "<div class='user-translation-languages'>" + translation_languages + "</div>";
            }
        }
        request_item_middle = "<div class='request-item-middle'>" + div1 + div2 + div3 + "</div>";
        img = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/request-" + request_type + "-selected.png" + css_version + "'>";
        span1 = "<span style='vertical-align:middle;'>" + i18n[lang].request + "</span>";
        span1 = span1 + "<img class='emoticon-small-img2' src='" + aws_s3_url + "/icons/add.png'>";
        if (request_obj.big_type === "opinion_request") {
            div1 = "<div class='request-help' data-blog-id='" + doc.blog_id + "' data-type='" + request_obj.article_type + "' data-id='" + request_obj.article_id + "' data-request-type='" + request_type + "'>" + img + span1 + "</div>";
        } else {
            div1 = "<div class='request-help' data-blog-id='" + doc.blog_id + "' data-type='" + request_obj.article_type + "' data-id='" + request_obj.article_id + "' data-request-type='" + request_type + "' data-source-lang='" + request_obj.source_lang + "' data-target-lang='" + request_obj.target_lang + "'>" + img + span1 + "</div>";
        }
        request_item_right = "<div class='request-item-right3'>" + div1 + "</div>";
        return "<div class='request-item'>" + request_item_left + request_item_middle + request_item_right + "</div>";
    } else if (type === "friends") {
        img = "<img src='" + doc.img + "'>";
        request_item_img_wrapper = "<div class='request-item-img-wrapper'>" + img + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>" + request_item_img_wrapper + "</a>";
        request_item_left = "<div class='request-item-left'>" + a + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>" + get_encoded_html_preventing_xss(doc.name) + "</a>";
        span1 = "<span class='request-user-name'>" + a + "</span>";
        div1 = "<div>" + span1 + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>@" + doc.blog_id + "</a>";
        div2 = "<div class='request-blog-id'>" + a + "</div>";
        languages = i18n[lang][get_language_text(doc.main_language)];
        if (doc.available_languages.length > 0) {
            for (var i = 0; i < doc.available_languages.length; i++) {
                if (
                    lang === "en" ||
                    lang === "ko"
                ) {
                    languages = languages + ", " + i18n[lang][get_language_text(doc.available_languages[i])];
                } else {
                    languages = languages + "、" + i18n[lang][get_language_text(doc.available_languages[i])];
                }
            }
        }
        /*div2 = div2 + "<div class='user-languages'>" + languages + "</div>";*/
        translation_languages = get_user_translation_languages(doc);
        if (translation_languages !== "") {
            div2 = div2 + "<div class='user-translation-languages'>" + translation_languages + "</div>";
        }
        if (doc.employment.length > 0) {
            div2 = div2 + "<div class='request-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["employment"]("short", doc.employment[0])) +  "</div>";
        } else {
            if (doc.education.length > 0) {
                div2 = div2 + "<div class='request-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["education"]("short", doc.education[0])) +  "</div>";
            } else {
                if (doc.location.length > 0) {
                    div2 = div2 + "<div class='request-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["location"]("short", doc.location[0])) +  "</div>";
                } else {
                    if (doc.simple_career !== "") {
                        div2 = div2 + "<div class='request-info'>" + get_encoded_html_preventing_xss(doc.simple_career) +  "</div>";
                    } else {
                        if (doc.prize.length > 0) {
                            div2 = div2 + "<div class='request-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["prize"]("short", doc.prize[0])) +  "</div>";
                        }
                    }
                }
            }
        }
        request_item_middle = "<div class='request-item-middle'>" + div1 + div2 + "</div>";
        img = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/request-" + request_type + "-selected.png" + css_version + "'>";
        span1 = "<span style='vertical-align:middle;'>" + i18n[lang].request + "</span>";
        span1 = span1 + "<img class='emoticon-small-img2' src='" + aws_s3_url + "/icons/add.png'>";
        if (request_obj.big_type === "opinion_request") {
            div1 = "<div class='request-help' data-blog-id='" + doc.blog_id + "' data-type='" + request_obj.article_type + "' data-id='" + request_obj.article_id + "' data-request-type='" + request_type + "'>" + img + span1 + "</div>";
        } else {
            div1 = "<div class='request-help' data-blog-id='" + doc.blog_id + "' data-type='" + request_obj.article_type + "' data-id='" + request_obj.article_id + "' data-request-type='" + request_type + "' data-source-lang='" + request_obj.source_lang + "' data-target-lang='" + request_obj.target_lang + "'>" + img + span1 + "</div>";
        }
        request_item_right = "<div class='request-item-right3'>" + div1 + "</div>";
        return "<div class='request-item'>" + request_item_left + request_item_middle + request_item_right + "</div>";
    } else if (type === "search") {
        img = "<img src='" + doc.img + "'>";
        request_item_img_wrapper = "<div class='request-item-img-wrapper'>" + img + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>" + request_item_img_wrapper + "</a>";
        request_item_left = "<div class='request-item-left'>" + a + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>" + get_encoded_html_preventing_xss(doc.name) + "</a>";
        span1 = "<span class='request-user-name'>" + a + "</span>";
        div1 = "<div>" + span1 + "</div>";
        a = "<a href='/blog/" + doc.blog_id + "' target='_blank'>@" + doc.blog_id + "</a>";
        div2 = "<div class='request-blog-id'>" + a + "</div>";
        languages = i18n[lang][get_language_text(doc.main_language)];
        if (doc.available_languages !== "") {
            for (var i = 0; i < doc.available_languages.length; i++) {
                if (
                    lang === "en" ||
                    lang === "ko"
                ) {
                    languages = languages + ", " + i18n[lang][get_language_text(doc.available_languages[i])];
                } else {
                    languages = languages + "、" + i18n[lang][get_language_text(doc.available_languages[i])];
                }
            }
        }
        /*div2 = div2 + "<div class='user-languages'>" + languages + "</div>";*/
        if (doc.employment.length > 0) {
            div2 = div2 + "<div class='request-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["employment"]("short", doc.employment[0])) +  "</div>";
        } else {
            if (doc.education.length > 0) {
                div2 = div2 + "<div class='request-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["education"]("short", doc.education[0])) +  "</div>";
            } else {
                if (doc.location.length > 0) {
                    div2 = div2 + "<div class='request-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["location"]("short", doc.location[0])) +  "</div>";
                } else {
                    if (doc.simple_career !== "") {
                        simple_career = "";
                        for (var i = 0; i < doc.simple_career.length; i++) {
                            if (simple_career === "") {
                                simple_career = doc.simple_career[i];
                            } else {
                                if (
                                    lang === "en" ||
                                    lang === "ko"
                                ) {
                                    simple_career = simple_career + ", " + doc.simple_career[i];
                                } else {
                                    simple_career = simple_career + "、" + doc.simple_career[i];
                                }
                            }
                        }
                        div2 = div2 + "<div class='request-info'>" + get_encoded_html_preventing_xss(simple_career) +  "</div>";
                    } else {
                        if (doc.prize.length > 0) {
                            div2 = div2 + "<div class='request-info'>" + get_encoded_html_preventing_xss(get_one_line_profile["prize"]("short", doc.prize[0])) +  "</div>";
                        }
                    }
                }
            }
        }
        request_item_middle = "<div class='request-item-middle'>" + div1 + div2 + "</div>";
        img = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/request-" + request_type + "-selected.png" + css_version + "'>";
        span1 = "<span style='vertical-align:middle;'>" + i18n[lang].request + "</span>";
        span1 = span1 + "<img class='emoticon-small-img2' src='" + aws_s3_url + "/icons/add.png'>";
        if (request_obj.big_type === "opinion_request") {
            div1 = "<div class='request-help' data-blog-id='" + doc.blog_id + "' data-type='" + request_obj.article_type + "' data-id='" + request_obj.article_id + "' data-request-type='" + request_type + "'>" + img + span1 + "</div>";
        } else {
            div1 = "<div class='request-help' data-blog-id='" + doc.blog_id + "' data-type='" + request_obj.article_type + "' data-id='" + request_obj.article_id + "' data-request-type='" + request_type + "' data-source-lang='" + request_obj.source_lang + "' data-target-lang='" + request_obj.target_lang + "'>" + img + span1 + "</div>";
        }
        request_item_right = "<div class='request-item-right3'>" + div1 + "</div>";
        return "<div class='request-item'>" + request_item_left + request_item_middle + request_item_right + "</div>";
    } else {
        return "";
    }
};

get["single"]["form"]["short_answer"] = function (number, doc) {
    var lang = $("body").attr("data-lang")
        , css_version = $("body").attr("data-css-version")
        , span
        , max_length = 500
        , answer_maximum_length
        , span2
        , temp
        , img
        , option
        , option_list
        , div
        , online_interview_question_item_remove
        , question_label
        , online_interview_question_wrapper
        , online_interview_question
        , online_interview_answer_maximum_length_wrapper;
    if (lang === undefined) {
        lang = "en";
    }
    span = "<span class='write-label question-label'>" + i18n[lang].question + "&nbsp;" + number + "</span>";
    img = "<img src='" + aws_s3_url + "/icons/remove.png" + css_version + "'>";
    div = "<div>" + img + "</div>";
    online_interview_question_item_remove = "<div class='online-interview-question-item-remove'>" + div + "</div>";
    question_label = "<div>" + span + online_interview_question_item_remove + "</div>";
    if (doc) {
        online_interview_question = "<textarea class='online-interview-question'>" + get_encoded_html_preventing_xss(doc.question) + "</textarea>";
    } else {
        online_interview_question = "<textarea class='online-interview-question'></textarea>";
    }
    online_interview_question_wrapper = "<div class='online-interview-question-wrapper'>" + online_interview_question + "</div>";
    span = "<span class='write-label'>" + i18n[lang].answer_maximum_length + "</span>";
    option_list = "";
    if (doc) {
        max_length = doc.max_length;
    }
    for (var i = 1; i <= 10; i++) {
        temp = i * 100;
        if (temp === max_length) {
            option = "<option value='" + temp + "' selected='selected'>" + temp + "</option>";
        } else {
            option = "<option value='" + temp + "'>" + temp + "</option>";
        }
        option_list = option_list + option;
    }
    answer_maximum_length = "<select class='answer-maximum-length'>" + option_list + "</select>";
    online_interview_answer_maximum_length_wrapper = "<div class='answer-maximum-length-wrapper'>" + span + answer_maximum_length + "</div>";
    return "<div class='online-interview-question-item' data-type='short-answer'>" + question_label +  online_interview_question_wrapper + online_interview_answer_maximum_length_wrapper + "</div>";
};
get["single"]["form"]["multiple_choice"] = function (number, doc) {
    var lang = $("body").attr("data-lang")
        , css_version = $("body").attr("data-css-version")
        , span
        , span2
        , img
        , div
        , online_interview_question_item_remove
        , question_label
        , online_interview_question_wrapper
        , online_interview_question
        , choice
        , write_label
        , choice_add
        , choices
        , choice_item
        , choice_index
        , choice_input_wrapper
        , choice_input
        , choice_remove_wrapper
        , choice_remove;
    if (lang === undefined) {
        lang = "en";
    }
    span = "<span class='write-label question-label'>" + i18n[lang].question + "&nbsp;" + number + "</span>";
    img = "<img src='" + aws_s3_url + "/icons/remove.png" + css_version + "'>";
    div = "<div>" + img + "</div>";
    online_interview_question_item_remove = "<div class='online-interview-question-item-remove'>" + div + "</div>";
    question_label = "<div>" + span + online_interview_question_item_remove + "</div>";
    if (doc) {
        online_interview_question = "<textarea class='online-interview-question'>" + get_encoded_html_preventing_xss(doc.question) + "</textarea>";
    } else {
        online_interview_question = "<textarea class='online-interview-question'></textarea>";
    }
    online_interview_question_wrapper = "<div class='online-interview-question-wrapper'>" + online_interview_question + "</div>";
    write_label = "<div class='write-label'>" + i18n[lang].choices + "</div>";
    img = "<img src='" + aws_s3_url + "/icons/add.png" + css_version + "'>";
    div = "<div>" + img + "</div>";
    choice_add = "<div class='choice-add'>" + div + "</div>";
    choice = "<div class='choice'>" + write_label + choice_add + "</div>";
    choice_item = "";
    if (doc) {
        for (var x = 0; x < doc.choices.length; x++) {
            choice_index = "<div class='choice-index'>" + (x + 1) + "</div>";
            choice_input = "<input class='choice-input' type='text' placeholder='' value='" + get_encoded_html_preventing_xss(doc.choices[x].choice) + "'>";
            choice_input_wrapper = "<div class='choice-input-wrapper'>" + choice_input + "</div>";
            img = "<img src='" + aws_s3_url + "/icons/remove.png" + css_version + "'>";
            choice_remove = "<div class='choice-remove'>" + img + "</div>";
            choice_remove_wrapper = "<div class='choice-remove-wrapper'>" + choice_remove + "</div>";
            choice_item = choice_item + "<div class='choice-item'>" + choice_index + choice_input_wrapper + choice_remove_wrapper + "</div>";
        }
    } else {
        for (var x = 0; x < 3; x++) {
            choice_index = "<div class='choice-index'>" + (x + 1) + "</div>";
            choice_input = "<input class='choice-input' type='text' placeholder=''>";
            choice_input_wrapper = "<div class='choice-input-wrapper'>" + choice_input + "</div>";
            img = "<img src='" + aws_s3_url + "/icons/remove.png" + css_version + "'>";
            choice_remove = "<div class='choice-remove'>" + img + "</div>";
            choice_remove_wrapper = "<div class='choice-remove-wrapper'>" + choice_remove + "</div>";
            choice_item = choice_item + "<div class='choice-item'>" + choice_index + choice_input_wrapper + choice_remove_wrapper + "</div>";
        }
    }
    choices = "<div class='choices'>" + choice_item + "</div>";
    return "<div class='online-interview-question-item' data-type='multiple-choice'>" + question_label +  online_interview_question_wrapper + choice + choices + "</div>";
};
get["list"] = function (docs, list_type, print_type) {
    var final="";
    for (var i = 0; i < docs.length; i++) {
        if (
            list_type === "agenda_opinion" ||
            list_type === "blog_gallery" ||
            list_type === "debate" ||
            list_type === "agenda" ||
            list_type === "opinion" ||
            list_type === "translation" ||
            list_type === "blog" ||
            list_type === "gallery"
        ) {
            final = final + get["single"][print_type]["article"](docs[i]);
        } else {
            if (
                list_type === "apply_now" ||
                list_type === "hire_me"
            ) {
                final = final + get["single"][print_type]["employment"](docs[i]);
            } else {
                final = final + get["single"][print_type][list_type](docs[i]);
            }
        }
    }
    return final;
};
get["list_from_god"] = function (obj) {
    var data = {};
    if (
        obj["list_type"] !== "apply_now" &&
        obj["list_type"] !== "hire_me" &&
        obj["list_type"] !== "announcement" &&
        obj["list_type"] !== "answer" &&
        obj["list_type"] !== "user" &&
        obj["list_type"] !== "agenda_opinion" &&
        obj["list_type"] !== "blog_gallery" &&
        obj["list_type"] !== "image" &&
        obj["list_type"] !== "debate" &&
        obj["list_type"] !== "agenda" &&
        obj["list_type"] !== "opinion" &&
        obj["list_type"] !== "translation" &&
        obj["list_type"] !== "gallery" &&
        obj["list_type"] !== "guestbook" &&
        obj["list_type"] !== "blog"
    ) {
        return obj.f_cb();
    } else {
        data["list_type"] = encodeURIComponent(obj["list_type"]);
    }
    if (obj["list_type"] === "agenda") {
        data["agenda_menu"] = encodeURIComponent(obj["agenda_menu"]);
    }
    if (
        obj["type"] !== "all" &&
        obj["type"] !== "announcement" &&
        obj["type"] !== "answer" &&
        obj["type"] !== "main_tag" &&
        obj["type"] !== "tags" &&
        obj["type"] !== "text_search" &&
        obj["type"] !== "ranking" &&
        obj["type"] !== "popular_opinions_of_agenda" &&
        obj["type"] !== "serial_opinions_of_agenda" &&
        obj["type"] !== "blog_articles"
    ) {
        return obj["f_cb"]();
    } else {
        data["type"] = encodeURIComponent(obj["type"]);
    }
    if (obj["updated_at"]) {
        data["updated_at"] = encodeURIComponent(obj["updated_at"]);
    }
    if (obj["type"] === "main_tag") {
        try {
            data["main_tag"] = encodeURIComponent(obj["main_tag"]);
        } catch(e) {
            return false;
        }
    } else if (obj["type"] === "tags") {
        try {
            data["tags"] = encodeURIComponent(JSON.stringify(obj["tags"]));
        } catch(e) {
            return false;
        }
    } else if (obj["type"] === "text_search") {
        try {
            data["skip"] = encodeURIComponent(obj["skip"]);
            data["query"] = encodeURIComponent(obj["query"]);
        } catch(e) {
            return false;
        }
    } else if (obj["type"] === "ranking") {
        try {
            data["ranking"] = encodeURIComponent(obj["ranking"]);
        } catch(e) {
            return false;
        }
    } else if (obj["type"] === "announcement") {
        try {
            data["article_id"] = encodeURIComponent(obj["article_id"]);
            data["created_at"] = encodeURIComponent(obj["created_at"]);
        } catch(e) {
            return false;
        }
    } else if (obj["type"] === "answer") {
        try {
            data["article_id"] = encodeURIComponent(obj["article_id"]);
            data["created_at"] = encodeURIComponent(obj["created_at"]);
        } catch(e) {
            return false;
        }
    } else if (obj["type"] === "popular_opinions_of_agenda") {
        try {
            data["agenda_id"] = encodeURIComponent(obj["agenda_id"]);
            data["skip"] = encodeURIComponent(obj["skip"]);
        } catch(e) {
            return false;
        }
    } else if (obj["type"] === "serial_opinions_of_agenda") {
        try {
            data["agenda_id"] = encodeURIComponent(obj["agenda_id"]);
            data["created_at"] = encodeURIComponent(obj["created_at"]);
        } catch(e) {
            return false;
        }
    } else if (obj["type"] === "blog_articles") {
        try {
            data["blog_id"] = encodeURIComponent(obj["blog_id"]);
            if (obj["list_type"] === "blog") {
                data["blog_menu_id"] = encodeURIComponent(obj["blog_menu_id"]);
            } else if (
                obj["list_type"] === "hire_me" ||
                obj["list_type"] === "apply_now"
            ) {
                if (
                    obj["is_participation"] === undefined ||
                    obj["is_subscription"] === undefined
                ) {
                    return false;
                } else {
                    data["is_participation"] = encodeURIComponent(obj["is_participation"]);
                    data["is_subscription"] = encodeURIComponent(obj["is_subscription"]);
                }
            } else if (
                obj["list_type"] === "agenda" ||
                obj["list_type"] === "opinion" ||
                obj["list_type"] === "translation"
            ) {
                if (
                    obj["is_participation"] === undefined ||
                    obj["is_subscription"] === undefined ||
                    obj["agenda_menu"] === undefined
                ) {
                    return false;
                } else {
                    data["is_participation"] = encodeURIComponent(obj["is_participation"]);
                    data["is_subscription"] = encodeURIComponent(obj["is_subscription"]);
                    data["agenda_menu"] = encodeURIComponent(obj["agenda_menu"]);
                }
            } else if (obj["list_type"] === "guestbook") {
                if (obj["created_at"] === undefined) {
                    return false;
                } else {
                    data["created_at"] = encodeURIComponent(obj["created_at"]);
                }
            }
        } catch(e) {
            return false;
        }
    }
    var s_cb = function (result) {
        if ( result['response'] === true ) {
            return obj["s_cb"](result['docs']);
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                return obj["f_cb"]();
            }
        }
    };
    var f_cb = function () {
        return obj["f_cb"]();
    };
    methods["the_world"]["is_one"]({
        show_animation: false,
        data:data,
        pathname:"/get/list",
        s_cb:s_cb,
        f_cb:f_cb
    });
};
var get_fill = {};
get_fill["announcements_of_apply_now"] = function (obj) {
    var lang = $("body").attr("data-lang")
        , data = {}
        , s_cb
        , f_cb;
    if (lang === undefined) {
        lang = "en";
    }
    data.article_id = encodeURIComponent(obj["article_id"]);
    if (obj.created_at !== undefined) {
        data.created_at = encodeURIComponent(obj["created_at"]);
    }
    s_cb = function (result) {
        if (result['response'] === true) {
            if (result['docs'].length === 0) {
                if (obj["is_modal"] === true) {
                    if (obj["is_new"] === true) {
                        $('#announcement-list-modal').empty().append("<div class='announcement-none'>" + i18n[lang].there_is_no_writing + "</div>");
                    }
                    $('#announcement-more-modal').css('display', 'none');
                } else {
                    if (obj["is_new"] === true) {
                        $('#announcement-list').empty().append("<div class='announcement-none'>" + i18n[lang].there_is_no_writing + "</div>");
                    }
                    $('#announcement-more').css('display', 'none');
                }
            } else {
                var final_list = get["list"](result['docs'], "announcement", "perfect");
                if (obj["is_modal"] === true) {
                    if (obj["is_new"] === true) {
                        $('#announcement-list-modal').empty().append(final_list);
                    } else {
                        $('#announcement-list-modal').append(final_list);
                    }
                    if (result['docs'].length < limit["apply_now_announcements"]) {
                        $('#announcement-more-modal').css('display', 'none');
                    } else {
                        $('#announcement-more-modal').css('display', 'block');
                    }
                } else {
                    if (obj["is_new"] === true) {
                        $('#announcement-list').empty().append(final_list);
                    } else {
                        $('#announcement-list').append(final_list);
                    }
                    if (result['docs'].length < limit["apply_now_announcements"]) {
                        $('#announcement-more').css('display', 'none');
                    } else {
                        $('#announcement-more').css('display', 'block');
                    }
                }
            }
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                if (obj["is_modal"] === true) {
                    if (obj["is_new"] === true) {
                        $('#announcement-list-modal').empty().append("<div class='announcement-none'>" + i18n[lang].there_is_no_writing + "</div>");
                    }
                    $('#announcement-more-modal').css('display', 'none');
                } else {
                    if (obj["is_new"] === true) {
                        $('#announcement-list').empty().append("<div class='announcement-none'>" + i18n[lang].there_is_no_writing + "</div>");
                    }
                    $('#announcement-more').css('display', 'none');
                }
            }
        }
    };
    f_cb = function () {};
    methods["the_world"]["is_one"]({
        show_animation: true,
        data: data,
        pathname:"/get/announcements-of-apply-now",
        s_cb:s_cb,
        f_cb:f_cb
    });
};
var callback_btn_view_announcement = function (obj) {
    var lang = $("body").attr("data-lang")
        , css_version = $("body").attr("data-css-version");
    if (lang === undefined) {
        lang = "en";
    }
    obj["$written"].find(".answer-wrapper:first").css("display", "none");
    obj["$written"].find(".btn-online-interview:first").removeClass("selected");
    obj["$written"].find(".btn-online-interview:first img").attr("src", aws_s3_url + "/icons/online-interview.png" + css_version);
    obj["$written"].find(".announcement-wrapper:first").css("display", "none");
    obj["$written"].find(".write-announcement-wrapper:first").empty().removeClass("opened");
    obj["$written"].find(".btn-announcement:first").removeClass("selected");
    obj["$written"].find(".btn-announcement:first img").attr("src", aws_s3_url + "/icons/announcement2.png" + css_version);
    obj["$written"].find(".comments-wrapper.outer-comments:first").empty().removeClass("opened");
    obj["$written"].find(".btn-open-comments:first").removeClass("selected");
    obj["$written"].find(".btn-open-comments:first img").attr("src", aws_s3_url + "/icons/comments.png" + css_version);
    if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
        star_editor_focuser.blur();
    }
    if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
        moon_editor_focuser.blur();
    }
    obj["$written"].find(".announcement-wrapper:first").css("display", "block");
    obj["$written"].find(".btn-announcement:first").addClass("selected");
    obj["$written"].find(".btn-announcement:first img").attr("src", aws_s3_url + "/icons/announcement2-selected.png");
    modal(".prompt#announcement-menu-prompt", "close");
    get_fill["announcements_of_apply_now"]({
        is_new: true
        , is_modal: obj["is_modal"]
        , article_id: obj["_id"]
    });
};
get_fill["answers_of_online_interview"] = function (obj) {
    var lang = $("body").attr("data-lang")
        , data = {}
        , s_cb
        , f_cb;
    if (lang === undefined) {
        lang = "en";
    }
    data.article_id = encodeURIComponent(obj["article_id"]);
    if (obj.created_at !== undefined) {
        data.created_at = encodeURIComponent(obj["created_at"]);
    }
    s_cb = function (result) {
        if (result['response'] === true) {
            if (result['docs'].length === 0) {
                if (obj["is_modal"] === true) {
                    if (obj["is_new"] === true) {
                        $('#answer-list-modal').empty().append("<div>" + i18n[lang].there_is_no_answer + "</div>");
                    }
                    $('#answer-more-modal').css('display', 'none');
                } else {
                    if (obj["is_new"] === true) {
                        $('#answer-list').empty().append("<div>" + i18n[lang].there_is_no_answer + "</div>");
                    }
                    $('#answer-more').css('display', 'none');
                }
            } else {
                for (var i = 0; i < result['docs'].length; i++) {
                    result['docs'][i].questions = result['questions'];
                }
                var final_list = get["list"](result['docs'], "answer", "perfect");
                if (obj["is_modal"] === true) {
                    if (obj["is_new"] === true) {
                        $('#answer-list-modal').empty().append(final_list);
                    } else {
                        $('#answer-list-modal').append(final_list);
                    }
                    if (result['docs'].length < limit["online_interview_answers"]) {
                        $('#answer-more-modal').css('display', 'none');
                    } else {
                        $('#answer-more-modal').css('display', 'block');
                    }
                } else {
                    if (obj["is_new"] === true) {
                        $('#answer-list').empty().append(final_list);
                    } else {
                        $('#answer-list').append(final_list);
                    }
                    if (result['docs'].length < limit["online_interview_answers"]) {
                        $('#answer-more').css('display', 'none');
                    } else {
                        $('#answer-more').css('display', 'block');
                    }
                }
            }
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                if (obj["is_modal"] === true) {
                    if (obj["is_new"] === true) {
                        $('#answer-list-modal').empty().append("<div>" + i18n[lang].there_is_no_answer + "</div>");
                    }
                    $('#answer-more-modal').css('display', 'none');
                } else {
                    if (obj["is_new"] === true) {
                        $('#answer-list').empty().append("<div>" + i18n[lang].there_is_no_answer + "</div>");
                    }
                    $('#answer-more').css('display', 'none');
                }
            }
        }
    };
    f_cb = function () {};
    methods["the_world"]["is_one"]({
        show_animation: true,
        data: data,
        pathname:"/get/answers-of-online-interview",
        s_cb:s_cb,
        f_cb:f_cb
    });
};
get_fill["opinions_of_agenda"] = function (obj) {
    var lang = $("body").attr("data-lang")
        , order_of_opinion_list
        , s_cb_opinions_of_agenda
        , f_cb_opinions_of_agenda
        , pathname;
    if (lang === undefined) {
        lang = "en";
    }
    s_cb_opinions_of_agenda = function (result) {
        if (result['response'] === true) {
            if (result['docs'].length === 0) {
                if (obj["is_modal"] === true) {
                    if (obj["is_new"] === true) {
                        $('.prompt#agenda-prompt #opinion-list-of-agenda-modal').empty().append("<div>" + i18n[lang].there_is_no_opinion + "</div>");
                    }
                    $('.prompt#agenda-prompt #opinion-more-of-agenda-modal').css('display', 'none');
                } else {
                    if (obj["is_new"] === true) {
                        $('.single-article-wrapper .written-agenda #opinion-list-of-agenda').empty().append("<div>" + i18n[lang].there_is_no_opinion + "</div>");
                    }
                    $('.single-article-wrapper .written-agenda #opinion-more-of-agenda').css('display', 'none');
                }
            } else {
                var final_list = get["list"](result['docs'], "agenda", "perfect");
                if (obj["is_modal"] === true) {
                    if (obj["is_new"] === true) {
                        $('.prompt#agenda-prompt #opinion-list-of-agenda-modal').empty().append(final_list);
                    } else {
                        $('.prompt#agenda-prompt #opinion-list-of-agenda-modal').append(final_list);
                    }
                    if (result['docs'].length < limit["opinions_of_agendas"]) {
                        $('.prompt#agenda-prompt #opinion-more-of-agenda-modal').css('display', 'none');
                    } else {
                        $('.prompt#agenda-prompt #opinion-more-of-agenda-modal').css('display', 'block');
                    }
                    if (obj["is_serial"] === false) {
                        $('.prompt#agenda-prompt #opinion-list-of-agenda-modal .popular-opinion-ranking-of-agenda').remove();
                        $('.prompt#agenda-prompt #opinion-list-of-agenda-modal .written-opinion').each(function (i) {
                            $(this).find(".written-title-wrapper:first").prepend("<span class='popular-opinion-ranking-of-agenda'>" + (i + 1) + "</span>");
                        });
                        $('.prompt#agenda-prompt #opinion-list-of-agenda-modal .popular-opinion-ranking-of-agenda:first').addClass('top');
                        if ($('.prompt#agenda-prompt #opinion-list-of-agenda-modal .popular-opinion-ranking-of-agenda:last').hasClass('top') === false) {
                            $('.prompt#agenda-prompt #opinion-list-of-agenda-modal .popular-opinion-ranking-of-agenda:last').addClass('bottom');
                        }
                    } else {
                        $('.prompt#agenda-prompt #opinion-list-of-agenda-modal .serial-opinion-order-of-agenda').remove();
                        order_of_opinion_list = $('.prompt#agenda-prompt #opinion-list-of-agenda-modal .written-opinion').length;
                        $('.prompt#agenda-prompt #opinion-list-of-agenda-modal .written-opinion').each(function (i) {
                            $(this).find(".written-title-wrapper:first").prepend("<span class='serial-opinion-order-of-agenda'>" + (order_of_opinion_list - i) + "</span>");
                        });
                    }
                } else {
                    if (obj["is_new"] === true) {
                        $('.single-article-wrapper .written-agenda #opinion-list-of-agenda').empty().append(final_list);
                    } else {
                        $('.single-article-wrapper .written-agenda #opinion-list-of-agenda').append(final_list);
                    }
                    if (result['docs'].length < limit["opinions_of_agendas"]) {
                        $('.single-article-wrapper .written-agenda #opinion-more-of-agenda').css('display', 'none');
                    } else {
                        $('.single-article-wrapper .written-agenda #opinion-more-of-agenda').css('display', 'block');
                    }
                    if (obj['is_serial'] === false) {
                        $('.single-article-wrapper .written-agenda #opinion-list-of-agenda .popular-opinion-ranking-of-agenda').remove();
                        $('.single-article-wrapper .written-agenda #opinion-list-of-agenda .written-opinion').each(function (i) {
                            $(this).find(".written-title-wrapper:first").prepend("<span class='popular-opinion-ranking-of-agenda'>" + (i + 1) + "</span>");
                        });
                        $('.single-article-wrapper .written-agenda #opinion-list-of-agenda .popular-opinion-ranking-of-agenda:first').addClass('top');
                        if ($('.single-article-wrapper .written-agenda #opinion-list-of-agenda .popular-opinion-ranking-of-agenda:last').hasClass('top') === false) {
                            $('.single-article-wrapper .written-agenda #opinion-list-of-agenda .popular-opinion-ranking-of-agenda:last').addClass('bottom');
                        }
                    } else {
                        $('.single-article-wrapper .written-agenda #opinion-list-of-agenda .serial-opinion-order-of-agenda').remove();
                        order_of_opinion_list = $('.single-article-wrapper .written-agenda #opinion-list-of-agenda .written-opinion').length;
                        $('.single-article-wrapper .written-agenda #opinion-list-of-agenda .written-opinion').each(function (i) {
                            $(this).find(".written-title-wrapper:first").prepend("<span class='serial-opinion-order-of-agenda'>" + (order_of_opinion_list - i) + "</span>");
                        });
                    }
                    $('#written-wrapper .in-written').removeClass('in-written').addClass('in-body');
                }
            }
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                if (obj["is_modal"] === true) {
                    if (obj["is_new"] === true) {
                        $('.prompt#agenda-prompt #opinion-list-of-agenda-modal').empty().append("<div>" + i18n[lang].there_is_no_opinion + "</div>");
                    }
                    $('.prompt#agenda-prompt #opinion-more-of-agenda-modal').css('display', 'none');
                } else {
                    if (obj["is_new"] === true) {
                        $('.single-article-wrapper .written-agenda #opinion-list-of-agenda').empty().append("<div>" + i18n[lang].there_is_no_opinion + "</div>");
                    }
                    $('.single-article-wrapper .written-agenda #opinion-more-of-agenda').css('display', 'none');
                }
            }
        }
    };
    f_cb_opinions_of_agenda = function () {};
    if (obj["is_serial"] === true) {
        pathname = "/get/serial-opinions-of-agenda";
    } else {
        pathname = "/get/popular-opinions-of-agenda";
    }
    methods["the_world"]["is_one"]({
        show_animation: true,
        data:{
            type: encodeURIComponent("opinions_of_agenda")
            , agenda_id: encodeURIComponent(obj["agenda_id"])
        },
        pathname:pathname,
        s_cb:s_cb_opinions_of_agenda,
        f_cb:f_cb_opinions_of_agenda
    });
};
get_fill["translations_of_article"] = function (obj) {
    var lang = $("body").attr("data-lang")
        , _limit = limit["translations_of_articles"]
        , list_type = "translation"
        , _print_type = "perfect"
        , data = {}
        , s_cb
        , f_cb;
    if (lang === undefined) {
        lang = "en";
    }
    data["list_type"] = encodeURIComponent("translation");
    data["language"] = encodeURIComponent(obj.language);
    data["skip"] = encodeURIComponent(obj.skip);
    if (obj.type === "agenda") {
        data["agenda_id"] = encodeURIComponent(obj._id);
        data["type"] = encodeURIComponent("translated_agendas");
    } else if (obj.type === "opinion") {
        data["agenda_id"] = encodeURIComponent(obj.agenda_id);
        data["opinion_id"] = encodeURIComponent(obj._id);
        data["type"] = encodeURIComponent("translated_opinions");
    } else {
        obj.translation_more.css('display', 'none');
        return false;
    }
    f_cb = function () {
        obj.translation_more.css('display', 'none');
        if (obj.skip === 0) {
            obj.translation_list.empty().append("<div>" + i18n[lang].there_is_no_translation + "</div>");
        }
    };
    s_cb = function (result) {
        if ( result['response'] === true ) {
            var docs = result.docs;
            var scroll_position = $(".body-inner-main").scrollTop();
            var final_list = get["list"](docs, list_type, _print_type);
            obj.translation_list.append(final_list);
            $(".body-inner-main").scrollTop(scroll_position);
            if (docs.length < _limit) {
                obj.translation_more.css('display', 'none');
                if (docs.length === 0 && obj.skip === 0) {
                    obj.translation_list.empty().append("<div>" + i18n[lang].there_is_no_translation + "</div>");
                }
            } else {
                obj.translation_more.css('display', 'block');
            }
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                return f_cb();
            }
        }
    };
    methods["the_world"]["is_one"]({
        show_animation: true,
        data:data,
        pathname:"/get/list",
        s_cb:s_cb,
        f_cb:f_cb
    });
};
get["single_article_comment"] = function (obj, doc) {
    var li1 = ""
        , div1
        , div2
        , div3
        , div4
        , div5
        , div6
        , div7
        , div8
        , div9
        , div10
        , div11
        , a1
        , a2
        , a3
        , span1
        , span2
        , real_count
        , comment_input
        , comment_input_btns_wrapper
        , comment_input_wrapper = ""
        , lang = $("body").attr("data-lang")
        , type = obj["type"]
        , comment_type = obj["comment_type"]
        , link = obj["link"]
        , is_loginned = obj["is_loginned"]
        , css_version = $("body").attr("data-css-version")
        , is_awesome = false
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null
        , awesome_small_img
        , awesome_selected_small_img
        , comments_small_img;
    if (lang === undefined) {
        lang = "en";
    }
    if (is_loginned === true) {
        if (user_profile_link && user_profile_link !== "/set/blog-id") {
            current_user_blog_id = user_profile_link.split('/')[2];
        } else {
            is_loginned = false;
        }
    }
    awesome_small_img = "<img src='" + aws_s3_url + "/icons/awesome.png" + css_version + "'>";
    awesome_selected_small_img = "<img src='" + aws_s3_url + "/icons/awesome-selected.png" + css_version + "'>";
    comments_small_img = "<img src='" + aws_s3_url + "/icons/comments.png" + css_version + "'>";
    if (is_loginned === true) {
        comment_input = "<textarea class='edit-comment-input'></textarea>";
        comment_input = "<div class='edit-comment-middle'>" + comment_input + "</div>";
        comment_input_btns_wrapper = "<div class='edit-comment-form-btns-wrapper'><input class='btn-career edit-comment-cancel' type='button' value='" + i18n[lang].cancel + "'><input class='btn-career edit-comment-submit' type='submit' value='" + i18n[lang].check + "'></div>";
        comment_input_wrapper = "<form class='edit-comment-form'>" + comment_input + comment_input_btns_wrapper + "</form>";
        for (var i = 0; i < doc['likers'].length; i++) {
            if (current_user_blog_id === doc['likers'][i]) {
                is_awesome = true;
                break;
            }
        }
    } else {
        doc['name'] = "Gleant";
        if (doc.img.indexOf && doc.img.indexOf( "male.png") <= -1) {
            doc.img = aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
        }
    }
    div2 = "<div class='comment-content'>" + get_encoded_html_preventing_xss(doc["comment"]) + "</div>";
    div8 = "<div class='created-at-small' data-datetime='" + doc["created_at"] + "'>" + to_i18n_short_datetime(new Date(doc["created_at"])) + "</div>";
    if (comment_type === 1) {
        div4 = "<div class='comments-wrapper inner-comments'></div>";
        if (doc['count_comments'] > 0) {
            real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_comments']) + "</span>";
        } else {
            real_count = "<span class='real-count'></span>";
        }
        div10 = "<div class='btn-open-comments-small' data-type='" + type + "' data-count='" + doc["count_comments"] + "'>" + comments_small_img + i18n[lang].comments + real_count + "</div>";
        if (is_loginned === true) {
            if (type ==="guestbook") {
                div9 = "";
            } else {
                if (doc['count_awesome'] > 0) {
                    real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_awesome']) + "</span>";
                } else {
                    real_count = "<span class='real-count'></span>";
                }
                if (is_awesome === true) {
                    div9 = "<div class='btn-awesome-small selected loginned awesome-comment'" +
                        " data-id='" + doc['_id'] + "'" +
                        " data-type='" + doc['type'] + "'" +
                        " data-root-id='" + doc['root_id'] + "'" +
                        " data-link='" + doc['link'] + "'" +
                        " data-count='" + doc['count_awesome'] + "'" +
                        " data-blog-id='" + doc['blog_id'] + "'>" + awesome_selected_small_img + "<span>" + i18n[lang].awesome + "</span>" + real_count + "</div>";
                } else {
                    div9 = "<div class='btn-awesome-small loginned awesome-comment'" +
                        " data-id='" + doc['_id'] + "'" +
                        " data-type='" + doc['type'] + "'" +
                        " data-root-id='" + doc['root_id'] + "'" +
                        " data-link='" + doc['link'] + "'" +
                        " data-count='" + doc['count_awesome'] + "'" +
                        " data-blog-id='" + doc['blog_id'] + "'>" + awesome_small_img + "<span>" + i18n[lang].awesome + "</span>" + real_count + "</div>";
                }
            }
            if (type === "blog" || type === "gallery" || type === "guestbook") {
                div11 = "";
            } else {
                div11 = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/report.png" + css_version + "'>";
                div11 = div11 + "<span>" + i18n[lang].report + "</span>";
                div11 = "<div class='btn-report-small report-comment'>" + div11 + "</div>";
            }
        } else {
            if (type ==="guestbook") {
                div9 = "";
            } else {
                if (doc['count_awesome'] > 0) {
                    real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_awesome']) + "</span>";
                } else {
                    real_count = "<span class='real-count'></span>";
                }
                div9 = "<div class='btn-awesome-small awesome-comment' data-count='" + doc['count_awesome'] + "'>" + awesome_small_img + "<span>" + i18n[lang].awesome + "</span>" + real_count + "</div>";
            }
            div11 = "";
        }
        if (type === "deep") {
            a3 = "<div class='updated-at-wrapper'>" + div8 + "</div>";
        } else {
            a3 = "<a class='updated-at-wrapper' href='" + link + "?comment=" + doc["_id"] + "' target='_blank'>" + div8 + "</a>";
        }
    } else {
        div4 = "";
        div10 = "";
        if (is_loginned === true) {
            if (type ==="guestbook") {
                div9 = "";
            } else {
                if (doc['count_awesome'] > 0) {
                    real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_awesome']) + "</span>";
                } else {
                    real_count = "<span class='real-count'></span>";
                }
                if (is_awesome === true) {
                    div9 = "<div class='btn-awesome-small selected loginned awesome-inner-comment'" +
                        " data-id='" + doc['_id'] + "'" +
                        " data-type='" + doc['type'] + "'" +
                        " data-root-id='" + doc['root_id'] + "'" +
                        " data-link='" + doc['link'] + "'" +
                        " data-count='" + doc['count_awesome'] + "'" +
                        " data-blog-id='" + doc['blog_id'] + "'>" + awesome_selected_small_img + "<span>" + i18n[lang].awesome + "</span>" + real_count + "</div>";
                } else {
                    div9 = "<div class='btn-awesome-small loginned awesome-inner-comment'" +
                        " data-id='" + doc['_id'] + "'" +
                        " data-type='" + doc['type'] + "'" +
                        " data-root-id='" + doc['root_id'] + "'" +
                        " data-link='" + doc['link'] + "'" +
                        " data-count='" + doc['count_awesome'] + "'" +
                        " data-blog-id='" + doc['blog_id'] + "'>" + awesome_small_img + "<span>" + i18n[lang].awesome + "</span>" + real_count + "</div>";
                }
            }
            if (type === "blog" || type === "gallery" || type === "guestbook") {
                div11 = "";
            } else {
                div11 = "<img class='emoticon-img2' src='" + aws_s3_url + "/icons/report.png" + css_version + "'>";
                div11 = div11 + "<span>" + i18n[lang].report + "</span>";
                div11 = "<div class='btn-report-small report-inner-comment'>" + div11 + "</div>";
            }
        } else {
            if (type ==="guestbook") {
                div9 = "";
            } else {
                if (doc['count_awesome'] > 0) {
                    real_count = "<span class='real-count'>" + put_comma_between_three_digits(doc['count_awesome']) + "</span>";
                } else {
                    real_count = "<span class='real-count'></span>";
                }
                div9 = "<div class='btn-awesome-small awesome-inner-comment' data-count='" + doc['count_awesome'] + "'>" + awesome_small_img + "<span>" + i18n[lang].awesome + "</span>" + real_count + "</div>";
            }
            div11 = "";
        }
        if (type === "deep") {
            a3 = "<div class='updated-at-wrapper'>" + div8 + "</div>";
        } else {
            a3 = "<a class='updated-at-wrapper' href='" + link + "?comment=" + doc["outer_id"] + "&inner_comment=" + doc["_id"] + "' target='_blank'>" + div8 + "</a>";
        }
    }
    div3 = "<div class='comment-btns-wrapper'>" + div9 + div10 + div11 + "</div>";
    if (is_loginned === true) {
        span1 = "<span class='user-name'>" + get_encoded_html_preventing_xss(doc["name"]) + "</span>";
    } else {
        span1 = "<span class='user-name not-logged-in'>" + get_encoded_html_preventing_xss(doc["name"]) + "</span>";
    }
    a2 = "<a class='user-name-wrapper' href='/blog/" + doc["blog_id"] + "' target='_blank'>" + span1 + "</a>";
    div7 = "<div>" + a2 + "</div>";
    div6 = "<div class='user-profile-right-small'>" + div7 + a3 + "</div>";
    img1 = "<img src='" + doc["img"] + "' alt='" + get_encoded_html_preventing_xss(doc["name"]) +
        "' title='" + get_encoded_html_preventing_xss(doc["name"]) + "'>";
    a1 = "<a href='/blog/" + doc["blog_id"] + "' target='_blank'>" + img1 + "</a>";
    div5 = "<div class='user-profile-left-small'>" + a1 +  "</div>";
    div1 = "<div class='user-profile-small'>" + div5 + div6 +"</div>";
    var comment_remove = ""
        , comment_edit = "";
    if (current_user_blog_id !== null && current_user_blog_id === doc['blog_id']) {
        comment_remove = "<div class='remove comment-remove'>" + i18n[lang].remove + "</div>";
        comment_edit = "<div class='edit comment-edit'>" + i18n[lang].edit + "</div>";
    }
    if (comment_type === 1) {
        li1 = "<li class='comment'" +
            " data-id='" + doc["_id"] + "'" +
            " data-type='" + doc["type"] + "'" +
            " data-link='" + doc["link"] + "'" +
            " data-comment-type='" + doc["comment_type"] + "'" +
            " data-blog-id='" + doc["blog_id"] + "'" +
            " data-created-at='" + doc["created_at"] + "'>" +
            comment_remove + comment_edit +
            div1 + div2 + comment_input_wrapper + div3 + div4 + "</li>";
    } else {
        li1 = "<li class='comment'" +
            " data-id='" + doc["_id"] + "'" +
            " data-type='" + doc["type"] + "'" +
            " data-link='" + doc["link"] + "'" +
            " data-outer-id='" + doc["outer_id"] + "'" +
            " data-comment-type='" + doc["comment_type"] + "'" +
            " data-blog-id='" + doc["blog_id"] + "'" +
            " data-created-at='" + doc["created_at"] + "'>" +
            comment_remove + comment_edit +
            div1 + div2 + comment_input_wrapper + div3 + div4 +
            "</li>";
    }
    return li1;
};
get["article_comment_list"] = function (obj) {
    var article_comment_list = obj["article_comment_list"];
    if (
        article_comment_list === null ||
        article_comment_list === undefined ||
        article_comment_list.length === 0
    ) {
        return "";
    }
    var li_list = "";

    for (var i = 0; i < article_comment_list.length; i++) {
        li_list = li_list + get["single_article_comment"](obj, article_comment_list[i]);
    }
    return li_list;
};
get["single_perfect_news_with_comments"] = function (doc, comments) {
    var lang = $("body").attr("data-lang")
        , css_version = $("body").attr("data-css-version")
        , is_loginned = $("body").attr("data-check") === "true"
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null
        , user_img = ""
        , user_name = ""
        , news_info
        , news_site
        , news_title
        , news_item_counts_wrapper
        , write_news_comment_form
        , write_news_comment_form_data
        , news_comment_list
        , news_comment_more
        , news_comment_none
        , final
        , img
        , span1
        , div1
        , div2
        , div3;
    if (doc === null) {
        return "";
    } else {
        if (lang === undefined) {
            lang = "en";
        }
        if (user_profile_link === "/set/blog-id") {
            is_loginned = false;
        } else {
            if (user_profile_link) {
                current_user_blog_id = user_profile_link.split('/')[2];
            }
        }
        if (is_loginned === true) {
            user_name = get_encoded_html_preventing_xss($("#mobile-right-menu .user-profile-right .user-name").text()) || "";
            user_img = $("#mobile-right-menu .user-profile-left img").attr("src") || "";
        } else {
            user_name = "Gleant";
            user_img = aws_s3_url + "/icons/logo-square.png";
        }
        write_news_comment_form_data = "data-type='" + doc.type + "'" +
            " data-link='" + doc.link + "'" +
            " data-comment-type='1'";
        news_site = "<div class='news-site'>" + get_encoded_html_preventing_xss(doc.site) + "</div>";
        news_title = "<a class='news-title' href='" + doc.link + "' data-type='" + doc.type + "'>" + get_encoded_html_preventing_xss(doc.title) + "</a>";
        img = "<img src='" + aws_s3_url + "/icons/view-selected.png" + css_version + "' title='" + i18n[lang].view + "' alt='" + i18n[lang].view + "'>";
        span1 = "<span>" + put_comma_between_three_digits(doc.count_view) +  "</span>";
        div1 = "<div class='view-counts'>" + img + span1 + "</div>";
        img = "<img src='" + aws_s3_url + "/icons/comments-green.png" + css_version + "' title='" + i18n[lang].comments + "' alt='" + i18n[lang].comments + "'>";
        span1 = "<span>" + put_comma_between_three_digits(doc.count_comments) +  "</span>";
        div2 = "<div class='comments-counts'>" + img + span1 + "</div>";
        news_item_counts_wrapper = "<div class='news-item-counts-wrapper'>" + div1 + div2 + "</div>";
        news_info = "<div class='news-info'>" + news_site + news_title + news_item_counts_wrapper + "</div>";
        img = "<img src='" + user_img + "' alt='" + user_name + "' title='" + user_name + "'>";
        span1 = "<span class='write-comment-name'>" + user_name + "</span>";
        div1 = "<div class='write-comment-top'>" + img + span1 + "</div>";
        if (is_loginned === true) {
            div2 = "<div class='write-comment-middle'><textarea class='write-comment-input' placeholder=''></textarea></div>";
        } else {
            div2 = "<div class='write-comment-middle'><textarea class='write-comment-input' placeholder='" + i18n[lang].please_login + "'></textarea></div>";
        }
        div3 = "<div class='write-comment-bottom'><input class='btn-career write-comment-submit' type='submit' value='" + i18n[lang].check + "'></div>";
        write_news_comment_form = "<form class='write-comment-form'" + write_news_comment_form_data + ">" + div1 + div2 + div3 + "</form>";
        img = "<img class='btn-more-down-14' src='" + aws_s3_url + "/icons/more-down.png" + css_version + "'>";
        if (comments.length === 0) {
            news_comment_list = "<ul class='news-comment-list comments'></ul>";
            news_comment_none = "<div class='news-comment-none' style='display:block;'>" + i18n[lang].there_is_no_comment + "</div>";
            news_comment_more = "";
        } else {
            news_comment_list = "";
            for (var i = 0; i < comments.length; i++) {
                news_comment_list = news_comment_list + get["single_article_comment"]({type: comments[i].type, comment_type: 1, link: comments[i].link, is_loginned: is_loginned}, comments[i]);
            }
            news_comment_list = "<ul class='news-comment-list comments'>" + news_comment_list + "</ul>";
            news_comment_none = "<div class='news-comment-none'></div>";
            if (comments.length < limit["comments"]) {
                news_comment_more = "";
            } else {
                news_comment_more = "<div class='news-comment-more btn-more'>" + img + "</div>";
            }
        }
        final = news_info + write_news_comment_form + news_comment_list + news_comment_none + news_comment_more;
        return final;
    }
};
get["single_guestbook_comment"] = function (is_loginned, guestbook_id, blog_owner_blog_id, doc) {
    var element
        , div1
        , div2
        , div3
        , div4
        , div5
        , div6
        , div7
        , div8
        , a1
        , a2
        , updated_at_wrapper
        , span1
        , comment_input
        , comment_input_btns_wrapper
        , comment_input_wrapper = ""
        , lang = $("body").attr("data-lang")
        , user_profile_link = $('#desktop-user-menu ul a').attr('href')
        , current_user_blog_id = null
        , comment_remove = ""
        , comment_edit = "";
    if (lang === undefined) {
        lang = "en";
    }
    if (is_loginned === true) {
        if (user_profile_link && user_profile_link !== "/set/blog-id") {
            current_user_blog_id = user_profile_link.split('/')[2];
        } else {
            is_loginned = false;
        }
    }
    if (is_loginned === true) {
        if (current_user_blog_id === doc.blog_id) {
            comment_input = "<textarea class='edit-guestbook-comment-input'></textarea>";
            comment_input = "<div class='edit-guestbook-comment-middle'>" + comment_input + "</div>";
            comment_input_btns_wrapper = "<div class='edit-guestbook-comment-form-btns-wrapper'><input class='btn-career edit-guestbook-comment-cancel' type='button' value='" + i18n[lang].cancel + "'><input class='btn-career edit-guestbook-comment-submit' type='submit' value='" + i18n[lang].check + "'></div>";
            comment_input_wrapper = "<form class='edit-guestbook-comment-form'>" + comment_input + comment_input_btns_wrapper + "</form>";
        }
    } else {
        doc['name'] = 'Gleant';
        if (doc.img.indexOf && doc.img.indexOf( "male.png") <= -1) {
            doc.img = aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
        }
    }
    div2 = "<div class='guestbook-comment-content'>" + get_encoded_html_preventing_xss(doc["comment"]) + "</div>";
    div8 = "<div class='created-at-small without-text' data-datetime='" + doc["created_at"] + "'>" + to_i18n_short_datetime(new Date(doc["created_at"])) + "</div>";
    updated_at_wrapper = "<div class='updated-at-wrapper'>" + div8 + "</div>";
    if (is_loginned === true) {
        span1 = "<span class='user-name'>" + get_encoded_html_preventing_xss(doc["name"]) + "</span>";
    } else {
        span1 = "<span class='user-name not-logged-in'>" + get_encoded_html_preventing_xss(doc["name"]) + "</span>";
    }
    a2 = "<a class='user-name-wrapper' href='/blog/" + doc["blog_id"] + "' target='_blank'>" + span1 + "</a>";
    div7 = "<div>" + a2 + "</div>";
    div6 = "<div class='user-profile-right-small'>" + div7 + updated_at_wrapper + "</div>";
    img1 = "<img src='" + doc["img"] + "' alt='" + get_encoded_html_preventing_xss(doc["name"]) +
        "' title='" + get_encoded_html_preventing_xss(doc["name"]) + "'>";
    a1 = "<a href='/blog/" + doc["blog_id"] + "' target='_blank'>" + img1 + "</a>";
    div5 = "<div class='user-profile-left-small'>" + a1 +  "</div>";
    div1 = "<div class='user-profile-small'>" + div5 + div6 +"</div>";
    if (is_loginned === true) {
        if (current_user_blog_id !== null && current_user_blog_id === blog_owner_blog_id) {
            comment_remove = "<div class='remove guestbook-comment-remove'>" + i18n[lang].remove + "</div>";
        }
        if (current_user_blog_id !== null && current_user_blog_id === doc['blog_id']) {
            comment_remove = "<div class='remove guestbook-comment-remove'>" + i18n[lang].remove + "</div>";
            comment_edit = "<div class='edit guestbook-comment-edit'>" + i18n[lang].edit + "</div>";
        }
    }
    element = "<div class='guestbook-comment'" +
        " data-guestbook-id='" + guestbook_id + "'" +
        " data-profile-owner-blog-id='" + blog_owner_blog_id + "'" +
        " data-id='" + doc["_id"] + "'" +
        " data-blog-id='" + doc["blog_id"] + "'" +
        " data-created-at='" + doc["created_at"] + "'>" +
            comment_remove + comment_edit +
            div1 + div2 + comment_input_wrapper + "</div>";
    return element;
};