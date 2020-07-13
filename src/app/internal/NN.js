import React from "react";
import "./nn.css";
import LineTo from "react-lineto";

function NodeComp(node, layerIndex, nodeIndex) {
  // console.log(node);
  let from = "node id" + layerIndex + "_" + nodeIndex;
  return (
    <div class={from}>
      {node.value.toFixed(2)}
      {layerIndex > 0
        ? node.prevLayer.nodes.map((n, otherNodeIndex) => {
            let to = "node id" + (layerIndex - 1) + "_" + otherNodeIndex;
            console.log("New Line \n\tfrom: " + from + "\n\tto: " + to);
            return (
              <LineTo
                key={otherNodeIndex}
                zIndex={-1}
                borderColor="green"
                from={from}
                to={to}
              />
            );
          })
        : null}
    </div>
  );
}

function LayerComp(layer, index) {
  // console.log('Layer');
  return (
    <div class="layer">
      {layer.nodes.map((node, j) => (
        <div key={j}>{NodeComp(node, index, j)}</div>
      ))}
    </div>
  );
}

export function NNComp(network) {
  // console.log(network.layers.length)
  let layersComponent = network.layers.map((layer, i) => {
    // console.log('got layer')
    let x = LayerComp(layer, i);
    return x;
  });
  // network.layers.map((layer, i) => console.log(i))

  return (
    <div
      class="nn"
      style={{
        gridTemplateColumns: "repeat(" + network.layers.length + ",1fr)"
      }}
    >
      {layersComponent}
    </div>
  );
}

class Node {
  constructor(prevLayer, inputs) {
    let isInput = prevLayer === null;
    if (isInput) {
      this.inputs = [{ weight: inputs[0], node: null }];
      this.value = inputs[0];
    } else {
      this.bias = inputs[0];
      this.inputs = inputs.splice(1).map((input, i) => {
        return { weight: input, node: prevLayer.nodes[i] };
      });
      this.value = 0;
    }
    this.isInput = isInput;
    this.prevLayer = prevLayer;
  }
  evaluate() {
    if (this.isInput) return this.inputs[0];
    var sum = 0;
    // console.log('evaluating ' + JSON.stringify(this.inputs))
    this.inputs.forEach(element => {
      if (!element.node) {
        sum += element.weight;
      } else {
        sum += element.node.value * element.weight;
      }
    });
    sum += this.bias;
    this.value = this.threshold(sum);
  }
  threshold(z) {
    return 1 / (1 + Math.pow(Math.E, -z));
  }
  setDescription(to) {
    this.description = to;
  }
  setBias(to) {
    this.inputs[0] = to;
    this.value = to;
  }
}

class Layer {
  constructor(nodes = [], prevLayer = null) {
    this.nodes = nodes;
    this.prevLayer = prevLayer;
  }
  evaluate() {
    this.nodes.forEach(node => {
      node.evaluate();
    });
  }
  isInputLayer() {
    return;
  }

  setInputs(example) {
    // console.log('prev: ' + this.prevLayer)
    // console.log('ex: ' + example)
    // console.log('len: ' + this.nodes.length)
    if (
      !example ||
      !Array.isArray(example) ||
      example.length !== this.nodes.length ||
      this.prevLayer !== null
    )
      throw "Invalid operation: potentially bad inputs given to potentially non-input layer!";
    this.nodes.forEach((node, i) => {
      node.setBias(example[i]);
    });
  }

  /*
  List of nodes
  Structure: [{in1,in2,in...}, {in1,in2,..},...]

  */
  fromJSON(json, prevLayer) {
    Object.keys(json).forEach(item => {
      let node = new Node(prevLayer, json[item]);
      node.setDescription(item);
      // console.log('pushing node: ' + item)
      this.nodes.push(node);
    });
    this.prevLayer = prevLayer;
    return this;
  }
}

export class NN {
  constructor() {
    this.layers = [];
  }
  addLayer(layer) {
    this.layers.add(layer);
  }
  propagate(example) {
    this.layers[0].setInputs(example);
    for (var i = 1; i < this.layers.length; i++) this.layers[i].evaluate();
  }
  outputs() {
    this.layers.forEach(layer => {
      layer.evaluate();
    });
    return this.layers[this.layers.length - 1].nodes.map(node => node.value);
  }
  fromString(str) {
    let json = JSON.parse(str);
    console.log(json);
    Object.keys(json).forEach(item => {
      let prevlayer =
        this.layers.length > 0 ? this.layers[this.layers.length - 1] : null;
      // console.log('building layer from: ' + JSON.stringify(json[item]))
      // console.log('building layer with prev: ' + JSON.stringify(prevlayer))
      let layer = new Layer().fromJSON(json[item], prevlayer);
      this.layers.push(layer);
      // console.log('Pushed Layer: ' + JSON.stringify(layer));
    });
    return this;
  }
}

