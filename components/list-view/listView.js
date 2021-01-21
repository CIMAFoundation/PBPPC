/**
 * Created by mirkodandrea on 17/05/16.
 */

(function(){
    var module = angular.module('galApp');

    module.component('listView',{
        templateUrl:'components/list-view/listView.html',
        bindings: {
            entries: "<",
            onSelect: '&',
            onMouseIn: '&',
            onMouseOut: '&'
        },
        controller: function(){
            var $ctrl = this;
            this.selectEntry = function(entry){
                $ctrl.onSelect.apply(this)(entry);
            };

            this.mouseInEntry = function(entry){
                $ctrl.onMouseIn.apply(this)(entry);
            };

            this.mouseOutEntry = function(entry){
                $ctrl.onMouseOut.apply(this)(entry);
            };

            /*
            this.$onChanges = function (changesObj) {
                if (changesObj.entries) {
                    console.log($ctrl.entries);
                }
            };
            */
        }
    });
})();
