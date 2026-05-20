import axios from 'axios'

const GO_URL = process.env.GO_SERVICE_URL || 'http://localhost:9000'

export const getMCQsFromGoService = async (topic: string, count: number) => {
  const { data } = await axios.get(`${GO_URL}/mcq?topic=${encodeURIComponent(topic)}&count=${count}`, { timeout: 10000 })
  return data
}
