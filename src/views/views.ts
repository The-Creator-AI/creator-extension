import { VIEW_TYPES } from "./view-types";
import { getChatViewHtml, handleChatViewMessages } from "./chat-view/chat-view";
import {
  getFileExplorerViewHtml,
  handleFileExplorerViewMessages,
} from "./file-explorer-view/file-explorer-view";
import { getChangePlanViewHtml } from "./change-plan-view/getChangePlanViewHtml";
import { handleChangePlanViewMessages } from "./change-plan-view/handleChangePlanViewMessages";
import { getGraphViewHtml } from "./graph-view/getGraphViewHtml";
import { handleGraphViewMessages } from "./graph-view/graph-view";

export const views = [
  {
    type: VIEW_TYPES.SIDEBAR.CHAT,
    title: "Chat",
    target: "sidebar",
    getHtml: getChatViewHtml,
    handleMessage: handleChatViewMessages,
  },
  {
    type: VIEW_TYPES.SIDEBAR.FILE_EXPLORER,
    title: "File Explorer",
    target: "sidebar",
    getHtml: getFileExplorerViewHtml,
    handleMessage: handleFileExplorerViewMessages,
  },
  {
    type: VIEW_TYPES.SIDEBAR.CHANGE_PLAN,
    title: "Change Plan",
    target: "sidebar",
    getHtml: getChangePlanViewHtml,
    handleMessage: handleChangePlanViewMessages,
  },
  {
    type: VIEW_TYPES.PANEL.GRAPH_VIEW,
    title: "Graph View",
    target: "panel",
    getHtml: getGraphViewHtml,
    handleMessage: handleGraphViewMessages,
  },
];
