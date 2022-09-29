import { Button, Container, Form } from 'semantic-ui-react';
import * as ACTIONS from '../redux_hooks/constants';
import { create } from 'ipfs-http-client';

const AddPost = ({ state, dispatch }) => {
  const { contract, web3, account, formLoading, description, bufferFile } =
    state;
  const {
    SET_DESCRIPTION,
    SET_FORM_LOADING,
    SET_ERROR,
    SET_IPFS_BUFFER,
    RESET_FORM,
    SUBMIT,
  } = ACTIONS;

  const INFURA_ID = process.env.REACT_APP_INFURA_ID;
  const INFURA_SECRET_KEY = process.env.REACT_APP_INFURA_SECRET_KEY;
  const auth =
    'Basic ' +
    Buffer.from(INFURA_ID + ':' + INFURA_SECRET_KEY).toString('base64');

  const ipfs = create({
    host: 'ipfs.infura.io',
    port: '5001',
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });

  const handleIPFSData = async (data) => {
    try {
      // store hash and description on blockchain
      await contract.methods
        .uploadImage(data.path, description)
        .send({ from: account, value: web3.utils.toWei('0', 'ether') });
      dispatch({ type: RESET_FORM });
    } catch (error) {
      dispatch({ type: SET_ERROR, value: error });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: SET_FORM_LOADING });
    try {
      const getIPFSHash = await ipfs.add(bufferFile);
      if (getIPFSHash) handleIPFSData(getIPFSHash);
      dispatch({ type: SUBMIT });
    } catch (error) {
      dispatch({ type: SET_ERROR, value: error });
    }
  };

  const handleDescription = (e) => {
    dispatch({ type: SET_DESCRIPTION, value: e.target.value });
  };

  const handleUpload = async (e) => {
    dispatch({ type: SET_FORM_LOADING });
    try {
      const fileUpload = e.target.files[0];
      const reader = new FileReader();
      // create the array buffer for IPFS
      reader.readAsArrayBuffer(fileUpload);
      // success
      reader.onloadend = () =>
        dispatch({
          type: SET_IPFS_BUFFER,
          value: { bufferFile: Buffer(reader.result), formLoading: false },
        });
      // error
      reader.onerror = () =>
        dispatch({
          type: SET_ERROR,
          value: reader.error,
        });
    } catch (error) {
      dispatch({ type: SET_ERROR, value: error });
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit} loading={formLoading}>
        <Form.Input
          label='Image Description'
          placeholder='description...'
          name='description'
          type='text'
          value={description}
          onChange={handleDescription}
          required
        />
        <Form.Input
          label='Upload Image'
          type='file'
          onChange={handleUpload}
          accept='.jpg, .jpeg, .png, .bmp, .gif'
          required
        />
        <Button color='purple' type='submit'>
          Submit
        </Button>
      </Form>
    </Container>
  );
};

export default AddPost;
