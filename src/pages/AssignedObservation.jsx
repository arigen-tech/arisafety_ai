import React, { useState } from 'react'
import { TitleBar } from '../components/UI/TitleBar'
import { Link, useNavigate } from 'react-router-dom'

export const AssignedObservation = () => {
    const [aISuggestions, setAISuggestions] = useState(false);
    const [formSubmit, setFormSubmit] = useState(false);
    const [formReject, setFormReject] = useState(false);

    const navigate = useNavigate();

    const handleFormSubmit = () => {
        setFormSubmit(true);
    }
    const handleFormClose = () => {
        setFormSubmit(false);
    }

    const handleFormRejection = () => {
        setFormReject(true);
    }
    const handleFormRejectionClose = () => {
        setFormReject(false);
    }



    return (
        <>
            <div className='title-bar'>
                <button type='button' className="btnBack" onClick={() => navigate(-1)}></button>
                <TitleBar title="Assigned Observation" />
            </div>

            <div className="card mb-20">

                <div className="grid mb-10">
                    <div className="form-group">
                        <label>Observation ID</label>
                        <input type="text" placeholder="" value="SAF-000124" disabled />
                    </div>
                    <div className="form-group">
                        <label>Observation Type</label>
                        <input type="text" placeholder="" value="Unsafe Condition" disabled />
                    </div>
                    <div className="form-group">
                        <label>Business Unit</label>
                        <input type="text" placeholder="" value="Auto Components" disabled />
                    </div>
                    <div className="form-group">
                        <label>Plant </label>
                        <input type="text" placeholder="" value="Pune" disabled />
                    </div>

                    <div className="form-group">
                        <label>Department </label>
                        <input type="text" placeholder="" value="Dpt" disabled />
                    </div>

                    <div className="form-group">
                        <label>Area</label>
                        <input type="text" placeholder="" value="Electrical Maintenance" disabled />
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input type="text" placeholder="" value="Panel Room - Line 2" disabled />
                    </div>
                    <div className="form-group">
                        <label>Observation Date & Time</label>
                        <input type="text" placeholder="" value="27-Sep-2026 - 10:35am" disabled />
                    </div>

                    <div className="form-group">
                        <label>Reported By</label>
                        <input type="text" placeholder="" value="Team Lead " disabled />
                    </div>

                    <div className="form-group">
                        <label>Description </label>
                        <textarea disabled>Water accumulation near electrical panel</textarea>
                    </div>

                </div>

            </div>

            <div className="card mb-20">
                <div className='titleInner'>
                    <h3>Evidence</h3>
                    <p>View supporting documents, images and videos related to this record.</p>
                </div>

                <div className="table-wrapper mb-10">
                    <table>
                        <thead>
                            <tr>
                                <th>Evidence Type</th>
                                <th>File Name</th>
                                <th className='text-center'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className='content'>
                                        <p>Image</p>
                                        <span>Click to view the image</span>
                                    </div>
                                </td>
                                <td>IMG_20250818_123456.jpg</td>
                                <td className='text-center'><Link className="btnView"><img src="images/icons/view-icon.svg" alt="view icon" /> <span>View</span></Link></td>
                            </tr>
                            <tr>
                                <td>
                                    <div className='content'>
                                        <p>Video</p>
                                        <span>Click to play the video</span>
                                    </div></td>
                                <td>VID_20250818_123456.mp4</td>
                                <td className='text-center'><Link className="btn-primary"><img src="images/icons/play-icon.svg" alt="Play icon" /> <span>Play</span></Link></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>

            <div className="card mb-20">
                <h3 className='mb-10'>AI Analysis</h3>

                <div className="grid mb-20">
                    <div className="form-group">
                        <label>AI Finding </label>
                        <textarea disabled>Potential Electrical Hazard</textarea>
                    </div>
                    <div className="form-group">
                        <label>AI Classification </label>
                        <textarea disabled>Unsafe Condition</textarea>
                    </div>
                    <div className="form-group">
                        <label>Detected Condition </label>
                        <textarea disabled>Water accumulation near electrical activity</textarea>
                    </div>
                    <div className="form-group">
                        <label>Risk Indication </label>
                        <input type="text" placeholder="" value="HIGH" disabled />
                    </div>
                    <div className="form-group">
                        <label>Confidence </label>
                        <input type="text" placeholder="" value="91%" disabled />
                    </div>
                    <div className="form-group">
                        <label>AI Observation Summary</label>
                        <textarea disabled>Water accumulation identified near electrical work area</textarea>
                    </div>

                </div>


                <h4 className='mb-10'>PPE Analysis</h4>
                <div className="table-wrapper mb-10">
                    <table>
                        <thead>
                            <tr>
                                <th><b>PPE Item</b></th>
                                <th className='text-center'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>Helmet</b></td>
                                <td className='text-center'><span className='approved'>✓&nbsp; Detected</span></td>
                            </tr>
                            <tr>
                                <td><b>Safety Glasses</b></td>
                                <td className='text-center'><span className='rejected'>✕&nbsp; Missing</span></td>
                            </tr>
                            <tr>
                                <td><b>Safety Footwear</b></td>
                                <td className='text-center'><span className='approved'>✓&nbsp; Detected</span></td>
                            </tr>
                            <tr>
                                <td><b>Gloves</b></td>
                                <td className='text-center'><span className='rejected'>✕&nbsp; Missing</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>



            </div>

            <div className="card mb-20">
                <h3 className='mb-10'>AI Recommendation</h3>
                <div className="grid mb-15">
                    <div className="form-group">
                        <label>Recommended Action </label>
                        <textarea disabled>Remove accumulated water and isolate affected electrical area</textarea>
                    </div>
                    <div className="form-group">
                        <label>Risk Priority </label>
                        <input type="text" placeholder="" value="High " disabled />
                    </div>
                    <div className="form-group">
                        <label>Recommended Action Type</label>
                        <input type="text" placeholder="" value="Corrective Action" disabled />
                    </div>
                    <div className="form-group">
                        <label>AI Recommendation </label>
                        <textarea disabled>Suggested corrective/preventive action</textarea>
                    </div>
                </div>
            </div>

            <div className="card mb-20">
                <h3 className='mb-10'>CAPA Action</h3>

                <div className="grid mb-15">
                    <div className="form-group">
                        <label>Corrective Action</label>
                        <textarea disabled>Corrective Action</textarea>
                    </div>
                    <div className="form-group">
                        <label>Preventive Action</label>
                        <textarea disabled>Preventive Action</textarea>
                    </div>
                    <div className="form-group">
                        <label>Responsible Person </label>
                        <input type="text" value="Responsible Person" disabled placeholder="" />
                    </div>
                    <div className="form-group">
                        <label>Department </label>
                        <input type="text" value="Department" placeholder="" disabled />

                    </div>
                    <div className="form-group">
                        <label>Target Date</label>
                        <input type="text" value="27-Sep-2026" placeholder="" disabled />
                    </div>
                    <div className="form-group">
                        <label>Priority</label>
                        <input type="text" value="High" placeholder="" disabled />
                    </div>
                </div>
                {/* <div className="grid grid-col-2 mb-15">
                    <div className="form-group">
                        <label>AI Suggestions</label>
                        <textarea disabled>AI Suggestions</textarea>
                    </div>
                </div> */}
            </div>


            <div className="card mb-20">
                <h3 className='mb-10'>Upload Before & After Evidence</h3>

                <div className="grid mb-15">
                <div className="form-group">
                        <label>Before Currection </label>
                        <input type="file" placeholder="" />
                    </div>
                    <div className="form-group">
                        <label>After Currection </label>
                        <input type="file" placeholder="" />
                    </div>

                </div>
 
            </div>
   
            <div className="d-flex">
                <button type="button" className="btn btn-primary" onClick={handleFormSubmit}>Submit</button>
                {/* <button type="button" className="btn btn-rejected" onClick={handleFormRejection}>Reject</button> */}
            </div>



            {formSubmit && <div className="modalBackdrop">
                <div className="popupModal ms-model">
                    <div className="modalBody">
                        <div className='checkMark'>
                            <img src="images/icons/check-mark-success-large.gif" alt="Check icon" />
                            <p className='text-center'>Observation successfully Submitted.</p>
                            <button className='btn btn-primary' onClick={handleFormClose}>OK</button>
                        </div>
                    </div>
                </div>
            </div>}

            {formReject && <div className="modalBackdrop">
                <div className="popupModal ms-model">
                    <div className="modalHeader">
                        <h2>Rejection</h2>
                        <button type="button" title="Close" onClick={handleFormRejectionClose}>
                            <img src="images/icons/cose-icon.svg" alt="Close icon" />
                        </button>
                    </div>

                    <div className="modalBody">
                        <div className="form-group">
                            <label>Reason for Rejection</label>
                            <textarea placeholder='Enter your rejection...'></textarea>
                        </div>
                    </div>

                    <div className="modalFooter">
                        <button className='btn btn-gray' onClick={handleFormRejectionClose}>Cancel</button>
                        <button className='btn btn-primary' onClick={handleFormRejectionClose}>Submit</button>
                    </div>

                </div>
            </div>}


        </>
    )
}

