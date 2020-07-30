import React, { useState, useEffect } from "react";
import "./predict_screen.css";
import { ProgressBar } from "react-bootstrap";
import * as tf from "@tensorflow/tfjs";
import * as keras from '../../keras/utils'
import { DataFrame } from 'pandas-js';

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// // Percent format
// const mrd = pc => Math.round(pc * 100) + "%";

// Sample Response Info
const SRIs = [
  {
    name: "I Form",
    prob: 0.25,
    run_prob: 0.55,
    plays: [
      { name: "toss", prob: 0.15 },
      { name: "sweep", prob: 0.12 },
      { name: "jet", prob: 0.1 },
    ],
  },
  {
    name: "Wing T",
    prob: 0.15,
    run_prob: 0.74,
    plays: [
      { name: "dive trap", prob: 0.27 },
      { name: "sweep", prob: 0.18 },
      { name: "jet", prob: 0.13 },
    ],
  },
  {
    name: "Spread",
    prob: 0.08,
    run_prob: 0.35,
    plays: [
      { name: "hitches", prob: 0.15 },
      { name: "sweep", prob: 0.12 },
      { name: "jet", prob: 0.1 },
    ],
  },
];

const after = (str, sub) => str.substring(str.indexOf(sub)+sub.length)
const before = (str, sub) => str.substring(0, str.indexOf(sub))

const loadhttp = (url, model_id, model_name) => {
  const delim = '%2F'

  return tf.io.http(url, {
    weightPathPrefix: before(url, 'Models') + ['Models',model_id,model_name].join(delim) + delim
  });
}

// Sample Formation info  -> Same format as SRIs (superset)
const FIs = SRIs;

const queries = [
    ['sampleid', 'mymodel'],
    ["2ceaf5db41b740108cde15a6c6f36d33","postalignplay"],
    ['id1243onjun29','postalignplay']
  ]

const fetch_model = async (storage, model_id, model_name) => {
  const model_url = async () =>
    await storage
      .ref(`Models/${model_id}/${model_name}/model.json`)
      .getDownloadURL();
  const shard1_url = async () =>
    await storage
      .ref(`Models/${model_id}/${model_name}/group1-shard1of1.bin`)
      .getDownloadURL();
  let mu = await model_url();
  let http = loadhttp(mu, model_id, model_name);
  console.log(http.path)
  console.log('Prefix', http.weightPathPrefix)
  let model = await tf.loadLayersModel(http)
  console.log("Loaded model.");
  console.log(model);
}

const fetch_sample_model = async (firebase) => {
  let query = queries[2]
    let model_id = query[0]
    let model_name = query[1]  
    const pre_align_form_model = await fetch_model(fetch_model(firebase.storage, model_id, model_name))
    
}

const mock_model = () => {

  /*
    10 - 20 - 6
  */

  const model = tf.sequential(); 

  model.add(tf.layers.dense({units: 20, inputShape: [10], activation: 'relu'}));
  model.add(tf.layers.dense({units: 4, activation: 'softmax'}));
  model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});
  return model
}

const output_dictionaries = [
  ['a','b','c','d'],
  ['e','f','g','h'],
  ['i','j','k','l']
]

const ttl_dst = (dist, onOurSide) => {
  /* Tests: 
  let tests_pass = [[1,true,99],[49,true,51],
            [50,false,50],[50,true,50],
            [1,false,1],[49,false,49]]
            .map((arr) => ttl_dst(arr[0],arr[1]) === arr[2]).every((val) => val)
  */
  return onOurSide ? 50 + (50-dist) : dist
}

const data_headers = [
  "PLAY #",    "ODK",
  "DN",        "DIST",
  "HASH",      "YARD LN",
  "PLAY TYPE", "RESULT",
  "GN/LS",     "OFF FORM",
  "OFF PLAY",  "OFF STR",
  "PLAY DIR",  "GAP",
  "PASS ZONE", "DEF FRONT",
  "COVERAGE",  "BLITZ",
  "QTR"
]

const get_game_dataframe = async (id, db) => {
  // var fetched_films = await db.collection('games_data').doc(id).get()
  // fetched_films = fetched_films.data()
  // const films_data = fb_data_to_matrix(fetched_films)
  // console.log('Arrived at Film(s) Data:\n')
  var films_data = pandas_reformat(keras.films_data, data_headers)
  const df = new DataFrame(films_data)
  // console.log('Arrived at DataFrame:\n',df.toString())
  return df
}

