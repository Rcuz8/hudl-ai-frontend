import React, { useState } from 'react';
import { Modal, Button, ProgressBar } from 'react-bootstrap';
import { URLs } from '../../helpers/constants';

/* HELPERS */

function JSONHolder(json, callback) {
    return <div class='jsonwrapper'><JSONComponent data={json} depth={0} callback={callback}/></div>
}
function calcColor(depth) {
    let calc = 255-((depth+1)*10);
    let rgb = 'rgb(' + calc + ', ' + calc + ', ' + calc + ')';
    // console.log('depth ' + depth + ' -> color ' + rgb);
    return rgb;
}
var iterable = (json) => {
    let list = [];
    Object.keys(json).forEach((key) => {
        if (json[key]) list.push(key);
    });
    return list;
}


/* JSON TREE DISPLAY */

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
                        <div class='json' style={{marginLeft: 15*(depth+1), color: next_exist ? 'black' : 'white', backgroundColor: next_exist ? calcColor(depth) : 'black' }} onClick={() => this.toggle(child, i)}>{child}</div>
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

/* VERIFY USER SELECTION */
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
function SelectFolder(props) {

    const SESSION_ID = props.session_id;
    
    const [Selection_arr, set_SelectionArray] = useState(null);
    const [Selection_string, set_SelectionString] = useState(null);
    const [showVerifyModel, set_ShowVerifyModel] = useState(false);
    const [progress, set_Progress] = useState(-1);
    const [videos, setVideos] = useState(null);

    const Retrieve_JSON_Selection = (arr, name) => {
        arr = arr.reverse();
        console.log(arr);
        set_SelectionArray(arr);
        set_SelectionString(name);
        set_ShowVerifyModel(true);
    }

    const Cancel_JSON_Selection = () => {
        set_SelectionArray(null);
        set_SelectionString(null);
        set_ShowVerifyModel(false);
    }

    const Submit_FolderSelection = () => {

        const ws = new WebSocket('ws://' + URLs.NODE_VIDOPTIONS);
        ws.onopen = function() {
            console.log('WebSocket Client Connected : videooptions');
            ws.send(JSON.stringify({session_id: SESSION_ID, dir_list: Selection_arr.toString()}));
            Cancel_JSON_Selection();
        };
        ws.onmessage = function(e) {
          let got = JSON.parse(e.data);
          // get info
          let status = got.status;
          let data =   got.data ? got.data.split('!!!') : null;
          data = data ? data.map((piece) => JSON.parse(piece)) : null;
          console.log("Received: " + JSON.stringify(got, null, 2));
          // set progress
          set_Progress(status);
          // update state
          setVideos(data || []);
          // Check for compeltion 
          if (status === 100) {
            console.log('Completed Folder submit. Videos are: ' + data)
            props.callback(data);
          }
      };
    }

    const VerifyModel = <VerifyChoice_Modal
        show={showVerifyModel}
        onHide={Cancel_JSON_Selection}
        verify={Submit_FolderSelection}
        title={Selection_string}
        description="Please confirm you'd like to view this folder's available film."
    />

    const Progress = (
        <div class='logging_in'>
            <h2>Retrieving Film Options.</h2>
            <ProgressBar now={progress} />
        </div>
    )



    return (
        <div>
            {progress >= 0 ? null : JSONHolder(props.data, Retrieve_JSON_Selection)}
            {progress < 0 ? null : Progress}
            {VerifyModel}
        </div>
    )

}

export default SelectFolder;



