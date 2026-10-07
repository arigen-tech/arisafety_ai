import { Link } from 'react-router-dom';
import { TitleBar } from '../components/UI/TitleBar';
import { MdEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { TiLockClosed, TiLockOpen } from "react-icons/ti";
import { useState } from 'react';




export const UsersRole = () => {
    const [roleChange, setRoleChange] = useState(false);
    const handleRoleChange = () =>{
        setRoleChange(true);
    }
    const handleRoleChangeClose = () =>{
        setRoleChange(false);
    }

    return (
        <>
            <TitleBar title="Mange User's Roles" />

            <div className="card">
                <div className="grid mb-30">
                    <div className="form-group">
                        <label>Name <span>*</span></label>
                        <input type="text" className='searchIcon' placeholder="" />
                    </div>
                    <div className="form-group">
                        <label>Business Unit <span>*</span></label>
                        <input type="text" className='searchIcon' placeholder="" />
                    </div>
                    <div className="form-group">
                        <label>Plant</label>
                        <input type="text" className='searchIcon' placeholder="" />
                    </div>
                    <div className="form-group">
                        <label>Department</label>
                        <input type="text" className='searchIcon' placeholder="" />
                    </div>
                    <div className="form-group">
                        <label>User Role</label>
                        <select>
                            <option value="">Select Role</option>
                            <option value="0"></option>
                        </select>
                    </div>

                    <div className="btn-group itemEnd">
                        <button type="button" className="btn btn-primary btnAdd"><FaPlus /> <span>Add Role</span></button>
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
                            <tr>
                                <td>1</td>
                                <td>System Admin</td>
                                <td>bUnit</td>
                                <td>Pune</td>
                                <td>Department</td>
                                <td>User Role</td>
                                <td>13/07/2026</td>
                                <td>08/09/2026</td>
                                <td>Aanand Kumar</td>
                                <td>Aanand Kumar</td>
                                <td>Active</td>
                                <td><div className="items-center"><Link className="btn-view" title="Edit"><MdEdit /></Link></div></td>
                                <td><div className="items-center" onClick={handleRoleChange}><Link className="btn-view btnUnLock" title="View"><TiLockOpen /></Link></div></td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>System Admin</td>
                                <td>bUnit</td>
                                <td>Pune</td>
                                <td>Department</td>
                                <td>User Role</td>
                                <td>13/07/2026</td>
                                <td>08/09/2026</td>
                                <td>Aanand Kumar</td>
                                <td>Aanand Kumar</td>
                                <td>Active</td>
                                <td><div className="items-center"><Link className="btn-view" title="Edit"><MdEdit /></Link></div></td>
                                <td><div className="items-center"><Link className="btn-view btnUnLock" title="View"><TiLockOpen /></Link></div></td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>System Admin</td>
                                <td>bUnit</td>
                                <td>Pune</td>
                                <td>Department</td>
                                <td>User Role</td>
                                <td>13/07/2026</td>
                                <td>08/09/2026</td>
                                <td>Aanand Kumar</td>
                                <td>Aanand Kumar</td>
                                <td>InActive</td>
                                <td><div className="items-center"><Link className="btn-view" title="Edit"><MdEdit /></Link></div></td>
                                <td><div className="items-center"><Link className="btn-view btnLock" title="View"><TiLockClosed /></Link></div></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>


            {roleChange && <div className="modalBackdrop">
                <div className="popupModal ms-model">
                    <div className="modalHeader">
                        <h2>Confirm Status Change</h2>
                        <button type="button" title="Close" onClick={handleRoleChangeClose} >
                            <img src="images/icons/cose-icon.svg" alt="Close icon" />
                        </button>
                    </div>

                    <div className="modalBody">
                        <p className='text-center'>Are you sure you want to change the User Role?</p>
                    </div>

                    <div className="modalFooter">
                        <button className='btn btn-gray' onClick={handleRoleChangeClose}>Cancel</button>
                        <button className='btn btn-primary' onClick={handleRoleChangeClose}>Confirm</button>
                    </div>

                </div>
            </div>}




        </>
    )
}
