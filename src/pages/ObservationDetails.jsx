import React, { useEffect, useRef, useState } from 'react'
import { TitleBar } from '../components/UI/TitleBar'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { getRequest, postRequest, getImageRequest } from '../service/apiService'

const DEPARTMENT_ENDPOINT = '/api/catalog/department'
const RESPONSIBLE_PEOPLE_ENDPOINT = '/api/catalog/responsible_people'
const SUBMIT_ENDPOINT = '/api/observations/submit'
const CAPA_RECOMMENDATIONS_ENDPOINT = '/api/observations' // + /{id}/capa-recommendations
const getTodayDate = () => {
    const date = new Date()
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return date.toISOString().slice(0, 10)
}

// response array ho ya { data: [...] }, dono chalega
const toArray = (json) => (Array.isArray(json) ? json : json?.data || json?.items || json?.rows || [])
let departmentsRequest

const getDepartments = () => {
    if (!departmentsRequest) {
        departmentsRequest = getRequest(DEPARTMENT_ENDPOINT)
            .then(toArray)
            .catch((error) => {
                departmentsRequest = null
                throw error
            })
    }
    return departmentsRequest
}

const toResponsiblePeople = (response) => {
    const root = response?.data ?? response
    if (Array.isArray(root)) return root
    for (const key of ['responsible_people', 'responsiblePeople', 'people', 'users', 'items', 'rows']) {
        if (Array.isArray(root?.[key])) return root[key]
    }
    return []
}

// pehla available key utha leta hai (snake_case / camelCase dono ke liye)
const pick = (obj, keys, fallback = '') => {
    for (const k of keys) if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k]
    return fallback
}

// null / khali value ki jagah "-"
const dash = (v) => (v === undefined || v === null || v === '' ? '-' : String(v))

// FastAPI detail ko text mein badalta hai (string / array / object)
// e.g. { "detail": "A supplied CAPA photo could not be analyzed." }
const detailToText = (detail) => {
    if (!detail) return ''
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) {
        return detail
            .map((item) => `${item.loc?.slice(1).join('.') || 'error'}: ${item.msg}`)
            .join('\n')
    }
    if (typeof detail === 'object') return detailToText(detail.detail) || detail.message || ''
    return ''
}

// apiService error kisi bhi shape mein throw kare, message nikal leta hai
const getErrorMessage = (error, fallback) => {
    const candidates = [
        error?.response?.detail,
        error?.response?.data?.detail,
        error?.response?.data,
        error?.response,
        error?.data?.detail,
        error?.data,
        error?.detail,
    ]
    for (const c of candidates) {
        const text = detailToText(c)
        if (text) return text
    }
    // kabhi error.message mein hi JSON string hoti hai: '{"detail":"..."}'
    try {
        const text = detailToText(JSON.parse(error?.message))
        if (text) return text
    } catch { /* JSON nahi hai */ }

    return error?.message || fallback
}

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

