import React, {useState} from 'react';
import { Accordion, Card, Button } from 'react-bootstrap';
import './nav.css'
import {useAccordionToggle} from 'react-bootstrap/AccordionToggle';
import Login from '../../Login';
import {folder_data} from '../../test/testdata';
import SelectFolder from './SelectFolder';
import SelectFilm from './SelectFilm';
import ViewData from './ViewData';
import Predictions from './Predictions';
import SelectTrainingData from "./SelectTrainingData";
import SelectTestData from "./SelectTestData";


/* CUSTOM TOGGLING OPTION */
function CustomToggle({ children, eventKey, done }) {
    const decoratedOnClick = useAccordionToggle(eventKey, () =>
      console.log('totally custom!'),
    );

    let done_icon = (
        <svg class="icon icon-check-circle"><use xlinkHref="#icon-check-circle">
        <symbol id="icon-check-circle" viewBox="0 -8 24 38">
        <path d="M20.062 11.469c0-0.266-0.094-0.531-0.281-0.719l-1.422-1.406c-0.187-0.187-0.438-0.297-0.703-0.297s-0.516 0.109-0.703 0.297l-6.375 6.359-3.531-3.531c-0.187-0.187-0.438-0.297-0.703-0.297s-0.516 0.109-0.703 0.297l-1.422 1.406c-0.187 0.187-0.281 0.453-0.281 0.719s0.094 0.516 0.281 0.703l5.656 5.656c0.187 0.187 0.453 0.297 0.703 0.297 0.266 0 0.531-0.109 0.719-0.297l8.484-8.484c0.187-0.187 0.281-0.438 0.281-0.703zM24 14c0 6.625-5.375 12-12 12s-12-5.375-12-12 5.375-12 12-12 12 5.375 12 12z"></path>
        </symbol>
        </use></svg>
    );
  
    return (
        <div class='processnavitem' onClick={done ? () => {} : decoratedOnClick}>
        <h2>{children}</h2>
        {done ? done_icon : null}
    </div>
    );
  }



  /* NAVIGATION */

function Navigation() {

    const [step, setStep] = useState(1);
    const [allFolders, setAllFolders] = useState(null);
    const [session_id, setSessionId] = useState(null);
    // const [videos, setVideos] = useState(null);
    const [filmData_withHeaders, set_FilmData_withHeaders] = useState(null);
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
    
    var logged_in = (result) => {
        setSessionId(result.session_id);
        setAllFolders(result.data);
        setStep(step+1);
    }
    // var selected_folder = (result) => {
    //     setVideos(result);
    //     setStep(step+1);
    // }
    var selected_film = (result) => {
        set_FilmData_withHeaders(result);
        setStep(step+1);
    }
    var viewed_data_and_generated_nn_model = (model, dataDomain, output_indices) => {
        set_NN_Modal(model);
        set_DataDomain(dataDomain);
        console.log('Setting output indices to: ' + output_indices)
        set_OutputIndices(output_indices);
        setStep(step+1);
    }

    var selected_training_data = (result) => {
        set_CleanHeaders(result.headers);
        set_TrainingData(result.data);
        set_Str_TrainingData(result.unparsedData);
        set_CleanDataIndices(result.clean_indices);
        set_TrainingArrays(result.training_arrays);
        setStep(step+1);
    }

    var selected_test_data = (result) => {
        set_TestData(result.data);
        set_Str_TestData(result.unparsedData);
        setStep(step+1);
    } 

    const AccordionCard = (threshold, title, body) => {
        return (
            <Card>
                <Card.Header>
                    <CustomToggle eventKey="0" done={step > threshold}>{title}</CustomToggle>
                </Card.Header>
                {step == threshold ? 
                <Accordion.Collapse eventKey="0">
                    <Card.Body>
                        
                        <div style={{display: 'block'}}>
                            {body}
                        </div>
                    </Card.Body>
                </Accordion.Collapse>
                : null }
            </Card>
        );
    }

    return (
        <div class='navmenu'>
            <Accordion defaultActiveKey="0">
            {AccordionCard(1,'HUDL Login', <Login callback={logged_in} />)}
            {AccordionCard(2,'Select Training Data', <SelectTrainingData session_id={session_id} data={allFolders} callback={selected_training_data} />)}
            {AccordionCard(3,'Select Test Data', <SelectTestData session_id={session_id} data={allFolders} training_arrays={training_arrays} str_trainingdata={str_trainingData} used_indices={clean_data_indices}  callback={selected_test_data} />)}
            {/* {AccordionCard(2,'Select Film Folder', <SelectFolder session_id={session_id} data={allFolders} callback={selected_folder} />)} */}
            {/* {AccordionCard(3,'Select Film', <SelectFilm session_id={session_id} videos={videos} callback={selected_film} />)} */}
            {AccordionCard(4,'View Data', <ViewData training={trainingData} test={testData} str_training_data={str_trainingData} headers={clean_headers} str_test_data={str_testData} callback={viewed_data_and_generated_nn_model} />)}
            {AccordionCard(5,'Get Predictions', <Predictions model={nn_model} dataDomain={dataDomain} headers={clean_headers} outputs={output_indices} />)}
            </Accordion>
        </div>
        
    );


}

export default Navigation;