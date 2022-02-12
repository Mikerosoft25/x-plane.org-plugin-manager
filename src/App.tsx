import { useEffect, useState } from 'react';
import { Plugin, PluginType, OverlayMode } from './common/types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PluginList } from './components/PluginList';
import { PluginOverlay } from './components/PluginOverlay';
import { Snackbar } from './components/Snackbar';
import { StorageService } from './services/StorageService';
import { HTTPService } from './services/HTTPService';
import browser from "webextension-polyfill";

const App = () => {

  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [shownPluginType, setShownPluginType] = useState<PluginType>(PluginType.Forums);
  const [pluginFilter, setPluginFilter] = useState<string>('');
  const [displayOverlay, setDisplayOverlay] = useState<boolean>(false);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>(OverlayMode.Add);
  const [overlayPlugin, setOverlayPlugin] = useState<Plugin | null>(null);
  const [snackbarText, setSnackbarText] = useState<string>('');
  const [displaySnackbar, setDisplaySnackbar] = useState<boolean>(false);
  const [currentTabURL, setCurrentTabURL] = useState<string>('');

  useEffect(() => {
    StorageService.loadPlugins().then((plugins: Plugin[]) => {
      setPlugins(plugins);
      loadLatestPluginVersions(plugins);
      browser.tabs.query({ currentWindow: true, active: true }).then((tabs: any) => {
        setCurrentTabURL(tabs[0].url);
      });
    });
  }, []);

  const loadLatestPluginVersions = (plugins: Plugin[]) => {
    plugins.forEach((plugin, index) => {
      if (plugin.type == PluginType.Forums) {
        let pluginsCopy = plugins.slice();
        HTTPService.loadLatestPluginVersion(plugin).then((latestVersion) => {
          pluginsCopy[index].latestVersion = latestVersion;
          setPlugins(pluginsCopy);
        });
      }
    });
  }

  const changePluginType = (pluginType: PluginType) => {
    setShownPluginType(pluginType);
  }

  const refreshPlugins = () => {
    const pluginCopy: Plugin[] = plugins.slice();
    pluginCopy.forEach(plugin => plugin.latestVersion = undefined);
    setPlugins(pluginCopy);
    loadLatestPluginVersions(pluginCopy);
  }

  const searchPlugins = (pluginFilter: string) => {
    setPluginFilter(pluginFilter);
  }

  const addPlugin = () => {

    if (plugins.some((plugin: Plugin) => plugin.url === currentTabURL)) {
      showSnackbar("This Plugin is already in your list");
    } else {
      setOverlayMode(OverlayMode.Add);
      setDisplayOverlay(true);
      HTTPService.loadPluginInfo(currentTabURL).then((plugin) => {
        setOverlayPlugin(plugin);
      });
    }
  }

  const openPluginURL = (url: string) => {
    browser.tabs.create({ url: url }).then((tab: any) => {
      setCurrentTabURL(url);
    });
  }

  const closeOverlay = () => {
    setOverlayPlugin(null);
    setDisplayOverlay(false);
  }

  const sortPlugins = (a: Plugin, b: Plugin) => {
    if (a.name < b.name) {
      return -1;
    } else if (a.name > b.name) {
      return 1;
    } else {
      return 0;
    }
  }

  const savePluginsToStorage = (plugins: Plugin[]) => {
    StorageService.savePlugins(plugins);
  }

  const saveNewPlugin = (newPlugin: Plugin) => {
    let pluginsCopy: Plugin[] = plugins.slice();
    pluginsCopy.push(newPlugin);
    pluginsCopy.sort(sortPlugins);

    savePluginsToStorage(pluginsCopy);
    setPlugins(pluginsCopy);
    setOverlayPlugin(null);
    setShownPluginType(newPlugin.type);
  }

  const editExistingPlugin = (existingPlugin: Plugin) => {
    let pluginsCopy: Plugin[] = plugins.slice();
    pluginsCopy = pluginsCopy.filter(plugin => plugin.url != existingPlugin.url);
    pluginsCopy.push(existingPlugin);
    pluginsCopy.sort(sortPlugins);

    savePluginsToStorage(pluginsCopy);
    setPlugins(pluginsCopy);
  }

  const deletePlugin = (pluginToDelete: Plugin) => {
    let pluginsCopy: Plugin[] = plugins.slice();
    pluginsCopy = pluginsCopy.filter(plugin => plugin.url != pluginToDelete.url);

    savePluginsToStorage(pluginsCopy);
    setPlugins(pluginsCopy);
    setDisplayOverlay(false);
  }

  const updatePluginVersion = (plugin: Plugin) => {
    if (plugin.type === PluginType.Forums && plugin.latestVersion) {
      plugin.installedVersion = plugin.latestVersion;
    } else if (plugin.type === PluginType.Custom) {
      plugin.lastCheckDateUnix = Date.now();
    }

    editExistingPlugin(plugin);
  }


  const showPluginOverlay = (plugin: Plugin) => {
    setOverlayPlugin(plugin);
    setOverlayMode(OverlayMode.View);
    setDisplayOverlay(true);
  }

  const showSnackbar = (text: string) => {
    setSnackbarText(text);
    setDisplaySnackbar(true);
  }

  const closeSnackbar = () => {
    setSnackbarText('');
    setDisplaySnackbar(false);
  }

  return (
    <div>
      <Header
        addPlugin={addPlugin}
        refreshPlugins={refreshPlugins}
        searchPlugins={searchPlugins}
      />
      <PluginList
        plugins={plugins}
        shownPluginType={shownPluginType}
        pluginFilter={pluginFilter}
        currentTabURL={currentTabURL}
        showPluginOverlay={showPluginOverlay}
        openPluginURL={openPluginURL}
        updatePluginVersion={updatePluginVersion}
      />
      <Footer
        shownPluginType={shownPluginType}
        changePluginType={changePluginType}
      />
      <PluginOverlay
        show={displayOverlay}
        mode={overlayMode}
        overlayPlugin={overlayPlugin}
        closeOverlay={closeOverlay}
        saveNewPlugin={saveNewPlugin}
        editExistingPlugin={editExistingPlugin}
        deletePlugin={deletePlugin}
        showSnackbar={showSnackbar}
      />
      <Snackbar
        show={displaySnackbar}
        text={snackbarText}
        closeSnackbar={closeSnackbar}
      />
    </div>
  );
}

export default App;
