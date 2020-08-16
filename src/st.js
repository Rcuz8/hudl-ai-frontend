import React, {useState, useEffect} from 'react';
import * as con from './helpers/constants'

export default function SocketTest(props) {

  const [msgs, setMsgs] = useState([])

  useEffect(() => {
    const got_msg = (msg) => setMsgs([...msgs,msg])
    con.socket_listen('model_status',got_msg)
  })

  return (
    <div>
      {
        msgs.map((msg) => {
          return <div style={{padding: '15px'}}>{msg.pct} {msg.msg}</div>
        })
      }
    </div>
  )
} 