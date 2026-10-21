import { useNavigate } from "react-router-dom";
import { TitleBar } from "../components/UI/TitleBar"

export const AssignedObservationSubmission = () => {
    const navigate = useNavigate();
  return (
        <>
        <div className='title-bar'>
                <button type='button' className="btnBack" onClick={() => navigate(-1)}></button>
                <TitleBar title="Assigned Observation Submission" />
            </div>

            <div className="card mb-20">
                <div class="grid mb-10">                
                    <div class="form-group">
                        <label>Findings <span>*</span> </label>
                        <textarea maxLength={250}></textarea>
                    </div>
                    <div class="form-group">
                        <label>Action Taken</label>
                        <textarea maxLength={250}></textarea>
                    </div>
                    <div class="form-group">
                        <label>Recommendations</label>
                        <textarea maxLength={250}></textarea>
                    </div>
                    <div class="form-group">
                        <label>Comments</label>
                        <textarea maxLength={250}></textarea>
                    </div>
                    <div class="form-group">
                    <label>Images</label>
                    <input accept="image/*" type="file" />
                    </div>
                </div>
            </div>

            <div class="d-flex">
                <button type="button" class="btn btn-primary">Submit</button>               
            </div>
        </>
    )
}
