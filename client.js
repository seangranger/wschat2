var socket = new WebSocket('ws://127.0.0.1:5000');
var button = document.createElement('button');
button.innerText = 'Login';
document.getElementById('buttonbox').appendChild(button);
var handle;
var actions = {};

/*socket.addEventListener('open', function () {
 * });
*/

var handleinput = function(input){
  if(input[0] === '/'){
    var actreq = input.split(' ')[0];
    var actcalled = actions[actreq];
    actcalled(input.subtstring(input.indexOf(' ')+1));
  }else{
    actions.sendmssg(input); 
  }
};

socket.addEventListener('message', function(message) {
  console.log(message);
  var incobj = JSON.parse(message.data);
  var objmsg = incobj.msg;
  console.log(objmsg); 
});

var sendmssg = function (input) {
  var msgobj = {};
  msgobj.msg = input; 
  //line below is for server functionality testing only
  msgobj.type = 'bcastmsg';
  var json = JSON.stringify(msgobj);
  socket.send(json);
  document.getElementById('chatinput').value = '';
}

actions.sendmssg = sendmssg;

//could not put handleinput directly into eventlistener
button.addEventListener('click', function(){
  handleinput(document.getElementById('chatinput').value.toString().trim());
});

chatinput.addEventListener('keypress',function(e){
  if(e.keyCode === 13){
    handleinput(document.getElementById('chatinput').value.toString().trim());
  }
});

