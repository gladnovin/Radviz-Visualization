//References:
/*  Opacity: https://bl.ocks.org/EfratVil/2bcc4bf35e28ae789de238926ee1ef05
    Tooltip: https://stackoverflow.com/questions/6725288/svg-text-inside-rect
    Tooltip: http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
    Reference: https://github.com/WYanChao/RadViz
    Reference: https://github.com/WYanChao/RadViz*/

var wineQualityColor = {
  '0': 'purple',
  '1': 'gold',
  '2': 'black',
  '3': 'red',
  '4': 'green',
  '5': 'blue',
  '6': 'pink',
  '7': 'yellow',
  '8': 'orange'
};
var irisColor ={
  'Iris-setosa':'violet',
  'Iris-versicolor':'pink',
  'Iris-virginica':'firebrick'
}


const radv = {
  predictionVar: null,

  init: function(rad, col, anchors, datas) {
    var radviz = rad;
    var radius = 250;
    this.predictionVar = col[col.length - 1];
    col = col.slice(0, col.length - 1);
    datas = range(datas);
    datas = feature(datas, col, anchors);
    //Anchor position
    var anchordata = col.map(function(d, i) {
      return {
        angle: anchors[i],
        x: radius + Math.cos(anchors[i]) * radius,
        y: radius + Math.sin(anchors[i]) * radius,
        label: d
      };
    });
 //Min and max values 
    var max = d3.max(datas, (d) => {
      return d[radv.predictionVar];
    })
    
    var min = d3.min(datas, (d) => {
      return d[radv.predictionVar];
    });
    
    // Color scale
    var color = d3.scaleQuantize()
      .domain([max, min])
      .range(['crimson', 'goldenrod'])

    function feature(datas, col, anchors) {
      datas.forEach(function(d) {
        var x = 0,
          y = 0;
        col.forEach(function(k, i) {
          x = x + Math.cos(anchors[i]) * d[k];
          y = y + Math.sin(anchors[i]) * d[k];
        });
        d.x = x / d.total;
        d.y = y / d.total;
      });
      return datas;
    }


    // Normalization 
    function range(data) {
      var scales = {};

      col.forEach(function(element) {
        scales[element] = d3.scaleLinear().domain(d3.extent(data.map(function(d, i) {
          return isNaN(parseFloat(d[element])) ? 1 : parseFloat(d[element]);
        }))).range([0, 1]);
      });

      data.forEach(function(d) {
        var total = 0;
        col.forEach(function(element) {
          d[element] = scales[element](d[element]);
          total = total + d[element];
        });
        d.total = total;
      });
      return data;
    }

    var width = 1200;
    var height = 1000;
    var svg = d3.select(radviz).append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('style', 'margin-left: -15em;')
      .attr('fill', '#000080')
    var datapt = svg.append('g').attr('transform', `translate(500,50)`);

    const Radviz = d3.select(radviz)
      .data([plot()]);

    Radviz.each(function(method) {
      d3.select(this).call(method);
    });

    //Plotting
    function plot() {

      function display() {
        datapt.selectAll('circle').remove();
        datapt.selectAll('circle')
          .data(anchordata)
          .enter()
          .append('circle')
          .attr('fill', 'saddlebrown')
          .attr('r', 10)
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .call(d3.drag()
            .on('start', function() {
              d3.select(this).classed('active', true);
            })
            .on('drag', drag)
            .on('end', function() {
              d3.select(this).classed('active', false);
            })
          );
      }
      display();
      anchorl();
      datapoint();
      // Anchor Movement
      function drag(d, i) {
        d3.select(this).raise().classed('active', true);
        dragx = d3.event.x - radius;
        dragy = d3.event.y - radius;
        let newAngle = Math.atan2(dragy, dragx);
        if (newAngle < 0) {
          newAngle = 2 * Math.PI + newAngle;
        }
        d.angle = newAngle;
        d.x = radius + Math.cos(newAngle) * radius;
        d.y = radius + Math.sin(newAngle) * radius;
        d3.select(this).attr('cx', d.x).attr('cy', d.y);
        display();
        anchorl();
        anchors[i] = newAngle;
        feature(datas, col, anchors);
        datapoint();
      };
     //Labelling, opacity and animation
      function anchorl() {
        datapt.selectAll('text.label').remove();
        datapt.selectAll('text.label')
          .data(anchordata)
          .enter()
          .append('text')
          .attr('class', 'label')
          .attr('x', d => d.x - 60)
          .attr('y', d => d.y - 10)
          .text(d => d.label)
          .style("font-family", "Times New Roman");
        d3.select("#range2").on("input", () => {
          console.log("test");
          datapt.selectAll('.anchor')
            .transition()
            .duration(1000)
            .ease(d3.easeBounce)
            .style("opacity", d3.select("#range2").property("value") / 100);
        });
      }


      //Normalized datapoints
      function datapoint() {
        datapt.selectAll('.anchor').remove();
        datapt.selectAll('.anchor')
          .data(datas)
          .enter()
          .append('circle')
          .attr('class', 'anchor')
          .attr('r', 5)
          .attr('fill', d => {
            if(_dataset === 'wine'){
              if(_displayType === 'cluster'){
                return wineQualityColor[d.cluster];
              } else{
                return wineQualityColor[d.quality];
              }
            } else{
              if(_displayType === 'cluster'){
                return wineQualityColor[d.cluster];
              } else{
                console.log(d.Class+" "+irisColor[d.Class]);
                return irisColor[d.Class];
              }
            }
          })
         
          // wineQualityColor
          .attr('stroke', 'black')
          .attr('stroke-width', 0.5)
          .attr('cx', d => d.x * radius + radius)
          .attr('cy', d => d.y * radius + radius)
          .on('mouseenter', function(d, i) {
            //Tooltip
            tooltip = svg.select('g').append('g')
            tooltip.append('rect')
              .attr('width', 400)
              .attr('height', 450)
              .attr('fill', '#a1b7e5')
              .attr('x', '0')
              .attr('y', '-10')
              .attr('rx', '12')
              .attr('ry', '12')
              .attr('transform', `translate(${-80 + d3.mouse(this)[0]},${20 + d3.mouse(this)[1]})`)

            for (var j = 0; j < d3.keys(d).length - 3; j++) {
              tooltip.append('text')
                .attr('class', 'tooltip-text')
                .attr('x', '5')
                .attr('y', 25 * j + 10)
                .attr('transform', `translate(${-80 + d3.mouse(this)[0]},${20 + d3.mouse(this)[1]})`)
                .text(d3.keys(d)[j] + ':' + d3.values(d)[j]);
            }
          })
          .on('mouseout', function(d) {
            //Removing
            svg.selectAll('rect').remove();
            svg.selectAll('.tooltip-text').remove();
          })
          .on('click',function(d){
            console.log('d '+JSON.stringify(d));
            if(_displayType === 'class'){
              return;
            }
            if(_dataset === 'iris'){
              console.log(JSON.stringify(d));
              $.getJSON('http://127.0.0.1:5000/corri?cluster=' +d.cluster, function(data, status){
                correlation_matrix(data.columns,data.data)
                console.log(data.columns,data.data)
              });
            } else {
              $.getJSON('http://127.0.0.1:5000/corrw?cluster=' +d.cluster,function(data,status){
                correlation_matrix(data.columns,data.data);
              });
            }
            
          })
      }
      return;
    }

    return;
  }
}

var correlation_matrix = function(columns,z){
  var data = [
    {
      z: JSON.parse(z),
      x: columns,
      y: columns,
      type: 'heatmap'
    }
  ];
  
  Plotly.newPlot('myDiv', data);
};

var getParameter = function(){
  console.log($('#parameters').val())
  getDataset($('#parameters').val());
};


var _displayType = 'class';
var _dataset = '';
var toggleClass = function(){
  _displayType = $('#toggle').val();
  getDataset(n_clusters=8)
};


var getDataset = function(n_clusters){
  n_clusters = (n_clusters === undefined) ? 8 : n_clusters;
  $('svg').remove();
  _dataset = $('#dataset').val();
  var url ='http://127.0.0.1:5000/' + _dataset;
  url += '?type=' +_displayType + '&n_clusters=' + n_clusters;
  console.log(url)
  $.getJSON(url,function(data,status){
  var jsonData = data;
  var columns = Object.keys(jsonData[0]);
  const anchors = columns.map(Number.call, Number).map(x => 2 * x * Math.PI / (columns.length - 1));
  var rad = document.querySelector('#radviz');
   radv.init(rad, columns, anchors, jsonData);

  });
};