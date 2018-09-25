import * as d3 from 'd3'

export function drawLine(config) {
    console.log(config);
    //set line position
    let line = d3.line()
        .defined((d) => {
            return d != null;
        })
        .x((d, index) => {
            return config.xScale(config.xValue[index]);
        })
        .y((d) => {
            return config.yScale(d);
        });
    let lines = config.chart.selectAll('.dc-linechart-line')
        .data(config.yValue);
    lines.enter()
        .append('g')
        .attr('class', 'dc-linechart-line')
        .append('path')
        .attr('d', (d) => {
            return line(d.values);
        }).attr('stroke', (d, index) => {
            return config.colorScale(index);
        })
        .attr('fill', 'none')
        .attr('stroke-dasharray', function (d) {
            return this.getTotalLength()
        })
        .attr('stroke-dashoffset', function (d) {
            return this.getTotalLength()
        })
        .transition().duration(config.duration)
        .attr('stroke-dashoffset', 0);

    lines.select('path')
        .attr('d', (d) => {
            return line(d.values);
        }).attr('stroke', (d, index) => {
            return config.colorScale(index);
        })
        .attr('fill', 'none')
        .attr('stroke-dasharray', function (d) {
            return this.getTotalLength()
        })
        .attr('stroke-dashoffset', function (d) {
            return this.getTotalLength()
        })
        .transition().duration(config.duration)
        .attr('stroke-dashoffset', 0);

    lines.exit().remove();
}