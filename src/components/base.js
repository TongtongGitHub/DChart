/**
 * dchart.basechart base on D3.js
 * author: liutongtong
 * date: 2018-04-10
 */

(function() {
    const defaultConfig = {
        carrier: '.dchart', //class name
        colors: ['#5BC0EB', '#FDE74C', '#9BC53D', '#E55934', '#FA7921'], // default color set
        data: null,
        dateFormat: '%Y-%m-%d', //https://github.com/d3/d3-time-format
        trigger: 'hover', //tooltip trigger: click or hover 
        radio: 0.5, // only specify the width of the wrapper, height will be calculated by radio
        
        marginTop: 40,
        marginBottom: 40,
        marginLeft: 80,
        marginRight: 80,
    
        xAxisTick: 5, //x axis density
        yAxisTick: 5, //y axis density
        duration: 100, //milliseconds
    
        legends: null, 
        gridColor: '#C5CACF'
    };
    
    function BaseDChart(cf) {
        this.config = Object.assign({}, defaultConfig, cf);
    }
    
    BaseDChart.prototype = {
        _init: function () {
            console.log('parent _init');
            //init basic data
            this.width = document.querySelector(this.config.carrier).offsetWidth - this.config.marginLeft - this.config.marginRight;
            this.height = document.querySelector(this.config.carrier).offsetHeight - this.config.marginTop - this.config.marginBottom;
            this.colorScale = d3.scaleOrdinal()
                .range(this.config.colors);
            this.parseTime = d3.timeParse(this.config.dateFormat);
            this.timeFormat = d3.timeFormat(this.config.dateFormat);
    
            //add svg element
            this.chart = d3.select(this.config.carrier).append('svg')
                .attr('width', '100%')
                .attr('height', '100%')
                .append('g')
                .attr('class', 'dc-linechart-container')
                .attr('transform', 'translate(' + this.config.marginLeft + ',' + this.config.marginTop + ')');
        },
        _initResize: function () {
            let resizeTimer = null;
            window.addEventListener('resize', () => {
                if (document.querySelector(this.config.carrier).offsetWidth === 0) {
                    return;
                }
                clearTimeout(resizeTimer)
                resizeTimer = setTimeout(() => {
                    d3.select(this.config.carrier).select('svg').remove();
                    d3.select(this.config.carrier).select('.dc-linechart-tooltip').remove();
                    this._init();
                }, 500);
            }, false)
        },
    }
    
    window.BaseDChart = BaseDChart;
        
    })()