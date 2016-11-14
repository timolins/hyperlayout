
<img src="https://github.com/timolins/hyperlayout/raw/master/assets/header.png" width="320" >

> Layout presets for [Hyper.app](https://hyper.is)


[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
# Install

```sh
$ npm install -g hyperlayout hpm-cli
$ hpm install hyperlayout
```

# Usage
To get started, setup a layout inside of `package.json`.

_Alternatively you can define it inside of `.hyperlayout` or `~/.hyperlayout`._

> `package.json`
```json
{
  "name": "example-1",
  "hyperlayout": [
    [
      "echo 'Hello'",
      "echo 'World'"
    ]
  ]
}
```

To apply the layout, simply run `hyperlayout` in the same directory.

```sh
$ hyperlayout
```
#### Result
![Demo 1](https://cdn.rawgit.com/timolins/hyperlayout/master/assets/demo1.svg)


## Advanced example
This example shows the capabilities of `hyperlayout`.

> `package.json`
```json
{
  "name": "example-2",
  "scripts": {
    "watch": "gulp watch",
    "serve": "nodemon build/index"
  },
  "hyperlayout": {
      "start": [
        [[
          "npm run watch",
          ["npm run serve", "http://localhost:3000"]
        ]],
        "mongod"
      ],
      "helloworld": {
        "entry": "horizontal",
        "layout": [
          "echo 'Hello'",
          "echo 'World'"
        ]
      }
  }
}
```

Since there are two layouts defined here, you have to tell `hyperlayout` which one you want to use, by suppling it as parameter.

```sh
$ hyperlayout start
```
#### Result
![Demo 2](https://cdn.rawgit.com/timolins/hyperlayout/master/assets/demo2.svg)

# Examples
#### Tabs
![Example 1](https://cdn.rawgit.com/timolins/hyperlayout/master/assets/example1.svg)
```json
["1", "2"]
```
---
#### Horizontal Panes
![Example 2](https://cdn.rawgit.com/timolins/hyperlayout/master/assets/example2.svg)
```json
[["1", "2"]]
```
or
```json
{
  "entry": "horizontal",
  "layout": ["1", "2"]
}
```
---
#### Vertical Panes
![Example 3](https://cdn.rawgit.com/timolins/hyperlayout/master/assets/example3.svg)
```json
[[["1", "2"]]]
```
or
```json
{
  "entry": "vertical",
  "layout": ["1", "2"]
}
```

# Known Issues
* It isn't possible layout multiple windows at once. If you know how to approach this feature, then head over to [Issue #2](https://github.com/timolins/hyperlayout/issues/2) and let me know!

# Author
`hyperlayout`  was written by [Timo Lins](https://timo.sh).
