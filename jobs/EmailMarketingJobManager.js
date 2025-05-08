// jobs/EmailMarketingJob.js
class EmailMarketingJobManager {
  constructor({ agendaService, mongoConnectionManager, logger }) {
    this.agendaService = agendaService;
    this.mongoConnectionManager = mongoConnectionManager;
    this.logger = logger;
  }

  async init() {
    await this._startJob();
   // await this.testAgandaServer();
  }

  async _startJob() {
    try {
      await this.agendaService.initializeAgenda(
        this.mongoConnectionManager.getConnectionString("Mydatabase")
      );
    } catch (error) {
      this.logger.log(`Error in EmailMarketingJob: ${error.message}`, "error");
      return;
    }
  }

  async stopJob() {
    try {
      // Gracefully stop the agenda jobs and the service
      if (this.agendaService) {
        await this.agendaService.agenda.stop();
        this.logger.log("Agenda jobs successfully stopped.", "info");
      } else {
        this.logger.log(
          "Agenda service was not initialized. No jobs to stop.",
          "info"
        );
      }
    } catch (error) {
      this.logger.log(`Error stopping agenda jobs: ${error}`, "error");
    }
  }

  // a method to check job status
  async checkJobStatus() {
    if (this.agendaService && this.agendaService.agenda) {
      const jobStatus = await this.agendaService.agenda.jobs();
      this.logger.log(`Current Agenda job count: ${jobStatus.length}`);
      return jobStatus;
    }
    this.logger.log("Agenda service is not initialized.", "info");
    return null;
  }
  // test service
  testAgandaServer = async () => {
    await this.agendaService.agenda.now("sendCampaignEmail"); // For testing immediately
    await this.agendaService.agenda.now("expire old campaigns"); // Similarly for expiration
  };
}

export default EmailMarketingJobManager;
