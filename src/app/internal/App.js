import React from 'react';
import { Button, Modal, ProgressBar } from 'react-bootstrap';
import { URLs, EMAIL_CREDENTIAL, PASS_CREDENTIAL } from '../../helpers/constants';
import './App.css';

// MARK - Helpers

/**
 * Returns the object's keys (which have non-falsy values).
 * @param {Object} json 
 * @returns the object's keys
 */
var iterable = (json) => {
    let list = [];
    Object.keys(json).forEach((key) => {
        if (json[key]) list.push(key);
    });
    return list;
}

/**
 * Color helper for calculating a grey-scale
 * gradient based on tree depth.
 * @param {int} depth 
 * @returns the color
 */
function calcColor(depth) {
    let calc = 255 - ((depth + 1) * 10);
    let rgb = 'rgb(' + calc + ', ' + calc + ', ' + calc + ')';
    return rgb;
}

// MARK - Components

/**
 * @param {*} props
 * @returns The verify choice component
 */
function VerifyChoice_Modal(props) {
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Verify Selection
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h4>{props.title}</h4>
                <p>
                    {props.description}
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.verify}>Confirm</Button>
            </Modal.Footer>
        </Modal>
    );
}

/**
 * Renders a nested JSON structure.
 */
class JSONComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: this.props.data, depth: this.props.depth, childVisible: {} };
    }

    /**
     * Inform the parent of this item's selection.
     * @param {Array} arr the array
     * @param {String} name the name
     */
    handlecallback = (arr, name) => {
        if (this.props.index !== undefined)
            arr.push(this.props.index);
        this.props.callback(arr, name);
    }
    /**
     * Toggle the visibility of a child component
     * @param {Object} child
     * @param {int} the child index
     */
    toggle = (child, i) => {
        // get the child's JSON data
        let json = this.state.data;
        let next_children = iterable(json[child]);
        // if the child has no more children, it has been selected.
        let next_exist = next_children.length > 0;
        if (!next_exist) {
            this.props.callback([i, this.props.index], child);
        }
        // Perform the toggle
        if (this.isVisible(child)) {
            let childVisible = this.state.childVisible;
            childVisible[child] = false;
            this.setState({ childVisible: childVisible });
        } else {
            let childVisible = this.state.childVisible;
            childVisible[child] = true;
            this.setState({ childVisible: childVisible });
        }
    }
    /* determines if a child component should be displayed. */
    isVisible = (child) => this.state.childVisible[child] === true;

    render() {
        let json = this.state.data;
        let depth = this.state.depth;
        let html = (
            <div>
                {iterable(json).map((child, i) => {
                    let next_children = iterable(json[child]);
                    let next_exist = next_children.length > 0;
                    return (<div>
                        <div class='json' style={{ marginLeft: 10 * (depth + 1), color: next_exist ? 'black' : 'blue', backgroundColor: calcColor(depth) }} onClick={() => this.toggle(child, i)}>{child}</div>
                        <div class={this.isVisible(child) ? 'visible' : 'hidden'}>
                            <JSONComponent index={i} callback={this.handlecallback} data={json[child]} depth={depth + 1} />
                        </div>
                    </div>
                    );
                })}
            </div>
        )
        return html;
    }
}

/**
 * A UI wrapper for the JSON component
 * @param {Object} json 
 * @param {*} callback
 * @returns 
 */
