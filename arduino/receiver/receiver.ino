#include <LoRa.h>
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

#define SS 15
#define RST 16
#define DIO0 2

const char *firebaseHost = "final-band-o-bast-default-rtdb.firebaseio.com";
const char *firebaseAuth = "AIzaSyDlodufxD85YZO35-RX0qk3teTsMNV7kVE";

void setup() {
  Serial.begin(9600);
  while (!Serial);
  Serial.println("Receiver Host");

  Firebase.begin(firebaseHost, firebaseAuth);

  LoRa.setPins(SS, RST, DIO0);

  if (!LoRa.begin(433E6)) {
    Serial.println("LoRa Error");
    while (1);
  }

  WiFi.begin("Smruti", "12345678"); // Replace with your WiFi SSID and password
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void loop() {
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    // Received a packet
    Serial.println("Received packet!");

    while (LoRa.available()) {
      String gpsData = LoRa.readString();
      Serial.println("GPS Data Received via LoRa: " + gpsData);

      // Send data to Firebase
      sendGPSDataToFirebase(gpsData);
    }
  }
}

void sendGPSDataToFirebase(String data) {
  // Extract Latitude and Longitude from the received data
  int latStart = data.indexOf("Latitude:") + 9;
  int latEnd = data.indexOf(",Longitude:");
  String latitudeStr = data.substring(latStart, latEnd);

  int lonStart = data.indexOf("Longitude:") + 10;
  String longitudeStr = data.substring(lonStart);

  // Convert Latitude and Longitude strings to floats
  float latitude = latitudeStr.toFloat();
  float longitude = longitudeStr.toFloat();

  // Send data to Firebase
  FirebaseData fbdo;
  String deviceId = "100";

  // Update existing values using set method
  Firebase.setFloat(fbdo, "/DeviceDetails/" + deviceId + "/latitude/", latitude);
  Firebase.setFloat(fbdo, "/DeviceDetails/" + deviceId + "/longitude/", longitude);

  Serial.println("Sent GPS data to Firebase - Latitude: " + String(latitude, 6) + ", Longitude: " + String(longitude, 6));
}
