import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt, dietaryPreference } = req.body

  if (!prompt) {
    return res.status(400).json({ reply: 'Please provide a question or request.' })
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/cypher-alpha:free',
        messages: [
          {
            role: 'system',
            content: `You are NutriPal, an expert AI nutritionist and chef. The user follows a ${dietaryPreference} diet. Provide detailed, personalized responses with:
- Clear meal suggestions
- Nutritional information (calories, macros)
- Grocery lists when appropriate
- Cooking instructions
- Friendly, encouraging tone`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'NutriPal Food Coach'
        },
        timeout: 20000
      }
    )

    const reply = response.data.choices[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.'
    return res.status(200).json({ reply })
  } catch (err: any) {
    console.error('AI Error:', err.response?.data || err.message)
    return res.status(500).json({ 
      reply: 'I encountered an issue processing your request. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
}