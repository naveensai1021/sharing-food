"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/AuthContext";
import apiClient from "@/services/apiClient";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Flag, 
  Trash2, 
  Send, 
  Image as ImageIcon, 
  MapPin, 
  Tag, 
  Sparkles,
  Building2,
  ShieldCheck,
  User as UserIcon,
  X,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface CommentItem {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userRole?: string;
  userAvatarUrl?: string;
  content: string;
  createdAt: string;
}

interface PostItem {
  id: string;
  authorUserId: string;
  authorName: string;
  authorRole?: string;
  authorAvatarUrl?: string;
  organizationId?: string;
  organizationName?: string;
  donationId?: string;
  content: string;
  city?: string;
  tags?: string;
  likesCount: number;
  commentsCount: number;
  hasLiked: boolean;
  imageUrls: string[];
  createdAt: string;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Post Form
  const [newContent, setNewContent] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Active Comments Drawer
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>({});
  const [commentInput, setCommentInput] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Report Modal
  const [reportingPost, setReportingPost] = useState<PostItem | null>(null);
  const [reportReason, setReportReason] = useState("INAPPROPRIATE_CONTENT");
  const [reportDescription, setReportDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>("/posts?size=30");
      setPosts(res.data.content || []);
    } catch (err: any) {
      toast.error("Failed to load community feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }

    try {
      setSubmitting(true);
      const payload: any = {
        content: newContent.trim(),
        city: newCity.trim() || undefined,
        tags: newTags.trim() || undefined,
        imageUrls: newImageUrl.trim() ? [newImageUrl.trim()] : []
      };

      const res = await apiClient.post<PostItem>("/posts", payload);
      setPosts([res.data, ...posts]);
      setNewContent("");
      setNewCity("");
      setNewTags("");
      setNewImageUrl("");
      setShowImageInput(false);
      toast.success("Story shared with the community!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }

    try {
      const res = await apiClient.post<any>(`/posts/${postId}/like`);
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, likesCount: res.data.likesCount, hasLiked: res.data.hasLiked }
            : p
        )
      );
    } catch (err) {
      toast.error("Failed to update like");
    }
  };

