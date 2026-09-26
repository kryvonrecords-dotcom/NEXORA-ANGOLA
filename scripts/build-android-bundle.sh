#!/bin/bash
# ==============================================================================
# Nexora News - Android App Bundle (.aab) Build Script
# Prepares production release bundle for Google Play Store Submission
# ==============================================================================

set -e

echo "🚀 Iniciando preparação para Google Play Store do Nexora News..."

# 1. Build frontend distribution
echo "📦 1. Compilando assets de frontend e bundle otimizado..."
npm run build

# 2. Check Android SDK and Gradle
if command -v gradlew &> /dev/null || [ -f "android/gradlew" ]; then
    echo "🤖 2. Executando compilação do Android App Bundle (.aab)..."
    cd android
    chmod +x gradlew
    ./gradlew bundleRelease --stacktrace
    echo "✅ Sucesso! O arquivo AAB foi gerado em: android/app/build/outputs/bundle/release/app-release.aab"
else
    echo "ℹ️ Dica: Para compilar o .aab localmente na sua máquina ou no Android Studio:"
    echo "   1. Abra a pasta 'android' no Android Studio"
    echo "   2. Vá para: Build > Generate Signed Bundle / APK > Android App Bundle (.aab)"
    echo "   3. Ou no terminal execute: cd android && ./gradlew bundleRelease"
fi

echo "🎉 Preparação concluída com sucesso!"
