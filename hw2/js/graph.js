// GLOBAL MISC
// =============================================
var yScaleEncoding, xScaleEncoding, sortingDimension, continentsGrouping, continentCentersCircular, nestedData, nodes1995to2012, links1995to2012, nodes2012, links2012;


// BAR CHART SETUP
// =============================================
var nodeR = 3;
var margin = { top: 10, bottom: 10, left: nodeR, right: 50 };
var width = 900 - margin.left - margin.right;
var height = 1100 - margin.top - margin.bottom;

var svg = d3.select( 'body' ).append( 'svg' )
  .attr( 'width', width + margin.left + margin.right )
  .attr( 'height', height + margin.top + margin.bottom );

var fill = d3.scale.category10();
var graph = { nodes: [], links: [] };
var nb_nodes = 120;
var nb_cat = 10;
var node_scale = d3.scale.linear().domain([0, nb_cat]).range([5, 50]);
var yScale = d3.scale.linear().range( [ 0, height ] );
var xScale = d3.scale.linear().range( [ 0, width ] );
var continentScale = d3.scale.ordinal().rangeRoundBands( [ 0, width ], 0.5 );
var continentCentersHorizontal = {
  'Africa': { x: width / 5, y: height / 2 },
  'Europe': { x: 2 * width / 5, y: height / 2 },
  'Asia': { x: 3 * width / 5, y: height / 2 },
  'Americas': { x: 4 * width / 5, y: height / 2 },
  'Oceania': { x: width, y: height /  2}
}

queue()
  .defer(d3.json, 'data/countries_2012.json')
  .defer(d3.json, 'data/countries_1995_2012.json')
  .await(drawViz);

