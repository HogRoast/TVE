Trading View Extender (TVE)

version: 1.0

Listens for alerts generated within the Trading View web platform and performs trading actions.

Version 1.0 only reads from the TV alert notifications and attempts to extract JSON formatted order text from the alert message. The order text must be bound by the strings TVE: and :EVT. For example...  

TVE:{"ecn":"Binance","inst":"USDGBP", "side":"buy","type":"limit","tif":"GTD","price":0.84,"size":100,"take":0.05,"stop":-0.05}:EVT

The extension is only set to work with the UK version of the TV website...

https://uk.tradingview.com

Currently it is extracting the order text and then sending a message to the
background script. From here it is forwarded via HTTP request to another server (TVS) which actually has exchange connectivity and can parse and execute the order.

The extension is built using Webpack and transpiled using Babel, all the appropriate packages are installed in the node_modules directory. The config files can be found at the top of the project (.babelrc, webpack.config.js and package.json).
