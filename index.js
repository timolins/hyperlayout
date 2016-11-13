const DIRECTION = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERTICAL'
}

const example = [
  ['1', '3'],
  '2'
]

console.log(process.env.HOME)
function requestSplit(splitDirection, cwd) {
  window.rpc.emit('new', {
    splitDirection,
    cwd
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
    const pane = {pid: '', cmd: item, index: panes.length}
    panes.push(pane)
    return pane
  }

  console.log('Wrong type:', item)
}

const resolveArray = array => (
  array instanceof Array ? resolveArray(array[0]) : array
)

function generateQueue(converted, horizontal = true) {
  let q = []
  if (converted instanceof Array) {
    converted.forEach((item, i) => {
      if (i > 0) {
        q.push({
          action: 'split',
          direction: horizontal ? DIRECTION.HORIZONTAL : DIRECTION.VERTICAL,
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
      q = [...q, ...generateQueue(item, !horizontal)]
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
  if (queue.length > 0) {
    const item = queue.shift()
    const {index} = item.pane
    console.log(item, lastIndex)
    if (!panes[lastIndex].uid) {
      panes[lastIndex].uid = currentUid
    }
    lastIndex = index
    if (item.action === 'split') {
      requestSplit(item.direction)
    } else {
      const jumpTo = panes[index].uid
      if (jumpTo) {
        focusUid(store, jumpTo)
      }
      workQueue(store, currentUid)
    }
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
