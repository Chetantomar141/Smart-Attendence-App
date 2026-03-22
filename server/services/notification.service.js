import nodemailer from 'nodemailer';
import twilio from 'twilio';
import db from '../models/index.js';
const Notification = db.notifications;

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Configure Twilio
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

/**
 * Send Email Notification
 */
export const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email credentials not configured. Skipping email.');
      return;
    }

    const mailOptions = {
      from: `"Smart School" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Send SMS Notification
 */
export const sendSMS = async (to, message) => {
  try {
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
      console.log('Twilio not configured. Skipping SMS:', message);
      return;
    }

    const response = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    console.log('SMS sent: %s', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

/**
 * Create In-App Notification
 */
export const createNotification = async (userId, title, message, type = 'notice') => {
  try {
    return await Notification.create({
      userId,
      title,
      message,
      type,
      isRead: false
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

/**
 * Send Multi-channel Notification to Parent
 */
export const notifyParent = async (student, parent, title, message, type) => {
  try {
    // 1. In-app notification for Parent
    if (parent) {
      await createNotification(parent.id, title, message, type);
    }

    // 2. Email notification
    if (parent?.email) {
      await sendEmail(
        parent.email,
        title,
        `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">${title}</h2>
          <p>Hello ${parent.name},</p>
          <p>${message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated notification from Smart School Management System.</p>
        </div>`
      );
    }
  } catch (error) {
    console.error('Error notifying parent:', error);
  }
};
