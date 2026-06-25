import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import './CommentSection.css';

function Comment({ comment, slug, onDelete, onUpdate }) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [replies, setReplies] = useState(comment.replies || []);
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const r = await api.post(`/posts/${slug}/comments`, { content: replyText, parent_id: comment.id });
      setReplies(prev => [...prev, r.data]);
      setReplyText('');
      setReplying(false);
    } catch {} finally { setSubmitting(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const r = await api.put(`/posts/${slug}/comments/${comment.id}`, { content: editText });
      onUpdate(comment.id, r.data.content);
      setEditing(false);
    } catch {}
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      await api.post(`/posts/${slug}/comments/${comment.id}/like`);
    } catch {}
  };

  const isOwner = user && user.id === comment.author_id;

  return (
    <div className="comment">
      <img src={comment.author_avatar} alt={comment.author_name} className="comment-avatar" />
      <div className="comment-body">
        <div className="comment-header">
          <Link to={`/author/${comment.author_name}`} className="comment-author">
            {comment.author_name}
          </Link>
          <span className="comment-time">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>

        {editing ? (
          <form className="edit-form" onSubmit={handleEdit}>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={3}
              className="comment-textarea"
            />
            <div className="edit-actions">
              <button type="submit" className="btn-save-comment">Save</button>
              <button type="button" className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <p className="comment-content">{comment.content}</p>
        )}

        <div className="comment-footer">
          <button className="comment-action" onClick={handleLike}>
            ♥ {comment.likes > 0 ? comment.likes : ''}
          </button>
          {user && (
            <button className="comment-action" onClick={() => setReplying(!replying)}>
              Reply
            </button>
          )}
          {isOwner && !editing && (
            <>
              <button className="comment-action" onClick={() => setEditing(true)}>Edit</button>
              <button className="comment-action danger" onClick={() => onDelete(comment.id)}>Delete</button>
            </>
          )}
        </div>

        {replying && (
          <form className="reply-form" onSubmit={handleReply}>
            <textarea
              placeholder="Write a reply…"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              rows={2}
              className="comment-textarea"
              autoFocus
            />
            <div className="edit-actions">
              <button type="submit" className="btn-save-comment" disabled={submitting}>
                {submitting ? 'Posting…' : 'Post reply'}
              </button>
              <button type="button" className="btn-cancel" onClick={() => setReplying(false)}>Cancel</button>
            </div>
          </form>
        )}

        {replies.length > 0 && (
          <div className="replies">
            {replies.map(reply => (
              <Comment
                key={reply.id}
                comment={reply}
                slug={slug}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ slug }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/posts/${slug}/comments`).then(r => setComments(r.data)).finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const r = await api.post(`/posts/${slug}/comments`, { content: newComment });
      setComments(prev => [r.data, ...prev]);
      setNewComment('');
    } catch {} finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/posts/${slug}/comments/${id}`);
      setComments(prev => prev.filter(c => c.id !== id));
    } catch {}
  };

  const handleUpdate = (id, newContent) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, content: newContent } : c));
  };

  return (
    <section className="comment-section">
      <h2 className="comments-title display">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h2>

      {user ? (
        <form className="new-comment-form" onSubmit={handleSubmit}>
          <img src={user.avatar} alt="" className="comment-avatar" />
          <div className="new-comment-body">
            <textarea
              placeholder="Share your thoughts…"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              rows={3}
              className="comment-textarea"
            />
            <div className="new-comment-footer">
              <span className="comment-chars">{newComment.length} chars</span>
              <button type="submit" className="btn-post-comment" disabled={submitting || !newComment.trim()}>
                {submitting ? 'Posting…' : 'Post comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="login-prompt">
          <Link to="/login" className="login-prompt-btn">Sign in to join the discussion →</Link>
        </div>
      )}

      {loading ? (
        <div className="comments-loading">
          {[1, 2].map(i => (
            <div key={i} className="comment-skeleton">
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 12, width: 120, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 14, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="no-comments">No comments yet. Be the first to share your thoughts!</div>
      ) : (
        <div className="comments-list">
          {comments.map(c => (
            <Comment key={c.id} comment={c} slug={slug} onDelete={handleDelete} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </section>
  );
}
