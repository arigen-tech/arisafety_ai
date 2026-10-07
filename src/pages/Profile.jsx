import { useState } from "react";
import { TitleBar } from "../components/UI/TitleBar";
import { IoMdCall } from "react-icons/io";
import { MdOutlineMailOutline } from "react-icons/md";


export const Profile = () => {

    const [editProfile, setEditProfile] = useState(false);

    const handleEditProfile = () => {
        setEditProfile(!editProfile);
    }


    return (
        <>
            <TitleBar title="My Profile" />

            <div className="card profile mb-20">
                <div className="">
                    <div className="profile-pic">
                        <img src="images/profile-img.png" alt="Profile image" width="105" height="105" />
                        <button type="button" aria-label="upload pic">
                            <img src="images/icons/camera-icon.svg" alt="camera Icon" />
                        </button>
                    </div>
                    <h2>Angela Colbern</h2>
                    <p>Job Profile</p>
                    <button type="button" className="btn-edit" onClick={handleEditProfile}>
                        <img src="images/icons/edit-icon.svg" alt="Edit Icon" />
                        <span> Edit Profile</span>
                    </button>
                </div>
            </div>

            <div className="card contact-links mb-20">
                <div className="">
                    <h2>Contact Information</h2>
                    <a href="tel:9889893210"><IoMdCall />
                        <span>988 989 3210</span></a>
                    <a href="mailto:angela_colbern@xyz.com"><MdOutlineMailOutline />
                        <span>angela_colbern@xyz.com</span></a>
                </div>

            </div>


            {editProfile && <div className="card">
                <div className="grid mb-15">
                    <div className="form-group">
                        <label for="usernameId">Name</label>
                        <input type="text" maxlength="30" id="usernameId" name="usernameId"  placeholder="" />
                    </div>

                    <div className="form-group">
                        <label for="nameId">Email</label>
                        <input type="email" maxlength="30" id="nameId" name="nameId" placeholder="" />
                    </div>

                    <div className="form-group">
                        <label for="nameId">Mobile</label>
                        <input type="text" maxlength="10" id="nameId" name="nameId" placeholder="" />
                    </div>
                    <div className="form-group">
                        <label for="nameId">Business Unit</label>
                        <select>
                            <option value="0">Select</option>
                            <option value="1"></option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label for="nameId">Plant</label>
                        <select>
                            <option value="0">Select</option>
                            <option value="1"></option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label for="nameId">Department</label>
                        <select>
                            <option value="0">Select</option>
                            <option value="1"></option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label for="nameId">User Role</label>
                        <select>
                            <option value="0">Select</option>
                            <option value="1"></option>
                        </select>
                    </div>
                </div>
                <button type="button" className="btn btn-primary">Save Changes</button>
            </div>}


        </>
    )
}
