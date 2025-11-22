import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface TaskCommentsTabProps {
  task: any;
}

const mockComments = [
  {
    id: 1,
    author: 'Charlie Day',
    avatar: 'CD',
    timestamp: '2 hours ago',
    text: 'Client approved milestone 3',
    replies: [
      {
        id: 2,
        author: 'Bob Ross',
        avatar: 'BR',
        timestamp: '1 hour ago',
        text: "Great news! I'll update the timeline."
      }
    ]
  }
];

export function TaskCommentsTab({ task }: TaskCommentsTabProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(mockComments);

  const handleSubmit = () => {
    if (newComment.trim()) {
      // Add new comment logic here
      setNewComment('');
    }
  };

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
          disabled={!newComment.trim()}
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
