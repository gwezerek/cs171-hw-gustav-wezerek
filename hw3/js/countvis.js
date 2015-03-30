/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */

CountViz = function( _parentElement, _data, _metaData ){
    this.parentElement = _parentElement;
    this.data = _data;
    this.brushTextEl = $( '#brush-text' );
    this.dateFormatter = d3.time.format("%Y-%m-%d");
    this.initVis();
}

CountViz.prototype.initVis = function(){

    this.margin = { top: 20, right: 20, bottom: 30, left: 50 };
    this.width = 650 - this.margin.left - this.margin.right;
    this.height = 330 - this.margin.top - this.margin.bottom;

    this.xScale = d3.time.scale()
        .domain( d3.extent( this.data, function( d ) { return d.time; } ) )
        .range( [ 0, this.width ] );

    this.yScale = d3.scale.linear()
        .domain( [ 0, d3.max( this.data, function( d ) { return d.count; } ) ] )
        .range( [ this.height, 0 ] );

    this.xAxis = d3.svg.axis()
        .scale( this.xScale )
        .orient( 'bottom' );

    this.yAxis = d3.svg.axis()
        .scale( this.yScale )
        .orient( 'left' );

    this.svg = this.parentElement.append( 'svg' )
        .attr( 'width', this.width + this.margin.left + this.margin.right )
        .attr( 'height', this.height + this.margin.top + this.margin.bottom );

    this.chart = this.svg.append( 'g' )
        .attr( 'transform', 'translate( ' + this.margin.left + ',' + this.margin.top + ' )' );

    this.brush = d3.svg.brush()
        .x( this.xScale );

    // call the update method
    this.updateVis();
}

CountViz.prototype.updateVis = function() {
    var that = this;

    // Area chart adapted from http://bl.ocks.org/mbostock/3883195

    this.area = d3.svg.area()
        .x( function( d ) { return that.xScale( d.time ); } )
        .y0( that.height )
        .y1( function( d ) { return that.yScale( d.count ); } );

    this.chart.append( 'path' )
        .datum( this.data )
        .attr( 'class', 'area' )
        .attr( 'd', this.area);

    this.chart.append( 'g' )
        .attr( 'class', 'axis x-axis' )
        .attr( 'transform', 'translate( 0,' + this.height + ')' )
        .call( this.xAxis );

    this.chart.append( 'g' )
        .attr( 'class', 'axis y-axis' )
        .call( this.yAxis )
      .append( 'text' )
        .attr( 'transform', 'rotate(-90)' )
        .attr( 'y', 6)
        .attr( 'dy', '.71em' )
        .style( 'text-anchor', 'end' )
        .text( 'Votes' );

    this.chart.append( 'g' )
        .attr( 'class', 'brush' )
        .call( this.brush )
        .selectAll( 'rect' ).attr({
            height: this.height
        });
}

CountViz.prototype.updateBrushText = function( from, to ) {
    this.brushTextEl.text( this.dateFormatter(from) + ' to ' + this.dateFormatter(to) );
}
