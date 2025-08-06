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

    // o3 series models use max_completion_tokens instead of max_tokens
    const isO3Model = selectedModel.startsWith('o3');
    
    interface OpenAIRequestBody {
      model: string;
      messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
      }>;
      max_tokens?: number;
      max_completion_tokens?: number;
      temperature?: number;
    }
    
    const requestBody: OpenAIRequestBody = {
      model: selectedModel,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ],
    };

    if (isO3Model) {
      requestBody.max_completion_tokens = 4000;
    } else {
      requestBody.max_tokens = 4000;
      requestBody.temperature = 0.7;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
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