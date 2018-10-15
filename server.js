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
      //can below be removed?
      return;
    }else{
      var unchangeobj = {};
      unchangeobj.oldun = clientsocks[incobj.id].handle 
      unchangeobj.newun = incobj.reqdhandle;
      console.log(unchangeobj);
      if(clientsocks[incobj.id].handle === incobj.id){
        unchangeobj.unchange = false;
      }else{
        unchangeobj.unchange = true;
      }
      clientsocks[incobj.id].handle = incobj.reqdhandle;
      var outobj = {};
      outobj.type = 'unconfirm';
      outobj.handle = clientsocks[incobj.id].handle;
      outobj.msg = 'your handle has been changed to: '+clientsocks[incobj.id].handle;
      var json = JSON.stringify(outobj);
      clientsocks[incobj.id].socket.send(json);
      console.log(clientsocks[incobj.id].handle);
      console.log(incobj.id);
      objactions.updateul(unchangeobj);
    }
  };

objactions.reqhandlechange = reqhandlechange;

//this is sending unique ids and shouldnt be
var bcastmsg = function(incobj){
  var json = JSON.stringify(incobj);
  for(var sock in clientsocks){
    //if(clientsocks[sock].sockid !== incobj.id){ 
    clientsocks[sock].socket.send(json);
    //}
  }
};

objactions.bcastmsg = bcastmsg;

var dmout = function(incobj){
  var msg = incobj.msg;
  //I think that incobj has unique id so it may need to be stripped and repackaged but well test for now
  var recip = incobj.recip.substring(0,incobj.recip.length-2);
  //what indicates sender in incobj?
  incobj.sender = clientsocks[incobj.id].handle;
  var inactive;
  for (var client in inactiveusers){
    if (inactiveusers[client].handle === recip){
      inactive = true;
    }
  }
  if(inactive){
    incobj.type = 'inactivealert';
  }else{
    incobj.type = 'dmin';
  }
  var json = JSON.stringify(incobj);
  for (var sock in clientsocks){
    if(clientsocks[sock].handle === recip || clientsocks[sock].handle === incobj.sender){
      clientsocks[sock].socket.send(json);
    }
  }
};

objactions.dmout = dmout; 

var removeuser = function(user2remove){
  var outobj = {};
  outobj.type = 'removeuser';
  outobj.user2remove = user2remove; 
  var json = JSON.stringify(outobj);
  for (var sock in clientsocks){
    if(clientsocks[sock].handle !== clientsocks[sock].sockid){
      clientsocks[sock].socket.send(json);
    }
  }
};

objactions.removeuser = removeuser;

var updateul = function(unchangeobj){
  var outobj = {};
  var ul = ['groupchat'];
  for (var sock in clientsocks){
    if(clientsocks[sock].handle !== clientsocks[sock].sockid){
      ul.push(clientsocks[sock].handle);
    }
  }
  outobj.type = 'ulupdate';
  outobj.ul = ul;
  outobj.unchange = unchangeobj;
  var json = JSON.stringify(outobj);
  for (var sock in clientsocks){
  //is this being handled somewhere else and if not shouldnt it be?
  //note this is different from line above 
    if(clientsocks[sock].handle !== clientsocks[sock].sockid){
      clientsocks[sock].socket.send(json);
    }
  }
};

objactions.updateul = updateul;

//should be process incobj
var handleincobj = function (incobj) {
  var reqact = incobj.type;
  var action = objactions[reqact];
  action(incobj);
};

var inactiveusers = {};

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
  //tab close is not closing socket?
  socket.on('close', function(){
    //Can we actually assume it was closed by client?
    console.log('Connection closed by client.');
    console.log('Removing ('+clientsocks[sockid].handle+') from users');
    if(clientsocks[sockid].handle != sockid){
      inactiveusers[sockid] = clientsocks[sockid];
      delete clientsocks[sockid];
      removeuser(inactiveusers[sockid].handle);
    }else{
      delete clientsocks[sockid];
    }
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


