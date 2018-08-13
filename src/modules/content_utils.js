'use strict';

// TradingView gives a datetimestamp in it's alert notifications of the form MMM DD HH:MM
// The JS Date constructor assumes a year of 2001 for some reason, so we need to correct
// for the current year instead. NOTE: this is something of an assumption as it perfectly possible
// that incoming dts was generated in a previous year, however in practice I suspect this is a safe
// enough assumption to make!
function correctTVDTS(tvDTS) {
    var corrected = new Date();
    corrected.setDate(tvDTS.getDate());
    corrected.setHours(tvDTS.getHours());
    corrected.setMinutes(tvDTS.getMinutes());
    corrected.setSeconds(tvDTS.getSeconds());
    return corrected;
}

// Check if the supplied datetimestamp is within a certain number of seconds of 'now'
function withinSeconds(dts, seconds) {
    var now = new Date();
    var dtsDiff = Math.abs(now - dts); 
    console.debug(now);
    console.debug(dts);
    console.debug("DTS Diff: seconds = " + dtsDiff / 1000);
    // times are in milliseconds
    return (dtsDiff / 1000 >= seconds) ? false : true;
}

// Extract the TVE order details from a portion of text. TVE order details are bounded by
// TVE: and :EVT with the internals being a string rep of a JSON object
function extractOrder(text) {
    var idxS = text.search('TVE:');
    var idxE = text.search(':EVT');
    if(idxS > -1 && idxE > -1 && idxS + 4 < text.length) {
        try {
            var order = JSON.parse(text.slice(idxS + 4, idxE));
            console.debug(order);
            return order;
        } catch(e) {
            console.error("Error parsing order text: " + e);
        }
    } else {
        console.error("Could not find TVE:/:EVT bounds in text: " + text);
    }
    return null;
}

// returns true if the mutation is one we are interested in...
function mutantMatch(mutation) {
    if(mutation.target.localName == 'tbody' 
            && mutation.target.parentElement.className == 'alert-list' 
            // This is to differentiate from the alert-list used for alert management
            && mutation.target.previousElementSibling.textContent == 'SymbolDescriptionDate/Time') {
        return true;
    }
    return false;
}

export {correctTVDTS, withinSeconds, extractOrder, mutantMatch};
