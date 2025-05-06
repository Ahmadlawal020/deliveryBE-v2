const { MailtrapClient } = require("mailtrap");

const mailtrapClient = new MailtrapClient({
  endpoint: process.env.MAILTRAP_ENDPOINT,
  token: process.env.MAILTRAP_TOKEN,
});

const sender = {
  email: "hello@demomailtrap.co",
  name: "Ahmad Lawal",
};

module.exports = {
  mailtrapClient,
  sender,
};
