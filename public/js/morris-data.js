$(function() {

    Morris.Donut({element: 'morris-donut-chart', data: [{label: "IOS", value: 458}, {label: "Android", value: 783}], resize: true});

    Morris.Bar({
        element: 'morris-bar-chart',
        data: [{
            y: '2015-01',
            a: 100,
            b: 90
        }, {
            y: '2015-02',
            a: 75,
            b: 65
        }, {
            y: '2015-03',
            a: 50,
            b: 40
        }, {
            y: '2015-04',
            a: 75,
            b: 65
        }, {
            y: '2015-05',
            a: 50,
            b: 40
        }, {
            y: '2015-06',
            a: 75,
            b: 65
        }, {
            y: '2015-07',
            a: 100,
            b: 90
        }],
        xkey: 'y',
        ykeys: ['a', 'b'],
        labels: ['Active Users', 'Interactive Users'],
        hideHover: 'auto',
        resize: true
    });
});
