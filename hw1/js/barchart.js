
// GLOBAL MISC
// =============================================
var continentSelects = [];
var yearSlider = document.querySelector( '#year-slider' );
var min = 0;
var encoding = 'population';
var rows, cells, sortedCol, dir, oppDir, newYear, yearData, max;

// BAR CHART SETUP
// =============================================
var margin = { top: 0, bottom: 0, left:90, right: 0 };
var width = 700 - margin.left - margin.right;
var height = 4000 - margin.top - margin.bottom;
var xScale = d3.scale.linear().range( [ 0, width - margin.left ] );
var yScale = d3.scale.ordinal().rangeRoundBands( [ 0, height ], 0.5 );
var barColor = d3.scale.category10();

var svg = d3.select( 'body' ).append( 'svg' )
  .attr( 'width', width + margin.left + margin.right)
  .attr( 'height', height + margin.top + margin.bottom);

var barWrap = svg.append( 'g' )
  .attr( 'transform', 'translate( ' + margin.left + ',' + margin.top + ' )' )
  .attr( 'class', 'bar-wrap' );


// LOAD DATA, DRAW VIZ
// =============================================
d3.json( 'data/countries_1995_2012.json', function( error, data ) {

  // Init
  refreshData();
  setXDomain();
  setYDomain();

  // Draw viz
  var rows = barWrap.selectAll( 'g' )
    .data( yearData )
  .enter().append( 'g' )
    .attr({
      class: 'bar-row row-no-agg',
      transform: function( d, i ) { return 'translate( 0, ' + yScale( i ) + ')'; }
    });

  rows.filter( function( d, i ) {
    return d.is_agg;
  }).attr( 'class', 'bar-row row-is-agg row-is-filtered' );

  var bars = rows.append( 'rect' )
    .attr({
      width: function( d ) { return xScale( d[ encoding ] ); },
      height: yScale.rangeBand(),
      x: margin.left,
      class: 'bar-rect',
      fill: function( d ) { return barColor( d.continent ); }
    });

  var labels = rows.append( 'text' )
    .text( function(d) { return d.name; })
    .attr({
      x: margin.left - 5,
      class: 'bar-label'
    });


  // DATA HELPERS
  // =============================================

  function refreshData() {
    updateYear();
    updateAgg();
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

  function updateAgg() {
    var nestedData = nestContinents();
    var flattenedNest = flattenNest( nestedData );
    yearData = yearData.concat(flattenedNest);
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
    for ( var i = 0; i < nestedData.length; i += 1 ) {
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


  // HELPERS
  // =============================================

  function updateRowData() {
    rows.data( yearData );
  }

  function setXDomain() {
    max = d3.max( yearData, function( d ) { return d[ encoding ]; } );
    xScale.domain( [ min, max ] );
  }

  function setYDomain() {
    yScale.domain( yearData.map( function( d, i ) { return i; } ) );
  }

  function setBarWidth() {
    bars.transition()
      .attr( 'width',  function( d ) { return xScale( d[ encoding ] ); } );
  }

  function setRowY() {

    var shownRows = rows.filter( function( d, i ) {
      return !rows[0][i].classList.contains( 'row-is-filtered' );
    })

    shownRows.transition()
      .attr( 'transform',  function( d, i ) { return 'translate( 0, ' + yScale( i ) + ')'; } );
  }



  function resetHeaderClasses() {
    d3.selectAll( '.thead-th' ).each( function( d, i ) {
      this.classList.remove( 'col-ascending' );
      this.classList.remove( 'col-descending' );
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
    barWrap.selectAll( rowSelection ).classed( 'row-is-filtered', false )
      .filter( function( d, i ) {
        return continentSelects.indexOf( d[ 'continent' ] ) === -1 ;
      }).classed( 'row-is-filtered', 'true' );
  }


  // DISPATCHERS
  // =============================================

  function handleFilter() {
    if ( barWrap.node().classList.contains( 'agg-continents' ) ) {
      continentSelects.length ? filterContinents( '.row-is-agg' ) : rows.classed( 'row-is-filtered', false );
    } else {
      continentSelects.length ? filterContinents( '.row-no-agg' ) : rows.classed( 'row-is-filtered', false );
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
    var checkedEl = document.querySelector( '.radio-agg:checked' );

    if ( checkedEl && checkedEl.value === 'agg' ) {
      table.classed( 'agg-continents', true );
      continentSelects.length ? filterContinents( '.row-is-agg' ) : rows.classed( 'row-is-filtered', false );
    } else {
      table.classed( 'agg-continents', false );
      continentSelects.length ? filterContinents( '.row-no-agg' ) : rows.classed( 'row-is-filtered', false );
    }
  }




  // HANDLERS
  // =============================================

  // Encoding
  d3.selectAll( '.radio-encode' ).on( 'change', function() {
    encoding = this.value;
    setXDomain();
    setBarWidth();
  });


  // Sorting
  // tableColHeads.on( 'click', function( colName, i ) {
  //   // var dir, oppDir = '';
  //   sortedCol = colName;

  //   // First pass we sort the table ascending (the else())
  //   if ( this.classList.contains( 'col-ascending' ) ) {
  //     dir = 'descending';
  //     oppDir = 'ascending'
  //   } else {
  //     dir = 'ascending';
  //     oppDir = 'descending'
  //   }

  //   ( colName === 'name' || colName === 'continent' ) ? sortString( dir, colName ) : sortInt( dir, colName ) ;

  //   resetHeaderClasses();
  //   this.classList.add( 'col-' + dir );

  // });

  // Filtering
  d3.selectAll( '.chk' ).on( 'change', function() {
    continentSelects = [];
    d3.selectAll( '.chk:checked' ).each( function( d, i ) {
      continentSelects.push( this.getAttribute( 'name' ) );
    });
    handleFilter();
    setRowY();
  });

  // Aggregating
  d3.selectAll( '.radio-agg' ).on( 'change', function() {
    handleAgg();
  });

  // Year slider
  d3.select( '#year-slider' ).on( 'input', function() {
    refreshData();
    updateRowData();
    setXDomain();
    setBarWidth();
    // updateCells();
    // handleAgg();
    // handleFilter();
    // handleSort();
  });

});
