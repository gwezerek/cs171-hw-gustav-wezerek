/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */

AgeViz = function( _parentElement, _data, _metaData ){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [7, 24, 18, 11, 23, 26, 28, 40, 38, 89, 340, 396, 739, 982, 3336, 10020, 10042, 71731, 10106, 8414, 9157, 7803, 7287, 9832, 5048, 5897, 3844, 3593, 3461, 2589, 3321, 1913, 2160, 32935, 1619, 2010, 1324, 1183, 1271, 1064, 3641, 851, 1001, 946, 751, 906, 686, 1065, 642, 584, 7672, 506, 540, 524, 482, 496, 445, 371, 1452, 316, 414, 288, 297, 297, 277, 289, 252, 2328, 197, 208, 201, 177, 165, 1378, 125, 120, 103, 107, 109, 112, 148, 101, 105, 105, 109, 113, 121, 121, 146, 266, 158, 128, 152, 139, 142, 143, 128, 116, 125, 252];

    this.initVis();
}

AgeViz.prototype.initVis = function(){

    var that = this;

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

    this.updateVis();
}

AgeViz.prototype.updateVis = function() {
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
}

AgeViz.prototype.onSelectionChange = function( selectionStart, selectionEnd ) {
    this.displayData = this.filterAndAggregate( selectionStart, selectionEnd );
    this.updateVis();
}

AgeViz.prototype.filterAndAggregate = function( from, to ) {
    var res = d3.range( 0, 100 );
    var dateArr = getDates( from, to );
    var perDayMap = d3.map( this.data, function( val ) { return val.time; } );

    $.each( dateArr, function( index, value ) {
        $.each( perDayMap.get( value ).ages, function( j, ageVal ) {
            res[ j ] += ageVal;
        });
    });

    return res;
}




