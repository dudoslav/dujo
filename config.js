export const DEV = process.env.NODE_ENV !== 'production'

export const LOCAL_UI_PORT = 9000
export const LOCAL_WS_PORT = 9001
export const REMOTE_UI_PORT = DEV ? LOCAL_UI_PORT : 80
export const REMOTE_WS_PORT = LOCAL_WS_PORT

export const HOST = DEV ? '127.0.0.1' : 'dudo.cool'

