import dotenv from 'dotenv';

dotenv.config();

export default function NodemailerConfig() {
	return {
		service: process.env.EMAIL_SERVICE!,
		auth: {
			user: process.env.EMAIL!,
			pass: process.env.EMAIL_PASSWORD!,
		},
	};
}
