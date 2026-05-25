# F.I.N.E Riders Order Email Setup

GitHub Pages cannot send emails by itself. Use this small Google Apps Script endpoint to send the order email to the F.I.N.E inbox and a confirmation copy to the buyer.

## 1. Create the email endpoint

1. Go to https://script.google.com/
2. Create a new project.
3. Replace the starter code with the contents of `order-email-apps-script.gs`.
4. Change `ORDER_INBOX` at the top of the script to your real order inbox.
5. Check `SITE_URL` points to a public image folder. It is currently set to the raw GitHub repo files, which works when the repo is public and pushed.
6. Click **Deploy** > **New deployment**.
7. Choose **Web app**.
8. Set **Execute as** to **Me**.
9. Set **Who has access** to **Anyone**.
10. Authorise the script when Google asks.
11. Copy the Web app URL ending in `/exec`.

## 2. Test the endpoint

Open your Web app URL with `?test=1` on the end:

```text
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?test=1
```

You should receive a test email at `ORDER_INBOX`.

If you do not receive that test email:

- Check `ORDER_INBOX` is your real email address.
- Click **Deploy** > **Manage deployments** > edit the deployment > choose **New version** > **Deploy**.
- Make sure **Execute as** is **Me**.
- Make sure **Who has access** is **Anyone**.
- In Apps Script, open **Executions** to see the error message.

## 3. Connect the website

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
- The branded email uses remote images. Some email apps hide images until the reader taps "show images".
- Google Apps Script email sending has daily quota limits, so check your quota if orders ever stop sending.
