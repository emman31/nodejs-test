var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var field = {
  height:500,
  width:500
}

var starting = [{x:50,y:50},{x:200,y:50},{x:200,y:200}]
var players = {};
var nbPlayers = 0;


io.sockets.on('connection', function (socket) {
  // log
  initNewPlayer(socket);
  
  // logout.
  socket.on('disconnect', function (data) {
    console.log("Disconnected: " + socket.id);
    socket.broadcast.emit('remove player', socket.id);
    delete players[socket.id];
    nbPlayers --;
    logInfo();
  });
});


function logInfo() {
  console.log("Players left: " + nbPlayers);
  for(var i in players) {
    console.log(i + ": " + players[i].id);
  }
}


/**
 * Initialize the field and a character for a new player.
 */
function initNewPlayer(socket) {
  socket.emit('init field', field);

  // First display existing players.
  for(var id in players) {
    socket.emit('set position', players[id]);
  }

  // setup the new player.
  var pos = starting[(nbPlayers)%starting.length];
  player = {
    x:Math.floor((Math.random()*field.width)+1),
    y:Math.floor((Math.random()*field.height)+1),
    width:3,
    height:3,
    color:get_random_color(),
    id:socket.id,
  };
  players[socket.id] = player;
  nbPlayers ++;

  // Display the new player to everyone !
  socket.broadcast.emit('set position', player);
  socket.emit('set position', player, true);

  // log
  console.log("Client " + socket.id + " connected with ip " + socket.handshake.address.address + ":" + socket.handshake.address.port);
  logInfo();
  socket.emit('message', "Connected to the server. Welcome !");
}

function get_random_color() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}
