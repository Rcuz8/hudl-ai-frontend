import React, {useState} from 'react';
import { Form, DropdownButton, Button, Modal, ProgressBar, Row, Col, Dropdown } from 'react-bootstrap';
import { URLs } from './Helper-Files/constants';

function testEmail(email) {
    return email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
}

function Notification(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {props.description}
          </p>
        </Modal.Body>
      </Modal>
    );
  }

async function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
   Promise.resolve('ok');
 }



function Login(props) {

    // Test variables

    const TEST_OVERRIDE = false;
    const TEST = true;

    let EMAILVAL = 'rcocuzzo@u.rochester.edu';
    let PASSVAL = 'Pablothepreacher71';

    const INIT_EM = TEST ? EMAILVAL : '';
    const INIT_PS = TEST ? PASSVAL : '';



    const [validated, setValidated] = useState(false);
    const [showInvalidModal, setShowInvalidModal] = useState(false);
    const [email, setEmail] = useState(INIT_EM);
    const [password, setPassword] = useState(INIT_PS);
    const [loginStatus, setLoginStatus] = useState(-1);
    const [session_id, setSessionId] = useState(null);
    const [folderData, setFolderData] = useState(null);

    // Formally submit login info & begin handling responses
    const SubmitLogin = async () => {
        setLoginStatus(0);
        // Login & get data
        const ws = new WebSocket('ws://' + URLs.NODE_LOGIN);
        ws.onopen = function() {
            console.log('WebSocket Client Connected : login');
            ws.send(JSON.stringify({email: email, password: password}));
        };
        ws.onmessage = function(e) {
          let got = JSON.parse(e.data);
          if (Object.keys(got).length === 0) { //  bad data
            setShowInvalidModal(true);
            return;
          }
          // get info
          let status = got.status;
          let data =   got.data;
          let session = data ? data.session : null;
          console.log("Received: " + JSON.stringify(got, null, 2));
          let directory = data ? data.dir : data;
          // set progress
          setLoginStatus(status);
          setSessionId(session);
          setFolderData(directory);
          // Check for compeltion 
          if (status === 100)
            props.callback({session_id: session, data: directory});
      };
        return;
    }
    // handle / verify user info submission -> 
    const handleSubmit = (event) => {
      const form = event.currentTarget;
      if (!TEST_OVERRIDE && ( form.checkValidity() === false || !email || !password || !testEmail(email) ) ) {
        setShowInvalidModal(true);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      
      // form is valid
      setValidated(true);
      // submit login, move to next step.
      SubmitLogin();
    };

    // labels for user's progress
    const loginProgressLabel = () => {
        let status = loginStatus;
        if (status === 0) return 'Creating new HUDL Session';
        if (status === 25) return 'Self-authenticating in HUDL';
        if (status === 50) return 'Finding your folders.';
        if (status === 75) return 'Parsing Folders.';
        else return 'Done.';
    }

    let LoginProgressBar = (
        <div class='logging_in'>
            <h2>Logging in.</h2>
            <ProgressBar now={loginStatus} />
            <p>{loginProgressLabel()}</p>
        </div>
    );

    

    const invalidModal = (
        <Notification
            title='Invalid credentials'
            description='Please retry login with correct credentials'
            show={showInvalidModal}
            onHide={() => setShowInvalidModal(false)}
        />
    );
  
    const emailChange = (e) => {
        setEmail(e.target.value);
    }
    const passChange = (e) => {
        setPassword(e.target.value);
    }

    const LoginForm = (
        <Form noValidate validated={validated}>
        <Form.Group controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control onChange={emailChange} value={TEST ? EMAILVAL : ''} type="email" placeholder="Enter email" />
            <Form.Text className="text-muted">
            We'll never share your email with anyone else.
            </Form.Text>
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control onChange={passChange}value={TEST ? PASSVAL : ''} type="password" placeholder="Password" />
        </Form.Group>
        <Button onClick={handleSubmit}>Login</Button>
        {invalidModal}
      </Form>
    );


    if (loginStatus === 100) return null;
    return (
        <div>
            {loginStatus >= 0 ? LoginProgressBar : LoginForm}
        </div>
    );
  }

export default Login;
