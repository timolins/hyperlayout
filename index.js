const DIRECTION = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERICAL'
}

function requestSplit(splitDirection, cwd) {
  window.rpc.emit('new', {
    splitDirection,
    cwd
  })
}

exports.middleware = store => next => action => {
  if (action.type === 'SESSION_ADD_DATA') {
    const {data} = action
    if (/(hyperlayout: command not found)|(command not found: hyperlayout)/.test(data)) {
      const {ui} = store.getState()
      requestSplit(DIRECTION.VERICAL, ui.cwd)
    }
  }
  next(action)
}
