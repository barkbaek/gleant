const express = require("express");
const app     = express();
const server = require('http').createServer(app);
const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const port = 3001;
const config = require('./env.json')[process.env.NODE_ENV || 'development'];
const favicon = require('serve-favicon');
const body_parser= require('body-parser');
const cookie_parser = require('cookie-parser');
const exphbs  = require('express-handlebars');
const path    = require("path");
const randomstring = require('randomstring');
const crypto = require('crypto');
const clc = require('cli-color');
const methods = require('./methods');
const i18n = require('./i18n');
const es_methods = require('./es_methods');
const busboy = require('connect-busboy');
const mongodb = require('mongodb').MongoClient;
const mongo_uri = config["mongo_uri"];
const mongo_options = config["mongo_options"];
const striptags = require('striptags');
const html_encode = require('htmlencode').htmlEncode;
const _ = require('underscore');
const cheerio = require('cheerio');
const sanitize_html = require('sanitize-html');
const limit = require('./limit').get_all();
const cookie_name = require('./cookie_names').get_all();
const main_tags = require('./fixed_information').main_tags();
const monetary_units = require('./fixed_information').monetary_units();
var connected_db;
mongodb.connect(mongo_uri, mongo_options, function (err, db) {
    if (err) {
        console.log("\nMongoDB connection failed. error - ");
        console.dir(err);
        return false;
    }
    connected_db = db;
    setTimeout(function () {
        methods.set_main_tags(connected_db, main_tags);
        methods.set_monetary_units(connected_db, monetary_units);
    }, 1000);
});
/* elasticsearch */
const elasticsearch = require('elasticsearch');
const es_client = new elasticsearch.Client({
    hosts: config.es_hosts
});
//
// const es_client = new elasticsearch.Client({
//     hosts: config.es_hosts,
//     log: "trace"
// });
es_client.ping({
    requestTimeout: Infinity
}, function (error) {
    if (error) {
        console.error('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});
// controllers
const home = require('./controllers/home');
const search = require('./controllers/search');
const blog = require('./controllers/blog');
const ranking = require('./controllers/ranking');
const login = require('./controllers/login');
const register = require('./controllers/register');
const forgot_password = require('./controllers/forgot_password');
const reset_password = require('./controllers/reset_password');
const apply_online_interview = require('./controllers/apply_online_interview');
const success_apply_online_interview = require('./controllers/success_apply_online_interview');
const announcement = require('./controllers/announcement');
const single_announcement = require('./controllers/single_announcement');
const write_announcement = require('./controllers/write_announcement');
const write_tags = require('./controllers/write_tags');
const write_website = require('./controllers/write_website');
const write_freephoto = require('./controllers/write_freephoto');
const policy = require('./controllers/policy');
const terms = require('./controllers/terms');
const partnership = require('./controllers/partnership');
const help = require('./controllers/help');
const success_register = require('./controllers/success_register');
const success_reset_password = require('./controllers/success_reset_password');
const success_sent_register = require('./controllers/success_sent_register');
const success_sent_reset_password = require('./controllers/success_sent_reset_password');
const error_404 = require('./controllers/error_404');
const error_502 = require('./controllers/error_502');
const error_cookie_disabled = require('./controllers/error_cookie_disabled');
const single_blog = require('./controllers/single_blog');
const i_messages = require('./controllers/i_messages');
const i_notifications = require('./controllers/i_notifications');
const write_agenda = require('./controllers/write_agenda');
const employment = require('./controllers/employment');
const single_hire_me = require('./controllers/single_hire_me');
const single_apply_now = require('./controllers/single_apply_now');
const write_hire_me = require('./controllers/write_hire_me');
const write_apply_now = require('./controllers/write_apply_now');
const news = require('./controllers/news');
const debate = require('./controllers/debate');
const opinion = require('./controllers/opinion');
const agenda = require('./controllers/agenda');
const single_agenda = require('./controllers/single_agenda');
const single_opinion = require('./controllers/single_opinion');
const single_translation = require('./controllers/single_translation');
const set_blog_id = require('./controllers/set_blog_id');
const set_interesting_tags = require('./controllers/set_interesting_tags');
const crawled_link = require('./controllers/crawled_link');
const vote = require('./controllers/vote');
const premium_link = require('./controllers/premium_link');
const premium_link_announcement = require('./controllers/premium_link_announcement');
const single_premium_link_announcement = require('./controllers/single_premium_link_announcement');
const DATE_MAX_VALUE = 8640000000000000;
// favicon.ico 설정
app.use(favicon(__dirname + '/public/favicon.ico'));
const hbs = exphbs.create({
    helpers: {}
});
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use('/images',express.static(path.join(__dirname, 'public/images'), {maxage: '31536000000'}));
app.use('/js',express.static(path.join(__dirname, 'public/js'), {maxage: '31536000000'}));
app.use('/css',express.static(path.join(__dirname, 'public/css'), {maxage: '31536000000'}));
app.use('/ckeditor',express.static(path.join(__dirname, 'public/ckeditor'), {maxage: '31536000000'}));
app.use('/fonts',express.static(path.join(__dirname, 'public/fonts'), {maxage: '31536000000'}));
if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    // session_options.secure = true; // serve secure cookies
}
app.use(cookie_parser());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (/^\/css\/.+/.test(req.url) === false &&
        /^\/js\/.+/.test(req.url) === false &&
        /^\/images\/.+/.test(req.url) === false
    ) {
        res.setHeader('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var blog_id = methods.get_cookie(cookies, cookie_name["blog_id"]) || null;
    var token = methods.get_cookie(cookies, cookie_name["token"]) || null;
    var lang = "ko";
    /*var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;*/
    if (
        !token ||
        !user_id ||
        !secret_id
    ) {
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["token"], randomstring.generate() + randomstring.generate(), {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            res.cookie(cookie_name["user_id"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            res.cookie(cookie_name["secret_id"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            res.cookie(cookie_name["blog_id"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["token"], randomstring.generate() + randomstring.generate(), {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            res.cookie(cookie_name["user_id"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            res.cookie(cookie_name["secret_id"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            res.cookie(cookie_name["blog_id"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    var ip_address
        , device
        , country;
    try {
        if (app.get('env') === 'production' && req.headers && req.headers['x-forwarded-for']) {
            if (req.headers['user-agent'] !== "ELB-HealthChecker/2.0" && req.headers['x-forwarded-for'] !== undefined) {
                ip_address = req.headers['x-forwarded-for'];
                ip_address = ip_address.split('/');
                if (req.headers['cloudfront-is-mobile-viewer'] === 'true') {
                    device = "mobile" + "";
                } else if (req.headers['cloudfront-is-tablet-viewer'] === 'true') {
                    device = "tablet" + "";
                } else if (req.headers['cloudfront-is-smarttv-viewer'] === 'true') {
                    device = "smarttv" + "";
                } else if (req.headers['cloudfront-is-desktop-viewer'] === 'true') {
                    device = "desktop" + "";
                }
                country = req.headers['cloudfront-viewer-country'] + "";
                if (lang !== 'en' &&
                    lang !== 'ja' &&
                    lang !== 'ko' &&
                    lang !== 'zh-Hans'
                ) {
                    if (country === "KR") {
                        res.cookie(cookie_name["lang"], 'ko', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                    } else if (country === "JP") {
                        res.cookie(cookie_name["lang"], 'ja', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                    } else if (country === "CN") {
                        res.cookie(cookie_name["lang"], 'zh-Hans', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                    } else {
                        res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                    }
                }
                methods.track_user_agent(connected_db, user_id, secret_id, req.originalUrl, req.method, device, country, ip_address);
            } else {
                if (
                    lang !== 'en' &&
                    lang !== 'ja' &&
                    lang !== 'ko' &&
                    lang !== 'zh-Hans'
                ) {
                    res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                }
            }
        } else {
            if (
                lang !== 'en' &&
                lang !== 'ja' &&
                lang !== 'ko' &&
                lang !== 'zh-Hans'
            ) {
                res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            }
        }
    } catch (e) {}
    next();
});
app.get('/',function(req,res){
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var news_link = methods.get_cookie(cookies, cookie_name["news_link"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    if (news_link !== null) {
        news_link = decodeURIComponent(decodeURIComponent(news_link));
    }
    var f_cb = function (nothing) { return res.redirect(301, '/error/404'); };
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    var first = {}
        , second = {};
    if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
        methods.get_home_articles(connected_db, lang, f_cb, function (all_docs) {
            if (news_link === null) {
                return home(lang, is_mobile, false, null, all_docs, null, [], res);
            } else {
                methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                    return home(lang, is_mobile, false, null, all_docs, null, [], res);
                }, function (news_doc) {
                    first.link = news_link;
                    first.type = news_doc.type;
                    first.comment_type = 1;
                    first.is_removed = false;
                    second.is_removed = 0;
                    methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                        news_comments = [];
                        return home(lang, is_mobile, false, null, all_docs, news_doc, news_comments, res);
                    }, function (news_comments) {
                        return home(lang, is_mobile, false, null, all_docs, news_doc, news_comments, res);
                    });
                });
            }
        });
    } else {
        methods.get_home_articles(connected_db, lang, f_cb, function (all_docs) {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                function (nothing) {
                    if (news_link === null) {
                        return home(lang, is_mobile, false, null, all_docs, null, [], res);
                    } else {
                        methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                            return home(lang, is_mobile, false, null, all_docs, null, [], res);
                        }, function (news_doc) {
                            first.link = news_link;
                            first.type = news_doc.type;
                            first.comment_type = 1;
                            first.is_removed = false;
                            second.is_removed = 0;
                            methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                news_comments = [];
                                return home(lang, is_mobile, false, null, all_docs, news_doc, news_comments, res);
                            }, function (news_comments) {
                                return home(lang, is_mobile, false, null, all_docs, news_doc, news_comments, res);
                            });
                        });
                    }
                }, function (user) {
                    if (user.blog_id === "") {
                        return res.redirect(301, '/set/blog-id');
                    }
                    if (news_link === null) {
                        return home(lang, is_mobile, true, user, all_docs, null, [], res);
                    } else {
                        methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                            return home(lang, is_mobile, true, user, all_docs, null, [], res);
                        }, function (news_doc) {
                            first.link = news_link;
                            first.type = news_doc.type;
                            first.comment_type = 1;
                            first.is_removed = false;
                            second.is_removed = 0;
                            methods.get_article_comments(connected_db, true, first, second, function (news_comments) {
                                news_comments = [];
                                return home(lang, is_mobile, true, user, all_docs, news_doc, news_comments, res);
                            }, function (news_comments) {
                                return home(lang, is_mobile, true, user, all_docs, news_doc, news_comments, res);
                            });
                        });
                    }
                });
        });
    }
});
app.get('/robots.txt', function (req,res){
    return res.sendFile(path.join(__dirname, 'robots.txt'));
});
app.get('/naverd2a5bfbb69201c98a23b69cec6772891.html', function (req,res){
    return res.end("naver-site-verification: naverd2a5bfbb69201c98a23b69cec6772891.html");
});
app.get('/google1b3544546e5d652a.html', function (req,res){
    return res.end("google-site-verification: google1b3544546e5d652a.html");
});
app.get('/news', function (req,res) {
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var news_link = methods.get_cookie(cookies, cookie_name["news_link"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    if (news_link !== null) {
        news_link = decodeURIComponent(decodeURIComponent(news_link));
    }
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    var data = {}
        , first = {}
        , second = {};
    data.category = undefined;
    if (req.query.category !== undefined) {
        data.category = decodeURIComponent(req.query.category);
        if (lang === "en") {
            if (
                data.category !== "economy" &&
                data.category !== "world" &&
                data.category !== "it" &&
                data.category !== "sports"
            ) {
                return res.redirect(301, '/error/404');
            }
        } else if (lang === "ja") {
            if (
                data.category !== "politics" &&
                data.category !== "economy" &&
                data.category !== "society" &&
                data.category !== "world" &&
                data.category !== "it" &&
                data.category !== "sports"
            ) {
                return res.redirect(301, '/error/404');
            }
        } else if (lang === "ko") {
            if (
                data.category !== "politics" &&
                data.category !== "economy" &&
                data.category !== "society" &&
                data.category !== "culture" &&
                data.category !== "world" &&
                data.category !== "entertainment" &&
                data.category !== "sports"
            ) {
                return res.redirect(301, '/error/404');
            }
        } else if (lang === "zh-Hans") {
            if (
                data.category !== "politics" &&
                data.category !== "economy" &&
                data.category !== "society" &&
                data.category !== "entertainment" &&
                data.category !== "sports"
            ) {
                return res.redirect(301, '/error/404');
            }
        }
    }
    if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
        methods.get_news(connected_db, lang, data, function (final) {
            if (data.category === undefined) {
                final = {};
            } else {
                final = [];
            }
            methods.get_top_news(connected_db, lang, "news", "most_read", 12, function (news_most_read) {
                methods.get_top_news(connected_db, lang, "news", "many_comments", 12, function (news_many_comments) {
                    methods.get_top_news(connected_db, lang, "sports", "most_read", 12, function (sports_most_read) {
                        methods.get_top_news(connected_db, lang, "sports", "many_comments", 12, function (sports_many_comments) {
                            if (news_link === null) {
                                return news(lang, is_mobile, false, null, final, {
                                    news_most_read: news_most_read
                                    , news_many_comments: news_many_comments
                                    , sports_most_read: sports_most_read
                                    , sports_many_comments: sports_many_comments
                                }, data.category, null, [], res);
                            } else {
                                methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                    return news(lang, is_mobile, false, null, final, {
                                        news_most_read: news_most_read
                                        , news_many_comments: news_many_comments
                                        , sports_most_read: sports_most_read
                                        , sports_many_comments: sports_many_comments
                                    }, data.category, null, [], res);
                                }, function (news_doc) {
                                    first.link = news_link;
                                    first.type = news_doc.type;
                                    first.comment_type = 1;
                                    first.is_removed = false;
                                    second.is_removed = 0;
                                    methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                        news_comments = [];
                                        return news(lang, is_mobile, false, null, final, {
                                            news_most_read: news_most_read
                                            , news_many_comments: news_many_comments
                                            , sports_most_read: sports_most_read
                                            , sports_many_comments: sports_many_comments
                                        }, data.category, news_doc, news_comments, res);
                                    }, function (news_comments) {
                                        return news(lang, is_mobile, false, null, final, {
                                            news_most_read: news_most_read
                                            , news_many_comments: news_many_comments
                                            , sports_most_read: sports_most_read
                                            , sports_many_comments: sports_many_comments
                                        }, data.category, news_doc, news_comments, res);
                                    });
                                });
                            }
                        });
                    });
                });
            });
        }, function (final) {
            methods.get_top_news(connected_db, lang, "news", "most_read", 12, function (news_most_read) {
                methods.get_top_news(connected_db, lang, "news", "many_comments", 12, function (news_many_comments) {
                    methods.get_top_news(connected_db, lang, "sports", "most_read", 12, function (sports_most_read) {
                        methods.get_top_news(connected_db, lang, "sports", "many_comments", 12, function (sports_many_comments) {
                            if (news_link === null) {
                                return news(lang, is_mobile, false, null, final, {
                                    news_most_read: news_most_read
                                    , news_many_comments: news_many_comments
                                    , sports_most_read: sports_most_read
                                    , sports_many_comments: sports_many_comments
                                }, data.category, null, [], res);
                            } else {
                                methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                    return news(lang, is_mobile, false, null, final, {
                                        news_most_read: news_most_read
                                        , news_many_comments: news_many_comments
                                        , sports_most_read: sports_most_read
                                        , sports_many_comments: sports_many_comments
                                    }, data.category, null, [], res);
                                }, function (news_doc) {
                                    first.link = news_link;
                                    first.type = news_doc.type;
                                    first.comment_type = 1;
                                    first.is_removed = false;
                                    second.is_removed = 0;
                                    methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                        news_comments = [];
                                        return news(lang, is_mobile, false, null, final, {
                                            news_most_read: news_most_read
                                            , news_many_comments: news_many_comments
                                            , sports_most_read: sports_most_read
                                            , sports_many_comments: sports_many_comments
                                        }, data.category, news_doc, news_comments, res);
                                    }, function (news_comments) {
                                        return news(lang, is_mobile, false, null, final, {
                                            news_most_read: news_most_read
                                            , news_many_comments: news_many_comments
                                            , sports_most_read: sports_most_read
                                            , sports_many_comments: sports_many_comments
                                        }, data.category, news_doc, news_comments, res);
                                    });
                                });
                            }
                        });
                    });
                });
            });
        });
    } else {
        methods.get_news(connected_db, lang, data, function (final) {
            if (data.category === undefined) {
                final = {};
            } else {
                final = [];
            }
            methods.get_top_news(connected_db, lang, "news", "most_read", 12, function (news_most_read) {
                methods.get_top_news(connected_db, lang, "news", "many_comments", 12, function (news_many_comments) {
                    methods.get_top_news(connected_db, lang, "sports", "most_read", 12, function (sports_most_read) {
                        methods.get_top_news(connected_db, lang, "sports", "many_comments", 12, function (sports_many_comments) {
                            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
                                if (news_link === null) {
                                    return news(lang, is_mobile, false, null, final, {
                                        news_most_read: news_most_read
                                        , news_many_comments: news_many_comments
                                        , sports_most_read: sports_most_read
                                        , sports_many_comments: sports_many_comments
                                    }, data.category, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return news(lang, is_mobile, false, null, final, {
                                            news_most_read: news_most_read
                                            , news_many_comments: news_many_comments
                                            , sports_most_read: sports_most_read
                                            , sports_many_comments: sports_many_comments
                                        }, data.category, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                            news_comments = [];
                                            return news(lang, is_mobile, false, null, final, {
                                                news_most_read: news_most_read
                                                , news_many_comments: news_many_comments
                                                , sports_most_read: sports_most_read
                                                , sports_many_comments: sports_many_comments
                                            }, data.category, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return news(lang, is_mobile, false, null, final, {
                                                news_most_read: news_most_read
                                                , news_many_comments: news_many_comments
                                                , sports_most_read: sports_most_read
                                                , sports_many_comments: sports_many_comments
                                            }, data.category, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            }, function (user) {
                                if (news_link === null) {
                                    return news(lang, is_mobile, true, user, final, {
                                        news_most_read: news_most_read
                                        , news_many_comments: news_many_comments
                                        , sports_most_read: sports_most_read
                                        , sports_many_comments: sports_many_comments
                                    }, data.category, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return news(lang, is_mobile, true, user, final, {
                                            news_most_read: news_most_read
                                            , news_many_comments: news_many_comments
                                            , sports_most_read: sports_most_read
                                            , sports_many_comments: sports_many_comments
                                        }, data.category, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, true, first, second, function (news_comments) {
                                            news_comments = [];
                                            return news(lang, is_mobile, true, user, final, {
                                                news_most_read: news_most_read
                                                , news_many_comments: news_many_comments
                                                , sports_most_read: sports_most_read
                                                , sports_many_comments: sports_many_comments
                                            }, data.category, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return news(lang, is_mobile, true, user, final, {
                                                news_most_read: news_most_read
                                                , news_many_comments: news_many_comments
                                                , sports_most_read: sports_most_read
                                                , sports_many_comments: sports_many_comments
                                            }, data.category, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    });
                });
            });
        }, function (final) {
            methods.get_top_news(connected_db, lang, "news", "most_read", 12, function (news_most_read) {
                methods.get_top_news(connected_db, lang, "news", "many_comments", 12, function (news_many_comments) {
                    methods.get_top_news(connected_db, lang, "sports", "most_read", 12, function (sports_most_read) {
                        methods.get_top_news(connected_db, lang, "sports", "many_comments", 12, function (sports_many_comments) {
                            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
                                if (news_link === null) {
                                    return news(lang, is_mobile, false, null, final, {
                                        news_most_read: news_most_read
                                        , news_many_comments: news_many_comments
                                        , sports_most_read: sports_most_read
                                        , sports_many_comments: sports_many_comments
                                    }, data.category, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return news(lang, is_mobile, false, null, final, {
                                            news_most_read: news_most_read
                                            , news_many_comments: news_many_comments
                                            , sports_most_read: sports_most_read
                                            , sports_many_comments: sports_many_comments
                                        }, data.category, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                            news_comments = [];
                                            return news(lang, is_mobile, false, null, final, {
                                                news_most_read: news_most_read
                                                , news_many_comments: news_many_comments
                                                , sports_most_read: sports_most_read
                                                , sports_many_comments: sports_many_comments
                                            }, data.category, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return news(lang, is_mobile, false, null, final, {
                                                news_most_read: news_most_read
                                                , news_many_comments: news_many_comments
                                                , sports_most_read: sports_most_read
                                                , sports_many_comments: sports_many_comments
                                            }, data.category, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            }, function (user) {
                                if (news_link === null) {
                                    return news(lang, is_mobile, true, user, final, {
                                        news_most_read: news_most_read
                                        , news_many_comments: news_many_comments
                                        , sports_most_read: sports_most_read
                                        , sports_many_comments: sports_many_comments
                                    }, data.category, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return news(lang, is_mobile, true, user, final, {
                                            news_most_read: news_most_read
                                            , news_many_comments: news_many_comments
                                            , sports_most_read: sports_most_read
                                            , sports_many_comments: sports_many_comments
                                        }, data.category, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, true, first, second, function (news_comments) {
                                            news_comments = [];
                                            return news(lang, is_mobile, true, user, final, {
                                                news_most_read: news_most_read
                                                , news_many_comments: news_many_comments
                                                , sports_most_read: sports_most_read
                                                , sports_many_comments: sports_many_comments
                                            }, data.category, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return news(lang, is_mobile, true, user, final, {
                                                news_most_read: news_most_read
                                                , news_many_comments: news_many_comments
                                                , sports_most_read: sports_most_read
                                                , sports_many_comments: sports_many_comments
                                            }, data.category, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    });
                });
            });
        });
    }
});
// app.get('/opinion',function(req,res){
//     var is_mobile = false;
//     var cookies = req.headers.cookie;
//     var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
//     var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
//     var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
//     var country = req.headers['cloudfront-viewer-country'] + "";
//     if (lang !== 'en' &&
//         lang !== 'ja' &&
//         lang !== 'ko' &&
//         lang !== 'zh-Hans'
//     ) {
//         if (country === "KR") {
//             lang = "ko";
//         } else if (country === "JP") {
//             lang = "ja";
//         } else if (country === "CN") {
//             lang = "zh-Hans";
//         } else {
//             lang = "en";
//         }
//         res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
//     }
//     lang = methods.get_valid_language(lang);
//     if (app.get['env'] === 'production') {
//         if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
//             is_mobile = true;
//         }
//     } else {
//         if (req && req.headers && req.headers['user-agent']) {
//             is_mobile = methods.is_mobile(req.headers['user-agent']);
//         }
//     }
//     res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
//     /**
//      * @param {boolean} is_mobile - 모바일이면 true, desktop이면 false.
//      * @param {boolean} is_loginned - 로그인 사용자면 true, 비로그인 사용자면 false.
//      * @param {Object} res - response header.
//      */
//     var data = {}
//         , main_tag = undefined;
//     data["list_type"] = "opinion";
//     data["updated_at"] = undefined;
//     if (req.query.mt === undefined) {
//         data["type"] = "all";
//     } else {
//         data["type"] = "main_tag";
//         main_tag = data["main_tag"] = decodeURIComponent(req.query.mt);
//     }
//     if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
//         methods.get_all_articles(connected_db, lang, data, function (opinions) {
//             opinions = [];
//             return opinion(lang, is_mobile, false, null, opinions, main_tag, res);
//         }, function (opinions) { /* 의견 가져옴 */
//             return opinion(lang, is_mobile, false, null, opinions, main_tag, res);
//         });
//     } else {
//         methods.get_all_articles(connected_db, lang, data, function (opinions) {
//             opinions = [];
//             methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
//                 return opinion(lang, is_mobile, false, null, opinions, main_tag, res);
//             }, function (user) {
//                 if (user.blog_id === "") {
//                     return res.redirect(301, '/set/blog-id');
//                 }
//                 return opinion(lang, is_mobile, true, user, opinions, main_tag, res);
//             });
//         }, function (opinions) { /* 의견 가져옴 */
//             methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
//                 return opinion(lang, is_mobile, false, null, opinions, main_tag, res);
//             }, function (user) {
//                 if (user.blog_id === "") {
//                     return res.redirect(301, '/set/blog-id');
//                 }
//                 return opinion(lang, is_mobile, true, user, opinions, main_tag, res);
//             });
//         });
//     }
// });

app.get('/paper', function (req, res) {
    return res.redirect(301, '/blog');
});

app.get('/blog',function(req,res){
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    var f_cb1, f_cb2, s_cb;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    var data = {};
    data.list_type = "blog_gallery";
    data.updated_at = undefined;
    if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
        methods.get_all_articles(connected_db, lang, data, function (blogs) {
            blogs = [];
            blog(lang, is_mobile, false, null, blogs, res);
        }, function (blogs) {
            blog(lang, is_mobile, false, null, blogs, res);
        });
    } else {
        methods.get_all_articles(connected_db, lang, data, function (blogs) {
            blogs = [];
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
                blog(lang, is_mobile, false, null, blogs, res);
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                blog(lang, is_mobile, true, user, blogs, res);
            });
        }, function (blogs) { /* blogs 가져옴 */
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
                blog(lang, is_mobile, false, null, blogs, res);
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                blog(lang, is_mobile, true, user, blogs, res);
            });
        });
    }
});

app.get('/premium-link',function(req,res) {
    return res.redirect(301, '/error/404');
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    var f_cb1, f_cb2, s_cb;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
        return res.redirect(301, '/login');
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
            return res.redirect(301, '/login');
        }, function (user) {
            if (user.blog_id === "") {
                return res.redirect(301, '/set/blog-id');
            }
            return premium_link(lang, is_mobile, true, user, [], res);
        });
    }
});

app.get('/premium-link/announcement',function(req,res) {
    return res.redirect(301, '/error/404');
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    var f_cb1, f_cb2, s_cb;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
        return res.redirect(301, '/login');
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
            return res.redirect(301, '/login');
        }, function (user) {
            if (user.blog_id === "") {
                return res.redirect(301, '/set/blog-id');
            }
            return premium_link_announcement(lang, is_mobile, true, user, [], res);
        });
    }
});

app.get('/premium-link/announcement/:_id',function(req,res) {
    return res.redirect(301, '/error/404');
    var _id = req.params._id;
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    var f_cb1, f_cb2, s_cb;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    var doc = {};
    if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
        return res.redirect(301, '/login');
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
            return res.redirect(301, '/login');
        }, function (user) {
            if (user.blog_id === "") {
                return res.redirect(301, '/set/blog-id');
            }
            return single_premium_link_announcement(lang, is_mobile, true, user, doc, res);
        });
    }
});

app.get('/ranking',function(req,res){
    return res.redirect(301, '/error/404');
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    var f_cb, s_cb;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    /**
     * @param {boolean} is_mobile - 모바일이면 true, desktop이면 false.
     * @param {boolean} is_loginned - 로그인 사용자면 true, 비로그인 사용자면 false.
     * @param {Object} res - response header.
     */
    f_cb = function (nothing) {return res.redirect(301, '/login');};
    s_cb = function (user) {
        if (user.blog_id === "") {
            return res.redirect(301, '/set/blog-id');
        }
        ranking(lang, is_mobile, true, user, res);
    };
    if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
        return res.redirect(301, '/login');
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, s_cb);
    }
});

app.get('/login',function(req,res){
    var cookies = req.headers.cookie;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    login(lang, res);
});
app.get('/set/blog-id', function (req,res) {
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
        return res.redirect(301, '/login');
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
        function (nothing) {
            return res.redirect(301, '/login');
        }, function (user) {
            if (user.blog_id === "") { /* blog_id 처음 지정하는 경우에만.. */
                methods.get_popular_keywords_per_language(connected_db, function (array) {
                    var num_of_all_docs = 0;
                    for (var i = 0; i < array.length; i++) {
                        num_of_all_docs = num_of_all_docs + array[i].docs.length;
                    }
                    if (num_of_all_docs === 0) {
                        return set_blog_id(lang, false, res);
                    } else {
                        return set_blog_id(lang, true, res);
                    }
                });
            } else {
                return res.redirect(301, '/blog/' + user.blog_id);
            }
        });
});

/* 관심태그 5개 이상 존재시에만 사용. 다른 경우 redirect -> error/404 */
app.get('/set/interesting-tags', function (req,res) {
    return res.redirect(301, '/error/404');

    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    var cb = function (array) {
        var num_of_all_docs = 0;
        for (var i = 0; i < array.length; i++) {
            num_of_all_docs = num_of_all_docs + array[i].docs.length;
        }

        if (num_of_all_docs === 0) {
            return res.redirect(301, '/error/404');
        } else {
            return set_interesting_tags(lang, res, array);
        }
    };
    methods.get_popular_keywords_per_language(es_client, cb);
});

app.get('/register',function(req,res){
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    register(lang, res);
});

app.get('/forgot-password',function(req,res){
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    forgot_password(lang, res);
});
app.get('/verify/:token',function(req,res){
    var token = req.params.token;
    var f_cb = function () {return res.redirect(301, '/error/404');};
    var s_cb = function () {return res.redirect(301, '/success/register');};
    methods.check_token(connected_db, token, f_cb, function () {
        methods.verify(connected_db, token, f_cb, s_cb);
    });
});
app.get('/reset-password/:token',function(req,res){
    var token = req.params.token;
    var f_cb = function () {return res.redirect(301, '/error/404');};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    methods.check_token(connected_db, token, f_cb, function () {
        reset_password(lang, res);
    });
});
app.get('/cms',function(req,res){
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var type = req.query.type
        , action = req.query.action
        , sort = req.query.sort
        , query = {};
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    var f_cb1, f_cb2, s_cb;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
        return res.redirect(301, '/error/404');
    } else {
        if (type === undefined) {
            return res.redirect(301, '/cms?type=news_tag&action=write&sort=all');
        }
        if (action === undefined) {
            return res.redirect(301, '/error/404');
        } else {
            if (action !== "write" &&
                action !== "list") {
                return res.redirect(301, '/error/404');
            }
        }
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
            return res.redirect(301, '/error/404');
        }, function (user) {
            if (methods.is_gleantcorp(user.blog_id) === false) {
                return res.redirect(301, '/error/404');
            }
            query.type = type;
            query.action = action;
            if (type === "announcement") {
                if (action === "write") {
                    return write_announcement(lang, is_mobile, true, user, query, res);
                } else {
                    return res.redirect(301, '/error/404');
                }
            } else if (type === "news_tag") {
                if (sort === undefined) {
                    return res.redirect(301, '/error/404');
                }
                if (
                    sort !== "all" &&
                    sort !== "en" &&
                    sort !== "ja" &&
                    sort !== "ko" &&
                    sort !== "zh-Hans"
                ) {
                    return res.redirect(301, '/error/404');
                }
                query.sort = sort;
                if (action === "write") {
                    methods.get_news_not_indexed(connected_db, sort, function (news_list) {
                        return write_tags(lang, is_mobile, true, user, news_list, query, res);
                    });
                } else { /* News Tag List */
                    methods.get_news_currently_indexed(connected_db, sort, function (news_list) {
                        return write_tags(lang, is_mobile, true, user, news_list, query, res);
                    });
                }
            } else if (type === "website") {
                if (action === "write") {
                    return write_website(lang, is_mobile, true, user, query, res);
                } else {
                    return res.redirect(301, '/error/404');
                }
            } else if (type === "freephoto") {
                if (action === "write") {
                    if (req.query.select === undefined) {
                        return res.redirect(301, '/error/404');
                    } else {
                        query.select = req.query.select;
                        if (
                            query.select !== "url" &&
                            query.select !== "device"
                        ) {
                            return res.redirect(301, '/error/404');
                        } else {
                            methods.get_main_tags(connected_db, lang, function (main_tags) {
                                query.main_tags = main_tags;
                                return write_freephoto(lang, is_mobile, true, user, query, res);
                            });
                        }
                    }
                } else {
                    query.mt = req.query.mt;
                    if (
                        query.mt === undefined
                    ) {
                        return res.redirect(301, '/error/404');
                    }
                    methods.get_freephoto_list(connected_db, query.mt, function (docs) {
                        query.docs = docs;
                        methods.get_main_tags(connected_db, lang, function (main_tags) {
                            query.main_tags = main_tags;
                            return write_freephoto(lang, is_mobile, true, user, query, res);
                        });
                    });
                }
            } else {
                return res.redirect(301, '/error/404');
            }
        });
    }
});
app.get('/announcement',function(req,res){
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    var f_cb1, f_cb2, s_cb;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
        methods.get_announcements(connected_db, {}, function (nothing) {
            return announcement(lang, is_mobile, false, null, [], res);
        }, function (docs) {
            return announcement(lang, is_mobile, false, null, docs, res);
        });
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
            methods.get_announcements(connected_db, {}, function (nothing) {
                return announcement(lang, is_mobile, false, null, [], res);
            }, function (docs) {
                return announcement(lang, is_mobile, false, null, docs, res);
            });
        }, function (user) {
            if (user.blog_id === "") {
                return res.redirect(301, '/set/blog-id');
            }
            methods.get_announcements(connected_db, {}, function (nothing) {
                return announcement(lang, is_mobile, true, user, [], res);
            }, function (docs) {
                return announcement(lang, is_mobile, true, user, docs, res);
            });
        });
    }
});
app.get('/announcement/:_id',function(req,res){
    var _id = req.params._id;
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    var f_cb1, f_cb2, s_cb;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
        methods.get_single_announcement(connected_db, {_id: _id}, function (nothing) {
            return res.redirect(301, '/error/404');
        }, function (doc) {
            return single_announcement(lang, is_mobile, false, null, doc, res);
        });
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
            methods.get_single_announcement(connected_db, {_id: _id}, function (nothing) {
                return res.redirect(301, '/error/404');
            }, function (doc) {
                return single_announcement(lang, is_mobile, false, null, doc, res);
            });
        }, function (user) {
            if (user.blog_id === "") {
                return res.redirect(301, '/set/blog-id');
            }
            methods.get_single_announcement(connected_db, {_id: _id}, function (nothing) {
                return res.redirect(301, '/error/404');
            }, function (doc) {
                return single_announcement(lang, is_mobile, true, user, doc, res);
            });
        });
    }
});
app.get('/terms',function(req,res){
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    var f_cb1, f_cb2, s_cb;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
        return terms(lang, is_mobile, false, null, res);
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
            return terms(lang, is_mobile, false, null, res);
        }, function (user) {
            if (user.blog_id === "") {
                return res.redirect(301, '/set/blog-id');
            }
            return terms(lang, is_mobile, true, user, res);
        });
    }
});
app.get('/policy',function(req,res){
    var is_mobile = false;
    var f_cb1, f_cb2, s_cb;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
        return policy(lang, is_mobile, false, null, res);
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
            return policy(lang, is_mobile, false, null, res);
        }, function (user) {
            if (user.blog_id === "") {
                return res.redirect(301, '/set/blog-id');
            }
            return policy(lang, is_mobile, true, user, res);
        });
    }
});
// app.get('/help',function(req,res){
//     var is_mobile = false;
//     var cookies = req.headers.cookie;
//     var user_id = methods.get_cookie(cookies, "user_id") || null;
//     var secret_id = methods.get_cookie(cookies, "secret_id") || null;
//     var f_cb1, f_cb2, s_cb;
//
//     var lang = methods.get_cookie(cookies, "lang") || null;
//     if (!lang) {
//         lang = "en";
//         res.cookie("lang", 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
//     }
//     lang = methods.get_valid_language(lang);
//
//     if (req && req.headers['user-agent']) {
//         is_mobile = methods.is_mobile(req.headers['user-agent']);
//     }
//
//     if (user_id === null || secret_id === null ) {
//         /* language, is_mobile, is_loginned, user, articles, template */
//         return help(lang, is_mobile, false, null, [], res);
//     } else {
//         methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
//             return help(lang, is_mobile, false, null, [], res);
//         }, function (user) {
//             if (user.blog_id === "") {
//                 return res.redirect(301, '/set/blog-id');
//             }
//             return help(lang, is_mobile, true, user, [], res);
//         });
//     }
// });

app.get('/success/register',function(req,res){
    var cookies = req.headers.cookie;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    success_register(lang, res);
});

app.get('/success/reset-password',function(req,res){
    var cookies = req.headers.cookie;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    success_reset_password(lang, res);
});

app.get('/success/sent-register',function(req,res){
    var cookies = req.headers.cookie;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    success_sent_register(lang, res);
});

app.get('/success/sent-reset-password',function(req,res){
    var cookies = req.headers.cookie;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    success_sent_reset_password(lang, res);
});

app.get('/error/404',function(req,res){
    var cookies = req.headers.cookie;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    error_404(lang, res);
});
app.get('/error/502',function(req,res){
    var cookies = req.headers.cookie;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    error_502(lang, res);
});
app.get('/error/cookie-disabled',function(req,res){
    var cookies = req.headers.cookie;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    error_cookie_disabled(lang, res);
});

app.get('/_oauth/facebook',function(req,res){
    return res.end();
});

app.get('/_oauth/kakao',function(req,res){
    return res.end();
});

app.get('/i/messages',function(req,res){
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    var f_cb1, s_cb;
    f_cb1 = function (user) {res.redirect(301, '/login');};
    s_cb = function (user) {
        if (user.blog_id === "") {
            return res.redirect(301, '/set/blog-id');
        }
        i_messages(lang, user, res);
    };
    if (user_id === null || secret_id === null || user_id === undefined || secret_id === undefined) {
        f_cb1(null);
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, s_cb);
    }
});

app.get('/i/notifications',function(req,res){
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    var f_cb1, s_cb;
    f_cb1 = function (user) {res.redirect(301, '/login');};
    s_cb = function (user) {
        if (user.blog_id === "") {
            return res.redirect(301, '/set/blog-id');
        }
        i_notifications(lang, user, res);
    };
    if (user_id === null || secret_id === null ) {
        f_cb1(null);
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, s_cb);
    }
});

app.get('/paper/:blog_id', function (req, res) {
    return res.redirect(301, '/blog/' + req.params.blog_id);
});

app.get('/blog/:blog_id',function(req,res){
    var is_mobile = false;
    var blog_id = req.params.blog_id;
    var f_cb1 = function (doc) { res.redirect(301, '/error/404'); }, f_cb2, f_cb3, s_cb;
    if (blog_id === "") {
        return f_cb1(null);
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    var prev_visit_blog = methods.get_cookie(cookies, cookie_name["prev_visit_blog"]) || null;
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["prev_visit_blog"], blog_id, {domain: '.gleant.com', maxAge : 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["prev_visit_blog"], blog_id, {maxAge : 24 * 60 * 60 * 1000, httpOnly: true});
    }
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    /**
     * 접근한 블로그 메뉴 정보
     * @param {string} blog_menu.blog_menu_id - 접근한 blog_menu의 _id. "debate" || "gallery" || "guestbook" || 다른 값.
     * @param {string} blog_menu._id - 접근한 게시물 _id. 앨범 이미지 || 방명록 게시물 || 일반 블로그 게시물.
     * @param {string} blog_menu.is_agenda_selected - blog_menu.blog_menu_id가 "debate" 일 때 사용. 기본은 true.
     * @param {string} blog_menu.is_opinion_selected - blog_menu.blog_menu_id가 "debate" 일 때 사용. 기본은 false.
     * @param {string} blog_menu.is_list - true: 목록 반환 || false: 단일 게시물 반환.
     */
    var blog_menu = {};
    blog_menu["blog_menu_id"] = "debate";
    blog_menu["_id"] = undefined;
    blog_menu["is_agenda_selected"] = true;
    blog_menu["is_opinion_selected"] = false;
    blog_menu["is_translation_selected"] = false;
    blog_menu["is_apply_now_selected"] = false;
    blog_menu["is_hire_me_selected"] = false;
    blog_menu["is_write"] = false;
    blog_menu["is_list"] = true;
    /**
     * in-progress-agenda
     * scheduled-agenda
     * finished-agenda
     * unlimited-agenda
     **/
    blog_menu["agenda_menu"] = "in-progress-agenda";
    methods.check_blog_id(connected_db, blog_id, true, f_cb1, function (blog_owner) {
        /* 2. 방문자 정보 가져오기 */
        if (user_id === null || secret_id === null) {
            methods.get_blog_articles(connected_db, lang, blog_owner, null, blog_menu, f_cb1, function (articles) {
                if (prev_visit_blog === blog_id) {
                    return single_blog(lang, blog_owner, blog_menu, articles, is_mobile, false, {is_friend:false, is_friend_requested:false}, null, res);
                } else {
                    methods.update_blog_count_view(connected_db, blog_id, f_cb1, function () { /* TODAY VIEW COUNT 올리기 */
                        return single_blog(lang, blog_owner, blog_menu, articles, is_mobile, false, {is_friend:false, is_friend_requested:false}, null, res);
                    });
                }
            });
        } else {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                function (nothing) {
                    methods.get_blog_articles(connected_db, lang, blog_owner, null, blog_menu, f_cb1, function (articles) {
                        if (prev_visit_blog === blog_id) {
                            return single_blog(lang, blog_owner, blog_menu, articles, is_mobile, false, {is_friend:false, is_friend_requested:false}, null, res);
                        } else {
                            methods.update_blog_count_view(connected_db, blog_id, f_cb1, function () { /* TODAY VIEW COUNT 올리기 */
                                return single_blog(lang, blog_owner, blog_menu, articles, is_mobile, false, {is_friend:false, is_friend_requested:false}, null, res);
                            });
                        }
                    });
                }, function (user) {
                    if (user.blog_id === "") {
                        return res.redirect(301, '/set/blog-id');
                    }
                    methods.get_blog_articles(connected_db, lang, blog_owner, user, blog_menu, f_cb1, function (articles) { /* 게시물 가져오기 */
                        if (prev_visit_blog === blog_id) { /* 연속으로 블로그 방문한 경우 */
                            if (blog_owner["blog_id"] !== user["blog_id"]) { /* 로그인자이지만 주인이 아닌 방문자일 경우 */
                                methods.update_today_visitors(connected_db, {
                                    blog_id: blog_owner["blog_id"],
                                    visitor_blog_id: user["blog_id"],
                                    visitor_name: user["name"],
                                    visitor_img: user["img"],
                                    date: methods.to_eight_digits_date(),
                                    created_at: new Date().valueOf()
                                }, function () {
                                    methods.is_friend(connected_db, user["blog_id"], blog_owner["blog_id"]
                                        , function () {
                                            methods.get_single_notification(connected_db, {
                                                type: "friend_request"
                                                , blog_id: user["blog_id"]
                                                , subscribers: blog_owner["blog_id"]
                                            }, function (nothing) {
                                                single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:false}, user, res);
                                            }, function (nothing) {
                                                single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:true}, user, res);
                                            });
                                        }, function () {
                                            single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:true, is_friend_requested:false}, user, res);
                                        });
                                });
                            } else {
                                single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:false}, user, res);
                            }
                        } else { /* 연속으로 블로그 방문하지 않은 경우 */
                            methods.update_blog_count_view(connected_db, blog_id, f_cb1, function () { /* TODAY VIEW COUNT 올리기 */
                                if (blog_owner["blog_id"] !== user["blog_id"]) { /* 로그인자이지만 주인이 아닌 방문자일 경우 */
                                    methods.update_today_visitors(connected_db, {
                                        blog_id: blog_owner["blog_id"],
                                        visitor_blog_id: user["blog_id"],
                                        visitor_name: user["name"],
                                        visitor_img: user["img"],
                                        date: methods.to_eight_digits_date(),
                                        created_at: new Date().valueOf()
                                    }, function () {
                                        methods.is_friend(connected_db, user["blog_id"], blog_owner["blog_id"]
                                            , function () {
                                                methods.get_single_notification(connected_db, {
                                                    type: "friend_request"
                                                    , blog_id: user["blog_id"]
                                                    , subscribers: blog_owner["blog_id"]
                                                }, function (nothing) {
                                                    single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:false}, user, res);
                                                }, function (nothing) {
                                                    single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:true}, user, res);
                                                });
                                            }, function () {
                                                single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:true, is_friend_requested:false}, user, res);
                                            });
                                    });
                                } else {
                                    single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:false}, user, res);
                                }
                            });
                        }
                    });
                });
        }
    });
});

app.get('/paper/:blog_id/:blog_menu_id', function (req, res) {
    return res.redirect(301, '/blog/' + req.params.blog_id + "/" + req.params.blog_menu_id);
});

app.get('/blog/:blog_id/:blog_menu_id',function(req,res){
    var blog_id = req.params.blog_id;
    var blog_menu_id = req.params.blog_menu_id;
    var is_mobile = false;
    var f_cb1 = function (doc) { res.redirect(301, '/error/404'); }, f_cb2, f_cb3, s_cb;
    if (blog_id === "") {
        return f_cb1(null);
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    var prev_visit_blog = methods.get_cookie(cookies, cookie_name["prev_visit_blog"]) || null;
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["prev_visit_blog"], blog_id, {domain: '.gleant.com', maxAge : 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["prev_visit_blog"], blog_id, {maxAge : 24 * 60 * 60 * 1000, httpOnly: true});
    }
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    /**
     * 접근한 블로그 메뉴 정보
     * @param {string} blog_menu.blog_menu_id - 접근한 blog_menu의 _id. "debate" || "gallery" || "guestbook" || 다른 값.
     * @param {string} blog_menu._id - 접근한 게시물 _id. 앨범 이미지 || 방명록 게시물 || 일반 블로그 게시물.
     * @param {string} blog_menu.is_agenda_selected - blog_menu.blog_menu_id가 "debate" 일 때 사용. 기본은 true.
     * @param {string} blog_menu.is_opinion_selected - blog_menu.blog_menu_id가 "debate" 일 때 사용. 기본은 false.
     * @param {string} blog_menu.is_list - true: 목록 반환 || false: 단일 게시물 반환.
     */
    var blog_menu = {};
    blog_menu["_id"] = undefined;
    blog_menu["is_agenda_selected"] = false;
    blog_menu["is_opinion_selected"] = false;
    blog_menu["is_translation_selected"] = false;
    blog_menu["is_apply_now_selected"] = false;
    blog_menu["is_hire_me_selected"] = false;
    blog_menu["is_write"] = false;
    blog_menu["is_list"] = true;
    blog_menu["agenda_menu"] = "";
    if (blog_menu_id === "agenda") {
        return f_cb1(null);
    } else if (
        blog_menu_id === "scheduled-agenda" ||
        blog_menu_id === "finished-agenda" ||
        blog_menu_id === "unlimited-agenda"
    ) { /* Debate - Agenda */
        blog_menu["blog_menu_id"] = "debate";
        blog_menu["is_agenda_selected"] = true;
        blog_menu["agenda_menu"] = blog_menu_id;
    } else if (blog_menu_id === "opinion") { /* Debate - Opinion */
        blog_menu["blog_menu_id"] = "debate";
        blog_menu["is_opinion_selected"] = true;
    } else if (blog_menu_id === "translation") { /* Debate - Translation */
        return f_cb1(null);
        blog_menu["blog_menu_id"] = "debate";
        blog_menu["is_translation_selected"] = true;
    } else if (
        blog_menu_id === "employment"
    ) { /* Employment - Hire Me */
        blog_menu["blog_menu_id"] = "employment";
        blog_menu["is_apply_now_selected"] = true;
    } else if (
        blog_menu_id === "hire-me"
    ) { /* Employment - Apply Now */
        blog_menu["blog_menu_id"] = "employment";
        blog_menu["is_hire_me_selected"] = true;
    } else if (
        blog_menu_id === "participation"
    ) { /* Participation - Agenda */
        blog_menu["blog_menu_id"] = "participation";
        blog_menu["is_agenda_selected"] = true;
        blog_menu["agenda_menu"] = "in-progress-agenda-participation";
    } else if (
        blog_menu_id === "scheduled-agenda-participation" ||
        blog_menu_id === "finished-agenda-participation" ||
        blog_menu_id === "unlimited-agenda-participation"
    ) { /* Participation - Agenda */
        blog_menu["blog_menu_id"] = "participation";
        blog_menu["is_agenda_selected"] = true;
        blog_menu["agenda_menu"] = blog_menu_id;
    } else if (
        blog_menu_id === "hire-me-participation"
    ) { /* Participation - Hire Me */
        blog_menu["blog_menu_id"] = "participation";
        blog_menu["is_hire_me_selected"] = true;
    } else if (
        blog_menu_id === "apply-now-participation"
    ) { /* Participation - Apply Now */
        blog_menu["blog_menu_id"] = "participation";
        blog_menu["is_apply_now_selected"] = true;
    } else if (
        blog_menu_id === "subscription"
    ) { /* Subscription - Agenda */
        blog_menu["blog_menu_id"] = "subscription";
        blog_menu["is_agenda_selected"] = true;
        blog_menu["agenda_menu"] = "in-progress-agenda-subscription";
    } else if (
        blog_menu_id === "scheduled-agenda-subscription" ||
        blog_menu_id === "finished-agenda-subscription" ||
        blog_menu_id === "unlimited-agenda-subscription"
    ) { /* Subscription - Agenda */
        blog_menu["blog_menu_id"] = "subscription";
        blog_menu["is_agenda_selected"] = true;
        blog_menu["agenda_menu"] = blog_menu_id;
    } else if (blog_menu_id === "opinion-subscription") { /* Subscription - Opinion */
        blog_menu["blog_menu_id"] = "subscription";
        blog_menu["is_opinion_selected"] = true;
    } else if (blog_menu_id === "translation-subscription") { /* Subscription - Translation */
        return f_cb1(null);
        blog_menu["blog_menu_id"] = "subscription";
        blog_menu["is_translation_selected"] = true;
    } else if (
        blog_menu_id === "hire-me-subscription"
    ) { /* Subscription - Hire Me */
        blog_menu["blog_menu_id"] = "subscription";
        blog_menu["is_hire_me_selected"] = true;
    } else if (
        blog_menu_id === "apply-now-subscription"
    ) { /* Subscription - Apply Now */
        blog_menu["blog_menu_id"] = "subscription";
        blog_menu["is_apply_now_selected"] = true;
    } else if (
        blog_menu_id === "blog-subscription"
    ) { /* Subscription - blog */
        blog_menu["blog_menu_id"] = "subscription";
    } else { /* Album || Bulletin Board || Gallery */
        blog_menu["blog_menu_id"] = blog_menu_id;
    }
    /* 1. 방문한 곳의 blog_id 확인. 없을 경우, 리다이렉트. */
    methods.check_blog_id(connected_db, blog_id, true, f_cb1, function (blog_owner) {
        /* 2. 방문자 정보 가져오기 */
        if (user_id === null || secret_id === null) {
            if (
                blog_menu["blog_menu_id"] === "participation" ||
                blog_menu["blog_menu_id"] === "subscription"
            ) {
                return res.redirect(301, '/error/404');
            }
            methods.get_blog_articles(connected_db, lang, blog_owner, null, blog_menu, f_cb1, function (articles) {
                if (prev_visit_blog === blog_id) { /* 연속으로 블로그 방문한 경우 */
                    return single_blog(lang, blog_owner, blog_menu, articles, is_mobile, false, {is_friend:false, is_friend_requested:false}, null, res);
                } else { /* 연속으로 블로그 방문하지 않은 경우 */
                    methods.update_blog_count_view(connected_db, blog_id, f_cb1, function () { /* TODAY VIEW COUNT 올리기 */
                        return single_blog(lang, blog_owner, blog_menu, articles, is_mobile, false, {is_friend:false, is_friend_requested:false}, null, res);
                    });
                }
            });
        } else {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                function (nothing) {
                    if (
                        blog_menu["blog_menu_id"] === "participation" ||
                        blog_menu["blog_menu_id"] === "subscription"
                    ) {
                        return res.redirect(301, '/error/404');
                    }
                    methods.get_blog_articles(connected_db, lang, blog_owner, null, blog_menu, f_cb1, function (articles) { /* 게시물 가져오기 */
                        if (prev_visit_blog === blog_id) { /* 연속으로 블로그 방문한 경우 */
                            return single_blog(lang, blog_owner, blog_menu, articles, is_mobile, false, {is_friend:false, is_friend_requested:false}, null, res);
                        } else { /* 연속으로 블로그 방문하지 않은 경우 */
                            methods.update_blog_count_view(connected_db, blog_id, f_cb1, function () { /* TODAY VIEW COUNT 올리기 */
                                return single_blog(lang, blog_owner, blog_menu, articles, is_mobile, false, {is_friend:false, is_friend_requested:false}, null, res);
                            });
                        }
                    });
                }, function (user) { /* 로그인 사용자일 경우 */
                    if (user.blog_id === "") {
                        return res.redirect(301, '/set/blog-id');
                    }
                    if (
                        blog_menu["blog_menu_id"] === "participation" ||
                        blog_menu["blog_menu_id"] === "subscription"
                    ) {
                        if (blog_owner.blog_id !== user.blog_id) {
                            return res.redirect(301, '/error/404');
                        }
                    }
                    methods.get_blog_articles(connected_db, lang, blog_owner, user, blog_menu, f_cb1, function (articles) { /* 게시물 가져오기 */
                        if (prev_visit_blog === blog_id) { /* 연속으로 블로그 방문한 경우 */
                            if (blog_owner["blog_id"] !== user["blog_id"]) { /* 로그인자이지만 주인이 아닌 방문자일 경우 */
                                methods.update_today_visitors(connected_db, {
                                    blog_id: blog_owner["blog_id"],
                                    visitor_blog_id: user["blog_id"],
                                    visitor_name: user["name"],
                                    visitor_img: user["img"],
                                    date: methods.to_eight_digits_date(),
                                    created_at: new Date().valueOf()
                                }, function () {
                                    methods.is_friend(connected_db, user["blog_id"], blog_owner["blog_id"]
                                        , function () {
                                            methods.get_single_notification(connected_db, {
                                                type: "friend_request"
                                                , blog_id: user["blog_id"]
                                                , subscribers: blog_owner["blog_id"]
                                            }, function (nothing) {
                                                single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:false}, user, res);
                                            }, function (nothing) {
                                                single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:true}, user, res);
                                            });
                                        }, function () {
                                            single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:true, is_friend_requested:false}, user, res);
                                        });
                                });
                            } else {
                                single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:false}, user, res);
                            }
                        } else { /* 연속으로 블로그 방문하지 않은 경우 */
                            methods.update_blog_count_view(connected_db, blog_id, f_cb1, function () { /* TODAY VIEW COUNT 올리기 */
                                if (blog_owner["blog_id"] !== user["blog_id"]) { /* 로그인자이지만 주인이 아닌 방문자일 경우 */
                                    methods.update_today_visitors(connected_db, {
                                        blog_id: blog_owner["blog_id"],
                                        visitor_blog_id: user["blog_id"],
                                        visitor_name: user["name"],
                                        visitor_img: user["img"],
                                        date: methods.to_eight_digits_date(),
                                        created_at: new Date().valueOf()
                                    }, function () {
                                        methods.is_friend(connected_db, user["blog_id"], blog_owner["blog_id"]
                                            , function () {
                                                methods.get_single_notification(connected_db, {
                                                    type: "friend_request"
                                                    , blog_id: user["blog_id"]
                                                    , subscribers: blog_owner["blog_id"]
                                                }, function (nothing) {
                                                    single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:false}, user, res);
                                                }, function (nothing) {
                                                    single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:true}, user, res);
                                                });
                                            }, function () {
                                                single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:true, is_friend_requested:false}, user, res);
                                            });
                                    });
                                } else {
                                    single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:false}, user, res);
                                }
                            });
                        }
                    });
                });
        }
    });
});

app.get('/paper/:blog_id/:blog_menu_id/:_id', function (req, res) {
    var current_url = '/blog/' + req.params.blog_id + "/" + req.params.blog_menu_id + "/" + req.params._id;
    if (req.query.comment !== undefined) {
        current_url = current_url + "?comment=" + req.query.comment;
    }
    if (req.query.inner_comment !== undefined) {
        current_url = current_url + "&inner_comment==" + req.query.inner_comment;
    }
    return res.redirect(301, current_url);
});

app.get('/blog/:blog_id/:blog_menu_id/:_id',function(req,res){
    var is_mobile = false;
    var blog_id = req.params.blog_id;
    var blog_menu_id = req.params.blog_menu_id;
    var _id = req.params._id;
    var f_cb1 = function (doc) { res.redirect(301, '/error/404'); }, f_cb2, f_cb3, s_cb;
    if (blog_id === "" || blog_menu_id === "" || _id === "") {
        return f_cb1(null);
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    var prev_visit_blog = methods.get_cookie(cookies, cookie_name["prev_visit_blog"]) || null;
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["prev_visit_blog"], blog_id, {domain: '.gleant.com', maxAge : 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["prev_visit_blog"], blog_id, {maxAge : 24 * 60 * 60 * 1000, httpOnly: true});
    }
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    /**
     * 접근한 블로그 메뉴 정보
     * @param {string} blog_menu.blog_menu_id - 접근한 blog_menu의 _id. "debate" || "gallery" || "guestbook" || 다른 값.
     * @param {string} blog_menu._id - 접근한 게시물 _id. 앨범 이미지 || 방명록 게시물 || 일반 블로그 게시물.
     * @param {string} blog_menu.is_agenda_selected - blog_menu.blog_menu_id가 "debate" 일 때 사용. 기본은 true.
     * @param {string} blog_menu.is_opinion_selected - blog_menu.blog_menu_id가 "debate" 일 때 사용. 기본은 false.
     * @param {string} blog_menu.is_list - true: 목록 반환 || false: 단일 게시물 반환.
     */
    var blog_menu = {};
    if (
        blog_menu_id === "agenda" ||
        blog_menu_id === "opinion"
    ) {
        /* blog_menu_id === "translation" 추후에 추가하기 */
        return f_cb1(null);
    } else {
        if (blog_menu_id === "write") {
            if (
                _id === "debate" ||
                _id === "opinion" ||
                _id === "translation" ||
                _id === "employment" ||
                _id === "apply-now" ||
                _id === "gallery" ||
                _id === "participation" ||
                _id === "scheduled-agenda-participation" ||
                _id === "finished-agenda-participation" ||
                _id === "unlimited-agenda-participation" ||
                _id === "hire-me-participation" ||
                _id === "apply-now-participation" ||
                _id === "subscription" ||
                _id === "scheduled-agenda-subscription" ||
                _id === "finished-agenda-subscription" ||
                _id === "unlimited-agenda-subscription" ||
                _id === "opinion-subscription" ||
                _id === "translation-subscription" ||
                _id === "hire-me-subscription" ||
                _id === "apply-now-subscription" ||
                _id === "blog-subscription" ||
                _id === "gallery" ||
                _id === "guestbook"
            ) {
                return f_cb1(null);
            }
            blog_menu["blog_menu_id"] = _id;
            blog_menu["_id"] = undefined;
            blog_menu["is_write"] = true;
        } else {
            blog_menu["blog_menu_id"] = blog_menu_id;
            blog_menu["_id"] = _id;
            blog_menu["is_write"] = false;

        }
        blog_menu["is_agenda_selected"] = false;
        blog_menu["is_opinion_selected"] = false;
        blog_menu["is_translation_selected"] = false;
        blog_menu["is_apply_now_selected"] = false;
        blog_menu["is_hire_me_selected"] = false;
        blog_menu["is_list"] = false;
        blog_menu["agenda_menu"] = "";
    }

    /* 1. 방문한 곳의 blog_id 확인. 없을 경우, 리다이렉트. */
    methods.check_blog_id(connected_db, blog_id, true, f_cb1, function (blog_owner) {
        if (blog_menu["is_write"] === true) { /* When writing */
            if (user_id === null || secret_id === null) {
                return res.redirect(301, '/login');
            } else {
                var is_valid_blog_menu_id = false;
                for (var i = 0; i < blog_owner["blog_menu"].length; i++) {
                    if (blog_owner["blog_menu"][i]["_id"] === blog_menu["blog_menu_id"]) {
                        is_valid_blog_menu_id = true;
                        break;
                    }
                }
                if (is_valid_blog_menu_id === false) {
                    return f_cb1(null);
                }
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        return res.redirect(301, '/login');
                    }, function (user) {
                        if (user.blog_id === "") {
                            return res.redirect(301, '/set/blog-id');
                        }
                        if (blog_owner["blog_id"] === user["blog_id"]) {
                            return single_blog(lang, blog_owner, blog_menu, [], is_mobile, true, {is_friend:false, is_friend_requested:false}, user, res);
                        } else {
                            return f_cb1(null);
                        }
                    });
            }
        } else { /* When not writing */
            if (user_id === null || secret_id === null) {
                methods.get_blog_articles(connected_db, lang, blog_owner, null, blog_menu, f_cb1, function (articles) {
                    if (prev_visit_blog === blog_id) { /* 연속으로 블로그 방문한 경우 */
                        return single_blog(lang, blog_owner, blog_menu, articles, is_mobile, false, {is_friend:false, is_friend_requested:false}, null, res);
                    } else { /* 연속으로 블로그 방문하지 않은 경우 */
                        methods.update_blog_count_view(connected_db, blog_id, f_cb1, function () { /* TODAY VIEW COUNT 올리기 */
                            return single_blog(lang, blog_owner, blog_menu, articles, is_mobile, false, {is_friend:false, is_friend_requested:false}, null, res);
                        });
                    }
                });
            } else {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        methods.get_blog_articles(connected_db, lang, blog_owner, null, blog_menu, f_cb1, function (articles) {
                            if (prev_visit_blog === blog_id) { /* 연속으로 블로그 방문한 경우 */
                                return single_blog(lang, blog_owner, blog_menu, articles, is_mobile, false, {is_friend:false, is_friend_requested:false}, null, res);
                            } else { /* 연속으로 블로그 방문하지 않은 경우 */
                                methods.update_blog_count_view(connected_db, blog_id, f_cb1, function () { /* TODAY VIEW COUNT 올리기 */
                                    return single_blog(lang, blog_owner, blog_menu, articles, is_mobile, false, {is_friend:false, is_friend_requested:false}, null, res);
                                });
                            }
                        });
                    }, function (user) {
                        if (user.blog_id === "") {
                            return res.redirect(301, '/set/blog-id');
                        }
                        methods.get_blog_articles(connected_db, lang, blog_owner, user, blog_menu, f_cb1, function (articles) { /* 게시물 가져오기 */
                            if (prev_visit_blog === blog_id) { /* 연속으로 블로그 방문한 경우 */
                                if (blog_owner["blog_id"] !== user["blog_id"]) { /* 로그인자이지만 주인이 아닌 방문자일 경우 */
                                    methods.update_today_visitors(connected_db, {
                                        blog_id: blog_owner["blog_id"],
                                        visitor_blog_id: user["blog_id"],
                                        visitor_name: user["name"],
                                        visitor_img: user["img"],
                                        date: methods.to_eight_digits_date(),
                                        created_at: new Date().valueOf()
                                    }, function () {
                                        methods.is_friend(connected_db, user["blog_id"], blog_owner["blog_id"]
                                            , function () {
                                                methods.get_single_notification(connected_db, {
                                                    type: "friend_request"
                                                    , blog_id: user["blog_id"]
                                                    , subscribers: blog_owner["blog_id"]
                                                }, function (nothing) {
                                                    single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:false}, user, res);
                                                }, function (nothing) {
                                                    single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:true}, user, res);
                                                });
                                            }, function () {
                                                single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:true, is_friend_requested:false}, user, res);
                                            });
                                    });
                                } else {
                                    single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:false}, user, res);
                                }
                            } else { /* 연속으로 블로그 방문하지 않은 경우 */
                                methods.update_blog_count_view(connected_db, blog_id, f_cb1, function () { /* TODAY VIEW COUNT 올리기 */
                                    if (blog_owner["blog_id"] !== user["blog_id"]) { /* 로그인자이지만 주인이 아닌 방문자일 경우 */
                                        methods.update_today_visitors(connected_db, {
                                            blog_id: blog_owner["blog_id"],
                                            visitor_blog_id: user["blog_id"],
                                            visitor_name: user["name"],
                                            visitor_img: user["img"],
                                            date: methods.to_eight_digits_date(),
                                            created_at: new Date().valueOf()
                                        }, function () {
                                            methods.is_friend(connected_db, user["blog_id"], blog_owner["blog_id"]
                                                , function () {
                                                    methods.get_single_notification(connected_db, {
                                                        type: "friend_request"
                                                        , blog_id: user["blog_id"]
                                                        , subscribers: blog_owner["blog_id"]
                                                    }, function (nothing) {
                                                        single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:false}, user, res);
                                                    }, function (nothing) {
                                                        single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:true}, user, res);
                                                    });
                                                }, function () {
                                                    single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:true, is_friend_requested:false}, user, res);
                                                });
                                        });
                                    } else {
                                        single_blog(lang, blog_owner, blog_menu, articles, is_mobile, true, {is_friend:false, is_friend_requested:false}, user, res);
                                    }
                                });
                            }
                        });
                    });
            }
        }
    });
});

app.get('/write/agenda',function(req,res){
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    var f_cb1, f_cb2, s_cb;
    var is_mobile = false;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    f_cb1 = function (user) {res.redirect(301, '/login');};
    s_cb = function (user) {
        if (user.blog_id === "") {
            return res.redirect(301, '/set/blog-id');
        }
        write_agenda(lang, is_mobile, user, res);
    };
    if (user_id === null || secret_id === null ) {
        f_cb1(null);
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, s_cb);
    }
});

app.get('/hire-me',function(req, res) {
    return res.redirect(301, '/error/404');
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    var f_cb1, f_cb2, s_cb;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    var data = {};
    data["list_type"] = "employment";
    data["updated_at"] = undefined;
    data["type"] = "hire_me";
    if (user_id === null || secret_id === null ) {
        return res.redirect(301, '/login');
    } else {
        methods.get_all_employment_articles(connected_db, lang, data, function (articles) {
            articles = [];
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
                return res.redirect(301, '/login');
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                employment(lang, is_mobile, true, user, data["type"], articles, res);
            });
        }, function (articles) {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
                return res.redirect(301, '/login');
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                employment(lang, is_mobile, true, user, data["type"], articles, res);
            });
        });
    }
});
app.get('/apply-now',function(req, res) {
    return res.redirect(301, '/error/404');
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    var f_cb1, f_cb2, s_cb;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    var data = {};
    data["list_type"] = "employment";
    data["updated_at"] = undefined;
    data["type"] = "apply_now";
    if (user_id === null || secret_id === null ) {
        methods.get_all_employment_articles(connected_db, lang, data, function (articles) {
            articles = [];
            employment(lang, is_mobile, false, null, data["type"], articles, res);
        }, function (articles) {
            employment(lang, is_mobile, false, null, data["type"], articles, res);
        });
    } else {
        methods.get_all_employment_articles(connected_db, lang, data, function (articles) {
            articles = [];
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
                employment(lang, is_mobile, false, null, data["type"], articles, res);
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                employment(lang, is_mobile, true, user, data["type"], articles, res);
            });
        }, function (articles) {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
                employment(lang, is_mobile, false, null, data["type"], articles, res);
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                employment(lang, is_mobile, true, user, data["type"], articles, res);
            });
        });
    }
});

app.get('/hire-me/:_id',function(req, res) {
    return res.redirect(301, '/error/404');
    var _id = req.params._id;
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    /**
     * @param {boolean} is_mobile - 모바일이면 true, desktop이면 false.
     * @param {boolean} is_loginned - 로그인 사용자면 true, 비로그인 사용자면 false.
     * @param {Object} res - response header.
     */
    var data = {};
    data._id = _id;
    data.type = 'hire_me';

    if (user_id === null || secret_id === null ) {
        return res.redirect(301, '/login');
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
            function (user) {
                return res.redirect(301, '/login');
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                methods.update_article_count(connected_db, "employment", data, {$inc: { count_view:1}},
                    function (nothing) {
                        methods.get_single_hire_me(connected_db, user, data, "public", "perfect",
                            function (nothing) {
                                return res.redirect(301, '/error/404');
                            }, function (doc) {
                                return methods.is_member(connected_db, "employment", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                                    doc.is_member = is_member;
                                    return single_hire_me(lang, is_mobile, true, user, doc, res);
                                });
                            });
                    }, function (nothing) {
                        methods.get_single_hire_me(connected_db, user, data, "public", "perfect",
                            function (nothing) {
                                return res.redirect(301, '/error/404');
                            }, function (doc) {
                                return methods.is_member(connected_db, "employment", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                                    doc.is_member = is_member;
                                    return single_hire_me(lang, is_mobile, true, user, doc, res);
                                });
                            });
                    });
            });
    }
});

app.get('/apply-online-interview/:_id',function(req, res) {
    var _id = req.params._id;
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    var data = {}
        , now;
    data._id = _id;
    data.type = 'apply_now';
    if (user_id === null || secret_id === null ) {
        return res.redirect(301, '/login');
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
            function (user) {
                return res.redirect(301, '/login');
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                methods.get_single_apply_now(connected_db, user, data, "application", "perfect",
                    function (nothing) {
                        return res.redirect(301, '/error/404');
                    }, function (doc) {
                        methods.get_single_online_interview_answer(connected_db, {article_id: data._id}, user, function (nothing) {
                            if (
                                doc.questions === undefined ||
                                doc.questions.length === 0 ||
                                doc.is_online_interview_set === false
                            ) {
                                return res.redirect(301, '/error/404');
                            }
                            now = new Date().valueOf();
                            if (doc.is_start_set === true) { /* Start Time is set */
                                if (doc.start_at > now) { /* Scheduled */
                                    return res.redirect(301, '/error/404');
                                } else {
                                    if (doc.finish_at < now) { /* Finished */
                                        return res.redirect(301, '/error/404');
                                    }
                                }
                            } else { /* Right Now */
                                if (doc.finish_at < now) { /* Finished */
                                    return res.redirect(301, '/error/404');
                                }
                            }
                            return apply_online_interview(lang, is_mobile, true, user, doc, res);
                        }, function (nothing) {
                            return res.redirect(301, '/success/apply-online-interview/' + data._id);
                        });
                    });
            });
    }
});
app.get('/success/apply-online-interview/:_id',function(req, res) {
    var _id = req.params._id;
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    var data = {}
        , now;
    data._id = _id;
    data.type = 'apply_now';
    if (user_id === null || secret_id === null ) {
        return res.redirect(301, '/login');
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
            function (user) {
                return res.redirect(301, '/login');
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                methods.get_single_apply_now(connected_db, user, data, "public", "perfect",
                    function (nothing) {
                        return res.redirect(301, '/error/404');
                    }, function (doc) {
                        return success_apply_online_interview(lang, is_mobile, true, user, doc, res);
                    });
            });
    }
});
app.get('/apply-now/:_id',function(req, res) {
    return res.redirect(301, '/error/404');
    var _id = req.params._id;
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    /**
     * @param {boolean} is_mobile - 모바일이면 true, desktop이면 false.
     * @param {boolean} is_loginned - 로그인 사용자면 true, 비로그인 사용자면 false.
     * @param {Object} res - response header.
     */
    var data = {};
    data._id = _id;
    data.type = 'apply_now';
    if (user_id === null || secret_id === null ) {
        methods.get_single_apply_now(connected_db, null, data, "public", "perfect",
            function (nothing) {
                return res.redirect(301, '/error/404');
            }, function (doc) {
                doc.is_member = false;
                methods.update_article_count(connected_db, "employment", data, {$inc: { count_view:1}},
                    function (nothing) {
                        return single_apply_now(lang, is_mobile, false, null, doc, res);
                    }, function (nothing) {
                        return single_apply_now(lang, is_mobile, false, null, doc, res);
                    });
            });
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
            function (user) {
                methods.get_single_apply_now(connected_db, null, data, "public", "perfect",
                    function (nothing) {
                        return res.redirect(301, '/error/404');
                    }, function (doc) {
                        doc.is_member = false;
                        methods.update_article_count(connected_db, "employment", data, {$inc: { count_view:1}},
                            function (nothing) {
                                return single_apply_now(lang, is_mobile, false, null, doc, res);
                            }, function (nothing) {
                                return single_apply_now(lang, is_mobile, false, null, doc, res);
                            });
                    });
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                methods.update_article_count(connected_db, "employment", data, {$inc: { count_view:1}},
                    function (nothing) {
                        methods.get_single_apply_now(connected_db, user, data, "public", "perfect",
                            function (nothing) {
                                return res.redirect(301, '/error/404');
                            }, function (doc) {
                                return methods.is_member(connected_db, "employment", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                                    doc.is_member = is_member;
                                    return single_apply_now(lang, is_mobile, true, user, doc, res);
                                });
                            });
                    }, function (nothing) {
                        methods.get_single_apply_now(connected_db, user, data, "public", "perfect",
                            function (nothing) {
                                return res.redirect(301, '/error/404');
                            }, function (doc) {
                                return methods.is_member(connected_db, "employment", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                                    doc.is_member = is_member;
                                    return single_apply_now(lang, is_mobile, true, user, doc, res);
                                });
                            });
                    });
            });
    }
});

app.get('/write/hire-me',function(req,res){
    return res.redirect(301, '/error/404');
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    var f_cb1, f_cb2, s_cb;
    var is_mobile = false;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    f_cb1 = function (user) {res.redirect(301, '/login');};
    s_cb = function (user) {
        if (user.blog_id === "") {
            return res.redirect(301, '/set/blog-id');
        }
        write_hire_me(lang, is_mobile, user, res);
    };
    if (user_id === null || secret_id === null ) {
        f_cb1(null);
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, s_cb);
    }
});
app.get('/write/apply-now',function(req,res){
    return res.redirect(301, '/error/404');
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    var f_cb1, f_cb2, s_cb;
    var is_mobile = false;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    f_cb1 = function (user) {res.redirect(301, '/login');};
    s_cb = function (user) {
        if (user.blog_id === "") {
            return res.redirect(301, '/set/blog-id');
        }
        write_apply_now(lang, is_mobile, user, res);
    };
    if (user_id === null || secret_id === null ) {
        f_cb1(null);
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, s_cb);
    }
});
// app.get('/debate',function(req,res){
//     var is_mobile = false;
//     var cookies = req.headers.cookie;
//     var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
//     var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
//     var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
//     var country = req.headers['cloudfront-viewer-country'] + "";
//     if (lang !== 'en' &&
//         lang !== 'ja' &&
//         lang !== 'ko' &&
//         lang !== 'zh-Hans'
//     ) {
//         if (country === "KR") {
//             lang = "ko";
//         } else if (country === "JP") {
//             lang = "ja";
//         } else if (country === "CN") {
//             lang = "zh-Hans";
//         } else {
//             lang = "en";
//         }
//         res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
//     }
//     lang = methods.get_valid_language(lang);
//     res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
//     var f_cb1, f_cb2, s_cb;
//     if (app.get['env'] === 'production') {
//         if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
//             is_mobile = true;
//         }
//     } else {
//         if (req && req.headers && req.headers['user-agent']) {
//             is_mobile = methods.is_mobile(req.headers['user-agent']);
//         }
//     }
//     var data = {}
//         , main_tag = undefined;
//     data["list_type"] = "debate";
//     data["updated_at"] = undefined;
//     if (req.query.mt === undefined) {
//         data["type"] = "all";
//     } else {
//         data["type"] = "main_tag";
//         main_tag = data["main_tag"] = decodeURIComponent(req.query.mt);
//     }
//     if (user_id === null || secret_id === null ) {
//         methods.get_all_articles(connected_db, lang, data, function (debates) {
//             debates = [];
//             return debate(lang, is_mobile, false, null, debates, main_tag, res);
//         }, function (debates) {
//             return debate(lang, is_mobile, false, null, debates, main_tag, res);
//         });
//     } else {
//         methods.get_all_articles(connected_db, lang, data, function (debates) {
//             debates = [];
//             methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
//                 return debate(lang, is_mobile, false, null, debates, main_tag, res);
//             }, function (user) {
//                 if (user.blog_id === "") {
//                     return res.redirect(301, '/set/blog-id');
//                 }
//                 return debate(lang, is_mobile, true, user, debates, main_tag, res);
//             });
//         }, function (debates) { /* debates 가져옴 */
//             methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
//                 return debate(lang, is_mobile, false, null, debates, main_tag, res);
//             }, function (user) {
//                 if (user.blog_id === "") {
//                     return res.redirect(301, '/set/blog-id');
//                 }
//                 return debate(lang, is_mobile, true, user, debates, main_tag, res);
//             });
//         });
//     }
// });
app.get('/debate',function(req,res){
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    var f_cb1, f_cb2, s_cb;
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    var data = {}
        , main_tag = undefined
        , agenda_menu = "all";
    data["list_type"] = "agenda";
    data["updated_at"] = undefined;
    /*if (req.query.t === undefined) {
        data["agenda_menu"] = "all";
    } else {
        agenda_menu = decodeURIComponent(req.query.t).replace("-", "_");
        if (
            agenda_menu !== "all" &&
            agenda_menu !== "in_progress" &&
            agenda_menu !== "scheduled" &&
            agenda_menu !== "finished" &&
            agenda_menu !== "unlimited"
        ) {
            return res.redirect(301, '/error/404');
        } else {
            data["agenda_menu"] = agenda_menu;
        }
    }*/
    if (req.query.mt === undefined) {
        data["type"] = "all";
    } else {
        data["type"] = "main_tag";
        main_tag = data["main_tag"] = decodeURIComponent(req.query.mt);
    }
    /** type: all || main_tag
     *  agenda_menu: all || in_progress || scheduled || finished || unlimited
     **/
    if (user_id === null || secret_id === null ) {
        methods.get_all_articles(connected_db, lang, data, function (agendas) {
            agendas = [];
            return agenda(lang, is_mobile, false, null, agendas, agenda_menu, main_tag, res);
        }, function (agendas) { /* agendas 가져옴 */
            return agenda(lang, is_mobile, false, null, agendas, agenda_menu, main_tag, res);
        });
    } else {
        methods.get_all_articles(connected_db, lang, data, function (agendas) {
            agendas = [];
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
                return agenda(lang, is_mobile, false, null, agendas, agenda_menu, main_tag, res);
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                return agenda(lang, is_mobile, true, user, agendas, agenda_menu, main_tag, res);
            });
        }, function (agendas) { /* agendas 가져옴 */
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (user) {
                return agenda(lang, is_mobile, false, null, agendas, agenda_menu, main_tag, res);
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                return agenda(lang, is_mobile, true, user, agendas, agenda_menu, main_tag, res);
            });
        });
    }
});
app.get('/agenda/:_id',function(req,res){
    var _id = req.params._id;
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    var data = {};
    data._id = _id;
    data.type = 'agenda';
    if (user_id === null || secret_id === null ) {
        methods.get_single_agenda(connected_db, null, data, "public", "perfect",
            function (nothing) {
                return res.redirect(301, '/error/404');
            }, function (doc) {
                if (doc.public_authority !== 1) {
                    return res.redirect(301, '/error/404');
                } else {
                    doc.is_member = false;
                    if (doc.img.indexOf( "male.png") <= -1) {
                        doc.img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                    }
                    doc.name = "Gleant";
                    methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}},
                        function (nothing) {
                            return single_agenda(lang, is_mobile, false, null, doc, res);
                        }, function (nothing) {
                            return single_agenda(lang, is_mobile, false, null, doc, res);
                        });
                }
            });
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
            function (user) {
                methods.get_single_agenda(connected_db, null, data, "public", "perfect",
                    function (nothing) {
                        return res.redirect(301, '/error/404');
                    }, function (doc) {
                        if (doc.public_authority !== 1) {
                            return res.redirect(301, '/error/404');
                        } else {
                            doc.is_member = false;
                            if (doc.img.indexOf( "male.png") <= -1) {
                                doc.img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                            }
                            doc.name = "Gleant";
                            methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}},
                                function (nothing) {
                                    return single_agenda(lang, is_mobile, false, null, doc, res);
                                }, function (nothing) {
                                    return single_agenda(lang, is_mobile, false, null, doc, res);
                                });
                        }
                    });
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}},
                    function (nothing) {
                        methods.get_single_agenda(connected_db, user, data, "public", "perfect",
                            function (nothing) {
                                return res.redirect(301, '/error/404');
                            }, function (doc) {
                                return methods.is_member(connected_db, "articles", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                                    doc.is_member = is_member;
                                    return single_agenda(lang, is_mobile, true, user, doc, res);
                                });
                            });
                    }, function (nothing) {
                        methods.get_single_agenda(connected_db, user, data, "public", "perfect",
                            function (nothing) {
                                return res.redirect(301, '/error/404');
                            }, function (doc) {
                                return methods.is_member(connected_db, "articles", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                                    doc.is_member = is_member;
                                    return single_agenda(lang, is_mobile, true, user, doc, res);
                                });
                            });
                    });
            });
    }
});

app.get('/agenda/:agenda_id/opinion/:_id',function(req,res){
    var agenda_id = req.params.agenda_id
        , _id = req.params._id;
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    /**
     * @param {boolean} is_mobile - 모바일이면 true, desktop이면 false.
     * @param {boolean} is_loginned - 로그인 사용자면 true, 비로그인 사용자면 false.
     * @param {Object} res - response header.
     */
    var data = {};
    data.agenda_id = agenda_id;
    data._id = _id;
    data.type = 'opinion';
    if (user_id === null || secret_id === null ) {
        methods.get_single_opinion(connected_db, null, data, "public", "perfect",
            function (nothing) {
                return res.redirect(301, '/error/404');
            }, function (doc) {
                methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}},
                    function (nothing) {
                        return single_opinion(lang, is_mobile, false, null, doc, res);
                    }, function (nothing) {
                        return single_opinion(lang, is_mobile, false, null, doc, res);
                    });
            });
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
            function (user) {
                methods.get_single_opinion(connected_db, null, data, "public", "perfect",
                    function (nothing) {
                        return res.redirect(301, '/error/404');
                    }, function (doc) {
                        methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}},
                            function (nothing) {
                                return single_opinion(lang, is_mobile, false, null, doc, res);
                            }, function (nothing) {
                                return single_opinion(lang, is_mobile, false, null, doc, res);
                            });
                    });
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}},
                    function (nothing) {
                        methods.get_single_opinion(connected_db, user, data, "public", "perfect",
                            function (nothing) {
                                return res.redirect(301, '/error/404');
                            }, function (doc) {
                                return single_opinion(lang, is_mobile, true, user, doc, res);
                            });
                    }, function (nothing) {
                        methods.get_single_opinion(connected_db, user, data, "public", "perfect",
                            function (nothing) {
                                return res.redirect(301, '/error/404');
                            }, function (doc) {
                                return single_opinion(lang, is_mobile, true, user, doc, res);
                            });
                    });
            });
    }
});

app.get('/agenda/:agenda_id/tr/:_id',function(req,res){
    return res.redirect(301, '/error/404');
    var agenda_id = req.params.agenda_id
        , _id = req.params._id;
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    /**
     * @param {boolean} is_mobile - 모바일이면 true, desktop이면 false.
     * @param {boolean} is_loginned - 로그인 사용자면 true, 비로그인 사용자면 false.
     * @param {Object} res - response header.
     */
    var data = {};
    data.agenda_id = agenda_id;
    data._id = _id;
    data.type = 'tr_agenda';

    if (user_id === null || secret_id === null ) {
        methods.get_single_translation(connected_db, null, data, "public", "perfect",
            function (nothing) {
                return res.redirect(301, '/error/404');
            }, function (doc) {
                doc.is_member = false;
                methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}},
                    function (nothing) {
                        return single_translation(lang, is_mobile, false, null, doc, res);
                    }, function (nothing) {
                        return single_translation(lang, is_mobile, false, null, doc, res);
                    });
            });
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
            function (user) {
                methods.get_single_translation(connected_db, null, data, "public", "perfect",
                    function (nothing) {
                        return res.redirect(301, '/error/404');
                    }, function (doc) {
                        doc.is_member = false;
                        methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}},
                            function (nothing) {
                                return single_translation(lang, is_mobile, false, null, doc, res);
                            }, function (nothing) {
                                return single_translation(lang, is_mobile, false, null, doc, res);
                            });
                    });
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}},
                    function (nothing) {
                        methods.get_single_translation(connected_db, user, data, "public", "perfect",
                            function (nothing) {
                                return res.redirect(301, '/error/404');
                            }, function (doc) {
                                return methods.is_member(connected_db, "articles", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                                    doc.is_member = is_member;
                                    return single_translation(lang, is_mobile, true, user, doc, res);
                                });
                            });
                    }, function (nothing) {
                        methods.get_single_translation(connected_db, user, data, "public", "perfect",
                            function (nothing) {
                                return res.redirect(301, '/error/404');
                            }, function (doc) {
                                return methods.is_member(connected_db, "articles", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                                    doc.is_member = is_member;
                                    return single_translation(lang, is_mobile, true, user, doc, res);
                                });
                            });
                    });
            });
    }
});

app.get('/agenda/:agenda_id/opinion/:opinion_id/tr/:_id',function(req,res){
    return res.redirect(301, '/error/404');
    var agenda_id = req.params.agenda_id
        , opinion_id = req.params.opinion_id
        , _id = req.params._id;
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    /**
     * @param {boolean} is_mobile - 모바일이면 true, desktop이면 false.
     * @param {boolean} is_loginned - 로그인 사용자면 true, 비로그인 사용자면 false.
     * @param {Object} res - response header.
     */
    var data = {};
    data.agenda_id = agenda_id;
    data.opinion_id = opinion_id;
    data._id = _id;
    data.type = 'tr_opinion';
    if (user_id === null || secret_id === null ) {
        methods.get_single_translation(connected_db, null, data, "public", "perfect",
            function (nothing) {
                return res.redirect(301, '/error/404');
            }, function (doc) {
                methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}},
                    function (nothing) {
                        return single_translation(lang, is_mobile, false, null, doc, res);
                    }, function (nothing) {
                        return single_translation(lang, is_mobile, false, null, doc, res);
                    });
            });
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
            function (user) {
                methods.get_single_translation(connected_db, null, data, "public", "perfect",
                    function (nothing) {
                        return res.redirect(301, '/error/404');
                    }, function (doc) {
                        methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}},
                            function (nothing) {
                                return single_translation(lang, is_mobile, false, null, doc, res);
                            }, function (nothing) {
                                return single_translation(lang, is_mobile, false, null, doc, res);
                            });
                    });
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}},
                    function (nothing) {
                        methods.get_single_translation(connected_db, user, data, "public", "perfect",
                            function (nothing) {
                                return res.redirect(301, '/error/404');
                            }, function (doc) {
                                return single_translation(lang, is_mobile, true, user, doc, res);
                            });
                    }, function (nothing) {
                        methods.get_single_translation(connected_db, user, data, "public", "perfect",
                            function (nothing) {
                                return res.redirect(301, '/error/404');
                            }, function (doc) {
                                return single_translation(lang, is_mobile, true, user, doc, res);
                            });
                    });
            });
    }
});

/**
 * 검색 전체
 *
 * 주의해야할 점
 * 인물정보, 토론, 블로그는 from 과 size를 elasticsearch 에 맞춰 실행하면 되는데, 이미지 같은 경우, 무조건 size보다 많게 반환하기 때문에 pagination 처리를 어떻게 할지 잘 조절해야할 것 같다..
 * 조금 더 고려한다음에 public_authority 1인 것들은 이미지 따로 태그넣어서 저장시켜주면 되지 않을까하는 생각...
 *
 * req.query - 쿼리 전체
 * req.query.w - type
 *     tot - All
 *           인물정보 - 5개만 가져와서 가장 상위 1개만 정보 다 보여주고, 나머지 4개는 동명이인에 넣기. (다음 참고). 인물더보기 클릭 시, w=ur 로 넘어가기
 *           토론 - 5줄 가져오고, 하단 더보기 클릭 시 5줄씩 추가. 우측 토론 더보기 클릭 시, w=de 로 넘어가기
 *           블로그 - 5줄 가져오고, 하단 더보기 클릭 시 5줄씩 추가. 우측 블로그 더보기 클릭 시, w=de 로 넘어가기
 *           이미지 - 2줄 가져오고, 하단 더보기 클릭 시 2줄씩 추가. 우측 이미지 더보기 클릭 시, w=img 로 넘어가기
 *     ur - User
 *          10개씩 가져오고, from과 size로 pagination 해서 처리하기. from이 없을 경우, default값 0이고, size는 기본 10으로 끊어서 가져오기.
 *     de - Debate
 *          10개씩 가져오고, from과 size로 pagination 해서 처리하기. from이 없을 경우, default값 0이고, size는 기본 10으로 끊어서 가져오기.
 *     pr - blog
 *          10개씩 가져오고, from과 size로 pagination 해서 처리하기. from이 없을 경우, default값 0이고, size는 기본 10으로 끊어서 가져오기.
 *     img - Image
 *          Elasticsearch에서 가져올 떄, img="" 인것은 must_not으로 빼고 가져오기. from이 없을 경우, default값 0이고, size는 기본 10으로 끊어서 가져오기.
 *          img는 주의해야 하는데, size 10으로 지정하면 최소 10개 이상이 오는 것이기 때문에 클라이언트단에서 그다음 request 보낼 때 skip
 */
app.get('/search',function(req,res) {
    var is_mobile = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var news_link = methods.get_cookie(cookies, cookie_name["news_link"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    if (news_link !== null) {
        news_link = decodeURIComponent(decodeURIComponent(news_link));
    }
    var type = req.query.w;
    var query= req.query.q;
    var from = req.query.f;
    var size;
    /* redirect */
    /* type이 전체인데 from이 존재하는 경우 */
    if (
        type === 'tot'
    ) {
        if (from !== undefined) {
            if (query === undefined) { /* query가 비어있는 경우 빈 쿼리로 만들기 */
                query = "";
            }
            return res.redirect(301, '/search?w=tot&q=' + methods.encode_for_url(query));
        }
    }
    if (type === undefined) {
        if (query === undefined || query === null) { /* query가 비어있는 경우 빈 쿼리로 만들기 */
            query = "";
        }
        return res.redirect(301, '/search?w=tot&q=' + methods.encode_for_url(query));
    }
    /* from integer로 변환하기 */
    if (from !== undefined) { /* 지정되어있는 경우 */
        try {
            from = parseInt(from);
        } catch (e) {
            return res.redirect(301, '/error/404');
        }
    }
    if (from === undefined || from < 0) { /* 잘못된 값 없애기 */
        from = 0;
    }
    if (type === 'tot' || type === undefined) { /* All */
        type = 'tot';
        size = limit.search_all; /* 전체는 무조건 size가 0임. */
    } else if ( type === 'ur' ) { /* User */
        size = limit.search_user;
        from = parseInt(Math.floor(from / limit.search_user) * limit.search_user);
    } else if ( type === 'ns' ) { /* News */
        size = limit.search_news;
        from = parseInt(Math.floor(from / limit.search_news) * limit.search_news);
    } else if ( type === 'de' ) { /* Debate */
        size = limit.search_debate;
        from = parseInt(Math.floor(from / limit.search_debate) * limit.search_debate);
    } /*else if ( type === 'em' ) {
        size = limit.search_employment;
        from = parseInt(Math.floor(from / limit.search_employment) * limit.search_employment);
    }*/ else if ( type === 'we' ) { /* Website */
        size = limit.search_website;
        from = parseInt(Math.floor(from / limit.search_website) * limit.search_website);
    } else if ( type === 'pr' ) { /* blog */
        size = limit.search_blog;
        from = parseInt(Math.floor(from / limit.search_blog) * limit.search_blog);
    } else if ( type === 'img' ) { /* Image */
        size = limit.search_image;
    } else {
        size = 10;
    }
    /* type
     tot : 전체
     ur : 사람
     de : 토론
     pr : 블로그
     img : 이미지
     */
    if (app.get['env'] === 'production') {
        if (req && req.headers && req.headers['cloudfront-is-mobile-viewer'] === 'true') {
            is_mobile = true;
        }
    } else {
        if (req && req.headers && req.headers['user-agent']) {
            is_mobile = methods.is_mobile(req.headers['user-agent']);
        }
    }
    /**
     * @param {boolean} is_mobile - 모바일이면 true, desktop이면 false.
     * @param {boolean} is_loginned - 로그인 사용자면 true, 비로그인 사용자면 false.
     * @param {Object} user - 로그인 사용자일 경우 user 객체 || null.
     * @param {Object} es_docs - Elasticsearch의 결과.
     * @param {Object} template - response header.
     */
    var pass_obj = {};
    pass_obj.type = type;
    pass_obj.query = query;
    pass_obj.from = from;
    pass_obj.size = size;
    var first = {}
        , second = {};
    if (user_id === null || secret_id === null ) {
        pass_obj.is_loginned = false;
        if (query === undefined || query === "") {
            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                if (news_link === null) {
                    return search(lang, is_mobile, false, null, pass_obj, null, null, [], res);
                } else {
                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                        return search(lang, is_mobile, false, null, pass_obj, null, null, [], res);
                    }, function (news_doc) {
                        first.link = news_link;
                        first.type = news_doc.type;
                        first.comment_type = 1;
                        first.is_removed = false;
                        second.is_removed = 0;
                        methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                            news_comments = [];
                            return search(lang, is_mobile, false, null, pass_obj, null, news_doc, news_comments, res);
                        }, function (news_comments) {
                            return search(lang, is_mobile, false, null, pass_obj, null, news_doc, news_comments, res);
                        });
                    });
                }
            });
        } else {
            if (type === 'tot') { /* Total */
                es_methods.es_search_all(es_client, pass_obj, function (es_docs) {
                    methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                        if (news_link === null) {
                            return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                        } else {
                            methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                            }, function (news_doc) {
                                first.link = news_link;
                                first.type = news_doc.type;
                                first.comment_type = 1;
                                first.is_removed = false;
                                second.is_removed = 0;
                                methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                    news_comments = [];
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                }, function (news_comments) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                });
                            });
                        }
                    });
                });
            } else if (type === 'ur') { /* User */
                es_methods.es_search_user(es_client, pass_obj, function (es_docs) {
                    methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                        if (news_link === null) {
                            return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                        } else {
                            methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                            }, function (news_doc) {
                                first.link = news_link;
                                first.type = news_doc.type;
                                first.comment_type = 1;
                                first.is_removed = false;
                                second.is_removed = 0;
                                methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                    news_comments = [];
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                }, function (news_comments) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                });
                            });
                        }
                    });
                });
            } else if (type === 'ns') { /* News */
                es_methods.es_search_news(es_client, pass_obj, function (es_docs) {
                    methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                        if (news_link === null) {
                            return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                        } else {
                            methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                            }, function (news_doc) {
                                first.link = news_link;
                                first.type = news_doc.type;
                                first.comment_type = 1;
                                first.is_removed = false;
                                second.is_removed = 0;
                                methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                    news_comments = [];
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                }, function (news_comments) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                });
                            });
                        }
                    });
                });
            } else if (type === 'de') { /* Debate */
                es_methods.es_search_debate(es_client, pass_obj, function (es_docs) {
                    methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                        if (news_link === null) {
                            return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                        } else {
                            methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                            }, function (news_doc) {
                                first.link = news_link;
                                first.type = news_doc.type;
                                first.comment_type = 1;
                                first.is_removed = false;
                                second.is_removed = 0;
                                methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                    news_comments = [];
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                }, function (news_comments) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                });
                            });
                        }
                    });
                });
            } /*else if (type === 'em') {
                es_methods.es_search_employment(es_client, pass_obj, function (es_docs) {
                    methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                        if (news_link === null) {
                            return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                        } else {
                            methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                            }, function (news_doc) {
                                first.link = news_link;
                                first.type = news_doc.type;
                                first.comment_type = 1;
                                first.is_removed = false;
                                second.is_removed = 0;
                                methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                    news_comments = [];
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                }, function (news_comments) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                });
                            });
                        }
                    });
                });
            }*/ else if (type === 'we') { /* Website */
                es_methods.es_search_website(es_client, pass_obj, function (es_docs) {
                    methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                        if (news_link === null) {
                            return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                        } else {
                            methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                            }, function (news_doc) {
                                first.link = news_link;
                                first.type = news_doc.type;
                                first.comment_type = 1;
                                first.is_removed = false;
                                second.is_removed = 0;
                                methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                    news_comments = [];
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                }, function (news_comments) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                });
                            });
                        }
                    });
                });
            } else if (type === 'pr') { /* blog */
                es_methods.es_search_blog(es_client, pass_obj, function (es_docs) {
                    methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                        if (news_link === null) {
                            return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                        } else {
                            methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                            }, function (news_doc) {
                                first.link = news_link;
                                first.type = news_doc.type;
                                first.comment_type = 1;
                                first.is_removed = false;
                                second.is_removed = 0;
                                methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                    news_comments = [];
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                }, function (news_comments) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                });
                            });
                        }
                    });
                });
            } else if (type === 'img') { /* Image */
                es_methods.es_search_image(es_client, pass_obj, function (es_docs) {
                    methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                        if (news_link === null) {
                            return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                        } else {
                            methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                            }, function (news_doc) {
                                first.link = news_link;
                                first.type = news_doc.type;
                                first.comment_type = 1;
                                first.is_removed = false;
                                second.is_removed = 0;
                                methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                    news_comments = [];
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                }, function (news_comments) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                });
                            });
                        }
                    });
                });
            } else {
                return res.redirect(301, '/error/404');
            }
        }
    } else {
        if (query === undefined || query === "") {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                function (nothing) {
                    pass_obj.is_loginned = false;
                    methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                        if (news_link === null) {
                            return search(lang, is_mobile, false, null, pass_obj, null, null, [], res);
                        } else {
                            methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                return search(lang, is_mobile, false, null, pass_obj, null, null, [], res);
                            }, function (news_doc) {
                                first.link = news_link;
                                first.type = news_doc.type;
                                first.comment_type = 1;
                                first.is_removed = false;
                                second.is_removed = 0;
                                methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                    news_comments = [];
                                    return search(lang, is_mobile, false, null, pass_obj, null, news_doc, news_comments, res);
                                }, function (news_comments) {
                                    return search(lang, is_mobile, false, null, pass_obj, null, news_doc, news_comments, res);
                                });
                            });
                        }
                    });
                }, function (user) {
                    if (user.blog_id === "") {
                        return res.redirect(301, '/set/blog-id');
                    }
                    pass_obj.is_loginned = true;
                    methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                        if (news_link === null) {
                            return search(lang, is_mobile, true, user, pass_obj, null, null, [], res);
                        } else {
                            methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                return search(lang, is_mobile, true, user, pass_obj, null, null, [], res);
                            }, function (news_doc) {
                                first.link = news_link;
                                first.type = news_doc.type;
                                first.comment_type = 1;
                                first.is_removed = false;
                                second.is_removed = 0;
                                methods.get_article_comments(connected_db, true, first, second, function (news_comments) {
                                    news_comments = [];
                                    return search(lang, is_mobile, true, user, pass_obj, null, news_doc, news_comments, res);
                                }, function (news_comments) {
                                    return search(lang, is_mobile, true, user, pass_obj, null, news_doc, news_comments, res);
                                });
                            });
                        }
                    });
                });
        } else {
            if (type === 'tot') { /* Total */
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        pass_obj.is_loginned = false;
                        es_methods.es_search_all(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    }, function (user) {
                        if (user.blog_id === "") {
                            return res.redirect(301, '/set/blog-id');
                        }
                        pass_obj.is_loginned = true;
                        es_methods.es_search_all(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, true, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    });
            } else if (type === 'ur') { /* User */
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        pass_obj.is_loginned = false;
                        es_methods.es_search_user(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    }, function (user) {
                        if (user.blog_id === "") {
                            return res.redirect(301, '/set/blog-id');
                        }
                        pass_obj.is_loginned = true;
                        es_methods.es_search_user(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, true, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    });
            } else if (type === 'ns') { /* News */
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        pass_obj.is_loginned = false;
                        es_methods.es_search_news(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    }, function (user) {
                        if (user.blog_id === "") {
                            return res.redirect(301, '/set/blog-id');
                        }
                        pass_obj.is_loginned = true;
                        es_methods.es_search_news(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, true, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    });
            } else if (type === 'de') { /* Debate */
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        pass_obj.is_loginned = false;
                        es_methods.es_search_debate(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    }, function (user) {
                        if (user.blog_id === "") {
                            return res.redirect(301, '/set/blog-id');
                        }
                        pass_obj.is_loginned = true;
                        es_methods.es_search_debate(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, true, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    });
            } /*else if (type === 'em') {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        pass_obj.is_loginned = false;
                        es_methods.es_search_employment(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    }, function (user) {
                        if (user.blog_id === "") {
                            return res.redirect(301, '/set/blog-id');
                        }
                        pass_obj.is_loginned = true;
                        es_methods.es_search_employment(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, true, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    });
            }*/ else if (type === 'we') { /* Website */
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        pass_obj.is_loginned = false;
                        es_methods.es_search_website(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    }, function (user) {
                        if (user.blog_id === "") {
                            return res.redirect(301, '/set/blog-id');
                        }
                        pass_obj.is_loginned = true;
                        es_methods.es_search_website(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, true, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    });
            } else if (type === 'pr') { /* blog */
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        pass_obj.is_loginned = false;
                        es_methods.es_search_blog(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    }, function (user) {
                        if (user.blog_id === "") {
                            return res.redirect(301, '/set/blog-id');
                        }
                        pass_obj.is_loginned = true;
                        es_methods.es_search_blog(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, true, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    });
            } else if (type === 'img') { /* Image */
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        pass_obj.is_loginned = false;
                        es_methods.es_search_image(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, false, null, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, false, null, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    }, function (user) {
                        if (user.blog_id === "") {
                            return res.redirect(301, '/set/blog-id');
                        }
                        pass_obj.is_loginned = true;
                        es_methods.es_search_image(es_client, pass_obj, function (es_docs) {
                            methods.upsert_single_keyword_when_exists(connected_db, lang, query, function () {
                                if (news_link === null) {
                                    return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                } else {
                                    methods.get_single_news(connected_db, {link: news_link}, function (nothing) {
                                        return search(lang, is_mobile, true, user, pass_obj, es_docs, null, [], res);
                                    }, function (news_doc) {
                                        first.link = news_link;
                                        first.type = news_doc.type;
                                        first.comment_type = 1;
                                        first.is_removed = false;
                                        second.is_removed = 0;
                                        methods.get_article_comments(connected_db, true, first, second, function (news_comments) {
                                            news_comments = [];
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        }, function (news_comments) {
                                            return search(lang, is_mobile, true, user, pass_obj, es_docs, news_doc, news_comments, res);
                                        });
                                    });
                                }
                            });
                        });
                    });
            }
            // else if (type === 'web') { /* 웹문서일 경우 */
            //     es_methods.es_search_web(es_client, pass_obj, function (es_docs) {
            //         methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
            //             function (nothing) { /* 비로그인 사용자인 경우 */
            //                 search(lang, is_mobile, false, null, pass_obj, es_docs, res);
            //             }, function (user) { /* 로그인 사용자인 경우 */
            //                 search(lang, is_mobile, true, user, pass_obj, es_docs, res);
            //             });
            //     });
            // }
            else {
                return res.redirect(301, '/error/404');
            }
        }
    }
});
/* 링크 정보 가져오기 */
app.get('/get/link',function(req,res){
    if (req.query.url === undefined) {
        return res.redirect(301, '/error/404');
    }
    var cb = function (doc) {
        return crawled_link(doc, res);
    };
    var link = decodeURIComponent(req.query.url);
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";

    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    if (user_id === null || secret_id === null ) {
        return methods.get_link(connected_db, link, function (nothing) {
            return cb({
                link: link
                , language: "en"
                , img: config.aws_s3_url + "/icons/question.png"
                , title: link
                , description: ""
                , site: ""
                , is_crawled: false
            });
        }, function (doc) {
            return cb(doc);
        });
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
            function (nothing) {
                return methods.get_link(connected_db, link, function (nothing) {
                    return cb({
                        link: link
                        , language: "en"
                        , img: config.aws_s3_url + "/icons/question.png"
                        , title: link
                        , description: ""
                        , site: ""
                        , is_crawled: false
                    });
                }, function (doc) {
                    return cb(doc);
                });
            }, function (user) {
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                return methods.get_link(connected_db, link, function (nothing) {
                    return cb({
                        link: link
                        , language: "en"
                        , img: config.aws_s3_url + "/icons/question.png"
                        , title: link
                        , description: ""
                        , site: ""
                        , is_crawled: false
                    });
                }, function (doc) {
                    return cb(doc);
                });
            });
    }
});

app.get('/update/square',function(req,res){
    var f_cb = function (nothing) {return res.redirect(301, '/error/404');};
    var s_cb = function (num_of_updated) {return res.end("Updated " + num_of_updated + " images.");};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    if (user_id === null || secret_id === null ) {
        return res.redirect(301, '/error/404');
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
            function (nothing) {
                return res.redirect(301, '/error/404');
            }, function (user) {
                if (user.blog_id !== "gleant") {
                    return res.redirect(301, '/error/404');
                }
                methods.get_all_images(connected_db, function (docs) {
                    methods.upload_square_image_to_aws(connected_db, docs, 0, 0, f_cb, s_cb);
                });
            });
    }
});

/* 투표함 가져오기 */
app.get('/get/vote',function(req,res){
    if (req.query.q === undefined) {
        return res.redirect(301, '/error/404');
    }
    var data = {};
    data._id = decodeURIComponent(req.query.q);
    var tr = undefined;
    if (req.query.tr !== undefined) {
        tr = decodeURIComponent(req.query.tr);
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    var country = req.headers['cloudfront-viewer-country'] + "";
    if (lang !== 'en' &&
        lang !== 'ja' &&
        lang !== 'ko' &&
        lang !== 'zh-Hans'
    ) {
        if (country === "KR") {
            lang = "ko";
        } else if (country === "JP") {
            lang = "ja";
        } else if (country === "CN") {
            lang = "zh-Hans";
        } else {
            lang = "en";
        }
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }

    if (data._id === "" || tr === "") {
        return res.redirect(301, '/error/404');
    }
    if (user_id === null || secret_id === null) { /* 비로그인 사용자일 경우 */
        methods.get_single_vote(connected_db, data, "exist",
            function (nothing) { /* 투표함이 존재하지 않을 경우 */
                return vote(lang, null, null, false, false, res);
            }, function (doc) {  /* 투표함이 존재하는 경우 */
                if (tr === undefined) { /* Original */
                    if (doc.public_authority === 1) {
                        if (doc.service_type === "debate") {
                            return vote(lang, doc, null, false, false, res);
                        } else if (doc.service_type === "blog") {
                            return vote(lang, doc, null, false, false, res);
                        } else {
                            return vote(lang, null, null, false, false, res);
                        }
                    } else {
                        return vote(lang, null, null, false, false, res);
                    }
                } else { /* Translation */
                    if (doc.public_authority === 1) {
                        if (doc.service_type === "debate") {
                            methods.get_single_translated_vote(connected_db, {_id: tr, original_id: data._id},
                                function (nothing) {
                                    return vote(lang, doc, null, false, false, res);
                                }, function (tr_doc) {
                                    return vote(lang, doc, tr_doc, false, false, res);
                                });
                        } else if (doc.service_type === "blog") {
                            return vote(lang, doc, null, false, false, res);
                        } else {
                            return vote(lang, null, null, false, false, res);
                        }
                    } else {
                        return vote(lang, null, null, false, false, res);
                    }
                }
            });
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
            function (nothing) {
                methods.get_single_vote(connected_db, data, "exist",
                    function (nothing) { /* 투표함이 존재하지 않을 경우 */
                        return vote(lang, null, null, false, false, res);
                    }, function (doc) {  /* 투표함이 존재하는 경우 */
                        if (tr === undefined) { /* Original */
                            if (doc.public_authority === 1) {
                                if (doc.service_type === "debate") {
                                    return vote(lang, doc, null, false, false, res);
                                } else if (doc.service_type === "blog") {
                                    return vote(lang, doc, null, false, false, res);
                                } else {
                                    return vote(lang, null, null, false, false, res);
                                }
                            } else {
                                return vote(lang, null, null, false, false, res);
                            }
                        } else { /* Translation */
                            if (doc.public_authority === 1) {
                                if (doc.service_type === "debate") {
                                    methods.get_single_translated_vote(connected_db, {_id: tr, original_id: data._id},
                                        function (nothing) {
                                            return vote(lang, doc, null, false, false, res);
                                        }, function (tr_doc) {
                                            return vote(lang, doc, tr_doc, false, false, res);
                                        });
                                } else if (doc.service_type === "blog") {
                                    return vote(lang, doc, null, false, false, res);
                                } else {
                                    return vote(lang, null, null, false, false, res);
                                }
                            } else {
                                return vote(lang, null, null, false, false, res);
                            }
                        }
                    });
            }, function (user) { /* 로그인 사용자일 경우 */
                if (user.blog_id === "") {
                    return res.redirect(301, '/set/blog-id');
                }
                methods.get_single_vote(connected_db, {
                        _id: data._id
                        , blog_id: user.blog_id
                    }, "vote",
                    function (nothing) { /* 투표한 사용자가 아닐 경우 */
                        methods.get_single_vote(connected_db, data, "exist",
                            function (nothing) { /* 투표함이 존재하지 않을 경우 */
                                return vote(lang, null, null, true, false, res);
                            }, function (doc) {  /* 투표함이 존재하는 경우 */
                                if (tr === undefined) { /* Original */
                                    if (doc.public_authority === 1) {
                                        if (doc.service_type === "debate") {
                                            return vote(lang, doc, null, true, false, res);
                                        } else if (doc.service_type === "blog") {
                                            return vote(lang, doc, null, true, false, res);
                                        } else {
                                            return vote(lang, null, null, true, false, res);
                                        }
                                    } else {
                                        if (doc.public_authority === 2) {
                                            if (doc.service_type === "debate") {
                                                methods.get_single_agenda(connected_db, user, {_id: doc.root_id}, "public", "perfect"
                                                    , function (nothing) {
                                                        return vote(lang, null, null, true, false, res);
                                                    }, function (nothing) {
                                                        return vote(lang, doc, null, true, false, res);
                                                    });
                                            } else if (doc.service_type === "blog") {
                                                if (doc.blog_id === user.blog_id) {
                                                    return vote(lang, doc, null, true, false, res);
                                                } else {
                                                    methods.is_friend(connected_db, user.blog_id, doc.blog_id
                                                        , function () {
                                                            return vote(lang, null, null, true, false, res);
                                                        }, function () {
                                                            return vote(lang, doc, null, true, false, res);
                                                        });
                                                }
                                            } else {
                                                return vote(lang, null, null, true, false, res);
                                            }
                                        } else if (doc.public_authority === 0) {
                                            if (doc.blog_id === user.blog_id) {
                                                return vote(lang, doc, null, true, false, res);
                                            } else {
                                                return vote(lang, null, null, true, false, res);
                                            }
                                        } else {
                                            return vote(lang, null, null, true, false, res);
                                        }
                                    }
                                } else { /* Translation */
                                    if (doc.public_authority === 1) {
                                        if (doc.service_type === "debate") {
                                            methods.get_single_translated_vote(connected_db, {_id: tr, original_id: data._id},
                                                function (nothing) {
                                                    /* lang, original_doc, translated_doc, is_loginned, is_voted, template */
                                                    return vote(lang, doc, null, true, false, res);
                                                }, function (tr_doc) {
                                                    /* lang, original_doc, translated_doc, is_loginned, is_voted, template */
                                                    return vote(lang, doc, tr_doc, true, false, res);
                                                });
                                        } else if (doc.service_type === "blog") {
                                            return vote(lang, doc, null, true, false, res);
                                        } else {
                                            return vote(lang, null, null, true, false, res);
                                        }
                                    } else {
                                        if (doc.public_authority === 2) {
                                            if (doc.service_type === "debate") {
                                                methods.get_single_agenda(connected_db, user, {_id: doc.root_id}, "public", "perfect"
                                                    , function (nothing) {
                                                        return vote(lang, null, null, true, false, res);
                                                    }, function (nothing) {
                                                        methods.get_single_translated_vote(connected_db, {_id: tr, original_id: data._id},
                                                            function (nothing) {
                                                                /* lang, original_doc, translated_doc, is_loginned, is_voted, template */
                                                                return vote(lang, doc, null, true, false, res);
                                                            }, function (tr_doc) {
                                                                /* lang, original_doc, translated_doc, is_loginned, is_voted, template */
                                                                return vote(lang, doc, tr_doc, true, false, res);
                                                            });
                                                    });
                                            } else if (doc.service_type === "blog") {
                                                if (doc.blog_id === user.blog_id) {
                                                    return vote(lang, doc, null, true, false, res);
                                                } else {
                                                    methods.is_friend(connected_db, user.blog_id, doc.blog_id
                                                        , function () {
                                                            return vote(lang, null, null, true, false, res);
                                                        }, function () {
                                                            return vote(lang, doc, null, true, false, res);
                                                        });
                                                }
                                            } else {
                                                return vote(lang, null, null, true, false, res);
                                            }
                                        } else if (doc.public_authority === 0) {
                                            if (doc.blog_id === user.blog_id) {
                                                return vote(lang, doc, null, true, false, res);
                                            } else {
                                                return vote(lang, null, null, true, false, res);
                                            }
                                        } else {
                                            return vote(lang, null, null, true, false, res);
                                        }
                                    }
                                }
                            });
                    }, function (doc) { /* 투표한 사용자일 경우 */
                        if (tr === undefined) { /* Original */
                            /* lang, original_doc, translated_doc, is_loginned, is_voted, template */
                            if (doc.public_authority === 1) {
                                if (doc.service_type === "debate") {
                                    return vote(lang, doc, null, true, true, res);
                                } else if (doc.service_type === "blog") {
                                    return vote(lang, doc, null, true, true, res);
                                } else {
                                    return vote(lang, null, null, true, false, res);
                                }
                            } else {
                                if (doc.public_authority === 2) {
                                    if (doc.service_type === "debate") {
                                        methods.get_single_agenda(connected_db, user, {_id: doc.root_id}, "public", "perfect"
                                            , function (nothing) {
                                                return vote(lang, null, null, true, false, res);
                                            }, function (nothing) {
                                                return vote(lang, doc, null, true, true, res);
                                            });
                                    } else if (doc.service_type === "blog") {
                                        if (doc.blog_id === user.blog_id) {
                                            return vote(lang, doc, null, true, true, res);
                                        } else {
                                            methods.is_friend(connected_db, user.blog_id, doc.blog_id
                                                    , function () {
                                                        return vote(lang, null, null, true, false, res);
                                                    }, function () {
                                                        return vote(lang, doc, null, true, true, res);
                                                });
                                        }
                                    } else {
                                        return vote(lang, null, null, true, false, res);
                                    }
                                } else if (doc.public_authority === 0) {
                                    if (doc.blog_id === user.blog_id) {
                                        return vote(lang, doc, null, true, false, res);
                                    } else {
                                        return vote(lang, null, null, true, false, res);
                                    }
                                } else {
                                    return vote(lang, null, null, true, false, res);
                                }
                            }
                        } else { /* Translation */
                            if (doc.public_authority === 1) {
                                if (doc.service_type === "debate") {
                                    methods.get_single_translated_vote(connected_db, {_id: tr, original_id: data._id},
                                        function (nothing) {
                                            /* lang, original_doc, translated_doc, is_loginned, is_voted, template */
                                            return vote(lang, doc, null, true, true, res);
                                        }, function (tr_doc) {
                                            /* lang, original_doc, translated_doc, is_loginned, is_voted, template */
                                            return vote(lang, doc, tr_doc, true, true, res);
                                        });
                                } else if (doc.service_type === "blog") {
                                    return vote(lang, doc, null, true, true, res);
                                } else {
                                    return vote(lang, null, null, true, false, res);
                                }
                            } else {
                                if (doc.public_authority === 2) {
                                    if (doc.service_type === "debate") {
                                        methods.get_single_agenda(connected_db, user, {_id: doc.root_id}, "public", "perfect"
                                            , function (nothing) {
                                                return vote(lang, null, null, true, false, res);
                                            }, function (nothing) {
                                                methods.get_single_translated_vote(connected_db, {_id: tr, original_id: data._id},
                                                    function (nothing) {
                                                        /* lang, original_doc, translated_doc, is_loginned, is_voted, template */
                                                        return vote(lang, doc, null, true, true, res);
                                                    }, function (tr_doc) {
                                                        /* lang, original_doc, translated_doc, is_loginned, is_voted, template */
                                                        return vote(lang, doc, tr_doc, true, true, res);
                                                    });
                                            });
                                    } else if (doc.service_type === "blog") {
                                        if (doc.blog_id === user.blog_id) {
                                            return vote(lang, doc, null, true, true, res);
                                        } else {
                                            methods.is_friend(connected_db, user.blog_id, doc.blog_id
                                                , function () {
                                                    return vote(lang, null, null, true, false, res);
                                                }, function () {
                                                    return vote(lang, doc, null, true, true, res);
                                                });
                                        }
                                    } else {
                                        return vote(lang, null, null, true, false, res);
                                    }
                                } else if (doc.public_authority === 0) {
                                    if (doc.blog_id === user.blog_id) {
                                        return vote(lang, doc, null, true, false, res);
                                    } else {
                                        return vote(lang, null, null, true, false, res);
                                    }
                                } else {
                                    return vote(lang, null, null, true, false, res);
                                }
                            }
                        }
                    });
            });
    }
});
/* language 변경 */
app.post('/change/language', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    res.json({response:false});
    var lang = req.body.lang;
    if (
        lang === undefined
    ) {
        return res.json({response:false});
    } else {
        if (
            lang !== "en" &&
            lang !== "ja" &&
            lang !== "ko" &&
            lang !== "zh-Hans"
        ) {
            res.json({response:false});
        } else {
            if (app.get('env') === 'production') {
                res.cookie(cookie_name["lang"], lang, {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            } else {
                res.cookie(cookie_name["lang"], lang, {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            }
            res.json({response:true});
        }
    }
});

/* 메인 태그 반환 */
app.post('/get/main-tags', function (req, res) {
    var cb = function (tags) {res.json({tags: tags});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    methods.get_main_tags(connected_db, lang, cb);
});

/* 오늘의 인기태그 반환 */
app.post('/get/realtime-popular-keywords', function (req, res) {
    var cb = function (keywords) {res.json({keywords: keywords});};
    var cookies = req.headers.cookie;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    methods.get_realtime_popular_keywords(connected_db, lang, cb);
});
app.post('/autocomplete', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (nothing) {res.json({response:false});};
    var s_cb = function (docs) {res.json({response:true,docs: docs});};

    if (
        req.body.text === undefined
    ) {
        return f_cb(null);
    }
    var text = decodeURIComponent(req.body.text);
    es_methods.es_get_autocomplete(es_client, text, f_cb, s_cb);
});
app.post('/get/interesting-tags', function (req, res) {
    var f_cb = function (nothing) {res.json({response:false});};
    var s_cb = function (tags) {res.json({response:true,tags: tags});};

    return f_cb(null);

    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);

    if (user_id === null || secret_id === null) { // 비로그인 사용자가 시도한 경우, /error/404로 리다이렉트
        return f_cb(null);
    }

    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        s_cb(user["interesting_tags"]);
    });
});

/* 회원가입 */
app.post('/register', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function () {return res.json({response:false});};
    var f_cb1 = function () {return res.json({response:false, msg: "wrong_info"});};
    var f_cb2 = function () {return res.json({response:false, msg: "not_verified"});};
    var f_cb3 = function () {return res.json({response:false, msg: "server_error"});};
    var f_cb4 = function () {return res.json({response:false, msg: "no_blog_id"});};
    var s_cb = function () {return res.json({response:true});};
    if (
        req.body.email === undefined ||
        req.body.password === undefined
    ) {
        return f_cb();
    }
    var email = decodeURIComponent(req.body.email);
    var password = decodeURIComponent(req.body.password);
    if (methods.is_email_valid(email) === false || methods.is_password_format_valid(password) !== true) {
        return f_cb();
    }
    var token = randomstring.generate() + randomstring.generate();
    var type = "register";
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    var _id;
    methods.check_email(connected_db, type, email, f_cb3, f_cb, function () {
        password = crypto.createHash('sha256').update(password).digest('base64');
        methods.get_single_transaction(connected_db, {type: type, target: email}, function (nothing) {
            /* source: count of send email */
            methods.insert_transaction(connected_db, {
                type: type
                , source: 0
                , target: email
                , info: {
                    lang: lang
                    , type: type
                    , email: email
                    , password: password
                    , name: ""
                    , token: token
                }
            }, f_cb3, function (doc) {
                _id = doc._id;
                s_cb();
                methods.register_gleant(connected_db, "", email, password, token, function () {}, function () {
                    methods.update_transaction(connected_db, {_id: _id}, { "$set": { "status": "register_done" } }, function (nothing) {}, function (nothing) {
                        methods.send_email(connected_db, lang, type, email, "", token, function (nothing) {}, function (nothing) {
                            methods.remove_transaction(connected_db, {_id: _id}, function (nothing) {}, function (nothing) {});
                        });
                    });
                });
            });
        }, f_cb);
    });
});

/* 비밀번호 재설정 메일 전송 */
app.post('/forgot-password', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res){
    var f_cb = function () {return res.json({response:false});};
    var f_cb1 = function () {return res.json({response:false, msg: "wrong_info"});};
    var f_cb2 = function () {return res.json({response:false, msg: "not_verified"});};
    var f_cb3 = function () {return res.json({response:false, msg: "server_error"});};
    var f_cb4 = function () {return res.json({response:false, msg: "no_blog_id"});};
    var f_cb5 = function () {return res.json({response:false, msg: "already_sent"});};
    var s_cb = function () {return res.json({response:true});};
    if (req.body.email === undefined) {
        return f_cb();
    }
    var email = decodeURIComponent(req.body.email);
    if (methods.is_email_valid(email) === false) {
        return f_cb();
    }
    var token = randomstring.generate() + randomstring.generate();
    var type = "forgot_password";

    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);

    var _id;

    var one_day_before = new Date();
    one_day_before.setHours(one_day_before.getHours() - 24);
    one_day_before = one_day_before.valueOf();

    methods.check_email(connected_db, type, email, f_cb3, f_cb, function (name) {
        methods.get_single_transaction(connected_db, {type: type, target: email}, function (nothing) {
            /* source: count of send email */
            methods.insert_transaction(connected_db, {
                type: type
                , source: 0
                , target: email
                , info: {
                    lang: lang
                    , type: type
                    , email: email
                    , name: name
                    , token: token
                }
            }, f_cb3, function (doc) {
                _id = doc._id;
                s_cb();
                methods.update_token(connected_db, email, token, function () {}, function () {
                    methods.update_transaction(connected_db, {_id: _id}, { "$set": { "status": "token_done" } }, function (nothing) {}, function (nothing) {
                        methods.send_email(connected_db, lang, type, email, name, token, function (nothing) {}, function (nothing) {
                            methods.update_transaction(connected_db, {_id: _id}, { "$set": { "status": "done" }, "$inc": { "source": 1 } }, function (nothing) {}, function (nothing) {});
                        });
                    });
                });
            });
        }, function (doc) {
            if (doc.updated_at < one_day_before) {
                _id = doc._id;
                methods.update_transaction(connected_db, {_id: _id}, {
                    "$set": {
                        "status": "init"
                        , "info": {
                            "lang": lang
                            , "type": type
                            , "email": email
                            , "name": name
                            , "token": token
                        }
                    }
                }, f_cb3, function (nothing) {
                    s_cb();
                    methods.update_token(connected_db, email, token, function () {}, function () {
                        methods.update_transaction(connected_db, {_id: _id}, { "$set": { "status": "token_done" } }, function (nothing) {}, function (nothing) {
                            methods.send_email(connected_db, lang, type, email, name, token, function (nothing) {}, function (nothing) {
                                methods.update_transaction(connected_db, {_id: _id}, { "$set": { "status": "done" }, "$inc": { "source": 1 } }, function (nothing) {}, function (nothing) {});
                            });
                        });
                    });
                });
            } else {
                return f_cb5(null);
            }
        });
    });
});

/* 비밀번호 재설정 */
app.post('/reset-password', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb1 = function () {return res.json({response:false, reason: "error_redirect"});}; // /error/404 로 redirect
    var f_cb2 = function () {return res.json({response:false, reason: "not_valid_password"});};
    var f_cb3 = function () {return res.json({response:false, reason: "wrong_token"});};
    var f_cb4 = function () {return res.json({response:false, reason: "server_error"});};
    var s_cb = function () {return res.json({response:true});}; // /success/reset-password 로 redirect
    if (
        req.body.password === undefined ||
        req.body.token === undefined
    ) {
        return f_cb1();
    }
    var password = decodeURIComponent(req.body.password);
    var token = decodeURIComponent(req.body.token);
    if (methods.is_password_format_valid(password) !== true) {
        return f_cb2();
    }
    methods.check_token(connected_db, token, f_cb3, function () {
        methods.change_password(connected_db, password, token, null, f_cb4, s_cb);
    });
});

/* Gleant 로그인 */
app.post('/login/gleant', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res){
    var f_cb1 = function () {return res.json({response:false, reason: "wrong_info"});};
    var f_cb2 = function () {return res.json({response:false, reason: "not_verified"});};
    var f_cb3 = function () {return res.json({response:false, reason: "not_set_blog_id"});};
    var s_cb = function () {return res.json({response:true});};
    if (
        req.body.email === undefined ||
        req.body.password === undefined
    ) {
        return f_cb1();
    }
    var email = decodeURIComponent(req.body.email);
    var password = decodeURIComponent(req.body.password);
    methods.check_verified(connected_db, email, f_cb1, f_cb2, function () {
        methods.check_user_by_pwd(connected_db, email, password, f_cb1, function (user_id, secret_id, blog_id, is_set_blog_id) {
            if (app.get('env') === 'production') {
                res.cookie(cookie_name["user_id"], user_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                res.cookie(cookie_name["secret_id"], secret_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                res.cookie(cookie_name["blog_id"], blog_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            } else {
                res.cookie(cookie_name["user_id"], user_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                res.cookie(cookie_name["secret_id"], secret_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                res.cookie(cookie_name["blog_id"], blog_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            }
            if (is_set_blog_id === true) {
                return s_cb();
            } else {
                return f_cb3();
            }
        });
    });
});
var register_oauth = function (service, req, res) {
    var f_cb1 = function () {return res.json({response:false, msg: "wrong_info"});};
    var f_cb2 = function () {return res.json({response:false, msg: "not_verified"});};
    var f_cb3 = function () {return res.json({response:false, msg: "server_error"});};
    var f_cb4 = function () {return res.json({response:false, msg: "no_blog_id"});};
    var s_cb = function () {return res.json({response:true});};
    if (
        req.body.oauth_id === undefined ||
        req.body.email === undefined ||
        req.body.name === undefined ||
        req.body.img === undefined ||
        req.body.access_token === undefined
    ) {
        return f_cb1();
    }
    var oauth_id = decodeURIComponent(req.body.oauth_id);
    var email = decodeURIComponent(req.body.email);
    var name = decodeURIComponent(req.body.name);
    var img = decodeURIComponent(req.body.img);
    var access_token = decodeURIComponent(req.body.access_token);
    if (img === "") {
        img = config.aws_s3_url + "/upload/images/00000000/gleant/resized/male.png";
    }
    methods.verify_oauth(service, oauth_id, access_token, f_cb2, function () { // oauth_id와 access_token 확인.
        methods.check_user_by_oauth(connected_db, service, oauth_id, f_cb3, function () { // 사용자 회원가입 확인.
            methods.register_oauth(connected_db, service, name, email, oauth_id, img, f_cb3, function (user_id, secret_id, blog_id, is_set_blog_id) { // 비 회원가입 사용자일 경우, 회원가입 후, 로그인.
                if (app.get('env') === 'production') {
                    res.cookie(cookie_name["user_id"], user_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                    res.cookie(cookie_name["secret_id"], secret_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                    res.cookie(cookie_name["blog_id"], blog_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                } else {
                    res.cookie(cookie_name["user_id"], user_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                    res.cookie(cookie_name["secret_id"], secret_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                    res.cookie(cookie_name["blog_id"], blog_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                }
                if (is_set_blog_id === true) {
                    return s_cb();
                } else {
                    return f_cb4();
                }
            });
        }, function (user_id, secret_id, blog_id, is_set_blog_id) { // 이미 회원가입한 사용자일 경우, 로그인.
            if (app.get('env') === 'production') {
                res.cookie(cookie_name["user_id"], user_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                res.cookie(cookie_name["secret_id"], secret_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                res.cookie(cookie_name["blog_id"], blog_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            } else {
                res.cookie(cookie_name["user_id"], user_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                res.cookie(cookie_name["secret_id"], secret_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                res.cookie(cookie_name["blog_id"], blog_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            }
            if (is_set_blog_id === true) {
                return s_cb();
            } else {
                return f_cb4();
            }
        });
    });
};
var login_oauth = function (service, req, res) {
    var f_cb1 = function () {return res.json({response:false, msg: "wrong_info"});};
    var f_cb2 = function () {return res.json({response:false, msg: "not_verified"});};
    var f_cb3 = function () {return res.json({response:false, msg: "server_error"});};
    var f_cb4 = function () {return res.json({response:false, msg: "no_blog_id"});};
    var f_cb5 = function () {return res.json({response:false, msg: "no_register"});};
    var s_cb = function () {return res.json({response:true});};

    if (
        req.body.oauth_id === undefined ||
        req.body.email === undefined ||
        req.body.name === undefined ||
        req.body.img === undefined ||
        req.body.access_token === undefined
    ) {
        return f_cb1();
    }
    var oauth_id = decodeURIComponent(req.body.oauth_id);
    var access_token = decodeURIComponent(req.body.access_token);
    methods.verify_oauth(service, oauth_id, access_token, f_cb2, function () {
        methods.check_user_by_oauth(connected_db, service, oauth_id, f_cb3, f_cb5, function (user_id, secret_id, blog_id, is_set_blog_id) { // 이미 회원가입한 사용자일 경우, 로그인.
            if (app.get('env') === 'production') {
                res.cookie(cookie_name["user_id"], user_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                res.cookie(cookie_name["secret_id"], secret_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                res.cookie(cookie_name["blog_id"], blog_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            } else {
                res.cookie(cookie_name["user_id"], user_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                res.cookie(cookie_name["secret_id"], secret_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                res.cookie(cookie_name["blog_id"], blog_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
            }
            if (is_set_blog_id === true) {
                return s_cb();
            } else {
                return f_cb4();
            }
        });
    });
};

app.post('/register/kakao', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res){
    register_oauth("kakao", req, res);
});

app.post('/register/facebook', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res){
    register_oauth("facebook", req, res);
});

app.post('/login/kakao', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res){
    login_oauth("kakao", req, res);
});

app.post('/login/facebook', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res){
    login_oauth("facebook", req, res);
});
app.get('/logout', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res){
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["user_id"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        res.cookie(cookie_name["secret_id"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        res.cookie(cookie_name["blog_id"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["user_id"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        res.cookie(cookie_name["secret_id"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        res.cookie(cookie_name["blog_id"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    return res.redirect(301, '/');
});
app.post('/logout', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res){
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["user_id"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        res.cookie(cookie_name["secret_id"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        res.cookie(cookie_name["blog_id"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["user_id"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        res.cookie(cookie_name["secret_id"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        res.cookie(cookie_name["blog_id"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    return res.json({response:true});
});
app.post('/set/news', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var s_cb = function (nothing) {return res.json({response:true});};
    if (req.body.link === undefined) {
        return f_cb(null);
    }
    var link = decodeURIComponent(req.body.link);
    if (app.get('env') === 'production') {
        res.cookie(cookie_name["news_link"], encodeURIComponent(link), {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    } else {
        res.cookie(cookie_name["news_link"], encodeURIComponent(link), {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
    }
    methods.update_news_count(connected_db, link, "view", function () {
        s_cb(null);
        methods.get_single_news(connected_db, {link: link}, function (nothing) {}, function (doc) {
            if (doc.tags && doc.tags.length > 0) {
                return methods.upsert_keywords(connected_db, doc.language, doc.tags, function () {});
            }
        });
    });
});
app.post('/set/blog-id', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb1 = function (nothing) {return res.json({response:false, reason: "error_redirect"});}; // /error/404 로 redirect
    var f_cb2 = function () {return res.json({response:false, reason: "id_exists"});};
    var f_cb3 = function () {return res.json({response:false, reason: "server_error"});};
    var s_cb = function () {return res.json({response:true});};
    if (
        req.body.blog_id === undefined ||
        req.body.name === undefined ||
        req.body.birth_year === undefined ||
        req.body.birth_month === undefined ||
        req.body.birth_day === undefined ||
        req.body.sex === undefined ||
        req.body.main_language === undefined ||
        req.body.available_languages === undefined ||
        req.body.public_authority === undefined
    ) {
        return f_cb1(null);
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb1(null);
    }
    var name = decodeURIComponent(req.body.name);
    var birth_year = decodeURIComponent(req.body.birth_year);
    var birth_month = decodeURIComponent(req.body.birth_month);
    var birth_day = decodeURIComponent(req.body.birth_day);
    var sex = decodeURIComponent(req.body.sex);
    var main_language = "ko"; /*decodeURIComponent(req.body.main_language);*/
    var available_languages = []; /*JSON.parse(decodeURIComponent(req.body.available_languages));*/
    var blog_id = decodeURIComponent(req.body.blog_id)
        , public_authority;
    if (
        blog_id === "agenda" ||
        blog_id === "opinion" ||
        blog_id === "translation" ||
        blog_id === "gallery" ||
        blog_id === "gleantcorp" ||
        blog_id === "image" ||
        blog_id === "article" ||
        blog_id === "guestbook" ||
        blog_id === "blog" ||
        blog_id === "resized" ||
        blog_id === "square" ||
        blog_id === "thumbnail"
    ) {
        return f_cb2();
    }
    if (methods.is_blog_id_format_valid(blog_id) !== true) {
        return f_cb1(null);
    }
    try {
        public_authority = parseInt(decodeURIComponent(req.body.public_authority));
        if (
            public_authority !== 0 &&
            public_authority !== 1 &&
            public_authority !== 2
        ) {
            return f_cb1(null);
        }
    } catch (e) {
        return f_cb1(null);
    }
    try {
        birth_year = parseInt(birth_year);
        birth_month = parseInt(birth_month);
        birth_day = parseInt(birth_day);
        if (
            birth_year > (new Date()).getFullYear() - 7 ||
            birth_year < 1900 ||
            birth_month > 12 ||
            birth_month < 1 ||
            birth_day > 31 ||
            birth_day < 1
        ) {
            return f_cb1(null);
        }
    } catch (err) {
        return f_cb1(null);
    }
    if (
        main_language !== "en" &&
        main_language !== "ja" &&
        main_language !== "ko" &&
        main_language !== "zh-Hans"
    ) {
        return f_cb1(null);
    }
    if (Object.prototype.toString.call(available_languages) !== "[object Array]")  {
        return f_cb1(null);
    }
    for (var i = 0; i < available_languages.length; i++) {
        if (
            available_languages[i] !== "en" &&
            available_languages[i] !== "ja" &&
            available_languages[i] !== "ko" &&
            available_languages[i] !== "zh-Hans"
        ) {
            return f_cb1(null);
        }
    }
    var data = {};
    data.blog_id = blog_id;
    data.name = name;
    data.birth_year = birth_year;
    data.birth_month = birth_month;
    data.birth_day = birth_day;
    data.sex = sex;
    data.main_language = main_language;
    data.available_languages = available_languages;
    data.public_authority = public_authority;
    var img;
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, function (user) { /* 사용자 확인 */
        if (user.verified === false) {
            return f_cb1(null);
        }
        if (user.blog_id !== "") {
            return f_cb1(null);
        } else {
            if (user.img === (config.aws_s3_url + "/upload/images/00000000/gleant/resized/male.png")) {
                if (data.sex === "female") {
                    data.img = config.aws_s3_url + "/upload/images/00000000/gleant/resized/female.png";
                }
            }
            methods.check_blog_id(connected_db, blog_id, false, f_cb2, function () { /* blog_id 존재 여부 확인 */
                methods.set_blog_id(connected_db, lang, user_id, secret_id, data, f_cb3, function () { /* blog_id 생성 */
                    if (app.get('env') === 'production') {
                        res.cookie(cookie_name["user_id"], user_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                        res.cookie(cookie_name["secret_id"], secret_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                        res.cookie(cookie_name["blog_id"], blog_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                    } else {
                        res.cookie(cookie_name["user_id"], user_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                        res.cookie(cookie_name["secret_id"], secret_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                        res.cookie(cookie_name["blog_id"], blog_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                    }
                    s_cb();
                    user.name = data.name;
                    user.blog_name = data.blog_id + " " + i18n[lang].blog;
                    user.birth_year = data.birth_year;
                    user.birth_month = data.birth_month;
                    user.birth_day = data.birth_day;
                    user.sex = data.sex;
                    user.blog_id = data.blog_id;
                    user.main_language = data.main_language;
                    user.available_languages = data.available_languages;
                    user.public_authority = data.public_authority;
                    img = config.aws_s3_url + "/upload/images/00000000/gleant/resized/male.png";
                    if (
                        (user.service !== "gleant") && (user.img !== img)
                    ) {
                        methods.download_image(connected_db, user, false, user.img, true, function () {
                            return es_methods.es_insert_user(connected_db, es_client, user);
                        }, function (pathname, img, thumbnail) {
                            user.img = img;
                            methods.update_profile_image(connected_db, user.blog_id, img, function (nothing) {
                                return es_methods.es_insert_user(connected_db, es_client, user);
                            }, function (nothing) {
                                return es_methods.es_insert_user(connected_db, es_client, user);
                            });
                        });
                    } else {
                        if (data.img !== undefined) {
                            user.img = data.img;
                        }
                        return es_methods.es_insert_user(connected_db, es_client, user);
                    }
                });
            });
        }
    });
});
app.post('/set/specific-info', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb1 = function (nothing) {return res.json({response:false, reason: "error_redirect"});};
    var f_cb2 = function () {return res.json({response:false, reason: "wrong_current_password"});};
    var f_cb3 = function () {return res.json({response:false, reason: "wrong_password_format"});};
    var f_cb4 = function () {return res.json({response:false, reason: "server_error"});};
    var s_cb = function () {return res.json({response:true});};
    if (
        req.body.type === undefined
    ) {
        return f_cb1(null);
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb1(null);
    }
    var type = decodeURIComponent(req.body.type)
        , second = {}
        , current_password
        , new_password;
    /*if (
        type !== "name" &&
        type !== "birth" &&
        type !== "gender" &&
        type !== "languages" &&
        type !== "search_engine" &&
        type !== "reset_password" &&
        type !== "withdrawal"
    ) {
        return f_cb1(null);
    }*/
    if (
        type !== "name" &&
        type !== "birth" &&
        type !== "gender" &&
        type !== "search_engine" &&
        type !== "reset_password" &&
        type !== "withdrawal"
    ) {
        return f_cb1(null);
    }
    second["$set"] = {};
    if (type === "name") {
        if (req.body.name === undefined) {
            return f_cb1(null);
        }
        second["$set"].name = decodeURIComponent(req.body.name);
        if (Object.prototype.toString.call(second["$set"].name) !== "[object String]")  {
            return f_cb1(null);
        }
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, function (user) { /* 사용자 확인 */
            if (user.verified === false) {
                return f_cb1(null);
            }
            if (user.blog_id === "") {
                return f_cb1(null);
            } else {
                methods.update_specific_info(connected_db, user.blog_id, second, f_cb1, function (nothing) {
                    s_cb();
                    user.name = second["$set"].name;
                    methods.change_all_profile_info(connected_db, user.blog_id, "name", user.name, function (nothing) {
                        return es_methods.es_update_user_inline(es_client, {type: "name", blog_id: user.blog_id, name: user.name});
                    }, function (nothing) {
                        return es_methods.es_update_user_inline(es_client, {type: "name", blog_id: user.blog_id, name: user.name});
                    });
                });
            }
        });
    } else if (type === "birth") {
        if (
            req.body.birth_year === undefined ||
            req.body.birth_month === undefined ||
            req.body.birth_day === undefined
        ) {
            return f_cb1(null);
        }
        second["$set"].birth_year = decodeURIComponent(req.body.birth_year);
        second["$set"].birth_month = decodeURIComponent(req.body.birth_month);
        second["$set"].birth_day = decodeURIComponent(req.body.birth_day);
        try {
            second["$set"].birth_year = parseInt(second["$set"].birth_year);
            second["$set"].birth_month = parseInt(second["$set"].birth_month);
            second["$set"].birth_day = parseInt(second["$set"].birth_day);
            if (
                second["$set"].birth_year > (new Date()).getFullYear() - 7 ||
                second["$set"].birth_year < 1900 ||
                second["$set"].birth_month > 12 ||
                second["$set"].birth_month < 1 ||
                second["$set"].birth_day > 31 ||
                second["$set"].birth_day < 1
            ) {
                return f_cb1(null);
            }
        } catch (err) {
            return f_cb1(null);
        }
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, function (user) { /* 사용자 확인 */
            if (user.verified === false) {
                return f_cb1(null);
            }
            if (user.blog_id === "") {
                return f_cb1(null);
            } else {
                methods.update_specific_info(connected_db, user.blog_id, second, f_cb1, function (nothing) {
                    s_cb();
                    user.birth_year = second["$set"].birth_year;
                    user.birth_month = second["$set"].birth_month;
                    user.birth_day = second["$set"].birth_day;
                    return es_methods.es_update_user(connected_db, es_client, user);
                });
            }
        });
    } else if (type === "gender") {
        if (req.body.sex === undefined) {
            return f_cb1(null);
        }
        second["$set"].sex = decodeURIComponent(req.body.sex);
        if (Object.prototype.toString.call(second["$set"].sex) !== "[object String]")  {
            return f_cb1(null);
        }
        if (
            second["$set"].sex !== "male" &&
            second["$set"].sex !== "female"
        ) {
            return f_cb1(null);
        }
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, function (user) { /* 사용자 확인 */
            if (user.verified === false) {
                return f_cb1(null);
            }
            if (user.blog_id === "") {
                return f_cb1(null);
            } else {
                if (second["$set"].sex === user.sex) {
                    return s_cb();
                }
                if (
                    user.img === (config.aws_s3_url + "/upload/images/00000000/gleant/resized/male.png") &&
                    user.sex === "male"
                ) {
                    if (second["$set"].sex === "female") {
                        second["$set"].img = config.aws_s3_url + "/upload/images/00000000/gleant/resized/female.png";
                    }
                } else if (
                    user.img === (config.aws_s3_url + "/upload/images/00000000/gleant/resized/female.png") &&
                    user.sex === "female"
                ) {
                    if (second["$set"].sex === "male") {
                        second["$set"].img = config.aws_s3_url + "/upload/images/00000000/gleant/resized/male.png";
                    }
                }
                methods.update_specific_info(connected_db, user.blog_id, second, f_cb1, function (nothing) {
                    s_cb();
                    user.sex = second["$set"].sex;
                    if (second["$set"].img !== undefined) {
                        user.img = second["$set"].img;
                        methods.change_all_profile_info(connected_db, user.blog_id, "img", user.img, function (nothing) {
                            es_methods.es_update_user_inline(es_client, {type: "img", blog_id: user.blog_id, img: user.img});
                            return es_methods.es_update_user(connected_db, es_client, user);
                        }, function (nothing) {
                            es_methods.es_update_user_inline(es_client, {type: "img", blog_id: user.blog_id, img: user.img});
                            return es_methods.es_update_user(connected_db, es_client, user);
                        });
                    } else {
                        return es_methods.es_update_user(connected_db, es_client, user);
                    }
                });
            }
        });
    } else if (type === "languages") {
        if (
            req.body.main_language === undefined ||
            req.body.available_languages === undefined
        ) {
            return f_cb1(null);
        }
        second["$set"].main_language = decodeURIComponent(req.body.main_language);
        second["$set"].available_languages = JSON.parse(decodeURIComponent(req.body.available_languages));
        if (
            Object.prototype.toString.call(second["$set"].main_language) !== "[object String]" ||
            Object.prototype.toString.call(second["$set"].available_languages) !== "[object Array]"
        )  {
            return f_cb1(null);
        }
        if (
            second["$set"].main_language !== "en" &&
            second["$set"].main_language !== "ja" &&
            second["$set"].main_language !== "ko" &&
            second["$set"].main_language !== "zh-Hans"
        ) {
            return f_cb1(null);
        }
        for (var i = 0; i < second["$set"].available_languages.length; i++) {
            if (
                second["$set"].available_languages[i] !== "en" &&
                second["$set"].available_languages[i] !== "ja" &&
                second["$set"].available_languages[i] !== "ko" &&
                second["$set"].available_languages[i] !== "zh-Hans"
            ) {
                return f_cb1(null);
            }
        }
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, function (user) { /* 사용자 확인 */
            if (user.verified === false) {
                return f_cb1(null);
            }
            if (user.blog_id === "") {
                return f_cb1(null);
            } else {
                methods.update_specific_info(connected_db, user.blog_id, second, f_cb1, function (nothing) {
                    s_cb();
                    user.main_language = second["$set"].main_language;
                    user.available_languages = second["$set"].available_languages;
                    return es_methods.es_update_user(connected_db, es_client, user);
                });
            }
        });
    } else if (type === "search_engine") {
        if (req.body.public_authority === undefined) {
            return f_cb1(null);
        }
        try {
            second["$set"].public_authority = parseInt(decodeURIComponent(req.body.public_authority));
            if (
                second["$set"].public_authority !== 0 &&
                second["$set"].public_authority !== 1 &&
                second["$set"].public_authority !== 2
            ) {
                return f_cb1(null);
            }
        } catch (e) {
            return f_cb1(null);
        }
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, function (user) { /* 사용자 확인 */
            if (user.verified === false) {
                return f_cb1(null);
            }
            if (user.blog_id === "") {
                return f_cb1(null);
            } else {
                methods.update_specific_info(connected_db, user.blog_id, second, f_cb1, function (nothing) {
                    s_cb();
                    user.public_authority = second["$set"].public_authority;
                    return es_methods.es_update_user(connected_db, es_client, user);
                });
            }
        });
    } else if (type === "reset_password") {
        if (
            req.body.current_password === undefined ||
            req.body.new_password === undefined
        ) {
            return f_cb1(null);
        }
        current_password = decodeURIComponent(req.body.current_password);
        new_password = decodeURIComponent(req.body.new_password);
        if (
            Object.prototype.toString.call(current_password) !== "[object String]" ||
            Object.prototype.toString.call(new_password) !== "[object String]"
        )  {
            return f_cb1(null);
        }
        if (methods.is_password_format_valid(current_password) !== true) {
            return f_cb2();
        }
        if (methods.is_password_format_valid(new_password) !== true) {
            return f_cb3();
        }
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, function (user) { /* 사용자 확인 */
            if (user.verified === false) {
                return f_cb1(null);
            }
            if (user.blog_id === "") {
                return f_cb1(null);
            } else {
                methods.change_password(connected_db, new_password, null, user.blog_id, f_cb4, function (secret_id) {
                    if (app.get('env') === 'production') {
                        res.cookie(cookie_name["user_id"], user._id.toString(), {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                        res.cookie(cookie_name["secret_id"], secret_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                        res.cookie(cookie_name["blog_id"], user.blog_id, {domain: '.gleant.com', maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                    } else {
                        res.cookie(cookie_name["user_id"], user._id.toString(), {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                        res.cookie(cookie_name["secret_id"], secret_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                        res.cookie(cookie_name["blog_id"], user.blog_id, {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                    }
                    return s_cb();
                });
            }
        });
    } else if (type === "withdrawal") {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, function (user) {
            if (user.verified === false) {
                return f_cb1(null);
            }
            if (user.blog_id === "") {
                return f_cb1(null);
            } else {
                methods.remove_user(connected_db, user.blog_id, f_cb1, function (nothing) {
                    if (app.get('env') === 'production') {
                        res.cookie(cookie_name["user_id"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                        res.cookie(cookie_name["secret_id"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                        res.cookie(cookie_name["blog_id"], '', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                    } else {
                        res.cookie(cookie_name["user_id"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                        res.cookie(cookie_name["secret_id"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                        res.cookie(cookie_name["blog_id"], '', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
                    }
                    s_cb();
                    es_methods.es_remove_document(es_client, user);
                    return methods.remove_user_es(connected_db, user.blog_id);
                });
            }
        });
    }
});
app.post('/set/interesting-tags', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb1 = function (doc) {return res.json({response:false});};
    var f_cb2 = function () {return res.json({response:false});};
    var s_cb = function (blog_id) {return res.json({response:true, blog_id: blog_id});};
    return f_cb1(null);
    if (
        req.body.interesting_tags === undefined
    ) {
        return f_cb1(null);
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb1(null);
    }
    var interesting_tags = JSON.parse(decodeURIComponent(req.body.interesting_tags));
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, function (user) { /* 사용자 확인 */
        methods.set_interesting_tags(connected_db, user_id, secret_id, interesting_tags, f_cb2, function () {
            s_cb(user["blog_id"]);
            user.interesting_tags = interesting_tags;
            es_methods.es_update_user(connected_db,es_client, user);
        });
    });
});
app.post('/insert/link', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function () {return res.json({response:false});};
    var s_cb = function (obj) { obj["response"] = true; return res.json(obj);};
    if (req.body.link === undefined) {
        return f_cb();
    }
    var link = decodeURIComponent(req.body.link);
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb();
    }
    if (user_id === "" || secret_id === "") {
        return f_cb();
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
            if (user.verified === false) {
                return res.json({response:false});
            }
            if (user.blog_id === "") {
                return res.json({response:false});
            }
            methods.get_link(connected_db, link, function () {
                methods.insert_link(connected_db, link, function (nothing) {
                    return f_cb();
                }, s_cb);
            }, s_cb);
        });
    }
});
app.post('/insert/vote', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var s_cb = function (_id) {return res.json({_id:_id, response:true});};
    var data={};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.type === undefined ||
        req.body.question === undefined ||
        req.body.choice_list === undefined ||
        req.body.is_secret === undefined ||
        req.body.is_finish_set === undefined ||
        req.body.finish_at === undefined
    ) {
        return f_cb(null);
    }
    data.type = decodeURIComponent(req.body.type);
    data.question = decodeURIComponent(req.body.question);
    data.choice_list = JSON.parse(decodeURIComponent(req.body.choice_list));
    data.is_secret = decodeURIComponent(req.body.is_secret);
    data.is_secret = data.is_secret === 'true';
    data.is_finish_set = decodeURIComponent(req.body.is_finish_set);
    data.is_finish_set = data.is_finish_set === 'true';
    if (
        data.type !== "limited" &&
        data.type !== "unlimited"
    ) {
        return f_cb(null);
    }
    if (data.type === "unlimited") {
        if (data.is_finish_set === true) {
            data.finish_at = decodeURIComponent(req.body.finish_at);
            try {
                data.finish_at = parseInt(data.finish_at);
                var date = new Date();
                var temp = date.valueOf();
                if (data.finish_at < temp) {
                    return f_cb(null);
                }
                date.setFullYear(date.getFullYear() + 6);
                temp = date.valueOf();
                if (data.finish_at > temp || data.finish_at > DATE_MAX_VALUE) {
                    return f_cb(null);
                }
            } catch (e) {
                return f_cb(null);
            }
        } else {
            data.finish_at = DATE_MAX_VALUE;
        }
    } else { /* data.type === limited */
        data.is_finish_set = false;
        data.finish_at = DATE_MAX_VALUE;
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return f_cb(null);
        }
        data.blog_id = user.blog_id;
        methods.insert_vote(connected_db, data, f_cb, s_cb);
    });
});
app.post('/push/voter', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var s_cb = function (nothing) {return res.json({response:true});};
    var _id
        , choice_id
        , is_choice_id_valid = false
        , data = {}
        , now = new Date();
    if (req.body._id === undefined ||
        req.body.choice_id === undefined) {
        return f_cb(null);
    }
    _id = decodeURIComponent(req.body._id);
    choice_id = decodeURIComponent(req.body.choice_id);
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) { /* 로그인 사용자일 경우 */
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return f_cb(null);
        }
        methods.get_single_vote(connected_db, {
                _id: _id
                , blog_id: user.blog_id
            }, "vote",
            function (nothing) { /* 투표한 사용자가 아닐 경우 */
                /* Check existance of document */
                methods.get_single_vote(connected_db, {_id: _id}, "exist"
                    , function (nothing) { /* When vote does not exist */
                        return f_cb(null);
                    }, function (doc) { /* When vote exists */

                        data.first = {};
                        data.first["_id"] = _id;
                        data.first["choice_list._id"] = choice_id;
                        data.second = {};

                        data.second["$addToSet"] = {};
                        data.second["$addToSet"]["voters"] = user.blog_id;
                        data.second["$inc"] = {};
                        data.second["$inc"]["choice_list.$.count"] = 1;
                        data.second["$addToSet"]["choice_list.$.voters"] = user.blog_id;

                        /* Check time first */
                        if (doc.service_type === "") {
                            return f_cb(null);
                        } else {
                            for (var i = 0; i < doc.choice_list.length; i++) {
                                if (doc.choice_list[i]._id === choice_id) {
                                    is_choice_id_valid = true;
                                }
                            }

                            if (is_choice_id_valid === false) {
                                return f_cb(null);
                            }

                            if (doc.service_type === "debate") {
                                methods.get_single_agenda(connected_db, user, {_id: doc.root_id}, "public", "perfect"
                                    , function (nothing) {
                                        return f_cb(null);
                                    }, function (agenda) {
                                        if (agenda.is_start_set === true) {
                                            if (agenda.start_at > now.valueOf()) { /* Scheduled */
                                                return f_cb(null);
                                            } else {
                                                if (agenda.is_finish_set === true) {
                                                    if (agenda.finish_at > now.valueOf()) { /* In Progress */
                                                        return methods.push_voter(connected_db, data, f_cb, s_cb);
                                                    } else { /* Finished */
                                                        return f_cb(null);
                                                    }
                                                } else { /* Unlimited */
                                                    return methods.push_voter(connected_db, data, f_cb, s_cb);
                                                }
                                            }
                                        } else {
                                            if (agenda.is_finish_set === true) {
                                                if (agenda.finish_at > now.valueOf()) { /* In Progress */
                                                    return methods.push_voter(connected_db, data, f_cb, s_cb);
                                                } else { /* Finished */
                                                    return f_cb(null);
                                                }
                                            } else { /* Unlimited */
                                                return methods.push_voter(connected_db, data, f_cb, s_cb);
                                            }
                                        }
                                    });
                            } else if (doc.service_type === "blog") {
                                if (doc.is_finish_set === true) {
                                    if (doc.finish_at > now.valueOf()) { /* In Progress */
                                        if (doc.public_authority === 1) {
                                            return methods.push_voter(connected_db, data, f_cb, s_cb);
                                        } else {
                                            if (doc.public_authority === 2) {
                                                if (doc.blog_id === user.blog_id) {
                                                    return methods.push_voter(connected_db, data, f_cb, s_cb);
                                                } else {
                                                    methods.is_friend(connected_db, user.blog_id, doc.blog_id
                                                        , function () {
                                                            return f_cb(null);
                                                        }, function () {
                                                            return methods.push_voter(connected_db, data, f_cb, s_cb);
                                                        });
                                                }
                                            } else if (doc.public_authority === 0) {
                                                if (doc.blog_id === user.blog_id) {
                                                    return methods.push_voter(connected_db, data, f_cb, s_cb);
                                                } else {
                                                    return f_cb(null);
                                                }
                                            } else {
                                                return f_cb(null);
                                            }
                                        }
                                    } else { /* Finished */
                                        return f_cb(null);
                                    }
                                } else {  /* Unlimited */
                                    if (doc.public_authority === 1) {
                                        return methods.push_voter(connected_db, data, f_cb, s_cb);
                                    } else {
                                        if (doc.public_authority === 2) {
                                            if (doc.blog_id === user.blog_id) {
                                                return methods.push_voter(connected_db, data, f_cb, s_cb);
                                            } else {
                                                methods.is_friend(connected_db, user.blog_id, doc.blog_id
                                                    , function () {
                                                        return f_cb(null);
                                                    }, function () {
                                                        return methods.push_voter(connected_db, data, f_cb, s_cb);
                                                    });
                                            }
                                        } else if (doc.public_authority === 0) {
                                            if (doc.blog_id === user.blog_id) {
                                                return methods.push_voter(connected_db, data, f_cb, s_cb);
                                            } else {
                                                return f_cb(null);
                                            }
                                        } else {
                                            return f_cb(null);
                                        }
                                    }
                                }
                            } else {
                                return f_cb(null);
                            }
                        }
                    });
            }, function (doc) { /* 투표한 사용자일 경우 */
                return f_cb(null);
            });
    });
});
app.post('/insert/apply_now', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var data={}
        , date
        , temp;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.public_authority === undefined ||
        req.body.is_online_interview_set === undefined ||
        req.body.language === undefined ||
        req.body.company === undefined ||
        req.body.logo === undefined ||
        req.body.business_type === undefined ||
        req.body.country === undefined ||
        req.body.city === undefined ||
        req.body.protocol === undefined ||
        req.body.url === undefined ||
        req.body.job === undefined ||
        req.body.employment_status === undefined ||
        req.body.decide_salary_later === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined ||
        req.body.tags === undefined
    ) {
        return f_cb(null);
    }
    var content = decodeURIComponent(req.body.content);
    data["type"] = "apply_now";
    data["public_authority"] = decodeURIComponent(req.body.public_authority);
    data["is_online_interview_set"] = decodeURIComponent(req.body.is_online_interview_set) === "true";
    data["language"] = "ko"; /*decodeURIComponent(req.body.language);*/
    data["company"] = decodeURIComponent(req.body.company);
    data["logo"] = decodeURIComponent(req.body.logo);
    data["business_type"] = decodeURIComponent(req.body.business_type);
    data["country"] = decodeURIComponent(req.body.country);
    data["city"] = decodeURIComponent(req.body.city);
    data["protocol"] = decodeURIComponent(req.body.protocol);
    data["url"] = decodeURIComponent(req.body.url);
    data["job"] = decodeURIComponent(req.body.job);
    data["employment_status"] = decodeURIComponent(req.body.employment_status);
    data["decide_salary_later"] = decodeURIComponent(req.body.decide_salary_later) === "true";
    data["title"] = decodeURIComponent(req.body.title).trim().replace(/\s\s+/gi, ' ');
    data["content"] = content;
    data["tags"] = JSON.parse(decodeURIComponent(req.body.tags));
    if (data["is_online_interview_set"] === true) {
        if (
            req.body.application_authority === undefined ||
            req.body.is_start_set === undefined ||
            req.body.start_at === undefined ||
            req.body.finish_at === undefined ||
            req.body.questions === undefined
        ) {
            return f_cb(null);
        }
        data["application_authority"] = decodeURIComponent(req.body.application_authority);
        data["is_start_set"] = decodeURIComponent(req.body.is_start_set) === "true";
        data["start_at"] = decodeURIComponent(req.body.start_at);
        data["is_finish_set"] = true;
        data["finish_at"] = decodeURIComponent(req.body.finish_at);
        data["questions"] = JSON.parse(decodeURIComponent(req.body.questions));
    } else {
        data["application_authority"] = 1;
        data["is_start_set"] = false;
        data["start_at"] = 0;
        data["is_finish_set"] = false;
        data["finish_at"] = DATE_MAX_VALUE;
        data["questions"] = [];
    }
    if (data["decide_salary_later"] === false) {
        if (
            req.body.salary_period === undefined ||
            req.body.salary === undefined ||
            req.body.salary_unit === undefined
        ) {
            return f_cb(null);
        }
        data["salary_period"] = decodeURIComponent(req.body.salary_period);
        data["salary"] = decodeURIComponent(req.body.salary);
        data["salary_unit"] = decodeURIComponent(req.body.salary_unit);
    } else {
        data["salary_period"] = "year";
        data["salary"] = 0;
        data["salary_unit"] = "USD";
    }
    /* Check Type - String */
    if (
        (Object.prototype.toString.call(data["language"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["company"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["logo"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["business_type"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["country"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["city"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["protocol"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["url"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["job"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["employment_status"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["title"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["content"]) !== "[object String]")
    ) {
        return f_cb(null);
    }
    if (data["logo"] === "") {
        data["logo"] = config.aws_s3_url + "/upload/images/00000000/gleant/resized/question.png";
    } else {
        var parsed_url = url.parse(data["logo"]);
        if (
            parsed_url.protocol !== 'https:' ||
            parsed_url.host !== 'images.gleant.com'
        ) {
            return f_cb(null);
        }
    }
    if (data["decide_salary_later"] === false) {
        if (
            (Object.prototype.toString.call(data["salary_period"]) !== "[object String]") ||
            (Object.prototype.toString.call(data["salary_unit"]) !== "[object String]")
        ) {
            return f_cb(null);
        }
    }
    /* Check Type - Array */
    if (Object.prototype.toString.call(data["tags"]) !== "[object Array]") {
        return f_cb(null);
    }
    if (data["is_online_interview_set"] === true) {
        if (Object.prototype.toString.call(data["questions"]) !== "[object Array]") {
            return f_cb(null);
        }
    }
    /* Check Type - Number */
    try {
        data["public_authority"] = parseInt(data["public_authority"]);
        if (
            data["public_authority"] !== 1 &&
            data["public_authority"] !== 2
        ) {
            return f_cb(null);
        }
        if (data["is_online_interview_set"] === true) {
            data["application_authority"] = parseInt(data["application_authority"]);
            if (
                data["application_authority"] !== 1 &&
                data["application_authority"] !== 2
            ) {
                return f_cb(null);
            }
            if (data["is_start_set"] === false) {
                data["start_at"] = new Date().valueOf();
            } else {
                data["start_at"] = parseInt(data["start_at"]);
                date = new Date();
                temp = date.valueOf();
                if (data["start_at"] < temp) {
                    data["start_at"] = temp;
                } else {
                    date.setMonth(date.getMonth() + 4);
                    temp = date.valueOf();
                    if (data["start_at"] > temp || data["start_at"] > DATE_MAX_VALUE) {
                        return f_cb(null);
                    }
                }
            }
            data["finish_at"] = parseInt(data["finish_at"]);
            date = new Date();
            temp = date.valueOf();
            if (data["finish_at"] < temp) {
                return f_cb(null);
            }
            date.setMonth(date.getMonth() + 4);
            temp = date.valueOf();
            if (data["finish_at"] > temp || data["finish_at"] > DATE_MAX_VALUE) {
                return f_cb(null);
            }
            if (data["start_at"] > data["finish_at"]) {
                return f_cb(null);
            }
        }
        if (data["decide_salary_later"] === false) {
            data["salary"] = parseFloat(data["salary"]);
            if ( data["salary"] < 0 ) {
                return f_cb(null);
            }
        }
    } catch (e) {
        return f_cb(null);
    }
    if (
        data["language"] !== "en" &&
        data["language"] !== "ja" &&
        data["language"] !== "ko" &&
        data["language"] !== "zh-Hans"
    ) {
        return f_cb(null);
    }
    if (
        data["protocol"] !== "http" &&
        data["protocol"] !== "https"
    ) {
        return f_cb(null);
    }
    if (
        data["employment_status"] !== "full_time" &&
        data["employment_status"] !== "part_time" &&
        data["employment_status"] !== "contract" &&
        data["employment_status"] !== "intern"
    ) {
        return f_cb(null);
    }
    if (data["decide_salary_later"] === false) {
        if (
            data["salary_period"] !== "year" &&
            data["salary_period"] !== "month" &&
            data["salary_period"] !== "hour"
        ) {
            return f_cb(null);
        }
        var is_unit_correct = false;
        for (var i = 0; i < monetary_units.length; i++) {
            if (monetary_units[i].unit === data["salary_unit"]) {
                is_unit_correct = true;
            }
        }
        if (is_unit_correct === false) {
            return f_cb(null);
        }
    }
    for (var i = 0; i < data["tags"].length; i++) {
        if (Object.prototype.toString.call(data["tags"][i]) !== "[object String]") {
            return f_cb(null);
        }
        data["tags"][i] = data["tags"][i].replace(/\s+/gi, '').toLowerCase();
        if (data["tags"][i] === "") {
            return f_cb(null);
        }
    }
    var questions = []
        , choices = [];
    /* Check online interview questions */
    if (data["is_online_interview_set"] === true) {
        if (data["questions"].length < 1) {
            return f_cb(null);
        }
        for (var i = 0; i < data["questions"].length; i++) {
            if (data["questions"][i].type === "short_answer") {
                if (
                    data["questions"][i].question === "undefined" ||
                    data["questions"][i].max_length === "undefined"
                ) {
                    return f_cb(null);
                }
                if (Object.prototype.toString.call(data["questions"][i].question) !== "[object String]") {
                    return f_cb(null);
                }
                if (Object.prototype.toString.call(data["questions"][i].max_length) !== "[object Number]") {
                    return f_cb(null);
                }
                if (
                    (data["questions"][i].max_length % 100 !== 0) ||
                    (data["questions"][i].max_length < 0) ||
                    (data["questions"][i].max_length > 1000)
                ) {
                    return f_cb(null);
                }
                questions.push({
                    _id: randomstring.generate(6)
                    , type: data["questions"][i].type
                    , question: data["questions"][i].question
                    , max_length: data["questions"][i].max_length
                });
            } else if (data["questions"][i].type === "multiple_choice"){
                if (
                    data["questions"][i].question === "undefined" ||
                    data["questions"][i].choices === "undefined"
                ) {
                    return f_cb(null);
                }
                if (Object.prototype.toString.call(data["questions"][i].question) !== "[object String]") {
                    return f_cb(null);
                }
                if (Object.prototype.toString.call(data["questions"][i].choices) !== "[object Array]") {
                    return f_cb(null);
                }
                choices = [];
                for (var j = 0; j < data["questions"][i].choices.length; j++) {
                    if (Object.prototype.toString.call(data["questions"][i].choices[j]) !== "[object String]") {
                        return f_cb(null);
                    }
                    choices.push({
                        _id: randomstring.generate(6)
                        , choice: data["questions"][i].choices[j]
                    });
                }
                if (data["questions"][i].choices.length < 2) {
                    return f_cb(null);
                }
                questions.push({
                    _id: randomstring.generate(6)
                    , type: data["questions"][i].type
                    , question: data["questions"][i].question
                    , choices: choices
                });
            } else {
                return f_cb(null);
            }
        }
        data["questions"] = questions;
    }
    if (
        data["public_authority"] === 2 ||
        data["is_online_interview_set"] === false
    ) {
        data["application_authority"] = data["public_authority"];
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        methods.insert_employment(connected_db, data, user, f_cb, function (pathname, created_obj) {
            res.json({response:true, pathname:pathname});
            return es_methods.es_insert_employment(connected_db, es_client, created_obj);
        });
    });
});
app.post('/insert/hire_me', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var data={}
        , date
        , temp;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);

    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.public_authority === undefined ||
        req.body.language === undefined ||
        req.body.job === undefined ||
        req.body.employment_status === undefined ||
        req.body.decide_salary_later === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined ||
        req.body.tags === undefined
    ) {
        return f_cb(null);
    }
    var content = decodeURIComponent(req.body.content);
    data["type"] = "hire_me";
    data["public_authority"] = decodeURIComponent(req.body.public_authority);
    data["language"] = "ko";/*decodeURIComponent(req.body.language);*/
    data["job"] = decodeURIComponent(req.body.job);
    data["employment_status"] = decodeURIComponent(req.body.employment_status);
    data["decide_salary_later"] = decodeURIComponent(req.body.decide_salary_later) === "true";
    data["title"] = decodeURIComponent(req.body.title).trim().replace(/\s\s+/gi, ' ');
    data["content"] = content;
    data["tags"] = JSON.parse(decodeURIComponent(req.body.tags));
    if (data["decide_salary_later"] === false) {
        if (
            req.body.salary_period === undefined ||
            req.body.salary === undefined ||
            req.body.salary_unit === undefined
        ) {
            return f_cb(null);
        }
        data["salary_period"] = decodeURIComponent(req.body.salary_period);
        data["salary"] = decodeURIComponent(req.body.salary);
        data["salary_unit"] = decodeURIComponent(req.body.salary_unit);
    } else {
        data["salary_period"] = "year";
        data["salary"] = 0;
        data["salary_unit"] = "USD";
    }
    /* Check Type - String */
    if (
        (Object.prototype.toString.call(data["language"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["job"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["employment_status"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["title"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["content"]) !== "[object String]")
    ) {
        return f_cb(null);
    }
    if (data["decide_salary_later"] === false) {
        if (
            (Object.prototype.toString.call(data["salary_period"]) !== "[object String]") ||
            (Object.prototype.toString.call(data["salary_unit"]) !== "[object String]")
        ) {
            return f_cb(null);
        }
    }
    /* Check Type - Array */
    if (Object.prototype.toString.call(data["tags"]) !== "[object Array]") {
        return f_cb(null);
    }
    /* Check Type - Number */
    try {
        data["public_authority"] = parseInt(data["public_authority"]);
        if (
            data["public_authority"] !== 1 &&
            data["public_authority"] !== 2
        ) {
            return f_cb(null);
        }

        if (data["decide_salary_later"] === false) {
            data["salary"] = parseFloat(data["salary"]);
            if ( data["salary"] < 0 ) {
                return f_cb(null);
            }
        }
    } catch (e) {
        return f_cb(null);
    }
    if (
        data["language"] !== "en" &&
        data["language"] !== "ja" &&
        data["language"] !== "ko" &&
        data["language"] !== "zh-Hans"
    ) {
        return f_cb(null);
    }
    if (
        data["employment_status"] !== "full_time" &&
        data["employment_status"] !== "part_time" &&
        data["employment_status"] !== "contract" &&
        data["employment_status"] !== "intern"
    ) {
        return f_cb(null);
    }
    if (data["decide_salary_later"] === false) {
        if (
            data["salary_period"] !== "year" &&
            data["salary_period"] !== "month" &&
            data["salary_period"] !== "hour"
        ) {
            return f_cb(null);
        }
        var is_unit_correct = false;
        for (var i = 0; i < monetary_units.length; i++) {
            if (monetary_units[i].unit === data["salary_unit"]) {
                is_unit_correct = true;
            }
        }
        if (is_unit_correct === false) {
            return f_cb(null);
        }
    }
    for (var i = 0; i < data["tags"].length; i++) {
        if (Object.prototype.toString.call(data["tags"][i]) !== "[object String]") {
            return f_cb(null);
        }
        data["tags"][i] = data["tags"][i].replace(/\s+/gi, '').toLowerCase();
        if (data["tags"][i] === "") {
            return f_cb(null);
        }
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        methods.insert_employment(connected_db, data, user, f_cb, function (pathname, created_obj) {
            res.json({response:true, pathname:pathname});
            return es_methods.es_insert_employment(connected_db, es_client, created_obj);
        });
    });
});
app.post('/update/apply_now', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var first={}
        , second={}
        , updated_obj = {}
        , data={}
        , date
        , temp
        , now
        , ten_s_b4_start
        , is_online_interview_time = false;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body._id === undefined ||
        req.body.public_authority === undefined ||
        req.body.is_online_interview_set === undefined ||
        req.body.language === undefined ||
        req.body.company === undefined ||
        req.body.logo === undefined ||
        req.body.business_type === undefined ||
        req.body.country === undefined ||
        req.body.city === undefined ||
        req.body.protocol === undefined ||
        req.body.url === undefined ||
        req.body.job === undefined ||
        req.body.employment_status === undefined ||
        req.body.decide_salary_later === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined ||
        req.body.tags === undefined
    ) {
        return f_cb(null);
    }
    var content = decodeURIComponent(req.body.content);
    updated_obj["_id"] = first["_id"] = decodeURIComponent(req.body._id);
    updated_obj["type"] = first["type"] = "apply_now";
    first["is_removed"] = false;
    second["$set"] = {};
    updated_obj["public_authority"] = second["$set"]["public_authority"] = decodeURIComponent(req.body.public_authority);
    updated_obj["is_online_interview_set"] = second["$set"]["is_online_interview_set"] = decodeURIComponent(req.body.is_online_interview_set) === "true";
    updated_obj["language"] = second["$set"]["language"] = "ko"; /*decodeURIComponent(req.body.language);*/
    updated_obj["company"] = second["$set"]["company"] = decodeURIComponent(req.body.company);
    updated_obj["logo"] = second["$set"]["logo"] = decodeURIComponent(req.body.logo);
    updated_obj["business_type"] = second["$set"]["business_type"] = decodeURIComponent(req.body.business_type);
    updated_obj["country"] = second["$set"]["country"] = decodeURIComponent(req.body.country);
    updated_obj["city"] = second["$set"]["city"] = decodeURIComponent(req.body.city);
    updated_obj["protocol"] = second["$set"]["protocol"] = decodeURIComponent(req.body.protocol);
    updated_obj["url"] = second["$set"]["url"] = decodeURIComponent(req.body.url);
    updated_obj["job"] = second["$set"]["job"] = decodeURIComponent(req.body.job);
    updated_obj["employment_status"] = second["$set"]["employment_status"] = decodeURIComponent(req.body.employment_status);
    updated_obj["decide_salary_later"] = second["$set"]["decide_salary_later"] = decodeURIComponent(req.body.decide_salary_later) === "true";
    updated_obj["title"] = second["$set"]["title"] = decodeURIComponent(req.body.title).trim().replace(/\s\s+/gi, ' ');
    updated_obj["content"] = second["$set"]["content"] = content;
    updated_obj["tags"] = second["$set"]["tags"] = JSON.parse(decodeURIComponent(req.body.tags));
    if (second["$set"]["is_online_interview_set"] === true) {
        if (
            req.body.application_authority === undefined ||
            req.body.is_start_set === undefined ||
            req.body.start_at === undefined ||
            req.body.finish_at === undefined ||
            req.body.questions === undefined
        ) {
            return f_cb(null);
        }
        updated_obj["application_authority"] = second["$set"]["application_authority"] = decodeURIComponent(req.body.application_authority);
        updated_obj["is_start_set"] = second["$set"]["is_start_set"] = decodeURIComponent(req.body.is_start_set) === "true";
        updated_obj["start_at"] = second["$set"]["start_at"] = decodeURIComponent(req.body.start_at);
        updated_obj["is_finish_set"] = second["$set"]["is_finish_set"] = true;
        updated_obj["finish_at"] = second["$set"]["finish_at"] = decodeURIComponent(req.body.finish_at);
        updated_obj["questions"] = second["$set"]["questions"] = JSON.parse(decodeURIComponent(req.body.questions));
    } else {
        updated_obj["application_authority"] = second["$set"]["application_authority"] = 1;
        updated_obj["is_start_set"] = second["$set"]["is_start_set"] = false;
        updated_obj["start_at"] = second["$set"]["start_at"] = new Date().valueOf();
        updated_obj["is_finish_set"] = second["$set"]["is_finish_set"] = false;
        updated_obj["finish_at"] = second["$set"]["finish_at"] = DATE_MAX_VALUE;
        updated_obj["questions"] = second["$set"]["questions"] = [];
    }

    if (second["$set"]["decide_salary_later"] === false) {
        if (
            req.body.salary_period === undefined ||
            req.body.salary === undefined ||
            req.body.salary_unit === undefined
        ) {
            return f_cb(null);
        }
        updated_obj["salary_period"] = second["$set"]["salary_period"] = decodeURIComponent(req.body.salary_period);
        updated_obj["salary"] = second["$set"]["salary"] = decodeURIComponent(req.body.salary);
        updated_obj["salary_unit"] = second["$set"]["salary_unit"] = decodeURIComponent(req.body.salary_unit);
    } else {
        updated_obj["salary_period"] = second["$set"]["salary_period"] = "year";
        updated_obj["salary"] = second["$set"]["salary"] = 0;
        updated_obj["salary_unit"] = second["$set"]["salary_unit"] = "USD";
    }
    /**
     * Check Fields
     * public_authority - number - 1 || 2
     * language - string - en || ja || ko || zh-Hans
     * company - string
     * logo - string
     * business_type - string
     * country - string
     * city - string
     * protocol - string - http || https
     * url - string
     * job - string
     * employment_status - string - full_time || part_time || contract || intern
     * title - string
     * content - string
     *
     * tags - array
     *
     * !!! if is_online_interview_set === true
     *   application_authority - number - 1 || 2
     *   !!! if is_start_set === true
     *     start_at - number - Check downside
     *   finish_at - number - Check Downside
     *   questions - array - Check data by short_answer || multiple_choice
     *
     * !!! if decide_salary_later === false
     * salary_period - string - year || month || hour
     * salary - float
     * salary_unit - string - check from database of [monetary_units] - monetary_units
     */

    /* Check Type - String */
    if (
        (Object.prototype.toString.call(first["_id"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["language"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["company"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["logo"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["business_type"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["country"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["city"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["protocol"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["url"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["job"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["employment_status"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["title"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["content"]) !== "[object String]")
    ) {
        return f_cb(null);
    }
    if (second["$set"]["logo"] === "") {
        updated_obj["logo"] = second["$set"]["logo"] = config.aws_s3_url + "/upload/images/00000000/gleant/resized/question.png";
    } else {
        var parsed_url = url.parse(second["$set"]["logo"]);
        if (
            parsed_url.protocol !== 'https:' ||
            parsed_url.host !== 'images.gleant.com'
        ) {
            return f_cb(null);
        }
    }
    if (second["$set"]["decide_salary_later"] === false) {
        if (
            (Object.prototype.toString.call(second["$set"]["salary_period"]) !== "[object String]") ||
            (Object.prototype.toString.call(second["$set"]["salary_unit"]) !== "[object String]")
        ) {
            return f_cb(null);
        }
    }
    /* Check Type - Array */
    if (Object.prototype.toString.call(second["$set"]["tags"]) !== "[object Array]") {
        return f_cb(null);
    }
    if (second["$set"]["is_online_interview_set"] === true) {
        if (Object.prototype.toString.call(second["$set"]["questions"]) !== "[object Array]") {
            return f_cb(null);
        }
    }
    /* Check Type - Number */
    try {
        second["$set"]["public_authority"] = parseInt(second["$set"]["public_authority"]);
        if (
            second["$set"]["public_authority"] !== 1 &&
            second["$set"]["public_authority"] !== 2
        ) {
            return f_cb(null);
        }
        if (second["$set"]["is_online_interview_set"] === true) {
            updated_obj["application_authority"] = second["$set"]["application_authority"] = parseInt(second["$set"]["application_authority"]);
            if (
                second["$set"]["application_authority"] !== 1 &&
                second["$set"]["application_authority"] !== 2
            ) {
                return f_cb(null);
            }
            if (second["$set"]["is_start_set"] === false) {
                updated_obj["start_at"] = second["$set"]["start_at"] = new Date().valueOf();
            } else {
                updated_obj["start_at"] = second["$set"]["start_at"] = parseInt(second["$set"]["start_at"]);
                date = new Date();
                temp = date.valueOf();
                if (second["$set"]["start_at"] < temp) {
                    second["$set"]["start_at"] = temp;
                } else {
                    date.setMonth(date.getMonth() + 4);
                    temp = date.valueOf();
                    if (second["$set"]["start_at"] > temp || second["$set"]["start_at"] > DATE_MAX_VALUE) {
                        return f_cb(null);
                    }
                }
            }
            updated_obj["finish_at"] = second["$set"]["finish_at"] = parseInt(second["$set"]["finish_at"]);
            date = new Date();
            temp = date.valueOf();
            if (second["$set"]["finish_at"] < temp) {
                return f_cb(null);
            }
            date.setMonth(date.getMonth() + 4);
            temp = date.valueOf();
            if (second["$set"]["finish_at"] > temp || second["$set"]["finish_at"] > DATE_MAX_VALUE) {
                return f_cb(null);
            }
            if (second["$set"]["start_at"] > second["$set"]["finish_at"]) {
                return f_cb(null);
            }
        }
        if (second["$set"]["decide_salary_later"] === false) {
            updated_obj["salary"] = second["$set"]["salary"] = parseFloat(second["$set"]["salary"]);
            if ( second["$set"]["salary"] < 0 ) {
                return f_cb(null);
            }
        }
    } catch (e) {
        return f_cb(null);
    }
    if (
        second["$set"]["language"] !== "en" &&
        second["$set"]["language"] !== "ja" &&
        second["$set"]["language"] !== "ko" &&
        second["$set"]["language"] !== "zh-Hans"
    ) {
        return f_cb(null);
    }
    if (
        second["$set"]["protocol"] !== "http" &&
        second["$set"]["protocol"] !== "https"
    ) {
        return f_cb(null);
    }
    if (
        second["$set"]["employment_status"] !== "full_time" &&
        second["$set"]["employment_status"] !== "part_time" &&
        second["$set"]["employment_status"] !== "contract" &&
        second["$set"]["employment_status"] !== "intern"
    ) {
        return f_cb(null);
    }
    if (second["$set"]["decide_salary_later"] === false) {
        if (
            second["$set"]["salary_period"] !== "year" &&
            second["$set"]["salary_period"] !== "month" &&
            second["$set"]["salary_period"] !== "hour"
        ) {
            return f_cb(null);
        }
        var is_unit_correct = false;
        for (var i = 0; i < monetary_units.length; i++) {
            if (monetary_units[i].unit === second["$set"]["salary_unit"]) {
                is_unit_correct = true;
            }
        }
        if (is_unit_correct === false) {
            return f_cb(null);
        }
    }
    for (var i = 0; i < second["$set"]["tags"].length; i++) {
        if (Object.prototype.toString.call(second["$set"]["tags"][i]) !== "[object String]") {
            return f_cb(null);
        }
        second["$set"]["tags"][i] = second["$set"]["tags"][i].replace(/\s+/gi, '').toLowerCase();
        if (second["$set"]["tags"][i] === "") {
            return f_cb(null);
        }
    }
    updated_obj["tags"] = second["$set"]["tags"];
    updated_obj["content"] = second["$set"]["content"] = methods.get_xss_prevented_content("employment", second["$set"]["content"]);
    updated_obj["is_youtube_inserted"] = second["$set"]["is_youtube_inserted"] = methods.is_youtube_inserted(second["$set"]["content"]);
    updated_obj["updated_at"] = second["$set"]["updated_at"] = new Date().valueOf();
    updated_obj["date"] = second["$set"]["date"] = methods.to_eight_digits_date();
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        updated_obj["name"] = user.name;
        updated_obj["blog_id"] = first["blog_id"] = user.blog_id;
        updated_obj["img"] = second["$set"]["img"] = user.img;
        methods.get_single_apply_now(connected_db, user, {_id: first["_id"], type: "apply_now"}, "public", "all", f_cb, function (doc) {
            if (user.blog_id !== doc.blog_id) {
                return f_cb(null);
            }
            /* Check online_interview is set and started */
            if (doc.is_online_interview_set === true) {
                now = new Date().valueOf();
                if (doc.is_start_set === true) {
                    ten_s_b4_start = new Date(doc.start_at);
                    ten_s_b4_start.setSeconds(ten_s_b4_start.getSeconds() - 30);
                    ten_s_b4_start = ten_s_b4_start.valueOf();
                    if (now > ten_s_b4_start) {
                        is_online_interview_time = true;
                    }
                } else { /* When Online Interview started */
                    is_online_interview_time = true;
                }
            }
            if (second["$set"]["public_authority"] === 2) {
                updated_obj["application_authority"] = second["$set"]["application_authority"] = second["$set"]["public_authority"];
            }
            if (is_online_interview_time === false) {
                var questions = []
                    , choices = [];
                /* Check online interview questions */
                if (second["$set"]["is_online_interview_set"] === true) {
                    if (second["$set"]["questions"].length < 1) {
                        return f_cb(null);
                    }
                    for (var i = 0; i < second["$set"]["questions"].length; i++) {
                        if (second["$set"]["questions"][i].type === "short_answer") {
                            if (
                                second["$set"]["questions"][i].question === "undefined" ||
                                second["$set"]["questions"][i].max_length === "undefined"
                            ) {
                                return f_cb(null);
                            }
                            if (Object.prototype.toString.call(second["$set"]["questions"][i].question) !== "[object String]") {
                                return f_cb(null);
                            }
                            if (Object.prototype.toString.call(second["$set"]["questions"][i].max_length) !== "[object Number]") {
                                return f_cb(null);
                            }
                            if (
                                (second["$set"]["questions"][i].max_length % 100 !== 0) ||
                                (second["$set"]["questions"][i].max_length < 0) ||
                                (second["$set"]["questions"][i].max_length > 1000)
                            ) {
                                return f_cb(null);
                            }
                            questions.push({
                                _id: randomstring.generate(6)
                                , type: second["$set"]["questions"][i].type
                                , question: second["$set"]["questions"][i].question
                                , max_length: second["$set"]["questions"][i].max_length
                            });
                        } else if (second["$set"]["questions"][i].type === "multiple_choice"){
                            if (
                                second["$set"]["questions"][i].question === "undefined" ||
                                second["$set"]["questions"][i].choices === "undefined"
                            ) {
                                return f_cb(null);
                            }
                            if (Object.prototype.toString.call(second["$set"]["questions"][i].question) !== "[object String]") {
                                return f_cb(null);
                            }
                            if (Object.prototype.toString.call(second["$set"]["questions"][i].choices) !== "[object Array]") {
                                return f_cb(null);
                            }
                            choices = [];
                            for (var j = 0; j < second["$set"]["questions"][i].choices.length; j++) {
                                if (Object.prototype.toString.call(second["$set"]["questions"][i].choices[j]) !== "[object String]") {
                                    return f_cb(null);
                                }
                                choices.push({
                                    _id: randomstring.generate(6)
                                    , choice: second["$set"]["questions"][i].choices[j]
                                });
                            }
                            if (second["$set"]["questions"][i].choices.length < 2) {
                                return f_cb(null);
                            }
                            questions.push({
                                _id: randomstring.generate(6)
                                , type: second["$set"]["questions"][i].type
                                , question: second["$set"]["questions"][i].question
                                , choices: choices
                            });
                        } else {
                            return f_cb(null);
                        }
                    }
                    updated_obj["questions"] = second["$set"]["questions"] = questions;
                } else {
                    updated_obj["application_authority"] = second["$set"]["application_authority"] = second["$set"]["public_authority"];
                    updated_obj["is_start_set"] = second["$set"]["is_start_set"] = false;
                    updated_obj["start_at"] = second["$set"]["start_at"] = new Date().valueOf();
                    updated_obj["is_finish_set"] = second["$set"]["is_finish_set"] = false;
                    updated_obj["finish_at"] = second["$set"]["finish_at"] = DATE_MAX_VALUE;
                    updated_obj["questions"] = second["$set"]["questions"] = [];
                }
            } else { /* When Online Interview started OR start in 30 seconds. */
                updated_obj["is_online_interview_set"] = second["$set"]["is_online_interview_set"] = doc.is_online_interview_set;
                updated_obj["is_start_set"] = second["$set"]["is_start_set"] = doc.is_start_set;
                updated_obj["start_at"] = second["$set"]["start_at"] = doc.start_at;
                updated_obj["questions"] = second["$set"]["questions"] = doc.questions;
                date = new Date();
                temp = date.valueOf();
                if (second["$set"]["finish_at"] < temp) {
                    return f_cb(null);
                }
                date.setMonth(date.getMonth() + 4);
                temp = date.valueOf();
                if (second["$set"]["finish_at"] > temp || second["$set"]["finish_at"] >= DATE_MAX_VALUE) {
                    return f_cb(null);
                }
                if (second["$set"]["start_at"] > second["$set"]["finish_at"]) {
                    return f_cb(null);
                }
            }
            updated_obj["count_view"] = doc.count_view;
            updated_obj["count_awesome"] = doc.count_awesome;
            updated_obj["count_comments"] = doc.count_comments;
            updated_obj["created_at"] = doc.created_at;
            updated_obj["es_index"] = doc.es_index;
            updated_obj["es_type"] = doc.es_type;
            updated_obj["es_id"] = doc.es_id;
            var link = "/apply-now/" + first["_id"];
            if (
                updated_obj["public_authority"] !== doc.public_authority &&
                updated_obj["public_authority"] === 2
            ) { /* Copy members to subscribers */
                second["$set"]["subscribers"] = doc.members;
            }

            methods.update_employment(connected_db, first, second, user, f_cb, function (pathname) {
                res.json({response:true, pathname:pathname, is_online_interview_time : is_online_interview_time});
                first = {};
                second = {};
                first.link = link;
                first.is_removed = false;
                second["$set"] = {};
                second["$set"].article_language = updated_obj["language"];
                if (
                    updated_obj["public_authority"] !== doc.public_authority
                ) {
                    second["$set"]["public_authority"] = updated_obj["public_authority"];
                }

                methods.update_comments_language(connected_db, first, second, function () {
                    return es_methods.es_update_employment(connected_db, es_client, updated_obj);
                });
            });
        });
    });
});
app.post('/update/hire_me', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var data={}
        , first={}
        , second={}
        , updated_obj = {}
        , date
        , temp;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);

    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }

    if (
        req.body._id === undefined ||
        req.body.public_authority === undefined ||
        req.body.language === undefined ||
        req.body.job === undefined ||
        req.body.employment_status === undefined ||
        req.body.decide_salary_later === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined ||
        req.body.tags === undefined
    ) {
        return f_cb(null);
    }
    var content = decodeURIComponent(req.body.content);
    updated_obj["_id"] = first["_id"] = decodeURIComponent(req.body._id);
    updated_obj["type"] = first["type"] = "hire_me";
    first["is_removed"] = false;

    second["$set"] = {};
    updated_obj["public_authority"] = second["$set"]["public_authority"] = decodeURIComponent(req.body.public_authority);
    updated_obj["language"] = second["$set"]["language"] = "ko"; /*decodeURIComponent(req.body.language);*/
    updated_obj["job"] = second["$set"]["job"] = decodeURIComponent(req.body.job);
    updated_obj["employment_status"] = second["$set"]["employment_status"] = decodeURIComponent(req.body.employment_status);
    updated_obj["decide_salary_later"] = second["$set"]["decide_salary_later"] = decodeURIComponent(req.body.decide_salary_later) === "true";
    updated_obj["title"] = second["$set"]["title"] = decodeURIComponent(req.body.title).trim().replace(/\s\s+/gi, ' ');
    updated_obj["content"] = second["$set"]["content"] = content;
    updated_obj["tags"] = second["$set"]["tags"] = JSON.parse(decodeURIComponent(req.body.tags));

    if (second["$set"]["decide_salary_later"] === false) {
        if (
            req.body.salary_period === undefined ||
            req.body.salary === undefined ||
            req.body.salary_unit === undefined
        ) {
            return f_cb(null);
        }
        updated_obj["salary_period"] = second["$set"]["salary_period"] = decodeURIComponent(req.body.salary_period);
        updated_obj["salary"] = second["$set"]["salary"] = decodeURIComponent(req.body.salary);
        updated_obj["salary_unit"] = second["$set"]["salary_unit"] = decodeURIComponent(req.body.salary_unit);
    } else {
        updated_obj["salary_period"] = second["$set"]["salary_period"] = "year";
        updated_obj["salary"] = second["$set"]["salary"] = 0;
        updated_obj["salary_unit"] = second["$set"]["salary_unit"] = "USD";
    }
    if (
        (Object.prototype.toString.call(first["_id"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["language"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["job"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["employment_status"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["title"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["content"]) !== "[object String]")
    ) {
        return f_cb(null);
    }
    if (second["$set"]["decide_salary_later"] === false) {
        if (
            (Object.prototype.toString.call(second["$set"]["salary_period"]) !== "[object String]") ||
            (Object.prototype.toString.call(second["$set"]["salary_unit"]) !== "[object String]")
        ) {
            return f_cb(null);
        }
    }
    /* Check Type - Array */
    if (Object.prototype.toString.call(second["$set"]["tags"]) !== "[object Array]") {
        return f_cb(null);
    }
    try {
        updated_obj["public_authority"] = second["$set"]["public_authority"] = parseInt(second["$set"]["public_authority"]);
        if (
            second["$set"]["public_authority"] !== 1 &&
            second["$set"]["public_authority"] !== 2
        ) {
            return f_cb(null);
        }

        if (second["$set"]["decide_salary_later"] === false) {
            updated_obj["salary"] = second["$set"]["salary"] = parseFloat(second["$set"]["salary"]);
            if ( second["$set"]["salary"] < 0 ) {
                return f_cb(null);
            }
        }
    } catch (e) {
        return f_cb(null);
    }
    if (
        second["$set"]["language"] !== "en" &&
        second["$set"]["language"] !== "ja" &&
        second["$set"]["language"] !== "ko" &&
        second["$set"]["language"] !== "zh-Hans"
    ) {
        return f_cb(null);
    }
    if (
        second["$set"]["employment_status"] !== "full_time" &&
        second["$set"]["employment_status"] !== "part_time" &&
        second["$set"]["employment_status"] !== "contract" &&
        second["$set"]["employment_status"] !== "intern"
    ) {
        return f_cb(null);
    }
    if (second["$set"]["decide_salary_later"] === false) {
        if (
            second["$set"]["salary_period"] !== "year" &&
            second["$set"]["salary_period"] !== "month" &&
            second["$set"]["salary_period"] !== "hour"
        ) {
            return f_cb(null);
        }

        var is_unit_correct = false;
        for (var i = 0; i < monetary_units.length; i++) {
            if (monetary_units[i].unit === second["$set"]["salary_unit"]) {
                is_unit_correct = true;
            }
        }
        if (is_unit_correct === false) {
            return f_cb(null);
        }
    }
    for (var i = 0; i < second["$set"]["tags"].length; i++) {
        if (Object.prototype.toString.call(second["$set"]["tags"][i]) !== "[object String]") {
            return f_cb(null);
        }
        second["$set"]["tags"][i] = second["$set"]["tags"][i].replace(/\s+/gi, '').toLowerCase();
        if (second["$set"]["tags"][i] === "") {
            return f_cb(null);
        }
    }
    updated_obj["tags"] = second["$set"]["tags"];
    updated_obj["content"] = second["$set"]["content"] = methods.get_xss_prevented_content("employment", second["$set"]["content"]);
    updated_obj["is_youtube_inserted"] = second["$set"]["is_youtube_inserted"] = methods.is_youtube_inserted(second["$set"]["content"]);
    updated_obj["updated_at"] = second["$set"]["updated_at"] = new Date().valueOf();
    updated_obj["date"] = second["$set"]["date"] = methods.to_eight_digits_date();

    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }

        updated_obj["name"] = user.name;
        updated_obj["blog_id"] = first["blog_id"] = user.blog_id;
        updated_obj["img"] = second["$set"]["img"] = user.img;
        methods.get_single_hire_me(connected_db, user, {_id: first["_id"], type: "hire_me"}, "owner", "all", f_cb, function (doc) {
            if (user.blog_id !== doc.blog_id) {
                return f_cb(null);
            }

            updated_obj["count_view"] = doc.count_view;
            updated_obj["count_awesome"] = doc.count_awesome;
            updated_obj["count_comments"] = doc.count_comments;
            updated_obj["created_at"] = doc.created_at;

            updated_obj["es_index"] = doc.es_index;
            updated_obj["es_type"] = doc.es_type;
            updated_obj["es_id"] = doc.es_id;

            var link = "/hire-me/" + first["_id"];

            if (
                updated_obj["public_authority"] !== doc.public_authority &&
                updated_obj["public_authority"] === 2
            ) { /* Copy members to subscribers */
                second["$set"]["subscribers"] = doc.members;
            }

            if (
                updated_obj["public_authority"] !== doc.public_authority &&
                updated_obj["public_authority"] === 1
            ) {
                second["$set"]["members"] = [];
                second["$set"]["members"].push(user.blog_id);
            }

            methods.update_employment(connected_db, first, second, user, f_cb, function (pathname) {
                res.json({response:true, pathname:pathname});
                first = {};
                second = {};
                first.link = link;
                first.is_removed = false;
                second["$set"] = {};
                second["$set"].article_language = updated_obj["language"];
                if (
                    updated_obj["public_authority"] !== doc.public_authority
                ) {
                    second["$set"]["public_authority"] = updated_obj["public_authority"];
                }
                methods.update_comments_language(connected_db, first, second, function () {
                    return es_methods.es_update_employment(connected_db, es_client, updated_obj);
                });
            });
        });
    });
});
app.post('/remove/employment', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var s_cb = function (nothing) {return res.json({response:true});};

    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);

    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }

    if (
        req.body._id === undefined ||
        req.body.type === undefined
    ) {
        return f_cb(null);
    }
    var _id = decodeURIComponent(req.body._id)
        , type = decodeURIComponent(req.body.type)
        , first = {}
        , comments_link = "";

    if (
        type !== "apply_now" &&
        type !== "hire_me"
    ) {
        return f_cb(null);
    }

    if (
        (Object.prototype.toString.call(_id) !== "[object String]")
    ) {
        return f_cb(null);
    }

    first.type = type;
    first._id = _id;

    if (type === "apply_now") {
        comments_link = "/apply-now/" + first._id;
    } else {
        comments_link = "/hire-me/" + first._id;
    }

    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        first.blog_id = user.blog_id;
        if (type === "apply_now") {
            methods.get_single_apply_now(connected_db, user, {_id: first["_id"], type: "apply_now"}, "owner", "all", f_cb, function (doc) {
                methods.remove_document(connected_db, "employment", first, f_cb, function (nothing) {
                    first = {};
                    first.type = type;
                    first.link = comments_link;
                    methods.remove_comments(connected_db, first, function (nothing) {
                        s_cb();
                        return es_methods.es_remove_document(es_client, doc);
                    });
                });
            });
        } else {
            methods.get_single_hire_me(connected_db, user, {_id: first["_id"], type: "hire_me"}, "owner", "all", f_cb, function (doc) {
                methods.remove_document(connected_db, "employment", first, f_cb, function (nothing) {
                    first = {};
                    first.type = type;
                    first.link = comments_link;
                    methods.remove_comments(connected_db, first, function (nothing) {
                        s_cb();
                        return es_methods.es_remove_document(es_client, doc);
                    });
                });
            });
        }
    });
});

/* Apply Now Announcement */
app.post('/insert/employment-announcement', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.article_id === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data.article_id = decodeURIComponent(req.body.article_id);
    data.title = decodeURIComponent(req.body.title);
    data.content = decodeURIComponent(req.body.content);
    /* Check Type String */
    if (
        (Object.prototype.toString.call(data["article_id"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["title"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["content"]) !== "[object String]")
    ) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        methods.get_single_apply_now(connected_db, user, {_id: data.article_id}, "owner", "all", f_cb, function (apply_now) {
            methods.insert_employment_announcement(connected_db, data, user, f_cb, function (created_obj) {
                methods.update_article_count(connected_db, "employment", {_id: data.article_id}, {$inc: { count_announcement:1}},
                    function (nothing) {
                        return res.json({response:true, doc:created_obj});
                    }, function (nothing) {
                        return res.json({response:true, doc:created_obj});
                    });
            });
        });
    });
});
app.post('/update/employment-announcement', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body._id === undefined ||
        req.body.article_id === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data._id = decodeURIComponent(req.body._id);
    data.article_id = decodeURIComponent(req.body.article_id);
    data.title = decodeURIComponent(req.body.title);
    data.content = decodeURIComponent(req.body.content);

    /* Check Type String */
    if (
        (Object.prototype.toString.call(data["_id"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["article_id"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["title"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["content"]) !== "[object String]")
    ) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        methods.get_single_apply_now(connected_db, user, {_id: data.article_id}, "owner", "all", f_cb, function (apply_now) {
            methods.update_employment_announcement(connected_db, data, user, f_cb, function (created_obj) {
                return res.json({response:true});
            });
        });
    });
});

app.post('/remove/employment-announcement', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body._id === undefined ||
        req.body.article_id === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data._id = decodeURIComponent(req.body._id);
    data.article_id = decodeURIComponent(req.body.article_id);

    /* Check Type String */
    if (
        (Object.prototype.toString.call(data["_id"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["article_id"]) !== "[object String]")
    ) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        methods.get_single_apply_now(connected_db, user, {_id: data.article_id}, "owner", "all", f_cb, function (apply_now) {
            methods.remove_employment_announcement(connected_db, data, user, f_cb, function (created_obj) {
                methods.update_article_count(connected_db, "employment", {_id: data.article_id}, {$inc: { count_announcement:-1}},
                    function (nothing) {
                        return res.json({response:true});
                    }, function (nothing) {
                        return res.json({response:true});
                    });
            });
        });
    });
});
app.post('/apply/online-interview', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    var now
        , extended_time;
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.article_id === undefined ||
        req.body.answers === undefined
    ) {
        return f_cb(null);
    }
    var data = {}
        , answers = []
        , answer_exists = false;
    data.article_id = decodeURIComponent(req.body.article_id);
    data.answers = JSON.parse(decodeURIComponent(req.body.answers));
    /* Check Type String */
    if (
        (Object.prototype.toString.call(data["article_id"]) !== "[object String]")
    ) {
        return f_cb(null);
    }
    if (
        (Object.prototype.toString.call(data["answers"]) !== "[object Array]")
    ) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        methods.get_single_apply_now(connected_db, user, {_id: data.article_id}, "application", "all", f_cb, function (doc) {
            methods.get_single_online_interview_answer(connected_db, {article_id: data.article_id}, user, function (nothing) {
                if (
                    doc.questions === undefined ||
                    doc.questions.length === 0 ||
                    doc.is_online_interview_set === false
                ) {
                    return f_cb(null);
                }
                if (data.answers.length !== doc.questions.length) {
                    return f_cb(null);
                }
                now = new Date().valueOf();
                extended_time = new Date();
                extended_time.setSeconds(extended_time.getSeconds() - 10);
                extended_time = extended_time.valueOf();
                if (doc.is_start_set === true) { /* Start Time is set */
                    if (doc.start_at > now) { /* Scheduled */
                        return f_cb(null);
                    } else {
                        if (doc.finish_at < extended_time) { /* Finished */
                            return f_cb(null);
                        }
                    }
                } else { /* Right Now */
                    if (doc.finish_at < extended_time) { /* Finished */
                        return f_cb(null);
                    }
                }
                for (var i = 0; i < doc.questions.length; i++) { /* Check Online Interview Answers */
                    if (Object.prototype.toString.call(data.answers[i]) !== "[object Object]") {
                        return f_cb(null);
                    }
                    if (
                        Object.prototype.toString.call(data.answers[i]._id) !== "[object String]" ||
                        Object.prototype.toString.call(data.answers[i].type) !== "[object String]" ||
                        Object.prototype.toString.call(data.answers[i].answer) !== "[object String]"
                    ) {
                        return f_cb(null);
                    }
                    if (
                        (doc.questions[i]._id !== data.answers[i]._id) ||
                        (doc.questions[i].type !== data.answers[i].type)
                    ) {
                        return f_cb(null);
                    }
                    if (data.answers[i].type === "short_answer") {
                        if (data.answers[i].answer.length > doc.questions[i].max_length) {
                            return f_cb(null);
                        }
                    } else if (data.answers[i].type === "multiple_choice") {
                        answer_exists = false;
                        for (var j = 0; j < doc.questions[i].choices.length; j++) {
                            if (doc.questions[i].choices[j]._id === data.answers[i].answer) {
                                answer_exists = true;
                                break;
                            }
                        }
                        if (answer_exists === false) {
                            return f_cb(null);
                        }
                    } else {
                        return f_cb(null);
                    }
                    answers.push({
                        _id: data.answers[i]._id
                        , type: data.answers[i].type
                        , answer: data.answers[i].answer
                    });
                }
                data.answers = answers;
                methods.apply_online_interview(connected_db, data, user, f_cb, function (created_obj) {
                    methods.update_article_count(connected_db, "employment", {_id: data.article_id}, {$inc: { count_online_interview:1}},
                        function (nothing) {
                            return res.json({response:true});
                        }, function (nothing) {
                            return res.json({response:true});
                        });
                });
            }, f_cb);
        });
    });
});
app.post('/get/announcements', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    var f_cb = function (docs) {return res.json({response:false});};
    var s_cb = function (docs) {return res.json({response:true, docs:docs});};
    if (req.body.created_at === undefined) {
        return f_cb(null);
    }
    var data = {};
    data["created_at"] = decodeURIComponent(req.body.created_at);
    try {
        data["created_at"] = parseInt(data["created_at"]);
        if (data["created_at"] < 0 || data["created_at"] > DATE_MAX_VALUE) {
            return f_cb(null);
        }
    } catch (e) {
        return f_cb(null);
    }
    return methods.get_announcements(connected_db, data, f_cb, s_cb);
});
app.post('/index/news-tags', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var s_cb = function (nothing) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.type === undefined ||
        req.body._id === undefined ||
        req.body.tags === undefined ||
        req.body.action === undefined
    ) {
        return f_cb(null);
    }
    var type
        , first = {}
        , tags
        , action;
    type = decodeURIComponent(req.body.type);
    first._id = decodeURIComponent(req.body._id);
    tags = JSON.parse(decodeURIComponent(req.body.tags));
    action = decodeURIComponent(req.body.action);
    if (type !== "news") {
        return f_cb(null);
    }
    if (
        Object.prototype.toString.call(first._id) !== "[object String]" ||
        Object.prototype.toString.call(tags) !== "[object Array]"
    ) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (methods.is_gleantcorp(user.blog_id) === false) {
            return res.json({response:false});
        }
        methods.get_single_news(connected_db, first, f_cb, function (doc) {
            if (action === "write") {
                if (doc.es_is_updated === false) {
                    methods.update_news_tags(connected_db, first._id, tags, f_cb, function (nothing) {
                        s_cb();
                        doc.tags = tags;
                        es_methods.es_insert_news(connected_db, es_client, doc);
                        return methods.upsert_keywords(connected_db, doc.language, tags, function () {});
                    });
                } else {
                    return f_cb(null);
                }
            } else { /* list */
                if (doc.es_is_updated === false) {
                    return f_cb(null);
                } else {
                    methods.update_news_tags(connected_db, first._id, tags, f_cb, function (nothing) {
                        s_cb();
                        doc.tags = tags;
                        doc.updated_at = new Date().valueOf();
                        es_methods.es_update_news(connected_db, es_client, doc);
                        return methods.upsert_keywords(connected_db, doc.language, tags, function () {});
                    });
                }
            }
        });
    });
});
app.post('/insert/website', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var f_cb2 = function (nothing) {return res.json({response:false, reason: "already_exists"});};
    var s_cb = function (nothing) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.language === undefined ||
        req.body.link === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined ||
        req.body.tags === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data.language = "ko"; /*decodeURIComponent(req.body.language);*/
    data.link = decodeURIComponent(req.body.link);
    data.title = decodeURIComponent(req.body.title);
    data.content = decodeURIComponent(req.body.content);
    data.tags = JSON.parse(decodeURIComponent(req.body.tags));
    if (
        Object.prototype.toString.call(data.language) !== "[object String]" ||
        Object.prototype.toString.call(data.link) !== "[object String]" ||
        Object.prototype.toString.call(data.title) !== "[object String]" ||
        Object.prototype.toString.call(data.content) !== "[object String]" ||
        Object.prototype.toString.call(data.tags) !== "[object Array]"
    ) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (methods.is_gleantcorp(user.blog_id) === false) {
            return res.json({response:false});
        }
        methods.get_single_website(connected_db, data, function (doc) {
            if (doc === null) {
                methods.insert_website(connected_db, data, f_cb, function (doc) {
                    s_cb();
                    es_methods.es_insert_website(connected_db, es_client, doc);
                    if (data.tags.length > 0) {
                        return methods.upsert_keywords(connected_db, data.language, data.tags, function () {});
                    }
                });
            } else {
                return f_cb2(null);
            }
        });
    });
});
/* Gleant Announcement */
app.post('/insert/tnaelg-announcement', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.send_notification === undefined ||
        req.body.documents === undefined
    ) {
        return f_cb(null);
    }
    var data = {}
        , notification_data = {}
        , pathname
        , languages;
    data.documents = JSON.parse(decodeURIComponent(req.body.documents));
    data.send_notification = decodeURIComponent(req.body.send_notification) === "true";
    if ((Object.prototype.toString.call(data.documents) !== "[object Object]")) {
        return f_cb(null);
    }
    if (data.send_notification === true) {
        languages = methods.get_all_languages();
        for (var i = 0; i < languages.length; i++) {
            if (data.documents[languages[i]] === undefined) {
                return f_cb(null);
            }
            if (
                data.documents[languages[i]].title === undefined ||
                data.documents[languages[i]].language === undefined
            ) {
                return f_cb(null);
            }
            notification_data[languages[i]] = {};
            notification_data[languages[i]].title = data.documents[languages[i]].title;
            notification_data[languages[i]].language = data.documents[languages[i]].language;
        }
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (methods.is_gleantcorp(user.blog_id) === false) {
            return res.json({response:false});
        }
        methods.insert_announcement(connected_db, data, user, f_cb, function (created_obj) {
            pathname = "/announcement/"  + created_obj._id;
            if (data.send_notification === true) {
                methods.insert_notification(connected_db, {
                    type: "announcement"
                    , blog_id: "gleant"
                    , link: pathname
                    , info: notification_data
                }, function (nothing) {
                    return res.json({response:true, pathname:pathname, status: "error_insert_notification"});
                }, function (nothing) {
                    return res.json({response:true, pathname:pathname, status: "completed"});
                });
            } else {
                return res.json({response:true, pathname:pathname, status: "completed"});
            }
        });
    });
});
app.post('/insert/agenda', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var data={}
        , date
        , temp;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.public_authority === undefined ||
        req.body.opinion_authority === undefined ||
        req.body.comment_authority === undefined ||
        req.body.is_start_set === undefined ||
        req.body.start_at === undefined ||
        req.body.is_finish_set === undefined ||
        req.body.finish_at === undefined ||
        req.body.profile === undefined ||
        req.body.language === undefined ||
        req.body.main_tag === undefined ||
        req.body.tags === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined ||
        req.body.img_list === undefined
    ) {
        return f_cb(null);
    }

    var content = decodeURIComponent(req.body.content);
    data["type"] = "agenda";
    data["public_authority"] = decodeURIComponent(req.body.public_authority);
    data["opinion_authority"] = decodeURIComponent(req.body.opinion_authority);
    data["translation_authority"] = data["opinion_authority"];
    data["comment_authority"] = decodeURIComponent(req.body.comment_authority);
    data["is_start_set"] = decodeURIComponent(req.body.is_start_set);
    data["is_start_set"] = data["is_start_set"] === "true";
    data["start_at"] = decodeURIComponent(req.body.start_at);
    data["is_finish_set"] = decodeURIComponent(req.body.is_finish_set);
    data["is_finish_set"] = data["is_finish_set"] === "true";
    data["finish_at"] = decodeURIComponent(req.body.finish_at);
    data["profile"] = decodeURIComponent(req.body.profile);
    data["language"] = "ko"; /*decodeURIComponent(req.body.language);*/
    data["main_tag"] = decodeURIComponent(req.body.main_tag);
    data["tags"] = JSON.parse(decodeURIComponent(req.body.tags));
    data["title"] = decodeURIComponent(req.body.title).trim().replace(/\s\s+/gi, ' ');
    data["content"] = content;
    data["img_list"] = JSON.parse(decodeURIComponent(req.body.img_list));

    try {
        data.public_authority = parseInt(data.public_authority);
        if (
            data.public_authority !== 1 &&
            data.public_authority !== 2
        ) {
            return f_cb(null);
        }

        data.opinion_authority = parseInt(data.opinion_authority);
        if (
            data.opinion_authority !== 1 &&
            data.opinion_authority !== 2
        ) {
            return f_cb(null);
        }

        /*data.translation_authority = parseInt(data.translation_authority);
        if (
            data.translation_authority !== 1 &&
            data.translation_authority !== 2
        ) {
            return f_cb(null);
        }*/
        data.translation_authority = data.opinion_authority;

        data.comment_authority = parseInt(data.comment_authority);
        if (
            data.comment_authority !== 1 &&
            data.comment_authority !== 2
        ) {
            return f_cb(null);
        }

        if (data.public_authority === 2) {
            data.comment_authority = data.translation_authority = data.opinion_authority = 2;
        }

        if (data["is_start_set"] === false) {
            data.start_at = 0;
        } else {
            data.start_at = parseInt(data.start_at);
            date = new Date();
            temp = date.valueOf();
            if (data.start_at < temp) { /* Current time > start_at */
                data.start_at = temp;
            } else {
                if (data.start_at > DATE_MAX_VALUE) {
                    return f_cb(null);
                }
            }
        }

        if (data["is_finish_set"] === false) {
            data.finish_at = DATE_MAX_VALUE;
        } else {
            data.finish_at = parseInt(data.finish_at);
            date = new Date();
            temp = date.valueOf();
            if (data.finish_at < temp) {
                return f_cb(null);
            }
            date.setFullYear(date.getFullYear() + 6);
            temp = date.valueOf();
            if (data.finish_at > temp || data.finish_at > DATE_MAX_VALUE) {
                return f_cb(null);
            }
        }
        if (data.start_at > data.finish_at) {
            return f_cb(null);
        }
    } catch (e) {
        return f_cb(null);
    }

    /* 데이터 유형 확인 */
    /* language 확인 */
    if (
        data.language !== "en" &&
        data.language !== "ja" &&
        data.language !== "ko" &&
        data.language !== "zh-Hans"
    ) {
        return f_cb(null);
    }

    /* main_tag 비워있는지 */
    if (data.main_tag === "") {
        return f_cb(null);
    }

    var is_main_tag_correct = false;
    for (var i = 0; i < main_tags.length; i++) {
        if (main_tags[i].tag === data.main_tag) {
            is_main_tag_correct = true;
            break;
        }
    }
    if (is_main_tag_correct === false) {
        return f_cb(null);
    }

    /* String */
    /* profile, main_tag, title, content */
    if (
        (Object.prototype.toString.call(data["profile"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["main_tag"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["title"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["content"]) !== "[object String]")
    ) {
        return f_cb(null);
    }

    /* Array 확인 */
    /* tags, img_list */
    if (
        (Object.prototype.toString.call(data["tags"]) !== "[object Array]") ||
        (Object.prototype.toString.call(data["img_list"]) !== "[object Array]")
    ) {
        return f_cb(null);
    }

    for (var i = 0; i < data.tags.length; i++) {
        if (Object.prototype.toString.call(data.tags[i]) !== "[object String]") {
            return f_cb(null);
        }
        data["tags"][i] = data["tags"][i].replace(/\s+/gi, '').toLowerCase();
        if (data["tags"][i] === "") {
            return f_cb(null);
        }
    }
    for (var i = 0; i < data.img_list.length; i++) {
        if (Object.prototype.toString.call(data.img_list[i]) !== "[object String]") {
            return f_cb(null);
        }
    }

    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        methods.insert_article(connected_db, data, user, f_cb, function (pathname, created_obj) {
            res.json({response:true, pathname:pathname});
            if (data.tags.length > 0) {
                return methods.upsert_keywords(connected_db, data.language, data.tags, function () {
                    return methods.upsert_user_tags(connected_db, user, data.tags, 0, "inc", function () {
                        return es_methods.es_insert_article(connected_db, es_client, created_obj);
                    });
                });
            } else {
                return es_methods.es_insert_article(connected_db, es_client, created_obj);
            }
        });
    });
});
app.post('/insert/opinion', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});}
        , f_cb2 = function (nothing) {return res.json({response:false, msg: "time_error"});}
        , f_cb3 = function (nothing) {return res.json({response:false, msg: "no_access"});}
        , datetime = new Date().valueOf();

    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);

    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }

    if (
        req.body.agenda_id === undefined ||
        req.body.profile === undefined ||
        req.body.language === undefined ||
        req.body.main_tag === undefined ||
        req.body.tags === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined ||
        req.body.img_list === undefined
    ) {
        return f_cb(null);
    }

    /* agenda_id는 해당 논제가 존재하는지 확인 위해 사용. */
    var content = decodeURIComponent(req.body.content)
        , agenda_id = decodeURIComponent(req.body.agenda_id)
        , second = {}
        , notification = {}
        , data = {};

    data["type"] = "opinion";
    data["agenda_id"] = agenda_id;
    data["profile"] = decodeURIComponent(req.body.profile);
    data["language"] = "ko"; /*decodeURIComponent(req.body.language);*/
    data["main_tag"] = decodeURIComponent(req.body.main_tag);
    data["tags"] = JSON.parse(decodeURIComponent(req.body.tags));
    data["title"] = decodeURIComponent(req.body.title).trim().replace(/\s\s+/gi, ' ');
    data["content"] = content;
    data["img_list"] = JSON.parse(decodeURIComponent(req.body.img_list));

    /* 데이터 유형 확인 */
    /* language 확인 */
    if (
        data.language !== "en" &&
        data.language !== "ja" &&
        data.language !== "ko" &&
        data.language !== "zh-Hans"
    ) {
        return f_cb(null);
    }

    /* main_tag */
    if (data.main_tag === "") {
        return f_cb(null);
    }

    var is_main_tag_correct = false;
    for (var i = 0; i < main_tags.length; i++) {
        if (main_tags[i].tag === data.main_tag) {
            is_main_tag_correct = true;
            break;
        }
    }
    if (is_main_tag_correct === false) {
        return f_cb(null);
    }

    /* String */
    /* agenda_id, profile, main_tag, title, content */
    if (
        (Object.prototype.toString.call(data["agenda_id"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["profile"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["main_tag"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["title"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["content"]) !== "[object String]")
    ) {
        return f_cb(null);
    }

    /* Array 확인 */
    /* tags, img_list */
    if (
        (Object.prototype.toString.call(data["tags"]) !== "[object Array]") ||
        (Object.prototype.toString.call(data["img_list"]) !== "[object Array]")
    ) {
        return f_cb(null);
    }

    for (var i = 0; i < data.tags.length; i++) {
        if (Object.prototype.toString.call(data.tags[i]) !== "[object String]") {
            return f_cb(null);
        }
        data["tags"][i] = data["tags"][i].replace(/\s+/gi, '').toLowerCase();
        if (data["tags"][i] === "") {
            return f_cb(null);
        }
    }
    for (var i = 0; i < data.img_list.length; i++) {
        if (Object.prototype.toString.call(data.img_list[i]) !== "[object String]") {
            return f_cb(null);
        }
    }

    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        /* db, agenda_id, f_cb, s_cb */
        methods.get_single_agenda(connected_db, user, {_id: agenda_id, type: "agenda"}, "opinion", "all", f_cb3, function (doc) {
            if (doc.is_start_set === true) {
                if (doc.start_at > datetime) { /* Scheduled */
                    return f_cb2(null);
                } else {
                    if (doc.is_finish_set === true) {
                        if (doc.finish_at > datetime) { /* In Progress */

                        } else { /* Finished */
                            return f_cb2(null);
                        }
                    } else { /* Unlimited */

                    }
                }
            } else {
                if (doc.is_finish_set === true) {
                    if (doc.finish_at > datetime) { /* In Progress */

                    } else { /* Finished */
                        return f_cb2(null);
                    }
                } else { /* Unlimited */

                }
            }
            data.root_blog_id = doc.blog_id;
            data.members = doc.members;
            data.public_authority = doc.public_authority;
            data.opinion_authority = doc.opinion_authority;
            data.translation_authority = doc.translation_authority;
            data.comment_authority = doc.comment_authority;

            data.is_start_set = doc.is_start_set;
            data.start_at = doc.start_at;
            data.is_finish_set = doc.is_finish_set;
            data.finish_at = doc.finish_at;

            methods.insert_article(connected_db, data, user, f_cb, function (pathname, created_obj) {
                second = {};
                second["$addToSet"] = {};
                second["$addToSet"]["subscribers"] = user.blog_id;
                second["$inc"] = {};
                second["$inc"]["count_written_opinions"] = 1;

                notification = {};
                notification.type = "opinion_written";
                notification.link = pathname;
                notification.blog_id = user.blog_id;
                notification["info"] = {};
                notification["info"]["users"] = [];
                notification["info"]["users"].push({
                    blog_id: user.blog_id
                    , name: user.name
                    , img: user.img
                });
                notification["info"]["title"] = data.title;
                notification.subscribers = _.without(doc.subscribers, user.blog_id);
                methods.update_article_count(connected_db, "articles", {_id: agenda_id, type: "agenda"}, second,
                    function (nothing) {
                        res.json({response:true, pathname:pathname});
                        if (notification.subscribers.length > 0) {
                            methods.insert_notification(connected_db, notification, function (nothing) {
                                if (data.tags.length > 0) {
                                    return methods.upsert_keywords(connected_db, data.language, data.tags, function () {
                                        return methods.upsert_user_tags(connected_db, user, data.tags, 0, "inc", function () {
                                            return es_methods.es_insert_article(connected_db, es_client, created_obj);
                                        });
                                    });
                                } else {
                                    return es_methods.es_insert_article(connected_db, es_client, created_obj);
                                }
                            }, function (nothing) {
                                if (data.tags.length > 0) {
                                    return methods.upsert_keywords(connected_db, data.language, data.tags, function () {
                                        return methods.upsert_user_tags(connected_db, user, data.tags, 0, "inc", function () {
                                            return es_methods.es_insert_article(connected_db, es_client, created_obj);
                                        });
                                    });
                                } else {
                                    return es_methods.es_insert_article(connected_db, es_client, created_obj);
                                }
                            });
                        } else {
                            if (data.tags.length > 0) {
                                return methods.upsert_keywords(connected_db, data.language, data.tags, function () {
                                    return methods.upsert_user_tags(connected_db, user, data.tags, 0, "inc", function () {
                                        return es_methods.es_insert_article(connected_db, es_client, created_obj);
                                    });
                                });
                            } else {
                                return es_methods.es_insert_article(connected_db, es_client, created_obj);
                            }
                        }
                    }, function (nothing) {
                        res.json({response:true, pathname:pathname});
                        if (notification.subscribers.length > 0) {
                            methods.insert_notification(connected_db, notification, function (nothing) {
                                if (data.tags.length > 0) {
                                    return methods.upsert_keywords(connected_db, data.language, data.tags, function () {
                                        return methods.upsert_user_tags(connected_db, user, data.tags, 0, "inc", function () {
                                            return es_methods.es_insert_article(connected_db, es_client, created_obj);
                                        });
                                    });
                                } else {
                                    return es_methods.es_insert_article(connected_db, es_client, created_obj);
                                }
                            }, function (nothing) {
                                if (data.tags.length > 0) {
                                    return methods.upsert_keywords(connected_db, data.language, data.tags, function () {
                                        return methods.upsert_user_tags(connected_db, user, data.tags, 0, "inc", function () {
                                            return es_methods.es_insert_article(connected_db, es_client, created_obj);
                                        });
                                    });
                                } else {
                                    return es_methods.es_insert_article(connected_db, es_client, created_obj);
                                }
                            });
                        } else {
                            if (data.tags.length > 0) {
                                return methods.upsert_keywords(connected_db, data.language, data.tags, function () {
                                    return methods.upsert_user_tags(connected_db, user, data.tags, 0, "inc", function () {
                                        return es_methods.es_insert_article(connected_db, es_client, created_obj);
                                    });
                                });
                            } else {
                                return es_methods.es_insert_article(connected_db, es_client, created_obj);
                            }
                        }
                    });
            });
        });
    });
});

/**
 * 블로그 등록하기
 * - req.body 필수 요소
 * blog_menu_id
 * tags
 * title
 * content
 * img_list
 * public_authority
 *
 * - user에서 가져와야 할 필드
 * img
 * blog_name
 * blog_id
 *
 */
app.post('/insert/blog', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});};

    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);

    /* 비로그인 사용자 체크 */
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }

    /* 필수 요소 존재여부 체크 */
    if (
        req.body.language === undefined ||
        req.body.public_authority === undefined ||
        req.body.blog_menu_id === undefined ||
        req.body.tags === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined ||
        req.body.img_list === undefined
    ) {
        return f_cb(null);
    }

    var data = {};
    data.type = 'blog';
    data.language = "ko";/*decodeURIComponent(req.body.language);*/
    data.public_authority = decodeURIComponent(req.body.public_authority);
    data.blog_menu_id = decodeURIComponent(req.body.blog_menu_id);
    data.tags = JSON.parse(decodeURIComponent(req.body.tags));
    data.title = decodeURIComponent(req.body.title).trim().replace(/\s\s+/gi, ' ');
    data.content = decodeURIComponent(req.body.content);
    data.img_list = JSON.parse(decodeURIComponent(req.body.img_list));

    /* 데이터 유형 확인 */
    /* language 확인 */
    if (
        data.language !== "en" &&
        data.language !== "ja" &&
        data.language !== "ko" &&
        data.language !== "zh-Hans"
    ) {
        return f_cb(null);
    }

    /* Number */
    /* public_authority */
    try {
        data.public_authority = parseInt(data.public_authority);
        if (
            data.public_authority !== 0 &&
            data.public_authority !== 1 &&
            data.public_authority !== 2
        ) {
            return f_cb(null);
        }
    } catch (e) {
        return f_cb(null);
    }

    /* String */
    /* blog_menu_id, title, content */
    if (
        (Object.prototype.toString.call(data["blog_menu_id"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["title"]) !== "[object String]") ||
        (Object.prototype.toString.call(data["content"]) !== "[object String]")
    ) {
        return f_cb(null);
    }

    /* Array 확인 */
    /* tags, img_list */
    if (
        (Object.prototype.toString.call(data["tags"]) !== "[object Array]") ||
        (Object.prototype.toString.call(data["img_list"]) !== "[object Array]")
    ) {
        return f_cb(null);
    }

    for (var i = 0; i < data.tags.length; i++) {
        if (Object.prototype.toString.call(data.tags[i]) !== "[object String]") {
            return f_cb(null);
        }
        data["tags"][i] = data["tags"][i].replace(/\s+/gi, '').toLowerCase();
        if (data["tags"][i] === "") {
            return f_cb(null);
        }
    }
    for (var i = 0; i < data.img_list.length; i++) {
        if (Object.prototype.toString.call(data.img_list[i]) !== "[object String]") {
            return f_cb(null);
        }
    }
    if (
        data.blog_menu_id === 'debate' ||
        data.blog_menu_id === 'gallery' ||
        data.blog_menu_id === 'guestbook'
    ) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        /* blog_menu 존재 확인 */
        methods.check_blog_menu(connected_db, user.blog_id, data.blog_menu_id, f_cb, function (nothing) {
            /* 게시물 삽입 */
            methods.insert_article(connected_db, data, user, f_cb, function (pathname, created_obj) {
                res.json({response:true, pathname:pathname});
                if (data.tags.length > 0) {
                    return methods.upsert_keywords(connected_db, data.language, data.tags, function () {
                        return methods.upsert_user_tags(connected_db, user, data.tags, 0, "inc", function () {
                            return es_methods.es_insert_article(connected_db, es_client, created_obj);
                        });
                    });
                } else {
                    return es_methods.es_insert_article(connected_db, es_client, created_obj);
                }
            });
        });
    });
});
app.post('/insert/translation', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});}
        , f_cb3 = function (nothing) {return res.json({response:false, msg: "no_access"});};
    var s_cb = function (nothing) {return res.json({response:true});};
    return f_cb(null);

    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.language === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined ||
        req.body.tags === undefined ||
        req.body.type === undefined ||
        req.body._id === undefined
    ) {
        return f_cb(null);
    }
    var language = decodeURIComponent(req.body.language)
        , title = decodeURIComponent(req.body.title)
        , choice_list = []
        , content_index = 0
        , content = JSON.parse(decodeURIComponent(req.body.content))
        , joined_content = ""
        , vote_id_objs = {}
        , tags = JSON.parse(decodeURIComponent(req.body.tags))
        , type = decodeURIComponent(req.body.type)
        , _id = decodeURIComponent(req.body._id)
        , agenda_id
        , date = new Date().valueOf()
        , link
        , original_link
        , temp
        , temp2
        , data = {}
        , $
        , notification = {}
        , new_data = {}; /* tr_agenda 혹은 tr_opinion으로 삽입할 객체 */

    /* title type 확인 */
    if (Object.prototype.toString.call(title) !== "[object String]") {
        return f_cb(null);
    }

    /* content, tags type 확인 */
    if (
        (Object.prototype.toString.call(content) !== "[object Array]") ||
        (Object.prototype.toString.call(tags) !== "[object Array]")
    ) {
        return f_cb(null);
    }

    for (var i = 0; i < tags.length; i++) {
        if (Object.prototype.toString.call(tags[i]) !== "[object String]") {
            return f_cb(null);
        }
        tags[i] = tags[i].replace(/\s+/gi, '').toLowerCase();
        if (tags[i] === "") {
            return f_cb(null);
        }
    }

    data.type = type;
    data._id = _id;

    if (
        type !== "agenda" &&
        type !== "opinion"
    ) {
        return f_cb(null);
    }

    if (type === "opinion") {
        if (
            req.body.agenda_id === undefined
        ) {
            return f_cb(null);
        }
        agenda_id = decodeURIComponent(req.body.agenda_id);
        data.agenda_id = agenda_id;
    }

    for (var i = 0; i < content.length; i++) {
        if (content[i].main_type === "content") {
            if (content[i].sub_type === "text") {
                if (
                    content[i].index !== undefined &&
                    content[i].element !== undefined &&
                    Object.prototype.toString.call(content[i].index) === "[object Number]" &&
                    Object.prototype.toString.call(content[i].element) === "[object String]"
                ) {

                } else {
                    return f_cb(null);
                }
            } else if (content[i].sub_type === "vote") {
                if (
                    content[i].index !== undefined &&
                    content[i].height !== undefined &&
                    content[i].question !== undefined &&
                    content[i].choice_list !== undefined &&
                    content[i].src !== undefined &&
                    content[i]._id !== undefined &&
                    Object.prototype.toString.call(content[i].index) === "[object Number]" &&
                    Object.prototype.toString.call(content[i].height) === "[object Number]" &&
                    Object.prototype.toString.call(content[i].question) === "[object String]" &&
                    Object.prototype.toString.call(content[i].choice_list) === "[object Array]" &&
                    Object.prototype.toString.call(content[i].src) === "[object String]" &&
                    Object.prototype.toString.call(content[i]._id) === "[object String]"
                ) {
                    for (var j = 0; j < content[i].choice_list.length; j++) {
                        if (
                            content[i].choice_list[j]._id === undefined ||
                            content[i].choice_list[j].choice === undefined ||
                            Object.prototype.toString.call(content[i].choice_list[j]._id) !== "[object String]" ||
                            Object.prototype.toString.call(content[i].choice_list[j].choice) !== "[object String]"
                        ) {
                            return f_cb(null);
                        }
                    }
                    vote_id_objs[content[i]._id] = content[i];
                    vote_id_objs[content[i]._id].exists = false;
                } else {
                    return f_cb(null);
                }
            } else {
                return f_cb(null);
            }
        } else {
            return f_cb(null);
        }
    }
    /**
     * 1. 로그인 사용자인지 확인하기
     * 2. 해당 게시물 존재여부 확인하기
     * 3. 해당 게시물 content parsing 하기
     * 원본 투표함 정보 제대로 된 것인지 확인하기
     * 제대로 된 URL이 아닐 경우 삭제하기
     */
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return f_cb(null);
        }
        var go = function (doc) {
            if (doc.language === language) {
                return f_cb(null);
            }

            /* tr_agenda 혹은 tr_opinion으로 삽입할 객체 기본 지정 */
            new_data._id = user.blog_id + "_" + date + randomstring.generate(6);
            new_data.name = user.name;
            new_data.blog_id = user.blog_id;
            new_data.img = user.img;
            new_data.language = language;
            new_data.main_tag = doc.main_tag;
            if (type === "agenda") {
                new_data.root_blog_id = doc.blog_id;
                new_data.agenda_id = _id;
                new_data.opinion_id = "";
                new_data.type = "tr_agenda";

                notification = {};
                notification.type = "translation_written";
                notification.link = "/agenda/" + doc._id + "/tr/" + new_data._id;
                notification.blog_id = user.blog_id;
                notification["info"] = {};
                notification["info"]["users"] = [];
                notification["info"]["users"].push({
                    blog_id: user.blog_id
                    , name: user.name
                    , img: user.img
                });
                notification["info"]["type"] = type;
                notification["info"]["title"] = title;
                notification["info"]["languages"] = {
                    source: doc.language
                    , target: language
                };
                notification.subscribers = _.without(doc.subscribers, user.blog_id);
            } else if (type === "opinion") {
                new_data.root_blog_id = doc.root_blog_id;
                new_data.agenda_id = agenda_id;
                new_data.opinion_id = _id;
                new_data.type = "tr_opinion";

                notification = {};
                notification.type = "translation_written";
                notification.link = "/agenda/" + doc.agenda_id + "/opinion/" + doc._id + "/tr/" + new_data._id;
                notification.blog_id = user.blog_id;
                notification["info"] = {};
                notification["info"]["users"] = [];
                notification["info"]["users"].push({
                    blog_id: user.blog_id
                    , name: user.name
                    , img: user.img
                });
                notification["info"]["type"] = type;
                notification["info"]["title"] = title;
                notification["info"]["languages"] = {
                    source: doc.language
                    , target: language
                };
                notification.subscribers = _.without(doc.agenda_subscribers, user.blog_id);
            }
            new_data.translated_vote_list = [];
            new_data.img_list = doc.img_list;
            new_data.is_youtube_inserted = doc.is_youtube_inserted;
            new_data.count_view = 0;
            new_data.count_awesome = 0;
            new_data.count_comments = 0;
            new_data.members = doc.members;
            new_data.public_authority = doc.public_authority;
            new_data.opinion_authority = doc.opinion_authority;
            new_data.translation_authority = doc.translation_authority;
            new_data.comment_authority = doc.comment_authority;
            new_data.likers = [];
            new_data.subscribers = [];
            new_data.subscribers.push(user.blog_id);
            new_data.is_removed = false;
            new_data.is_start_set = doc.is_start_set;
            new_data.start_at = doc.start_at;
            new_data.is_finish_set = doc.is_finish_set;
            new_data.finish_at = doc.finish_at;
            new_data.created_at = date;
            new_data.updated_at = date;
            new_data.date = methods.to_eight_digits_date();

            methods.get_divided_contents_for_translation_writing(connected_db, doc, function (divided_contents) {
                data = {};
                if (type === "agenda") {
                    original_link  = data["link"] = "/agenda/" + _id;
                } else if (type === "opinion") {
                    original_link  = data["link"] = "/agenda/" + agenda_id + "/opinion/" + _id;
                }
                link = original_link + "/tr/" + new_data._id;
                data["is_removed"] = false;
                methods.get_multi_votes(connected_db, data, function (docs) {
                    /* content의 투표함 choice_list 길이, _id, choice 그리고 docs의 choice_list _id, length와 비교하기 */
                    for (var j = 0; j < docs.length; j++) {
                        if ( vote_id_objs[docs[j]._id] !== undefined ) {
                            try {
                                if (vote_id_objs[docs[j]._id].choice_list && vote_id_objs[docs[j]._id].choice_list.length === docs[j].choice_list.length) {
                                    for (var k = 0; k < docs[j].choice_list.length; k++) {
                                        if (vote_id_objs[docs[j]._id].choice_list[k]._id !== docs[j].choice_list[k]._id) {
                                            return f_cb(null);
                                        }
                                    }
                                    vote_id_objs[docs[j]._id].exists = true;
                                }
                            } catch (e) {
                                return f_cb(null);
                            }
                        }
                    }
                    data = [];
                    for (var key in vote_id_objs) {
                        if (vote_id_objs[key].exists !== true) {
                            delete vote_id_objs[key];
                        } else {
                            /* multi mongo insert 위해 사용! */
                            // data.blog_id + "_" + date + randomstring.generate(6);
                            choice_list = [];
                            for (var m = 0; m < vote_id_objs[key].choice_list.length; m++) {
                                choice_list.push({
                                    _id: vote_id_objs[key].choice_list[m]._id
                                    , choice: vote_id_objs[key].choice_list[m].choice
                                });
                            }

                            temp = user.blog_id + "_" + date + randomstring.generate(6);

                            data.push({
                                _id: temp
                                , original_id: vote_id_objs[key]._id
                                , original_link: original_link
                                , root_id: new_data.agenda_id
                                , link: link
                                , blog_id: user.blog_id
                                , question: vote_id_objs[key].question
                                , choice_list: choice_list
                                , language: language
                                , public_authority: doc.public_authority
                                , is_removed: false
                                , created_at: date
                                , updated_at: date
                            });

                            vote_id_objs[key].created_id = temp;

                            /* 새로 삽입할 데이터에 번역한 투표 아이디 저장 */
                            new_data.translated_vote_list.push(temp);
                        }
                    }

                    if (Object.keys(vote_id_objs).length > 0) { /* 투표 존재할 경우 */
                        methods.insert_multi_translated_votes(connected_db, data, f_cb, function (nothing) {
                            for (var i = 0; i < divided_contents.length; i++) {
                                if (divided_contents[i].main_type === "content") {
                                    if (
                                        divided_contents[i].sub_type === "text"
                                    ) {
                                        temp = divided_contents[i].element.replace(/<br>/gi, '').replace(/<br \/>/gi, '').replace(/​/gi, '').trim();
                                        if (
                                            temp !== "" &&
                                            temp.length !== 0
                                        ) {
                                            if (content_index < content.length) { /* 아직 남은 번역 text 혹은 투표 남은 경우 */
                                                /* 현재 입력해야 하는 text 혹은 투표 index가 현재 divided_contents index와 같거나 작은 경우 추가하기 */
                                                if (content[content_index].index <= i) {
                                                    while ( content[content_index] && content[content_index].index <= i ) {
                                                        if (content[content_index].sub_type === "text") {
                                                            joined_content = joined_content + content[content_index].element;
                                                            content_index = content_index + 1;
                                                        } else if (content[content_index].sub_type === "vote") {
                                                            temp = vote_id_objs[content[content_index]._id];
                                                            if (temp !== undefined && temp.exists === true) { /* 투표가 존재할 경우 */
                                                                temp2 = "<iframe id='iframe-vote-" + temp._id + "' src='" + config.url + "/get/vote?q=" + temp._id + "&tr=" + temp.created_id + "' data-id='" + temp._id + "' marginwidth='0' marginheight='0' hspace='0' vspace='0' frameborder='0' scrolling='yes' height='" + temp.height + "px' class='iframe-vote' style='height: " + temp.height + "px;' onload='iframe_vote_load_callback(this);'></iframe>";
                                                                joined_content = joined_content + temp2;
                                                            }
                                                            content_index = content_index + 1;
                                                        } else {
                                                            content_index = content_index + 1;
                                                        }
                                                    }
                                                }
                                            }
                                        } else { /* 빈칸인 경우 */
                                            joined_content = joined_content + divided_contents[i].element;
                                        }
                                    } else if (divided_contents[i].sub_type === "vote") {
                                        if (content_index < content.length) { /* 아직 남은 번역 text 혹은 투표 남은 경우 */
                                            /* 현재 입력해야 하는 text 혹은 투표 index가 현재 divided_contents index와 같거나 작은 경우 추가하기 */
                                            if (content[content_index].index <= i) {
                                                while ( content[content_index] && content[content_index].index <= i ) {
                                                    if (content[content_index].sub_type === "text") {
                                                        joined_content = joined_content + content[content_index].element;
                                                        content_index = content_index + 1;
                                                    } else if (content[content_index].sub_type === "vote") {
                                                        temp = vote_id_objs[content[content_index]._id];
                                                        if (temp !== undefined && temp.exists === true) { /* 투표가 존재할 경우 */
                                                            temp2 = "<iframe id='iframe-vote-" + temp._id + "' src='" + config.url + "/get/vote?q=" + temp._id + "&tr=" + temp.created_id + "' data-id='" + temp._id + "' marginwidth='0' marginheight='0' hspace='0' vspace='0' frameborder='0' scrolling='yes' height='" + temp.height + "px' class='iframe-vote' style='height: " + temp.height + "px;' onload='iframe_vote_load_callback(this);'></iframe>";
                                                            joined_content = joined_content + temp2;
                                                        }
                                                        content_index = content_index + 1;
                                                    } else {
                                                        content_index = content_index + 1;
                                                    }
                                                }
                                            }
                                        }
                                    } else if (divided_contents[i].sub_type === "link") {
                                        temp = "<iframe src='" + divided_contents[i].src + "' marginwidth='0' marginheight='0' hspace='0' vspace='0' frameborder='0' scrolling='no' class='iframe-link'></iframe>";
                                        joined_content = joined_content + temp;
                                    } else if (divided_contents[i].sub_type === "youtube") {
                                        temp = "<iframe type='text/html' src='" + divided_contents[i].src + "' frameborder='0' allowfullscreen data-thumbnail='" + divided_contents[i].thumbnail + "' class='youtube'></iframe>";
                                        joined_content = joined_content + temp;
                                    } else if (divided_contents[i].sub_type === "img") {
                                        temp = "<img data-thumbnail='" + divided_contents[i].thumbnail + "' class='inserted-image' src='" + divided_contents[i].src + "'>";
                                        joined_content = joined_content + temp;
                                    } else {
                                        return f_cb(null);
                                    }
                                }
                            }
                            /* divided_contents 돌았는데 아직 추가하지 않은 content 남아 있는 경우 추가해주기 */
                            if (content_index < content.length) { /* 아직 남은 번역 text 혹은 투표 남은 경우 */
                                while ( content[content_index] && content_index < content.length ) {
                                    if (content[content_index].sub_type === "text") {
                                        joined_content = joined_content + content[content_index].element;
                                        content_index = content_index + 1;
                                    } else if (content[content_index].sub_type === "vote") {
                                        temp = vote_id_objs[content[content_index]._id];
                                        if (temp !== undefined && temp.exists === true) { /* 투표가 존재할 경우 */
                                            temp2 = "<iframe id='iframe-vote-" + temp._id + "' src='" + config.url + "/get/vote?q=" + temp._id + "&tr=" + temp.created_id + "' data-id='" + temp._id + "' marginwidth='0' marginheight='0' hspace='0' vspace='0' frameborder='0' scrolling='yes' height='" + temp.height + "px' class='iframe-vote' style='height: " + temp.height + "px;' onload='iframe_vote_load_callback(this);'></iframe>";
                                            joined_content = joined_content + temp2;
                                        }
                                        content_index = content_index + 1;
                                    } else {
                                        content_index = content_index + 1;
                                    }
                                }
                            }
                            $ = cheerio.load(joined_content, {decodeEntities: false});
                            $ = cheerio.load(sanitize_html($.html(), {
                                allowedTags: ['strong', 'em', 'br', 'u', 'iframe', 'img'],
                                allowedAttributes: {
                                    'iframe': ['src', 'type', 'allowfullscreen', 'data-thumbnail', 'marginwidth', 'marginheight', 'hspace', 'vspace', 'frameborder', 'scrolling', 'class', 'id', 'data-id', 'height', 'width', 'style', 'onload'],
                                    'img': ['data-thumbnail', 'class', 'src']
                                }
                            }), {decodeEntities: false});
                            new_data.title = title;
                            new_data.content = $.html();
                            new_data.tags = tags;

                            return methods.insert_translation(connected_db, new_data, f_cb, function (pathname) {
                                var first = {}
                                    , second = {};
                                second["$inc"] = {};
                                second["$inc"][doc.language + "_" + new_data.language] = 1;
                                methods.update_user_translation_count(connected_db, user_id, secret_id, second, function () {
                                    second = {};
                                    first.type = doc.type;
                                    first._id = doc._id;
                                    first["count_written_translations.language"] = language;

                                    second["$inc"] = {"count_written_translations.$.count": 1};

                                    if (type === "agenda") {
                                        second["$addToSet"] = {};
                                        second["$addToSet"]["subscribers"] = user.blog_id;
                                        methods.update_article_count(connected_db, "articles", first, second,
                                            function (nothing) {
                                                res.json({response:true, pathname:pathname});
                                                if (notification.subscribers.length > 0) {
                                                    methods.insert_notification(connected_db, notification, function (nothing) {
                                                        if (new_data.tags.length > 0) {
                                                            return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                });
                                                            });
                                                        } else {
                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                        }
                                                    }, function (nothing) {
                                                        if (new_data.tags.length > 0) {
                                                            return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                });
                                                            });
                                                        } else {
                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                        }
                                                    });
                                                } else {
                                                    if (new_data.tags.length > 0) {
                                                        return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                            return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            });
                                                        });
                                                    } else {
                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                    }
                                                }
                                            }, function (nothing) {
                                                res.json({response:true, pathname:pathname});
                                                if (notification.subscribers.length > 0) {
                                                    methods.insert_notification(connected_db, notification, function (nothing) {
                                                        if (new_data.tags.length > 0) {
                                                            return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                });
                                                            });
                                                        } else {
                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                        }
                                                    }, function (nothing) {
                                                        if (new_data.tags.length > 0) {
                                                            return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                });
                                                            });
                                                        } else {
                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                        }
                                                    });
                                                } else {
                                                    if (new_data.tags.length > 0) {
                                                        return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                            return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            });
                                                        });
                                                    } else {
                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                    }
                                                }
                                            });
                                    } else {
                                        methods.update_article_count(connected_db, "articles", first, second,
                                            function (nothing) {
                                                res.json({response:true, pathname:pathname});
                                                first = {};
                                                first.type = "agenda";
                                                first._id = doc.agenda_id;
                                                second = {};
                                                second["$addToSet"] = {};
                                                second["$addToSet"]["subscribers"] = user.blog_id;
                                                methods.update_article_count(connected_db, "articles", first, second,
                                                    function (nothing) {
                                                        if (notification.subscribers.length > 0) {
                                                            methods.insert_notification(connected_db, notification, function (nothing) {
                                                                if (new_data.tags.length > 0) {
                                                                    return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                        return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                        });
                                                                    });
                                                                } else {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                }
                                                            }, function (nothing) {
                                                                if (new_data.tags.length > 0) {
                                                                    return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                        return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                        });
                                                                    });
                                                                } else {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                }
                                                            });
                                                        } else {
                                                            if (new_data.tags.length > 0) {
                                                                return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                    return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                    });
                                                                });
                                                            } else {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            }
                                                        }
                                                    }, function (nothing) {
                                                        if (notification.subscribers.length > 0) {
                                                            methods.insert_notification(connected_db, notification, function (nothing) {
                                                                if (new_data.tags.length > 0) {
                                                                    return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                        return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                        });
                                                                    });
                                                                } else {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                }
                                                            }, function (nothing) {
                                                                if (new_data.tags.length > 0) {
                                                                    return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                        return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                        });
                                                                    });
                                                                } else {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                }
                                                            });
                                                        } else {
                                                            if (new_data.tags.length > 0) {
                                                                return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                    return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                    });
                                                                });
                                                            } else {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            }
                                                        }
                                                    });
                                            }, function (nothing) {
                                                res.json({response:true, pathname:pathname});
                                                first = {};
                                                first.type = "agenda";
                                                first._id = doc.agenda_id;
                                                second = {};
                                                second["$addToSet"] = {};
                                                second["$addToSet"]["subscribers"] = user.blog_id;
                                                methods.update_article_count(connected_db, "articles", first, second,
                                                    function (nothing) {
                                                        if (notification.subscribers.length > 0) {
                                                            methods.insert_notification(connected_db, notification, function (nothing) {
                                                                if (new_data.tags.length > 0) {
                                                                    return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                        return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                        });
                                                                    });
                                                                } else {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                }
                                                            }, function (nothing) {
                                                                if (new_data.tags.length > 0) {
                                                                    return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                        return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                        });
                                                                    });
                                                                } else {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                }
                                                            });
                                                        } else {
                                                            if (new_data.tags.length > 0) {
                                                                return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                    return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                    });
                                                                });
                                                            } else {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            }
                                                        }
                                                    }, function (nothing) {
                                                        if (notification.subscribers.length > 0) {
                                                            methods.insert_notification(connected_db, notification, function (nothing) {
                                                                if (new_data.tags.length > 0) {
                                                                    return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                        return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                        });
                                                                    });
                                                                } else {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                }
                                                            }, function (nothing) {
                                                                if (new_data.tags.length > 0) {
                                                                    return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                        return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                        });
                                                                    });
                                                                } else {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                }
                                                            });
                                                        } else {
                                                            if (new_data.tags.length > 0) {
                                                                return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                    return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                    });
                                                                });
                                                            } else {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            }
                                                        }
                                                    });
                                            });
                                    }
                                });
                            });
                        });
                    } else { /* 투표 존재하지 않는 경우 */
                        for (var i = 0; i < divided_contents.length; i++) {
                            if (divided_contents[i].main_type === "content") {
                                if (
                                    divided_contents[i].sub_type === "text"
                                ) {
                                    temp = divided_contents[i].element.replace(/<br>/gi, '').replace(/<br \/>/gi, '').replace(/​/gi, '').trim();
                                    if (
                                        temp !== "" &&
                                        temp.length !== 0
                                    ) {
                                        if (content_index < content.length) { /* 아직 남은 번역 text 남은 경우 */
                                            /* 현재 입력해야 하는 text index가 현재 divided_contents index와 같거나 작은 경우 추가하기 */
                                            if (content[content_index].index <= i) {
                                                while ( content[content_index] && content[content_index].index <= i ) {
                                                    if (content[content_index].sub_type === "text") {
                                                        joined_content = joined_content + content[content_index].element;
                                                        content_index = content_index + 1;
                                                    } else if (content[content_index].sub_type === "vote") {
                                                        content_index = content_index + 1;
                                                    } else {
                                                        content_index = content_index + 1;
                                                    }
                                                }
                                            }
                                        }
                                    } else { /* 빈칸인 경우 */
                                        joined_content = joined_content + divided_contents[i].element;
                                    }
                                } else if (divided_contents[i].sub_type === "vote") {
                                    if (content_index < content.length) { /* 아직 남은 번역 text 혹은 투표 남은 경우 */
                                        /* 현재 입력해야 하는 text 혹은 투표 index가 현재 divided_contents index와 같거나 작은 경우 추가하기 */
                                        if (content[content_index].index <= i) {
                                            while ( content[content_index] && content[content_index].index <= i ) {
                                                if (content[content_index].sub_type === "text") {
                                                    joined_content = joined_content + content[content_index].element;
                                                    content_index = content_index + 1;
                                                } else if (content[content_index].sub_type === "vote") {
                                                    content_index = content_index + 1;
                                                } else {
                                                    content_index = content_index + 1;
                                                }
                                            }
                                        }
                                    }
                                } else if (divided_contents[i].sub_type === "link") {
                                    temp = "<iframe src='" + divided_contents[i].src + "' marginwidth='0' marginheight='0' hspace='0' vspace='0' frameborder='0' scrolling='no' class='iframe-link'></iframe>";
                                    joined_content = joined_content + temp;
                                } else if (divided_contents[i].sub_type === "youtube") {
                                    temp = "<iframe type='text/html' src='" + divided_contents[i].src + "' frameborder='0' allowfullscreen data-thumbnail='" + divided_contents[i].thumbnail + "' class='youtube'></iframe>";
                                    joined_content = joined_content + temp;

                                } else if (divided_contents[i].sub_type === "img") {
                                    temp = "<img data-thumbnail='" + divided_contents[i].thumbnail + "' class='inserted-image' src='" + divided_contents[i].src + "'>";
                                    joined_content = joined_content + temp;
                                } else {
                                    return f_cb(null);
                                }
                            }
                        }
                        /* divided_contents 돌았는데 아직 추가하지 않은 content 남아 있는 경우 추가해주기 */
                        if (content_index < content.length) { /* 아직 남은 번역 text 혹은 투표 남은 경우 */
                            while ( content[content_index] && content_index < content.length ) {
                                if (content[content_index].sub_type === "text") {
                                    joined_content = joined_content + content[content_index].element;
                                    content_index = content_index + 1;
                                } else if (content[content_index].sub_type === "vote") {
                                    content_index = content_index + 1;
                                } else {
                                    content_index = content_index + 1;
                                }
                            }
                        }
                        $ = cheerio.load(joined_content, {decodeEntities: false});
                        $ = cheerio.load(sanitize_html($.html(), {
                            allowedTags: ['strong', 'em', 'br', 'u', 'iframe', 'img'],
                            allowedAttributes: {
                                'iframe': ['src', 'type', 'allowfullscreen', 'data-thumbnail', 'marginwidth', 'marginheight', 'hspace', 'vspace', 'frameborder', 'scrolling', 'class', 'id', 'data-id', 'height', 'width', 'style', 'onload'],
                                'img': ['data-thumbnail', 'class', 'src']
                            }
                        }), {decodeEntities: false});
                        new_data.title = title;
                        new_data.content = $.html();
                        new_data.tags = tags;
                        return methods.insert_translation(connected_db, new_data, f_cb, function (pathname) {
                            var first = {}
                                , second = {};
                            second["$inc"] = {};
                            second["$inc"][doc.language + "_" + new_data.language] = 1;
                            methods.update_user_translation_count(connected_db, user_id, secret_id, second, function () {
                                second = {};
                                first.type = doc.type;
                                first._id = doc._id;
                                first["count_written_translations.language"] = language;

                                second["$inc"] = {"count_written_translations.$.count": 1};

                                if (type === "agenda") {
                                    second["$addToSet"] = {};
                                    second["$addToSet"]["subscribers"] = user.blog_id;
                                    methods.update_article_count(connected_db, "articles", first, second,
                                        function (nothing) {
                                            res.json({response:true, pathname:pathname});
                                            if (notification.subscribers.length > 0) {
                                                methods.insert_notification(connected_db, notification, function (nothing) {
                                                    if (new_data.tags.length > 0) {
                                                        return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                            return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            });
                                                        });
                                                    } else {
                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                    }
                                                }, function (nothing) {
                                                    if (new_data.tags.length > 0) {
                                                        return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                            return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            });
                                                        });
                                                    } else {
                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                    }
                                                });
                                            } else {
                                                if (new_data.tags.length > 0) {
                                                    return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                        return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                        });
                                                    });
                                                } else {
                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                }
                                            }
                                        }, function (nothing) {
                                            res.json({response:true, pathname:pathname});
                                            if (notification.subscribers.length > 0) {
                                                methods.insert_notification(connected_db, notification, function (nothing) {
                                                    if (new_data.tags.length > 0) {
                                                        return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                            return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            });
                                                        });
                                                    } else {
                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                    }
                                                }, function (nothing) {
                                                    if (new_data.tags.length > 0) {
                                                        return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                            return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            });
                                                        });
                                                    } else {
                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                    }
                                                });
                                            } else {
                                                if (new_data.tags.length > 0) {
                                                    return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                        return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                        });
                                                    });
                                                } else {
                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                }
                                            }
                                        });
                                } else {
                                    methods.update_article_count(connected_db, "articles", first, second,
                                        function (nothing) {
                                            res.json({response:true, pathname:pathname});
                                            first = {};
                                            first.type = "agenda";
                                            first._id = doc.agenda_id;
                                            second = {};
                                            second["$addToSet"] = {};
                                            second["$addToSet"]["subscribers"] = user.blog_id;
                                            methods.update_article_count(connected_db, "articles", first, second,
                                                function (nothing) {
                                                    if (notification.subscribers.length > 0) {
                                                        methods.insert_notification(connected_db, notification, function (nothing) {
                                                            if (new_data.tags.length > 0) {
                                                                return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                    return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                    });
                                                                });
                                                            } else {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            }
                                                        }, function (nothing) {
                                                            if (new_data.tags.length > 0) {
                                                                return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                    return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                    });
                                                                });
                                                            } else {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            }
                                                        });
                                                    } else {
                                                        if (new_data.tags.length > 0) {
                                                            return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                });
                                                            });
                                                        } else {
                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                        }
                                                    }
                                                }, function (nothing) {
                                                    if (notification.subscribers.length > 0) {
                                                        methods.insert_notification(connected_db, notification, function (nothing) {
                                                            if (new_data.tags.length > 0) {
                                                                return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                    return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                    });
                                                                });
                                                            } else {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            }
                                                        }, function (nothing) {
                                                            if (new_data.tags.length > 0) {
                                                                return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                    return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                    });
                                                                });
                                                            } else {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            }
                                                        });
                                                    } else {
                                                        if (new_data.tags.length > 0) {
                                                            return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                });
                                                            });
                                                        } else {
                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                        }
                                                    }
                                                });
                                        }, function (nothing) {
                                            res.json({response:true, pathname:pathname});
                                            first = {};
                                            first.type = "agenda";
                                            first._id = doc.agenda_id;
                                            second = {};
                                            second["$addToSet"] = {};
                                            second["$addToSet"]["subscribers"] = user.blog_id;
                                            methods.update_article_count(connected_db, "articles", first, second,
                                                function (nothing) {
                                                    if (notification.subscribers.length > 0) {
                                                        methods.insert_notification(connected_db, notification, function (nothing) {
                                                            if (new_data.tags.length > 0) {
                                                                return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                    return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                    });
                                                                });
                                                            } else {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            }
                                                        }, function (nothing) {
                                                            if (new_data.tags.length > 0) {
                                                                return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                    return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                    });
                                                                });
                                                            } else {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            }
                                                        });
                                                    } else {
                                                        if (new_data.tags.length > 0) {
                                                            return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                });
                                                            });
                                                        } else {
                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                        }
                                                    }
                                                }, function (nothing) {
                                                    if (notification.subscribers.length > 0) {
                                                        methods.insert_notification(connected_db, notification, function (nothing) {
                                                            if (new_data.tags.length > 0) {
                                                                return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                    return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                    });
                                                                });
                                                            } else {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            }
                                                        }, function (nothing) {
                                                            if (new_data.tags.length > 0) {
                                                                return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                    return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                        return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                    });
                                                                });
                                                            } else {
                                                                return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                            }
                                                        });
                                                    } else {
                                                        if (new_data.tags.length > 0) {
                                                            return methods.upsert_keywords(connected_db, new_data.language, new_data.tags, function () {
                                                                return methods.upsert_user_tags(connected_db, user, new_data.tags, 0, "inc", function () {
                                                                    return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                                });
                                                            });
                                                        } else {
                                                            return es_methods.es_insert_article(connected_db, es_client, new_data);
                                                        }
                                                    }
                                                });
                                        });
                                }
                            });
                        });
                    }
                });
            });
        };

        /* 게시물 존재 확인 */
        if (type === "agenda") {
            methods.get_single_agenda(connected_db, user, data, "translation", "all", f_cb3, function (doc) {
                go(doc);
            });
        } else if (type === "opinion") {
            methods.get_single_opinion(connected_db, user, data, "translation", "all", f_cb3, function (doc) {
                methods.get_single_agenda(connected_db, user, {type: "agenda", _id: doc.agenda_id}, "translation", "all", f_cb3, function (agenda) {
                    doc.agenda_subscribers = agenda.subscribers;
                    go(doc);
                });
            });
        } else {
            return f_cb(null);
        }
    });
});


/**
 * 논제 업데이트하기
 * - req.body 필수요소
 * _id
 * profile
 * main_tag
 * tags
 * title
 * content
 * img_list
 *
 * - user 정보에서 업데이트할 요소
 * name
 * blog_id
 * img
 *
 *
 * - 추가 업데이트 요소
 * updated_at
 * date(?) - elasticsearch 사용 시 뺄 것이기 때문에 업데이트 안하기.
 *
 * - 확인할 부분
 * 1. 로그인한 사용자
 * 2. 사용자 blog_id 및 _id로 게시물 존재 여부
 */
app.post('/update/agenda', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    /*var s_cb = function (pathname) {return res.json({response:true, pathname:pathname});};*/
    var first={}
        , second={}
        , updated_obj = {}
        , date
        , temp;
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);

    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }

    if (
        req.body._id === undefined ||
        req.body.public_authority === undefined ||
        req.body.opinion_authority === undefined ||
        req.body.comment_authority === undefined ||
        req.body.is_start_set === undefined ||
        req.body.start_at === undefined ||
        req.body.is_finish_set === undefined ||
        req.body.finish_at === undefined ||
        req.body.profile === undefined ||
        req.body.language === undefined ||
        req.body.main_tag === undefined ||
        req.body.tags === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined ||
        req.body.img_list === undefined
    ) {
        return f_cb(null);
    }

    var content = decodeURIComponent(req.body.content);

    updated_obj["_id"] = first["_id"] = decodeURIComponent(req.body._id);
    updated_obj["type"] = first["type"] = "agenda";
    first["is_removed"] = false;

    second["$set"] = {};
    second["$set"]["public_authority"] = decodeURIComponent(req.body.public_authority);
    second["$set"]["opinion_authority"] = decodeURIComponent(req.body.opinion_authority);
    second["$set"]["translation_authority"] = second["$set"]["opinion_authority"];
    second["$set"]["comment_authority"] = decodeURIComponent(req.body.comment_authority);
    second["$set"]["is_start_set"] = decodeURIComponent(req.body.is_start_set);
    updated_obj["is_start_set"] = second["$set"]["is_start_set"] = second["$set"]["is_start_set"] === "true";
    second["$set"]["start_at"] = decodeURIComponent(req.body.start_at);
    second["$set"]["is_finish_set"] = decodeURIComponent(req.body.is_finish_set);
    updated_obj["is_finish_set"] = second["$set"]["is_finish_set"] = second["$set"]["is_finish_set"] === "true";
    second["$set"]["finish_at"] = decodeURIComponent(req.body.finish_at);
    updated_obj["profile"] = second["$set"]["profile"] = decodeURIComponent(req.body.profile);
    updated_obj["language"] = second["$set"]["language"] = "ko"; /*decodeURIComponent(req.body.language);*/
    updated_obj["main_tag"] = second["$set"]["main_tag"] = decodeURIComponent(req.body.main_tag);
    updated_obj["tags"] = second["$set"]["tags"] = JSON.parse(decodeURIComponent(req.body.tags));
    updated_obj["title"] = second["$set"]["title"] = decodeURIComponent(req.body.title).trim().replace(/\s\s+/gi, ' ');
    second["$set"]["content"] = content;
    updated_obj["img_list"] = second["$set"]["img_list"] = JSON.parse(decodeURIComponent(req.body.img_list));
    try {
        second["$set"].public_authority = parseInt(second["$set"].public_authority);
        if (
            second["$set"].public_authority !== 1 &&
            second["$set"].public_authority !== 2
        ) {
            return f_cb(null);
        }

        second["$set"].opinion_authority = parseInt(second["$set"].opinion_authority);
        if (
            second["$set"].opinion_authority !== 1 &&
            second["$set"].opinion_authority !== 2
        ) {
            return f_cb(null);
        }

        /*second["$set"].translation_authority = parseInt(second["$set"].translation_authority);
        if (
            second["$set"].translation_authority !== 1 &&
            second["$set"].translation_authority !== 2
        ) {
            return f_cb(null);
        }*/
        second["$set"].translation_authority = second["$set"].opinion_authority;

        second["$set"].comment_authority = parseInt(second["$set"].comment_authority);
        if (
            second["$set"].comment_authority !== 1 &&
            second["$set"].comment_authority !== 2
        ) {
            return f_cb(null);
        }

        if (second["$set"].public_authority === 2) {
            second["$set"].comment_authority = second["$set"].translation_authority = second["$set"].opinion_authority = 2;
        }

        if (second["$set"]["is_start_set"] === false) {
            second["$set"].start_at = 0;
        } else {
            second["$set"].start_at = parseInt(second["$set"].start_at);
            date = new Date();
            temp = date.valueOf();
            if (second["$set"].start_at < temp) { /* Current time > start_at */
                second["$set"].start_at = temp;
            } else {
                if (second["$set"].start_at > DATE_MAX_VALUE) {
                    return f_cb(null);
                }
            }
        }

        if (second["$set"]["is_finish_set"] === false) {
            second["$set"].finish_at = DATE_MAX_VALUE;
        } else {
            second["$set"].finish_at = parseInt(second["$set"].finish_at);
            date = new Date();
            date.setFullYear(date.getFullYear() + 6);
            temp = date.valueOf();
            if (second["$set"].finish_at > temp || second["$set"].finish_at > DATE_MAX_VALUE) {
                return f_cb(null);
            }
        }

        if (second["$set"].start_at > second["$set"].finish_at) {
            return f_cb(null);
        }
    } catch (e) {
        return f_cb(null);
    }
    updated_obj["public_authority"] = second["$set"]["public_authority"];
    updated_obj["opinion_authority"] = second["$set"]["opinion_authority"];
    updated_obj["translation_authority"] = second["$set"]["translation_authority"];
    updated_obj["comment_authority"] = second["$set"]["comment_authority"];
    updated_obj["start_at"] = second["$set"]["start_at"];
    updated_obj["finish_at"] = second["$set"]["finish_at"];

    /* language 확인 */
    if (
        second["$set"]["language"] !== "en" &&
        second["$set"]["language"] !== "ja" &&
        second["$set"]["language"] !== "ko" &&
        second["$set"]["language"] !== "zh-Hans"
    ) {
        return f_cb(null);
    }

    /* main_tag 비워있는지 */
    if (second["$set"]["main_tag"] === "") {
        return f_cb(null);
    }
    /* String */
    /* profile, main_tag, title, content */
    if (
        (Object.prototype.toString.call(first["_id"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["profile"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["main_tag"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["title"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["content"]) !== "[object String]")

    ) {
        return f_cb(null);
    }

    var is_main_tag_correct = false;
    for (var i = 0; i < main_tags.length; i++) {
        if (main_tags[i].tag === second["$set"]["main_tag"]) {
            is_main_tag_correct = true;
            break;
        }
    }
    if (is_main_tag_correct === false) {
        return f_cb(null);
    }

    /* Array 확인 */
    /* tags, img_list */
    if (
        (Object.prototype.toString.call(second["$set"]["tags"]) !== "[object Array]") ||
        (Object.prototype.toString.call(second["$set"]["img_list"]) !== "[object Array]")
    ) {
        return f_cb(null);
    }

    for (var i = 0; i < second["$set"].tags.length; i++) {
        if (Object.prototype.toString.call(second["$set"].tags[i]) !== "[object String]") {
            return f_cb(null);
        }
        second["$set"].tags[i] = second["$set"].tags[i].replace(/\s+/gi, '').toLowerCase();
        if (second["$set"].tags[i] === "") {
            return f_cb(null);
        }
    }
    updated_obj["tags"] = second["$set"].tags;

    for (var i = 0; i < second["$set"].img_list.length; i++) {
        if (Object.prototype.toString.call(second["$set"].img_list[i]) !== "[object String]") {
            return f_cb(null);
        }
    }

    updated_obj["content"] = second["$set"]["content"] = methods.get_xss_prevented_content("debate", second["$set"]["content"]);
    updated_obj["is_youtube_inserted"] = second["$set"]["is_youtube_inserted"] = methods.is_youtube_inserted(second["$set"]["content"]);
    updated_obj["updated_at"] = second["$set"]["updated_at"] = new Date().valueOf();
    updated_obj["date"] = second["$set"]["date"] = methods.to_eight_digits_date();

    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        updated_obj["name"] = user.name;
        updated_obj["blog_id"] = first["blog_id"] = user.blog_id;
        updated_obj["img"] = second["$set"]["img"] = user.img;
        methods.get_single_agenda(connected_db, user, {_id: first["_id"], type: "agenda"}, "public", "all", f_cb, function (doc) {
            if (user.blog_id !== doc.blog_id) {
                return f_cb(null);
            }

            updated_obj["count_view"] = doc.count_view;
            updated_obj["count_awesome"] = doc.count_awesome;
            updated_obj["count_written_opinions"] = doc.count_written_opinions;
            updated_obj["count_requested_opinions"] = doc.count_requested_opinions;
            updated_obj["count_written_translations"] = doc.count_written_translations;
            updated_obj["count_requested_translations"] = doc.count_requested_translations;
            updated_obj["count_comments"] = doc.count_comments;
            updated_obj["created_at"] = doc.created_at;

            updated_obj["es_index"] = doc.es_index;
            updated_obj["es_type"] = doc.es_type;
            updated_obj["es_id"] = doc.es_id;

            var vote_id_objs = {}
                , link = "/agenda/" + first["_id"];

            /* When translation exists, language cannot be changed. */
            var total_count_written_translations = 0
                , cannot_change_language = false;
            for (var i = 0; i < doc.count_written_translations.length; i++) {
                total_count_written_translations = total_count_written_translations + doc.count_written_translations[i].count;
            }
            if (
                (total_count_written_translations > 0) &&
                (second["$set"]["language"] !== doc.language)
            ) {
                cannot_change_language = true;
                updated_obj["language"] = second["$set"]["language"] = doc.language;
            }

            methods.get_multi_votes(connected_db, { blog_id: user.blog_id, link: link, is_removed: false }, function (docs) {
                /* content의 투표함 choice_list 길이, _id, choice 그리고 docs의 choice_list _id, length와 비교하기 */
                for (var j = 0; j < docs.length; j++) {
                    if ( vote_id_objs[docs[j]._id] === undefined ) {
                        vote_id_objs[docs[j]._id] = true;
                    }
                }
                if (
                    updated_obj["public_authority"] !== doc.public_authority &&
                    updated_obj["public_authority"] === 2
                ) { /* Copy members to subscribers */
                    updated_obj["subscribers"] = second["$set"]["subscribers"] = doc.members;
                }
                methods.update_article(connected_db, first, second, user, vote_id_objs, f_cb, function (pathname) {
                    res.json({response:true, pathname:pathname, cannot_change_language: cannot_change_language});
                    first = {};
                    second = {};
                    first.link = link;
                    second["$set"] = {};
                    second["$set"].article_language = updated_obj["language"];
                    methods.update_comments_language(connected_db, first, second, function () {
                        methods.update_debate_info_of_agenda(connected_db, updated_obj, function () {
                            return methods.update_authority_of_agenda_children(connected_db, updated_obj, function () {
                                return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                    return methods.upsert_user_tags(connected_db, user, updated_obj["tags"], 0, "inc", function () {
                                        return es_methods.es_update_article(connected_db, es_client, updated_obj);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

/**
 * 의견 업데이트하기
 * - req.body 필수요소
 * _id
 * _agenda_id
 * profile
 * main_tag
 * tags
 * title
 * content
 * img_list
 *
 * - user 정보에서 업데이트할 요소
 * name
 * blog_id
 * img
 *
 * - 추가 업데이트 요소
 * updated_at
 * date(?) - elasticsearch 사용 시 뺄 것이기 때문에 업데이트 안하기.
 *
 * - 확인할 부분
 * 1. 로그인한 사용자
 * 2. 사용자 blog_id 및 _id로 게시물 존재 여부
 */
app.post('/update/opinion', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});}
        , f_cb2 = function (nothing) {return res.json({response:false, msg: "time_error"});}
        , f_cb3 = function (nothing) {return res.json({response:false, msg: "no_access"});}
        , datetime = new Date().valueOf();

    var first = {}
        , second = {}
        , updated_obj = {};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);

    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }

    /*
     * _id
     * _agenda_id
     * profile
     * main_tag
     * tags
     * title
     * content
     * img_list
     */

    if (
        req.body._id === undefined ||
        req.body.agenda_id === undefined ||
        req.body.profile === undefined ||
        req.body.language === undefined ||
        req.body.main_tag === undefined ||
        req.body.tags === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined ||
        req.body.img_list === undefined
    ){
        return f_cb(null);
    }

    /* agenda_id는 해당 논제가 존재하는지 확인 위해 사용. */
    var content = decodeURIComponent(req.body.content)
        , agenda_id = decodeURIComponent(req.body.agenda_id);

    updated_obj["_id"] = first["_id"] = decodeURIComponent(req.body._id);
    updated_obj["agenda_id"] = first["agenda_id"] = agenda_id;
    updated_obj["type"] = first["type"] = "opinion";

    second["$set"] = {};
    updated_obj["profile"] = second["$set"]["profile"] = decodeURIComponent(req.body.profile);
    updated_obj["language"] = second["$set"]["language"] = "ko";/*decodeURIComponent(req.body.language);*/
    updated_obj["main_tag"] = second["$set"]["main_tag"] = decodeURIComponent(req.body.main_tag);
    updated_obj["tags"] = second["$set"]["tags"] = JSON.parse(decodeURIComponent(req.body.tags));
    updated_obj["title"] = second["$set"]["title"] = decodeURIComponent(req.body.title).trim().replace(/\s\s+/gi, ' ');
    second["$set"]["content"] = content;
    updated_obj["img_list"] = second["$set"]["img_list"] = JSON.parse(decodeURIComponent(req.body.img_list));

    /* 데이터 유형 확인 */
    /* language 확인 */
    if (
        second["$set"]["language"] !== "en" &&
        second["$set"]["language"] !== "ja" &&
        second["$set"]["language"] !== "ko" &&
        second["$set"]["language"] !== "zh-Hans"
    ) {
        return f_cb(null);
    }

    /* main_tag */
    if (second["$set"]["main_tag"] === "") {
        return f_cb(null);
    }

    var is_main_tag_correct = false;
    for (var i = 0; i < main_tags.length; i++) {
        if (main_tags[i].tag === second["$set"]["main_tag"]) {
            is_main_tag_correct = true;
            break;
        }
    }
    if (is_main_tag_correct === false) {
        return f_cb(null);
    }

    /* String */
    /* agenda_id, profile, main_tag, title, content */
    if (
        (Object.prototype.toString.call(first["_id"]) !== "[object String]") ||
        (Object.prototype.toString.call(agenda_id) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["profile"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["main_tag"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["title"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["content"]) !== "[object String]")
    ) {
        return f_cb(null);
    }

    /* Array 확인 */
    /* tags, img_list */
    if (
        (Object.prototype.toString.call(second["$set"]["tags"]) !== "[object Array]") ||
        (Object.prototype.toString.call(second["$set"]["img_list"]) !== "[object Array]")
    ) {
        return f_cb(null);
    }

    for (var i = 0; i < second["$set"].tags.length; i++) {
        if (Object.prototype.toString.call(second["$set"].tags[i]) !== "[object String]") {
            return f_cb(null);
        }
        second["$set"].tags[i] = second["$set"].tags[i].replace(/\s+/gi, '').toLowerCase();
        if (second["$set"].tags[i] === "") {
            return f_cb(null);
        }
    }
    updated_obj["tags"] = second["$set"].tags;

    for (var i = 0; i < second["$set"].img_list.length; i++) {
        if (Object.prototype.toString.call(second["$set"].img_list[i]) !== "[object String]") {
            return f_cb(null);
        }
    }

    first["is_removed"] = false;
    updated_obj["content"] = second["$set"]["content"] = methods.get_xss_prevented_content("debate", second["$set"]["content"]);
    updated_obj["is_youtube_inserted"] = second["$set"]["is_youtube_inserted"] = methods.is_youtube_inserted(second["$set"]["content"]);
    updated_obj["updated_at"] = second["$set"].updated_at = new Date().valueOf();
    updated_obj["date"] = second["$set"].date = methods.to_eight_digits_date();

    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        updated_obj["name"] = user.name;
        updated_obj["blog_id"] = first["blog_id"] = user.blog_id;
        updated_obj["img"] = second["$set"]["img"] = user.img;
        methods.get_single_opinion(connected_db, user, {_id: first["_id"], agenda_id: agenda_id, type: "opinion"}, "opinion", "all", f_cb3, function (doc) {
            if (user.blog_id !== doc.blog_id) {
                return f_cb(null);
            }
            if (doc.is_start_set === true) {
                if (doc.start_at > datetime) { /* Scheduled */
                    return f_cb2(null);
                } else {
                    if (doc.is_finish_set === true) {
                        if (doc.finish_at > datetime) { /* In Progress */

                        } else { /* Finished */
                            return f_cb2(null);
                        }
                    } else { /* Unlimited */

                    }
                }
            } else {
                if (doc.is_finish_set === true) {
                    if (doc.finish_at > datetime) { /* In Progress */

                    } else { /* Finished */
                        return f_cb2(null);
                    }
                } else { /* Unlimited */

                }
            }

            second["$set"]["public_authority"] = doc.public_authority;
            second["$set"]["is_start_set"] = doc.is_start_set;
            second["$set"]["start_at"] = doc.start_at;
            second["$set"]["is_finish_set"] = doc.is_finish_set;
            second["$set"]["finish_at"] = doc.finish_at;

            updated_obj["count_view"] = doc.count_view;
            updated_obj["count_awesome"] = doc.count_awesome;
            updated_obj["count_written_translations"] = doc.count_written_translations;
            updated_obj["count_requested_translations"] = doc.count_requested_translations;
            updated_obj["count_comments"] = doc.count_comments;
            updated_obj["public_authority"] = doc.public_authority;
            updated_obj["created_at"] = doc.created_at;

            updated_obj["es_index"] = doc.es_index;
            updated_obj["es_type"] = doc.es_type;
            updated_obj["es_id"] = doc.es_id;

            var vote_id_objs = {}
                , link = "/agenda/" + agenda_id + "/opinion/" + first["_id"];

            /* When translation exists, language cannot be changed. */
            var total_count_written_translations = 0
                , cannot_change_language = false;
            for (var i = 0; i < doc.count_written_translations.length; i++) {
                total_count_written_translations = total_count_written_translations + doc.count_written_translations[i].count;
            }
            if (
                (total_count_written_translations > 0) &&
                (second["$set"]["language"] !== doc.language)
            ) {
                cannot_change_language = true;
                updated_obj["language"] = second["$set"]["language"] = doc.language;
            }

            methods.get_multi_votes(connected_db, { blog_id: user.blog_id, link: link, is_removed: false }, function (docs) {
                /* content의 투표함 choice_list 길이, _id, choice 그리고 docs의 choice_list _id, length와 비교하기 */
                for (var j = 0; j < docs.length; j++) {
                    if ( vote_id_objs[docs[j]._id] === undefined ) {
                        vote_id_objs[docs[j]._id] = true;
                    }
                }
                methods.update_article(connected_db, first, second, user, vote_id_objs, f_cb, function (pathname) {
                    res.json({response:true, pathname:pathname, cannot_change_language: cannot_change_language});
                    first = {};
                    second = {};
                    first.link = link;
                    second["$set"] = {};
                    second["$set"].article_language = updated_obj["language"];
                    methods.update_comments_language(connected_db, first, second, function () {
                        return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                            return methods.upsert_user_tags(connected_db, user, updated_obj["tags"], 0, "inc", function () {
                                return es_methods.es_update_article(connected_db, es_client, updated_obj);
                            });
                        });
                    });
                });
            });
        });
    });
});

/**
 * 블로그 업데이트하기
 * - req.body 필수 요소
 * _id
 * blog_menu_id
 * tags
 * title
 * content
 * img_list
 * public_authority
 *
 * - user에서 가져와야 할 필드
 * img
 * blog_name
 * blog_id
 *
 * - 추가 업데이트 요소
 * updated_at
 * date(?) - elasticsearch 사용 시 뺄 것이기 때문에 업데이트 안하기.
 *
 * - 확인할 부분
 * 1. 로그인한 사용자
 * 2. 사용자 blog_id 및 _id로 게시물 존재 여부
 */

/**
 * 현재 _id, blog_menu_id undefeined 임.
 */
app.post('/update/blog', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});};

    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);

    /* 비로그인 사용자 체크 */
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }

    /* 필수 요소 존재여부 체크 */
    if (
        req.body._id === undefined ||
        req.body.language === undefined ||
        req.body.public_authority === undefined ||
        req.body.blog_menu_id === undefined ||
        req.body.tags === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined ||
        req.body.img_list === undefined
    ) {
        return f_cb(null);
    }

    var first = {}
        , second = {}
        , updated_obj = {};
    updated_obj["_id"] = first._id = decodeURIComponent(req.body._id);
    updated_obj["type"] = first["type"] = "blog";
    second["$set"] = {};
    updated_obj["language"] = second["$set"].language = "ko";/*decodeURIComponent(req.body.language);*/
    second["$set"].public_authority = decodeURIComponent(req.body.public_authority);
    updated_obj["blog_menu_id"] = second["$set"].blog_menu_id = decodeURIComponent(req.body.blog_menu_id);
    updated_obj["tags"] = second["$set"].tags = JSON.parse(decodeURIComponent(req.body.tags));
    updated_obj["title"] = second["$set"].title = decodeURIComponent(req.body.title).trim().replace(/\s\s+/gi, ' ');
    second["$set"].content = decodeURIComponent(req.body.content);
    updated_obj["img_list"] = second["$set"].img_list = JSON.parse(decodeURIComponent(req.body.img_list));
    /* 데이터 유형 확인 */
    /* language 확인 */
    if (
        second["$set"].language !== "en" &&
        second["$set"].language !== "ja" &&
        second["$set"].language !== "ko" &&
        second["$set"].language !== "zh-Hans"
    ) {
        return f_cb(null);
    }
    /* Number */
    /* public_authority */
    try {
        updated_obj["public_authority"] = second["$set"].public_authority = parseInt(second["$set"].public_authority);
        if (
            second["$set"].public_authority !== 0 &&
            second["$set"].public_authority !== 1 &&
            second["$set"].public_authority !== 2
        ) {
            return f_cb(null);
        }
    } catch (e) {
        return f_cb(null);
    }

    /* String */
    /* blog_menu_id, title, content */
    if (
        (Object.prototype.toString.call(first["_id"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["blog_menu_id"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["title"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["content"]) !== "[object String]")
    ) {
        return f_cb(null);
    }

    /* Array 확인 */
    /* tags, img_list */
    if (
        (Object.prototype.toString.call(second["$set"]["tags"]) !== "[object Array]") ||
        (Object.prototype.toString.call(second["$set"]["img_list"]) !== "[object Array]")
    ) {
        return f_cb(null);
    }

    for (var i = 0; i < second["$set"].tags.length; i++) {
        if (Object.prototype.toString.call(second["$set"].tags[i]) !== "[object String]") {
            return f_cb(null);
        }
        second["$set"].tags[i] = second["$set"].tags[i].replace(/\s+/gi, '').toLowerCase();
        if (second["$set"].tags[i] === "") {
            return f_cb(null);
        }
    }
    updated_obj["tags"] = second["$set"].tags;
    for (var i = 0; i < second["$set"].img_list.length; i++) {
        if (Object.prototype.toString.call(second["$set"].img_list[i]) !== "[object String]") {
            return f_cb(null);
        }
    }

    /* blog_menu_id 확인 */
    if (
        second["$set"].blog_menu_id === 'debate' ||
        second["$set"].blog_menu_id === 'gallery' ||
        second["$set"].blog_menu_id === 'guestbook'
    ) {
        return f_cb(null);
    }

    first["is_removed"] = false;
    updated_obj["content"] = second["$set"]["content"] = methods.get_xss_prevented_content("blog", second["$set"]["content"]);
    updated_obj["is_youtube_inserted"] = second["$set"]["is_youtube_inserted"] = methods.is_youtube_inserted(second["$set"]["content"]);
    updated_obj["updated_at"] = second["$set"].updated_at = new Date().valueOf();
    updated_obj["date"] = second["$set"].date = methods.to_eight_digits_date();
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        updated_obj["blog_id"] = first["blog_id"] = user.blog_id;
        updated_obj["img"] = second["$set"].img = user.img;
        updated_obj["blog_name"] = second["$set"].blog_name = user.blog_name;
        methods.check_blog_menu(connected_db, user.blog_id, second["$set"].blog_menu_id, f_cb, function (nothing) {
            methods.get_single_blog(connected_db, user, {_id: first["_id"], blog_id: user.blog_id, type: "blog"}, "all", f_cb, function (doc) {
                if (user.blog_id !== doc.blog_id) {
                    return f_cb(null);
                }
                var vote_id_objs = {}
                    , link = "/blog/" + user.blog_id + "/" + doc.blog_menu_id + "/" + doc._id;

                first["blog_menu_id"] = doc.blog_menu_id;

                updated_obj["count_view"] = doc.count_view;
                updated_obj["count_awesome"] = doc.count_awesome;
                updated_obj["count_written_translations"] = doc.count_written_translations;
                updated_obj["count_requested_translations"] = doc.count_requested_translations;
                updated_obj["count_comments"] = doc.count_comments;
                updated_obj["created_at"] = doc.created_at;

                updated_obj["es_index"] = doc.es_index;
                updated_obj["es_type"] = doc.es_type;
                updated_obj["es_id"] = doc.es_id;

                if (second["$set"].public_authority !== doc.public_authority ) {
                    if (doc.public_authority === 1) {
                        second["$set"].subscribers = [];
                        second["$set"].subscribers.push(user.blog_id);
                    } else {
                        if (
                            doc.public_authority === 2 &&
                            second["$set"].public_authority === 0
                        ) {
                            second["$set"].subscribers = [];
                            second["$set"].subscribers.push(user.blog_id);
                        }
                    }
                }

                methods.get_multi_votes(connected_db, { blog_id: user.blog_id, link: link, is_removed: false }, function (docs) {
                    /* content의 투표함 choice_list 길이, _id, choice 그리고 docs의 choice_list _id, length와 비교하기 */
                    for (var j = 0; j < docs.length; j++) {
                        if ( vote_id_objs[docs[j]._id] === undefined ) {
                            vote_id_objs[docs[j]._id] = true;
                        }
                    }
                    methods.update_article(connected_db, first, second, user, vote_id_objs, f_cb, function (pathname) {
                        res.json({response:true, pathname:pathname});
                        first = {};
                        second = {};
                        first.link = link;
                        second["$set"] = {};
                        second["$set"].article_language = updated_obj["language"];
                        second["$set"].public_authority = updated_obj["public_authority"];
                        methods.update_comments_language(connected_db, first, second, function () {
                            return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                return methods.upsert_user_tags(connected_db, user, updated_obj["tags"], 0, "inc", function () {
                                    return es_methods.es_update_article(connected_db, es_client, updated_obj);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

/**
 * 앨범 업데이트하기
 * - req.body 필수 요소
 * _id
 * tags
 * title
 * content
 * public_authority
 *
 * - user에서 가져와야 할 필드
 * blog_name
 * blog_id
 *
 * - 추가 업데이트 요소
 * updated_at
 * date(?) - elasticsearch 사용 시 뺄 것이기 때문에 업데이트 안하기.
 *
 * - 확인할 부분
 * 1. 로그인한 사용자
 * 2. 사용자 blog_id 및 _id로 게시물 존재 여부
 */
app.post('/update/gallery', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});};

    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);

    /* 비로그인 사용자 체크 */
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }

    /* 필수 요소 존재여부 체크 */
    if (
        req.body._id === undefined ||
        req.body.language === undefined ||
        req.body.public_authority === undefined ||
        req.body.tags === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined
    ) {
        return f_cb(null);
    }

    var first = {}
        , second = {}
        , updated_obj = {};

    updated_obj["_id"] = first._id = decodeURIComponent(req.body._id);
    updated_obj["type"] = first["type"] = "gallery";
    second["$set"] = {};
    updated_obj["language"] = second["$set"].language = "ko";/*decodeURIComponent(req.body.language);*/
    second["$set"].public_authority = decodeURIComponent(req.body.public_authority);
    updated_obj["tags"] = second["$set"].tags = JSON.parse(decodeURIComponent(req.body.tags));
    updated_obj["title"] = second["$set"].title = decodeURIComponent(req.body.title).trim().replace(/\s\s+/gi, ' ');
    updated_obj["content"] = second["$set"].content = decodeURIComponent(req.body.content);
    /* 데이터 유형 확인 */
    /* language 확인 */
    if (
        second["$set"].language !== "en" &&
        second["$set"].language !== "ja" &&
        second["$set"].language !== "ko" &&
        second["$set"].language !== "zh-Hans"
    ) {
        return f_cb(null);
    }
    /* Number */
    /* public_authority */
    try {
        updated_obj["public_authority"] = second["$set"].public_authority = parseInt(second["$set"].public_authority);
        if (
            second["$set"].public_authority !== 0 &&
            second["$set"].public_authority !== 1 &&
            second["$set"].public_authority !== 2
        ) {
            return f_cb(null);
        }
    } catch (e) {
        return f_cb(null);
    }

    /* String */
    /* blog_menu_id, title, content */
    if (
        (Object.prototype.toString.call(first["_id"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["title"]) !== "[object String]") ||
        (Object.prototype.toString.call(second["$set"]["content"]) !== "[object String]")
    ) {
        return f_cb(null);
    }

    /* Array 확인 */
    /* tags */
    if (Object.prototype.toString.call(second["$set"]["tags"]) !== "[object Array]") {
        return f_cb(null);
    }

    for (var i = 0; i < second["$set"].tags.length; i++) {
        if (Object.prototype.toString.call(second["$set"].tags[i]) !== "[object String]") {
            return f_cb(null);
        }
        second["$set"].tags[i] = second["$set"].tags[i].replace(/\s+/gi, '').toLowerCase();
        if (second["$set"].tags[i] === "") {
            return f_cb(null);
        }
    }
    updated_obj["tags"] = second["$set"].tags;


    first["is_removed"] = false;
    updated_obj["updated_at"] = second["$set"].updated_at = new Date().valueOf();
    updated_obj["date"] = second["$set"].date = methods.to_eight_digits_date();
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        updated_obj["blog_id"] = first["blog_id"] = user.blog_id;
        updated_obj["blog_name"] = second["$set"].blog_name = user.blog_name;
        methods.get_single_gallery(connected_db, user, {_id: first["_id"], blog_id: user.blog_id, type: "gallery"}, "all", f_cb, function (doc) {
            if (user.blog_id !== doc.blog_id) {
                return f_cb(null);
            }
            var link = "/blog/" + user.blog_id + "/gallery/" + doc._id;
            updated_obj["img"] = doc.img;
            updated_obj["thumbnail"] = doc.thumbnail;
            updated_obj["count_view"] = doc.count_view;
            updated_obj["count_awesome"] = doc.count_awesome;
            updated_obj["count_written_translations"] = doc.count_written_translations;
            updated_obj["count_requested_translations"] = doc.count_requested_translations;
            updated_obj["count_comments"] = doc.count_comments;
            updated_obj["created_at"] = doc.created_at;
            updated_obj["es_index"] = doc.es_index;
            updated_obj["es_type"] = doc.es_type;
            updated_obj["es_id"] = doc.es_id;
            if (second["$set"].public_authority !== doc.public_authority ) {
                if (doc.public_authority === 1) {
                    second["$set"].subscribers = [];
                    second["$set"].subscribers.push(user.blog_id);
                } else {
                    if (
                        doc.public_authority === 2 &&
                        second["$set"].public_authority === 0
                    ) {
                        second["$set"].subscribers = [];
                        second["$set"].subscribers.push(user.blog_id);
                    }
                }
            }
            methods.update_article(connected_db, first, second, user, {}, f_cb, function (pathname) {
                res.json({response:true, pathname:pathname});
                first = {};
                second = {};
                first.link = link;
                second["$set"] = {};
                second["$set"].article_language = updated_obj["language"];
                second["$set"].public_authority = updated_obj["public_authority"];
                methods.update_comments_language(connected_db, first, second, function () {
                    return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                        return methods.upsert_user_tags(connected_db, user, updated_obj["tags"], 0, "inc", function () {
                            if (
                                doc.es_is_updated === false &&
                                doc.es_updated_at === 0
                            ) {
                                return es_methods.es_insert_article(connected_db, es_client, updated_obj);
                            } else {
                                return es_methods.es_update_article(connected_db, es_client, updated_obj);
                            }
                        });
                    });
                });
            });
        });
    });
});
app.post('/update/translation', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});}
        , f_cb3 = function (nothing) {return res.json({response:false, msg: "no_access"});};
    var s_cb = function (nothing) {return res.json({response:true});};
    return f_cb(null);
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.language === undefined ||
        req.body.title === undefined ||
        req.body.content === undefined ||
        req.body.tags === undefined ||
        req.body.type === undefined ||
        req.body._id === undefined ||
        req.body.agenda_id === undefined
    ) {
        return f_cb(null);
    }
    var language = decodeURIComponent(req.body.language)
        , prev_language
        , title = decodeURIComponent(req.body.title)
        , choice_list = []
        , content_index = 0
        , content = JSON.parse(decodeURIComponent(req.body.content))
        , joined_content = ""
        , vote_id_objs = {}
        , tags = JSON.parse(decodeURIComponent(req.body.tags))
        , type = decodeURIComponent(req.body.type)
        , _id = decodeURIComponent(req.body._id)
        , agenda_id = decodeURIComponent(req.body.agenda_id)
        , opinion_id
        , date = new Date().valueOf()
        , link
        , original_link
        , temp
        , temp2
        , data = {}
        , first = {}
        , second = {}
        , $;
    if (
        language !== "en" &&
        language !== "ja" &&
        language !== "ko" &&
        language !== "zh-Hans"
    ) {
        return f_cb(null);
    }

    /* title type 확인 */
    if (Object.prototype.toString.call(title) !== "[object String]") {
        return f_cb(null);
    }

    /* content, tags type 확인 */
    if (
        (Object.prototype.toString.call(content) !== "[object Array]") ||
        (Object.prototype.toString.call(tags) !== "[object Array]")
    ) {
        return f_cb(null);
    }

    if (
        type !== "tr_agenda" &&
        type !== "tr_opinion"
    ) {
        return f_cb(null);
    }

    for (var i = 0; i < tags.length; i++) {
        if (Object.prototype.toString.call(tags[i]) !== "[object String]") {
            return f_cb(null);
        }
        tags[i] = tags[i].replace(/\s+/gi, '').toLowerCase();
        if (tags[i] === "") {
            return f_cb(null);
        }
    }

    first.type = type;
    first._id = _id;
    first.agenda_id = agenda_id;

    second["$set"] = {};

    if (type === "tr_opinion") {
        if (
            req.body.opinion_id === undefined
        ) {
            return f_cb(null);
        }
        opinion_id = decodeURIComponent(req.body.opinion_id);
        data.type = "opinion";
        data._id = opinion_id;
        data.agenda_id = agenda_id;
        first.opinion_id = opinion_id;
    } else {
        data.type = "agenda";
        data._id = agenda_id;
    }

    for (var i = 0; i < content.length; i++) {
        if (content[i].main_type === "content") {
            if (content[i].sub_type === "text") {
                if (
                    content[i].index !== undefined &&
                    content[i].element !== undefined &&
                    Object.prototype.toString.call(content[i].index) === "[object Number]" &&
                    Object.prototype.toString.call(content[i].element) === "[object String]"
                ) {

                } else {
                    return f_cb(null);
                }
            } else if (content[i].sub_type === "vote") {
                if (
                    content[i].index !== undefined &&
                    content[i].height !== undefined &&
                    content[i].question !== undefined &&
                    content[i].choice_list !== undefined &&
                    content[i].src !== undefined &&
                    content[i]._id !== undefined &&
                    content[i].original_id !== undefined &&
                    content[i].is_new !== undefined &&
                    Object.prototype.toString.call(content[i].index) === "[object Number]" &&
                    Object.prototype.toString.call(content[i].height) === "[object Number]" &&
                    Object.prototype.toString.call(content[i].question) === "[object String]" &&
                    Object.prototype.toString.call(content[i].choice_list) === "[object Array]" &&
                    Object.prototype.toString.call(content[i].src) === "[object String]" &&
                    Object.prototype.toString.call(content[i]._id) === "[object String]" &&
                    Object.prototype.toString.call(content[i].original_id) === "[object String]" &&
                    Object.prototype.toString.call(content[i].is_new) === "[object Boolean]"
                ) {
                    for (var j = 0; j < content[i].choice_list.length; j++) {
                        if (
                            content[i].choice_list[j]._id === undefined ||
                            content[i].choice_list[j].choice === undefined ||
                            Object.prototype.toString.call(content[i].choice_list[j]._id) !== "[object String]" ||
                            Object.prototype.toString.call(content[i].choice_list[j].choice) !== "[object String]"
                        ) {
                            return f_cb(null);
                        }
                    }
                    content[i]._id = content[i].original_id;
                    vote_id_objs[content[i].original_id] = content[i];
                    vote_id_objs[content[i].original_id].exists = false;
                } else {
                    return f_cb(null);
                }
            } else {
                return f_cb(null);
            }
        } else {
            return f_cb(null);
        }
    }

    /**
     * 1. 로그인 사용자인지 확인하기
     * 2. 해당 게시물 존재여부 확인하기
     * 3. 해당 게시물 content parsing 하기
     * 편집이기 때문에
     * 제대로 된 URL이 아닐 경우 삭제하기
     */

    /* 사용자 확인 */
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return f_cb(null);
        }
        var go = function (original_doc, translated_doc) {
            prev_language = translated_doc.language;

            /* tr_agenda 혹은 tr_opinion으로 업데이트 객체 설정 */
            second["$set"].img = user.img;
            second["$set"].language = language;
            second["$set"].main_tag = original_doc.main_tag;
            second["$set"].translated_vote_list = [];
            second["$set"].img_list = original_doc.img_list;
            second["$set"].is_youtube_inserted = original_doc.is_youtube_inserted;
            second["$set"].updated_at = date;
            second["$set"].date = methods.to_eight_digits_date();

            translated_doc.img = user.img;
            translated_doc.language = language;
            translated_doc.main_tag = original_doc.main_tag;
            translated_doc.translated_vote_list = [];
            translated_doc.img_list = original_doc.img_list;
            translated_doc.updated_at = date;
            translated_doc.date = second["$set"].date;

            methods.get_divided_contents_for_translation_writing(connected_db, original_doc, function (divided_contents) {
                data = {};
                if (type === "tr_agenda") {
                    original_link = data["link"] = "/agenda/" + agenda_id;
                } else if (type === "tr_opinion") {
                    original_link = data["link"] = "/agenda/" + agenda_id + "/opinion/" + opinion_id;
                }
                link = original_link + "/tr/" + _id;
                data["is_removed"] = false;
                methods.get_multi_votes(connected_db, data, function (docs) {
                    /* content의 투표함 choice_list 길이, _id, choice 그리고 docs의 choice_list _id, length와 비교하기 */
                    for (var j = 0; j < docs.length; j++) {
                        if ( vote_id_objs[docs[j]._id] !== undefined ) {
                            try {
                                if (vote_id_objs[docs[j]._id].choice_list && vote_id_objs[docs[j]._id].choice_list.length === docs[j].choice_list.length) {
                                    for (var k = 0; k < docs[j].choice_list.length; k++) {
                                        if (vote_id_objs[docs[j]._id].choice_list[k]._id !== docs[j].choice_list[k]._id) {
                                            return f_cb(null);
                                        }
                                    }
                                    vote_id_objs[docs[j]._id].exists = true;
                                }
                            } catch (e) {
                                return f_cb(null);
                            }
                        }
                    }

                    data = [];
                    for (var key in vote_id_objs) {
                        if (vote_id_objs[key].exists !== true) {
                            delete vote_id_objs[key];
                        } else {
                            /* multi mongo insert 위해 사용! */
                            // data.blog_id + "_" + date + randomstring.generate(6);
                            choice_list = [];
                            for (var m = 0; m < vote_id_objs[key].choice_list.length; m++) {
                                choice_list.push({
                                    _id: vote_id_objs[key].choice_list[m]._id
                                    , choice: vote_id_objs[key].choice_list[m].choice
                                });
                            }

                            temp = user.blog_id + "_" + date + randomstring.generate(6);

                            data.push({
                                _id: temp
                                , original_id: vote_id_objs[key]._id
                                , original_link: original_link
                                , root_id: agenda_id
                                , link: link
                                , blog_id: user.blog_id
                                , question: vote_id_objs[key].question
                                , choice_list: choice_list
                                , language: language
                                , public_authority: original_doc.public_authority
                                , is_removed: false
                                , created_at: date
                                , updated_at: date
                            });

                            vote_id_objs[key].created_id = temp;

                            /* 새로 삽입할 데이터에 번역한 투표 아이디 저장 */
                            second["$set"].translated_vote_list.push(temp);
                            translated_doc.translated_vote_list.push(temp);
                        }
                    }

                    if (Object.keys(vote_id_objs).length > 0) { /* 투표 존재할 경우 */
                        methods.insert_multi_translated_votes(connected_db, data, f_cb, function (nothing) {
                            for (var i = 0; i < divided_contents.length; i++) {
                                if (divided_contents[i].main_type === "content") {
                                    if (
                                        divided_contents[i].sub_type === "text"
                                    ) {
                                        temp = divided_contents[i].element.replace(/<br>/gi, '').replace(/<br \/>/gi, '').replace(/​/gi, '').trim();
                                        if (
                                            temp !== "" &&
                                            temp.length !== 0
                                        ) {
                                            if (content_index < content.length) { /* 아직 남은 번역 text 혹은 투표 남은 경우 */
                                                /* 현재 입력해야 하는 text 혹은 투표 index가 현재 divided_contents index와 같거나 작은 경우 추가하기 */
                                                if (content[content_index].index <= i) {
                                                    while ( content[content_index] && content[content_index].index <= i ) {
                                                        if (content[content_index].sub_type === "text") {
                                                            joined_content = joined_content + content[content_index].element;
                                                            content_index = content_index + 1;
                                                        } else if (content[content_index].sub_type === "vote") {
                                                            temp = vote_id_objs[content[content_index]._id];
                                                            if (temp !== undefined && temp.exists === true) { /* 투표가 존재할 경우 */
                                                                temp2 = "<iframe id='iframe-vote-" + temp._id + "' src='" + config.url + "/get/vote?q=" + temp._id + "&tr=" + temp.created_id + "' data-id='" + temp._id + "' marginwidth='0' marginheight='0' hspace='0' vspace='0' frameborder='0' scrolling='yes' height='" + temp.height + "px' class='iframe-vote' style='height: " + temp.height + "px;' onload='iframe_vote_load_callback(this);'></iframe>";
                                                                joined_content = joined_content + temp2;
                                                            }
                                                            content_index = content_index + 1;
                                                        } else {
                                                            content_index = content_index + 1;
                                                        }
                                                    }
                                                }
                                            }
                                        } else { /* 빈칸인 경우 */
                                            joined_content = joined_content + divided_contents[i].element;
                                        }
                                    } else if (divided_contents[i].sub_type === "vote") {
                                        if (content_index < content.length) { /* 아직 남은 번역 text 혹은 투표 남은 경우 */
                                            /* 현재 입력해야 하는 text 혹은 투표 index가 현재 divided_contents index와 같거나 작은 경우 추가하기 */
                                            if (content[content_index].index <= i) {
                                                while ( content[content_index] && content[content_index].index <= i ) {
                                                    if (content[content_index].sub_type === "text") {
                                                        joined_content = joined_content + content[content_index].element;
                                                        content_index = content_index + 1;
                                                    } else if (content[content_index].sub_type === "vote") {
                                                        temp = vote_id_objs[content[content_index]._id];
                                                        if (temp !== undefined && temp.exists === true) { /* 투표가 존재할 경우 */
                                                            temp2 = "<iframe id='iframe-vote-" + temp._id + "' src='" + config.url + "/get/vote?q=" + temp._id + "&tr=" + temp.created_id + "' data-id='" + temp._id + "' marginwidth='0' marginheight='0' hspace='0' vspace='0' frameborder='0' scrolling='yes' height='" + temp.height + "px' class='iframe-vote' style='height: " + temp.height + "px;' onload='iframe_vote_load_callback(this);'></iframe>";
                                                            joined_content = joined_content + temp2;
                                                        }
                                                        content_index = content_index + 1;
                                                    } else {
                                                        content_index = content_index + 1;
                                                    }
                                                }
                                            }
                                        }
                                    } else if (divided_contents[i].sub_type === "link") {
                                        temp = "<iframe src='" + divided_contents[i].src + "' marginwidth='0' marginheight='0' hspace='0' vspace='0' frameborder='0' scrolling='no' class='iframe-link'></iframe>";
                                        joined_content = joined_content + temp;
                                    } else if (divided_contents[i].sub_type === "youtube") {
                                        temp = "<iframe type='text/html' src='" + divided_contents[i].src + "' frameborder='0' allowfullscreen data-thumbnail='" + divided_contents[i].thumbnail + "' class='youtube'></iframe>";
                                        joined_content = joined_content + temp;
                                    } else if (divided_contents[i].sub_type === "img") {
                                        temp = "<img data-thumbnail='" + divided_contents[i].thumbnail + "' class='inserted-image' src='" + divided_contents[i].src + "'>";
                                        joined_content = joined_content + temp;
                                    } else {
                                        return f_cb(null);
                                    }
                                }
                            }
                            /* divided_contents 돌았는데 아직 추가하지 않은 content 남아 있는 경우 추가해주기 */
                            if (content_index < content.length) { /* 아직 남은 번역 text 혹은 투표 남은 경우 */
                                while ( content[content_index] && content_index < content.length ) {
                                    if (content[content_index].sub_type === "text") {
                                        joined_content = joined_content + content[content_index].element;
                                        content_index = content_index + 1;
                                    } else if (content[content_index].sub_type === "vote") {
                                        temp = vote_id_objs[content[content_index]._id];
                                        if (temp !== undefined && temp.exists === true) { /* 투표가 존재할 경우 */
                                            temp2 = "<iframe id='iframe-vote-" + temp._id + "' src='" + config.url + "/get/vote?q=" + temp._id + "&tr=" + temp.created_id + "' data-id='" + temp._id + "' marginwidth='0' marginheight='0' hspace='0' vspace='0' frameborder='0' scrolling='yes' height='" + temp.height + "px' class='iframe-vote' style='height: " + temp.height + "px;' onload='iframe_vote_load_callback(this);'></iframe>";
                                            joined_content = joined_content + temp2;
                                        }
                                        content_index = content_index + 1;
                                    } else {
                                        content_index = content_index + 1;
                                    }
                                }
                            }

                            $ = cheerio.load(joined_content, {decodeEntities: false});
                            $ = cheerio.load(sanitize_html($.html(), {
                                allowedTags: ['strong', 'em', 'br', 'u', 'iframe', 'img'],
                                allowedAttributes: {
                                    'iframe': ['src', 'type', 'allowfullscreen', 'data-thumbnail', 'marginwidth', 'marginheight', 'hspace', 'vspace', 'frameborder', 'scrolling', 'class', 'id', 'data-id', 'height', 'width', 'style', 'onload'],
                                    'img': ['data-thumbnail', 'class', 'src']
                                }
                            }), {decodeEntities: false});

                            second["$set"].title = title;
                            second["$set"].content = $.html();
                            second["$set"].tags = tags;

                            translated_doc.title = title;
                            translated_doc.content = $.html();
                            translated_doc.tags = tags;

                            return methods.update_translation(connected_db, first, second, f_cb, function (pathname) {
                                first = {};
                                second = {};
                                first.link = pathname;
                                second["$set"] = {};
                                second["$set"].article_language = language;

                                return methods.update_comments_language(connected_db, first, second, function () {
                                    if (language === prev_language) {
                                        res.json({response:true, pathname:pathname});
                                        return es_methods.es_update_article(connected_db, es_client, translated_doc);
                                    } else {
                                        first = {};
                                        first.type = original_doc.type;
                                        first._id = original_doc._id;
                                        first["count_written_translations.language"] = language;

                                        second = {};
                                        second["$inc"] = {"count_written_translations.$.count": 1};

                                        methods.update_article_count(connected_db, "articles", first, second,
                                            function (nothing) {
                                                second = {};
                                                second["$inc"] = {};
                                                second["$inc"][original_doc.language + "_" + language] = 1;
                                                second["$inc"][original_doc.language + "_" + prev_language] = -1;
                                                methods.update_user_translation_count(connected_db, user_id, secret_id, second, function () {
                                                    first["count_written_translations.language"] = prev_language;
                                                    second = {};
                                                    second["$inc"] = {"count_written_translations.$.count": -1};
                                                    methods.update_article_count(connected_db, "articles", first, second,
                                                        function (nothing) {
                                                            res.json({response:true, pathname:pathname});
                                                            return es_methods.es_update_article(connected_db, es_client, translated_doc);
                                                        }, function (nothing) {
                                                            res.json({response:true, pathname:pathname});
                                                            return es_methods.es_update_article(connected_db, es_client, translated_doc);
                                                        });
                                                });

                                            }, function (nothing) {
                                                second = {};
                                                second["$inc"] = {};
                                                second["$inc"][original_doc.language + "_" + language] = 1;
                                                second["$inc"][original_doc.language + "_" + prev_language] = -1;
                                                methods.update_user_translation_count(connected_db, user_id, secret_id, second, function () {
                                                    first["count_written_translations.language"] = prev_language;
                                                    second = {};
                                                    second["$inc"] = {"count_written_translations.$.count": -1};
                                                    methods.update_article_count(connected_db, "articles", first, second,
                                                        function (nothing) {
                                                            res.json({response:true, pathname:pathname});
                                                            return es_methods.es_update_article(connected_db, es_client, translated_doc);
                                                        }, function (nothing) {
                                                            res.json({response:true, pathname:pathname});
                                                            return es_methods.es_update_article(connected_db, es_client, translated_doc);
                                                        });
                                                });
                                            });
                                    }
                                });
                            });
                        });
                    } else { /* 투표 존재하지 않는 경우 */
                        for (var i = 0; i < divided_contents.length; i++) {
                            if (divided_contents[i].main_type === "content") {
                                if (
                                    divided_contents[i].sub_type === "text"
                                ) {
                                    temp = divided_contents[i].element.replace(/<br>/gi, '').replace(/<br \/>/gi, '').replace(/​/gi, '').trim();
                                    if (
                                        temp !== "" &&
                                        temp.length !== 0
                                    ) {
                                        if (content_index < content.length) { /* 아직 남은 번역 text 남은 경우 */
                                            /* 현재 입력해야 하는 text index가 현재 divided_contents index와 같거나 작은 경우 추가하기 */
                                            if (content[content_index].index <= i) {
                                                while ( content[content_index] && content[content_index].index <= i ) {
                                                    if (content[content_index].sub_type === "text") {
                                                        joined_content = joined_content + content[content_index].element;
                                                        content_index = content_index + 1;
                                                    } else if (content[content_index].sub_type === "vote") {
                                                        content_index = content_index + 1;
                                                    } else {
                                                        content_index = content_index + 1;
                                                    }
                                                }
                                            }
                                        }
                                    } else { /* 빈칸인 경우 */
                                        joined_content = joined_content + divided_contents[i].element;
                                    }
                                } else if (divided_contents[i].sub_type === "vote") {
                                    if (content_index < content.length) { /* 아직 남은 번역 text 혹은 투표 남은 경우 */
                                        /* 현재 입력해야 하는 text 혹은 투표 index가 현재 divided_contents index와 같거나 작은 경우 추가하기 */
                                        if (content[content_index].index <= i) {
                                            while ( content[content_index] && content[content_index].index <= i ) {
                                                if (content[content_index].sub_type === "text") {
                                                    joined_content = joined_content + content[content_index].element;
                                                    content_index = content_index + 1;
                                                } else if (content[content_index].sub_type === "vote") {
                                                    content_index = content_index + 1;
                                                } else {
                                                    content_index = content_index + 1;
                                                }
                                            }
                                        }
                                    }
                                } else if (divided_contents[i].sub_type === "link") {
                                    temp = "<iframe src='" + divided_contents[i].src + "' marginwidth='0' marginheight='0' hspace='0' vspace='0' frameborder='0' scrolling='no' class='iframe-link'></iframe>";
                                    joined_content = joined_content + temp;
                                } else if (divided_contents[i].sub_type === "youtube") {
                                    temp = "<iframe type='text/html' src='" + divided_contents[i].src + "' frameborder='0' allowfullscreen data-thumbnail='" + divided_contents[i].thumbnail + "' class='youtube'></iframe>";
                                    joined_content = joined_content + temp;

                                } else if (divided_contents[i].sub_type === "img") {
                                    temp = "<img data-thumbnail='" + divided_contents[i].thumbnail + "' class='inserted-image' src='" + divided_contents[i].src + "'>";
                                    joined_content = joined_content + temp;
                                } else {
                                    return f_cb(null);
                                }
                            }
                        }
                        /* divided_contents 돌았는데 아직 추가하지 않은 content 남아 있는 경우 추가해주기 */
                        if (content_index < content.length) { /* 아직 남은 번역 text 혹은 투표 남은 경우 */
                            while ( content[content_index] && content_index < content.length ) {
                                if (content[content_index].sub_type === "text") {
                                    joined_content = joined_content + content[content_index].element;
                                    content_index = content_index + 1;
                                } else if (content[content_index].sub_type === "vote") {
                                    content_index = content_index + 1;
                                } else {
                                    content_index = content_index + 1;
                                }
                            }
                        }

                        $ = cheerio.load(joined_content, {decodeEntities: false});
                        $ = cheerio.load(sanitize_html($.html(), {
                            allowedTags: ['strong', 'em', 'br', 'u', 'iframe', 'img'],
                            allowedAttributes: {
                                'iframe': ['src', 'type', 'allowfullscreen', 'data-thumbnail', 'marginwidth', 'marginheight', 'hspace', 'vspace', 'frameborder', 'scrolling', 'class', 'id', 'data-id', 'height', 'width', 'style', 'onload'],
                                'img': ['data-thumbnail', 'class', 'src']
                            }
                        }), {decodeEntities: false});


                        second["$set"].title = title;
                        second["$set"].content = $.html();
                        second["$set"].tags = tags;

                        translated_doc.title = title;
                        translated_doc.content = $.html();
                        translated_doc.tags = tags;

                        return methods.update_translation(connected_db, first, second, f_cb, function (pathname) {

                            first = {};
                            second = {};
                            first.link = pathname;
                            second["$set"] = {};
                            second["$set"].article_language = language;

                            return methods.update_comments_language(connected_db, first, second, function () {
                                if (language === prev_language) {
                                    res.json({response:true, pathname:pathname});
                                    return es_methods.es_update_article(connected_db, es_client, translated_doc);
                                } else {
                                    first = {};
                                    first.type = original_doc.type;
                                    first._id = original_doc._id;
                                    first["count_written_translations.language"] = language;

                                    second = {};
                                    second["$inc"] = {"count_written_translations.$.count": 1};

                                    methods.update_article_count(connected_db, "articles", first, second,
                                        function (nothing) {
                                            second = {};
                                            second["$inc"] = {};
                                            second["$inc"][original_doc.language + "_" + language] = 1;
                                            second["$inc"][original_doc.language + "_" + prev_language] = -1;

                                            methods.update_user_translation_count(connected_db, user_id, secret_id, second, function () {
                                                first["count_written_translations.language"] = prev_language;
                                                second = {};
                                                second["$inc"] = {"count_written_translations.$.count": -1};

                                                methods.update_article_count(connected_db, "articles", first, second,
                                                    function (nothing) {
                                                        res.json({response:true, pathname:pathname});
                                                        return es_methods.es_update_article(connected_db, es_client, translated_doc);
                                                    }, function (nothing) {
                                                        res.json({response:true, pathname:pathname});
                                                        return es_methods.es_update_article(connected_db, es_client, translated_doc);
                                                    });
                                            });
                                        }, function (nothing) {
                                            second = {};
                                            second["$inc"] = {};
                                            second["$inc"][original_doc.language + "_" + language] = 1;
                                            second["$inc"][original_doc.language + "_" + prev_language] = -1;

                                            methods.update_user_translation_count(connected_db, user_id, secret_id, second, function () {
                                                first["count_written_translations.language"] = prev_language;
                                                second = {};
                                                second["$inc"] = {"count_written_translations.$.count": -1};

                                                methods.update_article_count(connected_db, "articles", first, second,
                                                    function (nothing) {
                                                        res.json({response:true, pathname:pathname});
                                                        return es_methods.es_update_article(connected_db, es_client, translated_doc);
                                                    }, function (nothing) {
                                                        res.json({response:true, pathname:pathname});
                                                        return es_methods.es_update_article(connected_db, es_client, translated_doc);
                                                    });
                                            });
                                        });
                                }
                            });
                        });
                    }
                });
            });
        };
        if (type === "tr_agenda") {
            methods.get_single_article_filtered(connected_db, data, "all", f_cb, function (original_doc) { /* 원본 도큐먼트 */
                methods.get_single_translation(connected_db, user, first, "translation", "all", f_cb3, function (translated_doc) { /* 편집할 번역 도큐먼트 */
                    if (user.blog_id !== translated_doc.blog_id) { /* 번역한 사용자가 아닐 경우 */
                        return f_cb(null);
                    }
                    if (original_doc.language === language) { /* 원본의 언어와 같은 경우 */
                        return f_cb(null);
                    }
                    if (translated_doc.translated_vote_list.length > 0) { /* 번역된 투표 존재하는 경우 전체 삭제하기 */
                        data = {};
                        data["$or"] = [];
                        for (var i = 0; i < translated_doc.translated_vote_list.length; i++) {
                            data["$or"].push({_id: translated_doc.translated_vote_list[i]});
                        }
                        methods.seriously_remove_translated_votes(connected_db, data, f_cb, function (nothing) {
                            go(original_doc, translated_doc);
                        });
                    } else {
                        go(original_doc, translated_doc);
                    }
                });
            });
        } else if (type === "tr_opinion") {
            methods.get_single_article_filtered(connected_db, data, "all", f_cb, function (original_doc) { /* 원본 도큐먼트 */
                methods.get_single_translation(connected_db, user, first, "translation", "all", f_cb3, function (translated_doc) { /* 편집할 번역 도큐먼트 */
                    if (user.blog_id !== translated_doc.blog_id) { /* 번역한 사용자가 아닐 경우 */
                        return f_cb(null);
                    }
                    if (original_doc.language === language) { /* 원본의 언어와 같은 경우 */
                        return f_cb(null);
                    }
                    if (translated_doc.translated_vote_list.length > 0) { /* 번역된 투표 존재하는 경우 전체 삭제하기 */
                        data = {};
                        data["$or"] = [];
                        for (var i = 0; i < translated_doc.translated_vote_list.length; i++) {
                            data["$or"].push({_id: translated_doc.translated_vote_list[i]});
                        }
                        methods.seriously_remove_translated_votes(connected_db, data, f_cb, function (nothing) {
                            go(original_doc, translated_doc);
                        });
                    } else {
                        go(original_doc, translated_doc);
                    }
                });
            });
        } else {
            return f_cb(null);
        }
    });
});


/* 구독 취소, 구독 추가, 추천, */
/**
 * req.body의 전송 데이터
 * is_push - true || false. true: 추가. false: 삭제.
 * action - "likers" || "subscribers"
 * type - "agenda" || "opinion" || "blog" || "gallery"
 * _id - 게시물 아이디
 * blog_id - 블로그 || 앨범일 경우
 * blog_menu_id - 블로그일 경우
 */
app.post('/update/article-array', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.is_push === undefined ||
        req.body.action === undefined ||
        req.body.type === undefined ||
        req.body._id === undefined
    ) {
        return f_cb(null);
    }
    var is_push = decodeURIComponent(req.body.is_push) === "true"
        , action = decodeURIComponent(req.body.action)
        , type = decodeURIComponent(req.body.type)
        , _id = decodeURIComponent(req.body._id)
        , root_type
        , root_id
        , link
        , is_comment = false
        , first = {}
        , second = {}
        , notification = {}
        , article_data = {};
    if (
        type !== "deep" &&
        type !== "apply_now" &&
        type !== "hire_me" &&
        type !== "agenda" &&
        type !== "opinion" &&
        type !== "blog" &&
        type !== "gallery"
    ) {
        return f_cb(null);
    }
    /*if (
        type !== "deep" &&
        type !== "apply_now" &&
        type !== "hire_me" &&
        type !== "agenda" &&
        type !== "opinion" &&
        type !== "tr_agenda" &&
        type !== "tr_opinion" &&
        type !== "blog" &&
        type !== "gallery"
    ) {
        return f_cb(null);
    }*/
    if (
        action !== "likers" &&
        action !== "subscribers"
    ) {
        return f_cb(null);
    }
    if (action === "likers") {
        if (
            req.body.is_comment === undefined
        ) {
            return f_cb(null);
        }
        is_comment = decodeURIComponent(req.body.is_comment) === "true";
    } else {}
    if (is_comment === true) {
        if (
            req.body.root_type === undefined ||
            req.body.root_id === undefined
        ) {
            return f_cb(null);
        }
        article_data._id = root_id = decodeURIComponent(req.body.root_id);
        article_data.type = root_type = decodeURIComponent(req.body.root_type);
        if (
            type === "blog" ||
            type === "gallery"
        ) {
            if (req.body.blog_id === undefined) {
                return f_cb(null);
            }
            article_data.blog_id = decodeURIComponent(req.body.blog_id);
        }
        first._id = _id;
        first.type = type;
        first.root_id = root_id;
    } else {
        if (type === "deep") {
            return f_cb(null);
        }
        article_data._id = first._id = _id;
        article_data.type = first.type = type;
        if (
            type === "blog" ||
            type === "gallery"
        ) {
            if (req.body.blog_id === undefined) {
                return f_cb(null);
            }
            article_data.blog_id = decodeURIComponent(req.body.blog_id);
            if (type === "blog") {
                if (req.body.blog_menu_id === undefined) {
                    return f_cb(null);
                }
                article_data.blog_menu_id = decodeURIComponent(req.body.blog_menu_id);
            }
        }
    }
    notification = {};
    notification.type = "awesome_clicked";
    if (is_comment === true) {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
            if (user.verified === false) {
                return res.json({response:false});
            }
            if (user.blog_id === "") {
                return res.json({response:false});
            }
            notification.blog_id = user.blog_id;
            notification["info"] = {};
            notification["info"]["users"] = [];
            notification["info"]["users"].push({
                blog_id: user.blog_id
                , name: user.name
                , img: user.img
            });
            if (root_type === "deep") {
                methods.get_single_news(connected_db, article_data, f_cb, function (doc) {
                    if (action === "likers") { /* awesome */
                        if (is_push === true) { /* Add awesome */
                            second["$addToSet"] = {};
                            second["$addToSet"][action] = user.blog_id;
                            second["$inc"] = {};
                            second["$inc"].count_awesome = 1;
                            methods.check_user_clicked_awesome(connected_db, "comments", { _id: first._id, root_id: first.root_id, likers: user.blog_id }
                                , function (nothing) {
                                    methods.update_article_array(connected_db, "comments", first, second, f_cb, function (doc) {
                                        return s_cb(null);
                                    });
                                }, function (doc) {
                                    return f_cb(null);
                                });
                        } else { /* Cancel awesome */
                            second["$pull"] = {};
                            second["$pull"][action] = user.blog_id;
                            second["$inc"] = {};
                            second["$inc"].count_awesome = -1;
                            methods.check_user_clicked_awesome(connected_db, "comments", { _id: first._id, root_id: first.root_id, likers: user.blog_id }
                                , function (nothing) {
                                    return f_cb(null);
                                }, function (doc) {
                                    methods.update_article_array(connected_db, "comments", first, second, f_cb, function (doc) {
                                        return s_cb(null);
                                    });
                                });
                        }
                    } else {
                        return f_cb(null);
                    }
                });
            } else if (root_type === "apply_now") {
                methods.get_single_apply_now(connected_db, user, article_data, "public", "all", f_cb, function (doc) {
                    if (action === "likers") { /* awesome */
                        if (is_push === true) { /* Add awesome */
                            second["$addToSet"] = {};
                            second["$addToSet"][action] = user.blog_id;
                            second["$inc"] = {};
                            second["$inc"].count_awesome = 1;
                            methods.check_user_clicked_awesome(connected_db, "comments", { _id: first._id, root_id: first.root_id, likers: user.blog_id }
                                , function (nothing) {
                                    methods.update_article_array(connected_db, "comments", first, second, f_cb, function (doc) {
                                        if (doc === null) {
                                            return s_cb(null);
                                        } else {
                                            if (doc.blog_id === user.blog_id) {
                                                return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, s_cb, s_cb);
                                            } else {
                                                if (doc.comment_type === 1) {
                                                    notification.link = doc.link + "?comment=" + doc._id;
                                                } else {
                                                    notification.link = doc.link + "?comment=" + doc.outer_id + "&inner_comment=" + doc._id;
                                                }
                                                notification["info"]["type"] = "comment";
                                                notification["info"]["title"] = doc.comment;
                                                notification.subscribers = [];
                                                notification.subscribers.push(doc.blog_id);
                                                return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, function (nothing) {
                                                    methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                }, function (nothing) {
                                                    methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                });
                                            }
                                        }
                                    });
                                }, function (doc) {
                                    return f_cb(null);
                                });
                        } else { /* Cancel awesome */
                            second["$pull"] = {};
                            second["$pull"][action] = user.blog_id;
                            second["$inc"] = {};
                            second["$inc"].count_awesome = -1;
                            methods.check_user_clicked_awesome(connected_db, "comments", { _id: first._id, root_id: first.root_id, likers: user.blog_id }
                                , function (nothing) {
                                    return f_cb(null);
                                }, function (doc) {
                                    methods.update_article_array(connected_db, "comments", first, second, f_cb, function (doc) {
                                        if (doc === null) {
                                            return s_cb(null);
                                        } else {
                                            return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: -1}, s_cb, s_cb);
                                        }
                                    });
                                });
                        }
                    } else {
                        return f_cb(null);
                    }
                });
            }
            else if (root_type === "hire_me") {
                methods.get_single_hire_me(connected_db, user, article_data, "public", "all", f_cb, function (doc) {
                    if (action === "likers") { /* awesome */
                        if (is_push === true) { /* Add awesome */
                            second["$addToSet"] = {};
                            second["$addToSet"][action] = user.blog_id;
                            second["$inc"] = {};
                            second["$inc"].count_awesome = 1;
                            methods.check_user_clicked_awesome(connected_db, "comments", { _id: first._id, root_id: first.root_id, likers: user.blog_id }
                                , function (nothing) {
                                    methods.update_article_array(connected_db, "comments", first, second, f_cb, function (doc) {
                                        if (doc === null) {
                                            return s_cb(null);
                                        } else {
                                            if (doc.blog_id === user.blog_id) {
                                                return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, s_cb, s_cb);
                                            } else {
                                                if (doc.comment_type === 1) {
                                                    notification.link = doc.link + "?comment=" + doc._id;
                                                } else {
                                                    notification.link = doc.link + "?comment=" + doc.outer_id + "&inner_comment=" + doc._id;
                                                }
                                                notification["info"]["type"] = "comment";
                                                notification["info"]["title"] = doc.comment;
                                                notification.subscribers = [];
                                                notification.subscribers.push(doc.blog_id);
                                                return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, function (nothing) {
                                                    methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                }, function (nothing) {
                                                    methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                });
                                            }
                                        }
                                    });
                                }, function (doc) {
                                    return f_cb(null);
                                });
                        } else { /* Cancel awesome */
                            second["$pull"] = {};
                            second["$pull"][action] = user.blog_id;
                            second["$inc"] = {};
                            second["$inc"].count_awesome = -1;
                            methods.check_user_clicked_awesome(connected_db, "comments", { _id: first._id, root_id: first.root_id, likers: user.blog_id }
                                , function (nothing) {
                                    return f_cb(null);
                                }, function (doc) {
                                    methods.update_article_array(connected_db, "comments", first, second, f_cb, function (doc) {
                                        if (doc === null) {
                                            return s_cb(null);
                                        } else {
                                            return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: -1}, s_cb, s_cb);
                                        }
                                    });
                                });
                        }
                    } else {
                        return f_cb(null);
                    }
                });
            }
            else if (root_type === "agenda") {
                methods.get_single_agenda(connected_db, user, article_data, "public", "all", f_cb, function (doc) {
                    if (action === "likers") { /* awesome */
                        if (is_push === true) { /* Add awesome */
                            second["$addToSet"] = {};
                            second["$addToSet"][action] = user.blog_id;
                            second["$inc"] = {};
                            second["$inc"].count_awesome = 1;
                            methods.check_user_clicked_awesome(connected_db, "comments", { _id: first._id, root_id: first.root_id, likers: user.blog_id }
                                , function (nothing) {
                                    methods.update_article_array(connected_db, "comments", first, second, f_cb, function (doc) {
                                        if (doc === null) {
                                            return s_cb(null);
                                        } else {
                                            if (doc.blog_id === user.blog_id) {
                                                return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, s_cb, s_cb);
                                            } else {
                                                if (doc.comment_type === 1) {
                                                    notification.link = doc.link + "?comment=" + doc._id;
                                                } else {
                                                    notification.link = doc.link + "?comment=" + doc.outer_id + "&inner_comment=" + doc._id;
                                                }
                                                notification["info"]["type"] = "comment";
                                                notification["info"]["title"] = doc.comment;
                                                notification.subscribers = [];
                                                notification.subscribers.push(doc.blog_id);
                                                return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, function (nothing) {
                                                    methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                }, function (nothing) {
                                                    methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                });
                                            }
                                        }
                                    });
                                }, function (doc) {
                                    return f_cb(null);
                                });
                        } else { /* Cancel awesome */
                            second["$pull"] = {};
                            second["$pull"][action] = user.blog_id;
                            second["$inc"] = {};
                            second["$inc"].count_awesome = -1;
                            methods.check_user_clicked_awesome(connected_db, "comments", { _id: first._id, root_id: first.root_id, likers: user.blog_id }
                                , function (nothing) {
                                    return f_cb(null);
                                }, function (doc) {
                                    methods.update_article_array(connected_db, "comments", first, second, f_cb, function (doc) {
                                        if (doc === null) {
                                            return s_cb(null);
                                        } else {
                                            return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: -1}, s_cb, s_cb);
                                        }
                                    });
                                });
                        }
                    } else {
                        return f_cb(null);
                    }
                });
            } else if (root_type === "blog") {
                methods.get_single_blog(connected_db, user, article_data, "perfect", f_cb, function (nothing) {
                    /* Add awesome || Cancel awesome || Subscribe || Unsubscribe */
                    if (action === "likers") { /* awesome */
                        if (is_push === true) { /* Add awesome */
                            second["$addToSet"] = {};
                            second["$addToSet"][action] = user.blog_id;
                            second["$inc"] = {};
                            second["$inc"].count_awesome = 1;
                            methods.check_user_clicked_awesome(connected_db, "comments", { _id: first._id, root_id: first.root_id, likers: user.blog_id }, function (nothing) {
                                methods.update_article_array(connected_db, "comments", first, second, f_cb, function (doc) {
                                    if (doc === null) {
                                        return s_cb(null);
                                    } else {
                                        if (doc.blog_id === user.blog_id) {
                                            return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, s_cb, s_cb);
                                        } else {
                                            if (doc.comment_type === 1) {
                                                notification.link = doc.link + "?comment=" + doc._id;
                                            } else {
                                                notification.link = doc.link + "?comment=" + doc.outer_id + "&inner_comment=" + doc._id;
                                            }
                                            notification["info"]["type"] = "comment";
                                            notification["info"]["title"] = doc.comment;
                                            notification.subscribers = [];
                                            notification.subscribers.push(doc.blog_id);
                                            return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, function (nothing) {
                                                methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                            }, function (nothing) {
                                                methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                            });
                                        }
                                    }
                                });
                            }, function (doc) {
                                return f_cb(null);
                            });
                        } else { /* Cancel awesome */
                            second["$pull"] = {};
                            second["$pull"][action] = user.blog_id;
                            second["$inc"] = {};
                            second["$inc"].count_awesome = -1;
                            methods.check_user_clicked_awesome(connected_db, "comments", { _id: first._id, root_id: first.root_id, likers: user.blog_id }
                                , function (nothing) {
                                    return f_cb(null);
                                }, function (doc) {
                                    methods.update_article_array(connected_db, "comments", first, second, f_cb, function (doc) {
                                        if (doc === null) {
                                            return s_cb(null);
                                        } else {
                                            return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: -1}, s_cb, s_cb);
                                        }
                                    });
                                });
                        }
                    } else {
                        return f_cb(null);
                    }
                });
            } else if (root_type === "gallery") {
                methods.get_single_gallery(connected_db, user, article_data, "perfect", f_cb, function (nothing) {
                    /* Add awesome || Cancel awesome || Subscribe || Unsubscribe */
                    if (action === "likers") { /* awesome */
                        if (is_push === true) { /* Add awesome */
                            second["$addToSet"] = {};
                            second["$addToSet"][action] = user.blog_id;
                            second["$inc"] = {};
                            second["$inc"].count_awesome = 1;
                            methods.check_user_clicked_awesome(connected_db, "comments", { _id: first._id, root_id: first.root_id, likers: user.blog_id }, function (nothing) {
                                methods.update_article_array(connected_db, "comments", first, second, f_cb, function (doc) {
                                    if (doc === null) {
                                        return s_cb(null);
                                    } else {
                                        if (doc.blog_id === user.blog_id) {
                                            return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, s_cb, s_cb);
                                        } else {
                                            if (doc.comment_type === 1) {
                                                notification.link = doc.link + "?comment=" + doc._id;
                                            } else {
                                                notification.link = doc.link + "?comment=" + doc.outer_id + "&inner_comment=" + doc._id;
                                            }
                                            notification["info"]["type"] = "comment";
                                            notification["info"]["title"] = doc.comment;
                                            notification.subscribers = [];
                                            notification.subscribers.push(doc.blog_id);
                                            return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, function (nothing) {
                                                methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                            }, function (nothing) {
                                                methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                            });
                                        }
                                    }
                                });
                            }, function (doc) {
                                return f_cb(null);
                            });
                        } else { /* Cancel awesome */
                            second["$pull"] = {};
                            second["$pull"][action] = user.blog_id;
                            second["$inc"] = {};
                            second["$inc"].count_awesome = -1;
                            methods.check_user_clicked_awesome(connected_db, "comments", { _id: first._id, root_id: first.root_id, likers: user.blog_id }
                                , function (nothing) {
                                    return f_cb(null);
                                }, function (doc) {
                                    methods.update_article_array(connected_db, "comments", first, second, f_cb, function (doc) {
                                        if (doc === null) {
                                            return s_cb(null);
                                        } else {
                                            return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: -1}, s_cb, s_cb);
                                        }
                                    });
                                });
                        }
                    } else {
                        return f_cb(null);
                    }
                });
            } else {
                return f_cb(null);
            }
        });
    } else {
        if (
            type === "apply_now" ||
            type === "hire_me"
        ) {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
                if (user.verified === false) {
                    return res.json({response:false});
                }
                if (user.blog_id === "") {
                    return res.json({response:false});
                }
                notification.blog_id = user.blog_id;
                notification["info"] = {};
                notification["info"]["users"] = [];
                notification["info"]["users"].push({
                    blog_id: user.blog_id
                    , name: user.name
                    , img: user.img
                });
                if (type === "apply_now") {
                    methods.get_single_apply_now(connected_db, user, article_data, "public", "all", f_cb, function (doc) {
                        if (action === "likers") { /* awesome */
                            if (is_push === true) { /* Add awesome */
                                second["$addToSet"] = {};
                                second["$addToSet"]["likers"] = user.blog_id;
                                second["$addToSet"]["subscribers"] = user.blog_id;
                                second["$inc"] = {};
                                second["$inc"].count_awesome = 1;
                                methods.check_user_clicked_awesome(connected_db, "employment", { _id: first._id, type: first.type, likers: user.blog_id }
                                    , function (nothing) {
                                        methods.update_article_array(connected_db, "employment", first, second, f_cb, function (doc) {
                                            if (doc === null) {
                                                return s_cb(null);
                                            } else {
                                                if (doc.blog_id === user.blog_id) {
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, s_cb, s_cb);
                                                } else {
                                                    notification.link = "/apply-now/" + doc._id;
                                                    notification["info"]["type"] = type;
                                                    notification["info"]["title"] = doc.title;
                                                    notification.subscribers = [];
                                                    notification.subscribers.push(doc.blog_id);
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, function (nothing) {
                                                        methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                    }, function (nothing) {
                                                        methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                    });
                                                }
                                            }
                                        });
                                    }, function (doc) {
                                        return f_cb(null);
                                    });
                            } else { /* Cancel awesome */
                                second["$pull"] = {};
                                second["$pull"][action] = user.blog_id;
                                second["$inc"] = {};
                                second["$inc"].count_awesome = -1;
                                methods.check_user_clicked_awesome(connected_db, "employment", { _id: first._id, type: first.type, likers: user.blog_id }
                                    , function (nothing) {
                                        return f_cb(null);
                                    }, function (doc) {
                                        methods.update_article_array(connected_db, "employment", first, second, f_cb, function (doc) {
                                            if (doc === null) {
                                                return s_cb(null);
                                            } else {
                                                return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: -1}, s_cb, s_cb);
                                            }
                                        });
                                    });
                            }
                        } else { /* subscription */
                            if (is_push === true) { /* Subscribe */
                                second["$addToSet"] = {};
                                second["$addToSet"][action] = user.blog_id;
                            } else { /* Unsubscribe */
                                second["$pull"] = {};
                                second["$pull"][action] = user.blog_id;
                            }
                            /* Add awesome || Cancel awesome || Subscribe || Unsubscribe */
                            methods.update_article_array(connected_db, "employment", first, second, f_cb, s_cb);
                        }
                    });
                } else { /* Hire Me */
                    methods.get_single_hire_me(connected_db, user, article_data, "public", "all", f_cb, function (doc) {
                        if (action === "likers") { /* awesome */
                            if (is_push === true) { /* Add awesome */
                                second["$addToSet"] = {};
                                second["$addToSet"]["likers"] = user.blog_id;
                                second["$addToSet"]["subscribers"] = user.blog_id;
                                second["$inc"] = {};
                                second["$inc"].count_awesome = 1;
                                methods.check_user_clicked_awesome(connected_db, "employment", { _id: first._id, type: first.type, likers: user.blog_id }
                                    , function (nothing) {
                                        methods.update_article_array(connected_db, "employment", first, second, f_cb, function (doc) {
                                            if (doc === null) {
                                                return s_cb(null);
                                            } else {
                                                if (doc.blog_id === user.blog_id) {
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, s_cb, s_cb);
                                                } else {
                                                    notification.link = "/hire-me/" + doc._id;
                                                    notification["info"]["type"] = type;
                                                    notification["info"]["title"] = doc.title;
                                                    notification.subscribers = [];
                                                    notification.subscribers.push(doc.blog_id);
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, function (nothing) {
                                                        methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                    }, function (nothing) {
                                                        methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                    });
                                                }
                                            }
                                        });
                                    }, function (doc) {
                                        return f_cb(null);
                                    });
                            } else { /* Cancel awesome */
                                second["$pull"] = {};
                                second["$pull"][action] = user.blog_id;
                                second["$inc"] = {};
                                second["$inc"].count_awesome = -1;
                                methods.check_user_clicked_awesome(connected_db, "employment", { _id: first._id, type: first.type, likers: user.blog_id }
                                    , function (nothing) {
                                        return f_cb(null);
                                    }, function (doc) {
                                        methods.update_article_array(connected_db, "employment", first, second, f_cb, function (doc) {
                                            if (doc === null) {
                                                return s_cb(null);
                                            } else {
                                                return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: -1}, s_cb, s_cb);
                                            }
                                        });
                                    });
                            }
                        } else { /* subscription */
                            if (is_push === true) { /* Subscribe */
                                second["$addToSet"] = {};
                                second["$addToSet"][action] = user.blog_id;
                            } else { /* Unsubscribe */
                                second["$pull"] = {};
                                second["$pull"][action] = user.blog_id;
                            }
                            /* Add awesome || Cancel awesome || Subscribe || Unsubscribe */
                            methods.update_article_array(connected_db, "employment", first, second, f_cb, s_cb);
                        }
                    });
                }
            });
        } else if (
            type === "agenda" ||
            type === "tr_agenda" ||
            type === "opinion" ||
            type === "tr_opinion"
        ) { /* Debate */
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
                if (user.verified === false) {
                    return res.json({response:false});
                }
                if (user.blog_id === "") {
                    return res.json({response:false});
                }
                notification.blog_id = user.blog_id;
                notification["info"] = {};
                notification["info"]["users"] = [];
                notification["info"]["users"].push({
                    blog_id: user.blog_id
                    , name: user.name
                    , img: user.img
                });
                if (type === "agenda") {
                        methods.get_single_agenda(connected_db, user, article_data, "public", "all", f_cb, function (doc) {
                            if (action === "likers") { /* awesome */
                                if (is_push === true) { /* Add awesome */
                                    second["$addToSet"] = {};
                                    second["$addToSet"]["likers"] = user.blog_id;
                                    second["$addToSet"]["subscribers"] = user.blog_id;
                                    second["$inc"] = {};
                                    second["$inc"].count_awesome = 1;
                                    methods.check_user_clicked_awesome(connected_db, "articles", { _id: first._id, type: first.type, likers: user.blog_id }
                                        , function (nothing) {
                                            methods.update_article_array(connected_db, "articles", first, second, f_cb, function (doc) {
                                                if (doc === null) {
                                                    return s_cb(null);
                                                } else {
                                                    if (doc.blog_id === user.blog_id) {
                                                        return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, s_cb, s_cb);
                                                    } else {
                                                        notification.link = "/agenda/" + doc._id;
                                                        notification["info"]["type"] = type;
                                                        notification["info"]["title"] = doc.title;
                                                        notification.subscribers = [];
                                                        notification.subscribers.push(doc.blog_id);
                                                        return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, function (nothing) {
                                                            methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                        }, function (nothing) {
                                                            methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                        });
                                                    }
                                                }
                                            });
                                        }, function (doc) {
                                            return f_cb(null);
                                        });
                                } else { /* Cancel awesome */
                                    second["$pull"] = {};
                                    second["$pull"][action] = user.blog_id;
                                    second["$inc"] = {};
                                    second["$inc"].count_awesome = -1;
                                    methods.check_user_clicked_awesome(connected_db, "articles", { _id: first._id, type: first.type, likers: user.blog_id }
                                        , function (nothing) {
                                            return f_cb(null);
                                        }, function (doc) {
                                            methods.update_article_array(connected_db, "articles", first, second, f_cb, function (doc) {
                                                if (doc === null) {
                                                    return s_cb(null);
                                                } else {
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: -1}, s_cb, s_cb);
                                                }
                                            });
                                        });
                                }
                            } else { /* subscription */
                                if (is_push === true) { /* Subscribe */
                                    second["$addToSet"] = {};
                                    second["$addToSet"][action] = user.blog_id;
                                } else { /* Unsubscribe */
                                    second["$pull"] = {};
                                    second["$pull"][action] = user.blog_id;
                                }
                                /* Add awesome || Cancel awesome || Subscribe || Unsubscribe */
                                methods.update_article_array(connected_db, "articles", first, second, f_cb, s_cb);
                            }
                        });
                } else if (type === "tr_agenda") {
                        methods.get_single_translation(connected_db, user, article_data, "public", "all", f_cb, function (doc) {
                            if (action === "likers") { /* awesome */
                                if (is_push === true) { /* Add awesome */
                                    second["$addToSet"] = {};
                                    second["$addToSet"]["likers"] = user.blog_id;
                                    second["$addToSet"]["subscribers"] = user.blog_id;
                                    second["$inc"] = {};
                                    second["$inc"].count_awesome = 1;
                                    methods.check_user_clicked_awesome(connected_db, "articles", { _id: first._id, type: first.type, likers: user.blog_id }, function (nothing) {
                                        methods.update_article_array(connected_db, "articles", first, second, f_cb, function (doc) {
                                            if (doc === null) {
                                                return s_cb(null);
                                            } else {
                                                if (doc.blog_id === user.blog_id) {
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, s_cb, s_cb);
                                                } else {
                                                    notification.link = "/agenda/" + doc.agenda_id + "/tr/" + doc._id;
                                                    notification["info"]["type"] = type;
                                                    notification["info"]["title"] = doc.title;
                                                    notification.subscribers = [];
                                                    notification.subscribers.push(doc.blog_id);
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, function (nothing) {
                                                        methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                    }, function (nothing) {
                                                        methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                    });
                                                }
                                            }
                                        });
                                    }, function (doc) {
                                        return f_cb(null);
                                    });
                                } else { /* Cancel awesome */
                                    second["$pull"] = {};
                                    second["$pull"][action] = user.blog_id;
                                    second["$inc"] = {};
                                    second["$inc"].count_awesome = -1;
                                    methods.check_user_clicked_awesome(connected_db, "articles", { _id: first._id, type: first.type, likers: user.blog_id }, function (nothing) {
                                        return f_cb(null);
                                    }, function (doc) {
                                        methods.update_article_array(connected_db, "articles", first, second, f_cb, function (doc) {
                                            if (doc === null) {
                                                return s_cb(null);
                                            } else {
                                                return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: -1}, s_cb, s_cb);
                                            }
                                        });
                                    });
                                }
                            } else { /* subscription */
                                if (is_push === true) { /* Subscribe */
                                    second["$addToSet"] = {};
                                    second["$addToSet"][action] = user.blog_id;
                                } else { /* Unsubscribe */
                                    second["$pull"] = {};
                                    second["$pull"][action] = user.blog_id;
                                }
                                /* Add awesome || Cancel awesome || Subscribe || Unsubscribe */
                                methods.update_article_array(connected_db, "articles", first, second, f_cb, s_cb);
                            }
                        });
                } else if (type === "opinion") {
                        methods.get_single_opinion(connected_db, user, article_data, "public", "all", f_cb, function (doc) {
                            if (action === "likers") { /* awesome */
                                if (is_push === true) { /* Add awesome */
                                    second["$addToSet"] = {};
                                    second["$addToSet"]["likers"] = user.blog_id;
                                    second["$addToSet"]["subscribers"] = user.blog_id;
                                    second["$inc"] = {};
                                    second["$inc"].count_awesome = 1;
                                    methods.check_user_clicked_awesome(connected_db, "articles", { _id: first._id, type: first.type, likers: user.blog_id }, function (nothing) {
                                        methods.update_article_array(connected_db, "articles", first, second, f_cb, function (doc) {
                                            if (doc === null) {
                                                return s_cb(null);
                                            } else {
                                                if (doc.blog_id === user.blog_id) {
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, s_cb, s_cb);
                                                } else {
                                                    notification.link = "/agenda/" + doc.agenda_id + "/opinion/" + doc._id;
                                                    notification["info"]["type"] = type;
                                                    notification["info"]["title"] = doc.title;
                                                    notification.subscribers = [];
                                                    notification.subscribers.push(doc.blog_id);
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, function (nothing) {
                                                        methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                    }, function (nothing) {
                                                        methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                    });
                                                }
                                            }
                                        });
                                    }, function (doc) {
                                        return f_cb(null);
                                    });
                                } else { /* Cancel awesome */
                                    second["$pull"] = {};
                                    second["$pull"][action] = user.blog_id;
                                    second["$inc"] = {};
                                    second["$inc"].count_awesome = -1;
                                    methods.check_user_clicked_awesome(connected_db, "articles", { _id: first._id, type: first.type, likers: user.blog_id }, function (nothing) {
                                        return f_cb(null);
                                    }, function (doc) {
                                        methods.update_article_array(connected_db, "articles", first, second, f_cb, function (doc) {
                                            if (doc === null) {
                                                return s_cb(null);
                                            } else {
                                                return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: -1}, s_cb, s_cb);
                                            }
                                        });
                                    });
                                }
                            } else { /* subscription */
                                if (is_push === true) { /* Subscribe */
                                    second["$addToSet"] = {};
                                    second["$addToSet"][action] = user.blog_id;
                                } else { /* Unsubscribe */
                                    second["$pull"] = {};
                                    second["$pull"][action] = user.blog_id;
                                }
                                /* Add awesome || Cancel awesome || Subscribe || Unsubscribe */
                                methods.update_article_array(connected_db, "articles", first, second, f_cb, s_cb);
                            }
                        });
                } else if (type === "tr_opinion") {
                        methods.get_single_translation(connected_db, user, article_data, "public", "all", f_cb, function (doc) {
                            if (action === "likers") { /* awesome */
                                if (is_push === true) { /* Add awesome */
                                    second["$addToSet"] = {};
                                    second["$addToSet"]["likers"] = user.blog_id;
                                    second["$addToSet"]["subscribers"] = user.blog_id;
                                    second["$inc"] = {};
                                    second["$inc"].count_awesome = 1;
                                    methods.check_user_clicked_awesome(connected_db, "articles", { _id: first._id, type: first.type, likers: user.blog_id }, function (nothing) {
                                        methods.update_article_array(connected_db, "articles", first, second, f_cb, function (doc) {
                                            if (doc === null) {
                                                return s_cb(null);
                                            } else {
                                                if (doc.blog_id === user.blog_id) {
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, s_cb, s_cb);
                                                } else {
                                                    notification.link = "/agenda/" + doc.agenda_id + "/opinion/" + doc.opinion_id + "/tr/" + doc._id;
                                                    notification["info"]["type"] = type;
                                                    notification["info"]["title"] = doc.title;
                                                    notification.subscribers = [];
                                                    notification.subscribers.push(doc.blog_id);
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, function (nothing) {
                                                        methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                    }, function (nothing) {
                                                        methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                    });
                                                }
                                            }
                                        });
                                    }, function (doc) {
                                        return f_cb(null);
                                    });
                                } else { /* Cancel awesome */
                                    second["$pull"] = {};
                                    second["$pull"][action] = user.blog_id;
                                    second["$inc"] = {};
                                    second["$inc"].count_awesome = -1;
                                    methods.check_user_clicked_awesome(connected_db, "articles", { _id: first._id, type: first.type, likers: user.blog_id }
                                        , function (nothing) {
                                            return f_cb(null);
                                        }, function (doc) {
                                            methods.update_article_array(connected_db, "articles", first, second, f_cb, function (doc) {
                                                if (doc === null) {
                                                    return s_cb(null);
                                                } else {
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: -1}, s_cb, s_cb);
                                                }
                                            });
                                        });
                                }
                            } else { /* subscription */
                                if (is_push === true) { /* Subscribe */
                                    second["$addToSet"] = {};
                                    second["$addToSet"][action] = user.blog_id;
                                } else { /* Unsubscribe */
                                    second["$pull"] = {};
                                    second["$pull"][action] = user.blog_id;
                                }
                                /* Add awesome || Cancel awesome || Subscribe || Unsubscribe */
                                methods.update_article_array(connected_db, "articles", first, second, f_cb, s_cb);
                            }
                        });
                }
            });
        } else { /* blog || Gallery */
            if (type === 'blog') { /* 블로그일 경우, blog_id, blog_menu_id */
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false});
                    }
                    notification.blog_id = user.blog_id;
                    notification["info"] = {};
                    notification["info"]["users"] = [];
                    notification["info"]["users"].push({
                        blog_id: user.blog_id
                        , name: user.name
                        , img: user.img
                    });
                    methods.get_single_blog(connected_db, user, article_data, "perfect", f_cb, function (nothing) {
                            /* Add awesome || Cancel awesome || Subscribe || Unsubscribe */
                            if (action === "likers") { /* awesome */
                                if (is_push === true) { /* Add awesome */
                                    second["$addToSet"] = {};
                                    second["$addToSet"]["likers"] = user.blog_id;
                                    second["$addToSet"]["subscribers"] = user.blog_id;
                                    second["$inc"] = {};
                                    second["$inc"].count_awesome = 1;
                                    methods.check_user_clicked_awesome(connected_db, "articles", { _id: first._id, type: first.type, likers: user.blog_id }, function (nothing) {
                                        methods.update_article_array(connected_db, "articles", first, second, f_cb, function (doc) {
                                            if (doc === null) {
                                                return s_cb(null);
                                            } else {
                                                if (doc.blog_id === user.blog_id) {
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, s_cb, s_cb);
                                                } else {
                                                    notification.link = "/blog/" + doc.blog_id + "/" + doc.blog_menu_id + "/" + doc._id;
                                                    notification["info"]["type"] = type;
                                                    notification["info"]["title"] = doc.title;
                                                    notification.subscribers = [];
                                                    notification.subscribers.push(doc.blog_id);
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, function (nothing) {
                                                        methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                    }, function (nothing) {
                                                        methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                    });
                                                }
                                            }
                                        });
                                    }, function (doc) {
                                        return f_cb(null);
                                    });
                                } else { /* Cancel awesome */
                                    second["$pull"] = {};
                                    second["$pull"][action] = user.blog_id;
                                    second["$inc"] = {};
                                    second["$inc"].count_awesome = -1;
                                    methods.check_user_clicked_awesome(connected_db, "articles", { _id: first._id, type: first.type, likers: user.blog_id }, function (nothing) {
                                        return f_cb(null);
                                    }, function (doc) {
                                        methods.update_article_array(connected_db, "articles", first, second, f_cb, function (doc) {
                                            if (doc === null) {
                                                return s_cb(null);
                                            } else {
                                                return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: -1}, s_cb, s_cb);
                                            }
                                        });
                                    });
                                }
                            } else { /* Subscription */
                                if (is_push === true) { /* 배열에 블로그 아이디 추가 */
                                    second["$addToSet"] = {};
                                    second["$addToSet"][action] = user.blog_id;
                                } else { /* 배열에서 블로그 아이디 제거 */
                                    second["$pull"] = {};
                                    second["$pull"][action] = user.blog_id;
                                }
                                methods.update_article_array(connected_db, "articles", first, second, f_cb, s_cb);
                            }
                    });
                });
            } else if (type === 'gallery') { /* 앨범일 경우, blog_id */
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false});
                    }
                    notification.blog_id = user.blog_id;
                    notification["info"] = {};
                    notification["info"]["users"] = [];
                    notification["info"]["users"].push({
                        blog_id: user.blog_id
                        , name: user.name
                        , img: user.img
                    });
                    methods.get_single_gallery(connected_db, user, article_data, "perfect", f_cb, function (nothing) {
                            /* Add awesome || Cancel awesome || Subscribe || Unsubscribe */
                            if (action === "likers") { /* awesome */
                                if (is_push === true) { /* Add awesome */
                                    second["$addToSet"] = {};
                                    second["$addToSet"]["likers"] = user.blog_id;
                                    second["$addToSet"]["subscribers"] = user.blog_id;
                                    second["$inc"] = {};
                                    second["$inc"].count_awesome = 1;
                                    methods.check_user_clicked_awesome(connected_db, "articles", { _id: first._id, type: first.type, likers: user.blog_id }, function (nothing) {
                                        methods.update_article_array(connected_db, "articles", first, second, f_cb, function (doc) {
                                            if (doc === null) {
                                                return s_cb(null);
                                            } else {
                                                if (doc.blog_id === user.blog_id) {
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, s_cb, s_cb);
                                                } else {
                                                    notification.link = "/blog/" + doc.blog_id + "/gallery/" + doc._id;
                                                    notification["info"]["type"] = type;
                                                    notification["info"]["title"] = doc.title;
                                                    notification.subscribers = [];
                                                    notification.subscribers.push(doc.blog_id);
                                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: 1}, function (nothing) {
                                                        methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                    }, function (nothing) {
                                                        methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                                    });
                                                }
                                            }
                                        });
                                    }, function (doc) {
                                        return f_cb(null);
                                    });
                                } else { /* Cancel awesome */
                                    second["$pull"] = {};
                                    second["$pull"][action] = user.blog_id;
                                    second["$inc"] = {};
                                    second["$inc"].count_awesome = -1;
                                    methods.check_user_clicked_awesome(connected_db, "articles", { _id: first._id, type: first.type, likers: user.blog_id }, function (nothing) {
                                        return f_cb(null);
                                    }, function (doc) {
                                        methods.update_article_array(connected_db, "articles", first, second, f_cb, function (doc) {
                                            if (doc === null) {
                                                return s_cb(null);
                                            } else {
                                                return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: -1}, s_cb, s_cb);
                                            }
                                        });
                                    });
                                }
                            } else { /* Subscription */
                                if (is_push === true) { /* 배열에 블로그 아이디 추가 */
                                    second["$addToSet"] = {};
                                    second["$addToSet"][action] = user.blog_id;
                                } else { /* 배열에서 블로그 아이디 제거 */
                                    second["$pull"] = {};
                                    second["$pull"][action] = user.blog_id;
                                }
                                methods.update_article_array(connected_db, "articles", first, second, f_cb, s_cb);
                            }
                    });
                });
            } else {
                return f_cb(null);
            }
        }
    }
});
app.post('/update/count-view', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var data = {};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (
        req.body.type === undefined ||
        req.body._id === undefined
    ) {
        return f_cb(null);
    }
    data._id = decodeURIComponent(req.body._id);
    data.type = decodeURIComponent(req.body.type);
    if (
        data.type !== 'apply_now' &&
        data.type !== 'hire_me' &&
        data.type !== 'agenda' &&
        data.type !== 'opinion' &&
        data.type !== 'blog' &&
        data.type !== 'gallery'
    ) {
        return f_cb(null);
    }
    /*if (
        data.type !== 'apply_now' &&
        data.type !== 'hire_me' &&
        data.type !== 'agenda' &&
        data.type !== 'opinion' &&
        data.type !== 'tr_agenda' &&
        data.type !== 'tr_opinion' &&
        data.type !== 'blog' &&
        data.type !== 'gallery'
    ) {
        return f_cb(null);
    }*/
    if (user_id === null || secret_id === null) {
        if (
            data.type === "apply_now" ||
            data.type === "hire_me"
        ) {
            methods.update_article_count(connected_db, "employment", data, {$inc: { count_view:1}}, f_cb, s_cb);
        } else {
            methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}}, f_cb, s_cb);
        }
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (nothing) {
            if (
                data.type === "apply_now" ||
                data.type === "hire_me"
            ) {
                methods.update_article_count(connected_db, "employment", data, {$inc: { count_view:1}}, f_cb, s_cb);
            } else {
                methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}}, f_cb, s_cb);
            }
        }, function (user) {
            if (user.verified === false) {
                return res.json({response:false});
            }
            if (user.blog_id === "") {
                return res.json({response:false});
            }
            if (
                data.type === "apply_now" ||
                data.type === "hire_me"
            ) {
                methods.update_article_count(connected_db, "employment", data, {$inc: { count_view:1}}, f_cb, s_cb);
            } else {
                methods.update_article_count(connected_db, "articles", data, {$inc: { count_view:1}}, f_cb, s_cb);
            }
        });
    }
});
app.post('/insert/article-comment', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});}
        , f_cb3 = function (nothing) {return res.json({response:false, msg: "no_access"});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.type === undefined ||
        req.body.link === undefined ||
        req.body.outer_id === undefined ||
        req.body.comment_type === undefined ||
        req.body.comment === undefined
    ) {
        return f_cb(null);
    }
    var data = {}
        , second = {}
        , type = decodeURIComponent(req.body.type)
        , link = decodeURIComponent(req.body.link)
        , outer_id  = decodeURIComponent(req.body.outer_id)
        , comment_type = decodeURIComponent(req.body.comment_type)
        , comment = decodeURIComponent(req.body.comment);
    /*if (
        type !== "deep" &&
        type !== "apply_now" &&
        type !== "hire_me" &&
        type !== "agenda" &&
        type !== "opinion" &&
        type !== "tr_agenda" &&
        type !== "tr_opinion" &&
        type !== "blog" &&
        type !== "gallery"
    ) {
        return f_cb(null);
    }*/
    if (
        type !== "deep" &&
        type !== "apply_now" &&
        type !== "hire_me" &&
        type !== "agenda" &&
        type !== "opinion" &&
        type !== "blog" &&
        type !== "gallery"
    ) {
        return f_cb(null);
    }
    try {
        comment_type = parseInt(comment_type);
        if (comment_type !== 1 && comment_type !== 2) {
            return f_cb(null);
        }
    } catch (e) {
        return f_cb(null);
    }
    data.type = type;
    data.link = link;
    data.comment_type = comment_type;
    comment = comment.trim().replace(/\s\s+/gi, ' ');
    data.comment = comment;
    if (comment_type === 2) {
        data.outer_id = outer_id;
    } else {
        data.outer_id = "";
    }
    var temp
        , article_data = {};
    article_data.type = type;
    if (type !== "deep") {
        temp = link.split('/');
        article_data.is_removed = false;
    }
    if (type === 'deep') {
        article_data.link = link;
    } else if (type === 'apply_now') {
        if (temp.length !== 3) {
            return f_cb(null);
        }
        data.root_id = article_data._id = temp[2];
        if (article_data._id === "") {
            return f_cb(null);
        }
    } else if (type === 'hire_me') {
        if (temp.length !== 3) {
            return f_cb(null);
        }
        data.root_id = article_data._id = temp[2];
        if (article_data._id === "") {
            return f_cb(null);
        }
    } else if (type === 'agenda') {
        if (temp.length !== 3) {
            return f_cb(null);
        }
        data.root_id = article_data._id = temp[2];
        if (article_data._id === "") {
            return f_cb(null);
        }
    } else if (type === 'opinion') {
        if (temp.length !== 5) {
            return f_cb(null);
        }
        data.root_id = article_data.agenda_id = temp[2];
        article_data._id = temp[4];
        if (article_data.agenda_id === "" || article_data._id === "") {
            return f_cb(null);
        }
    } else if (type === 'tr_agenda') {
        if (temp.length !== 5) {
            return f_cb(null);
        }
        data.root_id = article_data.agenda_id = temp[2];
        article_data._id = temp[4];
        if (article_data.agenda_id === "" || article_data._id === "") {
            return f_cb(null);
        }
    } else if (type === 'tr_opinion') {
        if (temp.length !== 7) {
            return f_cb(null);
        }
        data.root_id = article_data.agenda_id = temp[2];
        article_data.opinion_id = temp[4];
        article_data._id = temp[6];
        if (
            article_data.agenda_id === "" ||
            article_data.opinion_id === "" ||
            article_data._id === ""
        ) {
            return f_cb(null);
        }
    } else if (type === 'blog') {
        if (temp.length !== 5) {
            return f_cb(null);
        }
        article_data.blog_id = temp[2];
        article_data.blog_menu_id = temp[3];
        data.root_id = article_data._id = temp[4];
        if (article_data.blog_id === "" || article_data.blog_menu_id === "" || article_data._id === "") {
            return f_cb(null);
        }
    } else if (type === 'gallery') {
        if (temp.length !== 5 || temp[3] !== 'gallery') {
            return f_cb(null);
        }
        article_data.blog_id = temp[2];
        data.root_id = article_data._id = temp[4];
        if (article_data.blog_id === "" || article_data._id === "") {
            return f_cb(null);
        }
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        /**
         * 게시물 존재여부 확인
         * 1. agenda
         * data._id
         *
         * 2. opinion
         * data._id, data.agenda_id
         *
         * 3. blog
         * user, data._id, data.blog_id, data.blog_menu_id
         *
         * 4. gallery
         * user, data._id, data.blog_id
         */

        /*
         data.type = type;
         data.link = link;
         data.comment_type = comment_type;
         data.comment = comment;
         data.outer_id = outer_id;
        */
        var date = new Date().valueOf()
            , notification = {}
            , language
            , public_authority
            , subscribers;
        data._id = user.blog_id + "_" + date + randomstring.generate(6);
        data.name = user.name;
        data.blog_id = user.blog_id;
        data.img = user.img;
        data.likers = [];
        data.count_awesome = 0;
        data.count_comments = 0;
        data.is_removed = false;
        data.created_at = data.updated_at = date;

        var insert_news_comment = function (doc) {
            data.root_id = doc._id;
            language = doc.language;
            public_authority = 1;
            data.article_language = language;
            data.public_authority = public_authority;
            second = {};
            second["$inc"] = {};
            second["$inc"]["count_comments"] = 1;
            if (comment_type === 1) {
                methods.update_article_count(connected_db, "news", article_data, second,
                    f_cb, function (nothing) {
                        methods.insert_article_comment(connected_db, data, f_cb, s_cb);
                    });
            } else { /* 내부 댓글인 경우 외부 댓글의 댓글개수 카운트 증가 */
                methods.update_article_comment(connected_db, {
                    type: type
                    , link: link
                    , _id: outer_id
                    , comment_type: 1
                }, {
                    $inc: { count_comments:1 }
                }, f_cb, function (nothing) {
                    methods.update_article_count(connected_db, "news", article_data, second,
                        f_cb, function (nothing) {
                            methods.insert_article_comment(connected_db, data, f_cb, s_cb);
                        });
                });
            }
        };
        var insert_article_comment = function (collection_name, doc) {
            language = doc.language;
            public_authority = doc.public_authority;
            subscribers = _.without(doc.subscribers, user.blog_id);
            data.article_language = language;
            data.public_authority = public_authority;
            second = {};
            second["$inc"] = {};
            second["$inc"]["count_comments"] = 1;
            second["$addToSet"] = {};
            second["$addToSet"]["subscribers"] = user.blog_id;

            notification = {};
            notification.type = "comment_written";
            if (comment_type === 1) {
                notification.link = link + "?comment=" + data._id;
            } else {
                notification.link = link + "?comment=" + outer_id + "&inner_comment=" + data._id;
            }
            notification.blog_id = user.blog_id;
            notification["info"] = {};
            notification["info"]["users"] = [];
            notification["info"]["users"].push({
                blog_id: user.blog_id
                , name: user.name
                , img: user.img
            });
            notification["info"]["type"] = doc.type;
            notification["info"]["title"] = doc.title;
            notification.subscribers = subscribers;

            if (comment_type === 1) { /* 외부 댓글인 경우 */
                /* 종속 게시물 댓글개수 카운트 증가 */
                methods.update_article_count(connected_db, collection_name, article_data, second,
                    f_cb, function (nothing) {
                        if (subscribers.length > 0) {
                            methods.insert_article_comment(connected_db, data, f_cb, function (nothing) {
                                methods.insert_notification(connected_db, notification, s_cb, s_cb);
                            });
                        } else {
                            methods.insert_article_comment(connected_db, data, f_cb, s_cb);
                        }
                    });
            } else { /* 내부 댓글인 경우 외부 댓글의 댓글개수 카운트 증가 */
                methods.update_article_comment(connected_db, {
                    type: type
                    , link: link
                    , _id: outer_id
                    , comment_type: 1
                }, {
                    $inc: { count_comments:1 }
                }, f_cb, function (nothing) {
                    /* 종속 게시물 댓글개수 카운트 증가 */
                    methods.update_article_count(connected_db, collection_name, article_data, second,
                        f_cb, function (nothing) {
                            if (subscribers.length > 0) {
                                methods.insert_article_comment(connected_db, data, f_cb, function (nothing) {
                                    methods.insert_notification(connected_db, notification, s_cb, s_cb);
                                });
                            } else {
                                methods.insert_article_comment(connected_db, data, f_cb, s_cb);
                            }
                        });
                });
            }
        };
        if (type === 'deep') {
            methods.get_single_news(connected_db, {link: article_data.link}, f_cb3, function (doc) {
                insert_news_comment(doc);
            });
        } else if (type === 'apply_now') {
            methods.get_single_apply_now(connected_db, user, article_data, "public", "perfect", f_cb3, function (doc) {
                insert_article_comment("employment", doc);
            });
        } else if (type === 'hire_me') {
            methods.get_single_hire_me(connected_db, user, article_data, "public", "perfect", f_cb3, function (doc) {
                insert_article_comment("employment", doc);
            });
        } else if (type === 'agenda') {
            methods.get_single_agenda(connected_db, user, article_data, "comment", "perfect", f_cb3, function (doc) {
                insert_article_comment("articles", doc);
            });
        } else if (type === 'opinion') {
            methods.get_single_opinion(connected_db, user, article_data, "comment", "perfect", f_cb3, function (doc) {
                insert_article_comment("articles", doc);
            });
        } else if (type === 'tr_agenda') {
            methods.get_single_translation(connected_db, user, article_data, "comment", "perfect", f_cb3, function (doc) {
                insert_article_comment("articles", doc);
            });
        } else if (type === 'tr_opinion') {
            methods.get_single_translation(connected_db, user, article_data, "comment", "perfect", f_cb3, function (doc) {
                insert_article_comment("articles", doc);
            });
        } else if (type === 'blog') {
            methods.get_single_blog(connected_db, user, article_data, "perfect", f_cb, function (doc) {
                insert_article_comment("articles", doc);
            });
        } else if (type === 'gallery') {
            methods.get_single_gallery(connected_db, user, article_data, "perfect", f_cb, function (doc) {
                insert_article_comment("articles", doc);
            });
        }
    });
});
app.post('/update/article-comment', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var updated_at = new Date().valueOf();
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true, updated_at:updated_at});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body._id === undefined ||
        req.body.type === undefined ||
        req.body.link === undefined ||
        req.body.outer_id === undefined ||
        req.body.comment_type === undefined ||
        req.body.comment === undefined
    ) {
        return f_cb(null);
    }
    var first = {}
        , second = {};
    first._id = decodeURIComponent(req.body._id);
    first.type = decodeURIComponent(req.body.type);
    first.link = decodeURIComponent(req.body.link);
    first.comment_type = decodeURIComponent(req.body.comment_type);
    first.is_removed = false;
    try {
        first.comment_type = parseInt(first.comment_type);
        if (first.comment_type !== 1 && first.comment_type !== 2) {
            return f_cb(null);
        }
    } catch (e) {
        return f_cb(null);
    }
    second["$set"] = {};
    second["$set"]["comment"] = decodeURIComponent(req.body.comment);
    second["$set"]["comment"] = second["$set"]["comment"].trim().replace(/\s\s+/gi, ' ');
    second["$set"]["updated_at"] = updated_at;
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        first.blog_id = user.blog_id;
        methods.update_article_comment(connected_db, first, second, f_cb, s_cb);
    });
});
app.post('/remove/article', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (nothing) {return res.json({response:false});};
    var s_cb = function (nothing) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body._id === undefined ||
        req.body.type === undefined
    ) {
        return f_cb(null);
    }
    var _id = decodeURIComponent(req.body._id)
        , type = decodeURIComponent(req.body.type)
        , first = {}
        , second = {}
        , comments_link = "";
    if (
        type !== "agenda" &&
        type !== "opinion" &&
        type !== "blog" &&
        type !== "gallery"
    ) {
        return f_cb(null);
    }
    /*if (
        type !== "agenda" &&
        type !== "opinion" &&
        type !== "tr_agenda" &&
        type !== "tr_opinion" &&
        type !== "blog" &&
        type !== "gallery"
    ) {
        return f_cb(null);
    }*/
    if (
        (Object.prototype.toString.call(_id) !== "[object String]")
    ) {
        return f_cb(null);
    }
    first.type = type;
    first._id = _id;
    if (type === "agenda") {
        comments_link = "/agenda/" + first._id;
    } else if (
        type === "tr_agenda"
    ) {
        if (
            req.body.agenda_id === undefined
        ) {
            return f_cb(null);
        }
        first.agenda_id = decodeURIComponent(req.body.agenda_id);
        if (
            (Object.prototype.toString.call(first.agenda_id) !== "[object String]")
        ) {
            return f_cb(null);
        }
        comments_link = "/agenda/" + first.agenda_id + "/tr/" + first._id;
    } else if (
        type === "opinion"
    ) {
        if (
            req.body.agenda_id === undefined
        ) {
            return f_cb(null);
        }
        first.agenda_id = decodeURIComponent(req.body.agenda_id);
        if (
            (Object.prototype.toString.call(first.agenda_id) !== "[object String]")
        ) {
            return f_cb(null);
        }
        comments_link = "/agenda/" + first.agenda_id + "/opinion/" + first._id;
    } else if (type === "tr_opinion") {
        if (
            req.body.agenda_id === undefined ||
            req.body.opinion_id === undefined
        ) {
            return f_cb(null);
        }
        first.agenda_id = decodeURIComponent(req.body.agenda_id);
        first.opinion_id = decodeURIComponent(req.body.opinion_id);
        if (
            (Object.prototype.toString.call(first.agenda_id) !== "[object String]") ||
            (Object.prototype.toString.call(first.opinion_id) !== "[object String]")
        ) {
            return f_cb(null);
        }
        comments_link = "/agenda/" + first.agenda_id + "/opinion/" + first.opinion_id + "/tr/" + first._id;
    } else if (type === "blog") {
        if (
            req.body.blog_menu_id === undefined

        ) {
            return f_cb(null);
        }
        first.blog_menu_id = decodeURIComponent(req.body.blog_menu_id);
        if (
            Object.prototype.toString.call(first.blog_menu_id) !== "[object String]"
        ) {
            return f_cb(null);
        }
    } else if (type === "gallery") {}
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        first.blog_id = user.blog_id;
        if (type === "blog") {
            comments_link = "/blog/" + user.blog_id + "/" + first.blog_menu_id + "/" + first._id;
        } else if (type === "gallery") {
            comments_link = "/blog/" + user.blog_id + "/gallery/" + first._id;
        }
        methods.get_single_article(connected_db, first, f_cb, function (doc) {
            if (user.blog_id !== doc.blog_id) {
                return res.json({response:false});
            }
            methods.remove_document(connected_db, "articles", first, f_cb, function (nothing) {
                first = {};
                first.type = type;
                first.link = comments_link;
                methods.remove_comments(connected_db, first, function (nothing) {
                    if (
                        type === "agenda" ||
                        type === "opinion"
                    ) {
                        first = {};
                        first.link = comments_link;
                        return methods.remove_all_votes(connected_db, first, function (nothing) {
                            first = {};
                            first.original_link = comments_link;
                            return methods.remove_all_translated_votes(connected_db, first, function (nothing) {
                                s_cb();
                                if (doc.likers.length > 0) {
                                    return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: (doc.likers.length * -1)}, function (nothing) {
                                        if (type === "opinion") {
                                            methods.update_article_count(connected_db, "articles", {type: "agenda", _id: doc.agenda_id}, {$inc: { count_written_opinions:-1}}, function (nothing) {
                                                if (doc.tags.length > 0) {
                                                    return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                                        return es_methods.es_remove_document(es_client, doc);
                                                    });
                                                } else {
                                                    return es_methods.es_remove_document(es_client, doc);
                                                }
                                            }, function (nothing) {
                                                if (doc.tags.length > 0) {
                                                    return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                                        return es_methods.es_remove_document(es_client, doc);
                                                    });
                                                } else {
                                                    return es_methods.es_remove_document(es_client, doc);
                                                }
                                            });
                                        } else {
                                            if (doc.tags.length > 0) {
                                                return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                                    return es_methods.es_remove_document(es_client, doc);
                                                });
                                            } else {
                                                return es_methods.es_remove_document(es_client, doc);
                                            }
                                        }
                                    }, function (nothing) {
                                        if (type === "opinion") {
                                            methods.update_article_count(connected_db, "articles", {type: "agenda", _id: doc.agenda_id}, {$inc: { count_written_opinions:-1}}, function (nothing) {
                                                if (doc.tags.length > 0) {
                                                    return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                                        return es_methods.es_remove_document(es_client, doc);
                                                    });
                                                } else {
                                                    return es_methods.es_remove_document(es_client, doc);
                                                }
                                            }, function (nothing) {
                                                if (doc.tags.length > 0) {
                                                    return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                                        return es_methods.es_remove_document(es_client, doc);
                                                    });
                                                } else {
                                                    return es_methods.es_remove_document(es_client, doc);
                                                }
                                            });
                                        } else {
                                            if (doc.tags.length > 0) {
                                                return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                                    return es_methods.es_remove_document(es_client, doc);
                                                });
                                            } else {
                                                return es_methods.es_remove_document(es_client, doc);
                                            }
                                        }
                                    });
                                } else {
                                    if (type === "opinion") {
                                        methods.update_article_count(connected_db, "articles", {type: "agenda", _id: doc.agenda_id}, {$inc: { count_written_opinions:-1}}, function (nothing) {
                                            if (doc.tags.length > 0) {
                                                return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                                    return es_methods.es_remove_document(es_client, doc);
                                                });
                                            } else {
                                                return es_methods.es_remove_document(es_client, doc);
                                            }
                                        }, function (nothing) {
                                            if (doc.tags.length > 0) {
                                                return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                                    return es_methods.es_remove_document(es_client, doc);
                                                });
                                            } else {
                                                return es_methods.es_remove_document(es_client, doc);
                                            }
                                        });
                                    } else {
                                        if (doc.tags.length > 0) {
                                            return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                                return es_methods.es_remove_document(es_client, doc);
                                            });
                                        } else {
                                            return es_methods.es_remove_document(es_client, doc);
                                        }
                                    }
                                }
                            });
                        });
                    } else if (
                        type === "tr_agenda" ||
                        type === "tr_opinion"
                    ) {
                        first = {};
                        first.link = comments_link;
                        return methods.remove_all_translated_votes(connected_db, first, function (nothing) {
                            s_cb();
                            /* Decrease count_written_translations */
                            first = {};
                            second = {};
                            second["$inc"] = {};
                            second["$inc"]["count_written_translations.$.count"] = -1;
                            if (type === "tr_agenda") {
                                first.type = "agenda";
                                first._id = doc.agenda_id;
                                first["count_written_translations.language"] = doc.language;
                                methods.update_article_count(connected_db, "articles", first, second, function (nothing) {
                                    if (doc.likers.length > 0) {
                                        return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: (doc.likers.length * -1)}, function (nothing) {
                                            return es_methods.es_remove_document(es_client, doc);
                                        }, function (nothing) {
                                            return es_methods.es_remove_document(es_client, doc);
                                        });
                                    } else {
                                        return es_methods.es_remove_document(es_client, doc);
                                    }
                                }, function (nothing) {
                                    if (doc.likers.length > 0) {
                                        return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: (doc.likers.length * -1)}, function (nothing) {
                                            return es_methods.es_remove_document(es_client, doc);
                                        }, function (nothing) {
                                            return es_methods.es_remove_document(es_client, doc);
                                        });
                                    } else {
                                        return es_methods.es_remove_document(es_client, doc);
                                    }
                                });
                            } else {
                                first.type = "opinion";
                                first._id = doc.opinion_id;
                                first["count_written_translations.language"] = doc.language;
                                methods.update_article_count(connected_db, "articles", first, second, function (nothing) {
                                    if (doc.likers.length > 0) {
                                        return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: (doc.likers.length * -1)}, function (nothing) {
                                            return es_methods.es_remove_document(es_client, doc);
                                        }, function (nothing) {
                                            return es_methods.es_remove_document(es_client, doc);
                                        });
                                    } else {
                                        return es_methods.es_remove_document(es_client, doc);
                                    }
                                }, function (nothing) {
                                    if (doc.likers.length > 0) {
                                        return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: (doc.likers.length * -1)}, function (nothing) {
                                            return es_methods.es_remove_document(es_client, doc);
                                        }, function (nothing) {
                                            return es_methods.es_remove_document(es_client, doc);
                                        });
                                    } else {
                                        return es_methods.es_remove_document(es_client, doc);
                                    }
                                });
                            }
                        });
                    } else if (
                        type === "blog"
                    ) {
                        first = {};
                        first.link = comments_link;
                        return methods.remove_all_votes(connected_db, first, function (nothing) {
                            s_cb();
                            if (doc.likers.length > 0) {
                                return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: (doc.likers.length * -1)}, function (nothing) {
                                    if (doc.tags.length > 0) {
                                        return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                            return es_methods.es_remove_document(es_client, doc);
                                        });
                                    } else {
                                        return es_methods.es_remove_document(es_client, doc);
                                    }
                                }, function (nothing) {
                                    if (doc.tags.length > 0) {
                                        return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                            return es_methods.es_remove_document(es_client, doc);
                                        });
                                    } else {
                                        return es_methods.es_remove_document(es_client, doc);
                                    }
                                });
                            } else {
                                if (doc.tags.length > 0) {
                                    return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                        return es_methods.es_remove_document(es_client, doc);
                                    });
                                } else {
                                    return es_methods.es_remove_document(es_client, doc);
                                }
                            }
                        });
                    } else if (
                        type === "gallery"
                    ) {
                        s_cb(null);
                        if (doc.likers.length > 0) {
                            return methods.update_user_count_awesome(connected_db, {blog_id: doc.blog_id, count: (doc.likers.length * -1)}, function (nothing) {
                                if (doc.tags.length > 0) {
                                    return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                        return es_methods.es_remove_document(es_client, doc);
                                    });
                                } else {
                                    return es_methods.es_remove_document(es_client, doc);
                                }
                            }, function (nothing) {
                                if (doc.tags.length > 0) {
                                    return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                        return es_methods.es_remove_document(es_client, doc);
                                    });
                                } else {
                                    return es_methods.es_remove_document(es_client, doc);
                                }
                            });
                        } else {
                            if (doc.tags.length > 0) {
                                return methods.upsert_user_tags(connected_db, user, doc.tags, 0, "dec", function () {
                                    return es_methods.es_remove_document(es_client, doc);
                                });
                            } else {
                                return es_methods.es_remove_document(es_client, doc);
                            }
                        }
                    }
                });
            });
        });
    });
});
app.post('/remove/article-comment', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body._id === undefined ||
        req.body.type === undefined ||
        req.body.link === undefined ||
        req.body.comment_type === undefined ||
        req.body.blog_id === undefined
    ) {
        return f_cb(null);
    }
    var _id = decodeURIComponent(req.body._id)
        , type = decodeURIComponent(req.body.type)
        , link = decodeURIComponent(req.body.link)
        , comment_type = decodeURIComponent(req.body.comment_type)
        , blog_id = decodeURIComponent(req.body.blog_id)
        , first = {}
        , second = {};
    if (
        type !== "deep" &&
        type !== "apply_now" &&
        type !== "hire_me" &&
        type !== "agenda" &&
        type !== "opinion" &&
        type !== "blog" &&
        type !== "gallery"
    ) {
        return f_cb(null);
    }
    /*if (
        type !== "deep" &&
        type !== "apply_now" &&
        type !== "hire_me" &&
        type !== "agenda" &&
        type !== "opinion" &&
        type !== "tr_agenda" &&
        type !== "tr_opinion" &&
        type !== "blog" &&
        type !== "gallery"
    ) {
        return f_cb(null);
    }*/
    try {
        comment_type = parseInt(comment_type);
        if (comment_type !== 1 && comment_type !== 2) {
            return f_cb(null);
        }
    } catch (e) {
        return f_cb(null);
    }
    first._id = _id;
    first.type = type;
    first.is_removed = false;
    if (comment_type === 2) {
        first.outer_id = decodeURIComponent(req.body.outer_id);
    }
    var temp
        , article_data = {}
        , collection_name;
    article_data.type = type;
    if (
        type !== "deep" &&
        type !== "clipping"
    ) {
        temp = link.split('/');
        article_data.is_removed = false;
    }
    if (type === 'deep') {
        article_data.link = link;
        collection_name = "news";
    } else if (type === 'apply_now') {
        if (temp.length !== 3) {
            return f_cb(null);
        }
        article_data._id = temp[2];
        if (article_data._id === "") {
            return f_cb(null);
        }
        collection_name = "employment";
    } else if (type === 'hire_me') {
        if (temp.length !== 3) {
            return f_cb(null);
        }
        article_data._id = temp[2];
        if (article_data._id === "") {
            return f_cb(null);
        }
        collection_name = "employment";
    } else if (type === 'agenda') {
        if (temp.length !== 3) {
            return f_cb(null);
        }
        article_data._id = temp[2];
        if (article_data._id === "") {
            return f_cb(null);
        }
        collection_name = "articles";
    } else if (type === 'opinion') {
        if (temp.length !== 5) {
            return f_cb(null);
        }
        article_data.agenda_id = temp[2];
        article_data._id = temp[4];
        if (article_data.agenda_id === "" || article_data._id === "") {
            return f_cb(null);
        }
        collection_name = "articles";
    } else if (type === 'tr_agenda') {
        if (temp.length !== 5) {
            return f_cb(null);
        }
        article_data.agenda_id = temp[2];
        article_data._id = temp[4];
        if (article_data.agenda_id === "" || article_data._id === "") {
            return f_cb(null);
        }
        collection_name = "articles";
    } else if (type === 'tr_opinion') {
        if (temp.length !== 7) {
            return f_cb(null);
        }
        article_data.agenda_id = temp[2];
        article_data.opinion_id = temp[4];
        article_data._id = temp[6];
        if (
            article_data.agenda_id === "" ||
            article_data.opinion_id === "" ||
            article_data._id === ""
        ) {
            return f_cb(null);
        }
        collection_name = "articles";
    } else if (type === 'blog') {
        if (temp.length !== 5) {
            return f_cb(null);
        }
        article_data.blog_id = temp[2];
        article_data.blog_menu_id = temp[3];
        article_data._id = temp[4];
        if (article_data.blog_id === "" || article_data.blog_menu_id === "" || article_data._id === "") {
            return f_cb(null);
        }
        collection_name = "articles";
    } else if (type === 'gallery') {
        if (temp.length !== 5 || temp[3] !== 'gallery') {
            return f_cb(null);
        }
        article_data.blog_id = temp[2];
        article_data._id = temp[4];
        if (article_data.blog_id === "" || article_data._id === "") {
            return f_cb(null);
        }
        collection_name = "articles";
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        first.blog_id = user.blog_id;
        methods.remove_article_comment(connected_db, first, {"$set": {is_removed:true, updated_at: new Date().valueOf()}}, f_cb, function (nothing) {
            delete first.is_removed;
            if (comment_type === 2) {
                methods.update_article_comment(connected_db, {
                    type: type
                    , link: link
                    , _id: first.outer_id
                    , comment_type: 1
                }, {
                    $inc: { count_comments:-1 }
                }, f_cb, function (nothing) {
                    /* 종속 게시물 댓글개수 카운트 감소 */
                    methods.update_article_count(connected_db, collection_name, article_data, {$inc: { count_comments:-1}}, f_cb, s_cb);
                });
            } else {
                methods.get_single_article_comment(connected_db, first, f_cb, function (doc) {
                    /* 외부댓글 1 + 외부댓글의 내부 댓글 개수 만큼 종속 게시물 댓글개수 카운트 감소시키기 */
                    var count = (1 + doc.count_comments) * -1;
                    methods.update_article_count(connected_db, collection_name, article_data, {$inc: { count_comments:count}}, f_cb, function (nothing) {
                        /* 모든 내부 댓글 삭제하기 */
                        methods.remove_article_inner_comments(connected_db, {
                            type:type
                            , link:link
                            , comment_type:2
                            , outer_id: first._id
                        }, {"$set": {is_removed:true}}, f_cb, s_cb);
                    });
                });
            }
        });
    });
});
app.post('/get/single-article-comment', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true, doc:doc});};
    if (
        req.body.link === undefined ||
        req.body.type === undefined ||
        req.body._id === undefined ||
        req.body.comment_type === undefined
    ) {
        return f_cb(null);
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    var first = {};
    first.link = decodeURIComponent(req.body.link);
    first._id = decodeURIComponent(req.body._id);
    if (user_id === null || secret_id === null) {
        methods.get_single_article_comment(connected_db, first, f_cb, s_cb);
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (nothing) {
            methods.get_single_article_comment(connected_db, first, f_cb, s_cb);
        }, function (user) {
            if (user.verified === false) {
                return res.json({response:false});
            }
            if (user.blog_id === "") {
                return res.json({response:false});
            }
            methods.get_single_article_comment(connected_db, first, f_cb, s_cb);
        });
    }
});
/**
 * 게시물 댓글 가져오기
 * req.body.link - 링크
 * req.body.type - "agenda" || "opinion" || "blog" || "gallery"
 * req.body.outer_id - 내부댓글일 경우, 외부댓글의 _id
 * req.body.comment_type - 1 || 2
 * req.body.is_lt - "true":  일반적인 경우, "false": 댓글 삽입 후, 최신댓글만 뽑아올 경우.
 * req.body.created_at - 없을 경우도 있음. 없을 경우, limit.comments 만큼만 잘라서 반환하면 됨.
 */
app.post('/get/article-comments', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (docs) {return res.json({response:false});};
    var s_cb = function (docs) {return res.json({response:true, docs:docs});};
    if (
        req.body.link === undefined ||
        req.body.type === undefined ||
        req.body.outer_id === undefined ||
        req.body.comment_type === undefined ||
        req.body.is_lt === undefined
    ) {
        return f_cb(null);
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    var link = decodeURIComponent(req.body.link)
        , type = decodeURIComponent(req.body.type)
        , outer_id = decodeURIComponent(req.body.outer_id)
        , comment_type = decodeURIComponent(req.body.comment_type)
        , is_lt = decodeURIComponent(req.body.is_lt)
        , created_at = undefined
        , first = {}
        , second = {};
    if (
        type !== "deep" &&
        type !== "apply_now" &&
        type !== "hire_me" &&
        type !== "agenda" &&
        type !== "opinion" &&
        type !== "blog" &&
        type !== "gallery"
    ) {
        return f_cb(null);
    }
    /*if (
        type !== "deep" &&
        type !== "apply_now" &&
        type !== "hire_me" &&
        type !== "agenda" &&
        type !== "opinion" &&
        type !== "tr_agenda" &&
        type !== "tr_opinion" &&
        type !== "blog" &&
        type !== "gallery"
    ) {
        return f_cb(null);
    }*/
    try {
        comment_type = parseInt(comment_type);
        if (comment_type !== 1 && comment_type !== 2) {
            return f_cb(null);
        }
    } catch (e) {
        return f_cb(null);
    }
    if (req.body.created_at !== undefined) {
        created_at = decodeURIComponent(req.body.created_at);
        try {
            created_at = parseInt(created_at);
        } catch (e) {
            return f_cb(null);
        }
    }
    first.link = link;
    first.type = type;
    first.comment_type = comment_type;
    if (created_at !== undefined) {
        if (is_lt === "true") {
            first.created_at = { "$lt": created_at };
        } else {
            first.created_at = { "$gt": created_at };
        }
    }
    if (comment_type === 2) {
        first.outer_id = outer_id;
    }
    first.is_removed = false;
    second.is_removed = 0;
    if (user_id === null || secret_id === null) {
        methods.get_article_comments(connected_db, false, first, second, f_cb, s_cb);
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (nothing) {
            methods.get_article_comments(connected_db, false, first, second, f_cb, s_cb);
        }, function (user) {
            if (user.verified === false) {
                return res.json({response:false});
            }
            if (user.blog_id === "") {
                return res.json({response:false});
            }
            methods.get_article_comments(connected_db, true, first, second, f_cb, s_cb);
        });
    }
});
app.post('/get/realtime-comments', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (docs) {return res.json({response:false});};
    var s_cb = function (docs) {return res.json({response:true, docs:docs});};
    if (
        req.body.type === undefined
    ) {
        return f_cb(null);
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    var type = decodeURIComponent(req.body.type);
    if (
        type !== 'debate' &&
        type !== 'agenda' &&
        type !== 'opinion' &&
        type !== 'blog'
    ) {
        return f_cb(null);
    }
    if (user_id === null || secret_id === null) {
        return methods.get_realtime_comments(connected_db, lang, false, type, f_cb, s_cb);
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (nothing) {
            return methods.get_realtime_comments(connected_db, lang, false, type, f_cb, s_cb);
        }, function (user) {
            if (user.verified === false) {
                return res.json({response:false});
            }
            if (user.blog_id === "") {
                return res.json({response:false});
            }
            return methods.get_realtime_comments(connected_db, lang, true, type, f_cb, s_cb);
        });
    }
});
app.post('/get/single-news-with-comments', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc, comments) {return res.json({response:true, doc: doc, comments: comments});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (
        req.body._id === undefined
    ) {
        return f_cb(null);
    }
    var _id = decodeURIComponent(req.body._id)
        , first = {}
        , second = {};
    if (user_id === null || secret_id === null) {
        methods.get_single_news(connected_db, {_id: _id}, f_cb, function (news_doc) {
            first.link = news_doc.link;
            first.type = news_doc.type;
            first.comment_type = 1;
            first.is_removed = false;
            second.is_removed = 0;
            methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                news_comments = [];
                return s_cb(news_doc, news_comments);
            }, function (news_comments) {
                return s_cb(news_doc, news_comments);
            });
        });
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (nothing) {
            methods.get_single_news(connected_db, {_id: _id}, f_cb, function (news_doc) {
                first.link = news_doc.link;
                first.type = news_doc.type;
                first.comment_type = 1;
                first.is_removed = false;
                second.is_removed = 0;
                methods.get_article_comments(connected_db, false, first, second, function (news_comments) {
                    news_comments = [];
                    return s_cb(news_doc, news_comments);
                }, function (news_comments) {
                    return s_cb(news_doc, news_comments);
                });
            });
        }, function (user) {
            if (user.verified === false) {
                return res.json({response:false});
            }
            if (user.blog_id === "") {
                return res.json({response:false});
            }
            methods.get_single_news(connected_db, {_id: _id}, f_cb, function (news_doc) {
                first.link = news_doc.link;
                first.type = news_doc.type;
                first.comment_type = 1;
                first.is_removed = false;
                second.is_removed = 0;
                methods.get_article_comments(connected_db, true, first, second, function (news_comments) {
                    news_comments = [];
                    return s_cb(news_doc, news_comments);
                }, function (news_comments) {
                    return s_cb(news_doc, news_comments);
                });
            });
        });
    }
});
app.post('/insert/guestbook', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var f_cb2 = function (doc) {return res.json({response:false, msg: "no_blog_id"});};
    var s_cb = function (doc) {return res.json({response:true, doc: doc});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.blog_id === undefined ||
        req.body.is_secret === undefined ||
        req.body.content === undefined
    ) {
        return f_cb(null);
    }
    var data = {}
        , blog_id = decodeURIComponent(req.body.blog_id)
        , is_secret = decodeURIComponent(req.body.is_secret) === "true"
        , content = decodeURIComponent(req.body.content);
    data.blog_id = blog_id;
    data.is_secret = is_secret;
    data.content = content;
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return f_cb2(null);
        }
        if (user.blog_id === blog_id) {
            return f_cb(null);
        }
        methods.check_blog_id(connected_db, blog_id, true, f_cb, function (blog_owner) {
            methods.insert_guestbook(connected_db, data, user, f_cb, s_cb);
        });
    });
});
app.post('/update/guestbook', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var f_cb2 = function (doc) {return res.json({response:false, msg: "no_blog_id"});};
    var s_cb = function (doc) {return res.json({response:true, doc: doc});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body._id === undefined ||
        req.body.blog_id === undefined ||
        req.body.visitor_blog_id === undefined ||
        req.body.is_secret === undefined ||
        req.body.content === undefined
    ) {
        return f_cb(null);
    }
    var data = {}
        , _id = decodeURIComponent(req.body._id)
        , blog_id = decodeURIComponent(req.body.blog_id)
        , visitor_blog_id = decodeURIComponent(req.body.visitor_blog_id)
        , is_secret = decodeURIComponent(req.body.is_secret) === "true"
        , content = decodeURIComponent(req.body.content);
    data._id = _id;
    data.blog_id = blog_id;
    data.visitor_blog_id = visitor_blog_id;
    data.is_secret = is_secret;
    data.content = content;
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return f_cb2(null);
        }
        if (visitor_blog_id !== user.blog_id) {
            return f_cb(null);
        }
        methods.check_blog_id(connected_db, blog_id, true, f_cb, function (blog_owner) {
            methods.update_guestbook(connected_db, data, user, f_cb, s_cb);
        });
    });
});
app.post('/remove/guestbook', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var f_cb2 = function (doc) {return res.json({response:false, msg: "no_blog_id"});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body._id === undefined ||
        req.body.blog_id === undefined ||
        req.body.visitor_blog_id === undefined
    ) {
        return f_cb(null);
    }
    var data = {}
        , _id = decodeURIComponent(req.body._id)
        , blog_id = decodeURIComponent(req.body.blog_id)
        , visitor_blog_id = decodeURIComponent(req.body.visitor_blog_id);
    data._id = _id;
    data.blog_id = blog_id;
    data.visitor_blog_id = visitor_blog_id;
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return f_cb2(null);
        }
        if (
            blog_id !== user.blog_id &&
            visitor_blog_id !== user.blog_id
        ) {
            return f_cb(null);
        }
        methods.check_blog_id(connected_db, blog_id, true, f_cb, function (blog_owner) {
            methods.remove_guestbook(connected_db, data, user, f_cb, s_cb);
        });
    });
});
app.post('/insert/guestbook-comment', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});}
        , f_cb3 = function (nothing) {return res.json({response:false, msg: "no_access"});};
    var s_cb = function (comments) {return res.json({response:true, comments: comments});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.guestbook_id === undefined ||
        req.body.blog_id === undefined ||
        req.body.visitor_blog_id === undefined ||
        req.body.comment === undefined
    ) {
        return f_cb(null);
    }
    var data = {}
        , guestbook_id = decodeURIComponent(req.body.guestbook_id)
        , blog_id = decodeURIComponent(req.body.blog_id)
        , visitor_blog_id  = decodeURIComponent(req.body.visitor_blog_id)
        , comment = decodeURIComponent(req.body.comment);
    data.guestbook_id = guestbook_id;
    data.blog_id = blog_id;
    data.visitor_blog_id = visitor_blog_id;
    comment = comment.trim().replace(/\s\s+/gi, ' ');
    data.comment = comment;
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb3, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (
            user.blog_id !== blog_id &&
            user.blog_id !== visitor_blog_id
        ) {
            return f_cb3(null);
        }
        methods.update_guestbook_comment(connected_db, data, user, "add", f_cb, s_cb);
    });
});
app.post('/update/guestbook-comment', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});}
        , f_cb3 = function (nothing) {return res.json({response:false, msg: "no_access"});};
    var s_cb = function (comments) {return res.json({response:true, comments: comments});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.guestbook_id === undefined ||
        req.body._id === undefined ||
        req.body.blog_id === undefined ||
        req.body.comment === undefined
    ) {
        return f_cb(null);
    }
    var data = {}
        , guestbook_id = decodeURIComponent(req.body.guestbook_id)
        , _id  = decodeURIComponent(req.body._id)
        , blog_id = decodeURIComponent(req.body.blog_id)
        , comment = decodeURIComponent(req.body.comment);
    data.guestbook_id = guestbook_id;
    data._id = _id;
    data.blog_id = blog_id;
    comment = comment.trim().replace(/\s\s+/gi, ' ');
    data.comment = comment;
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb3, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (
            user.blog_id !== blog_id
        ) {
            return f_cb3(null);
        }
        methods.update_guestbook_comment(connected_db, data, user, "update", f_cb, s_cb);
    });
});
app.post('/remove/guestbook-comment', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});}
        , f_cb3 = function (nothing) {return res.json({response:false, msg: "no_access"});};
    var s_cb = function (comments) {return res.json({response:true, comments: comments});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.guestbook_id === undefined ||
        req.body._id === undefined ||
        req.body.blog_id === undefined ||
        req.body.blog_owner_blog_id === undefined
    ) {
        return f_cb(null);
    }
    var data = {}
        , guestbook_id = decodeURIComponent(req.body.guestbook_id)
        , _id  = decodeURIComponent(req.body._id)
        , blog_id = decodeURIComponent(req.body.blog_id)
        , blog_owner_blog_id = decodeURIComponent(req.body.blog_owner_blog_id);
    data.guestbook_id = guestbook_id;
    data._id = _id;
    data.blog_id = blog_id;
    data.blog_owner_blog_id = blog_owner_blog_id;
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb3, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (
            user.blog_id !== blog_id &&
            user.blog_id !== blog_owner_blog_id
        ) {
            return f_cb3(null);
        }
        methods.update_guestbook_comment(connected_db, data, user, "remove", f_cb, s_cb);
    });
});
app.post('/get/single', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {
        if (doc.es_id !== undefined) {
            delete doc.es_id;
        }
        if (doc.es_index !== undefined) {
            delete doc.es_index;
        }
        if (doc.es_is_updated !== undefined) {
            delete doc.es_is_updated;
        }
        if (doc.es_type !== undefined) {
            delete doc.es_type;
        }
        if (doc.es_updated_at !== undefined) {
            delete doc.es_updated_at;
        }
        return res.json({response:true, doc:doc});
    };
    var s_cb2 = function (doc) {
        return methods.get_divided_contents_for_translation_writing(connected_db, doc, function (divided_doc) {
            return res.json({response:true, doc:doc, divided_doc: divided_doc});
        });
    };
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (
        req.body.type === undefined ||
        req.body._id === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data["type"] = decodeURIComponent(req.body.type);
    data["_id"] = decodeURIComponent(req.body._id);
    if (data["type"] === "apply_now") {
        if (user_id === null || secret_id === null) {
            if (req.body.is_edit === undefined) {
                return methods.get_single_apply_now(connected_db, null, data, "public", "perfect", f_cb, function (doc) {
                    doc.is_member = false;
                    return s_cb(doc);
                });
            } else {
                return res.json({response:false});
            }
        } else {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                , function (nothing) {
                    if (req.body.is_edit === undefined) {
                        return methods.get_single_apply_now(connected_db, null, data, "public", "perfect", f_cb, function (doc) {
                            doc.is_member = false;
                            return s_cb(doc);
                        });
                    } else {
                        return res.json({response:false});
                    }
                }, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false, msg: "no_blog_id"});
                    }
                    if (req.body.is_edit === undefined) {
                        return methods.get_single_apply_now(connected_db, user, data, "public", "perfect", f_cb, function (doc) {
                            return methods.is_member(connected_db, "employment", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                                doc.is_member = is_member;
                                return s_cb(doc);
                            });
                        });
                    } else {
                        if (decodeURIComponent(req.body.is_edit) === "true") {
                            return methods.get_single_apply_now(connected_db, user, data, "owner", "all", f_cb, function (doc) {
                                return methods.is_member(connected_db, "employment", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                                    doc.is_member = is_member;
                                    return s_cb(doc);
                                });
                            });
                        } else {
                            return methods.get_single_apply_now(connected_db, user, data, "public", "perfect", f_cb, function (doc) {
                                return methods.is_member(connected_db, "employment", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                                    doc.is_member = is_member;
                                    return s_cb(doc);
                                });
                            });
                        }
                    }
                });
        }
    } else if (data["type"] === "hire_me") {
        if (user_id === null || secret_id === null) {
            return res.json({response:false, msg: "no_user"});
        } else {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                , function (nothing) {
                    return res.json({response:false, msg: "no_user"});
                }, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false, msg: "no_blog_id"});
                    }
                    return methods.get_single_hire_me(connected_db, user, data, "public", "perfect", f_cb, function (doc) {
                        return methods.is_member(connected_db, "employment", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                            doc.is_member = is_member;
                            return s_cb(doc);
                        })
                    });
                });
        }
    } else if (data["type"] === "agenda") { /* Return Single Agenda */
        if ( decodeURIComponent(req.body.with_divided_contents) === 'true' ) {
            if (user_id === null || secret_id === null) {
                return res.json({response:false, msg: "no_user"});
            } else {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                    , function (nothing) {
                        return res.json({response:false, msg: "no_user"});
                    }, function (user) {
                        if (user.verified === false) {
                            return res.json({response:false});
                        }
                        if (user.blog_id === "") {
                            return res.json({response:false, msg: "no_blog_id"});
                        }
                        return methods.get_single_agenda(connected_db, user, data, "public", "perfect", f_cb, function (doc) {
                            return methods.is_member(connected_db, "articles", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                                doc.is_member = is_member;
                                return s_cb2(doc);
                            })
                        });
                    });
            }
        } else {
            if (user_id === null || secret_id === null) {
                return methods.get_single_agenda(connected_db, null, data, "public", "perfect", f_cb, function (doc) {
                    doc.is_member = false;
                    return s_cb(doc);
                });
            } else {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                    , function (nothing) {
                        return methods.get_single_agenda(connected_db, null, data, "public", "perfect", f_cb, function (doc) {
                            doc.is_member = false;
                            return s_cb(doc);
                        });
                    }, function (user) {
                        if (user.verified === false) {
                            return res.json({response:false});
                        }
                        if (user.blog_id === "") {
                            return res.json({response:false, msg: "no_blog_id"});
                        }
                        return methods.get_single_agenda(connected_db, user, data, "public", "perfect", f_cb, function (doc) {
                            return methods.is_member(connected_db, "articles", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                                doc.is_member = is_member;
                                return s_cb(doc);
                            })
                        });
                    });
            }
        }
    } else if (data["type"] === "opinion") { /* Return Single Opinion */
        if (req.body.agenda_id === undefined) {
            return f_cb(null);
        }
        data["agenda_id"] = decodeURIComponent(req.body.agenda_id);
        if ( decodeURIComponent(req.body.with_divided_contents) === 'true' ) {
            if (user_id === null || secret_id === null) {
                return res.json({response:false, msg: "no_user"});
            } else {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                    , function (nothing) {
                        return res.json({response:false, msg: "no_user"});
                    }, function (user) {
                        if (user.verified === false) {
                            return res.json({response:false});
                        }
                        if (user.blog_id === "") {
                            return res.json({response:false, msg: "no_blog_id"});
                        }
                        return methods.get_single_opinion(connected_db, user, data, "public", "perfect", f_cb, s_cb2);
                    });
            }
        } else {
            if (user_id === null || secret_id === null) {
                return methods.get_single_opinion(connected_db, null, data, "public", "perfect", f_cb, s_cb);
            } else {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                    , function (nothing) {
                        return methods.get_single_opinion(connected_db, null, data, "public", "perfect", f_cb, s_cb);
                    }, function (user) {
                        if (user.verified === false) {
                            return res.json({response:false});
                        }
                        if (user.blog_id === "") {
                            return res.json({response:false, msg: "no_blog_id"});
                        }
                        return methods.get_single_opinion(connected_db, user, data, "public", "perfect", f_cb, s_cb);
                    });
            }
        }
    } else if (data["type"] === "tr_agenda") { /* Return Single Translation Agenda */
        return f_cb(null);
        if (req.body.agenda_id === undefined) {
            return f_cb(null);
        }
        data["agenda_id"] = decodeURIComponent(req.body.agenda_id);
        if ( decodeURIComponent(req.body.with_divided_contents) === 'true' ) {
            if (user_id === null || secret_id === null) {
                return res.json({response:false, msg: "no_user"});
            } else {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                    , function (nothing) {
                        return res.json({response:false, msg: "no_user"});
                    }, function (user) {
                        if (user.verified === false) {
                            return res.json({response:false});
                        }
                        if (user.blog_id === "") {
                            return res.json({response:false, msg: "no_blog_id"});
                        }
                        methods.get_single_article_filtered(connected_db, { type: "agenda", _id: data.agenda_id }, "perfect", f_cb, function (original_doc) {
                            methods.get_single_translation(connected_db, user, data, "public", "perfect", f_cb, function (translated_doc) {
                                return methods.get_divided_contents_for_translation_writing(connected_db, original_doc, function (divided_original_doc) {
                                    return methods.get_divided_contents_for_translation_writing(connected_db, translated_doc, function (divided_translated_doc) {
                                        return res.json({response:true, original_doc:original_doc, translated_doc: translated_doc, divided_original_doc:divided_original_doc, divided_translated_doc:divided_translated_doc});
                                    });
                                });
                            });
                        });
                    });
            }
        } else {
            if (user_id === null || secret_id === null) {
                return methods.get_single_translation(connected_db, null, data, "public", "perfect", f_cb, function (doc) {
                    doc.is_member = false;
                    return s_cb(doc);
                });
            } else {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                    , function (nothing) {
                        return methods.get_single_translation(connected_db, null, data, "public", "perfect", f_cb, function (doc) {
                            doc.is_member = false;
                            return s_cb(doc);
                        });
                    }, function (user) {
                        if (user.verified === false) {
                            return res.json({response:false});
                        }
                        if (user.blog_id === "") {
                            return res.json({response:false, msg: "no_blog_id"});
                        }
                        return methods.get_single_translation(connected_db, user, data, "public", "perfect", f_cb, function (doc) {
                            return methods.is_member(connected_db, "articles", {_id: doc._id, blog_id: user.blog_id}, false, function (is_member) {
                                doc.is_member = is_member;
                                return s_cb(doc);
                            })
                        });
                    });
            }
        }
    } else if (data["type"] === "tr_opinion") { /* 단일 번역 의견 반환 */
        return f_cb(null);
        if (
            req.body.agenda_id === undefined ||
            req.body.opinion_id === undefined
        ) {
            return f_cb(null);
        }
        data["agenda_id"] = decodeURIComponent(req.body.agenda_id);
        data["opinion_id"] = decodeURIComponent(req.body.opinion_id);
        if ( decodeURIComponent(req.body.with_divided_contents) === 'true' ) {
            if (user_id === null || secret_id === null) {
                return res.json({response:false, msg: "no_user"});
            } else {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                    , function (nothing) {
                        return res.json({response:false, msg: "no_user"});
                    }, function (user) {
                        if (user.verified === false) {
                            return res.json({response:false});
                        }
                        if (user.blog_id === "") {
                            return res.json({response:false, msg: "no_blog_id"});
                        }
                        methods.get_single_article_filtered(connected_db, { type: "opinion", _id: data.opinion_id }, "perfect", f_cb, function (original_doc) {
                            methods.get_single_translation(connected_db, user, data, "public", "perfect", f_cb, function (translated_doc) {
                                return methods.get_divided_contents_for_translation_writing(connected_db, original_doc, function (divided_original_doc) {
                                    return methods.get_divided_contents_for_translation_writing(connected_db, translated_doc, function (divided_translated_doc) {
                                        return res.json({response:true, original_doc:original_doc, translated_doc: translated_doc, divided_original_doc:divided_original_doc, divided_translated_doc:divided_translated_doc});
                                    });
                                });
                            });
                        });
                    });
            }
        } else {
            if (user_id === null || secret_id === null) {
                return methods.get_single_translation(connected_db, null, data, "public", "perfect", f_cb, s_cb);
            } else {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                    , function (nothing) {
                        return methods.get_single_translation(connected_db, null, data, "public", "perfect", f_cb, s_cb);
                    }, function (user) {
                        if (user.verified === false) {
                            return res.json({response:false});
                        }
                        if (user.blog_id === "") {
                            return res.json({response:false, msg: "no_blog_id"});
                        }
                        return methods.get_single_translation(connected_db, user, data, "public", "perfect", f_cb, s_cb);
                    });
            }
        }
    } else if (data["type"] === "blog") { /* 단일 블로그 반환 */
        if (req.body.blog_id === undefined ||
            req.body.blog_menu_id === undefined) {
            return f_cb(null);
        }
        data["blog_id"] = decodeURIComponent(req.body.blog_id);
        data["blog_menu_id"] = decodeURIComponent(req.body.blog_menu_id);
        if (user_id === null || secret_id === null) {
            return methods.get_single_blog(connected_db, null, data, "perfect", f_cb, s_cb);
        } else {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                function (nothing) {
                    return methods.get_single_blog(connected_db, null, data, "perfect", f_cb, s_cb);
                }, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false, msg: "no_blog_id"});
                    }
                    return methods.get_single_blog(connected_db, user, data, "perfect", f_cb, s_cb);
                });
        }
    } else if (data["type"] === "gallery") { /* 단일 앨범 이미지 반환 */
        if (req.body.blog_id === undefined) {
            return f_cb(null);
        }
        data["blog_id"] = decodeURIComponent(req.body.blog_id);
        if (user_id === null || secret_id === null) {
            return methods.get_single_gallery(connected_db, null, data, "perfect", f_cb, s_cb);
        } else {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                function (nothing) {
                    return methods.get_single_gallery(connected_db, null, data, "perfect", f_cb, s_cb);
                }, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false, msg: "no_blog_id"});
                    }
                    return methods.get_single_gallery(connected_db, user, data, "perfect", f_cb, s_cb);
                });
        }
    } else if (data["type"] === "guestbook") { /* Return single guestbook */
        if (req.body.blog_id === undefined) {
            return f_cb(null);
        }
        data["blog_id"] = decodeURIComponent(req.body.blog_id);
        if (user_id === null || secret_id === null) {
            return methods.get_single_guestbook(connected_db, null, data, f_cb, s_cb);
        } else {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                function (nothing) {
                    return methods.get_single_guestbook(connected_db, null, data, f_cb, s_cb);
                }, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false, msg: "no_blog_id"});
                    }
                    return methods.get_single_guestbook(connected_db, user, data, f_cb, s_cb);
                });
        }
    } else {
        return f_cb(null);
    }
    // else if (data["type"] === "user") { /* 단일 인물정보 반환 */
    //     if (req.body.blog_id === undefined) {
    //         return f_cb(null);
    //     }
    //     data["blog_id"] = decodeURIComponent(req.body.blog_id);
    //     if (user_id === null || secret_id === null) {
    //         return res.json({response:false, msg: "no_user"});
    //     } else {
    //         methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
    //             function (nothing) {
    //                 return res.json({response:false, msg: "no_user"});
    //             }, function (user) {
    //                 if (user.verified === false) {
    //                     return res.json({response:false});
    //                 }
    //                 if (user.blog_id === "") {
    //                     return res.json({response:false, msg: "no_blog_id"});
    //                 }
    //                 methods.get_single_user(connected_db, data, f_cb, s_cb);
    //             });
    //     }
    // }
});
app.post("/get/announcements-of-apply-now", body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    var f_cb = function (docs) {return res.json({response:false});};
    var s_cb = function (docs) {return res.json({response:true, docs:docs});};
    if (
        req.body.article_id === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data["article_id"] = decodeURIComponent(req.body.article_id);
    if (req.body.created_at !== undefined) {
        try {
            data["created_at"] = parseInt(decodeURIComponent(req.body.created_at));
        } catch (e) {
            return f_cb(null);
        }
    }
    if (user_id === null || secret_id === null) {
        return methods.can_i_read_apply_now(connected_db, null, {_id: data.article_id, child: "announcement"}, f_cb, function (doc) {
            return methods.get_announcement_of_apply_now(connected_db, lang, data, f_cb, s_cb);
        });
    } else {
        return methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
            , function (nothing) {
                return methods.can_i_read_apply_now(connected_db, null, {_id: data.article_id, child: "announcement"}, f_cb, function (doc) {
                    return methods.get_announcement_of_apply_now(connected_db, lang, data, f_cb, s_cb);
                });
            }, function (user) {
                if (user.verified === false) {
                    return res.json({response:false});
                }
                if (user.blog_id === "") {
                    return res.json({response:false, msg: "no_blog_id"});
                }
                return methods.can_i_read_apply_now(connected_db, user, {_id: data.article_id, child: "announcement"}, f_cb, function (doc) {
                    return methods.get_announcement_of_apply_now(connected_db, lang, data, f_cb, s_cb);
                });
            });
    }
});
app.post("/get/answers-of-online-interview", body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return res.json({response:false, msg: "no_user"});
    }
    var f_cb = function (docs) {return res.json({response:false});};
    var s_cb = function (questions, docs) {return res.json({response:true, questions:questions, docs:docs});};
    if (
        req.body.article_id === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data["article_id"] = decodeURIComponent(req.body.article_id);
    if (req.body.created_at !== undefined) {
        try {
            data["created_at"] = parseInt(decodeURIComponent(req.body.created_at));
        } catch (e) {
            return f_cb(null);
        }
    }
    if (user_id === null || secret_id === null) {
        return res.json({response:false, msg: "no_user"});
    } else {
        return methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
            , function (nothing) {
                return res.json({response:false, msg: "no_user"});
            }, function (user) {
                if (user.verified === false) {
                    return res.json({response:false});
                }
                if (user.blog_id === "") {
                    return res.json({response:false, msg: "no_blog_id"});
                }
                return methods.can_i_read_apply_now(connected_db, user, {_id: data.article_id, child: "answer"}, f_cb, function (doc) {
                    data.questions = doc.questions;
                    return methods.get_answers_of_online_interview(connected_db, lang, data, f_cb, s_cb);
                });
            });
    }
});

/* 목록 가져오기 */
/**
 * list_type
 *      user
 *      agenda_opinion
 *      blog_gallery
 *      image
 *      agenda
 *      opinion
 *      gallery
 *      guestbook
 *      blog
 *
 * type
 *      all
 *      main_tag
 *      tags
 *      text_search
 *      ranking
 *      popular_opinions_of_agenda
 *      serial_opinions_of_agenda
 *      blog_articles
 *
 */
app.post('/get/list', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    var f_cb = function (docs) {return res.json({response:false});};
    var s_cb = function (docs) {return res.json({response:true, docs:docs});};
    if (
        req.body.list_type === undefined ||
        req.body.type === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data["list_type"] = decodeURIComponent(req.body.list_type);
    data["type"] = decodeURIComponent(req.body.type);
    /*if (
        data["list_type"] !== "apply_now" &&
        data["list_type"] !== "hire_me" &&
        data["list_type"] !== "announcement" &&
        data["list_type"] !== "answer" &&
        data["list_type"] !== "user" &&
        data["list_type"] !== "agenda_opinion" &&
        data["list_type"] !== "blog_gallery" &&
        data["list_type"] !== "image" &&
        data["list_type"] !== "debate" &&
        data["list_type"] !== "agenda" &&
        data["list_type"] !== "opinion" &&
        data["list_type"] !== "translation" &&
        data["list_type"] !== "gallery" &&
        data["list_type"] !== "guestbook" &&
        data["list_type"] !== "blog"
    ) {
        return f_cb(null);
    }*/
    if (
        data["list_type"] !== "apply_now" &&
        data["list_type"] !== "hire_me" &&
        data["list_type"] !== "announcement" &&
        data["list_type"] !== "answer" &&
        data["list_type"] !== "user" &&
        data["list_type"] !== "agenda_opinion" &&
        data["list_type"] !== "blog_gallery" &&
        data["list_type"] !== "image" &&
        data["list_type"] !== "debate" &&
        data["list_type"] !== "agenda" &&
        data["list_type"] !== "opinion" &&
        data["list_type"] !== "gallery" &&
        data["list_type"] !== "guestbook" &&
        data["list_type"] !== "blog"
    ) {
        return f_cb(null);
    }
    /*if (
        data["type"] !== "all" &&
        data["type"] !== "announcement" &&
        data["type"] !== "answer" &&
        data["type"] !== "main_tag" &&
        data["type"] !== "realtime" &&
        data["type"] !== "text_search" &&
        data["type"] !== "ranking" &&
        data["type"] !== "popular_opinions_of_agenda" &&
        data["type"] !== "serial_opinions_of_agenda" &&
        data["type"] !== "translated_agendas" &&
        data["type"] !== "translated_opinions" &&
        data["type"] !== "blog_articles"
    ) {
        return f_cb(null);
    }*/
    if (
        data["type"] !== "all" &&
        data["type"] !== "announcement" &&
        data["type"] !== "answer" &&
        data["type"] !== "main_tag" &&
        data["type"] !== "realtime" &&
        data["type"] !== "text_search" &&
        data["type"] !== "ranking" &&
        data["type"] !== "popular_opinions_of_agenda" &&
        data["type"] !== "serial_opinions_of_agenda" &&
        data["type"] !== "blog_articles"
    ) {
        return f_cb(null);
    }
    if (data["list_type"] === "agenda") {
        if (req.body.agenda_menu === undefined) {
            return f_cb(null);
        } else {
            data["agenda_menu"] = decodeURIComponent(req.body.agenda_menu);
            if (data["agenda_menu"] !== "all") {
                return f_cb(null);
            }
            /*
            if (
                data["agenda_menu"] !== "all" &&
                data["agenda_menu"] !== "in_progress" &&
                data["agenda_menu"] !== "scheduled" &&
                data["agenda_menu"] !== "finished" &&
                data["agenda_menu"] !== "unlimited"
            ) {
                return f_cb(null);
            }
            */
        }
    }
    if (req.body.updated_at !== undefined) {
        try {
            data["updated_at"] = parseInt(decodeURIComponent(req.body.updated_at));
        } catch (e) {
            return f_cb(null);
        }
    }
    if (req.body.created_at !== undefined) {
        try {
            data["created_at"] = parseInt(decodeURIComponent(req.body.created_at));
        } catch (e) {
            return f_cb(null);
        }
    }
    if (data["type"] === "main_tag") {
        if (req.body.main_tag === undefined) {
            return f_cb(null);
        } else {
            data["main_tag"] = decodeURIComponent(req.body.main_tag);
        }
    } else if (data["type"] === "tags") {
        if (req.body.tags === undefined) {
            return f_cb(null);
        } else {
            try {
                data["tags"] = JSON.parse(decodeURIComponent(req.body.tags));
                if (Object.prototype.toString.call(data["tags"]) !== "[object Array]") {
                    return f_cb(null);
                }
            } catch (e) {
                return f_cb(null);
            }
        }
    } else if (data["type"] === "text_search") {
        if (
            req.body.skip === undefined ||
            req.body.query === undefined
        ) {
            return f_cb(null);
        } else {
            data["query"] = decodeURIComponent(req.body.query);
            if (Object.prototype.toString.call(data["query"]) !== "[object String]") {
                return f_cb(null);
            }
            try {
                data["from"] = parseInt(decodeURIComponent(req.body.skip));
            } catch (e) {
                return f_cb(null);
            }
        }
    } else if (data["type"] === "ranking") {
        if (
            req.body.ranking === undefined
        ) {
            return f_cb(null);
        } else {
            try {
                data["ranking"] = parseInt(decodeURIComponent(req.body.ranking));
            } catch (e) {
                return f_cb(null);
            }
        }
    } else if (data["type"] === "announcement") {
        if (
            req.body.article_id === undefined ||
            req.body.created_at === undefined
        ) {
            return f_cb(null);
        } else {
            try {
                data["article_id"] = decodeURIComponent(req.body.article_id);
                data["created_at"] = parseInt(decodeURIComponent(req.body.created_at));
            } catch (e) {
                return f_cb(null);
            }
        }
    } else if (data["type"] === "answer") {
        if (
            req.body.article_id === undefined ||
            req.body.created_at === undefined
        ) {
            return f_cb(null);
        } else {
            try {
                data["article_id"] = decodeURIComponent(req.body.article_id);
                data["created_at"] = parseInt(decodeURIComponent(req.body.created_at));
            } catch (e) {
                return f_cb(null);
            }
        }
    } else if (data["type"] === "popular_opinions_of_agenda") {
        if (
            req.body.agenda_id === undefined ||
            req.body.skip === undefined
        ) {
            return f_cb(null);
        } else {
            try {
                data["agenda_id"] = decodeURIComponent(req.body.agenda_id);
                data["skip"] = parseInt(decodeURIComponent(req.body.skip));
            } catch (e) {
                return f_cb(null);
            }
        }
    } else if (data["type"] === "serial_opinions_of_agenda") {
        if (
            req.body.agenda_id === undefined ||
            req.body.created_at === undefined
        ) {
            return f_cb(null);
        } else {
            try {
                data["agenda_id"] = decodeURIComponent(req.body.agenda_id);
                data["created_at"] = parseInt(decodeURIComponent(req.body.created_at));
            } catch (e) {
                return f_cb(null);
            }
        }
    } else if (data["type"] === "translated_agendas") {
        if (
            req.body.language === undefined ||
            req.body.agenda_id === undefined ||
            req.body.skip === undefined
        ) {
            return f_cb(null);
        } else {
            try {
                data["language"] = decodeURIComponent(req.body.language);
                data["agenda_id"] = decodeURIComponent(req.body.agenda_id);
                data["skip"] = parseInt(decodeURIComponent(req.body.skip));
            } catch (e) {
                return f_cb(null);
            }
        }
    } else if (data["type"] === "translated_opinions") {
        if (
            req.body.language === undefined ||
            req.body.agenda_id === undefined ||
            req.body.opinion_id === undefined ||
            req.body.skip === undefined
        ) {
            return f_cb(null);
        } else {
            try {
                data["language"] = decodeURIComponent(req.body.language);
                data["agenda_id"] = decodeURIComponent(req.body.agenda_id);
                data["opinion_id"] = decodeURIComponent(req.body.opinion_id);
                data["skip"] = parseInt(decodeURIComponent(req.body.skip));
            } catch (e) {
                return f_cb(null);
            }
        }
    } else if (data["type"] === "blog_articles") {
        if (req.body.blog_id === undefined) {
            return f_cb(null);
        } else {
            try {
                data["blog_id"] = decodeURIComponent(req.body.blog_id);
                if (data["list_type"] === "blog") {
                    if (req.body.blog_menu_id === undefined) {
                        return f_cb(null);
                    }
                    data["blog_menu_id"] = decodeURIComponent(req.body.blog_menu_id);
                }
            } catch (e) {
                return f_cb(null);
            }
        }
    }

    if (data["type"] === "all") {
        if (
            data["list_type"] !== "apply_now" &&
            data["list_type"] !== "hire_me" &&
            data["list_type"] !== "debate" &&
            data["list_type"] !== "agenda" &&
            data["list_type"] !== "opinion" &&
            data["list_type"] !== "blog_gallery"
        ) {
            return f_cb(null);
        }
        if (user_id === null || secret_id === null) {
            if (data["list_type"] === "hire_me") {
                return f_cb(null);
            }
            if (
                data["list_type"] === "apply_now" ||
                data["list_type"] === "hire_me"
            ) {
                data["type"] = data["list_type"];
                data["list_type"] = "employment";
                return methods.get_all_employment_articles(connected_db, lang, data, f_cb, s_cb);
            } else {
                return methods.get_all_articles(connected_db, lang, data, f_cb, s_cb);
            }
        } else {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                function (nothing) {
                    if (data["list_type"] === "hire_me") {
                        return f_cb(null);
                    }
                    if (
                        data["list_type"] === "apply_now" ||
                        data["list_type"] === "hire_me"
                    ) {
                        data["type"] = data["list_type"];
                        data["list_type"] = "employment";
                        return methods.get_all_employment_articles(connected_db, lang, data, f_cb, s_cb);
                    } else {
                        return methods.get_all_articles(connected_db, lang, data, f_cb, s_cb);
                    }
                }, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false, msg: "no_blog_id"});
                    }
                    if (
                        data["list_type"] === "apply_now" ||
                        data["list_type"] === "hire_me"
                    ) {
                        data["type"] = data["list_type"];
                        data["list_type"] = "employment";
                        return methods.get_all_employment_articles(connected_db, lang, data, f_cb, s_cb);
                    } else {
                        return methods.get_all_articles(connected_db, lang, data, f_cb, s_cb);
                    }
                });
        }
    } else if (data["type"] === "realtime") {
        if (
            data["list_type"] !== "apply_now" &&
            data["list_type"] !== "hire_me"
        ) {
            return f_cb(null);
        }
        if (user_id === null || secret_id === null) {
            if (data["list_type"] === "hire_me") {
                return res.json({response:false, msg: "no_user"});
            } else {
                return methods.get_realtime_employment(connected_db, lang, data["list_type"], data, f_cb, s_cb);
            }
        } else {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                function (nothing) {
                    if (data["list_type"] === "hire_me") {
                        return res.json({response:false, msg: "no_user"});
                    } else {
                        return methods.get_realtime_employment(connected_db, lang, data["list_type"], data, f_cb, s_cb);
                    }
                }, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false, msg: "no_blog_id"});
                    }
                    return methods.get_realtime_employment(connected_db, lang, data["list_type"], data, f_cb, s_cb);
                });
        }
    } else if (data["type"] === "main_tag") {
        if (data["list_type"] === "debate") {
            if (user_id === null || secret_id === null) {
                return methods.get_all_articles(connected_db, lang, data, f_cb, s_cb);
            } else {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        return methods.get_all_articles(connected_db, lang, data, f_cb, s_cb);
                    }, function (user) {
                        if (user.verified === false) {
                            return res.json({response:false});
                        }
                        if (user.blog_id === "") {
                            return res.json({response:false, msg: "no_blog_id"});
                        }
                        return methods.get_all_articles(connected_db, lang, data, f_cb, s_cb);
                    });
            }
        } else if (data["list_type"] === "agenda") {
            if (req.body.is_limited !== undefined) { /* /write/agenda */
                if (user_id === null || secret_id === null) {
                    return methods.get_debates_by_main_tag(connected_db, lang, 'agenda', data, f_cb, s_cb);
                } else {
                    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                        function (nothing) {
                            return methods.get_debates_by_main_tag(connected_db, lang, 'agenda', data, f_cb, s_cb);
                        }, function (user) {
                            if (user.verified === false) {
                                return res.json({response:false});
                            }
                            if (user.blog_id === "") {
                                return res.json({response:false, msg: "no_blog_id"});
                            }
                            return methods.get_debates_by_main_tag(connected_db, lang, 'agenda', data, f_cb, s_cb);
                        });
                }
            } else { /* /agenda */
                if (user_id === null || secret_id === null) {
                    return methods.get_all_articles(connected_db, lang, data, f_cb, s_cb);
                } else {
                    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                        function (nothing) {
                            return methods.get_all_articles(connected_db, lang, data, f_cb, s_cb);
                        }, function (user) {
                            if (user.verified === false) {
                                return res.json({response:false});
                            }
                            if (user.blog_id === "") {
                                return res.json({response:false, msg: "no_blog_id"});
                            }
                            return methods.get_all_articles(connected_db, lang, data, f_cb, s_cb);
                        });
                }
            }
        } else {
            if (req.body.is_limited !== undefined) { /* /agenda/:agenda_id/opinion/:opinion_id */
                if (user_id === null || secret_id === null) {
                    return methods.get_debates_by_main_tag(connected_db, lang, 'opinion', data, f_cb, s_cb);
                } else {
                    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                        function (nothing) {
                            return methods.get_debates_by_main_tag(connected_db, lang, 'opinion', data, f_cb, s_cb);
                        }, function (user) {
                            if (user.verified === false) {
                                return res.json({response:false});
                            }
                            if (user.blog_id === "") {
                                return res.json({response:false, msg: "no_blog_id"});
                            }
                            return methods.get_debates_by_main_tag(connected_db, lang, 'opinion', data, f_cb, s_cb);
                        });
                }
            } else { /* /opinion */
                if (user_id === null || secret_id === null) {
                    return methods.get_all_articles(connected_db, lang, data, f_cb, s_cb);
                } else {
                    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                        function (nothing) {
                            return methods.get_all_articles(connected_db, lang, data, f_cb, s_cb);
                        }, function (user) {
                            if (user.verified === false) {
                                return res.json({response:false});
                            }
                            if (user.blog_id === "") {
                                return res.json({response:false, msg: "no_blog_id"});
                            }
                            return methods.get_all_articles(connected_db, lang, data, f_cb, s_cb);
                        });
                }
            }
        }
    } else if (data["type"] === "tags") { /* elasticsearch 로 처리 */
        return s_cb([]);
    } else if (data["type"] === "text_search") { /* elasticsearch 로 처리 */
        if (data["list_type"] === "image") {
            if (user_id === null || secret_id === null) {
                data.is_loginned = false;
                return es_methods.es_search_image(es_client, data, s_cb);
            } else {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        data.is_loginned = false;
                        return es_methods.es_search_image(es_client, data, s_cb);
                    }, function (user) {
                        if (user.verified === false) {
                            return res.json({response:false});
                        }
                        if (user.blog_id === "") {
                            return res.json({response:false, msg: "no_blog_id"});
                        }
                        data.is_loginned = true;
                        return es_methods.es_search_image(es_client, data, s_cb);
                    });
            }
        } else {
            return s_cb([]);
        }
    } else if (data["type"] === "ranking") { /* /ranking 더보기 */
        return s_cb([]);
    } else if (data["type"] === "popular_opinions_of_agenda") {
        if (user_id === null || secret_id === null) {
            return methods.can_i_read_agenda(connected_db, null, {_id: data.agenda_id}, f_cb, function (doc) {
                return methods.get_popular_opinions_of_agenda(connected_db, data, f_cb, s_cb);
            });
        } else {
            return methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                , function (nothing) {
                    return methods.can_i_read_agenda(connected_db, null, {_id: data.agenda_id}, f_cb, function (doc) {
                        return methods.get_popular_opinions_of_agenda(connected_db, data, f_cb, s_cb);
                    });
                }, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false, msg: "no_blog_id"});
                    }
                    return methods.can_i_read_agenda(connected_db, user, {_id: data.agenda_id}, f_cb, function (doc) {
                        return methods.get_popular_opinions_of_agenda(connected_db, data, f_cb, s_cb);
                    });
                });
        }
    } else if (data["type"] === "serial_opinions_of_agenda") {
        if (user_id === null || secret_id === null) {
            return methods.can_i_read_agenda(connected_db, null, {_id: data.agenda_id}, f_cb, function (doc) {
                return methods.get_serial_opinions_of_agenda(connected_db, lang, data, f_cb, s_cb);
            });
        } else {
            return methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                , function (nothing) {
                    return methods.can_i_read_agenda(connected_db, null, {_id: data.agenda_id}, f_cb, function (doc) {
                        return methods.get_serial_opinions_of_agenda(connected_db, lang, data, f_cb, s_cb);
                    });
                }, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false, msg: "no_blog_id"});
                    }
                    return methods.can_i_read_agenda(connected_db, user, {_id: data.agenda_id}, f_cb, function (doc) {
                        return methods.get_serial_opinions_of_agenda(connected_db, lang, data, f_cb, s_cb);
                    });
                });
        }
    } else if (data["type"] === "translated_agendas") {
        return res.json({response:false});
        data["type"] = "tr_agenda";
        if (user_id === null || secret_id === null) {
            return methods.can_i_read_agenda(connected_db, null, {_id: data.agenda_id}, f_cb, function (doc) {
                return methods.get_translations_of_article(connected_db, data, f_cb, s_cb);
            });
        } else {
            return methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                , function (nothing) {
                    return methods.can_i_read_agenda(connected_db, null, {_id: data.agenda_id}, f_cb, function (doc) {
                        return methods.get_translations_of_article(connected_db, data, f_cb, s_cb);
                    });
                }, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false, msg: "no_blog_id"});
                    }
                    return methods.can_i_read_agenda(connected_db, user, {_id: data.agenda_id}, f_cb, function (doc) {
                        return methods.get_translations_of_article(connected_db, data, f_cb, s_cb);
                    });
                });
        }
    } else if (data["type"] === "translated_opinions") {
        return res.json({response:false});
        data["type"] = "tr_opinion";
        if (user_id === null || secret_id === null) {
            return methods.can_i_read_agenda(connected_db, null, {_id: data.agenda_id}, f_cb, function (doc) {
                return methods.get_translations_of_article(connected_db, data, f_cb, s_cb);
            });
        } else {
            return methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                , function (nothing) {
                    return methods.can_i_read_agenda(connected_db, null, {_id: data.agenda_id}, f_cb, function (doc) {
                        return methods.get_translations_of_article(connected_db, data, f_cb, s_cb);
                    });
                }, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false, msg: "no_blog_id"});
                    }
                    return methods.can_i_read_agenda(connected_db, user, {_id: data.agenda_id}, f_cb, function (doc) {
                        return methods.get_translations_of_article(connected_db, data, f_cb, s_cb);
                    });
                });
        }
    } else if (data["type"] === "blog_articles") {
        if (
            data["list_type"] === "agenda" ||
            data["list_type"] === "opinion"
        ) {
            /* data["list_type"] === "translation" 넣어야 함 */
            if (
                req.body.is_participation === undefined ||
                req.body.is_subscription === undefined ||
                req.body.agenda_menu === undefined
            ) {
                return f_cb(null);
            } else {
                data["is_participation"] = decodeURIComponent(req.body.is_participation) === "true";
                data["is_subscription"] = decodeURIComponent(req.body.is_subscription) === "true";
                data["agenda_menu"] = decodeURIComponent(req.body.agenda_menu);
                if (data["list_type"] === "agenda") {
                    if (
                        /*data["agenda_menu"] !== "in_progress" &&
                        data["agenda_menu"] !== "scheduled" &&
                        data["agenda_menu"] !== "finished" &&
                        data["agenda_menu"] !== "unlimited"*/
                        data["agenda_menu"] !== "all"
                    ) {
                        return f_cb(null);
                    } else {
                        if (user_id === null || secret_id === null) {
                            if (
                                data["is_participation"] === true ||
                                data["is_subscription"] === true
                            ) {
                                return f_cb(null);
                            }
                            return methods.get_blog_debate_list(connected_db, null, null, null, data, f_cb, s_cb);
                        } else {
                            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                                function (nothing) {
                                    if (
                                        data["is_participation"] === true ||
                                        data["is_subscription"] === true
                                    ) {
                                        return f_cb(null);
                                    }
                                    return methods.get_blog_debate_list(connected_db, null, null, null, data, f_cb, s_cb);
                                }, function (user) {
                                    if (user.verified === false) {
                                        return res.json({response:false});
                                    }
                                    if (user.blog_id === "") {
                                        return res.json({response:false, msg: "no_blog_id"});
                                    }
                                    if (
                                        data["is_participation"] === true ||
                                        data["is_subscription"] === true
                                    ) {
                                        if (user.blog_id !== data["blog_id"]) {
                                            return f_cb(null);
                                        }
                                    }
                                    return methods.get_blog_debate_list(connected_db, user, null, null, data, f_cb, s_cb);
                                });
                        }
                    }
                } else {
                    data["agenda_menu"] = "";
                    if (user_id === null || secret_id === null) {
                        if (
                            data["is_participation"] === true ||
                            data["is_subscription"] === true
                        ) {
                            return f_cb(null);
                        }
                        return methods.get_blog_debate_list(connected_db, null, null, null, data, f_cb, s_cb);
                    } else {
                        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                            function (nothing) {
                                if (
                                    data["is_participation"] === true ||
                                    data["is_subscription"] === true
                                ) {
                                    return f_cb(null);
                                }
                                return methods.get_blog_debate_list(connected_db, null, null, null, data, f_cb, s_cb);
                            }, function (user) {
                                if (user.verified === false) {
                                    return res.json({response:false});
                                }
                                if (user.blog_id === "") {
                                    return res.json({response:false, msg: "no_blog_id"});
                                }
                                if (
                                    data["is_participation"] === true ||
                                    data["is_subscription"] === true
                                ) {
                                    if (user.blog_id !== data["blog_id"]) {
                                        return f_cb(null);
                                    }
                                }
                                return methods.get_blog_debate_list(connected_db, user, null, null, data, f_cb, s_cb);
                            });
                    }
                }
            }
        } /*else if (
            data["list_type"] === "hire_me" ||
            data["list_type"] === "apply_now"
        ) {
            if (
                req.body.is_participation === undefined ||
                req.body.is_subscription === undefined
            ) {
                return f_cb(null);
            } else {
                data["is_participation"] = decodeURIComponent(req.body.is_participation) === "true";
                data["is_subscription"] = decodeURIComponent(req.body.is_subscription) === "true";
                if (user_id === null || secret_id === null) {
                    if (
                        data["is_participation"] === true ||
                        data["is_subscription"] === true
                    ) {
                        return f_cb(null);
                    }
                    return methods.get_blog_employment_list(connected_db, null, null, null, data, f_cb, s_cb);
                } else {
                    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                        function (nothing) {
                            if (
                                data["is_participation"] === true ||
                                data["is_subscription"] === true
                            ) {
                                return f_cb(null);
                            }
                            return methods.get_blog_employment_list(connected_db, null, null, null, data, f_cb, s_cb);
                        }, function (user) {
                            if (user.verified === false) {
                                return res.json({response:false});
                            }
                            if (user.blog_id === "") {
                                return res.json({response:false, msg: "no_blog_id"});
                            }
                            if (
                                data["is_participation"] === true ||
                                data["is_subscription"] === true
                            ) {
                                if (user.blog_id !== data["blog_id"]) {
                                    return f_cb(null);
                                }
                            }
                            return methods.get_blog_employment_list(connected_db, user, null, null, data, f_cb, s_cb);
                        });
                }
            }
        }*/ else if (
            data["list_type"] === "blog" ||
            data["list_type"] === "gallery"
        ) {
            if (user_id === null || secret_id === null) {
                data["is_subscription"] = false;
                methods.get_blog_bulletin_board_gallery_list(connected_db, null, null, null, data, f_cb, s_cb);
            } else {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        data["is_subscription"] = false;
                        methods.get_blog_bulletin_board_gallery_list(connected_db, null, null, null, data, f_cb, s_cb);
                    }, function (user) {
                        if (user.verified === false) {
                            return res.json({response:false});
                        }
                        if (user.blog_id === "") {
                            return res.json({response:false, msg: "no_blog_id"});
                        }
                        data["is_subscription"] = false;
                        methods.get_blog_bulletin_board_gallery_list(connected_db, user, null, null, data, f_cb, s_cb);
                    });
            }
        } else if (data["list_type"] === "blog_gallery") { /* /blog/:blog_id/blog-subscription */
            if (user_id === null || secret_id === null) {
                return res.json({response:false, msg: "no_user"});
            } else {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        return res.json({response:false, msg: "no_user"});
                    }, function (user) {
                        if (user.verified === false) {
                            return res.json({response:false});
                        }
                        if (user.blog_id === "") {
                            return res.json({response:false, msg: "no_blog_id"});
                        }
                        data["is_subscription"] = true;
                        if (user.blog_id !== data["blog_id"]) {
                            return f_cb(null);
                        }
                        methods.get_blog_bulletin_board_gallery_list(connected_db, user, null, null, data, f_cb, s_cb);
                    });
            }
        } else if (data["list_type"] === "guestbook") {
            if (user_id === null || secret_id === null) {
                return methods.get_guestbook(connected_db, lang, null, data, f_cb, s_cb);
            } else {
                methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function (nothing) {
                        return methods.get_guestbook(connected_db, lang, null, data, f_cb, s_cb);
                    }, function (user) {
                        if (user.verified === false) {
                            return res.json({response:false});
                        }
                        if (user.blog_id === "") {
                            return res.json({response:false, msg: "no_blog_id"});
                        }
                        return methods.get_guestbook(connected_db, lang, user, data, f_cb, s_cb);
                    });
            }
        } else {
            return f_cb(null);
        }
    } else {
        return f_cb(null);
    }
});

/* 논제 관련 의견 [토론순] 목록으로 가져오기 */
app.post('/get/serial-opinions-of-agenda', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    var f_cb = function (docs) {return res.json({response:false});};
    var s_cb = function (docs) {return res.json({response:true, docs: docs});};
    var data = {};
    if (
        req.body.agenda_id === undefined ||
        req.body.type === undefined
    ) {
        return f_cb(null);
    }
    data["agenda_id"] = decodeURIComponent(req.body.agenda_id);
    data["type"] = decodeURIComponent(req.body.type);
    if (data["type"] !== "opinions_of_agenda") {
        return f_cb(null);
    } else {
        if (user_id === null || secret_id === null) {
            methods.can_i_read_agenda(connected_db, null, {_id: data.agenda_id}, f_cb, function (doc) {
                methods.get_serial_opinions_of_agenda(connected_db, lang, data, f_cb, s_cb);
            });
        } else {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                function (nothing) {
                    methods.can_i_read_agenda(connected_db, null, {_id: data.agenda_id}, f_cb, function (doc) {
                        methods.get_serial_opinions_of_agenda(connected_db, lang, data, f_cb, s_cb);
                    });
                }, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false, msg: "no_blog_id"});
                    }
                    methods.can_i_read_agenda(connected_db, user, {_id: data.agenda_id}, f_cb, function (doc) {
                        methods.get_serial_opinions_of_agenda(connected_db, lang, data, f_cb, s_cb);
                    });
                });
        }
    }
});
app.post('/get/popular-opinions-of-agenda', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (docs) {return res.json({response:false});};
    var s_cb = function (docs) {return res.json({response:true, docs: docs});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    var data = {};
    if (
        req.body.agenda_id === undefined ||
        req.body.type === undefined
    ) {
        return f_cb(null);
    }
    data["agenda_id"] = decodeURIComponent(req.body.agenda_id);
    data["type"] = decodeURIComponent(req.body.type);
    if (data["type"] !== "opinions_of_agenda") {
        return f_cb(null);
    } else {
        if (user_id === null || secret_id === null) {
            methods.can_i_read_agenda(connected_db, null, {_id: data.agenda_id}, f_cb, function (doc) {
                methods.get_popular_opinions_of_agenda(connected_db, data, f_cb, s_cb);
            });
        } else {
            methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                function (nothing) {
                    methods.can_i_read_agenda(connected_db, null, {_id: data.agenda_id}, f_cb, function (doc) {
                        methods.get_popular_opinions_of_agenda(connected_db, data, f_cb, s_cb);
                    });
                }, function (user) {
                    if (user.verified === false) {
                        return res.json({response:false});
                    }
                    if (user.blog_id === "") {
                        return res.json({response:false, msg: "no_blog_id"});
                    }
                    methods.can_i_read_agenda(connected_db, user, {_id: data.agenda_id}, f_cb, function (doc) {
                        methods.get_popular_opinions_of_agenda(connected_db, data, f_cb, s_cb);
                    });
                });
        }
    }
});
app.post('/get/simple-profile', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return res.json({response:false, msg: "no_user"});
    }
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true, doc:doc});};
    if (req.body.blog_id === undefined) {
        return f_cb(null);
    }
    var blog_id = decodeURIComponent(req.body.blog_id);
    if (user_id === null || secret_id === null) { // 비로그인 사용자가 시도한 경우, /error/404로 리다이렉트
        return res.json({response:false, msg: "no_user"});
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
            function (nothing) {
                return res.json({response:false, msg: "no_user"});
            }, function (user) {
                if (user.verified === false) {
                    return res.json({response:false});
                }
                if (user.blog_id === "") {
                    return res.json({response:false, msg: "no_blog_id"});
                }
                methods.get_simple_profile(connected_db, user.blog_id, blog_id, f_cb, s_cb);
            });
    }
});
app.post('/get/profile', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function () {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true, doc:doc});};
    if (req.body.type === undefined || req.body.id === undefined) {
        return f_cb();
    }
    var type = decodeURIComponent(req.body.type);
    var id = decodeURIComponent(req.body.id);
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb();
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
        function (nothing) {
            return res.json({response:false, msg: "no_user"});
        }, function (user) {
            if (user.verified === false) {
                return res.json({response:false});
            }
            if (user.blog_id === "") {
                return res.json({response:false, msg: "no_blog_id"});
            }
            methods.get_profile(connected_db, user_id, secret_id, type, id, f_cb, s_cb);
        });
});

/* 블로그 오늘의 방문자 가져오기 */
// app.post('/get/today-visitors', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
//     var f_cb = function () {return res.json({response:false});};
//     var s_cb = function (docs) {return res.json({response:true, docs:docs});};
//     if (req.body.blog_id === undefined) {
//         return f_cb();
//     }
//     var cookies = req.headers.cookie;
//     var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
//     var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
//     var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
//     if (!lang) {
//         lang = "en";
//         res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
//     }
//     lang = methods.get_valid_language(lang);
//     if (user_id === null || secret_id === null) {
//         return res.json({response:false, msg: "no_user"});
//     }
//
//     var blog_id = decodeURIComponent(req.body.blog_id), created_at = undefined;
//     if (req.body.created_at !== undefined) {
//         try {
//             created_at = parseInt(decodeURIComponent(req.body.created_at));
//         } catch (e) {
//             return f_cb();
//         }
//     }
//     methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
//         function (nothing) {
//             return res.json({response:false, msg: "no_user"});
//         }, function (user) {
//             if (user.blog_id === "") {
//                 return res.json({response:false, msg: "no_blog_id"});
//             }
//             methods.get_today_visitors(connected_db, blog_id, created_at, f_cb, s_cb);
//         });
// });
app.post('/update/profile', body_parser.urlencoded({ extended: true }), body_parser.json(), function(req, res) {
    var f_cb = function () {return res.json({response:false});};
    var s_cb = function () {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb();
    }
    if (
        req.body.type === undefined
    ) {
        return f_cb();
    }
    var type = decodeURIComponent(req.body.type)
        , value
        , obj = {}
        , start_year
        , start_month
        , start_day
        , end_year
        , end_month
        , end_day
        , received_year
        , received_month
        , received_day;
    if (
        type === "add_employment" ||
        type === "add_education" ||
        type === "add_location" ||
        type === "update_employment" ||
        type === "update_education" ||
        type === "update_location"
    ) {
        if (
            req.body.start_year === undefined ||
            req.body.start_month === undefined ||
            req.body.start_day === undefined ||
            req.body.end_year === undefined ||
            req.body.end_month === undefined ||
            req.body.end_day === undefined
        ) {
            return f_cb();
        }
        start_year = decodeURIComponent(req.body.start_year);
        if (start_year === "") {
            start_year = 0;
        } else {
            try {
                start_year = parseInt(start_year);
            } catch(e) {
                return f_cb();
            }
        }
        start_month = decodeURIComponent(req.body.start_month);
        if (start_month === "") {
            start_month = 0;
        } else {
            try {
                start_month = parseInt(start_month);
            } catch(e) {
                return f_cb();
            }
        }
        start_day = decodeURIComponent(req.body.start_day);
        if (start_day === "") {
            start_day = 0;
        } else {
            try {
                start_day = parseInt(start_day);
            } catch(e) {
                return f_cb();
            }
        }
        end_year = decodeURIComponent(req.body.end_year);
        if (end_year === "") {
            end_year = 0;
        } else {
            try {
                end_year = parseInt(end_year);
            } catch(e) {
                return f_cb();
            }
        }
        end_month = decodeURIComponent(req.body.end_month);
        if (end_month === "") {
            end_month = 0;
        } else {
            try {
                end_month = parseInt(end_month);
            } catch(e) {
                return f_cb();
            }
        }
        end_day = decodeURIComponent(req.body.end_day);
        if (end_day === "") {
            end_day = 0;
        } else {
            try {
                end_day = parseInt(end_day);
            } catch(e) {
                return f_cb();
            }
        }
    }
    if (
        type === "add_prize" ||
        type === "update_prize"
    ) {
        if (
            req.body.received_year === undefined ||
            req.body.received_month === undefined ||
            req.body.received_day === undefined
        ) {
            return f_cb();
        }
        received_year = decodeURIComponent(req.body.received_year);
        if (received_year === "") {
            received_year = 0;
        } else {
            try {
                received_year = parseInt(received_year);
            } catch(e) {
                return f_cb();
            }
        }
        received_month = decodeURIComponent(req.body.received_month);
        if (received_month === "") {
            received_month = 0;
        } else {
            try {
                received_month = parseInt(received_month);
            } catch(e) {
                return f_cb();
            }
        }
        received_day = decodeURIComponent(req.body.received_day);
        if (received_day === "") {
            received_day = 0;
        } else {
            try {
                received_day = parseInt(received_day);
            } catch(e) {
                return f_cb();
            }
        }
    }
    if (
        type === "blog_name" ||
        type === "self_introduction") {
        if (
            req.body.value === undefined
        ) {
            return f_cb();
        } else {
            value = decodeURIComponent(req.body.value);
        }
    } else if (type === "iq_eq") {
        if (
            req.body.iq === undefined ||
            req.body.eq === undefined
        ) {
            return f_cb();
        }
        value = {};
        var iq = decodeURIComponent(req.body.iq);
        var eq = decodeURIComponent(req.body.eq);
        if (iq === "") {
            iq = 0;
        } else {
            try {
                iq = parseInt(iq);
            } catch (e) {
                return f_cb();
            }
        }
        if (eq === "") {
            eq = 0;
        } else {
            try {
                eq = parseInt(eq);
            } catch (e) {
                return f_cb();
            }
        }
        value["iq"] = iq;
        value["eq"] = eq;
    } else if (type === "simple_career") {
        if (
            req.body.value === undefined ||
            req.body.show_simple_career === undefined
        ) {
            return f_cb();
        }
        value = decodeURIComponent(req.body.value);
        obj["simple_career"] = value;
        obj["show_simple_career"] = decodeURIComponent(req.body.show_simple_career) === "true";
        value = obj;
    } else if (type === "add_employment") { /* 경력 추가 */
        if (
            req.body.position === undefined ||
            req.body.company === undefined ||
            req.body.ing === undefined ||
            req.body.show === undefined
        ) {
            return f_cb();
        }
        value = {};
        value["position"] = decodeURIComponent(req.body.position);
        value["company"] = decodeURIComponent(req.body.company);
        value["start_year"] = start_year;
        value["start_month"] = start_month;
        value["start_day"] = start_day;
        value["end_year"] = end_year;
        value["end_month"] = end_month;
        value["end_day"] = end_day;
        value["ing"] = decodeURIComponent(req.body.ing) === "true" ? 1 : 0;
        value["show"] = decodeURIComponent(req.body.show) === "true";
    } else if (type === "add_education") { /* 학력 추가 */
        if (
            req.body.school === undefined ||
            req.body.major === undefined ||
            req.body.minor === undefined ||
            req.body.degree === undefined ||
            req.body.ing === undefined ||
            req.body.show === undefined
        ) {
            return f_cb();
        }
        value = {};
        value["school"] = decodeURIComponent(req.body.school);
        value["major"] = decodeURIComponent(req.body.major);
        value["minor"] = decodeURIComponent(req.body.minor);
        value["degree"] = decodeURIComponent(req.body.degree);
        value["start_year"] = start_year;
        value["start_month"] = start_month;
        value["start_day"] = start_day;
        value["end_year"] = end_year;
        value["end_month"] = end_month;
        value["end_day"] = end_day;
        value["ing"] = decodeURIComponent(req.body.ing) === "true" ? 1 : 0;
        value["show"] = decodeURIComponent(req.body.show) === "true";
    } else if (type === "add_prize") {
        if (
            req.body.item === undefined ||
            req.body.show === undefined
        ) {
            return f_cb();
        }
        value = {};
        value["item"] = decodeURIComponent(req.body.item);
        value["received_year"] = received_year;
        value["received_month"] = received_month;
        value["received_day"] = received_day;
        value["show"] = decodeURIComponent(req.body.show) === "true";
    } else if (type === "add_location") {
        if (
            req.body.country === undefined ||
            req.body.city === undefined ||
            req.body.ing === undefined ||
            req.body.show === undefined
        ) {
            return f_cb();
        }
        value = {};
        value["country"] = decodeURIComponent(req.body.country);
        value["city"] = decodeURIComponent(req.body.city);
        value["start_year"] = start_year;
        value["start_month"] = start_month;
        value["start_day"] = start_day;
        value["end_year"] = end_year;
        value["end_month"] = end_month;
        value["end_day"] = end_day;
        value["ing"] = decodeURIComponent(req.body.ing) === "true" ? 1 : 0;
        value["show"] = decodeURIComponent(req.body.show) === "true";
    } else if (type === "add_website") {
        if (
            req.body.title === undefined ||
            req.body.protocol === undefined ||
            req.body.url === undefined
        ) {
            return f_cb();
        }
        value = {};
        value.title = decodeURIComponent(req.body.title);
        value.protocol = decodeURIComponent(req.body.protocol);
        value.url = decodeURIComponent(req.body.url);
        if (value.protocol !== "http" && value.protocol !== "https") {
            return f_cb();
        }
        if (value.title === "" || value.url === "") {
            return f_cb();
        }
    } else if (type === "update_employment") {
        if (
            req.body.id === undefined ||
            req.body.position === undefined ||
            req.body.company === undefined ||
            req.body.ing === undefined ||
            req.body.show === undefined
        ) {
            return f_cb();
        }
        value = {};
        value["employment.$._id"] = decodeURIComponent(req.body.id);
        value["employment.$.position"] = decodeURIComponent(req.body.position);
        value["employment.$.company"] = decodeURIComponent(req.body.company);
        value["employment.$.start_year"] = start_year;
        value["employment.$.start_month"] = start_month;
        value["employment.$.start_day"] = start_day;
        value["employment.$.end_year"] = end_year;
        value["employment.$.end_month"] = end_month;
        value["employment.$.end_day"] = end_day;
        value["employment.$.ing"] = decodeURIComponent(req.body.ing) === "true" ? 1 : 0;
        value["employment.$.show"] = decodeURIComponent(req.body.show) === "true";
    } else if (type === "update_education") {
        if (
            req.body.id === undefined ||
            req.body.school === undefined ||
            req.body.major === undefined ||
            req.body.minor === undefined ||
            req.body.degree === undefined ||
            req.body.ing === undefined ||
            req.body.show === undefined
        ) {
            return f_cb();
        }
        value = {};
        value["education.$._id"] = decodeURIComponent(req.body.id);
        value["education.$.school"] = decodeURIComponent(req.body.school);
        value["education.$.major"] = decodeURIComponent(req.body.major);
        value["education.$.minor"] = decodeURIComponent(req.body.minor);
        value["education.$.degree"] = decodeURIComponent(req.body.degree);
        value["education.$.start_year"] = start_year;
        value["education.$.start_month"] = start_month;
        value["education.$.start_day"] = start_day;
        value["education.$.end_year"] = end_year;
        value["education.$.end_month"] = end_month;
        value["education.$.end_day"] = end_day;
        value["education.$.ing"] = decodeURIComponent(req.body.ing) === "true" ? 1 : 0;
        value["education.$.show"] = decodeURIComponent(req.body.show) === "true";
    } else if (type === "update_prize") {
        if (
            req.body.id === undefined ||
            req.body.item === undefined ||
            req.body.show === undefined
        ) {
            return f_cb();
        }
        value = {};
        value["prize.$._id"] = decodeURIComponent(req.body.id);
        value["prize.$.item"] = decodeURIComponent(req.body.item);
        value["prize.$.received_year"] = received_year;
        value["prize.$.received_month"] = received_month;
        value["prize.$.received_day"] = received_day;
        value["prize.$.show"] = decodeURIComponent(req.body.show) === "true";
    } else if (type === "update_location") {
        if (
            req.body.id === undefined ||
            req.body.country === undefined ||
            req.body.city === undefined ||
            req.body.ing === undefined ||
            req.body.show === undefined
        ) {
            return f_cb();
        }
        value = {};
        value["location.$._id"] = decodeURIComponent(req.body.id);
        value["location.$.country"] = decodeURIComponent(req.body.country);
        value["location.$.city"] = decodeURIComponent(req.body.city);
        value["location.$.start_year"] = start_year;
        value["location.$.start_month"] = start_month;
        value["location.$.start_day"] = start_day;
        value["location.$.end_year"] = end_year;
        value["location.$.end_month"] = end_month;
        value["location.$.end_day"] = end_day;
        value["location.$.ing"] = decodeURIComponent(req.body.ing) === "true" ? 1 : 0;
        value["location.$.show"] = decodeURIComponent(req.body.show) === "true";
    } else if (type === "update_website") {
        if (
            req.body.id === undefined ||
            req.body.title === undefined ||
            req.body.protocol === undefined ||
            req.body.url === undefined
        ) {
            return f_cb();
        }
        value = {};
        value["website.$._id"] = decodeURIComponent(req.body.id);
        value["website.$.title"] = decodeURIComponent(req.body.title);
        value["website.$.protocol"] = decodeURIComponent(req.body.protocol);
        value["website.$.url"] = decodeURIComponent(req.body.url);
    } else if (
        type === "remove_employment" ||
        type === "remove_education" ||
        type === "remove_prize" ||
        type === "remove_location" ||
        type === "remove_website"
    ) {
        if (req.body.id === undefined) {
            return f_cb();
        }
        value = decodeURIComponent(req.body.id);
    } else {
        return f_cb();
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (doc) {
        return res.json({response:false, msg: "no_user"});
    }, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        methods.update_profile(connected_db, user, user_id, secret_id, type, value, f_cb, function (updated_user) {
            s_cb();
            if (type === 'blog_name') { /* blog와 gallery의 blog_name전부 변경하기 */
                es_methods.es_update_user_inline(es_client, {type: "blog_name", blog_id: updated_user.blog_id, blog_name: updated_user.blog_name });
            }
            return es_methods.es_update_user(connected_db, es_client, updated_user);
        });
    });
});
/* aws delete feature */
/*var aws_delete = function () {
 var AWS = require('aws-sdk');
 AWS.config.loadFromPath('./credentials-ehl.json');
 var s3 = new AWS.S3();
 var params = {  Bucket: 'your bucket', Key: 'your object' };
 s3.deleteObject(params, function(err, data) {
 if (err) console.log(err, err.stack);  // error
 else     console.log();                 // deleted
 });
 };*/
app.post('/get/gallery-images', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (docs) {return res.json({response:false});};
    var s_cb = function (docs) {return res.json({response:true, docs:docs});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) { // 비로그인 사용자가 시도한 경우, /error/404로 리다이렉트
        return f_cb(null);
    }
    var updated_at = undefined;
    if (req.body.updated_at !== undefined) {
        try {
            updated_at = parseInt(decodeURIComponent(req.body.updated_at));
        } catch (e) {
            return f_cb(null);
        }
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, function (doc) {
        return res.json({response:false, msg: "no_user"});
    }, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        methods.get_gallery_items(connected_db, user["blog_id"], updated_at, true, f_cb, s_cb);
    });
});
app.post('/insert/image', busboy({limit: {fileSize:1024 * 1024 * 5}}), function (req,res,next) {
    var f_cb1 = function (doc) {
        var result = {
            res:false,
            reason:'wrong_user'
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var f_cb2 = function (doc) {
        var result = {
            res:false,
            reason:'no_blog_id'
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var f_cb3 = function (doc) {
        var result = {
            res:false,
            reason:'server_error'
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var s_cb = function (pathname, img, thumbnail) {
        var result = {
            res:true,
            pathname: pathname,
            img:img,
            thumbnail:thumbnail
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    res.setHeader('content-type', 'text/html');
    if (
        user_id === null || secret_id === null
    ) {
        return f_cb1(null);
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, function (user) {
            if (user.verified === false) {
                return res.json({response:false});
            }
            if (user.blog_id === "") {
                return f_cb2(null);
            }
            methods.parse_image_upload(req, res, next, connected_db, user, false, false, f_cb3, s_cb);
        });
    }
});
app.post('/insert/image-from-gallery', busboy({limit: {fileSize:1024 * 1024 * 5}}), function (req,res,next) {
    var f_cb1 = function (doc) {
        var result = {
            res:false,
            reason:'wrong_user'
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var f_cb2 = function (doc) {
        var result = {
            res:false,
            reason:'no_blog_id'
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var f_cb3 = function (doc) {
        var result = {
            res:false,
            reason:'server_error'
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var s_cb = function (pathname, img, thumbnail) {
        var result = {
            res:true,
            pathname: pathname,
            img:img,
            thumbnail:thumbnail
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    res.setHeader('content-type', 'text/html');
    if (
        user_id === null || secret_id === null
    ) {
        return f_cb1(null);
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, function (user) {
            if (user.verified === false) {
                return res.json({response:false});
            }
            if (user.blog_id === "") {
                return f_cb2(null);
            }
            methods.parse_image_upload(req, res, next, connected_db, user, false, false, f_cb3, s_cb);
        });
    }
});
app.post('/insert/profile-image', busboy({limit: {fileSize:1024 * 1024 * 5}}), function (req,res,next) {
    var f_cb1 = function (doc) {
        var result = {
            res:false,
            reason:'wrong_user'
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var f_cb2 = function (doc) {
        var result = {
            res:false,
            reason:'no_blog_id'
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var f_cb3 = function (doc) {
        var result = {
            res:false,
            reason:'server_error'
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var s_cb = function (pathname, img, thumbnail) {
        var result = {
            res:true,
            pathname: pathname,
            img:img,
            thumbnail:thumbnail
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    res.setHeader('content-type', 'text/html');
    if (
        user_id === null || secret_id === null
    ) {
        return f_cb1(null);
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, function (user) {
            if (user.verified === false) {
                return res.json({response:false});
            }
            if (user.blog_id === "") {
                return f_cb2(null);
            }
            methods.parse_image_upload(req, res, next, connected_db, user, false, true, f_cb3, function (pathname, img, thumbnail) {
                methods.update_profile_image(connected_db, user.blog_id, img, f_cb3, function (nothing) {
                    s_cb(pathname, img, thumbnail);
                    methods.change_all_profile_info(connected_db, user.blog_id, "img", img, function (nothing) {
                        return es_methods.es_update_user_inline(es_client, {type: "img", blog_id: user.blog_id, img: img});
                    }, function (nothing) {
                        return es_methods.es_update_user_inline(es_client, {type: "img", blog_id: user.blog_id, img: img});
                    });
                });
            });
        });
    }
});
app.post('/insert/freephoto', busboy({limit: {fileSize:1024 * 1024 * 5}}), function (req,res,next) {
    var f_cb1 = function (doc) {
        var result = {
            res:false,
            reason:'wrong_user'
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var f_cb2 = function (doc) {
        var result = {
            res:false,
            reason:'no_blog_id'
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var f_cb3 = function (doc) {
        var result = {
            res:false,
            reason:'server_error'
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var s_cb = function (_id, img) {
        var result = {
            res:true,
            _id: _id,
            img:img
        };
        return res.send('<div id="result-inserting-image">' + JSON.stringify(result) + '</div>');
    };
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    res.setHeader('content-type', 'text/html');
    if (
        user_id === null || secret_id === null
    ) {
        return f_cb1(null);
    } else {
        methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb1, function (user) {
            if (user.verified === false) {
                return res.json({response:false});
            }
            if (user.blog_id === "") {
                return f_cb2(null);
            }
            if (methods.is_gleantcorp(user.blog_id) === false) {
                return res.json({response:false});
            }
            methods.parse_image_upload(req, res, next, connected_db, user, true, false, f_cb3, s_cb);
        });
    }
});
app.post('/download/freephoto', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (_id, img) {
        var result = {
            response:true,
            _id: _id,
            img:img
        };
        return res.json(result);
    };
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (req.body.url === undefined) {
        return f_cb(null);
    }
    var url = decodeURIComponent(req.body.url);
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        if (methods.is_gleantcorp(user.blog_id) === false) {
            return res.json({response:false});
        }
        methods.download_image(connected_db, user, true, url, false, f_cb, s_cb);
    });
});
app.post('/remove/freephoto', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (req.body._id === undefined) {
        return f_cb(null);
    }
    var _id = decodeURIComponent(req.body._id);
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        if (methods.is_gleantcorp(user.blog_id) === false) {
            return res.json({response:false});
        }
        methods.remove_freephoto(connected_db, _id, user.blog_id, f_cb, s_cb);
    });
});
app.post('/update/freephoto-category', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body._id === undefined ||
        req.body.main_tag === undefined
    ) {
        return f_cb(null);
    }
    var _id = decodeURIComponent(req.body._id)
        , main_tag = decodeURIComponent(req.body.main_tag);
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false});
        }
        if (methods.is_gleantcorp(user.blog_id) === false) {
            return res.json({response:false});
        }
        methods.update_freephoto_category(connected_db, _id, user.blog_id, main_tag, f_cb, s_cb);
    });
});
/**
 * 메시지 전송
 * req.body 필수 요소
 * @param to_blog_id {string} - 받는이 blog_id
 * @param content {string} - 메시지 내용
 */
app.post('/insert/message', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    if (
        req.body.to_blog_id === undefined ||
        req.body.content === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data.to_blog_id = decodeURIComponent(req.body.to_blog_id);
    data.content = decodeURIComponent(req.body.content);
    if (data.to_blog_id === "") {
        return f_cb(null);
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (user.blog_id === data.to_blog_id) {
            return f_cb(null);
        }
        /* 보낸이 존재할 경우, 보낸이 정보 정의 */
        data.from_blog_id = user.blog_id;
        data.from_name = user.name;
        data.from_img = user.img;
        /* 받는이 사용자 존재여부 확인 */
        methods.check_blog_id(connected_db, data.to_blog_id, true, f_cb, function (doc) {
            data.to_blog_id = doc.blog_id;
            data.to_name = doc.name;
            data.to_img = doc.img;
            /* 받는이 존재할 경우 메시지 삽입 */
            methods.insert_message(connected_db, data, f_cb, s_cb);
        });
    });
});

/**
 * 메시지 삭제
 * req.body 필수요소
 * @param _id {string} - 메시지 아이디
 * @param to_blog_id {string} - 받는이 블로그 아이디
 * @param from_blog_id {string} - 보낸이 블로그 아이디
 */
app.post('/remove/message', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    if (
        req.body._id === undefined ||
        req.body.to_blog_id === undefined ||
        req.body.from_blog_id === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data._id = decodeURIComponent(req.body._id);
    data.to_blog_id = decodeURIComponent(req.body.to_blog_id);
    data.from_blog_id = decodeURIComponent(req.body.from_blog_id);
    if (data.to_blog_id === data.from_blog_id) {
        return f_cb(null);
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (data.to_blog_id !== user.blog_id &&
            data.from_blog_id !== user.blog_id) {
            return f_cb(null);
        }
        if (user.blog_id === "") {
            return f_cb(null);
        }
        methods.remove_message(connected_db, data, user.blog_id, f_cb, s_cb);
    });
});
app.post('/check/unread-messages', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (count) {return res.json({response:false});};
    var s_cb = function (count) {return res.json({response:true, count: count});};
    var data = {};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        data.created_at = { "$gt": user.checked_messages_at };
        data.to_blog_id = user.blog_id;
        methods.check_unread_messages(connected_db, data, f_cb, s_cb);
    });
});
/**
 * 메시지 전체 가져오기 - /i/messages에서 사용
 * req.body 필수 요소
 * type - "all" || "received" || "sent"
 * created_at 존재할 경우, $lt으로 잘라서 이전 메시지 limit.messages 만큼 보내면 됨.
 * created_at 존재하지 않을 경우, 최신 메시지 limit.messages 만큼 보내면 됨.
 */
app.post('/get/messages', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (docs) {return res.json({response:false});};
    var s_cb = function (docs) {return res.json({response:true, docs:docs});};
    if (
        req.body.type === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data.type = decodeURIComponent(req.body.type);
    if (
        data.type !== 'all' &&
        data.type !== 'received' &&
        data.type !== 'sent'
    ) {
        return f_cb(null);
    }
    if (req.body.created_at !== undefined) {
        data.created_at = req.body.created_at;
        try {
            data.created_at = parseInt(data.created_at);
        } catch (e) {
            return f_cb(null);
        }
    } else {
        data.created_at = undefined;
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        data.blog_id = user.blog_id;
        methods.get_messages(connected_db, data, f_cb, s_cb);
    });
});
app.post('/updated/checked-messages-at', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        methods.update_checked_at(connected_db, user_id, secret_id, 'messages', f_cb, s_cb);
    });
});
app.post('/check/unread-notifications', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (count) {return res.json({response:false});};
    var s_cb = function (count) {return res.json({response:true, count: count});};
    var data = {};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        data.updated_at = { "$gt": user.checked_notifications_at };
        data['$or'] = [];
        data['$or'].push({type: "announcement"});
        data['$or'].push({subscribers: user.blog_id});
        data.is_removed = false;
        methods.check_unread_notifications(connected_db, data, f_cb, s_cb);
    });
});
app.post('/get/notifications', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (docs) {return res.json({response:false});};
    var s_cb = function (docs) {return res.json({response:true, docs:docs});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    var data = {};
    if (req.body.updated_at !== undefined) {
        data.updated_at = req.body.updated_at;
        try {
            data.updated_at = parseInt(data.updated_at);
        } catch (e) {
            return f_cb(null);
        }
    } else {
        data.updated_at = undefined;
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        data.blog_id = user.blog_id;
        methods.get_notifications(connected_db, data, f_cb, s_cb);
    });
});
app.post('/update/checked-at', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    if (req.body.type === undefined) {
        return f_cb(null);
    }
    var type = decodeURIComponent(req.body.type);
    if (type !== 'messages' &&
        type !== 'notifications') {
        return f_cb(null);
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        methods.update_checked_at(connected_db, user_id, secret_id, type, f_cb, s_cb);
    });
});
app.post('/request/add-friend', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (req.body.blog_id === undefined) {
        return f_cb(null);
    }
    var blog_id = decodeURIComponent(req.body.blog_id);
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (user.blog_id === blog_id) {
            return f_cb(null);
        }
        methods.check_blog_id(connected_db, blog_id, true, f_cb, function (target_user) {
            methods.request_add_friend(connected_db, user, target_user, f_cb, s_cb);
        });
    });
});
app.post('/remove/add-friend', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (req.body.blog_id === undefined) {
        return f_cb(null);
    }
    var blog_id = decodeURIComponent(req.body.blog_id);
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (user.blog_id === blog_id) {
            return f_cb(null);
        }
        methods.check_blog_id(connected_db, blog_id, true, f_cb, function (source_user) {
            methods.remove_add_friend(connected_db, source_user, user, f_cb, s_cb);
        });
    });
});
app.post('/accept/add-friend', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (req.body.blog_id === undefined) {
        return f_cb(null);
    }
    var blog_id = decodeURIComponent(req.body.blog_id);
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (user.blog_id === blog_id) {
            return f_cb(null);
        }
        methods.check_blog_id(connected_db, blog_id, true, f_cb, function (source_user) {
            methods.get_single_notification(connected_db, { /* Check Friend Request exists */
                type: "friend_request"
                , blog_id: source_user.blog_id
                , subscribers: user.blog_id
            }, f_cb, function (nothing) {
                methods.accept_add_friend(connected_db, source_user, user, f_cb, s_cb);
            });
        });
    });
});
app.post('/remove/current-friend', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (req.body.blog_id === undefined) {
        return f_cb(null);
    }
    var blog_id = decodeURIComponent(req.body.blog_id);
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (user.blog_id === blog_id) {
            return f_cb(null);
        }
        methods.check_blog_id(connected_db, blog_id, true, f_cb, function (target_user) {
            methods.is_friend(connected_db, user.blog_id, target_user.blog_id
                , function () {
                    return f_cb(null);
                }, function () {
                    methods.remove_current_friend(connected_db, user, target_user, f_cb, s_cb);
                });
        });
    });
});
app.post('/get/friends', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (docs) {return res.json({response:false});};
    var s_cb = function (docs) {return res.json({response:true, docs:docs});};
    if (
        req.body.type === undefined ||
        req.body.blog_id === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data.type = decodeURIComponent(req.body.type);
    data.blog_id = decodeURIComponent(req.body.blog_id);
    if (
        data.type !== 'friends' &&
        data.type !== 'received' &&
        data.type !== 'sent'
    ) {
        return f_cb(null);
    }
    if (data.type === 'friends') {
        if (req.body.skip !== undefined) {
            data.skip = req.body.skip;
            try {
                data.skip = parseInt(data.skip);
            } catch (e) {
                return f_cb(null);
            }
        } else {
            data.skip = undefined;
        }
    } else {
        if (req.body.created_at !== undefined) {
            data.created_at = req.body.created_at;
            try {
                data.created_at = parseInt(data.created_at);
            } catch (e) {
                return f_cb(null);
            }
        } else {
            data.created_at = undefined;
        }
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (data.type !== 'friends') {
            if (data.blog_id !== user.blog_id) {
                return f_cb(null);
            }
        }
        methods.get_friends(connected_db, data, f_cb, s_cb);
    });
});
app.post('/request/help-opinion', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.type === undefined ||
        req.body._id === undefined ||
        req.body.blog_id === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data.type = decodeURIComponent(req.body.type);
    data._id = decodeURIComponent(req.body._id);
    data.blog_id = decodeURIComponent(req.body.blog_id);
    if (data.type !== "agenda") {
        return f_cb(null);
    }
    if (
        (Object.prototype.toString.call(data._id) !== "[object String]") ||
        (Object.prototype.toString.call(data.blog_id) !== "[object String]")
    ) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (user.blog_id === data.blog_id) {
            return res.json({response:false, msg: "self_request"});
        }
        methods.check_blog_id(connected_db, data.blog_id, true, f_cb, function (target_user) {
            methods.get_single_agenda(connected_db, user, {_id: data._id}, "public", "perfect", f_cb, function (doc) {
                if (doc.opinion_authority !== 1) {
                    return f_cb(null);
                }
                data.link = "/agenda/" + doc._id;
                /* Check the user wrote opinion of agenda. If he was, f_cb */
                return methods.is_not_member_not_wrote_article(connected_db, "articles", {type: "opinion", agenda_id: doc._id, blog_id: target_user.blog_id}, f_cb, function (is_not_member_not_wrote_article) {
                    if (is_not_member_not_wrote_article === false) {
                        return f_cb(null);
                    }
                    data.title = doc.title;
                    if (doc.img_list.length !== 0) {
                        data.img = doc.img_list[0].replace('/resized/', '/thumbnail/');
                    } else {
                        data.img = doc.img;
                    }
                    methods.request_help_opinion(connected_db, user, target_user, data, f_cb, s_cb);
                });
            });
        });
    });
});
app.post('/remove/help-opinion', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.type === undefined ||
        req.body._id === undefined ||
        req.body.blog_id === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data.type = decodeURIComponent(req.body.type);
    data._id = decodeURIComponent(req.body._id);
    data.blog_id = decodeURIComponent(req.body.blog_id);
    if (data.type !== "agenda") {
        return f_cb(null);
    }
    if (
        (Object.prototype.toString.call(data._id) !== "[object String]") ||
        (Object.prototype.toString.call(data.blog_id) !== "[object String]")
    ) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (user.blog_id === data.blog_id) {
            return res.json({response:false, msg: "self_request"});
        }
        methods.get_single_agenda(connected_db, user, {_id: data._id}, "public", "perfect", f_cb, function (doc) {
            data.link = "/agenda/" + doc._id;
            methods.check_blog_id(connected_db, data.blog_id, true, f_cb, function (target_user) {
                methods.remove_help_opinion(connected_db, user, target_user, data, f_cb, s_cb);
            });
        });
    });
});
app.post('/request/help-translation', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    return f_cb(null);
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.type === undefined ||
        req.body._id === undefined ||
        req.body.blog_id === undefined ||
        req.body.source_lang === undefined ||
        req.body.target_lang === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data.type = decodeURIComponent(req.body.type);
    data._id = decodeURIComponent(req.body._id);
    data.blog_id = decodeURIComponent(req.body.blog_id);
    data.source_lang = decodeURIComponent(req.body.source_lang);
    data.target_lang = decodeURIComponent(req.body.target_lang);
    if (
        data.type !== "agenda" &&
        data.type !== "opinion"
    ) {
        return f_cb(null);
    }
    if (data.source_lang === data.target_lang) {
        return f_cb(null);
    }
    if (
        methods.is_language_corret(data.source_lang) === false ||
        methods.is_language_corret(data.target_lang) === false
    ) {
        return f_cb(null);
    }
    if (
        (Object.prototype.toString.call(data._id) !== "[object String]") ||
        (Object.prototype.toString.call(data.blog_id) !== "[object String]")
    ) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (user.blog_id === data.blog_id) {
            return res.json({response:false, msg: "self_request"});
        }
        methods.check_blog_id(connected_db, data.blog_id, true, f_cb, function (target_user) {
            if (data.type === "agenda") {
                methods.get_single_agenda(connected_db, user, {_id: data._id}, "public", "perfect", f_cb, function (doc) {
                    if (doc.translation_authority !== 1) {
                        return f_cb(null);
                    }
                    if (doc.language !== data.source_lang) {
                        return f_cb(null);
                    }
                    data.link = "/agenda/" + doc._id;
                    /* Check the user wrote translation of agenda. If he was, f_cb */
                    return methods.is_not_member_not_wrote_article(connected_db, "articles", {type: "tr_agenda", agenda_id: doc._id, blog_id: target_user.blog_id}, f_cb, function (is_not_member_not_wrote_article) {
                        if (is_not_member_not_wrote_article === false) {
                            return f_cb(null);
                        }
                        data.title = doc.title;
                        if (doc.img_list.length !== 0) {
                            data.img = doc.img_list[0].replace('/resized/', '/thumbnail/');
                        } else {
                            data.img = doc.img;
                        }
                        methods.request_help_translation(connected_db, user, target_user, data, f_cb, s_cb);
                    });
                });
            } else if (data.type === "opinion") {
                methods.get_single_opinion(connected_db, user, {_id: data._id}, "public", "perfect", f_cb, function (doc) {
                    if (doc.translation_authority !== 1) {
                        return f_cb(null);
                    }
                    if (doc.language !== data.source_lang) {
                        return f_cb(null);
                    }
                    data.link = "/agenda/" + doc.agenda_id + "/opinion/" + doc._id;
                    /* Check the user wrote translation of opinion. If he was, f_cb */
                    return methods.is_not_member_not_wrote_article(connected_db, "articles", {type: "tr_opinion", agenda_id: doc.agenda_id, opinion_id: doc._id, blog_id: target_user.blog_id}, f_cb, function (is_not_member_not_wrote_article) {
                        if (is_not_member_not_wrote_article === false) {
                            return f_cb(null);
                        }
                        data.title = doc.title;
                        if (doc.img_list.length !== 0) {
                            data.img = doc.img_list[0].replace('/resized/', '/thumbnail/');
                        } else {
                            data.img = doc.img;
                        }
                        methods.request_help_translation(connected_db, user, target_user, data, f_cb, s_cb);
                    });
                });
            }
        });
    });
});
app.post('/remove/help-translation', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    return f_cb(null);
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.type === undefined ||
        req.body._id === undefined ||
        req.body.blog_id === undefined ||
        req.body.source_lang === undefined ||
        req.body.target_lang === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data.type = decodeURIComponent(req.body.type);
    data._id = decodeURIComponent(req.body._id);
    data.blog_id = decodeURIComponent(req.body.blog_id);
    data.source_lang = decodeURIComponent(req.body.source_lang);
    data.target_lang = decodeURIComponent(req.body.target_lang);
    if (
        data.type !== "agenda" &&
        data.type !== "opinion"
    ) {
        return f_cb(null);
    }
    if (data.source_lang === data.target_lang) {
        return f_cb(null);
    }
    if (
        methods.is_language_corret(data.source_lang) === false ||
        methods.is_language_corret(data.target_lang) === false
    ) {
        return f_cb(null);
    }
    if (
        (Object.prototype.toString.call(data._id) !== "[object String]") ||
        (Object.prototype.toString.call(data.blog_id) !== "[object String]")
    ) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (user.blog_id === data.blog_id) {
            return res.json({response:false, msg: "self_request"});
        }
        if (data.type === "agenda") {
            methods.get_single_agenda(connected_db, user, {_id: data._id}, "public", "perfect", f_cb, function (doc) {
                data.link = "/agenda/" + doc._id;
                methods.check_blog_id(connected_db, data.blog_id, true, f_cb, function (target_user) {
                    methods.remove_help_translation(connected_db, user, target_user, data, f_cb, s_cb);
                });
            });
        } else if (data.type === "opinion") {
            methods.get_single_opinion(connected_db, user, {_id: data._id}, "public", "perfect", f_cb, function (doc) {
                data.link = "/agenda/" + doc.agenda_id + "/opinion/" + doc._id;
                methods.check_blog_id(connected_db, data.blog_id, true, f_cb, function (target_user) {
                    methods.remove_help_translation(connected_db, user, target_user, data, f_cb, s_cb);
                });
            });
        } else {
            return f_cb(null);
        }
    });
});
app.post('/request/invitation', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.type === undefined ||
        req.body._id === undefined ||
        req.body.blog_id === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data.type = decodeURIComponent(req.body.type);
    data._id = decodeURIComponent(req.body._id);
    data.blog_id = decodeURIComponent(req.body.blog_id);
    if (
        data.type !== "agenda" &&
        data.type !== "hire_me" &&
        data.type !== "apply_now"
    ) {
        return f_cb(null);
    }
    if (
        (Object.prototype.toString.call(data._id) !== "[object String]") ||
        (Object.prototype.toString.call(data.blog_id) !== "[object String]")
    ) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        methods.check_blog_id(connected_db, data.blog_id, true, f_cb, function (target_user) {
            if (data.type === "agenda") {
                data.link = "/agenda/" + data._id;
                methods.get_single_agenda(connected_db, user, {_id: data._id}, "public", "perfect", f_cb, function (doc) {
                    if (doc.blog_id !== user.blog_id) {
                        return f_cb(null);
                    }
                    methods.is_member(connected_db, "articles", {_id: doc._id, blog_id: target_user.blog_id}, false, function (is_member) {
                        if (is_member === true) {
                            return f_cb(null);
                        }
                        data.title = doc.title;
                        if (doc.img_list.length !== 0) {
                            data.img = doc.img_list[0].replace('/resized/', '/thumbnail/');
                        } else {
                            data.img = doc.img;
                        }
                        methods.request_invitation(connected_db, user, target_user, data, f_cb, s_cb);
                    });
                });
            } else if (data.type === "hire_me") {
                data.link = "/hire-me/" + data._id;
                methods.get_single_hire_me(connected_db, user, {_id: data._id}, "owner", "all", f_cb, function (doc) {
                    if (doc.blog_id !== user.blog_id) {
                        return f_cb(null);
                    }
                    methods.is_member(connected_db, "employment", {_id: doc._id, blog_id: target_user.blog_id}, false, function (is_member) {
                        if (is_member === true) {
                            return f_cb(null);
                        }
                        data.title = doc.title;
                        data.img = user.img;
                        methods.request_invitation(connected_db, user, target_user, data, f_cb, s_cb);
                    });
                });
            } else if (data.type === "apply_now") {
                data.link = "/apply-now/" + data._id;
                methods.get_single_apply_now(connected_db, user, {_id: data._id}, "owner", "all", f_cb, function (doc) {
                    if (doc.blog_id !== user.blog_id) {
                        return f_cb(null);
                    }
                    methods.is_member(connected_db, "employment", {_id: doc._id, blog_id: target_user.blog_id}, false, function (is_member) {
                        if (is_member === true) {
                            return f_cb(null);
                        }
                        data.title = doc.title;
                        data.img = doc.logo;
                        methods.request_invitation(connected_db, user, target_user, data, f_cb, s_cb);
                    });
                });
            }
        });
    });
});
app.post('/remove/invitation', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.type === undefined ||
        req.body._id === undefined ||
        req.body.blog_id === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data.type = decodeURIComponent(req.body.type);
    data._id = decodeURIComponent(req.body._id);
    data.blog_id = decodeURIComponent(req.body.blog_id);
    if (
        data.type !== "agenda" &&
        data.type !== "hire_me" &&
        data.type !== "apply_now"
    ) {
        return f_cb(null);
    }
    if (
        (Object.prototype.toString.call(data._id) !== "[object String]") ||
        (Object.prototype.toString.call(data.blog_id) !== "[object String]")
    ) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        methods.check_blog_id(connected_db, data.blog_id, true, f_cb, function (source_user) {
            if (data.type === "agenda") {
                data.link = "/agenda/" + data._id;
            } else if (data.type === "hire_me") {
                data.link = "/hire-me/" + data._id;
            } else if (data.type === "apply_now") {
                data.link = "/apply-now/" + data._id;
            }
            methods.remove_invitation(connected_db, source_user, user, data, f_cb, s_cb);
        });
    });
});
app.post('/accept/invitation', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.type === undefined ||
        req.body._id === undefined ||
        req.body.blog_id === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data.type = decodeURIComponent(req.body.type);
    data._id = decodeURIComponent(req.body._id);
    data.blog_id = decodeURIComponent(req.body.blog_id);
    if (
        data.type !== "agenda" &&
        data.type !== "hire_me" &&
        data.type !== "apply_now"
    ) {
        return f_cb(null);
    }
    if (
        (Object.prototype.toString.call(data._id) !== "[object String]") ||
        (Object.prototype.toString.call(data.blog_id) !== "[object String]")
    ) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        methods.check_blog_id(connected_db, data.blog_id, true, f_cb, function (source_user) {
            if (data.type === "agenda") {
                data.link = "/agenda/" + data._id;
            } else if (data.type === "hire_me") {
                data.link = "/hire-me/" + data._id;
            } else if (data.type === "apply_now") {
                data.link = "/apply-now/" + data._id;
            }
            methods.get_single_notification(connected_db, { /* Check Friend Request exists */
                type: "invitation_request"
                , link: data.link
                , blog_id: source_user.blog_id
                , subscribers: user.blog_id
            }, f_cb, function (notification) {
                if (notification.info.type !== data.type) {
                    return f_cb(null);
                }
                data.title = notification.info.title;
                data.img = notification.info.img;
                methods.accept_invitation(connected_db, source_user, user, data, f_cb, s_cb);
            });
        });
    });
});
app.post('/remove/accepted-invitation', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    if (
        req.body.type === undefined ||
        req.body._id === undefined
    ) {
        return f_cb(null);
    }
    var data = {}
        , collection_name = "employment";
    data.type = decodeURIComponent(req.body.type);
    data._id = decodeURIComponent(req.body._id);
    if (
        data.type !== "agenda" &&
        data.type !== "hire_me" &&
        data.type !== "apply_now"
    ) {
        return f_cb(null);
    }
    if (Object.prototype.toString.call(data._id) !== "[object String]") {
        return f_cb(null);
    }
    if (data.type === "agenda") {
        collection_name = "articles";
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (data.type === "agenda") {
            data.link = "/agenda/" + data._id;
        } else if (data.type === "hire_me") {
            data.link = "/hire-me/" + data._id;
        } else if (data.type === "apply_now") {
            data.link = "/apply-now/" + data._id;
        }
        return methods.is_member(connected_db, collection_name, {_id: data._id, blog_id: user.blog_id}, true, function (is_member, doc) {
            if (is_member === false) {
                return f_cb(null);
            }
            if (data.type !== doc.type) {
                return f_cb(null);
            }
            return methods.remove_accepted_invitation(connected_db, doc.blog_id, user, data, f_cb, s_cb);
        });
    });
});
app.post('/get/invitations', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (docs) {return res.json({response:false});};
    var s_cb = function (docs) {return res.json({response:true, docs:docs});};
    if (
        req.body.type === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data.type = decodeURIComponent(req.body.type);
    if (
        data.type !== 'received' &&
        data.type !== 'sent'
    ) {
        return f_cb(null);
    }
    if (req.body.created_at !== undefined) {
        data.created_at = req.body.created_at;
        try {
            data.created_at = parseInt(data.created_at);
        } catch (e) {
            return f_cb(null);
        }
    } else {
        data.created_at = undefined;
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        data.blog_id = user.blog_id;
        methods.get_invitations(connected_db, data, f_cb, s_cb);
    });
});
/**
 * Return users who are not yet invitation requested or opinion requested or translation requested.
 * big_type {String} - invitation_request || opinion_request || translation_request
 * small_type {String} - recommended_users || friends || search
 *
 * article_type {String} - agenda || opinion || hire_me || apply_now
 * article_id {String} - id of agenda or opinion or hire_me or apply_now
 *
 * skip {Number} - number of documents to skip
 *
 * 한 가지 타입의 요청 경우, 한 사용자가 할 수 있는 요청 최대 개수를 줄까?...
 */
app.post('/get/users-to-request', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (docs) {return res.json({response:false});};
    var s_cb = function (docs) {return res.json({response:true, docs:docs});};
    if (
        req.body.big_type === undefined ||
        req.body.small_type === undefined ||
        req.body.article_type === undefined ||
        req.body.article_id === undefined
    ) {
        return f_cb(null);
    }
    var data = {};
    data.big_type = decodeURIComponent(req.body.big_type);
    data.small_type = decodeURIComponent(req.body.small_type);
    data.article_type = decodeURIComponent(req.body.article_type);
    data.article_id = decodeURIComponent(req.body.article_id);
    if (
        data.big_type !== 'invitation_request' &&
        data.big_type !== 'opinion_request'
    ) {
        return f_cb(null);
    }
    /*if (
        data.big_type !== 'invitation_request' &&
        data.big_type !== 'opinion_request' &&
        data.big_type !== 'translation_request'
    ) {
        return f_cb(null);
    }*/
    if (
        data.small_type !== 'recommended_users' &&
        data.small_type !== 'friends' &&
        data.small_type !== 'search'
    ) {
        return f_cb(null);
    }
    if (
        data.article_type !== 'agenda' &&
        data.article_type !== 'opinion' &&
        data.article_type !== 'hire_me' &&
        data.article_type !== 'apply_now'
    ) {
        return f_cb(null);
    }
    if (data.article_type === 'agenda') {
        if (req.body.tr_agenda_id !== undefined) {
            data.tr_agenda_id = decodeURIComponent(req.body.tr_agenda_id);
        }
    }
    if (data.big_type === 'invitation_request') {
        if (data.article_type === 'opinion') {
            return f_cb(null);
        }
    }
    if (data.big_type === 'opinion_request') {
        if (data.article_type !== 'agenda') {
            return f_cb(null);
        }
    }
    if (data.big_type === 'translation_request') {
        if (data.article_type !== 'agenda' &&
            data.article_type !== 'opinion') {
            return f_cb(null);
        }
        if (
            req.body.source_lang === undefined ||
            req.body.target_lang === undefined
        ) {
            return f_cb(null);
        }
        data.source_lang = decodeURIComponent(req.body.source_lang);
        data.target_lang = decodeURIComponent(req.body.target_lang);
        if (data.source_lang === data.target_lang) {
            return f_cb(null);
        }
        if (
            methods.is_language_corret(data.source_lang) === false ||
            methods.is_language_corret(data.target_lang) === false
        ) {
            return f_cb(null);
        }
    }
    if (
        data.article_type === "hire_me" ||
        data.article_type === "apply_now"
    ) {
        if (data.big_type !== 'invitation_request') {
            return f_cb(null);
        }
        if (data.small_type === 'recommended_users') {
            return f_cb(null);
        }
    }
    if (Object.prototype.toString.call(data.article_id) !== "[object String]") {
        return f_cb(null);
    }
    if (data.small_type === 'friends' ||
        data.small_type === 'search') {
        if (req.body.skip === undefined) {
            return f_cb(null);
        }
        data.skip = decodeURIComponent(req.body.skip);
        try {
            data.skip = parseInt(data.skip);
        } catch (e) {
            return f_cb(null);
        }
        if (data.small_type === 'search') {
            if (req.body.query === undefined) {
                return f_cb(null);
            }
            data.query = decodeURIComponent(req.body.query);
            if (data.query === "") {
                return f_cb(null);
            }
        }
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);
    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        if (data.big_type === "invitation_request") { /* Invitation Request */
            if (data.small_type === 'recommended_users') { /* Recommended Users */
                if (data.article_type === 'agenda') { /* Agenda */
                    /* Get single article and check blog_id of it */
                    methods.get_single_agenda(connected_db, user, {_id: data.article_id}, "public", "perfect", f_cb, function (doc) {
                        if (doc.blog_id !== user.blog_id) {
                            return f_cb(null);
                        }
                        data.members = doc.members;
                        if (data.tr_agenda_id !== undefined) {
                            methods.get_single_article(connected_db, {type: "tr_agenda", agenda_id: data.article_id, _id: data.tr_agenda_id}, f_cb, function (translation) {
                                methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                                    methods.get_debate_recommended_users(connected_db, excluders, translation.tags, f_cb, s_cb);
                                });
                            });
                        } else {
                            methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                                methods.get_debate_recommended_users(connected_db, excluders, doc.tags, f_cb, s_cb);
                            });
                        }
                    });
                } else {
                    return f_cb(null);
                }
            } else if (data.small_type === 'friends') { /* Friends */
                if (data.article_type === 'agenda') { /* Agenda */
                    /* Get single article and check blog_id of it */
                    methods.get_single_agenda(connected_db, user, {_id: data.article_id}, "public", "perfect", f_cb, function (doc) {
                        if (doc.blog_id !== user.blog_id) {
                            return f_cb(null);
                        }
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            methods.get_friends(connected_db, {
                                type: "friends"
                                , blog_id: user.blog_id
                                , excluders: excluders
                                , skip: data.skip
                            }, f_cb, s_cb);
                        });
                    });
                } else if (data.article_type === 'hire_me') { /* Hire Me */
                    /* Get single article and check blog_id of it */
                    methods.get_single_hire_me(connected_db, user, {_id: data.article_id}, "owner", "all", f_cb, function (doc) {
                        if (doc.blog_id !== user.blog_id) {
                            return f_cb(null);
                        }
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            methods.get_friends(connected_db, {
                                type: "friends"
                                , blog_id: user.blog_id
                                , excluders: excluders
                                , skip: data.skip
                            }, f_cb, s_cb);
                        });
                    });
                } else if (data.article_type === 'apply_now') { /* Apply Now */
                    /* Get single article and check blog_id of it */
                    methods.get_single_apply_now(connected_db, user, {_id: data.article_id}, "owner", "all", f_cb, function (doc) {
                        if (doc.blog_id !== user.blog_id) {
                            return f_cb(null);
                        }
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            methods.get_friends(connected_db, {
                                type: "friends"
                                , blog_id: user.blog_id
                                , excluders: excluders
                                , skip: data.skip
                            }, f_cb, s_cb);
                        });
                    });
                } else {
                    return f_cb(null);
                }
            } else if (data.small_type === 'search') { /* Search */
                if (data.article_type === 'agenda') { /* Agenda */
                    /* When s_cb is returned, have to check obj.user.length! It could be empty array! */
                    /* Get single article and check blog_id of it */
                    methods.get_single_agenda(connected_db, user, {_id: data.article_id}, "public", "perfect", f_cb, function (doc) {
                        if (doc.blog_id !== user.blog_id) {
                            return f_cb(null);
                        }
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            es_methods.es_search_user(es_client, {
                                type: "ur"
                                , query: data.query
                                , excluders: excluders
                                , from: data.skip
                                , size: 20
                                , is_loginned: true
                            }, function (user_obj) {
                                return s_cb(user_obj.user);
                            });
                        });
                    });
                } else if (data.article_type === 'hire_me') { /* Hire Me */
                    /* When s_cb is returned, have to check obj.user.length! It could be empty array! */
                    /* Get single article and check blog_id of it */
                    methods.get_single_hire_me(connected_db, user, {_id: data.article_id}, "owner", "all", f_cb, function (doc) {
                        if (doc.blog_id !== user.blog_id) {
                            return f_cb(null);
                        }
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            es_methods.es_search_user(es_client, {
                                type: "ur"
                                , query: data.query
                                , excluders: excluders
                                , from: data.skip
                                , size: 20
                                , is_loginned: true
                            }, function (user_obj) {
                                return s_cb(user_obj.user);
                            });
                        });
                    });
                } else if (data.article_type === 'apply_now') { /* Apply Now */
                    /* When s_cb is returned, have to check obj.user.length! It could be empty array! */
                    /* Get single article and check blog_id of it */
                    methods.get_single_apply_now(connected_db, user, {_id: data.article_id}, "owner", "all", f_cb, function (doc) {
                        if (doc.blog_id !== user.blog_id) {
                            return f_cb(null);
                        }
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            es_methods.es_search_user(es_client, {
                                type: "ur"
                                , query: data.query
                                , excluders: excluders
                                , from: data.skip
                                , size: 20
                                , is_loginned: true
                            }, function (user_obj) {
                                return s_cb(user_obj.user);
                            });
                        });
                    });
                } else {
                    return f_cb(null);
                }
            }
        } else if (data.big_type === "opinion_request") { /* Opinion Request */
            if (data.small_type === 'recommended_users') { /* Recommended Users */
                if (data.article_type === 'agenda') { /* Agenda */
                    /* Get single article and check opinion_authority of it */
                    methods.get_single_agenda(connected_db, user, {_id: data.article_id}, "public", "perfect", f_cb, function (doc) {
                        if (doc.opinion_authority !== 1) {
                            return f_cb(null);
                        }
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            excluders = _.union(excluders, [user.blog_id]);
                            methods.get_debate_recommended_users(connected_db, excluders, doc.tags, f_cb, s_cb);
                        });
                    });
                } else {
                    return f_cb(null);
                }
            } else if (data.small_type === 'friends') { /* Friends */
                if (data.article_type === 'agenda') { /* Agenda */
                    /* Get single article and check opinion_authority of it */
                    methods.get_single_agenda(connected_db, user, {_id: data.article_id}, "public", "perfect", f_cb, function (doc) {
                        if (doc.opinion_authority !== 1) {
                            return f_cb(null);
                        }
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            methods.get_friends(connected_db, {
                                type: "friends"
                                , blog_id: user.blog_id
                                , excluders: excluders
                                , skip: data.skip
                            }, f_cb, s_cb);
                        });
                    });
                } else {
                    return f_cb(null);
                }
            } else if (data.small_type === 'search') { /* Search */
                if (data.article_type === 'agenda') { /* Agenda */
                    /* When s_cb is returned, have to check obj.user.length! It could be empty array! */
                    /* Get single article and check opinion_authority of it */
                    methods.get_single_agenda(connected_db, user, {_id: data.article_id}, "public", "perfect", f_cb, function (doc) {
                        if (doc.opinion_authority !== 1) {
                            return f_cb(null);
                        }
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            excluders = _.union(excluders, [user.blog_id]);
                            es_methods.es_search_user(es_client, {
                                type: "ur"
                                , query: data.query
                                , excluders: excluders
                                , from: data.skip
                                , size: 20
                                , is_loginned: true
                            }, function (user_obj) {
                                return s_cb(user_obj.user);
                            });
                        });
                    });
                } else {
                    return f_cb(null);
                }
            }
        } else if (data.big_type === "translation_request") { /* Translation Request */
            if (data.small_type === 'recommended_users') { /* Recommended Users */
                if (data.article_type === 'agenda') { /* Agenda */
                    /* Get single article and check translation_authority of it */
                    methods.get_single_agenda(connected_db, user, {_id: data.article_id}, "public", "perfect", f_cb, function (doc) {
                        if (doc.translation_authority !== 1) {
                            return f_cb(null);
                        }
                        if (doc.language !== data.source_lang) {
                            return f_cb(null);
                        }
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            excluders = _.union(excluders, [user.blog_id]);
                            methods.get_translation_recommended_users(connected_db, excluders, {
                                source_lang: data.source_lang
                                , target_lang: data.target_lang
                            }, f_cb, s_cb);
                        });
                    });
                } else if (data.article_type === 'opinion') { /* Opinion */
                    /* Get single article and check translation_authority of it */
                    methods.get_single_opinion(connected_db, user, { _id: data.article_id }, "public", "perfect", f_cb, function (doc) {
                        if (doc.translation_authority !== 1) {
                            return f_cb(null);
                        }
                        if (doc.language !== data.source_lang) {
                            return f_cb(null);
                        }
                        data.agenda_id = doc.agenda_id;
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            excluders = _.union(excluders, [user.blog_id]);
                            methods.get_translation_recommended_users(connected_db, excluders, {
                                source_lang: data.source_lang
                                , target_lang: data.target_lang
                            }, f_cb, s_cb);
                        });
                    });
                } else {
                    return f_cb(null);
                }
            } else if (data.small_type === 'friends') { /* Friends */
                if (data.article_type === 'agenda') { /* Agenda */
                    /* Get single article and check translation_authority of it */
                    methods.get_single_agenda(connected_db, user, {_id: data.article_id}, "public", "perfect", f_cb, function (doc) {
                        if (doc.translation_authority !== 1) {
                            return f_cb(null);
                        }
                        if (doc.language !== data.source_lang) {
                            return f_cb(null);
                        }
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            methods.get_friends(connected_db, {
                                type: "friends"
                                , blog_id: user.blog_id
                                , excluders: excluders
                                , skip: data.skip
                            }, f_cb, s_cb);
                        });
                    });
                } else if (data.article_type === 'opinion') { /* Opinion */
                    /* Get single article and check translation_authority of it */
                    methods.get_single_opinion(connected_db, user, {_id: data.article_id}, "public", "perfect", f_cb, function (doc) {
                        if (doc.translation_authority !== 1) {
                            return f_cb(null);
                        }
                        if (doc.language !== data.source_lang) {
                            return f_cb(null);
                        }
                        data.agenda_id = doc.agenda_id;
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            methods.get_friends(connected_db, {
                                type: "friends"
                                , blog_id: user.blog_id
                                , excluders: excluders
                                , skip: data.skip
                            }, f_cb, s_cb);
                        });
                    });
                } else {
                    return f_cb(null);
                }
            } else if (data.small_type === 'search') { /* Search */
                if (data.article_type === 'agenda') { /* Agenda */
                    /* When s_cb is returned, have to check obj.user.length! It could be empty array! */
                    /* Get single article and check translation_authority of it */
                    methods.get_single_agenda(connected_db, user, {_id: data.article_id}, "public", "perfect", f_cb, function (doc) {
                        if (doc.translation_authority !== 1) {
                            return f_cb(null);
                        }
                        if (doc.language !== data.source_lang) {
                            return f_cb(null);
                        }
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            excluders = _.union(excluders, [user.blog_id]);
                            es_methods.es_search_user(es_client, {
                                type: "ur"
                                , query: data.query
                                , excluders: excluders
                                , from: data.skip
                                , size: 20
                                , is_loginned: true
                            }, function (user_obj) {
                                return s_cb(user_obj.user);
                            });
                        });
                    });
                } else if (data.article_type === 'opinion') { /* Opinion */
                    /* When s_cb is returned, have to check obj.user.length! It could be empty array! */
                    /* Get single article and check translation_authority of it */
                    methods.get_single_opinion(connected_db, user, {_id: data.article_id}, "public", "perfect", f_cb, function (doc) {
                        if (doc.translation_authority !== 1) {
                            return f_cb(null);
                        }
                        if (doc.language !== data.source_lang) {
                            return f_cb(null);
                        }
                        data.agenda_id = doc.agenda_id;
                        data.members = doc.members;
                        methods.get_excluders(connected_db, user, data, f_cb, function (excluders) {
                            excluders = _.union(excluders, [user.blog_id]);
                            es_methods.es_search_user(es_client, {
                                type: "ur"
                                , query: data.query
                                , excluders: excluders
                                , from: data.skip
                                , size: 20
                                , is_loginned: true
                            }, function (user_obj) {
                                return s_cb(user_obj.user);
                            });
                        });
                    });
                } else {
                    return f_cb(null);
                }
            }
        }
    });
});
/**
 * 신고 기능
 * req.body 필수 요소
 * @param _id {string} - 신고하는 게시물 id
 * @param type {string} - 'agenda' || 'opinion' || 'blog' || 'gallery' || 'comment' || 'message'
 * @param content {string} - 신고 내용
 */
app.post('/report', body_parser.urlencoded({ extended: true }), body_parser.json(), function (req, res) {
    var f_cb = function (doc) {return res.json({response:false});};
    var s_cb = function (doc) {return res.json({response:true});};
    if (
        req.body._id === undefined ||
        req.body.type === undefined ||
        req.body.content === undefined
    ) {
        return f_cb(null);
    }
    /* 신고 type 확인 */
    var type = decodeURIComponent(req.body.type)
        , _id = decodeURIComponent(req.body._id)
        , content = decodeURIComponent(req.body.content)
        , data = {};
    /* 만약 type이 잘못되었다면..
     * blog랑 gallery는 일단 신고 처리하지 않음.
     **/
    /*if (
        type !== 'apply_now' &&
        type !== 'hire_me' &&
        type !== 'agenda' &&
        type !== 'opinion' &&
        type !== 'tr_agenda' &&
        type !== 'tr_opinion' &&
        type !== 'comment' &&
        type !== 'message'
    ) {
        return f_cb(null);
    }*/
    if (
        type !== 'apply_now' &&
        type !== 'hire_me' &&
        type !== 'agenda' &&
        type !== 'opinion' &&
        type !== 'comment' &&
        type !== 'message'
    ) {
        return f_cb(null);
    }
    var cookies = req.headers.cookie;
    var user_id = methods.get_cookie(cookies, cookie_name["user_id"]) || null;
    var secret_id = methods.get_cookie(cookies, cookie_name["secret_id"]) || null;
    var lang = methods.get_cookie(cookies, cookie_name["lang"]) || null;
    if (!lang) {
        lang = "en";
        if (app.get('env') === 'production') {
            res.cookie(cookie_name["lang"], 'en', {domain: '.gleant.com', maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        } else {
            res.cookie(cookie_name["lang"], 'en', {maxAge : 365 * 24 * 60 * 60 * 1000, httpOnly: true});
        }
    }
    lang = methods.get_valid_language(lang);

    if (user_id === null || secret_id === null) {
        return f_cb(null);
    }
    /* 게시물 존재여부 확인 위해 넘길 data 정의 */
    data._id = _id;
    if ( type === 'apply_now') {
        data.type = type;
    } else if ( type === 'hire_me') {
        data.type = type;
    } else if ( type === 'agenda') {
        data.type = type;
    } else if ( type === 'opinion') {
        if (req.body.agenda_id === undefined) {
            return f_cb(null);
        }
        data.agenda_id = decodeURIComponent(req.body.agenda_id);
        data.type = type;
    } else if ( type === 'tr_agenda') {
        if (req.body.agenda_id === undefined) {
            return f_cb(null);
        }
        data.agenda_id = decodeURIComponent(req.body.agenda_id);
        data.type = type;
    } else if ( type === 'tr_opinion') {
        if (
            req.body.agenda_id === undefined ||
            req.body.opinion_id === undefined
        ) {
            return f_cb(null);
        }
        data.agenda_id = decodeURIComponent(req.body.agenda_id);
        data.opinion_id = decodeURIComponent(req.body.opinion_id);
        data.type = type;
    } else if ( type === 'blog') {
        if (req.body.blog_id === undefined ||
            req.body.blog_menu_id === undefined ) {
            return f_cb(null);
        }
        data.type = type;
        data.blog_id = decodeURIComponent(req.body.blog_id);
        data.blog_menu_id = decodeURIComponent(req.body.blog_menu_id);
    } else if ( type === 'gallery') {
        if (req.body.blog_id === undefined) {
            return f_cb(null);
        }
        data.type = type;
        data.blog_id = decodeURIComponent(req.body.blog_id);
    } else if ( type === 'comment') {
    } else if ( type === 'message') {
        if (req.body.from_blog_id === undefined ||
            req.body.to_blog_id === undefined) {
            return f_cb(null);
        }
        /* 메시지일 경우에 둘다 있어야 함. */
        data.from_blog_id = decodeURIComponent(req.body.from_blog_id);
        data.to_blog_id = decodeURIComponent(req.body.to_blog_id);
    }
    /* 신고자 확인 */
    methods.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true, f_cb, function (user) {
        if (user.verified === false) {
            return res.json({response:false});
        }
        if (user.blog_id === "") {
            return res.json({response:false, msg: "no_blog_id"});
        }
        /* 게시물 존재여부 확인 */
        /**
         * report_first - 신고 게시물 존재여부 확인 위해 사용
         * report_second - 신고 게시물의 content_list 배열에 $push할 내용
         */
        var report_first = {}
            , report_second = {};
        report_first.db_id = _id;
        report_first.type = type;
        /* 신고 데이터 작성
         * report_second의 created_at은 메서드 내부에서 new Date().valueOf() 로 생성하기
         **/
        report_second.blog_id = user.blog_id;
        report_second.content = content;
        if ( type === 'apply_now') {
            methods.get_single_apply_now(connected_db, user, data, "public", "perfect", f_cb, function (doc) {
                report_first.blog_id = doc.blog_id;
                methods.insert_report(connected_db, report_first, report_second, f_cb, s_cb);
            });
        } else if ( type === 'hire_me') {
            methods.get_single_hire_me(connected_db, user, data, "public", "perfect", f_cb, function (doc) {
                report_first.blog_id = doc.blog_id;
                methods.insert_report(connected_db, report_first, report_second, f_cb, s_cb);
            });
        } else if ( type === 'agenda') {
            methods.get_single_agenda(connected_db, user, data, "public", "perfect", f_cb, function (doc) {
                report_first.blog_id = doc.blog_id;
                methods.insert_report(connected_db, report_first, report_second, f_cb, s_cb);
            });
        } else if ( type === 'opinion' ) {
            methods.get_single_opinion(connected_db, user, data, "public", "perfect", f_cb, function (doc) {
                report_first.blog_id = doc.blog_id;
                methods.insert_report(connected_db, report_first, report_second, f_cb, s_cb);
            });
        } else if (
            type === 'tr_agenda' ||
            type === 'tr_opinion'
        ) {
            methods.get_single_translation(connected_db, user, data, "public", "perfect", f_cb, function (doc) {
                report_first.blog_id = doc.blog_id;
                methods.insert_report(connected_db, report_first, report_second, f_cb, s_cb);
            });
        } else if ( type === 'blog' ) {
            methods.get_single_blog(connected_db, user, data, "perfect", f_cb, function (doc) {
                report_first.blog_id = doc.blog_id;
                methods.insert_report(connected_db, report_first, report_second, f_cb, s_cb);
            });
        } else if ( type === 'gallery' ) {
            methods.get_single_gallery(connected_db, user, data, "perfect", f_cb, function (doc) {
                report_first.blog_id = doc.blog_id;
                methods.insert_report(connected_db, report_first, report_second, f_cb, s_cb);
            });
        } else if ( type === 'comment' ) {
            methods.get_single_article_comment(connected_db, data, f_cb, function (doc) {
                report_first.blog_id = doc.blog_id;
                methods.insert_report(connected_db, report_first, report_second, f_cb, s_cb);
            });
        } else if ( type === 'message' ) {
            if (user.blog_id !== data.to_blog_id) {
                return f_cb(null);
            }
            methods.get_single_message(connected_db, data, f_cb, function (doc) {
                report_first.blog_id = doc.from_blog_id; /* report db의 blog_id는 작성자임 */
                methods.insert_report(connected_db, report_first, report_second, f_cb, s_cb);
            });
        }
    });
});
app.get('*', function(req, res){
    return res.redirect(301, '/error/404');
});

server.listen(port, function () {console.log('Listening on ' + server.address().port);});
console.log(clc.green.bold("\n\n\n****************************************************************************************"));
console.log(clc.green.bold("**************** [Gleant] Work Work Work! [" + methods.to_i18n_utc_fixed_datetime({lang: "ko", datetime: new Date()}) + "] ****************"));
console.log(clc.green.bold("****************************************************************************************"));
console.dir(methods.get_original_chosung_jamo("Hello! This is Pyong-Hwa Baek. Gleant에 오신 것을 환영합니다!"));
console.dir(methods.get_original_chosung_jamo("没有意见i-pod。~!@#$%^&*()_+<>?,./123456"));
console.dir(methods.get_original_chosung_jamo("This is Pyong-Hwa Baek. Nice to meet you! i-pod。~!@#$%^&*()_+<>?,./123456"));
console.dir(methods.get_original_chosung_jamo("東京スカイツリーi-pod。 백병화입니다~!@#$%^&*()_+<>?,./123456"));
console.dir(methods.get_original_chosung_jamo("안녕하세요. 백병화입니다. 반갑습니다!i-pod。~!@#$%^&*()_+<>?,./123456"));