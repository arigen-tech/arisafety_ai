import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TitleBar } from '../components/UI/TitleBar'
import { getImageRequest, getRequest } from '../service/apiService'

const pick = (object, keys, fallback = '') => {
    for (const key of keys) {
        if (object?.[key] !== undefined && object[key] !== null) return object[key]
    }
    return fallback
}

const display = (value) => value === undefined || value === null || value === '' ? '-' : String(value)

const formatDateTime = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return date.toLocaleString('en-GB')
}

const getObservation = (response) => {
    const data = response?.data ?? response
    return data?.observation ?? data
}

const getFileName = (path) => path ? String(path).split('/').pop() : '-'

const getFileEndpoint = (url) => {
    try {
        const parsedUrl = new URL(url)
        return `${parsedUrl.pathname}${parsedUrl.search}`
    } catch {
        return url
    }
}

export const ApprovedObservationDetails = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [observation, setObservation] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [preview, setPreview] = useState(null)

    useEffect(() => {
        let ignore = false

        const loadObservation = async () => {
            setLoading(true)
            setError('')
            try {
                const response = await getRequest(`/api/observations/${encodeURIComponent(id)}`)
                if (!ignore) setObservation(getObservation(response))
            } catch (requestError) {
                console.error('Approved observation could not be loaded:', requestError)
                if (!ignore) setError('Could not load this observation. Please try again.')
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        if (id) {
            loadObservation()
        } else {
            setError('Observation ID is missing.')
            setLoading(false)
        }

        return () => { ignore = true }
    }, [id])

    const openEvidence = async (attachment) => {
        try {
            const blob = await getImageRequest(getFileEndpoint(attachment.file_url), {}, 'blob')
            setPreview({
                url: URL.createObjectURL(blob),
                name: getFileName(attachment.file_path),
                type: String(attachment.file_type || '').toUpperCase(),
            })
        } catch (requestError) {
            console.error('Approved observation evidence could not be loaded:', requestError)
            window.alert('The evidence file could not be opened.')
        }
    }

    const closePreview = () => {
        if (preview?.url) URL.revokeObjectURL(preview.url)
        setPreview(null)
    }

    useEffect(() => () => {
        if (preview?.url) URL.revokeObjectURL(preview.url)
    }, [preview])

    const ai = observation?.ai_analysis || {}
    const hazards = Array.isArray(observation?.ai_hazards) && observation.ai_hazards.length
        ? observation.ai_hazards
        : ai.hazards || []
    const recommendations = [
        ...(observation?.ai_recommendations || []),
        ...hazards.flatMap((hazard) => hazard.recommendations || []),
    ]
    const ppe = ai.ppe || {}
    const attachments = Array.isArray(observation?.attachments) ? observation.attachments : []
    const beforeEvidence = attachments.filter(
        (attachment) => String(attachment.evidence_type || '').toUpperCase() === 'PRE'
    )
    const afterEvidence = attachments.filter(
        (attachment) => String(attachment.evidence_type || '').toUpperCase() === 'POST'
    )
    const capa = observation?.capa_recommendation ?? observation?.capaRecommendation ?? {}
    const ppeRows = [
        { label: 'Helmet', ok: ppe.helmet },
        { label: 'Safety Glasses', ok: ppe.goggles },
        { label: 'Safety Footwear', ok: ppe.boots },
        { label: 'Gloves', ok: ppe.gloves },
        { label: 'Safety Vest', ok: ppe.vest },
    ]

    return (
        <>
            <div className='title-bar'>
                <button type='button' className="btnBack" onClick={() => navigate(-1)}></button>
                <TitleBar title="Approved Observation" />
            </div>

            {loading ? (
                <div className="card text-center">Loading observation...</div>
            ) : error ? (
                <div className="card text-center" role="alert">{error}</div>
            ) : observation ? (
                <>
                    <div className="card mb-20">
                        <div className="grid mb-10">
                            <div className="form-group">
                                <label>Observation ID</label>
                                <input type="text" value={display(pick(observation, ['observation_id', 'observation_code', 'id']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>Observation Type</label>
                                <input type="text" value={display(pick(observation, ['observation_type']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>Business Unit</label>
                                <input type="text" value={display(pick(observation, ['business_unit_name', 'business_unit']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>Plant</label>
                                <input type="text" value={display(pick(observation, ['plant_name', 'plant']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <input type="text" value={display(pick(observation, ['department_name', 'department']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>Area</label>
                                <input type="text" value={display(pick(observation, ['area_name', 'area']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input type="text" value={display(pick(observation, ['location_name', 'location']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>Observation Date &amp; Time</label>
                                <input type="text" value={formatDateTime(pick(observation, ['occurred_at', 'created_at', 'observation_date', 'reported_at']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>Reported By</label>
                                <input type="text" value={display(pick(observation, ['reported_by', 'reported_by_name', 'employee_name', 'employee_id', 'created_by']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea disabled readOnly value={display(pick(observation, ['description']))} />
                            </div>
                        </div>
                    </div>

                    <div className="card mb-20">
                        <h3 className='mb-10'>Field Officer Before &amp; After Evidence</h3>
                        <div className="grid mb-15">
                            <div className="form-group">
                                <label>Before Correction</label>
                                {beforeEvidence.length ? beforeEvidence.map((attachment) => (
                                    <div key={attachment.attachment_id ?? attachment.file_path}>
                                        <button type="button" className="btnView" onClick={() => openEvidence(attachment)}>
                                            View {getFileName(attachment.file_path)}
                                        </button>
                                    </div>
                                )) : <p>No before evidence uploaded.</p>}
                            </div>
                            <div className="form-group">
                                <label>After Correction</label>
                                {afterEvidence.length ? afterEvidence.map((attachment) => (
                                    <div key={attachment.attachment_id ?? attachment.file_path}>
                                        <button type="button" className="btnView" onClick={() => openEvidence(attachment)}>
                                            View {getFileName(attachment.file_path)}
                                        </button>
                                    </div>
                                )) : <p>No after evidence uploaded.</p>}
                            </div>
                            <div className="form-group">
                                <label>Field Officer Remarks</label>
                                <textarea disabled readOnly value={display(pick(
                                    observation?.field_officer_submission,
                                    ['remarks'],
                                ))} />
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
                                    {attachments.length === 0 ? (
                                        <tr><td colSpan={3} className="text-center">No evidence uploaded</td></tr>
                                    ) : attachments.map((attachment) => {
                                        const isVideo = String(attachment.file_type).toUpperCase() === 'VIDEO'
                                        const evidenceType = String(attachment.evidence_type || '').toUpperCase()
                                        const evidenceLabel = evidenceType === 'PRE'
                                            ? 'Before Correction'
                                            : evidenceType === 'POST'
                                                ? 'After Correction'
                                                : isVideo ? 'Video' : 'Image'
                                        return (
                                            <tr key={attachment.attachment_id ?? attachment.file_path}>
                                                <td>{evidenceLabel}</td>
                                                <td>{getFileName(attachment.file_path)}</td>
                                                <td className='text-center'>
                                                    <button
                                                        type="button"
                                                        className={isVideo ? 'btn-primary' : 'btnView'}
                                                        onClick={() => openEvidence(attachment)}
                                                    >
                                                        <span>{isVideo ? 'Play' : 'View'}</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card mb-20">
                        <h3 className='mb-10'>CAPA Recommendation</h3>
                        <div className="grid mb-15">
                            <div className="form-group">
                                <label>Corrective Action</label>
                                <textarea disabled readOnly value={display(pick(capa, ['corrective_action', 'correctiveAction']))} />
                            </div>
                            <div className="form-group">
                                <label>Preventive Action</label>
                                <textarea disabled readOnly value={display(pick(capa, ['preventive_action', 'preventiveAction']))} />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <input type="text" value={display(pick(capa, ['department_name', 'departmentName', 'department'], pick(observation, ['department_name', 'department'])))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>Responsible Person</label>
                                <input type="text" value={display(pick(capa, ['responsible_person_name', 'responsiblePersonName', 'responsible_person_id']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>Target Date</label>
                                <input type="text" value={display(pick(capa, ['target_date', 'targetDate']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>Priority</label>
                                <input type="text" value={display(pick(capa, ['priority']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>AI Suggestions</label>
                                <textarea disabled readOnly value={display(pick(capa, ['ai_suggestions', 'aiSuggestions']))} />
                            </div>
                        </div>
                    </div>

                    <div className="card mb-20">
                        <h3 className='mb-10'>AI Analysis</h3>
                        <div className="grid mb-20">
                            <div className="form-group">
                                <label>AI Finding</label>
                                <textarea disabled readOnly value={hazards.length ? hazards.map((hazard) => hazard.type).join(', ') : '-'} />
                            </div>
                            <div className="form-group">
                                <label>AI Classification</label>
                                <textarea disabled readOnly value={display(pick(observation, ['observation_type']))} />
                            </div>
                            <div className="form-group">
                                <label>Detected Condition</label>
                                <textarea disabled readOnly value={display(ai.message)} />
                            </div>
                            <div className="form-group">
                                <label>Risk Indication</label>
                                <input type="text" value={display(pick(observation, ['risk_level', 'risk']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>Confidence</label>
                                <input type="text" value={display(pick(observation, ['ai_confidence', 'confidence']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>AI Observation Summary</label>
                                <textarea disabled readOnly value={display(pick(observation, ['ai_summary', 'summary']))} />
                            </div>
                        </div>
                        <h4 className='mb-10'>PPE Analysis</h4>
                        <div className="table-wrapper mb-10">
                            <table>
                                <thead><tr><th><b>PPE Item</b></th><th className='text-center'>Action</th></tr></thead>
                                <tbody>
                                    {ppeRows.map(({ label, ok }) => (
                                        <tr key={label}>
                                            <td><b>{label}</b></td>
                                            <td className='text-center'>
                                                {ok === undefined
                                                    ? '-'
                                                    : ok
                                                        ? <span className='approved'>✓&nbsp; Detected</span>
                                                        : <span className='rejected'>✕&nbsp; Missing</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card mb-20">
                        <h3 className='mb-10'>AI Recommendation</h3>
                        <div className="grid mb-15">
                            <div className="form-group">
                                <label>Recommended Action</label>
                                <textarea disabled readOnly value={recommendations.length ? recommendations.join('\n') : '-'} />
                            </div>
                            <div className="form-group">
                                <label>Risk Priority</label>
                                <input type="text" value={display(pick(observation, ['risk_level', 'risk']))} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>Recommended Action Type</label>
                                <input type="text" value={recommendations.length ? 'Corrective Action' : '-'} disabled readOnly />
                            </div>
                            <div className="form-group">
                                <label>AI Recommendation</label>
                                <textarea disabled readOnly value={hazards.length ? hazards.map((hazard) => hazard.description).join('\n') : '-'} />
                            </div>
                        </div>
                    </div>
                </>
            ) : null}

            <div className="d-flex">
                <button type="button" className="btn btn-gray" onClick={() => navigate(-1)}>Back</button>
            </div>

            {preview && (
                <div className="modalBackdrop">
                    <div className="popupModal ms-model">
                        <div className="modalHeader">
                            <h2>{preview.name}</h2>
                            <button type="button" title="Close" onClick={closePreview}>Close</button>
                        </div>
                        <div className="modalBody">
                            {preview.type === 'VIDEO'
                                ? <video src={preview.url} controls autoPlay style={{ maxWidth: '100%' }} />
                                : <img src={preview.url} alt={preview.name} style={{ maxWidth: '100%' }} />}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
