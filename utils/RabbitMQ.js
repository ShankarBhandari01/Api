// RabbitMQ.js
import { connect as _connect } from 'amqplib';

class RabbitMQ {
  constructor({ url, logger }) {
    this.url = url || 'amqp://localhost:5672';
    this.connection = null;
    this.channel = null;
    this.logger = logger
  }

  async connect() {
    if (this.connection) return;

    this.connection = await _connect(this.url);
    this.channel = await this.connection.createChannel();
    this.logger.log('[RabbitMQ] RabbitMQ connected');
  }

  async publish(queue, message) {
    if (!this.channel) throw new Error('[RabbitMQ] RabbitMQ channel not initialized');
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  }

  async consume(queue, handler) {
    if (!this.channel) throw new Error('[RabbitMQ] RabbitMQ channel not initialized');
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.prefetch(1);

    this.channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        try {
          await handler(content);
          this.channel.ack(msg);
        } catch (err) {
          this.logger.log('[RabbitMQ] Error processing message:', 'error');
          this.channel.nack(msg, false, true); // retry
        }
      }
    });
  }

  async close() {
    this.logger.log("[RabbitMQ] RabbitMQ connections closed.", "info");
    await this.channel?.close();
    await this.connection?.close();
  }
}

export default RabbitMQ;
