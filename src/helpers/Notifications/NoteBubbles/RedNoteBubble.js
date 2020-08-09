import React from 'react';

export default function Notes(content, num, color='red', radius='50%') {
  num = String(num);

  console.log(content)

  let boxStyle = {
    position: "relative",
    width: content.props.style ? content.props.style.width : 'auto',
    height: content.props.style ? content.props.style.height : 'auto',
    'text-align':'center',
    'font-family': 'sans-serif'
  };

  let notesStyle = {
    position: "static",
    padding: "7px 10px",
    "background-color": color,
    color: "white",
    "font-weight": "600",
    margin: "5px 0px",
    display: "inline-block",
    "border-radius": radius,
    'text-align':'center'
  };

  if (!isNaN(num) && num.length > 2) notesStyle['border-radius'] = '42%'

  let note_container_Style = {
    position: "absolute",
    right: "-50px",
    top: "-20px",
    width: "100px",
    height: "40px",
    display: "block"
  };
  let note = <div style={notesStyle}>{num}</div>;
  let note_container = <div style={note_container_Style}>{note}</div>;
  let box = (
    <div style={boxStyle}>
      {note_container}
      {content}
    </div>
  );
  return box;
}
