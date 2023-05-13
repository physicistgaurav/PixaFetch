import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
} from "react-native";

import * as MediaLibrary from "expo-media-library";

function App() {
  const [backgroundImage, setBackgroundImage] = useState(
    "https://media.licdn.com/dms/image/C4E03AQGTl1oRBYjkFg/profile-displayphoto-shrink_800_800/0/1621526112245?e=2147483647&v=beta&t=Nk2LPUbbGiJUlQRJUFHEEbXcrm-9DvEYQl8fjtWY04w"
  );
  const [allImages, setAllImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const pixabayAPIkey = "35965804-90af557b7918af82fe8b792f2";

  let randomImagePage = parseInt(Math.random() * 100);

  let Category = ["computer", "cat", "meme", "hot-girls", "naked"];

  let randomCategory = parseInt(Math.random() * 6);
  console.log(Category[randomCategory]);

  useEffect(() => {
    fetchNewBackgroundImage();
  }, []);

  const fetchNewBackgroundImage = () => {
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

  const saveImage = async (imageUri) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(imageUri);
      await MediaLibrary.createAlbumAsync("MyGallery", asset, false);
      alert("Image saved to gallery!");
    } catch (e) {
      console.log("Error saving image to gallery", e);
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
          onPress={() => saveImage(backgroundImage)}
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
