import { Plugin, PluginType } from "../common/types";
import axios, { AxiosResponse } from "axios";

export const HTTPService = {

  loadLatestPluginVersion: async (plugin: Plugin): Promise<string | undefined> => {

    let regex: RegExp = /"fileSize":(?:.|\n)*?"softwareVersion": "(.*)"/gim;
    let url: string = plugin.url;
    let response: AxiosResponse = await axios.get(url);
    let html = response.data;

    let regexmatch: RegExpExecArray | null = regex.exec(html);
    let latestVersion: string | undefined;
    if (regexmatch) {
      latestVersion = regexmatch[1];
    }

    return latestVersion;
  },

  loadPluginInfo: async (url: string): Promise<Plugin> => {
    let regex: RegExp = /<script type='application\/ld\+json'>\s*({\s+"@context": "http:\/\/schema\.org",\s+"@type": "WebApplication",[\s\S]+?)<\/script>/gim;

    if (url.includes("forums.x-plane.org")) {
      try {
        let response: AxiosResponse = await axios.get(url);
        let html: string = response.data;
        let match = regex.exec(html);

        if (match) {
          let JSONData = JSON.parse(match[1]);

          let forumsPlugin: Plugin = {
            url: url,
            name: JSONData.name,
            installedVersion: JSONData.softwareVersion,
            latestVersion: JSONData.softwareVersion,
            dateAddedUnix: Date.now(),
            notes: "",
            type: PluginType.Forums
          }

          return forumsPlugin;
        }
      } catch {
        // Error occured
      }
    }

    let customPlugin: Plugin = {
      url: url,
      name: "",
      installedVersion: "",
      lastCheckDateUnix: Date.now(),
      dateAddedUnix: Date.now(),
      notes: "",
      type: PluginType.Custom,
    }

    return customPlugin;
  }
}