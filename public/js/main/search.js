$(document).ready(function() {
    if (is_mobile() === false) {
        $("#search-input").focus();
    }
    var is_selected = false, total_width = 0;
    $.each($('#search-menu ul li'), function (i, e) {
        if ($(this).hasClass('selected') === true) {
            is_selected = true;
        } else {
            if (is_selected === false) {
                total_width = total_width + $(this).width() + 20;
            } else {
            }
        }
    });
    $('#search-menu ul').scrollLeft(total_width);
    var init_today_best_top_10 = function () {
        s_cb = function (result) {
            var popular_tags = result["keywords"]
                , span, span2, span3
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
                        div2 = "<div class='best-hidden-item'>" + span3  + span2 + span + "</div>";
                        a2 = "<a class='today-best-text-0' href='/search?w=tot&q=" + encode_for_url(popular_tags[i].key) + "'>" + div2 + "</a>";
                    } else {
                        span2 = "<span class='best-index'>" + (i+1) + "</span>";
                        div2 = "<div class='best-hidden-item'>" + span3 + span2 + span + "</div>";
                        a2 = "<a class='today-best-text-" + i + "' href='/search?w=tot&q=" + encode_for_url(popular_tags[i].key) + "'>" + div2 + "</a>";
                    }
                    a_list2 = a_list2 + a2;
                }
                $(".today-best-top-10-fixed-list").empty().append(a_list2);
                $(".best-bottom span").text(to_i18n_fixed_datetime(undefined));
            } else {
                $(".best-bottom span").text(to_i18n_fixed_datetime(undefined));
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
    init_today_best_top_10();
    $('.search-user-birth-date').each(function () {
        var year = parseInt($(this).attr('data-year'));
        var month = parseInt($(this).attr('data-month'));
        var date = parseInt($(this).attr('data-date'));
        $(this).text(get_i18n_year_month_date({year: year, month: month, date: date}));
    });
    if ($('#image-list').length > 0 && $(".search-image-item").length > 0) {
        if (search_image_item && search_image_item.init) {
            search_image_item.init();
        }
    }
    $("#search-menu").height($("#search-menu ul").height() + "px");
    $(window).resize(function () {
        $("#search-menu").height($("#search-menu ul").height() + "px");
    });
});