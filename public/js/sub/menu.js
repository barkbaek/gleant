// 모바일 메뉴 show/hide
var current_user_blog_id = null;
var message_current_type = null;
var friend_current_type = null;
var my_invitation_current_type = null;
var invitation_obj = {};
var request_obj = {};
var announcement_menu_obj = {};
var opinion_menu_obj = {};
var translation_menu_obj = {};
var fill_messages = function (type, is_new, created_at) {
    if (is_new === true) {
        $('.message-more').css('display', 'block');
    }
    message_current_type = type;
    if (current_user_blog_id === null) {
        return false;
    }
    if (
        type !== 'all' &&
        type !== 'received' &&
        type !== 'sent'
    ) {
        return false;
    }
    var s_cb_get_messages = function (result) {
        message_counts = 0;
        var sum = message_counts + notification_counts;
        if (sum > 0) {
            document.title = "(" + sum + ") " + page_title;
        } else {
            document.title = page_title;
        }
        if (is_new === true) {
            $('.message-list').empty();
        }
        if (result.response === true) {
            if (result.docs === null || result.docs === undefined || result.docs.length === 0) {
                $('.message-more').css('display', 'none');
                return false;
            }
            if (result.docs.length < limit.messages) {
                $('.message-more').css('display', 'none');
            }
            var final_list = "";
            if (type === 'all') {
                for (var i = 0; i < result.docs.length; i++) {
                    if (current_user_blog_id === result.docs[i].to_blog_id) {
                        final_list = final_list + get["single"]["perfect"]["message"](result.docs[i], 'received');
                    } else {
                        final_list = final_list + get["single"]["perfect"]["message"](result.docs[i], 'sent');
                    }
                }
            } else {
                for (var j = 0; j < result.docs.length; j++) {
                    final_list = final_list + get["single"]["perfect"]["message"](result.docs[j], type);
                }
            }
            /* .message-list는 #message-prompt 와 /i/messages 의 창 둘다 같은 클래스 이름으로 지정한다. */
            $('.message-list').append(final_list);
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                $('.message-more').css('display', 'none');
            }
        }
    };
    var f_cb_get_messages = function () {
        if (is_new === true) {
            $('.message-list').empty();
        }
        $('.message-more').css('display', 'none');
    };
    var data_get_messages = {};
    data_get_messages.type = encodeURIComponent(type);
    if (created_at !== undefined){
        data_get_messages.created_at = encodeURIComponent(created_at);
    }
    methods["the_world"]["is_one"]({
        show_animation: true,
        data:data_get_messages,
        pathname:"/get/messages",
        s_cb:s_cb_get_messages,
        f_cb:f_cb_get_messages
    });
};

var fill_notifications = function (is_new, updated_at) {
    if (is_new === true) {
        $('.notification-more').css('display', 'block');
    }

    if (current_user_blog_id === null) {
        return false;
    }

    var s_cb = function (result) {
        notification_counts = 0;
        var sum = message_counts + notification_counts;
        if (sum > 0) {
            document.title = "(" + sum + ") " + page_title;
        } else {
            document.title = page_title;
        }
        if (is_new === true) {
            $('.notification-list').empty();
        }
        if (result.response === true) {
            if (result.docs === null || result.docs === undefined || result.docs.length === 0) {
                $('.notification-more').css('display', 'none');
                return false;
            }
            if (result.docs.length < limit.notifications) {
                $('.notification-more').css('display', 'none');
            }

            var final_list = "";
            for (var j = 0; j < result.docs.length; j++) {
                final_list = final_list + get["single"]["perfect"]["notification"](result.docs[j]);
            }
            $('.notification-list').append(final_list);
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                $('.notification-more').css('display', 'none');
            }
        }
    };
    var f_cb = function () {
        if (is_new === true) {
            $('.notification-list').empty();
        }
        $('.notification-more').css('display', 'none');
    };
    var data = {};
    if (updated_at !== undefined){
        data.updated_at = encodeURIComponent(updated_at);
    }
    methods["the_world"]["is_one"]({
        show_animation: true,
        data:data,
        pathname:"/get/notifications",
        s_cb:s_cb,
        f_cb:f_cb
    });
};

var page_title = "";
var message_counts = 0;
var notification_counts = 0;

