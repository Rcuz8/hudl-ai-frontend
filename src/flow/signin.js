import React, { useState } from 'react'
import { ROUTES } from '../helpers/constants'
import { withRouter } from 'react-router-dom';

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};

function SignIn(props) {


  if (props.firebase == null)
    throw new Error('SignIn view was not provided a Firebase object (custom) instance');

  const [state, setState] = useState(INITIAL_STATE)

  const login = () => {

    const { email, password } = state;
 
    props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        setState( {error: error} );
      });
  }

  const onChange = event => {

    setState({...state, [event.target.name]: event.target.value });
  }

  const { email, password, error } = state;
 
  const isInvalid = password === '' || email === '';

  return (
    <div>
      <input
        name="email"
        value={email}
        onChange={onChange}
        type="text"
        placeholder="Email Address"
      />
      <input
        name="password"
        value={password}
        onChange={onChange}
        type="password"
        placeholder="Password"
      />
      <button disabled={isInvalid} onClick={() => login()}>
        Sign In
      </button>

      {error && <p>{error.message}</p>}
    </div>
  );


}

export default withRouter(SignIn)
 