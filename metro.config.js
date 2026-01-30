const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Asegurar que los assets se resuelvan correctamente
config.resolver.assetExts.push("svg");

module.exports = config;
