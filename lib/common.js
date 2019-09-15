export const r_id = () => Math.random().toString(16).slice(4)
export const c_msg = (type, data) => JSON.stringify({ type, data })

