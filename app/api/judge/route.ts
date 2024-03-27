import OpenAI from 'openai'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
})

export async function POST(req: Request) {
  const { prompt } = await req.json()
  console.log('Prompt:', prompt)

  // Prepare the final prompt including the categories and the desired JSON output example
  const finalPrompt = `Categorize the following joke into one of these categories, which we will use to gauge the crowd's reaction: Funny, Neutral, Controversial, Sad, and Applause.

  Joke: "${prompt}"
 
  Use the following categories based on the punchline's content, humor, and potential impact. Your response should be in the form of a JSON object like this:

  {"category": "Neutral"}
  
  This should be the only response and no other text should be included in the output.`

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: false,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: finalPrompt }],
  })
  const judgement = response.choices[0].message.content

  return Response.json({ judgement })
}
