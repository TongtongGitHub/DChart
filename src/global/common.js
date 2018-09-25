import * as d3 from 'd3'

//show or hide line based on index
export function toggleLine(config, show = true, index) {
    if (show) {
        d3.select('.' + config.carrier).selectAll('.dc-linechart-line')
            .filter(function (d, i) {
                return i === index;
            })
            .attr('opacity', 1)
        d3.select('.' + config.carrier).selectAll('.dc-linechart-dots')
            .filter(function (d, i) {
                return i === index;
            })
            .attr('opacity', 1)
        d3.select('.' + config.carrier).selectAll('.dc-linechart-area')
            .filter(function (d, i) {
                return i === index;
            })
            .attr('opacity', 0.1)
        d3.select('.' + config.carrier).selectAll('.dc-linechart-tooltip-row')
            .filter(function (d, i) {
                return i === index;
            })
            .style('display', 'block')
    } else {
        d3.select('.' + config.carrier).selectAll('.dc-linechart-line')
            .filter(function (d, i) {
                return i === index;
            })
            .attr('opacity', 0)
        d3.select('.' + config.carrier).selectAll('.dc-linechart-dots')
            .filter(function (d, i) {
                return i === index;
            })
            .attr('opacity', 0)
        d3.select('.' + config.carrier).selectAll('.dc-linechart-area')
            .filter(function (d, i) {
                return i === index;
            })
            .attr('opacity', 0)
        d3.select('.' + config.carrier).selectAll('.dc-linechart-tooltip-row')
            .filter(function (d, i) {
                return i === index;
            })
            .style('display', 'none')
    }
}
//highlight the background of selected area
export function highlightArea(config, itemStart, itemEnd) {
    let xStart = config.xScale(itemStart);
    let xEnd = config.xScale(itemEnd);
    if (xStart == xEnd) {
        return;
    }

    config.chart.select('.dc-linechart-bg')
        .transition().duration(config.duration)
        .style('visibility', 'visible')
        .attr('width', xEnd - xStart)
        .attr('x', xStart)
}