const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendAlertEmail(user, alert, sensor) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: `🚨 EcoGuard Alert: ${alert.severity.toUpperCase()} - ${sensor.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1>🌍 EcoGuard Pro Alert</h1>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #dc3545; margin-top: 0;">⚠️ ${alert.severity.toUpperCase()} Alert</h2>
              
              <p><strong>Sensor:</strong> ${sensor.name}</p>
              <p><strong>Location:</strong> ${sensor.location_name}</p>
              <p><strong>Message:</strong> ${alert.message}</p>
              <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
              
              <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <strong>Action Required:</strong> Please check your EcoGuard dashboard and take appropriate action.
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.FRONTEND_URL}/alerts" 
                   style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  View Dashboard
                </a>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
            <p>EcoGuard Pro - Environmental Monitoring System</p>
            <p>To unsubscribe from alerts, visit your dashboard settings.</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Alert email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send alert email:', error);
    }
  }

  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: user.email,
      subject: '🌍 Welcome to EcoGuard Pro!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1>🌍 Welcome to EcoGuard Pro!</h1>
            <p>Your Environmental Monitoring Journey Starts Here</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2>Hello ${user.first_name}!</h2>
            
            <p>Thank you for joining EcoGuard Pro. You're now part of a community dedicated to environmental monitoring and sustainability.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>🚀 Get Started:</h3>
              <ul>
                <li>Set up your first sensor</li>
                <li>Configure alert thresholds</li>
                <li>Explore AI-powered analytics</li>
                <li>Connect IoT devices</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" 
                 style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Access Your Dashboard
              </a>
            </div>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }
}

module.exports = new EmailService();