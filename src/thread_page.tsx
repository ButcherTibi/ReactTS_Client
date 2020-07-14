import React, { MouseEvent, HtmlHTMLAttributes } from 'react';
import './index.css';

// Mine
import {
  account_name,
  account_password,
  account_icon_img,
  reply_box_pos,
  setGlobalReplyBoxPosition,

  serverFetch,
  SimplifyNumber,
  SplitNumber,
  SimplifiedDate,
  StyledViewsAndDate,
  Media,
} from "./common"


export {
  Thread
}


class CommentReplyTarget {
  name: string = "";
  id: string = "";
}

class CommentProps {
  id: string = "";
  parents: CommentReplyTarget[] = [];
  user_icon: string = "";
  user_name: string = "";
  date: Date = new Date();
  upvotes: number = -1;
  downvotes: number = -1;
  rating: number = 0;
  text: string = "";
  level: number = -1;

  // Client
  is_reply_target: boolean = false;
  render_key: number = -1;

  // Functions
  addOrRemoveReplyTarget: (comment: CommentReplyTarget) => void = () => {};
  upvoteComment: (comment_id: string) => void = () => {};
  downvoteComment: (comment_id: string) => void = () => {};
}

class Comment extends React.Component<CommentProps> {
  constructor(props: CommentProps) {
    super(props);

    this.state = {
      upvotes: this.props.upvotes,
      downvotes: this.props.downvotes
    }

    // Bindings
    this.toggleReplyTarget = this.toggleReplyTarget.bind(this);
    this.upvoteComment = this.upvoteComment.bind(this);
    this.downvoteComment = this.downvoteComment.bind(this);
  }

  toggleReplyTarget() {
    let reply_target = {
      name: this.props.user_name,
      id: this.props.id
    };
    this.props.addOrRemoveReplyTarget(reply_target);
  }

  upvoteComment() {
    this.props.upvoteComment(this.props.id);
  }

  downvoteComment() {
    this.props.downvoteComment(this.props.id);
  }

  render() {
    let comment_classes = "Comment";
    if (this.props.is_reply_target) {
      comment_classes = "Comment CommentReplyTarget";
    }

    let indent = this.props.level * 25;

    let parents = null;
    if (this.props.parents.length > 1) {
      parents = (
        <div className="parents">
          {this.props.parents.map((parent, idx) => {
            if (parent.id === "000000000000000000000000") {
              return null;
            }
            return (
              <a href={"#" + parent.id} key={parent.id}>
                <p className="from_sign">{">>"}</p>
                <p className="from_name">{parent.name}</p>
              </a>
            );
          })}
        </div>
      );
    }

    let up_classes = "up gray";
    let down_classes = "down gray";
    if (this.props.rating > 0) {
      up_classes = "up up_color";
    }
    else if (this.props.rating < 0) {
      down_classes = "down down_color";
    }

    return (
      <div className={comment_classes} id={this.props.id} style={{paddingLeft: indent}}>
        <img src={this.props.user_icon} alt="comment"></img>
        <div className="right_side">
          <div className="top_bar">
            <p className="user_name">{this.props.user_name}</p>
            <p className="date">{SimplifiedDate(this.props.date)}</p>
            <div className={up_classes} onClick={this.upvoteComment}>
              <p className="upvotes_value">{this.props.upvotes}</p>
              <p className="upvotes_txt">up</p>
            </div>
            <div className={down_classes} onClick={this.downvoteComment}>
              <p className="downvotes_value">{this.props.downvotes}</p>
              <p className="downvotes_txt">down</p>
            </div>
          </div>
          {parents}
          <div className="text">
            <p>{this.props.text}</p>
          </div>
          <div className="footer">
            <button className="comment_btn reply_btn" onClick={this.toggleReplyTarget}>reply</button>
            <button className="comment_btn report_btn">report</button>
          </div>
        </div>
      </div>
    );
  }
}


type ReplyBoxProps = {
  parents: CommentReplyTarget[],

  // Functions
  endReplying: () => void,
  replyToComments: () => void,
}

class ReplyBox extends React.Component<ReplyBoxProps> {

