/**
 * Created by Manuel on 13/05/2016.
 */

(function(){
    var services = angular.module('galApp.services', []);
    var galApp = angular.module('galApp', [
        'ngRoute',
        'galApp.services',
        'jkuri.gallery',
        'ui.bootstrap',
        'matchMedia',
        'ngAnimate'
    ]);

    galApp.factory('myHttpInterceptor', function ($q) {
        return {
            'request': function(config) {
                console.log(config.url);
                /*
                if (config.url.indexOf('/api/') != -1 && config.url.slice(-1) != '/') {
                    config.url += '/';
                }
                */
                return config || $q.when(config);
            }
        };
    });






    galApp.config(function($logProvider, $routeProvider, $httpProvider) {
        $logProvider.debugEnabled(false);
        $httpProvider.interceptors.push('myHttpInterceptor');
        $routeProvider
            /*
            .when('/', {
		template: '<main-view></main-view>',
                resolve: {
                    profile: ['ProfilesService','$route', function (ProfilesService, $route) {
                        var routeParams = $route.current.params;
                        ProfilesService
                        .init()
                        .then(function(){
                            ProfilesService.setActiveProfile(routeParams.profile);
                        });

                    }],
                    disableScroll:function($document){
                        $document[0].body.style.overflow='hidden';
                    }

                }

            })
            */
            .when('/main/:profile', {
                template: '<main-view></main-view>',
                resolve: {
                    profile: ['ProfilesService','$route', function (ProfilesService, $route) {
                        var routeParams = $route.current.params;
                        ProfilesService
                        .init()
                        .then(function(){
                            ProfilesService.setActiveProfile(routeParams.profile);
                        });

                    }],
                    disableScroll:function($document){
                        $document[0].body.style.overflow='hidden';
                    }

                }
            })
            .when('/landing', {
                template: '<landing-page></landing-page>',
                resolve: {
                    enableScroll:function($document){
                        $document[0].body.style.overflow='scroll';
                    }
                }

            })


            /*
            .otherwise({
                template: '<main-view></main-view>',
                resolve: {
                    profile: ['ProfilesService','$route', function (ProfilesService, $route) {
                        var routeParams = $route.current.params;
                        ProfilesService
                        .init()
                        .then(function(){
                            ProfilesService.setActiveProfile(routeParams.profile);
                        });

                    }],
                    disableScroll:function($document){
                        $document[0].body.style.overflow='hidden';
                    }

                }
            });
            */

            .when('/', {
                template: '<landing-page></landing-page>',
                resolve: {
                    enableScroll:function($document){
                        $document[0].body.style.overflow='scroll';
                    }
                }

            });
    });

    galApp.filter('rawHtml', ['$sce', function($sce){
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    }]);


})();
