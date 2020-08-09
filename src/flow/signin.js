import React, { useState } from "react";
import { ROUTES } from "../helpers/constants";
import { withRouter } from "react-router-dom";
import * as con from "../helpers/constants";
import "./styles/signin.css";
import Alert from 'react-bootstrap/Alert'
import {NavigationSignin as Nav} from './nav'
const INITIAL_STATE = {
  email: "",
  password: "",
  error: null,
};

function SignIn(props) {
  if (props.firebase == null)
    throw new Error(
      "SignIn view was not provided a Firebase object (custom) instance"
    );

  const [state, setState] = useState(INITIAL_STATE);

  const login = async () => {
    console.log('State:', state)
    const { email, password } = state;

    try {
      await props.firebase
      .doSignInWithEmailAndPassword(email, password)
      props.history.push(ROUTES.HOME);
      console.log('Done..')
    } catch (error) {
      setState({ error: {message: 'Incorrect login credentials.'} });
    }

  };

  const onChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.value });
  };

  const { email, password, error } = state;

  const isInvalid = password === "" || email === "";


  return (
    <div>
      <Nav />
         <div class="signin-view">
      <div>
        <h3>Account</h3>
        <div>
          <div class="signin-grid">
            <div><strong>Email</strong></div>
            <input
              name="email"
              value={email}
              onChange={onChange}
              type="text"
              placeholder="Email Address"
              class='signin-input'
              style={{ textAlign: "left", padding: "10px 15px" }}
            />
            <div><strong>Password</strong></div>

            <input
              name="password"
              value={password}
              onChange={onChange}
              type="password"
              placeholder="Password"
              class='signin-input'
              style={{ textAlign: "left", padding: "10px 15px" }}
            />
            <div></div>
          </div>
          <br />{" "}
          <button class='stdbtn' disabled={isInvalid} onClick={() => login()}>
            Sign In
          </button>
          {error && <Alert onClick={() => setState({ ...state, error: null }) } style={{marginTop: '20px'}} variant='danger'>{error.message}</Alert>}
        </div>
      </div>
    </div>
  
    </div>
   );
}

export default withRouter(SignIn);
