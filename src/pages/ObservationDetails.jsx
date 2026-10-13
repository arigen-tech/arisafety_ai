import React, { useEffect, useState } from 'react'
import { TitleBar } from '../components/UI/TitleBar'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getRequest, postRequest, getImageRequest } from '../service/apiService'

const DEPARTMENT_ENDPOINT = '/api/catalog/department'
const SUBMIT_ENDPOINT = '/api/observations/submit'
const ANALYZE_ENDPOINT = '/api/image/analyze'
const OBSERVATION_ENDPOINT = (id) => `/api/observations/${id}`

// response array ho ya { data: [...] }, dono chalega
const toArray = (json) => (Array.isArray(json) ? json : json?.data || json?.items || json?.rows || [])

// pehla available key utha leta hai (snake_case / camelCase dono ke liye)
const pick = (obj, keys, fallback = '') => {
    for (const k of keys) if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k]
    return fallback
}

// null / khali value ki jagah "-"
const dash = (v) => (v === undefined || v === null || v === '' ? '-' : String(v))

// "27-Sep-2026 - 10:35am"
const formatDateTime = (value) => {
    if (!value) return '-'
    const d = new Date(value)
    if (isNaN(d)) return String(value)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let h = d.getHours()
    const ampm = h >= 12 ? 'pm' : 'am'
    h = h % 12 || 12
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()} - ${h}:${mm}${ampm}`
}

// "observations/abc/images/image-1.png" -> "image-1.png"
const fileNameOf = (path) => (path ? String(path).split('/').pop() : '-')

// full URL se sirf path nikalta hai (apiService BASE_URL khud lagata hai)
const toEndpoint = (url) => {
    try {
        const u = new URL(url)
        return u.pathname + u.search
    } catch {
        return url
    }
}

// analyze API ka response { "picture-1": { hazards: [{ recommendations: [...] }] }, ... } hota hai.
// Isme se sirf recommendations nikalta hai (pehli 3 lines), baaki response nahi dikhata.
const textOf = (v) => (typeof v === 'string' ? v : v?.text ?? v?.recommendation ?? v?.description ?? '')

const extractRecommendations = (res, limit = 3) => {
    const root = res?.data ?? res ?? {}
    const items = Array.isArray(root) ? root : [root, ...Object.values(root)]
    const recs = []

    items.forEach((r) => {
        if (!r || typeof r !== 'object') return
        const list = [
            ...(Array.isArray(r.recommendations) ? r.recommendations : []),
            ...(Array.isArray(r.hazards) ? r.hazards : []).flatMap((h) => h?.recommendations || []),
        ]
        list.forEach((x) => {
            const t = String(textOf(x)).trim()
            if (t && !recs.includes(t)) recs.push(t)
        })
    })

    return recs.slice(0, limit).join('\n')
}

export const ObservationDetails = () => {
    // Pending.jsx link: /observation-details?id=2
    const [searchParams] = useSearchParams()
    const id = searchParams.get('id')
    const navigate = useNavigate()

    const [aISuggestions, setAISuggestions] = useState(false);
    const [formSubmit, setFormSubmit] = useState(false);
    const [formReject, setFormReject] = useState(false);

    const [departments, setDepartments] = useState([]);
    const [departmentId, setDepartmentId] = useState('');

    const [obs, setObs] = useState(null);           // GET /api/observations/:id ka data
    const [obsLoading, setObsLoading] = useState(true);
    const [obsError, setObsError] = useState('');

    const [preview, setPreview] = useState(null);   // { type, url, name } evidence preview

    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [aiResult, setAiResult] = useState(null);
    const [aiSuggestionText, setAiSuggestionText] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [capa, setCapa] = useState({
        correctiveAction: '',
        preventiveAction: '',
        responsiblePerson: '',
        targetDate: '',
        priority: '',
    });
    const handleCapaChange = (e) =>
        setCapa((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    // ---------- Department dropdown (GET API) ----------
    useEffect(() => {
        const loadDepartments = async () => {
            try {
                const data = await getRequest(DEPARTMENT_ENDPOINT)
                setDepartments(toArray(data))
            } catch (err) {
                console.error('Department load failed:', err)
            }
        }
        loadDepartments()
    }, [])

    // ---------- Observation details (GET /api/observations/:id) ----------
    useEffect(() => {
        if (!id) {
            setObsLoading(false)
            setObsError('Observation id nahi mili (URL mein ?id=... hona chahiye)')
            return
        }
        let ignore = false
        const loadObservation = async () => {
            try {
                const data = await getRequest(OBSERVATION_ENDPOINT(id))
                if (ignore) return
                setObs(Array.isArray(data) ? data[0] : data?.data ?? data)
            } catch (err) {
                console.error('Observation load failed:', err)
                if (!ignore) setObsError(err.message || 'Observation load nahi ho paya')
            } finally {
                if (!ignore) setObsLoading(false)
            }
        }
        loadObservation()
        return () => { ignore = true }
    }, [id])

    // preview ka blob URL band hone par free karo
    const closePreview = () => {
        if (preview?.url) URL.revokeObjectURL(preview.url)
        setPreview(null)
    }

    // evidence (image/video) token ke saath fetch karke popup mein dikhao
    const openEvidence = async (att) => {
        try {
            const blob = await getImageRequest(toEndpoint(att.file_url), {}, 'blob')
            setPreview({
                type: String(att.file_type).toUpperCase(),
                url: URL.createObjectURL(blob),
                name: fileNameOf(att.file_path),
            })
        } catch (err) {
            console.error('Evidence load failed:', err)
            alert('File open nahi ho paayi')
        }
    }

    // ---------- Display values (API se) ----------
    const ai = obs?.ai_analysis || {}
    const hazards = Array.isArray(obs?.ai_hazards) && obs.ai_hazards.length ? obs.ai_hazards : ai.hazards || []
    const recommendations = [
        ...(obs?.ai_recommendations || []),
        ...hazards.flatMap((h) => h.recommendations || []),
    ]
    const ppe = ai.ppe || {}
    const attachments = Array.isArray(obs?.attachments) ? obs.attachments : []

    const ppeRows = [
        { label: 'Helmet', ok: ppe.helmet },
        { label: 'Safety Glasses', ok: ppe.goggles },
        { label: 'Safety Footwear', ok: ppe.boots },
        { label: 'Gloves', ok: ppe.gloves },
        { label: 'Safety Vest', ok: ppe.vest },
    ]

    const v = {
        obsId: dash(pick(obs, ['observation_id'])),
        type: dash(pick(obs, ['observation_type'])),
        bu: dash(pick(obs, ['business_unit_name', 'business_unit'])),
        plant: dash(pick(obs, ['plant_name', 'plant'])),
        dept: dash(pick(obs, ['department_name', 'department'])),
        location: dash(pick(obs, ['location_name', 'location'])),
        dateTime: formatDateTime(pick(obs, ['occurred_at', 'created_at'], '')),
        reportedBy: obs?.employee_id ? `Employee #${obs.employee_id}` : '-',
        description: dash(pick(obs, ['description'])),
        risk: dash(pick(obs, ['risk_level'])),
        confidence: dash(pick(obs, ['ai_confidence'])),
        summary: dash(pick(obs, ['ai_summary'])),
        finding: hazards.length ? hazards.map((h) => h.type).join(', ') : '-',
        detected: dash(ai.message),
        recAction: recommendations.length ? recommendations.join('\n') : '-',
        recText: hazards.length ? hazards.map((h) => h.description).join('\n') : '-',
        recType: recommendations.length ? 'Corrective Action' : '-',
    }

    // ---------- SUBMIT API (multipart/form-data) ----------
    const handleFormSubmit = async () => {
        if (!images.length) {
            alert('Kam se kam ek photo select karo (images required hai)')
            return
        }

        const fd = new FormData()
        images.forEach((file) => fd.append('images', file))   // same key repeat
        fd.append('observationType', obs?.observation_type || 'unsafe')
        fd.append('description', capa.correctiveAction || obs?.description || '')
        fd.append('language', 'English')
        if (obs?.business_unit_id) fd.append('business_unit_id', obs.business_unit_id)
        if (obs?.plant_id) fd.append('plant_id', obs.plant_id)
        if (obs?.location_id) fd.append('location_id', obs.location_id)

        setLoading(true)
        try {
            const result = await postRequest(SUBMIT_ENDPOINT, fd, { isMultipart: true })
            setAiResult(result)      // observationId, riskLevel, summary, violations ...
            setFormSubmit(true)      // success popup
        } catch (err) {
            console.error(err)
            const detail = err.response?.detail
            const msg = Array.isArray(detail)
                ? detail.map((d) => `${d.loc?.slice(1).join('.')}: ${d.msg}`).join('\n')
                : err.message
            alert(msg || 'Observation submit nahi ho paya')
        } finally {
            setLoading(false)
        }
    }
    // ---------- CAPA Recommendation (POST /api/image/analyze) ----------
    const handleCapaRecommendation = async () => {
        setAnalyzing(true)
        try {
            let files = images
            // photo select nahi ki to observation ki apni image evidence use karo
            if (!files.length) {
                const imgAtts = attachments.filter((a) => String(a.file_type).toUpperCase() === 'IMAGE')
                files = await Promise.all(
                    imgAtts.map(async (a) => {
                        const blob = await getImageRequest(toEndpoint(a.file_url), {}, 'blob')
                        return new File([blob], fileNameOf(a.file_path), { type: blob.type })
                    })
                )
            }
            if (!files.length) {
                alert('Photo select karo (ya observation mein image evidence hona chahiye)')
                return
            }

            const fd = new FormData()
            files.forEach((file) => fd.append('image', file))   // same key repeat
            const desc = obs?.description || capa.correctiveAction
            if (desc) fd.append('description', desc)

            const result = await postRequest(ANALYZE_ENDPOINT, fd, { isMultipart: true })
            setAiSuggestionText(extractRecommendations(result) || 'No recommendations available')
            setAISuggestions(true)
        } catch (err) {
            console.error(err)
            const detail = err.response?.detail
            const msg = Array.isArray(detail)
                ? detail.map((d) => `${d.loc?.slice(1).join('.')}: ${d.msg}`).join('\n')
                : err.message
            alert(msg || 'CAPA recommendation nahi mil paayi')
        } finally {
            setAnalyzing(false)
        }
    }

    const handleFormClose = () => {
        setFormSubmit(false);
        navigate(-1);
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
                <TitleBar title="Observation Details" />
            </div>

            {obsLoading && <div className="card mb-20"><p className="text-center">Loading...</p></div>}
            {!obsLoading && obsError && <div className="card mb-20"><p className="text-center">{obsError}</p></div>}

            <div className="card mb-20">

                <div className="grid mb-10">
                    <div className="form-group">
                        <label>Observation ID</label>
                        <input type="text" placeholder="" value={v.obsId} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Observation Type</label>
                        <input type="text" placeholder="" value={v.type} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Business Unit</label>
                        <input type="text" placeholder="" value={v.bu} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Plant </label>
                        <input type="text" placeholder="" value={v.plant} disabled readOnly />
                    </div>

                    <div className="form-group">
                        <label>Department </label>
                        <input type="text" placeholder="" value={v.dept} disabled readOnly />
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input type="text" placeholder="" value={v.location} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Observation Date & Time</label>
                        <input type="text" placeholder="" value={v.dateTime} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Reported By</label>
                        <input type="text" placeholder="" value={v.reportedBy} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Description </label>
                        <textarea disabled readOnly value={v.description} />
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
                            {attachments.length === 0 && (
                                <tr><td colSpan={3} className="text-center">No evidence uploaded</td></tr>
                            )}
                            {attachments.map((att) => {
                                const isVideo = String(att.file_type).toUpperCase() === 'VIDEO'
                                return (
                                    <tr key={att.attachment_id ?? att.file_path}>
                                        <td>
                                            <div className='content'>
                                                <p>{isVideo ? 'Video' : 'Image'}</p>
                                                <span>{isVideo ? 'Click to play the video' : 'Click to view the image'}</span>
                                            </div>
                                        </td>
                                        <td>{fileNameOf(att.file_path)}</td>
                                        <td className='text-center'>
                                            {isVideo ? (
                                                <button type="button" className="btn-primary" onClick={() => openEvidence(att)}>
                                                    <img src="images/icons/play-icon.svg" alt="Play icon" /> <span>Play</span>
                                                </button>
                                            ) : (
                                                <button type="button" className="btnView" onClick={() => openEvidence(att)}>
                                                    <img src="images/icons/view-icon.svg" alt="view icon" /> <span>View</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

            </div>

            <div className="card mb-20">
                <h3 className='mb-10'>AI Analysis</h3>

                <div className="grid mb-20">
                    <div className="form-group">
                        <label>AI Finding </label>
                        <textarea disabled readOnly value={v.finding} />
                    </div>
                    <div className="form-group">
                        <label>AI Classification </label>
                        <textarea disabled readOnly value={v.type} />
                    </div>
                    <div className="form-group">
                        <label>Detected Condition </label>
                        <textarea disabled readOnly value={v.detected} />
                    </div>
                    <div className="form-group">
                        <label>Risk Indication </label>
                        <input type="text" placeholder="" value={v.risk} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Confidence </label>
                        <input type="text" placeholder="" value={v.confidence} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>AI Observation Summary</label>
                        <textarea disabled readOnly value={v.summary} />
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
                            {ppeRows.map(({ label, ok }) => (
                                <tr key={label}>
                                    <td><b>{label}</b></td>
                                    <td className='text-center'>
                                        {ok
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
                        <label>Recommended Action </label>
                        <textarea disabled readOnly value={v.recAction} />
                    </div>
                    <div className="form-group">
                        <label>Risk Priority </label>
                        <input type="text" placeholder="" value={v.risk} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Recommended Action Type</label>
                        <input type="text" placeholder="" value={v.recType} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>AI Recommendation </label>
                        <textarea disabled readOnly value={v.recText} />
                    </div>
                </div>
            </div>

            <div className="card mb-20">
                <h3 className='mb-10'>CAPA Action</h3>

                <div className="grid mb-15">
                    <div className="form-group">
                        <label>Corrective Action</label>
                        <textarea name="correctiveAction" value={capa.correctiveAction} onChange={handleCapaChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label>Preventive Action</label>
                        <textarea name="preventiveAction" value={capa.preventiveAction} onChange={handleCapaChange}></textarea>
                    </div>
                    <div className="form-group">
                        <label>Responsible Person </label>
                        <input type="text" placeholder="" name="responsiblePerson" value={capa.responsiblePerson} onChange={handleCapaChange} />
                    </div>
                    <div className="form-group">
                        <label>Department </label>
                        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                            <option value="">Select</option>
                            {departments.map((d, i) => {
                                const dId = pick(d, ['id', 'department_id', 'departmentId'], i)
                                const dName = pick(d, ['name', 'department_name', 'departmentName', 'dept_name'])
                                return <option key={dId} value={dId}>{dName}</option>
                            })}
                        </select>

                    </div>
                    <div className="form-group">
                        <label>Target Date</label>
                        <input type="date" placeholder="" name="targetDate" value={capa.targetDate} onChange={handleCapaChange} />
                    </div>
                    <div className="form-group">
                        <label>Priority</label>
                        <select name="priority" value={capa.priority} onChange={handleCapaChange}>
                            <option value="">Select</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Photos</label>
                        <input type="file" accept="image/*" multiple onChange={(e) => setImages([...e.target.files])} />
                    </div>
                    <div className="btn-group itemEnd">
                        <button type="button" className="btn btn-primary" onClick={handleCapaRecommendation} disabled={analyzing}>
                            {analyzing ? 'Analyzing...' : 'CAPA Recommendation'}
                        </button>
                    </div>
                </div>
                {aISuggestions && <div className="grid grid-col-2 mb-15">
                    <div className="form-group">
                        <label>AI Suggestions</label>
                        <textarea rows={4} value={aiSuggestionText} onChange={(e) => setAiSuggestionText(e.target.value)}></textarea>
                    </div>
                </div>}
            </div>

            <div className="d-flex">
                <button type="button" className="btn btn-primary" onClick={handleFormSubmit} disabled={loading}>{loading ? 'Please wait...' : 'Submit'}</button>
                <button type="button" className="btn btn-rejected" onClick={handleFormRejection}>Reject</button>
            </div>

            {/* Evidence preview popup */}
            {preview && <div className="modalBackdrop">
                <div className="popupModal ms-model">
                    <div className="modalHeader">
                        <h2>{preview.name}</h2>
                        <button type="button" title="Close" onClick={closePreview}>
                            <img src="images/icons/cose-icon.svg" alt="Close icon" />
                        </button>
                    </div>
                    <div className="modalBody">
                        {preview.type === 'VIDEO'
                            ? <video src={preview.url} controls autoPlay style={{ maxWidth: '100%' }} />
                            : <img src={preview.url} alt={preview.name} style={{ maxWidth: '100%' }} />}
                    </div>
                </div>
            </div>}

            {formSubmit && <div className="modalBackdrop">
                <div className="popupModal ms-model">
                    <div className="modalBody">
                        <div className='checkMark'>
                            <img src="images/icons/check-mark-success-large.gif" alt="Check icon" />
                            <p className='text-center'>Observation successfully Assigned.</p>
                            {aiResult && <p className='text-center'>ID: {aiResult.observationId} | Risk: {aiResult.riskLevel}</p>}
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