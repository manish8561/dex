import React from "react"
import './ProfileModal.scss'
import {Link} from 'react-router-dom'
import Card from '../Card/Card'
import closeBtn from '../../assets/images/ionic-md-close.svg'
import copyIcon from "../../assets/images/icon_copyAddress.png"
import {toast} from "../../Components/Toast/Toast"
import {BSC_SCAN} from "../../constant"
import {CopyToClipboard} from 'react-copy-to-clipboard'

const ProfileModal = props => {
    return (
        <>
            <div className="backdrop"></div>
            <Card className="profile_modal">
                <div className="col modal_headerStyle">
                    <div className="row modal_headerStyle__rowA lessMargin_bottom close-col">
                        <div className="  modal_headerStyle__rowA_colLeft">
                            <h2>Your wallet</h2>
                        </div>
                        <div className=" modal_headerStyle__rowA_colRight">
                            <Link to="#" onClick={props.closeModal}><img src={closeBtn} alt="icon" /></Link>
                        </div>
                    </div>
                </div>
                <div className="row modal_headerStyle__rowB lessMargin_bottom ">
                    <div className="col modal_headerStyle__rowB_searchInput wallet-form">
                        <input type="text" value={props.address} readOnly />
                    </div>
                </div>
                <div className="settingModalBody">
                    <div className=" modal_headerStyle__rowC lessMargin_bottom scan-col">
                        <div className=" ">
                            <a href={`${BSC_SCAN}address/${props.address}`} target="_blank" rel="noreferrer">View on BscScan
                                <svg viewBox="0 0 24 24" color="primary" width="20px" xmlns="http://www.w3.org/2000/svg" className="sc-bdfBwQ glXgPM"><path d="M18 19H6C5.45 19 5 18.55 5 18V6C5 5.45 5.45 5 6 5H11C11.55 5 12 4.55 12 4C12 3.45 11.55 3 11 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V13C21 12.45 20.55 12 20 12C19.45 12 19 12.45 19 13V18C19 18.55 18.55 19 18 19ZM14 4C14 4.55 14.45 5 15 5H17.59L8.46 14.13C8.07 14.52 8.07 15.15 8.46 15.54C8.85 15.93 9.48 15.93 9.87 15.54L19 6.41V9C19 9.55 19.45 10 20 10C20.55 10 21 9.55 21 9V4C21 3.45 20.55 3 20 3H15C14.45 3 14 3.45 14 4Z"></path></svg>
                            </a>
                        </div>
                        <div className=" ">
                            <div className="linkBlock">
                                <span>Copy</span>&nbsp;
                                <CopyToClipboard text={`${BSC_SCAN}address/${props.address}`} onCopy={() => toast.success('Copied!')}>
                                    <img className="copy-icon" src={copyIcon} alt="copy" />
                                </CopyToClipboard>
                            </div>
                        </div>

                    </div>
                    <div className="col modal_headerStyle__rowC_colRight logout-btn">
                        <button onClick={props.logout}>Logout</button>
                    </div>
                </div>
            </Card>
        </>
    )

}

export default ProfileModal