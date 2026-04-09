import { HTTPException } from "hono/http-exception";
import type { createContactDTO, contactResponseDTO } from "./dto.contact";
import type { MailBodyDTO } from "./message.contact";
import { mailBroker } from "./message.contact";

export class ContactService {
    async sendMessage(data: createContactDTO) {
        try {
            // 1. Map your Contact DTO to the Email Schema shape
            // This ensures the broker receives exactly what the consumer expects
            const emailPayload: MailBodyDTO = {
                to: ["info@partcentral.com"],
                subject: `[${data.category?.toUpperCase() || 'GENERAL'}] New Contact from ${data.name}`,
                // Change 'body' to 'text'
                text: `
            Name: ${data.name}
            Email: ${data.email}
            Phone: ${data.phone || 'N/A'}
            Category: ${data.category || 'General'}

            Message: 
            ${data.message}
                `.trim(),
            };

            // 2. Offload the heavy lifting to the background worker via RabbitMQ
            await mailBroker(emailPayload);

            // 3. Return a success response
            return {
                success: true,
                message: "Your message has been queued for delivery."
            };

        } catch (error) {
            console.error(`ContactService Error: ${error}`);

            // 4. Use Hono's HTTPException for clean API errors
            throw new HTTPException(500, {
                message: "Failed to process contact request. Please try again later."
            });
        }
    }
}