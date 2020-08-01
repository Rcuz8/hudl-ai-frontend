import React, { useState, useEffect } from "react";
import "./predict_screen.css";
import { ProgressBar } from "react-bootstrap";
import * as tf from "@tensorflow/tfjs";
import * as keras from "../../keras/utils";
import * as pd from "../../pandas/utils";
import { DataFrame } from "pandas-js";
import * as con from "../../helpers/constants";
import styles from "../../flow/styles/nga.module.css";
import { models } from "@tensorflow/tfjs";
import { films_data as test_films_data } from '../../test/testdata';
const TEST_MODE = false;

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

const after = (str, sub) => str.substring(str.indexOf(sub) + sub.length);
const before = (str, sub) => str.substring(0, str.indexOf(sub));

const loadhttp = (url, model_id, model_name) => {
  const delim = "%2F";

  return tf.io.http(url, {
    weightPathPrefix:
      before(url, "Models") +
      ["Models", model_id, model_name].join(delim) +
      delim,
  });
};

// Sample Formation info  -> Same format as SRIs (superset)
const FIs = SRIs;

const queries = [
  ["sampleid", "mymodel"],
  ["2ceaf5db41b740108cde15a6c6f36d33", "postalignplay"],
  ["id1243onjun29", "postalignplay"],
];

const fetch_model = async (storage, model_id, model_name) => {
  const model_url = async () =>
    await storage
      .ref(`Models/${model_id}/${model_name}/model.json`)
      .getDownloadURL();

  let mu = await model_url();
  let http = loadhttp(mu, model_id, model_name);
  let model = await tf.loadLayersModel(http);
  console.log("Loaded model.");
  return model;
};

const mock_form_model = (nforms) => {
  /*
    Output = Formation :    10 - 20 - 6
  */

  const model = tf.sequential();

  model.add(
    tf.layers.dense({ units: 20, inputShape: [10], activation: "relu" })
  );
  model.add(tf.layers.dense({ units: nforms, activation: "softmax" }));
  model.compile({ optimizer: "sgd", loss: "meanSquaredError" });
  return model;
};
const mock_pt_model = (nforms) => {
  /*
    Output = Formation :    14 - 20 - 6
  */

  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      units: 20,
      inputShape: [10 + nforms],
      activation: "relu",
    })
  );
  model.add(tf.layers.dense({ units: 2, activation: "softmax" }));
  model.compile({ optimizer: "sgd", loss: "meanSquaredError" });
  return model;
};
const mock_play_model = (nforms, nplays) => {
  /*
    Output = Formation :    14 - 20 - 6
  */

  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      units: 20,
      inputShape: [10 + nforms],
      activation: "relu",
    })
  );
  model.add(tf.layers.dense({ units: nplays, activation: "softmax" }));
  model.compile({ optimizer: "sgd", loss: "meanSquaredError" });
  return model;
};

const ttl_dst = (dist, onOurSide) => {
  /* Tests: 
  let tests_pass = [[1,true,99],[49,true,51],
            [50,false,50],[50,true,50],
            [1,false,1],[49,false,49]]
            .map((arr) => ttl_dst(arr[0],arr[1]) === arr[2]).every((val) => val)
  */
  return onOurSide ? 50 + (50 - dist) : dist;
};

const data_headers = [
  "PLAY #",
  "ODK",
  "DN",
  "DIST",
  "HASH",
  "YARD LN",
  "PLAY TYPE",
  "RESULT",
  "GN/LS",
  "OFF FORM",
  "OFF PLAY",
  "OFF STR",
  "PLAY DIR",
  "GAP",
  "PASS ZONE",
  "DEF FRONT",
  "COVERAGE",
  "BLITZ",
  "QTR",
];

const get_game_dataframe = async (id, db) => {
  console.log("Getting dataframe for ID=", id);
  var df;
  if (TEST_MODE) {
    var films_data = pd.pandas_reformat(keras.films_data, data_headers);
    df = new DataFrame(films_data);
  } else {
    var fetched_films = await db.collection("games_data").doc(id).get();
    fetched_films = fetched_films.data();
    var films_data = fb_data_to_matrix(fetched_films);
    
    console.log("Arrived at Film(s) Data:\n", films_data)
    films_data = pd.pandas_reformat(films_data, data_headers)
    df = new DataFrame(films_data);
    console.log("Arrived at DataFrame:\n", df.toString());
  }

  return df;
};

