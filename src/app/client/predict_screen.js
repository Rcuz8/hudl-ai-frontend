import * as tf from "@tensorflow/tfjs";
import { DataFrame } from "pandas-js";
import React, { useEffect, useState } from "react";
import { ProgressBar } from "react-bootstrap";
import * as con from "../../helpers/constants";
import * as keras from "../../keras/utils";
import * as pd from "../../pandas/utils";
import {
  games as testgames,
  game_dict as test_games_dict,
} from "../../test/testdata";
import "./predict_screen.css";

/* Predict Play Screen */

/* MARK - constants */

// Project info: Determine if build is in Test mode
const TEST_MODE = con.TEST_MODE;

/* MARK - helpers */

/**
 * @param {String} s string
 * @returns the capitalized string
 */
const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * @param {String} str the string
 * @param {String} sub the substring
 * @returns the string's contents before the substring
 */
const before = (str, sub) => str.substring(0, str.indexOf(sub));

/**
 * Load the Tensorflow model HTTP reference
 * @param {String} url
 * @param {String} model_id
 * @param {String} model_name
 * @returns the loaded reference
 */
const loadhttp = (url, model_id, model_name) => {
  // The tensorflow delimiter between directory levels
  const delim = "%2F";
  // Load the tf HTTP reference.
  // URL format: .../Models%2F[ID]%2F[NAME]%2F
  return tf.io.http(url, {
    weightPathPrefix:
      before(url, "Models") +
      ["Models", model_id, model_name].join(delim) +
      delim,
  });
};

/**
 * Fetch the Tf model from firebase storage.
 * @param {FirebaseReference} storage
 * @param {String} model_id
 * @param {String} model_name
 * @returns the Tf model
 */
const fetch_model = async (storage, model_id, model_name) => {
  // Function to fetch download URL
  const model_url = async () =>
    await storage
      .ref(`Models/${model_id}/${model_name}/model.json`)
      .getDownloadURL();

  // Get model URL
  let mu = await model_url();
  // Load the Tf HTTP reference
  let http = loadhttp(mu, model_id, model_name);
  // Load the Tf model
  let model = await tf.loadLayersModel(http);
  return model;
};

/**
 * @param {int} dist the distance to endzone
 * @param {bool} onOurSide whether we are on our side of field
 * @returns total distance to endzone
 */
const ttl_dst = (dist, onOurSide) => {
  return onOurSide ? 50 + (50 - dist) : dist;
};

/**
 * Get the game data.
 * @param {String} id the game id
 * @param {FirestoreReference} db firestore reference
 * @returns {DataFrame} the game data
 */
const get_game_dataframe = async (id, db) => {
  console.log("Getting dataframe for ID=", id);
  // If the app is in test mode, create the df from dummy data
  if (TEST_MODE) {
    const films_data = pd.pandas_reformat(keras.films_data, con.DATA_HEADERS);
    return new DataFrame(films_data);
  }
  // Get the game data from firestore
  var fetched_films = await db.collection("games_data").doc(id).get();
  // extract the data
  fetched_films = fetched_films.data();
  // convert the firebase data into a 2D matrix
  var films_data = fb_data_to_matrix(fetched_films);
  console.log("Arrived at Film(s) Data:\n", films_data);
  // organize the matrix into a pandas df (given pre-determined headers)
  films_data = pd.pandas_reformat(films_data, con.DATA_HEADERS);
  const df = new DataFrame(films_data);
  console.log("Arrived at Film DataFrame:\n", df.toString());
  return df;
};

/**
 * Fetch a game's info from Firestore.
 * @param {String} id the game id
 * @param {FirestoreReference} db the database ref
 * @returns {JSON} the game info
 */
const get_game_info = async (id, db) => {
  // If app is in test mode, return dummy data
  if (TEST_MODE)
    return {
      dictionary: test_games_dict,
      created: "today",
    };
  // fetch game info from firestore
  var fetched_info = await db.collection("games_info").doc(id).get();
  // extract data
  fetched_info = fetched_info.data();
  return fetched_info;
};

/**
 * Convert firebase-formatted data into a std 2D Matrix format
 * 
 * Expecting format:

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

 * @param {JSON} fb_data the firebase data
 * @param {bool} concat whether to flatten the data
 * @returns the matrix of data
 */
const fb_data_to_matrix = (fb_data, concat = true) => {
  console.log("Recieved Firestore data: \n", fb_data);

  // Convert the data
  const data = fb_data["data"].map((film) => {
    return film["data"].map((row) => row["0"]);
  });
  // Recursively simplify the data via concatenation, if necessary
  if (concat) return [].concat.apply([], data);
  else return data;
};

