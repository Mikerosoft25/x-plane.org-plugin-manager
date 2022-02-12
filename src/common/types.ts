export enum OverlayMode {
  Add = "Add",
  View = "View",
  Edit = "Edit"
}

export enum PluginType {
  Forums = "ForumsPlugin",
  Custom = "CustomPlugin"
}

export interface Plugin {
  url: string,
  name: string,
  installedVersion: string,
  latestVersion?: string,
  lastCheckDateUnix?: number,
  dateAddedUnix: number,
  notes: string,
  type: PluginType
}