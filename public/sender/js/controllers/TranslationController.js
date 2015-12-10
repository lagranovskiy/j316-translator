angular.module('j316.translate.controller.translation', ['angular-underscore'])
    .controller('TranslationPanelCtrl', function ($scope, $anchorScroll, $location, $timeout, $window, $http, $log, TranslationService, languages) {

        $scope.showLastMsgCount = 20;
        $scope.messages = [];
        $scope.languages = languages;
        $scope.originLanguage = TranslationService.getRegistrationInfo().language;
        $scope.selectedIndex = languages.indexOf(_.findWhere(languages, {key: $scope.originLanguage}));

        $scope.statusMessage = null;

        $scope.message = {
            text: null,
            language: null
        };


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

        /**
         * Get lang sent message again
         */
        $scope.undo = function () {
            var last = TranslationService.getLast();
            if(last){
                $scope.message.text =  last;
            }
        };

        /**
         * Evaluates keydown and fire if shift+enter / ctrl+enter pressed
         * @param event
         */
        $scope.evaluateKeyPress = function (event) {
            if (event.keyCode == 13 && (event.ctrlKey == true || event.shiftKey == true)) {
                $scope.sendMessage();
                event.preventDefault();
            }
            if (event.keyCode == 8 && (event.ctrlKey == true || event.shiftKey == true)) {
                $scope.undo();
                event.preventDefault();
            }
        };

        /**
         * Updates currently configured language
         * @param lang
         */
        $scope.updateCurrentLanguage = function (lang) {
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


        $scope.senderInfo = TranslationService.getRegistrationInfo();

        $scope.localizeLang = function (key) {
            return _.findWhere(languages, {key: key});
        };

        $scope.$on('newTranslation', function (event, msg) {
            $scope.messages.unshift(msg);
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

    });