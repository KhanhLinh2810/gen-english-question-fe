import { apiCaller } from "./apiCaller";

// Get comments for a specific question
export const getCommentsByQuestionId = async (questionId) => {
  try {
    const response = await apiCaller.get("/user/comments", {
      params: { question_id: questionId },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting comments:", error);
    throw error;
  }
};

// Add a new comment to a specific question
export const addCommentToQuestion = async (questionId, commentData) => {
  try {
    const response = await apiCaller.post("/user/comments", {
        question_id: questionId,
        ...commentData,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Delete a comment by its ID
export const deleteComment = async (commentId) => {
  try {
    const response = await apiCaller.delete(`/user/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// Update a comment by its ID
export const updateComment = async (commentId, commentData) => {
  try {
    const response = await apiCaller.put(`/user/comments/${commentId}`, commentData);
    return response.data;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};
