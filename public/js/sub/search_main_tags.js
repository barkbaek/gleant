var current_search_input;
var main_tags;
var init_main_tag = function () {
    var s_cb
        , f_cb
        , a
        , lang = $("body").attr("data-lang")
        , agenda_menu = $("body").attr("data-t")
        , li
        , li_list=""
        , is_write_agenda = (window.location.pathname === "/write/agenda")
        , option;
    if (agenda_menu === undefined || agenda_menu === "all") {
        agenda_menu = "";
    }
    s_cb = function (result) {
        main_tags = result["tags"];
        if ($("select.main-tag").length > 0) {
            $("select.main-tag").empty();
        }
        if (main_tags !== null) {
            if (article_mt === undefined) {
                li = "<li class='tag-item selected'>" + i18n[lang].total + "</li>";
            } else {
                li = "<li class='tag-item'>" + i18n[lang].total + "</li>";
            }
            if (window.location.pathname === '/agenda') {
                if (agenda_menu === "") {
                    a = "<a href='" + window.location.pathname + "'>" + li + "</a>";
                } else {
                    a = "<a href='" + window.location.pathname + "?t=" + agenda_menu.replace("_", "-") + "'>" + li + "</a>";
                }
            } else {
                a = "<a href='" + window.location.pathname + "'>" + li + "</a>";
            }
            li_list = li_list + a;
            for (var i = 0; i < main_tags.length; i++) {
                if (article_mt === main_tags[i]["tag"]) {
                    li = "<li class='tag-item selected'>" + i18n[lang][main_tags[i]["tag"]] + "</li>";
                } else {
                    li = "<li class='tag-item'>" + i18n[lang][main_tags[i]["tag"]] + "</li>";
                }
                if (window.location.pathname === '/agenda') {
                    if (agenda_menu === "") {
                        a = "<a href='" + window.location.pathname + "?mt=" + main_tags[i]["tag"] + "'>" + li + "</a>";
                    } else {
                        a = "<a href='" + window.location.pathname + "?t=" + agenda_menu.replace("_", "-") + "&mt=" + main_tags[i]["tag"] + "'>" + li + "</a>";
                    }
                } else {
                    a = "<a href='" + window.location.pathname + "?mt=" + main_tags[i]["tag"] + "'>" + li + "</a>";
                }
                li_list = li_list + a;
                if ($("select.main-tag").length > 0) {
                    if (i === 0) {
                        option = "<option selected='selected' value='" + main_tags[i]["tag"] + "'>" + i18n[lang][main_tags[i]["tag"]] + "</option>";
                    } else {
                        option = "<option value='" + main_tags[i]["tag"] + "'>" + i18n[lang][main_tags[i]["tag"]] + "</option>";
                    }
                    $("select.main-tag").append($.parseHTML(option));
                }
            }
        }
        if (is_write_agenda === true) {
            init_realtime_tag_agendas_list(true);
        }
        if ($('.tag-menu-item-top-wrapper').length > 0 ) {
            var tag_item_menu
                , query_mt = "";
            if (article_mt !== undefined) {
                query_mt = "?mt=" + article_mt;
            } else {
                query_mt = "";
            }
            if (window.location.pathname === '/debate') {
                tag_item_menu = "<a href='/debate" + query_mt + "'><li class='tag-item selected'>" + i18n[lang].debate + "</li></a>";
            } else {
                tag_item_menu = "<a href='/debate" + query_mt + "'><li class='tag-item'>" + i18n[lang].debate + "</li></a>";
            }
            if (window.location.pathname === '/debate') {
                /* tag_item_menu = tag_item_menu + "<a href='/agenda" + query_mt + "'><li class='tag-item selected'>" + i18n[lang].agenda + "</li></a>"; */
                if (article_mt !== undefined) {
                    query_mt = "&mt=" + article_mt;
                } else {
                    query_mt = "";
                }
                if (agenda_menu === "in_progress") {
                    tag_item_menu = tag_item_menu + "<a href='/debate?t=in-progress" + query_mt + "'><li class='tag-item small-size selected'>" + i18n[lang].in_progress + "</li></a>";
                } else {
                    tag_item_menu = tag_item_menu + "<a href='/debate?t=in-progress" + query_mt + "'><li class='tag-item small-size'>" + i18n[lang].in_progress + "</li></a>";
                }
                if (agenda_menu === "scheduled") {
                    tag_item_menu = tag_item_menu + "<a href='/debate?t=scheduled" + query_mt + "'><li class='tag-item small-size selected'>" + i18n[lang].scheduled + "</li></a>";
                } else {
                    tag_item_menu = tag_item_menu + "<a href='/debate?t=scheduled" + query_mt + "'><li class='tag-item small-size'>" + i18n[lang].scheduled + "</li></a>";
                }
                if (agenda_menu === "finished") {
                    tag_item_menu = tag_item_menu + "<a href='/debate?t=finished" + query_mt + "'><li class='tag-item small-size selected'>" + i18n[lang].finished + "</li></a>";
                } else {
                    tag_item_menu = tag_item_menu + "<a href='/debate?t=finished" + query_mt + "'><li class='tag-item small-size'>" + i18n[lang].finished + "</li></a>";
                }
                if (agenda_menu === "unlimited") {
                    tag_item_menu = tag_item_menu + "<a href='/debate?t=unlimited" + query_mt + "'><li class='tag-item small-size selected'>" + i18n[lang].unlimited + "</li></a>";
                } else {
                    tag_item_menu = tag_item_menu + "<a href='/debate?t=unlimited" + query_mt + "'><li class='tag-item small-size'>" + i18n[lang].unlimited + "</li></a>";
                }
                if (article_mt !== undefined) {
                    query_mt = "?mt=" + article_mt;
                } else {
                    query_mt = "";
                }
                /* tag_item_menu = tag_item_menu + "<a href='/opinion" + query_mt + "'><li class='tag-item'>" + i18n[lang].opinion + "</li></a>"; */
            } else {
                $('.tag-menu-item-top-wrapper').empty();
                $('.tag-menu-item-bottom-wrapper').empty();
                return false;
            }
            /*
             else if (window.location.pathname === '/opinion') {
             tag_item_menu = tag_item_menu + "<a href='/agenda" + query_mt + "'><li class='tag-item'>" + i18n[lang].agenda + "</li></a>";
             if (article_mt !== undefined) {
             query_mt = "&mt=" + article_mt;
             } else {
             query_mt = "";
             }
             tag_item_menu = tag_item_menu + "<a href='/agenda?t=in-progress" + query_mt + "'><li class='tag-item small-size'>" + i18n[lang].in_progress + "</li></a>";
             tag_item_menu = tag_item_menu + "<a href='/agenda?t=scheduled" + query_mt + "'><li class='tag-item small-size'>" + i18n[lang].scheduled + "</li></a>";
             tag_item_menu = tag_item_menu + "<a href='/agenda?t=finished" + query_mt + "'><li class='tag-item small-size'>" + i18n[lang].finished + "</li></a>";
             tag_item_menu = tag_item_menu + "<a href='/agenda?t=unlimited" + query_mt + "'><li class='tag-item small-size'>" + i18n[lang].unlimited + "</li></a>";
             if (article_mt !== undefined) {
             query_mt = "?mt=" + article_mt;
             } else {
             query_mt = "";
             }
             tag_item_menu = tag_item_menu + "<a href='/opinion" + query_mt + "'><li class='tag-item selected'>" + i18n[lang].opinion + "</li></a>";
             } else if (window.location.pathname === '/debate') {
             tag_item_menu = tag_item_menu + "<a href='/agenda" + query_mt + "'><li class='tag-item'>" + i18n[lang].agenda + "</li></a>";
             if (article_mt !== undefined) {
             query_mt = "&mt=" + article_mt;
             } else {
             query_mt = "";
             }
             tag_item_menu = tag_item_menu + "<a href='/agenda?t=in-progress" + query_mt + "'><li class='tag-item small-size'>" + i18n[lang].in_progress + "</li></a>";
             tag_item_menu = tag_item_menu + "<a href='/agenda?t=scheduled" + query_mt + "'><li class='tag-item small-size'>" + i18n[lang].scheduled + "</li></a>";
             tag_item_menu = tag_item_menu + "<a href='/agenda?t=finished" + query_mt + "'><li class='tag-item small-size'>" + i18n[lang].finished + "</li></a>";
             tag_item_menu = tag_item_menu + "<a href='/agenda?t=unlimited" + query_mt + "'><li class='tag-item small-size'>" + i18n[lang].unlimited + "</li></a>";
             if (article_mt !== undefined) {
             query_mt = "?mt=" + article_mt;
             } else {
             query_mt = "";
             }
             tag_item_menu = tag_item_menu + "<a href='/opinion" + query_mt + "'><li class='tag-item'>" + i18n[lang].opinion + "</li></a>";
             }
            */
            $('.tag-menu-item-top-wrapper').empty().append(tag_item_menu);
            $('.tag-menu-item-bottom-wrapper').empty().append(li_list);
            var is_selected = false, total_width = 0;
            $.each($('ul.tag-menu-item-top-wrapper .tag-item'), function (i, e) {
                if ($(this).hasClass('selected') === true) {
                    is_selected = true;
                } else {
                    if (is_selected === false) {
                        total_width = total_width + $(this).width() + 20;
                    } else {
                    }
                }
            });
            $('ul.tag-menu-item-top-wrapper').scrollLeft(total_width);
            if ($('ul.tag-menu-item-bottom-wrapper .tag-item.selected').length > 0) {
                is_selected = false;
                total_width = 0;
                $.each($('ul.tag-menu-item-bottom-wrapper .tag-item'), function (i, e) {
                    if ($(this).hasClass('selected') === true) {
                        is_selected = true;
                    } else {
                        if (is_selected === false) {
                            total_width = total_width + $(this).width() + 20;
                        } else {
                        }
                    }
                });
                $('ul.tag-menu-item-bottom-wrapper').scrollLeft(total_width);
            }
        }
    };
    f_cb = function () {};
    methods["the_world"]["is_one"]({
        show_animation: false,
        data:{},
        pathname:"/get/main-tags",
        s_cb:s_cb,
        f_cb:f_cb
    });
};
var article_mt = undefined;
$(document).ready(function() {
    current_search_input = $('#search #search-input').val();
    var search = window.location.search;
    search = search.substring(1, search.length);
    var search_list = search.split('&')
        , key
        , value
        , mt = undefined;
    for (var i = 0; i < search_list.length; i++) {
        key = search_list[i].split('=')[0];
        value = search_list[i].split('=')[1];
        if (key === 'mt') {
            mt = value;
        }
    }
    if (mt !== undefined) {
        article_mt = decodeURIComponent(mt);
    }
    $(document).on('submit', 'form#search', function (e) {
        e.preventDefault();
        var text = $('#search-input').val()
            , w = $("body").attr("data-w")
            , pathname;
        pathname = '/search?w=' + w + '&q=' + encode_for_url(text);
        window.location = pathname;
        return false;
    });
    $(document).on('click', '#search-submit', function (e) {
        e.preventDefault();
        var text = $('#search-input').val()
            , w = $("body").attr("data-w")
            , pathname;
        pathname = '/search?w=' + w + '&q=' + encode_for_url(text);
        window.location = pathname;
        return false;
    });
    $(document).on('focus', '#search #search-input', function (e) {
        if ( $('.autocomplete-item').length > 0 ) {
            $('#autocomplete-tags-wrapper').css('display', 'block');
        }
    });
    /*$(document).on('mousedown', '.autocomplete-item', function (e) {
        e.preventDefault();
        var text = $(e.currentTarget).text()
            , w = $("body").attr("data-w")
            , pathname;
        pathname = '/search?w=' + w + '&q=' + encode_for_url(text);
        window.location = pathname;
        return false;
    });*/
    // $(document).on('click', '.autocomplete-item', function (e) {
    //     e.preventDefault();
    //     var text = $(e.currentTarget).text()
    //         , w = $("body").attr("data-w")
    //         , pathname;
    //     pathname = '/search?w=' + w + '&q=' + encode_for_url(text);
    //     window.location = pathname;
    //     return false;
    // });
    $(document).on('blur', '#search #search-input', function (e) {
        setTimeout(function () {
                $('#autocomplete-tags-wrapper').css('display', 'none');
        }, 500);
    });
    var search_keyup_preventer = false;
    $(document).on("keyup", '#search #search-input', function(e){
        var $current_selected_item = $('.autocomplete-item.selected');
        if (e.keyCode === 38) {
            search_keyup_preventer = false;
            e.preventDefault();
            if ($('.autocomplete-item').length > 0) {
                if ( $current_selected_item.length > 0 ) {
                    $current_selected_item.removeClass('selected');
                    if ($current_selected_item.prev('.autocomplete-item').length > 0) {
                        $current_selected_item.prev('.autocomplete-item').addClass('selected');
                        $('#search #search-input').val( $current_selected_item.prev('.autocomplete-item').text() );
                        $('#autocomplete-tags').scrollTop( $('#autocomplete-tags').scrollTop() - ($($('.autocomplete-item')[0]).height() + 10));
                    } else {
                        $('#search #search-input').val(current_search_input);
                        $('#autocomplete-tags').scrollTop(0);
                        $('#autocomplete-tags-wrapper').css('display', 'none');
                    }
                }
            }
        } else if (e.keyCode === 40) {
            if (search_keyup_preventer === true) {
                return false;
            }
            e.preventDefault();
            if ($('.autocomplete-item').length > 0) {
                search_keyup_preventer = true;
                $('#autocomplete-tags-wrapper').css('display', 'block');
                if ( $current_selected_item.length > 0 ) {
                    $current_selected_item.removeClass('selected');
                    if ($current_selected_item.next('.autocomplete-item').length > 0) {
                        $current_selected_item.next('.autocomplete-item').addClass('selected');
                        $('#search #search-input').val( $current_selected_item.next('.autocomplete-item').text() );
                        $('#autocomplete-tags').scrollTop( $('#autocomplete-tags').scrollTop() + ($($('.autocomplete-item')[0]).height() + 10));
                    } else {
                        $('#search #search-input').val(current_search_input);
                        $('#autocomplete-tags').scrollTop(0);
                        $('#autocomplete-tags-wrapper').css('display', 'none');
                    }
                    search_keyup_preventer = false;
                } else {
                    setTimeout(function () {
                        search_keyup_preventer = false;
                    }, 180);
                    $('#search #search-input').val( $('.autocomplete-item:first').text() );
                    $('.autocomplete-item:first').addClass('selected');
                }
            }
        } else {
            current_search_input = $('#search #search-input').val();
            var s_cb = function (result) {
                if ( result['response'] === true ) {
                    var final = ""
                        , w = $("body").attr("data-w")
                        , text
                        , temp = ""
                        , pathname;
                    for (var i = 0; i < result.docs.length; i++) {
                        /* temp = "<div class='autocomplete-item'>" + get_encoded_html_preventing_xss(result.docs[i]) + "</div>"; */
                        text = get_encoded_html_preventing_xss(result.docs[i]);
                        pathname = '/search?w=' + w + '&q=' + encode_for_url(text);
                        temp = "<a class='autocomplete-item' href='" + pathname + "'>" + text + "</a>";
                        final = final + temp;
                    }
                    $('#autocomplete-tags-wrapper').css('display', 'block');
                    $('#autocomplete-tags').empty().append(final).scrollTop(0);
                } else {
                    if (result["msg"] === "no_blog_id") {
                        return window.location = "/set/blog-id";
                    } else {
                        $('#autocomplete-tags-wrapper').css('display', 'none');
                        $('#autocomplete-tags').empty();
                    }
                }
            };
            var f_cb = function () {
                $('#autocomplete-tags-wrapper').css('display', 'none');
                $('#autocomplete-tags').empty();
            };
            methods["the_world"]["is_one"]({
                show_animation: false,
                data:{text:encodeURIComponent(current_search_input)},
                pathname:"/autocomplete",
                s_cb:s_cb,
                f_cb:f_cb
            });
        }
        return false;
    });
    $(document).on('mouseenter', '#search #search-input', function (e) {
        var $wrapper1  = $('#search #search-right')
            , $wrapper2  = $('#search #search-middle #search-input');
            $wrapper2.css('border-image', '-webkit-linear-gradient(to left, #f5c647, #f90101, #f5c647, #00ad45, #5a00e0) 10');
            $wrapper2.css('border-image', '-moz-linear-gradient(to left, #f5c647, #f90101, #f5c647, #00ad45, #5a00e0) 10');
            $wrapper2.css('border-image', '-ms-linear-gradient(to left, #f5c647, #f90101, #f5c647, #00ad45, #5a00e0) 10');
            $wrapper2.css('border-image', '-o-linear-gradient(to left, #f5c647, #f90101, #f5c647, #00ad45, #5a00e0) 10');
            $wrapper2.css('border-image', 'linear-gradient(to left, #f5c647, #f90101, #f5c647, #00ad45, #5a00e0) 10');
    });
    $(document).on('mouseleave', '#search #search-input', function (e) {
            var $wrapper1  = $('#search #search-right')
                , $wrapper2  = $('#search #search-middle #search-input');
            $wrapper2.css('border-image', '-webkit-linear-gradient(to right, #f5c647, #f5c647) 10');
            $wrapper2.css('border-image', '-moz-linear-gradient(to right, #f5c647, #f5c647) 10');
            $wrapper2.css('border-image', '-ms-linear-gradient(to right, #f5c647, #f5c647) 10');
            $wrapper2.css('border-image', '-o-linear-gradient(to right, #f5c647, #f5c647) 10');
            $wrapper2.css('border-image', 'linear-gradient(to right, #f5c647, #f5c647) 10');
    });
    var best_top_10_index = 1;
    var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    var init_today_best_top_10 = function () {
        li_list="";
        s_cb = function (result) {
            var popular_tags = result["keywords"]
                , a, div, span, span2, span3, a_list=""
                , a2, div2, a_list2=""
                , up_count = "NEW"
                , now = new Date().valueOf();
            if (popular_tags !== null && popular_tags && popular_tags.length !== 0) {
                for (var i = 0; i < popular_tags.length; i++) {
                    if ((now - popular_tags[i].created_at) >= 3600000) {
                        popular_tags[i].current = Math.floor(popular_tags[i].current / 10);
                        if (popular_tags[i].current === 0) {
                            up_count = "";
                        } else {
                            up_count = "↑" + popular_tags[i].current;
                        }
                    }
                    span = "<span>" + get_encoded_html_preventing_xss(popular_tags[i].key) + "</span>";
                    if (up_count === "NEW") {
                        span3 = "<span class='today-best-up-count new-keyword'>" + up_count + "</span>";
                    } else {
                        span3 = "<span class='today-best-up-count'>" + up_count + "</span>";
                    }
                    if (i === 0) {
                        span2 = "<span class='best-index best-of-best'>" + (i+1) + "</span>";
                        div = "<div class='best-hidden-item'>" + span3 + span2 + span + "</div>";
                        div2 = "<div class='best-hidden-item'>" + span3 + span2 + span + "</div>";
                        a = "<a class='today-best-text-0 selected' href='/search?w=tot&q=" + encode_for_url(popular_tags[i].key) + "'>" + div + "</a>";
                        a2 = "<a class='today-best-text-0' href='/search?w=tot&q=" + encode_for_url(popular_tags[i].key) + "'>" + div2 + "</a>";
                    } else {
                        span2 = "<span class='best-index'>" + (i+1) + "</span>";
                        div = "<div class='best-hidden-item'>" + span3 + span2 + span + "</div>";
                        div2 = "<div class='best-hidden-item'>" + span3 + span2 + span + "</div>";
                        a = "<a class='today-best-text-" + i + "' href='/search?w=tot&q=" + encode_for_url(popular_tags[i].key) + "'>" + div + "</a>";
                        a2 = "<a class='today-best-text-" + i + "' href='/search?w=tot&q=" + encode_for_url(popular_tags[i].key) + "'>" + div2 + "</a>";
                    }
                    a_list = a_list + a;
                    a_list2 = a_list2 + a2;
                }
                $(".today-best-top-10-list").empty().append(a_list);
                $(".today-best-top-10-hidden-list").empty().append(a_list2);
                $(".today-best-top-10-hidden .best-bottom span").text(to_i18n_fixed_datetime(undefined));
                if (popular_tags.length > 1) {
                    setInterval(function () {
                        $(".today-best-top-10-list a.selected").removeClass('selected');
                        $(".today-best-top-10-list a.today-best-text-" + best_top_10_index).addClass("animated bounceInRight selected").one(animationEnd, function () {
                            $(this).removeClass('animated bounceInRight');
                        });
                        if (best_top_10_index !== (popular_tags.length-1)) {
                            best_top_10_index = best_top_10_index + 1;
                        } else {
                            best_top_10_index = 0;
                        }
                    }, 2500);
                }
            } else {
                $(".today-best-top-10-hidden .best-bottom span").text(to_i18n_fixed_datetime(undefined));
            }
        };
        f_cb = function () {};
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:{},
            pathname:"/get/realtime-popular-keywords",
            s_cb:s_cb,
            f_cb:f_cb
        });
    };
    if ($(".today-best-top-10").length > 0) {
        init_today_best_top_10();
    }
    init_main_tag();
});