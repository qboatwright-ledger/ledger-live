import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Flex, InfiniteLoader, Text } from "@ledgerhq/native-ui";
import { NavigatorName, ScreenName } from "../../const";
import BottomModal, { Props as BottomModalProps } from "../BottomModal";
import ModalChoice from "./ModalChoice";
import { importImageFromPhoneGallery } from "./imageUtils";
import { ImageLoadFromGalleryError } from "./errors";

type Props = {
  isOpened?: boolean;
  onClose: BottomModalProps["onClose"];
};

const CustomImageBottomModal: React.FC<Props> = props => {
  const [isLoading, setIsLoading] = useState(false);
  const { onClose } = props;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const handleUploadFromPhone = useCallback(async () => {
    try {
      setIsLoading(true);
      const image = await importImageFromPhoneGallery();
      if (image) {
        navigation.navigate(NavigatorName.CustomImage, {
          screen: ScreenName.CustomImageStep1Crop,
          params: image,
        });
      }
    } catch (error) {
      console.error(error);
      navigation.navigate(NavigatorName.CustomImage, {
        screen: ScreenName.CustomImageErrorScreen,
        params: { error },
      });
    }
    setIsLoading(false);
    onClose && onClose();
  }, [navigation, onClose, setIsLoading]);

  const handleFromUrl = useCallback(() => {
    navigation.navigate(NavigatorName.CustomImage, {
      screen: ScreenName.CustomImageStep1Crop,
      params: {
        imageUrl:
          // "https://img.phonandroid.com/2022/04/bored-ape-yacht-club.jpg",
          // "https://effigis.com/wp-content/uploads/2015/02/Airbus_Pleiades_50cm_8bit_RGB_Yogyakarta.jpg",
          "https://upload.wikimedia.org/wikipedia/commons/9/9d/Pieter_Bruegel_the_Elder_-_The_Fall_of_the_Rebel_Angels_-_Google_Art_Project.jpg",
      },
    });
    onClose && onClose();
  }, [navigation, onClose]);

  const handleDebug = useCallback(() => {
    navigation.navigate(NavigatorName.CustomImage, {
      screen: ScreenName.ImagePicker,
    });
    onClose && onClose();
  }, [navigation, onClose]);

  const handleDebugUrl = useCallback(() => {
    navigation.navigate(NavigatorName.CustomImage, {
      screen: ScreenName.ImagePicker,
      params: {
        imageUrl:
          // "https://img.phonandroid.com/2022/04/bored-ape-yacht-club.jpg",
          "https://effigis.com/wp-content/uploads/2015/02/Airbus_Pleiades_50cm_8bit_RGB_Yogyakarta.jpg",
      },
    });
    onClose && onClose();
  }, [navigation, onClose]);

  return (
    <BottomModal isOpened={props.isOpened} onClose={props.onClose}>
      <Text variant="h4" fontWeight="semiBold" pb={5}>
        {t("customImage.drawer.title")}
      </Text>
      {isLoading ? (
        <Flex m={10}>
          <InfiniteLoader />
        </Flex>
      ) : (
        <>
          <ModalChoice
            onPress={handleUploadFromPhone}
            title={t("customImage.drawer.options.uploadFromPhone")}
            iconName={"ArrowFromBottom"}
            event="" // TODO: get proper event
          />
          <ModalChoice
            onPress={handleFromUrl}
            title={"(debug) from fixed URL"}
            iconName={"ArrowFromBottom"}
            event=""
          />
          {/* <ModalChoice
        title="(debug screen) custom"
        onPress={handleDebug}
        iconName="Brackets"
        event=""
      />
      <ModalChoice
        title="(debug screen) url"
        onPress={handleDebugUrl}
        iconName="Brackets"
        event=""
      /> */}
        </>
      )}
    </BottomModal>
  );
};

export default CustomImageBottomModal;
