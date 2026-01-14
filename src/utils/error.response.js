const hanldeError = (code, msgAuto) => {
  if (!code && !msgAuto) return "Lỗi không xác định";
  else if (msgAuto) return msgAuto;

  if (code === "no_more_turns") return "Bạn đã hết lượt làm bài";
  else if (code === "exam_not_found") return "Không tìm thấy đề thi";
  else if (code === "overdue_doing_exam") {
    return "Đã quá thời gian làm bài";
  }
};
