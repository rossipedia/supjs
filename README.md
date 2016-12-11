# SupJS

My attempt at a simpler Scaffolder ("sup" being a typical response to "yo").

## Usage

``` js
const Sup = require('supjs');

const scaffold = {};
scaffold.files['package.json'] = Sup.template(`{
	"name": ${config => JSON.stringify(config.name)},
	"version": "0.0.1",
	"license": ${config => JSON.stringify(config.version)}
}`);

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



Sup.build({
  name: 'My App',
  license: 'MIT'
}, scaffold);
```