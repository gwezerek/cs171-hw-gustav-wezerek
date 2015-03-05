'use strict';

// GLOBAL MISC
// =============================================


// BAR CHART SETUP
// =============================================
var margin = { top: 20, bottom: 10, left: 0, right: 100 };
var width = 900 - margin.left - margin.right;
var height = 1100 - margin.top - margin.bottom;

var svg = d3.select( '#js-viz-mod' ).append( 'svg' )
  .attr( 'width', width + margin.left + margin.right )
  .attr( 'height', height + margin.top + margin.bottom )
  .attr( 'class', 'viz-wrap' );

var timeScale = d3.scale.linear().range( [ 0, 0.5 ] );
var xScale = d3.scale.linear().range( [ 0, width ] );
var partnerHeight = 10;
var partnerVerticalOffset = 5;

var modelData = [
  {
    "name": "Angola",
    "alpha2_code": "ao",
    "country_id": 4,
    "longitude": 13.242,
    "gdp": 12650000000.0,
    "life_expectancy": 42.0514634146341,
    "population": 12104952.0,
    "year": 1995,
    "top_partners": [
      {
        "total_export": 2036096161.9550002,
        "total_import": 2036096161.9550002,
        "country_id": 223,
        "latitude": 41.3317,
        "longitude": 54.3705
      },
      {
        "total_export": 224173637.056,
        "total_import": 2036096161.9550002,
        "country_id": 50,
        "latitude": 41.3317,
        "longitude": 23.4567
      },
      {
        "total_export": 158327929.5,
        "total_import": 2036096161.9550002,
        "country_id": 16,
        "latitude": 41.3317,
        "longitude": 23.4567
      },
      {
        "total_export": 117076297.133,
        "total_import": 2036096161.9550002,
        "country_id": 38,
        "latitude": 41.3317,
        "longitude": 23.4567
      },
      {
        "total_export": 102352390.975,
        "total_import": 2036096161.9550002,
        "country_id": 102,
        "latitude": 41.3317,
        "longitude": 23.4567
      },
      {
        "total_export": 98906529.644,
        "total_import": 2036096161.9550002,
        "country_id": 112,
        "latitude": 41.3317,
        "longitude": 23.4567
      },
      {
        "total_export": 95060953.24,
        "total_import": 2036096161.9550002,
        "country_id": 64,
        "latitude": 41.3317,
        "longitude": 23.4567
      },
      {
        "total_export": 78828771.431,
        "total_import": 2036096161.9550002,
        "country_id": 69,
        "latitude": 41.3317,
        "longitude": 23.4567
      },
      {
        "total_export": 61113059.0,
        "total_import": 2036096161.9550002,
        "country_id": 37,
        "latitude": 41.3317,
        "longitude": 23.4567
      },
      {
        "total_export": 38838947.0,
        "total_import": 2036096161.9550002,
        "country_id": 28,
        "latitude": 41.3317,
        "longitude": 23.4567
      }
    ],
    "latitude": -8.81155,
    "continent": "Africa"
  }
];


// LOAD DATA, DRAW VIZ
// =============================================
// function drawViz( error, data, fullData ) {

  // Init
  initChart();


  var data = modelData;

  var partnerGroups = svg.selectAll( '.partner-group' )
      .data( data[0].top_partners )
    .enter().append( 'g' )
      .attr( 'class', 'partner-group')
      .attr( 'transform', function( d, i ) {
        return 'translate(0,' + partnerHeight * i + partnerVerticalOffset + ')';
      });

  partnerGroups.append( 'text' )
      .text( function( d ){
        return d.country_id;
      })
      .attr( 'transform', function( d, i ){
        console.log( getDistanceFromLatLonInKm( data[0].latitude, data[0].longitude, d.latitude, d.longitude ) );
        return 'translate(' +  + ',0)';
      })
      .attr( 'class', 'partner-name' );


  // LAYOUTS
  // =============================================


  // HELPERS
  // =============================================
  function initChart() {
    setTimeDomain();
    setXDomain();
    setYDomain();
  }

  function setTimeDomain() {
    xScale.domain( [ d3.min( graph.nodes, function( d ) { return d[ xScaleEncoding ]; } ), d3.max( graph.nodes, function( d ) { return d[ xScaleEncoding ]; } ) ] );
  }

  function setXDomain() {
    xScale.domain( [ d3.min( graph.nodes, function( d ) { return d[ xScaleEncoding ]; } ), d3.max( graph.nodes, function( d ) { return d[ xScaleEncoding ]; } ) ] );
  }

  function setYDomain() {
    yScale.domain( [ d3.min( graph.nodes, function( d ) { return d[ yScaleEncoding ]; } ), d3.max( graph.nodes, function( d ) { return d[ yScaleEncoding ]; } ) ] );
  }

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
