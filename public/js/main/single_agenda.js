$(document).ready(function() {
    if (is_mobile() === false) {
        $("#search-input").focus();
    }
    $(window).resize(function () {});
    init_realtime_tag_agendas_list(false);
    $('#written-wrapper .in-written').removeClass('in-written').addClass('in-body');
});