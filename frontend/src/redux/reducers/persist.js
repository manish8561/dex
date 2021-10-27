import { TOKEN_LIST } from "../../assets/tokens";
import { actionTypes } from "../actions/PersistActions";

const initialState = {
  walletType: "Metamask",
  isUserConnected: "",
  tokenList: TOKEN_LIST,
  slippagePercentage: 1,
  deadline: 20,
  userInfo: "",
  loggedIn: false,
  userLpTokens: [],
  recentTransactions: [],
  referralAddress: "",
  updateUserLpTokens:false
};

const persist = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.USER_CONNECTED:
      return {
        ...state,
        isUserConnected: action.payload.account,
        walletType: action.payload.walletType,
      };
    case actionTypes.TOKEN_LIST_ADD:
      initialState.tokenList.push(action.payload);
      return {
        ...state,
        tokenList: initialState.tokenList,
      };
    case actionTypes.TOKEN_LIST_DEL:
      initialState.tokenList.splice(
        initialState.tokenList.findIndex(
          (a) =>
            a.address.toLowerCase() === action.payload.address.toLowerCase()
        ),
        1
      );
      return {
        ...state,
        tokenList: initialState.tokenList,
      };
    case actionTypes.SAVE_SLIPPAGE_PERCENTAGE:
      return {
        ...state,
        slippagePercentage: action.payload,
      };
    case actionTypes.SAVE_DEADLINE:
      return {
        ...state,
        deadline: action.payload,
      };
    case actionTypes.LOGIN_USER_SUCCESS:
      return {
        ...state,
        userInfo: action.payload,
        loggedIn: true,
      };
    case actionTypes.SAVE_USER_LP_TOKENS:
      return {
        ...state,
        userLpTokens: action.payload,
      };
    case actionTypes.SAVE_USER_RECENT_TRANSACTIONS:
      return {
        ...state,
        recentTransactions: action.payload.recentTransactions,
      };
    case actionTypes.LOGOUT:
      return initialState;
    case actionTypes.SAVE_REFFRAL_ADDRESS:
      return {
        ...state,
        referralAddress: action.payload,
      };
    case actionTypes.CHECK_USER_LPTOKENS:
      return {
        ...state,
        updateUserLpTokens:action.payload
      };
    default:
      return state;
  }
};

export default persist;
