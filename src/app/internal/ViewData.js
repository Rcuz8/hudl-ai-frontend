import React, {useState, useCallback} from 'react';
import './viewdata.css';
import './nav.css';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { URLs } from '../../helpers/constants';

/* HELPERS */

function generate_data_domain(headers, data) {
    console.log('Generating data domain for: ');
    console.log(headers)
    console.log(data)
    var domains = [];
    // initialize domains
    headers.forEach((header) => { domains.push({header: header, domain: []}) });
    // for each index of each piece of data, if it's new, I want to attribute it an index
    data.forEach((chunk) => {
        // for each item in data
        chunk.forEach((piece, i) => {
            // if domain for that respective header has not seen data piece, add it
            if (domains[i].domain.indexOf(piece) === -1)
                domains[i].domain.push(piece);
        })
    })
    return domains;
}

function removeItem(arr, value) { 
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}
function CannotAddModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Cannot add item
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Max number of features have been selected. Please remove a feature
         to add another. </p>
        </Modal.Body>
      </Modal>
    );
  }

  /* VERIFY USER SELECTION */
function VerifyChoice_Modal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Building Model..
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            This may take a moment.
          </p>
        </Modal.Body>
      </Modal>
    );
  }


/* COMPONENT - VIEW DATA */

function ViewData(props) {

  // JSON
  let training_data = props.training;
  let test_data = props.test;
  // Stringified
  let str_training_data = props.str_training_data;
  let str_test_data = props.str_test_data;

  console.log('ViewData loading with the following data: ');
  console.log('Training data: ')
  console.log(training_data);
  console.log('Test data: ')
  console.log(test_data);
  console.log('Training data (str): ')
  console.log(str_training_data);
  console.log('Test data (str): ')
  console.log(str_test_data);
  

  let headers = props.headers;

    const MAX_FEATURES = 3;

    const [outputList, setOutputlist] = useState([]);
    const [allOptions, setAllOptions] = useState(JSON.parse(JSON.stringify(headers)));   // ['apple', 'pear', 'banana', 'celery', 'eggs', 'bacon', 'mammoth']
    const [showCantAddModel, set_showCantAddModel] = useState(false); 
    const [showBuilding, set_ShowBuilding] = useState(false); 
    const [nn, set_NN] = useState(false); 
    const [dataDomain, set_DataDomain] = useState(generate_data_domain(headers,training_data)); // Data domain with JUST TRAINING DATA should be fine
    
    const addOutputItem = (item) => {
        if (outputList.length > MAX_FEATURES-1) {
            set_showCantAddModel(true);
            return;
        }
        let l = [...outputList];
        l.push(item);
        setOutputlist(l);
        let o = [...allOptions];
        removeItem(o,item);
        setAllOptions(o);
    };

    const popOutputItem = (item) => {
        let l = [...allOptions];
        l.push(item);
        setAllOptions(l);
        let o = [...outputList];
        removeItem(o,item);
        setOutputlist(o);
    }

    const generateModel = async () => {
        console.log('Generating Model.')
        set_ShowBuilding(true);
        let output_indices = outputList.map((item) => headers.indexOf(item));
        //TODO: MAKE REQUEST
        let m = 'http://localhost:9009/mod';

        console.log('Generating model with Parameters:')
        console.log('Training data:')
        console.log(str_training_data)
        console.log('Test data:')
        console.log(str_test_data)
        console.log('Outputs:')
        console.log(output_indices.toString())
        axios.get(m, {
          params: {
            training: str_training_data,
            test: str_test_data,
            outputs: output_indices.toString()
          }
        }).then((resp) => {
            set_NN(resp.data);
            console.log('Moving into Predictions with \ndata: ' + resp.data);
            console.log('DDomain: ');
            console.log(dataDomain);
            console.log('Out Indices: ');
            console.log(output_indices);

            props.callback(resp.data, dataDomain, output_indices);
        });

    }
    
    console.log('Huncho.');

    const CantAddModal = <CannotAddModal
        show={showCantAddModel}
        onHide={() => set_showCantAddModel(false)}
    />

    const data_render = (title, data) => {
      let header_comp =
      <thead>
          {headers.map((head) => <th>{head}</th>)}
      </thead>;
      let body_comp =
          <tbody>
              {data.map((row) => <tr>{row.map((col) => <td>{col}</td>)}</tr>)}
          </tbody>;
      return (
        <>
          <h2>{title}</h2>
          <table>
              {header_comp}
              {body_comp}
          </table>
          </>
      )
    }

    let out_items = outputList.map((item) => {
        return <div class='json' onClick={() => popOutputItem(item)}>{item}</div>
    })

    let all_items = allOptions.map((item) => {
        return <div class='json' onClick={() => addOutputItem(item)}>{item}</div>
    })

    let options = (
        <div class='split'>
            <div class='splitchild'>
                <h3>Available</h3>
                <div class='splitchild scrollable'>
                    {all_items}
                </div>
            </div>
            <div class='splitchild'>
                <h3>Selected</h3>  
                <div class='splitchild scrollable'>
                    {out_items}
                </div>
            </div>
        </div>
    )

    const BuildingDataVerificationNote = <VerifyChoice_Modal
        show={showBuilding}
        onHide={() => set_ShowBuilding(false)}
    />

    console.log('Quavo Huncho.');

    
    return (
        <div class='viewdata'>
            <h2>Below is your film's data. Please select the features you'd like to predict (Max {MAX_FEATURES}).</h2>
            {options}
            <div class='genmodelbtn'>
                <Button onClick={() => generateModel()}>Generate Predictive Model</Button>
            </div>
            {data_render('Training Data', training_data)}
            {data_render('Test Data', test_data)}
            {CantAddModal}
            {BuildingDataVerificationNote}
        </div>
    )
}

