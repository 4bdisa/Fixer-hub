export const sendJobRequest = async ({ customerEmail, providerEmail, jobId }) => {
    const acceptLink = `${process.env.BASE_URL}/api/jobs/${jobId}/accept`;
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: providerEmail,
      subject: 'New Job Request',
      html: `
        <h3>New Job Request from ${customerEmail}</h3>
        <p>You can accept this job by clicking the link below:</p>
        <a href="${acceptLink}">Accept Job</a>
        <p>Or respond with your proposal:</p>
        <form action="${acceptLink}" method="POST">
          <input type="number" name="proposedPrice" placeholder="Your proposed price" />
          <button type="submit">Submit Proposal</button>
        </form>
      `
    };
  
    await transporter.sendMail(mailOptions);
  };