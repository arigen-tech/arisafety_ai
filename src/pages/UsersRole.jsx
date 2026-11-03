import { useEffect, useState } from 'react'
import { TitleBar } from '../components/UI/TitleBar'
import { MdEdit } from 'react-icons/md'
import { FaPlus } from 'react-icons/fa6'
import { TiLockClosed, TiLockOpen } from 'react-icons/ti'
import { AppAlert } from '../appAlert'
import { ENDPOINTS } from '../config/apiConfig'
import { getRequest, putRequest } from '../service/apiService'

const pick = (object, keys, fallback = '') => {
    for (const key of keys) {
        if (object?.[key] !== undefined && object[key] !== null) return object[key]
    }
    return fallback
}

const toArray = (response) => {
    const data = response?.data ?? response
    if (Array.isArray(data)) return data
    return data?.items ?? data?.users ?? data?.roles ?? data?.results ?? []
}

const getAssignedRoleIds = (user) => {
    const assignedRoles = user?.roles ?? user?.user_roles ?? user?.role_ids
    if (Array.isArray(assignedRoles)) {
        return assignedRoles
            .map((role) => typeof role === 'object'
                ? pick(role, ['role_id', 'roleId', 'id'])
                : role)
            .filter((id) => id !== '')
            .map(String)
    }

    const roleId = pick(user, ['role_id', 'roleId'])
    return roleId === '' ? [] : [String(roleId)]
}

const formatDate = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-GB')
}

