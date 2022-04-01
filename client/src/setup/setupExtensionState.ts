import * as path from "path";
import {
  window,
  workspace,
  env,
  ExtensionContext,
  OutputChannel,
} from "vscode";
import { SentryClientTelemetry } from "../telemetry/SentryClientTelemetry";

import { ExtensionState } from "../types";
import { Logger } from "../utils/Logger";

export function setupExtensionState(
  context: ExtensionContext,
  { sentryDsn }: { sentryDsn: string }
): ExtensionState {
  const serverModulePath = context.asAbsolutePath(
    path.join("server", "out", "index.js")
  );

  const outputChannel: OutputChannel = window.createOutputChannel("Hardhat");
  const telemetry = new SentryClientTelemetry(sentryDsn);
  const logger = new Logger(outputChannel, telemetry);

  const extensionState: ExtensionState = {
    context: context,
    env:
      process.env.NODE_ENV === "development"
        ? process.env.NODE_ENV
        : "production",
    version: context.extension.packageJSON.version,
    name: context.extension.packageJSON.name,
    serverModulePath,
    machineId: env.machineId,

    clients: new Map(),
    listenerDisposables: [],
    hardhatTelemetryEnabled: workspace
      .getConfiguration("hardhat")
      .get<boolean>("telemetry"),
    globalTelemetryEnabled: env.isTelemetryEnabled,

    telemetry,
    outputChannel,
    logger,
  };

  telemetry.init(extensionState);

  return extensionState;
}