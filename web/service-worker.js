/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, es6 */

'use strict';


const WEBPUSH_SERVER_URL = 'http://127.0.0.1:5000'
let applicationServerKey = null

const urlB64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const getSubscriptionPublicKey = async () => {
  const response = await fetch(`${WEBPUSH_SERVER_URL}/api/subscribe`, {
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  return response.json();
}

self.addEventListener('activate', async () => {
  try {
    const respPublicKey = await getSubscriptionPublicKey();
    console.log('service worker public_key', respPublicKey);
    applicationServerKey = urlB64ToUint8Array(respPublicKey['public_key']);
  } catch (err) {
    console.log('Error', err)
  }
});

self.addEventListener('push', function(event) {
  if (event.data) {
    const message = JSON.parse(event.data.text());
    const title = message.title;
    const url = message.url;
    const options = {
      icon: 'http://127.0.0.1:8080/images/icon.png',
      badge: 'http://127.0.0.1:8080/images/badge.png',
      body: message.body,
      data: url,
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data));
});

self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[Service Worker]: \'pushsubscriptionchange\' event fired.');
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(newSubscription) {
      // TODO: Send to application server
      console.log('[Service Worker] New subscription: ', newSubscription);
    })
  );
});
