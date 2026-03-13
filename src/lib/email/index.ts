import { Resend } from 'resend';
import { env } from '@/env';
import * as React from 'react';

// Import Templates
import WelcomeEmail from './templates/WelcomeEmail';
import ListingRejectedEmail from './templates/ListingRejectedEmail';
// Assume these are also created following the same pattern:
// import ListingApprovedEmail from './templates/ListingApprovedEmail';
// import ListingSubmittedEmail from './templates/ListingSubmittedEmail';
// import ListingSuspendedEmail from './templates/ListingSuspendedEmail';

const resend = new Resend(env.RESEND_API_KEY);
const FROM_ADDRESS = 'bodim.lk <noreply@bodim.lk>';

/**
 * Helper to execute email sending safely using a fire-and-forget pattern.
 * It will log errors but will never throw, preventing disruption to the main UX flow.
 */
async function sendSafeEmail(options: { to: string; subject: string; react: React.ReactElement }) {
    try {
        const response = await resend.emails.send({
            from: FROM_ADDRESS,
            to: options.to,
            subject: options.subject,
            react: options.react,
        });

        if (response.error) {
            console.error('[RESEND_API_ERROR]', response.error);
        }
        return response;
    } catch (error) {
        console.error('[EMAIL_SEND_CRITICAL_ERROR]', error);
        return { error };
    }
}

export const sendEmail = {
    async welcome({ to, name }: { to: string; name: string }) {
        return sendSafeEmail({
            to,
            subject: 'Welcome to bodim.lk — start listing your property',
            react: React.createElement(WelcomeEmail, { name }),
        });
    },

    async listingSubmitted({ to, propertyTitle }: { to: string; propertyTitle: string }) {
        return sendSafeEmail({
            to,
            subject: 'Your listing is under review — bodim.lk',
            react: React.createElement('div', null, `Your listing "${propertyTitle}" has been submitted for review.`), // Replace with actual component
        });
    },

    async listingApproved({ to, propertyTitle, listingUrl }: { to: string; propertyTitle: string; listingUrl: string }) {
        return sendSafeEmail({
            to,
            subject: 'Your listing is now live on bodim.lk',
            react: React.createElement('div', null, `Great news! "${propertyTitle}" is now live. View it here: ${listingUrl}`), // Replace with actual component
        });
    },

    async listingRejected({ to, propertyTitle, reason }: { to: string; propertyTitle: string; reason: string }) {
        return sendSafeEmail({
            to,
            subject: 'Action needed: your bodim.lk listing needs changes',
            react: React.createElement(ListingRejectedEmail, { propertyTitle, reason }),
        });
    },

    async listingSuspended({ to, propertyTitle, reason }: { to: string; propertyTitle: string; reason: string }) {
        return sendSafeEmail({
            to,
            subject: 'Your listing has been suspended — bodim.lk',
            react: React.createElement('div', null, `Your listing "${propertyTitle}" was suspended. Reason: ${reason}`), // Replace with actual component
        });
    },

    async listingResubmitted({ to, propertyTitle }: { to: string; propertyTitle: string }) {
        return sendSafeEmail({
            to,
            subject: 'Your listing has been resubmitted for review — bodim.lk',
            react: React.createElement('div', null, `Your listing "${propertyTitle}" has been resubmitted for review.`), 
        });
    },
};