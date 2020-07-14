import React from 'react';


export {
  site_logo_img,

  account_name,
  account_password,
  account_icon_img,
  reply_box_pos,

  setGlobalAccountName,
  setGlobalAccountPassword,
  setGlobalAccountImage,
  clearGlobalAccountName,
  clearGlobalAccountPassword,
  clearGlobalAccountImage,
  setGlobalReplyBoxPosition,

  serverFetch,
  SimplifyNumber,
  SplitNumber,
  SimplifiedDate,
  StyledViewsAndDate,
  Media,
}


// Globals
var site_logo_img: string = require("./assets/site_logo.jpg")
var anon_account_img: string = require("./assets/anon_account.png");

var account_name: string = "Anonimus";
var account_password: string = "";
var account_icon_img: string = anon_account_img;

var reply_box_pos = {
  x: "calc(50% - 310px)",
  y: "calc(100% - 175px)",
};

function setGlobalAccountName(new_name: string) {
  account_name = new_name;
}

function setGlobalAccountPassword(new_password: string) {
  account_password = new_password;
}

function setGlobalAccountImage(new_image: string) {
  account_icon_img = new_image;
}

function clearGlobalAccountName() {
  account_name = "Anonimus";
}

function clearGlobalAccountPassword() {
  account_password = "";
}

function clearGlobalAccountImage() {
  account_icon_img = anon_account_img;
}

function setGlobalReplyBoxPosition(x: string, y: string ) {
  reply_box_pos.x = x;
  reply_box_pos.y = y;
}


function serverFetch(relative_url: RequestInfo, data: any = null) {

  let server_url: string;
  let client_url: string;

  // local
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined) {
    server_url = "http://localhost:3001/" + relative_url;
    client_url = "http://localhost:3000/";
  }
  // heroku deploy
  else {
    server_url = "https://contenthostingserver.herokuapp.com:443/" + relative_url;
    client_url = "https://thirsty-booth-85e1e5.netlify.app/";
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
        else {
          response.json().then(
            res_body => reject("bad response from server: " + response.statusText + " server error= " + res_body),
            fail => reject("failed to parse bad response from server:" + fail));
        }
      },
      fail => reject("network failure on fetch: " + fail));
  });
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
  for (let i = string_num.length - 1; i >= 0; i--) {
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


type MediaProps = {
  // Image
  media: string,
  mime_type: string,
  css_img_class: string,

  // Video
  css_video_class: string,
  controls: boolean,
  autoplay: boolean,
  loop: boolean,
  muted: boolean,
}

class Media extends React.Component<MediaProps> {
  constructor(props: MediaProps) {
    super(props)
  }

  render() {
    let content = null;
    switch (this.props.mime_type) {
      case "image/jpg": 
      case "image/jpeg": 
      case "image/png": {
        content = (
          <img className={this.props.css_img_class} src={this.props.media} alt="generic"></img>
        )
        break;
      }

      case "video/webm": {
        content = (
          <video className={this.props.css_video_class} src={this.props.media}
            controls={this.props.controls}
            autoPlay={this.props.autoplay}
            loop={this.props.loop}
            muted={this.props.muted}></video>
        )
        break;
      }

      default: console.trace();
    }

    return content;
  }
}
