import React from "react";
import { WebView } from "react-native-webview";
import { View, Text } from "react-native";

function Profile({ navigation }) {
  const githubUsername = navigation.getParam("github_username");
  return (
    <WebView
      style={{ flex: 1 }}
      source={{ uri: `https://github.com/${githubUsername}` }}
    ></WebView>
  );
}

export default Profile;
