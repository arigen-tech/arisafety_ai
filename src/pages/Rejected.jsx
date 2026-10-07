import React from 'react'
import { TitleBar } from '../components/UI/TitleBar'
import { MdRemoveRedEye } from 'react-icons/md'
import { Link } from 'react-router-dom'

export const Rejected = () => {
    return (
        <>
            <TitleBar title="Rejected" />

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
                            <tr>
                                <td>SAF-000124</td>
                                <td>Pune</td>
                                <td>HIGH</td>
                                <td>Team Lead</td>
                                <td>06-10-26 - 12:15pm</td>
                                <td><span className='rejected'>Rejected</span></td>
                                <td><div className="items-center"><Link to="/rejected-observation-details" className="btn-view" title="View"><MdRemoveRedEye /></Link></div></td>
                            </tr>
                            <tr>
                                <td>SAF-000125</td>
                                <td>Pune</td>
                                <td>LOW</td>
                                <td>Team Lead</td>
                                <td>06-10-26 - 12:15pm</td>
                                <td><span className='rejected'>Rejected</span></td>
                                <td><div className="items-center"><Link to="/rejected-observation-details" className="btn-view" title="View"><MdRemoveRedEye /></Link></div></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
