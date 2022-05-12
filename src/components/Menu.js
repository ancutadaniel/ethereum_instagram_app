import { SET_MENU_ACTIVE_ITEM } from '../redux_hooks/constants';

import { Menu, Icon } from 'semantic-ui-react';
import './Menu.css';

const MainMenu = ({ state, dispatch }) => {
  const handleItemClick = (e, { name }) => {
    dispatch({ type: SET_MENU_ACTIVE_ITEM, value: name });
  };
  return (
    <Menu id='main_menu'>
      <Menu.Item
        name='Home'
        active={state.activeItem === 'Home'}
        onClick={handleItemClick}
      />
      <Menu.Item
        name='Add New Post'
        active={state.activeItem === 'Add New Post'}
        onClick={handleItemClick}
      />
      <p className='account'>
        <Icon name='user' />
        {state.account}
      </p>
    </Menu>
  );
};

export default MainMenu;