// LOAD DATA, DRAW VIZ
// =============================================
function drawViz( error, data, fullData ) {

  // Init
  // initChart();

  graph.nodes.forEach(function( d, i ) {
    graph.nodes.forEach(function( e, j ) {
      if ( i !== j )
        graph.links.push( { 'source': i, 'target': j } )
    })
  });

  data.forEach( function( value, i ) {
    graph.nodes.push( value );
  });

  // Generate the force layout
  var force = d3.layout.force()
      .size( [ width, height ] )
      .charge( -50 )
      .linkDistance( 10 )
      .on( 'tick', tick );

  var link = svg.selectAll( '.link' )
      .data(graph.links);

  link.enter().append( 'line' )
      .attr( 'class', 'link' )

  var node = svg.selectAll( '.node' )
      .data(graph.nodes)
    .enter()
      .append( 'g' ).attr( 'class', 'node' );

  node.append( 'circle' )
      .attr( 'r', nodeR )
      .attr( 'class', 'node-mark' );

  node.append( 'text' )
      .text( function(d) { return d.name; })
      .attr({
        x: nodeR + 3,
        class: 'node-label'
      });

  initChart();


  // LAYOUTS
  // =============================================

  function forceLayout() {
   force.nodes( graph.nodes )
        .links( graph.links )
        .start();
  }

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

    graph.nodes.forEach(function(d, i) {
      d.x = margin.left;
      d.y = height - yScale( d[yScaleEncoding] ) + margin.top;
    });

    graphUpdate(500);
  }

  function scatterLayout() {
    force.stop();

    graph.nodes.forEach(function(d, i) {
      d.x = xScale( d[xScaleEncoding] ) + margin.left;
      d.y = height - yScale( d[yScaleEncoding] ) + margin.top;
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
        .value( function( d, i ) {
          return 1;  // We want an equal pie share/slice for each point
        });

    graph.nodes = pie( graph.nodes ).map( function( d, i ) {
      // Needed to caclulate the centroid
      d.innerRadius = 0;
      d.outerRadius = r;

      // Building the data object we are going to return
      d.data.x = arc.centroid( d )[ 0 ] + width / 2;
      d.data.y = arc.centroid( d )[ 1 ] + height / 2;

      return d.data;
    })

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
  }


  // HELPERS
  // =============================================

  function initChart() {
    continentCentersCircular = getContinentCentersCircular();
    lineLayout();
    prep1995to2012();
    prep2012();
  }

  function graphUpdate(duration) {
    link.transition().duration(duration)
        .attr('x1', function(d) { return d.target.x; })
        .attr('y1', function(d) { return d.target.y; })
        .attr('x2', function(d) { return d.source.x; })
        .attr('y2', function(d) { return d.source.y; });

    node.transition()
        .duration( duration )
        .attr('transform', function( d ) {
          return 'translate(' + d.x + ',' + d.y + ')';
        });
  }

  function tick( e ) {
    graphUpdate( 0 );
  }

  function horizontalTick( e ) {
    graph.nodes.forEach( function( d, i ) {
      var target = continentCentersHorizontal[ d.continent ];
      d.x += ( target.x - d.x ) * 0.1 * e.alpha;
      d.y += ( target.y - d.y ) * 0.1 * e.alpha;
    });

    graphUpdate( 0 );
  }

  function circularTick( e ) {
    graph.nodes.forEach( function( d, i ) {
      var target = continentCentersCircular[ d.continent ];
      d.x += ( target.x - d.x + width / 2) * 0.1 * e.alpha;
      d.y += ( target.y - d.y + height / 2) * 0.1 * e.alpha;
    });

    graphUpdate( 0 );
  }

  function doubleTick( e ) {
    var r = Math.min( height, width ) / 7;

    var arc = d3.svg.arc()
        .outerRadius( r);

    var pie = d3.layout.pie()
        .value( function( d, i ) {
          return 1;  // We want an equal pie share/slice for each point
        });

    nestedData.forEach( function( continent, i ){
      var target = continentCentersCircular[ continent.key ];
      var subSelect = graph.nodes.filter( function( d, j ) {
        return d.continent === continent.key ;
      });
      subSelect = pie( subSelect ).map( function( d, j ) {
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
    xScale.domain( [ d3.min( graph.nodes, function( d ) { return d[ xScaleEncoding ] } ), d3.max( graph.nodes, function( d ) { return d[ xScaleEncoding ] } ) ] );
  }

  function setYDomain() {
    yScale.domain( [ d3.min( graph.nodes, function( d ) { return d[ yScaleEncoding ] } ), d3.max( graph.nodes, function( d ) { return d[ yScaleEncoding ] } ) ] );
  }

  function dispatchDatasetUpdate( clicked ) {
    if ( clicked.value === 'edges' ) {
      console.log('meow');
      pick1995to2012();
    } else {
      pick2012();
    }
  }

  function prep1995to2012() {
    nodes1995to2012 = graph.nodes.forEach( function( d, i ) {
      graph.nodes.forEach( function( e, j ) {
        if ( i !== j )
          graph.links.push( { 'source': i, 'target': j } )
      })
    });

    links1995to2012 = data.forEach( function( value, i ) {
      graph.nodes.push( value );
    });
  }

  function prep2012() {
    nodes2012 = graph.nodes.forEach( function( d, i ) {
      graph.nodes.forEach( function( e, j ) {
        if ( i !== j )
          graph.links.push( { 'source': i, 'target': j } )
      })
    });

    // Set links
    links2012 = data.forEach( function( value, i ) {
      graph.nodes.push( value );
    });
  }

  function pick1995to2012() {
    graph.nodes = [];

    console.log( fullData );


  }

  function pick2012() {

    graph.nodes = [];

    // Set nodes
    graph.nodes.forEach( function( d, i ) {
      graph.nodes.forEach( function( e, j ) {
        if ( i !== j )
          graph.links.push( { 'source': i, 'target': j } )
      })
    });

    // Set links
    data.forEach( function( value, i ) {
      graph.nodes.push( value );
    });

    // var force = d3.layout.force()
    //     .size( [ width, height ] )
    //     .charge( -50 )
    //     .linkDistance( 10 )
    //     .on( 'tick', tick );

    link = svg.selectAll( '.link' )
        .data(graph.links)
      .enter().append( 'line' )
        .attr( 'class', 'link' );;

    link.exit().remove();

    node = svg.selectAll( '.node' )
        .data(graph.nodes)
      .enter().append( 'g' )
        .attr( 'class', 'node' );

    node.exit().remove();

    node.append( 'circle' )
        .attr( 'r', nodeR )
        .attr( 'class', 'node-mark' );

    node.append( 'text' )
        .text( function(d) { return d.name; })
        .attr({
          x: nodeR + 3,
          class: 'node-label'
        });
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

  function category_color() {
    d3.selectAll('circle').transition().duration(500)
      .style('fill', function(d) {
        return fill(d.cat);
      });
  }

  function category_size() {
    d3.selectAll('circle').transition().duration(500)
      .attr('r', function(d) {
        return Math.sqrt(node_scale(d.cat));
      });
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

    pie( continentCounts ).map( function( d, i ) {
      arcCentroids.push( arc.centroid( d ) );
    })

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
    setLineEncoding();
    setYDomain();
    lineLayout();
  });

  // Encoded line plot
  d3.selectAll( '#js-select-line-scale-y, #js-layout-line-encoded' ).on( 'change', function() {
    selectOptionRadio( this );
    setLineEncoding();
    setYDomain();
    encodedLineLayout();
  });

  // Scatterplot
  d3.selectAll( '#js-select-scatter-scale-y, #js-layout-scatter' ).on( 'change', function() {
    selectOptionRadio( this );
    setScatterEncodings();
    setXDomain();
    setYDomain();
    scatterLayout();
  });

  // Circle
  d3.selectAll( '#js-layout-circle, #js-select-circle-dimensions' ).on( 'change', function() {
    selectOptionRadio( this );
    setSortingDimension();
    circleLayout();
  });

  // Continents
  d3.selectAll( '#js-layout-continents, #js-select-continents-layouts' ).on( 'change', function() {
    selectOptionRadio( this );
    setContinentsGrouping();
    continentsLayout();
  });

  // Edges
  d3.selectAll( '#js-layout-edges' ).on( 'change', function() {
    dispatchDatasetUpdate( this );
    edgeLayout();
  });

};
