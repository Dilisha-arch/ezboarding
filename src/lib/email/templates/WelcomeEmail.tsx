import * as React from 'react';
import { Html, Body, Container, Heading, Text, Button, Hr } from '@react-email/components';

interface WelcomeEmailProps {
    name: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ name }) => {
    return (
        <Html>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>Welcome to ezboarding, {name}!</Heading>
                    <Text style={text}>
                        We&apos;re thrilled to have you on board. ezboarding connects you directly with students searching for reliable accommodation near their universities.
                    </Text>
                    <Text style={text}>
                        You can now start creating listings for your boarding rooms, hostels, annexes, or houses.
                    </Text>
                    <Button href="https://ezboarding.lk/dashboard" style={button}>
                        Go to Dashboard
                    </Button>
                    <Hr style={hr} />
                    <Text style={footer}>
                        ezboarding — Sri Lanka Student Accommodation<br />
                        To stop receiving these marketing emails, you can unsubscribe in your account settings.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default WelcomeEmail;

// --- Shared Styles matching the Design Guidelines ---
const main = { backgroundColor: '#ffffff', fontFamily: 'sans-serif' };
const container = { margin: '0 auto', padding: '20px', maxWidth: '600px' };
const heading = { color: '#1D4ED8', fontSize: '24px', fontWeight: 'bold' };
const text = { color: '#1F2937', fontSize: '16px', lineHeight: '24px' };
const button = { backgroundColor: '#1D4ED8', color: '#ffffff', padding: '12px 20px', borderRadius: '5px', textDecoration: 'none', display: 'inline-block', marginTop: '10px', marginBottom: '20px' };
const hr = { borderColor: '#e5e7eb', margin: '20px 0' };
const footer = { color: '#6B7280', fontSize: '12px', textAlign: 'center' as const };