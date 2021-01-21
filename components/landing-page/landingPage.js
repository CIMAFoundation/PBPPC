/**
 * Created by mirkodandrea on 04/10/16.
 */
'use strict';

(function() {
    var module = angular.module('galApp');

    module.component('landingPage', {
        templateUrl: 'components/landing-page/landingPage.html',
        bindings: {},
        controller: function ($scope, ProfilesService){
            console.log('landing page loaded');
            var $ctrl = this;
            $ctrl.profiles = ProfilesService.list;
        }
    });
})();
