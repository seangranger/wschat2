var ws = require('ws');
var crypto = require('crypto');
var server = new ws.Server({
    host: '127.0.0.1',
    port: 5000
});
var clientsockets = {};

server.on('connection',function(socket){
  //crypto.randomBytes returns a buffer ---- https://nodejs.org/api/buffer.html
  var uniquesocketid = crypto.randomBytes(7).toString('hex');
  clientsockets[uniquesocketid] = {};
  clientsockets[uniquesocketid].socket = socket;
  clientsockets[uniquesocketid].sockid = uniquesocketid;
  clientsockets[uniquesocketid].handle = uniquesocketid;
  socket.on('message', function (message) {
    var incobj = JSON.parse(message);
    var objmsg = incobj.msg;
    console.log(uniquesocketid.trim()+' ('+clientsockets[uniquesocketid].handle+') : '+ objmsg.trim());
  });
});

process.stdin.on('data', function (data) {
  for(var socks in clientsockets){
    clientsockets[socks].socket.send(data.toString().trim());
  }
});


