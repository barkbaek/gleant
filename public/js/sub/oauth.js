var facebook = {};
var kakaostory = {};
var kakao = {};
var twitter = {};
var share = {};
share["link"] = "";
share["title"] = "";
share["description"] = "";
$(document).ready(function() {
    var lang = $("body").attr("data-lang");
    if (lang === undefined) {
        lang = "en";
    }
    var facebook_app_id;
    if (location.hostname === "localhost") {
        facebook_app_id = '1724954197533489';
    } else {
        facebook_app_id = '1363169447133362';
    }
    window.fbAsyncInit = function() {
        FB.init({
            appId      : facebook_app_id,
            xfbml      : true,
            version    : 'v2.8'
        });
        facebook["share"] = function (e) {
            var link = share["link"];
            var title = share["title"];
            var description = share["description"];
            FB.ui({
                method: 'feed',
                link: link,
                caption: "Gleant",
                description: description,
                name: title,
                picture: aws_s3_url + "/icons/logo.png"
            }, function(response){
                if (response) {
                    var post_id = response.post_id;
                }
            });
            return false;
        };
        $(document).on("click", ".prompt#share-prompt .btn-facebook-share", function(e) {
            e.preventDefault();
            facebook.share(e);
            return false;
        });
        facebook["go"] = function (type) {
            if (FB === undefined){
                return false;
            }
            var login_with_facebook = function (access_token) {
                FB.api('/me', 'get', { fields: 'name,email' }, function(response) {
                    var oauth_id = encodeURIComponent(FB.getUserID());
                    var name = encodeURIComponent(response.name);
                    var email = encodeURIComponent(response.email);
                    FB.api("/me/picture?width=180&height=180",  function(response) {
                        var img = encodeURIComponent(response.data.url);
                        access_token = encodeURIComponent(access_token);
                        var s_cb = function (result) {
                            if ( result['response'] === true ) {
                                if (type === "login") {
                                    window.location = "/";
                                } else {
                                    window.location = "/set/blog-id";
                                }
                            } else {
                                if (result["msg"] === "no_register") {
                                    return window.location = "/register";
                                } else if (result["msg"] === "no_blog_id") {
                                    return window.location = "/set/blog-id";
                                } else if (result["msg"] === "server_error") {
                                    show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                                } else {
                                    show_bert("danger", 4000, "Facebook " + i18n[lang].login_failed + " " + i18n[lang].please_try_again);
                                }
                            }
                        };
                        var f_cb = function () { show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
                        methods["the_world"]["is_one"]({
                            show_animation: true,
                            data:{
                                oauth_id:oauth_id,
                                name:name,
                                img:img,
                                email:email,
                                access_token:access_token
                            },
                            pathname:"/" + type + "/facebook",
                            s_cb:s_cb,
                            f_cb:f_cb
                        });
                    });
                });
            };
            var oauth_id = FB.getUserID();
            if (oauth_id) {
                FB.logout();
            }
            FB.login(function(response) {
                if (response.authResponse) {
                    login_with_facebook(response.authResponse.accessToken);
                } else {
                    show_bert("danger", 3000, "Facebook " + i18n[lang].login_has_been_canceled);
                }
            }, {scope: 'email'});
        };
        $(document).on("click", "#login #login-facebook", function (e){
            e.preventDefault();
            facebook.go("login");
            return false;
        });
    };
    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/ko_KR/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    kakaostory["share"] = function (e) {
        e.preventDefault();
        var link = share["link"];
        var title = share["title"];
        var description = share["description"];

        if (is_mobile() === true) {
            Kakao.Story.open({
                url: link,
                text: title + "\n" + description,
                urlInfo: {
                    title: title,
                    desc: description,
                    name: 'Gleant',
                    images: [(aws_s3_url + '/icons/logo.png')]
                }
            });
        } else {
            Kakao.Story.share({
                url: link,
                text: title + "\n" + description
            });
        }
        return false;
    };
    $(document).on("click", ".prompt#share-prompt .btn-kakaostory-share", function(e) {
        kakaostory.share(e);
        return false;
    });
    kakao["init"] = function () {
        if (location.hostname === "localhost") {
            Kakao.init('567f33003477a838cb2dfb55a19047d2');
        } else {
            Kakao.init('959a0c9acc6e4cbbf03a84f50d501d82');
        }
    };
    kakao.init();
    kakao["go"] = function (type) {
        Kakao.Auth.logout();
        Kakao.Auth.login({
            success: function (auth_obj) {
                var access_token = encodeURIComponent(auth_obj.access_token);
                Kakao.Auth.getStatus(function (auth_obj) {
                    if (auth_obj.status === "connected") {
                        var oauth_id = encodeURIComponent(auth_obj.user.id)
                            , email = ""
                            , name = ""
                            , img = "";
                        if (auth_obj.user.kaccount_email && auth_obj.user.kaccount_email_verified === true) {
                            email = auth_obj.user.kaccount_email;
                        }
                        if (auth_obj.user.properties) {
                            if (auth_obj.user.properties.nickname) {
                                name = encodeURIComponent(auth_obj.user.properties.nickname);
                            }

                            if (auth_obj.user.properties.profile_image) {
                                img = encodeURIComponent(auth_obj.user.properties.profile_image);
                            }
                        }
                        var s_cb = function (result) {
                            if ( result['response'] === true ) {
                                if (type === "login") {
                                    window.location = "/";
                                } else {
                                    window.location = "/set/blog-id";
                                }
                            } else {
                                if (result["msg"] === "no_register") {
                                    return window.location = "/register";
                                } else if (result["msg"] === "no_blog_id") {
                                    return window.location = "/set/blog-id";
                                } else if (result["msg"] === "server_error") {
                                    show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);
                                } else {
                                    show_bert("danger", 4000, "Kakao " + i18n[lang].login_failed + " " + i18n[lang].please_try_again);
                                }
                            }
                        };
                        var f_cb = function () {show_bert("danger", 4000, i18n[lang].internal_server_error_has_occurred + " " + i18n[lang].please_try_again);};
                        methods["the_world"]["is_one"]({
                            show_animation: true,
                            data:{
                                oauth_id:oauth_id,
                                email:email,
                                name:name,
                                img:img,
                                access_token:access_token
                            },
                            pathname:"/" + type + "/kakao",
                            s_cb:s_cb,
                            f_cb:f_cb
                        });
                    } else {
                        show_bert("danger", 4000, "[Kakao Talk] " + i18n[lang].login_failed + " " + i18n[lang].please_try_again);
                    }
                });
            },
            fail: function (errorObj) {
            },
            always: function (obj) {
            },
            persistAccessToken: true,
            persistRefreshToken: false,
            throughTalk: false
        });
    };
    kakao["share"] = function (e) {
        var link = share["link"];
        var title = share["title"];
        var description = share["description"];
        Kakao.Link.sendTalkLink({
            label: title,
            image: {
                src: aws_s3_url + '/icons/logo.png',
                width: '180',
                height: '180'
            },
            webButton: {
                text: "Gleant",
                url: link
            },
            webLink: {
                text: "Gleant",
                url: link
            }
        });
    };
    $(document).on("click", ".prompt#share-prompt .btn-kakaotalk-share", function(e) {
        e.preventDefault();
        kakao.share(e);
        return false;
    });
    $(document).on('click', '.prompt#share-prompt .close', function (e) {
        e.preventDefault();
        modal(".prompt#share-prompt", "close");
        if (is_translation_prompt_opened === true) {
            modal(".prompt#translation-prompt", "open");
        } else {
            if (is_opinion_prompt_parent === true) {
                if (is_agenda_prompt_opened === true) {
                    modal(".prompt#agenda-prompt", "open");
                } else {
                    if (is_opinion_prompt_opened === true) {
                        modal(".prompt#opinion-prompt", "open");
                    }
                }
            } else {
                if (is_opinion_prompt_opened === true) {
                    modal(".prompt#opinion-prompt", "open");
                } else {
                    if (is_agenda_prompt_opened === true) {
                        modal(".prompt#agenda-prompt", "open");
                    }
                }
            }
            if (is_apply_now_prompt_opened === true) {
                modal('.prompt#apply-now-prompt', 'open');
            }
            if (is_hire_me_prompt_opened === true) {
                modal('.prompt#hire-me-prompt', 'open');
            }
        }
        return false;
    });
    var clipboard = new Clipboard('#btn-copy-link');
    clipboard.on('success', function(e) {
        show_bert("success", 2000, i18n[lang].copied_to_clipboard);
    });
    var copy_blog_address = new Clipboard('#copy-blog-address');
    copy_blog_address.on('success', function(e) {
        show_bert("success", 2000, i18n[lang].copied_to_clipboard);
    });
    var copy_article_address = new Clipboard('.copy-article-address');
    copy_article_address.on('success', function(e) {
        show_bert("success", 2000, i18n[lang].copied_to_clipboard);
    });
    $(document).on('click', ".btn-share-mobile", function (e) {
        e.preventDefault();
        var written = $(e.currentTarget).parent().parent().parent().parent();
        share["link"] = window.location.protocol + "//" + window.location.hostname + (window.location.port === "" ? "" : ":" + window.location.port) + written.attr("data-link");
        share["title"] = written.find(".written-title").text();
        share["description"] =  written.find(".written-content").text();
        $("#text-copy-link").text(share["link"]);
        if ((typeof is_agenda_prompt_opened !== 'undefined') && (is_agenda_prompt_opened === true)) {
            modal(".prompt#agenda-prompt", "close");
        }
        if ((typeof is_opinion_prompt_opened !== 'undefined') && (is_opinion_prompt_opened === true)) {
            modal(".prompt#opinion-prompt", "close");
        }
        if ((typeof is_translation_prompt_opened !== 'undefined') && (is_translation_prompt_opened === true)) {
            modal(".prompt#translation-prompt", "close");
        }
        if (is_apply_now_prompt_opened === true) {
            modal('.prompt#apply-now-prompt', 'close');
        }
        if (is_hire_me_prompt_opened === true) {
            modal('.prompt#hire-me-prompt', 'close');
        }
        modal(".prompt#share-prompt", "open");
        $('.btn-ellipsis-mobile ul').css('display', 'none');
        $("#btn-copy-link").attr("data-clipboard-text", share["link"]);
        return false;
    });
    $(document).on('click', ".btn-share-desktop", function (e) {
        e.preventDefault();
        var written = $(e.currentTarget).parent().parent();
        share["link"] = window.location.protocol + "//" + window.location.hostname + (window.location.port === "" ? "" : ":" + window.location.port) + written.attr("data-link");
        share["title"] = written.find(".written-title").text();
        share["description"] =  written.find(".written-content").text();
        $("#text-copy-link").text(share["link"]);
        if ((typeof is_agenda_prompt_opened !== 'undefined') && (is_agenda_prompt_opened === true)) {
            modal(".prompt#agenda-prompt", "close");
        }
        if ((typeof is_opinion_prompt_opened !== 'undefined') && (is_opinion_prompt_opened === true)) {
            modal(".prompt#opinion-prompt", "close");
        }
        if ((typeof is_translation_prompt_opened !== 'undefined') && (is_translation_prompt_opened === true)) {
            modal(".prompt#translation-prompt", "close");
        }
        if (is_apply_now_prompt_opened === true) {
            modal('.prompt#apply-now-prompt', 'close');
        }
        if (is_hire_me_prompt_opened === true) {
            modal('.prompt#hire-me-prompt', 'close');
        }
        modal(".prompt#share-prompt", "open");
        $('.btn-ellipsis-mobile ul').css('display', 'none');
        $("#btn-copy-link").attr("data-clipboard-text", share["link"]);
        return false;
    });
    $(document).on('click', ".btn-ellipsis-mobile", function (e) {
        e.preventDefault();
        var display = $(e.currentTarget).find('ul').css('display');
        if (display === "none") {
            $(e.currentTarget).find('ul').css('display', 'block');
        } else {
            $(e.currentTarget).find('ul').css('display', 'none');
        }
        return false;
    });
    twitter["share"] = function (e) {
        e.preventDefault();
        var link = share["link"];
        var title = share["title"];
        var description = share["description"];
        var str = "https://twitter.com/intent/tweet?url=" + link + "&text=";
        var link_length = link.length;
        var text_length = 140 - link_length;
        var text = title;
        text = text.slice(0, text_length);
        text = encodeURIComponent(text);
        str = str + text;
        window.open(str, '', 'menubar=no, toolbar=no,resizable=yes,scrollbars=yes,height=450,width=450');
        return false;
    };
    $(document).on("click", ".prompt#share-prompt .btn-twitter-share", function(e) {
        e.preventDefault();
        twitter.share(e);
        return false;
    });
});