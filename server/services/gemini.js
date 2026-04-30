const Groq = require('groq-sdk');

const suggestTags = async (ingredients, allTags) => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const tagNames = allTags.map(t => t.name).join(', ');
    const ingredientList = ingredients.join(', ');

    const prompt = `Please generate up to 6 tags you believe is appropriate for the following set of ingredients for a recipe. Keep the tags about 2 words in length. You may generate new tags or use already existing tags when appropriate. Ingredients: ${ingredientList}, Available tags: ${tagNames}. Your return format must be just like this for use in web app backend processing: ["tag1", "tag2"]`;

    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
    });

    const text = completion.choices[0].message.content.trim();
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    return JSON.parse(match[0]);
};

module.exports = { suggestTags };
