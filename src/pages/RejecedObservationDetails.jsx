import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TitleBar } from '../components/UI/TitleBar'
import { AppAlert } from '../appAlert'
import { ENDPOINTS } from '../config/apiConfig'
import { getImageRequest, getRequest } from '../service/apiService'

const pick = (object, keys, fallback = '') => {
    for (const key of keys) {
        if (object?.[key] !== undefined && object[key] !== null) return object[key]
    }
    return fallback
}

const display = (value) => {
    if (value === undefined || value === null || value === '') return '-'
    if (typeof value === 'object') {
        return String(pick(value, ['name', 'label', 'title', 'department_name', 'plant_name'], '-'))
    }
    return String(value)
}

const getObservation = (response) => {
    const data = response?.data ?? response
    return data?.observation ?? data
}

const formatDateTime = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('en-GB')
}

const getFileName = (path) => path ? String(path).split(/[\\/]/).pop() : 'Evidence'

const getFileEndpoint = (url) => {
    try {
        const parsedUrl = new URL(url)
        return `${parsedUrl.pathname}${parsedUrl.search}`
    } catch {
        return url
    }
}

export const RejecedObservationDetails = () => {
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
                const response = await getRequest(ENDPOINTS.OBSERVATION(id))
                if (!ignore) setObservation(getObservation(response))
            } catch (requestError) {
                console.error('Rejected observation could not be loaded:', requestError)
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

    useEffect(() => () => {
        if (preview?.url) URL.revokeObjectURL(preview.url)
    }, [preview])

    const openEvidence = async (attachment) => {
        try {
            const blob = await getImageRequest(getFileEndpoint(attachment.file_url), {}, 'blob')
            setPreview({
                url: URL.createObjectURL(blob),
                name: getFileName(attachment.file_path),
                type: String(attachment.file_type || '').toUpperCase(),
            })
        } catch (requestError) {
            console.error('Rejected observation evidence could not be loaded:', requestError)
            AppAlert.fire({
                icon: 'error',
                title: 'Could not open evidence',
                text: 'The evidence file could not be opened.',
            })
        }
    }

    const closePreview = () => {
        if (preview?.url) URL.revokeObjectURL(preview.url)
        setPreview(null)
    }

    const attachments = Array.isArray(observation?.attachments) ? observation.attachments : []
    const fieldSubmission = observation?.field_officer_submission ?? {}
    const rejectionReason = pick(
        observation,
        ['rejection_reason', 'rejection_comments', 'decision_comments', 'comments'],
        pick(observation?.decision, ['comments', 'reason'])
    )

    return (
        <>
            <div className='title-bar'>
                <button type='button' className="btnBack" onClick={() => navigate(-1)}></button>
                <TitleBar title="Rejected Observation" />
            </div>

            {loading ? (
                <div className="card text-center" role="status">Loading observation...</div>
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
                            <div className="form-group">
                                <label>Status</label>
                                <input type="text" value={display(pick(observation, ['status', 'workflow_status'], 'Rejected')).replace(/_/g, ' ')} disabled readOnly />
                            </div>
                            {rejectionReason && (
                                <div className="form-group">
                                    <label>Rejection Reason</label>
                                    <textarea disabled readOnly value={display(rejectionReason)} />
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Field Officer Remarks</label>
                            <textarea disabled readOnly value={display(pick(fieldSubmission, ['remarks']))} />
                        </div>
                    </div>

                    <div className="card mb-20">
                        <h3 className="mb-10">Evidence</h3>
                        <div className="table-wrapper mb-10">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Evidence Type</th>
                                        <th>File Name</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attachments.length === 0 ? (
                                        <tr><td colSpan={3} className="text-center">No evidence uploaded</td></tr>
                                    ) : attachments.map((attachment) => {
                                        const isVideo = String(attachment.file_type || '').toUpperCase() === 'VIDEO'
                                        const evidenceType = String(attachment.evidence_type || '').toUpperCase()
                                        const label = evidenceType === 'PRE'
                                            ? 'Before Correction'
                                            : evidenceType === 'POST'
                                                ? 'After Correction'
                                                : isVideo ? 'Video' : 'Image'
                                        return (
                                            <tr key={attachment.attachment_id ?? attachment.file_path}>
                                                <td>{label}</td>
                                                <td>{getFileName(attachment.file_path)}</td>
                                                <td className="text-center">
                                                    <button type="button" className={isVideo ? 'btn-primary' : 'btnView'} onClick={() => openEvidence(attachment)}>
                                                        {isVideo ? 'Play' : 'View'}
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
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
