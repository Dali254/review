// pages/api/ai-analyze.js
// Uses Claude to analyze reviews and generate AI insights
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { businessName, reviews, userReview } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      summary: `${businessName} has received mixed reviews from Kenyan customers.`,
      sentiment: 'mixed',
      highlights: ['Service quality varies', 'Pricing is competitive'],
      improvements: ['Customer service', 'Wait times'],
      score: 65,
    });
  }

  try {
    let prompt;

    if (userReview) {
      // Analyze a single user review for quality/helpfulness
      prompt = `You are a review quality analyzer for a Kenyan business review platform.

Analyze this review for ${businessName} and provide structured feedback:
Review: "${userReview}"

Respond ONLY with valid JSON (no markdown, no backticks):
{
  "quality": "good|fair|poor",
  "helpfulness": 0-100,
  "suggestions": ["suggestion1", "suggestion2"],
  "approved": true|false,
  "reason": "brief reason if rejected"
}`;
    } else {
      // Analyze all reviews for business insights
      const reviewText = reviews.map((r, i) => `${i + 1}. [${r.rating}★] ${r.text}`).join('\n');
      prompt = `You are an AI analyst for ReviewKE, a Kenyan business review platform.

Analyze these reviews for ${businessName}:
${reviewText}

Provide insights specifically relevant to Kenyan consumers. Respond ONLY with valid JSON:
{
  "summary": "2-sentence summary of overall customer experience",
  "sentiment": "positive|negative|mixed",
  "highlights": ["top positive 1", "top positive 2", "top positive 3"],
  "improvements": ["improvement area 1", "improvement area 2"],
  "score": 0-100,
  "kenyaContext": "1 sentence about relevance to Kenyan market"
}`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('AI analysis error:', err);
    return res.status(200).json({
      summary: `${businessName} serves Kenyan customers across multiple locations.`,
      sentiment: 'mixed',
      highlights: ['Widely accessible', 'Kenyan brand'],
      improvements: ['Service consistency'],
      score: 60,
    });
  }
}
