angular.module('j316.translate.controller.nav', [])
    .controller('NavCtrl', function ($scope, TranslationService, InfoService) {

        $scope.question = null;

        $scope.isOpen = false;

        $scope.toggleOpen = function () {
            $scope.isOpen = !$scope.isOpen;
        };

        $scope.getInfo = function () {
            return InfoService.getInfo();
        };


        $scope.enterFullScreen = function () {
            var el = document.documentElement;
            if (!el) {
                return;
            }
            if ($scope.fullscreen) {
                var rfs = el.exitFullscreen || el.webkitExitFullscreen || el.mozCancelFullScreen ||  el.msExitFullscreen;
                if (rfs) {
                    rfs.call(el);
                    $scope.fullscreen = false;
                }
            } else {
                var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
                if (rfs) {
                    rfs.call(el);
                    $scope.fullscreen = true;
                }
            }
        };

        /**
         * Indicates if user is online
         * @returns {boolean}
         */
        $scope.isOnline = function () {
            return TranslationService.isOnline();
        };

        /**
         * Process disconnect
         */
        $scope.disconnect = function () {
            TranslationService.disconnect();
        };


    });