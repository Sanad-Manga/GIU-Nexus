const hf = require('./hfService');

const CANDIDATE_LABELS = ['Frontend', 'Backend', 'AI/ML', 'DevOps', 'Data Engineering', 'Other'];

async function classifyJobCategory(description) {
  try {
    const result = await hf.zeroShotClassification({
      model: 'facebook/bart-large-mnli',
      inputs: [description],
      parameters: { candidate_labels: CANDIDATE_LABELS },
    });
    return result[0].labels[0];
  } catch (err) {
    console.error('[classifyJobCategory] HF call failed:', err.message);
    return 'Other';
  }
}

module.exports = { classifyJobCategory };
