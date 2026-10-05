import React from 'react'

export const Filters = () => {
    return (
        <div class="card filterGrid mb-20">
            <h2>Filters</h2>
            <div class="grid mb-10">
                <div class="form-group">
                    <label>Date Range</label>
                    <input type="date" placeholder="" value="4999" />
                </div>
                <div class="form-group">
                    <label>&nbsp;</label>
                    <input type="date" placeholder="" value="20" />
                </div>

                <div class="form-group">
                    <label>Business Unit</label>
                    <select>
                        <option value="">All</option>
                        <option value="0"></option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Plant</label>
                    <select>
                        <option value="">All</option>
                        <option value="0"></option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Area</label>
                    <select>
                        <option value="">All</option>
                        <option value="0"></option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Observation Type</label>
                    <select>
                        <option value="">All</option>
                        <option value="0"></option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Risk Level</label>
                    <select>
                        <option value="">All</option>
                        <option value="0"></option>
                    </select>
                </div>
                <div class="form-group">
                    <label>PPE Type</label>
                    <select>
                        <option value="">All</option>
                        <option value="0"></option>
                    </select>
                </div>

                <div class="btn-group itemEnd">
                    <button type="button" class="btn btn-primary">Apply</button>
                </div>
                <div class="btn-group itemEnd">
                    <button type="button" class="btn btn-gray">Clear Filter</button>
                </div>

            </div>

        </div>
    )
}
