"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 1025;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = [ ];
/*
//HTTP server
var server = http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

// WebSocket server
var wsServer = new webSocketServer({
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    var connection = request.accept(null, request.origin);
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    console.log((new Date()) + ' Connection accepted.');
	//connection.sendUTF(request)
    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
        }
    });
    // user disconnected
    connection.on('close', function(connection) {
		console.log("closed")
		clients.splice(index, 1);
    });
});
*/



/*
var directory = express()
directory.use('/public', express.static(__dirname + '/public'));
directory.listen(1024,function(){
	console.log("Listening to port ",1024 , " for file list")
})*/
var express=require('express');
var app = express();
var expressWs = require('express-ws')(app)
app.use('/public', express.static(__dirname + '/public'));
app.use('/dist', express.static(__dirname + '/dist'));
var bodyParser = require('body-parser')
,listContents = {},port1=1024,clientNames = [],connSeq = 0
,broadcast = function(path,message){
  var sendMsg = {}
  sendMsg.path = path;
  sendMsg.data = message;
  for(var i in listContents[path]){
    try{
      listContents[path][i].send(JSON.stringify(sendMsg))
    }catch(e){
      console.log(e)
    }

  }
}
,createMultipleSockets = function(arr){
  for(var j in arr){
    var jval = arr[j];
    listContents[jval] = {};
    createClientSockets(jval)
  }
}
,createClientSockets = function(jval){

    clientNames.push(jval)
		app.ws('/'+jval, function(ws, req) {
      var conSeq = "con"+connSeq;
      connSeq++;
      console.log("Connection Established ",jval," index : ",conSeq)
      listContents[jval][conSeq]=ws;
      ws.on('message', function(msg) {
        console.log("client ",jval," message: ",msg)
        broadcast(jval,msg)
      });
      ws.on('close', function(msg) {
        console.log("closed connection for :",jval ," index ",conSeq)
      //  index = listContents[jval].indexOf(ws)
        delete listContents[jval][conSeq]
      });

		});
}


app.use(function(req, res ,next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next()
});

app.use(bodyParser.json())
app.get('/', function(req, res){
res.send('hello world');
});

app.get("/get/socketlist",function(req, res){
  res.send(clientNames)
})
app.post('/execute/set-listeners', function(req, res){
	try{
		if(typeof req.body == "object"){
			createMultipleSockets(req.body)
		}
		res.send("Success");
	} catch (e){
		res.send("Error"+e);
	}
});




app.listen(port1,function(){
	console.log("Port Open : ",port1)
})


//var io = require('socket.io')(1026);
/* Listen port*/
/*
var connect = require('connect');
var serveStatic = require('serve-static');
var portNo = 1024;
console.log("Listening to port "+portNo)
connect().use(serveStatic(__dirname)).listen(portNo);
*/
