import io from 'socket.io-client'

const LOCAL_NODE_SERVER = process.env.LOCAL_NODE_SERVER
const LOCAL_PY_SERVER = process.env.LOCAL_PY_SERVER // NOTE: SSL IN PROD MEANS HTTP -> HTTPS

const PROD_PY_SERVER = process.env.PROD_PY_SERVER
const PROD_NODE_SERVER = process.env.PROD_NODE_SERVER

export const TEST_MODE = process.env.TEST_MODE
export const TEST_MODE_ISADMIN = process.env.TEST_MODE_ISADMIN

// HUDL Credentials
export const EMAIL_CREDENTIAL = process.env.EMAIL_CREDENTIAL
export const PASS_CREDENTIAL = process.env.PASS_CREDENTIAL

export const CompanyName = 'Play by Plai'

export const TKN_1 = ','
export const TKN_2 = '\n'
export const TKN_3 = '###'

const LOCAL_URLs = {
  NODE_LOGIN: LOCAL_NODE_SERVER + '/login',
  NODE_FILMDATA: LOCAL_NODE_SERVER + '/filmdata',
  NODE_VIDOPTIONS: LOCAL_NODE_SERVER + '/videooptions',
  NODE_MULTIDATA: LOCAL_NODE_SERVER + '/multidata',
  PY_USERINFO: 'svr_user_info',
  PY_NEW_CLIENT: 'svr_new_client',
  PY_CLIENTS: 'svr_clients',
  PY_GAMES: 'svr_games',
  PY_NEW_QUALITY_ANALYSIS: 'svr_perform_qa',
  PY_NEW_MODEL: 'svr_gen_model',
}

const PROD_URLs = {
  NODE_LOGIN: PROD_NODE_SERVER + '/login',
  NODE_FILMDATA: PROD_NODE_SERVER + '/filmdata',
  NODE_VIDOPTIONS: PROD_NODE_SERVER + '/videooptions',
  NODE_MULTIDATA: PROD_NODE_SERVER + '/multidata',
  PY_USERINFO: 'svr_user_info',
  PY_NEW_CLIENT: 'svr_new_client',
  PY_CLIENTS: 'svr_clients',
  PY_GAMES: 'svr_games',
  PY_NEW_QUALITY_ANALYSIS: 'svr_perform_qa',
  PY_NEW_MODEL: 'svr_gen_model',
}

export const PY_SERVER = TEST_MODE ? LOCAL_PY_SERVER : PROD_PY_SERVER

export const URLs = TEST_MODE ? LOCAL_URLs : PROD_URLs

export const ROUTES = {
  LANDING: '/',
  SIGN_UP: '/signup',
  SIGN_IN: '/signin',
  HOME: '/home',
  ACCOUNT: '/account',
  DATA_QUALITY: '/mydata',
  NEW_GAME_ANALYSIS: '/nga',
  NEW_CLIENT: '/nc',
  NEW_MODEL: '/nm',
  PREDICT: '/predict',
}

export async function socket_get(path, ...args) {
  return new Promise((res, rej) => {
    const socket = io(PY_SERVER, {
      reconnectionAttempts: 3,
    })
    socket.on('connect', () => {
      socket.emit(path, ...args)
    })
    socket.on('reply', (reply) => {
      res(reply)
      socket.close()
    })
    socket.on('exception', (reply) => {
      rej(reply)
      socket.close()
    })
  })
}

export async function socket_setup(path, response_title, callback_fn, ...args) {
  const socket = io(PY_SERVER, {
    reconnectionAttempts: 3,
  })
  var hasSentConnection = false
  socket.on('connect', () => {
    if (!hasSentConnection) {
      console.log('Socket emitting request.')
      socket.emit(path, ...args)
      hasSentConnection = true
    }
  })
  console.log('Setting up socket for ', response_title)
  socket.on(response_title, (reply) => {
    console.log('Got callback.')
    callback_fn(reply, socket)
  })
  socket.on('exception', (reply) => {
    console.error(reply)
    socket.close()
  })
}

export async function socket_listen(response_title, callback_fn) {
  return new Promise((res, rej) => {
    const socket = io(PY_SERVER, {
      reconnectionAttempts: 3,
    })
    socket.on('connect', () => {
      console.log('socket conn..')
    })
    console.log('Setting up socket for ', response_title)
    socket.on(response_title, (reply) => {
      console.log('Got callback.')
      callback_fn(reply, socket)
    })
    socket.on('exception', (reply) => {
      console.error(reply)
      socket.close()
    })
  })
}

export async function games_get(...args) {
  return new Promise((res, rej) => {
    const socket = io(PY_SERVER, {
      reconnectionAttempts: 3,
    })

    socket.on('connect', () => {
      socket.emit(URLs.PY_GAMES, ...args)
    })
    socket.on('games', (reply) => {
      res(reply)
      socket.close()
    })
    socket.on('exception', (reply) => {
      rej(reply)
      socket.close()
    })
  })
}

export const socketListener = (callback) => io(PY_SERVER).on('reply', callback)

// MARK - Data

export const DATA_HEADERS = [
  'PLAY #',
  'ODK',
  'DN',
  'DIST',
  'HASH',
  'YARD LN',
  'PLAY TYPE',
  'RESULT',
  'GN/LS',
  'OFF FORM',
  'OFF PLAY',
  'OFF STR',
  'PLAY DIR',
  'GAP',
  'PASS ZONE',
  'DEF FRONT',
  'COVERAGE',
  'BLITZ',
  'QTR',
]