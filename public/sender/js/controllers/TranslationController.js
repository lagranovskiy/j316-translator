angular.module('j316.translate.controller.translation', ['angular-underscore'])
    .controller('TranslationPanelCtrl', function ($scope, $location, $timeout, $log, TranslationService, QuestionService, languages, $mdDialog, $mdMedia) {

        $scope.showLastMsgCount = 20;
        $scope.messages = [];
        $scope.languages = languages;
        $scope.originLanguage = TranslationService.getRegistrationInfo().language;
        $scope.selectedIndex = 0;

        $scope.listenerList = [];

        $scope.statusMessage = null;

        $scope.message = {
            text: null,
            language: null
        };

        $scope.senderInfo = TranslationService.getRegistrationInfo();


        $scope.startButton = function (event) {

            //WebSpeech API
            var final_transcript = '';
            var recognizing = false;
            var last10messages = []; //to be populated later

            if (!('webkitSpeechRecognition' in window)) {
                console.log("webkitSpeechRecognition is not available");
            } else {
                var recognition = new webkitSpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;

                recognition.onstart = function () {
                    recognizing = true;
                };

                recognition.onresult = function (event) {
                    var interim_transcript = '';
                    for (var i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            final_transcript += event.results[i][0].transcript;
                        } else {
                            interim_transcript += event.results[i][0].transcript;
                        }
                    }
                };
            }




            if (recognizing) {
                recognition.stop();
                recognizing = false;
                $("#start_button").prop("value", "Record");
                return;
            }
            final_transcript = '';
            recognition.lang = "en-GB"
            recognition.start();
            $("#start_button").prop("value", "Recording ... Click to stop.");
            $("#msg").val();
        };



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
                type: 'message'
            };

            $scope.messages.unshift(displayableMessage);
            if ($scope.messages.length > 300) {
                $scope.messages.pop();
            }
        });


        $scope.$on('newQuestion', function (event, msg) {
            var displayableMessage = {
                questionUUID: msg.questionUUID,
                translation: msg.translation,
                text: msg.text,
                sourceName: msg.questionSourceName,
                sourceLanguage: msg.sourceLanguage,
                timestamp: msg.timestamp,
                type: 'question'
            };

            $scope.messages.unshift(displayableMessage);
            if ($scope.messages.length > 300) {
                $scope.messages.pop();
            }
        });

        $scope.$on('cachedTranslations', function (event, msg) {
            _.each(msg, function (singleMsg) {
                $scope.messages.unshift(singleMsg);
                if ($scope.messages.length > 300) {
                    $scope.messages.pop();
                }
            });
        });


        /**
         * Sends message for translation
         */
        $scope.sendMessage = function () {
            console.info('Sending of message: ' + $scope.message.text);
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
                        $scope.hide = function () {
                            $mdDialog.hide();
                        };
                        $scope.cancel = function () {
                            $mdDialog.cancel();
                        };
                        $scope.send = function () {
                            $mdDialog.hide($scope.msg);
                        };
                    },
                    templateUrl: 'views/dialog/answer.tmpl.html',
                    clickOutsideToClose: true
                })
                .then(function (answer) {
                    QuestionService.sendAnswer(question, answer);
                }, function () {
                    console.info('You cancelled the dialog.');
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

        $scope.$watch('isOnline()', function (newVal) {
            if (!newVal) {
                $location.path('/');
            }
        });


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