const get_game_info = async (id, db) => {
  var fetched_info;

  if (TEST_MODE) {
    fetched_info = {
      dictionary: {
        OFF_FORM: [
          "BIG",
          "TRIO",
          "TRIPS",
          "DAGGER",
          "TREY",
          "DUCK",
          "DEUCE",
          "EMPTY",
          "DOUBLES",
          "TRUCK",
          "BELL",
          "BANG",
          "BOX",
          "DUDE",
          "TRAP",
          "EXTRA",
          "DAB",
          "TRASH",
          "DUO",
          "ROLL",
        ],
        OFF_PLAY: [
          "NY",
          "GREEN BAY",
          "WASHINGTON",
          "HOUSTON",
          "NASA",
          "ATLANTA",
          "AKRON",
          "JOKER",
          "DENVER",
          "LACES",
          "DETROIT",
          "MINNESOTA",
          "NEW ENGLAND",
          "KC",
        ],
        PLAY_TYPE: ["run", "pass"],
      },
      created: "today",
    };
  } else {
    fetched_info = await db.collection("games_info").doc(id).get();
    fetched_info = fetched_info.data();
    console.log(fetched_info);
  }

  return fetched_info;
};

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
const fb_data_to_matrix = (fb_data, concat = true) => {
  console.log("Recieved Firestore data: \n", fb_data);

  const data = fb_data["data"].map((film) => {
    return film["data"].map((row) => row["0"]);
  });

  if (concat) return [].concat.apply([], data);
  else return data;
};

