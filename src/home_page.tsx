
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import {
  StyledViewsAndDate
} from "./common"

type RecomendationProps = {
  thread_id: string,

  thread_set_name: string,
  thread_set_img: string,

  preview_img: string,
  title: string,
  views: number,
  date: Date,

  // Visual
  layout: string,

  // Functions
  switchTo: (thread_id: string) => void,
}

class Recomendation extends React.Component<RecomendationProps> {
  constructor(props: RecomendationProps) {
    super(props)

    this.switchToThread = this.switchToThread.bind(this);
  }

  switchToThread() {
    this.props.switchTo(this.props.thread_id);
  }

  render() {
    let card_context = (
      <div className="CardContext">
        <p className="title">{this.props.title}</p>
        <p className="thread_set">{this.props.thread_set_name}</p>
        <StyledViewsAndDate 
          views={this.props.views}
          date={this.props.date}
          css_class={"stats"}
        />
      </div>
    );

    let render_content = null;
    if (this.props.layout === "vertical") {
      render_content = (
        <div className="VerticalThreadCard" onClick={this.switchToThread}>
          <div className="image">
            <img src={this.props.preview_img} alt="Thread Preview"></img>
          </div>
          <div className="description">
            <img className="ThreadSetImage" src={this.props.thread_set_img} alt="Thread Set"></img>
            {card_context}
          </div>
        </div>
      );
    }
    else {
      render_content = (
        <div className="HorizontalThreadCard" onClick={this.switchToThread}>
          <div className="image">
            <img src={this.props.preview_img} alt="Thread Preview"></img>
          </div>
          {card_context}
        </div>
      );
    }

    return render_content;
  }
}
