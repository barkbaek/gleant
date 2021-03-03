var translation_edit = {};
translation_edit.divided_content = {};
translation_edit.divided_content.all = null;
translation_edit.divided_content.translation_all = null;
translation_edit.divided_content.required = null;
translation_edit.divided_content.divided_translation = null;
translation_edit.divided_content.input = null;
translation_edit.current_info = null;
translation_edit.current_required_index = 0;
translation_edit.save_current_page = function () {
    var current_required_index = translation_edit.current_required_index;
    var current_original_obj = translation_edit.divided_content.required[current_required_index];
    if (
        current_original_obj.main_type === "title" ||
        current_original_obj.main_type === "tags"
    ) {
        translation_edit.divided_content.input[current_required_index].element = $("#mars .translation-input:first").val();
    } else if (
        current_original_obj.main_type === "content"
    ) {
        if (
            current_original_obj.sub_type === "text"
        ) {
            translation_edit.divided_content.input[current_required_index].element = CKEDITOR.instances['mars-editor'].getData().replace(/<p>/gi,'<div>').replace(/<\/p>/gi,'</div>').replace(/<div>/gi,'').replace(/<\/div>/gi,'<br />').replace(/<script>/gi,'').replace(/<\/script>/gi,'');
        } else if (
            current_original_obj.sub_type === "vote"
        ) {
            translation_edit.divided_content.input[current_required_index].question = $("#mars .translation-question:first").val();
            var choice_list = {};
            $("#mars .choice-input").each( function (i, e) {
                var _id = $(e).attr('data-id')
                    , value = $(e).val();
                choice_list[_id] = value;
            });

            for (var i = 0; i < translation_edit.divided_content.input[current_required_index].choice_list.length; i++) {
                translation_edit.divided_content.input[current_required_index].choice_list[i].choice = choice_list[ translation_edit.divided_content.input[current_required_index].choice_list[i]._id ];
            }
        }
    }
};
translation_edit.load_data_current_page = function () {
    var current_obj = translation_edit.divided_content.input[translation_edit.current_required_index];
    if (
        current_obj.main_type === "title" ||
        current_obj.main_type === "tags"
    ) {
        $("#mars .translation-input:first").val(current_obj.element);
    } else if (
        current_obj.main_type === "content"
    ) {
        if (
            current_obj.sub_type === "text"
        ) {
            CKEDITOR.instances['mars-editor'].setData(current_obj.element);
        } else if (
            current_obj.sub_type === "vote"
        ) {
            $("#mars .translation-question:first").val(current_obj.question);
            var choice_list = {};

            for (var i = 0; i < current_obj.choice_list.length; i++) {
                choice_list[ current_obj.choice_list[i]._id ] = current_obj.choice_list[i].choice;
            }

            $("#mars .choice-input").each( function (i, e) {
                var _id = $(e).attr('data-id');
                $(e).val(choice_list[_id]);
            });
        }
    }
};
translation_edit.get_title_and_content_of_original_and_translation = function (obj) {
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
translation_edit.divided_content.init = function () {
    translation_edit.current_required_index = 0;
    if ( translation_edit.divided_content.all === null ) {
        return false;
    }
    var list = translation_edit.divided_content.all
        , translation_list = translation_edit.divided_content.translation_all
        , temp
        , obj;
    translation_edit.divided_content.required = [];
    translation_edit.divided_content.input = [];
    var temp_tr_objs = {};
    temp_tr_objs.title = "";
    temp_tr_objs.texts = [];
    temp_tr_objs.votes = {};
    temp_tr_objs.tags = "";
    var or_text_length = 0
        , temp_tr_texts_current_index = 0;
    for (var i = 0; i < list.length; i++) {
        obj = list[i];
        if ( list[i].main_type === "content" ) {
            if ( list[i].sub_type === "text" ) {
                temp = obj.element.replace(/<br>/gi, '').replace(/<br \/>/gi, '').replace(/​/gi, '').trim();
                if (
                    temp === "" ||
                    temp.length === 0
                ) {
                    continue;
                } else {
                    or_text_length = or_text_length + 1;
                }
            } else {
                continue;
            }
        } else {
            continue;
        }
    }
    for (var i = 0; i < translation_list.length; i++) {
        obj = translation_list[i];
        obj.index = i;
        if ( translation_list[i].main_type === "title" ) {
            if (translation_list[i].element !== "") {
                temp_tr_objs.title = translation_list[i].element;
            } else {
                continue;
            }
        } else if ( translation_list[i].main_type === "content" ) {
            if ( translation_list[i].sub_type === "text" ) {
                temp = obj.element.replace(/<br>/gi, '').replace(/<br \/>/gi, '').replace(/​/gi, '').trim();
                if (
                    temp === "" ||
                    temp.length === 0
                ) {
                    continue;
                } else {
                    temp_tr_objs.texts.push(obj.element);
                }
            } else if ( translation_list[i].sub_type === "vote" ) {
                if (
                    translation_list[i].question !== undefined &&
                    translation_list[i].choice_list !== undefined
                ) {
                    var choice_list = {};
                    for (var j = 0; j < obj.choice_list.length; j++) {
                        choice_list[obj.choice_list[j]._id] = {
                            choice: obj.choice_list[j].choice
                            , _id: obj.choice_list[j]._id
                        };
                    }
                    temp_tr_objs.votes[obj.original_id] = {
                        choice_list: choice_list
                        , question: obj.question
                        , src: obj.src
                        , _id: obj._id
                        , original_id: obj.original_id
                        , height: obj.height
                    };
                } else {
                    continue;
                }
            } else {
                continue;
            }
        } else if ( translation_list[i].main_type === "tags" ) {
            if (translation_list[i].element !== "") {
                temp_tr_objs.tags = obj.element;
            } else {
                continue;
            }
        } else {
            continue;
        }
    }
    translation_edit.divided_content.divided_translation = temp_tr_objs;
    for (var i = 0; i < list.length; i++) {
        obj = list[i];
        obj.index = i;
        if ( list[i].main_type === "title" ) {
            if (list[i].element !== "") {
                translation_edit.divided_content.required.push(obj);
                translation_edit.divided_content.input.push({
                    element: temp_tr_objs.title
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
                    temp = "";
                    translation_edit.divided_content.required.push(obj);
                    if (or_text_length === temp_tr_objs.texts.length) {
                        if (temp_tr_texts_current_index < temp_tr_objs.texts.length) {
                            temp = temp_tr_objs.texts[temp_tr_texts_current_index];
                        } else {
                            temp = "";
                        }
                    } else if ( or_text_length > temp_tr_objs.texts.length ) {
                        if (temp_tr_texts_current_index < temp_tr_objs.texts.length) {
                            temp = temp_tr_objs.texts[temp_tr_texts_current_index];
                        } else {
                            temp = "";
                        }
                    } else {
                        if (temp_tr_texts_current_index < or_text_length) {
                            if ( (or_text_length - 1) === temp_tr_texts_current_index ) {
                                for (var j = temp_tr_texts_current_index; j < temp_tr_objs.texts.length; j++) {
                                    temp = temp + temp_tr_objs.texts[temp_tr_texts_current_index];
                                }
                            } else {
                                temp = temp_tr_objs.texts[temp_tr_texts_current_index];
                            }
                        } else {
                            temp = "";
                        }
                    }
                    translation_edit.divided_content.input.push({
                        element: temp
                        , index: obj.index
                        , main_type: obj.main_type
                        , sub_type: obj.sub_type
                    });
                    temp_tr_texts_current_index = temp_tr_texts_current_index + 1;
                }
            } else if ( list[i].sub_type === "vote" ) {
                if (
                    list[i].question !== undefined &&
                    list[i].choice_list !== undefined
                ) {
                    translation_edit.divided_content.required.push(obj);
                    var choice_list = [];
                    if (temp_tr_objs.votes[obj._id] === undefined) {
                        for (var j = 0; j < obj.choice_list.length; j++) {
                            choice_list.push({
                                choice: ""
                                , _id: obj.choice_list[j]._id
                            });
                        }
                        translation_edit.divided_content.input.push({
                            choice_list: choice_list
                            , index: obj.index
                            , main_type: obj.main_type
                            , sub_type: obj.sub_type
                            , question: ""
                            , src: obj.src
                            , _id: ""
                            , original_id: obj._id
                            , height: obj.height
                            , is_new: true
                        });
                    } else {
                        for (var j = 0; j < obj.choice_list.length; j++) {
                            if ( temp_tr_objs.votes[obj._id].choice_list[ obj.choice_list[j]._id ] === undefined ) {
                                choice_list.push({
                                    choice: ""
                                    , _id: obj.choice_list[j]._id
                                });
                            } else {
                                choice_list.push({
                                    choice: temp_tr_objs.votes[obj._id].choice_list[ obj.choice_list[j]._id ].choice
                                    , _id: obj.choice_list[j]._id
                                });
                            }
                        }
                        translation_edit.divided_content.input.push({
                            choice_list: choice_list
                            , index: obj.index
                            , main_type: obj.main_type
                            , sub_type: obj.sub_type
                            , question: temp_tr_objs.votes[obj._id].question
                            , src: temp_tr_objs.votes[obj._id].src
                            , original_id: temp_tr_objs.votes[obj._id].original_id
                            , _id: temp_tr_objs.votes[obj._id]._id
                            , height: temp_tr_objs.votes[obj._id].height
                            , is_new: false
                        });
                    }
                } else {
                    continue;
                }
            } else {
                continue;
            }
        } else if ( list[i].main_type === "tags" ) {
            if (list[i].element !== "") {
                translation_edit.divided_content.required.push(obj);
                translation_edit.divided_content.input.push({
                    element: temp_tr_objs.tags
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
var open_mars_prompt = function (e) {
    return false;
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var css_version = $("body").attr("data-css-version");
    var is_loginned = $("body").attr("data-check") === "true";
    if (is_loginned === false) {
        modal(".prompt#request-login-prompt", "open");
        return false;
    }
    var $current_wrapper = $(".prompt#mars-prompt .prompt-main:first")
        , $parent = $(e.currentTarget).parent()
        , type = $parent.attr('data-type')
        , translated_language = $parent.attr('data-lang')
        , language
        , agenda_id = $parent.attr('data-agenda-id')
        , opinion_id = $parent.attr('data-opinion-id')
        , _id = $parent.attr('data-id')
        , blog_id = $parent.attr('data-blog-id')
        , data = {};
    translation_edit.current_info = {};
    translation_edit.current_info.type = type;
    translation_edit.current_info.agenda_id = agenda_id;
    translation_edit.current_info.opinion_id = opinion_id;
    translation_edit.current_info._id = _id;
    translation_edit.current_info.blog_id = blog_id;
    $current_wrapper.empty();
    translation_edit.divided_content.all = null;
    translation_edit.divided_content.translation_all = null;
    translation_edit.divided_content.required = null;
    translation_edit.divided_content.divided_translation = null;
    translation_edit.divided_content.input = null;
    translation_edit.current_required_index = 0;
    data["type"] = encodeURIComponent(type);
    data["_id"] = encodeURIComponent(_id);
    data["with_divided_contents"] = encodeURIComponent("true");
    if (type === 'tr_agenda') {
        data["agenda_id"] = encodeURIComponent(agenda_id);
    } else if (type === 'tr_opinion') {
        data["agenda_id"] = encodeURIComponent(agenda_id);
        data["opinion_id"] = encodeURIComponent(opinion_id);
    } else {
        is_mars_prompt_opened = false;
        if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
            mars_editor_focuser.blur();
        }
        return false;
    }
    var s_cb = function (result) {
        if ( result['response'] === true ) {
            translation_edit.divided_content.all = result.divided_original_doc;
            translation_edit.divided_content.translation_all = result.divided_translated_doc;
            translation_edit.divided_content.init();
            if (translation_edit.divided_content.required === null || translation_edit.divided_content.required.length === 0) {
                is_mars_prompt_opened = false;
                if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
                    mars_editor_focuser.blur();
                }
                return false;
            }
            var written_language;
            language = result.original_doc.language;
            translated_language = result.translated_doc.language;
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
            var edit_translation_select_language_list;
            if (language === "en") {
                edit_translation_select_language_list = "<option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
            } else if (language === "ja") {
                edit_translation_select_language_list =  "<option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
            } else if (language === "ko") {
                edit_translation_select_language_list =  "<option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
            } else if (language === "zh-Hans") {
                edit_translation_select_language_list =  "<option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
            }
            var edit_translation_select_language = "<select id='edit-translation-select-language'>" + edit_translation_select_language_list + "</select>";
            var edit_translation_select_language_wrapper = "<div class='edit-translation-select-language-wrapper'>" + span1 + " &#8594; " + edit_translation_select_language + "</div>";
            var main_obj = translation_edit.get_title_and_content_of_original_and_translation(translation_edit.divided_content.required[0]);
            if (main_obj === false) {
                is_mars_prompt_opened = false;
                if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
                    mars_editor_focuser.blur();
                }
                return false;
            }
            var original_title = main_obj.original_title
                , translation_title  = main_obj.translation_title
                , original_content = main_obj.original_content
                , translation_content = main_obj.translation_content;
            if (
                translation_edit.divided_content.required[0].main_type === "title" ||
                translation_edit.divided_content.required[0].main_type === "content" ||
                translation_edit.divided_content.required[0].main_type === "tags"
            ) {
                if (translation_edit.divided_content.required[0].main_type === "content") {
                    if (
                        translation_edit.divided_content.required[0].sub_type !== "text" &&
                        translation_edit.divided_content.required[0].sub_type !== "vote"
                    ) {
                        is_mars_prompt_opened = false;
                        if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
                            mars_editor_focuser.blur();
                        }
                        return false;
                    }
                }
            } else {
                is_mars_prompt_opened = false;
                if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
                    mars_editor_focuser.blur();
                }
                return false;
            }
            span1 = "<span class='original-label-text'>" + original_title + "</span>";
            original_content = "<div class='original-content'>" + original_content + "</div>";
            var div_label1 = "<div class='original-label'>" + span1 + original_content + "</div>";
            span1 = "<span class='translation-label-text'>" + translation_title + "</span>";
            var mars_editor = "<textarea id='mars-editor' class='write-content' placeholder=''></textarea>";
            var write_content_wrapper = "<div class='write-content-wrapper'>" + mars_editor + "</div>";
            var dynamic_translation_content_wrapper = "<div class='dynamic-translation-content-wrapper'>" + translation_content + "</div>";
            var label1 = "<label for='mars-editor'>" + span1 + dynamic_translation_content_wrapper + write_content_wrapper +  "</label>";
            var pagination = "<div class='pagination'>1 / " + translation_edit.divided_content.required.length + "</div>";
            var img1 = "<img src='" + aws_s3_url + "/icons/filled-right.png" + css_version + "' alt='Next' title='Next'>";
            var btn_next
                , btn_submit
                , btn_career_wrapper;
            if (translation_edit.divided_content.required.length > 1) {
                btn_next = "<div class='btn-translation-edit-next'>" + img1 + "</div>";
                btn_career_wrapper = "<div class='btn-career-wrapper'>" + btn_next + "</div>";
            } else {
                btn_submit = "<input class='btn-career submit-translation-edit' type='button' value='" + i18n[lang].check + "'>";
                btn_career_wrapper = "<div class='btn-career-wrapper'>" + btn_submit + "</div>";
            }
            var write_form = "<form class=write-form>" + edit_translation_select_language_wrapper + div_label1 + label1 + pagination + btn_career_wrapper + "</form>";
            var mars = "<div id='mars'>" + write_form + "</div>";
            if (is_agenda_prompt_opened === true) {
                modal(".prompt#agenda-prompt", "close");
            }
            if (is_opinion_prompt_opened === true) {
                modal(".prompt#opinion-prompt", "close");
            }
            if (is_translation_prompt_opened === true) {
                modal(".prompt#translation-prompt", "close");
            }
            modal(".prompt#mars-prompt", "open");
            is_mars_prompt_opened = true;
            $current_wrapper.append(mars).addClass('opened');
            CKEDITOR.replace('mars-editor', {
                customConfig : '../../../ckeditor/text_only_config.js',
                on: {instanceReady: function(e) {
                    if ( $('#mars-editor').length !== 0 ) {
                        CKEDITOR.instances['mars-editor'].setData("");
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
                    if (translation_edit.divided_content.required[0].main_type === "title") {
                        $('#mars .write-content-wrapper').css('display', 'none');
                    } else if (translation_edit.divided_content.required[0].main_type === "content") {
                        if (translation_edit.divided_content.required[0].sub_type === "text") {

                        } else if (translation_edit.divided_content.required[0].sub_type === "vote") {
                            $('#mars .write-content-wrapper').css('display', 'none');
                        } else {
                            return false;
                        }
                    } else if (translation_edit.divided_content.required[0].main_type === "tags") {
                        $('#mars .write-content-wrapper').css('display', 'none');
                    } else {
                        return false;
                    }
                    translation_edit.load_data_current_page();
                    $('#mars #edit-translation-select-language option[value=' + translated_language + ']').prop('selected', true);
                }},
                placeholder: ""
            });
            mars_editor_focuser = new CKEDITOR.focusManager( CKEDITOR.instances["mars-editor"] );
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                is_mars_prompt_opened = false;
                if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
                    mars_editor_focuser.blur();
                }
            }
        }
    };
    var f_cb = function () {
        is_mars_prompt_opened = false;
        if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
            mars_editor_focuser.blur();
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
};
$(document).ready(function() {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    $(document).on('click', '.prompt#mars-prompt .close', function (e) {
        e.preventDefault();
        return false;
        modal(".prompt#mars-prompt", "close");
        is_mars_prompt_opened = false;
        if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
            mars_editor_focuser.blur();
        }
        if (is_translation_prompt_opened === true) {
            modal(".prompt#translation-prompt", "open");
        } else {
            if (is_opinion_prompt_parent === true) {
                if (is_agenda_prompt_opened === true) {
                    modal(".prompt#agenda-prompt", "open");
                } else {
                    if (is_opinion_prompt_opened === true) {
                        modal(".prompt#opinion-prompt", "open");
                    }
                }
            } else {
                if (is_opinion_prompt_opened === true) {
                    modal(".prompt#opinion-prompt", "open");
                } else {
                    if (is_agenda_prompt_opened === true) {
                        modal(".prompt#agenda-prompt", "open");
                    }
                }
            }
        }
        return false;
    });
    $(document).on('click', '.btn-translation-edit-prev', function (e) {
        e.preventDefault();
        return false;
        var current_index
            , current_obj;
        if ( translation_edit.divided_content.required[ translation_edit.current_required_index -1 ] !== undefined) {
            translation_edit.save_current_page();
            current_index = translation_edit.current_required_index = translation_edit.current_required_index -1;
            current_obj = translation_edit.divided_content.required[current_index];
            var main_obj = translation_edit.get_title_and_content_of_original_and_translation(current_obj);
            if (main_obj === false) {
                translation_edit.current_required_index = translation_edit.current_required_index + 1;
                return false;
            }
            var original_title = main_obj.original_title
                , translation_title  = main_obj.translation_title
                , original_content = main_obj.original_content
                , translation_content = main_obj.translation_content;
            $("#mars .original-label-text").text(original_title);
            $("#mars .translation-label-text").text(translation_title);
            $("#mars .original-content").empty().append(original_content);
            $("#mars .dynamic-translation-content-wrapper").empty().append(translation_content);
            if (
                current_obj.main_type === "title" ||
                current_obj.main_type === "tags"
            ) {
                $('#mars .write-content-wrapper').css('display', 'none');
            } else if (current_obj.main_type === "content") {
                if (current_obj.sub_type === 'text') {
                    $('#mars .write-content-wrapper').css('display', 'block');
                } else if (current_obj.sub_type === 'vote') {
                    $('#mars .write-content-wrapper').css('display', 'none');
                } else {
                    translation_edit.current_required_index = translation_edit.current_required_index + 1;
                    return false;
                }
            } else {
                translation_edit.current_required_index = translation_edit.current_required_index + 1;
                return false;
            }
            translation_edit.load_data_current_page();
        } else {
            return false;
        }
        var css_version = $("body").attr("data-css-version");
        var img1 = "<img src='" + aws_s3_url + "/icons/filled-left.png" + css_version + "' alt='Previous' title='Previous'>";
        var btn_prev = "<div class='btn-translation-edit-prev'>" + img1 + "</div>";
        img1 = "<img src='" + aws_s3_url + "/icons/filled-right.png" + css_version + "' alt='Next' title='Next'>";
        var btn_next = "<div class='btn-translation-edit-next'>" + img1 + "</div>";
        var btn_submit = "<input class='btn-career submit-translation-edit' type='button' value='" + i18n[lang].check + "'>";
        var $btn_career_wrapper = $('#mars .btn-career-wrapper');
        $btn_career_wrapper.empty();
        if (translation_edit.divided_content.required.length > 1) {
            if (current_index === 0) {
                btn_prev = "";
                btn_submit = "";
            } else {
                if (current_index === translation_edit.divided_content.required.length - 1) {
                    btn_next = "";
                } else {
                    btn_submit = "";
                }
            }
            $btn_career_wrapper.append(btn_prev + btn_next + btn_submit);
        } else {
            return false;
        }
        $("#mars .pagination").empty().append((current_index + 1) + " / " + translation_edit.divided_content.required.length);
        return false;
    });
    $(document).on('click', '.btn-translation-edit-next', function (e) {
        e.preventDefault();
        return false;
        var current_index
            , current_obj;
        if ( translation_edit.divided_content.required[ translation_edit.current_required_index + 1 ] !== undefined) {
            translation_edit.save_current_page();
            current_index = translation_edit.current_required_index = translation_edit.current_required_index + 1;
            current_obj = translation_edit.divided_content.required[current_index];
            var main_obj = translation_edit.get_title_and_content_of_original_and_translation(current_obj);
            if (main_obj === false) {
                translation_edit.current_required_index = translation_edit.current_required_index - 1;
                return false;
            }
            var original_title = main_obj.original_title
                , translation_title  = main_obj.translation_title
                , original_content = main_obj.original_content
                , translation_content = main_obj.translation_content;
            $("#mars .original-label-text").text(original_title);
            $("#mars .translation-label-text").text(translation_title);
            $("#mars .original-content").empty().append(original_content);
            $("#mars .dynamic-translation-content-wrapper").empty().append(translation_content);
            if (
                current_obj.main_type === "title" ||
                current_obj.main_type === "tags"
            ) {
                $('#mars .write-content-wrapper').css('display', 'none');
            } else if (current_obj.main_type === "content") {
                if (current_obj.sub_type === 'text') {
                    $('#mars .write-content-wrapper').css('display', 'block');
                } else if (current_obj.sub_type === 'vote') {
                    $('#mars .write-content-wrapper').css('display', 'none');
                } else {
                    translation_edit.current_required_index = translation_edit.current_required_index - 1;
                    return false;
                }
            } else {
                translation_edit.current_required_index = translation_edit.current_required_index - 1;
                return false;
            }
            translation_edit.load_data_current_page();
        } else {
            return false;
        }
        var css_version = $("body").attr("data-css-version");
        var img1 = "<img src='" + aws_s3_url + "/icons/filled-left.png" + css_version + "' alt='Previous' title='Previous'>";
        var btn_prev = "<div class='btn-translation-edit-prev'>" + img1 + "</div>";
        img1 = "<img src='" + aws_s3_url + "/icons/filled-right.png" + css_version + "' alt='Next' title='Next'>";
        var btn_next = "<div class='btn-translation-edit-next'>" + img1 + "</div>";
        var btn_submit = "<input class='btn-career submit-translation-edit' type='button' value='" + i18n[lang].check + "'>";
        var $btn_career_wrapper = $('#mars .btn-career-wrapper');
        $btn_career_wrapper.empty();
        if (translation_edit.divided_content.required.length > 1) {
            if (current_index === 0) {
                btn_prev = "";
                btn_submit = "";
            } else {
                if (current_index === translation_edit.divided_content.required.length - 1) {
                    btn_next = "";
                } else {
                    btn_submit = "";
                }
            }
            $btn_career_wrapper.append(btn_prev + btn_next + btn_submit);
        } else {
            return false;
        }
        $("#mars .pagination").empty().append((current_index + 1) + " / " + translation_edit.divided_content.required.length);
        return false;
    });
    $(document).on('click', '#mars .submit-translation-edit', function (e) {
        e.preventDefault();
        return false;
        translation_edit.save_current_page();
        var language = $("#mars #edit-translation-select-language option:selected").val()
            , title = ""
            , content = []
            , tags = []
            , temp_list = ""
            , temp = "";
        var final_list = translation_edit.divided_content.input
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
        if (translation_edit.current_info === null) {
            return false;
        }
        data.type = encodeURIComponent(translation_edit.current_info.type);
        data._id = encodeURIComponent(translation_edit.current_info._id);
        data.agenda_id = encodeURIComponent(translation_edit.current_info.agenda_id);
        if (translation_edit.current_info.type === "tr_opinion") {
            data.opinion_id = encodeURIComponent(translation_edit.current_info.opinion_id);
        }
        var s_cb = function (result) {
            modal(".prompt#mars-prompt", "close");
            is_mars_prompt_opened = false;
            if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
                mars_editor_focuser.blur();
            }
            if ( result['response'] === true ) {
                var translation_document_class = translation_edit.current_info.type + "-" + translation_edit.current_info.blog_id + "-" + translation_edit.current_info._id;
                if (is_translation_prompt_opened === true) {
                    if (history && history.state) {
                        if (my_history && my_history.length > 1) {
                            my_history.pop();
                        }
                        history.back();
                    } else {
                        return window.location = result['pathname'];
                    }
                    show_bert("success", 2000, i18n[lang].successfully_changed_translation);
                } else {
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
                        show_bert("success", 2000, i18n[lang].successfully_changed_translation);
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
                        show_bert("success", 2000, i18n[lang].successfully_changed_translation);
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
                        show_bert("success", 2000, i18n[lang].successfully_changed_translation);

                    } else {
                        return window.location = result['pathname'];
                    }
                }
                is_translation_prompt_opened = false;
                is_agenda_prompt_opened = false;
                is_opinion_prompt_opened = false;
                is_opinion_prompt_parent = true;
                $(".prompt#agenda-prompt #agenda-wrapper").empty();
                $(".prompt#opinion-prompt #opinion-wrapper").empty();
                $(".prompt#translation-prompt #translation-wrapper").empty();
                var type = translation_edit.current_info.type;
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
                data2._id = translation_edit.current_info._id;
                update_count_view(data2, cb2);
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    if (is_translation_prompt_opened === true) {
                        modal(".prompt#translation-prompt", "open");
                    } else {
                        if (is_opinion_prompt_parent === true) {
                            if (is_agenda_prompt_opened === true) {
                                modal(".prompt#agenda-prompt", "open");
                            } else {
                                if (is_opinion_prompt_opened === true) {
                                    modal(".prompt#opinion-prompt", "open");
                                }
                            }
                        } else {
                            if (is_opinion_prompt_opened === true) {
                                modal(".prompt#opinion-prompt", "open");
                            } else {
                                if (is_agenda_prompt_opened === true) {
                                    modal(".prompt#agenda-prompt", "open");
                                }
                            }
                        }
                    }
                    if (result['msg'] === 'no_access') {
                        show_bert("danger", 2000, i18n[lang].only_invited_users_can_write_it);
                    } else {
                        show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                    }
                }
            }
        };
        var f_cb = function () {
            modal(".prompt#mars-prompt", "close");
            is_mars_prompt_opened = false;
            if (mars_editor_focuser !== undefined && mars_editor_focuser !== null) {
                mars_editor_focuser.blur();
            }
            if (is_translation_prompt_opened === true) {
                modal(".prompt#translation-prompt", "open");
            } else {
                if (is_opinion_prompt_parent === true) {
                    if (is_agenda_prompt_opened === true) {
                        modal(".prompt#agenda-prompt", "open");
                    } else {
                        if (is_opinion_prompt_opened === true) {
                            modal(".prompt#opinion-prompt", "open");
                        }
                    }
                } else {
                    if (is_opinion_prompt_opened === true) {
                        modal(".prompt#opinion-prompt", "open");
                    } else {
                        if (is_agenda_prompt_opened === true) {
                            modal(".prompt#agenda-prompt", "open");
                        }
                    }
                }
            }
            show_bert("danger", 2000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/update/translation",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
});