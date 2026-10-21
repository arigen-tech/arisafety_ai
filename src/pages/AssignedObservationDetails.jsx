import { Link, useNavigate } from "react-router-dom"
import { TitleBar } from "../components/UI/TitleBar"

export const AssignedObservationDetails = () => {
    const navigate = useNavigate();
    return (
        <>

            <div className='title-bar'>
                <button type='button' className="btnBack" onClick={() => navigate(-1)}></button>
                <TitleBar title="Assigned Observation Details" />
            </div>

            <div class="card mb-20">
                <div class="grid mb-10">
                    <div class="form-group">
                        <label>Observation ID</label>
                        <input placeholder="" disabled="" readonly="" type="text" value="26" />
                    </div>
                    <div class="form-group">
                        <label>Observation Type</label>
                        <input placeholder="" disabled="" readonly="" type="text" value="Unsafe Act" />
                    </div><div class="form-group">
                        <label>Business Unit</label>
                        <input placeholder="" disabled="" readonly="" type="text" value="Air International" />
                    </div>
                    <div class="form-group">
                        <label>Plant </label>
                        <input placeholder="" disabled="" readonly="" type="text" value="Bengaluru" />
                    </div><div class="form-group">
                        <label>Department </label>
                        <input placeholder="" disabled="" readonly="" type="text" value="-" />
                    </div>
                    <div class="form-group">
                        <label>Location</label>
                        <input placeholder="" disabled="" readonly="" type="text" value="Karnataka" />
                    </div>
                    <div class="form-group">
                        <label>Observation Date &amp; Time</label>
                        <input placeholder="" disabled="" readonly="" type="text" value="16-Oct-2026 - 4:37pm" />
                    </div>
                    <div class="form-group">
                        <label>Reported By</label>
                        <input placeholder="" disabled="" readonly="" type="text" value="Employee #2" />
                    </div>
                    <div class="form-group">
                        <label>Description </label>
                        <textarea disabled="" readonly="">xyz</textarea>
                    </div>
                </div>
            </div>

            <div class="card mb-20">
                <div class="titleInner">
                    <h3>Evidence</h3>
                    <p>View supporting documents, images and videos related to this record.</p>
                </div>
                <div class="table-wrapper mb-10">
                    <table>
                        <thead>
                            <tr>
                                <th>Evidence Type</th>
                                <th>File Name</th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div class="content">
                                        <p>Image</p><span>Click to view the image</span>
                                    </div>
                                </td>
                                <td>image-1.png</td>
                                <td class="text-center"><button type="button" class="btnView">
                                    <img alt="view icon" src="images/icons/view-icon.svg" /> <span>View</span></button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card mb-20">
                <h3 class="mb-10">AI Analysis</h3>
                <div class="grid mb-20">
                    <div class="form-group">
                        <label>AI Finding </label>
                        <textarea disabled="" readonly="">PPE compliance</textarea>
                    </div>
                    <div class="form-group">
                        <label>AI Classification </label>
                        <textarea disabled="" readonly="">Unsafe Act</textarea>
                    </div>
                    <div class="form-group">
                        <label>Detected Condition </label>
                        <textarea disabled="" readonly="">Image detections: Helmet, Person, neutral</textarea>
                    </div>
                    <div class="form-group">
                        <label>Risk Indication </label>
                        <input placeholder="" disabled="" readonly="" type="text" value="MEDIUM" />
                    </div>
                    <div class="form-group">
                        <label>Confidence </label>
                        <input placeholder="" disabled="" readonly="" type="text" value="Image and text analysis" />
                    </div>
                    <div class="form-group">
                        <label>AI Observation Summary</label>
                        <textarea disabled="" readonly="">Automated analysis is unavailable; review the observation manually.</textarea>
                    </div>
                </div>
                <h4 class="mb-10">PPE Analysis</h4>
                <div class="table-wrapper mb-10">
                    <table>
                        <thead>
                            <tr>
                                <th><b>PPE Item</b></th>
                                <th class="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>Helmet</b></td>
                                <td class="text-center"><span class="approved">✓&nbsp; Detected</span></td>
                            </tr>
                            <tr>
                                <td><b>Safety Glasses</b></td>
                                <td class="text-center"><span class="rejected">✕&nbsp; Missing</span></td>
                            </tr>
                            <tr>
                                <td><b>Safety Footwear</b></td>
                                <td class="text-center"><span class="rejected">✕&nbsp; Missing</span></td>
                            </tr>
                            <tr>
                                <td><b>Gloves</b></td>
                                <td class="text-center"><span class="rejected">✕&nbsp; Missing</span></td>
                            </tr>
                            <tr>
                                <td><b>Safety Vest</b></td>
                                <td class="text-center"><span class="rejected">✕&nbsp; Missing</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card mb-20">
                <h3 class="mb-10">AI Recommendation</h3>
                <div class="grid mb-15">
                    <div class="form-group">
                        <label>Recommended Action </label>
                        <textarea disabled="" readonly="">Provide and verify vest PPE before work continues.
                            Provide and verify.</textarea>
                    </div>
                    <div class="form-group">
                        <label>Risk Priority </label>
                        <input placeholder="" disabled="" readonly="" type="text" value="MEDIUM" />
                    </div>
                    <div class="form-group">
                        <label>Recommended Action Type</label>
                        <input placeholder="" disabled="" readonly="" type="text" value="Corrective Action" />
                    </div>
                    <div class="form-group">
                        <label>AI Recommendation </label>
                        <textarea disabled="" readonly="">Required personal protective equipment may be missing.</textarea>
                    </div>
                </div>
            </div>

            <div class="card mb-20">
                <h3 class="mb-10">CAPA Action</h3>
                <div class="grid mb-15">
                    <div class="form-group">
                        <label>Corrective Action</label>
                        <textarea name="correctiveAction"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Preventive Action</label>
                        <textarea name="preventiveAction"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Responsible Person </label>
                        <input placeholder="" type="text" value="" name="responsiblePerson" />
                    </div>
                    <div class="form-group">
                        <label>Department </label>
                        <select>
                            <option value="">Select</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Target Date</label>
                        <input placeholder="" type="date" value="" name="targetDate" />
                    </div>
                    <div class="form-group">
                        <label>Priority</label>
                        <select name="priority">
                            <option value="">Select</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Photos</label>
                        <input accept="image/*" multiple="" type="file" />
                    </div>
                    <div class="btn-group itemEnd">
                        <button type="button" class="btn btn-primary">CAPA Recommendation</button>
                    </div>
                </div>
            </div>

            <div class="d-flex">
                <button type="button" class="btn btn-gray" onClick={() => navigate(-1)}>Back</button>
                <Link to="/assigned-observation-submission"><button type="button" class="btn btn-primary">Submission</button></Link>                
            </div>


        </>
    )
}
