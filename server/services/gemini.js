const { GoogleGenerativeAI } = require('@google/generative-ai');

// Preparing tags
const suggestTags = async (ingredients, allTags) => {
    // Initialize inside the function so the key is read at call time not module load time
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    const tagNames = allTags.map(t => t.name).join(', ');
    const ingredientList = ingredients.join(', ');
    // Prompt for AI generation
    const prompt = `Please generate up to 6 tags you believe is appropriate for the following set of ingredients for a recipe. Keep the tags about 2 words in length. You may generate new tags or use already existing tags when appropriate. Ingredients: ${ingredientList}, Available tags: ${tagNames}. Your return format must be just like this for use in web app backend processing: ["tag1", "tag2"]`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Extract just the JSON array from whatever Gemini returns
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    return JSON.parse(match[0]);
};

// Exporting function
module.exports = { suggestTags };