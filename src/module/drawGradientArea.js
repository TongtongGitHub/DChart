import * as d3 from 'd3'

export function drawGradientArea(config) {
    //create gradient area
    let area = d3.area()
        .defined((d) => {
            return d != null;
        })
        .x((d, index) => {
            return config.xScale(config.xValue[index])
        })
        .y0(config.height)
        .y1((d) => {
            return config.yScale(d);
        });
    //define the gradient function
    let defs = config.chart.append('defs');

    config.colors.forEach((color, index) => {
        let linearGradient = defs.append('linearGradient')
            .attr('id', config.carrier + 'gradient' + index);

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
        .attr('id', config.carrier + 'clipPath');
    let clipRect = clip.append('rect')
        .attr('width', 0)
        .attr('height', config.height)

    clipRect.transition().duration(config.duration)
        .attr('width', config.width)

    let areas = config.chart.selectAll('.dc-linechart-area')
        .data(config.yValue)
    areas.enter()
        .append('path')
        .attr('class', 'dc-linechart-area')
        .attr('fill', (d, index) => {
            return 'url(#' + config.carrier + 'gradient' + index + ')';
        })
        .attr('opacity', 0.1)
        .transition().duration(config.duration)
        .attr('d', (d) => {
            return area(d.values);
        })
        .attr('clip-path', (d, index) => {
            return 'url(#' + config.carrier + 'clipPath)';
        })
    areas.attr('fill', (d, index) => {
            return 'url(#' + config.carrier + 'gradient' + index + ')';
        })
        .attr('opacity', 0.1)
        .transition().duration(config.duration)
        .attr('d', (d) => {
            return area(d.values);
        })
        .attr('clip-path', (d, index) => {
            return 'url(#' + config.carrier + 'clipPath)';
        })
    areas.exit().remove();
}