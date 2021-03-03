$(document).ready(function() {
    var lang = $("body").attr("data-lang");
    var start_datetime = new Date(parseInt($("#i18n-datetime").attr('data-start-datetime')));
    var end_datetime =  new Date(parseInt($("#i18n-datetime").attr('data-end-datetime')));
    var start = to_i18n_fixed_datetime(start_datetime)
        , end = to_i18n_fixed_datetime(end_datetime)
        , final = start + " ~ " + end;
    $('#i18n-datetime').empty().append(final);
});