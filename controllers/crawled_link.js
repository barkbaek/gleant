const config = require('../env.json')[process.env.NODE_ENV || 'development'];
const article_templates = require('../article_templates');

module.exports = function (data, template) {
    template.render('crawled_link', {
        date: function () {
            return new Date().valueOf();
        },
        css_version: function () {
            return config["css_version"];
        },
        aws_s3_url: function () {
            return config["aws_s3_url"];
        },
        item: function () {
            return article_templates.get_crawled_link_item(data);
        },
        lang: function () {
            if (data.language !== "") {
                return data.language;
            } else {
                return "en";
            }
        }
    });
};