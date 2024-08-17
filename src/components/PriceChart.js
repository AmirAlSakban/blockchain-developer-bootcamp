import { useSelector } from "react-redux";
import Chart from "react-apexcharts";
import arrowDown from '../assets/down-arrow.svg';
import arrowUp from '../assets/up-arrow.svg';
import { options, defaultSeries } from "./PriceChart.config";
import { PriceChartSelector } from "../store/selectors";
import Banner from "./Banner";

const PriceChart = () => {
    const account = useSelector(state => state.provider.account);
    const symbols = useSelector(state => state.tokens.symbols);
    const PriceChart = useSelector(PriceChartSelector);

    return (
      <div className="component exchange__chart">
        <div className='component__header flex-between'>
          <div className='flex'>
  
            <h2>{symbols && `${symbols[0]}/${symbols[1]}`}</h2>

            {PriceChart && (
                <div className='flex'>

                    {PriceChart.lastPriceChange === '+' ? (
                    <img src={arrowUp} alt="Arrow up" />
                ) : (
                        <img src={arrowDown} alt="Arrow down" />
                    )}                
            
                <span className='up'>{PriceChart.lastPrice}</span>
                </div>
            )}

          </div>
        </div>
  
        {!account ? (
            <Banner text={'Please connect your wallet'} />
        ) : (
            <Chart
                type="candlestick"
                options={options}
                series={PriceChart ? PriceChart.series : defaultSeries}
                width="100%"
                height="100%"
            />
        )}
  
      </div>
    );
  }
  
  export default PriceChart;