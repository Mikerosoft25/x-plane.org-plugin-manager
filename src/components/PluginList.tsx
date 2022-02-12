import { FunctionComponent } from 'react';
import { PluginListItem } from './PluginListItem';
import { Plugin, PluginType } from '../common/types';

interface PluginListProps {
  shownPluginType: PluginType,
  plugins: Plugin[],
  pluginFilter: string,
  currentTabURL: string,
  showPluginOverlay: (plugin: Plugin) => void,
  openPluginURL: (url: string) => void,
  updatePluginVersion: (plugin: Plugin) => void,
}

export const PluginList: FunctionComponent<PluginListProps> = ({ shownPluginType, plugins, pluginFilter, currentTabURL, showPluginOverlay, openPluginURL, updatePluginVersion }) => {

  const shownPlugins: JSX.Element[] = plugins.filter((plugin: Plugin) => {
    return plugin.type === shownPluginType;
  }).filter((plugin: Plugin) => {
    return plugin.name.toLowerCase().includes(pluginFilter.toLowerCase());
  }).map((plugin: Plugin) => {
    return (
      <PluginListItem
        key={plugin.url}
        plugin={plugin}
        currentTabURL={currentTabURL}
        showPluginOverlay={showPluginOverlay}
        openPluginURL={openPluginURL}
        updatePluginVersion={updatePluginVersion}
      />);
  });

  return (
    <div className='pluginList'>
      {shownPlugins}
    </div>
  );
};
