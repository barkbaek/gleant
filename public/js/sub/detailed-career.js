$(document).ready(function() {
    var is_loginned = $("body").attr("data-check") === "true";
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    $(document).on('click', '.change-show-career', function (e) {
        e.preventDefault();
        if (is_loginned === true) {
            if (is_agenda_prompt_opened === true) {
                modal('.prompt#agenda-prompt', 'close');
            }
            if (is_opinion_prompt_opened === true) {
                modal('.prompt#opinion-prompt', 'close');
            }
            if (is_space_prompt_opened === true) {
                modal('.prompt#space-prompt', 'close');
            }
            $('.prompt#edit-detailed-career-prompt .prompt-title').text(i18n[lang].display_profile_edit);
            $('.prompt#edit-detailed-career-prompt .prompt-description').empty().append("<span style='color:#787878;' class='hey-gleant'>" + i18n[lang].display_profile + ":</span> <span style='color:#787878;' class='hey-gleant'>" + i18n[lang].it_will_be_displayed_when_debate_is_uploaded + "</span>");
            blog["contents"]["update"]["detailed_career_and_showing_profile"]();
            modal(".prompt#edit-detailed-career-prompt", "open");
            is_edit_detailed_career_prompt_opened = true;
        }
        return false;
    });
    $(document).on("click", ".prompt#edit-detailed-career-prompt .close", function (e) {
        e.preventDefault();
        modal(".prompt#edit-detailed-career-prompt", "close");
        is_edit_detailed_career_prompt_opened = false;
        if (is_space_prompt_opened === true) {
            modal(".prompt#space-prompt", "open");
        }
        if (is_w_opinion_opened === true) {
            if (is_agenda_prompt_opened === true) {
                modal(".prompt#agenda-prompt", "open");
            }
        }
        return false;
    });
    $(document).on("click", ".prompt#update-profile-prompt .close", function (e) {
        e.preventDefault();
        blog["profile"]["prompt"]["close"]();
        return false;
    });
    $(document).on("submit", ".prompt#update-profile-prompt form", function (e) {
        e.preventDefault();
        var type = $('.prompt#update-profile-prompt').attr('data-type');
        var is_new = $('.prompt#update-profile-prompt').attr('data-is-new');
        var id = $('.prompt#update-profile-prompt').attr('data-id');
        if (type === "prize") {
            if (is_new === "true") {
                blog["profile"]["update"]({type:type, action:"add"});
            } else {
                blog["profile"]["update"]({type:type, action:"update", id: id});
            }
        } else {
            blog["profile"]["update"]({type:type});
        }
        return false;
    });
    $(document).on("click", ".prompt#update-profile-prompt form #btn-add", function (e) {
        e.preventDefault();
        var type = $('.prompt#update-profile-prompt').attr('data-type');
        var id = $('.prompt#update-profile-prompt').attr('data-id');
        blog["profile"]["update"]({type:type, action:'add', id:id});
        return false;
    });
    $(document).on("click", ".prompt#update-profile-prompt form #btn-update", function (e) {
        e.preventDefault();
        var type = $('.prompt#update-profile-prompt').attr('data-type');
        var id = $('.prompt#update-profile-prompt').attr('data-id');
        blog["profile"]["update"]({type:type, action:'update', id:id});
        return false;
    });
    $(document).on("click", ".prompt#update-profile-prompt form #btn-remove", function (e) {
        e.preventDefault();
        var type = $('.prompt#update-profile-prompt').attr('data-type');
        var id = $('.prompt#update-profile-prompt').attr('data-id');
        blog["profile"]["update"]({type:type, action:'remove', id:id});
        return false;
    });
    $(document).on('click', '.add-employment', function (e) {
        e.preventDefault();
        blog["profile"]["prompt"]["open"]({type: "employment", is_new: true});
        return false;
    });
    $(document).on('click', '.add-education', function (e) {
        e.preventDefault();
        blog["profile"]["prompt"]["open"]({type: "education", is_new: true});
        return false;
    });
    $(document).on('click', '.add-prize', function (e) {
        e.preventDefault();
        blog["profile"]["prompt"]["open"]({type: "prize", is_new: true});
        return false;
    });
    $(document).on('click', '.add-location', function (e) {
        e.preventDefault();
        blog["profile"]["prompt"]["open"]({type: "location", is_new: true});
        return false;
    });
    $(document).on('click', '.add-website', function (e) {
        e.preventDefault();
        blog["profile"]["prompt"]["open"]({type: "website", is_new: true});
        return false;
    });
    $(document).on('click', '#edit-iq-eq, #iq-eq.empty', function (e) {
        e.preventDefault();
        blog["profile"]["get_and_open"]({
            type: 'iq_eq',
            id: 'iq_eq'
        });
        return false;
    });
    $(document).on('click', '#edit-simple-career, #simple-career.empty, .simple-career .edit', function (e) {
        e.preventDefault();
        blog["profile"]["get_and_open"]({
            type: 'simple_career',
            id: 'simple_career'
        });
        return false;
    });
    $(document).on('click', '.add-simple-career.empty', function (e) {
        e.preventDefault();
        blog["profile"]["prompt"]["open"]({type: "simple_career", is_new: true});
        return false;
    });
    $(document).on("click", ".employment .edit", function (e) {
        e.preventDefault();
        var id = $(e.currentTarget).parent().attr("class").split(' ')[1];
        blog["profile"]["get_and_open"]({
            type: 'employment',
            id: id
        });
        return false;
    });
    $(document).on("click", ".education .edit", function (e) {
        e.preventDefault();
        var id = $(e.currentTarget).parent().attr("class").split(' ')[1];
        blog["profile"]["get_and_open"]({
            type: 'education',
            id: id
        });
        return false;
    });
    $(document).on("click", ".location .edit", function (e) {
        e.preventDefault();
        var id = $(e.currentTarget).parent().attr("class").split(' ')[1];
        blog["profile"]["get_and_open"]({
            type: 'location',
            id: id
        });
    });
    $(document).on("click", ".prize .edit", function (e) {
        e.preventDefault();
        var id = $(e.currentTarget).parent().attr("class").split(' ')[1];
        blog["profile"]["get_and_open"]({
            type: 'prize',
            id: id
        });
        return false;
    });
    $(document).on("click", ".website .edit", function (e) {
        e.preventDefault();
        var id = $(e.currentTarget).parent().attr("class").split(' ')[1];
        blog["profile"]["get_and_open"]({
            type: 'website',
            id: id
        });
        return false;
    });
    $(document).on("change", "#update-profile-prompt select", function (e) {
        var id = $(e.currentTarget).attr('id');
        var $start_year
            , $start_month
            , $start_day
            , $end_year
            , $end_month
            , $end_day
            , $received_year
            , $received_month
            , $received_day
            , days_of_month
            , temp;
        if ( id === 'start-year' ) {
            $start_year = $('#update-profile-prompt #start-year');
            $start_month = $('#update-profile-prompt #start-month');
            $start_day = $('#update-profile-prompt #start-day');

            if ( $start_year.find('option:selected').val() === '' ) {
                $start_month.attr('disabled', 'disabled');
                $start_day.attr('disabled', 'disabled');
                $start_month.find('option[value=""]').prop('selected', true);
                $start_day.empty().append("<option selected='selected' value=''>" + i18n[lang].day + "</option>");
                for (var i = 1; i <= 31; i++) {
                    $start_day.append("<option value='" + i + "'>" + get_i18n_time_text({ type:"date", number: i }) + "</option>");
                }
            } else {
                if ( $start_month.attr('disabled') === 'disabled' ) {
                    $start_month.removeAttr('disabled');
                } else {
                    if ( $start_month.find('option:selected').val() !== '' ) {
                        days_of_month = get_days_of_month(parseInt($start_year.find('option:selected').val()), parseInt($start_month.find('option:selected').val()));
                        temp = $start_day.find('option:selected').val();
                        $start_day.empty().append("<option value=''>" + i18n[lang].day + "</option>");
                        for (var i = 0; i < days_of_month.length; i++) {
                            $start_day.append("<option value='" + days_of_month[i] + "'>" + get_i18n_time_text({ type:"date", number: days_of_month[i] }) + "</option>");
                        }
                        if (temp === "") {
                            $start_day.find('option[value=""]').prop('selected', true);
                        } else {
                            temp = parseInt(temp);
                            if (days_of_month[ days_of_month.length - 1 ] < temp) {
                                temp = days_of_month[ days_of_month.length - 1 ];
                            }
                            $start_day.find('option[value=' + temp + ']').prop('selected', true);
                        }
                    }
                }
            }
        } else if ( id === 'start-month' ) {
            $start_year = $('#update-profile-prompt #start-year');
            $start_month = $('#update-profile-prompt #start-month');
            $start_day = $('#update-profile-prompt #start-day');
            if ( $start_month.find('option:selected').val() !== '' ) {
                days_of_month = get_days_of_month(parseInt($start_year.find('option:selected').val()), parseInt($start_month.find('option:selected').val()));
                temp = $start_day.find('option:selected').val();
                $start_day.empty().append("<option value=''>" + i18n[lang].day + "</option>");
                for (var i = 0; i < days_of_month.length; i++) {
                    $start_day.append("<option value='" + days_of_month[i] + "'>" + get_i18n_time_text({ type:"date", number: days_of_month[i] }) + "</option>");
                }
                if (temp === "") {
                    $start_day.find('option[value=""]').prop('selected', true);
                } else {
                    temp = parseInt(temp);
                    if (days_of_month[ days_of_month.length - 1 ] < temp) {
                        temp = days_of_month[ days_of_month.length - 1 ];
                    }
                    $start_day.find('option[value=' + temp + ']').prop('selected', true);
                }
                $start_day.removeAttr('disabled');
            } else {
                $start_day.attr('disabled', 'disabled');
                $start_day.empty().append("<option value=''>" + i18n[lang].day + "</option>");
                for (var i = 1; i <= 31; i++) {
                    $start_day.append("<option value='" + i + "'>" + get_i18n_time_text({ type:"date", number: i }) + "</option>");
                }
            }
        } else if ( id === 'end-year' ) {
            $end_year = $('#update-profile-prompt #end-year');
            $end_month = $('#update-profile-prompt #end-month');
            $end_day = $('#update-profile-prompt #end-day');
            if ( $end_year.find('option:selected').val() === '' ) {
                $end_month.attr('disabled', 'disabled');
                $end_day.attr('disabled', 'disabled');
                $end_month.find('option[value=""]').prop('selected', true);
                $end_day.empty().append("<option selected='selected' value=''>" + i18n[lang].day + "</option>");
                for (var i = 1; i <= 31; i++) {
                    $end_day.append("<option value='" + i + "'>" + get_i18n_time_text({ type:"date", number: i }) + "</option>");
                }
            } else {
                if ( $end_month.attr('disabled') === 'disabled' ) {
                    $end_month.removeAttr('disabled');
                } else {
                    if ( $end_month.find('option:selected').val() !== '' ) {
                        days_of_month = get_days_of_month(parseInt($end_year.find('option:selected').val()), parseInt($end_month.find('option:selected').val()));
                        temp = $end_day.find('option:selected').val();
                        $end_day.empty().append("<option value=''>" + i18n[lang].day + "</option>");
                        for (var i = 0; i < days_of_month.length; i++) {
                            $end_day.append("<option value='" + days_of_month[i] + "'>" + get_i18n_time_text({ type:"date", number: days_of_month[i] }) + "</option>");
                        }
                        if (temp === "") {
                            $end_day.find('option[value=""]').prop('selected', true);
                        } else {
                            temp = parseInt(temp);
                            if (days_of_month[ days_of_month.length - 1 ] < temp) {
                                temp = days_of_month[ days_of_month.length - 1 ];
                            }
                            $end_day.find('option[value=' + temp + ']').prop('selected', true);
                        }
                    }
                }
            }
        } else if ( id === 'end-month' ) {
            $end_year = $('#update-profile-prompt #end-year');
            $end_month = $('#update-profile-prompt #end-month');
            $end_day = $('#update-profile-prompt #end-day');
            if ( $end_month.find('option:selected').val() !== '' ) {
                days_of_month = get_days_of_month(parseInt($end_year.find('option:selected').val()), parseInt($end_month.find('option:selected').val()));
                temp = $end_day.find('option:selected').val();
                $end_day.empty().append("<option value=''>" + i18n[lang].day + "</option>");
                for (var i = 0; i < days_of_month.length; i++) {
                    $end_day.append("<option value='" + days_of_month[i] + "'>" + get_i18n_time_text({ type:"date", number: days_of_month[i] }) + "</option>");
                }
                if (temp === "") {
                    $end_day.find('option[value=""]').prop('selected', true);
                } else {
                    temp = parseInt(temp);
                    if (days_of_month[ days_of_month.length - 1 ] < temp) {
                        temp = days_of_month[ days_of_month.length - 1 ];
                    }
                    $end_day.find('option[value=' + temp + ']').prop('selected', true);
                }
                $end_day.removeAttr('disabled');
            } else {
                $end_day.attr('disabled', 'disabled');
                $end_day.empty().append("<option value=''>" + i18n[lang].day + "</option>");
                for (var i = 1; i <= 31; i++) {
                    $end_day.append("<option value='" + i + "'>" + get_i18n_time_text({ type:"date", number: i }) + "</option>");
                }
            }
        } else if ( id === 'received-year' ) {
            $received_year = $('#update-profile-prompt #received-year');
            $received_month = $('#update-profile-prompt #received-month');
            $received_day = $('#update-profile-prompt #received-day');
            if ( $received_year.find('option:selected').val() === '' ) {
                $received_month.attr('disabled', 'disabled');
                $received_day.attr('disabled', 'disabled');
                $received_month.find('option[value=""]').prop('selected', true);
                $received_day.empty().append("<option selected='selected' value=''>" + i18n[lang].day + "</option>");
                for (var i = 1; i <= 31; i++) {
                    $received_day.append("<option value='" + i + "'>" + get_i18n_time_text({ type:"date", number: i }) + "</option>");
                }
            } else {
                if ( $received_month.attr('disabled') === 'disabled' ) {
                    $received_month.removeAttr('disabled');
                } else {
                    if ( $received_month.find('option:selected').val() !== '' ) {
                        days_of_month = get_days_of_month(parseInt($received_year.find('option:selected').val()), parseInt($received_month.find('option:selected').val()));
                        temp = $received_day.find('option:selected').val();
                        $received_day.empty().append("<option value=''>" + i18n[lang].day + "</option>");
                        for (var i = 0; i < days_of_month.length; i++) {
                            $received_day.append("<option value='" + days_of_month[i] + "'>" + get_i18n_time_text({ type:"date", number: days_of_month[i] }) + "</option>");
                        }
                        if (temp === "") {
                            $received_day.find('option[value=""]').prop('selected', true);
                        } else {
                            temp = parseInt(temp);
                            if (days_of_month[ days_of_month.length - 1 ] < temp) {
                                temp = days_of_month[ days_of_month.length - 1 ];
                            }
                            $received_day.find('option[value=' + temp + ']').prop('selected', true);
                        }
                    }
                }
            }
        } else if ( id === 'received-month' ) {
            $received_year = $('#update-profile-prompt #received-year');
            $received_month = $('#update-profile-prompt #received-month');
            $received_day = $('#update-profile-prompt #received-day');
            if ( $received_month.find('option:selected').val() !== '' ) {
                days_of_month = get_days_of_month(parseInt($received_year.find('option:selected').val()), parseInt($received_month.find('option:selected').val()));
                temp = $received_day.find('option:selected').val();
                $received_day.empty().append("<option value=''>" + i18n[lang].day + "</option>");
                for (var i = 0; i < days_of_month.length; i++) {
                    $received_day.append("<option value='" + days_of_month[i] + "'>" + get_i18n_time_text({ type:"date", number: days_of_month[i] }) + "</option>");
                }
                if (temp === "") {
                    $received_day.find('option[value=""]').prop('selected', true);
                } else {
                    temp = parseInt(temp);
                    if (days_of_month[ days_of_month.length - 1 ] < temp) {
                        temp = days_of_month[ days_of_month.length - 1 ];
                    }
                    $received_day.find('option[value=' + temp + ']').prop('selected', true);
                }
                $received_day.removeAttr('disabled');
            } else {
                $received_day.attr('disabled', 'disabled');
                $received_day.empty().append("<option value=''>" + i18n[lang].day + "</option>");
                for (var i = 1; i <= 31; i++) {
                    $received_day.append("<option value='" + i + "'>" + get_i18n_time_text({ type:"date", number: i }) + "</option>");
                }
            }
        }
    });
    $(document).on("change", "#update-profile-prompt input[type='checkbox']", function (e) {
        var type = $('#update-profile-prompt').attr('data-type')
            , id = $(e.currentTarget).attr("id");
        if (id === "ing") {
            if (
                type === 'employment' ||
                type === 'education' ||
                type === 'location'
            ) {
                var $end_year = $("#update-profile-prompt #end-year")
                    , $end_month = $("#update-profile-prompt #end-month")
                    , $end_day = $("#update-profile-prompt #end-day");
                if ($(e.currentTarget).is(":checked") === true) {
                    $end_year.attr('disabled', 'disabled');
                    $end_month.attr('disabled', 'disabled');
                    $end_day.attr('disabled', 'disabled');
                    $end_year.empty().append("<option selected='selected' value=''>" + i18n[lang].year + "</option>");
                    $end_month.empty().append("<option selected='selected' value=''>" + i18n[lang].month + "</option>");
                    $end_day.empty().append("<option selected='selected' value=''>" + i18n[lang].day + "</option>");
                    for (var i = (new Date()).getFullYear(); i >= 1900; i--) {
                        $end_year.append("<option value='" + i + "'>" + get_i18n_time_text({type: "year", number: i}) + "</option>");
                    }
                    for (var i = 0; i < 12; i++) {
                        $end_month.append("<option value='" + i + "'>" + get_i18n_time_text({type: "month", number: i}) + "</option>");
                    }
                    for (var i = 1; i <= 31; i++) {
                        $end_day.append("<option value='" + i + "'>" + get_i18n_time_text({type: "date", number: i}) + "</option>");
                    }
                } else {
                    $('#end-year').removeAttr('disabled');
                }
            }
        }
    });
});