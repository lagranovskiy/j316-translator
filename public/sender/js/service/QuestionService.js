angular.module('j316.translate.service.question', [])
    .service('QuestionService', function ($q, $rootScope, questionSocket, TranslationService) {


        /**
         * Socket communication
         */

        questionSocket.forward('newQuestionAnswer', $rootScope);
        $rootScope.$on('questions~newQuestionAnswer', function (ev, data) {
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

            questionSocket.emit('question', {
                sender: regInf.name,
                language: regInf.lang,
                time: new Date(),
                msg: question
            });
        };


    });