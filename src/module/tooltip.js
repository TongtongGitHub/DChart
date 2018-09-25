import * as d3 from 'd3'

export function tooltip(config) {
    let tooltip = d3.select('.' + config.carrier).append('div')
        .attr('class', 'dc-linechart-tooltip');
    tooltip.append('div')
        .attr('class', 'dc-linechart-tooltip-title');
    let row = tooltip.selectAll('.dc-linechart-tooltip-row')
        .data(config.yValue)
        .enter()
        .append('div')
        .attr('class', 'dc-linechart-tooltip-row');
    row.append('div')
        .attr('class', 'dc-linechart-tooltip-icon')
    row.append('div')
        .attr('class', 'dc-linechart-tooltip-name')
    row.append('div')
        .attr('class', 'dc-linechart-tooltip-value')

    return tooltip;
}