import React from 'react';
import { Button, ProgressBar, Modal } from 'react-bootstrap';
import './App.css';


var randstr = () =>  Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);

var iterable = (json) => {
    let list = [];
    Object.keys(json).forEach((key) => {
        if (json[key]) list.push(key);
    });
    return list;
}

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

function calcColor(depth) {
    let calc = 255-((depth+1)*10);
    let rgb = 'rgb(' + calc + ', ' + calc + ', ' + calc + ')';
    // console.log('depth ' + depth + ' -> color ' + rgb);
    return rgb;
}
class JSONComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: this.props.data, depth: this.props.depth, childVisible: {} };
    }

    handlecallback = (arr, name) => {
        if (this.props.index !== undefined)
            arr.push(this.props.index);
        this.props.callback(arr, name);
    }
    toggle = (child, i) => {
        let json = this.state.data;
        let next_children = iterable(json[child]);
        let next_exist = next_children.length > 0;

        if (!next_exist) {
            this.props.callback([i, this.props.index], child);
        }
        if (this.isVisible(child)) {
            let childVisible = this.state.childVisible;
            childVisible[child] = false;
            this.setState({childVisible: childVisible});
        } else {
            let childVisible = this.state.childVisible;
            childVisible[child] = true;
            this.setState({childVisible: childVisible});
        }
    }
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
                        <div class='json' style={{marginLeft: 10*(depth+1), color: next_exist ? 'black' : 'blue', backgroundColor: calcColor(depth) }} onClick={() => this.toggle(child, i)}>{child}</div>
                        <div class={this.isVisible(child) ? 'visible' : 'hidden'}>
                        <JSONComponent index={i} callback={this.handlecallback} data={json[child]} depth={depth+1}/>
                        </div>
                    </div>
                );
            })}
            </div>
        )
        return html;
    }
}

function JSONHolder(json, callback) {
    return <div class='jsonwrapper'><JSONComponent data={json} depth={0} callback={callback}/></div>
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

    Retrieve_JSON_Selection = (arr, name) => {
        arr = arr.reverse();
        console.log(arr);
        this.setState({Selection_string: name, Selection_arr: arr, showVerifyModel: true});
    }

    Cancel_JSON_Selection = () => {
        this.setState({Selection_string: null, Selection_arr: null, showVerifyModel: false});
    }

    Cancel_Video_Selection = () => {
        this.setState({Selection_string_video: null, Selection_id_video: null, showVerifyModel_GetFilmData: false});
    }
    Submit_FolderSelection = () => {
        const ws = new WebSocket('ws://localhost:9898/videooptions');
        ws.onopen = function() {
            console.log('WebSocket Client Connected : videooptions');
            ws.send(JSON.stringify({session_id: this.state.session_id, dir_list: this.state.Selection_arr.toString()}));
            this.Cancel_JSON_Selection();
        }.bind(this);
        ws.onmessage = function(e) {
          let got = JSON.parse(e.data);
          // get info
          let status = got.status;
          // console.log('Got data: ' + got.data);
          let data =   got.data ? got.data.split('!!!') : null;
          console.log(data);
          data = data ? data.map((piece) => JSON.parse(piece)) : null;
          console.log("Received: " + JSON.stringify(got, null, 2));
          this.setState({vidStatus: status, videos: data || []});
      }.bind(this);
        this.setState({ws: ws});
    }

    Prepare_Video_Selection = (id, name) => {
        this.setState({Selection_string_video: name, Selection_id_video: id, showVerifyModel_GetFilmData: true});
    }

    Select_Video = () => {
        let id = this.state.Selection_id_video;
        const ws = this.state.ws_filmData || new WebSocket('ws://localhost:9898/filmdata');
        ws.onopen = function() {
            console.log('WebSocket Client Connected : filmdata');
            ws.send(JSON.stringify({session_id: this.state.session_id, checkbox_element_id: id}));
            this.Cancel_Video_Selection();
        }.bind(this);
        ws.onmessage = function(e) {
          let got = JSON.parse(e.data);
          // get info
          let status = got.status;
          let data =   got.data;
          let headers = data ? data.headers : null;
          let parsed_data = [];
          if (data) {
              console.log('data: ' + data);
              console.log('data.data: ' + data.data);

             parsed_data = data.data.split('!!!').map((piece) => {
                 console.log('PIECE of data.data: ' + piece);
                 let list = piece.split(',');
                 return list;
             })
             console.log('parsed data: ' + parsed_data);
          }
          console.log("Received: " + JSON.stringify(got, null, 2));
          this.setState({filmDataStatus: status, filmData: {headers: headers, data: parsed_data}});
      }.bind(this);
        this.setState({ws_filmData: ws});
    }

    json_render() {
        let data = this.state.filmData;
        if (!data || !data.data || !data.headers) return <div>No Film Data.</div>;
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
        const ws = new WebSocket('ws://localhost:9898/login');
        ws.onopen = function() {
            console.log('WebSocket Client Connected : login');
        }.bind(this);
        ws.onmessage = function(e) {
          let got = JSON.parse(e.data);
          // get info
          let status = got.status;
          let data =   got.data;
          let session = data ? data.session : null;
          console.log("Received: " + JSON.stringify(got, null, 2));
          this.setState({loginStatus: status, data: data ? data.dir : data, session_id: session});
      }.bind(this);
        this.setState({ws: ws});
    }
    send = () => {
        let email = 'rcocuzzo@u.rochester.edu';
        let password = 'Pablothepreacher71';
        this.state.ws.send(JSON.stringify({email: email, password: password}));
    }

    loginProgressLabel = () => {
        let status = this.state.loginStatus;
        if (status === 0) return 'Creating new HUDL Session';
        if (status === 25) return 'Self-authenticating in HUDL';
        if (status === 50) return 'Finding your folders.';
        if (status === 75) return 'Parsing Folders.';
        else return 'Done.';
    }


    render() {
        let json = this.state.data;
        // console.log('refreshing with data: ' + this.state.data);
        let loggingIn = (
            <div class='logging_in'>
                <h2>Logging in.</h2>
                <ProgressBar now={this.state.loginStatus} label={this.loginProgressLabel()} />
                <Button onClick={this.send}>SEND</Button>
            </div>
        );
        let verifyModel = <VerifyChoice_Modal
            show={this.state.showVerifyModel}
            onHide={this.Cancel_JSON_Selection}
            verify={this.Submit_FolderSelection}
            title={this.state.Selection_string}
            description="Please confirm you'd like to view this folder's available film."
         />
         let verifyModel_filmdata = <VerifyChoice_Modal
             show={this.state.showVerifyModel_GetFilmData}
             onHide={this.Cancel_Video_Selection}
             verify={this.Select_Video}
             title={this.state.Selection_string}
             description="Please confirm you'd like to view this film's data."
          />
        // let vj = {};
         let vids = this.state.videos.map((vid, i) => {
             // vj[vid.text] = {};
             return <div class='json' onClick={() => this.Prepare_Video_Selection(vid.id, vid.text)}>{vid.text}</div>;
         })
        return (
          <div className="App">
          <h1>HUDL App</h1>
          {!json ? loggingIn : null}
          {json && vids.length === 0 ? JSONHolder(json, this.Retrieve_JSON_Selection) : null}
          {/* <h2>JSON iter. implementation</h2> */}
          {/* {this.state.videos.length > 0 ? JSONHolder(vj, this.Add_Video_Selection) : null} */}
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
