const Agenda = require("agenda");
const { EmailService } = require("./EmailService");
const {
  SubscriberRepository,
} = require("../repositories/SubscriberRepository");
const config = require("../config/appconfig");
const path = require("path");
const fs = require("fs");

class AgendaService extends EmailService {
  constructor(connection) {
    super();
    this.connection = connection;
    this.agenda = null;
    this.subscriberRepository = new SubscriberRepository(connection);
  }
  getConnectionString = () => {
    const configPath = path.join(__dirname, "..", "config", "config.json");
    const config = JSON.parse(fs.readFileSync(configPath))[
      process.env.NODE_ENV || "development"
    ];
    const uri = `mongodb+srv://${config.username}:${config.password}@${config.host}/${config.database}?retryWrites=true&w=majority&appName=Cluster0`;
    return uri;
  };
  // Initialize Agenda
  async initializeAgenda() {
    try {
      const connectionString = this.getConnectionString();
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

  // Attach listeners to Agenda events
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

  // Define jobs in Agenda
  async defineJobs() {
    // Send campaign email job
    this.agenda.define(
      "sendCampaignEmail",
      { priority: "high" },
      async (job) => {
        try {
          this.log("Checking for active campaigns...", "info");

          const campaigns =
            await this.subscriberRepository.getAllActiveCampaign();
          if (!campaigns.length)
            return this.log("No active campaigns found.", "info");

          const subscribers =
            await this.subscriberRepository.getAllSubscribers();
          if (!subscribers.length)
            return this.log("No subscribers found.", "info");

          const recipientEmails = subscribers.map((s) => s.email);

          for (const campaign of campaigns) {
            try {
              this.log(
                `Sending email for campaign: ${campaign.name.en}`,
                "info"
              );
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
              await this.subscriberRepository.updateCampaignAfterJob(
                campaign._id
              );
              this.log("Campaign email sent successfully.", "info");
            } catch (error) {
              this.log(
                `Error sending email for campaign: ${campaign.name.en}`,
                "error"
              );
              await this.subscriberRepository.updateCampaignAfterJob(
                campaign._id,
                error.message,
                campaign.status
              );
            }
          }
        } catch (error) {
          this.log(`Error in campaign job: ${error.message}`, "error");
        }
      }
    );

    // Expire campaigns job
    this.agenda.define(
      "expire old campaigns",
      { priority: "high" },
      async () => {
        try {
          this.log("Automatic expire of old campaigns...", "info");
          await this.subscriberRepository.updateCampaignForJob();
        } catch (error) {
          this.log(
            `Error in expire old campaigns job: ${error.message}`,
            "error"
          );
        }
      }
    );

    //Start Agenda jobs
    await this.startAgendaJobs();
  }

  // Start Agenda Jobs
  async startAgendaJobs() {
    if (!this.agenda) {
      throw new Error("Agenda is not initialized.");
    }

    await this.agenda.start();
    this.log("Agenda job scheduler started and ready.", "info");

    // Schedule the jobs
    await this.agenda.every(
      config.agenda.CAMPAIGN_EMAIL_SCHEDULE,
      "sendCampaignEmail"
    );
    this.log("Campaign email job scheduled.", "info");

    await this.agenda.every(
      config.agenda.EXPIRE_CAMPAIGN_SCHEDULE,
      "expire old campaigns"
    );
    this.log("Expire old campaigns job scheduled.", "info");

    //list jobs to confirm they're scheduled
    const jobs = await this.agenda.jobs({});
    this.log(`Scheduled jobs count: ${jobs.length}`, "info");
  }
}

module.exports = AgendaService;
