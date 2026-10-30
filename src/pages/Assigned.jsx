import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MdRemoveRedEye } from 'react-icons/md'
import { TitleBar } from '../components/UI/TitleBar'
import { getRequest } from '../service/apiService'
import { useTranslatedApiValues } from '../hooks/useTranslatedApiValues'

const ENDPOINT = '/api/observations/assigned'

const toArray = (response) => {
    if (Array.isArray(response)) return response
    const data = response?.data ?? response
    return data?.items ?? data?.rows ?? data?.results ?? []
}

const pick = (observation, keys, fallback = '') => {
    for (const key of keys) {
        if (observation?.[key] !== undefined && observation[key] !== null) {
            return observation[key]
        }
    }
    return fallback
}

const formatStatus = (status) => String(status ?? '').replace(/_/g, ' ')
const getAssignedDisplayValues = (row) => [
    String(pick(row, ['plant_name', 'plantName', 'plant'], '--')),
    String(pick(row, ['risk_level', 'riskLevel', 'risk'], '--')),
    String(pick(row, ['reported_by', 'reported_by_name', 'reportedBy', 'employee_name', 'employeeName'], '--')),
    formatStatus(pick(row, ['status'], 'ASSIGNED_TO_OFFICER')),
]

const formatDateTime = (value) => {
    if (!value) return '--'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)

    const datePart = date.toLocaleDateString('en-GB')
    const timePart = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    }).toLowerCase()
    return `${datePart} - ${timePart}`
}

export const Assigned = () => {
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { translatedRows, translationError } = useTranslatedApiValues(rows, getAssignedDisplayValues)

    useEffect(() => {
        let ignore = false

        const loadAssigned = async () => {
            try {
                const response = await getRequest(ENDPOINT)
                if (!ignore) setRows(toArray(response))
            } catch (err) {
                if (!ignore) {
                    console.error('Assigned observations load failed:', err)
                    setError(err.message || 'Assigned observations load nahi ho paye')
                }
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        loadAssigned()
        return () => { ignore = true }
    }, [])

    return (
        <>
            <TitleBar title="Assigned Observation" />
            {translationError && <p role="alert">{translationError}</p>}

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Observation ID</th>
                                <th>Plant</th>
                                <th>Risk</th>
                                <th>Reported By</th>
                                <th>Reported Date &amp; Time</th>
                                <th>Status</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center">Loading...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={7} className="text-center">{error}</td></tr>
                            ) : rows.length === 0 ? (
                                <tr><td colSpan={7} className="text-center">No assigned observations found</td></tr>
                            ) : rows.map((observation, index) => {
                                const observationId = pick(observation, ['observation_id', 'observationId', 'id'])
                                const [plant, risk, reportedBy, status] =
                                    translatedRows[index] || getAssignedDisplayValues(observation)
                                const observationCode = pick(
                                    observation,
                                    ['observation_code', 'observation_no', 'observationCode'],
                                    observationId || '--'
                                )

                                return (
                                    <tr key={observationId || index}>
                                        <td data-translation-api="true">{observationCode}</td>
                                        <td data-translation-api="true">{plant}</td>
                                        <td data-translation-api="true">{risk}</td>
                                        <td data-translation-api="true">{reportedBy}</td>
                                        <td data-translation-api="true">{formatDateTime(pick(observation, ['occurred_at', 'created_at', 'createdAt', 'observation_date', 'reported_at']))}</td>
                                        <td data-translation-api="true"><span className="pending">{status}</span></td>
                                        <td>
                                            <div className="items-center">
                                                <Link
                                                    to="/assigned-observation-details"
                                                    state={{ observation }}
                                                    className="btn-view"
                                                    title="View"
                                                >
                                                    <MdRemoveRedEye />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
