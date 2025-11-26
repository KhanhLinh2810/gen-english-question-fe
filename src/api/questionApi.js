import { apiCaller } from './apiCaller.js';

// Get questions list
export const getQuestions = async (params = {}) => {
  try {
    const response = await apiCaller.get('/user/questions', { params });
    return response.data;
  } catch (error) {
    console.error('Error getting questions:', error);
    throw error;
  }
};

// Get question detail
export const getQuestionDetail = async (questionId) => {
  try {
    const response = await apiCaller.get(`/user/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting question detail:', error);
    throw error;
  }
};

// Create manual questions
export const createQuestions = async (questionsData) => {
  try {
    const response = await apiCaller.post('/user/questions', questionsData);
    return response.data;
  } catch (error) {
    console.error('Error creating questions:', error);
    throw error;
  }
};

// Update question
export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await apiCaller.put(`/user/questions/${questionId}`, questionData);
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

// Delete question
export const deleteQuestion = async (questionId) => {
  try {
    const response = await apiCaller.delete(`/user/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};
