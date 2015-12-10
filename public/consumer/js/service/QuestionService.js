angular.module('j316.translate.service.question', [])
    .service('QuestionService', function ($q, $rootScope, translatorSocket, TranslationService) {


        /**
         * Socket communication
         */

        translatorSocket.forward('newQuestionAnswer', $rootScope);
        $rootScope.$on('socket:newQuestionAnswer', function (ev, data) {
            $rootScope.$broadcast('newQuestionAnswer', {
                time: new Date(),
                msg: data
            });
        });


        /**
         * Sends a question
         * @param question question to be sent
         */
        this.sendQuestion = function (question) {

            var regInf = TranslationService.getRegistrationInfo();

            translatorSocket.emit('question', {
                sender: regInf.name,
                language: regInf.lang,
                time: new Date(),
                msg: question
            });
        };


    });