export default function Predict_screen(props) {
  var game_id,
    uid = props.user.uid;

  if (TEST_MODE) {
    game_id = "2ceaf5db41b740108cde15a6c6f36d33";
  } else {
    //...
  }

  const [games, setGames] = useState(null);

  const [form, setForm] = useState(null);
  const [scoreUs, setScoreUs] = useState(0);
  const [scoreThem, setScoreThem] = useState(0);
  const [dn, setdn] = useState(1);
  const [ydln, setydln] = useState(50);
  const [dist, setdist] = useState(10);
  const [qtr, setqtr] = useState(1);
  const [hash, setHash] = useState("L");
  const [ppt, setPPT] = useState("Run");
  const [ourSide, setSide] = useState(false); // Ball in Offense's own territory

  const [state, setState] = useState({
    models: {
      off_form: null,
      play_type: null,
      off_play: null,
    },
    dicts: {
      off_form: null,
      play_type: null,
      off_play: null,
      prev_play_type: null,
      hash: null
    },
    df: null,
  });
  const [fetching_models, set_fetching_models] = useState(null);

  const [pre_align_results, setpar] = useState(null);

  useEffect(() => {
    con.games_get(uid).then((response) => {
      console.log("Retrieved games ", response["data"]);
      setGames(response["data"]);
    });
  }, [setGames, uid]);

  const compile_input = (withForm = null) => {
    // One-hot encode categoricals (mdf = modified variable)
    let mdf_hash = keras.one_hot(state.dicts.hash.indexOf(hash) + 1, state.dicts.hash.length);
    let mdf_ppt = keras.one_hot(state.dicts.prev_play_type.indexOf(ppt) + 1, state.dicts.prev_play_type.length);
    let mdf_form = !withForm
      ? null
      : keras.one_hot(
          state.dicts.off_form.indexOf(withForm) + 1,
          state.dicts.off_form.length
        );
    let d2e = ttl_dst(ydln, ourSide);
    let scorediff = scoreUs - scoreThem;
    console.log("Compiling configuration.");
    console.log(
      "Down: ",
      dn,
      "\n",
      "Dist: ",
      dist,
      "\n",
      "D2E : ",
      d2e,
      "\n",
      "Hash: ",
      mdf_hash,
      "\n",
      "PPT : ",
      mdf_ppt,
      "\n",
      "QTR : ",
      qtr,
      "\n",
      "ScDf: ",
      scorediff,
      "\n",
      "Form: ",
      mdf_form,
      "\n"
    );

    const args = !withForm
      ? keras.compileargs(dn, dist, d2e, mdf_hash, mdf_ppt, qtr, scorediff)
      : keras.compileargs(
          dn,
          dist,
          d2e,
          mdf_hash,
          mdf_ppt,
          qtr,
          scorediff,
          mdf_form
        );
    return args;
  };

  const get_predictions = async (model, dict, withForm = null) => {
    // Compile input
    const input = compile_input(withForm);
    // Generate raw predictions
    const raw_predictions = await model.predict(tf.tensor2d([input])).data();
    // Should pass compliance assertion
    if (dict.length !== raw_predictions.length)
      throw new Error("Failed Compliance on model with dict: " + dict + 
      ' => Actual Pred. = ' + raw_predictions.length + ' items');
    // Map names to predictions
    const mapped_predictions = dict.map((el, i) => ({
      name: el,
      prob: raw_predictions[i],
    }));
    return mapped_predictions;
  };

  const get_run = () => {
    if (form == null) return <div> Waiting on formation selection.. </div>;
    else
      return (
        <div>
          {/* Results */}
          <div class="lt-run-time-header">
            <div>RUN</div>
            <div>
              {Number.isNaN(form.run_prob)
                ? "NO DATA"
                : Math.round(form.run_prob * 100)}
              %
            </div>
            <div>PASS</div>
            <div>
              {Number.isNaN(form.run_prob)
                ? "NO DATA"
                : 100 - Math.round(form.run_prob * 100)}
              %
            </div>
          </div>
          <div class="wider">Top 3 Plays</div>
          {form.plays.map((play) => (
            <div class="lt-run-time-data">
              <div>{play.name ? capitalize(play.name) : 'NO DATA'}</div>
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
    generate_play_prediction(toName);
    // setForm(FIs.filter((form) => form.name === toName)[0]);
  };

  const generate_form_prediction = async () => {
    console.log('Gen Pred for Frame: ', state.df.toString())
    // Get Predictions
    const predictions = await get_predictions(
      state.models.off_form,
      state.dicts.off_form
    );
    // Sort (& Truncate)
    var top_predictions = predictions
      .sort((a, b) => (a.prob > b.prob ? -1 : a.prob === b.prob ? 0 : 1))
      .slice(0, 3);
    // Format
    const prediction_info = top_predictions.map((form) => {
      return {
        name: form.name,
        prob: form.prob,
        run_prob: pd.form_run_pct(state.df, form.name),
        plays: pd
          .commonest_form_plays(state.df, form.name)
          .map((play) => ({ name: play[0], prob: play[1] })),
      };
    });

    console.log("Prediction info:", prediction_info);

    setpar(prediction_info);
  };

  const generate_play_prediction = async (selected_formation) => {
    // Get Predictions
    const pt_predictions = await get_predictions(
      state.models.play_type,
      state.dicts.play_type,
      selected_formation
    );
    const play_predictions = await get_predictions(
      state.models.off_play,
      state.dicts.off_play,
      selected_formation
    );
    var top_play_predictions = play_predictions
      .sort((a, b) => (a.prob > b.prob ? -1 : a.prob === b.prob ? 0 : 1))
      .slice(0, 3);

    const run_prob = pt_predictions.filter(
      (item) => item.name.toLowerCase() === "run"
    )[0].prob;

    // Format
    const prediction_info = {
      run_prob: run_prob || "NO DATA",
      plays: top_play_predictions,
    };

    console.log("Prediction info:", prediction_info);

    setForm(prediction_info);
  };

  const selected_game = async (game_id) => {
    set_fetching_models(true);
    try {
      // Load DataFrame
      const frame = await get_game_dataframe(game_id, props.firebase.db);

      // Load Dictionaries / Scalers
      const info = await get_game_info(game_id, props.firebase.db);
      const dict = info["dictionary"];
      const dicts = {
        off_form: dict["OFF_FORM"],
        play_type: dict["PLAY_TYPE"],
        off_play: dict["OFF_PLAY"],
        prev_play_type: dict["PREV_PLAY_TYPE"],
        hash: dict["HASH"],
        
      };

      console.log('Dictionaries: ' + dicts)

      var paf, pat, pap;
      if (!TEST_MODE) {
        // Load Models (must be done later if not in test)
        paf = await fetch_model(
          props.firebase.storage,
          game_id,
          "prealignform"
        );
        pat = await fetch_model(props.firebase.storage, game_id, "postalignpt");
        pap = await fetch_model(
          props.firebase.storage,
          game_id,
          "postalignplay"
        );
      } else {
        const forms = dict["OFF_FORM"].length;
        const plays = dict["OFF_PLAY"].length;
        paf = mock_form_model(forms);
        pat = mock_pt_model(forms);
        pap = mock_play_model(forms, plays);
      }

      const models = {
        off_form: paf,
        play_type: pat,
        off_play: pap,
      };

      setState({ models: models, dicts: dicts, df: frame });
    } catch (e) {
      set_fetching_models(false);
    }
  };

  const c_Games = games
    ? games.map((game, index) => (
        <tr onClick={() => selected_game(game.id)}>
          <td class="json">{game.name}</td>
        </tr>
      ))
    : null;

  const all_fetched =
    state.models.off_form &&
    state.models.play_type &&
    state.models.off_play &&
    state.df &&
    state.dicts.off_form &&
    state.dicts.off_play &&
    state.dicts.play_type;

  if (all_fetched && fetching_models) set_fetching_models(false);

  return (
    <div>
      <table class={styles.itemlist}>
        <thead>
          <tr>
            <th>Game</th>
          </tr>
        </thead>
        <tbody>{c_Games}</tbody>
      </table>
      <hr />
      {all_fetched ? (
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
            <select
              class="input-box"
              onChange={(ev) => setqtr(parseInt(ev.target.value))}
            >
              {[1, 2, 3, 4].map((item) => (
                <option value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div class="lt-scenario">
            <div>DOWN</div>
            <select
              class="input-box"
              onChange={(ev) => setdn(parseInt(ev.target.value))}
            >
              {[1, 2, 3, 4].map((item) => (
                <option value={item}>{item} </option>
              ))}
            </select>
            <div>DISTANCE</div>
            <input
              class="input-box"
              onChange={(ev) => setdist(parseInt(ev.target.value))}
            />
            <div>YD LN</div>
            <div>
              <input
                class="input-box"
                onChange={(ev) => setydln(parseInt(ev.target.value))}
              />
              <label for="onOurs">Off. Terr?</label>
              <input
                type="checkbox"
                name="onOurs"
                onChange={(ev) => setSide(ev.target.value)}
              />
              {/* <div style={{display: 'grid', gridAutoColumns: 'repeat(2, 1fr)'}}>
        <input class="input-box" onChange={(ev) => setydln(ev.target.value)} />
        <div>
          <label for='onOurs'>Off. Terr?</label>
          <input type='checkbox' name='onOurs' onChange={(ev) => setydln(ev.target.value)} />
        </div> */}
            </div>

            <div>HASH</div>
            <select
              class="input-box"
              onChange={(ev) => setHash(ev.target.value)}
            >
              {state.dicts.hash ? state.dicts.hash.map((item) => (
                <option value={item}>{item} </option>
              )) :  null}
            </select>
            <div>LAST PLAY</div>
            <select
              class="input-box"
              onChange={(ev) => setPPT(ev.target.value)}
            >
              {state.dicts.prev_play_type ? state.dicts.prev_play_type.map((item) => (
                <option value={item}>{item} </option>
              )) : null}
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
            {pre_align_results
              ? pre_align_results.map((item) => (
                  <div class="lt-prediction-data">
                    <div>
                      <div>
                        {item.name} (
                        {Number.isNaN(item.prob)
                          ? "NO DATA"
                          : Math.round(item.prob * 100) + "%"}
                        )
                      </div>
                    </div>
                    <div>
                      <div>
                        Pass (
                        {Number.isNaN(item.run_prob)
                          ? "NO DATA"
                          : 100 - Math.round(item.run_prob * 100) + "%"}
                        )
                      </div>
                      <div>
                        Run (
                        {Number.isNaN(item.run_prob)
                          ? "NO DATA"
                          : Math.round(item.run_prob * 100) + "%"}
                        )
                      </div>
                    </div>
                    <div>
                      {item.plays.map((play) => (
                        <div>
                          {play.name ? capitalize(play.name) : 'NO DATA'} (
                          {Number.isNaN(play.prob) 
                            ? "NO DATA"
                            : Math.round(play.prob * 100) + "%"}
                          )
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              : null}
          </div>
          <div class="lt-run-time">
            <div>POST-ALIGNMENT</div>
            <div class="lt-run-time-header">
              <div>FORMATION</div>
              <select
                class="input-box wide-box"
                onChange={(opt) => changeFormation(opt.target.value)}
              >
                {state.dicts.off_form
                  ? state.dicts.off_form.map((item) => (
                      <option value={item}>{item}</option>
                    ))
                  : null}
              </select>
            </div>
            {get_run()}
            <div class="wider">
              <button>RESET</button>
            </div>
          </div>
        </div>
      ) : fetching_models ? (
        <h2>Loading your info..</h2>
      ) : null}
    </div>
  );
}
