import { apiCaller } from "./apiCaller.js";

// Create exam attempt (start exam)
export const createExamAttempt = async (examId) => {
  try {
    const response = await apiCaller.post("/user/exam-attempts", {
      exam_id: examId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating exam attempt:", error);
    throw error;
  }
};

// Get exam attempt detail (for taking exam)
export const getExamAttemptDetail = async (attemptId) => {
  try {
    const response = await apiCaller.get(
      `/user/exam-attempts/${attemptId}/exams`,
    );
    return response.data;
  } catch (error) {
    console.error("Error getting exam attempt detail:", error);
    throw error;
  }
};

// Get exam attempt result (after submit)
export const getExamAttemptResult = async (attemptId) => {
  try {
    const response = await apiCaller.get(`/user/exam-attempts/${attemptId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting exam attempt result:", error);
    throw error;
  }
};

// Save answer during exam
export const saveAnswer = async (attemptId, answers) => {
  try {
    const response = await apiCaller.post(
      `/user/exam-attempts/${attemptId}/answer`,
      {
        list_answer: answers,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error saving answer:", error);
    throw error;
  }
};

// Submit exam
export const submitExam = async (attemptId, answers) => {
  try {
    const response = await apiCaller.post(
      `/user/exam-attempts/${attemptId}/submit`,
      {
        list_answer: answers,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting exam:", error);
    throw error;
  }
};

// Get list of exam attempts
export const getExamAttempts = async (params = {}) => {
  try {
    const response = await apiCaller.get("/user/exam-attempts", { params });
    return response.data;
  } catch (error) {
    console.error("Error getting exam attempts:", error);
    throw error;
  }
};

export const exportExcelExamAttempts = async (params = {}) => {
  try {
    const response = await apiCaller.get("/user/exam-attempts/excel", {
      params,
      responseType: "blob",
    }); // Tạo một URL tạm thời cho file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Đặt tên file (nên khớp với tên từ phía Backend gửi về)
    const fileName = `Bao_Cao_Ket_Qua_${new Date().getTime()}.xlsx`;
    link.setAttribute("download", fileName);

    // Kích hoạt click để tải về
    document.body.appendChild(link);
    link.click();

    // Dọn dẹp bộ nhớ
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

    return response.data;
  } catch (error) {
    console.error("Error getting exam attempts:", error);
    throw error;
  }
};

// Delete exam attempt
export const deleteExamAttempt = async (attemptId) => {
  try {
    const response = await apiCaller.delete(`/user/exam-attempts/${attemptId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting exam attempt:", error);
    throw error;
  }
};
