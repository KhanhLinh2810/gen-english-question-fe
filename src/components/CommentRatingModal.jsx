import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import {
  getCommentsByQuestionId,
  addCommentToQuestion,
} from "../api/commentApi";
import {
  getRatings,
  getRatingDetail,
  createRating,
  updateRating,
} from "../api/ratingApi";
import { StarIcon as SolidStar } from "@heroicons/react/24/solid";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { StarIcon as OutlineStar } from "@heroicons/react/24/outline";

const CommentRatingModal = ({ isOpen, onClose, question }) => {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [visible, setVisible] = useState(false);

  const [ratings, setRatings] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [userRating, setUserRating] = useState(null); // { rating: number }
  const [savingRating, setSavingRating] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    if (isOpen && question) {
      fetchComments();
      fetchRatings();
      fetchUserRating();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, question]);

  // Trigger enter animation when mounted/opened
  useEffect(() => {
    if (isOpen) {
      // small delay to allow mount then animate
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  const fetchComments = async () => {
    if (!question) return;
    try {
      setLoadingComments(true);
      const res = await getCommentsByQuestionId(question.id);
      if (res && res.code === "SUCCESS") {
        setComments(res.data.rows || []);
      } else if (Array.isArray(res)) {
        setComments(res);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải bình luận");
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchRatings = async () => {
    if (!question) return;
    try {
      const res = await getRatings({ question_id: question.id });
      // res likely { code, data }
      let list = [];
      // Support server response shape: { code, data: { count, rows } }
      if (res && res.code === "SUCCESS") {
        if (res.data && Array.isArray(res.data.rows)) {
          list = res.data.rows;
          setRatingsCount(res.data.count || list.length);
        } else if (Array.isArray(res.data)) {
          list = res.data;
          setRatingsCount(list.length);
        } else {
          list = res.data || [];
          setRatingsCount(Array.isArray(list) ? list.length : 0);
        }
      } else if (Array.isArray(res)) {
        list = res;
        setRatingsCount(list.length);
      }

      setRatings(list);
      if (list.length > 0) {
        const sum = list.reduce(
          (s, r) => s + (r.rating_value || r.rating || 0),
          0
        );
        setAvgRating(sum / (list.length || 1));
      } else {
        setAvgRating(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // compute breakdown counts for 1..5 stars
  const breakdown = [0, 0, 0, 0, 0];
  if (Array.isArray(ratings) && ratings.length > 0) {
    ratings.forEach((r) => {
      const v = r?.rating_value || r?.rating || r?.value || 0;
      if (v >= 1 && v <= 5) breakdown[v - 1]++;
    });
  }

  const fetchUserRating = async () => {
    if (!question || !currentUser) return;
    try {
      const res = await getRatingDetail(currentUser.id, question.id);
      if (res && res.code === "SUCCESS") {
        if (res.data) {
          if (Array.isArray(res.data.rows) && res.data.rows.length > 0) {
            setUserRating(res.data.rows[0]);
          } else if (Array.isArray(res.data) && res.data.length > 0) {
            setUserRating(res.data[0]);
          } else if (typeof res.data === "object") {
            setUserRating(res.data);
          } else {
            setUserRating(null);
          }
        } else {
          setUserRating(null);
        }
      } else {
        setUserRating(null);
      }
    } catch (err) {
      // 404 or not found - treat as no rating
      setUserRating(null);
    }
  };

  // Format relative time in Vietnamese, fallback to dd/mm/yy after 30 days
  const formatRelative = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    const days = Math.floor(diff / 86400);
    if (days < 30) return `${days} ngày trước`;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  const closeWithAnimation = () => {
    setVisible(false);
    // wait for animation to finish then call parent's onClose
    setTimeout(() => {
      onClose && onClose();
    }, 200);
  };

  const handlePostComment = async () => {
    if (!newComment || !question) return;
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }
    try {
      setPostingComment(true);
      const res = await addCommentToQuestion(question.id, {
        content: newComment,
      });
      if (res && res.code === "SUCCESS") {
        setNewComment("");
        fetchComments();
      } else {
        toast.error("Không thể thêm bình luận");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi gửi bình luận");
    } finally {
      setPostingComment(false);
    }
  };

  const handleSetRating = async (value) => {
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để đánh giá");
      return;
    }

    try {
      setSavingRating(true);
      const hasRatingId = userRating && (userRating.rating_id || userRating.id);
      if (hasRatingId) {
        // update existing
        const res = await updateRating(currentUser.id, question.id, {
          rating_value: value,
        });
        if (res && res.code === "SUCCESS") {
          fetchRatings();
          fetchUserRating();
        }
      } else {
        const res = await createRating({
          question_id: question.id,
          rating_value: value,
        });
        if (res && res.code === "SUCCESS") {
          fetchRatings();
          fetchUserRating();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể lưu đánh giá");
    } finally {
      setSavingRating(false);
    }
  };

  if (!isOpen && !visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeWithAnimation}
      />

      <div
        className={`relative bg-white text-black w-full max-w-4xl max-h-[90vh] overflow-auto rounded-lg shadow-lg p-6 transition-all duration-200 transform ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <button
          onClick={closeWithAnimation}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </button>

        {/* Question header */}
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-black mb-1">
            Bình luận & Đánh giá câu hỏi
          </h2>
          {question && (
            <div className="mt-2 p-4 bg-gray-50 rounded">
              <div className="text-black font-medium mb-2">
                {question.content}
              </div>
              {question.description && (
                <div className="text-sm text-black mb-2">
                  {question.description}
                </div>
              )}
              {/* choices if exist */}
              {question.choices && question.choices.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {question.choices.map((c, i) => (
                    <div key={c.id} className="text-sm text-black">
                      <span className="font-semibold mr-2">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span>{c.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Comments list */}
          <div className="md:col-span-2">
            <div className="mb-3 font-medium">
              Bình luận ({comments.length})
            </div>
            <div className="space-y-3">
              {loadingComments ? (
                <div className="text-black">Đang tải...</div>
              ) : comments.length === 0 ? (
                <div className="text-sm text-black">Chưa có bình luận nào.</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-black">
                      {c.user && c.user.username
                        ? c.user.username.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <div className="bg-gray-100 rounded-xl p-3 flex-1 text-black">
                      <div className="text-sm font-medium">
                        {c.user?.username || "Người dùng"}
                      </div>
                      <div className="text-sm">{c.content}</div>
                      <div className="text-xs mt-1">
                        {formatRelative(c.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add comment (compact) */}
            <div className="mt-3">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150 p-2 flex items-center gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!postingComment && newComment.trim()) {
                        handlePostComment();
                      }
                    }
                  }}
                  rows={2}
                  placeholder="Viết bình luận..."
                  className="flex-1 resize-none bg-transparent placeholder-gray-400 text-black text-sm focus:outline-none py-1"
                />

                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">
                    {postingComment ? "Đang gửi..." : ""}
                  </div>
                  <button
                    onClick={handlePostComment}
                    disabled={postingComment || !newComment.trim()}
                    aria-label="Gửi bình luận"
                    title="Gửi"
                    className="inline-flex items-center justify-center p-1 text-[#2D3E83] hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Ratings */}
          <div className="md:col-span-1">
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-black">Đánh giá trung bình</div>
              <div className="flex items-center gap-3 mt-2 mb-3">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const val = i + 1;
                    const prev = i; // previous whole star count
                    const diff = avgRating - prev; // how much of this star is filled

                    // Determine fill percent according to thresholds:
                    // diff <= 0.2 => 0, 0.3-0.7 => 50, >=0.8 => 100
                    let fill = 0;
                    if (avgRating >= val) {
                      fill = 100;
                    } else if (diff >= 0.8) {
                      fill = 100;
                    } else if (diff >= 0.3 && diff <= 0.7) {
                      fill = 50;
                    } else {
                      fill = 0;
                    }

                    return (
                      <span
                        key={`avg-star-${i}`}
                        className="relative inline-flex mr-1 items-center justify-center w-5 h-5"
                      >
                        {/* base outline star positioned to fill the wrapper */}
                        <OutlineStar className="absolute inset-0 w-5 h-5 text-gray-300 block m-auto" />
                        {/* overlay solid star clipped by fill percent; solid star also positioned to fill wrapper so both align */}
                        {fill > 0 && (
                          <span
                            className="absolute left-0 top-0 h-full overflow-hidden"
                            style={{ width: `${fill}%` }}
                          >
                            <SolidStar className="absolute inset-0 w-5 h-5 text-yellow-400 block m-auto" />
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
                <div className="text-lg font-semibold">
                  {avgRating ? avgRating.toFixed(1) : "0.0"}
                </div>
              </div>

              <div className="text-sm text-black mb-3">
                {ratingsCount} lượt đánh giá
              </div>

              <div className="text-sm font-medium mb-2">Bạn đánh giá</div>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => {
                  const val = i + 1;
                  const ratingValue =
                    userRating?.rating_value ??
                    userRating?.rating ??
                    userRating;
                  const active = (ratingValue || 0) >= val;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSetRating(val)}
                      disabled={savingRating}
                      className="p-1 rounded hover:bg-gray-100"
                      title={`${val} sao`}
                    >
                      {active ? (
                        <SolidStar className="w-6 h-6 text-yellow-400" />
                      ) : (
                        <OutlineStar className="w-6 h-6 text-gray-300" />
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Breakdown per star */}
              <div className="mt-4">
                {([5, 4, 3, 2, 1] || []).map((star) => {
                  const cnt = breakdown[star - 1] || 0;
                  const pct =
                    ratingsCount > 0
                      ? Math.round((cnt / ratingsCount) * 100)
                      : 0;
                  return (
                    <div
                      key={star}
                      className="flex items-center gap-2 mb-2 text-black"
                    >
                      <div className="w-10 text-sm">{star} sao</div>
                      <div className="flex-1 bg-gray-200 h-2 rounded overflow-hidden">
                        <div
                          className="h-2 bg-yellow-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-8 text-right text-sm">{cnt}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentRatingModal;
