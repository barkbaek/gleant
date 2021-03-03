const model = require('../models/error_502');
const config = require('../env.json')[process.env.NODE_ENV || 'development'];
const i18n = require('../i18n');

module.exports = function (lang, template) {
    template.render('error_502', {
        lang: function () {
            if (lang === undefined) {
                lang = "en";
            }
            if (
                lang !== "en" &&
                lang !== "ja" &&
                lang !== "ko" &&
                lang !== "zh-Hans"
            ) {
                lang = "en";
            }
            return lang;
        },
        i18n: function () {
            if (lang === undefined) {
                lang = "en";
            }
            if (
                lang !== "en" &&
                lang !== "ja" &&
                lang !== "ko" &&
                lang !== "zh-Hans"
            ) {
                lang = "en";
            }
            var obj = i18n[lang];
            obj.css_version = config.css_version;
            obj.aws_s3_url = config.aws_s3_url;

            /* 공사 날짜 지정 */
            /* 예: 2017.01.01 00:00:00 ~ 2017.12.31 00:00:00 */
            /* 공사 시작 시간 설정 */
            // var start_datetime = new Date();
            // var end_datetime = new Date();
            // start_datetime.setYear(2017);
            // start_datetime.setMonth(0);
            // start_datetime.setDate(1);
            // start_datetime.setHours(0);
            // start_datetime.setMinutes(0);
            // start_datetime.setSeconds(0);
            // start_datetime.setMilliseconds(0);

            /* 공사 마감 시간 설정 */
            // end_datetime.setYear(2017);
            // end_datetime.setMonth(11);
            // end_datetime.setDate(31);
            // end_datetime.setHours(0);
            // end_datetime.setMinutes(0);
            // end_datetime.setSeconds(0);
            // end_datetime.setMilliseconds(0);

            obj.start_datetime = new Date().valueOf();
            obj.end_datetime = 1506697200000;

            return obj;
        },
        title: function () {
            if (lang === undefined) {
                lang = "en";
            }
            if (
                lang !== "en" &&
                lang !== "ja" &&
                lang !== "ko" &&
                lang !== "zh-Hans"
            ) {
                lang = "en";
            }
            return i18n[lang].error_502_obj.title;
        },
        description: function () {
            if (lang === undefined) {
                lang = "en";
            }
            if (
                lang !== "en" &&
                lang !== "ja" &&
                lang !== "ko" &&
                lang !== "zh-Hans"
            ) {
                lang = "en";
            }
            return i18n[lang].error_502_obj.description;
        },
        date: function () {
            return new Date().valueOf();
        },
        css_version: function () {
            return config["css_version"];
        },
        js_version: function () {
            return config["js_version"];
        },
        aws_s3_url: function () {
            return config["aws_s3_url"];
        }
    });
};