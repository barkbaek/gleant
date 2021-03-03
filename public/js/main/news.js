$(document).ready(function() {
    $("#news-menu").height($("#news-menu ul").height() + "px");
    $(window).resize(function () {
        $("#news-menu").height($("#news-menu ul").height() + "px");
    });
    var is_selected = false, total_width = 0;
    $.each($('#news-menu ul li'), function (i, e) {
        if ($(this).hasClass('selected') === true) {
            is_selected = true;
        } else {
            if (is_selected === false) {
                total_width = total_width + $(this).width() + 20;
            } else {
            }
        }
    });
    $('#news-menu ul').scrollLeft(total_width);
    $(document).on('mouseenter', '.top-news-most-read-menu-item', function (e) {
        if (is_mobile() === false) {
            e.preventDefault();
            if ($(e.currentTarget).hasClass("top-news-most-read-news-menu-item") === true) {
                $(".top-news-most-read-menu-item").removeClass("selected");
                $(".top-news-most-read-news-menu-item").addClass("selected");
                $("ul.top-news-most-read-list").css("display", "block");
                $("ul.top-sports-most-read-list").css("display", "none");
            } else {
                $(".top-news-most-read-menu-item").removeClass("selected");
                $(".top-news-most-read-sports-menu-item").addClass("selected");
                $("ul.top-news-most-read-list").css("display", "none");
                $("ul.top-sports-most-read-list").css("display", "block");
            }
            return false;
        }
    });
    $(document).on('click', '.top-news-most-read-menu-item', function (e) {
        e.preventDefault();
        if ($(e.currentTarget).hasClass("top-news-most-read-news-menu-item") === true) {
            $(".top-news-most-read-menu-item").removeClass("selected");
            $(".top-news-most-read-news-menu-item").addClass("selected");
            $("ul.top-news-most-read-list").css("display", "block");
            $("ul.top-sports-most-read-list").css("display", "none");
        } else {
            $(".top-news-most-read-menu-item").removeClass("selected");
            $(".top-news-most-read-sports-menu-item").addClass("selected");
            $("ul.top-news-most-read-list").css("display", "none");
            $("ul.top-sports-most-read-list").css("display", "block");
        }
        return false;
    });
    $(document).on('mouseenter', '.top-news-many-comments-menu-item', function (e) {
        if (is_mobile() === false) {
            e.preventDefault();
            if ($(e.currentTarget).hasClass("top-news-many-comments-news-menu-item") === true) {
                $(".top-news-many-comments-menu-item").removeClass("selected");
                $(".top-news-many-comments-news-menu-item").addClass("selected");
                $("ul.top-news-many-comments-list").css("display", "block");
                $("ul.top-sports-many-comments-list").css("display", "none");
            } else {
                $(".top-news-many-comments-menu-item").removeClass("selected");
                $(".top-news-many-comments-sports-menu-item").addClass("selected");
                $("ul.top-news-many-comments-list").css("display", "none");
                $("ul.top-sports-many-comments-list").css("display", "block");
            }
            return false;
        }
    });
    $(document).on('click', '.top-news-many-comments-menu-item', function (e) {
        e.preventDefault();
        if ($(e.currentTarget).hasClass("top-news-many-comments-news-menu-item") === true) {
            $(".top-news-many-comments-menu-item").removeClass("selected");
            $(".top-news-many-comments-news-menu-item").addClass("selected");
            $("ul.top-news-many-comments-list").css("display", "block");
            $("ul.top-sports-many-comments-list").css("display", "none");
        } else {
            $(".top-news-many-comments-menu-item").removeClass("selected");
            $(".top-news-many-comments-sports-menu-item").addClass("selected");
            $("ul.top-news-many-comments-list").css("display", "none");
            $("ul.top-sports-many-comments-list").css("display", "block");
        }
        return false;
    });
    var search = window.location.search;
    if (window.location.pathname === "/news") {
        if (search.indexOf("?category=") > -1) {
            search = search.replace("?category=", "");
            if (
                search === "entertainment" ||
                search === "sports"
            ) {
                $(".top-news-most-read-menu-item").removeClass("selected");
                $(".top-news-most-read-sports-menu-item").addClass("selected");
                $("ul.top-news-most-read-list").css("display", "none");
                $("ul.top-sports-most-read-list").css("display", "block");
                $(".top-news-many-comments-menu-item").removeClass("selected");
                $(".top-news-many-comments-sports-menu-item").addClass("selected");
                $("ul.top-news-many-comments-list").css("display", "none");
                $("ul.top-sports-many-comments-list").css("display", "block");
            } else {
                $(".top-news-most-read-menu-item").removeClass("selected");
                $(".top-news-most-read-news-menu-item").addClass("selected");
                $("ul.top-news-most-read-list").css("display", "block");
                $("ul.top-sports-most-read-list").css("display", "none");
                $(".top-news-many-comments-menu-item").removeClass("selected");
                $(".top-news-many-comments-news-menu-item").addClass("selected");
                $("ul.top-news-many-comments-list").css("display", "block");
                $("ul.top-sports-many-comments-list").css("display", "none");
            }
        } else {
            $(".top-news-most-read-menu-item").removeClass("selected");
            $(".top-news-most-read-news-menu-item").addClass("selected");
            $("ul.top-news-most-read-list").css("display", "block");
            $("ul.top-sports-most-read-list").css("display", "none");
            $(".top-news-many-comments-menu-item").removeClass("selected");
            $(".top-news-many-comments-news-menu-item").addClass("selected");
            $("ul.top-news-many-comments-list").css("display", "block");
            $("ul.top-sports-many-comments-list").css("display", "none");
        }
    }
});