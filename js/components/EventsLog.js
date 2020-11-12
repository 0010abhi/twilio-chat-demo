import React from "react";

import { ScrollView, StyleSheet, Text } from "react-native";

import Container from "./Container";

export default function EventsLog({ eventslog }) {

  return (
    <ScrollView
      // ref='_scrollView'
      style={styles.scroll}
      // onContentSizeChange={(contentWidth, contentHeight) => {
      //   this.refs._scrollView.scrollToEnd({ animated: true });
      // }}
    >
      <Container>
        <Text>
          {eventslog}
        </Text>
        <Text>
          &nbsp;
          </Text>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: 15
  }
});