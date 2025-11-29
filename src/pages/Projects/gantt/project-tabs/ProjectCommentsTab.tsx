import React, { useState, useEffect } from 'react';
import { Send, Heart, MoreVertical, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const mockComments = [
  {
    id: 1,
    author: 'Charlie Day',
    role: 'Project Manager',
    avatar: 'CD',
    timestamp: '2 hours ago',
    text: 'Client approved milestone 3. Moving forward with Phase 2 next week.',
    likes: 3,
    replies: [
      {
        id: 2,
        author: 'Bob Ross',
        role: 'Team Lead',
        avatar: 'BR',
        timestamp: '1 hour ago',
        text: "Perfect timing! I'll update the Gantt with the new timeline.",
        likes: 1
      }
    ]
  },
  {
    id: 3,
    author: 'Alice Chen',
    role: 'Senior Analyst',
    avatar: 'AC',
    timestamp: 'Yesterday at 3:45 PM',
    text: 'Budget review meeting scheduled for Thursday. Please prepare Q1 reports.',
    likes: 5,
    replies: []
  },
  {
    id: 4,
    author: 'John Doe',
    role: 'Financial Analyst',
    avatar: 'JD',
    timestamp: '2 days ago',
    text: 'Attaching the updated budget report for review.',
    likes: 2,
    attachment: {
      name: 'Q1_Budget_Report.pdf',
      size: '2.4 MB',
      icon: '📄'
    },
    replies: []
  }
];

interface ProjectCommentsTabProps {
  projectId?: string;
}

export function ProjectCommentsTab({ projectId }: ProjectCommentsTabProps) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load comments from API
  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    async function loadComments() {
      try {
        setLoading(true);
        const { getComments } = await import('../../../../services/commentsApi');
        const apiComments = await getComments('project', projectId);
        
        // Transform API comments to UI format
        const transformed = apiComments.map(comment => {
          const initials = comment.creator.fullName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          
          return {
            id: comment.id,
            author: comment.creator.fullName,
            role: '', // API doesn't provide role
            avatar: initials,
            timestamp: formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }),
            text: comment.text,
            likes: 0, // API doesn't provide likes
            replies: comment.reply ? [{
              id: comment.reply.id,
              author: comment.reply.creator.fullName,
              role: '',
              avatar: comment.reply.creator.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
              timestamp: formatDistanceToNow(new Date(comment.reply.createdAt), { addSuffix: true }),
              text: comment.reply.text,
              likes: 0
            }] : [],
            attachment: undefined
          };
        });
        
        setComments(transformed);
      } catch (error) {
        console.error('Error loading comments:', error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    }

    loadComments();
  }, [projectId]);

  const handleSubmit = async () => {
    if (!commentText.trim() || !projectId || submitting) return;

    try {
      setSubmitting(true);
      const { createComment } = await import('../../../../services/commentsApi');
      await createComment('project', {
        entityId: projectId,
        text: commentText.trim(),
      });
      setCommentText('');
      
      // Reload comments
      const { getComments } = await import('../../../../services/commentsApi');
      const apiComments = await getComments('project', projectId);
      const transformed = apiComments.map(comment => {
        const initials = comment.creator.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        return {
          id: comment.id,
          author: comment.creator.fullName,
          role: '',
          avatar: initials,
          timestamp: formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }),
          text: comment.text,
          likes: 0,
          replies: [],
          attachment: undefined
        };
      });
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
    <div style={{ padding: '24px' }}>
      {/* Comment Input */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'white',
        marginBottom: '24px'
      }}>
        <div style={{
          position: 'relative',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a project comment..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '16px',
              paddingBottom: '56px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#0A0A0A',
              lineHeight: '1.5',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!commentText.trim() || submitting || !projectId}
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              width: '40px',
              height: '40px',
              borderRadius: '20px',
              background: commentText.trim() ? '#3B82F6' : '#E5E7EB',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: commentText.trim() ? 'pointer' : 'not-allowed',
              boxShadow: commentText.trim() ? '0 2px 6px rgba(59,130,246,0.3)' : 'none',
              transition: 'all 150ms ease',
              opacity: commentText.trim() ? 1 : 0.4
            }}
            onMouseEnter={(e) => {
              if (commentText.trim()) {
                e.currentTarget.style.background = '#2563EB';
              }
            }}
            onMouseLeave={(e) => {
              if (commentText.trim()) {
                e.currentTarget.style.background = '#3B82F6';
              }
            }}
          >
            <Send size={18} color="white" />
          </button>
        </div>
      </div>

      {/* Comment Thread */}
      {comments.map((comment) => (
        <div key={comment.id}>
          {/* Main Comment */}
          <div style={{
            background: '#FAFAFA',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Avatar */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '16px',
                  background: '#3B82F6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 600
                }}>
                  {comment.avatar}
                </div>

                {/* Author Info */}
                <div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0A0A0A'
                  }}>
                    {comment.author}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    marginLeft: '8px'
                  }}>
                    {comment.role}
                  </span>
                </div>
              </div>

              {/* Timestamp */}
              <span style={{
                fontSize: '13px',
                color: '#9CA3AF'
              }}>
                {comment.timestamp}
              </span>
            </div>

            {/* Body */}
            <div style={{
              fontSize: '14px',
              color: '#0A0A0A',
              lineHeight: '1.6',
              marginBottom: '12px'
            }}>
              {comment.text}
            </div>

            {/* Attachment (if any) */}
            {comment.attachment && (
              <div style={{
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>{comment.attachment.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#0A0A0A'
                  }}>
                    {comment.attachment.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#9CA3AF'
                  }}>
                    {comment.attachment.size}
                  </div>
                </div>
                <button style={{
                  width: '24px',
                  height: '24px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}>
                  ⬇
                </button>
              </div>
            )}

            {/* Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <button style={{
                background: 'transparent',
                border: 'none',
                fontSize: '13px',
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
              <button style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                color: '#9CA3AF',
                cursor: 'pointer'
              }}>
                <Heart size={14} />
                <span>{comment.likes}</span>
              </button>
              <button style={{
                background: 'transparent',
                border: 'none',
                marginLeft: 'auto',
                cursor: 'pointer',
                padding: '4px'
              }}>
                <MoreVertical size={16} color="#9CA3AF" />
              </button>
            </div>
          </div>

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div style={{
              marginLeft: '40px',
              borderLeft: '2px solid #E5E7EB',
              paddingLeft: '12px',
              marginBottom: '12px'
            }}>
              {comment.replies.map((reply) => (
                <div key={reply.id} style={{
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px'
                }}>
                  {/* Reply Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '16px',
                        background: '#10B981',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 600
                      }}>
                        {reply.avatar}
                      </div>
                      <div>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#0A0A0A'
                        }}>
                          {reply.author}
                        </span>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '13px',
                      color: '#9CA3AF'
                    }}>
                      {reply.timestamp}
                    </span>
                  </div>

                  {/* Reply Body */}
                  <div style={{
                    fontSize: '14px',
                    color: '#0A0A0A',
                    lineHeight: '1.6',
                    marginBottom: '12px'
                  }}>
                    {reply.text}
                  </div>

                  {/* Reply Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <button style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '13px',
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
                    <button style={{
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      color: '#9CA3AF',
                      cursor: 'pointer'
                    }}>
                      <Heart size={14} />
                      <span>{reply.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Load More */}
      <button style={{
        width: '100%',
        height: '40px',
        background: 'white',
        border: '2px dashed #3B82F6',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 500,
        color: '#3B82F6',
        cursor: 'pointer',
        transition: 'all 150ms ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
      >
        Load 15 more comments
      </button>
    </div>
  );
}
