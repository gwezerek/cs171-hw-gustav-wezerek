/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */

PrioViz = function( _parentElement, _data, _metaData ){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];

    this.initVis();
}

PrioViz.prototype.initVis = function(){

    var that = this;

    this.margin = { top: 10, right: 0, bottom: 10, left: 50 };
    this.width = 650 - this.margin.left - this.margin.right;
    this.height = 440 - this.margin.top - this.margin.bottom;

    this.xScale = d3.scale.ordinal().rangeRoundBands( [ 0, this.width ], 0.25 )
        .domain( d3.range( 0, 15 ) );

    this.yScale = d3.scale.linear()
        .domain( [ 0, 100000 ] )
        .range( [ this.height, 0 ] );

    this.yAxis = d3.svg.axis()
        .scale( this.yScale )
        .orient( 'left' );

    this.barColor = d3.scale.category20();

    this.svg = this.parentElement.append( 'svg' )
        .attr( 'width', this.width + this.margin.left + this.margin.right )
        .attr( 'height', this.height + this.margin.top + this.margin.bottom );

    this.chart = this.svg.append( 'g' )
        .attr( 'transform', 'translate( ' + this.margin.left + ',' + this.margin.top + ' )' );

    this.chart.append( 'g' )
        .attr( 'class', 'axis y-axis' )
        .call( this.yAxis )
      .append( 'text' )
        .attr( 'transform', 'rotate(-90)' )
        .attr( 'y', 6)
        .attr( 'dy', '.71em' )
        .style( 'text-anchor', 'end' )
        .text( 'Votes' );

    var timeExtent = d3.extent( this.data, function( d ) { return d.time; } );
    this.onSelectionChange( timeExtent[0], timeExtent[1] );
}

PrioViz.prototype.rescaleAxis = function() {
    this.chart.selectAll( '.y-axis' )
        .transition()
        .call( this.yAxis );
}

PrioViz.prototype.updateVis = function() {
    var that = this;

    // this.displayData = [216, 236, 184, 153, 633, 767, 1193, 2332, 3442, 4900, 11656, 16400, 26112, 38883, 41878, 53714];

    // Update scales
    this.yScale.domain( [ 0, d3.max( this.displayData ) ] );
    console.log(this.yScale.domain());
    this.yAxis.scale( this.yScale );
    this.rescaleAxis();

    this.bars = this.chart.selectAll('rect')
      .data( this.displayData )

    barEnter = this.bars.enter().append( 'rect' );

    this.bars.transition()
        .attr({
            height: function( d ) { return that.height - that.yScale( d ); },
            width: that.xScale.rangeBand(),
            x: function( d, i ) { return that.xScale( i ); },
            y: function( d ) { return that.yScale( d ); },
            class: 'bar-rect',
            fill: function( d, i ) { return that.barColor( i ); }
          });

}

PrioViz.prototype.onSelectionChange = function( selectionStart, selectionEnd ) {
    this.displayData = this.filterAndAggregate( selectionStart, selectionEnd );
    this.updateVis();
}

PrioViz.prototype.filterAndAggregate = function( from, to ) {
    var res = d3.range( 0, 15 );
    var dateArr = getDates( from, to );
    var perDayMap = d3.map( this.data, function( val ) { return val.time; } );

    $.each( dateArr, function( index, value ) {
        if ( perDayMap.get( value ) ) {
          $.each( perDayMap.get( value ).prios, function( j, prioVal ) {
              res[ j ] += prioVal;
          });
        }
    });

    return res;
}




