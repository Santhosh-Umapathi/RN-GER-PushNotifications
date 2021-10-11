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
  const getIOSPermissions = useCallback(async () => {
    Platform.OS === "ios" && (await Notifications.requestPermissionsAsync());
  }, []);

  //Background - Local Notification Trigger
  const triggerNotificationHandler = async () => {
    //Get permission status
    const iosPermission =
      Platform.OS === "ios" && (await Notifications.getPermissionsAsync());

    if (Platform.OS === "ios") {
      if (iosPermission.status === "granted") {
        Notifications.scheduleNotificationAsync({
          content: { title: "Test Local", body: "Local Notification test" },
          trigger: {
            seconds: 5,
          },
          // identifier:
        });
      } else {
        Alert.alert("Permissions required for notifications");
      }
    } else {
      //Android Notification
      Notifications.scheduleNotificationAsync({
        content: { title: "Test Local", body: "Local Notification test" },
        trigger: {
          seconds: 10,
        },
        // identifier:
      });
    }
  };

  useEffect(() => {
    getIOSPermissions();
  }, [getIOSPermissions]);

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