export default ViewData;


// OLD

// function ViewData(props) {
    

//   let filmData_conHeaders = props.filmData;
//   let headers = filmData_conHeaders.headers;
//   let unparsedData = filmData_conHeaders.unparsedData;
//   let filmData = filmData_conHeaders.data;

//   const MAX_FEATURES = 3;

//   const [outputList, setOutputlist] = useState([]);
//   const [allOptions, setAllOptions] = useState(JSON.parse(JSON.stringify(headers)));   // ['apple', 'pear', 'banana', 'celery', 'eggs', 'bacon', 'mammoth']
//   const [showCantAddModel, set_showCantAddModel] = useState(false); 
//   const [showBuilding, set_ShowBuilding] = useState(false); 
//   const [nn, set_NN] = useState(false); 
//   const [dataDomain, set_DataDomain] = useState(generate_data_domain(headers,filmData)); 

  
//   const addOutputItem = (item) => {
//       if (outputList.length > MAX_FEATURES-1) {
//           set_showCantAddModel(true);
//           return;
//       }
//       let l = [...outputList];
//       l.push(item);
//       setOutputlist(l);
//       let o = [...allOptions];
//       removeItem(o,item);
//       setAllOptions(o);
//   };

//   const popOutputItem = (item) => {
//       let l = [...allOptions];
//       l.push(item);
//       setAllOptions(l);
//       let o = [...outputList];
//       removeItem(o,item);
//       setOutputlist(o);
//   }

//   const generateModel = async () => {
//       set_ShowBuilding(true);
//       let output_indices = outputList.map((item) => headers.indexOf(item));
//       let data = unparsedData;
//       //TODO: MAKE REQUEST
//       let m = 'http://localhost:9009/mod';

//   axios.get(m, {
//     params: {
//       data: data,
//       outputs: output_indices.toString()
//     }
//   }).then((resp) => {
//       set_NN(resp.data);
//       console.log('Moving into Predictions with \ndata: ' + resp.data);
//       console.log('DDomain: ');
//       console.log(dataDomain);
//       console.log('Out Indices: ');
//       console.log(output_indices);

//       props.callback(resp.data, dataDomain, output_indices);
//   });
//   // axios.get(URLs.JAVA_GETMODEL, {params: {data: data}}).then((resp) => setData(resp));

//       // axios.get(m, {
//       //     params: {
//       //     data: data,
//       //     outputs: output_indices.toString()
//       //     }
//       // }).then((resp) => {
//       //     console.log('CUZZO FOUND IT!');
//       //     console.log(resp);
//       //     set_NN(resp.data);
//       //     props.callback(resp.data, dataDomain, output_indices);
//       // }).catch((e) => {
//       //     console.log('CUZZO CAUGHT IT!');
//       //     console.log(e);
//       // });
//       // axios.get(URLs.JAVA_GETMODEL, {params: {data: data}}).then((resp) => setData(resp));
      
//       // axios.get(URLs.JAVA_GETMODEL, {data: })

//   }

//   const CantAddModal = <CannotAddModal
//       show={showCantAddModel}
//       onHide={() => set_showCantAddModel(false)}
//   />

//   const json_render = () => {
//       let data = filmData_conHeaders;
//       if (!data || !data.data || !data.headers) return <div>No Film Data.</div>;
//       let header_comp =
//           <thead>
//               {data.headers.map((head) => <th>{head}</th>)}
//           </thead>;

//       let body_comp =
//           <tbody>
//               {data.data.map((row) => <tr>{row.map((col) => <td>{col}</td>)}</tr>)}
//           </tbody>;
//       return (
//           <table>
//               {header_comp}
//               {body_comp}
//           </table>
//       )
//   }

//   let out_items = outputList.map((item) => {
//       return <div class='json' onClick={() => popOutputItem(item)}>{item}</div>
//   })

//   let all_items = allOptions.map((item) => {
//       return <div class='json' onClick={() => addOutputItem(item)}>{item}</div>
//   })

//   let options = (
//       <div class='split'>
//           <div class='splitchild'>
//               <h3>Available</h3>
//               <div class='splitchild scrollable'>
//                   {all_items}
//               </div>
//           </div>
//           <div class='splitchild'>
//               <h3>Selected</h3>  
//               <div class='splitchild scrollable'>
//                   {out_items}
//               </div>
//           </div>
//       </div>
//   )

//   const BuildingDataVerificationNote = <VerifyChoice_Modal
//       show={showBuilding}
//       onHide={() => set_ShowBuilding(false)}
//   />


  
//   return (
//       <div class='viewdata'>
//           <h2>Below is your film's data. Please select the features you'd like to predict (Max {MAX_FEATURES}).</h2>
//           {options}
//           <div class='genmodelbtn'>
//               <Button onClick={() => generateModel()}>Generate Predictive Model</Button>
//           </div>
//           {json_render()}
//           {CantAddModal}
//       </div>
//   )
// }

