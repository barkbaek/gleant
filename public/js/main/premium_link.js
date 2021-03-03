var set_height_of_premium_link_announcement_box = function () {
    var height = $("#premium-link-user-box").height();
    if (height < 10) {
        setTimeout(function () {
            set_height_of_premium_link_announcement_box();
        }, 1000);
    } else {
        $("#premium-link-announcement-box").height(height + "px");
        $("#premium-link-announcement-item-list").height((height - $("#premium-link-announcement-title").height() - 22) + "px");
    }
};

my_premium_link = {};

/**
 * Premium Link written format
 * The top element is .my-premium-link-item
 * 초기 작성 시에 사용
 * @param doc {object} - single premium link item
 **/
my_premium_link["written"] = {};

/**
 * Element is .my-premium-link-item-expenditure-history-item
 **/
my_premium_link["written"]["expenditure_history_item"] = function (doc) {

};

my_premium_link["written"]["perfect"] = function (doc) {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var css_version = $("body").attr("data-css-version");

    var _class = doc.blog_id + "-" + doc.pl_id
        , temp
        , span
        , select
        , img
        , input
        , textarea
        , label;
    var my_premium_link_remove = "<div class='remove my-premium-link-remove'>" + i18n[lang].remove + "</div>";
    var my_premium_link_edit = "<div class='edit my-premium-link-edit'>" + i18n[lang].edit + "</div>";
    var my_premium_link_item_power;

    if (doc.is_sleeping === true) { /* When Goint is 0.. */
        if (doc.is_on === true) {
            my_premium_link_item_power = "<div class='my-premium-link-item-power'>On</div>";
        } else {
            my_premium_link_item_power = "<div class='my-premium-link-item-power'>Off</div>";
        }
    } else {
        if (doc.is_on === true) {
            my_premium_link_item_power = "<div class='my-premium-link-item-power on'>On</div>";
        } else {
            my_premium_link_item_power = "<div class='my-premium-link-item-power off'>Off</div>";
        }
    }

    var selected_language, language_options;

    if (doc.language === "en") {
        selected_language = i18n[lang].english;
        language_options = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
    } else if (doc.language === "ja") {
        selected_language = i18n[lang].japanese;
        language_options = "<option class='lang-ja' value='ja' selected='selected'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
    } else if (doc.language === "ko") {
        selected_language = i18n[lang].korean;
        language_options = "<option class='lang-ko' value='ko' selected='selected'>" + i18n[lang].korean + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
    } else if (doc.language === "zh-Hans") {
        selected_language = i18n[lang].simplified_chinese;
        language_options = "<option class='lang-zh-Hans' value='zh-Hans' selected='selected'>" + i18n[lang].simplified_chinese + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
    }

    var my_premium_link_item_language = "<div class='my-premium-link-item-language' data-language='" + doc.language + "'>" + selected_language + "</div>";
    var my_premium_link_item_title = "<div class='my-premium-link-item-title'>" + get_encoded_html_preventing_xss(doc.title) + "</div>";
    var my_premium_link_item_description = "<div class='my-premium-link-item-description'>" + get_encoded_html_preventing_xss(doc.description) + "</div>";
    var my_premium_link_item_link = "<div class='my-premium-link-item-link'>" + get_encoded_html_preventing_xss(doc.link) + "</div>";

    var my_premium_link_item_content = "<div class='my-premium-link-item-content'>" + my_premium_link_item_language + my_premium_link_item_title + my_premium_link_item_description + my_premium_link_item_link + "</div>";

    var my_premium_link_item_keywords = "<div class='my-premium-link-item-keywords selected'>" + i18n[lang].keywords +  "</div>";
    var my_premium_link_item_expenditure_history = "<div class='my-premium-link-item-expenditure-history'>" + i18n[lang].expenditure_history + "</div>";
    var my_premium_link_item_bottom_menu = "<div class='my-premium-link-item-bottom-menu'>" + my_premium_link_item_keywords + my_premium_link_item_expenditure_history + "</div>";

    var my_premium_link_item_keyword_list = "";
    for (var i = 0; i < doc.keywords.length; i++) {
        temp = "<div class='my-premium-link-item-keyword'>" + get_encoded_html_preventing_xss(doc.keywords[i]) + "</div>";
        my_premium_link_item_keyword_list = my_premium_link_item_keyword_list + temp;
    }

    var my_premium_link_item_keywords_box = "<div class='my-premium-link-item-keywords-box'>" + my_premium_link_item_keyword_list + "</div>";

    var my_premium_link_item_expenditure_history_left = "<div class='my-premium-link-item-expenditure-history-left'>" + i18n[lang].date + "</div>";
    var my_premium_link_item_expenditure_history_right1 = "<div class='my-premium-link-item-expenditure-history-right1'>" + i18n[lang].exposure + "</div>";
    var my_premium_link_item_expenditure_history_right2 = "<div class='my-premium-link-item-expenditure-history-right2'>" + i18n[lang].click + "</div>";
    var my_premium_link_item_expenditure_history_right3 = "<div class='my-premium-link-item-expenditure-history-right3'>" + i18n[lang].total_cost + "</div>";
    var my_premium_link_item_expenditure_history_right_inner = "<div class='my-premium-link-item-expenditure-history-right-inner'>" + my_premium_link_item_expenditure_history_right1 + my_premium_link_item_expenditure_history_right2 + my_premium_link_item_expenditure_history_right3 +"</div>";
    var my_premium_link_item_expenditure_history_right = "<div class='my-premium-link-item-expenditure-history-right'>" + my_premium_link_item_expenditure_history_right_inner + "</div>";

    var my_premium_link_item_expenditure_history_top = "<div class='my-premium-link-item-expenditure-history-top'>" + my_premium_link_item_expenditure_history_left + my_premium_link_item_expenditure_history_right + "</div>";
    var my_premium_link_item_expenditure_history_item_list = "<div class='my-premium-link-item-expenditure-history-item-list'></div>";
    span = "";
    img = "<img class='btn-more-down-14' src='" + aws_s3_url + "/icons/more-down.png" + css_version + "'>";
    var my_premium_link_item_expenditure_history_item_more = "<div class='my-premium-link-item-expenditure-history-item-more'>" + span + img + "</div>";
    var my_premium_link_item_expenditure_history_box = "<div class='my-premium-link-item-expenditure-history-box' style='display:none;'>" + my_premium_link_item_expenditure_history_top + my_premium_link_item_expenditure_history_item_list + my_premium_link_item_expenditure_history_item_more + "</div>";

    var my_premium_link_item_written = "<div class='my-premium-link-item-written' data-blog-id='" + doc.blog_id + "' data-pl-id='" + doc.pl_id + "'>" + my_premium_link_remove + my_premium_link_edit + my_premium_link_item_power + my_premium_link_item_content + my_premium_link_item_bottom_menu + my_premium_link_item_keywords_box + my_premium_link_item_expenditure_history_box + "</div>";

    span = "<span>" + i18n[lang].language + "</span>";
    select = "<select class='premium-link-selected-language'>" + language_options + "</select>";
    label = "<label style='display:inline-block;margin-left:10px;'>" + span + select + "</label>";

    var my_premium_link_item_editing_inner_list = "";
    var premium_link_selected_language_wrapper = "<div class='premium-link-selected-language-wrapper'>" + label + "</div>";
    my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + premium_link_selected_language_wrapper;

    span = "<span class='premium-link-label'>" + i18n[lang].title + "</span>";
    input = "<input class='premium-link-editing-title' type='text' value=''>";
    label = "<label class='m-b-10'>" + span + input + "</label>";
    my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + label;

    span = "<span class='premium-link-label'>" + i18n[lang].explanation + "</span>";
    textarea = "<textarea class='premium-link-editing-explanation-textarea'>" + "</textarea>";
    var premium_link_editing_explanation = "<div class='premium-link-editing-explanation'>" + textarea + "</div>";
    label = "<label class='m-b-10'>" + span + premium_link_editing_explanation + "</label>";
    my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + label;

    span = "<span class='premium-link-label'>" + i18n[lang].link + "</span>";
    var option_list = "";
    /* Check protocol of link */
    if (doc.link[4] === "s") { /* https */
        option_list = "<option value='https' selected='selected'>https://</option><option value='http'>http://</option>";
    } else { /* http */
        option_list = "<option value='http' selected='selected'>http://</option><option value='https'>https://</option>";
    }
    select = "<select class='premium-link-editing-link-select'>" + option_list + "</select>";
    var premium_link_editing_link_left = "<div class='premium-link-editing-link-left'>" + select + "</div>";
    input = "<input class='premium-link-editing-link-input' type='url'>";
    var premium_link_editing_link_right = "<div class='premium-link-editing-link-right'>" + input + "</div>";
    var premium_link_editing_link = "<div class='premium-link-editing-link'>" + premium_link_editing_link_left + premium_link_editing_link_right + "</div>";
    var m_b_10 = "<div class='m-b-10'>" + span + premium_link_editing_link + "</div>";
    my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + m_b_10;

    span = "<span class='premium-link-label'>" + i18n[lang].search_keywords + "</span>";
    input = "<input class='premium-link-search-input' type='text'>";
    var premium_link_search_input_box = "<div class='premium-link-search-input-box'>" + input + "</div>";
    var btn_premium_link_search = "<div class='btn-premium-link-search'>" + i18n[lang].search + "</div>";
    var premium_link_search_wrapper = "<div class='premium-link-search-wrapper'>" + premium_link_search_input_box + btn_premium_link_search + "</div>";
    m_b_10 = "<div>" + span + premium_link_search_wrapper + "</div>";
    my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + m_b_10;

    var premium_link_searched_keyword_list = "<div class='premium-link-searched-keyword-list'></div>";
    my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + premium_link_searched_keyword_list;

    span = "<span class='num-of-my-premium-link-keywords' data-count='" + doc.keywords.length + "'>" + doc.keywords.length + " / 10</span>";
    temp = "<span class='premium-link-label'>" + i18n[lang].selected_keywords + "</span>";
    m_b_10 = "<div>" + span + temp + "</div>";
    my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + m_b_10;

    var premium_link_selected_keyword_list = "<div class='premium-link-selected-keyword-list'></div>";
    my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + premium_link_selected_keyword_list;

    input = "<input class='btn-career btn-cancel-editing-my-premium-link' type='button' value='" + i18n[lang].cancel + "'>";
    temp = "<input class='btn-career btn-update-editing-my-premium-link' type='button' value='" + i18n[lang].check + "'>";
    var btn_career_wrapper = "<div class='btn-career-wrapper'>" + input + temp + "</div>";
    my_premium_link_item_editing_inner_list = my_premium_link_item_editing_inner_list + btn_career_wrapper;

    var my_premium_link_item_editing_inner = "<div class='my-premium-link-item-editing-inner'>" + my_premium_link_item_editing_inner_list + "</div>";
    var my_premium_link_item_editing = "<div class='my-premium-link-item-editing' data-blog-id='" + doc.blog_id + "' data-pl-id='" + doc.pl_id + "'>" + my_premium_link_item_editing_inner + "</div>";

    return "<div class='my-premium-link-item " + _class + "'>" + my_premium_link_item_written + my_premium_link_item_editing + "</div>";
};

