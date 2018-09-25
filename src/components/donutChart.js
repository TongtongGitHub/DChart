/**
 * donut chat based on d3.js
 * author: liutongtong
 */
(function () {
    if (window.DCDonutChart) {
        return;
    }

    const defaultConfig = {
        carrier: "chart",
        colors: [],
        data: [],
        type: 1,
        showTooltip: false,
        minValue: 10,

        onClick: function () {},
        onMouseenter: function () {},
        onMouseout: function () {},
        onMousemove: function () {}
    };

    let isResize = false;

    function donutChart(cf) {
        this.config = Object.assign({}, defaultConfig, cf);
        this._init();
    }
    donutChart.prototype = {
        _init: function () {
            this._initData();

            //add svg element
            this.chart = d3.select("." + this.carrier).append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .append("g")
                .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")")
                .attr("class", "dc-donutChart-container");
            this._drawDonutChart();

            isResize ? "" : this._initResize();
        },
        _initData: function () {
            //init all private data
            this.data = this.config.data;
            this.colors = this.config.colors;
            this.carrier = this.config.carrier;
            this.type = this.config.type;
            this.width = document.getElementsByClassName(this.carrier)[0].getBoundingClientRect().width;
            this.height = document.getElementsByClassName(this.carrier)[0].getBoundingClientRect().height;
            this.radius = Math.min(this.height, this.width * 0.5) / 2;
            this.minValue = this.config.minValue;
        },
        _getTransition: function (duration, ease) {
            if (isResize) {
                return d3.transition().duration(0);
            }
            let t = d3.transition();
            if (duration) {
                t = t.duration(duration);
            }
            if (ease) {
                t = t.ease(ease);
            }
            return t;
        },
        _drawDonutChart: function () {
            let _this = this;
            //pie generator
            let pie = d3.pie()
                .value(d => {
                    return d.value
                })
                .sort(null);

            //arc generator
            let arc = d3.arc()
                // .outerRadius(_this.radius * 0.8)
                // .innerRadius(_this.radius * 0.6)
                // .cornerRadius(3)
                // .padAngle(0.015);
                
            let arcConfig = {
                innerRadius: _this.radius * 0.5,
                outerRadius: _this.radius * 0.8,
                cornerRadius: 3,
                padAngle: 0.015,
                startAngle: 0,
                endAngle: Math.PI * 2 * _this.radius
            };

            let outerArc = d3.arc()
                .outerRadius(this.radius * 0.9)
                .innerRadius(this.radius * 0.8);

                let polyline = this.chart.selectAll(".dc-donutChart-polyline")
                .data(pie(this.data));
    
            polyline.enter()
                .append("polyline")
                .attr("class", "dc-donutChart-polyline")
                .attr("id", d => {
                    return "dc-donutChart-polyline" + d.data.id;
                })
                .attr("points", function(d){
                    let pos = outerArc.centroid(d);
                    pos[0] = _this.radius * 0.8 * (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI ? 1 : -1);
                    return [d3.arc()
                        .outerRadius(_this.radius * 0.7)
                        .innerRadius(_this.radius * 0.5)
                        .cornerRadius(3)
                        .padAngle(0.015).centroid(d), outerArc.centroid(d), pos]
                }).attr("stroke", (d, index) => {
                    return this.colors[index%this.colors.length];
                }).attr("fill", "none")
                .attr("stroke-width", 1)
                .style("visibility", (d) => {
                    if (d.value >= this.minValue) {
                        return "visible"
                    } else {
                        return "hidden"
                    }
                })
                

            let label = this.chart.selectAll(".dc-donutChart-label")
                .data(pie(this.data))
            label.enter()
                .append("text")
                .attr("class", "dc-donutChart-label")
                .attr("id", d => {
                    return "dc-donutChart-label" + d.data.id;
                })
                .text(function (d) {
                    return d.data.name + ": " + d.value + "%";
                })
                .attr('dy', '5')
                .attr("transform", function (d) {
                    let pos = outerArc.centroid(d);
                    pos[0] = _this.radius * 0.85 * (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI ? 1 : -1);
                    return "translate(" + pos + ")";
                }).style("text-anchor", function (d) {
                    return (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI)? 'start' : 'end';
                })
                .style("visibility", (d) => {
                    if (d.value >= _this.minValue) {
                        return "visible"
                    } else {
                        return "hidden"
                    }
                })

            let slices = this.chart.selectAll('.dc-donutChart-slice')
                .data(pie(this.data))
                .enter()
                .append('path')
                .attr("class", "dc-donutChart-slice")
                .attr('fill', function (d, index) {
                    return _this.colors[index % _this.colors.length];
                })

            slices.transition(this._getTransition())
                .attrTween('d', function (d) {
                    let i = d3.interpolate(d.startAngle, d.endAngle);
                    return function (t) {
                        d.endAngle = i(t);
                        return arc(Object.assign({}, arcConfig, {
                            startAngle: d.startAngle,
                            endAngle: d.endAngle
                        }));
                    }
                })
            slices.on("mouseenter", function (d) {
                d3.select(this)
                    .transition(_this._getTransition())
                    .attrTween("d", function (d) {
                        let i = d3.interpolate(_this.radius * 0.8, _this.radius * 0.85);
                        return function (t) {
                            d.outerRadius = i(t);
                            return arc(Object.assign({}, arcConfig, {
                                outerRadius: d.outerRadius,
                                startAngle: d.startAngle,
                                endAngle: d.endAngle
                            }));
                        };
                    })
                if (d.value && d.value < _this.minValue) {
                    _this.chart.selectAll(".dc-donutChart-polyline")
                        .style("visibility", 'hidden')
                    _this.chart.selectAll(".dc-donutChart-label")
                        .style("visibility", 'hidden')
                    d3.select("#dc-donutChart-polyline" + d.data.id).style("visibility", "visible");
                    d3.select("#dc-donutChart-label" + d.data.id).style("visibility", "visible");
                }
                _this.config.onMouseenter(d);
            }).on("mouseout", function (d) {
                d3.select(this)
                    .transition(_this._getTransition())
                    .attrTween("d", function (d) {
                        let i = d3.interpolate(_this.radius * 0.85, _this.radius * 0.8);
                        return function (t) {
                            d.outerRadius = i(t);
                            return arc(Object.assign({}, arcConfig, {
                                outerRadius: d.outerRadius,
                                startAngle: d.startAngle,
                                endAngle: d.endAngle
                            }));
                        };
                    });
                    if (d.value && d.value < _this.minValue) {
                        _this.chart.selectAll(".dc-donutChart-polyline")
                            .data(pie(_this.data))
                            .style("visibility", (d) => {
                                if (d.value >= _this.minValue) {
                                    return "visible"
                                } else {
                                    return "hidden"
                                }
                            })
                        _this.chart.selectAll(".dc-donutChart-label")
                            .data(pie(_this.data))
                            .style("visibility", (d) => {
                                if (d.value >= _this.minValue) {
                                    return "visible"
                                } else {
                                    return "hidden"
                                }
                            })
                        d3.select("#dc-donutChart-polyline" + d.data.id).style("visibility", "hidden");
                        d3.select("#dc-donutChart-label" + d.data.id).style("visibility", "hidden");
                    }
                _this.config.onMouseout(d);
            }).on("mousemove", function (d) {
                _this.config.onMousemove(d);
            });
        },
        update: function (data) {
            if (data) {
                this.config.data = data;
            }
            d3.select("." + this.carrier).select("svg").remove();
            d3.select("." + this.carrier).select(".dc-donutChart-tooltip").remove();
            this._init();

        },
        _resize: function () {
            isResize = true;
            d3.select("." + this.carrier).select("svg").remove();
            d3.select("." + this.carrier).select(".dc-donutChart-tooltip").remove();
            this._init();
            isResize = false;
        },
        _initResize: function () {
            let _this = this;
            let resizeTimer = null;
            window.addEventListener('resize', function () {
                    clearTimeout(resizeTimer)
                    resizeTimer = setTimeout(() => {
                        _this._resize();
                    }, 500);
            })
        }
    }

    window.DCDonutChart = donutChart;
})()