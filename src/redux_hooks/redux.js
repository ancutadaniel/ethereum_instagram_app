import * as ACTIONS from './constants';

const {
  SET_WEB3,
  SET_ERROR,
  SET_DESCRIPTION,
  SET_LOADING,
  SET_FORM_LOADING,
  SET_IPFS_BUFFER,
  RESET_FORM,
  SET_INSTAGRAM,
  TOGGLE_MODAL,
  SET_MENU_ACTIVE_ITEM,
  ADD_NEW_POST,
  SUBMIT,
} = ACTIONS;

export const reducer = (state, action) => {
  // console.log('type: ', action.type, ' <===> value:', action.value);
  switch (action.type) {
    case SET_WEB3:
      const { web3, contract, account, loading } = action.value;
      return {
        ...state,
        contract,
        web3,
        account: account[0],
        loading,
      };

    case SET_DESCRIPTION:
      return {
        ...state,
        description: action.value,
      };

    case SET_IPFS_BUFFER: {
      const { bufferFile, formLoading } = action.value;
      return {
        ...state,
        bufferFile,
        formLoading,
      };
    }

    case SET_INSTAGRAM:
      return {
        ...state,
        instagram: action.value,
        loading: false,
        loadInstagram: false,
      };

    case SUBMIT:
      return {
        ...state,
        loading: false,
        loadInstagram: true,
      };
    case RESET_FORM:
      return {
        ...state,
        description: '',
        bufferFile: null,
        formLoading: false,
        loadInstagram: true,
        open: false,
      };

    case SET_MENU_ACTIVE_ITEM:
      const menuItem = action.value;
      let showModal = false;
      if (menuItem === ADD_NEW_POST) showModal = true;

      return {
        ...state,
        open: showModal,
        activeItem: menuItem,
      };

    case TOGGLE_MODAL:
      return {
        ...state,
        open: !state.open,
      };

    case SET_FORM_LOADING: {
      return {
        ...state,
        formLoading: !state.formLoading,
      };
    }
    case SET_LOADING: {
      return {
        ...state,
        loading: !state.loading,
      };
    }

    case SET_ERROR:
      return {
        ...state,
        errors: action.value,
        formLoading: false,
      };

    default:
      return {
        ...state,
      };
  }
};
