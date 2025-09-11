import "dotenv/config";

export default {
  expo: {
    name: "SafeKid Nepal",
    slug: "safekid-nepal",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "app.safekid-nepal",
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          "Allow $(PRODUCT_NAME) to access your photos",
        NSCameraUsageDescription: "Allow $(PRODUCT_NAME) to access your camera",
        NSMicrophoneUsageDescription:
          "Allow $(PRODUCT_NAME) to access your microphone",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "app.rork.safekid-nepal",
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION",
      ],
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      ["expo-router"],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you share them with your friends.",
        },
      ],
      "expo-asset",
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
