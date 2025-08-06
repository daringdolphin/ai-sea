export async function POST(req: Request) {
  try {
    const { userMessage, model } = await req.json();

    if (!userMessage) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
    }

    const selectedModel = model || 'gpt-4o';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return Response.json({ 
        error: `OpenAI API error: ${data.error?.message || 'Unknown error'}`,
        details: data 
      }, { status: response.status });
    }
    
    const reply = data.choices?.[0]?.message?.content || 'No response from model.';

    return Response.json({ reply });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}