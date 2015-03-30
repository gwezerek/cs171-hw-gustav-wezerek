
// GLOBAL
var allData = [];
var metaData = {};
var dispatcher = {};
var dateParser = d3.time.format("%Y-%m-%d").parse;

var loadData = function(){
    queue()
      .defer( d3.json, 'data/perDayData.json' )
      .defer( d3.json, 'data/MYWorld_fields.json' )
      .await( dataLoaded );
}

var dataLoaded = function ( error, _allData, _metaData ) {
    if ( !error ) {

        allData = _allData.map( function ( d ) {

            var ageMap = d3.map( d.age, function( val ) { return val.age; } );
            var res = {
                time: dateParser( d.day ),
                count: parseInt( d[ 'count(*)' ] ),
                prios: [],
                ages: []
            };

            for ( i = 0; i < 16; i++ ) {
                res.prios.push( d[ 'sum(p' + i + ')' ] );
            }

            res.ages = d3.range( 0, 100 ).map( function( age ) {
                var count = ageMap.get( age );

                if ( count ) {
                    return count[ 'count(*)' ];
                } else {
                    return 0;
                }

            } );

            return res;
        });

        metaData = _metaData;
        initVis();
    }
};

function initDispatcher( myCount, myPrio, myAge ) {
    var dispatch = d3.dispatch( 'selectionChanged' );

    myCount.brush.on( 'brush', function() {
      dispatch.selectionChanged( myCount.brush.extent() );
    });

    dispatch.on( 'selectionChanged', function( extent ) {
        var from = d3.time.day.round( extent[0] );
        var to = d3.time.day.round( extent[1] );
        myCount.updateBrushText( from, to );
        myPrio.onSelectionChange( from, to );
        myAge.onSelectionChange( from, to );
    });

    return dispatch;
}

var initVis = function(){

    var myPrio = new PrioViz( d3.select( '#prioVis' ), allData, metaData ),
        myCount = new CountViz( d3.select( '#countVis' ), allData, metaData ),
        myAge = new AgeViz( d3.select( '#ageVis' ), allData, metaData );

    dispatcher = initDispatcher( myCount, myPrio, myAge );
}

// from answer by Lukas Eder:
// http://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates
Date.prototype.addDays = function( days ) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
}

function getDates( startDate, stopDate ) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push( new Date (currentDate) )
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}

loadData();
