import * as React from 'react';
import { Html, Body, Container, Heading, Text, Button, Hr } from '@react-email/components';

interface ListingRejectedEmailProps {
    propertyTitle: string;
    reason: string;
}

export const ListingRejectedEmail: React.FC<ListingRejectedEmailProps> = ({ propertyTitle, reason }) => {
    return (
        <Html>
            <Body style={{ backgroundColor: '#ffffff', fontFamily: 'sans-serif' }}>
                <Container style={{ margin: '0 auto', padding: '20px', maxWidth: '600px' }}>
                    <Heading style={{ color: '#1D4ED8', fontSize: '24px', fontWeight: 'bold' }}>
                        Action needed for your listing
                    </Heading>
                    <Text style={{ color: '#1F2937', fontSize: '16px', lineHeight: '24px' }}>
                        Thank you for submitting &quot;<strong>{propertyTitle}</strong>&quot; to ezboarding.
                        Unfortunately, our moderation team cannot approve it in its current state. Please review the feedback below:
                    </Text>

                    <blockquote style={{ borderLeft: '4px solid #ef4444', backgroundColor: '#fef2f2', padding: '12px 16px', margin: '20px 0', color: '#1F2937', fontStyle: 'italic' }}>
                        {reason}
                    </blockquote>

                    <Text style={{ color: '#1F2937', fontSize: '16px', lineHeight: '24px' }}>
                        You can easily update your listing with the required changes and resubmit it for review from your dashboard.
                    </Text>
                    <Button href="https://ezboarding.lk/dashboard" style={{ backgroundColor: '#1D4ED8', color: '#ffffff', padding: '#12px 20px', borderRadius: '#5px', textDecoration: '#none', display: '#inline-block', marginTop: '#10px', marginBottom: '#20px' }}>
                        Edit Listing
                    </Button>
                    <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
                    <Text style={{ color: '#6B7280', fontSize: '12px', textAlign: 'center' }}>
                        ezboarding — Sri Lanka Student Accommodation
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default ListingRejectedEmail;