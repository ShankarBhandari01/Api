// jobs/EmailMarketingJob.js
const AgendaService = require("../services/AgendaService");
const databaseManager = require("../database/ConnectionManager");
const Logger = require("../utils/logger");

class EmailMarketingJobManager extends Logger {
  constructor() {
    super();
    this.agendaService = null;
  }

  async init() {
    await this._startJob();
  }

  async _startJob() {
    try {
      const dbConnection = await databaseManager.getConnection("Mydatabase");
      if (!dbConnection) {
        throw new Error("Database connection failed. Job cannot be started.");
      }
      this.agendaService = new AgendaService(dbConnection);
      // Initialize Agenda service and start jobs
      await this.agendaService.initializeAgenda();
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

module.exports = EmailMarketingJobManager;
