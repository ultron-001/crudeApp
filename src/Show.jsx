import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import fb from './firebase';
import useAuthState from './hooks';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const DB = fb.firestore();
const BlogsList = DB.collection('blogs');

function LikedBlogButton({ id, likes, onLikeUpdate }) {
    const blogRef = DB.collection('blogs').doc(id);
    const { user } = useAuthState(fb.auth());

    const handleLikes = () => {
        if (likes?.includes(user.uid)) {
            blogRef.update({
                likes: fb.firestore.FieldValue.arrayRemove(user.uid)
            }).then(() => onLikeUpdate());
        } else {
            blogRef.update({
                likes: fb.firestore.FieldValue.arrayUnion(user.uid)
            }).then(() => onLikeUpdate());
        }
    };

    return (
        <div>
            {likes?.includes(user.uid)
                ? <button onClick={handleLikes}>Unlike</button>
                : <button onClick={handleLikes}>Like</button>
            }
        </div>
    );
}

export default function BlogView() {
    const { user } = useAuthState(fb.auth());
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [comment, setComment] = useState('');
    const [replyTexts, setReplyTexts] = useState({});
    const [commentList, setCommentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const snapshot = await BlogsList.doc(id).get();
                if (!snapshot.exists) {
                    setError('Blog not found');
                } else {
                    const data = snapshot.data();
                    setBlog({ ...data, id: snapshot.id });
                    setCommentList(data.comments || []);
                }
            } catch (err) {
                console.error('Error fetching blog:', err);
                setError('Failed to load blog');
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    const handleLikeUpdate = () => {
        BlogsList.doc(id).get().then((snapshot) => {
            const data = snapshot.data();
            setBlog({ ...data, id: snapshot.id });
        });
    };

    const handleReplyTextChange = (commentId, text) => {
        setReplyTexts((prev) => ({ ...prev, [commentId]: text }));
    };

    const handleComment = () => {
        const trimmedCommentText = comment.trim();

        if (trimmedCommentText !== '') {
            const newComment = {
                userid: user.uid,
                username: user.displayName,
                userImg: user.photoURL,
                comment: trimmedCommentText,
                createdAt: fb.firestore.Timestamp.now(),
                commentid: uuidv4(),
                replies: []
            };

            BlogsList.doc(id).update({
                comments: fb.firestore.FieldValue.arrayUnion(newComment)
            }).then(() => {
                setComment('');  // Clear comment input after submission
                return BlogsList.doc(id).get();
            }).then((snapshot) => {
                const data = snapshot.data();
                setCommentList(data.comments || []);
            }).catch(error => {
                console.error('Error adding top-level comment:', error);
            });
        }
    };

    const handleReply = (parentCommentId) => {
        const replyText = replyTexts[parentCommentId]?.trim();

        if (replyText !== '') {
            const newReply = {
                userid: user.uid,
                username: user.displayName,
                userImg: user.photoURL,
                comment: replyText,
                createdAt: fb.firestore.Timestamp.now(),
                commentid: uuidv4()
            };

            BlogsList.doc(id).get().then((doc) => {
                const comments = doc.data().comments;
                const updatedComments = comments.map(c => {
                    if (c.commentid === parentCommentId) {
                        return { ...c, replies: [...(c.replies || []), newReply] };
                    }
                    return c;
                });
                return BlogsList.doc(id).update({ comments: updatedComments });
            }).then(() => {
                setReplyTexts((prev) => ({ ...prev, [parentCommentId]: '' }));
                return BlogsList.doc(id).get();
            }).then((snapshot) => {
                const data = snapshot.data();
                setCommentList(data.comments || []);
            }).catch(error => {
                console.error('Error adding reply:', error);
            });
        }
    };

    const handleCommentDelete = (commentToDelete) => {
        const removeComment = (comments) => {
            return comments.reduce((acc, comment) => {
                if (comment.commentid === commentToDelete.commentid) {
                    return acc;
                }
                const updatedComment = { ...comment };
                if (comment.replies) {
                    updatedComment.replies = removeComment(comment.replies);
                }
                return [...acc, updatedComment];
            }, []);
        };

        BlogsList.doc(id).get().then((doc) => {
            let comments = doc.data().comments;
            comments = removeComment(comments);
            return BlogsList.doc(id).update({ comments: comments });
        }).then(() => {
            return BlogsList.doc(id).get();
        }).then((snapshot) => {
            const data = snapshot.data();
            setCommentList(data.comments || []);
        }).catch(error => {
            console.error('Error deleting comment:', error);
        });
    };

    const renderComments = (comments, level = 0) => {
        return comments.map((item) => (
            <div 
                key={item.commentid} 
                className={`comment-thread level-${level}`}
                style={{ marginLeft: `${level * 20}px` }}  // Indent replies
            >
                <div className='comment-item'>
                    <div className="comment-user-avatar">
                        <img src={item.userImg} alt='user'/>
                    </div>
                    <div className="comment-content">
                        <p className="comment-text">{item.comment}</p>
                        <p className="comment-username">{item.username}</p>
                    </div>
                    <div className="comment-actions">
                        {/* Delete button only for comment/reply author or blog post author */}
                        {user && (user.uid === blog.author || user.uid === item.userid) && (
                            <button 
                                className='delete-comment-btn' 
                                onClick={() => handleCommentDelete(item, level === 0 ? null : comments[0].commentid)}
                            >
                                Delete
                            </button>
                        )}
                        <button className="reply-btn" onClick={() => handleReplyTextChange(item.commentid, '')}>Reply</button>
                    </div>
                </div>

                {/* Reply input for this specific comment */}
                {replyTexts[item.commentid] !== undefined && (
                    <div className="reply-input-container">
                        <input 
                            type='text'
                            className="reply-input"
                            value={replyTexts[item.commentid] || ''}
                            onChange={(e) => handleReplyTextChange(item.commentid, e.target.value)}
                            placeholder="Write a reply..."
                        />
                        <button className="submit-reply-btn" onClick={() => handleReply(item.commentid)}>Submit Reply</button>
                        <button className="cancel-reply-btn" onClick={() => handleReplyTextChange(item.commentid, undefined)}>Cancel</button>
                    </div>
                )}

                {/* Recursively render replies with increased nesting level */}
                {item.replies && item.replies.length > 0 && (
                    <div className="replies-container">
                        {renderComments(item.replies, level + 1)}  {/* Increase level for nested replies */}
                    </div>
                )}
            </div>
        ));
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!blog) return <div>No blog found</div>;

    return (
        <div className="blog-view-container">
            <div className="blog-view-content">
            <h1 className="blog-title">{blog.Title || blog.title}</h1>
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.Body || blog.body }}></div>

            <div className="like-section">
                {user && (
                    <LikedBlogButton
                        id={id}
                        likes={blog.likes}
                        onLikeUpdate={handleLikeUpdate}
                    />
                )}
                <p className="like-count">{blog.likes ? blog.likes.length : "0"}</p>
            </div>

            <div className="comment-section">
                {user && (
                    <div className="comment-input-container">
                        <img className="user-avatar" src={user.photoURL} alt="user" />
                        <input 
                            type='text'
                            className='comment-input'
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Express yourself..."
                        />
                        <button className="submit-comment-btn" onClick={handleComment}>Submit</button>
                    </div>
                )}
                <div className="comments-list">
                    {renderComments(commentList)}
                </div>
            </div>
        </div>
        </div>
    );
}
