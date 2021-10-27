import BNB from "../images/token_icons/BNB.svg";
import ETH from "../images/token_icons/ETH.svg";
import ADA from "../images/token_icons/ADA.svg";
import BTC from "../images/token_icons/BTC.svg";
import CAKE from "../images/token_icons/CAKE.svg";
import POLKADOT from "../images/token_icons/POLKADOT.svg";
import TRON from "../images/token_icons/TRON.svg";
import ANCHOR from "../images/token_icons/ANCHOR.svg";
import BUSD from "../images/token_icons/BUSD.svg";
import HARMONY from "../images/token_icons/HARMONY.svg";
import defaultImg from "../images/token_icons/default.svg";
import USDT from "../images/token_icons/USDT.svg";
import routerABI from "../ABI/router.ABI.json";
import farmABI from "../ABI/farmABI.json";
import factoryABI from "../ABI/factory.ABI.json";
import pairABI from "../ABI/pair.ABI.json";
import referralsABI from "../ABI/referrals.ABI";
import lotteryABI from "../ABI/lottery.ABI.json";
import NFTABI from "../ABI/NFT.ABI.json";
import tokenABI from "../ABI/tokenContract.ABI.json";
import anchorABI from "../ABI/anchor.ABI.json";

export const WETH = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
export const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";
export const ANCHOR_BUSD_LP = "0xC0Ff9f250d2D97F90BC89bD16D3B5344CdC68d06";
export const BNB_BUSD_LP = "0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16";
export const DEFLATIONNARY_TOKENS = ["0x1f546ad641b56b86fd9dceac473d1c7a357276b7", '0x4aac18De824eC1b553dbf342829834E4FF3F7a9F', "0x0ED224e1d088c1BA17BdF352D4FaF0979E7BB0b7"];
export const OVERVIEW_LINK = "https://bscscan.com/token/0x4aac18De824eC1b553dbf342829834E4FF3F7a9F";
export const TOKEN_LINK = "https://bscscan.com/address/0x4aac18De824eC1b553dbf342829834E4FF3F7a9F";
export const BUSD_LP = "https://bscscan.com/address/0xC0Ff9f250d2D97F90BC89bD16D3B5344CdC68d06";
export const BNB_LP = "https://bscscan.com/address/0x942986B6Cbe26a80a5456D5d3Ac75860f0E9546e";
export const AUTOMATIC_LIQUIDITY = "https://docs.anchorswap.finance/tokenomics/#automatic-liquidity";
export const LOTTERY = "https://docs.anchorswap.finance/products/#lottery";
export const ROADMAP = "https://docs.anchorswap.finance/roadmap/#roadmap";
export const AUTOMATIC_BURNING = "https://docs.anchorswap.finance/tokenomics/#automatic-burning";
export const HARVEST_LOCKUP = "https://docs.anchorswap.finance/tokenomics/#harvest-lockup";
export const ANTI_WHALE = "https://docs.anchorswap.finance/tokenomics/#anti-whale";

export const TOKEN_LIST = [
  {
    icon: BNB,
    name: "BNB",
    address: "BNB",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "BNB",
  },
  {
    icon: ANCHOR,
    name: "ANCHOR",
    address: "0x4aac18De824eC1b553dbf342829834E4FF3F7a9F",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "ANCHOR",
  },
  {
    icon: BUSD,
    name: "BUSD",
    address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "BUSD",
  },
  {
    icon: ETH,
    name: "ETH",
    address: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "ETH",
  },
  {
    icon: ADA,
    name: "Cardano",
    address: "0x3ee2200efb3400fabb9aacf31297cbdd1d435d47",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "ADA",
  },
  {
    icon: defaultImg,
    name: "Matic Token",
    address: "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "MATIC",
  },
  {
    icon: defaultImg,
    name: "Dai Token",
    address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "DAI",
  },
  {
    icon: BTC,
    name: "BTCB Token",
    address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "BTCB",
  },
  {
    icon: USDT,
    name: "Tether USD",
    address: "0x55d398326f99059fF775485246999027B3197955",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "USDT",
  },
  {
    icon: POLKADOT,
    name: "Polkadot Token",
    address: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "DOT",
  },
  {
    icon: TRON,
    name: "TRON",
    address: "0x85EAC5Ac2F758618dFa09bDbe0cf174e7d574D5B",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "TRX",
  },
  {
    icon: CAKE,
    name: "PancakeSwap Token",
    address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "Cake",
  },
  {
    icon: BNB,
    name: "Wrapped BNB",
    address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    isAdd: false,
    isDel: false,
    decimals: 18,
    symbol: "WBNB",
  }
];

export const MAIN_CONTRACT_LIST = {
  lottary: {
    address: "0x046d6858b886008807c629CF8f21E3d53a72EeBE",
    blockNumber: 10161850,
    abi: lotteryABI,
  },
  NFT: {
    address: "0x223B44b2305A0D8dd71Ee6620b88fa5f9BC89555",
    blockNumber: 10161804,
    abi: NFTABI,
  },
  farm: {
    address: "0x23f7F3119d1b5b6c94a232680e2925703C4ebbF5",
    blockNumber: 10004492,
    abi: farmABI,
  },
  pool: {
    address: "",
    abi: "",
    blockNumber: 0,
  },
  router: {
    address: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    blockNumber: 6810080,
    abi: routerABI,
  },
  factory: {
    address: "0xca143ce32fe78f1f7019d7d551a6402fc5350c73",
    blockNumber: 6809737,
    abi: factoryABI,
  },
  pair: {
    address: "",
    blockNumber: 0,
    abi: pairABI,
  },
  referrals: {
    address: "0x42da818171a8b58A98771F4b99Ea0175f9f7BFc7",
    blockNumber: 10004593,
    abi: referralsABI,
  },
  anchor: {
    address: "0x4aac18De824eC1b553dbf342829834E4FF3F7a9F",
    blockNumber: 10004070,
    abi: tokenABI,
  },
  anchorNew: {
    address: "0x263c5C33e4C780B3e67BA1C4115027d47B3Bb84b",
    blockNumber: 10350461,
    abi: anchorABI,
  }
};
