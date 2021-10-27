import './SettingsModal.scss'
import { Link } from 'react-router-dom'
import Card from '../Card/Card'
import icon_information from '../../assets/images/icon_information.png'
import closeBtn from '../../assets/images/ionic-md-close.svg'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { saveDeadline, saveSlippagePercentage } from '../../redux/actions/PersistActions'
import Button from 'react-bootstrap/Button'
import ReactTooltip from 'react-tooltip';


const SettingsModal = ({ txHash, handleCloseSettings, handleSlippageTolerance, }) => {
    const dispatch = useDispatch();

    const slippagePercentage = useSelector(state => state.persist.slippagePercentage);

    const MAX_SLIPPAGE = 49000
    const RISKY_SLIPPAGE_LOW = 50
    const RISKY_SLIPPAGE_HIGH = 4900

    const [value, setValue] = useState(slippagePercentage);
    const [error, setError] = useState(null);
    const [deadline, setDeadline] = useState(20);
    const [deadlineError, setDeadlineError] = useState(null);

    const predefinedValues = [0.1, 0.5, 1];

    const handleChange = (e) => {
        let v = parseFloat(e.target.value);
        setValue(v);
        validateValue(v);
    }
    const validateValue = async (v) => {
        try {
            setValue(v);
            v *= 100;
            v = parseInt(v);
            if (!Number.isNaN(v) && v > 0 && v < MAX_SLIPPAGE) {
                if (v < RISKY_SLIPPAGE_LOW) {
                    return setError('Your transaction may fail')
                } else if (v > RISKY_SLIPPAGE_HIGH) {
                    return setError('Maximum allowed slippage value exceeded')
                }
                v /= 100;
                await dispatch(saveSlippagePercentage(v));
                setError(null)
            } else {
                setError('Enter valid a slippage percentage');
            }
        } catch (err) {
            setError('Enter valid a slippage percentage');
        }
    }

    const changeDeadline = async (e) => {
        const dl = parseInt(e.target.value);
        setDeadline(dl);
        if (dl <= 0) {
            return setDeadlineError('Enter a valid deadline');
        }
        dispatch(saveDeadline(dl));
        setDeadlineError(null);
    }
    return (
        <>
            <div className="backdrop"></div>
            <Card className="selectCurrency_modal setting_modal">
                <div className="col modal_headerStyle">
                    <div className="row modal_headerStyle__rowA lessMargin_bottom">
                        <div className="  modal_headerStyle__rowA_colLeft">
                            <h2>Settings</h2>
                        </div>
                        <div className="col modal_headerStyle__rowA_colRight">
                            <Link to="#" onClick={handleCloseSettings}><img src={closeBtn} alt="icon" /></Link>
                        </div>
                    </div>
                </div>
                <div className="settingModalBody ">
                    <div className="modal-heading">
                        <h4>Slippage Tolerance

                        </h4>
                        <img data-tip data-for="registerTip" src={icon_information} alt="icon" />
                    </div>
                    <ReactTooltip id="registerTip" place="right" effect="solid" className="tooltipbox">
                        Your transaction will revert if the price changes unfavorably by more than this percentage.s
                    </ReactTooltip>
                    <div className="settingFeilds">
                        {predefinedValues.map(d => {
                            return (<span key={d}>
                                <button variant={value === d ? 'primary' : 'tertiary'} onClick={() => validateValue(d)}>
                                    {d}%
                                </button>
                            </span>)
                        })}

                        <span>
                            <input
                                type="number"
                                scale="lg"
                                step={0.1}
                                min={0.1}
                                placeholder="5%"
                                value={value}
                                onChange={handleChange}
                            />
                        </span>
                        <span className="text" >
                            %
                        </span>
                        {error && (
                            <p className="frontrunText">
                                {error}
                            </p>)}
                    </div>
                    <div className="">
                        <div className="modal-heading">
                            <h4>Transaction Deadline</h4>
                            <img data-tip data-for="registerTip" src={icon_information} alt="icon" />
                        </div>
                        <div className="  modal_headerStyle__rowA_colLeft">

                            <div>
                                <input type="number" step="1" min="1" value={deadline} onChange={changeDeadline} /> &nbsp;
                                <span>Minutes</span>
                                {deadlineError && (
                                    <p style={{ color: 'red', marginTop: '10px' }}>
                                        {deadlineError}
                                    </p>)}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </>
    );

}

export default SettingsModal;