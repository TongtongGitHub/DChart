import * as d3 from 'd3'

export function drawDot(config) {
    //draw line
    config.chart.append('line')
        .attr('class', 'dc-hightlight-line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', config.height)
        .attr('stroke', '#B6BABF')
        .attr('visibility', 'hidden')

    let dots =config.chart.selectAll('.dc-linechart-dots')
        .data(config.yValue)
    dots.enter()
        .append('g')
        .attr('class', 'dc-linechart-dots')
        .attr('fill', (d, index) => {
            return config.colorScale(index);
        })
        .selectAll('.dc-linechart-dot')
        .data((d) => {
            return d.values;
        })
        .enter()
        .append('circle')
        .attr('class', 'dc-linechart-dot')
        .attr('cx', (d, index) => {
            return config.xScale(config.xValue[index])
        })
        .attr('cy', (d) => {
            return config.yScale(d);
        })
        .attr('r', 0)
        .transition().duration(config.duration)
        .attr('r', 2)
        .attr('fill', (d) => {
            return d == null ? 'none' : '';
        });

    dots.attr('fill', (d, index) => {
            return config.colorScale(index);
        })
        .selectAll('.dc-linechart-dot')
        .data((d) => {
            return d.values;
        })
        .attr('cx', (d, index) => {
            return config.xScale(config.xValue[index])
        })
        .attr('cy', (d) => {
            return config.yScale(d);
        })
        .attr('r', 0)
        .transition().duration(config.duration)
        .attr('r', 2);

    dots.exit().transition().remove();
}