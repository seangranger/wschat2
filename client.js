var socket = new WebSocket('ws://127.0.0.1:5000');
var button = document.createElement('button');
button.innerText = 'Login';
document.getElementById('buttonbox').appendChild(button);

socket.addEventListener('open', function(){
  console.log('=========I\'m connected===========');
});
