!function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(o,r,function(t){return e[t]}.bind(null,r));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=8)}({8:function(e,t){console.log("TVExtender Content...setting up comms port to background");var n=chrome.runtime.connect({name:"TVE-comms-port"});n.onMessage.addListener(function(e,t){if("connAck"==e.type){console.log(e.payload),console.log("Setting up observer...");var o=new MutationObserver(function(e){e.forEach(function(e){(function(e){return"tbody"==e.target.localName&&"alert-list"==e.target.parentElement.className&&"SymbolDescriptionDate/Time"==e.target.previousElementSibling.textContent})(e)&&(console.log(e),e.addedNodes.forEach(function(e){if(function(e,t){var n=new Date,o=Math.abs(n-e);return console.log(n),console.log(e),console.log("DTS Diff: seconds = "+o/1e3),!(o/1e3>=t)}(function(e){var t=new Date;return t.setDate(e.getDate()),t.setHours(e.getHours()),t.setMinutes(e.getMinutes()),t.setSeconds(e.getSeconds()),t}(new Date(e.cells[2].innerText)),60)){var t=function(e){var t=e.search("TVE:"),n=e.search(":EVT");if(t>-1&&n>-1&&t+4<e.length)try{var o=JSON.parse(e.slice(t+4,n));return console.log(o),o}catch(e){console.log("Error parsing order text: "+e)}return console.log("Could not find TVE:/:EVT bounds in text: "+e),null}(new String(e.cells[1].innerText));null!=t?n.postMessage({type:"order",payload:t}):alert("Could not extract TVE order from alert, ignoring")}else console.log("Alert timestamp out of bounds, ignoring")}))})}),r=document.getElementsByClassName("layout__area--right")[0];o.observe(r,{attributes:!1,characterData:!1,subtree:!0,childList:!0})}})}});
//# sourceMappingURL=content.js.map