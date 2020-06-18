import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// Required Assets
import site_logo_img from "./assets/site_logo.jpg"
import anon_account_img from "./assets/anon_account.png"

// @ts-check

// Utils (move to other file)

/** remove if already in array else push element */
function addOrRemoveArrayElement(arr: any[], elem: any) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === elem) {
      arr.splice(i, 1);
      return;
    }
  }

  arr.push(elem);
}

// Globals
var account_name: string = "Anonimus";
var account_password: string = "";

function serverFetch(relative_url: RequestInfo, data: any = null) {

  let server_url;
  let client_url;

  // local
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined) {
    server_url = "http://localhost:3001/" + relative_url;
    client_url = "http://localhost:3000/";
  }
  // heroku deploy
  else {
    server_url = "https://contenthostingserver.herokuapp.com:443/" + relative_url;
    client_url = "https://contenthostingclient.herokuapp.com:443/";
  }

  let headers = new Headers();
  headers.set("Origin", client_url);
  headers.set("Content-Type", "application/json");
  headers.set("Access-Control-Request-Method", "POST");
  headers.set("Access-Control-Request-Headers", "Origin, Content-Type, Accept");

  let req_body = "";
  if (data !== null) {
    req_body = JSON.stringify(data);
  }

  let req = new Request(server_url, {
    method: "POST",
    mode: "cors",
    headers: headers,
    body: req_body,
  });

  return new Promise((resolve, reject) => {
    fetch(req).then(
      response => {
        if (response.status === 200) {
          response.json().then(
            res_body => resolve(res_body),
            fail => reject("failed to parse fetched json: " + fail));
        }
        else if (response.status === 500) {
          response.json().then(
            res_body => reject(res_body),
            fail => reject("failed to parse fetched json: " + fail));
        }
        else {
          return reject("bad response from server: " + response.statusText);
        }
      },
      fail => reject("network failure on fetch: " + fail));
  });
}


