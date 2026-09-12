import { json } from '@sveltejs/kit';
import { sendInvites } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const body = await request.json();
	const { guest_id, occasion_name, email, guest_name } = body;

	if (!guest_id || !occasion_name || !email) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	try {
		const result = await sendInvites([{
			guest_id,
			occasion_name,
			email,
			status: 'sent',
			sent_at: new Date().toISOString()
		}]);

		if (result.error) {
			return json({ error: result.error.message }, { status: 500 });
		}

		// Email sending hook — configure your provider here
		// Options:
		// 1. Resend: npm install resend, then `import { Resend } from 'resend'`
		// 2. SendGrid: npm install @sendgrid/mail
		// 3. SMTP: npm install nodemailer
		//
		// Example with Resend:
		// const resend = new Resend(process.env.RESEND_API_KEY);
		// await resend.emails.send({
		//   from: 'Guest List <onboarding@resend.dev>',
		//   to: email,
		//   subject: `You're invited: ${occasion_name}`,
		//   html: `<p>Hi ${guest_name},</p><p>You're invited to ${occasion_name}!</p>`
		// });

		return json({ success: true, invitation_id: result.data?.id });
	} catch (err) {
		return json({ error: err.message }, { status: 500 });
	}
}
