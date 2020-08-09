import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Tabs, Tab } from 'react-bootstrap';
import { withRouter } from "react-router-dom";
import { URLs, socket_get, games_get, TEST_MODE } from "../helpers/constants";
import styles from "./styles/dq.module.css";
import axios from "axios";
import { film_qualities } from '../test/testdata'

const TEST_CLIENT_ID = "giP0g470mUeEe76VXCwlrCpT1xt2";

const extract_films = (games) => [].concat.apply([], games.map((game) => game.films))

const gridded = (n) => {
  return {
    display: 'grid',
    gridTemplateColumns: 'repeat(' + n + ', 1fr)'
  }
}

const prog = (pct, size) => (
  <div style={{ width: size, height: size, padding: '5px' }}>
    <CircularProgressbar
      value={pct}
      text={`${pct}`}
      circleRatio={0.6}
      counterClockwise={true}
      strokeWidth={4}
      styles={buildStyles({
        // Rotation of path and trail, in number of turns (0-1)
        rotation: 0.25,
        // Text size
        textSize: "36px",
        pathColor: `tomato`,
        textColor: "#f88",
        trailColor: "#d6d6d6",
      })}
    />
  </div>
);

const dict_sort = (dict, key) => {
  return dict.sort((a, b) => (a[key] > b[key]) ? 1 : -1)
}

const dict_remove = (dict, keys) => {
  return dict.filter((item) => !keys.includes(item['key']))
}

const LIST_IRRELEVENTS = ['GAP', 'OFF STR', "PASS ZONE", 'PLAY DIR',
'BLITZ', 'DEF FRONT', 'COVERAGE', 'GN/LS']
const LIST_UNIMPORTANTS = ['QTR', 'RESULT']

const dict_sort_nokey = (dict, slice=0) => {
  let keys = Object.keys(dict)
  dict = keys.map(key => {return {'key': key, 'val': dict[key]}})
  dict = dict_sort(dict, 'val')
  dict = dict_remove(dict, LIST_IRRELEVENTS)
  dict = dict.reverse()
  if (slice <= 0) return dict
  return dict.slice(0, slice)
}


/* Keep this, unless I store plaintext defs in database */
const QUALITY_DICTS = {
  'pre_align_form': 'Pre-Align Formation',
  'post_align_pt': 'Post-Align Off Play Type',
  'post_align_play': 'Post-Align Off Play',
  
}

const missing_data_lists_component = (list, type) => {
  if (type == 'all') {
      list = list
  } else if (type == 'important') {
      list = dict_remove(list,LIST_UNIMPORTANTS)
  } else throw new Error('Cuz-handled Error. Invalid input')

  return list.map(miss => (
    <div style={{...gridded(2),...{ width: '80%', margin: 'auto'}}}>
      <div style={{textAlign: 'left'}}>{miss.key}</div>
      <div>{Math.round(miss.val * 100)}%</div>
    </div>
  ))
}

const Component = React.memo((props) => {
  const [games, setGames] = useState([]);
  const [films, setFilms] = useState([]);

  useEffect(() => {
    if (TEST_MODE) {
      setGames(film_qualities);
      setFilms(extract_films(film_qualities));
    } else {
      games_get(TEST_CLIENT_ID || props.user.uid)
    .then((resp) => {
      if (resp.data == null)
        return
      let games_response = resp.data
      console.log('Games response: ' + JSON.stringify(games_response))

      if (games_response.toString() !== games.toString()) {

        setGames(games_response);
        setFilms(extract_films(games_response));

      }
    });
    }
    
  }, [setGames, setFilms])

  return (
    <div class={styles.films_container}>
      {films.map((film) => {

          let mmissings = dict_sort_nokey(film.missing)
          return <div style={{padding: '20px'}}>
          <h2 >{film.name}</h2>
          <div style={gridded(2)}>
            <div style={{width: '100%',...gridded(3)}}>
              <div/>
              <h3 style={{width: '100%'}}>Overall</h3>
              <div/>
              {film.quality_evaluations.map(evaluation => (
                <div style={{padding: '5px'}}>
                  <div>
                  {prog(Math.round(evaluation.quality * 100), 100)}
                  </div>
                  <div>
                    {QUALITY_DICTS[evaluation.name]}
                  </div>
                </div>
                
              ))}
            
            </div>
            <div >
              <h3>Missing</h3>
              <Tabs className="tabs" defaultActiveKey="profile" id="uncontrolled-tab-example">
                <Tab tabClassName='tabs' eventKey="home" title="❗️">
                <div class={styles.missings}>
                  {missing_data_lists_component(mmissings,'important')}
                </div>
                </Tab>
                <Tab eventKey="profile" title="All">
                  <div class={styles.missings}>
                    {missing_data_lists_component(mmissings,'all')}
                  </div>
                </Tab>
              </Tabs>
              
            </div>
          </div>
        </div>
  
              })}
          </div>
  );
});

export default withRouter(Component);
