
let linechartData = {
    xAxis: {
        name: "Date",
        values: ["01-01", "01-02", "01-03", "01-04", "01-05",
            "01-06", "01-07", "01-08", "01-09", "01-10",
            "01-11", "01-12", "01-13", "01-14", "01-15",
            "01-16", "01-17", "01-18", "01-19", "01-20",
            "01-21", "01-22", "01-23", "01-24", "01-25",
            "01-26", "01-27", "01-28", "01-29", "01-30"
        ]
    },
    yAxis: {
        name: "Qty",
        values: [{
                label: "line1",
                values: [10000, 15000, 20000, 22222, 11111,
                    10000, 15000, 20000, 22222, 11111,
                    10000, 15000, 20000, 22222, 11111,
                    10000, 15000, 20000, 22222, 11111,
                    10000, 15000, 20000, 22222, 11111,
                    10000, 15000, 20000, 22222, 11111
                ]
            },
            {
                label: "line2",
                values: [5000, 5500, 10000, 11000, 16000,
                    5000, 5500, 10000, 11000, 16000,
                    5000, 5500, 10000, 11000, 16000,
                    5000, 5500, 10000, 11000, 16000,
                    5000, 5500, 10000, 11000, 16000,
                    5000, 5500, 10000, 11000, 16000
                ]
            },
            {
                label: "line3",
                values: [6000, 7000, 8000, 6666, 5555,
                    6000, 7000, 8000, 6666, 5555,
                    6000, 7000, 8000, 6666, 5555,
                    6000, 7000, 8000, 6666, 5555,
                    6000, 7000, 8000, 6666, 5555,
                    6000, 7000, 8000, 6666, 5555
                ]
            }
        ]
    }
};
const chart1 = new DCLinechart({
    carrier: ".linechart",
    data: linechartData,
    trigger: "hover",
    dateFormat: '%m-%d'
});

const chart2 = new DCLineBarchart({
    carrier: ".lineBarChart",
    colors: ["#1470CC", "#1BB21B"],
    data: {
        xAxis: {
            name: "时间",
            values: ["2017-01-01","2017-01-02"]
        },
        yAxis: [
            {
            name: "访问量",
            values: [{
                    label: "访问量",
                    values: [111, 222, 333, 444, 555,111, 222, 333, 444, 555,111, 222, 333, 444, 555,111, 222, 333, 444, 555,111, 222, 333, 444]
                }]
            },
            {
            name: "询盘量",
            values: [{
                    label: "询盘量",
                    values: [1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,1,2,3,4,5,1,2,3,4]
                }]
            }
        ]
    }
});

let donutData = [
    {
        name: 'China',
        value: 10
    },
    {
        name: 'US',
        value: 20
    },
    {
        name: 'EU',
        value: 10
    },
    {
        name: 'JP',
        value: 20
    },
    {
        name: 'KR',
        value: 10
    },
    {
        name: 'RS',
        value: 20
    }
];
const chart3 = new window.DCDonutChart({
carrier: ".donutChart1",
data: donutData
});

let mapData = [
    {
        name: "American",
        id: 840,
        value: 12
    },
    {
        name: "China",
        id: 156,
        value: 13
    }
];

const chart4 = new window.DCWorldMap({
    carrier: ".map",
    type: 1,
    data: mapData,
    onMousemoveEvent: function (d, pos) {
        let posLeft = pos[0] + 20;
        let posTop = pos[1] - 20;
        for (let index = 0; index < data1.length; index++) {
            if ( d.id == data1[index].id) {
                $(".map1 .dc-map-tooltip").text(data1[index].name)
                $(".map1 .dc-map-tooltip").css({
                    "visibility":"visible",
                    "left": posLeft + "px",
                    "top": posTop + "px"
                });
            }
        }
    },
    onMouseoutEvent: function () {
        $(".map1 .dc-map-tooltip").css({
            "visibility":"hidden"
        });
    }
});