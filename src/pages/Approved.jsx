import React, { useEffect, useState } from 'react'
import { TitleBar } from '../components/UI/TitleBar'
import { MdRemoveRedEye } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { getRequest } from "../service/apiService"
import { useTranslatedApiValues } from "../hooks/useTranslatedApiValues"

const ENDPOINT = '/api/observations/approved'

// response array ho ya { data: [...] }, dono chalega
const toArray = (json) => (Array.isArray(json) ? json : json?.data || json?.items || json?.rows || [])

// pehla available key utha leta hai (snake_case / camelCase dono ke liye)
const pick = (obj, keys, fallback = '') => {
    for (const k of keys) if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k]
    return fallback
}

// "06-10-26 - 12:15pm" format
const formatDateTime = (value) => {
    if (!value) return ''
    const d = new Date(value)
    if (isNaN(d)) return String(value)
    const pad = (n) => String(n).padStart(2, '0')
    let h = d.getHours()
    const ampm = h >= 12 ? 'pm' : 'am'
    h = h % 12 || 12
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${String(d.getFullYear()).slice(-2)} - ${h}:${pad(d.getMinutes())}${ampm}`
}

const titleCase = (value) => String(value || 'Approved')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase())

const getApprovedDisplayValues = (row) => [
    String(pick(row, ['plant_name', 'plantName', 'plant'])),
    String(pick(row, ['risk_level', 'riskLevel', 'risk'])),
    String(pick(row, ['reported_by', 'reportedBy', 'employee_name', 'employeeName'])),
    titleCase(pick(row, ['status'], 'Approved')),
]

export const Approved = () => {
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { translatedRows, translationError } = useTranslatedApiValues(rows, getApprovedDisplayValues)

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getRequest(ENDPOINT)
                setRows(toArray(data))
            } catch (err) {
                console.error(err)
                setError(err.message || 'Approved observations load nahi ho paye')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    return (
        <>
            <TitleBar title="Approved" />
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
                                <th>Reported Date & Time</th>
                                <th>Status</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="text-center">Loading...</td>
                                </tr>
                            )}

                            {!loading && error && (
                                <tr>
                                    <td colSpan={7} className="text-center">{error}</td>
                                </tr>
                            )}

                            {!loading && !error && rows.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center">No approved observations found</td>
                                </tr>
                            )}

                            {!loading && !error && rows.map((r, i) => {
                                const obsId = pick(r, ['observation_id', 'observationId', 'id'])
                                const detailId = pick(r, ['observation_id', 'observationId', 'observation_pk', 'id'])
                                const code = pick(r, ['observation_code', 'observation_no', 'observationCode'], obsId)
                                const [plant, risk, reportedBy, status] = translatedRows[i] || getApprovedDisplayValues(r)
                                return (
                                    <tr key={obsId || i}>
                                        <td data-translation-api="true">{code}</td>
                                        <td data-translation-api="true">{plant}</td>
                                        <td data-translation-api="true">{risk}</td>
                                        <td data-translation-api="true">{reportedBy}</td>
                                        <td data-translation-api="true">{formatDateTime(pick(r, ['created_at', 'createdAt', 'observation_date', 'reported_at']))}</td>
                                        <td data-translation-api="true"><span className="approved">{status}</span></td>
                                        <td>
                                            <div className="items-center">
                                                <Link
                                                    to={`/approved-observation-details/${detailId}`}
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