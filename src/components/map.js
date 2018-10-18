/**
 * 国家id名称编码 https://en.wikipedia.org/wiki/ISO_3166-1_numeric
 */
(function () {
    let _super = window.BaseDChart;

    function DCWorldMap(cf) {
        _super.call(this, Object.assign({},cf,{
            type: 1
        })); // call super constructor
        _super.prototype._initResize.call(this);
        this._init();
    }
    DCWorldMap.prototype = Object.create(_super.prototype)
    DCWorldMap.prototype.constructor = DCWorldMap;
    DCWorldMap.prototype = {
        _init: function () {
            _super.prototype._init.call(this);
            this.drawMap();
            document.dispatchEvent(new CustomEvent('init'));
        },
        drawMap: function () {
            let width = this.width;
            let height = this.height;
            let world, areas, projection, map, path;
            if (this.config.type == 1) {
                world = window.countriesMapJson;
                areas = topojson.feature(world, world.objects.countries).features;
                projection = d3.geoEquirectangular().fitSize([width, height], topojson.feature(world, world.objects.countries));
                path = d3.geoPath().projection(projection);
                map = this.chart.selectAll(".dc-map-country")
                    .data(areas)
                    .enter()
                    .insert("path", ".graticule")
                    .attr("class", "dc-map-country")
            } else {
                world = window.landsMapJson;
                areas = topojson.feature(world, world.objects.continent).features;
                projection = d3.geoEquirectangular().fitSize([width, height], topojson.feature(world, world.objects.continent));
                path = d3.geoPath().projection(projection);
                map = this.chart.selectAll(".dc-map-land")
                    .data(areas)
                    .enter()
                    .insert("path", ".graticule")
                    .attr("class", "dc-map-land")
            }
            let _this = this;
            let colorScale = d3.scaleLinear()
                .range([this.config.colors[0], this.config.colors[this.config.colors.length - 1]])
                .domain([0, this.config.data.length]);
            map.attr("d", path)
            .attr("id", d => {
                return this.config.carrier.slice(1) + d.id;
            })
            .attr("centralPos", d => {
                return path.centroid(d);
            })
            .attr("stroke", "#AAAEB3")
            .attr("fill", (d) => {
                for (let index = 0; index < this.config.data.length; index++) {
                    if (d.id == this.config.data[index].id) {
                        return colorScale(index);
                    }
                }
                return this.config.colors[this.config.colors.length - 1];
            })
            .on("mouseenter", d => {
                this._mouseEnter(d.id);
            })
            .on("mouseout", d => {
                this._mouseOut(d.id);
            })
        },
        _mouseEnter: function(id){
            let elem = d3.select("#" + this.config.carrier.slice(1) + id);
            if (elem.size() > 0) {
                this.tempColor = elem.attr("fill");
                d3.select("#" + this.config.carrier.slice(1) + id).attr("fill", "#FF7733")
                for (let index = 0; index < this.config.data.length; index++) {
                    if (id == this.config.data[index].id) {
                        let centralPos = elem.attr("centralPos");
                        d3.select(this.config.carrier).select(".dc-map-tooltip").text(this.config.data[index].name + '占比: ' + this.config.data[index].value + '%');
                        d3.select(this.config.carrier).select(".dc-map-tooltip")
                            .style("visibility", "visible")
                            .style("left", centralPos.split(",")[0] + "px")
                            .style("top", centralPos.split(",")[1] + "px")
                            .style("transform", "translate(-50%, -80%)");
                    }
                }
            }
        },
        _mouseOut: function(id) {
            d3.select("#" + this.config.carrier.slice(1) + id).attr("fill", this.tempColor);
            d3.select(this.config.carrier).select(".dc-map-tooltip")
                .style("visibility", "hidden");
        },
        update: function (data) {
            if (data) {
                this.config.data = data;
            }
            d3.select(this.config.carrier).select("svg").remove();
            this.init();

        },
        setCountry: function (item, show) {
            show ? this._mouseEnter(item.id) : this._mouseOut(item.id);
        },
        
    }

    window.DCWorldMap = DCWorldMap;
})()