import React, { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { getComments, createComment, type CommentsEntity } from '../../../../services/commentsApi';
import { formatDistanceToNow } from 'date-fns';

interface TaskCommentsTabProps {
  task: any;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  timestamp: string;
  text: string;
  replies: Comment[];
}

export function TaskCommentsTab({ task }: TaskCommentsTabProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Transform API comment to UI format
  const transformComment = (apiComment: CommentsEntity): Comment => {
    const initials = apiComment.creator.fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return {
      id: apiComment.id,
      author: apiComment.creator.fullName,
      avatar: initials,
      timestamp: formatDistanceToNow(new Date(apiComment.createdAt), { addSuffix: true }),
      text: apiComment.text,
      replies: apiComment.reply ? [transformComment(apiComment.reply)] : [],
    };
  };

  // Load comments
  useEffect(() => {
    if (!task?.id) return;

    async function loadComments() {
      try {
        setLoading(true);
        const apiComments = await getComments('task', task.id);
        // Group comments and replies
        const mainComments = apiComments.filter(c => !c.reply);
        const transformed = mainComments.map(transformComment);
        setComments(transformed);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoading(false);
      }
    }

    loadComments();
  }, [task?.id]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !task?.id || submitting) return;

    try {
      setSubmitting(true);
      await createComment('task', {
        entityId: task.id,
        text: newComment.trim(),
      });
      setNewComment('');
      
      // Reload comments
      const apiComments = await getComments('task', task.id);
      const mainComments = apiComments.filter(c => !c.reply);
      const transformed = mainComments.map(transformComment);
      setComments(transformed);
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Failed to create comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '100%' }}>
      {comments.length === 0 ? (
        // Empty State
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '60px',
          paddingBottom: '40px'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '16px',
            opacity: 0.3
          }}>
            💬
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#0A0A0A',
            marginBottom: '8px'
          }}>
            No comments yet
          </div>
          <div style={{
            fontSize: '15px',
            color: '#9CA3AF'
          }}>
            Start a conversation with your team
          </div>
        </div>
      ) : (
        // Comments Thread
        <div style={{ marginBottom: '24px' }}>
          {comments.map((comment) => (
            <div key={comment.id}>
              {/* Parent Comment */}
              <div style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '16px'
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#8B5CF6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'white'
                    }}>
                      {comment.avatar}
                    </div>
                    <div>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#0A0A0A',
                        marginRight: '8px'
                      }}>
                        {comment.author}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        color: '#9CA3AF'
                      }}>
                        {comment.timestamp}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    opacity: 0.6
                  }}>
                    <button style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '13px',
                      color: '#6B7280',
                      cursor: 'pointer'
                    }}>
                      Edit
                    </button>
                    <button style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '13px',
                      color: '#6B7280',
                      cursor: 'pointer'
                    }}>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div style={{
                  fontSize: '15px',
                  color: '#0A0A0A',
                  lineHeight: '1.6',
                  marginBottom: '12px'
                }}>
                  {comment.text}
                </div>

                {/* Footer */}
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#6B7280',
                  cursor: 'pointer',
                  transition: 'color 150ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#3B82F6'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                >
                  Reply
                </button>
              </div>

              {/* Nested Replies */}
              {comment.replies && comment.replies.map((reply) => (
                <div
                  key={reply.id}
                  style={{
                    marginLeft: '52px',
                    marginBottom: '16px',
                    position: 'relative'
                  }}
                >
                  {/* Connection Line */}
                  <div style={{
                    position: 'absolute',
                    left: '-26px',
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    background: '#E5E7EB'
                  }} />

                  <div style={{
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    padding: '20px'
                  }}>
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'white'
                        }}>
                          {reply.avatar}
                        </div>
                        <div>
                          <span style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#0A0A0A',
                            marginRight: '8px'
                          }}>
                            {reply.author}
                          </span>
                          <span style={{
                            fontSize: '14px',
                            color: '#9CA3AF'
                          }}>
                            {reply.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{
                      fontSize: '15px',
                      color: '#0A0A0A',
                      lineHeight: '1.6',
                      marginBottom: '12px'
                    }}>
                      {reply.text}
                    </div>

                    {/* Footer */}
                    <button style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#6B7280',
                      cursor: 'pointer',
                      transition: 'color 150ms ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#3B82F6'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Comment Input */}
      <div style={{
        position: 'relative',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        background: 'white'
      }}>
        <textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '16px',
            paddingBottom: '60px',
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            color: '#0A0A0A',
            fontFamily: 'inherit',
            resize: 'vertical',
            borderRadius: '8px'
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!newComment.trim() || submitting}
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            width: '44px',
            height: '44px',
            borderRadius: '22px',
            background: newComment.trim() ? '#3B82F6' : '#D1D5DB',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: newComment.trim() ? 'pointer' : 'not-allowed',
            boxShadow: newComment.trim() ? '0 2px 8px rgba(59,130,246,0.3)' : 'none',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={(e) => {
            if (newComment.trim()) {
              e.currentTarget.style.background = '#2563EB';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (newComment.trim()) {
              e.currentTarget.style.background = '#3B82F6';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.3)';
            }
          }}
        >
          <Send size={20} color="white" />
        </button>
      </div>
    </div>
  );
}
