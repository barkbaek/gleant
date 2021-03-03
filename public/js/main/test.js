$(document).ready(function() {
    /* 1. facebook */
    $(document).on("click", "#btn-facebook-login", function (e) {
        e.preventDefault();
        facebook.go("login");
        return false;
    });

    /* 1-2. Facebook share */
    $(document).on("click", "#btn-facebook-share", function (e) {
        e.preventDefault();

        var date = new Date();

        share["link"] = "https://www.gleant.com";
        share["title"] = "Title " + date;
        share["description"] = "Description " + date;

        facebook.share(e);
        return false;
    });

    $(document).on("click", "#btn-kakao-login", function (e) {
        e.preventDefault();
        kakao.go("login");
        return false;
    });

    $(document).on("click", "#btn-kakaotalk-share", function (e) {
        e.preventDefault();

        var date = new Date();

        share["link"] = "https://www.gleant.com";
        share["title"] = "Title " + date;
        share["description"] = "Description " + date;

        kakao.share(e);
        return false;
    });

    /* 2-3. kakaostory share */
    $(document).on("click", "#btn-kakaostory-share", function (e) {
        e.preventDefault();

        var date = new Date();

        share["link"] = "https://www.gleant.com";
        share["title"] = "Title " + date;
        share["description"] = "Description " + date;

        kakaostory.share(e);
        return false;
    });

    /* 2-4. twitter share */
    $(document).on("click", "#btn-twitter-share", function (e) {
        e.preventDefault();

        var date = new Date();

        share["link"] = "https://www.gleant.com";
        share["title"] = "Title " + date;
        share["description"] = "Description " + date;

        twitter.share(e);
        return false;
    });

    /* request로 crawling */
    $(document).on("click", "#btn-crawl-site", function (e) {
        e.preventDefault();
        var link = $("#link-crawl-site").val();
        var s_cb = function (result) {
            show_bert("success", 2000, "Successfully crawled site - " + link);
            $("#link-crawl-site").val("");
        };
        var f_cb = function () {
            show_bert("danger", 2000, "Failed crawled site - " + link);
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:{link:encodeURIComponent(link)},
            pathname:"/crawl-site",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });

    /* 이미지 프로세싱 */
    $("#btn-resize-image").change(function (e) {
        var file = $('input[type=file]#btn-resize-image')[0].files[0];
        $("form#resize-image").trigger("submit");
    });

    /* Connect MongoDB */
    $(document).on("click", "#btn-connect-mongodb", function (e) {
        e.preventDefault();
        return false;
    });

    /* Connect ElasticSearch */
    $(document).on("click", "#btn-connect-elasticsearch", function (e) {
        e.preventDefault();
        return false;
    });

    /* Connect MariaDB */
    $(document).on("click", "#btn-connect-mariadb", function (e) {
        e.preventDefault();
        return false;
    });

    /*  */
});