import React, { useState } from "react";
import { Button, ProgressBar } from "react-bootstrap";
import { cleaned_withParams, retokenize } from "../../Cleanse";
import { TKN_2, TKN_3, URLs } from "../../helpers/constants";
import JSONRender from "../../helpers/JSONRender";

function removeItem(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

export default function SelectTestData(props) {
  const SESSION_ID = props.session_id;
  const DIRECTORY_DATA = props.data;
  const TRAINING_ARRs = props.training_arrays;
  const USED_INDICES = props.used_indices;

  const [selections, set_Selections] = useState([]);
  const [progress, set_Progress] = useState(-1);

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
    let item = {
      dir: arr,
      name: name,
    };
    if (TRAINING_ARRs.indexOf(item) !== -1)
      alert("Already selected this for training!");
    else addSelection(item);
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
      ws.send(
        JSON.stringify({
          session_id: SESSION_ID,
          dir_lists: stringified,
        })
      );
    };
    ws.onmessage = function (e) {
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
        let data = combined_data.data;
        // split data by film
        let ALL_FILM_DATA_COMBINED = data.split(TKN_3).join(TKN_2);

        let clean_parse_test = cleaned_withParams(
          ALL_FILM_DATA_COMBINED.split(TKN_2),
          USED_INDICES
        );
        let clean_data = clean_parse_test;
        let testdata_prepared = retokenize(clean_data);

        let ret = { data: clean_data, unparsedData: testdata_prepared };

        console.log("SelectTestData - Value Called back : ");
        console.log(ret);

        if (props.callback) props.callback(ret);
      }
    };
  };

  const Progress = (
    <div class="logging_in">
      <h2>Retrieving selected Training Data..</h2>
      <ProgressBar now={progress} />
    </div>
  );

  let select = (
    <>
      <h2>Select film to train the AI model on.</h2>
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

      <Button onClick={() => submit()}>Submit Selection</Button>
      <h3>Your HUDL Directory:</h3>
      {JSONRender(DIRECTORY_DATA, Selected_Film_Clip)}
    </>
  );

  return <div className="selectdata">{progress < 0 ? select : Progress}</div>;
}
