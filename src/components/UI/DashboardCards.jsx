
export const DashboardCards = () => {
    return (
        <div className="grid dashboardCard mb-30">
            <a href="javascript:void(0)">
                <div className="card">
                    <div className="cardFlex">
                        <div className="icon"><img src="images/icons/folder-icon.svg" alt="icon" /></div>
                        <div className="info">
                            <h3>21 <span>
                                <img src="images/icons/arrow-up-icon.svg" alt="arow up icon" />
                                <span>+3%</span>
                            </span>
                            </h3>
                            <p>Updated today</p>
                        </div>
                    </div>
                    <div className="title">
                        <h4>Total Observations</h4>
                    </div>
                </div>
            </a>

            <a href="javascript:void(0)">
                <div className="card">
                    <div className="cardFlex">
                        <div className="icon"><img src="images/icons/pending-icon.svg" alt="icon" /></div>
                        <div className="info">
                            <h3>3</h3>
                            <p><span>+1</span> (thid week)</p>
                        </div>
                    </div>
                    <div className="title">
                        <h4>Open Observations</h4>
                    </div>
                </div>
            </a>

            <a href="javascript:void(0)">
                <div className="card">
                    <div className="cardFlex">
                        <div className="icon"><img src="images/icons/high-risk-icon.svg" alt="icon" /></div>
                        <div className="info">
                            <h3>14</h3>
                            <p><span className="red-text">-2%</span> (priority down)</p>
                        </div>
                    </div>
                    <div className="title">
                        <h4>High-Risk Observations</h4>
                    </div>
                </div>
            </a>

            <a href="javascript:void(0)">
                <div className="card">
                    <div className="cardFlex">
                        <div className="icon"><img src="images/icons/check-icon.svg" alt="icon" /></div>
                        <div className="info">
                            <h3>25</h3>
                            <p><span>+5%</span> (closed faster)</p>
                        </div>
                    </div>
                    <div className="title">
                        <h4>Closed Observations</h4>
                    </div>
                </div>
            </a>

            <a href="javascript:void(0)">
                <div className="card">
                    <div className="cardFlex">
                        <div className="icon"><img src="images/icons/safety-icon.svg" alt="icon" /></div>
                        <div className="info">
                            <h3>12</h3>
                            <p><span><img src="images/icons/check-circle-icon.svg" alt="icon" /></span> Verified</p>
                        </div>
                    </div>
                    <div className="title">
                        <h4>PPE Compliance</h4>
                    </div>
                </div>
            </a>

            <a href="javascript:void(0)">
                <div className="card">
                    <div className="cardFlex">
                        <div className="icon"><img src="images/icons/graph-icon.svg" alt="icon" /></div>
                        <div className="info">
                            <h3>10</h3>
                            <p>Overall Trend: Improving</p>
                        </div>
                    </div>
                    <div className="title">
                        <h4>Plant-Wise Safety Trends</h4>
                    </div>
                </div>
            </a>

            <a href="javascript:void(0)">
                <div className="card">
                    <div className="cardFlex">
                        <div className="icon"><img src="images/icons/distribution-icon.svg" alt="icon" /></div>
                        <div className="info">
                            <h3>18</h3>
                            <p>Risk Score: Moderate</p>
                        </div>
                    </div>
                    <div className="title">
                        <h4>Risk Distribution</h4>
                    </div>
                </div>
            </a>

            <a href="javascript:void(0)">
                <div className="card">
                    <div className="cardFlex">
                        <div className="icon"><img src="images/icons/issues-icon.svg" alt="icon" /></div>
                        <div className="info">
                            <h3>5</h3>
                            <p>Common Issue: Spec Name</p>
                        </div>
                    </div>
                    <div className="title">
                        <h4>Recurring Issues</h4>
                    </div>
                </div>
            </a>

        </div>
    )
}
