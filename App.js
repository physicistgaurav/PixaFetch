import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";

import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import mime from "mime";

function App() {
  const [backgroundImage, setBackgroundImage] = useState(
    "https://media.licdn.com/dms/image/C4E03AQGTl1oRBYjkFg/profile-displayphoto-shrink_800_800/0/1621526112245?e=2147483647&v=beta&t=Nk2LPUbbGiJUlQRJUFHEEbXcrm-9DvEYQl8fjtWY04w"
  );
  const [allImages, setAllImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const pixabayAPIkey = "35965804-90af557b7918af82fe8b792f2";

  let randomImagePage = parseInt(Math.random() * 100);

  useEffect(() => {
    fetchNewBackgroundImage();
  }, []);

  const fetchNewBackgroundImage = () => {
    let randomCategory = parseInt(Math.random() * 6);

    fetch(
      `https://pixabay.com/api/?key=${pixabayAPIkey}&q=${randomCategory}&orientation=vertical&safesearch=true&per_page=${randomImagePage}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.hits && data.hits.length > 0) {
          let randomImage = parseInt(Math.random() * data.hits.length);
          setBackgroundImage(data.hits[randomImage].largeImageURL);
          setAllImages(data.hits);
          setIsLoading(false);
        } else {
          throw new Error("No images found");
        }
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  const updateBackground = () => {
    let randomImage = parseInt(Math.random() * (allImages.length - 1));
    setBackgroundImage(allImages[randomImage].largeImageURL);
  };

  const downloadFile = async (fileUrl, fileName) => {
    const downloadPath = FileSystem.documentDirectory;

    try {
      const { uri } = await FileSystem.downloadAsync(
        fileUrl,
        downloadPath + fileName
      );
      if (Platform.OS === "android") {
        await saveAndroidFile(uri, fileName?.split(" ")?.join(""));
      } else {
        await Sharing.shareAsync(uri);
      }

      await saveToGallery(uri);
      console.log("Image downloaded and saved successfully");
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const saveAndroidFile = async (fileUri, fileName = "File") => {
    try {
      const permissions = await MediaLibrary.requestPermissionsAsync();
      if (!permissions.granted) {
        console.log("Permission to access media library denied");
        return;
      }

      const downloadDir = FileSystem.documentDirectory + "Download/";

      const fileString = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Extract the file extension separately
      const extensionIndex = fileName.lastIndexOf(".");
      const fileExtension = fileName.slice(extensionIndex + 1);
      const mimeType = mime.getType(fileExtension);
      const base64Data = `data:${mimeType};base64,${fileString}`;

      const asset = await MediaLibrary.createAssetAsync(base64Data);
      await MediaLibrary.createAlbumAsync("Expo", asset, false);
      console.log("Image saved to gallery successfully");
    } catch (error) {
      console.error("Error saving image to gallery:", error);
    }
  };

  const saveToGallery = async (imageUri) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        console.log("Permission to access media library denied");
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(imageUri);
      await MediaLibrary.createAlbumAsync("Expo", asset, false);
      console.log("Image saved to gallery successfully");
    } catch (error) {
      console.log("Error saving image to gallery:", error);
    }
  };

  return (
    <ImageBackground
      source={{ uri: backgroundImage }}
      style={styles.background}
    >
      {isLoading && <Text style={styles.loading}>Loading...</Text>}
      <View style={styles.app}>
        <TouchableOpacity
          style={[styles.btn, { opacity: allImages.length > 0 ? 1 : 0.5 }]}
          onPress={() => allImages.length > 0 && updateBackground()}
          disabled={isLoading || allImages.length === 0}
        >
          <Text style={styles.txt}>New Background</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { opacity: allImages.length > 0 ? 1 : 0.5 }]}
          onPress={() => downloadFile(backgroundImage, "hello.jpg")}
          disabled={isLoading || allImages.length === 0}
        >
          <Text style={styles.txt}>Save Background</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "flex-end",
  },
  app: {
    marginHorizontal: "auto",
    maxWidth: 500,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "center",
  },
  btn: {
    margin: 10,
    backgroundColor: "#2596be",
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  loading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
  },
  txt: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default App;
