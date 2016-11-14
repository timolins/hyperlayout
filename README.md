# hyperlayout
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

Layout presets for Hyper.app

## Install

```sh
$ npm install -g hyperlayout hpm-cli
$ hpm install hyperlayout
```

## Usage

`package.json`
```json
{
  "name": "my-example",
  "scripts": {
    "watch": "gulp watch",
    "serve": "nodemon build/index"
  },
  "hyperlayout": [
    "echo 'Hello'",
    "echo 'World'"
  ]
}
```

![Example 1](assets/example1.png)

`package.json`
```json
{
  "name": "my-example",
  "scripts": {
    "watch": "gulp watch",
    "serve": "nodemon build/index"
  },
  "hyperlayout": [
    [
      "npm run watch",
      ["npm run serve", "http://localhost:3000"]
    ],
    "mongod"
  ]
}
```
![Example 2](assets/example2.png)
