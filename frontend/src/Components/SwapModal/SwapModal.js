import './SwapModal.scss'
import { Link } from 'react-router-dom'
import Card from '../Card/Card'
import closeBtn from '../../assets/images/ionic-md-close.svg'

const SwapModal = ({ closeModal, tokenOneCurrency, tokenTwoCurrency, tokenOneValue, tokenTwoValue, tokenOneIcon, tokenTwoIcon, sharePoolValue, handleSwap, priceImpact, liquidityProviderFee }) => {
    return (
        <>
            <div className="backdrop"></div>
            <Card className="selectCurrency_modal">
                <div className="col modal_headerStyle">
                    <div className="row modal_headerStyle__rowA lessMargin_bottom close-col">
                        <div className="  modal_headerStyle__rowA_colLeft">
                            <h2>Confirm Swap</h2>
                        </div>
                        <div className=" modal_headerStyle__rowA_colRight">
                            <Link to="#" onClick={closeModal}><img src={closeBtn} alt="icon" /></Link>
                        </div>
                    </div>
                </div>
                <ul className="confirm_list">
                    <li><p><img src={tokenOneIcon} alt="icon" />{tokenOneValue}</p> <span> {tokenOneCurrency}</span></li>
                    <li><p><img src={tokenTwoIcon} alt="icon" />{tokenTwoValue}</p> <span> {tokenTwoCurrency}</span></li>
                    <li>Price: <span> {sharePoolValue} {tokenOneCurrency}/ {tokenTwoCurrency}</span></li>
                    <li>Price Impact: {priceImpact}%</li>
                    <li>Liquidity provider fee: {liquidityProviderFee}</li>
                </ul>
                <div className="col modal_headerStyle__rowC_colRight Confirm_btn">
                    <button className="btn buttonStyle full" onClick={() => handleSwap()}>Confirm</button>
                </div>
            </Card>
        </>
    )

}

export default SwapModal;