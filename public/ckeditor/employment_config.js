CKEDITOR.editorConfig = function( config ) {
    config.toolbar = [
        ['Bold', 'Italic', 'Underline', 'Photo', 'Youtube']
    ];
    config.extraPlugins = 'autogrow,confighelper,photo,youtube';
    config.extraAllowedContent = '*[id](*)';
    config.enterMode = CKEDITOR.ENTER_BR;
    config.autoParagraph = false;
    config.language = "en";
};