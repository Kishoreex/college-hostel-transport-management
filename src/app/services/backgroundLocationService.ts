import { registerPlugin, PluginListenerHandle } from "@capacitor/core";

interface OutpassLocationPlugin {
  start(): Promise<void>;
  stop(): Promise<void>;
}

const OutpassLocation =
  registerPlugin<OutpassLocationPlugin>("OutpassLocation");

export async function startBackgroundLocation() {
  await OutpassLocation.start();

  console.log(
    "Background location tracking started"
  );
}

export async function stopBackgroundLocation() {
  await OutpassLocation.stop();

  console.log(
    "Background location tracking stopped"
  );
}

export async function addBackgroundLocationListener(
  callback: (
    latitude: number,
    longitude: number
  ) => void
): Promise<PluginListenerHandle> {

  return await OutpassLocation.addListener(
    "locationUpdate",
    (data: {
      latitude: number;
      longitude: number;
    }) => {

      console.log(
        "Background GPS:",
        data.latitude,
        data.longitude
      );

      callback(
        data.latitude,
        data.longitude
      );
    }
  );
}