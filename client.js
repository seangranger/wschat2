var socket = new WebSocket('ws://127.0.0.1:5000');
var button = document.createElement('button');
button.innerText = 'Login';
document.getElementById('buttonbox').appendChild(button);

/*socket.addEventListener('open', function () {
 * });
*/

socket.addEventListener('message', function(message) {
  console.log(message);
  var incobj = JSON.parse(message.data);
  var objmsg = incobj.msg;
  console.log(objmsg); 
});

var sendmssg = function () {
  var msgobj = {};
  msgobj.msg = document.getElementById('chatinput').value.toString().trim(); 
  //line below is for server functionality testing only
  msgobj.type = 'bcastmsg';
  var json = JSON.stringify(msgobj);
  socket.send(json);
  document.getElementById('chatinput').value = '';
}

button.addEventListener('click', sendmssg);

chatinput.addEventListener('keypress',function(e){
  if(e.keyCode === 13){
    sendmssg();
  }
});

