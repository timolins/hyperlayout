
<img src="https://github.com/timolins/hyperlayout/raw/master/assets/header.png" width="320" >

> Layout presets for [Hyper.app](https://hyper.is)

[![Build Status](https://travis-ci.org/timolins/hyperlayout.svg?branch=master)](https://travis-ci.org/timolins/hyperlayout) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

<img src="https://github.com/timolins/hyperlayout/raw/master/assets/demo.gif" width="532" >




# Install

```sh
$ npm install -g hyperlayout hpm-cli
$ hpm install hyperlayout
```

# Usage
To get started, write [your layout](#define-a-layout) inside `.hyperlayout`.

If you already use a `package.json` file, you can add it there. (With with the `hyperlayout` key)

*Alternatively you can define [global layouts](#global-layouts) in `~/.hyperlayout`.*

> `.hyperlayout`
```json
[
  [
    "echo 'Hello'",
    "echo 'World'"
  ]
]
```

To apply the layout, simply run `hyperlayout` in the same directory.

```sh
$ hyperlayout
```
#### Result
![Demo 1](https://cdn.rawgit.com/timolins/hyperlayout/f84d20382116fde4866b46e18180a446dc94d1dd/assets/demo1.svg)

## Advanced example
This example shows the capabilities of `hyperlayout`. It demonstrates the usage inside `package.json` and how to define [multiple layouts](#multiple-layouts).

> `package.json`
```json
{
  "name": "my-example",
  "scripts": {
    "watch": "gulp watch",
    "serve": "nodemon build/index",
    "layout": "hyperlayout"
  },
  "hyperlayout": {
      "default": [
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
  },
  "devDependencies": {
    "nodemon": "latest",
    "gulp": "latest",
    "hyperlayout": "latest"
  }
}
```

Since there are two layouts defined here, you have to tell `hyperlayout` which one you want to use.

```sh
$ hyperlayout # Layout: default
```
```sh
$ hyperlayout helloworld # Layout: helloworld
```
```sh
$ npm run layout # Layout: default
```
#### Result
![Demo 2](https://cdn.rawgit.com/timolins/hyperlayout/f84d20382116fde4866b46e18180a446dc94d1dd/assets/demo2.svg)

# Examples
#### Tabs
![Example 1](https://cdn.rawgit.com/timolins/hyperlayout/f84d20382116fde4866b46e18180a446dc94d1dd/assets/example1.svg)
```json
["1", "2"]
```
---
#### Horizontal Panes
![Example 2](https://cdn.rawgit.com/timolins/hyperlayout/f84d20382116fde4866b46e18180a446dc94d1dd/assets/example2.svg)
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
![Example 3](https://cdn.rawgit.com/timolins/hyperlayout/f84d20382116fde4866b46e18180a446dc94d1dd/assets/example3.svg)
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

# Define a layout
There are two different ways to define a layout:

#### Array
The most basic way is to create a nested array with strings (commands) inside. The hierarchy looks like this:


```
Tabs
|-- Horizontal Panes
    |-- Vertical Panes
        |-- Horizontal Panes
            |-- Vertical Panes
                |-- ...
```


This is a example for a vertical split using this method:
```json
[
  [
    ["echo Hello", "echo World"]
  ]
]
```

#### Object
A layout object should contain the following key-value pairs:

* `entry: <String>` – *You can define at which level the layout begins. Either `tab`, `vertical` or `horizontal`. Default value is `tab`.*

* `layout: <Array>` – *A layout, as described above. The only difference is, that it respects the entry point. This can make the layout more readable.*


```json
{
  "entry": "vertical",
  "layout": [
    "echo Hello", "echo World"
  ]
}
```

# Multiple Layouts
As shown in the [Advanced Example](#advanced-example), it's possible to define multiple layouts in one project. Instead of supplying the [layout](#define-a-layout) directly, you define name for the layout first.

```json
{
  "default": {
    "entry": "vertical",
    "layout": ["echo Hello", "echo World"]
  },
  "otherlayout": ["echo Hyper", "echo Term"]
}
```

`hyperlayout` will look for the `default` layout, when there is no parameter. If there is one, it will apply the given layout.

```sh
$ hyperlayout [NAME]
```

# Global layouts
You can define global layouts inside `~/.hyperlayout`.

`hyperlayout` will use these layouts when there is no configuration in the current directory. It's possible to force global layouts with the following command:

```sh
$ hyperlayout global [NAME]
```
or
```sh
$ hyperlayout g [NAME]
```

# Known Issues
* It isn't possible layout multiple windows at once. If you know how to approach this feature, then head over to [Issue #2](https://github.com/timolins/hyperlayout/issues/2) and let me know!

# Author
`hyperlayout` is written by [Timo Lins](https://timo.sh).

_Special thanks to [Tobias Lins](https://github.com/tobiaslins), for coming up with some great solutions._
