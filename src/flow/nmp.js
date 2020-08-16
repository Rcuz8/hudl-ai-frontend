import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { URLs, socket_get, games_get, socket_setup } from "../helpers/constants";
import styles from './styles/nga.module.css'
import {ProgressBar} from 'react-bootstrap'
import axios from "axios";

/*/  New Model Page   /*/


function NMP(props) {
  const [clients, setClients] = useState([]);
  const [curr_client, setCurrClient] = useState(null);
  const [games, setGames] = useState([]);
  const [curr_game, setCurrGame] = useState(null);
  const [eval_film, setEvalFilm] = useState(0);
  const [progress, setProgress] = useState(-1)
  const [progressMsg, setProgressMsg] = useState(null)

  useEffect(() => {
    socket_get(URLs.PY_CLIENTS).then((cli) => {
      let result = cli.data
      if (result.toString() !== clients.toString()) {
        setClients(result);
      }
    });
  }, [setClients]);


  const selected_client = async (client) => {
    setCurrClient(client);
    setGames(client.games)
    let id = client.id;
    games_get( id )
      .then((resp) => {
        let games_response = resp.data
        if (games_response !== games) {
          console.log('Games response: ')
          console.log(games_response)
          setGames(games_response);
        }
      });
  };

  const selected_game = (game) => {
    console.log("selected game: " + game);
    setCurrGame(game)
  };

  /* List Components */
  const c_Clients = (clients || []).map((client, index) => (
    <tr onClick={() => selected_client(clients[index])}>
      <td class="json">{client.name}</td>
    </tr>
  ));
  const c_Games = (games || []).map((game, index) => (
    <tr onClick={() => selected_game(games[index])}>
      <td class="json">{game.name}</td>
    </tr>
  ));

  const selected_test_film = (film) => {
    console.log('selected test film: ' + film)
    setEvalFilm(film)
  }

  const c_Films = curr_game ? curr_game['films'].map((film, index) => {
    return <tr onClick={() => selected_test_film(index)}>
      <td class="json" style={index === eval_film ? {fontWeight: '700'}: {}}>{film.name}</td>
    </tr>
  }) : null

  const submit = () => {
    console.log('Submission requested.')
    setProgress(0)
    const socket_cb = (response, socket) => {
      const {pct, msg} = response
      console.log('Received progress: (', pct, '% )', '=', msg)
      setProgress(pct)
      setProgressMsg(msg)
      if (pct === 100) {
        console.log('Should be finishing mod creation.')
        socket.close()
        alert('Done.\n\n\tGenerated Models.')
        return
      }    
    }
    socket_setup(URLs.PY_NEW_MODEL, 'model_status', socket_cb, curr_game.id, eval_film)
  }

  return (
    <div>
      <h1>Create AI Model</h1>
      <br />
      <h2>Select a Client</h2>
      <table class={styles.itemlist}>
        <thead>
          <tr>
            <th>Client Name</th>
          </tr>
        </thead>
        <tbody>{c_Clients}</tbody>
      </table>
      <br/>
      <table class={styles.itemlist}>
        <thead>
          <tr>
            <th>Games</th>
          </tr>
        </thead>
        <tbody>{c_Games}</tbody>
      </table>
      <br/>
      <br/>

      <h2>Select Most Recent Film (for Evaluation)</h2>
      <table class={styles.itemlist}>
        <thead>
          <tr>
            <th>Films</th>
          </tr>
        </thead>
        <tbody>{c_Films}</tbody>
      </table>
      <br/>
      <br/>
     {curr_game != null && progress < 0 ?  <button onClick={submit}>Submit</button> : null}
     {progress >= 0 && progress < 100 ? 
     <div class='logging_in'>
        <h2>Generating Model.</h2>
        <ProgressBar animated variant="success" now={progress} />
        <p>{progressMsg}</p>
    </div> : null }
    </div>
  );
}

export default withRouter(NMP);
