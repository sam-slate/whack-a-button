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

//Initialize countdown variable
var seconds = 0

// Make connection
io.on('connection', (socket) => {
    console.log("Connected with socket id of: " + socket.id)

    //Add id to the scores object
    scores[socket.id] = {score: 0, name: socket.id}

    // As soon as connection is made, emit scores and playing
    io.emit('UPDATE_SCORES', scores);

    // Set up a listener to a send click emit
    // Does not matter what the data is
    socket.on('SEND_CLICK', function(){
        // Log everything
        console.log("Received SEND_CLICK from " + socket.id)

        // Check if we are currently playing
        if (playing){
            // When a click is sent, add to score table and emit data again{
            scores[socket.id]["score"] += 1
        }
    
        io.emit('UPDATE_SCORES', scores);

        console.log("Sending back scores of:")
        console.log(scores)
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
    // Expects the number of seconds as a number
    socket.on('START_CLICK', function(seconds_received){
        console.log("Received START_CLICK from " + socket.id + " with seconds:")
        console.log(seconds_received)

        // Check if already playing
        if (!playing){

            // Update seconds
            seconds = seconds_received

            // Clear scores for all players
            Object.keys(scores).map(function(key) {
                scores[key]['score'] = 0;
            });

            //Emit start and pass the number of seconds chosen and scores
            io.emit('START', seconds, scores);

            console.log("Starting countdown")
            // Wait for the countdown to stop
            setTimeout(()=>{
                console.log("Ending countdown")

                // Update playing
                playing = true
                
                //Set timeout for seconds and pass in finish function 
                setTimeout(()=>{
                    console.log("Timer is finished")

                    playing = false

                    //Emit finish with scores
                    io.emit('FINISH', scores)
                }, seconds * 1000);
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
