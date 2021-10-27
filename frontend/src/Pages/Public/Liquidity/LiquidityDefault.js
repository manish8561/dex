import { Link } from 'react-router-dom'
import Card from '../../../Components/Card/Card'
import iconTimer from '../../../assets/images/ionic-ios-timer.svg'
import iconSetting from '../../../assets/images/ionic-md-settings.svg'
import { useEffect, useState } from 'react'
import SettingsModal from '../../../Components/Settings/SettingsModal'
import RecentTransactions from '../../../Components/RecentTransactions/RecentTransactions'
import { useDispatch, useSelector } from 'react-redux'
import { getUserLPTokens } from '../../../redux/actions'
import TokenBalance from "./TokenBalance"

const LiquidityDefault = ({ handleClick, handleAddLiquidity, handleRemove }) => {
    const dispatch = useDispatch();
    const isUserConnected = useSelector(state => state.persist.isUserConnected);
    const userLpTokens = useSelector(state => state.persist.userLpTokens);

    const [showSettings, setShowSettings] = useState(false);
    const [showRecent, setShowRecent] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(-1);

    const handleCloseSettings = () => setShowSettings(false);
    const handleCloseRecent = () => setShowRecent(false);

    const init = async () => {
        if (isUserConnected) {
            await dispatch(getUserLPTokens())
        }
    };

    useEffect(() => {
        init();
    }, [isUserConnected]);

    const toggleDropdwon = index => {
        if (currentIndex === index) {
            setCurrentIndex(-1);
        } else {
            setCurrentIndex(index);
        }
    };

    return (
        <Card>
            <div className="col container_swapwrap__header liquidity_default_header">
                <div className="row">
                    <div className="col liquidity_default_header__left">
                        <h2>Liquidity</h2>
                        <p>Add liquidity to receive ANCHOR-LP
                            tokens</p>
                        <Link to="#" onClick={() => handleClick(2)} className="btn">Add Liquidity</Link>
                    </div>
                    <div className="col liquidity_default_header__right">
                        <Link to="#" onClick={() => setShowRecent(true)}><img src={iconTimer} alt="icon" /></Link>
                        <Link to="#" onClick={() => setShowSettings(true)}><img src={iconSetting} alt="icon" /></Link>
                    </div>
                </div>
            </div>
            <div className="col">
                <div className="col addLiquidity_info_header">
                    <h3>Your Liquidity</h3>
                </div>

                {!isUserConnected ?
                    <div className="col addLiquidity_info_card"><p>Connect to a wallet to view your <br />
                        liquidity.</p>
                    </div>
                    :
                    userLpTokens.length > 0 ?
                        <>
                            {userLpTokens.map((lp, index) =>
                                <div className="liquidityList" key={index}>
                                    <div className={currentIndex === index ? "liquidityListMain openbox" : "liquidityListMain"} onClick={() => toggleDropdwon(index)}>
                                        <img src={lp.token0Obj.icon} alt="icon" /> <img src={lp.token1Obj.icon} alt="icon" />{lp.pairName}
                                    </div>
                                    {currentIndex === index && <ul>
                                        <li>Pooled {lp.token0Obj.symbol}: <span><TokenBalance address={lp.token0} balance={lp.token0Deposit} /> <img src={lp.token0Obj.icon} alt="icon" /></span></li>
                                        <li>Pooled {lp.token1Obj.symbol}: <span><TokenBalance address={lp.token1} balance={lp.token1Deposit} /> <img src={lp.token1Obj.icon} alt="icon" /></span></li>
                                        <li>Your pool tokens: <span>{lp.balance.toFixed(5)}</span></li>
                                        <li>Your pool share: <span>{lp.poolShare}% </span></li>
                                        <li>
                                            <Link className="btn" to="#" onClick={() => handleAddLiquidity(lp)}>Add</Link>
                                            <Link className="btn" to="#" onClick={() => handleRemove(lp)}>Remove</Link>
                                        </li>
                                    </ul>}
                                </div>
                            )}
                        </>
                        :
                        <div className="col addLiquidity_info_card">
                            <p>No liquidity found.</p>
                        </div>
                }
                <div className="col addLiquidity_info_instruction">
                    <p>Don’t see a pool you joined? <Link to="#" onClick={() => handleClick(3)}> Import it.</Link></p>
                    <p> Or, if you staked your ANCHOR-LP tokens in
                        a farm, unstake them to see them here.</p>
                </div>
            </div>
            {showSettings && <SettingsModal handleCloseSettings={handleCloseSettings} />}
            {showRecent && <RecentTransactions handleCloseRecent={handleCloseRecent} />}
        </Card>
    )

}

export default LiquidityDefault