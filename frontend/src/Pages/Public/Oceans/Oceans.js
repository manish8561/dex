import React from 'react'
import './Oceans.scss'
import ethOcean from "../../../assets/images/eth-ocean.jpg"
import harmony from "../../../assets/images/harmony-ocean.png"
import polkadot from "../../../assets/images/polkadot.png"
import ethIcon from "../../../assets/images/eth_icon.png"
import harmonyIcon from "../../../assets/images/harmony-icon.png"
import polkadotIcon from "../../../assets/images/polkadot-icon.png"
import OceanBox from './OceanBox'

function Oceans() {
    return (
        <div className="container_wrap container_Oceans">
            <div className="container">
                <h2>Oceans</h2>
                <h5>Multichain earning when you want, where you want and how you want.</h5>
                <div className="oceanInfoOut">
                    <div className="row">
                        <div className="col">
                            <OceanBox mainimg={ethOcean} curIcon={ethIcon} title="Ethereum" content="Trade, farm, stake and earn on the ERC20 Blockchain easier than ever before." />        
                        </div>
                        <div className="col">
                            <OceanBox mainimg={harmony} curIcon={harmonyIcon} title="Harmony" content="Scaling DeFi and NFT applications across Ethereum and  other chains, nearly zero transaction fee and less than 2 seconds transaction time."/>    
                        </div>
                        <div className="col">
                            <OceanBox mainimg={polkadot} curIcon={polkadotIcon} title="Polkadot" content="Use blockchain developed rights, a scalable network, the flexible updating of blockchain-enabled functions, staking and bonding."/>  
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Oceans
