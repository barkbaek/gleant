var translation_writing = {};
translation_writing.divided_content = {};
translation_writing.divided_content.all = null;
translation_writing.divided_content.required = null;
translation_writing.divided_content.input = null;
translation_writing.current_info = null;
translation_writing.current_required_index = 0;
translation_writing.save_current_page = function () {
    var current_required_index = translation_writing.current_required_index;
    var current_original_obj = translation_writing.divided_content.required[current_required_index];
    if (
        current_original_obj.main_type === "title" ||
        current_original_obj.main_type === "tags"
    ) {
        translation_writing.divided_content.input[current_required_index].element = $("#moon .translation-input:first").val();
    } else if (
        current_original_obj.main_type === "content"
    ) {
        if (
            current_original_obj.sub_type === "text"
        ) {
            translation_writing.divided_content.input[current_required_index].element = CKEDITOR.instances['moon-editor'].getData().replace(/<p>/gi,'<div>').replace(/<\/p>/gi,'</div>').replace(/<div>/gi,'').replace(/<\/div>/gi,'<br />').replace(/<script>/gi,'').replace(/<\/script>/gi,'');
        } else if (
            current_original_obj.sub_type === "vote"
        ) {
            translation_writing.divided_content.input[current_required_index].question = $("#moon .translation-question:first").val();
            var choice_list = {};
            $("#moon .choice-input").each( function (i, e) {
                var _id = $(e).attr('data-id')
                    , value = $(e).val();
                choice_list[_id] = value;
            });
            for (var i = 0; i < translation_writing.divided_content.input[current_required_index].choice_list.length; i++) {
                translation_writing.divided_content.input[current_required_index].choice_list[i].choice = choice_list[ translation_writing.divided_content.input[current_required_index].choice_list[i]._id ];
            }
        }
    }
};
translation_writing.load_data_current_page = function () {
    var current_obj = translation_writing.divided_content.input[translation_writing.current_required_index];
    if (
        current_obj.main_type === "title" ||
        current_obj.main_type === "tags"
    ) {
         $("#moon .translation-input:first").val(current_obj.element);
    } else if (
        current_obj.main_type === "content"
    ) {
        if (
            current_obj.sub_type === "text"
        ) {
            CKEDITOR.instances['moon-editor'].setData(current_obj.element);
        } else if (
            current_obj.sub_type === "vote"
        ) {
             $("#moon .translation-question:first").val(current_obj.question);
            var choice_list = {};

            for (var i = 0; i < current_obj.choice_list.length; i++) {
                choice_list[ current_obj.choice_list[i]._id ] = current_obj.choice_list[i].choice;
            }

            $("#moon .choice-input").each( function (i, e) {
                var _id = $(e).attr('data-id');
                $(e).val(choice_list[_id]);
            });
        }
    }
};
translation_writing.get_title_and_content_of_original_and_translation = function (obj) {
    var lang = $("body").attr("data-lang")
        , original_title
        , translation_title
        , original_content
        , translation_content;
    if (lang === undefined) {
        lang = "en";
    }
    original_title = i18n[lang].original + " - " + i18n[lang][obj.main_type];
    translation_title  = i18n[lang].translation + " - " + i18n[lang][obj.main_type];
    if (obj.sub_type === "vote") {
        original_title = original_title + " - " + i18n[lang].vote;
        translation_title = translation_title + " - " + i18n[lang].vote;
    }
    if (obj.main_type === "title") {
        original_content = obj.element;
        translation_content = "<input class='translation-input' type='text'>";
    } else if (obj.main_type === "content") {
        if (obj.sub_type === "text") {
            original_content = obj.element;
            translation_content = "";
        } else if (obj.sub_type === "vote") {
            var question = "<div class='question'>" + obj.question + "</div>";
            var choice_list = ""
                , choice_item
                , choice_item_table
                , choice_index_wrapper
                , choice_index
                , choice
                , choice_div;
            for ( var i = 0; i < obj.choice_list.length; i++ ) {
                choice_index = "<div class='choice-index'>" + (i+1) + "</div>";
                choice_index_wrapper = "<div class='choice-index-wrapper'>" + choice_index + "</div>";
                choice_div = "<div style='width:100%;'>" + obj.choice_list[i].choice + "</div>";
                choice = "<div class='choice' data-id='" + obj.choice_list[i]._id + "'>" + choice_div + "</div>";
                choice_item_table = "<div class='choice-item-table'>" + choice_index_wrapper + choice + "</div>";
                choice_item = "<div class='choice-item'>" + choice_item_table + "</div>";
                choice_list = choice_list + choice_item;
            }
            original_content = question + choice_list;
            var translation_question = "<textarea class='translation-question' placeholder=''></textarea>";
            var translation_question_wrapper = "<div class='translation-question-wrapper'>" + translation_question + "</div>";
            choice_list = "";
            var choice_input
                , choice_input_wrapper
                , choices;
            for (var i = 0; i < obj.choice_list.length; i++) {
                choice_index = "<div class='choice-index'>" + (i+1) + "</div>";
                choice_input = "<input class='choice-input' type='text' data-id='" + obj.choice_list[i]._id + "'>";
                choice_input_wrapper = "<div class='choice-input-wrapper'>" + choice_input + "</div>";
                choice_item = "<div class='choice-item'>" + choice_index + choice_input_wrapper + "</div>";
                choice_list = choice_list + choice_item;
            }
            choices = "<div class='choices'>" + choice_list + "</div>";
            translation_content = "<div class='translation-vote'>" + translation_question_wrapper + choices + "</div>";
        } else {
            return false;
        }
    } else if (obj.main_type === "tags") {
        original_content = obj.element;
        translation_content = "<input class='translation-input' type='text'>";
    } else {
        return false;
    }
    return {
        original_title: original_title
        , translation_title: translation_title
        , original_content: original_content
        , translation_content: translation_content
    };
};
translation_writing.divided_content.init = function () {
    translation_writing.current_required_index = 0;
    if ( translation_writing.divided_content.all === null ) {
        return false;
    }
    var list = translation_writing.divided_content.all
        , temp
        , obj;
    translation_writing.divided_content.required = [];
    translation_writing.divided_content.input = [];
    for (var i = 0; i < list.length; i++) {
        obj = list[i];
        obj.index = i;
        if ( list[i].main_type === "title" ) {
            if (list[i].element !== "") {
                translation_writing.divided_content.required.push(obj);
                translation_writing.divided_content.input.push({
                    element: ""
                    , index: obj.index
                    , main_type: obj.main_type
                    , sub_type: obj.sub_type
                });
            } else {
                continue;
            }
        } else if ( list[i].main_type === "content" ) {
            if ( list[i].sub_type === "text" ) {
                temp = obj.element.replace(/<br>/gi, '').replace(/<br \/>/gi, '').replace(/​/gi, '').trim();
                if (
                    temp === "" ||
                    temp.length === 0
                ) {
                    continue;
                } else {
                    translation_writing.divided_content.required.push(obj);
                    translation_writing.divided_content.input.push({
                        element: ""
                        , index: obj.index
                        , main_type: obj.main_type
                        , sub_type: obj.sub_type
                    });
                }
            } else if ( list[i].sub_type === "vote" ) {
                if (
                    list[i].question !== undefined &&
                    list[i].choice_list !== undefined
                ) {
                    translation_writing.divided_content.required.push(obj);
                    var choice_list = [];
                    for (var j = 0; j < obj.choice_list.length; j++) {
                        choice_list.push({
                            choice: ""
                            , _id: obj.choice_list[j]._id
                        });
                    }
                    translation_writing.divided_content.input.push({
                        choice_list: choice_list
                        , index: obj.index
                        , main_type: obj.main_type
                        , sub_type: obj.sub_type
                        , question: ""
                        , src: obj.src
                        , _id: obj._id
                        , height: obj.height
                    });
                } else {
                    continue;
                }
            } else {
                continue;
            }
        } else if ( list[i].main_type === "tags" ) {
            if (list[i].element !== "") {
                translation_writing.divided_content.required.push(obj);
                translation_writing.divided_content.input.push({
                    element: ""
                    , index: obj.index
                    , main_type: obj.main_type
                    , sub_type: obj.sub_type
                });
            } else {
                continue;
            }
        } else {
            continue;
        }
    }
};
$(document).ready(function() {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    $(document).on('click', '.btn-write-translation', function (e) {
        e.preventDefault();
        return false;
        var is_loginned = $("body").attr("data-check") === "true"
            , lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version");
        if (is_loginned === false) {
            modal(".prompt#request-login-prompt", "open");
            return false;
        }
        var $current_wrapper = translation_menu_obj["$written"].find(".write-translation-wrapper:first")
            , type = translation_menu_obj["type"]
            , agenda_id = translation_menu_obj["agenda_id"]
            , _id = translation_menu_obj["_id"]
            , blog_id = translation_menu_obj["blog_id"]
            , data = {};
        translation_writing.current_info = {};
        translation_writing.current_info.type = type;
        translation_writing.current_info.agenda_id = agenda_id;
        translation_writing.current_info._id = _id;
        translation_writing.current_info.blog_id = blog_id;
        is_w_opinion_opened = false;
        $(".btn-opinion.ing-write img").attr("src", aws_s3_url + "/icons/write-opinion.png");
        $(".btn-opinion.ing-write").removeClass("selected").removeClass("ing-write");
        $(".btn-translation.ing-write img").attr("src", aws_s3_url + "/icons/write-translation.png");
        $(".btn-translation.ing-write").removeClass("selected").removeClass("ing-write");
        $(".write-opinion-wrapper").empty().removeClass("opened");
        $(".request-opinion-wrapper").empty().removeClass("opened");
        translation_menu_obj["$written"].find(".opinion-of-agenda:first").css("display", "none");
        translation_menu_obj["$written"].find(".opinion-list-of-agenda:first").empty();
        translation_menu_obj["$written"].find(".opinion-list-of-agenda-modal:first").empty();
        translation_menu_obj["$written"].find(".btn-opinion:first").removeClass("selected").removeClass("ing-view").removeClass("ing-write").removeClass("ing-request");
        translation_menu_obj["$written"].find(".btn-opinion:first img").attr("src", aws_s3_url + "/icons/write-opinion.png" + css_version);
        is_w_translation_opened = false;
        $(".write-translation-wrapper").empty().removeClass("opened");
        $(".request-translation-wrapper").empty().removeClass("opened");
        translation_menu_obj["$written"].find(".translation-list-wrapper:first").css("display", "none");
        translation_menu_obj["$written"].find(".translation-list:first").empty();
        translation_menu_obj["$written"].find(".btn-translation:first").removeClass("selected").removeClass("ing-view").removeClass("ing-write").removeClass("ing-request");
        translation_menu_obj["$written"].find(".btn-translation:first img").attr("src", aws_s3_url + "/icons/write-translation.png" + css_version);
        translation_menu_obj["$written"].find(".comments-wrapper.outer-comments:first").empty().removeClass("opened");
        translation_menu_obj["$written"].find(".btn-open-comments:first").removeClass("selected");
        translation_menu_obj["$written"].find(".btn-open-comments:first img").attr("src", aws_s3_url + "/icons/comments.png" + css_version);
        if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
            star_editor_focuser.blur();
        }
        if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
            moon_editor_focuser.blur();
        }
        if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
            write_form["rebuild_write_form_data_as_ground"]();
        }
        translation_menu_obj["$written"].find(".btn-translation:first").addClass("selected").addClass("ing-write");
        translation_menu_obj["$written"].find(".btn-translation:first img").attr("src", aws_s3_url + "/icons/write-translation-selected.png");
        modal(".prompt#translation-menu-prompt", "close");
        translation_writing.divided_content.all = null;
        translation_writing.divided_content.required = null;
        translation_writing.divided_content.input = null;
        translation_writing.current_required_index = 0;
        is_w_translation_opened = true;
        data["type"] = encodeURIComponent(type);
        data["_id"] = encodeURIComponent(_id);
        data["with_divided_contents"] = encodeURIComponent("true");
        if (type === 'agenda') {
        } else if (type === 'opinion') {
            data["agenda_id"] = encodeURIComponent(agenda_id);
        } else {
            is_w_translation_opened = false;
            if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                moon_editor_focuser.blur();
            }
            return false;
        }
        var s_cb = function (result) {
            if ( result['response'] === true ) {
                translation_writing.divided_content.all = result.divided_doc;
                translation_writing.divided_content.init();
                if (translation_writing.divided_content.required === null || translation_writing.divided_content.required.length === 0) {
                    is_w_translation_opened = false;
                    if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                        moon_editor_focuser.blur();
                    }
                    return false;
                }
                var language = $current_wrapper.attr('data-lang')
                    , written_language;
                if (language === "en") {
                    written_language = "english";
                } else if (language === "ja") {
                    written_language = "japanese";
                } else if (language === "ko") {
                    written_language = "korean";
                } else if (language === "zh-Hans") {
                    written_language = "simplified_chinese";
                } else {
                    written_language = "english";
                }
                var span1 = "<span>" + i18n[lang][written_language] + "</span>";
                var write_translation_select_language_list;
                if (language === "en") {
                    write_translation_select_language_list = "<option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
                } else if (language === "ja") {
                    write_translation_select_language_list =  "<option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
                } else if (language === "ko") {
                    write_translation_select_language_list =  "<option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
                } else if (language === "zh-Hans") {
                    write_translation_select_language_list =  "<option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
                }
                var write_translation_select_language = "<select id='write-translation-select-language'>" + write_translation_select_language_list + "</select>";
                var write_translation_select_language_wrapper = "<div class='write-translation-select-language-wrapper'>" + span1 + " &#8594; " + write_translation_select_language + "</div>";
                var main_obj = translation_writing.get_title_and_content_of_original_and_translation(translation_writing.divided_content.required[0]);
                if (main_obj === false) {
                    is_w_translation_opened = false;
                    if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                        moon_editor_focuser.blur();
                    }
                    return false;
                }
                var original_title = main_obj.original_title
                    , translation_title  = main_obj.translation_title
                    , original_content = main_obj.original_content
                    , translation_content = main_obj.translation_content;
                if (
                    translation_writing.divided_content.required[0].main_type === "title" ||
                    translation_writing.divided_content.required[0].main_type === "content" ||
                    translation_writing.divided_content.required[0].main_type === "tags"
                ) {
                    if (translation_writing.divided_content.required[0].main_type === "content") {
                        if (
                            translation_writing.divided_content.required[0].sub_type !== "text" &&
                            translation_writing.divided_content.required[0].sub_type !== "vote"
                        ) {
                            is_w_translation_opened = false;
                            if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                                moon_editor_focuser.blur();
                            }
                            return false;
                        }
                    }
                } else {
                    is_w_translation_opened = false;
                    if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                        moon_editor_focuser.blur();
                    }
                    return false;
                }
                span1 = "<span class='original-label-text'>" + original_title + "</span>";
                original_content = "<div class='original-content'>" + original_content + "</div>";
                var div_label1 = "<div class='original-label'>" + span1 + original_content + "</div>";
                span1 = "<span class='translation-label-text'>" + translation_title + "</span>";
                var moon_editor = "<textarea id='moon-editor' class='write-content' placeholder=''></textarea>";
                var write_content_wrapper = "<div class='write-content-wrapper'>" + moon_editor + "</div>";
                var dynamic_translation_content_wrapper = "<div class='dynamic-translation-content-wrapper'>" + translation_content + "</div>";
                var label1 = "<label for='moon-editor'>" + span1 + dynamic_translation_content_wrapper + write_content_wrapper +  "</label>";
                var pagination = "<div class='pagination'>1 / " + translation_writing.divided_content.required.length + "</div>";
                var img1 = "<img src='" + aws_s3_url + "/icons/filled-right.png" + css_version + "' alt='Next' title='Next'>";
                var btn_next
                    , btn_submit
                    , btn_career_wrapper;
                if (translation_writing.divided_content.required.length > 1) {
                    btn_next = "<div class='btn-translation-writing-next'>" + img1 + "</div>";
                    btn_career_wrapper = "<div class='btn-career-wrapper'>" + btn_next + "</div>";
                } else {
                    btn_submit = "<input class='btn-career submit-translation-writing' type='button' value='" + i18n[lang].check + "'>";
                    btn_career_wrapper = "<div class='btn-career-wrapper'>" + btn_submit + "</div>";
                }
                var write_form = "<form class=write-form>" + write_translation_select_language_wrapper + div_label1 + label1 + pagination + btn_career_wrapper + "</form>";
                var moon = "<div id='moon'>" + write_form + "</div>";
                $current_wrapper.append(moon).addClass('opened');
                CKEDITOR.replace('moon-editor', {
                    customConfig : '../../../ckeditor/text_only_config.js',
                    on: {instanceReady: function(e) {
                        if ( $('#moon-editor').length !== 0 ) {
                            CKEDITOR.instances['moon-editor'].setData("");
                        }
                        var editor = e.editor;
                        editor.on('focus', function (e) {
                            $('.write-content-wrapper').css('border-color', '#5a00e0');
                            $('.cke_top').css('border-color', '#5a00e0');
                        });
                        editor.on('blur', function (e) {
                            $('.write-content-wrapper').css('border-color', '#ebebeb');
                            $('.cke_top').css('border-color', '#ebebeb');
                        });
                        if (translation_writing.divided_content.required[0].main_type === "title") {
                            $('#moon .write-content-wrapper').css('display', 'none');
                        } else if (translation_writing.divided_content.required[0].main_type === "content") {
                            if (translation_writing.divided_content.required[0].sub_type === "text") {

                            } else if (translation_writing.divided_content.required[0].sub_type === "vote") {
                                $('#moon .write-content-wrapper').css('display', 'none');
                            } else {
                                return false;
                            }
                        } else if (translation_writing.divided_content.required[0].main_type === "tags") {
                            $('#moon .write-content-wrapper').css('display', 'none');
                        } else {
                            return false;
                        }
                    }},
                    placeholder: ""
                });
                moon_editor_focuser = new CKEDITOR.focusManager( CKEDITOR.instances["moon-editor"] );
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    is_w_translation_opened = false;
                    if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                        moon_editor_focuser.blur();
                    }
                }
            }
        };
        var f_cb = function () {
            is_w_translation_opened = false;
            if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
                moon_editor_focuser.blur();
            }
            show_bert('danger', 3000, i18n[lang].internal_server_error_has_occurred);
            return false;
        };
        methods["the_world"]["is_one"]({
            show_animation: true
            , data:data
            , pathname:"/get/single"
            , s_cb:s_cb
            , f_cb:f_cb
        });
        return false;
    });
    $(document).on('click', '.btn-view-translation-by-language', function (e) {
        e.preventDefault();
        return false;
        var _id = translation_menu_obj["_id"]
            , agenda_id = translation_menu_obj["agenda_id"]
            , type = translation_menu_obj["type"]
            , language = $(e.currentTarget).attr('data-lang')
            , css_version = $("body").attr("data-css-version")
            , lang = $("body").attr("data-lang");
        if (lang === undefined) {
            lang = "en";
        }
        is_w_opinion_opened = false;
        $(".btn-opinion.ing-write img").attr("src", aws_s3_url + "/icons/write-opinion.png");
        $(".btn-opinion.ing-write").removeClass("selected").removeClass("ing-write");
        $(".write-opinion-wrapper").empty().removeClass("opened");
        $(".request-opinion-wrapper").empty().removeClass("opened");
        translation_menu_obj["$written"].find(".opinion-of-agenda:first").css("display", "none");
        translation_menu_obj["$written"].find(".opinion-list-of-agenda:first").empty();
        translation_menu_obj["$written"].find(".opinion-list-of-agenda-modal:first").empty();
        translation_menu_obj["$written"].find(".btn-opinion:first").removeClass("selected").removeClass("ing-view").removeClass("ing-write").removeClass("ing-request");
        translation_menu_obj["$written"].find(".btn-opinion:first img").attr("src", aws_s3_url + "/icons/write-opinion.png" + css_version);
        is_w_translation_opened = false;
        $(".btn-translation.ing-write img").attr("src", aws_s3_url + "/icons/write-translation.png");
        $(".btn-translation.ing-write").removeClass("selected").removeClass("ing-write");
        $(".write-translation-wrapper").empty().removeClass("opened");
        $(".request-translation-wrapper").empty().removeClass("opened");
        translation_menu_obj["$written"].find(".translation-list-wrapper:first").css("display", "none");
        translation_menu_obj["$written"].find(".translation-list:first").empty();
        translation_menu_obj["$written"].find(".btn-translation:first").removeClass("selected").removeClass("ing-view").removeClass("ing-write").removeClass("ing-request");
        translation_menu_obj["$written"].find(".btn-translation:first img").attr("src", aws_s3_url + "/icons/write-translation.png" + css_version);
        translation_menu_obj["$written"].find(".comments-wrapper.outer-comments:first").empty().removeClass("opened");
        translation_menu_obj["$written"].find(".btn-open-comments:first").removeClass("selected");
        translation_menu_obj["$written"].find(".btn-open-comments:first img").attr("src", aws_s3_url + "/icons/comments.png" + css_version);
        if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
            star_editor_focuser.blur();
        }
        if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
            moon_editor_focuser.blur();
        }
        if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
            write_form["rebuild_write_form_data_as_ground"]();
        }
        translation_menu_obj["$written"].find(".translation-list-wrapper:first").css("display", "block");
        translation_menu_obj["$written"].find(".btn-translation:first").addClass("selected").addClass("ing-view");
        translation_menu_obj["$written"].find(".btn-translation:first img").attr("src", aws_s3_url + "/icons/write-translation-selected.png");
        translation_menu_obj["$view_wrapper"]["list"].empty();
        translation_menu_obj["$view_wrapper"]["more"].css('display', 'none').attr("data-lang", language).attr("data-type", type).attr("data-id", _id).attr("data-agenda-id", agenda_id);
        modal(".prompt#translation-menu-prompt", "close");
        get_fill["translations_of_article"]({
            language: language
            , type: type
            , _id: _id
            , agenda_id: agenda_id
            , skip : 0
            , translation_more: translation_menu_obj["$view_wrapper"]["more"]
            , translation_list: translation_menu_obj["$view_wrapper"]["list"]
        });
        return false;
    });
    $(document).on('click', '.translation-more', function (e) {
        e.preventDefault();
        return false;
        var $current = $(e.currentTarget)
            , language
            , type
            , _id
            , agenda_id
            , skip;
        language = $current.attr('data-lang');
        type = $current.attr('data-type');
        _id = $current.attr('data-id');
        agenda_id = $current.attr('data-agenda-id');
        skip = $current.parent().find(".translation-list:first .written").length;
        console.log("\n\nlanguage: " + language +
            "\ntype: " + type +
            "\n_id: " + _id +
            "\nagenda_id: " + agenda_id +
            "\nskip: " + skip);
        get_fill["translations_of_article"]({
            language: language
            , type: type
            , _id: _id
            , agenda_id: agenda_id
            , skip : skip
            , translation_more: $current
            , translation_list: $current.parent().find(".translation-list:first")
        });
        return false;
    });
    $(document).on('click', '.btn-translation-writing-prev', function (e) {
        e.preventDefault();
        return false;
        var current_index
            , current_obj;
        if ( translation_writing.divided_content.required[ translation_writing.current_required_index -1 ] !== undefined) {
            translation_writing.save_current_page();
            current_index = translation_writing.current_required_index = translation_writing.current_required_index -1;
            current_obj = translation_writing.divided_content.required[current_index];
            var main_obj = translation_writing.get_title_and_content_of_original_and_translation(current_obj);
            if (main_obj === false) {
                translation_writing.current_required_index = translation_writing.current_required_index + 1;
                return false;
            }
            var original_title = main_obj.original_title
                , translation_title  = main_obj.translation_title
                , original_content = main_obj.original_content
                , translation_content = main_obj.translation_content;
            $("#moon .original-label-text").text(original_title);
            $("#moon .translation-label-text").text(translation_title);
            $("#moon .original-content").empty().append(original_content);
            $("#moon .dynamic-translation-content-wrapper").empty().append(translation_content);
            if (
                current_obj.main_type === "title" ||
                current_obj.main_type === "tags"
            ) {
                $('#moon .write-content-wrapper').css('display', 'none');
            } else if (current_obj.main_type === "content") {
                if (current_obj.sub_type === 'text') {
                    $('#moon .write-content-wrapper').css('display', 'block');
                } else if (current_obj.sub_type === 'vote') {
                    $('#moon .write-content-wrapper').css('display', 'none');
                } else {
                    translation_writing.current_required_index = translation_writing.current_required_index + 1;
                    return false;
                }
            } else {
                translation_writing.current_required_index = translation_writing.current_required_index + 1;
                return false;
            }
            translation_writing.load_data_current_page();
        } else {
            return false;
        }
        var css_version = $("body").attr("data-css-version");
        var img1 = "<img src='" + aws_s3_url + "/icons/filled-left.png" + css_version + "' alt='Previous' title='Previous'>";
        var btn_prev = "<div class='btn-translation-writing-prev'>" + img1 + "</div>";
        img1 = "<img src='" + aws_s3_url + "/icons/filled-right.png" + css_version + "' alt='Next' title='Next'>";
        var btn_next = "<div class='btn-translation-writing-next'>" + img1 + "</div>";
        var btn_submit = "<input class='btn-career submit-translation-writing' type='button' value='" + i18n[lang].check + "'>";
        var $btn_career_wrapper = $('#moon .btn-career-wrapper');
        $btn_career_wrapper.empty();
        if (translation_writing.divided_content.required.length > 1) {
            if (current_index === 0) {
                btn_prev = "";
                btn_submit = "";
            } else {
                if (current_index === translation_writing.divided_content.required.length - 1) {
                    btn_next = "";
                } else {
                    btn_submit = "";
                }
            }
            $btn_career_wrapper.append(btn_prev + btn_next + btn_submit);
        } else {
            return false;
        }
        $("#moon .pagination").empty().append((current_index + 1) + " / " + translation_writing.divided_content.required.length);
        return false;
    });
    $(document).on('click', '.btn-translation-writing-next', function (e) {
        e.preventDefault();
        return false;
        var current_index
            , current_obj;
        if ( translation_writing.divided_content.required[ translation_writing.current_required_index + 1 ] !== undefined) {
            translation_writing.save_current_page();
            current_index = translation_writing.current_required_index = translation_writing.current_required_index + 1;
            current_obj = translation_writing.divided_content.required[current_index];
            var main_obj = translation_writing.get_title_and_content_of_original_and_translation(current_obj);
            if (main_obj === false) {
                translation_writing.current_required_index = translation_writing.current_required_index - 1;
                return false;
            }
            var original_title = main_obj.original_title
                , translation_title  = main_obj.translation_title
                , original_content = main_obj.original_content
                , translation_content = main_obj.translation_content;
            $("#moon .original-label-text").text(original_title);
            $("#moon .translation-label-text").text(translation_title);
            $("#moon .original-content").empty().append(original_content);
            $("#moon .dynamic-translation-content-wrapper").empty().append(translation_content);
            if (
                current_obj.main_type === "title" ||
                current_obj.main_type === "tags"
            ) {
                $('#moon .write-content-wrapper').css('display', 'none');
            } else if (current_obj.main_type === "content") {
                if (current_obj.sub_type === 'text') {
                    $('#moon .write-content-wrapper').css('display', 'block');
                } else if (current_obj.sub_type === 'vote') {
                    $('#moon .write-content-wrapper').css('display', 'none');
                } else {
                    translation_writing.current_required_index = translation_writing.current_required_index - 1;
                    return false;
                }
            } else {
                translation_writing.current_required_index = translation_writing.current_required_index - 1;
                return false;
            }
            translation_writing.load_data_current_page();
        } else {
            return false;
        }
        var css_version = $("body").attr("data-css-version");
        var img1 = "<img src='" + aws_s3_url + "/icons/filled-left.png" + css_version + "' alt='Previous' title='Previous'>";
        var btn_prev = "<div class='btn-translation-writing-prev'>" + img1 + "</div>";
        img1 = "<img src='" + aws_s3_url + "/icons/filled-right.png" + css_version + "' alt='Next' title='Next'>";
        var btn_next = "<div class='btn-translation-writing-next'>" + img1 + "</div>";
        var btn_submit = "<input class='btn-career submit-translation-writing' type='button' value='" + i18n[lang].check + "'>";
        var $btn_career_wrapper = $('#moon .btn-career-wrapper');
        $btn_career_wrapper.empty();
        if (translation_writing.divided_content.required.length > 1) {
            if (current_index === 0) {
                btn_prev = "";
                btn_submit = "";
            } else {
                if (current_index === translation_writing.divided_content.required.length - 1) {
                    btn_next = "";
                } else {
                    btn_submit = "";
                }
            }
            $btn_career_wrapper.append(btn_prev + btn_next + btn_submit);
        } else {
            return false;
        }
        $("#moon .pagination").empty().append((current_index + 1) + " / " + translation_writing.divided_content.required.length);
        return false;
    });
    $(document).on('click', '#moon .submit-translation-writing', function (e) {
        e.preventDefault();
        return false;
        translation_writing.save_current_page();
        var language = $("#moon #write-translation-select-language option:selected").val()
            , title = ""
            , content = []
            , tags = []
            , temp_list = ""
            , temp = "";
        var final_list = translation_writing.divided_content.input
            , obj;
        for (var i = 0; i < final_list.length; i++) {
            obj = final_list[i];
            if (obj.main_type === 'title') {
                title = obj.element;
            } else if (obj.main_type === 'tags') {
                temp_list = obj.element;
                temp_list = temp_list.split('#');
                if (temp_list.length > 1) {
                    for (var j = 1; j < temp_list.length; j++) {
                        temp = temp_list[j].trim().replace(/\s\s+/gi, ' ');
                        if (temp !== "") {
                            tags.push(temp);
                        }
                    }
                }
            } else if (obj.main_type === 'content') {
                content.push(obj);
            }
        }
        var data = {};
        data.language = encodeURIComponent(language);
        data.title = encodeURIComponent(title);
        data.content = encodeURIComponent(JSON.stringify(content));
        data.tags = encodeURIComponent(JSON.stringify(tags));
        if (translation_writing.current_info === null) {
            return false;
        }
        data.type = encodeURIComponent(translation_writing.current_info.type);
        data._id = encodeURIComponent(translation_writing.current_info._id);
        if (translation_writing.current_info.type === "opinion") {
            data.agenda_id = encodeURIComponent(translation_writing.current_info.agenda_id);
        }
        var s_cb = function (result) {
            if ( result['response'] === true ) {
                var original_document_class = translation_writing.current_info.type + "-" + translation_writing.current_info.blog_id + "-" + translation_writing.current_info._id;
                var $original_documents_translation_list = $("." + original_document_class + " .translation-list-wrapper:first");
                if (
                    is_agenda_prompt_opened === true &&
                    is_opinion_prompt_opened === true
                ) {
                    modal('.prompt#agenda-prompt', 'close');
                    modal('.prompt#opinion-prompt', 'close');
                    if (history && history.state) {
                        if (my_history && my_history.length > 1) {
                            my_history.pop();
                            my_history.pop();
                        }
                        history.go(-2);
                    } else {
                        return window.location = result['pathname'];
                    }
                    show_bert("success", 2000, i18n[lang].successfully_added_translation);
                } else if (
                    is_agenda_prompt_opened === true &&
                    is_opinion_prompt_opened === false
                ) {
                    modal('.prompt#agenda-prompt', 'close');
                    if (history && history.state) {
                        if (my_history && my_history.length > 1) {
                            my_history.pop();
                        }
                        history.back();
                    } else {
                        return window.location = result['pathname'];
                    }
                    show_bert("success", 2000, i18n[lang].successfully_added_translation);
                } else if (
                    is_agenda_prompt_opened === false &&
                    is_opinion_prompt_opened === true
                ) {
                    modal('.prompt#opinion-prompt', 'close');
                    if (history && history.state) {
                        if (my_history && my_history.length > 1) {
                            my_history.pop();
                        }
                        history.back();
                    } else {
                        return window.location = result['pathname'];
                    }
                    show_bert("success", 2000, i18n[lang].successfully_added_translation);
                } else {
                    return window.location = result['pathname'];
                }
                is_agenda_prompt_opened = false;
                is_opinion_prompt_opened = false;
                is_opinion_prompt_parent = true;
                $(".prompt#agenda-prompt #agenda-wrapper").empty();
                $(".prompt#opinion-prompt #opinion-wrapper").empty();
                var type = "tr_" + translation_writing.current_info.type;
                var data2 = {}
                    , link2 = result.pathname
                    , cb2 = function () {
                    open_article({
                        type:type
                        , link: link2
                        , is_from_translation: false
                        , is_from_opinion: false
                    });
                };
                data2.type = encodeURIComponent(type);
                if (type === "tr_agenda") {
                    data2._id = encodeURIComponent(link2.split('/')[4]);
                } else if (type === "tr_opinion") {
                    data2._id = encodeURIComponent(link2.split('/')[6]);
                }
                update_count_view(data2, cb2);
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else if (result['msg'] === 'no_access') {
                    show_bert("danger", 2000, i18n[lang].only_invited_users_can_write_it);
                } else {
                    show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                }
            }
        };
        var f_cb = function () {show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/insert/translation",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on('focus', '.translation-input', function (e) {
        $(e.currentTarget).css('border-color', '#5a00e0');
    });
    $(document).on('blur', '.translation-input', function (e) {
        $(e.currentTarget).css('border-color', '#ebebeb');
    });
    $(document).on('focus', '.translation-question', function (e) {
        $(e.currentTarget).parent().css('border-color', '#5a00e0');
    });
    $(document).on('blur', '.translation-question', function (e) {
        $(e.currentTarget).parent().css('border-color', '#ebebeb');
    });
    $(document).on('focus', '.translation-vote .choice-item input.choice-input', function (e) {
        $(e.currentTarget).parent().parent().find('.choice-index').css('border-color', '#5a00e0');
    });
    $(document).on('blur', '.translation-vote .choice-item input.choice-input', function (e) {
        $(e.currentTarget).parent().parent().find('.choice-index').css('border-color', '#ebebeb');
    });
});