/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { useState, useEffect } from "react";
import { AppRegistry, Button, Platform, TextInput, View } from "react-native";
import Login from "./js/components/Login";
import EventsLog from "./js/components/EventsLog";
import ChatClientHelper from "./js/chat-client-helper";
import Log from "./js/logging";
import FirebaseSupport from "./js/FirebaseSupportModule";
import ApnSupport from "./js/ApnsSupportModule";

const ngrokConfiguration = require('./configuration.json').ngrok;
// const tokenHost = 'https://' + ngrokConfiguration.subdomain + '.ngrok.io';
const tokenHost = 'http://192.168.1.6:3002';
const tokenBasicAuth = ngrokConfiguration.basicAuth;

export default function TwilioChatJsReactNative() {
  const [log, setlog] = useState([])
  const [chatClientHelper, setchatClientHelper] = useState(null)

  function addNewLog(string) {
    let logs = log;
    logs.push(string + "\n");
    console.warn('set log');
    setlog(logs);
  }

  // useEffect(() => {
  //   if(chatClientHelper){
  //     chatClientHelper.getPublicChannelDescriptors().then((response) => {
  //       console.warn('res', response);
  //     })
  //   }
  // }, [chatClientHelper])

  function createChannel() {
    // chatClientHelper.createChannel({
    //   uniqueName: 'general',
    //   friendlyName: 'General Chat Channel',
    // })
  }

  function login(username, host) {
    let log = new Log(addNewLog);
    let chatClientHelper = new ChatClientHelper(host, tokenBasicAuth, log);
    if (Platform.OS === 'ios') {
      chatClientHelper.login(
        username, 'apns', ApnSupport.registerForPushCallback, ApnSupport.showPushCallback);
    } else if (Platform.OS === 'android') {
      chatClientHelper.login(
        username, 'fcm', FirebaseSupport.registerForPushCallback, FirebaseSupport.showPushCallback).then((res) => {
          console.log('---chat client', chatclient);
        }).catch(err => {
          console.warn('err', err);
        });
    }
    setchatClientHelper(chatClientHelper);
  }

  return (
    <View style={{ display: 'flex', flexGrow: 1, borderWidth: 1 }}>
      {
        chatClientHelper ?
          (<>
            <View style={{ flex: 2 }}>
              <EventsLog eventslog={log} />
            </View>
            <View style={{ flex: 1, padding: 15 }}>
              <TextInput placeholder='channel name' />
              <Button title='Create Channel' onPress={createChannel} />
            </View>
            <View style={{ flex: 1, padding: 15 }}>
              <Button title='Log Out' onPress={() => { setchatClientHelper(null) }} />
            </View>
          </>) :
          (<Login host={tokenHost} login={login} />)
      }
    </View>
  );
}

AppRegistry.registerComponent('TwilioChatJsReactNative', () => TwilioChatJsReactNative);

// if you want to send the raw push to the JS library to reparse
// (while app is not running), you can use this react native pattern to call static JS method
// AppRegistry.registerHeadlessTask('FCMParsePush', () => require('./js/FCMParsePush'));
