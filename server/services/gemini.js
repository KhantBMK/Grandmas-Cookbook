const { GoogleGenerativeAI } = require('@google/generative-ai');

// Establishing connection and selecting model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Preparing tags
const suggestTags = async (ingredients, allTags) => {
    const tagNames = allTags.map(t => t.name).join(', ');
    const ingredientList = ingredients.join(', ');
    // Prompt for AI generation
    const prompt = `Please generate up to 6 tags you believe is appropriate for the following set of ingredients for a recipe. Keep the tags about 2 words in length. You may generate new tags or use already existing tags when appropriate. Ingredients: ${ingredientList}, Available tags: ${tagNames}. Your return format must be just this: ["tag1", "tag2"]`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
};

// Exporting function
module.exports = { suggestTags };