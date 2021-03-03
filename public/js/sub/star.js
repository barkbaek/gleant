$(document).ready(function() {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    $(document).on('click', '.btn-write-opinion', function (e) {
        e.preventDefault();
        var is_loginned = $("body").attr("data-check") === "true"
            , lang = $("body").attr("data-lang")
            , css_version = $("body").attr("data-css-version");
        if (is_loginned === false) {
            modal(".prompt#request-login-prompt", "open");
            return false;
        }
        if (lang === undefined) {
            lang = "en";
        }
        is_w_opinion_opened = false;
        $(".btn-opinion.ing-write img").attr("src", aws_s3_url + "/icons/write-opinion.png");
        $(".btn-opinion.ing-write").removeClass("selected").removeClass("ing-write");
        $(".write-opinion-wrapper").empty().removeClass("opened");
        $(".request-opinion-wrapper").empty().removeClass("opened");
        opinion_menu_obj["$written"].find(".opinion-of-agenda:first").css("display", "none");
        opinion_menu_obj["$written"].find(".opinion-list-of-agenda:first").empty();
        opinion_menu_obj["$written"].find(".opinion-list-of-agenda-modal:first").empty();
        opinion_menu_obj["$written"].find(".btn-opinion:first").removeClass("selected").removeClass("ing-view").removeClass("ing-write").removeClass("ing-request");
        opinion_menu_obj["$written"].find(".btn-opinion:first img").attr("src", aws_s3_url + "/icons/write-opinion.png" + css_version);
        /*
        is_w_translation_opened = false;
        $(".btn-translation.ing-write img").attr("src", aws_s3_url + "/icons/write-translation.png");
        $(".btn-translation.ing-write").removeClass("selected").removeClass("ing-write");
        $(".write-translation-wrapper").empty().removeClass("opened");
        $(".request-translation-wrapper").empty().removeClass("opened");
        opinion_menu_obj["$written"].find(".translation-list-wrapper:first").css("display", "none");
        opinion_menu_obj["$written"].find(".translation-list:first").empty();
        opinion_menu_obj["$written"].find(".btn-translation:first").removeClass("selected").removeClass("ing-view").removeClass("ing-write").removeClass("ing-request");
        opinion_menu_obj["$written"].find(".btn-translation:first img").attr("src", aws_s3_url + "/icons/write-translation.png" + css_version);
        */
        opinion_menu_obj["$written"].find(".comments-wrapper.outer-comments:first").empty().removeClass("opened");
        opinion_menu_obj["$written"].find(".btn-open-comments:first").removeClass("selected");
        opinion_menu_obj["$written"].find(".btn-open-comments:first img").attr("src", aws_s3_url + "/icons/comments.png" + css_version);
        if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
            star_editor_focuser.blur();
        }
        if (moon_editor_focuser !== undefined && moon_editor_focuser !== null) {
            moon_editor_focuser.blur();
        }
        if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
            write_form["rebuild_write_form_data_as_ground"]();
        }
        opinion_menu_obj["$btn_wrapper"].find(".btn-opinion:first").addClass("selected").addClass("ing-write");
        opinion_menu_obj["$btn_wrapper"].find(".btn-opinion:first img").attr("src", aws_s3_url + "/icons/write-opinion-selected.png");
        modal(".prompt#opinion-menu-prompt", "close");
        var $current_write_opinion_wrapper = opinion_menu_obj["$written"].find(".write-opinion-wrapper:first");
        is_w_opinion_opened = true;
        write_form["current_type"] = "opinion";
        write_form["current_related_id"] = opinion_menu_obj["_id"];
        write_form["current_action"] = "write";
        write_form["current_env_type"] = "star";
        write_form["print_write_form_data"]();
        var s_cb = function (result) {
            if ( result['response'] === true ) {
                var user = result['doc'];
                var profile = "";
                if (user["show_simple_career"] === true) {
                    profile = user["simple_career"];
                }
                var returned_objs  = blog["contents"]["get"]["profile_item_for_show"]("employment", user["employment"], lang);
                user["employment"] = returned_objs.item;
                if (profile === "") {
                    profile = returned_objs.str_list;
                } else {
                    if (returned_objs.str_list !== "") {
                        if (
                            lang === "en" ||
                            lang === "ko"
                        ) {
                            profile = profile + ", " + returned_objs.str_list;
                        } else {
                            profile = profile + "、" + returned_objs.str_list;
                        }
                    }
                }
                returned_objs = blog["contents"]["get"]["profile_item_for_show"]("education", user["education"], lang);
                user["education"] = returned_objs.item;
                if (profile === "") {
                    profile = returned_objs.str_list;
                } else {
                    if (returned_objs.str_list !== "") {
                        if (
                            lang === "en" ||
                            lang === "ko"
                        ) {
                            profile = profile + ", " + returned_objs.str_list;
                        } else {
                            profile = profile + "、" + returned_objs.str_list;
                        }
                    }
                }
                returned_objs = blog["contents"]["get"]["profile_item_for_show"]("prize", user["prize"], lang);
                user["prize"] = returned_objs.item;
                if (profile === "") {
                    profile = returned_objs.str_list;
                } else {
                    if (returned_objs.str_list !== "") {
                        if (
                            lang === "en" ||
                            lang === "ko"
                        ) {
                            profile = profile + ", " + returned_objs.str_list;
                        } else {
                            profile = profile + "、" + returned_objs.str_list;
                        }
                    }
                }
                returned_objs = blog["contents"]["get"]["profile_item_for_show"]("location", user["location"], lang);
                user["location"] = returned_objs.item;
                if (profile === "") {
                    profile = returned_objs.str_list;
                } else {
                    if (returned_objs.str_list !== "") {
                        if (
                            lang === "en" ||
                            lang === "ko"
                        ) {
                            profile = profile + ", " + returned_objs.str_list;
                        } else {
                            profile = profile + "、" + returned_objs.str_list;
                        }
                    }
                }
                var write_top_description = "<div class='write-top-description'>" + i18n[lang].lower_profile_will_be_displayed + "</div>";
                var img = "<img src='" + user.img + "' alt='" + user.name + "' title='" + user.name + "'>";
                var user_profile_left = "<div class='user-profile-left'>" + img + "</div>";
                var user_name = "<span class='user-name'>" + user.name + "</span>";
                var div = "<div>" + user_name + "</div>";
                var user_info = "<div class='user-info showing-profile'>" + profile + "</div>";
                var user_profile_right = "<div class='user-profile-right'>" + div + user_info + "</div>";
                var user_profile = "<div class='user-profile'>" + user_profile_left + user_profile_right + "</div>";
                var btn_career = "<input class='btn-career change-show-career' type='button' value='" + i18n[lang].edit + "'>";
                var btn_career_wrapper = "<div class='btn-career-wrapper'>" + btn_career + "</div>";
                var write_top = "<div class='write-top'>" + write_top_description + user_profile + btn_career_wrapper + "</div>";
                var span1 = "<span class='write-label'>" + i18n[lang].language + "</span>";
                var select1 = "<select class='written-language'></select>";
                var label1 = "<label style='display:inline-block;'>" + span1 + select1 + "</label>";
                /*var written_language_wrapper = "<div class='written-language-wrapper'>" + label1 + "</div>";*/
                var written_language_wrapper = "";
                span1 = "<span class='write-label'>" + i18n[lang].category + "</span>";
                select1 = "<select class='main-tag'></select>";
                var label2 = "<label style='display:inline-block;'>" + span1 + select1 + "</label>";
                var main_tag_wrapper = "<div class='main-tag-wrapper'>" + label2 + "</div>";
                var span3 = "<span class='write-label'>" + i18n[lang].title + "</span>";
                var input1 = "<input class='write-title' type='text' placeholder=''>";
                var label3 = "<label>" + span3 + input1 + "</label>";
                span1 = "<span class='write-label'>" + i18n[lang].content + "</span>";
                var textarea = "<textarea id='star-editor' class='write-content' placeholder=''></textarea>";
                div = "<div class='write-content-wrapper'>" + textarea + "</div>";
                var label4 = "<label for='star-editor'>" + span1 + div + "</label>";
                span1 = "<span class='write-label'>" + i18n[lang].tags + "</span>";
                div = "<div class='write-label-description'>E.g. #gleant#debate</div>";
                input1 = "<input class='tags' type='text' placeholder=''>";
                var label5 = "<label>" + span1 + div + input1 + "</label>";
                var btn_initialization = "<input class='btn-career btn-initialization' type='button' value='" + i18n[lang].init + "'>";
                var write_cancel = "";
                var write_submit = "<input class='btn-career write-submit' type='button' value='" + i18n[lang].check + "'>";
                btn_career_wrapper = "<div class='btn-career-wrapper'>" + btn_initialization + write_cancel + write_submit + "</div>";
                var write_form1 = "<form class='write-form'>" + written_language_wrapper + main_tag_wrapper + label3 + label4 + label5 + btn_career_wrapper + "</form>";
                var star = "<div id='star'>" + write_top + write_form1 + "</div>";
                $current_write_opinion_wrapper.append(star).addClass('opened');
                CKEDITOR.replace('star-editor', {
                    on: {instanceReady: function(e) {
                        $("#star").attr("data-type", "opinion");
                        write_form["init"]("star", "opinion");
                        var editor = e.editor;
                        editor.on('focus', function (e) {
                            $('.write-content-wrapper').css('border-color', '#5a00e0');
                            $('.cke_top').css('border-color', '#5a00e0');
                        });
                        editor.on('blur', function (e) {
                            $('.write-content-wrapper').css('border-color', '#ebebeb');
                            $('.cke_top').css('border-color', '#ebebeb');
                        });
                    }},
                    placeholder: ""
                });
                star_editor_focuser = new CKEDITOR.focusManager( CKEDITOR.instances["star-editor"] );
                if (language && language.init) {
                    language.init();
                }
                if (main_tags !== null) {
                    var option;
                    for (var i = 0; i < main_tags.length; i++) {
                        if (i === 0) {
                            option = "<option selected='selected' value='" + main_tags[i]["tag"] + "'>" + i18n[lang][main_tags[i]["tag"]] + "</option>";
                        } else {
                            option = "<option value='" + main_tags[i]["tag"] + "'>" + i18n[lang][main_tags[i]["tag"]] + "</option>";
                        }
                        $("#star select.main-tag").append($.parseHTML(option));
                    }
                }
            } else {
                if (result["msg"] === "no_blog_id") {
                    return window.location = "/set/blog-id";
                } else {
                    is_w_opinion_opened = false;
                    if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                        star_editor_focuser.blur();
                    }
                    if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
                        write_form["rebuild_write_form_data_as_ground"]();
                    }
                }
            }
        };
        var f_cb = function () {
            is_w_opinion_opened = false;
            if (star_editor_focuser !== undefined && star_editor_focuser !== null) {
                star_editor_focuser.blur();
            }
            if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
                write_form["rebuild_write_form_data_as_ground"]();
            }
        };
        methods["the_world"]["is_one"]({
            show_animation: false,
            data:{type:encodeURIComponent("all"),id:encodeURIComponent("all")},
            pathname:'/get/profile',
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
});