  start_delta_x: number = 0;
  start_delta_y: number = 0;
  
  constructor(props: ReplyBoxProps) {
    super(props)

    this.beginDrag = this.beginDrag.bind(this);
    this.dragReplyBox = this.dragReplyBox.bind(this);
    this.endDrag = this.endDrag.bind(this);
    this.noPassThru = this.noPassThru.bind(this);
  }

  componentDidMount() {
    let elem = document.getElementById("ReplyBox") as HTMLElement;
    elem.style.left = reply_box_pos.x;
    elem.style.top = reply_box_pos.y;
  }

  beginDrag(ev: MouseEvent) {
    let elem = document.getElementById("ReplyBox") as HTMLElement;
    this.start_delta_x = ev.clientX - elem.offsetLeft;
    this.start_delta_y = ev.clientY - elem.offsetTop;

    document.addEventListener("mousemove", this.dragReplyBox);
  }

  dragReplyBox(ev: globalThis.MouseEvent) {
    let elem = document.getElementById("ReplyBox") as HTMLElement;
    let pos_x = (ev.clientX - this.start_delta_x).toString() + "px";
    let pos_y = (ev.clientY - this.start_delta_y).toString() + "px";
    elem.style.left = pos_x;
    elem.style.top = pos_y;
  }

  endDrag() {
    let elem = document.getElementById("ReplyBox") as HTMLElement;
    document.removeEventListener("mousemove", this.dragReplyBox);

    setGlobalReplyBoxPosition(elem.style.left, elem.style.top)
  }

  noPassThru(ev: MouseEvent) {
    ev.stopPropagation();
  }

  render() {
    return (
      <div className="CommentBox" id="ReplyBox" 
        onMouseDown={this.beginDrag} onMouseUp={this.endDrag}>
        <div className="header">
          <div className="parents" onMouseDown={this.noPassThru}>
            {this.props.parents.map(parent => {
              return (
                <a href={"#" + parent.id} key={parent.id}>
                  <p className="from_sign">{">>"}</p>
                  <p className="from_name">{parent.name}</p>
                </a>
              )
            })}
          </div>
          <button className="close_btn" onClick={this.props.endReplying}
            onMouseDown={this.noPassThru}>
            Close
          </button>
        </div>
        <div className="textarea_wrap">
          <textarea id="reply_textarea" placeholder="Reply here . . ."
            onMouseDown={this.noPassThru}>
          </textarea>
        </div>
        <div className="footer">
          <button className="reply_btn" onClick={this.props.replyToComments}
            onMouseDown={this.noPassThru}>
            Reply
          </button>
        </div>
      </div>
    );
  }
}


type RecomendationProps = {
  // Data
  thread_id: string,
  channel_id: string,

  thread_set_name: string,

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
      <div className="HorizontalThreadCard">
        <div className="image" onClick={this.switchToThread}>
          <img src={this.props.preview_img} alt="Thread Preview"></img>
        </div>
        <div className="CardContext"  onClick={this.switchToChannel}>
          <p className="title">{this.props.title}</p>
          <p className="thread_set">
            {this.props.thread_set_name}
          </p>
          <StyledViewsAndDate 
            views={this.props.views}
            date={this.props.date}
            css_class={"stats"}
          />
        </div>
      </div>
    );;
  }
}


type ThreadProps = {
  thread_id: string,

  // Functions
  showLogIn: () => void,
  switchToThread: (thread_id: string) => void,
  switchToChannel: (channel_id: string) => void,
}

type ThreadState = {
  loaded: boolean,

  id: string,
  media: string,
  media_mime_type: string,
  title: string,
  views: number,
  date: Date,
  upvotes: number,
  downvotes: number,
  rating: number,
  descp: string,

  thread_set_id: string,
  thread_set_img: string,
  thread_set_name: string,
  thread_set_subs: number,
  subscribed: boolean

  channel_id: string,

  // Comments
  sort_mode: string;
  last_comment_render_key: number,
  comments_props: CommentProps[],

  // Recomendations
  recomendations: RecomendationProps[],

  // Comment Box
  show_comment_box: boolean,
  reply_targets: CommentReplyTarget[],

  // Visual
  layout: string,
}

