import React, { useState } from "react";
import { Modal, Button, ProgressBar } from "react-bootstrap";
import { URLs } from "../../helpers/constants";
import cleanse, { retokenize } from "../../Cleanse";

// MARK - Component

/** Verify Choice Modal */
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
        <p>{props.description}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.verify}>Confirm</Button>
      </Modal.Footer>
    </Modal>
  );
}

/** Select Film Component */
function SelectFilm(props) {

  // setup props variables
  const SESSION_ID = props.session_id;
  const videos = props.videos;

  if (!SESSION_ID || !videos) throw "SelectFilm GOT BAD PARAMS!";

  // setup state variables
  const [Selection_id, set_SelectionId] = useState(null);
  const [Selection_string, set_SelectionString] = useState(null);
  const [showVerifyModel, set_ShowVerifyModel] = useState(false);
  const [progress, set_Progress] = useState(-1);

  const Cancel_Video_Selection = () => {
    set_SelectionString(null);
    set_SelectionId(null);
    set_ShowVerifyModel(false);
  };

  const Prepare_Video_Selection = (id, name) => {
    set_SelectionString(name);
    set_SelectionId(id);
    set_ShowVerifyModel(true);
  };

  const Select_Video = () => {
    let id = Selection_id;
    const ws = new WebSocket("ws://" + URLs.NODE_FILMDATA);
    ws.onopen = function () {
      console.log("WebSocket Client Connected : filmdata");
      ws.send(
        JSON.stringify({ session_id: SESSION_ID, checkbox_element_id: id })
      );
      Cancel_Video_Selection();
    };
    ws.onmessage = function (e) {
      // parse response from web socket
      const got = JSON.parse(e.data);
      const status = got.status;
      let headers = null;
      let parsed_data = [];
      var retokenized = null;
      // if there is data sent back
      if (got && got.data) {
        let clean_parse = cleanse(got);
        parsed_data = clean_parse.data;
        headers = clean_parse.headers;
        retokenized = retokenize(parsed_data);
        if (!retokenized) throw "THERE SHOULD BE UNPARSED FILM DATA HERE";
      }
      set_Progress(status);
      // Check for compeltion
      if (status === 100) {
        props.callback({
          headers: headers,
          data: parsed_data,
          unparsedData: retokenized,
        });
      }
    };
  };

  const VerifyModel = (
    <VerifyChoice_Modal
      show={showVerifyModel}
      onHide={Cancel_Video_Selection}
      verify={Select_Video}
      title={Selection_string}
      description="Please confirm you'd like to view this film's data."
    />
  );

  const Progress = (
    <div class="logging_in">
      <h2>Retrieving Film Options.</h2>
      <ProgressBar now={progress} />
    </div>
  );

  const Video_Component = videos.map((vid) => {
    return (
      <div
        class="json"
        onClick={() => Prepare_Video_Selection(vid.id, vid.text)}
      >
        {vid.text}
      </div>
    );
  });

  return (
    <div>
      {progress >= 0 ? null : Video_Component}
      {progress < 0 ? null : Progress}
      {VerifyModel}
    </div>
  );
}

export default SelectFilm;
