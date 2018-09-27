var ws = require('ws');
var crypto = require('crypto');
var server = new ws.Server({
    host: '127.0.0.1',
    port: 5000
});
var clientsocks = {};
var objactions = {};

var bcastmsg = function(incobj){
  var json = JSON.stringify(incobj);
  for(var sock in clientsocks){
    //if(clientsocks[sock].sockid !== incobj.id){ 
    clientsocks[sock].socket.send(json);
    //}
  }
};

objactions.bcastmsg = bcastmsg;

var handleincobj = function (incobj) {
  var reqact = incobj.type;
  var action = objactions[reqact];
  action(incobj);
};
//server needs to handle connection close
server.on('connection',function(socket){
  //crypto.randomBytes returns a buffer ---- https://nodejs.org/api/buffer.html
  var sockid = crypto.randomBytes(7).toString('hex');
  clientsocks[sockid] = {};
  clientsocks[sockid].socket = socket;
  clientsocks[sockid].sockid = sockid;
  clientsocks[sockid].handle = sockid;

  socket.on('message', function (message) {
    var incobj = JSON.parse(message);
    incobj.id = sockid;
    var objmsg = incobj.msg;
    console.log(sockid.trim()+' ('+clientsocks[sockid].handle+') : '+ objmsg.trim());
    handleincobj(incobj);
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


