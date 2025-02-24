// Utility function to convert a Base64 string to a Uint8Array
const urlBase64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

// Function to send the subscription to your backend
const saveSubscription = async (subscription) => {
  const response = await fetch('https://pushnotification-xlfw.onrender.com/push/save-subscription', {
    method: 'POST',
    headers: { 'Content-Type': "application/json" },
    body: JSON.stringify(subscription)
  });
  return response.json();
};

// On activation, subscribe for push notifications and send the subscription to the backend.
self.addEventListener("activate", async (e) => {
  // Claim clients immediately so that the SW starts controlling pages ASAP.
  await self.clients.claim();
  try {
    const subscription = await self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array("BOxQw0Dp3HXA1b7K2c2ETELVCVXdCBkMk_JbZPB-yZTx4o2SOyX8NO2Jai6kEyLntFaMwqppRtB-eOoRIDw7YAo")
    });
    const response = await saveSubscription(subscription);
    console.log("Subscription saved on activation:", response);
  } catch (err) {
    console.error("Subscription failed during activation:", err);
  }
});

// Listen for push events and display a notification.
self.addEventListener("push", event => {
  const payload = event.data.json();
  console.log("Push event received:", payload);

  const options = {
    body: payload.body,
    icon: "/resources/images/favicon-dark.ico" // Update the icon URL as needed
  };

  event.waitUntil(
    self.registration.showNotification("This is notification", options)
  );
});
