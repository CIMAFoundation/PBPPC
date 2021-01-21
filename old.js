/**
 * Created by mirkodandrea on 28/10/16.
 */
function aaaa() {


    this.addLocationMarker = function (mapObject) {
        mapObject.locate({watch: true, enableHighAccuracy: true});
        var marker;

        function onLocationFound(e) {
            if (!marker) {
                var icon = L.divIcon({
                    className: 'css-icon',
                    html: '<div class="gps_ring"></div><div class="gps_marker"></div>',
                    iconSize: [22, 22]
                });
                marker = L.marker(
                    e.latlng, {
                        icon: icon,
                        zIndexOffset: 100000
                    }).addTo(mapObject);
            } else {
                marker.setLatLng(e.latlng);
            }
        }

        mapObject.on('locationfound', onLocationFound);
    };

    function test() {
        var legend = L.control({position: 'topleft'});
        var icons = IconService.getAllIconDefs();
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');


            angular.forEach(icons, function (icon) {
                div.innerHTML +=
                    '<i style="background:' + icon.markerColor + '"></i> ' +
                    icon.label + '<br>';
            });
            console.log('legend', div);
            return div;

        };
        legend.addTo(map);

        function whenClicked(e) {
            var prop = e.target.feature.properties;
            e.target.openPopup();
        }


        function style(feature, layer) {
        }


        var icon_layer = L.geoJson(DataService.all_poi(), {
            onEachFeature: function (feature, layer) {
                layer.on({
                    click: whenClicked
                });
            },
            pointToLayer: function (feature, latlng) {
                var prop = feature.properties;
                var marker = L.marker(latlng, {
                    // icon: IconService.getIcon('default')
                });

                var element = DataService
                    .getElementByCategory(
                        prop.category,
                        prop.subcategory,
                        prop.ext_id);
                if (element) {
                    marker.bindPopup('<div style="vert-align: middle;"><img style="max-width: 100px;" src="'
                        + element.image +
                        '"><br>'
                        + element.name +
                        '<div>');

                    marker.on('mouseover', function (e) {
                        this.openPopup();
                    });
                    marker.on('mouseout', function (e) {
                        this.closePopup();
                    });
                    marker.on('click', service.markerClickCallback);
                    return marker;
                }
            }
        });


        map.on('zoomend', function () {
            if (map.getZoom() > 0) {
                map.addLayer(icon_layer);
            } else {
                map.removeLayer(icon_layer);
            }
        });


        //service.addLocationMarker(map);
    }


    this.addTracks = function (map_id, tracks) {
        service.loaded_tracks = [];
        service.loaded_wpts = null;


        var defaultStyle = {
            fillColor: "green",
            weight: 4,
            opacity: 1,
            color: 'red',
            dashArray: '3',
            fillOpacity: 0.8
        };

        var hoverStyle = {
            weight: 8,
            color: 'red',
            dashArray: '',
            fillOpacity: 0.7
        };

        var selectedStyle = {
            weight: 4,
            color: 'green',
            dashArray: '',
            fillOpacity: 0.7
        };

        var hoverSectionStyle = {
            weight: 8,
            color: 'green',
            dashArray: '',
            fillOpacity: 0.7
        };

        leafletData.getMap(map_id).then(function (map) {
            var info = L.control();
            info.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info');
                this.update();
                return this._div;
            };

            info.update = function (props) {
                this._div.innerHTML = '<h4>Informazioni sulla sezione</h4>';
                for (var key in props) {
                    if (props.hasOwnProperty(key)) {
                        this._div.innerHTML += '<b>' + key + '</b>:' + props[key] + '<br />';
                    }
                }

            };

            info.addTo(map);


            angular.forEach(tracks,
                function (track) {
                    var c_track = track;
                    $http.get(track + '/track.geojson').then(function (res) {

                        var track_layer = L.geoJson(res.data, {
                                style: defaultStyle,
                                onEachFeature: function (feature, layer) {
                                    layer.on({
                                        click: function (e) {
                                            var props = e.target.feature.properties;
                                            console.log(props);
                                        },
                                        mouseover: function (e) {
                                            if (track_layer.selected) {
                                                var layer = e.target;
                                                info.update(layer.feature.properties);
                                                layer.setStyle(hoverSectionStyle);
                                            }
                                        },
                                        mouseout: function (e) {
                                            if (track_layer.selected) {
                                                layer.setStyle(selectedStyle);
                                                info.update(null);
                                            }
                                        }
                                    });
                                }
                            }
                        );
                        track_layer.on('mouseover', function (e) {
                            if (!track_layer.selected) {
                                var layer = e.target;
                                layer.setStyle(hoverStyle);
                            }
                        });
                        track_layer.on('mouseout', function (e) {
                            if (!track_layer.selected) {
                                var layer = e.target;
                                layer.setStyle(defaultStyle);
                            }
                        });

                        map.addLayer(track_layer);


                        track_layer.on('click', function (e) {
                            $http.get(c_track + '/wpts.geojson').then(function (res) {

                                angular.forEach(service.loaded_tracks, function (t) {
                                    t.selected = false;
                                    t.setStyle(defaultStyle);
                                });

                                track_layer.selected = true;
                                track_layer.setStyle(selectedStyle);

                                map.fitBounds(track_layer.getBounds());

                                var wpts_layer = L.geoJson(res.data, {
                                    onEachFeature: function (feature, layer) {
                                        layer.on({
                                            click: function (e) {
                                                var props = e.target.feature.properties;
                                                console.log(props);
                                            }
                                        });
                                    },
                                    pointToLayer: function (feature, latlng) {
                                        var marker = L.circleMarker(latlng, 3, {
                                            fillColor: 'red',
                                            fillOpacity: 1.0,
                                            color: 'red',
                                        });

                                        marker.setRadius(3);
                                        return marker;
                                    }
                                });

                                if (service.loaded_wpts) {
                                    map.removeLayer(service.loaded_wpts);
                                }

                                service.loaded_wpts = wpts_layer;

                                map.addLayer(wpts_layer);

                            });
                        });

                        service.loaded_tracks.push(track_layer);

                    });
                }
            );
        });
    }
}