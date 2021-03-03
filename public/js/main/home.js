$(document).ready(function() {
    if (is_mobile() === false) {
        $("#search-input").focus();
    }
    if (SpeechSynthesisUtterance) {
        //$('#gleant-home-introduction').trigger('click');
    }
    var flexible_advertisement_height = function () {
        var window_width = $(window).width();
        var main_advertisement_width = $('#home-advertisement-first img').width();
        if (main_advertisement_width <= 0) {
            main_advertisement_width = 0;
        }
        if (main_advertisement_width === 480) {
            $(".home-big-advertisement").css('height', '120px');

            if (window_width < 500) {
                $(".home-content-middle").css('height', '150px');
            } else {
                $(".home-content-middle").css('height', '150px');
            }
        } else {
            if (main_advertisement_width <= 0) {
                if (window_width < 500) {
                    main_advertisement_width = window_width - 20;
                    $(".home-big-advertisement").css('height', Math.round((120 * main_advertisement_width) / 480) + 'px');
                    $(".home-content-middle").css('height', Math.round((150 * main_advertisement_width) / 480) + 'px');
                } else {
                    $(".home-big-advertisement").css('height', '120px');
                    $(".home-content-middle").css('height', '150px');
                }
            } else {
                if (window_width < 500) {
                    main_advertisement_width = window_width - 20;
                    $(".home-big-advertisement").css('height', Math.round((120 * main_advertisement_width) / 480) + 'px');
                    $(".home-content-middle").css('height', Math.round((150 * main_advertisement_width) / 480) + 'px');
                } else {
                    $(".home-big-advertisement").css('height', '120px');
                    $(".home-content-middle").css('height', '150px');
                }
            }
        }
        if ($($('.home-content-user-middle')[0]).length > 0) {
            $('.home-content-user-middle').css("height", $($('.home-content-user-middle')[0]).width() + "px");
        }
    };
    flexible_advertisement_height();
    $(window).resize(function () {
        flexible_advertisement_height();
    });
    /*if (cookie && cookie.get_cookie("dont_show_notice") !== "true") {
        modal(".prompt#notice-prompt", "open");
    }*/
    $(".prompt#notice-prompt").on("click", ".close", function (e) {
        e.preventDefault();
        modal(".prompt#notice-prompt", "close");
        return false;
    });
    $(document).on("change", "input[type='checkbox']#dont-show-notice", function (e) {
        if ($(e.currentTarget).is(":checked") === true) {
            cookie.set_cookie('dont_show_notice', true, 1);
            modal('.prompt#notice-prompt', 'close');
        }
    });
});