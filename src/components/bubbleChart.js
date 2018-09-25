/**
 * dchart.bubbleChart base on D3.js
 * author: liutongtong
 * date: 2018-04-10
 */

(function () {
    if (window.DCBubbleChart) {
        return;
    }

    const defaultConfig = {
        carrier: "chart", 
        type: 1, //1: main bubble. 2: attribute bubble
        mainColors: null, //central bubble color
        attrColors: [], //attribute bubble colors
        data: {},
        maxRadius: 70,
        minRadius: 50,
        padding: 20,
        
        onClick: function () {},
        onMousemove: function () {}
    };

    const bgColor = "#EEF6FE";
    const bgHoverColor = "#BFDFFF";
    const borderColor = "#55A4F2";
    const fontColor = "#3D85CC";
    let isResize = false;

    function bubbleChart(cf) {
        this.config = Object.assign({}, defaultConfig, cf);
        this._init();
    }
    bubbleChart.prototype = {
        _init: function () {
            this._initData();

            //add svg elelment
            this.chart = d3.select("." + this.carrier).append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .append("g")
                .attr("class", "dc-bubble-container");

            this._drawGraph();
            isResize ? "" : this._initResize();
        },
        _initData: function () {
            //init all private data
            this.data = this.config.data;
            this.mainColor = this.config.mainColor;
            this.attrColors = this.config.attrColors;
            this.carrier = this.config.carrier;
            this.maxRadius = this.config.maxRadius;
            this.minRadius = this.config.minRadius;
            this.padding = this.config.padding;
            this.type = this.config.type;

            
            this.width = document.getElementsByClassName(this.carrier)[0].getBoundingClientRect().width;
            this.height = document.getElementsByClassName(this.carrier)[0].getBoundingClientRect().height;
        },
        _getTransition: function (param) {
            if (isResize) {
                return d3.transition().duration(0);
            }
            let t = d3.transition();
            if (!param) {
                return t;
            }
            if (param.duration) {
                t = t.duration(param.duration);
            } 
            if (param.ease) {
                t = t.ease(param.ease);
            }
            if (param.delay) {
                t = t.delay(param.delay);
            }
            return t;
        },
        _drawGraph: function (data) {
            if (data) {
                this.data = data;
            }
            let _this = this;
            //the scale for bubble radius
            let scaleItemRadius = d3.scaleLinear()
                .domain([d3.min(this.data.attr, (d) => {
                    return d.key;
                }), d3.max(this.data.attr, (d) => {
                    return d.key;
                })]).range([this.maxRadius - 10,this.minRadius]);

            //add attribute bubble group
            let nodes = this.chart.selectAll(".dc-bubble-subItem")
                .data(this.data.attr)
                .enter()
                .append("g")
                .attr("class", "dc-bubble-subItem")   
                .attr("transform",(d, index) => {
                        return "translate(" + this.width / 2 + "," + this.height / 2 + ") " + 
                               "rotate(" + 360 / this.data.attr.length * index + ")";
                })
                .on("click", function (d, index) {
                    d3.select(this).select("circle")
                        .transition(_this._getTransition())
                        .attr("r", scaleItemRadius(d.key) * 1.2)
                        .transition(_this._getTransition())
                        .attr("r", scaleItemRadius(d.key))
                    let pos = d3.mouse(d3.select("." + _this.carrier).select("svg").node())
                    if(d3.select("." + _this.carrier).select(".dc-bubble-tooltip").size() > 0) {
                        d3.select("." + _this.carrier).select(".dc-bubble-tooltip")
                        .transition(_this._getTransition())
                        .style("top", pos[1] - 20 + "px")
                        .style("left",pos[0] + 20 + "px")
                            .transition(_this._getTransition())
                            .style("visibility", "visible")
                    }

                    if (_this.type != 1) {
                        _this.chart.selectAll(".dc-bubble-subItem circle").attr("fill", bgColor)
                        d3.select(this).select("circle").attr("fill", bgHoverColor)
                    }
                    _this.config.onClick(d,index);
                })
            
            //add lines
            nodes.append("line")
                .attr("stroke", borderColor)
                .attr("stroke-dasharray", 3)     
                .attr("x1", (d, index) => {
                    return scaleItemRadius(d.key) + this.maxRadius;
                })  
                .attr("x2", 0)   
                .attr("y2", 0) 
                .attr("opacity", 0)
                .transition(this._getTransition({delay: 1200}))
                .attr("opacity",1)
            
            //add circle
            let circles = nodes.append("circle")
                .attr("fill", (d, index) => {
                    return this.attrColors[index % this.attrColors.length];
                }) 
                .attr("opacity", 0)
                .transition(this._getTransition({delay: 700, ease: d3.easeSin})).duration( (d) => {
                    return isResize ? 0 : d3.randomUniform(200, 800)();
                })
                .attr("cx", (d, index) => {
                    return scaleItemRadius(d.key) + this.maxRadius + this.padding;
                })   
                .attr("opacity", 1)
                .attr("r", (d, index) => {
                    return scaleItemRadius(d.key) * 1.2;
                })
                .transition(this._getTransition())
                .attr("r", (d, index) => {
                    return scaleItemRadius(d.key);
                })     
                .attr("stroke", (d, index) => {
                    return this.type == 1 ? "" : borderColor;
                })

            let text = nodes.append("text")
                .style("text-anchor", "middle")
                .attr("x", (d, index) => {
                    return scaleItemRadius(d.key) + this.maxRadius + this.padding;
                })
                .attr("transform", (d, index) => {
                    let cx = scaleItemRadius(d.key) + this.maxRadius + this.padding;
                    return "rotate(" + -360 / this.data.attr.length * index + "," +cx  + "," + 0 + ")";
                })
            text.append("tspan")
                .transition(this._getTransition({delay:1200}))
                .text( (d,index) => {
                    return "No." + d.key;
                })
                .attr("x", (d, index) => {
                    return scaleItemRadius(d.key) + this.maxRadius + this.padding;
                })
            text.append("tspan")
                .transition(this._getTransition({delay:1200}))
                .text( (d,index) => {
                    return d.name;
                })
                .attr("x", (d, index) => {
                    return scaleItemRadius(d.key) + this.maxRadius + this.padding;
                })
                .attr("dy", "1em")

            text.transition(this._getTransition({delay:1200}))
                .attr("fill", (d) => {
                    return this.type == 1 ? "#fff" : fontColor;
                })
            
            //add central bubble
            let group = this.chart.append("g")
                .attr("class", "dc-bubble-item")
                .style('transform', 'translate(50%, 50%)')
                
            group.append("circle")
                .style("fill", this.mainColor)
                .attr("r", this.maxRadius)
                .transition(this._getTransition())
                .attr("r", this.maxRadius * 1.2)
                .transition(this._getTransition())
                .attr("r", this.maxRadius)

            group.append("text")
                .text(this.data.name)
                .style("text-anchor", "middle")
                .attr("fill", "#fff")
        },
        _resize: function () {
            isResize = true;
            d3.select("." + this.carrier).select("svg").remove();
            d3.select("." + this.carrier).select(".dc-bubble-tooltip")
            .style("visibility", "hidden")

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

    window.DCBubbleChart = bubbleChart;
})()