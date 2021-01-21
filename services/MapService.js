var snakeSnakeItBaby = false;
var lineExtremities = false;

(function () {

    var defaultTrackStyle = {
        weight: 3,
        color: '#c33',
        opacity: 1.0
    };

    var hoverTrackStyle = {
        weight: 8,
        color: '#c33',
        opacity: 0.9
    };

    var selectedTrackStyle = {
        weight: 3,
        color: '#3c3',
        opacity: 0.9
    };

    var hoverSectionStyle = {
        weight: 8,
        color: '#3c3',
        opacity: 0.9,
    };


    var additionalLayers = [
       /* {
            "url":"data/maps/alta_via.geojson",
            "name":"Alta Via dei Monti Liguri",
            "style": {
                "color": "#ff7800",
                "weight": 3,
                "opacity": 0.65
            }
        },{
            "url":"data/maps/terre_alte.geojson",
            "name":"Terre Alte",
            "style": {
                "color": "#3568ff",
                "weight": 3,
                "opacity": 0.65
            }
        }*/
    ];

    var app = angular.module('galApp.services');

    function __closestInSegment(_map, latlng, pol) {
        var points = _.map(pol._layers,
            function (l) {
                var d = L.GeometryUtil.closest(_map, l, latlng);
                d.l = l;
                return d;
            });
        return _.minBy(points, 'distance');
    }

    var t_closestInSegment = _.throttle(__closestInSegment, 50);

    app.service('MapService', function ($http, $q, $timeout, DataService, IconService, $filter) {
        var service = this;
        //all used options are the default values
        var _elevation;
        var _info;
        var _map;

        service.entriesLayers = {};

        function __poiPopupContent(entry){
            var content = '<div class="poi-popup">' +
                '<h5 style="text-align: center">' + entry.name + '</h5>'+
                '</div>' +
                '<div class="poi-popup">' +
                '<img class="marker-img" src="' + $filter('djangoMedia')(entry.thumb) + '">' +
                '</div>';
            return content;
        }

        this.initMap = function (map_id) {
            _map = L.map('leaflet-map').setView([41.5932563, 12.3757401], 6.48);
            $timeout(function() {

                service.__addBaseLayers();
                service.__addTrackInfoCtrl();
                service.__addAdditionalLayers();

                _elevation = L.control.elevation({
                    position: "bottomleft",
                    theme: "gal-theme", //default: lime-theme
                    width: 400,
                    height: 130,
                    margins: {
                        top: 10,
                        right: 50,
                        bottom: 30,
                        left: 60
                    },
                    useHeightIndicator: true, //if false a marker is drawn at map position
                    interpolation: "linear", //see https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-area_interpolate
                    hoverNumber: {
                        decimalsX: 3, //decimals on distance (always in km)
                        decimalsY: 0, //deciamls on hehttps://www.npmjs.com/package/leaflet.coordinatesight (always in m)
                        formatter: undefined //custom formatter function may be injected
                    },
                });

                service.geosearch = new L.Control.GeoSearch({
                    provider: new L.GeoSearch.Provider.OpenStreetMap()
                }).addTo(_map);

                //richiama gli handler per gli eventi di zoom
                _map.on("zoomend", function (e) {
                    var z = _map.getZoom();
                    for (var key in service.entriesLayers) {
                        var layer = service.entriesLayers[key];
                        if(layer.zoomHandler){layer.zoomHandler(z);}
                    }
                });
            });

        };

        this.__addBaseLayers = function(){
            var openStreetMap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                edgeBufferTiles: 1
            });

            var osmBasic = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution:
                    '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
                maxZoom: 18,
                edgeBufferTiles: 1
            });

            var ocmCycle = L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {
                attribution:
                    '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors. Tiles courtesy of <a href="http://www.thunderforest.com/" target="_blank">Andy Allan</a>',
                maxZoom: 18,
                edgeBufferTiles: 1
            });

            var OpenTopoMap = L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                maxZoom: 17,
                attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            });

            var Thunderforest_Outdoors = L.tileLayer('http://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}', {
                attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                apikey: '<your apikey>'
            });

            var Esri_WorldTopoMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
            });

            var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            });

            var MtbMap = L.tileLayer('http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &amp; USGS'
            });

            var baseLayers = {
                "OpenStreetMap": openStreetMap,
                "OpenStreetMap Basic": osmBasic,
                "Cycle Map": ocmCycle,
                "OpenTopoMap":OpenTopoMap,
                "Thunderforest Outdoors": Thunderforest_Outdoors,
                "Esri WorldTopoMap": Esri_WorldTopoMap,
                "Esri WorldImagery": Esri_WorldImagery,
                "MtbMap": MtbMap
            };

            var layersControl = L.control.layers(
                baseLayers, {},{
                    position: 'topright'
                }
            );
            layersControl.addTo(_map);
            _map.addLayer(openStreetMap);
        };

        this.__addTrackInfoCtrl = function(){
            /** info sezione **/

            _info = L.control({
                position: "bottomleft"
            });
            _info.onAdd = function () {
                this._container = L.DomUtil.create('div', 'gal-section-info');


                var _buttonHide = L.DomUtil.create('button', '', this._container);
                _buttonHide.onclick = function(){
                    console.log('click');
                    service.hideShowInfoBox();
                };

                L.DomUtil
                    .create('h4', '', this._container)
                    .textContent = 'Informazioni sulla sezione';

                this._div = L.DomUtil.create('div', '', this._container);
                this.update();
                return this._container;
            };

            _info.update = function (props) {
                this._div.innerHTML = '';

                for (var key in props) {
                    if (props.hasOwnProperty(key)) {
                        var legend_string = DataService.getLegend(key, props[key]);
                        if(legend_string) {
                            this._div.innerHTML += '<b>' + key + '</b>:' + legend_string + '<br />';
                        }
                    }
                }

            };
        };

        this.__addAdditionalLayers = function(){
          console.log('adding additional layers');
          angular.forEach(additionalLayers, function(layer){
              $http.get(layer.url).then(function (res) {
                  var geojson = L.geoJSON(res.data, {
                      style: layer.style
                  });
                  geojson.bindPopup(function(){
                    return layer.name;
                  });

                  _map.addLayer(geojson);
              });
          });

        };

        this.entryClickCallback = function (entry_id) {
            console.log(entry_id);
        };

        this.hideShowInfoBox = function(){
            var hide_class = 'hide-info';
            console.log('click');
            if(L.DomUtil.hasClass(_info._container, hide_class)){
                L.DomUtil.removeClass(_info._container, hide_class);
                L.DomUtil.removeClass(_elevation._container, hide_class);
            }else{
                L.DomUtil.addClass(_info._container, hide_class);
                L.DomUtil.addClass(_elevation._container, hide_class);
            }
        };

        this.addEntry = function (entry, layer) {
            _map.addLayer(layer);
            service.entriesLayers[entry.card_id] = layer;
            layer.on('click', function(e){
                console.log('click', entry);
                layer.clicked = true;
                service.entryClickCallback(entry.category_id, entry.subcategory_id, entry.card_id);
            });
        };

        this.removeEntry = function (entry_id) {
            var layer = service.entriesLayers[entry_id];
            _map.removeLayer(layer);
            delete service.entriesLayers[entry_id];
        };

        this.updateEntries = function (entries) {
            for (var key in service.entriesLayers) {
                var elem = _.find(entries, function (e) {
                    return e.card_id == key;
                });
                if (elem === undefined) {
                    service.removeEntry(key);
                }
            }

            angular.forEach(entries, function (entry) {
                if (!(entry.card_id in service.entriesLayers)) {
                    var geoinfo = entry.geoinfo[0];

                    console.log(geoinfo);
                    if (geoinfo) {
                        switch (geoinfo.type) {
                            case 'point':
                                var s_coords = geoinfo.coords;
                                var coords = s_coords.split(',').map(function (s) {
                                    return parseFloat(s)
                                });
                                service
                                    .addPoint(coords, entry)
                                    .then(function (point_layer) {
                                        service.addEntry(entry, point_layer);
                                    });

                                break;
                            case 'track':
                                var track_url = geoinfo.track;
                                var waypoints_url = geoinfo.waypoints;
                                if (track_url && waypoints_url) {
                                    track_url = $filter('djangoMedia')(track_url);
                                    waypoints_url = $filter('djangoMedia')(waypoints_url);

                                    service
                                        .addTrack(track_url, waypoints_url, entry)
                                        .then(function (track_layers) {
                                            service.addEntry(entry, track_layers);
                                        });
                                }
                                break;
                            case 'shape':
                                //console.log('shape', entry);
                                break;
                            default:

                            //console.log('without type', entry);
                        }
                    }
                }
            });
        };

        this.locateOutsideMap = function(latlng){
            var point = _map.latLngToContainerPoint(latlng);
            var center = _map.latLngToContainerPoint(_map.getCenter());

            var size = _map.getSize();
            var d = point.subtract(center);

            var angle = Math.atan2(point.y-center.y, point.x-center.x);

            var rx = Math.abs(size.x / d.x)/2;
            var ry = Math.abs(size.y / d.y)/2;


            var px, py;
            if(rx<ry){
                py = rx * d.y;
                px = Math.sign(d.x)*(size.x/2);
            }else if(ry<rx){
                px = ry * d.x;
                py = Math.sign(d.y)*(size.y/2);
            }else{
                px = Math.sign(d.x)*(size.x/2);
                py = Math.sign(d.y)*(size.y/2);
            }

            px -= Math.sign(d.x) * 80;
            py -= Math.sign(d.y) * 80;

            var icon = new L.divIcon({
                className : "arrowIcon",
                iconSize: new L.Point(80,80),
                iconAnchor: new L.Point(40,40),
                html : "<div class='animated' " +
                "style='width:130px;" +
                "height:130px; " +
                "font-size: 80px; " +
                "font-weight: bolder;" +
                "line-height: 0.7; " +
                // "color:red; " +
                // "text-shadow: 0px 0px 5px black;" +
                "transform: rotate("+ angle*57.295779513082 +"deg);'" +
                ">&rarr;</div>"
            });

            var point = L.point([
                center.x+px,
                center.y+py
            ]);

            var pos = _map.containerPointToLatLng(point);
            var arrow = L.marker(pos, {icon: icon});
            arrow.addTo(_map);
            return arrow;
        };

        this.addPoint = function (coords, entry) {
            var pointPromise = $q.defer();

            $timeout(function () {
                var icon = IconService.get(entry.subcategory_id);
                if(icon) {
                    var marker = L.marker(coords, {
                        bounceOnAdd: true,
                        bounceOnAddOptions: {duration: 300, height: 80},
                        icon: icon,
                        riseOnHover: true
                    });
                }else{
                    var marker = L.marker(coords, {
                        bounceOnAdd: true,
                        bounceOnAddOptions: {duration: 300, height: 80},
                        riseOnHover: true
                    });
                }

                marker.bindPopup(
                    __poiPopupContent(entry),{
                        offset: L.point(0, -10),
                        closeButton:false
                    }
                );
                marker.on('mouseover', function (e) {
                    this.openPopup();
                });
                marker.on('mouseout', function (e) {
                    this.closePopup();
                });

                marker.on('touch', function (e) {
                    this.openPopup();
                });

                var arrow;
                marker.highlight = function(){
                    _map.closePopup();
                    if(_map.getBounds().contains(marker.getLatLng())) {
                        marker.setZIndexOffset(1000);
                        marker.bounce({duration: 300, height: 30}, function () {
                            marker.openPopup();
                        });
                    }else{
                        arrow = service.locateOutsideMap(marker.getLatLng());
                    }
                };

                marker.unHighlight = function(){
                    marker.setZIndexOffset(0);
                    marker.closePopup();
                    if(arrow){
                        _map.removeLayer(arrow);
                    }
                };


                pointPromise.resolve(marker);
            }, Math.random()*200);

            return pointPromise.promise;
        };

        this.__createTrack = function(data, track_url, waypoints_url, entry){
            var track_layers_group = L.layerGroup();
            track_layers_group.selected = false;

            var wpts_layer;
            var track_layer;
            var track_layer_touch;

            var track_layer_detail;
            var track_layer_detail_touch;

            track_layer = L.geoJson(data, {
                    style: defaultTrackStyle,
                    smoothFactor:2
                }
            );

            track_layer_touch = L.path.touchHelper(track_layer);


            track_layer.addEventParent(track_layers_group);

            track_layer_detail = L.geoJson(data, {
                snakingSpeed: 3000
            });

            track_layer_detail_touch = L.path.touchHelper(track_layer_detail, {extraWeight: 50});

            if(lineExtremities) {
                track_layer_detail.showExtremities('dotL');
            }

            track_layer.on('click', function (e) {
                service.focusOn(entry.card_id);
                track_layers_group.fire('click', e);
            });


            var circle_marker;
            track_layers_group.select = function(){
                track_layers_group.selected = true;
                track_layers_group.removeLayer(track_layer);
                track_layers_group.removeLayer(track_layer_touch);
                track_layers_group.addLayer(track_layer_detail);
                track_layers_group.addLayer(track_layer_detail_touch);

                //circle_marker = L.marker([0,0],{interactive:false});//L.circleMarker([0, 0], {radius: 5, fillColor: 'white', fillOpacity: 1, interactive:false});
                //track_layers_group.addLayer(circle_marker);

                track_layer_detail.on('mouseover mousemove', function (e) {
                    var p = t_closestInSegment(_map, e.latlng, track_layer_detail);
                    //circle_marker.setLatLng([p.lat, p.lng]);
                    if(_elevation._marker){_elevation._marker.setLatLng([p.lat, p.lng])}
                    _elevation._handleLayerMouseOver(e);

                    track_layer_detail.eachLayer(function(layer){
                        layer.setStyle(selectedTrackStyle);
                    });

                    var layer = p.l;
                    _info.update(layer.feature.properties);
                    layer.setStyle(hoverSectionStyle);
                });



                // Applies selection and track info to the first section of the track
                $timeout(function(){
                    var layer = _.values(track_layer_detail._layers)[0];
                    _info.update(layer.feature.properties);
                    layer.setStyle(hoverSectionStyle);
                });


                track_layer_detail.setStyle(selectedTrackStyle);

                _elevation.clear();
                track_layer_detail.eachLayer(function(layer){
                    _elevation.addData.bind(_elevation)(layer.feature, layer);
                });

                console.log('getting waypoints');
                $http.get(waypoints_url).then(function (res) {
                    wpts_layer = L.geoJson(res.data, {
                        pointToLayer: function (feature, latlng) {
                            var marker = L.circleMarker(latlng, 3, {});
                            var props = feature.properties;

                            var markerHTML = "";
                            for (var key in props) {
                                if (props.hasOwnProperty(key)) {
                                    var legend_string = DataService.getLegend(key, props[key]);
                                    if(legend_string) {
                                        markerHTML += '<b>' + key + '</b>:' + legend_string + '<br />';
                                    }
                                }
                            }
                            marker.bindPopup(markerHTML, {
                                closeButton:false
                            });

                            marker.on('mouseover', function (e) {
                                marker.openPopup();
                            });
                            marker.on('mouseout', function (e) {
                                marker.closePopup();
                            });

                            marker.setRadius(3.0);
                            return marker;
                        }
                    });
                    track_layers_group.addLayer(wpts_layer);
                });

                $timeout(function(){
                    if(snakeSnakeItBaby) {
                        track_layer_detail.snakeIn();
                    }
                }, 0);
            };

            track_layers_group.unselect = function(){
                track_layers_group.selected = false;
                track_layers_group.removeLayer(track_layer_detail);
                track_layers_group.removeLayer(track_layer_detail_touch);
                if(circle_marker) {
                    track_layers_group.removeLayer(circle_marker);
                }
                track_layers_group.addLayer(track_layer);
                track_layers_group.addLayer(track_layer_touch);
                track_layer.setStyle(defaultTrackStyle);

                if(wpts_layer!=null) {
                    track_layers_group.removeLayer(wpts_layer);
                    wpts_layer = null;
                }
                if(_elevation) {
                    _elevation.remove();
                }
                if(_info){
                    _info.remove();
                }
            };

            var popup = L.popup({
                    offset: L.point(0, -10),
                    closeButton:false
                })
                .setContent(__poiPopupContent(entry));


            track_layer.on('mousemove', function(e){
                popup.setLatLng(e.latlng);
            });

            track_layer.on('mouseover', function (e) {
                track_layer.openPopup();
                popup.setLatLng(e.latlng);
                popup.openOn(_map);
                track_layers_group.highlight();
            });
            track_layer.on('mouseout', function (e) {
                _map.closePopup();
                track_layers_group.unHighlight();
            });

            track_layers_group.zoomHandler = function(z){
                if(track_layers_group.selected){}
            };
            track_layers_group.addLayer(track_layer);
            track_layers_group.addLayer(track_layer_touch);

            var arrow;
            track_layers_group.highlight = function(){
                if(!track_layers_group.selected) {
                    if(_map.getBounds().intersects(track_layer.getBounds())) {
                        track_layer.setStyle(hoverTrackStyle);
                    }else{
                        arrow = service.locateOutsideMap(track_layer.getBounds().getCenter());
                    }
                }
            };
            track_layers_group.unHighlight = function(){
                if(!track_layers_group.selected) {
                    track_layer.setStyle(defaultTrackStyle);
                    if(arrow){
                        _map.removeLayer(arrow);
                    }
                }
            };

            return track_layers_group;
        };

        this.addTrack = function (track_url, waypoints_url, entry) {
            var trackPromise = $q.defer();
            $http.get(track_url).then(function (res) {
                var track_layers_group = service.__createTrack(res.data, track_url, waypoints_url, entry);
                track_layers_group.addTo(_map);
                trackPromise.resolve(track_layers_group);
            });
            return trackPromise.promise;
        };

        this.unselectAll = function(){
            for (var key in service.entriesLayers) {
                var layer = service.entriesLayers[key];
                layer.unselect?layer.unselect():null;
            }
        };

        this.focusOn = function(entry_id){
            service.unselectAll();

            if(entry_id in service.entriesLayers) {
                var layer = service.entriesLayers[entry_id];

                layer.select?layer.select():null;

                if (layer instanceof L.Marker){
                    if (_elevation) {
                        _elevation.remove();
                    }

                    if(layer.clicked){
                        layer.clicked = false;
                    }else {
                        layer.bounce({duration: 1000, height: 100}, function () {
                            layer.openPopup();
                        });
                    }
                    _map.panTo(layer.getLatLng());

                }else{
                    _elevation.addTo(_map);
                    _info.addTo(_map);
                    var layers = layer.getLayers();
                    var l = layers[0];

                    _map.fitBounds(l.getBounds());
                }
            }
        };

        this.highlight = function(entry_id){
            if(entry_id in service.entriesLayers) {
                var layer = service.entriesLayers[entry_id];
                layer.highlight();
            }
        };

        this.unHighlight = function(entry_id){
            if(entry_id in service.entriesLayers) {
                var layer = service.entriesLayers[entry_id];
                layer.unHighlight();
            }
        }

    });
})();

