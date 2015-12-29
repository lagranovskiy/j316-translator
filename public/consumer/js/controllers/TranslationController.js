angular.module('j316.translate.controller.translation', ['angular-underscore'])
    .controller('TranslationCtrl', function ($scope, $rootScope, $anchorScroll, $location, $timeout, $window, $http, $log, TranslationService, languages) {

        $scope.showLastMsgCount = 20;
        $scope.messages = [];

        $scope.isOnline = function () {
            return TranslationService.isOnline()
        };

        $scope.$watch('isOnline()', function (newVal) {
            if (!newVal) {
                //release() is used to release the lock.
                if (navigator.wakeLock) {
                    navigator.wakeLock.release("display");
                    navigator.wakeLock.release("system");
                }
                $location.path('/');
            }
        });

        $scope.$on('authenticate', function (event, msg) {
            TranslationService.disconnect();
        });


        $scope.$on('newTranslation', function (event, msg) {
            var displayableMessage = {
                translation: msg.translation,
                sourceName: msg.sourceName,
                sourceLanguage: msg.sourceLanguage,
                timestamp: msg.timestamp,
                contentType: msg.contentType,
                type: 'message'
            };

            $scope.messages.unshift(displayableMessage);
            if ($scope.messages.length > 300) {
                $scope.messages.pop();
            }

            // Try to give vibration feedback
            if (window.navigator && window.navigator.vibrate) {
                navigator.vibrate(100);
            } else {
                // Not supported
            }
        });

        $scope.$on('newQuestionAnswer', function (event, msg) {

            /**
             *{
             *    questionUUID: 'qww23un2r3r3',
             *    questionSourceId: 'iX28un2dcc',
             *    questionSourceName: 'Leo',
             *    questionText: 'Hello how are you',
             *    answerSource: 'Danke gut',
             *    answerText: 'Fine thanks',
             *    answerTranslation: 'Danke gut',
             *    answerSenderName: 'Max'
             * }
             */
            var displayableMessage = {
                questionUUID: msg.questionUUID,
                questionText: msg.questionText,
                answerText: msg.answerText,
                answerTranslation: msg.answerTranslation,
                answerSenderName: msg.answerSenderName,
                timestamp: msg.timestamp ? msg.timestamp : new Date().getTime(),
                type: 'answer'
            };

            $scope.messages.unshift(displayableMessage);
            if ($scope.messages.length > 300) {
                $scope.messages.pop();
            }


            // Try to give vibration feedback
            if (window.navigator && window.navigator.vibrate) {
                navigator.vibrate(500);
            } else {
                // Not supported
            }
        });

        $scope.$on('questionAck', function (event, msg) {
            var displayableMessage = {
                questionUUID: msg.questionUUID,
                questionText: msg.questionText,
                answerText: msg.answerText,
                answerTranslation: msg.answerTranslation,
                answerSenderName: msg.answerSenderName,
                timestamp: msg.timestamp ? msg.timestamp : new Date().getTime(),
                type: 'questionAck'
            };

            $scope.messages.unshift(displayableMessage);
            if ($scope.messages.length > 300) {
                $scope.messages.pop();
            }

            // Try to give vibration feedback
            if (window.navigator && window.navigator.vibrate) {
                navigator.vibrate(300);
            } else {
                // Not supported
            }
        });
        $scope.$on('cachedTranslations', function (event, msg) {
            _.each(msg, function (singleMsg) {
                var displayableMessage = {
                    translation: singleMsg.translation,
                    sourceName: singleMsg.sourceName,
                    sourceLanguage: singleMsg.sourceLanguage,
                    timestamp: singleMsg.timestamp,
                    contentType: singleMsg.contentType,
                    type: 'message'
                };


                $scope.messages.unshift(displayableMessage);
                if ($scope.messages.length > 300) {
                    $scope.messages.pop();
                }
            });
        });

        /**
         * Emits event that will be caught by nav and question dialog will be opened
         * @param item
         */
        $scope.replyAnswer = function (item) {
            $rootScope.$broadcast('askQuestion', item);
        };

        $scope.formatDate = function (timestamp) {
            return new Date(timestamp).getHours() + ':' + new Date(timestamp).getMinutes();
        };

        $scope.incShowedMsgs = function () {
            $scope.showLastMsgCount = $scope.showLastMsgCount + 5;
        };


        $scope.clientInfo = TranslationService.getRegistrationInfo();

        $scope.localizeLang = function (key) {
            return _.findWhere(languages, {key: key});
        };


        // HTML5 Standby API
        if (navigator.wakeLock) {
            //navigator.wakeLock is the main standby API property.
            //request method requests the computer to not enter standby mode. Here "display" indicates that the monitor shouldn't enter standby mode.
            navigator.wakeLock.request("display").then(
                function successFunction() {
                    $log.info('Preventing display to sleep is enabled');
                },
                function errorFunction() {
                    $log.info('Preventing display to sleep is not supported');
                });
            //here system indicates CPU, GPU, radio, wifi etc.
            navigator.wakeLock.request("system").then(
                function successFunction() {
                    $log.info('Preventing system to sleep is enabled');
                },
                function errorFunction() {
                    $log.info('Preventing system to sleep is not supported');
                }
            );
        }

    });

