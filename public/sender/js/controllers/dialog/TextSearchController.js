angular.module('j316.translate.controller.textsearch', ['angular-underscore'])
    .controller('TextSearchCtrl', function ($scope, $mdDialog, $log, $http, $q) {
        $scope.selectedItem = null;
        // ******************************
        // Internal methods
        // ******************************
        /**
         * Search for repos... use $timeout to simulate
         * remote dataservice call.
         */
        $scope.querySearch = function (query) {
            if (!query || !query.length) {
                return;
            }

            var deferred = $q.defer();

            $http.post('/search/text', {query: query}).then(function (response) {
                var data = response.data;
                $log.info('Result for query: ' + data);
                deferred.resolve(data.hits);
            }, function (err) {
                $log.error('Cannot search for a query ' + query + ' :: ' + err);
            });

            return deferred.promise;

        };

        $scope.sendSelected = function () {
            if (!$scope.selectedItem) {
                $log.error('Cannot sent empty item');
                return;
            }

            $mdDialog.hide($scope.selectedItem);
        };

        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };


    })
;