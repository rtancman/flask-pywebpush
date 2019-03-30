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

let isWebPushSupported = false;
let applicationServerPublicKey = null;
let isSubscribed = false;
let swRegistration = null;
const WEBPUSH_SERVER_URL = 'http://127.0.0.1:5000';
const pushButton = document.querySelector('.js-push-btn');

const urlB64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
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
    },
  });

  return response.json();
}

const saveSubscription = async subscription => {
  const response = await fetch(`${WEBPUSH_SERVER_URL}/api/subscribe`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  });

  return response.json();
}

const removeSubscription = async clientUUID => {
  const response = await fetch(`${WEBPUSH_SERVER_URL}/api/unsubscribe`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({client_uuid: clientUUID}),
  });

  return response.json();
}

const updateBtn = () => {
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
}

const updateSubscriptionOnServer = async (subscription) => {
  const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionDetails = document.querySelector('.js-subscription-details');

  if (subscription) {
    if (!localStorage.getItem('clientUUID')) {
      const response = await saveSubscription(subscription);
      console.log('api save subscription clientUUID', response['id']);
      localStorage.setItem('clientUUID', response['id']);
    }
    subscriptionJson.textContent = JSON.stringify(subscription);
    subscriptionDetails.classList.remove('is-invisible');
  } else {
    subscriptionDetails.classList.add('is-invisible');
  }
}

const subscribeUser = async () => {
  try {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    const options = { applicationServerKey, userVisibleOnly: true }
    const subscription = await swRegistration.pushManager.subscribe(options)
    updateSubscriptionOnServer(subscription);
    isSubscribed = true;
    updateBtn();
  } catch (error) {
    console.log('Error', error);
    updateBtn();
  }
}

const unsubscribeUser = async () => {
  try {
    const subscription = await swRegistration.pushManager.getSubscription();

    if (subscription) {
      await removeSubscription(localStorage.getItem('clientUUID'));
      await subscription.unsubscribe();
      updateSubscriptionOnServer(null);
      isSubscribed = false;
      updateBtn();
      localStorage.removeItem('clientUUID');
      console.log('User is unsubscribed.');
    }
  } catch (error) {
    console.log('Error unsubscribing', error);
  }
}

function initializeUI() {
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    updateSubscriptionOnServer(subscription);

    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
    }

    updateBtn();
  });
}

const check = () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('No Service Worker support!')
  }
  if (!('PushManager' in window)) {
    throw new Error('No Push API Support!')
  }
}

const registerServiceWorker = async () => {
  return await navigator.serviceWorker.register('service-worker.js');
}

const requestNotificationPermission = async () => {
  const permission = await window.Notification.requestPermission()
  // value of permission can be 'granted', 'default', 'denied'
  // granted: user has accepted the request
  // default: user has dismissed the notification permission popup by clicking on x
  // denied: user has denied the request.
  if (permission !== 'granted') {
    throw new Error('Permission not granted for Notification')
  }
}

const main = async () => {
  try {
    check();
    isWebPushSupported = true;
  } catch (error) {
    pushButton.textContent = 'Push Not Supported';
  }

  if (isWebPushSupported) {
    const respPublicKey = await getSubscriptionPublicKey();
    applicationServerPublicKey = respPublicKey['public_key'];

    swRegistration = await registerServiceWorker()
    initializeUI();
    // const permission = await requestNotificationPermission()
  }
}

main();