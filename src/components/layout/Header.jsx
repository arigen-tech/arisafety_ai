import React from 'react'
import { Link } from 'react-router-dom'

export const Header = ({onShowSideMenu}) => {
  return (
    <>
      <header>
        <div className="header-flex">
          <div className="itemsLeft">
            <button className="menuBtn" onClick={onShowSideMenu}><img src="images/icons/hamburger-icon.svg" alt="icon" /></button>
            <h1>ARI-SAFE AI</h1>
          </div>

          <div className="itemsRight">
            {/* Notification */}
            <div className="notification">
              <a href="javascript:void(0)">
                <img src="images/icons/bell-icon.svg" alt="bell icon" />
                <span>5</span>
              </a>
            </div>

            {/* User */}
            <div className="user-profile">
              <a href="javascript:void(0)">
                <div className="user-info"><span>Admin</span></div>
                <div className="userIcon">AD</div>
              </a>
              <div className="user-dropdown">
                <div className="items">
                  <Link to="javascript:void(0)">
                    <img src="images/icons/edit-icon.svg" alt="edit icon" /> <span>Edit
                      Profile</span>
                  </Link>

                  <Link to="/">
                    <img src="images/icons/logout-icon.svg" alt="logout icon" />
                    <span>Logout</span>
                  </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header >
    </>
  )
}
