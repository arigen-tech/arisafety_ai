import { Link } from 'react-router-dom';
import { FaEarthAmericas } from "react-icons/fa6";
import { PiUserSwitchFill } from "react-icons/pi";
import { FaRegUserCircle } from "react-icons/fa";

export const Header = ({ onShowSideMenu }) => {
  return (
    <>
      <header>
        <div className="header-flex">
          <div className="itemsLeft">
            <button className="menuBtn" onClick={onShowSideMenu}><img src="images/icons/hamburger-icon.svg" alt="icon" /></button>
            <h1>AI Safety System</h1>
          </div>

          <div className="itemsRight">
            {/* Language */}
            <div className="user-profile">
              <a href="javascript:void(0)">
                <span className='icons'><FaEarthAmericas /></span>
                <div className="user-info"><span>Language</span></div>
              </a>
              <div className="user-dropdown">
                <div className="items">
                  <Link to="javascript:void(0)">
                    <span>&#x1F1EE;&#x1F1F3;</span>
                    <span>Hindi</span>
                  </Link>

                  <Link>
                    <span>&#x1F1FA;&#x1F1F8;</span>
                    <span>English</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* User Role */}
            <div className="user-profile">
              <a href="javascript:void(0)">
                <span className='icons'><PiUserSwitchFill /></span>
                <div className="user-info"><span>Role</span></div>
              </a>
              <div className="user-dropdown">
                <div className="items">
                  <Link to="javascript:void(0)">
                    <FaRegUserCircle />
                    <span>Role Nmae here...</span>
                  </Link>
                  <Link to="/">
                    <FaRegUserCircle />
                    <span>Role Nmae here...</span>
                  </Link>
                  <Link to="/">
                    <FaRegUserCircle />
                    <span>Role Nmae here...</span>
                  </Link>
                </div>
              </div>
            </div>

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
                  <Link to="/profile">
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
