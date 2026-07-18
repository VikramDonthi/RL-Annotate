const Annotation = require('../models/Annotation');
const Rule = require('../models/Rule');
const { GoogleGenAI } = require('@google/genai');

let ai;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Global variable to hold the dynamic system prompt (In production, store this in MongoDB)
let currentSystemPrompt = `Analyze the following text and categorize it into one of these domains: 'Bug', 'Feature', 'Urgent', 'Question', 'Feedback', or 'General'. Provide your response in valid JSON format including 'label' and 'reasoning' fields. Do not include markdown formatting.\n\nText:`;

const defaultRules = [
  { label: 'Bug', keywords: ['crash', 'bug', 'broken', 'error', 'fail', 'freeze', 'issue', 'not responding', 'not working'] },
  { label: 'Feature', keywords: ['add', 'feature', 'would be amazing', 'integration', 'request', 'new button', 'support for'] },
  { label: 'Urgent', keywords: ['down', 'immediately', 'vulnerability', 'critical', 'emergency', 'blocker', 'broken production'] },
  { label: 'Question', keywords: ['how do i', 'does your', 'can you', 'question', 'help', 'what is'] },
  { label: 'Feedback', keywords: ['love', 'great', 'feedback', 'opinion', 'suggestion', 'idea'] },
  { label: 'General', keywords: [] }
];

async function seedDefaultRules() {
  try {
    const count = await Rule.countDocuments();
    if (count === 0) {
      await Rule.insertMany(defaultRules);
      console.log('✅ Default local classification rules seeded in database.');
    }
  } catch (err) {
    console.error('Error seeding default rules:', err);
  }
}


exports.createAnnotation = async (req, res) => {
  try {
    const { text_input } = req.body;
    
    // Seed rules lazily if not done
    await seedDefaultRules();

    // 1. Attempt local keyword matching
    const rules = await Rule.find();
    const lowerText = text_input.toLowerCase();
    let localMatch = null;
    let matchedKeyword = "";

    // Scan each rule (except General) to find any matching keyword
    for (const rule of rules) {
      if (rule.label === 'General') continue;
      for (const keyword of rule.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          localMatch = rule.label;
          matchedKeyword = keyword;
          break; // Stop on first keyword match
        }
      }
      if (localMatch) break;
    }

    let ai_prediction = { label: "General", reasoning: "No specific domain keywords detected. (Local Mock)" };

    if (localMatch) {
      // Local match found! Skip Gemini API call
      ai_prediction = {
        label: localMatch,
        reasoning: `Classified locally via keyword match: '${matchedKeyword}' (Local Classifier)`
      };
    } else {
      // 2. Fallback to Gemini API if no local rule matches
      if (ai) {
        const prompt = `${currentSystemPrompt} "${text_input}"`;
        
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-flash-latest', // Switched to 1.5 Flash alias for active free tier support
            contents: prompt,
          });
          const text = response.text;
          
          // Robust JSON extraction
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          const resultText = jsonMatch ? jsonMatch[0] : text;
          
          const parsed = JSON.parse(resultText);
          ai_prediction = {
            label: parsed.label,
            reasoning: `[AI Classifier] ${parsed.reasoning}`
          };
        } catch (e) {
          console.error("Gemini API Error:", e.status, e.message);
          // API failed (e.g. 429 Rate Limit). We gracefully fallback to our local prediction.
          ai_prediction.reasoning += " [Notice: API Unavailable. Using offline fallback mode.]";
        }
      }
    }

    const annotation = new Annotation({
      text_input,
      ai_prediction
    });

    await annotation.save();
    res.status(201).json(annotation);
  } catch (error) {
    console.error("Error creating annotation:", error);
    res.status(500).json({ error: 'Server error while categorizing text.' });
  }
};

