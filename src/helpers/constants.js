import React from 'react'; 

const LOCAL_NODE_SERVER = 'http://127.0.0.1:9797';
const LOCAL_PY_SERVER = 'http://127.0.0.1:5000'; // NOTE: SSL IN PROD MEANS HTTP -> HTTPS

export const TKN_1 = ',';
export const TKN_2 = '!!!';
export const TKN_3 = '###';

const LOCAL_URLs = {
    NODE_LOGIN: LOCAL_NODE_SERVER + '/login',
    NODE_FILMDATA: LOCAL_NODE_SERVER + '/filmdata',
    NODE_VIDOPTIONS: LOCAL_NODE_SERVER + '/videooptions',
    NODE_MULTIDATA: LOCAL_NODE_SERVER + '/multidata',
    PY_USERINFO: LOCAL_PY_SERVER + '/userinfo',
    PY_NEW_CLIENT: LOCAL_PY_SERVER + '/newclient',
    PY_CLIENTS: LOCAL_PY_SERVER + '/clients',
    PY_NEW_QUALITY_ANALYSIS: LOCAL_PY_SERVER + '/new_qa'
};


export const URLs = LOCAL_URLs;

export const ROUTES = {
    LANDING: '/',
    SIGN_UP: '/signup',
    SIGN_IN: '/signin',
    HOME: '/home',
    ACCOUNT: '/account',
    DATA_QUALITY: '/mydata',
    NEW_GAME_ANALYSIS: '/nga',
    NEW_CLIENT: '/nc',
    NEW_MODEL: '/nm'
}