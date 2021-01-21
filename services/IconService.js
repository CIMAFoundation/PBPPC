(function(){
    var app = angular.module('galApp.services');

    app.service('IconService', function(DataService) {
        var service = this;
        this.icons = {};
        this.icon_defs = {};
        this.defaultIcon = {};
        
        this.init = function(){
            DataService
                .init()
                .then(function(){
                    console.log('icons loaded');

                    for(var cat_key in DataService.categories){
                        var cat = DataService.categories[cat_key];
                        for(var scat_key in cat.subcategories){
                            var scat = cat.subcategories[scat_key];
                            var icon = scat.map_icon;

                            if(icon!=null) {
                                var iconObject = L.AwesomeMarkers.icon({
                                    icon: icon.icon,
                                    prefix: icon.prefix,
                                    iconColor: icon.color,
                                    markerColor: icon.marker_color,
                                    extraClasses: icon.extra_classes,
                                });

                                service.icons[scat_key] = iconObject;
                                service.icon_defs[scat_key] = icon;
                            }
                        }
                    }
                }
            );
        };

        this.get = function(id){
            if(this.icons[id]){
                return this.icons[id];
            }else{
                return null;
            }
        };
        
        this.getAllIconDefs = function(){
           return this.icon_defs;  
        };

        this.init();

        return this;
    });
    



})();






