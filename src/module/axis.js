import * as d3 from 'd3'

export function drawAxis(config) {
    //create X and Y axis
    let xAxis = d3.axisBottom(config.xScale)
        .tickSize(config.height)
        .tickFormat(config.timeFormat);
    let yAxis = d3.axisLeft(config.yScale)
        .ticks(config.yAxisTick)
        .tickSize(config.width);
    //add X axis
    config.chart.append('g')
        .attr('class', 'dc-linechart-xAxis');
    //add Y axis
    config.chart.append('g')
        .attr('class', 'dc-linechart-yAxis')
        .attr('transform', 'translate(' + config.width + ', 0)');

    //add axis text
    config.chart.append('text')
        .attr('class', 'dc-linechart-axis-title')
        .attr('x', -10)
        .attr('y', -20)
        .style('text-anchor', 'end')
        .text(config.data.yAxis.name)
    config.chart.append('text')
        .attr('class', 'dc-linechart-axis-title')
        .attr('x', 20)
        .attr('y', 0)
        .attr('transform', 'translate(' + config.width + ', ' + config.height + ')')
        .style('text-anchor', 'start')
        .text(config.data.xAxis.name);
    //call axis and set animation
    config.chart.select('.dc-linechart-xAxis')
        .transition().duration(config.duration)
        .call((g) => {
            g.call(xAxis)
                .selectAll('text')
                .attr('y', config.height + 15);
        });
    config.chart.select('.dc-linechart-yAxis')
        .transition().duration(config.duration)
        .call((g) => {
            g.call(yAxis)
                .selectAll('text')
                .attr('x', -15 - config.width);
        });
}