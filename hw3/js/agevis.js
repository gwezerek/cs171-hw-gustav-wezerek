/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */

AgeViz = function( _parentElement, _data, _metaData ){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metaData = _metaData;
    this.displayData = [];

    this.initVis();
}

AgeViz.prototype.initVis = function(){

    var that = this;

    this.margin = { top: 10, right: 0, bottom: 10, left: 30 };
    this.width = 230 - this.margin.left - this.margin.right;
    this.height = 330 - this.margin.top - this.margin.bottom;

    // this.xScale = d3.scale.linear()
    //     .domain( [ 0, d3.max( this.data, function( d ) { return d.count; } ) ] )
    //     .range( [ this.width, 0 ] );

    // this.yScale = d3.scale.linear()
    //     .domain( [0, 100 ] )
    //     .range( [ 0, this.height ] );

    this.xScale = d3.time.scale()
        .domain( d3.extent( this.data, function( d ) { return d.time; } ) )
        .range( [ 0, that.height ] );

    this.yScale = d3.scale.linear()
        .domain( [ 0, d3.max( this.data, function( d ) { return d.count; } ) ] )
        .range( [ this.height, 0 ] );

    this.yAxis = d3.svg.axis()
        .scale( this.yScale )
        .orient( 'left' );

    this.svg = this.parentElement.append( 'svg' )
        .attr( 'width', this.width + this.margin.left + this.margin.right )
        .attr( 'height', this.height + this.margin.top + this.margin.bottom );

    this.chart = this.svg.append( 'g' )
        .attr( 'transform', 'translate( ' + this.margin.left + ',' + this.margin.top + ' )' );


    this.updateVis();
}


/**
 * the drawing function - should use the D3 selection, enter, exit
 */
AgeViz.prototype.updateVis = function() {
    var that = this;

    // Area chart adapted from http://bl.ocks.org/mbostock/3883195

    this.area = d3.svg.area()
        // .x( function( d ) { return 50; } )
        // .y0( that.width )
        // .y1( function( d ) { return that.xScale( d.count ); } );
        .x( function( d ) { return that.xScale( d.time ); } )
        .y0( that.height )
        .y1( function( d ) { return that.yScale( d.count ); } );
        // .attr( 'transform', 'rotate(90)' );

    this.areaWrap = this.chart.append( 'g' )
        .attr( 'class', 'age-area-wrap' )
        .attr( 'transform', 'translate(' + this.height + ', 0)' );

    this.path = this.areaWrap.append( 'path' )
        .datum( this.data )
        .attr( 'class', 'area' )
        .attr( 'transform', 'rotate(90)' )
        .attr( 'd', this.area);

    // this.path.attr( 'transform', rotateAndTranslate );

    this.chart.append( 'g' )
        .attr( 'class', 'axis y-axis' )
        .call( this.yAxis )
      .append( 'text' )
        .attr( 'transform', 'rotate(-90)' )
        .attr( 'y', -30)
        .attr( 'dy', '.71em' )
        .style( 'text-anchor', 'end' )
        .text( 'Age' );
}

AgeViz.prototype.onSelectionChange = function( selectionStart, selectionEnd ) {

    var filter = function() { return true; };

    this.displayData = this.filterAndAggregate( filter );
    // this.updateVis();
}

/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
AgeViz.prototype.filterAndAggregate = function( _filter ){

    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = _filter || function() { return true; };
    var that = this;

    // create an array of values for age 0-100
    var res = d3.range(100).map(function () {
        return 0;
    });

    // accumulate all values that fulfill the filter criterion

    // TODO: implement the function that filters the data and sums the values

    return res;
}




