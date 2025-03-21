const nodemailer = require('nodemailer');
const WaitList = require('../models/waitListModel');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    // secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const waitlistController = {
    // Function to join the waitlist
    joinWaitlist: async (req, res) => {
        try {
            const { email } = req.body;

            // Validate input
            if (!email) {
                return res.status(400).json({ success: false, message: 'email are required' });
            }

            // Check if user is already on the waitlist
            const existingUser = await WaitList.findOne({ email: email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'You are already on the waitlist' });
            }
            const newWaitlistEntry = await WaitList.create({ email: email, status: "pending" });

            // Send confirmation email
            await sendWaitlistConfirmationEmail(email);

            return res.status(201).json({
                success: true,
                message: 'Successfully joined waitlist',
                // position: position
            });

        } catch (error) {
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // Function to approve user from waitlist
    approveUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const { status } = req.body;

            // Validate input
            if (!userId) {
                return res.status(400).json({ success: false, message: 'User ID is required' });
            }

            // Find user in waitlist
            const waitlistUser = await WaitList.findById(userId);

            if (!waitlistUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Update user status (implementation depends on your data model)
            waitlistUser.status=status;
            await waitlistUser.save();

            // Send approval email
            await sendApprovalEmail(waitlistUser.email);

            return res.status(200).json({
                success: true,
                message: 'User approved and notified'
            });

        } catch (error) {
            console.error('Error approving user:', error);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // Get waitlist
    getWaitlist: async (req, res) => {
        try {
            const waitlist = await WaitList.find({}).sort({ createdAt: 1 }); // Sort by registration time

            return res.status(200).json({
                success: true,
                count: waitlist.length,
                data: waitlist
            });

        } catch (error) {
            console.error('Error fetching waitlist:', error);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }
};

// Function to send waitlist confirmation email
const sendWaitlistConfirmationEmail = async (email) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'You\'re on the Waitlist!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://res.cloudinary.com/dvo4tvvgb/image/upload/v1742487122/samples/logo/lmx9xvmsfffxr366k784.png" alt="Logo" style="max-width: 150px;">
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <h1 style="color: #333; text-align: center;">Welcome to Our Waitlist!</h1>
                    <p style="font-size: 16px; line-height: 1.6; color: #555;">
                        Hello ${email},
                    </p>
                    <p style="font-size: 16px; line-height: 1.6; color: #555;">
                        Thank you for joining our waitlist! We're thrilled to have you on board.
                        We'll notify you as soon as we're ready to welcome you to our platform.
                    </p>
                    <p style="font-size: 16px; line-height: 1.6; color: #555;">
                        In the meantime, follow us on social media for updates:
                    </p>
                    <div style="text-align: center; margin-top: 15px;">
                        <a href="https://www.linkedin.com/in/parminder-singh-storm/" style="margin: 0 10px; text-decoration: none;">
                            <img src="https://res.cloudinary.com/dvo4tvvgb/image/upload/v1742487121/samples/logo/k0bg0tgz3khcvg0vnvhb.png" alt="Linkedin" style="width: 30px; height: 30px;">
                        </a>
                        <a href="https://www.instagram.com/360_parminder/" style="margin: 0 10px; text-decoration: none;">
                            <img src="https://res.cloudinary.com/dvo4tvvgb/image/upload/v1742487122/samples/logo/l0cszr2ze0x6zyv6tlnl.png" alt="Instagram" style="width: 30px; height: 30px;">
                        </a>
                        <a href="https://github.com/360Parminder" style="margin: 0 10px; text-decoration: none;">
                            <img src="https://res.cloudinary.com/dvo4tvvgb/image/upload/v1742487121/samples/logo/bx03fuuuxkogotmztnrz.png" alt="Github" style="width: 30px; height: 30px;">
                        </a>
                        <a href="https://x.com/360parminder" style="margin: 0 10px; text-decoration: none;">
                            <img src="https://res.cloudinary.com/dvo4tvvgb/image/upload/v1742487314/samples/logo/lhfloyhiaivvrcbhvczj.png" alt="X" style="width: 30px; height: 30px;">
                        </a>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
                    <p>&copy; ${new Date().getFullYear()} Rajdoot. All rights reserved.</p>
                    <p>If you didn't sign up for our waitlist, please ignore this email.</p>
                </div>
            </div>
        `
    };
    await transporter.sendMail(mailOptions);
};

// Function to send approval email
const sendApprovalEmail = async (email) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'You\'re In! Access Granted',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://res.cloudinary.com/dvo4tvvgb/image/upload/v1742487122/samples/logo/lmx9xvmsfffxr366k784.png" alt="Logo" style="max-width: 150px;">
                </div>
                <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db;">
                    <h1 style="color: #2c3e50; text-align: center;">Good News, ${email}!</h1>
                    <p style="font-size: 16px; line-height: 1.6; color: #555;">
                        We're excited to let you know that you've been approved from our waitlist!
                    </p>
                    <p style="font-size: 16px; line-height: 1.6; color: #555;">
                        You now have full access to our platform. Click the button below to get started.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://rajdoot.parminder.info" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                            Get Started Now
                        </a>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6; color: #555;">
                        If you have any questions or need assistance, feel free to reply to this email.
                    </p>
                    <p style="font-size: 16px; line-height: 1.6; color: #555;">
                        Welcome aboard!
                    </p>
                </div>
                <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
                    <p>&copy; ${new Date().getFullYear()} Rajdoot. All rights reserved.</p>
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = waitlistController;
