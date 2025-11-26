import { apiCaller } from './apiCaller.js';

// Get exams list
export const getExams = async (params = {}) => {
  try {
    const response = await apiCaller.get('/user/exams', { params });
    return response.data;
  } catch (error) {
    console.error('Error getting exams:', error);
    throw error;
  }
};

// Get exam detail
export const getExamDetail = async (examId) => {
  try {
    const response = await apiCaller.get(`/user/exams/${examId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting exam detail:', error);
    throw error;
  }
};

// Create exam
export const createExam = async (examData) => {
  try {
    const response = await apiCaller.post('/user/exams', examData);
    return response.data;
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

// Update exam
export const updateExam = async (examId, examData) => {
  try {
    const response = await apiCaller.put(`/user/exams/${examId}`, examData);
    return response.data;
  } catch (error) {
    console.error('Error updating exam:', error);
    throw error;
  }
};

// Delete exam
export const deleteExam = async (examId) => {
  try {
    const response = await apiCaller.delete(`/user/exams/${examId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting exam:', error);
    throw error;
  }
};