class Thread extends React.Component<ThreadProps, ThreadState, {}> {
  constructor(props: ThreadProps) {
    super(props)

    let initial_layout = "vertical";
    if (document.documentElement.clientWidth >= document.documentElement.clientHeight) {
      initial_layout = "horizontal";
    }

    this.state = {
      loaded: false,

      id: "",
      media: "",
      media_mime_type: "",
      title: "",
      views: 0,
      date: new Date(),
      upvotes: 0,
      downvotes: 0,
      rating: 0,
      descp: "",

      thread_set_id: "",
      thread_set_img: "",
      thread_set_name: "",
      thread_set_subs: 0,
      subscribed: false,

      channel_id: "",

      sort_mode: "rating",
      last_comment_render_key: -1,
      comments_props: [],

      recomendations: [],

      // Visual
      layout: initial_layout,

      // Comment Box
      show_comment_box: false,
      reply_targets: [],
    }

    // Bindings
    this.setLayout = this.setLayout.bind(this);
    this.switchToChannel = this.switchToChannel.bind(this);
    this.upvoteThread = this.upvoteThread.bind(this);
    this.downvoteThread = this.downvoteThread.bind(this);
    this.subscribeToThreadSet = this.subscribeToThreadSet.bind(this);

    this.addOrRemoveReplyTarget = this.addOrRemoveReplyTarget.bind(this);
    this.endReplying = this.endReplying.bind(this);
    this.replyToComments = this.replyToComments.bind(this);
    this.upvoteComment = this.upvoteComment.bind(this);
    this.downvoteComment = this.downvoteComment.bind(this);
  }

  setLayout() {
    if (document.documentElement.clientWidth >= document.documentElement.clientHeight) {
      this.setState(prev => {
        if (prev.layout === "vertical") {
          return {
            layout: "horizontal"
          };
        }
        return {
          layout: prev.layout
        };
      })
    }
    else {
      this.setState((prev) => {
        if (prev.layout === "horizontal") {
          return {
            layout: "vertical"
          };
        }
        return {
          layout: prev.layout
        };
      })
    }
  }

  loadComments(thread_id: string) {
    let req = {
      name: account_name,
      password: account_password,

      thread_id: thread_id,
      sort_mode: this.state.sort_mode
    }

    serverFetch("getComments", req).then(
      (res: any) => {

        this.setState((prev) => {
          let new_last_key = prev.last_comment_render_key;
          let new_comments_props = [];

          for (let server_comment of res.comments) {

            let new_comment_props = new CommentProps();
            new_comment_props.id = server_comment.id;

            // fill parent ids from server
            for (let id of server_comment.parents_ids) {
              let new_reply_target = new CommentReplyTarget();
              new_reply_target.id = id;
              new_comment_props.parents.push(new_reply_target)
            }

            new_comment_props.user_icon = server_comment.user_icon;
            new_comment_props.user_name = server_comment.user_name;
            new_comment_props.date = server_comment.date;
            new_comment_props.upvotes = server_comment.upvotes;
            new_comment_props.downvotes = server_comment.downvotes;
            new_comment_props.rating = server_comment.rating;
            new_comment_props.text = server_comment.text;
            new_comment_props.level = server_comment.level;
            new_comment_props.rating = server_comment.rating;
            new_comment_props.is_reply_target = false;
            new_comment_props.render_key = new_last_key;

            new_comments_props.push(new_comment_props);

            new_last_key++;
          }

           // this can take a while to find the names of parent ids
          for (let i = 0; i < new_comments_props.length; i++) {

            for (let j = 0; j < new_comments_props[i].parents.length; j++) {
              for (let comment of new_comments_props) {
                if (comment.id === new_comments_props[i].parents[j].id) {
                  new_comments_props[i].parents[j].name = comment.user_name
                  break;
                }
              }
            }
          }

          return {
            last_comment_render_key: new_last_key,
            comments_props: new_comments_props,
          }
        })
      },
      err => console.log(err)
    )
  }

