$(document).ready(function () {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    fill_messages('all', true, undefined);
    $(document).on('click', '#i-messages-menu-all', function (e) {
        e.preventDefault();
        $('#i-messages-menu li').removeClass('selected');
        $('#i-messages-menu #i-messages-menu-all').addClass('selected');
        $('#i-messages-right-title').text(i18n[lang].total);
        fill_messages('all', true, undefined);
        return false;
    });
    $(document).on('click', '#i-messages-menu-received', function (e) {
        e.preventDefault();
        $('#i-messages-menu li').removeClass('selected');
        $('#i-messages-menu #i-messages-menu-received').addClass('selected');
        fill_messages('received', true, undefined);
        $('#i-messages-right-title').text(i18n[lang].received_messages);
        return false;
    });
    $(document).on('click', '#i-messages-menu-sent', function (e) {
        e.preventDefault();
        $('#i-messages-menu li').removeClass('selected');
        $('#i-messages-menu #i-messages-menu-sent').addClass('selected');
        fill_messages('sent', true, undefined);
        $('#i-messages-right-title').text(i18n[lang].sent_messages);
        return false;
    });
});