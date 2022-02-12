import { FunctionComponent } from 'react';
import { Plugin, PluginType } from '../common/types';
import exclamationMarkIcon from '../assets/exclamation_mark_icon.svg';
import checkmarkIcon from '../assets/checkmark_icon.svg';
import updateVersionIcon from '../assets/update_version_icon.svg';
import infoIcon from '../assets/info_icon.svg';
import openLinkIcon from '../assets/open_link_icon.svg';

interface PluginListItemProps {
  plugin: Plugin,
  currentTabURL: string,
  showPluginOverlay: (plugin: Plugin) => void,
  openPluginURL: (url: string) => void,
  updatePluginVersion: (plugin: Plugin) => void,
}

export const PluginListItem: FunctionComponent<PluginListItemProps> = ({ plugin, currentTabURL, showPluginOverlay, openPluginURL, updatePluginVersion }) => {

  let status: JSX.Element;
  if (plugin.type === PluginType.Custom) {
    status = <img src={updateVersionIcon} title='Set the "last manual check date" to today' className="clickable" onClick={() => updatePluginVersion(plugin)}></img>
  } else if (!plugin.latestVersion) {
    status = <div className='loader' title='Fetching Plugin Data'></div>;
  } else if (plugin.installedVersion === plugin.latestVersion) {
    status = <img src={checkmarkIcon}  title='Installed version is up to date'></img>
  } else if (currentTabURL === plugin.url && plugin.installedVersion != plugin.latestVersion) {
    status = <img src={updateVersionIcon} title='Set the installed version to the latest version' className="clickable" onClick={() => updatePluginVersion(plugin)}></img>
  } else {
    status = <img src={exclamationMarkIcon} title='Newer version is available'></img>
  }


  let lastManualCheck: string | undefined;
  if (plugin.lastCheckDateUnix) {
    lastManualCheck = new Date(plugin.lastCheckDateUnix).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <div className='pluginWrapper'>
      <div className='nameWrapper' title={plugin.name}>
        {plugin.name}
      </div>
      <div className='infoButtonWrapper'>
        <img
          onClick={() => showPluginOverlay(plugin)}
          src={infoIcon}
          title="Show Plugin Info"
        />
      </div>
      <div className='openButtonWrapper'>
        <img
          src={openLinkIcon}
          onClick={() => openPluginURL(plugin.url)}
          title="Open Plugin Webpage"
        />
      </div>
      <div className='installedVersion' title={`Installed Version: ${plugin.installedVersion}`}>
        {plugin.installedVersion}
      </div>
      <div
        className='latestVersion'
        title={plugin.type === PluginType.Forums ?
          `Latest Version: ${plugin.latestVersion}` :
          `Last manual check: ${lastManualCheck}`
        }
      >
        {plugin.type === PluginType.Forums ?
          plugin.latestVersion :
          lastManualCheck
        }
      </div>
      <div className='statusWrapper'>
        {status}
      </div>
    </div>
  );
};