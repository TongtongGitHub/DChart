# DChart

A chart library using D3.js, with no other dependencies. 

## Installation

```bash
$ npm run dev
```

### Usage

![image](https://github.com/TongtongGitHub/DChart/blob/master/image/linechart.jpg)

```html
<div style="width: 100%;height:300px;position: relative;" class="linechart"></div>
```

```js
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
```
