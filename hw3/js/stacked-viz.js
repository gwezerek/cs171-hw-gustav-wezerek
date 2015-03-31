/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */

StackedViz = function( _parentElement, _data, _metaData ){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];
    this.medianVotesPerDay = 0;
    this.avgPrios = this.getAverages();

    this.initVis();
};

StackedViz.prototype.initVis = function(){

    this.margin = { top: 200, right: 50, bottom: 200, left: 50 };
    this.width = 530 - this.margin.left - this.margin.right;
    this.height = 600 - this.margin.top - this.margin.bottom;

    var dataset = [
      [
        { x: 0, y: 5 },
        { x: 1, y: 4 },
        { x: 2, y: 2 },
        { x: 3, y: 7 },
        { x: 4, y: 23 }
      ],
      [
        { x: 0, y: 10 },
        { x: 1, y: 12 },
        { x: 2, y: 19 },
        { x: 3, y: 23 },
        { x: 4, y: 17 }
      ],
      [
        { x: 0, y: 22 },
        { x: 1, y: 28 },
        { x: 2, y: 32 },
        { x: 3, y: 35 },
        { x: 4, y: 43 }
      ]
    ];

    //Set up stack method
    var stack = d3.layout.stack();

    //Data, stacked
    stack(dataset);

    // this.xScale = d3.scale.linear()
    //     .domain( [ 0, this.medianVotesPerDay ] )
    //     .range( [ 0, this.width ] );

    this.xScale = d3.scale.ordinal()
        .domain( d3.range(dataset[0].length) )
        .rangeRoundBands( [0, this.width], 0.05 );

    this.yScale = d3.scale.linear()
      .domain([0,
        d3.max(dataset, function(d) {
          return d3.max(d, function(d) {
            return d.y0 + d.y;
          });
        })
      ])
      .range([0, this.height]);

    // this.yScale = d3.scale.linear()
    //     .domain( [ 0, 1 ] )
    //     .range( [ this.height, 0 ] );

    this.svg = this.parentElement.append( 'svg' )
        .attr( 'width', this.width + this.margin.left + this.margin.right )
        .attr( 'height', this.height + this.margin.top + this.margin.bottom );

    this.chart = this.svg.append( 'g' )
        .attr( 'transform', 'translate( ' + this.margin.left + ',' + this.margin.top + ' )' );

    var that = this;

    // Add a group for each row of data
    var groups = this.chart.selectAll("g")
        .data(dataset)
      .enter().append("g");

    // Add a rect for each data value
    var rects = groups.selectAll("rect")
        .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d, i) {
          return that.xScale(i);
        })
        .attr("y", function(d) {
          return that.yScale(d.y0);
        })
        .attr("height", function(d) {
          return that.yScale(d.y);
        })
        .attr("width", that.xScale.rangeBand());

    // this.avgBars = this.chart.selectAll( 'rect' )
    //     .data( this.avgPrios )
    //   .enter().append( 'rect' )
    //     .attr({
    //       height: 40,
    //       width: function( d ) { return that.xScale( d ); },
    //       x: 0,
    //       y: 40,
    //       class: 'bar-rect bar-avg-rect'
    //     });


    var timeExtent = d3.extent( this.data, function( d ) { return d.time; } );
    this.onSelectionChange( timeExtent[0], timeExtent[1] );
};

StackedViz.prototype.updateVis = function() {
    var that = this;
};

StackedViz.prototype.onSelectionChange = function( selectionStart, selectionEnd ) {
    this.displayData = this.filterAndAggregate( selectionStart, selectionEnd );
    this.updateVis();
};

StackedViz.prototype.getAverages = function() {

    var that = this;
    var voteSums = d3.range( 0, 16 ).map( function() { return 0; } );
    var daySums = [];
    var voteShares = [];
    var totalCount = 0;

    $.each( this.data, function( i, day ) {
        var daySum = 0;

        $.each( day.prios, function( j, val ) {
            daySum += val;
            totalCount += val;
            voteSums[ j ] += val;
        });

        daySums.push( daySum );
    });

    this.medianVotesPerDay = d3.median( daySums );

    voteSums.map( function( val, i ) {
        voteShares.push( val / totalCount * that.medianVotesPerDay );
    });

    return voteShares;
};

StackedViz.prototype.filterAndAggregate = function( from, to ) {
    var voteSums = d3.range( 0, 16 ).map( function() { return 0; } );
    var voteShares = [];
    var totalCount = 0;
    var dateArr = getDates( from, to );
    var perDayMap = d3.map( this.data, function( val ) { return val.time; } );

    $.each( dateArr, function( index, value ) {
        if ( perDayMap.get( value ) ) {
          $.each( perDayMap.get( value ).prios, function( j, prioVal ) {
              totalCount += prioVal;
              voteSums[ j ] += prioVal;
          });
        }
    });

    voteSums.map( function( val, i ) {
        voteShares.push( val / totalCount );
    });

    return voteShares;
};




