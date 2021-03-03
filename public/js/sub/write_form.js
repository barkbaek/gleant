$(document).ready(function() {
    $(document).on('change', '.prompt#vote-prompt select', function (e) {
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var year = parseInt($('.prompt#vote-prompt select.vote-deadline-year option:selected').val());
        var month = parseInt($('.prompt#vote-prompt select.vote-deadline-month option:selected').val());
        var day_of_month = parseInt($('.prompt#vote-prompt select.vote-deadline-day-of-month option:selected').val());
        var hours = parseInt($('.prompt#vote-prompt select.vote-deadline-hours option:selected').val());
        var minutes = parseInt($('.prompt#vote-prompt select.vote-deadline-minutes option:selected').val());
        var options = ""
            , temp
            , days_of_month
            , day_of_week;
        if (
            $(e.currentTarget).hasClass('vote-deadline-year') === true ||
            $(e.currentTarget).hasClass('vote-deadline-month') === true
        ) {
            days_of_month = get_days_of_month(year, month);
            if ( days_of_month[ days_of_month.length - 1 ] < day_of_month ) {
                day_of_month = days_of_month[ days_of_month.length - 1 ];
            }
            options = "";
            for (var c = 0; c < days_of_month.length; c++) {
                if (days_of_month[c] === day_of_month) {
                    temp = "<option value='" + days_of_month[c] + "' selected='selected'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
                } else {
                    temp = "<option value='" + days_of_month[c] + "'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
                }
                options = options + temp;
            }
            $('.prompt#vote-prompt select.vote-deadline-day-of-month').empty().append(options);
        }
        day_of_month = parseInt($('.prompt#vote-prompt select.vote-deadline-day-of-month option:selected').val());
        vote_prompt.selected_datetime.setMinutes(minutes);
        vote_prompt.selected_datetime.setHours(hours);
        vote_prompt.selected_datetime.setDate(day_of_month);
        vote_prompt.selected_datetime.setMonth(month);
        vote_prompt.selected_datetime.setFullYear(year);
        day_of_week = get_i18n_time_text({ type: "weekday", number: vote_prompt.selected_datetime.getDay()});
        $('.vote-deadline-day-of-week').text(day_of_week);
        $('.vote-deadline-fixed-datetime').text(to_i18n_fixed_datetime(vote_prompt.selected_datetime));
    });
    write_form["total_init"]();
    $(document).on('load', '.iframe-vote', function (e) {
        var doc = e.contentDocument || e.contentWindow.document;
        if (doc !== undefined && $(doc).find('.vote').length > 0) {
            $(e).height( ($(doc).find('.vote')[0].scrollHeight + 2) + 'px' );
        }
    });
    $(window).resize(function () {
        if (($('.user-gallery').length > 0) &&
            ($('#image-menu-user-gallery').hasClass('selected') === true)) {
            image_prompt["init_gallery_images"]();
        }
        iframe_vote_resize_all();
    });
    $(document).on("click", ".user-gallery-item", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var $check_box = $(e.currentTarget).find('.check-box');
        if ($check_box.hasClass('selected') === true) {
            $check_box.removeClass('selected');
        } else {
            if (image_prompt["type"] === "logo") {
                if ($('.user-gallery .check-box.selected').length > 0) {
                    show_bert("danger", 3000, i18n[lang].please_select_only_one_image);
                    return false;
                }
            }
            $check_box.addClass('selected');
        }
        var selected_img_count = $('.user-gallery .check-box.selected').length;
        $('.gallery-item-count').text(i18n[lang].selected + " " + selected_img_count);
        return false;
    });
    var add_user_gallery_items = function () {
        var img_list = ""
            , img
            , resized = undefined
            , thumbnail
            , logo
            , remove_logo
            , css_version = $("body").attr("data-css-version")
            , lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        $('.user-gallery .check-box.selected').each(function () {
            thumbnail =  $(this).parent().find('.user-gallery-item-img').attr('src');
            resized =  $(this).parent().find('.user-gallery-item-img').attr('data-img');
            img_list = img_list + "<img class='inserted-image' src='" + resized + "' data-thumbnail='" + thumbnail + "'>";
        });
        if (image_prompt["type"] === "normal") { /* Editor */
            if (is_space_prompt_opened === true) {
                if ( $('#space-editor').length !== 0 ) {
                    CKEDITOR.instances["space-editor"].insertHtml(img_list);
                    setTimeout(function () {
                        CKEDITOR.instances["space-editor"].execCommand('autogrow');
                    }, 1500);
                }
            } else if (is_w_opinion_opened === true) {
                if ( $('#star-editor').length !== 0 ) {
                    CKEDITOR.instances["star-editor"].insertHtml(img_list);
                    setTimeout(function () {
                        CKEDITOR.instances["star-editor"].execCommand('autogrow');
                    }, 1500);
                }
            } else if (is_unicorn_prompt_opened === true) {
                if ( $('#unicorn-editor').length !== 0 ) {
                    CKEDITOR.instances["unicorn-editor"].insertHtml(img_list);
                    setTimeout(function () {
                        CKEDITOR.instances["unicorn-editor"].execCommand('autogrow');
                    }, 1500);
                }
            } else if (is_superior_prompt_opened === true) {
                if ( $('#superior-editor').length !== 0 ) {
                    CKEDITOR.instances["superior-editor"].insertHtml(img_list);
                    setTimeout(function () {
                        CKEDITOR.instances["superior-editor"].execCommand('autogrow');
                    }, 1500);
                }
            } else {
                if ( $('#ground-editor').length !== 0 ) {
                    CKEDITOR.instances["ground-editor"].insertHtml(img_list);
                    setTimeout(function () {
                        CKEDITOR.instances["ground-editor"].execCommand('autogrow');
                    }, 1500);
                }
            }
        } else if (image_prompt["type"] === "logo") {
            if (image_prompt["$logo_wrapper"] && resized !== undefined) {
                logo = "<img class='write-logo' src='" + resized + "'>";
                remove_logo = "<input class='btn-career remove-apply-now-logo' type='button' value='" + i18n[lang].remove + "'>";
                image_prompt["$logo_wrapper"].empty().append(logo + remove_logo);
            }
        } else {
            return false;
        }
        modal('.prompt#image-prompt', 'close');
        if (is_space_prompt_opened === true) {
            modal(".prompt#space-prompt", "open");
        }
        if (is_w_opinion_opened === true) {
            if (is_agenda_prompt_opened === true) {
                modal(".prompt#agenda-prompt", "open");
            }
        }
        if (is_unicorn_prompt_opened === true) {
            modal('.prompt#unicorn-prompt', 'open');
        }
        if (is_superior_prompt_opened === true) {
            modal('.prompt#superior-prompt', 'open');
        }
    };
    $(document).on('submit', '.prompt#image-prompt form#user-gallery-form', function (e) {
        e.preventDefault();
        add_user_gallery_items();
        return false;
    });
    $(document).on('click', '.prompt#image-prompt form#user-gallery-form #btn-add-user-gallery-item', function (e) {
        e.preventDefault();
        add_user_gallery_items();
        return false;
    });
    $(document).on('click', '.prompt#image-prompt .user-gallery-more', function (e) {
        e.preventDefault();
        get_gallery_items(user_gallery_old_date, function (docs) {
            var gallery_items = "", div1, div2, img1, img2, temp, width, height;
            var css_version = $("body").attr("data-css-version");
            if (docs.length < limit["user_gallery"] ) {
                $('.user-gallery-more').css('display', 'none');
            }
            if (docs.length !== 0) {
                user_gallery_old_date = docs[docs.length - 1]["updated_at"];
                for (var i = 0; i < docs.length; i++) {
                    temp = docs[i]["img"].split('.');
                    temp = temp[temp.length-2].split('-');
                    width = temp[temp.length-2];
                    height = temp[temp.length-1];

                    img2 = "<img src='" + aws_s3_url + "/icons/checked-big.png" + css_version + "' data-updated-at='" + docs[i]["updated_at"] + "'>";
                    div2 = "<div class='check-box no-resized'>" + img2 + "</div>";
                    img1 = "<img class='user-gallery-item-img no-resized' src='" + docs[i]["img"] + "' data-img='" + docs[i]["img"] + "' data-width='" + width + "' data-height='" + height + "'>";
                    div1 = "<div class='user-gallery-item'>" + div2 + img1 + "</div>";
                    gallery_items = gallery_items + div1;
                }
                $('.user-gallery').append(gallery_items);
                $('.user-gallery-wrapper').css('display', 'block');
                $('.gallery-item-count').css('display', 'block');
                image_prompt["resize_gallery_images"]();
            }
        });
        return false;
    });
    $(document).on('click', '.prompt#image-prompt #image-menu-user-gallery', function (e) {
        e.preventDefault();
        image_prompt["menu"]["user_gallery"]();
        return false;
    });
    $(document).on('click', '.prompt#image-prompt #image-menu-device-gallery', function (e) {
        e.preventDefault();
        image_prompt["menu"]["device_gallery"]();
        return false;
    });
    $(document).on('click', '.prompt#image-prompt form#image-device-form #btn-image-device-add', function (e) {
        e.preventDefault();
        $('#upload-image').val("");
        document.getElementById('upload-image').click();
        return false;
    });
    $("#upload-image").change(function (e) {
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var file = $('input[type=file]#upload-image')[0].files[0];
        if (!$('#upload-image').val().match(/.(jpg|jpeg|png|gif)$/i)) {
            show_bert("danger", 2000, i18n[lang].use_only_jpg_jpeg_png_gif_extension);
            return false;
        }
        if (file["size"] > 5242880) {
            show_bert("danger", 2000, i18n[lang].image_size_must_be_less_than_5mb);
            return false;
        }
        animation("wait", "play");
        $("#upload-image-form").trigger("submit");
    });
    $('iframe#upload-image-iframe').load(function() {
        var lang = $("body").attr("data-lang")
            , logo
            , remove_logo;
        if (lang === undefined) {
            lang = "en";
        }
        var iframe = document.getElementById("upload-image-iframe");
        var doc = iframe.contentDocument || iframe.contentWindow.document;
        var target, result;
        target = doc.getElementById("result-inserting-image");
        animation("wait", "stop");
        if (target) {
            result = target.innerHTML;
            result = JSON.parse(result);
        } else {
            show_bert("danger", 2000, i18n[lang].image_size_must_be_less_than_5mb);
            return false;
        }
        $(target).remove();
        if (result['res'] === false) {
            if (result['reason'] === 'server_error') {
                show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
            } else {
                show_bert("danger", 2000, i18n[lang].image_size_must_be_less_than_5mb);
            }
            return false;
        }
        if (image_prompt["type"] === "normal") {
            if (is_space_prompt_opened === true) {
                if ( $('#space-editor').length !== 0 ) {
                    CKEDITOR.instances["space-editor"].insertHtml( "<img class='inserted-image' data-thumbnail='" + result['thumbnail'] + "' src='" + result['img'] +"'>");
                    setTimeout(function () {
                        CKEDITOR.instances["space-editor"].execCommand('autogrow');
                    }, 1500);
                }
            } else if (is_w_opinion_opened === true) {
                if ( $('#star-editor').length !== 0 ) {
                    CKEDITOR.instances["star-editor"].insertHtml( "<img class='inserted-image' data-thumbnail='" + result['thumbnail'] + "' src='" + result['img'] +"'>");
                    setTimeout(function () {
                        CKEDITOR.instances["star-editor"].execCommand('autogrow');
                    }, 1500);
                }
            } else if (is_unicorn_prompt_opened === true) {
                if ( $('#unicorn-editor').length !== 0 ) {
                    CKEDITOR.instances["unicorn-editor"].insertHtml(img_list);
                    setTimeout(function () {
                        CKEDITOR.instances["unicorn-editor"].execCommand('autogrow');
                    }, 1500);
                }
            } else if (is_superior_prompt_opened === true) {
                if ( $('#superior-editor').length !== 0 ) {
                    CKEDITOR.instances["superior-editor"].insertHtml(img_list);
                    setTimeout(function () {
                        CKEDITOR.instances["superior-editor"].execCommand('autogrow');
                    }, 1500);
                }
            } else {
                if ( $('#ground-editor').length !== 0 ) {
                    CKEDITOR.instances["ground-editor"].insertHtml( "<img class='inserted-image' data-thumbnail='" + result['thumbnail'] + "' src='" + result['img'] +"'>");
                    setTimeout(function () {
                        CKEDITOR.instances["ground-editor"].execCommand('autogrow');
                    }, 1500);
                }
            }
        } else if (image_prompt["type"] === "logo") {
            if (image_prompt["$logo_wrapper"]) {
                logo = "<img class='write-logo' src='" + result['img'] + "'>";
                remove_logo = "<input class='btn-career remove-apply-now-logo' type='button' value='" + i18n[lang].remove + "'>";
                image_prompt["$logo_wrapper"].empty().append(logo + remove_logo);
            }
        } else {
            return false;
        }
        modal('.prompt#image-prompt', 'close');
        if (is_space_prompt_opened === true) {
            modal(".prompt#space-prompt", "open");
        }
        if (is_w_opinion_opened === true) {
            if (is_agenda_prompt_opened === true) {
                modal(".prompt#agenda-prompt", "open");
            }
        }
        if (is_unicorn_prompt_opened === true) {
            modal('.prompt#unicorn-prompt', 'open');
        }
        if (is_superior_prompt_opened === true) {
            modal('.prompt#superior-prompt', 'open');
        }
    });
    $(document).on("click", ".prompt#image-prompt .close, .prompt#image-prompt form#user-gallery-form #btn-cancel-user-gallery-item", function (e) {
        e.preventDefault();
        modal('.prompt#image-prompt', 'close');
        if (is_space_prompt_opened === true) {
            modal(".prompt#space-prompt", "open");
        }
        if (is_w_opinion_opened === true) {
            if (is_agenda_prompt_opened === true) {
                modal(".prompt#agenda-prompt", "open");
            }
        }
        if (is_unicorn_prompt_opened === true) {
            modal('.prompt#unicorn-prompt', 'open');
        }
        if (is_superior_prompt_opened === true) {
            modal('.prompt#superior-prompt', 'open');
        }
        return false;
    });
    var youtube_add_event = function () {
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var link = $('#youtube-link').val();
        if (link === "") {
            show_bert('danger', 3000, i18n[lang].please_enter_youtube_url);
            return false;
        }
        var id = link.split('/watch?v=');
        if (id.length > 1) {
            id = id[1];
            id = id.split('&');
            id = id[0];
        } else {
            id = id[0].split('/embed/');
            if (id.length > 1) {
                id = id[1];
                id = id.split('?');
                id = id[0];
            } else {
                id = link.split("youtu.be/");
                if (id.length > 1) {
                    id = id[1];
                } else {
                    show_bert('danger', 3000, i18n[lang].wrong_format + " " + i18n[lang].valid_format + ": https://www.youtube.com/watch?v=uBHfS76pWF4");
                    return false;
                }
            }
        }
        animation("wait", "play");
        var thumbnail = "https://img.youtube.com/vi/" + id + "/mqdefault.jpg";
        var home = window.location.protocol + "//" + window.location.hostname + (window.location.port === "" ? "" : ":" + window.location.port);
        var youtube_link = '<iframe class="youtube" type="text/html" src="' + window.location.protocol + '//www.youtube.com/embed/' + id + '?enablejsapi=1&origin=' + home + '" frameborder="0" allowfullscreen data-thumbnail="' + thumbnail + '"></iframe>';
        if (is_space_prompt_opened === true) {
            if ( $('#space-editor').length !== 0 ) {
                CKEDITOR.instances["space-editor"].insertHtml(youtube_link);
                setTimeout(function () {
                    CKEDITOR.instances["space-editor"].execCommand('autogrow');
                }, 1500);
            }
        } else if (is_w_opinion_opened === true) {
            if ( $('#star-editor').length !== 0 ) {
                CKEDITOR.instances["star-editor"].insertHtml(youtube_link);
                setTimeout(function () {
                    CKEDITOR.instances["star-editor"].execCommand('autogrow');
                }, 1500);
            }
        } else if (is_unicorn_prompt_opened === true) {
            if ( $('#unicorn-editor').length !== 0 ) {
                CKEDITOR.instances["unicorn-editor"].insertHtml(youtube_link);
                setTimeout(function () {
                    CKEDITOR.instances["unicorn-editor"].execCommand('autogrow');
                }, 1500);
            }
        } else if (is_superior_prompt_opened === true) {
            if ( $('#superior-editor').length !== 0 ) {
                CKEDITOR.instances["superior-editor"].insertHtml(youtube_link);
                setTimeout(function () {
                    CKEDITOR.instances["superior-editor"].execCommand('autogrow');
                }, 1500);
            }
        } else {
            if ( $('#ground-editor').length !== 0 ) {
                CKEDITOR.instances["ground-editor"].insertHtml(youtube_link);
                setTimeout(function () {
                    CKEDITOR.instances["ground-editor"].execCommand('autogrow');
                }, 1500);
            }
        }
        modal('.prompt#youtube-prompt', 'close');
        $('#youtube-link').val("");
        animation("wait", "stop");
        if (is_space_prompt_opened === true) {
            modal('.prompt#space-prompt', 'open');
        }
        if (is_w_opinion_opened === true) {
            if (is_agenda_prompt_opened === true) {
                modal(".prompt#agenda-prompt", "open");
            }
        }
        if (is_unicorn_prompt_opened === true) {
            modal('.prompt#unicorn-prompt', 'open');
        }
        if (is_superior_prompt_opened === true) {
            modal('.prompt#superior-prompt', 'open');
        }
    };
    $(document).on('submit', '.prompt#youtube-prompt form', function (e) {
        e.preventDefault();
        youtube_add_event();
        return false;
    });
    $(document).on('click', '.prompt#youtube-prompt form #btn-video-add', function (e) {
        e.preventDefault();
        youtube_add_event();
        return false;
    });
    $(document).on("click", ".prompt#youtube-prompt .close, .prompt#youtube-prompt #btn-video-cancel", function (e) {
        e.preventDefault();
        modal('.prompt#youtube-prompt', 'close');
        $('#youtube-link').val("");
        if (is_space_prompt_opened === true) {
            modal('.prompt#space-prompt', 'open');
        }
        if (is_w_opinion_opened === true) {
            if (is_agenda_prompt_opened === true) {
                modal(".prompt#agenda-prompt", "open");
            }
        }
        if (is_unicorn_prompt_opened === true) {
            modal('.prompt#unicorn-prompt', 'open');
        }
        if (is_superior_prompt_opened === true) {
            modal('.prompt#superior-prompt', 'open');
        }
        return false;
    });
    var link_add_event = function () {
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var link = $('.prompt#link-prompt #link').val()
            , scroll_position
            , environment_type;
        if (!/^((http|https):\/\/)/.test(link)) {
            link = "http://" + link;
        }
        modal('.prompt#link-prompt', 'close');
        $(".prompt#link-prompt #link").val("");
        if (is_space_prompt_opened === true) {
            environment_type = "space";
            modal('.prompt#space-prompt', 'open');
        } else if (is_w_opinion_opened === true) {
            if (is_agenda_prompt_opened === true) {
                modal(".prompt#agenda-prompt", "open");
            }
            environment_type = "star";
        } else {
            environment_type = "ground";
        }
        var s_cb = function (result) {
            scroll_position = $(".body-inner-main").scrollTop();
            if ( $('#'+ environment_type + '-editor').length !== 0 ) {
                try {
                    var iframe_src = window.location.protocol + "//" + window.location.hostname + (window.location.port === "" ? "" : ":" + window.location.port) + "/get/link?url=" + encodeURIComponent(link);
                    CKEDITOR.instances[environment_type + "-editor"].insertHtml("<iframe src='" + iframe_src + "' class='iframe-link' marginwidth='0' marginheight='0' hspace='0' vspace='0' frameborder='0' scrolling='no'></iframe>");
                    setTimeout(function () {
                        CKEDITOR.instances[environment_type + "-editor"].execCommand('autogrow');
                    }, 1500);
                }  catch (e) {
                    show_bert('danger', 3000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
            $(".body-inner-main").scrollTop(scroll_position);
        };
        var f_cb = function () {
            scroll_position = $(".body-inner-main").scrollTop();
            if ( $('#' + environment_type + '-editor').length !== 0 ) {
                try {
                    var iframe_src = window.location.protocol + "//" + window.location.hostname + (window.location.port === "" ? "" : ":" + window.location.port) + "/get/link?url=" + encodeURIComponent(link);
                    CKEDITOR.instances[environment_type + "-editor"].insertHtml("<iframe src='" + iframe_src + "' class='iframe-link' marginwidth='0' marginheight='0' hspace='0' vspace='0' frameborder='0' scrolling='no'></iframe>");
                    setTimeout(function () {
                        CKEDITOR.instances[environment_type + "-editor"].execCommand('autogrow');
                    }, 1500);
                } catch (e) {
                    show_bert('danger', 3000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
            $(".body-inner-main").scrollTop(scroll_position);
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{link:encodeURIComponent(link)},
            pathname:"/insert/link",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    };
    $(document).on('submit', '.prompt#link-prompt form', function (e) {
        e.preventDefault();
        link_add_event();
        return false;
    });
    $(document).on('click', '.prompt#link-prompt form #btn-link-add', function (e) {
        e.preventDefault();
        link_add_event();
        return false;
    });
    $(document).on("click", ".prompt#link-prompt .close, .prompt#link-prompt #btn-link-cancel", function (e) {
        e.preventDefault();
        modal('.prompt#link-prompt', 'close');
        $('#link').val("");
        if (is_space_prompt_opened === true) {
            modal('.prompt#space-prompt', 'open');
        }
        if (is_w_opinion_opened === true) {
            if (is_agenda_prompt_opened === true) {
                modal(".prompt#agenda-prompt", "open");
            }
        }
        return false;
    });
    $(document).on('focus', '.prompt#vote-prompt #vote-question', function (e) {
        $('#vote-question-wrapper').css('border-color', '#5a00e0');
    });
    $(document).on('blur', '.prompt#vote-prompt #vote-question', function (e) {
        $('#vote-question-wrapper').css('border-color', '#ebebeb');
    });
    $(document).on('focus', '.prompt#vote-prompt .choice-item input.choice-input', function (e) {
        $(e.currentTarget).parent().parent().find('.choice-index').css('border-color', '#5a00e0');
    });
    $(document).on('blur', '.prompt#vote-prompt .choice-item input.choice-input', function (e) {
        $(e.currentTarget).parent().parent().find('.choice-index').css('border-color', '#ebebeb');
    });
    $(document).on("click", ".prompt#vote-prompt .choice-add", function(e) {
        e.preventDefault();
        var item, itemHTML;
        var css_version = $("body").attr("data-css-version");
        item = "<div class='choice-item'><div class='choice-index'></div><div class='choice-input-wrapper'><input class='choice-input' type='text' placeholder=''></div><div class='choice-remove-wrapper'><div class='choice-remove'><img src='" + aws_s3_url + "/icons/remove.png" + css_version + "'></div></div></div>";
        itemHTML = $.parseHTML(item);
        $(".prompt#vote-prompt .choices").append(itemHTML);
        $.each($(".prompt#vote-prompt .choice-index"), function (i, e) {
            e.innerHTML = i + 1;
        });
        return false;
    });
    $(document).on("click", ".prompt#vote-prompt .choice-remove", function (e) {
        e.preventDefault();
        var item = $(e.currentTarget).parent().parent();
        $(item).remove();
        $.each($(".prompt#vote-prompt .choice-index"), function (i, e) {
            e.innerHTML = i + 1;
        });
        return false;
    });
    var vote_add_event = function () {
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var type = $(".prompt#vote-prompt").attr('data-type')
            , scroll_position
            , environment_type
            , question = $(".prompt#vote-prompt #vote-question").val().trim()
            , is_secret = $('.vote-secret').hasClass('selected')
            , is_finish_set = true
            , finish_at = null
            , choice_list = []
            , value
            , choice_input_length = $(".prompt#vote-prompt .choice-input").length
            , iframe_height = ($('.prompt#vote-prompt > div > div > div')[0].scrollHeight + ($('.prompt#vote-prompt textarea')[0].scrollHeight - 100)) - (43 + 12 + 24) + 'px';
        $(".prompt#vote-prompt .choice-input").each( function () {
            value = $(this).val().trim().replace(/\s\s+/gi, ' ');
            if (value !== "") {
                choice_list.push(value);
            }
        });
        if (type === "unlimited") {
            is_finish_set = $('.vote-deadline-datetime').hasClass('selected');
            if (is_finish_set === true) {
                if (new Date().valueOf() >= vote_prompt.selected_datetime.valueOf()) {
                    show_bert('danger', 3000, i18n[lang].please_set_the_deadline_enough);
                    return false;
                } else {
                    vote_prompt.selected_datetime.setSeconds(0);
                    vote_prompt.selected_datetime.setMilliseconds(0);
                    finish_at = vote_prompt.selected_datetime.valueOf();
                }
            }
        }
        if (question === "") {
            if (choice_input_length < 2) {
                return show_bert('danger', 3000, i18n[lang].please_enter_question + " " + i18n[lang].please_add_at_least_2_choices);
            } else {
                if (choice_input_length === choice_list.length) {
                    return show_bert('danger', 3000, i18n[lang].please_enter_question);
                } else {
                    return show_bert('danger', 3000, i18n[lang].please_enter_question_choices);
                }
            }
        } else {
            if (choice_input_length < 2) {
                return show_bert('danger', 3000, i18n[lang].please_add_at_least_2_choices);
            } else {
                if (choice_input_length !== choice_list.length) {
                    return show_bert('danger', 3000, i18n[lang].please_enter_choices);
                }
            }
        }
        modal('.prompt#vote-prompt', 'close');
        $(".prompt#vote-prompt #vote-question").val("");
        $(".prompt#vote-prompt .choices").empty();
        if (is_space_prompt_opened === true) {
            environment_type = "space";
            modal('.prompt#space-prompt', 'open');
        } else if (is_w_opinion_opened === true) {
            environment_type = "star";
        } else {
            environment_type = "ground";
        }
        if (is_w_opinion_opened === true) {
            if (is_agenda_prompt_opened === true) {
                modal(".prompt#agenda-prompt", "open");
            }
        }
        var s_cb = function (result) {
            if (result.response === true) {
                scroll_position = $(".body-inner-main").scrollTop();
                if ( $('#'+ environment_type + '-editor').length !== 0 ) {
                    try {
                        var iframe_src = window.location.protocol + "//" + window.location.hostname + (window.location.port === "" ? "" : ":" + window.location.port) + "/get/vote?q=" + result._id;
                        var iframe_id = "iframe-vote-" + result._id;

                        CKEDITOR.instances[environment_type + "-editor"].insertHtml("<iframe id='" + iframe_id + "' class='iframe-vote' src='" + iframe_src + "' data-id='" + result._id + "' marginwidth='0' marginheight='0' hspace='0' vspace='0' frameborder='0' scrolling='yes' style='height:" + iframe_height + ";' height='0px' onload='iframe_vote_load_callback(this);'></iframe>");
                        CKEDITOR.instances[environment_type + "-editor"].execCommand('autogrow');

                        var check_iframe_load = function () {
                            setTimeout(function () {
                                var doc = $("#cke_" + environment_type + "-editor iframe")[0].contentDocument || $("#cke_" + environment_type + "-editor iframe")[0].contentWindow.document;
                                var doc2 = $( doc ).find("#" + iframe_id)[0].contentDocument || $( doc ).find("#" + iframe_id)[0].contentWindow.document;
                                var $btn_vote_submit = $ ( doc2 ).find(".btn-vote-submit");
                                var $vote
                                    , inner_height;
                                if ($btn_vote_submit.length > 0) {
                                    $vote = $( doc2 ).find(".vote");
                                    if ($vote.length === 0) {
                                        check_iframe_load();
                                    } else {
                                        setTimeout(function () {
                                            inner_height  = $( doc2 ).find(".vote")[0].scrollHeight;
                                            $( doc ).find("#" + iframe_id).height((inner_height + 2) + 'px');
                                            $( doc ).find("#" + iframe_id).attr('height', (inner_height + 2) + 'px');
                                            CKEDITOR.instances[environment_type + "-editor"].execCommand('autogrow');
                                        }, 250);
                                    }
                                } else {
                                    check_iframe_load();
                                }
                            }, 10);
                        };
                        check_iframe_load();
                    } catch (e) {
                        show_bert('danger', 3000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                    }
                }
                $(".body-inner-main").scrollTop(scroll_position);
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    show_bert('danger', 3000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        var f_cb = function () {
            show_bert('danger', 3000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{
                type:encodeURIComponent(type)
                , question:encodeURIComponent(question)
                , choice_list:encodeURIComponent(JSON.stringify(choice_list))
                , is_secret:encodeURIComponent(is_secret)
                , is_finish_set:encodeURIComponent(is_finish_set)
                , finish_at:encodeURIComponent(finish_at)
            },
            pathname:"/insert/vote",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    };
    $(document).on('submit', '.prompt#vote-prompt form', function (e) {
        e.preventDefault();
        vote_add_event();
        return false;
    });
    $(document).on('click', '.prompt#vote-prompt form #btn-vote-add', function (e) {
        e.preventDefault();
        vote_add_event();
        return false;
    });
    $(document).on('click', '.prompt#vote-prompt .vote-secret', function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget);
        var css_version = $("body").attr("data-css-version");
        if ($wrapper.hasClass('selected') === true) {
            $wrapper.removeClass('selected');
            $wrapper.find('.toggle-vote-secret-checker img').attr('src', aws_s3_url + '/icons/checked-grey.png' + css_version);
        } else {
            $wrapper.addClass('selected');
            $wrapper.find('.toggle-vote-secret-checker img').attr('src', aws_s3_url + '/icons/checked-blue.png' + css_version);
        }
        return false;
    });
    $(document).on('click', '.prompt#vote-prompt .vote-deadline-datetime-top', function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent();
        var css_version = $("body").attr("data-css-version");
        if ($wrapper.hasClass('selected') === true) {
            $wrapper.removeClass('selected');
            $wrapper.find('.toggle-vote-deadline-datetime-checker img').attr('src', aws_s3_url + '/icons/checked-grey.png' + css_version);
            $wrapper.find('.vote-deadline-datetime-content').css('display', 'none');
        } else {
            $wrapper.addClass('selected');
            $wrapper.find('.toggle-vote-deadline-datetime-checker img').attr('src', aws_s3_url  + '/icons/checked-blue.png' + css_version);
            $wrapper.find('.vote-deadline-datetime-content').css('display', 'block');
        }
        return false;
    });
    $(document).on("click", ".prompt#vote-prompt .close, .prompt#vote-prompt #btn-vote-cancel", function (e) {
        e.preventDefault();
        modal('.prompt#vote-prompt', 'close');
        if (is_space_prompt_opened === true) {
            modal('.prompt#space-prompt', 'open');
        }
        if (is_w_opinion_opened === true) {
            if (is_agenda_prompt_opened === true) {
                modal(".prompt#agenda-prompt", "open");
            }
        }
        $(".prompt#vote-prompt #vote-question").val("");
        $(".prompt#vote-prompt .choices").empty();
        return false;
    });
    $(document).on("click", ".write-form .btn-initialization", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var description = i18n[lang].do_you_want_to_initialize_it;
        if (is_agenda_prompt_opened === true) {
            modal('.prompt#agenda-prompt', 'close');
        }
        if (is_opinion_prompt_opened === true) {
            modal('.prompt#opinion-prompt', 'close');
        }
        if (is_space_prompt_opened === true) {
            modal('.prompt#space-prompt', 'close');
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
        $(".prompt#initialization-prompt .prompt-description").text(description);
        modal(".prompt#initialization-prompt", "open");
        return false;
    });
    $(document).on("click", ".prompt#initialization-prompt .btn-ok", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var environment_type;
        if (is_space_prompt_opened === true) {
            environment_type = "space";
        } else if (is_w_opinion_opened === true) {
            environment_type = "star";
        } else if (is_unicorn_prompt_opened === true) {
            environment_type = "unicorn";
        } else if (is_superior_prompt_opened === true) {
            environment_type = "superior";
        } else {
            write_form["rebuild_write_form_data_as_ground"]();
            environment_type = "ground";
        }
        write_form["print_write_form_data"]();
        var type = $("#" + environment_type).attr("data-type");
        write_form["init"](environment_type, type);
        modal(".prompt#initialization-prompt", "close");
        if (is_space_prompt_opened === true) {
            modal(".prompt#space-prompt", "open");
            $(".prompt#space-prompt .prompt-left > div").scrollTop($(".prompt#space-prompt .prompt-left > div").scrollTop() + ($("#" + environment_type).offset().top));
        } else {
            if (is_w_opinion_opened === true) {
                if (is_agenda_prompt_opened === true) {
                    modal(".prompt#agenda-prompt", "open");
                }
            } else {
                if (is_unicorn_prompt_opened === true) {
                    modal('.prompt#unicorn-prompt', 'open');
                } else {
                    if (is_superior_prompt_opened === true) {
                        modal('.prompt#superior-prompt', 'open');
                    } else {
                        $(".body-inner-main").scrollTop($(".body-inner-main").scrollTop() + ($("#" + environment_type).offset().top - 50));
                    }
                }
            }
        }
        show_bert("success", 2000, i18n[lang].successfully_initialized);
        return false;
    });
    $(document).on("click", ".prompt#initialization-prompt .close, .prompt#initialization-prompt .btn-cancel", function (e) {
        e.preventDefault();
        modal(".prompt#initialization-prompt", "close");
        if (is_space_prompt_opened === true) {
            modal('.prompt#space-prompt', 'open');
        }
        if (is_w_opinion_opened === true) {
            if (is_agenda_prompt_opened === true) {
                modal(".prompt#agenda-prompt", "open");
            }
        }
        if (is_unicorn_prompt_opened === true) {
            modal('.prompt#unicorn-prompt', 'open');
        }
        if (is_superior_prompt_opened === true) {
            modal('.prompt#superior-prompt', 'open');
        }
        return false;
    });
    $(document).on("click", ".write-form .write-cancel", function (e) {
        e.preventDefault();
        var environment_type;
        if (is_space_prompt_opened === true) {
            modal('.prompt#space-prompt', 'close');
            is_space_prompt_opened = false;
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
            if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
                write_form["rebuild_write_form_data_as_ground"]();
            }
        } else if (is_w_opinion_opened === true) {
            is_w_opinion_opened = false;
            if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                star_editor_focuser.blur();
            }
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
            if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
                write_form["rebuild_write_form_data_as_ground"]();
            }
        } else if (is_unicorn_prompt_opened === true) {
            modal('.prompt#unicorn-prompt', 'close');
            is_unicorn_prompt_opened = false;
            if (is_apply_now_prompt_opened === true) {
                modal('.prompt#apply-now-prompt', 'open');
            }
            if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
                write_form["rebuild_write_form_data_as_ground"]();
            }
        } else if (is_superior_prompt_opened === true) {
            modal('.prompt#superior-prompt', 'close');
            is_superior_prompt_opened = false;
            if (is_hire_me_prompt_opened === true) {
                modal('.prompt#hire-me-prompt', 'open');
            }
            if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
                write_form["rebuild_write_form_data_as_ground"]();
            }
        } else {
            if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
                write_form["rebuild_write_form_data_as_ground"]();
            }
            if (write_form.current_type === 'apply_now') {
                if (write_form.current_action === 'write') {
                    window.location = '/apply-now';
                } else {
                    $('.single-article-wrapper .written-apply_now').css('display', 'block');
                    $('#ground').css('display', 'none');
                    $('.body-inner-main').scrollTop(0);
                }
            } else if (write_form.current_type === 'hire_me') {
                if (write_form.current_action === 'write') {
                    window.location = '/hire-me';
                } else {
                    $('.single-article-wrapper .written-hire_me').css('display', 'block');
                    $('#ground').css('display', 'none');
                    $('.body-inner-main').scrollTop(0);
                }
            } else if (write_form.current_type === 'agenda') {
                if (write_form.current_action === 'write') {
                    window.location = '/debate';
                } else {
                    $('.single-article-wrapper .written-agenda').css('display', 'block');
                    $('#ground').css('display', 'none');
                    $('.body-inner-main').scrollTop(0);
                }
            } else if (write_form.current_type === 'opinion') {
                if (write_form.current_action === 'write') {
                    return false;
                } else {
                    $('.single-article-wrapper .written-opinion').css('display', 'block');
                    $('#ground').css('display', 'none');
                    $('.body-inner-main').scrollTop(0);
                }
            } else if (write_form.current_type === 'blog') {
                if (write_form.current_action === 'write') {
                    var pathname = window.location.pathname
                        , temp = pathname.split('/');
                    window.location = '/' + temp[1] + '/' + temp[2] + '/' + temp[4];
                } else {
                    $('.single-article-wrapper .written-blog').css('display', 'block');
                    $('#ground').css('display', 'none');
                    $('.body-inner-main').scrollTop(0);
                }
            } else {
                if (write_form.current_action === 'write') {
                    return false;
                } else {
                    $('.single-article-wrapper .written-gallery').css('display', 'block');
                    $('#ground').css('display', 'none');
                    $('.body-inner-main').scrollTop(0);
                }
            }
        }
        return false;
    });
    $(document).on("submit", ".write-form", function (e) {
        e.preventDefault();
        return false;
    });
    $(document).on("click", ".write-form .write-submit", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var environment_type
            , profile
            , public_authority
            , opinion_authority
            , translation_authority
            , comment_authority
            , application_authority
            , is_start_set
            , start_at
            , is_finish_set
            , finish_at
            , language
            , company
            , logo
            , file
            , business_type
            , country
            , city
            , protocol
            , url
            , job
            , employment_status
            , decide_salary_later
            , salary_period
            , salary
            , salary_unit
            , main_tag
            , temp_tags
            , tags = []
            , title
            , value
            , content
            , is_online_interview_set
            , $online_interview_questions
            , online_interview_questions = []
            , $choices
            , close_write_submit = false
            , num
            , choices
            , choice
            , choice_input_length
            , online_interview_question
            , answer_maximum_length
            , online_interview_type
            , is_online_interview_time
            , now = new Date().valueOf();
        if (is_space_prompt_opened === true) {
            environment_type = "space";
        } else if (is_w_opinion_opened === true) {
            environment_type = "star";
        } else if (is_unicorn_prompt_opened === true) {
            environment_type = "unicorn";
        } else if (is_superior_prompt_opened === true) {
            environment_type = "superior";
        } else {
            write_form["rebuild_write_form_data_as_ground"]();
            environment_type = "ground";
        }
        write_form["print_write_form_data"]();
        temp_tags = $("#" + environment_type + " .tags").val();
        title = $("#" + environment_type + " .write-form .write-title").val();
        if (temp_tags && temp_tags !== "") {
            temp_tags = temp_tags.split('#');
        } else {
            temp_tags = [];
        }
        if (write_form["current_type"] === "apply_now") {
            public_authority = $("#" + environment_type + " select.apply-now-public-authority option:selected").val();
            is_online_interview_time = $("#" + environment_type + " .apply-now-setting").attr("data-is-online-interview-time") === "true";
            if (is_online_interview_time === true) {
                is_online_interview_set = true;
                application_authority = $("#" + environment_type + " select.application-authority option:selected").val();
                is_start_set = false;
                start_at = 0;
                is_finish_set = true;
                finish_at = parseInt($("#" + environment_type + " .time-setting-deadline-datetime-wrapper").attr("data-datetime"));
                online_interview_questions = [];
            } else {
                is_online_interview_set = $("#" + environment_type + " .online-interview:first").is(":checked") === true;
                if (is_online_interview_set === true) {
                    application_authority = $("#" + environment_type + " select.application-authority option:selected").val();
                    is_start_set = $("#" + environment_type + " .time-setting-start-right-now").is(":checked") === true ? false: true;
                    start_at = parseInt($("#" + environment_type + " .time-setting-start-datetime-wrapper").attr("data-datetime"));
                    is_finish_set = true;
                    finish_at = parseInt($("#" + environment_type + " .time-setting-deadline-datetime-wrapper").attr("data-datetime"));
                    if ($("#" + environment_type + " .online-interview-questions-content").find(".online-interview-question-item").length < 1) {
                        show_bert("danger", 3000, i18n[lang].please_add_online_interview_question);
                        return false;
                    }
                    $.each($("#" + environment_type + " .online-interview-questions-content").find(".online-interview-question-item"), function (i, e) {
                        num = i + 1;
                        online_interview_type = $(this).attr('data-type');
                        if (online_interview_type === 'short-answer') {
                            online_interview_question = $(this).find('.online-interview-question:first').val();
                            answer_maximum_length = parseInt($(this).find("select.answer-maximum-length option:selected").val());
                            if (
                                (answer_maximum_length % 100 !== 0) ||
                                (answer_maximum_length < 0) ||
                                (answer_maximum_length > 1000)
                            ) {
                                close_write_submit = true;
                                return false;
                            }
                            if (online_interview_question === "") {
                                close_write_submit = true;
                                show_bert('danger', 3000, i18n[lang].question + " " +  num + " - " + i18n[lang].please_enter_question);
                                return false;
                            }
                            online_interview_questions.push({
                                type: "short_answer"
                                , question: online_interview_question
                                , max_length: answer_maximum_length
                            });
                        } else if (online_interview_type === 'multiple-choice') {
                            online_interview_question = $(this).find('.online-interview-question:first').val();
                            choices = [];
                            choice_input_length = $(this).find('.choice-item').length;
                            $.each( $(this).find('.choice-item'), function (i, e) {
                                choice = $(this).find('.choice-input:first').val().trim().replace(/\s\s+/gi, ' ');
                                if (choice !== "") {
                                    choices.push(choice);
                                }
                            });
                            if (online_interview_question === "") {
                                if (choice_input_length < 2) {
                                    close_write_submit = true;
                                    show_bert('danger', 3000, i18n[lang].question + " " +  num + " - " + i18n[lang].please_enter_question + " " + i18n[lang].please_add_at_least_2_choices);
                                    return false;
                                } else {
                                    if (choice_input_length === choices.length) {
                                        close_write_submit = true;
                                        show_bert('danger', 3000, i18n[lang].question + " " +  num + " - " + i18n[lang].please_enter_question);
                                        return false;
                                    } else {
                                        close_write_submit = true;
                                        show_bert('danger', 3000, i18n[lang].question + " " +  num + " - " + i18n[lang].please_enter_question_choices);
                                        return false;
                                    }
                                }
                            } else {
                                if (choice_input_length < 2) {
                                    close_write_submit = true;
                                    show_bert('danger', 3000, i18n[lang].question + " " +  num + " - " + i18n[lang].please_add_at_least_2_choices);
                                    return false;
                                } else {
                                    if (choice_input_length !== choices.length) {
                                        close_write_submit = true;
                                        show_bert('danger', 3000, i18n[lang].question + " " +  num + " - " + i18n[lang].please_enter_choices);
                                        return false;
                                    }
                                }
                            }
                            online_interview_questions.push({
                                type: "multiple_choice"
                                , question: online_interview_question
                                , choices: choices
                            });
                        }
                    });
                    if (close_write_submit === true) {
                        return false;
                    }
                }
            }
            /* language = $("#" + environment_type + " select.written-language option:selected").val(); */
            language = "ko";
            company = $("#" + environment_type + " input.write-company").val();
            if ( $("#" + environment_type + " img.write-logo").length > 0 ) {
                logo = $("#" + environment_type + " img.write-logo").attr('src');
            } else {
                logo = "";
            }
            business_type = $("#" + environment_type + " input.write-business-type").val();
            country = $("#" + environment_type + " input.write-country").val();
            city = $("#" + environment_type + " input.write-city").val();
            protocol = $("#" + environment_type + " select.write-website-select option:selected").val();
            url = $("#" + environment_type + " input.write-website-input").val();
            job = $("#" + environment_type + " input.write-job").val();
            employment_status = $("#" + environment_type + " select.write-employment-status option:selected").val();
            decide_salary_later = $("#" + environment_type + " .decide-after-consulting").is(":checked") === true;
            if (decide_salary_later === false) {
                salary_period = $("#" + environment_type + " select.write-salary-period option:selected").val();
                try {
                    salary = $("#" + environment_type + " input.write-salary-input").val();
                    if (salary === "") {
                        show_bert("danger", 3000, i18n[lang].please_enter_salary);
                        return false;
                    }
                    salary = parseFloat(salary);
                    if (isNaN(salary) === true) {
                        show_bert("danger", 3000, i18n[lang].salary + " - " + i18n[lang].please_enter_only_numbers);
                        return false;
                    }
                } catch (e) {
                    show_bert("danger", 3000, i18n[lang].salary + " - " + i18n[lang].please_enter_only_numbers);
                    return false;
                }
                salary_unit = $("#" + environment_type + " select.write-salary-select option:selected").val();
            }
        } else if (write_form["current_type"] === "hire_me") {
            public_authority = $("#" + environment_type + " select.hire-me-public-authority option:selected").val();
            /* language = $("#" + environment_type + " select.written-language option:selected").val(); */
            language = "ko";
            job = $("#" + environment_type + " input.write-job").val();
            employment_status = $("#" + environment_type + " select.write-employment-status option:selected").val();
            decide_salary_later = $("#" + environment_type + " .decide-after-consulting").is(":checked") === true;
            if (decide_salary_later === false) {
                salary_period = $("#" + environment_type + " select.write-salary-period option:selected").val();
                try {
                    salary = $("#" + environment_type + " input.write-salary-input").val();
                    if (salary === "") {
                        show_bert("danger", 3000, i18n[lang].please_enter_salary);
                        return false;
                    }
                    salary = parseFloat(salary);
                    if (isNaN(salary) === true) {
                        show_bert("danger", 3000, i18n[lang].salary + " - " + i18n[lang].please_enter_only_numbers);
                        return false;
                    }
                } catch (e) {
                    show_bert("danger", 3000, i18n[lang].salary + " - " + i18n[lang].please_enter_only_numbers);
                    return false;
                }
                salary_unit = $("#" + environment_type + " select.write-salary-select option:selected").val();
            }
        } else if (
            write_form["current_type"] === "agenda" ||
            write_form["current_type"] === "opinion"
        ) {
            profile = $("#" + environment_type + " .write-top .showing-profile").text();
            /*language = $("#" + environment_type + " select.written-language option:selected").val();*/
            language = "";
            main_tag = $("#" + environment_type + " select.main-tag option:selected").val();
            temp_tags[0] = main_tag;
            if (temp_tags[0] === undefined) {
                show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                return false;
            }
            if (write_form["current_type"] === "agenda") {
                public_authority = $("#" + environment_type + " select.debate-public-authority option:selected").val();
                opinion_authority = $("#" + environment_type + " select.opinion-writing-authority option:selected").val();
                /*translation_authority = $("#" + environment_type + " select.translation-writing-authority option:selected").val();*/
                translation_authority = opinion_authority;
                comment_authority = $("#" + environment_type + " select.comment-writing-authority option:selected").val();
                is_start_set = $("#" + environment_type + " .time-setting-start-right-now").is(":checked") === true ? false: true;
                start_at = parseInt($("#" + environment_type + " .time-setting-start-datetime-wrapper").attr("data-datetime"));
                is_finish_set = $("#" + environment_type + " .time-setting-deadline-unlimited").is(":checked") === true ? false: true;
                finish_at = parseInt($("#" + environment_type + " .time-setting-deadline-datetime-wrapper").attr("data-datetime"));
                if (is_finish_set === true) {
                    if (is_start_set === true) {
                        if (start_at >= finish_at) {
                            return show_bert('danger', 3000, i18n[lang].please_set_the_deadline_enough);
                        }
                    } else {
                        if (now >= finish_at) {
                            return show_bert('danger', 3000, i18n[lang].please_set_the_deadline_enough);
                        }
                    }
                }
            }
        } else {
            /*language = $("#" + environment_type + " select.written-language option:selected").val();*/
            language = "ko";
            public_authority = parseInt($("#" + environment_type + " select.public-authority option:selected").val());
        }
        for (var i = 0; i < temp_tags.length; i++) {
            temp_tags[i] = temp_tags[i].trim().replace(/\s\s+/gi, '').toLowerCase();
        }
        for (var i = 1; i < temp_tags.length; i++) {
            if (temp_tags[i] !== "") {
                tags.push(temp_tags[i]);
            }
        }
        if (write_form["current_type"] === "gallery") {
            content = $('#ground #ground-textarea').val();
        } else {
            if ( $('#' + environment_type + '-editor').length !== 0 ) {
                content = CKEDITOR.instances[environment_type + '-editor'].getData().replace(/<p>/gi,'<div>').replace(/<\/p>/gi,'</div>').replace(/<div>/gi,'').replace(/<\/div>/gi,'<br />').replace(/<script>/gi,'').replace(/<\/script>/gi,'');
            }
        }
        var temp_img_list = []
            , img_list = [];
        if (
            write_form["current_type"] !== "apply_now" &&
            write_form["current_type"] !== "hire_me" &&
            write_form["current_type"] !== "gallery"
        ) {
            if ( $('#' + environment_type + '-editor').length !== 0 ) {
                temp_img_list = CKEDITOR.instances[environment_type + '-editor'].document.$.getElementsByClassName('inserted-image');
            }

            for (var i = 0; i < temp_img_list.length; i++) {
                img_list.push($(temp_img_list[i]).attr('src'));
            }
        }
        var data = {}
            , s_cb
            , f_cb
            , _id
            , agenda_id
            , blog_menu_id
            , sending_server_path_type
            , success_message = "";
        if (write_form["current_action"] === "write") {
            sending_server_path_type = "insert";
            if (write_form["current_type"] === "opinion") {
                agenda_id = write_form["current_related_id"];
            } else if (write_form["current_type"] === "blog") {
                blog_menu_id = write_form["current_related_id"];
            }
        } else if (write_form["current_action"] === "edit") {
            sending_server_path_type = "update";
            _id = $('#' + write_form["current_env_type"]).attr('data-id');
            data["_id"] = encodeURIComponent(_id);
            if (write_form["current_type"] === "opinion") {
                agenda_id = $('#' + write_form["current_env_type"]).attr('data-agenda-id');
            } else if (write_form["current_type"] === "blog") {
                var temp_pathname = window.location.pathname;
                data["blog_menu_id"] = encodeURIComponent(temp_pathname.split('/')[3]);
                data["_id"] = encodeURIComponent(write_form.current_related_id);
                blog_menu_id = $('#' + write_form["current_env_type"]).attr('data-blog-menu-id');
            }
        }
        data["tags"] = encodeURIComponent(JSON.stringify(tags));
        data["title"] = encodeURIComponent(title);
        data["content"] = encodeURIComponent(content);
        if (write_form["current_type"] === "apply_now") {
            data["public_authority"] = encodeURIComponent(public_authority);
            data["is_online_interview_set"] = encodeURIComponent(is_online_interview_set);
            if (is_online_interview_set === true) {
                data["application_authority"] = encodeURIComponent(application_authority);
                data["is_start_set"] = encodeURIComponent(is_start_set);
                data["start_at"] = encodeURIComponent(start_at);
                data["finish_at"] = encodeURIComponent(finish_at);
                data["questions"] = encodeURIComponent(JSON.stringify(online_interview_questions));
            }
            data["language"] = encodeURIComponent(language);
            data["company"] = encodeURIComponent(company);
            data["logo"] = encodeURIComponent(logo);
            data["business_type"] = encodeURIComponent(business_type);
            data["country"] = encodeURIComponent(country);
            data["city"] = encodeURIComponent(city);
            data["protocol"] = encodeURIComponent(protocol);
            data["url"] = encodeURIComponent(url);
            data["job"] = encodeURIComponent(job);
            data["employment_status"] = encodeURIComponent(employment_status);
            data["decide_salary_later"] = encodeURIComponent(decide_salary_later);
            if (decide_salary_later === false) {
                data["salary_period"] = encodeURIComponent(salary_period);
                data["salary"] = encodeURIComponent(salary);
                data["salary_unit"] = encodeURIComponent(salary_unit);
            }
        } else if (write_form["current_type"] === "hire_me") {
            data["public_authority"] = encodeURIComponent(public_authority);
            data["language"] = encodeURIComponent(language);
            data["job"] = encodeURIComponent(job);
            data["employment_status"] = encodeURIComponent(employment_status);
            data["decide_salary_later"] = encodeURIComponent(decide_salary_later);
            if (decide_salary_later === false) {
                data["salary_period"] = encodeURIComponent(salary_period);
                data["salary"] = encodeURIComponent(salary);
                data["salary_unit"] = encodeURIComponent(salary_unit);
            }
        } else if (
            write_form["current_type"] === "agenda" ||
            write_form["current_type"] === "opinion"
        ) {
            data["profile"] = encodeURIComponent(profile);
            data["language"] = encodeURIComponent(language);
            data["main_tag"] = encodeURIComponent(main_tag);
            data["img_list"] = encodeURIComponent(JSON.stringify(img_list));
            if (write_form["current_type"] === "opinion") {
                data["agenda_id"] = encodeURIComponent(agenda_id);
            } else {
                data["public_authority"] = encodeURIComponent(public_authority);
                data["opinion_authority"] = encodeURIComponent(opinion_authority);
                data["translation_authority"] = encodeURIComponent(translation_authority);
                data["comment_authority"] = encodeURIComponent(comment_authority);
                data["is_start_set"] = encodeURIComponent(is_start_set);
                data["start_at"] = encodeURIComponent(start_at);
                data["is_finish_set"] = encodeURIComponent(is_finish_set);
                data["finish_at"] = encodeURIComponent(finish_at);
            }
        } else {
            data["language"] = encodeURIComponent(language);
            data["public_authority"] = encodeURIComponent(public_authority);
            if (write_form["current_type"] === "blog") {
                if (write_form["current_action"] === "write") {
                    data["blog_menu_id"] = encodeURIComponent(blog_menu_id);
                }
                data["img_list"] = encodeURIComponent(JSON.stringify(img_list));
            }
        }
        is_w_opinion_opened = false;
        is_space_prompt_opened = false;
        is_unicorn_prompt_opened = false;
        is_superior_prompt_opened = false;
        if ($('.prompt#space-prompt').css('display') === 'table') {
            modal('.prompt#space-prompt', 'close');
        }
        if ($('.prompt#unicorn-prompt').css('display') === 'table') {
            modal('.prompt#unicorn-prompt', 'close');
        }
        if ($('.prompt#superior-prompt').css('display') === 'table') {
            modal('.prompt#superior-prompt', 'close');
        }
        var pathname = "/"  + sending_server_path_type + "/" + write_form["current_type"];
        if (write_form["current_type"] === "apply_now") {
            if (write_form["current_action"] === "write") {
                success_message = i18n[lang].successfully_added_apply_now;
            } else if (write_form["current_action"] === "edit") {
                success_message = i18n[lang].successfully_changed_apply_now;
            }
            s_cb = function (result) {
                if ( result['response'] === true ) {
                    if (write_form["current_action"] === "write") {
                        return window.location = result['pathname'];
                    } else {  /* Edit */
                        if (is_apply_now_prompt_opened === true) {
                            modal('.prompt#apply-now-prompt', 'close');
                            if (history && history.state) {
                                if (my_history && my_history.length > 1) {
                                    my_history.pop();
                                }
                                history.back();
                            } else {
                                return window.location = result['pathname'];
                            }
                            show_bert("success", 4000, success_message);
                        } else {
                            return window.location = result['pathname'];
                        }
                        is_apply_now_prompt_opened = false;
                        var data2 = {}
                            , link2 = result.pathname
                            , cb2 = function () {
                            open_article({
                                type:'apply_now'
                                , link: link2
                                , is_from_translation: false
                                , is_from_opinion: false
                            });
                        };
                        data2.type = encodeURIComponent('apply_now');
                        data2._id = encodeURIComponent(link2.split('/')[2]);
                        update_count_view(data2, cb2);
                    }
                } else {
                    if (result["msg"] === "no_blog_id") {
                        return window.location = "/set/blog-id";
                    } else {
                        show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                    }
                }
            };
        } else if (write_form["current_type"] === "hire_me") {
            if (write_form["current_action"] === "write") {
                success_message = i18n[lang].successfully_added_hire_me;
            } else if (write_form["current_action"] === "edit") {
                success_message = i18n[lang].successfully_changed_hire_me;
            }
            s_cb = function (result) {
                if ( result['response'] === true ) {
                    if (write_form["current_action"] === "write") {
                        return window.location = result['pathname'];
                    } else {  /* Edit */
                        if (is_hire_me_prompt_opened === true) {
                            modal('.prompt#hire-me-prompt', 'close');
                            if (history && history.state) {
                                if (my_history && my_history.length > 1) {
                                    my_history.pop();
                                }
                                history.back();
                            } else {
                                return window.location = result['pathname'];
                            }
                            show_bert("success", 4000, success_message);
                        } else {
                            return window.location = result['pathname'];
                        }
                        is_hire_me_prompt_opened = false;
                        var data2 = {}
                            , link2 = result.pathname
                            , cb2 = function () {
                            open_article({
                                type:'hire_me'
                                , link: link2
                                , is_from_translation: false
                                , is_from_opinion: false
                            });
                        };
                        data2.type = encodeURIComponent('hire_me');
                        data2._id = encodeURIComponent(link2.split('/')[2]);
                        update_count_view(data2, cb2);
                    }
                } else {
                    if (result["msg"] === "no_blog_id") {
                        return window.location = "/set/blog-id";
                    } else {
                        show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                    }
                }
            };
        } else if (write_form["current_type"] === "agenda") {
            if (write_form["current_action"] === "write") {
                success_message = i18n[lang].successfully_added_agenda;
            } else if (write_form["current_action"] === "edit") {
                success_message = i18n[lang].successfully_changed_agenda;
            }
            s_cb = function (result) {
                if ( result['response'] === true ) {
                    if (write_form["current_action"] === "write") {
                        return window.location = result['pathname'];
                    } else {
                        if (result.cannot_change_language === true) {
                            if (
                                lang === "en" ||
                                lang === "ko"
                            ) {
                                success_message = success_message + " " + i18n[lang].language_cannot_be_changed_because_translation_exists + " " + i18n[lang].the_previous_language_is_maintained;
                            } else {
                                success_message = success_message + i18n[lang].language_cannot_be_changed_because_translation_exists + i18n[lang].the_previous_language_is_maintained;
                            }
                        }
                        if (
                            is_agenda_prompt_opened === true &&
                            is_opinion_prompt_opened === true
                        ) {
                            modal('.prompt#agenda-prompt', 'close');
                            modal('.prompt#opinion-prompt', 'close');
                            if (history && history.state) {
                                if (my_history && my_history.length > 1) {
                                    my_history.pop();
                                    my_history.pop();
                                }
                                history.go(-2);
                            } else {
                                return window.location = result['pathname'];
                            }
                            show_bert("success", 4000, success_message);
                        } else if (
                        is_agenda_prompt_opened === true &&
                        is_opinion_prompt_opened === false
                        ) {
                            modal('.prompt#agenda-prompt', 'close');
                            if (history && history.state) {
                                if (my_history && my_history.length > 1) {
                                    my_history.pop();
                                }
                                history.back();
                            } else {
                                return window.location = result['pathname'];
                            }
                            show_bert("success", 4000, success_message);
                        } else if (
                        is_agenda_prompt_opened === false &&
                        is_opinion_prompt_opened === true
                        ) {
                            modal('.prompt#opinion-prompt', 'close');
                            if (history && history.state) {
                                if (my_history && my_history.length > 1) {
                                    my_history.pop();
                                }
                                history.back();
                            } else {
                                return window.location = result['pathname'];
                            }
                            show_bert("success", 4000, success_message);
                        } else {
                            return window.location = result['pathname'];
                        }
                        is_agenda_prompt_opened = false;
                        is_opinion_prompt_opened = false;
                        is_opinion_prompt_parent = false;
                        var data2 = {}
                            , link2 = result.pathname
                            , cb2 = function () {
                                open_article({
                                    type:'agenda'
                                    , link: link2
                                    , is_from_translation: false
                                    , is_from_opinion: false
                                });
                            };
                        data2.type = encodeURIComponent('agenda');
                        data2._id = encodeURIComponent(link2.split('/')[2]);
                        update_count_view(data2, cb2);
                    }
                } else {
                    if (result["msg"] === "no_blog_id") {
                        return window.location = "/set/blog-id";
                    } else {
                        show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                    }
                }
            };
        } else if (write_form["current_type"] === "opinion") { /* [의견]*/
            if (write_form["current_action"] === "write") {
                success_message = i18n[lang].successfully_added_opinion;
            } else if (write_form["current_action"] === "edit") {
                success_message = i18n[lang].successfully_changed_opinion;
            }
            s_cb = function (result) {
                if ( result['response'] === true ) {
                    if (result.cannot_change_language === true) {
                        if (
                            lang === "en" ||
                            lang === "ko"
                        ) {
                            success_message = success_message + " " + i18n[lang].language_cannot_be_changed_because_translation_exists + " " + i18n[lang].the_previous_language_is_maintained;
                        } else {
                            success_message = success_message + i18n[lang].language_cannot_be_changed_because_translation_exists + i18n[lang].the_previous_language_is_maintained;
                        }
                    }
                    if (
                        is_agenda_prompt_opened === true &&
                        is_opinion_prompt_opened === true
                    ) {
                        modal('.prompt#agenda-prompt', 'close');
                        modal('.prompt#opinion-prompt', 'close');
                        if (history && history.state) {
                            if (my_history && my_history.length > 1) {
                                my_history.pop();
                                my_history.pop();
                            }
                            history.go(-2);
                        } else {
                            return window.location = result['pathname'];
                        }
                        show_bert("success", 4000, success_message);
                    } else if (
                        is_agenda_prompt_opened === true &&
                        is_opinion_prompt_opened === false
                    ) {
                        modal('.prompt#agenda-prompt', 'close');
                        if (history && history.state) {
                            if (my_history && my_history.length > 1) {
                                my_history.pop();
                            }
                            history.back();
                        } else {
                            return window.location = result['pathname'];
                        }
                        show_bert("success", 4000, success_message);
                    } else if (
                        is_agenda_prompt_opened === false &&
                        is_opinion_prompt_opened === true
                    ) {
                        modal('.prompt#opinion-prompt', 'close');
                        if (history && history.state) {
                            if (my_history && my_history.length > 1) {
                                my_history.pop();
                            }
                            history.back();
                        } else {
                            return window.location = result['pathname'];
                        }
                        show_bert("success", 4000, success_message);
                    } else {
                        return window.location = result['pathname'];
                    }
                    is_agenda_prompt_opened = false;
                    is_opinion_prompt_opened = false;
                    is_opinion_prompt_parent = true;
                    var data2 = {}
                        , link2 = result.pathname
                        , cb2 = function () {
                          open_article({
                                type:'opinion'
                                , link: link2
                                , is_from_translation: false
                                , is_from_opinion: false
                            });
                        };
                    data2.type = encodeURIComponent('opinion');
                    data2._id = encodeURIComponent(link2.split('/')[4]);
                    update_count_view(data2, cb2);
                } else {
                    if (result["msg"] === "no_blog_id") {
                        return window.location = "/set/blog-id";
                    } else {
                        if (result['msg'] && result['msg'] === "time_error") {
                            show_bert("danger", 2000, i18n[lang].please_try_at_the_debate_time);
                        } else if (result['msg'] && result['msg'] === "no_access") {
                            show_bert("danger", 2000, i18n[lang].only_invited_users_can_write_it);
                        } else {
                            show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                        }
                    }

                }
            };
        } else if (write_form["current_type"] === "blog") {
            if (write_form["current_action"] === "write") {
                success_message = i18n[lang].successfully_added_article;
            } else if (write_form["current_action"] === "edit") {
                success_message = i18n[lang].successfully_changed_article;
            }
            s_cb = function (result) {
                if ( result['response'] === true ) {
                    window.location = result.pathname;
                } else {
                    if (result["msg"] === "no_blog_id") {
                        return window.location = "/set/blog-id";
                    } else {
                        show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                    }
                }
            };
        } else if (write_form["current_type"] === "gallery") {
            if (write_form["current_action"] === "write") {
                success_message = i18n[lang].successfully_added_image;
            } else if (write_form["current_action"] === "edit") {
                success_message = i18n[lang].successfully_changed_image;
            }
            s_cb = function (result) {
                if ( result['response'] === true ) {
                    window.location = result.pathname;
                } else {
                    if (result["msg"] === "no_blog_id") {
                        return window.location = "/set/blog-id";
                    } else {
                        show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                    }
                }
            };
        }
        f_cb = function () {show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:pathname,
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    var activate_when_cke_editor_displayed = function (type, cb) {
        setTimeout(function () {
            if ( $("#cke_" + type + "-editor").is(':visible') === true ) {
                cb();
                return false;
            } else {
                activate_when_cke_editor_displayed(type, cb);
            }
        }, 10);
    };
    $(document).on("click", ".prompt .article-edit", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version")
            , s_cb
            , f_cb
            , data={}
            , $written = $(e.currentTarget).parent()
            , type = $written.attr('data-type')
            , _id = $written.attr('data-id');
        if (lang === undefined) {
            lang = "en";
        }
        if (
            type !== "agenda" &&
            type !== "opinion" &&
            type !== "tr_agenda" &&
            type !== "tr_opinion"
        ) {
            return false;
        }
        if (
            type === "tr_agenda" ||
            type === "tr_opinion"
        ) {
            if (open_mars_prompt) {
                open_mars_prompt(e);
            }
            return false;
        }
        write_form["current_type"] = type;
        write_form["current_related_id"] = _id;
        write_form["current_action"] = "edit";
        write_form["current_env_type"] = "space";
        if (is_agenda_prompt_opened === true) {
            modal('.prompt#agenda-prompt', 'close');
        }
        if (is_opinion_prompt_opened === true) {
            modal('.prompt#opinion-prompt', 'close');
        }
        /*if (is_translation_prompt_opened === true) {
            modal('.prompt#translation-prompt', 'close');
        }*/
        if (is_apply_now_prompt_opened === true) {
            is_apply_now_prompt_opened = false;
            modal('.prompt#apply-now-prompt', 'close');
        }
        if (is_hire_me_prompt_opened === true) {
            is_hire_me_prompt_opened = false;
            modal('.prompt#hire-me-prompt', 'close');
        }
        if (is_unicorn_prompt_opened === true) {
            is_unicorn_prompt_opened = false;
            modal('.prompt#unicorn-prompt', 'close');
        }
        if (is_superior_prompt_opened === true) {
            is_superior_prompt_opened = false;
            modal('.prompt#superior-prompt', 'close');
        }
        $("#space").attr("data-type", type);
        write_form["init"]("space", type);
        data["type"] = encodeURIComponent(type);
        data["_id"] = encodeURIComponent(_id);
        if (type === "opinion") {
            data["agenda_id"] = encodeURIComponent($written.attr('data-agenda-id'));
        } else {
        }
        s_cb = function (result) {
            if ( result['response'] === true ) {
                modal('.prompt#space-prompt', 'open');
                is_space_prompt_opened = true;
                is_w_opinion_opened = false;
                $(".write-opinion-wrapper").empty().removeClass("opened");
                $(".request-opinion-wrapper").empty().removeClass("opened");
                $(".btn-opinion.ing-write img").attr("src", aws_s3_url + "/icons/write-opinion.png");
                $(".btn-opinion.ing-write").removeClass("selected").removeClass("ing-write");
                /*
                is_w_translation_opened = false;
                $(".write-translation-wrapper").empty().removeClass("opened");
                $(".request-translation-wrapper").empty().removeClass("opened");
                $(".btn-translation.ing-write img").attr("src", aws_s3_url + "/icons/write-translation.png");
                $(".btn-translation.ing-write").removeClass("selected").removeClass("ing-write");
                */
                $written.find(".comments-wrapper.outer-comments:first").empty().removeClass("opened");
                $written.find(".btn-open-comments:first").removeClass("selected");
                $written.find(".btn-open-comments:first img").attr("src", aws_s3_url + "/icons/comments.png" + css_version);
                if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                    star_editor_focuser.blur();
                }
                if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                    moon_editor_focuser.blur();
                }
                activate_when_cke_editor_displayed("space", function () {
                    /* $('#space select.written-language option[value=' + result['doc']['language'] + ']').prop('selected', true); */
                    $('#space select.main-tag option[value=' + result['doc']['main_tag'] + ']').prop('selected', true);
                    write_form["fill"]('space', result['doc']);
                    $('.prompt#space-prompt .prompt-left > div').scrollTop(0);
                    $('#space').attr('data-link', $written.attr('data-link'));
                    $('#space').attr('data-type', type);
                    $('#space').attr('data-blog-id', $written.attr('data-blog-id'));
                    $('#space').attr('data-id', _id);
                    $('#space').attr('data-agenda-id', $written.attr('data-agenda-id'));
                    $('#space').attr('data-blog-menu-id', $written.attr('data-blog-menu-id'));
                    $('#space').attr('data-class', $written.attr('data-class'));
                    write_form["print_write_form_data"]();
                    setTimeout(function () {
                        if (iframe_vote_resize_all !== undefined) {
                            iframe_vote_resize_all();
                        }
                    }, 500);
                });
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        f_cb = function () {show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/get/single",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".prompt#space-prompt .close", function (e) {
        e.preventDefault();
        modal('.prompt#space-prompt', 'close');
        is_space_prompt_opened = false;
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
        if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
            write_form["rebuild_write_form_data_as_ground"]();
        }
        return false;
    });
    $(document).on("click", ".single-article-wrapper .article-edit", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version")
            , s_cb1
            , s_cb2
            , f_cb
            , data={}
            , $written = $(e.currentTarget).parent()
            , type = $written.attr('data-type')
            , _id = $written.attr('data-id')
            , pathname = window.location.pathname
            , temp = pathname.split('/');
        if (lang === undefined) {
            lang = "en";
        }
        if (
            type === "tr_agenda" ||
            type === "tr_opinion"
        ) {
            if (open_mars_prompt) {
                open_mars_prompt(e);
            }
            return false;
        }
        data["_id"] = encodeURIComponent(_id);
        data["type"] = encodeURIComponent(type);
        if (type === "agenda") {
        } else if (type === "opinion") {
            data["agenda_id"] = encodeURIComponent($written.attr('data-agenda-id'));
        } else if (type === "blog") {
            data["blog_id"] = encodeURIComponent($written.attr('data-blog-id'));
            data["blog_menu_id"] = encodeURIComponent($written.attr('data-blog-menu-id'));
        } else if (type === "gallery") {
            data["blog_id"] = encodeURIComponent($written.attr('data-blog-id'));
        } else {
            return false;
        }
        s_cb1 = function (result) {
            if ( result['response'] === true ) {
                $('.single-article-wrapper .written-' + type + '').css('display', 'none');
                $('#ground').css('display', 'block');

                if (type === 'agenda' || type === 'opinion' || type === 'blog') {
                    activate_when_cke_editor_displayed("ground", function () {
                        if (type === "agenda" || type === "opinion") {
                            /* $('#ground select.written-language option[value=' + result['doc']['language'] + ']').prop('selected', true); */
                            $('#ground select.main-tag option[value=' + result['doc']['main_tag'] + ']').prop('selected', true);
                        } else if (type === "tr_agenda" || type === "tr_opinion") {
                        } else if (type === "blog" || type === "gallery") {
                            /*if (result['doc']['language'] === "") {
                                $('#ground select.written-language option[value=' + lang + ']').prop('selected', true);
                            } else {
                                $('#ground select.written-language option[value=' + result['doc']['language'] + ']').prop('selected', true);
                            }*/
                            $('#ground select.public-authority option[value=' + result['doc']['public_authority'] + ']').prop('selected', true);
                        }
                        write_form["fill"]('ground', result['doc']);
                        $('#ground').attr('data-link', $written.attr('data-link'));
                        $('#ground').attr('data-type', type);
                        $('#ground').attr('data-blog-id', $written.attr('data-blog-id'));
                        $('#ground').attr('data-id', _id);
                        $('#ground').attr('data-agenda-id', $written.attr('data-agenda-id'));
                        $('#ground').attr('data-blog-menu-id', $written.attr('data-blog-menu-id'));
                        $('#ground').attr('data-class', $written.attr('data-class'));
                        write_form["print_write_form_data"]();
                        setTimeout(function () {
                            if (iframe_vote_resize_all !== undefined) {
                                iframe_vote_resize_all();
                            }
                        }, 500);
                    });
                } else {
                    if (type === "agenda" || type === "opinion") {
                        /*$('#ground select.written-language option[value=' + result['doc']['language'] + ']').prop('selected', true);*/
                        $('#ground select.main-tag option[value=' + result['doc']['main_tag'] + ']').prop('selected', true);
                    } else if (type === "tr_agenda" || type === "tr_opinion") {
                    } else if (type === "blog" || type === "gallery") {
                        /*if (result['doc']['language'] === "") {
                            $('#ground select.written-language option[value=' + lang + ']').prop('selected', true);
                        } else {
                            $('#ground select.written-language option[value=' + result['doc']['language'] + ']').prop('selected', true);
                        }*/
                        $('#ground select.public-authority option[value=' + result['doc']['public_authority'] + ']').prop('selected', true);
                    }
                    write_form["fill"]('ground', result['doc']);
                    $('#ground').attr('data-link', $written.attr('data-link'));
                    $('#ground').attr('data-type', type);
                    $('#ground').attr('data-blog-id', $written.attr('data-blog-id'));
                    $('#ground').attr('data-id', _id);
                    $('#ground').attr('data-agenda-id', $written.attr('data-agenda-id'));
                    $('#ground').attr('data-blog-menu-id', $written.attr('data-blog-menu-id'));
                    $('#ground').attr('data-class', $written.attr('data-class'));
                    write_form["print_write_form_data"]();
                    setTimeout(function () {
                        if (iframe_vote_resize_all !== undefined) {
                            iframe_vote_resize_all();
                        }
                    }, 500);
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        s_cb2 = function (result) {
            if ( result['response'] === true ) {
                modal('.prompt#space-prompt', 'open');
                is_space_prompt_opened = true;
                is_w_opinion_opened = false;
                $(".write-opinion-wrapper").empty().removeClass("opened");
                $(".request-opinion-wrapper").empty().removeClass("opened");
                $(".btn-opinion.ing-write img").attr("src", aws_s3_url + "/icons/write-opinion.png");
                $(".btn-opinion.ing-write").removeClass("selected").removeClass("ing-write");
                /*
                is_w_translation_opened = false;
                $(".write-translation-wrapper").empty().removeClass("opened");
                $(".request-translation-wrapper").empty().removeClass("opened");
                $(".btn-translation.ing-write img").attr("src", aws_s3_url + "/icons/write-translation.png");
                $(".btn-translation.ing-write").removeClass("selected").removeClass("ing-write");
                */
                $written.find(".comments-wrapper.outer-comments:first").empty().removeClass("opened");
                $written.find(".btn-open-comments:first").removeClass("selected");
                $written.find(".btn-open-comments:first img").attr("src", aws_s3_url + "/icons/comments.png" + css_version);
                if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                    star_editor_focuser.blur();
                }
                if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                    moon_editor_focuser.blur();
                }
                activate_when_cke_editor_displayed("space", function () {
                    /*$('#space select.written-language option[value=' + result['doc']['language'] + ']').prop('selected', true);*/
                    $('#space select.main-tag option[value=' + result['doc']['main_tag'] + ']').prop('selected', true);
                    write_form["fill"]('space', result['doc']);
                    $('.prompt#space-prompt .prompt-left > div').scrollTop(0);
                    $('#space').attr('data-link', $written.attr('data-link'));
                    $('#space').attr('data-type', type);
                    $('#space').attr('data-blog-id', $written.attr('data-blog-id'));
                    $('#space').attr('data-id', _id);
                    $('#space').attr('data-agenda-id', $written.attr('data-agenda-id'));
                    $('#space').attr('data-blog-menu-id', $written.attr('data-blog-menu-id'));
                    $('#space').attr('data-class', $written.attr('data-class'));
                    write_form["print_write_form_data"]();
                    setTimeout(function () {
                        if (iframe_vote_resize_all !== undefined) {
                            iframe_vote_resize_all();
                        }
                    }, 500);
                });
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        f_cb = function () {show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        if (temp[1] === "agenda" && temp[2] !== undefined && temp[3] === undefined) {
            write_form["current_type"] = type;
            write_form["current_related_id"] = _id;
            write_form["current_action"] = "edit";
            if (type === "agenda") {
                write_form["current_env_type"] = "ground";
                $("#ground").attr("data-type", type);
                write_form["init"]("ground", type);
                methods["the_world"]["is_one"]({
                    show_animation: true,
                    data:data,
                    pathname:"/get/single",
                    s_cb:s_cb1,
                    f_cb:f_cb
                });
            } else {
                write_form["current_env_type"] = "space";
                $("#space").attr("data-type", type);
                write_form["init"]("space", type);
                methods["the_world"]["is_one"]({
                    show_animation: true,
                    data:data,
                    pathname:"/get/single",
                    s_cb:s_cb2,
                    f_cb:f_cb
                });
            }
        } else {
            write_form["current_type"] = type;
            write_form["current_related_id"] = _id;
            write_form["current_action"] = "edit";
            write_form["current_env_type"] = "ground";
            $("#ground").attr("data-type", type);
            write_form["init"]("ground", type);
            methods["the_world"]["is_one"]({
                show_animation: true,
                data:data,
                pathname:"/get/single",
                s_cb:s_cb1,
                f_cb:f_cb
            });
        }
        return false;
    });
    $(document).on("click", ".article-remove", function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent();
        var _id = $wrapper.attr('data-id')
            , type = $wrapper.attr('data-type')
            , agenda_id = $wrapper.attr('data-agenda-id')
            , opinion_id = $wrapper.attr('data-opinion-id')
            , blog_id = $wrapper.attr('data-blog-id')
            , blog_menu_id = $wrapper.attr('data-blog-menu-id')
            , element_class = $wrapper.attr('data-class');
        remove.element = $('.' + element_class);
        remove.type = type;
        remove.data = {};
        remove.data._id = encodeURIComponent(_id);
        remove.data.type = encodeURIComponent(type);
        remove.data.blog_id = encodeURIComponent(blog_id);
        if (remove.type === 'agenda') {
        } else if (remove.type === 'opinion') {
            remove.data.agenda_id = encodeURIComponent(agenda_id);
        } else if (remove.type === 'tr_agenda') {
            remove.data.agenda_id = encodeURIComponent(agenda_id);
        } else if (remove.type === 'tr_opinion') {
            remove.data.agenda_id = encodeURIComponent(agenda_id);
            remove.data.opinion_id = encodeURIComponent(opinion_id);
        } else if (remove.type === 'blog') {
            remove.data.blog_menu_id = encodeURIComponent(blog_menu_id);
        } else if (remove.type === 'gallery') {
        } else {
            return false;
        }
        if (is_agenda_prompt_opened === true) {
            modal(".prompt#agenda-prompt", "close");
        }
        if (is_opinion_prompt_opened === true) {
            modal(".prompt#opinion-prompt", "close");
        }
        if (is_translation_prompt_opened === true) {
            modal(".prompt#translation-prompt", "close");
        }
        modal('.prompt#remove-prompt', 'open');
        return false;
    });
    var write_comment_submit = function (e) {
        var lang = $("body").attr("data-lang")
            , $write_comment_form = $(e.currentTarget).parent().parent()
            , type = $write_comment_form.attr('data-type')
            , link = $write_comment_form.attr('data-link')
            , outer_id = $write_comment_form.attr('data-outer-id')
            , comment_type = $write_comment_form.attr('data-comment-type')
            , comment = $write_comment_form.find('.write-comment-input').val()
            , $comments_wrapper = $(e.currentTarget).parent().parent().parent().find('ul.comments:first')
            , first_li = $comments_wrapper.find('li:first')
            , recent_created_at = undefined
            , $article_wrapper
            , text
            , current_user_blog_id = null
            , is_loginned = $("body").attr("data-check") === "true"
            , user_profile_link = $('#desktop-user-menu ul a').attr('href')
            , scroll_position
            , article_comment_list
            , s_cb
            , f_cb
            , data;
        if (lang === undefined) {
            lang = "en";
        }
        text = i18n[lang].subscription + " ✔";
        if (first_li.length !== 0) {
            recent_created_at = parseInt(first_li.attr('data-created-at'));
        }
        if (comment_type !== undefined) {
            comment_type = parseInt(comment_type);
        }
        if (
            type !== "deep" &&
            type !== "clipping"
        ) {
            if (comment_type === 1) {
                $article_wrapper = $write_comment_form.parent().parent();
            } else {
                $article_wrapper = $write_comment_form.parent().parent().parent().parent().parent();
            }
        }
        if (is_loginned === true && user_profile_link && user_profile_link !== "/set/blog-id") {
            current_user_blog_id = user_profile_link.split('/')[2];
        }
        if (is_loginned === false) {
            return show_bert('danger', 3000, i18n[lang].please_login);
        } else {
            if (current_user_blog_id === null) {
                return window.location = window.location.protocol + "//" + window.location.hostname + (window.location.port === "" ? "" : ":" + window.location.port) + '/set/blog-id';
            }
        }
        s_cb = function (result) {
            if (result.response === true) {
                $write_comment_form.find('.write-comment-input').val("");
                s_cb = function (result) {
                    if (result.response === true) {
                        $write_comment_form.find('.write-comment-input').val("");
                        scroll_position = $(".body-inner-main").scrollTop();
                        article_comment_list = result.docs;
                        $comments_wrapper.prepend(get["article_comment_list"]({
                            link:link
                            , comment_type:comment_type
                            , article_comment_list:article_comment_list
                            , is_loginned:is_loginned
                            , type:type }));
                        $(".body-inner-main").scrollTop(scroll_position);
                        if (
                            type !== "deep" &&
                            type !== "clipping"
                        ) {
                            realtime_comments["init"](realtime_comments["type"]);
                        } else {
                            $(".prompt#news-comments-prompt .news-comment-none").css("display", "none");
                        }
                    } else {
                        if (result["msg"] === "no_blog_id") {
                            return window.location = "/set/blog-id";
                        }
                    }
                };
                f_cb = function () {};
                data = {};
                data.link = encodeURIComponent(link);
                data.type = encodeURIComponent(type);
                data.outer_id = encodeURIComponent(outer_id);
                data.comment_type = encodeURIComponent(comment_type);
                data.is_lt = "false";
                if (recent_created_at !== undefined) {
                    data.created_at = encodeURIComponent(recent_created_at);
                }
                methods["the_world"]["is_one"]({
                    show_animation: true,
                    data:data,
                    pathname:"/get/article-comments",
                    s_cb:s_cb,
                    f_cb:f_cb
                });
                if (
                    type !== "deep" &&
                    type !== "clipping"
                ) {
                    $article_wrapper.find('.btn-subscribe-desktop:first span').text(text);
                    $article_wrapper.find('.btn-subscribe-mobile:first span').text(text);
                    $article_wrapper.find('.btn-subscribe-desktop:first img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                    $article_wrapper.find('.btn-subscribe-mobile:first img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                    $article_wrapper.find('.btn-subscribe-desktop:first').removeClass('btn-subscribe-desktop').addClass('btn-unsubscribe-desktop');
                    $article_wrapper.find('.btn-subscribe-mobile:first').removeClass('btn-subscribe-mobile').addClass('btn-unsubscribe-mobile');
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else if (result['msg'] === 'no_access') {
                    show_bert("danger", 2000, i18n[lang].only_invited_users_can_write_it);
                }
            }
        };
        f_cb = function () {
            show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{
                type: encodeURIComponent(type)
                , link: encodeURIComponent(link)
                , outer_id: encodeURIComponent(outer_id)
                , comment_type: encodeURIComponent(comment_type)
                , comment: encodeURIComponent(comment)
            },
            pathname:"/insert/article-comment",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    $(document).on('click', '.write-comment-input', function (e) {
        var is_loginned = $("body").attr("data-check") === "true";
        if (is_loginned === false) {
            e.preventDefault();
            modal(".prompt#request-login-prompt", "open");
            return false;
        }
    });
    $(document).on('submit', '.write-comment-form', function (e) {
        e.preventDefault();
        var is_loginned = $("body").attr("data-check") === "true";
        if (is_loginned === false) {
            modal(".prompt#request-login-prompt", "open");
            return false;
        } else {
            write_comment_submit(e);
            return false;
        }
    });
    $(document).on('click', '.write-comment-form .write-comment-submit', function (e) {
        e.preventDefault();
        var is_loginned = $("body").attr("data-check") === "true";
        if (is_loginned === false) {
            modal(".prompt#request-login-prompt", "open");
            return false;
        } else {
            write_comment_submit(e);
            return false;
        }
    });
    $(document).on('click', '.comment-edit', function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent();
        var text = $wrapper.find('.comment-content:first').css('display', 'none').text();
        $wrapper.find('.edit-comment-form:first').css('display', 'block');
        $wrapper.find('.edit-comment-input:first').val(text);
        if (is_mobile() === false) {
            $wrapper.find('.edit-comment-input:first').focus();
        }
        return false;
    });
    $(document).on('click', '.edit-comment-cancel', function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent().parent().parent();
        $wrapper.find('.comment-content:first').css('display', 'block');
        $wrapper.find('.edit-comment-form:first').css('display', 'none');
        $wrapper.find('.edit-comment-input:first').val("");
        return false;
    });
    var submit_comment_edit = function (e) {
        var lang = $("body").attr("data-lang")
            , $wrapper = $(e.currentTarget).parent().parent().parent()
            , comment = $wrapper.find('.edit-comment-input:first').val()
            , _id = $wrapper.attr('data-id')
            , type = $wrapper.attr('data-type')
            , link = $wrapper.attr('data-link')
            , comment_type = parseInt($wrapper.attr('data-comment-type'))
            , blog_id = $wrapper.attr('data-blog-id')
            , outer_id = $wrapper.attr('data-outer-id')
            , i18n_text
            , s_cb
            , f_cb;
        if (lang === undefined) {
            lang = "en";
        }
        if (
            lang === "en" ||
            lang === "ko"
        ) {
            i18n_text = i18n[lang].edit + " " + i18n[lang].just_now;
        } else {
            i18n_text = i18n[lang].edit + i18n[lang].just_now;
        }
        s_cb = function (result) {
            if (result.response === true) {
                comment = comment.trim().replace(/\s\s+/gi, ' ');
                $wrapper.find('.comment-content:first').css('display', 'block').text(comment);
                $wrapper.find('.edit-comment-form:first').css('display', 'none');
                $wrapper.find('.edit-comment-input:first').val("");
                $wrapper.find('.user-profile-small:first .created-at-small').addClass('updated-at-small').attr('data-datetime', result.updated_at).text(i18n_text);
                if (type !== "deep") {
                    realtime_comments["init"](realtime_comments["type"]);
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
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
                , type: encodeURIComponent(type)
                , link: encodeURIComponent(link)
                , outer_id: encodeURIComponent(outer_id)
                , comment_type: encodeURIComponent(comment_type)
                , comment: encodeURIComponent(comment)
            },
            pathname:"/update/article-comment",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    $(document).on('submit', '.edit-comment-form', function (e) {
        e.preventDefault();
        submit_comment_edit(e);
        return false;
    });
    $(document).on('click', '.edit-comment-form .edit-comment-submit', function (e) {
        e.preventDefault();
        submit_comment_edit(e);
        return false;
    });
    $(document).on('click', '.comment-remove', function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent();
        remove.type = "comment";
        remove.element = $wrapper;
        remove.data = {};
        var _id = $wrapper.attr('data-id')
            , type = $wrapper.attr('data-type')
            , link = $wrapper.attr('data-link')
            , comment_type = parseInt($wrapper.attr('data-comment-type'))
            , blog_id = $wrapper.attr('data-blog-id')
            , outer_id = $wrapper.attr('data-outer-id');
        remove.data._id = encodeURIComponent(_id);
        remove.data.type = encodeURIComponent(type);
        remove.data.link = encodeURIComponent(link);
        remove.data.comment_type = encodeURIComponent(comment_type);
        remove.data.blog_id = encodeURIComponent(blog_id);
        if (comment_type === 2) {
            remove.data.outer_id = encodeURIComponent(outer_id);
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
        if (is_news_comments_prompt_opened === true) {
            modal(".prompt#news-comments-prompt", "close");
        }
        modal('.prompt#remove-prompt', 'open');
        return false;
    });
    $(document).on('click', '.sort-created-at', function (e) {
        e.preventDefault();
        var _id = opinion_menu_obj["_id"]
            , css_version = $("body").attr("data-css-version")
            , lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
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
        opinion_menu_obj["$written"].find(".opinion-of-agenda:first").css("display", "block");
        opinion_menu_obj["$written"].find(".btn-opinion:first").addClass("selected").addClass("ing-view");
        opinion_menu_obj["$written"].find(".btn-opinion:first img").attr("src", aws_s3_url + "/icons/write-opinion-selected.png");
        opinion_menu_obj["$view_wrapper"]["more"].attr("data-sort-type", "serial");
        modal(".prompt#opinion-menu-prompt", "close");
        if (opinion_menu_obj["is_modal"] === true) {
            get_fill["opinions_of_agenda"]({
                is_new: true
                , is_modal: true
                , is_serial: true
                , agenda_id: _id
            });
        } else {
            get_fill["opinions_of_agenda"]({
                is_new: true
                , is_modal: false
                , is_serial: true
                , agenda_id: _id
            });
        }
        return false;
    });
    $(document).on('click', '.sort-popular', function (e) {
        e.preventDefault();
        var _id = opinion_menu_obj["_id"]
            , css_version = $("body").attr("data-css-version")
            , lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
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
        opinion_menu_obj["$written"].find(".opinion-of-agenda:first").css("display", "block");
        opinion_menu_obj["$btn_wrapper"].find(".btn-opinion:first").addClass("selected").addClass("ing-view");
        opinion_menu_obj["$btn_wrapper"].find(".btn-opinion:first img").attr("src", aws_s3_url + "/icons/write-opinion-selected.png");
        opinion_menu_obj["$view_wrapper"]["more"].attr("data-sort-type", "popular");
        modal(".prompt#opinion-menu-prompt", "close");
        if (opinion_menu_obj["is_modal"] === true) {
            get_fill["opinions_of_agenda"]({
                is_new: true
                , is_modal: true
                , is_serial: false
                , agenda_id: _id
            });
        } else {
            get_fill["opinions_of_agenda"]({
                is_new: true
                , is_modal: false
                , is_serial: false
                , agenda_id: _id
            });
        }
        return false;
    });
    $(document).on("change", ".time-setting-start-right-now", function (e) {
        if ($(e.currentTarget).is(":checked") === true) {
            $(e.currentTarget).parent().parent().parent().find(".time-setting-start-datetime-wrapper").css("display", "none");
        } else {
            var element = "";
            $(e.currentTarget).parent().parent().parent().find(".time-setting-start-datetime-wrapper").append(element).css("display", "block");
        }
    });
    $(document).on("change", ".time-setting-deadline-unlimited", function (e) {
        if ($(e.currentTarget).is(":checked") === true) {
            $(e.currentTarget).parent().parent().parent().find(".time-setting-deadline-datetime-wrapper").css("display", "none");
        } else {
            var element = "";
            $(e.currentTarget).parent().parent().parent().find(".time-setting-deadline-datetime-wrapper").append(element).css("display", "block");
        }
    });
    $(document).on("change", ".debate-public-authority", function (e) {
        var authority = parseInt($(e.currentTarget).find("option:selected").val());
        var $wrapper = $(e.currentTarget).parent().parent().parent();
        if (authority === 1) {
            $wrapper.find(".writing-authority-content select option").removeAttr("disabled");
            $wrapper.find(".writing-authority-content select option[value=1]").prop("selected", true);
        } else {
            $wrapper.find(".writing-authority-content select option[value=1]").attr("disabled", "disabled");
            $wrapper.find(".writing-authority-content select option[value=2]").prop("selected", true);
        }
    });
    var tiktok_clock = function () {
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        $(".clock").text(i18n[lang].current_time + " " + to_i18n_fixed_datetime());
        setTimeout(function () {
            tiktok_clock();
        }, 1000);
    };
    tiktok_clock();
    $(document).on('change', '.time-setting-start-datetime-wrapper select', function (e) {
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var $wrapper = $(e.currentTarget).parent()
            , datetime = parseInt($wrapper.attr("data-datetime"));
        var big_type;
        if ($wrapper.hasClass('debate-setting-datetime') === true) {
            big_type = "debate";
        } else {
            if ($wrapper.hasClass('apply-now-setting-datetime') === true) {
                big_type = "apply-now";
            } else {
                big_type = "debate";
            }
        }
        var year = parseInt($wrapper.find('select.' + big_type + '-start-year option:selected').val());
        var month = parseInt($wrapper.find('select.' + big_type + '-start-month option:selected').val());
        var day_of_month = parseInt($wrapper.find('select.' + big_type + '-start-day-of-month option:selected').val());
        var hours = parseInt($wrapper.find('select.' + big_type + '-start-hours option:selected').val());
        var minutes = parseInt($wrapper.find('select.' + big_type + '-start-minutes option:selected').val());
        var options = ""
            , temp
            , day_of_week
            , days_of_month;
        if (
            $(e.currentTarget).hasClass(big_type + '-start-year') === true ||
            $(e.currentTarget).hasClass(big_type + '-start-month') === true
        ) {
            days_of_month = get_days_of_month(year, month);
            if ( days_of_month[ days_of_month.length - 1 ] < day_of_month ) {
                day_of_month = days_of_month[ days_of_month.length - 1 ];
            }
            options = "";
            for (var c = 0; c < days_of_month.length; c++) {
                if (days_of_month[c] === day_of_month) {
                    temp = "<option value='" + days_of_month[c] + "' selected='selected'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
                } else {
                    temp = "<option value='" + days_of_month[c] + "'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
                }
                options = options + temp;
            }
            $wrapper.find('.' + big_type + '-start-day-of-month').empty().append(options);
        }
        day_of_month = parseInt($wrapper.find('select.' + big_type + '-start-day-of-month option:selected').val());
        datetime = new Date(datetime);
        datetime.setMilliseconds(0);
        datetime.setSeconds(0);
        datetime.setMinutes(minutes);
        datetime.setHours(hours);
        datetime.setDate(day_of_month);
        datetime.setMonth(month);
        datetime.setFullYear(year);
        day_of_week = get_i18n_time_text({ type: "weekday", number: datetime.getDay()});
        $wrapper.find('.' + big_type + '-start-day-of-week').text(day_of_week);
        $wrapper.find('.' + big_type + '-start-fixed-datetime').text(to_i18n_fixed_datetime(datetime));
        $wrapper.attr('data-datetime', datetime.valueOf());
    });
    $(document).on('change', '.time-setting-deadline-datetime-wrapper select', function (e) {
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var $wrapper = $(e.currentTarget).parent()
            , datetime = parseInt($wrapper.attr("data-datetime"));
        var big_type;
        if ($wrapper.hasClass('debate-setting-datetime') === true) {
            big_type = "debate";
        } else {
            if ($wrapper.hasClass('apply-now-setting-datetime') === true) {
                big_type = "apply-now";
            } else {
                big_type = "debate";
            }
        }
        var year = parseInt($wrapper.find('select.' + big_type + '-deadline-year option:selected').val());
        var month = parseInt($wrapper.find('select.' + big_type + '-deadline-month option:selected').val());
        var day_of_month = parseInt($wrapper.find('select.' + big_type + '-deadline-day-of-month option:selected').val());
        var hours = parseInt($wrapper.find('select.' + big_type + '-deadline-hours option:selected').val());
        var minutes = parseInt($wrapper.find('select.' + big_type + '-deadline-minutes option:selected').val());
        var options = ""
            , temp
            , day_of_week
            , days_of_month;
        if (
            $(e.currentTarget).hasClass(big_type + '-deadline-year') === true ||
            $(e.currentTarget).hasClass(big_type + '-deadline-month') === true
        ) {
            days_of_month = get_days_of_month(year, month);
            if ( days_of_month[ days_of_month.length - 1 ] < day_of_month ) {
                day_of_month = days_of_month[ days_of_month.length - 1 ];
            }
            options = "";
            for (var c = 0; c < days_of_month.length; c++) {
                if (days_of_month[c] === day_of_month) {
                    temp = "<option value='" + days_of_month[c] + "' selected='selected'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
                } else {
                    temp = "<option value='" + days_of_month[c] + "'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
                }
                options = options + temp;
            }
            $wrapper.find('.' + big_type + '-deadline-day-of-month').empty().append(options);
        }
        day_of_month = parseInt($wrapper.find('select.' + big_type + '-deadline-day-of-month option:selected').val());
        datetime = new Date(datetime);
        datetime.setMilliseconds(0);
        datetime.setSeconds(0);
        datetime.setMinutes(minutes);
        datetime.setHours(hours);
        datetime.setDate(day_of_month);
        datetime.setMonth(month);
        datetime.setFullYear(year);
        day_of_week = get_i18n_time_text({ type: "weekday", number: datetime.getDay()});
        $wrapper.find('.' + big_type + '-deadline-day-of-week').text(day_of_week);
        $wrapper.find('.' + big_type + '-deadline-fixed-datetime').text(to_i18n_fixed_datetime(datetime));
        $wrapper.attr('data-datetime', datetime.valueOf());
    });
    $(document).on("change", ".online-interview", function (e) {
        if ($(e.currentTarget).is(":checked") === true) {
            $(e.currentTarget).parent().parent().find(".online-interview-content-wrapper").css("display", "block");
        } else {
            $(e.currentTarget).parent().parent().find(".online-interview-content-wrapper").css("display", "none");
        }
    });
    $(document).on("change", ".apply-now-public-authority", function (e) {
        var authority = parseInt($(e.currentTarget).find("option:selected").val());
        var $wrapper = $(e.currentTarget).parent().parent().parent();
        if (authority === 1) { /* Public */
            $wrapper.find("select.application-authority option").removeAttr("disabled");
            $wrapper.find("select.application-authority option[value=1]").prop("selected", true);
        } else { /* Invited Users */
            $wrapper.find("select.application-authority option[value=1]").attr("disabled", "disabled");
            $wrapper.find("select.application-authority option[value=2]").prop("selected", true);
        }
    });
    var update_showing_write_salary = function ($showing, $input, $select) {
        var number = $input.val()
            , unit = $select.find('option:selected').attr('data-name') + " (" + $select.find('option:selected').val() + ")";
        if (number === "") {
            number = 0;
        }
        $showing.text(put_comma_between_three_digits(number) + " " + unit);
    };
    $(document).on("change", "input[type='number'].write-salary-input", function (e) {
        update_showing_write_salary($(e.currentTarget).parent().parent().parent().find('.showing-write-salary'), $(e.currentTarget), $(e.currentTarget).parent().parent().find('.write-salary-select:first'));
    });
    $(document).on("click", "input[type='number'].write-salary-input", function (e) {
        update_showing_write_salary($(e.currentTarget).parent().parent().parent().find('.showing-write-salary'), $(e.currentTarget), $(e.currentTarget).parent().parent().find('.write-salary-select:first'));
    });
    $(document).on("keyup", "input[type='number'].write-salary-input", function (e) {
        update_showing_write_salary($(e.currentTarget).parent().parent().parent().find('.showing-write-salary'), $(e.currentTarget), $(e.currentTarget).parent().parent().find('.write-salary-select:first'));
    });
    $(document).on('change', '.write-salary-select', function (e) {
        update_showing_write_salary($(e.currentTarget).parent().parent().parent().find('.showing-write-salary'), $(e.currentTarget).parent().parent().find('.write-salary-input:first'), $(e.currentTarget));
    });
    $(document).on("keyup", "input[type='text'].tags", function (e) {
        if (is_ie() === false) {
            var text = $(e.currentTarget).val().replace(/\s+/gi, '').toLowerCase();
            $(e.currentTarget).val(text);
        }
    });
    $(document).on("keyup", "input[type='text'].translation-input", function (e) {
        var text;
        if (is_mars_prompt_opened === true) {
            if (translation_edit.divided_content.input[translation_edit.current_required_index].main_type === "tags" && is_ie() === false) {
                text = $(e.currentTarget).val().replace(/\s+/gi, '').toLowerCase();
                $(e.currentTarget).val(text);
            }
        } else {
            if (translation_writing.divided_content.input[translation_writing.current_required_index].main_type === "tags" && is_ie() === false) {
                text = $(e.currentTarget).val().replace(/\s+/gi, '').toLowerCase();
                $(e.currentTarget).val(text);
            }
        }
    });
    $(document).on("change", "input[type='checkbox'].decide-after-consulting", function (e) {
        if ($(e.currentTarget).is(":checked") === true) {
            $(e.currentTarget).parent().parent().find('.write-salary-parent-wrapper:first').css('display', 'none');
        } else {
            $(e.currentTarget).parent().parent().find('.write-salary-parent-wrapper:first').css('display', 'block');
        }
    });
    $(document).on("click", ".short-answer-item-add", function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent().parent().find('.online-interview-questions-content:first')
            , number = $wrapper.find('.online-interview-question-item').length + 1;
        $wrapper.append(get["single"]["form"]["short_answer"](number, null));
    });
    $(document).on("click", ".multiple-choice-item-add", function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent().parent().find('.online-interview-questions-content:first')
            , number = $wrapper.find('.online-interview-question-item').length + 1;
        $wrapper.append(get["single"]["form"]["multiple_choice"](number, null));
    });
    $(document).on("click", ".online-interview-question-item-remove", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , $wrapper = $(e.currentTarget).parent().parent().parent();
        $(e.currentTarget).parent().parent().remove();
        $.each($wrapper.find('.question-label'), function (i, e) {
            $(this).empty().append(i18n[lang].question + "&nbsp;" + (i+1));
        });
    });
    $(document).on('focus', '.write-form .online-interview-question-item textarea', function (e) {
        $(e.currentTarget).parent().css('border-color', '#5a00e0');
    });
    $(document).on('blur', '.write-form .online-interview-question-item textarea', function (e) {
        $(e.currentTarget).parent().css('border-color', '#ebebeb');
    });
    $(document).on('focus', '.write-form .online-interview-question-item .choice-item input.choice-input', function (e) {
        $(e.currentTarget).parent().parent().find('.choice-index').css('border-color', '#5a00e0');
    });
    $(document).on('blur', '.write-form .online-interview-question-item .choice-item input.choice-input', function (e) {
        $(e.currentTarget).parent().parent().find('.choice-index').css('border-color', '#ebebeb');
    });
    $(document).on("click", ".write-form .online-interview-question-item .choice-add", function(e) {
        e.preventDefault();
        var item
            , itemHTML
            , css_version = $("body").attr("data-css-version")
            , $wrapper = $(e.currentTarget).parent().parent().find('.choices:first');
        item = "<div class='choice-item'><div class='choice-index'></div><div class='choice-input-wrapper'><input class='choice-input' type='text' placeholder=''></div><div class='choice-remove-wrapper'><div class='choice-remove'><img src='" + aws_s3_url + "/icons/remove.png" + css_version + "'></div></div></div>";
        itemHTML = $.parseHTML(item);
        $wrapper.append(itemHTML);
        $.each($wrapper.find(".choice-index"), function (i, e) {
            e.innerHTML = i + 1;
        });
        return false;
    });
    $(document).on("click", ".write-form .online-interview-question-item .choice-remove", function (e) {
        e.preventDefault();
        var item = $(e.currentTarget).parent().parent()
            , $wrapper = $(e.currentTarget).parent().parent().parent();
        $(item).remove();
        $.each($wrapper.find(".choice-index"), function (i, e) {
            e.innerHTML = i + 1;
        });
        return false;
    });
    $(document).on("click", ".add-apply-now-logo", function (e) {
        e.preventDefault();
        image_prompt["open"]("logo");
        image_prompt["$logo_wrapper"] = $(e.currentTarget).parent().parent().find('.write-logo-wrapper:first');
        return false;
    });
    $(document).on("click", ".remove-apply-now-logo", function (e) {
        e.preventDefault();
        $(e.currentTarget).parent().empty();
        return false;
    });
    $(document).on("click", ".announcement-edit", function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent().parent().parent()
            , title = $wrapper.find(".written-announcement-title").text()
            , content = $wrapper.find(".written-announcement-content").text();
        $wrapper.find(".edit-announcement-input").val(title);
        $wrapper.find(".edit-announcement-textarea").val(content);
        $wrapper.find(".edit-announcement-wrapper:first").addClass("opened");
        $wrapper.find(".written-announcement-wrapper:first").css("display", "none");
        return false;
    });
    $(document).on("click", ".announcement-remove", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var $wrapper = $(e.currentTarget).parent().parent().parent()
            , _id = $wrapper.attr("data-id")
            , article_id = $wrapper.attr("data-article-id");
        remove.element = $wrapper;
        remove["$written"] = $(e.currentTarget).parent().parent().parent().parent().parent().parent();
        remove.type = "announcement";
        remove.data = {};
        remove.data._id = _id;
        remove.data.article_id = article_id;
        if (is_apply_now_prompt_opened === true) {
            modal('.prompt#apply-now-prompt', 'close');
        }
        modal('.prompt#remove-prompt', 'open');
        return false;
    });
    $(document).on("click", ".prompt .employment-edit", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version")
            , s_cb
            , f_cb
            , data={}
            , $written = $(e.currentTarget).parent()
            , type = $written.attr('data-type')
            , _id = $written.attr('data-id');
        if (lang === undefined) {
            lang = "en";
        }
        if (
            type !== "apply_now" &&
            type !== "hire_me"
        ) {
            return false;
        }
        write_form["current_type"] = type;
        write_form["current_related_id"] = _id;
        write_form["current_action"] = "edit";
        if (type === "apply_now") {
            write_form["current_env_type"] = "unicorn";
        } else {
            write_form["current_env_type"] = "superior";
        }
        if (is_apply_now_prompt_opened === true) {
            modal('.prompt#apply-now-prompt', 'close');
        }
        if (is_hire_me_prompt_opened === true) {
            modal('.prompt#hire-me-prompt', 'close');
        }
        write_form["init"](write_form["current_env_type"], type);
        data["type"] = encodeURIComponent(type);
        data["_id"] = encodeURIComponent(_id);
        data["is_edit"] = encodeURIComponent("true");
        s_cb = function (result) {
            if ( result['response'] === true ) {
                modal(".prompt#" + write_form["current_env_type"] + "-prompt", "open");
                if (type === "apply_now") {
                    is_unicorn_prompt_opened = true;
                    $written.find(".answer-wrapper:first").css("display", "none");
                    $written.find(".btn-online-interview:first").removeClass("selected");
                    $written.find(".btn-online-interview:first img").attr("src", aws_s3_url + "/icons/online-interview.png" + css_version);
                    $written.find(".announcement-wrapper:first").css("display", "none");
                    $written.find(".write-announcement-wrapper:first").empty().removeClass("opened");
                    $written.find(".btn-announcement:first").removeClass("selected");
                    $written.find(".btn-announcement:first img").attr("src", aws_s3_url + "/icons/announcement2.png" + css_version);
                    if (superior_editor_focuser !== undefined && superior_editor_focuser !== null) {
                        superior_editor_focuser.blur();
                    }
                } else {
                    is_superior_prompt_opened = true;
                    if (unicorn_editor_focuser !== undefined && unicorn_editor_focuser !== null) {
                        unicorn_editor_focuser.blur();
                    }
                }
                if (ground_editor_focuser !== undefined && ground_editor_focuser !== null) {
                    ground_editor_focuser.blur();
                }
                $written.find(".comments-wrapper.outer-comments:first").empty().removeClass("opened");
                $written.find(".btn-open-comments:first").removeClass("selected");
                $written.find(".btn-open-comments:first img").attr("src", aws_s3_url + "/icons/comments.png" + css_version);
                activate_when_cke_editor_displayed(write_form["current_env_type"], function () {
                    write_form["fill"](write_form["current_env_type"], result["doc"]);
                    $(".prompt#" + write_form["current_env_type"] + "-prompt .prompt-left > div").scrollTop(0);
                    $("#" + write_form["current_env_type"]).attr('data-link', $written.attr('data-link'));
                    $("#" + write_form["current_env_type"]).attr('data-type', type);
                    $("#" + write_form["current_env_type"]).attr('data-blog-id', $written.attr('data-blog-id'));
                    $("#" + write_form["current_env_type"]).attr('data-id', _id);
                    $("#" + write_form["current_env_type"]).attr('data-class', $written.attr('data-class'));
                    write_form["print_write_form_data"]();
                    setTimeout(function () {
                        if (iframe_vote_resize_all !== undefined) {
                            iframe_vote_resize_all();
                        }
                    }, 500);
                });
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        f_cb = function () {show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/get/single",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".single-article-wrapper .employment-edit", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version")
            , s_cb
            , f_cb
            , data={}
            , $written = $(e.currentTarget).parent()
            , type = $written.attr('data-type')
            , _id = $written.attr('data-id');
        if (lang === undefined) {
            lang = "en";
        }
        data["_id"] = encodeURIComponent(_id);
        data["type"] = encodeURIComponent(type);
        data["is_edit"] = encodeURIComponent("true");
        if (
            type !== "apply_now" &&
            type !== "hire_me"
        ) {
            return false;
        }
        s_cb = function (result) {
            if ( result['response'] === true ) {
                $('.single-article-wrapper .written-' + type + '').css('display', 'none');
                $('#ground').css('display', 'block');
                if (type === "apply_now") {
                    $written.find(".answer-wrapper:first").css("display", "none");
                    $written.find(".btn-online-interview:first").removeClass("selected");
                    $written.find(".btn-online-interview:first img").attr("src", aws_s3_url + "/icons/online-interview.png" + css_version);
                    $written.find(".announcement-wrapper:first").css("display", "none");
                    $written.find(".write-announcement-wrapper:first").empty().removeClass("opened");
                    $written.find(".btn-announcement:first").removeClass("selected");
                    $written.find(".btn-announcement:first img").attr("src", aws_s3_url + "/icons/announcement2.png" + css_version);
                    if (superior_editor_focuser !== undefined && superior_editor_focuser !== null) {
                        superior_editor_focuser.blur();
                    }
                } else {
                    if (unicorn_editor_focuser !== undefined && unicorn_editor_focuser !== null) {
                        unicorn_editor_focuser.blur();
                    }
                }
                if (ground_editor_focuser !== undefined && ground_editor_focuser !== null) {
                    ground_editor_focuser.blur();
                }
                $written.find(".comments-wrapper.outer-comments:first").empty().removeClass("opened");
                $written.find(".btn-open-comments:first").removeClass("selected");
                $written.find(".btn-open-comments:first img").attr("src", aws_s3_url + "/icons/comments.png" + css_version);
                activate_when_cke_editor_displayed("ground", function () {
                    write_form["fill"]('ground', result['doc']);
                    $('#ground').attr('data-link', $written.attr('data-link'));
                    $('#ground').attr('data-type', type);
                    $('#ground').attr('data-blog-id', $written.attr('data-blog-id'));
                    $('#ground').attr('data-id', _id);
                    $('#ground').attr('data-class', $written.attr('data-class'));
                    write_form["print_write_form_data"]();
                    setTimeout(function () {
                        if (iframe_vote_resize_all !== undefined) {
                            iframe_vote_resize_all();
                        }
                    }, 500);
                });
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        f_cb = function () {show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        write_form["current_type"] = type;
        write_form["current_related_id"] = _id;
        write_form["current_action"] = "edit";
        write_form["current_env_type"] = "ground";
        $("#ground").attr("data-type", type);
        write_form["init"]("ground", type);
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/get/single",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".employment-remove", function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent();
        var _id = $wrapper.attr('data-id')
            , type = $wrapper.attr('data-type')
            , blog_id = $wrapper.attr('data-blog-id')
            , element_class = $wrapper.attr('data-class');
        remove.element = $('.' + element_class);
        remove.type = type;
        remove.data = {};
        remove.data._id = encodeURIComponent(_id);
        remove.data.type = encodeURIComponent(type);
        remove.data.blog_id = encodeURIComponent(blog_id);
        if (
            remove.type !== 'apply_now' &&
            remove.type !== 'hire_me'
        ) {
            return false;
        }
        if (is_apply_now_prompt_opened === true) {
            modal(".prompt#apply-now-prompt", "close");
        }
        if (is_hire_me_prompt_opened === true) {
            modal(".prompt#hire-me-prompt", "close");
        }
        modal('.prompt#remove-prompt', 'open');
        return false;
    });
    $(document).on("click", ".prompt#unicorn-prompt .close", function (e) {
        e.preventDefault();
        modal('.prompt#unicorn-prompt', 'close');
        is_unicorn_prompt_opened = false;
        if (is_apply_now_prompt_opened === true) {
            modal(".prompt#apply-now-prompt", "open");
        }
        if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
            write_form["rebuild_write_form_data_as_ground"]();
        }
        return false;
    });
    $(document).on("click", ".prompt#superior-prompt .close", function (e) {
        e.preventDefault();
        modal('.prompt#superior-prompt', 'close');
        is_superior_prompt_opened = false;
        if (is_hire_me_prompt_opened === true) {
            modal(".prompt#hire-me-prompt", "open");
        }
        if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
            write_form["rebuild_write_form_data_as_ground"]();
        }
        return false;
    });
});