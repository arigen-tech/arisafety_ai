import React, { useEffect, useMemo, useState } from 'react'
import { TitleBar } from '../components/UI/TitleBar'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { getRequest, postRequest, patchRequest, getImageRequest } from '../service/apiService'
import { useTranslatedApiValues } from '../hooks/useTranslatedApiValues'

const DEPARTMENT_ENDPOINT = '/api/catalog/department'
const RESPONSIBLE_PEOPLE_ENDPOINT = '/api/catalog/responsible_people'
const ROLE_ENDPOINT = '/api/catalog/role'
const OBSERVATIONS_ENDPOINT = '/api/observations'
const FIELD_SUBMISSION_ENDPOINT = '/api/observations'
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
    for (const key of ['field_officers', 'fieldOfficers', 'responsible_people', 'responsiblePeople', 'people', 'users', 'items', 'rows', 'results']) {
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
const getObservationDisplayValues = (observation) => {
    const ai = observation?.ai_analysis || {}
    const hazards = Array.isArray(observation?.ai_hazards) && observation.ai_hazards.length
        ? observation.ai_hazards
        : ai.hazards || []
    const recommendations = [
        ...(observation?.ai_recommendations || []),
        ...hazards.flatMap((hazard) => hazard.recommendations || []),
    ]

    return [
        dash(pick(observation, ['observation_type'])),
        dash(pick(observation, ['business_unit_name', 'business_unit'])),
        dash(pick(observation, ['plant_name', 'plant'])),
        dash(pick(observation, ['department_name', 'department'])),
        dash(pick(observation, ['location_name', 'location'])),
        observation?.employee_id ? `Employee #${observation.employee_id}` : '-',
        dash(pick(observation, ['description'])),
        dash(pick(observation, ['risk_level'])),
        dash(pick(observation, ['ai_confidence'])),
        dash(pick(observation, ['ai_summary'])),
        hazards.length ? hazards.map((hazard) => hazard.type).join(', ') : '-',
        dash(ai.message),
        recommendations.length ? recommendations.join('\n') : '-',
        hazards.length ? hazards.map((hazard) => hazard.description).join('\n') : '-',
        recommendations.length ? 'Corrective Action' : '-',
    ]
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
    const routeObservation = location.state?.observation ?? null
    const [detailObservation, setDetailObservation] = useState(null)
    const [detailLoading, setDetailLoading] = useState(true)
    const [detailError, setDetailError] = useState('')
    const obs = detailObservation ?? routeObservation
    const observationRows = useMemo(() => obs ? [obs] : [], [obs])
    const plantId = searchParams.get('plant_id') || pick(obs, ['plant_id', 'plantId'], '')
    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || {}
        } catch {
            return {}
        }
    })()
    const activeRoleName = localStorage.getItem('selectedRoleName') || user.role_name || (typeof user.role === 'string' ? user.role : '')

    const [aISuggestions] = useState(false);
    const [formSubmit, setFormSubmit] = useState(false);
    const [formReject, setFormReject] = useState(false);
    const [isTeamLead, setIsTeamLead] = useState(false);
    const [isFieldOfficer, setIsFieldOfficer] = useState(
        String(activeRoleName).toLowerCase().replace(/[^a-z]/g, '') === 'fieldofficer'
    );
    const [roleResolved, setRoleResolved] = useState(false);
    const [rejectionComments, setRejectionComments] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [departments, setDepartments] = useState([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(true);
    const [departmentError, setDepartmentError] = useState('');
    const [departmentId, setDepartmentId] = useState(
        () => searchParams.get('department_id') || String(pick(obs, ['department_id', 'departmentId'], ''))
    );
    const [responsiblePeople, setResponsiblePeople] = useState([]);
    const [peopleLoading, setPeopleLoading] = useState(false);
    const [peopleError, setPeopleError] = useState('');

    const [preview, setPreview] = useState(null);   // { type, url, name } evidence preview

    const [loading, setLoading] = useState(false);
    const [fieldSubmissionComplete, setFieldSubmissionComplete] = useState(false);
    const [beforeImages, setBeforeImages] = useState([]);
    const [afterImages, setAfterImages] = useState([]);
    const [submissionRemarks, setSubmissionRemarks] = useState('');
    const [aiResult, setAiResult] = useState(null);
    const [aiSuggestionText, setAiSuggestionText] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState('');
    const [capa, setCapa] = useState(() => ({
        correctiveAction: '',
        preventiveAction: '',
        responsiblePerson: '',
        targetDate: getTodayDate(),
        priority: '',
    }));
    const handleCapaChange = (e) =>
        setCapa((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const observationId = [
        searchParams.get('id'),
        pick(routeObservation, ['id']),
        pick(routeObservation, ['observation_id', 'observationId']),
    ].find((value) => Number.isSafeInteger(Number(value)) && Number(value) > 0)
    const selectedDepartmentId = departmentId || String(pick(obs, ['department_id', 'departmentId'], ''))

    useEffect(() => {
        let ignore = false

        const loadObservationDetails = async () => {
            setDetailLoading(true)
            setDetailError('')
            try {
                const response = await getRequest(`${OBSERVATIONS_ENDPOINT}/${encodeURIComponent(observationId)}`)
                const loadedObservation = response?.data?.observation
                    ?? response?.observation
                    ?? response?.data
                    ?? response
                if (ignore) return

                setDetailObservation(loadedObservation)
                const savedCapa = loadedObservation?.capa_recommendation
                    ?? loadedObservation?.capaRecommendation
                    ?? {}
                const savedDepartmentId = pick(
                    savedCapa,
                    ['department_id', 'departmentId'],
                    pick(loadedObservation, ['department_id', 'departmentId'], '')
                )
                if (savedDepartmentId !== '') setDepartmentId(String(savedDepartmentId))

                setCapa((previous) => ({
                    ...previous,
                    correctiveAction: pick(savedCapa, ['corrective_action', 'correctiveAction'], previous.correctiveAction),
                    preventiveAction: pick(savedCapa, ['preventive_action', 'preventiveAction'], previous.preventiveAction),
                    responsiblePerson: String(pick(savedCapa, ['responsible_person_id', 'responsiblePersonId'], previous.responsiblePerson)),
                    targetDate: pick(savedCapa, ['target_date', 'targetDate'], previous.targetDate),
                    priority: pick(savedCapa, ['priority'], previous.priority),
                }))
                setAiSuggestionText(pick(savedCapa, ['ai_suggestions', 'aiSuggestions'], ''))
            } catch (error) {
                console.error('Observation details could not be loaded:', error)
                if (!ignore) {
                    setDetailError(error.message || 'Could not load the latest observation details.')
                }
            } finally {
                if (!ignore) setDetailLoading(false)
            }
        }

        if (observationId) {
            loadObservationDetails()
        } else {
            setDetailError('The observation ID could not be found.')
            setDetailLoading(false)
        }

        return () => { ignore = true }
    }, [observationId])

    useEffect(() => {
        let ignore = false

        const resolveActiveRole = async () => {
            let user = {}
            try {
                user = JSON.parse(localStorage.getItem('user') || '{}')
            } catch (error) {
                console.error('Stored user data could not be read:', error)
            }

            const activeRoleId = localStorage.getItem('selectedRoleId') || String(user.role_id ?? '')
            const storedRoleName = localStorage.getItem('selectedRoleName') || user.role_name || ''
            const matchesTeamLead = (name) => String(name).replace(/[\s_-]/g, '').toLowerCase() === 'teamlead'
            const matchesFieldOfficer = (name) => String(name).replace(/[\s_-]/g, '').toLowerCase() === 'fieldofficer'

            try {
                if (activeRoleId) {
                    const roles = toArray(await getRequest(ROLE_ENDPOINT))
                    const activeRole = roles.find((role) => String(role.role_id) === activeRoleId)
                    if (!ignore) {
                        const roleName = activeRole?.role_name || storedRoleName
                        setIsTeamLead(matchesTeamLead(roleName))
                        setIsFieldOfficer(matchesFieldOfficer(roleName))
                    }
                } else if (!ignore) {
                    setIsTeamLead(matchesTeamLead(storedRoleName))
                    setIsFieldOfficer(matchesFieldOfficer(storedRoleName))
                }
            } catch (error) {
                console.error('Active role could not be resolved:', error)
                if (!ignore) {
                    setIsTeamLead(matchesTeamLead(storedRoleName))
                    setIsFieldOfficer(matchesFieldOfficer(storedRoleName))
                }
            } finally {
                if (!ignore) setRoleResolved(true)
            }
        }

        resolveActiveRole()
        return () => { ignore = true }
    }, [])

    // ---------- Department dropdown (GET API) ----------
    useEffect(() => {
        let ignore = false
        const loadDepartments = async () => {
            try {
                const data = await getDepartments()
                if (!ignore) setDepartments(data)
            } catch (err) {
                console.error('Department load failed:', err)
                if (!ignore) setDepartmentError('Departments could not be loaded. Please try again.')
            } finally {
                if (!ignore) setDepartmentsLoading(false)
            }
        }
        loadDepartments()
        return () => { ignore = true }
    }, [])

    useEffect(() => {
        let ignore = false

        if (!selectedDepartmentId) {
            return () => { ignore = true }
        }

        const requestPlantId = plantId || '1'
        const endpoint = `${RESPONSIBLE_PEOPLE_ENDPOINT}?department_id=${encodeURIComponent(selectedDepartmentId)}&plant_id=${encodeURIComponent(requestPlantId)}`
        const loadResponsiblePeople = async () => {
            setPeopleLoading(true)
            setPeopleError('')
            try {
                const people = toResponsiblePeople(await getRequest(endpoint))
                if (!ignore) setResponsiblePeople(people)
            } catch (error) {
                console.error('Responsible people load failed:', error)
                if (!ignore) {
                    setResponsiblePeople([])
                    setPeopleError('Responsible people could not be loaded. Please try again.')
                }
            } finally {
                if (!ignore) setPeopleLoading(false)
            }
        }

        loadResponsiblePeople()
        return () => { ignore = true }
    }, [selectedDepartmentId, plantId])

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
            alert('The evidence file could not be opened.')
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
    const fieldSubmission = obs?.field_officer_submission || {}
    const fieldEvidence = attachments.filter((attachment) =>
        ['PRE', 'POST'].includes(String(attachment.evidence_type || '').toUpperCase())
    )
    const beforeEvidence = fieldEvidence.filter(
        (attachment) => String(attachment.evidence_type).toUpperCase() === 'PRE'
    )
    const afterEvidence = fieldEvidence.filter(
        (attachment) => String(attachment.evidence_type).toUpperCase() === 'POST'
    )
    const isFieldSubmissionComplete = fieldSubmissionComplete
        || obs?.workflow_status === 'FIELD_OFFICER_SUBMITTED'
        || obs?.status === 'SUBMITTED_BY_OFFICER'
    const teamLeadReviewReady = roleResolved && isTeamLead && isFieldSubmissionComplete

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
    const { translatedRows, translationError: apiTranslationError } =
        useTranslatedApiValues(observationRows, getObservationDisplayValues)
    const apiDisplayValues = translatedRows[0] || [
        v.type,
        v.bu,
        v.plant,
        v.dept,
        v.location,
        v.reportedBy,
        v.description,
        v.risk,
        v.confidence,
        v.summary,
        v.finding,
        v.detected,
        v.recAction,
        v.recText,
        v.recType,
    ]
    const [
        translatedType,
        translatedBusinessUnit,
        translatedPlant,
        translatedDepartment,
        translatedLocation,
        translatedReporter,
        translatedDescription,
        translatedRisk,
        translatedConfidence,
        translatedSummary,
        translatedFinding,
        translatedDetected,
        translatedRecommendedAction,
        translatedRecommendation,
        translatedRecommendationType,
    ] = apiDisplayValues
    const displayValues = {
        ...v,
        type: translatedType,
        bu: translatedBusinessUnit,
        plant: translatedPlant,
        dept: translatedDepartment,
        location: translatedLocation,
        reportedBy: translatedReporter,
        description: translatedDescription,
        risk: translatedRisk,
        confidence: translatedConfidence,
        summary: translatedSummary,
        finding: translatedFinding,
        detected: translatedDetected,
        recAction: translatedRecommendedAction,
        recText: translatedRecommendation,
        recType: translatedRecommendationType,
    }

    // ---------- SUBMIT API (multipart/form-data) ----------
    const handleFormSubmit = async () => {
        if (isFieldOfficer) {
            if (!observationId) {
                alert('The observation ID could not be found.')
                return
            }

            const submissionForm = new FormData()
            submissionForm.append('remarks', submissionRemarks)
            beforeImages.forEach((file) => submissionForm.append('pre_images', file))
            afterImages.forEach((file) => submissionForm.append('post_images', file))

            setLoading(true)
            try {
                const response = await postRequest(
                    `${FIELD_SUBMISSION_ENDPOINT}/${encodeURIComponent(observationId)}/field-submission`,
                    submissionForm,
                    { isMultipart: true }
                )
                const submittedObservation = response?.data?.observation
                    ?? response?.observation
                    ?? response?.data
                    ?? response
                if (submittedObservation && typeof submittedObservation === 'object') {
                    setDetailObservation(submittedObservation)
                }
                setFieldSubmissionComplete(true)
                setSuccessMessage('Observation submitted successfully.')
                setFormSubmit(true)
            } catch (error) {
                console.error('Field observation submission failed:', error)
                alert(error.message || 'The field observation could not be submitted.')
            } finally {
                setLoading(false)
            }
            return
        }

        const selectedDepartment = Number(selectedDepartmentId)
        const responsiblePersonId = Number(capa.responsiblePerson)

        if (!observationId) {
            alert('The observation ID could not be found.')
            return
        }
        if (!Number.isInteger(selectedDepartment) || selectedDepartment <= 0) {
            alert('Please select a department.')
            return
        }
        if (!Number.isInteger(responsiblePersonId) || responsiblePersonId <= 0) {
            alert('Please select a responsible person.')
            return
        }

        const priority = capa.priority ? capa.priority.toUpperCase() : ''
        const updateForm = new FormData()
        updateForm.append('field_officer_id', String(responsiblePersonId))
        updateForm.append('corrective_action', capa.correctiveAction)
        updateForm.append('preventive_action', capa.preventiveAction)
        updateForm.append('responsible_person_id', String(responsiblePersonId))
        updateForm.append('department_id', String(selectedDepartment))
        if (capa.targetDate) updateForm.append('target_date', capa.targetDate)
        if (priority) updateForm.append('priority', priority)
        if (v.recAction !== '-') updateForm.append('recommended_action', v.recAction)
        if (v.risk !== '-' && ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(v.risk.toUpperCase())) {
            updateForm.append('risk_priority', v.risk.toUpperCase())
        }
        if (v.recType !== '-') updateForm.append('recommended_action_type', v.recType)
        if (v.recText !== '-') updateForm.append('ai_recommendation', v.recText)
        if (v.finding !== '-') updateForm.append('hazard_type', v.finding)
        const capaRecommendation = {
            corrective_action: capa.correctiveAction,
            preventive_action: capa.preventiveAction,
            responsible_person_id: responsiblePersonId,
            department_id: selectedDepartment,
            ...(capa.targetDate ? { target_date: capa.targetDate } : {}),
            ...(priority ? { priority } : {}),
            ...(aiSuggestionText ? { ai_suggestions: aiSuggestionText } : {}),
        }

        setLoading(true)
        let updateSucceeded = false
        try {
            const updateResult = await patchRequest(
                `${OBSERVATIONS_ENDPOINT}/${encodeURIComponent(observationId)}/update`,
                updateForm,
                { isMultipart: true }
            )
            updateSucceeded = true

            const assignResult = await postRequest(
                `${OBSERVATIONS_ENDPOINT}/${encodeURIComponent(observationId)}/assign`,
                {
                    field_officer_id: responsiblePersonId,
                    capa_recommendation: capaRecommendation,
                }
            )

            setAiResult({
                observationId: assignResult?.observation_id ?? updateResult?.observation_id ?? observationId,
                riskLevel: assignResult?.risk_level ?? updateResult?.risk_level ?? v.risk,
            })
            setSuccessMessage('Observation successfully assigned.')
            setFormSubmit(true)
        } catch (err) {
            console.error(updateSucceeded ? 'Observation assignment failed after updating:' : 'Observation update failed:', err)
            const detail = err?.response?.detail
            const message = typeof detail === 'string' ? detail : err?.message
            alert(updateSucceeded
                ? `Observation details were updated, but assignment failed. ${message || 'Please retry assignment.'}`
                : `The observation could not be updated. ${message || 'Please try again.'}`)
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
            alert('The observation ID could not be found.')
            return
        }
        if (!Number.isInteger(responsiblePersonId) || responsiblePersonId <= 0) {
            alert('Please select a responsible person.')
            return
        }
        if (!Number.isInteger(selectedDepartment) || selectedDepartment <= 0) {
            alert('Please select a department.')
            return
        }

        const fd = new FormData()
        fd.append('responsible_person_id', String(responsiblePersonId))
        fd.append('department_id', String(selectedDepartment))
        fd.append('target_date', capa.targetDate)
        if (capa.priority) fd.append('priority', capa.priority.toUpperCase())
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
            alert('A CAPA recommendation could not be generated. Please try again.')
        } finally {
            setAnalyzing(false)
        }
    }

    const handleFormClose = () => {
        setFormSubmit(false);
        navigate(-1);
    }

    const handleTeamLeadDecision = async (decision, comments = '') => {
        if (!observationId) {
            alert('The observation ID could not be found.')
            return
        }

        setLoading(true)
        try {
            const response = await postRequest(
                `${OBSERVATIONS_ENDPOINT}/${encodeURIComponent(observationId)}/decision`,
                { decision, ...(comments.trim() ? { comments: comments.trim() } : {}) }
            )
            const decidedObservation = response?.data?.observation
                ?? response?.observation
                ?? response?.data
                ?? response
            setDetailObservation(decidedObservation)
            setSuccessMessage(decision === 'APPROVED'
                ? 'Observation approved successfully.'
                : 'Observation rejected successfully.')
            setFormReject(false)
            setFormSubmit(true)
        } catch (error) {
            console.error(`Observation ${decision.toLowerCase()} decision failed:`, error)
            const detail = error?.response?.detail
            alert(typeof detail === 'string'
                ? detail
                : error?.message || 'The observation decision could not be saved. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleFormRejection = () => {
        if (teamLeadReviewReady) {
            setRejectionComments('')
        }
        setFormReject(true);
    }
    const handleFormRejectionClose = () => {
        setFormReject(false);
    }

    const handleSafetyChatSubmit = async (event) => {
        event.preventDefault()
        const message = chatMessage.trim()
        if (!message || message.length > 4000 || chatLoading) return

        setChatMessages((previous) => [...previous, { role: 'user', content: message }])
        setChatMessage('')
        setChatError('')
        setChatLoading(true)
        try {
            const result = await postRequest('/api/chat', { message })
            if (typeof result?.response !== 'string' || !result.response.trim()) {
                throw new Error('The safety assistant returned an invalid response.')
            }
            setChatMessages((previous) => [...previous, { role: 'assistant', content: result.response }])
        } catch (error) {
            console.error('Safety chat request failed:', error)
            setChatError(error.message || 'The chat request failed. Please try again.')
        } finally {
            setChatLoading(false)
        }
    }

    return (
        <>
            <div className='title-bar'>
                <button type='button' className="btnBack" onClick={() => navigate(-1)}></button>
                <TitleBar title="Observation Details" />
            </div>
            {apiTranslationError && <p role="alert">{apiTranslationError}</p>}
            {detailLoading && <div className="card text-center" role="status">Loading the latest observation details...</div>}
            {detailError && <div className="card text-center" role="alert">{detailError}</div>}

            <div className="card mb-20">

                <div className="grid mb-10">
                    <div className="form-group">
                        <label>Observation ID</label>
                        <input type="text" placeholder="" value={v.obsId} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Observation Type</label>
                        <input type="text" placeholder="" value={displayValues.type} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Business Unit</label>
                        <input type="text" placeholder="" value={displayValues.bu} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Plant </label>
                        <input type="text" placeholder="" value={displayValues.plant} disabled readOnly />
                    </div>

                    <div className="form-group">
                        <label>Department </label>
                        <input type="text" placeholder="" value={displayValues.dept} disabled readOnly />
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input type="text" placeholder="" value={displayValues.location} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Observation Date & Time</label>
                        <input type="text" placeholder="" value={v.dateTime} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Reported By</label>
                        <input type="text" placeholder="" value={displayValues.reportedBy} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Description </label>
                        <textarea disabled readOnly value={displayValues.description} />
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
                        <textarea disabled readOnly value={displayValues.finding} />
                    </div>
                    <div className="form-group">
                        <label>AI Classification </label>
                        <textarea disabled readOnly value={displayValues.type} />
                    </div>
                    <div className="form-group">
                        <label>Detected Condition </label>
                        <textarea disabled readOnly value={displayValues.detected} />
                    </div>
                    <div className="form-group">
                        <label>Risk Indication </label>
                        <input type="text" placeholder="" value={displayValues.risk} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Confidence </label>
                        <input type="text" placeholder="" value={displayValues.confidence} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>AI Observation Summary</label>
                        <textarea disabled readOnly value={displayValues.summary} />
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
                        <textarea disabled readOnly value={displayValues.recAction} />
                    </div>
                    <div className="form-group">
                        <label>Risk Priority </label>
                        <input type="text" placeholder="" value={displayValues.risk} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>Recommended Action Type</label>
                        <input type="text" placeholder="" value={displayValues.recType} disabled readOnly />
                    </div>
                    <div className="form-group">
                        <label>AI Recommendation </label>
                        <textarea disabled readOnly value={displayValues.recText} />
                    </div>
                </div>
            </div>

            <div className="card mb-20">
                <h3 className='mb-10'>Safety Chatbot</h3>
                <div role="log" aria-live="polite" aria-label="Chat messages">
                    {chatMessages.length === 0 && <p>Ask a workplace safety question to get started.</p>}
                    {chatMessages.map((chat, index) => (
                        <div className="form-group" key={`${chat.role}-${index}`}>
                            <strong>{chat.role === 'user' ? 'You' : 'Safety Assistant'}</strong>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{chat.content}</p>
                        </div>
                    ))}
                    {chatLoading && <p role="status">Getting an answer...</p>}
                </div>
                {chatError && <p role="alert">{chatError}</p>}
                <form className="grid grid-col-1" onSubmit={handleSafetyChatSubmit}>
                    <div className="form-group">
                        <label htmlFor="safety-chat-message">Message</label>
                        <textarea
                            id="safety-chat-message"
                            rows={3}
                            maxLength={4000}
                            value={chatMessage}
                            onChange={(event) => setChatMessage(event.target.value)}
                            placeholder="What should I do if I find damaged safety equipment?"
                        />
                        <small>{chatMessage.length}/4000 characters</small>
                    </div>
                    <div className="d-flex">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={chatLoading || !chatMessage.trim()}
                        >
                            {chatLoading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card mb-20">
                {(isFieldOfficer || teamLeadReviewReady) ? (
                    <>
                        <h3 className='mb-10'>
                            {teamLeadReviewReady ? 'CAPA Recommendation' : 'CAPA Recommendation from Team Lead'}
                        </h3>
                        {isFieldOfficer && <p className="mb-15">This recommendation was provided by the Team Lead.</p>}
                        <div className="grid mb-15">
                            <div className="form-group">
                                <label>Corrective Action</label>
                                <textarea disabled readOnly value={capa.correctiveAction || '-'} />
                            </div>
                            <div className="form-group">
                                <label>Preventive Action</label>
                                <textarea disabled readOnly value={capa.preventiveAction || '-'} />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <input
                                    type="text"
                                    disabled
                                    readOnly
                                    value={pick(obs?.capa_recommendation ?? obs?.capaRecommendation, ['department', 'department_name', 'departmentName'], pick(obs, ['department_name', 'department'], '-'))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Responsible Person</label>
                                <input
                                    type="text"
                                    disabled
                                    readOnly
                                    value={pick(obs?.capa_recommendation ?? obs?.capaRecommendation, ['responsible_person_name', 'responsiblePersonName'], capa.responsiblePerson || '-')}
                                />
                            </div>
                            <div className="form-group">
                                <label>Target Date</label>
                                <input type="text" disabled readOnly value={capa.targetDate || '-'} />
                            </div>
                            <div className="form-group">
                                <label>Priority</label>
                                <input type="text" disabled readOnly value={capa.priority || '-'} />
                            </div>
                            {aiSuggestionText && (
                                <div className="form-group">
                                    <label>AI Suggestions</label>
                                    <textarea disabled readOnly value={aiSuggestionText} />
                                </div>
                            )}
                        </div>
                    </>
                ) : <>
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
                        <label>Department </label>
                        <select
                            value={selectedDepartmentId}
                            onChange={(event) => {
                                setDepartmentId(event.target.value)
                                setResponsiblePeople([])
                                setPeopleError('')
                                setCapa((prev) => ({ ...prev, responsiblePerson: '' }))
                            }}
                            disabled={departmentsLoading || Boolean(departmentError)}
                        >
                            <option value="">
                                {departmentsLoading ? 'Loading departments...' : departmentError || 'Select'}
                            </option>
                            {departments.map((d, i) => {
                                const dId = pick(d, ['id', 'department_id', 'departmentId'], i)
                                const dName = pick(d, ['name', 'department_name', 'departmentName', 'dept_name'])
                                return <option key={dId} value={dId}>{dName}</option>
                            })}
                        </select>
                        {departmentError && <small role="alert">{departmentError}</small>}
                    </div>
                    <div className="form-group">
                        <label>Responsible Person </label>
                        <select
                            name="responsiblePerson"
                            value={capa.responsiblePerson}
                            onChange={handleCapaChange}
                            disabled={!selectedDepartmentId || peopleLoading || Boolean(peopleError)}
                        >
                            <option value="">
                                {!selectedDepartmentId
                                    ? 'Select department first'
                                    : peopleLoading
                                        ? 'Loading responsible people...'
                                        : peopleError || 'Select'}
                            </option>
                            {capa.responsiblePerson &&
                                !responsiblePeople.some((person) =>
                                    String(pick(person, ['user_id', 'userId', 'id', 'value'])) === capa.responsiblePerson
                                ) &&
                                pick(obs?.capa_recommendation, ['responsible_person_name', 'responsiblePersonName']) && (
                                    <option value={capa.responsiblePerson}>
                                        {pick(obs.capa_recommendation, ['responsible_person_name', 'responsiblePersonName'])}
                                    </option>
                                )}
                            {responsiblePeople.map((person, index) => {
                                const userId = pick(person, ['user_id', 'userId', 'id', 'value'], index)
                                const name = pick(person, ['name', 'full_name', 'fullName', 'user_name', 'username', 'employee_name'])
                                if (userId === undefined || userId === null || !name) return null
                                return <option key={userId} value={userId}>{name}</option>
                            })}
                        </select>
                        {peopleError && <small role="alert">{peopleError}</small>}
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
                </>}
            </div>

            {roleResolved && (isFieldOfficer || isTeamLead) && isFieldSubmissionComplete && (
                <div className="card mb-20">
                    <h3 className='mb-10'>Submitted Before &amp; After Evidence</h3>
                    <div className="grid mb-15">
                        <div className="form-group">
                            <label>Before Correction</label>
                            {beforeEvidence.length
                                ? beforeEvidence.map((attachment) => (
                                        <div key={attachment.attachment_id ?? attachment.file_path}>
                                            <button type="button" className="btnView" onClick={() => openEvidence(attachment)}>
                                                View {fileNameOf(attachment.file_path)}
                                            </button>
                                        </div>
                                    ))
                                : <p>No before evidence uploaded.</p>}
                        </div>
                        <div className="form-group">
                            <label>After Correction</label>
                            {afterEvidence.length
                                ? afterEvidence.map((attachment) => (
                                        <div key={attachment.attachment_id ?? attachment.file_path}>
                                            <button type="button" className="btnView" onClick={() => openEvidence(attachment)}>
                                                View {fileNameOf(attachment.file_path)}
                                            </button>
                                        </div>
                                    ))
                                : <p>No after evidence uploaded.</p>}
                        </div>
                        <div className="form-group">
                            <label>Remarks</label>
                            <textarea disabled readOnly value={fieldSubmission.remarks || ''} />
                        </div>
                    </div>
                    <p>Submitted {fieldSubmission.submitted_at ? formatDateTime(fieldSubmission.submitted_at) : 'successfully'}.</p>
                </div>
            )}

            {roleResolved && isFieldOfficer && !isFieldSubmissionComplete && (
                <div className="card mb-20">
                    <h3 className='mb-10'>Upload Before &amp; After Evidence</h3>

                    <div className="grid mb-15">
                        <div className="form-group">
                            <label>Before Correction</label>
                            <input type="file" accept="image/*" multiple onChange={(event) => setBeforeImages(Array.from(event.target.files || []))} />
                        </div>
                        <div className="form-group">
                            <label>After Correction</label>
                            <input type="file" accept="image/*" multiple onChange={(event) => setAfterImages(Array.from(event.target.files || []))} />
                        </div>
                        <div className="form-group">
                            <label>Remarks</label>
                            <textarea maxLength={2000} value={submissionRemarks} onChange={(event) => setSubmissionRemarks(event.target.value)}></textarea>
                        </div>
                    </div>
                </div>
            )}

            <div className="d-flex">
                {teamLeadReviewReady ? (
                    <>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleTeamLeadDecision('APPROVED')}
                            disabled={loading || detailLoading || Boolean(detailError)}
                        >
                            {loading ? 'Please wait...' : 'Approve'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-rejected"
                            onClick={handleFormRejection}
                            disabled={loading || detailLoading || Boolean(detailError)}
                        >
                            Reject
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleFormSubmit}
                            disabled={loading || detailLoading || Boolean(detailError) || !roleResolved || (isFieldOfficer && isFieldSubmissionComplete)}
                        >
                            {loading ? 'Please wait...' : isFieldOfficer ? 'Submit' : 'Assign'}
                        </button>
                        {!isFieldOfficer && <button type="button" className="btn btn-rejected" onClick={handleFormRejection}>Reject</button>}
                    </>
                )}
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
                            <p className='text-center'>{successMessage || (isFieldOfficer ? 'Observation successfully submitted.' : 'Observation successfully assigned.')}</p>
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
                            <textarea
                                placeholder='Enter your rejection...'
                                value={rejectionComments}
                                onChange={(event) => setRejectionComments(event.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div className="modalFooter">
                        <button className='btn btn-gray' onClick={handleFormRejectionClose}>Cancel</button>
                        <button
                            className='btn btn-primary'
                            onClick={() => teamLeadReviewReady
                                ? handleTeamLeadDecision('REJECTED', rejectionComments)
                                : handleFormRejectionClose()}
                            disabled={loading}
                        >
                            {loading ? 'Please wait...' : 'Submit'}
                        </button>
                    </div>

                </div>
            </div>}


        </>
    )
}