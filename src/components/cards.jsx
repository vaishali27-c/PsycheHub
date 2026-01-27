import React from 'react';
import './style.css';

const Cards = (props) => {
  return (
    <div className="service__card">
      <span><i className="ri-video-chat-line"></i></span>
      <h4>{props.title}</h4>
      <p>
        {props.contenet}   
      </p>
      <a href="#">{props.link}</a>
    </div>
  );
};

export default Cards;