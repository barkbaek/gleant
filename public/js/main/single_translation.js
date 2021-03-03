$(document).ready(function() {
    if (is_mobile() === false) {
        $("#search-input").focus();
    }
    $(window).resize(function () {});
    var is_agenda = $("body").attr("data-is-agenda") === "true";
    if ( is_agenda === true ) {
        init_realtime_tag_agendas_list(false);
    } else {
        init_realtime_tag_opinions_list();
    }
    $('#written-wrapper .in-written').removeClass('in-written').addClass('in-body');
});