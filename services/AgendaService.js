import Agenda from "agenda";
import EmailService from "./EmailService.js";
import appconfig from "../config/appconfig.js";
import container from "../containers/Containers.js";

class AgendaService extends EmailService {
  constructor({ mongoConnectionManager }) {
    super();
    this.agenda = null;
    this.mongoConnectionManager = mongoConnectionManager;
  }

  // Database Connection for Agenda
  getDatabaseConnection = async () => {
    const db = await this.mongoConnectionManager.getConnection("Mydatabase");
    return db;
  };

  // Initialize Agenda
  async initializeAgenda(connectionString) {
    try {
      this.agenda = new Agenda({
        db: {
          address: connectionString,
          collection: "agendaJobs",
        },
        processEvery: "1 second",
      });

      this._attachAgendaListeners();
      await this.agenda._ready;
      await this.defineJobs();
      this.log("Agenda initialized and jobs defined...", "info");
    } catch (error) {
      this.log(`Error initializing Agenda: ${error}`, "error");
    }
  }

  _attachAgendaListeners() {
    this.agenda.on("start", (job) => {
      this.log(`Job started: ${job.attrs.name}`, "info");
    });

    this.agenda.on("complete", (job) => {
      this.log(`Job completed: ${job.attrs.name}`, "info");
    });

    this.agenda.on("fail", (err, job) => {
      this.log(`Job failed: ${job.attrs.name}, Error: ${err.message}`, "error");
    });
  }

  async defineJobs() {
    // Campaign Email Job
    this.agenda.define("sendCampaignEmail", { priority: "high" }, async () => {
      try {
        const scope = container.createScope();
        const subscriberRepository = scope.resolve("subscriberRepository");

        this.log("Checking for active campaigns...", "info");

        const campaigns = await subscriberRepository.getAllActiveCampaign();
        if (!campaigns.length)
          return this.log("No active campaigns found.", "info");

        const subscribers = await subscriberRepository.getAllSubscribers();
        if (!subscribers.length)
          return this.log("No subscribers found.", "info");

        const recipientEmails = subscribers.map((s) => s.email);

        for (const campaign of campaigns) {
          try {
            this.log(`Sending email for campaign: ${campaign.name.en}`, "info");

            const endDate = new Date(campaign.endDate).toLocaleDateString(
              "fi-FI"
            );

            const templateData = {
              lang: "fi",
              customer_email: recipientEmails,
              name: campaign.name.fi,
              promotion_message: campaign.message.fi,
              offer_details: campaign.offer_details.fi,
              offer_validity: endDate,
              offer_terms: campaign.offer_terms.fi,
            };

            await this.sendPushNotification(templateData);
            await subscriberRepository.updateCampaignAfterJob(campaign._id);
            this.log("Campaign email sent successfully.", "info");
          } catch (error) {
            this.log(
              `Error sending campaign email: ${campaign.name.en}`,
              "error"
            );
            await subscriberRepository.updateCampaignAfterJob(
              campaign._id,
              error.message,
              campaign.status
            );
          }
        }
      } catch (error) {
        this.log(`Error in campaign email job: ${error.message}`, "error");
      }
    });

    // Expire Old Campaigns Job
    this.agenda.define(
      "expire old campaigns",
      { priority: "high" },
      async () => {
        try {
          const scope = container.createScope();
          const subscriberRepository = scope.resolve("subscriberRepository");

          this.log("Automatic expire of old campaigns...", "info");
          await subscriberRepository.updateAutomaticCampaignForJob();
        } catch (error) {
          this.log(`Error in expire campaigns job: ${error.message}`, "error");
        }
      }
    );

    await this.startAgendaJobs();
  }

  async startAgendaJobs() {
    if (!this.agenda) throw new Error("Agenda is not initialized.");

    await this.agenda.start();
    this.log("Agenda job scheduler started and ready.", "info");

    await this.agenda.every(
      appconfig.agenda.CAMPAIGN_EMAIL_SCHEDULE,
      "sendCampaignEmail"
    );
    this.log("Campaign email job scheduled.", "info");

    await this.agenda.every(
      appconfig.agenda.EXPIRE_CAMPAIGN_SCHEDULE,
      "expire old campaigns"
    );
    this.log("Expire old campaigns job scheduled.", "info");

    const jobs = await this.agenda.jobs({});
    this.log(`Scheduled jobs count: ${jobs.length}`, "info");
  }
}

export default AgendaService;
