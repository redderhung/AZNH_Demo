/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect } from 'react';
import type {Node} from 'react';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  ImageBackground,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  LearnMoreLinks,
  ReloadInstructions,
  HermesBadge,
} from 'react-native/Libraries/NewAppScreen';

import messaging from '@react-native-firebase/messaging';
// -> this lib is better: import PushNotification from 'react-native-push-notification';
import DeviceInfo from 'react-native-device-info';
import Header from './CustomHeader';
import config from './metro.config'

const ConnectionString = config.connectionString;
const HOST = config.apiUrl;
const AZ_HEADER = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
};

const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

var getSelfSignedToken = function(targetUri, sharedKey, ruleId,
  expiresInMins) {
  targetUri = encodeURIComponent(targetUri.toLowerCase()).toLowerCase();
  
  // Set expiration in seconds
  var expireOnDate = new Date();
  expireOnDate.setMinutes(expireOnDate.getMinutes() + expiresInMins);
  var expires = Date.UTC(expireOnDate.getUTCFullYear(), expireOnDate
  .getUTCMonth(), expireOnDate.getUTCDate(), expireOnDate
  .getUTCHours(), expireOnDate.getUTCMinutes(), expireOnDate
  .getUTCSeconds()) / 1000;
  var tosign = targetUri + '\n' + expires;
  
  // using CryptoJS
  var signature = hmacSHA256(tosign, sharedKey);
  var base64signature = signature.toString(Base64);
  var base64UriEncoded = encodeURIComponent(base64signature);
  
  // construct autorization string
  var token = `SharedAccessSignature sr=${targetUri}&sig=${base64UriEncoded}&se=${expires}&skn=${ruleId}`;
  //var token = "SharedAccessSignature sr=" + targetUri + "&sig="
  //+ base64UriEncoded + "&se=" + expires + "&skn=" + ruleId;
  // console.log("signature:" + token);
  return token;
  };

const gen_headers = (uri, extra={}) => {
    const cs = ConnectionString.split(';');
    const sakn = cs[1].replace('SharedAccessKeyName=', '');
    const sak = cs[2].replace('SharedAccessKey=', '');
    const auth = getSelfSignedToken(uri, sak, sakn, 10);
    const header = {...AZ_HEADER, ...extra, Authorization: auth};
    return header;
};

const saveToken = async (token) => {
    const deviceId = DeviceInfo.getUniqueId();
    console.log("device id:", deviceId);
    console.log("fcm token", token);
    const body = JSON.stringify({
        installationId: deviceId,
        userID: "test-device-asus",
        platform: 'gcm',
        pushChannel: token,
        tags: []
    });

    const uri = `${HOST}/installations/${deviceId}?api-version=2015-04`;
    const method = "PUT";
    const headers = gen_headers(uri);
    console.log(method, uri);
    console.log(headers);
    console.log(body);
    const res = await fetch(uri, {method, headers, body});
    console.log(JSON.stringify(res));
}

const delToken = () => {
    const deviceId = DeviceInfo.getUniqueId();
    const method = "DELETE";
    const header = AZ_HEADER;
    const uri = `${HOST}/installations/${deviceId}`;

}

const getNHRegistration = async () => {
    const deviceId = DeviceInfo.getUniqueId();
    console.log("device id:", deviceId);
    const uri = `${HOST}/installations/${deviceId}?api-version=2015-04`;
    const method = "GET";
    const headers = gen_headers(uri);
    console.log(method, uri);
    console.log(headers);
    const res = await fetch(uri, {method, headers});
    console.log(JSON.stringify(res));
    console.log(res.body);
}

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  useEffect(() => {
    messaging()
      .getToken()
      .then(token => {
        return saveToken(token);
        //return getNHRegistration();
      });
    const subscribe = messaging().onMessage(async remoteMessage => {
      //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
    });

    return subscribe;
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="TMPN DEMO">
            WKD 4ever! = w =
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