export const UsersRole = () => {
    const [users, setUsers] = useState([])
    const [roleOptions, setRoleOptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [editingUser, setEditingUser] = useState(null)
    const [selectedRoleIds, setSelectedRoleIds] = useState([])
    const [saving, setSaving] = useState(false)
    const [roleChange, setRoleChange] = useState(false)

    useEffect(() => {
        let ignore = false

        const loadUsersAndRoles = async () => {
            setLoading(true)
            setLoadError('')
            try {
                const [userResponse, roleResponse] = await Promise.all([
                    getRequest(ENDPOINTS.USERS),
                    getRequest(ENDPOINTS.CATALOG_ROLE),
                ])
                if (ignore) return

                setUsers(toArray(userResponse))
                setRoleOptions(toArray(roleResponse))
            } catch (error) {
                console.error('Users and roles could not be loaded:', error)
                if (!ignore) setLoadError(error.message || 'Users and roles could not be loaded.')
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        loadUsersAndRoles()
        return () => { ignore = true }
    }, [])

    const openRoleEditor = (user) => {
        setEditingUser(user)
        setSelectedRoleIds(getAssignedRoleIds(user))
    }

    const closeRoleEditor = () => {
        if (saving) return
        setEditingUser(null)
        setSelectedRoleIds([])
    }

    const toggleRole = (roleId) => {
        const value = String(roleId)
        setSelectedRoleIds((current) => current.includes(value)
            ? current.filter((id) => id !== value)
            : [...current, value])
    }

    const saveRoles = async (event) => {
        event.preventDefault()
        const userId = pick(editingUser, ['user_id', 'userId', 'id'])
        if (!userId) {
            await AppAlert.fire({
                icon: 'error',
                title: 'User ID missing',
                text: 'Roles cannot be updated because this user has no ID.',
            })
            return
        }

        setSaving(true)
        try {
            await putRequest(ENDPOINTS.USER_ROLES(userId), {
                role_ids: selectedRoleIds.map(Number),
            })

            const selectedRoles = roleOptions.filter((role) =>
                selectedRoleIds.includes(String(pick(role, ['role_id', 'roleId', 'id'])))
            )
            setUsers((current) => current.map((user) =>
                String(pick(user, ['user_id', 'userId', 'id'])) === String(userId)
                    ? { ...user, role_ids: selectedRoleIds.map(Number), roles: selectedRoles }
                    : user
            ))
            setEditingUser(null)
            await AppAlert.fire({
                icon: 'success',
                title: 'User roles updated',
                text: 'The selected roles have been saved successfully.',
            })
        } catch (error) {
            console.error('User roles could not be updated:', error)
            await AppAlert.fire({
                icon: 'error',
                title: 'Could not update user roles',
                text: error.message || 'Please try again.',
            })
        } finally {
            setSaving(false)
        }
    }

    const getRoleNames = (user) => {
        const assignedIds = getAssignedRoleIds(user)
        const roles = user?.roles ?? user?.user_roles
        if (Array.isArray(roles) && roles.every((role) => typeof role === 'object')) {
            return roles.map((role) => pick(role, ['role_name', 'name'])).filter(Boolean).join(', ') || '-'
        }
        return roleOptions
            .filter((role) => assignedIds.includes(String(pick(role, ['role_id', 'roleId', 'id']))))
            .map((role) => pick(role, ['role_name', 'name'], ''))
            .filter(Boolean)
            .join(', ') || pick(user, ['role_name', 'roleName'], '-') || '-'
    }

    return (
        <>
            <TitleBar title="Mange User's Roles" />

            <div className="card">
                <div className="grid mb-30">
                    <div className="form-group">
                        <label>Name <span>*</span></label>
                        <input type="text" className="searchIcon" placeholder="" />
                    </div>
                    <div className="form-group">
                        <label>Business Unit <span>*</span></label>
                        <input type="text" className="searchIcon" placeholder="" />
                    </div>
                    <div className="form-group">
                        <label>Plant</label>
                        <input type="text" className="searchIcon" placeholder="" />
                    </div>
                    <div className="form-group">
                        <label>Department</label>
                        <input type="text" className="searchIcon" placeholder="" />
                    </div>
                    <div className="form-group">
                        <label>User Role</label>
                        <select defaultValue="">
                            <option value="">Select Role</option>
                            {roleOptions.map((role, index) => {
                                const roleId = pick(role, ['role_id', 'roleId', 'id'])
                                return <option key={roleId || index} value={roleId}>{pick(role, ['role_name', 'name'], '-')}</option>
                            })}
                        </select>
                    </div>
                    <div className="btn-group itemEnd">
                        <button type="button" className="btn btn-primary btnAdd">
                            <FaPlus /> <span>Add Role</span>
                        </button>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th className="text-center">S.No</th>
                                <th>Name</th>
                                <th>Business Unit</th>
                                <th>Plant</th>
                                <th>Department</th>
                                <th>User Role</th>
                                <th>Created Date</th>
                                <th>Updated Date</th>
                                <th>Created By</th>
                                <th>Updated By</th>
                                <th>Status</th>
                                <th className="text-center">Edit</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={13} className="text-center">Loading...</td></tr>
                            ) : loadError ? (
                                <tr><td colSpan={13} className="text-center" role="alert">{loadError}</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={13} className="text-center">No user roles found</td></tr>
                            ) : users.map((user, index) => {
                                const userId = pick(user, ['user_id', 'userId', 'id'])
                                const active = pick(user, ['is_active', 'active', 'status'], true)
                                const isActive = active === true || String(active).toLowerCase() === 'active' || String(active) === '1'
                                return (
                                    <tr key={userId || index}>
                                        <td className="text-center">{index + 1}</td>
                                        <td>{pick(user, ['name', 'full_name', 'fullName', 'username', 'email'], '-')}</td>
                                        <td>{pick(user, ['business_unit_name', 'business_unit', 'businessUnit'], '-')}</td>
                                        <td>{pick(user, ['plant_name', 'plant'], '-')}</td>
                                        <td>{pick(user, ['department_name', 'department'], '-')}</td>
                                        <td>{getRoleNames(user)}</td>
                                        <td>{formatDate(pick(user, ['created_at', 'createdAt']))}</td>
                                        <td>{formatDate(pick(user, ['updated_at', 'updatedAt']))}</td>
                                        <td>{pick(user, ['created_by_name', 'created_by', 'createdBy'], '-')}</td>
                                        <td>{pick(user, ['updated_by_name', 'updated_by', 'updatedBy'], '-')}</td>
                                        <td>{isActive ? 'Active' : 'Inactive'}</td>
                                        <td>
                                            <div className="items-center">
                                                <button
                                                    type="button"
                                                    className="btn-view"
                                                    title="Edit roles"
                                                    aria-label={`Edit roles for ${pick(user, ['name', 'username'], 'user')}`}
                                                    onClick={() => openRoleEditor(user)}
                                                >
                                                    <MdEdit />
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="items-center">
                                                <button
                                                    type="button"
                                                    className={`btn-view ${isActive ? 'btnUnLock' : 'btnLock'}`}
                                                    title="View"
                                                    aria-label={`Confirm status for ${pick(user, ['name', 'username'], 'user')}`}
                                                    onClick={() => setRoleChange(true)}
                                                >
                                                    {isActive ? <TiLockOpen /> : <TiLockClosed />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {roleChange && (
                <div className="modalBackdrop">
                    <div className="popupModal ms-model">
                        <div className="modalHeader">
                            <h2>Confirm Status Change</h2>
                            <button type="button" title="Close" onClick={() => setRoleChange(false)}>
                                <img src="images/icons/cose-icon.svg" alt="Close icon" />
                            </button>
                        </div>
                        <div className="modalBody">
                            <p className="text-center">Are you sure you want to change the User Role?</p>
                        </div>
                        <div className="modalFooter">
                            <button type="button" className="btn btn-gray" onClick={() => setRoleChange(false)}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={() => setRoleChange(false)}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {editingUser && (
                <div className="modalBackdrop" onMouseDown={(event) => {
                    if (event.target === event.currentTarget) closeRoleEditor()
                }}>
                    <form className="popupModal ms-model user-role-editor" onSubmit={saveRoles}>
                        <div className="modalHeader">
                            <h2>Edit User Roles</h2>
                            <button type="button" title="Close" onClick={closeRoleEditor} disabled={saving}>
                                <img src="images/icons/cose-icon.svg" alt="Close icon" />
                            </button>
                        </div>
                        <div className="modalBody">
                            <p>{pick(editingUser, ['name', 'full_name', 'fullName', 'username'], 'Selected user')}</p>
                            {roleOptions.length === 0 ? (
                                <p role="alert">No roles are available to assign.</p>
                            ) : (
                                <div className="user-role-options">
                                    {roleOptions.map((role, index) => {
                                        const roleId = pick(role, ['role_id', 'roleId', 'id'])
                                        const roleName = pick(role, ['role_name', 'name'], `Role ${index + 1}`)
                                        return (
                                            <label key={roleId || index} className="user-role-option">
                                                <input
                                                    type="checkbox"
                                                    value={roleId}
                                                    checked={selectedRoleIds.includes(String(roleId))}
                                                    onChange={() => toggleRole(roleId)}
                                                />
                                                <span>{roleName}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="modalFooter">
                            <button type="button" className="btn btn-gray" onClick={closeRoleEditor} disabled={saving}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving || roleOptions.length === 0}>
                                {saving ? 'Saving...' : 'Save roles'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    )
}
