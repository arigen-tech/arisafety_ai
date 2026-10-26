import React, { useEffect, useMemo, useState } from 'react'
import { FaRegUserCircle } from 'react-icons/fa'
import { FaEarthAmericas } from 'react-icons/fa6'
import { PiUserSwitchFill } from 'react-icons/pi'
import { Link } from 'react-router-dom'
import { getRequest, postRequest } from '../../service/apiService' 

const ROLE_ENDPOINT = '/api/catalog/role'
const SWITCH_ROLE_ENDPOINT = '/api/auth/switch-role'

const toArray = (json) => (Array.isArray(json) ? json : json?.data || json?.items || json?.rows || [])
let rolesRequest

const getRoles = () => {
  if (!rolesRequest) {
    rolesRequest = getRequest(ROLE_ENDPOINT)
      .then(toArray)
      .catch((error) => {
        rolesRequest = null
        throw error
      })
  }
  return rolesRequest
}

// "Team Lead" -> "TL", "Admin" -> "AD", "Field Officer" -> "FO"
const getInitials = (name = '') => {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '--'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

// localStorage se logged-in user safely read karo
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {}
  } catch {
    return {}
  }
}

export const Header = ({
  onShowSideMenu,
  language,
  onLanguageSelect,
  isTranslating,
  translationError,
}) => {
  const [roles, setRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [rolesError, setRolesError] = useState('')
  const [roleSwitching, setRoleSwitching] = useState(false)
  const [roleSwitchError, setRoleSwitchError] = useState('')

  const user = useMemo(getStoredUser, [])

  // login ke time ka role default hoga, dropdown se change bhi ho sakta hai
  const [selectedRoleId, setSelectedRoleId] = useState(
    () => localStorage.getItem('selectedRoleId') || String(user.role_id ?? '')
  )
  const [selectedRoleName, setSelectedRoleName] = useState(
    () => localStorage.getItem('selectedRoleName') || user.role_name || ''
  )
  useEffect(() => {
    let ignore = false

    const loadRoles = async () => {
      try {
        const list = await getRoles()
        if (ignore) return
        setRoles(list)

        // agar name saved nahi hai to API list se id match karke nikal lo
        if (!selectedRoleName && selectedRoleId) {
          const match = list.find((r) => String(r.role_id) === String(selectedRoleId))
          if (match) setSelectedRoleName(match.role_name)
        }
      } catch (err) {
        if (ignore) return
        console.error(err)
        setRolesError(err.message || 'Roles load nahi ho paye')
      } finally {
        if (!ignore) setRolesLoading(false)
      }
    }
    loadRoles()
    return () => { ignore = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRoleSelect = async (e, role) => {
    e.preventDefault()
    if (roleSwitching || String(role.role_id) === String(selectedRoleId)) return

    setRoleSwitching(true)
    setRoleSwitchError('')

    try {
      const response = await postRequest(SWITCH_ROLE_ENDPOINT, {
        role_id: Number(role.role_id),
      })
      const activeRoleId = String(response.active_role_id)
      const activeRoleName = response.active_role_name
      const storedUser = getStoredUser()

      localStorage.setItem('token', response.access_token)
      localStorage.setItem('expires_at', response.expires_at)
      localStorage.setItem('selectedRoleId', activeRoleId)
      localStorage.setItem('selectedRoleName', activeRoleName)
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...storedUser,
          user_id: response.user_id,
          role_id: response.active_role_id,
          role_name: activeRoleName,
        })
      )

      setSelectedRoleId(activeRoleId)
      setSelectedRoleName(activeRoleName)
      window.location.assign('/dashboard')
    } catch (err) {
      setRoleSwitchError(err.message || 'Role switch nahi ho paya')
    } finally {
      setRoleSwitching(false)
    }
  }

  const displayName = selectedRoleName || 'User'

  return (
    <>
      <header>
        <div className="header-flex">
          <div className="itemsLeft">
            <button className="menuBtn" onClick={onShowSideMenu}>
              <img src="images/icons/hamburger-icon.svg" alt="icon" />
            </button>
            <h1>AI Safety System</h1>
          </div>

          <div className="itemsRight">
            {/* Language */}
            <div className="user-profile noLine">
              <a href="#" onClick={(e) => e.preventDefault()}>
                <span className="icons"><FaEarthAmericas /></span>
                <div className="user-info"><span>Language</span></div>
              </a>
              <div className="user-dropdown">
                <div className="items">
                  <a
                    href="#"
                    className={language === "Hindi" ? "active" : ""}
                    aria-current={language === "Hindi" ? "true" : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      onLanguageSelect("Hindi")
                    }}
                  >
                    <span>&#x1F1EE;&#x1F1F3;</span>
                    <span>Hindi</span>
                  </a>
                  <a
                    href="#"
                    className={language === "English" ? "active" : ""}
                    aria-current={language === "English" ? "true" : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      onLanguageSelect("English")
                    }}
                  >
                    <span>&#x1F1FA;&#x1F1F8;</span>
                    <span>English</span>
                  </a>
                  <a
                    href="#"
                    className={language === "Marathi" ? "active" : ""}
                    aria-current={language === "Marathi" ? "true" : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      onLanguageSelect("Marathi")
                    }}
                  >
                    <span>&#x1F1EE;&#x1F1F3;</span>
                    <span>Marathi</span>
                  </a>
                  {isTranslating && (
                    <a href="#" onClick={(e) => e.preventDefault()} role="status">
                      <span>Translating...</span>
                    </a>
                  )}
                  {translationError && (
                    <a href="#" onClick={(e) => e.preventDefault()} role="alert">
                      <span>{translationError}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* User Role */}
            <div className="user-profile">
              <a href="#" onClick={(e) => e.preventDefault()}>
                <span className="icons"><PiUserSwitchFill /></span>
                <div className="user-info"><span>{displayName}</span></div>
              </a>
              <div className="user-dropdown">
                <div className="items">
                  {roleSwitching && (
                    <a href="#" onClick={(e) => e.preventDefault()}><span>Switching role...</span></a>
                  )}

                  {roleSwitchError && (
                    <a href="#" onClick={(e) => e.preventDefault()}><span>{roleSwitchError}</span></a>
                  )}

                  {rolesLoading && (
                    <a href="#" onClick={(e) => e.preventDefault()}><span>Loading...</span></a>
                  )}

                  {!rolesLoading && rolesError && (
                    <a href="#" onClick={(e) => e.preventDefault()}><span>{rolesError}</span></a>
                  )}

                  {!rolesLoading && !rolesError && roles.length === 0 && (
                    <a href="#" onClick={(e) => e.preventDefault()}><span>No roles found</span></a>
                  )}

                  {!rolesLoading && !rolesError && roles.map((role) => (
                    <a
                      key={role.role_id}
                      href="#"
                      title={role.description}
                      className={String(role.role_id) === String(selectedRoleId) ? 'active' : ''}
                      aria-disabled={roleSwitching}
                      onClick={(e) => handleRoleSelect(e, role)}
                    >
                      <FaRegUserCircle />
                      <span>{role.role_name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification */}
            <div className="notification">
              <a href="#" onClick={(e) => e.preventDefault()}>
                <img src="images/icons/bell-icon.svg" alt="bell icon" />
                <span>5</span>
              </a>
            </div>

            {/* User */}
            <div className="user-profile">
              <a href="#" onClick={(e) => e.preventDefault()}>
                <div className="user-info"><span>{displayName}</span></div>
                <div className="userIcon">{getInitials(displayName)}</div>
              </a>
              <div className="user-dropdown">
                <div className="items">
                  <Link to="/profile">
                    <img src="images/icons/edit-icon.svg" alt="edit icon" /> <span>Edit Profile</span>
                  </Link>
                  <Link
                    to="/"
                    onClick={() => {
                      localStorage.removeItem('user')
                      localStorage.removeItem('selectedRoleId')
                      localStorage.removeItem('selectedRoleName')
                      localStorage.removeItem('selectedMenuKey')
                    }}
                  >
                    <img src="images/icons/logout-icon.svg" alt="logout icon" />
                    <span>Logout</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}