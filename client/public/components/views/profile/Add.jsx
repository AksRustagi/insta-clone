import React from 'react';
import axios from 'axios';

class Add extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedFile: null
    };

    this.fileUploadHandler = this.fileUploadHandler.bind(this);
    this.fileSelectedHandler = this.fileSelectedHandler.bind(this);
    this.profilePicUploadHandler = this.profilePicUploadHandler.bind(this);
  }

  fileSelectedHandler(e) {
    console.log('fileselectedhandler: ', e.target.files[0]);

    // console.log('fileselectedhandler: ', e.target.files[0])
    this.setState({
      selectedFile: e.target.files[0]
    });
  }

  fileUploadHandler(e) {
    axios.post('/api/post', { username: this.props.email, data: { type: 0 } })
      .then(() => {
        axios.get('/api/post', { params: { username: this.props.email } })
          .then((posts) => {
            const fd = new FormData();
            fd.append('image', this.state.selectedFile, `${posts.data[posts.data.length - 1].id}.jpeg`);
            axios.post('https://us-central1-top-shelf-708be.cloudfunctions.net/uploadFile', fd, {
              onUploadProgress: progressEvent => {
                console.log('Upload progress: ' + Math.round(progressEvent.loaded / progressEvent.total * 100) + '%')
              }
            })
              .then(res => {
                this.props.firebase.storage().ref().child(`${posts.data[posts.data.length - 1].id}.jpeg`).getDownloadURL()
                  .then((url) => {
                    axios.put('/api/post', { id: posts.data[posts.data.length - 1].id, data: { body: url } })
                      .then(() => {
                        console.log('success');
                      });
                  });
              });
          })
      })
      .catch((err) => {
        alert('Something went wrong here!');
      });
  }

  profilePicUploadHandler(e) {
    const fd = new FormData();
    fd.append('image', this.state.selectedFile, `${this.props.email}.jpeg`);
    // console.log('fileupdloadhandler: ', fd)
    // fd.append('image', this.state.selectedFile, this.state.selectedFile.name);
    // console.log('fd after append is :', fd)
    axios.post('https://us-central1-top-shelf-708be.cloudfunctions.net/uploadFile', fd, {
      onUploadProgress: progressEvent => {
        console.log('Upload progress: ' + Math.round(progressEvent.loaded / progressEvent.total * 100) + '%')
      }
    })
      .then((res) => {
        this.props.firebase.storage().ref().child(`${this.props.email}.jpeg`).getDownloadURL()
          .then((url) => {
            axios.put('/api/user', { username: this.props.email, data: { profilepicture: url } })
              .then(() => {
                console.log('Success!');
              });
          })
          .catch((err) => {
            alert('Something went wrong here!');
          });
      });
  }

  render() {
    return (
      <div align='center'>
        <input 
          // style={{display: 'none'}} //remove this style to display selected file name
          type="file" 
          onChange={this.fileSelectedHandler} 
          ref={fileInput => this.fileInput = fileInput} />
        <button onClick={() => this.fileInput.click()}>Pick File</button>
        <button onClick={this.fileUploadHandler}>Upload Post</button>
        <button onClick={this.profilePicUploadHandler}>Change Profile Picture</button>
      </div>
    );
  }
}

export default Add;