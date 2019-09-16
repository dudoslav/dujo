export const DEV = process.env.NODE_ENV !== 'production'

export const SERVER_PORT = 9000
export const WS_PROTO = DEV ? 'ws' : 'wss'
