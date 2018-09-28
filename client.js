var socket = new WebSocket('ws://127.0.0.1:5000');
var sendloginbutton = document.createElement('button');
sendloginbutton.innerText = 'Login';
document.getElementById('buttonbox').appendChild(sendloginbutton);
var handle;
var actions = {};

socket.addEventListener('open', function () {
});

var reqhandlechange = function(input){
  if(handle === undefined){
    handle = 'pending';
  }
  var msgobj = {};
  msgobj.reqdhandle = input; 
  msgobj.type = 'reqhandlechange';
  var json = JSON.stringify(msgobj);
  socket.send(json);
  document.getElementById('chatinput').value = '';
};

actions.reqhandlechange = reqhandlechange;
actions.reqhandlechange.reqarg = true;

//change this to processinput
var handleinput = function(){
  var input = document.getElementById('chatinput').value.toString().trim();
  //where does pending handle go in here and what does it do?
  if(handle === undefined && (!(chatinput.value.match(/^[0-9a-z]+$/)) || chatinput.value.toString().length > 15 )){
    alert('Invalid user name. Please only use alpha numeric characters. Usernames may be up to 15 characters long.');
  }else if(handle === undefined){
    var actcalled = actions['reqhandlechange'];
    actcalled(input);
  }else if(input[0] === '/'){
    var actreq = input.split(' ')[0].substring(1,input.split(' ')[0].length);
    var actcalled = actions[actreq];
    if(actcalled === undefined){
      alert('That is not a recognized command.');
    }else if(input.indexOf(' ') < 1 && actcalled.reqarg === true){
      alert('Please enter an argument');
    }else{
      var arg = input.substring(input.indexOf(input.split(' ')[1]),input.length).trim();
      actcalled(arg);
  }}else{
    actions['sendmssg'](input); 
  }
};

var denial = function(obj){
  alert(obj.msg);
  if(handle === 'pending'){
    handle = undefined;
  }
};

actions.denial = denial;

var unconfirm = function(obj) {
  alert(obj.msg);
  handle = obj.handle;
};

actions.unconfirm = unconfirm;

var handleincobj = function(message){
  var incobj = JSON.parse(message.data);
  var objmsg = incobj.msg;
  var action = actions[incobj.type];
  action(incobj);
};

socket.addEventListener('message', function(message) {
  handleincobj(message);
  console.log(message);
});

var bcastmsg = function(incobj){
  console.log(incobj.msg);
};

actions.bcastmsg = bcastmsg;

var ulupdate = function(incobj){
  //remove child elems
 var curruserlist = document.getElementById('userlist');
 while (curruserlist.firstChild) {
   curruserlist.removeChild(curruserlist.firstChild);
 }
  var updatedul = incobj.ul;
  for(var newhandle in updatedul){
    var unli = document.createElement('li');
    unli.innerText = updatedul[newhandle]; 
    curruserlist.appendChild(unli);
  }
};

actions.ulupdate = ulupdate;

var sendmssg = function (input) {
  var msgobj = {};
  msgobj.msg = input; 
  //line below is for server functionality testing only
  msgobj.type = 'bcastmsg';
  var json = JSON.stringify(msgobj);
  socket.send(json);
  document.getElementById('chatinput').value = '';
};

actions.sendmssg = sendmssg;

//could not put handleinput directly into eventlistener
sendloginbutton.addEventListener('click', function(){
  handleinput();
});

chatinput.addEventListener('keypress',function(e){
  if(e.keyCode === 13){
    handleinput();
  }
});

