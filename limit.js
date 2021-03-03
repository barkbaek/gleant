module.exports = {
    get_all: function () {
        var limit = {};
        limit.announcements = 20;
        limit.apply_now_announcements = 100;
        limit.articles = 50;
        limit.best_agendas = 10;
        limit.best_opinions = 10;
        limit.comments = 20;
        limit.friends = 30;
        limit.guestbook = 30;
        limit.images = 30;
        limit.invitations = 30;
        limit.messages = 30;
        limit.news = 30;
        limit.notifications = 30;
        limit.online_interview_answers = 100;
        limit.opinions_of_agendas = 100;
        limit.realtime_main_tag_articles = 10;
        limit.realtime_employment = 10;
        limit.realtime_comments = 10;
        limit.search_all = 5;
        limit.search_debate = 10;
        limit.search_employment = 10;
        limit.search_image = 50;
        limit.search_news = 10;
        limit.search_blog = 10;
        limit.search_user = 10;
        limit.search_website = 10;
        limit.today_visitors = 50;
        limit.translations_of_articles = 100;
        limit.user_gallery = 30;
        limit.users = 30;
        return limit;
    }
};