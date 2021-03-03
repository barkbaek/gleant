$(document).ready(function() {
    if (is_mobile() === false) {
        $("#search-input").focus();
    }
    $(window).resize(function () {});
    init_realtime_topic_employment_list("apply_now");
    $('#written-wrapper .in-written').removeClass('in-written').addClass('in-body');
    if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
        write_form["rebuild_write_form_data_as_ground"]();
    }
});