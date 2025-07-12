import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify API key exists
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OpenRouter API key is missing')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Log the incoming request for debugging
    console.log('Request body:', req.body)

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      req.body,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': req.headers.origin || 'http://localhost:3000',
          'X-Title': 'Mindfulness App'
        },
        timeout: 15000
      }
    )

    // Log successful response for debugging
    console.log('OpenRouter response:', response.data)
    
    return res.status(200).json(response.data)
  } catch (error: any) {
    console.error('API Error Details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      stack: error.stack
    })

    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || 
            error.message || 
            'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}