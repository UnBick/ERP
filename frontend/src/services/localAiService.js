import * as tf from '@tensorflow/tfjs';
import { load } from '@tensorflow-models/qna';

let model = null;

const initModel = async () => {
  if (!model) {
    model = await load();
  }
  return model;
};

export const generateQuestions = async (content, parameters) => {
  try {
    const model = await initModel();
    const questions = await model.findAnswers(content, parameters.totalQuestions);
    
    return questions.map((q, index) => ({
      id: index + 1,
      content: q.text,
      type: 'descriptive',
      difficulty: parameters.difficulty,
      status: 'pending'
    }));
  } catch (error) {
    console.error('Local AI Error:', error);
    return [];
  }
};
