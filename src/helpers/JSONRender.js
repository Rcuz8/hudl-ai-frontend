import React from 'react';

/* HELPERS */

export default function JSONHolder(json, callback) {
    return <div class='jsonwrapper'><JSONComponent data={json} depth={0} callback={callback}/></div>
}
function calcColor(depth) {
    let calc = 255-((depth+1)*10);
    let rgb = 'rgb(' + calc + ', ' + calc + ', ' + calc + ')';
    // console.log('depth ' + depth + ' -> color ' + rgb);
    return rgb;
}
var iterable = (json) => {
    let list = [];
    Object.keys(json).forEach((key) => {
        if (json[key]) list.push(key);
    });
    return list;
}


/* JSON TREE DISPLAY */

class JSONComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: this.props.data, depth: this.props.depth, childVisible: {} };
    }

    handlecallback = (arr, name) => {
        if (this.props.index !== undefined)
            arr.push(this.props.index);
        this.props.callback(arr, name);
    }
    toggle = (child, i, isLeaf) => {
        // let json = this.state.data;
        // let next_children = iterable(json[child]);
        // let next_exist = next_children.length > 0;

        if (isLeaf) { // was ->  !next_exist
            this.props.callback([i, this.props.index], child);
        }
        if (this.isVisible(child)) {
            let childVisible = this.state.childVisible;
            childVisible[child] = false;
            this.setState({childVisible: childVisible});
        } else {
            let childVisible = this.state.childVisible;
            childVisible[child] = true;
            this.setState({childVisible: childVisible});
        }
    }
    isVisible = (child) => this.state.childVisible[child] === true;

    render() {
        let json = this.state.data;
        if (json === null || json === undefined)
            return <div>No data to show.</div>
        let depth = this.state.depth;
        let jarray = iterable(json);
        let html = (
            <div>
            {jarray.map((child, i) => {
                // let next_children = iterable(json[child]);   -> Standard implementation
                // let next_exist = next_children.length > 0;   -> Standard implementation
            //     return (<div>
            //         <div class='json' style={{marginLeft: 15*(depth+1), color: next_exist ? 'black' : 'white', backgroundColor: next_exist ? calcColor(depth) : 'black' }} onClick={() => this.toggle(child, i)}>{child}</div>
            //         <div class={this.isVisible(child) ? 'visible' : 'hidden'}>
            //         <JSONComponent index={i} callback={this.handlecallback} data={json[child]} depth={depth+1}/>
            //         </div>
            //     </div>
            // );
                let childjson = json[child];
                let child_iterable = iterable(childjson);
                let isLeaf = child_iterable.indexOf('isLeaf') !== -1;
                if (isLeaf) {
                    return (<div>
                        <div class='json' style={{marginLeft: 15*(depth+1), color: 'white', backgroundColor:'black' }} onClick={() => this.toggle(childjson['id'], i, true)}>{childjson['id']}</div>
                    </div>
                );
                }
                return (<div>
                    <div class='json' style={{marginLeft: 15*(depth+1), color: 'black', backgroundColor: calcColor(depth) }} onClick={() => this.toggle(child, i, false)}>{child}</div>
                    <div class={this.isVisible(child) ? 'visible' : 'hidden'}>
                    <JSONComponent index={i} callback={this.handlecallback} data={json[child]} depth={depth+1}/>
                    </div>
                </div>
            );
            })}
            </div>
        )
        return html;
    }
}
 