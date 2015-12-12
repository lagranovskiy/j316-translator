angular.module('j316.translate.service.question', [])
    .service('QuestionService', function ($q, $rootScope, translatorSocket, TranslationService) {




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