/**
 * Created by mirkodandrea on 16/05/16.
 */
'use strict';

(function(){
    var module = angular.module('galApp');

    module.component('mainView',{
        templateUrl:'components/main-view/mainView.html',
        bindings: {},
        controller: ['DataService', 'MapService', 'ProfilesService', 'screenSize', '$timeout', '$element', '$q',
            function(DataService, MapService, ProfilesService, screenSize, $timeout, $element, $q){
                var $ctrl = this;

                $ctrl.galleryOpen = false;
                $ctrl.fullscreenDetail = false;
                $ctrl.hiddenDetail = false;

                $ctrl.selectedCategory_key = null;
                $ctrl.selectedSubCategory_key = null;
                $ctrl.selectedEntry_key = null;
                $ctrl.entriesList = [];

                if (screenSize.is('xs, sm')) {
                    $element.addClass('mobile');
                    $ctrl.media = 'mobile';
                }else {
                    $element.addClass('desktop');
                    $ctrl.media = 'desktop';
                }

                screenSize.when(['xs', 'sm'], function() {
                    $element.removeClass('desktop');
                    $element.addClass('mobile');
                    $ctrl.media = 'mobile';
                });
                screenSize.when(['md', 'lg'], function() {
                    $element.removeClass('mobile');
                    $element.addClass('desktop');
                    $ctrl.media = 'desktop';
                });

                $ctrl.menuOpen = false;



                this.selectEntry = function(entry){
                    console.log('select', entry);
                    $ctrl.selectedEntry = null;
                    DataService.get(entry).then(function(obj){
                        $ctrl.selectedEntry = obj;
                    });
                };

                this.mouseInEntry = function(entry){
                    MapService.highlight(entry.card_id);
                };
                this.mouseOutEntry = function(entry){
                    MapService.unHighlight(entry.card_id);
                };

                this.selectSubCategory = function(subCategory_key){
                    DataService
                        .switchSubCategory($ctrl.selectedCategory_key, subCategory_key)
                        .then(function(){
                        $ctrl.entriesList = DataService.getAllSelectedEntries();
                    });
                };

                this.selectCategory = function(category_key){
                    $ctrl.selectedCategory_key = category_key;
                    if(category_key in $ctrl.data){
                        $ctrl.selectedCategory = $ctrl.data[category_key].subcategories;
                    }
                };

                this.someSelected = function(cat_key){
                    if($ctrl.data && cat_key in $ctrl.data) {
                        var some_selected = _.some(
                            $ctrl.data[cat_key].subcategories,
                            function(v){return v.selected;}
                        );
                        return some_selected;
                    }else {
                        return false;
                    }
                };

                this.switchCategory = function(cat_key){
                    if(cat_key in $ctrl.data){
                        var select = !$ctrl.someSelected(cat_key);
                        var promises = [];
                        for(var subcat_key in $ctrl.data[cat_key].subcategories){
                            var p = DataService.switchSubCategory(cat_key, subcat_key, select);
                            promises.push(p);
                        }
                    }
                    $q.all(promises).then(function(){
                        $ctrl.entriesList = DataService.getAllSelectedEntries();
                    });
                };

                this.closeDetail = function(){
                    console.log('closing detail');
                    MapService.unselectAll();
                    $ctrl.fullscreenDetail = false;
                    $ctrl.hiddenDetail = false;
                    $ctrl.selectedEntry = null;
                };

                this.$onChanges = function (changesObj) {
                    if (changesObj.galleryOpen) {
                        console.log('gallery open', $ctrl.galleryOpen);
                    }
                };

                this.$onInit = function(){
                    DataService
                        .init()
                        .then(function(){
                            console.log('categories', DataService.categories);
                        $ctrl.data = DataService.categories;


                        ProfilesService
                            .init()
                            .then(function(){
                                console.log('setting active profile categories on', ProfilesService.activeProfileObj);

                            var categories = ProfilesService.getCurrentProfileCategories();

                            // attiva tutte le sottocategorie se non ho selezionato nessun profilo
                            if(categories.length==0){
                                $timeout(function(){
                                    console.log('init');
                                    var categories = Object.keys($ctrl.data);
                                    var promises = categories.map(function(cat){
                                        return $ctrl.switchCategory(cat);
                                    });
                                    $q.all(promises).then(function(){
                                        $ctrl.entriesList = DataService.getAllSelectedEntries();
                                    });

                                }, 500);
                            }else{
                                var promises = categories.map(function(scat){
                                    return DataService.switchSubCategory(scat.category_id, scat.subcategory_id);
                                });
                                $q.all(promises).then(function(){
                                    $ctrl.entriesList = DataService.getAllSelectedEntries();
                                });

                            }

                        });

                    });
                };

            }]
    });
})();
