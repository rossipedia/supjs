import Sup from './index';
import * as path from 'path';
import * as fs from 'fs';

import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';

interface Config {
    name: string;
    version: string;
    license: string;
}

const sup = new Sup<any>();

sup.define('package.json', sup.template
`{
    "name": ${config => JSON.stringify(config.name)},
    "version": ${config => JSON.stringify(config.version)},
    "license": ${config => JSON.stringify(config.license)},
    "scripts": {
        "start": "webpack-dev-server --content-base dist/"
    }
}`);

sup.define('tsconfig.json', `{
    "compilerOptions": {
        "module": "commonjs",
        "target": "ES5",
        "noImplicitAny": false,
        "sourceMap": false,        
        "strictNullChecks": true,
        "jsx": "react"
    }
}`)

sup.define('src/index.tsx', 
`import * as React from 'react';
import { render } from 'react-dom';

class App extends React.Component<any,any> {
    render() {
      return <div>Hello, World!</div>;
    }
}

render(
    <App />,
    document.getElementById('app')
)`);

sup.define('webpack.config.js', sup.template
`const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['', '.js', '.ts', '.tsx']
    },
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: 'ts'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: ${config => JSON.stringify(config.name)},
            template: 'src/index.html'
        })
    ]
};`);

sup.define('src/index.html', sup.template
`<!doctype html>
<html>
    <head>
        <title>${config => config.name}</title>
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
`)

sup.install(
    'react',
    'react-dom'
)

sup.installDev(
    'typescript',
    'webpack',
    'ts-loader',
    'webpack-dev-server',
    'html-webpack-plugin'
)

const outdir = path.resolve(__dirname, '..', 'testdir');
console.log(outdir);

const config = {
    outdir,
    config: {
        name: 'my-app',
        license: 'MIT',
        version: "1.0.0"
    }
};

//rimraf(outdir, () => {
    mkdirp(outdir, () => sup.build(config));
//});
