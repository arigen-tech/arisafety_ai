import React from 'react'

export const Filters = () => {
    return (
        <div className="card filterGrid mb-20">
            <h2>Filters</h2>
            <div className="grid mb-10">
                <div className="form-group">
                    <label>Date Range</label>
                    <input type="date" placeholder="" value="4999" />
                </div>
                <div className="form-group">
                    <label>&nbsp;</label>
                    <input type="date" placeholder="" value="20" />
                </div>

                <div className="form-group">
                    <label>Business Unit</label>
                    <select>
                        <option value="">All</option>
                        <option value="0"></option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Plant</label>
                    <select>
                        <option value="">All</option>
                        <option value="0"></option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Area</label>
                    <select>
                        <option value="">All</option>
                        <option value="0"></option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Observation Type</label>
                    <select>
                        <option value="">All</option>
                        <option value="0"></option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Risk Level</label>
                    <select>
                        <option value="">All</option>
                        <option value="0"></option>
                    </select>
                </div>
                <div className="form-group">
                    <label>PPE Type</label>
                    <select>
                        <option value="">All</option>
                        <option value="0"></option>
                    </select>
                </div>

                <div className="btn-group itemEnd">
                    <button type="button" className="btn btn-primary">Apply</button>
                </div>
                <div className="btn-group itemEnd">
                    <button type="button" className="btn btn-gray">Clear Filter</button>
                </div>

            </div>

        </div>
    )
}
