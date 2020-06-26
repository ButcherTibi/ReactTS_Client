import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// Mine
import {
  site_logo_img,
  
  account_name,
  account_icon_img,

  setGlobalAccountName,
  setGlobalAccountPassword,
  setGlobalAccountImage,
  clearGlobalAccountName,
  clearGlobalAccountPassword,
  clearGlobalAccountImage,

  serverFetch,
  
  // ThreadCardProps,
  // ThreadCard,
} from "./common"

import {
  Thread
} from "./thread_page"

// type HomeThreadsProps = {
//   switchToThread: (thread_id: string) => void
// }

// type HomeThreadsState = {
//   thread_cards: ThreadCardProps[],
// }

// class HomeThreads extends React.Component<HomeThreadsProps, HomeThreadsState, {}> {
//   constructor(props: HomeThreadsProps) {
//     super(props)
//     this.state = {
//       thread_cards: [],
//     }
//   }

//   loadThreadCards() {
//     serverFetch("getHomeThreadCards").then(
//       (res: any) => {
//         this.setState({
//           thread_cards: res.thread_cards
//         })
//       },
//       (err: string) => {
//         console.log(err);
//       }
//     )
//   }

//   componentDidMount() {
//     this.loadThreadCards();
//   }

//   render() {
//     return (
//       <div className="HomeThreads">
//         {this.state.thread_cards.map((thread_card) => {
//           return <ThreadCard key={thread_card.thread_id}
//             thread_id={thread_card.thread_id}
//             preview_img={thread_card.preview_img}
//             thread_set_img={thread_card.thread_set_img}
//             title={thread_card.title}
//             thread_set_name={thread_card.thread_set_name}
//             views={thread_card.views}
//             date={new Date(thread_card.date)}
//             layout="vertical"

//             switchTo={this.props.switchToThread}
//           />
//         })}
//       </div>
//     );
//   }
// }

type MainMenuState = {
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
    let req = {
      name: sessionStorage.getItem("account_name"),
      password: sessionStorage.getItem("account_password")
    };

    // if bad then fallback to local storage
    if (req.name === null || req.password === null) {

      req.name = localStorage.getItem("account_name");
      req.password = localStorage.getItem("account_password");

      if (req.name === null || req.password === null) {

        // DEVELOPMENT_ONLY
        this.switchToThread("5eeb0d06f566180640067b0b");
        return;
      }
    }

    serverFetch("logInUser", req).then(
      (res: any) => {

          setGlobalAccountName(req.name!);
          setGlobalAccountPassword(req.password!);
          setGlobalAccountImage(res.account_icon_img!);

          // DEVELOPMENT_ONLY
          this.switchToThread("5eeb0d06f566180640067b0b");
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

          setGlobalAccountName(req.name);
          setGlobalAccountPassword(req.password);
          setGlobalAccountImage(res.account_icon_img);

          sessionStorage.setItem("account_name", req.name);
          sessionStorage.setItem("account_password", req.password);

          localStorage.setItem("account_name", req.name);
          localStorage.setItem("account_password", req.password);

          this.setState({
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

    clearGlobalAccountName();
    clearGlobalAccountPassword();
    clearGlobalAccountImage();

    this.setState({
      show_account_menu: false
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
        // site_content = (
        //   // <HomeThreads
        //   //   // Functions
        //   //   switchToThread={this.switchToThread}
        //   // />
        // );
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
              <img className="img" src={account_icon_img} alt=""></img>
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
