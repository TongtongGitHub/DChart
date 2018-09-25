import * as d3 from 'd3'


function _onMouseLeaveFunc(config) {
    config.tooltip
        .transition().duration(config.duration)
        .style('visibility', 'hidden');
    config.chart.select('.dc-hightlight-line')
        .attr('visibility', 'hidden')

    config.chart.selectAll('.dc-linechart-dots')
        .data(config.yValue)
        .selectAll('.dc-linechart-dot')
        .data((d) => {
            return d.values;
        })
        .transition().duration(config.duration)
        .attr('r', (d, index) => {
            return 2;
        })
}

function setTooltipData(config, closeIndex, closeX, xValue) {
    config.chart.select('.dc-hightlight-line')
        .attr('x1', closeX)
        .attr('x2', closeX)
        .attr('visibility', 'visible')

    config.chart.selectAll('.dc-linechart-dots')
        .data(config.yValue)
        .selectAll('.dc-linechart-dot')
        .data((d) => {
            return d.values;
        }).transition().duration(config.duration)
        .attr('r', (d, index) => {
            return index == closeIndex ? 3.5 : 0;
        })
    // .transition(this._getTransition(this.duration/2))
    // .attr('r', (d, index) => {
    //     return index == closeIndex ? 3.5 : 0;
    // })

    config.tooltip.select('.dc-linechart-tooltip-title')
        .text(xValue)

    config.tooltip.selectAll('.dc-linechart-tooltip-icon')
        .data(config.colors)
        .style('background', (d, index) => {
            return d;
        });

    config.tooltip.selectAll('.dc-linechart-tooltip-name')
        .data(config.yValue)
        .text((d) => {
            return d.label;
        });

    config.tooltip.selectAll('.dc-linechart-tooltip-value')
        .data(config.yValue)
        .text((d) => {
            return d.values[closeIndex] != null ? d.values[closeIndex] : 'No data';
        });

    let curPos = d3.mouse(document.querySelector('.' + config.carrier + ' .dc-linechart-target'));
    let tipWidth = document.querySelector('.' + config.carrier + ' .dc-linechart-tooltip').getBoundingClientRect().width;
    let tipHeight = document.querySelector('.' + config.carrier + ' .dc-linechart-tooltip').getBoundingClientRect().height;
    let rectWidth = document.querySelector('.' + config.carrier + ' .dc-linechart-target').getBoundingClientRect().width;
    let rectHeight = document.querySelector('.' + config.carrier + ' .dc-linechart-target').getBoundingClientRect().height;
    let left = tipWidth + 20 < rectWidth - curPos[0] ?
        curPos[0] + config.marginLeft + 20 + 'px' :
        curPos[0] + config.marginLeft - tipWidth + 'px'
    let top = tipHeight + 20 < rectHeight - curPos[1] ?
        curPos[1] + config.marginTop + 20 + 'px' :
        curPos[1] + config.marginTop - tipHeight + 'px'
        config.tooltip.transition().duration(config.duration).ease(d3.easeExpOut)
        .style('top', top)
        .style('left', left)
        .transition().duration(config.duration)
        .style('visibility', 'visible');
}
function _onMousemoveFunc(config) {
    let curPos = d3.mouse(document.querySelector('.' + config.carrier + ' .dc-linechart-target'));
    let distance = config.width;
    let closeIndex = 0;
    let closeX = 0;
    let xValue = '';
    //get the closest item and distance
    config.xValue.forEach((item, index) => {
        let xPos = config.xScale(item);
        let dis = Math.abs(xPos - curPos[0]);
        if (dis < distance) {
            distance = dis;
            closeIndex = index;
            closeX = xPos;
            xValue = item;
        }
    });
    setTooltipData(config,closeIndex, closeX, xValue);
}

export function setEvents(config){
        //draw background
        config.chart.append('rect')
            .attr('class', 'dc-linechart-bg')
            .attr('width', 0)
            .attr('height', config.height)
        let rect = config.chart.append('rect')
            .attr('class', 'dc-linechart-target')
            .attr('width', config.width)
            .attr('height', config.height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
        rect.on('mouseleave', () => {
            _onMouseLeaveFunc(config);
        })
        if (config.trigger == 'hover') {
            rect.on('mousemove', function () {
                _onMousemoveFunc(config);
            });
        } else {
            rect.on('click', function () {
                _onMousemoveFunc(config);
            });
        }
}