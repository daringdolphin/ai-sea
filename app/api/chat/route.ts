export async function POST(req: Request) {
  try {
    const { userMessage, model } = await req.json();

    if (!userMessage) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Default to the 70B model if no model is specified
    const selectedModel = model || 'aisingapore/Llama-SEA-LION-v3.5-70B-R';

    const response = await fetch('https://api.sea-lion.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk-RlEIFVn_lnhDM0nmPTXXkg',
        'Content-Type': 'application/json',
        'accept': 'text/plain'
      },
      body: JSON.stringify({
        max_completion_tokens: 30000,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ],
        model: selectedModel
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response from model.';

    return Response.json({ reply });
  } catch (error) {
    console.error('API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}