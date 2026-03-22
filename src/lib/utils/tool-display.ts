interface ToolDisplayInfo {
  displayName: string;
  fullPath?: string;
}

export function getToolDisplayName(
  toolName: string,
  toolState: "call" | "result",
  args?: any
): ToolDisplayInfo {
  const isInProgress = toolState === "call";

  if (toolName === "str_replace_editor" && args?.command) {
    const command = args.command;
    const path = args.path;
    const fileName = path ? extractFileName(path) : "";

    const commandMap: Record<string, { progressive: string; past: string }> = {
      create: { progressive: "Creating", past: "Created" },
      str_replace: { progressive: "Editing", past: "Edited" },
      insert: { progressive: "Inserting into", past: "Inserted into" },
      view: { progressive: "Viewing", past: "Viewed" },
      undo_edit: { progressive: "Undoing changes to", past: "Undid changes to" },
    };

    const verbs = commandMap[command];
    if (verbs && fileName) {
      const verb = isInProgress ? verbs.progressive : verbs.past;
      const truncatedName = truncateFileName(fileName);
      return {
        displayName: `${verb} ${truncatedName}`,
        fullPath: path,
      };
    }

    return { displayName: isInProgress ? "Editing file..." : "Edited file" };
  }

  if (toolName === "file_manager" && args?.command) {
    const command = args.command;
    const path = args.path;
    const fileName = path ? extractFileName(path) : "";

    const commandMap: Record<string, { progressive: string; past: string }> = {
      rename: { progressive: "Moving", past: "Moved" },
      delete: { progressive: "Deleting", past: "Deleted" },
    };

    const verbs = commandMap[command];
    if (verbs && fileName) {
      const verb = isInProgress ? verbs.progressive : verbs.past;
      const truncatedName = truncateFileName(fileName);
      return {
        displayName: `${verb} ${truncatedName}`,
        fullPath: path,
      };
    }

    return {
      displayName: isInProgress ? "Managing files..." : "Managed files",
    };
  }

  return { displayName: toolName };
}

function extractFileName(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const parts = normalized.split("/");
  return parts[parts.length - 1] || path;
}

function truncateFileName(fileName: string, maxLength: number = 25): string {
  if (fileName.length <= maxLength) {
    return fileName;
  }

  const extension = fileName.lastIndexOf(".");
  if (extension === -1) {
    return fileName.substring(0, maxLength - 3) + "...";
  }

  const ext = fileName.substring(extension);
  const name = fileName.substring(0, extension);
  const availableLength = maxLength - ext.length - 3;

  if (availableLength > 0) {
    return name.substring(0, availableLength) + "..." + ext;
  }

  return fileName.substring(0, maxLength - 3) + "...";
}
