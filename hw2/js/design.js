'use strict';

// GLOBAL MISC
// =============================================
var iconValueEl = d3.select( '#js-icon-value' );
var popValueEl = d3.select( '#js-pop-value' );
var countryNameEl = d3.select( '#js-country-name' );
var countrySelect = d3.select( '#js-country-select' );
var yearSelect = d3.select( '#js-year-select' );
var intervalIDs = [];
var filteredData = [];
var maxExport, maxDistance, iconValue, popValue, countryName, currentCountryID, currentYear;


// CHART SETUP
// =============================================
var margin = { top: 20, bottom: 10, left: 0, right: 0 };
var width = 700 - margin.left - margin.right;
var height = 575 - margin.top - margin.bottom;
var partnerHeight = 60;
var minIconEmitInterval = 200;
var secondsInAYear = 31536000;
var emitsPerYear = secondsInAYear * ( 1000 / minIconEmitInterval );

// Viz selections
var partnerGroups, importLines, partnerText, partnerTextNames, partnerTextImports;

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


// LOAD DATA, DRAW VIZ
// =============================================
d3.json( 'data/countries_1995_2012.json', function( error, data ) {

  // Init
  initChart();

  // STATE MAINTENANCE
  // =============================================
  function setInitialParams() {
    updateCountryID();
    updateYear();
  }

  function processNewData() {
    updateFilteredData();
    setMaxExport();
    setMaxDistance();
    setXDomain();
    setDurationDomain();
    updateDynamicText();
  }

  function updateViz() {

    // Reset visuals
    clearIntervals();
    d3.selectAll( 'image' ).remove();

    // ENTER UPDATE EXIT - Lines
    // Update line data
    partnerGroups = svg.selectAll( '.partner-group' )
        .data( filteredData.top_partners, function( d ) {
          return d.country_id;
        });

    // Enter
    partnerGroups.enter().append( 'g' );
    
    partnerGroups.selectAll( '.import-line' )
        .data( function( d ) { return [ { 'distance': d.distance } ]; })
      .enter().append( 'line' )
        .attr( 'class', 'trade-line import-line');

    // Update
    partnerGroups.transition()
        .attr( 'class', 'partner-group')
        .attr( 'transform', function( d, i ) {
          return 'translate(0,' + ( ( partnerHeight * i ) ) + ')';
        } );
    
    partnerGroups.selectAll( 'line' )
        .transition()
        .attr( {
          'x1': 0,
          'y1': 18,
          'x2': function( d ){ return xScale( d.distance ) - 12; },
          'y2': 18,
          'stroke-dasharray': '5, 10'
        } );

    // Exit
    partnerGroups.exit()
      .remove();


    // ENTER UPDATE EXIT - Text
    // Update text data
    partnerText = d3.select( '#js-partner-text-wrap' ).selectAll( '.partner-text' )
        .data( filteredData.top_partners, function( d ) {
          return d.country_id;
        });

    // Enter
    partnerText.enter().append( 'div' );

    partnerText.selectAll( '.country-name' )
        .data( function( d ) { return [ { 'name': d.name } ]; })
      .enter().append( 'p' )
        .attr( 'class', 'country-name' );

    partnerText.selectAll( '.partner-text-imports' )
        .data( function( d ) { return [ { 'total_export': d.total_export } ]; })
      .enter().append( 'p' )
        .attr( 'class', 'partner-text-detail partner-text-imports' );

    // Update
    partnerText.transition()
        .style({
          'top': function( d, i ){ return partnerHeight * i + 'px'; },
          'left': function( d ){ return xScale( d.distance ) - 10 + 'px'; }
        } )
        .attr( 'class', 'partner-text' );

    partnerText.selectAll( '.country-name' )
      .text( function( d ){
        return d.name;
      } );

    partnerText.selectAll( '.partner-text-imports' )
      .text( function( d ){
        return '$' + toSF4( d.total_export ) + ' in imports from ' + filteredData.name;
      } );

    // Exit
    partnerText.exit()
      .remove();
  }

  function updateFilteredData() {
    var selectedCountryDatum = data.filter( function( d ) {
      return d.country_id === currentCountryID ;
    })[0];

    var selectedYearDatum = selectedCountryDatum.years.filter( function( d ) {
      return d.year === currentYear ;
    })[0];

    filteredData = $.extend( {}, selectedCountryDatum, selectedYearDatum );

    var startLat = filteredData.latitude;
    var startLon = filteredData.longitude;

    filteredData.top_partners.forEach( function( value, index ) {
      var tradePartner = data.filter( function( d ) {
        return d.country_id === value.country_id ;
      })[0];

      value.distance = getDistanceFromLatLonInKm( startLat, startLon, tradePartner.latitude, tradePartner.longitude );
      value.name = tradePartner.name;
    });
  }

  function updateDynamicText() {
    setIconValue();
    setPopValue();
    setCountryName();
    updateIconValue();
    updatePopValue();
    updateCountryName();
  }

  function updateCountryID() {
    currentCountryID = parseInt( countrySelect.property( 'value' ), 10 );
  }

  function updateYear() {
    currentYear = parseInt( yearSelect.property( 'value' ), 10 );
  }

  function setIconValue() {
    iconValue = maxExport / emitsPerYear;
  }

  function setPopValue() {
    popValue = filteredData.population;
  }

  function setCountryName() {
    countryName = filteredData.name;
  }

  function updateIconValue() {
    iconValueEl.text( '$' + Math.round( iconValue ) + ' USD' );
  }

  function updatePopValue() {
    popValueEl.text( toSF4( popValue ) );
  }

  function updateCountryName() {
    countryNameEl.text( countryName );
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

  function setMaxExport() {
    maxExport = d3.max( filteredData.top_partners, function( d ) { return d.total_export; } );
  }

  function setMaxDistance() {
    maxDistance = d3.max( filteredData.top_partners, function( d ) { return d.distance; } );
  }



  // HELPERS
  // =============================================
  function initChart() {
    populateCountryDropdown();
    setInitialParams();
    processNewData();
    updateViz();
    restartAnimation();
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

    countrySelect.html( optString );
  }

  function toSF4( num ) {
    var prefix = d3.formatPrefix( num );
    return prefix.scale( num ).toFixed(1) + prefix.symbol;
  }

  function restartAnimation() {
    filteredData.top_partners.forEach( function( value, index ) {
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
    d3.select( partnerGroups[0][partnerIndex] ).append( 'image' )
        .attr( {
          'xlink:href': './img/boat_2.svg',
          'width': 20,
          'height': 20,
          'class': 'icon',
          'transform': function( d ) {
            return 'translate(' + 0 + ',' + 5 + ')';
          }
        })
        .transition()
        .ease('linear')
        .duration( function( d ) { return durationScale( d.distance ); } )
        .attr( 'transform', function( d ) {
          return 'translate(' + ( xScale( d.distance ) - 20 )+ ',' + 5 + ')';
        })
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
  // Country select
  countrySelect.on( 'change', function() {
    updateCountryID();
    processNewData();
    updateViz();
    restartAnimation();
  });

  // Year select
  yearSelect.on( 'change', function() {
    updateYear();
    processNewData();
    updateViz();
    restartAnimation();
  });

});
