
// Generate viz
d3.json( 'data/countries_2012.json', function( error, data ){

  var columns = [ 'name', 'continent', 'gdp', 'life_expectancy', 'population', 'year' ];

  var table = d3.select( 'body' ).append( 'table' );

  // Table caption
  table.append( 'caption' )
    .html( 'World Countries Ranking' );

  // Table header row
  var tableHead = table.append( 'thead' )
    .attr( 'class', 't-head' );

  tableHead.append( 'tr' ).selectAll( 'th' )
    .data( columns )
  .enter().append( 'th' )
    .text( function( d ) { 
      return d; 
    })
    .on( 'click', function( header, i ) {
      tableBody.selectAll( 'tr' ).sort( function( a, b ) {
        return d3.descending( a[ header ], b[ header ] );
      });
    });

  // Table body
  var tableBody = table.append( 'tbody' );

  // Table rows
  var rows = tableBody.selectAll( 'tr' )
    .data( data )
  .enter().append( 'tr' )
    .attr( 'class', 'row' );

  // Table header row
  var cells = rows.selectAll( 'td' )
    .data( function( d ) {
      // For each country in the dataset...
      return d3.range( columns.length ).map( function( val, i ) {
          // Return the correct, formatted cell
          var datum = d[ columns[ i ] ];

          if ( columns[ i ] === 'population' ) {
            return addCommas(datum);
          }
          else if ( columns[ i ] === 'life_expectancy' ) {
            return datum.toPrecision(3);
          }
          else if ( columns[ i ] === 'gdp' ) {
            return toGiga(datum);
          }
          else {
            return datum;
          }
      });
    })
  .enter().append( 'td' )
    .text( function( d ) { 
      return d; 
    })

});

// Helpers
var addCommas = d3.format(',');
var toGiga = d3.format('.4s');