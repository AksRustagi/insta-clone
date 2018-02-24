import React, { Component } from 'react';
import Content from './post/Comment.jsx';
import Info from './post/Info.jsx';
import Likes from './post/Likes.jsx';
import Comment from './post/Comment.jsx';
class Post extends Component {
  constructor(props){
    super(props)
  }

  render() {
    return (
      <div>
        <Content content={this.props.content}/>
        <Info user={this.props.user} profileclick={this.props.profileclick}/>
        <Likes like={this.props.like} likes={this.props.likes}/>
        <Comment profileclick={this.props.profileclick} userone={this.props.userone} usertwo={this.props.usertwo} click={this.props.click}/>
      </div>
    )
  }
}

export default Post;