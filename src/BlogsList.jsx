import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import fb from './firebase';
import useAuthState from './hooks'; // Import the useAuthState hook

const DB = fb.firestore();
const BlogsList = DB.collection('blogs');

export default function BlogsListView() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const { user } = useAuthState(fb.auth()); // Get the current user

  useEffect(() => {
    const unsubscribe = BlogsList.limit(100).onSnapshot(querySnapshot => {
      const data = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log('Fetched data:', data);
      setBlogs(data);
    });

    return () => unsubscribe();
  }, []);

  

  // const DeleteBlog = (id) => {
  //   BlogsList.doc(id).delete().then(() => {
  //     alert('Data Deleted');
  //   }).catch((error) => {
  //     console.error('Error deleting document: ', error);
  //     alert('Failed to delete data: ' + error.message);
  //   });
  // };

  const DeleteBlog = (id) => {
    setDeleteConfirmation(id);
  };

  const confirmDelete = () => {
    BlogsList.doc(deleteConfirmation).delete().then(() => {
      setDeleteConfirmation(null);
    }).catch((error) => {
      console.error('Error deleting document: ', error);
      alert('Failed to delete data: ' + error.message);
    });
  };

  const SearchBlog = (e) => {
    e.preventDefault();
    const filteredBlogs = blogs.filter(blog =>
      blog.title.toLowerCase().includes(search.toLowerCase())
      || blog.body.toLowerCase().includes(search.toLowerCase())
    );
    setBlogs(filteredBlogs);
  };


  const truncateBody = (html, maxLength = 150) => {
    const stripped = html.replace(/<[^>]+>/g, '');
    if (stripped.length <= maxLength) return html;
    return stripped.substr(0, maxLength) + '...';
  };

  const body = blogs.Body || blogs.body;
  
    return (
      <div className="blogs-list-container">
        <form className="search-form" onSubmit={(e)=>{SearchBlog(e)}} >
        {deleteConfirmation && (
            <div className="popup-card">
              <div className="popup-content">
                <p>Are you sure you want to delete this blog?</p>
                <button className='popup-button confirm-delete' onClick={confirmDelete}>Yes, Delete</button>
                <button className='popup-button' onClick={() => setDeleteConfirmation(null)}>Cancel</button>
              </div>
            </div>
          )} 
          <input className="search-input" onChange={(e) => {setSearch(e.target.value)}} />
          <button className="search-button" type='submit'>Search</button>
        </form>
          {blogs.map(blog => (
            <div className="blog-item" key={blog.id}>
              {blog.coverImg && (
                <img className="blog-cover-image" src={blog.coverImg} alt="cover" />
              )}
              <div className="blog-info">
                <h2 className="blog-title">{blog.Title || blog.title}</h2>
                <div className='bloglist-text' dangerouslySetInnerHTML={{ __html: truncateBody(blog.Body || blog.body) }}></div>
              </div>  
              
              <Link className="view-link" to={"/show/"+blog.id}>View</Link>
              {user && user.uid === blog.author && (
                <>
                  <Link className="edit-link" to={"/editBlog/"+blog.id}>Edit</Link>
                  <button 
                    className="delete-button"
                    onClick={() => DeleteBlog(blog.id)}
                  >
                    delete
                  </button>
                </>
              )}
            </div>
          ))}      </div>

                 

        );
  
}
