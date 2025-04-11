// jobs/EmailMarketingJob.js
const AgendaService = require("../services/AgendaService");
const databaseManager = require("../database/ConnectionManager");
const Logger = require("../utils/logger");

class EmailMarketingJob extends Logger {
  constructor() {
    super();
    this.agendaService = null;
    this.agenda = null;
  }

  async init() {
    this._startJob();
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
      await this.agendaService.startAgendaJobs();

      this.log("Email marketing jobs successfully started.");
    } catch (error) {
      // Error handling and logging
      this.log(`Error in EmailMarketingJob: ${error.message}`, "error");
    }
  }

  async stopJob() {
    try {
      // Gracefully stop the agenda jobs and the service
      if (this.agendaService) {
        await this.agendaService.agenda.stop();
        this.log("Agenda jobs successfully stopped.");
      } else {
        this.log("Agenda service was not initialized. No jobs to stop.");
      }
    } catch (error) {
      this.log(`Error stopping agenda jobs: ${error}`, "error");
    }
  }

  // Optionally, we can add a method to check job status
  async checkJobStatus() {
    if (this.agendaService && this.agendaService.agenda) {
      const jobStatus = await this.agendaService.agenda.jobs();
      this.log(`Current Agenda job count: ${jobStatus.length}`);
      return jobStatus;
    }
    this.log("Agenda service is not initialized.");
    return null;
  }
}

module.exports = EmailMarketingJob;
