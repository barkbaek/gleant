var write_form = {};
var realtime_comments = {};
var image_prompt = {};
var user_gallery_old_date = undefined;
write_form["ground_type"] = null;
write_form["current_env_type"] = null;
write_form["current_type"] = null;
write_form["current_action"] = null;
write_form["current_related_id"] = null;
write_form["print_write_form_data"] = function () {
    // console.log("\n********** write_form data **********\n");
    // console.log("\ncurrent_env_type: " + write_form["current_env_type"]);
    // console.log("\ncurrent_type: " + write_form["current_type"]);
    // console.log("\ncurrent_action: " + write_form["current_action"]);
    // console.log("\ncurrent_related_id: " + write_form["current_related_id"]);
    // console.log("\n\nground_type: " + write_form["ground_type"]);
    // console.log("\n*************************************\n");
};
write_form["total_init"] = function () {
    if (
        $('#ground-editor').length === 0 &&
        $('#space-editor').length === 0 &&
        $('#star-editor').length === 0 &&
        $('#unicorn-editor').length === 0 &&
        $('#superior-editor').length === 0
    ) {
        return false;
    }
    var pathname = window.location.pathname;
    var temp = pathname.split('/');
    if (temp[1] === 'write') {
        if (temp[2] === 'agenda') {
            write_form["ground_type"] = "write.agenda";
        } else if (temp[2] === 'hire-me') {
            write_form["ground_type"] = "write.hire_me";
        } else if (temp[2] === 'apply-now') {
            write_form["ground_type"] = "write.apply_now";
        }
    } else if (temp[1] === 'hire-me') {
        if (temp[2] === undefined) {
            write_form["ground_type"] = null;
        } else {
            write_form["ground_type"] = "edit.hire_me";
        }
    } else if (temp[1] === 'apply-now') {
        if (temp[2] === undefined) {
            write_form["ground_type"] = null;
        } else {
            write_form["ground_type"] = "edit.apply_now";
        }
    } else if (temp[1] === 'agenda'){
        if (temp[2] === undefined) {
            write_form["ground_type"] = null;
        } else if (temp[3] === 'opinion') {
            write_form["ground_type"] = "edit.opinion";
        } else if (temp[3] === undefined) {
            write_form["ground_type"] = "edit.agenda";
        }
    } else if (temp[1] === 'blog'){
        if (temp[2] === undefined ||
            temp[3] === undefined ||
            temp[4] === undefined) {
            write_form["ground_type"] = null;
        } else {
            if (temp[3] === 'write') {
                if (temp[4] === undefined) {
                    write_form["ground_type"] = null;
                } else {
                    if (temp[4] === 'gallery') {
                        write_form["ground_type"] = "write.gallery";
                    } else {
                        write_form["ground_type"] = "write.blog";
                    }
                }
            } else {
                if (temp[4] === undefined) {
                    write_form["ground_type"] = null;
                } else {
                    if (temp[3] === 'gallery') {
                        write_form["ground_type"] = "edit.gallery";
                    } else {
                        write_form["ground_type"] = "edit.blog";
                    }
                }
            }
        }
    } else if (temp[1] === 'cms') {
        write_form["ground_type"] = "write.announcement";
    } else {
        write_form["ground_type"] = null;
    }
    if ($('#ground-editor').length !== 0 &&  write_form["ground_type"] !== null) {
        var g_type = write_form["ground_type"].split('.')[1];
        if (g_type !== "gallery") {
            if (
                g_type === "hire_me" ||
                g_type === "apply_now" ||
                g_type === "announcement"
            ) {
                CKEDITOR.replace('ground-editor', {
                    customConfig : '../../../ckeditor/employment_config.js',
                    on: {
                        instanceReady: function (e) {
                            $("#ground").attr("data-type", g_type);
                            write_form["init"]("ground", g_type);
                            var editor = e.editor;
                            editor.on('focus', function (e) {
                                $('.write-content-wrapper').css('border-color', '#5a00e0');
                                $('.cke_top').css('border-color', '#5a00e0');
                            });
                            editor.on('blur', function (e) {
                                $('.write-content-wrapper').css('border-color', '#ebebeb');
                                $('.cke_top').css('border-color', '#ebebeb');
                            });
                        }
                    },
                    placeholder: ""
                });
            } else if (g_type === "blog") {
                CKEDITOR.replace('ground-editor', {
                    customConfig : '../../../ckeditor/blog_config.js',
                    on: {
                        instanceReady: function (e) {
                            $("#ground").attr("data-type", g_type);
                            write_form["init"]("ground", g_type);
                            var editor = e.editor;
                            editor.on('focus', function (e) {
                                $('.write-content-wrapper').css('border-color', '#5a00e0');
                                $('.cke_top').css('border-color', '#5a00e0');
                            });
                            editor.on('blur', function (e) {
                                $('.write-content-wrapper').css('border-color', '#ebebeb');
                                $('.cke_top').css('border-color', '#ebebeb');
                            });
                        }
                    },
                    placeholder: ""
                });
            } else {
                CKEDITOR.replace('ground-editor', {
                    on: {
                        instanceReady: function (e) {
                            $("#ground").attr("data-type", g_type);
                            write_form["init"]("ground", g_type);
                            var editor = e.editor;
                            editor.on('focus', function (e) {
                                $('.write-content-wrapper').css('border-color', '#5a00e0');
                                $('.cke_top').css('border-color', '#5a00e0');
                            });
                            editor.on('blur', function (e) {
                                $('.write-content-wrapper').css('border-color', '#ebebeb');
                                $('.cke_top').css('border-color', '#ebebeb');
                            });
                        }
                    },
                    placeholder: ""
                });
            }
            ground_editor_focuser = new CKEDITOR.focusManager(CKEDITOR.instances["ground-editor"]);
        } else {
            $("#ground").attr("data-type", g_type);
            write_form["init"]("ground", g_type);
        }
    }

    if ( $('#unicorn-editor').length !== 0 ) {
        CKEDITOR.replace('unicorn-editor', {
            customConfig : '../../../ckeditor/employment_config.js',
            on: {instanceReady: function(e) {
                $("#unicorn").attr("data-type", "apply_now");
                write_form["init"]("unicorn", "apply_now");
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
        unicorn_editor_focuser = new CKEDITOR.focusManager( CKEDITOR.instances["unicorn-editor"] );
    }

    if ( $('#superior-editor').length !== 0 ) {
        CKEDITOR.replace('superior-editor', {
            customConfig : '../../../ckeditor/employment_config.js',
            on: {instanceReady: function(e) {
                $("#superior").attr("data-type", "hire_me");
                write_form["init"]("superior", "hire_me");
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
        superior_editor_focuser = new CKEDITOR.focusManager( CKEDITOR.instances["superior-editor"] );
    }

    if ( $('#star-editor').length !== 0 ) {
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
    }

    if ( $("#space-editor").length !== 0 ) {
        CKEDITOR.replace("space-editor",{
            on: {instanceReady: function(e) {
                $("#space").attr("data-type", "agenda");
                write_form["init"]("space", "agenda");
                var editor = e.editor;
                editor.on("focus", function (e) {
                    $(".write-content-wrapper").css("border-color", "#5a00e0");
                    $(".cke_top").css("border-color", "#5a00e0");
                });
                editor.on("blur", function (e) {
                    $(".write-content-wrapper").css("border-color", "#ebebeb");
                    $(".cke_top").css("border-color", "#ebebeb");
                });
            }},
            placeholder: ""
        });
        space_editor_focuser = new CKEDITOR.focusManager( CKEDITOR.instances["space-editor"] );
    }
    CKEDITOR.config.allowedContent = ['iframe[*]', 'blockquote[*]', 'p[*]', 'img[*]', 'span[*]', 'div[*]', 'a[*]', 'strong[*]', 'u[*]', 'em[*]', 'br'];
};

write_form["get_debate_setting"] = function (doc) {
    var css_version = $("body").attr("data-css-version");
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var debate_public_authority_wrapper
        , writing_authority_wrapper
        , writing_authority_content_wrapper
        , writing_authority_content = ""
        , writing_authority_content_inner
        , time_setting_wrapper
        , time_setting_content_wrapper
        , time_setting_content = ""
        , time_setting_content_inner
        , label
        , input
        , temp
        , div
        , span
        , select
        , option
        , option_list = ""
        , year
        , month
        , day_of_month
        , days_of_month
        , day_of_week
        , hours
        , minutes
        , debate_start_fixed_datetime
        , debate_start_year
        , debate_start_month
        , debate_start_day_of_month
        , debate_start_day_of_week
        , debate_start_hours
        , debate_start_minutes
        , debate_start_datetime
        , debate_deadline_fixed_datetime
        , debate_deadline_year
        , debate_deadline_month
        , debate_deadline_day_of_month
        , debate_deadline_day_of_week
        , debate_deadline_hours
        , debate_deadline_minutes
        , debate_deadline_datetime;

    span = "<span class='write-label'>" + i18n[lang].public_setting + "</span>";
    if (doc && doc.public_authority === 2) {
        option = "<option value='2' selected='selected'>" + i18n[lang].invited_users + "</option>";
        option_list = option_list + option;
        option = "<option value='1'>" + i18n[lang].public + "</option>";
        option_list = option_list + option;
    } else {
        option = "<option value='1' selected='selected'>" + i18n[lang].public + "</option>";
        option_list = option_list + option;
        option = "<option value='2'>" + i18n[lang].invited_users + "</option>";
        option_list = option_list + option;
    }
    select = "<select class='debate-public-authority'>" + option_list + "</select>";
    label = "<label style='display:inline-block;'>" + span + select + "</label>";
    debate_public_authority_wrapper = "<div class='debate-public-authority-wrapper' style='margin-bottom:10px;'>" + label + "</div>";
    span = "<span class='write-label'>" + i18n[lang].writing_permission + "</span>";
    label = "<label style='display:inline-block;'>" + span + "</label>";
    option_list = "";
    if (doc && doc.opinion_authority === 2) {
        option = "<option value='2' selected='selected'>" + i18n[lang].invited_users + "</option>";
        option_list = option_list + option;
        option = "<option value='1'>" + i18n[lang].all_users + "</option>";
        option_list = option_list + option;
    } else {
        option = "<option value='1' selected='selected'>" + i18n[lang].all_users + "</option>";
        option_list = option_list + option;
        option = "<option value='2'>" + i18n[lang].invited_users + "</option>";
        option_list = option_list + option;
    }
    select = "<select class='opinion-writing-authority'>" + option_list + "</select>";
    span = "<span class='write-label'>" + i18n[lang].opinion + "</span>";
    temp = "<label style='display:inline-block;'>" + span + select + "</label>";
    writing_authority_content_inner = "<div class='writing-authority-content-inner'>" + temp + "</div>";
    writing_authority_content = writing_authority_content + writing_authority_content_inner;
    /*option_list = "";
    if (doc && doc.translation_authority === 2) {
        option = "<option value='2' selected='selected'>" + i18n[lang].invited_users + "</option>";
        option_list = option_list + option;
        option = "<option value='1'>" + i18n[lang].all_users + "</option>";
        option_list = option_list + option;
    } else {
        option = "<option value='1' selected='selected'>" + i18n[lang].all_users + "</option>";
        option_list = option_list + option;
        option = "<option value='2'>" + i18n[lang].invited_users + "</option>";
        option_list = option_list + option;
    }
    select = "<select class='translation-writing-authority'>" + option_list + "</select>";
    span = "<span class='write-label'>" + i18n[lang].translation + "</span>";
    temp = "<label style='display:inline-block;'>" + span + select + "</label>";
    writing_authority_content_inner = "<div class='writing-authority-content-inner'>" + temp + "</div>";
    writing_authority_content = writing_authority_content + writing_authority_content_inner;*/
    option_list = "";
    if (doc && doc.comment_authority === 2) {
        option = "<option value='2' selected='selected'>" + i18n[lang].invited_users + "</option>";
        option_list = option_list + option;
        option = "<option value='1'>" + i18n[lang].all_users + "</option>";
        option_list = option_list + option;
    } else {
        option = "<option value='1' selected='selected'>" + i18n[lang].all_users + "</option>";
        option_list = option_list + option;
        option = "<option value='2'>" + i18n[lang].invited_users + "</option>";
        option_list = option_list + option;
    }
    select = "<select class='comment-writing-authority'>" + option_list + "</select>";
    span = "<span class='write-label'>" + i18n[lang].comment + "</span>";
    temp = "<label style='display:inline-block;'>" + span + select + "</label>";
    writing_authority_content_inner = "<div class='writing-authority-content-inner'>" + temp + "</div>";
    writing_authority_content = writing_authority_content + writing_authority_content_inner;
    writing_authority_content = "<div class='writing-authority-content'>" + writing_authority_content + "</div>";
    writing_authority_content_wrapper = "<div class='writing-authority-content-wrapper'>" + writing_authority_content + "</div>";
    writing_authority_wrapper = "<div class='writing-authority-wrapper' style='margin-bottom:10px;'>" + label + writing_authority_content_wrapper + "</div>";

    span = "<span class='write-label'>" + i18n[lang].time_setting + "</span>";
    div = "<div>" + span  + "</div>";

    span = "<span class='clock'></span>";
    time_setting_content_inner = "<div class='time-setting-content-inner clock-wrapper'>" + span + "</div>";
    time_setting_content = time_setting_content + time_setting_content_inner;

    span = "<span class='write-label'>" + i18n[lang].start + "</span>";
    time_setting_content_inner = "<div class='time-setting-content-inner'>" + span + "</div>";
    time_setting_content = time_setting_content + time_setting_content_inner;

    span = "<span class='write-label' style='text-decoration: none;'>" + i18n[lang].right_now + "</span>";
    if (doc && doc.is_start_set === true) {
        input = "<input class='time-setting-start-right-now' type='checkbox'>";
    } else {
        input = "<input class='time-setting-start-right-now' type='checkbox' checked='checked'>";
    }

    label = "<label>" + span + input + "</label>";
    time_setting_content_inner = "<div class='time-setting-content-inner'>" + label + "</div>";
    time_setting_content = time_setting_content + time_setting_content_inner;

    if (doc && doc.is_start_set === true) {
        debate_start_datetime = new Date(doc.start_at);
    } else {
        debate_start_datetime = new Date();
        debate_start_datetime.setMilliseconds(0);
        debate_start_datetime.setSeconds(0);
        debate_start_datetime.setMinutes(0);
        debate_start_datetime.setHours(debate_start_datetime.getHours() + 2);
    }

    year = debate_start_datetime.getFullYear();
    month = debate_start_datetime.getMonth();
    day_of_month = debate_start_datetime.getDate();
    day_of_week = get_i18n_time_text({ type: "weekday", number: debate_start_datetime.getDay()});
    hours = debate_start_datetime.getHours();
    minutes = debate_start_datetime.getMinutes();

    option_list = "";
    for (var a = 0; a < 2; a++) {
        if (a === 0) {
            option = "<option value='" + (year + a) + "' selected='selected'>" +  get_i18n_time_text({type: "year", number: (year + a)}) + "</option>";
        } else {
            option = "<option value='" + (year + a) + "'>" + get_i18n_time_text({type: "year", number: (year + a)}) + "</option>";
        }
        option_list = option_list + option;
    }
    debate_start_year = "<select class='debate-start-year'>" + option_list + "</select>";

    option_list = "";
    for (var b = 0; b < 12; b++) {
        if (b === month) {
            option = "<option value='" + b + "' selected='selected'>" + get_i18n_time_text({type: "month", number: b}) + "</option>";
        } else {
            option = "<option value='" + b + "'>" + get_i18n_time_text({type: "month", number: b}) + "</option>";
        }
        option_list = option_list + option;
    }
    debate_start_month = "<select class='debate-start-month'>" + option_list + "</select>";

    days_of_month = get_days_of_month(year, month);

    option_list = "";
    for (var c = 0; c < days_of_month.length; c++) {
        if (days_of_month[c] === day_of_month) {
            option = "<option value='" + days_of_month[c] + "' selected='selected'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
        } else {
            option = "<option value='" + days_of_month[c] + "'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
        }
        option_list = option_list + option;
    }
    debate_start_day_of_month = "<select class='debate-start-day-of-month'>" + option_list + "</select>";

    debate_start_day_of_week = "<span class='debate-start-day-of-week'>" + day_of_week + "</span>";

    option_list = "";
    for (var e = 0; e < 24; e++) {
        temp = e < 10 ? '0' + e : e;
        if (e === hours) {
            option = "<option value='" + e + "' selected='selected'>" + temp + "</option>";
        } else {
            option = "<option value='" + e + "'>" + temp + "</option>";
        }
        option_list = option_list + option;
    }
    debate_start_hours = "<select class='debate-start-hours'>" + option_list + "</select>";

    option_list = "";
    for (var f = 0; f < 60; f++) {
        if (f === minutes) {
            temp = f < 10 ? '0' + f : f;
            option = "<option value='" + f + "' selected='selected'>" + temp + "</option>";
        } else {
            temp = f < 10 ? '0' + f : f;
            option = "<option value='" + f + "'>" + temp + "</option>";
        }
        option_list = option_list + option;
    }
    debate_start_minutes = "<select class='debate-start-minutes'>" + option_list + "</select>";
    debate_start_fixed_datetime = "<div class='debate-start-fixed-datetime'>" + to_i18n_fixed_datetime(debate_start_datetime) + "</div>";

    if (doc && doc.is_start_set === true) {
        time_setting_content_inner = "<div class='time-setting-content-inner time-setting-start-datetime-wrapper debate-setting-datetime'  data-datetime='" + debate_start_datetime.valueOf() + "' style='display:block;'>" + debate_start_fixed_datetime + debate_start_year + debate_start_month + debate_start_day_of_month + "<br class='mobile-only'>" + debate_start_day_of_week + debate_start_hours + ":" + debate_start_minutes + "</div>";
    } else {
        time_setting_content_inner = "<div class='time-setting-content-inner time-setting-start-datetime-wrapper debate-setting-datetime'  data-datetime='" + debate_start_datetime.valueOf() + "'>" + debate_start_fixed_datetime + debate_start_year + debate_start_month + debate_start_day_of_month + "<br class='mobile-only'>" + debate_start_day_of_week + debate_start_hours + ":" + debate_start_minutes + "</div>";
    }

    time_setting_content = time_setting_content + time_setting_content_inner;

    span = "<span class='write-label'>" + i18n[lang].deadline + "</span>";
    time_setting_content_inner = "<div class='time-setting-content-inner' style='border-top:1px solid #ebebeb;margin-top:5px;padding-top:10px;'>" + span + "</div>";
    time_setting_content = time_setting_content + time_setting_content_inner;

    span = "<span class='write-label' style='text-decoration: none;'>" + i18n[lang].unlimited + "</span>";

    if (doc && doc.is_finish_set === true) {
        input = "<input class='time-setting-deadline-unlimited' type='checkbox'>";
    } else {
        input = "<input class='time-setting-deadline-unlimited' type='checkbox' checked='checked'>";
    }

    label = "<label>" + span + input + "</label>";
    time_setting_content_inner = "<div class='time-setting-content-inner'>" + label + "</div>";
    time_setting_content = time_setting_content + time_setting_content_inner;
    if (doc && doc.is_finish_set === true) {
        debate_deadline_datetime = new Date(doc.finish_at);
    } else {
        debate_deadline_datetime = new Date();
        debate_deadline_datetime.setMilliseconds(0);
        debate_deadline_datetime.setSeconds(0);
        debate_deadline_datetime.setMinutes(0);
        debate_deadline_datetime.setHours(0);
        debate_deadline_datetime.setMonth(debate_deadline_datetime.getMonth() + 1);
    }
    year = debate_deadline_datetime.getFullYear();
    month = debate_deadline_datetime.getMonth();
    day_of_month = debate_deadline_datetime.getDate();
    day_of_week = get_i18n_time_text({ type: "weekday", number: debate_deadline_datetime.getDay()});
    hours = debate_deadline_datetime.getHours();
    minutes = debate_deadline_datetime.getMinutes();

    option_list = "";
    for (var a = 0; a < 5; a++) {
        if (a === 0) {
            option = "<option value='" + (year + a) + "' selected='selected'>" +  get_i18n_time_text({type: "year", number: (year + a)}) + "</option>";
        } else {
            option = "<option value='" + (year + a) + "'>" + get_i18n_time_text({type: "year", number: (year + a)}) + "</option>";
        }
        option_list = option_list + option;
    }
    debate_deadline_year = "<select class='debate-deadline-year'>" + option_list + "</select>";

    option_list = "";
    for (var b = 0; b < 12; b++) {
        if (b === month) {
            option = "<option value='" + b + "' selected='selected'>" + get_i18n_time_text({type: "month", number: b}) + "</option>";
        } else {
            option = "<option value='" + b + "'>" + get_i18n_time_text({type: "month", number: b}) + "</option>";
        }
        option_list = option_list + option;
    }
    debate_deadline_month = "<select class='debate-deadline-month'>" + option_list + "</select>";

    days_of_month = get_days_of_month(year, month);

    option_list = "";
    for (var c = 0; c < days_of_month.length; c++) {
        if (days_of_month[c] === day_of_month) {
            option = "<option value='" + days_of_month[c] + "' selected='selected'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
        } else {
            option = "<option value='" + days_of_month[c] + "'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
        }
        option_list = option_list + option;
    }
    debate_deadline_day_of_month = "<select class='debate-deadline-day-of-month'>" + option_list + "</select>";
    debate_deadline_day_of_week = "<span class='debate-deadline-day-of-week'>" + day_of_week + "</span>";

    option_list = "";
    for (var e = 0; e < 24; e++) {
        temp = e < 10 ? '0' + e : e;
        if (e === hours) {
            option = "<option value='" + e + "' selected='selected'>" + temp + "</option>";
        } else {
            option = "<option value='" + e + "'>" + temp + "</option>";
        }
        option_list = option_list + option;
    }
    debate_deadline_hours = "<select class='debate-deadline-hours'>" + option_list + "</select>";

    option_list = "";
    for (var f = 0; f < 60; f++) {
        if (f === minutes) {
            temp = f < 10 ? '0' + f : f;
            option = "<option value='" + f + "' selected='selected'>" + temp + "</option>";
        } else {
            temp = f < 10 ? '0' + f : f;
            option = "<option value='" + f + "'>" + temp + "</option>";
        }
        option_list = option_list + option;
    }
    debate_deadline_minutes = "<select class='debate-deadline-minutes'>" + option_list + "</select>";

    debate_deadline_fixed_datetime = "<div class='debate-deadline-fixed-datetime'>" + to_i18n_fixed_datetime(debate_deadline_datetime) + "</div>";

    if (doc && doc.is_finish_set === true) {
        time_setting_content_inner = "<div class='time-setting-content-inner time-setting-deadline-datetime-wrapper debate-setting-datetime' data-datetime='" + debate_deadline_datetime.valueOf() + "' style='display:block;'>" + debate_deadline_fixed_datetime + debate_deadline_year + debate_deadline_month + debate_deadline_day_of_month + "<br class='mobile-only'>" + debate_deadline_day_of_week + debate_deadline_hours + ":" + debate_deadline_minutes + "</div>";
    } else {
        time_setting_content_inner = "<div class='time-setting-content-inner time-setting-deadline-datetime-wrapper debate-setting-datetime' data-datetime='" + debate_deadline_datetime.valueOf() + "'>" + debate_deadline_fixed_datetime + debate_deadline_year + debate_deadline_month + debate_deadline_day_of_month + "<br class='mobile-only'>" + debate_deadline_day_of_week + debate_deadline_hours + ":" + debate_deadline_minutes + "</div>";
    }

    time_setting_content = time_setting_content + time_setting_content_inner;

    time_setting_content = "<div class='time-setting-content'>" + time_setting_content + "</div>";
    time_setting_content_wrapper = "<div class='time-setting-content-wrapper'>" + time_setting_content + "</div>";
    time_setting_wrapper = "<div class='time-setting-wrapper' style='margin-bottom:10px;'>" + div + time_setting_content_wrapper + "</div>";
    return "<div class='debate-setting'>" + debate_public_authority_wrapper + writing_authority_wrapper + time_setting_wrapper + "</div>";
};

write_form["get_hire_me_setting"] = function (doc) {
    var css_version = $("body").attr("data-css-version");
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var hire_me_public_authority_wrapper
        , label
        , input
        , temp
        , div
        , span
        , select
        , option
        , option_list = ""
        , written_language_wrapper
        , temp2
        , year
        , month
        , showing_write_salary
        , write_salary_parent_wrapper
        , salary_period
        , label_list;

    span = "<span class='write-label'>" + i18n[lang].public_setting + "</span>";
    if (doc && doc.public_authority === 2) {
        option = "<option value='2' selected='selected'>" + i18n[lang].invited_users + "</option>";
        option_list = option_list + option;
        option = "<option value='1'>" + i18n[lang].public + "</option>";
        option_list = option_list + option;
    } else {
        option = "<option value='1' selected='selected'>" + i18n[lang].public + "</option>";
        option_list = option_list + option;
        option = "<option value='2'>" + i18n[lang].invited_users + "</option>";
        option_list = option_list + option;
    }
    select = "<select class='hire-me-public-authority'>" + option_list + "</select>";
    label = "<label style='display:inline-block;'>" + span + select + "</label>";
    hire_me_public_authority_wrapper = "<div class='hire-me-public-authority-wrapper' style='margin-bottom:10px;'>" + label + "</div>";

    option_list = "";
    if (doc) {
        if (doc.language === "en") {
            option_list = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        } else if (doc.language === "ja") {
            option_list =  "<option class='lang-ja' value='ja' selected='selected'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
        } else if (doc.language === "ko") {
            option_list =  "<option class='lang-ko' value='ko' selected='selected'>" + i18n[lang].korean + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        } else if (doc.language === "zh-Hans") {
            option_list =  "<option class='lang-zh-Hans' value='zh-Hans' selected='selected'>" + i18n[lang].simplified_chinese + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
        } else {
            option_list = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        }
    } else {
        if (lang === "en") {
            option_list = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        } else if (lang === "ja") {
            option_list =  "<option class='lang-ja' value='ja' selected='selected'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
        } else if (lang === "ko") {
            option_list =  "<option class='lang-ko' value='ko' selected='selected'>" + i18n[lang].korean + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        } else if (lang === "zh-Hans") {
            option_list =  "<option class='lang-zh-Hans' value='zh-Hans' selected='selected'>" + i18n[lang].simplified_chinese + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
        } else {
            option_list = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        }
    }

    span = "<span class='write-label'>" + i18n[lang].language + "</span>";
    select = "<select class='written-language'>" + option_list + "</select>";
    temp = "<label style='display:inline-block;'>" + span + select + "</label>";
    /*written_language_wrapper = "<div class='written-language-wrapper'>" + temp + "</div>";*/
    written_language_wrapper = "";
    label_list = "";
    span = "<span class='write-label'>" + i18n[lang].job + "</span>";
    if (doc) {
        input = "<input class='write-job' type='text' placeholder='' value='" + get_encoded_html_preventing_xss(doc.job) + "'>";
    } else {
        input = "<input class='write-job' type='text' placeholder=''>";
    }
    label = "<label>" + span + input + "</label>";
    label_list = label_list + label;

    option_list = "";
    span = "<span class='write-label'>" + i18n[lang].employment_status + "</span>";
    if (doc) {
        if (doc.employment_status === "full_time") {
            option_list = "<option value='full_time' selected='selected'>" + i18n[lang].full_time + "</option><option value='part_time'>" + i18n[lang].part_time + "</option><option value='contract'>" + i18n[lang].contract + "</option><option value='intern'>" + i18n[lang].intern + "</option>";
        } else if (doc.employment_status === "part_time") {
            option_list = "<option value='full_time'>" + i18n[lang].full_time + "</option><option value='part_time' selected='selected'>" + i18n[lang].part_time + "</option><option value='contract'>" + i18n[lang].contract + "</option><option value='intern'>" + i18n[lang].intern + "</option>";
        } else if (doc.employment_status === "contract") {
            option_list = "<option value='full_time'>" + i18n[lang].full_time + "</option><option value='part_time'>" + i18n[lang].part_time + "</option><option value='contract' selected='selected'>" + i18n[lang].contract + "</option><option value='intern'>" + i18n[lang].intern + "</option>";
        } else if (doc.employment_status === "intern") {
            option_list = "<option value='full_time'>" + i18n[lang].full_time + "</option><option value='part_time'>" + i18n[lang].part_time + "</option><option value='contract'>" + i18n[lang].contract + "</option><option value='intern' selected='selected'>" + i18n[lang].intern + "</option>";
        } else {
            option_list = "<option value='full_time' selected='selected'>" + i18n[lang].full_time + "</option><option value='part_time'>" + i18n[lang].part_time + "</option><option value='contract'>" + i18n[lang].contract + "</option><option value='intern'>" + i18n[lang].intern + "</option>";
        }
    } else {
        option_list = "<option value='full_time' selected='selected'>" + i18n[lang].full_time + "</option><option value='part_time'>" + i18n[lang].part_time + "</option><option value='contract'>" + i18n[lang].contract + "</option><option value='intern'>" + i18n[lang].intern + "</option>";
    }

    select = "<select class='write-employment-status' type='text' placeholder=''>" + option_list + "</select>";
    label = "<label>" + span + select + "</label>";
    label_list = label_list + label;

    span = "<div class='write-label' style='margin-bottom:10px;'>" + i18n[lang].salary + "</div>";
    option_list = "";
    if (doc) {
        for (var i = 0; i < monetary_units.length; i++) {
            if (doc.salary_unit === monetary_units[i].unit) {
                showing_write_salary = put_comma_between_three_digits(doc.salary) + " " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                temp = "<option value='" + monetary_units[i].unit + "' selected='selected' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
            } else {
                temp = "<option value='" + monetary_units[i].unit + "' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
            }
            option_list = option_list + temp;
        }
    } else {
        for (var i = 0; i < monetary_units.length; i++) {
            if (lang === "en") {
                if (monetary_units[i].unit === "USD") {
                    showing_write_salary = "0 " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                    temp = "<option value='" + monetary_units[i].unit + "' selected='selected' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                } else {
                    temp = "<option value='" + monetary_units[i].unit + "' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                }
            } else if (lang === "ja") {
                if (monetary_units[i].unit === "JPY") {
                    showing_write_salary = "0 " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                    temp = "<option value='" + monetary_units[i].unit + "' selected='selected' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                } else {
                    temp = "<option value='" + monetary_units[i].unit + "' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                }
            } else if (lang === "ko") {
                if (monetary_units[i].unit === "KRW") {
                    showing_write_salary = "0 " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                    temp = "<option value='" + monetary_units[i].unit + "' selected='selected' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                } else {
                    temp = "<option value='" + monetary_units[i].unit + "' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                }
            } else if (lang === "zh-Hans") {
                if (monetary_units[i].unit === "CNY") {
                    showing_write_salary = "0 " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                    temp = "<option value='" + monetary_units[i].unit + "' selected='selected' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                } else {
                    temp = "<option value='" + monetary_units[i].unit + "' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                }
            } else {
                if (monetary_units[i].unit === "USD") {
                    showing_write_salary = "0 " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                    temp = "<option value='" + monetary_units[i].unit + "' selected='selected' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                } else {
                    temp = "<option value='" + monetary_units[i].unit + "' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                }
            }
            option_list = option_list + temp;
        }
    }
    if (doc) {
        input = "<input class='write-salary-input' type='number' value='" + doc.salary + "'>";
    } else {
        input = "<input class='write-salary-input' type='number'>";
    }
    temp = "<div class='write-salary-left'>" + input + "</div>";
    select = "<select class='write-salary-select'>" + option_list + "</select>";
    temp2 = "<div class='write-salary-right'>" + select + "</div>";
    div = "<div class='write-salary-wrapper'>" + temp + temp2 + "</div>";

    showing_write_salary = "<div class='showing-write-salary'>" + showing_write_salary + "</div>";
    if (doc) {
        if (doc.salary_period === "year") {
            option_list = "<option value='year' selected='selected'>" + i18n[lang].per_year + "</option><option value='month'>" + i18n[lang].per_month + "</option><option value='hour'>" + i18n[lang].per_hour + "</option>";
        } else if (doc.salary_period === "month") {
            option_list = "<option value='year'>" + i18n[lang].per_year + "</option><option value='month' selected='selected'>" + i18n[lang].per_month + "</option><option value='hour'>" + i18n[lang].per_hour + "</option>";
        } else if (doc.salary_period === "hour") {
            option_list = "<option value='year'>" + i18n[lang].per_year + "</option><option value='month'>" + i18n[lang].per_month + "</option><option value='hour' selected='selected'>" + i18n[lang].per_hour + "</option>";
        } else {
            option_list = "<option value='year' selected='selected'>" + i18n[lang].per_year + "</option><option value='month'>" + i18n[lang].per_month + "</option><option value='hour'>" + i18n[lang].per_hour + "</option>";
        }
    } else {
        option_list = "<option value='year' selected='selected'>" + i18n[lang].per_year + "</option><option value='month'>" + i18n[lang].per_month + "</option><option value='hour'>" + i18n[lang].per_hour + "</option>";
    }
    salary_period = "<select class='write-salary-period'>" + option_list + "</select>";

    temp = "<span class='write-label' style='padding-left:10px;'>" + i18n[lang].decide_after_consulting + "</span>";
    if (doc && doc.decide_salary_later === true) {
        write_salary_parent_wrapper = "<div class='write-salary-parent-wrapper' style='display:none;'>" + salary_period + showing_write_salary + div + "</div>";
        input = "<input class='decide-after-consulting' type='checkbox' checked='checked'>";
    } else {
        write_salary_parent_wrapper = "<div class='write-salary-parent-wrapper' style='display:block;'>" + salary_period + showing_write_salary + div + "</div>";
        input = "<input class='decide-after-consulting' type='checkbox'>";
    }

    label = "<label>" + span + temp + input +"</label>";
    label_list = label_list + label + write_salary_parent_wrapper;
    return "<div class='hire-me-setting'>" + hire_me_public_authority_wrapper + written_language_wrapper + label_list + "</div>";
};

write_form["get_apply_now_setting"] = function (doc) {
    var css_version = $("body").attr("data-css-version");
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var apply_now_public_authority_wrapper
        , online_interview_label
        , online_interview_wrapper
        , online_interview_content_wrapper
        , online_interview_content
        , online_interview_content_inner
        , time_setting_content = ""
        , time_setting_content_inner
        , label
        , logo
        , select_logo
        , remove_logo
        , img
        , input
        , temp
        , temp2
        , div
        , div2
        , span
        , select
        , option
        , option_list = ""
        , min_year
        , min_month
        , max_year
        , max_month
        , year
        , month
        , next_month
        , day_of_month
        , days_of_month
        , day_of_week
        , hours
        , minutes
        , apply_now_start_fixed_datetime
        , apply_now_start_year
        , apply_now_start_month
        , apply_now_start_day_of_month
        , apply_now_start_day_of_week
        , apply_now_start_hours
        , apply_now_start_minutes
        , apply_now_start_datetime
        , apply_now_deadline_fixed_datetime
        , apply_now_deadline_year
        , apply_now_deadline_month
        , apply_now_deadline_day_of_month
        , apply_now_deadline_day_of_week
        , apply_now_deadline_hours
        , apply_now_deadline_minutes
        , apply_now_deadline_datetime
        , showing_write_salary
        , written_language_wrapper
        , write_occupation_wrapper
        , write_salary_parent_wrapper
        , salary_period
        , label_list
        , online_interview_questions
        , online_interview_question_inner
        , online_interview_questions_content
        , now = new Date()
        , is_online_interview_time = false
        , ten_s_b4_start;

    if (doc && doc.is_online_interview_set === true) {
        if (doc.is_start_set === true) {
            ten_s_b4_start = new Date(doc.start_at);
            ten_s_b4_start.setSeconds(ten_s_b4_start.getSeconds() - 30);
            ten_s_b4_start = ten_s_b4_start.valueOf();
            if (now.valueOf() > ten_s_b4_start) {
                is_online_interview_time = true;
            }
        } else {
            is_online_interview_time = true;
        }
    }

    span = "<span class='write-label'>" + i18n[lang].public_setting + "</span>";
    if (doc && doc.public_authority === 2) {
        option = "<option value='2' selected='selected'>" + i18n[lang].invited_users + "</option>";
        option_list = option_list + option;
        option = "<option value='1'>" + i18n[lang].public + "</option>";
        option_list = option_list + option;
    } else {
        option = "<option value='1' selected='selected'>" + i18n[lang].public + "</option>";
        option_list = option_list + option;
        option = "<option value='2'>" + i18n[lang].invited_users + "</option>";
        option_list = option_list + option;
    }
    select = "<select class='apply-now-public-authority'>" + option_list + "</select>";
    label = "<label style='display:inline-block;'>" + span + select + "</label>";
    apply_now_public_authority_wrapper = "<div class='apply-now-public-authority-wrapper' style='margin-bottom:10px;'>" + label + "</div>";

    span = "<span class='write-label'>" + i18n[lang].online_interview + "</span>";
    if (doc) {
        if (doc.is_online_interview_set === true) {
            if (is_online_interview_time === true) {
                input = "<input class='online-interview' type='checkbox' checked='checked' disabled='disabled'>";
            } else {
                input = "<input class='online-interview' type='checkbox' checked='checked'>";
            }
        } else {
            input = "<input class='online-interview' type='checkbox'>";
        }
    } else {
        input = "<input class='online-interview' type='checkbox' checked='checked'>";
    }
    online_interview_label = "<label style='display:inline-block;'>" + span + input + "</label>";

    online_interview_content_inner = "";
    option_list = "";
    if (doc && doc.application_authority === 2) {
        option = "<option value='2' selected='selected'>" + i18n[lang].invited_users + "</option>";
        option_list = option_list + option;
        option = "<option value='1'>" + i18n[lang].all_users + "</option>";
        option_list = option_list + option;
    } else {
        option = "<option value='1' selected='selected'>" + i18n[lang].all_users + "</option>";
        option_list = option_list + option;
        option = "<option value='2'>" + i18n[lang].invited_users + "</option>";
        option_list = option_list + option;
    }
    select = "<select class='application-authority'>" + option_list + "</select>";
    span = "<span class='write-label'>" + i18n[lang].application_permission + "</span>";
    temp = "<label style='display:inline-block;'>" + span + select + "</label>";
    online_interview_content_inner = online_interview_content_inner + "<div class='online-interview-content-inner'>" + temp + "</div>";

    span = "<span class='clock'></span>";
    time_setting_content_inner = "<div class='time-setting-content-inner clock-wrapper'>" + span + "</div>";
    time_setting_content = time_setting_content + time_setting_content_inner;

    span = "<span class='write-label'>" + i18n[lang].start + "</span>";
    time_setting_content_inner = "<div class='time-setting-content-inner'>" + span + "</div>";
    time_setting_content = time_setting_content + time_setting_content_inner;

    if (is_online_interview_time === true) {
        apply_now_start_datetime = new Date(doc.start_at);
    } else {
        apply_now_start_datetime = new Date();
        apply_now_start_datetime.setMilliseconds(0);
        apply_now_start_datetime.setSeconds(0);
        apply_now_start_datetime.setMinutes(0);
        apply_now_start_datetime.setHours(apply_now_start_datetime.getHours() + 2);
    }
    if (is_online_interview_time === true) {
        apply_now_start_fixed_datetime = "<div class='apply-now-start-fixed-datetime blocked'>" + to_i18n_fixed_datetime(apply_now_start_datetime) + "</div>";
        time_setting_content_inner = "<div class='time-setting-content-inner time-setting-start-datetime-wrapper apply-now-setting-datetime'  data-datetime='" + apply_now_start_datetime.valueOf() + "' style='display:block;'>" + apply_now_start_fixed_datetime + "</div>";
    } else {
        span = "<span class='write-label' style='text-decoration: none;'>" + i18n[lang].right_now + "</span>";
        if (doc && doc.is_start_set === true) {
            input = "<input class='time-setting-start-right-now' type='checkbox'>";
        } else {
            input = "<input class='time-setting-start-right-now' type='checkbox' checked='checked'>";
        }
        label = "<label>" + span + input + "</label>";
        time_setting_content_inner = "<div class='time-setting-content-inner'>" + label + "</div>";
        time_setting_content = time_setting_content + time_setting_content_inner;

        max_year = min_year = year = apply_now_start_datetime.getFullYear();
        min_month = month = apply_now_start_datetime.getMonth();
        max_month = month + 1;
        day_of_month = apply_now_start_datetime.getDate();
        day_of_week = get_i18n_time_text({ type: "weekday", number: apply_now_start_datetime.getDay()});
        hours = apply_now_start_datetime.getHours();
        minutes = apply_now_start_datetime.getMinutes();

        if (now.getMonth() > (max_month % 12)) {
            if (max_month < 12) {
                max_month = max_month + 1;
            }
        }

        if (now.getMonth() < min_month) {
            min_month = now.getMonth();
        }

        if (max_month > 11) {
            max_year = max_year + 1;
        }

        if (now.getFullYear() > max_year) {
            max_year = now.getFullYear();
        }
        if (now.getFullYear() < min_year) {
            min_year = now.getFullYear();
        }

        /* Start Year */
        option_list = "";
        for (var i = min_year; i <= max_year; i++) {
            if (i === year) {
                option = "<option value='" + i + "' selected='selected'>" +  get_i18n_time_text({type: "year", number: i}) + "</option>";
            } else {
                option = "<option value='" + i + "'>" +  get_i18n_time_text({type: "year", number: i}) + "</option>";
            }
            option_list = option_list + option;
        }
        apply_now_start_year = "<select class='apply-now-start-year'>" + option_list + "</select>";

        /* Start Month */
        option_list = "";
        for (var i = min_month; i <= max_month; i++) {
            temp = i % 12;
            if (i > 11) {
                temp2 = max_year;
            } else {
                temp2 = min_year;
            }
            if (temp === month) {
                option = "<option value='" + temp + "' selected='selected' data-year='" + temp2 + "'>" + get_i18n_time_text({type: "month", number: temp}) + "</option>";
            } else {
                option = "<option value='" + temp + "' data-year='" + temp2 + "'>" + get_i18n_time_text({type: "month", number: temp}) + "</option>";
            }
            option_list = option_list + option;
        }
        apply_now_start_month = "<select class='apply-now-start-month'>" + option_list + "</select>";

        days_of_month = get_days_of_month(year, month);

        option_list = "";
        for (var c = 0; c < days_of_month.length; c++) {
            if (days_of_month[c] === day_of_month) {
                option = "<option value='" + days_of_month[c] + "' selected='selected'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
            } else {
                option = "<option value='" + days_of_month[c] + "'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
            }
            option_list = option_list + option;
        }
        apply_now_start_day_of_month = "<select class='apply-now-start-day-of-month'>" + option_list + "</select>";
        apply_now_start_day_of_week = "<span class='apply-now-start-day-of-week'>" + day_of_week + "</span>";
        option_list = "";
        for (var e = 0; e < 24; e++) {
            temp = e < 10 ? '0' + e : e;
            if (e === hours) {
                option = "<option value='" + e + "' selected='selected'>" + temp + "</option>";
            } else {
                option = "<option value='" + e + "'>" + temp + "</option>";
            }
            option_list = option_list + option;
        }
        apply_now_start_hours = "<select class='apply-now-start-hours'>" + option_list + "</select>";
        option_list = "";
        for (var f = 0; f < 60; f++) {
            if (f === minutes) {
                temp = f < 10 ? '0' + f : f;
                option = "<option value='" + f + "' selected='selected'>" + temp + "</option>";
            } else {
                temp = f < 10 ? '0' + f : f;
                option = "<option value='" + f + "'>" + temp + "</option>";
            }
            option_list = option_list + option;
        }
        apply_now_start_minutes = "<select class='apply-now-start-minutes'>" + option_list + "</select>";
        apply_now_start_fixed_datetime = "<div class='apply-now-start-fixed-datetime'>" + to_i18n_fixed_datetime(apply_now_start_datetime) + "</div>";

        if (doc && doc.is_start_set === true) {
            time_setting_content_inner = "<div class='time-setting-content-inner time-setting-start-datetime-wrapper apply-now-setting-datetime'  data-datetime='" + apply_now_start_datetime.valueOf() + "' style='display:block;'>" + apply_now_start_fixed_datetime + apply_now_start_year + apply_now_start_month + apply_now_start_day_of_month + "<br class='mobile-only'>" + apply_now_start_day_of_week + apply_now_start_hours + ":" + apply_now_start_minutes + "</div>";
        } else {
            time_setting_content_inner = "<div class='time-setting-content-inner time-setting-start-datetime-wrapper apply-now-setting-datetime'  data-datetime='" + apply_now_start_datetime.valueOf() + "'>" + apply_now_start_fixed_datetime + apply_now_start_year + apply_now_start_month + apply_now_start_day_of_month + "<br class='mobile-only'>" + apply_now_start_day_of_week + apply_now_start_hours + ":" + apply_now_start_minutes + "</div>";
        }
    }

    time_setting_content = time_setting_content + time_setting_content_inner;

    span = "<span class='write-label'>" + i18n[lang].deadline + "</span>";
    time_setting_content_inner = "<div class='time-setting-content-inner' style='border-top:1px solid #ebebeb;margin-top:5px;padding-top:10px;'>" + span + "</div>";
    time_setting_content = time_setting_content + time_setting_content_inner;
    span = "";
    time_setting_content_inner = "";
    time_setting_content = time_setting_content + time_setting_content_inner;

    apply_now_deadline_datetime = new Date();
    apply_now_deadline_datetime.setMilliseconds(0);
    apply_now_deadline_datetime.setSeconds(0);
    apply_now_deadline_datetime.setMinutes(0);
    apply_now_deadline_datetime.setHours(apply_now_deadline_datetime.getHours() + 3);

    max_year = min_year = year = apply_now_deadline_datetime.getFullYear();
    min_month = month = apply_now_deadline_datetime.getMonth();
    max_month = month + 1;
    day_of_month = apply_now_deadline_datetime.getDate();
    day_of_week = get_i18n_time_text({ type: "weekday", number: apply_now_deadline_datetime.getDay()});
    hours = apply_now_deadline_datetime.getHours();
    minutes = apply_now_deadline_datetime.getMinutes();

    if (now.getMonth() > (max_month % 12)) {
        if (max_month < 12) {
            max_month = max_month + 1;
        }
    }
    if (now.getMonth() < min_month) {
        min_month = now.getMonth();
    }

    if (max_month > 11) {
        max_year = max_year + 1;
    }

    if (now.getFullYear() > max_year) {
        max_year = now.getFullYear();
    }
    if (now.getFullYear() < min_year) {
        min_year = now.getFullYear();
    }
    option_list = "";
    for (var i = min_year; i <= max_year; i++) {
        if (i === year) {
            option = "<option value='" + i + "' selected='selected'>" +  get_i18n_time_text({type: "year", number: i}) + "</option>";
        } else {
            option = "<option value='" + i + "'>" +  get_i18n_time_text({type: "year", number: i}) + "</option>";
        }
        option_list = option_list + option;
    }
    apply_now_deadline_year = "<select class='apply-now-deadline-year'>" + option_list + "</select>";
    option_list = "";
    for (var i = min_month; i <= max_month; i++) {
        temp = i % 12;
        if (i > 11) {
            temp2 = max_year;
        } else {
            temp2 = min_year;
        }
        if (temp === month) {
            option = "<option value='" + temp + "' selected='selected' data-year='" + temp2 + "'>" + get_i18n_time_text({type: "month", number: temp}) + "</option>";
        } else {
            option = "<option value='" + temp + "' data-year='" + temp2 + "'>" + get_i18n_time_text({type: "month", number: temp}) + "</option>";
        }
        option_list = option_list + option;
    }
    apply_now_deadline_month = "<select class='apply-now-deadline-month'>" + option_list + "</select>";
    days_of_month = get_days_of_month(year, month);
    option_list = "";
    for (var c = 0; c < days_of_month.length; c++) {
        if (days_of_month[c] === day_of_month) {
            option = "<option value='" + days_of_month[c] + "' selected='selected'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
        } else {
            option = "<option value='" + days_of_month[c] + "'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
        }
        option_list = option_list + option;
    }
    apply_now_deadline_day_of_month = "<select class='apply-now-deadline-day-of-month'>" + option_list + "</select>";
    apply_now_deadline_day_of_week = "<span class='apply-now-deadline-day-of-week'>" + day_of_week + "</span>";
    option_list = "";
    for (var e = 0; e < 24; e++) {
        temp = e < 10 ? '0' + e : e;
        if (e === hours) {
            option = "<option value='" + e + "' selected='selected'>" + temp + "</option>";
        } else {
            option = "<option value='" + e + "'>" + temp + "</option>";
        }
        option_list = option_list + option;
    }
    apply_now_deadline_hours = "<select class='apply-now-deadline-hours'>" + option_list + "</select>";
    option_list = "";
    for (var f = 0; f < 60; f++) {
        if (f === minutes) {
            temp = f < 10 ? '0' + f : f;
            option = "<option value='" + f + "' selected='selected'>" + temp + "</option>";
        } else {
            temp = f < 10 ? '0' + f : f;
            option = "<option value='" + f + "'>" + temp + "</option>";
        }
        option_list = option_list + option;
    }
    apply_now_deadline_minutes = "<select class='apply-now-deadline-minutes'>" + option_list + "</select>";
    apply_now_deadline_fixed_datetime = "<div class='apply-now-deadline-fixed-datetime'>" + to_i18n_fixed_datetime(apply_now_deadline_datetime) + "</div>";

    time_setting_content_inner = "<div class='time-setting-content-inner time-setting-deadline-datetime-wrapper apply-now-setting-datetime' data-datetime='" + apply_now_deadline_datetime.valueOf() + "' style='display:block;'>" + apply_now_deadline_fixed_datetime + apply_now_deadline_year + apply_now_deadline_month + apply_now_deadline_day_of_month + "<br class='mobile-only'>" + apply_now_deadline_day_of_week + apply_now_deadline_hours + ":" + apply_now_deadline_minutes + "</div>";

    time_setting_content = time_setting_content + time_setting_content_inner;

    online_interview_content_inner = online_interview_content_inner + "<div class='online-interview-content-inner'>" + time_setting_content + "</div>";

    if (is_online_interview_time === true) {
        online_interview_questions = "<div class='red online-interview-questions-cannot-be-changed'>" + i18n[lang].online_interview_questions_cannot_be_changed + "</div>";
    } else {
        online_interview_question_inner = "";
        span = "<span class='write-label'>" + i18n[lang].online_interview_questions + "</span>";
        temp = "<div class='online-interview-question-inner'>" + span + "</div>";
        online_interview_question_inner = online_interview_question_inner + temp;

        div = "<div class='short-answer-label'>" + i18n[lang].short_answer + "</div>";
        img = "<img src='" + aws_s3_url + "/icons/add.png" + css_version + "'>";
        temp = "<div>" + img + "</div>";
        temp = "<div class='short-answer-item-add'>" + temp + "</div>";

        div2 = "<div class='multiple-choice-label'>" + i18n[lang].multiple_choice + "</div>";
        temp2 = "<div>" + img + "</div>";
        temp2 = "<div class='multiple-choice-item-add'>" + temp2 + "</div>";

        temp = "<div class='online-interview-question-inner'>" + div + temp + div2 + temp2 + "</div>";
        online_interview_question_inner = online_interview_question_inner + temp;
        temp = "";
        if (doc && doc.is_online_interview_set === true) {
            for (var g = 0; g < doc.questions.length; g++) {
                temp = temp + get["single"]["form"][doc.questions[g].type]( (g+1), doc.questions[g]);
            }
        }
        online_interview_questions_content = "<div class='online-interview-questions-content'>" + temp + "</div>";
        online_interview_question_inner = online_interview_question_inner + online_interview_questions_content;

        online_interview_questions = "<div class='online-interview-questions'>" + online_interview_question_inner + "</div>";
    }

    online_interview_content_inner = online_interview_content_inner + "<div class='online-interview-content-inner'>" + online_interview_questions + "</div>";

    online_interview_content = "<div class='online-interview-content'>" + online_interview_content_inner + "</div>";

    if (doc && doc.is_online_interview_set === false) {
        online_interview_content_wrapper = "<div class='online-interview-content-wrapper' style='display:none;'>" + online_interview_content + "</div>";
    } else {
        online_interview_content_wrapper = "<div class='online-interview-content-wrapper'>" + online_interview_content + "</div>";
    }
    online_interview_wrapper = "<div class='online-interview-wrapper' style='margin-bottom:10px;'>" + online_interview_label + online_interview_content_wrapper + "</div>";

    if (doc) {
        if (doc.language === "en") {
            option_list = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        } else if (doc.language === "ja") {
            option_list =  "<option class='lang-ja' value='ja' selected='selected'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
        } else if (doc.language === "ko") {
            option_list =  "<option class='lang-ko' value='ko' selected='selected'>" + i18n[lang].korean + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        } else if (doc.language === "zh-Hans") {
            option_list =  "<option class='lang-zh-Hans' value='zh-Hans' selected='selected'>" + i18n[lang].simplified_chinese + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
        } else {
            option_list = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        }
    } else {
        if (lang === "en") {
            option_list = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        } else if (lang === "ja") {
            option_list =  "<option class='lang-ja' value='ja' selected='selected'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
        } else if (lang === "ko") {
            option_list =  "<option class='lang-ko' value='ko' selected='selected'>" + i18n[lang].korean + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        } else if (lang === "zh-Hans") {
            option_list =  "<option class='lang-zh-Hans' value='zh-Hans' selected='selected'>" + i18n[lang].simplified_chinese + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
        } else {
            option_list = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        }
    }

    span = "<span class='write-label'>" + i18n[lang].language + "</span>";
    select = "<select class='written-language'>" + option_list + "</select>";
    temp = "<label style='display:inline-block;'>" + span + select + "</label>";

    /*written_language_wrapper = "<div class='written-language-wrapper'>" + temp + "</div>";*/
    written_language_wrapper = "";

    label_list = "";

    span = "<span class='write-label'>" + i18n[lang].company +  "</span>";

    if (doc) {
        input = "<input class='write-company' type='text' placeholder='' value='" + get_encoded_html_preventing_xss(doc.company) + "'>";
    } else {
        input = "<input class='write-company' type='text' placeholder=''>";
    }

    label = "<label>" + span + input + "</label>";
    label_list = label_list + label;

    span = "<span class='write-label'>" + i18n[lang].logo + "</span>";
    select_logo = "<input class='btn-career add-apply-now-logo' type='button' value='" + i18n[lang].select + "'>";
    div = "<div style='margin-top:10px;'>" + span + select_logo + "</div>";

    if (doc && doc.logo) {
        logo = "<img class='write-logo' src='" + doc.logo + "'>";
        remove_logo = "<input class='btn-career remove-apply-now-logo' type='button' value='" + i18n[lang].remove + "'>";
    } else {
        logo = "";
        remove_logo = "";
    }

    div2 = "<div class='write-logo-wrapper'>" + logo + remove_logo + "</div>";
    label_list = label_list + div + div2;

    span = "<span class='write-label'>" + i18n[lang].business_type + "</span>";

    if (doc) {
        input = "<input class='write-business-type' type='text' placeholder='' value='" + get_encoded_html_preventing_xss(doc.business_type) + "'>";
    } else {
        input = "<input class='write-business-type' type='text' placeholder=''>";
    }

    label = "<label>" + span + input + "</label>";
    label_list = label_list + label;

    span = "<span class='write-label'>" + i18n[lang].country + "</span>";
    if (doc) {
        input = "<input class='write-country' type='text' placeholder='' value='" + get_encoded_html_preventing_xss(doc.country) + "'>";
    } else {
        input = "<input class='write-country' type='text' placeholder=''>";
    }

    label = "<label>" + span + input + "</label>";
    label_list = label_list + label;

    span = "<span class='write-label'>" + i18n[lang].city + "</span>";

    if (doc) {
        input = "<input class='write-city' type='text' placeholder='' value='" + get_encoded_html_preventing_xss(doc.city) + "'>";
    } else {
        input = "<input class='write-city' type='text' placeholder=''>";
    }

    label = "<label>" + span + input + "</label>";
    label_list = label_list + label;

    span = "<span class='write-label'>" + i18n[lang].website + "</span>";

    if (doc && doc.protocol === 'https') {
        option_list = "<option value='http'>http://</option><option value='https' selected='selected'>https://</option>";
    } else {
        option_list = "<option value='http' selected='selected'>http://</option><option value='https'>https://</option>";
    }

    select = "<select class='write-website-select'>" + option_list + "</select>";
    temp = "<div class='write-website-left'>" + select + "</div>";

    if (doc) {
        input = "<input class='write-website-input' type='url' placeholder='' value='" + get_encoded_html_preventing_xss(doc.url) + "'>";
    } else {
        input = "<input class='write-website-input' type='url' placeholder=''>";
    }

    temp2 = "<div class='write-website-right'>" + input + "</div>";
    div = "<div class='write-website-wrapper'>" + temp + temp2 + "</div>";
    label = "<label>" + span + div + "</label>";
    label_list = label_list + label;

    span = "<span class='write-label'>" + i18n[lang].job + "</span>";

    if (doc) {
        input = "<input class='write-job' type='text' placeholder='' value='" + get_encoded_html_preventing_xss(doc.job) + "'>";
    } else {
        input = "<input class='write-job' type='text' placeholder=''>";
    }

    label = "<label>" + span + input + "</label>";
    label_list = label_list + label;

    option_list = "";
    span = "<span class='write-label'>" + i18n[lang].employment_status + "</span>";
    if (doc) {
        if (doc.employment_status === "full_time") {
            option_list = "<option value='full_time' selected='selected'>" + i18n[lang].full_time + "</option><option value='part_time'>" + i18n[lang].part_time + "</option><option value='contract'>" + i18n[lang].contract + "</option><option value='intern'>" + i18n[lang].intern + "</option>";
        } else if (doc.employment_status === "part_time") {
            option_list = "<option value='full_time'>" + i18n[lang].full_time + "</option><option value='part_time' selected='selected'>" + i18n[lang].part_time + "</option><option value='contract'>" + i18n[lang].contract + "</option><option value='intern'>" + i18n[lang].intern + "</option>";
        } else if (doc.employment_status === "contract") {
            option_list = "<option value='full_time'>" + i18n[lang].full_time + "</option><option value='part_time'>" + i18n[lang].part_time + "</option><option value='contract' selected='selected'>" + i18n[lang].contract + "</option><option value='intern'>" + i18n[lang].intern + "</option>";
        } else if (doc.employment_status === "intern") {
            option_list = "<option value='full_time'>" + i18n[lang].full_time + "</option><option value='part_time'>" + i18n[lang].part_time + "</option><option value='contract'>" + i18n[lang].contract + "</option><option value='intern' selected='selected'>" + i18n[lang].intern + "</option>";
        } else {
            option_list = "<option value='full_time' selected='selected'>" + i18n[lang].full_time + "</option><option value='part_time'>" + i18n[lang].part_time + "</option><option value='contract'>" + i18n[lang].contract + "</option><option value='intern'>" + i18n[lang].intern + "</option>";
        }
    } else {
        option_list = "<option value='full_time' selected='selected'>" + i18n[lang].full_time + "</option><option value='part_time'>" + i18n[lang].part_time + "</option><option value='contract'>" + i18n[lang].contract + "</option><option value='intern'>" + i18n[lang].intern + "</option>";
    }

    select = "<select class='write-employment-status' type='text' placeholder=''>" + option_list + "</select>";
    label = "<label>" + span + select + "</label>";
    label_list = label_list + label;

    span = "<div class='write-label' style='margin-bottom:10px;'>" + i18n[lang].salary + "</div>";
    option_list = "";
    if (doc) {
        for (var i = 0; i < monetary_units.length; i++) {
            if (doc.salary_unit === monetary_units[i].unit) {
                showing_write_salary = put_comma_between_three_digits(doc.salary) + " " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                temp = "<option value='" + monetary_units[i].unit + "' selected='selected' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
            } else {
                temp = "<option value='" + monetary_units[i].unit + "' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
            }
            option_list = option_list + temp;
        }
    } else {
        for (var i = 0; i < monetary_units.length; i++) {
            if (lang === "en") {
                if (monetary_units[i].unit === "USD") {
                    showing_write_salary = "0 " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                    temp = "<option value='" + monetary_units[i].unit + "' selected='selected' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                } else {
                    temp = "<option value='" + monetary_units[i].unit + "' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                }
            } else if (lang === "ja") {
                if (monetary_units[i].unit === "JPY") {
                    showing_write_salary = "0 " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                    temp = "<option value='" + monetary_units[i].unit + "' selected='selected' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                } else {
                    temp = "<option value='" + monetary_units[i].unit + "' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                }
            } else if (lang === "ko") {
                if (monetary_units[i].unit === "KRW") {
                    showing_write_salary = "0 " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                    temp = "<option value='" + monetary_units[i].unit + "' selected='selected' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                } else {
                    temp = "<option value='" + monetary_units[i].unit + "' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                }
            } else if (lang === "zh-Hans") {
                if (monetary_units[i].unit === "CNY") {
                    showing_write_salary = "0 " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                    temp = "<option value='" + monetary_units[i].unit + "' selected='selected' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                } else {
                    temp = "<option value='" + monetary_units[i].unit + "' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                }
            } else {
                if (monetary_units[i].unit === "USD") {
                    showing_write_salary = "0 " + monetary_units[i].name + " (" + monetary_units[i].unit + ")";
                    temp = "<option value='" + monetary_units[i].unit + "' selected='selected' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                } else {
                    temp = "<option value='" + monetary_units[i].unit + "' data-name='" + monetary_units[i].name + "'>" + monetary_units[i].name + " (" + monetary_units[i].unit + ")</option>";
                }
            }
            option_list = option_list + temp;
        }
    }
    if (doc) {
        input = "<input class='write-salary-input' type='number' value='" + doc.salary + "'>";
    } else {
        input = "<input class='write-salary-input' type='number'>";
    }

    temp = "<div class='write-salary-left'>" + input + "</div>";
    select = "<select class='write-salary-select'>" + option_list + "</select>";
    temp2 = "<div class='write-salary-right'>" + select + "</div>";
    div = "<div class='write-salary-wrapper'>" + temp + temp2 + "</div>";

    showing_write_salary = "<div class='showing-write-salary'>" + showing_write_salary + "</div>";
    if (doc) {
        if (doc.salary_period === "year") {
            option_list = "<option value='year' selected='selected'>" + i18n[lang].per_year + "</option><option value='month'>" + i18n[lang].per_month + "</option><option value='hour'>" + i18n[lang].per_hour + "</option>";
        } else if (doc.salary_period === "month") {
            option_list = "<option value='year'>" + i18n[lang].per_year + "</option><option value='month' selected='selected'>" + i18n[lang].per_month + "</option><option value='hour'>" + i18n[lang].per_hour + "</option>";
        } else if (doc.salary_period === "hour") {
            option_list = "<option value='year'>" + i18n[lang].per_year + "</option><option value='month'>" + i18n[lang].per_month + "</option><option value='hour' selected='selected'>" + i18n[lang].per_hour + "</option>";
        } else {
            option_list = "<option value='year' selected='selected'>" + i18n[lang].per_year + "</option><option value='month'>" + i18n[lang].per_month + "</option><option value='hour'>" + i18n[lang].per_hour + "</option>";
        }
    } else {
        option_list = "<option value='year' selected='selected'>" + i18n[lang].per_year + "</option><option value='month'>" + i18n[lang].per_month + "</option><option value='hour'>" + i18n[lang].per_hour + "</option>";
    }
    salary_period = "<select class='write-salary-period'>" + option_list + "</select>";

    temp = "<span class='write-label' style='padding-left:10px;'>" + i18n[lang].decide_after_consulting + "</span>";
    if (doc && doc.decide_salary_later === true) {
        write_salary_parent_wrapper = "<div class='write-salary-parent-wrapper' style='display:none;'>" + salary_period + showing_write_salary + div + "</div>";
        input = "<input class='decide-after-consulting' type='checkbox' checked='checked'>";
    } else {
        write_salary_parent_wrapper = "<div class='write-salary-parent-wrapper' style='display:block;'>" + salary_period + showing_write_salary + div + "</div>";
        input = "<input class='decide-after-consulting' type='checkbox'>";
    }

    label = "<label>" + span + temp + input +"</label>";
    label_list = label_list + label + write_salary_parent_wrapper;
    return "<div class='apply-now-setting' data-is-online-interview-time='" + is_online_interview_time + "'>" + apply_now_public_authority_wrapper + online_interview_wrapper + written_language_wrapper + label_list + "</div>";
};
write_form["init"] = function (environment_type, article_type) {
    var css_version = $("body").attr("data-css-version");
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (
        environment_type !== "unicorn" &&
        environment_type !== "superior" &&
        environment_type !== "space" &&
        environment_type !== "star" &&
        environment_type !== "ground"
    ) {
        return false;
    }
    if (environment_type === "ground") {
        if (write_form["ground_type"] === null) {
            return false;
        } else {
            var g_type = write_form["ground_type"].split('.')[1]
                , g_action = write_form["ground_type"].split('.')[0]
                , $ground = $("#ground");
            if (g_action === "write") {
                $ground.find('.write-submit').val(i18n[lang].check);
            } else if (g_action === "edit") {
                $ground.find('.write-submit').val(i18n[lang].check);
            } else {
                return false;
            }
            if (g_type === "hire_me") {
                $("#ground .tags").val("");
                $("#ground .write-title").val("");
                if ( $('#ground-editor').length !== 0 ) {
                    CKEDITOR.instances['ground-editor'].setData("");
                }
                $ground.find('.write-top').remove();
                /*$ground.find('.written-language-wrapper').remove();*/
                $ground.find('.public-authority-wrapper').remove();
                $ground.find('.main-tag-wrapper').remove();
                $ground.find('.selected-image').remove();
                $ground.find('#ground-textarea-label').remove();
                $ground.find('.debate-setting').remove();
                $ground.find('.hire-me-setting').remove();
                $ground.find('.apply-now-setting').remove();
                $ground.find('.write-form').prepend(write_form["get_hire_me_setting"](null));
            } else if (g_type === "apply_now") {
                $("#ground .tags").val("");
                $("#ground .write-title").val("");
                if ( $('#ground-editor').length !== 0 ) {
                    CKEDITOR.instances['ground-editor'].setData("");
                }
                $ground.find('.write-top').remove();
                /*$ground.find('.written-language-wrapper').remove();*/
                $ground.find('.public-authority-wrapper').remove();
                $ground.find('.main-tag-wrapper').remove();
                $ground.find('.selected-image').remove();
                $ground.find('#ground-textarea-label').remove();
                $ground.find('.debate-setting').remove();
                $ground.find('.hire-me-setting').remove();
                $ground.find('.apply-now-setting').remove();
                $ground.find('.write-form').prepend(write_form["get_apply_now_setting"](null));
            } else if (g_type === "blog") {
                $("#ground .tags").val("");
                $("#ground .write-title").val("");

                if ( $('#ground-editor').length !== 0 ) {
                    CKEDITOR.instances['ground-editor'].setData("");
                }
                $("#ground select.public-authority option[value=1]").prop('selected', true);
                $ground.find('.write-top').remove();
                $ground.find('.main-tag-wrapper').remove();
                $ground.find('.selected-image').remove();
                $ground.find('#ground-textarea-label').remove();
                $ground.find('.debate-setting').remove();
                $ground.find('.hire-me-setting').remove();
                $ground.find('.apply-now-setting').remove();
            } else if (g_type === "gallery") {
                $("#ground .tags").val("");
                $("#ground .write-title").val("");
                $("#ground #ground-textarea").val("");
                $("#ground select.public-authority option[value=1]").prop('selected', true);
                $ground.find('.write-top').remove();
                $ground.find('.main-tag-wrapper').remove();
                $ground.find('#ground-editor-label').remove();
                $ground.find('.debate-setting').remove();
                $ground.find('.hire-me-setting').remove();
                $ground.find('.apply-now-setting').remove();
            } else {
                $("#ground .tags").val("");
                $("#ground .write-title").val("");
                if ( $('#ground-editor').length !== 0 ) {
                    CKEDITOR.instances['ground-editor'].setData("");
                }
                $ground.find('.public-authority-wrapper').remove();
                $ground.find('.selected-image').remove();
                $ground.find('#ground-textarea-label').remove();
                $ground.find('.debate-setting').remove();
                $ground.find('.hire-me-setting').remove();
                $ground.find('.apply-now-setting').remove();
                if (article_type === "agenda") {
                    $ground.find('.write-form').prepend(write_form["get_debate_setting"](null));
                }
            }
        }
    } else {
        $("#" + environment_type + " .tags").val("");
        $("#" + environment_type + " .write-title").val("");
        if ( $('#' + environment_type + '-editor').length !== 0 ) {
            CKEDITOR.instances[environment_type + '-editor'].setData("");
        }
        $("#" + environment_type + " .debate-setting").remove();
        $("#" + environment_type + " .hire-me-setting").remove();
        $("#" + environment_type + " .apply-now-setting").remove();
        if (article_type === "agenda") {
            $("#" + environment_type + " .write-form").prepend(write_form["get_debate_setting"](null));
        }
        if (article_type === "hire_me") {
            $("#" + environment_type + " .write-form").prepend(write_form["get_hire_me_setting"](null));
        }
        if (article_type === "apply_now") {
            $("#" + environment_type + " .write-form").prepend(write_form["get_apply_now_setting"](null));
        }
    }
};
write_form["rebuild_write_form_data_as_ground"] = function () {
    write_form["current_env_type"] = "ground";
    var pathname = window.location.pathname;
    var temp = pathname.split('/');

    if (temp[1] === 'write') {
        if (temp[2] === 'agenda') {
            write_form["current_type"] = "agenda";
            write_form["current_related_id"] = null;
            write_form["current_action"] = "write";
        } else if (temp[2] === 'hire-me') {
            write_form["current_type"] = "hire_me";
            write_form["current_related_id"] = null;
            write_form["current_action"] = "write";
        } else if (temp[2] === 'apply-now') {
            write_form["current_type"] = "apply_now";
            write_form["current_related_id"] = null;
            write_form["current_action"] = "write";
        }
    } else if (temp[1] === 'hire-me'){
        if (temp[2] === undefined) {
            return false;
        } else {
            write_form["current_type"] = "hire_me";
            write_form["current_related_id"] = temp[2];
            write_form["current_action"] = "edit";
        }
    } else if (temp[1] === 'apply-now'){
        if (temp[2] === undefined) {
            return false;
        } else {
            write_form["current_type"] = "apply_now";
            write_form["current_related_id"] = temp[2];
            write_form["current_action"] = "edit";
        }
    } else if (temp[1] === 'agenda'){
        if (temp[2] === undefined) {
            return false;
        } else if (temp[3] === 'opinion') {
            write_form["current_type"] = "opinion";
            write_form["current_related_id"] = temp[4];
            write_form["current_action"] = "edit";
        } else if (temp[3] === undefined) {
            write_form["current_type"] = "agenda";
            write_form["current_related_id"] = temp[2];
            write_form["current_action"] = "edit";
        }
    } else if (temp[1] === 'blog'){
        if (temp[2] === undefined ||
            temp[3] === undefined ||
            temp[4] === undefined) {
            return false;
        } else {
            if (temp[3] === 'write') {
                if (temp[4] === undefined) {
                    return false;
                } else {
                    write_form["current_action"] = "write";
                    if (temp[4] === 'gallery') {
                        write_form["current_type"] = "gallery";
                        write_form["current_related_id"] = null;
                    } else {
                        write_form["current_type"] = "blog";
                        write_form["current_related_id"] = temp[4];
                    }
                }
            } else {
                if (temp[4] === undefined) {
                    return false;
                } else {
                    write_form["current_action"] = "edit";
                    write_form["current_related_id"] = temp[4];
                    if (temp[3] === 'gallery') {
                        write_form["current_type"] = "gallery";
                    } else {
                        write_form["current_type"] = "blog";
                    }
                }
            }
        }
    } else {
        return false;
    }
};

write_form["fill"] = function (environment_type, doc) {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if (
        environment_type !== "unicorn" &&
        environment_type !== "superior" &&
        environment_type !== "space" &&
        environment_type !== "star" &&
        environment_type !== "ground"
    ) {
        return false;
    }
    if (doc['type'] === 'agenda') {
        $('#' + environment_type + ' .write-form .debate-setting').remove();
        $('#' + environment_type + ' .write-form').prepend(write_form["get_debate_setting"](doc));
    }
    if (doc['type'] === 'hire_me') {
        $('#' + environment_type + ' .write-form .hire-me-setting').remove();
        $('#' + environment_type + ' .write-form').prepend(write_form["get_hire_me_setting"](doc));
    }
    if (doc['type'] === 'apply_now') {
        $('#' + environment_type + ' .write-form .apply-now-setting').remove();
        $('#' + environment_type + ' .write-form').prepend(write_form["get_apply_now_setting"](doc));
    }
    if (environment_type === 'space') {
        if (doc['type'] === 'agenda') {
            $('.prompt#space-prompt .prompt-title').text(i18n[lang].agenda_edit);
            $('.prompt#space-prompt .prompt-description').text('');
        } else if (doc['type'] === 'opinion') {
            $('.prompt#space-prompt .prompt-title').text(i18n[lang].opinion_edit);
            $('.prompt#space-prompt .prompt-description').text('');
        } else {

        }
    }
    /*$('#' + environment_type + ' select.written-language').removeAttr('disabled');*/
    if (doc['type'] === 'apply_now' || doc['type'] === 'hire_me') {
    } else if (doc['type'] === 'agenda' || doc['type'] === 'opinion') {
        /*$('#' + environment_type + ' select.written-language option[value=' + doc["language"] + ']').prop('selected', true);*/
        $('#' + environment_type + ' select.main-tag option[value=' + doc["main_tag"] + ']').prop('selected', true);
    } else {
        /*if (doc["language"] === "") {
            $('#ground select.written-language option[value=' + lang + ']').prop('selected', true);
        } else {
            $('#ground select.written-language option[value=' + doc["language"] + ']').prop('selected', true);
        }*/
        $('#ground select.public-authority option[value=' + doc["public_authority"] + ']').prop('selected', true);
    }
    $("#" + environment_type + " .write-title").val(doc["title"]);
    var tags = "";
    for (var x = 0; x < doc["tags"].length; x++) {
        tags = tags + "#" + doc["tags"][x];
    }
    $("#" + environment_type + " .tags").val(tags);
    var img = "";
    if (doc['type'] === 'gallery') {
        $('#ground #ground-textarea').val(doc['content']);
        img = "<img src='" + doc['img'] + "'>";
        $('#ground .selected-image').empty().append(img);
    } else {
        if ( $('#' + environment_type + '-editor').length !== 0 ) {
            CKEDITOR.instances[environment_type + '-editor'].setData(doc['content']);
        }
    }
    if (
        doc['type'] === 'agenda' ||
        doc['type'] === 'opinion'
    ) {
        /*var total_count_written_translations = 0;
        for (var i = 0; i < doc.count_written_translations.length; i++) {
            if (doc.count_written_translations[i].count < 0) {
                doc.count_written_translations[i].count = 0;
            }
            total_count_written_translations = total_count_written_translations + doc.count_written_translations[i].count;
        }
        if (total_count_written_translations > 0) {
            $('#' + environment_type + ' select.written-language').attr('disabled', 'disabled');
        }*/
    }
};

realtime_comments["type"] = null;
realtime_comments["clear_interval"] = null;
realtime_comments["init"] = function (type) {
    if ($('.realtime-comments-list').length === 0) {
        return false;
    }
    if (
        type !== 'debate' &&
        type !== 'agenda' &&
        type !== 'opinion' &&
        type !== 'blog'
    ) {
        return false;
    }
    realtime_comments["type"] = type;
    if (realtime_comments["clear_interval"] !== null) {
        clearInterval(realtime_comments["clear_interval"]);
        realtime_comments["clear_interval"] = null;
    }
    var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    var comments_index = 0;
    var s_cb = function (result) {
        if (result.response === true) {
            if (result.docs !== null && result.docs !== undefined && result.docs.length !== 0) {
                var final_list = "";
                for (var i = 0; i < result.docs.length; i++) {
                    final_list = final_list + get["single"]["normal"]["realtime_comment"](result.docs[i]);
                }
                $('.realtime-comments-list').empty().append(final_list);
                realtime_comments["clear_interval"] = setInterval(function () {
                    $($("#mobile-realtime-comments ul li")[comments_index]).addClass("animated fadeInUp").one(animationEnd, function () {
                        $(this).removeClass('animated fadeInUp');
                    });
                    $($("#desktop-realtime-comments ul li")[comments_index]).addClass("animated fadeInUp").one(animationEnd, function () {
                        $(this).removeClass('animated fadeInUp');
                    });
                    if (comments_index !== result.docs.length) {
                        comments_index = comments_index + 1;
                    } else {
                        comments_index = 0;
                    }
                }, 1000);
                if ($("#written-wrapper").length > 0 && $("#desktop-right").length > 0) {
                    if ($("#written-wrapper").height() > $("#desktop-right").height()) {
                        $("#written-wrapper").css('border-right', '1px solid #ebebeb');
                        $("#desktop-right").css('border-left', 'initial');
                    } else {
                        $("#written-wrapper").css('border-right', 'initial');
                        $("#desktop-right").css('border-left', '1px solid #ebebeb');
                    }
                }
            }
        } else {
            if (result["msg"] === "no_blog_id") {
                return window.location = "/set/blog-id";
            } else {
                $('.realtime-comments-list').empty();
            }
        }
    };
    var f_cb = function () {$('.realtime-comments-list').empty();};
    methods["the_world"]["is_one"]({
        show_animation: true,
        data:{type:encodeURIComponent(type)},
        pathname:"/get/realtime-comments",
        s_cb:s_cb,
        f_cb:f_cb
    });
};
image_prompt["init"] = function () {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if ($('.user-gallery').length === 0) {
        return false;
    }
    user_gallery_old_date = undefined;
    $('#device-gallery').empty().css('display','none');
    $('#device-gallery-content').css('display','none');
    $('.user-gallery-wrapper').css('display', 'none');
    $('.user-gallery').empty();
    $('.user-gallery-none').css('display', 'none');
    $('.user-gallery-more').css('display', 'block');
    $('.gallery-item-count').css('display', 'none').text(i18n[lang].selected + " 0");
    if (is_mobile() === true) {
        $('#image-menu-device-gallery').val(i18n[lang].select_on_mobile);
    } else {
        $('#image-menu-device-gallery').val(i18n[lang].select_on_computer);
    }
    $('#image-menu input').removeClass('selected');
    $('form#user-gallery-form').css('display', 'none');
};
image_prompt["menu"] = {};
image_prompt["init_gallery_images"] = function () {
    /* 초기화 */
    if ($('.user-gallery').length === 0) {
        return false;
    }
    var FULL_WIDTH = $('.user-gallery').width()
        , AVERAGE_HEIGHT = 100;
    if (FULL_WIDTH > 600) {
        AVERAGE_HEIGHT = 160
    }
    $('.user-gallery-item-img').addClass('no-resized').css('height', AVERAGE_HEIGHT);
    $('.user-gallery .check-box').addClass('no-resized').css('height', AVERAGE_HEIGHT);
    image_prompt["resize_gallery_images"]();
};
image_prompt["resize_gallery_images"] = function () {
    if ($('.user-gallery').length === 0) {
        return false;
    }
    var FULL_WIDTH = $('.user-gallery').width()
        ,AVERAGE_HEIGHT = 100;
    if (FULL_WIDTH > 600) {
        AVERAGE_HEIGHT = 160
    }
    var $IMG_LIST = $('.user-gallery-item-img.no-resized')
        , START_INDEX = 0
        , END_INDEX = 0
        , TOTAL_WIDTH = 0
        , $THIS
        , ORIGINAL_WIDTH
        , ORIGINAL_HEIGHT
        , CURRENT_WIDTH
        , CURRENT_HEIGHT
        , DIFF1
        , DIFF2
        , RESIZED_HEIGHT;
    $('.user-gallery-item-img.no-resized').css('height', AVERAGE_HEIGHT);
    $('.user-gallery .check-box.no-resized').css('height', AVERAGE_HEIGHT);
    for (var x = 0; x < $IMG_LIST.length; x++) {
        $THIS = $($IMG_LIST[x]);
        ORIGINAL_WIDTH = parseInt($THIS.attr('data-width'));
        ORIGINAL_HEIGHT = parseInt($THIS.attr('data-height'));
        CURRENT_HEIGHT = $THIS.height() + 2;
        CURRENT_WIDTH = Math.floor((ORIGINAL_WIDTH * CURRENT_HEIGHT)/ORIGINAL_HEIGHT);
        DIFF1 = FULL_WIDTH - TOTAL_WIDTH;
        DIFF2 = (TOTAL_WIDTH + CURRENT_WIDTH) - FULL_WIDTH;
        if ((TOTAL_WIDTH + CURRENT_WIDTH) > FULL_WIDTH) {
            if (
                FULL_WIDTH === DIFF1 &&
                START_INDEX === END_INDEX
            ) {
                TOTAL_WIDTH = TOTAL_WIDTH + CURRENT_WIDTH;
                RESIZED_HEIGHT = Math.floor(((FULL_WIDTH - (((END_INDEX - START_INDEX) + 1) * 2)) * AVERAGE_HEIGHT) / TOTAL_WIDTH);
                $THIS.css('height', RESIZED_HEIGHT + 'px').removeClass('no-resized');
                $THIS.parent().find('.check-box').css('height', RESIZED_HEIGHT + 'px').removeClass('no-resized');
                START_INDEX = END_INDEX = (x + 1);
                TOTAL_WIDTH = 0;
            } else {
                if (DIFF1 < DIFF2) {
                    RESIZED_HEIGHT = Math.floor(((FULL_WIDTH - (((END_INDEX - START_INDEX) + 1) * 2)) * AVERAGE_HEIGHT) / TOTAL_WIDTH);
                    for (var y = START_INDEX; y <= END_INDEX; y++) {
                        $($IMG_LIST[y]).css('height', RESIZED_HEIGHT + 'px').removeClass('no-resized');
                        $($IMG_LIST[y]).parent().find('.check-box').css('height', RESIZED_HEIGHT + 'px').removeClass('no-resized');
                    }
                    START_INDEX = END_INDEX = x;
                    TOTAL_WIDTH = 0;
                    x = x - 1;
                } else {
                    END_INDEX = x;
                    TOTAL_WIDTH = TOTAL_WIDTH + CURRENT_WIDTH;
                    RESIZED_HEIGHT = Math.floor(((FULL_WIDTH - (((END_INDEX - START_INDEX) + 1) * 2)) * AVERAGE_HEIGHT) / TOTAL_WIDTH);
                    for (var y = START_INDEX; y <= END_INDEX; y++) {
                        $($IMG_LIST[y]).css('height', RESIZED_HEIGHT + 'px').removeClass('no-resized');
                        $($IMG_LIST[y]).parent().find('.check-box').css('height', RESIZED_HEIGHT + 'px').removeClass('no-resized');
                    }
                    START_INDEX = END_INDEX = (x + 1);
                    TOTAL_WIDTH = 0;
                }
            }
        } else {
            TOTAL_WIDTH = TOTAL_WIDTH + CURRENT_WIDTH;
            END_INDEX = x;
            continue;
        }
    }
};
image_prompt["menu"]["user_gallery"] = function () {
    if ($('.user-gallery').length === 0) {
        return false;
    }
    image_prompt["init"]();
    $('form#user-gallery-form').css('display', 'block');
    $('#image-menu-user-gallery').addClass('selected');
    $('#image-prompt-description').css('display', 'block');
    $('#image-description-device').css('display', 'none');
    get_gallery_items(null, function (docs) {
        var gallery_items = "", div1, div2, img1, img2, temp, width, height;
        var css_version = $("body").attr("data-css-version");
        if (docs.length === 0) {
            $('.user-gallery-none').css('display', 'block');
        } else {
            user_gallery_old_date = docs[docs.length - 1]["updated_at"];
            for (var i = 0; i < docs.length; i++) {
                temp = docs[i]["img"].split('.');
                temp = temp[temp.length-2].split('-');
                width = temp[temp.length-2];
                height = temp[temp.length-1];

                img2 = "<img src='" + aws_s3_url + "/icons/checked-big.png" + css_version + "' data-updated-at='" + docs[i]["updated_at"] + "'>";
                div2 = "<div class='check-box no-resized'>" + img2 + "</div>";
                img1 = "<img class='user-gallery-item-img no-resized' src='" + docs[i]["img"] + "' data-img='" + docs[i]["img"] + "' data-width='" + width + "' data-height='" + height + "'>";
                div1 = "<div class='user-gallery-item'>" + div2 + img1 + "</div>";
                gallery_items = gallery_items + div1;
            }
            $('.user-gallery').append(gallery_items);
            $('.user-gallery-wrapper').css('display', 'block');
            $('.gallery-item-count').css('display', 'block');
            image_prompt["init_gallery_images"]();
        }
    });
};
image_prompt["menu"]["device_gallery"] = function () {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    if ($('.user-gallery').length === 0) {
        return false;
    }
    if ( $('#image-menu-user-gallery').hasClass('selected') === true ) {
        image_prompt["init"]();
        $('#image-menu-device-gallery').addClass('selected');
        $('#device-gallery-content').css('display', 'block');
        $('#image-prompt-description').css('display', 'none');

        if (is_mobile() === true) {
            $('#image-description-device').text(i18n[lang].please_select_new_image).css('display', 'block');
        } else {
            $('#image-description-device').text(i18n[lang].please_select_new_image).css('display', 'block');
        }
    }
};
image_prompt["type"] = "normal";
image_prompt["$logo_wrapper"] = undefined;
image_prompt["open"] = function (type) {
    if (
        type !== "normal" &&
        type !== "logo"
    ) {
        return false;
    }
    image_prompt["type"] = type;
    if ($('.user-gallery').length === 0) {
        return false;
    }
    if (is_space_prompt_opened === true) {
        modal('.prompt#space-prompt', 'close');
    }
    image_prompt["menu"]["user_gallery"]();
    modal('.prompt#image-prompt', 'open');
};

var vote_prompt = {};
vote_prompt["selected_datetime"] = null;
vote_prompt["init"] = function (type) {
    if ( $('.prompt#vote-prompt').length === 0 ) {
        return false;
    }
    var options = ""
        , year
        , month
        , day_of_month
        , days_of_month
        , day_of_week
        , hours
        , minutes
        , temp;
    var css_version = $("body").attr("data-css-version");
    var $wrapper = $('.vote-deadline-datetime')
        , $wrapper2 = $('.vote-secret');
    $wrapper.removeClass('selected');
    $wrapper.find('.toggle-vote-deadline-datetime-checker img').attr('src', aws_s3_url + '/icons/checked-grey.png' + css_version);
    $wrapper.find('.vote-deadline-datetime-content').css('display', 'none');
    $wrapper2.removeClass('selected');
    $wrapper2.find('.toggle-vote-secret-checker img').attr('src', aws_s3_url + '/icons/checked-grey.png' + css_version);
    vote_prompt.selected_datetime = new Date();
    vote_prompt.selected_datetime.setMilliseconds(0);
    vote_prompt.selected_datetime.setSeconds(0);
    vote_prompt.selected_datetime.setMinutes(0);
    vote_prompt.selected_datetime.setHours(0);
    vote_prompt.selected_datetime.setDate( vote_prompt.selected_datetime.getDate() + 2 );
    year = vote_prompt.selected_datetime.getFullYear();
    month = vote_prompt.selected_datetime.getMonth();
    day_of_month = vote_prompt.selected_datetime.getDate();
    day_of_week = get_i18n_time_text({ type: "weekday", number: vote_prompt.selected_datetime.getDay()});
    hours = vote_prompt.selected_datetime.getHours();
    minutes = vote_prompt.selected_datetime.getMinutes();
    for (var a = 0; a < 5; a++) {
        if (a === 0) {
            temp = "<option value='" + (year + a) + "' selected='selected'>" +  get_i18n_time_text({type: "year", number: (year + a)}) + "</option>";
        } else {
            temp = "<option value='" + (year + a) + "'>" + get_i18n_time_text({type: "year", number: (year + a)}) + "</option>";
        }
        options = options + temp;
    }
    $('.vote-deadline-year').empty().append(options);
    options = "";
    for (var b = 0; b < 12; b++) {
        if (b === month) {
            temp = "<option value='" + b + "' selected='selected'>" + get_i18n_time_text({type: "month", number: b}) + "</option>";
        } else {
            temp = "<option value='" + b + "'>" + get_i18n_time_text({type: "month", number: b}) + "</option>";
        }
        options = options + temp;
    }
    $('.vote-deadline-month').empty().append(options);
    days_of_month = get_days_of_month(year, month);
    options = "";
    for (var c = 0; c < days_of_month.length; c++) {
        if (days_of_month[c] === day_of_month) {
            temp = "<option value='" + days_of_month[c] + "' selected='selected'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
        } else {
            temp = "<option value='" + days_of_month[c] + "'>" + get_i18n_time_text({type: "date", number: days_of_month[c]}) + "</option>";
        }
        options = options + temp;
    }
    $('.vote-deadline-day-of-month').empty().append(options);
    $('.vote-deadline-day-of-week').text(day_of_week);
    options = "";
    for (var e = 0; e < 24; e++) {
        temp = e < 10 ? '0' + e : e;
        if (e === hours) {
            temp = "<option value='" + e + "' selected='selected'>" + temp + "</option>";
        } else {
            temp = "<option value='" + e + "'>" + temp + "</option>";
        }
        options = options + temp;
    }
    $('.vote-deadline-hours').empty().append(options);
    options = "";
    for (var f = 0; f < 60; f++) {
        if (f === minutes) {
            temp = f < 10 ? '0' + f : f;
            temp = "<option value='" + f + "' selected='selected'>" + temp + "</option>";
        } else {
            temp = f < 10 ? '0' + f : f;
            temp = "<option value='" + f + "'>" + temp + "</option>";
        }
        options = options + temp;
    }
    $('.vote-deadline-minutes').empty().append(options);
    $('.vote-deadline-fixed-datetime').text(to_i18n_fixed_datetime(vote_prompt.selected_datetime));
    if (type === "limited") {
        $wrapper.css('display', 'none');
    } else {
        $wrapper.css('display', 'block');
    }
    $('.prompt#vote-prompt').attr('data-type', type);
};