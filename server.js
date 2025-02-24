const express = require("express");
const webPush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Replace with your generated VAPID keys
const vapidKeys = {
    publicKey: "BOxQw0Dp3HXA1b7K2c2ETELVCVXdCBkMk_JbZPB-yZTx4o2SOyX8NO2Jai6kEyLntFaMwqppRtB-eOoRIDw7YAo",
    privateKey: "8ko7exxtldHspWYpNo9A4sBCcpUTTv-eRNO4ykuDVX8"  // Replace with your private key
};

webPush.setVapidDetails(
    "mailto:vishalkrmahatha362000@gmail.com", // Replace with your email
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// In-memory store for subscriptions (for production, use a persistent database)
let subscriptions = [];

// Endpoint to receive and save a new subscription
app.post("/push/save-subscription", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  console.log("New subscription received:", subscription);
  res.status(201).json({ message: "Subscription saved successfully" });
});

// Endpoint to trigger sending a notification to all subscribers
app.post("/push/send-notification", (req, res) => {
  const notificationPayload = JSON.stringify({
    title: "New Notification",
    body: "This is a test notification sent from the server!"
  });

  const promises = subscriptions.map(subscription =>
    webPush.sendNotification(subscription, notificationPayload)
      .catch(error => {
        console.error("Error sending notification to a subscriber:", error);
      })
  );

  Promise.all(promises)
    .then(() => res.status(200).json({ message: "Notifications sent successfully" }))
    .catch(error => {
      console.error("Error sending notifications:", error);
      res.sendStatus(500);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
