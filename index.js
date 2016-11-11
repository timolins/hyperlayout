const DIRECTION = {
  HORIZONTAL: 'HORIZONTAL',
  VERTICAL: 'VERICAL'
}


exports.middleware = (store) => (next) => (action) => {
  if ('SESSION_ADD_DATA' === action.type) {
    const { data } = action;
    if (/(hyperlayout: command not found)|(command not found: hyperlayout)/.test(data)) {
      const {ui} = store.getState();
      window.rpc.emit('new', {
        splitDirection: DIRECTION.VERTICAL,
        cwd: ui.cwd
      })
    } else {
      next(action);
    }
  }
  next(action)
};
