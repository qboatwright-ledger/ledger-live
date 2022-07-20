import { useNavigation } from "@react-navigation/native";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { NavigatorName, ScreenName } from "../../const";
import BottomModal, { Props as BottomModalProps } from "../BottomModal";
import BottomModalChoice from "../BottomModalChoice";
import { importImageFromPhoneGallery } from "./imageUtils";

type Props = {
  isOpened?: boolean;
  onClose: BottomModalProps["onClose"];
};

const CustomImageBottomModal: React.FC<Props> = props => {
  const { onClose } = props;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const handleUploadFromPhone = useCallback(async () => {
    const image = await importImageFromPhoneGallery();
    if (image) {
      navigation.navigate(NavigatorName.CustomImage, {
        screen: ScreenName.CustomImageCroppingScreen,
        params: image,
      });
      onClose && onClose();
    } else {
      // TODO:
    }
  }, [navigation, onClose]);

  const handleFromUrl = useCallback(() => {
    navigation.navigate(NavigatorName.CustomImage, {
      screen: ScreenName.CustomImageCroppingScreen,
      params: {
        imageUrl:
          "https://img.phonandroid.com/2022/04/bored-ape-yacht-club.jpg",
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
          "https://img.phonandroid.com/2022/04/bored-ape-yacht-club.jpg",
      },
    });
    onClose && onClose();
  }, [navigation, onClose]);

  return (
    <BottomModal isOpened={props.isOpened} onClose={props.onClose}>
      {/* TODO: proper styling from design */}
      <BottomModalChoice
        onPress={handleUploadFromPhone}
        title={t("customImage.modal.uploadFromPhone")}
        iconName={"ArrowFromBottom"}
        event="" // TODO: get proper event
      />
      <BottomModalChoice
        onPress={handleFromUrl}
        title={"(debug) from fixed URL"}
        iconName={"ArrowFromBottom"}
        event=""
      />
      <BottomModalChoice
        title="(debug screen) custom"
        onPress={handleDebug}
        iconName="Brackets"
        event=""
      />
      <BottomModalChoice
        title="(debug screen) url"
        onPress={handleDebugUrl}
        iconName="Brackets"
        event=""
      />
    </BottomModal>
  );
};

export default CustomImageBottomModal;
