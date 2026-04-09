import amqplib from 'amqplib';
import { RABBITMQ_URL } from "../../../configs/env,configs";
import { EmailSchema } from '../../../notification/core/mail/schemas.mail';
import { z } from '@hono/zod-openapi';

export type MailBodyDTO = z.infer<typeof EmailSchema>;

/**
 * Sends an email payload to the RabbitMQ queue.
 */
export const mailBroker = async (data: MailBodyDTO) => {
    let connection;
    try {
        if (!RABBITMQ_URL) {
            throw new Error("RABBITMQ_URL is missing.");
        }

        // 1. Connect and create a channel
        connection = await amqplib.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // 2. Ensure the queue exists (matches your consumer's settings)
        const queue = 'email_queue';
        await channel.assertQueue(queue, { durable: true });

        // 3. Send the message
        // Convert the object to a Buffer. persistent: true ensures the message 
        // survives a RabbitMQ restart.
        const messageSent = channel.sendToQueue(
            queue, 
            Buffer.from(JSON.stringify(data)), 
            { persistent: true }
        );

        if (messageSent) {
            console.log(`[Queue] Message sent to ${queue}`);
        }

        // 4. Close the channel and connection
        await channel.close();
    } catch (error) {
        console.error("error in mailBroker producer:", error);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};