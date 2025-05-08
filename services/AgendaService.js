import Agenda from "agenda";
import appconfig from "../config/appconfig.js";
import { Worker } from "worker_threads";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
import container from "../containers/Containers.js";
import createScopedDependency from "../utils/createScopedDependency.js";

class AgendaService {
  constructor({ logger }) {
    this.agenda = null;
    this.logger = logger;
  }

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
      this.logger.log("[Agenda] initialized and jobs defined...", "info");
    } catch (error) {
      this.logger.log(`[Agenda] Error initializing Agenda: ${error}`, "error");
    }
  }

  _attachAgendaListeners() {
    this.agenda.on("start", (job) => {
      this.logger.log(`[Agenda] Job started: ${job.attrs.name}`, "info");
    });

    this.agenda.on("complete", (job) => {
      this.logger.log(`[Agenda] Job completed: ${job.attrs.name}`, "info");
    });

    this.agenda.on("fail", (err, job) => {
      this.logger.log(
        `[Agenda] Job failed: ${job.attrs.name}, Error: ${err.message}`,
        "error"
      );
    });
  }
  createScope = async () => {
    const { scope, dependency: subscriberRepository } =
      await createScopedDependency(
        container,
        "Mydatabase",
        "subscriberRepository"
      );
    return { scope, subscriberRepository };
  };
  async defineJobs() {
    // Campaign Email Job using Worker
    this.agenda.define("sendCampaignEmail", { priority: "high" }, async () => {
      try {
        this.logger.log("[Agenda] Checking for active campaigns...", "info");

        const scope = await this.createScope();
        const subscriberRepository = scope.subscriberRepository;
        const campaigns = await subscriberRepository.getAllActiveCampaign();

        if (!campaigns.length)
          return this.logger.log("[Agenda] No active campaigns found.", "info");

        const subscribers = await subscriberRepository.getAllSubscribers();
        if (!subscribers.length)
          return this.logger.log("[Agenda] No subscribers found.", "info");

        const recipientEmails = subscribers.map((s) => s.email);

        const worker = new Worker(
          join(__dirname, "../worker/campaignEmailWorker.js"),
          {
            workerData: {
              campaigns,
              recipientEmails,
            },
          }
        );

        worker.on("message", async (msg) => {
          if (msg?.error) {
            this.logger.log(`[Agenda] Worker Error: ${msg.error}`, "error");
          } else {
            this.logger.log(`[Agenda] Worker: ${msg}`, "info");
            for (const campaign of campaigns) {
              await subscriberRepository.updateCampaignAfterJob(campaign._id);
            }
          }
        });

        worker.on("error", (err) => {
          this.logger.log(`[Agenda] Worker failed: ${err.message}`, "error");
        });

        worker.on("exit", (code) => {
          if (code !== 0)
            this.logger.log(
              `[Agenda] Worker stopped with code ${code}`,
              "error"
            );
        });
      } catch (error) {
        this.logger.log(
          `[Agenda] Error in campaign email job: ${error.message}`,
          "error"
        );
      }
    });

    // Expire Old Campaigns Job using Worker
    this.agenda.define("expireOldCampaigns", { priority: "high" }, async () => {
      try {
        this.logger.log(
          "[Agenda] Automatic expire of old campaigns...",
          "info"
        );
        const worker = new Worker(
          join(__dirname, "../worker/expireOldCampaignsWorker.js"),
          {
            workerData: {},
          }
        );

        worker.on("message", async (msg) => {
          if (msg?.error) {
            this.logger.log(`[Agenda] Worker Error: ${msg.error}`, "error");
          } else {
            this.logger.log(`[Agenda] Worker: ${msg}`, "info");
          }
        });

        worker.on("error", (err) => {
          this.logger.log(`[Agenda] Worker failed: ${err.message}`, "error");
        });

        worker.on("exit", (code) => {
          if (code !== 0)
            this.logger.log(
              `[Agenda] Worker stopped with code ${code}`,
              "error"
            );
        });
      } catch (error) {
        this.logger.log(
          `[Agenda] Error in expire campaigns job: ${error.message}`,
          "error"
        );
      }
    });

    await this.startAgendaJobs();
  }

  async startAgendaJobs() {
    if (!this.agenda) throw new Error("Agenda is not initialized.");

    await this.agenda.start();
    this.logger.log("[Agenda] Job scheduler started and ready.", "info");

    try {
      // Schedule "sendCampaignEmail" job uniquely
      await this.agenda.every(
        appconfig.agenda.CAMPAIGN_EMAIL_SCHEDULE,
        "sendCampaignEmail",
        {},
        { unique: { name: "sendCampaignEmail" } }
      );
      this.logger.log(
        "[Agenda] Campaign email job scheduled (unique).",
        "info"
      );

      // Schedule "expireOldCampaigns" job uniquely
      await this.agenda.every(
        appconfig.agenda.EXPIRE_CAMPAIGN_SCHEDULE,
        "expireOldCampaigns",
        {},
        { unique: { name: "expireOldCampaigns" } }
      );
      this.logger.log(
        "[Agenda] Expire old campaigns job scheduled (unique).",
        "info"
      );

      const allJobs = await this.agenda.jobs({});
      this.logger.log(
        `[Agenda] Total scheduled jobs: ${allJobs.length}`,
        "info"
      );
    } catch (error) {
      this.logger.log(
        `[Agenda] Error scheduling jobs: ${error.message}`,
        "error"
      );
    }
  }
}

export default AgendaService;
