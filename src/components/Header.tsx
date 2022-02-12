import { FunctionComponent } from 'react';
import refreshIcon from '../assets/refresh_icon.svg';
import plusIcon from '../assets/plus_icon.svg';
import searchIcon from '../assets/search_icon.svg';

interface HeaderProps {
  addPlugin: () => void,
  refreshPlugins: () => void,
  searchPlugins: (filter: string) => void,
}

export const Header: FunctionComponent<HeaderProps> = ({addPlugin, refreshPlugins, searchPlugins}) => {
  return (
    <header>
      <div className='inputWrapper'>
        <div className='searchIconWrapper'>
          <img src={searchIcon}></img>
        </div>
        <input placeholder='Search plugins...'
          onChange={evt => searchPlugins(evt.target.value)}
        />
      </div>
      <button onClick={refreshPlugins} >
        <img src={refreshIcon} />
      </button>
      <button onClick={addPlugin} >
        <img src={plusIcon} />
      </button>
    </header>
  );
};