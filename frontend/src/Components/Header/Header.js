import React, { useEffect, useState } from "react"
import { withRouter } from "react-router"
import { useDispatch, useSelector } from "react-redux"
import './Header.scss'
import { Link } from 'react-router-dom'
import menuIcon from '../../assets/images/menu_toggle_icon.svg'
import Iconfeathermenu from '../../assets/images/Icon-feather-menu.svg'
import { login, logout, versionManager } from "../../redux/actions"
import { ContractServices } from "../../services/ContractServices"
import ProfileModal from '../ProfileModal/ProfileModal'
import { toast } from "../Toast/Toast"
import WalletList from "./WalletList"
import { HOME_ROUTE } from "../../constant"

const Header = (props) => {
    const dispatch = useDispatch();
    const [isOpen, setModal] = useState(false)
    const [walletShow, setWalletShow] = useState(false);

    const isUserConnected = useSelector(state => state.persist.isUserConnected);
    const walletType = useSelector(state => state.persist.walletType);

    useEffect(() => {
        const init = async () => {
            await dispatch(versionManager());
            if (walletType) {
                await ContractServices.setWalletType(walletType);
            } else {
                dispatch(logout());
            }
        };
        init();
        addListeners();
    }, []);
    const addListeners = async () => {
        let address;
        if (walletType === 'Metamask') {
            address = await ContractServices.isMetamaskInstalled('');
        }
        if (walletType === 'BinanceChain') {
            address = await ContractServices.isBinanceChainInstalled();
        }

        ContractServices.walletWindowListener();
        if (address) {
            window.ethereum.on('accountsChanged', function (accounts) {
                const account = accounts[0];
                dispatch(login({ account, walletType }));
                window.location.reload();
            });
        }
    };
    const loginCall = async (walletType) => {
        try {
            if (walletType === 'BinanceChain') {
                const account = await ContractServices.isBinanceChainInstalled();
                if (account) {
                    dispatch(login({ account, walletType }));
                    setWalletShow(false);
                }
            } else {
                const account = await ContractServices.isMetamaskInstalled('');
                if (account) {
                    dispatch(login({ account, walletType }));
                    setWalletShow(false);
                }
            }
        } catch (err) {
            toast.error(err.message);
        }
    }
    const logoutCall = () => {
        dispatch(logout());
        setModal(false);
    }
    const connectCall = () => {
        isUserConnected ? setModal(!isOpen) : setWalletShow(true);
    }

    return (
        <div className={`header_style ${props.className}`}>
            <div className="header_left_style">
                <div className="for_desktop">
                    <Link to="#" onClick={props.small_nav}>
                        {
                            props.mobileIcon ?
                                <img src={Iconfeathermenu} alt="" />
                                :
                                <img src={menuIcon} alt="icon" />
                        }
                    </Link>
                </div>
                <div className="for_mobile">
                    <Link to="#" onClick={props.small_nav}>
                        {
                            props.mobileIcon ?
                                <img src={menuIcon} alt="icon" />
                                :
                                <img src={Iconfeathermenu} alt="" />
                        }
                    </Link>
                </div>
                <Link to={`${HOME_ROUTE}home`} className="header_logo"></Link>
            </div>
            <div className="header_right_style">
                <Link to="#" className="btn connect__Link" onClick={() => connectCall()}>{isUserConnected ? `${isUserConnected.substring(1, 6)}...${isUserConnected.substr(isUserConnected.length - 4)}` : 'Connect'}</Link>
            </div>
            {isOpen && <ProfileModal closeModal={() => setModal(!isOpen)} address={isUserConnected} logout={logoutCall} />}
            {walletShow &&
                <WalletList isWalletShow={setWalletShow} />
            }

        </div>
    )
}



export default withRouter(Header);