import { apiCaller } from "./apiCaller";

// Get list of ratings (supports query params)
export const getRatings = async (params = {}) => {
  try {
    const response = await apiCaller.get("/user/ratings", { params });
    return response.data;
  } catch (error) {
    console.error("Error getting ratings:", error);
    throw error;
  }
};

// Get a specific rating by user and question
export const getRatingDetail = async (userId, questionId) => {
  try {
    const response = await apiCaller.get(`/user/ratings/${userId}/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting rating detail:", error);
    throw error;
  }
};

// Create a rating
export const createRating = async (ratingData) => {
  try {
    const response = await apiCaller.post("/user/ratings", ratingData);
    return response.data;
  } catch (error) {
    console.error("Error creating rating:", error);
    throw error;
  }
};

// Update a rating by user and question
export const updateRating = async (userId, questionId, ratingData) => {
  try {
    const response = await apiCaller.put(
      `/user/ratings/${userId}/${questionId}`,
      ratingData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating rating:", error);
    throw error;
  }
};

// Delete ratings for a question (router shows delete('/:question_id'))
export const deleteRatingByQuestion = async (questionId) => {
  try {
    const response = await apiCaller.delete(`/user/ratings/${questionId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting rating:", error);
    throw error;
  }
};

export default {
  getRatings,
  getRatingDetail,
  createRating,
  updateRating,
  deleteRatingByQuestion,
};
