import React from "react";
import { Series, DataFrame } from 'pandas-js';

const unpack = (series) => Array.from(series.values)
const adjust = (series, fn) => new Series(unpack(series)).map(fn)

const commonest = (series, keep=-1) => {
  try {
    let map = unpack(series).reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
    if (map.get(null))  {
      console.log('Series had ', map.get(null), 'null values')
      map.set('NO DATA', map.get(null))
      map.delete(null)
    }
    let result = Array.from(map.entries())
    result.sort((a,b) => a[1] < b[1] ? 1 : a[1] === b[1] ? 0 : -1)
    if (keep > 0 && result.length >= keep)
      return result.slice(0, keep)
    return result
  } catch (e) {
    return []
  }
}

function formation_frame(frame, form) {
  return frame.filter(frame.get('OFF FORM').eq(form))
}

function runcount(frame, pct=true) {
  const lower = adjust(frame.get('PLAY TYPE'),(item) => item.toLowerCase())
  const filtered_frame = frame.filter(lower.eq('run'))
  if (pct)
    return Array.from(filtered_frame.index).length / frame.length
  else
    return Array.from(filtered_frame.index).length
}

export function form_run_pct(frame, form) {
  return runcount(formation_frame(frame, form))
}

export function commonest_form_plays(df, form) {
  try {
    const frame = formation_frame(df, form)
    const results = commonest(frame.get('OFF PLAY'), 3)
    const max = frame.length
    if (results.length > 0)
      results.forEach((item) => item[1] = item[1] / max)
    return results
  } catch (e) {
    console.error(e.message)
    return []
  }
}

/*  [[1,2], [2,3]]  =>  [{x: 1, y: 2}, {x: 2, y: 3}]  */
export const pandas_reformat = (data, headers) =>
  data.map((row) => {
    var dict = {};
    headers.map((head, i) => {
      dict[head] = row[i];
    });
    return dict;
  });