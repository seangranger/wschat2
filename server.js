var ws = require('ws');
var crypto = require('crypto');
var server = new ws.Server({
    host: '127.0.0.1',
    port: 5000
});

var clientsockets = {};

var objactions = {};

var bcastmsg = function(incobj){
  var json = JSON.stringify(incobj);
  for(var socks in clientsockets){
    clientsockets[socks].socket.send(json);
  }
};

objactions.bcastmsg = bcastmsg;

var handleincobj = function (message) {
  var incobj = JSON.parse(message);
  var reqact = incobj.type;
  var action = objactions[reqact];
  action(incobj);
};

server.on('connection',function(socket){
  //crypto.randomBytes returns a buffer ---- https://nodejs.org/api/buffer.html
  var uniquesocketid = crypto.randomBytes(7).toString('hex');
  clientsockets[uniquesocketid] = {};
  clientsockets[uniquesocketid].socket = socket;
  clientsockets[uniquesocketid].sockid = uniquesocketid;
  clientsockets[uniquesocketid].handle = uniquesocketid;

  socket.on('message', function (message) {
    //IM GOIN TO NEED SOME KIND OF HANDLER THAT EXAMINES INCOBJ.TYPE TO SEE WHAT SERVER SHOULD DO
    var incobj = JSON.parse(message);
    var objmsg = incobj.msg;
    console.log(uniquesocketid.trim()+' ('+clientsockets[uniquesocketid].handle+') : '+ objmsg.trim());
    handleincobj(message);
  });
});

process.stdin.on('data', function (data) {
  var outobj = {};
  outobj.msg = data.toString().trim();
  var json = JSON.stringify(outobj);
  for(var socks in clientsockets){
    clientsockets[socks].socket.send(json);
  }
});