  loadRecomendations(thread_id: string) {
    let req = {
      thread_id: thread_id
    }

    serverFetch("getThreadRecomendations", req).then(
      (res: any) => {
        this.setState(prev => {
          return {
            recomendations: res.recomendations,
          }
        })
      },
      err => console.log(err)
    )
  }

  loadThread(thread_id: string) {

    let data = {
      thread_id: thread_id,
      name: account_name,
      password: account_password
    };

    serverFetch("getThread", data).then(
      (res: any) => {
        this.setState({
          loaded: true,

          id: thread_id,
          media: res.media,
          media_mime_type: res.media_mime_type,

          title: res.title,
          views: res.views,
          date: res.date,
          upvotes: res.up_votes,
          downvotes: res.down_votes,
          rating: res.rating,
          descp: res.descp,
          
          thread_set_id: res.thread_set_id,
          thread_set_img: res.thread_set_img,
          thread_set_name: res.thread_set_name,
          thread_set_subs: res.thread_set_subs,
          subscribed: res.subscribed,

          channel_id: res.channel_id,
        })
      },
      err => console.log(err)
    );

    this.loadComments(thread_id);
    this.loadRecomendations(thread_id);
  }

  componentDidMount() {
    window.addEventListener("resize", this.setLayout);

    this.loadThread(this.props.thread_id);
  }

  componentDidUpdate(prev_props: Readonly<ThreadProps>) {
    if (this.props.thread_id !== prev_props.thread_id) {
      this.loadThread(this.props.thread_id);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.setLayout);
  }

  switchToChannel() {
    this.props.switchToChannel(this.state.channel_id)
  }

  upvoteThread() {
    if (account_password === "") {
      this.props.showLogIn();
    }
    else {
      let data = {
        name: account_name,
        password: account_password,
        thread_id: this.props.thread_id,
      }

      serverFetch("upvoteThread", data).then(
        res => {
          switch (res) {
            case "add upvote": {
              this.setState(prev => {
                return {
                  rating: 1,
                  upvotes: prev.upvotes + 1
                };
              });
              break;
            }
            case "remove upvote": {
              this.setState(prev => {
                return {
                  rating: 0,
                  upvotes: prev.upvotes - 1
                };
              });
              break;
            }
            case "switch to upvote": {
              this.setState(prev => {
                return {
                  rating: 1,
                  upvotes: prev.upvotes + 1,
                  downvotes: prev.downvotes - 1
                }
              });
              break;
            }
            default: console.trace();
          }
        },
        err => console.log(err)
      );
    }
  }

  downvoteThread() {
    if (account_password === "") {
      this.props.showLogIn();
    }
    else {
      let data = {
        name: account_name,
        password: account_password,
        thread_id: this.props.thread_id,
      }

      serverFetch("downvoteThread", data).then(
        res => {
          switch (res) {
            case "add downvote": {
              this.setState(prev => {
                return {
                  rating: -1,
                  downvotes: prev.downvotes + 1
                };
              });
              break;
            }
            case "remove downvote": {
              this.setState(prev => {
                return {
                  rating: 0,
                  downvotes: prev.downvotes - 1
                };
              });
              break;
            }
            case "switch to downvote": {
              this.setState(prev => {
                return {
                  rating: -1,
                  upvotes: prev.upvotes - 1,
                  downvotes: prev.downvotes + 1
                }
              });
              break;
            }
            default: console.trace();
          }
        },
        err => console.log(err)
      );
    }
  }

  subscribeToThreadSet() {
    if (account_password === "") {
      this.props.showLogIn();
    }
    else {
      let data = {
        name: account_name,
        password: account_password,
        thread_set_id: this.state.thread_set_id
      }

      serverFetch("subscribeToThreadSet", data).then(
        res => {
          switch (res) {
            case "unsubscribed":
              this.setState(prev => {
                return {
                  thread_set_subs: prev.thread_set_subs - 1,
                  subscribed: false
                }
              });
              break;

            case "subscribed":
              this.setState(prev => {
                return {
                  thread_set_subs: prev.thread_set_subs + 1,
                  subscribed: true
                }
              });
              break;
            default: console.trace();
          }
        },
        err => console.log(err),
      );
    }
  }

