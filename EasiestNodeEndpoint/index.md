Someone on Reddit asked "what is the easiest way to make a node endpoint?"

This is my late-2018 opinion.

# Side-node: brain-shift for scripters

The original asker is a PHP programmer.  In PHP, the webserver looks at the file type, and invokes a scripting engine if it's an appropriate asset, like a `.php`, `.aspx`, or `.cfm` script.

Node follows the more traditional path: you just write a program that knows how to open sockets and listen for `http` traffic.  So, instead of the webserver owning the app, it's the other way around: the app owns the webserver.  (This is trivially easy, because convenience libraries do the work for you.)

Whereas not a large change, it's an important piece of context for the upcoming "wait, what?" moments for people from the other arrangement.

<br/><br/>

# Easy `node.js` endpoints

I will assume you already have `node` set up, and a network with no weird firewall or routing bs going on.

<br/><br/>

## 1. Set up the project space

Generally, go somewhere on disk.  Make and enter a directory for your thing.

If it's a real project, first make it on github.  I'll assume throughout that you've used the name `node_endpoint_example`; you may use anything as long as it's a valid JS identifier, ***and starts with a lower case letter***.

So, something like

```
cd ~/projects
git clone node_endpoint_example
cd node_endpoint_example
```

On the other hand, if this is just to learn, fuck it, make it locally and throw it away

```
cd ~/projects
mkdir node_endpoint_example
cd node_endpoint_example
```

<br/><br/>

## 2. Create a new project using `npm`.

`npm` requires lower case project first letters.

Run `npm init`.  At the first step, give the same name you're using for the rest of the project, which is probably `node_endpoint_example`.

After naming it, you can just hit return through all of the questions, if you want to.  As the great sage Carl Brutananadilewski says, "it doesn't matter.  None of this matters."

All the same, good people will use the MIT license.

The end result of this is that `npm` will create a single file, `package.json`, which basically contains the answers to the questions we just gave.  The other `npm` device, the directory `node_packages`, hasn't yet been created.

Should look roughly like this:

```javascript
$ cat package.json
{
  "name": "node_endpoint_example",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "MIT"
}
```

We'll fuck with that later.

<br/><br/>

## 3. Let's install a webserver

Node has one built in. but it's a pain in the butt, so, let's use `express` instead.

Express used to be a webserver.  Now it's a wrapper for the built in one, which is better tech, because express is much more convenient.

```
npm install --save express
```

You'll note some lines have been added at the end, telling `npm` that when this package is installed, so should be `express`, at the current version (which was 4.16.4 when I wrote this,) automatically:

```javascript
$ cat package.json
{
  "name": "node_endpoint_example",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.16.4"
  }
}
```

Note: be a little careful when installing libraries.  Once in a while a bad actor will register a name similar to a real library, and do spooky shit when installing.  Go look and make sure you've got the name right.

<br/><br/>

## 4. Let's write a web app

All `express` does is all the `http` bullshit.  You still have to tell it what to say.

We'll follow standard structure here.  It isn't required or important, but it's convenient, and idiots
will complain at you less when you release it, which is a win.

Make a subdirectory called `src` containing subdirectories `js`, and `assets`.  We'll put our server `js` in `js`, and everything we send to the client (including the client `js`) in `assets`.

A big build tree that did transformation would also have directories for other languages, and a build and a dist folder, and all that nonsense.

<a alt="Sweet Brown - Ain't Nobody Got Time for That (Autotune Remix)" rel="noopener noreferrer" to target="_blank" href="https://www.youtube.com/watch?v=bFEoMO0pc7k"><img src="https://img.youtube.com/vi/bFEoMO0pc7k/0.jpg"/></a>

<br/><br/>

## 5. The HTML

The HTML is pretty simple.  Stuff it in `src/html/index.html`.

```html
<!doctype html>
<html>

  <head>
    <script type="text/javascript" src="client.js"></script>
  </head>

  <body>
    <p>The endpoint said:</p>
    <pre id="target"></pre>

    <br/><br/>

    <input type="button" value="Ask again" id="againButton" />
  </body>

</html>
```

<br/><br/>

## 6. Client JS

We'll need something to touch the endpoint.  Toss this in `src/assets/client.js`.

```javascript
window.onload = () => {

  const tgt = document.getElementById('target')

  const update = () =>
    fetch('http://127.0.0.1:15151/data')
      .then( response => response.json() )
      .then( jsonData => tgt.innerHTML = JSON.stringify(jsonData, undefined, 2) );

  document.getElementById('againButton').onclick = update;

  update();

}
```

Won't work yet because there's nothing to hit, but.

Let's fix that.

<br/><br/>

## 7. Writing the server JS

We'll need a script to be the webserver.  Shove this in `src/js/server.js`.

```javascript
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
```

Let's quickly test it by running it once.

```
node src/js/server.js
```

You should get a webserver listening on [127.0.0.1:15151](127.0.0.1:15151).  You may kill it by hitting `control-C`.

<br/><br/>

## 8. Last steps

Lastly, you should write your package script, so that users can type `npm install && npm run start` and expect things to work, without knowing how.

That's just adding line 7 here, the first line in the `scripts` block, called `start`:

```javascript
{
  "name": "node_endpoint_example",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node src/js/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {},
  "dependencies": {
    "express": "^4.16.4"
  }
}
```

And now you've implemented an entire full stack json endpoint driven frontend and backend.

Huzzah.

[Source here](https://github.com/StoneCypher/explanations/blob/master/EasiestNodeEndpoint/).
