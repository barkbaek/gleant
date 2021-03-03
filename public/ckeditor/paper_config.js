CKEDITOR.editorConfig = function( config ) {
    config.toolbar = [
        ['Bold', 'Italic', 'Underline', 'Link', 'Vote', 'Photo', 'Youtube']
    ];
    config.extraPlugins = 'autogrow,confighelper,link,vote,photo,youtube';
    config.extraAllowedContent = '*[id](*)';
    config.enterMode = CKEDITOR.ENTER_BR;
    config.autoParagraph = false;
    config.language = "en";
};