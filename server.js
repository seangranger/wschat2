var ws = require('ws');
var crypto = require('crypto');
var server = new ws.Server({
    host: '127.0.0.1',
    port: 5000
});
var clientsocks = {};
var objactions = {};

var reqhandlechange = function(incobj){
  var exists = false;
  for (var sock in clientsocks){
    //Sanitization should be checked on server side as well
    if(incobj.reqdhandle === clientsocks[sock].handle){
      exists = true;
    }
  }
  if(exists === true){
      var outobj = {};
      outobj.type = 'denial';
      outobj.msg = 'That user name is unavailable. Please choose a different one.'; 
      var json = JSON.stringify(outobj);
      clientsocks[incobj.id].socket.send(json);
      return;
    }else{
      clientsocks[incobj.id].handle = incobj.reqdhandle;
      var outobj = {};
      outobj.type = 'unconfirm';
      outobj.handle = clientsocks[incobj.id].handle;
      outobj.msg = 'your handle has been changed to: '+clientsocks[incobj.id].handle;
      var json = JSON.stringify(outobj);
      clientsocks[incobj.id].socket.send(json);
    }
  };

objactions.reqhandlechange = reqhandlechange;

var bcastmsg = function(incobj){
  var json = JSON.stringify(incobj);
  for(var sock in clientsocks){
    //if(clientsocks[sock].sockid !== incobj.id){ 
    clientsocks[sock].socket.send(json);
    //}
  }
};

objactions.bcastmsg = bcastmsg;

//should be process incobj
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
    if(objmsg !== undefined){
      var objmsg = incobj.msg;
    }
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


