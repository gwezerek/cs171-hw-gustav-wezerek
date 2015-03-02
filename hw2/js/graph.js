var margin = { top: 10, bottom: 10, left:90, right: 0 };
var width = 900 - margin.left - margin.right;
var height = 1100 - margin.top - margin.bottom;

var svg = d3.select( 'body' ).append( 'svg' )
  .attr( 'width', width + margin.left + margin.right )
  .attr( 'height', height + margin.top + margin.bottom );

var fill = d3.scale.category10();
var graph = { nodes: [], links: [] };
var nb_nodes = 120;
var nb_cat = 10;
var nodeR = 3;
var node_scale = d3.scale.linear().domain([0, nb_cat]).range([5, 50]);
var yScale = d3.scale.linear().range( [ 0, height ] );


d3.json( 'data/countries_2012.json', function( error, data ) {

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

  function tick( d ) {
    graphUpdate( 0 );
  }

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
    })

    graphUpdate(500);
  }

  function line_cat_layout() {

    force.stop();

    graph.nodes.forEach(function(d, i) {
      d.x = margin.left;
      d.y = height - yScale( d.population ) + margin.top;
    })

    console.log( graph.nodes );

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

  d3.select('input[value=\'force\']').on('click', forceLayout);
  d3.select('input[value=\'random\']').on('click', random_layout);
  d3.select('input[value=\'line\']').on('click', lineLayout);
  d3.select('input[value=\'line_cat\']').on('click', line_cat_layout);
  d3.select('input[value=\'circular\']').on('click', circular_layout);

  d3.select('input[value=\'nocolor\']').on('click', function() {
    d3.selectAll('circle').transition().duration(500).style('fill', '#66CC66');
  })

  d3.select('input[value=\'color_cat\']').on('click', category_color);

  d3.select('input[value=\'nosize\']').on( 'click', function() {
    d3.selectAll( 'circle' ).transition().duration(500).attr( 'r', 5 );
  })

  d3.select('input[value=\'size_cat\']').on( 'click', category_size );

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

  function setYDomain() {
    yScale.domain( [ 0, d3.max( graph.nodes, function( d ) { return d.population } ) ] );
  }

  setYDomain();
  forceLayout();

});
