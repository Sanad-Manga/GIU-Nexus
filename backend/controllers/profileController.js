const hf = require("../services/hfService");
const User = require("../models/User");

// POST /api/v1/profile/extract-skills
// Job Seeker only
exports.extractSkills = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Return 400 if bio is empty
    if (!user.bio || user.bio.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Bio is empty. Update your profile first.",
      });
    }

    try {
      // Call HuggingFace NER model
      const result = await hf.tokenClassification({
        model: "dslim/bert-base-NER",
        inputs: user.bio,
      });

      // Filter for relevant entity groups only
      // HF API returns "ORG"/"MISC" (aggregated) or "B-ORG"/"B-MISC" (non-aggregated)
      const filtered = result.filter((entity) => {
        const tag = entity.entity_group || entity.entity || "";
        return ["B-MISC", "I-MISC", "B-ORG", "MISC", "ORG"].includes(tag);
      });

      // Map to words and deduplicate
      const cleaned = [...new Set(filtered.map((e) => e.word))];

      // Save to user profile
      user.skills = cleaned;
      await user.save();

      return res.status(200).json({
        success: true,
        skills: cleaned,
        extracted: cleaned,
      });

    } catch (hfError) {
      // Graceful fallback — return existing skills unchanged
      console.error("HuggingFace NER error:", hfError);
      return res.status(200).json({
        success: true,
        skills: user.skills,
        extracted: user.skills,
      });
    }

  } catch (err) {
    next(err);
  }
};