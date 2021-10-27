import React, { useState } from 'react'
import './ModalSelectTokenStyle.scss'
import { Link } from 'react-router-dom'
import sortIcon from '../../assets/images/arrow_sorting@2x.png'
import Card from '../Card/Card'
import icon_information from '../../assets/images/icon_information.png'
import closeBtn from '../../assets/images/ionic-md-close.svg'
import icon_bnb from '../../assets/images/icon_bnb.svg'
import { useDispatch } from 'react-redux'
import { tokenListAdd, tokenListDel, removeTokenList } from "../../redux/actions"
import TokenBalance from "./TokenBalance"

const ModalSelectToken = ({ closeModal, tokenList, handleOrder, selectCurrency, tokenType, searchToken, searchByName, currencyName }) => {
    const dispatch = useDispatch();

    const [isAdded, setTokenAdd] = useState(true);
    const handleTokenList = (data) => {
        data.isAdd = false;
        data.isDel = true;
        dispatch(tokenListAdd(data))
        setTokenAdd(false);
    }
    const handleRemoveTokenList = async (data) => {
        dispatch(tokenListDel(data))
        searchByName('');
        window.location.reload();
    }

    return (
        <>
            <div className="backdrop"></div>
            <Card className="selectCurrency_modal">
                <div className="col modal_headerStyle">
                    <div className="row modal_headerStyle__rowA lessMargin_bottom close-col">
                        <div className="  modal_headerStyle__rowA_colLeft">
                            <h2>Select a token</h2>
                            <img src={icon_information} alt="icon" />
                        </div>
                        <div className=" modal_headerStyle__rowA_colRight">
                            <Link to="#" onClick={closeModal}><img src={closeBtn} alt="icon" /></Link>
                        </div>
                    </div>
                    <div className="row modal_headerStyle__rowB lessMargin_bottom">
                        <div className="col modal_headerStyle__rowB_searchInput">
                            <input type="text" placeholder="Search or paste address" onChange={(e) => searchToken(e.target.value)} />
                        </div>
                    </div>
                    <div className="row modal_headerStyle__rowC lessMargin_bottom close-col">
                        <div className=" modal_headerStyle__rowC_colLeft">
                            <h2>Token name</h2>
                        </div>
                        <div className=" modal_headerStyle__rowC_colRight">
                            <button><img height="40" src={sortIcon} onClick={() => handleOrder(tokenList.reverse())} alt="icon" /></button>
                        </div>
                    </div>
                </div>
                <div className="col tokenList__column">
                    <ul className="tokenList">
                        {tokenList && tokenList.map((t, index) =>
                            <li key={index}>
                                {currencyName === t.symbol ?
                                    <div className="dis">
                                        <span ><img src={t.icon} alt="icon" />
                                            <span className="tokenName_textStyle">{t.symbol}</span> </span>
                                        <TokenBalance address={t.address} />
                                    </div> :
                                    <>
                                        <Link to="#" onClick={() => selectCurrency(t, tokenType)}>
                                            <img src={t.icon} alt="icon" />
                                            <span className="tokenName_textStyle">{t.symbol}</span>
                                        </Link>
                                        {(t.isAdd && isAdded) && <span className="tokenName_textStyle add_token" onClick={() => handleTokenList(t)}>Add</span>}
                                        {t.isDel && <span className="tokenName_textStyle add_token" onClick={() => handleRemoveTokenList(t)}>Remove</span>}
                                        <TokenBalance address={t.address} />
                                    </>}
                            </li>
                        )}
                    </ul>
                </div>
            </Card>
        </>
    )

}

export default ModalSelectToken;