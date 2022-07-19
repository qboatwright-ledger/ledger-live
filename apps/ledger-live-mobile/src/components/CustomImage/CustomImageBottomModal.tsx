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
  const { t } = useTranslation();
  const { onClose } = props;
  const navigation = useNavigation();
  const handleUploadFromPhone = useCallback(async () => {
    const image = await importImageFromPhoneGallery();
    if (image) {
      navigation.navigate(NavigatorName.CustomImage, {
        screen: ScreenName.CustomImageCroppingScreen,
        params: image,
      });
      props.onClose && props.onClose();
    } else {
      // TODO:
    }
  }, [navigation, props.onClose]);

  const handleFromUrl = useCallback(() => {
    navigation.navigate(NavigatorName.CustomImage, {
      screen: ScreenName.CustomImageCroppingScreen,
      params: {
        imageUrl:
          "https://img.phonandroid.com/2022/04/bored-ape-yacht-club.jpg",
      },
    });
    props.onClose && props.onClose();
  }, [navigation, props.onClose]);

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
        event="" // TODO: get proper event
      />
    </BottomModal>
  );
};

export default CustomImageBottomModal;
