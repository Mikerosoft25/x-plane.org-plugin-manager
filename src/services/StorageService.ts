import { Plugin, PluginType } from "../common/types";
import browser from "webextension-polyfill";

export const StorageService = {

  // Converting plugins from < v2.x.x to new plugin format
  convertStorage: async (): Promise<void> => {
    let oldVersionStorage = await browser.storage.local.get('plugins_data');

    if (!oldVersionStorage.plugins_data) {
      return;
    }

    let convertedPlugins: Plugin[] = [];

    let oldVersionPlugins: any[] = oldVersionStorage.plugins_data[0].concat(oldVersionStorage.plugins_data[1]);

    oldVersionPlugins.forEach((oldPlugin: any) => {
      let pluginType = oldPlugin.source === "forum" ? PluginType.Forums : PluginType.Custom;

      let convertedPlugin: Plugin = {
        url: oldPlugin.url,
        name: oldPlugin.name,
        installedVersion: oldPlugin.installed_version,
        dateAddedUnix: new Date(oldPlugin.date_added).getTime(),
        notes: oldPlugin.notes,
        type: pluginType,
      }

      if (pluginType === PluginType.Custom) {
        convertedPlugin.lastCheckDateUnix = new Date(oldPlugin.date_checked).getTime();
      }

      convertedPlugins.push(convertedPlugin);
    });

    convertedPlugins.sort((a: Plugin, b: Plugin) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    });

    await StorageService.savePlugins(convertedPlugins);
    await browser.storage.local.remove('plugins_data');
  },

  loadPlugins: async (): Promise<Plugin[]> => {

    // just for conversion of plugins from v2.x.x
    await StorageService.convertStorage();

    let storage = await browser.storage.local.get('plugins');
    if (storage.plugins) {
      storage.plugins.forEach((plugin: Plugin) => plugin.latestVersion = undefined);
      return storage.plugins;
    } else {
      return [];
    }
  },

  savePlugins: async (plugins: Plugin[]) => {
    await browser.storage.local.set({
      plugins: plugins,
    });
  }
}