  const handleOpenComments = async (postId: string) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }

    setActiveCommentsPostId(postId);
    if (!commentsMap[postId]) {
      try {
        const res = await apiClient.get<CommentItem[]>(`/posts/${postId}/comments`);
        setCommentsMap(prev => ({ ...prev, [postId]: res.data }));
      } catch (err) {
        toast.error("Failed to load comments");
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!commentInput.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await apiClient.post<CommentItem>(`/posts/${postId}/comments`, {
        content: commentInput.trim()
      });

      setCommentsMap(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data]
      }));

      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
        )
      );

      setCommentInput("");
    } catch (err: any) {
      toast.error("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await apiClient.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success("Post removed");
    } catch (err: any) {
      toast.error("Failed to delete post");
    }
  };

  const handleSubmitReport = async () => {
    if (!reportingPost) return;

    try {
      setSubmittingReport(true);
      await apiClient.post("/posts/report", {
        targetType: "POST",
        targetId: reportingPost.id,
        reason: reportReason,
        description: reportDescription.trim() || undefined
      });
      toast.success("Report submitted. Our moderation team will review this promptly.");
      setReportingPost(null);
      setReportDescription("");
    } catch (err: any) {
      toast.error("Failed to submit report");
    } finally {
      setSubmittingReport(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;
    switch (role) {
      case "ROLE_SUPPLIER":
        return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">Food Supplier</span>;
      case "ROLE_BENEFICIARY":
        return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">Beneficiary</span>;
      case "ROLE_VOLUNTEER":
        return <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-800">Volunteer</span>;
      case "ROLE_ADMIN":
        return <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">App Admin</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 p-6 text-white shadow-md border border-emerald-900/30">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold tracking-wider uppercase mb-1.5">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Community Wall</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Sharing Food, Spreading Love
          </h1>
          <p className="mt-1 text-sm sm:text-base text-emerald-100 max-w-2xl leading-relaxed">
            Read inspiring stories of surplus meals rescued, smiles delivered, and communities nourished across our network.
          </p>
        </div>

        {/* Post Composer */}
        {user ? (
          <div className="mb-8 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <form onSubmit={handleCreatePost}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-800">
                  {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    rows={3}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Share a food rescue story, thank-you note, or impact milestone..."
                    className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />

                  {showImageInput && (
                    <div className="mt-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 bg-slate-50/50">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="City (optional)"
                        className="bg-transparent focus:outline-none w-full"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 bg-slate-50/50">
                      <Tag className="h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                        placeholder="Tags, e.g. #MealsSaved #Donation"
                        className="bg-transparent focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowImageInput(!showImageInput)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary-700"
                    >
                      <ImageIcon className="h-4 w-4 text-primary-600" />
                      <span>{showImageInput ? "Remove Photo URL" : "Add Photo URL"}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || !newContent.trim()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-800 disabled:opacity-50 transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{submitting ? "Sharing..." : "Post Story"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <p className="text-sm text-slate-600 mb-3">
              Join the movement to share stories, photos, and gratitude from the front lines of food rescue.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-800"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-3 text-sm text-slate-500">Loading community stories...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No stories yet</h3>
            <p className="text-sm text-slate-500 mt-1">Be the first to share an inspiring update!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const isAuthor = user?.id === post.authorUserId;
              const isAdmin = user?.roles?.includes("ROLE_ADMIN");

              return (
                <article
                  key={post.id}
                  className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between p-5 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 border border-primary-100 font-bold text-primary-800">
                        {post.authorAvatarUrl ? (
                          <img
                            src={post.authorAvatarUrl}
                            alt={post.authorName}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          post.authorName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{post.authorName}</span>
                          {getRoleBadge(post.authorRole)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          {post.organizationName && (
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <Building2 className="h-3 w-3 text-slate-400" />
                              {post.organizationName}
                            </span>
                          )}
                          {post.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {post.city}
                            </span>
                          )}
                          <span>•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-1">
                      {user && (
                        <button
                          onClick={() => setReportingPost(post)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Report misuse"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                      )}
                      {(isAuthor || isAdmin) && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-5 py-2">
                    <p className="text-slate-800 text-sm sm:text-base whitespace-pre-line leading-relaxed">
                      {post.content}
                    </p>

                    {post.tags && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.tags.split(" ").map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Images */}
                  {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className="mt-3 bg-slate-100">
                      {post.imageUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Post attachment"
                          className="max-h-96 w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Post Footer / Reactions */}
                  <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-slate-600 text-xs font-semibold">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`inline-flex items-center gap-1.5 transition-colors ${
                          post.hasLiked ? "text-rose-600 font-bold" : "hover:text-rose-600"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${post.hasLiked ? "fill-current" : ""}`} />
                        <span>{post.likesCount} {post.likesCount === 1 ? "Like" : "Likes"}</span>
                      </button>

                      <button
                        onClick={() => handleOpenComments(post.id)}
                        className="inline-flex items-center gap-1.5 hover:text-primary-700 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.commentsCount} {post.commentsCount === 1 ? "Comment" : "Comments"}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.href);
                        toast.success("Link copied to clipboard!");
                      }}
                      className="inline-flex items-center gap-1 hover:text-slate-900"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments Drawer */}
                  {activeCommentsPostId === post.id && (
                    <div className="border-t border-slate-100 bg-slate-50/70 p-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Comments
                      </h4>

                      {/* Comment Input */}
                      {user ? (
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddComment(post.id);
                            }}
                            placeholder="Write an encouraging comment..."
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs focus:border-primary-500 focus:outline-none"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={submittingComment || !commentInput.trim()}
                            className="rounded-xl bg-primary-700 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-800 disabled:opacity-50"
                          >
                            Reply
                          </button>
                        </div>
                      ) : (
                        <div className="mb-4 text-xs text-slate-500">
                          <Link href="/login" className="font-semibold text-primary-700 hover:underline">
                            Sign in
                          </Link>{" "}
                          to join the conversation.
                        </div>
                      )}

                      {/* Comment List */}
                      <div className="space-y-2.5">
                        {(commentsMap[post.id] || []).length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No comments yet. Leave the first warm word!</p>
                        ) : (
                          commentsMap[post.id].map((c) => (
                            <div key={c.id} className="flex items-start gap-2.5 rounded-xl bg-white p-3 border border-slate-100 shadow-2xs">
                              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-800">
                                {c.userName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900">{c.userName}</span>
                                  {getRoleBadge(c.userRole)}
                                  <span className="text-[10px] text-slate-400 ml-auto">
                                    {new Date(c.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 mt-1">{c.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* Report Modal */}
        {reportingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-rose-600 font-bold">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Report Post</span>
                </div>
                <button
                  onClick={() => setReportingPost(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-600">
                  Help us keep the community safe. Reports are promptly reviewed by App Admins.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                  >
                    <option value="INAPPROPRIATE_CONTENT">Inappropriate or Offensive Content</option>
                    <option value="SPAM">Spam or Irrelevant Ads</option>
                    <option value="FALSE_INFORMATION">Misleading or False Information</option>
                    <option value="FOOD_SAFETY_CONCERN">Food Safety Concern</option>
                    <option value="HARASSMENT">Harassment or Abuse</option>
                    <option value="OTHER">Other Reason</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Details (Optional)</label>
                  <textarea
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Provide additional context for the administrator..."
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportingPost(null)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={submittingReport}
                  className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {submittingReport ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
