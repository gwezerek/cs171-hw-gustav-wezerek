'use strict';

// GLOBAL MISC
// =============================================


// BAR CHART SETUP
// =============================================
var margin = { top: 20, bottom: 10, left: 0, right: 0 };
var width = 700 - margin.left - margin.right;
var height = 900 - margin.top - margin.bottom;

var svg = d3.select( '#js-viz-mod' ).append( 'svg' )
  .attr( 'width', width + margin.left + margin.right )
  .attr( 'height', height + margin.top + margin.bottom )
  .attr( 'class', 'viz-wrap' );

var defs = svg.append( 'defs' );

// from http://logogin.blogspot.com/2013/02/d3js-arrowhead-markers.html
var arrowhead = defs.append( 'marker' )
    .attr( {
      'id': 'marker-destination',
      'viewBox': '0 0 10 10',
      'refX': 0,
      'refY': 5,
      'markerWidth': 5,
      'markerHeight': 10,
      'orient': 'auto'
    } )
  .append( 'polyline' )
    .attr( 'class', 'marker-destination')
    .attr( 'points', '0,0 10,5 0,10 0,5' ); //this is actual shape for arrowhead

var lineStart = defs.append( 'marker' )
    .attr( {
      'id': 'marker-origin',
      'refX': 1,
      'refY': 2.5,
      'markerWidth': 1,
      'markerHeight': 5,
      'orient': 'auto'
    } )
  .append( 'line' )
    .attr( { 
      'x1': 0,
      'y1': 0,
      'x2': 0,
      'y2': 10,
      'class': 'marker-origin'
    } );

var timeScale = d3.scale.linear().range( [ 0, 0.5 ] );
var xScale = d3.scale.linear().range( [ 0, width ] );
var partnerHeight = 90;

var modelData = [
  {
    'name': 'Angola',
    'alpha2_code': 'ao',
    'country_id': 4,
    'longitude': 13.242,
    'gdp': 12650000000.0,
    'life_expectancy': 42.0514634146341,
    'population': 12104952.0,
    'year': 1995,
    'top_partners': [
      {
        'total_export': 2036096161.9550002,
        'total_import': 2036096161.9550002,
        'country_id': 223,
        'distance': 6978.278548386516
      },
      {
        'total_export': 224173637.056,
        'total_import': 2036096161.9550002,
        'country_id': 50,
        'distance': 5672.672572104966
      },
      {
        'total_export': 158327929.5,
        'total_import': 2036096161.9550002,
        'country_id': 16,
        'distance': 5672.672572104966
      },
      {
        'total_export': 117076297.133,
        'total_import': 2036096161.9550002,
        'country_id': 38,
        'distance': 5672.672572104966
      },
      {
        'total_export': 102352390.975,
        'total_import': 2036096161.9550002,
        'country_id': 102,
        'distance': 5672.672572104966
      },
      {
        'total_export': 98906529.644,
        'total_import': 2036096161.9550002,
        'country_id': 112,
        'distance': 5672.672572104966
      },
      {
        'total_export': 95060953.24,
        'total_import': 2036096161.9550002,
        'country_id': 64,
        'distance': 5672.672572104966
      },
      {
        'total_export': 78828771.431,
        'total_import': 2036096161.9550002,
        'country_id': 69,
        'distance': 5672.672572104966
      },
      {
        'total_export': 61113059.0,
        'total_import': 2036096161.9550002,
        'country_id': 37,
        'distance': 5672.672572104966
      },
      {
        'total_export': 38838947.0,
        'total_import': 2036096161.9550002,
        'country_id': 28,
        'distance': 5672.672572104966
      }
    ],
    'latitude': -8.81155,
    'continent': 'Africa'
  }
];


// LOAD DATA, DRAW VIZ
// =============================================
// function drawViz( error, data, fullData ) {

  var data = modelData;

  // Init
  initChart();

  var partnerGroups = svg.selectAll( '.partner-group' )
      .data( data[0].top_partners )
    .enter().append( 'g' )
      .attr( 'class', 'partner-group')
      .attr( 'transform', function( d, i ) {
        return 'translate(0,' + ( ( partnerHeight * i ) ) + ')';
      } );

  var importLines = partnerGroups.append( 'line' )
      .attr( 'class', 'trade-line import-line')
      .attr( { 
        'x1': 0,
        'y1': 32,
        'x2': function( d ){ return xScale( d.distance ) - 12; },
        'y2': 32
      } );

  var exportLines = partnerGroups.append( 'line' )
      .attr( 'class', 'trade-line export-line')
      .attr( { 
        'x1': function( d ){ return xScale( d.distance ) - 5; },
        'y1': 59,
        'x2': 15,
        'y2': 59
      } );


  var partnerText = d3.select( '#js-partner-text-wrap' ).selectAll( '.partner-text' )
      .data( data[0].top_partners )
    .enter().append( 'div' )
      .style({ 
        'top': function( d, i ){ return partnerHeight * i + 'px'; },
        'left': function( d ){ return xScale( d.distance ) - 10 + 'px'; }
      } )
      .attr( 'class', 'partner-text' );

  var partnerTextNames = partnerText.append( 'p' )
      .text( function( d ){
        return d.country_id;
      } )
      .attr( 'class', 'partner-text-name' );

  var partnerTextImports = partnerText.append( 'p' )
      .text( function( d ){
        return 'Imports: ' + d.total_import;
      } )
      .attr( 'class', 'partner-text-detail partner-text-imports' );

  var partnerTextExports = partnerText.append( 'p' )
      .text( function( d ){
        return 'Exports: ' + d.total_export;
      } )
      .attr( 'class', 'partner-text-detail partner-text-exports' );


  // STATE
  // =============================================


  // HELPERS
  // =============================================
  function initChart() {
    setTimeDomain();
    setXDomain();
    // setYDomain();
  }

  function setTimeDomain() {
    // calculateDistances();
    timeScale.domain( [ 0, d3.max( data[0].top_partners, function( d ) { return Math.max( d.total_export, d.total_import); } ) ] );
  }

  function setXDomain() {
    xScale.domain( [ 0, d3.max( data[0].top_partners, function( d ) { return d.distance; } ) ] );
  }

  // function calculateDistances() {

  // }

  // function setYDomain() {
  //   yScale.domain( [ d3.min( graph.nodes, function( d ) { return d[ yScaleEncoding ]; } ), d3.max( graph.nodes, function( d ) { return d[ yScaleEncoding ]; } ) ] );
  // }

  // From http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
  function getDistanceFromLatLonInKm( lat1, lon1, lat2, lon2 ) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad( lat2 - lat1 );  // deg2rad below
    var dLon = deg2rad( lon2 - lon1 );
    var a =
      Math.sin( dLat/2 ) * Math.sin( dLat/2 ) +
      Math.cos( deg2rad( lat1 ) ) * Math.cos( deg2rad( lat2 ) ) *
      Math.sin( dLon/2 ) * Math.sin( dLon/2 )
      ;
    var c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
    var d = R * c; // Distance in km
    return d;
  }

  function deg2rad( deg ) {
    return deg * ( Math.PI / 180 )
  }


  // HANDLERS
  // =============================================

// }
