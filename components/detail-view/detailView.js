/**
 * Created by mirkodandrea on 16/05/16.
 */
'use strict';

(function() {
    var module = angular.module('galApp');

    module.component('detailView', {
        templateUrl: 'components/detail-view/detailView.html',
        bindings: {
            element: '<',
            galleryOpen: '='
        },
        controller: function ($window, $filter) {
            var $ctrl = this;
            this.gallery = [];

            $ctrl.cover_color = [255,255,255];

            this.$onChanges = function (changesObj) {
                if (changesObj.element && changesObj.element.currentValue != null) {
                    $ctrl.gallery = [];
                    if($ctrl.element.gallery) {
                        $ctrl.element.gallery.forEach(function (img) {
                            $ctrl.gallery.push({
                                thumb: $filter('djangoMedia')(img.thumb),
                                img: $filter('djangoMedia')(img.image),
                                description: img.description
                            });
                        });
                    }
                }
            };

/*
            this.doAction = function(value, type){
                var url;
                switch(type){
                    case 'email':
                    case 'e-mail':
                        url = 'mailto:' + value;
                        break;
                    case 'phone':
                        url = 'tel:' + value;
                        break;
                    case 'address':
                        url = 'http://maps.google.com/?q=' + value;
                        break;

                    case 'link':
                    case 'url':
                    case 'website':
                    case 'webpage':
                        if(!value.startsWith('http://')&&!value.startsWith('https://')){
                            value = 'http://' + value;
                        }
                        url = value;
                        break;

                    default:
                        url = null;
                }
                if(url){
                    $window.open(url, '_blank');
                }
            };
*/

            this.getURL = function(value, type){
                var url;
                switch(type){
                    case 'email':
                    case 'mail':
                    case 'e-mail':
                        url = 'mailto:' + value;
                        break;
                    case 'phone':
                        url = 'tel:' + value;
                        break;
                    case 'address':
                        url = 'http://maps.google.com/?q=' + value;
                        break;

                    case 'link':
                    case 'url':
                    case 'website':
                    case 'webpage':
                        if(!value.startsWith('http://')&&!value.startsWith('https://')){
                            value = 'http://' + value;
                        }
                        url = value;
                        break;

                    default:
                        url = null;
                }
                return url;
            }
        }
    });
})();