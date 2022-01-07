import React from "react";
import LineTo from "react-lineto";
import "./nn.css";

/**
 * Neural Network Node component
 * @param {*} node Neural Network node
 * @param {int} layerIndex layer index
 * @param {int} nodeIndex node index
 * @returns the component
 */
function NodeComp(node, layerIndex, nodeIndex) {
  // create edge root
  const from = "node id" + layerIndex + "_" + nodeIndex;
  return (
    <div class={from}>
      {node.value.toFixed(2)}
      {layerIndex > 0
        ? node.prevLayer.nodes.map((_n, otherNodeIndex) => {
            // create edge destination
            const to = "node id" + (layerIndex - 1) + "_" + otherNodeIndex;
            // create edge
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

/**
 * The layer component for the neural network
 * @param {object} layer the network layer
 * @param {int} index node index
 * @returns {Component} the layer component
 */
function LayerComp(layer, index) {
  // build a component for each layer node
  return (
    <div class="layer">
      {layer.nodes.map((node, j) => (
        <div key={j}>{NodeComp(node, index, j)}</div>
      ))}
    </div>
  );
}

/**
 * Neural Network component
 *
 * @export
 * @param {Object} network
 * @return {Component} the network component
 */
export function NNComp(network) {
  // Create layers components
  let layersComponent = network.layers.map((layer, i) => LayerComp(layer, i));

  // stack the layers horizontally
  return (
    <div
      class="nn"
      style={{
        gridTemplateColumns: "repeat(" + network.layers.length + ",1fr)",
      }}
    >
      {layersComponent}
    </div>
  );
}

/**
 * Node class
 */
class Node {
  /**
   * Create an instance of Node
   * @param {Layer} prevLayer the previous layer
   * @param {List} inputs the incoming nodes
   */
  constructor(prevLayer, inputs) {
    // Determine if it's an input node
    const isInput = prevLayer === null;
    if (isInput) {
      // accept just the input value
      this.inputs = [{ weight: 1, node: null }];
      this.value = inputs[0];
    } else {
      // the bias is the first input
      this.bias = inputs[0];
      // setup the other inputs
      this.inputs = inputs.splice(1).map((input, i) => {
        return { weight: input, node: prevLayer.nodes[i] };
      });
      this.value = 0;
    }
    this.isInput = isInput;
    this.prevLayer = prevLayer;
  }
  /**
   * @returns the node result value
   */
  evaluate() {
    // return just the bias for an input node
    if (this.isInput) return this.inputs[0];
    // inner product (nodes, weights)
    var sum = 0;
    this.inputs.forEach((element) => {
      // if, for some reason, there is no node, treat as input
      if (!element.node) {
        sum += element.weight;
      } else {
        sum += element.node.value * element.weight;
      }
    });
    // add the bias weight
    sum += this.bias;
    // put through threshold function
    this.value = this.threshold(sum);
    return this.value;
  }
  /**
   * @param {float} z
   * @returns the sigmoid implementation of the threshold fn
   */
  threshold(z) {
    return 1 / (1 + Math.pow(Math.E, -z));
  }
  /** Set the description */
  setDescription(to) {
    this.description = to;
  }
  /** Set the bias */
  setBias(to) {
    this.inputs[0] = to;
    this.value = to;
  }
}

/**
 * Layer class for a neural network
 */
class Layer {
  /**
   * Constructs a Layer instance
   * @param {Array} nodes the nodes to go in the layer
   * @param {Layer} prevLayer the previous layer
   */
  constructor(nodes = [], prevLayer = null) {
    this.nodes = nodes;
    this.prevLayer = prevLayer;
  }
  /** Trigger all nodes to evaluate */
  evaluate() {
    this.nodes.forEach((node) => {
      node.evaluate();
    });
  }
  /** Determines whether its a prev layer */
  isInputLayer() {
    return this.prevLayer == null;
  }

  /**
   * Set inputs
   * @param {*} example
   */
  setInputs(example) {
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
    Object.keys(json).forEach((item) => {
      // create note from previous layer node JSON
      let node = new Node(prevLayer, json[item]);
      node.setDescription(item);
      // add node to layer
      this.nodes.push(node);
    });
    this.prevLayer = prevLayer;
    return this;
  }
}

/**
 * Neural network class
 */
export class NN {
  /** Creates an instance of a neural network */
  constructor() {
    this.layers = [];
  }
  /**
   * Add a layyer
   * @param {Layer} layer
   */
  addLayer(layer) {
    this.layers.add(layer);
  }
  /**
   * Forward-propagate an input example
   * i.e evaluate() each layer.
   * @param {Array} example the input data
   */
  propagate(example) {
    this.layers[0].setInputs(example);
    for (var i = 1; i < this.layers.length; i++) this.layers[i].evaluate();
  }
  /**
   * @returns the output results of output nodes
   */
  outputs() {
    this.layers.forEach((layer) => {
      layer.evaluate();
    });
    return this.layers[this.layers.length - 1].nodes.map((node) => node.value);
  }

  /**
   * Form a NN from a string representation
   * @param {String} str string-formatted NN
   * @returns {NN} the neural network
   */
  fromString(str) {
    let json = JSON.parse(str);
    Object.keys(json).forEach((item) => {
      let prevlayer =
        this.layers.length > 0 ? this.layers[this.layers.length - 1] : null;
      let layer = new Layer().fromJSON(json[item], prevlayer);
      this.layers.push(layer);
    });
    return this;
  }
}
