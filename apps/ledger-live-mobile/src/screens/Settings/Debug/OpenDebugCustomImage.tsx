import React, { useCallback, useState } from "react";
import SettingsRow from "../../../components/SettingsRow";
import CustomImageBottomModal from "../../../components/CustomImage/CustomImageBottomModal";

export default function OpenDebugCustomImage() {
  const [modalOpened, setModalOpened] = useState(false);
  const openModal = useCallback(() => setModalOpened(true), [setModalOpened]);
  const closeModal = useCallback(() => setModalOpened(false), [setModalOpened]);

  return (
    <>
      <SettingsRow title="Debug Custom Image" onPress={openModal} />
      <CustomImageBottomModal isOpened={modalOpened} onClose={closeModal} />
    </>
  );
}