$(document).ready(function() {
    page_title = document.title;
    var sum = 0;
    var is_loginned = $("body").attr("data-check") === "true"
        , user_profile_link = $('#desktop-user-menu ul a').attr('href');

    if (is_loginned === true && user_profile_link && user_profile_link !== "/set/blog-id") {
        current_user_blog_id = user_profile_link.split('/')[2];
    }

    var update_checked_at = function (type) {
        if (type !== 'messages' && type !== 'notifications') {
            return false;
        }
        var s_cb_update_checked_at = function (result) {
            if (result.response === true) {
                if (type === 'notifications') { /* [알림 체크 시간] 업데이트 */
                    /* #menu-notifications-desktop .new와 #menu-notifications-mobile .new display:none; 처리 */
                    $('#menu-notifications-desktop .new').text('').css('display', 'none');
                    $('#menu-notifications-mobile .new').text('').css('display', 'none');
                } else { /* [메시지 체크 시간] 업데이트 */
                    /* #menu-messages-desktop .new와 #menu-messages-mobile .new display:none; 처리 */
                    $('#menu-messages-desktop .new').text('').css('display', 'none');
                    $('#menu-messages-mobile .new').text('').css('display', 'none');
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        var f_cb_update_checked_at = function () {};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:{type: encodeURIComponent(type)},
            pathname:"/update/checked-at",
            s_cb:s_cb_update_checked_at,
            f_cb:f_cb_update_checked_at
        });
    };

    if (window.location.pathname !== '/i/messages' && current_user_blog_id !== null) {
        var s_cb_check_messages = function (result) {
            if (result.response === true) {
                /* 받은 메시지 있음! NEW 보여주기 */
                message_counts = result.count;
                $('#menu-messages-desktop .new').css('display', 'inline-block').text(result.count);
                $('#menu-messages-mobile .new').css('display', 'inline-block').text(result.count);
                sum = message_counts + notification_counts;
                if (sum !== 0) {
                    document.title = "(" + sum + ") " + page_title;
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        var f_cb_check_messages = function () {};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:{},
            pathname:"/check/unread-messages",
            s_cb:s_cb_check_messages,
            f_cb:f_cb_check_messages
        });
    }

    if (window.location.pathname !== '/i/notifications' && current_user_blog_id !== null) {
        var s_cb_check_notifications = function (result) {
            if (result.response === true) {
                notification_counts = result.count;
                $('#menu-notifications-desktop .new').css('display', 'inline-block').text(result.count);
                $('#menu-notifications-mobile .new').css('display', 'inline-block').text(result.count);
                sum = message_counts + notification_counts;
                if (sum !== 0) {
                    document.title = "(" + sum + ") " + page_title;
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        var f_cb_check_notifications = function () {};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:{},
            pathname:"/check/unread-notifications",
            s_cb:s_cb_check_notifications,
            f_cb:f_cb_check_notifications
        });
    }

    /* /i/notifications 이면 [알림 체크 시간] 업데이트 */
    if (window.location.pathname === '/i/notifications') {
        update_checked_at('notifications');
    }

    /* /i/messages 이면 [메시지 체크 시간] 업데이트 */
    if (window.location.pathname === '/i/messages') {
        update_checked_at('messages');
    }

    $(document).on('click', '.body-inner', function (e) {
        if ($('#desktop-user-menu').css('display') !== 'none') {
            $('#desktop-user-menu').css('display', 'none');
        }
        if ($('#service-list').css('display') !== 'none') {
            $('#service-list').css('display', 'none');
        }
    });

    $(window).resize(function () {
        $('.prompt .prompt-left > div').css('max-height', ($(window).height() - 50) + 'px');
        if ( $(window).width() < 768 ) {
            $("#desktop-user-menu").css('display', 'none');
            $('#service-list').css('display', 'none');
        } else {
            if ($("#mobile-right-menu").css("display") === "block") {
                toggle_mobile_menu();
            }
        }
    });
    $('.prompt .prompt-left > div').css('max-height', ($(window).height() - 50) + 'px');
    $(document).on("click", "#mobile-menu #menu-btn-mobile, #mobile-right-menu .close", function (e) {
        e.preventDefault();
        toggle_mobile_menu();
        return false;
    });
    var logout = function (e) {
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        e.preventDefault();
        if ($(e.currentTarget).attr("id") === "menu-logout-mobile") {
            toggle_mobile_menu();
        }
        try {
            Kakao.Auth.logout();
            if (FB !== undefined){
                if (FB.getUserID && FB.getUserID()) {
                    FB.logout();
                }
            }
        } catch (e) {}
        var s_cb = function (result) {
            var pathname = window.location.pathname
                , pathname_first = pathname.split('/')[1];
            if (pathname_first === 'search' || pathname_first === 'news' || pathname_first === 'apply-now' || pathname_first === 'debate' || pathname_first === 'agenda' || pathname_first === 'opinion' || pathname_first === 'blog') {
                window.location.reload();
            } else {
                window.location = "/";
            }
        };
        var f_cb = function () {show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{},
            pathname:"/logout",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    $(document).on("click", "#menu-logout-desktop", function (e) {
        logout(e);
        return false;
    });
    $(document).on("click", "#menu-logout-mobile", function (e) {
        logout(e);
        return false;
    });
    $(document).on("click", "#menu-user-desktop", function (e) {
        e.preventDefault();
        if ($("#desktop-user-menu").is(":visible") === true) {
            $("#desktop-user-menu").css("display", "none");
        } else {
            $('#service-list').css('display', 'none');
            $("#desktop-user-menu").css("display", "block");
        }
        return false;
    });
    $(document).on("click", "#menu-user-desktop #desktop-user-menu a, #service-list a", function (e) {
        e.preventDefault();
        if ($(e.currentTarget).hasClass("preparing-service") === true) {
            return false;
        }
        window.location = $(e.currentTarget).attr('href');
        return false;
    });
    $(document).on("click", "#btn-services", function (e) {
        e.preventDefault();
        if ($('#service-list').css('display') === 'block') {
            $('#service-list').css('display', 'none');
        } else {
            $("#desktop-user-menu").css('display', 'none');
            $('#service-list').css('display', 'block');
        }
        return false;
    });
    $(document).on('mouseenter', '.what-is-this', function (e) {
        e.preventDefault();
        $(e.currentTarget).parent().find('.what-is-this-prompt').css('display', 'block');
        return false;
    });
    $(document).on('mouseleave', '.what-is-this', function (e) {
        e.preventDefault();
        $(e.currentTarget).parent().find('.what-is-this-prompt').css('display', 'none');
        return false;
    });
    $(document).on('keyup', function(e) {
        var css_version = $("body").attr("data-css-version");
        if (e.keyCode === 27) {
            if (is_translation_prompt_opened === true) {
                if (history && history.state) {
                    if (my_history && my_history.length > 0) {
                        my_history.pop();
                    }
                    history.back();
                }
            } else {
                if (is_agenda_prompt_opened === true || is_opinion_prompt_opened === true) {
                    if (history && history.state) {
                        if (is_agenda_prompt_opened === true && is_opinion_prompt_opened === true) {
                            if (my_history && my_history.length > 1) {
                                my_history.pop();
                                my_history.pop();
                            }
                            history.go(-2);
                        } else {
                            if (my_history && my_history.length > 0) {
                                my_history.pop();
                            }
                            history.back();
                        }
                    }
                }
                if (is_apply_now_prompt_opened === true) {
                    if (my_history && my_history.length > 0) {
                        my_history.pop();
                    }
                    history.back();
                }
                if (is_hire_me_prompt_opened === true) {
                    if (my_history && my_history.length > 0) {
                        my_history.pop();
                    }
                    history.back();
                }
            }
            $(".write-opinion-wrapper").empty().removeClass("opened");
            $(".request-opinion-wrapper").empty().removeClass("opened");
            $(".btn-opinion.ing-write img").attr("src", aws_s3_url + "/icons/write-opinion.png");
            $(".btn-opinion.ing-write").removeClass("selected").removeClass("ing-write");
            /*
            $(".write-translation-wrapper").empty().removeClass("opened");
            $(".request-translation-wrapper").empty().removeClass("opened");
            $(".btn-translation.ing-write img").attr("src", aws_s3_url + "/icons/write-translation.png");
            $(".btn-translation.ing-write").removeClass("selected").removeClass("ing-write");
            */
            is_news_comments_prompt_opened = false;
            is_message_prompt_opened = false;
            is_notification_prompt_opened = false;
            is_edit_detailed_career_prompt_opened = false;
            is_apply_now_prompt_opened = false;
            is_hire_me_prompt_opened = false;
            is_unicorn_prompt_opened = false;
            is_superior_prompt_opened = false;
            is_opinion_prompt_parent = true;
            is_agenda_prompt_opened = false;
            is_opinion_prompt_opened = false;
            /* is_translation_prompt_opened = false; */
            is_space_prompt_opened = false;
            is_mars_prompt_opened = false;
            is_w_opinion_opened = false;
            /* is_w_translation_opened = false; */
            if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                star_editor_focuser.blur();
            }
            if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                moon_editor_focuser.blur();
            }
            if ($("#mobile-right-menu").css("display") === "block") {
                toggle_mobile_menu();
            }
            $(".body-inner-main").removeClass("modal-open");
            $("#overlay").css("display", "none");
            $("#overlay2").css("display", "none");
            $("#overlay3").css("display", "none");
            $(".prompt").css("display", "none");
            $("#desktop-user-menu").css('display', 'none');
            if ( $(".prompt#apply-now-prompt").length > 0 ) {
                $(".prompt#apply-now-prompt #apply-now-wrapper").empty();
            }
            if ( $(".prompt#hire-me-prompt").length > 0 ) {
                $(".prompt#hire-me-prompt #hire-me-wrapper").empty();
            }
            if ( $(".prompt#agenda-prompt").length > 0 ) {
                $(".prompt#agenda-prompt #agenda-wrapper").empty();
            }
            if ( $(".prompt#opinion-prompt").length > 0 ) {
                $(".prompt#opinion-prompt #opinion-wrapper").empty();
            }
            if ( $(".prompt#translation-prompt").length > 0 ) {
                $(".prompt#translation-prompt #translation-wrapper").empty();
            }
            if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
                write_form["rebuild_write_form_data_as_ground"]();
            }
        }
    });
    window.addEventListener('popstate', function(e) {
        is_edit_detailed_career_prompt_opened = false;
        is_unicorn_prompt_opened = false;
        is_superior_prompt_opened = false;
        is_space_prompt_opened = false;
        is_w_opinion_opened = false;
        /*is_w_translation_opened = false;*/
        if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
            star_editor_focuser.blur();
        }
        if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
            moon_editor_focuser.blur();
        }

        if (history_to_replace !== null) {
            history.replaceState(my_history, '', history_to_replace);
        }
        history_to_replace = null;
        if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
            write_form["rebuild_write_form_data_as_ground"]();
        }
    });
    $(document).on("click", ".today-best-top-10-btn-dropdown.open", function(e) {
        e.preventDefault();
        var $parent = $(e.currentTarget).parent().parent();
        $parent.find('.today-best-top-10-shown').css('display', 'none');
        $parent.find('.today-best-top-10-hidden').css('display', 'block');
        return false;
    });
    $(document).on("click", ".today-best-top-10-btn-dropdown.close, .today-best-top-10 .close-hidden", function(e) {
        e.preventDefault();
        var $parent = $(e.currentTarget).parent().parent().parent();
        $parent.find('.today-best-top-10-shown').css('display', 'block');
        $parent.find('.today-best-top-10-hidden').css('display', 'none');
        return false;
    });
    $(document).on("click", ".message-more", function (e) {
        e.preventDefault();
        var created_at = $('.message-list .message-item:last').attr('data-created-at');
        fill_messages(message_current_type, false, parseInt(created_at));
        return false;
    });
    $(document).on("click", ".notification-more", function (e) {
        e.preventDefault();
        var updated_at = $('.notification-list .notification-item:last').attr('data-updated-at');
        fill_notifications(false, parseInt(updated_at));
        return false;
    });
    $(document).on('mouseenter', '.today-best-top-10', function (e) {
        e.preventDefault();
        var $parent = $(e.currentTarget);
        $parent.find('.today-best-top-10-shown').css('display', 'none');
        $parent.find('.today-best-top-10-hidden').css('display', 'block');
        return false;
    });
    $(document).on('mouseleave', '.today-best-top-10', function (e) {
        e.preventDefault();
        var $parent = $(e.currentTarget);
        $parent.find('.today-best-top-10-shown').css('display', 'block');
        $parent.find('.today-best-top-10-hidden').css('display', 'none');
        return false;
    });
    var message_menu_received = function () {
        $('.prompt#message-prompt .message-menu-received').addClass('selected');
        $('.prompt#message-prompt .message-menu-sent').removeClass('selected');
        fill_messages('received', true, undefined);
    };
    var message_menu_sent = function () {
        $('.prompt#message-prompt .message-menu-received').removeClass('selected');
        $('.prompt#message-prompt .message-menu-sent').addClass('selected');
        fill_messages('sent', true, undefined);
    };
    var menu_messages = function () {
        if (window.location.pathname === '/i/notifications' || window.location.pathname === '/i/messages') {
            return window.location = window.location.protocol + "//" + window.location.hostname + (window.location.port === "" ? "" : ":" + window.location.port) + '/i/messages';
        }
        message_menu_received();
        modal('.prompt#message-prompt', 'open');
        is_message_prompt_opened = true;

        update_checked_at('messages');
        if ($('#desktop-user-menu').css('display') !== 'none') {
            $('#desktop-user-menu').css('display', 'none');
        }
        if ($('#service-list').css('display') !== 'none') {
            $('#service-list').css('display', 'none');
        }
    };
    $(document).on('click', '#menu-messages-desktop', function (e) {
        e.preventDefault();
        menu_messages();
        return false;
    });
    $(document).on('click', '#menu-messages-mobile', function (e) {
        e.preventDefault();
        if ($("#mobile-right-menu").css("display") === "block") {
            toggle_mobile_menu();
        }
        menu_messages();
        return false;
    });
    $(document).on('click', '.prompt#message-prompt .message-menu-received', function (e) {
        e.preventDefault();
        message_menu_received();
        return false;
    });
    $(document).on('click', '.prompt#message-prompt .message-menu-sent', function (e) {
        e.preventDefault();
        message_menu_sent();
        return false;
    });
    $(document).on("click", ".prompt#message-prompt .close", function (e) {
        e.preventDefault();
        is_message_prompt_opened = false;
        modal(".prompt#message-prompt", "close");
        return false;
    });
    var menu_notifications = function () {
        if (window.location.pathname === '/i/messages' || window.location.pathname === '/i/notifications') {
            return window.location = window.location.protocol + "//" + window.location.hostname + (window.location.port === "" ? "" : ":" + window.location.port) + '/i/notifications';
        }
        modal(".prompt#notification-prompt", "open");
        is_notification_prompt_opened = true;

        update_checked_at('notifications');
        fill_notifications(true, undefined);
        if ($('#desktop-user-menu').css('display') !== 'none') {
            $('#desktop-user-menu').css('display', 'none');
        }
        if ($('#service-list').css('display') !== 'none') {
            $('#service-list').css('display', 'none');
        }
    };
    $(document).on('click', '#menu-notifications-desktop', function (e) {
        e.preventDefault();
        menu_notifications();
        return false;
    });
    $(document).on('click', '#menu-notifications-mobile', function (e) {
        e.preventDefault();
        if ($("#mobile-right-menu").css("display") === "block") {
            toggle_mobile_menu();
        }
        menu_notifications();
        return false;
    });
    $(document).on("click", ".prompt#notification-prompt .close", function (e) {
        e.preventDefault();
        is_notification_prompt_opened = false;
        modal(".prompt#notification-prompt", "close");
        return false;
    });
    $(document).on('click', '.simple-profile-bottom-middle, #send-message, .btn-reply-message', function (e) {
        e.preventDefault();
        var css_version = $("body").attr("data-css-version");
        if ($(e.currentTarget).hasClass('simple-profile-bottom-middle') === true ||
            $(e.currentTarget).hasClass('blog-send-message') === true ) {
            $('.prompt#write-message-prompt #write-message-content').val("");
        }
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
        if (is_translation_prompt_opened === true) {
            modal(".prompt#translation-prompt", "close");
        }
        if (is_message_prompt_opened === true) {
            modal('.prompt#message-prompt', 'close');
        }
        if (is_notification_prompt_opened === true) {
            modal(".prompt#notification-prompt", "close");
        }
        var blog_id = $(e.currentTarget).attr('data-blog-id')
            , name = $(e.currentTarget).attr('data-name')
            , img = $(e.currentTarget).attr('data-img')
            , show_img = img;
        if (img.indexOf !== undefined) {
            if (img.indexOf( (aws_s3_url + '/upload/images/00000000/gleant/resized/male.png') ) > -1) {
                img = aws_s3_url + '/upload/images/00000000/gleant/resized/male.png';
            }
            if (img.indexOf( (aws_s3_url + '/upload/images/00000000/gleant/resized/female.png') ) > -1) {
                img = aws_s3_url + '/upload/images/00000000/gleant/resized/female.png';
            }
        }
        $('.prompt#write-message-prompt .write-message-user-blog-id').text('(@' + blog_id + ')');
        $('.prompt#write-message-prompt .write-message-user-img').attr('src', show_img);
        $('.prompt#write-message-prompt .write-message-user-name').text(get_decoded_html_preventing_xss(name));
        $('.prompt#write-message-prompt').attr('data-blog-id', blog_id).attr('data-name', name).attr('data-img', img);
        modal('.prompt#write-message-prompt', 'open');
        return false;
    });
    $(document).on("click", '.prompt#write-message-prompt #write-message-submit', function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var to_blog_id = $('.prompt#write-message-prompt').attr('data-blog-id')
            , content = $('.prompt#write-message-prompt #write-message-content').val()
            , data = {};
        data.to_blog_id = encodeURIComponent(to_blog_id);
        data.content = encodeURIComponent(content);
        var s_cb = function (result) {
            if (result.response === true) {
                show_bert("success", 3000, i18n[lang].successfully_sent_a_message);
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
            modal(".prompt#write-message-prompt", "close");
            if (is_translation_prompt_opened === true) {
                modal(".prompt#translation-prompt", "open");
            } else {
                if (is_opinion_prompt_parent === true) {
                    if (is_agenda_prompt_opened === true) {
                        modal(".prompt#agenda-prompt", "open");
                    } else {
                        if (is_opinion_prompt_opened === true) {
                            modal(".prompt#opinion-prompt", "open");
                        }
                    }
                } else {
                    if (is_opinion_prompt_opened === true) {
                        modal(".prompt#opinion-prompt", "open");
                    } else {
                        if (is_agenda_prompt_opened === true) {
                            modal(".prompt#agenda-prompt", "open");
                        }
                    }
                }

                /* Employment */
                if (is_apply_now_prompt_opened === true) {
                    modal('.prompt#apply-now-prompt', 'open');
                }
                if (is_hire_me_prompt_opened === true) {
                    modal('.prompt#hire-me-prompt', 'open');
                }
            }
            if (is_message_prompt_opened === true) {
                modal('.prompt#message-prompt', 'open');
            }
            if (is_notification_prompt_opened === true) {
                modal(".prompt#notification-prompt", "open");
            }
            $('.prompt#write-message-prompt #write-message-content').val('');
        };
        var f_cb = function () {
            show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
            modal(".prompt#write-message-prompt", "close");
            if (is_translation_prompt_opened === true) {
                modal(".prompt#translation-prompt", "open");
            } else {
                if (is_opinion_prompt_parent === true) {
                    if (is_agenda_prompt_opened === true) {
                        modal(".prompt#agenda-prompt", "open");
                    } else {
                        if (is_opinion_prompt_opened === true) {
                            modal(".prompt#opinion-prompt", "open");
                        }
                    }
                } else {
                    if (is_opinion_prompt_opened === true) {
                        modal(".prompt#opinion-prompt", "open");
                    } else {
                        if (is_agenda_prompt_opened === true) {
                            modal(".prompt#agenda-prompt", "open");
                        }
                    }
                }

                /* Employment */
                if (is_apply_now_prompt_opened === true) {
                    modal('.prompt#apply-now-prompt', 'open');
                }
                if (is_hire_me_prompt_opened === true) {
                    modal('.prompt#hire-me-prompt', 'open');
                }
            }
            if (is_message_prompt_opened === true) {
                modal('.prompt#message-prompt', 'open');
            }
            if (is_notification_prompt_opened === true) {
                modal(".prompt#notification-prompt", "open");
            }
            $('.prompt#write-message-prompt #write-message-content').val('');
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/insert/message",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".prompt#write-message-prompt .close", function (e) {
        e.preventDefault();
        modal(".prompt#write-message-prompt", "close");

        if (is_translation_prompt_opened === true) {
            modal(".prompt#translation-prompt", "open");
        } else {
            if (is_opinion_prompt_parent === true) {
                if (is_agenda_prompt_opened === true) {
                    modal(".prompt#agenda-prompt", "open");
                } else {
                    if (is_opinion_prompt_opened === true) {
                        modal(".prompt#opinion-prompt", "open");
                    }
                }
            } else {
                if (is_opinion_prompt_opened === true) {
                    modal(".prompt#opinion-prompt", "open");
                } else {
                    if (is_agenda_prompt_opened === true) {
                        modal(".prompt#agenda-prompt", "open");
                    }
                }
            }

            /* Employment */
            if (is_apply_now_prompt_opened === true) {
                modal('.prompt#apply-now-prompt', 'open');
            }
            if (is_hire_me_prompt_opened === true) {
                modal('.prompt#hire-me-prompt', 'open');
            }
        }

        if (is_message_prompt_opened === true) {
            modal('.prompt#message-prompt', 'open');
        }
        if (is_notification_prompt_opened === true) {
            modal(".prompt#notification-prompt", "open");
        }
        return false;
    });

    /* [메시지] - 신고 버튼 클릭 이벤트. [신고 모달] 열기.
    * list.js에서 .report-article 등 다른 신고 버튼 클릭 이벤트 참고하기.
    * */
    $(document).on("click", ".btn-report-message", function (e) {
        e.preventDefault();
        var type = 'message'
            , _id = $(e.currentTarget).attr('data-id')
            , from_blog_id = $(e.currentTarget).attr('data-from-blog-id')
            , to_blog_id = $(e.currentTarget).attr('data-to-blog-id');
        if (is_message_prompt_opened === true) {
            modal('.prompt#message-prompt', 'close');
        }
        $('.prompt#report-prompt').removeAttr('data-type').removeAttr('data-link').removeAttr('data-outer-id').removeAttr('data-agenda-id').removeAttr('data-id').removeAttr('data-comment-type').attr('data-type', type).attr('data-id', _id).attr('data-from-blog-id', from_blog_id).attr('data-to-blog-id', to_blog_id);
        modal(".prompt#report-prompt", "open");
        return false;
    });
    $(document).on("click", ".btn-remove-message", function (e) {
        e.preventDefault();
        var _id = $(e.currentTarget).attr('data-id')
            , to_blog_id = $(e.currentTarget).attr('data-to-blog-id')
            , from_blog_id = $(e.currentTarget).attr('data-from-blog-id')
            , type = 'message';
        remove.element = $(e.currentTarget).parent().parent();
        remove.type = type;
        remove.data = {};
        remove.data._id = encodeURIComponent(_id);
        remove.data.to_blog_id = encodeURIComponent(to_blog_id);
        remove.data.from_blog_id = encodeURIComponent(from_blog_id);

        /* 처리는 .prompt#remove-prompt 에서 #btn-remove-ok 클릭 이벤트에서 처리. */
        if (is_message_prompt_opened === true) {
            modal('.prompt#message-prompt', 'close');
        }
        modal('.prompt#remove-prompt', 'open');
        return false;
    });
    $(document).on('click', '.requested-friend, .request-add-friend', function (e) {
        e.preventDefault();
        var css_version = $("body").attr("data-css-version")
            , lang = $("body").attr("data-lang")
            , $current = $(e.currentTarget)
            , blog_id = $current.attr("data-blog-id")
            , span
            , pathname;

        if (lang === undefined) {
            lang = "en";
        }

        if ($current.hasClass("requested-friend") === true) {
            pathname = "/remove/add-friend";
        } else {
            pathname = "/request/add-friend";
        }

        var s_cb = function (result) {
            if (result.response === true) {
                if ($current.hasClass("requested-friend") === true) {
                    if ($current.hasClass("simple-profile-bottom-left") === true) {
                        span = "<span>" + i18n[lang].friend_request + "</span>";
                    } else {
                        if ($current.hasClass("of-friend-item") === true) {
                            span = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/friends.png" + css_version + "'>";
                            span = span + "<span style='vertical-align:middle;'>" + i18n[lang].request + "</span>";
                            span = span + "<img class='emoticon-small-img2' src='" + aws_s3_url + "/icons/add.png'>";
                        } else {
                            span = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/friends.png" + css_version + "'>";
                            span = span + "<span style='vertical-align:middle;'>" + i18n[lang].friend_request + "</span>";
                            span = span + "<img class='emoticon-small-img2' src='" + aws_s3_url + "/icons/add.png'>";
                        }
                    }
                    $current.removeClass("requested-friend").addClass("request-add-friend");
                } else {
                    if ($current.hasClass("simple-profile-bottom-left") === true) {
                        span = "<span>" + i18n[lang].friend_request + " ✔</span>";
                    } else {
                        if ($current.hasClass("of-friend-item") === true) {
                            span = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/friends.png" + css_version + "'>";
                            span = span + "<span>" + i18n[lang].request + " ✔</span>";
                        } else {
                            span = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/friends.png" + css_version + "'>";
                            span = span + "<span>" + i18n[lang].friend_request + " ✔</span>";
                        }
                    }
                    $current.removeClass("request-add-friend").addClass("requested-friend");
                }
                $current.empty().append(span);
            } else {
                return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
            }
        };
        var f_cb = function () {return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        var data = {};
        data.blog_id = encodeURIComponent(blog_id);
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:pathname,
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on('click', '.remove-add-friend, .accept-add-friend, .remove-invitation, .accept-invitation', function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , $current = $(e.currentTarget)
            , $notification_item = $current.parent().parent()
            , blog_id = $current.attr("data-blog-id")
            , type
            , _id
            , is_invitation = false
            , pathname;

        if ($current.hasClass("remove-add-friend") === true) {
            pathname = "/remove/add-friend";
        } else {
            if ($current.hasClass("accept-add-friend") === true) {
                pathname = "/accept/add-friend";
            } else {
                is_invitation = true;
                if ($current.hasClass("remove-invitation") === true) {
                    pathname = "/remove/invitation";
                } else {
                    pathname = "/accept/invitation";
                }
            }
        }

        var s_cb = function (result) {
            if (result.response === true) {
                $notification_item.remove();
            } else {
                return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
            }
        };

        var f_cb = function () {return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        var data = {};
        data.blog_id = encodeURIComponent(blog_id);
        if (is_invitation === true) {
            type = $current.attr("data-type");
            _id = $current.attr("data-id");
            data.type = encodeURIComponent(type);
            data._id = encodeURIComponent(_id);
        }
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:pathname,
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    var fill_friends = function (type, is_new, number) {
        var blog_id = $(".prompt#friend-prompt").attr("data-blog-id");
        if (is_new === true) {
            $('.friend-more').css('display', 'block');
        }
        friend_current_type = type;
        if (current_user_blog_id === null) {
            return false;
        }
        if (
            type !== 'friends' &&
            type !== 'received' &&
            type !== 'sent'
        ) {
            return false;
        }

        if (blog_id !== current_user_blog_id) {
            if (
                type === "received" ||
                type === "sent"
            ) {
                return false;
            }
        }

        var s_cb = function (result) {
            if (is_new === true) {
                $('.friend-list').empty();
            }
            if (result.response === true) {
                if (result.docs === null || result.docs === undefined || result.docs.length === 0) {
                    $('.friend-more').css('display', 'none');
                    return false;
                }
                if (result.docs.length < limit.friends) {
                    $('.friend-more').css('display', 'none');
                }
                var final_list = "";
                for (var j = 0; j < result.docs.length; j++) {
                    if (type === "friends") {
                        if (blog_id === current_user_blog_id) {
                            final_list = final_list + get["single"]["perfect"]["friend"](result.docs[j], "my_friends");
                        } else {
                            final_list = final_list + get["single"]["perfect"]["friend"](result.docs[j], type);
                        }
                    } else {
                        final_list = final_list + get["single"]["perfect"]["friend"](result.docs[j], type);
                    }
                }
                $('.friend-list').append(final_list);
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    $('.friend-more').css('display', 'none');
                }
            }
        };
        var f_cb = function () {
            if (is_new === true) {
                $('.friend-list').empty();
            }
            $('.friend-more').css('display', 'none');
        };
        var data = {};
        data.type = encodeURIComponent(type);
        data.blog_id = encodeURIComponent(blog_id);

        if (type === "friends") {
            if (number !== undefined){
                data.skip = encodeURIComponent(number);
            }
        } else {
            if (number !== undefined){
                data.created_at = encodeURIComponent(number);
            }
        }
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/get/friends",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    var friend_menu_friends = function () {
        $('.prompt#friend-prompt .friend-menu-friends').addClass('selected');
        $('.prompt#friend-prompt .friend-menu-received').removeClass('selected');
        $('.prompt#friend-prompt .friend-menu-sent').removeClass('selected');
        fill_friends('friends', true, undefined);
    };
    var friend_menu_received = function () {
        $('.prompt#friend-prompt .friend-menu-friends').removeClass('selected');
        $('.prompt#friend-prompt .friend-menu-received').addClass('selected');
        $('.prompt#friend-prompt .friend-menu-sent').removeClass('selected');
        fill_friends('received', true, undefined);
    };
    var friend_menu_sent = function () {
        $('.prompt#friend-prompt .friend-menu-friends').removeClass('selected');
        $('.prompt#friend-prompt .friend-menu-received').removeClass('selected');
        $('.prompt#friend-prompt .friend-menu-sent').addClass('selected');
        fill_friends('sent', true, undefined);
    };
    $(document).on('click', '.show-friends', function (e) {
        e.preventDefault();
        if ($('#desktop-user-menu').css('display') !== 'none') {
            $('#desktop-user-menu').css('display', 'none');
        }
        if ($('#service-list').css('display') !== 'none') {
            $('#service-list').css('display', 'none');
        }
        friend_menu_friends();
        modal('.prompt#friend-prompt', 'open');
        return false;
    });
    $(document).on('click', '.prompt#friend-prompt .friend-menu-friends', function (e) {
        e.preventDefault();
        friend_menu_friends();
        return false;
    });
    $(document).on('click', '.prompt#friend-prompt .friend-menu-received', function (e) {
        e.preventDefault();
        friend_menu_received();
        return false;
    });
    $(document).on('click', '.prompt#friend-prompt .friend-menu-sent', function (e) {
        e.preventDefault();
        friend_menu_sent();
        return false;
    });
    $(document).on("click", ".friend-more", function (e) {
        e.preventDefault();
        var number;
        if (friend_current_type === "friends") {
            number = $('.friend-list .friend-item').length;
        } else {
            number = parseInt($('.friend-list .friend-item:last').attr('data-created-at'));
        }
        fill_friends(friend_current_type, false, number);
        return false;
    });
    $(document).on("click", ".prompt#friend-prompt .close", function(e) {
        e.preventDefault();
        modal('.prompt#friend-prompt', 'close');
        return false;
    });
    $(document).on('click', ".friend-item .my-friend", function (e) {
        e.preventDefault();
        var display = $(e.currentTarget).find('ul').css('display');
        if (display === "none") {
            $(e.currentTarget).find('ul').css('display', 'block');
        } else {
            $(e.currentTarget).find('ul').css('display', 'none');
        }
        return false;
    });
    $(document).on('click', '.remove-current-friend', function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , $current = $(e.currentTarget)
            , $friend_item = $current.parent().parent().parent().parent()
            , blog_id = $current.attr("data-blog-id")
            , pathname
            , count;

        if (lang === undefined) {
            lang = "en";
        }
        pathname = "/remove/current-friend";
        var s_cb = function (result) {
            if (result.response === true) {
                $friend_item.remove();
                if ( $(".friend-counts").length > 0 ) {
                    count =  parseInt($(".friend-counts").attr("data-count"));
                    count = count - 1;
                    $(".friend-counts").attr("data-count", count);
                    $(".friend-counts").text(put_comma_between_three_digits(count));
                }
            } else {
                return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
            }
        };
        var f_cb = function () {return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        var data = {};
        data.blog_id = encodeURIComponent(blog_id);
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:pathname,
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on('click', '.requested-invitation, .request-invitation', function (e) {
        e.preventDefault();
        var css_version = $("body").attr("data-css-version")
            , lang = $("body").attr("data-lang")
            , $current = $(e.currentTarget)
            , type = $current.attr("data-type")
            , _id = $current.attr("data-id")
            , blog_id = $current.attr("data-blog-id")
            , span
            , pathname;
        if (lang === undefined) {
            lang = "en";
        }
        if ($current.hasClass("requested-invitation") === true) {
            pathname = "/remove/invitation";
        } else {
            pathname = "/request/invitation";
        }
        var s_cb = function (result) {
            if (result.response === true) {
                if ($current.hasClass("requested-invitation") === true) {
                    span = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/invitations.png" + css_version + "'>";
                    span = span + "<span style='vertical-align:middle;'>" + i18n[lang].invite + "</span>";
                    span = span + "<img class='emoticon-small-img2' src='" + aws_s3_url + "/icons/add.png'>";
                    $current.removeClass("requested-invitation").addClass("request-invitation");
                } else {
                    span = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/invitations.png" + css_version + "'>";
                    span = span + "<span style='vertical-align:middle;'>" + i18n[lang].invite + " ✔</span>";
                    $current.removeClass("request-invitation").addClass("requested-invitation");
                }
                $current.empty().append(span);
            } else {
                return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
            }
        };
        var f_cb = function () {return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        var data = {};
        data.type = encodeURIComponent(type);
        data._id = encodeURIComponent(_id);
        data.blog_id = encodeURIComponent(blog_id);
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:pathname,
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    var fill_my_invitations = function (type, is_new, created_at) {
        if (is_new === true) {
            $('.my-invitation-more').css('display', 'block');
        }
        my_invitation_current_type = type;
        if (current_user_blog_id === null) {
            return false;
        }
        if (
            type !== 'received' &&
            type !== 'sent'
        ) {
            return false;
        }
        var s_cb = function (result) {
            if (is_new === true) {
                $('.my-invitation-list').empty();
            }
            if (result.response === true) {
                if (result.docs === null || result.docs === undefined || result.docs.length === 0) {
                    $('.my-invitation-more').css('display', 'none');
                    return false;
                }
                if (result.docs.length < limit.invitations) {
                    $('.my-invitation-more').css('display', 'none');
                }

                var final_list = "";
                for (var j = 0; j < result.docs.length; j++) {
                    final_list = final_list + get["single"]["perfect"]["invitation"](result.docs[j], type);
                }
                $('.my-invitation-list').append(final_list);
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    $('.my-invitation-more').css('display', 'none');
                }
            }
        };
        var f_cb = function () {
            if (is_new === true) {
                $('.my-invitation-list').empty();
            }
            $('.my-invitation-more').css('display', 'none');
        };
        var data = {};
        data.type = encodeURIComponent(type);
        if (created_at !== undefined){
            data.created_at = encodeURIComponent(created_at);
        }
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/get/invitations",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    var my_invitation_menu_received = function () {
        $('.prompt#my-invitation-prompt .my-invitation-menu-received').addClass('selected');
        $('.prompt#my-invitation-prompt .my-invitation-menu-sent').removeClass('selected');
        fill_my_invitations('received', true, undefined);
    };
    var my_invitation_menu_sent = function () {
        $('.prompt#my-invitation-prompt .my-invitation-menu-received').removeClass('selected');
        $('.prompt#my-invitation-prompt .my-invitation-menu-sent').addClass('selected');
        fill_my_invitations('sent', true, undefined);
    };
    $(document).on('click', '.show-invitations', function (e) {
        e.preventDefault();
        if ($('#desktop-user-menu').css('display') !== 'none') {
            $('#desktop-user-menu').css('display', 'none');
        }
        if ($('#service-list').css('display') !== 'none') {
            $('#service-list').css('display', 'none');
        }
        my_invitation_menu_received();
        modal('.prompt#my-invitation-prompt', 'open');
        return false;
    });
    $(document).on('click', '.prompt#my-invitation-prompt .my-invitation-menu-received', function (e) {
        e.preventDefault();
        my_invitation_menu_received();
        return false;
    });
    $(document).on('click', '.prompt#my-invitation-prompt .my-invitation-menu-sent', function (e) {
        e.preventDefault();
        my_invitation_menu_sent();
        return false;
    });
    $(document).on("click", ".my-invitation-more", function (e) {
        e.preventDefault();
        var created_at = $('.my-invitation-list .invitation-item:last').attr('data-created-at');
        fill_my_invitations(my_invitation_current_type, false, parseInt(created_at));
        return false;
    });
    $(document).on("click", ".prompt#my-invitation-prompt .close", function(e) {
        e.preventDefault();
        modal('.prompt#my-invitation-prompt', 'close');
        return false;
    });
    var fill_invitations = function (obj, is_new, skip) {
        invitation_obj = obj;
        if (is_new === true && obj.small_type !== 'recommended_users') {
            $('.invitation-more').css('display', 'block');
        }
        if (current_user_blog_id === null) {
            return false;
        }
        if (
            invitation_obj.small_type !== 'recommended_users' &&
            invitation_obj.small_type !== 'friends' &&
            invitation_obj.small_type !== 'search'
        ) {
            return false;
        }
        var $no_result = $(".prompt#invitation-prompt .no-result:first")
            , lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var s_cb = function (result) {
            if (is_new === true) {
                $('.invitation-list').empty();
            }
            if (result.response === true) {
                if (result.docs === null || result.docs === undefined || result.docs.length === 0) {
                    $('.invitation-more').css('display', 'none');
                    if (is_new === true) {
                        if (obj.small_type === "recommended_users") {
                            $no_result.empty().append("<span>" + i18n[lang].there_is_no_user + "</span>").css("display", "block");
                        } else if (obj.small_type === "friends") {
                            $no_result.empty().append("<span>" + i18n[lang].there_is_no_friend + "</span>").css("display", "block");
                        } else if (obj.small_type === "search") {
                            $no_result.empty().append("<span>" + i18n[lang].no_search_result + "</span>").css("display", "block");
                        }
                    }
                    return false;
                } else {
                    $no_result.empty().css("display", "none");
                }
                if (obj.small_type === 'recommended_users') {
                    $('.invitation-more').css('display', 'none');
                } else {
                    if (result.docs.length < limit.invitations) {
                        $('.invitation-more').css('display', 'none');
                    }
                }
                var final_list = "";
                for (var j = 0; j < result.docs.length; j++) {
                    final_list = final_list + get["single"]["perfect"]["invitation"](result.docs[j], invitation_obj.small_type);
                }
                $('.invitation-list').append(final_list);
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    if (is_new === true) {
                        if (obj.small_type === "recommended_users") {
                            $no_result.empty().append("<span>" + i18n[lang].there_is_no_user + "</span>").css("display", "block");
                        } else if (obj.small_type === "friends") {
                            $no_result.empty().append("<span>" + i18n[lang].there_is_no_friend + "</span>").css("display", "block");
                        } else if (obj.small_type === "search") {
                            $no_result.empty().append("<span>" + i18n[lang].no_search_result + "</span>").css("display", "block");
                        }
                    }
                    $('.invitation-more').css('display', 'none');
                }
            }
        };
        var f_cb = function () {
            if (is_new === true) {
                if (obj.small_type === "recommended_users") {
                    $no_result.empty().append("<span>" + i18n[lang].there_is_no_user + "</span>").css("display", "block");
                } else if (obj.small_type === "friends") {
                    $no_result.empty().append("<span>" + i18n[lang].there_is_no_friend + "</span>").css("display", "block");
                } else if (obj.small_type === "search") {
                    $no_result.empty().append("<span>" + i18n[lang].no_search_result + "</span>").css("display", "block");
                }
            }
            $('.invitation-more').css('display', 'none');
        };
        var data = {};
        data.big_type = encodeURIComponent(obj.big_type);
        data.small_type = encodeURIComponent(obj.small_type);
        data.article_type = encodeURIComponent(obj.article_type);
        data.article_id = encodeURIComponent(obj.article_id);
        if (obj.article_type === "agenda") {
            if (obj.is_agenda === false) {
                data.tr_agenda_id = encodeURIComponent(obj.tr_agenda_id);
            }
        }
        if (obj.small_type !== "recommended_users") {
            if (skip !== undefined){
                data.skip = encodeURIComponent(skip);
            } else {
                data.skip = encodeURIComponent("0");
            }
        }
        if (obj.small_type === "search") {
            if (obj.query === undefined || obj.query === "") {
                return false;
            }
            data.query = encodeURIComponent(obj.query);
        }
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/get/users-to-request",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    var invitation_menu_recommended_users = function () {
        $('.prompt#invitation-prompt .invitation-menu-recommended-users1').addClass('selected');
        $('.prompt#invitation-prompt .invitation-menu-friends1').removeClass('selected');
        $('.prompt#invitation-prompt .invitation-menu-search1').removeClass('selected');
        invitation_obj.small_type = "recommended_users";
        $(".invitation-search-wrapper").css("display", "none");
        fill_invitations(invitation_obj, true, undefined);
    };
    var invitation_menu_friends = function (number) {
        if (number === 1) {
            $('.prompt#invitation-prompt .invitation-menu-recommended-users1').removeClass('selected');
            $('.prompt#invitation-prompt .invitation-menu-friends1').addClass('selected');
            $('.prompt#invitation-prompt .invitation-menu-search1').removeClass('selected');
        } else {
            $('.prompt#invitation-prompt .invitation-menu-friends2').addClass('selected');
            $('.prompt#invitation-prompt .invitation-menu-search2').removeClass('selected');
        }
        invitation_obj.small_type = "friends";
        $(".invitation-search-wrapper").css("display", "none");
        fill_invitations(invitation_obj, true, 0);
    };
    var invitation_menu_search = function (number) {
        if (number === 1) {
            $('.prompt#invitation-prompt .invitation-menu-recommended-users1').removeClass('selected');
            $('.prompt#invitation-prompt .invitation-menu-friends1').removeClass('selected');
            $('.prompt#invitation-prompt .invitation-menu-search1').addClass('selected');
        } else {
            $('.prompt#invitation-prompt .invitation-menu-friends2').removeClass('selected');
            $('.prompt#invitation-prompt .invitation-menu-search2').addClass('selected');
        }
        invitation_obj.small_type = "search";
        $('.invitation-list').empty();
        $('.invitation-more').css('display', 'none');
        $(".prompt#invitation-prompt .no-result:first").empty().css("display", "none");
        $(".invitation-search-wrapper").css("display", "table");
        if (is_mobile() === false) {
            $(".invitation-search").val("").focus();
        }
    };
    $(document).on("submit", ".invitation-search-wrapper", function (e) {
        e.preventDefault();
        invitation_obj.query = $(e.currentTarget).find(".invitation-search:first").val();
        fill_invitations(invitation_obj, true, 0);
        return false;
    });
    $(document).on("click", ".invitation-search-submit", function (e) {
        e.preventDefault();
        invitation_obj.query = $(e.currentTarget).parent().parent().find(".invitation-search:first").val();
        fill_invitations(invitation_obj, true, 0);
        return false;
    });
    $(document).on("click", ".btn-employment-invite", function(e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , $written = $(e.currentTarget).parent().parent().parent().parent().parent()
            , big_type = "invitation_request"
            , small_type = "friends"
            , article_type = $written.attr("data-type")
            , article_id = $written.attr("data-id")
            , menu;
        if (lang === undefined) {
            lang = "en";
        }
        $('.invitation-search-wrapper').css("display", "none");
        $('.invitation-search').val("");
        if ($('#desktop-user-menu').css('display') !== 'none') {
            $('#desktop-user-menu').css('display', 'none');
        }
        if ($('#service-list').css('display') !== 'none') {
            $('#service-list').css('display', 'none');
        }
        menu = "<input class='invitation-menu-friends2 selected' type='button' value='" + i18n[lang].friends + "'><input class='invitation-menu-search2' type='button' value='" + i18n[lang].search + "'>";
        $(".prompt#invitation-prompt .invitation-menu").empty().append(menu);
        invitation_obj = {};
        invitation_obj.big_type = big_type;
        invitation_obj.small_type = small_type;
        invitation_obj.article_type = article_type;
        invitation_obj.article_id = article_id;
        fill_invitations(invitation_obj, true, 0);
        modal('.prompt#invitation-prompt', 'open');
        return false;
    });
    $(document).on("click", ".btn-debate-invite", function(e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , $written = $(e.currentTarget).parent().parent().parent().parent().parent()
            , type = $written.attr("data-type")
            , big_type = "invitation_request"
            , small_type = "recommended_users"
            , article_type = "agenda"
            , article_id
            , tr_agenda_id
            , is_agenda = true
            , menu;
        if (lang === undefined) {
            lang = "en";
        }
        $('.invitation-search-wrapper').css("display", "none");
        $('.invitation-search').val("");
        if (type === "agenda") {
            article_id = $written.attr("data-id");
        } else if (type === "tr_agenda") {
            article_id = $written.attr("data-agenda-id");
            tr_agenda_id = $written.attr("data-id");
            is_agenda = false;
        } else {
            return false;
        }
        if ($('#desktop-user-menu').css('display') !== 'none') {
            $('#desktop-user-menu').css('display', 'none');
        }
        if ($('#service-list').css('display') !== 'none') {
            $('#service-list').css('display', 'none');
        }
        menu = "<input class='invitation-menu-recommended-users1 selected' type='button' value='" + i18n[lang].recommended_users + "'><input class='invitation-menu-friends1' type='button' value='" + i18n[lang].friends + "'><input class='invitation-menu-search1' type='button' value='" + i18n[lang].search + "'>";
        $(".prompt#invitation-prompt .invitation-menu").empty().append(menu);
        invitation_obj = {};
        invitation_obj.big_type = big_type;
        invitation_obj.small_type = small_type;
        invitation_obj.article_type = article_type;
        invitation_obj.article_id = article_id;
        invitation_obj.tr_agenda_id = tr_agenda_id;
        invitation_obj.is_agenda = is_agenda;
        fill_invitations(invitation_obj, true, undefined);
        modal('.prompt#invitation-prompt', 'open');
        return false;
    });
    $(document).on('click', '.prompt#invitation-prompt .invitation-menu-recommended-users1', function (e) {
        e.preventDefault();
        invitation_menu_recommended_users();
        return false;
    });
    $(document).on('click', '.prompt#invitation-prompt .invitation-menu-friends1, .prompt#invitation-prompt .invitation-menu-friends2', function (e) {
        e.preventDefault();
        if ($(e.currentTarget).hasClass('invitation-menu-friends1') === true) {
            invitation_menu_friends(1);
        } else {
            invitation_menu_friends(2);
        }
        return false;
    });
    $(document).on('click', '.prompt#invitation-prompt .invitation-menu-search1, .prompt#invitation-prompt .invitation-menu-search2', function (e) {
        e.preventDefault();
        if ($(e.currentTarget).hasClass('invitation-menu-search1') === true) {
            invitation_menu_search(1);
        } else {
            invitation_menu_search(2);
        }
        return false;
    });
    $(document).on("click", ".invitation-more", function (e) {
        e.preventDefault();
        var skip = $('.invitation-list .invitation-item').length;
        fill_invitations(invitation_obj, false, skip);
        return false;
    });
    $(document).on("click", ".prompt#invitation-prompt .close", function(e) {
        e.preventDefault();
        modal('.prompt#invitation-prompt', 'close');
        return false;
    });
    $(document).on("click", ".btn-employment-exit, .btn-debate-exit", function(e) {
        e.preventDefault();
        var $written = $(e.currentTarget).parent().parent().parent().parent().parent()
            , type = $written.attr("data-type")
            , data = {}
            , _id
            , member_item_class
            , pathname = "/remove/accepted-invitation";
        if (type === "tr_agenda") {
            data.type = encodeURIComponent("agenda");
            _id = $written.attr("data-agenda-id");
        } else {
            data.type = encodeURIComponent(type);
            _id = $written.attr("data-id");
        }
        data._id = encodeURIComponent(_id);
        var s_cb = function (result) {
            if (result.response === true) {
                member_item_class = "." + _id + "_member_item_" + current_user_blog_id;
                return $(member_item_class).remove();
            } else {
                return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
            }
        };
        var f_cb = function () {return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:pathname,
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on('focus', '.invitation-search', function (e) {
        $(e.currentTarget).css('border-color', '#5a00e0');
        $('.invitation-search-right').css('border-color', '#5a00e0');
        $('.invitation-search-submit').css('background-image', "url('" + aws_s3_url + "/icons/search-purple.png')");
    });
    $(document).on('blur', '.invitation-search', function (e) {
        $(e.currentTarget).css('border-color', '#ebebeb');
        $('.invitation-search-right').css('border-color', '#ebebeb');
        $('.invitation-search-submit').css('background-image', "url('" + aws_s3_url + "/icons/search-grey.png')");
    });
    $(document).on('click', '.requested-help, .request-help', function (e) {
        e.preventDefault();
        var css_version = $("body").attr("data-css-version")
            , lang = $("body").attr("data-lang")
            , $current = $(e.currentTarget)
            , request_type = $current.attr("data-request-type")
            , type = $current.attr("data-type")
            , _id = $current.attr("data-id")
            , blog_id = $current.attr("data-blog-id")
            , source_lang
            , target_lang
            , span
            , pathname;

        if (lang === undefined) {
            lang = "en";
        }
        if (
            request_type !== "opinion" &&
            request_type !== "translation"
        ) {
            return false;
        }
        if (request_type === "translation") {
            source_lang = $current.attr("data-source-lang");
            target_lang = $current.attr("data-target-lang");
        }
        if ($current.hasClass("requested-help") === true) {
            pathname = "/remove/help-" + request_type;
        } else {
            pathname = "/request/help-" + request_type;
        }
        var s_cb = function (result) {
            if (result.response === true) {
                if ($current.hasClass("requested-help") === true) {
                    span = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/request-" + request_type + "-selected.png" + css_version + "'>";
                    span = span + "<span style='vertical-align:middle;'>" + i18n[lang].request + "</span>";
                    span = span + "<img class='emoticon-small-img2' src='" + aws_s3_url + "/icons/add.png'>";
                    $current.removeClass("requested-help").addClass("request-help");
                } else {
                    span = "<img class='emoticon-small-img' src='" + aws_s3_url + "/icons/request-" + request_type + "-selected.png" + css_version + "'>";
                    span = span + "<span style='vertical-align:middle;'>" + i18n[lang].request + " ✔</span>";
                    $current.removeClass("request-help").addClass("requested-help");
                }
                $current.empty().append(span);
            } else {
                if (result.msg === "self_request") {
                    if ($current.hasClass("request-help") === true) {
                        return show_bert("danger", 4000, i18n[lang].you_cannot_request_yourself);
                    }
                } else {
                    return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        var f_cb = function () {return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        var data = {};
        data.type = encodeURIComponent(type);
        data._id = encodeURIComponent(_id);
        data.blog_id = encodeURIComponent(blog_id);
        if (request_type === "translation") {
            data.source_lang = encodeURIComponent(source_lang);
            data.target_lang = encodeURIComponent(target_lang);
        }
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:pathname,
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    var fill_requests = function (obj, is_new, skip) {
        request_obj = obj;
        if (is_new === true && obj.small_type !== 'recommended_users') {
            $('.request-more').css('display', 'block');
        }
        if (current_user_blog_id === null) {
            return false;
        }
        if (
            request_obj.small_type !== 'recommended_users' &&
            request_obj.small_type !== 'friends' &&
            request_obj.small_type !== 'search'
        ) {
            return false;
        }
        var $no_result
            , lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        if (obj.big_type === "opinion_request") {
            $no_result = $(".request-opinion-wrapper .no-result:first");
        } else if (obj.big_type === "translation_request") {
            $no_result = $(".request-translation-wrapper .no-result:first");
        } else {
            return false;
        }
        var s_cb = function (result) {
            if (is_new === true) {
                $('.request-list').empty();
            }
            if (result.response === true) {
                if (result.docs === null || result.docs === undefined || result.docs.length === 0) {
                    $('.request-more').css('display', 'none');
                    if (is_new === true) {
                        if (obj.small_type === "recommended_users") {
                            $no_result.empty().append("<span>" + i18n[lang].there_is_no_user + "</span>").css("display", "block");
                        } else if (obj.small_type === "friends") {
                            $no_result.empty().append("<span>" + i18n[lang].there_is_no_friend + "</span>").css("display", "block");
                        } else if (obj.small_type === "search") {
                            $no_result.empty().append("<span>" + i18n[lang].no_search_result + "</span>").css("display", "block");
                        }
                    }
                    return false;
                } else {
                    $no_result.empty().css("display", "none");
                }
                if (obj.small_type === 'recommended_users') {
                    $('.request-more').css('display', 'none');
                } else {
                    if (result.docs.length < limit.invitations) {
                        $('.request-more').css('display', 'none');
                    }
                }
                var final_list = "";
                for (var j = 0; j < result.docs.length; j++) {
                    final_list = final_list + get["single"]["perfect"]["request"](result.docs[j], request_obj.small_type);
                }
                $('.request-list').append(final_list);
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    if (is_new === true) {
                        if (obj.small_type === "recommended_users") {
                            $no_result.empty().append("<span>" + i18n[lang].there_is_no_user + "</span>").css("display", "block");
                        } else if (obj.small_type === "friends") {
                            $no_result.empty().append("<span>" + i18n[lang].there_is_no_friend + "</span>").css("display", "block");
                        } else if (obj.small_type === "search") {
                            $no_result.empty().append("<span>" + i18n[lang].no_search_result + "</span>").css("display", "block");
                        }
                    }
                    $('.request-more').css('display', 'none');
                }
            }
        };
        var f_cb = function () {
            if (is_new === true) {
                if (obj.small_type === "recommended_users") {
                    $no_result.empty().append("<span>" + i18n[lang].there_is_no_user + "</span>").css("display", "block");
                } else if (obj.small_type === "friends") {
                    $no_result.empty().append("<span>" + i18n[lang].there_is_no_friend + "</span>").css("display", "block");
                } else if (obj.small_type === "search") {
                    $no_result.empty().append("<span>" + i18n[lang].no_search_result + "</span>").css("display", "block");
                }
            }
            $('.request-more').css('display', 'none');
        };
        var data = {};
        data.big_type = encodeURIComponent(obj.big_type);
        data.small_type = encodeURIComponent(obj.small_type);
        data.article_type = encodeURIComponent(obj.article_type);
        data.article_id = encodeURIComponent(obj.article_id);
        if (obj.big_type === "translation_request") {
            data.source_lang = encodeURIComponent(obj.source_lang);
            data.target_lang = encodeURIComponent(obj.target_lang);
        }
        if (obj.small_type !== "recommended_users") {
            if (skip !== undefined){
                data.skip = encodeURIComponent(skip);
            } else {
                data.skip = encodeURIComponent("0");
            }
        }
        if (obj.small_type === "search") {
            if (obj.query === undefined || obj.query === "") {
                return false;
            }
            data.query = encodeURIComponent(obj.query);
        }
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/get/users-to-request",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    var request_menu_recommended_users = function () {
        $('.request-menu-recommended-users').addClass('selected');
        $('.request-menu-friends').removeClass('selected');
        $('.request-menu-search').removeClass('selected');
        request_obj.small_type = "recommended_users";
        $(".request-search-wrapper").css("display", "none");
        fill_requests(request_obj, true, undefined);
    };
    var request_menu_friends = function () {
        $('.request-menu-recommended-users').removeClass('selected');
        $('.request-menu-friends').addClass('selected');
        $('.request-menu-search').removeClass('selected');
        request_obj.small_type = "friends";
        $(".request-search-wrapper").css("display", "none");
        fill_requests(request_obj, true, 0);
    };
    var request_menu_search = function () {
        $('.request-menu-recommended-users').removeClass('selected');
        $('.request-menu-friends').removeClass('selected');
        $('.request-menu-search').addClass('selected');
        request_obj.small_type = "search";
        $('.request-list').empty();
        $('.request-more').css('display', 'none');
        if (request_obj.big_type === "opinion_request") {
            $(".request-opinion-wrapper .no-result:first").empty().css("display", "none");
        } else if (request_obj.big_type === "translation_request") {
            $(".request-translation-wrapper .no-result:first").empty().css("display", "none");
        }
        $(".request-search-wrapper").css("display", "table");
        if (is_mobile() === false) {
            $(".request-search").val("").focus();
        }
    };
    $(document).on("submit", ".request-search-wrapper", function (e) {
        e.preventDefault();
        request_obj.query = $(e.currentTarget).find(".request-search:first").val();
        fill_requests(request_obj, true, 0);
        return false;
    });
    $(document).on("click", ".request-search-submit", function (e) {
        e.preventDefault();
        request_obj.query = $(e.currentTarget).parent().parent().find(".request-search:first").val();
        fill_requests(request_obj, true, 0);
        return false;
    });
    $(document).on('click', '.request-menu-recommended-users', function (e) {
        e.preventDefault();
        request_menu_recommended_users();
        return false;
    });
    $(document).on('click', '.request-menu-friends', function (e) {
        e.preventDefault();
        request_menu_friends();
        return false;
    });
    $(document).on('click', '.request-menu-search', function (e) {
        e.preventDefault();
        request_menu_search();
        return false;
    });
    $(document).on("click", ".request-more", function (e) {
        e.preventDefault();
        var skip = $('.request-list .request-item').length;
        fill_requests(request_obj, false, skip);
        return false;
    });
    $(document).on('click', '.btn-request-opinion, .btn-request-translation', function (e) {
        e.preventDefault();
        var css_version = $("body").attr("data-css-version")
            , is_loginned = $("body").attr("data-check") === "true"
            , lang = $("body").attr("data-lang")
            , article_type
            , article_id
            , type
            , span
            , target_lang
            , $current_wrapper
            , language
            , written_language
            , select_language_list
            , select_language_wrapper = ""
            , request_menu
            , request_search
            , request_search_left
            , request_search_right
            , request_search_submit
            , request_search_wrapper
            , no_result
            , request_list
            , img
            , request_more
            , request;
        if (is_loginned === false) {
            modal(".prompt#request-login-prompt", "open");
            return false;
        }
        if (lang === undefined) {
            lang = "en";
        }
        if ($(e.currentTarget).hasClass("btn-request-opinion") === true) {
            type = "opinion";
            article_type = opinion_menu_obj["type"];
            article_id = opinion_menu_obj["_id"];
            $current_wrapper = opinion_menu_obj["$written"].find(".request-" + type + "-wrapper:first");
            is_w_opinion_opened = false;
            $(".btn-opinion.ing-write img").attr("src", aws_s3_url + "/icons/write-opinion.png");
            $(".btn-opinion.ing-write").removeClass("selected").removeClass("ing-write");
            $(".write-opinion-wrapper").empty().removeClass("opened");
            $(".request-opinion-wrapper").empty().removeClass("opened");
            opinion_menu_obj["$written"].find(".opinion-of-agenda:first").css("display", "none");
            opinion_menu_obj["$written"].find(".opinion-list-of-agenda:first").empty();
            opinion_menu_obj["$written"].find(".opinion-list-of-agenda-modal:first").empty();
            opinion_menu_obj["$written"].find(".btn-opinion:first").removeClass("selected").removeClass("ing-view").removeClass("ing-write").removeClass("ing-request");
            opinion_menu_obj["$written"].find(".btn-opinion:first img").attr("src", aws_s3_url + "/icons/write-opinion.png" + css_version);
            /*
            is_w_translation_opened = false;
            $(".btn-translation.ing-write img").attr("src", aws_s3_url + "/icons/write-translation.png");
            $(".btn-translation.ing-write").removeClass("selected").removeClass("ing-write");
            $(".write-translation-wrapper").empty().removeClass("opened");
            $(".request-translation-wrapper").empty().removeClass("opened");
            opinion_menu_obj["$written"].find(".translation-list-wrapper:first").css("display", "none");
            opinion_menu_obj["$written"].find(".translation-list:first").empty();
            opinion_menu_obj["$written"].find(".btn-translation:first").removeClass("selected").removeClass("ing-view").removeClass("ing-write").removeClass("ing-request");
            opinion_menu_obj["$written"].find(".btn-translation:first img").attr("src", aws_s3_url + "/icons/write-translation.png" + css_version);
            */
            opinion_menu_obj["$written"].find(".comments-wrapper.outer-comments:first").empty().removeClass("opened");
            opinion_menu_obj["$written"].find(".btn-open-comments:first").removeClass("selected");
            opinion_menu_obj["$written"].find(".btn-open-comments:first img").attr("src", aws_s3_url + "/icons/comments.png" + css_version);
            if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                star_editor_focuser.blur();
            }
            if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                moon_editor_focuser.blur();
            }
            if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
                write_form["rebuild_write_form_data_as_ground"]();
            }
            opinion_menu_obj["$written"].find(".btn-opinion:first").addClass("selected").addClass("ing-write");
            opinion_menu_obj["$written"].find(".btn-opinion:first img").attr("src", aws_s3_url + "/icons/write-opinion-selected.png");
            modal(".prompt#opinion-menu-prompt", "close");
        } else {
            return false;
            type = "translation";
            article_type = translation_menu_obj["type"];
            article_id = translation_menu_obj["_id"];
            $current_wrapper = translation_menu_obj["$written"].find(".request-" + type + "-wrapper:first");
            is_w_opinion_opened = false;
            $(".btn-opinion.ing-write img").attr("src", aws_s3_url + "/icons/write-opinion.png");
            $(".btn-opinion.ing-write").removeClass("selected").removeClass("ing-write");
            $(".write-opinion-wrapper").empty().removeClass("opened");
            $(".request-opinion-wrapper").empty().removeClass("opened");
            translation_menu_obj["$written"].find(".opinion-of-agenda:first").css("display", "none");
            translation_menu_obj["$written"].find(".opinion-list-of-agenda:first").empty();
            translation_menu_obj["$written"].find(".opinion-list-of-agenda-modal:first").empty();
            translation_menu_obj["$written"].find(".btn-opinion:first").removeClass("selected").removeClass("ing-view").removeClass("ing-write").removeClass("ing-request");
            translation_menu_obj["$written"].find(".btn-opinion:first img").attr("src", aws_s3_url + "/icons/write-opinion.png" + css_version);
            is_w_translation_opened = false;
            $(".btn-translation.ing-write img").attr("src", aws_s3_url + "/icons/write-translation.png");
            $(".btn-translation.ing-write").removeClass("selected").removeClass("ing-write");
            $(".write-translation-wrapper").empty().removeClass("opened");
            $(".request-translation-wrapper").empty().removeClass("opened");
            translation_menu_obj["$written"].find(".translation-list-wrapper:first").css("display", "none");
            translation_menu_obj["$written"].find(".translation-list:first").empty();
            translation_menu_obj["$written"].find(".btn-translation:first").removeClass("selected").removeClass("ing-view").removeClass("ing-write").removeClass("ing-request");
            translation_menu_obj["$written"].find(".btn-translation:first img").attr("src", aws_s3_url + "/icons/write-translation.png" + css_version);
            translation_menu_obj["$written"].find(".comments-wrapper.outer-comments:first").empty().removeClass("opened");
            translation_menu_obj["$written"].find(".btn-open-comments:first").removeClass("selected");
            translation_menu_obj["$written"].find(".btn-open-comments:first img").attr("src", aws_s3_url + "/icons/comments.png" + css_version);
            if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                star_editor_focuser.blur();
            }
            if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                moon_editor_focuser.blur();
            }
            if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
                write_form["rebuild_write_form_data_as_ground"]();
            }
            translation_menu_obj["$written"].find(".btn-translation:first").addClass("selected").addClass("ing-write");
            translation_menu_obj["$written"].find(".btn-translation:first img").attr("src", aws_s3_url + "/icons/write-translation-selected.png");
            modal(".prompt#translation-menu-prompt", "close");
        }
        if (type === "translation") {
            language = $current_wrapper.attr('data-lang');
            if (language === "en") {
                written_language = "english";
            } else if (language === "ja") {
                written_language = "japanese";
            } else if (language === "ko") {
                written_language = "korean";
            } else if (language === "zh-Hans") {
                written_language = "simplified_chinese";
            } else {
                written_language = "english";
            }
            written_language = "<span>" + i18n[lang][written_language] + "</span>";
            if (language === "en") {
                target_lang = "ja";
                select_language_list = "<option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
            } else if (language === "ja") {
                target_lang = "zh-Hans";
                select_language_list =  "<option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
            } else if (language === "ko") {
                target_lang = "en";
                select_language_list =  "<option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
            } else if (language === "zh-Hans") {
                target_lang = "ja";
                select_language_list =  "<option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
            }
            select_language_list = "<select class='request-select-language'>" + select_language_list + "</select>";
            select_language_wrapper = "<div class='request-select-language-wrapper'>" + written_language + " &#8594; " + select_language_list + "</div>";
        }
        request_menu = "<div class='request-menu-recommended-users selected'>" + i18n[lang].recommended_users + "</div>";
        request_menu = request_menu + "<div class='request-menu-friends'>" + i18n[lang].friends + "</div>";
        request_menu = request_menu + "<div class='request-menu-search'>" + i18n[lang].search + "</div>";
        request_menu = "<div class='request-menu'>" + request_menu + "</div>";
        request_search = "<input class='request-search' type='text' placeholder=''>";
        request_search_left = "<div class='request-search-left'>" + request_search + "</div>";
        request_search_submit = "<input class='request-search-submit' type='button' value=''>";
        request_search_right = "<div class='request-search-right'>" + request_search_submit + "</div>";
        request_search_wrapper = "<form class='request-search-wrapper'>" + request_search_left + request_search_right + "</form>";
        span = "<span>" + i18n[lang].there_is_no_user + "</span>";
        no_result = "<div class='no-result'>" + span + "</div>";
        request_list = "<div class='request-list'></div>";
        img = "<img class='btn-more-down-14' src='" + aws_s3_url + "/icons/more-down.png" + css_version + "'>";
        request_more = "<div class='request-more btn-more'>" + img +"</div>";
        request = select_language_wrapper + request_menu + request_search_wrapper + request_list + no_result + request_more;
        $current_wrapper.append(request).addClass('opened');
        request_obj = {};
        request_obj.big_type = type + "_request";
        request_obj.small_type = "recommended_users";
        request_obj.article_type = article_type;
        request_obj.article_id = article_id;
        if (type === "translation") {
            request_obj.source_lang = language;
            request_obj.target_lang = target_lang;
        }
        fill_requests(request_obj, true, 0);
        return false;
    });
    $(document).on("change", ".request-select-language", function (e) {
        request_obj.target_lang = $(e.currentTarget).find("option:selected").val();
        fill_requests(request_obj, true, 0);
    });
    $(document).on('focus', '.request-search', function (e) {
        $(e.currentTarget).css('border-color', '#5a00e0');
        $('.request-search-right').css('border-color', '#5a00e0');
        $('.request-search-submit').css('background-image', "url('" + aws_s3_url + "/icons/search-purple.png')");
    });
    $(document).on('blur', '.request-search', function (e) {
        $(e.currentTarget).css('border-color', '#ebebeb');
        $('.request-search-right').css('border-color', '#ebebeb');
        $('.request-search-submit').css('background-image', "url('" + aws_s3_url + "/icons/search-grey.png')");
    });
    $(document).on('click', '.btn-opinion', function (e) {
        e.preventDefault();
        $('.btn-ellipsis-mobile ul').css('display', 'none');
        var lang = $("body").attr("data-lang")
            , title
            , count
            , temp
            , menu;
        if (lang === undefined) {
            lang = "en";
        }
        count = parseInt($(e.currentTarget).attr("data-count"));
        if (count === 0) {
            count = "";
        } else {
            count = put_comma_between_three_digits(count);
        }
        title = "<img class='emoticon-big-img' src='" + aws_s3_url + "/icons/write-opinion-selected.png'>";
        title = title + "<span>" + i18n[lang].opinion + " " + count + "</span>";
        $(".prompt#opinion-menu-prompt .prompt-title").empty().append(title);
        temp = "<div class='btn-view-opinion btn-opinion-menu-item'>" + i18n[lang].view_opinion + "</div>";
        temp = temp + "<div class='btn-view-opinion-by-order-type sort-created-at'>" + i18n[lang].time_sequence + "</div>";
        temp = temp + "<div class='btn-view-opinion-by-order-type sort-popular'>" + i18n[lang].popularity_sequence + "</div>";
        temp = temp + "<div class='btn-write-opinion btn-opinion-menu-item'>" + i18n[lang].opinion_writing + "</div>";
        temp = temp + "<div class='btn-request-opinion btn-opinion-menu-item'>" + i18n[lang].opinion_request + "</div>";
        menu = "<div>" + temp + "</div>";
        $(".prompt#opinion-menu-prompt .prompt-main").empty().append(menu);
        opinion_menu_obj = {};
        opinion_menu_obj["_id"] = $(e.currentTarget).attr("data-id");
        opinion_menu_obj["blog_id"] = $(e.currentTarget).attr("data-blog-id");
        opinion_menu_obj["type"] = $(e.currentTarget).attr("data-type");
        opinion_menu_obj["is_modal"] = $(e.currentTarget).attr("data-is-modal") === "true";
        opinion_menu_obj["$btn_wrapper"] = $(e.currentTarget).parent();
        opinion_menu_obj["$written"] = $(e.currentTarget).parent().parent();
        opinion_menu_obj["$view_wrapper"] = {};
        opinion_menu_obj["$view_wrapper"]["top"] = opinion_menu_obj["$written"].find(".opinion-of-agenda:first");
        if (opinion_menu_obj["is_modal"] === true) {
            opinion_menu_obj["$view_wrapper"]["list"] = opinion_menu_obj["$written"].find("#opinion-list-of-agenda-modal:first");
            opinion_menu_obj["$view_wrapper"]["more"] = opinion_menu_obj["$written"].find("#opinion-more-of-agenda-modal:first");
        } else {
            opinion_menu_obj["$view_wrapper"]["list"] = opinion_menu_obj["$written"].find("#opinion-list-of-agenda:first");
            opinion_menu_obj["$view_wrapper"]["more"] = opinion_menu_obj["$written"].find("#opinion-more-of-agenda:first");
        }
        opinion_menu_obj["$write_wrapper"] = opinion_menu_obj["$written"].find(".write-opinion-wrapper:first");
        opinion_menu_obj["$request_wrapper"] = opinion_menu_obj["$written"].find(".request-opinion-wrapper:first");
        modal(".prompt#opinion-menu-prompt", "open");
        return false;
    });
    $(document).on('click', '.btn-translation, .btn-translation-mobile', function (e) {
        e.preventDefault();
        return false;
        $('.btn-ellipsis-mobile ul').css('display', 'none');
        var lang = $("body").attr("data-lang")
            , title
            , count
            , temp
            , menu
            , language_list
            , count_list;
        if (lang === undefined) {
            lang = "en";
        }
        count = parseInt($(e.currentTarget).attr("data-count"));
        if (count === 0) {
            count = "";
        } else {
            count = put_comma_between_three_digits(count);
        }
        language_list = $(e.currentTarget).attr("data-translation-language-list");
        language_list = language_list.split(",");
        count_list = $(e.currentTarget).attr("data-translation-count-list");
        count_list = count_list.split(",");
        title = "<img class='emoticon-big-img' src='" + aws_s3_url + "/icons/write-translation-selected.png'>";
        title = title + "<span>" + i18n[lang].translation + " " + count + "</span>";
        $(".prompt#translation-menu-prompt .prompt-title").empty().append(title);
        temp = "<div class='btn-view-translation btn-translation-menu-item'>" + i18n[lang].view_translation + "</div>";
        for (var i = 0; i < language_list.length; i++) {
            temp = temp + "<div class='btn-view-translation-by-language' data-lang='" + language_list[i] + "'>" + i18n[lang][get_language_text(language_list[i])] + " " + put_comma_between_three_digits(count_list[i]) + "</div>";
        }
        temp = temp + "<div class='btn-write-translation btn-translation-menu-item'>" + i18n[lang].translation_writing + "</div>";
        temp = temp + "<div class='btn-request-translation btn-translation-menu-item'>" + i18n[lang].translation_request + "</div>";
        menu = "<div>" + temp + "</div>";
        $(".prompt#translation-menu-prompt .prompt-main").empty().append(menu);
        modal(".prompt#translation-menu-prompt", "open");
        translation_menu_obj = {};
        translation_menu_obj["_id"] = $(e.currentTarget).attr("data-id");
        translation_menu_obj["agenda_id"] = $(e.currentTarget).attr("data-agenda-id");
        translation_menu_obj["blog_id"] = $(e.currentTarget).attr("data-blog-id");
        translation_menu_obj["type"] = $(e.currentTarget).attr("data-type");
        if ( $(e.currentTarget).hasClass("btn-translation") === true ) {
            translation_menu_obj["$btn_wrapper"] = $(e.currentTarget).parent();
            translation_menu_obj["$written"] = $(e.currentTarget).parent().parent();
        } else {
            translation_menu_obj["$btn_wrapper"] = $(e.currentTarget).parent().parent().parent();
            translation_menu_obj["$written"] = $(e.currentTarget).parent().parent().parent().parent();
        }
        translation_menu_obj["$view_wrapper"] = {};
        translation_menu_obj["$view_wrapper"]["top"] = translation_menu_obj["$written"].find(".translation-list-wrapper:first");
        translation_menu_obj["$view_wrapper"]["list"] = translation_menu_obj["$written"].find(".translation-list:first");
        translation_menu_obj["$view_wrapper"]["more"] = translation_menu_obj["$written"].find(".translation-more:first");
        translation_menu_obj["$write_wrapper"] = translation_menu_obj["$written"].find(".write-translation-wrapper:first");
        translation_menu_obj["$request_wrapper"] = translation_menu_obj["$written"].find(".request-translation-wrapper:first");
        return false;
    });
    $(document).on('click', '.btn-view-opinion', function (e) {
        e.preventDefault();
        var $parent =  $(e.currentTarget).parent();
        if ($parent.find(".btn-view-opinion-by-order-type").css("display") === "block") {
            $parent.find(".btn-view-opinion-by-order-type").css("display", "none");
        } else {
            $parent.find(".btn-view-opinion-by-order-type").css("display", "block");
        }
        return false;
    });
    $(document).on('click', '.btn-view-translation', function (e) {
        e.preventDefault();
        var $parent =  $(e.currentTarget).parent();
        if ($parent.find(".btn-view-translation-by-language").css("display") === "block") {
            $parent.find(".btn-view-translation-by-language").css("display", "none");
        } else {
            $parent.find(".btn-view-translation-by-language").css("display", "block");
        }
        return false;
    });
    $(document).on('click', '.prompt#opinion-menu-prompt .close', function (e) {
        e.preventDefault();
        modal(".prompt#opinion-menu-prompt", "close");
        return false;
    });
    $(document).on('click', '.prompt#translation-menu-prompt .close', function (e) {
        e.preventDefault();
        modal(".prompt#translation-menu-prompt", "close");
        return false;
    });
    $(document).on('click', '.btn-announcement, .btn-announcement-mobile', function (e) {
        e.preventDefault();
        $('.btn-ellipsis-mobile ul').css('display', 'none');
        var lang = $("body").attr("data-lang")
            , is_loginned = $("body").attr("data-check") === "true"
            , current_user_blog_id = null
            , user_profile_link = $('#desktop-user-menu ul a').attr('href')
            , title
            , count
            , temp
            , menu
            , css_version = $("body").attr("data-css-version");
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
        announcement_menu_obj = {};
        announcement_menu_obj["type"] = $(e.currentTarget).attr("data-type");
        announcement_menu_obj["_id"] = $(e.currentTarget).attr("data-id");
        announcement_menu_obj["blog_id"] = $(e.currentTarget).attr("data-blog-id");
        announcement_menu_obj["is_modal"] = $(e.currentTarget).attr("data-is-modal") === "true";
        if ( $(e.currentTarget).hasClass("btn-announcement") === true ) {
            announcement_menu_obj["$written"] = $(e.currentTarget).parent().parent();
        } else {
            announcement_menu_obj["$written"] = $(e.currentTarget).parent().parent().parent().parent();
        }
        announcement_menu_obj["$view_wrapper"] = {};
        announcement_menu_obj["$view_wrapper"]["top"] = announcement_menu_obj["$written"].find(".announcement-wrapper:first");
        if (announcement_menu_obj["is_modal"] === true) {
            announcement_menu_obj["$view_wrapper"]["list"] = announcement_menu_obj["$written"].find("#announcement-list-modal:first");
            announcement_menu_obj["$view_wrapper"]["more"] = announcement_menu_obj["$written"].find("#announcement-more-modal:first");
        } else {
            announcement_menu_obj["$view_wrapper"]["list"] = announcement_menu_obj["$written"].find("#announcement-list:first");
            announcement_menu_obj["$view_wrapper"]["more"] = announcement_menu_obj["$written"].find("#announcement-more:first");
        }
        announcement_menu_obj["$write_wrapper"] = announcement_menu_obj["$written"].find(".write-announcement-wrapper:first");
        if (announcement_menu_obj["blog_id"] !== current_user_blog_id) {
            callback_btn_view_announcement(announcement_menu_obj);
            return false;
        }
        count = parseInt($(e.currentTarget).attr("data-count"));
        if (count === 0) {
            count = "";
        } else {
            count = put_comma_between_three_digits(count);
        }
        title = "<img class='emoticon-big-img' src='" + aws_s3_url + "/icons/announcement2-selected.png'>";
        title = title + "<span>" + i18n[lang].announcement + " " + count + "</span>";
        $(".prompt#announcement-menu-prompt .prompt-title").empty().append(title);
        temp = "<div class='btn-view-announcement btn-announcement-menu-item'>" + i18n[lang].view_announcement + "</div>";
        temp = temp + "<div class='btn-write-announcement btn-announcement-menu-item'>" + i18n[lang].announcement_writing + "</div>";
        menu = "<div>" + temp + "</div>";
        $(".prompt#announcement-menu-prompt .prompt-main").empty().append(menu);
        modal(".prompt#announcement-menu-prompt", "open");
        return false;
    });
    $(document).on('click', '.prompt#announcement-menu-prompt .close', function (e) {
        e.preventDefault();
        modal(".prompt#announcement-menu-prompt", "close");
        return false;
    });
    $(document).on("click", ".btn-view-announcement", function (e) {
        e.preventDefault();
        callback_btn_view_announcement(announcement_menu_obj);
        return false;
    });
    $(document).on('click', '.btn-online-interview', function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version")
            , $written = $(e.currentTarget).parent().parent()
            , is_modal = $(e.currentTarget).attr("data-is-modal") === "true"
            , _id = $(e.currentTarget).attr("data-id");
        if (lang === undefined) {
            lang = "en";
        }
        $written.find(".answer-wrapper:first").css("display", "none");
        $written.find(".btn-online-interview:first").removeClass("selected");
        $written.find(".btn-online-interview:first img").attr("src", aws_s3_url + "/icons/online-interview.png" + css_version);
        $written.find(".announcement-wrapper:first").css("display", "none");
        $written.find(".write-announcement-wrapper:first").empty().removeClass("opened");
        $written.find(".btn-announcement:first").removeClass("selected");
        $written.find(".btn-announcement:first img").attr("src", aws_s3_url + "/icons/announcement2.png" + css_version);
        $written.find(".comments-wrapper.outer-comments:first").empty().removeClass("opened");
        $written.find(".btn-open-comments:first").removeClass("selected");
        $written.find(".btn-open-comments:first img").attr("src", aws_s3_url + "/icons/comments.png" + css_version);
        if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
            star_editor_focuser.blur();
        }
        if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
            moon_editor_focuser.blur();
        }
        $written.find(".answer-wrapper:first").css("display", "block");
        $written.find(".btn-online-interview:first").addClass("selected");
        $written.find(".btn-online-interview:first img").attr("src", aws_s3_url + "/icons/online-interview-selected.png");
        get_fill["answers_of_online_interview"]({
            is_new: true
            , is_modal: is_modal
            , article_id: _id
        });
        return false;
    });
});