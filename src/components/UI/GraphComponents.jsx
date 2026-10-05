import chartOne from '/images/charts/chart-1.svg'
import chartTwo from '/images/charts/chart-2.svg'
import chartThree from '/images/charts/chart-3.svg'
import chartFour from '/images/charts/chart-4.svg'
import chartFive from '/images/charts/chart-5.svg'
import chartSix from '/images/charts/chart-6.svg'



export const GraphComponents = () => {
    return (
        <>
            <div class="grid grid-col-2 graphCard">
                <div class="card">
                    <div class="titleBar">
                        <span><img src="images/icons/chart-icon.svg" alt="icon" /></span>
                        <h3>Plant Comparison</h3>
                    </div>
                    <div class="chartContent">
                        <img src={chartOne} alt="chart" />
                    </div>
                </div>
                <div class="card">
                    <div class="titleBar">
                        <span><img src="images/icons/chart-icon-2.svg" alt="icon" /></span>
                        <h3>Business Unit Comparison</h3>
                    </div>
                    <div class="chartContent">
                        <img src={chartTwo} alt="chart" />
                    </div>
                </div>
                <div class="card">
                    <div class="titleBar">
                        <span><img src="images/icons/chart-icon.svg" alt="icon" /></span>
                        <h3>Plant Risk Observations</h3>
                    </div>
                    <div class="chartContent">
                        <img src={chartThree} alt="chart" />
                    </div>
                </div>
                <div class="card">
                    <div class="titleBar">
                        <span><img src="images/icons/chart-icon.svg" alt="icon" /></span>
                        <h3>Plant Observation Count</h3>
                    </div>
                    <div class="chartContent">
                        <img src={chartFour} alt="chart" />
                    </div>
                </div>
                <div class="card">
                    <div class="titleBar">
                        <span><img src="images/icons/chart-icon.svg" alt="icon" /></span>
                        <h3>Top 5 Recurring Safety Risks</h3>
                    </div>
                    <div class="chartContent">
                        <img src={chartFive} alt="chart" />
                    </div>
                </div>
                <div class="card">
                    <div class="titleBar">
                        <span><img src="images/icons/chart-icon.svg" alt="icon" /></span>
                        <h3>PPE Compliance</h3>
                    </div>
                    <div class="chartContent">
                        <img src={chartSix} alt="chart" />
                    </div>
                </div>
            </div>
        </>
    )
}
