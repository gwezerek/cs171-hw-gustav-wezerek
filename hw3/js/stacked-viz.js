/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */

StackedViz = function( _parentElement, _data, _metaData ){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];
    this.avgVotesPerDay = 0;
    this.avgVotesPerBrushedDay = 0;
    this.avgPrios = this.getAverages();
    this.avgVotesBrushedEl = $( '#avg-votes-brushed' );
    this.avgVotesAllEl = $( '#avg-votes-all' );

    this.initVis();
};

StackedViz.prototype.initVis = function(){

    this.margin = { top: 0, right: 0, bottom: 200, left: 0 };
    this.width = 350 - this.margin.left - this.margin.right;
    this.height = 100 - this.margin.top - this.margin.bottom;

    this.stack = d3.layout.stack();
    this.barColor = d3.scale.category20();

    this.xScale = d3.scale.linear()
      .range([0, this.width]);

    this.svg = this.parentElement.append( 'svg' )
        .attr( 'width', this.width + this.margin.left + this.margin.right )
        .attr( 'height', this.height + this.margin.top + this.margin.bottom );

    this.chart = this.svg.append( 'g' )
        .attr( 'transform', 'translate( ' + this.margin.left + ',' + this.margin.top + ' )' );

    var timeExtent = d3.extent( this.data, function( d ) { return d.time; } );
    this.onSelectionChange( timeExtent[0], timeExtent[1] );
};

StackedViz.prototype.updateVis = function() {

    this.stack( this.displayData );
    this.xScale.domain( [ 0, d3.max( [ this.avgVotesPerDay, this.avgVotesPerBrushedDay ] ) ] );

    var that = this;

    // Add a group for each row of data
    var groups = this.chart.selectAll( 'g' )
        .data( this.displayData );

    var groupEnter = groups.enter().append('g')
      .attr( 'class', 'bar-group' );

    groups.exit().remove();

    // Add a rect for each data value
    groupEnter.append( 'rect' );

    var rects = groups.selectAll( 'rect' )
        .data( function( d ) { return d; });

    rects.enter().append( 'rect' );

    rects.transition()
        .attr({
          height: 40,
          width: function( d ) { return that.xScale( d.y ); },
          x: function( d ) { return that.xScale( d.y0 ); },
          y: function( d, i ) { return i * 60 },
          class: 'stacked-bar-rect',
          fill: function( d, i ) { console.log(d3.select(this.parentNode)); return that.barColor( d.z ); }
        });

    // Add the avg sum label
    this.updateText();

    // console.log(d3.selectAll( '.bar-group' )[0][15]);

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

    this.avgVotesPerDay = d3.mean( daySums );

    voteSums.map( function( val, i ) {
        voteShares.push( val / totalCount * that.avgVotesPerDay );
    });

    return voteShares;
};

StackedViz.prototype.filterAndAggregate = function( from, to ) {
    var mergedArr = [];
    var voteSums = d3.range( 0, 16 ).map( function() { return 0; } );
    var daySums = [];
    var voteShares = [];
    var totalCount = 0;
    var dateArr = getDates( from, to );
    var perDayMap = d3.map( this.data, function( val ) { return val.time; } );

    $.each( dateArr, function( index, value ) {
        if ( perDayMap.get( value ) ) {
          var daySum = 0;

          $.each( perDayMap.get( value ).prios, function( j, prioVal ) {
              daySum += prioVal;
              totalCount += prioVal;
              voteSums[ j ] += prioVal;
          });

          daySums.push( daySum );
        }
    });

    this.avgVotesPerBrushedDay = d3.mean( daySums );

    var that = this;

    voteSums.map( function( val, i ) {
        voteShares.push( val / totalCount * that.avgVotesPerBrushedDay );
    });

    for ( var i = 0; i < 16; i += 1 ) {
      mergedArr.push([
      {
        'x': 0,
        'y': voteShares[ i ],
        'z': i
      }, {
        'x': 1,
        'y': that.avgPrios[ i ],
        'z': i
      }]);
    }

    return mergedArr;
};

StackedViz.prototype.updateText = function( selectionStart, selectionEnd ) {
    this.avgVotesBrushedEl.text( Math.round( this.avgVotesPerBrushedDay, 10 ) );
    this.avgVotesAllEl.text( Math.round( this.avgVotesPerDay, 10 ) );
};
