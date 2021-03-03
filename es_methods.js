const methods = require('./methods');
const limit = require('./limit').get_all();

function get_search_user_query (obj) {
    var query;
    if (obj.is_loginned === true) {
        query = {
            "bool": {
                "should": [
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "term": {
                                        "name": {
                                            "boost": 3,
                                            "value": obj.query
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 2
                                    }
                                },
                                {
                                    "term": {
                                        "name": {
                                            "boost": 3,
                                            "value": obj.query
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "term": {
                                        "blog_id": obj.query
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 2
                                    }
                                },
                                {
                                    "term": {
                                        "blog_id": obj.query
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "term": {
                                        "blog_name": obj.query
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 2
                                    }
                                },
                                {
                                    "term": {
                                        "blog_name": obj.query
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        };
    } else {
        query = {
            "bool": {
                "should": [
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "term": {
                                        "name": {
                                            "boost": 3,
                                            "value": obj.query
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "term": {
                                        "blog_id": obj.query
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "term": {
                                        "blog_name": obj.query
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        };
    }
    if (obj.excluders && obj.excluders.length > 0) {
        query.bool["must_not"] = [];
        query.bool["must_not"].push({
            terms: {
                blog_id: obj.excluders
            }
        });
    }
    return {
        "from": obj.from,
        "size": obj.size,
        "_source": ["name", "birth_year", "birth_month", "birth_day", "sex", "iq", "eq", "blog_id", "blog_name", "img", "verified_profile", "simple_career", "employment", "education", "prize", "location", "website", "main_language", "available_languages"],
        "sort": [
            { weighting: { order: "desc" } },
            { updated_at: { order: "desc" } }
        ],
        "query": query,
        "highlight": {
            "no_match_size": 100,
            "encoder": "html",
            "fields": {
                "name": {},
                "blog_id": {},
                "blog_name": {}
            }
        }
    };
}
function get_search_news_query (obj) {
    return {
        "from": obj.from,
        "size": obj.size,
        "query": {
            "bool": {
                "should": [
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "tags.keyword": obj.query
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "match": {
                                        "title": {
                                            "query": obj.query
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "match": {
                                        "content": {
                                            "query": obj.query
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        "highlight": {
            "no_match_size": 100,
            "encoder": "html",
            "fields": {
                "tags": {"no_match_size": 0},
                "title": {},
                "content": {}
            }
        }
    };
}
function get_search_debate_query (obj) {
    return {
        "from": obj.from,
        "size": obj.size,
        /* "sort": [
             { created_at: { order: "desc" } }
        ], */
        "query": {
            "bool": {
                "should": [
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "term": {
                                        "tags.keyword": obj.query
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "match": {
                                        "title": {
                                            "query": obj.query
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "match": {
                                        "content": {
                                            "query": obj.query
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        "highlight": {
            "no_match_size": 100,
            "encoder": "html",
            "fields": {
                "tags": {"no_match_size": 0},
                "title": {},
                "content": {}
            }
        }
    };
}
/* For Apply Now */
function get_search_employment_query (obj) {
    return {
        "from": obj.from,
        "size": obj.size,
        /*"sort": [
            { created_at: { order: "desc" } }
        ],*/
        "query": {
            "bool": {
                "should": [
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "term": {
                                        "company": obj.query
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "term": {
                                        "job": obj.query
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "term": {
                                        "country": obj.query
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "term": {
                                        "city": obj.query
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "term": {
                                        "tags.keyword": obj.query
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "match": {
                                        "title": {
                                            "query": obj.query
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "match": {
                                        "content": {
                                            "query": obj.query
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        "highlight": {
            "no_match_size": 100,
            "encoder": "html",
            "fields": {
                "tags": {"no_match_size": 0},
                "title": {},
                "content": {}
            }
        }
    };
}
function get_search_website_query (obj) {
    var wildcard_link = "*" +  obj.query + "*";
    return {
        "from": obj.from,
        "size": obj.size,
        "query": {
            "bool": {
                "should": [
                    {
                        "bool": {
                            "must": [
                                {
                                    "match": {
                                        "title": {
                                            "query": obj.query
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "match": {
                                        "content": {
                                            "query": obj.query
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "wildcard" : {
                                        "link" : wildcard_link
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "tags.keyword": obj.query
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        "highlight": {
            "no_match_size": 100,
            "encoder": "html",
            "fields": {
                "title": {},
                "content": {},
                "link": {}
            }
        }
    };
}
function get_search_blog_query (obj) {
    return {
        "from": obj.from,
        "size": obj.size,
        /*"sort": [
            { created_at: { order: "desc" } }
        ],*/
        "query": {
            "bool": {
                "should": [
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "term": {
                                        "tags.keyword": obj.query
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "match": {
                                        "title": {
                                            "query": obj.query
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "public_authority": 1
                                    }
                                },
                                {
                                    "match": {
                                        "content": {
                                            "query": obj.query
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        "highlight": {
            "no_match_size": 100,
            "encoder": "html",
            "fields": {
                "tags": {"number_of_fragments": 0},
                "title": {},
                "content": {}
            }
        }
    };
}
function get_search_image_query (obj) {
    var query = {
        "bool": {
            "should": [
                {
                    "bool": {
                        "must": [
                            {
                                "term": {
                                    "public_authority": 1
                                }
                            },
                            {
                                "term": {
                                    "tags.keyword": obj.query
                                }
                            }
                        ]
                    }
                },
                {
                    "bool": {
                        "must": [
                            {
                                "term": {
                                    "public_authority": 1
                                }
                            },
                            {
                                "match": {
                                    "title": {
                                        "query": obj.query
                                    }
                                }
                            }
                        ]
                    }
                },
                {
                    "bool": {
                        "must": [
                            {
                                "term": {
                                    "public_authority": 1
                                }
                            },
                            {
                                "match": {
                                    "content": {
                                        "query": obj.query
                                    }
                                }
                            }
                        ]
                    }
                }
            ]
        }
    };
    return {
        "from": obj.from,
        "size": obj.size,
        "query": query
    };
}
module.exports = {
    es_upsert_autocomplete: function (connected_db, es_client, doc) {
        var tag = doc.key;
        var _index = "autocomplete";
        var _type = "tag";
        var obj = methods.get_original_chosung_jamo(tag);
        obj.length = obj.original.length;

        es_client.search({
            index: _index,
            type: _type,
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    original: obj.original
                                }
                            }
                        ]
                    }
                }
            }
        }, function (err, res) {
            if (err) {
                return false;
            } else {
                if (res && res.hits && res.hits.hits) {
                    if (res.hits.hits.length === 0) {
                        es_client.index({
                            index: _index,
                            type: _type,
                            body: obj
                        }, function (err, res) {
                            if (err) {
                                return false;
                            } else {
                                connected_db.collection('keywords').update(
                                    { key: tag },
                                    { $set: {
                                        es_is_updated: true,
                                        es_index: res._index,
                                        es_type: res._type,
                                        es_id: res._id,
                                        es_updated_at: new Date().valueOf()
                                    }},
                                    {multi: true},
                                    function(err, res) {
                                        return false;
                                    });
                            }
                        });
                    } else {
                        connected_db.collection('keywords').update(
                            { key: tag },
                            { $set: {
                                es_is_updated: true,
                                es_index: res.hits.hits[0]._index,
                                es_type: res.hits.hits[0]._type,
                                es_id: res.hits.hits[0]._id,
                                es_updated_at: new Date().valueOf()
                            }},
                            {multi: true},
                            function(err, res) {
                                return false;
                            });
                    }
                } else {
                    return false;
                }
            }
        });
    },
    es_get_autocomplete: function(es_client, text, f_cb, s_cb) {
        var jamo = methods.get_original_chosung_jamo(text).jamo;
        es_client.search({
            index: 'autocomplete',
            type: 'tag',
            body: {
                sort: [
                    { length: { order: "asc" } }
                ],
                query: {
                    bool: {
                        should: [
                            {
                                match: {
                                    chosung: jamo
                                }
                            },
                            {
                                match: {
                                    jamo: jamo
                                }
                            }
                        ]
                    }
                }
            }
        }, function (err, res) {
            var list = [];
            if (err) {
                return f_cb(null);
            } else {
                if (res && res.hits && res.hits.hits) {
                    if (res.hits.hits.length === 0) {
                        return f_cb(null);
                    } else {
                        for (var i = 0; i < res.hits.hits.length; i++) {
                            list.push(res.hits.hits[i]._source.original);
                        }
                        return s_cb(list);
                    }
                } else {
                    return f_cb(null);
                }
            }
        });
    },
    /* All */
    es_search_all: function (es_client, pass_obj, cb) {
        if (pass_obj.query === undefined || pass_obj.query === "") {
            return cb(null);
        }
        /* search home일때의 쿼리 */
        if ( pass_obj.from === undefined || pass_obj.from < 0) {
            pass_obj.from = 0;
        }
        var msearch_body = [];
        /* User */
        msearch_body.push({
            index: "proper_names",
            type: "users"
        });
        msearch_body.push(get_search_user_query(pass_obj));
        /* News */
        msearch_body.push({
            index: ["simplified_chinese", "english", "japanese", "korean"],
            type: "news"
        });
        msearch_body.push(get_search_news_query(pass_obj));
        /* Debate */
        msearch_body.push({
            index: ["korean"],
            type: "agenda,opinion"
        });
        msearch_body.push(get_search_debate_query(pass_obj));
        /* Employment */
        /*msearch_body.push({
            index: ["korean"],
            type: "apply_now"
        });
        msearch_body.push(get_search_employment_query(pass_obj));*/
        /* Website */
        msearch_body.push({
            index: ["simplified_chinese", "english", "japanese", "korean"],
            type: "website"
        });
        msearch_body.push(get_search_website_query(pass_obj));
        /* blog */
        msearch_body.push({
            index: ["simplified_chinese", "english", "japanese", "korean"],
            type: "blog,gallery"
        });
        msearch_body.push(get_search_blog_query(pass_obj));
        /* Image */
        msearch_body.push({
            index: ["simplified_chinese", "english", "japanese", "korean"],
            type: "gallery"
        });
        pass_obj.size = 10;
        msearch_body.push(get_search_image_query(pass_obj));
        es_client.msearch({
                body: msearch_body
            }, function (err, res) {
                if (err) {
                    return cb(null);
                } else {
                    var final = {}
                        , hits
                        , temp
                        , temp_obj;
                    final.user_total = 0;
                    final.news_total = 0;
                    final.debate_total = 0;
                    /*final.employment_total = 0;*/
                    final.website_total = 0;
                    final.blog_total = 0;
                    final.image_total = 0;
                    final.user = [];
                    final.news = [];
                    final.debate = [];
                    /*final.employment = [];*/
                    final.website = [];
                    final.blog = [];
                    final.image = [];
                    /* User */
                    if (res && res.responses[0] && res.responses[0].hits && res.responses[0].hits.hits) {
                        hits = res.responses[0].hits.hits;
                        for (var i = 0; i < hits.length; i++) {
                            temp_obj = hits[i]._source;
                            final.user.push(temp_obj);
                        }
                        final.user_total = res.responses[0].hits.total;
                    }
                    /* News */
                    if (res && res.responses[1] && res.responses[1].hits && res.responses[1].hits.hits) {
                        hits = res.responses[1].hits.hits;
                        for (var i = 0; i < hits.length; i++) {
                            temp_obj =  hits[i]._source;
                            /* Check Highlighted Title */
                            if (hits[i].highlight !== undefined && hits[i].highlight.title !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.title.length; j++) {
                                    temp = temp + hits[i].highlight.title[j];
                                }
                                if (temp !== "") { /* Replace Highlighted Title */
                                    temp_obj.hi_title = temp;
                                }
                            }
                            /* Check Highlighted Content */
                            if (hits[i].highlight !== undefined && hits[i].highlight.content !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.content.length; j++) {
                                    temp = temp + hits[i].highlight.content[j];
                                }
                                if (temp !== "") { /* Replace Highlighted Content */
                                    temp_obj.hi_content = temp;
                                }
                            }
                            final.news.push(temp_obj);
                        }
                        final.news_total = res.responses[1].hits.total;
                    }
                    /* Debate */
                    if (res && res.responses[2] && res.responses[2].hits && res.responses[2].hits.hits) {
                        hits = res.responses[2].hits.hits;
                        for (var i = 0; i < hits.length; i++) {
                            temp_obj =  hits[i]._source;
                            /* Check Highlighted Title */
                            if (hits[i].highlight !== undefined && hits[i].highlight.title !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.title.length; j++) {
                                    temp = temp + hits[i].highlight.title[j];
                                }
                                if (temp !== "") { /* Replace Highlighted Title */
                                    temp_obj.hi_title = temp;
                                }
                            }
                            /* Check Highlighted Content */
                            if (hits[i].highlight !== undefined && hits[i].highlight.content !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.content.length; j++) {
                                    temp = temp + hits[i].highlight.content[j];
                                }
                                if (temp !== "") { /* Replace Highlighted Content */
                                    temp_obj.hi_content = temp;
                                }
                            }
                            final.debate.push(temp_obj);
                        }
                        final.debate_total = res.responses[2].hits.total;
                    }
                    /* Employment */
                    /*if (res && res.responses[3] && res.responses[3].hits && res.responses[3].hits.hits) {
                        hits = res.responses[3].hits.hits;
                        for (var i = 0; i < hits.length; i++) {
                            temp_obj =  hits[i]._source;
                            if (hits[i].highlight !== undefined && hits[i].highlight.title !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.title.length; j++) {
                                    temp = temp + hits[i].highlight.title[j];
                                }
                                if (temp !== "") {
                                    temp_obj.hi_title = temp;
                                }
                            }
                            if (hits[i].highlight !== undefined && hits[i].highlight.content !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.content.length; j++) {
                                    temp = temp + hits[i].highlight.content[j];
                                }
                                if (temp !== "") {
                                    temp_obj.hi_content = temp;
                                }
                            }
                            final.employment.push(temp_obj);
                        }
                        final.employment_total = res.responses[3].hits.total;
                    }*/
                    /* Website */
                    if (res && res.responses[3] && res.responses[3].hits && res.responses[3].hits.hits) {
                        hits = res.responses[3].hits.hits;
                        for (var i = 0; i < hits.length; i++) {
                            temp_obj = hits[i]._source;
                            /* Check Highlighted Title */
                            if (hits[i].highlight !== undefined && hits[i].highlight.title !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.title.length; j++) {
                                    temp = temp + hits[i].highlight.title[j];
                                }
                                if (temp !== "") { /* Replace Highlighted Title */
                                    temp_obj.hi_title = temp;
                                }
                            }
                            /* Check Highlighted Content */
                            if (hits[i].highlight !== undefined && hits[i].highlight.content !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.content.length; j++) {
                                    temp = temp + hits[i].highlight.content[j];
                                }
                                if (temp !== "") { /* Replace Highlighted Content */
                                    temp_obj.hi_content = temp;
                                }
                            }
                            /* Check Highlighted Link */
                            if (hits[i].highlight !== undefined && hits[i].highlight.link !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.link.length; j++) {
                                    temp = temp + hits[i].highlight.link[j];
                                }
                                if (temp !== "") { /* Replace Highlighted Link */
                                    temp_obj.hi_link = temp;
                                }
                            }
                            final.website.push(temp_obj);
                        }
                        final.website_total = res.responses[3].hits.total;
                    }
                    /* blog */
                    if (res && res.responses[4] && res.responses[4].hits && res.responses[4].hits.hits) {
                        hits = res.responses[4].hits.hits;
                        for (var i = 0; i < hits.length; i++) {
                            temp_obj = hits[i]._source;
                            /* Check Highlighted Title */
                            if (hits[i].highlight !== undefined && hits[i].highlight.title !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.title.length; j++) {
                                    temp = temp + hits[i].highlight.title[j];
                                }
                                if (temp !== "") { /* Replace Highlighted Title */
                                    temp_obj.hi_title = temp;
                                }
                            }
                            /* Check Highlighted Content */
                            if (hits[i].highlight !== undefined && hits[i].highlight.content !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.content.length; j++) {
                                    temp = temp + hits[i].highlight.content[j];
                                }
                                if (temp !== "") { /* Replace Highlighted Content */
                                    temp_obj.hi_content = temp;
                                }
                            }
                            final.blog.push(temp_obj);
                        }
                        final.blog_total = res.responses[4].hits.total;
                    }
                    /* Image */
                    if (res && res.responses[5] && res.responses[5].hits && res.responses[5].hits.hits) {
                        hits = res.responses[5].hits.hits;
                        for (var i = 0; i < hits.length; i++) {
                            temp_obj =  hits[i]._source;
                            final.image.push(temp_obj);
                        }
                        final.image_total = res.responses[5].hits.total;
                    }
                    return cb(final);
                }
            });
    },
    /* Search User */
    es_search_user: function (es_client, pass_obj, cb) {
        if (pass_obj.query === undefined || pass_obj.query === "") {
            return cb(null);
        }
        /* search home일때의 쿼리 */
        if ( pass_obj.from === undefined || pass_obj.from < 0) {
            pass_obj.from = 0;
        }
        pass_obj.size = limit.search_user;
        es_client.search({
            index: ["proper_names"],
            type: "users",
            body: get_search_user_query(pass_obj)
        }, function (err, res) {
            var final = {}
                , hits;
            final.user_total = 0;
            final.user = [];
            if (err) {
                return cb(final);
            } else {
                if (res && res.hits && res.hits.hits) {
                    hits = res.hits.hits;
                    if (hits.length === 0) {
                        final.user_total = res.hits.total;
                        return cb(final);
                    } else {
                        for (var i = 0; i < hits.length; i++) {
                            final.user.push(hits[i]._source);
                        }
                        final.user_total = res.hits.total;
                        return cb(final);
                    }
                } else {
                    return cb(final);
                }
            }
        });
    },
    /* Search News */
    es_search_news: function (es_client, pass_obj, cb) {
        if (pass_obj.query === undefined || pass_obj.query === "") {
            return cb(null);
        }
        /* search home 일때의 쿼리 */
        if ( pass_obj.from === undefined || pass_obj.from < 0) {
            pass_obj.from = 0;
        }
        pass_obj.size = limit.search_news;
        es_client.search({
            index: ["simplified_chinese", "english", "japanese", "korean"],
            type: "news",
            body: get_search_news_query(pass_obj)
        }, function (err, res) {
            var final = {}
                , hits
                , temp
                , temp_obj;
            final.news_total = 0;
            final.news = [];
            if (err) {
                return cb(final);
            } else {
                if (res && res.hits && res.hits.hits) {
                    hits = res.hits.hits;
                    if (hits.length === 0) {
                        final.news_total = res.hits.total;
                        return cb(final);
                    } else {
                        for (var i = 0; i < hits.length; i++) {
                            temp_obj = hits[i]._source;
                            /* Highlighted Title */
                            if (hits[i].highlight !== undefined && hits[i].highlight.title !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.title.length; j++) {
                                    temp = temp + hits[i].highlight.title[j];
                                }
                                if (temp !== "") {
                                    temp_obj.hi_title = temp;
                                }
                            }
                            /* Highlighted Content */
                            if (hits[i].highlight !== undefined && hits[i].highlight.content !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.content.length; j++) {
                                    temp = temp + hits[i].highlight.content[j];
                                }
                                if (temp !== "") {
                                    temp_obj.hi_content = temp;
                                }
                            }
                            final.news.push(temp_obj);
                        }
                        final.news_total = res.hits.total;
                        return cb(final);
                    }
                } else {
                    return cb(final);
                }
            }
        });
    },
    /* Search Debate */
    es_search_debate: function (es_client, pass_obj, cb) {
        if (pass_obj.query === undefined || pass_obj.query === "") {
            return cb(null);
        }
        /* search home 일때의 쿼리 */
        if ( pass_obj.from === undefined || pass_obj.from < 0) {
            pass_obj.from = 0;
        }
        pass_obj.size = limit.search_debate;
        es_client.search({
            index: ["korean"],
            type: "agenda,opinion",
            body: get_search_debate_query(pass_obj)
        }, function (err, res) {
            var final = {}
                , hits
                , temp
                , temp_obj;
            final.debate_total = 0;
            final.debate = [];
            if (err) {
                return cb(final);
            } else {
                if (res && res.hits && res.hits.hits) {
                    hits = res.hits.hits;
                    if (hits.length === 0) {
                        final.debate_total = res.hits.total;
                        return cb(final);
                    } else {
                        for (var i = 0; i < hits.length; i++) {
                            temp_obj = hits[i]._source;
                            /* Highlighted Title */
                            if (hits[i].highlight !== undefined && hits[i].highlight.title !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.title.length; j++) {
                                    temp = temp + hits[i].highlight.title[j];
                                }
                                if (temp !== "") {
                                    temp_obj.hi_title = temp;
                                }
                            }
                            /* Highlighted Content */
                            if (hits[i].highlight !== undefined && hits[i].highlight.content !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.content.length; j++) {
                                    temp = temp + hits[i].highlight.content[j];
                                }
                                if (temp !== "") {
                                    temp_obj.hi_content = temp;
                                }
                            }
                            final.debate.push(temp_obj);
                        }
                        final.debate_total = res.hits.total;
                        return cb(final);
                    }
                } else {
                    return cb(final);
                }
            }
        });
    },
    /* Search Employment */
    es_search_employment: function (es_client, pass_obj, cb) {
        if (pass_obj.query === undefined || pass_obj.query === "") {
            return cb(null);
        }
        /* When Search Home */
        if ( pass_obj.from === undefined || pass_obj.from < 0) {
            pass_obj.from = 0;
        }
        pass_obj.size = limit.search_employment;
        es_client.search({
            index: ["korean"],
            type: "apply_now",
            body: get_search_employment_query(pass_obj)
        }, function (err, res) {
            var final = {}
                , hits
                , temp
                , temp_obj;
            final.employment_total = 0;
            final.employment = [];
            if (err) {
                return cb(final);
            } else {
                if (res && res.hits && res.hits.hits) {
                    hits = res.hits.hits;
                    if (hits.length === 0) {
                        final.employment_total = res.hits.total;
                        return cb(final);
                    } else {
                        for (var i = 0; i < hits.length; i++) {
                            temp_obj = hits[i]._source;
                            /* Highlighted Title */
                            if (hits[i].highlight !== undefined && hits[i].highlight.title !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.title.length; j++) {
                                    temp = temp + hits[i].highlight.title[j];
                                }
                                if (temp !== "") {
                                    temp_obj.hi_title = temp;
                                }
                            }
                            /* Highlighted Content */
                            if (hits[i].highlight !== undefined && hits[i].highlight.content !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.content.length; j++) {
                                    temp = temp + hits[i].highlight.content[j];
                                }
                                if (temp !== "") {
                                    temp_obj.hi_content = temp;
                                }
                            }
                            final.employment.push(temp_obj);
                        }
                        final.employment_total = res.hits.total;
                        return cb(final);
                    }
                } else {
                    return cb(final);
                }
            }
        });
    },
    /* Search Website */
    es_search_website: function (es_client, pass_obj, cb) {
        if (pass_obj.query === undefined || pass_obj.query === "") {
            return cb(null);
        }
        /* When Search Home */
        if ( pass_obj.from === undefined || pass_obj.from < 0) {
            pass_obj.from = 0;
        }
        pass_obj.size = limit.search_website;
        es_client.search({
            index: ["simplified_chinese", "english", "japanese", "korean"],
            type: "website",
            body: get_search_website_query(pass_obj)
        }, function (err, res) {
            var final = {}
                , hits
                , temp
                , temp_obj;
            final.website_total = 0;
            final.website = [];
            if (err) {
                return cb(final);
            } else {
                if (res && res.hits && res.hits.hits) {
                    hits = res.hits.hits;
                    if (hits.length === 0) {
                        final.website_total = res.hits.total;
                        return cb(final);
                    } else {
                        for (var i = 0; i < hits.length; i++) {
                            temp_obj = hits[i]._source;
                            /* Highlighted Title */
                            if (hits[i].highlight !== undefined && hits[i].highlight.title !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.title.length; j++) {
                                    temp = temp + hits[i].highlight.title[j];
                                }
                                if (temp !== "") {
                                    temp_obj.hi_title = temp;
                                }
                            }
                            /* Highlighted Content */
                            if (hits[i].highlight !== undefined && hits[i].highlight.content !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.content.length; j++) {
                                    temp = temp + hits[i].highlight.content[j];
                                }
                                if (temp !== "") {
                                    temp_obj.hi_content = temp;
                                }
                            }
                            /* Highlighted Link */
                            if (hits[i].highlight !== undefined && hits[i].highlight.link !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.link.length; j++) {
                                    temp = temp + hits[i].highlight.link[j];
                                }
                                if (temp !== "") {
                                    temp_obj.hi_link = temp;
                                }
                            }
                            final.website.push(temp_obj);
                        }
                        final.website_total = res.hits.total;
                        return cb(final);
                    }
                } else {
                    return cb(final);
                }
            }
        });
    },
    /* Search blog */
    es_search_blog: function (es_client, pass_obj, cb) {
        if (pass_obj.query === undefined || pass_obj.query === "") {
            return cb(null);
        }
        /* search home일때의 쿼리 */
        if ( pass_obj.from === undefined || pass_obj.from < 0) {
            pass_obj.from = 0;
        }
        pass_obj.size = limit.search_blog;
        es_client.search({
            index: ["simplified_chinese", "english", "japanese", "korean"],
            type: "blog,gallery",
            body: get_search_blog_query(pass_obj)
        }, function (err, res) {
            var final = {}
                , hits
                , temp
                , temp_obj;
            final.blog_total = 0;
            final.blog = [];
            if (err) {
                return cb(final);
            } else {
                if (res && res.hits && res.hits.hits) {
                    hits = res.hits.hits;
                    if (hits.length === 0) {
                        final.blog_total = res.hits.total;
                        return cb(final);
                    } else {
                        for (var i = 0; i < hits.length; i++) {
                            temp_obj = hits[i]._source;
                            /* Highlighted Title */
                            if (hits[i].highlight !== undefined && hits[i].highlight.title !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.title.length; j++) {
                                    temp = temp + hits[i].highlight.title[j];
                                }
                                if (temp !== "") {
                                    temp_obj.hi_title = temp;
                                }
                            }
                            /* Highlighted Content */
                            if (hits[i].highlight !== undefined && hits[i].highlight.content !== undefined) {
                                temp = "";
                                for (var j = 0; j < hits[i].highlight.content.length; j++) {
                                    temp = temp + hits[i].highlight.content[j];
                                }
                                if (temp !== "") {
                                    temp_obj.hi_content = temp;
                                }
                            }
                            final.blog.push(temp_obj);
                        }
                        final.blog_total = res.hits.total;
                        return cb(final);
                    }
                } else {
                    return cb(final);
                }
            }
        });
    },
    /* Search Image */
    es_search_image: function (es_client, pass_obj, cb) {
        if (pass_obj.query === undefined || pass_obj.query === "") {
            return cb(null);
        }
        /* search home일때의 쿼리 */
        if ( pass_obj.from === undefined || pass_obj.from < 0) {
            pass_obj.from = 0;
        }
        pass_obj.size = limit.search_image;
        es_client.search({
            index: ["simplified_chinese", "english", "japanese", "korean"],
            type: "gallery",
            body: get_search_image_query(pass_obj)
        }, function (err, res) {
            var final = {}
                , hits;
            final.image_total = 0;
            final.image = [];
            if (err) {
                return cb(final);
            } else {
                if (res && res.hits && res.hits.hits) {
                    hits = res.hits.hits;
                    if (hits.length === 0) {
                        final.image_total = res.hits.total;
                        return cb(final);
                    } else {
                        for (var i = 0; i < hits.length; i++) {
                            final.image.push(hits[i]._source);
                        }
                        final.image_total = res.hits.total;
                        return cb(final);
                    }
                } else {
                    return cb(final);
                }
            }
        });
    },
    /* Search Web */
    es_search_web: function (es_client, pass_obj, cb) {
        if (pass_obj.query === undefined || pass_obj.query === "") {
            return cb(null);
        }
        /* search home일때의 쿼리 */
        if ( pass_obj.from === undefined || pass_obj.from < 0) {
            pass_obj.from = 0;
        }
        /**
         * msearch로 가져오기
         * 웹문서
         **/
        return cb(null); /* 완성 후, 지우기 */
    },
    /**
     *
     * @param es_client - elasticsearch object
     * @param obj
     * @param obj.blog_id - user's blog_id
     * @param obj.blog_name - user's blog_name
     */
    es_update_user_inline: function (es_client, obj) {
        var script
            , index
            , type;
        if (obj.type === "blog_name") {
            index = ["simplified_chinese", "english", "japanese", "korean"];
            type = "blog,gallery";
            script = {'inline': 'ctx._source.blog_name="' + obj.blog_name + '"'};
            // obj.blog_name = methods.get_es_escaped_str2(obj.blog_name);
        } else if (obj.type === "name") {
            index = ["proper_names"];
            type = "users";
            script = {'inline': 'ctx._source.name="' + obj.name + '"'};
        } else if (obj.type === "img") {
            index = ["proper_names"];
            type = "users";
            script = {'inline': 'ctx._source.img="' + obj.img + '"'};
        }
        es_client.updateByQuery({
            index: index,
            type: type,
            body: {
                'query': {
                    'bool': {
                        'must': [
                            {
                                'term': {
                                    'blog_id': obj.blog_id
                                }
                            }
                        ]
                    }
                },
                'script': script
            }
        }, function (err, res) {
            if (err) {
                return false;
            } else {
                if (obj.type === "name") {
                    index = ["simplified_chinese", "english", "japanese", "korean"];
                    type = "apply_now,hire_me,agenda,opinion,tr_agenda,tr_opinion";
                } else if (obj.type === "img") {
                    index = ["simplified_chinese", "english", "japanese", "korean"];
                    type = "apply_now,hire_me,agenda,opinion,blog,tr_agenda,tr_opinion";
                } else {
                    return false;
                }
                es_client.updateByQuery({
                    index: index,
                    type: type,
                    body: {
                        'query': {
                            'bool': {
                                'must': [
                                    {
                                        'term': {
                                            'blog_id': obj.blog_id
                                        }
                                    }
                                ]
                            }
                        },
                        'script': script
                    }
                }, function (err, res) {
                    if (err) {
                        return false;
                    } else {
                        return false;
                    }
                });
            }
        });
    },
    es_insert_user: function (connected_db, es_client, user) {
        if (user.blog_id === "") {
            return false;
        }
        var first = {}
            , second = {};
        first.blog_id = user.blog_id;
        es_client.index({
            index: "proper_names",
            type: "users",
            body: methods.get_es_user_object(user)
        }, function (err, res) {
            if (err) {
                return false;
            } else {
                second["$set"] = {};
                second["$set"].es_index = res._index;
                second["$set"].es_type = res._type;
                second["$set"].es_id = res._id;
                second["$set"].es_updated_at = new Date().valueOf();
                second["$set"].es_is_updated = true;
                connected_db.collection('users').updateOne(first, second,
                    function(err, res) {
                        if (err === null) {
                            return false;
                        } else {
                            return false;
                        }
                    });
            }
        });
    },
    es_update_user: function (connected_db, es_client, user) {
        if (user.blog_id === "") {
            return false;
        }
        var first = {}
            , second = {};
        first.blog_id = user.blog_id;
        es_client.update({
            index: user.es_index,
            type: user.es_type,
            id: user.es_id,
            body: {
                doc: methods.get_es_user_object(user)
            }
        }, function (err, res) {
            if (err) {
                return false;
            } else {
                second["$set"] = {};
                second["$set"].es_updated_at = new Date().valueOf();
                second["$set"].es_is_updated = true;
                connected_db.collection('users').updateOne(first, second,
                    function(err, res) {
                        if (err === null) {
                            return false;
                        } else {
                            return false;
                        }
                    });
            }
        });
    },
    es_insert_employment: function (connected_db, es_client, doc) {
        var language = doc.language
            , _index
            , _type = doc.type
            , first = {}
            , second = {};
        first.type = doc.type;
        first._id = doc._id;
        if (
            language !== undefined
        ) {
            if (language === "en") {
                _index = "english";
            } else if (language === "ja") {
                _index = "japanese";
            } else if (language === "ko") {
                _index = "korean";
            } else if (language === "zh-Hans") {
                _index = "simplified_chinese";
            } else {
                return false;
            }
        } else {
            return false;
        }
        if (_type === 'apply_now') {
            doc = methods.get_es_apply_now_object(doc);
        } else if (_type === 'hire_me') {
            doc = methods.get_es_hire_me_object(doc);
        } else {
            return false;
        }
        es_client.index({
            index: _index,
            type: _type,
            body: doc
        }, function (err, res) {
            if (err) {
                return false;
            } else {
                second["$set"] = {};
                second["$set"].es_index = res._index;
                second["$set"].es_type = res._type;
                second["$set"].es_id = res._id;
                second["$set"].es_updated_at = new Date().valueOf();
                second["$set"].es_is_updated = true;

                connected_db.collection('employment').updateOne(first, second,
                    function(err, res) {
                        return false;
                    });
            }
        });
    },
    es_update_employment: function (connected_db, es_client, doc) {
        var type = doc.type
            , language = doc.language
            , new_index
            , _index = doc.es_index
            , _type = doc.es_type
            , _id = doc.es_id
            , article_id = doc._id
            , first = {}
            , second = {};
        first.type = doc.type;
        first._id = doc._id;
        if (
            _index === undefined ||
            _type === undefined ||
            _id === undefined ||
            _index === "" ||
            _type === "" ||
            _id === ""
        ) {
            return false;
        }
        if (language === "en") {
            new_index = "english";
        } else if (language === "ja") {
            new_index = "japanese";
        } else if (language === "ko") {
            new_index = "korean";
        } else if (language === "zh-Hans") {
            new_index = "simplified_chinese";
        } else {
            return false;
        }
        if (type === 'apply_now') {
            doc = methods.get_es_apply_now_object(doc);
        } else if (type === 'hire_me') {
            doc = methods.get_es_hire_me_object(doc);
        } else {
            return false;
        }
        if (new_index === _index) {
            es_client.update({
                index: _index,
                type: _type,
                id: _id,
                body: {
                    doc: doc
                }
            }, function (err, res) {
                if (err) {
                    return false;
                } else {
                    second["$set"] = {};
                    second["$set"].es_updated_at = new Date().valueOf();
                    second["$set"].es_is_updated = true;

                    connected_db.collection('employment').updateOne(first, second,
                        function(err, res) {
                            if (err === null) {
                                return false;
                            } else {
                                return false;
                            }
                        });
                }
            });
        } else {
            es_client.delete({
                index: _index,
                type: _type,
                id: _id
            }, function (err, res) {
                if (err) {}
                es_client.index({
                    index: new_index,
                    type: _type,
                    body: doc
                }, function (err, res) {
                    if (err) {
                        second["$set"] = {};
                        second["$set"].es_index = "";
                        second["$set"].es_type = "";
                        second["$set"].es_id = "";
                        second["$set"].es_updated_at = 0;
                        second["$set"].es_is_updated = false;
                        connected_db.collection('employment').updateOne(first, second,
                            function(err, res) {
                                if (err === null) {
                                    return false;
                                } else {
                                    return false;
                                }
                            });
                    } else {
                        second["$set"] = {};
                        second["$set"].es_index = res._index;
                        second["$set"].es_type = res._type;
                        second["$set"].es_id = res._id;
                        second["$set"].es_updated_at = new Date().valueOf();
                        second["$set"].es_is_updated = true;
                        connected_db.collection('employment').updateOne(first, second,
                            function(err, res) {
                                if (err === null) {
                                    return false;
                                } else {
                                    return false;
                                }
                            });
                    }
                });
            });
        }
    },
    /**
     * 1단계 - articles - 단일 도큐먼트 삽입
     * agenda, opinion, blog만 사용! gallery 같은 경우에는 upsert로 사용해줘야 함.
     * @param es_client - Elasticsearch object
     * @param doc - article object
     * @returns {boolean}
     */
    es_insert_article: function (connected_db, es_client, doc) {
        var language = doc.language
            , _index
            , _type = doc.type
            , first = {}
            , second = {};
        first.type = doc.type;
        first._id = doc._id;
        if (
            language !== undefined
        ) {
            if (language === "en") {
                _index = "english";
            } else if (language === "ja") {
                _index = "japanese";
            } else if (language === "ko") {
                _index = "korean";
            } else if (language === "zh-Hans") {
                _index = "simplified_chinese";
            } else {
                return false;
            }
        } else {
            return false;
        }
        if (_type === 'agenda') {
            doc = methods.get_es_agenda_object(doc);
        } else if (_type === 'opinion') {
            doc = methods.get_es_opinion_object(doc);
        } else if (_type === 'tr_agenda') {
            doc = methods.get_es_tr_agenda_object(doc);
        } else if (_type === 'tr_opinion') {
            doc = methods.get_es_tr_opinion_object(doc);
        } else if (_type === 'blog') {
            doc = methods.get_es_blog_object(doc);
        }else if (_type === 'gallery') {
            doc = methods.get_es_gallery_object(doc);
        } else {
            return false;
        }
        /* [STEP1] article - agenda, opinion, blog insert! */
        es_client.index({
            index: _index,
            type: _type,
            body: doc
        }, function (err, res) {
            if (err) {
                return false;
            } else {
                second["$set"] = {};
                second["$set"].es_index = res._index;
                second["$set"].es_type = res._type;
                second["$set"].es_id = res._id;
                second["$set"].es_updated_at = new Date().valueOf();
                second["$set"].es_is_updated = true;
                connected_db.collection('articles').updateOne(first, second, function(err, res) {
                    return false;
                });
            }
        });
    },
    /**
     * 테스트 해봐야 함. 아직 안해봄! 현재 tags랑 autocomplete에 관해서 붙이지 않았음!
     * upsert기 때문에 기존 게시물 정보 msearch 사용해서 article_id 와 type으로 가져온 후에
     * main_tag와 tags를 blog_id 기반으로 각각 msearch로 가져온 후 해당 _id 기반으로 그다음 bulk에서 삭제함과 동시에
     * 새 tags 다시 insert해줘야 한다.
     * 위에꺼 es_insert_article 참고해서 만들어야 한다.
     * agenda, opinion, blog, gallery upsert. Elasticsearch에 해당 게시물 존재하는지 msearch로 확인 후, 존재할 경우 해당 id로 update하기!
     * @param es_client - Elasticsearch object
     * @param doc - article object
     * @returns {boolean}
     */
    es_update_article: function (connected_db, es_client, doc) {
        var type = doc.type
            , language = doc.language
            , new_index
            , _index = doc.es_index
            , _type = doc.es_type
            , _id = doc.es_id
            , article_id = doc._id
            , first = {}
            , second = {};
        first.type = doc.type;
        first._id = doc._id;
        if (
            _index === undefined ||
            _type === undefined ||
            _id === undefined ||
            _index === "" ||
            _type === "" ||
            _id === ""
        ) {
            return false;
        }
        if (language === "en") {
            new_index = "english";
        } else if (language === "ja") {
            new_index = "japanese";
        } else if (language === "ko") {
            new_index = "korean";
        } else if (language === "zh-Hans") {
            new_index = "simplified_chinese";
        } else {
            return false;
        }
        if (type === 'agenda') {
            doc = methods.get_es_agenda_object(doc);
        } else if (type === 'opinion') {
            doc = methods.get_es_opinion_object(doc);
        } else if (type === 'tr_agenda') {
            doc = methods.get_es_tr_agenda_object(doc);
        } else if (type === 'tr_opinion') {
            doc = methods.get_es_tr_opinion_object(doc);
        } else if (type === 'blog') {
            doc = methods.get_es_blog_object(doc);
        } else if (type === 'gallery') {
            doc = methods.get_es_gallery_object(doc);
        } else {
            return false;
        }
        if (new_index === _index) {
            es_client.update({
                index: _index,
                type: _type,
                id: _id,
                body: {
                    doc: doc
                }
            }, function (err, res) {
                if (err) {
                    return false;
                } else {
                    second["$set"] = {};
                    second["$set"].es_updated_at = new Date().valueOf();
                    second["$set"].es_is_updated = true;
                    connected_db.collection('articles').updateOne(first, second,
                        function(err, res) {
                            if (err === null) {
                                return false;
                            } else {
                                return false;
                            }
                        });
                }
            });
        } else {
            es_client.delete({
                index: _index,
                type: _type,
                id: _id
            }, function (err, res) {
                if (err) {}
                es_client.index({
                    index: new_index,
                    type: _type,
                    body: doc
                }, function (err, res) {
                    if (err) {
                        second["$set"] = {};
                        second["$set"].es_index = "";
                        second["$set"].es_type = "";
                        second["$set"].es_id = "";
                        second["$set"].es_updated_at = 0;
                        second["$set"].es_is_updated = false;
                        connected_db.collection('articles').updateOne(first, second,
                            function(err, res) {
                                if (err === null) {
                                    return false;
                                } else {
                                    return false;
                                }
                            });
                    } else {
                        second["$set"] = {};
                        second["$set"].es_index = res._index;
                        second["$set"].es_type = res._type;
                        second["$set"].es_id = res._id;
                        second["$set"].es_updated_at = new Date().valueOf();
                        second["$set"].es_is_updated = true;
                        connected_db.collection('articles').updateOne(first, second,
                            function(err, res) {
                                if (err === null) {
                                    return false;
                                } else {
                                    return false;
                                }
                            });
                    }
                });
            });
        }
    },
    es_insert_news: function (connected_db, es_client, doc) {
        var language = doc.language
            , _index = methods.get_language_text(language)
            , _type = "news"
            , first = {}
            , second = {};
        first.type = doc.type;
        first._id = doc._id;
        doc = methods.get_es_news_object(doc);
        es_client.index({
            index: _index,
            type: _type,
            body: doc
        }, function (err, res) {
            if (err) {
                console.log('\nes_insert_news - create\narticle_id: ' + doc._id + '\nfailed to create document in Elasticsearch.. err: ');
                return false;
            } else {
                second["$set"] = {};
                second["$set"].es_index = res._index;
                second["$set"].es_type = res._type;
                second["$set"].es_id = res._id;
                second["$set"].es_updated_at = new Date().valueOf();
                second["$set"].es_is_updated = true;
                connected_db.collection('news').updateOne(first, second,
                    function(err, res) {
                        return false;
                    });
            }
        });
    },
    es_update_news: function (connected_db, es_client, news) {
        es_client.update({
            index: news.es_index,
            type: news.es_type,
            id: news.es_id,
            body: {
                doc: methods.get_es_news_object(news)
            }
        }, function (err, res) {
            return false;
        });
    },
    es_insert_website: function (connected_db, es_client, doc) {
        var language = doc.language
            , _index = methods.get_language_text(language)
            , _type = "website"
            , first = {}
            , second = {};
        first._id = doc._id;
        doc = methods.get_es_website_object(doc);
        es_client.index({
            index: _index,
            type: _type,
            body: doc
        }, function (err, res) {
            if (err) {
                console.log('\nes_insert_website - create\narticle_id: ' + doc._id + '\nfailed to create document in Elasticsearch.. err: ');
                return false;
            } else {
                second["$set"] = {};
                second["$set"].es_index = res._index;
                second["$set"].es_type = res._type;
                second["$set"].es_id = res._id;
                second["$set"].es_updated_at = new Date().valueOf();
                second["$set"].es_is_updated = true;
                connected_db.collection(_type).updateOne(first, second,
                    function(err, res) {
                        return false;
                    });
            }
        });
    },
    es_remove_document: function (es_client, doc) {
        var _index = doc.es_index
            , _type = doc.es_type
            , _id = doc.es_id;
        if (
            _index === undefined ||
            _type === undefined ||
            _id === undefined ||
            _index === "" ||
            _type === "" ||
            _id === ""
        ) {
            return false;
        }
        es_client.delete({
            index: _index,
            type: _type,
            id: _id
        }, function (err, res) {
            if (err) {
                return false;
            } else {
                return false;
            }
        });
    }
};