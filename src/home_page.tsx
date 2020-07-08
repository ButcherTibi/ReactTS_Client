
import React from 'react';
import './home_page.css';

import {
  serverFetch,

  StyledViewsAndDate
} from "./common"


export {
  HomeThreads,
}


type RecomendationProps = {
  thread_id: string,
  channel_id: string,

  thread_set_name: string,
  thread_set_img: string,

  preview_img: string,
  title: string,
  views: number,
  date: Date,

  // Functions
  switchTo: (thread_id: string) => void,
  switchToChannel: (channel_id: string) => void,
}

class Recomendation extends React.Component<RecomendationProps> {
  constructor(props: RecomendationProps) {
    super(props)

    this.switchToThread = this.switchToThread.bind(this);
    this.switchToChannel = this.switchToChannel.bind(this);
  }

  switchToThread() {
    this.props.switchTo(this.props.thread_id);
  }

  switchToChannel() {
    this.props.switchToChannel(this.props.channel_id);
  }

  render() {
    return (
      <div className="Recomendation">
        <div className="image" onClick={this.switchToThread}>
          <img src={this.props.preview_img} alt="Thread Preview"></img>
        </div>
        <div className="footer">
          <img className="ThreadSetImage" src={this.props.thread_set_img} alt="Thread Set"
            onClick={this.switchToChannel}>
          </img>
          <div className="Context">
            <p className="title">{this.props.title}</p>
            <p className="thread_set">{this.props.thread_set_name}</p>
            <StyledViewsAndDate 
              views={this.props.views}
              date={this.props.date}
              css_class={"stats"}
            />
          </div>
        </div>
      </div>
    );
  }
}

type HomeThreadsProps = {
  switchToThread: (thread_id: string) => void,
  switchToChannel: (channel_id: string) => void,
}

type HomeThreadsState = {
  recomendations: RecomendationProps[],
}

class HomeThreads extends React.Component<HomeThreadsProps, HomeThreadsState, {}> {
  constructor(props: HomeThreadsProps) {
    super(props)
    this.state = {
      recomendations: [],
    }
  }

  loadThreadCards() {
    serverFetch("getHome").then(
      (res: any) => {
        this.setState({
          recomendations: res.thread_cards
        })
      },
      (err: string) => {
        console.log(err);
      }
    )
  }

  componentDidMount() {
    this.loadThreadCards();
  }

  render() {
    return (
      <div className="HomeThreads">
        {this.state.recomendations.map((recomendation) => {
          return <Recomendation key={recomendation.thread_id}
            thread_id={recomendation.thread_id}
            channel_id={recomendation.channel_id}

            preview_img={recomendation.preview_img}
            thread_set_img={recomendation.thread_set_img}
            title={recomendation.title}
            thread_set_name={recomendation.thread_set_name}
            views={recomendation.views}
            date={new Date(recomendation.date)}

            switchTo={this.props.switchToThread}
            switchToChannel={this.props.switchToChannel}
          />
        })}
      </div>
    );
  }
}
