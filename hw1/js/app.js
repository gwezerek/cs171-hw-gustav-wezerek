// Global
var continentSelects = [];

// Helpers
var addCommas = d3.format(',');
var toGiga = d3.format('.4s');

// Generate viz
d3.json( 'data/countries_2012.json', function( error, data ){

  var columns = [ 'name', 'continent', 'gdp', 'life_expectancy', 'population', 'year' ];

  var table = d3.select( 'body' ).append( 'table' );

  // Table caption
  table.append( 'caption' )
    .html( 'World Countries Ranking' );

  // Table header row
  var tableHead = table.append( 'thead' )
    .attr( 'class', 'thead-wrap' );

  var tableRows = tableHead.append( 'tr' ).selectAll( 'th' )
    .data( columns )
  .enter().append( 'th' )
    .attr( 'class', 'thead-th')
    .text( function( d ) { 
      return d; 
    });

  // Table body
  var tableBody = table.append( 'tbody' );

  // Table rows
  var rows = tableBody.selectAll( 'tr' )
    .data( data )
  .enter().append( 'tr' )
    .attr( 'class', 'tbody-row' );

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
    });

  // Helpers

  function resetHeaderClasses() {
    d3.selectAll( '.thead-th' ).each( function( d, i ) {
      this.classList.remove('col-ascending');
      this.classList.remove('col-descending');
    });
  }

  function sortInt( dir, header ) {
    rows.sort( function( a, b ) {
      if ( a[ header ] === b[ header ] ) {
        return d3.ascending( a[ 'name' ], b[ 'name' ] );
      } else if ( dir === 'ascending' ) {
        return a[ header ] - b[ header ];
      } else {
        return b[ header ] - a[ header ];
      }
    });
  }

  function sortString( dir, header ) {
    rows.sort( function( a, b ) {
      if ( a[ header ] === b[ header ] ) {
        return d3.ascending( a[ 'name' ], b[ 'name' ] );
      } else if ( dir === 'ascending' ) {
        return d3.ascending( a[ header ], b[ header ] );
      } else {
        return d3.descending( a[ header ], b[ header ] );
      }
    });
  }

  function filterContinents() {
    rows.filter( function( d, i ) {
      console.log( continentSelects.indexOf( d[ 'continent' ] ) );
      return continentSelects.indexOf( d[ 'continent' ] );
    });
  }

  // Handlers

  tableRows.on( 'click', function( header, i ) { 
    if ( this.classList.contains( 'col-ascending' ) ) {
      resetHeaderClasses();
      this.classList.add( 'col-descending' );
      ( header === 'name' || header === 'continent' ) ? sortString( 'descending', header ) : sortInt( 'descending', header ) ;
    } else {
      resetHeaderClasses();
      this.classList.add( 'col-ascending' );
      ( header === 'name' || header === 'continent' ) ? sortString( 'ascending', header ) : sortInt( 'ascending', header ) ;
    }
  });

  d3.selectAll( '.table-chk' ).on( 'change', function() {
    continentSelects = [];
    d3.selectAll( '.table-chk:checked' ).each( function( d, i ) {
      continentSelects.push( this.getAttribute( 'name' ) );
    });
    filterContinents();
  });

});
