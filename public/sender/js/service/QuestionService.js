angular.module('j316.translate.service.question', [])
    .service('QuestionService', function ($q, $rootScope, translatorSocket, TranslationService) {


        /**
         * Socket communication
         */

        translatorSocket.forward('questionAnswered', $rootScope);
        $rootScope.$on('socket:questionAnswered', function (ev, data) {
            $rootScope.$broadcast('questionAnswered', data);
        });


        /**
         * Sends a question
         * @param answeredQuestion  answered question text
         * @param language language of the answer
         */
        this.sendAnsweredQuestion = function (answeredQuestion, language) {
            translatorSocket.emit('answeredQuestion', {
                questionUUID: answeredQuestion.questionUUID,
                answer: answeredQuestion.answer,
                language: language
            });
        };


    });