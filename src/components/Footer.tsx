import { FunctionComponent } from 'react';
import { PluginType } from '../common/types';

interface FooterProps {
  shownPluginType: PluginType,
  changePluginType: (pluginType: PluginType) => void,
}

export const Footer: FunctionComponent<FooterProps> = ({ shownPluginType, changePluginType }) => {
  return (
    <footer>
      <button
        className={shownPluginType === PluginType.Forums ? 'underline' : ''}
        onClick={() => changePluginType(PluginType.Forums)}
      >X-Plane-Forum Plugins</button>
      <button
        className={shownPluginType === PluginType.Custom ? 'underline' : ''}
        onClick={() => changePluginType(PluginType.Custom)}
      >Custom Plugins</button>
    </footer>
  );
};
