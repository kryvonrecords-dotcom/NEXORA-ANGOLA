import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging as getFirebaseMessaging, MulticastMessage } from 'firebase-admin/messaging';
import { db } from './db';
import { AppNotification } from '../src/types';

let initialized = false;
function normalizeFcmImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith("/")) return `https://nexora-news.onrender.com${imageUrl}`;
  return `https://nexora-news.onrender.com/${imageUrl}`;
}


function initializeFirebaseAdmin(): boolean {
  if (initialized) return true;

  try {

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountJson) {
      console.warn('FIREBASE_SERVICE_ACCOUNT_JSON não configurado.');
      return false;
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    initializeApp({
      credential: cert(serviceAccount)
    });

    initialized = true;
    console.log('Firebase Admin inicializado com sucesso.');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin:', error);
    return false;
  }
}

export async function sendFcmToAll(
  notification: AppNotification
): Promise<{ total: number; sent: number; failed: number }> {

  if (!initializeFirebaseAdmin()) {
    return {
      total: 0,
      sent: 0,
      failed: 0
    };
  }

  const tokens = db.getFcmTokens();

  if (tokens.length === 0) {
    console.log('Nenhum dispositivo FCM registrado.');
    return {
      total: 0,
      sent: 0,
      failed: 0
    };
  }

  const fcmImageUrl = normalizeFcmImageUrl(notification.imageUrl);
  const message: MulticastMessage = {
    tokens: tokens.map(item => item.token),

    data: {
      title: notification.title || '',
      body: notification.body || '',
      id: notification.id || '',
      newsId: notification.newsId || '',
      newsSlug: notification.newsSlug || '',
      clickUrl:
        notification.clickUrl ||
        (notification.newsSlug
          ? `/noticia/${notification.newsSlug}`
          : '/'),
      imageUrl: fcmImageUrl || '',
      isBreaking: notification.isBreaking ? 'true' : 'false'
    },

    android: {
      priority: notification.isBreaking ? 'high' : 'normal'
    }
  };

  try {
    console.log("FCM PAYLOAD AUTOMÁTICO:", JSON.stringify({
      tokens: message.tokens?.length,
      title: message.data?.title,
      body: message.data?.body,
      data: message.data,
      android: message.android
    }, null, 2));

    const response = await getFirebaseMessaging().sendEachForMulticast(message);

    let failed = 0;

    for (let i = 0; i < response.responses.length; i++) {
      const result = response.responses[i];

      if (!result.success) {
        failed++;

        console.error('FCM token ' + i + ' falhou:', result.error?.code, result.error?.message);
        const errorCode = result.error?.code || '';

        if (
          errorCode === 'messaging/registration-token-not-registered' ||
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/invalid-argument'
        ) {
          db.deleteFcmToken(tokens[i].token);
        }
      }
    }

    console.log(
      `FCM: ${response.successCount} enviados, ${failed} falharam.`
    );

    return {
      total: tokens.length,
      sent: response.successCount,
      failed
    };

  } catch (error) {
    console.error('Erro ao enviar FCM:', error);

    return {
      total: tokens.length,
      sent: 0,
      failed: tokens.length
    };
  }
}
