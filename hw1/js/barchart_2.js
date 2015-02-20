
// GLOBAL MISC
// =============================================
var continentSelects = [];
var yearSlider = document.querySelector( '#year-slider' );
var min = 0;
var encoding = 'population';
var rows, cells, sortedCol, dir, oppDir, currentYear, yearData, max, currentData, aggData, rows, bars, labels, sorting;

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
  initChart();


  // DATA HELPERS
  // =============================================

  function updateYear() {
    currentYear = yearSlider.value;
  }

  function updateYearData() {
    yearData = [];

    data.forEach( function( d, i ) {
      var newEntry = getYear( d.years, currentYear );
      for ( var key in d ) {
        newEntry[ key ] = d[ key ];
      }
      yearData.push( newEntry );
    });

    currentData = yearData;
  }

  function getYear( array, year ) {
    for ( var i = 0; i < array.length; i += 1 ) {
      if ( array[i].year === parseInt( year, 10 ) ) return array[i];
    }
  }

  function updateAggData() {
    var nestedData = nestContinents();
    aggData = flattenNest( nestedData );
  }

  function nestContinents() {
    return d3.nest()
      .key( function( d ) { return d.continent; } )
      .rollup( function( leaves ) { return {
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
        'year': currentYear,
        'is_agg': true
      } );
    }
    return flatArr;
  }

  function sortData() {
    currentData.sort( function( a, b ) {
      if ( a[ sorting ] === b[ sorting ] ) {
        return d3.ascending( a[ 'name' ], b[ 'name' ] );
      } else {
        return b[ sorting ] - a[ sorting ];
      }
    });
  }

  function filterData() {
    currentData = currentData.filter( function( d, i ) {
      return continentSelects.indexOf( d[ 'continent' ] ) === 0 ;
    })
  }


  // HELPERS
  // =============================================

  function initChart() {
    updateYear();
    updateYearData();
    updateAggData();
    setXDomain();
    setYDomain();
    setEncoding();
    setSorting();
    updateRows();
  }

  function setXDomain() {
    max = d3.max( currentData, function( d ) { return d[ encoding ]; } );
    xScale.domain( [ min, max ] );
  }

  function setYDomain() {
    yScale.domain( currentData.map( function( d, i ) { return i; } ) );
  }

  function setEncoding() {
    encoding = d3.select( '.radio-encode:checked' ).node().value;
  }

  function setSorting() {
    sorting = d3.select( '.radio-sort:checked' ).node().value;
  }

  function updateBarWidth() {
    bars.transition()
      .attr( 'width',  function( d ) { return xScale( d[ encoding ] ); } );
  }

  function joinData() {

  }

  function updateRows() {

    // start with data for selected year
    currentData = yearData;

    // check agg
    if ( document.querySelector( '.radio-agg:checked' ).value === 'agg' ) currentData = aggData;

    // check filter
    if ( continentSelects.length ) filterData();

    // sort
    sortData();

    // Draw viz
    rows = barWrap.selectAll( 'g' )
      .data( currentData );

    rows.enter().append( 'g' )
      .attr({
        class: 'bar-row',
        transform: function( d, i ) { return 'translate( 0, ' + yScale( i ) + ')'; }
      });

    bars = rows.append( 'rect' )
      .attr({
        width: function( d ) { return xScale( d[ encoding ] ); },
        height: yScale.rangeBand(),
        x: margin.left,
        class: 'bar-rect',
        fill: function( d ) { return barColor( d.continent ); }
      });

    labels = rows.append( 'text' )
      .text( function(d) { return d.name; })
      .attr({
        x: margin.left - 5,
        class: 'bar-label'
      });

    // Remove unecessary els
    rows.exit()
      .remove();

  }


  // HANDLERS
  // =============================================

  // Encoding
  d3.selectAll( '.radio-encode' ).on( 'change', function() {
    setEncoding();
    setXDomain();
    updateBarWidth();
  });

  // Sorting
  d3.selectAll( '.radio-sort' ).on( 'change', function() {
    setSorting();
    sortData();
    updateRows();
  });

  // Filtering
  d3.selectAll( '.chk' ).on( 'change', function() {
    continentSelects = [];
    d3.selectAll( '.chk:checked' ).each( function( d, i ) {
      continentSelects.push( this.getAttribute( 'name' ) );
    });
    updateRows();
  });

  // Aggregating
  d3.selectAll( '.radio-agg' ).on( 'change', function() {
    updateRows();
  });

  // Year slider
  d3.select( '#year-slider' ).on( 'input', function() {
    updateYear();
    updateYearData();
    updateAggData();
    updateRows();
  });

});
