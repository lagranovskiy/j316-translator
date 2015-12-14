angular.module('j316.translate.controller.nav', [])
    .controller('NavCtrl', function ($scope, TranslationService) {

        $scope.question = null;

        $scope.isOpen = false;

        $scope.toggleOpen = function(){
            $scope.isOpen = !$scope.isOpen;
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