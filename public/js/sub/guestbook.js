$(document).ready(function() {
    $(document).on("click", ".write-guestbook-form #write-guestbook-ok", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var $wrapper = $(e.currentTarget).parent().parent();
        var blog_id = $wrapper.attr('data-blog-id');
        var is_secret = $wrapper.find('.write-guestbook-secret').is(':checked');
        var content = $wrapper.find('.write-guestbook-textarea').val();
        var s_cb, f_cb;
        s_cb = function (result) {
            if (result.response === true) {
                $wrapper.find('.write-guestbook-textarea').val("");
                $wrapper.find('.write-guestbook-secret').prop('checked',false);
                if ($('.blog-article-none').length > 0) {
                    $('.blog-article-none').remove();
                }
                if (result.doc !== null) {
                    $('#blog-article-list').prepend(get["single"]["perfect"]["guestbook"](result.doc));
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        f_cb = function () {
            show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{
                blog_id: encodeURIComponent(blog_id)
                , is_secret: encodeURIComponent(is_secret)
                , content: encodeURIComponent(content)
            },
            pathname:"/insert/guestbook",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".written-guestbook .remove", function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent().parent().parent();
        var _id = $wrapper.attr('data-id');
        var blog_id = $wrapper.attr('data-blog-id');
        var visitor_blog_id = $wrapper.attr('data-visitor-blog-id');
        remove.type = "guestbook";
        remove.element = $wrapper;
        remove.data = {};
        remove.data._id = encodeURIComponent(_id);
        remove.data.blog_id = encodeURIComponent(blog_id);
        remove.data.visitor_blog_id = encodeURIComponent(visitor_blog_id);
        if (is_apply_now_prompt_opened === true) {
            modal('.prompt#apply-now-prompt', 'close');
        }
        if (is_hire_me_prompt_opened === true) {
            modal('.prompt#hire-me-prompt', 'close');
        }
        if (is_unicorn_prompt_opened === true) {
            modal('.prompt#unicorn-prompt', 'close');
        }
        if (is_superior_prompt_opened === true) {
            modal('.prompt#superior-prompt', 'close');
        }
        if (is_agenda_prompt_opened === true) {
            modal('.prompt#agenda-prompt', 'close');
        }
        if (is_opinion_prompt_opened === true) {
            modal('.prompt#opinion-prompt', 'close');
        }
        if (is_space_prompt_opened === true) {
            modal('.prompt#space-prompt', 'close');
        }
        /*if (is_translation_prompt_opened === true) {
            modal(".prompt#translation-prompt", "close");
        }*/
        modal('.prompt#remove-prompt', 'open');
        return false;
    });
    $(document).on("click", ".written-guestbook .edit", function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent().parent().parent();
        $wrapper.find('.written-guestbook').css('display', 'none');
        $wrapper.find('.edit-guestbook').css('display', 'block');
        $wrapper.find('.edit-guestbook-textarea').val($wrapper.find('.guestbook-content').text());
        $wrapper.find('.edit-guestbook-secret').prop("checked", $wrapper.attr('data-is-secret') === 'true');
        return false;
    });
    $(document).on("click", ".edit-guestbook .edit-guestbook-cancel", function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent().parent().parent();
        $wrapper.find('.written-guestbook').css('display', 'block');
        $wrapper.find('.edit-guestbook').css('display', 'none');
        return false;
    });
    $(document).on("click", ".edit-guestbook .edit-guestbook-ok", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var $wrapper = $(e.currentTarget).parent().parent().parent();
        var _id = $wrapper.attr('data-id');
        var blog_id = $wrapper.attr('data-blog-id');
        var visitor_blog_id = $wrapper.attr('data-visitor-blog-id');
        var is_secret = $wrapper.find('.edit-guestbook-secret').is(':checked');
        var content = $wrapper.find('.edit-guestbook-textarea').val();
        var s_cb, f_cb;
        s_cb = function (result) {
            if (result.response === true) {
                if (result.doc !== null) {
                    $wrapper.replaceWith(get["single"]["perfect"]["guestbook"](result.doc));
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        f_cb = function () {
            show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{
                _id: encodeURIComponent(_id)
                , blog_id: encodeURIComponent(blog_id)
                , visitor_blog_id: encodeURIComponent(visitor_blog_id)
                , is_secret: encodeURIComponent(is_secret)
                , content: encodeURIComponent(content)
            },
            pathname:"/update/guestbook",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    var insert_guestbook_comment = function (e) {
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var $wrapper = $(e.currentTarget).parent().parent().parent().parent()
            , guestbook_id = $wrapper.attr('data-id')
            , visitor_blog_id = $wrapper.attr('data-visitor-blog-id')
            , blog_id = $wrapper.attr('data-blog-id')
            , comment = $wrapper.find('.write-guestbook-comment-input').val()
            , $comment_list_wrapper = $wrapper.find('.guestbook-comment-list:first')
            , is_loginned = $("body").attr("data-check") === "true"
            , user_profile_link = $('#desktop-user-menu ul a').attr('href')
            , current_user_blog_id = null;
        if (user_profile_link === "/set/blog-id") {
            is_loginned = false;
        } else {
            if (user_profile_link) {
                current_user_blog_id = user_profile_link.split('/')[2];
            }
        }
        $wrapper.find('.write-guestbook-comment-input').val("");
        var s_cb = function (result) {
            if (result.response === true) {
                var comments = result.comments
                    , guestbook_comment_list = "";
                for (var i = 0; i < comments.length; i++) {
                    guestbook_comment_list = guestbook_comment_list + get["single_guestbook_comment"](is_loginned, guestbook_id, blog_id, comments[i]);
                }
                $comment_list_wrapper.empty().append(guestbook_comment_list);
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else if (result['msg'] === 'no_access') {
                    show_bert("danger", 2000, i18n[lang].you_are_not_allowed_to_access);
                }
            }
        };
        var f_cb = function () {
            show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{
                guestbook_id: encodeURIComponent(guestbook_id)
                , blog_id: encodeURIComponent(blog_id)
                , visitor_blog_id: encodeURIComponent(visitor_blog_id)
                , comment: encodeURIComponent(comment)
            },
            pathname:"/insert/guestbook-comment",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    $(document).on("click", ".write-guestbook-comment-form .write-guestbook-comment-submit", function (e) {
        e.preventDefault();
        insert_guestbook_comment(e);
        return false;
    });
    $(document).on("submit", ".write-guestbook-comment-form", function (e) {
        e.preventDefault();
        insert_guestbook_comment(e);
        return false;
    });
    $(document).on('click', '.guestbook-comment-edit', function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent();
        var text = $wrapper.find('.guestbook-comment-content:first').css('display', 'none').text();
        $wrapper.find('.edit-guestbook-comment-form:first').css('display', 'block');
        $wrapper.find('.edit-guestbook-comment-input:first').val(text);
        if (is_mobile() === false) {
            $wrapper.find('.edit-guestbook-comment-input:first').focus();
        }
        return false;
    });
    $(document).on('click', '.edit-guestbook-comment-cancel', function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent().parent().parent();
        $wrapper.find('.guestbook-comment-content:first').css('display', 'block');
        $wrapper.find('.edit-guestbook-comment-form:first').css('display', 'none');
        $wrapper.find('.edit-guestbook-comment-input:first').val("");
        return false;
    });
    var update_guestbook_comment = function (e) {
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var $wrapper = $(e.currentTarget).parent().parent().parent();
        var comment = $wrapper.find('.edit-guestbook-comment-input:first').val()
            , _id = $wrapper.attr('data-id')
            , blog_id = $wrapper.attr('data-blog-id')
            , blog_owner_blog_id = $wrapper.attr('data-profile-owner-blog-id')
            , guestbook_id = $wrapper.attr('data-guestbook-id');
        var i18n_text;
        if (
            lang === "en" ||
            lang === "ko"
        ) {
            i18n_text = i18n[lang].edit + " " + i18n[lang].just_now;
        } else {
            i18n_text = i18n[lang].edit + i18n[lang].just_now;
        }
        var s_cb = function (result) {
            if (result.response === true) {
                comment = comment.trim().replace(/\s\s+/gi, ' ');
                $wrapper.find('.guestbook-comment-content:first').css('display', 'block').text(comment);
                $wrapper.find('.edit-guestbook-comment-form:first').css('display', 'none');
                $wrapper.find('.edit-guestbook-comment-input:first').val("");
                $wrapper.find('.user-profile-small:first .created-at-small').addClass('updated-at-small').attr('data-datetime', result.updated_at).text(i18n_text);
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        var f_cb = function () {
            show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{
                guestbook_id: encodeURIComponent(guestbook_id)
                , _id: encodeURIComponent(_id)
                , blog_id: encodeURIComponent(blog_id)
                , blog_owner_blog_id: encodeURIComponent(blog_owner_blog_id)
                , comment: encodeURIComponent(comment)
            },
            pathname:"/update/guestbook-comment",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    $(document).on('submit', '.edit-guestbook-comment-form', function (e) {
        e.preventDefault();
        update_guestbook_comment(e);
        return false;
    });
    $(document).on('click', '.edit-guestbook-comment-form .edit-guestbook-comment-submit', function (e) {
        e.preventDefault();
        update_guestbook_comment(e);
        return false;
    });
    $(document).on('click', '.guestbook-comment-remove', function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent();
        remove.type = "guestbook_comment";
        remove.element = $wrapper;
        remove.data = {};
        var _id = $wrapper.attr('data-id')
            , blog_id = $wrapper.attr('data-blog-id')
            , blog_owner_blog_id = $wrapper.attr('data-profile-owner-blog-id')
            , guestbook_id = $wrapper.attr('data-guestbook-id');
        remove.data._id = encodeURIComponent(_id);
        remove.data.blog_id = encodeURIComponent(blog_id);
        remove.data.blog_owner_blog_id = encodeURIComponent(blog_owner_blog_id);
        remove.data.guestbook_id = encodeURIComponent(guestbook_id);
        if (is_apply_now_prompt_opened === true) {
            modal('.prompt#apply-now-prompt', 'close');
        }
        if (is_hire_me_prompt_opened === true) {
            modal('.prompt#hire-me-prompt', 'close');
        }
        if (is_unicorn_prompt_opened === true) {
            modal('.prompt#unicorn-prompt', 'close');
        }
        if (is_superior_prompt_opened === true) {
            modal('.prompt#superior-prompt', 'close');
        }
        if (is_agenda_prompt_opened === true) {
            modal('.prompt#agenda-prompt', 'close');
        }
        if (is_opinion_prompt_opened === true) {
            modal('.prompt#opinion-prompt', 'close');
        }
        if (is_space_prompt_opened === true) {
            modal('.prompt#space-prompt', 'close');
        }
        /*if (is_translation_prompt_opened === true) {
            modal(".prompt#translation-prompt", "close");
        }*/
        modal('.prompt#remove-prompt', 'open');
        return false;
    });
});