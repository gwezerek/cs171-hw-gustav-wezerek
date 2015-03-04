'use strict';

// GLOBAL MISC
// =============================================
var yScaleEncoding, xScaleEncoding, sortingDimension, continentsGrouping, continentCentersCircular, nestedData, countryIDMap, force, node, circles, labels, link;


// BAR CHART SETUP
// =============================================
var nodeR = 3;
var margin = { top: 10, bottom: 10, left: nodeR, right: 50 };
var width = 900 - margin.left - margin.right;
var height = 1100 - margin.top - margin.bottom;

var svg = d3.select( 'body' ).append( 'svg' )
  .attr( 'width', width + margin.left + margin.right )
  .attr( 'height', height + margin.top + margin.bottom );
var linkWrap = svg.append( 'g' )
    .attr( 'class', 'link-wrap ');


var graph = { nodes: [], links: [] };
var graph2012 = { nodes: [], links: [] };
var graph1995 = { nodes: [], links: [] };
var yScale = d3.scale.linear().range( [ 0, height ] );
var xScale = d3.scale.linear().range( [ 0, width ] );
var continentCentersHorizontal = {
  'Africa': { x: width / 5, y: height / 2 },
  'Europe': { x: 2 * width / 5, y: height / 2 },
  'Asia': { x: 3 * width / 5, y: height / 2 },
  'Americas': { x: 4 * width / 5, y: height / 2 },
  'Oceania': { x: width, y: height /  2}
};

queue()
  .defer(d3.json, 'data/countries_2012.json')
  .defer(d3.json, 'data/countries_1995_2012.json')
  .await(drawViz);