  addOrRemoveReplyTarget(comment: CommentReplyTarget) {
    if (account_password === "") {
      this.props.showLogIn();
    }
    else {
      this.setState(prev => {
        
        // Signal to Comment to be highlighted
        let new_last_comment_render_key = prev.last_comment_render_key;
        let new_comment_props: CommentProps[] = Object.assign([], prev.comments_props);

        for (let i = 0; i < new_comment_props.length; i++) {
          if (new_comment_props[i].id === comment.id) {
            new_comment_props[i].is_reply_target = new_comment_props[i].is_reply_target ? false : true;
            new_comment_props[i].render_key = ++new_last_comment_render_key;
            break;
          }
        }

        let new_reply_targets: CommentReplyTarget[] = Object.assign([], prev.reply_targets);

        let existing = false;
        for (let i = 0; i < new_reply_targets.length; i++) {
          if (new_reply_targets[i].id === comment.id) {
            new_reply_targets.splice(i, 1);
            existing = true;
            break;
          }
        }
        if (!existing) {
          new_reply_targets.push(comment);
        }

        return {
          last_comment_render_key: new_last_comment_render_key,
          comments_props: new_comment_props,

          show_comment_box: true,   
          reply_targets: new_reply_targets,
        };
      });
    }
  }

  replyToComments() {
    let reply_text = (document.getElementById("reply_textarea") as HTMLInputElement).value;

    let new_parent_comment_ids: string[] = [];
    for (let reply_target of this.state.reply_targets) {
      new_parent_comment_ids.push(reply_target.id);
    }

    let req_body = {
      name: account_name,
      password: account_password,
      thread_id: this.props.thread_id,
      parent_comment_ids: new_parent_comment_ids,
      text: reply_text,
    };

    serverFetch("replyToComments", req_body).then(
      (res: any) => {
        
        this.setState((prev) => {
          let new_last_key = prev.last_comment_render_key;
          let new_comment_props: CommentProps[] = Object.assign([], prev.comments_props);

          let last_parent = prev.reply_targets[prev.reply_targets.length - 1]

          // insert position = after last reply target
          let insert_idx = 0;
          let parent_level = 0;
          for (let comment_prop of new_comment_props) {
            if (comment_prop.id === last_parent.id) {
              parent_level = comment_prop.level;
              break;
            }
            insert_idx++;
          }

          // create local comment
          let reply = new CommentProps();
          reply.id = res.id;
          reply.parents = prev.reply_targets;
          reply.user_icon = account_icon_img;
          reply.user_name = account_name;
          reply.date = new Date();
          reply.upvotes = 0;
          reply.downvotes = 0;
          reply.rating = 0;
          reply.text = reply_text;
          reply.level = parent_level + 1;
          reply.is_reply_target = false;
          reply.render_key = ++new_last_key;

          new_comment_props.splice(insert_idx + 1, 0, reply);

          return {
            last_comment_render_key: new_last_key,
            comments_props: new_comment_props,
          }
        })

        this.endReplying();
      },
      err => console.log(err)
    )
  }

  endReplying() {
    this.setState(prev => {

      // Clear is reply target flag on all comments
      let new_last_comment_render_key = prev.last_comment_render_key;
      let new_comment_props: CommentProps[] = Object.assign([], prev.comments_props);

      for (let i = 0; i < new_comment_props.length; i++) {
        new_comment_props[i].is_reply_target = false;
        new_comment_props[i].render_key = ++new_last_comment_render_key;
      }

      return {
        last_comment_render_key: new_last_comment_render_key,
        comments_props: new_comment_props,

        show_comment_box: false,   
        reply_targets: [],
      };
    });
  }

