var vote_counter = function ($counter) {
    var lang = $("body").attr("data-lang")
        , service_type = $counter.attr('data-service-type')
        , type = $counter.attr('data-type')
        , is_start_set = $counter.attr('data-is-start-set') === "true"
        , start_at = parseInt($counter.attr('data-start-at'))
        , is_finish_set = $counter.attr('data-is-finish-set') === "true"
        , finish_at = parseInt($counter.attr('data-finish-at'))
        , finish_at_date
        , now = new Date()
        , diff;
    if (lang === undefined) {
        lang = "en";
    }
    $counter.empty().removeClass('in-progress');
    if (service_type !== "") {
        if (type === "unlimited") {
            if (is_finish_set === true) {
                finish_at_date = new Date(finish_at);
                diff = Math.floor((finish_at_date.valueOf() - now.valueOf()) / 1000);
                if (diff < 1) {
                    $counter.append(i18n[lang].finished + " " + to_i18n_fixed_datetime(finish_at_date));
                } else {
                    $counter.addClass('in-progress');
                    $counter.append(i18n[lang].it_is_time_to_vote + "<br>" + get_i18n_text_ago_or_left({type: "left", diff: diff}));
                }
            } else {
                $counter.addClass('in-progress');
                $counter.append(i18n[lang].it_is_time_to_vote);
            }
        } else {
            if (is_start_set === true) {
                if (start_at > now.valueOf()) {
                    $counter.append(i18n[lang].unable_to_vote_now);
                } else {
                    if (is_finish_set === true) {
                        if (finish_at > now.valueOf()) {
                            finish_at_date = new Date(finish_at);
                            diff = Math.floor((finish_at_date.valueOf() - now.valueOf()) / 1000);
                            if (diff < 1) {
                                $counter.append(i18n[lang].unable_to_vote_now);
                            } else {
                                $counter.addClass('in-progress');
                                $counter.append(i18n[lang].it_is_time_to_vote  + "<br>" + get_i18n_text_ago_or_left({type: "left", diff: diff}));
                            }
                        } else {
                            $counter.append(i18n[lang].unable_to_vote_now);
                        }
                    } else {
                        $counter.addClass('in-progress');
                        $counter.append(i18n[lang].it_is_time_to_vote);
                    }
                }
            } else {
                if (is_finish_set === true) {
                    if (finish_at > now.valueOf()) {
                        finish_at_date = new Date(finish_at);
                        diff = Math.floor((finish_at_date.valueOf() - now.valueOf()) / 1000);
                        if (diff < 1) {
                            $counter.append(i18n[lang].unable_to_vote_now);
                        } else {
                            $counter.addClass('in-progress');
                            $counter.append(i18n[lang].it_is_time_to_vote  + "<br>" + get_i18n_text_ago_or_left({type: "left", diff: diff}));
                        }
                    } else {
                        $counter.append(i18n[lang].unable_to_vote_now);
                    }
                } else {
                    $counter.addClass('in-progress');
                    $counter.append(i18n[lang].it_is_time_to_vote);
                }
            }
        }
        setTimeout(function () {
            vote_counter($counter);
        }, 1000);
    }
};
$(document).ready(function () {
    $("body").append("<div id='loaded' style='display:none;'></div>");
    var $counter = $('.vote-counter');
    if ( $counter.length > 0) {
        vote_counter($counter);
    }
    $(document).on('click', '.vote-top.num-of-voters.autonym', function (e) {
        e.preventDefault();
        $('.voters-prompt').css('display', 'block');
        return false;
    });
    $(document).on('click', '.close', function (e) {
        e.preventDefault();
        $('.voters-prompt').css('display', 'none');
        return false;
    });
});