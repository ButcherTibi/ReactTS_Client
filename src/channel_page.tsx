import React from 'react';
import './channel_page.css'

import {
  SplitNumber,

  serverFetch,
  StyledViewsAndDate,
  Media as GenericMedia
} from "./common"

export {
  Channel
}

// TODO:
// - recomendation engine
// - comment sorting v3
// - comment sort by time
// - comment background color
// - comment font color
// - channel page
// - search threads by name | tag | time
// - history
// - bookmarks

// Channel API
// change banner (need database format update)
// rename channel
// playlists (maybe)

// Thread Set API
// add/remove thread set
// change thread set name
// change thread set icon
// add/remove tag

// Thread API
// add/remove thread
// move threads to set 
// change thread description
// change thread name

class PreviewThreadProps {
  id: string = "";
  preview: string = "";
  preview_mime_type: string = "";
  name: string = "";
  views: number = 0;
  date: Date = new Date();
  descp: string = "";
}

type PreviewThreadsProps = {
  preview_threads: PreviewThreadProps[]
}

class PreviewThreads extends React.Component<PreviewThreadsProps> {
  constructor(props: PreviewThreadsProps) {
    super(props)
  }

  render() {
    return (
      <div className="PreviewThreads">
        {this.props.preview_threads.map(preview => {
          return (
            <div className="PreviewItem" key={preview.id}>
              <div className="media_wrap">
                <GenericMedia
                  media={preview.preview}
                  mime_type={preview.preview_mime_type}
                  css_img_class="preview_img"
                  css_video_class="preview_vid"
                  controls={false}
                  autoplay={true}
                  loop={true}
                  muted={true}
                />
              </div>
              <p className="name">{preview.name}</p>
              <StyledViewsAndDate
                views={preview.views}
                date={new Date(preview.date)}
                css_class="views_and_date"
              />
            </div>
          )
        })}
      </div>
      
    )
  }
}


class PreviewThreadSetProps {
  id: string = "";
  icon_media: string = "";
  icon_mime_type: string = "";
  name: string = "";
  subs: number = 0;
  preview_threads: PreviewThreadProps[] = [];
}

enum SelectedTabs {
  NOT_LOADED,
  RECENT,
}

type ChannelProps = {
  channel_id: string
}

type ChannelState = {
  channel_loaded: boolean,

  // Header
  banner_media: string,
  banner_mime_type: string,
  icon_media: string,
  icon_mime_type: string,
  name: string,
  subs: number,

  selected_tab: SelectedTabs,

  // Recent
  recent_thread: PreviewThreadProps,
  recent_threads: PreviewThreadProps[],
  thread_sets: PreviewThreadSetProps[],
}

class Channel extends React.Component<ChannelProps, ChannelState> {
  constructor(props: ChannelProps) {
    super(props)

    this.state = {
      channel_loaded: false,

      // Header
      banner_media: "",
      banner_mime_type: "",
      icon_media: "",
      icon_mime_type: "",
      name: "",
      subs: 0,

      selected_tab: SelectedTabs.NOT_LOADED,

      // Recent Tab
      recent_thread: new PreviewThreadProps(),
      recent_threads: [],
      thread_sets: [],
    }
  }

  loadChannel(channel_id: string) {
    let req = {
      channel_id: channel_id,
    }

    serverFetch("getChannel", req).then(
      (res: any) => {
        this.setState({
          channel_loaded: true,

          banner_media: res.banner_media,
          banner_mime_type: res.banner_mime_type,
          icon_media: res.icon_media,
          icon_mime_type: res.icon_mime_type,
          name: res.name,
          subs: res.subs,
        })
      },
      err => console.log(err)
    )
  }

