/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */

SlopeViz = function( _parentElement, _data, _metaData ){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];
    this.avgPrios = this.getAverages();

    this.initVis();
};

SlopeViz.prototype.initVis = function(){

    this.margin = { top: 10, right: 0, bottom: 10, left: 30 };
    this.width = 230 - this.margin.left - this.margin.right;
    this.height = 330 - this.margin.top - this.margin.bottom;

    this.xScale = d3.scale.linear()
        .domain( [ 0, d3.max( this.data, function( d ) { return d.count; } ) ] )
        .range( [ this.width, 0 ] );

    this.yScale = d3.scale.linear()
        .domain( [ 0, 100 ] )
        .range( [ 0, this.height ] );

    this.yAxis = d3.svg.axis()
        .scale( this.yScale )
        .orient( 'left' );

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
        .attr( 'y', -30)
        .attr( 'dy', '.71em' )
        .style( 'text-anchor', 'end' )
        .text( 'Age' );

    this.areaWrap = this.chart.append( 'g' )
        .attr( 'class', 'age-area-wrap' )
        .attr( 'transform', 'translate(' + this.width + ', 0)' );

    var timeExtent = d3.extent( this.data, function( d ) { return d.time; } );
    this.onSelectionChange( timeExtent[0], timeExtent[1] );
};

SlopeViz.prototype.updateVis = function() {
    var that = this;

    // Update scales
    this.xScale.domain( [ 0, d3.max( that.displayData ) ] );

    this.area = d3.svg.area()
        .x( function( d, i ) { return that.yScale( i ); } )
        .y0( that.width )
        .y1( function( d ) { return that.xScale( d ); } );

    this.path = this.path || this.areaWrap.append( 'path' );

    this.path.datum( this.displayData )
        .attr( 'class', 'area' )
        .attr( 'transform', 'rotate(90)' )
        .transition()
        .attr( 'd', this.area);
};

SlopeViz.prototype.onSelectionChange = function( selectionStart, selectionEnd ) {
    this.displayData = this.filterAndAggregate( selectionStart, selectionEnd );
    this.updateVis();
};

SlopeViz.prototype.getAverages = function() {
    var voteSums = d3.range( 0, 16 ).map( function() { return 0; } );
    var voteShares = [];
    var totalCount = 0;

    $.each( this.data, function( i, day ) {
        $.each( day.prios, function( j, val ) {
            totalCount += val;
            voteSums[ j ] += val;
        });
    });

    voteSums.map( function( val, i ) {
        voteShares.push( val / otherTotal );
    });

    return voteShares;
};

SlopeViz.prototype.filterAndAggregate = function( from, to ) {
    var res = d3.range( 0, 100 ).map( function() { return 0; });
    var dateArr = getDates( from, to );
    var perDayMap = d3.map( this.data, function( val ) { return val.time; } );

    $.each( dateArr, function( index, value ) {
        if ( perDayMap.get( value ) ) {
          $.each( perDayMap.get( value ).ages, function( j, ageVal ) {
              res[ j ] += ageVal;
          });
        }
    });

    return res;
};




