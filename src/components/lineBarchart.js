/**
 * dchart.lineBarChart base on D3.js
 * author: liutongtong
 * date: 2018-04-10
 */

import * as d3 from 'd3'

const defaultConfig = {
    carrier: "chart",
    colors: ['#5BC0EB', '#FDE74C', '#9BC53D', '#E55934', '#FA7921'], // default color set
    data: null,
    trigger: "hover", //hover click
    autoShowTooltip: false,
    radio: 0.5,
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 80,
    marginRight: 80,

    tickSize: 6,
    aniDuration: 500,
    xAxisTick: 5, //x axis density
    yAxisTick: 5, //y axis density
    legends: null,
    onClick: function () {},
    onMousemove: function () {}
};

const gridColor = "#C5CACF";
let isResize = false;

function lineBarchart(cf) {
    this.config = Object.assign({}, defaultConfig, cf);
    this._init();
}
lineBarchart.prototype = {
    _init: function () {
        this._initData();

        //add svg element
        this.chart = d3.select("." + this.carrier).append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .append("g")
            .attr("class", "dc-lineBarChart-container")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this._drawGraph(); //draw graph with data
        isResize ? "" : this._initResize();
    },
    _initData() {
        //init all private data
        this.data = this.config.data;
        this.legends = this.config.legends;
        this.colors = this.config.colors;
        this.carrier = this.config.carrier;
        this.duration = this.config.aniDuration;
        this.event = this.config.event;
        this.margin = {
            top: this.config.marginTop,
            right: this.config.marginRight,
            bottom: this.config.marginBottom,
            left: this.config.marginLeft
        };
        this.width = document.getElementsByClassName(this.carrier)[0].offsetWidth - this.margin.left - this.margin.right;
        this.height = document.getElementsByClassName(this.carrier)[0].offsetHeight - this.margin.top - this.margin.bottom;
        this.radio = this.width / this.height;
        this.trigger = this.config.trigger;
        this.autoShowTooltip = this.config.autoShowTooltip;

        this.color = d3.scaleOrdinal()
            .range(this.colors);
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
    _initAxis() {
        //init scale for axis
        this.x1 = d3.scaleTime()
            .range([0, this.width]);
        this.x2 = d3.scaleBand()
            .range([0, this.width])
            .paddingInner(0.5)

        this.y1 = d3.scaleLinear()
            .rangeRound([this.height, 0]);
        this.y2 = d3.scaleLinear()
            .rangeRound([this.height, 0]);

        //create axis
        this.xAxis = d3.axisBottom(this.x1)
            .tickFormat(d3.timeFormat("%H:00"))
            .ticks(d3.timeHour.every(1))
            .tickSize(this.height);
        this.yAxis1 = d3.axisLeft(this.y1)
            .ticks(this.config.tickSize)
            .tickSize(this.width);
        this.yAxis2 = d3.axisRight(this.y2)
            .ticks(this.config.tickSize)
            .tickSize(0);

        //add x axis
        this.chart.append("g")
            .attr("class", "dc-lineBarChart-xAxis");
        //add y axis
        this.chart.append("g")
            .attr("class", "dc-lineBarChart-yAxis dc-lineBarChart-yAxis1")
            .attr("transform", "translate(" + this.width + ", 0)");
        this.chart.append("g")
            .attr("class", "dc-lineBarChart-yAxis dc-lineBarChart-yAxis2")
            .attr("transform", "translate(" + this.width + ", 0)");

        //add text for axis
        this.chart.append("text")
            .attr("class", "dc-lineBarChart-axis-title1")
            .attr("x", -10)
            .attr("y", -20)
            .style("text-anchor", "end")
            .text(this.data.yAxis[0].name)
        this.chart.append("text")
            .attr("class", "dc-lineBarChart-axis-title2")
            .attr("x", 10)
            .attr("y", -20)
            .style("text-anchor", "start")
            .attr("transform", "translate(" + this.width + ", " + 0 + ")")
            .text(this.data.yAxis[1].name)
        this.chart.append("text")
            .attr("class", "dc-lineBarChart-axis-title")
            .attr("x", 22)
            .attr("y", 22)
            .attr("transform", "translate(" + this.width + ", " + this.height + ")")
            .style("text-anchor", "start")
            .text(this.data.xAxis.name);
    },
    _setAxisData() {
        //set scale domain
        this.parseDate = d3.timeParse("%Y-%m-%d");
        this.x1.domain([this.parseDate(this.data.xAxis.values[0]), this.parseDate(this.data.xAxis.values[this.data.xAxis.values.length - 1])])
        this.x2.domain(d3.timeHour.range(this.parseDate(this.data.xAxis.values[0]), this.parseDate(this.data.xAxis.values[1])))
        // .nice();
        let maxY1 = d3.max(this.data.yAxis[0].values, function (d) {
            return d3.max(d.values, function (d) {
                return d;
            });
        })
        this.y1.domain([0, maxY1 == 0 ? 10 : maxY1])
            .nice(this.config.tickSize);
        let maxY2 = d3.max(this.data.yAxis[1].values, function (d) {
            return d3.max(d.values, function (d) {
                return d;
            });
        })
        this.y2.domain([0, maxY2 == 0 ? 10 : maxY2])
            .nice(this.config.tickSize);
        //set axis and animation
        this.chart.select(".dc-lineBarChart-xAxis")
            .transition(this._getTransition(this.duration))
            .call((g) => {
                g.call(this.xAxis)
                    .selectAll("text")
                    .attr("y", this.height + 15);
            });
        this.chart.select(".dc-lineBarChart-yAxis1")
            .transition(this._getTransition(this.duration))
            .call((g) => {
                g.call(this.yAxis1)
                    .selectAll("text")
                    .attr("x", -15 - this.width);
            });
        this.chart.select(".dc-lineBarChart-yAxis2")
            .transition(this._getTransition(this.duration))
            .call((g) => {
                g.call(this.yAxis2)
                    .selectAll("text")
                    .attr("x", 15);
            });
    },
    _initTooltip() {
        //select tooltip
        this.tooltip = d3.select("." + this.carrier)
            .append("div")
            .attr("class", "dc-lineBarChart-tooltip")
            .style("top", this.height / 2 + "px")
            .style("left", this.width);

        this.tooltip.append("div")
            .attr("class", "dc-lineBarChart-tooltip-title");
        let row = this.tooltip.selectAll(".dc-lineBarChart-tooltip-row")
            .data(this.data.yAxis)
            .enter()
            .append("div")
            .attr("class", "dc-lineBarChart-tooltip-row");
        row.append("div")
            .attr("class", "dc-lineBarChart-tooltip-icon")
        row.append("div")
            .attr("class", "dc-lineBarChart-tooltip-name")
        row.append("div")
            .attr("class", "dc-lineBarChart-tooltip-value")

        //draw background
        this.chart.append("rect")
            .attr("class", "dc-lineBarChart-bg")
            .attr("width", this.x2.bandwidth() * 2)
            .attr("height", this.height)
        if (this.autoShowTooltip) {
            setTimeout(() => {
                this.setTooltipData(23, this.width - this.x2.bandwidth() * 2, "23:00 - 00:00");
            }, isResize ? 0 : 2000);
        }
    },
    _setLineData() {
        this.parseHour = d3.timeParse("%H");
        let line = d3.line()
            .defined((d) => {
                return d != null;
            })
            .x((d, index) => {
                return this.x1(d3.timeHour.offset(this.parseDate(this.data.xAxis.values[0]), index))
            })
            .y((d) => {
                return this.y1(d);
            });

        let lines = this.chart.selectAll(".dc-lineBarChart-line")
            .data(this.data.yAxis[0].values);

        lines.enter()
            .append("g")
            .attr("class", "dc-lineBarChart-line")
            .attr("transform", "translate(" + this.x2.bandwidth() + ", 0)")
            .append("path")
            .attr("d", (d) => {
                return line(d.values);
            }).attr("stroke", (d, index) => {
                return this.color(index);
            })
            .attr("fill", "none")
            .attr("stroke-dasharray", function (d) {
                return this.getTotalLength()
            })
            .attr("stroke-dashoffset", function (d) {
                return this.getTotalLength()
            })
            .transition(this._getTransition(this.duration * 4))
            .attr("stroke-dashoffset", 0);

        lines.select("path")
            .attr("d", (d) => {
                return line(d.values);
            }).attr("stroke", (d, index) => {
                return this.color(index);
            })
            .attr("fill", "none")
            .attr("stroke-dasharray", function (d) {
                return this.getTotalLength()
            })
            .attr("stroke-dashoffset", function (d) {
                return this.getTotalLength()
            })
            .transition(this._getTransition(this.duration * 4))
            .attr("stroke-dashoffset", 0);

        lines.exit().remove();
    },
    _setBarData() {
        this.parseHour = d3.timeParse("%H");

        let rects = this.chart.selectAll(".dc-lineBarChart-rect")
            .data(this.data.yAxis[1].values[0].values)

        rects.enter()
            .append("rect")
            .attr("transform", "translate(" + this.x2.bandwidth() / 2 + ", 0)")
            .attr("class", "dc-lineBarChart-rect")
            .attr("x", (d, index) => {
                return this.x1(d3.timeHour.offset(this.parseDate(this.data.xAxis.values[0]), index))
            })
            .style("fill", "#1BB21B")
            .attr("width", this.x2.bandwidth())
            .attr("y", (d, index) => {
                return this.height;
            })
            .attr("height", 0)
            .transition(this._getTransition(this.duration * 4))
            .attr("height", (d, index) => {
                return this.height - this.y2(d);
            })
            .attr("y", (d, index) => {
                return this.y2(d);
            });

        rects.attr("x", (d, index) => {
                return this.x1(d3.timeHour.offset(this.parseDate(this.data.xAxis.values[0]), index))
            })
            .attr("width", this.x2.bandwidth())
            .attr("y", (d, index) => {
                return this.height;
            })
            .attr("height", 0)
            .transition(this._getTransition(this.duration * 4))
            .attr("height", (d, index) => {
                return this.height - this.y2(d);
            })
            .attr("y", (d, index) => {
                return this.y2(d);
            });

        rects.exit().remove();
    },
    _setDotData() {
        let dots = this.chart.selectAll(".dc-lineBarChart-dots")
            .data(this.data.yAxis[0].values)
        dots.enter()
            .append("g")
            .attr("transform", "translate(" + this.x2.bandwidth() + ", 0)")
            .attr("class", "dc-lineBarChart-dots")
            .attr("fill", (d, index) => {
                return this.color(index);
            })
            .selectAll(".dc-lineBarChart-dot")
            .data((d) => {
                return d.values;
            })
            .enter()
            .append("circle")
            .attr("class", "dc-lineBarChart-dot")
            .attr("cx", (d, index) => {
                return this.x1(d3.timeHour.offset(this.parseDate(this.data.xAxis.values[0]), index))
            })
            .attr("cy", (d) => {
                return this.y1(d);
            })
            .attr("r", 0)
            .attr("fill", (d) => {
                return d == null ? "none" : "";
            });

        dots.attr("fill", (d, index) => {
                return this.color(index);
            })
            .selectAll(".dc-lineBarChart-dot")
            .data(function (d) {
                return d.values;
            })
            .attr("cx", (d, index) => {
                return this.x1(d3.timeHour.offset(this.parseDate(this.data.xAxis.values[0]), index))
            })
            .attr("cy", (d) => {
                return this.y1(d);
            })
            .attr("r", 0);

        dots.exit().transition().remove();
    },
    setTooltipData(xIndex, closeX, xValue) {
        this.chart.select(".dc-lineBarChart-bg")
            .transition(this._getTransition(this.duration, d3.easeExpOut))
            .style("visibility", "visible")
            .attr("x", closeX)

        this.tooltip
            .transition(this._getTransition(this.duration, d3.easeExpOut))
            .style("top", this.height / 2 + "px")
            .style("left", () => {
                return closeX - this.margin.left < this.margin.left ? closeX + this.margin.left + this.x2.bandwidth() * 2 + "px" : closeX - this.margin.left + "px"
            })
            .transition(this._getTransition(this.duration)).style("visibility", "visible")
            .select(".dc-lineBarChart-tooltip-title")
            .text(this.data.xAxis.name + ":" + xValue)

        this.tooltip.selectAll(".dc-lineBarChart-tooltip-icon")
            .data(this.colors)
            .style("background", (d, index) => {
                return d;
            });

        this.tooltip.selectAll(".dc-lineBarChart-tooltip-name")
            .data(this.data.yAxis)
            .text((d) => {
                return d.name;
            });

        this.tooltip.selectAll(".dc-lineBarChart-tooltip-value")
            .data(this.data.yAxis)
            .text((d, index) => {
                return d.values[0].values[xIndex];
            });

        this.chart.selectAll(".dc-lineBarChart-dot")
            .data(this.data.yAxis[0].values[0].values)
            .transition(this._getTransition(this.duration))
            .attr("r", (d, index) => {
                return index == xIndex ? 5 : 0;
            })
            .transition(this._getTransition(this.duration))
            .attr("r", (d, index) => {
                return index == xIndex ? 3.5 : 0;
            })
    },
    _setEvents() {
        let _this = this;
        let rect = this.chart.selectAll(".dc-lineBarChart-rectbg")
            .data(this.data.yAxis[1].values[0].values)
            .enter()
            .append("rect")
            .attr("class", "dc-lineBarChart-rectbg")
            .attr("width", this.x2.bandwidth() * 2)
            .attr("x", (d, index) => {
                return this.x2.bandwidth() * 2 * index
            })
            .attr("height", this.height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
        if (this.trigger == "click") {
            rect.on("click", function () {
                let curPos = d3.mouse(this);
                let distance = _this.width;
                let xIndex = 0;
                let closeX = 0;
                let xValue = "";

                let sectionWidth = _this.width / 24;
                let format = d3.timeFormat("%H:%M");

                for (let index = 0; index < 24; index++) {
                    if (sectionWidth * index < curPos[0]) {
                        xIndex = index;
                        closeX = sectionWidth * index;
                        xValue = format(d3.timeHour.offset(_this.parseDate(_this.data.xAxis.values[0]), index)) + " - " +
                            format(d3.timeHour.offset(_this.parseDate(_this.data.xAxis.values[0]), index + 1));
                    }
                }

                _this.setTooltipData(xIndex, closeX, xValue);
                _this.config.onClick(xIndex, closeX, xValue);
            });
        } else {
            rect.on("mousemove", function () {
                let curPos = d3.mouse(this);
                let distance = _this.width;
                let xIndex = 0;
                let closeX = 0;
                let xValue = "";

                let sectionWidth = _this.width / 24;
                let format = d3.timeFormat("%H:%M");

                for (let index = 0; index < 24; index++) {
                    if (sectionWidth * index < curPos[0]) {
                        xIndex = index;
                        closeX = sectionWidth * index;
                        xValue = format(d3.timeHour.offset(_this.parseDate(_this.data.xAxis.values[0]), index)) + " - " +
                            format(d3.timeHour.offset(_this.parseDate(_this.data.xAxis.values[0]), index + 1));
                    }
                }

                _this.setTooltipData(xIndex, closeX, xValue);
                _this.config.onMousemove(xIndex, closeX, xValue);
            });
        }
    },
    _drawGraph: function () {
        this._initAxis();
        this._setAxisData();
        this._setBarData();
        this._setLineData();
        this._setDotData();
        this._setEvents();
        this._initTooltip();
    },
    _resize: function () {
        isResize = true;
        d3.select("." + this.carrier).select("svg").remove();
        d3.select("." + this.carrier).select(".dc-lineBarChart-tooltip").remove();
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
    },
    showLine: function (show = true) {
        if (show) {
            this.chart.select(".dc-lineBarChart-dots").transition().attr("opacity", 1);
            this.chart.select(".dc-lineBarChart-line").transition().attr("opacity", 1);
        } else {
            this.chart.select(".dc-lineBarChart-dots").transition().attr("opacity", 0);
            this.chart.select(".dc-lineBarChart-line").transition().attr("opacity", 0);
        }
    },
    showBar: function (show = true) {
        if (show) {
            this.chart.selectAll(".dc-lineBarChart-rect").transition().attr("opacity", 1);
        } else {
            this.chart.selectAll(".dc-lineBarChart-rect").transition().attr("opacity", 0);
        }
    }
}
export default lineBarchart;