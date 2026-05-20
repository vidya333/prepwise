import axios from 'axios'

const PY_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

export const analyzePDFViaService = async (buffer: Buffer, filename: string) => {
  const FormData = require('form-data')
  const form = new FormData()
  form.append('file', buffer, { filename, contentType: 'application/pdf' })
  const { data } = await axios.post(`${PY_URL}/analyze/pdf`, form, {
    headers: form.getHeaders(), timeout: 60000
  })
  return data
}

export const analyzeTopicViaService = async (topic: string) => {
  const { data } = await axios.post(`${PY_URL}/analyze/topic`, { topic }, { timeout: 30000 })
  return data
}