  switchToRecentTab() {
    this.setState({
      selected_tab: SelectedTabs.NOT_LOADED
    });

    let req = {
      channel_id: this.props.channel_id
    }

    serverFetch("getChannelRecentTab", req).then(
      (res: any) => {
        this.setState({
          selected_tab: SelectedTabs.RECENT,

          recent_thread: res.recent_thread,
          recent_threads: res.recent_threads,
          thread_sets: res.thread_sets,
        })
      },
      err => console.log(err)
    )
  }

  componentDidMount() {
    this.loadChannel(this.props.channel_id);
    this.switchToRecentTab();
  }

  componentDidUpdate(prev_props: Readonly<ChannelProps>) {
    if (this.props.channel_id !== prev_props.channel_id) {
      this.loadChannel(this.props.channel_id);
      this.switchToRecentTab();
    }
  }

  render() {
    if (!this.state.channel_loaded) {
      return null;
    }

    let channel_content = null;
    switch (this.state.selected_tab) {
      case SelectedTabs.NOT_LOADED: {
        break;
      }

      case SelectedTabs.RECENT: {
        channel_content = (
          <div className="RecentTab">
            <div className="RecentThread">
              <GenericMedia
                media={this.state.recent_thread.preview}
                mime_type={this.state.recent_thread.preview_mime_type}
                css_img_class="img"
                css_video_class="vid"
                controls={true}
                autoplay={true}
                loop={false}
                muted={true}  // change back
              />
              <div className="description">
                <p className="name">{this.state.recent_thread.name}</p>
                <StyledViewsAndDate
                  views={this.state.recent_thread.views}
                  date={new Date(this.state.recent_thread.date)}
                  css_class="views_and_date"
                />
                <p className="descp">{this.state.recent_thread.descp}</p>
              </div>
            </div>
            <div className="RecentThreads">
              <p className="name">Latest</p>
              <PreviewThreads
                preview_threads={this.state.recent_threads}
              />
            </div>
            {this.state.thread_sets.map(thread_set => {

              let subs_btn_class = "subscribe_btn subscribe_btn_on";

              return (
                <div className="PreviewThreadSet" key={thread_set.id}>
                  <div className="PreviewSetHeader">
                    <GenericMedia
                      media={thread_set.icon_media}
                      mime_type={thread_set.icon_mime_type}
                      css_img_class="icon_img"
                      css_video_class="icon_vid"
                      controls={false}
                      autoplay={true}
                      loop={true}
                      muted={true}
                    />
                    <div className="right">
                      <div className="set">
                        <p className="name">{thread_set.name}</p>
                        <div className="subs">
                          <p className="subs_num">{SplitNumber(thread_set.subs)}</p>
                          <p className="subs_txt">subs</p>
                        </div>
                      </div>
                      <button className={subs_btn_class}>Subscribe</button>
                    </div>
                  </div>
                  <PreviewThreads
                    preview_threads={thread_set.preview_threads}
                  />
                </div>
              )
            })}
          </div>
        )
        break;
      }
      
    }

    return (
      <div className="Channel">
        <div className="Banner">
          <GenericMedia
            media={this.state.banner_media}
            mime_type={this.state.banner_mime_type}
            css_img_class="banner_img"
            css_video_class="banner_video"
            controls={false}
            autoplay={true}
            loop={true}
            muted={true}
          />
          <div className="header">
            <GenericMedia 
              media={this.state.icon_media}
              mime_type={this.state.icon_mime_type}
              css_img_class="channel_img_icon"
              css_video_class="channel_video_icon"
              controls={false}
              autoplay={true}
              loop={true}
              muted={true}
            />
            <div className="right">
              <p className="channel_name">{this.state.name}</p>
              <div className="subs">
                <p className="subs_num">{SplitNumber(this.state.subs)}</p>
                <p className="subs_txt">subs</p>
              </div>
            </div>
          </div>
        </div>
        <div className="tabs">
          <button className="recent_btn selected_tab">Recent</button>
          <button className="best_btn">Best</button>
          <button className="sets_btn">Sets</button>
        </div>
        {channel_content}
      </div>
    )
  }
}
