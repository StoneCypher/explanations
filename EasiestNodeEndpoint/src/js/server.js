const fs           = require('fs'),       // pull the standard filesystem library in
      express      = require('express');  // pull the webserver library that we installed in

const server       = express();           // express exposes as a generator function

const htmlDocument = `${fs.readFileSync('./src/assets/index.html')}`,  // stuffing the binary into a string
      jsDocument   = `${fs.readFileSync('./src/assets/client.js')}`;   // is a quick type change

// this just repeats the header nonsense for us
const sendAs       = (res, mime, doc) => {
        res.setHeader("Content-Type", mime);
        res.send(doc);
      };

      // these functions implement the endpoint behaviors
      rootHandler  = (req, res) => sendAs(res, "text/html",              htmlDocument),
      cliJsHandler = (req, res) => sendAs(res, "application/javascript", jsDocument),

      dataHandler  = (req, res) => res.json({ randomNumber: Math.trunc(Math.random() * 100) });


// server.use gets applied to every inbound request, then next() defers as incomplete
// this allows us to put CORS headers on everything conveniently
server.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// and these are the actual endpoints, which call the functions above
server.get('/',          rootHandler);   // this says "when a GET request is made for '/', call this function"
server.get('/client.js', cliJsHandler);
server.get('/data',      dataHandler);

// finally, start the server
server.listen(15151, () => { console.log('server now running on http://127.0.0.1:15151/') } );