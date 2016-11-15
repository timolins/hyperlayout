let hyperlayout

// Resolves an array, to find deepest cild. [[[1]]] -> 1
const resolveArray = a => a instanceof Array ? resolveArray(a[0]) : a

// Walk through modes – WINDOW -> TAB -> HORIZONTAL -> VERTICAL -> HORIZONTAL -> ...
const nextMode = mode => {
  switch (mode) {
    case 'TAB':
    case 'VERTICAL':
      return 'HORIZONTAL'
    case 'PANE':
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
  mode = (mode === 'PANE') ? 'HORIZONTAL' : mode

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
  constructor({config, cwd}, store) {
    this.cwd = cwd
    this.store = store
    this.panes = []
    this.lastIndex = 0

    const converted = this.convertConfig(config.layout)
    const entry = (config.entry || 'tab').toUpperCase()

    this.queue = generateQueue(converted, entry)
    this.work()
  }
  work() {
    const {sessions} = this.store.getState()
    const {lastIndex, cwd} = this
    const {activeUid} = sessions
    const pane = this.panes[lastIndex]

    this.initUid = this.initUid || activeUid

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
    } else if (lastIndex && this.initUid) {
      runCommand(activeUid, pane.cmd)
      this.lastIndex = 0
    } else if (this.initUid) {
      focusUid(this.store, this.initUid)
      this.initUid = false
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

// Request new Session (Tab, Pane)
function requestSession(cwd, mode) {
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
let lastUid
exports.middleware = store => next => action => {
  const {type, data} = action
  const {sessions} = store.getState()
  const {activeUid} = sessions

  // Check for hyperlayout config
  if (type === 'SESSION_ADD_DATA') {
    const testedData = /^\[hyperlayout config]:(.*)/.exec(data)
    if (testedData && testedData[1]) {
      const config = JSON.parse(testedData[1])
      hyperlayout = new Hyperlayout(config, store)
      return
    }
  }

  // Check for new sessions
  if (type === 'SESSION_SET_PROCESS_TITLE' && hyperlayout) {
    if (lastUid !== activeUid) {
      hyperlayout.work()
    }
    lastUid = activeUid
  }
  next(action)
}
