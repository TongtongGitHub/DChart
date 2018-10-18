/**
 * donut chat based on d3.js
 * author: liutongtong
 */
(function () {
    let _super = window.BaseDChart;

    function DCDonutChart(cf) {
        _super.call(this, cf); // call super constructor
        _super.prototype._initResize.call(this);
        this._init();
    }
    DCDonutChart.prototype = Object.create(_super.prototype);
    DCDonutChart.prototype.constructor = DCDonutChart;
    DCDonutChart.prototype = {
        _init: function () {
            _super.prototype._init.call(this);
            this.radius = Math.min(this.height, this.width * 0.5) / 2;
            this.minValue = 10;
            
            this.chart = d3.select(this.config.carrier).select('.dc-linechart-container')
            .attr("transform", "translate(" + (this.width / 2 + this.config.marginLeft) + "," + (this.height / 2 + this.config.marginTop) + ")")
            this._drawDonutChart();
            document.dispatchEvent(new CustomEvent('init'));
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
            // .outerRadius(this.radius * 0.8)
            // .innerRadius(this.radius * 0.6)
            // .cornerRadius(3)
            // .padAngle(0.015);

            let arcConfig = {
                innerRadius: this.radius * 0.5,
                outerRadius: this.radius * 0.8,
                cornerRadius: 3,
                padAngle: 0.015,
                startAngle: 0,
                endAngle: Math.PI * 2 * this.radius
            };

            let outerArc = d3.arc()
                .outerRadius(this.radius * 0.9)
                .innerRadius(this.radius * 0.8);

            let polyline = this.chart.selectAll(".dc-donutChart-polyline")
                .data(pie(this.config.data));

            polyline.enter()
                .append("polyline")
                .attr("class", "dc-donutChart-polyline")
                .attr("id", d => {
                    return "dc-donutChart-polyline" + d.data.id;
                })
                .attr("points", (d) => {
                    let pos = outerArc.centroid(d);
                    pos[0] = this.radius * 0.8 * (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI ? 1 : -1);
                    return [d3.arc()
                        .outerRadius(this.radius * 0.7)
                        .innerRadius(this.radius * 0.5)
                        .cornerRadius(3)
                        .padAngle(0.015).centroid(d), outerArc.centroid(d), pos
                    ]
                }).attr("stroke", (d, index) => {
                    return this.config.colors[index % this.config.colors.length];
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
                .data(pie(this.config.data))
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
                .attr("transform", (d) => {
                    let pos = outerArc.centroid(d);
                    pos[0] = this.radius * 0.85 * (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI ? 1 : -1);
                    return "translate(" + pos + ")";
                }).style("text-anchor", function (d) {
                    return (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI) ? 'start' : 'end';
                })
                .style("visibility", (d) => {
                    if (d.value >= this.minValue) {
                        return "visible"
                    } else {
                        return "hidden"
                    }
                })

            let slices = this.chart.selectAll('.dc-donutChart-slice')
                .data(pie(this.config.data))
                .enter()
                .append('path')
                .attr("class", "dc-donutChart-slice")
                .attr('fill', (d, index) => {
                    return this.config.colors[index % this.config.colors.length];
                })

            slices.transition().duration(_this.config.duration)
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
                    .transition().duration(_this.config.duration)
                    .attrTween("d", function (d) {
                        let i = d3.interpolate(_this.radius * 0.8, _this.radius * 0.85);
                        return (t) => {
                            d.outerRadius = i(t);
                            return arc(Object.assign({}, arcConfig, {
                                outerRadius: d.outerRadius,
                                startAngle: d.startAngle,
                                endAngle: d.endAngle
                            }));
                        };
                    })
                // if (d.value && d.value < this.minValue) {
                //     this.chart.selectAll(".dc-donutChart-polyline")
                //         .style("visibility", 'hidden')
                //         this.chart.selectAll(".dc-donutChart-label")
                //         .style("visibility", 'hidden')
                //     d3.select("#dc-donutChart-polyline" + d.data.id).style("visibility", "visible");
                //     d3.select("#dc-donutChart-label" + d.data.id).style("visibility", "visible");
                // }
            }).on("mouseout", function (d) {
                d3.select(this)
                    .transition().duration(_this.config.duration)
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
                if (d.value && d.value < this.minValue) {
                    this.chart.selectAll(".dc-donutChart-polyline")
                        .data(pie(this.config.data))
                        .style("visibility", (d) => {
                            if (d.value >= this.minValue) {
                                return "visible"
                            } else {
                                return "hidden"
                            }
                        })
                    this.chart.selectAll(".dc-donutChart-label")
                        .data(pie(this.config.data))
                        .style("visibility", (d) => {
                            if (d.value >= this.minValue) {
                                return "visible"
                            } else {
                                return "hidden"
                            }
                        })
                    d3.select("#dc-donutChart-polyline" + d.data.id).style("visibility", "hidden");
                    d3.select("#dc-donutChart-label" + d.data.id).style("visibility", "hidden");
                }
            }).on("mousemove", function (d) {
            });
        },
        update: function (data) {
            if (data) {
                this.config.data = data;
            }
            d3.select(this.carrier).select("svg").remove();
            d3.select(this.carrier).select(".dc-donutChart-tooltip").remove();
            this._init();

        }
    }

    window.DCDonutChart = DCDonutChart;
})()