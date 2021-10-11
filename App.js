import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, View, Button, Platform, Alert } from "react-native";

import * as Notifications from "expo-notifications";

//Foreground - Local Notification trigger
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

export default function App() {
  //Get permissions for notifications
  const getPermissions = useCallback(async () => {
    let permission = await Notifications.getPermissionsAsync();
    console.log(`[${Platform.OS}] Check Permission:`, permission.status);

    if (permission.status !== "granted") {
      permission = await Notifications.requestPermissionsAsync();
      console.log(`[${Platform.OS}] Request Permission:`, permission.status);
    }

    if (permission.status !== "granted") {
      Alert.alert("Permissions required for notifications");
    } else {
      //Only call if permission is granted
      getPushToken();
    }
  }, []);

  //Get Push token from Expo Servers
  const getPushToken = async () => {
    const pushToken = await Notifications.getExpoPushTokenAsync();
    console.log(`[${Platform.OS}] Push Token:`, pushToken.data);
  };

  //Background - Local Notification Trigger
  const sendLocalNotification = async () => {
    Notifications.scheduleNotificationAsync({
      content: { title: "Test Local", body: "Local Notification test" },
      trigger: {
        seconds: 5,
      },
      // identifier:
    });
  };

  const iosToken = "ExponentPushToken[9gn1sBKMJWaWEtyEL_z35S]";
  const androidToken = "ExponentPushToken[7RpDmeDzy5Rma92LE_LLHJ]";

  //This can be managed from the Backend, only get users device token during login/signup
  const sendPushNotification = async () => {
    //Can also send push notifications to other devices
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "Application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: Platform.OS === "ios" ? androidToken : iosToken,
        title: `Push sent from ${Platform.OS}`,
        body: "Push Body",
      }),
    });
  };

  useEffect(() => {
    getPermissions();
  }, [getPermissions]);

  useEffect(() => {
    //When notification arrived on foreground
    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🚀 --- foregroundSubscription --- ", notification);
      });

    //When notification arrived on background and tapped
    const backgroundSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("🚀 --- backgroundSubscription", response);
      });

    return () => {
      foregroundSubscription.remove();
      backgroundSubscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        Local & Push Notifications
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Trigger Local Notification"
          onPress={sendLocalNotification}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Trigger Push Notification"
          onPress={sendPushNotification}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    width: "60%",
    margin: 10,
  },
});
