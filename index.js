const {exec} = require('child-process-promise')

const example = [
  'echo 1',
  ['echo 2', ['echo 4', 'echo 5']],
  ['echo 3', 'echo 6']
]

// const example = [
//   ['echo 1'], ['echo 1', 'echo 2']
// ]

const getCwd = pid => exec(`lsof -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`)

function requestSession(cwdPid, mode) {
  getCwd(cwdPid)
  .then(cwd => {
    cwd = cwd.stdout.trim()
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
  })
  .catch(err => {
    console.error(`Couldn't get cwd`, err)
  })
}

function runCommand(uid, cmd) {
  window.rpc.emit('data', {
    uid,
    data: ` ${cmd}\n`
  })
}

function focusUid({dispatch}, uid) {
  dispatch({
    type: 'SESSION_SET_ACTIVE',
    uid
  })
}

const panes = []

const convertConfig = item => {
  if (item instanceof Array) {
    return item.map(convertConfig)
  } else if (typeof item === 'string') {
    const pane = {cmd: item, index: panes.length}
    panes.push(pane)
    return pane
  }

  console.log('Wrong type:', item)
}

const resolveArray = array => (
  array instanceof Array ? resolveArray(array[0]) : array
)

const nextMod = mode => {
  switch (mode) {
    case 'TAB':
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
      q = [...q, ...generateQueue(item, nextMod(mode))]
    })
  }
  return q
}

const isCommand = ({data, type}) => (
  type === 'SESSION_ADD_DATA' ?
    /(hyperlayout: command not found)|(command not found: hyperlayout)/.test(data) :
    false
)

let queue = []
let lastIndex = 0

const workQueue = (store, currentUid) => {
  const {sessions} = store.getState()
  const currentSession = sessions.sessions[currentUid]
  if (queue.length > 0) {
    const item = queue.shift()
    const {index} = item.pane
    if (!panes[lastIndex].uid) {
      panes[lastIndex].uid = currentUid
      runCommand(currentUid, panes[lastIndex].cmd)
    }
    lastIndex = index
    if (item.action === 'split') {
      requestSession(currentSession.pid, item.mode)
    } else {
      const jumpTo = panes[index].uid
      if (jumpTo) {
        focusUid(store, jumpTo)
      }
      workQueue(store, currentUid)
    }
  } else if (lastIndex) {
    runCommand(currentUid, panes[lastIndex].cmd)
    lastIndex = 0
  }
}

let firstUid
exports.middleware = store => next => action => {
  const {uid, type} = action
  if (type === 'SESSION_SET_PROCESS_TITLE') {
    firstUid = firstUid || uid
    workQueue(store, uid)
  }
  if (isCommand(action)) {
    queue = generateQueue(convertConfig(example))
    workQueue(store, uid || firstUid)
  }
  next(action)
}
