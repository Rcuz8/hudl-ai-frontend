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
import {
  films_data as test_films_data,
  games as testgames,
  game_dict as test_games_dict,
} from "../../test/testdata";
const TEST_MODE = con.TEST_MODE;

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

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
    tf.layers.dense({ units: 20, inputShape: [11], activation: "relu" })
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
      inputShape: [11 + nforms],
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
      inputShape: [11 + nforms],
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

    console.log("Arrived at Film(s) Data:\n", films_data);
    films_data = pd.pandas_reformat(films_data, data_headers);
    df = new DataFrame(films_data);
    console.log("Arrived at DataFrame:\n", df.toString());
  }

  return df;
};

const get_game_info = async (id, db) => {
  var fetched_info;

  if (TEST_MODE) {
    fetched_info = {
      dictionary: test_games_dict,
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

const INIT_STATE = {
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
    hash: null,
  },
  df: null,
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
  const [currgame, setcurrgame] = useState(null);
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
  const [made_change, setchanged] = useState(true)

  const [state, setState] = useState(INIT_STATE);
  const [fetching_models, set_fetching_models] = useState(null);

  const [pre_align_results, setpar] = useState(null);

  useEffect(() => {
    if (TEST_MODE) {
      const run = async () => {
        const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
        setGames(testgames);
        // await selected_game(testgames[2]);
        // await generate_form_prediction();
        // await generate_play_prediction(sample(test_games_dict["OFF_FORM"]));
      };
      run();
    } else {
      con.games_get(uid).then((response) => {
        console.log("Retrieved games ", response["data"]);
        setGames(response["data"]);
      });
    }
  }, [setGames, uid]);

  const compile_input = (withForm = null) => {
    if (!state.dicts.hash) {
      alert("One moment..");
      return;
    }
    // One-hot encode categoricals (mdf = modified variable)
    let mdf_hash = keras.one_hot(
      state.dicts.hash.indexOf(hash) + 1,
      state.dicts.hash.length
    );
    let mdf_ppt = keras.one_hot(
      state.dicts.prev_play_type.indexOf(ppt) + 1,
      state.dicts.prev_play_type.length
    );
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
    // Should pass compliance assertion
    const inputShape = model.inputLayers.length > 0 ? 
      model.inputLayers[0].batchInputShape[1]
      : model.layers[0].batchInputShape[1];
    if (input.length !== inputShape) {
      console.log(model);
      let msg =
        'Model inputs != "Compiled Inputs". Provided ' +
        input.length +
        " Expected " +
        inputShape +
        "\n\nInput: " +
        input;
      throw new Error(msg);
    }
    // Generate raw predictions
    const raw_predictions = await model.predict(tf.tensor2d([input])).data();
    // Should pass compliance assertion
    if (dict.length !== raw_predictions.length)
      throw new Error(
        "Failed Compliance on model with dict: " +
          dict +
          " => Actual Pred. = " +
          raw_predictions.length +
          " items"
      );
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
          {
              Number.isNaN(form.run_prob) || form.run_prob >= 0.5 ? (
                <div class="lt-run-time-header">
                <div style={{fontWeight: 'bold', fontSize: '24px'}}>Run</div>
                <div style={{fontSize: '24px'}}>
                  {Number.isNaN(form.run_prob)
                    ? "NO DATA"
                    : Math.round(form.run_prob * 100)}
                  %
                </div>
                <div style={{fontWeight: 'bold', fontSize: '24px'}}>Pass</div>
                <div style={{fontSize: '24px'}}>
                  {Number.isNaN(form.run_prob)
                    ? "NO DATA"
                    : 100 - Math.round(form.run_prob * 100)}
                  %
                </div>
              </div>
            ) : (
              <div class="lt-run-time-header">
                <div style={{fontWeight: 'bold', fontSize: '18px'}}>Pass</div>
                <div>
                  {Number.isNaN(form.run_prob)
                    ? "NO DATA"
                    : 100 - Math.round(form.run_prob * 100)}
                  %
                </div>
                <div style={{fontWeight: 'bold', fontSize: '18px'}}>Run</div>
                <div>
                  {Number.isNaN(form.run_prob)
                    ? "NO DATA"
                    : Math.round(form.run_prob * 100)}
                  %
                </div>
              </div>
            )
          }
          
          <div class="wider" style={{fontSize: '16px', fontWeight: 'bold'}}>Top 3 Plays</div>
          {form.plays.map((play) => (
            <div class="lt-run-time-data">
              <div>{play.name ? capitalize(play.name) : "NO DATA"}</div>
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
    setchanged(false)
    if (!state.df) {
      alert("One moment..");
      return;
    }
    console.log("Gen Pred for Frame: ", state.df.toString());
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
    return null;
  };

  const generate_play_prediction = async (selected_formation) => {
    if (
      !(
        state.models.play_type &&
        state.models.off_form &&
        state.models.off_play
      )
    ) {
      alert("One moment..");
      return;
    }
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

  const selected_game = async (game) => {
    let game_id = game.id;
    setcurrgame(game);
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

      console.log("Dictionary: ", dict);

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

  const clear_all = () => {
    setcurrgame(null);
    setForm(null);
    setScoreThem(0);
    setScoreUs(0);
    setSide(false);
    set_fetching_models(false);
    setqtr(1);
    setydln(50);
    setHash("L");
    setPPT("Run");
    setState(INIT_STATE);
    setpar(null)
  };

  const changed = () => {
    setchanged(true)
  }

  const c_Games = games
    ? games.map((game) => (
        <div onClick={() => selected_game(game)}>{game.name}</div>
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
    <div class="predview">
      <div
        style={{
          marginTop: "200px",
          display: all_fetched || fetching_models ? "none" : "block",
        }}
      >
        <div style={{ width: "600px", margin: "auto" }}>
          <h3 style={{ textAlign: "left", fontWeight: "bold", margin: "10px" }}>
            Select Game.
          </h3>
          <div class="list-with-shadow-items">{c_Games}</div>
        </div>
      </div>
      {all_fetched ? (
        /*  Application View  */
        <div class="lt-grid-container">
          {/* Game Title */}
          <div class="lt-game-title">
            <h2>{currgame ? currgame.name : null}</h2>
            <p
              style={{ textDecoration: "underline" }}
              onClick={() => clear_all()}
              class='lt-pointer'
            >
              Change
            </p>
          </div>
          {/* Scoreboard */}
          <div class="lt-score_qtr lt-split">
            <div class="lt-score_qtr lt-split">
              <div>US</div>
              <div>THEM</div>
              <input
                class="input-box"
                name="score-us"
                onChange={(ev) => {changed(); setScoreUs(ev.target.value)}}
                type="number"
                value={scoreUs}
              />
              <input
                class="input-box"
                name="score-them"
                onChange={(ev) => {changed(); setScoreThem(ev.target.value)}}
                type="number"
                value={scoreThem}
              />
            </div>
            <div class="lt-score_qtr">
              <div>QTR</div>
              <select
                class="input-box"
                onChange={(ev) => {
                  changed(); 
                  if (!isNaN(ev.target.value)) 
                    setqtr(parseInt(ev.target.value))
                  }
                }
              >
                {[1, 2, 3, 4].map((item) => (
                  <option value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Core Grid */}
          {/* Section Headers */}
          <div>
            <h4>Pre-Alignment</h4>
            <div
              style={{
                margin: "5px 0px",
                height: "1.5px",
                backgroundColor: "white",
              }}
            ></div>
          </div>
          <div>
            <h4>Post-Alignment</h4>
            <div
              style={{
                margin: "5px 0px",
                height: "1.5px",
                backgroundColor: "white",
              }}
            ></div>
          </div>
          
          {/* SCENARIO */}

          {/* Scenario - Group Headers */}
          <div class="lt-scenerio-head">
            <div style={{ float: "left" }}>Scenario</div>
          </div>
          <div class="lt-scenerio-head">
            <div style={{ float: "left" }}>Scenario</div>
          </div>

          {/* Scenario - Pre-Align Group */}
          <div class="lt-scenario-container lt-scenario-platform">
            <div class="lt-scenario-content lt-scenario-content-multi">
              <div>
                <div>DN / DIST</div>
                <div class="lt-split">
                  <select
                    class="input-box"
                    onChange={(ev) => {
                      changed(); 
                      if (!isNaN(ev.target.value)) 
                        setdn(parseInt(ev.target.value))
                      }}
                  >
                    {[1, 2, 3, 4].map((item) => (
                      <option value={item}>{item} </option>
                    ))}
                  </select>
                  <input
                    class="input-box"
                    onChange={(ev) => {
                      changed(); 
                      if (!isNaN(ev.target.value)) 
                        setdist(parseInt(ev.target.value))
                      }}
                    value={dist}
                  />
                </div>
              </div>
              <div>
                <div>On the..</div>
                <div class="lt-split">
                  <input
                    class="input-box"
                    onChange={(ev) => {
                      changed(); 
                      if (!isNaN(ev.target.value)) 
                        setydln(parseInt(ev.target.value))
                      }}
                    value={ydln}
                  />
                  <button class="input-box" onClick={() => {changed(); setSide(!ourSide)}}>
                    {ourSide ? "Off." : "Def."}
                  </button>
                </div>
              </div>
              <div>
                <div>Hash</div>
                <select
                  class="input-box"
                  onChange={(ev) => {changed(); setHash(ev.target.value)}}
                >
                  {state.dicts.hash
                    ? state.dicts.hash.map((item) => (
                        <option value={item}>{item} </option>
                      ))
                    : null}
                </select>
              </div>
              <div>
                <div>Last Play</div>
                <select
                  class="input-box"
                  onChange={(ev) => {changed(); setPPT(ev.target.value)}}
                >
                  {state.dicts.prev_play_type
                    ? state.dicts.prev_play_type.map((item) => (
                        <option value={item}>{item} </option>
                      ))
                    : null}
                </select>
              </div>
              <div>
              <div>&#8203;</div>
                <div>
                <button
                class="stdbtn"
                onClick={() => generate_form_prediction()}
                disabled={!made_change}
                style={{ float: "right", fontSize: '18px' }}
              >
                Generate
              </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scenario - Post-Align Group */}
          <div
            class="lt-scenario-container lt-scenario-platform lt-scenario-content"
            style={{ justifyItems: "center" }}
          >
            <div>
              <div >Formation</div>
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
          </div>

          {/* RESULTS */}
          
          {/* Results - Group Headers */}
          <div class="lt-scenerio-head">
            <div style={{ float: "left" }}>Results</div>
          </div>
          <div class="lt-scenerio-head">
            <div style={{ float: "left" }}>Results</div>
          </div>

          {/* Results - Pre-Align Group */}
          <div class="lt-prediction lt-scenario-platform">
            <div class="lt-prediction-data">
              <div style={{fontWeight: 'bold', fontSize: '18px'}}>FORM</div>
              <div style={{fontWeight: 'bold', fontSize: '18px'}}>TYPE</div>
              <div style={{fontWeight: 'bold', fontSize: '18px'}}>PLAY</div>
            </div>
            <hr />
            {pre_align_results
              ? pre_align_results.map((item) => {
                
                const pass_component = (
                  <div>
                          Pass (
                          {Number.isNaN(item.run_prob)
                            ? "NO DATA"
                            : 100 - Math.round(item.run_prob * 100) + "%"}
                          )
                        </div>
                )
                const run_component = (
                  <div>
                          Run (
                          {Number.isNaN(item.run_prob)
                            ? "NO DATA"
                            : Math.round(item.run_prob * 100) + "%"}
                          )
                        </div>
                )

                var runpass_component = null;
                if (Number.isNaN(item.run_prob) || 
                item.run_prob >= 0.5) {
                  runpass_component = (
                    <div>
                      {run_component}
                      {pass_component}
                    </div>
                  )
                } else {
                  runpass_component = (
                    <div>
                      {pass_component}
                      {run_component}
                    </div>
                  )
                }
                
                return  (
                  <div>
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
                      {runpass_component}
                      <div>
                        {item.plays.map((play) => (
                          <div>
                            {play.name ? capitalize(play.name) : "NO DATA"} (
                            {Number.isNaN(play.prob)
                              ? "NO DATA"
                              : Math.round(play.prob * 100) + "%"}
                            )
                          </div>
                        ))}
                      </div>
                    </div>
                    <hr />
                  </div>
                )
              })
              : <p>Waiting on scenario selection..</p>}
          </div>

          <div class="lt-run-time lt-scenario-platform">
            {get_run()}
          </div> 
        </div>
      ) : fetching_models ? (
        <h2>Loading your info..</h2>
      ) : null}
    </div>
  );
}
