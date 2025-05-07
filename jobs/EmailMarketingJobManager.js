// jobs/EmailMarketingJob.js
import Logger from "../utils/logger.js";
class EmailMarketingJobManager extends Logger {
  constructor({ agendaService, mongoConnectionManager }) {
    super();
    this.agendaService = agendaService;
    this.mongoConnectionManager = mongoConnectionManager;
  }

  async init() {
    await this._startJob();
  }

  async _startJob() {
    try {
      await this.agendaService.initializeAgenda(
        this.mongoConnectionManager.getConnectionString("Mydatabase")
      );
    } catch (error) {
      this.log(`Error in EmailMarketingJob: ${error.message}`, "error");
      return;
    }
  }

  async stopJob() {
    try {
      // Gracefully stop the agenda jobs and the service
      if (this.agendaService) {
        await this.agendaService.agenda.stop();
        this.log("Agenda jobs successfully stopped.", "info");
      } else {
        this.log(
          "Agenda service was not initialized. No jobs to stop.",
          "info"
        );
      }
    } catch (error) {
      this.log(`Error stopping agenda jobs: ${error}`, "error");
    }
  }

  // we can add a method to check job status
  async checkJobStatus() {
    if (this.agendaService && this.agendaService.agenda) {
      const jobStatus = await this.agendaService.agenda.jobs();
      this.log(`Current Agenda job count: ${jobStatus.length}`);
      return jobStatus;
    }
    this.log("Agenda service is not initialized.", "info");
    return null;
  }
}

export default EmailMarketingJobManager;
