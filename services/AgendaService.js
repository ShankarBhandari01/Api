import Agenda from "agenda";
import container from "../containers/Containers.js";
import appconfig from "../config/appconfig.js";
import createScopedDependency from "../utils/createScopedDependency.js";
import WorkerWrapper from "../worker/WorkerWrapper.js";

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
        processEvery: "5 minute",
      });

      this._attachAgendaListeners();
      await this.agenda._ready;

      if (process.env.IS_AGENDA_SCHEDULER === "true") {
        await this.defineJobs();
        this.logger.log("[Agenda] Jobs defined and scheduled", "info");
      } else {
        this.logger.log("[Agenda] Running in worker-only mode", "info");
      }
    } catch (err) {
      this.logger.log(`[Agenda] Initialization error: ${err.message}`, "error");
    }
  }

  _attachAgendaListeners() {
    this.agenda.on("start", (job) => {
      this.logger.log(`[Agenda] Started: ${job.attrs.name}`, "info");
    });

    this.agenda.on("complete", (job) => {
      this.logger.log(`[Agenda] Completed: ${job.attrs.name}`, "info");
    });

    this.agenda.on("fail", (err, job) => {
      this.logger.log(
        `[Agenda] Failed: ${job.attrs.name} - ${err.message}`,
        "error"
      );
    });
  }

  async createScope() {
    const {
      scope,
      dependency: subscriberRepository,
      error,
    } = await createScopedDependency(
      container,
      "Mydatabase",
      "subscriberRepository"
    );

    if (error) {
      this.logger.log(
        `[AgendaService] Error creating scoped dependency: ${error}`,
        "error"
      );
      return { error };
    }

    return { scope, subscriberRepository, error };
  }

  async defineJobs() {
    // Email Campaign Job
    this.agenda.define(
      "sendCampaignEmail",
      { priority: "high", lockLifetime: 10 * 60 * 1000 }, // 10 minutes
      async () => {
        try {
          const { subscriberRepository, error } = await this.createScope();

          if (error) {
            return;
          }
          const campaigns = await subscriberRepository.getAllActiveCampaign();
          if (!campaigns.length) {
            return this.logger.log("[Agenda] No active campaigns", "info");
          }

          const subscribers = await subscriberRepository.getAllSubscribers();
          if (!subscribers.length) {
            return this.logger.log("[Agenda] No subscribers", "info");
          }

          const recipientEmails = subscribers.map((s) => s.email);

          const worker = new WorkerWrapper(
            "campaignEmailWorker.js",
            { campaigns, recipientEmails },
            this.logger
          );

          await worker.run();

          for (const c of campaigns) {
            await subscriberRepository.updateCampaignAfterJob(c._id);
          }
        } catch (err) {
          this.logger.log(
            `[Agenda] sendCampaignEmail error: ${err.message}`,
            "error"
          );
        }
      }
    );

    // Expire Campaigns Job
    this.agenda.define(
      "expireOldCampaigns",
      { priority: "high", lockLifetime: 5 * 60 * 1000 }, // 5 minutes
      async () => {
        try {
          const worker = new WorkerWrapper(
            "expireOldCampaignsWorker",
            {},
            this.logger
          );
          await worker.run();
        } catch (err) {
          this.logger.log(
            `[Agenda] expireOldCampaigns error: ${err.message}`,
            "error"
          );
        }
      }
    );

    await this.scheduleJobs();
    await this.agenda.start();
  }

  async scheduleJobs() {
    // Unique scheduling for multi-instance safety
    await this.agenda.every(
      appconfig.agenda.CAMPAIGN_EMAIL_SCHEDULE,
      "sendCampaignEmail",
      {},
      { unique: { name: "sendCampaignEmail" } }
    );

    await this.agenda.every(
      appconfig.agenda.EXPIRE_CAMPAIGN_SCHEDULE,
      "expireOldCampaigns",
      {},
      { unique: { name: "expireOldCampaigns" } }
    );

    const jobs = await this.agenda.jobs({});
    this.logger.log(`[Agenda] Scheduled jobs: ${jobs.length}`, "info");
  }

  async stopAgenda() {
    if (this.agenda) {
      await this.agenda.stop();
      this.logger.log("[Agenda] Stopped gracefully", "info");
    }
  }

  async checkJobStatus() {
    if (!this.agenda) {
      this.logger.log("[Agenda] Agenda not initialized", "warn");
      return [];
    }

    const jobs = await this.agenda.jobs({});
    this.logger.log(`[Agenda] Current jobs: ${jobs.length}`, "info");
    return jobs.map((job) => ({
      name: job.attrs.name,
      nextRunAt: job.attrs.nextRunAt,
      lastRunAt: job.attrs.lastRunAt,
      lockedAt: job.attrs.lockedAt,
    }));
  }
}

export default AgendaService;
