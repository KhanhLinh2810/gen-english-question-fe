export const hanldeError = (code, msgAuto) => {
  if (!code) return msgAuto ? msgAuto : "Lỗi không xác định";
  if (code === "no_more_turns") return "Bạn đã hết lượt làm bài";
  else if (code === "exam_not_found") return "Không tìm thấy đề thi";
  else if (code === "overdue_doing_exam") return "Đã qua thời gian làm bài";
  else if (code == "no_question_in_exam")
    return "Đề thi không hợp lệ do không có câu hỏi";

  return "Hệ thống đang gặp sự cố, vui lòng thử lại sau";
};
