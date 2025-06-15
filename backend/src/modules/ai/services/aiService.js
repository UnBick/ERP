const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

class AIService {
  async generateQuestions(syllabusContent, bookContent, parameters) {
    try {
      const prompt = this.buildPrompt(syllabusContent, bookContent, parameters);
      const response = await openai.createCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      });

      return this.parseResponse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Question Generation Error:', error);
      throw new Error('Failed to generate questions');
    }
  }

  buildPrompt(syllabusContent, bookContent, parameters) {
    return `Generate ${parameters.totalQuestions} ${parameters.difficulty} level questions about ${parameters.topic} 
    including ${parameters.questionTypes.join(', ')} questions.
    Use this syllabus content: ${syllabusContent}
    And this book content: ${bookContent}`;
  }

  parseResponse(content) {
    // Parse the AI response into structured question format
    // Implementation depends on the expected response format
    return JSON.parse(content);
  }
}

module.exports = new AIService();
