// GLOBAL MISC
// =============================================
var yScaleEncoding, xScaleEncoding;


// BAR CHART SETUP
// =============================================
var nodeR = 3;
var margin = { top: 10, bottom: 10, left: nodeR, right: 50 };
var width = 700 - margin.left - margin.right;
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


// LOAD DATA, DRAW VIZ
// =============================================
d3.json( 'data/countries_2012.json', function( error, data ) {

  // Init
  // initChart();

  graph.nodes.forEach(function( d, i ) {
    graph.nodes.forEach(function( e, j ) {
      if ( i !== j )
        graph.links.push( { 'source': i, 'target': j } )
    })
  })

  data.forEach( function( value, i ) {
    graph.nodes.push( value );
  })

  // Generate the force layout
  var force = d3.layout.force()
      .size( [ width, height ] )
      .charge( -50 )
      .linkDistance( 10 )
      .on( 'tick', tick )
      .on( 'start', function( d ) {} )
      .on( 'end', function( d ) {} )

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

  function random_layout() {
    force.stop();

    graph.nodes.forEach(function(d, i) {
      d.x = width / 4 + 2 * width * Math.random() / 4;
      d.y = height / 4 + 2 * height * Math.random() / 4;
    })

    graphUpdate(500);
  }

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

  function circular_layout() {
    force.stop();

    var r = Math.min(height, width)/2;

    var arc = d3.svg.arc()
            .outerRadius(r);

    var pie = d3.layout.pie()
            .sort(function(a, b) { return a.cat - b.cat;}) // Sorting by categories
            .value(function(d, i) {
              return 1;  // We want an equal pie share/slice for each point
            });

    graph.nodes = pie(graph.nodes).map(function(d, i) {
      // Needed to caclulate the centroid
      d.innerRadius = 0;
      d.outerRadius = r;

      // Building the data object we are going to return
      d.data.x = arc.centroid(d)[0]+width/2;
      d.data.y = arc.centroid(d)[1]+height/2;

      return d.data;
    })

    graphUpdate(500);
  }


  // HELPERS
  // =============================================

  function initChart() {
    lineLayout();
  }

  function graphUpdate(duration) {
    link.transition().duration(duration)
        .attr('x1', function(d) { return d.target.x; })
        .attr('y1', function(d) { return d.target.y; })
        .attr('x2', function(d) { return d.source.x; })
        .attr('y2', function(d) { return d.source.y; });

    node.transition().duration(duration)
        .attr('transform', function(d) {
          return 'translate('+d.x+','+d.y+')';
        });
  }

  function tick( d ) {
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
    xScale.domain( [ d3.min( graph.nodes, function( d ) { return d[ xScaleEncoding ] } ), d3.max( graph.nodes, function( d ) { return d[ xScaleEncoding ] } ) ] );
  }

  function setYDomain() {
    yScale.domain( [ d3.min( graph.nodes, function( d ) { return d[ yScaleEncoding ] } ), d3.max( graph.nodes, function( d ) { return d[ yScaleEncoding ] } ) ] );
  }

  function selectOptionRadio( clicked ) {
    if ( clicked.tagName === 'option' ) {
      clicked.previousElementSibling.childNodes[0].checked = true;
    }
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

});
