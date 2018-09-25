/**
 * 国家id名称编码 https://en.wikipedia.org/wiki/ISO_3166-1_numeric
 */
(function () {
    if (window.DCWorldMap) {
        return;
    }

    const defaultConfig = {
        carrier: "chart",
        colors: [],
        data: [],
        type: 1, // 1: country, 2: Continent

        width: "100%",
        height: "100%",

        onClick: function () {},
        onMouseenter: function () {},
        onMouseout: function () {},
        onMousemove: function () {}
    };

    let isResize = false;

    function worldMap(cf) {
        this.config = Object.assign({}, defaultConfig, cf);
        this.init();
    }
    worldMap.prototype = {
        init: function () {
            this.initData();

            //add svg element
            this.chart = d3.select("." + this.carrier).append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .append("g")
                .attr("class", "dc-map-container");
            this.drawMap();

            isResize ? "" : this.initResize();
        },
        initData: function () {
            //init all private data
            this.data = this.config.data;
            this.colors = this.config.colors;
            this.carrier = this.config.carrier;
            this.type = this.config.type;
        },
        drawMap: function () {
            let width = document.getElementsByClassName(this.carrier)[0].getBoundingClientRect().width;
            let height = document.getElementsByClassName(this.carrier)[0].getBoundingClientRect().height;
            let world, areas, projection, map, path;
            if (this.type == 1) {
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
                .range([this.colors[0], this.colors[this.colors.length - 1]])
                .domain([0, this.data.length]);
            map.attr("d", path)
            .attr("id", d => {
                return this.carrier + d.id;
            })
            .attr("centralPos", d => {
                return path.centroid(d);
            })
            .attr("stroke", "#AAAEB3")
            .attr("fill", (d) => {
                for (let index = 0; index < this.data.length; index++) {
                    if (d.id == this.data[index].id) {
                        return colorScale(index);
                    }
                }
                return this.colors[this.colors.length - 1];
            })
            .on("mouseenter", d => {
                this._mouseEnter(d.id);
            })
            .on("mouseout", d => {
                this._mouseOut(d.id);
            })
        },
        _mouseEnter: function(id){
            let elem = d3.select("#" + this.carrier + id);
            if (elem.size() > 0) {
                this.tempColor = elem.attr("fill");
                d3.select("#" + this.carrier + id).attr("fill", "#FF7733")
                for (let index = 0; index < this.data.length; index++) {
                    if (id == this.data[index].id) {
                        let centralPos = elem.attr("centralPos");
                        d3.select("." + this.carrier).select(".dc-map-tooltip").text(this.data[index].name + '占比: ' + this.data[index].value + '%');
                        d3.select("." + this.carrier).select(".dc-map-tooltip")
                            .style("visibility", "visible")
                            .style("left", centralPos.split(",")[0] + "px")
                            .style("top", centralPos.split(",")[1] + "px")
                            .style("transform", "translate(-50%, -80%)");
                    }
                }
            }
            this.config.onMouseenter(id);
        },
        _mouseOut: function(id) {
            d3.select("#" + this.carrier + id).attr("fill", this.tempColor);
            d3.select("." + this.carrier).select(".dc-map-tooltip")
                .style("visibility", "hidden");
            this.config.onMouseout(id);
        },
        update: function (data) {
            if (data) {
                this.config.data = data;
            }
            d3.select("." + this.carrier).select("svg").remove();
            this.init();

        },
        _resize: function () {
            isResize = true;
            d3.select("." + this.carrier).select("svg").remove();
            // d3.select("." + this.carrier).select(".dc-linechart-tooltip").remove();
            this.init();
            isResize = false;
        },
        initResize: function () {
            let _this = this;
            let resizeTimer = null;
            window.addEventListener('resize', function () {
                if (resizeTimer) {
                    clearTimeout(resizeTimer)
                }
                resizeTimer = setTimeout(() => {
                    _this._resize();
                }, 500);
            })
        },
        setCountry: function (item, show) {
            show ? this._mouseEnter(item.id) : this._mouseOut(item.id);
        },
        
    }

    window.DCWorldMap = worldMap;
})()