import { parentPort } from "worker_threads";
import createScopedDependency from "../utils/createScopedDependency.js";
import container from "../containers/Containers.js";
const { logger } = container.cradle;

async function createScope() {
  const {
    scope,
    dependency: subscriberRepository,
    error,
  } = await createScopedDependency(
    container,
    "Mydatabase",
    "subscriberRepository"
  );
  return { scope, subscriberRepository, error };
}

(async () => {
  const { scope, subscriberRepository, error } = await createScope();
  if (error) {
    // handle error gracefully
    logger.log(`[Worker] Error creating scope: ${error}`, "error");
    return;
  }
  try {
    await subscriberRepository.updateAutomaticCampaignForJob();

    parentPort.postMessage("Old campaigns expired successfully.");
  } catch (err) {
    parentPort.postMessage({ error: err.message });
  } finally {
    // Ensure the scope is disposed of even in case of an error
    if (scope && typeof scope.dispose === "function") {
      await scope.dispose();
    }
  }
})();
