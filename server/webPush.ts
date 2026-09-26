import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import { db } from './db';
import { AppNotification } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const VAPID_FILE = path.join(DATA_DIR, 'vapid_keys.json');

interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

function loadOrGenerateVapidKeys(): VapidKeys {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(VAPID_FILE)) {
    try {
      const content = fs.readFileSync(VAPID_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.publicKey && parsed.privateKey) {
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing vapid keys, regenerating:', e);
    }
  }

  // Generate fresh persistent VAPID keys
  const keys = webpush.generateVAPIDKeys();
  try {
    fs.writeFileSync(VAPID_FILE, JSON.stringify(keys, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save vapid keys:', e);
  }
  return keys;
}

const vapidKeys = loadOrGenerateVapidKeys();

try {
  webpush.setVapidDetails(
    'mailto:redacao@nexoranews.ao',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
  console.log('WebPush VAPID details initialized successfully.');
} catch (e) {
  console.error('Failed to initialize WebPush VAPID:', e);
}

export function getVapidPublicKey(): string {
  return vapidKeys.publicKey;
}

export async function sendWebPushToAll(notification: AppNotification): Promise<{ total: number; sent: number; failed: number }> {
  const subscriptions = db.getPushSubscriptions();
  const payloadString = JSON.stringify({
    title: notification.title,
    body: notification.body,
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    imageUrl: notification.imageUrl,
    image: notification.imageUrl,
    tag: notification.id || `nexora-${Date.now()}`,
    isBreaking: notification.isBreaking,
    clickUrl: notification.clickUrl || (notification.newsSlug ? `/noticia/${notification.newsSlug}` : '/'),
    data: {
      clickUrl: notification.clickUrl || (notification.newsSlug ? `/noticia/${notification.newsSlug}` : '/'),
      id: notification.id,
      dateOfArrival: Date.now()
    }
  });

  let sent = 0;
  let failed = 0;

  const promises = subscriptions.map(async (sub) => {
    // Check if subscription has the required standard push keys
    if (!sub.endpoint || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) {
      return;
    }

    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth
      }
    };

    try {
      await webpush.sendNotification(
        pushSubscription,
        payloadString,
        {
          TTL: 60 * 60 * 24, // 24 hours
          urgency: notification.isBreaking ? 'high' : 'normal'
        }
      );
      sent++;
    } catch (err: any) {
      failed++;
      // If endpoint is expired or unsubscribed (404 or 410 Gone), prune from database
      if (err.statusCode === 410 || err.statusCode === 404) {
        db.deletePushSubscription(sub.endpoint);
      }
    }
  });

  await Promise.allSettled(promises);
  return { total: subscriptions.length, sent, failed };
}
