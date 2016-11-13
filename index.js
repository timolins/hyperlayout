const fs = require('fs')
const WebSocketServer = require('ws').Server

let hyperlayout

const example = [
  ['echo 1', 'http://timo.sh']
]

// Read json file

const readJson = (cwd, file) => JSON.parse(fs.readFileSync(`${cwd}/${file}`, 'utf8'))

// Get config file by reading `.hyperlayout` and `package.json`
const getConfig = cwd => {
  try {
    return readJson(cwd, '.hyperlayout')
  } catch (err) {
    console.log('No .hyperlayout found in directory')
  }
  try {
    const {hyperlayout} = readJson(cwd, 'package.json')
    console.log(readJson(cwd, 'package.json'))
    if (hyperlayout) {
      return hyperlayout
    }
  } catch (err) {
    console.log('No package.json found in directory')
  }
  return example
}

// Resolves an array, to find deepest cild. [[[1]]] -> 1
const resolveArray = a => a instanceof Array ? resolveArray(a[0]) : a

// Walk through modes – WINDOW -> TAB -> HORIZONTAL -> VERTICAL -> HORIZONTAL -> ...
const nextMode = mode => {
  switch (mode) {
    case 'TAB':
    case 'PANE':
    case 'VERTICAL':
      return 'HORIZONTAL'
    case 'HORIZONTAL':
      return 'VERTICAL'
    case 'WINDOW':
      return 'TAB'
    default:
      return 'WINDOW'
  }
}

// Generate Command queue from converted Config
function generateQueue(converted, mode = 'TAB') {
  let q = []
  if (converted instanceof Array) {
    converted.forEach((item, i) => {
      if (i > 0) {
        q.push({
          action: 'split',
          mode,
          pane: resolveArray(item)
        })
      } else {
        q.push({
          action: 'jump',
          pane: resolveArray(item)
        })
      }
    })
    converted.forEach(item => {
      q = [...q, ...generateQueue(item, nextMode(mode))]
    })
  }
  return q
}

// Hyperlayout instance
class Hyperlayout {
  constructor(cwd, store) {
    this.cwd = cwd
    this.store = store
    this.config = getConfig(cwd)
    this.panes = []
    this.lastIndex = 0
    console.log('config', this.config, cwd)
    const converted = this.convertConfig(this.config)

    this.queue = generateQueue(converted)
    this.work()
  }
  work() {
    const {sessions} = this.store.getState()
    const {lastIndex, cwd} = this
    const {activeUid} = sessions
    const pane = this.panes[lastIndex]
    if (this.queue.length > 0) {
      const item = this.queue.shift()
      const {index} = item.pane

      if (!pane.uid) {
        this.panes[lastIndex].uid = activeUid
        runCommand(activeUid, pane.cmd)
      }
      this.lastIndex = index
      if (item.action === 'split') {
        requestSession(cwd, item.mode)
      } else {
        const jumpTo = this.panes[index].uid
        if (jumpTo) {
          focusUid(this.store, jumpTo)
        }
        this.work()
      }
    } else if (lastIndex) {
      runCommand(activeUid, pane.cmd)
      this.lastIndex = 0
    }
  }
  convertConfig(item) {
    if (item instanceof Array) {
      return item.map(this.convertConfig.bind(this))
    } else if (typeof item === 'string') {
      const pane = {cmd: item, index: this.panes.length}
      this.panes.push(pane)
      return pane
    }
    console.error('Wrong type:', item)
  }
}

// Listen for commands
const listen = store => {
  const wss = new WebSocketServer({port: 7150})
  wss.on('connection', ws => {
    ws.on('message', cwd => {
      hyperlayout = new Hyperlayout(cwd, store)
    })
    ws.send('something')
  })
}

// Request new Session (Tab, Pane)
function requestSession(cwd, mode) {
  console.log('new', mode)
  const payload = {cwd}
  switch (mode) {
    case 'HORIZONTAL':
    case 'VERTICAL':
      payload.splitDirection = mode
      break
    default:
      break
  }
  window.rpc.emit('new', payload)
}

// Runs command in given `uid`
function runCommand(uid, cmd) {
  console.log('Running Command', uid, cmd)
  window.rpc.emit('data', {
    uid,
    data: ` ${cmd}\n`
  })
}

// Focuses given `uid` – useful for pane operations
function focusUid({dispatch}, uid) {
  dispatch({
    type: 'SESSION_SET_ACTIVE',
    uid
  })
}

// Listens for initial load and sessions
exports.middleware = store => next => action => {
  const {type} = action
  if (type === 'CONFIG_LOAD') {
    listen(store)
  }
  if (type === 'SESSION_SET_PROCESS_TITLE' && hyperlayout) {
    hyperlayout.work()
  }
  next(action)
}
