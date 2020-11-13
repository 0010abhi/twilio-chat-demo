/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { useState, useEffect } from "react";
import { AppRegistry, Button, Platform, TextInput, View, Text, ScrollView, TouchableOpacity } from "react-native";
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
  const [channelsAvailable, setchannelsAvailable] = useState([])
  const [channelName, setchannelName] = useState('')
  const [msg, setmsg] = useState('');

  useEffect(() => {
    if (chatClientHelper && chatClientHelper.client) {
      getChannels();
    }
  }, [chatClientHelper])

  function addNewLog(string) {
    let logs = log;
    logs.push(string + "\n");
    console.warn('set log');
    setlog(logs);
  }

  function createChannel() {
    chatClientHelper.client.createChannel({
      uniqueName: channelName,
      friendlyName: channelName,
    }).then(function (response) {
      console.warn(response);
    }).catch(err => { console.warn('Creacte  channel catch', err) });
  }

  function login(username, host) {
    let log = new Log(addNewLog);
    let chatClientHelper = new ChatClientHelper(host, tokenBasicAuth, log);
    if (Platform.OS === 'ios') {
      chatClientHelper.login(
        username, 'apns', ApnSupport.registerForPushCallback, ApnSupport.showPushCallback);
    } else if (Platform.OS === 'android') {
      chatClientHelper.login(
        username, 'fcm', FirebaseSupport.registerForPushCallback, FirebaseSupport.showPushCallback);
    }
    setchatClientHelper(chatClientHelper);
  };

  function getChannels() {
    alert('getChannelsFired')
    // console.warn('user identity', chatClientHelper.client.userInfo.identity)
    chatClientHelper.client.getPublicChannelDescriptors().then(function (paginator) {
      let data = [];
      for (i = 0; i < paginator.items.length; i++) {
        const channel = paginator.items[i];
        data.push(channel);
        console.warn('Channel: ' + channel.friendlyName);
      }
      setchannelsAvailable(data);
    }).catch(err => { console.warn('Catch pub chan', err) });
  };

  function deleteChannel(channel) {
    alert(channel.sid);
    channel.getChannel()
      .then(channel => channel.join())
      .then(channel => {
        channel.sendMessage('Hello Hello From Abhishek').then((res) => {
          console.warn('res', res);
        }).catch(err => console.warn(err));
        
        // var seen = [];
        // console.log('Joined to the channel', JSON.stringify(channel, function (key, val) {
        //   if (val != null && typeof val == "object") {
        //     if (seen.indexOf(val) >= 0) {
        //       return;
        //     }
        //     seen.push(val);
        //   }
        //   return val;
        // }))
      })
      // .then(channel => channel.delete())
      // .then(channel => { console.warn('Delete to the channel', channel.friendlyName) })
      .catch(err => { setmsg(err.message) });
  }

  // <View style={{ flex: 2 }}>
  //             <EventsLog eventslog={log} />
  //           </View>
  return (
    <View style={{ display: 'flex', flex: 1, borderWidth: 2 }}>
      {
        chatClientHelper ?
          (<View style={{ flexGrow: 1 }}>
            <View style={{ flex: 1, }}>
              <Text>Channels</Text>
              <Text>{msg}</Text>
              <ScrollView style={{ flexGrow: 1 }}>
                {
                  channelsAvailable.map(chanel => (
                    <TouchableOpacity style={{ padding: 15, fontSize: 14 }} onPress={() => deleteChannel(chanel)}>
                      <Text>{chanel.friendlyName}</Text>
                      <Text>{chanel.status}</Text>
                      {chanel.status === 'joined' && <Button title='del' />}
                    </TouchableOpacity>
                  ))
                }
              </ScrollView>
            </View>
            <View style={{ display: 'flex', flex: 1, padding: 15 }}>
              <TextInput style={{ borderWidth: 1 }} placeholder='channel name' value={channelName} onChangeText={(data) => setchannelName(data)} />
              <View style={{ marginTop: 12 }}><Button title='Get Channels' onPress={getChannels} /></View>
              <View style={{ marginTop: 12 }}><Button title='Create Channel' onPress={createChannel} /></View>
              <View style={{ marginTop: 12 }}><Button title='Log Out' onPress={() => { setchatClientHelper(null) }} /></View>
            </View>
          </View>) :
          (<Login host={tokenHost} login={login} />)
      }
    </View>
  );
}

AppRegistry.registerComponent('TwilioChatJsReactNative', () => TwilioChatJsReactNative);

// if you want to send the raw push to the JS library to reparse
// (while app is not running), you can use this react native pattern to call static JS method
// AppRegistry.registerHeadlessTask('FCMParsePush', () => require('./js/FCMParsePush'));
