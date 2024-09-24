import React, { useState } from 'react';
import fb from './firebase';
import {Editor} from '@tinymce/tinymce-react'
import useAuthState from './hooks';
import { useNavigate } from 'react-router-dom';
const DB = fb.firestore();
const BlogsList = DB.collection('blogs');
const storageRef = fb.storage().ref();



export default function CreateBlog(){
    const navigate = useNavigate();
    const {user, initializing} = useAuthState(fb.auth());
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [cover, setCover] = useState(null);

    const handleCoverImgChange = (e) => {
        if (e.target.files[0]) {
            setCover(e.target.files[0]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (!user) {
            if (window.confirm("You need to be signed in to create a blog post. Would you like to sign in now?")) {
                navigate('/signup');
            }
            return;
        }

        if (cover) {
            success(downloadURL)
            const uploadTask = storageRef.child('images/' + cover.name).put(cover);
            uploadTask.on(
                'state_changed',
                snapshot => {},
                error => {
                    console.log(error);
                },
                () => {
                    storageRef.child('images/' + cover.name).getDownloadURL().then(url => {
                        addBlogPost(url);
                    });
                }
            );
        } else {
            addBlogPost(null);
        }
    };

    const addBlogPost = (imageUrl) => {
        BlogsList.add({
            title: title,
            body: body,
            coverImg: imageUrl,
            author: user.uid
        }).then((docRef) => {
            alert('Blog post added successfully');
        }).catch((error) => {
            console.error('Error adding document: ', error);
            alert('Failed to add blog post: ' + error.message);
        });
    };

    if (initializing){
        return 'Loading...';
    }
      const handleImageUpload = async (blobInfo, success, failure) => {
          try {
              const file = blobInfo.blob();
              const fileName = blobInfo.filename();
              const uploadTask = storageRef.child('blog_content/' + fileName).put(file);
              const snapshot = await uploadTask;
              const downloadURL = `https://firebasestorage.googleapis.com/v0/b/crudapplication-cd467.appspot.com/o/blog_content%2F${encodeURIComponent(fileName)}?alt=media`;
              success(downloadURL);
          } catch (error) {
              console.error('Upload error:', error);
              failure('Image upload failed: ' + error.message);
          }
      };
    
    
      const file_picker_callback = (cb, value, meta) => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
        
          input.onchange = function() {
              const file = this.files[0];
              const storageRef = fb.storage().ref('blog_content/' + file.name);
            
              storageRef.put(file).then(snapshot => {
                  return snapshot.ref.getDownloadURL();
              }).then(downloadURL => {
                  cb(downloadURL, { title: file.name, alt: file.name });
              }).catch(error => {
                  console.error('Upload failed:', error);
              });
          };
          input.click();
    };
    
    return(
        <div className="create-blog-container">
            <form onSubmit={(event) => {submit(event)}} className="create-blog-form">
                <input 
                    type="text" 
                    placeholder="Title" 
                    onChange={(e)=>{setTitle(e.target.value)}} 
                    required 
                    className="create-blog-title"
                />

                <input 
                    type='file' 
                    name='coverimg' 
                    accept='image/*' 
                    onChange={(e)=>handleCoverImgChange(e)} 
                    className="create-blog-cover-upload"
                /> 

                <Editor 
                    apiKey='kyoq1wx15ojgjpwdgouqmqslspgutwi8gaom5ogdl6t2d408'
                    textareaName='content'
                    placeholder='Write your content here'
                    onEditorChange={(newText)=>{setBody(newText)}}
                    init= {{
                        height: 500,
                        menubar: true,
                        plugins: [
                            'advlist autolink lists link image charmap print preview anchor',
                            'searchreplace visualblocks code fullscreen',
                            'insertdatetime media table paste code help wordcount',
                            'media',
                            'image',
                            'codesample',
                        ],
                        toolbar: 'undo redo | formatselect | ' +
                                 'bold italic backcolor | alignleft aligncenter ' +
                                 'alignright alignjustify | bullist numlist outdent indent | ' +
                                 'image media | codesample | removeformat | help',
                        images_upload_handler:handleImageUpload,
                        automatic_uploads: true,
                        file_picker_callback:file_picker_callback,
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                        block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Preformatted=pre'
                    }}
                    className="create-blog-editor"
                />

                <button type="submit" className="create-blog-submit">Submit</button>
            </form>
        </div>
    )}



