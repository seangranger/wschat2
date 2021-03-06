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
    if(document.querySelector('.currentWindow').id !== 'groupchatdm'){
      actions.dmout(input);
    }else{
      actions.sendmssg(input); 
    }
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
  var msg = document.createElement('li');
  msg.innerText = incobj.sender+': '+incobj.msg;
  document.getElementById('groupchatdm').appendChild(msg);
};

actions.bcastmsg = bcastmsg;


var dmwincreator = function(incobjnewhandle){
  var dmwin = document.createElement('div');
  dmwin.setAttribute('class','chatWindow');
  dmwin.id = incobjnewhandle+'dm';
  var dmwinli = document.createElement('li');
  //below should be changed to add some id or something
  //line below is for test purposes
  dmwinli.innerText = 'This is the dm window for: '+incobjnewhandle;
  dmwin.appendChild(dmwinli);
  document.getElementById('chatframe').appendChild(dmwin);
};

actions.dmwincreator = dmwincreator;

var showchatwin = function(newhandle){
  var divcurrent = document.querySelector('.currentWindow');
  divcurrent.classList.remove('currentWindow');
  var dmwindow = document.getElementById(newhandle + 'dm');
  dmwindow.classList.add('currentWindow');

};

actions.showchatwin = showchatwin;

var dmout = function(input) {
  var msgobj = {};
  msgobj.type = 'dmout';
  msgobj.recip = document.querySelector('.currentWindow').id;
  msgobj.msg = input;
  var json = JSON.stringify(msgobj);
  socket.send(json);
  document.getElementById('chatinput').value = '';
};

actions.dmout = dmout;

var dmin = function(incobj){
  var sender = incobj.sender;
  //var senderwin = document.getElementById(sender+'dm');
  var incmsg = document.createElement('li');
  incmsg.innerText = sender+': '+incobj.msg;
  if(sender === handle){
    document.getElementById(incobj.recip).appendChild(incmsg);
  }else{
    document.getElementById(sender+'dm').appendChild(incmsg);
  }
};

actions.dmin = dmin;

var ulupdate = function(incobj){
  //acceptable that I get elems by class name here?
  var oldliids = [];
  var unchangeobj = incobj.unchange;
  if(unchangeobj.unchange){
    var un2change = unchangeobj.oldun;
    var un2change2 = unchangeobj.newun;
    document.getElementById(un2change+'dm').id = un2change2+'dm';
    var updatealert = document.createElement('li');
    updatealert.innerText = un2change+' has changed their handle to: '+un2change2;
    document.getElementById(un2change2+'dm').appendChild(updatealert);
    document.getElementById('userlist').removeChild(document.getElementById(un2change+'li'));
    var newunli = document.createElement('li');
    newunli.id = un2change2+'li';
    newunli.setAttribute('class','unli');
    newunli.innerText = un2change2;
    newunli.addEventListener('click',function(){
        actions.showchatwin(un2change2);
    });
    document.getElementById('userlist').appendChild(newunli);
  }
  var curruserlist = document.getElementsByClassName('unli');
  for (var i = 0;i < curruserlist.length; i++){
    oldliids.push(curruserlist[i].id); 
  }
  var incobjul = incobj.ul;
  incobjul.forEach(function(newhandle){
    //fix below so it doesnt use string append
    if(!(oldliids.includes(newhandle+'li'))){
      actions.dmwincreator(newhandle);
      if(newhandle === 'groupchat'){
        document.getElementById('groupchatdm').classList.add('currentWindow');
      }
      var unli = document.createElement('li');
      unli.innerText = newhandle; 
      unli.id = newhandle +'li';
      unli.setAttribute('class','unli');
      unli.addEventListener('click',function(){
        actions.showchatwin(newhandle);
      });
      //these also need style changes when hovered over and when corresponding chatwindow is open
      document.getElementById('userlist').appendChild(unli);
    };
  });
};

actions.ulupdate = ulupdate;

var removeuser = function(incobj){
  //DOES NOT REMOVE DM WIN SO IF WE WANT TO DO THAT IT NEEDS TO BE ADDED
  //INSTEAD OF REMOVING THIS COULD JUST BE AN IDLE INDICATOR IN UL
  var user2remove = incobj.user2remove;
//  document.getElementById('userlist').removeChild(document.getElementById(user2remove+'li'));
  var userinactive = document.createElement('li');
  userinactive.innerText = user2remove+' has logged off';
  document.getElementById(user2remove+'dm').appendChild(userinactive);
};

actions.removeuser = removeuser; 

var inactivealert = function(incobj){
  alert(incobj.recip.substring(0,incobj.recip.length - 2)+' is inactive and will not receive this until they return.(In actuality its going into a black hole right now so this would need to be updated when we have a way to deal with logged off users)');
  var msgli = document.createElement('li');
  msgli.innerText = incobj.msg;
  document.getElementById(incobj.recip).appendChild(msgli);
};

actions.inactivealert = inactivealert;

var sendmssg = function (input) {
  var msgobj = {};
  msgobj.msg = input; 
  msgobj.sender = handle;
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

