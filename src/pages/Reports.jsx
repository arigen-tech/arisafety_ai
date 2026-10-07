import React from 'react'
import { TitleBar } from '../components/UI/TitleBar'

export const Reports = () => {
    return (
        <>
            <TitleBar title="Reports" />

            <div className="card">
                <div className="grid mb-15">
                    <div className="form-group">
                        <label>From date</label>
                        <input type="date" placeholder="" />
                    </div>
                    <div className="form-group">
                        <label>To date</label>
                        <input type="date" placeholder="" />
                    </div>
                    <div className="form-group">
                        <label>Business Unit</label>
                        <select>
                            <option value="">Select</option>
                            <option value="0"></option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Plant</label>
                        <select>
                            <option value="">Select</option>
                            <option value="0"></option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Department</label>
                        <select>
                            <option value="">Select</option>
                            <option value="0"></option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Report Name</label>
                        <select>
                            <option value="">Select</option>
                            <option value="0">Observation Report</option>
                        </select>
                    </div>
                    <div className="btn-group itemEnd">
                        <button type="button" className="btn btn-primary">Generate & Download Report</button>
                    </div>                   

                </div>

            </div>

            
        </>
    )
}
