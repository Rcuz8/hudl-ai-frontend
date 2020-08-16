import { withRouter } from 'react-router-dom'
import { URLs, socket_get } from '../helpers/constants'
import {ProgressBar} from 'react-bootstrap'
import styles from './styles/nga.module.css'
import React, {useState, useEffect} from 'react';
import SelectData from '../app/internal/SelectData'
import axios from 'axios'
import retokenize from '../helpers/Cleanse'

/*/  New Game Analysis   /*/




const NGA = React.memo((props) => {

  const [clients, setClients] = useState([])
  const [loginStatus, setLoginStatus] = useState(-1)
  const [session_id, setSessionId] = useState(null)
  const [allFolders, setAllFolders] = useState(null)
  const [curr_client, setCurrClient] = useState(null)
  const [name, setName] = useState('')


    // Formally submit login info & begin handling responses
    const auth_and_get_directory = async (email, password) => {
        setLoginStatus(0);
        // Login & get data
        let ws;
        try {
          ws = new WebSocket('ws://' + URLs.NODE_LOGIN);
        } catch (err) {
          alert('Could not establish WebSocket connection. Details in logger.')
          console.log('Failed WS Connection Details:')
          console.log('URL: ', 'ws://' + URLs.NODE_LOGIN)
          console.log('Error: ', err.message)
        }
        ws.onerror = function(err) {
            alert('Websocket Error. Details in logger. \nNOTE: If this is on LOGIN, node server is down')
            console.log('Failed WS Connection Details:')
            console.log('URL: ', 'ws://' + URLs.NODE_LOGIN)
            console.log('Error: ', err)
        }; 
        ws.onopen = function() {
            console.log('WebSocket Client Connected : login');
            ws.send(JSON.stringify({email: email, password: password}));
        };
        ws.onmessage = function(e) {
          let got = JSON.parse(e.data);
          if (Object.keys(got).length === 0) { //  bad data
            alert(
              `Could not log in with HUDL credentials.
            \n Either
            \n (1) The credentials are bad
            \n Or
            \n (2) There is a server error present`)
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
          // Check for completion 
          if (status === 100) {
              setSessionId(session)
              setAllFolders(directory)
          }
      };
    }

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
            <ProgressBar animated variant="success" now={loginStatus} />
            <p>{loginProgressLabel()}</p>
        </div>
    );

    const loginprogress = () => {
      if (loginStatus === 100) return null;
      return (
          <div>
              {loginStatus >= 0 ? LoginProgressBar : null}
          </div>
      );
    }

    const send_datum = (headers, datum, film_names, cid) => {
      setAllFolders(null)
      setCurrClient(null)
      console.log('Sending datum with params: ')
      console.log('\Client ID: ')
      console.log(cid)
      console.log('\tHeaders: ')
      console.log(headers)
      console.log('\tFilm Names: ')
      console.log(film_names)
      console.log('\tDatum: ')
      console.log(datum)
      socket_get(URLs.PY_NEW_QUALITY_ANALYSIS, 
        name, film_names, datum, headers, cid)
        .then((response) => {
            //handle success
            alert('Done.\n\n\tGenerated Analysis.')
            console.log(response);
        }).catch(function (response) {
            //handle error
            alert('Error: ' + response.toString())
            console.log(response);
        });
    }


    
  useEffect(() => {
    socket_get(URLs.PY_CLIENTS).then(cli => {
      console.log('Got clients.')
      let result = cli.data
      if (result.toString() !== clients.toString()) {
        setClients(result)
        console.log('Clients: ' + JSON.stringify(clients))
        console.log('Result: ' +  JSON.stringify(result))
      }
        
    })
  
  } , [setClients])

  
  const selected_client = async (client) => {
      setCurrClient(client)
      let em = client.hudl_email
      let ps = client.hudl_pass
      await auth_and_get_directory(em, ps)
  }

  /* List Components */
  const c_Clients = clients.map((client, index) => (
    <tr onClick={() => selected_client(clients[index])}>
      <td class='json'>{client.name}</td>
    </tr>
  ))


  return <div>
    <h1>New Game Analysis</h1>
    <br/>
    <h2>Select a Client</h2>
    <table class={styles.itemlist}>
      <thead>
        <tr>
          <th>Client Name</th>
        </tr>
      </thead>
      <tbody>
        {c_Clients}
      </tbody>
    </table>
    <br/>
    <label for='name'>Game Title: </label>
    <input
      name='name'
      onChange={(ev) => setName(ev.target.value)}
      value={name}
      placeholder='Game Title'
      />
    <br/>
    {loginprogress()}
    {allFolders != null ?
      <SelectData data={allFolders} session_id={session_id} depth={0} callback={({ headers, data, film_names }) => send_datum(headers, data, film_names, curr_client.id)} /> : null}
    {}

  </div>
})

export default withRouter(NGA)