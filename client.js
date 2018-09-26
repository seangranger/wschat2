var socket = new WebSocket('ws://127.0.0.1:5000');
var button = document.createElement('button');
button.innerText = 'Login';
document.getElementById('buttonbox').appendChild(button);

/*socket.addEventListener('open', function () {
 * });
*/

socket.addEventListener('message', function(message) {
 console.log(message); 
});

var mssgsender = function () {
  //next step is to turn messages into json objects before this goes any further
  socket.send(document.getElementById('chatinput').value.toString().trim());
  document.getElementById('chatinput').value = '';
}

button.addEventListener('click', function () {
  mssgsender();
});

