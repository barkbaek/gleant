$(document).ready(function() {
    if (is_mobile() === false) {
        $("#search-input").focus();
    }
    fill_notifications(true, undefined);
});