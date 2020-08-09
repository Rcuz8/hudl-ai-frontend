import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
 import { URLs, socket_get, TEST_MODE } from './helpers/constants'
import './index.css';
import './app/internal/App.css'
import Axios from 'axios'
import Router from './router';
import Firebase from './helpers/fb/setup'
const firebase = new Firebase()

const Index = (props) => {

  const [isAdmin, setAdmin] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {

    const listener = firebase.auth.onAuthStateChanged(authUser => { 
      if (authUser === user) return // no change
      setUser(authUser)
      try {
        let par = {params:{uid:authUser.uid}}
        if (TEST_MODE) {
          setAdmin(true)

        } else {
          socket_get(URLs.PY_USERINFO,par).then((res) => {
            setAdmin(res.data['isAdmin'] === true)
          })
        }
        
      } catch (e) {}
    
    }); 
  })

  return <Router firebase={firebase}
           user={user} isAdmin={isAdmin}/>
} 

ReactDOM.render(
    <Index />,
  document.getElementById('root'),
);
