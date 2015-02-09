// Global
var continentSelects = [];

// Helpers
var addCommas = d3.format(',');
function toSF4( num ) {
  var prefix = d3.formatPrefix( num );
  return prefix.scale( num ).toFixed(1) + prefix.symbol;
}

// Generate viz
d3.json( 'data/countries_2012.json', function( error, data ){

  var columns = [ 'name', 'continent', 'gdp', 'life_expectancy', 'population', 'year' ];
  var nestedData = nestContinents();
  var flattenedNest = flattenNest();
  data = data.concat(flattenedNest);

  var table = d3.select( 'body' ).append( 'table' );

  // Table caption
  table.append( 'caption' )
    .html( 'World Countries Ranking' );

  // Table header row
  var tableHead = table.append( 'thead' )
    .attr( 'class', 'thead-wrap' );

  var tableColHeads = tableHead.append( 'tr' ).selectAll( 'th' )
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
    .attr( 'class', 'tbody-row-no-agg' );

  // Table cells
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
            return toSF4(datum);
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

  rows.filter( function( d, i ) {
    return d.is_agg;
  }).attr( 'class', 'tbody-row-is-agg' );


  // Helpers

  function resetHeaderClasses() {
    d3.selectAll( '.thead-th' ).each( function( d, i ) {
      this.classList.remove('col-ascending');
      this.classList.remove('col-descending');
    });
  }

  function sortInt( dir, colName ) {
    rows.sort( function( a, b ) {
      if ( a[ colName ] === b[ colName ] ) {
        return d3.ascending( a[ 'name' ], b[ 'name' ] );
      } else if ( dir === 'ascending' ) {
        return a[ colName ] - b[ colName ];
      } else {
        return b[ colName ] - a[ colName ];
      }
    });
  }

  function sortString( dir, colName ) {
    rows.sort( function( a, b ) {
      if ( a[ colName ] === b[ colName ] ) {
        return d3.ascending( a[ 'name' ], b[ 'name' ] );
      } else if ( dir === 'ascending' ) {
        return d3.ascending( a[ colName ], b[ colName ] );
      } else {
        return d3.descending( a[ colName ], b[ colName ] );
      }
    });
  }

  function filterContinents( rowSelection ) {
    tableBody.selectAll( rowSelection ).classed( 'table-row-exclude', false )
      .filter( function( d, i ) {
        return continentSelects.indexOf( d[ 'continent' ] ) === -1 ;
      })
      .classed( 'table-row-exclude', 'true' );
  }

  function nestContinents() {
    return d3.nest()
      .key(function(d) { return d.continent; })
      .rollup(function(leaves) { return { 
        'gdp' : d3.sum(leaves, function(d) { return d.gdp }),
        'life_expectancy': d3.mean(leaves, function(d) { return d.life_expectancy }),
        'population': d3.sum(leaves, function(d) { return d.population })
      }; })
      .entries(data);
  }

  function flattenNest() {
    var flatArr = [];
    for ( var i = 0; i < nestedData.length; i++ ) {
      flatArr.push( {
        'name': nestedData[ i ].key,
        'continent': nestedData[ i ].key,
        'gdp': nestedData[ i ].values.gdp,
        'life_expectancy': nestedData[ i ].values.life_expectancy,
        'population': nestedData[ i ].values.population,
        'year': '2012',
        'is_agg': true
      } );
    }
    return flatArr;
  }

  // Handlers

  // Sorting
  tableColHeads.on( 'click', function( colName, i ) { 
    var dir, oppDir = '';

    // First pass we sort the table ascending (the else())
    if ( this.classList.contains( 'col-ascending' ) ) {
      dir = 'descending';
      oppDir = 'ascending'
    } else {
      dir = 'ascending';
      oppDir = 'descending'
    }

    resetHeaderClasses();
    this.classList.add( 'col-' + dir );
    ( colName === 'name' || colName === 'continent' ) ? sortString( dir, colName ) : sortInt( dir, colName ) ;

  });

  // Filtering
  d3.selectAll( '.table-chk' ).on( 'change', function() {
    continentSelects = [];
    d3.selectAll( '.table-chk:checked' ).each( function( d, i ) {
      continentSelects.push( this.getAttribute( 'name' ) );
    });

    if ( table.node().classList.contains( 'agg-continents' ) ) {
      continentSelects.length ? filterContinents( '.tbody-row-is-agg' ) : rows.classed( 'table-row-exclude', false );
    } else {
      continentSelects.length ? filterContinents( '.tbody-row-no-agg' ) : rows.classed( 'table-row-exclude', false );
    }

  });

  // Aggregating
  d3.selectAll( '.table-radio-agg' ).on( 'change', function() {
    if ( this.value === "true" ) {
      table.classed( 'agg-continents', true );
      continentSelects.length ? filterContinents( '.tbody-row-is-agg' ) : rows.classed( 'table-row-exclude', false );
    } else {
      table.classed( 'agg-continents', false );
      continentSelects.length ? filterContinents( '.tbody-row-no-agg' ) : rows.classed( 'table-row-exclude', false );
    }
  });

});
