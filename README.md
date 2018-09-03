# DChart

I am building a chart library using D3.js, with no other dependencies. currently, I will add each type of chart one by one. Hopes you like it. 

## Installation

```bash
$ npm install -g parcel-bundler
$ npm install
$ npm run start
```

### Usage

![image](http://github.com/TongtongGitHub/DChart/raw/master/image/linechart.jpg)

```html
<div style="width: 100%;" class="linechart"></div>
```

```js
import {
    DCLinechart
} from './components/index'
let linechartData = {
    xAxis: {
        name: "Date",
        values: ["01-01", "01-02", "01-03", "01-04", "01-05"]
    },
    yAxis: {
        name: "Qty",
        values: [{
                label: "line1",
                values: [10000, 15000, 20000, 22222, 11111]
            },
            {
                label: "line2",
                values: [5000, 5500, 10000, 11000, 16000]
            },
            {
                label: "line3",
                values: [6000, 7000, 8000, 6666, 5555]
            }
        ]
    }
};
const chart1 = new DCLinechart({
    carrier: "linechart",
    data: linechartData,
    trigger: "hover",
    dateFormat: '%m-%d',
    onMousemove: function (closeIndex, closeX, xValue) {}
});
```