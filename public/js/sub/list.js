$(document).ready(function() {
    $(window).resize(function () {
        flex["article_item"]();
    });
    if (window.location.pathname !== "/write/agenda") {
        flex["article_item"]();
    }
    $(document).on("click", ".written-top a, .user-profile a, .user-profile-small a, .article-item-top a", function (e) {
        e.preventDefault();
        window.location = $(e.currentTarget).attr("href");
        return false;
    });
    $(document).on('click', '.open-agenda', function (e) {
        e.preventDefault();
        var css_version = $("body").attr("data-css-version")
            , data
            , link
            , cb;
        is_w_opinion_opened = false;
        $(".write-opinion-wrapper").empty().removeClass("opened");
        $(".request-opinion-wrapper").empty().removeClass("opened");
        $(".btn-opinion.ing-write img").attr("src", aws_s3_url + "/icons/write-opinion.png" + css_version);
        $(".btn-opinion.ing-write").removeClass("selected").removeClass("ing-write");
        /*is_w_translation_opened = false;
        $(".write-translation-wrapper").empty().removeClass("opened");
        $(".request-translation-wrapper").empty().removeClass("opened");
        $(".btn-translation.ing-write img").attr("src", aws_s3_url + "/icons/write-translation.png" + css_version);
        $(".btn-translation.ing-write").removeClass("selected").removeClass("ing-write");*/
        if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
            star_editor_focuser.blur();
        }
        if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
            moon_editor_focuser.blur();
        }
        data = {};
        link = $(e.currentTarget).attr('data-link');
        cb = function () {
            open_article({
                type:'agenda'
                , link: link
                , is_from_translation: false
                , is_from_opinion: true
            });
        };
        data.type = encodeURIComponent('agenda');
        data._id = encodeURIComponent(link.split('/')[2]);
        update_count_view(data, cb);
        return false;
    });
    $(document).on('click', '.open-original', function (e) {
        e.preventDefault();
        var css_version = $("body").attr("data-css-version")
            , type = $(e.currentTarget).attr('data-type')
            , _id = $(e.currentTarget).attr('data-id')
            , agenda_id = $(e.currentTarget).attr('data-agenda-id')
            , data = {}
            , link
            , cb;
        is_w_opinion_opened = false;
        $(".write-opinion-wrapper").empty().removeClass("opened");
        $(".request-opinion-wrapper").empty().removeClass("opened");
        $(".btn-opinion.ing-write img").attr("src", aws_s3_url + "/icons/write-opinion.png" + css_version);
        $(".btn-opinion.ing-write").removeClass("selected").removeClass("ing-write");
        /*is_w_translation_opened = false;
        $(".write-translation-wrapper").empty().removeClass("opened");
        $(".request-translation-wrapper").empty().removeClass("opened");
        $(".btn-translation.ing-write img").attr("src", aws_s3_url + "/icons/write-translation.png" + css_version);
        $(".btn-translation.ing-write").removeClass("selected").removeClass("ing-write");*/
        if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
            star_editor_focuser.blur();
        }
        if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
            moon_editor_focuser.blur();
        }
        if (type === 'agenda') {
            link = "/agenda/" + _id;
            data._id = encodeURIComponent(_id);
        } else if (type === 'opinion') {
            link = "/agenda/" + agenda_id + "/opinion/" + _id;
            data._id = encodeURIComponent(_id);
            data.agenda_id = encodeURIComponent(agenda_id);
        } else {
            return false;
        }
        data.type = encodeURIComponent(type);
        cb = function () {
            open_article({
                type: type
                , link: link
                , is_from_translation: true
                , is_from_opinion: false
            })
        };
        update_count_view(data, cb);
        return false;
    });
    $(document).on("click", '.article-item-inner', function (e) {
        e.preventDefault();
        var data = {}
            , type = $(e.currentTarget).attr('data-type')
            , link = $(e.currentTarget).attr('data-link')
            , cb = function () {
            open_article({
                type:type
                , link: link
                , is_from_translation: false
                , is_from_opinion: false
            });
        };
        if (type === 'apply_now') {
            data.type = encodeURIComponent(type);
            data._id = encodeURIComponent(link.split('/')[2]);
            update_count_view(data, cb);
        } else if (type === 'hire_me') {
            data.type = encodeURIComponent(type);
            data._id = encodeURIComponent(link.split('/')[2]);
            update_count_view(data, cb);
        } else if (type === 'agenda') {
            data.type = encodeURIComponent(type);
            data._id = encodeURIComponent(link.split('/')[2]);
            update_count_view(data, cb);
        } else if (type === 'opinion') {
            data.type = encodeURIComponent(type);
            data._id = encodeURIComponent(link.split('/')[4]);
            update_count_view(data, cb);
        } else if (type === 'tr_agenda') {
            data.type = encodeURIComponent(type);
            data._id = encodeURIComponent(link.split('/')[4]);
            update_count_view(data, cb);
        } else if (type === 'tr_opinion') {
            data.type = encodeURIComponent(type);
            data._id = encodeURIComponent(link.split('/')[6]);
            update_count_view(data, cb);
        } else {
            cb();
        }
        return false;
    });
    $(document).on("click", ".list-more", function (e) {
        e.preventDefault();
        var id = $(e.currentTarget).attr('id')
            , pathname=window.location.pathname
            , obj = {}
            , _limit
            , _list_id
            , _print_type
            , updated_at
            , s_cb
            , f_cb;
        if (id === "user-more") {
            obj["list_type"] = "user";
            if (pathname === "/ranking") {
                return false;
            } else {
                return false;
            }
        } else if (id === "blog-more") {
            obj["list_type"] = "blog_gallery";
            if (pathname === "/blog") {
                obj["type"] = "all";
                obj["updated_at"] = parseInt($('#blog-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
            } else {
                return false;
            }
            _limit = limit["articles"];
        } else if (id === "image-more") {
            obj["list_type"] = "image";
            obj["type"] = "text_search";
            obj["skip"] = $('#image-list .search-image-item').length;
            try {
                var query = window.location.search.split("&q=");
                obj["query"] = decodeURIComponent(query[query.length - 1]);
            } catch (e) {
                return false;
            }
            _print_type = "flexible";
            _limit = limit["text_search"];
        } else if (id === "apply-now-more" || id === "hire-me-more") {
            if (id === "apply-now-more") {
                obj["list_type"] = "apply_now";
                obj["updated_at"] = parseInt($('#apply-now-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
            } else if (id === "hire-me-more") {
                obj["list_type"] = "hire_me";
                obj["updated_at"] = parseInt($('#hire-me-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
            } else {
                return false;
            }
            obj["type"] = "all";
            _print_type = "normal";
            _limit = limit["articles"];
        } else if (
            id === "announcement-more" ||
            id === "announcement-more-modal"
        ) {
            obj["list_type"] = "announcement";
            obj["article_id"] = pathname.split('/')[2];
            obj["type"] = "announcement";
            if (id === "announcement-more") {
                obj["created_at"] = parseInt($('#announcement-list .announcement:last-child').attr('data-created-at'));
                get_fill["announcements_of_apply_now"]({
                    is_new: false
                    , is_modal: false
                    , article_id: obj["article_id"]
                    , created_at: obj["created_at"]
                });
            } else {
                obj["created_at"] = parseInt($('#announcement-list-modal .announcement:last-child').attr('data-created-at'));
                get_fill["announcements_of_apply_now"]({
                    is_new: false
                    , is_modal: true
                    , article_id: obj["article_id"]
                    , created_at: obj["created_at"]
                });
            }
            return false;
            _print_type = "perfect";
            _limit = limit["apply_now_announcements"];
        } else if (
            id === "answer-more" ||
            id === "answer-more-modal"
        ) {
            obj["list_type"] = "answer";
            obj["article_id"] = pathname.split('/')[2];
            obj["type"] = "answer";
            if (id === "answer-more") {
                obj["created_at"] = parseInt($('#answer-list .answer:last-child').attr('data-created-at'));
                get_fill["answers_of_online_interview"]({
                    is_new: false
                    , is_modal: false
                    , article_id: obj["article_id"]
                    , created_at: obj["created_at"]
                });
            } else {
                obj["created_at"] = parseInt($('#answer-list-modal .answer:last-child').attr('data-created-at'));
                get_fill["answers_of_online_interview"]({
                    is_new: false
                    , is_modal: true
                    , article_id: obj["article_id"]
                    , created_at: obj["created_at"]
                });
            }
            return false;
            _print_type = "perfect";
            _limit = limit["online_interview_answers"];
        } else if (
            id === "opinion-more-of-agenda" ||
            id === "opinion-more-of-agenda-modal"
        ) {
            obj["list_type"] = "opinion";
            obj["agenda_id"] = pathname.split('/')[2];
            if ( $(e.currentTarget).attr('data-sort-type') === 'popular' ) {
                obj["type"] = "popular_opinions_of_agenda";
                if (id === "opinion-more-of-agenda") {
                    obj["skip"] = $('#opinion-list-of-agenda .written-opinion').length;
                } else {
                    obj["skip"] = $('#opinion-list-of-agenda-modal .written-opinion').length;
                }
            } else {
                obj["type"] = "serial_opinions_of_agenda";
                if (id === "opinion-more-of-agenda") {
                    obj["created_at"] = parseInt($('#opinion-list-of-agenda .written-opinion:last-child').attr('data-created-at'));
                } else {
                    obj["created_at"] = parseInt($('#opinion-list-of-agenda-modal .written-opinion:last-child').attr('data-created-at'));
                }
            }
            _print_type = "perfect";
            _limit = limit["opinions_of_agendas"];
        } else if (id === "debate-more" ||  id === "agenda-more" || id === "opinion-more") {
            if (id === "debate-more") {
                obj["list_type"] = "debate";
                obj["updated_at"] = parseInt($('#debate-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
            } else if (id === "agenda-more") {
                obj["list_type"] = "agenda";
                obj["agenda_menu"] = $("body").attr("data-t");
                obj["updated_at"] = parseInt($('#agenda-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
            } else {
                obj["list_type"] = "opinion";
                obj["updated_at"] = parseInt($('#opinion-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
            }
            if (article_mt === undefined) {
                obj["type"] = "all";
            } else {
                obj["type"] = "main_tag";
                obj["main_tag"] = article_mt;
            }
            _print_type = "normal";
            _limit = limit["articles"];
        } else if (id === "blog-article-more") {
            obj["type"] = "blog_articles";
            obj["blog_id"] = pathname.split('/')[2];
            if (pathname.split('/')[3] === undefined) {
                obj["list_type"] = "agenda";
                obj["is_participation"] = false;
                obj["is_subscription"] = false;
                obj["agenda_menu"] = "in_progress";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'scheduled-agenda') {
                obj["list_type"] = "agenda";
                obj["is_participation"] = false;
                obj["is_subscription"] = false;
                obj["agenda_menu"] = "scheduled";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'finished-agenda') {
                obj["list_type"] = "agenda";
                obj["is_participation"] = false;
                obj["is_subscription"] = false;
                obj["agenda_menu"] = "finished";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'unlimited-agenda') {
                obj["list_type"] = "agenda";
                obj["is_participation"] = false;
                obj["is_subscription"] = false;
                obj["agenda_menu"] = "unlimited";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'opinion') {
                obj["list_type"] = "opinion";
                obj["is_participation"] = false;
                obj["is_subscription"] = false;
                obj["agenda_menu"] = "";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'translation') {
                obj["list_type"] = "translation";
                obj["is_participation"] = false;
                obj["is_subscription"] = false;
                obj["agenda_menu"] = "";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'employment') {
                obj["list_type"] = "apply_now";
                obj["is_participation"] = false;
                obj["is_subscription"] = false;
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'hire-me') {
                obj["list_type"] = "hire_me";
                obj["is_participation"] = false;
                obj["is_subscription"] = false;
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'gallery') {
                obj["list_type"] = "gallery";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === "participation") {
                obj["list_type"] = "agenda";
                obj["is_participation"] = true;
                obj["is_subscription"] = false;
                obj["agenda_menu"] = "in_progress";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'scheduled-agenda-participation') {
                obj["list_type"] = "agenda";
                obj["is_participation"] = true;
                obj["is_subscription"] = false;
                obj["agenda_menu"] = "scheduled";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'finished-agenda-participation') {
                obj["list_type"] = "agenda";
                obj["is_participation"] = true;
                obj["is_subscription"] = false;
                obj["agenda_menu"] = "finished";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'unlimited-agenda-participation') {
                obj["list_type"] = "agenda";
                obj["is_participation"] = true;
                obj["is_subscription"] = false;
                obj["agenda_menu"] = "unlimited";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'hire-me-participation') {
                obj["list_type"] = "hire_me";
                obj["is_participation"] = true;
                obj["is_subscription"] = false;
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'apply-now-participation') {
                obj["list_type"] = "apply_now";
                obj["is_participation"] = true;
                obj["is_subscription"] = false;
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === "subscription") {
                obj["list_type"] = "agenda";
                obj["is_participation"] = false;
                obj["is_subscription"] = true;
                obj["agenda_menu"] = "in_progress";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'scheduled-agenda-subscription') {
                obj["list_type"] = "agenda";
                obj["is_participation"] = false;
                obj["is_subscription"] = true;
                obj["agenda_menu"] = "scheduled";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'finished-agenda-subscription') {
                obj["list_type"] = "agenda";
                obj["is_participation"] = false;
                obj["is_subscription"] = true;
                obj["agenda_menu"] = "finished";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'unlimited-agenda-subscription') {
                obj["list_type"] = "agenda";
                obj["is_participation"] = false;
                obj["is_subscription"] = true;
                obj["agenda_menu"] = "unlimited";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'opinion-subscription') {
                obj["list_type"] = "opinion";
                obj["is_participation"] = false;
                obj["is_subscription"] = true;
                obj["agenda_menu"] = "";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'translation-subscription') {
                obj["list_type"] = "translation";
                obj["is_participation"] = false;
                obj["is_subscription"] = true;
                obj["agenda_menu"] = "";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'hire-me-subscription') {
                obj["list_type"] = "hire_me";
                obj["is_participation"] = false;
                obj["is_subscription"] = true;
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'apply-now-subscription') {
                obj["list_type"] = "apply_now";
                obj["is_participation"] = false;
                obj["is_subscription"] = true;
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'blog-subscription') {
                obj["list_type"] = "blog_gallery";
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            } else if (pathname.split('/')[3] === 'guestbook') {
                obj["list_type"] = "guestbook";
                obj["created_at"] = parseInt($('#blog-article-list .guestbook:last-child').attr('data-created-at'));
                _print_type = "perfect";
                _limit = limit["guestbook"];
            } else {
                obj["list_type"] = "blog";
                obj["blog_menu_id"] = pathname.split('/')[3];
                obj["updated_at"] = parseInt($('#blog-article-list .article-item:last-child .article-item-inner').attr('data-updated-at'));
                _print_type = "normal";
                _limit = limit["articles"];
            }
        } else {
            return false;
        }
        obj["f_cb"] = function () {
            $('#' + id).css('display', 'none');
        };
        _list_id = id.replace('more', 'list');
        obj["s_cb"] = function (docs) {
            if (docs === null) {
                if (_list_id === "image-list") {
                    docs = {
                        total: 0
                        , list: []
                    };
                } else {
                    docs = [];
                }
            }
            var final_list = get["list"](docs, obj["list_type"], _print_type);
            var scroll_position = $(".body-inner-main").scrollTop();
            if (_list_id !== "image-list") {
                $('#' + _list_id).append(final_list);
            }
            var blog_image_list = ""
                , search_image_list = "";
            if (obj["list_type"] === "gallery") {
                for (var i = 0; i < docs.length; i++) {
                    blog_image_list = blog_image_list + get["single"]["flexible"]["image"](docs[i], 'blog');
                }
                if ($('#blog-image-list').length > 0) {
                    $('#blog-image-list').append(blog_image_list);
                    if ($('.btn-gallery-align-flex').hasClass('selected') === true) {
                        blog_image["resize_blog_images"]();
                    }
                }
            } else if (obj["list_type"] === "image") {
                var total = docs.image_total;
                docs = docs.image;
                for (var i = 0; i < docs.length; i++) {
                    search_image_list = search_image_list + get["single"]["flexible"]["image"](docs[i], 'search');
                }
                if ($('#image-list').length > 0) {
                    $('#image-list').append(search_image_list);
                    if (search_image_item && search_image_item.init) {
                        search_image_item.init();
                    }
                }
                if ($('#image-list .search-image-item').length >= total) {
                    $(".search-image-item-img").css('display', 'block');
                    $('#' + id).css('display', 'none');
                }
            }
            $(".body-inner-main").scrollTop(scroll_position);
            if (docs.length < _limit) {
                obj["f_cb"]();
            }
            var order_of_opinion_list;
            if (id === 'opinion-more-of-agenda-modal') {
                if (obj["type"] === "popular_opinions_of_agenda") {
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
            }
            if (id === 'opinion-more-of-agenda') {
                if (obj["type"] === "popular_opinions_of_agenda") {
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
            }
            if (flex["article_item"]) {
                flex["article_item"]();
            }
        };
        get["list_from_god"](obj);
        return false;
    });
    $(document).on("focus", ".write-announcement-input, .edit-announcement-input, .write-announcement-textarea, .edit-announcement-textarea", function (e) {
        $(e.currentTarget).parent().css('border-color', '#5a00e0');
    });
    $(document).on("blur", ".write-announcement-input, .edit-announcement-input, .write-announcement-textarea, .edit-announcement-textarea", function (e) {
        $(e.currentTarget).parent().css('border-color', '#ebebeb');
    });
    $(document).on("click", ".btn-write-announcement", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , is_loginned = $("body").attr("data-check") === "true"
            , css_version = $("body").attr("data-css-version")
            , form
            , span
            , span2
            , div
            , div2
            , input
            , textarea
            , label
            , btn_wrapper
            , btn;
        if (lang === undefined) {
            lang = "en";
        }
        if (is_loginned === false) {
            modal(".prompt#request-login-prompt", "open");
            return false;
        }
        announcement_menu_obj["$written"].find(".answer-wrapper:first").css("display", "none");
        announcement_menu_obj["$written"].find(".btn-online-interview:first").removeClass("selected");
        announcement_menu_obj["$written"].find(".btn-online-interview:first img").attr("src", aws_s3_url + "/icons/online-interview.png" + css_version);
        announcement_menu_obj["$written"].find(".announcement-wrapper:first").css("display", "none");
        announcement_menu_obj["$written"].find(".write-announcement-wrapper:first").empty().removeClass("opened");
        announcement_menu_obj["$written"].find(".btn-announcement:first").removeClass("selected");
        announcement_menu_obj["$written"].find(".btn-announcement:first img").attr("src", aws_s3_url + "/icons/announcement2.png" + css_version);
        announcement_menu_obj["$written"].find(".comments-wrapper.outer-comments:first").empty().removeClass("opened");
        announcement_menu_obj["$written"].find(".btn-open-comments:first").removeClass("selected");
        announcement_menu_obj["$written"].find(".btn-open-comments:first img").attr("src", aws_s3_url + "/icons/comments.png" + css_version);
        if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
            star_editor_focuser.blur();
        }
        if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
            moon_editor_focuser.blur();
        }
        announcement_menu_obj["$written"].find(".btn-announcement:first").addClass("selected");
        announcement_menu_obj["$written"].find(".btn-announcement:first img").attr("src", aws_s3_url + "/icons/announcement2-selected.png");
        modal(".prompt#announcement-menu-prompt", "close");
        input = "<input class='write-announcement-input' type='text'>";
        div = "<div class='write-announcement-input-wrapper'>" + input + "</div>";
        textarea = "<textarea class='write-announcement-textarea'></textarea>";
        div2 = "<div class='write-announcement-textarea-wrapper'>" + textarea + "</div>";
        span = "<span class='write-label'>" + i18n[lang].title + "</span>";
        span2 = "<span class='write-label'>" + i18n[lang].content + "</span>";
        label = "<div>" + span + div + span2 + div2 + "</div>";
        btn = "<input class='btn-career write-announcement-submit' type='button' value='" + i18n[lang].check + "'>";
        btn_wrapper = "<div class='btn-career-wrapper'>" + btn + "</div>";
        form = "<form class='write-announcement-form'>" + label + btn_wrapper + "</form>";
        announcement_menu_obj["$write_wrapper"].append(form).addClass("opened");
    });
    $(document).on("click", ".write-announcement-submit", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , title = $(e.currentTarget).parent().parent().find(".write-announcement-input:first").val()
            , content = $(e.currentTarget).parent().parent().find(".write-announcement-textarea:first").val()
            , $write_announcement_wrapper = $(e.currentTarget).parent().parent().parent()
            , $written = $(e.currentTarget).parent().parent().parent().parent()
            , _id
            , is_modal
            , article_id = $write_announcement_wrapper.parent().attr("data-id")
            , s_cb
            , f_cb
            , count;
        if (lang === undefined) {
            lang = "en";
        }
        s_cb = function (result) {
            if ( result['response'] === true ) {
                if ($written.find(".btn-announcement").length > 0) {
                    count = parseInt($written.find(".btn-announcement:first").attr("data-count"));
                    count = count + 1;
                    $written.find(".btn-announcement:first").attr("data-count", count);
                    $written.find(".btn-announcement:first .real-count").text(count);
                }
                if ($written.find(".btn-announcement-mobile").length > 0) {
                    count = parseInt($written.find(".btn-announcement-mobile:first").attr("data-count"));
                    count = count + 1;
                    $written.find(".btn-announcement-mobile:first").attr("data-count", count);
                    $written.find(".btn-announcement-mobile:first .real-count").text(count);
                }
                is_modal = $written.find("#announcement-list-modal").length > 0;
                _id = $written.attr("data-id");
                return callback_btn_view_announcement({
                    "$written": $written
                    , is_modal: is_modal
                    , _id: _id
                });
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        f_cb = function () {show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{
                article_id: encodeURIComponent(article_id)
                , title:encodeURIComponent(title)
                , content:encodeURIComponent(content)
            },
            pathname:"/insert/employment-announcement",
            s_cb:s_cb,
            f_cb:f_cb
        });
    });
    $(document).on("click", ".edit-announcement-ok", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , $announcement = $(e.currentTarget).parent().parent().parent().parent()
            , title = $announcement.find(".edit-announcement-input:first").val()
            , content = $announcement.find(".edit-announcement-textarea:first").val()
            , _id = $announcement.attr("data-id")
            , article_id = $announcement.attr("data-article-id");
        if (lang === undefined) {
            lang = "en";
        }
        var s_cb = function (result) {
            if ( result['response'] === true ) {
                $announcement.find(".written-announcement-wrapper").css("display", "block");
                $announcement.find(".edit-announcement-wrapper").removeClass("opened");
                $announcement.find(".written-announcement-title:first").empty().append(get_encoded_html_preventing_xss(title));
                $announcement.find(".written-announcement-content:first").empty().append(get_encoded_html_preventing_xss(content));
                $announcement.find(".updated-at:first").attr("data-datetime", new Date().valueOf());
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        var f_cb = function () {show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{
                _id: encodeURIComponent(_id)
                , article_id: encodeURIComponent(article_id)
                , title:encodeURIComponent(title)
                , content:encodeURIComponent(content)
            },
            pathname:"/update/employment-announcement",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".edit-announcement-cancel", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var $announcement = $(e.currentTarget).parent().parent().parent().parent();
        $announcement.find(".written-announcement-wrapper").css("display", "block");
        $announcement.find(".edit-announcement-wrapper").removeClass("opened");
        return false;
    });
    $(document).on("click", ".btn-open-comments, .btn-open-comments-mobile, .btn-open-comments-small", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , user_name = get_encoded_html_preventing_xss($("#mobile-right-menu .user-profile-right .user-name").text()) || ""
            , user_img = $("#mobile-right-menu .user-profile-left img").attr("src") || ""
            , css_version = $("body").attr("data-css-version")
            , is_loginned = $("body").attr("data-check") === "true"
            , $wrapper
            , element_id
            , link
            , type
            , outer_id
            , comment_type
            , write_comment_form_data
            , $comments_wrapper;
        if (lang === undefined) {
            lang = "en";
        }
        if ($(e.currentTarget).hasClass("btn-open-comments-mobile") === true) {
            $wrapper = $(e.currentTarget).parent().parent().parent().parent();
        } else {
            $wrapper = $(e.currentTarget).parent().parent();
        }
        link = $wrapper.attr("data-link");
        type = $wrapper.attr('data-type');
        outer_id = $wrapper.attr('data-id');
        if (
            type !== "deep" &&
            type !== "apply_now" &&
            type !== "hire_me" &&
            type !== "agenda" &&
            type !== "opinion" &&
            type !== "tr_agenda" &&
            type !== "tr_opinion" &&
            type !== "blog" &&
            type !== "gallery" &&
            type !== "guestbook"
        ) {
            return false;
        }
        if (is_loginned === false) {
            user_name = "Gleant";
            user_img = aws_s3_url + "/icons/logo-square.png";
        }
        $('.btn-ellipsis-mobile ul').css('display', 'none');
        if (
            $(e.currentTarget).hasClass('btn-open-comments') === true ||
            $(e.currentTarget).hasClass('btn-open-comments-mobile') === true
        ) {
            element_id = $wrapper.attr("id");
            $comments_wrapper = $wrapper.find(".comments-wrapper.outer-comments:first");
            comment_type = 1;
            write_comment_form_data = " data-type='" + type + "'" +
                " data-link='" + link + "'" +
                " data-comment-type='1'";
            if (type === "apply_now") {
                $wrapper.find(".answer-wrapper:first").css("display", "none");
                $wrapper.find("#answer-list-modal:first").empty();
                $wrapper.find("#answer-list:first").empty();
                $wrapper.find(".btn-online-interview:first").removeClass("selected");
                $wrapper.find(".btn-online-interview:first img").attr("src", aws_s3_url + "/icons/online-interview.png" + css_version);
                $wrapper.find(".announcement-wrapper:first").css("display", "none");
                $wrapper.find("#announcement-list-modal:first").empty();
                $wrapper.find("#announcement-list:first").empty();
                $wrapper.find(".write-announcement-wrapper:first").empty().removeClass("opened");
                $wrapper.find(".btn-announcement:first").removeClass("selected");
                $wrapper.find(".btn-announcement:first img").attr("src", aws_s3_url + "/icons/announcement2.png" + css_version);
            } else if (type === "agenda") {
                is_w_opinion_opened = false;
                $(".btn-opinion.ing-write img").attr("src", aws_s3_url + "/icons/write-opinion.png" + css_version);
                $(".btn-opinion.ing-write").removeClass("selected").removeClass("ing-write");
                $(".write-opinion-wrapper").empty().removeClass("opened");
                $(".request-opinion-wrapper").empty().removeClass("opened");
                $wrapper.find(".opinion-of-agenda:first").css("display", "none");
                $wrapper.find(".opinion-list-of-agenda:first").empty();
                $wrapper.find(".opinion-list-of-agenda-modal:first").empty();
                $wrapper.find(".btn-opinion:first").removeClass("selected").removeClass("ing-view").removeClass("ing-write").removeClass("ing-request");
                $wrapper.find(".btn-opinion:first img").attr("src", aws_s3_url + "/icons/write-opinion.png" + css_version);
                /*
                is_w_translation_opened = false;
                $(".btn-translation.ing-write img").attr("src", aws_s3_url + "/icons/write-translation.png" + css_version);
                $(".btn-translation.ing-write").removeClass("selected").removeClass("ing-write");
                $(".write-translation-wrapper").empty().removeClass("opened");
                $(".request-translation-wrapper").empty().removeClass("opened");
                $wrapper.find(".translation-list-wrapper:first").css("display", "none");
                $wrapper.find(".translation-list:first").empty();
                $wrapper.find(".btn-translation:first").removeClass("selected").removeClass("ing-view").removeClass("ing-write").removeClass("ing-request");
                $wrapper.find(".btn-translation:first img").attr("src", aws_s3_url + "/icons/write-translation.png" + css_version);
                */
            } else if (type === "opinion") {
                /*
                is_w_translation_opened = false;
                $(".btn-translation.ing-write img").attr("src", aws_s3_url + "/icons/write-translation.png" + css_version);
                $(".btn-translation.ing-write").removeClass("selected").removeClass("ing-write");
                $(".write-translation-wrapper").empty().removeClass("opened");
                $(".request-translation-wrapper").empty().removeClass("opened");
                $wrapper.find(".translation-list-wrapper:first").css("display", "none");
                $wrapper.find(".translation-list:first").empty();
                $wrapper.find(".btn-translation:first").removeClass("selected").removeClass("ing-view").removeClass("ing-write").removeClass("ing-request");
                $wrapper.find(".btn-translation:first img").attr("src", aws_s3_url + "/icons/write-translation.png" + css_version);
                */
            }
            if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                star_editor_focuser.blur();
            }
            if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                moon_editor_focuser.blur();
            }
            if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
                write_form["rebuild_write_form_data_as_ground"]();
            }
        } else {
            $comments_wrapper = $wrapper.find(".comments-wrapper.inner-comments:first");
            comment_type = 2;
            write_comment_form_data = " data-type='" + type + "'" +
                " data-link='" + link + "'" +
                " data-outer-id='" + outer_id + "'" +
                " data-comment-type='2'";
        }
        var form1, div1, div2, div3, img1, ul1, span1;
        if (
            $(e.currentTarget).hasClass('btn-open-comments-mobile') === true ||
            $comments_wrapper.hasClass("opened") === false
        ) {
            if ($(e.currentTarget).hasClass('btn-open-comments-mobile') === true) {
                $comments_wrapper.empty();
                $wrapper.find(".btn-open-comments:first").addClass("selected");
                $wrapper.find(".btn-open-comments:first img").attr("src", aws_s3_url + "/icons/comments-green.png" + css_version);
            } else {
                $(e.currentTarget).addClass("selected");
                $(e.currentTarget).find("img").attr("src", aws_s3_url + "/icons/comments-green.png" + css_version);
            }
            $comments_wrapper.addClass("opened");
            img1 = "<img src='" + user_img + "' alt='" + user_name + "' title='" + user_name + "'>";
            span1 = "<span class='write-comment-name'>" + user_name + "</span>";
            div1 = "<div class='write-comment-top'>" + img1 + span1 + "</div>";
            if (is_loginned === true) {
                div2 = "<div class='write-comment-middle'><textarea class='write-comment-input' placeholder=''></textarea></div>";
            } else {
                div2 = "<div class='write-comment-middle'><textarea class='write-comment-input' placeholder='" + i18n[lang].please_login + "'></textarea></div>";
            }
            div3 = "<div class='write-comment-bottom'><input class='btn-career write-comment-submit' type='submit' value='" + i18n[lang].check + "'></div>";
            form1 = "<form class='write-comment-form'" + write_comment_form_data + ">" + div1 + div2 + div3 + "</form>";
            $comments_wrapper.append(form1);
            var s_cb = function (result) {
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
                    if (comment_type === 1){
                        if (result.docs === null || result.docs === undefined || result.docs.length < limit.comments) {
                            /*$comments_wrapper.append("<div class='btn-more'><a class='scrollto' href='#" + element_id + "'>" + i18n[lang].go_up + "<img class='btn-more-up-12' src='" + aws_s3_url + "/icons/go-up.png" + css_version + "'></a></div>");*/
                        } else {
                            $comments_wrapper.append("<div class='btn-more comments-more' data-type='" + type + "'><img class='btn-more-down-12' src='" + aws_s3_url + "/icons/more-down.png" + css_version + "'></div>");
                            /*$comments_wrapper.append("<div class='btn-more'><a class='scrollto' href='#" + element_id + "'>" + i18n[lang].go_up + "<img class='btn-more-up-12' src='" + aws_s3_url + "/icons/go-up.png" + css_version + "'></a></div>");*/
                        }
                    }
                    $(".body-inner-main").scrollTop(scroll_position);
                } else {
                    if (result["msg"] === "no_blog_id") {
                        return window.location = "/set/blog-id";
                    } else {
                        scroll_position = $(".body-inner-main").scrollTop();
                        ul1 = "<ul class='comments'></ul>";
                        $comments_wrapper.append(ul1);
                        if (comment_type === 1){
                            /*$comments_wrapper.append("<div class='btn-more'><a class='scrollto' href='#" + element_id + "'>" + i18n[lang].go_up + "<img class='btn-more-up-12' src='" + aws_s3_url + "/icons/go-up.png" + css_version + "'></a></div>");*/
                        }
                        $(".body-inner-main").scrollTop(scroll_position);
                    }
                }
            };
            var f_cb = function () {
                var scroll_position = $(".body-inner-main").scrollTop();
                ul1 = "<ul class='comments'></ul>";
                $comments_wrapper.append(ul1);
                if (comment_type === 1){
                    /*$comments_wrapper.append("<div class='btn-more'><a class='scrollto' href='#" + element_id + "'>" + i18n[lang].go_up + "<img class='btn-more-up-12' src='" + aws_s3_url + "/icons/go-up.png" + css_version + "'></a></div>");*/
                }
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
        } else {
            $comments_wrapper.removeClass("opened");
            $comments_wrapper.empty();
            $(e.currentTarget).removeClass("selected");
            $(e.currentTarget).find("img").attr("src", aws_s3_url + "/icons/comments.png" + css_version);
            return false;
        }
        return false;
    });
    $(document).on("click", ".comments-more", function (e) {
        e.preventDefault();
        var is_loginned = $("body").attr("data-check") === "true"
            , $article = $(e.currentTarget).parent().parent()
            , $ul_comments = $article.find('.comments-wrapper.outer-comments:first > ul.comments:first')
            , $last_li = $article.find('.comments-wrapper.outer-comments:first > ul.comments:first > li.comment:last-child')
            , last_created_at = undefined
            , type = $article.attr('data-type')
            , link = $article.attr('data-link')
            , _id = $article.attr('data-id')
            , blog_id = $article.attr('data-blog-id')
            , blog_menu_id = $article.attr('data-blog-menu-id')
            , agenda_id = $article.attr('data-agenda-id')
            , scroll_position
            , article_comment_list
            , s_cb
            , f_cb;
        if ($last_li.length === 0) {
            $(e.currentTarget).css('display', 'none');
            return false;
        } else {
            last_created_at = $last_li.attr("data-created-at");
        }
        s_cb = function (result) {
            if (result.response === true) {
                scroll_position = $(".body-inner-main").scrollTop();
                article_comment_list = result.docs;
                $ul_comments.append(get["article_comment_list"]({
                    link:link
                    , comment_type:1
                    , article_comment_list:article_comment_list
                    , is_loginned:is_loginned
                    , type:type }));
                if (result.docs === null || result.docs === undefined || result.docs.length < limit["comments"]) {
                    $(e.currentTarget).css('display', 'none');
                }
                $(".body-inner-main").scrollTop(scroll_position);
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    $(e.currentTarget).css('display', 'none');
                }
            }
        };
        f_cb = function () {
            $(e.currentTarget).css('display', 'none');
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{
                link: encodeURIComponent(link)
                , type: encodeURIComponent(type)
                , outer_id: encodeURIComponent("")
                , comment_type: encodeURIComponent("1")
                , is_lt: "true"
                , created_at: encodeURIComponent(last_created_at)
            },
            pathname:"/get/article-comments",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".prompt#news-comments-prompt .news-comment-more", function (e) {
        e.preventDefault();
        var is_loginned = $("body").attr("data-check") === "true"
            , $ul_comments = $(e.currentTarget).parent().find('ul.comments:first')
            , $last_li = $(e.currentTarget).parent().find('ul.comments:first > li.comment:last-child')
            , last_created_at = undefined
            , $top = $(e.currentTarget).parent().find('.news-title')
            , type = $top.attr('data-type')
            , link = $top.attr('href')
            , article_comment_list
            , s_cb
            , f_cb;
        if ($last_li.length === 0) {
            $(e.currentTarget).css('display', 'none');
            return false;
        } else {
            last_created_at = $last_li.attr("data-created-at");
        }
        s_cb = function (result) {
            if (result.response === true) {
                article_comment_list = result.docs;
                $ul_comments.append(get["article_comment_list"]({
                    link:link
                    , comment_type:1
                    , article_comment_list:article_comment_list
                    , is_loginned:is_loginned
                    , type:type }));
                if (result.docs === null || result.docs === undefined || result.docs.length < limit["comments"]) {
                    $(e.currentTarget).css('display', 'none');
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    $(e.currentTarget).css('display', 'none');
                }
            }
        };
        f_cb = function () {
            $(e.currentTarget).css('display', 'none');
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data: {
                link: encodeURIComponent(link)
                , type: encodeURIComponent(type)
                , outer_id: encodeURIComponent("")
                , comment_type: encodeURIComponent("1")
                , is_lt: "true"
                , created_at: encodeURIComponent(last_created_at)
            },
            pathname:"/get/article-comments",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".btn-subscribe-desktop, .btn-subscribe-mobile", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , $current = $(e.currentTarget)
            , _id = $current.attr('data-id')
            , type = $current.attr('data-type')
            , blog_id = $current.attr('data-blog-id')
            , blog_menu_id = $current.attr('data-blog-menu-id')
            , data = {}
            , text
            , $wrapper
            , s_cb
            , f_cb;
        if (lang === undefined) {
            lang = "en";
        }
        if ($current.hasClass('btn-subscribe-desktop') === true) {
            $wrapper = $current.parent();
        } else {
            $wrapper = $current.parent().parent().parent();
        }
        data._id = encodeURIComponent(_id);
        data.type = encodeURIComponent(type);
        data.is_push = encodeURIComponent("true");
        data.action = encodeURIComponent("subscribers");
        text = i18n[lang].subscription + " ✔";
        if (type === 'blog') {
            data.blog_id = encodeURIComponent(blog_id);
            data.blog_menu_id = encodeURIComponent(blog_menu_id);
        } else if (type === 'gallery') {
            data.blog_id = encodeURIComponent(blog_id);
        } else {}
        s_cb = function (result) {
            if (result.response === true) {
                $wrapper.find('.btn-subscribe-desktop span').text(text);
                $wrapper.find('.btn-subscribe-mobile span').text(text);
                $wrapper.find('.btn-subscribe-desktop img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                $wrapper.find('.btn-subscribe-mobile img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                $wrapper.find('.btn-subscribe-desktop').removeClass('btn-subscribe-desktop').addClass('btn-unsubscribe-desktop');
                $wrapper.find('.btn-subscribe-mobile').removeClass('btn-subscribe-mobile').addClass('btn-unsubscribe-mobile');
                $('.btn-ellipsis-mobile ul').css('display', 'none');
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        f_cb = function () {};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:data,
            pathname:"/update/article-array",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".btn-unsubscribe-desktop, .btn-unsubscribe-mobile", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , $current = $(e.currentTarget)
            , _id = $current.attr('data-id')
            , type = $current.attr('data-type')
            , blog_id = $current.attr('data-blog-id')
            , blog_menu_id = $current.attr('data-blog-menu-id')
            , data = {}
            , text
            , $wrapper
            , s_cb
            , f_cb;
        if (lang === undefined) {
            lang = "en";
        }
        if ($current.hasClass('btn-unsubscribe-desktop') === true) {
            $wrapper = $current.parent();
        } else {
            $wrapper = $current.parent().parent().parent();
        }
        data._id = encodeURIComponent(_id);
        data.type = encodeURIComponent(type);
        data.is_push = encodeURIComponent("false");
        data.action = encodeURIComponent("subscribers");
        text = i18n[lang].subscription;
        if (type === 'blog') {
            data.blog_id = encodeURIComponent(blog_id);
            data.blog_menu_id = encodeURIComponent(blog_menu_id);
        } else if (type === 'gallery') {
            data.blog_id = encodeURIComponent(blog_id);
        } else {}
        s_cb = function (result) {
            if (result.response === true) {
                $wrapper.find('.btn-unsubscribe-desktop span').text(text);
                $wrapper.find('.btn-unsubscribe-mobile span').text(text);
                $wrapper.find('.btn-unsubscribe-desktop img').attr("src", aws_s3_url + "/icons/subscription.png");
                $wrapper.find('.btn-unsubscribe-mobile img').attr("src", aws_s3_url + "/icons/subscription.png");
                $wrapper.find('.btn-unsubscribe-desktop').removeClass('btn-unsubscribe-desktop').addClass('btn-subscribe-desktop');
                $wrapper.find('.btn-unsubscribe-mobile').removeClass('btn-unsubscribe-mobile').addClass('btn-subscribe-mobile');
                $('.btn-ellipsis-mobile ul').css('display', 'none');
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        f_cb = function () {};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:data,
            pathname:"/update/article-array",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".awesome-apply_now, .awesome-hire_me, .awesome-agenda", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version")
            , _id = $(e.currentTarget).attr('data-id')
            , type = $(e.currentTarget).attr('data-type')
            , is_selected = $(e.currentTarget).hasClass('selected')
            , data = {}
            , $current = $(e.currentTarget)
            , img
            , span
            , count_awesome_wrapper = ""
            , count_awesome = 1
            , text
            , s_cb
            , f_cb;
        if (lang === undefined) {
            lang = "en";
        }
        text = i18n[lang].subscription + " ✔";
        if (is_selected === true) {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.is_push = encodeURIComponent("false");
            data.is_comment = encodeURIComponent("false");
            data.action = encodeURIComponent("likers");
        } else {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.is_push = encodeURIComponent("true");
            data.is_comment = encodeURIComponent("false");
            data.action = encodeURIComponent("likers");
        }
        s_cb = function (result) {
            if (result.response === true) {
                if (is_selected === true) {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome - 1));
                        if (count_awesome === 1) {
                            $current.find('.real-count:first').text("");
                        } else {
                            $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome - 1));
                        }
                    } else {}
                    $(e.currentTarget).removeClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome.png" + css_version);
                } else {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome + 1));
                        $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome + 1));
                    } else {
                        $current.attr('data-count', "1");
                        $current.find('.real-count:first').text("1");
                    }
                    $(e.currentTarget).addClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome-selected.png" + css_version);
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first span').text(text);
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first span').text(text);
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first').removeClass('btn-subscribe-desktop').addClass('btn-unsubscribe-desktop');
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first').removeClass('btn-subscribe-mobile').addClass('btn-unsubscribe-mobile');
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        f_cb = function () {};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:data,
            pathname:"/update/article-array",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".awesome-opinion", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version")
            , _id = $(e.currentTarget).attr('data-id')
            , type = $(e.currentTarget).attr('data-type')
            , is_selected = $(e.currentTarget).hasClass('selected')
            , data = {}
            , $current = $(e.currentTarget)
            , img
            , span
            , count_awesome_wrapper = ""
            , count_awesome = 1
            , text
            , s_cb
            , f_cb;
        if (lang === undefined) {
            lang = "en";
        }
        text = i18n[lang].subscription + " ✔";
        if (is_selected === true) {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.is_push = encodeURIComponent("false");
            data.is_comment = encodeURIComponent("false");
            data.action = encodeURIComponent("likers");
        } else {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.is_push = encodeURIComponent("true");
            data.is_comment = encodeURIComponent("false");
            data.action = encodeURIComponent("likers");
        }
        s_cb = function (result) {
            if (result.response === true) {
                if (is_selected === true) {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome - 1));
                        if (count_awesome === 1) {
                            $current.find('.real-count:first').text("");
                        } else {
                            $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome - 1));
                        }
                    } else {}
                    $(e.currentTarget).removeClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome.png" + css_version);
                } else {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome + 1));
                        $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome + 1));
                    } else {
                        $current.attr('data-count', "1");
                        $current.find('.real-count:first').text("1");
                    }
                    $(e.currentTarget).addClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome-selected.png" + css_version);
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first span').text(text);
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first span').text(text);
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first').removeClass('btn-subscribe-desktop').addClass('btn-unsubscribe-desktop');
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first').removeClass('btn-subscribe-mobile').addClass('btn-unsubscribe-mobile');
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        f_cb = function () {};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:data,
            pathname:"/update/article-array",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".awesome-tr_agenda", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version")
            , _id = $(e.currentTarget).attr('data-id')
            , type = $(e.currentTarget).attr('data-type')
            , is_selected = $(e.currentTarget).hasClass('selected')
            , data = {}
            , $current = $(e.currentTarget)
            , img
            , span
            , count_awesome_wrapper = ""
            , count_awesome = 1
            , text
            , s_cb
            , f_cb;
        if (lang === undefined) {
            lang = "en";
        }
        text = i18n[lang].subscription + " ✔";
        if (is_selected === true) {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.is_push = encodeURIComponent("false");
            data.is_comment = encodeURIComponent("false");
            data.action = encodeURIComponent("likers");
        } else {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.is_push = encodeURIComponent("true");
            data.is_comment = encodeURIComponent("false");
            data.action = encodeURIComponent("likers");
        }
        s_cb = function (result) {
            if (result.response === true) {
                if (is_selected === true) {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome - 1));
                        if (count_awesome === 1) {
                            $current.find('.real-count:first').text("");
                        } else {
                            $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome - 1));
                        }
                    } else {}
                    $(e.currentTarget).removeClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome.png" + css_version);
                } else {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome + 1));
                        $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome + 1));
                    } else {
                        $current.attr('data-count', "1");
                        $current.find('.real-count:first').text("1");
                    }
                    $(e.currentTarget).addClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome-selected.png" + css_version);
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first span').text(text);
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first span').text(text);
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first').removeClass('btn-subscribe-desktop').addClass('btn-unsubscribe-desktop');
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first').removeClass('btn-subscribe-mobile').addClass('btn-unsubscribe-mobile');
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        f_cb = function () {};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:data,
            pathname:"/update/article-array",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".awesome-tr_opinion", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version")
            , _id = $(e.currentTarget).attr('data-id')
            , type = $(e.currentTarget).attr('data-type')
            , is_selected = $(e.currentTarget).hasClass('selected')
            , data = {}
            , $current = $(e.currentTarget)
            , img
            , span
            , count_awesome_wrapper = ""
            , count_awesome = 1
            , text
            , s_cb
            , f_cb;
        if (lang === undefined) {
            lang = "en";
        }
        text = i18n[lang].subscription + " ✔";
        if (is_selected === true) {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.is_push = encodeURIComponent("false");
            data.is_comment = encodeURIComponent("false");
            data.action = encodeURIComponent("likers");
        } else {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.is_push = encodeURIComponent("true");
            data.is_comment = encodeURIComponent("false");
            data.action = encodeURIComponent("likers");
        }
        s_cb = function (result) {
            if (result.response === true) {
                if (is_selected === true) {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome - 1));
                        if (count_awesome === 1) {
                            $current.find('.real-count:first').text("");
                        } else {
                            $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome - 1));
                        }
                    } else {}
                    $(e.currentTarget).removeClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome.png" + css_version);
                } else {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome + 1));
                        $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome + 1));
                    } else {
                        $current.attr('data-count', "1");
                        $current.find('.real-count:first').text("1");
                    }
                    $(e.currentTarget).addClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome-selected.png" + css_version);
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first span').text(text);
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first span').text(text);
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first').removeClass('btn-subscribe-desktop').addClass('btn-unsubscribe-desktop');
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first').removeClass('btn-subscribe-mobile').addClass('btn-unsubscribe-mobile');
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        f_cb = function () {};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:data,
            pathname:"/update/article-array",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".awesome-blog", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version")
            , _id = $(e.currentTarget).attr('data-id')
            , type = $(e.currentTarget).attr('data-type')
            , blog_id = $(e.currentTarget).attr('data-blog-id')
            , blog_menu_id = $(e.currentTarget).attr('data-blog-menu-id')
            , is_selected = $(e.currentTarget).hasClass('selected')
            , data = {}
            , $current = $(e.currentTarget)
            , img
            , span
            , count_awesome_wrapper = ""
            , count_awesome = 1
            , text
            , s_cb
            , f_cb;
        if (lang === undefined) {
            lang = "en";
        }
        text = i18n[lang].subscription + " ✔";
        if (is_selected === true) {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.blog_id = encodeURIComponent(blog_id);
            data.blog_menu_id = encodeURIComponent(blog_menu_id);
            data.is_push = encodeURIComponent("false");
            data.is_comment = encodeURIComponent("false");
            data.action = encodeURIComponent("likers");
        } else {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.blog_id = encodeURIComponent(blog_id);
            data.blog_menu_id = encodeURIComponent(blog_menu_id);
            data.is_push = encodeURIComponent("true");
            data.is_comment = encodeURIComponent("false");
            data.action = encodeURIComponent("likers");
        }
        s_cb = function (result) {
            if (result.response === true) {
                if (is_selected === true) {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome - 1));
                        if (count_awesome === 1) {
                            $current.find('.real-count:first').text("");
                        } else {
                            $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome - 1));
                        }
                    } else {}
                    $(e.currentTarget).removeClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome.png" + css_version);
                } else {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome + 1));
                        $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome + 1));
                    } else {
                        $current.attr('data-count', "1");
                        $current.find('.real-count:first').text("1");
                    }
                    $(e.currentTarget).addClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome-selected.png" + css_version);
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first span').text(text);
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first span').text(text);
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first').removeClass('btn-subscribe-desktop').addClass('btn-unsubscribe-desktop');
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first').removeClass('btn-subscribe-mobile').addClass('btn-unsubscribe-mobile');
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        f_cb = function () {};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:data,
            pathname:"/update/article-array",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".awesome-gallery", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version")
            , _id = $(e.currentTarget).attr('data-id')
            , type = $(e.currentTarget).attr('data-type')
            , blog_id = $(e.currentTarget).attr('data-blog-id')
            , blog_menu_id = $(e.currentTarget).attr('data-blog-menu-id')
            , is_selected = $(e.currentTarget).hasClass('selected')
            , data = {}
            , $current = $(e.currentTarget)
            , img
            , span
            , count_awesome_wrapper = ""
            , count_awesome = 1
            , text
            , s_cb
            , f_cb;
        if (lang === undefined) {
            lang = "en";
        }
        text = i18n[lang].subscription + " ✔";
        if (is_selected === true) {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.blog_id = encodeURIComponent(blog_id);
            data.blog_menu_id = encodeURIComponent(blog_menu_id);
            data.is_push = encodeURIComponent("false");
            data.is_comment = encodeURIComponent("false");
            data.action = encodeURIComponent("likers");
        } else {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.blog_id = encodeURIComponent(blog_id);
            data.blog_menu_id = encodeURIComponent(blog_menu_id);
            data.is_push = encodeURIComponent("true");
            data.is_comment = encodeURIComponent("false");
            data.action = encodeURIComponent("likers");
        }
        s_cb = function (result) {
            if (result.response === true) {
                if (is_selected === true) {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome - 1));
                        if (count_awesome === 1) {
                            $current.find('.real-count:first').text("");
                        } else {
                            $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome - 1));
                        }
                    } else {}
                    $(e.currentTarget).removeClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome.png" + css_version);
                } else {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome + 1));
                        $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome + 1));
                    } else {
                        $current.attr('data-count', "1");
                        $current.find('.real-count:first').text("1");
                    }
                    $(e.currentTarget).addClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome-selected.png" + css_version);
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first span').text(text);
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first span').text(text);
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first img').attr("src", aws_s3_url + "/icons/subscription-selected.png");
                    $(e.currentTarget).parent().find('.btn-subscribe-desktop:first').removeClass('btn-subscribe-desktop').addClass('btn-unsubscribe-desktop');
                    $(e.currentTarget).parent().find('.btn-subscribe-mobile:first').removeClass('btn-subscribe-mobile').addClass('btn-unsubscribe-mobile');
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        f_cb = function () {};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:data,
            pathname:"/update/article-array",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".awesome-comment", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version")
            , _id = $(e.currentTarget).attr('data-id')
            , type = $(e.currentTarget).attr('data-type')
            , root_type
            , root_id = $(e.currentTarget).attr('data-root-id')
            , link = $(e.currentTarget).attr('data-link')
            , blog_id = $(e.currentTarget).attr('data-blog-id')
            , is_selected = $(e.currentTarget).hasClass('selected')
            , comment_type = 1
            , data = {}
            , $current = $(e.currentTarget)
            , img
            , span
            , count_awesome_wrapper = ""
            , count_awesome = 1
            , s_cb
            , f_cb;
        if (lang === undefined) {
            lang = "en";
        }
        if (
            type === "agenda" ||
            type === "opinion" ||
            type === "tr_agenda" ||
            type === "tr_opinion"
        ) {
            root_type = "agenda";
        } else {
            root_type = type;
        }
        if (type === "gallery" || type === "blog") {
            blog_id = link.split("/")[2];
        }
        if (is_selected === true) {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.root_type = encodeURIComponent(root_type);
            data.root_id = encodeURIComponent(root_id);
            data.blog_id = encodeURIComponent(blog_id);
            data.is_push = encodeURIComponent("false");
            data.is_comment = encodeURIComponent("true");
            data.action = encodeURIComponent("likers");
        } else {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.root_type = encodeURIComponent(root_type);
            data.root_id = encodeURIComponent(root_id);
            data.blog_id = encodeURIComponent(blog_id);
            data.is_push = encodeURIComponent("true");
            data.is_comment = encodeURIComponent("true");
            data.action = encodeURIComponent("likers");
        }
        s_cb = function (result) {
            if (result.response === true) {
                if (is_selected === true) {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome - 1));
                        if (count_awesome === 1) {
                            $current.find('.real-count:first').text("");
                        } else {
                            $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome - 1));
                        }
                    } else {}
                    $(e.currentTarget).removeClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome.png" + css_version);
                } else {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome + 1));
                        $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome + 1));
                    } else {
                        $current.attr('data-count', "1");
                        $current.find('.real-count:first').text("1");
                    }
                    $(e.currentTarget).addClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome-selected.png" + css_version);
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        f_cb = function () {};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:data,
            pathname:"/update/article-array",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".awesome-inner-comment", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version")
            , _id = $(e.currentTarget).attr('data-id')
            , type = $(e.currentTarget).attr('data-type')
            , root_type
            , root_id = $(e.currentTarget).attr('data-root-id')
            , link = $(e.currentTarget).attr('data-link')
            , blog_id = $(e.currentTarget).attr('data-blog-id')
            , is_selected = $(e.currentTarget).hasClass('selected')
            , comment_type = 2
            , data = {}
            , $current = $(e.currentTarget)
            , img
            , span
            , count_awesome_wrapper = ""
            , count_awesome = 1
            , s_cb
            , f_cb;
        if (lang === undefined) {
            lang = "en";
        }
        if (
            type === "agenda" ||
            type === "opinion" ||
            type === "tr_agenda" ||
            type === "tr_opinion"
        ) {
            root_type = "agenda";
        } else {
            root_type = type;
        }
        if (type === "gallery" || type === "blog") {
            blog_id = link.split("/")[2];
        }
        if (is_selected === true) {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.root_type = encodeURIComponent(root_type);
            data.root_id = encodeURIComponent(root_id);
            data.blog_id = encodeURIComponent(blog_id);
            data.is_push = encodeURIComponent("false");
            data.is_comment = encodeURIComponent("true");
            data.action = encodeURIComponent("likers");
        } else {
            data._id = encodeURIComponent(_id);
            data.type = encodeURIComponent(type);
            data.root_type = encodeURIComponent(root_type);
            data.root_id = encodeURIComponent(root_id);
            data.blog_id = encodeURIComponent(blog_id);
            data.is_push = encodeURIComponent("true");
            data.is_comment = encodeURIComponent("true");
            data.action = encodeURIComponent("likers");
        }
        s_cb = function (result) {
            if (result.response === true) {
                if (is_selected === true) {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome - 1));
                        if (count_awesome === 1) {
                            $current.find('.real-count:first').text("");
                        } else {
                            $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome - 1));
                        }
                    } else {}
                    $(e.currentTarget).removeClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome.png" + css_version);
                } else {
                    if (parseInt($current.attr("data-count")) > 0) {
                        count_awesome = parseInt($current.attr("data-count"));
                        $current.attr('data-count', (count_awesome + 1));
                        $current.find('.real-count:first').text(put_comma_between_three_digits(count_awesome + 1));
                    } else {
                        $current.attr('data-count', "1");
                        $current.find('.real-count:first').text("1");
                    }
                    $(e.currentTarget).addClass('selected').find('img').attr('src', aws_s3_url + "/icons/awesome-selected.png" + css_version);
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                }
            }
        };
        f_cb = function () {};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:data,
            pathname:"/update/article-array",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".report-article", function (e) {
        e.preventDefault();
        var $article
            , type = $(e.currentTarget).attr('data-type')
            , link
            , _id
            , agenda_id=""
            , opinion_id="";
        if($(e.currentTarget).hasClass("btn-report-desktop")) {
            $article = $(e.currentTarget).parent().parent();
        } else {
            $article = $(e.currentTarget).parent().parent().parent().parent();
        }
        link = $article.attr("data-link");
        if (type === "apply_now") {
            _id =  link.split('/')[2];
        } else if (type === "hire_me") {
            _id =  link.split('/')[2];
        } else if (type === "agenda") {
            _id =  link.split('/')[2];
        } else if (type === "opinion") {
            agenda_id =  link.split('/')[2];
            _id =  link.split('/')[4];
        } else if (type === "tr_agenda") {
            agenda_id =  link.split('/')[2];
            _id =  link.split('/')[4];
        } else if (type === "tr_opinion") {
            agenda_id =  link.split('/')[2];
            opinion_id =  link.split('/')[4];
            _id =  link.split('/')[6];
        }  else {
            return false;
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
        /*if (is_translation_prompt_opened === true) {
            modal(".prompt#translation-prompt", "close");
        }*/
        $('.prompt#report-prompt').removeAttr('data-type').removeAttr('data-link').removeAttr('data-outer-id').removeAttr('data-agenda-id').removeAttr('data-opinion-id').removeAttr('data-id').removeAttr('data-comment-type').attr('data-type', type).attr('data-agenda-id', agenda_id).attr('data-opinion-id', opinion_id).attr('data-id', _id);
        modal(".prompt#report-prompt", "open");
        return false;
    });
    $(document).on("click", ".report-comment", function (e) {
        e.preventDefault();
        var comment = $(e.currentTarget).parent().parent()
            , link = comment.attr("data-link")
            , _id = comment.attr("data-id");
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
        if (is_news_comments_prompt_opened === true) {
            modal(".prompt#news-comments-prompt", "close");
        }
        $('.prompt#report-prompt').removeAttr('data-type').removeAttr('data-link').removeAttr('data-outer-id').removeAttr('data-agenda-id').removeAttr('data-opinion-id').removeAttr('data-id').removeAttr('data-comment-type').attr('data-type', 'comment').attr('data-link', link).attr('data-id', _id).attr('data-comment-type', '1');
        modal(".prompt#report-prompt", "open");
        return false;
    });
    $(document).on("click", ".report-inner-comment", function (e) {
        e.preventDefault();
        var inner_comment = $(e.currentTarget).parent().parent()
            , link = inner_comment.attr("data-link")
            , outer_id = inner_comment.attr("data-outer-id")
            , _id = inner_comment.attr("data-id");
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
        if (is_news_comments_prompt_opened === true) {
            modal(".prompt#news-comments-prompt", "close");
        }
        $('.prompt#report-prompt').removeAttr('data-type').removeAttr('data-link').removeAttr('data-outer-id').removeAttr('data-agenda-id').removeAttr('data-opinion-id').removeAttr('data-id').removeAttr('data-comment-type').attr('data-type', 'comment').attr('data-link', link).attr('data-outer-id', outer_id).attr('data-id', _id).attr('data-comment-type', '2');
        modal(".prompt#report-prompt", "open");
        return false;
    });
    $(document).on("click", ".prompt#report-prompt #report-submit", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , type = $('.prompt#report-prompt').attr('data-type')
            , _id = $('.prompt#report-prompt').attr('data-id')
            , content = $('#report-content').val()
            , agenda_id = $('.prompt#report-prompt').attr('data-agenda-id')
            , opinion_id = $('.prompt#report-prompt').attr('data-opinion-id')
            , to_blog_id = $('.prompt#report-prompt').attr('data-to-blog-id')
            , from_blog_id = $('.prompt#report-prompt').attr('data-from-blog-id')
            , data = {}
            , s_cb
            , f_cb;
        if (lang === undefined) {
            lang = "en";
        }
        data._id = encodeURIComponent(_id);
        data.type = encodeURIComponent(type);
        data.content = encodeURIComponent(content);
        if (type === 'apply_now' || type === 'hire_me') {
        } else if (type === 'agenda') {
        } else if (type === 'opinion') {
            data.agenda_id = encodeURIComponent(agenda_id);
        } else if (type === 'tr_agenda') {
            data.agenda_id = encodeURIComponent(agenda_id);
        } else if (type === 'tr_opinion') {
            data.agenda_id = encodeURIComponent(agenda_id);
            data.opinion_id = encodeURIComponent(opinion_id);
        } else if (type === 'comment') {
        } else if (type === 'message') {
            data.to_blog_id = encodeURIComponent(to_blog_id);
            data.from_blog_id = encodeURIComponent(from_blog_id);
        } else {
            return false;
        }
        s_cb = function (result) {
            if (result.response === true) {
                show_bert("success", 3000, i18n[lang].successfully_reported);
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
            modal(".prompt#report-prompt", "close");
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
            }
            if (is_message_prompt_opened === true) {
                modal(".prompt#message-prompt", "open");
            }
            if (is_notification_prompt_opened === true) {
                modal(".prompt#notification-prompt", "open");
            }
            if (is_apply_now_prompt_opened === true) {
                modal('.prompt#apply-now-prompt', 'open');
            }
            if (is_hire_me_prompt_opened === true) {
                modal('.prompt#hire-me-prompt', 'open');
            }
            if (is_news_comments_prompt_opened === true) {
                modal(".prompt#news-comments-prompt", "open");
            }
        };
        f_cb = function () {
            show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
            modal(".prompt#report-prompt", "close");
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
            }
            if (is_message_prompt_opened === true) {
                modal(".prompt#message-prompt", "open");
            }
            if (is_notification_prompt_opened === true) {
                modal(".prompt#notification-prompt", "open");
            }
            if (is_apply_now_prompt_opened === true) {
                modal('.prompt#apply-now-prompt', 'open');
            }
            if (is_hire_me_prompt_opened === true) {
                modal('.prompt#hire-me-prompt', 'open');
            }
            if (is_news_comments_prompt_opened === true) {
                modal(".prompt#news-comments-prompt", "open");
            }
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/report",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".prompt#report-prompt .close", function (e) {
        e.preventDefault();
        modal(".prompt#report-prompt", "close");
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
        }
        if (is_message_prompt_opened === true) {
            modal(".prompt#message-prompt", "open");
        }
        if (is_notification_prompt_opened === true) {
            modal(".prompt#notification-prompt", "open");
        }
        if (is_apply_now_prompt_opened === true) {
            modal('.prompt#apply-now-prompt', 'open');
        }
        if (is_hire_me_prompt_opened === true) {
            modal('.prompt#hire-me-prompt', 'open');
        }
        if (is_news_comments_prompt_opened === true) {
            modal(".prompt#news-comments-prompt", "open");
        }
        return false;
    });
    $(document).on("click", ".prompt#request-login-prompt .close", function (e) {
        e.preventDefault();
        modal(".prompt#request-login-prompt", "close");
        return false;
    });
    $(document).on("click", ".prompt#remove-prompt #btn-remove-ok", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang")
            , data
            , f_cb
            , s_cb
            , count
            , $written
            , go_remove_employment
            , go_remove_debate
            , redirect_pathname;
        if (lang === undefined) {
            lang = "en";
        }
        modal(".prompt#remove-prompt", "close");
        f_cb = function () {
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
            }
            if (is_message_prompt_opened === true) {
                modal(".prompt#message-prompt", "open");
            }
            if (is_notification_prompt_opened === true) {
                modal(".prompt#notification-prompt", "open");
            }
            if (is_apply_now_prompt_opened === true) {
                modal('.prompt#apply-now-prompt', 'open');
            }
            if (is_hire_me_prompt_opened === true) {
                modal('.prompt#hire-me-prompt', 'open');
            }
            if (is_news_comments_prompt_opened === true) {
                modal(".prompt#news-comments-prompt", "open");
            }
        };
        go_remove_employment = function (remove_info) {
            s_cb = function (result) {
                if (result.response === true) {
                    if (remove_info.type === "apply_now") {
                        if (is_apply_now_prompt_opened === true) {
                            if (history && history.state) {
                                if (my_history && my_history.length > 1) {
                                    my_history.pop();
                                }
                                history.back();
                            } else {
                                return window.location = "/apply-now";
                            }
                        } else {
                            return window.location = "/apply-now";
                        }
                    } else {
                        if (is_hire_me_prompt_opened === true) {
                            if (history && history.state) {
                                if (my_history && my_history.length > 1) {
                                    my_history.pop();
                                }
                                history.back();
                            } else {
                                return window.location = "/hire-me";
                            }
                        } else {
                            return window.location = "/hire-me";
                        }
                    }
                    is_apply_now_prompt_opened = false;
                    is_hire_me_prompt_opened = false;
                    $(".prompt#apply-now-prompt #apply-now-wrapper").empty();
                    $(".prompt#hire-me-prompt #hire-me-wrapper").empty();
                    remove_info.element.remove();
                    if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
                        write_form["rebuild_write_form_data_as_ground"]();
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
                data:remove_info.data,
                pathname:"/remove/employment",
                s_cb:s_cb,
                f_cb:f_cb
            });
        };
        go_remove_debate = function (remove_info) {
            s_cb = function (result) {
                if (result.response === true) {
                    if (is_translation_prompt_opened === true) {
                        if (history && history.state) {
                            if (my_history && my_history.length > 1) {
                                my_history.pop();
                            }
                            history.back();
                        } else {
                            return window.location = "/debate";
                        }
                    } else {
                        if (
                            is_agenda_prompt_opened === true &&
                            is_opinion_prompt_opened === true
                        ) {
                            if (history && history.state) {
                                if (my_history && my_history.length > 1) {
                                    my_history.pop();
                                    my_history.pop();
                                }
                                history.go(-2);
                            } else {
                                return window.location = "/debate";
                            }
                        } else if (
                            is_agenda_prompt_opened === true &&
                            is_opinion_prompt_opened === false
                        ) {
                            if (history && history.state) {
                                if (my_history && my_history.length > 1) {
                                    my_history.pop();
                                }
                                history.back();
                            } else {
                                return window.location = "/debate";
                            }
                        } else if (
                            is_agenda_prompt_opened === false &&
                            is_opinion_prompt_opened === true
                        ) {
                            if (history && history.state) {
                                if (my_history && my_history.length > 1) {
                                    my_history.pop();
                                }
                                history.back();
                            } else {
                                return window.location = "/debate";
                            }
                        } else {
                            return window.location = "/debate";
                        }
                    }
                    is_translation_prompt_opened = false;
                    is_agenda_prompt_opened = false;
                    is_opinion_prompt_opened = false;
                    is_opinion_prompt_parent = true;
                    is_apply_now_prompt_opened = false;
                    is_hire_me_prompt_opened = false;
                    $(".prompt#agenda-prompt #agenda-wrapper").empty();
                    $(".prompt#opinion-prompt #opinion-wrapper").empty();
                    $(".prompt#translation-prompt #translation-wrapper").empty();
                    remove_info.element.remove();
                    if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
                        write_form["rebuild_write_form_data_as_ground"]();
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
                data:remove_info.data,
                pathname:"/remove/article",
                s_cb:s_cb,
                f_cb:f_cb
            });
        };
        if (remove.type === 'comment') {
            data = remove.data;
            s_cb = function (result) {
                if (result.response === true) {
                    remove.element.remove();
                    if (
                        remove.data.type !== "deep" &&
                        remove.data.type !== "clipping"
                    ) {
                        return realtime_comments["init"](realtime_comments["type"]);
                    } else {
                        if (is_news_comments_prompt_opened === true) {
                            modal(".prompt#news-comments-prompt", "open");
                        }
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
                show_animation: false,
                data:data,
                pathname:"/remove/article-comment",
                s_cb:s_cb,
                f_cb:f_cb
            });
        } else if (remove.type === 'guestbook_comment') {
            data = remove.data;
            s_cb = function (result) {
                if (result.response === true) {
                    remove.element.remove();
                } else {
                    if (result["msg"] === "no_blog_id") {
                        return window.location = "/set/blog-id";
                    } else {
                        return f_cb();
                    }
                }
            };
            methods["the_world"]["is_one"]({
                show_animation: false,
                data:data,
                pathname:"/remove/guestbook-comment",
                s_cb:s_cb,
                f_cb:f_cb
            });
        } else if (remove.type === 'announcement') {
            data = remove.data;
            s_cb = function (result) {
                if ( result['response'] === true ) {
                    remove.element.remove();
                    $written = remove["$written"];
                    if ($written.find(".btn-announcement").length > 0) {
                        count = parseInt($written.find(".btn-announcement:first").attr("data-count"));
                        count = count - 1;
                        $written.find(".btn-announcement:first").attr("data-count", count);
                        $written.find(".btn-announcement:first .real-count").text(count);
                    }
                    if ($written.find(".btn-announcement-mobile").length > 0) {
                        count = parseInt($written.find(".btn-announcement-mobile:first").attr("data-count"));
                        count = count - 1;
                        $written.find(".btn-announcement-mobile:first").attr("data-count", count);
                        $written.find(".btn-announcement-mobile:first .real-count").text(count);
                    }
                } else {
                    if (result["msg"] === "no_blog_id") {
                        return window.location = "/set/blog-id";
                    } else {
                        show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                    }
                }
            };
            methods["the_world"]["is_one"]({
                show_animation: true,
                data:data,
                pathname:"/remove/employment-announcement",
                s_cb:s_cb,
                f_cb:f_cb
            });
        } else if (remove.type ==='apply_now') {
            return go_remove_employment(remove);
        } else if (remove.type === 'hire_me') {
            return go_remove_employment(remove);
        } else if (remove.type ==='agenda') {
            return go_remove_debate(remove);
        } else if (remove.type === 'opinion') {
            return go_remove_debate(remove);
        } else if (remove.type === 'tr_agenda') {
            return go_remove_debate(remove);
        } else if (remove.type === 'tr_opinion') {
            return go_remove_debate(remove);
        } else if (remove.type === 'blog') {
            data = remove.data;
            redirect_pathname = "/blog/" + decodeURIComponent(data.blog_id) + "/" + decodeURIComponent(data.blog_menu_id);
            s_cb = function (result) {
                if (result.response === true) {
                    return window.location = redirect_pathname;
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
                pathname:"/remove/article",
                s_cb:s_cb,
                f_cb:f_cb
            });
        } else if (remove.type === 'gallery') {
            data = remove.data;
            redirect_pathname = "/blog/" + decodeURIComponent(data.blog_id) + "/gallery";
            s_cb = function (result) {
                if (result.response === true) {
                    return window.location = redirect_pathname;
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
                pathname:"/remove/article",
                s_cb:s_cb,
                f_cb:f_cb
            });
        } else if (remove.type === 'guestbook') {
            data = remove.data;
            s_cb = function (result) {
                if (result.response === true) {
                    remove.element.remove();
                } else {
                    if (result["msg"] === "no_blog_id") {
                        return window.location = "/set/blog-id";
                    } else {
                        return f_cb();
                    }
                }
            };
            methods["the_world"]["is_one"]({
                show_animation: false,
                data:data,
                pathname:"/remove/guestbook",
                s_cb:s_cb,
                f_cb:f_cb
            });
        } else if (remove.type === 'message') {
            data = remove.data;
            s_cb = function (result) {
                if (result.response === true) {
                    remove.element.remove();
                    return show_bert('success', 3000, i18n[lang].successfully_removed_message);
                } else {
                    if (result["msg"] === "no_blog_id") {
                        return window.location = "/set/blog-id";
                    } else {
                        return f_cb();
                    }
                }
            };
            methods["the_world"]["is_one"]({
                show_animation: false,
                data:data,
                pathname:"/remove/message",
                s_cb:s_cb,
                f_cb:f_cb
            });
        }
        return false;
    });
    $(document).on("click", ".prompt#remove-prompt .close, .prompt#remove-prompt #btn-remove-cancel", function (e) {
        e.preventDefault();
        modal(".prompt#remove-prompt", "close");
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
        }
        if (is_message_prompt_opened === true) {
            modal(".prompt#message-prompt", "open");
        }
        if (is_notification_prompt_opened === true) {
            modal(".prompt#notification-prompt", "open");
        }
        if (is_apply_now_prompt_opened === true) {
            modal('.prompt#apply-now-prompt', 'open');
        }
        if (is_hire_me_prompt_opened === true) {
            modal('.prompt#hire-me-prompt', 'open');
        }
        if (is_news_comments_prompt_opened === true) {
            modal(".prompt#news-comments-prompt", "open");
        }
        return false;
    });
    $(document).on("click", ".prompt#apply-now-prompt .close", function (e) {
        e.preventDefault();
        var css_version = $("body").attr("data-css-version");
        modal(".prompt#share-prompt", "close");
        modal(".prompt#report-prompt", "close");
        modal(".prompt#apply-now-prompt", "close");
        is_apply_now_prompt_opened = false;
        is_hire_me_prompt_opened = false;
        is_unicorn_prompt_opened = false;
        is_superior_prompt_opened = false;
        if (unicorn_editor_focuser !== undefined && unicorn_editor_focuser !== null) {
            unicorn_editor_focuser.blur();
        }
        if (superior_editor_focuser !== undefined && superior_editor_focuser !== null) {
            superior_editor_focuser.blur();
        }
        if (history && history.state) {
            if (my_history && my_history.length > 0) {
                my_history.pop();
            }
            history.back();
        }
        $(".prompt#apply-now-prompt #apply-now-wrapper").empty();
        if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
            write_form["rebuild_write_form_data_as_ground"]();
        }
        return false;
    });
    $(document).on("click", ".prompt#hire-me-prompt .close", function (e) {
        e.preventDefault();
        modal(".prompt#share-prompt", "close");
        modal(".prompt#report-prompt", "close");
        modal(".prompt#hire-me-prompt", "close");
        is_apply_now_prompt_opened = false;
        is_hire_me_prompt_opened = false;
        is_unicorn_prompt_opened = false;
        is_superior_prompt_opened = false;
        if (unicorn_editor_focuser !== undefined && unicorn_editor_focuser !== null) {
            unicorn_editor_focuser.blur();
        }
        if (superior_editor_focuser !== undefined && superior_editor_focuser !== null) {
            superior_editor_focuser.blur();
        }
        if (history && history.state) {
            if (my_history && my_history.length > 0) {
                my_history.pop();
            }
            history.back();
        }
        $(".prompt#hire-me-prompt #hire-me-wrapper").empty();
        if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
            write_form["rebuild_write_form_data_as_ground"]();
        }
        return false;
    });
    $(document).on("click", ".prompt#agenda-prompt .close", function (e) {
        e.preventDefault();
        var css_version = $("body").attr("data-css-version");
        modal(".prompt#share-prompt", "close");
        modal(".prompt#report-prompt", "close");
        modal(".prompt#agenda-prompt", "close");
        is_opinion_prompt_parent = true;
        is_agenda_prompt_opened = false;
        is_translation_prompt_opened = false;
        is_space_prompt_opened = false;
        is_edit_detailed_career_prompt_opened = false;
        is_apply_now_prompt_opened = false;
        is_hire_me_prompt_opened = false;
        is_unicorn_prompt_opened = false;
        is_superior_prompt_opened = false;
        is_w_opinion_opened = false;
        $(".btn-opinion.ing-write img").attr("src", aws_s3_url + "/icons/write-opinion.png");
        $(".btn-opinion.ing-write").removeClass("selected").removeClass("ing-write");
        $(".write-opinion-wrapper").empty().removeClass("opened");
        $(".request-opinion-wrapper").empty().removeClass("opened");
        /*
        is_w_translation_opened = false;
        $(".btn-translation.ing-write img").attr("src", aws_s3_url + "/icons/write-translation.png");
        $(".btn-translation.ing-write").removeClass("selected").removeClass("ing-write");
        $(".write-translation-wrapper").empty().removeClass("opened");
        $(".request-translation-wrapper").empty().removeClass("opened");
        */
        if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
            star_editor_focuser.blur();
        }
        if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
            moon_editor_focuser.blur();
        }
        if (history && history.state) {
            if (my_history && my_history.length > 0) {
                my_history.pop();
            }
            history.back();
        }
        if (is_opinion_prompt_opened === true) {
            modal('.prompt#opinion-prompt', 'open');
        }
        $(".prompt#agenda-prompt #agenda-wrapper").empty();
        if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
            write_form["rebuild_write_form_data_as_ground"]();
        }
        return false;
    });
    $(document).on("click", ".prompt#opinion-prompt .close", function (e) {
        e.preventDefault();
        var css_version = $("body").attr("data-css-version");
        modal(".prompt#share-prompt", "close");
        modal(".prompt#report-prompt", "close");
        modal(".prompt#opinion-prompt", "close");
        is_opinion_prompt_parent = false;
        is_opinion_prompt_opened = false;
        is_translation_prompt_opened = false;
        is_space_prompt_opened = false;
        is_edit_detailed_career_prompt_opened = false;
        is_apply_now_prompt_opened = false;
        is_hire_me_prompt_opened = false;
        is_unicorn_prompt_opened = false;
        is_superior_prompt_opened = false;
        is_w_opinion_opened = false;
        $(".btn-opinion.ing-write img").attr("src", aws_s3_url + "/icons/write-opinion.png");
        $(".btn-opinion.ing-write").removeClass("selected").removeClass("ing-write");
        $(".write-opinion-wrapper").empty().removeClass("opened");
        $(".request-opinion-wrapper").empty().removeClass("opened");
        /*
        is_w_translation_opened = false;
        $(".btn-translation.ing-write img").attr("src", aws_s3_url + "/icons/write-translation.png");
        $(".btn-translation.ing-write").removeClass("selected").removeClass("ing-write");
        $(".write-translation-wrapper").empty().removeClass("opened");
        $(".request-translation-wrapper").empty().removeClass("opened");
        */
        if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
            star_editor_focuser.blur();
        }
        if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
            moon_editor_focuser.blur();
        }
        if (history && history.state) {
            if (my_history && my_history.length > 0) {
                my_history.pop();
            }
            history.back();
        }
        if (is_agenda_prompt_opened === true) {
            modal('.prompt#agenda-prompt', 'open');
        }
        $(".prompt#opinion-prompt #opinion-wrapper").empty();
        if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
            write_form["rebuild_write_form_data_as_ground"]();
        }
        return false;
    });
    $(document).on("click", ".prompt#translation-prompt .close", function (e) {
        e.preventDefault();
        modal(".prompt#share-prompt", "close");
        modal(".prompt#report-prompt", "close");
        modal(".prompt#translation-prompt", "close");
        is_translation_prompt_opened = false;
        if (history && history.state) {
            if (my_history && my_history.length > 0) {
                my_history.pop();
            }
            history.back();
        }
        if (is_opinion_prompt_parent === true) {
            if (is_agenda_prompt_opened === true) {
                modal('.prompt#agenda-prompt', 'open');
            } else if (is_opinion_prompt_opened === true) {
                modal('.prompt#opinion-prompt', 'open');
            }
        } else {
            if (is_opinion_prompt_opened === true) {
                modal('.prompt#opinion-prompt', 'open');
            } else if (is_agenda_prompt_opened === true) {
                modal('.prompt#agenda-prompt', 'open');
            }
        }
        $(".prompt#translation-prompt #translation-wrapper").empty();
        if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
            write_form["rebuild_write_form_data_as_ground"]();
        }
        return false;
    });
    $(document).on("click", ".comments-wrapper.outer-comments", function (e) {
        e.preventDefault();
        return false;
    });

    $(document).on("click", ".written", function (e) {
        $('.btn-ellipsis-mobile ul').css('display', 'none');
    });
});