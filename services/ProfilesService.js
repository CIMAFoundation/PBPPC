/**
 * Created by mirkodandrea on 11/10/16.
 */
(function () {
    var app = angular.module('galApp.services');

    app.service('ProfilesService', function (DataService, $q, $timeout) {
        var service = this;

        service.list = [];

        this.init = function(){
            console.log('init');
            var p = $q.defer();
            if(this.list.length==0) {
                DataService
                .getProfiles()
                .then(function (profiles) {
                    profiles.forEach(function (p) {
                        service.list.push(p)
                    });
                    p.resolve();
                });

            }else{
                $timeout(function(){
                    p.resolve();
                });
            }
            return p.promise;
        };

        function findAndFetchProfile(service, profile, p){
            var activeProfile = service.list.find(function(t){
                return t.profile_id==profile;
            });
            DataService.getProfile(activeProfile).then(function(profileObj){
                service.activeProfileObj = profileObj;
                p.resolve();
            });
        }


        this.setActiveProfile = function(profile){
            var p = $q.defer();
            if(service.list.length==0){
                service
                .init()
                .then(function(){
                    findAndFetchProfile(service, profile, p)
                });
            }else{
                $timeout(function(){
                    findAndFetchProfile(service, profile, p)
                });
            }
            return p.promise;
        };

        this.getCurrentProfileCategories = function(){
          var activeProfile = service.activeProfileObj;
          return activeProfile ? activeProfile.subcategories||[] : [];
        };

        service.activeProfileObj = null;

        service.init();

        return service;
    });
})();