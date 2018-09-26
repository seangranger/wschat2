var ws = require('ws');
var crypto = require('crypto');
var server = new ws.Server({
    host: '127.0.0.1',
    port: 5000
});
var clientsockets = {};

server.on('connection',function(socket){
  console.log('============someone connected===============');
  //crypto.randomBytes returns a buffer ---- https://nodejs.org/api/buffer.html
  var uniquesocketid = crypto.randomBytes(7).toString('hex');
  clientsockets[uniquesocketid] = {};
  clientsockets[uniquesocketid].socket = socket;
  clientsockets[uniquesocketid].sockid = uniquesocketid;
  clientsockets[uniquesocketid].handle = uniquesocketid;
  console.log(clientsockets)
});


