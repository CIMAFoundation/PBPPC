/**
 * Created by mirkodandrea on 02/12/16.
 */
(function(){
    var galApp = angular.module('galApp');

    galApp.filter('toArray', function () {
        return function (input) {
            return angular.isArray(input) ? input : [input];
        };
    });

    galApp.filter('trust', ['$sce', function ($sce) {
        return function (text, type) {
            // Defaults to treating trusted text as `html`
            return $sce.trustAs(type || 'html', text);
        };
    }
    ]);

    galApp.filter("nl2br", function ($filter) {
        return function (data) {
            if (!data) return data;
            return data.replace(/\n\r?/g, '<br />');
        };
    });


    galApp.filter('trustHtml', function($sce) {
        return function(input) {
            var output = $sce.trustAsHtml(input);
            return output;
        };
    });

    galApp.filter('djangoMedia', function(DataService) {
        return function(input) {
            var output = input;
            if(input && input.startsWith('/media/')){
                output = DataService.media_server + '/' + input.slice(1);

            }else{
                console.log('not a django media url', input);
            }

            return output;
        };
    });
})();
