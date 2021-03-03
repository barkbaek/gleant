var obj = {};
obj['en'] = require('./i18n_en');
obj['ja'] = require('./i18n_ja');
obj['ko'] = require('./i18n_ko');
obj['zh-Hans'] = require('./i18n_zh-Hans');

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
module.exports = obj;