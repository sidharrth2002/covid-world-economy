import React, { Component } from 'react';
import { Runtime, Inspector } from '@observablehq/runtime';
import notebook from "@sidharrth2002/nested-treemap";

class NestedTreemap extends Component {
    animationRef = React.createRef();

    componentDidMount() {
      const runtime = new Runtime();
      runtime.module(notebook, name => {
        // if (name === "animation") {
          return new Inspector(this.animationRef.current);
        // }
      });
    }

    render() {
      return (
        <div className="container">
          <div ref={this.animationRef}></div>
        </div>
      );
    }
}

export default NestedTreemap;