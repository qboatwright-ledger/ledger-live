import { Button, Flex, Text } from "@ledgerhq/native-ui";
import React, { useCallback } from "react";
import { ScrollView } from "react-native";
import { FallbackComponentProps } from "./types";

// TODO: get & implement a proper design for this
export default (props: FallbackComponentProps) => {
  const {
    title = "Permissions needed",
    description,
    onRetry,
    ungrantedPermissions,
  } = props;
  return (
    <Flex flexDirection="column" pt={100} px={5}>
      <Flex py={10}>
        <Text pb={5} textAlign="center" variant="h1">
          {title}
        </Text>
        <Text textAlign="center" variant="large">
          {description}
        </Text>
      </Flex>
      <ScrollView>
        {ungrantedPermissions.map(p => (
          <Flex py={4}>
            <Text variant="h5">{p.title}</Text>
            <Text>{p.description}</Text>
            <Text color="neutral.c70">{p.permissionId}</Text>
          </Flex>
        ))}
      </ScrollView>
      <Button type="main" onPress={onRetry}>
        Request permissions
      </Button>
    </Flex>
  );
};