function JSONHolder(json, callback) {
    return <div class='jsonwrapper'><JSONComponent data={json} depth={0} callback={callback} /></div>
}

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: null, //d.data.dir,
            loginStatus: 0,
            ws: null,   // web socket to backend
            ws_filmData: null,
            session_id: null,
            showVerifyModel: false,
            showVerifyModel_GetFilmData: false,
            Selection_string: null,
            Selection_arr: null,
            Selection_string_video: null,
            Selection_id_video: null,
            videos: []
        };
    }

    /**
     * Retrieve the JSON selection
     * @param {Array} arr
     * @param {String} name 
     */
    Retrieve_JSON_Selection = (arr, name) => {
        arr = arr.reverse();
        console.log(arr);
        this.setState({ Selection_string: name, Selection_arr: arr, showVerifyModel: true });
    }

    /**
     * Cancel the JSON selection
     */
    Cancel_JSON_Selection = () => {
        this.setState({ Selection_string: null, Selection_arr: null, showVerifyModel: false });
    }

    /**
     * Cancel Video selection
     */
    Cancel_Video_Selection = () => {
        this.setState({ Selection_string_video: null, Selection_id_video: null, showVerifyModel_GetFilmData: false });
    }

    /**
     * Submit folder selection => Get films from folder.
     */
    Submit_FolderSelection = () => {
        const ws = new WebSocket('ws://' + URLs.NODE_VIDOPTIONS);
        ws.onopen = function () {
            console.log('WebSocket Client Connected : videooptions');
            // Send the session payload info.
            ws.send(JSON.stringify({ session_id: this.state.session_id, dir_list: this.state.Selection_arr.toString() }));
            this.Cancel_JSON_Selection();
        }.bind(this);
        ws.onmessage = function (e) {
            let got = JSON.parse(e.data);
            // Deserialize info from WS server
            let status = got.status;
            let data = got.data ? got.data.split('!!!') : null;
            data = data ? data.map((piece) => JSON.parse(piece)) : null;
            // Update video retrieval status
            this.setState({ vidStatus: status, videos: data || [] });
        }.bind(this);
        // Update the web socket reference
        this.setState({ ws: ws });
    }

    /**
     * Prepare the video selection.
     * @param {String} id the video id
     * @param {String} name the video name
     */
    Prepare_Video_Selection = (id, name) => {
        this.setState({ Selection_string_video: name, Selection_id_video: id, showVerifyModel_GetFilmData: true });
    }

    /**
     * Select a video => Retrieve the video/film data.
     */
    Select_Video = () => {
        // Get the ID of the prepared film
        const id = this.state.Selection_id_video;
        // Open a web socket connection
        const ws = this.state.ws_filmData || new WebSocket('ws://' + URLs.NODE_FILMDATA);
        ws.onopen = function () {
            console.log('WebSocket Client Connected : filmdata');
            // Send the data
            ws.send(JSON.stringify({ session_id: this.state.session_id, checkbox_element_id: id }));
            this.Cancel_Video_Selection();
        }.bind(this);
        ws.onmessage = function (e) {
            // Parse the film data response
            const { status, data } = JSON.parse(e.data);
            const headers = data ? data.headers : null;

            // If there is data, parse it as per the backend serialization protocol
            const parsed_data = !data ? [] : data.data.split('!!!').map((piece) => {
                return piece.split(',');
            })
            // Update the UI with the film data
            this.setState({ filmDataStatus: status, filmData: { headers: headers, data: parsed_data } });
        }.bind(this);
        // Update the state with the current web socket connection
        this.setState({ ws_filmData: ws });
    }

    /**
     * @returns The JSON component
     */
    json_render() {
        // If there is no film data, there is nothing to display.
        let data = this.state.filmData;
        if (!data || !data.data || !data.headers) return <div>No Film Data.</div>;

        // Otherwise, Display the data and associated headers.
        let header_comp =
            <thead>
                {data.headers.map((head) => <th>{head}</th>)}
            </thead>;

        let body_comp =
            <tbody>
                {data.data.map((row) => <tr>{row.map((col) => <td>{col}</td>)}</tr>)}
            </tbody>;
        return (
            <table>
                {header_comp}
                {body_comp}
            </table>
        )
    }

    componentDidMount() {
        // Establish web socket connection
        const ws = new WebSocket('ws://' + URLs.NODE_LOGIN);
        ws.onopen = function () {
            console.log('WebSocket Client Connected : login');
        }.bind(this);
        ws.onmessage = function (e) {
            // Parse login/session info
            const { status, data } = JSON.parse(e.data);
            let session = data ? data.session : null;

            // Update the component
            this.setState({ loginStatus: status, data: data ? data.dir : data, session_id: session });
        }.bind(this);
        // Update the web socket
        this.setState({ ws: ws });
    }
    /** Send login credentials to backend */
    send = () => {
        // prepare credentials
        let email = EMAIL_CREDENTIAL;
        let password = PASS_CREDENTIAL;
        // send credentials through websocket connection
        this.state.ws.send(JSON.stringify({ email: email, password: password }));
    }

    /** @returns {String} Login status label */
    loginProgressLabel = () => {
        let status = this.state.loginStatus;
        if (status === 0) return 'Creating new HUDL Session';
        if (status === 25) return 'Self-authenticating in HUDL';
        if (status === 50) return 'Finding your folders.';
        if (status === 75) return 'Parsing Folders.';
        else return 'Done.';
    }


    render() {

        // Get current directory data
        const json = this.state.data;

        // Logging-in component
        let loggingIn = (
            <div class='logging_in'>
                <h2>Logging in.</h2>
                <ProgressBar now={this.state.loginStatus} label={this.loginProgressLabel()} />
                <Button onClick={this.send}>SEND</Button>
            </div>
        );
        // Verify Folder Selection Modal
        let verifyModel = <VerifyChoice_Modal
            show={this.state.showVerifyModel}
            onHide={this.Cancel_JSON_Selection}
            verify={this.Submit_FolderSelection}
            title={this.state.Selection_string}
            description="Please confirm you'd like to view this folder's available film."
        />
        // Verify Film Selection Modal
        let verifyModel_filmdata = <VerifyChoice_Modal
            show={this.state.showVerifyModel_GetFilmData}
            onHide={this.Cancel_Video_Selection}
            verify={this.Select_Video}
            title={this.state.Selection_string}
            description="Please confirm you'd like to view this film's data."
        />

        // Videos component
        let vids = this.state.videos.map((vid) => {
            return <div class='json' onClick={() => this.Prepare_Video_Selection(vid.id, vid.text)}>{vid.text}</div>;
        })

        return (
            <div className="App">
                <h1>HUDL App</h1>
                {!json ? loggingIn : null}
                {json && vids.length === 0 ? JSONHolder(json, this.Retrieve_JSON_Selection) : null}
                <h2>Available Videos</h2>
                {vids}
                {this.json_render()}
                {verifyModel}
                {verifyModel_filmdata}
            </div>
        );
    }
}

export default App;
