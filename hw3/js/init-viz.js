
// GLOBAL
var allData = [];
var metaData = {};
var dispatcher = initDispatcher();
var dateParser = d3.time.format("%Y-%m-%d").parse

var loadData = function(){
    queue()
      .defer( d3.json, 'data/perDayData.json' )
      .defer( d3.json, 'data/MYWorld_fields.json' )
      .await( dataLoaded );
}

var dataLoaded = function ( error, _allData, _metaData ) {
    if ( !error ) {

        allData = _allData.map( function ( d ) {
            var ageMap = d3.map( d.age, function( val ) {
                return val.age;
            });

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

function initDispatcher() {
    var dispatch = d3.dispatch( 'selectionChanged' );

    dispatch.on( 'selectionChanged', function( extent ) {
        console.log( extent );
    });

    return dispatch;
}

var initVis = function(){

    var myPrio = new PrioViz( d3.select( '#prioVis' ), allData, metaData, dispatcher ),
        myCount = new CountViz( d3.select( '#countVis' ), allData, metaData, dispatcher ),
        myAge = new AgeViz( d3.select( '#ageVis' ), allData, metaData, dispatcher );

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
