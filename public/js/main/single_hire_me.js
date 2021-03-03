$(document).ready(function() {
    if (is_mobile() === false) {
        $("#search-input").focus();
    }
    $(window).resize(function () {});
    init_realtime_topic_employment_list("hire_me");
    $('#written-wrapper .in-written').removeClass('in-written').addClass('in-body');
});