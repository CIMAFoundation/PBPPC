(function(){
    var app = angular.module('galApp.services');

    var legend_json = "data/legenda_tratte.json";


    app.service('DataService', function($http, $q, $timeout) {
        this.media_server = 'http://portaletest.cimafoundation.org';
        //this.media_server = 'http://127.0.0.1:8000';

        //var server = 'http://127.0.0.1:8000';
        var server = 'http://portaletest.cimafoundation.org';
        var api_endpoint = server + '/portaleapi/gal_api/api/v1/';


        var service = this;

        this.server = server;
        this.categories = {};

        this.init = function(){
            var initPromise = $q.defer();

            var promise_legend =
                $http.get(legend_json)
                .then(function(res){
                    service.legend = res.data;
            });


            var cat_promise = this.getList().then(function(){
                console.log('DataService inizializzato');
                initPromise.resolve();
            });

            return initPromise.promise;
        };

        this.getLegend = function(type, value){
            if(type in service.legend) {
                return service.legend[type][value];
            }else{
                return undefined;
            }
        };

        this.getList = function() {
            var p = $q.defer();
            $http
                .get(api_endpoint + 'category/' + '?limit=0')
                .then(function (res) {
                    console.log(res.data);
                    res.data.objects.map(function (cat) {
                        service.categories[cat.category_id] = cat;
                        var scats = cat.subcategories;
                        cat.subcategories = {};
                        scats.map(function (scat) {
                            cat.subcategories[scat.subcategory_id] = scat;
                            cat.subcategories[scat.subcategory_id].cards = null;
                        });
                    });
                    p.resolve();

                });

            return p.promise;
        };

        this.loadCards = function(category_id, subcategory_id){
            var p = $q.defer();
            var s_cat = service.categories[category_id].subcategories[subcategory_id];
            if(s_cat.cards == null) {
                s_cat.cards = [];
                $http
                    .get(api_endpoint + 'card/' + '?subcategory=' + s_cat.id + '&limit=0')
                    .then(function (res) {
                        res.data.objects.map(function (card) {
                            service.categories[card.category_id]
                                .subcategories[card.subcategory_id]
                                .cards
                                .push(card);
                        });
                        p.resolve();
                    });
            }else{
                p.resolve()
            }
            return p.promise;
        };


        this.getElementByCategory = function(category, subcategory, id){
            var element;
            if(category in service.categories && subcategory in service.categories[category].subcategories) {
                element = service.categories[category].subcategories[subcategory]
                    .cards.find(function (v) {
                        return v.card_id == id
                    });
            }else{
                element = null;
            }
            return element;
        };

        this.get = function(element){
            var dataPromise = $q.defer();
            console.log(element);
            var httpPromise = $http.get(server + element.resource_uri);
            httpPromise.then(function(res){
                dataPromise.resolve(res.data);
            });
            return dataPromise.promise;
        };

        this.getAllSelectedEntries = function(){
            var cards = _.reduce(
                _.map(service.categories, function(cat) {
                    return _.reduce(
                        _.map(cat.subcategories, function(subcat){
                            return subcat.selected ? subcat.cards||[]:[];
                        }),function(a, b) {
                            return a.concat(b);
                        }, []
                    );
                }),
                function(a, b) {
                    return a.concat(b);
                }, []
            );
            return cards;
        };

        this.switchSubCategory = function(category, subcategory, status){
            var p = $q.defer();

            if(category in service.categories && subcategory in service.categories[category].subcategories) {
                var s_cat = service.categories[category].subcategories[subcategory];

                if (status!==undefined) {
                    var selected = Boolean(status);
                }else{
                    selected = !s_cat.selected;
                }

                if(selected){
                    service.loadCards(category, subcategory)
                        .then(function(){
                            s_cat.selected = selected;
                            var d = new Date();
                            s_cat.cards.forEach(function(card){
                                card.added_date = d;
                            });
                            p.resolve();
                    });
                }else{
                    $timeout(function(){
                        s_cat.selected = selected;
                        p.resolve();
                    });
                }
            }

            return p.promise;
        };

        this.getProfiles = function(){
            var p = $q.defer();
            $http
                .get(api_endpoint + 'profile/?limit=0')
                .then(function(response){
                    p.resolve(response.data.objects)
                });

            return p.promise;
        };

        this.getProfile = function(profileObj){
            var p = $q.defer();
            $http
                .get(api_endpoint + 'profile/' + profileObj.id + '/')
                .then(function(response){
                    p.resolve(response.data)
                });

            return p.promise;
        }

    });

})();






