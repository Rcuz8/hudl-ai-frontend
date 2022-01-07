import React, { useState } from "react";
import { Button, Dropdown, Modal } from "react-bootstrap";
import SelectableContext from "react-bootstrap/SelectableContext";
import { NN, NNComp } from "../../NN";
import "./nn.css";
import "./predictions.css";

/**
 * @param {*} props
 * @returns Option Dropdown component
 */
function OptionDropDown(props) {
  let head = props.field.header;
  let dom = props.field.domain;

  const [title, setTitle] = useState(head);

  const itemClicked = (item, i) => {
    setTitle(item);
    props.callback(i);
  };

  return (
    <div class="opdrop">
      <SelectableContext.Provider value={false}>
        <Dropdown>
          <Dropdown.Toggle id="dropdown-basic">{title}</Dropdown.Toggle>
          <Dropdown.Menu>
            {dom.map((item, i) => (
              <Dropdown.Item onClick={() => itemClicked(item, i)}>
                {item}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </SelectableContext.Provider>
    </div>
  );
}

/**
 * @param {*} props
 * @returns Bad Configuration Modal
 */
function BadConfigModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Imcomplete Configuration
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Please verify you have selected an option for each of the dropdowns.
        </p>
      </Modal.Body>
    </Modal>
  );
}

/**
 * @returns Predictions component
 */
function Predictions(props) {
  // Get relevent model info
  const { model, outputs } = props;

  // gather the data domains
  let dataDomain_input = props.dataDomain.filter(
    (_item, i) => outputs.indexOf(i) === -1
  );
  // NOTE: Same value
  let dataDomain_output = props.dataDomain.filter(
    (_item, i) => outputs.indexOf(i) !== -1
  );

  // gather the headers
  let input_headers = props.headers.filter(
    (_item, i) => outputs.indexOf(i) === -1
  );
  // NOTE: Same value
  let output_headers = props.headers.filter(
    (_item, i) => outputs.indexOf(i) !== -1
  );

  // build neural network
  let __nn = new NN().fromString(JSON.stringify(model));

  // state variables
  const [nn, setNN] = useState(__nn);
  const [nn_component, setNNComponent] = useState(NNComp(nn));
  const [inputs, setInputs] = useState(Array(input_headers.length).fill(-1));
  const [showBadConfig, setShowBadConfig] = useState(false);
  const [predictions, setPredictions] = useState([]);

  /**
   * Prepare inputs, due to an item click.
   * @param {int} f_index field index
   * @param {int} i_index item index
   */
  const itemClicked = (f_index, i_index) => {
    // reformat inputs
    let _inputs = JSON.parse(JSON.stringify(inputs));
    _inputs[f_index] = i_index;
    setInputs(_inputs);
  };

  /** @returns the togglable options */
  const toggleOptions = () => {
    return dataDomain_input.map((field, fieldIndex) => {
      return (
        <OptionDropDown
          field={field}
          callback={(itemIndex) => itemClicked(fieldIndex, itemIndex)}
        />
      );
    });
  };

  /** @returns the prediction component */
  const predictionComponent = () => {
    return predictions.map((prediction, i) => (
      <div>
        {output_headers[i]} : {prediction}
      </div>
    ));
  };

  /** Generate predictions */
  const predict = () => {

    // Verify we have a valid config
    if (inputs.indexOf(-1) === -1) {
      // propagate
      let _nn = nn;
      _nn.propagate(inputs);
      // get predictions
      let predicted_indices = _nn.outputs().map((out) => Math.round(out));
      let _predictions = predicted_indices.map(
        (predictionIndex, outIndex) =>
          dataDomain_output[outIndex].domain[predictionIndex]
      );
      // set new info
      setNN(_nn);
      setNNComponent(NNComp(_nn));
      setPredictions(_predictions);
    } else {
      setShowBadConfig(true);
    }
  };

  return (
    <div class="pred">
      <h2>Below is the model created from your data.</h2>
      {nn_component}
      <div>
        <h2>Please select a configuration to predict.</h2>
        <div class="togops">{toggleOptions()}</div>
        <div class="genmodelbtn">
          <Button onClick={() => predict()}>PREDICT</Button>
        </div>
        <h2>Prediction: </h2>
      </div>
      {predictionComponent()}
      <BadConfigModal
        show={showBadConfig}
        onHide={() => setShowBadConfig(false)}
      />
    </div>
  );
}

export default Predictions;
