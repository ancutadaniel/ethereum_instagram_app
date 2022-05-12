import { Button, Card, Image } from 'semantic-ui-react';
import Identicon from 'identicon.js';

import './Post.css';
import * as ACTIONS from '../redux_hooks/constants';
import { useCallback, useEffect } from 'react';

const Posts = ({ state, dispatch }) => {
  const { contract, web3, account, instagram, loadInstagram } = state;
  const { SET_ERROR, SET_INSTAGRAM, URL } = ACTIONS;

  const options = {
    foreground: [0, 0, 0, 255], // rgba black
    background: [181, 204, 24, 100], // rgba white
    margin: 0.2, // 20% margin
    size: 420, // 420px square
    format: 'svg', // format
  };

  const handleTip = async (id) => {
    try {
      const tip = web3.utils.toWei('0.1', 'ether');
      await contract.methods.tipImage(id).send({
        from: account,
        value: tip,
      });
      getInstagram();
    } catch (error) {
      dispatch({ type: SET_ERROR, value: error });
    }
  };

  const getInstagram = useCallback(async () => {
    try {
      const getImageCount = await contract.methods.imageCount().call();
      let instagramArr = [];
      for (let i = getImageCount; i >= 1; i--) {
        const image = await contract.methods.images(i).call();
        const { author, description, hash, id, tipAmount } = image;
        instagramArr.push({
          author,
          description,
          hash,
          id,
          tipAmount,
        });
      }
      dispatch({ type: SET_INSTAGRAM, value: instagramArr });
    } catch (error) {
      dispatch({ type: SET_ERROR, value: error });
    }
  }, [SET_ERROR, SET_INSTAGRAM, contract.methods, dispatch]);

  useEffect(() => {
    loadInstagram && getInstagram();
  }, [loadInstagram, getInstagram]);

  return (
    <Card.Group>
      {instagram
        .sort((a, b) => (a.tipAmount < b.tipAmount ? 1 : -1))
        .map((item) => {
          const { author, description, hash, id, tipAmount } = item;
          return (
            <Card key={id}>
              <Card.Content>
                <Image
                  floated='right'
                  size='mini'
                  src={`data:image/svg+xml;base64,${new Identicon(
                    author,
                    options
                  ).toString()}`}
                />
                {hash && <Image src={`${URL}${hash}`} size='medium' centered />}
                <Card.Header className='header_post'>{author}</Card.Header>
                <Card.Meta>Author address</Card.Meta>
                <Card.Description>{description}</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <div className='content_extra'>
                  <p>TIPS: {web3.utils.fromWei(tipAmount)} ETH</p>
                  <Button basic color='green' onClick={() => handleTip(id)}>
                    Tip Post 0.1 ETH
                  </Button>
                </div>
              </Card.Content>
            </Card>
          );
        })}
    </Card.Group>
  );
};

export default Posts;