  upvoteComment(comment_id: string) {
    if (account_password === "") {
      this.props.showLogIn();
    }
    else {
      let body = {
        name: account_name,
        password: account_password,
        comment: comment_id,
      }

      serverFetch("upvoteComment", body).then(
        res => {
          this.setState((prev) => {

            let new_last_comment_render_key = prev.last_comment_render_key;
            let new_comment_props: CommentProps[] = Object.assign([], prev.comments_props);

            for (let i = 0; i < new_comment_props.length; i++) {
              if (new_comment_props[i].id === comment_id) {

                new_comment_props[i].render_key = ++new_last_comment_render_key;

                switch (res) {
                  case "switched": {
                    new_comment_props[i].upvotes += 1;
                    new_comment_props[i].downvotes -= 1;
                    new_comment_props[i].rating = 1;
                    break;
                  }
                  case "removed": {
                    new_comment_props[i].upvotes -= 1;
                    new_comment_props[i].rating = 0;
                    break;
                  }
                  case "added": {
                    new_comment_props[i].upvotes += 1;
                    new_comment_props[i].rating = 1;
                  }
                }
                break;
              }
            }

            return {
              last_comment_render_key: new_last_comment_render_key,
              comments_props: new_comment_props,
            }
          });
        },
        err => console.log(err)
      );
    }
  }

  downvoteComment(comment_id: string) {
    if (account_password === "") {
      this.props.showLogIn();
    }
    else {
      let body = {
        name: account_name,
        password: account_password,
        comment: comment_id,
      }

      serverFetch("downvoteComment", body).then(
        res => {
          this.setState((prev) => {

            let new_last_comment_render_key = prev.last_comment_render_key;
            let new_comment_props: CommentProps[] = Object.assign([], prev.comments_props);

            for (let i = 0; i < new_comment_props.length; i++) {
              if (new_comment_props[i].id === comment_id) {

                new_comment_props[i].render_key = ++new_last_comment_render_key;

                switch (res) {
                  case "switched": {
                    new_comment_props[i].downvotes += 1;
                    new_comment_props[i].upvotes -= 1;
                    new_comment_props[i].rating = -1;
                    break;
                  }
                  case "removed": {
                    new_comment_props[i].downvotes -= 1;
                    new_comment_props[i].rating = 0;
                    break;
                  }
                  case "added": {
                    new_comment_props[i].downvotes += 1;
                    new_comment_props[i].rating = -1;
                  }
                }
                break;
              }
            }

            return {
              last_comment_render_key: new_last_comment_render_key,
              comments_props: new_comment_props,
            }
          });
        },
        err => console.log(err)
      );
    }
  }

