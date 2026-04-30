const Annotation = require('../models/Annotation');
const { GoogleGenAI } = require('@google/genai');

let ai;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Global variable to hold the dynamic system prompt (In production, store this in MongoDB)
let currentSystemPrompt = `Analyze the following text and categorize it into one of these domains: 'Bug', 'Feature', 'Urgent', 'Question', 'Feedback', or 'General'. Provide your response in valid JSON format including 'label' and 'reasoning' fields. Do not include markdown formatting.\n\nText:`;


exports.createAnnotation = async (req, res) => {
  try {
    const { text_input } = req.body;
    
    // 1. Generate a local mock prediction first as a safe fallback
    let ai_prediction = { label: "General", reasoning: "No specific domain keywords detected. (Local Mock)" };
    const lowerText = text_input.toLowerCase();
    
    if (lowerText.includes('crash') || lowerText.includes('bug') || lowerText.includes('broken') || lowerText.includes('error')) {
      ai_prediction = { label: "Bug", reasoning: "Detected keywords indicating a software failure or malfunction. (Local Mock)" };
    } else if (lowerText.includes('add') || lowerText.includes('feature') || lowerText.includes('would be amazing') || lowerText.includes('integration')) {
      ai_prediction = { label: "Feature", reasoning: "User is requesting new functionality or enhancements. (Local Mock)" };
    } else if (lowerText.includes('down') || lowerText.includes('immediately') || lowerText.includes('vulnerability')) {
      ai_prediction = { label: "Urgent", reasoning: "Contains critical keywords requiring immediate attention. (Local Mock)" };
    } else if (lowerText.includes('how do i') || lowerText.includes('does your') || lowerText.includes('can you')) {
      ai_prediction = { label: "Question", reasoning: "Phrased as an inquiry or seeking assistance. (Local Mock)" };
    } else if (lowerText.includes('love') || lowerText.includes('great') || lowerText.includes('feedback')) {
      ai_prediction = { label: "Feedback", reasoning: "Contains sentiment expressing an opinion or review. (Local Mock)" };
    }

    // 2. Attempt to use the real Gemini API if the key is present
    if (ai) {
      const prompt = `${currentSystemPrompt} "${text_input}"`;
      
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash', // Reverting to 2.0-flash which your key supports
          contents: prompt,
        });
        const text = response.text;
        
        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const resultText = jsonMatch ? jsonMatch[0] : text;
        
        const parsed = JSON.parse(resultText);
        ai_prediction = {
          label: parsed.label,
          reasoning: parsed.reasoning
        };
      } catch (e) {
        console.error("Gemini API Error:", e.status, e.message);
        // API failed (e.g. 429 Rate Limit). We gracefully fallback to our local prediction.
        ai_prediction.reasoning += " [Notice: API Unavailable. Using offline fallback mode.]";
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

    // RLHF Logic: Calculate accuracy
    const isMatch = annotation.ai_prediction.label.toLowerCase() === label.toLowerCase();
    const accuracy_score = isMatch ? 1 : 0;

    annotation.human_correction = {
      label,
      verified: true
    };
    annotation.accuracy_score = accuracy_score;

    await annotation.save();
    res.status(200).json(annotation);
  } catch (error) {
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
        model: 'gemini-2.0-flash',
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
