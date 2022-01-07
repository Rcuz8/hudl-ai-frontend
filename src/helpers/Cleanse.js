import { TKN_1, TKN_2, TKN_3 } from './constants'

/**
 * Determines the columns which are non-empty in over
 * THRESH_PCT percent of the rows.
 * @param {Array} rows the data rows
 * @returns A list of column indices (which have data)
 */
function used_data_indices(rows) {
  // Get data width
  let len = rows[0].split(TKN_1).length
  let used = {}
  // Fill a dict per each col
  Array(len)
    .fill()
    .map((x, i) => {
      used[i + ''] = true
      return null
    })

  // for each row (tokenized), increment column store if non-empty
  rows.forEach((row) => {
    row.split(TKN_1).forEach((el, index) => {
      if (el) used[index] = used[index] + 1
    })
  })

  // We want to keep columns with this percentage of the fields (i.e non-null columns).
  let THRESHOLD_PERC = 70

  let indices = []
  // Add columns indices that have more than this percent of fields.
  Object.keys(used).map((key) => {
    if (used[key] / rows.length >= THRESHOLD_PERC / 100) indices.push(key)
    return null
  })

  return indices
}

/**
 * Trims the data width (removes specified columns)
 * NOTE: Before calling this, rows are serialized.
 *       After call, they are deserialized.
 * @param {Array} rows the data rows
 * @param {Array} used_indices the indices meeting the presence threshold
 * @returns the data rows
 */
function trim_data_width(rows, used_indices) {
  // iterate through all rows trimming
  return rows.map((row) => {
    const trimmed_row = []
    // determine if each column is used. If so, add to row.
    row.split(TKN_1).forEach((el, index) => {
      if (used_indices.indexOf(index + '') !== -1) {
        trimmed_row.push(el)
      }
    })
    return trimmed_row
  })
}

/**
 * Cleans the data (filters out those with empty fields)
 * @param {Array} rows_lists the rows
 * @returns rows with no empty fields
 */
function cleaned_data(rows_lists) {
  const clean_rows = []
  // iterate through rows
  rows_lists.map((row) => {
    var should_push = true
    row.forEach((item) => {
      // if any column is empty, do not include this row
      if (!item) should_push = false
    })
    if (should_push) clean_rows.push(row)
    return null
  })
  return clean_rows
}

/**
 * Retokenize/Serialize the data
 * @param {Array} data_matrix_list the matrix list
 * @returns the serialized data
 */
export function retokenize(data_matrix_list) {
  var data_str = '['
  data_matrix_list.forEach((matrix) => {
    var mx = '['
    matrix.forEach((row) => {
      mx += '"' + row.toString() + '",'
    })
    mx = mx.substring(0, mx.length - 1) // chop off extra comma
    mx += '],'
    data_str += mx
  })
  data_str = data_str.substring(0, data_str.length - 1) // chop off extra comma
  data_str += ']'

  return data_str
}

/**
 * Deserialize the data string, as per the custom backend serialization protocol
 * 
 * FORMAT: a,b,c!!!d,e,f###a,b,c!!!d,e,f -> [[['a','b','c'], ['d','e','f']], [['a','b','c'], ['d','e','f']]]
 * 
 * @param {String} str the tokenized data string
 * @returns the data
 */
export const untokenize = (str) =>
  str
    .split(TKN_3)
    .map((item) => item.split(TKN_2).map((item) => item.split(TKN_1)))

/**
 * Swaps the tokens of a tokenized string.
 * @param {String} str data string
 * @returns the retokenized string
 */
export const token_swap = (str) => str.split(TKN_2).join('\n')

/**
 * Clean the data, given the active/used columns information.
 * @param {Array} splitdata the data (already deserialized)
 * @param {Array} used_indices the list of indices for used columns
 * @returns The cleaned data
 */
export function cleaned_withParams(splitdata, used_indices) {
  // trim the width of the data
  let trimmed_data = trim_data_width(splitdata, used_indices)
  // remove incomplete entries
  let clean = cleaned_data(trimmed_data)
  // If all data is being removed, there is an issue.
  if (clean.length < 1)
    throw 'Cleansing error! There should be more clean data!'
  return clean
}

/**
 * Cleanses the data.
 * @param {Array} splitdata the data (already deserialized)
 * @param {*} old_headers the list of headers pre-cleansing
 * @returns {Object} the cleaned headers, data, and active/used column indices
 */
export default function cleanse(splitdata, old_headers) {
  // Get the active/used columns. This is determined by whether they
  // meet a pre-determined data presence threshold
  let used_indices = used_data_indices(splitdata)
  // Get the new columns' names. These are the new headers.
  let headers = used_indices.map((index) => old_headers[index])
  // Ensure we did not lose all headers
  if (!headers || headers.length < 3)
    throw 'Cleansing error! There should be more usable headers!'
  // Prune unused rows from data
  let trimmed_data = trim_data_width(splitdata, used_indices)
  // Remove rows with empty entries
  let clean = cleaned_data(trimmed_data)
  // Ensure we did not lose all data
  if (clean.length < 5)
    throw 'Cleansing error! There should be more clean data!'
  return { headers: headers, data: clean, used_indices: used_indices }
}
