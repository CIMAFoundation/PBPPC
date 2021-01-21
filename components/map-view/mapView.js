/**
 * Created by mirkodandrea on 17/05/16.
 */

'use strict';

(function(){
    var module = angular.module('galApp');

    module.component('mapView',{
        templateUrl:'components/map-view/mapView.html',
        bindings: {
            selectedEntry: '<',
            entries: '<',
            onSelectEntry: '&'
        },
        controller: function($timeout, MapService, DataService){
            var $ctrl = this;

            MapService.initMap();

            //MapService.addTracks();
            MapService.entryClickCallback = function(category, subcategory, entry_id){
                var element = DataService.getElementByCategory(category, subcategory, entry_id);
                $ctrl.onSelectEntry.apply(this)(element);
            };

            this.$onChanges = function (changesObj) {
                console.log('changes');
                if (changesObj.selectedEntry && changesObj.selectedEntry.currentValue) {
                    MapService.focusOn($ctrl.selectedEntry.card_id);
                }
                if (changesObj.entries && changesObj.entries.currentValue) {
                    MapService.updateEntries($ctrl.entries);
                }
            };

        }
    });
})();
