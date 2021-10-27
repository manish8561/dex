import './StepsSwapStyle.scss'
import {Link} from 'react-router-dom'

const StepsSwap = props => {
    return(
        <ul className="stepsswap_style">
            <li className={`firstStep ${props.firstStep}`}><Link to="/swap">Swap</Link></li>
            <li className={`secondStep ${props.secondStep}`}><Link to="/liquidity">Liquidity</Link></li>
            <li><a href="https://www.binance.org/en/bridge?utm_source=AnchorSwap" target="_blank" rel="noreferrer">Bridge</a></li>
        </ul>
    )
}

export default StepsSwap