exports.getAnnotations = async (req, res) => {
  try {
    const annotations = await Annotation.find().sort({ timestamp: -1 });
    res.status(200).json(annotations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch annotations' });
  }
};

exports.verifyAnnotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { label } = req.body; // human corrected label

    const annotation = await Annotation.findById(id);
    if (!annotation) {
      return res.status(404).json({ error: 'Annotation not found' });
    }

    const originalLabel = annotation.ai_prediction.label;
    const isMatch = originalLabel.toLowerCase() === label.toLowerCase();
    const accuracy_score = isMatch ? 1 : 0;

    annotation.human_correction = {
      label,
      verified: true
    };
    annotation.accuracy_score = accuracy_score;

    await annotation.save();

    let learnedKeyword = null;

    // RLHF Logic: Learn new local rules from corrections
    if (!isMatch && ai) {
      const metaAgentPrompt = `
The text classification system received this input:
"${annotation.text_input}"

The system classified it as "${originalLabel}", but the human supervisor corrected it to "${label}".

Analyze the input text and suggest a single, concise keyword or short phrase (1-3 words) present in the text that uniquely identifies it as belonging to the "${label}" category. 
This keyword will be added to our local pattern matcher to classify similar text locally in the future.

Rules:
1. The keyword/phrase MUST be exactly present in the input text (case-insensitive).
2. It should be highly specific to the "${label}" category.
3. Return ONLY the keyword/phrase. Do not include quotes, markdown formatting, explanation, or punctuation.
4. If no specific keyword can be extracted, return 'NONE'.
`.trim();

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: metaAgentPrompt,
        });
        const extracted = response.text.trim().replace(/['"`]/g, "");

        if (extracted && extracted !== 'NONE' && extracted.toLowerCase() !== 'none') {
          if (annotation.text_input.toLowerCase().includes(extracted.toLowerCase())) {
            const rule = await Rule.findOne({ label });
            if (rule && !rule.keywords.map(k => k.toLowerCase()).includes(extracted.toLowerCase())) {
              rule.keywords.push(extracted);
              await rule.save();
              learnedKeyword = extracted;
              console.log(`💡 Local Rule Learned: Added keyword '${extracted}' to '${label}'`);
            }
          }
        }
      } catch (err) {
        console.error("Meta-Agent rule learning error:", err);
      }
    }

    res.status(200).json({
      annotation,
      learnedKeyword
    });
  } catch (error) {
    console.error("Error verifying annotation:", error);
    res.status(500).json({ error: 'Failed to verify annotation' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Annotation.countDocuments();
    const verified = await Annotation.countDocuments({ 'human_correction.verified': true });
    
    // Calculate accuracy percentage
    const accurateAnnotations = await Annotation.countDocuments({ accuracy_score: 1 });
    const accuracyPercentage = verified > 0 ? ((accurateAnnotations / verified) * 100).toFixed(1) : 0;

    res.status(200).json({
      total_processed: total,
      pending_reviews: total - verified,
      ai_accuracy: `${accuracyPercentage}%`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

exports.optimizePrompt = async (req, res) => {
  try {
    if (!ai) {
      return res.status(400).json({ error: 'AI API Key is missing. Cannot optimize prompt.' });
    }

    // Find mistakes (where human verified it but accuracy_score is 0)
    const mistakes = await Annotation.find({ 'human_correction.verified': true, accuracy_score: 0 }).limit(10);
    
    if (mistakes.length === 0) {
      return res.status(200).json({ suggested_prompt: "No mistakes found to optimize from! The current prompt is working perfectly." });
    }

    let examplesText = mistakes.map(m => 
      `Input: "${m.text_input}"\nAI Guessed: ${m.ai_prediction.label}\nCorrect Label: ${m.human_correction.label}`
    ).join("\n\n");

    const optimizationPrompt = `
You are an expert Prompt Engineer. Your task is to improve the following system prompt to prevent the AI from making mistakes.

CURRENT PROMPT:
${currentSystemPrompt}

RECENT MISTAKES THE AI MADE:
${examplesText}

Write a NEW, improved system prompt. The prompt MUST still instruct the AI to output valid JSON with 'label' and 'reasoning'. It must categorize into 'Bug', 'Feature', 'Urgent', 'Question', 'Feedback', or 'General'. Use the mistakes to add specific edge-case instructions to the prompt so the AI doesn't fail again.
Return ONLY the new prompt text. Do not use markdown blocks like \`\`\`.
    `.trim();

    let newPromptText = "";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: optimizationPrompt,
      });
      newPromptText = response.text.trim();
    } catch (apiError) {
      console.error("Gemini API Error during optimization. Using mock optimization fallback.");
      newPromptText = `Analyze the following text and categorize it into one of these domains: 'Bug', 'Feature', 'Urgent', 'Question', 'Feedback', or 'General'. Provide your response in valid JSON format including 'label' and 'reasoning' fields. Do not include markdown formatting.\n\nCRITICAL NEW RULE BASED ON PAST MISTAKES:\nPay very close attention to user sentiment. If the text mentions "not sure", "cancel", or "renew", it MUST be categorized as 'Feedback'.\n\nText:`;
    }
    
    res.status(200).json({ suggested_prompt: newPromptText });
  } catch (error) {
    console.error("Error optimizing prompt:", error);
    res.status(500).json({ error: 'Failed to optimize prompt' });
  }
};

exports.updatePrompt = async (req, res) => {
  try {
    const { new_prompt } = req.body;
    if (!new_prompt) return res.status(400).json({ error: 'No prompt provided' });
    
    currentSystemPrompt = new_prompt;
    res.status(200).json({ message: 'System prompt updated successfully', currentSystemPrompt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update prompt' });
  }
};
