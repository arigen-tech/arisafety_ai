import React from 'react'
import { DashboardCards } from '../components/UI/DashboardCards'
import { TitleBar } from '../components/UI/TitleBar'
import { GraphComponents } from '../components/UI/GraphComponents'

export const Dashboard = () => {
    return (
        <>
            <TitleBar title="Dashboard" />

            <DashboardCards />

            <GraphComponents />
        </>
    )
}
