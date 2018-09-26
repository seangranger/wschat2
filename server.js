var ws = require('ws');
var server = new ws.Server({
    host: '127.0.0.1',
    port: 5000
});
server.on('connection',function(socket){
  console.log('============someone connected===============')
});


