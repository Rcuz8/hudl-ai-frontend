import React, { useState } from "react";
import { Accordion, Card } from "react-bootstrap";
import { useAccordionToggle } from "react-bootstrap/AccordionToggle";
import Login from "../../Login";
import "./nav.css";
import Predictions from "./Predictions";
import SelectTestData from "./SelectTestData";
import SelectTrainingData from "./SelectTrainingData";
import ViewData from "./ViewData";

/* MARK - Components */

/**
 * A "done"-togglable component
 * @param {*} param0 Children components
 * @returns the toggle component
 */
function CustomToggle({ children, eventKey, done }) {
  const decoratedOnClick = useAccordionToggle(
    eventKey,
    () => {} // do nothing
  );

  let done_icon = (
    <svg class="icon icon-check-circle">
      <use xlinkHref="#icon-check-circle">
        <symbol id="icon-check-circle" viewBox="0 -8 24 38">
          <path d="M20.062 11.469c0-0.266-0.094-0.531-0.281-0.719l-1.422-1.406c-0.187-0.187-0.438-0.297-0.703-0.297s-0.516 0.109-0.703 0.297l-6.375 6.359-3.531-3.531c-0.187-0.187-0.438-0.297-0.703-0.297s-0.516 0.109-0.703 0.297l-1.422 1.406c-0.187 0.187-0.281 0.453-0.281 0.719s0.094 0.516 0.281 0.703l5.656 5.656c0.187 0.187 0.453 0.297 0.703 0.297 0.266 0 0.531-0.109 0.719-0.297l8.484-8.484c0.187-0.187 0.281-0.438 0.281-0.703zM24 14c0 6.625-5.375 12-12 12s-12-5.375-12-12 5.375-12 12-12 12 5.375 12 12z"></path>
        </symbol>
      </use>
    </svg>
  );

  return (
    <div class="processnavitem" onClick={done ? () => {} : decoratedOnClick}>
      <h2>{children}</h2>
      {done ? done_icon : null}
    </div>
  );
}

/**
 * @returns the Navigation component
 */
function Navigation() {
  // Setup state variables
  const [step, setStep] = useState(1);
  const [allFolders, setAllFolders] = useState(null);
  const [session_id, setSessionId] = useState(null);
  const [nn_model, set_NN_Modal] = useState(null);
  const [dataDomain, set_DataDomain] = useState(null);
  const [output_indices, set_OutputIndices] = useState(null);
  const [clean_headers, set_CleanHeaders] = useState(null);
  const [clean_data_indices, set_CleanDataIndices] = useState(null);
  const [trainingData, set_TrainingData] = useState(null);
  const [str_trainingData, set_Str_TrainingData] = useState(null);
  const [testData, set_TestData] = useState(null);
  const [str_testData, set_Str_TestData] = useState(null);
  const [training_arrays, set_TrainingArrays] = useState(null);

  /**
   * Callback for when a user logged in.
   * Sets up session info and folder info.
   * @param {Object} result the session result
   */
  const logged_in = (result) => {
    setSessionId(result.session_id);
    setAllFolders(result.data);
    setStep(step + 1);
  };

  /**
   * Callback when a user has generated the Tf models.
   * @param {Tf.model} model Tf model
   * @param {*} dataDomain the data domain
   * @param {*} output_indices the indices of the data's output columns
   */
  const viewed_data_and_generated_nn_model = (
    model,
    dataDomain,
    output_indices
  ) => {
    set_NN_Modal(model);
    set_DataDomain(dataDomain);
    console.log("Setting output indices to: " + output_indices);
    set_OutputIndices(output_indices);
    setStep(step + 1);
  };

  /**
   * Callback when the training data has been selected.
   * @param {Object} result the polished data result
   */
  const selected_training_data = (result) => {
    set_CleanHeaders(result.headers);
    set_TrainingData(result.data);
    set_Str_TrainingData(result.unparsedData);
    set_CleanDataIndices(result.clean_indices);
    set_TrainingArrays(result.training_arrays);
    setStep(step + 1);
  };

  /**
   * Callback when the user has selected the test data.
   * @param {Object} result the polished data result
   */
  const selected_test_data = (result) => {
    set_TestData(result.data);
    set_Str_TestData(result.unparsedData);
    setStep(step + 1);
  };

  /* Accordion Card / Subview for the different views being presented */
  const AccordionCard = (threshold, title, body) => {
    return (
      <Card>
        <Card.Header>
          <CustomToggle eventKey="0" done={step > threshold}>
            {title}
          </CustomToggle>
        </Card.Header>
        {step == threshold ? (
          <Accordion.Collapse eventKey="0">
            <Card.Body>
              <div style={{ display: "block" }}>{body}</div>
            </Card.Body>
          </Accordion.Collapse>
        ) : null}
      </Card>
    );
  };

  return (
    <div class="navmenu">
      <Accordion defaultActiveKey="0">
        {AccordionCard(1, "HUDL Login", <Login callback={logged_in} />)}
        {AccordionCard(
          2,
          "Select Training Data",
          <SelectTrainingData
            session_id={session_id}
            data={allFolders}
            callback={selected_training_data}
          />
        )}
        {AccordionCard(
          3,
          "Select Test Data",
          <SelectTestData
            session_id={session_id}
            data={allFolders}
            training_arrays={training_arrays}
            str_trainingdata={str_trainingData}
            used_indices={clean_data_indices}
            callback={selected_test_data}
          />
        )}
        {AccordionCard(
          4,
          "View Data",
          <ViewData
            training={trainingData}
            test={testData}
            str_training_data={str_trainingData}
            headers={clean_headers}
            str_test_data={str_testData}
            callback={viewed_data_and_generated_nn_model}
          />
        )}
        {AccordionCard(
          5,
          "Get Predictions",
          <Predictions
            model={nn_model}
            dataDomain={dataDomain}
            headers={clean_headers}
            outputs={output_indices}
          />
        )}
      </Accordion>
    </div>
  );
}

export default Navigation;
