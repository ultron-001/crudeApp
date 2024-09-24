import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import fb from './firebase';

const DB = fb.firestore();
const BlogsList = DB.collection('blogs');
const storageRef = fb.storage().ref();

export default function BlogEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [cover, setCover] = useState(null);
    const [coverUrl, setCoverUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        BlogsList.doc(id).get().then((snapshot) => {
            const data = snapshot.data();
            setTitle(data.title || '');
            setBody(data.body || '');
            setCoverUrl(data.coverImg || '');
            setLoading(false);
        }).catch((error) => {
            console.error("Error fetching document: ", error);
            setLoading(false);
        });
    }, [id]);

    const handleCoverImgChange = (e) => {
        if (e.target.files[0]) {
            setCover(e.target.files[0]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (cover) {
            const uploadTask = storageRef.child('images/' + cover.name).put(cover);
            uploadTask.on(
                'state_changed',
                snapshot => {},
                error => {
                    console.log(error);
                },
                () => {
                    storageRef.child('images/' + cover.name).getDownloadURL().then(url => {
                        updateBlogPost(url);
                    });
                }
            );
        } else {
            updateBlogPost(coverUrl);
        }
    };

    const updateBlogPost = (imageUrl) => {
        BlogsList.doc(id).update({
            title: title,
            body: body,
            coverImg: imageUrl
        }).then(() => {
            alert('Blog post updated successfully');
            navigate('/');
        }).catch((error) => {
            console.error('Error updating document: ', error);
            alert('Failed to update blog post: ' + error.message);
        });
    };

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

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="edit-blog-container">
            <button onClick={() => navigate('/')} className="back-button">Back</button>
            <form onSubmit={submit} className="edit-blog-form">
                <input 
                    type="text" 
                    placeholder="Title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    className="edit-blog-title"
                />

                <input 
                    type='file' 
                    name='coverimg' 
                    accept='image/*' 
                    onChange={(e) => handleCoverImgChange(e)} 
                    className="edit-blog-cover-upload"
                />

                <Editor 
                    apiKey='kyoq1wx15ojgjpwdgouqmqslspgutwi8gaom5ogdl6t2d408'
                    textareaName='content'
                    value={body}
                    onEditorChange={(newText) => setBody(newText)}
                    init={{
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
                    }}
                    className="edit-blog-editor"
                />

                <button type="submit" className="edit-blog-submit">Update</button>
            </form>
        </div>
    )
}