type ThreadCardProps = {
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

type ThreadCardState = {
  switchTo_bind: any
}

class ThreadCard extends React.Component<ThreadCardProps, ThreadCardState, {}> {
  constructor(props: ThreadCardProps) {
    super(props)

    this.state = {
      switchTo_bind: props.switchTo.bind(this, props.thread_id), // needs a check
    }
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
        <div className="VerticalThreadCard" onClick={this.state.switchTo_bind}>
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
        <div className="HorizontalThreadCard" onClick={this.state.switchTo_bind}>
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


type HomeThreadsProps = {
  switchToThread: (thread_id: string) => void
}

type HomeThreadsState = {
  thread_cards: ThreadCardProps[],
}

class HomeThreads extends React.Component<HomeThreadsProps, HomeThreadsState, {}> {
  constructor(props: HomeThreadsProps) {
    super(props)
    this.state = {
      thread_cards: [],
    }
  }

  loadThreadCards() {
    serverFetch("getHomeThreadCards").then(
      (res: any) => {
        this.setState({
          thread_cards: res.thread_cards
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
        {this.state.thread_cards.map((thread_card) => {
          return <ThreadCard key={thread_card.thread_id}
            thread_id={thread_card.thread_id}
            preview_img={thread_card.preview_img}
            thread_set_img={thread_card.thread_set_img}
            title={thread_card.title}
            thread_set_name={thread_card.thread_set_name}
            views={thread_card.views}
            date={new Date(thread_card.date)}
            layout="vertical"

            switchTo={this.props.switchToThread}
          />
        })}
      </div>
    );
  }
}


function SimplifyNumber(num: number) {
  if (num > 999_999) {
    return (num / 1_000_000).toFixed(2) + "M";
  }
  else if (num > 999) {
    return (num / 1000).toFixed(2) + "K";
  }

  return num.toString();
}

function SplitNumber(num: number) {
  let string_num = num.toString();
  let new_string_num = "";

  let digit_count = 0;
  for (let i = string_num.length - 1; i >=0; i--) {
    digit_count++;
    if (digit_count === 4) {
      new_string_num = string_num[i] + "." + new_string_num
      digit_count = 1;
    }
    else {
      new_string_num = string_num[i] + new_string_num;
    }
  }
  return new_string_num;
}

function SimplifiedDate(date: Date) {
  let months: number | string = date.getUTCMonth();
  if (months < 10) {
    months = "0" + months.toString();
  }
  else {
    months = months.toString();
  }
  return date.getUTCDate().toString() + "." + months + "." + date.getUTCFullYear().toString();
}

function StyledViewsAndDate(props: { views: number; date: Date; css_class: string; }) {
  return (
    <div className={props.css_class}>
      <p>{SimplifyNumber(props.views)}</p>
      <p className="views">views</p>
      <p className="dot">{String.fromCharCode(0x2022)}</p>
      <p>{SimplifiedDate(props.date)}</p>
    </div>
  );
}


class CommentProps {
  id: string = "";
  user_icon: string = "";
  user_name: string = "";
  date: Date = new Date();
  upvotes: number = -1;
  downvotes: number = -1;
  text: string = "";
  level: number = -1;

  // Client
  is_reply_target: boolean = false;
  render_key: number = -1;

  // Functions
  addOrRemoveReplyTarget: (comment_id: string) => void = () => {};
}

class Comment extends React.Component<CommentProps, {}, {}> {
  constructor(props: CommentProps) {
    super(props);

    // Bindings
    this.toggleReplyTarget = this.toggleReplyTarget.bind(this);
  }

  toggleReplyTarget() {
    this.props.addOrRemoveReplyTarget(this.props.id);
  }

  render() {
    let comment_classes = "Comment";
    if (this.props.is_reply_target) {
      comment_classes = "Comment CommentReplyTarget";
    }
    let indent = this.props.level * 25;

    return (
      <div className={comment_classes} style={{paddingLeft: indent}}>
        <img src={this.props.user_icon} alt="comment"></img>
        <div className="right_side">
          <div className="top_bar">
            <p className="user_name">{this.props.user_name}</p>
            <p className="date">{SimplifiedDate(this.props.date)}</p>
            <div className="up gray">
              <p className="upvotes_value">{this.props.upvotes}</p>
              <p className="upvotes_txt">up</p>
            </div>
            <div className="down gray">
              <p className="downvotes_value">{this.props.downvotes}</p>
              <p className="downvotes_txt">down</p>
            </div>
          </div>
          <div className="text">
            <p>{this.props.text}</p>
          </div>
          <div className="CommentBtns">
            <button className="reply_btn comment_btn" onClick={this.toggleReplyTarget}>reply</button>
            <button className="report_btn">report</button>
          </div>
        </div>
      </div>
    );
  }
}

type CommentBoxProps = {
  // Functions
  endReplying: () => void,
  replyToComments: () => void,
}

class CommentBox extends React.Component<CommentBoxProps> {
  // constructor(props: CommentBoxProps) {
  //   super(props)
  // }

  render() {
    return (
      <div className="CommentBox">
        <div className="header">
          <button className="close_btn" onClick={this.props.endReplying}>Close</button>
        </div>
        <textarea id="reply_textarea" placeholder="Reply here . . ."></textarea>
        <div className="footer">
          <button className="reply_btn" onClick={this.props.replyToComments}>Reply</button>
        </div>
      </div>
    );
  }
}


type ThreadProps = {
  thread_id: string,

  // Functions
  showLogIn: () => void,
  switchToThread: (thread_id: string) => void,
}

type ThreadState = {
  loaded: boolean,

  img: string,
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

  // Comments
  last_comment_render_key: number,
  comments_props: CommentProps[],

  // Thread Cards
  thread_cards: ThreadCardProps[],

  // Comment Box
  show_comment_box: boolean,
  reply_targets: string[],

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

      img: "",
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

      last_comment_render_key: -1,
      comments_props: [],
      thread_cards: [],

      // Visual
      layout: initial_layout,

      // Comment Box
      show_comment_box: true,
      reply_targets: [],
    }

    // Bindings
    this.setLayout = this.setLayout.bind(this);
    this.upvoteThread = this.upvoteThread.bind(this);
    this.downvoteThread = this.downvoteThread.bind(this);
    this.subscribeToThreadSet = this.subscribeToThreadSet.bind(this);

    this.addOrRemoveReplyTarget = this.addOrRemoveReplyTarget.bind(this);
    this.endReplying = this.endReplying.bind(this);
    this.replyToComments = this.replyToComments.bind(this);
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

  loadThread(thread_id: string) {
    if (account_password !== "") {

      let data = {
        thread_id: thread_id,
        name: account_name,
        password: account_password
      };

      serverFetch("getThreadLoggedIn", data).then(
        (res: any) => {
          let last_comment_render_key = 0;

          let new_comments_props: CommentProps[] = [];
          for (let server_comment of res.comments) {
            let new_comment_props = new CommentProps();
            new_comment_props.id = server_comment.id;
            new_comment_props.user_icon = server_comment.user_icon;
            new_comment_props.user_name = server_comment.user_name;
            new_comment_props.date = server_comment.date;
            new_comment_props.upvotes = server_comment.upvotes;
            new_comment_props.downvotes = server_comment.downvotes;
            new_comment_props.text = server_comment.text;
            new_comment_props.level = server_comment.level;

            new_comment_props.is_reply_target = false;
            new_comment_props.render_key = last_comment_render_key;

            new_comments_props.push(new_comment_props);

            last_comment_render_key++;
          }

          this.setState({
            loaded: true,

            img: res.img,
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
            
            last_comment_render_key: last_comment_render_key,
            comments_props: new_comments_props,
            thread_cards: res.thread_cards,
          });
        },
        err => console.log(err)
      );
    }
    else {
      let data = {
        thread_id: thread_id
      };
  
      serverFetch("getThread", data).then(
        (res: any) => {
          let last_comment_render_key = 0;

          let new_comments_props: CommentProps[] = [];
          for (let server_comment of res.comments) {
            let new_comment_props = new CommentProps();
            new_comment_props.id = server_comment.id;
            new_comment_props.user_icon = server_comment.user_icon;
            new_comment_props.user_name = server_comment.user_name;
            new_comment_props.date = server_comment.date;
            new_comment_props.upvotes = server_comment.upvotes;
            new_comment_props.downvotes = server_comment.downvotes;
            new_comment_props.text = server_comment.text;
            new_comment_props.level = server_comment.level;

            new_comment_props.is_reply_target = false;
            new_comment_props.render_key = last_comment_render_key;

            new_comments_props.push(new_comment_props);

            last_comment_render_key++;
          }

          this.setState({
            loaded: true,
  
            img: res.img,
            title: res.title,
            views: res.views,
            date: res.date,
            upvotes: res.up_votes,
            downvotes: res.down_votes,
            rating: 0,
            descp: res.descp,
            
            thread_set_id: res.thread_set_id,
            thread_set_img: res.thread_set_img,
            thread_set_name: res.thread_set_name,
            thread_set_subs: res.thread_set_subs,
            subscribed: false,
            
            last_comment_render_key: last_comment_render_key,
            comments_props: new_comments_props,
            thread_cards: res.thread_cards,
          })
        },
        err => console.log(err)
      );
    }
  }

  componentDidMount() {
    window.onresize = this.setLayout;

    this.loadThread(this.props.thread_id);
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

  addOrRemoveReplyTarget(comment_id: string) {
    if (account_password === "") {
      this.props.showLogIn();
    }
    else {
      this.setState(prev => {
        
        // Signal to Comment to be highlighted
        let new_last_comment_render_key = prev.last_comment_render_key;
        let new_comment_props: CommentProps[] = Object.assign([], prev.comments_props);

        for (let i = 0; i < new_comment_props.length; i++) {
          if (new_comment_props[i].id === comment_id) {
            new_comment_props[i].is_reply_target = new_comment_props[i].is_reply_target ? false : true;
            new_comment_props[i].render_key = ++new_last_comment_render_key;
            break;
          }
        }

        let new_reply_targets: string[] = Object.assign([], prev.reply_targets);
        addOrRemoveArrayElement(new_reply_targets, comment_id);

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

    let req_body = {
      name: account_name,
      password: account_password,
      thread_id: this.props.thread_id,
      parent_comment_ids: this.state.reply_targets,
      text: reply_text,
    };

    serverFetch("replyToComments", req_body).then(
      (res: any) => {
        console.log("success");
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
          <div className="views">
            <p className="num">{SplitNumber(this.state.views)}</p>
            <p>views</p>
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
          <img src={this.state.thread_set_img} alt="Thread Set"></img>
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
        {this.state.thread_cards.map(thread_card => {
          return <ThreadCard key={thread_card.thread_id}
            thread_id={thread_card.thread_id}
            preview_img={thread_card.preview_img}
            title={thread_card.title}
            thread_set_name={thread_card.thread_set_name}
            thread_set_img={thread_card.thread_set_img}
            views={thread_card.views}
            date={new Date(thread_card.date)}
            layout={"horizontal"}

            switchTo={this.props.switchToThread}
          />
        })}
      </div>
    )

    let comments = (
      <div className="comments">
        {this.state.comments_props.map((comment_props, idx) => {
          return <Comment key={comment_props.render_key}
            id={comment_props.id}
            level={comment_props.level}
            user_name={comment_props.user_name}
            user_icon={comment_props.user_icon}     
            date={new Date(comment_props.date)}
            upvotes={comment_props.upvotes}
            downvotes={comment_props.downvotes}
            text={comment_props.text}

            // Client
            is_reply_target={comment_props.is_reply_target}
            render_key={comment_props.render_key}

            // Functions}
            addOrRemoveReplyTarget={this.addOrRemoveReplyTarget}
          />;
        })}
      </div>
    );

    let comment_box = null;
    if (this.state.show_comment_box) {
      comment_box = (
        <CommentBox 
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
              <img src={this.state.img} alt="thread content"></img>
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
            {/* <img src={this.state.img} alt="thread content"></img> */}
          </div>
          <div className="ThreadContext">
            {/* {content_footer} */}
            {/* {recomendations} */}
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

type MainMenuState = {
  account_icon_img: string,

  // Overlays
  show_content_bar: boolean,
  show_account_menu: boolean,

  // Login Prompt
  show_login_prompt: boolean,
  login_name_error: boolean,
  login_password_error: boolean,
  disable_login_btn: boolean,

  // Site Content
  content_mode: string,
  thread_id: string,
}

class MainMenu extends React.Component<{}, MainMenuState, {}> {
  constructor(props: {}) {
    super(props)
    this.state = {
      account_icon_img: anon_account_img,

      // Overlays
      show_content_bar: false,
      show_account_menu: false,

      // Login Prompt
      show_login_prompt: false,
      login_name_error: false,
      login_password_error: false,
      disable_login_btn: true,

      // Site Content
      content_mode: "",
      thread_id: "",
    }

    this.toggleContentBar = this.toggleContentBar.bind(this);
    this.toggleAccountMenu = this.toggleAccountMenu.bind(this);
    this.showLogIn = this.showLogIn.bind(this);
    this.disableOverlays = this.disableOverlays.bind(this);

    this.checkIfNameAndPasswordAreSet = this.checkIfNameAndPasswordAreSet.bind(this);
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);

    this.switchToHome= this.switchToHome.bind(this);
    this.switchToThread = this.switchToThread.bind(this);
  }

  componentDidMount() {
     // DEVELOPMENT_ONLY
    this.switchToThread("5eeb0d06f566180640067b0b");

    let req = {
      name: sessionStorage.getItem("account_name"),
      password: sessionStorage.getItem("account_password")
    };

    // if bad then fallback to local storage
    if (req.name === null || req.password === null) {

      req.name = localStorage.getItem("account_name");
      req.password = localStorage.getItem("account_password");

      if (req.name === null || req.password === null) {
        return;
      }
    }

    serverFetch("logInUser", req).then(
      (res: any) => {
          account_name = req.name!;
          account_password = req.password!;

          this.setState({
            account_icon_img: res.account_icon_img,
          })
      },
      err => {
        console.log(err);
      }
    )
  }

  toggleContentBar() {
    this.setState((prev) => {
      return prev.show_content_bar ? {show_content_bar: false} : {show_content_bar: true};
    });
  }

  toggleAccountMenu() {
    this.setState((prev) => {
      return prev.show_account_menu ? {show_account_menu: false} : {show_account_menu: true}
    })
  }

  showLogIn() {
    (document.getElementById("LogInNameField") as HTMLInputElement).value = "";
    (document.getElementById("LogInPasswordField") as HTMLInputElement).value = "";

    this.setState({
      show_account_menu: false,
      show_login_prompt: true,
      login_name_error: false,
      login_password_error: false,
      disable_login_btn: true,
    })
  }

  disableOverlays() {
    this.setState({
      show_content_bar: false,
      show_account_menu: false,
      show_login_prompt: false,
    })
  }

  checkIfNameAndPasswordAreSet() {
    let name = (document.getElementById("LogInNameField") as HTMLInputElement).value;
    let password = (document.getElementById("LogInPasswordField") as HTMLInputElement).value;

    if (name.length && password.length) {
      this.setState({
        disable_login_btn: false
      })
    }
    else {
      this.setState({
        disable_login_btn: true
      })
    }
  }

  logIn() {
    let req = {
      name: (document.getElementById("LogInNameField") as HTMLInputElement).value,
      password: (document.getElementById("LogInPasswordField") as HTMLInputElement).value
    };

    serverFetch("logInUser", req).then(
      (res: any) => {
        if (res.err === "") {

          account_name = req.name;
          account_password = req.password;

          sessionStorage.setItem("account_name", req.name);
          sessionStorage.setItem("account_password", req.password);

          localStorage.setItem("account_name", req.name);
          localStorage.setItem("account_password", req.password);

          this.setState({          
            account_icon_img: res.account_icon_img,
            show_login_prompt: false,
          })
        }
        else if (res.err === "account name not found") {
          this.setState({
            login_name_error: true,
            login_password_error: false,
          });
        }
        else if (res.err === "wrong password") {
          this.setState({
            login_name_error: false,
            login_password_error: true,
          });
        }
      },
      err => {
        console.log(err);
      }
    )
  }

  logOut() {
    sessionStorage.clear();
    localStorage.clear();

    account_name = "Anonimus";
    account_password = "";

    this.setState({
      show_account_menu: false,  
      account_icon_img: anon_account_img,
    })
  }

  switchToHome() {
    this.setState({
      content_mode: "home",
    })
  }

  switchToThread(thread_id: string) {
    this.setState({
      content_mode: "thread",
      thread_id: thread_id,
    })
  }
  
  render() {
    let content_bar_left = "-252px";
    if (this.state.show_content_bar) {
      content_bar_left = "0px";
    }

    let account_dropdown = null;
    if (this.state.show_account_menu) {
      account_dropdown = (
        <div className="DropdownContent">
          <button className="Btn" onClick={this.showLogIn}>Log In</button>
          <button className="Btn">View Channel</button>
          <button className="Btn">Account Settings</button>
          <button className="Btn" onClick={this.logOut}>Log Out</button>
        </div>
      );
    }

    // Login Prompt
    let login_prompt_top = "-140px";
    if (this.state.show_login_prompt) {
      login_prompt_top = "50%";
    }

    let login_name_error_label = null;
    if (this.state.login_name_error) {
      login_name_error_label = (
        <p className="LoginError">(user name not found)</p>
      );
    }

    let login_password_error_label = null;
    if (this.state.login_password_error) {
      login_password_error_label = (
        <p className="LoginError">(wrong password)</p>
      );
    }

    // Background
    let background_click_receiver = null;
    if (this.state.show_content_bar || this.state.show_account_menu ||
      this.state.show_login_prompt)
    {
      background_click_receiver = (
        <div id="background_click_receiver" onClick={this.disableOverlays}></div>
      );
    }

    let site_content = null;
    switch (this.state.content_mode) {
      case "home": {
        site_content = (
          <HomeThreads
            // Functions
            switchToThread={this.switchToThread}
          />
        );
        break;
      }
      case "thread": {
        site_content = (
          <Thread
            thread_id={this.state.thread_id}

            // Functions
            showLogIn={this.showLogIn}
            switchToThread={this.switchToThread}
          />
        );
        break;
      }
      default: 
    }

    return (
      <>
        {/* Display Fixed Stuff */}
        {background_click_receiver}
        <div className="LeftBar" style={{left: content_bar_left}}>
          <button className="Btn">Fresh Content</button>
          <button className="Btn">Subscriptions</button>
          <button className="Btn">Bookmarked Threads</button>
          <button className="Btn">Bookmarked Comments</button>
          <button className="Btn">Thread History</button>
          <button className="Btn">Comment History</button>
        </div>
        <div className="LogInPrompt" style={{top: login_prompt_top}}>
          <div className="LogInHeader">
            <img className="site_logo" src={site_logo_img} alt="site logo"></img>
            <p>Log in to TheEdge</p>
          </div>
          <div className="LoginLabel">
            <p>User Name</p>
            {login_name_error_label}
          </div>
          <input id="LogInNameField" className="LogInName" 
            onKeyUp={this.checkIfNameAndPasswordAreSet}></input>
          <div className="LoginLabel">
            <p>User Password</p>
            {login_password_error_label}
          </div>
          <input id="LogInPasswordField" className="LogInPassword" type="password" 
            onKeyUp={this.checkIfNameAndPasswordAreSet}></input>
          <button className="LogInBtn" disabled={this.state.disable_login_btn} 
            onClick={this.logIn}>Log In</button>
        </div>
        
        {/* Normal Stuff */}
        <div className="header_bar">
          <div className="site">
            <img className="site_logo" onClick={this.switchToHome} src={site_logo_img} alt="site logo"></img>
            <button className="MenuBtn" onClick={this.toggleContentBar}>Menu</button>
          </div>
          <input className="search_field" type="text" placeholder="Search"></input>
          <div className="AccountDrop">
            <div className="DropdowntBtn" onClick={this.toggleAccountMenu}>
              <p className="name">{account_name}</p>
              <img className="img" src={this.state.account_icon_img} alt=""></img>
            </div>
            {account_dropdown}
          </div>
        </div>
        <div className="site_content">
          {site_content}
        </div>
      </>
    );
  }
}

ReactDOM.render(
  <MainMenu />,
  document.getElementById('root')
);
