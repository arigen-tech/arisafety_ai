import React, { useState } from 'react'
import { TitleBar } from '../components/UI/TitleBar'
import { Link, useNavigate } from 'react-router-dom'

export const ObservationDetails = () => {
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
                <button type='button' class="btnBack" onClick={() => navigate(-1)}></button>
                <TitleBar title="Observation Details" />
            </div>

            <div className="card mb-20">

                <div class="grid mb-10">
                    <div class="form-group">
                        <label>Observation ID</label>
                        <input type="text" placeholder="" value="SAF-000124" disabled />
                    </div>
                    <div class="form-group">
                        <label>Observation Type</label>
                        <input type="text" placeholder="" value="Unsafe Condition" disabled />
                    </div>
                    <div class="form-group">
                        <label>Business Unit</label>
                        <input type="text" placeholder="" value="Auto Components" disabled />
                    </div>
                    <div class="form-group">
                        <label>Plant </label>
                        <input type="text" placeholder="" value="Pune" disabled />
                    </div>

                    <div class="form-group">
                        <label>Department </label>
                        <input type="text" placeholder="" value="Dpt" disabled />
                    </div>

                    <div class="form-group">
                        <label>Area</label>
                        <input type="text" placeholder="" value="Electrical Maintenance" disabled />
                    </div>

                    <div class="form-group">
                        <label>Location</label>
                        <input type="text" placeholder="" value="Panel Room - Line 2" disabled />
                    </div>
                    <div class="form-group">
                        <label>Observation Date & Time</label>
                        <input type="text" placeholder="" value="27-Sep-2026 - 10:35am" disabled />
                    </div>
                    {/* <div class="form-group">
                        <label>Observation Time </label>
                        <input type="text" placeholder="" value="10:35 AM" disabled />
                    </div> */}
                    <div class="form-group">
                        <label>Reported By</label>
                        <input type="text" placeholder="" value="Team Lead " disabled />
                    </div>
                    {/* <div class="form-group">
                        <label>Reporter Type</label>
                        <input type="text" placeholder="" value="Team Lead / Authorized User" disabled />
                    </div> */}
                    <div class="form-group">
                        <label>Description </label>
                        <textarea disabled>Water accumulation near electrical panel</textarea>
                    </div>
                    {/* <div class="form-group">
                        <label>Current Status </label>
                        <input type="text" placeholder="" value="Under Review" disabled />
                    </div> */}
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

                <div class="grid mb-20">
                    <div class="form-group">
                        <label>AI Finding </label>
                        <textarea disabled>Potential Electrical Hazard</textarea>
                    </div>
                    <div class="form-group">
                        <label>AI Classification </label>
                        <textarea disabled>Unsafe Condition</textarea>
                    </div>
                    <div class="form-group">
                        <label>Detected Condition </label>
                        <textarea disabled>Water accumulation near electrical activity</textarea>
                    </div>
                    <div class="form-group">
                        <label>Risk Indication </label>
                        <input type="text" placeholder="" value="HIGH" disabled />
                    </div>
                    <div class="form-group">
                        <label>Confidence </label>
                        <input type="text" placeholder="" value="91%" disabled />
                    </div>
                    <div class="form-group">
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
                <div class="grid mb-15">
                    <div class="form-group">
                        <label>Recommended Action </label>
                        <textarea disabled>Remove accumulated water and isolate affected electrical area</textarea>
                    </div>
                    <div class="form-group">
                        <label>Risk Priority </label>
                        <input type="text" placeholder="" value="High " disabled />
                    </div>
                    <div class="form-group">
                        <label>Recommended Action Type</label>
                        <input type="text" placeholder="" value="Corrective Action" disabled />
                    </div>
                    <div class="form-group">
                        <label>AI Recommendation </label>
                        <textarea disabled>Suggested corrective/preventive action</textarea>
                    </div>
                </div>
                {/* <div class="d-flex">
                    <button type="button" class="btn btn-primary">Accept Recommendation</button>                
                    <button type="button" class="btn btn-outline">Modify Recommendation</button>
                </div> */}
            </div>

            <div className="card mb-20">
                <h3 className='mb-10'>CAPA Action</h3>

                <div class="grid mb-15">
                    <div class="form-group">
                        <label>Corrective Action</label>
                        <textarea></textarea>
                    </div>
                    <div class="form-group">
                        <label>Preventive Action</label>
                        <textarea></textarea>
                    </div>
                    <div class="form-group">
                        <label>Responsible Person </label>
                        <input type="text" placeholder="" />
                    </div>
                    <div class="form-group">
                        <label>Department </label>
                        <select>
                            <option value="">Select</option>
                            <option value="0"></option>
                        </select>

                    </div>
                    <div class="form-group">
                        <label>Target Date</label>
                        <input type="date" placeholder=""  />
                    </div>
                    <div class="form-group">
                        <label>Priority</label>
                        <select>
                            <option value="">Select</option>
                            <option value="0">High</option>
                            <option value="0">Medium</option>
                            <option value="0">Low</option>
                        </select>
                    </div>
                    <div class="btn-group itemEnd">
                        <button type="button" class="btn btn-primary" onClick={() => setAISuggestions(!aISuggestions)}>CAPA Recommendation</button>
                    </div>
                </div>
                {aISuggestions && <div class="grid grid-col-2 mb-15">
                    <div class="form-group">
                        <label>AI Suggestions</label>
                        <textarea></textarea>
                    </div>
                </div>}
            </div>


            <div className="card mb-20" style={{ display: "none" }}>
                <h3 className='mb-10'>aaaaaaa</h3>

                {/* <div class="grid mb-10">
                    <div class="form-group">
                        <label>aaa</label>
                        <input type="text" placeholder="" value="aa" disabled />
                    </div> 
                </div> */}
            </div>

            <div class="d-flex">
                <button type="button" class="btn btn-primary" onClick={handleFormSubmit}>Submit</button>
                <button type="button" class="btn btn-rejected" onClick={handleFormRejection}>Reject</button>
            </div>



            {formSubmit && <div class="siteBackdrop">
                <div class="popupModal ms-model">
                    <div class="modalBody">
                        <div className='checkMark'>
                            <img src="images/icons/check-mark-success-large.gif" alt="Check icon" />
                            <p className='text-center'>Observation successfully Assigned.</p>
                            <button className='btn btn-primary' onClick={handleFormClose}>OK</button>
                        </div>
                    </div>
                </div>
            </div>}

            {formReject && <div class="siteBackdrop">
                <div class="popupModal ms-model">
                    <div class="modalHeader">
                        <h2>Rejection</h2>
                        <button type="button" title="Close" onClick={handleFormRejectionClose}>
                            <img src="images/icons/cose-icon.svg" alt="Close icon" />
                        </button>
                    </div>

                    <div class="modalBody">
                        <div class="form-group">
                            <label>Reason for Rejection</label>
                            <textarea placeholder='Enter your rejection...'></textarea>
                        </div>
                    </div>

                    <div class="modalFooter">
                        <button className='btn btn-gray' onClick={handleFormRejectionClose}>Cancel</button>
                        <button className='btn btn-primary' onClick={handleFormRejectionClose}>Submit</button>
                    </div>

                </div>
            </div>}


        </>
    )
}
