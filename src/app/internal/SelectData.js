import React, {
    useState
  } from 'react'
  import {
    Modal,
    Button,
    ProgressBar
  } from 'react-bootstrap'
  import {
    URLs,
    TKN_1,
    TKN_2,
    TKN_3
  } from '../../helpers/constants'
  import JSONRender from '../../helpers/JSONRender'
  import cleanse, {
    retokenize
  } from '../../helpers/Cleanse'
  
  function removeItem(arr, value) {
    var index = arr.indexOf(value)
    if (index > -1) {
      arr.splice(index, 1)
    }
    return arr
  }
  
  export default function SelectTrainingData(props) {
    const SESSION_ID = props.session_id
    const DIRECTORY_DATA = props.data
  
    const [selections, set_Selections] = useState([])
    const [progress, set_Progress] = useState(-1)
  
    const popSelection = (item) => {
      let o = [...selections]
      removeItem(o, item)
      set_Selections(o)
    }
  
    const addSelection = (dir) => {
      let l = [...selections]
      if (l.indexOf(dir) !== -1)
        return
      l.push(dir)
      set_Selections(l)
    }
  
    const Selected_Film_Clip = (arr, name) => {
      arr = arr.reverse()
      console.log(arr)
      addSelection({
        dir: arr,
        name: name
      })
    }
  
    const submit = () => {
      set_Progress(0);
      if (selections.length === 0)
        return
      var stringified = ''
      selections.forEach((sel) => {
        stringified += sel.dir.toString() + TKN_2
      })
      stringified = stringified.substring(0, stringified.length - TKN_2.length)
  
      const ws = new WebSocket('ws://' + URLs.NODE_MULTIDATA)
      ws.onopen = function() {
        console.log('WebSocket Client Connected : multidata')
        console.log('Sending dir_lists: ' + stringified);
        
        ws.send(JSON.stringify({
          session_id: SESSION_ID,
          dir_lists: stringified
        }))
      }
      ws.onmessage = function(e) {
          /*

            Data Response! It may be partial, it may be whole.

            If partial, update status.
            If whole, disassemble "disjunction by film" & reassemble so they're all together 
                Then clean & save headers/ "used indices" so we can clean the test data the same way

          */
        let got = JSON.parse(e.data)
        // get info
        let status = got.status
        // set progress
        set_Progress(status)
        //get data
        let combined_data = got.combineddata
        // check if only partial response
        if (!combined_data) {
          //  DO Nothing
        } else {
          // get full data & headers
          let headers = combined_data.headers
          let data = combined_data.data
          // split data by film
        //   let EACH_FILM_DATA_UNPARSED = data.split(TKN_3)

          let combined_data = data.split(TKN_3)
          let film_names = selections.map(sel => sel.name)
          console.log('Recieved Complete Node.js Server Response: ')
          console.log('\tHeaders: ')
          console.log(headers)
          console.log('\tPre-tokenization Datum: ')
          console.log(combined_data)
          console.log('\tFilm Names: ')
          console.log(film_names)
          let datum = retokenize(combined_data)
          console.log('\tPost-tokenization Datum: ')
          console.log(datum)
          props.callback({headers: headers, data: combined_data, film_names: film_names});

          console.log('Completed hudl data retrieval. ')
        }
      }
    }

    const Progress = (
        <div class='logging_in'>
            <h2>Retrieving selected Training Data..</h2>
            <ProgressBar now={progress} />
        </div>
    )

    let select = (
        <>
        <h2>Select the relevent film.</h2>
        <h3>Selected Clips</h3>
        <div class='clips'>
          {
            selections.map((item) => {
              return (
                <div class='json' onClick={() => popSelection(item)}>
                  {item.name}
                </div>
              )
            })
          }
        </div>
  
        <Button onClick={() => submit()}>Submit Selection</Button>
        <h3>Directory:</h3>
        {JSONRender(DIRECTORY_DATA, Selected_Film_Clip)}
        </>
    );
  
    return (
      <div className='selectdata'>
          {progress < 0 ? select : Progress}
      </div>
    )
  }
  

  /*
  export default function SelectTrainingData(props) {
    const SESSION_ID = props.session_id
    const DIRECTORY_DATA = props.data
  
    const [selections, set_Selections] = useState([])
    const [progress, set_Progress] = useState(-1)
  
    const popSelection = (item) => {
      let o = [...selections]
      removeItem(o, item)
      set_Selections(o)
    }
  
    const addSelection = (dir) => {
      let l = [...selections]
      if (l.indexOf(dir) !== -1)
        return
      l.push(dir)
      set_Selections(l)
    }
  
    const Selected_Film_Clip = (arr, name) => {
      arr = arr.reverse()
      console.log(arr)
      addSelection({
        dir: arr,
        name: name
      })
    }
  
    const submit = () => {
      set_Progress(0);
      if (selections.length === 0)
        return
      var stringified = ''
      selections.forEach((sel) => {
        stringified += sel.dir.toString() + TKN_2
      })
      stringified = stringified.substring(0, stringified.length - TKN_2.length)
  
      const ws = new WebSocket('ws://' + URLs.NODE_MULTIDATA)
      ws.onopen = function() {
        console.log('WebSocket Client Connected : multidata')
        console.log('Sending dir_lists: ' + stringified);
        
        ws.send(JSON.stringify({
          session_id: SESSION_ID,
          dir_lists: stringified
        }))
      }
      ws.onmessage = function(e) {
          / *

            Data Response! It may be partial, it may be whole.

            If partial, update status.
            If whole, disassemble "disjunction by film" & reassemble so they're all together 
                Then clean & save headers/ "used indices" so we can clean the test data the same way

          * /
        let got = JSON.parse(e.data)
        // get info
        let status = got.status
        // set progress
        set_Progress(status)
        //get data
        let combined_data = got.combineddata
        // check if only partial response
        if (!combined_data) {
          //  DO Nothing
        } else {
          // get full data & headers
          let headers = combined_data.headers
          let data = combined_data.data
          // split data by film
        //   let EACH_FILM_DATA_UNPARSED = data.split(TKN_3)
          let ALL_FILM_DATA_COMBINED = data.split(TKN_3).join(TKN_2)
  
          // let EACH_FILM_DATA_PARSED = EACH_FILM_DATA_UNPARSED.map((film) => {   return
          // film.map((data_row) => JSON.parse(data_row)); });
  
          let clean_parse = cleanse(ALL_FILM_DATA_COMBINED.split(TKN_2),
            headers)
          let clean_data = clean_parse.data
          let clean_headers = clean_parse.headers
          let clean_indices = clean_parse.used_indices
          let retokenized = retokenize(clean_data)

          props.callback({headers: clean_headers, data: clean_data, unparsedData: retokenized, clean_indices: clean_indices, training_arrays: selections});
  
          console.log('Completed training data submit. ')
        }
      }
    }

    const Progress = (
        <div class='logging_in'>
            <h2>Retrieving selected Training Data..</h2>
            <ProgressBar now={progress} />
        </div>
    )

    let select = (
        <>
        <h2>Select film to train the AI model on.</h2>
        <h3>Selected Clips</h3>
        <div class='clips'>
          {
            selections.map((item) => {
              return (
                <div class='json' onClick={() => popSelection(item)}>
                  {item.name}
                </div>
              )
            })
          }
        </div>
  
        <Button onClick={() => submit()}>Submit Selection</Button>
        <h3>Your HUDL Directory:</h3>
        {JSONRender(DIRECTORY_DATA, Selected_Film_Clip)}
        </>
    );
  
    return (
      <div className='selectdata'>
          {progress < 0 ? select : Progress}
      </div>
    )
  }

  */