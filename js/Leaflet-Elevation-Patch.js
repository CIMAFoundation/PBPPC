/**
 * Created by mirkodandrea on 29/11/16.
 */
L.control.elevation = function(options){
    var ctrl = new L.Control.Elevation(options);

    ctrl.onAdd = function(map) {
        this._map = map;

        var opts = this.options;
        var margin = opts.margins;
        opts.xTicks = opts.xTicks || Math.round(this._width() / 75);
        opts.yTicks = opts.yTicks || Math.round(this._height() / 30);
        opts.hoverNumber.formatter = opts.hoverNumber.formatter || this._formatter;

        //append theme name on body
        d3.select("body").classed(opts.theme, true);

        var x = this._x = d3.scale.linear()
            .range([0, this._width()]);

        var y = this._y = d3.scale.linear()
            .range([this._height(), 0]);

        var area = this._area = d3.svg.area()
            .interpolate(opts.interpolation)
            .x(function(d) {
                var xDiagCoord = x(d.dist);
                d.xDiagCoord = xDiagCoord;
                return xDiagCoord;
            })
            .y0(this._height())
            .y1(function(d) {
                return y(d.altitude);
            });

        var container = this._container = L.DomUtil.create("div", "elevation");

        this._initToggle();

        var cont = d3.select(container);
        cont.attr("width", opts.width);
        var svg = cont.append("svg");
        svg.attr("width", opts.width)
            .attr("class", "background")
            .attr("height", opts.height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var line = d3.svg.line();
        line = line
            .x(function(d) {
                return d3.mouse(svg.select("g"))[0];
            })
            .y(function(d) {
                return this._height();
            });

        var g = d3.select(this._container).select("svg").select("g");

        this._areapath = g.append("path")
            .attr("class", "area");

        var background = this._background = g.append("rect")
            .attr("width", this._width())
            .attr("height", this._height())
            .style("fill", "none")
            .style("stroke", "none")
            .style("pointer-events", "all");

        background.on("touchmove.drag", this._dragHandler.bind(this)).
        on("touchstart.drag", this._dragStartHandler.bind(this)).
        on("touchstart.focus", this._mousemoveHandler.bind(this));
        L.DomEvent.on(this._container, 'touchend', this._dragEndHandler, this);

        background.on("mousemove.focus", this._mousemoveHandler.bind(this)).
        on("mouseout.focus", this._mouseoutHandler.bind(this)).
        on("mousedown.drag", this._dragStartHandler.bind(this)).
        on("mousemove.drag", this._dragHandler.bind(this));
        L.DomEvent.on(this._container, 'mouseup', this._dragEndHandler, this);

        this._xaxisgraphicnode = g.append("g");
        this._yaxisgraphicnode = g.append("g");
        this._appendXaxis(this._xaxisgraphicnode);
        this._appendYaxis(this._yaxisgraphicnode);

        var focusG = this._focusG = g.append("g");
        this._mousefocus = focusG.append('svg:line')
            .attr('class', 'mouse-focus-line')
            .attr('x2', '0')
            .attr('y2', '0')
            .attr('x1', '0')
            .attr('y1', '0');
        this._focuslabelX = focusG.append("svg:text")
            .style("pointer-events", "none")
            .attr("class", "mouse-focus-label-x");
        this._focuslabelY = focusG.append("svg:text")
            .style("pointer-events", "none")
            .attr("class", "mouse-focus-label-y");

        if (this._data) {
            this._applyData();
        }

        return container;
    };


    ctrl._mouseoutHandler = function() {
        //this._hidePositionMarker();
    };

    ctrl.onRemove = function(map) {
        this._hidePositionMarker();
        this._container = null;
    };

    /*
     * Handles mouseover events of the data layers on the map.
     */
    ctrl._handleLayerMouseOver = function(evt) {
        if (!this._data || this._data.length === 0) {
            return;
        }
        var latlng = evt.latlng;
        var item = this._findItemForLatLng(latlng);
        if (item) {
            var x = item.xDiagCoord;
            this._showDiagramIndicator(item, x);
        }

        var opts = this.options;

        var layerpoint = this._map.latLngToLayerPoint(item.latlng);
        var alt = item.altitude;
        var ll = item.latlng;
        var numY = opts.hoverNumber.formatter(alt, opts.hoverNumber.decimalsY);
        //var numX = opts.hoverNumber.formatter(dist, opts.hoverNumber.decimalsX);



        //if we use a height indicator we create one with SVG
        //otherwise we show a marker
        if (opts.useHeightIndicator) {

            if (!this._mouseHeightFocus) {

                var heightG = d3.select(".leaflet-overlay-pane svg")
                    .append("g");
                this._mouseHeightFocus = heightG.append('svg:line')
                    .attr('class', 'height-focus line')
                    .attr('x2', '0')
                    .attr('y2', '0')
                    .attr('x1', '0')
                    .attr('y1', '0');

                var pointG = this._pointG = heightG.append("g");
                pointG.append("svg:circle")
                    .attr("r", 6)
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("class", "height-focus circle-lower");

                this._mouseHeightFocusLabel = heightG.append("svg:text")
                    .attr("class", "height-focus-label")
                    .style("pointer-events", "none");

            }

            var normalizedAlt = this._height() / this._maxElevation * alt;
            var normalizedY = layerpoint.y - normalizedAlt;
            this._mouseHeightFocus.attr("x1", layerpoint.x)
                .attr("x2", layerpoint.x)
                .attr("y1", layerpoint.y)
                .attr("y2", normalizedY)
                .style("visibility", "visible");

            this._pointG.attr("transform", "translate(" + layerpoint.x + "," + layerpoint.y + ")")
                .style("visibility", "visible");

            this._mouseHeightFocusLabel.attr("x", layerpoint.x)
                .attr("y", normalizedY)
                .text(numY + " m")
                .style("visibility", "visible");

        } else {
            if (!this._marker) {
                this._marker = new L.Marker(ll).addTo(this._map);
            } else {
                this._marker.setLatLng(ll);
            }

        }
    };

    return ctrl;
};
