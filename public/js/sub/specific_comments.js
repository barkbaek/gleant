$(document).ready(function() {
    var search = window.location.search;
    search = search.substring(1, search.length);
    var search_list = search.split('&')
        , key
        , value
        , comment = undefined
        , inner_comment = undefined;
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    for (var i = 0; i < search_list.length; i++) {
        key = search_list[i].split('=')[0];
        value = search_list[i].split('=')[1];
        if (key === 'comment') {
            comment = value;
        } else if (key === 'inner_comment') {
            inner_comment = value;
        }
    }
    if (comment === undefined) {
        return false;
    }
    var link = window.location.pathname
        , temp = link.split('/')
        , data = {}
        , type;
    if (temp[1] === 'apply-now') {
        if (temp[3] === undefined) {
            if (temp[2] === undefined) {
                return false;
            } else {
                type = 'apply_now';
            }
        }
    } else if (temp[1] === 'hire-me') {
        if (temp[3] === undefined) {
            if (temp[2] === undefined) {
                return false;
            } else {
                type = 'hire_me';
            }
        }
    } else if (temp[1] === 'agenda') {
        if (temp[3] === undefined) {
            if (temp[2] === undefined) {
                return false;
            } else {
                type = 'agenda';
            }
        } else {
            if (temp[3] === 'opinion') {
                if (temp[4] === undefined) {
                    return false;
                } else {
                    if (temp[5] === undefined) {
                        type = 'opinion';
                    } else {
                        if (temp[5] === "tr" && temp[6] !== undefined) {
                            type = 'tr_opinion';
                        } else {
                            return false;
                        }
                    }
                }
            } else if (temp[3] === 'tr') {
                if (temp[4] !== undefined) {
                    type = 'tr_agenda';
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    } else if (temp[1] === 'blog') {
        if (temp[3] === undefined) {
            return false;
        } else {
            if (temp[3] === 'gallery') {
                if (temp[4] === undefined) {
                    return false;
                } else {
                    type = 'gallery';
                }
            } else {
                if (temp[4] === undefined) {
                    return false;
                } else {
                    type = 'blog';
                }
            }
        }
    } else {
        return false;
    }
    var user_name = get_encoded_html_preventing_xss($("#mobile-right-menu .user-profile-right .user-name").text()) || "";
    var user_img = $("#mobile-right-menu .user-profile-left img").attr("src") || "";
    var css_version = $("body").attr("data-css-version");
    var is_loginned = $("body").attr("data-check") === "true";
    var $wrapper
        , element_id
        , outer_id = comment
        , comment_type
        , write_comment_form_data
        , $comments_wrapper;
    var form1, div1, div2, div3, img1, ul1, span1;
    if (is_loginned === false) {
        user_name = "Gleant";
        user_img = aws_s3_url + "/icons/logo-square.png";
    }
    $wrapper =  $('.written-' + type);
    element_id = $wrapper.attr("id");
    $comments_wrapper = $wrapper.find(".comments-wrapper.outer-comments:first");
    comment_type = 1;
    write_comment_form_data = " data-type='" + type + "'" +
        " data-link='" + link + "'" +
        " data-comment-type='1'";
    $comments_wrapper.addClass("opened");
    img1 = "<img src='" + user_img + "' alt='" + get_encoded_html_preventing_xss(user_name) + "' title='" + get_encoded_html_preventing_xss(user_name) + "'>";
    span1 = "<span class='write-comment-name'>" + get_encoded_html_preventing_xss(user_name) + "</span>";
    div1 = "<div class='write-comment-top'>" + img1 + span1 + "</div>";
    if (is_loginned === true) {
        div2 = "<div class='write-comment-middle'><textarea class='write-comment-input' placeholder=''></textarea></div>";
    } else {
        div2 = "<div class='write-comment-middle'><textarea class='write-comment-input' placeholder='" + i18n[lang].please_login + "'></textarea></div>";
    }
    div3 = "<div class='write-comment-bottom'><input class='btn-career write-comment-submit' type='submit' value='" + i18n[lang].check + "'></div>";
    form1 = "<form class='write-comment-form'" + write_comment_form_data + ">" + div1 + div2 + div3 + "</form>";
    $comments_wrapper.append(form1);
    var s_cb
        , f_cb;
    s_cb = function (result) {
        var scroll_position = $(".body-inner-main").scrollTop();
        if (result.response === true) {
            ul1 = "<ul class='comments'>" + get["single_article_comment"]({
                    link: link,
                    comment_type: comment_type,
                    is_loginned: is_loginned,
                    type: type
                }, result.doc) + "</ul>";
            $comments_wrapper.append(ul1);
            /* $comments_wrapper.append(ul1).append("<div class='btn-more'><a class='scrollto' href='#" + element_id + "'>" + i18n[lang].go_up + "<img class='btn-more-up-12' src='" + aws_s3_url + "/icons/go-up.png" + css_version + "'></a></div>"); */
            $(".body-inner-main").scrollTop(scroll_position);
            if (inner_comment !== undefined) {
                $comments_wrapper = $wrapper.find(".comments-wrapper.inner-comments:first");
                comment_type = 2;
                write_comment_form_data = " data-type='" + type + "'" +
                    " data-link='" + link + "'" +
                    " data-outer-id='" + outer_id + "'" +
                    " data-comment-type='2'";
                $comments_wrapper.addClass("opened");
                img1 = "<img src='" + user_img + "' alt='" + get_encoded_html_preventing_xss(user_name) + "' title='" + get_encoded_html_preventing_xss(user_name) + "'>";
                span1 = "<span class='write-comment-name'>" + get_encoded_html_preventing_xss(user_name) + "</span>";
                div1 = "<div class='write-comment-top'>" + img1 + span1 + "</div>";
                if (is_loginned === true) {
                    div2 = "<div class='write-comment-middle'><textarea class='write-comment-input' placeholder=''></textarea></div>";
                } else {
                    div2 = "<div class='write-comment-middle'><textarea class='write-comment-input' placeholder='" + i18n[lang].please_login + "'></textarea></div>";
                }
                div3 = "<div class='write-comment-bottom'><input class='btn-career write-comment-submit' type='submit' value='" + i18n[lang].check + "'></div>";
                form1 = "<form class='write-comment-form'" + write_comment_form_data + ">" + div1 + div2 + div3 + "</form>";
                $comments_wrapper.append(form1);
                s_cb = function (result) {
                    var scroll_position = $(".body-inner-main").scrollTop();
                    if (result.response === true) {
                        var article_comment_list = result.docs;
                        ul1 = "<ul class='comments'>" + get["article_comment_list"]({
                                link: link,
                                comment_type: comment_type,
                                article_comment_list: article_comment_list,
                                is_loginned: is_loginned,
                                type: type
                            }) + "</ul>";
                        $comments_wrapper.append(ul1);
                        $(".body-inner-main").scrollTop(scroll_position);
                    } else {
                        if (result["msg"] === "no_blog_id") {
                            return window.location = "/set/blog-id";
                        } else {
                            scroll_position = $(".body-inner-main").scrollTop();
                            ul1 = "<ul class='comments'></ul>";
                            $comments_wrapper.append(ul1);
                            $(".body-inner-main").scrollTop(scroll_position);
                        }
                    }
                };
                f_cb = function () {
                    var scroll_position = $(".body-inner-main").scrollTop();
                    ul1 = "<ul class='comments'></ul>";
                    $comments_wrapper.append(ul1);
                    $(".body-inner-main").scrollTop(scroll_position);
                };
                methods["the_world"]["is_one"]({
                    show_animation: true,
                    data:{
                        link: encodeURIComponent(link)
                        , type: encodeURIComponent(type)
                        , outer_id: encodeURIComponent(outer_id)
                        , comment_type: encodeURIComponent(comment_type)
                        , is_lt: "true"
                    },
                    pathname:"/get/article-comments",
                    s_cb:s_cb,
                    f_cb:f_cb
                });
            }
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                scroll_position = $(".body-inner-main").scrollTop();
                ul1 = "<ul class='comments'></ul>";
                $comments_wrapper.append(ul1);
                /* $comments_wrapper.append(ul1).append("<div class='btn-more'><a class='scrollto' href='#" + element_id + "'>" + i18n[lang].go_up + "<img class='btn-more-up-12' src='" + aws_s3_url + "/icons/go-up.png" + css_version + "'></a></div>"); */
                $(".body-inner-main").scrollTop(scroll_position);
            }
        }
    };
    f_cb = function () {
        var scroll_position = $(".body-inner-main").scrollTop();
        ul1 = "<ul class='comments'></ul>";
        $comments_wrapper.append(ul1);
        /* $comments_wrapper.append(ul1).append("<div class='btn-more'><a class='scrollto' href='#" + element_id + "'>" + i18n[lang].go_up + "<img class='btn-more-up-12' src='" + aws_s3_url + "/icons/go-up.png" + css_version + "'></a></div>"); */
        $(".body-inner-main").scrollTop(scroll_position);
    };
    methods["the_world"]["is_one"]({
        show_animation: true,
        data:{
            link: encodeURIComponent(link)
            , type: encodeURIComponent(type)
            , _id: encodeURIComponent(comment)
            , comment_type: encodeURIComponent(1)
        },
        pathname:"/get/single-article-comment",
        s_cb:s_cb,
        f_cb:f_cb
    });
});