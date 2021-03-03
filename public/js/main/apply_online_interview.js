$(document).ready(function() {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (is_mobile() === false && $("#search-input").length > 0) {
        $("#search-input").focus();
    }
    $(window).resize(function () {});
    $(document).on("focus", ".apply-online-interview-textarea", function (e) {
        $(e.currentTarget).parent().css('border-color', '#5a00e0');
    });
    $(document).on("blur", ".apply-online-interview-textarea", function (e) {
        $(e.currentTarget).parent().css('border-color', '#ebebeb');
    });
    $(document).on("keyup", '.apply-online-interview-textarea', function(e){
        var $wrapper = $(e.currentTarget).parent().parent();
        var content = $wrapper.find(".apply-online-interview-textarea:first").val();
        var $answer_maximum_length = $wrapper.find(".answer-maximum-length:first");
        var max_length = parseInt($answer_maximum_length.attr("data-max-length"));

        $answer_maximum_length.text(content.length + " / " + max_length);

        if (content.length === 0) {
            $answer_maximum_length.removeClass("red").removeClass("green");
        } else {
            if (max_length < content.length) {
                $answer_maximum_length.removeClass("green").addClass("red");
            } else {
                $answer_maximum_length.removeClass("red").addClass("green");
            }
        }
    });
    var answers = [];
    $(document).on("click", ".apply-online-interview-submit", function (e) {
        e.preventDefault();
        var _id
            , close_submit = false
            , name
            , type
            , answer
            , current_length
            , max_length;
        answers = [];
        $.each($('.apply-online-interview-question-item'), function (i, e) {
            _id = $(this).attr("data-id");
            type = $(this).attr("data-type");
            if (type === "short-answer") {
                answer = $(this).find(".apply-online-interview-textarea:first").val();
                current_length = answer.length;
                max_length = parseInt($(this).find(".answer-maximum-length:first").attr("data-max-length"));
                if (current_length > max_length) {
                    show_bert("danger", 3000, i18n[lang].question + " " + (i + 1) + ". " + i18n[lang].answer_is_too_long );
                    close_submit = true;
                    return false;
                }
                answers.push({
                    _id: _id
                    , type: "short_answer"
                    , answer: answer
                });
            } else if (type === "multiple-choice") {
                name = $(this).attr("data-name");
                answer = $(this).find("input[name=" + name + "]:checked");
                if ( answer.length < 1 ) {
                    show_bert("danger", 3000, i18n[lang].question + " " + (i + 1) + ". " + i18n[lang].please_select_answer );
                    close_submit = true;
                    return false;
                }
                answer = answer.attr("data-id");
                answers.push({
                    _id: _id
                    , type: "multiple_choice"
                    , answer: answer
                });
            }
        });
        if (close_submit === true) {
            return false;
        } else {
            modal('.prompt#reask-applying-online-interview', 'open');
            return false;
        }
    });
    $(document).on("click", ".cancel-apply-online-interview-submit, .prompt#reask-applying-online-interview .close", function (e) {
        e.preventDefault();
        modal('.prompt#reask-applying-online-interview', 'close');
        return false;
    });
    $(document).on("click", ".surely-apply-online-interview-submit", function (e) {
        e.preventDefault();
        modal('.prompt#reask-applying-online-interview', 'close');
        var pathname = window.location.pathname
            , temp = pathname.split('/')
            , article_id = temp[2]
            , data = {};
        data.article_id = encodeURIComponent(article_id);
        data.answers = encodeURIComponent(JSON.stringify(answers));
        var s_cb = function (result) {
            if (result.response === true) {
                window.location = "/success/apply-online-interview/" + article_id;
            } else {
                return show_bert("danger", 3000, i18n[lang].unable_to_apply_now);
            }
        };
        var f_cb = function () { return show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/apply/online-interview",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
});