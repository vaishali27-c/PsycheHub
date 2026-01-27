/**
 * Firebase Configuration
 * 
 * INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project or use an existing one
 * 3. Go to Project Settings > Service accounts
 * 4. Generate a new private key
 * 5. Save the JSON file safely
 * 6. Replace the placeholders below with your actual details
 */

const admin = require("firebase-admin");

// Replace this object with the contents of your downloaded service account JSON file
const serviceAccount = {
  "type": "service_account",
  "project_id": "doctors-cc7b6",
  "private_key_id": "31b7d24b931366032a2714df8321e19e5b09cd87",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC5VLl9EmRwaqT+\n+VF2KM8RqO42xd1j/PkibPxcGOqOaT3GdJmrzmGhyxNgGoMGS809glPxpQ5NnjJQ\n9dV/1xAW1ynZsWLaFQXyovk5N3/QGjycYiwjXUmNA3aja+8dbE2r/p25oe1OgeE5\nmXghf24ypaVyU9y90EGQ3ulvcfuFv8WsHbZjNzXFJBZWy8O6sanSwkBjOE0F6KTk\n5bNmcqoAPUFxPofwtw7ja1JDQM8F1zcz1Jik2HtWgZz0EJaNibcw66Q/9n2N2tdk\nJK3UMWEBHnSW1fbTSB9cqaKA3i4nrGhOQYsJgwM41rRtop8DjfNGBg1IvhGtO1Ta\nYTYSXuUBAgMBAAECggEAI1Nu99QlqPfq8176lBc7QRZ+MZqNlJ2Hr3Quti9ZpkOR\nLt7S29i+62QWEV98UhroyCyra4gWrdzVonD5fSC1RGVG6OPS/9a6B4HhF3LovfYC\nT5y25RbHCkX6uzO7pFQcighCcDvZS/mdwKjsKRZtHuJMIvqxPM0RclfLDx8e3mNY\naOElWgv9+50UvCtqs1UbvXnT6dE8wTYk+Ru7naI6lTWNytpd8ii77D/T1J21jGap\n3f78y+ClilVy+4d5qA8FCGNr13b1/M9lbFCjb03rDZfphsn7QcXKyLH7BQBdCbuB\nirN2W/zDYdWxGR6EsztU/DhwrqYEZaFmvYPnuP8uMQKBgQDhOT1TWRDre9JATUdn\nZC2M3jJlUXjYc85ND01bZf7voE60kHsMzUmJ7Fbi4sIiZZeOzD4T6+pp6KXH8V7S\nKmOHYDiET6GtsLZJ4Mva4hgLY9PSrPNnJ24/gPasamcn9oDcHCVMpddosnl625vq\nVOsFUnprExOHdKo9i3afp0+FpwKBgQDSp/Z5RU5fxXH2TwbNUlbiIMuA0y3mykbP\nM5pg06hEl4GhHelq+qHwaTDLwDUEyPwQ5/B3jE6vPzyyUO2AMh2jp4pMOgyQgPo1\nkAKtE1ogV6LaVlg7U6CQdTfDNCbQNhPKXhvk4v3VvNqVKHQaC9amUQv75/uhWCvY\n8w2Qf2llFwKBgQC3Q0s6WdvhsWRYvEkgwSwrVtYtCUlK35h7rbrlZy41L/07AeGO\nfjCbkPr2LUuIj5/uKxVMQogA27Sh6C6e1q0cB9iVGPLXEVaS8N8P4S9tfTJsWBzK\n0BPuinKtwvrjUrpx4FkdcEjCQY+Fv9Kzr5t5Pi6sl94pN24bHDNPH+YeOwKBgQCs\nQThkle2ulq/Hr3tqbcgqBJMj9ot0Szd3u0SjpK/V1uXjL6htGCFPi1ShZ7xy+z5T\nPLX/q7Wzy8wAK/jpeRGPfzKxfk5D45O2NNpbWJW8GK1MSIrBiHKlbZR5hK2wWGf6\ndNXuZkcWfeVnTrsRiViui1t3U40JtCW2s5kF7YnrZQKBgQCz2I9KUc824RcSn/Vm\nENBYWjOH9dS1iekUb7yisUUzwogPYvPfmQcwcW6wNumh6qh93RdG4myQWgBWOnZY\n9/PnaAZEKF0266SCdo3JnkBg72B72YXiw/wnpNOi2pHo4raF+xBx+p8OgXp7exBd\n/80aCK373mvJ9UgMyJIoq+8+rQ==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@doctors-cc7b6.iam.gserviceaccount.com",
  "client_id": "105752664341313507514",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40doctors-cc7b6.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get Firestore database instance
const db = admin.firestore();

// Export Firebase admin and db for use in other files
module.exports = { admin, db }; 