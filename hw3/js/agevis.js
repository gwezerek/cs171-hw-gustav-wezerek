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

    //TODO: construct or select SVG
    //TODO: create axis and scales

    // filter, aggregate, modify data
    this.wrangleData( null );

    // call the update method
    this.updateVis();
}

AgeViz.prototype.wrangleData= function( _filterFunction ){

    // displayData should hold the data which is visualized
    this.displayData = this.filterAndAggregate( _filterFunction );

    // var options = { filter: function() { return true; } };
}

/**
 * the drawing function - should use the D3 selection, enter, exit
 */
AgeViz.prototype.updateVis = function() {
    // TODO: implement...
    // TODO: ...update scales
    // TODO: ...update graphs
}

AgeViz.prototype.onSelectionChange = function( selectionStart, selectionEnd ){
    this.displayData = this.filterAndAggregate( filter );
    this.updateVis();
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




