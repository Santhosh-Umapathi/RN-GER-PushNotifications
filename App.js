import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, View, Button, Platform, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";

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
  //Get iOS permissions for notifications
  const getPermissions = useCallback(async () => {
    const permission = await Notifications.requestPermissionsAsync();
    console.log(`[${Platform.OS}] Permission:`, permission);

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
  const triggerNotificationHandler = async () => {
    Notifications.scheduleNotificationAsync({
      content: { title: "Test Local", body: "Local Notification test" },
      trigger: {
        seconds: 5,
      },
      // identifier:
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
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
      <Button
        title="Trigger Notification"
        onPress={triggerNotificationHandler}
      />
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
});
