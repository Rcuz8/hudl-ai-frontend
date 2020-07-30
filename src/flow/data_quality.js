import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Tabs, Tab } from 'react-bootstrap';
import { withRouter } from "react-router-dom";
import { URLs, socket_get, games_get } from "../helpers/constants";
import styles from "./styles/dq.module.css";
import axios from "axios";

const TEST_CLIENT_ID = "giP0g470mUeEe76VXCwlrCpT1xt2";
const resp = [{"created":"Thu, 16 Jul 2020 06:24:13 GMT","films":[{"missing":{"BLITZ":0.93,"COVERAGE":0.59,"DEF FRONT":0.58,"DIST":0.07,"DN":0.03,"GAP":1,"GN/LS":0.33,"HASH":0.01,"OFF FORM":0.27,"OFF PLAY":0.34,"OFF STR":1,"PASS ZONE":1,"PLAY DIR":1,"PLAY TYPE":0.06,"QTR":1,"RESULT":1,"YARD LN":0.04},"name":"RPI vs. ROCHESTER FGIC 10/05/2019","quality_evaluations":[{"name":"pre_align_form","quality":0.32},{"name":"post_align_pt","quality":0.32},{"name":"post_align_play","quality":0.21}]},{"missing":{"BLITZ":0.97,"COVERAGE":0.72,"DEF FRONT":0.84,"DIST":0.09,"DN":0.08,"GAP":1,"GN/LS":0.2,"HASH":0.03,"OFF FORM":0.27,"OFF PLAY":0.33,"OFF STR":1,"PASS ZONE":1,"PLAY DIR":1,"PLAY TYPE":0.01,"QTR":1,"RESULT":0.94,"YARD LN":0.07},"name":"UR vs. Union College 10/12/2019","quality_evaluations":[{"name":"pre_align_form","quality":0.44},{"name":"post_align_pt","quality":0.44},{"name":"post_align_play","quality":0.33}]}],"id":"0079b5ff-ad32-4d38-bd47-d79569c3b2a0","name":"HUNCHO","owner":"giP0g470mUeEe76VXCwlrCpT1xt2"},{"created":"Fri, 17 Jul 2020 01:53:15 GMT","films":[{"missing":{"BLITZ":0.93,"COVERAGE":0.61,"DEF FRONT":0.81,"DIST":0.07,"DN":0.07,"GAP":1,"GN/LS":0.18,"OFF FORM":0.23,"OFF PLAY":0.38,"OFF STR":1,"PASS ZONE":1,"PLAY DIR":1,"PLAY TYPE":0.02,"QTR":1,"RESULT":1},"name":"UR vs SLU FGIC","quality_evaluations":[{"name":"pre_align_form","quality":0.9},{"name":"post_align_pt","quality":0.9},{"name":"post_align_play","quality":0.44}]},{"missing":{"BLITZ":0.91,"COVERAGE":0.66,"DEF FRONT":0.86,"DIST":0.15,"DN":0.15,"GAP":1,"GN/LS":0.36,"HASH":0.33,"OFF FORM":0.27,"OFF PLAY":0.43,"OFF STR":1,"PASS ZONE":1,"PLAY DIR":1,"PLAY TYPE":0.39,"QTR":1,"RESULT":1,"YARD LN":0.2},"name":"UR vs. Hobart College 11/16/2019","quality_evaluations":[{"name":"pre_align_form","quality":0.89},{"name":"post_align_pt","quality":0.89},{"name":"post_align_play","quality":0.45}]},{"missing":{"BLITZ":1,"COVERAGE":0.56,"DEF FRONT":0.58,"GAP":1,"GN/LS":0.14,"OFF FORM":0.39,"OFF PLAY":0.49,"OFF STR":1,"PASS ZONE":1,"PLAY DIR":1,"PLAY TYPE":0.18,"QTR":1,"RESULT":1},"name":"UR vs. ASC FGIC 09/21/2019 (Fixed)","quality_evaluations":[{"name":"pre_align_form","quality":0.8},{"name":"post_align_pt","quality":0.8},{"name":"post_align_play","quality":0.41}]}],"id":"2ceaf5db-41b7-4010-8cde-15a6c6f36d33","name":"Game game game","owner":"giP0g470mUeEe76VXCwlrCpT1xt2"}];

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
  })

    console.log(films)
  return (
    <div class={styles.films_container}>
      {films.map((film) => {

          let mmissings = dict_sort_nokey(film.missing)
          console.log(mmissings)
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
                <Tab tabClassName='tabs' eventKey="home" title="Critical">
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
