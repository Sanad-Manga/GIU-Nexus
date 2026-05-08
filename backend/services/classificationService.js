const CANDIDATE_LABELS = ['Frontend', 'Backend', 'AI/ML', 'DevOps', 'Data Engineering', 'Other'];

async function classifyJobCategory(description) {
  try {
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/facebook/bart-large-mnli',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: description,
          parameters: { candidate_labels: CANDIDATE_LABELS },
        }),
      }
    );

    const text = await response.text();
    console.log('[HF RAW RESPONSE]', text); // <-- shows what HF actually returns
    
   const data = JSON.parse(text);
if (!Array.isArray(data) || !data.length) throw new Error('No labels returned');
return data[0].label; // highest-scoring label is first
  } catch (err) {
    console.error('[classifyJobCategory] HF call failed:', err.message);
    return 'Other';
  }
}

module.exports = { classifyJobCategory };
