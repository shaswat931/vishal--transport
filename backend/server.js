// backend/server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000; // Backend will run on port 5000 or specified PORT

// --- Middleware ---
app.use(cors({
    origin: 'https://vishal-transport.netlify.app/', // IMPORTANT: Replace with the actual origin of your frontend
    // If you're using Live Server in VS Code, it's usually http://127.0.0.1:5500 or http://localhost:5500.
    // In production, this would be your website's domain (e.g., 'https://www.vishaltransport.in').
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded request bodies (for forms)

// --- Nodemailer Transporter Setup ---
// Configure your email service (e.g., Gmail, Outlook, your custom SMTP)
// For Gmail, you might need to use "App passwords" if you have 2FA enabled.
// See: https://support.google.com/accounts/answer/185833
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com', // e.g., 'smtp.gmail.com' for Gmail
    port: process.env.EMAIL_PORT || 587, // 587 for TLS, 465 for SSL
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Your sending email address (e.g., your_email@gmail.com)
        pass: process.env.EMAIL_PASS, // Your email password or App Password
    },
});

// Verify transporter connection (optional, good for debugging)
transporter.verify((error, success) => {
    if (error) {
        console.error('Nodemailer transporter verification failed:', error);
    } else {
        console.log('Nodemailer transporter is ready to send emails');
    }
});


// --- API Endpoints ---

// Root endpoint for testing
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Vishal Transport Backend is running!' });
});

// 1. Endpoint for Booking Form Submissions
app.post('/api/booking', async (req, res) => {
    const { name, email, phone, pickup, destination, date, time, serviceType, message } = req.body;

    // Basic validation
    if (!name || !email || !pickup || !destination) {
        return res.status(400).json({ success: false, message: 'Required booking fields are missing.' });
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: process.env.RECIPIENT_EMAIL, // Your email to receive notifications
            subject: `New Booking Request from ${name} - Vishal Transport`,
            html: `
                <h2>New Booking Request</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <p><strong>Pickup Location:</strong> ${pickup}</p>
                <p><strong>Destination:</strong> ${destination}</p>
                <p><strong>Preferred Date:</strong> ${date || 'N/A'}</p>
                <p><strong>Preferred Time:</strong> ${time || 'N/A'}</p>
                <p><strong>Service Type:</strong> ${serviceType || 'N/A'}</p>
                <p><strong>Additional Notes:</strong> ${message || 'N/A'}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Booking email sent successfully!');
        res.status(200).json({ success: true, message: 'Booking request sent successfully!' });

    } catch (error) {
        console.error('Error sending booking email:', error);
        res.status(500).json({ success: false, message: 'Failed to send booking request.', error: error.message });
    }
});

// 2. Endpoint for Contact Form Submissions
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Required contact fields are missing.' });
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: process.env.RECIPIENT_EMAIL, // Your email to receive notifications
            subject: `New Contact Message from ${name}: ${subject || 'No Subject'}`,
            html: `
                <h2>New Contact Message</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Contact email sent successfully!');
        res.status(200).json({ success: true, message: 'Your message has been sent successfully!' });

    } catch (error) {
        console.error('Error sending contact email:', error);
        res.status(500).json({ success: false, message: 'Failed to send your message.', error: error.message });
    }
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Remember to start your frontend on its correct port (e.g., 5500 for Live Server).');
});
