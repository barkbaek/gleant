'use strict';

( function() {
    CKEDITOR.plugins.add('limitedvote', {
        icons: 'limitedvote',
        init: function (editor) {
            editor.addCommand('insertLimitedVote', {
                exec: function (editor) {
                    /* Employment */
                    if (is_apply_now_prompt_opened === true) {
                        modal('.prompt#apply-now-prompt', 'close');
                    }
                    if (is_hire_me_prompt_opened === true) {
                        modal('.prompt#hire-me-prompt', 'close');
                    }
                    if (is_unicorn_prompt_opened === true) {
                        modal('.prompt#unicorn-prompt', 'close');
                    }
                    if (is_superior_prompt_opened === true) {
                        modal('.prompt#superior-prompt', 'close');
                    }
                    /* Debate */
                    if (is_agenda_prompt_opened === true) {
                        modal('.prompt#agenda-prompt', 'close');
                    }
                    if (is_opinion_prompt_opened === true) {
                        modal('.prompt#opinion-prompt', 'close');
                    }
                    if (is_space_prompt_opened === true) {
                        modal('.prompt#space-prompt', 'close');
                    }
                    if ( $('.prompt#vote-prompt').length > 0 ) {
                        if (vote_prompt !== undefined && vote_prompt.init !== undefined) {
                            vote_prompt.init("limited");
                        }
                        modal('.prompt#vote-prompt', 'open');
                    }
                }
            });
            editor.ui.addButton('LimitedVote', {
                label: 'Insert vote',
                command: 'insertLimitedVote',
                toolbar: 'basicstyles'
            });
        }
    });
} )();