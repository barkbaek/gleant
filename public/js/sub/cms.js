$(document).ready(function() {
    if ( $("#cms-menu").length > 0 ) {
        var is_selected = false, total_width = 0;
        $.each($('#cms-menu ul li'), function (i, e) {
            if ($(this).hasClass('selected') === true) {
                is_selected = true;
            } else {
                if (is_selected === false) {
                    total_width = total_width + $(this).width() + 20;
                } else {
                }
            }
        });
        $('#cms-menu ul').scrollLeft(total_width);
        $("#cms-menu").height($("#cms-menu ul").height() + "px");
        $(window).resize(function () {
            $("#cms-menu").height($("#cms-menu ul").height() + "px");
        });
    }
    if ( $("#cms-sub-menu").length > 0 ) {
        var is_selected2 = false, total_width2 = 0;
        $.each($('#cms-sub-menu ul li'), function (i, e) {
            if ($(this).hasClass('selected') === true) {
                is_selected2 = true;
            } else {
                if (is_selected2 === false) {
                    total_width2 = total_width2 + $(this).width() + 20;
                } else {
                }
            }
        });
        $('#cms-sub-menu ul').scrollLeft(total_width2);
        $("#cms-sub-menu").height($("#cms-sub-menu ul").height() + "px");
        $(window).resize(function () {
            $("#cms-sub-menu").height($("#cms-sub-menu ul").height() + "px");
        });
    }
    if ( $("#cms-sub-menu2").length > 0 ) {
        var is_selected3 = false, total_width3 = 0;
        $.each($('#cms-sub-menu2 ul li'), function (i, e) {
            if ($(this).hasClass('selected') === true) {
                is_selected3 = true;
            } else {
                if (is_selected3 === false) {
                    total_width3 = total_width3 + $(this).width() + 20;
                } else {
                }
            }
        });
        $('#cms-sub-menu2 ul').scrollLeft(total_width3);
        $("#cms-sub-menu2").height($("#cms-sub-menu2 ul").height() + "px");
        $(window).resize(function () {
            $("#cms-sub-menu2").height($("#cms-sub-menu2 ul").height() + "px");
        });
    }

});