# F.I.N.E Riders Order Email Setup

GitHub Pages cannot send emails by itself. Use this small Google Apps Script endpoint to send the order email to the F.I.N.E inbox and a confirmation copy to the buyer.

## 1. Create the email endpoint

1. Go to https://script.google.com/
2. Create a new project.
3. Replace the starter code with the contents of `order-email-apps-script.gs`.
4. Change `ORDER_INBOX` at the top of the script to your real order inbox.
5. Click **Deploy** > **New deployment**.
6. Choose **Web app**.
7. Set **Execute as** to **Me**.
8. Set **Who has access** to **Anyone**.
9. Authorise the script when Google asks.
10. Copy the Web app URL ending in `/exec`.

## 2. Connect the website

In `site-data.js`, update:

```js
orders: {
  email: "your-order-inbox@example.com",
  endpoint: "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE",
  subjectPrefix: "F.I.N.E Riders merch order",
  confirmationSubject: "Your F.I.N.E Riders order",
},
```

Then commit and push the site.

## Notes

- If `endpoint` is blank, checkout still works with the manual email button.
- If `endpoint` is set, checkout submits the order automatically and keeps the buttons as backups.
- Google Apps Script email sending has daily quota limits, so check your quota if orders ever stop sending.