my_premium_link["editing"] = {};
my_premium_link["editing"]["perfect"] = function (doc) {

};
/**
 * Premium Link writing format - use on [.prompt#writing-premium-link-prompt]
 * return .my-premium-link-item-writing
 **/
my_premium_link["writing"] = {};
my_premium_link["writing"]["perfect"] = function () {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var css_version = $("body").attr("data-css-version");
    var temp
        , span
        , input
        , textarea
        , select
        , label;

    var language_options;

    if (lang === "en") {
        language_options = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
    } else if (lang === "ja") {
        language_options = "<option class='lang-ja' value='ja' selected='selected'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
    } else if (lang === "ko") {
        language_options = "<option class='lang-ko' value='ko' selected='selected'>" + i18n[lang].korean + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
    } else if (lang === "zh-Hans") {
        language_options = "<option class='lang-zh-Hans' value='zh-Hans' selected='selected'>" + i18n[lang].simplified_chinese + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
    }

    span = "<span>" + i18n[lang].language + "</span>";
    select = "<select class='premium-link-selected-language'>" + language_options + "</select>";
    label = "<label style='display:inline-block;margin-left:10px;'>" + span + select + "</label>";

    var my_premium_link_item_writing_inner_list = "";
    var premium_link_selected_language_wrapper = "<div class='premium-link-selected-language-wrapper'>" + label + "</div>";
    my_premium_link_item_writing_inner_list = my_premium_link_item_writing_inner_list + premium_link_selected_language_wrapper;

    span = "<span class='premium-link-label'>" + i18n[lang].title + "</span>";
    input = "<input class='premium-link-writing-title' type='text' value=''>";
    label = "<label class='m-b-10'>" + span + input + "</label>";
    my_premium_link_item_writing_inner_list = my_premium_link_item_writing_inner_list + label;

    span = "<span class='premium-link-label'>" + i18n[lang].explanation + "</span>";
    textarea = "<textarea class='premium-link-writing-explanation-textarea'>" + "</textarea>";
    var premium_link_writing_explanation = "<div class='premium-link-writing-explanation'>" + textarea + "</div>";
    label = "<label class='m-b-10'>" + span + premium_link_writing_explanation + "</label>";
    my_premium_link_item_writing_inner_list = my_premium_link_item_writing_inner_list + label;

    span = "<span class='premium-link-label'>" + i18n[lang].link + "</span>";
    var option_list = "<option value='http' selected='selected'>http://</option><option value='https'>https://</option>";
    select = "<select class='premium-link-writing-link-select'>" + option_list + "</select>";
    var premium_link_writing_link_left = "<div class='premium-link-writing-link-left'>" + select + "</div>";
    input = "<input class='premium-link-writing-link-input' type='url'>";
    var premium_link_writing_link_right = "<div class='premium-link-writing-link-right'>" + input + "</div>";
    var premium_link_writing_link = "<div class='premium-link-writing-link'>" + premium_link_writing_link_left + premium_link_writing_link_right + "</div>";
    var m_b_10 = "<div class='m-b-10'>" + span + premium_link_writing_link + "</div>";
    my_premium_link_item_writing_inner_list = my_premium_link_item_writing_inner_list + m_b_10;

    span = "<span class='premium-link-label'>" + i18n[lang].search_keywords + "</span>";
    input = "<input class='premium-link-search-input' type='text'>";
    var premium_link_search_input_box = "<div class='premium-link-search-input-box'>" + input + "</div>";
    var btn_premium_link_search = "<div class='btn-premium-link-search'>" + i18n[lang].search + "</div>";
    var premium_link_search_wrapper = "<div class='premium-link-search-wrapper'>" + premium_link_search_input_box + btn_premium_link_search + "</div>";
    m_b_10 = "<div>" + span + premium_link_search_wrapper + "</div>";
    my_premium_link_item_writing_inner_list = my_premium_link_item_writing_inner_list + m_b_10;

    var premium_link_searched_keyword_list = "<div class='premium-link-searched-keyword-list'></div>";
    my_premium_link_item_writing_inner_list = my_premium_link_item_writing_inner_list + premium_link_searched_keyword_list;

    span = "<span class='num-of-my-premium-link-keywords' data-count='0'>0 / 10</span>";
    temp = "<span class='premium-link-label'>" + i18n[lang].selected_keywords + "</span>";
    m_b_10 = "<div>" + span + temp + "</div>";
    my_premium_link_item_writing_inner_list = my_premium_link_item_writing_inner_list + m_b_10;

    var premium_link_selected_keyword_list = "<div class='premium-link-selected-keyword-list'></div>";
    my_premium_link_item_writing_inner_list = my_premium_link_item_writing_inner_list + premium_link_selected_keyword_list;

    input = "<input class='btn-career btn-ok-writing-my-premium-link' type='button' value='" + i18n[lang].check + "' style='margin-right:10px;'>";
    var btn_career_wrapper = "<div class='btn-career-wrapper'>" + input + "</div>";
    my_premium_link_item_writing_inner_list = my_premium_link_item_writing_inner_list + btn_career_wrapper;

    var my_premium_link_item_writing_inner = "<div class='my-premium-link-item-writing-inner'>" + my_premium_link_item_writing_inner_list + "</div>";
    return "<div class='my-premium-link-item-writing'>" + my_premium_link_item_writing_inner + "</div>";
};

