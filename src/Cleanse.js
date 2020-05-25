import React from 'react';


function split_data (data) { return data.data.split('!!!'); }

function used_data_indices(rows) {
  // Initialize used
  let len = rows[0].split(',').length;
  let used = {};
  Array(len).fill().map((x, i) => {used[i+''] = true; return null;})

  rows.forEach(row => {
    row.split(',').forEach((el, index) => {
      if (el) used[index] = used[index] + 1;
    })
  });

  let THRESHOLD_PERC = 70;

  let indices = [];
  Object.keys(used).map((key) => {
    if (used[key]/rows.length >= THRESHOLD_PERC/100)
      indices.push(key);
    return null;
  })

  console.log(indices)
  
  return indices;
}

function trim_data_width(rows, used_indices) {
  let updated_rows = rows.map(row => {
    var trimmed_row = [];
    row.split(',').forEach((el, index) => {
      if (used_indices.indexOf(index+"") !== -1) {
        trimmed_row.push(el);
      }
    })
    return trimmed_row;
  });
  console.log('Updated width of ' + updated_rows.length + ' rows to ' + used_indices.length + ' wide' )
  return updated_rows;
}

function cleaned_data(rows_lists) {
  let clean_rows = [];
  rows_lists.map((row) => {
    var should_push = true;
      row.forEach((item) => {
        if (!item) should_push = false;
      })
      if (should_push)
        clean_rows.push(row);
      return null;
  })
  console.log('Cleaned data to now contain ' + clean_rows.length + ' rows')
  return clean_rows;
}

const trim =(str, len) => {
  if (len <= 0) return len;
  return str.substring(0,str.length-len);
}

export function retokenize(filmdata) {
  var data_str = '';
  filmdata.forEach((row) => {
    var str = '';
    row.forEach((item) => {str += (item + ',')});
    data_str += (trim(str, 1) + '!!!');
  })
  console.log(data_str);
  return trim(data_str, 3);
      
}

// Assumung data format is : {status:.. , data: { headers: "x,y,z", data: "a,b,c!!!d,e,f" }}
export default function cleanse(filmdata) {
    console.log('(1) Recieved the following film data : ');
    console.log(filmdata);
    let data = filmdata.data;
    let splitdata = split_data(data);
    console.log('(2) We now have the following (split) film data : ');
    console.log(splitdata);
    let used_indices = used_data_indices(splitdata);
    let headers = used_indices.map((index) => data.headers[index])
    console.log('(3) Usable headers: ')
    console.log(headers)
    if (!headers || headers.length < 3 ) throw 'Cleansing error! There should be more usable headers!';
    let trimmed_data = trim_data_width(splitdata, used_indices);
    let clean = cleaned_data(trimmed_data);
    console.log('(4) We now have the following (clean) film data : ' + JSON.stringify(splitdata));
    if (clean.length < 5 ) throw 'Cleansing error! There should be more clean data!';
    return {headers: headers, data: clean};
}