/*
  Expecting format:

    {
    data: [
      {
        data: [
          {0: [1,2,3]},
          {0: [4,5,6]},
        ]
      },
      {
        data: [
          {0: [1,2,3]},
          {0: [4,5,6]},
        ]
      }
    ]
  }
*/
const fb_data_to_matrix = (fb_data, concat=true) => {
  console.log('Recieved Firestore data: \n', fb_data)

  const data = fb_data['data'].map((film) => {
    return film['data'].map((row) => row['0'])
  })
  
  if (concat)
    return [].concat.apply([],data)
   else return data
}

/*  [[1,2], [2,3]]  =>  [{x: 1, y: 2}, {x: 2, y: 3}]  */
const pandas_reformat = (data, headers) => 
  data.map((row) => {
    var dict = {}
    headers.map((head, i) => {
      dict[head] = row[i]
    })
    return dict
  })

export default function Predict_screen(props) {

  const game_id = '0079b5ff-ad32-4d38-bd47-d79569c3b2a0'

  const [form, setForm] = useState(FIs[0]);
  const [scoreUs, setScoreUs] = useState(0);
  const [scoreThem, setScoreThem] = useState(0);
  const [dn, setdn] = useState(1);
  const [ydln, setydln] = useState(50);
  const [dist, setdist] = useState(10);
  const [qtr, setqtr] = useState(1);
  const [hash, setHash] = useState('L');
  const [ppt, setPPT] = useState('Run');
  const [ourSide, setSide] = useState(false); // Ball in Offense's own territory

  const [model_form, setformmodel] = useState(null)
  const [model_pt, setptmodel] = useState(null)
  const [model_play, setplaymodel] = useState(null)
  const [df, setdf] = useState(null)

  useEffect(() => {

    // Load Models
    setformmodel(mock_model())
    setptmodel(mock_model())
    setplaymodel(mock_model())

    // Load DataFrame
    get_game_dataframe(game_id, props.firebase.db).then((frame) => {
      setdf(frame)
    })
    
  }, [props.firebase.db, setformmodel, setptmodel, setplaymodel, setdf] );
   

  const hashdict = ['L','M','R']
  const ptdict = ['Run', 'Pass']

  const compile_input = () => {
    
    // One-hot encode categoricals (mdf = modified variable)

    let mdf_hash = keras.one_hot(hashdict.indexOf(hash)+1, hashdict.length )
    let mdf_ppt = keras.one_hot(ptdict.indexOf(ppt)+1, ptdict.length )
    let d2e = ttl_dst(ydln, ourSide)
    let scorediff = scoreUs - scoreThem
    console.log('Compiling configuration.')
    console.log(
    'Down: ', dn, '\n',
    'Dist: ', dist, '\n',
    'D2E : ', d2e, '\n',
    'Hash: ', mdf_hash, '\n',
    'PPT : ', mdf_ppt, '\n',
    'QTR : ', qtr, '\n',
    'ScDf: ', scorediff, '\n',
    )
    
    const args = keras.compileargs(dn, dist, d2e, mdf_hash, mdf_ppt, qtr, scorediff)
    return args
  }

  const get_run = () => {
    if (form == null) return <div> Waiting on formation selection.. </div>;
    else
      return (
        <div>
          {/* Results */}
          <div class="lt-run-time-header">
            <div>RUN</div>
            <div>{Math.round(form.run_prob * 100)}%</div>
            <div>PASS</div>
            <div>{100 - Math.round(form.run_prob * 100)}%</div>
          </div>
          <div class="wider">Top 3 Plays</div>
          {form.plays.map((play) => (
            <div class="lt-run-time-data">
              <div>{capitalize(play.name)}</div>
              <ProgressBar
                now={Math.round(play.prob * 100)}
                style={{ height: "25px" }}
              />
            </div>
          ))}
        </div>
      );
  };

  const changeFormation = (toName) => {
    setForm(FIs.filter((form) => form.name === toName)[0]);
  };


  const generate_form_prediction = async () => {
      const input = compile_input()
      const raw_predictions = await model_play.predict(tf.tensor2d([input])).data()
      console.assert(output_dictionaries[0].length === raw_predictions.length )
      const mapped_predictions = output_dictionaries[0].map((el, i) => ({name: el, val: raw_predictions[i]}))
      const top_three_predictions = mapped_predictions.sort((a,b) => a.val > b.val ? -1 : a.val === b.val ? 0 : 1)
        .slice(0,3)

      console.log(top_three_predictions)

  };

  return (
    <div class="lt-grid-container">
      <div class="wider">
        <h2>Configure</h2>
      </div>
      <div class="lt-score">
        <div>US</div>
        <div>THEM</div>
        <input
          class="input-box"
          name="score-us"
          onChange={(ev) => setScoreUs(ev.target.value)}
          type="number"
          value={scoreUs}
        />
        <input
          class="input-box"
          name="score-them"
          onChange={(ev) => setScoreThem(ev.target.value)}
          type="number"
          value={scoreThem}
        />
        <div>QUARTER</div>
        <select class="input-box" onChange={(ev) => setqtr(parseInt(ev.target.value))}>
          {[1, 2, 3, 4].map((item) => (
            <option value={item}>{item}</option>
          ))}
        </select>
      </div>
      <div class="lt-scenario">
        <div>DOWN</div>
        <select class="input-box" onChange={(ev) => setdn(parseInt(ev.target.value))}>
          {[1, 2, 3, 4].map((item) => (
            <option value={item}>{item} </option>
          ))}
        </select>
        <div>DISTANCE</div>
        <input class="input-box" onChange={(ev) => setdist(parseInt(ev.target.value))} />
        <div>YD LN</div>
        <div>
        <input class="input-box" onChange={(ev) => setydln(parseInt(ev.target.value))} />
        <label for='onOurs'>Off. Terr?</label>
        <input type='checkbox' name='onOurs' onChange={(ev) => setSide(ev.target.value)} />
        {/* <div style={{display: 'grid', gridAutoColumns: 'repeat(2, 1fr)'}}>
        <input class="input-box" onChange={(ev) => setydln(ev.target.value)} />
        <div>
          <label for='onOurs'>Off. Terr?</label>
          <input type='checkbox' name='onOurs' onChange={(ev) => setydln(ev.target.value)} />
        </div> */}
        </div>
        
        <div>HASH</div>
        <select class="input-box" onChange={(ev) => setHash(ev.target.value)}>
          {hashdict.map((item) => (
            <option value={item}>{item} </option>
          ))}
        </select>
        <div>LAST PLAY</div>
        <select class="input-box" onChange={(ev) => setPPT(ev.target.value)}>
          {ptdict.map((item) => (
            <option value={item}>{item} </option>
          ))}
        </select>
      </div>
      <div class="wider">
        <button onClick={() => generate_form_prediction()}>Generate</button>
        <h2 style={{ marginTop: "20px" }}>Analyze</h2>
      </div>
      <div class="lt-prediction">
        <div class="lt-prediction-header">PRE-ALIGNMENT</div>
        <div class="lt-prediction-data">
          <div>FORM</div>
          <div>TYPE</div>
          <div>PLAY</div>
        </div>
        {SRIs.map((item) => (
          <div class="lt-prediction-data">
            <div>
              <div>
                {item.name} ({Math.round(item.prob * 100)}%)
              </div>
            </div>
            <div>
              <div>Pass ({100 - Math.round(item.run_prob * 100)}%)</div>
              <div>Run ({Math.round(item.run_prob * 100)}%)</div>
            </div>
            <div>
              {item.plays.map((play) => (
                <div>
                  {capitalize(play.name)} ({Math.round(play.prob * 100)}%)
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div class="lt-run-time">
        <div>POST-ALIGNMENT</div>
        <div class="lt-run-time-header">
          <div>FORMATION</div>
          <select
            class="input-box wide-box"
            onChange={(opt) => changeFormation(opt.target.value)}
          >
            {["I Form", "Wing T"].map((item) => (
              <option value={item}>{item}</option>
            ))}
          </select>
        </div>
        {get_run()}
        <div class="wider">
          <button>RESET</button>
        </div>
      </div>
    </div>
  );
}
