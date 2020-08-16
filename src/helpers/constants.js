import React from "react";
import io from "socket.io-client";

const LOCAL_NODE_SERVER = "localhost:9797";
const LOCAL_PY_SERVER = "http://127.0.0.1:8080"; // NOTE: SSL IN PROD MEANS HTTP -> HTTPS

export const TEST_MODE = false;
export const TEST_MODE_ISADMIN = false;

export const CompanyName = "The Company";

export const TKN_1 = ",";
export const TKN_2 = "\n";
export const TKN_3 = "###";

const LOCAL_URLs = {
  NODE_LOGIN: LOCAL_NODE_SERVER + "/login",
  NODE_FILMDATA: LOCAL_NODE_SERVER + "/filmdata",
  NODE_VIDOPTIONS: LOCAL_NODE_SERVER + "/videooptions",
  NODE_MULTIDATA: LOCAL_NODE_SERVER + "/multidata",
  PY_USERINFO: "svr_user_info",
  PY_NEW_CLIENT: "svr_new_client",
  PY_CLIENTS: "svr_clients",
  PY_GAMES: "svr_games",
  PY_NEW_QUALITY_ANALYSIS: "svr_perform_qa",
  PY_NEW_MODEL: "svr_gen_model",
  PY_NEW_MODEL: "svr_gen_model",
};

export const PY_SERVER = LOCAL_PY_SERVER;

export const URLs = LOCAL_URLs;

export const ROUTES = {
  LANDING: "/",
  SIGN_UP: "/signup",
  SIGN_IN: "/signin",
  HOME: "/home",
  ACCOUNT: "/account",
  DATA_QUALITY: "/mydata",
  NEW_GAME_ANALYSIS: "/nga",
  NEW_CLIENT: "/nc",
  NEW_MODEL: "/nm",
  PREDICT: "/predict",
};

export async function socket_get(path, ...args) {
  return new Promise((res, rej) => {
    const socket = io(PY_SERVER, {
      reconnectionAttempts: 3,
    });
    socket.on("connect", () => {
      socket.emit(path, ...args);
    });
    socket.on("reply", (reply) => {
      res(reply);
      socket.close();
    });
    socket.on("exception", (reply) => {
      rej(reply);
      socket.close();
    });
  });
}

export async function socket_setup(path, response_title, callback_fn, ...args) {
  const socket = io(PY_SERVER, {
    reconnectionAttempts: 3,
  });
  var hasSentConnection = false;
  socket.on("connect", () => {
    if (!hasSentConnection) {
      console.log("Socket emitting request.");
      socket.emit(path, ...args);
      hasSentConnection = true
    }
  });
  console.log("Setting up socket for ", response_title);
  socket.on(response_title, (reply) => {
    console.log("Got callback.");
    callback_fn(reply, socket);
  });
  socket.on("exception", (reply) => {
    console.error(reply);
    socket.close();
  });
}

export async function socket_listen(response_title, callback_fn) {
  return new Promise((res, rej) => {
    const socket = io(PY_SERVER, {
      reconnectionAttempts: 3,
    });
    socket.on("connect", () => {
      console.log("socket conn..");
    });
    console.log("Setting up socket for ", response_title);
    socket.on(response_title, (reply) => {
      console.log("Got callback.");
      callback_fn(reply, socket);
    });
    socket.on("exception", (reply) => {
      console.error(reply);
      socket.close();
    });
  });
}

export async function games_get(...args) {
  return new Promise((res, rej) => {
    const socket = io(PY_SERVER);
    socket.on("connect", () => {
      socket.emit(URLs.PY_GAMES, ...args);
    });
    socket.on("games", (reply) => {
      res(reply);
      socket.close();
    });
    socket.on("exception", (reply) => {
      rej(reply);
      socket.close();
    });
  });
}

export const socketListener = (callback) => io(PY_SERVER).on("reply", callback);
