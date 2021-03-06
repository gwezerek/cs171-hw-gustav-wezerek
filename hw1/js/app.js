// Global
var continentSelects = [];
var yearSlider = document.querySelector( '#year-slider' );

// Helpers
var addCommas = d3.format(',');
function toSF4( num ) {
  var prefix = d3.formatPrefix( num );
  return prefix.scale( num ).toFixed(1) + prefix.symbol;
}

// Generate viz
d3.json( 'data/countries_1995_2012.json', function( error, data ){

  var columns = [ 'name', 'continent', 'gdp', 'life_expectancy', 'population', 'year' ];
  var rows, cells, sortedCol, dir, oppDir, newYear, yearData;

  // Init
  setSliderRange();
  updateYear();
  updateAgg();

  // Drawing the table
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
  rows = tableBody.selectAll( 'tr' )
    .data( yearData )
  .enter().append( 'tr' )
    .attr( 'class', 'tbody-row-no-agg' );

  // Table cells
  cells = rows.selectAll( 'td' )
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

  function updateCells() {

    // Update the data
    rows.data( yearData );

    // Repopulate the table
    cells.data( function( d ) {
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
    .text( function( d ) {
      return d;
    });

    rows.attr( 'class', 'tbody-row-no-agg' )
      .filter( function( d, i ) {
        return d.is_agg;
      }).attr( 'class', 'tbody-row-is-agg' );

  }

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
      .key( function(d) { return d.continent; } )
      .rollup( function(leaves) { return {
        'gdp' : d3.sum( leaves, function(d) { return d.gdp } ),
        'life_expectancy': d3.mean( leaves, function(d) { return d.life_expectancy } ),
        'population': d3.sum( leaves, function(d) { return d.population } )
      }; } )
      .entries( yearData );
  }

  function flattenNest( nestedData ) {
    var flatArr = [];
    for ( var i = 0; i < nestedData.length; i++ ) {
      flatArr.push( {
        'name': nestedData[ i ].key,
        'continent': nestedData[ i ].key,
        'gdp': nestedData[ i ].values.gdp,
        'life_expectancy': nestedData[ i ].values.life_expectancy,
        'population': nestedData[ i ].values.population,
        'year': newYear,
        'is_agg': true
      } );
    }
    return flatArr;
  }

  function setSliderRange() {
    var sliderLabels = document.querySelectorAll( '.slider-label' );
    var lowest = Number.POSITIVE_INFINITY;
    var highest = Number.NEGATIVE_INFINITY;
    var tmp;
    data.forEach( function( d, i ) {
      if ( d.years ) {
        for ( var i = 0; i < d.years.length; i += 1 ) {
          tmp = d.years[i].year;
          if (tmp < lowest) lowest = tmp;
          if (tmp > highest) highest = tmp;
        }
      }
    })
    sliderLabels[0].innerHTML = lowest;
    sliderLabels[1].innerHTML = highest;
    yearSlider.setAttribute( 'min', lowest );
    yearSlider.setAttribute( 'max', highest );
  }

  function updateYear() {
    yearData = [];
    newYear = yearSlider.value;
    var newEntry = {};

    data.forEach( function( d, i) {
      newEntry = getYear( d.years, newYear );
      for (var key in d) { newEntry[key] = d[key]; }
      delete newEntry.years;
      yearData.push( newEntry );
    });
  }

  function getYear( array, year ) {
    for ( var i = 0; i < array.length; i += 1 ) {
      if ( array[i].year === parseInt( year, 10 ) ) return array[i];
    }
  }

  function handleFilter() {
    if ( table.node().classList.contains( 'agg-continents' ) ) {
      continentSelects.length ? filterContinents( '.tbody-row-is-agg' ) : rows.classed( 'table-row-exclude', false );
    } else {
      continentSelects.length ? filterContinents( '.tbody-row-no-agg' ) : rows.classed( 'table-row-exclude', false );
    }
  }

  function handleSort() {
    dir, oppDir = '';

    // First pass we sort the table ascending (the else())
    if ( document.querySelector( '.col-ascending' ) ) {
      dir = 'ascending';
      oppDir = 'descending'
    } else {
      dir = 'descending';
      oppDir = 'ascending'
    }

    ( sortedCol === 'name' || sortedCol === 'continent' ) ? sortString( dir, sortedCol ) : sortInt( dir, sortedCol ) ;
  }

  function handleAgg() {
    var checkedEl = document.querySelector( '.table-radio-agg:checked' );

    if ( checkedEl && checkedEl.value === "agg" ) {
      table.classed( 'agg-continents', true );
      continentSelects.length ? filterContinents( '.tbody-row-is-agg' ) : rows.classed( 'table-row-exclude', false );
    } else {
      table.classed( 'agg-continents', false );
      continentSelects.length ? filterContinents( '.tbody-row-no-agg' ) : rows.classed( 'table-row-exclude', false );
    }
  }

  function updateAgg() {
    var nestedData = nestContinents();
    var flattenedNest = flattenNest( nestedData );
    yearData = yearData.concat(flattenedNest);
  }

  // Handlers

  // Sorting
  tableColHeads.on( 'click', function( colName, i ) {
    // var dir, oppDir = '';
    sortedCol = colName;

    // First pass we sort the table ascending (the else())
    if ( this.classList.contains( 'col-ascending' ) ) {
      dir = 'descending';
      oppDir = 'ascending'
    } else {
      dir = 'ascending';
      oppDir = 'descending'
    }

    ( colName === 'name' || colName === 'continent' ) ? sortString( dir, colName ) : sortInt( dir, colName ) ;

    resetHeaderClasses();
    this.classList.add( 'col-' + dir );

  });

  // Filtering
  d3.selectAll( '.table-chk' ).on( 'change', function() {
    continentSelects = [];
    d3.selectAll( '.table-chk:checked' ).each( function( d, i ) {
      continentSelects.push( this.getAttribute( 'name' ) );
    });
    handleFilter();
  });

  // Aggregating
  d3.selectAll( '.table-radio-agg' ).on( 'change', function() {
    handleAgg();
  });

  // Year slider
  d3.select( '#year-slider' ).on( 'input', function() {
    updateYear();
    updateAgg();
    updateCells();
    handleAgg();
    handleFilter();
    handleSort();
  });

});
