const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const string_decoder = require('string_decoder');

const nodemailer = require('nodemailer');
const ses = require('nodemailer-ses-transport');
const smtp = require('nodemailer-smtp-transport');
const _ = require('underscore');

const limit = require('./limit').get_all();
const config = require('./env.json')[process.env.NODE_ENV || 'development'];

const randomstring = require('randomstring');
const ObjectId = require('mongodb').ObjectId;
const crypto = require('crypto');
const clc = require('cli-color');

const sharp = require('sharp');
const sanitize_html = require('sanitize-html');
const hangul = require('hangul-js');
const aws = require('aws-sdk');
const aws_config = require('./aws.json');

var transporter;
if (process.env.NODE_ENV) {
    transporter = nodemailer.createTransport(ses({
        accessKeyId: aws_config.accessKeyId,
        secretAccessKey: aws_config.secretAccessKey
    }));
} else {
    transporter = nodemailer.createTransport(smtp({
        service: 'gmail',
        auth: {
            user: '',
            pass: ''
        }
    }));
}

/* UTC Time: 2017. 07. 25 00:00:00 */
const KEYWORDS_START_DATETIME = 1500940800000;

const i18n = require('./i18n');

const url = require('url');
/* AWS 초기화 */
aws.config.update(aws_config);
const s3 = new aws.S3();
const image_size = require('image-size');

var green = clc.xterm(255).bgXterm(34);

var regex_user_agent = [
    /^facebookexternalhit/i,
    /^linkedinbot/i,
    /^twitterbot/i,
    /naverbot/i,
    /yeti/i,
    /cowbot/i
];

module.exports = {
    is_mobile: function (ua) {
        if (ua) {
            ua = ua.toLowerCase();
            return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4));
        } else {
            return false;
        }
    },
    get_es_escaped_str: function (str) {
        return str.replace(/\&/gi, '&amp;').replace(/\\/gi, '\\\\').replace(/\"/gi, '&quot;').replace(/\</gi, '&lt;').replace(/\>/gi, '&gt;');
    },
    get_es_escaped_str2: function (str) {
        return str.replace(/\\/gi, '\\\\').replace(/\"/gi, '\\\"');
    },
    get_es_escaped_str_for_search: function (str) {
        return str.replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
    },
    encode_for_url: function (str) {
        return encodeURIComponent(str).replace(/\-/gi, '%2D').replace(/\'/gi, '%27').replace(/\./gi, '%2E').replace(/\~/gi, '%7E').replace(/\!/gi, '%21').replace(/\*/gi, '%2A').replace(/\(/gi, '%28').replace(/\)/gi, '%29').replace(/\_/gi, '%5F');
    },
    /**
     * pass_obj.from, pass_obj.query
     **/
    get_search_direct_link: function (type, pass_obj) {
        var queries = "?w=" + type;
        if (pass_obj.from !== undefined) {
            queries = queries + '&f=' + pass_obj.from;
        }
        if (
            pass_obj.query === undefined ||
            pass_obj.query === ""
        ) {
            queries = queries + '&q='
        } else {
            queries = queries + '&q=' + this.encode_for_url(pass_obj.query);
        }
        return config["url"] + "/search" + queries;
    },
    /**
     * xss attack 방지 위해 html encoding해서 반환한다.
     * 참조: https://www.ibm.com/developerworks/library/se-prevent/
     * test code
     * var str = ' <>&¢£¥€§©®™"';
     * var str = "'";
     *   - &nbsp; (스페이스)
     * < - &lt;
     * > - &gt;
     * & - &amp;
     * ¢ - &cent;
     * £ - &pound;
     * ¥ - &yen;
     * € - &euro;
     * § - &sect;
     * © - &copy;
     * ® - &reg;
     * ™ - &trade;
     * " - &quot;
     * ' - &#39;
     */
    get_encoded_html_preventing_xss: function (str) {
        str = this.get_decoded_html_preventing_xss(str);
        return str.replace(/\&/gi, '&amp;')
            .replace(/\ /gi, '&nbsp;')
            .replace(/\</gi, '&lt;')
            .replace(/\>/gi, '&gt;')
            .replace(/\¢/gi, '&cent;')
            .replace(/\£/gi, '&pound;')
            .replace(/\¥/gi, '&yen;')
            .replace(/\€/gi, '&euro;')
            .replace(/\§/gi, '&sect;')
            .replace(/\©/gi, '&copy;')
            .replace(/\®/gi, '&reg;')
            .replace(/\™/gi, '&trade;')
            .replace(/\"/gi, '&quot;')
            .replace(/\'/gi, '&#39;');
    },
    /**
     * xss attack 방지 위해 html encoding한 string을 decoding 해서 반환한다.
     * 참조: https://www.ibm.com/developerworks/library/se-prevent/
     * str = ""&nbsp;&lt;&gt;&amp;&cent;&pound;&yen;&euro;&sect;&copy;&reg;&trade;"";
     * &nbsp; -  (스페이스)
     * &lt; - <
     * &gt; - >
     * &amp; - &
     * &cent; - ¢
     * &pound; - £
     * &yen; - ¥
     * &euro; - €
     * &sect; - §
     * &copy; - ©
     * &reg; - ®
     * &trade; - ™
     */
    get_decoded_html_preventing_xss: function (str) {
        return str.replace(/\&nbsp;/gi, ' ')
            .replace(/\&lt;/gi, '<')
            .replace(/\&gt;/gi, '>')
            .replace(/\&cent;/gi, '¢')
            .replace(/\&pound;/gi, '£')
            .replace(/\&yen;/gi, '¥')
            .replace(/\&euro;/gi, '€')
            .replace(/\&sect;/gi, '§')
            .replace(/\&copy;/gi, '©')
            .replace(/\&reg;/gi, '®')
            .replace(/\&trade;/gi, '™')
            .replace(/\&amp;/gi, '&')
            .replace(/\&quot;/gi, '"')
            .replace(/\&#39;/gi, "'");
    },
    get_xss_prevented_content: function (type, str) {
        var vote_objs = {};
        var $ = cheerio.load(str, {decodeEntities: false});
        $ = cheerio.load(sanitize_html($.html(), {
            allowedTags: ['strong', 'em', 'br', 'u', 'iframe', 'img'],
            allowedAttributes: {
                'iframe': ['src', 'type', 'allowfullscreen', 'data-thumbnail', 'marginwidth', 'marginheight', 'hspace', 'vspace', 'frameborder', 'scrolling', 'class', 'id', 'data-id', 'height', 'width', 'style', 'onload'],
                'img': ['data-thumbnail', 'class', 'src']
            }
        }), {decodeEntities: false});
        $("script").each(function (i, e) {
            $(e).remove();
        });
        $("iframe").each(function (i, e) {
            var src = $(e).attr('src')
                , temp2;
            if (src === undefined || src === "") {
                $(e).remove();
            } else {
                var parsed_url = url.parse(src);
                if (
                    parsed_url.host === 'localhost:3000' ||
                    parsed_url.host === 'www.gleant.com'
                ) {
                    if (
                        type === "debate" ||
                        type === "blog"
                    ) {
                        if (
                            parsed_url.pathname !== '/get/link' &&
                            parsed_url.pathname !== '/get/vote'
                        ) {
                            $(e).remove();
                        } else {
                            $(e).empty();
                            temp2 = parsed_url.query.split('&');
                            temp2 = temp2[0].split('=');
                            if (parsed_url.pathname === '/get/link') { /* 링크인 경우 */
                                if (temp2[0] === 'url') {
                                    $(e).attr('class', 'iframe-link').attr('marginwidth', '0').attr('marginheight', '0').attr('hspace', '0').attr('vspace', '0').attr('frameborder', '0').attr('scrolling', 'no').removeAttr('style').removeAttr('id').removeAttr('onload');
                                } else {
                                    $(e).remove();
                                }
                            } else { /* 투표인 경우 */
                                if (temp2[0] === 'q') {
                                    if (vote_objs[ temp2[1] ] === undefined) {
                                        $(e).attr('id', 'iframe-vote-' + temp2[1]).attr('data-id', temp2[1]).attr('class', 'iframe-vote').attr('marginwidth', '0').attr('marginheight', '0').attr('hspace', '0').attr('vspace', '0').attr('frameborder', '0').attr('scrolling', 'yes').attr('onload', 'iframe_vote_load_callback(this);');
                                        vote_objs[ temp2[1] ] = true;
                                    } else {
                                        $(e).remove();
                                    }
                                } else {
                                    $(e).remove();
                                }
                            }
                        }
                    } else {
                        $(e).remove();
                    }
                } else if (
                    parsed_url.host === 'www.youtube.com'
                ) {
                    $(e).empty().removeAttr('style').removeAttr('onload').attr('type', 'text/html').attr('frameborder', '0').attr('allowfullscreen', '').attr('class', 'youtube');
                } else {
                    $(e).remove();
                }
            }
        });
        return $.html();
    },
    is_youtube_inserted: function (str) {
        var vote_objs = {};
        var $ = cheerio.load(str, {decodeEntities: false})
            , is_youtube_inserted = false;
        $ = cheerio.load(sanitize_html($.html(), {
            allowedTags: ['strong', 'em', 'br', 'u', 'iframe', 'img'],
            allowedAttributes: {
                'iframe': ['src', 'type', 'allowfullscreen', 'data-thumbnail', 'marginwidth', 'marginheight', 'hspace', 'vspace', 'frameborder', 'scrolling', 'class', 'id', 'data-id', 'height', 'width', 'style', 'onload'],
                'img': ['data-thumbnail', 'class', 'src']
            }
        }), {decodeEntities: false});
        $("iframe").each(function (i, e) {
            var src = $(e).attr('src')
                , temp2;
            if (src === undefined || src === "") {
            } else {
                var parsed_url = url.parse(src);
                if (parsed_url.host === 'www.youtube.com') {
                    is_youtube_inserted = true;
                }
            }
        });
        return is_youtube_inserted;
    },
    get_cookie : function (cookies, cname) {
        if (cookies) {
            var name = cname + "=";
            var ca = cookies.split(';');
            for(var i = 0; i <ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length,c.length);
                }
            }
        }
        return "";
    },
    get_clear_text: function (str) {
        return str.replace( /<[^<|>]+?>/gi,' ' ).replace(/&nbsp;/g, ' ').trim().replace(/\s\s+/gi, ' ');
    },
    is_email_valid: function (email) {
        return ( /(.+)@(.+){2,}\.(.+){2,}/.test(email) );
    },
    is_password_format_valid: function (password) {
        if (password.length < 8) {
            return false;
        } else if (password.length > 50) {
            return false;
        } else if (password.search(/\d/) === -1) {
            return false;
        } else if (password.search(/[a-zA-Z]/) === -1) {
            return false;
        } else if (password.search(/[\!\@\#\$\%\^\&\*\(\)\_\+\.\,\;\:]/) === -1) {
            return false;
        }
        return true;
    },
    is_blog_id_format_valid : function (blog_id) {
        if (blog_id.length < 6) {
            return false;
        } else if (blog_id.length > 14) {
            return false;
        } else if (/^[a-z][a-z0-9]*$/.test(blog_id) === false) {
            return false;
        }
        return true;
    },
    get_all_languages: function () {
        return [
            "en"
            , "ja"
            , "ko"
            , "zh-Hans"
        ];
    },
    get_valid_language: function (lang) {
        if (
            lang !== "en" &&
            lang !== "ja" &&
            lang !== "ko" &&
            lang !== "zh-Hans"
        ) {
            lang = "en";
        }
        /*return lang;*/
        return "ko";
    },
    append_two_language_list: function (obj) {
        var language_list = ["en", "ja", "ko", "zh-Hans"]
            , str;

        for (var i = 0; i < language_list.length; i++) {
            for (var j = 0; j < language_list.length; j++) {
                if (i === j) {
                    continue;
                } else {
                    str = language_list[i] + "_" + language_list[j];
                    obj[str] = 0;
                }
            }
        }
        return obj;
    },
    is_gleantcorp: function (blog_id) {
        var gleantcorp = ["gleant", "bns1004"]
            , is_member = false;
        for (var i = 0; i < gleantcorp.length; i++) {
            if (gleantcorp[i] === blog_id) {
                is_member = true;
                break;
            }
        }
        return is_member;
    },
    get_divided_contents_for_translation_writing: function (connected_db, doc, cb) {
        if (doc === null || doc === undefined) {
            return null;
        }
        var array = [];
        array.push({ main_type: "title", sub_type: null, element: doc.title });
        var $ = cheerio.load(doc.content, {decodeEntities: false});
        var checkers = {}
            , vote_list = []
            , vote_objs = {}
            , is_original
            , blog_id = doc.blog_id
            , temp
            , first_type
            , second_type
            , _id
            , original_id;
        // randomstring.generate();
        // Object.keys(obj).length
        if (
            doc.type === 'tr_agenda' ||
            doc.type === 'tr_opinion'
        ) {
            is_original = false;
        } else {
            is_original = true;
        }
        $("iframe").each(function (i, e) {
            var src = $(e).attr('src')
                , height
                , temp2
                , random_id = randomstring.generate();
            if (src === undefined || src === "") {
                $(e).remove();
            } else {
                var parsed_url = url.parse(src);
                if (
                    parsed_url.host === 'localhost:3000' ||
                    parsed_url.host === 'www.gleant.com'
                ) {
                    if (
                        parsed_url.pathname !== '/get/link' &&
                        parsed_url.pathname !== '/get/vote'
                    ) {
                        $(e).remove();
                    } else {
                        if (parsed_url.pathname === '/get/link') { /* 링크인 경우 */
                            temp = parsed_url.query.split('&');
                            temp2 = temp[0].split('=');
                            first_type = temp2[0];
                            if (first_type === 'url') {
                                checkers[random_id] = {
                                    "sub_type": "link"
                                    , "src": src
                                };
                                $(e).after(random_id).remove();
                            } else {
                                $(e).remove();
                            }
                        } else { /* 투표인 경우 */
                            if (is_original === true) { /* agenda, opinion */
                                temp = parsed_url.query.split('&');

                                if (temp.length !== 1) {
                                    $(e).remove();
                                    return true;
                                }

                                temp2 = temp[0].split('=');

                                if (temp2.length !== 2) {
                                    $(e).remove();
                                    return true;
                                }

                                first_type = temp2[0];
                                _id = temp2[1];

                                if (
                                    first_type !== 'q'
                                ) {
                                    $(e).remove();
                                    return true;
                                }
                            } else { /* tr_agenda, tr_opinion */
                                temp = parsed_url.query.split('&amp;');

                                if (temp.length !== 2) {
                                    $(e).remove();
                                    return true;
                                }

                                temp2 = temp[1].split('=');

                                if (temp2.length !== 2) {
                                    $(e).remove();
                                    return true;
                                }

                                temp = temp[0].split('=');

                                if (temp.length !== 2) {
                                    $(e).remove();
                                    return true;
                                }

                                first_type = temp[0];
                                original_id = temp[1];
                                second_type = temp2[0];
                                _id = temp2[1];

                                if (first_type !== 'q' ||
                                    second_type !== 'tr') {
                                    $(e).remove();
                                    return true;
                                }
                            }
                            if (is_original === true) {
                                vote_list.push({ _id: _id, random_id: random_id });
                                vote_objs[_id] = random_id;
                            } else {
                                vote_list.push({ _id: _id, original_id: original_id, random_id: random_id });
                                vote_objs[_id] = random_id;
                            }

                            if ($(e).attr('height') === undefined) {
                                height = 0;
                            } else {
                                height = parseInt($(e).attr('height').replace("px", "")) + 20;
                            }

                            checkers[random_id] = {
                                "sub_type": "vote"
                                , "src": src
                                , "_id": _id
                                , "height": height
                            };

                            if (is_original === false) {
                                checkers[random_id].original_id = original_id;
                            }
                            $(e).after(random_id).remove();
                        }
                    }
                } else if (
                    parsed_url.host === 'www.youtube.com'
                ) {
                    checkers[random_id] = {
                        "sub_type": "youtube"
                        , "src": src
                        , "thumbnail": $(e).attr('data-thumbnail')
                    };
                    $(e).after(random_id).remove();
                } else {
                    $(e).remove();
                }
            }
        });

        $("img").each(function (i, e) {
            var src = $(e).attr('src')
                , random_id = randomstring.generate();
            checkers[random_id] = {
                "sub_type": "img"
                , "src": src
                , "thumbnail": $(e).attr('data-thumbnail')
            };
            $(e).after(random_id).remove();
        });

        /* vote 배열 가져오기 */
        var go = function (vote_docs) {

            if (vote_docs !== null) {
                for (var x = 0; x < vote_docs.length; x++) {
                    checkers[ vote_objs[vote_docs[x]._id] ].question = vote_docs[x].question;
                    var choice_list = [];
                    for (var y = 0; y < vote_docs[x].choice_list.length; y++) {
                        choice_list.push({_id: vote_docs[x].choice_list[y]._id, choice: vote_docs[x].choice_list[y].choice})
                    }
                    checkers[ vote_objs[vote_docs[x]._id] ].choice_list = choice_list;
                }
            }

            /* 객체에 있는 정보 배열로 옮기기 */
            var content = $.html();
            var hidden_list = [];

            for (var key in checkers) {
                checkers[key].index = content.indexOf(key);
                checkers[key].random_id = key;
                hidden_list.push(checkers[key]);
            }

            hidden_list.sort(function (a, b) {
                return a.index < b.index ? -1: 1;
            });

            var divided_content
                , remained_content = content
                , splitted;

            for (var i = 0; i < hidden_list.length; i++) {
                splitted = remained_content.split(hidden_list[i].random_id);
                if (splitted.length === 1) {
                    continue;
                }
                divided_content = sanitize_html(splitted[0], {allowedTags: ['strong', 'em', 'br', 'u']});
                array.push({ main_type: "content", sub_type: "text", element: divided_content.trim() });
                array.push({ main_type: "content", sub_type: hidden_list[i].sub_type, src: hidden_list[i].src, _id: hidden_list[i]._id, original_id: hidden_list[i].original_id, thumbnail: hidden_list[i].thumbnail, question: hidden_list[i].question, choice_list: hidden_list[i].choice_list, height: hidden_list[i].height });
                remained_content = splitted[1];
            }

            divided_content = sanitize_html(remained_content, {allowedTags: ['strong', 'em', 'br', 'u']});
            array.push({ main_type: "content", sub_type: "text", element: divided_content.trim() });

            var tags = "";
            for (var i = 0; i < doc.tags.length; i++) {
                tags = tags + "#" + doc.tags[i];
            }
            array.push({ main_type: "tags", sub_type: null, element: tags });
            cb(array);
        };

        if (vote_list.length > 0) {
            var first = {};
            first["$or"] = [];
            for (var j = 0; j < vote_list.length; j++) {
                if (is_original === true) {
                    first["$or"].push({ _id: vote_list[j]._id });
                } else {
                    first["$or"].push({
                        _id: vote_list[j]._id
                        , original_id: vote_list[j].original_id
                        , blog_id: blog_id
                    });
                }
            }

            var collection;

            if (is_original === true) {
                collection = 'votes';
            } else {
                collection = 'translated_votes';
            }

            connected_db.collection(collection).find(first).toArray(function(err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return go(null);
                    } else {
                        return go(docs);
                    }
                } else {
                    return go(null);
                }
            });
        } else {
            return go(null);
        }
    },
    convert_to_two_digits : function (number) {
        return number < 10 ? "0" + number : "" + number;
    },
    is_language_corret: function (lang) {
        if (
            lang !== "en" &&
            lang !== "ja" &&
            lang !== "ko" &&
            lang !== "zh-Hans"
        ) {
            return false;
        } else {
            return true;
        }
    },
    get_language_text: function (lang) {
        if (lang === "en") {
            return "english";
        } else if (lang === "ja") {
            return "japanese";
        } else if (lang === "ko") {
            return "korean";
        } else if (lang === "zh-Hans") {
            return "simplified_chinese";
        } else {
            return "english";
        }
    },
    /**
     * obj - 객체
     * obj.lang - en || ja || ko || zh-Hans
     * obj.type
     * year
     * month
     * date
     * weekday - Eg. 월요일 등
     * years
     * weeks
     * days
     * hours
     * minutes
     * seconds
     * ago
     * deadline
     * obj.number - 숫자
     * 주의할 점은 type이 month일 때 범위는 0~11이다.
     **/
    get_i18n_time_text : function (obj) {
        var lang = obj.lang
            , type = obj.type
            , number = obj.number;
        if (lang === undefined) {
            lang = "en";
        }

        var i18n_time_text = {};
        i18n_time_text.en = {};
        i18n_time_text.ja = {};
        i18n_time_text.ko = {};
        i18n_time_text["zh-Hans"] = {};

        /* year */
        if (type === "year") {
            if (lang === "en") {
                return number + "";
            } else if (lang === "ja") {
                return number + "年";
            } else if (lang === "ko") {
                return number + "년";
            } else if (lang === "zh-Hans") {
                return number + "年";
            }
        }

        i18n_time_text.en.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        /* month */
        if (type === "month") {
            if (lang === "en") {
                return i18n_time_text.en.months[number];
            } else if (lang === "ja") {
                return (number + 1) + "月";
            } else if (lang === "ko") {
                return (number + 1) + "월";
            } else if (lang === "zh-Hans") {
                return (number + 1) + "月";
            }
        }

        /* date */
        if (type === "date") {
            if (lang === "en") {
                return number + "";
            } else if (lang === "ja") {
                return number + "日";
            } else if (lang === "ko") {
                return number + "일";
            } else if (lang === "zh-Hans") {
                return number + "日";
            }
        }

        /* weekday */
        i18n_time_text.en.weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        i18n_time_text.ja.weekdays = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
        i18n_time_text.ko.weekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
        i18n_time_text["zh-Hans"].weekdays = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

        if (type === "weekday") {
            return i18n_time_text[lang].weekdays[number];
        }

        i18n_time_text.en.year = "year";
        i18n_time_text.en.years  = "years";
        i18n_time_text.ja.years = "年";
        i18n_time_text.ko.years = "년";
        i18n_time_text["zh-Hans"].years = "年";
        if (type === "years") {
            if (lang === 'en') {
                if (number > 1) {
                    return number + " " + i18n_time_text[lang].years;
                } else {
                    return number + " " + i18n_time_text[lang].year;
                }
            } else {
                return number + i18n_time_text[lang].years;
            }
        }
        i18n_time_text.en.week = "week";
        i18n_time_text.en.weeks  = "weeks";
        i18n_time_text.ja.weeks = "週間";
        i18n_time_text.ko.weeks = "주";
        i18n_time_text["zh-Hans"].weeks = "周";
        if (type === "weeks") {
            if (lang === 'en') {
                if (number > 1) {
                    return number + " " + i18n_time_text[lang].weeks;
                } else {
                    return number + " " + i18n_time_text[lang].week;
                }
            } else {
                return number + i18n_time_text[lang].weeks;
            }
        }
        i18n_time_text.en.day = "day";
        i18n_time_text.en.days  = "days";
        i18n_time_text.ja.days = "日";
        i18n_time_text.ko.days = "일";
        i18n_time_text["zh-Hans"].days = "天";
        if (type === "days") {
            if (lang === 'en') {
                if (number > 1) {
                    return number + " " + i18n_time_text[lang].days;
                } else {
                    return number + " " + i18n_time_text[lang].day;
                }
            } else {
                return number + i18n_time_text[lang].days;
            }
        }
        i18n_time_text.en.hour = "hour";
        i18n_time_text.en.hours = "hours";
        i18n_time_text.ja.hours = "時間";
        i18n_time_text.ko.hours = "시간";
        i18n_time_text["zh-Hans"].hours = "小时";
        if (type === "hours") {
            if (lang === 'en') {
                if (number > 1) {
                    return number + " " + i18n_time_text[lang].hours;
                } else {
                    return number + " " + i18n_time_text[lang].hour;
                }
            } else {
                return number + i18n_time_text[lang].hours;
            }
        }
        i18n_time_text.en.minute = "minute";
        i18n_time_text.en.minutes = "minutes";
        i18n_time_text.ja.minutes = "分";
        i18n_time_text.ko.minutes = "분";
        i18n_time_text["zh-Hans"].minutes = "分";
        if (type === "minutes") {
            if (lang === 'en') {
                if (number > 1) {
                    return number + " " + i18n_time_text[lang].minutes;
                } else {
                    return number + " " + i18n_time_text[lang].minute;
                }
            } else {
                return number + i18n_time_text[lang].minutes;
            }
        }
        i18n_time_text.en.second = "second";
        i18n_time_text.en.seconds = "seconds";
        i18n_time_text.ja.seconds = "秒";
        i18n_time_text.ko.seconds = "초";
        i18n_time_text["zh-Hans"].seconds = "秒";
        if (type === "seconds") {
            if (lang === 'en') {
                if (number > 1) {
                    return number + " " + i18n_time_text[lang].seconds;
                } else {
                    return number + " " + i18n_time_text[lang].second;
                }
            } else {
                return number + i18n_time_text[lang].seconds;
            }
        }
    },

    /**
     * obj - 객체
     * obj.lang - en || ja || ko || zh-Hans
     * obj.year
     * obj.month
     * obj.date
     * 주의할 점: 들어오는 month는 0 ~ 11.
     **/
    get_i18n_year_month_date: function (obj) {
        var lang = obj.lang;
        if (lang === undefined) {
            lang = "en";
        }

        var year = this.get_i18n_time_text({lang: lang, type: "year", number: obj.year})
            , month = this.get_i18n_time_text({lang: lang, type: "month", number: obj.month})
            , date = this.get_i18n_time_text({lang: lang, type: "date", number: obj.date});

        if (lang === "en") {
            return date + " " +  month + " " + year;
        } else if (lang === "ja") {
            return year + month + date;
        } else if (lang === "ko") {
            return year + " " + month + " " + date;
        } else if (lang === "zh-Hans") {
            return year + month + date;
        } else {
            return date + " " +  month + " " + year;
        }
    },
    /**
     * @param obj
     * @param obj.lang - "en" || "ja" || "ko" || "zh-Hans"
     * @param obj.datetime - new Date()
     * @returns {string|*}
     */
    to_i18n_utc_fixed_datetime : function (obj) {
        var datetime = obj.datetime;
        var lang = obj.lang;
        if (datetime === undefined) {
            datetime = new Date();
        }
        if (lang === undefined) {
            lang = "en";
        }
        var year_month_date = this.get_i18n_year_month_date({lang: lang, year: datetime.getUTCFullYear(), month: datetime.getUTCMonth(), date: datetime.getUTCDate()})
            , weekday = this.get_i18n_time_text({lang: lang, type: "weekday", number: datetime.getUTCDay()})
            , hours_minutes_seconds =  this.convert_to_two_digits(datetime.getUTCHours()) + ":" + this.convert_to_two_digits(datetime.getUTCMinutes()) + ":" + this.convert_to_two_digits(datetime.getUTCSeconds());

        if (lang === "en") {
            final = weekday + ", " +  year_month_date + ", " + hours_minutes_seconds;
        } else if (lang === "ja") {
            final = year_month_date + " " + weekday + " " + hours_minutes_seconds;
        } else if (lang === "ko") {
            final = year_month_date + " " + weekday + " " + hours_minutes_seconds;
        } else if (lang === "zh-Hans") {
            final = year_month_date + " " + weekday + " " + hours_minutes_seconds;
        } else {
            final = weekday + ", " +  year_month_date + ", " + hours_minutes_seconds;
        }
        final = final + " (" + i18n[lang].utc + ")";
        return final;
    },
    to_eight_digits_date : function (date) {
        var now;
        if (date === null || date === undefined) {
            now = new Date();
        } else {
            now = date;
        }
        return parseInt(now.getUTCFullYear() + this.convert_to_two_digits(now.getUTCMonth() + 1) + this.convert_to_two_digits(now.getUTCDate()));
        // var tz = now.getTime() + ( now.getTimezoneOffset() * 60000 ) + (9 * 3600000);
        // now.setTime(tz);
        // return parseInt(now.getFullYear() + this.convert_to_two_digits(now.getMonth() + 1) + this.convert_to_two_digits(now.getDate()));
    },
    put_comma_between_three_digits: function (num) {
        try {
            var str = num + "";
            var counter = 1;
            var temp = "";
            var final = "";

            var array = str.split('.');
            str = array[0];

            for (var i=(str.length-1); i >= 0; i--){
                temp = temp + str[i];
                if (counter === 3) {
                    temp = temp + ',';
                    counter = 0;
                }
                counter++;
            }
            for (var i=(temp.length-1); i>=0; i--){
                if (temp.length % 4 === 0 && i === (temp.length - 1)) {
                    continue;
                }
                final = final + temp[i];
            }
            if (array[1] !== undefined) {
                final = final + "." + array[1];
            }
            return final;
        } catch (e) {
            if (num === undefined || num === null || num === "") {
                return 0;
            } else {
                return num;
            }
        }
    },
    get_original_chosung_jamo: function (original) {
        var jamo = hangul.disassemble(original);
        jamo = jamo.join("");

        function get_chosung_of_korean (rChar) {
            var rCho = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
            var rJung = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
            var rJong = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
            var cho, jung, jong;

            if (hangul.isComplete(rChar) === true) {
                var nTmp=rChar.charCodeAt(0) - 0xAC00;
                jong=nTmp % 28; // 종성
                jung=( Math.floor(nTmp-jong)/28 ) % 21; // 중성
                cho= Math.floor( ( Math.floor((nTmp-jong)/28) - jung ) / 21); // 종성
                return rCho[cho];
            } else {
                if (
                    rCho.includes(rChar) === false &&
                    rJung.includes(rChar) === false &&
                    rJong.includes(rChar) === false
                ) {
                    return rChar;
                } else {
                    if (rJung.includes(rChar) === false) {
                        return rChar;
                    } else {
                        return "";
                    }
                }
            }
        }
        var chosung = "";
        for (var i = 0; i < original.length; i++) {
            chosung = chosung + get_chosung_of_korean(original[i]);
        }
        return {
            original: original,
            chosung: chosung,
            jamo: jamo
        };
    },
    get_es_user_object: function (doc) {
        var temp
            , temp2
            , simple_career
            , employment = []
            , education = []
            , prize = []
            , location = []
            , website = []
            , weighting
            , interesting_tags = ""
            , available_languages = "";
        /* Set simple_career */
        temp = doc.simple_career.replace(/&nbsp;/g, ' ').replace(/\s\s+/gi, ' ').trim();
        if (
            temp === "" ||
            temp.length === 0
        ) {
            simple_career = "";
        } else {
            temp = doc.simple_career.split(",");
            simple_career = [];
            for (var i = 0; i < temp.length; i++ ) {
                temp2 = temp[i].split("、");
                for (var j = 0; j < temp2.length; j++) {
                    simple_career.push( temp2[j].replace(/&nbsp;/g, ' ').replace(/\s\s+/gi, ' ').trim());
                }
            }
        }
        /* Set employment */
        if (doc.employment.length > 0) {
            for (var i = 0; i < doc.employment.length; i++) {
                employment.push({
                    position: doc.employment[i].position
                    , company: doc.employment[i].company
                    , start_year: doc.employment[i].start_year
                    , start_month: doc.employment[i].start_month
                    , start_day: doc.employment[i].start_day
                    , end_year: doc.employment[i].end_year
                    , end_month: doc.employment[i].end_month
                    , end_day: doc.employment[i].end_day
                    , ing: doc.employment[i].ing
                });
            }
        }
        /* Set education */
        if (doc.education.length > 0) {
            for (var i = 0; i < doc.education.length; i++) {
                education.push({
                    school: doc.education[i].school
                    , major: doc.education[i].major
                    , minor: doc.education[i].minor
                    , degree: doc.education[i].degree
                    , start_year: doc.education[i].start_year
                    , start_month: doc.education[i].start_month
                    , start_day: doc.education[i].start_day
                    , end_year: doc.education[i].end_year
                    , end_month: doc.education[i].end_month
                    , end_day: doc.education[i].end_day
                    , ing: doc.education[i].ing
                });
            }
        }
        /* Set prize */
        if (doc.prize.length > 0) {
            for (var i = 0; i < doc.prize.length; i++) {
                prize.push({
                    item: doc.prize[i].item
                    , received_year: doc.prize[i].received_year
                    , received_month: doc.prize[i].received_month
                    , received_day: doc.prize[i].received_day
                });
            }
        }
        /* Set location */
        if (doc.location.length > 0) {
            for (var i = 0; i < doc.location.length; i++) {
                location.push({
                    country: doc.location[i].country
                    , city: doc.location[i].city
                    , start_year: doc.location[i].start_year
                    , start_month: doc.location[i].start_month
                    , start_day: doc.location[i].start_day
                    , end_year: doc.location[i].end_year
                    , end_month: doc.location[i].end_month
                    , end_day: doc.location[i].end_day
                    , ing: doc.location[i].ing
                });
            }
        }
        /* Set website */
        if (doc.website.length > 0) {
            for (var i = 0; i < doc.website.length; i++) {
                website.push({
                    link: doc.website[i].protocol + "://" + doc.website[i].url
                    , title: doc.website[i].title
                });
            }
        }
        /* Set interesting_tags */
        if (doc.interesting_tags.length > 0) {
            interesting_tags = doc.interesting_tags;
        }
        /* Set available_languages */
        if (doc.available_languages.length > 0) {
            available_languages = doc.available_languages;
        }
        /* Weighting */
        if (doc.verified_profile === "") {
            weighting = 0;
        } else {
            weighting = 1;
        }
        return {
            name: doc.name
            , birth_year: doc.birth_year
            , birth_month: doc.birth_month
            , birth_day: doc.birth_day
            , sex: doc.sex
            , iq: doc.iq
            , eq: doc.eq
            , blog_id: doc.blog_id
            , blog_name: doc.blog_name
            , img: doc.img
            , verified_profile: doc.verified_profile
            , simple_career: simple_career
            , employment: employment
            , education: education
            , prize: prize
            , location: location
            , website: website
            , interesting_tags: interesting_tags
            , main_language: doc.main_language
            , available_languages: available_languages
            , count_awesome: doc.count_awesome
            , public_authority: doc.public_authority
            , weighting: weighting
            , created_at: doc.created_at
            , updated_at: doc.updated_at
        };
    },
    get_es_news_object: function (doc) {
        var tags = doc.tags
            , img
            , content;
        if (doc.type === "clipping") {
            content = this.get_es_escaped_str_for_search(this.get_clear_text(sanitize_html(doc.content)));
            img = doc.img;
        } else {
            content = "";
            img = "";
        }
        if (tags.length === 0) {
            tags = "";
        }
        return {
            article_id: doc._id
            , type: doc.type
            , language: doc.language
            , category: doc.category
            , site: doc.site
            , img: img
            , link: doc.link
            , title: doc.title
            , content: content
            , tags: tags
            , created_at: doc.created_at
            , updated_at: doc.updated_at
        };
    },
    /**
     * doc.url 같은 경우, xss_preventing 해줘야할지 고민하기..
     * @param doc
     * @returns {{article_id, type, language, name, blog_id, img, company, logo: (*|string|string|string|string), business_type: (*|string|string|string|string), country, city, protocol, url, job, employment_status, decide_salary_later: string, salary_period: (*|string), salary, salary_unit: (*|string), title, content: *, tags, public_authority, created_at, updated_at, date}}
     */
    get_es_apply_now_object: function (doc) {
        var tags = doc.tags
            , content = this.get_es_escaped_str_for_search(this.get_clear_text(sanitize_html(doc.content)))
            , decide_salary_later = doc.decide_salary_later + ""
            , is_youtube_inserted = 0;
        if (tags.length === 0) {
            tags = "";
        }
        if (doc.is_youtube_inserted === true) {
            is_youtube_inserted = 1;
        }
        return {
            article_id: doc._id
            , type: doc.type
            , language: doc.language
            , name: doc.name
            , blog_id: doc.blog_id
            , img: doc.img
            , company: doc.company
            , logo: doc.logo
            , business_type: doc.business_type
            , country: doc.country
            , city: doc.city
            , protocol: doc.protocol
            , url: doc.url
            , job: doc.job
            , employment_status: doc.employment_status
            , decide_salary_later: decide_salary_later
            , salary_period: doc.salary_period
            , salary: doc.salary
            , salary_unit: doc.salary_unit
            , title: doc.title
            , content: content
            , tags: tags
            , is_youtube_inserted: is_youtube_inserted
            , public_authority: doc.public_authority
            , created_at: doc.created_at
            , updated_at: doc.updated_at
            , date: doc.date
        };
    },
    get_es_hire_me_object: function (doc) {
        var tags = doc.tags
            , content = this.get_es_escaped_str_for_search(this.get_clear_text(sanitize_html(doc.content)))
            , decide_salary_later = doc.decide_salary_later + ""
            , is_youtube_inserted = 0;
        if (tags.length === 0) {
            tags = "";
        }
        if (doc.is_youtube_inserted === true) {
            is_youtube_inserted = 1;
        }
        return {
            article_id: doc._id
            , type: doc.type
            , language: doc.language
            , name: doc.name
            , blog_id: doc.blog_id
            , img: doc.img
            , job: doc.job
            , employment_status: doc.employment_status
            , decide_salary_later: decide_salary_later
            , salary_period: doc.salary_period
            , salary: doc.salary
            , salary_unit: doc.salary_unit
            , title: doc.title
            , content: content
            , tags: tags
            , is_youtube_inserted: is_youtube_inserted
            , public_authority: doc.public_authority
            , created_at: doc.created_at
            , updated_at: doc.updated_at
            , date: doc.date
        };
    },
    get_es_agenda_object: function (doc) {
        var tags = doc.tags;
        var img_list = doc.img_list;
        var content = this.get_es_escaped_str_for_search(this.get_clear_text(sanitize_html(doc.content)))
            , is_youtube_inserted = 0;

        if (tags.length === 0) {
            tags = "";
        }
        if (img_list.length === 0) {
            img_list = "";
        }
        if (doc.is_youtube_inserted === true) {
            is_youtube_inserted = 1;
        }
        return {
            article_id: doc._id
            , type: doc.type
            , language: doc.language
            , name: doc.name
            , blog_id: doc.blog_id
            , img: doc.img
            , main_tag: doc.main_tag
            , tags: tags
            , title: doc.title
            , content: content
            , img_list: img_list
            , is_youtube_inserted: is_youtube_inserted
            , public_authority: doc.public_authority
            , created_at: doc.created_at
            , updated_at: doc.updated_at
            , date: doc.date
        };
    },
    get_es_opinion_object: function (doc) {
        var tags = doc.tags;
        var img_list = doc.img_list;
        var content = this.get_es_escaped_str_for_search(this.get_clear_text(sanitize_html(doc.content)))
            , is_youtube_inserted = 0;

        if (tags.length === 0) {
            tags = "";
        }
        if (img_list.length === 0) {
            img_list = "";
        }
        if (doc.is_youtube_inserted === true) {
            is_youtube_inserted = 1;
        }
        return {
            article_id: doc._id
            , type: doc.type
            , language: doc.language
            , agenda_id: doc.agenda_id
            , name: doc.name
            , blog_id: doc.blog_id
            , img: doc.img
            , main_tag: doc.main_tag
            , tags: tags
            , title: doc.title
            , content: content
            , img_list: img_list
            , is_youtube_inserted: is_youtube_inserted
            , public_authority: doc.public_authority
            , created_at: doc.created_at
            , updated_at: doc.updated_at
            , date: doc.date
        };
    },
    get_es_website_object: function (doc) {
        var tags = doc.tags;
        var content = this.get_es_escaped_str_for_search(this.get_clear_text(sanitize_html(doc.content)));
        if (tags.length === 0) {
            tags = "";
        }
        return {
            article_id: doc._id
            , language: doc.language
            , title: doc.title
            , content: content
            , link: doc.link
            , tags: tags
        };
    },
    get_es_blog_object: function (doc) {
        var tags = doc.tags;
        var img_list = doc.img_list;
        var content = this.get_es_escaped_str_for_search(this.get_clear_text(sanitize_html(doc.content)))
            , is_youtube_inserted = 0;

        if (tags.length === 0) {
            tags = "";
        }
        if (img_list.length === 0) {
            img_list = "";
        }
        if (doc.is_youtube_inserted === true) {
            is_youtube_inserted = 1;
        }

        return {
            article_id: doc._id
            , type: doc.type
            , language: doc.language
            , blog_menu_id: doc.blog_menu_id
            , blog_name: doc.blog_name
            , blog_id: doc.blog_id
            , img: doc.img
            , tags: tags
            , title: doc.title
            , content: content
            , img_list: img_list
            , is_youtube_inserted: is_youtube_inserted
            , public_authority: doc.public_authority
            , created_at: doc.created_at
            , updated_at: doc.updated_at
            , date: doc.date
        };
    },
    get_es_gallery_object: function (doc) {
        var tags = doc.tags;
        var content = this.get_clear_text(sanitize_html(doc.content));

        if (tags.length === 0) {
            tags = "";
        }

        return {
            article_id: doc._id
            , type: doc.type
            , language: doc.language
            , blog_name: doc.blog_name
            , blog_id: doc.blog_id
            , img: doc.img
            , thumbnail: doc.thumbnail
            , tags: tags
            , title: doc.title
            , content: content
            , public_authority: doc.public_authority
            , created_at: doc.created_at
            , updated_at: doc.updated_at
            , date: doc.date
        };
    },
    get_es_tr_agenda_object: function (doc) {
        var tags = doc.tags;
        var img_list = doc.img_list;
        var content = this.get_es_escaped_str_for_search(this.get_clear_text(sanitize_html(doc.content)))
            , is_youtube_inserted = 0;

        if (tags.length === 0) {
            tags = "";
        }
        if (img_list.length === 0) {
            img_list = "";
        }
        if (doc.is_youtube_inserted === true) {
            is_youtube_inserted = 1;
        }

        return {
            article_id: doc._id
            , type: doc.type
            , language: doc.language
            , agenda_id: doc.agenda_id
            , name: doc.name
            , blog_id: doc.blog_id
            , img: doc.img
            , main_tag: doc.main_tag
            , tags: tags
            , title: doc.title
            , content: content
            , img_list: img_list
            , is_youtube_inserted: is_youtube_inserted
            , public_authority: doc.public_authority
            , created_at: doc.created_at
            , updated_at: doc.updated_at
            , date: doc.date
        };
    },
    get_es_tr_opinion_object: function (doc) {
        var tags = doc.tags;
        var img_list = doc.img_list;
        var content = this.get_es_escaped_str_for_search(this.get_clear_text(sanitize_html(doc.content)))
            , is_youtube_inserted = 0;

        if (tags.length === 0) {
            tags = "";
        }
        if (img_list.length === 0) {
            img_list = "";
        }
        if (doc.is_youtube_inserted === true) {
            is_youtube_inserted = 1;
        }

        return {
            article_id: doc._id
            , type: doc.type
            , language: doc.language
            , agenda_id: doc.agenda_id
            , opinion_id: doc.opinion_id
            , name: doc.name
            , blog_id: doc.blog_id
            , img: doc.img
            , main_tag: doc.main_tag
            , tags: tags
            , title: doc.title
            , content: content
            , img_list: img_list
            , is_youtube_inserted: is_youtube_inserted
            , public_authority: doc.public_authority
            , created_at: doc.created_at
            , updated_at: doc.updated_at
            , date: doc.date
        };
    },
    get_search_user_object1: function (lang, doc) {
        var company
            , education
            , simple_career
            , date
            , search_user_name
            , search_user_birth
            , search_iq_eq_label
            , search_iq_eq_value
            , search_user_iq_eq
            , search_user_occupation
            , search_user_career_list = ""
            , search_user_career
            , search_user_education_list = ""
            , search_user_education
            , employment_content
            , education_content
            , search_user_blog
            , search_user_site_list = ""
            , search_user_site
            , search_user_item_left
            , search_user_item_right
            , search_user_item_inner;
        if (doc.verified_profile === "") {
            search_user_name = "<div class='search-user-name'><a href='/blog/" + doc.blog_id + "' target='_blank'>" + this.get_encoded_html_preventing_xss(doc.name) + "</a></div>";
        } else {
            search_user_name = "<div class='search-user-name'><a href='/blog/" + doc.blog_id + "' target='_blank'>" + this.get_encoded_html_preventing_xss(doc.name) + "<span class='user-verified-profile'>(" + this.get_encoded_html_preventing_xss(doc.verified_profile) + ")</span>" + "</a></div>";
        }
        search_user_birth = "<div><div class='search-user-item-left-row'><div class='search-user-item-left-row-label'>" + i18n[lang].birth_date + "</div><div class='search-user-item-left-row-content search-user-birth-date' data-year='" + doc.birth_year + "' data-month='" + (doc.birth_month - 1) + "' data-date='" + doc.birth_day + "'></div></div></div>";
        if ( parseInt(doc.iq) > 0) {
            if ( parseInt(doc.eq) > 0) {
                search_iq_eq_label = "IQ &#183; EQ";
                search_iq_eq_value = doc.iq + " &#183; " + doc.eq;
            } else {
                search_iq_eq_label = "IQ";
                search_iq_eq_value = doc.iq;
            }
            search_user_iq_eq = "<div class='search-user-iq-eq'><div class='search-user-item-left-row'><div class='search-user-item-left-row-label'>" + search_iq_eq_label + "</div><div class='search-user-item-left-row-content'>" + search_iq_eq_value + "</div></div></div>";
        } else {
            if ( parseInt(doc.eq) > 0) {
                search_iq_eq_label = "EQ";
                search_iq_eq_value = doc.eq;
                search_user_iq_eq = "<div class='search-user-iq-eq'><div class='search-user-item-left-row'><div class='search-user-item-left-row-label'>" + search_iq_eq_label + "</div><div class='search-user-item-left-row-content'>" + search_iq_eq_value + "</div></div></div>";
            } else {
                search_user_iq_eq = "";
            }
        }
        if (doc.simple_career === "") {
            search_user_occupation = "";
        } else {
            simple_career = doc.simple_career[0];
            if (doc.simple_career.length > 1) {
                for (var j = 1; j < doc.simple_career.length; j++) {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        simple_career = simple_career + ", " + doc.simple_career[j];
                    } else {
                        simple_career = simple_career + "、" + doc.simple_career[j];
                    }
                }
            }
            search_user_occupation = "<div class='search-user-occupation'><div class='search-user-item-left-row'><div class='search-user-item-left-row-label'>" + i18n[lang].occupation + "</div><div class='search-user-item-left-row-content'>" + this.get_encoded_html_preventing_xss(simple_career) + "</div></div></div>";
        }
        /* Employment */
        if (doc.employment.length > 0) {
            search_user_career_list = "";
            for (var j = 0; j < doc.employment.length; j++) {
                company = "";
                if (doc.employment[j]["company"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        company = company + doc.employment[j]["company"] + " ";
                    } else {
                        company = company + doc.employment[j]["company"];
                    }
                }
                company = company + doc.employment[j]["position"];
                date = "";
                if (doc.employment[j]["start_year"] !== 0) {
                    if (doc.employment[j]["start_month"] !== 0) {
                        if (doc.employment[j]["start_day"] !== 0) {
                            date = doc.employment[j]["start_year"] + "." + this.convert_to_two_digits(doc.employment[j]["start_month"]) + "." + this.convert_to_two_digits(doc.employment[j]["start_day"]);
                        } else {
                            date = doc.employment[j]["start_year"] + "." + this.convert_to_two_digits(doc.employment[j]["start_month"]);
                        }
                    } else {
                        date = doc.employment[j]["start_year"];
                    }
                }

                if (doc.employment[j]["ing"] === 1) {
                    date = date + " ~ " + i18n[lang].now + " ";
                } else {
                    if (doc.employment[j]["end_year"] !== 0) {
                        date = date + " ~ ";
                        if (doc.employment[j]["end_month"] !== 0) {
                            if (doc.employment[j]["end_day"] !== 0) {
                                date = date + doc.employment[j]["end_year"] + "." + this.convert_to_two_digits(doc.employment[j]["end_month"]) + "." + this.convert_to_two_digits(doc.employment[j]["end_day"]);
                            } else {
                                date = date + doc.employment[j]["end_year"] + "." + this.convert_to_two_digits(doc.employment[j]["end_month"]);
                            }
                        } else {
                            date = date + doc.employment[j]["end_year"];
                        }
                        date = date + " ";
                    } else {
                        if (date !== "") {
                            date = date + " ~ ";
                        }
                    }
                }
                if (date === "") {
                    employment_content = "<div>" + this.get_encoded_html_preventing_xss(company) + "</div>";
                } else {
                    employment_content = "<div>" + date + this.get_encoded_html_preventing_xss(company) + "</div>";
                }
                search_user_career_list = search_user_career_list + employment_content;
            }
            search_user_career = "<div class='search-user-career'><div class='search-user-item-left-row'><div class='search-user-item-left-row-label'>" + i18n[lang].career + "</div><div class='search-user-item-left-row-content'>" + search_user_career_list + "</div></div></div>";
        } else {
            search_user_career = "";
        }

        /* Education */
        if (doc.education.length > 0) {
            search_user_education_list = "";
            for (var j = 0; j < doc.education.length; j++) {
                education = doc.education[j]["school"];
                if (doc.education[j]["major"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        education = education + " " + doc.education[j]["major"];
                    } else {
                        education = education + doc.education[j]["major"];
                    }
                }
                if (doc.education[j]["minor"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        education = education + " " + doc.education[j]["minor"];
                    } else {
                        education = education + doc.education[j]["minor"];
                    }
                }
                if (doc.education[j]["degree"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        education = education + " " + doc.education[j]["degree"];
                    } else {
                        education = education + doc.education[j]["degree"];
                    }
                }

                date = "";
                if (doc.education[j]["start_year"] !== 0) {
                    if (doc.education[j]["start_month"] !== 0) {
                        if (doc.education[j]["start_day"] !== 0) {
                            date = doc.education[j]["start_year"] + "." + this.convert_to_two_digits(doc.education[j]["start_month"]) + "." + this.convert_to_two_digits(doc.education[j]["start_day"]);
                        } else {
                            date = doc.education[j]["start_year"] + "." + this.convert_to_two_digits(doc.education[j]["start_month"]);
                        }
                    } else {
                        date = doc.education[j]["start_year"];
                    }
                }

                if (doc.education[j]["ing"] === 1) {
                    date = date + " ~ " + i18n[lang].now + " ";
                } else {
                    if (doc.education[j]["end_year"] !== 0) {
                        date = date + " ~ ";
                        if (doc.education[j]["end_month"] !== 0) {
                            if (doc.education[j]["end_day"] !== 0) {
                                date = date + doc.education[j]["end_year"] + "." + this.convert_to_two_digits(doc.education[j]["end_month"]) + "." + this.convert_to_two_digits(doc.education[j]["end_day"]);
                            } else {
                                date = date + doc.education[j]["end_year"] + "." + this.convert_to_two_digits(doc.education[j]["end_month"]);
                            }
                        } else {
                            date = date + doc.education[j]["end_year"];
                        }
                        date = date + " ";
                    } else {
                        if (date !== "") {
                            date = date + " ~ ";
                        }
                    }
                }
                if (date === "") {
                    education_content = "<div>" + this.get_encoded_html_preventing_xss(education) + "</div>";
                } else {
                    education_content = "<div>" + date + this.get_encoded_html_preventing_xss(education) + "</div>";
                }
                search_user_education_list = search_user_education_list + education_content;
            }
            search_user_education = "<div class='search-user-education'><div class='search-user-item-left-row'><div class='search-user-item-left-row-label'>" + i18n[lang].education2 + "</div><div class='search-user-item-left-row-content'>" + search_user_education_list + "</div></div></div>";
        } else {
            search_user_education = "";
        }
        search_user_blog = "<div class='search-user-blog'><div class='search-user-item-left-row'><div class='search-user-item-left-row-label'>" + i18n[lang].blog + "</div><div class='search-user-item-left-row-content'><a href='/blog/" + doc.blog_id + "' target='_blank'>" + this.get_encoded_html_preventing_xss(doc.blog_name) + "</a></div></div></div>";

        if (doc.website.length > 0) {
            search_user_site_list = "";
            for (var j=0; j < doc.website.length; j++) {
                search_user_site_list = search_user_site_list + "<a class='space-8' href='" + doc.website[j].link + "' target='_blank'>" + this.get_encoded_html_preventing_xss(doc.website[j].title) + "</a>";
            }
            search_user_site = "<div class='search-user-site'><div class='search-user-item-left-row'><div class='search-user-item-left-row-label'>" + i18n[lang].website + "</div><div class='search-user-item-left-row-content'>" + search_user_site_list + "</div></div></div>";
        } else {
            search_user_site = "";
        }
        search_user_item_left = "<div class='search-user-item-left'>" + search_user_name + search_user_birth + search_user_iq_eq + search_user_occupation + search_user_career + search_user_education + search_user_blog + search_user_site +"</div>";
        search_user_item_right = "<div class='search-user-item-right'><a href='/blog/" + doc.blog_id + "' target='_blank'><img src='" + doc.img + "'></a></div>";
        search_user_item_inner = "<div class='search-user-item-inner' data-link='/blog/" + doc.blog_id + "' data-type='user' data-updated-at='" + doc.updated_at + "'>" + search_user_item_left + search_user_item_right + "</div>";
        return "<div class='search-user-item'>" + search_user_item_inner + "</div>";
    },
    get_search_user_object2: function (lang, doc) {
        var simple_career
            , date
            , same_name_user_occupation;

        if (doc.simple_career === "") {
            same_name_user_occupation = "";
        } else {
            simple_career = doc.simple_career[0];
            if (doc.simple_career.length > 1) {
                for (var k = 1; k < doc.simple_career.length; k++) {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        simple_career = simple_career + ", " + doc.simple_career[k];
                    } else {
                        simple_career = simple_career + "、" + doc.simple_career[k];
                    }
                }
            }
            same_name_user_occupation = "<div class='same-name-user-profile'>" + simple_career + "</div>";
        }
        return "<div class='same-name-user-item'><a href='/blog/" + doc.blog_id + "' target='_blank'><img src='" + doc.img + "'></a><div class='search-user-name'><a href='/blog/" + doc.blog_id + "' target='_blank'>" + doc.name + "</a></div><div class='same-name-user-profile search-user-birth-date' data-year='" + doc.birth_year + "' data-month='" + (doc.birth_month - 1) + "' data-date='" + doc.birth_day + "'></div>" + same_name_user_occupation + "</div>";
    },
    get_search_news_object: function (doc) {
        var type = doc.type
            ,link = doc.link
            , span1
            , span2
            , a1
            , search_article_item_inner
            , search_article_item_full
            , search_article_title
            , search_article_content;
        if (doc.hi_title) {
            span1 = "<span>" + doc.hi_title + "</span>";
        } else {
            span1 = "<span>" + this.get_encoded_html_preventing_xss(doc.title) + "</span>";
        }
        a1 = "<a class='news-article' href='" + link + "'>" + span1 + "</a>";
        span2 = "<span class='news-site'>" + this.get_encoded_html_preventing_xss(doc.site) + "</span>";
        search_article_title = "<div class='search-article-title'>" + a1 + span2 + "</div>";
        search_article_item_full = "<div class='search-article-item-full'>" + search_article_title + "</div>";
        search_article_item_inner = "<div class='search-article-item-inner'>" + search_article_item_full + "</div>";
        return "<div class='search-article-item' data-print-type='search'>" + search_article_item_inner + "</div>";
    },
    get_search_debate_object: function (lang, is_loginned, doc) {
        var type = doc.type;
        var language
            , link
            , img1
            , span1
            , a1
            , search_article_item_inner
            , search_article_item_left
            , search_article_item_right
            , search_article_title
            , search_article_content
            , search_article_datetime;

        if (doc.language === "en") {
            language = "english";
        } else if (doc.language === "ja") {
            language = "japanese";
        } else if (doc.language === "ko") {
            language = "korean";
        } else if (doc.language === "zh-Hans") {
            language = "simplified_chinese";
        }
        if (type === "agenda") {
            link = "/agenda/" + doc.article_id;
        } else if (type === "tr_agenda") {
            link = "/agenda/" + doc.agenda_id + "/tr/" + doc.article_id;
        } else if (type === "opinion") {
            link = "/agenda/" + doc.agenda_id + "/opinion/" + doc.article_id;
        } else if (type === "tr_opinion") {
            link = "/agenda/" + doc.agenda_id + "/opinion/" + doc.opinion_id + "/tr/" + doc.article_id;
        }
        if (doc.img_list !== "") {
            img1 = "<img src='" + doc.img_list[0].replace("/resized/", "/thumbnail/") + "'>";
        } else {
            if (is_loginned === true) {
                img1 = "<img src='" + doc.img.replace("/resized/", "/thumbnail/") + "'>";
            } else {
                if (doc.img.indexOf( "male.png") <= -1) {
                    doc.img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                }
                doc.img = doc.img.replace("/resized/", "/thumbnail/");
                img1 = "<img src='" + doc.img + "'>";
            }
        }
        a1 = "<a href='" + link + "' target='_blank'>" + img1 + "</a>";
        search_article_item_left = "<div class='search-article-item-left'>" + a1 + "</div>";
        if (type === "agenda") {
            if (is_loginned === true) {
                span1 = "<span class='search-article-label'>" + i18n[lang].agenda + " &#183; " + doc.name + "</span>";
            } else {
                span1 = "<span class='search-article-label'>" + i18n[lang].agenda + "</span>";
            }
        } else if (type === "tr_agenda") {
            if (is_loginned === true) {
                span1 = "<span class='search-article-label'>" + i18n[lang].agenda + " &#183; " + doc.name + "</span>";
            } else {
                span1 = "<span class='search-article-label'>" + i18n[lang].agenda + "</span>";
            }
        } else if (type === "opinion") {
            if (is_loginned === true) {
                span1 = "<span class='search-article-label'>" + i18n[lang].opinion + " &#183; " + doc.name + "</span>";
            } else {
                span1 = "<span class='search-article-label'>" + i18n[lang].opinion + "</span>";
            }
        } else if (type === "tr_opinion") {
            if (is_loginned === true) {
                span1 = "<span class='search-article-label'>" + i18n[lang].opinion + " &#183; " + doc.name + "</span>";
            } else {
                span1 = "<span class='search-article-label'>" + i18n[lang].opinion + "</span>";
            }
        }
        var youtube_inserted = "";
        if (doc.is_youtube_inserted === 1) {
            youtube_inserted = "<div class='youtube-inserted'><img src='" + config.aws_s3_url + "/icons/youtube.png" + config.css_version + "' title='YouTube' alt='YouTube'></div>";
        }

        if (doc.hi_title) {
            a1 = "<a href='" + link + "' target='_blank'>" + youtube_inserted + doc.hi_title + "</a>";
        } else {
            a1 = "<a href='" + link + "' target='_blank'>" + youtube_inserted + this.get_encoded_html_preventing_xss(doc.title) + "</a>";
        }
        search_article_title = "<div class='search-article-title'>" + a1 + span1 + "</div>";

        if (doc.hi_content) {
            a1 = "<a href='" + link + "' target='_blank'>" + doc.hi_content + "</a>";
        } else {
            a1 = "<a href='" + link + "' target='_blank'>" + this.get_encoded_html_preventing_xss(doc.content) + "</a>";
        }
        search_article_content = "<div class='search-article-content'>" + a1 + "</div>";
        span1 = "<span class='created-at without-text' data-datetime='" + doc.created_at + "'>" + "</span>";
        search_article_datetime = "<div>" + span1 + "</div>";
        search_article_item_right = "<div class='search-article-item-right'>" + search_article_title + search_article_content + search_article_datetime + "</div>";
        search_article_item_inner = "<div class='search-article-item-inner'>" + search_article_item_left + search_article_item_right + "</div>";
        return "<div class='search-article-item' data-print-type='search'>" + search_article_item_inner + "</div>";
    },
    get_search_employment_object: function (lang, is_loginned, doc) {
        var type = doc.type;
        var language
            , link
            , img1
            , span1
            , a1
            , search_article_item_inner
            , search_article_item_left
            , search_article_item_right
            , search_article_title
            , search_article_content
            , search_article_datetime;

        if (doc.language === "en") {
            language = "english";
        } else if (doc.language === "ja") {
            language = "japanese";
        } else if (doc.language === "ko") {
            language = "korean";
        } else if (doc.language === "zh-Hans") {
            language = "simplified_chinese";
        }

        if (type === "apply_now") {
            link = "/apply-now/" + doc.article_id;
            img1 = "<img src='" + doc.logo + "'>";
        } else if (type === "hire_me") {
            if (is_loginned === true) {
                img1 = "<img src='" + doc.img.replace("/resized/", "/thumbnail/") + "'>";
            } else {
                if (doc.img.indexOf( "male.png") <= -1) {
                    doc.img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                }
                doc.img = doc.img.replace("/resized/", "/thumbnail/");
                img1 = "<img src='" + doc.img + "'>";
            }
            link = "/hire-me/" + doc.article_id;
        }

        a1 = "<a href='" + link + "' target='_blank'>" + img1 + "</a>";
        search_article_item_left = "<div class='search-article-item-left'>" + a1 + "</div>";

        if (type === "apply_now") {
            span1 = "<span class='search-article-label'>" + doc.company + " &#183; " + doc.job + " &#183; " + doc.country + " &#183; " + doc.city + "</span>";
        } else if (type === "hire_me") {
            if (is_loginned === true) {
                span1 = "<span class='search-article-label'>" + doc.job + " &#183; " + doc.name + "</span>";
            } else {
                span1 = "<span class='search-article-label'>" + doc.job + "</span>";
            }
        }

        var youtube_inserted = "";
        if (doc.is_youtube_inserted === 1) {
            youtube_inserted = "<div class='youtube-inserted'><img src='" + config.aws_s3_url + "/icons/youtube.png" + config.css_version + "' title='YouTube' alt='YouTube'></div>";
        }

        if (doc.hi_title) {
            a1 = "<a href='" + link + "' target='_blank'>" + youtube_inserted + doc.hi_title + "</a>";
        } else {
            a1 = "<a href='" + link + "' target='_blank'>" + youtube_inserted + this.get_encoded_html_preventing_xss(doc.title) + "</a>";
        }
        search_article_title = "<div class='search-article-title'>" + a1 + span1 + "</div>";

        if (doc.hi_content) {
            a1 = "<a href='" + link + "' target='_blank'>" + doc.hi_content + "</a>";
        } else {
            a1 = "<a href='" + link + "' target='_blank'>" + this.get_encoded_html_preventing_xss(doc.content) + "</a>";
        }
        search_article_content = "<div class='search-article-content'>" + a1 + "</div>";
        span1 = "<span class='created-at without-text' data-datetime='" + doc.created_at + "'>" + "</span>";
        search_article_datetime = "<div>" + span1 + "</div>";
        search_article_item_right = "<div class='search-article-item-right'>" + search_article_title + search_article_content + search_article_datetime + "</div>";
        search_article_item_inner = "<div class='search-article-item-inner'>" + search_article_item_left + search_article_item_right + "</div>";
        return "<div class='search-article-item' data-print-type='search'>" + search_article_item_inner + "</div>";
    },
    get_search_website_object: function (lang, doc) {
        var link = doc.link
            , img1
            , span1
            , a1
            , search_article_item_inner
            , search_article_item_full
            , search_article_title
            , search_article_content
            , search_article_link;
        if (doc.hi_title) {
            span1 = "<span>" + doc.hi_title + "</span>";
        } else {
            span1 = "<span>" + this.get_encoded_html_preventing_xss(doc.title) + "</span>";
        }
        a1 = "<a href='" + link + "' target='_blank'>" + span1 + "</a>";
        search_article_title = "<div class='search-article-title'>" + a1 +  "</div>";
        if (doc.hi_content) {
            span1 = "<span>" + doc.hi_content + "</span>";
        } else {
            span1 = "<span>" + this.get_encoded_html_preventing_xss(doc.content) + "</span>";
        }
        search_article_content = "<div class='search-article-content'>" + span1 +  "</div>";
        span1 = "<span>" + this.get_encoded_html_preventing_xss(doc.link) + "</span>";
        a1 = "<a href='" + link + "' target='_blank'>" + span1 + "</a>";
        search_article_link = "<div class='search-article-link'>" + a1 +  "</div>";

        search_article_item_full = "<div class='search-article-item-full'>" + search_article_title + search_article_content + search_article_link + "</div>";
        search_article_item_inner = "<div class='search-article-item-inner'>" + search_article_item_full +  "</div>";
        return "<div class='search-article-item' data-print='search'>" + search_article_item_inner + "</div>";
    },
    get_search_blog_object: function (lang, is_loginned, doc) {
        var type = doc.type;
        var link
            , img1
            , span1
            , a1
            , search_article_item_inner
            , search_article_item_left
            , search_article_item_right
            , search_article_title
            , search_article_content
            , search_article_datetime;
        if (type === "blog") {
            link = "/blog/" + doc.blog_id + "/" + doc.blog_menu_id + "/" + doc.article_id;
            if (doc.img_list !== "") {
                img1 = "<img src='" + doc.img_list[0].replace("/resized/", "/thumbnail/") + "'>";
            } else {
                if (is_loginned === true) {
                    img1 = "<img src='" + doc.img.replace("/resized/", "/thumbnail/") + "'>";
                } else {
                    if (doc.img.indexOf( "male.png") <= -1) {
                        doc.img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                    }
                    doc.img = doc.img.replace("/resized/", "/thumbnail/");
                    img1 = "<img src='" + doc.img + "'>";
                }
            }
        } else if (type === "gallery") {
            link = "/blog/" + doc.blog_id + "/gallery/" + doc.article_id;
            img1 = "<img src='" + doc.thumbnail + "'>";
        }
        a1 = "<a href='" + link + "' target='_blank'>" + img1 + "</a>";
        search_article_item_left = "<div class='search-article-item-left'>" + a1 + "</div>";
        if (is_loginned === true) {
            span1 = "<span class='search-article-label'>" + doc.blog_name + "</span>";
        } else {
            span1 = "";
        }
        var youtube_inserted = "";
        if (type === "blog" && doc.is_youtube_inserted === 1) {
            youtube_inserted = "<div class='youtube-inserted'><img src='" + config.aws_s3_url + "/icons/youtube.png" + config.css_version + "' title='YouTube' alt='YouTube'></div>";
        }

        if (doc.hi_title) {
            a1 = "<a href='" + link + "' target='_blank'>" + youtube_inserted + doc.hi_title + "</a>";
        } else {
            a1 = "<a href='" + link + "' target='_blank'>" + youtube_inserted + this.get_encoded_html_preventing_xss(doc.title) + "</a>";
        }
        search_article_title = "<div class='search-article-title'>" + a1 + span1 + "</div>";

        if (doc.hi_content) {
            a1 = "<a href='" + link + "' target='_blank'>" + doc.hi_content + "</a>";
        } else {
            a1 = "<a href='" + link + "' target='_blank'>" + this.get_encoded_html_preventing_xss(doc.content) + "</a>";
        }
        search_article_content = "<div class='search-article-content'>" + a1 + "</div>";
        span1 = "<span class='created-at without-text' data-datetime='" + doc.created_at + "'>" + "</span>";
        search_article_datetime = "<div>" + span1 + "</div>";
        search_article_item_right = "<div class='search-article-item-right'>" + search_article_title + search_article_content + search_article_datetime + "</div>";
        search_article_item_inner = "<div class='search-article-item-inner'>" + search_article_item_left + search_article_item_right + "</div>";
        return "<div class='search-article-item' data-print-type='search'>" + search_article_item_inner + "</div>";
    },
    get_search_image_object: function (lang, doc) {
        var temp = doc["img"].split('.');
        temp = temp[temp.length-2].split('-');
        var width = temp[temp.length-2];
        var height = temp[temp.length-1];
        var img1
            , a1
            , div1;
        img1 = "<img class='search-image-item-img no-resized' src='" + doc["img"] + "' data-img='" + doc["img"] + "' data-width='" + width + "' data-height='" + height + "'>";
        a1 = "<a href='/blog/" + doc['blog_id'] + "/gallery/" + doc['article_id'] + "' target='_blank'>" + img1 + "</a>";
        return "<div class='search-image-item'>" + a1 + "</div>";
    },
    /*
    * type: employment || education || prize || location
    * item: 해당 타입에 해당하는 단일 객체
    * */
    get_profile_item_for_show: function (type, item, lang) {
        var str_list = "", date = "";

        if (type === 'employment') { /* 경력 */
            var company, str_company;
            for (var i = 0; i < item.length; i++) {
                /* 상세경력 프로필 prompt 출력용 정리 */
                company = "";
                if (item[i]["company"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        company = company + item[i]["company"] + " ";
                    } else {
                        company = company + item[i]["company"];
                    }
                }
                company = company + item[i]["position"];

                if (item[i]["ing"] === 1) {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        str_company = i18n[lang].current + " " + company;
                    } else {
                        str_company = i18n[lang].current + company;
                    }
                } else {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        str_company = i18n[lang].previous + " " + company;
                    } else {
                        str_company = i18n[lang].previous + company;
                    }
                }

                /* Display Profile용 정리 */
                if (item[i]["show"] === true) {
                    if (str_list === "") {
                        str_list = str_company;
                    } else {
                        if (
                            lang === "en" ||
                            lang === "ko"
                        ) {
                            str_list = str_list + ", " + str_company;
                        } else {
                            str_list = str_list + "、" + str_company;
                        }
                    }
                }

                date = "";
                if (item[i]["start_year"] !== 0) {
                    if (item[i]["start_month"] !== 0) {
                        if (item[i]["start_day"] !== 0) {
                            date = item[i]["start_year"] + "." + this.convert_to_two_digits(item[i]["start_month"]) + "." + this.convert_to_two_digits(item[i]["start_day"]);
                        } else {
                            date = item[i]["start_year"] + "." + this.convert_to_two_digits(item[i]["start_month"]);
                        }
                    } else {
                        date = item[i]["start_year"];
                    }
                }

                if (item[i]["ing"] === 1) {
                    date = date + "~" + i18n[lang].now + " ";
                } else {
                    if (item[i]["end_year"] !== 0) {
                        date = date + "~";
                        if (item[i]["end_month"] !== 0) {
                            if (item[i]["end_day"] !== 0) {
                                date = date + item[i]["end_year"] + "." + this.convert_to_two_digits(item[i]["end_month"]) + "." + this.convert_to_two_digits(item[i]["end_day"]);
                            } else {
                                date = date + item[i]["end_year"] + "." + this.convert_to_two_digits(item[i]["end_month"]);
                            }
                        } else {
                            date = date + item[i]["end_year"];
                        }
                        date = date + " ";
                    } else {
                        if (date !== "") {
                            date = date + "~ ";
                        }
                    }
                }
                item[i]["employment_content"] = date + company;
            }
        } else if (type === 'education') { /* 교육 */
            var education, str_education;
            for (var i = 0; i < item.length; i++) {
                /* 상세경력 프로필 prompt 출력용 정리 */
                education = item[i]["school"];
                if (item[i]["major"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        education = education + " " + item[i]["major"];
                    } else {
                        education = education + item[i]["major"];
                    }
                }
                if (item[i]["minor"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        education = education + " " + item[i]["minor"];
                    } else {
                        education = education + item[i]["minor"];
                    }
                }
                if (item[i]["degree"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        education = education + " " + item[i]["degree"];
                    } else {
                        education = education + item[i]["degree"];
                    }
                }
                if (item[i]["ing"] !== 1) {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        if (lang === "en") {
                            str_education =  i18n[lang].graduated_from + " " + education;
                        } else {
                            str_education = education + " " + i18n[lang].graduated_from;
                        }
                    } else {
                        str_education = education + i18n[lang].graduated_from;
                    }
                }

                /* Display Profile용 정리 */
                if (item[i]["show"] === true) {
                    if (str_list === "") {
                        str_list = str_education;
                    } else {
                        if (
                            lang === "en" ||
                            lang === "ko"
                        ) {
                            str_list = str_list + ", " + str_education;
                        } else {
                            str_list = str_list + "、" + str_education;
                        }
                    }
                }

                date = "";
                if (item[i]["start_year"] !== 0) {
                    if (item[i]["start_month"] !== 0) {
                        if (item[i]["start_day"] !== 0) {
                            date = item[i]["start_year"] + "." + this.convert_to_two_digits(item[i]["start_month"]) + "." + this.convert_to_two_digits(item[i]["start_day"]);
                        } else {
                            date = item[i]["start_year"] + "." + this.convert_to_two_digits(item[i]["start_month"]);
                        }
                    } else {
                        date = item[i]["start_year"];
                    }
                }

                if (item[i]["ing"] === 1) {
                    date = date + "~" + i18n[lang].now + " ";
                } else {
                    if (item[i]["end_year"] !== 0) {
                        date = date + "~";
                        if (item[i]["end_month"] !== 0) {
                            if (item[i]["end_day"] !== 0) {
                                date = date + item[i]["end_year"] + "." + this.convert_to_two_digits(item[i]["end_month"]) + "." + this.convert_to_two_digits(item[i]["end_day"]);
                            } else {
                                date = date + item[i]["end_year"] + "." + this.convert_to_two_digits(item[i]["end_month"]);
                            }
                        } else {
                            date = date + item[i]["end_year"];
                        }
                        date = date + " ";
                    } else {
                        if (date !== "") {
                            date = date + "~ ";
                        }
                    }
                }
                item[i]["education_content"] = date + education;
            }
        } else if (type === 'prize') { /* 수상내역 */
            var prize, str_prize;
            for (var i = 0; i < item.length; i++) {
                /* 상세경력 프로필 prompt 출력용 정리 */
                prize = item[i]["item"];
                str_prize = prize;

                /* Display Profile용 정리 */
                if (item[i]["show"] === true) {
                    if (str_list === "") {
                        str_list = str_prize;
                    } else {
                        if (
                            lang === "en" ||
                            lang === "ko"
                        ) {
                            str_list = str_list + ", " + str_prize;
                        } else {
                            str_list = str_list + "、" + str_prize;
                        }
                    }
                }
                date = "";
                if (item[i]["received_year"] !== 0) {
                    if (item[i]["received_month"] !== 0) {
                        if (item[i]["received_day"] !== 0) {
                            date = item[i]["received_year"] + "." + item[i]["received_month"] + "." + item[i]["received_day"] + " ";
                        } else {
                            date = item[i]["received_year"] + "." + item[i]["received_month"] + " ";
                        }
                    } else {
                        date = item[i]["received_year"] + " ";
                    }
                }
                item[i]["prize_content"] = date + prize;
            }
        } else if (type === 'location') { /* 거주지 */
            var location, str_location;
            for (var i = 0; i < item.length; i++) {
                /* 상세경력 프로필 prompt 출력용 정리 */
                location = item[i]["country"];
                if (item[i]["city"] !== "") {
                    if (
                        lang === "en" ||
                        lang === "ko"
                    ) {
                        location = location + " " + item[i]["city"];
                    } else {
                        location = location + item[i]["city"];
                    }
                }
                str_location = location;

                /* Display Profile용 정리 */
                if (item[i]["show"] === true) {
                    if (str_list === "") {
                        str_list = str_location;
                    } else {
                        if (
                            lang === "en" ||
                            lang === "ko"
                        ) {
                            str_list = str_list + ", " + str_location;
                        } else {
                            str_list = str_list + "、" + str_location;
                        }
                    }
                }

                date = "";
                if (item[i]["start_year"] !== 0) {
                    if (item[i]["start_month"] !== 0) {
                        if (item[i]["start_day"] !== 0) {
                            date = item[i]["start_year"] + "." + this.convert_to_two_digits(item[i]["start_month"]) + "." + this.convert_to_two_digits(item[i]["start_day"]);
                        } else {
                            date = item[i]["start_year"] + "." + this.convert_to_two_digits(item[i]["start_month"]);
                        }
                    } else {
                        date = item[i]["start_year"];
                    }
                }

                if (item[i]["ing"] === 1) {
                    date = date + "~" + i18n[lang].now + " ";
                } else {
                    if (item[i]["end_year"] !== 0) {
                        date = date + "~";
                        if (item[i]["end_month"] !== 0) {
                            if (item[i]["end_day"] !== 0) {
                                date = date + item[i]["end_year"] + "." + this.convert_to_two_digits(item[i]["end_month"]) + "." + this.convert_to_two_digits(item[i]["end_day"]);
                            } else {
                                date = date + item[i]["end_year"] + "." + this.convert_to_two_digits(item[i]["end_month"]);
                            }
                        } else {
                            date = date + item[i]["end_year"];
                        }
                        date = date + " ";
                    } else {
                        if (date !== "") {
                            date = date + "~ ";
                        }
                    }
                }
                item[i]["location_content"] = date + location;
            }
        }
        return {
            str_list: str_list
            , item: item
        }
    },
    /**
     * @param obj
     * @returns {{}}
     */
    get_second: function (obj) {
        var second = {};
        if (obj["db"] === "users") {
            second["_id"] = 0;
            second["email"] = 0;
            second["password"] = 0;
            second["service"] = 0;
            second["oauth_id"] = 0;
            second["secret_id"] = 0;
            second["is_img_set"] = 0;
            second["checked_messages_at"] = 0;
            second["checked_notifications_at"] = 0;
            second["show_simple_career"] = 0;
            second["self_introduction"] = 0;
            second["points"] = 0;
            second["interesting_tags"] = 0;
            second["today"] = 0;
            second["count_today_view"] = 0;
            second["count_total_view"] = 0;
            second["verified"] = 0;
            second["token"] = 0;
            second["created_at"] = 0;
            second["updated_at"] = 0;
            second["is_removed"] = 0;
            if (
                obj["filter"] === "simple_profile" ||
                obj["filter"] === "friends"
            ) {
                second["blog_name"] = 0;
                second["friends"] = 0;
            }
            second["es_index"] = 0;
            second["es_type"] = 0;
            second["es_id"] = 0;
            second["es_updated_at"] = 0;
            second["es_is_updated"] = 0;
        } else if (obj["db"] === "employment") {
            if (obj["filter"] === "announcement") {

            } else {
                second["is_removed"] = 0;
                second["date"] = 0;
                if (obj["filter"] === "normal") {
                    second["tags"] = 0;
                    second["content"] = 0;
                } else {
                }
                if (obj["authority"] === "owner") {
                } else if (obj["authority"] === "public") {
                    second["questions"] = 0;
                } else if (obj["authority"] === "application") {
                }
            }
        } else if (obj["db"] === "online_interview") {

        } else if (obj["db"] === "articles"){
            second["is_removed"] = 0;
            second["date"] = 0;
            if (
                obj["list_type"] === "debate" ||
                obj["list_type"] === "agenda" ||
                obj["list_type"] === "opinion"
            ) {
                if (obj["filter"] === "normal") {
                    second["tags"] = 0;
                    second["content"] = 0;
                } else if (obj["filter"] === "perfect") {

                } else if (obj["filter"] === "perfect_for_serial") {
                    delete second["is_removed"];
                }
            } else if (
                obj["list_type"] === "translation" ||
                obj["list_type"] === "tr_agenda" ||
                obj["list_type"] === "tr_opinion"
            ) {
                if (obj["filter"] === "normal") {
                    second["tags"] = 0;
                    second["content"] = 0;
                } else {

                }
            } else if (obj["list_type"] === "blog_gallery") {
                if (obj["filter"] === "normal") {
                    second["tags"] = 0;
                    second["content"] = 0;
                    second["etag"] = 0;
                } else if (obj["filter"] === "perfect") {
                    second["etag"] = 0;
                }
            } else if (obj["list_type"] === "blog") {
                if (obj["filter"] === "normal") {
                    second["tags"] = 0;
                    second["content"] = 0;
                }
            } else if (obj["list_type"] === "gallery") {
                if (obj["filter"] === "normal") {
                    second["tags"] = 0;
                    second["content"] = 0;
                    second["etag"] = 0;
                } else if (obj["filter"] === "perfect") {
                    second["etag"] = 0;
                }
            }
        } else if (obj["db"] === "guestbook") {
            second["is_removed"] = 0;
        }
        return second;
    },
    check_email: function (connected_db, type, email, f_cb, f_cb2, s_cb) {
        connected_db.collection('users').findOne({email:email, service: "gleant", is_removed:false}, function(err, doc) {
            if (err) {
                if (type === "register") {
                    return f_cb();
                } else if (type === "forgot_password") {
                    return f_cb();
                }
            } else {
                if (doc === null) {
                    if (type === "register") {
                        return s_cb();
                    } else if (type === "forgot_password") {
                        return f_cb2();
                    }
                } else {
                    if (type === "register") {
                        return f_cb2();
                    } else if (type === "forgot_password") {
                        return s_cb(doc.name);
                    }
                }
            }
        });
    },
    check_token: function (connected_db, token, f_cb, s_cb) {
        connected_db.collection('users').findOne({token:token, service: "gleant", is_removed:false}, function(err, doc) {
            if (err) {
                return f_cb();
            } else {
                if (doc === null) {
                    return f_cb();
                } else {
                    return s_cb();
                }
            }
        });
    },
    check_user_by_user_id_secret_id: function (connected_db, user_id, secret_id, pass_obj, f_cb, s_cb) {
        try {
            user_id = new ObjectId(user_id);
        } catch (e) {
            if (pass_obj === true) {
                return f_cb(null);
            } else {
                return f_cb();
            }
        }
        connected_db.collection('users').findOne({_id:user_id, secret_id:secret_id, is_removed:false}, function(err, doc) {
            if (err) {
                if (pass_obj === true) {
                    return f_cb(null);
                } else {
                    return f_cb();
                }
            } else {
                if (doc === null) {
                    if (pass_obj === true) {
                        return f_cb(null);
                    } else {
                        return f_cb();
                    }
                } else {
                    if (pass_obj === true) {
                        return s_cb(doc);
                    } else {
                        return s_cb();
                    }
                }
            }
        });
    },
    check_blog_id: function (connected_db, blog_id, pass_obj, f_cb, s_cb) {
        var first = {};
        if (pass_obj === false) {
            first = {blog_id:blog_id};
        } else {
            first = {blog_id:blog_id, is_removed:false};
        }
        connected_db.collection('users').findOne(first, function(err, doc) {
            if (err) {
                if (pass_obj === true) {
                    return f_cb(null);
                } else {
                    return s_cb();
                }
            } else {
                if (doc === null) {
                    if (pass_obj === true) {
                        return f_cb(null);
                    } else {
                        return s_cb();
                    }
                } else {
                    if (pass_obj === true) {
                        return s_cb(doc);
                    } else {
                        return f_cb();
                    }
                }
            }
        });
    },
    set_blog_id: function (connected_db, lang, user_id, secret_id, data, f_cb, s_cb) { /* 초기 블로그 아이디 설정 */
        try {
            user_id = new ObjectId(user_id);
        } catch (e) {
            return f_cb();
        }
        var blog_name = data.blog_id + " " + i18n[lang].blog
            , first
            , second;
        first = {_id: user_id, secret_id: secret_id, is_removed:false};
        second = {$set: {
            name: data.name
            , birth_year: data.birth_year
            , birth_month: data.birth_month
            , birth_day: data.birth_day
            , sex: data.sex
            , blog_id: data.blog_id
            , blog_name: blog_name
            , main_language: data.main_language
            , available_languages: data.available_languages
            , public_authority: data.public_authority
        }};
        if (data.img !== undefined) {
            second["$set"].img = data.img;
        }
        connected_db.collection('users').updateOne(first, second, function(err, res) {
                if (err) {
                    return f_cb();
                } else {
                    return s_cb();
                }
            });
    },
    update_specific_info: function (connected_db, blog_id, second, f_cb, s_cb) {
        connected_db.collection('users').updateOne({blog_id: blog_id}, second, function (err, res) {
                if (err) {
                    return f_cb(null);
                } else {
                    return s_cb(null);
                }
            });
    },
    set_interesting_tags: function (connected_db, user_id, secret_id, interesting_tags, f_cb, s_cb) { /* 초기 관심태그 설정 */
        try {
            user_id = new ObjectId(user_id);
        } catch (e) {
            return f_cb();
        }
        connected_db.collection('users').updateOne({_id: user_id, secret_id: secret_id, is_removed:false},
            {$set: {
                interesting_tags: interesting_tags
            }},
            function(err, res) {
                if (err === null) {
                    return s_cb();
                } else {
                    return f_cb();
                }
            });
    },
    check_verified: function (connected_db, email, f_cb1, f_cb2, s_cb) {
        connected_db.collection('users').findOne({email: email, service:"gleant", is_removed:false}, function(err, doc) {
            if (err) {
                return f_cb1();
            } else {
                if (doc === null) {
                    return f_cb1();
                } else {
                    if (doc.verified === true) {
                        return s_cb();
                    } else {
                        return f_cb2();
                    }
                }
            }
        });
    },
    check_user_by_pwd: function (connected_db, email, password, f_cb, s_cb) {
        password = crypto.createHash('sha256').update(password).digest('base64');
        connected_db.collection('users').findOne({email:email, password:password, service:"gleant", is_removed:false}, function(err, doc) {
            if (err) {
                return f_cb();
            } else {
                if (doc === null) {
                    return f_cb();
                } else {
                    return s_cb(doc._id.toString(), doc.secret_id, doc.blog_id, doc.blog_id !== "");
                }
            }
        });
    },
    check_user_by_oauth: function (connected_db, service, oauth_id, f_cb, f_cb2, s_cb) {
        connected_db.collection('users').findOne({service:service, oauth_id:oauth_id, is_removed:false}, function(err, doc) {
            if (err) {
                return f_cb();
            } else {
                if (doc === null) {
                    return f_cb2();
                } else {
                    return s_cb(doc._id.toString(), doc.secret_id, doc.blog_id, doc.blog_id !== "");
                }
            }
        });
    },
    register_gleant: function (connected_db, name, email, password, token, f_cb, s_cb) {
        var secret_id = randomstring.generate() + randomstring.generate();
        var date = new Date().valueOf();
        var today = this.to_eight_digits_date();
        var new_user = {
            email: email,
            password: password,
            name: name,
            birth_year: 0,
            birth_month: 0,
            birth_day: 0,
            sex: "",
            iq: 0,
            eq: 0,
            blog_id: "",
            blog_name: "",
            blog_menu:
                [{
                    _id: "debate"
                    , index:0
                    , title: ""
                    , description: ""
                }, {
                    _id: "employment"
                    , index:1
                    , title: ""
                    , description: ""
                }, {
                    _id: "gallery"
                    , index:2
                    , title: ""
                    , description: ""
                }, {
                    _id: randomstring.generate(7)
                    , index:3
                    , title: ""
                    , description: ""
                }, {
                    _id: "participation"
                    , index:4
                    , title: ""
                    , description: ""
                }, {
                    _id: "subscription"
                    , index:5
                    , title: ""
                    , description: ""
                }, {
                    _id: "guestbook"
                    , index:6
                    , title: ""
                    , description: ""
                }],
            img: config.aws_s3_url + "/upload/images/00000000/gleant/resized/male.png",
            is_img_set: true,
            service: "gleant",
            oauth_id: "none",
            secret_id: secret_id,
            verified_profile: "",
            simple_career: "",
            show_simple_career: false,
            self_introduction: "",
            count_awesome: 0,
            points: 0,
            ranking: 0,
            friends: [],
            employment: [],
            education: [],
            prize: [],
            location: [],
            website: [],
            interesting_tags: [],
            main_language: "",
            available_languages: [],
            today: today,
            count_today_view: 0,
            count_total_view: 0,
            verified:false,
            token:token,
            checked_messages_at: date,
            checked_notifications_at: date,
            public_authority: 2,
            created_at: date,
            updated_at: date,
            is_removed:false,
            es_index: "",
            es_type: "",
            es_id: "",
            es_updated_at: 0,
            es_is_updated: false
        };
        new_user = this.append_two_language_list(new_user);
        connected_db.collection('users').insertOne(new_user, function (err, res) {
            if (err === null) {
                return s_cb();
            } else {
                return f_cb();
            }
        });
    },
    register_oauth: function (connected_db, service, name, email, oauth_id, img, f_cb, s_cb) {
        var today = this.to_eight_digits_date();
        var secret_id = randomstring.generate() + randomstring.generate();
        var date = new Date().valueOf();
        var is_img_set = false;
        var temp = config.aws_s3_url + "/upload/images/00000000/gleant/resized/male.png";
        if (img === temp) {
            is_img_set = true;
        }
        var new_user = {
            email: email,
            password: "",
            name: name,
            birth_year: 0,
            birth_month: 0,
            birth_day: 0,
            sex: "",
            iq: 0,
            eq: 0,
            blog_id: "",
            blog_name: "",
            blog_menu:
                [{
                    _id: "debate"
                    , index:0
                    , title: ""
                    , description: ""
                }, {
                    _id: "employment"
                    , index:1
                    , title: ""
                    , description: ""
                }, {
                    _id: "gallery"
                    , index:2
                    , title: ""
                    , description: ""
                }, {
                    _id: randomstring.generate(7)
                    , index:3
                    , title: ""
                    , description: ""
                }, {
                    _id: "participation"
                    , index:4
                    , title: ""
                    , description: ""
                }, {
                    _id: "subscription"
                    , index:5
                    , title: ""
                    , description: ""
                }, {
                    _id: "guestbook"
                    , index:6
                    , title: ""
                    , description: ""
                }],
            img: img,
            is_img_set: is_img_set,
            service: service,
            oauth_id: oauth_id,
            secret_id: secret_id,
            verified_profile: "",
            simple_career: "",
            show_simple_career: false,
            self_introduction: "",
            count_awesome: 0,
            points: 0,
            ranking: 0,
            friends: [],
            employment: [],
            education: [],
            prize: [],
            location: [],
            website: [],
            interesting_tags: [],
            main_language: "",
            available_languages: [],
            today: today,
            count_today_view: 0,
            count_total_view: 0,
            verified:true,
            token:"",
            checked_messages_at: date,
            checked_notifications_at: date,
            public_authority: 2,
            created_at: date,
            updated_at: date,
            is_removed:false,
            es_index: "",
            es_type: "",
            es_id: "",
            es_updated_at: 0,
            es_is_updated: false
        };
        new_user = this.append_two_language_list(new_user);
        /* points: [추천 사용자] 정렬 시, text search의 score가 같을 경우, points 기준으로 정렬. */
        connected_db.collection('users').insertOne(new_user, function (err, res) {
            if (err === null) {
                return s_cb(res["ops"][0]._id.toString(), res["ops"][0].secret_id, "", false);
            } else {
                return f_cb();
            }
        });
    },
    remove_user: function (connected_db, blog_id, f_cb, s_cb) {
        connected_db.collection('users').updateOne(
            {blog_id: blog_id, is_removed: false},
            { "$set": { is_removed: true } }, function (err, res) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (res.result.n === 0) {
                        return f_cb(null);
                    } else {
                        return s_cb(null);
                    }
                }
            });
    },
    remove_user_es: function (connected_db, blog_id) {
        connected_db.collection('users').updateOne(
            {
                blog_id: blog_id
                , is_removed: true
            },
            { "$set": {
                es_index: "",
                es_type: "",
                es_id: "",
                es_updated_at: new Date().valueOf(),
                es_is_updated: false
            } }, function (err, res) {
                return false;
            });
    },
    update_token: function(connected_db, email, token, f_cb, s_cb) {
        connected_db.collection('users').updateOne({email: email, service: "gleant", is_removed:false},
            {$set: {
                token: token
            }},
            function(err, res) {
                if (err === null) {
                    return s_cb();
                } else {
                    return f_cb();
                }
            });
    },
    verify: function(connected_db, token, f_cb, s_cb) {
        connected_db.collection('users').updateOne({token: token, service: "gleant", is_removed:false},
            {$set: {
                token: "",
                verified: true
            }},
            function(err, res) {
                if (err === null) {
                    return s_cb();
                } else {
                    return f_cb();
                }
            });
    },
    change_password: function(connected_db, password, token, blog_id, f_cb, s_cb) {
        var secret_id = randomstring.generate() + randomstring.generate()
            , first = {}
            , second = {};
        password = crypto.createHash('sha256').update(password).digest('base64');
        if (token === null) {
            if (blog_id === "") {
                return f_cb();
            }
            first = {blog_id: blog_id, service: "gleant", is_removed:false};
            second = {$set: {
                secret_id: secret_id,
                password: password
            }};
        } else {
            first = {token: token, service: "gleant", is_removed:false};
            second = {$set: {
                secret_id: secret_id,
                    password: password,
                    token: "",
                    verified: true
            }};
        }
        connected_db.collection('users').updateOne(first, second, function(err, res) {
                if (err) {
                    return f_cb();
                } else {
                    return s_cb(secret_id);
                }
            });
    },
    verify_oauth: function (service, oauth_id, access_token, f_cb, s_cb) {
        var options, decoder, str, obj, id;
        if (service === "kakao") {
            options = {
                url: "https://kapi.kakao.com/v1/user/access_token_info",
                headers: {
                    "Authorization": "Bearer " + access_token,
                    "Content-type": "application/x-www-form-urlencoded;charset=utf-8"
                },
                encoding: null
            };
        } else if (service === "facebook") {
            options = {
                url: "https://graph.facebook.com/me?access_token=" + access_token,
                encoding: null
            };
        } else {
            return f_cb();
        }
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if (service === "kakao") {
                    decoder = new string_decoder.StringDecoder('utf8');
                    str = decoder.write(body);
                    obj = JSON.parse(str);
                } else if (service === "facebook") {
                    obj = JSON.parse(body);
                }
                if (obj && obj.id) {
                    id = obj.id + "";
                    if (id === oauth_id) {
                        return s_cb();
                    } else {
                        return f_cb();
                    }
                } else {
                    return f_cb();
                }
            } else {
                if (error) {
                    return f_cb();
                } else {
                    return f_cb();
                }
            }
        });
    },
    send_email : function (connected_db, lang, type, email, name, token, f_cb, s_cb) {
        var subject, url, content, date, a, b, c, d, e, f, g, h, i, j, k, l;
        url = require('./env.json')[process.env.NODE_ENV || 'development']["url"];
        if (type === "register") {
            subject = i18n[lang].welcome_to_gleant + " [" + i18n[lang].email_verification + "]";
            date = this.to_i18n_utc_fixed_datetime({lang: lang, datetime: new Date()});
            a = "<div style='margin:auto;text-align:center;padding:10px 0;'><img style='width:240px;' src='" + config.aws_s3_url + "/icons/logo.png' alt='Gleant' title='Gleant'></div>";
            b = "<div style='font-size:18px;text-align:center;margin-bottom:5px;'>" + i18n[lang].welcome_to_gleant + "</div>";
            c = "<div style='font-size:14px;text-align:center;'>" + i18n[lang].look_for_your_answer + "</div>";
            d = "<div style='border-bottom:2px solid #ebebeb;padding:10px;'><span style='margin-right:10px;font-weight:bold;'>" + i18n[lang].email + "</span>" + email + "</div>";
            e = "<div style='padding:10px;'><span style='margin-right:10px;font-weight:bold;'>" + i18n[lang].date + "</span>" + date + "</div>";
            f = "<div style='border:2px solid #ebebeb;margin:20px 10px;font-size:14px;'>" + d + e +  "</div>";
            g = "<div style='text-align:center;font-size:14px;'>" + i18n[lang].please_click_the_button_below + "</div>";
            h = "<div style='font-size:14px;padding:10px 15px;background:#f2b50f;border:1px solid #f2b50f;border-radius:10px;color:#ffffff;cursor:pointer;text-align:center;'>" + i18n[lang].email_verification + "</div>";
            i = "<a href='" + url + "/verify/" + token + "' target='_blank' style='display:inline-block;text-decoration:none;margin:20px auto;'>" + h +"</a>";
            j = "<div style='margin:auto;text-align:center;'>" + i + "</div>";
            k = "<div style='text-align:center;font-size:12px;'>" + i18n[lang].use_the_following_url_when_button_isnt_working + "</div>";
            l = "<div style='font-size:9px;text-align:left;word-wrap:break-word;text-decoration:underline;padding:20px 10px;margin-top:10px;margin-bottom:10px;border:1px solid #ebebeb;'>" + url + "/verify/" + token + "</div>";
            content = "<div style='text-align:left;margin:10px auto;max-width:450px;'>" + a + b + c + f + g + j + k + l + "</div>";
        } else if (type === "forgot_password") {
            subject = i18n[lang].welcome_to_gleant + " [" + i18n[lang].password_reset + "]";
            date = this.to_i18n_utc_fixed_datetime({lang: lang, datetime: new Date()});
            a = "<div style='margin:auto;text-align:center;padding:10px 0;'><img style='width:240px;' src='" + config.aws_s3_url + "/icons/logo.png' alt='Gleant' title='Gleant'></div>";
            j = "<div style='font-size:18px;text-align:center;margin-bottom:5px;'><span style='text-decoration:underline;'>" + i18n[lang].welcome_to_gleant + "</div>";
            b = "<div style='padding:10px;'><span style='margin-right:10px;font-weight:bold;'>" + i18n[lang].date + "</span>" + date + "</div>";
            i = "<div style='border:2px solid #ebebeb;margin:20px 10px;font-size:14px;'>" + b +  "</div>";
            c = "<div style='text-align:center;font-size:14px;'>" + i18n[lang].please_click_the_button_below  + "</div>";
            d = "<div style='font-size:14px;padding:10px 15px;background:#f2b50f;border:1px solid #f2b50f;border-radius:10px;color:#ffffff;cursor:pointer;text-align:center;'>" + i18n[lang].password_reset +"</div>";
            e = "<a href='" + url + "/reset-password/" + token + "' target='_blank' style='display:inline-block;text-decoration:none;margin:20px auto;'>" + d + "</a>";
            f = "<div style='margin:auto;text-align:center;'>" + e + "</div>";
            g = "<div style='text-align:center;font-size:12px;'>" + i18n[lang].use_the_following_url_when_button_isnt_working + "</div>";
            h = "<div style='font-size:9px;text-align:left;word-wrap:break-word;text-decoration:underline;padding:20px 10px;margin-top:10px;margin-bottom:10px;border:1px solid #ebebeb;'>" + url + "/reset-password/" + token + "</div>";
            content = "<div style='text-align:left;margin:10px auto;max-width:450px;'>" + a + j + i + c + f + g + h + "</div>";
        }
        var mailOptions = {
            from: "Gleant<admin@gleant.com>",
            to: email,
            subject: subject,
            html: content
        };
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return f_cb(null);
            } else {
                return s_cb(null);
            }
        });
    },
    crawl_site: function (connected_db, link, f_cb, s_cb) {
        var pattern = /^((http|https):\/\/)/, content_type, charset, decoded_body, $, title = "", description = "", site = "", img = config.aws_s3_url + "/icons/question.png";
        var self = this;
        if(!pattern.test(link)) {
            link = "http://" + link;
        }
        request({uri: link, encoding:null}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                content_type = response["headers"]["content-type"];
                charset = content_type.toLowerCase().replace(/\s+/gi, '').replace("text/html;charset=", "");
                if (charset.includes("utf-8") === true) {
                    decoded_body = body;
                } else {
                    if (iconv.encodingExists(charset)) {
                        decoded_body = iconv.decode(body, charset);
                    } else {
                        return f_cb(null);
                    }
                }
                $ = cheerio.load(decoded_body, {decodeEntities: false});
                title = $('title').text();
                $('head meta').each(function(i, e) {
                    if ($(e).attr('property') === "twitter:title" || $(e).attr('property') === "og:title" || $(e).attr('name') === "twitter:title" || $(e).attr('name') === "og:title") {
                        title = $(e).attr("content");
                    }

                    if ($(e).attr('name') === "description" || $(e).attr('property') === "twitter:description" || $(e).attr('property') === "og:description" || $(e).attr('name') === "twitter:description" || $(e).attr('name') === "og:description") {
                        description = $(e).attr("content");
                    }

                    if ($(e).attr('property') === "twitter:image" || $(e).attr('property') === "og:image" || $(e).attr('name') === "twitter:image" || $(e).attr('name') === "og:image") {
                        img = $(e).attr('content');
                    }

                    if ($(e).attr('property') === "og:site_name" || $(e).attr('name') === "og:site_name") {
                        site = $(e).attr('content');
                    }
                });

                var data = {};
                data.language = "";
                data.img = img;
                data.title = self.get_clear_text(title);
                data.description = self.get_clear_text(description).trim().replace(/\s\s+/gi, ' ');
                data.site = self.get_clear_text(site);
                data.link = link;
                return s_cb(data);
            } else {
                if (error) {
                    return f_cb(null);
                } else {
                    return f_cb(null);
                }
            }
        });
    },
    insert_link: function (connected_db, link, f_cb, s_cb) {
        var created_obj = {}
            , now = new Date().valueOf();

        created_obj.link = link;
        created_obj.language = "";
        created_obj.img = config.aws_s3_url + "/icons/question.png";
        created_obj.title = link;
        created_obj.description = "";
        created_obj.site = "";
        created_obj.is_checked = false;
        created_obj.is_crawled = false;
        created_obj.created_at = now;
        created_obj.updated_at = now;

        connected_db.collection('links').insertOne(created_obj, function (err, res) {
            if (err === null) {
                return s_cb(created_obj);
            } else {
                return f_cb(null);
            }
        });
    },
    update_link: function (connected_db, first, second, f_cb, s_cb) {
        second["$set"]["updated_at"] = new Date().valueOf();
        connected_db.collection('links').updateOne(first, second, function (err, res) {
            if (err) {
                return f_cb(null);
            } else {
                if (res.result.n === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(null);
                }
            }
        });
    },
    get_link: function (connected_db, link, f_cb, s_cb) {
        connected_db.collection('links').findOne({link:link}, {}, function(err, doc) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (doc === null) {
                        return f_cb(null);
                    } else {
                        return s_cb(doc);
                    }
                }
            });
    },
    insert_vote: function (connected_db, data, f_cb, s_cb) {
        var first = {};
        var date = new Date().valueOf();
        first._id = data.blog_id + "_" + date + randomstring.generate(6);
        first.service_type = "";
        first.type = data.type;
        first.link = "";
        first.root_id = "";
        first.blog_id = data.blog_id;
        first.question = data.question;
        first.choice_list = [];

        for (var i = 0; i < data.choice_list.length; i++) {
            first.choice_list.push({
                _id: randomstring.generate(8)
                , choice: data.choice_list[i]
                , voters: []
                , count: 0
            });
        }

        first.voters = [];
        first.language = "";
        first.public_authority = 0;
        first.is_removed = false;
        first.is_secret = data.is_secret;
        first.created_at = date;
        first.updated_at = date;

        first.is_start_set = false;
        first.start_at = 0;
        first.is_finish_set = data.is_finish_set;
        first.finish_at = data.finish_at;
        connected_db.collection('votes').insertOne(
            first,
            function(err, res) {
                if (err === null) {
                    return s_cb(first._id);
                } else {
                    return f_cb(null);
                }
            });
    },
    insert_multi_translated_votes: function (connected_db, data, f_cb, s_cb) {
        connected_db.collection('translated_votes').insertMany(data, function(err, res) {
                if (err === null) {
                    return s_cb(null);
                } else {
                    return f_cb(null);
                }
            });
    },
    get_multi_votes: function (connected_db, data, cb) {
        connected_db.collection('votes').find(data).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return cb([]);
                } else {
                    return cb(docs);
                }
            } else {
                return cb([]);
            }
        });
    },
    /* action : vote || exist */
    get_single_vote: function (connected_db, data, action, f_cb, s_cb) {
        var first = {};
        first.is_removed = false;
        first._id = data._id;
        if (action === "vote") {
            first.voters = data.blog_id;
        }
        connected_db.collection('votes').findOne(
            first, function(err, doc) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (doc === null) {
                        return f_cb(null);
                    } else {
                        return s_cb(doc);
                    }
                }
            });
    },
    remove_all_votes: function (connected_db, first, cb) {
        var second = {};
        second["$set"] = {};
        second["$set"].public_authority = 0;
        second["$set"].updated_at = new Date().valueOf();
        second["$set"].is_removed = true;

        connected_db.collection('votes').update(
            first,
            second,
            {multi:true},
            function (err, res) {
                return cb(null);
            }
        );
    },
    get_single_translated_vote: function (connected_db, data, f_cb, s_cb) {
        data.is_removed = false;
        connected_db.collection('translated_votes').findOne(
            data, function(err, doc) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (doc === null) {
                        return f_cb(null);
                    } else {
                        return s_cb(doc);
                    }
                }
            });
    },
    remove_all_translated_votes: function (connected_db, first, cb) {
        var second = {};
        second["$set"] = {};
        second["$set"].public_authority = 0;
        second["$set"].updated_at = new Date().valueOf();
        second["$set"].is_removed = true;

        connected_db.collection('translated_votes').update(
            first,
            second,
            {multi:true},
            function (err, res) {
                return cb(null);
            }
        );
    },
    seriously_remove_translated_votes: function (connected_db, data, f_cb, s_cb) {
        connected_db.collection('translated_votes').remove(data, function (err, result) {
            if (err === null) {
                return s_cb(null);
            } else {
                return f_cb(null);
            }
        });
    },
    push_voter: function (connected_db, data, f_cb, s_cb) {
        data.first.is_removed = false;
        connected_db.collection('votes').updateOne(
            data.first, data.second,
            function(err, res) {
                if (err === null) {
                    if (res.result.n === 0) {
                        return f_cb(null);
                    } else {
                        return s_cb(null);
                    }
                } else {
                    return f_cb(null);
                }
            });
    },
    get_simple_profile: function (connected_db, user_blog_id, target_blog_id, f_cb, s_cb) {
        var first = {
                blog_id: target_blog_id
                , is_removed: false
            }, second = this.get_second({
                db: "users"
                , filter: "simple_profile"
            }),
            self = this;
        connected_db.collection('users').findOne(
            first, second, function(err, doc) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (doc === null) {
                        return f_cb(null);
                    } else {
                        self.is_friend(connected_db, user_blog_id, target_blog_id
                            , function () {
                                doc.is_friend = false;
                                self.get_single_notification(connected_db, {
                                    type: "friend_request"
                                    , blog_id: user_blog_id
                                    , subscribers: target_blog_id
                                }, function (nothing) {
                                    doc.is_friend_requested = false;
                                    return s_cb(doc);
                                }, function (nothing) {
                                    doc.is_friend_requested = true;
                                    return s_cb(doc);
                                });
                            }, function () {
                                doc.is_friend = true;
                                doc.is_friend_requested = false;
                                return s_cb(doc);
                            });
                    }
                }
            });
    },
    get_profile: function (connected_db, user_id, secret_id, type, id, f_cb, s_cb) {
        try {
            user_id = new ObjectId(user_id);
        } catch (e) {
            return f_cb();
        }
        var first_key, second_key, first = {}, second = {};
        first["_id"] = user_id;
        first["secret_id"] = secret_id;
        first["is_removed"] = false;
        if (
            type === "blog_name" ||
            type === "simple_career" ||
            type === "self_introduction"
        ) {
            second["_id"] = 0;
            second[type] = 1;
            if (type === "simple_career") {
                second["show_simple_career"] = 1
            }
            connected_db.collection('users').findOne(first, second, function(err, doc) {
                if (err) {
                    return f_cb();
                } else {
                    if (doc === null) {
                        return f_cb();
                    } else {
                        return s_cb(doc);
                    }
                }
            });
        } else if (type === "iq_eq") {
            second["_id"] = 0;
            second["iq"] = 1;
            second["eq"] = 1;
            connected_db.collection('users').findOne(first, second, function(err, doc) {
                if (err) {
                    return f_cb();
                } else {
                    if (doc === null) {
                        return f_cb();
                    } else {
                        return s_cb(doc);
                    }
                }
            });
        } else if (
            type === "employment" ||
            type === "education" ||
            type === "prize" ||
            type === "location" ||
            type === "website"
        ) {
            first_key = type + "._id";
            first[first_key] = id;
            second_key = type + ".$";
            second[second_key] = 1;
            connected_db.collection('users').findOne(first, second, function(err, doc) {
                if (err) {
                    return f_cb();
                } else {
                    if (doc === null) {
                        return f_cb();
                    } else {
                        return s_cb(doc[type][0]);
                    }
                }
            });
        } else if ( type === "all" && id === "all" ) {
            connected_db.collection('users').findOne(
                first,
                {
                    _id:0,
                    name:1,
                    img:1,
                    simple_career:1,
                    show_simple_career:1,
                    employment:1,
                    education:1,
                    location:1,
                    prize:1,
                    website:1
                }, function(err, doc) {
                    if (err) {
                        return f_cb();
                    } else {
                        if (doc === null) {
                            return f_cb();
                        } else {
                            return s_cb(doc);
                        }
                    }
            });
        } else {
            return f_cb();
        }
    },
    update_profile: function (connected_db, user, user_id, secret_id, type, value, f_cb, s_cb) {
        try {
            user_id = new ObjectId(user_id);
        } catch (e) {
            return f_cb();
        }
        var first = {}, second = {}, inner_second = {}, title;
        first["is_removed"] = false;
        if (
            type === "blog_name" ||
            type === "simple_career" ||
            type === "self_introduction"
        ) {
            first["_id"] = user_id;
            first["secret_id"] = secret_id;

            second["$set"] = {};
            if (type === "simple_career") {
                second["$set"][type] = value.simple_career;
                second["$set"]["show_simple_career"] = value.show_simple_career;
            } else {
                second["$set"][type] = value;
            }
        } else if (
            type === "iq_eq"
        ) {
            first["_id"] = user_id;
            first["secret_id"] = secret_id;
            second["$set"] = value;
        } else if (
            type === "add_employment" ||
            type === "add_education" ||
            type === "add_prize" ||
            type === "add_location" ||
            type === "add_website"
        ) {
            if (type === "add_employment") {
                title = "employment";
            } else if (type === "add_education") {
                title = "education";
            } else if (type === "add_prize") {
                title = "prize";
            } else if (type === "add_location") {
                title = "location";
            } else if (type === "add_website") {
                title = "website";
            }
            value["_id"] = randomstring.generate();
            first["_id"] = user_id;
            first["secret_id"] = secret_id;
            second["$push"] = {};
            second["$push"][title] = {};
            second["$push"][title]["$each"] = [];
            second["$push"][title]["$each"].push(value);
            if ( type === "add_prize" ) {
                second["$push"][title]["$sort"] = { received_year: -1, received_month: -1, received_day: -1 };
            } else if ( type === "add_website" ) {
            } else {
                second["$push"][title]["$sort"] = { ing: -1, end_year: -1, end_month: -1, end_day: -1, start_year: -1, start_month: -1, start_day: -1 };
            }
        }  else if (
            type === "update_employment" ||
            type === "update_education" ||
            type === "update_prize" ||
            type === "update_location" ||
            type === "update_website"
        ) {
            if (type === "update_employment") {
                title = "employment";
            } else if (type === "update_education") {
                title = "education";
            } else if (type === "update_prize") {
                title = "prize";
            } else if (type === "update_location") {
                title = "location";
            } else if (type === "update_website") {
                title = "website";
            }
            first["_id"] = user_id;
            first["secret_id"] = secret_id;
            first[title + "._id"] = value[title + ".$._id"];
            second["$set"] = value;
            inner_second["$push"] = {};
            inner_second["$push"][title] = {};
            inner_second["$push"][title]["$each"] = [];
            if ( type === "update_prize" ) {
                inner_second["$push"][title]["$sort"] = { received_year: -1, received_month: -1, received_day: -1 };
            } else if ( type === "update_website" ) {

            } else {
                inner_second["$push"][title]["$sort"] = { ing: -1, end_year: -1, end_month: -1, end_day: -1, start_year: -1, start_month: -1, start_day: -1 };
            }
        } else if (
            type === "remove_employment" ||
            type === "remove_education" ||
            type === "remove_prize" ||
            type === "remove_location" ||
            type === "remove_website"
        ) { /* document 제거 */
            if (type === "remove_employment") {
                title = "employment";
            } else if (type === "remove_education") {
                title = "education";
            } else if (type === "remove_prize") {
                title = "prize";
            } else if (type === "remove_location") {
                title = "location";
            } else if (type === "remove_website") {
                title = "website";
            }
            first["_id"] = user_id;
            first["secret_id"] = secret_id;
            second["$pull"] = {};
            second["$pull"][title] = {};
            second["$pull"][title]["_id"] = value;
        }
        var self = this;
        connected_db.collection('users').findOneAndUpdate(
            first, second, {returnOriginal:false}, function(err, res) {
                if (err === null) {
                    if (res.ok !== 1) {
                        return f_cb();
                    }
                    var returned = res.value;
                    if (returned === null) {
                        return f_cb();
                    }
                    if (
                        type === "update_employment" ||
                        type === "update_education" ||
                        type === "update_prize" ||
                        type === "update_location"
                    ) {
                        connected_db.collection('users').updateOne(
                            {
                                _id: user_id,
                                secret_id:secret_id,
                                is_removed:false
                            },
                            inner_second, function(err, res) {
                                return s_cb(returned);
                            }
                        );
                    } else {
                        if (type === "blog_name") {
                            connected_db.collection('articles').update(
                                {
                                    type: {
                                        $in: ["blog", "gallery"]
                                    },
                                    blog_id: user["blog_id"]
                                },
                                {
                                    $set: {
                                        blog_name: value
                                    }
                                },
                                {
                                    multi:true
                                },
                                function (err, res) {
                                    return s_cb(returned);
                                }
                            );
                        } else {
                            return s_cb(returned);
                        }
                    }
                } else {
                    return f_cb();
                }
            }
        );
    },
    update_profile_image: function (connected_db, blog_id, img, f_cb, s_cb) {
        var first = {}
            , second = {};
        first.blog_id = blog_id;
        second["$set"] = {};
        second["$set"].img = img;
        second["$set"].is_img_set = true;
        connected_db.collection('users').updateOne(first, second, function (err, res) {
            if (err) {
                return f_cb(null);
            } else {
                if (res.result.n === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(null);
                }
            }
        });
    },
    change_all_profile_info: function (connected_db, blog_id, type, value, f_cb, s_cb) {
        var first
            , second
            , date = this.to_eight_digits_date();
        if (type === "img") {
            first = {blog_id: blog_id, type: {"$ne": "gallery"}};
            second = { "$set": {img: value }};
        } else if (type === "name") {
            first = {blog_id: blog_id, type: {"$nin": ["blog", "gallery"]}};
            second = { "$set": {name: value }};
        }
        connected_db.collection('articles').update(first, second, {multi:true}, function (err, res) {
            if (err) {
                return f_cb(null);
            } else {
                first = {blog_id: blog_id, "$or": [{"type": "apply_now"}, {"type": "hire_me"}]};
                connected_db.collection('employment').update(first, second, {multi:true}, function (err, res) {
                    if (err) {
                        return f_cb(null);
                    } else {
                        first = {blog_id: blog_id};
                        connected_db.collection('comments').update(first, second, {multi:true}, function (err, res) {
                            if (err) {
                                return f_cb(null);
                            } else {
                                connected_db.collection('online_interview').update(first, second, {multi:true}, function (err, res) {
                                    if (err) {
                                        return f_cb(null);
                                    } else {
                                        connected_db.collection('tags').update(first, second, {multi:true}, function (err, res) {
                                            if (err) {
                                                return f_cb(null);
                                            } else {
                                                first = {visitor_blog_id: blog_id, date: date};
                                                if (type === "img") {
                                                    second = {"$set":{visitor_img:value}};
                                                } else if (type === "name") {
                                                    second = {"$set":{visitor_name:value}};
                                                }
                                                connected_db.collection('visitors').update(first, second, {multi:true}, function (err, res) {
                                                    if (err) {
                                                        return f_cb(null);
                                                    } else {
                                                        first = {visitor_blog_id: blog_id};
                                                        if (type === "img") {
                                                            second = {"$set":{img:value}};
                                                        } else if (type === "name") {
                                                            second = {"$set":{name:value}};
                                                        }
                                                        connected_db.collection('guestbook').update(first, second, {multi:true}, function (err, res) {
                                                            if (err) {
                                                                return f_cb(null);
                                                            } else {
                                                                first = {};
                                                                first["comments.blog_id"] = blog_id;
                                                                second = {};
                                                                second["$set"] = {};
                                                                second["$set"]["comments.$." + type] = value;
                                                                connected_db.collection('guestbook').update(first, second, {multi:true}, function (err, res) {
                                                                    if (err) {
                                                                        return f_cb(null);
                                                                    } else {
                                                                        return s_cb(null);
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    },
    update_guestbook_comment: function (connected_db, data, user, type, f_cb, s_cb) {
        var self = this
            , first = {}
            , second = {}
            , now = new Date().valueOf()
            , notification = {};
        if (type === "add") {
            first._id = data.guestbook_id;
            first.blog_id = data.blog_id;
            first.visitor_blog_id = data.visitor_blog_id;
            second["$push"] = {};
            second["$push"]["comments"] = {};
            second["$push"]["comments"]["$each"] = [];
            second["$push"]["comments"]["$each"].push({
                _id: randomstring.generate()
                , blog_id: user.blog_id
                , name: user.name
                , img: user.img
                , comment: data.comment
                , created_at: now
                , updated_at: now
            });
            second["$push"]["comments"]["$sort"] = { created_at: -1 };
        } else if (type === "update") {
            first._id = data.guestbook_id;
            first["comments._id"] = data._id;
            first["comments.blog_id"] = user.blog_id;
            second["$set"] = {};
            second["$set"]["comments.$.img"] = user.img;
            second["$set"]["comments.$.comment"] = data.comment;
            second["$set"]["comments.$.updated_at"] = now;
        } else if (type === "remove") {
            first._id = data.guestbook_id;
            first.blog_id = data.blog_owner_blog_id;
            first["comments._id"] = data._id;
            first["comments.blog_id"] = data.blog_id;
            second["$pull"] = {};
            second["$pull"]["comments"] = {};
            second["$pull"]["comments"]["_id"] = data._id;
        } else {
            return f_cb(null);
        }
        connected_db.collection('guestbook').findOneAndUpdate(
            first, second, {returnOriginal:false}, function(err, res) {
                if (err === null) {
                    if (res.ok !== 1) {
                        return f_cb(null);
                    }
                    var returned = res.value;
                    if (returned === null) {
                        return f_cb(null);
                    }
                    if (type === "add") {
                        notification = {};
                        notification.type = "comment_written";
                        notification.link = "/blog/" + first.blog_id + "/guestbook/" + first._id;
                        notification.blog_id = user.blog_id;
                        notification["info"] = {};
                        notification["info"]["users"] = [];
                        notification["info"]["users"].push({
                            blog_id: user.blog_id
                            , name: user.name
                            , img: user.img
                        });
                        notification["info"]["type"] = "guestbook";
                        notification.subscribers = [];
                        if (first.blog_id === user.blog_id) { /* When Profile Owner wrote a comment */
                            notification.subscribers.push(first.visitor_blog_id);
                        } else { /* When Visitor wrote a comment */
                            notification.subscribers.push(first.blog_id);
                        }
                        self.insert_notification(connected_db, notification, function (nothing) {
                            return s_cb(returned.comments);
                        }, function (nothing) {
                            return s_cb(returned.comments);
                        });
                    } else {
                        return s_cb(returned.comments);
                    }
                } else {
                    return f_cb(null);
                }
            });
    },
    // update_user_written_tags: function (connected_db, blog_id, written_tags, f_cb, s_cb) {
    //     /*db.users.update({blog_id: "admin"}, {$push: {written_tags: { $each: ["c", "b", "a"], $sort: 1 }}});*/
    //     connected_db.collection('users').updateOne(
    //         {
    //             blog_id: blog_id,
    //             is_removed:false
    //         },
    //         {
    //             $push: {
    //                 written_tags : {
    //                     $each: written_tags,
    //                     $sort: 1
    //                 }
    //             }
    //         },
    //         function(err, res) {
    //             if (err === null) {
    //                 s_cb(null);
    //             } else {
    //                 return f_cb(null);
    //             }
    //         });
    // },
    /**
     * action: "inc" || "dec"
     **/
    update_user_count_awesome: function (connected_db, data, f_cb, s_cb) {
        var first = {}
            , second = {};
        first.blog_id = data.blog_id;
        second["$inc"] = {};
        second["$inc"].count_awesome = data.count;
        connected_db.collection('users').updateOne(first, second, function (err, res) {
            if (err) {
                return f_cb(null);
            } else {
                if (res.result.n === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(null);
                }
            }
        });
    },
    update_blog_count_view: function (connected_db, blog_id, f_cb, s_cb) {
        if (blog_id === "") {
            return f_cb(null);
        }
        var today = this.to_eight_digits_date()
            , second = {};
        connected_db.collection('users').findOne(
            {blog_id: blog_id},
            function(err, doc) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (doc === null) {
                        return f_cb(null);
                    } else {
                        second["$set"] = {};
                        second["$set"].today = today;
                        if (today === doc.today) {
                            second["$set"].count_today_view = doc.count_today_view + 1;
                        } else {
                            second["$set"].count_today_view = 1;
                        }
                        second["$set"].count_total_view = doc.count_total_view + 1;
                        connected_db.collection('users').updateOne(
                            {_id: doc._id}, second,
                            function(err, res) {
                                return s_cb();
                            });
                    }
                }
            });
    },
    update_today_visitors: function (connected_db, doc, cb) {
        if (doc.visitor_blog_id === "gleant") {
            return cb();
        } else {
            connected_db.collection('visitors').updateOne(
                {
                    blog_id: doc.blog_id,
                    visitor_blog_id: doc.visitor_blog_id,
                    date: doc.date
                },
                {
                    $set: doc
                },
                {
                    upsert:true
                },
                function(err, res) {
                    return cb();
                });
        }
    },
    get_today_visitors: function (connected_db, blog_id, created_at, f_cb, s_cb) {
        var first = {};
        var second = {
            _id:0,
            blog_id:0,
            date:0
        };
        first["blog_id"] = blog_id;
        first["date"] = this.to_eight_digits_date();
        if (created_at !== undefined) {
            first["created_at"] = {};
            first["created_at"]["$lt"] = created_at;
        }
        connected_db.collection('visitors').find(first, second).sort({created_at: -1}).limit(limit.today_visitors).toArray(function(err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return f_cb();
                    } else {
                        return s_cb(docs);
                    }
                } else {
                    return f_cb();
                }
        });
    },
    insert_employment_announcement: function (connected_db, data, user, f_cb, s_cb) {
        var temp = new Date()
            , date1 = temp.valueOf()
            , first = {}
            , created_obj;
        first["_id"] = user["blog_id"] + "_" + date1 + randomstring.generate(6);
        first["type"] = "announcement";
        first["blog_id"] = user.blog_id;
        first["article_id"] = data.article_id;
        first["title"] = data.title;
        first["content"] = data.content;
        first["created_at"] = date1;
        first["updated_at"] = date1;
        created_obj = first;
        connected_db.collection('employment').insertOne(first, function (err, res) {
            if (err === null) {
                return s_cb(created_obj);
            } else {
                return f_cb(null);
            }
        });
    },
    update_employment_announcement: function (connected_db, data, user, f_cb, s_cb) {
        var temp = new Date()
            , date1 = temp.valueOf()
            , first = {}
            , second = {};

        first["_id"] = data._id;
        first["article_id"] = data.article_id;
        first["type"] = "announcement";
        second["$set"] = {};
        second["$set"]["title"] = data.title;
        second["$set"]["content"] = data.content;
        second["$set"]["updated_at"] = date1;
        connected_db.collection('employment').updateOne(first, second, function (err, res) {
            if (err) {
                return f_cb(null);
            } else {
                if (res.result.n === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(null);
                }
            }
        });
    },
    remove_employment_announcement: function (connected_db, data, user, f_cb, s_cb) {
        var first = {};
        first._id = data._id;
        first.article_id = data.article_id;
        first.type = "announcement";
        connected_db.collection('employment').remove(first, function (err, res) {
            if (err === null) {
                return s_cb(null);
            } else {
                return f_cb(null);
            }
        });
    },
    get_single_online_interview_answer: function (connected_db, data, user, f_cb, s_cb) {
        connected_db.collection('online_interview').findOne(
            {type: "answer", blog_id: user.blog_id, article_id: data.article_id},
            function(err, doc) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (doc === null) {
                        return f_cb(null);
                    } else {
                        return s_cb(null);
                    }
                }
            });
    },
    apply_online_interview: function (connected_db, data, user, f_cb, s_cb) {
        var temp = new Date()
            , date1 = temp.valueOf()
            , first = {};
        first["_id"] = user["blog_id"] + "_" + date1 + randomstring.generate(6);
        first["type"] = "answer";
        first["blog_id"] = user.blog_id;
        first["img"] = user.img;
        first["name"] = user.name;
        first["article_id"] = data.article_id;
        first["answers"] = data.answers;
        first["created_at"] = date1;
        connected_db.collection('online_interview').insertOne(first, function (err, res) {
            if (err === null) {
                return s_cb(null);
            } else {
                return f_cb(null);
            }
        });
    },
    insert_employment: function(connected_db, data, user, f_cb, s_cb) {
        var temp = new Date()
            , date1 = temp.valueOf()
            , first = {}
            , created_obj;
        if (data["type"] === "apply_now") { /* Apply Now */
            data["content"] = this.get_xss_prevented_content("employment", data["content"]);

            first["_id"] = user["blog_id"] + "_" + date1 + randomstring.generate(6);
            first["type"] = data["type"];
            first["name"] = user["name"];
            first["blog_id"] = user["blog_id"];
            first["img"] = user["img"];
            first["language"] = data["language"];
            first["public_authority"] = data["public_authority"];
            first["is_online_interview_set"] = data["is_online_interview_set"];
            first["application_authority"] = data["application_authority"];
            first["is_start_set"] = data["is_start_set"];
            first["start_at"] = data["start_at"];
            first["is_finish_set"] = data["is_finish_set"];
            first["finish_at"] = data["finish_at"];
            first["questions"] = data["questions"];
            first["company"] = data["company"];
            first["logo"] = data["logo"];
            first["business_type"] = data["business_type"];
            first["country"] = data["country"];
            first["city"] = data["city"];
            first["protocol"] = data["protocol"];
            first["url"] = data["url"];
            first["job"] = data["job"];
            first["employment_status"] = data["employment_status"];
            first["decide_salary_later"] = data["decide_salary_later"];
            first["salary_period"] = data["salary_period"];
            first["salary"] = data["salary"];
            first["salary_unit"] = data["salary_unit"];
            first["title"] = data["title"];
            first["content"] = data["content"];
            first["tags"] = data["tags"];
            first["is_youtube_inserted"] = this.is_youtube_inserted(data["content"]);
            first["count_view"] = 0;
            first["count_awesome"] = 0;
            first["count_announcement"] = 0;
            first["count_online_interview"] = 0;
            first["count_comments"] = 0;
            first["members"] = [];
            first["members"].push(user["blog_id"]);
            first["likers"] = [];
            first["subscribers"] = [];
            first["subscribers"].push(user["blog_id"]);
            first["is_removed"] = false;
            first["created_at"] = date1;
            first["updated_at"] = date1;
            first["date"] = this.to_eight_digits_date();
            first["es_index"] = "";
            first["es_type"] = "";
            first["es_id"] = "";
            first["es_updated_at"] = 0;
            first["es_is_updated"] = false;
        } else if (data["type"] === "hire_me") { /* Hire Me */
            data["content"] = this.get_xss_prevented_content("employment", data["content"]);
            first["_id"] = user["blog_id"] + "_" + date1 + randomstring.generate(6);
            first["type"] = data["type"];
            first["name"] = user["name"];
            first["blog_id"] = user["blog_id"];
            first["img"] = user["img"];
            first["language"] = data["language"];
            first["public_authority"] = data["public_authority"];
            first["job"] = data["job"];
            first["employment_status"] = data["employment_status"];
            first["decide_salary_later"] = data["decide_salary_later"];
            first["salary_period"] = data["salary_period"];
            first["salary"] = data["salary"];
            first["salary_unit"] = data["salary_unit"];
            first["title"] = data["title"];
            first["content"] = data["content"];
            first["tags"] = data["tags"];
            first["is_youtube_inserted"] = this.is_youtube_inserted(data["content"]);
            first["count_view"] = 0;
            first["count_awesome"] = 0;
            first["count_comments"] = 0;
            first["members"] = [];
            first["members"].push(user["blog_id"]);
            first["likers"] = [];
            first["subscribers"] = [];
            first["subscribers"].push(user["blog_id"]);
            first["is_removed"] = false;
            first["created_at"] = date1;
            first["updated_at"] = date1;
            first["date"] = this.to_eight_digits_date();
            first["es_index"] = "";
            first["es_type"] = "";
            first["es_id"] = "";
            first["es_updated_at"] = 0;
            first["es_is_updated"] = false;
        } else {
            return f_cb(null);
        }
        created_obj = first;
        connected_db.collection('employment').insertOne(first, function (err, res) {
            if (err === null) {
                var pathname;
                if (data["type"] === 'apply_now') {
                    pathname = '/apply-now/' + res["ops"][0]._id;
                } else if (data["type"] === 'hire_me') {
                    pathname = '/hire-me/' + res["ops"][0]._id;
                } else {
                    pathname = '/error/404';
                }
                return s_cb(pathname, created_obj);
            } else {
                return f_cb(null);
            }
        });
    },
    insert_article: function(connected_db, data, user, f_cb, s_cb) {
        var temp = new Date()
            , date1 = temp.valueOf()
            , first = {}
            , root_id
            , created_obj;
        if (
            data["type"] === "agenda" ||
            data["type"] === "opinion" ||
            data["type"] === "blog"
        ) {
            if (data["type"] === "blog") {
                data["content"] = this.get_xss_prevented_content("blog", data["content"]);
            } else {
                data["content"] = this.get_xss_prevented_content("debate", data["content"]);
            }
        }
        if (data["type"] === "agenda") {
            root_id = first["_id"] = user["blog_id"] + "_" + date1 + randomstring.generate(6);
            first["type"] = data["type"];
            first["name"] = user["name"];
            first["blog_id"] = user["blog_id"];
            first["img"] = user["img"];
            first["profile"] = data["profile"];
            first["language"] = data["language"];
            first["main_tag"] = data["main_tag"];
            first["tags"] = data["tags"];
            first["title"] = data["title"];
            first["content"] = data["content"];
            first["img_list"] = data["img_list"];
            first["is_youtube_inserted"] = this.is_youtube_inserted(data["content"]);
            first["count_view"] = 0;
            first["count_awesome"] = 0;
            first["count_written_opinions"] = 0;
            first["count_requested_opinions"] = 0;
            first["count_written_translations"] = [];
            first["count_written_translations"].push({
                language: "en"
                , count: 0
            });
            first["count_written_translations"].push({
                language: "ja"
                , count: 0
            });
            first["count_written_translations"].push({
                language: "ko"
                , count: 0
            });
            first["count_written_translations"].push({
                language: "zh-Hans"
                , count: 0
            });
            first["count_requested_translations"] = 0;
            first["count_comments"] = 0;
            first["members"] = [];
            first["members"].push(user["blog_id"]);
            first["likers"] = [];
            first["subscribers"] = [];
            first["subscribers"].push(user["blog_id"]);

            first["public_authority"] = data["public_authority"];
            first["opinion_authority"] = data["opinion_authority"];
            first["translation_authority"] = data["translation_authority"];
            first["comment_authority"] = data["comment_authority"];

            first["is_start_set"] = data["is_start_set"];
            first["start_at"] = data["start_at"];
            first["is_finish_set"] = data["is_finish_set"];
            first["finish_at"] = data["finish_at"];

            first["is_removed"] = false;
            first["created_at"] = date1;
            first["updated_at"] = date1;

            first["date"] = this.to_eight_digits_date();
            first["es_index"] = "";
            first["es_type"] = "";
            first["es_id"] = "";
            first["es_updated_at"] = 0;
            first["es_is_updated"] = false;
        } else if (data["type"] === "opinion") {
            first["_id"] = user["blog_id"] + "_" + date1 + randomstring.generate(6);
            first["type"] = data["type"];
            root_id = first["agenda_id"] = data["agenda_id"];
            first["name"] = user["name"];
            first["blog_id"] = user["blog_id"];
            first["root_blog_id"] = data["root_blog_id"];
            first["img"] = user["img"];
            first["profile"] = data["profile"];
            first["language"] = data["language"];
            first["main_tag"] = data["main_tag"];
            first["tags"] = data["tags"];
            first["title"] = data["title"];
            first["content"] = data["content"];
            first["img_list"] = data["img_list"];
            first["is_youtube_inserted"] = this.is_youtube_inserted(data["content"]);
            first["count_view"] = 0;
            first["count_awesome"] = 0;
            first["count_written_translations"] = [];
            first["count_written_translations"].push({
                language: "en"
                , count: 0
            });
            first["count_written_translations"].push({
                language: "ja"
                , count: 0
            });
            first["count_written_translations"].push({
                language: "ko"
                , count: 0
            });
            first["count_written_translations"].push({
                language: "zh-Hans"
                , count: 0
            });
            first["count_requested_translations"] = 0;
            first["count_comments"] = 0;
            first["members"] = data["members"];
            first["likers"] = [];
            first["subscribers"] = [];
            first["subscribers"].push(user["blog_id"]);

            first["public_authority"] = data["public_authority"];
            first["opinion_authority"] = data["opinion_authority"];
            first["translation_authority"] = data["translation_authority"];
            first["comment_authority"] = data["comment_authority"];

            first["is_start_set"] = data["is_start_set"];
            first["start_at"] = data["start_at"];
            first["is_finish_set"] = data["is_finish_set"];
            first["finish_at"] = data["finish_at"];

            first["is_removed"] = false;
            first["created_at"] = date1;
            first["updated_at"] = date1;
            first["date"] = this.to_eight_digits_date();
            first["es_index"] = "";
            first["es_type"] = "";
            first["es_id"] = "";
            first["es_updated_at"] = 0;
            first["es_is_updated"] = false;
        } else if (data["type"] === "blog") {
            root_id = first["_id"] = date1 + randomstring.generate();
            first["type"] = "blog";
            first["img"] = user.img;
            first["language"] = data.language;
            first["public_authority"] = data.public_authority;
            first["blog_menu_id"] = data.blog_menu_id;
            first["blog_name"] = user.blog_name;
            first["blog_id"] = user.blog_id;
            first["tags"] = data.tags;
            first["title"] = data.title;
            first["content"] = data.content;
            first["img_list"] = data.img_list;
            first["is_youtube_inserted"] = this.is_youtube_inserted(data["content"]);
            first["count_view"] = 0;
            first["count_awesome"] = 0;
            first["count_written_translations"] = [];
            first["count_written_translations"].push({
                language: "en"
                , count: 0
            });
            first["count_written_translations"].push({
                language: "ja"
                , count: 0
            });
            first["count_written_translations"].push({
                language: "ko"
                , count: 0
            });
            first["count_written_translations"].push({
                language: "zh-Hans"
                , count: 0
            });
            first["count_requested_translations"] = 0;
            first["count_comments"] = 0;
            first["likers"] = [];
            first["subscribers"] = [];
            first["subscribers"].push(user.blog_id);
            first["is_removed"] = false;
            first["created_at"] = date1;
            first["updated_at"] = date1;
            first["date"] = this.to_eight_digits_date();
            first["es_index"] = "";
            first["es_type"] = "";
            first["es_id"] = "";
            first["es_updated_at"] = 0;
            first["es_is_updated"] = false;
        } else if (data["type"] === "gallery") {
            return f_cb(null);
        } else {
            return f_cb(null);
        }
        created_obj = first;

        connected_db.collection('articles').insertOne(first, function (err, res) {
            if (err === null) {
                var pathname;
                if (data["type"] === 'agenda') {
                    pathname = '/agenda/' + res["ops"][0]._id;
                } else if (data["type"] === 'opinion') {
                    pathname = '/agenda/' + res["ops"][0].agenda_id + '/opinion/' + res["ops"][0]._id;
                } else if (data["type"] === 'blog') {
                    pathname = '/blog/' + res["ops"][0].blog_id + '/' + res["ops"][0].blog_menu_id + '/' + res["ops"][0]._id;
                } else {
                    pathname = '';
                }

                /* agenda, opinion, blog일 때 .iframe-vote 확인하기 */
                if (
                    data["type"] === 'agenda' ||
                    data["type"] === 'opinion' ||
                    data["type"] === 'blog'
                ) {
                    var $ = cheerio.load(first.content, {decodeEntities: false})
                        , $iframe_votes = $('.iframe-vote')
                        , public_authority = first["public_authority"]
                        , finish_at;
                    first = {};
                    first["blog_id"] = user.blog_id;
                    first["_id"] = {};
                    first["_id"]["$in"] = [];
                    first["link"] = "";
                    second = {};
                    second["$set"] = {};

                    if (data["type"] === 'blog') {
                        second["$set"]["service_type"] = "blog";
                        second["$set"]["type"] = "unlimited";
                        second["$set"]["is_start_set"] = true;
                        second["$set"]["start_at"] = date1;
                    } else {
                        if (data.is_finish_set === true) {
                            temp = new Date(data.finish_at);
                            finish_at = temp.setMinutes(temp.getMinutes() + 30).valueOf();
                        } else {
                            finish_at = data.finish_at;
                        }
                        second["$set"]["service_type"] = "debate";
                        second["$set"]["type"] = "limited";
                        second["$set"]["is_start_set"] = data["is_start_set"];
                        second["$set"]["start_at"] = data["start_at"];
                        second["$set"]["is_finish_set"] = data["is_finish_set"];
                        second["$set"]["finish_at"] = finish_at;
                    }
                    second["$set"]["updated_at"] = date1;
                    second["$set"]["link"] = pathname;
                    second["$set"]["root_id"] = root_id;
                    second["$set"]["public_authority"] = public_authority;
                    second["$set"]["language"] = data["language"];
                    if ($iframe_votes.length > 0 ) {
                        $iframe_votes.each(function(i, e) {
                            first["_id"]["$in"].push($(e).attr('id').replace('iframe-vote-', ''));
                        });
                        connected_db.collection('votes').update(
                            first,
                            second,
                            {multi:true},
                            function (err, res) {
                                connected_db.collection('votes').remove(
                                    {
                                        blog_id: first.blog_id
                                        , link: ""
                                    },
                                    {multi: true},
                                    function (err, res) {
                                        return s_cb(pathname, created_obj);
                                    }
                                );
                            }
                        )
                    } else {
                        return s_cb(pathname, created_obj);
                    }
                } else {
                    return s_cb(pathname, created_obj);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    update_employment: function(connected_db, first, second, user, f_cb, s_cb) {
        var pathname;
        if (first["type"] === "apply_now") {
            pathname = "/apply-now/" + first._id;
        } else if (first["type"] === "hire_me") {
            pathname = "/hire-me/" + first._id;
        } else {
            return f_cb(null);
        }
        connected_db.collection('employment').updateOne(first, second, function (err, res) {
            if (err) {
                return f_cb(null);
            } else {
                if (res.result.n === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(pathname);
                }
            }
        });
    },
    update_article: function(connected_db, first, second, user, vote_id_objs, f_cb, s_cb) {
        var pathname
            , service_type
            , root_id;

        /**
         * data["type"]은 agenda || opinion || blog || gallery
         */

        if (first["type"] === "agenda") {
            service_type = "debate";
            root_id = first._id;
            pathname = "/agenda/" + first._id;
        } else if (first["type"] === "opinion") {
            service_type = "debate";
            root_id = first.agenda_id;
            pathname = "/agenda/" + first.agenda_id + "/opinion/" + first._id;
        } else if (first["type"] === "blog") {
            service_type = "blog";
            root_id = first._id;
            pathname = "/blog/" + user.blog_id + "/" + second["$set"].blog_menu_id + "/" + first._id;
        } else if (first["type"] === "gallery") {
            service_type = "blog";
            root_id = first._id;
            pathname = "/blog/" + user.blog_id + "/gallery/" + first._id;
        } else {
            return f_cb(null);
        }

        connected_db.collection('articles').updateOne(first, second, function (err, res) {
            if (err) {
                return f_cb(null);
            } else {
                if (res.result.n === 0) {
                    return f_cb(null);
                } else {
                    if (
                        first["type"] === 'agenda' ||
                        first["type"] === 'opinion' ||
                        first["type"] === 'blog'
                    ) {
                        var $ = cheerio.load(second["$set"].content, {decodeEntities: false})
                            , $iframe_votes = $('.iframe-vote')
                            , public_authority = second["$set"]["public_authority"]
                            , updated_at = second["$set"].updated_at
                            , language = second["$set"].language
                            , _id
                            , temp
                            , is_finish_set
                            , finish_at
                            , is_start_set
                            , start_at
                            , type = first["type"];

                        if (first["type"] !== 'blog') {
                            is_start_set = second["$set"].is_start_set;
                            start_at = second["$set"].start_at;
                            is_finish_set = second["$set"].is_finish_set;
                            finish_at = second["$set"].finish_at;
                        }

                        first = {};
                        second = {};

                        first["blog_id"] = user.blog_id;
                        first["_id"] = {};
                        first["_id"]["$in"] = [];
                        first["is_removed"] = false;

                        second["$set"] = {};

                        if (type === 'blog') {
                            second["$set"]["type"] = "unlimited";
                            second["$set"]["is_start_set"] = true;
                            second["$set"]["start_at"] = updated_at;
                        } else {
                            if (is_finish_set === true) {
                                temp = new Date(finish_at);
                                finish_at = temp.setMinutes(temp.getMinutes() + 30).valueOf();
                            }
                            second["$set"]["type"] = "limited";
                            second["$set"]["is_start_set"] = is_start_set;
                            second["$set"]["start_at"] = start_at;
                            second["$set"]["is_finish_set"] = is_finish_set;
                            second["$set"]["finish_at"] = finish_at;
                        }
                        second["$set"]["service_type"] = service_type;
                        second["$set"]["updated_at"] = updated_at;
                        second["$set"]["link"] = pathname;
                        second["$set"]["root_id"] = root_id;
                        second["$set"]["public_authority"] = public_authority;

                        if ($iframe_votes.length > 0 ) { /* 변경하는 도큐먼트에 투표함이 존재하는 경우 */
                            second["$set"]["language"] = language;

                            $iframe_votes.each(function(i, e) {
                                _id = $(e).attr('id').replace('iframe-vote-', '');
                                if (vote_id_objs[_id] === true) { /* 기존에 사용하던 투표 그대로 사용한 경우 */
                                    vote_id_objs[_id] = false;
                                    delete vote_id_objs[_id];
                                }
                                first["_id"]["$in"].push(_id);
                            });
                            connected_db.collection('votes').update(
                                first,
                                second,
                                {multi:true},
                                function (err, res) {
                                    connected_db.collection('votes').remove(
                                        {
                                            blog_id: first.blog_id
                                            , link: ""
                                        },
                                        {multi: true},
                                        function (err, res) {
                                            /* 기존에 사용하던 투표 사용안하면 삭제하기 */
                                            if (Object.keys(vote_id_objs).length > 0) { /* is_removed: false, public_authority:0으로 변경하기 */
                                                first = {};
                                                second = {};

                                                first["blog_id"] = user.blog_id;
                                                first["_id"] = {};
                                                first["_id"]["$in"] = [];
                                                first["is_removed"] = false;

                                                second["$set"] = {};
                                                second["$set"]["link"] = pathname;
                                                second["$set"]["updated_at"] = updated_at;
                                                second["$set"]["is_removed"] = true;
                                                second["$set"]["public_authority"] = 0;

                                                for (var key in vote_id_objs) {
                                                    if (vote_id_objs[key] === true) {
                                                        first["_id"]["$in"].push(key);
                                                    }
                                                }
                                                if (first["_id"]["$in"].length > 0) {
                                                    connected_db.collection('votes').update(
                                                        first,
                                                        second,
                                                        {multi:true},
                                                        function (err, res) {
                                                            return s_cb(pathname);
                                                        });
                                                } else {
                                                    return s_cb(pathname);
                                                }
                                            } else {
                                                return s_cb(pathname);
                                            }
                                        }
                                    );
                                });
                        } else { /* 변경하는 도큐먼트에 투표함이 존재하지 않는 경우 */
                            if (Object.keys(vote_id_objs).length > 0) { /* is_removed: false, public_authority:0으로 변경하기 */
                                second["$set"]["is_removed"] = true;
                                second["$set"]["public_authority"] = 0;

                                for (var key in vote_id_objs) {
                                    if (vote_id_objs[key] === true) {
                                        first["_id"]["$in"].push(key);
                                    }
                                }
                                if (first["_id"]["$in"].length > 0) {
                                    connected_db.collection('votes').update(
                                        first,
                                        second,
                                        {multi:true},
                                        function (err, res) {
                                            connected_db.collection('votes').remove(
                                                {
                                                    blog_id: first.blog_id
                                                    , link: ""
                                                },
                                                {multi: true},
                                                function (err, res) {
                                                    return s_cb(pathname);
                                                }
                                            );
                                        });
                                } else {
                                    return s_cb(pathname);
                                }
                            } else {
                                return s_cb(pathname);
                            }
                        }
                    } else {
                        return s_cb(pathname);
                    }
                }
            }
        });
    },
    insert_translation: function (connected_db, data, f_cb, s_cb) {
        var pathname;
        if (data.type === 'tr_agenda') {
            pathname = '/agenda/' + data.agenda_id + '/tr/' + data._id;
        } else if (data.type === 'tr_opinion') {
            pathname = '/agenda/' + data.agenda_id + '/opinion/' + data.opinion_id + '/tr/' + data._id;
        } else {
            return f_cb(null);
        }
        data["es_index"] = "";
        data["es_type"] = "";
        data["es_id"] = "";
        data["es_updated_at"] = 0;
        data["es_is_updated"] = false;
        connected_db.collection('articles').insertOne(data, function (err, res) {
            if (err === null) {
                return s_cb(pathname);
            } else {
                return f_cb(null);
            }
        });
    },
    update_translation: function (connected_db, first, second, f_cb, s_cb) {
        var pathname;
        if (first.type === 'tr_agenda') {
            pathname = '/agenda/' + first.agenda_id + '/tr/' + first._id;
        } else if (first.type === 'tr_opinion') {
            pathname = '/agenda/' + first.agenda_id + '/opinion/' + first.opinion_id + '/tr/' + first._id;
        } else {
            return f_cb(null);
        }
        connected_db.collection('articles').updateOne(first, second, function (err, res) {
            if (err) {
                return f_cb(null);
            } else {
                if (res.result.n === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(pathname);
                }
            }
        });
    },
    remove_document: function (connected_db, collection_name, first, f_cb, s_cb) {
        var second = {};
        second["$set"] = {};
        second["$set"].public_authority = 0;
        second["$set"].is_removed = true;
        second["$set"].updated_at = new Date().valueOf();

        connected_db.collection(collection_name).updateOne(first, second, function (err, res) {
            if (err) {
                return f_cb(null);
            } else {
                if (res.result.n === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(null);
                }
            }
        });
    },
    insert_guestbook: function (connected_db, data, user, f_cb, s_cb) {
        var first = {}
            , now = new Date().valueOf()
            , self = this
            , notification = {};
        first._id = data.blog_id + "_" + user.blog_id + "_" + randomstring.generate() + "_" + new Date().valueOf();
        first.blog_id = data.blog_id;
        first.visitor_blog_id = user.blog_id;
        first.name = user.name;
        first.img = user.img;
        first.content = data.content;
        if (data.is_secret === true) {
            first.public_authority = 0;
        } else {
            first.public_authority = 1;
        }
        first.is_removed = false;
        first.created_at = now;
        first.updated_at = now;
        first.comments = [];

        notification = {};
        notification.type = "guestbook_written";
        notification.link = "/blog/" + data.blog_id + "/guestbook/" + first._id;
        notification.blog_id = user.blog_id;
        notification["info"] = {};
        notification["info"]["users"] = [];
        notification["info"]["users"].push({
            blog_id: user.blog_id
            , name: user.name
            , img: user.img
        });
        notification.subscribers = [];
        notification.subscribers.push(data.blog_id);

        connected_db.collection('guestbook').insertOne(first, function (err, res) {
            if (err === null) {
                delete first.is_removed;
                return self.insert_notification(connected_db, notification, function (nothing) {
                    return s_cb(first);
                }, function (nothing) {
                   return s_cb(first);
                });
            } else {
                return f_cb(null);
            }
        });
    },
    update_guestbook: function (connected_db, data, user, f_cb, s_cb) {
        var first = {}
            , second = {}
            , now = new Date().valueOf();

        first._id = data._id;
        first.blog_id = data.blog_id;
        first.visitor_blog_id = data.visitor_blog_id;

        second["$set"] = {};
        second["$set"].img = user.img;
        second["$set"].content = data.content;
        if (data.is_secret === true) {
            second["$set"].public_authority = 0;
        } else {
            second["$set"].public_authority = 1;
        }
        second["$set"].updated_at = now;
        connected_db.collection('guestbook').findOneAndUpdate(
            first, second, {returnOriginal:false}, function(err, res) {
                if (err === null) {
                    if (res.ok !== 1) {
                        return f_cb(null);
                    }
                    var returned = res.value;
                    if (returned === null) {
                        return f_cb(null);
                    }
                    return s_cb(returned);
                } else {
                    return f_cb(null);
                }
            });
    },
    remove_guestbook: function (connected_db, data, user, f_cb, s_cb) {
        var first = {}
            , second = {}
            , now = new Date().valueOf();

        first._id = data._id;
        first.blog_id = data.blog_id;
        first.visitor_blog_id = data.visitor_blog_id;

        second["$set"] = {};
        second["$set"].public_authority = 0;
        second["$set"].is_removed = true;
        second["$set"].updated_at = now;

        connected_db.collection('guestbook').updateOne(
            first,
            second, function (err, res) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (res.result.n === 0) {
                        return f_cb(null);
                    } else {
                        return s_cb(null);
                    }
                }
            });
    },
    is_member: function (connected_db, collection_name, data, pass_obj, cb) {
        connected_db.collection(collection_name).findOne(
            {_id: data._id, members: data.blog_id, is_removed:false},
            function(err, doc) {
                if (err) {
                    if (pass_obj === true) {
                        return cb(false, null);
                    } else {
                        return cb(false);
                    }
                } else {
                    if (doc === null) {
                        if (pass_obj === true) {
                            return cb(false, null);
                        } else {
                            return cb(false);
                        }
                    } else {
                        if (pass_obj === true) {
                            return cb(true, doc);
                        } else {
                            return cb(true);
                        }
                    }
                }
            });
    },
    /* data.type {String} - opinion || tr_agenda || tr_opinion */
    is_not_member_not_wrote_article: function (connected_db, collection_name, data, f_cb, s_cb) {
        var first = {};
        first.is_removed = false;
        first["$or"] = [];
        first["$or"].push({
            type: "agenda"
            , _id: data.agenda_id
            , members: data.blog_id
        });
        if (data.type === "tr_opinion") {
            first["$or"].push({
                type: data.type
                , agenda_id: data.agenda_id
                , opinion_id: data.opinion_id
                , blog_id: data.blog_id
            });
        } else {
            first["$or"].push({
                type: data.type
                , agenda_id: data.agenda_id
                , blog_id: data.blog_id
            });
        }
        connected_db.collection(collection_name).findOne(
            first,
            function(err, doc) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (doc === null) {
                        return s_cb(true);
                    } else {
                        return s_cb(false);
                    }
                }
            });
    },
    is_friend: function (connected_db, user_blog_id, target_blog_id, f_cb, s_cb) {
        connected_db.collection('users').findOne(
            {blog_id: user_blog_id, friends: target_blog_id, is_removed:false},
            function(err, doc) {
                if (err) {
                    return f_cb();
                } else {
                    if (doc === null) {
                        return f_cb();
                    } else {
                        return s_cb();
                    }
                }
            });
    },
    get_single_article: function (connected_db, first, f_cb, s_cb) {
        connected_db.collection('articles').findOne(first, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    return s_cb(doc);
                }
            }
        });
    },
    get_home_apply_now: function (connected_db, language, f_cb, s_cb) {
        var first = {};
        var now = new Date();
        now.setHours(now.getHours() - 24);
        now = now.valueOf();
        first["type"] = "apply_now";
        first["language"] = language;
        first["public_authority"] = 1;
        first["created_at"] = {
            "$gt": now
        };
        var temp_array = []
            , temp_objs = {};
        connected_db.collection("employment").find(first).sort({count_awesome: -1, count_view: -1, count_comments: -1}).limit(8).toArray(function(err, docs) {
            if (err === null) {
                if (docs.length < 8) {
                    for (var i = 0; i < docs.length; i++) {
                        temp_array.push(docs[i]);
                        temp_objs[docs[i]._id] = true;
                    }
                    delete first.created_at;
                    connected_db.collection("employment").find(first).sort({created_at: -1}).limit(8).toArray(function(err, docs) {
                        if (err === null) {
                            for (var i = 0; i < docs.length; i++) {
                                if (temp_objs[docs[i]._id] !== true ) {
                                    if (temp_array.length < 8) {
                                        temp_array.push(docs[i]);
                                    }
                                }
                                if (temp_array.length === 8) {
                                    break;
                                }
                            }
                            return s_cb(temp_array);
                        } else {
                            return f_cb(null);
                        }
                    });
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    /* Top news only current in 12 hours */
    get_top_news: function (connected_db, language, type1, type2, before_hours, cb) {
        var first = {}
            , sort
            , time_limit = new Date()
            , temp_array = []
            , temp_objs = {};
        time_limit.setHours(time_limit.getHours() - before_hours);
        time_limit = time_limit.valueOf();
        first["language"] = language;
        sort = {};
        if (type1 === "news") {
            if (language === "en") {
                first["$or"] = [];
                first["$or"].push({category: "economy"});
                first["$or"].push({category: "world"});
            } else if (language === "ja") {
                first["$or"] = [];
                first["$or"].push({category: "politics"});
                first["$or"].push({category: "economy"});
                first["$or"].push({category: "society"});
                first["$or"].push({category: "world"});
            } else if (language === "ko") {
                first["$or"] = [];
                first["$or"].push({category: "politics"});
                first["$or"].push({category: "economy"});
                first["$or"].push({category: "society"});
                first["$or"].push({category: "culture"});
                first["$or"].push({category: "world"});
            } else if (language === "zh-Hans") {
                first["$or"] = [];
                first["$or"].push({category: "politics"});
                first["$or"].push({category: "economy"});
                first["$or"].push({category: "society"});
            }
        } else if (type1 === "sports") {
            if (language === "en") {
                first["$or"] = [];
                first["$or"].push({category: "entertainment"});
                first["$or"].push({category: "sports"});
            } else if (language === "ja") {
                first["$or"] = [];
                first["$or"].push({category: "sports"});
            } else if (language === "ko") {
                first["$or"] = [];
                first["$or"].push({category: "entertainment"});
                first["$or"].push({category: "sports"});
            } else if (language === "zh-Hans") {
                first["$or"] = [];
                first["$or"].push({category: "entertainment"});
                first["$or"].push({category: "sports"});
            }
        } else {
            return [];
        }
        first["created_at"] = {"$gt": time_limit};
        if (type2 === "most_read") {
            sort["count_view"] = -1;
            sort["count_comments"] = -1;
            sort["created_at"] = -1;
        } else if (type2 === "many_comments") {
            sort["count_comments"] = -1;
            sort["count_view"] = -1;
            sort["created_at"] = -1;
        } else {
            return [];
        }
        connected_db.collection("news").find(first).sort(sort).limit(5).toArray(function(err, docs) {
            if (err === null) {
                if (docs.length < 5) {
                    for (var i = 0; i < docs.length; i++) {
                        if (temp_objs[docs[i]._id] !== true ) {
                            if (temp_array.length < 5) {
                                temp_array.push(docs[i]);
                                temp_objs[docs[i]._id] = true;
                            }
                        }
                    }
                    if (temp_array.length > 4) {
                        return cb(temp_array);
                    }
                    before_hours = before_hours * 2;
                    time_limit = new Date();
                    time_limit.setHours(time_limit.getHours() - before_hours);
                    time_limit = time_limit.valueOf();
                    first["created_at"] = {"$gt": time_limit};
                    connected_db.collection("news").find(first).sort(sort).limit(5).toArray(function(err, docs) {
                        if (err === null) {
                            for (var i = 0; i < docs.length; i++) {
                                if (temp_objs[docs[i]._id] !== true ) {
                                    if (temp_array.length < 5) {
                                        temp_array.push(docs[i]);
                                        temp_objs[docs[i]._id] = true;
                                    }
                                }
                            }
                            if (temp_array.length > 4) {
                                return cb(temp_array);
                            }
                            before_hours = before_hours * 2;
                            time_limit = new Date();
                            time_limit.setHours(time_limit.getHours() - before_hours);
                            time_limit = time_limit.valueOf();
                            first["created_at"] = {"$gt": time_limit};
                            connected_db.collection("news").find(first).sort(sort).limit(5).toArray(function(err, docs) {
                                if (err === null) {
                                    for (var i = 0; i < docs.length; i++) {
                                        if (temp_objs[docs[i]._id] !== true ) {
                                            if (temp_array.length < 5) {
                                                temp_array.push(docs[i]);
                                                temp_objs[docs[i]._id] = true;
                                            }
                                        }
                                    }
                                    if (temp_array.length > 4) {
                                        return cb(temp_array);
                                    }
                                    before_hours = before_hours * 2;
                                    time_limit = new Date();
                                    time_limit.setHours(time_limit.getHours() - before_hours);
                                    time_limit = time_limit.valueOf();
                                    first["created_at"] = {"$gt": time_limit};
                                    connected_db.collection("news").find(first).sort(sort).limit(5).toArray(function(err, docs) {
                                        if (err === null) {
                                            for (var i = 0; i < docs.length; i++) {
                                                if (temp_objs[docs[i]._id] !== true ) {
                                                    if (temp_array.length < 5) {
                                                        temp_array.push(docs[i]);
                                                        temp_objs[docs[i]._id] = true;
                                                    }
                                                }
                                            }
                                            if (temp_array.length > 4) {
                                                return cb(temp_array);
                                            }
                                            before_hours = before_hours * 2;
                                            time_limit = new Date();
                                            if (before_hours < 48) {
                                                time_limit.setHours(time_limit.getHours() - 48);
                                            } else {
                                                time_limit.setHours(time_limit.getHours() - before_hours);
                                            }
                                            time_limit = time_limit.valueOf();
                                            first["created_at"] = {"$gt": time_limit};
                                            connected_db.collection("news").find(first).sort(sort).limit(5).toArray(function(err, docs) {
                                                if (err === null) {
                                                    for (var i = 0; i < docs.length; i++) {
                                                        if (temp_objs[docs[i]._id] !== true ) {
                                                            if (temp_array.length < 5) {
                                                                temp_array.push(docs[i]);
                                                                temp_objs[docs[i]._id] = true;
                                                            }
                                                        }
                                                    }
                                                    return cb(temp_array);
                                                } else {
                                                    return cb([]);
                                                }
                                            });
                                        } else {
                                            return cb([]);
                                        }
                                    });
                                } else {
                                    return cb([]);
                                }
                            });
                        } else {
                            return cb([]);
                        }
                    });
                } else {
                    return cb(docs);
                }
            } else {
                return cb([]);
            }
        });
    },
    get_home_news: function (connected_db, language, f_cb, s_cb) {
        this.get_top_news(connected_db, language, "news", "many_comments", 1, s_cb);
    },
    get_home_entertainment: function (connected_db, language, f_cb, s_cb) {
        this.get_top_news(connected_db, language, "sports", "many_comments", 1, s_cb);
    },
    get_home_agendas: function (connected_db, language, f_cb, s_cb) {
        var first = {};
        var now = new Date();
        now.setHours(now.getHours() - 24);
        now = now.valueOf();
        first["$or"] = [];
        first["$or"].push({type: "agenda"});
        first["language"] = language;
        first["public_authority"] = 1;
        first["created_at"] = {
            "$gt": now
        };
        var temp_array = [],
            temp_objs = {};
        connected_db.collection("articles").find(first).sort({count_awesome: -1, count_view: -1, count_comments: -1}).limit(8).toArray(function(err, docs) {
            if (err === null) {
                if (docs.length < 8) {
                    for (var i = 0; i < docs.length; i++) {
                        temp_array.push(docs[i]);
                        temp_objs[docs[i]._id] = true;
                    }
                    delete first.created_at;
                    connected_db.collection("articles").find(first).sort({created_at: -1}).limit(8).toArray(function(err, docs) {
                        if (err === null) {
                            for (var i = 0; i < docs.length; i++) {
                                if (temp_objs[docs[i]._id] !== true ) {
                                    if (temp_array.length < 8) {
                                        temp_array.push(docs[i]);
                                    }
                                }
                                if (temp_array.length === 8) {
                                    break;
                                }
                            }
                            return s_cb(temp_array);
                        } else {
                            return f_cb(null);
                        }
                    });
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    get_home_opinions: function (connected_db, language, f_cb, s_cb) {
        var first = {};
        var now = new Date();
        now.setHours(now.getHours() - 24);
        now = now.valueOf();
        first["$or"] = [];
        first["$or"].push({type: "opinion"});
        first["$or"].push({type: "tr_opinion"});
        first["language"] = language;
        first["public_authority"] = 1;
        first["created_at"] = {
            "$gt": now
        };

        var temp_array = [],
            temp_objs = {};

        connected_db.collection("articles").find(first).sort({count_awesome: -1, count_view: -1, count_comments: -1}).limit(8).toArray(function(err, docs) {
            if (err === null) {
                if (docs.length < 8) {
                    for (var i = 0; i < docs.length; i++) {
                        temp_array.push(docs[i]);
                        temp_objs[docs[i]._id] = true;
                    }
                    delete first.created_at;
                    connected_db.collection("articles").find(first).sort({created_at: -1}).limit(8).toArray(function(err, docs) {
                        if (err === null) {
                            for (var i = 0; i < docs.length; i++) {
                                if (temp_objs[docs[i]._id] !== true ) {
                                    if (temp_array.length < 8) {
                                        temp_array.push(docs[i]);
                                    }
                                }
                                if (temp_array.length === 8) {
                                    break;
                                }
                            }
                            return s_cb(temp_array);
                        } else {
                            return f_cb(null);
                        }
                    });
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    get_home_blogs: function (connected_db, language, f_cb, s_cb) {
        var first = {};
        var now = new Date();
        now.setHours(now.getHours() - 24);
        now = now.valueOf();
        first["$or"] = [];
        first["$or"].push({type: "blog"});
        first["$or"].push({type: "gallery"});
        first["language"] = language;
        first["public_authority"] = 1;
        first["is_removed"] = false;
        first["created_at"] = {
            "$gt": now
        };
        var sort = {count_awesome: -1, count_view: -1, count_comments: -1};
        var temp_array = [],
            temp_objs = {};
        connected_db.collection("articles").find(first).sort(sort).limit(8).toArray(function(err, docs) {
            if (err === null) {
                if (docs.length < 8) {
                    for (var i = 0; i < docs.length; i++) {
                        temp_array.push(docs[i]);
                        temp_objs[docs[i]._id] = true;
                    }
                    delete first.created_at;
                    connected_db.collection("articles").find(first).sort(sort).limit(8).toArray(function(err, docs) {
                        if (err === null) {
                            for (var i = 0; i < docs.length; i++) {
                                if (temp_objs[docs[i]._id] !== true ) {
                                    if (temp_array.length < 8) {
                                        temp_array.push(docs[i]);
                                    }
                                }
                                if (temp_array.length === 8) {
                                    break;
                                }
                            }
                            return s_cb(temp_array);
                        } else {
                            return f_cb(null);
                        }
                    });
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    get_home_users: function (connected_db, language, f_cb, s_cb) {
        var today = this.to_eight_digits_date();
        var temp_array = [],
            temp_objs = {};
        connected_db.collection("users").find({blog_id: { "$ne": "gleant"}, main_language: language, today: today, is_removed: false }).sort({count_today_view: -1, count_total_view: -1}).limit(8).toArray(function(err, docs) {
            if (err === null) {
                if (docs.length < 8) {
                    for (var i = 0; i < docs.length; i++) {
                        temp_array.push(docs[i]);
                        temp_objs[docs[i].blog_id] = true;
                    }
                    connected_db.collection("users").find({blog_id: { "$ne": "gleant"}, main_language: language, is_removed: false}).sort({count_total_view: -1}).limit(8).toArray(function(err, docs) {
                        if (err === null) {
                            for (var i = 0; i < docs.length; i++) {
                                if (temp_objs[docs[i].blog_id] !== true ) {
                                    if (temp_array.length < 8) {
                                        temp_array.push(docs[i]);
                                    }
                                }
                                if (temp_array.length === 8) {
                                    break;
                                }
                            }
                            return s_cb(temp_array);
                        } else {
                            return f_cb(null);
                        }
                    });
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    get_home_articles: function (connected_db, language, f_cb, s_cb) {
        var self = this;
        var home_articles = {};
        return self.get_home_news(connected_db, language, f_cb, function (news) {
            home_articles["news"] = news;
            return self.get_home_entertainment(connected_db, language, f_cb, function (entertainment) {
                home_articles["entertainment"] = entertainment;
                return self.get_home_agendas(connected_db, language, f_cb, function (agendas) {
                    home_articles["agenda"] = agendas;
                    return self.get_home_blogs(connected_db, language, f_cb, function (blogs) {
                        home_articles["blog"] = blogs;
                        return self.get_home_users(connected_db, language, f_cb, function (users) {
                            home_articles["user"] = users;
                            return s_cb(home_articles);
                        });
                    });
                });
            });
        });
    },
    get_single_agenda: function (connected_db, user, data, authority, filter, f_cb, s_cb) {
        var first = {}
            , second = {};
        if (filter === "perfect") {
            second = this.get_second({
                db: "articles"
                , list_type: "agenda"
                , filter: "perfect"
            });
        }
        first["_id"] = data["_id"];
        first["type"] = "agenda";
        first["is_removed"] = false;
        if (user === null) {
            if (authority === "public") {
                first["public_authority"] = 1;
            } else if (authority === "opinion") {
                first["opinion_authority"] = 1;
            } else if (authority === "translation") {
                first["translation_authority"] = 1;
            } else if (authority === "comment") {
                first["comment_authority"] = 1;
            }
        } else {
            if (authority === "public") {
                first["$or"] = [];
                first["$or"].push({
                    public_authority:1
                });
                first["$or"].push({
                    public_authority:2
                    , members: user.blog_id
                });
                first["$or"].push({
                    blog_id: user.blog_id
                });
            } else if (authority === "opinion") {
                first["$or"] = [];
                first["$or"].push({
                    opinion_authority:1
                });
                first["$or"].push({
                    opinion_authority:2
                    , members: user.blog_id
                });
            } else if (authority === "translation") {
                first["$or"] = [];
                first["$or"].push({
                    translation_authority:1
                });
                first["$or"].push({
                    translation_authority:2
                    , members: user.blog_id
                });
            } else if (authority === "comment") {
                first["$or"] = [];
                first["$or"].push({
                    comment_authority:1
                });
                first["$or"].push({
                    comment_authority:2
                    , members: user.blog_id
                });
            }
        }
        connected_db.collection('articles').findOne(first, second, function(err, doc) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (doc === null) {
                        return f_cb(null);
                    } else {
                        return s_cb(doc);
                    }
                }
            });
    },
    get_single_article_filtered: function (connected_db, data, filter, f_cb, s_cb) {
        var first = {}
            , second = {};

        if (filter === "perfect") {
            if (
                data.type === "tr_agenda" ||
                data.type === "tr_opinion"
            ) {
                second = this.get_second({
                    db: "articles"
                    , list_type: "translation"
                    , filter: "perfect"
                });
            } else if (
                data.type === "agenda"
            ) {
                second = this.get_second({
                    db: "articles"
                    , list_type: "agenda"
                    , filter: "perfect"
                });
            } else if (
                data.type === "opinion"
            ) {
                second = this.get_second({
                    db: "articles"
                    , list_type: "opinion"
                    , filter: "perfect"
                });
            }
        }

        first["_id"] = data["_id"];
        first["type"] = data.type;
        first["is_removed"] = false;

        connected_db.collection('articles').findOne(first, second, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    return s_cb(doc);
                }
            }
        });
    },
    get_single_opinion: function (connected_db, user, data, authority, filter, f_cb, s_cb) {
        var first = {}
            , second = {};

        if (filter === "perfect") {
            second = this.get_second({
                db: "articles"
                , list_type: "opinion"
                , filter: "perfect"
            });
        }
        first["_id"] = data["_id"];
        first["type"] = "opinion";
        first["is_removed"] = false;
        if (user === null) {
            if (authority === "public") {
                first["public_authority"] = 1;
            } else if (authority === "opinion") {
                first["opinion_authority"] = 1;
            } else if (authority === "translation") {
                first["translation_authority"] = 1;
            } else if (authority === "comment") {
                first["comment_authority"] = 1;
            }
        } else {
            if (authority === "public") {
                first["$or"] = [];
                first["$or"].push({
                    public_authority:1
                });
                first["$or"].push({
                    public_authority:2
                    , members: user.blog_id
                });
                first["$or"].push({
                    blog_id: user.blog_id
                });
            } else if (authority === "opinion") {
                first["$or"] = [];
                first["$or"].push({
                    opinion_authority:1
                });
                first["$or"].push({
                    opinion_authority:2
                    , members: user.blog_id
                });
            } else if (authority === "translation") {
                first["$or"] = [];
                first["$or"].push({
                    translation_authority:1
                });
                first["$or"].push({
                    translation_authority:2
                    , members: user.blog_id
                });
            } else if (authority === "comment") {
                first["$or"] = [];
                first["$or"].push({
                    comment_authority:1
                });
                first["$or"].push({
                    comment_authority:2
                    , members: user.blog_id
                });
            }
        }
        connected_db.collection('articles').findOne(first, second, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    return s_cb(doc);
                }
            }
        });
    },
    get_single_translation: function (connected_db, user, data, authority, filter, f_cb, s_cb) {
        var first = {}
            , second = {};
        if (filter === "perfect") {
            second = this.get_second({
                db: "articles"
                , list_type: "translation"
                , filter: "perfect"
            });
        }
        first["_id"] = data._id;
        first["type"] = data.type;
        first["is_removed"] = false;
        if (user === null) {
            if (authority === "public") {
                first["public_authority"] = 1;
            } else if (authority === "translation") {
                first["translation_authority"] = 1;
            } else if (authority === "comment") {
                first["comment_authority"] = 1;
            }
        } else {
            if (authority === "public") {
                first["$or"] = [];
                first["$or"].push({
                    public_authority:1
                });
                first["$or"].push({
                    public_authority:2
                    , members: user.blog_id
                });
                first["$or"].push({
                    blog_id: user.blog_id
                });
            } else if (authority === "translation") {
                first["$or"] = [];
                first["$or"].push({
                    translation_authority:1
                });
                first["$or"].push({
                    translation_authority:2
                    , members: user.blog_id
                });
            } else if (authority === "comment") {
                first["$or"] = [];
                first["$or"].push({
                    comment_authority:1
                });
                first["$or"].push({
                    comment_authority:2
                    , members: user.blog_id
                });
            }
        }
        connected_db.collection('articles').findOne(first, second, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    return s_cb(doc);
                }
            }
        });
    },
    get_single_blog: function (connected_db, user, data, filter, f_cb, s_cb) {
        var first = {}
            , second = {};
        if (filter === "perfect") {
            second = this.get_second({
                db: "articles"
                , list_type: "blog"
                , filter: "perfect"
            });
        }
        first["_id"] = data["_id"];
        first["type"] = "blog";
        first["blog_id"] = data["blog_id"];
        first["is_removed"] = false;
        var get = function (first, second, is_owner, is_friend) {
            connected_db.collection('articles').findOne(first, second, function(err, doc) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (doc === null) {
                        return f_cb(null);
                    } else {
                        if (is_owner === true) {
                            return s_cb(doc);
                        } else {
                            if (doc['public_authority'] === 0) {
                                return f_cb(null);
                            } else {
                                if (is_friend === true) {
                                    return s_cb(doc);
                                } else {
                                    if (doc['public_authority'] === 2) {
                                        return f_cb(null);
                                    } else {
                                        return s_cb(doc);
                                    }
                                }
                            }
                        }
                    }
                }
            });
        };
        /* 블로그 주인과 사용자 관계 판단 */
        if ( user === null) {
            return get(first, second, false, false);
        } else if (user["blog_id"] === data["blog_id"]) { /* 주인 */
            return get(first, second, true, false);
        } else {
            this.is_friend(connected_db, user["blog_id"], data["blog_id"],
                function () {
                    return get(first, second, false, false);
                }, function () {
                    return get(first, second, false, true);
                });
        }
    },
    get_single_gallery: function (connected_db, user, data, filter, f_cb, s_cb) {
        var first = {}
            , second = {};
        if (filter === "perfect") {
            second = this.get_second({
                db: "articles"
                , list_type: "gallery"
                , filter: "perfect"
            });
        }
        first["_id"] = data["_id"];
        first["type"] = "gallery";
        first["blog_id"] = data["blog_id"];
        first["is_removed"] = false;
        var get = function (first, second, is_owner, is_friend) {
            connected_db.collection('articles').findOne(first, second, function(err, doc) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (doc === null) {
                        return f_cb(null);
                    } else {
                        if (is_owner === true) { /* 주인이면 */
                            return s_cb(doc);
                        } else { /* 방문자가 주인 아닐 때 */
                            if (doc['public_authority'] === 0) { /* 나만보기면 */
                                return f_cb(null);
                            } else { /* 친구공개 혹은 전체공개인데 */
                                if (is_friend === true) { /* 친구면 */
                                    return s_cb(doc);
                                } else { /* 친구 아닌데 */
                                    if (doc['public_authority'] === 2) { /* 친구만 공개이면 */
                                        return f_cb(null);
                                    } else { /* 전체공개이면 */
                                        return s_cb(doc);
                                    }
                                }
                            }
                        }
                    }
                }
            });
        };
        /* 블로그 주인과 사용자 관계 판단 */
        if ( user === null) {
            return get(first, second, false, false);
        } else if (user["blog_id"] === data["blog_id"]) { /* 주인 */
            return get(first, second, true, false);
        } else {
            this.is_friend(connected_db, user["blog_id"], data["blog_id"],
                function () {
                    return get(first, second, false, false);
                }, function () {
                    return get(first, second, false, true);
                });
        }
    },
    get_single_user: function (connected_db, data, f_cb, s_cb) {
        var first = {}
            , second = this.get_second({
            db: "users"
            , filter: "perfect"
        });
        first["blog_id"] = data["blog_id"];
        first["is_removed"] = false;

        connected_db.collection('users').findOne(first, second, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    return s_cb(doc);
                }
            }
        });
    },
    get_single_guestbook: function (connected_db, user, data, f_cb, s_cb) {
        var first = {}
            , second = this.get_second({db:"guestbook"});
        first["_id"] = data["_id"];
        first["blog_id"] = data["blog_id"];
        first["is_removed"] = false;
        connected_db.collection('guestbook').findOne(first, second, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    if (user !== null && user['blog_id'] === data['blog_id']) { /* blog Owner */
                        return s_cb(doc);
                    } else { /* Not blog Owner */
                        if (doc['public_authority'] === 1) { /* All */
                            return s_cb(doc);
                        } else { /* Secret */
                            if (user !== null && doc['visitor_blog_id'] === user['blog_id']) { /* Writer */
                                return s_cb(doc);
                            } else { /* Not Writer */
                                return f_cb(null);
                            }
                        }
                    }
                }
            }
        });
    },
    /**
     * 해당 blog_id 사용자의 blog_menu가 존재하는지 확인한다.
     * /insert/blog 에서 사용.
     **/
    check_blog_menu: function (connected_db, blog_id, blog_menu_id, f_cb, s_cb) {
        connected_db.collection('users').findOne(
            {
                blog_id:blog_id
                , "blog_menu._id": blog_menu_id
            },
            function(err, doc) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (doc === null) {
                        return f_cb(null);
                    } else {
                        return s_cb(null);
                    }
                }
            });
    },
    check_user_clicked_awesome: function (connected_db, collection_name, first, f_cb, s_cb) {
        if (
            collection_name !== "employment" &&
            collection_name !== "articles" &&
            collection_name !== "comments"
        ) {
            return f_cb(null);
        }

        connected_db.collection(collection_name).findOne(
            first,
            function(err, doc) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (doc === null) {
                        return f_cb(null);
                    } else {
                        return s_cb(doc);
                    }
                }
            });
    },
    update_article_array: function (connected_db, collection_name, first, second, f_cb, s_cb) {
        if (
            collection_name !== "employment" &&
            collection_name !== "articles" &&
            collection_name !== "comments"
        ) {
            return f_cb(null);
        }
        connected_db.collection(collection_name).findOneAndUpdate(
            first, second, {returnOriginal:false}, function(err, res) {
                if (err === null) {
                    if (res.ok !== 1) {
                        return f_cb(null);
                    }
                    var returned = res.value;
                    return s_cb(returned);
                } else {
                    return f_cb(null);
                }
            });
    },
    update_article_count: function(connected_db, collection_name, first, second, f_cb, s_cb) {
        connected_db.collection(collection_name).update(
            first,
            second,
            function(err, res){
                if (err) {
                    return f_cb(null);
                } else {
                    if (res.result.n === 0) {
                        return f_cb(null);
                    } else {
                        return s_cb(null);
                    }
                }
            });
    },
    update_user_translation_count: function (connected_db, user_id, secret_id, second, cb) {
        try {
            user_id = new ObjectId(user_id);
        } catch (e) {
            return cb();
        }
        connected_db.collection('users').updateOne({_id: user_id, secret_id: secret_id, is_removed:false},
            second,
            function(err, res) {
                return cb();
            });
    },
    insert_article_comment: function (connected_db, data, f_cb, s_cb) {
        connected_db.collection('comments').insertOne(data, function (err, res) {
            if (err === null) {
                return s_cb(null);
            } else {
                return f_cb(null);
            }
        });
    },
    remove_comments: function (connected_db, first, cb) {
        var second = {};
        second["$set"] = {};
        second["$set"].is_removed = true;

        connected_db.collection('comments').update(
            first,
            second,
            {multi:true},
            function (err, res) {
                return cb(null);
            }
        );
    },
    remove_article_comment: function (connected_db, first, second, f_cb, s_cb) {
        connected_db.collection('comments').updateOne(
            first,
            second, function (err, res) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (res.result.n === 0) {
                        return f_cb(null);
                    } else {
                        return s_cb(null);
                    }
                }
            });
    },
    remove_article_inner_comments: function (connected_db, first, second, f_cb, s_cb) {
        connected_db.collection('comments').update(
            first,
            second,
            {multi:true},
            function (err, res) {
                return s_cb(null);
            }
        );
    },
    update_article_comment: function(connected_db, first, second, f_cb, s_cb) {
        connected_db.collection('comments').updateOne(
            first,
            second,
            function(err, res){
                if (err) {
                    return f_cb(null);
                } else {
                    if (res.result.n === 0) {
                        return f_cb(null);
                    } else {
                        return s_cb(null);
                    }
                }
            });
    },
    update_comments_language: function (connected_db, first, second, cb) {
        connected_db.collection('comments').update(
            first,
            second,
            {multi:true},
            function (err, res) {
                return cb();
            }
        );
    },
    update_debate_info_of_agenda: function (connected_db, data, cb) {
        var second = {};
        second["$set"] = {};
        second["$set"]["public_authority"] = data.public_authority;
        second["$set"]["opinion_authority"] = data.opinion_authority;
        second["$set"]["translation_authority"] = data.translation_authority;
        second["$set"]["comment_authority"] = data.comment_authority;
        second["$set"]["is_start_set"] = data.is_start_set;
        second["$set"]["start_at"] = data.start_at;
        second["$set"]["is_finish_set"] = data.is_finish_set;
        second["$set"]["finish_at"] = data.finish_at;
        if (data.subscribers !== undefined) {
            second["$set"]["subscribers"] = data.subscribers;
        }
        connected_db.collection('articles').update(
            {agenda_id: data._id, is_removed:false}, second,
            {multi:true},
            function (err, res) {
                return cb();
            }
        );
    },
    update_authority_of_agenda_children: function (connected_db, data, cb) {
        var agenda_id = data._id
            , public_authority = data.public_authority
            , finish_at
            , temp;

        if (data.is_finish_set === true) {
            temp = new Date(data.finish_at);
            finish_at = temp.setMinutes(temp.getMinutes() + 30).valueOf();
        } else {
            finish_at = data.finish_at;
        }

        connected_db.collection('comments').update(
            {root_id: agenda_id, is_removed:false},
            {$set:{public_authority:public_authority}},
            {multi:true},
            function (err, res) {
                connected_db.collection('votes').update(
                    {root_id: agenda_id, is_removed:false},
                    {$set:{
                        public_authority:public_authority
                        , is_start_set: data.is_start_set
                        , start_at: data.start_at
                        , is_finish_set: data.is_finish_set
                        , finish_at: finish_at
                    }},
                    {multi:true},
                    function (err, res) {
                        connected_db.collection('translated_votes').update(
                            {root_id: agenda_id, is_removed:false},
                            {$set:{public_authority:public_authority}},
                            {multi:true},
                            function (err, res) {
                                return cb();
                            }
                        );
                    }
                );
            }
        );
    },
    get_single_article_comment: function (connected_db, first, f_cb, s_cb) {
        connected_db.collection('comments').findOne(
            first,
            function(err, doc) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (doc === null) {
                        return f_cb(null);
                    } else {
                        return s_cb(doc);
                    }
                }
            });
    },
    get_article_comments: function (connected_db, is_loginned, first, second, f_cb, s_cb) {
        if (first.comment_type === 2) {
            connected_db.collection('comments').find(first, second).sort({created_at: -1}).toArray(function(err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return f_cb(null);
                    } else {
                        if (is_loginned === true) {
                            return s_cb(docs);
                        } else {
                            for (var i = 0; i < docs.length; i++) {
                                docs[i].name = "Gleant";
                                if (docs[i].img.indexOf( "male.png") <= -1) {
                                    docs[i].img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                                }
                            }
                            return s_cb(docs);
                        }
                    }
                } else {
                    return f_cb(null);
                }
            });
        } else {
            connected_db.collection('comments').find(first, second).sort({created_at: -1}).limit(limit["comments"]).toArray(function(err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return f_cb(null);
                    } else {
                        if (is_loginned === true) {
                            return s_cb(docs);
                        } else {
                            for (var i = 0; i < docs.length; i++) {
                                docs[i].name = "Gleant";
                                if (docs[i].img.indexOf( "male.png") <= -1) {
                                    docs[i].img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                                }
                            }
                            return s_cb(docs);
                        }
                    }
                } else {
                    return f_cb(null);
                }
            });
        }
    },
    get_realtime_comments: function (connected_db, lang, is_loginned, type, f_cb, s_cb) {
        var first = {}
            , second = {};
        first["article_language"] = lang;
        if (type === 'debate') {
            first["$or"] = [];
            first["$or"].push({type: "agenda"});
            first["$or"].push({type: "opinion"});
        } else if (type === 'agenda') {
            first["type"] = "agenda";
        } else if (type === 'opinion') {
            first["type"] = "opinion";
        } else if (type === "blog") {
            first["$or"] = [];
            first["$or"].push({type: "gallery"});
            first["$or"].push({type: "blog"});
        } else {
            return f_cb(null);
        }
        first.public_authority = 1;
        first.is_removed = false;
        second.is_removed = 0;
        connected_db.collection('comments').find(first, second).sort({created_at: -1}).limit(limit["realtime_comments"]).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return f_cb(null);
                } else {
                    if (is_loginned === false) {
                        for (var i = 0; i < docs.length; i++) {
                            docs[i].name = "Gleant";
                            if (docs[i].img.indexOf( "male.png") <= -1) {
                                docs[i].img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                            }
                        }
                    }
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    get_single_apply_now: function (connected_db, user, data, authority, filter, f_cb, s_cb) {
        var first = {}
            , second = {};

        if (filter === "perfect") {
            second = this.get_second({
                db: "employment"
                , list_type: "apply_now"
                , authority: authority
                , filter: "perfect"
            });
        }
        first["_id"] = data["_id"];
        first["type"] = "apply_now";
        first["is_removed"] = false;
        if (user === null) {
            if (authority === "public") {
                first["public_authority"] = 1;
            } else {
                return f_cb(null);
            }
        } else {
            if (authority === "owner") {
                first["blog_id"] = user.blog_id;
            } else if (authority === "public") {
                first["$or"] = [];
                first["$or"].push({
                    public_authority:1
                });
                first["$or"].push({
                    public_authority:2
                    , members: user.blog_id
                });
                first["$or"].push({
                    blog_id: user.blog_id
                });
            } else if (authority === "application") {
                first["$or"] = [];
                first["$or"].push({
                    application_authority:1
                });
                first["$or"].push({
                    application_authority:2
                    , members: user.blog_id
                });
            }
        }
        connected_db.collection('employment').findOne(first, second, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    return s_cb(doc);
                }
            }
        });
    },
    get_single_hire_me: function (connected_db, user, data, authority, filter, f_cb, s_cb) {
        var first = {}
            , second = {};
        if (filter === "perfect") {
            second = this.get_second({
                db: "employment"
                , list_type: "hire_me"
                , filter: "perfect"
            });
        }
        first["_id"] = data["_id"];
        first["type"] = "hire_me";
        first["is_removed"] = false;
        if (user === null) {
            return f_cb(null);
        } else {
            if (authority === "owner") {
                first["blog_id"] = user.blog_id;
            } else if (authority === "public") {
                first["$or"] = [];
                first["$or"].push({
                    public_authority:1
                });
                first["$or"].push({
                    public_authority:2
                    , members: user.blog_id
                });
                first["$or"].push({
                    blog_id: user.blog_id
                });
            }
        }
        connected_db.collection('employment').findOne(first, second, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    return s_cb(doc);
                }
            }
        });
    },
    get_all_employment_articles: function (connected_db, language, data, f_cb, s_cb) {
        var first = {}
            , second=this.get_second({
                db: "employment"
                , filter: "normal"
            })
            , sort={updated_at: -1};
        if (
            data.type === "hire_me" ||
            data.type === "apply_now"
        ) {
            first["type"] = data.type;
        } else {
            return f_cb(null);
        }
        first["public_authority"] = 1;
        first["is_removed"] = false;
        first["language"] = language;
        if (data["updated_at"] !== undefined) {
            first["updated_at"] = {};
            first["updated_at"]["$lt"] = data["updated_at"];
        }
        connected_db.collection('employment').find(first, second).sort(sort).limit(limit["articles"]).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    get_all_images: function (connected_db, cb) {
        var first = {type: "gallery"}
            , second = {img:1}
            , sort={created_at: -1};
        connected_db.collection('articles').find(first, second).sort(sort).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return cb([]);
                } else {
                    return cb(docs);
                }
            } else {
                return cb([]);
            }
        });
    },
    get_single_website: function (connected_db, data, cb) {
        connected_db.collection('website').findOne({link:data.link, language: data.language}, function(err, doc) {
            if (err) {
                return cb(null);
            } else {
                if (doc === null) {
                    return cb(null);
                } else {
                    return cb(doc);
                }
            }
        });
    },
    insert_website: function (connected_db, data, f_cb, s_cb) {
        var first = {}
            , date = new Date().valueOf();
        first._id = date + randomstring.generate(12);
        first.language = data.language;
        first.link = data.link;
        first.title = data.title;
        first.content = data.content;
        first.tags = data.tags;
        first.created_at = date;
        first.updated_at = date;
        first.es_index = "";
        first.es_type = "";
        first.es_id = "";
        first.es_updated_at = 0;
        first.es_is_updated = false;
        connected_db.collection('website').insertOne(
            first,
            function(err, res) {
                if (err === null) {
                    return s_cb(first);
                } else {
                    return f_cb(null);
                }
            });
    },
    update_news_tags: function (connected_db, _id, tags, f_cb, s_cb) {
        var first = {}
            , second = {}
            , date = new Date().valueOf();
        first._id = _id;
        second["$set"] = { tags: tags, updated_at: date };
        connected_db.collection('news').updateOne(first, second,
            function(err, res) {
                if (err === null) {
                    return s_cb(null);
                } else {
                    return f_cb(null);
                }
            });
    },
    update_news_count: function (connected_db, link, type, cb) {
        var first = {}
            , second = {};
        first.link = link;
        if (type === "view") {
            second["$inc"] = { count_view:1};
        } else if (type === "comment") {
            second["$inc"] = { count_comments:1};
        }
        connected_db.collection('news').updateOne(first, second,
            function(err, res) {
                return cb();
            });
    },
    get_single_news: function (connected_db, first, f_cb, s_cb) {
        connected_db.collection('news').findOne(first, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    return s_cb(doc);
                }
            }
        });
    },
    get_specific_type_news: function (connected_db, language, category_list, index, final, f_cb, s_cb) {
        var first = {}
            , second = {}
            , self = this;
        if (category_list.length === index) {
            return s_cb(final);
        } else {
            first.language = language;
            first.category = category_list[index];
            connected_db.collection('news').find(first, second).sort({created_at: -1}).limit(5).toArray(function(err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        final[category_list[index]] = [];
                        return self.get_specific_type_news(connected_db, language, category_list, (index + 1), final, f_cb, s_cb);
                    } else {
                        final[category_list[index]] = docs;
                        return self.get_specific_type_news(connected_db, language, category_list, (index + 1), final, f_cb, s_cb);
                    }
                } else {
                    return f_cb({});
                }
            });
        }
    },
    get_news: function(connected_db, language, data, f_cb, s_cb) {
        var first = {}
            , second = {}
            , sort
            , category_list;
        if (data.category !== undefined) {
            first.language = language;
            first.category = data.category;
            if (data.created_at !== undefined) {
                first.created_at = {"$lt": data.created_at};
            }
            sort = {created_at: -1};
            connected_db.collection('news').find(first, second).sort(sort).limit(limit["news"]).toArray(function(err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return f_cb([]);
                    } else {
                        return s_cb(docs);
                    }
                } else {
                    return f_cb([]);
                }
            });
        } else {
            if (language === "en") {
                category_list = ["economy", "world", "it", "sports"];
            } else if (language === "ja") {
                category_list = ["politics", "economy", "society", "world", "it", "sports"];
            } else if (language === "ko") {
                category_list = ["politics", "economy", "society", "culture", "world", "entertainment", "sports"];
            } else if (language === "zh-Hans") {
                category_list = ["politics", "economy", "society", "entertainment", "sports"];
            }
            return this.get_specific_type_news(connected_db, language, category_list, 0, {}, f_cb, s_cb);
        }
    },
    get_news_not_indexed: function (connected_db, sort, cb) {
        var limit_time = new Date()
            , first = {};
        limit_time.setDate(limit_time.getDate() - 1);
        /*if (sort === "all") {
            first["language"] = {$ne:""};
        } else {
            first["language"] = sort;
        }*/
        first["language"] = "ko";
        first["created_at"] = {"$gt":limit_time.valueOf()};
        first["tags"] = {$size:0};
        first["es_updated_at"] = 0;
        first["es_is_updated"] = false;
        connected_db.collection('news').find(first, {}).sort({created_at:-1}).limit(500).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return cb([]);
                } else {
                    return cb(docs);
                }
            } else {
                return cb([]);
            }
        });
    },
    get_news_currently_indexed: function (connected_db, sort, cb) {
        var first = {};
        /*if (sort === "all") {
            first["language"] = {$ne:""};
        } else {
            first["language"] = sort;
        }*/
        first["language"] = "ko";
        first["tags"] = { $not: { $size: 0 } };
        connected_db.collection('news').find(first, {}).sort({updated_at:-1}).limit(500).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return cb([]);
                } else {
                    return cb(docs);
                }
            } else {
                return cb([]);
            }
        });
    },
    /**
     * /agenda, /opinion, /blog - [전체보기]에 해당하는 [논제], [의견], [블로그](전체공개인 일반 블로그 + 갤러리 아이템) 목록 반환.
     * @param data {Object} - 파싱한 데이터
     * @param data.list_type - "agenda" || "opinion" || "blog_gallery"
     * @param data.updated_at - 없어도 된다.
     *
     *   db: articles
     *   [논제]
     *   type: "agenda", public_authority: 1
     *   type: "agenda", public_authority: 1, updated_at: {$lt: updated_at}
     *
     *   [의견]
     *   type: "opinion", public_authority: 1
     *   type: "opinion", public_authority: 1, updated_at: {$lt: updated_at}
     *
     *   [블로그]
     *   $or: [{type: "blog"}, {type: "gallery"}], public_authority: 1
     *   $or: [{type: "blog"}, {type: "gallery"}], public_authority: 1, updated_at: {$lt: updated_at}
     *
     *   sort(updated_at: -1)
     */
    get_all_articles: function(connected_db, language, data, f_cb, s_cb) {
        var first={}
            , second=this.get_second({
                db: "articles"
                , list_type: data["list_type"]
                , filter: "normal"
            })
            , sort={updated_at: -1}
            , datetime = new Date().valueOf();

        first["public_authority"] = 1;
        first["language"] = language;
        if (data["list_type"] === "debate") { /* /debate */
            first["$or"] = [];
            first["$or"].push({type: "agenda"});
            first["$or"].push({type: "opinion"});
            if (data["type"] === "main_tag") {
                first["main_tag"] = data["main_tag"];
            }
        } else if (data["list_type"] === "agenda") { /* /agenda */
            first["type"] = "agenda";
            if (data["type"] === "main_tag") {
                first["main_tag"] = data["main_tag"];
            }
            if (data["agenda_menu"] === "all") { /* /agenda */
            } else if (data["agenda_menu"] === "in_progress") { /* /agenda?t=in-progress */
                first["start_at"] = {"$lt": datetime};
                first["is_finish_set"] = true;
                first["finish_at"] = {"$gt": datetime};
            } else if (data["agenda_menu"] === "scheduled") { /* /agenda?t=scheduled */
                first["is_start_set"] = true;
                first["start_at"] = {"$gt": datetime};
            } else if (data["agenda_menu"] === "finished") { /* /agenda?t=finished */
                first["is_finish_set"] = true;
                first["finish_at"] = {"$lt": datetime};
            } else if (data["agenda_menu"] === "unlimited") { /* /agenda?t=unlimited */
                first["start_at"] = {"$lt": datetime};
                first["is_finish_set"] = false;
            }
        } else if (data["list_type"] === "opinion") { /* /opinion */
            first["type"] = "opinion";
            if (data["type"] === "main_tag") {
                first["main_tag"] = data["main_tag"];
            }
        } else if (data["list_type"] === "blog_gallery") { /* /blog */
            first["$or"] = [];
            first["$or"].push({type: "blog"});
            first["$or"].push({type: "gallery"});
        } else {
            return f_cb(null);
        }
        if (data["updated_at"] !== undefined) {
            first["updated_at"] = {};
            first["updated_at"]["$lt"] = data["updated_at"];
        }
        connected_db.collection('articles').find(first, second).sort(sort).limit(limit["articles"]).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    get_realtime_employment: function (connected_db, lang, type, data, f_cb, s_cb) {
        var first={}
            , second=this.get_second({
                db: "employment"
                , list_type: type
                , filter: "normal"
            })
            , sort={updated_at: -1};
        if (
            type !== "apply_now" &&
            type !== "hire_me"
        ) {
            return f_cb(null);
        }
        first["type"] = type;
        first["language"] = lang;
        first["public_authority"] = 1;
        connected_db.collection('employment').find(first, second).sort(sort).limit(limit["realtime_employment"]).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    /**
     * /write/agenda - 최신 카테고리 논제 10개 반환.
     * @param data {Object} - 파싱한 데이터
     * @param data.main_tag {string} - 카테고리
     *
     *   db: articles
     *   [논제]
     *   type: "agenda", main_tag: 카테고리, public_authority: 1
     *   sort(updated_at: -1)
     */
    get_debates_by_main_tag: function (connected_db, lang, type, data, f_cb, s_cb) {
        var first={}
            , second=this.get_second({
                db: "articles"
                , list_type: type
                , filter: "normal"
            })
            , sort={updated_at: -1};
        if (type === "agenda") {
            first["type"] = "agenda";
        } else if (type === "opinion") {
            first["type"] = "opinion";
        }
        first["main_tag"] = data["main_tag"];
        first["language"] = lang;
        first["public_authority"] = 1;
        connected_db.collection('articles').find(first, second).sort(sort).limit(limit["realtime_main_tag_articles"]).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    /**
     * /ranking - 사용자 랭킹별로 잘라서 반환. 필수조건: ranking은 겹치면 안된다.
     * @param data {Object} - 파싱한 데이터
     * @param data.ranking {number} - 랭킹
     *
     *   [사용자 랭킹]
     *   db: users
     *   is_removed: false, ranking: {$gt: ranking}
     *   sort(ranking: 1)
     */
    get_users: function(connected_db, data, f_cb, s_cb) {
        return f_cb(null);
        var first={}
            , second=this.get_second({db:"users"})
            ,sort = {ranking:1};

        first["is_removed"] = false;
        first["ranking"] = {
            "$gt": data["ranking"]
        };

        connected_db.collection('users').find(first, second).sort(sort).limit(limit["users"]).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    can_i_read_agenda: function (connected_db, user, data, f_cb, s_cb) {
        var first = {}
            , second = {};
        first["_id"] = data["_id"];
        first["type"] = "agenda";
        first["is_removed"] = false;

        if (user === null) {
            first["public_authority"] = 1;
        } else {
            first["$or"] = [];
            first["$or"].push({
                public_authority:1
            });
            first["$or"].push({
                public_authority:2
                , members: user.blog_id
            });
            first["$or"].push({
                blog_id: user.blog_id
            });
        }
        connected_db.collection('articles').findOne(first, second, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    return s_cb(doc);
                }
            }
        });
    },
    can_i_read_apply_now: function (connected_db, user, data, f_cb, s_cb) {
        var first = {}
            , second = {};
        first["_id"] = data["_id"];
        first["type"] = "apply_now";
        first["is_removed"] = false;
        if (user === null) {
            if (data["child"] === "announcement") {
                first["public_authority"] = 1;
            } else {
                return f_cb(null);
            }
        } else {
            if (data["child"] === "announcement") {
                first["$or"] = [];
                first["$or"].push({
                    public_authority:1
                });
                first["$or"].push({
                    public_authority:2
                    , members: user.blog_id
                });
                first["$or"].push({
                    blog_id: user.blog_id
                });
            } else if (data["child"] === "answer") {
                first["blog_id"] = user.blog_id;
            } else {
                return f_cb(null);
            }
        }
        connected_db.collection('employment').findOne(first, second, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    return s_cb(doc);
                }
            }
        });
    },

    get_announcement_of_apply_now: function (connected_db, lang, data, f_cb, s_cb) {
        var first={}
            , second=this.get_second({
                db: "employment"
                , list_type: "announcement"
                , filter: "announcement"
            })
            , sort={created_at: -1};

        first["type"] = "announcement";
        first["article_id"] = data["article_id"];

        if (data["created_at"] !== undefined) {
            first["created_at"] = {};
            first["created_at"]["$lt"] = data["created_at"];
        }

        connected_db.collection('employment').find(first, second).sort(sort).limit(limit["apply_now_announcements"]).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },

    get_answers_of_online_interview: function (connected_db, lang, data, f_cb, s_cb) {
        var first={}
            , second=this.get_second({
                db: "online_interview"
                , list_type: "answer"
                , filter: "answer"
            })
            , sort={created_at: -1};

        first["type"] = "answer";
        first["article_id"] = data["article_id"];

        if (data["created_at"] !== undefined) {
            first["created_at"] = {};
            first["created_at"]["$lt"] = data["created_at"];
        }

        connected_db.collection('online_interview').find(first, second).sort(sort).limit(limit["online_interview_answers"]).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(data.questions, docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },

    /**
     * 논제 연결된 [의견 목록]을 [인기순]으로 반환.
     * /agenda/:agenda_id
     * @param connected_db
     * @param data - 파싱한 데이터
     * @param data.agenda_id - 논제 아이디
     * @param data.skip - 건너 뛸 회수. 없어도 된다.
     * @param f_cb - 실패 콜백
     * @param s_cb - 성공 콜백
     *
     *   db: articles
     *   type: "opinion", agenda_id: agenda_id, public_authority: 1
     *   sort((count_awesome * 10) + count_view + count_comments)
     *   skip(skip)
     */
    get_popular_opinions_of_agenda: function (connected_db, data, f_cb, s_cb) {
        var skip = 0
            , agenda_id = data["agenda_id"];
        if (data["skip"] !== undefined) {
            skip = data["skip"];
        }
        connected_db.collection("articles").aggregate([
            { $match: {type: "opinion", agenda_id: agenda_id, is_removed:false }},
            { $project: {
                type: 1,
                language: 1,
                agenda_id: 1,
                name: 1,
                blog_id: 1,
                root_blog_id: 1,
                img: 1,
                profile: 1,
                public_authority: 1,
                opinion_authority: 1,
                translation_authority: 1,
                comment_authority: 1,
                main_tag: 1,
                tags: 1,
                title: 1,
                content: 1,
                img_list: 1,
                count_view: 1,
                count_awesome: 1,
                count_written_translations: 1,
                count_requested_translations: 1,
                count_comments: 1,
                members: 1,
                likers: 1,
                subscribers: 1,
                is_start_set: 1,
                start_at: 1,
                is_finish_set: 1,
                finish_at: 1,
                created_at: 1,
                updated_at: 1,
                total: {
                    $add: ['$count_view', '$count_comments']
                }
            }},
            { $sort: { count_awesome: -1, total: -1, created_at:1 }},
            { $skip: skip },
            { $limit:limit["opinions_of_agendas"] }]).toArray(function (err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    /**
     * 논제 연결된 [의견 목록]을 [토론순]으로 반환.
     * /agenda/:agenda_id
     * @param connected_db
     * @param data - 파싱한 데이터
     * @param data.agenda_id - 논제 아이디
     * @param data.created_at - 생성날짜. 없어도 된다.
     * @param f_cb - 실패 콜백
     * @param s_cb - 성공 콜백
     *
     *   db: articles
     *   type: "opinion", agenda_id: agenda_id, public_authority: 1
     *   type: "opinion", agenda_id: agenda_id, public_authority: 1, created_at: {$gt: created_at}
     *   sort(created_at: 1)
     */
    get_serial_opinions_of_agenda: function (connected_db, lang, data, f_cb, s_cb) {
        var first={}
            , second=this.get_second({
                db: "articles"
                , list_type: "opinion"
                , filter: "perfect_for_serial"
            })
            , sort={created_at: -1};
        second.es_id = 0;
        second.es_index = 0;
        second.es_is_updated = 0;
        second.es_type = 0;
        second.es_updated_at = 0;
        first["type"] = "opinion";
        first["agenda_id"] = data["agenda_id"];
        if (data["created_at"] !== undefined) {
            first["created_at"] = {};
            first["created_at"]["$lt"] = data["created_at"];
        }
        connected_db.collection('articles').find(first, second).sort(sort).limit(limit["opinions_of_agendas"]).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return f_cb(null);
                } else {
                    /* 삭제된 opinion은 삭제되었다고 보여주기 */
                    for (var i = 0; i < docs.length; i++) {
                        if (docs[i]["is_removed"] === true) {
                            docs[i]["content"] = "";
                            docs[i]["count_comments"] = 0;
                            docs[i]["count_awesome"] = 0;
                            docs[i]["count_written_translations"] = [];
                            docs[i]["count_written_translations"].push({
                                language: "en"
                                , count: 0
                            });
                            docs[i]["count_written_translations"].push({
                                language: "ja"
                                , count: 0
                            });
                            docs[i]["count_written_translations"].push({
                                language: "ko"
                                , count: 0
                            });
                            docs[i]["count_written_translations"].push({
                                language: "zh-Hans"
                                , count: 0
                            });
                            docs[i]["count_requested_translations"] = 0;
                            docs[i]["count_view"] = 0;
                            if (docs[i].img.indexOf( "male.png") <= -1) {
                                docs[i].img = config.aws_s3_url + '/upload/images/00000000/gleant/resized/question.png';
                            }
                            docs[i]["img_list"] = [];
                            docs[i]["members"] = [];
                            docs[i]["subscribers"] = [];
                            docs[i]["name"] = "";
                            docs[i]["blog_id"] = "";
                            docs[i]["profile"] = "";
                            docs[i]["tags"] = [];
                            docs[i]["title"] = i18n[lang].deleted_opinion;
                        }
                    }
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    get_translations_of_article: function (connected_db, data, f_cb, s_cb) {
        var skip = 0
            , match = {}
            , project;
        match.type = data.type;
        match.language = data.language;
        match.agenda_id = data.agenda_id;
        match.is_removed = false;
        if (match.type === "tr_opinion") {
            match.opinion_id = data.opinion_id;
        }
        project = {
            name: 1,
            blog_id: 1,
            root_blog_id: 1,
            img: 1,
            language: 1,
            main_tag: 1,
            agenda_id: 1,
            opinion_id: 1,
            type: 1,
            translated_vote_list: 1,
            img_list: 1,
            count_view: 1,
            count_awesome: 1,
            count_comments: 1,
            members: 1,
            likers: 1,
            subscribers: 1,
            public_authority: 1,
            opinion_authority: 1,
            translation_authority: 1,
            comment_authority: 1,
            is_start_set: 1,
            start_at: 1,
            is_finish_set: 1,
            finish_at: 1,
            created_at: 1,
            updated_at: 1,
            tags: 1,
            title: 1,
            content: 1,
            total: {
                $add: ['$count_view', '$count_comments']
            }
        };

        if (data.skip !== undefined) {
            skip = data.skip;
        }

        connected_db.collection("articles").aggregate([
            { $match: match},
            { $project: project},
            { $sort: { count_awesome: -1, total: -1, created_at:1 }},
            { $skip: skip },
            { $limit:limit.translations_of_articles }]).toArray(function (err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    /**
     * @param connected_db
     * @param blog_owner
     * @param user
     * @param blog_menu - 블로그 메뉴 정보
     * @param blog_menu.blog_menu_id - "debate" || "gallery" || "guestbook" || 일반블로그_id
     * @param blog_menu._id - 단일 게시물 document _id
     * @param blog_menu.is_agenda_selected - blog_menu_id가 "debate"일 때, 논제, 의견, 번역 판별 위해 사용.
     * @param blog_menu.is_opinion_selected - blog_menu_id가 "debate"일 때, 논제, 의견, 번역 판별 위해 사용.
     * @param blog_menu.is_write - 일반 블로그 write url일 떄 true. /blog/:blog_id/write/:blog_menu_id
     * @param blog_menu.is_list - 단일 게시물이 아닌 목록 반환해야할 경우 true
     * @param f_cb
     * @param s_cb
     * @returns {*}
     */
    get_blog_articles: function(connected_db, lang, blog_owner, user, blog_menu, f_cb, s_cb) {
        var self = this;
        var user_id
            , secret_id;
        if (user === null) {
            user_id = null;
            secret_id = null;
        } else {
            user_id = user["_id"].toString();
            secret_id = user["secret_id"];
        }
        var blog_debate_obj = {}
            , blog_employment_obj = {};
        if (blog_menu["agenda_menu"]) {
            if (
                blog_menu["agenda_menu"] === "in-progress-agenda" ||
                blog_menu["agenda_menu"] === "in-progress-agenda-participation" ||
                blog_menu["agenda_menu"] === "in-progress-agenda-subscription"
            ) {
                blog_debate_obj.agenda_menu = "in_progress";
            } else if (
                blog_menu["agenda_menu"] === "scheduled-agenda" ||
                blog_menu["agenda_menu"] === "scheduled-agenda-participation" ||
                blog_menu["agenda_menu"] === "scheduled-agenda-subscription"
            ) {
                blog_debate_obj.agenda_menu = "scheduled";
            } else if (
                blog_menu["agenda_menu"] === "finished-agenda" ||
                blog_menu["agenda_menu"] === "finished-agenda-participation" ||
                blog_menu["agenda_menu"] === "finished-agenda-subscription"
            ) {
                blog_debate_obj.agenda_menu = "finished";
            } else if (
                blog_menu["agenda_menu"] === "unlimited-agenda" ||
                blog_menu["agenda_menu"] === "unlimited-agenda-participation" ||
                blog_menu["agenda_menu"] === "unlimited-agenda-subscription"
            ) {
                blog_debate_obj.agenda_menu = "unlimited";
            } else {
                blog_debate_obj.agenda_menu = "";
            }
        } else {
            blog_debate_obj.agenda_menu = "";
        }
        if (blog_menu["is_list"] === true) { /* return List */
            if (blog_menu["blog_menu_id"] === "debate") { /* Debate */
                blog_debate_obj.is_participation = false;
                blog_debate_obj.is_subscription = false;
                blog_debate_obj.blog_id = blog_owner["blog_id"];
                if (blog_menu["is_agenda_selected"] === true) { /* return Agenda List */
                    blog_debate_obj.list_type = "agenda";
                    return self.get_blog_debate_list(connected_db, user, user_id, secret_id, blog_debate_obj, s_cb, s_cb);
                } else { /* return Opinion List */
                    if (blog_menu["is_opinion_selected"] === true) {
                        blog_debate_obj.list_type = "opinion";
                        blog_debate_obj.agenda_menu = "";
                        return self.get_blog_debate_list(connected_db, user, user_id, secret_id, blog_debate_obj, s_cb, s_cb);
                    } else { /* return Translation List */
                        blog_debate_obj.list_type = "translation";
                        blog_debate_obj.agenda_menu = "";
                        return self.get_blog_debate_list(connected_db, user, user_id, secret_id, blog_debate_obj, s_cb, s_cb);
                    }
                }
            } /*else if (blog_menu["blog_menu_id"] === "employment") {
                blog_employment_obj.is_participation = false;
                blog_employment_obj.is_subscription = false;
                blog_employment_obj.blog_id = blog_owner["blog_id"];
                if (blog_menu["is_hire_me_selected"] === true) {
                    blog_employment_obj.list_type = "hire_me";
                    return self.get_blog_employment_list(connected_db, user, user_id, secret_id, blog_employment_obj, s_cb, s_cb);
                } else {
                    blog_employment_obj.list_type = "apply_now";
                    return self.get_blog_employment_list(connected_db, user, user_id, secret_id, blog_employment_obj, s_cb, s_cb);
                }
            }*/ else if (blog_menu["blog_menu_id"] === "participation") { /* Participation */
                blog_debate_obj.is_participation = true;
                blog_debate_obj.is_subscription = false;
                blog_debate_obj.blog_id = blog_owner["blog_id"];
                if (blog_menu["is_agenda_selected"] === true) { /* return Agenda List */
                    blog_debate_obj.list_type = "agenda";
                    return self.get_blog_debate_list(connected_db, user, user_id, secret_id, blog_debate_obj, s_cb, s_cb);
                } else {
                    return f_cb(null);
                    /*
                    if (blog_menu["is_hire_me_selected"] === true) {
                        blog_employment_obj.is_participation = true;
                        blog_employment_obj.is_subscription = false;
                        blog_employment_obj.blog_id = blog_owner["blog_id"];
                        blog_employment_obj.list_type = "hire_me";
                        return self.get_blog_employment_list(connected_db, user, user_id, secret_id, blog_employment_obj, s_cb, s_cb);
                    } else {
                        if (blog_menu["is_apply_now_selected"] === true) {
                            blog_employment_obj.is_participation = true;
                            blog_employment_obj.is_subscription = false;
                            blog_employment_obj.blog_id = blog_owner["blog_id"];
                            blog_employment_obj.list_type = "apply_now";
                            return self.get_blog_employment_list(connected_db, user, user_id, secret_id, blog_employment_obj, s_cb, s_cb);
                        } else {
                            return f_cb(null);
                        }
                    }*/
                }
            } else if (blog_menu["blog_menu_id"] === "subscription") { /* Subscription */
                blog_debate_obj.is_participation = false;
                blog_debate_obj.is_subscription = true;
                blog_debate_obj.blog_id = blog_owner["blog_id"];
                if (blog_menu["is_agenda_selected"] === true) { /* return Agenda List */
                    blog_debate_obj.list_type = "agenda";
                    return self.get_blog_debate_list(connected_db, user, user_id, secret_id, blog_debate_obj, s_cb, s_cb);
                } else { /* return Opinion List */
                    if (blog_menu["is_opinion_selected"] === true) {
                        blog_debate_obj.list_type = "opinion";
                        blog_debate_obj.agenda_menu = "";
                        return self.get_blog_debate_list(connected_db, user, user_id, secret_id, blog_debate_obj, s_cb, s_cb);
                    } else {
                        /* Subscription Bulletin Board and Gallery */
                        return self.get_blog_bulletin_board_gallery_list(connected_db, user, user_id, secret_id, {
                            list_type: "blog_gallery"
                            , blog_id: blog_owner["blog_id"]
                            , is_subscription: true
                        }, s_cb, s_cb);
                        /*
                        if (blog_menu["is_translation_selected"] === true) {
                            blog_debate_obj.list_type = "translation";
                            blog_debate_obj.agenda_menu = "";
                            return self.get_blog_debate_list(connected_db, user, user_id, secret_id, blog_debate_obj, s_cb, s_cb);
                        } else {
                            if (blog_menu["is_hire_me_selected"] === true) {
                                blog_employment_obj.is_participation = false;
                                blog_employment_obj.is_subscription = true;
                                blog_employment_obj.blog_id = blog_owner["blog_id"];
                                blog_employment_obj.list_type = "hire_me";
                                return self.get_blog_employment_list(connected_db, user, user_id, secret_id, blog_employment_obj, s_cb, s_cb);
                            } else {
                                if (blog_menu["is_apply_now_selected"] === true) {
                                    blog_employment_obj.is_participation = false;
                                    blog_employment_obj.is_subscription = true;
                                    blog_employment_obj.blog_id = blog_owner["blog_id"];
                                    blog_employment_obj.list_type = "apply_now";
                                    return self.get_blog_employment_list(connected_db, user, user_id, secret_id, blog_employment_obj, s_cb, s_cb);
                                } else {
                                    return self.get_blog_bulletin_board_gallery_list(connected_db, user, user_id, secret_id, {
                                        list_type: "blog_gallery"
                                        , blog_id: blog_owner["blog_id"]
                                        , is_subscription: true
                                    }, s_cb, s_cb);
                                }
                            }
                        }
                        */
                    }
                }
            } else if (blog_menu["blog_menu_id"] === "gallery") { /* Album */
                return self.get_blog_bulletin_board_gallery_list(connected_db, user, user_id, secret_id, {
                    list_type: "gallery"
                    , blog_id: blog_owner["blog_id"]
                    , is_subscription: false
                }, s_cb, s_cb);
            } else if (blog_menu["blog_menu_id"] === "guestbook") { /* Guestbook */
                return self.get_guestbook(connected_db, lang, user, {
                    list_type: "guestbook"
                    , blog_id: blog_owner["blog_id"]
                }, s_cb, s_cb);
            } else { /* Bulletin Board */
                return self.get_blog_bulletin_board_gallery_list(connected_db, user, user_id, secret_id, {
                    list_type: "blog"
                    , blog_id: blog_owner["blog_id"]
                    , blog_menu_id: blog_menu["blog_menu_id"]
                    , is_subscription: false
                }, s_cb, s_cb);
            }
        } else { /* return single article - Album, Bulletin Board, Guestbook */
            if (blog_menu["_id"] === undefined) {
                return f_cb(null);
            }
            if (
                blog_menu["blog_menu_id"] === "debate" ||
                blog_menu["blog_menu_id"] === "opinion" ||
                blog_menu["blog_menu_id"] === "participation" ||
                blog_menu["blog_menu_id"] === "subscription" ||
                blog_menu["blog_menu_id"] === "opinion-subscription" ||
                blog_menu["blog_menu_id"] === "blog-subscription"
                /*
                 blog_menu["blog_menu_id"] === "scheduled-agenda-participation" ||
                 blog_menu["blog_menu_id"] === "finished-agenda-participation" ||
                 blog_menu["blog_menu_id"] === "unlimited-agenda-participation" ||
                 blog_menu["blog_menu_id"] === "scheduled-agenda-subscription" ||
                 blog_menu["blog_menu_id"] === "finished-agenda-subscription" ||
                 blog_menu["blog_menu_id"] === "unlimited-agenda-subscription" ||
                 blog_menu["blog_menu_id"] === "translation" ||
                 blog_menu["blog_menu_id"] === "translation-subscription" ||
                 blog_menu["blog_menu_id"] === "employment" ||
                 blog_menu["blog_menu_id"] === "apply-now" ||
                 blog_menu["blog_menu_id"] === "apply-now-participation" ||
                 blog_menu["blog_menu_id"] === "hire-me-participation" ||
                 blog_menu["blog_menu_id"] === "apply-now-subscription" ||
                 blog_menu["blog_menu_id"] === "hire-me-subscription" ||
                */
            ) {
                return f_cb(null);
            } else if (blog_menu["blog_menu_id"] === "gallery") { /* 단일 앨범 이미지 반환 */
                return self.get_single_gallery(connected_db, user, {
                    _id: blog_menu["_id"]
                    , blog_id: blog_owner["blog_id"]
                }, "perfect", function (doc) {
                    self.update_article_count(connected_db, "articles", {_id: blog_menu["_id"], type:'gallery'}, {$inc: { count_view:1}},
                        function (nothing) {
                            return s_cb(doc);
                        }, function (nothing) {
                            return s_cb(doc);
                        });
                }, function (doc) {
                    self.update_article_count(connected_db, "articles", {_id: blog_menu["_id"], type:'gallery'}, {$inc: { count_view:1}},
                        function (nothing) {
                            return s_cb(doc);
                        }, function (nothing) {
                            return s_cb(doc);
                        });
                });
            } else if (blog_menu["blog_menu_id"] === "guestbook") { /* 단일 방명록 반환 */
                return self.get_single_guestbook(connected_db, user, {
                    _id: blog_menu["_id"]
                    , blog_id: blog_owner["blog_id"]
                }, s_cb, s_cb);
            } else { /* 단일 일반 블로그 반환 */
                return self.get_single_blog(connected_db, user, {
                        _id: blog_menu["_id"]
                        , blog_menu_id: blog_menu["blog_menu_id"]
                        , blog_id: blog_owner["blog_id"]
                    }, "perfect", function (doc) {
                        self.update_article_count(connected_db, "articles", {_id: blog_menu["_id"], type:'blog'}, {$inc: { count_view:1}},
                            function (nothing) {
                                return s_cb(doc);
                            }, function (nothing) {
                                return s_cb(doc);
                            });
                    }, function (doc) {
                        self.update_article_count(connected_db, "articles", {_id: blog_menu["_id"], type:'blog'}, {$inc: { count_view:1}},
                            function (nothing) {
                                return s_cb(doc);
                            }, function (nothing) {
                                return s_cb(doc);
                            });
                    });
            }
        }
    },
    get_blog_employment_list: function (connected_db, user, user_id, secret_id, data, f_cb, s_cb) {
        var first = {}
            , self = this
            , second = this.get_second({
                db: "employment"
                , list_type: data["list_type"]
                , filter: "normal"
            })
            , sort = {updated_at: -1}
            , datetime = new Date().valueOf();

        first["type"] = data["list_type"];
        first["is_removed"] = false;
        if (data["updated_at"] !== undefined) {
            first["updated_at"] = {
                $lt: data["updated_at"]
            };
        }
        if (data["is_subscription"] === true) {
            if (user === null) {
                return f_cb([]);
            } else {
                first["subscribers"] = user["blog_id"];
                first["blog_id"] = { $ne: user["blog_id"]};
            }
        } else {
            if (data["is_participation"] === true) {
                if (user === null) {
                    return f_cb([]);
                } else {
                    first["members"] = user["blog_id"];
                }
            } else {
                first["blog_id"] = data["blog_id"];
            }
        }
        var get = function (first, second) {
            connected_db.collection('employment').find(first, second).sort(sort).limit(limit["articles"]).toArray(function(err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return f_cb(null);
                    } else {
                        return s_cb(docs);
                    }
                } else {
                    return f_cb(null);
                }
            });
        };
        if (user !== null) {
            if (user && (user["blog_id"] === data["blog_id"])) {
                return get(first, second);
            } else {
                first["public_authority"] = 1;
                return get(first, second);
            }
        } else {
            if (user_id === null || secret_id === null) {
                first["public_authority"] = 1;
                return get(first, second);
            } else {
                self.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                    , function (nothing){
                        first["public_authority"] = 1;
                        return get(first, second);
                    }, function (user){
                        if (user && (user["blog_id"] === data["blog_id"])) {
                            return get(first, second);
                        } else {
                            first["public_authority"] = 1;
                            return get(first, second);
                        }
                    });
            }
        }
    },

    /**
     * 블로그의 논제 혹은 의견 목록 반환. updated_at 없어도 됨.
     * /blog/:blog_id - 의견
     * /blog/:blog_id/agenda
     * @param data {Object} - 파싱한 데이터
     * @param data.list_type - "agenda" || "opinion" || "translation"
     * @param data.is_participation - true || false
     * @param data.is_subscription - true || false
     * @param data.agenda_menu - "in_progress" || "scheduled" || "finished" || "unlimited"
     * @param data.blog_id - 현재 방문하고 있는 블로그아이디
     *
     *   [의견]
     *   db: articles,
     *   type: "opinion", blog_id: blog_id, public_authority: 1
     *   type: "opinion", blog_id: blog_id, public_authority: 1, updated_at: {$lt: updated_at}
     *   sort(updated_at: -1)
     *
     *   [논제]
     *   db: articles
     *   type: "agenda", blog_id: blog_id, public_authority: 1
     *   type: "agenda", blog_id: blog_id, public_authority: 1, updated_at: {$lt: updated_at}
     *   sort(updated_at: -1)
     */
    get_blog_debate_list: function (connected_db, user, user_id, secret_id, data, f_cb, s_cb) {
        var first = {}
            , self = this
            , second = this.get_second({
                db: "articles"
                , list_type: data["list_type"]
                , filter: "normal"
            })
            , sort = {updated_at: -1}
            , datetime = new Date().valueOf();
        if (data["list_type"] === "translation") {
            first["$or"] = [];
            first["$or"].push({
                type:"tr_agenda"
            });
            first["$or"].push({
                type:"tr_opinion"
            });
        } else {
            first["type"] = data["list_type"];
        }
        first["is_removed"] = false;
        if (data["updated_at"] !== undefined) {
            first["updated_at"] = {
                $lt: data["updated_at"]
            };
        }
        if (data["is_subscription"] === true) {
            if (user === null) {
                return f_cb([]);
            } else {
                first["subscribers"] = user["blog_id"];
                first["blog_id"] = { $ne: user["blog_id"]};
            }
        } else {
            if (data["is_participation"] === true) {
                if (user === null) {
                    return f_cb([]);
                } else {
                    first["members"] = user["blog_id"];
                }
            } else {
                first["blog_id"] = data["blog_id"];
            }
        }
        if (first["type"] === "agenda") {
            if (data["agenda_menu"] === "in_progress") {
                first["start_at"] = {"$lt": datetime};
                first["is_finish_set"] = true;
                first["finish_at"] = {"$gt": datetime};
            } else if (data["agenda_menu"] === "scheduled") {
                first["is_start_set"] = true;
                first["start_at"] = {"$gt": datetime};
            } else if (data["agenda_menu"] === "finished") {
                first["is_finish_set"] = true;
                first["finish_at"] = {"$lt": datetime};
            } else if (data["agenda_menu"] === "unlimited") {
                first["start_at"] = {"$lt": datetime};
                first["is_finish_set"] = false;
            } else if (
                data["agenda_menu"] === "all" ||
                data["agenda_menu"] === ""
            ) {

            } else {
                return f_cb(null);
            }
        }
        var get = function (first, second) {
            connected_db.collection('articles').find(first, second).sort(sort).limit(limit["articles"]).toArray(function(err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return f_cb(null);
                    } else {
                        return s_cb(docs);
                    }
                } else {
                    return f_cb(null);
                }
            });
        };
        if (user !== null) {
            if (user && (user["blog_id"] === data["blog_id"])) {
                return get(first, second);
            } else {
                first["public_authority"] = 1;
                return get(first, second);
            }
        } else {
            if (user_id === null || secret_id === null) {
                first["public_authority"] = 1;
                return get(first, second);
            } else {
                self.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true
                    , function (nothing){
                        first["public_authority"] = 1;
                        return get(first, second);
                    }, function (user){
                        if (user && (user["blog_id"] === data["blog_id"])) {
                            return get(first, second);
                        } else {
                            first["public_authority"] = 1;
                            return get(first, second);
                        }
                    });
            }
        }
    },
    /**
     * 블로그의 일반 블로그 혹은 갤러리 아이템 목록 반환. updated_at 없어도 됨.
     * @param data.list_type - "blog" || "gallery"
     *
     *   "blog" - [일반 블로그]
     *   [1] - 블로그주인
     *   db: articles,
     *   type: "blog", blog_id: blog_id, blog_menu_id: blog_menu_id, is_removed: false
     *   type: "blog", blog_id: blog_id, blog_menu_id: blog_menu_id, is_removed: false, updated_at: {$lt: updated_at}
     *   sort(updated_at: -1)
     *
     *   [2] - 친구
     *   db: articles,
     *   type: "blog", blog_id: blog_id, blog_menu_id: blog_menu_id, is_removed: false, $or: [ { public_authority:1 }, { public_authority:2 } ]
     *   type: "blog", blog_id: blog_id, blog_menu_id: blog_menu_id, is_removed: false, $or: [ { public_authority:1 }, { public_authority:2 } ], updated_at: {$lt: updated_at}
     *   sort(updated_at: -1)
     *
     *   [3] - 손님
     *   db: articles,
     *   type: "blog", blog_id: blog_id, blog_menu_id: blog_menu_id, is_removed: false, public_authority:1
     *   type: "blog", blog_id: blog_id, blog_menu_id: blog_menu_id, is_removed: false, public_authority:1, updated_at: {$lt: updated_at}
     *   sort(updated_at: -1)
     *
     *   "gallery" - [갤러리]
     *   [1] - 블로그주인
     *   db: articles,
     *   type: "gallery", blog_id: blog_id, is_removed: false
     *   type: "gallery", blog_id: blog_id, is_removed: false, updated_at: {$lt: updated_at}
     *   sort(updated_at: -1)
     *
     *   [2] - 친구
     *   db: articles,
     *   type: "gallery", blog_id: blog_id, is_removed: false, $or: [ { public_authority:1 }, { public_authority:2 } ]
     *   type: "gallery", blog_id: blog_id, is_removed: false, $or: [ { public_authority:1 }, { public_authority:2 } ], updated_at: {$lt: updated_at}
     *   sort(updated_at: -1)
     *
     *   [3] - 손님
     *   db: articles,
     *   type: "gallery", blog_id: blog_id, is_removed: false, public_authority:1
     *   type: "gallery", blog_id: blog_id, is_removed: false, public_authority:1, updated_at: {$lt: updated_at}
     *   sort(updated_at: -1)
     */
    get_blog_bulletin_board_gallery_list: function (connected_db, user, user_id, secret_id, data, f_cb, s_cb) {
        var self = this
            , first = {}
            , second = this.get_second({
                db: "articles"
                , list_type: data["list_type"]
                , filter: "normal"
            })
            , sort = {updated_at: -1};

        first["is_removed"] = false;

        if (data["is_subscription"] === true) {
            if (user === null) {
                return f_cb([]);
            } else {
                first["$or"] = [];
                first["$or"].push({type:"gallery"});
                first["$or"].push({type:"blog"});
                first["subscribers"] = user["blog_id"];
                first["blog_id"] = { $ne: user["blog_id"]};
            }
        } else {
            first["type"] = data["list_type"];
            first["blog_id"] = data["blog_id"];
            if (data["list_type"] === "blog") {
                first["blog_menu_id"] = data["blog_menu_id"];
            }
        }
        if (data["updated_at"] !== undefined) {
            first["updated_at"] = {
                $lt: data["updated_at"]
            };
        }
        var get = function (first, second) {
            connected_db.collection('articles').find(first, second).sort(sort).limit(limit["articles"]).toArray(function(err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return f_cb(null);
                    } else {
                        return s_cb(docs);
                    }
                } else {
                    return f_cb(null);
                }
            });
        };
        if (user !== null) {
            if(user["blog_id"] === data["blog_id"]) { /* Owner */
                return get(first, second);
            } else {
                self.is_friend(connected_db, user["blog_id"], data["blog_id"],
                    function () { /* Guest */
                        first["public_authority"] = 1;
                        return get(first, second);
                    }, function () { /* Friend */
                        first["$or"] = [];
                        first["$or"].push({
                            public_authority:1
                        });
                        first["$or"].push({
                            public_authority:2
                        });
                        return get(first, second);
                    }
                );
            }
        } else {
            if (user_id === null || secret_id === null) {
                first["public_authority"] = 1;
                return get(first, second);
            } else {
                self.check_user_by_user_id_secret_id(connected_db, user_id, secret_id, true,
                    function(nothing){
                        first["public_authority"] = 1;  /* Guest */
                        return get(first, second);
                    }, function (user) {
                        if(user["blog_id"] === data["blog_id"]) { /* Owner */
                            return get(first, second);
                        } else {
                            self.is_friend(connected_db, user["blog_id"], data["blog_id"],
                                function () { /* Guest */
                                    first["public_authority"] = 1;
                                    return get(first, second);
                                }, function () { /* Friend */
                                    first["$or"] = [];
                                    first["$or"].push({
                                        public_authority:1
                                    });
                                    first["$or"].push({
                                        public_authority:2
                                    });
                                    return get(first, second);
                                }
                            );
                        }
                    });
            }
        }
    },
    /**
     * 블로그의 방명록 목록 반환. updated_at 없어도 됨.
     * @param data.list_type {string} - "guestbook"
     * @param data.blog_id {string} - 현재 블로그의 블로그아이디
     * @param data.created_at {number} - 없어도 된다.
     *
     *   db: guestbook,
     *   blog_id: blog_id, is_removed: false
     *   blog_id: blog_id, is_removed: false, created_at: {$lt: created_at}
     *   sort(created_at: -1)
     *
     *   [1] - 블로그주인
     *   그냥 보냄.
     *
     *   [2] - 로그인 사용자 (비밀쓰기 로그인 사용자가 쓴것만 보여주기)
     *   클라이언트로 보내기 전에 (docs[i]["public_authority"] === 0) && (user["blog_id"] !== docs[i]["visitor_blog_id"]) 이면 docs[i]["blog_id"] = "", docs[i]["name"] = "시크릿.", docs[i]["img"] = "물음표 사진 주소", docs[i]["content"]에 "시크릿.", docs[i]["comments"] = [], docs[i]["public_authority"] = -1 로 만들기.
     *
     *   [3] - 비로그인 사용자
     *   클라이언트로 보내기 전에 docs[i]["public_authority"] === 0 이면 docs[i]["blog_id"] = "", docs[i]["name"] = "시크릿.", docs[i]["img"] = "물음표 사진 주소", docs[i]["content"]에 "시크릿.", docs[i]["comments"] = [], docs[i]["public_authority"] = -1 로 만들기.
     *
     */
    get_guestbook: function (connected_db, lang, user, data, f_cb, s_cb) {
        var self = this
            , first = {}
            , second = this.get_second({db:"guestbook"})
            , sort = {created_at: -1};
        first["blog_id"] = data["blog_id"];
        first["is_removed"] = false;
        if (data["created_at"] !== undefined) {
            first["created_at"] = {
                $lt: data["created_at"]
            };
        }
        var get = function (visitor_blog_id) {
            connected_db.collection('guestbook').find(first, second).sort(sort).limit(limit["guestbook"]).toArray(function(err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return f_cb(null);
                    } else {
                        if (visitor_blog_id === first["blog_id"]) { /* 주인일 경우 그냥 고대로 보냄 */
                            return s_cb(docs);
                        } else { /* 주인아닐 경우 자신이 쓴 메시지 아니면 다 나만보기 내용은 시크릿로 변경.. */
                            for (var i = 0; i < docs.length; i++) {
                                if (
                                    docs[i]["public_authority"] === 0 &&
                                    visitor_blog_id !== docs[i]["visitor_blog_id"]
                                ) {
                                    docs[i]["visitor_blog_id"] = "";
                                    docs[i]["name"] = i18n[lang].secret;
                                    docs[i]["img"] = config.aws_s3_url + "/upload/images/00000000/gleant/resized/question.png";
                                    docs[i]["content"] = "";
                                    docs[i]["comments"] = [];
                                }
                            }
                            return s_cb(docs);
                        }
                    }
                } else {
                    return f_cb(null);
                }
            });
        };
        if (user !== null) {
            return get(user["blog_id"]); /* 로그인 사용자 */
        } else {
            return get(null); /* 비로그인 사용자 */
        }
    },
    get_image_info: function (user, is_freephoto, is_profile, original_size, filename, content_type) {
        var MAX_WIDTH = 640
            , image_info = {}
            , date = Date.now().toString()
            , is_square = false
            , type = ""
            , utc_eight_digits = this.to_eight_digits_date()
            , random_id = randomstring.generate()
            , small_length
            , final_length
            , top
            , left;
        if (is_freephoto === true) {
            image_info["final_filename"] = "upload/images/00000000/freephoto/resized/";
            image_info["final_thumbnail_name"] = "upload/images/00000000/freephoto/thumbnail/";
            image_info["final_square_name"] = "upload/images/00000000/freephoto/square/";
        } else {
            image_info["final_filename"] = "upload/images/" + utc_eight_digits + "/" + user.blog_id + "/resized/";
            image_info["final_thumbnail_name"] = "upload/images/" + utc_eight_digits + "/" + user.blog_id + "/thumbnail/";
            image_info["final_square_name"] = "upload/images/" + utc_eight_digits + "/" + user.blog_id + "/square/";
        }
        image_info["original_size"] = original_size;
        image_info["content_type"] = content_type;
        if (image_info["content_type"] === "image/jpeg") {
            if (filename) {
                type = filename.split('.');
                type = type[type.length - 1];
                if (type !== "jpg") {
                    type = "jpeg";
                } else {
                    type = "jpg";
                }
            } else {
                type = "jpg";
            }
        } else if (image_info["content_type"] === "image/gif") {
            type = "gif";
        } else if (image_info["content_type"] === "image/png") {
            type = "png";
        }
        if (image_info["original_size"]["width"] === image_info["original_size"]["height"]) {
            is_square = true;
        }
        image_info["final_width"] = image_info["original_size"]["width"];
        image_info["final_height"] = image_info["original_size"]["height"];
        image_info["square"] = {};
        if (is_profile === true) {
            if (image_info["final_width"] > image_info["final_height"]) {
                small_length = image_info["final_height"];
                left = Math.floor((image_info["final_width"] - small_length) / 2);
                top = 0;
            } else if (image_info["final_width"] < image_info["final_height"]) {
                small_length = image_info["final_width"];
                left = 0;
                top = Math.floor((image_info["final_height"] - small_length) / 2);
            } else {
                small_length = image_info["final_width"];
                left = 0;
                top = 0;
            }
            if (small_length > MAX_WIDTH) {
                final_length = MAX_WIDTH;
            } else {
                final_length = small_length;
            }
            image_info["final_width"] = image_info["final_height"] = final_length;
            image_info["sharp"] = {};
            image_info["sharp"]["extract"] = {};
            image_info["square"]["top"] = image_info["sharp"]["extract"]["top"] = top;
            image_info["square"]["left"] = image_info["sharp"]["extract"]["left"] = left;
            image_info["square"]["width"] = image_info["sharp"]["extract"]["width"] = small_length;
            image_info["square"]["height"] = image_info["sharp"]["extract"]["height"] = small_length;
        } else {
            if (image_info["final_width"] > image_info["final_height"]) {
                small_length = image_info["final_height"];
                left = Math.floor((image_info["final_width"] - small_length) / 2);
                top = 0;
            } else if (image_info["final_width"] < image_info["final_height"]) {
                small_length = image_info["final_width"];
                left = 0;
                top = Math.floor((image_info["final_height"] - small_length) / 2);
            } else {
                small_length = image_info["final_width"];
                left = 0;
                top = 0;
            }
            image_info["square"]["top"] = top;
            image_info["square"]["left"] = left;
            image_info["square"]["height"] = image_info["square"]["width"] = small_length;

            if (content_type === "image/gif") {
            } else {
                if (image_info["final_width"] > MAX_WIDTH) {
                    image_info["final_width"] = MAX_WIDTH;
                    if (is_square === true) {
                        image_info["final_height"] = MAX_WIDTH;
                    } else {
                        image_info["final_height"] = Math.round((image_info["original_size"]["height"] * MAX_WIDTH) / image_info["original_size"]["width"]);
                    }
                }
            }
        }
        image_info["final_filename"] = image_info["final_filename"] + date + "-" +  random_id + "-" + image_info["final_width"] + "-" + image_info["final_height"] + "." + type;
        image_info["final_thumbnail_name"] = image_info["final_thumbnail_name"] + date + "-" +  random_id + "-" + image_info["final_width"] + "-" + image_info["final_height"] + "." + type;
        image_info["final_square_name"] = image_info["final_square_name"] + date + "-" +  random_id + "-" + image_info["final_width"] + "-" + image_info["final_height"] + "." + type;
        return image_info;
    },
    download_image: function (connected_db, user, is_freephoto, link, is_profile, f_cb, s_cb) {
        var self = this
            , content_type
            , original_size
            , image_info;
        request({uri: link, encoding:null, timeout:3000}, function (error, response, buffer) {
            if (!error && response.statusCode == 200) {
                try {
                    content_type = response["headers"]["content-type"];
                    content_type = content_type.toLowerCase().replace(/\s+/gi, '');
                    if (
                        content_type !== "image/jpeg" &&
                        content_type !== "image/gif" &&
                        content_type !== "image/png"
                    ) {
                        return f_cb(null);
                    }
                    original_size = image_size(buffer);
                } catch (e) {
                    return f_cb(null);
                }
                image_info = self.get_image_info(user, is_freephoto, is_profile, original_size, undefined, content_type);
                self.upload_image_to_aws(connected_db, user, is_freephoto, is_profile, buffer, image_info, f_cb, s_cb);
            } else {
                return f_cb(null);
            }
        });
    },
    parse_image_upload: function (req, res, next, connected_db, user, is_freephoto, is_profile, f_cb, s_cb) {
        var self = this
            , data = []
            , buffer
            , image_info
            , original_size;
        req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            file.on('error', function (err) {
                return f_cb(null);
            });
            file.on('data', function (chunk) {
                data.push(chunk);
            });
            file.on('end', function () {
                if (
                    mimetype !== "image/jpeg" &&
                    mimetype !== "image/gif" &&
                    mimetype !== "image/png"
                ) {
                    return f_cb(null);
                }
                buffer = Buffer.concat(data);
                try {
                    original_size = image_size(buffer);
                } catch (e) {
                    return f_cb(null);
                }
                image_info = self.get_image_info(user, is_freephoto, is_profile, original_size, filename, mimetype);
                self.upload_image_to_aws(connected_db, user, is_freephoto, is_profile, buffer, image_info, f_cb, s_cb);
            });
        });
        req.busboy.on('error', function (err) {
            f_cb(null);
            next(err);
        });
        req.busboy.on('finish', function () {
        });
        req.pipe(req.busboy);
    },
    upload_image_to_aws: function (connected_db, user, is_freephoto, is_profile, buffer, image_info, f_cb, s_cb) {
        var self = this
            , etag;
        if (is_profile === true) {
            sharp(buffer).extract({
                left: image_info["sharp"]["extract"]["left"]
                , top: image_info["sharp"]["extract"]["top"]
                , width: image_info["sharp"]["extract"]["width"]
                , height: image_info["sharp"]["extract"]["height"] })
                .resize(image_info["final_width"], image_info["final_height"])
                .quality(90)
                .toBuffer(function (err, data) {
                    if (err) {
                        return f_cb(null);
                    } else {
                        s3.putObject({
                            Bucket: 'gleant-ap-seoul',
                            Key: image_info["final_filename"],
                            Body: data,
                            ACL: 'public-read',
                            CacheControl: 'max-age=31536000',
                            ContentType: image_info["content_type"]
                        },function (err, resp) {
                            if (err === null) {
                                etag = resp["ETag"].replace(/\"/gi, '');
                                self.insert_gallery_item(connected_db, {
                                    image_info:image_info
                                    , buffer:buffer
                                    , blog_id: user.blog_id
                                    , blog_name: user.blog_name
                                    , img: config.aws_s3_url + "/" + image_info["final_filename"]
                                    , is_freephoto: is_freephoto
                                    , is_profile: is_profile
                                    , etag: etag
                                }, f_cb, s_cb);
                            } else {
                                return f_cb(null);
                            }
                        });
                    }
                });
        } else {
            if (image_info["content_type"] === "image/gif") {
                s3.putObject({
                    Bucket: 'gleant-ap-seoul',
                    Key: image_info["final_filename"],
                    Body: buffer,
                    ACL: 'public-read',
                    CacheControl: 'max-age=31536000',
                    ContentType: image_info["content_type"]
                }, function (err, resp) {
                    if (err === null) {
                        etag = resp["ETag"].replace(/\"/gi, '');
                        self.insert_gallery_item(connected_db, {
                            image_info:image_info
                            , buffer:buffer
                            , blog_id: user.blog_id
                            , blog_name: user.blog_name
                            , img: config.aws_s3_url + "/" + image_info["final_filename"]
                            , is_freephoto: is_freephoto
                            , is_profile: is_profile
                            , etag: etag
                        }, f_cb, s_cb);
                    } else {
                        return f_cb(null);
                    }
                });
            } else {
                sharp(buffer).resize(image_info["final_width"], image_info["final_height"])
                    .quality(90)
                    .toBuffer(function (err, data) {
                        if (err) {
                            return f_cb(null);
                        } else {
                            s3.putObject({
                                Bucket: 'gleant-ap-seoul',
                                Key: image_info["final_filename"],
                                Body: data,
                                ACL: 'public-read',
                                CacheControl: 'max-age=31536000',
                                ContentType: image_info["content_type"]
                            },function (err, resp) {
                                if (err === null) {
                                    etag = resp["ETag"].replace(/\"/gi, '');
                                    self.insert_gallery_item(connected_db, {
                                        image_info:image_info
                                        , buffer:buffer
                                        , blog_id: user.blog_id
                                        , blog_name: user.blog_name
                                        , img: config.aws_s3_url + "/" + image_info["final_filename"]
                                        , is_freephoto: is_freephoto
                                        , is_profile: is_profile
                                        , etag: etag
                                    }, f_cb, s_cb);
                                } else {
                                    return f_cb(null);
                                }
                            });
                        }
                    });
            }
        }
    },
    get_image_from_aws: function (img, cb) {
        s3.getObject({
            Bucket: 'gleant-ap-seoul',
            Key: img.replace('https://images.gleant.com/', '')
        },function (err, resp) {
            if (err === null) {
                return cb(resp);
            } else { /* No exists.. */
                return cb(null);
            }
        });
    },
    upload_square_image_to_aws: function (connected_db, docs, index, num_of_updated, f_cb, s_cb) {
        if (docs.length === index) {
            return s_cb(num_of_updated);
        }
        var resized = docs[index].img
            , square = resized.replace('/resized/', '/square/')
            , key = square.replace('https://images.gleant.com/', '')
            , buffer
            , content_type
            , self = this
            , split1 = resized.split(".")
            , split2 = split1[split1.length - 2].split('-')
            , resized_width = parseInt(split2[split2.length-2])
            , resized_height = parseInt(split2[split2.length-1])
            , small_length
            , left
            , top
            , width
            , height;
        /* Check resized image exists */
        self.get_image_from_aws(resized, function (res) {
            if (res !== null) { /* When resized image exists */
                buffer = res.Body;
                content_type = res.ContentType;
                /* Check square image exists */
                self.get_image_from_aws(square, function (res) {
                    if (res !== null) { /* When square image exists */
                        return self.upload_square_image_to_aws(connected_db, docs, (index + 1), num_of_updated, f_cb, s_cb);
                    } else { /* When square image does not exists */
                        if (resized_width > resized_height) {
                            small_length = resized_height;
                            left = Math.floor((resized_width - small_length) / 2);
                            top = 0;
                        } else if (resized_width < resized_height) {
                            small_length = resized_width;
                            left = 0;
                            top = Math.floor((resized_height - small_length) / 2);
                        } else {
                            small_length = resized_width;
                            left = 0;
                            top = 0;
                        }
                        width = height = small_length;
                        sharp(buffer).extract({
                            left: left
                            , top: top
                            , width: width
                            , height: height})
                            .resize(128, 128)
                            .quality(90)
                            .toBuffer(function (err, data) {
                                if (err) {
                                    console.log("\n[sharp error] Square image upload error occured. resized: " + resized);
                                    return f_cb(null);
                                } else {
                                    s3.putObject({
                                        Bucket: 'gleant-ap-seoul',
                                        Key: key,
                                        Body: data,
                                        ACL: 'public-read',
                                        CacheControl: 'max-age=31536000',
                                        ContentType: content_type
                                    },function (err, resp) {
                                        if (err === null) {
                                            return self.upload_square_image_to_aws(connected_db, docs, (index + 1), (num_of_updated + 1), f_cb, s_cb);
                                        } else {
                                            console.log("\n[aws error] Square image upload error occured. resized: " + resized);
                                            return f_cb(null);
                                        }
                                    });
                                }
                            });
                    }
                });
            } else { /* When resized image does not exists */
                return self.upload_square_image_to_aws(connected_db, docs, (index + 1), num_of_updated, f_cb, s_cb);
            }
        });
    },
    insert_gallery_item: function (connected_db, obj, f_cb, s_cb) {
        var self = this
            , buffer = obj["buffer"]
            , image_info = obj["image_info"]
            , width = image_info["original_size"]["width"]
            , height = image_info["original_size"]["height"]
            , left = 0
            , top = 0
            , crop_width = width
            , crop_height = height;
        if ((width/height) > (3/2)) {
            crop_height = height;
            crop_width = Math.floor((height * 3) / 2);
            left = Math.floor((width - crop_width) / 2);
        } else {
            crop_width = width;
            crop_height = Math.floor((width * 2) / 3);
            top = Math.floor((height - crop_height) / 2);
        }
        sharp(buffer).extract({ left: left, top: top, width: crop_width, height: crop_height })
            .quality(90)
            .resize(226, 150)
            .toBuffer(function (err, data) {
                if (err) {
                } else {
                    s3.putObject({
                        Bucket: 'gleant-ap-seoul',
                        Key: image_info["final_thumbnail_name"],
                        Body: data,
                        ACL: 'public-read',
                        CacheControl: 'max-age=31536000',
                        ContentType: image_info["content_type"]
                    },function (err, resp) {
                        if (err === null) {
                            sharp(buffer).extract({
                                left: image_info["square"]["left"]
                                , top: image_info["square"]["top"]
                                , width: image_info["square"]["width"]
                                , height: image_info["square"]["height"] })
                                .resize(128, 128)
                                .quality(90)
                                .toBuffer(function (err, data) {
                                    if (err) {
                                        return f_cb(null);
                                    } else {
                                        s3.putObject({
                                            Bucket: 'gleant-ap-seoul',
                                            Key: image_info["final_square_name"],
                                            Body: data,
                                            ACL: 'public-read',
                                            CacheControl: 'max-age=31536000',
                                            ContentType: image_info["content_type"]
                                        },function (err, resp) {
                                            if (err === null) {
                                                var date = new Date().valueOf();
                                                var _id = date + randomstring.generate();
                                                var data = {};
                                                if (obj.is_freephoto === true) {
                                                    data["_id"] = _id;
                                                    data["main_tag"] = "";
                                                    data["img"] = obj["img"];
                                                    data["square"] = config.aws_s3_url + "/" + image_info["final_square_name"];
                                                    data["blog_id"] = obj["blog_id"];
                                                    data["etag"] = obj["etag"];
                                                    data["count_used"] = 0;
                                                    data["is_removed"] = false;
                                                    data["created_at"] = date;
                                                    data["updated_at"] = date;
                                                    connected_db.collection('freephoto').insertOne(
                                                        data,
                                                        function(err, res) {
                                                            if (err === null) {
                                                                return s_cb(data["_id"], data["img"]);
                                                            } else {
                                                                return f_cb(null);
                                                            }
                                                        });
                                                } else {
                                                    data["_id"] = _id;
                                                    data["type"] = "gallery";
                                                    data["language"] = "";
                                                    data["public_authority"] = 0; /* 0: 나만보기, 1: 전체공개, 2: 친구만 */
                                                    data["blog_name"] = obj["blog_name"];
                                                    data["blog_id"] = obj["blog_id"];
                                                    data["img"] = obj["img"];
                                                    data["thumbnail"] = config.aws_s3_url + "/" + image_info["final_thumbnail_name"];
                                                    data["etag"] = obj["etag"];
                                                    data["tags"] = [];
                                                    data["title"] = "";
                                                    data["content"] = "";
                                                    data["is_profile"] = obj["is_profile"];
                                                    data["count_view"] = 0;
                                                    data["count_awesome"] = 0;
                                                    data["count_written_translations"] = [];
                                                    data["count_written_translations"].push({
                                                        language: "en"
                                                        , count: 0
                                                    });
                                                    data["count_written_translations"].push({
                                                        language: "ja"
                                                        , count: 0
                                                    });
                                                    data["count_written_translations"].push({
                                                        language: "ko"
                                                        , count: 0
                                                    });
                                                    data["count_written_translations"].push({
                                                        language: "zh-Hans"
                                                        , count: 0
                                                    });
                                                    data["count_requested_translations"] = 0;
                                                    data["count_comments"] = 0;
                                                    data["likers"] = [];
                                                    data["subscribers"] = [];
                                                    data["subscribers"].push(obj["blog_id"]);
                                                    data["is_removed"] = false;
                                                    data["created_at"] = date;
                                                    data["updated_at"] = date;
                                                    data["date"] = self.to_eight_digits_date();
                                                    data["es_index"] = "";
                                                    data["es_type"] = "";
                                                    data["es_id"] = "";
                                                    data["es_updated_at"] = 0;
                                                    data["es_is_updated"] = false;
                                                    connected_db.collection('articles').insertOne(
                                                        data,
                                                        function(err, res) {
                                                            if (err === null) {
                                                                var pathname = '/blog/' + obj["blog_id"] + '/gallery/' + _id;
                                                                return s_cb(pathname, obj["img"], config.aws_s3_url + "/" + image_info["final_thumbnail_name"]);
                                                            } else {
                                                                return f_cb(null);
                                                            }
                                                        });
                                                }
                                            } else {
                                                return f_cb(null);
                                            }
                                        });
                                    }
                                });



                        } else {
                            return f_cb(null);
                        }
                    });
                }
            });
    },
    get_freephoto_list: function (connected_db, mt, cb) {
        var first = {};
        first.is_removed = false;
        if (mt !== "all") {
            if (mt === "unselected") {
                first.main_tag = "";
            } else {
                first.main_tag = mt;
            }
        }
        connected_db.collection('freephoto').find(first, {}).sort({updated_at: -1}).toArray(
            function (err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return cb([]);
                    } else {
                        return cb(docs);
                    }
                } else {
                    return cb([]);
                }
            });
    },
    update_freephoto_category: function (connected_db, _id, blog_id, main_tag, f_cb, s_cb) {
        var updated_at = new Date().valueOf();
        connected_db.collection('freephoto').updateOne(
            {_id: _id},
            { $set: {
                blog_id: blog_id
                , main_tag: main_tag
                , updated_at: updated_at
            }},
            function(err, res) {
                if (err === null) {
                    return s_cb(null);
                } else {
                    return f_cb(null);
                }
            });
    },
    remove_freephoto: function (connected_db, _id, blog_id, f_cb, s_cb) {
        var updated_at = new Date().valueOf();
        connected_db.collection('freephoto').updateOne(
            {_id: _id},
            { $set: {
                blog_id: blog_id
                , is_removed: true
                , updated_at: updated_at
            }},
            function(err, res) {
                if (err === null) {
                    return s_cb(null);
                } else {
                    return f_cb(null);
                }
            });
    },
    get_gallery_items: function (connected_db, blog_id, updated_at, only_img, f_cb, s_cb) {
        if (updated_at === undefined) {
            updated_at = new Date().valueOf();
        }
        var second;
        if (only_img === true) {
            second = {
                _id:0,
                type:0,
                blog_id:0,
                etag:0,
                content:0,
                count_view:0,
                count_awesome:0,
                count_written_translations: 0,
                count_requested_translations: 0,
                count_comments:0,
                date:0,
                public_authority:0,
                is_removed:0,
                tags:0
            }
        } else {
            second = {
                _id:0,
                type:0,
                blog_id:0,
                etag:0,
                date:0,
                is_removed:0
            }
        }
        connected_db.collection('articles').find(
            {
                blog_id: blog_id,
                type:"gallery",
                is_removed:false,
                updated_at: {
                    $lt: updated_at
                }
            }, second).sort({updated_at: -1}).limit(limit["user_gallery"]).toArray(function(err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return f_cb(null);
                    } else {
                        return s_cb(docs);
                    }
                } else {
                    return f_cb(null);
                }
            });
    },
    set_main_tags: function (connected_db, main_tags) {
        connected_db.collection('main_tags').findOne(function(err, doc) {
            if (err) {
            } else {
                if (doc === null) {
                    connected_db.collection('main_tags').insertOne(
                        {
                            tags: main_tags,
                            created_at: new Date().valueOf()
                        },
                        function (err, res) {
                            if (err !== null) {

                            }
                        });
                } else {}
            }
        });
    },
    get_main_tags: function (connected_db, lang, cb) {
        connected_db.collection('main_tags').find({}, {_id:0,created_at:0}).sort({created_at: -1}).limit(1).toArray(
            function (err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return cb(null);
                    } else {
                        return cb(docs[0]["tags"]);
                    }
                } else {
                    return cb(null);
                }
            });
    },
    set_monetary_units: function (connected_db, main_tags) {
        connected_db.collection('monetary_units').findOne(function(err, doc) {
            if (err) {
            } else {
                if (doc === null) {
                    connected_db.collection('monetary_units').insertOne(
                        {
                            monetary_units: main_tags,
                            created_at: new Date().valueOf()
                        },
                        function (err, res) {
                            if (err !== null) {

                            }
                        });
                } else {}
            }
        });
    },
    get_monetary_units: function (connected_db, lang, cb) {
        connected_db.collection('monetary_units').find({}, {_id:0,created_at:0}).sort({created_at: -1}).limit(1).toArray(
            function (err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return cb(null);
                    } else {
                        return cb(docs[0]["monetary_units"]);
                    }
                } else {
                    return cb(null);
                }
            });
    },
    upsert_single_keyword_when_exists: function (connected_db, language, key, cb) {
        var data = {}
            , current
            , sum = 0
            , powered_sum = 0
            , z_score
            , sd = 0
            , mean = 0
            , pre_length = 0
            , cur_length = 0
            , cal_1
            , cal_2
            , cal_3
            , now;
        key = key.replace(/\s+/gi, '').toLowerCase();
        connected_db.collection('keywords').findOne({key: key, language:language}, function(err, doc) {
            if (err) {
                return cb();
            } else {
                if (doc === null) { /* create */
                    return cb();
                } else { /* update */
                    now = new Date().valueOf();
                    cur_length = Math.floor((now - KEYWORDS_START_DATETIME) / 3600000) + 1;
                    pre_length = Math.floor((doc.updated_at - KEYWORDS_START_DATETIME) / 3600000) + 1;
                    sum = doc.sum + 1;
                    mean = sum / cur_length;
                    data.key = key;
                    if (cur_length === pre_length) {
                        current = doc.current + 1;
                        powered_sum = doc.powered_sum - (doc.current * doc.current) + (current * current);
                    } else {
                        current = 1;
                        powered_sum = doc.powered_sum + 1;
                    }
                    cal_1 = powered_sum;
                    cal_2 = (2 * sum) * mean;
                    cal_3 = (mean * mean) * cur_length;
                    sd = cal_1 - cal_2 + cal_3;
                    sd = Math.sqrt(sd / cur_length);
                    z_score = (current - mean) / sd;
                    data.current = current;
                    data.sum = sum;
                    data.powered_sum = powered_sum;
                    data.z_score = z_score;
                    data.updated_at = now;
                    connected_db.collection('keywords').updateOne(
                        {_id: doc._id},
                        { $set: data },
                        function(err, res) {
                            return cb();
                        });
                }
            }
        });
    },
    upsert_single_keyword: function (connected_db, language, tags, index, cb) {
        var self = this
            , data = {}
            , key = tags[index]
            , current
            , sum = 0
            , powered_sum = 0
            , z_score
            , sd = 0
            , mean = 0
            , pre_length = 0
            , cur_length = 0
            , cal_1
            , cal_2
            , cal_3
            , now;
        if (index < tags.length) {
            connected_db.collection('keywords').findOne({key: tags[index], language:language}, function(err, doc) {
                if (err) {
                    return self.upsert_single_keyword(connected_db, language, tags, (index + 1), cb);
                } else {
                    now = new Date().valueOf();
                    cur_length = Math.floor((now - KEYWORDS_START_DATETIME) / 3600000) + 1;
                    if (doc === null) { /* create */
                        current = 1;
                        sum = 1;
                        mean = sum / cur_length;

                        cal_1 = powered_sum = 1;
                        cal_2 = (2 * sum) * mean;
                        cal_3 = (mean * mean) * cur_length;

                        sd = cal_1 - cal_2 + cal_3;
                        sd = Math.sqrt(sd / cur_length);
                        z_score = (current - mean) / sd;
/*
                        console.log("\n\n------------- " + self.to_i18n_utc_fixed_datetime({}) + " ---------------");
                        console.log("--------- keyword 생성 ---------");
                        console.log("cur_length: " + cur_length);
                        console.log("pre_length: " + pre_length);
                        console.log("key: " + key);
                        console.log("language: " + language);
                        console.log("current: " + current);
                        console.log("sum: " + sum);
                        console.log("powered_sum: " + powered_sum);
                        console.log("mean: " + mean);
                        console.log("cal_1: " + cal_1);
                        console.log("cal_2: " + cal_2);
                        console.log("cal_3: " + cal_3);
                        console.log("cal_1 - cal_2 + cal_3 : " + (cal_1 - cal_2 + cal_3));
                        console.log("sd: " + sd);
                        console.log("z_score: " + z_score);
                        console.log("-----------------------------\n\n");
*/
                        data.key = key;
                        data.language = language;
                        data.current = current;
                        data.sum = sum;
                        data.powered_sum = powered_sum;
                        data.z_score = z_score;
                        data.count_exposure = 0;
                        data.count_click = 0;
                        data.created_at = now;
                        data.updated_at = now;
                        data.is_removed = false;
                        data.es_index = "";
                        data.es_type = "";
                        data.es_id = "";
                        data.es_updated_at = 0;
                        data.es_is_updated = false;
                        connected_db.collection('keywords').insertOne(data, function (err, res) {
                            return self.upsert_single_keyword(connected_db, language, tags, (index + 1), cb);
                        });
                    } else { /* update */
                        pre_length = Math.floor((doc.updated_at - KEYWORDS_START_DATETIME) / 3600000) + 1;
                        sum = doc.sum + 1;
                        mean = sum / cur_length;

                        data.key = key;
                        if (cur_length === pre_length) {
                            current = doc.current + 1;
                            powered_sum = doc.powered_sum - (doc.current * doc.current) + (current * current);
                        } else {
                            current = 1;
                            powered_sum = doc.powered_sum + 1;
                        }
                        cal_1 = powered_sum;
                        cal_2 = (2 * sum) * mean;
                        cal_3 = (mean * mean) * cur_length;
                        sd = cal_1 - cal_2 + cal_3;
                        sd = Math.sqrt(sd / cur_length);
                        z_score = (current - mean) / sd;
/*
                        console.log("\n\n------------- " + self.to_i18n_utc_fixed_datetime({}) + " ---------------");
                        console.log("--------- keyword 업데이트 ---------");
                        console.log("_id: " + doc._id);
                        console.log("cur_length: " + cur_length);
                        console.log("pre_length: " + pre_length);
                        console.log("key: " + key);
                        console.log("language: " + language);
                        console.log("current: " + current);
                        console.log("sum: " + sum);
                        console.log("powered_sum: " + powered_sum);
                        console.log("mean: " + mean);
                        console.log("cal_1: " + cal_1);
                        console.log("cal_2: " + cal_2);
                        console.log("cal_3: " + cal_3);
                        console.log("cal_1 - cal_2 + cal_3 : " + (cal_1 - cal_2 + cal_3));
                        console.log("sd: " + sd);
                        console.log("z_score: " + z_score);
                        console.log("-----------------------------\n\n");
*/
                        data.current = current;
                        data.sum = sum;
                        data.powered_sum = powered_sum;
                        data.z_score = z_score;
                        data.updated_at = now;
                        connected_db.collection('keywords').updateOne(
                            {_id: doc._id},
                            { $set: data },
                            function(err, res) {
                                return self.upsert_single_keyword(connected_db, language, tags, (index + 1), cb);
                            });
                    }
                }
            });
        } else {
            return cb();
        }
    },
    upsert_keywords: function (connected_db, language, tags, cb) {
        this.upsert_single_keyword(connected_db, language, tags, 0, cb);
    },
    get_popular_keywords: function (connected_db, array, index, cb) {
        var self = this;
        if (index < array.length) {
            connected_db.collection('keywords').find({ language: array[index].language, is_removed: false }).sort({sum: -1, updated_at: -1}).limit(20).toArray(
                function(err, docs) {
                    if (err === null && docs !== null) {
                        if (docs.length === 0) {
                            array[index].docs = [];
                        } else {
                            array[index].docs = docs;
                        }
                    } else {
                        array[index].docs = [];
                    }
                    return self.get_popular_keywords(connected_db, array, (index + 1), cb);
                });
        } else {
            return cb(array);
        }
    },
    get_popular_keywords_per_language: function (connected_db, cb) {
        var array = [
                { "language": "en" }
                , { "language": "ja" }
                , { "language": "ko" }
                , { "language": "zh-Hans" }
            ];
        return this.get_popular_keywords(connected_db, array, 0, cb);
    },
    get_realtime_popular_keywords: function (connected_db, lang, cb) {
        var first = {}
            , second = {};
        first.language = lang;
        first.is_removed = false;
        second._id = 0;
        second.key = 1;
        second.created_at = 1;
        second.current = 1;
        connected_db.collection('keywords').find(first, second).sort({z_score: -1, current: -1, updated_at:-1}).limit(10).toArray(
            function(err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return cb(null);
                    } else {
                        return cb(docs);
                    }
                } else {
                    return cb(null);
                }
            });

        /*var date = this.to_eight_digits_date();*/
        /*var self = this;*/

        /*
         db.articles.aggregate([
         { $match: {date: "20170310"}},
         { $project: { tags: 1}},
         { $unwind: "$tags"},
         { $group: { "_id": "$tags", count: { $sum: 1 } }},
         { $sort: { count: -1 }},
         { $limit:10 }
         ]);
         */
        /*connected_db.collection("articles").aggregate([
            { $match: {date: date}},
            { $project: { tags: 1}},
            { $unwind: "$tags"},
            { $group: { "_id": "$tags", count: { $sum: 1 } }},
            { $sort: { count: -1 }},
            { $limit:10 }
        ]).toArray(
            function (err, docs) {
                if (err === null && docs !== null) {
                    date = self.to_eight_digits_date(new Date(new Date().getTime() - (24 * 60 * 60 * 1000)));
                    if (docs.length < 10) {
                        connected_db.collection("articles").aggregate([
                            { $match: {date: date}},
                            { $project: { tags: 1}},
                            { $unwind: "$tags"},
                            { $group: { "_id": "$tags", count: { $sum: 1 } }},
                            { $sort: { count: -1 }},
                            { $limit:10 }
                        ]).toArray(
                            function (err, docs2) {
                                if (err === null && docs2 !== null) {
                                    var is_same = false;
                                    if (docs2.length !== 0) {
                                        for (var i = 0; i < docs2.length; i++) {
                                            if (docs.length === 10) {
                                                break;
                                            }
                                            is_same = false;
                                            for (var j = 0; j < docs.length; j++) {
                                                if (docs[j]["_id"] === docs2[i]["_id"]) {
                                                    is_same = true;
                                                }
                                            }
                                            if (is_same === false) {
                                                docs.push(docs2[i]);
                                            }
                                        }
                                        cb(docs);
                                    } else {
                                        cb(docs);
                                    }
                                } else {
                                    cb(docs);
                                }
                            });
                    } else {
                        cb(docs);
                    }
                } else {
                    cb(null);
                }
            });*/
    },
    /**
     *
     * @param connected_db
     * @param data {object}
     * @param data.name - User's name
     * @param data.blog_id - User's blog_id
     * @param data.img - User's profile image
     * @param data.key - tag
     * @param cb
     */
    insert_tag: function (connected_db, data, cb) {
        var date = new Date().valueOf();
        data.count = 1;
        data.created_at = date;
        data.updated_at = date;
        connected_db.collection('tags').insertOne(data, function (err, res) {
            cb();
        });
    },
    get_single_tag: function (connected_db, blog_id, key, cb) {
        connected_db.collection('tags').findOne({blog_id:blog_id, key: key}, function(err, doc) {
            if (err) {
                return cb(null);
            } else {
                if (doc === null) {
                    return cb(null);
                } else {
                    return cb(doc);
                }
            }
        });
    },
    seriously_remove_tag: function (connected_db, _id, cb) {
        connected_db.collection('tags').remove({_id: _id}, function (err, result) {
            return cb();
        });
    },
    update_tag_count: function (connected_db, _id, action, cb) {
        var first = {}
            , second = {};
        first._id = _id;
        second["$set"] = {};
        second["$set"].updated_at = new Date().valueOf();
        second["$inc"] = {};
        if (action === "inc") {
            second["$inc"].count = 1;
        } else if (action === "dec") {
            second["$inc"].count = -1;
        } else {
            return cb();
        }

        connected_db.collection('tags').updateOne(
            first,
            second,
            function(err, res) {
                return cb();
            });
    },
    /**
     *
     * @param connected_db {object} - MongoDB Object
     * @param tags {array} - string array of tags
     * @param index {number} - index of tags
     * @param action {string} - "inc" || "dec"
     * @param cb {function}
     */
    upsert_user_tags: function (connected_db, user, tags, index, action, cb) {
        var self = this
            , blog_id = user.blog_id
            , data = {}
            , date;
        if (index >= tags.length) {
            return cb();
        }
        if (action === "inc") {
            return self.get_single_tag(connected_db, blog_id, tags[index], function (doc) {
                if (doc === null) { /* Insert tag */
                    date = new Date().valueOf();
                    data.blog_id = user.blog_id;
                    data.key = tags[index];
                    data.name = user.name;
                    data.img = user.img;

                    return self.insert_tag(connected_db, data, function () {
                        return self.upsert_user_tags(connected_db, user, tags, (index + 1), action, cb);
                    });
                } else { /* Inc count tag */
                    return self.update_tag_count(connected_db, doc._id, "inc", function () {
                        return self.upsert_user_tags(connected_db, user, tags, (index + 1), action, cb);
                    });
                }
            });
        } else if (action == "dec") {
            return self.get_single_tag(connected_db, blog_id, tags[index], function (doc) {
                if (doc === null) { /* Cannot decrease tag */
                    return self.upsert_user_tags(connected_db, user, tags, (index + 1), action, cb);
                } else { /* Inc count tag */
                    if (doc.count <= 1) { /* Remove tag */
                        return self.seriously_remove_tag(connected_db, doc._id, function () {
                            return self.upsert_user_tags(connected_db, user, tags, (index + 1), action, cb);
                        });
                    } else { /* Dec count tag */
                        return self.update_tag_count(connected_db, doc._id, "dec", function () {
                            return self.upsert_user_tags(connected_db, user, tags, (index + 1), action, cb);
                        });
                    }
                }
            });
        } else {
            return cb();
        }
    },

    /**
     * @param connected_db
     * @param message_data {Object} - 메시지 정보
     * @param message_data.from_blog_id - 보내는 이 blog_id
     * @param message_data.from_name - 보내는 이 이름
     * @param message_data.from_img - 보내는 이 사진
     * @param message_data.content - 메시지 내용
     * @param message_data.to_blog_id - 받는 이 blog_id
     * @param f_cb
     * @param s_cb
     */
    insert_message: function (connected_db, message_data, f_cb, s_cb) {
        var date = new Date().valueOf();
        message_data._id = message_data.from_blog_id + '_' +
            message_data.to_blog_id + '_' +
            date + randomstring.generate(6);
        message_data.created_at = date;
        message_data.is_removed_from = false; /* 보낸 이가 삭제 시도할 경우, true */
        message_data.is_removed_to = false; /* 받은 이가 삭제 시도할 경우, true */

        if (message_data.to_blog_id === '') { /* 블로그아이디 지정하지 않은 사용자에게 메시지 보내는 경우 */
            return f_cb(null);
        }

        connected_db.collection('messages').insertOne(message_data, function (err, res) {
            if (err === null) {
                return s_cb(null);
            } else {
                return f_cb(null);
            }
        });
    },
    /* 메시지 삭제 */
    remove_message: function (connected_db, first, blog_id, f_cb, s_cb) {
        var second = {};
        second['$set'] = {};
        /* 자기자신에게 쓴 사용자가 삭제하는 경우도 고려해야하므로,
         * if 문 두개로 돌려야 된다. */
        /* 받는이가 삭제하는 경우 */
        if (first.to_blog_id === blog_id) {
            second['$set']['is_removed_to'] = true;
        }
        /* 보낸이가 삭제하는 경우 */
        if (first.from_blog_id === blog_id) {
            second['$set']['is_removed_from'] = true;
        }
        connected_db.collection('messages').updateOne(
            first,
            second,
            function(err, res) {
                if (err === null) {
                    return s_cb(null);
                } else {
                    return f_cb(null);
                }
            });
    },
    /* 읽지않은 메시지 목록 반환 */
    check_unread_messages: function (connected_db, first, f_cb, s_cb) {
        connected_db.collection('messages').count(first, function(err, count) {
            if (err === null) {
                if (count === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(count);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    /* checked_messages_at, checked_notifications_at update 하기 */
    update_checked_at: function (connected_db, user_id, secret_id, type, f_cb, s_cb) {
        var update_type = 'checked_' + type + '_at';
        var second = {}
            , date = new Date().valueOf();
        second["$set"] = {};
        second["$set"][update_type] = date;
        second["$set"]['updated_at'] = date;
        try {
            user_id = new ObjectId(user_id);
        } catch (e) {
            return f_cb(null);
        }
        connected_db.collection('users').updateOne(
            {_id:user_id, secret_id:secret_id, is_removed:false},
            second,
            function(err, res) {
                if (err === null) {
                    return s_cb(null);
                } else {
                    return f_cb(null);
                }
            });

    },
    get_single_message: function (connected_db, first, f_cb, s_cb) {
        connected_db.collection('messages').findOne(first, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    return s_cb(doc);
                }
            }
        });
    },
    /**
     *
     * @param connected_db
     * @param data - 사용자 정보
     * @param data.type - 'all' || 'received' || 'sent'
     * @param data.blog_id
     * @param data.created_at - 필수 요소 아님 undefined일 경우, 최신 정보 가져오기. 존재할 경우, $lt으로 가져오기
     * @param f_cb
     * @param s_cb
     */
    get_messages: function (connected_db, data, f_cb, s_cb) {
        var first = {}
            , second = {
                is_removed_to:0
                , is_removed_from:0
            }
            , sort = { created_at: -1 };

        /* created_at 정의 */
        if (data.created_at !== undefined) {
            first['created_at'] = {};
            first['created_at']['$lt'] = data.created_at;
        }

        /*
         $or: [{to_blog_id: blog_id, is_removed_to: false}, {from_blog_id: blog_id, is_removed_from: false}]
        $or: [{to_blog_id: blog_id, is_removed_to: false}, {from_blog_id: blog_id, is_removed_from: false}], updated_at: {$lt: created_at}
        */
        if (data.type === 'all') {
            first['$or'] = [];
            first['$or'].push({to_blog_id: data.blog_id, is_removed_to: false});
            first['$or'].push({from_blog_id: data.blog_id, is_removed_from: false});
        } else if (data.type === 'received') {
            first['to_blog_id'] = data.blog_id;
            first['is_removed_to'] = false;
        } else if (data.type === 'sent') {
            first['from_blog_id'] = data.blog_id;
            first['is_removed_from'] = false;
        }
        connected_db.collection('messages').find(first, second).sort(sort).limit(limit.messages).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return s_cb([]);
                } else {
                    return s_cb(docs);
                }
            } else {
                /* 에러난 경우에는 response false 반환! */
                return f_cb(null);
            }
        });
    },
    /**
     * @param connected_db
     * @param data {Object} - Notification Object
     * @param data.type {String} - announcement ||
     * @param data.blog_id {String} - User's blog_id. If type is announcement blog_id must be "gleant"
     * @param data.link {String} - Link
     * @param data.info {String} - Specific Information
     * @param data.subscribers {Array} - Subscribers
     * @param f_cb
     * @param s_cb
     */
    insert_notification: function (connected_db, data, f_cb, s_cb) {
        var first = {}
            , now = new Date().valueOf();

        first["_id"] = data.type + now + randomstring.generate();
        first["type"] = data.type;
        if (data.type === "announcement") {
            first["subscribers"] = ["all"];
            first["link"] = data.link;
        } else if (
            data.type === "friend_request" ||
            data.type === "friend_accept"
        ) {
            first["subscribers"] = data.subscribers;
        } else {
            first["subscribers"] = data.subscribers;
            first["link"] = data.link;
        }
        first["blog_id"] = data.blog_id;
        first["info"] = data.info;
        first["created_at"] = now;
        first["updated_at"] = now;
        first["is_removed"] = false;

        connected_db.collection('notifications').insertOne(first, function (err, res) {
            if (err === null) {
                return s_cb(null);
            } else {
                return f_cb(null);
            }
        });
    },
    get_single_notification: function (connected_db, data, f_cb, s_cb) {
        data['is_removed'] = false;
        connected_db.collection('notifications').findOne(data, {}, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    return s_cb(doc);
                }
            }
        });
    },
    check_unread_notifications: function (connected_db, first, f_cb, s_cb) {
        connected_db.collection('notifications').count(first, function(err, count) {
            if (err === null) {
                if (count === 0) {
                    return f_cb(null);
                } else {
                    return s_cb(count);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    /**
     *
     * @param connected_db
     * @param data {Object}
     * @param data.blog_id {String} - user.blog_id
     * @param data.updated_at
     * @param f_cb
     * @param s_cb
     */
    get_notifications: function (connected_db, data, f_cb, s_cb) {
        var first = {}
            , second = {is_removed:0, subscribers:0}
            , sort = { updated_at: -1 };

        if (data.updated_at !== undefined) {
            first['updated_at'] = {};
            first['updated_at']['$lt'] = data.updated_at;
        }
        first['$or'] = [];
        first['$or'].push({type: "announcement"});
        first['$or'].push({subscribers: data.blog_id});
        first['is_removed'] = false;

        connected_db.collection('notifications').find(first, second).sort(sort).limit(limit.notifications).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return s_cb([]);
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    /**
     *
     * @param connected_db
     * @param type
     * @param user
     * @param data
     * @param data.members -
     * @param f_cb
     * @param s_cb
     */
    get_excluders: function (connected_db, user, data, f_cb, s_cb) {
        var first = {}
            , first_article = {}
            , excluders;
        first.type = data.big_type;
        first.blog_id = user.blog_id;
        first.is_removed = false;
        first_article.is_removed = false;

        if (data.members === undefined) {
            data.members = [];
        }
        var go = function (first, users) {
            connected_db.collection('notifications').distinct("subscribers", first, function(err, docs) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (docs === null) {
                        return s_cb(users);
                    } else {
                        if (docs.length === 0) {
                            return s_cb(users);
                        } else {
                            excluders = _.union(users, docs);
                            return s_cb(excluders);
                        }
                    }
                }
            });
        };

        if (data.big_type === "invitation_request") {
            if (data.article_type === 'agenda') { /* Agenda */
                first.link = "/agenda/" + data.article_id;
            } else if (data.article_type === 'hire_me') { /* Hire Me */
                first.link = "/hire-me/" + data.article_id;
            } else if (data.article_type === 'apply_now') { /* Apply Now */
                first.link = "/apply-now/" + data.article_id;
            }
            return go(first, data.members);
        } else {
            if (data.big_type === "opinion_request") {
                first_article.type = "opinion";
                first_article.agenda_id = data.article_id;
                first.link = "/agenda/" + data.article_id;
            } else if (data.big_type === "translation_request") {
                if (data.article_type === 'agenda') { /* Agenda */
                    first_article.type = "tr_agenda";
                    first_article.agenda_id = data.article_id;
                    first.link = "/agenda/" + data.article_id;
                } else if (data.article_type === 'opinion') { /* Hire Me */
                    first_article.type = "tr_opinion";
                    first_article.opinion_id = data.article_id;
                    first.link = "/agenda/" + data.agenda_id + "/opinion/" +  data.article_id;
                }
            }
            connected_db.collection('articles').distinct("blog_id", first_article, function(err, docs) {
                if (err) {
                    return f_cb(null);
                } else {
                    if (docs === null) {
                        return go(first, data.members);
                    } else {
                        if (docs.length === 0) {
                            return go(first, data.members);
                        } else {
                            excluders = _.union(data.members, docs);
                            return go(first, excluders);
                        }
                    }
                }
            });
        }
    },
    get_debate_recommended_users: function (connected_db, excluders, tags, f_cb, s_cb) {
        var first = {}
            , second = {}
            , limit = 100
            , temp
            , user_objs = {}
            , list = [];
        if (excluders.length > 0) {
            first["blog_id"] = {};
            first["blog_id"]["$nin"] = excluders;
        }
        if (tags.length > 1) {
            first["$or"] = [];
            for (var i = 0; i < tags.length; i++) {
                first["$or"].push({key: tags[i]});
            }
        } else {
            if (tags.length === 0) {
                return f_cb(null);
            } else {
                first["key"] = tags[0];
            }
        }
        second._id = 0;
        if (tags.length < 10) {
            limit = tags.length * 10;
        }
        connected_db.collection('tags').find(first, second).sort({count: -1}).limit(limit).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return s_cb([]);
                } else {
                    user_objs = {};
                    for (var i = 0; i < docs.length; i++) {
                        if ( user_objs[docs[i].blog_id] === undefined ) {
                            temp = docs[i];
                            temp.total = temp.count;
                            temp.info = [];
                            temp.info.push({
                                key: temp.key
                                , count: temp.count
                            });
                            user_objs[temp.blog_id] = temp;
                        } else {
                            temp = user_objs[docs[i].blog_id];
                            temp.total = temp.total + docs[i].count;
                            temp.info.push({
                                key: docs[i].key
                                , count: docs[i].count
                            });
                            user_objs[temp.blog_id] = temp;
                        }
                    }
                    for (var key in user_objs) {
                        list.push(user_objs[key]);
                    }
                    list = _.sortBy(list, "total").reverse();
                    return s_cb(list);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    get_translation_recommended_users: function (connected_db, excluders, data, f_cb, s_cb) {
        var first = {}
            , second = {}
            , count = {}
            , limit = 20
            , temp;
        if (excluders.length > 0) {
            first["blog_id"] = {};
            first["blog_id"]["$nin"] = excluders;
        }
        first["$or"] = [];
        temp = {};
        temp[data.source_lang + "_" + data.target_lang] = {};
        temp[data.source_lang + "_" + data.target_lang]["$gt"] = 0;
        first["$or"].push(temp);
        temp = {};
        temp[data.target_lang + "_" + data.source_lang] = {};
        temp[data.target_lang + "_" + data.source_lang]["$gt"] = 0;
        first["$or"].push(temp);
        temp = {};
        temp["main_language"] = data.source_lang;
        temp["available_languages"] = data.target_lang;
        first["$or"].push(temp);
        temp = {};
        temp["main_language"] = data.target_lang;
        temp["available_languages"] = data.source_lang;
        first["$or"].push(temp);

        second._id = 0;
        second.name = 1;
        second.blog_id = 1;
        second.img = 1;
        second.main_language = 1;
        second.available_languages = 1;
        second[ data.source_lang + "_" + data.target_lang ] = 1;
        second[ data.target_lang + "_" + data.source_lang ] = 1;

        count[ data.source_lang + "_" + data.target_lang ] = -1;
        count[ data.target_lang + "_" + data.source_lang ] = -1;
        count["count_awesome"] = -1;

        connected_db.collection('users').find(first, second).sort(count).limit(limit).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return s_cb([]);
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    add_friend_to_user: function (connected_db, user_blog_id, friend_blog_id, f_cb, s_cb) {
        var first = {}
            , second = {};
        first.blog_id = user_blog_id;
        second["$addToSet"] = {};
        second["$addToSet"]["friends"] = friend_blog_id;
        connected_db.collection('users').updateOne(
            first, second,
            function(err, res) {
                if (err === null) {
                    return s_cb(null);
                } else {
                    return f_cb(null);
                }
            });
    },
    remove_friend_from_user: function (connected_db, user_blog_id, friend_blog_id, f_cb, s_cb) {
        var first = {}
            , second = {};
        first.blog_id = user_blog_id;
        second["$pull"] = {};
        second["$pull"]["friends"] = friend_blog_id;
        connected_db.collection('users').updateOne(
            first, second,
            function(err, res) {
                if (err === null) {
                    return s_cb(null);
                } else {
                    return f_cb(null);
                }
            });
    },

    /*
    * user -> target_user
    * 1. Insert Notification
    *    type: friend_request
    *    blog_id: user.blog_id
    *    subscribers: [target_user.blog_id]
    **/
    request_add_friend: function (connected_db, user, target_user, f_cb, s_cb) {
        var data = {}
            , self = this;
        data.type = "friend_request";
        data.blog_id = user.blog_id;
        data["info"] = {};
        data["info"]["users"] = [];
        data["info"]["users"].push({
            blog_id: user.blog_id
            , name: user.name
            , img: user.img
        });
        data["info"]["users"].push({
            blog_id: target_user.blog_id
            , name: target_user.name
            , img: target_user.img
        });

        data.subscribers = [];
        data.subscribers.push(target_user.blog_id);
        /* Check user already requested friend */
        self.get_single_notification(connected_db, {
                type: data.type
                , blog_id: user.blog_id
                , subscribers: target_user.blog_id
            }, function (nothing) {
                return self.insert_notification(connected_db, data, f_cb, s_cb);
            },function (nothing) {
                return f_cb(null);
            });
    },
    /*
     * source_user -> user
     * 1. Remove Notification
     *    type: friend_request
     *    blog_id: source_user.blog_id
     *    subscribers: [ user.blog_id ]
     **/
    remove_add_friend: function (connected_db, source_user, user, f_cb, s_cb) {
        var data = {};
        data.type = "friend_request";
        data["$or"] = [];
        data["$or"].push({blog_id: source_user.blog_id, subscribers: user.blog_id});
        data["$or"].push({blog_id: user.blog_id, subscribers: source_user.blog_id});
        connected_db.collection('notifications').remove(data, function (err, result) {
            if (err === null) {
                return s_cb(null);
            } else {
                return f_cb(null);
            }
        });
    },

    /*
     * source_user -> user
     * Transaction Status
     * 1. init
     * 2. source_done
     * 3. target_done
     * 4. removing_done
     * 5. done
     **/
    accept_add_friend: function (connected_db, source_user, user, f_cb, s_cb) {
        var self = this
            , transaction_data = {}
            , data = {}
            , second = {}
            , _id;
        data["type"] = "friend_accept";
        data["source"] = source_user.blog_id;
        data["target"] = user.blog_id;
        data["info"] = {};
        data["info"]["users"] = [];
        data["info"]["users"].push({
            blog_id: source_user.blog_id
            , name: source_user.name
            , img: source_user.img
        });
        data["info"]["users"].push({
            blog_id: user.blog_id
            , name: user.name
            , img: user.img
        });
        transaction_data["type"] = "friend_remove";
        transaction_data["$or"] = [];
        transaction_data["$or"].push({source: source_user.blog_id, target: user.blog_id});
        transaction_data["$or"].push({source: user.blog_id, target: source_user.blog_id});
        /* Check Removing Current Friend Transaction working. */
        self.get_single_transaction(connected_db, transaction_data, function (nothing) {
            /* If Removing Current Friend doesn't exist, keep going. */
            transaction_data["type"] = "friend_accept";
            self.get_single_transaction(connected_db, transaction_data, function (nothing) {
                /* Insert and Complete Transaction */
                self.insert_transaction(connected_db, data, f_cb, function (doc) {
                    _id = doc._id;
                    /* Add user.blog_id to source_user's friends */
                    self.add_friend_to_user(connected_db, source_user.blog_id, user.blog_id, f_cb, function (nothing) {
                        second["$set"] = {};
                        second["$set"]["status"] = "source_done";
                        self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                            /* Add source_user.blog_id to user's friends */
                            self.add_friend_to_user(connected_db, user.blog_id, source_user.blog_id, f_cb, function (nothing) {
                                second["$set"] = {};
                                second["$set"]["status"] = "target_done";
                                self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                                    /* Remove Friend Request Notifications */
                                    self.remove_add_friend(connected_db, source_user, user, f_cb, function (nothing) {
                                        second["$set"] = {};
                                        second["$set"]["status"] = "removing_done";
                                        self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                                            /* Add Friend Accept Notification */
                                            data = {};
                                            data["type"] = "friend_accept";
                                            data["blog_id"] = source_user.blog_id;
                                            data["subscribers"] = [];
                                            data["subscribers"].push(source_user.blog_id);
                                            data["subscribers"].push(user.blog_id);
                                            data["info"] = {};
                                            data["info"]["users"] = [];
                                            data["info"]["users"].push({
                                                blog_id: source_user.blog_id
                                                , name: source_user.name
                                                , img: source_user.img
                                            });
                                            data["info"]["users"].push({
                                                blog_id: user.blog_id
                                                , name: user.name
                                                , img: user.img
                                            });

                                            self.insert_notification(connected_db, data, f_cb, function (nothing) {
                                                /* Update transaction to Done! */
                                                second["$set"] = {};
                                                second["$set"]["status"] = "done";
                                                self.update_transaction(connected_db, {_id: _id}, second, f_cb, s_cb);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }, function (doc) {
                return s_cb(null);
            });
        }, function (doc) {
            /* If Removing Current Friend exists, and it is done, delete it and keep going. */
            if (doc.status !== "done") {
                return f_cb(null);
            }
            _id = doc._id;
            self.remove_transaction(connected_db, {_id:_id}, f_cb, function (nothing) {
                transaction_data["type"] = "friend_accept";
                self.get_single_transaction(connected_db, transaction_data, function (nothing) {
                    /* Insert and Complete Transaction */
                    self.insert_transaction(connected_db, data, f_cb, function (doc) {
                        _id = doc._id;
                        /* Add user.blog_id to source_user's friends */
                        self.add_friend_to_user(connected_db, source_user.blog_id, user.blog_id, f_cb, function (nothing) {
                            second["$set"] = {};
                            second["$set"]["status"] = "source_done";
                            self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                                /* Add source_user.blog_id to user's friends */
                                self.add_friend_to_user(connected_db, user.blog_id, source_user.blog_id, f_cb, function (nothing) {
                                    second["$set"] = {};
                                    second["$set"]["status"] = "target_done";
                                    self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                                        /* Remove Friend Request Notifications */
                                        self.remove_add_friend(connected_db, source_user, user, f_cb, function (nothing) {
                                            second["$set"] = {};
                                            second["$set"]["status"] = "removing_done";
                                            self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                                                /* Add Friend Accept Notification */
                                                data = {};
                                                data["type"] = "friend_accept";
                                                data["blog_id"] = source_user.blog_id;
                                                data["subscribers"] = [];
                                                data["subscribers"].push(source_user.blog_id);
                                                data["subscribers"].push(user.blog_id);
                                                data["info"] = {};
                                                data["info"]["users"] = [];
                                                data["info"]["users"].push({
                                                    blog_id: source_user.blog_id
                                                    , name: source_user.name
                                                    , img: source_user.img
                                                });
                                                data["info"]["users"].push({
                                                    blog_id: user.blog_id
                                                    , name: user.name
                                                    , img: user.img
                                                });
                                                self.insert_notification(connected_db, data, f_cb, function (nothing) {
                                                    /* Update transaction to Done! */
                                                    second["$set"] = {};
                                                    second["$set"]["status"] = "done";
                                                    self.update_transaction(connected_db, {_id: _id}, second, f_cb, s_cb);
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                }, function (doc) {
                    return s_cb(null);
                });
            });
        });
    },
    /*
     * source_user -> user
     * Transaction Status
     * 1. init
     * 2. source_done
     * 3. target_done
     * 4. done
     **/
    remove_current_friend: function (connected_db, user, target_user, f_cb, s_cb) {
        var self = this
            , notification_data = {}
            , transaction_data = {}
            , data = {}
            , second = {}
            , _id;
        data["type"] = "friend_remove";
        data["source"] = user.blog_id;
        data["target"] = target_user.blog_id;
        data["info"] = {};
        data["info"]["users"] = [];
        data["info"]["users"].push({
            blog_id: user.blog_id
        });
        data["info"]["users"].push({
            blog_id: target_user.blog_id
        });

        notification_data.type = "friend_accept";
        notification_data["$or"] = [];
        notification_data["$or"].push({blog_id: user.blog_id, subscribers: target_user.blog_id});
        notification_data["$or"].push({blog_id: target_user.blog_id, subscribers: user.blog_id});
        /* 1. Remove Friend Accept Notification */
        connected_db.collection('notifications').remove(notification_data, function (err, result) {
            if (err === null) {
                /* 2. Find Friend Accept Done Transaction */
                transaction_data["type"] = "friend_accept";
                transaction_data["$or"] = [];
                transaction_data["$or"].push({source: user.blog_id, target: target_user.blog_id});
                transaction_data["$or"].push({source: target_user.blog_id, target: user.blog_id});
                self.get_single_transaction(connected_db, transaction_data, function (nothing) {
                    /* When Friend Accept transaction does not exists, keep going. */
                    transaction_data["type"] = "friend_remove";
                    self.get_single_transaction(connected_db, transaction_data, function (nothing) {
                        /* Insert and Complete Transaction */
                        self.insert_transaction(connected_db, data, f_cb, function (doc) {
                            _id = doc._id;
                            /* Pull target_user.blog_id from user's friends */
                            self.remove_friend_from_user(connected_db, user.blog_id, target_user.blog_id, f_cb, function (nothing) {
                                second["$set"] = {};
                                second["$set"]["status"] = "source_done";
                                self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                                    /* Pull user.blog_id to target_user's friends */
                                    self.remove_friend_from_user(connected_db, target_user.blog_id, user.blog_id, f_cb, function (nothing) {
                                        second["$set"] = {};
                                        second["$set"]["status"] = "target_done";
                                        self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                                            /* Remove Friend Request Notifications */
                                            self.remove_add_friend(connected_db, user, target_user, f_cb, function (nothing) {
                                                second["$set"] = {};
                                                second["$set"]["status"] = "done";
                                                self.update_transaction(connected_db, {_id: _id}, second, f_cb, s_cb);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    }, function (doc) {
                        return s_cb(null);
                    });
                }, function (doc) {
                    /* When Friend Accept transaction exists, check status. */
                    if (doc.status !== "done") {
                        return f_cb(null);
                    }
                    /* If Friend Accept Done exists, delete it and keep going. */
                    _id = doc._id;
                    self.remove_transaction(connected_db, {_id:_id}, f_cb, function (nothing) {
                        transaction_data["type"] = "friend_remove";
                        self.get_single_transaction(connected_db, transaction_data, function (nothing) {
                            /* Insert and Complete Transaction */
                            self.insert_transaction(connected_db, data, f_cb, function (doc) {
                                _id = doc._id;
                                /* Pull target_user.blog_id from user's friends */
                                self.remove_friend_from_user(connected_db, user.blog_id, target_user.blog_id, f_cb, function (nothing) {
                                    second["$set"] = {};
                                    second["$set"]["status"] = "source_done";
                                    self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                                        /* Pull user.blog_id to target_user's friends */
                                        self.remove_friend_from_user(connected_db, target_user.blog_id, user.blog_id, f_cb, function (nothing) {
                                            second["$set"] = {};
                                            second["$set"]["status"] = "target_done";
                                            self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                                                /* Remove Friend Request Notifications */
                                                self.remove_add_friend(connected_db, user, target_user, f_cb, function (nothing) {
                                                    second["$set"] = {};
                                                    second["$set"]["status"] = "done";
                                                    self.update_transaction(connected_db, {_id: _id}, second, f_cb, s_cb);
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        }, function (doc) {
                            return s_cb(null);
                        });
                    });
                });
            } else {
                return f_cb(null);
            }
        });
    },
    get_friends: function (connected_db, data, f_cb, s_cb) {
        var first = {}
            , second
            , self = this
            , sort
            , skip;

        var type = data.type;
        if (type === "friends") {
            first = {
                friends: data.blog_id
                , is_removed: false
            };
            if (data.excluders !== undefined && data.excluders.length > 0) {
                first["blog_id"] = {};
                first["blog_id"]["$nin"] = data.excluders;
            }
            second = {
                _id: 0
                , blog_id: 1
                , img: 1
                , name: 1
                , verified_profile: 1
                , main_language: 1
                , available_languages: 1
                , employment: 1
                , education: 1
                , location: 1
                , simple_career: 1
                , prize: 1
                , ranking: 1
                , "en_ja": 1
                , "en_ko": 1
                , "en_zh-Hans": 1
                , "ja_en": 1
                , "ja_ko": 1
                , "ja_zh-Hans": 1
                , "ko_en": 1
                , "ko_ja": 1
                , "ko_zh-Hans": 1
                , "zh-Hans_en": 1
                , "zh-Hans_ja": 1
                , "zh-Hans_ko": 1
            };
            sort = {
                name: 1
                , blog_id: 1
            };
            if (data.skip === undefined) {
                skip = 0;
            } else {
                skip = data.skip;
            }
            connected_db.collection('users').find(first, second).sort(sort).skip(skip).limit(limit.friends).toArray(function(err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return f_cb(null);
                    } else {
                        return s_cb(docs);
                    }
                } else {
                    return f_cb(null);
                }
            });
        } else if (
            type === "received" ||
            type === "sent"
        ) {
            first.type = "friend_request";
            if (type === "received") {
                first.subscribers = data.blog_id;
            } else {
                first.blog_id = data.blog_id;
            }
            first['is_removed'] = false;
            if (data.created_at !== undefined) {
                first['created_at'] = {};
                first['created_at']['$lt'] = data.created_at;
            }
            second = {is_removed:0, subscribers:0};
            sort = { created_at: -1 };
            connected_db.collection('notifications').find(first, second).sort(sort).limit(limit.notifications).toArray(function(err, docs) {
                if (err === null && docs !== null) {
                    if (docs.length === 0) {
                        return s_cb([]);
                    } else {
                        return s_cb(docs);
                    }
                } else {
                    return f_cb(null);
                }
            });
        } else {
            return f_cb(null);
        }
    },

    request_help_opinion: function (connected_db, user, target_user, data, f_cb, s_cb) {
        var input = {}
            , self = this;
        input.type = "opinion_request";
        input.link = data.link;
        input.blog_id = user.blog_id;
        input["info"] = {};
        input["info"]["users"] = [];
        input["info"]["users"].push({
            blog_id: user.blog_id
            , name: user.name
            , img: user.img
        });
        input["info"]["users"].push({
            blog_id: target_user.blog_id
            , name: target_user.name
            , img: target_user.img
        });
        input["info"]["title"] = data.title;
        input["info"]["img"] = data.img;

        input.subscribers = [];
        input.subscribers.push(target_user.blog_id);
        /* Check user already requested friend */
        self.get_single_notification(connected_db, {
            type: input.type
            , link: input.link
            , blog_id: user.blog_id
            , subscribers: target_user.blog_id
        }, function (nothing) {
            return self.insert_notification(connected_db, input, f_cb, s_cb);
        },function (nothing) {
            return f_cb(null);
        });
    },
    remove_help_opinion: function (connected_db, user, target_user, data, f_cb, s_cb) {
        var first = {};
        first.type = "opinion_request";
        first.link = data.link;
        first.blog_id = user.blog_id;
        first.subscribers = target_user.blog_id;
        connected_db.collection('notifications').remove(first, function (err, result) {
            if (err === null) {
                return s_cb(null);
            } else {
                return f_cb(null);
            }
        });
    },
    request_help_translation: function (connected_db, user, target_user, data, f_cb, s_cb) {
        var input = {}
            , self = this;
        input.type = "translation_request";
        input.link = data.link;
        input.blog_id = user.blog_id;
        input["info"] = {};
        input["info"]["users"] = [];
        input["info"]["users"].push({
            blog_id: user.blog_id
            , name: user.name
            , img: user.img
        });
        input["info"]["users"].push({
            blog_id: target_user.blog_id
            , name: target_user.name
            , img: target_user.img
        });
        input["info"]["type"] = data.type; /* agenda || opinion */
        input["info"]["title"] = data.title;
        input["info"]["img"] = data.img;
        input["info"]["languages"] = {
            source: data.source_lang
            , target: data.target_lang
        };

        input.subscribers = [];
        input.subscribers.push(target_user.blog_id);
        /* Check user already requested friend */
        self.get_single_notification(connected_db, {
            type: input.type
            , link: input.link
            , blog_id: user.blog_id
            , subscribers: target_user.blog_id
        }, function (nothing) {
            return self.insert_notification(connected_db, input, f_cb, s_cb);
        },function (nothing) {
            return f_cb(null);
        });
    },
    remove_help_translation: function (connected_db, user, target_user, data, f_cb, s_cb) {
        var first = {};
        first.type = "translation_request";
        first.link = data.link;
        first.blog_id = user.blog_id;
        first.subscribers = target_user.blog_id;
        connected_db.collection('notifications').remove(first, function (err, result) {
            if (err === null) {
                return s_cb(null);
            } else {
                return f_cb(null);
            }
        });
    },
    request_invitation: function (connected_db, user, target_user, data, f_cb, s_cb) {
        var input = {}
            , self = this;
        input.type = "invitation_request";
        input.link = data.link;
        input.blog_id = user.blog_id;
        input["info"] = {};
        input["info"]["users"] = [];
        input["info"]["users"].push({
            blog_id: user.blog_id
            , name: user.name
            , img: user.img
        });
        input["info"]["users"].push({
            blog_id: target_user.blog_id
            , name: target_user.name
            , img: target_user.img
        });
        input["info"]["type"] = data.type; /* agenda || hire_me || apply_now */
        input["info"]["_id"] = data._id;
        input["info"]["title"] = data.title;
        input["info"]["img"] = data.img;

        input.subscribers = [];
        input.subscribers.push(target_user.blog_id);
        /* Check user already requested friend */
        self.get_single_notification(connected_db, {
            type: input.type
            , link: input.link
            , blog_id: user.blog_id
            , subscribers: target_user.blog_id
        }, function (nothing) {
            return self.insert_notification(connected_db, input, f_cb, s_cb);
        },function (nothing) {
            return f_cb(null);
        });
    },
    remove_invitation: function (connected_db, source_user, user, data, f_cb, s_cb) {
        var first = {};
        first.type = "invitation_request";
        first.link = data.link;
        first["$or"] = [];
        first["$or"].push({blog_id: source_user.blog_id, subscribers: user.blog_id});
        first["$or"].push({blog_id: user.blog_id, subscribers: source_user.blog_id});

        connected_db.collection('notifications').remove(first, function (err, result) {
            if (err === null) {
                return s_cb(null);
            } else {
                return f_cb(null);
            }
        });
    },
    add_member_to_document: function (connected_db, first, data, f_cb, s_cb) {
        var second = {};
        second["$addToSet"] = {};
        second["$addToSet"]["subscribers"] = data.blog_id;
        second["$addToSet"]["members"] = data.blog_id;
        connected_db.collection(data.collection_name).update(
            first, second, {multi: true},
            function(err, res) {
                if (err === null) {
                    return s_cb(null);
                } else {
                    return f_cb(null);
                }
            });
    },
    remove_member_from_document: function (connected_db, first, data, f_cb, s_cb) {
        var second = {};
        second["$pull"] = {};
        second["$pull"]["members"] = data.blog_id;
        connected_db.collection(data.collection_name).update(
            first, second, {multi: true},
            function(err, res) {
                if (err === null) {
                    return s_cb(null);
                } else {
                    return f_cb(null);
                }
            });
    },
    accept_invitation: function (connected_db, source_user, user, data, f_cb, s_cb) {
        var self = this
            , input = {}
            , first = {}
            , second = {};
        if (data.type === "agenda") {
            first["$or"] = [];
            first["$or"].push({
                type: "agenda"
                , _id: data._id
            });
            first["$or"].push({
                agenda_id: data._id
            });
            second.collection_name = "articles";
            second.blog_id = user.blog_id;
        } else if (
            data.type === "hire_me" ||
            data.type === "apply_now"
        ) {
            first["type"] = data.type;
            first["_id"] = data._id;
            second.collection_name = "employment";
            second.blog_id = user.blog_id;
        } else {
            return f_cb(null);
        }
        /* Add member */
        self.add_member_to_document(connected_db, first, second, f_cb, function (nothing) {
            /* Remove invitation_request notification */
            self.remove_invitation(connected_db, source_user, user, data, s_cb, function (nothing) {
                /* Add invitation_accept notification */
                input.type = "invitation_accept";
                input.link = data.link;
                input.blog_id = user.blog_id;
                input["info"] = {};
                input["info"]["users"] = [];
                input["info"]["users"].push({
                    blog_id: source_user.blog_id
                    , name: source_user.name
                    , img: source_user.img
                });
                input["info"]["users"].push({
                    blog_id: user.blog_id
                    , name: user.name
                    , img: user.img
                });
                input["info"]["type"] = data.type; /* agenda || hire_me || apply_now */
                input["info"]["_id"] = data._id;
                input["info"]["title"] = data.title;
                input["info"]["img"] = user.img;
                input.subscribers = [];
                input.subscribers.push(source_user.blog_id);
                return self.insert_notification(connected_db, input, s_cb, s_cb);
            });
        });
    },
    remove_accepted_invitation: function (connected_db, source_user_blog_id, user, data, f_cb, s_cb) {
        var self = this
            , input = {}
            , first = {}
            , second = {};
        input.type = "invitation_accept";
        input.link = data.link;
        input.blog_id = user.blog_id;
        input.subscribers = source_user_blog_id;
        /* Remove invitation_accept notification */
        connected_db.collection('notifications').remove(input, function (err, result) {
            if (err === null) {
                /* Remove member */
                if (data.type === "agenda") {
                    first["$or"] = [];
                    first["$or"].push({
                        type: "agenda"
                        , _id: data._id
                    });
                    first["$or"].push({
                        agenda_id: data._id
                    });
                    second.collection_name = "articles";
                    second.blog_id = user.blog_id;
                } else if (
                    data.type === "hire_me" ||
                    data.type === "apply_now"
                ) {
                    first["type"] = data.type;
                    first["_id"] = data._id;
                    second.collection_name = "employment";
                    second.blog_id = user.blog_id;
                } else {
                    return f_cb(null);
                }
                self.remove_member_from_document(connected_db, first, second, f_cb, s_cb);
            } else {
                return f_cb(null);
            }
        });
    },
    get_invitations: function (connected_db, data, f_cb, s_cb) {
        var first = {}
            , second
            , sort
            , type = data.type;

        first.type = "invitation_request";
        if (type === "received") {
            first.subscribers = data.blog_id;
        } else {
            first.blog_id = data.blog_id;
        }
        first['is_removed'] = false;
        if (data.created_at !== undefined) {
            first['created_at'] = {};
            first['created_at']['$lt'] = data.created_at;
        }
        second = {is_removed:0, subscribers:0};
        sort = { created_at: -1 };
        connected_db.collection('notifications').find(first, second).sort(sort).limit(limit.notifications).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return s_cb([]);
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },

    insert_transaction: function (connected_db, data, f_cb, s_cb) {
        var first = {}
            , created_obj
            , now = new Date().valueOf();

        first["_id"] = randomstring.generate() + now;
        first["type"] = data.type;
        first["source"] = data.source;
        first["target"] = data.target;
        first["status"] = "init";
        first["info"] = data.info;
        first["created_at"] = now;
        first["updated_at"] = now;
        created_obj = first;

        connected_db.collection('transactions').insertOne(first, function (err, res) {
            if (err === null) {
                return s_cb(created_obj);
            } else {
                return f_cb(null);
            }
        });
    },

    update_transaction: function (connected_db, first, second, f_cb, s_cb) {
        var now = new Date().valueOf();
        second["$set"]["updated_at"] = now;
        connected_db.collection('transactions').updateOne(
            first, second,
            function(err, res) {
                if (err === null) {
                    return s_cb(null);
                } else {
                    return f_cb(null);
                }
            });
    },
    remove_transaction: function (connected_db, data, f_cb, s_cb) {
        connected_db.collection('transactions').remove(data, function (err, result) {
            if (err === null) {
                return s_cb(null);
            } else {
                return f_cb(null);
            }
        });
    },
    get_single_transaction: function (connected_db, data, f_cb, s_cb) {
        connected_db.collection('transactions').findOne(data, {}, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    return s_cb(doc);
                }
            }
        });
    },

    complete_friend_accept_transaction: function (connected_db, doc, f_cb, s_cb) {
        var self = this
            , data = {}
            , second = {}
            , _id = doc._id
            , source_user = doc.info.users[0]
            , user = doc.info.users[1];
        /* Complete Transaction */
        if (doc.status === "done") {
            return s_cb(null);
        } else if (doc.status === "init") {
            /* Add user.blog_id to source_user's friends */
            self.add_friend_to_user(connected_db, source_user.blog_id, user.blog_id, f_cb, function (nothing) {
                second["$set"] = {};
                second["$set"]["status"] = "source_done";
                self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                    /* Add source_user.blog_id to user's friends */
                    self.add_friend_to_user(connected_db, user.blog_id, source_user.blog_id, f_cb, function (nothing) {
                        second["$set"] = {};
                        second["$set"]["status"] = "target_done";
                        self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                            /* Remove Friend Request Notifications */
                            self.remove_add_friend(connected_db, source_user, user, f_cb, function (nothing) {
                                second["$set"] = {};
                                second["$set"]["status"] = "removing_done";
                                self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                                    /* Add Friend Accept Notification */
                                    data = {};
                                    data["type"] = "friend_accept";
                                    data["blog_id"] = source_user.blog_id;
                                    data["subscribers"] = [];
                                    data["subscribers"].push(source_user.blog_id);
                                    data["subscribers"].push(user.blog_id);
                                    data["info"] = {};
                                    data["info"]["users"] = [];
                                    data["info"]["users"].push({
                                        blog_id: source_user.blog_id
                                        , name: source_user.name
                                        , img: source_user.img
                                    });
                                    data["info"]["users"].push({
                                        blog_id: user.blog_id
                                        , name: user.name
                                        , img: user.img
                                    });
                                    self.insert_notification(connected_db, data, f_cb, function (nothing) {
                                        /* Update transaction to Done! */
                                        second["$set"] = {};
                                        second["$set"]["status"] = "done";
                                        self.update_transaction(connected_db, {_id: _id}, second, f_cb, s_cb);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        } else if (doc.status === "source_done") {
            /* Add source_user.blog_id to user's friends */
            self.add_friend_to_user(connected_db, user.blog_id, source_user.blog_id, f_cb, function (nothing) {
                second["$set"] = {};
                second["$set"]["status"] = "target_done";
                self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                    /* Remove Friend Request Notifications */
                    self.remove_add_friend(connected_db, source_user, user, f_cb, function (nothing) {
                        second["$set"] = {};
                        second["$set"]["status"] = "removing_done";
                        self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                            /* Add Friend Accept Notification */
                            data = {};
                            data["type"] = "friend_accept";
                            data["blog_id"] = source_user.blog_id;
                            data["subscribers"] = [];
                            data["subscribers"].push(source_user.blog_id);
                            data["subscribers"].push(user.blog_id);
                            data["info"] = {};
                            data["info"]["users"] = [];
                            data["info"]["users"].push({
                                blog_id: source_user.blog_id
                                , name: source_user.name
                                , img: source_user.img
                            });
                            data["info"]["users"].push({
                                blog_id: user.blog_id
                                , name: user.name
                                , img: user.img
                            });
                            self.insert_notification(connected_db, data, f_cb, function (nothing) {
                                /* Update transaction to Done! */
                                second["$set"] = {};
                                second["$set"]["status"] = "done";
                                self.update_transaction(connected_db, {_id: _id}, second, f_cb, s_cb);
                            });
                        });
                    });
                });
            });
        } else if (doc.status === "target_done") {
            /* Remove Friend Request Notifications */
            self.remove_add_friend(connected_db, source_user, user, f_cb, function (nothing) {
                second["$set"] = {};
                second["$set"]["status"] = "removing_done";
                self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                    /* Add Friend Accept Notification */
                    data = {};
                    data["type"] = "friend_accept";
                    data["blog_id"] = source_user.blog_id;
                    data["subscribers"] = [];
                    data["subscribers"].push(source_user.blog_id);
                    data["subscribers"].push(user.blog_id);
                    data["info"] = {};
                    data["info"]["users"] = [];
                    data["info"]["users"].push({
                        blog_id: source_user.blog_id
                        , name: source_user.name
                        , img: source_user.img
                    });
                    data["info"]["users"].push({
                        blog_id: user.blog_id
                        , name: user.name
                        , img: user.img
                    });
                    self.insert_notification(connected_db, data, f_cb, function (nothing) {
                        /* Update transaction to Done! */
                        second["$set"] = {};
                        second["$set"]["status"] = "done";
                        self.update_transaction(connected_db, {_id: _id}, second, f_cb, s_cb);
                    });
                });
            });
        } else if (doc.status === "removing_done") {
            /* Check Friend Accept Notification Exists */
            self.get_single_notification(connected_db, {
                type: "friend_accept"
                , subscribers: source_user.blog_id
                , subscribers: user.blog_id
            }, function (nothing) {
                /* When Friend Accept Notification doesn't exist */
                /* Add Friend Accept Notification */
                data = {};
                data["type"] = "friend_accept";
                data["blog_id"] = source_user.blog_id;
                data["subscribers"] = [];
                data["subscribers"].push(source_user.blog_id);
                data["subscribers"].push(user.blog_id);
                data["info"] = {};
                data["info"]["users"] = [];
                data["info"]["users"].push({
                    blog_id: source_user.blog_id
                    , name: source_user.name
                    , img: source_user.img
                });
                data["info"]["users"].push({
                    blog_id: user.blog_id
                    , name: user.name
                    , img: user.img
                });
                self.insert_notification(connected_db, data, f_cb, function (nothing) {
                    /* Update transaction to Done! */
                    second["$set"] = {};
                    second["$set"]["status"] = "done";
                    self.update_transaction(connected_db, {_id: _id}, second, f_cb, s_cb);
                });
            }, function (nothing) {
                /* When Friend Accept Notification exists */
                /* Update transaction to Done! */
                second["$set"] = {};
                second["$set"]["status"] = "done";
                self.update_transaction(connected_db, {_id: _id}, second, f_cb, s_cb);
            });
        } else {
            return f_cb(null);
        }
    },

    complete_friend_remove_transaction: function (connected_db, doc, f_cb, s_cb) {
        var self = this
            , second = {}
            , _id = doc._id
            , user = doc.info.users[0]
            , target_user = doc.info.users[1];

        if (doc.status === "done") {
            return s_cb(null);
        } else if (doc.status === "init") {
            /* Pull target_user.blog_id from user's friends */
            self.remove_friend_from_user(connected_db, user.blog_id, target_user.blog_id, f_cb, function (nothing) {
                second["$set"] = {};
                second["$set"]["status"] = "source_done";
                self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                    /* Pull user.blog_id to target_user's friends */
                    self.remove_friend_from_user(connected_db, target_user.blog_id, user.blog_id, f_cb, function (nothing) {
                        second["$set"] = {};
                        second["$set"]["status"] = "target_done";
                        self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                            /* Remove Friend Request Notifications */
                            self.remove_add_friend(connected_db, user, target_user, f_cb, function (nothing) {
                                second["$set"] = {};
                                second["$set"]["status"] = "done";
                                self.update_transaction(connected_db, {_id: _id}, second, f_cb, s_cb);
                            });
                        });
                    });
                });
            });
        } else if (doc.status === "source_done") {
            /* Pull user.blog_id to target_user's friends */
            self.remove_friend_from_user(connected_db, target_user.blog_id, user.blog_id, f_cb, function (nothing) {
                second["$set"] = {};
                second["$set"]["status"] = "target_done";
                self.update_transaction(connected_db, {_id: _id}, second, f_cb, function (nothing) {
                    /* Remove Friend Request Notifications */
                    self.remove_add_friend(connected_db, user, target_user, f_cb, function (nothing) {
                        second["$set"] = {};
                        second["$set"]["status"] = "done";
                        self.update_transaction(connected_db, {_id: _id}, second, f_cb, s_cb);
                    });
                });
            });
        } else if (doc.status === "target_done") {
            /* Remove Friend Request Notifications */
            self.remove_add_friend(connected_db, user, target_user, f_cb, function (nothing) {
                second["$set"] = {};
                second["$set"]["status"] = "done";
                self.update_transaction(connected_db, {_id: _id}, second, f_cb, s_cb);
            });
        } else {
            return f_cb(null);
        }
    },

    complete_register_transaction: function (connected_db, doc, f_cb, s_cb) {
        var self = this
            , second = {}
            , _id = doc._id
            , lang =  doc.info.lang
            , type =  doc.info.type
            , email =  doc.info.email
            , password =  doc.info.password
            , name =  doc.info.name
            , token =  doc.info.token;

        if (doc.status === "done") {
            self.remove_transaction(connected_db, {_id: _id}, f_cb, s_cb);
        } else if (doc.status === "init") {
            methods.check_email(connected_db, type, email, function () { /* When server error occurs */
                return f_cb(null);
            }, function () { /* When register exists.. */
                self.update_transaction(connected_db, {_id: _id}, { "$set": { "status": "register_done" } }, f_cb, function (nothing) {
                    self.send_email(connected_db, lang, type, email, "", token, f_cb, function (nothing) {
                        self.remove_transaction(connected_db, {_id: _id}, f_cb, s_cb);
                    });
                });
            }, function () {
                self.register_gleant(connected_db, "", email, password, token, f_cb, function () {
                    self.update_transaction(connected_db, {_id: _id}, { "$set": { "status": "register_done" } }, function (nothing) {}, function (nothing) {
                        self.send_email(connected_db, lang, type, email, "", token, f_cb, function (nothing) {
                            self.remove_transaction(connected_db, {_id: _id}, f_cb, s_cb);
                        });
                    });
                });
            });
        } else if (doc.status === "register_done") {
            self.send_email(connected_db, lang, type, email, "", token, f_cb, function (nothing) {
                self.remove_transaction(connected_db, {_id: _id}, f_cb, s_cb);
            });
        } else {
            return f_cb(null);
        }
    },
    complete_forgot_password_transaction: function (connected_db, doc, f_cb, s_cb) {
        var self = this
            , second = {}
            , _id = doc._id
            , lang =  doc.info.lang
            , type =  doc.info.type
            , email =  doc.info.email
            , name =  doc.info.name
            , token =  doc.info.token;

        if (doc.status === "done") {
            return s_cb(null);
        } else if (doc.status === "init") {
            self.update_token(connected_db, email, token, function () {
                return f_cb(null);
            }, function () {
                self.update_transaction(connected_db, {_id: _id}, { "$set": { "status": "token_done" } }, f_cb, function (nothing) {
                    self.send_email(connected_db, lang, type, email, name, token, f_cb, function () {
                        self.update_transaction(connected_db, {_id: _id}, { "$set": { "status": "done" }, "$inc": { "source": 1 } }, f_cb, s_cb);
                    });
                });
            });
        } else if (doc.status === "token_done") {
            self.send_email(connected_db, lang, type, email, name, token, f_cb, function () {
                self.update_transaction(connected_db, {_id: _id}, { "$set": { "status": "done" }, "$inc": { "source": 1 } }, f_cb, s_cb);
            });
        } else {
            return f_cb(null);
        }
    },

    /* Return undone transaction which is passed more than 1hour. */
    /* f_cb - Holidays, s_cb - Keep going to call this method from parent! */
    get_single_undone_transaction: function (connected_db, f_cb, s_cb) {
        var first = {}
            , one_hour_before = new Date()
            , self = this
            , doc;
        one_hour_before.setHours(one_hour_before.getHours() - 1);
        one_hour_before = one_hour_before.valueOf();

        first["status"] = { $ne: "done"};
        first['updated_at'] = {};
        first['updated_at']['$lt'] = one_hour_before;

        connected_db.collection('transactions').find(first, {}).sort({updated_at:1}).limit(1).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return f_cb(null);
                } else {
                    doc = docs[0];
                    if (doc.type === "friend_accept") {
                        return self.complete_friend_accept_transaction(connected_db, doc, s_cb, s_cb);
                    } else if (doc.type === "friend_remove") {
                        return self.complete_friend_remove_transaction(connected_db, doc, s_cb, s_cb);
                    } else {
                        return s_cb(doc);
                    }
                }
            } else {
                return f_cb(null);
            }
        });
    },

    insert_announcement: function (connected_db, data, user, f_cb, s_cb) {
        var temp = new Date()
            , date1 = temp.valueOf()
            , first = {}
            , created_obj;

        first["_id"] = user["blog_id"] + date1 + randomstring.generate(6);
        first["documents"] = data.documents;
        first["send_notification"] = data.send_notification;
        first["is_removed"] = false;
        first["created_at"] = date1;
        first["updated_at"] = date1;
        created_obj = first;
        connected_db.collection('announcements').insertOne(first, function (err, res) {
            if (err === null) {
                return s_cb(created_obj);
            } else {
                return f_cb(null);
            }
        });
    },
    get_announcements: function (connected_db, data, f_cb, s_cb) {
        var first = {}
            , second = {is_removed:0}
            , sort = { updated_at: -1 };

        if (data.created_at !== undefined) {
            first['created_at'] = {};
            first['created_at']['$lt'] = data.created_at;
        }
        first['is_removed'] = false;

        connected_db.collection('announcements').find(first, second).sort(sort).limit(limit.announcements).toArray(function(err, docs) {
            if (err === null && docs !== null) {
                if (docs.length === 0) {
                    return s_cb([]);
                } else {
                    return s_cb(docs);
                }
            } else {
                return f_cb(null);
            }
        });
    },
    get_single_announcement: function (connected_db, data, f_cb, s_cb) {
        var first = {}
            , second = {is_removed:0};
        first["_id"] = data["_id"];
        first["is_removed"] = false;

        connected_db.collection('announcements').findOne(first, second, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    return f_cb(null);
                } else {
                    return s_cb(doc);
                }
            }
        });
    },

    /**
     * 신고
     * @param connected_db
     * @param first {Object} - 처음에 찾고자 하는 게시물 정보
     * @param first.blog_id {string} - 신고하고자 하는 게시물 작성자 blog_id
     * @param first.db_id {string} - 신고하고자 하는 게시물 _id
     * @param first.type {string} - 'agenda' || 'opinion' || 'blog' || 'gallery' || 'comment' || 'message'
     * @param reporting_data - $push 하고자 하는 신고 내용
     * @param reporting_data.blog_id - 신고하는 사용자 blog_id
     * @param reporting_data.content - 신고 내용
     * @param f_cb
     * @param s_cb
     */
    insert_report: function ( connected_db, first, reporting_data, f_cb, s_cb ) {
        var second = {}
            , date = new Date().valueOf(); // created_at, updated_at과 second.created_at 으로 사용.
        /* 1. 신고하는 게시물 존재여부 확인 */
        reporting_data.created_at = date;
        second['$set'] = {};
        second['$set']['updated_at'] = date;
        second['$push'] = {};
        second['$push']['content_list'] = {};
        second['$push']['content_list']['$each'] = [];
        second['$push']['content_list']['$each'].push(reporting_data);
        second['$push']['content_list']['$sort'] = {};
        second['$push']['content_list']['$sort']['created_at'] = 1;

        connected_db.collection('reports').findOne(first, function(err, doc) {
            if (err) {
                return f_cb(null);
            } else {
                if (doc === null) {
                    /* 게시물 없기 때문에 삽입 */
                    first.content_list = [];
                    first.content_list.push(reporting_data);
                    first.created_at = date;
                    first.updated_at = date;
                    connected_db.collection('reports').insertOne(first, function (err, res) {
                        if (err === null) {
                            return s_cb(null);
                        } else {
                            return f_cb(null);
                        }
                    });
                } else {
                    /* 게시물 존재하기 때문에 second $push */
                    connected_db.collection('reports').updateOne(
                        first,
                        second,
                        function(err, res) {
                            if (err === null) {
                                return s_cb(null);
                            } else {
                                return f_cb(null);
                            }
                        });
                }
            }
        });
    },
    track_user_agent: function (connected_db, user_id, secret_id, url, method, device, country, ip) {
        var first = {};
        first.user_id = user_id;
        first.secret_id = secret_id;
        first.url = url;
        first.method = method;
        first.device = device;
        first.country = country;
        first.ip = ip;
        first.created_at = new Date();
        connected_db.collection('track').insertOne(first, function (err, res) {});
    },
};