#include <LoRa.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <SoftwareSerial.h>
#include <FirebaseESP8266.h>

#define SS 15
#define RST 16
#define DIO0 5

const char *ssid = "realme 7";
const char *password = "11223344";
const char *firebaseHost = "final-band-o-bast.firebaseapp.com";
const char *firebaseAuth = "AIzaSyDlodufxD85YZO35-RX0qk3teTsMNV7kVE";

void sendGPSDataToFirebase(String data);

void setup() {
  Serial.begin(9600);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED){
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to Wi-Fi");
  while (!Serial);
  Serial.println("Receiver Host");

  Firebase.begin(firebaseHost, firebaseAuth);

  LoRa.setPins(SS, RST, DIO0);
  if (!LoRa.begin(433E6)) {
    Serial.println("LoRa Error");
    while (1);
  }
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    // Received a packet
    Serial.println("Received packet!");

    while (LoRa.available()) {
      String gpsData = LoRa.readString();
      // Process and display GPS data as needed
      Serial.println("GPS Data Received via LoRa: " + gpsData);

      // Send GPS data to Firebase
      sendGPSDataToFirebase(gpsData);
    }
    delay(3000);
  }
}

void sendGPSDataToFirebase(String data) {
  FirebaseData fbdo;
  Firebase.pushString(fbdo, "/gpsData", data);

  Serial.println("Sent GPS data to Firebase: " + data);
}
