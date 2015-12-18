angular.module('j316.translate.controller.translation', ['angular-underscore'])
    .controller('TranslationPanelCtrl', function ($scope, $location, $timeout, $log, TranslationService, QuestionService, languages, $mdDialog, $mdMedia) {

        $scope.showLastMsgCount = 20;
        $scope.messages = [];
        $scope.languages = languages;
        $scope.originLanguage = TranslationService.getRegistrationInfo().language;
        $scope.selectedIndex = 0;

        $scope.listenerList = [];
        $scope.listenerCount = 0;
        $scope.statusMessage = null;


        $scope.message = {
            text: null,
            language: null
        };

        $scope.senderInfo = TranslationService.getRegistrationInfo();

        $scope.recognizing = false;
        $scope.recognition = null;
        $scope.interim_transcript = '';


        $scope.$watch('isOnline()', function (newVal) {
            if (newVal === false) {
                $location.path('/');
            }
        });


        $scope.$on('authenticate', function (event, msg) {
            TranslationService.disconnect();
        });

        $scope.$on('listenersChanged', function (event, msg) {
            $scope.listenerList = msg;
            var listenerCount = 0;
            _.each(msg, function (val) {
                listenerCount = listenerCount + val;
            });

            $scope.listenerCount = listenerCount;
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
        });


        /**
         *  {
         *      questionUUID: 'qww23un2r3r3',
         *      questionSourceId: 'iX28un2dcc',
         *      questionSourceName: 'Leo',
         *      questionText: 'Hello how are you',
         *      questionLanguage: 'en',
         *      questionTimestamp: '1234235255',              // Timestamp of question
         *      questionTranslation: "Hallo wie gehts",       // Translated text for sender
         *      targetId: "N3424nNOUINDD",                    // Sender who are going to answer
         *      targetLanguage: "de"                          // Langauge of sender where the question is translated
         *   }
         *
         */
        $scope.$on('newQuestion', function (event, msg) {
            var displayableMessage = {
                questionUUID: msg.questionUUID,
                questionTranslation: msg.questionTranslation,
                questionText: msg.questionText,
                questionSourceName: msg.questionSourceName,
                questionLanguage: msg.questionLanguage,
                timestamp: msg.questionTimestamp,
                type: 'question'
            };

            $scope.messages.unshift(displayableMessage);
            if ($scope.messages.length > 300) {
                $scope.messages.pop();
            }
        });

        $scope.$on('answerAck', function (event, msg) {
            var questions = _.where($scope.messages, {questionUUID: msg.questionUUID});
            _.each(questions, function (question) {
                question.answered = true;
                question.answeredBy = msg.answerSenderName;
            });
        });

        $scope.$on('cachedQuestions', function (event, msg) {
            _.each(msg, function (singleMsg) {
                var displayableMessage = {
                    questionUUID: singleMsg.questionUUID,
                    questionTranslation: singleMsg.questionTranslation,
                    questionText: singleMsg.questionText,
                    questionSourceName: singleMsg.questionSourceName,
                    questionLanguage: singleMsg.questionLanguage,
                    timestamp: singleMsg.questionTimestamp,
                    answered: singleMsg.answered,
                    answeredBy: singleMsg.answeredBy,
                    type: 'question'
                };

                $scope.messages.unshift(displayableMessage);
                if ($scope.messages.length > 300) {
                    $scope.messages.pop();
                }
            });
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

        $scope.$on('socket:error', function (ev, data) {
            $log.warn(data);
            TranslationService.disconnect();
        });


        $scope.startVoiceRecognition = function () {
            if (!('webkitSpeechRecognition' in window)) {
                $log.log("webkitSpeechRecognition is not available");
            } else {
                if (!$scope.recognition) {
                    $scope.recognition = new webkitSpeechRecognition();
                    $scope.recognition.continuous = true;
                    $scope.recognition.interimResults = true;

                    $scope.recognition.onstart = function () {
                        $log.info('Started voice recording');
                    };

                    $scope.recognition.onend = function () {
                        $log.info('Stopped voice recording');
                        if ($scope.recognizing) {
                            $scope.sendMessage();
                            $scope.recognition.start();
                        }
                    };

                    $scope.recognition.onerror = function (err) {
                        $log.error(err);
                    };

                    $scope.recognition.onaudiostart = function () {
                        $log.info('audio start fired');
                    };

                    $scope.recognition.onaudioend = function () {
                        $log.info('audio end fired');
                    };

                    $scope.recognition.onsoundstart = function () {
                        $log.info('sound start fired');
                    };

                    $scope.recognition.onsoundend = function () {
                        $log.info('sound end fired');
                    };

                    $scope.recognition.onspeechstart = function () {
                        $log.info('speech start fired');
                    };
                    $scope.recognition.onspeechend = function () {
                        $log.info('speech end fired');
                        $scope.sendMessage();
                    };


                    $scope.recognition.onresult = function (event) {
                        for (var i = event.resultIndex; i < event.results.length; ++i) {
                            var capitalize = _.capitalize(event.results[i][0].transcript.trim());

                            if (event.results[i].isFinal) {
                                if (!$scope.message.text) {
                                    $scope.message.text = '';
                                }
                                $scope.message.text += capitalize + '.\n';
                            } else {
                                $scope.interim_transcript = capitalize;
                            }
                        }
                        $scope.$apply();
                    };

                }
                //WebSpeech API
                if ($scope.recognizing === true) {
                    $scope.recognizing = false;
                    $scope.recognition.stop();
                }


                $scope.recognition.lang = _.findWhere(languages, {key: $scope.message.language}).voicelang;
                $scope.recognition.start();
                $scope.recognizing = true;

            }
        };


        /**
         * Sends message for translation
         */
        $scope.sendMessage = function () {
            $log.info('Sending of message: ' + $scope.message.text);
            $scope.statusMessage = 'Sending completed';
            $timeout(function () {
                $scope.statusMessage = null
            }, 500);
            TranslationService.sendMessage($scope.message);
            $scope.message.text = null;
        };

        $scope.answerQuestion = function (question) {
            $mdDialog.show(
                {
                    controller: function ($scope, $mdDialog) {
                        $scope.question = question;

                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        };
                        $scope.send = function () {
                            $mdDialog.hide($scope.question);
                        };
                    },
                    templateUrl: 'views/dialog/answer.tmpl.html',
                    clickOutsideToClose: true
                })
                .then(function (answer) {
                    QuestionService.sendAnsweredQuestion(answer, $scope.message.language);
                }, function () {
                    $log.info('You cancelled the dialog.');
                });

            $scope.$watch(function () {
                return $mdMedia('sm');
            });

        };

        /**
         * Get lang sent message again
         */
        $scope.undo = function () {
            var last = TranslationService.getLast();
            if (last) {
                $scope.message.text = last;
            }
        };

        /**
         * Evaluates keydown and fire if shift+enter / ctrl+enter pressed
         * @param event
         */
        $scope.evaluateKeyPress = function (event) {
            if (event.keyCode == 13 && (event.ctrlKey == true || event.shiftKey == true)) {
                $scope.sendMessage();
                event.defaultPrevented = true;
                event.preventDefault();
            }
            if (event.keyCode == 8 && (event.ctrlKey == true || event.shiftKey == true)) {
                $scope.undo();
                event.defaultPrevented = true;
                event.preventDefault();
            }
        };


        /**
         * Updates currently configured language
         * @param lang
         */
        $scope.updateCurrentLanguage = function (lang) {
            if (!lang) {
                return;
            }

            $scope.message.language = lang.key;
        };

        $scope.isOnline = function () {
            return TranslationService.isOnline()
        };

        $scope.requestListenersInfo = function () {
            TranslationService.requestListenersInfo();
        };


        $scope.incShowedMsgs = function () {
            $scope.showLastMsgCount = $scope.showLastMsgCount + 5;
        };

        $scope.formatDate = function (timestamp) {
            return new Date(timestamp).getHours() + ':' + new Date(timestamp).getMinutes();
        };


        $scope.localizeLang = function (key) {
            return _.findWhere(languages, {key: key});
        };


    });