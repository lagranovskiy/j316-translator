angular.module('j316.translate.service.info', [])
    .service('InfoService', function ($rootScope) {
        var info = {};

        $rootScope.$on('info', function (event, data) {
            info = data;
        });

        this.getInfo = function () {
            return info;
        }

    });