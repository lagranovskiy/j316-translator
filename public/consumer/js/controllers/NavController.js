angular.module('j316.translate.controller.nav', [])
    .controller('NavCtrl', function ($scope, TranslationService, $mdDialog, $mdMedia) {

        $scope.isOnline = function () {
            return TranslationService.isOnline();
        };

        $scope.disconnect = function () {
            TranslationService.disconnect();
        };

        $scope.question = null;


        $scope.showSettings = function (ev) {
            $mdDialog.show({
                controller: function ($scope, $mdDialog) {
                    $scope.settings = TranslationService.getSettings();
                    $scope.hide = function () {
                        $mdDialog.hide();
                    };
                    $scope.cancel = function () {
                        $mdDialog.cancel();
                    };
                    $scope.save = function () {
                        $mdDialog.hide($scope.settings);
                    };
                },
                templateUrl: 'views/dialog/settings.tmpl.html',
                targetEvent: ev,
                autoWrap: true,
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    console.info('Saving your settings "' + answer + '".');
                    TranslationService.saveSettings(answer);
                }, function () {
                    console.info('You cancelled the dialog.');
                });
            $scope.$watch(function () {
                return $mdMedia('sm');
            });
        };

        $scope.showAsk = function (ev) {
            $mdDialog.show({
                controller: function ($scope, $mdDialog) {
                    $scope.settings = TranslationService.getSettings();
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
                templateUrl: 'views/dialog/ask.tmpl.html',
                targetEvent: ev,
                clickOutsideToClose: true
            })
                .then(function (answer) {
                    console.info('Sending your question "' + answer + '".');
                    TranslationService.sendQuestion(answer);
                }, function () {
                    console.info('You cancelled the dialog.');
                });
            $scope.$watch(function () {
                return $mdMedia('sm');
            });
        };
    });