import React from 'react';


// MARK - Helpers


/**
 * A UI wrapper for the JSON component
 * @param {Object} json 
 * @param {*} callback
 * @returns 
 */
 export default function JSONHolder(json, callback) {
    return <div class='jsonwrapper'><JSONComponent data={json} depth={0} callback={callback} /></div>
}

/**
 * Returns the object's keys (which have non-falsy values).
 * @param {Object} json 
 * @returns the object's keys
 */
var iterable = (json) => {
    let list = [];
    Object.keys(json).forEach((key) => {
        if (json[key]) list.push(key);
    });
    return list;
}

/**
 * Color helper for calculating a grey-scale
 * gradient based on tree depth.
 * @param {int} depth 
 * @returns the color
 */
function calcColor(depth) {
    let calc = 255 - ((depth + 1) * 10);
    let rgb = 'rgb(' + calc + ', ' + calc + ', ' + calc + ')';
    return rgb;
}

// MARK - Components




/**
 * Renders a nested JSON structure.
 */
class JSONComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: this.props.data, depth: this.props.depth, childVisible: {} };
    }

    /**
     * Inform the parent of this item's selection.
     * @param {Array} arr the array
     * @param {String} name the name
     */
    handlecallback = (arr, name) => {
        if (this.props.index !== undefined)
            arr.push(this.props.index);
        this.props.callback(arr, name);
    }

    /**
     * Toggle the visibility of a child component
     * @param {Object} child
     * @param {int} the child index
     * @param {Boolean} isLeaf whether the child is a leaf node
     */
    toggle = (child, i, isLeaf) => {
        // if the child is a leaf, it has been selected
        if (isLeaf) {
            this.props.callback([i, this.props.index], child);
        }
        // toggle visibility
        if (this.isVisible(child)) {
            let childVisible = this.state.childVisible;
            childVisible[child] = false;
            this.setState({ childVisible: childVisible });
        } else {
            let childVisible = this.state.childVisible;
            childVisible[child] = true;
            this.setState({ childVisible: childVisible });
        }
    }

    // determine child visilibity
    isVisible = (child) => this.state.childVisible[child] === true;

    render() {
        // Get data
        let json = this.state.data;
        // Handle no data
        if (json === null || json === undefined)
            return <div>No data to show.</div>
        // Create data tree
        let depth = this.state.depth;
        let jarray = iterable(json);
        let html = (
            <div>
                {jarray.map((child, i) => {
                    let childjson = json[child];
                    let child_iterable = iterable(childjson);
                    let isLeaf = child_iterable.indexOf('isLeaf') !== -1;
                    if (isLeaf) {
                        return (<div>
                            <div class='json' style={{ marginLeft: 15 * (depth + 1), color: 'white', backgroundColor: 'black' }} onClick={() => this.toggle(childjson['id'], i, true)}>{childjson['id']}</div>
                        </div>
                        );
                    }
                    return (<div>
                        <div class='json' style={{ marginLeft: 15 * (depth + 1), color: 'black', backgroundColor: calcColor(depth) }} onClick={() => this.toggle(child, i, false)}>{child}</div>
                        <div class={this.isVisible(child) ? 'visible' : 'hidden'}>
                            <JSONComponent index={i} callback={this.handlecallback} data={json[child]} depth={depth + 1} />
                        </div>
                    </div>
                    );
                })}
            </div>
        )
        return html;
    }
}
