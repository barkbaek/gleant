$(document).ready(function() {
    $(document).on('DOMNodeInserted', function(e) {});
    $(document).on("change", "#ground select.main-tag", function (e) {
        e.preventDefault();
        init_realtime_tag_agendas_list(true);
        return false;
    });
    if (write_form && write_form["rebuild_write_form_data_as_ground"]) {
        write_form["rebuild_write_form_data_as_ground"]();
    }
});