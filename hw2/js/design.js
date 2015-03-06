'use strict';

// GLOBAL MISC
// =============================================
var secondsInAYear = 31536000;
var emitsPerYear = secondsInAYear * 2;
var iconValueEl = d3.select( '#js-icon-value' );
var intervalIDs = [];
var filteredData = [];
var maxExport, maxDistance, iconValue, currentCountryID, currentYear;


// BAR CHART SETUP
// =============================================
var margin = { top: 20, bottom: 10, left: 0, right: 0 };
var width = 700 - margin.left - margin.right;
var height = 575 - margin.top - margin.bottom;
var partnerHeight = 60;
var minIconEmitInterval = 500;

// Scales
var xScale = d3.scale.linear().range( [ 0, width ] );
var durationScale = d3.scale.linear().range( [ 0, 3000 ] );

var svg = d3.select( '#js-viz-mod' ).append( 'svg' )
  .attr( 'width', width + margin.left + margin.right )
  .attr( 'height', height + margin.top + margin.bottom )
  .attr( 'class', 'viz-wrap' );

// Markers
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


// LOAD DATA, DRAW VIZ
// =============================================
d3.json( 'data/countries_1995_2012.json', function( error, data ) {

  // Init
  initChart();

  var partnerGroups = svg.selectAll( '.partner-group' )
      .data( filteredData[0].top_partners )
    .enter().append( 'g' )
      .attr( 'class', 'partner-group')
      .attr( 'transform', function( d, i ) {
        return 'translate(0,' + ( ( partnerHeight * i ) ) + ')';
      } );

  var importLines = partnerGroups.append( 'line' )
      .attr( 'class', 'trade-line import-line')
      .attr( {
        'x1': 0,
        'y1': 18,
        'x2': function( d ){ return xScale( d.distance ) - 12; },
        'y2': 18,
        'stroke-dasharray': '5, 10'
      } );

  var partnerText = d3.select( '#js-partner-text-wrap' ).selectAll( '.partner-text' )
      .data( filteredData[0].top_partners )
    .enter().append( 'div' )
      .style({
        'top': function( d, i ){ return partnerHeight * i + 'px'; },
        'left': function( d ){ return xScale( d.distance ) - 10 + 'px'; }
      } )
      .attr( 'class', 'partner-text' );

  var partnerTextNames = partnerText.append( 'p' )
      .text( function( d ){
        return d.name;
      } )
      .attr( 'class', 'partner-text-name' );

  var partnerTextImports = partnerText.append( 'p' )
      .text( function( d ){
        return '$' + toSF4( d.total_export ) + ' in imports from ' + filteredData[0].name;
      } )
      .attr( 'class', 'partner-text-detail partner-text-imports' );


  restartAnimation();


  // HELPERS
  // =============================================
  function initChart() {
    populateCountryDropdown();
    updateFilteredData();

    setMaxExport();
    setMaxDistance();
    setXDomain();
    setDurationDomain();
    setIconValue();
    updateIconValue();
  }

  function populateCountryDropdown() {
    var optString = '';

    data.forEach( function( value, index ) {
      if ( value.name === 'United States' ) {
        optString += '<option class="js-country-opt" value="' + value.country_id + '" selected>' + value.name + '</option>';
      } else {
        optString += '<option class="js-country-opt" value="' + value.country_id + '">' + value.name + '</option>';
      }
    });

    d3.select( '#js-country-select' ).html( optString );
  }

  function updateFilteredData() {
    updateCountryID();
    updateYear();

    filteredData = data.filter( function( d ) {
      return d.country_id === currentCountryID ;
    });

    var selectedYearDatum = filteredData[0].years.filter( function( d ) {
      return d.year === currentYear ;
    });

    $.extend( true, filteredData, selectedYearDatum );

    var startLat = filteredData[0].latitude;
    var startLon = filteredData[0].longitude;

    filteredData[0].top_partners.forEach( function( value, index ) {
      var tradePartner = data.filter( function( d ) {
        return d.country_id === value.country_id ;
      });

      value.distance = getDistanceFromLatLonInKm( startLat, startLon, tradePartner[0].latitude, tradePartner[0].longitude );
      value.name = tradePartner[0].name;
    });
  }

  function updateCountryID() {
    currentCountryID = parseInt( d3.select( '#js-country-select' ).property( 'value' ), 10 );
  }

  function updateYear() {
    currentYear = parseInt( d3.select( '#js-year-select' ).property( 'value' ), 10 );
  }

  function getInterval( tradeValue ) {
    return maxExport / tradeValue * minIconEmitInterval;
  }

  function setXDomain() {
    xScale.domain( [ 0, maxDistance ] );
  }

  function setDurationDomain() {
    durationScale.domain( [ 0, maxDistance ] );
  }

  function toSF4( num ) {
    var prefix = d3.formatPrefix( num );
    return prefix.scale( num ).toFixed(1) + prefix.symbol;
  }

  function setMaxExport() {
    maxExport = d3.max( filteredData[0].top_partners, function( d ) { return d.total_export; } );
  }

  function setMaxDistance() {
    maxDistance = d3.max( filteredData[0].top_partners, function( d ) { return d.distance; } );
  }

  function setIconValue() {
    iconValue = maxExport / emitsPerYear;
  }

  function updateIconValue() {
    iconValueEl.text( '$' + Math.round( iconValue ) );
  }

  function restartAnimation() {
    clearIntervals();

    filteredData[0].top_partners.forEach( function( value, index ) {
      var intervalID;

      // Start import animations
      intervalID = window.setInterval( function() {
        startIconImport( index );
      }, getInterval( value.total_export ) );

      intervalIDs.push( intervalID );
    });
  }

  function clearIntervals() {
    intervalIDs.forEach( function( id, i ) {
      window.clearInterval( id );
    });
  }

  function startIconImport( partnerIndex ) {
    d3.select( partnerGroups[0][partnerIndex]).append( 'circle' )
        .attr( {
          'cx': -10,
          'cy': 18,
          'r': 5,
          'class': 'icon'
        })
        .transition()
        .ease('linear')
        .duration( function( d ) { return durationScale( d.distance ); } )
        .attr( 'cx',  function( d ) { return xScale( d.distance ) - 7; } )
        .remove();
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

});
