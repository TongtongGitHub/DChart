/**
 * dchart.linechart base on D3.js
 * author: liutongtong
 * date: 2018-04-10
 */

import * as d3 from 'd3'

const defaultConfig = {
    carrier: 'chart', //class name
    colors: ['#5BC0EB', '#FDE74C', '#9BC53D', '#E55934', '#FA7921'], // default color set
    data: null,
    dateFormat: '%Y-%m-%d', //https://github.com/d3/d3-time-format
    trigger: 'hover', //click or hover
    autoShowTooltip: false,
    radio: 0.5,
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 80,
    marginRight: 80,

    xAxisTick: 5, //x axis density
    yAxisTick: 5, //y axis density
    aniDuration: 500,

    legends: null,

    onClick: function () {},
    onMouseenter: function () {},
    onMouseout: function () {},
    onMousemove: function () {},
    onSuccess: function () {}
};

const gridColor = '#C5CACF';
let isResize = false;

function linechart(cf) {
    this.config = Object.assign({}, defaultConfig, cf);
    this._init();
}

linechart.prototype = {
    _init: function () {
        let _this = this;
        this._initData();

        //add svg element
        this.chart = d3.select('.' + this.carrier).append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .append('g')
            .attr('class', 'dc-linechart-container')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

        this._drawGraph(); //draw graph
        isResize ? '' : this._initResize();
        this.config.onSuccess();
    },
    _initData: function () {
        //init all privite data
        this.data = this.config.data;
        this.legends = this.config.legends;
        this.colors = this.config.colors;
        this.carrier = this.config.carrier;
        this.duration = this.config.aniDuration;
        this.margin = {
            top: this.config.marginTop,
            right: this.config.marginRight,
            bottom: this.config.marginBottom,
            left: this.config.marginLeft
        };
        this.radio = this.config.radio;
        this.width = document.getElementsByClassName(this.carrier)[0].offsetWidth - this.margin.left - this.margin.right;
        this.height = this.width * this.radio - this.margin.top - this.margin.bottom;
        this.trigger = this.config.trigger;
        this.autoShowTooltip = this.config.autoShowTooltip;
        this.yAxisTick = this.config.yAxisTick;
        this.xAxisTick = this.config.xAxisTick;

        this.color = d3.scaleOrdinal()
            .range(this.colors);
        this.dateFormat = this.config.dateFormat;
        this.parseTime = d3.timeParse(this.dateFormat);
        this.timeFormat = d3.timeFormat(this.dateFormat);
    },
    _drawGraph: function () {
        this._drawAxis();
        this._drawLine();
        this._drawGradientArea();
        this._drawDot();
        this._setEvents();
        this._initTooltip();
    },
    _initResize: function () {
        let _this = this;
        let resizeTimer = null;
        window.addEventListener('resize', function () {
            if (document.getElementsByClassName(_this.carrier)[0].offsetWidth == 0) {
                return;
            }
            clearTimeout(resizeTimer)
            resizeTimer = setTimeout(() => {
                _this._resize();
            }, 500);
        })
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
    _drawAxis: function () {
        //scale for X and Y axis
        this.x = d3.scaleTime()
            .range([0, this.width])
            .domain([this.parseTime(this.data.xAxis.values[0]),
                this.parseTime(this.data.xAxis.values[this.data.xAxis.values.length - 1])
            ])
        // .nice(this.xAxisTick);

        //max y
        let maxY = d3.max(this.data.yAxis.values, function (d) {
            return d3.max(d.values, (d) => {
                return d;
            });
        })
        this.y = d3.scaleLinear()
            .rangeRound([this.height, 0])
            .domain([0, (maxY == undefined || maxY == 0) ? 10 : maxY])
            .nice(this.config.yAxisTick);

        //create X and Y axis
        this.xAxis = d3.axisBottom(this.x)
            .tickSize(this.height)
            .tickFormat(this.timeFormat);
        this.yAxis = d3.axisLeft(this.y)
            .ticks(this.yAxisTick)
            .tickSize(this.width);
        //add X axis
        this.chart.append('g')
            .attr('class', 'dc-linechart-xAxis');
        //add Y axis
        this.chart.append('g')
            .attr('class', 'dc-linechart-yAxis')
            .attr('transform', 'translate(' + this.width + ', 0)');

        //add axis text
        this.chart.append('text')
            .attr('class', 'dc-linechart-axis-title')
            .attr('x', -10)
            .attr('y', -20)
            .style('text-anchor', 'end')
            .text(this.data.yAxis.name)
        this.chart.append('text')
            .attr('class', 'dc-linechart-axis-title')
            .attr('x', 20)
            .attr('y', 0)
            .attr('transform', 'translate(' + this.width + ', ' + this.height + ')')
            .style('text-anchor', 'start')
            .text(this.data.xAxis.name);
        //call axis and set animation
        this.chart.select('.dc-linechart-xAxis')
            .transition(this._getTransition(this.duration))
            .call((g) => {
                g.call(this.xAxis)
                    .selectAll('text')
                    .attr('y', this.height + 15);
            });
        this.chart.select('.dc-linechart-yAxis')
            .transition(this._getTransition(this.duration))
            .call((g) => {
                g.call(this.yAxis)
                    .selectAll('text')
                    .attr('x', -15 - this.width);
            });

    },
    _drawLine: function () {
        //set line position
        let line = d3.line()
            .defined((d) => {
                return d != null;
            })
            .x((d, index) => {
                return this.x(this.parseTime(this.data.xAxis.values[index]));
            })
            .y((d) => {
                return this.y(d);
            });

        let lines = this.chart.selectAll('.dc-linechart-line')
            .data(this.data.yAxis.values);
        lines.enter()
            .append('g')
            .attr('class', 'dc-linechart-line')
            .append('path')
            .attr('d', (d) => {
                return line(d.values);
            }).attr('stroke', (d, index) => {
                return this.color(index);
            })
            .attr('fill', 'none')
            .attr('stroke-dasharray', function (d) {
                return this.getTotalLength()
            })
            .attr('stroke-dashoffset', function (d) {
                return this.getTotalLength()
            })
            .transition(this._getTransition(this.duration * 3))
            .attr('stroke-dashoffset', 0);

        lines.select('path')
            .attr('d', (d) => {
                return line(d.values);
            }).attr('stroke', (d, index) => {
                return this.color(index);
            })
            .attr('fill', 'none')
            .attr('stroke-dasharray', function (d) {
                return this.getTotalLength()
            })
            .attr('stroke-dashoffset', function (d) {
                return this.getTotalLength()
            })
            .transition(this._getTransition(2000))
            .attr('stroke-dashoffset', 0);

        lines.exit().remove();
    },
    _drawDot: function () {

        //draw line
        this.chart.append('line')
            .attr('class', 'dc-hightlight-line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', this.height)
            .attr('stroke', '#B6BABF')
            .attr('visibility', 'hidden')

        let dots = this.chart.selectAll('.dc-linechart-dots')
            .data(this.data.yAxis.values)
        dots.enter()
            .append('g')
            .attr('class', 'dc-linechart-dots')
            .attr('fill', (d, index) => {
                return this.color(index);
            })
            .selectAll('.dc-linechart-dot')
            .data((d) => {
                return d.values;
            })
            .enter()
            .append('circle')
            .attr('class', 'dc-linechart-dot')
            .attr('cx', (d, index) => {
                return this.x(this.parseTime(this.data.xAxis.values[index]))
            })
            .attr('cy', (d) => {
                return this.y(d);
            })
            .attr('r', 0)
            .attr('fill', (d) => {
                return d == null ? 'none' : '';
            });

        dots.attr('fill', (d, index) => {
                return this.color(index);
            })
            .selectAll('.dc-linechart-dot')
            .data((d) => {
                return d.values;
            })
            .attr('cx', (d, index) => {
                return this.x(this.parseTime(this.data.xAxis.values[index]))
            })
            .attr('cy', (d) => {
                return this.y(d);
            })
            .attr('r', 0);

        dots.exit().transition().remove();
    },
    _drawGradientArea: function () {
        //create gradient area
        let area = d3.area()
            .defined((d) => {
                return d != null;
            })
            .x((d, index) => {
                return this.x(this.parseTime(this.data.xAxis.values[index]))
            })
            .y0(this.height)
            .y1((d) => {
                return this.y(d);
            });
        //define the gradient function
        let defs = this.chart.append('defs');

        this.colors.forEach((color, index) => {
            let linearGradient = defs.append('linearGradient')
                .attr('id', this.carrier + 'gradient' + index);

            linearGradient
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '0%')
                .attr('y2', '100%');

            linearGradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', color);

            linearGradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', '#fff');

        });

        //define a clipPath to animate from 0 to width
        let clip = defs.append('clipPath')
            .attr('id', this.carrier + 'clipPath');
        let clipRect = clip.append('rect')
            .attr('width', 0)
            .attr('height', this.height)

        clipRect.transition(this._getTransition(this.duration * 3))
            .attr('width', this.width)

        let areas = this.chart.selectAll('.dc-linechart-area')
            .data(this.data.yAxis.values)
        areas.enter()
            .append('path')
            .attr('class', 'dc-linechart-area')
            .attr('fill', (d, index) => {
                return 'url(#' + this.carrier + 'gradient' + index + ')';
            })
            .attr('opacity', 0.1)
            .transition(this._getTransition(this.duration))
            .attr('d', (d) => {
                return area(d.values);
            })
            .attr('clip-path', (d, index) => {
                return 'url(#' + this.carrier + 'clipPath)';
            })
        areas.attr('fill', (d, index) => {
                return 'url(#' + this.carrier + 'gradient' + index + ')';
            })
            .attr('opacity', 0.1)
            .transition(this._getTransition(this.duration))
            .attr('d', (d) => {
                return area(d.values);
            })
            .attr('clip-path', (d, index) => {
                return 'url(#' + this.carrier + 'clipPath)';
            })
        areas.exit().remove();
    },
    _initTooltip: function () {
        let _this = this;
        this.tooltip = d3.select('.' + this.carrier).append('div')
            .attr('class', 'dc-linechart-tooltip');
        this.tooltip.append('div')
            .attr('class', 'dc-linechart-tooltip-title');
        let row = this.tooltip.selectAll('.dc-linechart-tooltip-row')
            .data(this.data.yAxis.values)
            .enter()
            .append('div')
            .attr('class', 'dc-linechart-tooltip-row');
        row.append('div')
            .attr('class', 'dc-linechart-tooltip-icon')
        row.append('div')
            .attr('class', 'dc-linechart-tooltip-name')
        row.append('div')
            .attr('class', 'dc-linechart-tooltip-value')

        this.tooltip.on('mousemove', function () {
            _this._onMousemoveFunc();
        })

        if (this.autoShowTooltip) {
            setTimeout(() => {
                this.setTooltipData(this.data.xAxis.values.length - 1, this.x(this.parseTime(this.data.xAxis.values[this.data.xAxis.values.length - 1])), this.data.xAxis.values[this.data.xAxis.values.length - 1]);
            }, isResize ? 0 : this.duration);
        }
    },
    setTooltipData: function (closeIndex, closeX, xValue) {
        this.chart.select('.dc-hightlight-line')
            .attr('x1', closeX)
            .attr('x2', closeX)
            .attr('visibility', 'visible')

        this.chart.selectAll('.dc-linechart-dots')
            .data(this.data.yAxis.values)
            .selectAll('.dc-linechart-dot')
            .data((d) => {
                return d.values;
            }).transition(this._getTransition(this.duration / 2))
            .attr('r', (d, index) => {
                return index == closeIndex ? 3.5 : 0;
            })
        // .transition(this._getTransition(this.duration/2))
        // .attr('r', (d, index) => {
        //     return index == closeIndex ? 3.5 : 0;
        // })

        this.tooltip.select('.dc-linechart-tooltip-title')
            .text(xValue)

        this.tooltip.selectAll('.dc-linechart-tooltip-icon')
            .data(this.colors)
            .style('background', (d, index) => {
                return d;
            });

        this.tooltip.selectAll('.dc-linechart-tooltip-name')
            .data(this.data.yAxis.values)
            .text((d) => {
                return d.label;
            });

        this.tooltip.selectAll('.dc-linechart-tooltip-value')
            .data(this.data.yAxis.values)
            .text((d) => {
                return d.values[closeIndex] != null ? d.values[closeIndex] : 'No data';
            });

        let curPos = d3.mouse(document.querySelector('.' + this.carrier + ' .dc-linechart-target'));
        let tipWidth = document.querySelector('.' + this.carrier + ' .dc-linechart-tooltip').getBoundingClientRect().width;
        let tipHeight = document.querySelector('.' + this.carrier + ' .dc-linechart-tooltip').getBoundingClientRect().height;
        let rectWidth = document.querySelector('.' + this.carrier + ' .dc-linechart-target').getBoundingClientRect().width;
        let rectHeight = document.querySelector('.' + this.carrier + ' .dc-linechart-target').getBoundingClientRect().height;
        let left = tipWidth + 20 < rectWidth - curPos[0] ?
            curPos[0] + this.margin.left + 20 + 'px' :
            curPos[0] + this.margin.left - tipWidth + 'px'
        let top = tipHeight + 20 < rectHeight - curPos[1] ?
            curPos[1] + this.margin.top + 20 + 'px' :
            curPos[1] + this.margin.top - tipHeight + 'px'
        this.tooltip.transition(this._getTransition(this.duration, d3.easeExpOut))
            .style('top', top)
            .style('left', left)
            .transition(this._getTransition(this.duration / 2))
            .style('visibility', 'visible');
    },
    _onMousemoveFunc: function () {
        let _this = this;
        let curPos = d3.mouse(document.querySelector('.' + this.carrier + ' .dc-linechart-target'));
        let distance = _this.width;
        let closeIndex = 0;
        let closeX = 0;
        let xValue = '';
        //get the closest item and distance
        _this.data.xAxis.values.forEach((item, index) => {
            let xPos = _this.x(this.parseTime(item));
            let dis = Math.abs(xPos - curPos[0]);
            if (dis < distance) {
                distance = dis;
                closeIndex = index;
                closeX = xPos;
                xValue = item;
            }
        });
        _this.setTooltipData(closeIndex, closeX, xValue);
        if (this.trigger == 'hover') {
            _this.config.onMousemove(closeIndex, closeX, xValue);
        } else {
            _this.config.onClick(closeIndex, closeX, xValue);
        }
    },
    _onMouseLeaveFunc: function () {
        this.tooltip.transition(this._getTransition(this.duration))
            .style('visibility', 'hidden');
        this.chart.select('.dc-hightlight-line')
            .attr('visibility', 'hidden')

        this.chart.selectAll('.dc-linechart-dots')
            .data(this.data.yAxis.values)
            .selectAll('.dc-linechart-dot')
            .data((d) => {
                return d.values;
            }).transition(this._getTransition(this.duration / 2))
            .attr('r', (d, index) => {
                return 0;
            })
    },
    _setEvents: function () {
        let _this = this;
        //draw background
        this.chart.append('rect')
            .attr('class', 'dc-linechart-bg')
            .attr('width', 0)
            .attr('height', this.height)
        let rect = this.chart.append('rect')
            .attr('class', 'dc-linechart-target')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
        rect.on('mouseleave', () => {
            this._onMouseLeaveFunc();
        })
        if (this.trigger == 'hover') {
            rect.on('mousemove', function () {
                _this._onMousemoveFunc();
            });
        } else {
            rect.on('click', function () {
                _this._onMousemoveFunc();
            });
        }

    },
    _resize: function () {
        isResize = true;
        d3.select('.' + this.carrier).select('svg').remove();
        d3.select('.' + this.carrier).select('.dc-linechart-tooltip').remove();
        this._init();
        isResize = false;
    },
    //show or hide line based on index
    showLine: function (show = true, index) {
        if (show) {
            d3.select('.' + this.carrier).selectAll('.dc-linechart-line')
                .filter(function (d, i) {
                    return i === index;
                })
                .attr('opacity', 1)
            d3.select('.' + this.carrier).selectAll('.dc-linechart-dots')
                .filter(function (d, i) {
                    return i === index;
                })
                .attr('opacity', 1)
            d3.select('.' + this.carrier).selectAll('.dc-linechart-area')
                .filter(function (d, i) {
                    return i === index;
                })
                .attr('opacity', 0.1)
            d3.select('.' + this.carrier).selectAll('.dc-linechart-tooltip-row')
                .filter(function (d, i) {
                    return i === index;
                })
                .style('display', 'block')
        } else {
            d3.select('.' + this.carrier).selectAll('.dc-linechart-line')
                .filter(function (d, i) {
                    return i === index;
                })
                .attr('opacity', 0)
            d3.select('.' + this.carrier).selectAll('.dc-linechart-dots')
                .filter(function (d, i) {
                    return i === index;
                })
                .attr('opacity', 0)
            d3.select('.' + this.carrier).selectAll('.dc-linechart-area')
                .filter(function (d, i) {
                    return i === index;
                })
                .attr('opacity', 0)
            d3.select('.' + this.carrier).selectAll('.dc-linechart-tooltip-row')
                .filter(function (d, i) {
                    return i === index;
                })
                .style('display', 'none')
        }
    },
    //highlight the background of selected area
    highlightArea: function (itemStart, itemEnd) {
        let xStart = this.x(this.parseTime(itemStart));
        let xEnd = this.x(this.parseTime(itemEnd));
        if (xStart == xEnd) {
            this.setPosition(itemStart);
        }

        this.chart.select('.dc-linechart-bg')
            .transition(this._getTransition(this.duration))
            .style('visibility', 'visible')
            .attr('width', xEnd - xStart)
            .attr('x', xStart)
    }
}
export default linechart;