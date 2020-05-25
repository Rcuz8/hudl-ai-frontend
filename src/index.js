import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Navigation from './Navigation';
import ViewData from './ViewData';
import axios from 'axios';
import { URLs } from './Helper-Files/constants';

import 'bootstrap/dist/css/bootstrap.min.css';

let m = 'http://localhost:9009/mod';

function AXIOS_TESTER() {

  const [data, setData] = useState(null);

  let data_string = '2,D,1,10,R,-30,Run,6,DUCK,SPLIT+ZONE,OKIE,TEXAS!!!3,D,2,4,R,-36,Pass,3,TRIO,RUTGERS,FIELD,TEXAS!!!4,D,3,1,L,-39,Run,2,TWINS+R,POWER,EAGLE,CUSE!!!5,D,1,10,L,-41,Pass,-4,EMPTY,VIRGINIA+GEORGIA,WOLF,TEXAS!!!6,D,2,14,R,-37,Pass,16,TRIO,CURL+SLIDE,ATF,TEXAS!!!7,D,1,10,R,47,Pass,38,TRIO,VIRGINIA,ATF,TEXAS!!!8,D,1,8,R,9,Run,6,RACKET,POWER,FIELD,CUSE!!!9,D,2,1,M,1,Run,1,UNB+DEUCE,QB+POWER+RD,ANCHOR+AWAY,CARDINAL!!!22,D,1,10,L,-30,Run,2,TRUCK,OZ,FIELD,CLEMSON!!!23,D,2,8,R,-32,Pass,9,DOUBLES,VIRGINIA,ATF,TEXAS!!!24,D,1,10,R,-41,Pass,0,EMPTY,STICK+PRINCETON,ATF,TEXAS!!!25,D,2,10,R,-41,Pass,5,EMPTY,STICK+PRINCETON,WOLF,TEXAS!!!26,D,3,5,L,-46,Pass,8,DOUBLES,DARTMOTH,FIELD,FL+OUT!!!27,D,1,10,L,44,Pass,23,DOUBLES,PENN+PRINCETON,FIELD,CLEMSON!!!28,D,1,10,L,21,Pass,4,TRAP,RPO+BUBBLE,ATF,TEXAS!!!29,D,2,6,M,17,Pass,8,TRUCK,BOOT+FLOOD,OKIE,HOUSTON!!!30,D,1,9,R,9,Pass,9,TRUCK,X+FADE,FIELD,MAINE!!!39,D,1,10,L,-25,Run,-7,DUCK,OZ,ATF,TEXAS!!!40,D,2,17,L,-18,Pass,0,EMPTY,VIRGINIA+PRINCETON,OKIE,TEXAS!!!41,D,3,17,L,-18,Pass,0,DUCK,VIRGINIA+DROPOUTS,WOLF,CUSE+SPY!!!52,D,1,10,R,-33,Run,4,DUCK,DRAW+FOLD,FIELD,CLEMSON!!!53,D,2,6,R,-37,Pass,3,TRIO,HAWAII+WHEEL,OKIE,FL+IN!!!54,D,3,3,R,-40,Pass,10,TRIO,DARTMOTH,OKIE,CUSE!!!55,D,1,10,R,50,Pass,0,TRIO,HAWAII+WHEEL,OKIE,TEXAS!!!56,D,2,10,R,50,Pass,11,BUNCH,DRIVE+SERIES,WOLF,CLEMSON+SPY!!!57,D,1,10,R,39,Pass,6,RACKET,SMASH+X+POST,FIELD,CLEMSON!!!59,D,2,4,R,33,Pass,2,DUCK,DOUBLE+POST,WOLF,CLEMSON+SPY!!!60,D,3,5,L,35,Pass,0,DOUBLES,VIRGINIA+PRINCETON,WOLF,CUSE+SPY!!!62,D,1,10,L,24,Run,6,DUCK,JET+SWEEP,WOLF,CLEMSON+SPY!!!63,D,2,4,L,18,Pass,0,DOUBLES,X+FADE,FIELD,FL+OUT!!!64,D,3,4,L,18,Run,-1,TWINS,POWER,FIELD,CLEMSON!!!94,D,1,10,R,-36,Run,12,TRIO,IZ,OKIE,TEXAS!!!95,D,1,10,R,-48,Run,5,TRIO,IZ,OKIE,TEXAS!!!96,D,2,5,R,47,Run,5,DUCK,SPLIT+ZONE,OKIE,HOUSTON!!!97,D,3,1,R,42,Run,2,TWINS,POWER,EAGLE,CUSE!!!98,D,1,10,R,40,Run,16,TRIO,IZ,ATF,TEXAS!!!99,D,1,10,M,24,Pass,0,TRIO,BUBBLE,FIELD,CLEMSON!!!100,D,2,10,M,24,Pass,5,TRIO,BUBBLE+GAS,FIELD,FLORIDA!!!101,D,3,5,R,19,Run,6,DOUBLES,IZ,OKIE,TEXAS!!!102,D,1,10,M,14,Pass,3,DOUBLES,POST+SIT,OKIE,TEXAS!!!103,D,2,7,L,11,Run,3,DUCK,SPLIT+ZONE,FIELD,FL!!!121,D,1,10,R,-30,Run,8,TRIO,IZ,OKIE,TEXAS!!!122,D,2,2,M,-38,Run,6,TRIO,IZ,FIELD,CLEMSON!!!123,D,1,10,L,-44,Pass,0,TRIO,DARTMOTH,FIELD,CLEMSON!!!126,D,2,10,L,43,Pass,0,TRIO,VIRGINIA,FIELD,CLEMSON!!!127,D,2,10,L,43,Pass,-10,TRIO,DARTMOTH,FIELD,TEXAS!!!128,D,1,10,R,-47,Pass,22,TRIO,VIRGINIA,FIELD,TEXAS!!!129,D,1,10,R,31,Run,0,RACKET,SPLIT+ZONE,OKIE,TEXAS!!!130,D,2,10,R,31,Pass,16,TRIO,CURL+SLIDE,FIELD,TEXAS!!!131,D,1,10,R,15,Run,-6,PRO,OZ,OKIE,FL+IN!!!132,D,1,16,L,21,Pass,15,PRO,VIRGINIA,OKIE,HOUSTON!!!133,D,1,6,L,6,Pass,0,TWINS,PICK,ANCHOR,CARDINAL!!!134,D,2,6,L,6,Pass,0,TRUCK+FIB,SMASH+X+SLANT,ANCHOR,CARDINAL!!!146,D,1,10,M,-45,Pass,0,TRIO,BUBBLE,OKIE,FLORIDA+IN!!!147,D,2,10,L,-45,Run,-5,TRIO,IZ,FIELD,FLORIDA';
  let outputs = '10,11';
  
  const send = () => {
    axios.get(m, {
      params: {
        data: data_string,
        outputs: outputs
      }
    }).then((resp) => setData(resp.data));
    // axios.get(URLs.JAVA_GETMODEL, {params: {data: data}}).then((resp) => setData(resp));
  }

  // const send = () => {
  //   axios.get(URLs.JAVA_GETMODEL, {
  //     params: {
  //       data: data_string,
  //       outputs: outputs.toString()
  //     }
  //   }).then((resp) => setData(resp.data));
  //   // axios.get(URLs.JAVA_GETMODEL, {params: {data: data}}).then((resp) => setData(resp));
  // }

  var res = data;
    try { res = JSON.stringify(data); } catch (e) {}

  return (
          <div>
        {res}
        <button onClick={() => send()}>SEND</button>
      </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Navigation />
  </React.StrictMode>,
  document.getElementById('root')
);

