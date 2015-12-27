angular.module('j316.translate.controller.sender', [])
    .controller('SenderCtrl', function ($scope, $location, $window, $http, $log, TranslationService, languages, $mdDialog) {

        $scope.registrationInfo = TranslationService.getRegistrationInfo();
        $scope.isConnecting = false;
        $scope.accessKey='j316';

        $scope.$on('socket:error', function (ev, data) {
            $log.warn(data);
            TranslationService.disconnect();
        });

        $scope.isOnline = function () {
            return TranslationService.isOnline()
        };

        $scope.$watch('isOnline()', function (newVal) {
            if (newVal) {
                $location.path('/translationPanel');
            }
        });


        $scope.connect = function () {
            $scope.registrationInfo = TranslationService.register($scope.registrationInfo);
            $scope.isConnecting = true;
            TranslationService.connect($scope.accessKey).then(
                function (result) {
                    $scope.isConnecting = false;
                    $location.path('/translationPanel');
                },
                function (failure) {
                    $scope.isConnecting = false;

                   var alert = $mdDialog.alert()
                        .parent(angular.element(document.body))
                        .clickOutsideToClose(true)
                        .title('Authentication Problem')
                        .content(failure)
                        .ok('Ok');

                    $mdDialog.show(alert)

                }
            );
        };

        $scope.langList = languages;
    });