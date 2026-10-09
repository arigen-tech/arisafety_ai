import React, { useEffect, useState } from 'react'
import { TitleBar } from '../components/UI/TitleBar'
import { MdRemoveRedEye } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { getRequest } from "../service/apiService" // path apne project ke hisaab se check karo

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

// APPROVED / approved -> Approved
const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : 'Approved')

export const Approved = () => {
    const [rows, setRows] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

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
                                const code = pick(r, ['observation_code', 'observation_no', 'observationCode'], obsId)
                                return (
                                    <tr key={obsId || i}>
                                        <td>{code}</td>
                                        <td>{pick(r, ['plant_name', 'plantName', 'plant'])}</td>
                                        <td>{pick(r, ['risk_level', 'riskLevel', 'risk'])}</td>
                                        <td>{pick(r, ['reported_by', 'reportedBy', 'employee_name', 'employeeName'])}</td>
                                        <td>{formatDateTime(pick(r, ['created_at', 'createdAt', 'observation_date', 'reported_at']))}</td>
                                        <td><span className="approved">{titleCase(pick(r, ['status'], 'Approved'))}</span></td>
                                        <td>
                                            <div className="items-center">
                                                <Link
                                                    to={`/approved-observation-details/${obsId}`}
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