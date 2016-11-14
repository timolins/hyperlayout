
<img src="assets/header.png" width="320" >

> Layout presets for [Hyper.app](https://hyper.is)


[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
## Install

```sh
$ npm install -g hyperlayout hpm-cli
$ hpm install hyperlayout
```

## Usage
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
![Demo 1](assets/demo1.svg)

---

### Advanced example
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
![Demo 2](assets/demo2.svg)

## Examples
![Example 1](assets/example1.svg) **Tabs**
```json
["1", "2"]
```
---
![Example 2](assets/example2.svg) **Horizontal Panes**
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
![Example 3](assets/example3.svg) **Vertical Panes**
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

## License
`hyperlayout` was written by [Timo Lins](https://timo.sh).
