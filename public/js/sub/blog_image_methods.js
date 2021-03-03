var blog_image = {};
blog_image["init"] = function () {
    if ($('#blog-image-list').length === 0) {
        return false;
    }
    var FULL_WIDTH = $('#blog-image-list').width()
        , AVERAGE_HEIGHT = 100;
    if (FULL_WIDTH > 600) {
        AVERAGE_HEIGHT = 160
    }
    $('.blog-image-item-img').addClass('no-resized').css('height', AVERAGE_HEIGHT);
    $('#blog-image-list .blog-image-item-title').addClass('no-resized').css('height', AVERAGE_HEIGHT);
    blog_image["resize_blog_images"]();
};
blog_image["resize_blog_images"] = function () {
    if ($('#blog-image-list').length === 0) {
        return false;
    }
    var FULL_WIDTH = $('#blog-image-list').width()
        ,AVERAGE_HEIGHT = 100;
    if (FULL_WIDTH > 600) {
        AVERAGE_HEIGHT = 160
    }
    var $IMG_LIST = $('.blog-image-item-img.no-resized')
        , START_INDEX = 0
        , END_INDEX = 0
        , TOTAL_WIDTH = 0
        , $THIS
        , ORIGINAL_WIDTH
        , ORIGINAL_HEIGHT
        , CURRENT_WIDTH
        , CURRENT_HEIGHT
        , DIFF1
        , DIFF2
        , RESIZED_HEIGHT;
    $('.blog-image-item-img.no-resized').css('height', AVERAGE_HEIGHT);
    $('#blog-image-list .blog-image-item-title.no-resized').css('height', AVERAGE_HEIGHT);
    for (var x = 0; x < $IMG_LIST.length; x++) {
        $THIS = $($IMG_LIST[x]);
        ORIGINAL_WIDTH = parseInt($THIS.attr('data-width'));
        ORIGINAL_HEIGHT = parseInt($THIS.attr('data-height'));
        CURRENT_HEIGHT = $THIS.height() + 2;
        CURRENT_WIDTH = Math.floor((ORIGINAL_WIDTH * CURRENT_HEIGHT)/ORIGINAL_HEIGHT);
        DIFF1 = FULL_WIDTH - TOTAL_WIDTH;
        DIFF2 = (TOTAL_WIDTH + CURRENT_WIDTH) - FULL_WIDTH;
        if ((TOTAL_WIDTH + CURRENT_WIDTH) > FULL_WIDTH) {
            if (
                FULL_WIDTH === DIFF1 &&
                START_INDEX === END_INDEX
            ) {
                TOTAL_WIDTH = TOTAL_WIDTH + CURRENT_WIDTH;
                RESIZED_HEIGHT = Math.floor(((FULL_WIDTH - (((END_INDEX - START_INDEX) + 1) * 2)) * AVERAGE_HEIGHT) / TOTAL_WIDTH);
                $THIS.css('height', RESIZED_HEIGHT + 'px').removeClass('no-resized');
                $THIS.parent().find('.blog-image-item-title').css('height', RESIZED_HEIGHT + 'px').removeClass('no-resized');
                START_INDEX = END_INDEX = (x + 1);
                TOTAL_WIDTH = 0;
            } else {
                if (DIFF1 < DIFF2) {
                    RESIZED_HEIGHT = Math.floor(((FULL_WIDTH - (((END_INDEX - START_INDEX) + 1) * 2)) * AVERAGE_HEIGHT) / TOTAL_WIDTH);
                    for (var y = START_INDEX; y <= END_INDEX; y++) {
                        $($IMG_LIST[y]).css('height', RESIZED_HEIGHT + 'px').removeClass('no-resized');
                        $($IMG_LIST[y]).parent().find('.blog-image-item-title').css('height', RESIZED_HEIGHT + 'px').removeClass('no-resized');
                    }
                    START_INDEX = END_INDEX = x;
                    TOTAL_WIDTH = 0;
                    x = x - 1;
                } else {
                    END_INDEX = x;
                    TOTAL_WIDTH = TOTAL_WIDTH + CURRENT_WIDTH;
                    RESIZED_HEIGHT = Math.floor(((FULL_WIDTH - (((END_INDEX - START_INDEX) + 1) * 2)) * AVERAGE_HEIGHT) / TOTAL_WIDTH);
                    for (var y = START_INDEX; y <= END_INDEX; y++) {
                        $($IMG_LIST[y]).css('height', RESIZED_HEIGHT + 'px').removeClass('no-resized');
                        $($IMG_LIST[y]).parent().find('.blog-image-item-title').css('height', RESIZED_HEIGHT + 'px').removeClass('no-resized');
                    }
                    START_INDEX = END_INDEX = (x + 1);
                    TOTAL_WIDTH = 0;
                }
            }
        } else {
            TOTAL_WIDTH = TOTAL_WIDTH + CURRENT_WIDTH;
            END_INDEX = x;
            continue;
        }
    }
};