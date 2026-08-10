import { registerPlugin } from "@capacitor/core";

interface OutpassLocationPlugin {
  start(): Promise<void>;
  stop(): Promise<void>;
}

const OutpassLocation =
  registerPlugin<OutpassLocationPlugin>("OutpassLocation");

export async function startBackgroundLocation() {
  try {
    await OutpassLocation.start();

    console.log(
      "Background location tracking started"
    );
  } catch (error) {
    console.error(
      "Failed to start background location:",
      error
    );

    throw error;
  }
}

export async function stopBackgroundLocation() {
  try {
    await OutpassLocation.stop();

    console.log(
      "Background location tracking stopped"
    );
  } catch (error) {
    console.error(
      "Failed to stop background location:",
      error
    );

    throw error;
  }
}