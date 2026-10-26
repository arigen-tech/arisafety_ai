import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { TitleBar } from "../components/UI/TitleBar";
import { postRequest } from "../service/apiService";

const FIELD_SUBMISSION_ENDPOINT = "/api/observations";

const getErrorMessage = (error) => {
    const detail = error?.response?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
        return detail.map((item) => item.msg || "Invalid submission").join(", ");
    }
    if (error?.status === 403) {
        return "Permission denied. Check that this observation is assigned to your Field Officer account.";
    }
    return error?.message || "Observation submit nahi ho paya";
};

export const AssignedObservationSubmission = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const observation = location.state?.observation;
    const observationId = [
        observation?.observation_id,
        observation?.observationId,
        observation?.id,
        searchParams.get("id"),
    ].find((id) => Number.isSafeInteger(Number(id)) && Number(id) > 0);
    const [remarks, setRemarks] = useState("");
    const [preImages, setPreImages] = useState([]);
    const [postImages, setPostImages] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!observationId) {
            setError("Observation ID nahi mil paayi");
            return;
        }

        const formData = new FormData();
        formData.append("remarks", remarks);
        preImages.forEach((file) => formData.append("pre_images", file));
        postImages.forEach((file) => formData.append("post_images", file));

        setSubmitting(true);
        setError("");
        try {
            await postRequest(
                `${FIELD_SUBMISSION_ENDPOINT}/${Number(observationId)}/field-submission`,
                formData,
                { isMultipart: true }
            );
            setSubmitted(true);
        } catch (requestError) {
            console.error("Field observation submission failed:", requestError);
            setError(getErrorMessage(requestError));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="title-bar">
                <button type="button" className="btnBack" onClick={() => navigate(-1)} />
                <TitleBar title="Assigned Observation Submission" />
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card mb-20">
                    <div className="grid mb-10">
                        <div className="form-group">
                            <label>Before Correction</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(event) => setPreImages(Array.from(event.target.files || []))}
                            />
                        </div>
                        <div className="form-group">
                            <label>After Correction</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(event) => setPostImages(Array.from(event.target.files || []))}
                            />
                        </div>
                        <div className="form-group">
                            <label>Remarks</label>
                            <textarea
                                maxLength={2000}
                                value={remarks}
                                onChange={(event) => setRemarks(event.target.value)}
                            />
                        </div>
                    </div>
                    {error && <p role="alert" className="error-msg">{error}</p>}
                    {submitted && <p role="status">Observation successfully submitted.</p>}
                </div>

                <div className="d-flex">
                    <button type="submit" className="btn btn-primary" disabled={submitting || submitted}>
                        {submitting ? "Submitting..." : submitted ? "Submitted" : "Submit"}
                    </button>
                </div>
            </form>
        </>
    );
};
