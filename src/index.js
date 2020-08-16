import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
 import { URLs, socket_get, TEST_MODE , TEST_MODE_ISADMIN} from './helpers/constants'
import './index.css';
import './app/internal/App.css'
import Axios from 'axios'
import Router from './router';
import Firebase from './helpers/fb/setup'
import SocketIOTest from './st'
const firebase = new Firebase()

const Index = (props) => {

  const [isAdmin, setAdmin] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {

    const listener = firebase.auth.onAuthStateChanged(authUser => { 
      if (authUser === user) return // no change
      setUser(authUser)
      try {
        if (TEST_MODE) {
          setAdmin(TEST_MODE_ISADMIN)
        } else {
          socket_get(URLs.PY_USERINFO,authUser.uid).then((res) => {
            const adm = res['isAdmin'] === true
            setAdmin(adm)
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
