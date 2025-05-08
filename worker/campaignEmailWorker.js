import { parentPort, workerData } from "worker_threads";
import container from "../containers/Containers.js";

(async () => {
  try {
    const scope = container.createScope();
    const emailService = scope.resolve("emailService");

    for (const campaign of workerData.campaigns) {
      const endDate = new Date(campaign.endDate).toLocaleDateString("fi-FI");

      const templateData = {
        lang: "fi",
        customer_email: workerData.recipientEmails,
        name: campaign.name.fi,
        promotion_message: campaign.message.fi,
        offer_details: campaign.offer_details.fi,
        offer_validity: endDate,
        offer_terms: campaign.offer_terms.fi,
      };

      await emailService.sendPushNotification(templateData);
    }

    parentPort.postMessage("Emails sent successfully.");
  } catch (err) {
    parentPort.postMessage({ error: err.message });
  }
})();
