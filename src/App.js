import React, { useCallback, useEffect, useReducer } from 'react';
import { reducer } from './redux_hooks/redux';
import { defaultState } from './redux_hooks/state';
import * as ACTIONS from './redux_hooks/constants';
import getWeb3 from './utils/getWeb3';

import Instagram from '../src/build/abi/Instagram.json';
import MainMenu from './components/Menu';
import Posts from './components/Posts';
import AddPost from './components/AddPost';

import {
  Container,
  Divider,
  Dimmer,
  Loader,
  Message,
  Grid,
  GridRow,
  GridColumn,
  Segment,
  Modal,
  Button,
} from 'semantic-ui-react';

const App = () => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const { errors, loading, open, size } = state;
  const { SET_WEB3, SET_ERROR, TOGGLE_MODAL } = ACTIONS;

  const loadWeb3 = useCallback(async () => {
    try {
      const web3 = await getWeb3();
      if (web3) {
        const getAccounts = await web3.eth.getAccounts();
        // get networks id of deployed contract
        const getNetworkId = await web3.eth.net.getId();
        // get contract data on this network
        const newData = await Instagram.networks[getNetworkId];
        // check contract deployed networks
        if (newData) {
          // get contract deployed address
          const contractAddress = newData.address;
          // create a new instance of the contract - on that specific address
          const contractData = await new web3.eth.Contract(
            Instagram.abi,
            contractAddress
          );

          dispatch({
            type: SET_WEB3,
            value: {
              web3: web3,
              contract: contractData,
              account: getAccounts,
              loading: false,
            },
          });
        } else {
          alert('Smart contract not deployed to selected network');
        }
      }
    } catch (error) {
      dispatch({ type: SET_ERROR, value: error });
    }
  }, [SET_WEB3, SET_ERROR]);

  useEffect(() => {
    loadWeb3();
  }, [loadWeb3]);

  return (
    <div className='App'>
      <MainMenu state={state} dispatch={dispatch} />
      <Divider horizontal>§</Divider>
      {loading && (
        <Container>
          <Grid columns={1}>
            <GridRow>
              <GridColumn>
                <Segment style={{ height: 150 }}>
                  <Dimmer active>
                    <Loader size='medium'>Loading</Loader>
                  </Dimmer>
                </Segment>
              </GridColumn>
            </GridRow>
          </Grid>
        </Container>
      )}
      {!loading && (
        <>
          <Container>
            <Segment>
              Instagram Feed
              <Divider />
              <Posts state={state} dispatch={dispatch} />
            </Segment>
          </Container>
          <Container>
            <Modal
              size={size}
              open={open}
              onClose={() => dispatch({ type: TOGGLE_MODAL })}
            >
              <Modal.Header>Add New Instagram</Modal.Header>
              <Modal.Content>
                <Segment>
                  Add New Post
                  <Divider />
                  <AddPost state={state} dispatch={dispatch} />
                </Segment>
              </Modal.Content>
              <Modal.Actions>
                <Button
                  negative
                  onClick={() => dispatch({ type: TOGGLE_MODAL })}
                >
                  Close
                </Button>
              </Modal.Actions>
            </Modal>
          </Container>
        </>
      )}
      <Divider horizontal>§</Divider>
      <Container>
        {errors && (
          <Message negative>
            <Message.Header>Code: {errors?.code}</Message.Header>
            <p style={{ wordWrap: 'break-word' }}>{errors?.message}</p>
          </Message>
        )}
      </Container>
    </div>
  );
};

export default App;