// LOAD DATA, DRAW VIZ
// =============================================
function drawViz( error, data, fullData ) {

  // Init
  initChart();

  // LAYOUTS
  // =============================================

  function lineLayout() {
    force.stop();

    graph.nodes.forEach(function(d, i) {
      d.x = margin.left;
      d.y = ( nodeR * 2 + nodeR ) * i + margin.top;
    });

    graphUpdate(500);
  }

  function encodedLineLayout() {
    force.stop();

    graph.nodes.forEach(function( d ) {
      d.x = margin.left;
      d.y = height - yScale( d[yScaleEncoding] ) + margin.top;
    });

    graphUpdate(500);
  }

  function scatterLayout() {
    force.stop();

    graph.nodes.forEach(function( d ) {
      d.x = xScale( d[ xScaleEncoding ] ) + margin.left;
      d.y = height - yScale( d[ yScaleEncoding ] ) + margin.top;
    });

    graphUpdate(500);
  }

  function circleLayout() {
    force.stop();

    var r = Math.min( height, width ) / 2;

    var arc = d3.svg.arc()
        .outerRadius( r );

    var pie = d3.layout.pie()
        .sort( function( a, b ) { return a[ sortingDimension ] - b[ sortingDimension ];} ) // Sorting by categories
        .value( function() {
          return 1;  // We want an equal pie share/slice for each point
        });

    graph.nodes = pie( graph.nodes ).map( function( d ) {
      // Needed to caclulate the centroid
      d.innerRadius = 0;
      d.outerRadius = r;

      // Building the data object we are going to return
      d.data.x = arc.centroid( d )[ 0 ] + width / 2;
      d.data.y = arc.centroid( d )[ 1 ] + height / 2;

      return d.data;
    });

    graphUpdate( 500 );
  }

  function continentsLayout() {
    force.stop();

    if ( continentsGrouping === 'horizontal' ) {
      force.nodes( graph.nodes )
          .links( graph.links )
          .on( 'tick', horizontalTick )
          .start();
    }
    if ( continentsGrouping === 'radial' ) {
      force.nodes( graph.nodes )
          .links( graph.links )
          .on( 'tick', circularTick )
          .start();
    }
    if ( continentsGrouping === 'double' ) {
      force.nodes( graph.nodes )
          .links( graph.links )
          .on( 'tick', doubleTick )
          .start();
    }
  }

  function edgeLayout() {
    force.stop();

    force.nodes( graph.nodes )
        .links( graph.links )
        .on( 'tick', forceCircleTick )
        .start();

    // Bind hover handlers
    node.on( 'mouseover', highlightPartners )
        .on( 'mouseout', hidePartners );
  }


  // HELPERS
  // =============================================

  function initChart() {
    prep2012();
    graph = graph2012;
    updateGraph();
    lineLayout();

    mapCountryIDs();
    prep1995();
    continentCentersCircular = getContinentCentersCircular();
  }

  function graphUpdate(duration) {
    link.transition().duration(duration)
        .attr( 'x1', function( d ) { return d.target.x; } )
        .attr( 'y1', function( d ) { return d.target.y; } )
        .attr( 'x2', function( d ) { return d.source.x; } )
        .attr( 'y2', function( d ) { return d.source.y; } );

    node.transition()
        .duration( duration )
        .attr('transform', function( d ) {
          return 'translate(' + d.x + ',' + d.y + ')';
        });
  }

  function horizontalTick( e ) {
    graph.nodes.forEach( function( d ) {
      var target = continentCentersHorizontal[ d.continent ];
      d.x += ( target.x - d.x ) * 0.1 * e.alpha;
      d.y += ( target.y - d.y ) * 0.1 * e.alpha;
    });

    graphUpdate( 0 );
  }

  function circularTick( e ) {
    graph.nodes.forEach( function( d ) {
      var target = continentCentersCircular[ d.continent ];
      d.x += ( target.x - d.x + width / 2) * 0.1 * e.alpha;
      d.y += ( target.y - d.y + height / 2) * 0.1 * e.alpha;
    });

    graphUpdate( 0 );
  }

  function doubleTick( ) {
    var r = Math.min( height, width ) / 7;

    var arc = d3.svg.arc()
        .outerRadius( r );

    var pie = d3.layout.pie()
        .value( function() {
          return 1;  // We want an equal pie share/slice for each point
        });

    nestedData.forEach( function( continent ){
      var target = continentCentersCircular[ continent.key ];
      var subSelect = graph.nodes.filter( function( d ) {
        return d.continent === continent.key ;
      });
      subSelect = pie( subSelect ).map( function( d ) {
          // Needed to caclulate the centroid
          d.innerRadius = 0;
          d.outerRadius = r;

          d.data.x = ( arc.centroid( d )[ 0 ] + target.x + width / 2 );
          d.data.y = ( arc.centroid( d )[ 1 ] + target.y + height / 2 );

          return d.data;
      });
    });

    graphUpdate( 100 );
  }

  function forceCircleTick() {
    var r = Math.min( height, width ) / 2;

    var arc = d3.svg.arc()
        .outerRadius( r );

    var pie = d3.layout.pie()
        .value( function() {
          return 1;  // We want an equal pie share/slice for each point
        });

    graph.nodes = pie( graph.nodes ).map( function( d ) {
      // Needed to caclulate the centroid
      d.innerRadius = 0;
      d.outerRadius = r;

      // Building the data object we are going to return
      d.data.x = arc.centroid( d )[ 0 ] + width / 2;
      d.data.y = arc.centroid( d )[ 1 ] + height / 2;

      return d.data;
    });

    graphUpdate( 0 );
  }

  function setLineEncoding() {
    yScaleEncoding = d3.select( '.js-opt-line-scale-y:checked' ).node().value;
  }

  function setScatterEncodings() {
    if ( d3.select( '.js-opt-scatter-scales:checked' ).node().value === 'pop_gdp' ) {
      xScaleEncoding = 'population';
      yScaleEncoding = 'gdp';
    } else {
      xScaleEncoding = 'latitude';
      yScaleEncoding = 'longitude';
    }
  }

  function setXDomain() {
    xScale.domain( [ d3.min( graph.nodes, function( d ) { return d[ xScaleEncoding ]; } ), d3.max( graph.nodes, function( d ) { return d[ xScaleEncoding ]; } ) ] );
  }

  function setYDomain() {
    yScale.domain( [ d3.min( graph.nodes, function( d ) { return d[ yScaleEncoding ]; } ), d3.max( graph.nodes, function( d ) { return d[ yScaleEncoding ]; } ) ] );
  }

  function dispatchDatasetUpdate( clicked ) {
    if ( clicked.value === 'edges' ) {
      graph = graph1995;
    } else {
      graph = graph2012;
    }
    updateGraph();
  }

  function updateGraph() {
    // Enter, update, exit links
    link = linkWrap.selectAll( '.link' )
        .data( graph.links );

    link.exit().remove();

    // Enter, update, exit nodes
    node = svg.selectAll( '.node' )
        .data(graph.nodes);

    var nodeEnter = node.enter().append( 'g' )
        .attr( 'class', 'node' );

    node.exit().remove();

    // Append new circles if necessary
    circles = nodeEnter.append( 'circle' )
        .attr( 'r', nodeR )
        .attr( 'class', 'node-mark' );

    // Append new labels if necessary
    labels = nodeEnter.append( 'text' )
        .text( function(d ) { return d.name; })
        .attr({
          x: nodeR + 3,
          class: 'node-label'
        });

    // Create force layout
    force = d3.layout.force()
        .size( [ width, height ] )
        .charge( -50 )
        .linkDistance( 10 );
  }

  function prep2012() {
    data.forEach( function( value ) {
      graph2012.nodes.push( value );
    });
  }

  function prep1995() {
    var data1995 = [];

    // Flatten to 1995
    fullData.forEach( function( d ) {
      var newEntry = getYear( d.years, 1995 );
      for ( var key in d ) {
        newEntry[ key ] = d[ key ];
      }
      data1995.push( newEntry );
    });

    data1995.forEach( function( d, i ) {
      // Add nodes
      graph1995.nodes.push( d );

      // Add links
      d.top_partners.forEach( function( e ) {
        var mappedIndex = countryIDMap[ String( e.country_id ) ];
        if ( mappedIndex ) {
          graph1995.links.push( { 'source': i, 'target': mappedIndex } );
        }
      });
    });
  }

  function mapCountryIDs() {
    countryIDMap = {};

    fullData.forEach( function( value, index ) {
      countryIDMap[ value.country_id ] = index;
    });
  }

  function getYear( array, year ) {
    for ( var i = 0; i < array.length; i += 1 ) {
      if ( array[i].year === year ) return array[i];
    }
  }

  function selectOptionRadio( clicked ) {
    if ( clicked.tagName === 'SELECT' ) {
      clicked.previousElementSibling.childNodes[0].checked = true;
    }
  }

  function setSortingDimension() {
    sortingDimension = d3.select( '.js-opt-circle-dimension:checked' ).node().value;
  }

  function setContinentsGrouping() {
    continentsGrouping = d3.select( '.js-opt-continents-layout:checked' ).node().value;
  }

  function highlightPartners( d ) {
    svg.classed( 'highlighting', true );

    node.each( function( n ) { n.target = n.source = false; });

    link.classed( 'link-source', function( l ) { if ( l.source === d ) return l.target.target = true; } )
      .filter( function( l ) { return l.target === d || l.source === d; } )
        .each( function() { this.parentNode.appendChild( this ); } );

    node.classed( 'node-target', function( n ) { return n.target; } );
  }

  function hidePartners() {
    svg.classed( 'highlighting', false );
    link.classed( 'link-source', false );
    node.classed( 'node-target', false );
  }

  function getContinentCentersCircular() {
    nestedData = d3.nest()
      .key( function( d ) { return d.continent; } )
      .entries( graph.nodes );

    var continentCounts =  [
      nestedData[ 0 ].values.length,
      nestedData[ 1 ].values.length,
      nestedData[ 2 ].values.length,
      nestedData[ 3 ].values.length,
      nestedData[ 4 ].values.length
    ];

    var pie = d3.layout.pie();

    var r = Math.min( height, width ) / 2;

    var arc = d3.svg.arc()
        .innerRadius( 0 )
        .outerRadius( r );

    var arcCentroids = [];

    pie( continentCounts ).map( function( d ) {
      arcCentroids.push( arc.centroid( d ) );
    });

    return {
      'Africa': { 'x': arcCentroids[0][0], 'y': arcCentroids[0][1] },
      'Europe': { 'x': arcCentroids[1][0], 'y': arcCentroids[1][1] },
      'Asia': { 'x': arcCentroids[2][0], 'y': arcCentroids[2][1] },
      'Americas': { 'x': arcCentroids[3][0], 'y': arcCentroids[3][1] },
      'Oceania': { 'x': arcCentroids[4][0], 'y': arcCentroids[4][1] }
    };
  }


  // HANDLERS
  // =============================================

  // Line plot
  d3.select( '#js-layout-line' ).on( 'change', function() {
    dispatchDatasetUpdate( this );
    setLineEncoding();
    setYDomain();
    lineLayout();
  });

  // Encoded line plot
  d3.selectAll( '#js-select-line-scale-y, #js-layout-line-encoded' ).on( 'change', function() {
    dispatchDatasetUpdate( this );
    selectOptionRadio( this );
    setLineEncoding();
    setYDomain();
    encodedLineLayout();
  });

  // Scatterplot
  d3.selectAll( '#js-select-scatter-scale-y, #js-layout-scatter' ).on( 'change', function() {
    dispatchDatasetUpdate( this );
    selectOptionRadio( this );
    setScatterEncodings();
    setXDomain();
    setYDomain();
    scatterLayout();
  });

  // Circle
  d3.selectAll( '#js-layout-circle, #js-select-circle-dimensions' ).on( 'change', function() {
    dispatchDatasetUpdate( this );
    selectOptionRadio( this );
    setSortingDimension();
    circleLayout();
  });

  // Continents
  d3.selectAll( '#js-layout-continents, #js-select-continents-layouts' ).on( 'change', function() {
    dispatchDatasetUpdate( this );
    selectOptionRadio( this );
    setContinentsGrouping();
    continentsLayout();
  });

  // Edges
  d3.selectAll( '#js-layout-edges' ).on( 'change', function() {
    dispatchDatasetUpdate( this );
    edgeLayout();
  });

}
