import heatmapChart from '/images/charts/heatmap-graph.svg'
import trendChart from '/images/charts/trend-analysis-chart.svg'
import comparison from '/images/charts/plant-wise-comparison.png'

export const GraphComponents = () => {
  return (
    <>
        <div className="grid grid-col-2 graphCard">
                <div className="card">
                    <div className="titleBar">
                        <span><img src="images/icons/chart-icon.svg" alt="icon" /></span>
                        <h3>Monthly Heatmap</h3>
                    </div>
                    <div className="chartContent">
                        <img src={heatmapChart} alt="chart" />
                    </div>
                </div>
                <div className="card">
                    <div className="titleBar">
                        <span><img src="images/icons/chart-icon-2.svg" alt="icon" /></span>
                        <h3>Trend Analysis Chart</h3>
                    </div>
                    <div className="chartContent">
                        <img src={trendChart} alt="chart" />
                    </div>
                </div>
                <div className="card">
                    <div className="titleBar">
                        <span><img src="images/icons/chart-icon.svg" alt="icon" /></span>
                        <h3>Plant Wise Comparison</h3>
                    </div>
                    <div className="chartContent">
                        <img src={comparison} alt="chart" />
                    </div>
                </div>
            </div>
    </>
  )
}
