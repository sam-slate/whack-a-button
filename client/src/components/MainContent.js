import React from 'react';
import io from "socket.io-client";
import Form from "react-bootstrap/Form"
import Col from "react-bootstrap/Col"
import Row from "react-bootstrap/Row"
import Container from "react-bootstrap/Container"
import InputGroup from "react-bootstrap/InputGroup"
import Table from "react-bootstrap/Table"

class MainContent extends React.Component {

    constructor(props){
        super(props)

        this.state = {
            name: "Enter Name",
            entered_name: false,
            playing: false, 
            rounds: 10,
            scores: {},
            size: 4,
            position: [],
            message: "Enter your name and wait for others to join the scoreboard. Once everyone is ready, enter a number of rounds and click start!",
            jumbotron_color: "#E9ECEF"
        }

        this.button_clicked = this.button_clicked.bind(this)
        this.create_scores_array = this.create_scores_array.bind(this)
        this.name_changed = this.name_changed.bind(this)
        this.start_clicked = this.start_clicked.bind(this)
        this.handle_click_me_key_down = this.handle_click_me_key_down.bind(this)
        this.render_board = this.render_board.bind(this)

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
        // Data should be a number of rounds, size of board, and and scores as an object
        this.socket.on('START', (position, rounds, size, scores) => {
            console.log("Recieved start with rounds of: " + rounds + "and scores of: ")
            console.log(scores)

            // Change rounds, scores, message, and jumbotron color in state
            this.setState({rounds: rounds, scores: scores, message: rounds + " rounds starts in: 3", jumbotron_color: "#fff8c7"})

            setTimeout(()=>{
                this.setState({message: rounds + " rounds starts in: 2"})

                setTimeout(()=>{
                    this.setState({message: rounds + " rounds starts in: 1"})
                    setTimeout(()=>{
                        this.setState({message: rounds + " to go", position: position, playing: true, jumbotron_color: "#ffd2c7"})
                        
                    }, 1000)
                }, 1000)
            }, 1000)

        })

        // Set up listener for a new board
        // Data should be board as a list, rounds_left as a number, prevoius_clicker as a string, and scores as an object
        this.socket.on('NEW_BOARD', (position, rounds_left, previous_clicker, scores) =>{
            console.log("Recieved new position, rounds_left: " + rounds_left + " and previous_clicker: " + previous_clicker)
            console.log(position)

            var new_message = previous_clicker + " clicked first! " + rounds_left + " to go"

            this.setState({scores: scores, position: position, message: new_message})


        })

        // Set up listener for the finish
        // Data should be scores as an object
        this.socket.on('FINISH', scores => {
            console.log("Recieved finish with scores:")
            console.log(scores)

            var scores_array = this.create_scores_array()
            var game_over_message = "Game over! Winner was: " + scores_array[0][0]

            // Check if there are more than 1 players
            if (scores_array.length > 1){
                // Check to see if the top two scores are the same
                if(scores_array[0][1] === scores_array[1][1]){
                    game_over_message = "Game over! It was a tie!"
                }
            }

            this.setState({scores: scores, message: game_over_message, playing: false, jumbotron_color: "#cdffc7"})
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
        this.setState({name: e.target.value, entered_name: true})

        this.socket.emit('CHANGE_NAME', e.target.value)
    }

    button_clicked(){
        this.socket.emit('SEND_CLICK', this.state.position);

        console.log("button clicked")
    }

    start_clicked(){
        this.socket.emit('START_CLICK', this.state.rounds)

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

    render_board(){
        var rows = []
        
        for (var i = 0; i < this.state.size; i++) {
            var row = []
            for (var j = 0; j < this.state.size; j++) {
                if (this.state.position[0] === i && this.state.position[1] === j){
                    row.push(<td key={j} className="board-cell">
                        <button type="button" id="click-me-button" className="btn btn-primary" onClick={this.button_clicked} onKeyDown={this.handle_click_me_key_down}></button>
                    </td>)
                } else {
                    row.push(<td key={j} className="board-cell">________</td>)
                }
            }

            rows.push(<tr key={i} className="board-row">{row}</tr>)
        }

        return rows
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
                                    <Table bordered>
                                        <tbody>
                                            {this.render_board()} 
                                        </tbody>
                                    </Table>
                                </Row>
                            : <></>}
                            {!this.state.playing ?
                                <div>
                                    <Row className="main-content-row">
                                        <InputGroup className="mb-3">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>Name</InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <Form.Control type="text" value={this.state.entered_name ? this.state.name : null} placeholder="Enter name" onChange={this.name_changed}/>
                                        </InputGroup>
                                    </Row>
                                    <Row className="main-content-row">
                                        <InputGroup className="mb-3">
                                            <InputGroup.Prepend>
                                                <InputGroup.Text>Rounds</InputGroup.Text>
                                            </InputGroup.Prepend>
                                            <Form.Control type="number" value={this.state.rounds} onChange={e => {this.setState({rounds: e.target.value})}}/>
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