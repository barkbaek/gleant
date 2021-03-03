$(document).ready(function () {
    $('.news-created-at').each(function () {
        var datetime = $(this).attr('data-datetime');
        if (datetime !== undefined) {
            datetime = parseInt(datetime);
            $(this).text(to_i18n_datetime(new Date(datetime)));
        }
    });
    $(document).on("keyup", "input[type='text'].index-news-tags", function (e) {
        if (is_ie() === false) {
            var text = $(e.currentTarget).val().replace(/\s+/gi, '').toLowerCase();
            $(e.currentTarget).val(text);
        }
    });
    $(document).on("click", ".index-news-submit", function (e) {
        e.preventDefault();
        var $form = $(e.currentTarget).parent().parent()
            , _id = $form.attr("data-id")
            , $wrapper = $form.parent()
            , temp_tags
            , tags = []
            , data = {}
            , count
            , s_cb
            , f_cb
            , action = $("body").attr("data-action");
        temp_tags = $form.find(".index-news-tags").val();
        if (temp_tags && temp_tags !== "") {
            temp_tags = temp_tags.split('#');
        } else {
            temp_tags = [];
        }
        for (var i = 0; i < temp_tags.length; i++) {
            temp_tags[i] = temp_tags[i].trim().replace(/\s\s+/gi, '').toLowerCase();
        }
        for (var i = 1; i < temp_tags.length; i++) {
            if (temp_tags[i] !== "") {
                tags.push(temp_tags[i]);
            }
        }
        if (tags.length === 0) {
            show_bert("danger", 3000, "Please enter tags..");
            return false;
        }
        s_cb = function (result) {
            if (result.response === true) {
                $wrapper.remove();
                count = parseInt($(".total-news-list:first").attr("data-count"));
                count = count - 1;
                $(".total-news-list:first").attr("data-count", count).text("(" + count + ")");
            } else {
                show_bert("danger", 3000, "The news tag is already set.");
            }
        };
        f_cb = function () {};
        data.type = encodeURIComponent("news");
        data._id = encodeURIComponent(_id);
        data.tags = encodeURIComponent(JSON.stringify(tags));
        data.action = encodeURIComponent(action);
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:'/index/news-tags',
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
});