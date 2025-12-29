import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, filename } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ faces: [], message: 'AI not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing image for face detection:', filename);

    // Use Lovable AI to detect faces in the image
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image and detect all human faces. For each face found, provide bounding box coordinates for ONLY the facial features area (eyes, nose, and mouth) - DO NOT include the forehead, hair, ears, or chin area.

The region should start just above the eyebrows and end just below the lips. It should only cover the central facial features, not the full face oval.

Return ONLY a valid JSON object with this exact structure, no other text:
{
  "faces": [
    {"x": number, "y": number, "width": number, "height": number}
  ]
}

Where x,y is the top-left corner of the facial features region (eyes to mouth area only), and width,height are the dimensions.
All values should be percentages (0-100) of the image size.
The height should typically be about 40-50% of a full face height since we're only covering eyes to mouth.
If no faces are detected, return: {"faces": []}`
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ faces: [], message: 'AI processing failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');
    
    const content = data.choices?.[0]?.message?.content || '';
    console.log('AI content:', content);

    // Parse the JSON response from the AI
    try {
      // Extract JSON from the response (handle markdown code blocks)
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
      
      const parsed = JSON.parse(jsonStr);
      const faces = parsed.faces || [];
      
      console.log('Detected faces:', faces.length);
      
      return new Response(
        JSON.stringify({ faces }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ faces: [], message: 'Could not parse face detection result' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in blur-faces function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, faces: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});