import React from 'react';
import io from "socket.io-client";
import Form from "react-bootstrap/Form"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Container from "react-bootstrap/Container"
import Jumbotron from "react-bootstrap/Jumbotron"
import InputGroup from "react-bootstrap/InputGroup"

class MainContent extends React.Component {

    constructor(props){
        super(props)

        this.state = {
            name: "Enter Name",
            playing: false, 
            seconds: 10,
            scores: {},
            message: "Enter your name and wait for others to join the scoreboard. Once everyone is ready, enter a number of seconds and click start!",
            jumbotron_color: "#E9ECEF"
        }

        this.button_clicked = this.button_clicked.bind(this)
        this.create_scores_array = this.create_scores_array.bind(this)
        this.name_changed = this.name_changed.bind(this)
        this.start_clicked = this.start_clicked.bind(this)
        this.handle_click_me_key_down = this.handle_click_me_key_down.bind(this)

    }

    componentDidMount(){
        // Initialize socket

        this.socket = io();

        // Set up a listener for scores as an object
        this.socket.on('UPDATE_SCORES', scores => {
            console.log("Recieved new scores:")
            console.log(scores)

            // When getting updated num clicks data, change state
            this.setState({scores: scores})
        });

        // Set up listener for the start
        // Data should be a number of seconds and scores as an object
        this.socket.on('START', (seconds, scores) => {
            console.log("Recieved start with seconds of: " + seconds + "and scores of: ")
            console.log(scores)

            // Change seconds, scores, message, and jumbotron color in state
            this.setState({seconds: seconds, scores: scores, message: seconds + " seconds starts in: 3", jumbotron_color: "#fff8c7"})

            setTimeout(()=>{
                this.setState({message: seconds + " seconds starts in: 2"})

                setTimeout(()=>{
                    this.setState({message: seconds + " seconds starts in: 1"})
                    setTimeout(()=>{
                        this.setState({message: seconds + " seconds", playing: true, jumbotron_color: "#ffd2c7"})

                        var x = seconds - 1;
                        var intervalID = setInterval(() => {
                            if (x ===  1){
                                this.setState({message: x + " second"})
                            } else {
                                this.setState({message: x + " seconds"})
                            }

                            if (--x === -1) {
                                clearInterval(intervalID);

                                var scores_array = this.create_scores_array()

                                var game_over_message = "Game over! Winner was: " + scores_array[0][0]

                                // Check if there are more than 1 players
                                if (scores_array.length > 1){
                                    // Check to see if the top two scores are the same
                                    if(scores_array[0][1] === scores_array[1][1]){
                                        game_over_message = "Game over! It was a tie!"
                                    }
                                }

                                this.setState({message: game_over_message, jumbotron_color: "#cdffc7"})

                            }
                        }, 1000);
                        
                    }, 1000)
                }, 1000)
            }, 1000)

        })

        // Set up listener for the finish
        // Data should be scores as an object
        this.socket.on('FINISH', scores => {
            console.log("Recieved finish with scores:")
            console.log(scores)

            this.setState({scores: scores, playing: false})
        })
    }

    // Used to prevent holding down enter cheat
    handle_click_me_key_down(e){
        if (e.key === 'Enter') {
            console.log('Enter is pressed');

            e.preventDefault()
        }
    }

    name_changed(e){
        this.setState({name: e.target.value})

        this.socket.emit('CHANGE_NAME', e.target.value)
    }

    button_clicked(event){
        this.socket.emit('SEND_CLICK');

        console.log("button clicked")

        // event.preventDefault()
    }

    start_clicked(){
        this.socket.emit('START_CLICK', this.state.seconds)

        console.log('start button clicked')
    }

    create_scores_array(){
         // Create scores array
         var scores_array = Object.keys(this.state.scores).map(key => {
            return [this.state.scores[key]["name"], this.state.scores[key]["score"]];
        });
        
        // Sort the array based on the second element
        scores_array.sort(function(first, second) {
            return second[1] - first[1];
        });

        return scores_array
    }

    render(){

        return(
                <Container id="main-content-container">
                    <Row>
                        <Col md={{ span: 4, offset: 4 }}>
                            <Row className="main-content-row">
                                <div className="jumbotron element-full-width" style={{backgroundColor: this.state.jumbotron_color}}>
                                    <p className="jumbotron-message">{this.state.message}</p>
                                </div>
                            </Row>
                            {this.state.playing ?
                                <Row className="main-content-row justify-content-center">
                                    <button type="button" id="click-me-button" className="btn btn-primary btn-lg" onClick={this.button_clicked} onKeyDown={this.handle_click_me_key_down}>Click Me</button>
                                </Row>
                            : <></>}
                            {!this.state.playing ?
                                <div>
                                    <Row className="main-content-row">
                                        <InputGroup className="mb-3">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>Name</InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <Form.Control placeholder="Enter name" onChange={this.name_changed}/>
                                        </InputGroup>
                                    </Row>
                                    <Row className="main-content-row">
                                        <InputGroup className="mb-3">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>Seconds</InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <Form.Control value={this.state.seconds} onChange={e => {this.setState({seconds: e.target.value})}}/>
                                            <InputGroup.Append>
                                                <button type="button" id="start-button" className="btn btn-success btn-sm" onClick={this.start_clicked}>Start</button>
                                            </InputGroup.Append>
                                        </InputGroup>
                                    </Row>
                                </div>
                              : <></> }
                            <Row className="main-content-row justify-content-center">
                                <div>
                                    <b>Scoreboard:</b>
                                    <ol>
                                        {this.create_scores_array().map((value, index) => {
                                            return <li key={index}>{value[0]}: {value[1]}</li>
                                        })}
                                    </ol>
                                </div>
                            </Row>
                        </Col>
                    </Row>
                </Container>
        )
    }
}

export default MainContent