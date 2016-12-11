import * as Sup from './index';
import * as path from 'path';
import * as fs from 'fs';

import Scaffold = Sup.Scaffold;

const scaffold: Scaffold = {
    files: {},
    outdir: path.resolve(__dirname, '..', 'testdir')
};

scaffold.files['package.json'] = Sup.template`{
    "name": ${config => JSON.stringify(config.name)},
    "version": "0.0.1",
    "license": ${config => JSON.stringify(config.version)},
    "scripts": {
        "start": "webpack-dev-server"
    },
    "devDependencies": {
        "webpack-dev-server": "latest",
        "webpack": "latest"
    }
}`;

scaffold.files['pub/index.html'] = Sup.template`
<!doctype html>
<head>
    <title>${config => config.name}</title>
</head>
<body>
    <div id="app"></div>
    <script src="bundle.js"></script>
</body>`;

scaffold.files['src/index.js'] = Sup.template`
import React from 'react';
import { render } from 'react-dom';

class App extends React.Component {
    render() {
      return <div>Hello, World!</div>;
    }
}

render(
    <App />,
    document.getElementById('')
)`;

scaffold.installDev = [
    "webpack",
    "webpack-dev-server"
];

scaffold.install = [
    "react",
    "react-dom"
];

Sup.build({
  name: 'my-app',
  license: 'MIT',
  version: "1.0.0"
}, scaffold);