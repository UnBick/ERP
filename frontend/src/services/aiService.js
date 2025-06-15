const API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-base";

const verifyApiKey = () => {
  const apiKey = process.env.REACT_APP_HUGGINGFACE_API_KEY;
  if (!apiKey) {
    console.error('Missing Hugging Face API key in environment variables');
    throw new Error('API key not configured');
  }
  return apiKey;
};

export const generateQuestions = async (syllabusContent, bookContent, parameters) => {
  try {
    const apiKey = verifyApiKey();
    console.log('Attempting to generate questions with API key:', apiKey.substring(0, 4) + '...');

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        inputs: `Generate ${parameters.totalQuestions} ${parameters.difficulty} difficulty questions about: ${syllabusContent}`,
        parameters: {
          max_length: 512,
          temperature: 0.7,
          num_return_sequences: parameters.totalQuestions
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    return parseQuestions(result[0].generated_text);
  } catch (error) {
    console.error('Question Generation Error:', error);
    throw error;
  }
};

export const testConnection = async () => {
  try {
    verifyApiKey();
    // Add your connection test logic here
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const parseQuestions = (content) => {
  if (!content) return [];
  
  const questions = content.split('\n\n').map((q, index) => ({
    id: index + 1,
    content: q.trim(),
    type: q.toLowerCase().includes('options:') ? 'mcq' : 'descriptive',
    difficulty: 'medium',
    status: 'pending'
  }));

  return questions.filter(q => q.content.length > 0);
};
