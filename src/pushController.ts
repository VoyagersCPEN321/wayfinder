import Expo from 'expo-server-sdk';
import * as mongoose from "mongoose";
import { Request, Response } from "express";
import USER, { IUser } from "./models/user";
import SCHEDULE from "./models/schedule";
import { execFile } from 'child_process';
import * as scheduler from 'node-schedule';
import EVENT, { IEvent } from "./models/event";

let ep = require("../voyageurs/eventProcessor");

export class PushController {
  private serverKey: String;

  public getUserPushToken(req: Request) {
    if (req.body.token) {
      console.log(req.body.token);
      USER.update({
        facebookId: req.user.facebookId,
      },
        {
          $set: { expoPushToken: req.body.token },
        }, (err, res) => {
          if (err) {
            this.handleError(err, res);
            return;
          } else {
            console.log(`pushToken ${req.body.token} has been successfully uploaded.`);
          }
        });
      console.log("updated token");
    }
  }
  private handleError(err: any, res: Response) {
    console.log(err);
    res.status(500).json({
      message: err ? err.message : "Unexpected Error, please try again"
    });
  }

  public sendTestPushNotification(token : String) {
    console.log('got here');
    let expo = new Expo();
      let messages = [];
      if (token == null) {
        return;
      }
      if (Expo.isExpoPushToken(token as string)) {
        console.error(`Push token ${token} is not a valid Expo push token`);
        return;
      }

      messages.push({
        to: token,
        sound: 'default',
        body: `Your schedule has been successfully uploaded.`,
        data: { withSome: 'data' },
      });

      console.log(messages);
      let chunks = expo.chunkPushNotifications(messages);
      let tickets = [];
      (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
          try {
            console.log('sending ' + chunk);
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            // NOTE: If a ticket contains an error code in ticket.details.error, you
            // must handle it appropriately. The error codes are listed in the Expo
            // documentation:
            // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
          } catch (error) {
            console.error(error);
          }
        }
      })();
  }
  public sendPushNotificationtoUser(token: String, event: IEvent) {
    return ( async (token, event) => {
      let expo = new Expo();
      let messages = [];
      if (token == null) {
        return;
      }
      if (Expo.isExpoPushToken(token)) {
        console.error(`Push token ${token} is not a valid Expo push token`);
        return;
      }

      messages.push({
        to: token,
        sound: 'default',
        body: `Your class ${event.summary} happening in 20 mins`,
        data: { withSome: 'data' },
      });

      let chunks = expo.chunkPushNotifications(messages);
      let tickets = [];
      (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
          try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);

            // NOTE: If a ticket contains an error code in ticket.details.error, you
            // must handle it appropriately. The error codes are listed in the Expo
            // documentation:
            // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
          } catch (error) {
            console.error(error);
          }
        }
      })();
    });
  }

  public setupDailyPushNotifications() {
    USER.find({}, (err, users) => {
      if (err) {
        console.log("Error retrieving users from DB");
        return;
      }
      if (!users) {
        console.log("No users retrieved from DB");
      } else {
        users.forEach((user) => {
          SCHEDULE.find({ userId: (user as IUser).userId }, 'events', (err, eventsList) => {
            if (err) {
              console.log("error retrieving user schedules. Cannot send notifications today.");
              return;
            }
            if (eventsList) {
              let today = new Date();
              let eventsHappeningToday = eventsList.filter((event) => ep.isHappeningOnDay(event, today));
              eventsHappeningToday.forEach((event) => {
                let eventTime = new Date((event as IEvent).startTime);
                setTimeout(
                  this.sendPushNotificationtoUser((user as IUser).expoPushToken, event as IEvent),
                  eventTime.getMinutes() - (today.getMinutes() + 1200000)
                  );
              });
            }
          });
        });
      }
    });
  }
}

export default new PushController();

// // Create a new Expo SDK client
// let expo = new Expo();

// // Create the messages that you want to send to clents
// let messages = [];

// for (let pushToken of somePushTokens) {
//   // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

//   // Check that all your push tokens appear to be valid Expo push tokens
//   if (!Expo.isExpoPushToken(pushToken)) {
//     console.error(`Push token ${pushToken} is not a valid Expo push token`);
//     continue;
//   }

//   // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
//   messages.push({
//     to: pushToken,
//     sound: 'default',
//     body: 'This is a test notification',
//     data: { withSome: 'data' },
//   })
// }

// // The Expo push notification service accepts batches of notifications so
// // that you don't need to send 1000 requests to send 1000 notifications. We
// // recommend you batch your notifications to reduce the number of requests
// // and to compress them (notifications with similar content will get
// // compressed).
// let chunks = expo.chunkPushNotifications(messages);
// let tickets = [];
// (async () => {
//   // Send the chunks to the Expo push notification service. There are
//   // different strategies you could use. A simple one is to send one chunk at a
//   // time, which nicely spreads the load out over time:
//   for (let chunk of chunks) {
//     try {
//       let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//       console.log(ticketChunk);
//
//       // NOTE: If a ticket contains an error code in ticket.details.error, you
//       // must handle it appropriately. The error codes are listed in the Expo
//       // documentation:
//       // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
//     } catch (error) {
//       console.error(error);
//     }
//   }
// })();


// // Later, after the Expo push notification service has delivered the
// // notifications to Apple or Google (usually quickly, but allow the the service
// // up to 30 minutes when under load), a "receipt" for each notification is
// // created. The receipts will be available for at least a day; stale receipts
// // are deleted.
// //
// // The ID of each receipt is sent back in the response "ticket" for each
// // notification. In summary, sending a notification produces a ticket, which
// // contains a receipt ID you later use to get the receipt.
// //
// // The receipts may contain error codes to which you must respond. In
// // particular, Apple or Google may block apps that continue to send
// // notifications to devices that have blocked notifications or have uninstalled
// // your app. Expo does not control this policy and sends back the feedback from
// // Apple and Google so you can handle it appropriately.
// let receiptIds = [];
// for (let ticket of tickets) {
//   // NOTE: Not all tickets have IDs; for example, tickets for notifications
//   // that could not be enqueued will have error information and no receipt ID.
//   if (ticket.id) {
//     receiptIds.push(ticket.id);
//   }
// }

// let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
// (async () => {
//   // Like sending notifications, there are different strategies you could use
//   // to retrieve batches of receipts from the Expo service.
//   for (let chunk of receiptIdChunks) {
//     try {
//       let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
//       console.log(receipts);

//       // The receipts specify whether Apple or Google successfully received the
//       // notification and information about an error, if one occurred.
//       for (let receipt of receipts) {
//         if (receipt.status === 'ok') {
//           continue;
//         } else if (receipt.status === 'error') {
//           console.error(`There was an error sending a notification: ${receipt.message}`);
//           if (receipt.details && receipt.details.error) {
//             // The error codes are listed in the Expo documentation:
//             // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
//             // You must handle the errors appropriately.
//             console.error(`The error code is ${receipt.details.error}`);
//           }
//         }
//       }
//     } catch (error) {
//       console.error(error);
//     }
//   }
// })();