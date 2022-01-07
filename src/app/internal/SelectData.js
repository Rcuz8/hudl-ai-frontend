import React, { useState } from "react";
import { Button, ProgressBar } from "react-bootstrap";
import { token_swap } from "../../helpers/Cleanse";
import { TKN_2, URLs } from "../../helpers/constants";
import JSONRender from "../../helpers/JSONRender";

// MARK - Helpers

/**
 * @param {Array} arr 
 * @param {*} value 
 * @returns the list without the item
 */
function removeItem(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

export default function SelectTrainingData(props) {
  
  // setup prop variables
  const SESSION_ID = props.session_id;
  const DIRECTORY_DATA = props.data;

  // setup state variables
  const [selections, set_Selections] = useState([]);
  const [progress, set_Progress] = useState(-1);

  /**
   * Remove the item from the 
   * @param {*} item 
   */
  const popSelection = (item) => {
    let o = [...selections];
    removeItem(o, item);
    set_Selections(o);
  };

  const addSelection = (dir) => {
    let l = [...selections];
    if (l.indexOf(dir) !== -1) return;
    l.push(dir);
    set_Selections(l);
  };

  const Selected_Film_Clip = (arr, name) => {
    arr = arr.reverse();
    console.log(arr);
    addSelection({
      dir: arr,
      name: name,
    });
  };

  const submit = () => {
    set_Progress(0);
    if (selections.length === 0) return;
    var stringified = "";
    selections.forEach((sel) => {
      stringified += sel.dir.toString() + TKN_2;
    });
    stringified = stringified.substring(0, stringified.length - TKN_2.length);

    const ws = new WebSocket("ws://" + URLs.NODE_MULTIDATA);
    ws.onopen = function () {
      console.log("WebSocket Client Connected : multidata");
      console.log("Sending dir_lists: " + stringified);

      ws.send(
        JSON.stringify({
          session_id: SESSION_ID,
          dir_lists: stringified,
        })
      );
    };
    ws.onmessage = function (e) {
      /*

        Data Response! It may be partial, it may be whole.

        If partial, update status.
        If whole, disassemble "disjunction by film" & reassemble so they're all together 
            Then clean & save headers/ "used indices" so we can clean the test data the same way

    */
      let got = JSON.parse(e.data);
      // get info
      let status = got.status;
      // set progress
      set_Progress(status);
      //get data
      let combined_data = got.combineddata;
      // check if only partial response
      if (!combined_data) {
        //  DO Nothing
      } else {
        // get full data & headers
        let headers = combined_data.headers;
        let data = combined_data.data;

        let film_names = selections.map((sel) => sel.name);
        let datum = token_swap(data);
        props.callback({
          headers: headers,
          data: datum,
          film_names: film_names,
        });
      }
    };
  };

  const Progress = (
    <div class="logging_in">
      <h2>Retrieving selected Data..</h2>
      <ProgressBar animated variant="success" now={progress} />
    </div>
  );

  let select = (
    <>
      <h2>Select the relevent film.</h2>
      <h3>Selected Clips</h3>
      <div class="clips">
        {selections.map((item) => {
          return (
            <div class="json" onClick={() => popSelection(item)}>
              {item.name}
            </div>
          );
        })}
      </div>

      <Button onClick={() => submit()}>Generate Analysis</Button>
      <h3>Directory:</h3>
      {JSONRender(DIRECTORY_DATA, Selected_Film_Clip)}
    </>
  );

  return <div className="selectdata">{progress < 0 ? select : Progress}</div>;
}