export const ObservationDetails = () => {
    // Pending.jsx link: /observation-details?id=2
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const location = useLocation()
    const obs = location.state?.observation ?? null
    const plantId = searchParams.get('plant_id') || pick(obs, ['plant_id', 'plantId'], '')

    const [aISuggestions] = useState(false);
    const [formSubmit, setFormSubmit] = useState(false);
    const [formReject, setFormReject] = useState(false);

    const [departments, setDepartments] = useState([]);
    const [departmentId, setDepartmentId] = useState('');
    const [responsiblePeople, setResponsiblePeople] = useState([]);
    const responsiblePeopleRequests = useRef(new Map())

    const [preview, setPreview] = useState(null);   // { type, url, name } evidence preview

    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [aiResult, setAiResult] = useState(null);
    const [aiSuggestionText, setAiSuggestionText] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [capa, setCapa] = useState(() => ({
        correctiveAction: '',
        preventiveAction: '',
        responsiblePerson: '',
        targetDate: getTodayDate(),
        priority: '',
    }));
    const handleCapaChange = (e) =>
        setCapa((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const selectedDepartmentId = departmentId || searchParams.get('department_id') || String(pick(obs, ['department_id', 'departmentId'], ''))

    // ---------- Department dropdown (GET API) ----------
    useEffect(() => {
        let ignore = false
        const loadDepartments = async () => {
            try {
                const data = await getDepartments()
                if (!ignore) setDepartments(data)
            } catch (err) {
                if (!ignore) console.error('Department load failed:', err)
            }
        }
        loadDepartments()
        return () => { ignore = true }
    }, [])

    const loadResponsiblePeople = async () => {
        const requestDepartmentId = selectedDepartmentId || '1'
        const requestPlantId = plantId || '1'
        const endpoint = `${RESPONSIBLE_PEOPLE_ENDPOINT}?department_id=${encodeURIComponent(requestDepartmentId)}&plant_id=${encodeURIComponent(requestPlantId)}`
        try {
            if (!responsiblePeopleRequests.current.has(endpoint)) {
                responsiblePeopleRequests.current.set(
                    endpoint,
                    getRequest(endpoint).then(toResponsiblePeople)
                )
            }
            setResponsiblePeople(await responsiblePeopleRequests.current.get(endpoint))
        } catch (err) {
            responsiblePeopleRequests.current.delete(endpoint)
            console.error('Responsible people load failed:', err)
            setResponsiblePeople([])
        }
    }

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
            alert(getErrorMessage(err, 'Observation submit nahi ho paya'))
        } finally {
            setLoading(false)
        }
    }

    // ---------- CAPA Recommendation (POST /api/observations/{id}/capa-recommendations) ----------
    const handleCapaRecommendation = async () => {
        const observationId = [
            pick(obs, ['id']),
            pick(obs, ['observation_id', 'observationId']),
            searchParams.get('id'),
        ].find((id) => Number.isSafeInteger(Number(id)) && Number(id) > 0)
        const responsiblePersonId = Number(capa.responsiblePerson)
        const selectedDepartment = Number(selectedDepartmentId)

        if (!observationId) {
            alert('Observation ID nahi mil paayi')
            return
        }
        if (!Number.isInteger(responsiblePersonId) || responsiblePersonId <= 0) {
            alert('Responsible Person select karo')
            return
        }
        if (!Number.isInteger(selectedDepartment) || selectedDepartment <= 0) {
            alert('Department select karo')
            return
        }

        const fd = new FormData()
        fd.append('responsible_person_id', String(responsiblePersonId))
        fd.append('department_id', String(selectedDepartment))
        fd.append('target_date', capa.targetDate)
        if (capa.priority) fd.append('priority', capa.priority.toUpperCase())
        images.forEach((file) => fd.append('photos', file))   // same key repeat

        setAnalyzing(true)
        try {
            const result = await postRequest(
                `${CAPA_RECOMMENDATIONS_ENDPOINT}/${Number(observationId)}/capa-recommendations`,
                fd,
                { isMultipart: true }
            )
            // response -> Corrective / Preventive Action textareas mein bind
            setCapa((prev) => ({
                ...prev,
                correctiveAction: result?.corrective_action ?? prev.correctiveAction,
                preventiveAction: result?.preventive_action ?? prev.preventiveAction,
            }))
        } catch (err) {
            console.error('CAPA recommendation request failed:', err)
            // e.g. "A supplied CAPA photo could not be analyzed."
            alert(getErrorMessage(err, 'CAPA recommendation nahi mil paayi'))
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
                        <select name="responsiblePerson" value={capa.responsiblePerson} onFocus={loadResponsiblePeople} onChange={handleCapaChange}>
                            <option value="">Select</option>
                            {responsiblePeople.map((person) => {
                                const userId = pick(person, ['user_id', 'userId', 'id', 'value'])
                                const name = pick(person, ['name', 'full_name', 'fullName', 'user_name', 'username', 'employee_name'])
                                if (!userId || !name) return null
                                return <option key={userId} value={userId}>{name}</option>
                            })}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Department </label>
                        <select value={selectedDepartmentId} onChange={(e) => {
                            setDepartmentId(e.target.value)
                            setResponsiblePeople([])
                            setCapa((prev) => ({ ...prev, responsiblePerson: '' }))
                        }}>
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

            <div className="card mb-20">
                <h3 className='mb-10'>Upload Before &amp; After Evidence</h3>

                <div className="grid mb-15">
                    <div className="form-group">
                        <label>Before Correction</label>
                        <input type="file" accept="image/*" />
                    </div>
                    <div className="form-group">
                        <label>After Correction</label>
                        <input type="file" accept="image/*" />
                    </div>
                    <div className="form-group">
                        <label>Remarks</label>
                        <textarea maxLength={250}></textarea>
                    </div>
                </div>
            </div>

            <div className="d-flex">
                <button type="button" className="btn btn-primary" onClick={handleFormSubmit} disabled={loading}>{loading ? 'Please wait...' : 'Assigned'}</button>
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