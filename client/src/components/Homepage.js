import React from 'react'

const Homepage = ({}) => {
 
  return (
    <div className="homepage">
    <div className="navbar">
      <div className="left">
        <h1>ChatName</h1>
      </div>
      <div className="right">
        <button>Sign In</button>
      </div>
    </div>
    <div className="content">
      <p>Welcome to our chatting app!</p>
    </div>
    <footer className="footer">
      <div>Made By: Somiran Dutta, India</div>
      <div className="reach-me">
        <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
          <img src="twitter_icon.png" alt="Twitter" className="social-icon" />
        </a>
        <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
          <img src="instagram_icon.png" alt="Instagram" className="social-icon" />
        </a>
        <a href="mailto:somiran@example.com">
          <img src="email_icon.png" alt="Email" className="social-icon" />
        </a>
        <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
          <img src="github_icon.png" alt="GitHub" className="social-icon" />
        </a>
      </div>
    </footer>
  </div>
  )
}

export default Homepage
