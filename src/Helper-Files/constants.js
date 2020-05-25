import React from 'react'; 

const LOCAL_NODE_SERVER = 'localhost:9898';
const LOCAL_JAVA_SERVER = 'localhost:9009';

const LOCAL_URLs = {
    NODE_LOGIN: LOCAL_NODE_SERVER + '/login',
    NODE_FILMDATA: LOCAL_NODE_SERVER + '/filmdata',
    NODE_VIDOPTIONS: LOCAL_NODE_SERVER + '/videooptions',
    JAVA_GETMODEL: LOCAL_JAVA_SERVER + '/model'
};

export const URLs = LOCAL_URLs;
