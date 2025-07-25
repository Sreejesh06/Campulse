const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  async initialize() {
    try {
      // Create transporter
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      // Verify connection
      if (process.env.NODE_ENV !== 'development') {
        await this.transporter.verify();
        console.log('Email service initialized successfully');
      }
    } catch (error) {
      console.error('Email service initialization failed:', error);
    }
  }

  // Send welcome email to new users
  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: `"CampusLink" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Welcome to CampusLink!',
        html: this.getWelcomeEmailTemplate(user)
      };

      if (this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
      }
      
      return { success: false, error: 'Email service not available' };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send announcement notification
  async sendAnnouncementNotification(announcement, recipients) {
    try {
      const mailOptions = {
        from: `"CampusLink Announcements" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: recipients.map(user => user.email).join(','),
        subject: `New Announcement: ${announcement.title}`,
        html: this.getAnnouncementEmailTemplate(announcement)
      };

      if (this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Announcement email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
      }

      return { success: false, error: 'Email service not available' };
    } catch (error) {
      console.error('Error sending announcement email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send complaint status update
  async sendComplaintStatusUpdate(complaint, user) {
    try {
      const mailOptions = {
        from: `"CampusLink Support" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: user.email,
        subject: `Complaint Update: ${complaint.title}`,
        html: this.getComplaintUpdateEmailTemplate(complaint)
      };

      if (this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Complaint update email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
      }

      return { success: false, error: 'Email service not available' };
    } catch (error) {
      console.error('Error sending complaint update email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send lost item match notification
  async sendLostItemMatchNotification(lostItem, foundItem, user) {
    try {
      const mailOptions = {
        from: `"CampusLink Lost & Found" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Possible Match Found for Your Lost Item',
        html: this.getLostItemMatchEmailTemplate(lostItem, foundItem)
      };

      if (this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Lost item match email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
      }

      return { success: false, error: 'Email service not available' };
    } catch (error) {
      console.error('Error sending lost item match email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"CampusLink Security" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Password Reset Request',
        html: this.getPasswordResetEmailTemplate(user, resetUrl)
      };

      if (this.transporter) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
      }

      return { success: false, error: 'Email service not available' };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  // Email templates
  getWelcomeEmailTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to CampusLink!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.firstName} ${user.lastName}!</h2>
            <p>Welcome to CampusLink - your centralized student utility hub! We're excited to have you on board.</p>
            
            <h3>What you can do with CampusLink:</h3>
            <ul>
              <li>📢 Stay updated with campus announcements</li>
              <li>🔍 Report and find lost items</li>
              <li>📅 Manage your class timetable</li>
              <li>🏠 Submit hostel complaints</li>
              <li>🤖 Get help from our AI assistant</li>
            </ul>
            
            <p>Your account has been successfully created with the following details:</p>
            <ul>
              <li><strong>Email:</strong> ${user.email}</li>
              <li><strong>Student ID:</strong> ${user.studentId || 'N/A'}</li>
              <li><strong>Department:</strong> ${user.department || 'N/A'}</li>
              <li><strong>Role:</strong> ${user.role}</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
            
            <p>If you have any questions or need help getting started, feel free to reach out to our support team.</p>
            
            <p>Best regards,<br>The CampusLink Team</p>
          </div>
          <div class="footer">
            <p>This email was sent from CampusLink. If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAnnouncementEmailTemplate(announcement) {
    const priorityColors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      urgent: '#dc3545'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${priorityColors[announcement.priority]}; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .priority-badge { display: inline-block; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .category-badge { display: inline-block; padding: 5px 10px; background: #e9ecef; border-radius: 15px; font-size: 12px; margin-left: 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 New Announcement</h1>
            <span class="priority-badge" style="background: rgba(255,255,255,0.2);">${announcement.priority} Priority</span>
            <span class="category-badge">${announcement.category}</span>
          </div>
          <div class="content">
            <h2>${announcement.title}</h2>
            <p>${announcement.content}</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Posted by:</strong> CampusLink Admin</p>
              <p><strong>Date:</strong> ${new Date(announcement.createdAt).toLocaleDateString()}</p>
              <p><strong>Category:</strong> ${announcement.category}</p>
            </div>
            
            <a href="${process.env.FRONTEND_URL}/announcements" class="button">View All Announcements</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getComplaintUpdateEmailTemplate(complaint) {
    const statusColors = {
      pending: '#ffc107',
      acknowledged: '#17a2b8',
      'in-progress': '#fd7e14',
      resolved: '#28a745',
      closed: '#6c757d',
      rejected: '#dc3545'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColors[complaint.status]}; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { display: inline-block; padding: 5px 15px; background: ${statusColors[complaint.status]}; color: white; border-radius: 15px; font-size: 14px; font-weight: bold; text-transform: uppercase; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔧 Complaint Update</h1>
          </div>
          <div class="content">
            <h2>Update on your complaint: ${complaint.title}</h2>
            
            <div style="text-align: center; margin: 20px 0;">
              <span class="status-badge">${complaint.status}</span>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3>Complaint Details:</h3>
              <p><strong>ID:</strong> #${complaint._id.toString().slice(-8)}</p>
              <p><strong>Category:</strong> ${complaint.category}</p>
              <p><strong>Location:</strong> ${complaint.formattedLocation}</p>
              <p><strong>Priority:</strong> ${complaint.priority}</p>
              <p><strong>Reported:</strong> ${new Date(complaint.createdAt).toLocaleDateString()}</p>
            </div>
            
            ${complaint.resolution?.description ? `
              <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4>Resolution Details:</h4>
                <p>${complaint.resolution.description}</p>
              </div>
            ` : ''}
            
            <a href="${process.env.FRONTEND_URL}/complaints/${complaint._id}" class="button">View Complaint Details</a>
            
            <p>Thank you for using CampusLink complaint system. We appreciate your patience.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getLostItemMatchEmailTemplate(lostItem, foundItem) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .item-card { background: white; padding: 20px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745; }
          .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Possible Match Found!</h1>
          </div>
          <div class="content">
            <h2>Great news! We found a potential match for your lost item.</h2>
            
            <div class="item-card">
              <h3>Your Lost Item:</h3>
              <p><strong>Title:</strong> ${lostItem.title}</p>
              <p><strong>Description:</strong> ${lostItem.description}</p>
              <p><strong>Last Seen:</strong> ${lostItem.location.lastSeen}</p>
              <p><strong>Date Lost:</strong> ${new Date(lostItem.dateLostFound).toLocaleDateString()}</p>
            </div>
            
            <div class="item-card">
              <h3>Possible Match (Found Item):</h3>
              <p><strong>Title:</strong> ${foundItem.title}</p>
              <p><strong>Description:</strong> ${foundItem.description}</p>
              <p><strong>Found At:</strong> ${foundItem.location.lastSeen}</p>
              <p><strong>Date Found:</strong> ${new Date(foundItem.dateLostFound).toLocaleDateString()}</p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Review the found item details carefully</li>
              <li>Contact the finder if you believe it's your item</li>
              <li>Arrange a meetup in a public campus location</li>
              <li>Verify the item is yours before claiming</li>
            </ol>
            
            <a href="${process.env.FRONTEND_URL}/lost-found/${foundItem._id}" class="button">View Found Item</a>
            
            <p><em>Remember to bring identification and any proof of ownership when claiming your item.</em></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetEmailTemplate(user, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.firstName}!</h2>
            <p>We received a request to reset your password for your CampusLink account.</p>
            
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
            
            <p>To reset your password, click the button below:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This link will expire in 1 hour for security reasons</li>
              <li>You can only use this link once</li>
              <li>If you don't reset your password within 1 hour, you'll need to request a new reset link</li>
            </ul>
            
            <p>If you continue to have trouble accessing your account, please contact our support team.</p>
            
            <p>Best regards,<br>The CampusLink Security Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