  render() {
    if (!this.state.loaded) {
      return null;
    }

    // Rating Styling
    let up_btn_classes = "btn up";
    let down_btn_classes = "btn down";
    let bar_classes = "bar bar_color_off";
    let fill_classes = "fill fill_color_off"

    if (this.state.rating > 0) {
      up_btn_classes = "btn up up_on";
      bar_classes = "bar bar_color_gray";
      fill_classes = "fill fill_color_on";
    }
    else if (this.state.rating < 0) {
      down_btn_classes = "btn down down_on";
      bar_classes = "bar bar_color_on";
      fill_classes = "fill fill_color_gray";
    }

    let fill_width = "50%";
    if (this.state.upvotes || this.state.downvotes) {
      let num = (this.state.upvotes / (this.state.upvotes + this.state.downvotes)) * 100;
      fill_width = num.toString() + "%";
    }

    // Subscribe Button Styling
    let subscribe_btn_classes = "subscribe_btn subscribe_btn_on";
    let subscribe_btn_txt = "Subscribe";

    if (this.state.subscribed) {
      subscribe_btn_classes = "subscribe_btn subscribe_btn_off";
      subscribe_btn_txt = "Subscribed";
    }

    let content_footer = (
      <>
        <div className="title">
          <p>{this.state.title}</p>
        </div>
        <div className="content_stats">
          <div className="ViewsDate">
            <p className="num">{SplitNumber(this.state.views)}</p>
            <p className="views">views</p>
            <p className="dot">{String.fromCharCode(0x2022)}</p>
            <p className="dt">{SimplifiedDate(new Date(this.state.date))}</p>
          </div>
          <div className="Rating">
            <div className="numbers">
              <div className={up_btn_classes} onClick={this.upvoteThread}>
                <p className="value">{SplitNumber(this.state.upvotes)}</p>
                <p>up</p>
              </div>
              <div className={down_btn_classes} onClick={this.downvoteThread}>
                <p className="value">{SplitNumber(this.state.downvotes)}</p>
                <p>down</p>
              </div>
            </div>
            <div className={bar_classes}>
              <div className={fill_classes} style={{width: fill_width}}></div>
            </div>
          </div>
        </div>
        <div className="ContentDescription">
          <img className="thread_set_img" src={this.state.thread_set_img} alt="Thread Set" onClick={this.switchToChannel}></img>
          <div className="right_side">
            <div className="ThreadSetbar">
              <div className="thread_set">
                <p className="name">{this.state.thread_set_name}</p>
                <div className="subs">
                  <p className="value">{SimplifyNumber(this.state.thread_set_subs)}</p>
                  <p>subs</p>
                </div>
              </div>
              <div className="thread_set_btns">
                <button className={subscribe_btn_classes} onClick={this.subscribeToThreadSet}>{subscribe_btn_txt}</button>
              </div>
            </div>
            <p className="description">{this.state.descp}</p>
          </div>
        </div>
      </>
    );

    let recomendations = (
      <div className="recomendations">
        {this.state.recomendations.map(recomendation => {
          return <Recomendation key={recomendation.thread_id}
            thread_id={recomendation.thread_id}
            channel_id={recomendation.channel_id}

            preview_img={recomendation.preview_img}
            title={recomendation.title}
            thread_set_name={recomendation.thread_set_name}
            views={recomendation.views}
            date={new Date(recomendation.date)}

            switchTo={this.props.switchToThread}
            switchToChannel={this.props.switchToChannel}
          />
        })}
      </div>
    )

    let comments = (
      <div className="comments">
        {this.state.comments_props.map((comment_props) => {
          return <Comment key={comment_props.render_key}
            id={comment_props.id}
            parents={comment_props.parents}

            user_name={comment_props.user_name}
            user_icon={comment_props.user_icon}     
            
            date={new Date(comment_props.date)}
            upvotes={comment_props.upvotes}
            downvotes={comment_props.downvotes}
            rating={comment_props.rating}
            text={comment_props.text}
            level={comment_props.level}

            // Client
            is_reply_target={comment_props.is_reply_target}
            render_key={comment_props.render_key}

            // Functions}
            addOrRemoveReplyTarget={this.addOrRemoveReplyTarget}
            upvoteComment={this.upvoteComment}
            downvoteComment={this.downvoteComment}
          />;
        })}
      </div>
    );

    let comment_box = null;
    if (this.state.show_comment_box) {
      comment_box = (
        <ReplyBox
          parents={this.state.reply_targets}

          endReplying={this.endReplying}
          replyToComments={this.replyToComments}
        />
      )
    }

    let render_content = null;
    if (this.state.layout === "horizontal") {
      render_content = (
        <div className="ThreadHorizontal">
          <div className="left_side">
            <div className="ThreadContent">
              <Media
                media={this.state.media}
                mime_type={this.state.media_mime_type}
                css_img_class="thread_img"
                css_video_class="thread_video"
                controls={true}
                autoplay={true}
                loop={false}
                muted={true}  // change back
              />
            </div>
            <div className="ThreadContext">
              {content_footer}
              {comments}
            </div>
          </div>   
          {recomendations}

          {/* Display Fixed */}
          {comment_box}
        </div>
      );
    }
    else {
      render_content = (
        <div className="ThreadVertical">
          <div className="ThreadContent">
            <Media
              media={this.state.media}
              mime_type={this.state.media_mime_type}
              css_img_class="thread_img"
              css_video_class="thread_video"
              controls={true}
              autoplay={true}
              loop={false}
              muted={true}  // change back
            />
          </div>
          <div className="ThreadContext">
            {content_footer}
            {recomendations}
            <div className="separator"></div>
            {comments}
          </div>

          {/* Display Fixed */}
          {comment_box}
        </div>
      );
    }

    return render_content;
  }
}