// Define basis state for UI
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

  // Setup screen variables
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
  const [made_change, setchanged] = useState(true);

  const [state, setState] = useState(INIT_STATE);
  // progress on fetching the Tf models
  const [fetching_models, set_fetching_models] = useState(null);
  // ptr-alignment results
  const [pre_align_results, setpar] = useState(null);

  // Get initial data: User's Games
  useEffect(() => {
    // If app is in test mode, retrieve dummy games
    if (TEST_MODE) {
      setGames(testgames);
      return;
    }
    // Get all games for the user
    con.games_get(uid).then((response) => {
      setGames(response["data"]);
    });
  }, [setGames, uid]);

  /**
   * Prepare the user selection to be put into
   * a Tf model
   * @param {bool} withForm whether the formation should be included in the compiled result.
   * @returns the compiled input (flattened, scaled, etc)
   */
  const compile_input = (withForm = null) => {
    // Ensure all data is present. Checking HASH.
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

    /* Grab & Scale the numeric fields */

    let d2e = ttl_dst(ydln, ourSide) /* Then scale the input */ / 100; // 25 seems about the max
    let scorediff = (scoreUs - scoreThem) /* Then scale the input */ / 35;
    let dn_scaled = dn / 4;
    let dst_scaled = dist / 25;
    let qtr_scaled = qtr / 4;

    // These inputs must now go into a neural network.
    // Compile them into a 1-D Array.
    const args = !withForm
      ? keras.compileargs(
          dn_scaled,
          dst_scaled,
          d2e,
          mdf_hash,
          mdf_ppt,
          qtr_scaled,
          scorediff
        )
      : keras.compileargs(
          dn_scaled,
          dst_scaled,
          d2e,
          mdf_hash,
          mdf_ppt,
          qtr_scaled,
          scorediff,
          mdf_form
        );
    return args;
  };

  /**
   * Get the model predictions.
   * @param {Model} model the Tf model
   * @param {Array} dict the potential predicted outputs
   * @param {bool} withForm whether the formation should be included as an input
   * @returns the model predictions.
   */
  const get_predictions = async (model, dict, withForm = null) => {
    // Compile input
    const input = compile_input(withForm);
    // Should pass compliance assertion (catches input compile issue)
    const inputShape =
      model.inputLayers.length > 0
        ? model.inputLayers[0].batchInputShape[1]
        : model.layers[0].batchInputShape[1];
    if (input.length !== inputShape) {
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

  /**
   * @returns the component for Run/Pass prediction
   */
  const get_run = () => {
    if (form == null) return <div> Waiting on formation selection.. </div>;
    else
      return (
        <div>
          {/* Results */}
          {Number.isNaN(form.run_prob) || form.run_prob >= 0.5 ? (
            <div class="lt-run-time-header">
              <div style={{ fontWeight: "bold", fontSize: "24px" }}>Run</div>
              <div style={{ fontSize: "24px" }}>
                {Number.isNaN(form.run_prob)
                  ? "NO DATA"
                  : Math.round(form.run_prob * 100)}
                %
              </div>
              <div style={{ fontWeight: "bold", fontSize: "24px" }}>Pass</div>
              <div style={{ fontSize: "24px" }}>
                {Number.isNaN(form.run_prob)
                  ? "NO DATA"
                  : 100 - Math.round(form.run_prob * 100)}
                %
              </div>
            </div>
          ) : (
            <div class="lt-run-time-header">
              <div style={{ fontWeight: "bold", fontSize: "18px" }}>Pass</div>
              <div>
                {Number.isNaN(form.run_prob)
                  ? "NO DATA"
                  : 100 - Math.round(form.run_prob * 100)}
                %
              </div>
              <div style={{ fontWeight: "bold", fontSize: "18px" }}>Run</div>
              <div>
                {Number.isNaN(form.run_prob)
                  ? "NO DATA"
                  : Math.round(form.run_prob * 100)}
                %
              </div>
            </div>
          )}

          <div class="wider" style={{ fontSize: "16px", fontWeight: "bold" }}>
            Top 3 Plays
          </div>
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

  /**
   * Change the formation (and generate predictions)
   * @param {String} toName the formation name
   */
  const changeFormation = (toName) => {
    generate_play_prediction(toName);
  };

  /**
   * Generate the formation prediction
   */
  const generate_form_prediction = async () => {
    // Set loading..
    setchanged(false);
    // If we have no dataframe, still loading data. Exit.
    if (!state.df) {
      alert("One moment..");
      return;
    }
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

    // Set the prediction info
    setpar(prediction_info);
  };

  /**
   * Generate the play prediction
   * @param {String} selected_formation
   */
  const generate_play_prediction = async (selected_formation) => {
    // Verify the models have all loaded. If not, exit.
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
    // Get Predictions for Play Type
    const pt_predictions = await get_predictions(
      state.models.play_type,
      state.dicts.play_type,
      selected_formation
    );
    // Get Predictions for Offensive Play
    const play_predictions = await get_predictions(
      state.models.off_play,
      state.dicts.off_play,
      selected_formation
    );
    // Get 3 most likely plays.
    var top_play_predictions = play_predictions
      .sort((a, b) => (a.prob > b.prob ? -1 : a.prob === b.prob ? 0 : 1))
      .slice(0, 3);

    // Get probability of run.
    const run_prob = pt_predictions.filter(
      (item) => item.name.toLowerCase() === "run"
    )[0].prob;

    // Format
    const prediction_info = {
      run_prob: run_prob || "NO DATA",
      plays: top_play_predictions,
    };

    // Set Play prediction info
    setForm(prediction_info);
  };

  /**
   *
   * @param {Object} game the db-loaded Game object
   */
  const selected_game = async (game) => {
    // Get the game ID
    let game_id = game.id;
    // Set the game as the current game
    setcurrgame(game);
    // Set the UI to loading
    set_fetching_models(true);
    try {
      // Load DataFrame
      const frame = await get_game_dataframe(game_id, props.firebase.db);

      // Load Dictionaries / Scalers
      const info = await get_game_info(game_id, props.firebase.db);

      // load data from db response
      const dict = info["dictionary"];
      const dicts = {
        off_form: dict["OFF_FORM"],
        play_type: dict["PLAY_TYPE"],
        off_play: dict["OFF_PLAY"],
        prev_play_type: dict["PREV_PLAY_TYPE"],
        hash: dict["HASH"],
      };

      // Load the models (Pre-Align Formation, Post-Align Play Type, Post-Align Play)
      var paf, pat, pap;
      // If app is NOT in test mode, pull live data.
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
        // load mock Tf models
        const forms = dict["OFF_FORM"].length;
        const plays = dict["OFF_PLAY"].length;
        paf = keras.mock_form_model(forms);
        pat = keras.mock_pt_model(forms);
        pap = keras.mock_play_model(forms, plays);
      }

      const models = {
        off_form: paf,
        play_type: pat,
        off_play: pap,
      };

      // Update the view state
      setState({ models: models, dicts: dicts, df: frame });
    } catch (e) {
      // If errored, set view as no longer fetching.
      set_fetching_models(false);
    }
  };

  // Reset UI to initial state.
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
    setpar(null);
  };

  /** Set the UI as having changed. */
  const changed = () => {
    setchanged(true);
  };

  // Display the user's games they can pick from.
  const c_Games = games
    ? games.map((game) => (
        <div onClick={() => selected_game(game)}>{game.name}</div>
      ))
    : null;

  // Determine if all backend data & models have been loaded.
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
              class="lt-pointer"
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
                onChange={(ev) => {
                  changed();
                  setScoreUs(ev.target.value);
                }}
                type="number"
                value={scoreUs}
              />
              <input
                class="input-box"
                name="score-them"
                onChange={(ev) => {
                  changed();
                  setScoreThem(ev.target.value);
                }}
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
                    setqtr(parseInt(ev.target.value));
                }}
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
                        setdn(parseInt(ev.target.value));
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
                        setdist(parseInt(ev.target.value));
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
                        setydln(parseInt(ev.target.value));
                    }}
                    value={ydln}
                  />
                  <button
                    class="input-box"
                    onClick={() => {
                      changed();
                      setSide(!ourSide);
                    }}
                  >
                    {ourSide ? "Off." : "Def."}
                  </button>
                </div>
              </div>
              <div>
                <div>Hash</div>
                <select
                  class="input-box"
                  onChange={(ev) => {
                    changed();
                    setHash(ev.target.value);
                  }}
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
                  onChange={(ev) => {
                    changed();
                    setPPT(ev.target.value);
                  }}
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
                    style={{ float: "right", fontSize: "18px" }}
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
              <div>Formation</div>
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
              <div style={{ fontWeight: "bold", fontSize: "18px" }}>FORM</div>
              <div style={{ fontWeight: "bold", fontSize: "18px" }}>TYPE</div>
              <div style={{ fontWeight: "bold", fontSize: "18px" }}>PLAY</div>
            </div>
            <hr />
            {pre_align_results ? (
              pre_align_results.map((item) => {
                const pass_component = (
                  <div>
                    Pass (
                    {Number.isNaN(item.run_prob)
                      ? "NO DATA"
                      : 100 - Math.round(item.run_prob * 100) + "%"}
                    )
                  </div>
                );
                const run_component = (
                  <div>
                    Run (
                    {Number.isNaN(item.run_prob)
                      ? "NO DATA"
                      : Math.round(item.run_prob * 100) + "%"}
                    )
                  </div>
                );

                var runpass_component = null;
                if (Number.isNaN(item.run_prob) || item.run_prob >= 0.5) {
                  runpass_component = (
                    <div>
                      {run_component}
                      {pass_component}
                    </div>
                  );
                } else {
                  runpass_component = (
                    <div>
                      {pass_component}
                      {run_component}
                    </div>
                  );
                }

                return (
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
                );
              })
            ) : (
              <p>Waiting on scenario selection..</p>
            )}
          </div>

          <div class="lt-run-time lt-scenario-platform">{get_run()}</div>
        </div>
      ) : fetching_models ? (
        <h2>Loading your info..</h2>
      ) : null}
    </div>
  );
}
