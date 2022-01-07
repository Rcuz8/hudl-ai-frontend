import React, { useState } from "react";
import { Button, Form, Modal, ProgressBar } from "react-bootstrap";
import { URLs } from "./Helper-Files/constants";
import { TEST_MODE } from "../../helpers/constants";

// MARK - Helpers

/**
 * @param {String} email
 * @returns whether the email is valid.
 */
function testEmail(email) {
  return email.match(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
}

// MARK - Components

/** Backend Notification */
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
        <p>{props.description}</p>
      </Modal.Body>
    </Modal>
  );
}

/**
 * @param {*} props
 * @returns Login component
 */
function Login(props) {
  // Test variables
  const TEST_OVERRIDE = false;

  let EMAILVAL = process.env.EMAIL_CREDENTIAL;
  let PASSVAL = process.env.PASS_CREDENTIAL;

  const INIT_EM = TEST_MODE ? EMAILVAL : "";
  const INIT_PS = TEST_MODE ? PASSVAL : "";

  // State variables

  const [validated, setValidated] = useState(false);
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [email, setEmail] = useState(INIT_EM);
  const [password, setPassword] = useState(INIT_PS);
  const [loginStatus, setLoginStatus] = useState(-1);

  // Formally submit login info & begin handling responses
  const SubmitLogin = async () => {
    setLoginStatus(0);

    // Login & get data
    const ws = new WebSocket("ws://" + URLs.NODE_LOGIN);
    ws.onopen = function () {
      console.log("WebSocket Client Connected : login");
      // send data to web socket
      ws.send(JSON.stringify({ email: email, password: password }));
    };
    ws.onmessage = function (e) {
      // Parse web socket data
      let got = JSON.parse(e.data);
      if (Object.keys(got).length === 0) {
        // Bad data. Show invalid.
        setShowInvalidModal(true);
        return;
      }
      const { status, data } = got;
      let session = data ? data.session : null;
      let directory = data ? data.dir : data;
      // set progress
      setLoginStatus(status);
      // Check for compeltion
      if (status === 100)
        props.callback({ session_id: session, data: directory });
    };
    return;
  };
  // handle / verify user info submission ->
  const handleSubmit = (event) => {
    const form = event.currentTarget;
    // Verify the form is invalid and that the form should not be overriden.
    if (
      !TEST_OVERRIDE &&
      (form.checkValidity() === false ||
        !email ||
        !password ||
        !testEmail(email))
    ) {
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

  /**
   * @returns {String} labels for user's progress
   */
  const loginProgressLabel = () => {
    let status = loginStatus;
    if (status === 0) return "Creating new HUDL Session";
    if (status === 25) return "Self-authenticating in HUDL";
    if (status === 50) return "Finding your folders.";
    if (status === 75) return "Parsing Folders.";
    else return "Done.";
  };

  // Login progress bar
  const LoginProgressBar = (
    <div class="logging_in">
      <h2>Logging in.</h2>
      <ProgressBar now={loginStatus} />
      <p>{loginProgressLabel()}</p>
    </div>
  );

  // Invalid Credentials modal
  const invalidModal = (
    <Notification
      title="Invalid credentials"
      description="Please retry login with correct credentials"
      show={showInvalidModal}
      onHide={() => setShowInvalidModal(false)}
    />
  );

  /**
   * Propagate email change.
   * @param {*} e the event
   */
  const emailChange = (e) => {
    setEmail(e.target.value);
  };

  /**
   * Propagate password change.
   * @param {*} e the event
   */
  const passChange = (e) => {
    setPassword(e.target.value);
  };

  // Login form
  const LoginForm = (
    <Form noValidate validated={validated}>
      <Form.Group controlId="formBasicEmail">
        <Form.Label>Email address</Form.Label>
        <Form.Control
          onChange={emailChange}
          value={TEST_MODE ? EMAILVAL : ""}
          type="email"
          placeholder="Enter email"
        />
        <Form.Text className="text-muted">
          We'll never share your email with anyone else.
        </Form.Text>
      </Form.Group>

      <Form.Group controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          onChange={passChange}
          value={TEST_MODE ? PASSVAL : ""}
          type="password"
          placeholder="Password"
        />
      </Form.Group>
      <Button onClick={handleSubmit}>Login</Button>
      {invalidModal}
    </Form>
  );

  // If the user is logged in, display nothing.
  if (loginStatus === 100) return null;
  // Otherwise, display the form or the current loading progress.
  return <div>{loginStatus >= 0 ? LoginProgressBar : LoginForm}</div>;
}

export default Login;
