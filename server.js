var express = require('express');
var socket = require('socket.io');
var path = require('path')

var app = express();

var port = process.env.PORT || 8080;

server = app.listen(port, function(){
    console.log('server is running on port ' + port)
});

if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}   


// Socket stuff

var socket = require('socket.io');
io = socket(server);

//Initialize variable to hold scores
var scores = {}

//Initialize bool to keep track of whether playing
var playing = false

//Initialize list to hold current position
var current_position = []

//Initialize bool to keep track of whether there has been a click in the current board yet
var first_click_yet = false

//Initialize rounds variable
var rounds = 0

//Initialize the size of the playing board
var size = 4

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

function generate_new_position(size, old_position){
    console.log("Creating new position with size: " + size + " and old position of:")
    console.log(old_position)

    //Initialize new_position
    new_position = [-1, -1]
    
    do {
        // Generate new random integers
        new_position[0] = getRndInteger(0, size)
        new_position[1] = getRndInteger(0, size)

        console.log(new_position)

    } while(old_position && old_position[0] == new_position[0] && old_position[1] == new_position[1])

    return new_position
}

// Make connection
io.on('connection', (socket) => {
    console.log("Connected with socket id of: " + socket.id)

    //Add id to the scores object
    scores[socket.id] = {score: 0, name: socket.id}

    // As soon as connection is made, emit scores
    io.emit('UPDATE_SCORES', scores);

    // Set up a listener to a send click emit
    socket.on('SEND_CLICK', function(){
        // Log everything
        console.log("Received SEND_CLICK from " + socket.id)

        // Check if we are currently playing
        if (playing){
            // Check if a click has yet to be recieved
            if (!first_click_yet){
                console.log(scores[socket.id]["name"] + " has clicked first!")
                //Update first_click_yet
                first_click_yet = true
                // Add to score table
                scores[socket.id]["score"] += 1

                // Check if there are rounds left
                if (rounds === 1){
                    playing = false

                    // Emit finish with scores
                    io.emit('FINISH', scores)
                    first_click_yet = false
                } else {
                    // Generate a new position
                    current_position = generate_new_position(size, current_position)
                    //Decrement rounds
                    rounds--

                    io.emit('NEW_BOARD', current_position, rounds, scores[socket.id]["name"], scores)
                    first_click_yet = false
                }
            }  
        }
    })

    // Set up a listener to a change name emit
    // Expects data to be a string with a name
    socket.on('CHANGE_NAME', function(name){
        console.log("Received CHANGE_NAME from " + socket.id + " with name of:")
        console.log(name)

        scores[socket.id]["name"] = name

        io.emit('UPDATE_SCORES', scores);

        console.log("Sending back scores of:")
        console.log(scores)
    })

    // Set up listener for a start click emit
    // Expects the number of rounds as a number
    socket.on('START_CLICK', function(rounds_received){
        console.log("Received START_CLICK from " + socket.id + " with seconds:")
        console.log(rounds_received)

        // Check if already playing
        if (!playing){

            // Update rounds
            rounds = rounds_received

            // Clear scores for all players
            Object.keys(scores).map(function(key) {
                scores[key]['score'] = 0;
            });

            // Get initial position
            current_position = generate_new_position(size, current_position)

            //Emit start and pass the number of rounds chosen, the size, and scores
            io.emit('START', current_position, rounds, size, scores);

            console.log("Starting countdown")
            // Wait for the countdown to stop
            setTimeout(()=>{
                console.log("Ending countdown")

                // Update playing
                playing = true
                
            }, 3000)
            
        }
    })

    socket.on('disconnect', () => {
        //On disconnect, remove socket.id from scores data and emit data again
        delete scores[socket.id]
        
        io.emit('UPDATE_SCORES', scores);

        console.log(socket.id + ' disconnected');
    });
});
