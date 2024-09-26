import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import fb from './firebase';
import useAuthState from './hooks';

const DB = fb.firestore();
const BlogsList = DB.collection('blogs');

export default function BlogsListView() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const { user } = useAuthState(fb.auth());

  // Fetch blog list from Firestore
  useEffect(() => {
    const unsubscribe = BlogsList.limit(100).onSnapshot((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setBlogs(data);
      setFilteredBlogs(data); // Initialize filteredBlogs
    });

    return () => unsubscribe();
  }, []);

  // Update filteredBlogs based on search input
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredBlogs(blogs); // Reset to all blogs if search is empty
    } else {
      const filtered = blogs.filter((blog) =>
        blog.title.toLowerCase().includes(search.toLowerCase()) ||
        blog.body.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredBlogs(filtered);
    }
  }, [search, blogs]);

  // Handle delete blog
  const DeleteBlog = (id) => {
    setDeleteConfirmation(id); // Set the blog to be deleted
  };

  // Confirm blog deletion
  const confirmDelete = () => {
    BlogsList.doc(deleteConfirmation)
      .delete()
      .then(() => {
        setDeleteConfirmation(null); // Close the confirmation
      })
      .catch((error) => {
        console.error('Error deleting document: ', error);
        alert('Failed to delete data: ' + error.message);
      });
  };

  // Function to truncate HTML content
  const truncateBody = (html, maxLength = 150) => {
    const stripped = html.replace(/<[^>]+>/g, ''); // Remove HTML tags
    return stripped.length <= maxLength ? stripped : stripped.substr(0, maxLength) + '...';
  };

  return (
    <div className="blogs-list-container">
      <form className="search-form" onSubmit={(e) => e.preventDefault()}>
        {/* Delete confirmation popup */}
        {deleteConfirmation && (
          <div className="popup-card">
            <div className="popup-content">
              <p>Are you sure you want to delete this blog?</p>
              <button
                className="popup-button confirm-delete"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
              <button
                className="popup-button"
                onClick={() => setDeleteConfirmation(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search bar */}
        <input
          className="search-input"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          placeholder="Search blogs..."
        />
      </form>

      {/* Blog list */}
      {filteredBlogs.map((blog) => (
        <div className="blog-item" key={blog.id}>
          {blog.coverImg && (
            <img className="blog-cover-image" src={blog.coverImg} alt="cover" />
          )}
          <div className="blog-info">
            <h2 className="blog-title">{blog.title}</h2>
            <div
              className="bloglist-text"
              dangerouslySetInnerHTML={{
                __html: truncateBody(blog.body),
              }}
            ></div>
          </div>

          <Link className="view-link" to={`/show/${blog.id}`}>
            View
          </Link>
          {user && user.uid === blog.author && (
            <>
              <Link className="edit-link" to={`/editBlog/${blog.id}`}>
                Edit
              </Link>
              <button
                className="delete-button"
                onClick={() => DeleteBlog(blog.id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
