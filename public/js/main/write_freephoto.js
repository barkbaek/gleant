$(document).ready(function () {
    var lang = $("body").attr("data-lang")
        , $selected_freephoto
        , selected_freephoto_id = ""
        , selected_freephoto_category = "";
    if (lang === undefined) {
        lang = "en";
    }
    /* Select URL */
    $(document).on('click', '#write-freephoto-url-submit', function (e) {
        e.preventDefault();
        var data = {}
            , url = $("#write-freephoto-url").val()
            , img = ""
            , f_cb
            , s_cb;
        data.url = encodeURIComponent(url);
        s_cb = function (result) {
            if (result.response === true) {
                $("#write-freephoto").css("display", "none");
                if ( $("#write-freephoto-url").length > 0 ) { /* When [Select URL] */
                    $("#write-freephoto-url").val("");
                } else {  /* When [Select on device] */
                    $('#upload-freephoto').val("");
                }
                img = "<img src='" + result['img'].replace('/resized/', '/square/') + "'>";
                $("#selected-square-freephoto").empty().append(img);
                $("#selected-freephoto").css("display", "block");
                selected_freephoto_id = result['_id'];
            } else {
                show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_login);
            }
        };
        f_cb = function () {
            show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_login);
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/download/freephoto",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    /* Select Device */
    $(document).on('click', '#write-freephoto-device', function (e) {
        e.preventDefault();
        $('#upload-freephoto').val("");
        document.getElementById('upload-freephoto').click();
        return false;
    });
    $("#upload-freephoto").change(function (e) {
        var file = $('input[type=file]#upload-freephoto')[0].files[0];
        if (!$('#upload-freephoto').val().match(/.(jpg|jpeg|png|gif)$/i)) {
            show_bert("danger", 2000, i18n[lang].use_only_jpg_jpeg_png_gif_extension);
            return false;
        }
        if (file["size"] > 5242880) {
            show_bert("danger", 2000, i18n[lang].image_size_must_be_less_than_5mb);
            return false;
        }
        animation("wait", "play");
        $("#upload-freephoto-form").trigger("submit");
    });
    $('iframe#upload-freephoto-iframe').load(function() {
        var iframe = document.getElementById("upload-freephoto-iframe");
        var doc = iframe.contentDocument || iframe.contentWindow.document;
        var target, result, img = "";
        animation("wait", "stop");
        target = doc.getElementById("result-inserting-image");
        if (target) {
            result = target.innerHTML;
            result = JSON.parse(result);
            if (result['res'] === false) {
                if (result['reason'] === 'server_error') {
                    show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                } else {
                    show_bert("danger", 2000, i18n[lang].image_size_must_be_less_than_5mb);
                }
                return false;
            } else {
                $("#write-freephoto").css("display", "none");
                if ( $("#write-freephoto-url").length > 0 ) { /* When [Select URL] */
                    $("#write-freephoto-url").val("");
                } else {  /* When [Select on device] */
                    $('#upload-freephoto').val("");
                }
                img = "<img src='" + result['img'].replace('/resized/', '/square/') + "'>";
                $("#selected-square-freephoto").empty().append(img);
                $("#selected-freephoto").css("display", "block");
                selected_freephoto_id = result['_id'];
            }
        } else {
            show_bert("danger", 2000, i18n[lang].image_size_must_be_less_than_5mb);
            return false;
        }
    });
    /* STEP2 Set category */
    $(document).on('click', '#write-freephoto-category-submit', function (e) {
        e.preventDefault();
        var data = {}
            , mt
            , main_tag = $("select#write-freephoto-category option:selected").val()
            , f_cb
            , s_cb
            , is_cms_edit_prompt = $(".prompt#cms-edit-prompt").length > 0;
        data._id = encodeURIComponent(selected_freephoto_id);
        data.main_tag = encodeURIComponent(main_tag);
        s_cb = function (result) {
            if (result.response === true) {
                if (is_cms_edit_prompt === true) {
                    show_bert("success", 2000, i18n[lang].successfully_changed_category);
                    mt = $("body").attr("data-mt");
                    if (mt === "all") {
                        $selected_freephoto.attr("data-category", main_tag);
                        $selected_freephoto.find(".freephoto-item-category").text( i18n[lang][main_tag] );
                        $selected_freephoto = undefined;
                        selected_freephoto_id = "";
                        selected_freephoto_category = "";
                    } else if (mt === "unselected") {
                        $selected_freephoto.remove();
                        $selected_freephoto = undefined;
                        selected_freephoto_id = "";
                        selected_freephoto_category = "";
                    } else {
                        if (main_tag !== selected_freephoto_category) {
                            $selected_freephoto.remove();
                            $selected_freephoto = undefined;
                            selected_freephoto_id = "";
                            selected_freephoto_category = "";
                        }
                    }
                    modal(".prompt#cms-edit-prompt", "close");
                } else {
                    show_bert("success", 2000, i18n[lang].successfully_added_image);
                    $("#write-freephoto").css("display", "block");
                    $("#selected-freephoto").css("display", "none");
                    selected_freephoto_id = "";
                }
            } else {
                show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_login);
            }
        };
        f_cb = function () {
            show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_login);
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/update/freephoto-category",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    /* Edit Freephoto Item */
    $(document).on('click', '.freephoto-edit', function (e) {
        e.preventDefault();
        var img;
        $selected_freephoto = $(e.currentTarget).parent();
        img = "<img src='" + $selected_freephoto.attr("data-img") + "'>";
        $("#selected-square-freephoto").empty().append(img);
        selected_freephoto_id = $selected_freephoto.attr("data-id");
        selected_freephoto_category = $selected_freephoto.attr("data-category");
        if (selected_freephoto_category === "") {
            $('select#write-freephoto-category option[value=politics]').prop('selected', true);
        } else {
            $('select#write-freephoto-category option[value=' + selected_freephoto_category + ']').prop('selected', true);
        }
        modal(".prompt#cms-edit-prompt", "open");
        return false;
    });
    $(document).on("click", ".prompt#cms-edit-prompt .close", function (e) {
        e.preventDefault();
        modal(".prompt#cms-edit-prompt", "close");
        return false;
    });
    /* Remove Freephoto Item */
    $(document).on('click', '.freephoto-remove', function (e) {
        e.preventDefault();
        $selected_freephoto = $(e.currentTarget).parent();
        selected_freephoto_id = $selected_freephoto.attr("data-id");
        modal(".prompt#cms-remove-prompt", "open");
        return false;
    });
    $(document).on("click", ".prompt#cms-remove-prompt #btn-cms-remove-ok", function (e) {
        e.preventDefault();
        var data = {}
            , f_cb
            , s_cb;
        data._id = encodeURIComponent(selected_freephoto_id);
        s_cb = function (result) {
            if (result.response === true) {
                modal(".prompt#cms-remove-prompt", "close");
                show_bert("success", 2000, i18n[lang].successfully_removed_image);
                $selected_freephoto.remove();
                $selected_freephoto = undefined;
                selected_freephoto_id = "";
            } else {
                show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_login);
            }
        };
        f_cb = function () {
            show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_login);
        };
        methods["the_world"]["is_one"]({
            show_animation: true,
            data:data,
            pathname:"/remove/freephoto",
            s_cb:s_cb,
            f_cb:f_cb
        });
        return false;
    });
    $(document).on("click", ".prompt#cms-remove-prompt .close, .prompt#cms-remove-prompt #btn-cms-remove-cancel", function (e) {
        e.preventDefault();
        modal(".prompt#cms-remove-prompt", "close");
        return false;
    });
});