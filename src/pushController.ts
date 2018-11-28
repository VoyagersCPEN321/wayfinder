import Expo from 'expo-server-sdk';
import * as mongoose from "mongoose";
import { Request, Response } from "express";
import USER, { IUser } from "./models/user";
import SCHEDULE from "./models/schedule";
import { execFile } from 'child_process';
import * as scheduler from 'node-schedule';
import EVENT, { IEvent } from "./models/event";
import * as ep from "../voyageurs/eventProcessor";
var moment = require('moment');



export class PushController {

  public getUserPushToken(req: Request) {
    if (req.body.token) {
      USER.update({
        facebookId: req.user.facebookId,
      },
        {
          $set: { expoPushToken: req.body.token },
        }, (err, res) => {
          if (err) {
            console.log(err);
            return;
          } else {
            console.log(`pushToken ${req.body.token} has been successfully uploaded.`);
          }
        });
      console.log("updated token");
    }
  }

  static setUpTimeOutForEvent = (event, now, token) => {
    // Computes local Vancouver time based on UTC time.
    // TODO: Make this computation location independent

    let startTime = (event as IEvent).startTime;
    let eventTime = new Date(now.getFullYear(), now.getMonth(),
                              now.getDate(), startTime.getHours(),
                                startTime.getMinutes(), startTime.getSeconds());
    console.log(eventTime);
    let timeOut = (eventTime.getTime() - now.getTime() - (1200000));
    console.log(timeOut);
    if (timeOut >= 0) {
      console.log("setting timeOut for Event " + event);
      setTimeout(
        PushController.sendPushNotificationtoUser(token, event as IEvent),
        timeOut);
    }
  }

  setupUserPushNotificationsForToday(user: IUser) {
    try {
      USER.find({ userId: user.userId }, (err, users) => {
        if (err) {
          console.log("Error retrieving users from DB");
          return;
        }
        if (!users) {
          console.log("No users retrieved from DB");
        } else {
          users.forEach((user) => {
            SCHEDULE.findOne({ userId: (user as IUser).userId }, (err, schedule) => {
              if (err) {
                console.log("error retrieving user schedules. Cannot send notifications today.");
                return;
              }
              if (schedule && (schedule as any).events) {
                let eventsList = (schedule as any).events;
                let now = moment().subtract(8, 'hours').toDate();
                let eventsHappeningToday = eventsList.filter((event) => ep.isHappeningOnDay(event, now));
                console.log(eventsHappeningToday);
                eventsHappeningToday.forEach( (event) => PushController.setUpTimeOutForEvent(event, now, (user as IUser).expoPushToken));
              }
            });
          });
        }
      });
    } catch (err) {
      console.log(err);
      return;
    }
  }

  static sendPushNotificationtoUser(token: String, event: IEvent) {
    return (function () {
      let expo = new Expo();
      let messages = [];
      if (token == null) {
        return;
      }
      if (!Expo.isExpoPushToken(token as string)) {
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
    return function () {
      try {
        USER.find({}, (err, users) => {
          if (err) {
            console.log("Error retrieving users from DB");
            return;
          }
          if (!users) {
            console.log("No users retrieved from DB");
          } else {
            users.forEach((user) => {
              console.log((user as IUser).name);
              SCHEDULE.findOne({ userId: (user as IUser).userId }, (err, schedule) => {
                if (err) {
                  console.log("error retrieving user schedules. Cannot send notifications today.");
                  return;
                }
                console.log(schedule);
                if (schedule && (schedule as any).events) {
                  let eventsList = (schedule as any).events;
                  let now = moment().subtract(8, 'hours').toDate();
                  let eventsHappeningToday = eventsList.filter((event) => ep.isHappeningOnDay(event, now));
                  console.log("No. of events happening today: " + eventsHappeningToday.length);
                  eventsHappeningToday.forEach((event) => PushController.setUpTimeOutForEvent(event, now, (user as IUser).expoPushToken));
                }
              });
            });
          }
        });
      } catch (err) {
        this.handleError(err);
        return;
      }
    };
  }
}
export default new PushController();