///////////////////////////////////////////////////////////////////////////////////////////////
// panel control
///////////////////////////////////////////////////////////////////////////////////////////////
// panel collapse when start
function hidePanelOnStart( panel ) {
    var affectedElement = $('.panel-body');

    // if has scroll
    if( panel.parents('.panel').find('.slimScrollDiv').length > 0 ) {
        affectedElement = $('.slimScrollDiv');
    }

    panel.parents('.panel').find(affectedElement).slideUp(0);
    panel.find('i.lnr-chevron-up').toggleClass('lnr-chevron-down');

    panel.click()
}

function isCollapsePanel( panel ) {
    return ( panel.find('i.lnr-chevron-up').hasClass('lnr-chevron-down') == false )
}

///////////////////////////////////////////////////////////////////////////////////////////////
// date control
///////////////////////////////////////////////////////////////////////////////////////////////
// String.prototype.getDateFromYMD = () => {
//     const parts = this.split('-')
//     var year = Number(parts[0])
//     if ( year < 100 ) {
//         year += 2000
//     }
//     var month = Number(parts[1])
//     var day = Number(parts[2])

//     var date = new Date( year, month-1, day );

//     return date;
// }

// function getDatetimeFromDate( date ) {
//     return date.toISOString().slice(0, 19).replace('T', ' ')
// }

// 걍 아래 쓰면 댐.
// 쿼리: STR_TO_DATE('2000-01-31', '%Y/%m/%d')
// STR_TO_DATE(str_col, '%Y/%m/%d %H:%i:%s');
// DATE_FORMAT(now(), '%Y/%m/%d')
// DATE_FORMAT(now(), '%Y/%m/%d %H:%i:%s')
