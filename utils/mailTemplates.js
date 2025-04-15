import nodemailer from 'nodemailer';

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    // secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});


export const sendRegistrationEmail = async (name, email) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Welcome to Rajdoot! Your Account is Ready',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://res.cloudinary.com/dvo4tvvgb/image/upload/v1742487122/samples/logo/lmx9xvmsfffxr366k784.png" alt="Rajdoot Logo" style="max-width: 150px;">
                </div>
                <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db;">
                    <h1 style="color: #2c3e50; text-align: center;">Welcome, ${name}!</h1>
                    <p style="font-size: 16px; line-height: 1.6; color: #555;">
                        Thank you for registering with Rajdoot using the email <strong>${email}</strong>. 
                        We're thrilled to have you on board!
                    </p>
                    <p style="font-size: 16px; line-height: 1.6; color: #555;">
                        Your account has been successfully created and you can now access all the features of our platform.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://rajdoot.parminder.info/login" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                            Access Your Account
                        </a>
                    </div>
                    <p style="font-size: 16px; line-height: 1.6; color: #555;">
                        Here's what you can do next:
                    </p>
                    <ul style="font-size: 16px; line-height: 1.6; color: #555; padding-left: 20px;">
                        <li>Complete your profile</li>
                        <li>Explore our features</li>
                        <li>Start your journey with us</li>
                    </ul>
                    <p style="font-size: 16px; line-height: 1.6; color: #555; margin-top: 20px;">
                        If you didn't request this registration or need any help, please reply to this email.
                    </p>
                </div>
                <div style="text-align: center; margin-top: 30px; font-size: 14px; color: #777;">
                    <p>Thank you for choosing Rajdoot!</p>
                    <p style="margin-top: 5px; font-size: 12px; color: #999;">
                        &copy; ${new Date().getFullYear()} Rajdoot. All rights reserved.<br>
                        Parminder Info Systems Pvt. Ltd.
                    </p>
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};
