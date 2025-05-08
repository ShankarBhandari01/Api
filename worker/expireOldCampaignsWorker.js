import { parentPort } from "worker_threads";
import createScopedDependency from "../utils/createScopedDependency.js";
import container from "../containers/Containers.js";

// need to inject database connection to subscriberRepository 
// which is only scope base injection

async function createScope() {
  const { scope, dependency: subscriberRepository } =
    await createScopedDependency(
      container,
      "Mydatabase",
      "subscriberRepository"
    );
  return { scope, subscriberRepository };
}

(async () => {
  try {
    const scope = await createScope();
    const subscriberRepository = scope.subscriberRepository;

    await subscriberRepository.updateAutomaticCampaignForJob();

    parentPort.postMessage("Old campaigns expired successfully.");
  } catch (err) {
    parentPort.postMessage({ error: err.message });
  }
})();
