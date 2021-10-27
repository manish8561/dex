import './InputSelectCurrency.scss'
import ionicArrowDown from '../../assets/images/ionic-ios-arrow-down.svg'

const InputSelectCurrency = ({ className, label, defaultValue, onChange, currencyType, onClick, currnecyName, balance, max, onMax }) => {
    return (
        <div className={`col InputSelectCurrency_style ${className}`} >
            <label className="labelTextStyle">{label}</label>
            <label className="right">Balance: {balance}</label>

            <div className="row">
                <div className="col InputSelectCurrency_style__left">
                    <input className="inputStyle"
                        inputMode="decimal"
                        title="Token Amount"
                        autoCorrect="off"
                        autoComplete="off"
                        pattern="^[0-9]*[.,]?[0-9]*$"
                        placeholder="0.0"
                        minLength={1}
                        maxLength={79}
                        spellCheck="off"
                        type="text"
                        value={defaultValue}
                        onChange={onChange} min={0}
                    />
                </div>
                {max && <button type="button" class="sc-dlfnbm chDBQs max-btn" onClick={onMax}>MAX</button>}
                <div className="col InputSelectCurrency_style__right">
                    <button onClick={onClick} className="btn_selectCurrency">
                        <img src={currencyType} alt="icon" />
                        <span className="currencyName_textStyle">{currnecyName}</span>
                        <img src={ionicArrowDown} alt="icon" />
                    </button>
                </div>
            </div>
        </div>
    )
}
export default InputSelectCurrency