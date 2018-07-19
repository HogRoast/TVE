console.log("TVExtender Content...setting up comms port to background");
var port = chrome.runtime.connect({name: "TVE-comms-port"});

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
    console.log(now);
    console.log(dts);
    console.log("DTS Diff: seconds = " + dtsDiff / 1000);
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
            console.log(order);
            return order;
        } catch(e) {
            console.log("Error parsing order text: " + e);
        }
    }
    console.log("Could not find TVE:/:EVT bounds in text: " + text);
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

port.onMessage.addListener(function(msg, sender) {
    if(msg.type == "connAck"){
        console.log(msg.payload);
        console.log("Setting up observer...");
        var observer= new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if(mutantMatch(mutation)) {
                    console.log(mutation); // really useful for debugging!
                    mutation.addedNodes.forEach(function(node) {
                        // Ensure alert message was generated within the last 1 minute.
                        // 1 minute is as granular as alert timestamps get and they seem to
                        // be rounded to the nearest minute, this is not foolproof!
                        var alertDTS = new Date(node.cells[2].innerText);
                        if(withinSeconds(correctTVDTS(alertDTS), 60)) {
                            var alertStr = new String(node.cells[1].innerText);
                            var order = extractOrder(alertStr);
                            if(order != null) {
                                // post the order to the background script for further processing
                                port.postMessage({type:"order", payload:order});
                            } else {
                                alert("Could not extract TVE order from alert, ignoring");
                            }
                        } else {
                            // NOTE: not alerting this error as there will potentially be a lot of
                            // these stale alerts i.e. when the site is refreshed within the browser
                            // the alert list gets repopulated with all the previous alerts 
                            // generated in the session
                            console.log("Alert timestamp out of bounds, ignoring");
                        }
                    });
                }
            });
        });

        var rhs = document.getElementsByClassName("layout__area--right")[0];
        var config = {attributes:false, characterData:false, subtree:true, childList:true};
        observer.observe(rhs, config);
    }
});

