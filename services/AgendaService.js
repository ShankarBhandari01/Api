// services/agendaService.js
const Agenda = require("agenda");
const { EmailService } = require("./EmailService");
const {
  SubscriberRepository,
} = require("../repositories/SubscriberRepository");
const config = require("../config/appconfig");

class AgendaService extends EmailService {
  constructor(connection) {
    super();
    this.connection = connection;
    this.agenda = null;
    this.subscriberRepository = new SubscriberRepository(connection);
  }

  async initializeAgenda() {
    this.agenda = new Agenda({
      mongo: this.connection,
      db: { collection: "agendaJobs" },
      processEvery: "30 seconds", // Check every 30 seconds for jobs
    });
    this.log("Agenda initialized and jobs defined...");
  }

  async defineJobs() {
    // Define the job for sending campaign emails
    this.agenda.define(
      "send campaign email",
      { priority: "high" },
      async (job) => {
        try {
          this.log("Checking for active campaigns...");
          // getting all active campaigns
          const campaigns =
            await this.subscriberRepository.getAllActiveCampaign();

          if (!campaigns.length) {
            this.log("No active campaigns found.");
            return;
          }

          // getting all subscribers
          const subscribers =
            await this.subscriberRepository.getAllSubscribers();
          if (!subscribers.length) {
            this.log("No subscribers found.");
            return;
          }
          const recipientEmails = subscribers.map((s) => s.email);

          for (const campaign of campaigns) {
            try {
              this.log(`Sending email for campaign: ${campaign.name}`);
              const templateData = {
                lang: "fi",
                customer_email: recipientEmails,
                name: campaign.name.fi,
                promotion_message: campaign.message.fi,
                offer_details: campaign.offer_details.fi,
                offer_validity: campaign.offer_validity,
                offer_terms: campaign.offer_terms,
              };

              await this.sendPushNotification(templateData);
              // After sending, update the campaign status
              await this.subscriberRepository.updateCampaignAfterJob(
                campaign._id
              );
              this.log("Campaign email sent successfully");
            } catch (error) {
              this.log(
                `Error sending email for campaign: ${campaign.name}`,
                "error"
              );
              await this.subscriberRepository.updateCampaignAfterJob(
                campaign._id,
                "Issue",
                error
              );
            }
          }
        } catch (error) {
          this.log(`Error in campaign job: ${error.message}`, "error");
        }
      }
    );

    // Define the job for expiring old campaigns
    this.agenda.define(
      "expire old campaigns",
      { priority: "high" },
      async () => {
        try {
          this.log("Automatic expire of old campaigns...");
          await this.subscriberRepository.updateCampaignForJob();
        } catch (error) {
          this.log(
            `Error in expire old campaigns job: ${error.message}`,
            "error"
          );
        }
      }
    );
  }

  // Function to start Agenda and schedule jobs
  async startAgendaJobs() {
    if (!this.agenda) {
      throw new Error("Agenda is not initialized");
    }

    await this.agenda.start();
    this.log("Agenda job scheduler started...");
    // Schedule the campaign email job with the schedule from the .env file
    await this.agenda.every(
      config.agenda.CAMPAIGN_EMAIL_SCHEDULE,
      "send campaign email"
    );
    this.log("Campaign email job scheduled to run every day.");

    // Schedule the expiry of old campaigns based on .env file
    await this.agenda.every(
      config.agenda.EXPIRE_CAMPAIGN_SCHEDULE,
      "expire old campaigns"
    );
    this.log("Expire old campaigns job scheduled to run daily.");
  }
}

module.exports = AgendaService;
