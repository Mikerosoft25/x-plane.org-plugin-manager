import { FunctionComponent, useEffect, useState } from "react";
import { OverlayMode, Plugin, PluginType } from "../common/types";

interface PluginOverlayProps {
  show: boolean,
  mode: OverlayMode,
  overlayPlugin: Plugin | null,
  saveNewPlugin: (plugin: Plugin) => void,
  editExistingPlugin: (plugin: Plugin) => void,
  deletePlugin: (plugin: Plugin) => void,
  closeOverlay: () => void,
  showSnackbar: (text: string) => void,
}

export const PluginOverlay: FunctionComponent<PluginOverlayProps> = ({ mode, show, overlayPlugin, saveNewPlugin, editExistingPlugin, deletePlugin, closeOverlay, showSnackbar }) => {

  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [tempPlugin, setTempPlugin] = useState<Plugin | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>(mode);
  const [visible, setVisible] = useState<boolean>(false);
  const [redNameInput, setRedNameInput] = useState<boolean>(false);
  const [redInstalledVersionInput, setRedInstalledVersionInput] = useState<boolean>(false);

  useEffect(() => {
    if (overlayPlugin) {
      setPlugin({
        ...overlayPlugin,
      });
    }
    setOverlayMode(mode);
  }, [overlayPlugin, mode]);

  const enableEditMode = () => {
    setTempPlugin(plugin);
    setOverlayMode(OverlayMode.Edit);
  };

  const cancelEditMode = () => {
    if (tempPlugin) {
      setPlugin(tempPlugin);
    }
    setTempPlugin(null);
    setOverlayMode(OverlayMode.View);
  }

  const editPluginInfo = () => {
    if (plugin && plugin.name != '' && plugin.installedVersion != '') {
      setTempPlugin(null);
      setOverlayMode(OverlayMode.View);
      editExistingPlugin(plugin);
      setRedNameInput(false);
      setRedInstalledVersionInput(false);
    } else {
      setRedNameInput(plugin?.name === '');
      setRedInstalledVersionInput(plugin?.installedVersion === '');
      showSnackbar("Please fill in all needed information");
    }
  }

  const savePlugin = () => {
    if (plugin && plugin.name != '' && plugin.installedVersion != '') {
      saveNewPlugin(plugin);
      closeCurrentOverlay();
    } else {
      setRedNameInput(plugin?.name === '');
      setRedInstalledVersionInput(plugin?.installedVersion === '');
      showSnackbar("Please fill in all needed information");
    }
  }

  const deleteCurrentPlugin = () => {
    if (plugin) {
      deletePlugin(plugin);
      closeCurrentOverlay();
    }
  }

  const closeCurrentOverlay = () => {
    setRedNameInput(false);
    setRedInstalledVersionInput(false);
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
    }, 1200);
    closeOverlay();
  }

  let headerText: JSX.Element;
  let topLeftButton: JSX.Element;
  let topRightButton: JSX.Element;
  if (overlayMode === OverlayMode.Add) {
    headerText = <div>Add new Plugin</div>
    topLeftButton = <button onClick={() => closeCurrentOverlay()}>Cancel</button>
    topRightButton = <button onClick={() => savePlugin()}>Save</button>
  } else if (overlayMode === OverlayMode.Edit) {
    headerText = <div>Edit Plugin-Info</div>
    topLeftButton = <button onClick={() => cancelEditMode()}>Cancel</button>
    topRightButton = <button onClick={() => editPluginInfo()}>Save</button>
  } else {
    headerText = <div>Edit Plugin-Info</div>
    topLeftButton = <button onClick={() => closeCurrentOverlay()}>Close</button>
    topRightButton = <button onClick={() => enableEditMode()}>Edit</button>
  }

  let header: JSX.Element =
    <div className="overlayHeader">
      {topLeftButton}
      {headerText}
      {topRightButton}
    </div>;

  let body: JSX.Element;
  if (plugin) {
    body =
      <div className="overlayBody">
        Url
        <input
          value={plugin.url}
          disabled
        />

        Name
        <input
          className={redNameInput ? 'redUnderline' : ''}
          value={plugin.name}
          onChange={e => setPlugin({ ...plugin, name: e.target.value })}
          disabled={overlayMode === OverlayMode.View ? true : false}
        />

        Installed Version
        <input
          className={redInstalledVersionInput ? 'redUnderline' : ''}
          value={plugin.installedVersion}
          onChange={e => setPlugin({ ...plugin, installedVersion: e.target.value })}
          disabled={overlayMode === OverlayMode.View ? true : false}
        />

        {plugin.type === PluginType.Forums ? 'Latest Version' : 'Last manual check'}
        <input
          value={plugin.type === PluginType.Forums ?
            plugin.latestVersion :
            (plugin.lastCheckDateUnix ? new Date(plugin.lastCheckDateUnix).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : '')
          }
          disabled
        />

        Addition Date
        <input
          value={new Date(plugin.dateAddedUnix).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
          disabled
        />

        Notes
        <textarea
          value={plugin.notes}
          onChange={e => setPlugin({ ...plugin, notes: e.target.value })}
          readOnly={overlayMode === OverlayMode.View ? true : false}
        >
          {plugin.notes}
        </textarea>

        <button
          className={`deleteButton ${overlayMode === OverlayMode.View ? 'show' : ''}`}
          onClick={() => deleteCurrentPlugin()}
        >Delete</button>
      </div>;
  } else {
    body =
      <div className="overlayLoaderWrapper">
        <div className='overlayLoader'></div>
      </div>;
  }

  return (
    <div className={`pluginOverlayWrapper ${show ? 'show' : ''} ${visible ? 'visible' : ''}`}>
      {header}
      {body}
    </div>
  );
}