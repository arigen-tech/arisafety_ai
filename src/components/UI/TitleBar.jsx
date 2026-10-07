import React from 'react'

export const TitleBar = ({title}) => {
    return (
        <div className="title-bar">
            {/* <button type="button" className="btnBack"></button> */}
            <h2 className="mb-0">{title}</h2>
        </div>
    )
}
