$(document).ready(function() {
    $(document).on("click", "#gleant-announcement-more", function (e) {
        e.preventDefault();
        var lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        var data = {}
            , temp
            , final = ""
            , announcements;
        data["created_at"] = parseInt($('#gleant-announcement-list .gleant-announcement:last-child').attr('data-created-at'));
        data["created_at"] = encodeURIComponent(data["created_at"]);
        var s_cb = function (result) {
            if (result.response === true) {
                if (result.docs && result.docs.length > 0) {
                    announcements = result.docs;
                    for (var i = 0; i < announcements.length; i++) {
                        temp = {
                            _id: announcements[i]._id
                            , title: announcements[i].documents[lang].title
                            , content: announcements[i].documents[lang].content
                            , language: announcements[i].documents[lang].language
                            , created_at: announcements[i].created_at
                            , updated_at: announcements[i].updated_at
                        };
                        final = final + get["single"]["perfect"]["gleant_announcement"](lang, temp);
                    }
                    $('#gleant-announcement-list').append(final);
                }
                if (
                    result.docs === null ||
                    result.docs.length < limit.announcements
                ) {
                    $('#gleant-announcement-more').css("display", "none");
                }
            } else {
                $('#gleant-announcement-more').css("display", "none");
            }
        };
        var f_cb = function () { $('#gleant-announcement-more').css("display", "none"); };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/get/announcements",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
});