var remove_info = {};

$(document).ready(function () {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    set_height_of_premium_link_announcement_box();

    /* Turn off power */
    $(document).on("click", ".my-premium-link-item-power.on", function (e) {
        e.preventDefault();
        var $current = $(e.currentTarget);
        $current.removeClass("on").addClass("off").text("Off");
        var _id = $current.parent().attr("data-pl-id");
        return false;
    });

    /* Turn on power */
    $(document).on("click", ".my-premium-link-item-power.off", function (e) {
        e.preventDefault();
        var $current = $(e.currentTarget);
        $current.removeClass("off").addClass("on").text("On");
        var _id = $current.parent().attr("data-pl-id");
        return false;
    });

    /* Load Keywords Box */
    $(document).on("click", ".my-premium-link-item-keywords", function (e) {
        e.preventDefault();
        var $current = $(e.currentTarget);
        $current.addClass("selected");
        $current.parent().find(".my-premium-link-item-expenditure-history").removeClass("selected");
        var $wrapper = $current.parent().parent();
        $wrapper.find(".my-premium-link-item-keywords-box").css("display", "block");
        $wrapper.find(".my-premium-link-item-expenditure-history-box").css("display", "none");
        return false;
    });

    /* Load Expenditure History Box */
    $(document).on("click", ".my-premium-link-item-expenditure-history", function (e) {
        e.preventDefault();
        var $current = $(e.currentTarget);
        $current.parent().find(".my-premium-link-item-keywords").removeClass("selected");
        $current.addClass("selected");
        var $wrapper = $current.parent().parent();
        $wrapper.find(".my-premium-link-item-keywords-box").css("display", "none");
        $wrapper.find(".my-premium-link-item-expenditure-history-box").css("display", "block");
        return false;
    });

    /* More Click Event */
    $(document).on("click", ".my-premium-link-item-expenditure-history-item-more", function (e) {
        e.preventDefault();
        var $parent = $(e.currentTarget).parent();
        var $wrapper = $parent.parent();
        var last_date = $parent.find(".my-premium-link-item-expenditure-history-item-list .my-premium-link-item-expenditure-history-item:last-child").attr("data-date");
        var blog_id = $wrapper.attr("data-blog-id");
        var pl_id = $wrapper.attr("data-pl-id");
        return false;
    });

    /* Create New Premium Link */
    $(document).on("click", "#btn-create-premium-link", function (e) {
        e.preventDefault();
        modal(".prompt#writing-premium-link-prompt", "open");
        $(".prompt#writing-premium-link-prompt .prompt-main").empty().append(my_premium_link["writing"]["perfect"]());
        return false;
    });

    /* Cancel Create Premium Link - Close create prompt */
    $(document).on("click", ".prompt#writing-premium-link-prompt .close", function (e) {
        e.preventDefault();
        modal(".prompt#writing-premium-link-prompt", "close");
        return false;
    });

    /* Edit my premium link */
    $(document).on("click", ".my-premium-link-edit", function (e) {
        e.preventDefault();
        var $current = $(e.currentTarget);
        var $written = $current.parent();
        var $editing = $current.parent().parent().find(".my-premium-link-item-editing");

        /* Pass data of written to editing */
        var language
            , title
            , description
            , original_link
            , protocol
            , link
            , keywords = [];

        language = $written.find(".my-premium-link-item-language").attr("data-language");
        title = $written.find(".my-premium-link-item-title").text();
        description = $written.find(".my-premium-link-item-description").text();
        original_link = $written.find(".my-premium-link-item-link").text();
        if (original_link[4] === "s") {
            protocol = "https";
            link = original_link.substring(8, original_link.length);
        } else {
            protocol = "http";
            link = original_link.substring(7, original_link.length);
        }

        $written.find(".my-premium-link-item-keyword").each(function (i, e) {
            keywords.push($(e).text());
        });

        /* Update data of editing */
        /* language */
        var language_options;
        if (language === "en") {
            language_options = "<option class='lang-en' value='en' selected='selected'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        } else if (language === "ja") {
            language_options = "<option class='lang-ja' value='ja' selected='selected'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
        } else if (language === "ko") {
            language_options = "<option class='lang-ko' value='ko' selected='selected'>" + i18n[lang].korean + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-zh-Hans' value='zh-Hans'>" + i18n[lang].simplified_chinese + "</option>";
        } else if (language === "zh-Hans") {
            language_options = "<option class='lang-zh-Hans' value='zh-Hans' selected='selected'>" + i18n[lang].simplified_chinese + "</option><option class='lang-ja' value='ja'>" + i18n[lang].japanese + "</option><option class='lang-en' value='en'>" + i18n[lang].english + "</option><option class='lang-ko' value='ko'>" + i18n[lang].korean + "</option>";
        }
        $editing.find("select.premium-link-selected-language").empty().append(language_options);

        /* title */
        $editing.find(".premium-link-editing-title").val(title);

        /* description */
        $editing.find(".premium-link-editing-explanation-textarea").val(description);

        /* link - protocol, url*/
        var option_list = "";
        /* Check protocol of link */
        if (protocol === "https") { /* https */
            option_list = "<option value='https' selected='selected'>https://</option><option value='http'>http://</option>";
        } else { /* http */
            option_list = "<option value='http' selected='selected'>http://</option><option value='https'>https://</option>";
        }
        $editing.find("select.premium-link-editing-link-select").empty().append(option_list);
        $editing.find(".premium-link-editing-link-input").val(link);

        /* Search Keywords */
        $editing.find(".premium-link-search-input").val("");
        $editing.find(".premium-link-searched-keyword-list").empty();

        /* Selected Keywords */
        /* number of keywords */
        $editing.find(".num-of-my-premium-link-keywords").attr("data-count", keywords.length).text(keywords.length + " / 10");

        /* keywords elements */
        var keyword_list = ""
            , premium_link_selected_keyword_item
            , premium_link_selected_keyword_item_inner
            , premium_link_selected_keyword_item_top
            , premium_link_selected_keyword_item_top_left
            , btn_remove_selected_keyword
            , premium_link_selected_keyword_item_top_right;

        btn_remove_selected_keyword = "<div class='btn-remove-selected-keyword'>" + i18n[lang].remove + "</div>";
        premium_link_selected_keyword_item_top_left = "<div class='premium-link-selected-keyword-item-top-left'>" + btn_remove_selected_keyword + "</div>";
        for (var i = 0; i < keywords.length; i++) {
            premium_link_selected_keyword_item_top_right = "<div class='premium-link-selected-keyword-item-top-right'>" + get_encoded_html_preventing_xss(keywords[i]) + "</div>";
            premium_link_selected_keyword_item_top = "<div class='premium-link-selected-keyword-item-top'>" + premium_link_selected_keyword_item_top_left + premium_link_selected_keyword_item_top_right + "</div>";
            premium_link_selected_keyword_item_inner = "<div class='premium-link-selected-keyword-item-inner'>" + premium_link_selected_keyword_item_top + "</div>";
            premium_link_selected_keyword_item = "<div class='premium-link-selected-keyword-item'>" + premium_link_selected_keyword_item_inner + "</div>";
            keyword_list = keyword_list + premium_link_selected_keyword_item;
        }
        $editing.find(".premium-link-selected-keyword-list").empty().append(keyword_list);

        $written.css("display", "none");
        $editing.css("display", "block");
        return false;
    });

    /* Click Remove Button to remove my premium link -  Open remove prompt. */
    $(document).on("click", ".my-premium-link-remove", function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent();
        var blog_id = $wrapper.attr("data-blog-id");
        var pl_id = $wrapper.attr("data-pl-id");
        var _class = blog_id + "-" + pl_id;

        remove_info.blog_id = blog_id;
        remove_info.pl_id = pl_id;
        remove_info.class = _class;

        modal(".prompt#remove-premium-link-prompt", "open");

        return false;
    });

    /* Cancel Removing premium link - Close remove prompt */
    $(document).on("click", ".prompt#remove-premium-link-prompt .close, .prompt#remove-premium-link-prompt #btn-remove-cancel", function (e) {
        e.preventDefault();
        modal(".prompt#remove-premium-link-prompt", "close");
        return false;
    });

    /* Seriously Remove premium link */
    $(document).on("click", ".prompt#remove-premium-link-prompt #btn-remove-ok", function (e) {
        e.preventDefault();

        var data = {};
        data.blog_id = encodeURIComponent(remove_info.blog_id);
        data.pl_id = encodeURIComponent(remove_info.pl_id);

        modal(".prompt#remove-premium-link-prompt", "close");

        /* Server networking */

        /* Remove element from DOM */
        var scroll_top = $('.body-inner-main').scrollTop();
        $("." + remove_info.class).remove();
        show_bert("success", 3000, i18n[lang].successfully_removed_premium_link);
        $('.body-inner-main').scrollTop(scroll_top);
        return false;
    });

    $(document).on("focus", ".premium-link-editing-title, .premium-link-editing-explanation, .premium-link-writing-title, .premium-link-writing-explanation", function (e) {
        $(e.currentTarget).css('border-color', '#5a00e0');
    });
    $(document).on("blur", ".premium-link-editing-title, .premium-link-editing-explanation, .premium-link-writing-title, .premium-link-writing-explanation", function (e) {
        $(e.currentTarget).css('border-color', '#ebebeb');
    });

    /* Add new keyword to Selected Keywords */
    $(document).on("click", ".btn-add-new-keyword", function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent().parent().parent();

        /* check the number of current selected keywords */
        var count = $wrapper.find(".num-of-my-premium-link-keywords").attr("data-count");
        count = parseInt(count);
        if (count > 9) {
            show_bert("danger", 3000, i18n[lang].the_maximum_number_of_keywords_is_10);
            return false;
        } else {
            count = count + 1;
            $wrapper.find(".num-of-my-premium-link-keywords").attr("data-count", count).text(count + " / 10");
        }

        var text = $wrapper.find(".premium-link-search-input").val();
        text = text.replace(/\s\s+/gi, ' ').trim();
        text = get_encoded_html_preventing_xss(text);
        var btn_remove_selected_keyword = "<div class='btn-remove-selected-keyword'>" + i18n[lang].remove +  "</div>";
        var premium_link_selected_keyword_item_top_left = "<div class='premium-link-selected-keyword-item-top-left'>" + btn_remove_selected_keyword + "</div>";
        var premium_link_selected_keyword_item_top_right = "<div class='premium-link-selected-keyword-item-top-right'>" + text + "</div>";
        var premium_link_selected_keyword_item_top = "<div class='premium-link-selected-keyword-item-top'>" + premium_link_selected_keyword_item_top_left + premium_link_selected_keyword_item_top_right + "</div>";
        var premium_link_selected_keyword_item_inner = "<div class='premium-link-selected-keyword-item-inner'>" + premium_link_selected_keyword_item_top + "</div>";
        var premium_link_selected_keyword_item = "<div class='premium-link-selected-keyword-item'>" + premium_link_selected_keyword_item_inner + "</div>";
        $wrapper.find(".premium-link-selected-keyword-list").append(premium_link_selected_keyword_item);
        return false;
    });

    /* Add searched Keyword to Selected Keywords */
    $(document).on("click", ".btn-add-searched-keyword", function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent().parent().parent().parent().parent().parent();

        /* check the number of current selected keywords */
        var count = $wrapper.find(".num-of-my-premium-link-keywords").attr("data-count");
        count = parseInt(count);
        if (count > 9) {
            show_bert("danger", 3000, i18n[lang].the_maximum_number_of_keywords_is_10);
            return false;
        } else {
            count = count + 1;
            $wrapper.find(".num-of-my-premium-link-keywords").attr("data-count", count).text(count + " / 10");
        }
        var text = $(e.currentTarget).parent().parent().find(".premium-link-searched-keyword-item-top-right").text();
        text = get_encoded_html_preventing_xss(text);
        var btn_remove_selected_keyword = "<div class='btn-remove-selected-keyword'>" + i18n[lang].remove +  "</div>";
        var premium_link_selected_keyword_item_top_left = "<div class='premium-link-selected-keyword-item-top-left'>" + btn_remove_selected_keyword + "</div>";
        var premium_link_selected_keyword_item_top_right = "<div class='premium-link-selected-keyword-item-top-right'>" + text + "</div>";
        var premium_link_selected_keyword_item_top = "<div class='premium-link-selected-keyword-item-top'>" + premium_link_selected_keyword_item_top_left + premium_link_selected_keyword_item_top_right + "</div>";
        var premium_link_selected_keyword_item_inner = "<div class='premium-link-selected-keyword-item-inner'>" + premium_link_selected_keyword_item_top + "</div>";
        var premium_link_selected_keyword_item = "<div class='premium-link-selected-keyword-item'>" + premium_link_selected_keyword_item_inner + "</div>";
        $wrapper.find(".premium-link-selected-keyword-list").append(premium_link_selected_keyword_item);
        return false;
    });

    /* Remove Keyword from Selected Keywords */
    $(document).on("click", ".btn-remove-selected-keyword", function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent().parent().parent().parent();
        var count = $wrapper.parent().parent().find(".num-of-my-premium-link-keywords").attr("data-count");
        count = parseInt(count) - 1;
        $wrapper.parent().parent().find(".num-of-my-premium-link-keywords").attr("data-count", count).text(count + " / 10");
        $wrapper.remove();
        return false;
    });

    /* Search Premium Link */
    $(document).on("click", ".btn-premium-link-search", function (e) {
        e.preventDefault();
        var text = $(e.currentTarget).parent().find(".premium-link-search-input").val();
        text = text.replace(/\s\s+/gi, ' ').trim();

        if (text === "") {
            show_bert("danger", 3000, i18n[lang].please_enter_keyword);
            return false;
        }

        var language, docs = [];
        for (var i = 0; i < 0; i++) {
            if (i < 5) {
                if (i < 10) {
                    language = "ja";
                } else {
                    if (i < 15) {
                        language = "ko";
                    } else {
                        language = "zh-Hans";
                    }
                }
            } else {
                language = "en";
            }
            docs.push({
                key: "Keyword" + i + i
                , language: language
                , z_score: i
                , count_exposure: i
                , count_click: i
            });
        }

        /* ' " 같이 넣어서 테스트해보기 */
        /* db.keywords.find({ key: { '$regex': '태', '$options': 'i' } }); */

        var doc
            , btn_add_searched_keyword
            , premium_link_searched_keyword_item_top_left
            , premium_link_searched_keyword_item_top_right
            , premium_link_searched_keyword_item_top
            , span
            , strong
            , premium_link_searched_keyword_item_bottom_left
            , premium_link_searched_keyword_item_bottom_right
            , premium_link_searched_keyword_item_bottom
            , premium_link_searched_keyword_item_inner
            , premium_link_searched_keyword_item
            , btn_add_new_keyword
            , temp
            , temp2
            , final_list = "";

        for (var i = 0; i < docs.length; i++) {
            doc = docs[i];
            btn_add_searched_keyword = "<div class='btn-add-searched-keyword'>" + i18n[lang].add + "</div>";
            premium_link_searched_keyword_item_top_left = "<div class='premium-link-searched-keyword-item-top-left'>" + btn_add_searched_keyword + "</div>";
            premium_link_searched_keyword_item_top_right = "<div class='premium-link-searched-keyword-item-top-right'>" + get_encoded_html_preventing_xss(doc.key) + "</div>";
            premium_link_searched_keyword_item_top = "<div class='premium-link-searched-keyword-item-top'>" + premium_link_searched_keyword_item_top_left + premium_link_searched_keyword_item_top_right + "</div>";
            span = "<span>" + i18n[lang].exposure + "</span>";
            strong = "<strong>" + doc.count_exposure + "</strong>";
            premium_link_searched_keyword_item_bottom_left = "<div class='premium-link-searched-keyword-item-bottom-left'>" + span + strong + "</div>";
            span = "<span>" + i18n[lang].click + "</span>";
            strong = "<strong>" + doc.count_click + "</strong>";
            premium_link_searched_keyword_item_bottom_right = "<div class='premium-link-searched-keyword-item-bottom-right'>" + span + strong + "</div>";
            premium_link_searched_keyword_item_bottom = "<div class='premium-link-searched-keyword-item-bottom'>" + premium_link_searched_keyword_item_bottom_left + premium_link_searched_keyword_item_bottom_right + "</div>";
            premium_link_searched_keyword_item_inner = "<div class='premium-link-searched-keyword-item-inner'>" + premium_link_searched_keyword_item_top + premium_link_searched_keyword_item_bottom + "</div>";
            premium_link_searched_keyword_item = "<div class='premium-link-searched-keyword-item'>" + premium_link_searched_keyword_item_inner + "</div>";
            final_list = final_list + premium_link_searched_keyword_item;
        }

        if (docs.length === 0) { /* When searched keyword not exists...  */
            temp = "<div>" + i18n[lang].this_is_a_non_existent_keyword + "</div>";
            temp2 = "<div>" + i18n[lang].do_you_want_to_add_it + "</div>";
            btn_add_new_keyword = "<div class='btn-add-new-keyword'>" + i18n[lang].add +  "</div>";
            final_list = "<div class='premium-link-new-keyword-item'>" + temp + temp2 + btn_add_new_keyword + "</div>";
        }

        $(e.currentTarget).parent().parent().parent().find(".premium-link-searched-keyword-list").empty().append(final_list);
        return false;
    });

    /* Cancel editing my premium link */
    $(document).on("click", ".btn-cancel-editing-my-premium-link", function (e) {
        e.preventDefault();
        var $wrapper = $(e.currentTarget).parent().parent().parent();
        var $written = $wrapper.parent().find(".my-premium-link-item-written");
        var $editing = $wrapper.parent().find(".my-premium-link-item-editing");
        var scroll_top = $('.body-inner-main').scrollTop();
        $written.css("display", "block");
        $editing.css("display", "none");
        $('.body-inner-main').scrollTop(scroll_top - $editing.height() + $written.height());
        return false;
    });

    /* Update my premium link */
    $(document).on("click", ".btn-update-editing-my-premium-link", function (e) {
        e.preventDefault();
        var $editing = $(e.currentTarget).parent().parent().parent();
        var $written = $editing.parent().find(".my-premium-link-item-written");
        var blog_id = $editing.attr("data-blog-id");
        var pl_id = $editing.attr("data-pl-id");
        var language = $editing.find(".premium-link-selected-language option:selected").val();
        var title = $editing.find(".premium-link-editing-title").val();
        var description = $editing.find(".premium-link-editing-explanation-textarea").val();
        var link =  $editing.find(".premium-link-editing-link-select option:selected").val() + "://" + $editing.find(".premium-link-editing-link-input").val();

        var keywords = [];
        $editing.find(".premium-link-selected-keyword-item-top-right").each(function (i, e) {
            keywords.push($(e).text());
        });

        /* Update client written elements */
        /* langauge */
        var selected_language;
        if (language === "en") {
            selected_language = i18n[lang].english;
        } else if (language === "ja") {
            selected_language = i18n[lang].japanese;
        } else if (language === "ko") {
            selected_language = i18n[lang].korean;
        } else if (language === "zh-Hans") {
            selected_language = i18n[lang].simplified_chinese;
        }
        $written.find(".my-premium-link-item-language").attr("data-language", language).text(selected_language);

        /* title */
        $written.find(".my-premium-link-item-title").empty().append(get_encoded_html_preventing_xss(title));

        /* description */
        $written.find(".my-premium-link-item-description").empty().append(get_encoded_html_preventing_xss(description));

        /* link */
        $written.find(".my-premium-link-item-link").empty().append(get_encoded_html_preventing_xss(link));

        /* keywords */
        var keyword_list = ""
            , temp;
        for (var i = 0; i < keywords.length; i++) {
            temp = "<div class='my-premium-link-item-keyword'>" + get_encoded_html_preventing_xss(keywords[i]) + "</div>";
            keyword_list = keyword_list + temp;
        }
        $written.find(".my-premium-link-item-keywords-box").empty().append(keyword_list);

        var scroll_top = $('.body-inner-main').scrollTop();
        $written.css("display", "block");
        $editing.css("display", "none");
        $('.body-inner-main').scrollTop(scroll_top - $editing.height() + $written.height());

        return false;
    });

    $(document).on("click", ".btn-ok-writing-my-premium-link", function (e) {
        e.preventDefault();
        var $wrapper = $(".prompt#writing-premium-link-prompt");
        var language = $wrapper.find("select.premium-link-selected-language option:selected").val();
        var title = $wrapper.find(".premium-link-writing-title").val();
        var description = $wrapper.find(".premium-link-writing-explanation-textarea").val();
        var protocol = $wrapper.find("select.premium-link-writing-link-select option:selected").val() + "://";
        var url = $wrapper.find(".premium-link-writing-link-input").val();
        var link = protocol + url;
        var keywords = [];

        if (title.replace(/\s\s+/gi, ' ').trim() === "") {
            show_bert("danger", 3000, i18n[lang].please_enter_title);
            return false;
        }

        if (description.replace(/\s\s+/gi, ' ').trim() === "") {
            show_bert("danger", 3000, i18n[lang].please_enter_description);
            return false;
        }

        if (url.replace(/\s\s+/gi, ' ').trim() === "") {
            show_bert("danger", 3000, i18n[lang].please_enter_link);
            return false;
        }

        $wrapper.find(".premium-link-selected-keyword-item-top-right").each(function (i, e) {
            keywords.push($(e).text());
        });

        var data = {};
        data.language = encodeURIComponent(language);
        data.title = encodeURIComponent(title);
        data.description = encodeURIComponent(description);
        data.link = encodeURIComponent(link);
        data.keywords = encodeURIComponent(JSON.stringify(keywords));

        return false;
    });
});