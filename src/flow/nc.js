import React, { useState } from 'react';
import { withRouter } from 'react-router-dom'
import { ROUTES, URLs, socket_get } from '../helpers/constants'
import axios from 'axios';
/*/  New Client Page   /*/


const INITIAL_STATE = {
  email: '',
  password: '',
  phone: '',
  name: '',
  hudl_email: '',
  hudl_pass: '',
  error: null,
};

function isEmpty(str) {
  return (!str || 0 === str.length);
}

function allGood(list) {
  var all = true
  list.forEach((item) => { if (isEmpty(item)) all = false})
  return all
}

function NewClient(props) {

  if (props.firebase == null)
    throw new Error('New Client view was not provided a Firebase object (custom) instance');

  const [state, setState] = useState(INITIAL_STATE)

  const create = () => {
    let {email, password, name, phone, hudl_email, hudl_pass} = state
    socket_get(URLs.PY_NEW_CLIENT, email, password, name, phone, hudl_email, hudl_pass)
      .then(({data}) => {
          console.log('User Record created. \n')
          console.log(data)
          alert('User Record created.')
          setState(INITIAL_STATE)
      })
      .catch((err) => {
        console.error('Could not create user: ' + err)
        alert('Could not create user record. \nError: ' + err)
      })
  }

  const onChange = event => {
    setState({...state, [event.target.name]: event.target.value });
  }

  const { email, password, phone, name, hudl_email, hudl_pass, error } = state;
 
  const isInvalid = !allGood([email, password, phone, name]);

  return (
    <div>
      <input
        name="name"
        value={name}
        onChange={onChange}
        type="text"
        placeholder="Name"
      />
      <br/>
      <input
        name="email"
        value={email}
        onChange={onChange}
        type="text"
        placeholder="Email Address"
      />
      <br/>
      <input
        name="password"
        value={password}
        onChange={onChange}
        type="password"
        placeholder="Password"
      />
      <br/>
      <input
        name="phone"
        value={phone}
        onChange={onChange}
        type="phone"
        placeholder="phone"
      />
      <br/>
      <h3>HUDL Credentials</h3>
      <input
        name="hudl_email"
        value={hudl_email}
        onChange={onChange}
        type="email"
        placeholder="Email - HUDL"
      />
      <input
        name="hudl_pass"
        value={hudl_pass}
        onChange={onChange}
        type="text"
        placeholder="Password - HUDL"
      />
      <br/>
      <br/>
      <br/>
      <button disabled={isInvalid} onClick={() => create()}>
        Sign In
      </button>

      {error && <p>{error.message}</p>}
    </div>
  );


}

export default withRouter(NewClient)