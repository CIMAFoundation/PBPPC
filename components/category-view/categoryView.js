/**
 * Created by mirkodandrea on 17/05/16.
 */
'use strict';

(function(){
    var module = angular.module('galApp');

    module.component('categoryView',{
        templateUrl:'components/category-view/categoryView.html',
        bindings: {
            categories: "<",
            onSelect: "&"
        },
        controller: function(){
            var $ctrl = this;

            this.selectCategory = function(subcategory_key){
                $ctrl.selectedCategory = subcategory_key;
                $ctrl.onSelect.apply(this)(subcategory_key);
            };

        }
    });
})();
